<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div ref="appList" class="group-wrap" @scroll="contenScroll">
    <div v-for="(item, index) in filterAppGroups" :key="index" class="group">
      <div class="group-title">
        <!-- <em class="icon aufontAll h-icon-all-drag move"></em> -->
        <span class="name">{{ item.name }}</span>
        <em
          class="icon aufontAll h-icon-all-edit edit"
          @click="addGroup(item)"
        ></em>
        <em
          v-if="item.code !== 'default'"
          class="icon aufontAll h-icon-all-delete1 del"
          @click="deleteGroup(item)"
        ></em>
      </div>

      <div class="list-wrap">
        <Draggable
          :id="item.code"
          element="div"
          :list="filterApp(item.children)"
          class="list-wrap"
          :options="dragItemOptions"
          @end="onSortEnd"
        >
          <template v-for="(el, key) in filterApp(item.children, item.code)">
            <div
              :id="el.code"
              :key="index + '' + key"
              class="app-item"
              @click="onClickApp(el.code, item)"
            >
              <div class="state">
                <!-- 未启用 -->
                <img
                  v-if="!el.enabled"
                  class="not_enabled"
                  src="~@/assets/images/icon_not_enabled_new.svg"
                />
                <!-- 应用市场 -->
                <img
                  v-if="el.fromAppMarket"
                  class="app_market"
                  src="~@/assets/images/icon_application_market.svg"
                />
              </div>
              <span v-if="el.builtInApp" class="example">示例</span>

              <div class="operation" @click.stop="() => {}">
                <a-popover
                  placement="bottom"
                  overlayClassName="oper-popover"
                  trigger="click"
                  @visibleChange="visibleChange"
                >
                  <template slot="content">
                    <div class="oper-content">
                      <p @click.stop="editApp(el)">修改应用信息</p>
                      <p @click.stop="appSettings(el)">权限设置</p>
                      <p @click.stop="exportApp(el)">导出应用</p>
                      <p @click.stop="popItem(el)">
                        {{ $t('languages.Apps.Delete') }}
                      </p>
                    </div>
                  </template>
                  <em class="icon aufontAll h-icon-all-ellipsis-o"></em>
                </a-popover>
              </div>

              <div class="app-icon">
                <template v-if="el.content">
                  <img
                    :src="'data:image/png;base64,' + el.content"
                    class="content-item-icon"
                  />
                </template>

                <template v-else-if="el.logoUrl">
                  <img
                    v-if="el.logoUrl.indexOf('http') > -1"
                    :src="el.logoUrl"
                    class="content-item-icon"
                  />
                  <img
                    v-else
                    :src="getDownloadUrlNew(el.logoUrl, 'application')"
                    class="content-item-icon"
                  />
                </template>

                <template v-else>
                  <svg class="tabs-app-li-icon icon svgIcon" aria-hidden="true">
                    <use xlink:href="#h-icon-all-application1" />
                  </svg>
                </template>
              </div>
              <p v-html="queryTitleLight(el.displayName)"></p>
            </div>
          </template>
        </Draggable>

        <div
          v-if="isAllowAddApp && (!item.children || item.children.length === 0)"
          class="app-item empty-app"
          @click="addApp(item)"
        >
          <em class="icon aufontAll h-icon-all-plus"></em>
          <p>新建应用</p>
        </div>
      </div>
    </div>

    <div id="back-delete-id" class="back-delete-id">
      <div class="back-delete" @click="goRecycle">
        <a-tooltip placement="top">
          <template slot="title">
            <span>{{ $t('languages.Apps.recycleBin') }}</span>
          </template>
          <img class="cycle-ico" src="~@/assets/images/circle-up.png" alt="" />
        </a-tooltip>
      </div>
    </div>

    <template v-if="filterAppGroups.length === 0 && !isShowLoading">
      <searchEmpty />
    </template>

    <customLoading
      v-if="isShowLoading"
      v-model="isShowLoading"
      position="center"
      tip="努力加载中..."
    />

    <BigDialog
      title="回收站"
      :show="isShowRecycleApp"
      @cancel="RecycleAppCancel"
    >
      <Recycle v-if="isShowRecycleApp" />
    </BigDialog>

    <BigDialog
      title="权限设置"
      :show="isShowAppSettingModal"
      @cancel="isShowAppSettingModal = false"
    >
      <Appsettings v-if="isShowAppSettingModal" :appRoute="appRoute" />
    </BigDialog>

    <!-- <AppSettingModal
      :show="isShowAppSettingModal"
      @cancel="isShowAppSettingModal = false"
    /> -->

    <div v-show="backTop" class="back-top" @click="goBackTop">
      <i class="icon aufontAll h-icon-all-shape"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import AppCenterApi from '@/apis/apps';

const icon = require('@/assets/images/appicon.png');
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import { Download, LanguageTransform } from '@/utils';
import { Popover, Tooltip } from '@h3/antd-vue';
import { namespace } from 'vuex-class';
import Draggable from 'vuedraggable';

import AppsApi from '@/apis/apps';

const AppCenterModule = namespace('Apps/AppCenter');

import DeleteGroup from './delete-group.vue';
import searchEmpty from './search-empty.vue';
import BigDialog from '@/components/apps/modals/bigDialog.vue';
import AppSettingModal from '@/components/apps/modals/appSettingModal.vue';
import Recycle from '../../center/recycle.vue';

import Appsettings from '../../center/appsettings.vue';
import customLoading from './loading.vue';

@Component({
  name: 'appList',
  components: {
    APopover: Popover,
    searchEmpty,
    DeleteGroup,
    Draggable,
    BigDialog,
    Recycle,
    AppSettingModal,
    ATooltip: Tooltip,
    Appsettings,
    customLoading,
  },
})
export default class appList extends Vue {
  @AppCenterModule.Mutation('setAppGroupList') setAppGroupList: any;

  @AppCenterModule.Action('checkIfHasModel') checkIfHasModel: any;

  @AppCenterModule.Action('popAppPackage') popAppPackage: any;

  @AppCenterModule.Mutation('setAppDetail') setAppDetail: any;

  @AppCenterModule.Mutation('setAppList') setAppList: any;

  @AppCenterModule.Action('updateAppSort') updateAppSort: any;

  @Prop({ default: () => {} }) addGroup!: Function;

  @Prop({
    default: '',
  })
  searchKey!: string;

  @Prop({
    default: false,
  })
  isAllowAddApp!: boolean;

  appRoute:string;

  defaultAppIcon: any = icon;

  appGroups: any[] = [];

  isShowLoading: boolean = false;

  backTop: boolean = false;

  dragItemOptions: any = {
    animation: 150,
    sort: true,
    group: {
      name: 'Folder',
    },
  };

  isShowRecycleApp: boolean = false;

  isShowAppSettingModal: boolean = false;

  @Watch('$i18n.locale')
  onLocaleChange() {
    this.fillDisplayName();
    this.setAppGroupList(this.appGroups);
  }

  onSortEnd(evt: any) {
    const ItemId: string = evt.clone.id;
    const sortKey: number = parseInt(evt.newIndex, 10) + 1;
    const appGroupCode: string = evt.to.id;

    const parmars: any = {
      appCode: ItemId,
      appGroupCode,
      sortKey,
    };

    this.updateAppSort(parmars).then(() => {
      this.init();
    });
  }

  /**
   * 高亮
   */
  queryTitleLight(titleInfo: string) {
    if (!titleInfo) {
      return;
    }
    const index = titleInfo.toLowerCase().indexOf(this.searchKey.toLowerCase());
    let strReturn = '';
    strReturn += index ? titleInfo.substr(0, index) : '';
    strReturn += `<span class="highlight">${titleInfo.substr(
      index,
      this.searchKey.length,
    )}</span>`;
    strReturn += titleInfo.substr(index + this.searchKey.length);
    return strReturn;
  }

  // 跳转到应用
  onClickApp(code) {
    this.$emit('onClickApp', code);
  }

  /**
   * 回到顶部
   */
  goBackTop() {
    const appDom = this.$refs.appList as HTMLElement;
    if (!appDom) {
      return;
    }
    appDom.scrollTop = 0;
  }

  /**
   * 内容区域滚动事件
   */
  contenScroll() {
    const appDom = this.$refs.appList as HTMLElement;
    if (!appDom) {
      return;
    }
    if (appDom.scrollTop > 50) {
      this.backTop = true;
    } else {
      this.backTop = false;
    }
  }

  /**
   * 删除应用pre
   */
  popItem(item: Apps.AppCenter.AppInfo) {
    this.hideOperPopover();
    const vm: any = this;
    const params: Apps.AppCenter.AppInfoParams = {
      appCode: item.code,
    };
    this.checkIfHasModel(params).then((res: Common.Data) => {
      /* TODO: 接口响应未定义具体内容，暂时判断res.data是否有值，如果有就认为应用下有模型 */
      if (res.errcode) {
        /* 删除应用 —— 应用下有模型 */
        this.$warning({
          title: (this as any).$t('languages.Apps.DeletePrompt'),
          okText: (this as any).$t('languages.Apps.Ok').toString(),
          cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
          content: (this as any).$t('languages.Apps.AppHasModelCannotBeDelete'),
        });
      } else {
        /* 删除应用 —— 应用下无模型 */
        this.$confirm({
          title: (this as any).$t('languages.Apps.ConfirmDelete', {
            name: item.displayName,
          }), // `确定要删除“${item.name}”吗？`
          content: (this as any).$t('languages.Apps.ConfirmDeleteConfirm'),
          okType: 'danger',
          okText: (this as any).$t('languages.Apps.Delete').toString(),
          cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
          onOk() {
            vm.deleteApp(params);
          },
        });
      }
    });
  }

  // 删除应用
  async deleteApp(params) {
    const res = await AppCenterApi.deleteAppPackage(params);
    if (res.errcode === 0) {
      this.getAppgroup();
    }
  }

  // 筛选后的分组
  get filterAppGroups() {
    if (this.searchKey) {
      return this.appGroups.filter((el) => {
        return el.children.some(
          (item) =>
            item.displayName
              .toLowerCase()
              .indexOf(this.searchKey.toLowerCase()) > -1,
        );
      });
    }
    return this.appGroups;
  }

  countObj: object = {};

  @Watch('appGroups')
  onAppGroupsChange() {
    this.countObj = {};
  }

  //搜索过后的app
  filterApp(apps: any[], code?: string) {
    let res: any[] = apps;

    if (this.searchKey) {
      res = res.filter(
        (item) =>
          item.displayName.toLowerCase().indexOf(this.searchKey.toLowerCase()) >
          -1,
      );
    }

    if (code) {
      // 统计搜索结果数量
      this.countObj[code] = res.length;
      const vals = Object.values(this.countObj);
      this.$emit(
        'searchResultCount',
        vals.length ? vals.reduce((a, b) => a + b) : 0,
      );
    }

    return res;
  }

  @Watch('searchKey')
  onSearchKeyChange() {
    this.countObj = {};
    this.$emit('searchResultCount', 0);
  }

  // 获取分组数据
  async getAppgroup() {
    this.isShowLoading = true;
    const res = await AppCenterApi.getAppgroupV1({});
    if (res.errcode === 0 && Array.isArray(res.data)) {
      this.appGroups = res.data.filter((el) => el.code !== 'all');
      const allAppList: any = res.data.filter((el) => el.code === 'all');
      this.fillDisplayName();
      this.setAppGroupList(this.appGroups);
      if (allAppList.length > 0 && Array.isArray(allAppList[0].children)) {
        this.setAppList(allAppList[0].children);
        // window.localStorage.setItem(
        //   'builtAppList',
        //   JSON.stringify(allAppList[0].children),
        // );
      }
    }
    this.isShowLoading = false;
  }

  //分组名称，应用名称中英文最终显示的名称
  fillDisplayName() {
    this.appGroups.forEach((item: any) => {
      item.displayName = this.getName(item);
      if (item.children && item.children.length) {
        item.children.forEach((child: any) => {
          child.displayName = this.getName(child);
        });
      }
    });
  }

  addApp(group) {
    this.$emit('addAppInGroup', group);
  }

  // 编辑应用
  editApp(el) {
    this.hideOperPopover();
    this.$emit('editApp', el);
  }

  deleteGroupId: any = '';

  // 删除分组
  deleteGroup(item: any) {
    const vm: any = this;
    const h: any = this.$createElement;
    let content = '';
    if (item.children && item.children.length > 0) {
      content = h(DeleteGroup, {
        props: {
          list: vm.appGroups,
          code: item.code,
        },
        on: {
          nativeClickHandler: function (v) {
            vm.deleteGroupId = v;
          },
        },
      });
    } else {
      vm.deleteGroupId = 'all';
    }
    this.$confirm({
      width: '420px',
      title: (this as any)
        .$t('languages.Apps.ConfirmDelete2', { name: item.name })
        .toString(),
      content: content,
      okType: 'primary',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        const params: any = {
          groupCode: item.code,
          newGroupCode: vm.deleteGroupId,
        };
        AppsApi.AppgroupDelete(params)
          .then((res: any) => {
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            // let code: string =
            //   item.code === vm.groupKey ? 'default' : vm.groupKey;
            // const params: any = {
            //   groupCode: code,
            //   fromRecycle: vm.fromRecycle,
            // };

            vm.getAppgroup();
          })
          .catch();
      },
    });
  }

  /**
   * 导出
   * */
  isExportEnd: boolean = true; // 阻止继续导出

  async exportApp(app: Apps.AppCenter.AppInfo) {
    this.hideOperPopover();
    if (!this.isExportEnd) {
      return;
    }
    this.isExportEnd = false;
    const loading: any = this.$message.loading(
      (this as any).$t('languages.Apps.ExportingTips1') as string,
      0,
    );
    const { code } = app;
    const params: any = { appCode: code };
    const res: any = await AppsApi.exportApp(params);
    this.isExportEnd = true;
    if (res.errcode && res.errcode !== 0) {
      this.$message.error(
        (this as any).$t('languages.Apps.ExportError') as string,
      );
    } else {
      const fileStream: any = res;
      const fileType: string = 'application/zip';
      const fileName: string = `${app.name}.zip`;
      Download.downloadByPost(fileStream, fileType, fileName);
    }

    loading();
  }

  hideOperPopover() {
    const oDiv: any = document.querySelectorAll('.oper-popover');
    if (oDiv && oDiv.forEach) {
      oDiv.forEach((div) => (div.style.display = 'none'));
    }
  }

  visibleChange() {
    this.hideOperPopover();
  }

  appSettings(item: Apps.AppCenter.AppInfo) {
    this.hideOperPopover();
    this.setAppDetail(item);

    this.appRoute = item['code'];
    this.isShowAppSettingModal = true;
    // this.$router
    //   .push({
    //     name: 'appsettings',
    //     params: {
    //       appCode: item.code,
    //     },
    //   })
    //   .catch((err: any) => {
    //     err;
    //   });
  }

  init() {
    this.getAppgroup();
  }

  created() {
    this.init();
  }

  // 获取应用图标
  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId, 'application');
  }

  // 跳转回收站
  goRecycle() {
    //回收站改为弹窗展示，去除路由逻辑
    this.isShowRecycleApp = true;
  }

  RecycleAppCancel() {
    this.isShowRecycleApp = false;
  }

  //获取中英文名称
  getName(item) {
    if (this.$i18n.locale && this.$i18n.locale === 'zh') {
      return item.name;
    } else {
      const name_i18n =
        typeof item.name_i18n === 'object'
          ? item.name_i18n
          : (item.name_i18n && JSON.parse(item.name_i18n)) || {};
      return name_i18n[this.$i18n.locale] || item.name;
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';

.group-wrap {
  flex: 1;
  overflow: auto;
  padding-bottom: 24px;
  .group {
    margin-top: 48px;
    &:first-child {
      margin-top: 0;
    }
  }
  .group-title {
    position: relative;
    font-size: 14px;
    color: @nav-font-color;
    font-weight: 600;
    margin: 0 auto;
    height: 21px;
    &:hover {
      em {
        display: inline-block;
      }
    }
    em {
      display: none;
      font-weight: 400;
      cursor: pointer;
      &.move {
        font-size: 14px;
        color: @light-font-color;
        position: absolute;
        left: -13px;
        margin-top: -1px;
        top: 50%;
        transform: translate(-100%, -50%);
        cursor: move;
      }
      &.edit {
        font-size: 12px;
        color: @light-font-color;
        margin-left: 12px;
      }
      &.del {
        font-size: 12px;
        color: @light-font-color;
        margin-left: 10px;
      }
    }
  }

  .list-wrap {
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    min-height: 156px;
    position: relative;

    .app-item {
      position: relative;
      width: 168px;
      height: 140px;
      margin-top: 16px;
      text-align: center;
      background-color: #fff;
      border-radius: 2px;
      margin-left: 8px;
      margin-right: 8px;
      overflow: hidden;

      .example {
        position: absolute;
        width: 32px;
        height: 16px;
        background: rgba(250, 173, 20, 0.2);
        border-radius: 8px 8px 8px 0px;
        font-size: 10px;
        color: #faad14;
        line-height: 16px;
        text-align: center;
        top: 16px;
        right: 30px;
      }

      &.empty-app {
        position: absolute;
        left: 0;
        top: 0;
        border: 1px dashed #d4d5d6;
        background-color: transparent;
        padding-top: 52px;
        em {
          font-size: 16px;
          color: @nav-font-color;
          pointer-events: none;
        }
        p {
          font-size: 14px;
          padding-top: 19px;
          color: @light-font-color;
          pointer-events: none;
        }
      }

      img {
        width: 34px;
        height: 34px;
        border-radius: 4px;
        margin: 0 auto;
      }

      .state {
        position: absolute;
        left: -10px;
        top: -10px;
        img.not_enabled {
          width: 56px;
          height: 56px;
        }
        img.app_market {
          width: 66px;
          height: 66px;
        }
      }
      .app-icon {
        width: 34px;
        height: 34px;
        border-radius: 2px;
        border: 1px solid #eeeeee;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 14px;
        margin-top: 36px;
        margin-bottom: 16px;
        img {
          width: 34px;
          height: 34px;
        }
        svg {
          width: 22px;
          height: 22px;
        }
      }
      p {
        padding: 0 10px 0 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
        color: @nav-font-color;
        line-height: 22px;
        .highlightColor {
          color: @primary-color;
        }
      }

      .operation {
        position: absolute;
        display: none;
        width: 16px;
        height: 16px;
        text-align: center;
        line-height: 16px;
        cursor: pointer;
        right: 8px;
        top: 8px;
        color: @nav-font-color;

        &:hover {
          em {
            color: @primary-color;
          }
        }
      }
      &:hover {
        box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.08);
        cursor: pointer;
        .operation {
          display: block;
        }
      }
    }
  }

  @media screen and (max-width: 1500px) {
    .list-wrap {
      width: 1104px;
    }
    .group-title {
      width: 1088px;
    }
  }
  @media screen and (min-width: 1500px) {
    .list-wrap {
      width: 1472px;
    }
    .group-title {
      width: 1456px;
    }
  }
}

.back-top {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #fff;
  background: rgba(17, 18, 24, 0.25);
  line-height: 40px;
  text-align: center;
  position: fixed;
  right: 48px;
  bottom: 80px;
  &:hover {
    cursor: pointer;
  }
  i {
    font-size: 18px;
    color: #fff;
  }
}
</style>

<style lang="less">
@import '~@/styles/color/colors.less';
.oper-popover {
  width: 116px;
  .ant-popover-arrow {
    display: none;
  }
  .ant-popover-content {
    margin-top: -8px;
  }
  .ant-popover-inner {
    border-radius: 2px;
  }
  .ant-popover-inner-content {
    padding: 4px 0;
  }
  .oper-content {
    p {
      padding: 0 12px;
      height: 32px;
      line-height: 32px;
      cursor: pointer;
      color: @nav-font-color;
      font-size: 14px;
      &:hover {
        color: @primary-color;
        background-color: @item-bg-color;
      }
      &:last-child {
        height: 36px;
        border-top: 1px solid #eee;
        padding-top: 4px;
        margin-top: 4px;
      }
    }
  }
}
.back-delete-id {
  position: fixed;
  right: 48px;
  bottom: 24px;
  img {
    width: 40px;
    &:hover {
      opacity: 0.75;
      cursor: pointer;
    }
  }
}
</style>

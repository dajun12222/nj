<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div v-show="listLoaded" ref="apps" class="apps" @scroll="contenScroll">
    <div class="apps-list-opera">
      <div class="list-title">
        <a-button
          v-if="isAdmin"
          type="primary"
          :disabled="!isAllowAddApp"
          @click="onAddApp"
        >
          {{ $t('languages.Apps.AddApp') }}
        </a-button>

        <a-button
          type="default"
          class="import-app"
          :disabled="!isAllowAddApp"
          @click="importApp"
        >
          {{ $t('languages.Apps.ImportApp') }}
        </a-button>
        <span
          v-if="isSearchResult && searchList.length > 0"
          class="search-size"
          >{{
            $t('languages.Apps.SearchResult', { count: searchList.length })
          }}</span>
        <a-input-search
          v-show="appList && appList.length > 12"
          v-model="searchKey"
          :placeholder="$t('languages.Apps.SearchAppName')"
          class="input-search"
          allowClear
          @search="onSearch"
          @change="onhandleChange"
          @pressEnter="onSearch"
        />
      </div>
      <!-- <content-menu
        ref="designers"
        :catalogues="catalogues"
        :getPopupContainer="getPopupContainer"
        :groupCode="groupCode"
        @getAppGroupList="getAppGroupList"
        @showGroup="showGroup"
        @deleteGroup="deleteGroup"
        @load="load"
        v-h3-drop
      /> -->
    </div>
    <div class="apps-list-content-all">
      <div class="apps-list-nav-wrap">
        <div class="title sidebar__add">
          <span>{{ $t('languages.Apps.AppGroup') }}</span>
          <a-tooltip placement="top" :title="$t('languages.Apps.AddGroup')">
            <i
              class="icon aufontAll h-icon-all-plus-o"
              @click="showGroup({})"
            ></i>
          </a-tooltip>
        </div>
        <div class="apps-list-nav">
          <template v-for="(item, key) of groupListAll">
            <div
              :key="key"
              :class="{ title: true, active: groupKey === item.code }"
              @click="getAppGroupList(item)"
            >
              <span
                :title="
                  isChinese
                    ? item.name
                    : item.name_i18n
                    ? item.name_i18n.en || JSON.parse(item.name_i18n).en
                    : item.name
                "
                >{{
                  isChinese
                    ? item.name
                    : item.name_i18n
                    ? item.name_i18n.en || JSON.parse(item.name_i18n).en
                    : item.name
                }}
                <template v-if="item.code === 'all'">{{
                  '(' + appCount + ')'
                }}</template></span>

              <div style="width: 16px">
                <a-dropdown
                  v-show="groupKey === item.code && item.code !== 'all'"
                  :trigger="['hover']"
                  :overlayClassName="'visibility'"
                  :getPopupContainer="getPopupContainer"
                >
                  <i class="icon aufontAll h-icon-all-more1"></i>
                  <a-menu slot="overlay">
                    <a-menu-item v-if="item.code !== 'default'" key="0">
                      <a href="javascript:;" @click.self="deleteGroup(item)">{{
                        $t('languages.Apps.Delete')
                      }}</a>
                    </a-menu-item>
                    <a-menu-item key="1">
                      <a href="javascript:;" @click.self="showGroup(item)">{{
                        $t('languages.Apps.Rename')
                      }}</a>
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="apps-list" :style="`width: ${wrapWidth}px;`">
        <div v-if="!appList || !appList.length" class="apps-empty">
          <!-- 暂无应用 -->
          <img src="~@/assets/images/nodata.png" alt="empty" />
          <p v-if="loading">{{ $t('languages.Apps.Loading') }}</p>
          <p v-else>
            {{ $t('languages.Apps.AddYourAppNow') }}
          </p>
          <a-button
            v-if="isAdmin"
            type="primary"
            class="add-app"
            :disabled="!isAllowAddApp"
            @click="onAddApp"
          >
            {{ $t('languages.Apps.AddApp') }}
          </a-button>
        </div>
        <div v-show="isSearchResult && searchList.length === 0" class="no-data">
          <img class="user-empty" src="~@/assets/images/search.png" />
          <div>{{ $t('languages.Apps.NoSearchResult') }}</div>
        </div>
        <ul v-if="isSearchResult" class="apps-list-content">
          <li
            v-for="item in searchList"
            :key="item.code"
            class="content-item"
            @click="onClickApp(item.code)"
          >
            <a-tooltip v-if="item.fromAppMarket" placement="top">
              <span slot="title">{{ $t('languages.Apps.AppMarket') }}</span>
              <div class="market-box">
                <i class="icon aufontAll h-icon-all-ic_shopping_cart"></i>
                <img src="~@/assets/images/icon_Application market.svg" />
              </div>
            </a-tooltip>
            <a-popover
              placement="rightTop"
              trigger="click"
              overlayClassName="popover"
              :getPopupContainer="getPopupContainer"
              @visibleChange="onVisibleChange($event, item.code)"
            >
              <template slot="content">
                <p @click.stop="appSettings(item)">
                  {{ $t('languages.Apps.Setting') }}
                </p>
                <!-- <p @click.stop="editItem(item)">
                  {{ $t("languages.Apps.Setting") }}
                </p> -->
                <p @click.stop="popItem(item)">
                  {{ $t('languages.Apps.Delete') }}
                </p>
                <p @click.stop="exportApp(item)">
                  {{ $t('languages.Apps.Export') }}
                </p>
              </template>
              <i
                class="icon aufontAll h-icon-all-setting-o setting"
                :class="{ isshow: showIcon && iconCode === item.code }"
                @click.stop="() => {}"
              ></i>
            </a-popover>
            <img
              v-if="!item.enabled"
              src="~@/assets/images/icon_Not_enabled.svg"
              class="content-item-enabled"
            />
            <!-- <template v-if="item.content">
            <img/>
          </template>-->

            <template v-if="item.content">
              <img
                :src="'data:image/png;base64,' + item.content"
                class="content-item-icon"
              />
            </template>

            <template v-else-if="item.logoUrl">
              <img
                v-if="item.logoUrl.indexOf('http') > -1"
                :src="item.logoUrl"
                class="content-item-icon"
              />
              <img
                v-else
                :src="getDownloadUrlNew(item.logoUrl)"
                class="content-item-icon"
              />
            </template>
            <img v-else :src="defaultAppIcon" class="content-item-icon" />
            <!-- <template v-else>
            <img :src="item.logoUrl || defaultAppIcon" class="content-item-icon"/>
          </template>-->
            <!-- <img :src="item.logoUrl || defaultAppIcon" class="content-item-icon"> -->
            <a-tooltip v-if="showTootip(item.displayName)" placement="top">
              <span slot="title">{{ item.displayName }}</span>
              <p
                v-hight-light="{ keyWords: searchKey, value: item.displayName }"
                class="content-item-name"
              ></p>
            </a-tooltip>
            <p
              v-else
              v-hight-light="{ keyWords: searchKey, value: item.displayName }"
              class="content-item-name"
            ></p>
          </li>
        </ul>
        <Draggable
          v-else
          v-model="computedAppList"
          class="apps-list-content"
          element="ul"
          :options="dragOptions"
          @end="onEnd"
        >
          <!-- 有bug提及动画效果不好，故取消transition-group -->
          <!-- <transition-group type="transition" name="flip-list"> -->
          <li
            :id="item.code"
            v-for="item in computedAppList"
            :key="item.code"
            class="content-item"
            @click="onClickApp(item.code)"
          >
            <a-tooltip v-if="item.fromAppMarket" placement="top">
              <span slot="title">{{ $t('languages.Apps.AppMarket') }}</span>
              <div class="market-box">
                <img src="~@/assets/images/icon_Application market.svg" />
              </div>
            </a-tooltip>
            <a-popover
              placement="rightTop"
              trigger="click"
              overlayClassName="popover"
              :getPopupContainer="getPopupContainer"
              @visibleChange="onVisibleChange($event, item.code)"
            >
              <template slot="content">
                <p @click.stop="appSettings(item)">
                  {{ $t('languages.Apps.Setting') }}
                </p>
                <!-- <p @click.stop="editItem(item)">
                  {{ $t("languages.Apps.Setting") }}
                </p> -->
                <p @click.stop="popItem(item)">
                  {{ $t('languages.Apps.Delete') }}
                </p>
                <p @click.stop="exportApp(item)">
                  {{ $t('languages.Apps.Export') }}
                </p>
              </template>
              <i
                class="icon aufontAll h-icon-all-setting-o setting"
                :class="{ isshow: showIcon && iconCode === item.code }"
                @click.stop="() => {}"
              ></i>
            </a-popover>
            <img
              v-if="!item.enabled"
              src="~@/assets/images/icon_Not_enabled.svg"
              class="content-item-enabled"
            />
            <template v-if="item.content">
              <img
                :src="'data:image/png;base64,' + item.content"
                class="content-item-icon"
              />
            </template>
            <template v-else-if="item.logoUrl">
              <img
                v-if="item.logoUrl.indexOf('http') > -1"
                :src="item.logoUrl"
                class="content-item-icon"
              />
              <img
                v-else
                :src="getDownloadUrlNew(item.logoUrl)"
                class="content-item-icon"
              />
            </template>
            <img v-else :src="defaultAppIcon" class="content-item-icon" />
            <!-- <template v-if="item.content">
            <img :src="'data:image/png;base64,'+item.content" class="content-item-icon"/>
          </template>
          <template v-else>
            <img :src="item.logoUrl || defaultAppIcon" class="content-item-icon"/>
          </template> -->

            <a-tooltip v-if="showTootip(item.displayName)" placement="top">
              <span slot="title">{{ item.displayName }}</span>
              <p class="content-item-name">
                {{ item.displayName }}
              </p>
            </a-tooltip>
            <p v-else class="content-item-name">
              {{ item.displayName }}
            </p>
          </li>
          <!-- </transition-group> -->
        </Draggable>
        <!-- <div v-else>
        <app-list-item
          :computedAppList="computedAppList"
          :getPopupContainer="getPopupContainer"
          :showIcon="showIcon"
          :iconCode="iconCode"
          @editItem="editItem"
          @popItem="popItem"
          @exportApp="exportApp"
          @onVisibleChange="onVisibleChange"
        />
      </div> -->
        <!-- <Draggable
        v-if="false"
        v-model="computedAppList"
        class="apps-list-content"
        element="ul"
        :options="dragOptions"
        @end="onEnd"
      >

      </Draggable> -->
      </div>
    </div>

    <!-- 弹窗 -->
    <AddAppModal
      v-model="showAddModal"
      :catalogues.sync="catalogues"
      :groupInfo="groupInfo"
      @updateList="updateList"
      @submitEvent="onClickApp"
    />
    <AppGroup
      v-model="showAddGroupModal"
      :groupItem="groupItem"
      @submitGroupEvent="updateList"
    />
    <a-drawer
      :title="$t('languages.Apps.AppSetting')"
      :visible="showEditDrawer"
      :closable="true"
      :destroyOnClose="true"
      width="850"
      placement="right"
      wrapClassName="edit-app-drawer"
      @close="closeEditDrawer"
    >
      <EditDrawer @refresh="updateList" />
    </a-drawer>
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

    <div v-show="backTop" class="back-top" @click="goBackTop">
      <i class="icon aufontAll h-icon-all-circle-up"></i>
    </div>

    <!-- 用户指引  -->
    <div>
      <NewUserGuide v-model="isShowGuide" @close="closeGuide" />
    </div>

    <!-- 应用导入 -->
    <ImportApp
      v-model="isShowImportApp"
      :appcode="curAppCode"
      @importSucceed="loadApplist"
    />
    <RecycleApp :show="isShowRecycleApp" @cancel="RecycleAppCancel" />
  </div>
</template>

<script lang="ts">
import {
  Modal,
  Tooltip,
  Dropdown,
  Menu,
  Button,
  Icon,
  Input,
  Popover,
  Drawer,
} from '@h3/antd-vue';
import AppsApi from '@/apis/apps';
import UserGuideApi from '@/apis/system/system-manager.api';
import { getRealLength } from '@/common/utils';
import NewUserGuide from '@/components/apps/guide/new-user-guide.vue';
import AddAppModal from '@/components/apps/modals/addApp.vue';
import AppGroup from '@/components/apps/modals/addGroup.vue';
import ImportApp from '@/components/apps/modals/importApp/index.vue';
import * as UserGuideNS from '@/typings/user-guide';
import { Download, LanguageTransform } from '@/utils';
import h3Intro from '@/utils/introjs/h3-intro';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import { Component, Provide, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import { namespace } from 'vuex-class';
import AppListItem from './app-list.vue';
import ContentMenu from './contentMenu.vue';
import DeleteGroup from './delete-group.vue';
import EditDrawer from './edit-drawer.vue';
import RecycleApp from '../../../components/apps/modals/recycleApp.vue';

const icon = require('@/assets/images/appicon.png');

const AppCenterModule = namespace('Apps/AppCenter');

const UserModule = namespace('System/User');

@Component({
  name: 'AppList',
  components: {
    AddAppModal,
    AppGroup,
    DeleteGroup,
    EditDrawer,
    Draggable,
    NewUserGuide,
    ImportApp,
    AppListItem,
    ContentMenu,
    AModal: Modal,
    ATooltip: Tooltip,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AButton: Button,
    AIcon: Icon,
    AInput: Input,
    AInputSearch: Input.Search,
    APopover: Popover,
    ADrawer: Drawer,
    RecycleApp,
  },
})
export default class AppList extends Vue {
  @UserModule.State('isAdmin') isAdmin!: boolean;

  @UserModule.State('loginedUserInfo') loginedUserInfo!: any;

  @AppCenterModule.State('showEditDrawer') showEditDrawer: any;

  @AppCenterModule.State('appList') appList: any;

  @AppCenterModule.State('loading') loading: any;

  @AppCenterModule.State('appCount') appCount: any;

  @AppCenterModule.State('appGroupList') catalogues: any;

  @AppCenterModule.State('appGroupListAll') groupListAll: Array<any>;

  @AppCenterModule.State('groupKey') groupKey: any;

  @AppCenterModule.Mutation('setAppList') setAppList: any;

  @AppCenterModule.Mutation('setAppGroupList') setAppGroupList: any;

  @AppCenterModule.Mutation('setAppDetail') setAppDetail: any;

  @AppCenterModule.Mutation('setGroupKey') setGroupKey: any;

  @AppCenterModule.Action('getAppList') getAppList: any;

  @AppCenterModule.Action('checkIfHasModel') checkIfHasModel: any;

  @AppCenterModule.Action('popAppPackage') popAppPackage: any;

  @AppCenterModule.Action('updateAppSort') updateAppSort: any;

  @AppCenterModule.Mutation('setShowEditDrawer') setShowEditDrawer: any;

  @Provide()
  getgroupInfo() {
    const code = this.groupKey === 'all' ? 'default' : this.groupKey;
    const groupInfo = this.catalogues.find((item) => {
      return item.code === code;
    });
    return groupInfo;
  }

  @Provide()
  switchGroup(gourpid) {
    const item = this.catalogues.find((item) => {
      return item.id === gourpid;
    });

    this.getAppGroupList(item);
  }

  listLoaded: boolean = true;

  defaultAppIcon: any = icon;

  showAddModal: boolean = false;

  showAddGroupModal: boolean = false;

  fromRecycle: boolean = false;

  afterDrag: boolean = false;

  groupInfo: any = {};

  // 是否有权限添加应用
  isAllowAddApp: boolean = false;

  dragOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    forceFallback: true,
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 100,
  };

  wrapWidth: number = 0;

  searchKey: string = '';

  // 搜索关键字
  searchList: Array<any> = [];

  // 搜索应用列表数组
  isSearchResult: boolean = false;

  // 是否为搜索结果
  showIcon: boolean = false;

  iconCode: string = '';

  groupItem: object = {};

  backTop: boolean = false;

  // 是否展示回到顶部

  // 是否展示编辑应用弹出层
  isShowGuide: boolean = false; // 是否显示新手指引

  // 是否展示导入应用
  isShowImportApp: boolean = false;

  // 当前appCode
  curAppCode: string = '';

  showGuide: boolean = false;

  isShowRecycleApp: boolean = false;

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  get isChinese() {
    return !((this as any).$i18n.locale && (this as any).$i18n.locale === 'en');
  }

  /**
   * 计算值：当前应用列表，附加属性 displayName
   */
  get computedAppList() {
    const lang: string = (this as any).$i18n.locale || 'zh';
    if (!this.appList) {
      return [];
    }
    return this.appList.map((app: Apps.AppCenter.AppInfo) => {
      app.displayName = app.name_i18n
        ? LanguageTransform.getLang(app.name, app.name_i18n)
        : app.name;
      return app;
    });
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId, 'application');
  }

  /**
   * 计算应用列表变化时，更新store
   */
  set computedAppList(val: Array<Apps.AppCenter.AppInfo>) {
    this.setAppList(val);
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  /**
   * 内容区域滚动事件
   */
  contenScroll() {
    const appDom = this.$refs.apps as HTMLElement;
    if (!appDom) {
      return;
    }
    if (appDom.scrollTop > 50) {
      this.backTop = true;
    } else {
      this.backTop = false;
    }
  }

  // 跳转回收站
  goRecycle() {
    // AppsApi.getAppgroupList({groupCode:this.groupCode});
    // this.$router
    //   .push({
    //     name: 'recycle',
    //   })
    //   .catch((err: any) => {
    //     err;
    //   });
    //回收站改为弹窗展示，去除路由逻辑
    this.isShowRecycleApp = true;
  }

  RecycleAppCancel() {
    this.isShowRecycleApp = false;
  }

  /**
   * 回到顶部
   */
  goBackTop() {
    const appDom = this.$refs.apps as HTMLElement;
    if (!appDom) {
      return;
    }
    appDom.scrollTop = 0;
  }

  /**
   * 应用搜索
   */
  onSearch() {
    // console.log('searching...', Date.now());
    this.searchList = [];
    if (this.searchKey) {
      this.computedAppList.forEach((app: any) => {
        if (
          app.displayName
            .toLowerCase()
            .indexOf(this.searchKey.toLowerCase()) !== -1
        ) {
          this.searchList.push(app);
        }
      });
      this.isSearchResult = true;
    } else {
      this.isSearchResult = false;
    }
  }

  onhandleChange(e: any) {
    this.searchKey = e.target.value;
    if (!e.target.value) {
      this.onSearch();
    }
  }

  /**
   * 清空搜索关键字
   */
  clearKeyword() {
    this.searchKey = '';
    this.isSearchResult = false;
  }

  /**
   * 切换显隐
   */
  onVisibleChange(visible: boolean, code: string) {
    this.showIcon = visible;
    this.iconCode = code;
  }

  /**
   * 新建应用
   */
  onAddApp() {
    this.showAddModal = true;
  }

  /**
   * 删除应用
   */
  popItem(item: Apps.AppCenter.AppInfo) {
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
            vm.popAppPackage(params);
            vm.searchList.forEach((app: any, index: number) => {
              if (app.code === item.code) {
                vm.searchList.splice(index, 1);
              }
            });
          },
        });
      }
    });
  }

  /**
   * 编辑应用
   */
  editItem(item: Apps.AppCenter.AppInfo) {
    // this.setAppDetail(item);
    this.$nextTick(() => {
      this.setShowEditDrawer(true);
    });
  }

  appSettings(item: Apps.AppCenter.AppInfo) {
    this.setAppDetail(item);
    this.$router
      .push({
        name: 'appsettings',
        params: {
          appCode: item.code,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  /**
   * 导出
   * */
  isExportEnd: boolean = true; // 阻止继续导出

  async exportApp(app: Apps.AppCenter.AppInfo) {
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

  /**
   * 关闭编辑应用弹出
   */
  closeEditDrawer() {
    this.setAppDetail({
      code: '',
      name: '',
    });
    this.setShowEditDrawer(false);
  }

  /**
   * 结束拖拽
   */
  onEnd(evt: any) {
    // if (evt.newIndex === evt.oldIndex) {
    //   this.afterDrag = true;
    //   return;
    // }
    const appCode = this.appList[evt.newIndex].code;
    const sortKey = parseInt(evt.newIndex, 10) + 1;
    const params = {
      appGroupCode: this.groupKey,
      appCode,
      sortKey,
    };
    this.updateAppSort(params);
  }

  /**
   * 点击应用
   */
  onClickApp(code: string) {
    this.$router
      .push({
        name: 'appitem',
        params: {
          appCode: code,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  /**
   * 重新获取分组列表
   */
  updateList() {
    // this.catalogues = [];
    const params: any = {
      groupCode: this.groupKey,
      fromRecycle: this.fromRecycle,
      isLoad: true,
    };
    this.getAppList(params);
  }

  showGroup(item: any) {
    this.showAddGroupModal = true;
    this.groupItem = item;
  }

  deleteGroupId: any = '';

  // 删除分组
  deleteGroup(item: any) {
    console.log(this.appList, 'applist');
    const vm: any = this;
    const h: any = this.$createElement;
    let content = '';
    if (this.appList && this.appList.length > 0) {
      content = h(DeleteGroup, {
        props: {
          list: vm.catalogues,
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
      width: '500px',
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
            const code: string =
              item.code === vm.groupKey ? 'default' : vm.groupKey;
            const params: any = {
              groupCode: code,
              fromRecycle: vm.fromRecycle,
            };
            vm.setGroupKey(code);

            params.isLoad = true;
            vm.getAppList(params);
          })
          .catch();
      },
    });
  }

  /**
   * 计算应用列表的最大宽度
   */
  calcWidth() {
    const winWidth: number = Math.max(1024, document.body.clientWidth);
    let n: number = 0;
    if (winWidth < 1001) {
      /* eslint-disable-next-line */
      n = Math.floor((winWidth - 160 + 24) / 196);
    } else {
      /* eslint-disable-next-line */
      n = Math.floor((winWidth - 200 + 24) / 196);
    }
    // console.log('可放置多少个应用：', n);
    this.wrapWidth = Math.round(196 * n - 24) + 150;
  }

  /**
   * 应用名称超过20个字节时显示tooltip
   */
  showTootip(name: string) {
    return getRealLength(name) > 20;
  }

  /**
   * 关闭新手指引
   */
  closeGuide() {
    this.isShowGuide = false;
    this.updateUserGuide();
  }

  /**
   * 获取新用户状态
   */
  async getUserGuide() {
    const userId: string = this.loginedUserInfo.id;
    const params: BPM.System.UserGuide = {
      userId,
      pageType: UserGuideNS.PageType.AppManage,
    };
    const res: any = await UserGuideApi.getUserGuide(params);
    if (res.errcode === 0) {
      this.isShowGuide = res.data.display;
    }
  }

  /**
   * 更新新用户状态
   */
  async updateUserGuide() {
    const userId: string = this.loginedUserInfo.id;
    const params: BPM.System.UserGuide = {
      userId,
      pageType: UserGuideNS.PageType.AppManage,
    };
    const res: any = await UserGuideApi.updateUserGuide(params);
  }

  /**
   * 切换语种时更新搜索列表
   */
  @Watch('$i18n.locale')
  onLangChange() {
    if (this.searchKey) {
      this.onSearch();
    }
  }

  async mounted() {
    this.getStart();
  }

  async created() {
    this.load();
  }

  getStart() {
    const stepData = [
      {
        element: '#back-delete-id',
        title: (this as any).$t('languages.Apps.recycleBin').toString(),
        content: (this as any).$t('languages.Apps.recycleTips1').toString(),
        position: 'left',
        tooltipClass: 'h3-intro-bubble h3-intro-bubble-new',
      },
    ];
    (window as any).h3Intro = h3Intro({
      stepData,
    });
    this.showGuide = true;
    const isShowGuide = localStorage.getItem('isNewUserApp');
    if (!isShowGuide) {
      this.$nextTick(() => {
        (window as any).h3Intro.start();
      });
      this.showGuide = true;
      localStorage.setItem('isNewUserApp', 'toDoGuide');
    } else {
      this.showGuide = false;
    }
  }

  async load() {
    // 获取用户新建应用的权限
    const res: any = await UserGuideApi.getSystemManagerAppInfo();
    if (res.errcode === 0) {
      this.isAllowAddApp = res.data;
    }
    // 获取应用列表
    const params: any = {
      groupCode: this.groupKey,
      fromRecycle: this.fromRecycle,
      isLoad: true,
    };
    this.getAppList(params).then(() => {
      this.listLoaded = true;
    });

    document.body.ondrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    this.calcWidth();

    window.onresize = () => {
      this.calcWidth();
    };

    this.getUserGuide();
  }

  importApp() {
    this.isShowImportApp = true;
  }

  loadApplist() {
    // 获取应用列表
    const params: any = {
      groupCode: this.groupKey,
      fromRecycle: this.fromRecycle,
    };
    this.getAppList(params).then(() => {
      this.listLoaded = true;
    });
  }

  getAppGroupList(item: any) {
    this.setGroupKey(item.code);
    const params: any = {
      groupCode: this.groupKey,
      fromRecycle: this.fromRecycle,
    };
    if (item.code !== 'all') {
      this.groupInfo = item;
    } else {
      this.groupInfo = {};
    }
    this.searchKey = '';
    this.isSearchResult = false;
    this.searchList = [];
    this.getAppList(params);
  }
}
</script>

<style lang="less">
@import '~@/utils/introjs/h3-intro.less';
@import '~@/styles/app.less';
@import '~@/styles/color/colors.less';
</style>
<style lang="less" scoped>
/deep/ .popover {
  width: 70px;
}
.market-box {
  position: absolute;
  top: 0;
  left: 0;
}
.content-item-enabled {
  position: absolute;
  top: 0;
  left: 0;
  width: auto;
  height: auto;
}
</style>

<style lang="less">
.apps-list-nav {
  .title:hover {
    .h-icon-all-more1 {
      display: block !important;
    }
  }
}
</style>

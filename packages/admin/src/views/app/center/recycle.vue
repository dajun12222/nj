<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div
    ref="recycle"
    class="recycle"
    :class="isShowToRecycleApp ? 'showItem' : ''"
    @scroll="contenScroll"
  >
    <div v-if="!appList || !appList.length" class="apps-empty">
      <img src="~@/assets/images/no-app-delete.png" alt="empty" />
      <p>{{ isLoading ? '加载中...' : '暂无应用' }}</p>
    </div>
    <div v-else-if="!isShowToRecycleApp">
      <div class="header-recycle">
        <div class="header-left">
          <div class="search-wrapper">
            <a-checkbox
              v-model="checkedAll"
              :indeterminate="!checkedAll && isChecked"
              @change="checkApp($event)"
            >
              全选
            </a-checkbox>
            <div class="selected-count-wrap">
              <span>已选</span>
              <span class="blue-font">{{ ids && ids.length ? ids.length : 0 }}
              </span>
              <span>个</span>
            </div>
          </div>
        </div>
        <div class="header-right flex-justify-between">
          <InputSearch
            v-show="appList && appList.length > 12"
            v-model="searchKey"
            class="input-search"
            :placeholder="$t('languages.Apps.SearchAppName')"
            :allowClear="true"
            @search="onSearch"
          />
          <a-button
            v-show="isChecked"
            type="default"
            @click.stop="recycleDeleteC(deleteParams)"
          >
            删除
          </a-button>
          <a-button
            v-show="isChecked"
            type="default"
            @click.stop="recycleReductionC(ids)"
          >
            还原
          </a-button>
          <a-button type="default" @click.stop="restoreAll">
            全部还原
          </a-button>
          <a-button
            class="ant-btn-large"
            type="primary"
            @click.stop="delectAll"
          >
            清空回收站
          </a-button>
        </div>
      </div>

      <!-- <div class="back-delete-id">
        <div class="back-delete" @click="toBack">
          <a-tooltip placement="top">
            <template slot="title">
              <span>应用管理</span>
            </template>
            <i class="icon aufontAll h-icon-all-appstore"></i>
          </a-tooltip>
        </div>
      </div> -->

      <div v-show="backTop" class="back-top" @click="goBackTop">
        <i class="icon aufontAll h-icon-all-circle-up"></i>
      </div>

      <a-spin class="spinning" :spinning="spinning" />

      <div class="apps-list-content-all">
        <div class="apps-list">
          <template>
            <div v-if="isSearchResult && !searchList.length" class="apps-empty">
              <img src="~@/assets/images/searchNone.png" alt="empty" />
              <p>暂无搜索结果</p>
            </div>
            <div class="apps-list-content">
              <template
                v-for="(item, i) in isSearchResult ? searchList : appList"
              >
                <a-dropdown :key="i" :trigger="['contextmenu']">
                  <div
                    class="content-item"
                    :class="{ checked: item.checked }"
                    @click.stop="to(item)"
                  >
                    <div class="setting" :class="{ isshow: true }">
                      <a-checkbox v-model="item.checked" @click.stop />
                    </div>
                    <!-- <img
                      v-if="!item.enabled"
                      src="~@/assets/images/icon_not_enabled_new.svg"
                      class="content-item-enabled"
                    /> -->
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
                    <template v-else>
                      <div class="content-item-icon">
                        <svg aria-hidden="true">
                          <use xlink:href="#h-icon-all-application1" />
                        </svg>
                      </div>
                    </template>

                    <a-tooltip
                      v-if="showTootip(item.displayName)"
                      placement="top"
                    >
                      <span slot="title">{{ item.displayName }}</span>
                      <p class="content-item-name">
                        {{ item.displayName }}
                      </p>
                    </a-tooltip>
                    <p v-else class="content-item-name">
                      {{ item.displayName }}
                    </p>
                  </div>
                </a-dropdown>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
    <RecycleItem
      v-if="isShowToRecycleApp"
      :appInfo="toRecycleAppInfo"
      @cancle="recycleCancel"
    />
  </div>
</template>
<script lang="ts">
import AppsApi from '@/apis/apps';
import { getRealLength } from '@/common/utils';
import { LanguageTransform } from '@/utils';
import {
  Icon,
  Tooltip,
  Spin,
  Checkbox,
  Input,
  Dropdown,
  Button,
} from '@h3/antd-vue';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import { Component, Vue, Watch } from 'vue-property-decorator';
import RecycleItem from './recycleitem.vue';
import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';
const icon = require('@/assets/images/appicon.svg');
@Component({
  name: 'Recycle',
  components: {
    RecycleItem,
    AButton: Button,
    AIcon: Icon,
    ATooltip: Tooltip,
    ASpin: Spin,
    ACheckbox: Checkbox,
    InputSearch,
    ADropdown: Dropdown,
  },
})
export default class Recycle extends Vue {
  wrapWidth: number = 0;

  groupCode: string = 'all';

  fromRecycle: boolean = true;

  defaultAppIcon: any = icon;

  // 应用List
  appList: Array<any> = [];

  isChecked: boolean = false;

  // 分组List
  appGroupList: any = [];

  checkedAll: boolean = false;

  spinning: boolean = false;

  searchKey: string = '';

  isSearchResult: boolean = false;

  searchList: Array<any> = [];

  isLoading: boolean = false;

  async created() {
    document.body.ondrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    this.calcWidth();

    window.onresize = () => {
      this.calcWidth();
    };
    this.getAppList();
  }

  // 获取应用分组列表接口
  async getAppList() {
    this.spinning = true;
    this.isLoading = true;
    const params: any = {
      groupCode: this.groupCode,
      fromRecycle: this.fromRecycle,
    };
    this.appList = [];
    const res: any = await AppsApi.getAppgroupList(params);
    this.isLoading = false;
    if (res.errcode !== 0) {
      this.spinning = false;
      return this.$message.error(res.errmsg);
    } else {
      this.spinning = false;
      this.appGroupList = res.data.map((d: any) => {
        return {
          id: d.id,
          code: d.code,
          name: d.name,
        };
      });
      const data: any = res.data.find((d: any) => d.code === params.groupCode);
      data.children.forEach((app: any) => {
        app.checked = false;
        app.displayName = app.name_i18n
          ? LanguageTransform.getLang(app.name, app.name_i18n)
          : app.name;
      });
      this.appList = data.children;
    }
    window.setTimeout(() => {
      this.spinning = false;
    }, 1000);
  }

  /**
   * 应用搜索
   */
  onSearch() {
    this.searchList = [];
    if (this.searchKey) {
      this.appList.forEach((app: any) => {
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

  /**
   * 清空搜索关键字
   */
  clearKeyword() {
    this.searchKey = '';
    this.searchList = [];
    this.isSearchResult = false;
    // this.getRecycleList();
  }

  // 点击分组
  getAppGroupList(item: any) {
    this.checkedAll = false;
    this.groupCode = item.code;
    this.searchKey = '';
    this.isSearchResult = false;
    this.searchList = [];
    this.getAppList();
  }

  toRecycleAppInfo: any;

  isShowToRecycleApp: boolean = false;

  // 回收站应用模型
  to(item: any) {
    this.isShowToRecycleApp = true;
    console.log(item, 'toRecycleAppInfo');

    this.toRecycleAppInfo = item;
    /* this.$router
      .push({
        name: 'recycleitem',
        params: {
          appCode: item.code,
        },
        query: {
          name: item.name_i18n
            ? LanguageTransform.getLang(item.name, item.name_i18n)
            : item.name,
        },
      })
      .catch((err: any) => {
        console.log(err);
      }); */
  }

  recycleCancel() {
    this.isShowToRecycleApp = false;
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
      n = Math.floor((winWidth - 0 + 24) / 196);
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
   * 内容区域滚动事件
   */
  backTop: boolean = false;

  contenScroll() {
    const appDom = this.$refs.recycle as HTMLElement;
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
   * 回到顶部
   */
  goBackTop() {
    const appDom = this.$refs.recycle as HTMLElement;
    if (!appDom) {
      return;
    }
    appDom.scrollTop = 0;
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }

  toBack() {
    this.$router
      .push({
        name: 'appcenter',
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  /**
   * 清空回收站
   */
  delectAll() {
    const vm: any = this;
    this.$confirm({
      title: (this as any).$t('languages.Apps.EmptyRecycle').toString(),
      content: (this as any).$t('languages.Apps.EmptyTips1').toString(),
      okType: 'danger',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        // 彻底删除
        const loading: any = vm.$message.loading(
          (vm as any).$t('languages.Apps.EmptyTips2').toString(),
          0,
        );
        AppsApi.physically_deleteAll()
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.appList = [];
          })
          .catch(() => {
            loading();
          });
      },
    });
  }

  /**
   * 全部还原
   */
  restoreAll() {
    const vm: any = this;
    this.$confirm({
      title: (this as any).$t('languages.Apps.RevertAll').toString(),
      content: (this as any).$t('languages.Apps.RevertTips1').toString(),
      okType: 'primary',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        // 彻底删除
        const loading: any = vm.$message.loading(
          (vm as any).$t('languages.Apps.RevertTips2').toString(),
          0,
        );
        AppsApi.restoreAll()
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.appList = [];
          })
          .catch(() => {
            loading();
          });
      },
    });
  }

  /**
   * 还原
   */
  recycleReductionC(params: any) {
    const vm: any = this;
    if (!this.isChecked) {
      return vm.$message.error(
        (this as any).$t('languages.Apps.TickApp').toString(),
      );
    }

    this.$confirm({
      title: (this as any).$t('languages.Apps.Reduction'),
      content: (this as any).$t('languages.Apps.ReductionConter').toString(),
      okType: 'primary',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        // 还原回收站资源
        const loading: any = vm.$message.loading(
          (vm as any).$t('languages.Apps.RevertTips3').toString(),
          0,
        );
        AppsApi.RecycleRestore(params)
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.removeList(params);
          })
          .catch(() => {
            loading();
          });
      },
    });
  }

  /**
   * 还原单个应用
   */
  recycleReductionOne(params: any) {
    const vm: any = this;
    this.$confirm({
      title: (this as any).$t('languages.Apps.Reduction'),
      content: (this as any).$t('languages.Apps.RevertTips4').toString(),
      okType: 'primary',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        // 还原回收站资源
        const loading: any = vm.$message.loading(
          (vm as any).$t('languages.Apps.RevertTips2').toString(),
          0,
        );
        AppsApi.RecycleRestore(params)
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.removeList(params);
          })
          .catch(() => {
            loading();
          });
      },
    });
  }

  /**
   * 彻底删除
   */
  recycleDeleteC(params: any) {
    const vm: any = this;
    if (!this.isChecked) {
      return vm.$message.error(
        (this as any).$t('languages.Apps.TickApp').toString(),
      );
    }

    this.$confirm({
      title: (this as any).$t('languages.Apps.recycleDelete'),
      content: (this as any)
        .$t('languages.Apps.recycleDeleteConter')
        .toString(),
      okType: 'danger',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        // 彻底删除
        const loading: any = vm.$message.loading(
          (vm as any).$t('languages.Apps.EmptyTips3').toString(),
          0,
        );
        AppsApi.RecycleDelete(params)
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.removeList(params.map((v) => v.id));
          })
          .catch(() => {
            loading();
          });
      },
    });
  }

  /**
   * 彻底删除单个应用
   */
  recycleDeleteOne(params: any) {
    const vm: any = this;
    this.$confirm({
      title: (this as any).$t('languages.Apps.recycleDelete'),
      content: (this as any).$t('languages.Apps.EmptyTips4').toString(),
      okType: 'danger',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        // 彻底删除
        const loading: any = vm.$message.loading(
          (vm as any).$t('languages.Apps.EmptyTips2').toString(),
          0,
        );
        AppsApi.RecycleDelete(params)
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.removeList(params.map((v) => v.id));
          })
          .catch(() => {
            loading();
          });
      },
    });
  }

  // 是否有选择数据勾选
  ids: any = [];

  deleteParams: any = [];

  removeList(ids: Array<any>) {
    //筛选过后的数组也应该需要过滤掉已经删除的元素
    if (this.isSearchResult) {
      this.searchList = this.searchList.filter((s: any) => !ids.includes(s.id));
    }
    this.appList = this.appList.filter((s: any) => !ids.includes(s.id));
  }

  @Watch('appList', {
    deep: true,
  })
  valueChange(v: any) {
    if (v && v.length) {
      this.isChecked = v.some((e: any) => {
        return e.checked === true;
      });

      // 是否勾选了应用
      const parentArray: any = v.filter((s: any) => s.checked === true);

      this.ids = parentArray.map((e: any) => e.id);
      this.deleteParams = parentArray.map((e: any) => {
        const { id, code } = e;
        return {
          id,
          code,
          type: '',
        };
      });
      //模糊搜索场景下，全选后，若全部还原或删除则需要将checkedAll置为false
      if (this.isSearchResult) {
        if (!this.searchList.length) {
          this.checkedAll = false;
        } else {
          this.checkedAll = this.searchList.every((e: any) => {
            return e.checked === true;
          });
        }
      } else {
        if (!v.length) {
          this.checkedAll = false;
        } else {
          this.checkedAll = v.every((e: any) => {
            return e.checked === true;
          });
        }
      }
    } else {
      this.ids = [];
      this.deleteParams = [];
      this.isChecked = false;
    }
    console.log(this.ids, this.deleteParams, this.isChecked);
  }

  // 应用全选
  checkApp(e: any) {
    const checked: boolean = e.target.checked;
    //模糊搜索场景下，全选时需要判断searchList里面的选中状态
    if (this.isSearchResult) {
      this.searchList.forEach((res: any) => {
        res.checked = checked;
      });
    } else {
      this.appList.forEach((res: any) => {
        res.checked = checked;
      });
    }
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/app.less';
@import '~@/styles/color/colors.less';
@media screen and (max-width: 1500px) {
  .recycle:not(.showItem) {
    width: 1094px;
  }
}
@media screen and (min-width: 1500px) {
  .recycle:not(.showItem) {
    width: 1462px;
  }
}
.recycle {
  overflow: hidden;
  margin: auto;

  .setting::before {
    content: '';
  }

  .ant-btn-large {
    min-width: 100px !important;
  }

  .apps-list-content-all {
    margin-left: 0;
    margin-top: -34px;
    .apps-list-nav {
      background: #fff;
      height: 100%;
      overflow: auto;
      i {
        cursor: pointer;
      }
      .active {
        background-color: @sub-bg-color;
      }
      .title {
        margin-top: 5px;
        height: 32px;
        line-height: 32px;
        padding: 0 13px 0 16px;
        display: flex;
        justify-content: space-between;
        cursor: default;
        span {
          flex: 1;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
        &:hover {
          background-color: @sub-bg-color;
        }
      }
    }
  }
  .back-top {
    position: fixed;
    right: 24px;
    bottom: 24px;
    cursor: pointer;
    i {
      font-size: 44px;
      color: rgba(17, 18, 24, 0.25);
    }
  }
  .back-delete-id  {
    width: 55px;
    height: 55px;
    padding: 3px;
    border-radius: 4px;
    position: fixed;
    right: 18px;
    bottom: 95px;
    cursor: pointer;
  }
  .back-top,
  .back-delete {
    position: fixed;
    right: 24px;
    bottom: 24px;
    cursor: pointer;
    i {
      font-size: 44px;
      color: rgba(17, 18, 24, 0.25);
    }
  }
  .back-delete {
    width: 44px;
    height: 44px;
    line-height: 44px;
    text-align: center;
    border-radius: 100%;
    background: rgba(17, 18, 24, 0.25);
    bottom: 100px;
    i.h-icon-all-appstore {
      font-size: 25px;
      color: #fff;
    }
  }
}
.apps-empty {
  height: calc(100vh - 186px);
  width: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    width: 402px;
    height: 195px;
    object-fit: contain;
  }
  p {
    margin: 8px 0 16px;
    color: rgba(17, 18, 24, 0.5);
  }
  i {
    margin-right: 9px;
  }
}
.header-recycle {
  min-width: 1024px;
  width: 100%;
  height: 60px;
  /* background: #2e323b; */
  display: flex;
  align-items: center;
  margin-top: 24px;
  /* position: fixed;
  top: 0;
  left: 0; */
  z-index: 1000;
  .header-right {
    padding-right: 8px;
    flex: 1;
    justify-content: flex-end;
    /deep/.ant-btn {
      margin-left: 8px;
    }
    .ant-btn-large {
      min-width: 100px;
    }
    /deep/.ant-input-affix-wrapper {
      width: 260px;
    }
  }
  .header-left {
    display: flex;
    align-items: center;
    color: #fff;

    .search-wrapper {
      display: flex;
      align-items: center;
      /deep/.ant-checkbox-wrapper {
        font-weight: 600;
        color: #111218;
        line-height: 22px;
      }
    }
    .h-icon-all-exclamation-circle {
      cursor: pointer;
    }
    span {
      display: inline-block;
      margin-left: 25px;
    }
  }
}
.apps-list {
  width: 100%;
  text-align: left;
  overflow-y: auto;
  overflow-x: hidden;
  height: unset;
  .recycle-nav {
    width: 100%;
    min-height: 62px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
    margin: 24px 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    .recycle-nav-li {
      cursor: pointer;
      max-width: 84px;
      height: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 20px;
      padding: 5px;
      &:hover,
      &.active {
        color: @primary-color;
      }
    }
  }
  .apps-list-content {
    margin: 30px -8px 0 -8px;
    height: calc(100vh - 186px);
    overflow: auto;
    .content-item {
      position: relative;
      display: inline-block;
      vertical-align: top;
      text-align: center;
      overflow: hidden;
      width: 168px;
      height: 140px;
      margin: 8px;
      padding-top: 36px;
      border-radius: 2px;
      background: #f7f8fa;
      // border:1px solid @primary-color;
      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Chrome/Safari/Opera */
      -khtml-user-select: none; /* Konqueror */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently
  not supported by any browser */
      cursor: pointer;
      .tool-menu {
        display: none;
        position: absolute;
        right: -40px;
        top: 40px;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
        z-index: 1000;
        .tool-menu-item {
          line-height: 32px;
          padding: 0px 16px;
          border-bottom: 1px solid #eee;
          &:hover {
            background-color: @sub-bg-color;
          }

          &:last-of-type {
            border: none;
          }
        }
      }
      &:hover {
        //box-shadow: inset 0 0 0 1px @primary-color, 0px 4px 12px 0px rgba(7, 98, 23, 0.15);
        //
        .setting {
          visibility: visible;
        }
        .tool-menu {
          display: block;
        }
      }
      &-icon {
        display: inline-flex;
        width: 34px;
        height: 34px;
        margin-bottom: 16px;
        border-radius: 2px;
        border: 1px solid #eeeeee;
        background: #fff;
        align-items: center;
        justify-content: center;
        svg {
          width: 22px;
          height: 22px;
        }
      }
      &-enabled {
        position: absolute;
        width: 56px;
        height: 56px;
        top: -10px;
        left: -10px;
      }
      &-name {
        width: 90%;
        margin: auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 400;
        color: #111218;
        line-height: 22px;
        font-size: 14px;
      }
      .setting {
        position: absolute;
        z-index: 9;
        top: 12px;
        right: unset;
        left: 12px;
        font-size: 16px;
        color: rgba(17, 18, 24, 0.5);
        visibility: hidden;
        cursor: pointer;
        &:hover {
          color: @primary-color;
        }
      }
      .isshow {
        visibility: visible !important;
      }
    }
  }
}
.selected-count-wrap {
  display: inline-block;
  padding: 0px 30px 0px 5px;
  .blue-font {
    color: #2970ff;
    margin-left: 4px !important;
  }
  span {
    display: inline !important;
    margin-left: 0 !important;
    height: 17px;
    font-size: 12px;
    font-weight: 400;
    color: #111218;
    line-height: 17px;
  }
}
.spinning {
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  line-height: 100vh;
  z-index: 10001;
}

.content-item-enabled {
  position: absolute;
  top: 0;
  left: 0;
  width: auto;
  height: auto;
}
</style>

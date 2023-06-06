<!--
 * @Descripttion: 应用列表弹窗
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-29 11:35:29
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-01 10:36:48
-->
<template>
  <div
    class="app-containner"
    :class="isAnmation ? 'app-containner-move' : 'app-containner-reset'"
  >
    <div class="app-containner-box">
      <div class="app-containner-left">
        <ul>
          <li
            v-for="(item, index) in appGroupList"
            :key="index"
            :class="current === index ? 'active' : ''"
            :title="item.name.length > 7 ? item.name : ''"
            @click="changeTab(item, index)"
          >
            <span class="app-group">{{ item.name }}</span>
            <span v-if="item.children.length > 0" class="app-number">({{ item.children.length }})
            </span>
          </li>
        </ul>
      </div>

      <div class="app-containner-right">
        <div class="app-containner-right-box">
          <a-tabs
            v-show="!isSearch"
            v-model="isKey"
            class="app-right-tabs"
            defaultActiveKey="1"
            :tabBarGutter="48"
            @change="callback"
          >
            <a-tab-pane
              key="1"
              :tab="$t('languages.common.appMenu.all')"
              style="padding-top: 24px"
            >
              <div v-if="!isShowNoData" class="tabs-app-list">
                <AppLists
                  :appList="appList"
                  :isKey="isKey"
                  @goToDetail="goToDetail"
                  @favoriteOperate="favoriteOperate"
                />
              </div>

              <PageNoData
                v-else
                class="page-containner"
                :isShowNoData="isShowNoData"
                :tipText="$t('languages.common.appMenu.noApplications')"
              />
            </a-tab-pane>

            <a-tab-pane
              key="2"
              :tab="$t('languages.common.appMenu.history')"
              forceRender
              style="padding-top: 24px"
            >
              <div v-if="!isShowNoDataMore" class="tabs-history-list">
                <div
                  v-for="(item2, index3) in historyList"
                  :key="index3"
                  class="tabs-history-li"
                  @click="goToDetail(item2)"
                >
                  <div class="li-top">
                    <i
                      v-if="item2.icon"
                      class="icon aufontAll"
                      :class="item2.icon"
                    ></i>
                    <i v-else class="icon aufontAll h-icon-all-form"></i>
                    <span>{{ item2.name }}</span>
                  </div>

                  <div class="li-bottom">
                    {{ $t('languages.common.appMenu.belongApp') }}：{{
                      getAppName(item2.appCode)
                    }}
                  </div>
                </div>
              </div>

              <PageNoData
                v-else
                class="page-containner"
                :isShowNoData="isShowNoDataMore"
                :tipText="$t('languages.common.appMenu.noApplications')"
              />
            </a-tab-pane>

            <a-tab-pane
              key="3"
              :tab="`${$t('languages.common.appMenu.favorite')}(${
                favoriteList.length
              })`"
              style="padding-top: 24px"
            >
              <div v-if="!isShowNoDataMore" class="tabs-app-list">
                <AppLists
                  :appList="favoriteList"
                  isKey="1"
                  @goToDetail="goToDetail"
                  @favoriteOperate="favoriteOperate"
                />
              </div>

              <PageNoData
                v-else
                class="page-containner"
                :isShowNoData="isShowNoDataMore"
                :tipText="$t('languages.common.appMenu.noFavorite')"
              />
            </a-tab-pane>
          </a-tabs>

          <!-- 全局搜索 -->
          <SearchList
            v-if="isSearch || current !== -1"
            :groupText="groupText"
            :type="current === -1 ? 'all' : 'other'"
            :searchResult="searchResult"
            @back="clearSearch"
            @goToDetail="goToDetail"
            @favoriteOperate="favoriteOperate"
          />
          <InputSearch
            v-model="wd"
            :placeholder="$t('languages.common.searchContent')"
            class="tabs-search"
            :allowClear="true"
            @search="onSearch"
          />
        </div>
        <!-- <div class="app-containner-right-close" @click="close">
        <i class="icon aufontAll h-icon-all-close"></i>
      </div> -->
      </div>
    </div>
    <div class="app-containner-right-close" @click="close">
      <i class="icon aufontAll h-icon-all-close"></i>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop, Inject } from 'vue-property-decorator';
import { Tabs, Input, Tooltip } from '@h3/antd-vue';
import common from '../../../../../common/pc';

import SearchList from './common/search-list.vue';

import AppLists from './common/app-lists.vue';

import { listApi } from '../../../../../api';

import { utils } from '../../../../../common';

import { namespace } from 'vuex-class';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

import getDownloadUrlNew from '../../../../../common/src/utils/getDownloadUrlNew';

import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

@Component({
  name: 'app-list',
  components: {
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    InputSearch,
    PageNoData: common.components.PageNoData,
    ATooltip: Tooltip,
    SearchList,
    AppLists,
  },
})
export default class AppList extends Vue {
  @WorkflowCenterModule.Mutation('setAppPath') setAppPath: any;

  @Prop({ default: () => [] })
  appGroupList?: [];

  @Prop({ default: () => [] })
  appList?: [];

  @Prop()
  isMove?: boolean;

  isAnmation: boolean = false;

  timer: any = null;

  @Watch('isMove', {
    immediate: true,
  })
  getMoveShow(val) {
    if (val) {
      this.timer = setTimeout(() => {
        this.isAnmation = true;
      }, 250);
    } else {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.isAnmation = false;
    }
  }

  @Watch('isAnmation', {
    immediate: true,
  })
  initData(val) {
    if (!val) {
      //初始化
      this.current = -1;
      this.isShowNoDataMore = false;
      this.wd = '';
      this.isSearch = false;
    }
  }

  current: number = -1;

  isShowNoDataMore: boolean = false;

  tabList: any[] = [
    {
      title: '默认分组',
      num: 6,
    },
    {
      title: '行政管理',
      num: 4,
    },
    {
      title: '人事管理工具',
      num: 12,
    },
  ];

  isSearch: boolean = false;

  wd: string = ''; //搜索关键字

  isKey: string = '1';

  groupText: string = '';

  get isShowNoData() {
    return (this as any).appList.length < 1 || false;
  }

  @Inject()
  apiHost: any;

  @Inject()
  token: any;

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  mounted() {
    this.getFavoriteList();
  }

  goToDetail(item) {
    this.setAppPath('');
    this.$emit('goToDetail', item);
    this.isAnmation = false;
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  getAppName(code: string) {
    const appItem: any =
      (this as any).appList &&
      (this as any).appList.filter((item: any) => {
        return item.code === code;
      });
    console.log(appItem);
    return appItem.length > 0
      ? !(this.$i18n.locale && this.$i18n.locale === 'en')
        ? appItem[0].name
        : appItem[0].name_i18n.en || JSON.parse(appItem[0].name_i18n).en
      : '';
  }

  iconChange(item, flag) {
    this.$set(item, 'active', flag);
  }

  /**
   * 收藏展开
   */
  isShow(item) {
    this.$set(item, 'isShow', true);
  }

  /**
   * 收藏隐藏
   */
  hideShow(item) {
    this.$set(item, 'isShow', false);
  }

  /**
   * 清空搜索
   */
  clearSearch() {
    this.wd = '';
    this.current = -1;
    this.isSearch = false;
  }

  /**
   * 搜索
   */
  searchResult: any[] = [];

  onSearch() {
    this.searchResult = this.getSearchResult();
    this.isSearch = true;
    if (this.current !== -1) {
      //分组查询
      // const data = this.searchResult.map((item) => {
      //   return item.children;
      // });
      // this.searchResult = data[0];
    }
    if (!this.wd) {
      if (this.current === -1) {
        this.isSearch = false;
      } else {
        //分组
        this.changeTab(
          (this as any).appGroupList[this.current],
          this.current,
          true,
        );
      }
    }
  }

  /**
   * 前端搜索处理
   */
  getSearchResult() {
    let data: any[] = [];
    if (this.current === -1) {
      data = JSON.parse(JSON.stringify(this.appGroupList));
      return data.filter((item) => {
        (item as any).searchName = this.queryTitleLight((item as any).name);
        (item as any).children = (item as any).children.filter((el) => {
          const name = this.isChinese
            ? el.name
            : (JSON.parse(el.name_i18n) && JSON.parse(el.name_i18n).en) ||
              el.name;
          if (name.indexOf(this.wd) > -1) {
            el.searchName = this.queryTitleLight(name);
          }
          return name.indexOf(this.wd) > -1;
        });
        return item.children.length > 0;
      });
    } else {
      data = JSON.parse(JSON.stringify(this.searchResult));
      return data.filter((item) => {
        (item as any).searchName = this.queryTitleLight((item as any).name);
        return item.name.includes(this.wd);
      });
    }
  }

  /**
   * 收藏操作
   */
  async favoriteOperate(data) {
    if (data.flag) {
      //添加收藏
      this.getFavoriteList();
    } else {
      //取消收藏
      this.favoriteList.splice(
        this.favoriteList.findIndex((item) => item.id === data.el.id),
        1,
      );
      if (this.favoriteList.length < 1) {
        this.isShowNoDataMore = true;
      }
    }
    this.callback('1');

    utils.Bus.$emit('favoriteOperateOver');
  }

  /**
   * 最近使用
   */
  historyList: any[] = [];

  async getHistoryList() {
    const res = await listApi.listRecentBizModel();
    if (res.errcode === 0) {
      this.historyList = res.data || [];
      this.isShowNoDataMore = this.historyList.length < 1 || false;
    }
  }

  /**
   * 收藏列表
   */
  favoriteList: any[] = [];

  async getFavoriteList() {
    const res = await listApi.listFavorite({ isMobile: false });
    if (res.errcode === 0) {
      this.favoriteList = res.data || [];
      this.isShowNoDataMore = this.favoriteList.length < 1 || false;
    }
  }

  callback(key) {
    this.isShowNoDataMore = false;
    switch (key) {
      case '1':
        this.$emit('change', false);
        break;
      case '2':
        this.getHistoryList();
        break;
      case '3':
        this.getFavoriteList();
        break;
      default:
        break;
    }
  }

  close() {
    this.isAnmation = false;
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.$emit('close', false);
    this.clearSearch();
    // this.isAnmation = false;
  }

  /**
   * 左侧栏切换
   */

  changeTab(item, index, flag = false) {
    if (this.current === index && !flag) {
      this.current = -1;
      this.searchResult = [];
      this.isSearch = false;
      return;
    }

    this.current = index;
    this.groupText = item.name;
    this.searchResult = item.children;
    this.isSearch = true;
  }

  /**
   * 高亮
   */
  queryTitleLight(titleInfo) {
    if (!titleInfo) {
      return;
    }
    const strReturn = titleInfo.replace(
      new RegExp(this.wd, 'g'),
      `<span class="highlights">${this.wd}</span>`,
    );
    return strReturn;
  }

  /**
   * 自定义应用图片
   */
  getDownloadUrl(refId: string) {
    let url = `${
      this.apiHost
    }/api/aliyun/download?refId=${getDownloadUrlNew.getRefId(refId)}`;
    if (this.token) {
      url += '&T=' + this.token;
    }
    return url;
  }
}
</script>
<style lang="less" scoped>
@import './../style/custom-themes';

.app-containner {
  width: 100vw;
  background-color: #fff;
  height: 0;
  transition: transform 0.2s ease-in-out 0s, opacity 0.2s ease-in-out 0s;
  transform: translate(0, -100%);
  &-move {
    opacity: 1;
    height: calc(100vh - 164px);
    transform: translate(0, 0);
    visibility: inherit;
    z-index: 100;
  }
  &-reset {
    opacity: 0;
    transform: translate(0, -100%);
    height: 0;
    visibility: hidden;
  }
  .app-containner-box {
    max-width: 1200px;
    min-width: 1024px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: -9999px;
      top: 0;
      width: 9999px;
      height: 100%;
      background-color: #f7f7f9;
    }
  }

  .app-containner-left {
    width: 200px;
    height: 100%;
    background-color: #f7f7f9;
    padding: 36px 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    overflow-y: scroll;
    position: relative;

    ul {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      width: 100%;
      padding-right: 24px;
    }
    li {
      width: 100%;
      height: 32px;
      min-height: 32px;
      line-height: 32px;
      padding-left: 24px;
      padding-right: 24px;
      // white-space: nowrap;
      // text-overflow: ellipsis;
      // overflow: hidden;
      font-weight: 400;
      color: #111218;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      border-radius: 4px;
      margin-bottom: 8px;
      > span {
        display: inline-block;
      }
      > span.app-group {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      > span.app-number {
        color: rgba(17, 18, 24, 0.5);
      }
      &:hover {
        background-color: rgba(0, 30, 116, 0.06);
      }
      &.active {
        background-color: @primaryColor;
        color: #fff;
        > span {
          color: #fff;
        }
      }
    }
  }
  .app-containner-right {
    flex: 1;
    position: relative;
    padding: 24px 48px 0 48px;
    max-width: 1000px;
  }

  .app-containner-right-close {
    position: absolute;
    right: 24px;
    top: 19px;
    cursor: pointer;
    > i {
      color: rgba(17, 18, 24, 0.5);
      font-weight: 700;
      width: auto;
      font-size: 20px;
      height: auto;
      &:hover {
        color: @highlightColor;
      }
    }
  }

  .app-containner-right-box {
    position: relative;
    height: 100%;
    width: 100%;
    /deep/ .app-right-tabs {
      height: 100%;
      .ant-tabs-content {
        height: 100%;
      }
    }
  }

  .app-right-tabs {
    /deep/ .ant-tabs-nav {
      .ant-tabs-tab {
        padding: 8px 0 12px 0;
        font-weight: 400;
        font-size: 14px;
        color: #111218;
        &.ant-tabs-tab-active {
          font-weight: 700;
          color: @highlightColor;
        }
        &:hover {
          color: @highlightColor;
        }
      }
    }
  }

  /deep/ .ant-tabs-ink-bar {
    height: 0;
    position: relative;
    &::after {
      content: '';
      width: 24px;
      height: 3px;
      background: @highlightColor;
      border-radius: 2px;
      position: absolute;
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  /deep/ .ant-tabs-bar {
    padding-bottom: 16px;
    margin-bottom: 0;
    border-bottom: 1px solid #eee;
  }

  .tabs-app-list {
    padding-left: 25px;
    padding-right: 15px;
    height: calc(100% - 64px);
    overflow-y: auto;
    .tabs-app-li {
      width: 122px;
      height: 98px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 12px 28px;
      cursor: pointer;
      justify-content: center;
      border-radius: 2px;
      position: relative;
      float: left;
      &:hover {
        background-color: rgba(0, 30, 116, 0.06);
      }
      > .li-box {
        width: 34px;
        height: 34px;
        border-radius: 2px;
        border: 1px solid #eeeeee;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
        img {
          width: 100%;
          height: 100%;
          border-radius: 2px;
        }
        .tabs-app-li-icon {
          width: 22px;
          height: 22px;
        }
      }
      > span {
        margin-top: 14px;
        padding-left: 12px;
        padding-right: 12px;
        text-align: center;
        color: #111218;
        font-size: 14px;
        font-weight: 400;
        display: block;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tabs-app-collect {
        position: absolute;
        right: 7px;
        top: 3px;
        font-size: 13px;
        color: rgba(17, 18, 24, 0.5);
        i {
          color: rgba(17, 18, 24, 0.5);
          &.h-icon-all-star-fill {
            color: #faad14;
            &.hover {
              color: rgba(17, 18, 24, 0.5);
            }
          }
        }
      }
    }
  }
  .tabs-search {
    position: absolute;
    top: 0;
    right: 0;
    width: 250px;
    height: 32px;
  }

  .tabs-history-list {
    display: flex;
    flex-wrap: wrap;
    // margin-top: 24px;
    .tabs-history-li {
      width: calc(25% - 14px);
      margin-right: 16px;
      margin-bottom: 16px;
      padding: 4px 10px;
      cursor: pointer;
      &:hover {
        background: rgba(0, 30, 116, 0.06);
        border-radius: 2px;
      }
      .li-top {
        width: 100%;
        display: flex;
        align-items: center;
        padding-right: 10px;
        i {
          color: @highlightColor;
          font-size: 16px;
          margin-right: 10px;
        }
        > span {
          font-size: 14px;
          font-weight: 400;
          color: #111218;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .li-bottom {
        margin-top: 4px;
        font-size: 12px;
        color: rgba(17, 18, 24, 0.5);
        font-weight: 400;
        line-height: 20px;
        width: 85%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .tabs-history-li:nth-of-type(4n) {
      margin-right: 0;
    }
  }
}
.page-no-data {
  display: flex;
  justify-content: center;
  margin-top: 200px;
}

/**
  svg图标
*/
.svgIcon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

/**
    滚动条内槽  
  */

.app-containner-right-box::-webkit-scrollbar-thumb {
  width: 6px;
  background-color: rgba(17, 18, 24, 0.25);
  border-radius: 3px;
}
/**
   滚动条外层轨道
  */
.app-containner-right-box::-webkit-scrollbar-track {
  background-color: transparent;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 47%;
  z-index: 999;
  transform: translate(-50%, -50%);
}
</style>

<style>
.tabs-search .ant-input-suffix {
  color: rgba(17, 18, 24, 0.25);
}
</style>

<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-19 15:24:44
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-28 16:53:09
-->
<template>
  <div id="startWorkflow" class="start-workflow-wrap">
    <div class="start-workflow-top">
      <h3>{{ $t('cloudpivot.flowCenter.pc.startFlow') }}</h3>
      <div class="right">
        <a-select
          ref="groupSelect"
          v-model="workflowType"
          :showSearch="false"
          class="start-workflow-top-select"
          @change="valueChange"
        >
          <a-select-option :value="'all'">
            {{ $t('cloudpivot.application.pc.allApplications') }}
          </a-select-option>
          <a-select-option
            v-for="(item, index) in workflowTypeList"
            :key="`${index}-a`"
            :value="item.appGroupCode"
            :title="item.name"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
        <InputSearch
          v-model="wd"
          :placeholder="$t('cloudpivot.flowCenter.pc.searchFlowName')"
          style="width: 252px"
          class="input-search"
          :allowClear="true"
          @search="onSearch"
        />
      </div>
    </div>

    <div style="padding-right: 24px">
      <div
        v-show="!isSearch && showHint"
        class="start-workflow-hint"
        :title="$t('cloudpivot.flowCenter.pc.startWorkflowHint')"
      >
        <i class="icon aufontAll h-icon-all-exclamation-circle"></i>
        {{ $t('cloudpivot.flowCenter.pc.startWorkflowHint') }}
        <span class="icon aufontAll close-hint" @click="showHint = false">&#xe996;</span>
      </div>
    </div>

    <!-- 流程列表 -->
    <div
      v-show="!isSearch"
      class="start-workflow-contanier"
      :class="!showHint ? 'no-hint' : ''"
    >
      <div class="content">
        <WorkflowItem
          :isData="workflowData"
          @openDetail="openDetail"
          @favoriteChange="favoriteChange"
        />
        <PageNoData
          v-show="isShowNoData"
          :isShowNoData="isShowNoData"
          tipText="暂无可发起的流程"
          class="workitem-box-nodata"
        />
      </div>
      <div class="contanier-right">
        <div class="my-collect">
          <h3>{{ $t('cloudpivot.flowCenter.pc.mycollect') }}</h3>
          <MyCommonItem
            v-show="favoritemData && favoritemData.length > 0"
            class="contanier-right-content"
            type="collect"
            :isData="favoritemData"
            @favoriteWorkflow="favoriteWorkflow"
            @openDetail="openDetail"
          />
          <PageNoData
            v-show="!favoritemData || favoritemData.length < 1"
            :isShowNoData="true"
            class="workitem-box-nodata workitem-box-nodata2"
          />
        </div>

        <div class="histrory">
          <h3>{{ $t('cloudpivot.flowCenter.pc.histrory') }}</h3>
          <MyCommonItem
            v-show="histryData && histryData.length > 0"
            class="contanier-right-content"
            type="history"
            :isData="histryData"
            @favoriteWorkflow="favoriteWorkflow"
            @openDetail="openDetail"
          />
          <PageNoData
            v-show="!histryData || histryData.length < 1"
            :isShowNoData="true"
            class="workitem-box-nodata workitem-box-nodata2"
          />
        </div>
      </div>
    </div>

    <!-- 我的收藏展开 -->
    <div
      v-show="isSearch"
      class="start-workflow-openCollect"
      @click.stop="isOpen = true"
    >
      <div class="left">
        <span class="search-result">搜索结果</span>
        <span>共<span class="num">{{ searchList.length }}</span>个结果
          <!-- 已展示<span class="num">5</span>条 -->
        </span>
      </div>
      <div class="right" :class="isOpen ? 'active' : ''">
        <i class="icon aufontAll h-icon-all-open"></i>
        <span>打开收藏</span>
      </div>
      <div v-if="isOpen" class="openCollect-box">
        <div class="modal-box" @click.stop="isOpen = false"></div>
        <div class="modal-content">
          <h3>我的收藏</h3>
          <MyCommonItem
            v-show="favoritemData && favoritemData.length > 0"
            class="contanier-right-content"
            type="collect"
            :isData="favoritemData"
            @favoriteWorkflow="favoriteWorkflow"
            @openDetail="openDetail"
          />
          <PageNoData
            v-show="!favoritemData || favoritemData.length < 1"
            :isShowNoData="true"
            class="workitem-box-nodata workitem-box-nodata2"
            style="margin-top: 140px"
          />
        </div>
      </div>
    </div>

    <!-- 流程搜索展示 -->
    <div v-show="isSearch" class="start-workflow-search">
      <div v-show="!searchNoData" class="start-search-box">
        <MySearchItem
          :searchList="searchList"
          @favoriteChange="favoriteChange"
          @openDetail="openDetail"
        />
      </div>

      <PageNoData
        v-show="searchNoData"
        :isShowNoData="searchNoData"
        type="search"
        tipText="暂无搜索结果"
        class="page-no-data-box"
      />
    </div>

    <!-- 返回顶部 -->
    <div v-if="isSearch && btnFlag" class="return-top" @click="backTop">
      <i class="icon aufontAll h-icon-all-shape"></i>
    </div>

    <!-- 详情弹出层 -->
    <IframeModal
      :showIframeForm="showIframeForm"
      :IframeFormUrl="IframeFormUrl"
      @close="closeModal"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Input, Select } from '@h3/antd-vue';

import common from '../../../../common/pc';

// 引入发起流程store
import StartWorkflowStore from './store/start-workflow';

import WorkflowItem from './components/start-workflow/workflow-item.vue';

import MyCommonItem from './components/start-workflow/my-common-item.vue';

import MySearchItem from './components/start-workflow/my-search-item.vue';

import IframeModal from './components/iframe-modal/iframe-modal.vue';

import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

import {
  initialInstanceApi,
  // initialInstanceParams,
  // workflow,
} from '../../../../api';

import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams,
  // listApi as Application,
} from '../../../../api';

@Component({
  name: 'start-workflow',
  components: {
    InputSearch,
    ASelect: Select,
    ASelectOption: Select.Option,
    PageNoData: common.components.PageNoData,
    WorkflowItem,
    MyCommonItem,
    MySearchItem,
    PageLoadingNew: common.components.PageLoadingNew,
    IframeModal,
  },
})
export default class StartWorkflow extends Vue {
  curNum: number = Number.POSITIVE_INFINITY; // 当前窗口一行可以展示多少个流程

  wd: string = ''; // 搜索关键字

  type: string = '1'; //搜索类型

  isSearch: boolean = false; //是否搜索

  workflowData: any[] = []; //流程列表

  histryData: any[] = []; //最近使用

  searchList: any[] = []; //搜索列表

  searchNoData: boolean = false;

  IframeFormUrl: string = '';

  showIframeForm: boolean = false;

  isShowNoData: boolean = false; //空白页

  isOpen: boolean = false;

  showHint: boolean = true;

  workflowTypeList: any[] = [
    // {
    //   name: this.$t('cloudpivot.application.pc.allApplications'),
    //   appGroupCode: "all",
    // },
  ]; //流程分类

  openWorkFlow(href) {
    if (href) {
      this.IframeFormUrl = href;
      this.showIframeForm = true;
    }
  }

  // get favoriteList() {
  //   return this.$store.state.StartWorkflowStore.favoriteList;
  // }

  // get searchTotal() {
  //   return this.$store.state.StartWorkflowStore.searchTotal;
  // }

  // get isShowSearchNoData() {
  //   return this.$store.state.StartWorkflowStore.isShowSearchNoData;
  // }

  // get isShowSearchResult() {
  //   return this.$store.state.StartWorkflowStore.isShowSearchResult || false;
  // }

  // get itemList() {
  //   return this.$store.state.StartWorkflowStore.itemList;
  // }

  // get searchList() {
  //   return this.$store.state.StartWorkflowStore.searchList;
  // }

  scrollTop: number = 0;

  btnFlag: boolean = false;

  mode: string = 'standalone';

  data: any[] = []; //列表数据

  isLoading: boolean = false;

  favoritemData: any[] = []; //收藏列表

  workflowType: string = 'all';

  tempWorkflowData: any[] = [];

  /**
   * 关闭弹窗
   */
  closeModal() {
    console.log('关闭了弹窗....');

    this.showIframeForm = false;
    this.IframeFormUrl = '';
  }

  /**
   * 同步收藏
   */
  favoriteChange(item) {
    const { data, favorites } = item;
    this.getFavoriteWorkflowList();
    this.favoriteWorkflowRecently();
  }

  /**
   * 发起流程
   */
  openDetail(obj) {
    const code = obj.code;
    let url: string = `/form/detail?startWorkflowCode=${code}`;
    url += `&return=${location.pathname + encodeURIComponent(location.search)}`;
    if (this.isDingTalk) {
      this.$router
        .push({
          path: url,
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      this.IframeFormUrl = url;
      this.showIframeForm = true;
    }
  }

  /**
   * 返回顶部
   */
  scrollToTop(e) {
    const scrollTop = e.target.scrollTop || e.srcElement.scrollTop;
    this.scrollTop = scrollTop;
    if (this.scrollTop > 60) {
      this.btnFlag = true;
    } else {
      this.btnFlag = false;
    }
  }

  backTop() {
    const timer = setInterval(() => {
      const ispeed = Math.floor(-this.scrollTop / 5);
      (document.getElementById('startWorkflow') as any).scrollTop =
        this.scrollTop + ispeed;
      if (this.scrollTop === 0) {
        clearInterval(timer);
      }
    }, 16);
  }

  created() {
    // console.log(this.$t('cloudpivot.application.pc.cancelCollection'))
    // const allApplications = this.$t('cloudpivot.application.pc.allApplications')
    // this.workflowTypeList = [
    //   {
    //     name: allApplications,
    //     appGroupCode: "all",
    //   },
    // ]
    this.$store.registerModule('StartWorkflowStore', StartWorkflowStore);
  }

  destroyed() {
    if (document.getElementById('startWorkflow')) {
      (document.getElementById('startWorkflow') as any).removeEventListener(
        'scroll',
        this.scrollToTop,
      );
    }
    this.$store.commit('StartWorkflowStore/resetShowSearch');
    this.$store.unregisterModule('StartWorkflowStore');
  }

  beforeMount() {
    this.handleGetLists();
    this.getFavoriteWorkflowList();
    this.favoriteWorkflowRecently();
  }

  async mounted() {
    this.calcNums();
    common.utils.Bus.$on('resize', this.calcNums);
    window.addEventListener('resize', this.calcNums);
    if (document.getElementById('startWorkflow')) {
      (document.getElementById('startWorkflow') as any).addEventListener(
        'scroll',
        this.scrollToTop,
      );
    }
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event: any) {
    if (event.data === 'close') {
      this.showIframeForm = false;
      this.IframeFormUrl = '';
      this.$store.dispatch('WorkflowCenterStore/getWorkCount');
    }
  }

  /**
   * 切换目录
   */
  async valueChange(val) {
    const selectRef = this.$refs['groupSelect'] as Select;
    selectRef.blur();
    if (val !== 'all') {
      //过滤
      this.workflowData = this.tempWorkflowData.filter((item) => {
        return item[0].appGroupCode === val;
      });
      return;
    }
    const res = await workflowCenterApi.changeMyWorkflowList(false, val);
    if (res.errcode === 0) {
      this.workflowData = [];
      const tempArr: any[] = [];
      let index = -1;
      res.data.map((item) => {
        index = tempArr.findIndex((el) => {
          return el === item.appGroupCode;
        });
        if (index > -1) {
          //找到了code
          this.workflowData[index].push(item);
        } else {
          this.workflowData.push([item]);
          tempArr.push(item.appGroupCode as string);
        }
      });
      this.tempWorkflowData = JSON.parse(JSON.stringify(this.workflowData));
    } else {
      this.$message.error(res.errmsg as any);
      this.workflowData = [];
      this.isShowNoData = true;
      this.tempWorkflowData = [];
    }
  }

  /**
   * 最近使用流程
   */
  async favoriteWorkflowRecently() {
    const cancelParams = {
      isMobile: 'false',
    };
    const res = await workflowCenterApi.setFavoriteWorkflowRecently(
      cancelParams,
    );
    this.histryData = res.data;
  }

  /**
   * 添加/取消收藏
   */
  async favoriteWorkflow(item) {
    const cancelParams: workflowCenterParams.WorkflowParams = {
      workflowCode: item.code,
    };
    const setParams: workflowCenterParams.WorkflowParams = {
      workflowCode: item.code,
      appCode: item.appCode,
    };

    if (item.favorites) {
      const res = await workflowCenterApi.deleteFavoriteWorkflow(cancelParams);
      if (!res.errcode) {
        item.favorites = false;
        this.favoritemData = this.favoritemData.filter(
          (el) => el.id !== item.id,
        );
        this.handleGetLists();
        this.getFavoriteWorkflowList();
        this.favoriteWorkflowRecently();
      } else {
        this.$message.error(res.errmsg as any);
      }
    } else {
      const res = await workflowCenterApi.setFavoriteWorkflow(setParams);
      if (!res.errcode) {
        item.favorites = true;
        this.handleGetLists();
        this.getFavoriteWorkflowList();
        this.favoriteWorkflowRecently();
      } else if (res.errcode === 201014) {
        this.$message.warning(
          this.$t('cloudpivot.flowCenter.pc.sevenFlowsIsMost') as string,
        );
      } else {
        this.$message.error(res.errmsg as any);
      }
    }
  }

  /**
   * 我的收藏
   */
  async getFavoriteWorkflowList() {
    const res = await workflowCenterApi.getFavoriteWorkflowList();
    this.favoritemData = res.data;
  }

  getWorkflowList() {
    return this.$store.dispatch('StartWorkflowStore/getWorkflowList');
  }

  searchMyWorkflowList(params: any) {
    this.$store.dispatch('StartWorkflowStore/searchMyWorkflowList', params);
  }

  /**
   * 搜索流程
   */
  async SearchListWorkflow(type?) {
    this.isSearch = true;
    this.searchNoData = false;
    this.searchList.length = 0;
    const searchParams = {
      workflowName: this.wd,
      language: this.$i18n.locale,
      isMobile: false,
    };
    const res = await initialInstanceApi.listWorkflowsByName(searchParams);
    if (res.errcode === 0) {
      this.searchNoData = res.data.appList ? false : true;
      if (!this.searchNoData) {
        res.data.appList.forEach((item) => {
          item.appName = this.queryTitleLight(item.appName);
          // item.appName =  item.appName.replaceAll('|','/');
          item.appName = item.appName.replace(/\|/g, '/');
          item.dataList[0].name = this.queryTitleLight(item.dataList[0].name);
        });
        this.searchList = res.data.appList;
      }
    }
  }

  /*
   * 点击搜索
   */

  onSearch() {
    if (this.wd) {
      this.SearchListWorkflow();
    } else {
      this.handleGetLists();
    }
    // const curScrollDom = this.$refs.workflowScroll as HTMLElement;
    // if (!curScrollDom) {
    //   return;
    // }
    // curScrollDom.scrollTop = 0;
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

  /*
   * 清空关键字
   */
  clearKeyword() {
    this.wd = '';
  }

  /*
   * 返回待办列表
   */
  goBack() {
    this.$router.push('my-unfinished-workitem').catch((err: any) => {
      console.log(err);
    });
  }

  /*
   * 计算当前窗口一行可以展示多少个
   */
  calcNums() {
    const curDom = this.$refs.workflow as HTMLElement;
    if (!curDom) {
      return;
    }
    this.curNum = Math.floor((curDom.clientWidth - 15) / 222);
  }

  /**
   * 请求接口整合
   */
  async handleGetLists() {
    this.isSearch = false;
    this.isShowNoData = false;
    const res: any = await this.getWorkflowList();
    if (res.errcode === 0) {
      this.workflowData = [];
      const tempArr: any[] = [];
      let index = -1;
      this.workflowTypeList = [
        // {
        //   name: "全部应用",
        //   appGroupCode: "all",
        // },
      ];
      res.data.map((item) => {
        index = tempArr.findIndex((el) => {
          return el === item.appGroupCode;
        });
        if (index > -1) {
          //找到了code
          this.workflowData[index].push(item);
        } else {
          this.workflowData.push([item]);
          tempArr.push(item.appGroupCode as string);
        }
      });
      this.workflowData.forEach((item) => {
        if (
          Array.isArray(item) &&
          item[0].appGroupCode &&
          item[0].appGroupName
        ) {
          this.workflowTypeList.push({
            name: item[0].appGroupName,
            appGroupCode: item[0].appGroupCode,
          });
        }
      });
      this.tempWorkflowData = JSON.parse(JSON.stringify(this.workflowData));
    } else {
      this.$message.error(res.errmsg);
      this.workflowData = [];
      this.isShowNoData = true;
      this.tempWorkflowData = [];
    }
    this.workflowType = 'all';
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../cloudpivot/application/src/components/pc/style/custom-themes';
.start-workflow-wrap {
  width: 100%;
  height: 100%;
  margin-top: 12px;
  // padding-right: 16px;
  overflow-y: auto;
  .start-workflow-top {
    .ant-select-dropdown-menu-item:hover:not(.ant-select-dropdown-menu-item-disabled) {
      background-color: @hoveBGColor !important;
    }

    display: flex;
    justify-content: space-between;
    height: 36px;
    align-items: center;
    width: 100%;
    padding-right: 24px;
    > h3 {
      color: #111218;
      font-size: 16px;
      font-weight: 700;
      flex: 1;
      margin: 0;
    }
    > .right {
      width: 400px;
      display: flex;
      justify-content: flex-end;
      .start-workflow-top-select {
        width: 135px;
        /deep/.ant-select-selection-selected-value {
          font-size: 14px;
          font-weight: 400;
          color: #111218;
        }
        /deep/.ant-select-selection--single {
          border-radius: 2px;
        }
      }
      > .input-search {
        width: 252px;
        margin-left: 8px;
        /deep/.ant-input {
          font-size: 14px;
          font-weight: 400;
          color: #111218;
          line-height: 22px;
          border-radius: 2px;
        }
      }
    }
  }

  .start-workflow-hint {
    width: 100%;
    margin: 14px 0 12px;
    background-color: #f0f7ff;
    padding: 0 32px 0 16px;
    height: 40px;
    line-height: 40px;
    color: #111218;
    font-size: 14px;
    font-weight: 400;
    border: 1px solid #a3cbff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    position: relative;
    > i {
      color: #2970ff;
      font-size: 14px;
      vertical-align: baseline;
      margin-right: 8px;
    }
    .close-hint {
      position: absolute;
      right: 16px;
      &:hover {
        cursor: pointer;
        color: @highlightColor;
      }
    }
  }

  .start-workflow-contanier {
    width: 100%;
    display: flex;
    justify-content: space-between;
    height: calc(100% - 104px);
    overflow-y: scroll;
    padding-right: 18px;
    &.no-hint {
      height: calc(100% - 52px);
      margin-top: 24px;
    }
    .workitem-box-nodata {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      &.workitem-box-nodata2 {
        max-height: 250px;
        /deep/ img {
          height: 163px;
          width: 163px;
        }
      }
    }
    .content {
      width: 100%;
      min-height: 616px;
      // background-color: #fff;
      border-radius: 2px;
      padding: 0 0px 20px;
      margin-right: 16px;
    }
    .contanier-right {
      width: 252px;
      min-width: 252px;
      max-width: 252px;
      display: flex;
      flex-direction: column;
      height: auto;
      .my-collect,
      .histrory {
        width: 100%;
        height: 300px;
        max-height: 300px;
        min-height: 300px;
        background-color: #fff;
        border-radius: 2px;
        padding: 20px 0;
        overflow: hidden;
        margin-bottom: 16px;
        > h3 {
          font-size: 18px;
          color: #111218;
          font-weight: 700;
          margin-bottom: 12px;
          padding-left: 20px;
        }
      }
      .contanier-right-content {
        height: calc(100% - 7px);
      }
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
}

.start-workflow-openCollect {
  width: 100%;
  min-width: 1000px;
  max-width: 1376px;
  margin: 16px auto 10px;
  color: rgba(17, 18, 24, 0.5);
  font-size: 14px;
  font-weight: 400;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .right {
    cursor: pointer;
    @media screen and (max-width: 1650px) {
      margin-right: 20px;
    }
    i {
      margin-right: 7px;
      font-size: 12px;
      vertical-align: baseline;
    }
    &:hover,
    &.active,
    &:active {
      color: @highlightColor;
    }
  }
  .left {
    font-weight: 400;
    color: #111218;
    font-size: 14px;
    > .search-result {
      height: 22px;
      font-size: 14px;
      font-weight: 600;
      color: #111218;
      line-height: 22px;
    }
    > span {
      margin-left: 8px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      .num {
        margin: 0 4px;
        color: @highlightColor;
      }
    }
  }

  .openCollect-box {
    width: 320px;
    height: 600px;
    position: absolute;
    right: 0;
    top: 26px;
    background: #ffffff;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    .modal-box {
      position: fixed;
      width: 100vw;
      height: 100vh;
      z-index: 2;
      background-color: transparent;
      left: 0;
      top: 0;
      cursor: auto;
    }
    .modal-content {
      position: absolute;
      right: 0;
      top: 0;
      z-index: 9;
      width: 320px;
      height: 600px;
      text-align: left;
      padding: 24px 0;
      > h3 {
        padding: 0 24px;
        color: #111218;
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 12px;
      }
    }
  }
}

.start-workflow-search {
  width: 100%;
  min-width: 1000px;
  max-width: 1376px;
  margin: 0 auto;
  height: calc(100% - 84px);
}

.page-no-data-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  // padding-top: 140px;
  align-items: center;
  padding-bottom: 88px;
}

/**
    滚动条内槽
  */

.content-data::-webkit-scrollbar-thumb {
  width: 6px;
  background-color: rgba(17, 18, 24, 0.25);
  border-radius: 3px;
}
.content-data::-webkit-scrollbar-thumb:hover {
  background-color: rgba(17, 18, 24, 0.5);
}

/**
   滚动条外层轨道
  */
.content-data::-webkit-scrollbar-track {
  background-color: transparent;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 47%;
  z-index: 999;
  transform: translate(-50%, -50%);
}

.return-top {
  position: absolute;
  bottom: 80px;
  right: 50px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(17, 18, 24, 0.25);
  text-align: center;
  line-height: 40px;
  color: #fff;
  cursor: pointer;
}

::-webkit-scrollbar-thumb {
  background: rgba(17, 18, 24, 0.25);
  &:hover {
    background: rgba(17, 18, 24, 0.5);
  }
}
</style>

<!--
 * @Descripttion: 我的已阅
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-11 12:18:30
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-04 14:45:14
-->
<template>
  <div ref="workItem" class="workitem-box">
    <!-- 顶部信息 -->
    <div style="padding-right: 12px; z-index: 10">
      <div class="workitem-box-top">
        <PageHeader
          :headerData="headerData"
          :queryConditionSource="queryConditionSource"
          :subTitle="$t('cloudpivot.flowCenter.pc.readList')"
          :queryActive="queryActive"
          :isOpen="isShowQueryItem"
          :noData="isShowNoData"
          @search="isShowQueryItem = true"
        />

        <div v-show="isShowQueryItem" class="filters-box">
          <query-workitem
            ref="queryWorkitem"
            :isShowInstanceState="false"
            :isShowOriginator="true"
            :timeLable="$t('cloudpivot.flowCenter.pc.reciveTime')"
            @reset="onReset"
            @search="onSearch"
            @hide="isShowQueryItem = false"
          />
        </div>
      </div>
    </div>
    <!-- 待阅列表 -->
    <div
      id="MyReadWorkitem"
      v-show="!isShowNoData"
      v-infinite-scroll="handleInfiniteOnLoad"
      class="content-data"
      :infinite-scroll-disabled="busy"
      :infinite-scroll-distance="10"
    >
      <PageData :listData="data" :type="headerData.type" />
      <PageLoadingNew
        :loading="loadingType === 'loading'"
        :loadingText="
          loadingType === 'done'
            ? $t('cloudpivot.flowCenter.pc.showAllRead')
            : ''
        "
      />
    </div>

    <!-- 空页面 -->
    <div class="workitem-box-nodata">
      <PageNoData
        :isShowNoData="isShowNoData"
        :type="queryConditionSource.length ? 'search' : 'show'"
        :tipText="
          queryConditionSource.length
            ? $t('cloudpivot.flowCenter.pc.searchNoDataText')
            : $t('cloudpivot.flowCenter.pc.noContent')
        "
      />
    </div>

    <!-- 返回顶部 -->
    <div v-if="btnFlag" class="return-top" @click="backTop">
      <i class="icon aufontAll h-icon-all-shape"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';

import { mixins } from 'vue-class-component';

import QueryWorkitem from './components/query-condition/query-workitem.vue';

import * as utils from '../../../../common/src/utils/pc/utils';

import common from '../../../../common/pc';

import SetTimeTypeMixin from './common/index'; //公共处理模块

import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams,
} from '../../../../api';

import WorkItemMixin from './mixins/workitem';

import * as Helper from './helper/helper';

import moment from 'moment';

interface PageHeaderData {
  total: number; //总数
  showTotal: number; //当前数
  type: number; // 类型
  batch: boolean; //是否批量
}

@Component({
  name: 'MyReadWorkitem',
  components: {
    PageHeader: common.components.PageHeader,
    PageData: common.components.PageData,
    PageLoadingNew: common.components.PageLoadingNew,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail,
    QueryWorkitem,
  },
})
export default class MyReadWorkitem extends mixins(
  WorkItemMixin,
  SetTimeTypeMixin,
) {
  /**
   * 单应用集成属性,集成时不显示title
   */
  @Prop({
    default: true,
  })
  showTitle!: boolean;

  /**
   * 单应用集成属性,集成时表格高度
   */
  @Prop() scrollHeight!: number;

  /**
   * 单应用集成属性,单应用appCode
   */
  @Prop() appCode!: string;

  /**
   * 自定义表格的列
   */
  @Prop() tableColumns!: any;

  @Prop() storeId!: string;

  searchParams: workflowCenterParams.FinishedWorkItemParams = {
    workflowName: '',
    workflowCode: '',
    originator: '',
    unitType: '',
    instanceState: '',
    startTime: utils.timeStampToDate(
      'YY-MM-DD',
      (moment().add(-30, 'days') as any)._d,
    ),
    endTime: utils.timeStampToDate('YY-MM-DD', (moment() as any)._d),
    appCode: this.appCode,
  };

  defaultTableColumns: any = [
    {
      dataIndex: 'orderNumber',
      width: 80,
      align: 'center',
      hSlot: 'indexTitle',
    },
    {
      dataIndex: 'instanceName',
      width: 220,
      hSlot: 'instanceNameTitle',
      bSlot: 'instanceName',
    },
    {
      dataIndex: 'workflowName',
      width: 130,
      hSlot: 'workflowNameTitle',
      bSlot: 'workflowName',
    },
    {
      dataIndex: 'sequenceNo',
      width: 130,
      hSlot: 'sequenceNoTitle',
      bSlot: 'sequenceNo',
    },
    {
      dataIndex: 'sourceName',
      width: 130,
      hSlot: 'sourceNameTitle',
      bSlot: 'sourceName',
    },
    {
      dataIndex: 'receiveTime',
      width: 180,
      hSlot: 'receiveTimeTitle',
      bSlot: 'receiveTime',
    },
    {
      dataIndex: 'originatorName',
      width: 130,
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName',
    },
    {
      dataIndex: 'departmentName',
      width: 200,
      hSlot: 'departmentNameTitle',
      bSlot: 'departmentName',
    },
  ];

  queryActive: boolean = true; //是否筛选

  isShowQueryItem: boolean = false;

  get scrollYHeight() {
    if (this.scrollHeight) {
      return this.scrollHeight;
    }
    return this.scrollY;
  }

  get columns() {
    if (this.tableColumns) {
      return this.tableColumns;
    }
    return this.defaultTableColumns;
  }

  /**
   * 通用变量
   */

  busy: boolean = false;

  mode: string = 'standalone';

  data: any[] = []; //列表数据

  isLoading: boolean = false;

  loadingType: string = 'init'; //init 初始化 // loading 加载中, done加载完毕,

  isSelectShow: boolean = false;

  isSelectAll: boolean = false;

  scrollTop: number = 0;

  btnFlag: boolean = false;

  curPage: number = 1;

  queryConditionSource: any[] = []; //查询条件

  tipText: string = ''; //提示语

  noDataType: string = 'show'; //结果页类型

  headerData: PageHeaderData = {
    //头部参数
    total: 0,
    showTotal: 0,
    type: 4,
    batch: false,
  };

  /**
   * 滚动加载
   */
  handleInfiniteOnLoad() {
    if (this.loadingType !== 'init' || this.curPage === 1) {
      return;
    }
    this.getMyReadWorkitem('pageChange');
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
      if (document.getElementById('MyReadWorkitem')) {
        (document.getElementById('MyReadWorkitem') as any).scrollTop =
          this.scrollTop + ispeed;
      }
      if (this.scrollTop === 0) {
        clearInterval(timer);
      }
    }, 16);
  }

  mounted() {
    if (document.getElementById('MyReadWorkitem')) {
      (document.getElementById('MyReadWorkitem') as any).addEventListener(
        'scroll',
        this.scrollToTop,
      );
    }
    setTimeout(() => {
      if (localStorage.getItem('temp')) {
        const tempArr = JSON.parse(localStorage.getItem('temp') || '[]');
        tempArr.forEach((item) => {
          // @ts-ignore
          if (item.id === this.storeId) {
            this.searchParams = item.d;
          }
        });
        const vals: any = this.dataTranslateToFilterCard(
          this.searchParams,
          'myReadWorkItem',
        );
        this.queryConditionSource = vals;
      } else if (localStorage.getItem('daily')) {
        const dailyArr = JSON.parse(localStorage.getItem('daily') || '[]');
        dailyArr.forEach((item) => {
          // @ts-ignore
          if (item.id === this.storeId) {
            this.searchParams = item.d;
          }
        });
        const vals: any = this.dataTranslateToFilterCard(
          this.searchParams,
          'myReadWorkItem',
        );
        this.queryConditionSource = vals;
      } else {
        //Else Empty block statement
      }
      this.getMyReadWorkitem();
    }, 500);
    // window.addEventListener('resize', this.setTableMaxHeight);
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event: any) {
    if (event.data === 'close') {
      this.showIframeForm = false;
      this.IframeFormUrl = '';
      this.getMyReadWorkitem();
      return;
    }

    if (event.source === window) {
      return;
    }
    if (
      event.data.indexOf('/workflow-center/my-read-workitem') !== -1 ||
      event.data.indexOf('%2Fworkflow-center%2Fmy-read-workitem') !== -1
    ) {
      this.getMyReadWorkitem();
    }
  }

  destroyed() {
    // window.removeEventListener('resize', this.setTableMaxHeight);
    window.removeEventListener('message', this.reloadMessage, false);
    if (document.getElementById('MyReadWorkitem')) {
      (document.getElementById('MyReadWorkitem') as any).removeEventListener(
        'scroll',
        this.scrollToTop,
      );
    }
  }

  resetParams() {
    this.searchParams = {
      workflowName: '',
      workflowCode: '',
      originator: '',
      unitType: '',
      startTime: utils.timeStampToDate(
        'YY-MM-DD',
        (moment().add(-30, 'days') as any)._d,
      ),
      endTime: utils.timeStampToDate('YY-MM-DD', (moment() as any)._d),
      appCode: this.appCode,
    };
  }

  onReset() {
    this.isShowQueryItem = false;
    this.queryActive = true;
    this.queryConditionSource = [];
    this.curPage = 1;
    this.resetParams();
    this.getMyReadWorkitem();
  }

  onSearch(params: workflowCenterParams.FinishedWorkItemParams) {
    this.isShowQueryItem = false;
    this.queryActive = true;
    const vals: any = this.dataTranslateToFilterCard(params, 'myReadWorkItem');
    this.queryConditionSource = vals;

    this.curPage = 1;
    this.searchParams = {
      ...params,
    };
    this.getMyReadWorkitem('search');
  }

  // 分页改变
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.getMyReadWorkitem('pageChange');
  }

  // 分页pageSize改变
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getMyReadWorkitem('pageChange');
  }

  // 加载失败重新加载
  reload() {
    this.curPage = 1;
    this.pageSize = 20;
    this.resetParams();

    this.getMyReadWorkitem();
  }

  // 获取已阅列表
  async getMyReadWorkitem(type?: string) {
    const p = {
      ...this.searchParams,
      page: this.curPage - 1,
      size: this.pageSize,
      appCode: this.appCode,
    };

    // 数据处理函数
    this.dataHandler = (data: any) => {
      data.forEach((item: any, index: number) => {
        item.orderNumber = index + 1;
        item.key = index;
        item.departmentName = Helper.departmentNameTranslator(
          item.departmentName,
        );

        // 去掉秒钟
        if (item.receiveTime) {
          item.receiveTime = Helper.removeSeconds(item.receiveTime);
        }

        // 设置高亮
        item.instanceName = utils.searchHighLight(
          this.searchParams.workflowName,
          item.instanceName,
        );

        if (item.sourceName_i18n) {
          item.sourceName_i18n = JSON.parse(item.sourceName_i18n);
        }

        item = utils.compatible(item, 'sourceName', 'sourceName_i18n');

        // 国际化兼容
        item = utils.compatible(item, 'workflowName');
      });
      return data;
    };

    this.isShowNoData = false;
    this.loadingType = 'loading';
    const res: any = await workflowCenterApi
      .listReadWorkitems(p)
      .then((res) => {
        this.loadingType = 'init';
        return res; //回调链数据返回
      });
    this.processResult(res, type);
    // this.commonHandler(res, type);
  }

  /**
   * 接口数据后续处理
   */
  processResult(res: any, type?: string) {
    this.loadingType = 'init';
    if (res.data && res.data.totalElements > 0) {
      if (type === 'pageChange') {
        //加载更多
        if (res.data.content.length < 1) {
          this.loadingType = 'done';
          this.headerData = {
            total: res.data.totalElements,
            showTotal: this.data.length,
            type: 4,
            batch: true,
          };
          return;
        }
        res.data.content.forEach((item) => {
          item.startTime = this.removeSeconds(item.startTime);
          this.data.push(item);
        });
      } else {
        //初始化
        this.data = res.data.content.map((item) => {
          item.startTime = this.removeSeconds(item.startTime);
          return item;
        });
        /**
         * 加载完毕
         */
        if (res.data.content.length < this.pageSize) {
          this.loadingType = 'done';
          this.headerData = {
            total: res.data.totalElements,
            showTotal: this.data.length,
            type: 4,
            batch: true,
          };
          return;
        }
      }
      this.curPage++;
    } else {
      //无数据
      this.isShowNoData = true;
      this.total = 0;
      this.curPage = 1;
      if (type === 'search') {
        this.noDataType = 'search';
        this.tipText = '搜索无结果';
      } else {
        this.noDataType = 'show';
        this.tipText = '暂无内容';
      }
    }
    this.headerData = {
      total: res.data.totalElements,
      showTotal:
        this.curPage === 1 ? res.data.content.length : this.data.length,
      type: 4,
      batch: true,
    };
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setLoadAllTxt();
    // this.setTableMaxHeight();
  }
}
</script>
<style lang="less" scoped>
@import './style/common.less';
</style>

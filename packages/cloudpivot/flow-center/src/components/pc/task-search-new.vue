<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-11 19:30:48
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-04 14:43:54
-->
<template>
  <div ref="workItem" class="workitem-box my-workflow">
    <!-- 顶部信息 -->
    <div style="padding-right: 12px; z-index: 10">
      <div class="workitem-box-top-2">
        <PageHeader
          :headerData="headerData"
          :queryConditionSource="queryConditionSource"
          :tabsList="tabs"
          :queryActive="queryActive"
          :subTitle="$t('cloudpivot.flowCenter.pc.taskSearch')"
          :isOpen="isShowQueryItem"
          :noData="isShowNoData"
          @search="isShowQueryItem = true"
          @changeTabs="changeTabs"
        />

        <div v-show="isShowQueryItem" class="filters-box">
          <query-workitem
            ref="queryWorkitem"
            class="query-box"
            :isShowOriginator="true"
            :timeLable="timeLable"
            :isResetFields="true"
            :isShowCurResolver="true"
            :hasTabs="true"
            @reset="onReset"
            @search="onSearch"
            @hide="isShowQueryItem = false"
          />
        </div>
      </div>
    </div>

    <!-- 待阅列表 -->
    <div
      id="TaskSearch"
      v-show="!isShowNoData"
      v-infinite-scroll="handleInfiniteOnLoad"
      class="content-data"
      :infinite-scroll-disabled="busy"
      :infinite-scroll-distance="10"
    >
      <PageData
        :listData="data"
        :type="headerData.type"
        :instanceState="instanceState"
      />
      <PageLoadingNew
        :loading="loadingType === 'loading'"
        :loadingText="
          loadingType === 'done'
            ? $t('cloudpivot.flowCenter.pc.showAllResult')
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

import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams,
} from '../../../../api';

import * as WorkflowCenterTypes from './typings/workflow-center';

import * as utils from '../../../../common/src/utils/pc/utils';

import WorkItemMixin from './mixins/workitem';
import * as Helper from './helper/helper';

import common from '../../../../common/pc';
import SetTimeTypeMixin from './common/index'; //公共处理模块

import QueryWorkitem from './components/query-condition/query-workitem.vue';

import moment from 'moment';

interface PageHeaderData {
  total: number; //总数
  showTotal: number; //当前数
  type: number; // 类型
  batch: boolean; //是否批量
  isChange: boolean; //是否tab页切换
}

@Component({
  name: 'task-search',
  components: {
    PageHeader: common.components.PageHeader,
    PageData: common.components.PageData,
    PageLoadingNew: common.components.PageLoadingNew,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail,
    QueryWorkitem,
  },
})
export default class TaskSearch extends mixins(
  WorkItemMixin,
  SetTimeTypeMixin,
) {
  /**
   * 自定义表格的列
   */
  @Prop() tableNotStartedColumns!: any;

  @Prop() tableProcessingColumns!: any;

  @Prop() tableCompletedColumns!: any;

  @Prop() tableCanceledColumns!: any;

  @Prop({ default: false }) isShowCurResolver!: boolean; // 是否展示当前处理人

  @Prop() storeId!: string;

  searchParams: workflowCenterParams.ListInstancesParams = {
    workflowName: '',
    workflowCode: '',
    startTime: utils.timeStampToDate(
      'YY-MM-DD',
      (moment().add(-30, 'days') as any)._d,
    ),
    endTime: utils.timeStampToDate('YY-MM-DD', (moment() as any)._d),
    originator: '',
    unitType: '',
  };

  instanceState: string = 'NOTSTARTED'; // 流程实例状态

  isResetFields: boolean = false;

  queryActive: boolean = true; //是否筛选

  isShowQueryItem: boolean = false;

  currentKey: string = '';

  timeLable: string = '';

  defaultNotStartedColumns: any = [
    {
      dataIndex: 'index',
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
      dataIndex: 'participants',
      width: 130,
      hSlot: 'participantNameTitle',
      bSlot: 'resolverName',
    },
    {
      dataIndex: 'time',
      width: 220,
      hSlot: 'haveStayedTimeTitle',
      bSlot: 'stayTime',
    },
    {
      dataIndex: 'receiveTime',
      width: 180,
      hSlot: 'receiveTimeTitle',
    },
    {
      dataIndex: 'originatorName',
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName',
      width: 180,
    },
  ];

  defaultProcessingColumns: any = [
    {
      dataIndex: 'index',
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
      dataIndex: 'participants',
      width: 130,
      hSlot: 'participantNameTitle',
      bSlot: 'resolverName',
    },
    {
      dataIndex: 'receiveTime',
      width: 180,
      hSlot: 'receiveTimeTitle',
    },
    {
      dataIndex: 'time',
      width: 220,
      hSlot: 'haveStayedTimeTitle',
      bSlot: 'stayTime',
    },
    {
      dataIndex: 'originatorName',
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName',
      width: 180,
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remarks',
    //   width: 130
    // },
  ];

  defaultCompletedColumns: any = [
    {
      dataIndex: 'index',
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
      dataIndex: 'participants',
      width: 130,
      hSlot: 'resolverTitle',
      bSlot: 'resolverName',
    },
    {
      dataIndex: 'approvalTxt',
      width: 130,
      hSlot: 'approvalTitle',
    },
    {
      dataIndex: 'finishTime',
      width: 180,
      hSlot: 'finishedTimeTitle',
    },
    {
      dataIndex: 'originatorName',
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName',
      width: 130,
    },
  ];

  defaultCanceledColumns: any = [
    {
      dataIndex: 'index',
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
      dataIndex: 'startTime',
      width: 180,
      hSlot: 'startTimeTitle',
    },
    {
      dataIndex: 'finishTime',
      width: 180,
      hSlot: 'cancellationTime',
    },
    {
      dataIndex: 'originatorName',
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName',
      width: 130,
    },
  ];

  get noStartedColumns() {
    if (this.tableNotStartedColumns) {
      return this.tableNotStartedColumns;
    }
    return this.defaultNotStartedColumns;
  }

  // 所有tab按钮
  tabs: Array<any> = [];

  curKey: string = '';

  get processingColumns() {
    if (this.tableProcessingColumns) {
      return this.tableProcessingColumns;
    }
    return this.defaultProcessingColumns;
  }

  get completedColumns() {
    if (this.tableCompletedColumns) {
      return this.tableCompletedColumns;
    }
    return this.defaultCompletedColumns;
  }

  get canceledColumns() {
    if (this.tableCanceledColumns) {
      return this.tableCanceledColumns;
    }
    return this.defaultCanceledColumns;
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
    type: 8,
    batch: false,
    isChange: false,
  };

  /**
   * 滚动加载
   */
  handleInfiniteOnLoad() {
    if (this.loadingType !== 'init' || this.curPage === 1) {
      return;
    }
    this.listWorkitems('pageChange');
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
      if (document.getElementById('TaskSearch')) {
        (document.getElementById('TaskSearch') as any).scrollTop =
          this.scrollTop + ispeed;
      }
      if (this.scrollTop === 0) {
        clearInterval(timer);
      }
    }, 16);
  }

  /**
   * 切换tabs
   */
  changeTabs(obj) {
    switch (obj.instanceState) {
      case 'CANCELLED':
        this.timeLable = this.$t(
          'cloudpivot.flowCenter.pc.cancelTime',
        ) as string;
        break;
      default:
        this.timeLable = this.$t(
          'cloudpivot.flowCenter.pc.initiationTime',
        ) as string;
        break;
    }
    this.curKey = obj.instanceState;
    this.loadingType = 'init';
    this.tabChange(obj.instanceState);
  }

  mounted() {
    this.setTabBtns();
    // this.changeTabs({instanceState:this.instanceState});
    if (document.getElementById('TaskSearch')) {
      (document.getElementById('TaskSearch') as any).addEventListener(
        'scroll',
        this.scrollToTop,
      );
    }
    this.curKey = this.tabs[1].key;
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
      this.listWorkitems();
    }, 500);

    // window.addEventListener('resize', this.setTableMaxHeight);
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event: any) {
    if (event.source === window) {
      return;
    }
    if (
      event.data.indexOf('/workflow-center/query-participant-workItem') !==
        -1 ||
      event.data.indexOf('%2Fworkflow-center%2Fquery-participant-workItem') !==
        -1
    ) {
      this.listWorkitems();
    }
  }

  destroyed() {
    // window.removeEventListener('resize', this.setTableMaxHeight);
    if (document.getElementById('TaskSearch')) {
      (document.getElementById('TaskSearch') as any).removeEventListener(
        'scroll',
        this.scrollToTop,
      );
    }
    window.removeEventListener('message', this.reloadMessage, false);
  }

  /**
   * 设置tab按钮
   */
  setTabBtns() {
    this.tabs = [
      {
        label: this.$t('cloudpivot.flowCenter.pc.noStarted'),
        value: 'NOTSTARTED',
        key: 0,
      },
      {
        label: this.$t('cloudpivot.flowCenter.pc.resolving'),
        value: 'INPROGRESS',
        key: 1,
      },
      {
        label: this.$t('cloudpivot.flowCenter.pc.completed'),
        value: 'FINISHED',
        key: 2,
      },
      {
        label: this.$t('cloudpivot.flowCenter.pc.beCancled'),
        value: 'CANCELLED',
        key: 3,
      },
    ];
  }

  /*
   * tab页栏切换
   */
  tabChange(key: any) {
    this.queryConditionSource = [];
    this.curKey = key;
    this.curPage = 1;
    this.pageSize = 20;
    this.isResetFields = true;
    this.instanceState = key;
    // this.resetParams();
    this.listWorkitems();
    setTimeout(() => {
      this.isResetFields = false;
    }, 100);
  }

  /*
   * 分页改变
   */
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.listWorkitems('search');
  }

  /*
   * 分页pageSize改变
   */
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.listWorkitems('search');
  }

  /*
   * 重置查询参数
   */
  resetParams() {
    this.searchParams = {
      workflowName: '',
      workflowCode: '',
      startTime: '',
      endTime: '',
      originator: '',
      unitType: '',
    };
  }

  /*
   * 查询条件重置事件
   */
  onReset() {
    this.isShowQueryItem = false;
    this.queryActive = true;
    this.queryConditionSource = [];
    this.curPage = 1;
    this.resetParams();
    this.listWorkitems();
  }

  /*
   * 查询条件搜索事件
   */
  onSearch(params: workflowCenterParams.ListInstancesParams) {
    this.isShowQueryItem = false;
    this.queryActive = true;
    let type: string = '';
    if (
      this.curKey === 'NOTSTARTED' ||
      this.curKey === 'INPROGRESS' ||
      this.curKey === 'FINISHED'
    ) {
      type = 'processing';
    } else {
      type = 'canceled';
    }
    let vals: any = this.dataTranslateToFilterCard(params, type);

    //过滤掉name为空数据
    if (Array.isArray(vals)) {
      vals = vals.filter((item) => item.name);
    }
    this.queryConditionSource = vals;

    this.curPage = 1;
    this.searchParams = {
      ...params,
    };
    this.listWorkitems('search');
  }

  /*
   * 重新加载
   */
  reload() {
    this.listWorkitems();
  }

  i18nHandle(item: any) {
    switch (item.approval) {
      case WorkflowCenterTypes.ApprovalState.AGREE:
        item.approvalTxt = this.$t('cloudpivot.flowCenter.pc.approval.agree');
        break;
      case WorkflowCenterTypes.ApprovalState.REJECT:
        item.approvalTxt = this.$t('cloudpivot.flowCenter.pc.approval.reject');
        break;
      case WorkflowCenterTypes.ApprovalState.FORWARD:
        item.approvalTxt = this.$t('cloudpivot.flowCenter.pc.approval.forward');
        break;
      case WorkflowCenterTypes.ApprovalState.CANCELLED:
        item.approvalTxt = this.$t(
          'cloudpivot.flowCenter.pc.approval.canceled',
        );
        break;
      case WorkflowCenterTypes.ApprovalState.UNDO:
        item.approvalTxt = this.$t('cloudpivot.flowCenter.pc.approval.undo');
        break;
      default:
        break;
    }
    return item;
  }

  /*
   * 获取我的流程列表
   */
  async listWorkitems(type?: string) {
    const params = {
      ...this.searchParams,
      status: this.instanceState,
      page: this.curPage - 1,
      size: this.pageSize,
    };

    // 数据处理函数
    this.dataHandler = (data: any) => {
      data.forEach((item: any, index: number) => {
        item.index = index + 1;
        item.key = index;
        if (
          item.workItemTimeoutStatus === 'NORMAL' ||
          item.workItemTimeoutStatus === 'TIMEOUT'
        ) {
          item.time = Helper.timeTranslate(item.stayTime);
        } else if (
          item.workItemTimeoutStatus === 'ORANGE' ||
          item.workItemTimeoutStatus === 'RED'
        ) {
          item.time = Helper.timeTranslate(item.remainingTime);
        } else {
          //Else Empty block statement
        }
        item.receiveTime = Helper.removeSeconds(item.receiveTime);
        item.startTime = Helper.removeSeconds(item.startTime);
        item.finishTime = Helper.removeSeconds(item.finishTime);
        // item.approvalTxt = Helper.ApprovalTranslator(item.approval);
        item = this.i18nHandle(item);

        // 设置高亮
        item.instanceName = utils.searchHighLight(
          this.searchParams.workflowName,
          item.instanceName,
        );

        // 国际化兼容
        item = utils.compatible(item, 'workflowName');
      });
      return data;
    };

    this.isShowNoData = false;
    const res: any = await workflowCenterApi.listWorkitems(params);
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
            type: 8,
            batch: false,
            isChange: type === 'pageChange' ? true : false,
          };
          return;
        }
        res.data.content.forEach((item) => {
          item.startTime = this.removeSeconds(item.startTime);
          item.finishTime = this.removeSeconds(item.finishTime);
          item.costTime = this.getTimerNumber(item.costTime);
          this.i18nHandle(item);
          this.data.push(this.SetTimeType(item));
        });
      } else {
        //初始化
        this.data = res.data.content.map((item) => {
          item.startTime = this.removeSeconds(item.startTime);
          item.finishTime = this.removeSeconds(item.finishTime);
          item.costTime = this.getTimerNumber(item.costTime);
          this.i18nHandle(item);
          return this.SetTimeType(item);
        });
        /**
         * 加载完毕
         */
        if (res.data.content.length < this.pageSize) {
          this.loadingType = 'done';
          this.headerData = {
            total: res.data.totalElements,
            showTotal: this.data.length,
            type: 8,
            batch: false,
            isChange: type === 'pageChange' ? true : false,
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
      type: 8,
      batch: false,
      isChange: type === 'pageChange' ? true : false,
    };
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.tableData.forEach((item: any) => {
      item = this.i18nHandle(item);
    });
    this.setLoadAllTxt();
    // this.setTableMaxHeight();
    this.setTabBtns();
  }
}
</script>

<style lang="less" scoped>
@import './style/common.less';
</style>

<!--
 * @Descripttion: 流程查询
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-11 16:30:33
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-04 14:43:44
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
          :subTitle="$t('cloudpivot.flowCenter.pc.instanceSearch')"
          :isOpen="isShowQueryItem"
          :noData="isShowNoData"
          :disabled="tableDataList.length > 0 ? false : true"
          @batch="batchProcess"
          @search="changeTabShow"
          @changeTabs="changeTabs"
        />

        <div v-show="isShowQueryItem" class="filters-box">
          <query-workitem
            ref="queryWorkitem"
            class="query-box"
            :isShowOriginator="true"
            :timeLable="timeLable"
            :isResetFields="true"
            :hasTabs="true"
            :isShowWorkFlowNode="curKey === 'PROCESSING'"
            :isShowParticipantId="curKey === 'PROCESSING'"
            @reset="onReset"
            @search="onSearch"
            @hide="isShowQueryItem = false"
          />
        </div>
      </div>
    </div>

    <!-- 待阅列表 -->
    <div
      id="QueryInstance"
      v-show="!isShowNoData"
      v-infinite-scroll="handleInfiniteOnLoad"
      class="content-data"
      :infinite-scroll-disabled="busy"
      :infinite-scroll-distance="10"
    >
      <PageData
        :listData="data"
        :batch="curKey === 'CANCELED'"
        :type="headerData.type"
        :instanceState="instanceState"
        @changeChecked="changeChecked"
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
  // workflowApi,
} from '../../../../api';

import * as WorkflowCenterTypes from './typings/workflow-center';

import * as utils from '../../../../common/src/utils/pc/utils';

import WorkItemMixin from './mixins/workitem';
import * as Helper from './helper/helper';

import { Icon } from '@h3/antd-vue';

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
  name: 'query-instance',
  components: {
    PageHeader: common.components.PageHeader,
    PageData: common.components.PageData,
    PageLoadingNew: common.components.PageLoadingNew,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail,
    QueryWorkitem,
    AIcon: Icon,
  },
})
export default class QueryInstance extends mixins(
  WorkItemMixin,
  SetTimeTypeMixin,
) {
  /**
   * 自定义表格的列
   */
  @Prop() tableAllColumns!: any;

  @Prop() tableProcessingColumns!: any;

  @Prop() tableCompletedColumns!: any;

  @Prop() tableCanceledColumns!: any;

  @Prop() tableExceptionColumns!: any;
  // @Prop() tableDraftColumns!: any;

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

  instanceState: string = ''; // 流程实例状态

  isResetFields: boolean = false;

  queryActive: boolean = true; //是否筛选

  isShowQueryItem: boolean = false;

  defaultAllColumns: any = [
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
      dataIndex: 'originatorName',
      width: 130,
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName',
    },
    {
      dataIndex: 'departmentName',
      width: 130,
      hSlot: 'departmentNameTitle',
      bSlot: 'originatorName',
    },
    {
      dataIndex: 'stateTxt',
      width: 130,
      hSlot: 'stateTitle',
      bSlot: 'stateTxt',
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
      bSlot: 'participantName',
    },
    {
      dataIndex: 'stayTime',
      width: 180,
      hSlot: 'stayTimeTitle',
    },
    {
      dataIndex: 'startTime',
      width: 180,
      hSlot: 'startTimeTitle',
    },
    {
      dataIndex: 'originatorName',
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName',
      width: 130,
    },
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
      width: 296,
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
      hSlot: 'finishedTimeTitle',
    },
    {
      dataIndex: 'costTime',
      width: 180,
      hSlot: 'costTimeTitle',
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
      bSlot: 'index',
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
      width: 180,
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName',
    },
    {
      dataIndex: 'departmentName',
      bSlot: 'departmentName',
      width: 180,
      hSlot: 'departmentNameTitle',
    },
  ];

  defaultExceptionColumns: any = [
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
      dataIndex: 'stayTime',
      width: 180,
      hSlot: 'stayTimeTitle',
    },
    {
      dataIndex: 'startTime',
      width: 180,
      hSlot: 'startTimeTitle',
    },
    {
      dataIndex: 'originatorName',
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName',
      width: 130,
    },
  ];

  // 所有tab按钮
  tabs: Array<any> = [];

  curKey: string = '';

  tableDataList: any[] = []; //表单列表

  get allColumns() {
    if (this.tableAllColumns) {
      return this.tableAllColumns;
    }
    return this.defaultAllColumns;
  }

  get deleteDisable() {
    return this.tableData.some((d: any) => d.checked);
  }

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
    console.log(this.tableCanceledColumns);
    if (this.tableCanceledColumns) {
      return this.tableCanceledColumns;
    }
    return this.defaultCanceledColumns;
  }

  get exceptionColumns() {
    if (this.tableExceptionColumns) {
      return this.tableExceptionColumns;
    }
    return this.defaultExceptionColumns;
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
    type: 7,
    batch: false,
    isChange: false,
  };

  currentKey: string = '';

  timeLable: string = '';

  /**
   * 滚动加载
   */
  handleInfiniteOnLoad() {
    if (this.loadingType !== 'init' || this.curPage === 1) {
      return;
    }
    this.listInstances('pageChange');
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
      if (document.getElementById('QueryInstance')) {
        (document.getElementById('QueryInstance') as any).scrollTop =
          this.scrollTop + ispeed;
      }
      if (this.scrollTop === 0) {
        clearInterval(timer);
      }
    }, 16);
  }

  changeTabShow() {
    this.isShowQueryItem = true;
  }

  /**
   * 切换tabs
   */
  changeTabs(obj) {
    // this.instanceState = obj.instanceState;
    // this.curPage = 1;
    // this.data = [];
    //  this.listInstances();
    switch (obj.instanceState) {
      case 'CANCELED':
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

    console.log(this.timeLable);
  }

  mounted() {
    this.setTabBtns();
    if (document.getElementById('QueryInstance')) {
      (document.getElementById('QueryInstance') as any).addEventListener(
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
      this.listInstances();
    }, 500);

    // window.addEventListener('resize', this.setTableMaxHeight);
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event: any) {
    if (event.source === window) {
      return;
    }
    if (
      event.data.indexOf('/workflow-center/query-instance') !== -1 ||
      event.data.indexOf('%2Fworkflow-center%2Fquery-instance') !== -1
    ) {
      this.listInstances();
    }
  }

  destroyed() {
    // window.removeEventListener('resize', this.setTableMaxHeight);
    window.removeEventListener('message', this.reloadMessage, false);
    if (document.getElementById('QueryInstance')) {
      (document.getElementById('QueryInstance') as any).removeEventListener(
        'scroll',
        this.scrollToTop,
      );
    }
  }

  /**
   * 设置tab按钮
   */
  setTabBtns() {
    this.tabs = [
      {
        label: this.$t('cloudpivot.flowCenter.pc.all'),
        value: '',
        key: 0,
      },
      {
        label: this.$t('cloudpivot.flowCenter.pc.processing'),
        value: 'PROCESSING',
        key: 1,
      },
      {
        label: this.$t('cloudpivot.flowCenter.pc.completed'),
        value: 'COMPLETED',
        key: 2,
      },
      {
        label: this.$t('cloudpivot.flowCenter.pc.canceled'),
        value: 'CANCELED',
        key: 3,
      },
      {
        label: this.$t('cloudpivot.flowCenter.pc.exception'),
        value: 'EXCEPTION',
        key: 4,
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
    this.data = [];
    // this.resetParams()
    this.listInstances('pageChange');

    setTimeout(() => {
      this.isResetFields = false;
    }, 100);
  }

  /*
   * 分页改变
   */
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.listInstances('pageChange');
  }

  /*
   * 分页pageSize改变
   */
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.listInstances('pageChange');
  }

  /*
   * 重置查询参数
   */
  resetParams() {
    this.searchParams = {
      workflowName: '',
      workflowCode: '',
      unitType: '',
      startTime: utils.timeStampToDate(
        'YY-MM-DD',
        (moment().add(-30, 'days') as any)._d,
      ),
      endTime: utils.timeStampToDate('YY-MM-DD', (moment() as any)._d),
      originator: '',
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
    this.listInstances();
  }

  /*
   * 查询条件搜索事件
   */
  onSearch(params: workflowCenterParams.ListInstancesParams) {
    this.isShowQueryItem = false;
    this.queryActive = true;
    let type: string = '';
    if (
      this.curKey === 'PROCESSING' ||
      this.curKey === '' ||
      this.curKey === 'COMPLETED' ||
      this.curKey === 'EXCEPTION'
    ) {
      type = 'processing';
    } else {
      type = 'canceled';
    }

    const vals: any = this.dataTranslateToFilterCard(params, type);
    this.queryConditionSource = vals;

    this.curPage = 1;
    this.searchParams = {
      ...params,
    };
    this.listInstances('search');
  }

  /*
   * 重新加载
   */
  reload() {
    this.listInstances();
  }

  i18nHandle(item: any) {
    switch (item.state) {
      case WorkflowCenterTypes.WorkflowInstanceState.DRAFT:
        item.stateTxt = this.$t('cloudpivot.flowCenter.pc.workflowState.draft');
        break;
      case WorkflowCenterTypes.WorkflowInstanceState.PROCESSING:
        item.stateTxt = this.$t(
          'cloudpivot.flowCenter.pc.workflowState.processing',
        );
        break;
      case WorkflowCenterTypes.WorkflowInstanceState.COMPLETED:
        item.stateTxt = this.$t(
          'cloudpivot.flowCenter.pc.workflowState.completed',
        );
        break;
      case WorkflowCenterTypes.WorkflowInstanceState.EXCEPTION:
        item.stateTxt = this.$t(
          'cloudpivot.flowCenter.pc.workflowState.exception',
        );
        break;
      case WorkflowCenterTypes.WorkflowInstanceState.CANCELED:
        item.stateTxt = this.$t(
          'cloudpivot.flowCenter.pc.workflowState.canceled',
        );
        break;
      default:
        break;
    }
    return item;
  }

  /*
   * 获取流程实例列表
   */
  async listInstances(type?: string) {
    const params = {
      ...this.searchParams,
      instanceState: this.instanceState,
      page: this.curPage - 1,
      size: 20,
    };

    // 数据处理函数
    this.dataHandler = (data: any) => {
      data.forEach((item: any, index: number) => {
        item.index = index + 1;
        item.key = index;
        item.checked = false;
        item.hover = false;
        item.departmentName = Helper.departmentNameTranslator(
          item.departmentName,
        );

        item.startTime = Helper.removeSeconds(item.startTime);
        item.finishTime = Helper.removeSeconds(item.finishTime);
        item.costTime = Helper.timeTranslate(item.costTime);
        item.stayTime = Helper.timeTranslate(item.stayTime);
        // item.state = Helper.workflowStateTranslator(item.state);

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
    const res: any = await workflowCenterApi.listInstances(params);
    this.processResult(res, type);

    // this.commonHandler(res, type)
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
            type: 7,
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
            type: 7,
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
      type: 7,
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

  /**
   * 选中列表
   */
  changeChecked(item) {
    if (item.isShow) {
      this.tableDataList = item.data;
    } else {
      this.tableDataList = item;
    }
  }

  /**
   * 批量操作
   */
  batchProcess(data) {
    switch (data.type) {
      case 'delete':
        this.batchDelete();
        break;
      default:
        break;
    }
  }

  batchDelete() {
    if (this.tableDataList.length < 1) {
      this.$message.error('请选择需要批量处理的数据');
      return;
    }
    console.log(this.tableDataList);
    this.deleteDelegation(this.tableDataList);
  }

  /*
   * 已作废批量删除
   */
  deleteDelegation(tableDataList: any) {
    const vm: any = this;
    const _ids: any = [];
    if (!Array.isArray(tableDataList)) {
      return;
    } else {
      tableDataList.forEach((item: any) => {
        _ids.push(item.id);
      });
    }
    this.$confirm({
      title: `是否确定删除${_ids.length}条作废流程`,
      okText: vm.$t('cloudpivot.flowCenter.pc.ok').toString(),
      cancelText: vm.$t('cloudpivot.flowCenter.pc.cancel').toString(),
      okType: 'danger',
      icon: () =>
        vm.$createElement('a-icon', {
          props: {
            type: 'question-circle',
            theme: 'filled',
          },
        }),
      onOk() {
        workflowCenterApi
          .deleteCanceledWorkflowInstances(_ids)
          .then((res: any) => {
            if (res.errcode) {
              vm.$message.error(
                `${vm.$t('cloudpivot.flowCenter.pc.deleteFailed')}`,
              );
              return;
            }

            vm.$message.success(
              `${vm.$t('cloudpivot.flowCenter.pc.deleteSuccess')}`,
            );
            vm.curPage = 1;
            vm.tableDataList.length = 0;
            vm.listInstances();
          });
      },
    });
  }
}
</script>

<style lang="less" scoped>
@import './style/common.less';
</style>

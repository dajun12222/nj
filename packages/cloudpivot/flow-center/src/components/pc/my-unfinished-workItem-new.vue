<template>
  <div ref="workItem" class="workitem-box my-workflow">
    <!-- 顶部信息 -->
    <div style="padding-right: 12px; z-index: 10">
      <div :class="tabs.length ? 'workitem-box-top-2' : 'workitem-box-top'">
        <PageHeader
          :headerData="headerData"
          :subTitle="$t('cloudpivot.flowCenter.pc.todoList')"
          :queryConditionSource="queryConditionSource"
          :queryActive="queryActive"
          :isOpen="isShowQueryItem"
          :noData="isShowNoData"
          :tabsList="tabs"
          :disabled="tableData.length > 0 ? false : true"
          :isShowBatchTransfer="curKey === 'transfer'"
          @batch="batchProcess"
          @search="isShowQueryItem = true"
          @changeTabs="changeTabs"
        />

        <div
          v-show="isShowQueryItem"
          class="filters-box"
          :style="{ top: tabs.length ? '78px' : '' }"
        >
          <query-workitem
            ref="queryWorkitem"
            :isShowInstanceState="false"
            :isShowOriginator="true"
            :isShowActivityName="true"
            :isShowParticipant="true"
            :isShowTimeRange="false"
            :hasTabs="true"
            @reset="onReset"
            @search="onSearch"
            @hide="isShowQueryItem = false"
          />
        </div>
      </div>
    </div>

    <!-- 待办列表 -->
    <div
      id="MyUnfinishedWorkItem"
      v-show="!isShowNoData"
      v-infinite-scroll="handleInfiniteOnLoad"
      class="content-data"
      :infinite-scroll-disabled="busy"
      :infinite-scroll-distance="10"
    >
      <PageData
        :listData="data"
        :batch="headerData.batch"
        @changeChecked="changeChecked"
        @refreshData="onReset"
      />
      <PageLoadingNew
        :loading="loadingType === 'loading'"
        :loadingText="
          loadingType === 'done'
            ? $t('cloudpivot.flowCenter.pc.showAllTodo')
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
            : $t('cloudpivot.flowCenter.pc.noDataText')
        "
      />
    </div>

    <!-- 返回顶部 -->
    <div v-if="btnFlag" class="return-top" @click="backTop">
      <i class="icon aufontAll h-icon-all-shape"></i>
    </div>

    <!-- 页面loading  -->
    <!-- <div class="loading-container" v-show="isLoading">
      <a-spin tip="加载中"></a-spin>
    </div> -->

    <!-- 批量处理弹窗 -->
    <BatchAgreeModal
      v-model="visible"
      @cancel="visible = false"
      @ok="batchAgree"
    />

    <!-- 批量处理失败弹窗 -->
    <batch-fail-list
      v-model="showBatchFailListModal"
      :listData="failListData"
      @batchRefresh="conditionReload"
    />

    <customPop
      v-model="showBatchTransfer"
      width="566px"
      height="auto"
      :zIndex="100"
      @OK="transferOK"
    >
      <template slot="title">
        {{ $t('cloudpivot.flowCenter.pc.batchTransfer') }}
      </template>
      <template slot="content">
        <div class="transfer-list">
          <label><span class="font-ele">*</span>转办人员</label>
          <div>
            <staff-selector
              v-model="transferUser"
              :options="transferUserOptions"
              displayType="plus"
            />
          </div>
        </div>
        <div class="transfer-list">
          <label><span class="font-ele">*</span>转办意见</label>
          <div>
            <a-textarea v-model="remark" placeholder="请输入" :rows="4" />
          </div>
        </div>
      </template>
    </customPop>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';

import { mixins } from 'vue-class-component';
import customPop from '../../../../form/src/common/components/customPop.vue';
import { namespace } from 'vuex-class';

import {
  Button,
  Input,
  Pagination,
  Icon,
  Checkbox,
  Tooltip,
  List,
  Spin,
} from '@h3/antd-vue';

import WorkItemMixin from './mixins/workitem';
import CommonDrawer from './components/modals/drawer.vue';
import BatchInfo from './components/modals/batch-extra-info.vue';
import BatchFailList from './components/modals/batch-fail-list.vue';
import BatchSuccessInfo from './components/modals/batch-success-info.vue';
import { workflowCenterApi } from '../../../../api';

import * as WorkflowCenterNS from './typings/workflow-center';

import * as WorkflowCenterHelper from './helper/helper';

import filterCard from '../../../../list/src/components/pc/components/filter-card/filter-card.vue';

import QueryWorkitem from './components/query-condition/query-workitem.vue';

import * as utils from '../../../../common/src/utils/pc/utils';

import common from '../../../../common/pc';

import CommonTable from './components/common-table/table.vue';
import SetTimeTypeMixin from './common/index'; //公共处理模块
import BatchAgreeModal from './components/batch-agree-modal/batch-agree-modal.vue';
const SystemModule = namespace('System/System');

import StaffSelector from '../../../../form/src/common/components/form-staff-selector/pc/staff-selector.vue';

interface PageHeaderData {
  total: number; //总数
  showTotal: number; //当前数
  type: number; //类型
  batch: boolean; //是否批量
}

@Component({
  name: 'MyUnfinishedWorkItem',
  components: {
    filterCard: filterCard,
    QueryWorkitem,
    AButton: Button,
    AInputSearch: Input.Search,
    ACheckbox: Checkbox,
    AInput: Input,
    APagination: Pagination,
    ATooltip: Tooltip,
    AIcon: Icon,
    CommonDrawer,
    BatchInfo,
    BatchFailList,
    BatchSuccessInfo,
    PageLoading: common.components.PageLoading,
    PageLoadFail: common.components.LoadFail,
    CommonTable,
    customPop,
    ATextarea: Input.TextArea,
    StaffSelector,
    BatchAgreeModal,
    PageLoadingNew: common.components.PageLoadingNew,
    PageNoData: common.components.PageNoData,
    PageData: common.components.PageData,
    PageHeader: common.components.PageHeader,
    AList: List,
    PageSelectMotail: common.components.PageSelectMotail,
    ASpin: Spin,
  },
})
export default class MyUnfinishedWorkItem extends mixins(
  WorkItemMixin,
  SetTimeTypeMixin,
) {
  @SystemModule.State('isAdmin') isAdmin: any;

  @SystemModule.State('isPrivilegedPerson') isPrivilegedPerson: any;

  /**
   * 单应用集成属性,集成时不显示title
   */
  @Prop({
    default: true,
  })
  showTitle!: boolean;

  /**
   * 单应用集成属性,集成时不显示发起流程按钮
   */
  @Prop({
    default: true,
  })
  originate!: boolean;

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

  visible: boolean = false; //批量同意显隐

  queryActive: boolean = false; //是否筛选

  tabs: any[] = [];

  curKey: string = '';

  /**
   * 设置tab按钮
   */
  setTabBtns() {
    if (this.isPrivilegedPerson || this.isAdmin) {
      this.tabs = [
        {
          label: this.$t('cloudpivot.flowCenter.pc.all'),
          value: 'all',
          key: 0,
        },
        {
          label: this.$t('cloudpivot.flowCenter.pc.systemTransfer'),
          value: 'transfer',
          key: 1,
        },
      ];
    }
  }

  @Watch('isPrivilegedPerson')
  toSetTabBtns2() {
    this.setTabBtns();
  }

  @Watch('isAdmin')
  toSetTabBtns1() {
    this.setTabBtns();
  }

  instanceState: string = 'all';

  /**
   * 切换tabs
   */
  changeTabs(obj) {
    this.headerData.batch = false;
    this.mode = 'standalone';
    this.loadingType = 'init';
    this.tabChange(obj.instanceState);
  }

  /*
   * tab页栏切换
   */
  tabChange(key: any) {
    this.queryConditionSource = [];
    this.curKey = key;
    this.curPage = 1;
    this.pageSize = 20;
    // this.isResetFields = true
    this.instanceState = key;
    this.data = [];
    this.resetParams();
    this.getUnfinishedWorkflowItems('pageChange');

    // setTimeout(() => {
    //   this.isResetFields = false
    // }, 100)
  }

  showBatchTransfer: boolean = false; // 显示批量转办弹窗

  remark: string = ''; // 转办意见

  transferUser: any[] = []; // 转办人

  transferUserOptions = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  @Watch('showBatchTransfer')
  onShowBatchTransferChange() {
    this.remark = '';
    this.transferUser = [];
  }

  async transferOK() {
    if (this.transferUser.length === 0) {
      this.$message.error('转办人员不能为空！');
      return;
    }
    if (this.remark === '') {
      this.$message.error('转办意见不能为空！');
      return;
    }
    const taskIds = [] as any;
    this.tableData.forEach(({ checked, id }) => {
      // if (checked) {
      taskIds.push(id);
      // }
    });

    const res = await workflowCenterApi.batchForwardWorkItem({
      participantors: this.transferUser.map((el) => el.id),
      workItemIds: taskIds,
      comment: this.remark,
    });

    if (res.errcode === 0) {
      this.$message.success(res.errmsg as string);
      this.showBatchTransfer = false;

      this.curPage = 1;
      this.getUnfinishedWorkflowItems();
    } else {
      this.$message.error(res.errmsg as string);
    }
  }

  headerData: PageHeaderData = {
    total: 0,
    showTotal: 0,
    type: 1,
    batch: false,
  };

  wd: string = '';

  searchParams: any = {
    workflowName: '',
    workflowCode: '',
    originator: '',
    //workflowTplName:{},
    unitType: undefined,
    appCode: this.appCode,
  };

  showBatchInfoModal: boolean = false;

  showBatchFailListModal: boolean = false;

  showBatchSuccessModal: boolean = false;

  failListData: any = {};

  isShowQueryItem: boolean = false;

  defaultTableColumns: any = [
    {
      dataIndex: 'orderNumber',
      width: 80,
      align: 'left',
      hSlot: 'indexTitle',
      bSlot: 'orderNumber',
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
      dataIndex: 'activityName',
      width: 130,
      hSlot: 'activityNameTitle',
      bSlot: 'activityName',
    },
    {
      dataIndex: 'stayTime',
      width: 300,
      hSlot: 'stayTimeTitle',
      bSlot: 'stayTime',
    },
    {
      dataIndex: 'originatorName',
      width: 100,
      hSlot: 'originatorNameTitle',
      bSlot: 'originatorName',
    },
    {
      dataIndex: 'departmentName',
      width: 170,
      hSlot: 'departmentNameTitle',
      bSlot: 'departmentName',
    },
    {
      dataIndex: 'participantName',
      width: 100,
      hSlot: 'resolverTitle',
      bSlot: 'participantName',
    },
  ];

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

  get rootAdmin() {
    return this.$store && this.$store.state.System.System.isRootAdmin;
  }

  /**
   * 选中列表
   */
  changeChecked(item: any) {
    console.log(item);
    if (Array.isArray(item)) {
      this.tableData = item;
    } else if (item.data && Array.isArray(item.data) && item.isShow) {
      this.tableData = item.data;
    } else if (!item.isShow) {
      this.tableData = [];
    } else {
      //Else Empty block statement
    }
  }

  /**
   * 批量同意确定
   */
  async batchAgree(isData) {
    const { content, resources } = isData;
    const taskIds = [] as any;
    this.tableData.forEach(({ checked, id }) => {
      taskIds.push(id);
    });
    const res = await workflowCenterApi.batchUnfinishWorkflow({
      approval: { content, resources },
      taskIds,
    });
    if (!res) {
      return;
    }
    const { errcode, data } = res;
    this.visible = false;
    if (errcode === 0 && data.failNum === 0) {
      this.onReset();
    } else if (errcode === 0) {
      const { failResults } = data;
      (data.failResults as any) = failResults.map(
        (item: any, index: number) => {
          item['orderNumber'] = index + 1;
          return item;
        },
      );
      this.failListData = data;
      this.showBatchFailListModal = true;
    } else {
      this.$message.error(res.errmsg as string);
    }
  }

  /**
   * 批量同意弹窗
   */

  batchConsent() {
    if (this.tableData.length < 1) {
      this.$message.error('请选择需要批量处理的数据');
      return;
    }
    this.visible = true;
    // this.onReset();
  }

  /**
   * 滚动加载
   */
  handleInfiniteOnLoad() {
    if (this.loadingType !== 'init' || this.curPage === 1) {
      return;
    }
    this.getUnfinishedWorkflowItems('pageChange');
  }

  /**
   * 批量操作
   */
  batchProcess(data) {
    switch (data.type) {
      case 'approve':
        this.mode = 'batch';
        this.curPage = 1;
        this.data = [];
        this.getUnfinishedWorkflowItems('pageChange');
        break;
      case 'cancel':
        this.mode = 'standalone';
        this.headerData.batch = false;
        this.queryConditionSource = [];
        this.tableData = [];
        this.reload();
        break;
      case 'agree':
        //批量同意
        this.batchConsent();
        break;
      case 'transfer':
        if (this.tableData.length < 1) {
          this.$message.error('请选择需要批量处理的数据');
          return;
        }
        this.showBatchTransfer = true;
        break;
      default:
        break;
    }
  }

  mounted() {
    (document.getElementById('MyUnfinishedWorkItem') as any).addEventListener(
      'scroll',
      this.scrollToTop,
    );
    this.setTabBtns();
    this.curKey = (this.tabs.length && this.tabs[0].value) || '';
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
      this.getUnfinishedWorkflowItems();
    }, 500);

    // window.addEventListener("resize", this.setTableMaxHeight);
    window.addEventListener('message', this.reloadMessage, false);
  }

  onReset() {
    this.isShowQueryItem = false;
    this.queryActive = false;
    this.queryConditionSource = [];
    this.resetParams();
    this.reload();
    // this.curPage = 1;
    // this.resetParams();
    // this.getMyReadWorkitem();
  }

  resetParams() {
    this.searchParams = {
      workflowName: '',
      workflowCode: '',
      originator: '',
      unitType: undefined,
      appCode: this.appCode,
    };
  }

  reloadMessage(event: any) {
    if (typeof event.data !== 'string') {
      return;
    }

    if (event.data === 'close') {
      this.onReset();
      return;
    }
    this.data = [];
    this.curPage = 1;
    this.loadingType = 'init';
    if (event.source === window) {
      return;
    }
    if (
      event.data.indexOf('/workflow-center/my-unfinished-workitem') !== -1 ||
      event.data.indexOf('%2Fworkflow-center%2Fmy-unfinished-workitem') !==
        -1 ||
      event.data === 'reload'
    ) {
      this.getUnfinishedWorkflowItems();
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
      if (document.getElementById('MyUnfinishedWorkItem')) {
        (document.getElementById('MyUnfinishedWorkItem') as any).scrollTop =
          this.scrollTop + ispeed;
      }
      if (this.scrollTop === 0) {
        clearInterval(timer);
      }
    }, 16);
  }

  destroyed() {
    // window.removeEventListener("resize", this.setTableMaxHeight);
    window.removeEventListener('message', this.reloadMessage, false);

    if (document.getElementById('MyUnfinishedWorkItem')) {
      (
        document.getElementById('MyUnfinishedWorkItem') as any
      ).removeEventListener('scroll', this.scrollToTop);
    }
  }

  // 清空关键字
  clearKeyword() {
    this.wd = '';
    this.curPage = 1;
    this.queryConditionSource = [];
    Object.keys(this.searchParams).forEach(
      (key) => (this.searchParams[key] = ''),
    );
    this.getUnfinishedWorkflowItems();
  }

  // 点击搜索
  onSearch(params) {
    this.isShowQueryItem = false;
    for (const item in params) {
      if (params[item]) {
        this.queryActive = true;
        break;
      } else {
        this.queryActive = false;
      }
    }
    const vals: any = this.dataTranslateToFilterCard(params, 'myReadWorkItem');

    /**
     * 过滤掉无效数据，TO 还不知道为什么会产生无效数据
     */
    // if (Array.isArray(vals)) {
    //   vals = vals.filter((item) => !item.content.includes("undefined"));
    // }

    this.queryConditionSource = vals;
    this.curPage = 1;
    this.searchParams = {
      ...params,
    };
    delete this.searchParams.workflowTplName;
    //this.curPage = 1;
    console.log('vals======>', vals);

    this.getUnfinishedWorkflowItems(vals.length > 0 ? 'search' : '');
  }

  // 分页改变
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.getUnfinishedWorkflowItems();
  }

  // 分页pageSize改变
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getUnfinishedWorkflowItems('pageChange');
  }

  // 打开发起流程
  startWorkflow() {
    const isAdmin = localStorage.getItem('_isAdmin') === 'true';
    if (this.rootAdmin || isAdmin) {
      // 暂时规定admin不能发起流程
      this.$message.warn('admin 不能发起流程');
      return;
    }
    this.$router.push({ name: 'startWorkflow' }).catch((err: any) => {
      console.log(err);
    });
  }

  toggleMode() {
    this.mode = this.mode === 'standalone' ? 'batch' : 'standalone';
    if (this.mode === 'batch') {
      let msg = '已为你切换至批量处理模式';
      if (this.$i18n.locale === 'en') {
        msg = 'Switch to batch processing mode';
      }
      this.$message.success(msg);
    }
    this.reload();
  }

  get batchDisable() {
    return this.tableData.some((d: any) => d.checked);
  }

  /*
   * 当checkbox选择change时事件
   */
  onItemCheckboxChange() {
    const isCheckedItems = this.tableData.filter((d: any) => d.checked);
    if (isCheckedItems.length < this.tableData.length) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
  }

  /**
   * 全选
   */
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked;
    if (isChecked) {
      this.tableData.forEach((item: any) => {
        item.checked = true;
      });
    } else {
      this.tableData.forEach((item: any) => {
        item.checked = false;
      });
    }
  }

  // 重新加载
  reload() {
    this.wd = '';
    this.curPage = 1;
    this.pageSize = 20;
    this.isSelectAll = false;
    this.getUnfinishedWorkflowItems();
  }

  conditionReload(hasFailedData?: boolean) {
    if (!this.isSelectAll || hasFailedData) {
      // 一种是没有全部选中,另一种是选中后有错误信息
      this.reload();
    } else {
      this.getBatchList().then((data: any) => {
        if (data.flag) {
          //查询条件全部完成后看非条件下的批量处理是否还有数据
          this.queryConditionSource = [];
          this.resetParams();
          this.reload();
        } else {
          this.reload();
        }
      });
    }
  }

  async getBatchList() {
    // 检测条件处理下的批量完后是否还有批量处理的数据
    const res = (await workflowCenterApi.searchWorkitems({
      wd: '', // 以前接口参数
      workflowName: '',
      workflowCode: '',
      originator: '',
      unitType: undefined,
      batchOperate: true,
      page: 0,
      size: 20,
    })) as any;
    if (res.errcode === 0 && res.data.totalElements > 0) {
      return { flag: true };
    }
    return { flag: false };
  }

  setTime(item: any) {
    if (
      item.workItemTimeoutStatus === 'NORMAL' ||
      item.workItemTimeoutStatus === 'TIMEOUT'
    ) {
      item.time = WorkflowCenterHelper.timeTranslate(item.stayTime);
    } else if (
      item.workItemTimeoutStatus === 'ORANGE' ||
      item.workItemTimeoutStatus === 'RED'
    ) {
      item.time = WorkflowCenterHelper.timeTranslate(item.remainingTime);
    } else {
      //Else Empty block statement
    }
    return item;
  }

  oldNum: number = 0;

  /**
   * 获取待办列表
   * type: search 搜索的时候内容为空展示不同的img pageChange 页码改变的时候
   * */
  async getUnfinishedWorkflowItems(type?: string) {
    this.loadingType = 'loading';
    const params = {
      ...this.searchParams,
      wd: '', //以前接口需要的参数
      // workflowName: '',
      // workflowCode: '',
      // originator: '',
      // workflowTplName:'',
      // appCode: this.appCode,
      batchOperate:
        this.mode === 'batch'
          ? this.instanceState === 'all'
            ? true
            : false
          : false,
      page: this.curPage - 1,
      size: this.pageSize,
      workItemSource: this.curKey === 'transfer' ? 1 : undefined,
    };

    this.oldNum = params.page + 1;

    // 数据处理函数
    this.dataHandler = (data: any) => {
      data.forEach((item: any, index: number) => {
        item.orderNumber = index + 1;
        item.key = index;
        item.hover = false;
        item.checked = false;
        item.isRead = item.state === WorkflowCenterNS.WorkItemStatus.INPROGESS;
        item = this.setTime(item);
        item.departmentName = WorkflowCenterHelper.departmentNameTranslator(
          item.departmentName,
        );

        // 设置高亮
        item.originatorName = utils.searchHighLight(
          this.wd,
          item.originatorName,
        );
        item.instanceName = utils.searchHighLight(
          this.searchParams.workflowName,
          item.instanceName,
        );

        // 判断是否为委托任务
        item.beTrust = item.workItemTrust ? item.workItemTrust.trust : false;
        // 判断当前用户是否为委托人
        item.currentTrustor = item.workItemTrust
          ? item.workItemTrust.currentTrustor
          : false;

        // 国际化兼容
        item = utils.compatible(item, 'activityName');
      });
      return data;
    };

    this.isShowNoData = false;
    const res = await workflowCenterApi.searchWorkitems(params);
    this.processResult(res, type);
    // this.commonHandler(res, type);  //老项目后续处理
    this.$store.dispatch('WorkflowCenterStore/getWorkCount');
  }

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
            type: 1,
            batch: this.mode === 'batch' ? this.headerData.batch : false,
          };
          return;
        }
        res.data.content.forEach((item) => {
          item.isRead =
            item.state === WorkflowCenterNS.WorkItemStatus.INPROGESS; //已读
          this.data.push(this.SetTimeType(item));
        });
      } else {
        //初始化
        this.data = res.data.content.map((item) => {
          item.isRead =
            item.state === WorkflowCenterNS.WorkItemStatus.INPROGESS;
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
            type: 1,
            batch: this.mode === 'batch' ? this.headerData.batch : false,
          };
          return;
        }
      }
      this.curPage = this.oldNum + 1;
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
        this.tipText = (
          this.mode === 'standalone'
            ? this.$t('cloudpivot.flowCenter.pc.noDataText')
            : '当前列表没有批量处理的任务，切换至单一模式'
        ) as string;
      }
    }
    this.headerData = {
      total: res.data.totalElements,
      showTotal:
        this.curPage === 1 ? res.data.content.length : this.data.length,
      type: 1,
      batch: this.mode === 'batch' ? true : false,
    };
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.tableData.forEach((item: any) => {
      item = this.setTime(item);
    });
    this.setLoadAllTxt();
    // this.setTableMaxHeight();
    this.setTabBtns();
  }
}
</script>

<style lang="less" scoped>
@import './style/common.less';

.transfer-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 10px;
  label {
    width: 114px;
    display: inline-block;
    text-align: left;
    height: 32px;
    line-height: 32px;
    .font-ele {
      color: red;
    }
  }
  & > div {
    flex: 1;
  }
}
</style>

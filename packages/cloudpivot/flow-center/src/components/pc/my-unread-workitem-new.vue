<!--
 * @Descripttion: 我的待阅-新版
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-10 16:33:04
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-04 14:43:21
-->
<template>
  <div ref="workItem" class="workitem-box">
    <!-- 顶部信息 -->
    <div style="padding-right: 12px; z-index: 10">
      <div class="workitem-box-top">
        <PageHeader
          :headerData="headerData"
          :queryConditionSource="queryConditionSource"
          :queryActive="queryActive"
          :subTitle="$t('cloudpivot.flowCenter.pc.toreadList')"
          :disabled="tableData.length > 0 ? false : true"
          :isOpen="isShowQueryItem"
          :noData="isShowNoData"
          @batch="batchProcess"
          @search="isShowQueryItem = true"
        />

        <div v-show="isShowQueryItem" class="filters-box">
          <query-workitem
            ref="queryWorkitem"
            :isShowTimeRange="false"
            :isShowOriginator="true"
            @reset="onReset"
            @search="onSearch"
            @hide="isShowQueryItem = false"
          />
        </div>
      </div>
    </div>

    <!-- 待阅列表 -->
    <div
      id="MyUnReadWorkItem"
      v-show="!isShowNoData"
      v-infinite-scroll="handleInfiniteOnLoad"
      class="content-data"
      :infinite-scroll-disabled="busy"
      :infinite-scroll-distance="10"
    >
      <PageData
        :listData="data"
        :batch="headerData.batch"
        :type="headerData.type"
        @changeChecked="changeChecked"
        @closeModal="reloadList"
      />
      <PageLoadingNew
        :loading="loadingType === 'loading'"
        :loadingText="
          loadingType === 'done'
            ? $t('cloudpivot.flowCenter.pc.showAllToRead')
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
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';

import {
  Button,
  Input,
  Pagination,
  Icon,
  Checkbox,
  Tooltip,
} from '@h3/antd-vue';

import { mixins } from 'vue-class-component';

import '../../../../common/src/config/portal/h3-form'; // 不清楚原因，否则发起人节点service null

import WorkItemMixin from './mixins/workitem';

import CommonDrawer from './components/modals/drawer.vue';

import {
  workflowCenterApi,
  // workflowCenter as workflowCenterParams,
} from '../../../../api';

import * as Helper from './helper/helper';

import * as utils from '../../../../common/src/utils/pc/utils';

import common from '../../../../common/pc';

import filterCard from '../../../../list/src/components/pc/components/filter-card/filter-card.vue';

import QueryWorkitem from './components/query-condition/query-workitem.vue';

import CommonTable from './components/common-table/table.vue';

import SetTimeTypeMixin from './common/index'; //公共处理模块

interface PageHeaderData {
  total: number; //总数
  showTotal: number; //当前数
  type: number; // 类型
  batch: boolean; //是否批量
}

@Component({
  name: 'MyUnReadWorkItem',
  components: {
    filterCard: filterCard,
    QueryWorkitem,
    ATooltip: Tooltip,
    AButton: Button,
    AInputSearch: Input.Search,
    AInput: Input,
    APagination: Pagination,
    AIcon: Icon,
    ACheckbox: Checkbox,
    CommonDrawer,
    PageLoadingNew: common.components.PageLoadingNew,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail,
    CommonTable,
    PageHeader: common.components.PageHeader,
    PageData: common.components.PageData,
  },
})
export default class MyUnReadWorkItem extends mixins(
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
    type: 2,
    batch: true,
  };

  wd: string = '';

  tableData: any[] = []; //表单列表

  searchParams: any = {
    workflowName: '',
    workflowCode: '',
    originator: '',
    workflowTplName: {},
    unitType: '',
    appCode: this.appCode,
  };

  defaultTableColumns: any = [
    {
      dataIndex: 'orderNumber',
      width: 120,
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
      dataIndex: 'sourceName',
      width: 130,
      hSlot: 'sourceNameTitle',
      bSlot: 'sourceName',
    },
    {
      dataIndex: 'startTime',
      width: 180,
      hSlot: 'startTimeTitle',
      bSlot: 'startTime',
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

  queryActive: boolean = false; //是否筛选

  isShowQueryItem: boolean = false;

  // 控制已阅按钮置灰
  isCirculateSingle: boolean = true;

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
   * 选中列表
   */
  changeChecked(item) {
    if (item.isShow) {
      this.tableData = item.data;
    } else {
      this.tableData = item;
    }
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
        this.getMyUnReadWorkItem('pageChange');
        break;
      case 'read':
        //批量已阅
        this.batchConsent();
        break;
      default:
        break;
    }
  }

  /**
   * 滚动加载
   */
  handleInfiniteOnLoad() {
    if (this.loadingType !== 'init' || this.curPage === 1) {
      return;
    }
    this.getMyUnReadWorkItem('pageChange');
  }

  /**
   * 批量已阅
   */
  batchConsent() {
    if (this.tableData.length < 1) {
      this.$message.error('请选择需要批量处理的数据');
      return;
    }
    this.updateCirculateReaded(false);
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
      if (document.getElementById('MyUnReadWorkItem')) {
        (document.getElementById('MyUnReadWorkItem') as any).scrollTop =
          this.scrollTop + ispeed;
      }
      if (this.scrollTop === 0) {
        clearInterval(timer);
      }
    }, 16);
  }

  mounted() {
    if (document.getElementById('MyUnReadWorkItem')) {
      (document.getElementById('MyUnReadWorkItem') as any).addEventListener(
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
      this.getMyUnReadWorkItem();
    }, 500);

    this.$store.dispatch('WorkflowCenterStore/getWorkCount');

    // window.addEventListener('resize', this.setTableMaxHeight);
    window.addEventListener('message', this.reloadMessage, false);

    this.$message.config({
      maxCount: 1,
      duration: 2,
    });
  }

  reloadMessage(event: any) {
    if (event.data === 'close') {
      this.onReset();
      return;
    }
    if (event.source === window) {
      return;
    }
    if (
      event.data.indexOf('/workflow-center/my-unread-workitem') !== -1 ||
      event.data.indexOf('%2Fworkflow-center%2Fmy-unread-workitem') !== -1
    ) {
      this.getMyUnReadWorkItem();
      this.$store.dispatch('WorkflowCenterStore/getWorkCount');
    }
  }

  destroyed() {
    // window.removeEventListener('resize', this.setTableMaxHeight);
    window.removeEventListener('message', this.reloadMessage, false);
    if (document.getElementById('MyUnReadWorkItem')) {
      (document.getElementById('MyUnReadWorkItem') as any).removeEventListener(
        'scroll',
        this.scrollToTop,
      );
    }
    this.$message.destroy();
  }

  // 全选
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked;

    if (isChecked) {
      this.tableData.forEach((item: any, index: number) => {
        item.isChecked = true;
      });
      this.isCirculateSingle = false;
    } else {
      this.tableData.forEach((item: any, index: number) => {
        item.isChecked = false;
      });
      this.isCirculateSingle = true;
    }
  }

  onItemCheckboxChange() {
    const isCheckedItems = this.tableData.filter((d: any) => d.isChecked);
    if (isCheckedItems.length > 0) {
      this.isCirculateSingle = false;
    } else {
      this.isCirculateSingle = true;
    }
    if (isCheckedItems.length < this.tableData.length) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
  }

  // 清空关键字
  clearKeyword() {
    this.wd = '';
    this.curPage = 1;
    this.getMyUnReadWorkItem();
  }

  // 点击搜索
  onSearch(params) {
    this.isShowQueryItem = false;
    this.queryActive = true;
    const vals: any = this.dataTranslateToFilterCard(params, 'myReadWorkItem');

    /**
     * 过滤掉无效数据，TO 还不知道为什么会产生无效数据
     */
    // if(Array.isArray(vals)){
    //   vals = vals.filter(item=> !item.content.includes('undefined'));
    // }

    this.queryConditionSource = vals;
    this.curPage = 1;
    this.searchParams = {
      ...params,
    };
    this.getMyUnReadWorkItem(vals.length > 0 ? 'search' : '');
  }

  onReset() {
    this.isShowQueryItem = false;
    this.queryActive = false;
    this.queryConditionSource = [];
    this.resetParams();
    this.reload();
  }

  resetParams() {
    this.searchParams = {
      workflowName: '',
      workflowCode: '',
      originator: '',
      unitType: '',
      appCode: this.appCode,
    };
  }

  // 分页改变
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.getMyUnReadWorkItem('pageChange');
  }

  // 分页pageSize改变
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getMyUnReadWorkItem('pageChange');
  }

  // 重新加载
  reload() {
    this.wd = '';
    this.curPage = 1;
    this.pageSize = 20;

    this.getMyUnReadWorkItem();
  }

  /**
   * 获取待办列表
   * type: search 搜索的时候内容为空展示不同的img
   *       pageChange 页码改变的时候
   * */
  async getMyUnReadWorkItem(type?: string) {
    this.loadingType = 'loading';
    const params = {
      ...this.searchParams,
      page: this.curPage - 1,
      size: this.pageSize,
      appCode: this.appCode,
    };

    // 重置全选、删除按钮
    this.isSelectAll = false;
    this.isCirculateSingle = true;

    // 数据处理函数
    this.dataHandler = (data: any) => {
      // 生成key 以及序号
      data.forEach((item: any, index: number) => {
        item.orderNumber = index + 1;
        item.key = index;
        item.isChecked = false;
        item.departmentName = Helper.departmentNameTranslator(
          item.departmentName,
        );
        item.startTime = Helper.removeSeconds(item.startTime);

        // 设置高亮
        item.originatorName = utils.searchHighLight(
          this.wd,
          item.originatorName,
        );
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
    const res = await workflowCenterApi.searchCirculates(params);
    this.processResult(res, type);

    // this.commonHandler(res, type);  //老项目的数据处理
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
            type: 2,
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
            type: 2,
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
      type: 2,
      batch: true,
    };
  }

  /**
   * 更新已阅
   * isCirculateAll true 批量 false 一条或者多条
   * */
  async updateCirculateReaded(isCirculateAll: boolean) {
    const ids: string[] = [];
    if (!isCirculateAll) {
      // 一条或者多条
      this.tableData.forEach((item: any) => {
        ids.push(item.id);
      });
    }
    const params: any = { circulateItemIds: ids };

    const res = await workflowCenterApi.updateCirculateReaded(params);
    this.isSelectAll = false;
    if (res.errcode === 0) {
      this.$message.success(
        this.$t('languages.common.tip.operationSucceed') as string,
      );
      // 重新获取一下列表
      this.backTop();
      this.curPage = 1;
      this.pageSize = 20;
      this.loadingType = 'init';
      this.getMyUnReadWorkItem();

      // 重新获取一下消息数
      this.$store.dispatch('WorkflowCenterStore/getWorkCount');
      this.tableData = [];
    } else {
      this.$message.error(
        this.$t('languages.common.tip.operationFailed') as string,
      );
    }
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setLoadAllTxt();
    // this.setTableMaxHeight();
  }

  reloadList() {
    this.getMyUnReadWorkItem();
    this.$store.dispatch('WorkflowCenterStore/getWorkCount');
  }
}
</script>

<style lang="less" scoped>
@import './style/common.less';
</style>

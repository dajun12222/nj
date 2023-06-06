import {
  Button,
  Checkbox,
  Icon,
  Modal,
  Pagination,
  Table,
  Tooltip,
} from '@h3/antd-vue'; // todo
import H3PrintRuntime from '@h3print/runtime';
// 挂载给钩子
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import {
  Component,
  Emit,
  Prop,
  Provide,
  Vue,
  Watch,
  Inject,
} from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { listApi, formApi, listParams } from '../../../../../api';
import common from '../../../../../common/pc';
import PageSelectMotail from '../../../../../common/src/components/pc/page-select-motail/page-select-motail.vue';
import '../../../../../common/src/config/portal/h3-form';
import { renderer } from '../../../../../form';
import Bus from '../../../../../form/utils/bus';
import { QueryActionTypes } from '../../../../../h3-list/src/core/schema/basic/enums';
import listEventHooksHandler from '../../../../../list/src/components/listCustom/eventHooks/handler';
import { DataItemType } from '../../../../../list/src/typings/data-items';
import * as platform from '../../../../../platform';
import columnSetting from '../components/column-setting.vue';
import DataExport from '../components/data-export.vue';
import filterCard from '../components/filter-card/filter-card.vue';
import FontSetting from '../components/font-setting/font-setting.vue';
import FormMarking from '../components/form-marking-view.vue';
import ImportErrModal from '../components/import-modal/index.vue';
import DataImportStatus from '../components/import/data-import-status.vue';
import DataImport from '../components/import/data-import.vue';
import DataUpload from '../components/import/data-upload.vue';
import ModelTableImport from '../components/model-table-import/import.vue';
import ModifyOwner from '../components/modify-owner.vue';
import PrintQrcode from '../components/print-qrcode.vue';
import PrintTemplateList from '../components/print-template-list.vue';
// 自定义模板 --end
import QueryForm from '../components/queryForm/query-form_new2.vue';
import TreeQueryForm from '../components/tree-query-form.vue';
import GenerateHtml from '../GenerateHtmlForm.vue';
import * as Helper from '../helper/helper';
import queryConditionHelper from '../helper/query-conditions';
import * as queryConditionTypings from '../helper/query-conditions.typings';
// 自定义模板 --start
import listCustomTemplate from '../listCustomTemplate.vue';
import printHtml from '../printHTML.vue';
import TempPrintHtml from '../TempPrintHTMLForm.vue';
import * as AllTypes from './all.typings';
import batchUpdate from './batch_update.vue';
import onActionClick from './onActionClick';
import printFormCode from './printFormCode';
import printQrCode from './printQrcode';
import columnWidthRecord from './recordColunmWidth';
import zhToEn from '../locales/zhToEn';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

import { viewRegister } from '../../../../utils/register';

import IframeModal from '../../../../../flow-center/src/components/pc/components/iframe-modal/iframe-modal.vue';

import customButtonModal from '../customButtonModal.vue';
import OAuthApi from '@/apis/oauth';
import { workflowApi } from 'cloudpivot/api';
import { formatVal } from 'cloudpivot/list/src/components/pc/components/queryForm/query-form-util';

const GanttView = (viewRegister.getAssets() as any).GanttView;
@Component({
  name: 'app-list',
  components: {
    sheet: () =>
      import(
        /* webpackChunkName: "sheet" */ '../../../../../form/src/renderer/components/pc/form-sheet/sheet.vue'
      ),
    ImportErrModal,
    listCustomTemplate, //: () => import(/* webpackChunkName: "listCustomTemplate" */"../listCustomTemplate.vue"), // 模板抽离
    printHtml,
    columnSetting: columnSetting,
    filterCard: filterCard,
    AButton: Button,
    AModal: Modal,
    ATable: Table,
    APagination: Pagination,
    ACheckbox: Checkbox,
    AIcon: Icon,
    ATooltip: Tooltip,
    FontSetting,
    // DataImport: list.components.DataImport,
    // DataUpload: list.components.DataUpload,
    // DataImportStatus: list.components.DataImportStatus,
    // QueryForm: list.components.QueryForm,
    // DataExport: list.components.DataExport,
    // PrintQrcode: list.components.PrintQrcode,
    QueryForm,
    TreeQueryForm,
    DataUpload,
    DataImport,
    DataImportStatus,
    DataExport,
    PrintQrcode,
    PrintTemplateList,
    ModifyOwner,
    GenerateHtml,
    TempPrintHtml,
    PageNoData: common.components.PageNoData,
    PageLoading: common.components.PageLoading,
    PageLoadFail: common.components.LoadFail,
    FormMarking,
    ModelTableImport,
    batchUpdate,
    H3PrintRuntime,
    PageSelectMotail,
    GanttView,
    IframeModal,
    customButtonModal,
  },
  beforeRouteEnter(to, from, next) {
    console.log('进入路由');
    next((vm) => {
      (vm as any).onRouteChange(to, from);
    });
  },
})
export default class AppList extends Vue {
  @WorkflowCenterModule.State('applicationPageTitle') applicationPageTitle: any; //游览器上方title

  @WorkflowCenterModule.Action('getDataItemList') getDataItemList: any; //获取数据项列表

  @WorkflowCenterModule.State('dataItemList') dataItemList: any; //数据项列表

  @WorkflowCenterModule.State('importIcon') importIcon: any; //导出icon是否显示的状态

  @WorkflowCenterModule.Mutation('setImportIcon') setImportIcon: any; //控制是否展示导出icon

  axios: any = axios; // 挂载给钩子

  @Prop({
    default: true,
  })
  showTitle!: boolean;

  @Prop() offset!: number; // 集成到钉钉的垂直方向偏移量

  @Prop({ default: false }) isSPA!: boolean;

  isShow: boolean = false;

  showDeleteDetail: boolean = false; //删除详情弹框显示状态

  deleteColumns = [
    {
      title: '序号',
      dataIndex: 'seq',
      width: 60,
    },
    {
      title: '数据名称',
      scopedSlots: { customRender: 'name' },
      width: 176,
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      width: 216,
    },
    {
      scopedSlots: { customRender: 'relativeModel' },
      width: 297,
      slots: { title: 'relativeModelTitle' },
    },
  ]; //删除详情列表头

  dataScopeType = 4; // 搜索范围可选项

  sortByDirect: string = 'asc'; // 列表视图排序所需的字段

  childSchemas: any = {};

  queryDefaultValues: any = {};

  filterObjectId = '';

  isShowGanttTable: boolean = true; //甘特图下表格列表是否显示

  flatedListData: any = []; //平铺列表数据

  filterFixed: boolean = false; //查询条件样式展示方式：true固定、false悬浮

  queryTime: number = new Date().getTime(); //当前时间

  workflowAdminManageAuthotity: any = false; //流程编辑权限

  //监听加载过渡动画变化
  @Watch('isLoading')
  isLoadingChange(value) {
    if (this.queryPresentationType === 'GANTT' && !value) {
      this.$nextTick(() => {
        this.resizeGanttTable();
      });
    }
  }

  //手动调节表格视图宽度
  resizeGanttTable() {
    const resize: any = document.getElementById('gantt-resize');
    const left: any = document.getElementById('ganttTable');
    const ganttTableBox: any = document.getElementById('ganttTableBox');
    resize.onmousedown = function (e) {
      const startX = e.clientX;
      const resizeLeft = resize.offsetLeft;
      document.onmousemove = function (e) {
        const endX = e.clientX;
        let moveLen = resizeLeft + (endX - startX);
        //列表最小宽度
        if (moveLen < 120) {
          moveLen = 120;
        }

        //列表最大宽度，甘特图最小宽度为680
        if (ganttTableBox.offsetWidth - moveLen < 680) {
          moveLen = ganttTableBox.offsetWidth - 680;
        }

        resize.style.left = String(moveLen);
        left.style.width = moveLen + 'px';
      };
      document.onmouseup = function (evt) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
      return false;
    };
  }

  /**
   * 切换表格隐藏显示
   */
  ganttTableShowChange() {
    this.isShowGanttTable = !this.isShowGanttTable;
    const left: any = document.getElementById('ganttTable');
    if (this.isShowGanttTable) {
      left.style.width = '50%';
    } else {
      left.style.width = '0px';
    }
  }

  deleteData: any[] = []; //被选中即将删除的所有数据

  pageDeleteData: any[] = []; //查看删除详情需展示的删除数据

  pageSizeParams: any = {
    page: 1,
    size: 10,
  }; //删除详情弹框表格中页码参数

  //应用层级目录
  get appNameList() {
    return this.$store.state.WorkflowCenter.WorkflowCenter.appNameList;
  }

  //当前vue对象
  get pageVM() {
    return this;
  }

  @Watch('appNameList')
  closeFilter() {
    this.isShowFilterBox = false;
  }

  //点击删除详情弹框中翻页触发
  pageChange(page, pageSize) {
    this.pageSizeParams.page = page;
    this.pageDeleteData = this.deleteData.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );
  }

  //删除详情弹框调整每页显示的条数
  showSizeChange(current, size) {
    this.pageDeleteData = this.deleteData.slice(
      (current - 1) * size,
      current * size,
    );
  }

  //点击删除数据弹框中查看详情触发，获取删除数据的名称
  getDeleteDataName() {
    this.deleteData.forEach((item) => {
      item.name = this.treeDataFindId(this.dataSource, item.id).name;
    });
  }

  updateVisible: boolean = false; //批量修改弹框状态

  //关闭打开批量修改弹框
  updateVisibleChange(val) {
    this.updateVisible = val;
  }

  //批量修改后刷新页面
  async updateOver() {
    await this.reload();
    this.getQueryList('getConfig');
  }

  // 获取已选中的列表数据id
  get objectIds() {
    let objectIds: any = [];
    if (
      this.modelType === 'TREE' ||
      (this.queryPresentationType === 'GANTT' &&
        this.listConfig.queryGanttModel.levelPropertyCode)
    ) {
      objectIds = this.treeCheck;
    } else {
      this.checkeds.forEach((c: boolean, index: number) => {
        if (c) {
          objectIds.push(this.dataSource[index].id);
        }
      });
    }
    return objectIds;
  }

  //批量修改按钮是否为禁用状态
  get isCheckedWorkFlow() {
    const checked: any[] = [];
    this.checkedWorkflows = [];
    if (this.modelType === 'TREE') {
      for (let i = 0; i < this.treeCheck.length; i++) {
        checked.push(this.checkToData(this.dataSource, this.treeCheck[i]));
      }
    } else {
      this.checkeds.forEach((c: boolean, index: number) => {
        if (c) {
          checked.push(this.dataSource[index]);
          if (this.dataSource[index].workflowInstanceId !== '--') {
            this.checkedWorkflows.push(this.dataSource[index].id);
          }
        }
      });
    }
    console.log(checked);
    return checked.every(
      (el: any) =>
        el.workflowInstanceId !== '--' && el.workflowInstanceId !== undefined,
    );
  }

  //树形表单选中的id值转换变成data完整的数据(转换一条)
  checkToData(dataSource, treeCheckid) {
    let obj: any = {};
    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].id === treeCheckid) {
        obj = dataSource[i];
        break;
      } else {
        if (dataSource[i].t__children_) {
          obj = this.checkToData(dataSource[i].t__children_, treeCheckid);
        }
        if (JSON.stringify(obj) !== '{}') {
          break;
        }
      }
    }
    return obj;
  }

  checkedWorkflows: Array<string> = []; // 保存选中的数据中的流程表单id

  // 批量更新数据
  get updateOptions() {
    const { queryCode } = this.$route.query;
    return {
      visible: this.updateVisible,
      checkeds: this.objectIds,
      queryCode: this.curListCode,
      schemaCode: this.schemaCode,
      checkedWorkflows: this.checkedWorkflows,
      sheetCode: this.sheetCode,
    };
  }

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  get showUploadModel() {
    return this.isInitView;
  }

  get showImportModel() {
    return this.isImporting;
  }

  get showImportStatus() {
    return (
      !this.isImporting &&
      !this.isInitView &&
      this.importStatus !== listParams.ImportResult.Unspecified
    );
  }

  get showConfirmButton() {
    return (
      this.importStatus === listParams.ImportResult.DataNumExceed ||
      this.importStatus === listParams.ImportResult.DataColumnError ||
      this.importStatus === listParams.ImportResult.PartialSuccess
    );
  }

  get showReImportButton() {
    return this.importStatus === listParams.ImportResult.SystemError;
  }

  get showCancelButton() {
    return (
      this.isInitView ||
      this.importStatus === listParams.ImportResult.SystemError
    );
  }

  get schemaCode() {
    const { schemaCode } = this.$route.params;
    return schemaCode;
  }

  get recordKey() {
    const code: string = this.curListCode;
    return `${code}_width_records`;
  }

  get columnsOptsKey() {
    const code: string = this.curListCode;
    return `${code}_columns_options`;
  }

  // 删除按钮置灰状态
  get deleteDisabled() {
    if (
      this.modelType === 'TREE' ||
      (this.queryPresentationType === 'GANTT' &&
        this.listConfig.queryGanttModel.levelPropertyCode)
    ) {
      return this.treeCheck.length !== 0;
    } else {
      return this.checkeds.some((c: boolean) => c);
    }
  }

  // 是否展示留痕ICON
  get formTrackPermission() {
    console.log('queryActions===>', this.queryActions);
    const show: boolean = this.queryActions.some(
      (item: any) =>
        item &&
        (item.actionCode === 'form_track' || item.actionCode === 'FORM_TRACK'),
    );
    sessionStorage.setItem('formTrack', show.toString());
    return show;
  }

  relevanceDataList = []; //关联表单数据列表

  showImportErrModal: boolean = false;

  isLoading: boolean = true; // 是否显示加载中

  tableLoading: boolean = false; // 表格加载中

  eventHooksHandler: any = null; // 自定义脚本相关

  customStyle: string = '';

  isRenderingReady: boolean = false; //视图数据渲染的状态

  isShowTableBox: boolean = false; // 是否显示表格

  isShowTable: boolean = false;

  isShowLoadFailBox: boolean = false; // 加载失败

  isShowLoadAll: boolean = false; // 记载完全部

  isShowNoData: boolean = false; // 加载无数据

  isShowSearchNoData: boolean = false; // 搜索无数据

  curTitle: string = ''; //模型下视图的标题

  curTitleNameI18n: any = {}; //模型下视图的标题含中英文

  visible: boolean = false; //导入弹框显示状态

  isInitView: boolean = true;

  isUploading: boolean = false;

  canImport: boolean = false;

  isImporting: boolean = false;

  importPercent: number = 0;

  importStatus: listParams.ImportResult = listParams.ImportResult.Unspecified; //导入数据时导入的状态

  secondSuccessNum = 0;

  secondFailNum = 0;

  secondImportStatus: listParams.ImportResult =
    listParams.ImportResult.FaileReImport;

  isImportEnd: boolean = false;

  showDataExport: boolean = false; //到处弹框的显示状态

  checkedLength: number = 0; //传入打印二维码弹框中打印的信息条数

  showPrintQrcode: boolean = false; //打印二维码弹框显示状态

  successNum: number = 0; //导入成功的条数

  errorMsg: string = ''; //导入失败报错信息

  failNum: number = 0; //导入excel表格总条数

  importSize: number = 0; //导入文件大小

  importFileName: string = ''; //导入文件的名称

  importrQueryField: string = '';

  // 表头固定
  scrollY: number = 0;

  scrollX: number = 0;

  cusColumns: Array<any> = []; //自定义列去除序号和摘要

  firstLoad: boolean = true; //标识初次加载列表

  columnSlots: any = {}; //自定义列表头插槽

  rowSlots: any = {}; //自定义表体插槽

  rows: any = []; //旧版表单行数据

  showColumnSetting: boolean = false; //设置弹框显示状态

  defaultColums: any = []; //保持列表头原始数据

  sheetCode: string = ''; // 批量打印二维码按钮绑定表单编码

  associationCode: string = ''; //表单code

  queryFormValues: any = ''; // 查询条件再赋值

  adaptWidth: boolean = false;

  isShowFilterBox: boolean = false; //是否显示查询条件弹框

  queryActive: boolean = false; //是否筛选

  columns: any[] = []; //列表表头数据

  dataSource: any[] = []; //表格的总数据

  userListData: any; //有自定义接口时表格的总数据

  queryActions: any[] = []; //操作按钮总数居

  extend1: string | null = null; //导出附件是否以链接的形式

  queryConditions: Array<listParams.QueryConditions> = [];

  subQueryformConditions: any = {};

  visibleQueryConditions: Array<listParams.QueryConditions> = [];

  queryPresentation: object | null = null;

  total: number = 100;

  pageSize: number = 20;

  curPage: number = 1;

  // 分页配置项
  pageSizeOptions: string[] = ['10', '20', '50', '100', '200', '300', '500'];

  filterData: Array<listParams.Filters> = [];

  // 是否全选
  isSelectAll: boolean = false;

  // 导出按钮置灰状态
  exportDisabled: boolean = false;

  // 删除按钮权限
  canDelete: boolean = false;

  isShowPdf: boolean = false; // 是否展示pdf

  pdfUrl: string = '';

  srcdoc: string = '';

  opts: any = {};

  // 列表显示字段
  queryColumns: any = [];

  checkeds: any = [];

  queryConditionSource: any = []; // 查询条件展示数组

  isDingTalk: any = true;

  showQueryHeaderList: boolean = false;

  queryHeaderList: any = [];

  curListCode: string = '';

  showIcon: boolean = false;

  importData: any = {
    headColumns: [],
    secondImportData: [],
    queryField: '',
  };

  tableConfig: any = {
    version: '2.0',
    presentationType: 'table',
    keepInOldVersion: false,
    fixedHeader: true,
    fixedLeftColumns: ['__ordinalNo'],
    fixedRightColumns: [''],
    columnResizable: true,
    rowOrdinal: true,
    rowSelectable: false,
    scrollbarAutoHidding: false,
  };

  //数值汇总数据
  numberData: any = '';

  exportFileId: string = '';

  noPermissionTotal: number = 0;

  printFormArr: any = [];

  printHtmlCloseLoading: any = '';

  isPrintGenerateHtml = false;

  draftAttributesJson: any[][] = [];

  draftAttributesJsonSet: any = [];

  formdata: any = null;

  formControls: any = [];

  tempPrintEleNumber = 0; // 临时打印元素数量

  tempPrintEleArray: any[] = []; // 不确定高度 需临时打印元素集合

  tempPrintPageSettings: any = '';

  collectorTempPrintContainer: any = {
    _num: 0,
  };

  toShowPrints: boolean = false;

  printBtnListStyle = {}; // 打印按钮下拉框 样式

  printTempList: any = [];

  moreActions: any[] = [];

  checkedMoreActions: any[] = [];

  listType: string = 'import';

  is_show_print: boolean = false;

  queryPresentationType: string = 'LIST'; //视图类型：列表LIST、甘特图GANTT

  $refs: any = {
    tableListview: null,
    tableCalendar: null,
    tableTimeline: null,
    tableGantt: null,
    tableFilter: null,
    tableHeader: null,
    tableAction: null,
  };

  ganttPreRelate: any = []; //甘特图依赖数据

  loadDatas: any = {}; //表单数据

  customWidth: any = ''; //列表容器宽度

  customButtons: any; //自定义按钮集合

  customButtonsRow: any = ''; //行按钮

  customBtnContent: any = []; //列表数据

  visibleOpen: boolean = false; //自定义按钮查看列表弹框显示状态

  customButtomModalCode: string = ''; //自定义按钮查看列表中模型的code

  viewCodeCustom: string = ''; //自定义按钮列表视图code

  //用于临时存取甘特图树形展开时获取的下层数据
  asyncTreeDataGantt: any = {};

  @Watch('canDelete')
  updateTableConfig(val) {
    this.tableConfig.rowSelectable = val;
  }

  /**
   *
   * 筛选搜索
   */
  searchWorkitems(e) {
    console.log('开始搜索=====>', e);
  }

  changeFilterFixed(value: boolean = false) {
    this.filterFixed = value;
  }

  /**
   * 隐藏导出icon
   * 显示导出记录
   */
  hideImportIcon() {
    this.showDataExport = true;
    this.listType = 'showList';
    this.setImportIcon(false);
  }

  /**
   * 点击关闭导出记录时，重置控制变量
   */
  hideShowList() {
    this.showDataExport = false;
    this.listType = 'import';
  }

  zhToen: any = {};

  getWindowInfo() {
    const customObj = document.getElementById('list-table-body');
    if (customObj) {
      this.customWidth = customObj.offsetWidth;
    }
  }

  created() {
    if (
      this.$route.name === 'appList' &&
      this.$route.path.indexOf('/app-list') !== -1
    ) {
      // 单应用
      this.getListConfigData();
    }
    window.addEventListener('resize', this.getWindowInfo);
    this.zhToen = zhToEn;
    Bus.$on('startToPrintBatch', (res: any) => {
      let { templateData, packageArr, loadingFn } = res;
      try {
        const runtimePrint = new H3PrintRuntime(templateData, packageArr);
        if (loadingFn) {
          loadingFn();
          loadingFn = null;
        }
        runtimePrint.printPreview();
      } catch (err) {
        if (loadingFn) {
          loadingFn();
          loadingFn = null;
        }
      }
    });
    this.getQueryHeaders();
    document.addEventListener('click', this.clickBatchPrintOut, true);
    let userStr = window.sessionStorage.getItem('user');
    let str = '';
    if (userStr && JSON.parse(userStr)) {
      let user = JSON.parse(userStr);

      let params = this.$route.params;

      this.is_show_print =
        user.backApp.indexOf(params.appCode) > -1 ? true : false;
    }
  }

  mounted() {
    const records: string = window.localStorage.getItem(
      this.recordKey,
    ) as string;
    this.adaptWidth = !!records;

    document.title = `奥哲云枢-${this.applicationPageTitle}` || '奥哲云枢';

    const shortName = this.$store.state.themsConfig.name;
    if (shortName && document.title.indexOf('奥哲云枢') !== -1) {
      document.title = document.title.replace('奥哲云枢', shortName);
    }

    this.$message.config({
      maxCount: 1,
      duration: 2,
    });
    // 接收消息
    window.addEventListener('message', this.reloadMessage, false);

    // 监控视口变化
    window.addEventListener('resize', this.setTableMaxHeight, false);
  }

  destroyed() {
    window.removeEventListener('message', this.reloadMessage, false);
    window.removeEventListener('resize', this.setTableMaxHeight);
    window.removeEventListener('click', this.clickBatchPrintOut, true);

    this.$message.destroy();

    Bus.$destroy();

    // 销毁挂载器
    if (this.eventHooksHandler) {
      this.eventHooksHandler.destroy();
      this.eventHooksHandler = null;
    }
  }

  /**
   * 过滤字段列表
   * 如果选择了子表，只对子表中字段进行筛选
   */
  filterColumns(keyword, chooseSheet) {
    //筛选之后将字段设置为false，显示字段组件中过滤显示
    if (!chooseSheet) {
      this.columns = this.columns.map((item) => {
        if (item.vcTitle.indexOf(keyword) > -1) {
          item.queryShow = true;
        } else {
          item.queryShow = false;
        }
        return item;
      });
    } else {
      this.columns.forEach((item) => {
        if (item.propertyType === 8) {
          item.initChildColumns = item.initChildColumns.map((el) => {
            if (el.vcTitle.indexOf(keyword) > -1) {
              el.queryShow = true;
            } else {
              el.queryShow = false;
            }
            return el;
          });
        }
      });
    }
  }

  clickBatchPrintOut(e: any) {
    // if (this.$refs.printBatchShow && this.$refs.printBatchShow[0] && !this.$refs.printBatchShow[0].contains(e.target)) {
    //   this.toShowPrints = false;
    // }
  }

  onCheck(checkeds: boolean[]) {
    this.checkeds = checkeds;
  }

  treeCheck: any = [];

  onTreeCheck(checkeds: string[]) {
    console.log(checkeds, 'checkedscheckedscheckeds--------------');

    this.treeCheck = checkeds;
  }

  /**
   * 展示搜索条件
   */
  toggleQueryConditions() {
    // 清空未确定的值
    const queryForm = this.$refs.queryForm;
    if (queryForm) {
      (queryForm as any).backWriteData(this.queryFormValues);
    }
    this.isShowFilterBox = !this.isShowFilterBox;
  }

  /**
   * 展示项设置弹窗
   */
  columnSetting() {
    this.showColumnSetting = true;
  }

  /*
   * 获取已点亮视图列表
   */
  async getQueryHeaders() {
    this.showQueryHeaderList = false;
    this.showIcon = false;
    const { schemaCode } = this.$route.params;
    let theQueryCode = '';
    const { queryCode, pcUrl } = this.$route.query;
    if (pcUrl) {
      const index = (pcUrl as string).indexOf('&queryCode=');
      if (index >= 0) {
        theQueryCode = (pcUrl.slice(index) as string).split('=')[1];
        console.log(queryCode);
      }
    }
    theQueryCode = theQueryCode || (queryCode as string);
    if (!schemaCode) {
      this.getQueryHeaders();
      return;
    }
    const params = {
      schemaCode,
      clientType: listParams.QueryClientType.PC,
    };
    const res = await listApi.getQueryHeaders(params);
    if (res.errcode === 0 && Array.isArray(res.data)) {
      res.data.forEach((item: any) => {
        common.utils.compatible(item, 'name');
      });
      this.queryHeaderList = res.data;
      this.curListCode = theQueryCode || (res.data[0] ? res.data[0].code : '');
      this.showIcon = res.data.length > 1;

      // 获取数据项列表
      await this.loadData({
        code: theQueryCode || res.data[0].code,
        schemaCode: schemaCode || res.data[0].schemaCode,
        source: 1,
      });
    }

    // this.getDataItem().then(() => {
    //   return this.getListConfigData();
    // });
  }

  /*
   * 改变应用列表展示视图
   */
  async changeListView(list: any) {
    this.curListCode = list.code;
    this.showQueryHeaderList = false;
    this.isRenderingReady = false;
    this.isShowFilterBox = false;
    this.resetView();

    this.loadData().then(() => {
      this.getQueryList('getConfig');
    });
    // this.getDataItem().then(() => {
    //   return this.getListConfigData();
    // });

    // 改变视图也会触发 onLoad 和 onRendered
    // .then(()=>{
    //   if ( !this.eventHooksHandler ) {
    //     this.$nextTick(()=>{
    //       this.eventHooksHandler.exec('onLoad');
    //     });
    //   }
    // })
  }

  async loadData(param?: any) {
    // 并行获取数据
    const reqs = [this.getDataItem(), await this.getListConfigData(param)];
    return Promise.all(reqs).then((results) => {
      return results[1];
    });
  }

  /*
   * 获取数据项列表
   */
  getDataItem() {
    return new Promise((resolve) => {
      const { schemaCode } = this.$route.params;
      const params = {
        schemaCode,
      };
      try {
        this.getDataItemList(params).finally(() => {
          // @ts-ignore
          resolve();
        });
      } catch (error) {
        this.getDataItemList(params).finally(() => {
          // @ts-ignore
          resolve();
        });
      }
    });
  }

  /*
   * 新增按钮打开新窗口新增表单后，关闭页面原列表刷新
   */
  reloadMessage(event: any) {
    // console.log(event, 'e------');
    if (event.data === 'close') {
      this.showIframeForm = false;
      this.IframeFormUrl = '';
      this.getQueryList('append');
      return;
    }
    if (event.data === 'reload') {
      this.getQueryList('append');
      return;
    }
    if (event.source === window) {
      return;
    }
    if (
      event.data.indexOf('/application') !== -1 ||
      event.data.indexOf('%2Fapplication') !== -1
    ) {
      this.showIframeForm = false;
      this.IframeFormUrl = '';
      // 如果是新增动作,
      if (event.data.indexOf('iframeAction=add') >= 0) {
        this.showIframeForm = false;
        this.IframeFormUrl = '';
        this.getQueryList('append');
      } else {
        this.getQueryList('reload');
      }
    }
  }

  /*
   * 动态计算表格的最大高度
   */
  setTableMaxHeight() {
    this.$nextTick(() => {
      const table = this.$refs.table as HTMLElement;
      const tbody: HTMLElement = document.querySelector(
        '.sheet__body',
      ) as HTMLElement;
      if (tbody) {
        tbody.style.maxHeight = `${table.clientHeight - 45}px`;
      }
    });
  }

  /**
   * 表格滚动条展示
   */
  setTableScroller() {
    this.$nextTick(() => {
      const tableBody: HTMLElement = document.querySelector(
        'div.table',
      ) as HTMLElement;
      if (!tableBody) {
        return;
      }
      tableBody.onmouseenter = function () {
        tableBody.className = 'table active';
      };

      tableBody.onmouseleave = function () {
        tableBody.className = 'table';
      };
    });
  }

  /*
   * 全选
   */
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked;

    if (isChecked) {
      this.dataSource.forEach((item: any, index: number) => {
        item.isChecked = true;
      });
    } else {
      this.dataSource.forEach((item: any, index: number) => {
        item.isChecked = false;
      });
    }
  }

  /*
   * 当checkbox选择change时事件
   */
  onItemCheckboxChange() {
    const isCheckedItems = this.dataSource.filter((d: any) => d.isChecked);
    if (isCheckedItems.length < this.dataSource.length) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
  }

  /**
   * 计算记录中列的宽度
   */
  caculateColWidth(columns: any, parentCode?: string): number {
    let colWidth: number = 0;
    const records: string = window.localStorage.getItem(
      this.recordKey,
    ) as string;

    if (records) {
      const code = parentCode
        ? `${parentCode}.${columns.propertyCode}`
        : columns.propertyCode;
      const recordJson: AllTypes.WidthRecords = JSON.parse(
        records,
      ) as AllTypes.WidthRecords;
      const item: AllTypes.Record = recordJson.value.find(
        (d: AllTypes.Record) => Object.keys(d)[0] === code,
      ) as AllTypes.Record;
      if (item) {
        colWidth = item[code];
      } else {
        colWidth = columns.width ? Number(columns.width) : 176;
      }
    } else {
      colWidth = columns.width ? Number(columns.width) : 176;
    }
    return colWidth;
  }

  /**
   * 获取数值格式显示格式类型
   * @param str
   * @returns
   */
  getNumberDisplayFormatType(str) {
    const numberTypeNameList = Helper.numberTypeName;
    const obj = numberTypeNameList.find((i) => i.text === str);
    return obj ? obj.type : 'Millimeter';
  }

  /**
   * 获取日期格式显示格式类型
   * @param str
   * @returns
   */
  getDateDisplayFormatType(str) {
    switch (str) {
      case 'YYYY-MM-DD HH:mm:ss':
        return 2;
      case 'YYYY-MM-DD HH:mm':
        return 3;
      case 'YYYY-MM':
        return 4;
      case 'YYYY':
        return 5;
      case 'MM-DD':
        return 6;
      case 'HH:mm':
        return 7;
      case 'HH:mm:ss':
        return 8;
      case 'YYYY-MM-DD CN-APM':
        return 9;
      case 'YYYY-MM-DD CN-APM HH:mm':
        return 10;
      case 'YYYY-MM-DD EN-APM':
        return 11;
      case 'YYYY-MM-DD EN-APM HH:mm':
        return 12;
      default:
        return 1;
    }
  }

  /*
   * 初始化表格表头信息
   */
  initColumns() {
    if (Array.isArray(this.queryColumns)) {
      this.queryColumns.forEach((colum: any) => {
        common.utils.compatible(colum, 'name');
      });
    }
    const columnsArray = this.queryColumns.filter((a: any) => a.propertyCode);
    let isShortText: boolean = true;
    if (columnsArray.some((c: any) => c.propertyCode === 'name')) {
      isShortText = false;
    }
    console.log('------------------------');
    const columns: any[] = columnsArray
      .map((c: any) => {
        let colWidth: number = this.caculateColWidth(c);
        let childColumns = null;

        // 子表初始化其子数据项
        if (c.propertyType === 8) {
          if (!c.childColumns || !c.childColumns.length) {
            return;
          }
          let childSheetWidth: number = 0;
          childColumns = c.childColumns.map((child: any) => {
            const childWidth: number = this.caculateColWidth(
              child,
              c.propertyCode,
            );
            childSheetWidth += childWidth;
            return {
              vcTitle: child.name,
              dataIndex: child.propertyCode,
              propertyType: child.propertyType,
              name_i18n: child.name_i18n,
              width: childWidth,
              isShortText: false,
              displayFormat: child.displayFormat,
              id: child.propertyCode,
              key: child.propertyCode,
              isShow: true,
              propertyAlias: child.propertyAlias,
              display: false,
            };
          });
          colWidth = childSheetWidth;
        }
        const dataItemObj = this.dataItemList.find(
          (i) => i.code === c.propertyCode,
        );
        //若存在情况：在数据模型中修改了日期或数值的格式，但是表单和视图未发布，此时需要取数据模型中的格式
        if (c.propertyType === 3 && c.syncDefaultFormat) {
          //日期类型 获取数据模型数据项中options的格式
          const optionsJson =
            dataItemObj && dataItemObj.options
              ? JSON.parse(dataItemObj.options)
              : '';
          c.displayFormat =
            optionsJson && optionsJson.format
              ? this.getDateDisplayFormatType(optionsJson.format)
              : c.displayFormat;
        }
        if (c.propertyType === 2 && c.syncDefaultFormat) {
          //日期类型 获取数据模型数据项中options的格式
          const optionsJson =
            dataItemObj && dataItemObj.options
              ? JSON.parse(dataItemObj.options)
              : '';
          c.displayFormat =
            optionsJson && optionsJson.format
              ? this.getNumberDisplayFormatType(optionsJson.format)
              : c.displayFormat;
        }
        const back = {
          vcTitle: c.name,
          dataIndex: c.propertyCode,
          name_i18n: c.name_i18n,
          width: colWidth,
          propertyType: c.propertyType,
          isShortText: false,
          displayFormat: c.displayFormat,
          id: c.propertyCode,
          key: c.propertyCode,
          childColumns,
          initChildColumns:
            (childColumns &&
              childColumns.map((item) =>
                Object.assign(item, { queryShow: true }),
              )) ||
            undefined,
          sumType: c.sumType,
          isShow: true,
          propertyAlias: c.propertyAlias,
          display: false,
        };
        if (isShortText && c.propertyType === 0) {
          isShortText = false;
          back.isShortText = true;
        }
        if (c.propertyCode === 'name') {
          back.isShortText = true;
        }

        // 添加自定义列表头slot
        this.columnSlots[c.propertyCode] = `${c.propertyCode}Title`;

        // 添加自定义表体slot
        this.rowSlots[c.propertyCode] = `${c.propertyCode}Body`;

        return back;
      })
      .filter(Boolean);
    this.defaultColums = JSON.parse(JSON.stringify(columns));

    // 判断是否存有记录
    const columnOpts: any = window.localStorage.getItem(this.columnsOptsKey);
    if (columnOpts) {
      const _column: any = JSON.parse(columnOpts);
      // this.cusColumns = _column.filter((col:any) => col.isShow);
      const showColumns = _column.filter((col: any) => col.isShow);
      // 记录列是否全在请求列中
      const isAllIncluded: boolean = showColumns.every(
        (col: any) =>
          !!columns.find((innerCol: any) => innerCol.key === col.key),
      );
      if (isAllIncluded) {
        // 把剩余列修改成不显示
        const fCols: any = columns
          .map((col: any) => {
            const item: any = _column.find(
              (innerCol: any) => col.key === innerCol.key,
            );
            if (!item) {
              // 新增的展示列
              col.isShow = true;
              return col;
            }
          })
          .filter((col: any) => !!col);
        const _showColumns = _column
          .map((col: any) => {
            const item: any = columns.find(
              (innerCol: any) => col.key === innerCol.key,
            );
            if (item) {
              item.isShow = col.isShow;
              item.display = col.display;
              return item;
            }
          })
          .filter((col: any) => !!col);
        this.columns = _showColumns.concat(fCols);
        this.cusColumns = showColumns.concat(fCols);
        //把请求列中子表的数据更新到记录列中
        this.cusColumns.forEach((c: any) => {
          const source: any = columns.find((r: any) => r.key === c.key);
          if (source) {
            c.childColumns = source.childColumns;
            c.width = source.width;
            c.displayFormat = source.displayFormat;
            c.sumType = source.sumType;
            c.vcTitle = source.vcTitle;
            c.isShow = source.isShow;
            c.display = source.display;
          }
        });
      } else {
        // 记录列是否全不在请求列中
        let isAllNotInclude: boolean = true;
        showColumns.forEach((sCol: any) => {
          const f: boolean = !!columns.find(
            (innerCol: any) => innerCol.key === sCol.key,
          );
          if (!f) {
            isAllNotInclude = true;
          } else {
            isAllNotInclude = false;
          }
        });
        if (isAllNotInclude) {
          // 都不在，使用请求列，清空记录
          this.cusColumns = columns;
          this.columns = columns;
          window.localStorage.removeItem(this.columnsOptsKey);
        } else {
          // 部分在
          // 1. 找出展示列
          const sCols: any = showColumns
            .map((col: any) => {
              const c: any = columns.find(
                (innerCol: any) => col.key === innerCol.key,
              );
              if (c) {
                c.isShow = true;
                return c;
              }
            })
            .filter((col: any) => !!col);
          this.cusColumns = sCols;

          // 2. 把剩余列修改成不显示
          const fCols: any = columns
            .map((col: any) => {
              const item: any = sCols.find(
                (innerCol: any) => col.key === innerCol.key,
              );
              if (!item) {
                col.isShow = false;
                return col;
              }
            })
            .filter((col: any) => !!col);
          this.columns = sCols.concat(fCols);
          //把请求列中子表的数据更新到记录列中
          this.cusColumns.forEach((c: any) => {
            const source: any = columns.find((r: any) => r.key === c.key);
            if (source) {
              c.childColumns = source.childColumns;
              c.width = source.width;
              c.displayFormat = source.displayFormat;
              c.sumType = source.sumType;
              c.vcTitle = source.vcTitle;
              c.isShow = source.isShow;
              c.display = source.display;
            }
          });
        }
      }

      //处理子表缓存
      this.analizeSheetCacheData(_column, columns);
    } else {
      this.cusColumns = JSON.parse(JSON.stringify(columns));
      this.columns = columns;
    }

    // 计算表格width
    this.scrollX = 0;
    columns.forEach((c: any) => {
      this.scrollX += c.width;
    });

    // console.log('colus', columns);

    // 获取当前导出附件是否以链接的形式
    if (this.queryActions.length) {
      this.queryActions.forEach((item) => {
        if (item.queryActionType === 6 && item.extend1 !== null) {
          this.extend1 = item.extend1;
        }
      });
    }
  }

  // 初始化视图自定义数据&事件
  async initPresentation(queryPresentation: any) {
    // console.log('__________________ initPresentation', queryPresentation)
    // 变量
    const vm = this as any;
    const listWrapper = this.$refs.application as any;
    let styleElement = listWrapper.querySelector('#customStyle');
    const isStyleElementExist = !!styleElement;
    styleElement = styleElement || document.createElement('style');

    // 尝试解析
    let htmlObj,
      isError = !queryPresentation || !queryPresentation.htmlJson;
    try {
      if (!isError) {
        htmlObj = JSON.parse(queryPresentation.htmlJson) as any;
      }
    } catch (err) {
      isError = true;
      console.error(err);
    }

    // 如果数据为空|数据出错, 清空模型自定义数据&事件
    if (isError) {
      styleElement.innerHTML = '';
      this.eventHooksHandler = null;
      return;
    }

    // 注入样式
    styleElement.innerHTML = htmlObj.styleJson;
    if (!isStyleElementExist) {
      styleElement.id = 'customStyle';
      listWrapper.appendChild(styleElement);
    }

    try {
      const hookNames = Object.keys(eval(htmlObj.scriptJson).hooks);

      this.eventHooksHandler =
        listEventHooksHandler.loadSupportingVersionHandler({
          vm,
          scriptString: htmlObj.scriptJson,
          hooksOption: [
            { name: 'onPreLoad', params: [] },
            { name: 'onLoad', params: ['dataSource'] },
            { name: 'onRendered', params: ['dataSource'] },
            { name: 'onPreAction', params: ['dataSource'] },
            { name: 'onCustomAction', params: ['dataSource'] },
            { name: 'onActionDone', params: [] },
            { name: 'onCellRender', params: [] },
            { name: 'onRowRender', params: [] },
          ].filter((el) => hookNames.includes(el.name)),
        });
      // 初始化完毕直接调用 onPreLoad;
      await this.eventHooksHandler.exec('onPreLoad');
    } catch (err) {
      if (err === 'first version scription uncompatible!') {
        return;
      }
      this.$message.error(err.toString(), 5);
    }

    // TODO: 注入模板
  }

  /*
   * 分页改变
   */
  onPaginationChange(page: number) {
    this.curPage = page;
    this.getQueryList('pageChange');
    this.resetSelectAll(this);
  }

  /*
   * 分页pageSize改变
   */
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    setTimeout(() => {
      this.hidepages();
    });
    this.getQueryList('pageChange');
    this.resetSelectAll(this);
  }

  /*
   * 重新加载
   */
  reload() {
    this.getListConfigData();
  }

  /**
   * 按钮队列:
   */

  getAction(code: string) {
    this.queryActions = [...this.queryActions, this.queryActions[0]];
    console.log('queryActions======>', this.queryActions);
    return this.queryActions.find((a) => a.actionCode === code);
  }

  /*
   * 列表按钮点击事件
   */
  // @ts-ignore
  async actionClick(action: listParams.QueryActions, e: any) {
    let type = action.actionCode;
    if (action.bindAction) {
      type = 'customButton';
    }
    console.log(action, 'action');
    // console.log(this.visible, 'this.visible');
    // onPreAction 执行前
    if (
      this.eventHooksHandler &&
      (await this.eventHooksHandler.exec('onPreAction', action)) === false
    ) {
      return;
    }

    // executeAction 确认执行
    switch (type) {
      case 'batch_update':
        this.updateVisible = true;
        break;
      case 'add':
        onActionClick.handleAdd(this, action);
        break;
      case 'delete':
        onActionClick.handleDeleteListData(this);
        break;
      case 'import':
        this.visible = true;
        break;
      case 'export':
        this.showDataExport = true;
        break;
      case 'qr_code':
        {
          if (platform.IS_DINGTALK) {
            this.$confirm({
              title: this.$t('languages.form.printConfirmTitle').toString(),
              content: this.$t('languages.form.printConfirmContent').toString(),
              okText: this.$t('languages.form.go').toString(),
              cancelText: this.$t('cloudpivot.flowCenter.pc.cancel').toString(),
              onOk() {
                const url =
                  location.href + '&T=' + localStorage.getItem('token');
                platform.service.openLink(url);
              },
            });
            return;
          }
          const length = this.checkeds.filter((c: boolean) => c).length;
          this.checkedLength = length > 0 ? length : this.checkeds.length;
          this.showPrintQrcode = true;
        }
        break;
      case 'batch_print':
        const pl = e.target;
        this.printBtnListStyle = { left: Number(pl.offsetLeft - 60) + 'px' };
        const { schemaCode } = this.$route.params;

        const { data, errcode, errmsg } = await listApi.getConfirmIsPrint({
          schemaCode,
        });
        if (errcode !== 0) {
          this.$message.error(errmsg as string, 3);
          return;
        }
        if (!data.printSheetCodes.length) {
          this.$message.warning(
            this.$t('cloudpivot.list.pc.isCustomizePrintTemp') as string,
            4,
          );
          return;
        }
        this.toShowPrints = true;
        this.printTempList = data.printSheetCodes;
        // onActionClick.handlePrintForm(this);
        break;
      case 'editowner':
        this.getEditPresentation(action);
        break;
      // 表单留痕按钮逻辑
      case 'form_track':
        const markingInstanceLower: any = this.$refs.FormMarking;
        markingInstanceLower.changeVisible(true);
        break;
      case 'FORM_TRACK':
        const markingInstance: any = this.$refs.FormMarking;
        markingInstance.changeVisible(true);
        break;
      case 'customButton':
        //后台配置自定义按钮
        switch (action.bindAction) {
          case 'FORM':
          case 'ADD_DATA':
          case 'FLOW':
          case 'SCRIPT':
            const checkedsData: any = [];
            let indexs: number;
            this.checkeds.forEach((c: boolean, index: number) => {
              if (c) {
                checkedsData.push(this.dataSource[index]);
                indexs = index;
              }
            });
            if (action.bindAction === 'SCRIPT') {
              if (action.operateType === 'WITH_VIEW') {
                if (checkedsData.length === 0) {
                  this.$message.error('请选择数据');
                } else if (checkedsData.length > 1) {
                  this.$message.error('请选择1条数据');
                } else if (checkedsData.length === 1) {
                  this.goForm({}, indexs, action);
                } else {
                }
              } else {
                this.goForm({}, 0, action);
              }
            } else {
              if (action.bindAction === 'FORM') {
                if (checkedsData.length === 0) {
                  this.$message.error('请选择数据');
                } else if (checkedsData.length > 1) {
                  this.$message.error('请选择1条数据');
                } else if (checkedsData.length === 1) {
                  this.goForm({}, indexs, action);
                } else {
                }
              } else {
                const actionConfig = JSON.parse(action.actionConfig);
                if (
                  Array.isArray(actionConfig.configureList) &&
                  actionConfig.configureList.length > 0
                ) {
                  if (checkedsData.length === 0) {
                    this.$message.error('请选择数据');
                  } else if (checkedsData.length > 1) {
                    this.$message.error('请选择1条数据');
                  } else if (checkedsData.length === 1) {
                    this.goForm({}, indexs, action);
                  } else {
                    //Else Empty block statement
                  }
                } else {
                  this.goForm({}, 0, action);
                }
              }
            }
            break;
          case 'BUSINESS_RULE':
            const ids: any = [];
            this.checkeds.forEach((c: boolean, index: number) => {
              if (c) {
                ids.push(this.dataSource[index].id);
              }
            });
            if (ids.length === 0) {
              this.$message.error('请选择数据');
            } else {
              this.customButtonRule(action, ids);
            }
            break;
          case 'LIST':
            this.goForm({}, 0, action);
            break;
          default:
            break;
        }
        break;
      // 自定义按钮, 如果返回异步, 则等待异步完成触发 done; 否则直接触发 done;
      default: {
        if (this.eventHooksHandler) {
          this.eventHooksHandler.exec('onCustomAction', action).then((resp) => {
            this.eventHooksHandler.exec('onActionDone', action, resp);
          });
        }
      }
    }
  }

  async showFormTrack() {
    const markingInstanceLower: any = this.$refs.FormMarking;
    markingInstanceLower.changeVisible(true);
  }

  handleBatchPrintHide(codeTemp: string) {
    this.toShowPrints = false;
    onActionClick.handlePrintForm(this, codeTemp);
  }

  //获取是否有权限修改数据和弹框
  async getEditPresentation(action: listParams.QueryActions) {
    const objectIds: any = [];
    this.checkeds.forEach((c: boolean, index: number) => {
      if (c) {
        objectIds.push(this.dataSource[index].id);
      }
    });
    const obj: any = {
      filters: [
        {
          propertyCode: 'id',
          propertyType: 13,
          propertyValue: objectIds.join(';'),
          propertyValueName: '',
          queryFilterType: 'In',
        },
      ],
      mobile: false,
      page: this.curPage - 1,
      size: this.pageSize,
      queryCode: this.curListCode,
      schemaCode: this.schemaCode,
      isSheet: false,
      objectIds,
    };
    const res: any = await listApi.getNoPresentationNumber(obj);
    if (res && res.errcode === 0) {
      (this.$refs.ModifyOwner as any).init(res.data, action);
      this.noPermissionTotal = res.data;
    } else {
      this.$message.error(res.errmsg as string);
    }
  }

  modelType: string = 'LIST';

  /*
   * 获取模型的配置信息
   */
  listConfig: any = null;

  // 分页设置
  pagingSetting: any = {
    showTotal: true,
    pageSize: 20,
  };

  // 加载完所有数据
  loadedAll: boolean = false;

  // 上一页
  prevPage() {
    if (this.curPage <= 1) {
      return;
    }
    this.loadedAll = false;
    this.onPaginationChange(this.curPage - 1);
  }

  // 下一页
  nextPage() {
    if (this.loadedAll) {
      return;
    }
    this.onPaginationChange(this.curPage + 1);
  }

  async getListConfigData(param?: any) {
    /* this.modelType = "TREE"; */
    const { schemaCode } = param ? param : this.$route.params;
    // 频繁切换应用或模型有时无法获取到schemaCode 导致接口报错  优化没有获取到schemaCode时重新再次去获取
    if (!schemaCode) {
      this.getListConfigData(param);
      return;
    }
    const params = param
      ? param
      : {
          code: this.curListCode,
          schemaCode,
          source: 1,
        };
    this.isLoading = true;
    let Res: any;
    try {
      Res = await listApi.getListConfigData(params);
    } catch (error) {
      Res = await listApi.getListConfigData(params);
    }
    if (Res && Res.errcode === 0 && Res.data) {
      const queryActions = Res.data.queryActions;
      let formCode;
      for (let i = 0; i < queryActions.length; i++) {
        if (queryActions[i] && queryActions[i].actionCode === 'add') {
          formCode = queryActions[i].associationCode;
          break;
        }
      }
      params.formCode = formCode;

      // 分页设置
      if (Res.data.options) {
        const options = JSON.parse(Res.data.options);
        this.pagingSetting = options.pagingSetting;
        this.pageSize = this.pagingSetting.pageSize;
      }
    }
    let res: any;
    if (params.formCode) {
      try {
        res = await listApi.getListConfigData(params);
      } catch (error) {
        res = await listApi.getListConfigData(params);
      }
    } else {
      res = Res;
    }
    // 如果获取数据失败
    if (!res || res.errcode !== 0 || !res.data) {
      this.curTitle = '';
      this.curTitleNameI18n = {};
      this.isShowLoadFailBox = true;
      this.isShowTableBox = false;
      this.isLoading = false;
      // 异常情况不触发
      this.$message.error(res.errmsg as string, 3);

      await this.initPresentation(null);

      return;
    } else {
      if (res.data.queryPresentationType) {
        this.queryPresentationType = res.data.queryPresentationType;
      }
      this.modelType = res.data.modelType;
      const queryConditions = res.data.queryConditions;
      if (Array.isArray(queryConditions) && queryConditions.length) {
        queryConditions.forEach((item: any) => {
          try {
            let dictionaryData = JSON.parse(item.options);
            if (
              !dictionaryData.dictionaryData &&
              dictionaryData.options &&
              dictionaryData.options.includes('checkedDictionary')
            ) {
              dictionaryData = JSON.parse(dictionaryData.options);
            }
            if (dictionaryData && dictionaryData.checkedDictionary) {
              // 单选、多选、下拉单选、下拉多选使用了数据字典数据
              const resOptions = dictionaryData.useDictionariesData.map(
                (el: any) => el.name,
              );
              item.options = resOptions.join(';');
            } else if (dictionaryData && dictionaryData.dictionaryData) {
              console.log('33', dictionaryData);
            } else if (dictionaryData.options) {
              item.options = dictionaryData.options;
            } else {
              //Else Empty block statement
            }
          } catch (error) {}
        });
      }
      this.listConfig = res.data;
      await this.initPresentation(res.data.queryPresentation || null);
    }

    // if (!res.data || true) {
    //   this.isShowTableBox    = false;
    //   this.isShowLoadFailBox = true;
    //   this.$message.error(res.errmsg);
    //   return;
    // }
    this.customButtons = res.data.customButtons;
    this.isShowLoadFailBox = false;

    if (res.data.name) {
      common.utils.compatible(res.data, 'name');
      this.curTitle = res.data.name;
      this.curTitleNameI18n = res.data.name_i18n;
    } else {
      this.curTitle = '';
      this.curTitleNameI18n = {};
    }

    // let hasCallRenderEvent = false;
    if (res.data.length === 0) {
      return this.$message.error(res.errmsg as string, 3);
    }

    if (!res.data.queryConditions || res.data.queryConditions.length <= 0) {
      // this.isShowFilterBox = false;
      // WARN: 异步获取列表
      // hasCallRenderEvent = true;
      // console.log('没有查询条件调用');
      // this.getQueryList('getConfig');
      // .then(resp=>{
      //   this.$nextTick(()=>{
      //     this.isRenderingReady = true;
      //   })
      // })
    } else {
      // this.isShowFilterBox = true;
      this.isShowTableBox = true;
      if (Array.isArray(res.data.queryConditions)) {
        res.data.queryConditions.forEach((condition: any) => {
          if (condition.propertyCode === 'sequenceStatus') {
            condition.options =
              this.$t('cloudpivot.flow.pc.WorkflowState.Draft') +
              ';' +
              this.$t('cloudpivot.flow.pc.WorkflowState.Processing') +
              ';' +
              this.$t('cloudpivot.flow.pc.WorkflowState.Completed') +
              ';' +
              this.$t('cloudpivot.flow.pc.WorkflowState.Canceled');
            if (!condition.defaultValue) {
              return;
            }
            const vals_zh: Array<string> = condition.defaultValue.split(';');
            const vals_en: Array<string> = [];
            vals_zh.forEach((val: string) => {
              switch (val) {
                case 'DRAFT':
                  vals_en.push('草稿');
                  break;
                case 'PROCESSING':
                  vals_en.push('进行中');
                  break;
                case 'COMPLETED':
                  vals_en.push('已完成');
                  break;
                case 'CANCELED':
                  vals_en.push('已作废');
                  break;
                default:
                  break;
              }
            });
            condition.defaultValue = vals_en.join(';');
          }
          // 日期格式配置了dateType则获取本地当前时间进行过滤
          if (condition.propertyType === 3 && condition.dateType) {
            const date = Helper.setDateByDateType(
              condition.dateType,
              this.getFormat(condition.displayFormat),
            );
            condition.startValue = date[0];
            // ? moment(date[0], this.getFormat(condition.displayFormat))
            // : date[0];
            condition.endValue = date[1];
            // ? moment(date[1], this.getFormat(condition.displayFormat))
            // : date[1];
          }

          common.utils.compatible(condition, 'name');
          condition.name_i18n['zh'] =
            condition.name_i18n['zh'] || condition.name;
          condition.name_i18n = JSON.stringify(condition.name_i18n);
        });
      }
    }
    this.queryConditions = res.data.queryConditions;
    if (!this.queryConditions) {
      this.filterFixed = false;
      this.isShowFilterBox = false;
      this.queryCondition = [[]];
    }
    this.queryTime = new Date().getTime();
    this.subQueryformConditions = res.data.queryConditionMap;
    console.log(this.queryConditions);

    this.visibleQueryConditions =
      (this.queryConditions &&
        this.queryConditions.filter(function (a) {
          return a.visible;
        })) ||
      [];
    // console.log("VISIBLEQUERYCONDITIONS: "+this.visibleQueryConditions);

    let presentationActions: any = [];
    if (
      res.data.queryPresentation &&
      typeof res.data.queryPresentation === 'object'
    ) {
      this.queryPresentation = res.data.queryPresentation;
      try {
        presentationActions = JSON.parse(
          (this.queryPresentation as any).actionsJson,
        );
      } catch (err) {}
    }

    if (
      res.data.modelType === 'TREE' ||
      (this.queryPresentationType === 'GANTT' &&
        this.listConfig.queryGanttModel.levelPropertyCode)
    ) {
      res.data.queryActions = res.data.queryActions.filter((i: any) => {
        // return ![8,9,10,11].includes(i.queryActionType)
        return [2, 4, 5, 6].includes(i.queryActionType);
      });
    }

    let associationType = 0;
    res.data.queryActions = res.data.queryActions.map((i: any) => {
      if (i.actionCode === 'add') {
        associationType = i.associationType;
      }
      if (i.actionCode === 'import') {
        i.associationType = associationType;
      }
      return i;
    });

    // 如果视图设计里有自定义按钮数据, 择取 queryActions 包含的系统按钮和 actionsJson 包含的自定义按钮:
    // 原本 actionsJson 只做 queryActions 的补充, 存些类名之类, 具体显示和默认数据都由 queryActions 来决定
    // 但现在接口 queryActions 对自定义按钮的权限处理上有些问题, 自定义字段本身也不能存在 queryActions 上
    // 所以需要合并 queryActions 和 actionsJson 的数据

    if (presentationActions && presentationActions.length) {
      const queryActions = res.data.queryActions;
      //避免留痕按钮被覆盖导致留痕不出来
      const formTrackData: any = res.data.queryActions.filter(
        (item: any) =>
          item &&
          (item.actionCode === 'form_track' ||
            item.actionCode === 'FORM_TRACK'),
      );
      if (formTrackData.length > 0) {
        presentationActions.push(formTrackData[0]);
      }

      // 获取 queryActions 中存在的数据还自定义数据
      this.queryActions = res.data.queryActions = presentationActions
        .map((a1: any) => {
          const a2 = queryActions.find(
            (a: any) => a.actionCode === a1.actionCode,
          );
          if (a2 || a1.queryActionType === QueryActionTypes.CUSTOM) {
            return { ...a2, ...a1, sortKey: a2.sortKey }; // sortKey 以接口为准
          } else {
            return null;
          }
        })
        .filter(Boolean)
        .sort((c: any, n: any) => c.sortKey - n.sortKey);
    } else {
      this.queryActions = res.data.queryActions;
    }

    //重排按钮顺序
    const [first, second, third, fourth, ...rest] = this.queryActions;
    this.queryActions = [second, ...rest, fourth, third, first].filter(
      (el) => el,
    );

    if (this.queryActions && Array.isArray(this.queryActions)) {
      // 本地调试代码--qrcodescan
      // this.queryActions.push({
      //   id: "2c928e4c747d6ae001748f85beab184b",
      //   remarks: null,
      //   createdTime: "2020-09-15 10:09:01",
      //   modifiedTime: "2020-09-15 10:09:01",
      //   deleted: false,
      //   createdBy: null,
      //   modifiedBy: null,
      //   actionCode: "batch_print",
      //   name: "打印表单",
      //   name_i18n: {
      //     en: "打印表单",
      //   },
      //   queryId: "2c928e4c747d6ae001748f85bbdd182d",
      //   schemaCode: "zsq1",
      //   systemAction: false,
      //   serviceCode: null,
      //   customService: false,
      //   serviceMethod: null,
      //   icon: "plus",
      //   queryActionType: 8,
      //   clientType: "PC",
      //   sortKey: 5,
      //   associationType: 0,
      //   associationCode: "zsq1",
      // });
      const deleteBtn = this.queryActions.filter((ac: any) =>
        ['delete', 'export', 'batch_update'].includes(ac.actionCode),
      );
      this.canDelete = !!deleteBtn.length;
      this.queryActions.forEach((action: any) => {
        if (action && action.actionCode === 'add') {
          this.sheetCode = action.associationCode;
        }
        if (action.actionCode === 'add') {
          if (action.associationType === 0) {
            this.associationCode = action.associationCode;
          } else {
            this.associationCode = '';
          }
        }
        common.utils.compatible(action, 'name');
      });
    }

    // 批量操作合在一个按钮，以下拉展示形式展示， 暂时不能合并批量打印，功能暂时注释保留，后续如果需要合并其他批量操作，可以放开start
    // let batchs = []
    // let batchsIndexs = []
    // this.queryActions.forEach((a: any, i:number) => {
    //   // 记录所有批量操作
    //   if(a.actionCode.includes('batch_')){
    //     // @ts-ignore
    //     batchs.push(a)
    //     // @ts-ignore
    //     batchsIndexs.unshift(i)
    //   }
    // });
    // batchsIndexs.forEach((el,index) => {
    //   this.queryActions.splice(el, 1)
    //   if(index === batchsIndexs.length - 1){
    //     this.queryActions.splice(el, 0, Object.assign({}, batchs[0],
    //         {
    //           name: "批量操作",
    //           actionCode: "batchs",
    //           name_i18n: {en: "批量操作"},
    //           data: {},
    //           children: [...batchs]
    //         }
    //       )
    //     )
    //   }
    // })
    // 批量操作合在一个按钮，以下拉展示形式展示， 暂时不能合并批量打印，功能暂时注释保留，后续如果需要合并其他批量操作，可以放开end

    if (res.data.queryColumns) {
      this.queryColumns = res.data.queryColumns; //.filter((query: any) => query.propertyType !== 6);
      this.initColumns();
    }

    //this.getQueryList();

    // if ( !hasCallRenderEvent ) {
    //   this.$nextTick(()=>{
    //     this.isRenderingReady = true;
    //   })
    // }
    console.log('queryActions========>', this.queryActions);
    this.moreActions = this.queryActions.filter((item) => {
      return (
        item.actionCode === 'batch_print' ||
        item.actionCode === 'qr_code' ||
        item.queryActionType === 7
      );
    });
    this.checkedMoreActions = this.queryActions.filter((item) => {
      return (
        item.actionCode === 'batch_print' ||
        item.actionCode === 'qr_code' ||
        item.actionCode === 'editowner' ||
        item.queryActionType === 7
      );
    });
    if (this.customButtons) {
      const customButtonsList = this.customButtons.filter((x) => {
        return x.useLocation === 'LIST';
      });
      this.customButtonsRow = this.customButtons.filter((x) => {
        return x.useLocation === 'ROW';
      });
      this.moreActions = this.moreActions.concat(customButtonsList);
      this.checkedMoreActions =
        this.checkedMoreActions.concat(customButtonsList);
    }
  }

  getFormat(str: string) {
    switch (Number(str)) {
      case 2:
        return 'YYYY-MM-DD HH:mm:ss';
      case 3:
        return 'YYYY-MM-DD HH:mm';
      case 4:
        return 'YYYY-MM';
      case 5:
        return 'YYYY';
      case 6:
        return 'MM-DD';
      case 7:
        return 'HH:mm';
      case 8:
        return 'HH:mm:ss';
      case 9:
        return 'YYYY-MM-DD CN-APM';
      case 10:
        return 'YYYY-MM-DD CN-APM HH:mm';
      case 11:
        return 'YYYY-MM-DD EN-APM';
      case 12:
        return 'YYYY-MM-DD EN-APM HH:mm';
      default:
        return 'YYYY-MM-DD';
    }
  }

  //普通的加载数据时，返回很多数据但是不展开。查询条件引发的加载数据，需要将数据全部展开
  //isOpen是传递给甘特图组件用于判断当前是否有查询条件生效
  isOpen: boolean = false;

  // 查询条件
  queryCondition: any[] = [];

  /*
   * 获取查询条件
   */
  setFilterData(data: any) {
    if (data && Array.isArray(data)) {
      this.queryCondition = cloneDeep(data);
      data = {};
    } else {
      if (data && data.parentId === null) {
        this.queryCondition = [];
      }
    }
    const temArr = Object.keys(data);
    this.isOpen = false;
    // for(let i = 0; i<temArr.length; i++ ){
    //   if(temArr[i] !== 'parentId' ){
    //     if(data[temArr[i]]){
    //       this.isOpen = true;
    //       break;
    //     }
    //     else{
    //       this.isOpen = false;
    //     }
    //   }
    // }
    if (temArr.length === 0) {
      this.queryActive = false;
      this.isOpen = false;
    }
    for (let i = 0; i < temArr.length; i++) {
      if (temArr[i] !== 'parentId') {
        if (Array.isArray(data[temArr[i]])) {
          data[temArr[i]].forEach((item) => {
            if (item) {
              this.queryActive = true;
              this.isOpen = true;
            }
          });
          if (this.queryActive) {
            break;
          }
        } else if (data[temArr[i]]) {
          this.queryActive = true;
          this.isOpen = true;
          break;
        } else {
          this.queryActive = false;
          this.isOpen = false;
        }
      }
    }

    const relevanceDataList = this.dataItemList;
    const filterArray: any = [];
    const dataArray = Object.entries(data);
    this.queryFormValues = data;

    this.filterData = [];
    let hasRelevanceForm = false; // 查询条件是否有关联表单
    dataArray.forEach((a: any) => {
      if (!a && !a[0]) {
        return;
      }
      const [key, value] = a;
      this.queryConditions.forEach((query: listParams.QueryConditions) => {
        const displayFormat: string = query.displayFormat || '';
        let propertyValueName: string = '';
        if (key === query.propertyCode) {
          let propertyValue = value;
          if (Array.isArray(propertyValue)) {
            if (key === 'sequenceStatus') {
              // 后端传回来的只会是英文
              const sequenceStatus: any = [];
              propertyValue.forEach((pop: any) => {
                switch (pop) {
                  case '草稿':
                  case 'Draft':
                    return sequenceStatus.push('DRAFT');
                  case '进行中':
                  case 'Processing':
                    return sequenceStatus.push('PROCESSING');
                  case '已完成':
                  case 'Completed':
                    return sequenceStatus.push('COMPLETED');
                  case '已作废':
                  case 'Canceled':
                    return sequenceStatus.push('CANCELED');
                  default:
                    break;
                }
              });
              propertyValue = sequenceStatus.join(';');
            } else if (propertyValue.length === 1 && query.propertyType === 2) {
              propertyValue = `${propertyValue};`;
            } else if (
              query.propertyType === DataItemType.StaffSingle ||
              query.propertyType === DataItemType.StaffMulti ||
              query.propertyType === DataItemType.DeptSingle ||
              query.propertyType === DataItemType.DeptMulti ||
              query.propertyType === DataItemType.StaffDeptMix
            ) {
              propertyValue = JSON.stringify(
                propertyValue.map((p) => ({
                  id: p.id,
                  unitType: p.unitType,
                  name: p.name,
                })),
              );
            } else if (
              query.propertyType === DataItemType.Date &&
              propertyValue.length === 2
            ) {
              propertyValue = propertyValue.map((x) => {
                if (typeof x === 'string') {
                  return x;
                } else if (x instanceof Date) {
                  return common.utils.DateHandle.dateFormat(
                    x,
                    this.getFormat(displayFormat),
                  );
                } else if (x && typeof x === 'object') {
                  const d = x.format(this.getFormat(displayFormat));
                  return d;
                } else {
                  //Else Empty block statement
                }
                return '';
              });
              propertyValue = propertyValue.join(';');
            } else if (
              query.propertyType === DataItemType.Time &&
              propertyValue.length === 2
            ) {
              propertyValue = propertyValue.map((x) => {
                if (typeof x === 'string') {
                  return x;
                } else if (moment.isMoment(x)) {
                  return x.format(this.getFormat(displayFormat));
                } else {
                  //Else Empty block statement
                }
                return '';
              });
              propertyValue = propertyValue.join(';');
            } else if (query.propertyType === DataItemType.RelevanceFormEx) {
              propertyValue = propertyValue.map((item) => item.id).join(';');
            } else {
              propertyValue = propertyValue.join(';');
            }
          } else {
            switch (query.propertyType) {
              case DataItemType.RelevanceForm:
                propertyValue = value ? value.id : '';
                hasRelevanceForm = true;
                // propertyValueName = value ? value.name : "";
                // 获取关联表单的值
                propertyValueName = '';
                if (
                  value &&
                  relevanceDataList &&
                  relevanceDataList.length > 0
                ) {
                  const rele = relevanceDataList.find(
                    (r: any) => r.code === key,
                  );
                  //let val: any;
                  rele.relativePropertyCode = rele.relativePropertyCode
                    ? rele.relativePropertyCode
                    : 'name';
                  const val: any =
                    value[rele.relativePropertyCode] || value['name'];
                  // 数据格式处理；
                  const type = typeof val;
                  if (type === 'string' || type === 'number') {
                    propertyValueName = val;
                  } else if (type === 'boolean') {
                    propertyValueName = val ? '是' : '否';
                  } else if (Array.isArray(val)) {
                    propertyValueName = val[0].name;
                  } else if (rele.relativePropertyCode.includes('Address')) {
                    if (val && type === 'object') {
                      propertyValueName = `${val.provinceName}${val.cityName}${val.districtName}`;
                    } else {
                      const address: any = JSON.parse(val);
                      propertyValueName = `${address.provinceName}${address.cityName}${address.districtName}`;
                    }
                  } else {
                  }
                }
                break;
              case DataItemType.Logic:
                propertyValue = value ? true : false;
                break;
              case DataItemType.Address:
                if (value && Object.keys(value).length > 0) {
                  propertyValue = JSON.stringify(propertyValue);
                } else {
                  propertyValue = null;
                }

                break;
              default:
                break;
            }
          }
          filterArray.push({
            propertyCode: query.propertyCode,
            propertyType: query.propertyType,
            propertyValue,
            propertyValueName,
          });
        }
      });
    });
    this.filterData = filterArray;
    // filterData 转化成展示项
    const cacheData: any = window.sessionStorage.getItem('filterData');
    let filterData = cloneDeep(this.filterData);
    if (platform.IS_DINGTALK) {
      if (cacheData) {
        const result: any = JSON.parse(cacheData);
        filterData = result.filterData;
      }
    }
    //修改查询条件显示名称
    filterData = filterData.map((item) => {
      const dataItem = this.queryConditions.find((i) => {
        return i.propertyCode === item.propertyCode;
      });
      const displayFormat = dataItem ? dataItem.displayFormat : '';
      if (item.propertyValue && displayFormat && displayFormat === '5') {
        const propertyValuesplit0 = item.propertyValue.split(';')[0];
        const propertyValuesplit1 = item.propertyValue.split(';')[1];
        item.propertyValue = `${propertyValuesplit0.substring(
          0,
          4,
        )};${propertyValuesplit1.substring(0, 4)}`;
      }
      return item;
    });

    const qcArr = queryConditionHelper.getValue(
      queryConditionTypings.CheckTypes.FromFilterData,
      this.queryConditions as any,
      filterData as any,
    );
    this.queryConditionSource = qcArr;
    this.curPage = 1;
    const _type: string = this.firstLoad ? '' : 'search';
    if (hasRelevanceForm) {
      // 在过滤查询,如果有关联表单查询,需要传 display给后台.
      this.getQueryList(_type, {
        display: hasRelevanceForm,
      });
    } else {
      this.getQueryList(_type);
    }
    this.resetSelectAll(this);
  }

  /*
   * 查询列表数据参数
   */
  queryParamsFormater() {
    const { schemaCode } = this.$route.params;
    const { queryCode } = this.$route.query;
    // 取缓存种的查询条件 dingtalk
    const cacheData: any = window.sessionStorage.getItem('filterData');
    if (platform.IS_DINGTALK) {
      if (cacheData) {
        const data: any = JSON.parse(cacheData);
        this.curPage = data.curPage;
        this.pageSize = data.pageSize;
        this.filterData = data.filterData;
      }
    }

    const params: listParams.ExportDataParams = {
      filters: this.filterData,
      mobile: false,
      page: this.curPage - 1,
      queryCode: this.curListCode,
      schemaCode,
      size: this.pageSize,
    };

    // 判断是否有排序
    if (this.$refs.listCustomTemplate) {
      if ((this.$refs.listCustomTemplate as any).isSort) {
        if ((this.$refs.listCustomTemplate as any).sortAscDesc !== 0) {
          params.orderByFields = [
            (this.$refs.listCustomTemplate as any).sortCode,
          ];
          params.orderType = (this.$refs.listCustomTemplate as any).sortAscDesc;
        }
      }
    }

    return params;
  }

  assignParams(params) {
    params.queryVersion = 1;
    params.queryCondition = [this.queryCondition];
    console.log(this.queryCondition, '--------------QUERYCONDITION');

    // this.queryActive =
    //   this.queryCondition.length && this.queryCondition.some((el) => el.length);
    this.queryActive = false;
    for (let i = 0; i < this.queryCondition.length; i++) {
      if (this.queryActive) {
        break;
      }
      for (let j = 0; j < this.queryCondition[i].length; j++) {
        if (this.queryActive) {
          break;
        }
        if (this.queryCondition[i][j].propertyValue) {
          this.queryActive = true;
        } else {
          this.queryActive = false;
        }
      }
    }
  }

  oldParams: any = {};

  failText: string = '';

  //请求列表数据
  async getQueryList(type?: string, ...otherParams) {
    const vm: any = this;
    const hasData = this.rows.length;
    const prevTotal = this.total;
    this.userListData = [];
    this.dataSource = [];
    this.flatedListData = [];
    this.rows = [];
    let params = this.queryParamsFormater();
    // this.isLoading = true;
    if (otherParams && otherParams.length) {
      // 在过滤查询,如果有关联表单查询,需要传 display给后台.
      for (const v of otherParams) {
        if (typeof v === 'object' && !Array.isArray(v) && v !== null) {
          params = Object.assign(params, v);
        }
      }
    }

    this.assignParams(params); // 合并新的查询方式

    this.oldParams = JSON.parse(JSON.stringify(params));

    // 外部请求
    let res;
    let isCustomRequest = false;
    let customRequestMode = '';
    let scriptVersion;

    if (this.modelType === 'TREE') {
      const view: any = {
        type: 'TREE',
        depth: 1,
        parentRef: '#',
      };
      params.view = view;
    }

    params.showTotal = this.pagingSetting.showTotal;

    // 检测版本
    if (
      this.eventHooksHandler &&
      (scriptVersion = parseFloat(
        this.eventHooksHandler.scription.options.version,
      )) > 1
    ) {
      const listData = this.eventHooksHandler.getApi('listData');
      if (listData) {
        isCustomRequest = true;
        customRequestMode = listData.mode;
        // console.log('_______fetch')
        // console.log( this.eventHooksHandler.fetchApi(listData, params) )
        res = await this.eventHooksHandler.fetchApi(listData, params);

        if (customRequestMode === 'replace') {
          this.eventHooksHandler.hooksOption.forEach((o) => {
            o.params = o.params.includes('dataSource')
              ? ['userListData']
              : o.params;
          });
          console.log(this.eventHooksHandler.hooksOption);
        }
      } else {
        if (this.queryPresentationType === 'GANTT') {
          params.size = 5000;
          res = await listApi.getQueryGanttList(params);
        } else {
          res = await listApi.getQueryList(params);
        }
      }
    } else {
      if (this.queryPresentationType === 'GANTT') {
        params.size = 5000;
        res = await listApi.getQueryGanttList(params);
      } else {
        try {
          res = await listApi.getQueryList(params);
          if (res.errcode !== 0) {
            this.failText = res.errmsg;
          }
        } catch (error) {
          console.log(error);
          res = await listApi.getQueryList(params);
        }
      }
    }

    // console.log('_____', this.eventHooksHandler.scription.options.version);
    // console.log( res )

    // this.isShowTable = true; // 因为要做流程控制, 先触发 onLoad, 所以不能直接这么做展示
    this.firstLoad = false;
    this.tableLoading = false;
    this.isLoading = false;
    // this.isShowFilterBox = false;

    // 如果有自定义接口并且使用替换模式
    if (isCustomRequest && customRequestMode === 'replace') {
      this.isShowTableBox = true;
      this.isShowLoadFailBox = false;
      this.userListData = res;
    }
    // 如果没有自定义接口或者自定义接口使用combine
    else {
      if (res.errcode === 0) {
        if (this.pagingSetting.showTotal === false) {
          // 不显示总数
          // 加载的数据行数 < 每页显示条数: 加载完所有的
          this.loadedAll = res.data.content.length < this.pageSize;
        }

        this.isShowTableBox = true;
        this.isShowLoadFailBox = false;
        if (!res.data) {
          throw new Error('response data empty!');
        }
        // 生成key 以及序号
        this.dataSource = [];
        this.flatedListData = [];
        if (this.queryPresentationType === 'GANTT') {
          //甘特图查询数据接口与正常查询数据接口不同，需对数据处理
          this.ganttPreRelate = res.data.ganttPreRelate;
          res = res.data.pageInfo;
        }

        if (res.data.content.length <= 0) {
          this.isShowLoadAll = false;
          this.exportDisabled = true;
          if (type === 'search' || type === 'pageChange') {
            this.isShowNoData = false;
            this.isShowSearchNoData = true;
          } else {
            this.isShowNoData = true;
            this.isShowSearchNoData = false;
          }
          this.rowsFormatter(this.cusColumns);
        } else {
          this.exportDisabled = false;
          //只有在当前模型为甘特图模型且包含层级关系字段时才把接口数据转换为树形数据
          await this.setGanttDataAndPermission(res, vm, true);

          //一定条件满足时，折叠甘特图数据
          this.foldGanttTreeData(res);

          this.dataSource = [];
          this.listDataFormatter(res.data.content, this.dataSource, vm.columns);
          this.rowsFormatter(this.cusColumns);

          //甘特图新增按钮绑定流程时，需要校验是否具有流程编辑权限。只有特权人和系统管理员能在视图上修改甘特图数据
          this.setGanttWorkflowPermission();

          // 显示全部加载完成
          this.isShowSearchNoData = false;
          this.isShowNoData = false;
          if (Math.ceil(res.data.totalElements / this.pageSize) <= 1) {
            this.isShowLoadAll = true;
          } else {
            if (res.data.content.length < this.pageSize) {
              this.isShowLoadAll = true;
            } else {
              this.isShowLoadAll = false;
            }
          }

          const columnOpts: any = window.localStorage.getItem(
            this.columnsOptsKey,
          );
          if (columnOpts) {
            this.rowsFormatter(this.cusColumns);
          }
        }
        this.total = res.data.totalElements;
      } else {
        this.isShowTableBox = false;
        this.isShowLoadFailBox = true;
        if (
          this.$route.params.appCode !== params.schemaCode &&
          res.errcode !== 303001
        ) {
          // 报错
          this.$message.error(res.errmsg as string, 3);
        }
      }
    }

    // 触发 onLoad 只在成功加载数据时触发
    // 而 onLoad 的触发又会带动 onRendered 的触发
    // isShowTable 也会根据 if/else, 同步/异步的情况情况来做触发
    if (
      (isCustomRequest && customRequestMode !== 'combine') ||
      res.errcode === 0
    ) {
      // 触发onLoad钩子: 第一次加载/过滤/分页器 时, 新增/删除 成功时
      if (
        !hasData ||
        type === 'search' ||
        type === 'pageChange' ||
        type === 'reload' ||
        type === 'append'
      ) {
        if (this.eventHooksHandler) {
          // 针对一些事件要在 onLoad 之前处理一下 actionDone
          // 之前 append 的 actionDone 会在 onLoad 后触发
          if (type === 'append') {
            // DELAY:TODO:如果要监听详细的失败信息, 需要修改其他文件, 可能会对相关依赖有影响, delay 一下; 目前仅做新旧 total 做对比
            this.eventHooksHandler.exec(
              'onActionDone',
              this.getAction('add'),
              prevTotal !== this.total,
            );
          }
          await this.eventHooksHandler.exec('onLoad');
          this.isShowTable = true;
          this.isRenderingReady = false;
          this.$nextTick(() => {
            this.isRenderingReady = true;
            this.setTable(); // 因为异步，所以此处单独执行一次
          });
        }
      }
    }

    this.isShowTable = true;

    // 因脚本执行流程控制，所有与dom操作相关都放置最底部
    this.setTable();

    // 设置缓存中默认值
    const cacheData: any = window.sessionStorage.getItem('filterData');
    if (platform.IS_DINGTALK) {
      if (cacheData) {
        const data: any = JSON.parse(cacheData);
        const queryForm = this.$refs.queryForm;
        if (queryForm) {
          (queryForm as any).backWriteData(data.queryFormValues);
        }
      }

      // 钉钉环境删除记录
      window.sessionStorage.removeItem('filterData');
    }

    //获取数值数据项数据
    if (res.data && res.data.sumMap) {
      let val = false;
      for (const k in res.data.sumMap) {
        if (JSON.stringify(res.data.sumMap[k]) !== '{}') {
          val = true;
        }
      }
      this.numberData = val ? res.data.sumMap : '';
    } else {
      this.numberData = '';
    }

    //获取列表数据用于自定义按钮
    if (res.data && res.data.content) {
      this.customBtnContent = res.data.content;
    }
    setTimeout(() => {
      this.hidepages();
    });

    return res;
  }

  getAsyncTreeDataGantt(rowId) {
    if (this.listConfig.modelType !== 'TREE') {
      return;
    }
    this.getAsyncTreeData(rowId);
  }

  //请求点击树形异步后的数据
  asyncTreeData: any = {};

  //异步请求树形
  async getAsyncTreeData(rowId) {
    const params = this.queryParamsFormater();
    //let res: any;
    for (let i = 0; i < params.filters.length; i++) {
      //异步查询子数据的时候不需要带查询条件。不然返回数据会错误。
      params.filters[i].propertyValue = '';
    }
    if (this.modelType === 'TREE') {
      const view: any = {
        type: 'TREE',
        depth: 1, //深度为1，返会两层数据，因为为了判断是否有子数据从而是否有继续展开按钮
        parentRef: rowId,
      };
      params.view = view;
    }
    this.tableLoading = true;
    const res: any = await listApi.getQueryList(params);
    if (res.errcode !== 0) {
      this.$message.error(res.errmsg);
    }
    this.tableLoading = false;
    //异步序列化后的数据存在originalData
    const originalData: any = [];
    const vm: any = this;
    //把res.data.content序列化存进originalData中
    this.listDataFormatter(res.data.content, originalData, vm.columns);

    this.asyncTreeData = {
      ...this.asyncTreeData,
      [rowId]: originalData,
    };
    this.mergeAsyncTreeData(rowId, this.dataSource, this.asyncTreeData);
    this.dataSource = [...this.dataSource];

    //只有在当前模型为甘特图模型且包含层级关系字段时才把接口数据转换为树形数据
    if (this.queryPresentationType === 'GANTT') {
      this.analizeAsyncTreeDataGantt(rowId, res);
    }
  }

  analizeAsyncTreeDataGantt(rowId, res) {
    const vm = this;
    const flatedListData: any = [];
    this.listDataFormatter(
      res.data.content,
      flatedListData,
      vm.columns,
      false,
      'gantt',
    );

    this.asyncTreeDataGantt = {
      ...this.asyncTreeDataGantt,
      [rowId]: flatedListData,
    };

    this.mergeAsyncTreeData(
      rowId,
      this.flatedListData,
      this.asyncTreeDataGantt,
    );

    this.flatedListData = [...this.flatedListData];
  }

  //数据asyncTreeData与originalTableData（dataSource）合并
  mergeAsyncTreeData(rowId, dataSource, asyncData) {
    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].id === rowId) {
        dataSource[i].t__children_ = asyncData[rowId]; //把获取异步结点数据直接拼接进原始数据中
        return;
      }
      if (dataSource[i].t__children_) {
        this.mergeAsyncTreeData(rowId, dataSource[i].t__children_, asyncData);
      }
    }
  }

  // 根据排列顺序，获取列表
  async bySortGetQueryList(sortData?: any) {
    // 获取参数
    let params: any = this.queryParamsFormater();
    if (sortData) {
      const { orderByFields, orderType } = sortData;
      if (!orderByFields.length) {
        return;
      }
      params = { ...params, orderByFields, orderType };
    }
    //如果是树形则传入树形参数
    if (this.modelType === 'TREE') {
      const view = {
        type: 'TREE',
        depth: 0,
        parentRef: '#',
      };
      params = { ...params, view };
    }
    this.assignParams(params); // 合并新的查询方式

    // 加载中
    this.tableLoading = true;
    // 调用接口
    const res: any = await listApi.getQueryList(params);
    if (res.errcode !== 0) {
      this.$message.error(res.errmsg);
    }

    //右侧甘特图区域数据初始化
    await this.setGanttDataAndPermission(res, this, false);

    //一定条件满足，折叠甘特图数据
    this.foldGanttTreeData(res);

    // 加载完成
    this.tableLoading = false;
    this.dataSource = [];
    this.listDataFormatter(res.data.content, this.dataSource, this.columns);

    this.setGanttWorkflowPermission();
  }

  // 列表数据格式化
  listDataFormatter(
    dataOrigin: any,
    dataSource: any,
    sourceColumns: any,
    isChildSheet?: any,
    dataType?: any,
  ) {
    dataOrigin.forEach((item: any, index: number) => {
      const obj: any = {};
      const itemData = isChildSheet ? item : item.data;
      Object.entries(itemData).forEach((data: any, i: number) => {
        const [key, value] = data;
        const column: any = sourceColumns.find(
          (c: any) => c.dataIndex === key || c.propertyAlias === key,
        );
        // 键值
        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            // MARK: 如果是附件、子表, 返回全部, 而不只是名字;
            const ignoreType = [6, 8];
            obj[key] =
              column && ignoreType.includes(column.propertyType)
                ? value
                : value.map((x) => x.name || '').join();
          } else {
            obj[key] = value.name || value.address || '';
          }

          // 关联表单显示字段赋值
          if (column && column.propertyType === 9) {
            const code: string = value.displayCode;
            if (Array.isArray(value[code])) {
              obj[key] = value[code][0].name;
            } else {
              obj[key] = value[code];
              // 处理逻辑
              if (value.propertyType === 4) {
                value[code] === true ? (obj[key] = '是') : (obj[key] = '否');
              }
              // 处理地址
              if (value.propertyType === 10) {
                const addressObj = JSON.parse(value[code]);
                if (addressObj) {
                  addressObj.provinceName
                    ? (obj[key] = addressObj.provinceName)
                    : (obj[key] = '');
                  addressObj.cityName
                    ? (obj[key] += addressObj.cityName)
                    : (obj[key] += '');
                  addressObj.districtName
                    ? (obj[key] += addressObj.districtName)
                    : (obj[key] += '');
                  addressObj.address
                    ? (obj[key] += addressObj.address)
                    : (obj[key] += '');
                }
              }

              //处理创建人
              // if(value.propertyType === 50){
              //   const addressObj = JSON.parse(value[code]);
              //   console.log(value);

              //   console.log(addressObj);

              // }

              // 单据状态
              if (value.displayCode === 'sequenceStatus') {
                switch (value[code]) {
                  case 'DRAFT':
                    obj[key] = this.$t(
                      'cloudpivot.flow.pc.WorkflowState.Draft',
                    );
                    break;
                  case 'PROCESSING':
                    obj[key] = this.$t(
                      'cloudpivot.flow.pc.WorkflowState.Processing',
                    );
                    break;
                  case 'COMPLETED':
                    obj[key] = this.$t(
                      'cloudpivot.flow.pc.WorkflowState.Completed',
                    );
                    break;
                  case 'CANCELED':
                    obj[key] = this.$t(
                      'cloudpivot.flow.pc.WorkflowState.Canceled',
                    );
                    break;
                  default:
                    obj[key] = '';
                }
              }
            }
          }

          // 关联多选显示字段赋值
          if (column && column.propertyType === 11) {
            const code: string = value.displayCode;
            if (value.items && Array.isArray(value.items)) {
              obj[key] = value.items
                .map((item: any) => {
                  if (item.hasOwnProperty(code)) {
                    return typeof item[code] === 'boolean'
                      ? item[code]
                      : item[code] || '空';
                  }
                })
                .filter((el) => el !== undefined)
                .join(';');
            }
          }
          if (
            value[value['displayCode']] &&
            value[value['displayCode']] !== true
          ) {
            if (dataType === 'gantt') {
              //甘特图在连线设置依赖的时候需要使用到关联单选的ID，不能使用名称匹配（名称不唯一）
              obj[key] = value['id'];
            } else {
              obj[key] = value[value['displayCode']];
            }
          }
        } else if (value === 'null' && column && column.propertyType === 9) {
          obj[key] = null;
        } else if (typeof value === 'boolean') {
          obj[key] = value ? '是' : '否';
        } else {
          obj[key] = value;
        }

        // 类型
        if (value && column && column.propertyType === 10) {
          try {
            let address: any = JSON.parse(value);
            if (typeof address === 'string') {
              address = JSON.parse(address);
            }
            // 省市区如果为空则展示空字符
            address.provinceName = address.provinceName
              ? address.provinceName
              : '';
            address.cityName = address.cityName ? address.cityName : '';
            address.districtName = address.districtName
              ? address.districtName
              : '';
            address.address = address.address ? address.address : '';

            obj[
              key
            ] = `${address.provinceName}${address.cityName}${address.districtName}${address.address}`;
          } catch {
            console.log('位置控件格式正确！');
          }
        } else if (value && column && column.propertyType === 3) {
          // 日期数据项展示格式处理
          const date = new Date(
            typeof value === 'string' ? value.replace(/-/g, '/') : value,
          ); // 修复safari/ie下日期转换问题
          const month =
            date.getMonth() + 1 > 9
              ? date.getMonth() + 1
              : `0${date.getMonth() + 1}`;
          const day =
            date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
          const yearAndMonth = `${date.getFullYear()}-${month}`;
          const time = `${date.getFullYear()}-${month}-${day}`;
          const hours =
            date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
          const minutes =
            date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
          const seconds =
            date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;
          switch (column.displayFormat) {
            case 0:
              break;
            case 1:
              obj[key] = time;
              break;
            case 2:
              obj[key] = `${time} ${hours}:${minutes}:${seconds}`;
              break;
            case 3:
              obj[key] = `${time} ${hours}:${minutes}`;
              break;
            case 4:
              obj[key] = yearAndMonth;
              break;
            case 5:
              obj[key] = date.getFullYear();
              break;
            case 6:
              obj[key] = `${month}-${day}`;
              break;
            case 7:
              obj[key] = `${hours}:${minutes}`;
              break;
            case 8:
              obj[key] = `${hours}:${minutes}:${seconds}`;
              break;
            // case 9:
            //   obj[key] = `${time} ${hours > 12 ? '下午' : '上午'}`;
            //   break;
            // case 10:
            //   obj[key] = `${time} ${hours > 12 ? '下午' : '上午'} ${hours > 12 ? (Number(hours) - 12) : hours}:${minutes}`;
            //   break;
            // case 11:
            //   obj[key] = `${time} ${hours > 12 ? 'pm' : 'am'}`;
            //   break;
            // case 12:
            //   obj[key] = `${time} ${hours > 12 ? 'pm' : 'am'} ${hours > 12 ? (Number(hours) - 12) : hours}:${minutes}`;
            //   break;
            default:
              break;
          }
        } else if (column && column.propertyType === 2) {
          // 数值数据项展示格式处理
          if (value === 0) {
            obj[key] = '0';
          } else if (value) {
            if (column.displayFormat) {
              // if(key.includes("Number") && typeof value ==='number') {
              //   obj[key] = Helper.numberToDisplay((value*100), column);
              // }else{
              //   obj[key] = Helper.numberToDisplay(value, column);
              // }
              obj[key] = Helper.numberToDisplay(value, column);
              // if(key.includes("Number") && typeof obj[key] ==='string' && obj[key].includes("%")){
              //处理小数精度问题
              // var m=0,s1=(Number(obj[key].split('%')[0])).toString(),s2="100";
              // try{m+=s1.split(".")[1].length}catch(e){};
              // try{m+=s2.split(".")[1].length}catch(e){};
              //  obj[key]=Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)  + "%";
              // }
            } else {
              const arrs = this.dataItemList.find((i) => i.code === column.key);
              if (arrs && arrs.options) {
                const objs = JSON.parse(arrs.options);
                const status = Helper.numberToDisplayModel(value, objs.format);
                if (status) {
                  obj[key] = status;
                }
              }
            }
          } else {
            //Else Empty block statement
          }
        } else if (
          value &&
          column &&
          column.propertyType === 8 &&
          !isChildSheet
        ) {
          // 子表数据项格式化处理
          obj[key] = [];
          if (value.length) {
            this.listDataFormatter(value, obj[key], column.childColumns, true);
          }
        } else {
          //Else Empty block statement
        }

        if (key === 'sequenceStatus') {
          switch (value) {
            case 'DRAFT':
              obj[key] = this.$t('cloudpivot.flow.pc.WorkflowState.Draft');
              break;
            case 'PROCESSING':
              obj[key] = this.$t('cloudpivot.flow.pc.WorkflowState.Processing');
              break;
            case 'COMPLETED':
              obj[key] = this.$t('cloudpivot.flow.pc.WorkflowState.Completed');
              break;
            case 'CANCELED':
              obj[key] = this.$t('cloudpivot.flow.pc.WorkflowState.Canceled');
              break;
            default:
              break;
          }
        }
        if (key === 'isChecked') {
          obj[key] = false;
        } else {
          obj[key] = obj[key] || '--';
        }

        //统一处理人员头像
        if (
          value &&
          column &&
          (column.propertyType === 50 ||
            column.propertyType === 51 ||
            column.propertyType === 5)
        ) {
          obj[key] = value;
        }
      });
      //如果是甘特图设置了进度字段，但没有展示进度，按100%格式处理
      const progressPropertyCode =
        this.listConfig &&
        this.listConfig.queryGanttModel &&
        this.listConfig.queryGanttModel.progressPropertyCode;
      if (
        progressPropertyCode &&
        !sourceColumns.some((c: any) => {
          return (
            c.dataIndex === progressPropertyCode ||
            c.propertyAlias === progressPropertyCode
          );
        })
      ) {
        const value = item.data[progressPropertyCode];
        if (value === 0) {
          obj[progressPropertyCode] = '0';
        } else if (value) {
          obj[progressPropertyCode] = Helper.numberToDisplay(value, {
            displayFormat: 4,
          });
        } else {
          //Else Empty block statement
        }
      }
      dataSource.push(obj);
      //如果是树形的数据，对子数据进行一个循环处理
      if (
        this.modelType === 'TREE' ||
        (this.queryPresentationType === 'GANTT' &&
          this.listConfig.queryGanttModel.levelPropertyCode)
      ) {
        obj.t__children_ = [];
        obj.ObjectId = item.id;
        if (item.data) {
          if (item.data.t__children_) {
            this.listDataFormatter(
              item.data.t__children_,
              obj.t__children_,
              sourceColumns,
            );
          }
        }
      }
    });
  }

  //当数据条数超过20000条时隐藏分页组件的最后一页与跳页操作
  hidepages() {
    if (this.total >= 20000) {
      const pages: any = document.getElementsByClassName(
        `ant-pagination-item-${Math.ceil(this.total / this.pageSize)}`,
      )[0];
      const pageJ: any = document.getElementsByClassName(
        'ant-pagination-options-quick-jumper',
      )[0];
      pages.style.display = 'none';
      pageJ.style.display = 'none';
    }
  }

  setTable() {
    this.setTableMaxHeight();
    this.setTableScroller();
    this.addMarkColorBlock(this.dataSource);
  }

  tableChange() {
    // console.log('_______________tableChange')
    console.log(arguments);
  }

  /**
   * 用色块标注进行中与草稿
   * @tableData 表格数据
   */
  addMarkColorBlock(tableData: any) {
    if (!tableData) {
      return;
    }
    this.$nextTick(() => {
      const rowList: any = document.querySelectorAll(
        '.sheet .sheet__body > .sheet__row',
      ) as NodeList;
      if (rowList) {
        rowList.forEach((row: HTMLElement, index: number) => {
          const markStatus: Array<string> = ['草稿', '进行中'];
          if (markStatus.indexOf(tableData[index].sequenceStatus) > -1) {
            row.classList.add('marked');
          }
        });
      }
    });
  }

  /**
   * 表格row格式化
   * @desc 将展示列的每一列整合到每一行
   * @params columns 共有多少列
   */
  rowsFormatter(columns: any) {
    const data: Array<any> = JSON.parse(JSON.stringify(this.dataSource));
    const newRows: any = [];
    data.forEach(() => {
      const _row: Array<any> = [];
      columns.forEach((col: any) => {
        _row.push({ key: col.key });
      });
      newRows.push(_row);
    });

    this.rows = newRows;
    this.checkeds = this.rows.map(() => false);
    return newRows; // 初次加载默认设置
  }

  /**
   * 字段排序筛选之后重新渲染表格
   */
  reRenderTable(columns: any) {
    this.cusColumns = columns.filter((col: any) => {
      if (col.initChildColumns && col.initChildColumns.length > 0) {
        col.childColumns = col.initChildColumns.filter((item) => item.isShow);
        col.width = col.childColumns.reduce(
          (prev, next) => prev + this.caculateColWidth(next, next.propertyCode),
          0,
        );
      }
      return col.isShow;
    });
    // 更新columns状态
    this.columns = columns;
    this.rowsFormatter(this.cusColumns);

    this.saveColumnsOpts(columns);

    if (this.$refs.tableGantt) {
      const stringifyCacheColumns = window.localStorage.getItem(
        `gantt-view-${this.schemaCode}`,
      );
      let stringifyCacheColumnsList = stringifyCacheColumns
        ? JSON.parse(stringifyCacheColumns)
        : [];
      stringifyCacheColumnsList = stringifyCacheColumnsList.map((item) => {
        const node = columns.find((ele) => {
          return item.title === ele.vcTitle;
        });
        item.display = node ? node.display : item.display;
        return item;
      });

      //更新任务条上的显示信息
      this.$refs.tableGantt.updateLocalCols(stringifyCacheColumnsList);

      //刷新整个甘特图
      // this.$refs.tableGantt.refreshTableView();
    }
  }

  /**
   * 回复默认设置
   */
  recovery() {
    this.cusColumns = this.defaultColums;
    this.columns = this.defaultColums;
    this.rowsFormatter(this.defaultColums);

    window.localStorage.removeItem(this.columnsOptsKey);
  }

  /**
   * 字段信息存入本地缓存
   */
  saveColumnsOpts(columns: any) {
    const jsonStr: string = JSON.stringify(columns);
    window.localStorage.setItem(this.columnsOptsKey, jsonStr);
  }

  /*
   * 新增按钮
   */
  handleAdd(obj: listParams.QueryActions) {
    //
    let url: string = '';
    const code = obj.associationCode;
    if (obj.associationType === 1) {
      // 关联流程
      url = `/form/detail?startWorkflowCode=${code}`;
    } else {
      // 关联表单
      const { schemaCode } = this.$route.params;
      url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${code}`;
    }

    url += `&return=${location.pathname + encodeURIComponent(location.search)}`;
    if (platform.IS_DINGTALK) {
      sessionStorage.setItem('backListUrl', window.location.href);
      this.$router.push(url).catch((err: any) => {
        console.log(err);
      });
    } else {
      const opens = window.open(url);
    }
  }

  /*
   * 删除按钮
   */
  async handleDeleteListData() {
    const vm = this;
    const { schemaCode } = vm.$route.params;

    let _ids: string[] = [];
    const allObjectIds: any = [];
    this.checkeds.forEach((c: boolean, index: number) => {
      if (c) {
        _ids.push(this.dataSource[index].id);
      }
      allObjectIds.push(this.dataSource[index].id);
    });
    if (this.modelType === 'TREE') {
      _ids = this.treeCheck;
    }
    // 如果当前未勾选任何数据，默认全部生成
    if (_ids.length === 0) {
      _ids = allObjectIds;
    }

    const params: listParams.DeleteListParams = {
      ids: _ids,
      schemaCode,
    };

    const res = await listApi.checkDeleteItems(params);
    if (res.errcode === 0 && Array.isArray(res.data)) {
      const countObj: any = {};
      res.data.forEach((data: any) => {
        switch (data.resultCode) {
          case 1000:
            countObj.count1 = data.objectIds ? data.objectIds.length : 0;
            break;
          case 1001:
            countObj.count2 = data.objectIds ? data.objectIds.length : 0;
            break;
          case 1002:
            countObj.count3 = data.objectIds ? data.objectIds.length : 0;
            break;
          case 1003:
            countObj.count4 = data.objectIds ? data.objectIds.length : 0;
            break;
          case 1004:
            countObj.count5 = data.objectIds ? data.objectIds.length : 0;
            break;
          default:
            break;
        }
      });
      const h = this.$createElement;
      vm.$confirm({
        title: h('span', { class: 'delete-title' }, [
          `${vm.$t('cloudpivot.list.pc.DeleteItems').toString()}`,
        ]), // 以下数据删除后不能恢复，确定要删除吗？
        content: h('div', { class: 'delete-content' }, [
          h('div', { class: { hidden: !countObj.count1 } }, [
            h('img', { attrs: { src: require('../image/dot.png') } }),
            '业务数据 ',
            h('span', `${countObj.count1}`),
            ' 条',
          ]),
          h('div', { class: { hidden: !countObj.count2 } }, [
            h('img', { attrs: { src: require('../image/dot.png') } }),
            '未关联父子流程的流程数据 ',
            h('span', `${countObj.count2}`),
            ' 条',
            h(
              'p',
              { class: 'tip-text' },
              '（数据删除后，将同步删除已产生的流程实例）',
            ),
          ]),
          h('div', { class: { hidden: !countObj.count3 } }, [
            h('img', { attrs: { src: require('../image/dot.png') } }),
            '已关联子流程的父流程数据 ',
            h('span', `${countObj.count3}`),
            ' 条',
            h(
              'p',
              { class: 'tip-text' },
              '（父流程删除后将同步删除与其绑定的子流程数据及实例）',
            ),
          ]),
          h('div', { class: { hidden: !countObj.count4 } }, [
            h('img', { attrs: { src: require('../image/dot.png') } }),
            '子流程数据 ',
            h('span', `${countObj.count4}`),
            ' 条',
            h(
              'p',
              { class: 'tip-text' },
              '（子流程删除后将同步删除实例及与父流程产生的映射关系）',
            ),
          ]),
          h('div', { class: { hidden: !countObj.count5 } }, [
            h('img', { attrs: { src: require('../image/dot.png') } }),
            '普通用户不可删除流程数据 ',
            h('span', `${countObj.count5}`),
            ' 条',
          ]),
        ]),
        width: '520px',
        okText: this.$t('cloudpivot.list.pc.OK').toString(),
        cancelText: this.$t('cloudpivot.list.pc.Cancel').toString(),
        onOk() {
          vm.deleteListItems();
        },
        class: 'test',
        className: 'test1',
      } as any);
    } else if (res.errcode === -1) {
      vm.$message.warning(res.errmsg as string);
    } else {
      //Else Empty block statement
    }
  }

  /*
   * 删除列表项
   */
  async deleteListItems() {
    const vm = this;
    const _ids: string[] = [];
    this.checkeds.forEach((c: boolean, index: number) => {
      if (c) {
        _ids.push(vm.dataSource[index].id);
      }
    });
    // vm.dataSource.forEach((data: any) => {
    //   if (data.isChecked) {
    //     _ids.push(data.id);
    //   }
    // });
    const { schemaCode } = vm.$route.params;

    const params: listParams.DeleteListParams = {
      ids: _ids,
      schemaCode,
    };

    const res = await listApi.deleteListData(params);
    if (res.errcode === 0) {
      // 当前为最后一页时，且删除了所有数据，把当前页码减一
      if (
        _ids.length === vm.dataSource.length &&
        res.data.successCount === _ids.length &&
        vm.curPage > 1
      ) {
        vm.curPage -= 1;
      }

      if (res.data && res.data.errorCount > 0) {
        if (res.data.successCount === 0) {
          vm.$message.warning(
            this.$t('cloudpivot.list.pc.NoPermissionDelete') as string,
            4,
          );
        } else {
          vm.$message.warning(
            this.$t('cloudpivot.list.pc.DeleteItemsTips', {
              successCount: res.data.successCount,
              errorCount: res.data.errorCount,
            }) as string,
            4,
          );
        }
      }
      vm.resetSelectAll(vm);
      vm.getQueryList('delete');
    } else {
      vm.$message.error(
        this.$t('cloudpivot.list.pc.DeleteFailed') as string,
        3,
      );
    }
  }

  /*
   * 导出列表
   */
  handleExportData(data: any, appendParam: any) {
    onActionClick.handleExportData(this, data, appendParam).then((resp) => {
      this.exportFileId = resp;
      if (this.eventHooksHandler) {
        this.eventHooksHandler.exec(
          'onActionDone',
          this.getAction('export'),
          resp ? true : false,
        );
      }
    });
  }

  /**
   * 获取每一列的数据
   */
  // TODO: 删除
  getLabelContent(column: any, rowIndex: number) {
    if (!column) {
      return;
    }
    const { dataIndex } = column;
    if (!this.dataSource[rowIndex]) {
      return '';
    }
    return this.dataSource[rowIndex][dataIndex];
  }

  async moreClick(val: any) {
    this.goForm({}, val.rowIndex, val);
  }

  showIframeForm = false;

  IframeFormUrl = '';

  /**
   * 打开表单
   */
  async goForm(column: any, rowIndex: number, customButtonType?: any) {
    const rowData: any = this.dataSource[rowIndex];
    if (!rowData) {
      return;
    }
    const { schemaCode } = this.$route.params;
    const params: listParams.FormUrlParams = {
      bizObjectId: rowData.id,
      schemaCode,
      formCode: this.associationCode,
    };
    let scriptOpen: boolean = false;
    let sheetCodes: string = '';
    //自定义按钮
    if (customButtonType) {
      const customButtonData = this.customButtons.filter((x) => {
        return x.code === customButtonType.code;
      });
      if (customButtonData[0].operateType === 'WITH_VIEW') {
        switch (customButtonData[0].bindAction) {
          case 'LIST':
            const actionConfigs = JSON.parse(customButtonData[0].actionConfig);
            this.viewCodeCustom = actionConfigs.viewXListData[0].code;
            this.customButtomModalCode = actionConfigs.schemaCodeVal.key;
            const opens = await this.customButtomCheck(
              'LIST',
              actionConfigs.schemaCodeVal.key,
            );
            if (!opens) {
              return;
            }
            this.visibleOpen = true;
            return;
          case 'FORM':
          case 'ADD_DATA':
          case 'FLOW':
            const loadParams: any = {
              sheetCode: schemaCode,
              schemaCode: schemaCode,
              objectId: rowData.id,
              isWorkFlow: false,
              return: '',
            };
            const queryCondition: any = []; //当为查看列表时存储自定义按钮配置的筛选条件
            const addData: any = []; //当为新增数据时存储自定义按钮配置数据
            const cusResLoad: any = await formApi.load(loadParams);
            console.log(JSON.parse(customButtonData[0].actionConfig));
            const actionConfig: any = JSON.parse(
              customButtonData[0].actionConfig,
            );
            if (cusResLoad.data && cusResLoad.data.bizSheet) {
              const formJsonData = cusResLoad.data.bizObject.data;
              for (const con of actionConfig.configureList) {
                let qcCon: any;
                if (customButtonData[0].bindAction === 'FORM') {
                  qcCon = {
                    propertyCode: '',
                    propertyType: 0,
                    propertyValue: '',
                    queryFilterType: 'Eq',
                  };
                } else if (
                  customButtonData[0].bindAction === 'ADD_DATA' ||
                  customButtonData[0].bindAction === 'FLOW'
                ) {
                  qcCon = {
                    targetDataItemCode: null,
                    targetDataItemValue: null,
                  };
                } else {
                  //Else Empty block statement
                }
                if (con.currentDataItem) {
                  //配置的是变量
                  for (const valKay in formJsonData) {
                    if (valKay === con.currentDataItem[0].code) {
                      if (customButtonData[0].bindAction === 'FORM') {
                        qcCon.propertyCode = con.targetDataItem[0].code;
                        qcCon.propertyType =
                          con.currentDataItem[0].propertyType;
                        qcCon.queryFilterType = con.OptionType;
                        if (Array.isArray(formJsonData[valKay])) {
                          for (const fon of formJsonData[valKay]) {
                            fon.unitType = fon.type;
                          }
                        }
                        qcCon.propertyValue = formatVal(
                          con.currentDataItem[0].propertyType,
                          formJsonData[valKay],
                          con.targetDataItem[0].code,
                          con.OptionType,
                        );
                        // qcCon.propertyValue = formJsonData[valKay];
                        queryCondition.push(qcCon);
                      } else if (
                        customButtonData[0].bindAction === 'ADD_DATA' ||
                        customButtonData[0].bindAction === 'FLOW'
                      ) {
                        qcCon.targetDataItemCode = con.targetDataItem[0].code;
                        qcCon.targetDataItemValue = formJsonData[valKay];
                        addData.push(qcCon);
                      } else {
                        //Else Empty block statement
                      }
                    } else {
                      //为子表时
                    }
                  }
                } else {
                  //配置的是常量
                  if (customButtonData[0].bindAction === 'FORM') {
                    qcCon.propertyCode = con.targetDataItem[0].code;
                    qcCon.propertyValue = con.currentDataInput;
                    queryCondition.push(qcCon);
                  } else if (
                    customButtonData[0].bindAction === 'ADD_DATA' ||
                    customButtonData[0].bindAction === 'FLOW'
                  ) {
                    if (con.targetDataItem) {
                      qcCon.targetDataItemCode = con.targetDataItem[0].code;
                      qcCon.targetDataItemValue = con.currentDataInput;
                    }
                    addData.push(qcCon);
                  } else {
                  }
                }
              }
            }
            if (customButtonData[0].bindAction === 'FORM') {
              const formParams: any = {
                filters: [],
                mobile: false,
                page: 0,
                queryCode: actionConfig.schemaCodeVal.key,
                // queryCode: actionConfig.formListData[0].code,
                queryVersion: 1,
                schemaCode: actionConfig.schemaCodeVal.key,
                size: 20,
                queryCondition: [],
              };
              const queryConditions = [];
              sheetCodes = actionConfig.schemaCodeVal.key;
              queryConditions.push(queryCondition);
              formParams.queryCondition.push(queryConditions);
              const formRes = await listApi.getQueryList(formParams);
              if (formRes.data && formRes.data.content.length > 0) {
                const cusResData = formRes.data.content[0];
                params.bizObjectId = cusResData.id;
                params.schemaCode = cusResData.schemaCode;
              } else {
                this.$message.info('没有符合条件的数据', 4);
                return;
              }
            } else if (
              customButtonData[0].bindAction === 'ADD_DATA' ||
              customButtonData[0].bindAction === 'FLOW'
            ) {
              const actionConfigs = JSON.parse(
                customButtonData[0].actionConfig,
              );
              const addParams: any = {
                code: actionConfigs.schemaCodeVal.key,
                schemaCode: actionConfigs.schemaCodeVal.key,
                source: 1,
              };
              window.sessionStorage.setItem(
                'addDataCustom',
                JSON.stringify(addData),
              );
              const headerParams = {
                schemaCode: actionConfigs.schemaCodeVal.key,
                clientType: listParams.QueryClientType.PC,
              };
              const headerRes = await listApi.getQueryHeaders(headerParams);
              if (headerRes.errcode === 0 && Array.isArray(headerRes.data)) {
                addParams.code = headerRes.data[0]
                  ? headerRes.data[0].code
                  : actionConfigs.schemaCodeVal.key;
              }
              const addRes = await listApi.getListConfigData(addParams);
              if (addRes.data && addRes.data.queryActions) {
                const addQA = addRes.data.queryActions.filter((x) => {
                  return x.actionCode === 'add';
                });
                if (addQA.length > 0) {
                  customButtonData[0].bindAction === 'FLOW'
                    ? (addQA[0].associationType = 1)
                    : (addQA[0].associationType = 0);
                  customButtonData[0].bindAction === 'FLOW'
                    ? (addQA[0].associationCode =
                        actionConfigs.WorkflowListData[0].workflowCode)
                    : (addQA[0].associationCode =
                        actionConfigs.formListData[0].code);
                  if (customButtonData[0].bindAction === 'FLOW') {
                    const flowParams = {
                      startWorkflowCode:
                        actionConfigs.WorkflowListData[0].workflowCode,
                    };
                    const flowRes = await formApi.load(flowParams);
                    if (flowRes.errcode !== 0) {
                      this.$message.error('执行失败，找不到模型/表单/视图');
                      return;
                    }
                  } else if (customButtonData[0].bindAction === 'ADD_DATA') {
                    const opens = await this.customButtomCheck(
                      'ADD_DATA',
                      actionConfigs.schemaCodeVal.key,
                    );
                    if (!opens) {
                      return;
                    }
                  } else {
                  }
                  onActionClick.handleAdd(this, addQA[0], '', false, '', true);
                } else {
                  const addQAData: any = {};
                  if (customButtonData[0].bindAction === 'FLOW') {
                    addQAData.associationCode =
                      actionConfigs.WorkflowListData[0].workflowCode;
                    addQAData.associationType = 1;
                    addQAData.schemaCode = actionConfigs.schemaCodeVal.key;
                  } else if (customButtonData[0].bindAction === 'ADD_DATA') {
                    addQAData.associationCode =
                      actionConfigs.formListData[0].code;
                    addQAData.associationType = 0;
                    addQAData.schemaCode = actionConfigs.schemaCodeVal.key;
                    addQAData.queryCode = actionConfigs.formListData[0].code;
                  } else {
                  }
                  addQA.push(addQAData);
                  if (customButtonData[0].bindAction === 'FLOW') {
                    const flowParams = {
                      startWorkflowCode:
                        actionConfigs.WorkflowListData[0].workflowCode,
                    };
                    const flowRes = await formApi.load(flowParams);
                    if (flowRes.errcode !== 0) {
                      this.$message.error('执行失败，找不到模型/表单/视图');
                      return;
                    }
                  } else if (customButtonData[0].bindAction === 'ADD_DATA') {
                    const opens = await this.customButtomCheck(
                      'ADD_DATA',
                      actionConfigs.schemaCodeVal.key,
                    );
                    if (!opens) {
                      return;
                    }
                  } else {
                  }
                  this.handleAddCustom(addQA[0], true);
                }
                return;
              }
            } else {
              //Else Empty block statement
            }
            break;
          case 'SCRIPT':
            const scriptData = JSON.parse(
              customButtonData[0].actionConfig,
            ).scriptData;
            window.sessionStorage.setItem('scriptData', scriptData);
            scriptOpen = true;
            break;
          default:
            break;
        }
      } else if (customButtonData[0].operateType === 'WITH_OUT_VIEW') {
        if (customButtonData[0].bindAction === 'BUSINESS_RULE') {
          this.customButtonRule(customButtonData[0], [rowData.id]);
        } else if (customButtonData[0].bindAction === 'SCRIPT') {
          try {
            const scriptData = JSON.parse(
              customButtonData[0].actionConfig,
            ).scriptData;
            const scriptDataFucs = new Function('scriptData', scriptData);
            scriptDataFucs.call(this, this.customBtnContent);
          } catch (err) {
            console.log(err, '自定义按钮JS脚本编写有误，请检查');
          }
        } else {
          //Else Empty block statement
        }
        return;
      } else {
        //Else Empty block statement
      }
    }
    const res = await listApi.getFormUrl(params);
    // 如果报错, 会返回一个对象
    if (typeof res === 'object' && res.errcode !== 0) {
      return this.$message.error(res.errmsg as string, 3);
    }
    // 否则返回一个字符串
    else if (typeof res === 'string') {
      let res1: any = res;
      if (res1.indexOf('sheetCode') !== -1) {
        const urlParts = (res as string).split('sheetCode=');
        if (customButtonType && sheetCodes) {
          res1 =
            urlParts[0] +
            'sheetCode=' +
            sheetCodes +
            '&' +
            urlParts[1].split('&').slice(1).join('&');
        } else {
          res1 =
            urlParts[0] +
            'sheetCode=' +
            this.associationCode +
            '&' +
            urlParts[1].split('&').slice(1).join('&');
        }
      }

      //执行自定义按钮脚本时跳转链接增加参数
      if (scriptOpen) {
        (res1 as string) += `&scriptOpen=${scriptOpen}`;
      }
      const questionPosition = location.href.indexOf('?');
      const search =
        location.href.substring(questionPosition) + '&iframeAction=detail';
      const url = this.isDingTalk
        ? `${res1}&return=${location.pathname}`
        : `${res1}&return=${location.pathname + encodeURIComponent(search)}`;
      if (platform.IS_DINGTALK) {
        // 缓存查询条件
        const { curPage, filterData, queryFormValues, pageSize } = this;
        const cacheData: any = {
          curPage,
          filterData,
          queryFormValues,
          pageSize,
        };
        window.sessionStorage.setItem('filterData', JSON.stringify(cacheData));
        this.$router.push(url).catch((err: any) => {
          console.log(err);
        });
      } else {
        // window.open(url);
        console.log(url, 'this.url');
        this.showIframeForm = true;
        this.IframeFormUrl = url;
      }
    } else {
      //Else Empty block statement
    }
  }

  /**
   * 打开树形表单
   */
  async goTreeForm(column: any, rowIndexid: number) {
    const rowData: any = this.treeDataFindId(this.dataSource, rowIndexid);

    if (!rowData) {
      return;
    }
    const { schemaCode } = this.$route.params;
    const params: listParams.FormUrlParams = {
      bizObjectId: rowData.id,
      schemaCode,
    };
    const res = await listApi.getFormUrl(params);
    // 如果报错, 会返回一个对象
    if (typeof res === 'object' && res.errcode !== 0) {
      return this.$message.error(res.errmsg as string, 3);
    }
    // 否则返回一个字符串
    else if (typeof res === 'string') {
      const urlObj = new URL(location.href);
      urlObj.searchParams.set('iframeAction', 'detail');
      const search = urlObj.search;
      let url = this.isDingTalk
        ? `${res}&return=${location.pathname}`
        : `${res}&return=${location.pathname + encodeURIComponent(search)}`;
      if (this.listConfig.queryGanttModel) {
        url = url + `&queryId=${this.listConfig.queryGanttModel.queryId}`;
      }

      if (platform.IS_DINGTALK) {
        // 缓存查询条件
        const { curPage, filterData, queryFormValues, pageSize } = this;
        const cacheData: any = {
          curPage,
          filterData,
          queryFormValues,
          pageSize,
        };
        window.sessionStorage.setItem('filterData', JSON.stringify(cacheData));
        this.$router.push(url).catch((err: any) => {
          console.log(err);
        });
      } else {
        // window.open(url);
        console.log(url, 'this.url');
        this.showIframeForm = true;
        this.IframeFormUrl = url;
      }
    } else {
      //Else Empty block statement
    }
  }

  /**
   * 查找树形数据
   */
  treeDataFindId(dataSource, rowIndexid) {
    //let obj: any;
    const obj: any = dataSource
      .map((item) => {
        if (item.id === rowIndexid) {
          return item;
        } else {
          return this.treeDataFindId(item.t__children_, rowIndexid);
        }
      })
      .filter((x) => x !== undefined)[0];
    return obj;
  }

  //自定义按钮执行业务规则
  customButtonRule(btn: any, id: any[]) {
    const ruleParams: any = {
      bizButtonModel: btn,
      bizObjectList: '',
    };

    ruleParams.bizObjectList = this.customBtnContent.filter((x) => {
      for (const _id of id) {
        if (x.id === _id) {
          return x;
        }
      }
    });

    listApi.executeCustomButton(ruleParams).then((res) => {
      if (res.errcode === 0) {
        this.$message.success(res.errmsg);
        setTimeout(() => {
          // this.$router.go(0);
          this.getQueryList('append');
        }, 2500);
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  //当无新增按钮权限时跳转流程、表单
  async handleAddCustom(obj: any, customButton: boolean = false) {
    let url: string = '';
    const code = obj.associationCode;
    if (obj.associationType === 1) {
      // 关联流程
      url = `/form/detail?startWorkflowCode=${code}`;
    } else {
      // 关联表单
      // let { schemaCode } = vm.$route.params;
      const { schemaCode } = obj;
      url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${code}&queryCode=${''}`;
    }
    if (customButton) {
      url += `&customButtonOpen=${customButton}`;
    }
    let search = location.search;
    search = search ? `${search}&iframeAction=add` : `?iframeAction=add`;
    url += `&return=${location.pathname + encodeURIComponent(search)}`;
    window.open(url);
  }

  // 自定义按钮运行时校验模型、表单、视图是否存在
  async customButtomCheck(type: string, schemaCode: string) {
    switch (type) {
      case 'ADD_DATA':
      case 'LIST':
        const scOpen = await this.schemaCheck(schemaCode);
        if (!scOpen) {
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  }

  async schemaCheck(schemaCode: string) {
    const parmas = {
      schemaCode: schemaCode,
    };
    const flowRes = await formApi.load(parmas);
    if (flowRes.errcode !== 0) {
      this.$message.error('执行失败，找不到模型/表单/视图');
      return false;
    }
    return true;
  }

  // 关闭自定义按钮查看列表弹框
  onCloseInfoModal() {
    this.visibleOpen = false;
  }

  handleCancel() {
    this.visible = false;
    setTimeout(() => {
      this.reset();
      if (!this.showImportErrModal) {
        this.deleteTemporaryFile();
      }
    }, 1000);
  }

  /**
   * 开始导入数据
   */
  import() {
    onActionClick.import(this);
  }

  setImportData(data) {}

  /**
   * 导入结束（不管成功与失败）
   */
  importEnd(data: any) {
    onActionClick.importEnd(this, data);
    if (this.eventHooksHandler) {
      this.eventHooksHandler.exec(
        'onActionDone',
        this.getAction('import'),
        data,
      );
    }
  }

  confirm() {
    this.deleteTemporaryFile();
    this.visible = false;
    setTimeout(() => {
      this.reset();
    }, 1000);
  }

  deleteTemporaryFile() {
    //若已上传文件，触发后台清除临时文件
    if (this.importFileName) {
      //成功或失败都无需做处理
      listApi.deleteTemporaryFile({ fileName: this.importFileName });
    }
  }

  async reImport() {
    this.import();
  }

  percentInterval: any = null;

  reset() {
    this.isInitView = true;
    this.isUploading = false;
    this.isImporting = false;
    this.importPercent = 0;
    this.isImportEnd = false;
    this.successNum = 0;
    this.errorMsg = '';
    this.failNum = 0;
    this.importSize = 0;
    this.importrQueryField = '';
    this.canImport = false;
    this.importStatus = listParams.ImportResult.Unspecified;
    onActionClick.simulateImport(this, true);
  }

  changeImportBtnStatus(status: boolean) {
    this.canImport = status;
  }

  setImportFileName(fileName: string) {
    this.importFileName = fileName;
  }

  setImportQueryField(queryField: string) {
    this.importrQueryField = queryField;
  }

  resetParams() {
    // 路由切换不会重新挂载页面
    this.filterData = [];
    this.pageSize = 20;
    this.curPage = 1;
  }

  // 重置全选、删除按钮
  resetSelectAll(vm: any) {
    vm.isSelectAll = false;
    this.$set(this, 'isSelectAll', false);
  }

  /**
   * 拖拽结束, 记录列宽
   */
  onResizeEnd(params: AllTypes.ColumnOption) {
    columnWidthRecord.handleColumResizeEnd(
      params,
      this.recordKey,
      this.columnsOptsKey,
    );
  }

  /**
   * 清空
   */
  clear() {
    this.queryConditionSource = [];
    this.filterData = [];
    this.$nextTick(() => {
      const queryForm: any = this.$refs.queryForm;
      queryForm.clearFilters();

      // this.getQueryList('cleanUp');
    });
  }

  /*
   * 构建打印二维码数据格式
   */
  createPrintQrCodeData(data: any) {
    printQrCode.createPrintQrCodeData(this, data);
  }

  getDownloadUrl(file: renderer.H3File) {
    return renderer.UploadControl.service.getDownloadUrl(file);
  }

  // 修改表单拥有者
  async onModifyOwnerClick(data: any, action: any) {
    //当选择的所有数据都没权限时 直接关闭弹框
    if (this.noPermissionTotal === data.objectIds.length) {
      (this.$refs.ModifyOwner as any).close();
      this.reload();
      return;
    }
    (this.$refs.ModifyOwner as any).confirmLoading = true;
    const res: any = await listApi.modifyOwner(data);
    if (res && res.errcode === 0) {
      this.$message.success(
        this.$t('cloudpivot.list.pc.modifySuccess') as string,
      );
      (this.$refs.ModifyOwner as any).close();
      this.reload();
    } else {
      this.$message.error(res.errmsg as string);
      (this.$refs.ModifyOwner as any).confirmLoading = false;
    }
    this.eventHooksHandler.exec('onActionDone', action, data);
  }

  hideQueryItem() {
    if (!this.isShowFilterBox) {
      return;
    }
    this.isShowFilterBox = false;
  }

  // 重置视图
  resetView() {
    this.rows = [];
    this.isShowTableBox = false;
    this.firstLoad = true;
    this.canDelete = false;
    const records: string = window.localStorage.getItem(
      this.recordKey,
    ) as string;
    this.adaptWidth = !!records;
    this.resetSelectAll(this);
    this.resetParams();
  }

  collectorTempPrintInfo(obj: any) {
    printFormCode.collectorTempPrintInfo(obj, this);
  }

  @Watch('isRenderingReady')
  onRenderingReady(val) {
    if (!val) {
      return;
    }
    if (!this.isShowTableBox) {
      return;
    }
    // 太多异步数据加载, 宏任务很乱, 尽量把 onRendered 丢到最后
    if (this.eventHooksHandler) {
      setTimeout(() => {
        this.eventHooksHandler.exec('onRendered');
      }, 15);
    }
  }

  @Watch('dataSource')
  onDataSourceChange(val: any) {
    // this.initColumns()
    this.rowsFormatter(this.cusColumns);
    this.setTable();
  }

  @Watch('applicationPageTitle')
  onApplicationPageTitleChange(v: any) {
    console.log(v);

    document.title = `奥哲云枢-${v}`;

    const shortName = this.$store.state.themsConfig.name;
    if (shortName && document.title.indexOf('奥哲云枢-') !== -1) {
      document.title = document.title.replace('奥哲云枢-', shortName + '-');
    }
  }

  @Watch('$route')
  onRouteChange(to, from) {
    //视图接口调用梳理：路由切换时，特殊路由不处理，避免过多接口调用\
    console.log('路由改变', to, from);

    if (
      (to.path === from.path && to.query.code === from.query.code) ||
      (to.params.appCode === to.params.schemaCode && !to.query.code) ||
      (to.params.schemaCode !== from.params.schemaCode && !to.query.code)
    ) {
      console.log('跳出调用');
      this.interruptAllRequests();
      return;
    }

    //视图接口调用梳理：路由切换时，只有当前应用下的跳转才处理，避免过多接口调用
    if (to.params.appCode === from.params.appCode) {
      this.getLists(1);
    }
    //解决从流程中心跳到视图列表不加载列表的问题
    if (!from.params.appCode && from.path !== '/') {
      this.getLists(0);
    }
  }

  getLists(type: number) {
    if (type) {
      this.interruptAllRequests();
    }
    this.resetView();
    this.curListCode = '';
    this.getQueryHeaders().then(() => {
      if (!this.queryConditions || this.queryConditions.length === 0) {
        this.getQueryList('getConfig');
      }
    });
    this.isShowGanttTable = true;
  }

  @Watch('$i18n.locale')
  onLocalChange() {
    const loadAllBox = document.querySelector('.data-load-all');
    if (loadAllBox) {
      loadAllBox.innerHTML = `${this.$t('cloudpivot.list.pc.AllBeShown')}`;
    }
  }

  @Provide()
  getScrollEl() {
    return document.body.querySelector('.table-box') as HTMLDivElement;
  }

  @Emit()
  getRelevanceDataList() {
    this.relevanceDataList = this.dataItemList;
  }

  /**
   * 甘特图如果不是树形模型，
   * 获取到的列表数据必须经过转化
   * @param data 通过接口拿到的原始数据，原dataSource
   */
  convertToTreeData(data) {
    let dataCopy = JSON.parse(JSON.stringify(data));
    const result = dataCopy.filter((item) => {
      return (
        item.data[this.listConfig.queryGanttModel.levelPropertyCode] === null ||
        item.data[this.listConfig.queryGanttModel.levelPropertyCode] ===
          undefined
      );
    });
    dataCopy = dataCopy.filter((item) => {
      return (
        item.data[this.listConfig.queryGanttModel.levelPropertyCode] !== null &&
        item.data[this.listConfig.queryGanttModel.levelPropertyCode] !==
          undefined &&
        item.data[this.listConfig.queryGanttModel.levelPropertyCode] !== '--'
      );
    });
    result.forEach((node) => {
      this.getLeavesOfParentId(node, dataCopy);
    });
    return result;
  }

  /**
   * 根据父节点id获取所有子节点
   * @param node 当前节点
   * @param data 负责所有源数据的状态保存
   */
  getLeavesOfParentId(node, data) {
    node.data.t__children_ = data.filter((item) => {
      return (
        item.data[this.listConfig.queryGanttModel.levelPropertyCode].id ===
        node.data.id
      );
    });
    data = data.filter((item) => {
      return (
        item.data[this.listConfig.queryGanttModel.levelPropertyCode].id !==
        node.data.id
      );
    });
    node.data.t__children_.forEach((item) => {
      this.getLeavesOfParentId(item, data);
    });
  }

  /**
   * 表格折叠事件
   * @param data （折叠状态、当前记录ID）
   */
  onExpandRow(data) {
    this.$refs.tableGantt.syncCollapse(data.expandedType, data.bizObjectId);
  }

  /**
   * 接收甘特图更新表格数据
   * @param data
   */
  onGridDataUpdate(data) {
    this.dataSource = this.refactoringTreeData(this.dataSource, data);
    console.log('this.dataSource', this.dataSource);
  }

  /**
   * 对表格数据进行改变
   * @param list
   * @param data
   * @returns
   */
  refactoringTreeData(list, data) {
    const dataMap = list.map((owner) => {
      if (owner.id === data.id) {
        owner = Object.assign(owner, data.data);
      }
      if (owner.t__children_) {
        owner.t__children_ = this.refactoringTreeData(owner.t__children_, data);
      } else {
        owner.t__children_ = [];
      }
      return owner;
    });
    return dataMap;
  }

  dragTable(newSign, oldSign, canDrag) {}

  closeModal() {
    this.showIframeForm = false;
    this.IframeFormUrl = '';
  }

  async setWorkflowAdminManageAuthotity(dataSource) {
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      // 判断当前用户角色
      const isSysAdmin: boolean = info.permissions.includes('SYS_MNG'); // 系统管理员
      const isRootAdmin: boolean = info.permissions.includes('ADMIN'); // 超级管理员

      const isWORKFLOW_ADMIN: boolean =
        info.permissions.includes('WORKFLOW_ADMIN'); // 特权人
      this.workflowAdminManageAuthotity = {};
      if (this.workflowCode) {
        this.getWorkflowAdminManageScopes(this.workflowCode).then(
          (res: any) => {
            if (res.errcode === 0) {
              this.workflowAdminManageAuthotity =
                isSysAdmin || isRootAdmin || res.data.length > 0;
            } else {
              this.$message.error('errmsg');
            }
          },
        );
      } else {
        this.workflowAdminManageAuthotity = isSysAdmin || isRootAdmin;
      }
    }
  }

  async getWorkflowAdminManageScopes(workflowCode) {
    return workflowApi.getWorkflowAdminManageScopes({
      workflowCode: workflowCode,
    });
  }

  get workflowCode() {
    let result = '';
    this.queryActions.forEach((action: any) => {
      if (action.actionCode === 'add' && action.associationType === 1) {
        result = action.associationCode;
      }
    });
    return result;
  }

  //拖拽线条是否高亮

  isGanttResizeHover: boolean = false;

  indexMouseenter() {
    this.isGanttResizeHover = true;
  }

  indexMouseleave() {
    this.isGanttResizeHover = false;
  }

  //中断所有未完成的请求
  interruptAllRequests() {
    if (Vue.prototype.$httpRequestList.length > 0) {
      //强行中断时才向下执行
      Vue.prototype.$httpRequestList.forEach((item: any) => {
        item('interrupt'); //给个标志，中断请求
      });
      //中断后清空用于阻止多次请求的条件
      listApi.resetQueryListStore();
    }
  }

  /**
   * 子表字段设置缓存解析
   */
  analizeSheetCacheData(columnsInCache, columns) {
    if (!columnsInCache || !columnsInCache.length) {
      return;
    }
    columns
      .filter((column) => column.propertyType === 8)
      .forEach((sheet) => {
        const sheetInCache = columnsInCache.find(
          (item) => item.id === sheet.id,
        );
        if (
          sheetInCache &&
          sheetInCache.initChildColumns &&
          sheetInCache.initChildColumns.length
        ) {
          sheet.initChildColumns.forEach((child) => {
            const childInCache = sheetInCache.initChildColumns.find(
              (item) => item.id === child.id,
            );
            if (childInCache) {
              child.isShow = childInCache.isShow;
            } else {
              child.isShow = false;
            }
          });
        }
      });
    this.columns = columns;
    this.cusColumns = this.cusColumns.filter((col: any) => {
      if (col.initChildColumns && col.initChildColumns.length > 0) {
        const initChildColumns = columns.find(
          (item) => item.id === col.id,
        ).initChildColumns;
        col.childColumns = col.childColumns.filter((item) => {
          const colInCache = initChildColumns.find((c) => c.id === item.id);
          return colInCache.isShow;
        });
        if (col.childColumns && col.childColumns.length === 0) {
          this.columns.find((el) => el.id === col.id) &&
            (this.columns.find((el) => el.id === col.id).isShow = false);
        }
        return col.childColumns && col.childColumns.length > 0;
      } else {
        return true;
      }
    });
  }

  get isWorkflowImport() {
    const importAction = this.queryActions.find(
      (item) => item.actionCode === 'import',
    );
    return importAction && importAction.associationType === 1;
  }

  get isCustomScriptOpen() {
    return this.eventHooksHandler ? true : false;
  }

  //自定义视图列表单元格列，向外暴露单元格参数以及接收用户返回的Dom节点
  customScripts(obj: any, callback: any) {
    let name: string;
    obj.colIdx ? (name = 'onCellRender') : (name = 'onRowRender');
    if (this.eventHooksHandler) {
      if (!this.eventHooksHandler.scription.hooks[name]) {
        callback();
        return;
      }

      new Promise((resolve, reject) => {
        this.eventHooksHandler
          .exec(name, obj)
          .then((data) => {
            let item = '';
            item = data;
            resolve(item);
          })
          .catch((err) => {
            console.log(err);
          });
      }).then((datas) => {
        callback(datas);
      });
    }
  }

  //只有在当前模型为甘特图模型且包含层级关系字段时才把接口数据转换为树形数据
  //只有在初始化视图时会调用一次load接口获取权限信息
  async setGanttDataAndPermission(res, vm, isInit) {
    this.flatedListData = [];
    if (this.queryPresentationType === 'GANTT') {
      this.listDataFormatter(
        res.data.content,
        this.flatedListData,
        vm.columns,
        false,
        'gantt',
      );
      console.log(
        'this.flatedListData',
        JSON.parse(JSON.stringify(this.flatedListData)),
      );
      if (isInit) {
        await this.getFormPermission();
      }
    }
  }

  /**
   * 获取权限信息，通过load接口间接获取
   */
  async getFormPermission() {
    if (this.flatedListData.length > 0) {
      const loadParams: any = {
        sheetCode: this.schemaCode,
        schemaCode: this.schemaCode,
        objectId: this.flatedListData[0].id,
        isWorkFlow: false,
        return: '',
        perms: 'edit',
      };
      const res: any = await formApi.load(loadParams);
      this.loadDatas = res.data ? res.data : null;
      console.log('this.formPermission', this.loadDatas.formPermission);
    }
  }

  /**
   * 甘特图表格数据还是使用原来的dataSource,但是在存在层级关系字段且模型不是树形模型时
   * 需要将平铺的数据转换为树形的数据
   */
  foldGanttTreeData(res) {
    if (
      this.queryPresentationType === 'GANTT' &&
      this.listConfig.queryGanttModel.levelPropertyCode &&
      this.listConfig.queryGanttModel.levelPropertyCode !== 'parentId'
    ) {
      res.data.content = this.convertToTreeData(res.data.content);
    }
  }

  //甘特图新增按钮绑定流程时，需要校验是否具有流程编辑权限。只有特权人和系统管理员能在视图上修改甘特图数据
  setGanttWorkflowPermission() {
    if (this.workflowCode && this.queryPresentationType === 'GANTT') {
      this.setWorkflowAdminManageAuthotity(this.dataSource);
    }
  }
}

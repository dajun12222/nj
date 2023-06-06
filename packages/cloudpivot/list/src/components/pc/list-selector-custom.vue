<template>
  <div
    id="list-selector"
    ref="listSelector"
    class="list-selector"
    :class="{ hideSearch: hideSearch, 'list-selector-new': isShowFilterNew }"
  >
    <PageLoading
      v-model="tableLoading"
      shadeColor="#FFFFFF"
      :shadeOpacity="1"
    />

    <div
      class="table"
      :class="{
        'has-filterbox': isShowFilterBox && showSearch,
        'has-action': isReverse && showActions,
        'has-filter-new': isShowFilterNew,
      }"
    >
      <list
        :checkType="checkType"
        :columns="cusColumns"
        :rows="dataSource"
        :checkedKeys="checkedKeys"
        :checkedData="checkedKeysData"
        :sheetParams="sheetParams"
        :subQueryformConditions="subQueryformConditions"
        @check="onCheck"
        @rowClick="onRowClick"
      />

      <div v-show="isLoading" style="text-align: center; padding: 1em">
        <a-spin />
      </div>
    </div>

    <div class="pagination-box">
      <a-pagination
        :current="curPage"
        :total="total"
        :showTotal="(total) => $t('cloudpivot.list.pc.Total', { num: total })"
        :pageSize="pageSize"
        :pageSizeOptions="pageSizeOptions"
        showSizeChanger
        showQuickJumper
        @change="onPaginationChange"
        @showSizeChange="onSizeChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  Button,
  Checkbox,
  Icon,
  Modal,
  Pagination,
  Spin,
  Table,
} from '@h3/antd-vue';
import moment from 'moment';
import {
  Component,
  Model,
  Prop,
  Provide,
  Vue,
  Watch,
  Inject,
} from 'vue-property-decorator';
import { listApi, listParams } from '../../../../api';
import { utils } from '../../../../common';
import common from '../../../../common/pc';
import { renderer, schema } from '../../../../form';
import { deepCopy } from '../../../../form/utils';
import filterCard from './components/filter-card/filter-card.vue';
import ListSearchDefault from './components/list-selector/list-search-default.vue';
import ListSearch from './components/list-selector/list-search.vue';
import queryConditionHelper from './helper/query-conditions';
import * as queryConditionTypings from './helper/query-conditions.typings';
import QueryForm from './list-query-form-new.vue';
import List from './list.vue';
import QueryFormRenderer from 'cloudpivot/list/src/components/pc/components/queryForm/query-form-renderer2.vue';
import {
  QueryDateTypeList,
  QueryOptionType,
  QueryOptionTypeList,
} from 'cloudpivot/form/src/schema/query-type';
import {
  queryData2Conditions,
  conditions2fields,
} from 'cloudpivot/list/src/components/pc/components/queryForm/query-form-util';

import * as Helper from 'cloudpivot/list/src/components/pc/helper/helper';
import { dateFormatter } from 'cloudpivot/form/src/renderer/utils/index';
const GetDateHandle = common.utils.GetDateHandle;

const { DataItemType } = schema;
const { getRealValue } = common.utils.BusinessFunctions;

@Component({
  name: 'list-selector',
  components: {
    AButton: Button,
    AModal: Modal,
    ATable: Table,
    APagination: Pagination,
    ACheckbox: Checkbox,
    AIcon: Icon,
    ASpin: Spin,
    QueryForm,
    List,
    filterCard,
    ListSearch,
    ListSearchDefault,
    QueryFormRenderer,
    PageLoading: common.components.PageLoading,
  },
})
export default class ListSelector extends Vue {
  @Prop({})
  isAuthorize?: string | boolean;

  @Prop({})
  control?: any;

  @Prop({
    default: '',
  })
  listCode!: string;

  @Prop({
    default: '',
  })
  schemaCode!: string;

  @Prop()
  cols!: number;

  @Prop()
  columns!: string[];

  @Prop()
  query!: any[];

  @Prop({
    default: false,
  })
  multiple!: boolean;

  @Model('change', {
    default: () => [],
  })
  value!: any[];

  @Prop({
    default: true,
  })
  selectable!: boolean;

  @Prop({
    default: true,
  })
  defuaultShowSearch!: boolean;

  /**
   * 目前用来区分是反向查询还是关联表单
   */
  @Prop({
    default: true,
  })
  showSearch!: boolean;

  // 区分是否表单点击
  @Prop({
    default: false,
  })
  reverseViewFlag!: boolean;

  // @Prop({
  //   default: false,
  //})
  showSearchBox: boolean = false;

  /**
   * 反向查询自身模型编码
   */
  @Prop({
    default: '',
  })
  reverseSchemaCode!: string;

  /**
   * 反向查询自身表单编码
   */
  @Prop({
    default: '',
  })
  reverseFormCode!: string;

  /**
   * 反向查询控件编码
   */
  @Prop({
    default: '',
  })
  reverseControlCode!: string;

  /**
   *  当前表单id
   */
  @Prop({
    default: '',
  })
  currentFormId!: string;

  /**
   *  当前表单模板id
   */
  @Prop({
    default: '',
  })
  currentSheetId!: string;

  /**
   * 方向关联表单code
   */
  @Prop({
    default: '',
  })
  reverseFormFieldCode!: string;

  @Prop({
    default: false,
  })
  isReverse!: boolean;

  /**
   * 单据状态
   */
  @Prop({
    default: '',
  })
  sequenceStatus!: string;

  @Prop() relevanceFormCode!: any;

  @Prop({
    default: false,
  })
  showActions!: boolean;

  defaultColums: any = [];

  @Prop() newCol!: any;

  get columnsOptsKey() {
    const code: string = this.schemaCode;
    //浏览器两个Tab间存在同一个关联表单同时操作，浏览器缓存共用就会出问题，拼接控件的key值保持唯一
    return `${this.listCode}-${code}_columns_options_select_model`;
  }

  /**
   * 默认附带的查询条件
   */
  @Prop() defaultQuery!: any;

  @Provide()
  getScrollEl() {
    return this.$el;
  }

  @Inject({
    default: () => () => {},
  })
  formObjSource!: Function;

  @Inject()
  getFormControls!: Function;

  /**
   * 关联查询 新增时刷新当前窗口
   */
  mounted() {
    // let that = this
    window.addEventListener('message', this.addMessage, false);
    const listSelector = this.$refs.listSelector as any;
    listSelector.addEventListener('scroll', this.scrolls, false);
  }

  destroyed() {
    const listSelector = this.$refs.listSelector as any;
    listSelector && listSelector.removeEventListener('scroll', this.scrolls);
  }

  addMessage(e) {
    if (typeof e.data === 'string' && e.data.indexOf('/form/detail') > -1) {
      this.reloadMessage();
    }
  }

  scrolls() {
    const listSelector = this.$refs.listSelector as any;
    const listSelectorDefault = this.$refs.listSelectorDefault as any;
    const offset_top: number = listSelector.scrollTop;
    if (offset_top === 0) {
      listSelectorDefault.$el.style.position = 'relative';
    } else {
      listSelectorDefault.$el.style.position = 'sticky';
    }
  }

  reloadMessage() {
    // 判断是否通过新弹出窗新增按钮新增数据
    let isAdd: boolean = false;
    const isAddData = window.localStorage.getItem('relevanceFormAddData');
    if (isAddData && isAddData === 'true') {
      isAdd = true;
      this.getQueryList('search');
      window.localStorage.setItem('relevanceFormAddData', '');
    }
    if (this.isReverse) {
      const queryForm = this.$refs.queryForm as any;
      if (queryForm) {
        queryForm.query();
      }
    }
  }

  get checkType() {
    if (!this.selectable) {
      return '';
    }
    if (this.multiple) {
      return 'checkbox';
    } else {
      return 'radio';
    }
  }

  showMore = true;

  isShowFilterBox: boolean = false;

  isShowFilterNew: boolean = false;

  isLoading = false;

  data: any = {};

  displayColumns: any[] = [];

  dataSource: any[] = [];

  list?: any[];

  queryConditions: Array<listParams.QueryConditions> = [];

  sourceQueryConditions: Array<object> = [];

  editQueryParams: [] = null;

  editQueryTimer = null;

  queryFormRendererInitTimer = null;

  subQueryformConditions: any = {};

  queryAction: any = [];

  total: number = 0;

  pageSize: number = 20;

  curPage: number = 1;

  queryConditionSource: any = []; // 查询条件展示数组

  queryActive: boolean = false; //是否筛选

  showAddAction: boolean = false; //是否显示新增按钮(根据接口返回)

  tableLoading: boolean = false;

  get checkedKeys() {
    return this.value.map((x) => x.id);
  }

  get checkedKeysData() {
    return this.value.map((x) => x);
  }

  get hideSearch() {
    return !this.showSearch;
  }

  get sheetParams() {
    return {
      id: this.currentFormId,
      sheetid: this.currentSheetId,
    };
  }

  // 分页配置项
  pageSizeOptions: string[] = ['10', '20', '50', '100'];

  // 自定义列去除序号和摘要
  cusColumns: Array<any> = [];

  filterData: Array<listParams.Filters> = [];

  @Watch('schemaCode', {
    immediate: true,
  })
  onSchemaCodeChange() {
    if (!this.schemaCode) {
      return;
    }

    this.getListConfigData();
  }

  @Watch('queryFormRendererFields', {
    immediate: false,
  })
  onQeryFormRendererFieldsChange() {
    this.$nextTick(() => {
      const ref: any = this.$refs.QueryFormRenderer;
      ref && ref.init();
    });
  }

  //查看表单详情
  async goFormCustom(bizObjectId: string, schemaCode: string) {
    const params: any = {
      bizObjectId: bizObjectId,
      schemaCode: schemaCode,
    };
    const res = await listApi.getFormUrl(params);
    // 如果报错, 会返回一个对象
    if (typeof res === 'object' && res.errcode !== 0) {
      return this.$message.error(res.errmsg as string, 3);
    }
    // 否则返回一个字符串
    else if (typeof res === 'string') {
      const res1: any = res;
      // if (res1.indexOf('sheetCode') !== -1 && sheetCodes) {
      //   let urlParts = (res as string).split('sheetCode=');
      //   res1 =
      //     urlParts[0] +
      //     'sheetCode=' +
      //     sheetCodes +
      //     '&' +
      //     urlParts[1].split('&').slice(1).join('&');
      // }
      const questionPosition = location.href.indexOf('?');
      const search =
        location.href.substring(questionPosition) + '&iframeAction=detail';
      let url = this.isDingTalk
        ? `${res1}&return=${location.pathname}`
        : `${res1}&return=${location.pathname + encodeURIComponent(search)}`;
      url = (location.origin ? location.origin : '') + url;
      window.open(url);
    } else {
      //Else Empty block statement
    }
  }

  onCheck(checkeds: any[], currentRow: any) {
    if (checkeds[0]) {
      this.goFormCustom(checkeds[0].id, checkeds[0].schemaCode);
    }
    // if (this.multiple) {
    //   let val: any[] = [];
    //   if (this.value) {
    //     val = deepCopy(this.value);
    //     if (currentRow) {
    //       currentRow.forEach((item) => {
    //         if (!item.isChecked && item.row) {
    //           let delIndex = val.findIndex((x: any) => x.id === item.row.id);
    //           val.splice(delIndex, 1);
    //           this.$emit('change', val);
    //         } else if (item.isChecked && item.row) {
    //           let row: any = item.row;
    //           if (row) {
    //             const arr = val.filter((i) => i.id === row.id);
    //             if (arr.length <= 0) {
    //               val.push(row);
    //             } else {
    //               val = val.map((i) => {
    //                 if (i.id === row.id) {
    //                   i = row;
    //                 }
    //                 return i;
    //               });
    //             }
    //           }
    //           this.$emit('change', val);
    //         }
    //       });
    //       // if (currentRow && !currentRow.isChecked && currentRow.row) {
    //       //   let delIndex = val.findIndex((x: any) => x.id === currentRow.row.id);
    //       //   val.splice(delIndex, 1);
    //       //   this.$emit('change', val);
    //       // } else if (currentRow && currentRow.isChecked && currentRow.row) {
    //       //   let row: any = currentRow.row;
    //       //   if (row) {
    //       //     const arr = val.filter((i) => i.id === row.id);
    //       //     if (arr.length <= 0) {
    //       //       val.push(row);
    //       //     } else {
    //       //       val = val.map((i) => {
    //       //         if (i.id === row.id) {
    //       //           i = row;
    //       //         }
    //       //         return i;
    //       //       });
    //       //     }
    //       //   }
    //       //   this.$emit('change', val);
    //     } else {
    //       this.$emit('change', checkeds);
    //     }
    //   } else {
    //     this.$emit('change', checkeds);
    //   }
    // } else {
    //   this.$emit('change', checkeds);
    // }
  }

  created() {
    this.tableLoading = true;
    setTimeout(() => {
      this.tableLoading = false;
    }, 2000);
  }

  /**
   * 展示搜索条件
   */
  toggleQueryConditions() {
    this.showSearchBox = !this.showSearchBox;
  }

  /**
   * 清空
   */
  clearFilter() {
    this.queryConditionSource = [];
    this.filterData = [];
    this.$nextTick(() => {
      const queryForm: any = this.$refs.queryForm;
      queryForm.clearFilters();

      this.getQueryList();
    });
  }

  onRowClick(row: any) {
    if (row) {
      this.goFormCustom(row.id, row.schemaCode);
    }
    // if (this.isReverse) {
    // const params = {
    //   bizObjectId: row.id,
    //   schemaCode: row.schemaCode,
    // };
    // listApi.getFormUrl(params).then((res: any) => {
    //   if (this.isDingTalk) {
    //     res += `&return=${
    //       location.pathname + encodeURIComponent(location.search)
    //     }`;
    //     this.$router
    //       .push({
    //         path: res,
    //       })
    //       .catch((err: any) => {
    //         err;
    //       });
    //   } else {
    //     window.open(res);
    //   }
    // });
    // } else {
    //   if (this.multiple) {
    //     let val = [row];
    //     if (this.value) {
    //       // val = JSON.parse(JSON.stringify(this.value));
    //       // JSON.parse会改变数据类型
    //       val = deepCopy(this.value);
    //       const curRow = val.find((res) => {
    //         return res.id === row.id;
    //       });
    //       if (curRow) {
    //         val.splice(val.indexOf(curRow), 1);
    //       } else {
    //         val.push(row);
    //       }
    //     }
    //     this.$emit('change', val);
    //   } else {
    //     this.$emit('change', [row]);
    //   }
    // }
  }

  openForm() {
    const ac = this.queryAction.find((x) => x.actionCode === 'add');
    if (ac) {
      this.handleAdd(ac);
    }
  }

  handleAdd(obj) {
    const sequenceStatus: any = {};
    let url: string = '';
    const code = obj.associationCode;
    if (obj.associationType === 1) {
      // 关联流程

      if (this.sequenceStatus && this.sequenceStatus !== 'DRAFT') {
        url = `/form/detail?startWorkflowCode=${code}&${this.reverseFormFieldCode}=${this.currentFormId}`;
      } else {
        url = `/form/detail?startWorkflowCode=${code}`;
      }
    } else {
      // 关联表单
      const schemaCode = obj.schemaCode;
      if (this.sequenceStatus && this.sequenceStatus !== 'DRAFT') {
        url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${code}&${this.reverseFormFieldCode}=${this.currentFormId}`;
      } else {
        url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${code}`;
      }
    }

    url += `&return=${location.pathname + encodeURIComponent(location.search)}`;
    if (this.isDingTalk) {
      sessionStorage.setItem('backList', 'false');
      this.$router.push(url).catch((err: any) => {
        console.log(err);
      });
    } else {
      const opens = window.open(url);
    }
  }

  /*
   * 初始化表格表头信息
   */
  initColumns() {
    const columnsArray = this.data.queryColumns.filter(
      (a: any) => a.propertyCode,
    );
    const columns: any[] = columnsArray.map((c: any) => ({
      vcTitle: c.name,
      dataIndex: c.propertyCode,
      width: c.width ? Number(c.width) : 176,
      slots: { title: `${c.propertyCode}Title` },
      propertyType: c.propertyType,
    }));

    this.cusColumns = JSON.parse(JSON.stringify(columnsArray));
    this.defaultColums = JSON.parse(JSON.stringify(columnsArray));

    // columns.splice(0, 0, {
    //   width: 250,
    //   dataIndex: 'name',
    //   slots: {title: 'nameTitle'},
    //   scopedSlots: {customRender: 'name'}
    //});

    columns.splice(0, 0, {
      width: 100,
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      scopedSlots: { customRender: 'index' },
    });

    this.displayColumns = columns;
  }

  /*
   * 分页改变
   */
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.getQueryList('pageChange');
  }

  /*
   * 分页pageSize改变
   */
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getQueryList('pageChange');
  }

  /*
   * 重新加载
   */
  reload() {
    this.getListConfigData();
  }

  /*
   * 获取模型的配置信息
   */
  async getListConfigData() {
    const params: any = {
      code: this.listCode,
      schemaCode: this.schemaCode,
      source: 1,
    }; // test datang01
    this.isLoading = true;
    const Res = await listApi.getListConfigData(params);
    if (Res && Res.errcode === 0 && Res.data) {
      const queryActions = Res.data.queryActions;
      let formCode;
      for (let i = 0; i < queryActions.length; i++) {
        if (queryActions[i] && queryActions[i].actionCode === 'add') {
          formCode = queryActions[i].associationCode;
          this.showAddAction = true;
          break;
        }
      }
      params.formCode = formCode;
    }
    const res = await listApi.getListConfigData(params);
    this.isLoading = false;
    if (res.errcode === 0) {
      this.sourceQueryConditions = res.data.queryConditions;
      try {
        // 如果配置了查询条件，使用配置的，如果没有就使用关联目标视图中配置的查询条件
        if (this.control) {
          const conditions = JSON.parse(this.control.options.conditions);
          if (conditions.$queryData) {
            //将返回queryConditions数据更多信息赋值给res.data.queryConditions
            conditions.$queryData.forEach((ele) => {
              const Item =
                (res.data.queryConditions &&
                  res.data.queryConditions.find((item) => {
                    return ele.propertyCode === item.propertyCode;
                  })) ||
                {};
              ele = Object.assign(ele, Item);
            });
            res.data.queryConditions = conditions.$queryData;
          }
        }
      } catch (error) {}

      // 如果是关联表单过滤,去掉单据状态选项，直接给出状态为已完成的列表
      // if (this.relevanceFormCode) {
      //   if (Array.isArray(res.data.queryConditions)) {
      //     this.queryConditions = res.data.queryConditions.filter(
      //       (item: any) => {
      //         return item.propertyCode !== "sequenceStatus";
      //      }
      //     );
      //  }
      //} else {

      /*单据状态可以作为查询条件 @刘青*/
      this.queryConditions = res.data.queryConditions;
      //}
      this.queryAction = res.data.queryActions;
      this.subQueryformConditions = res.data.queryConditionMap;

      if (Array.isArray(this.query) && this.queryConditions) {
        this.query.forEach((x) => {
          const item = this.queryConditions.find(
            (q: any) => q.propertyCode === x.code,
          );
          if (item) {
            switch (item.propertyType) {
              case DataItemType.Date:
              case DataItemType.Time:
              case DataItemType.Number:
                if (x.value !== '') {
                  item.defaultValue = [x.value, x.value];
                }
                break;
              case DataItemType.Logic:
                if (typeof x.value === 'string') {
                  if (x.value === 'false' || x.value === '否') {
                    item.defaultValue = false;
                  } else {
                    item.defaultValue = true;
                  }
                } else {
                  item.defaultValue = x.value;
                }
                break;
              case DataItemType.RelevanceForm:
                if (x.value !== undefined && x.value !== null) {
                  if (typeof x.value === 'object') {
                    if (x.value.id) {
                      // 关联表单
                      item.defaultValue = { id: x.value.id };
                    }
                  } else {
                    item.defaultValue = { id: x.value };
                  }
                }
                break;
              default:
                if (x.value !== undefined && x.value !== null) {
                  item.defaultValue = x.value;
                }
                break;
            }
          }
        });
      }

      // ;
      // if (!this.queryConditions || this.queryConditions.length <= 0) {
      //   this.isShowFilterBox = false;
      setTimeout(() => {
        this.getQueryList();
      }, 500);
      // } else {
      //   this.isShowFilterBox = true;
      // }
      if (this.relevanceFormCode && this.newCol.length > 0) {
        res.data.queryColumns = this.newCol;
      }
      let newColumns = res.data.queryColumns.map((e) => {
        // e.code = e.code === "id" ? "ids" : e.code;
        // e.propertyCode = e.code;
        e.isShow = true;
        e.vcTitle = e.name;
        e.childColumns &&
          e.childColumns.forEach((i) => {
            i.vcTitle = i.name;
            i.width = '150';
            i.isShow = true;
          });
        return e;
      });
      const columnOpts: any = window.localStorage.getItem(this.columnsOptsKey);
      if (columnOpts) {
        const _column: any = JSON.parse(columnOpts);
        // this.cusColumns = _column.filter((col:any) => col.isShow);
        const showColumns = _column.filter((col: any) => col.isShow);
        // 记录列是否全在请求列中
        const isAllIncluded: boolean = showColumns.every(
          (col: any) =>
            !!res.data.queryColumns.find(
              (innerCol: any) => innerCol.propertyCode === col.propertyCode,
            ),
        );
        if (isAllIncluded) {
          // 把剩余列修改成不显示
          const fCols: any = res.data.queryColumns
            .map((col: any) => {
              const item: any = _column.find(
                (innerCol: any) => col.propertyCode === innerCol.propertyCode,
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
              const item: any = res.data.queryColumns.find(
                (innerCol: any) => col.propertyCode === innerCol.propertyCode,
              );
              if (item) {
                if (item.propertyType === DataItemType.Sheet) {
                  const childColumns = col.childColumns;
                  item.childColumns.forEach((o) => {
                    const i = col.childColumns.find(
                      (innerCol: any) =>
                        o.propertyCode === innerCol.propertyCode,
                    );
                    if (!i) {
                      childColumns.push(o);
                    }
                  });
                  item.childColumns = col.childColumns;
                }
                item.isShow = col.isShow;
                /*
                if (item) {
                  let childShow =
                    item.childColumns &&
                    item.childColumns.filter((i) => i.isShow);

                  if (childShow && childShow.length > 0) {
                    item.isShow = true;
                 } else {
                    item.isShow = col.isShow;
                 }
               }*/
                return item;
              }
            })
            .filter((col: any) => !!col);
          newColumns = _showColumns.concat(fCols);
          this.cusColumns = showColumns.concat(fCols);
          //把请求列中子表的数据更新到记录列中
          this.cusColumns.forEach((c: any) => {
            const source: any = res.data.queryColumns.find(
              (r: any) => r.propertyCode === c.propertyCode,
            );
            if (source) {
              c.childColumns = source.childColumns;
              c.width = source.width;
              c.displayFormat = source.displayFormat;
              c.sumType = source.sumType;
              c.vcTitle = source.vcTitle;
              c.isShow = source.isShow;
            }
          });
        } else {
          // 记录列是否全不在请求列中
          let isAllNotInclude: boolean = true;
          showColumns.forEach((sCol: any) => {
            const f: boolean = !!res.data.queryColumns.find(
              (innerCol: any) => innerCol.propertyCode === sCol.propertyCode,
            );
            if (!f) {
              isAllNotInclude = true;
            } else {
              isAllNotInclude = false;
            }
          });
          if (isAllNotInclude) {
            // 都不在，使用请求列，清空记录
            this.cusColumns = res.data.queryColumns;
            newColumns = res.data.queryColumns;
            window.localStorage.removeItem(this.columnsOptsKey);
          } else {
            // 部分在
            // 1. 找出展示列
            const sCols: any = showColumns
              .map((col: any) => {
                const c: any = res.data.queryColumns.find(
                  (innerCol: any) => col.propertyCode === innerCol.propertyCode,
                );
                if (c) {
                  c.isShow = true;
                  return c;
                }
              })
              .filter((col: any) => !!col);
            this.cusColumns = sCols;

            // 2. 把剩余列修改成不显示
            const fCols: any = res.data.queryColumns
              .map((col: any) => {
                const item: any = sCols.find(
                  (innerCol: any) => col.propertyCode === innerCol.propertyCode,
                );
                if (!item) {
                  col.isShow = false;
                  return col;
                }
              })
              .filter((col: any) => !!col);
            newColumns = sCols.concat(fCols);
            //把请求列中子表的数据更新到记录列中
            this.cusColumns.forEach((c: any) => {
              const source: any = res.data.queryColumns.find(
                (r: any) => r.propertyCode === c.propertyCode,
              );
              if (source) {
                c.childColumns = source.childColumns;
                c.width = source.width;
                c.displayFormat = source.displayFormat;
                c.sumType = source.sumType;
                c.vcTitle = source.vcTitle;
                c.isShow = source.isShow;
              }
            });
          }
        }
      }
      res.data.queryColumns =
        newColumns && newColumns.length > 0
          ? newColumns
          : res.data.queryColumns;
      this.data = res.data;
      if (res.data.queryColumns) {
        this.initColumns();
      }

      // this.getQueryList();
    } else {
      this.$message.error(res.errmsg);
      // this.isShowTableBox = false;
      // this.isShowLoadFailBox = true;
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
      default:
        return 'YYYY-MM-DD';
    }
  }

  get searchFormula() {
    const _searchFormula =
      this.relevanceFormCode && this.relevanceFormCode.options.searchFormula;
    const searForm = _searchFormula && JSON.parse(_searchFormula);
    if (_searchFormula && Array.isArray(searForm)) {
      const result: any[] = [];
      searForm.forEach((item: any) => {
        result.push(item.conditions);
      });
      //每组查询条件的value改成propertyValue，
      result.forEach((item) => {
        item.forEach((el) => {
          el.propertyValue =
            typeof el.value === 'string' ? el.value : JSON.stringify(el.value);
          delete el.value;
        });
      });
      return result;
    } else {
      return _searchFormula ? searForm.conditions : []; //兼容历史数据
    }
  }

  /*
   * 查询列表数据参数
   */
  queryParamsFormater() {
    const queryCondition = [];
    let filters = JSON.parse(JSON.stringify(this.filterData));
    if (this.defaultQuery && this.defaultQuery.length > 0) {
      const defaultQuery: any[] = [];
      this.defaultQuery.forEach((q) => {
        const curFilter = filters.find((f) => f.propertyCode === q.code);
        if (curFilter) {
          curFilter.propertyValue = q.value;
        } else {
          defaultQuery.push(q);
        }
      });
      filters = filters.concat(defaultQuery);
    }

    const code =
      this.$store &&
      this.$store.state &&
      this.$store.state.WorkflowCenter &&
      this.$store.state.WorkflowCenter.WorkflowCenter.code;

    let reverseSchemaParam: any = null;
    if (this.relevanceFormCode) {
      let relevanceFormCode = this.relevanceFormCode.parentKey
        ? `${this.relevanceFormCode.parentKey}.${this.relevanceFormCode.key}`
        : this.relevanceFormCode.key;
      if (this.relevanceFormCode.path) {
        relevanceFormCode = this.relevanceFormCode.path.join('.');
      }
      reverseSchemaParam = {
        reverseRelevanceFormCode: relevanceFormCode,
        reverseSchemaCode: code
          ? code.split('-')[0]
          : this.$route.query.schemaCode || this.$route.query.code,
        reverseSheetCode: code
          ? code.split('-')[1]
          : this.$route.query.sheetCode || this.$route.query.code,
      };
      // 关联表单只查单据状态为已完成的列表
      filters.push({
        propertyCode: 'sequenceStatus',
        propertyType: 0,
        propertyValue: 'PROCESSING;COMPLETED',
      });
    }
    // 添加关联表单添加的过滤条件
    if (
      this.relevanceFormCode &&
      this.relevanceFormCode.options.showStyle !== 'tree'
    ) {
      queryCondition[0] = this.searchFormula;
      queryCondition[1] = filters.length ? [filters] : []; //目前查询条件只有且条件，因此查询条件外套一层数组
      if (this.editQueryParams) {
        queryCondition[1] = this.editQueryParams || [];
      }
      const statusObj = {
        propertyCode: 'sequenceStatus',
        propertyType: 0,
        propertyValue: 'DRAFT',
        queryFilterType: 'NotEq',
      };
      if (Array.isArray(queryCondition[1][0])) {
        queryCondition[1][0].push(statusObj);
      } else {
        queryCondition[1][0] = [statusObj];
      }
    } else {
      queryCondition[0] = [];
      queryCondition[1] = [];
    }
    const params: listParams.QueryListParams = {
      /* filters, */
      queryCondition,
      queryVersion: 1,
      mobile: false,
      page: this.curPage - 1,
      queryCode: this.listCode,
      schemaCode: this.schemaCode,
      size: this.pageSize,
      reverseSchemaParam: reverseSchemaParam,
      reverseViewFlag: this.reverseViewFlag,
    };
    if (this.reverseSchemaCode) {
      params.reverseSchemaCode = this.reverseSchemaCode;
      params.reverseCode = this.reverseControlCode;
      params.formCode = this.reverseFormCode;
    }
    return params;
  }

  /**
   * 字段排序筛选之后重新渲染表格
   */
  reRenderTable(columns: any) {
    this.cusColumns = columns.filter((col: any) => col.isShow);
    // 更新columns状态
    this.data.queryColumns = JSON.parse(JSON.stringify(columns));
    this.rowsFormatter(this.cusColumns);

    this.saveColumnsOpts(columns);
  }

  /**
   * 字段信息存入本地缓存
   */
  saveColumnsOpts(columns: any) {
    const jsonStr: string = JSON.stringify(columns);
    window.localStorage.setItem(this.columnsOptsKey, jsonStr);
  }

  /**
   * 回复默认设置
   */
  recovery() {
    this.cusColumns = this.defaultColums;
    this.data.queryColumns = this.defaultColums;
    this.rowsFormatter(this.defaultColums);

    window.localStorage.removeItem(this.columnsOptsKey);
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
    this.dataSource = data;
    return newRows; // 初次加载默认设置
  }

  // 监听当通过列表新增按钮打开新标签页添加数据

  /*
   * 获取查询列表数据
   */
  async getQueryList(type?: string) {
    const vm: any = this;
    // this.dataSource = [];
    this.list = [];
    this.isLoading = true;
    // const params = this.queryParamsFormater();
    const params: any = {
      filters: [],
      mobile: false,
      page: this.curPage - 1,
      queryCode: this.listCode,
      queryCondition: [],
      queryVersion: 1,
      schemaCode: this.schemaCode,
      size: this.pageSize,
    };
    // if (!this.showSearch && this.query && this.query.length > 0) {
    // const items = this.query.map((x: any) => ({
    //   propertyCode: x.code,
    //   propertyType: x.type,
    //   propertyValue: x.value
    //}));
    // params.filters = params.filters.concat(items);
    //   for (const item of this.query) {
    //     if (params.filters.find((x) => x.propertyCode === item.code)) {
    //       break;
    //     }

    //     let val: any = item.value;
    //     if (item.type === 3) {
    //       // 日期格式
    //       val = moment(val).format('YYYY-MM-DD');
    //     }

    //     if ([50, 51, 60, 61].includes(item.type) && val) {
    //       val = JSON.parse(JSON.stringify(val));
    //       val.forEach((element) => {
    //         if (!element.unitType) {
    //           element.unitType = type;
    //         }
    //       });
    //       val = JSON.stringify(val);
    //     }

    //     if (
    //       item.type === schema.DataItemType.Number ||
    //       item.type === schema.DataItemType.Date
    //     ) {
    //       val = val + ';';
    //     }

    //     const statusType = {
    //       已完成: 'COMPLETED',
    //       进行中: 'PROCESSING',
    //     };
    //     val = statusType[val] || val;
    //     params.filters.push({
    //       propertyCode: item.code,
    //       propertyType: item.type,
    //       propertyValue: val,
    //       // @ts-ignore
    //       operatorType: item.op === 'NotEq' ? 2 : undefined,
    //     });
    //   }
    // }

    // if (this.isAuthorize === 'Optional' && this.control) {
    //   // 关联表单 临时授权配置为可选时，添加参数
    //   // console.log(this.control);
    //   const options = this.control.options;
    //   const sheetParams: any = options.sheetParams;
    //   const sheetId = sheetParams.sheetid;
    //   const id = sheetParams.id;
    //   params.tempAuthSheetId = sheetId;
    //   params.tempAuthObjectId = id;
    //   params.tempAuthPropertyCode = this.control.key;
    // }

    const res = !this.isReverse
      ? await listApi.getQueryList(params)
      : await listApi.queryReverse(params);

    this.isLoading = false;
    if (res.errcode === 0) {
      this.dataSource = [];
      this.list = res.data.content.map((x: any) => {
        x.data.ids = x.data.id;
        x.data.schemaCode = x.schemaCode;
        return x.data;
      });
      const dataSource: any[] = [];
      res.data.content.forEach((item: any, index: number) => {
        item.data.ids = item.data.id;
        item.data.index = index + 1;
        item.data.key = index;
        item.data.isChecked = false;
        this.data.queryColumns.forEach((i) => {
          // console.log(
          //   i.propertyType === DataItemType.Sheet &&
          //     Array.isArray(item.data[i.propertyCode]) &&
          //     Array.isArray(i.childColumns),
          //   "i.propertyType === DataItemType.Sheet"
          // );
          if (
            i.propertyType === DataItemType.Attachment &&
            !!item.data[i.propertyCode] &&
            Array.isArray(item.data[i.propertyCode])
          ) {
            item.data[i.propertyCode] = item.data[i.propertyCode].map((v) => {
              // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
              v.isImage = /^image\//.test(v.mimeType);
              v.url = renderer.UploadControl.service.getDownloadUrl(v);
              return v;
            });
          }
          // 对富文本
          else if (
            i.propertyType === DataItemType.LongText &&
            /<\/?[a-zA-Z]+("[^"]*"|'[^']*'|[^'">])*>/.test(
              item.data[i.propertyCode],
            )
          ) {
            item.data[i.propertyCode] = '该内容不支持展示';
          }
          // 对子表
          else if (
            i.propertyType === DataItemType.Sheet &&
            Array.isArray(item.data[i.propertyCode]) &&
            Array.isArray(i.childColumns)
          ) {
            // 子表数据项做本地分页，sourceValue为原数据
            item.data[i.propertyCode] = item.data[i.propertyCode].map((val) => {
              i.childColumns.map((childCol: any) => {
                // 对附件(子表)
                if (
                  childCol.propertyType === DataItemType.Attachment &&
                  !!val[childCol.propertyCode] &&
                  Array.isArray(val[childCol.propertyCode])
                ) {
                  val[childCol.propertyCode] = val[childCol.propertyCode].map(
                    (v) => {
                      // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
                      v.isImage = /^image\//.test(v.mimeType);
                      v.url = renderer.UploadControl.service.getDownloadUrl(v);
                      return v;
                    },
                  );
                }
                // 地址
                else if (
                  childCol.propertyType === DataItemType.Address &&
                  !!val[childCol.propertyCode]
                ) {
                  const isJson = this.isJSON(val[childCol.propertyCode]);
                  if (isJson) {
                    val[childCol.propertyCode] = getRealValue(
                      childCol,
                      val[childCol.propertyCode],
                    );
                  }
                }
                // 关联单选
                else if (
                  childCol.propertyType === DataItemType.RelevanceForm &&
                  !!val[childCol.propertyCode]
                ) {
                  //关联单选中关联的是地址类型控件的话value为字符串JSON，这里目前先使用是否json来判断
                  const isJson = this.isJSON(val[childCol.propertyCode]);
                  if (isJson) {
                    val[childCol.propertyCode] = getRealValue(
                      childCol,
                      val[childCol.propertyCode],
                    );
                  }
                }
                // 关联多选
                else if (
                  childCol.propertyType === DataItemType.RelevanceFormEx &&
                  !!val[childCol.propertyCode]
                ) {
                  //关联多选中关联的是地址类型控件的话value为字符串JSON，这里目前先使用是否json来判断
                  let isJson = false;
                  let valueList = [];
                  if (val[childCol.propertyCode].indexOf(';') > -1) {
                    valueList = val[childCol.propertyCode].split(';');
                    //@ts-ignore
                    isJson = this.isJSON(valueList[0]);
                  }
                  if (isJson) {
                    val[childCol.propertyCode] = '';
                    valueList.forEach((ele) => {
                      val[childCol.propertyCode] += `${getRealValue(
                        childCol,
                        ele,
                      )};`;
                    });
                  }
                }
                // 对富文本（子表）
                else if (
                  childCol.propertyType === DataItemType.LongText &&
                  /<\/?[a-zA-Z]+("[^"]*"|'[^']*'|[^'">])*>/.test(
                    val[childCol.id],
                  )
                ) {
                  val[childCol.id] = '该内容不支持展示';
                } else {
                  //Else Empty block statement
                }
                return childCol;
              });
              return val;
            });
          } else {
            //Else Empty block statement
          }
          return i;
        });

        dataSource.push(item.data);
      });
      this.dataSource = dataSource;
      this.total = res.data.totalElements;
      setTimeout(() => {
        this.tableLoading = false;
      }, 100);
    } else {
      // this.isShowTableBox = false;
      // this.isShowLoadFailBox = true;
      this.tableLoading = false;
    }
  }

  isJSON(str) {
    if (typeof str === 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj === 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  }

  getRelevanceDataList(res) {
    console.log('getRelevanceDataList ==>', res);
  }

  queryFormRendererQuery(res) {
    console.log('queryFormRendererQuery ==>', res);
    this.editQueryParams = res;
    clearTimeout(this.editQueryTimer);
    this.editQueryTimer = setTimeout(() => {
      this.getQueryList();
    }, 500);
  }

  showFilterNewClick(isShowFilterNew) {
    this.isShowFilterNew = isShowFilterNew;
  }

  get queryFormRendererFields() {
    let queryFormRendererFields = JSON.parse(
      JSON.stringify(this.sourceQueryConditions),
    );
    const _this = this;
    try {
      if (this.control && this.control.options.conditions) {
        const conditions = JSON.parse(this.control.options.conditions);
        queryFormRendererFields = queryData2Conditions(
          conditions,
          this.getFormControls(),
          this.formObjSource(),
        );
      }
    } catch (error) {
      console.log('queryFormRendererFields ==>2', error);
    }

    queryFormRendererFields = conditions2fields(
      queryFormRendererFields || [],
      this,
    );
    return queryFormRendererFields;
  }

  setDateByDateType(type: any, format: string) {
    let start: string = '';
    let end: string = '';
    let date: Array<string> = [];
    if (typeof type === 'string') {
      type = Number(type);
    }
    switch (type) {
      /* 当天 */
      case 9:
        start = dateFormatter(moment().startOf('days').toString(), format);
        end = dateFormatter(moment().endOf('days').toString(), format);
        break;
      /* 最近一周 */
      case 1:
        start = dateFormatter(
          moment(GetDateHandle.getLatelyWeek()).startOf('days').toString(),
          format,
        );
        end = dateFormatter(moment().endOf('days').toString(), format);
        break;
      /* 最近一月 */
      case 2:
        start = dateFormatter(
          moment(GetDateHandle.getLatelyMonth()).startOf('days').toString(),
          format,
        );
        end = dateFormatter(moment().endOf('days').toString(), format);
        break;
      /* 最近一季度 */
      case 3:
        start = dateFormatter(
          moment(GetDateHandle.getLatelyQuarter()).startOf('days').toString(),
          format,
        );
        end = dateFormatter(moment().endOf('days').toString(), format);
        break;
      /* 最近一年 */
      case 4:
        start = dateFormatter(
          moment(GetDateHandle.getLatelyYear()).startOf('days').toString(),
          format,
        );
        end = dateFormatter(moment().endOf('days').toString(), format);
        break;
      /* 本周 */
      case 5:
        date = GetDateHandle.getThisWeek();
        start = date[0];
        end = dateFormatter(moment().endOf('week').toString(), format);
        break;
      /* 本月 */
      case 6:
        date = GetDateHandle.getThisMonth();
        start = date[0];
        end = dateFormatter(moment().endOf('month').toString(), format);
        break;
      /* 本季度 */
      case 7:
        date = GetDateHandle.getThisQuarter();
        start = date[0];
        end = dateFormatter(moment().endOf('quarter').toString(), format);
        break;
      /* 本年 */
      case 8:
        date = GetDateHandle.getThisYear();
        start = date[0];
        end = dateFormatter(moment().endOf('year').toString(), format);
        break;
      /* 默认值 */
      default:
        break;
    }
    return [start, end];
  }
}
</script>

<style lang="less" scoped>
@import './../../../../common/common';
/deep/.ant-table-thead > tr > th,
/deep/.ant-table-tbody > tr > td {
  padding: 8px 10px;
}

.list-selector {
  position: relative;
  // overflow: hidden;
  display: flex;
  flex-direction: column;
  .filters-box {
    position: absolute;
    width: 100%;
    z-index: 666;
    background: #fff;

    /deep/.collapsed {
      // height: 100%;
      // overflow: auto;
    }
    &.show-more {
      height: 100%;
      overflow: auto;
    }
  }

  .table.has-filterbox {
    // padding-top: 64px;
    padding-top: 4px;
    // margin-top: 48px;
  }
  .table.has-filterbox.has-action {
    margin-top: 4px;
  }
  // .actions {
  // text-align: right;

  // margin-bottom: 8px;
  //}
  .actions.has-filterbox {
    margin-top: 48px;
  }
  &.hideSearch > .table {
    padding-top: 0;
  }

  .pagination-box {
    margin-top: @base4-padding-md;
    text-align: right;
    /*margin-bottom: 10px;*/
    /deep/.ant-pagination > li {
      border-radius: 2px;
      a,
      div,
      input {
        border-radius: 2px;
      }
      .ant-select-arrow {
        right: 7px;
      }
    }
  }

  /deep/.ant-pagination-total-text {
    margin-right: 11px;
    height: 22px;
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    line-height: 22px;
  }

  /deep/.ant-pagination-options {
    margin-left: 8px;
  }
}
.cBMoadalList {
  .table {
    height: calc(100% - 95px);
    overflow: hidden;
    .list {
      height: 100%;
      /deep/ .sheet {
        height: calc(100% - 10px);
      }
    }
    &.has-filter-new {
      height: calc(100% - 350px);
      flex: 1;
    }
  }
  .table /deep/ .sheet .sheet__body {
    height: calc(100% - 77px);
    overflow-x: auto;
    overflow-y: overlay;
    //padding: 0 0 20px 0;
  }
  .query-box {
    position: absolute;
    display: flex;
    max-height: 400px;
    width: 344px;
    background-color: #fff;
    z-index: 100;
    top: 36px;
    right: 0;
    padding-top: 24px;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    .filter-box {
      z-index: 3;
    }
    .filter-mask {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0);
      z-index: 1;
    }
  }
}
</style>

<style lang="less">
.relevance-form:not(.full-modal) .ant-modal-body .list-selector-new {
  height: 66vh;
}
</style>

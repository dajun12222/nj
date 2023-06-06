<!--
 * @Descripttion: 子表弹窗
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-12-01 17:58:02
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-30 19:21:23
-->
<template>
  <div class="form-sheet-modal-box">
    <a-modal
      :visible="visible"
      :title="title"
      width="1200px"
      :footer="null"
      :keyboard="false"
      centered
      :maskClosable="false"
      dialogClass="form-sheet-modal"
      @cancel="close"
    >
      <div class="option-box">
        <div
          v-if="subQueryCondition"
          class="table-toolbar-box-li"
          :class="{ 'high-light': isShowFilterBox || queryActive }"
          @click="toggleQueryConditions"
        >
          <i class="icon aufontAll h-icon-all-screen"></i>
          {{ $t('cloudpivot.list.pc.Screen') }}
        </div>
        <div v-show="isShowFilterBox" ref="filtersBox" class="filters-box">
          <query-form
            ref="subQueryForm"
            :fields="subQueryCondition"
            :relevanceDataList="relevanceDataList"
            :dataItemList="dataItemList"
            @getRelevanceDataList="getRelevanceDataList"
            @setFilterData="setFilterData"
            @hide="hideQueryItem"
          />
        </div>
      </div>
      <div class="form-sheet-box">
        <!-- <a-table
          class="form-sheet-table"
          :columns="columns"
          :data-source="currentPageData"
          :pagination="false"
          :scroll="{ x: 1300 }"
          :bordered="true"> -->
        <!-- <a slot="name" slot-scope="text, record">
            {{ text }}
          </a> -->
        <!-- </a-table> -->

        <custom-template
          ref="sheetListCustomTemplate"
          class="custom-template-container"
          :pageVM="pageVM"
          :sortConfig="
            listConfig
              ? listConfig.querySorts
                ? listConfig.querySorts
                : []
              : []
          "
          :tableConfig="tableConfig"
          :originalTableColumns="columns"
          :originalTableData="currentPageData"
          :originalNumberData="numberData"
          :modelType="'LIST'"
          :isOpen="false"
          @bySortGetQueryList="func"
          @onCheck="func"
          @onResizeEnd="func"
        />
      </div>

      <a-pagination
        v-model="current"
        class="pagination-footer"
        :pageSizeOptions="pageSizeOptions"
        :total="total"
        :showTotal="(total) => `共${total}条`"
        showSizeChanger
        :pageSize="pageSize"
        showQuickJumper
        :defaultPageSize="20"
        @change="onChange"
        @showSizeChange="showSizeChange"
      />
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Modal, Table, Pagination } from '@h3/antd-vue';
import moment from 'moment';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import { DataItemType } from '../../../../../../list/src/typings/data-items';

@Component({
  name: 'form-sheet-modal',
  components: {
    AModal: Modal,
    ATable: Table,
    APagination: Pagination,
    QueryForm: () =>
      import(/* webpackChunkName: "CustomTemplate" */ '../query-form.vue'),
    CustomTemplate: () =>
      import(
        /* webpackChunkName: "CustomTemplate" */ '../../listCustomTemplate.vue'
      ),
    // CustomTemplate: CustomTemplate,
  },
})
export default class FormSheetModal extends Vue {
  @Prop({ default: false })
  visible?: boolean;

  @Prop({ default: () => {} })
  sheetData!: any;

  @Prop({ default: [] })
  subQueryCondition: any;

  pageSizeOptions: any[] = ['10', '20', '30', '40', '50'];

  pageSize: number = 20;

  current: number = 1; //第几页

  currentPageData: any[] = []; //当前页面展示数据

  pageData: any[] = []; //分页数组

  numberData: any = '';

  listConfig: any = null;

  relevanceDataList = [];

  filterData = [];

  isShowFilterBox: boolean = false;

  queryActive: boolean = false;

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

  get title() {
    return this.sheetData && this.sheetData.properties
      ? this.sheetData.properties.vcTitle
      : '';
  }

  get columns() {
    if (this.sheetData && this.sheetData.properties) {
      this.sheetData.properties.childColumns.forEach((item) => {
        item.title = item.vcTitle;
      });
      return this.sheetData.properties.childColumns;
    }
    return undefined;
  }

  get pageVM() {
    return this;
  }

  get total() {
    if (!(this.sheetData && this.sheetData.sourceValue)) {
      return 0;
    }
    return this.sheetData.sourceValue.length;
  }

  get dataSource() {
    return this.sheetData && this.sheetData.sourceValue;
  }

  get columnsConfig() {
    const config = {};
    this.columns &&
      this.columns.map((item) => {
        config[item.key || item.propertyCode] = {
          type: item.propertyType,
          name: item.title,
        };
      });
    return config;
  }

  get dataItemList() {
    const dataItemList =
      this.columns &&
      this.columns.map((item: any) => {
        return {
          appFunctionCode: null,
          appPackageCode: null,
          code: item.key,
          createdBy: null,
          createdTime: null,
          dataId: null,
          dataLinkageJson: null,
          defaultProperty: false,
          defaultValue: null,
          deleted: false,
          encryptOption: null,
          formPropertyType: null,
          format: null,
          id: item.id,
          modifiedBy: null,
          modifiedTime: null,
          name: item.title,
          name_i18n: item.name_i18n,
          options: null,
          propertyEmpty: false,
          propertyIndex: false,
          propertyLength: null,
          propertyType: item.propertyType,
          propertyTypeName: null,
          published: true,
          quoteCodes: [],
          relativeCode: null,
          relativeName: null,
          relativePropertyCode: null,
          relativeQuoteCode: null,
          remarks: null,
          repeated: false,
          schemaCode: this.sheetData.properties.key,
          selectionJson: null,
          sortKey: null,
          subSchema: null,
          used: null,
        };
      });
    return dataItemList;
  }

  @Watch('visible', {
    immediate: true,
  })
  initData(val) {
    this.subQueryCondition &&
      this.subQueryCondition.forEach((item: any) => {
        item.name_i18n = {
          en: item.name_i18n,
          zh: item.name,
        };
      });

    this.setFilterData();

    this.onChange(this.currentPageData, this.pageSize);
  }

  toggleQueryConditions() {
    // 清空未确定的值
    const queryForm = this.$refs.queryForm;
    if (queryForm) {
      (queryForm as any).backWriteData(this.subQueryFormValues);
    }
    this.isShowFilterBox = !this.isShowFilterBox;
  }

  hideQueryItem() {
    if (!this.isShowFilterBox) {
      return;
    }
    this.isShowFilterBox = false;
  }

  close() {
    this.$emit('close', false);
  }

  isOpen: boolean = false;

  subQueryFormValues: any = ''; // 查询条件再赋值

  setFilterData(data?: any) {
    const filterData = data || {};
    const temArr = Object.keys(filterData);
    this.isOpen = false;
    for (let i = 0; i < temArr.length; i++) {
      if (temArr[i] !== 'parentId') {
        if (filterData[temArr[i]]) {
          this.isOpen = true;
          break;
        } else {
          this.isOpen = false;
        }
      }
    }
    if (temArr.length === 0) {
      this.queryActive = false;
    }
    for (let i = 0; i < temArr.length; i++) {
      if (Array.isArray(filterData[temArr[i]])) {
        filterData[temArr[i]].forEach((item) => {
          if (item) {
            this.queryActive = true;
          }
        });
        if (this.queryActive) {
          break;
        }
      } else if (filterData[temArr[i]]) {
        this.queryActive = true;
        break;
      } else if (
        (this.columnsConfig[temArr[i]] &&
          this.columnsConfig[temArr[i]].type) === DataItemType.Logic
      ) {
        this.queryActive = true;
        break;
      } else {
        this.queryActive = false;
      }
    }

    const filterItems =
      this.dataSource &&
      this.dataSource.filter((item) => {
        let filtered = true;
        temArr.forEach((tag) => {
          switch (this.columnsConfig[tag] && this.columnsConfig[tag].type) {
            case DataItemType.ShortText:
            case DataItemType.LongText:
              if (!filterData[tag]) {
                break;
              }
              if (!new RegExp(filterData[tag]).test(item[tag])) {
                filtered = false;
              }
              break;
            case DataItemType.Number:
              if (!filterData[tag][0] && !filterData[tag][1]) {
                break;
              }
              if (filterData[tag] !== item[tag]) {
                filtered = false;
              }
              break;
            case DataItemType.Logic:
              if (
                (filterData[tag] &&
                  (item[tag] === '否' || item[tag] === false)) ||
                (!filterData[tag] && (item[tag] === '是' || item[tag] === true))
              ) {
                filtered = false;
              }
              break;
            case DataItemType.StaffSingle:
            case DataItemType.StaffMulti:
            case DataItemType.StaffDeptMix:
              if (!filterData[tag]) {
                break;
              }
              filterData[tag].forEach((i) => {
                let has = false;
                for (let j = 0; j < item[tag].length; j++) {
                  if (item[tag][j].id === i.id) {
                    has = true;
                    break;
                  }
                }
                if (filtered) {
                  filtered = has;
                }
              });
              break;
            case DataItemType.DeptSingle:
            case DataItemType.DeptMulti:
              if (!filterData[tag]) {
                break;
              }
              const deptment = item[tag].split(',');
              filterData[tag].forEach((i) => {
                let has = false;
                for (let j = 0; j < deptment.length; j++) {
                  if (deptment[j] === i.name) {
                    has = true;
                    break;
                  }
                }
                if (filtered) {
                  filtered = has;
                }
              });
              break;
            case DataItemType.Date:
              if (!filterData[tag][0] && !filterData[tag][1]) {
                break;
              }
              if (!filterData[tag][0] || !filterData[tag][1]) {
                break;
              }
              const startTime = moment(filterData[tag][0]).startOf('day');
              const endTime = moment(filterData[tag][1]).endOf('day');
              const targetTime = moment(item[tag]).startOf('day');
              if (!(startTime <= targetTime && endTime >= targetTime)) {
                filtered = false;
              }
              break;
            case DataItemType.RelevanceForm:
            case DataItemType.RelevanceFormEx:
              // TODO: 过滤关联表单，暂时不确定数据格式，无法判定
              break;
            default:
              break;
          }
        });
        return filtered;
      });

    this.filterData = filterItems;

    this.onChange(this.currentPageData, this.pageSize);
    this.isShowFilterBox = false;
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

  showSizeChange(current, size) {
    this.pageSize = size;
    this.onChange(current, size);
  }

  func() {
    return;
  }

  goForm() {
    return;
  }

  /**
   * 页面调整--假分页
   */
  onChange(page, pageSize) {
    this.pageSize = pageSize;
    if (this.total < this.pageSize) {
      this.currentPageData = this.filterData;
    } else {
      this.pageData = [];
      this.currentPageData = [];
      let index = 0;
      for (let i = 0; i < this.total; i++) {
        if (i % this.pageSize === 0 && i !== 0) {
          // 可以被 10 整除
          this.pageData.push(this.filterData.slice(index, i));
          index = i;
        }
        if (i + 1 === this.total) {
          this.pageData.push(this.filterData.slice(index, i + 1));
        }
      }
      this.currentPageData = this.pageData[this.current - 1];
    }
  }

  @Emit()
  getRelevanceDataList() {
    this.relevanceDataList = this.dataItemList;
  }
}
</script>
<style lang="less" scoped>
@import '../../../../../../application/src/components/pc/style/custom-themes';
/deep/ .form-sheet-modal {
  @media screen and (max-width: 1440px) {
    // top: calc(50vh - 384px);
  }
  .ant-table-content {
    max-height: 600px;
    overflow-y: auto;
    @media screen and (max-width: 1440px) {
      max-height: 400px;
    }
  }
}

.option-box {
  height: 46px;
  padding: 13px 0;
  text-align: right;
  position: relative;
  .table-toolbar-box-li {
    margin-right: 16px;
    font-size: 12px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    cursor: pointer;
    i {
      font-size: 14px;
      color: rgba(17, 18, 24, 0.25);
      // margin-right: 4px;
    }
    &:hover {
      color: @highlightColor;
      i {
        color: @highlightColor;
      }
    }
    &.high-light {
      color: @highlightColor;
      > i {
        color: @highlightColor;
      }
    }
  }
  .filters-box {
    position: absolute;
    width: 360px;
    right: 16px;
    z-index: 666;
    // margin-top: -8px;
  }
}

.form-sheet-box {
  height: 600px;
  width: 100%;
  overflow: auto;
}

.form-sheet-table {
  min-height: 350px;
  padding-bottom: 10px;
  /deep/.ant-table-thead > tr > th,
  /deep/.ant-table-tbody > tr > td {
    padding: 7px 12px;
  }
  /deep/.ant-table-thead > tr > th {
    background: #f8f8fb;
    .ant-table-column-title {
      height: 22px;
      font-size: 13px;
      font-weight: 600;
      color: #111218;
      line-height: 22px;
    }
  }
  /deep/.ant-table-tbody > tr > td {
    height: 22px;
    font-size: 13px;
    font-weight: 400;
    color: #111218;
    line-height: 22px;
  }
}
.pagination-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 9px;
  border-top: 1px solid #eeeeee;
  /deep/li {
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

/deep/.ant-modal {
  padding: unset;
  // margin: unset;
  min-width: 300px;
  // top: calc((100vh - 768px) / 2);
}

/deep/.ant-modal-content {
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
  background: #ffffff;
  border-radius: 2px;
}
/deep/.ant-modal-header {
  border-bottom: none;
  padding: 16px 24px;
  box-shadow: 0px 4px 11px 0px rgba(35, 110, 235, 0.05), 0px 1px 0px 0px #eeeeee;
  .ant-modal-title {
    height: 24px;
    font-size: 16px;
    font-weight: 600;
    color: #111218;
    line-height: 24px;
  }
}
/deep/.ant-modal-close-x {
  width: 60px;
  height: 56px;
  line-height: 72px;
  svg {
    display: none;
  }
  // height: 54px;
  // width: 54px;
  line-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    i {
      color: @highlightColor;
    }
  }
  i {
    width: 16px;
    height: 16px;
    font-family: 'aufontAll' !important;
    font-size: 17px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: rgba(17, 18, 24, 0.5);
    display: flex;
    align-items: center;
    &::after {
      content: '\e996';
    }
  }
}
/deep/.ant-modal-body {
  padding-top: 0;
  padding-bottom: 24px;
}
</style>

<style lang="less" scoped>
@import '../../../../../../application/src/components/pc/style/custom-themes';
/**
  新版表单样式
*/
/deep/ .custom-template-container .table-container .table-row {
  min-height: 36px;
  &.table-head-row {
    .table-row-item {
      background-color: #f8f8fb;
      color: #111218;
      font-size: 13px;
      font-weight: 700;

      &.fixed-left-column-last {
        border-right: 1px solid #e8eaed;
      }
    }
  }
}

/deep/ .custom-template-container .table-container .table-body-row {
  .table-row-item {
    border-right: 1px solid #e8eaed;
  }
}

/deep/
  .custom-template-container
  .table-head-wrapper
  .table-row
  .table-row-item
  .resize-bar {
  top: 0;
  height: 100%;
  border-right: 1px solid #e8eaed;
}
/deep/ .custom-template-container {
  border-top: 1px solid #e8eaed;
}

/deep/ .custom-template-container .table-head-wrapper .table-head-value {
  justify-content: space-between;
}

/deep/ .head-value-up_down .icon-up_down,
/deep/ .head-value-up_down .icon-up_down {
  color: rgba(17, 18, 24, 0.25) !important;
  font-size: 12px;
  position: relative;
  &:hover {
    color: #2970ff !important;
  }
  &.anticon-caret-up {
    top: 2px;
  }
  &.anticon-caret-down {
    top: -2px;
  }
}

/deep/
  .custom-template-container
  .table-body-row
  .table-row-item
  .col-inner-wrapper {
  color: #111218;
  font-size: 13px;
  height: 36px;
  display: flex;
  align-items: center;
  &:hover {
    color: #111218 !important;
    cursor: unset !important;
  }
}
/deep/ .ant-breadcrumb {
  > span {
    font-size: 12px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
  }
  > span:last-child {
    font-weight: 700;
    color: #111218;
  }
}

.list-actions-more {
  width: 32px;
  height: 32px;
  border-radius: 2px;
  line-height: 32px;
  text-align: center;
  margin-right: 8px;
  cursor: pointer;
  &:hover {
    background: rgba(0, 30, 116, 0.06);
  }
  i {
    color: rgba(17, 18, 24, 0.5);
    font-size: 22px;
    position: relative;
    top: 2px;
  }
}

.table-toolbar {
  margin-right: 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  .table-toolbar-box {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    // box-shadow: 0px 1px 0px 0px #eeeeee;
    height: 46px;
    &-li {
      margin-right: 16px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      cursor: pointer;
      i {
        font-size: 14px;
        color: rgba(17, 18, 24, 0.25);
        // margin-right: 4px;
      }
      &:hover {
        color: @highlightColor;
        i {
          color: @highlightColor;
        }
      }
      &.high-light {
        color: @highlightColor;
        > i {
          color: @highlightColor;
        }
      }
    }
  }
}
</style>

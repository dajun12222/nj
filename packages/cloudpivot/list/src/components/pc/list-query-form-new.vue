<template>
  <div
    v-if="(fields && fields.length) || IsShowAdd"
    class="query-form"
    :class="{ collapsed: collapsed, showmore: showMore, showall: showAll }"
  >
    <div id="list-actions" class="list-actions">
      <div v-if="!isReverse" class="table-toolbar-box-li">
        <a-popover
          trigger="click"
          placement="bottomRight"
          overlayClassName="font-setting-drag"
        >
          <template slot="content">
            <FontSetting
              :columns="listConfigData && listConfigData.queryColumns"
              @confirm="reRenderTable"
              @recovery="recovery"
              @search="filterColumns"
            />
          </template>
          <i class="icon aufontAll h-icon-all-setting-fill"></i>
          {{ $t('cloudpivot.list.pc.SetDisplayItems') }}
        </a-popover>
      </div>
      <div
        v-if="fields"
        class="table-toolbar-box-li-new"
        :class="{ 'high-light': fields }"
        @click="showFilterNewClick"
      >
        <i class="icon aufontAll h-icon-all-screen"></i>
        {{ $t('cloudpivot.list.pc.Screen') }}
      </div>
      <!-- <div
        class="table-toolbar-box-li"
        v-if="fields"
        @click="toggleQueryConditions"
        :class="{'high-light': isShowFilterBox || queryActive}"
      >
        <i class="icon aufontAll h-icon-all-screen"></i>
        {{$t('cloudpivot.list.pc.Screen')}}
      </div> -->
      <a-button v-if="IsShowAdd" type="primary" @click="addData">
        {{ $t('cloudpivot.list.pc.Add') }}
      </a-button>
    </div>
    <div v-show="isShowFilterBox">
      <div class="query-box">
        <div class="query-form-left">
          <pc-form-renderer
            ref="formRenderer"
            :controls="controls"
            :schemaCode="schemaCode"
          />
        </div>
        <div class="query-form-right">
          <a-button v-if="fields && fields.length" @click="resetFilters">
            {{ $t('cloudpivot.list.pc.Reset') }}
          </a-button>
          <a-button type="primary" @click="query">
            {{ $t('cloudpivot.list.pc.Query') }}
          </a-button>
        </div>
      </div>
      <div class="filter-mask" @click="closeQueryItem"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Button, Icon, Tooltip } from '@h3/antd-vue';
import moment from 'moment';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { form } from '../../../../api';
import { renderer } from '../../../../form';
import formPc from '../../../../form/src/renderer/components/pc';
import FontSetting from './components/font-setting/font-setting.vue';
import formColumnSetting from './formColumnSetting.vue';
import * as ControlFactory from './helper/control-factory';
import onActionClick from './scripts/onActionClick';

@Component({
  name: 'query-form',
  components: {
    PcFormRenderer: formPc.FormRenderer,
    AButton: Button,
    AIcon: Icon,
    ATooltip: Tooltip,
    formColumnSetting: formColumnSetting,
    FontSetting,
  },
})
export default class QueryForm extends Vue {
  @Prop()
  fields!: any[];

  @Prop({ default: false })
  isRelevanceQuery?: boolean;

  @Prop({
    default: 3,
  })
  cols!: number;

  @Prop()
  schemaCode!: string;

  @Prop()
  listConfigData!: any;

  @Prop({ default: false })
  queryActive!: boolean;

  @Prop({ default: false })
  isReverse!: boolean;

  // 判断当前是否是中文版本
  // get isChinese() {
  //   return !(this.$i18n.locale && this.$i18n.locale === 'en');
  //}

  showMore = false;

  controls = '' as any;

  collapsed = true;

  showColumnSetting: boolean = false;

  isShowFilterBox: boolean = false;

  isShowFilterNew: boolean = false;

  @Prop({
    default: false,
  })
  showAll!: boolean;

  addActionData: any;

  staffMap: any = {
    0: 'all',
    1: 'user',
    2: 'org',
  };

  staffSelectorDefaultMap: any = {
    0: '',
    1: 'originator',
    2: 'originatorDept',
  };

  addressFormatMap: any = {
    '0': 'pp-cc-aa',
    '1': 'pp-cc',
    '2': 'pp',
  };

  toggle() {
    this.collapsed = !this.collapsed;
    this.$emit('toggle', this.collapsed);
  }

  @Watch('fields', {
    immediate: true,
  })
  setFields(fields: any[]) {
    setTimeout(() => {
      this.init();
    }, 1);
  }

  get IsShowAdd() {
    return (() => {
      if (this.listConfigData && this.listConfigData.queryActions) {
        const addBtn = this.listConfigData.queryActions.find(
          (val: any) => val.actionCode === 'add',
        );
        addBtn ? (this.addActionData = addBtn) : (this.addActionData = null);
        return !!addBtn;
      } else {
        return false;
      }
    })();
  }

  filterColumns(keyword, chooseSheet) {
    if (!chooseSheet) {
      //筛选之后将字段设置为false，显示字段组件中过滤显示
      this.listConfigData.queryColumns = this.listConfigData.queryColumns.map(
        (item) => {
          if (item.vcTitle.indexOf(keyword) > -1) {
            item.queryShow = true;
          } else {
            item.queryShow = false;
          }
          return item;
        },
      );
    } else {
      this.listConfigData.queryColumns.forEach((item) => {
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

  toggleQueryConditions() {
    // 清空未确定的值
    // let queryForm = this.$refs.queryForm;
    // if (queryForm) {
    //   (queryForm as any).backWriteData(this.queryFormValues);
    //}
    this.isShowFilterBox = !this.isShowFilterBox;
  }

  closeQueryItem() {
    this.isShowFilterBox = false;
  }

  init() {
    if (!this.fields || !this.fields.length) {
      return;
    }
    if (Array.isArray(this.fields) && this.fields.length) {
      this.fields.forEach((item: any) => {
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
    const controls: any = {};
    this.fields.forEach((field: any) => {
      // const fieldData = JSON.parse(JSON.stringify(field));
      // if (!this.isChinese) {
      //   fieldData.name = fieldData.name_i18n[this.$i18n.locale];
      //}
      controls[field.propertyCode] = this.toFormControl(field);

      controls[field.propertyCode].isRelevanceQuery = !!this.isRelevanceQuery;
      if (this.isRelevanceQuery) {
        controls[field.propertyCode].op = field.op || 'eq';
        controls[field.propertyCode].defaultOp = field.op || 'eq';

        if (field.propertyCode === 'sequenceStatus') {
          const statusType = {
            PROCESSING: '进行中',
            COMPLETED: '已完成',
          };
          controls[field.propertyCode].options.defaultValue =
            statusType[controls[field.propertyCode].options.defaultValue] ||
            controls[field.propertyCode].options.defaultValue;
        }
      }
    });

    const rows = Math.ceil(this.fields.length / this.cols);

    const layout = Array(rows)
      .fill(0)
      .map((_, i) => {
        const start = i * this.cols;
        return Array(this.cols)
          .fill(0)
          .map((__, colIdx) => {
            const field: any = this.fields[start + colIdx];
            return field ? field.propertyCode : '';
          });
      });

    this.showMore = layout.length > 1;

    const arr: any[] = renderer.components.FormRendererHelper.convertDesign(
      controls,
      layout,
    );

    const formControls: any[] = [];
    renderer.components.FormRendererHelper.findFormControl(arr, formControls);
    renderer.components.FormRendererHelper.mergeValue(formControls, {}, true);
    console.log('arr===>>', arr);
    this.controls = arr;
    this.callQuery();
  }

  callQuery() {
    setTimeout(() => {
      const formRenderer = this.$refs.formRenderer as any;
      if (formRenderer) {
        formRenderer.edit();
        this.query();
      } else {
        this.callQuery();
      }
    }, 300);
  }

  // 重置查询条件
  resetFilters() {
    this.collapsed = true;
    const formRenderer = this.$refs.formRenderer as any;
    formRenderer.reset();
    const data = formRenderer.getValue();
    const opValue = formRenderer.getOpValue(true);
    //重置右上角条件
    this.controls.forEach((el: any) => {
      if (el.children && Array.isArray(el.children)) {
        el.children.forEach((item: any) => {
          if (item.children && Array.isArray(item.children)) {
            item.children.forEach((item: any) => {
              this.fields.forEach((x) => {
                if (item.key === x.propertyCode) {
                  item.op = x.op;
                }
              });
            });
          }
        });
      }
    });

    // const data:any = [];
    this.$emit('setFilterData', data, opValue);
    this.$emit('toggle', true);
    this.isShowFilterBox = false;
  }

  /**
   * 展示项设置弹窗
   */
  columnSetting() {
    this.showColumnSetting = true;
  }

  reRenderTable(columns: any) {
    this.$emit('reRenderTable', columns);
  }

  recovery() {
    this.$emit('recovery');
  }

  // 查询
  query() {
    this.$nextTick(() => {
      const formRenderer = this.$refs.formRenderer as any;
      let data = [];
      let opValue = [];
      if (formRenderer) {
        data = formRenderer.getValue();
        opValue = formRenderer.getOpValue();
        let flag: boolean = false;
        //配合后端修改，将data中的四位年份修改为带年月日时间格式
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const dataItem = this.fields.find((i) => {
              return i.propertyCode === key;
            });
            const displayFormat = dataItem ? dataItem.displayFormat : '';
            if (displayFormat && displayFormat === '5') {
              if (Array.isArray(data[key])) {
                // @ts-ignore
                data[key] = data[key].map((item, index) => {
                  if (typeof item !== 'string') {
                    item = moment(item).format('YYYY-MM-DD');
                  }
                  if (index === 0) {
                    item = item ? `${item.substring(0, 4)}-01-01` : '';
                  } else if (index === 1) {
                    item = item ? `${item.substring(0, 4)}-12-31` : '';
                  } else {
                    item = '';
                  }
                  return item;
                });
              }
            }
          }
        }

        Object.values(data).some((a: any) => {
          if ((Array.isArray(a) && a[0]) || (!Array.isArray(a) && a)) {
            flag = true;
            return true;
          }
          return false;
        });

        Object.keys(data).forEach((key: any) => {
          if (key === 'sequenceStatus') {
            const operatorTypes = {
              已完成: 'COMPLETED',
              进行中: 'PROCESSING',
            };
            data[key] = operatorTypes[data[key]] || data[key];
          }
        });
      }
      this.$emit('setFilterData', data, opValue);
      this.$emit('toggle', true);
      this.collapsed = true;
      this.isShowFilterBox = false;
    });
  }

  toFormControlType(field: any) {
    switch (field.propertyType) {
      case renderer.DataItemType.Date:
        return renderer.FormControlType.DateRange;
      case renderer.DataItemType.Number:
        return renderer.FormControlType.NumberRange;

      case renderer.DataItemType.StaffSingle:
        return renderer.FormControlType.StaffSelector;

      case renderer.DataItemType.StaffMulti:
        return renderer.FormControlType.StaffMultiSelector;

      case renderer.DataItemType.StaffDeptMix:
        return renderer.FormControlType.StaffDeptMixed;

      case renderer.DataItemType.DeptMulti:
        return renderer.FormControlType.DepartmentMultiSelector;

      case renderer.DataItemType.DeptSingle:
        return renderer.FormControlType.DepartmentSelector;

      case renderer.DataItemType.RelevanceForm:
        return renderer.FormControlType.RelevanceForm;
      case renderer.DataItemType.RelevanceFormEx:
        return renderer.FormControlType.RelevanceFormEx;
      case renderer.DataItemType.Logic:
        return renderer.FormControlType.Logic;
      case renderer.DataItemType.Address:
        return renderer.FormControlType.Address;
      case renderer.DataItemType.Time:
        return renderer.FormControlType.TimeRange;
      default:
        break;
    }

    switch (field.displayType) {
      case 0:
      default:
        return renderer.FormControlType.Text;
      case 1:
        return renderer.FormControlType.Radio;
      case 2:
        return renderer.FormControlType.Checkbox;
      case 3:
        return renderer.FormControlType.Dropdown;
    }
  }

  toFormControl(field: any) {
    //
    const type: any = this.toFormControlType(field);
    const sourceOpts = {
      visible: field.visible,
      name: field.name,
      defaultValue: field.defaultValue,
      options: field.options,
    };
    // console.log('11111111111111111111111',field.name_i18n)

    const options = ControlFactory.buildControlOptions(type, sourceOpts);

    switch (type) {
      case renderer.FormControlType.StaffSelector: // 人员单选 50
        options.deptVisible = this.staffMap[1];
        options.multi = false;
        break;
      case renderer.FormControlType.StaffMultiSelector: // 人员多选 51
        options.deptVisible = this.staffMap[1];
        options.multi = true;
        break;
      case renderer.FormControlType.DepartmentSelector: // 部门单选 60
        options.deptVisible = this.staffMap[2];
        options.multi = false;
        break;
      case renderer.FormControlType.DepartmentMultiSelector: // 部门多选
        options.deptVisible = this.staffMap[2];
        options.multi = true;
        break;
      case renderer.FormControlType.StaffDeptMixed: // 混合
        options.deptVisible = this.staffMap[0];
        options.multi = true;
        break;

      case renderer.FormControlType.RelevanceForm:
      case renderer.FormControlType.RelevanceFormEx:
        options.queryCode = field.associationCode;
        options.schemaCode = field.relativeSchemaCode;
        options.showStyle = field.options
          ? JSON.parse(field.options).showStyle
          : '';
        options.selectMode =
          field.choiceType === 2
            ? renderer.RelevanceFormSelectMode.Popup
            : renderer.RelevanceFormSelectMode.Dropdown;
        break;
      case renderer.FormControlType.Address:
        options.addressDetail = 'false';
        options.showEmpty = `${!field.accurateSearch}`;
        options.locationType = this.addressFormatMap[field.displayFormat];
        break;
      case renderer.FormControlType.Dropdown:
      case renderer.FormControlType.DropdownMulti:
        options.multi = true;
        options.displayEmpty = false;

        if (field.propertyCode === 'sequenceStatus') {
          if (
            !(this.$i18n.locale && this.$i18n.locale === 'en') &&
            field.defaultValue
          ) {
            field.defaultValue = field.defaultValue
              .split(';')
              .map((val: any) => form.sequenceStatusZh[val])
              .join(';');
          }
        }
        break;
      case renderer.FormControlType.DateRange:
        const displayFormat: string = field.displayFormat || '';
        options.displayFormat = displayFormat;
        switch (Number(displayFormat)) {
          case 2:
            options.format1 = 'YYYY-MM-DD HH:mm:ss';
            break;
          case 3:
            options.format1 = 'YYYY-MM-DD HH:mm';
            break;
          case 4:
            options.format1 = 'YYYY-MM';
            break;
          case 5:
            options.format1 = 'YYYY';
            break;
          case 6:
            options.format1 = 'MM-DD';
            break;
          case 7:
            options.format1 = 'hh:mm';
            break;
          case 8:
            options.format1 = 'hh:mm:ss';
            break;
          default:
            options.format1 = 'YYYY-MM-DD';
            break;
        }
        break;
      default:
        break;
    }

    const dv = field.defaultValue;
    if (dv !== undefined && dv !== null && dv !== '') {
      if (
        type === renderer.FormControlType.StaffSelector &&
        typeof field.defaultValue === 'string'
      ) {
        options.defaultValueType =
          this.staffSelectorDefaultMap[field.defaultValue];
      } else {
        options.defaultValue = field.defaultValue;
      }
    } else {
      switch (type) {
        case renderer.FormControlType.StaffSelector:
          options.defaultValueType =
            this.staffSelectorDefaultMap[field.defaultValue];
          break;
        case renderer.FormControlType.DateRange:
        case renderer.FormControlType.NumberRange:
          options.defaultValue = [field.startValue, field.endValue];
          break;
        case renderer.FormControlType.Logic:
          options.defaultValue = field.defaultState;
          break;
        default:
          break;
      }
    }

    // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',typeof field.name_i18n)
    //
    if (typeof field.name_i18n === 'object' && field.name_i18n !== null) {
      field.name_i18n = JSON.stringify(field.name_i18n);
    }

    options.name_i18n = field.name_i18n;

    const control = {
      key: field.propertyCode,
      writable: true,
      type,
      options,
    };
    return control;
  }

  // 新增关联表单数据
  addData() {
    onActionClick.handleAdd(this, this.addActionData, this.schemaCode, true);
    console.log(this);
  }

  showFilterNewClick() {
    this.isShowFilterNew = !this.isShowFilterNew;
    this.$emit('showFilterNewClick', this.isShowFilterNew);
  }
}
</script>

<style lang="less" scoped>
@import './../../../../application/src/components/pc/style/custom-themes';
.query-form {
  display: flex;
  justify-content: flex-end;
  /deep/.list-actions {
    display: flex;
    align-items: center;
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
        color: @primaryColor;
        i {
          color: @primaryColor;
        }
      }
      &.high-light {
        color: @primaryColor;
        > i {
          color: @primaryColor;
        }
      }
    }
    .table-toolbar-box-li-new {
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
      &.high-light {
        color: @primaryColor;
        > i {
          color: @primaryColor;
        }
      }
    }
  }
  /deep/.query-box {
    position: absolute;
    width: 320px;
    right: 96px;
    top: 38px;
    // margin-top: -8px;
    padding: 10px 0 0;
    box-shadow: 0px 4px 8px 0px rgba(30, 85, 255, 0.1);
    border-radius: 4px;
    background: #fff;
    z-index: 1000;
    .query-form-left {
      max-height: calc(56vh - 80px);
      min-height: 90px;
      overflow-y: auto;
      padding: 16px 24px 0;
      .ant-row-flex {
        .ant-col-12,
        .ant-col-8 {
          width: 100%;
          .field {
            flex-direction: column;
            padding: 8px 0;
            border: 0px solid transparent;
            .field__label {
              width: 100%;
              max-width: none;
              min-width: 0;
              flex: 0;
              color: #111218;
              font-weight: 400;
              font-size: 14px;
              margin-bottom: 6px;
              margin-right: 0;
              padding-top: 0;
            }
            .op {
              position: absolute;
              right: 0;
              top: 3px;
              .ant-select-selection {
                border-color: transparent;
                box-shadow: unset !important;
                &:focus {
                  box-shadow: unset;
                }
                &-selected-value {
                  font-size: 14px;
                  font-weight: 400;
                  color: #2970ff;
                }
              }
            }
            .field__control {
              width: 100%;
              > div {
                width: 100%;
              }
              .ant-input {
                border-radius: 2px;
              }
              .h3-input-number {
                border-radius: 2px;
              }
              .h3-organization__label {
                border-radius: 2px;
              }
              .ant-calendar-picker-input {
                padding: 4px 11px !important;
                border-radius: 2px;
                .ant-calendar-range-picker-input {
                  width: 47%;
                }
              }
            }
          }
        }
      }
    }
    .query-form-right {
      display: flex;
      justify-content: flex-end;
      padding: 24px;
      .ant-btn {
        height: 32px;
        margin-left: 8px;
      }
    }
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
//   display: flex;
//   // padding: 0 8px 16px 8px;

//   box-shadow: 0px 4px 8px 0px rgba(30, 85, 255, 0.1);

//   &-left {
//     width: 100%; // 兼容IE11
//     flex-grow: 1;
//     /deep/ .field__control {
//       & > div {
//         width: 100%;
//      }
//    }
//  }

//   &-right {
//     flex-shrink: 0;
//     // padding: 8px;
//     text-align: right;

//     & > button {
//       margin-left: 8px;
//    }

//     & > span {
//       color: rgba(0, 0, 0, 0.45);
//       cursor: pointer;
//       user-select: none;
//       margin-right: 16px;

//       & > i {
//         transform: rotate(180deg);
//      }
//       & > i.collapsed {
//         transform: rotate(0);
//      }
//    }
//  }

//   &.collapsed {
//     height: 40px;
//     box-shadow: none;
//  }

//   &.collapsed.showmore {
//     overflow: hidden;
//  }

//   /deep/.field {
//     padding-top: 0px !important;
//     padding-left: 0px !important;
//  }
//   /deep/.field__label {
//     min-width: 1em;
//     max-width: 6em;

//     & > div {
//       display: flex;
//       align-items: center;
//       // overflow: hidden;
//       // white-space: nowrap;
//       // text-overflow: ellipsis;
//    }
//  }

//   /deep/.h3-organization {
//     max-height: 34px;
//     overflow: auto;
//  }
//}
// // 关联查询展开的时候事全部，取消展开按钮
// .showall.query-form {
//   display: block;
//   height: auto;
//   .query-form-right {
//     text-align: center;
//  }
//}
</style>

<style lang="less">
.query-form .numberrange .number {
  display: flex;
  .h3-input-number {
    flex: 1;
  }
}
</style>
<style lang="less" scoped>
@import './../../../../application/src/components/pc/style/custom-themes';
/deep/.ant-btn {
  height: 32px;
  padding: 0 12px;
  &.ant-btn-default {
    background: #ffffff;
    border: 1px solid #d4d5d6;
    > span {
      height: 22px;
      font-size: 14px;
      color: #111218;
      line-height: 22px;
    }
    &:hover {
      > span {
        color: @primaryColor;
      }
    }
    &:active {
      > span {
        color: @primaryColor;
      }
    }
  }
  &.ant-btn-primary {
    // background: @primaryColor;
    > span {
      height: 22px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 22px;
    }
    // &:hover {
    //   background: @primaryColor;
    // }
    // &:active {
    //   background: @primaryColor;
    // }
  }
  &:disabled {
    background: #f1f2f6 !important;
    border: 1px solid #d4d5d6 !important;
    > span {
      height: 22px;
      font-size: 14px;
      color: rgba(17, 18, 24, 0.25) !important;
      line-height: 22px;
    }
  }
}
</style>
<style lang="less">
.font-setting-drag .ant-popover-inner-content {
  padding: unset;
}
</style>

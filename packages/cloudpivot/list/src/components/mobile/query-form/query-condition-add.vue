<template>
  <div class="query-condition-box" :class="{ display: isDisplay }">
    <div class="query-condition-add">
      <div class="tab-header">
        <div
          class="tab-header-item"
          :class="{ active: tabKey === 'dataItemSelect' }"
          @click="onTabChange('dataItemSelect')"
        >
          {{ dataItemNode ? dataItemNode.name : '请选择' }}
        </div>
        <div
          v-if="dataItemNode"
          class="tab-header-item"
          :class="{ active: tabKey === 'conditionOp' }"
          @click="onTabChange('conditionOp')"
        >
          {{ actionSheetNode ? actionSheetNode.name : '请选择' }}
        </div>
        <div
          v-if="
            dataItemNode &&
            actionSheetNode &&
            actionSheetNode.value !== 'IsNull' &&
            actionSheetNode.value !== 'IsNotNull'
          "
          class="tab-header-item"
          :class="{ active: tabKey === 'dataItemControl' }"
          @click="onTabChange('dataItemControl')"
        >
          请选择
        </div>

        <div
          v-if="
            (actionSheetNode &&
              (actionSheetNode.value === 'IsNull' ||
                actionSheetNode.value === 'IsNotNull')) ||
            tabKey === 'dataItemControl'
          "
          class="tab-header-item save"
          @click="onSaveAdd"
        >
          确定
        </div>
        <span
          v-else
          class="icon aufontAll h-icon-all-close-circle"
          @click="onCancelAdd"
        ></span>
      </div>
      <div class="tab-panel">
        <div
          class="tab-panel-item"
          :class="{ active: tabKey === 'dataItemSelect' }"
        >
          <div class="data-search-box">
            <a-input
              v-model="searchKey"
              class="item-search"
              placeholder="搜索"
              @keyup="onSearch"
              @focus="onFocus"
              @blur="onBlur"
            />
            <span
              class="icon aufontAll h-icon-all-search-o"
              :class="{ left: isLeft }"
            ></span>
            <span
              v-if="searchKey"
              class="icon aufontAll h-icon-all-close-circle"
              @click="onClearSearchKey"
            ></span>
          </div>
          <div class="data-item-box">
            <div
              v-for="(item, index) in searchDefaultQueryConditions"
              :key="index"
              class="data-item"
              :class="{
                active:
                  dataItemNode &&
                  dataItemNode.propertyCode === item.propertyCode,
              }"
              @click="onDataItemChange(item)"
            >
              {{ item.name }}
              <span class="icon aufontAll h-icon-all-check"></span>
            </div>
          </div>
        </div>
        <div
          class="tab-panel-item"
          :class="{ active: tabKey === 'conditionOp' }"
        >
          <div class="data-item-box">
            <div
              v-for="(item, index) in actionSheetMenusValues"
              :key="index"
              class="data-item"
              :class="{
                active: actionSheetNode && actionSheetNode.value === item.value,
              }"
              @click="onActionSheetChange(item)"
            >
              {{ item.name }}
              <span class="icon aufontAll h-icon-all-check"></span>
            </div>
          </div>
        </div>
        <div
          class="tab-panel-item"
          :class="{ active: tabKey === 'dataItemControl' }"
        >
          <base-control-adapter :control="currentItem" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
  Watch,
  Inject,
  Provide,
} from 'vue-property-decorator';
import {
  DatePicker,
  Drawer,
  Input,
  Pagination,
  Select,
  Table,
} from '@h3/antd-vue';
import QueryForm from './query-form.vue';
import BaseControlAdapter from '../../../../../form/src/renderer/components/mobile/base-control-adapter.vue';
import {
  toFormControl,
  toFormControlType,
} from '../../../../../list/src/components/pc/components/queryForm/query-form-util';
import { renderer } from '../../../../../form';
import { DataItemType } from 'cloudpivot/form/schema';
import { getRulesList } from 'cloudpivot/form/src/typings/view-filter-type-map';

@Component({
  name: 'query-condition-add',
  components: {
    AInput: Input,
    QueryForm,
    BaseControlAdapter,
  },
})
export default class QueryConditionAdd extends Vue {
  @Provide()
  getController() {
    return this.controls[0];
  }

  @Provide()
  findController(key: string | number, rowIndex?: number) {
    // @ts-ignore
    return this.controls.find((el) => el.key === key);
  }

  @Provide()
  getFormControls(keys?: string[]) {
    return this.controls;
  }

  @Provide()
  valChange(keys: string, fun: Function) {}

  @Provide()
  getDataItem(keys: string, parentKey?: string) {
    return this.controls.find((el) => el.key === keys);
  }

  @Provide()
  getSourceType() {
    return;
  }

  @Provide()
  layoutTypeFn() {
    return localStorage.getItem('layoutType') === 'vertical'; //使用本地缓存 防止上下布局发布时渲染数据先左右布局
  }

  //查询时时间范围控件显示可快捷选择日期段
  @Provide()
  showTimeRanges() {
    return true;
  }

  @Prop() isDisplay!: boolean;

  @Prop() defaultQueryConditions!: any[];

  @Prop({ default: false }) isRelevanceEntrance?: boolean;

  tabKey: string = 'dataItemSelect'; //当前激活Tab

  dataItemNode: any = null; //当前选择的数据项

  actionSheetMenusValues: any[] = []; //当前选择数据项-可选择的条件符号

  actionSheetNode: any = null; //当前选择的条件符号

  queryConditionsList: any[] = [];

  searchKey: string = '';

  isLeft: boolean = false;

  searchDefaultQueryConditions: any[] = [];

  currentItem: any = ''; // 当前选中的ctrl

  mounted() {}

  @Watch('defaultQueryConditions', {
    immediate: true,
  })
  onQueryConditionsChange(fields: any[]) {
    this.searchDefaultQueryConditions = this.defaultQueryConditions.slice(0);
  }

  /**
   * Tab切换
   */
  onTabChange(type) {
    this.tabKey = type;
  }

  /**
   * 数据项切换事件
   */
  onDataItemChange(item) {
    this.tabKey = 'conditionOp';
    this.dataItemNode = item;
    this.actionSheetNode = null;
    this.actionSheetMenusValues = getRulesList(
      item.propertyType,
      item.propertyCode,
    );
  }

  controls = '' as any;

  get ctrl() {
    return this.currentItem.controller || {};
  }

  /**
   * 表达式切换事件
   */
  onActionSheetChange(item) {
    this.actionSheetNode = item;
    if (item.value !== 'IsNull' && item.value !== 'IsNotNull') {
      this.tabKey = 'dataItemControl';
    }
    this.queryConditionsList = this.defaultQueryConditions.filter((ele) => {
      return ele.propertyCode === this.dataItemNode.propertyCode;
    });
    this.queryConditionsList.forEach((ele) => {
      ele.filterType = this.actionSheetNode.value;
    });

    const controls: any = {};
    const formControlsValue: any = {};
    this.queryConditionsList.forEach((field: any) => {
      if (
        [
          DataItemType.Radio,
          DataItemType.Checkbox,
          DataItemType.Dropdown,
          DataItemType.DropdownMulti,
        ].includes(field.propertyType)
      ) {
        if (field.filterType === 'Eq' || field.filterType === 'NotEq') {
          field.displayType = 3;
        }
        if (field.filterType === 'Like' || field.filterType === 'NotLike') {
          field.displayType = 0;
        }
        // 当筛选条件为添加表单时关联单选的查询条件时，单选、多选、下拉框单选多选无论设置的常量还是变量，在组合查询运行时都展示为输入框
        if (this.isRelevanceEntrance) {
          field.displayType = 0;
        }
      }
      field.isRelevanceQuery = true;
      const control = toFormControl(field);
      // @ts-ignore
      control.edit = true;
      controls[field.propertyCode] = control;
      controls[field.propertyCode].isRelevanceQuery = true;
      controls[field.propertyCode].value = field.defaultValue;
    });

    renderer.components.FormRendererHelper.mergeValue(
      Object.values(controls),
      formControlsValue,
      true,
    );
    this.controls = Object.values(controls);
    console.log('this.controls', this.controls);
    this.currentItem = this.controls.find((item) => {
      return item.key === this.dataItemNode.propertyCode;
    });

    this.currentItem.souceField.filterType = this.actionSheetNode.value;
    this.currentItem.filterType = this.actionSheetNode.value;
    switch (this.actionSheetNode.value) {
      case 'Eq':
      case 'NotEq':
        if (
          [
            DataItemType.Radio,
            DataItemType.Checkbox,
            DataItemType.Dropdown,
            DataItemType.DropdownMulti,
          ].includes(this.currentItem.propertyType)
        ) {
          //当筛选条件为添加表单时关联单选的查询条件时，单选、多选、下拉框单选多选无论设置的常量还是变量，在组合查询运行时都展示为输入框
          if (this.isRelevanceEntrance) {
            this.currentItem.souceField.displayType = 0;
          } else {
            this.currentItem.souceField.displayType = 3;
          }
          const controler: any = this.resetControler(
            this.currentItem.souceField,
          );
          this.ctrl.value = [];
          this.currentItem = controler;
        }

        if ([DataItemType.Date].includes(this.currentItem.propertyType)) {
          const controler: any = this.resetControler(
            this.currentItem.souceField,
          );
          this.ctrl.value = controler.options.defaultValue;
          this.currentItem = controler;
        }

        if ([DataItemType.Number].includes(this.currentItem.propertyType)) {
          const controler: any = this.resetControler(
            this.currentItem.souceField,
          );
          this.ctrl.value = controler.options.defaultValue;
          this.currentItem = controler;
        }

        if ([DataItemType.Address].includes(this.currentItem.propertyType)) {
          const controler: any = this.resetControler(
            this.currentItem.souceField,
          );
          this.currentItem = controler;
        }
        break;
      case 'Like':
      case 'NotLike':
        if (
          [
            DataItemType.Radio,
            DataItemType.Checkbox,
            DataItemType.Dropdown,
            DataItemType.DropdownMulti,
          ].includes(this.currentItem.propertyType)
        ) {
          this.currentItem.souceField.displayType = 0;
          const controler: any = this.resetControler(
            this.currentItem.souceField,
          );
          this.currentItem = controler;
        }

        if ([DataItemType.Address].includes(this.currentItem.propertyType)) {
          const controler: any = this.resetControler(
            this.currentItem.souceField,
          );
          this.currentItem = controler;
        }
        break;
      case 'Between':
      case 'NotBetween':
        if ([DataItemType.Date].includes(this.currentItem.propertyType)) {
          const controler: any = this.resetControler(
            this.currentItem.souceField,
          );
          this.ctrl.value = controler.options.defaultValue;
          this.currentItem = controler;
        }

        if ([DataItemType.Number].includes(this.currentItem.propertyType)) {
          const controler: any = this.resetControler(
            this.currentItem.souceField,
          );
          this.ctrl.value = controler.options.defaultValue;
          this.currentItem = controler;
        }

        break;
      case 'Gt':
      case 'Lt':
      case 'Gte':
      case 'Lte':
        if ([DataItemType.Date].includes(this.currentItem.propertyType)) {
          const controler: any = this.resetControler(
            this.currentItem.souceField,
          );
          this.ctrl.value = undefined;
          this.currentItem = controler;
        }

        if ([DataItemType.Number].includes(this.currentItem.propertyType)) {
          const controler: any = this.resetControler(
            this.currentItem.souceField,
          );
          this.ctrl.value = controler.options.defaultValue;
          this.currentItem = controler;
        }
        break;
      default:
        const controler: any = this.resetControler(this.currentItem.souceField);
        this.currentItem = controler;
        break;
    }
  }

  // 重新生成controler数据
  resetControler(field) {
    const controler: any = toFormControl(field);
    renderer.components.FormRendererHelper.mergeValue([controler], {}, true);
    controler.edit = true;
    controler.isRelevanceQuery = true;
    return controler;
  }

  /**
   * 取消添加条件
   */
  onCancelAdd() {
    this.tabKey = 'dataItemSelect';
    this.dataItemNode = null;
    this.actionSheetMenusValues = [];
    this.actionSheetNode = null;
    this.searchKey = '';
    this.onSearch();
    this.$emit('cancel', {});
  }

  /**
   * 保存添加条件
   */
  onSaveAdd() {
    this.tabKey = 'dataItemSelect';
    this.dataItemNode = null;
    this.actionSheetMenusValues = [];
    this.actionSheetNode = null;
    // console.log(this.currentItem);
    this.queryConditionsList.forEach((ele) => {
      ele.defaultValue = this.ctrl.value;
    });
    this.$emit('save', this.queryConditionsList);
  }

  onFocus() {
    this.isLeft = true;
  }

  onBlur() {
    this.isLeft = this.searchKey ? true : false;
  }

  onSearch() {
    this.searchDefaultQueryConditions = this.defaultQueryConditions.filter(
      (item) => {
        return item.name.indexOf(this.searchKey) > -1;
      },
    );
  }

  onClearSearchKey() {
    this.searchKey = '';
    this.isLeft = false;
    this.onSearch();
  }
}
</script>

<style lang="less">
@import '../../../../../common/styles/mixins.less';
.query-condition-box {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  position: absolute;
  top: -45px;
  left: 0;
  z-index: 999;
  display: none;
}
.query-condition-box.display {
  display: block;
}
.query-condition-add {
  position: absolute;
  bottom: 0;
  bottom: -103px;
  left: 0;
  width: 100%;
  background: #fff;
}
.tab-header {
  padding: 0 15px;
  overflow: hidden;
  border-bottom: 1px solid #eeeeee;
  .tab-header-item {
    float: left;
    height: 50px;
    line-height: 50px;
    .px2rem(font-size, 30px);
    font-weight: 400;
    color: #2970ff;
    margin-right: 45px;
    border-bottom: 2px solid transparent;
    max-width: 100px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .tab-header-item.active {
    border-bottom: 2px solid #2970ff;
  }
  .tab-header-item.save {
    float: right;
    margin-right: 0;
  }
  .aufontAll {
    float: right;
    margin-top: 15px;
    color: #cccccc;
    .px2rem(font-size, 36px);
  }
}
.tab-panel {
  .tab-panel-item {
    display: none;
    min-height: 390px;
    .data-search-box {
      padding: 8px 15px;
      border-bottom: 1px solid #eeeeee;
      position: relative;
      .item-search {
        height: 28px;
        line-height: 28px;
        background: #f4f4f8;
        .px2rem(border-radius, 28px);
        .px2rem(font-size, 30px);
        color: #999999;
        text-align: center;
      }
      .aufontAll {
        .px2rem(font-size, 30px);
        position: absolute;
        top: 14px;
        color: #cccccc;
      }
      .h-icon-all-search-o {
        left: 160px;
      }
      .h-icon-all-search-o.left {
        left: 20px;
      }
      .h-icon-all-close-circle {
        right: 20px;
      }
    }
    .data-item-box {
      padding: 0 15px;
      padding-bottom: 110px;
      height: 345px;
      overflow: auto;
      .data-item {
        position: relative;
        height: 45px;
        line-height: 45px;
        border-bottom: 1px solid #eeeeee;
        .px2rem(font-size, 30px);
        color: #333333;
        text-align: left;
        span {
          display: none;
          position: absolute;
          top: 0;
          right: 0;
        }
      }
      .data-item.active {
        color: #2970ff;
        span {
          display: block;
        }
      }
    }
    .h3-field-placeholder {
      margin-bottom: 0;
    }
  }
  .tab-panel-item.active {
    display: block;
  }
}

.tab-panel-item {
  .isRelevanceQuery,
  .control-remove {
    display: none;
  }
  .form-col-child {
    border-bottom: none;
  }
}
</style>

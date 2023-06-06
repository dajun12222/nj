<template>
  <div class="query-form" :class="{ collapsed: collapsed }">
    <div class="query-form-left">
      <mobile-form-renderer
        ref="formRenderer"
        :controls="controls"
        :schemaCode="schemaCode"
        :relevanceDataList="relevanceDataList"
        :isRelevanceEntrance="isRelevanceEntrance"
        @controlRemove="onControlRemove"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { H3Button } from 'h3-mobile-vue';
import { Component, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { renderer } from '../../../../../form';
import * as ControlFactory from '../../pc/helper/control-factory';
const { FormControlType } = renderer;

import {
  toFormControl,
  toFormControlType,
} from '../../../../../list/src/components/pc/components/queryForm/query-form-util';
import { DataItemType } from 'cloudpivot/form/schema';

@Component({
  name: 'query-form',
  components: {
    MobileFormRenderer: () =>
      import(
        '../../../../../form/src/renderer/components/mobile-form-renderer.vue'
      ),
    H3Button,
  },
})
export default class QueryForm extends Vue {
  @Prop() schemaCode!: string;

  @Prop()
  fields!: any[];

  @Prop({
    default: 3,
  })
  cols!: number;

  @Prop() relevanceDataList!: [];

  @Prop({ default: false }) isRelevanceEntrance?: boolean; //关联表单入口的查询条件

  @Provide()
  controllerChange(ctrl) {
    //control-adapter.vue中切换比较符号之后重新生成controller
    this.fields = this.fields.map((ele) => {
      if (ele.propertyCode === ctrl.key) {
        ele.filterType = ctrl.filterType;
      }
      return ele;
    });
    //不刷新列表
    this.$emit('changeEnforceQuery', false);
  }

  showMore = false;

  controls = '' as any;

  setFieldsTimer: any;

  formControls: any[] = [];

  collapsed = true;

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
  }

  onControlRemove(id) {
    this.$emit('queryControlRemove', id);
  }

  // 重置查询条件
  resetFilters() {
    const formRenderer = this.$refs.formRenderer as any;
    formRenderer.reset();
    //重置右上角条件
    this.fields = this.fields.map((x) => {
      x.filterType = x.filterType === x.op ? x.filterType : x.op;
      return x;
    });
    this.$emit('changeEnforceQuery', false);
  }

  // 查询
  query() {
    const formRenderer = this.$refs.formRenderer as any;
    const data = formRenderer.getValue();
    return data;
  }

  getOpValue() {
    // 返回关联表单查询字段的操作符
    const formRenderer = this.$refs.formRenderer as any;
    const data = formRenderer.getOpValue();
    return data;
  }

  //查询时时间范围控件显示可快捷选择日期段
  @Provide()
  showTimeRanges() {
    return true;
  }

  @Watch('fields', {
    immediate: true,
  })
  setFields(fields: any[]) {
    if (!fields.length) {
      this.init();
    }
    clearTimeout(this.setFieldsTimer);
    this.setFieldsTimer = setTimeout(() => {
      this.init();
    }, 300);
  }

  init() {
    if (!this.fields || !this.fields.length) {
      this.controls = [];
      return;
    }

    const controls: any = {};
    console.log('this.fields', this.fields);
    this.fields.forEach((field: any) => {
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

      //日期格式将默认值赋值到defaultValue上
      if (field.propertyType === DataItemType.Date) {
        if (!['Between', 'NotBetween'].includes(field.filterType)) {
          field.defaultValue = field.startValue;
        }
      }
      controls[field.propertyCode] = toFormControl(field);
      controls[field.propertyCode].isRelevanceQuery = true;
      controls[field.propertyCode].isRelevanceEntrance =
        !!this.isRelevanceEntrance;

      controls[field.propertyCode].filterType = field.filterType;
      //重新渲染时将当前输入的值重新赋值
      const node = this.formControls.find((ower) => {
        return ower.key === field.propertyCode;
      });
      if (node) {
        const _value = node.controller ? node.controller.value : '';
        if (field.propertyType === DataItemType.Date) {
          //日期格式介于、不介于情况需要接收数组日期格式
          if (['Between', 'NotBetween'].includes(field.filterType)) {
            if (Array.isArray(_value)) {
              controls[field.propertyCode].options.defaultValue = _value;
            } else {
              controls[field.propertyCode].options.defaultValue = [
                _value,
                _value,
              ];
            }
          } else {
            controls[field.propertyCode].options.defaultValue = _value;
          }
        } else if (field.propertyType === DataItemType.Address) {
          if (['Like', 'NotLike'].includes(field.filterType) && _value) {
            controls[field.propertyCode].options.defaultValue =
              _value.provinceName + _value.cityName + _value.districtName;
          } else {
            controls[field.propertyCode].options.defaultValue = _value;
          }
        } else if (
          [DataItemType.Checkbox, DataItemType.DropdownMulti].includes(
            field.propertyType,
          )
        ) {
          if (['Like', 'NotLike'].includes(field.filterType)) {
            controls[field.propertyCode].options.defaultValue = Array.isArray(
              _value,
            )
              ? _value.join(';')
              : _value;
          } else {
            controls[field.propertyCode].options.defaultValue = _value;
          }
        } else {
          controls[field.propertyCode].options.defaultValue = _value;
        }
      }
      // @ts-ignore
      controls[field.propertyCode].edit = true;
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

    //获取日期格式默认值，用于生成control时合并默认值
    const formControlsValue: any = {};
    formControls.forEach((formControlsItem) => {
      if (formControlsItem.propertyType === DataItemType.Date) {
        formControlsValue[formControlsItem.key] =
          formControlsItem.options.defaultValue;
      }
    });
    renderer.components.FormRendererHelper.mergeValue(
      formControls,
      formControlsValue,
      true,
    );
    this.controls = arr;
    this.formControls = formControls;
    const _this = this;
    if (this.isFormDetail) {
      this.formControls.forEach((control: any, index: number) => {
        const field = _this.fields[index];

        if (
          [DataItemType.Checkbox, DataItemType.Radio].includes(
            field.propertyType,
          )
        ) {
          control.type = FormControlType.Text;
          const defaultValue = _this.fields[index].defaultValue;
          if (Array.isArray(defaultValue)) {
            control.value = control.options.defaultValue.join(';');
          }
        }
      });
    }

    // console.log('formControls',formControls);
    // console.log('this.controls', this.controls);
    this.callQuery();
  }

  callQuery() {
    setTimeout(() => {
      const formRenderer = this.$refs.formRenderer as any;
      if (formRenderer) {
        formRenderer.edit();
        this.$emit('ready');
      } else {
        this.callQuery();
      }
    }, 300);
  }

  get isFormDetail() {
    return this.$route.path === '/form/detail';
  }
}
</script>
<style lang="less" scoped>
.query-form {
  display: flex;
  &-left {
    flex-grow: 1;
  }
}
</style>
<style lang="less">
.query-form {
  .form-col-child {
    border-bottom: 34px solid #f7f8fc;
    background: #fff;
  }
  .query-form-left {
    padding-top: 22px;
  }
  .h3-field-placeholder {
    margin-bottom: 0;
  }
  .numer-range-box {
    .h3-field-layout-h-label {
      display: none;
    }
  }
  .address {
    min-height: 45px;
    line-height: 1.5;
    .field__label {
      display: none;
    }
  }
}
</style>

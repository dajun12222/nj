<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div
    ref="formItem"
    class="custom-form-item"
    :class="{ inline: inline, 'is-error': errorRule.isError }"
  >
    <template v-if="!label && !prop">
      <slot></slot>
    </template>
    <template v-else>
      <div class="custom-form-item-content">
        <label
          :style="{ width: labelWidth }"
          class="custom-form-label"
          :class="{
            'label-position-left': labelPosition === 'left',
            'label-position-right': labelPosition === 'right',
            'label-position-top': labelPosition === 'top',
          }"
        >
          <span v-if="required" class="required">*</span>{{ label }}
        </label>

        <div
          :style="{ 'margin-left': isPositionTop ? '0px' : labelWidth }"
          class="custom-form-input"
          :class="{
            'label-position-left': labelPosition === 'left',
            'label-position-right': labelPosition === 'right',
            'label-position-top': labelPosition === 'top',
          }"
        >
          <slot></slot>
          <div v-if="!isPositionTop && errorRule.isError" class="error-message">
            {{ errorRule.message }}
          </div>
        </div>
      </div>
      <div v-if="isPositionTop && errorRule.isError" class="error-message">
        {{ errorRule.message }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Input,
  AutoComplete,
  InputNumber,
  Mentions,
  DatePicker,
  Cascader,
  Select,
  TimePicker,
} from '@h3/antd-vue';
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'FormItem',
  components: {
    AInput: Input,
    AAutoComplete: AutoComplete,
    AInputNumber: InputNumber,
    AMentions: Mentions,
    ASelect: Select,
    ACasccader: Cascader,
    ADatePicker: DatePicker,
    AMonthPicker: DatePicker.MonthPicker,
    ARangePicker: DatePicker.RangePicker,
    AWeekPicker: DatePicker.WeekPicker,
    ATimePicker: TimePicker,
  },
})
export default class FormItem extends Vue {
  @Prop() label!: string;

  @Prop() prop!: string;

  @Inject('FormProp') FormProp!: any;

  get rules() {
    if (!this.prop) {
      return [];
    }

    if (!this.FormProp || !this.FormProp.rules) {
      return [];
    }

    return this.FormProp.rules[this.prop] || [];
  }

  get inline() {
    return this.FormProp.inline;
  }

  get isPositionTop() {
    let res: boolean = false;

    if (this.labelPosition === 'top') {
      res = true;
    }

    return res;
  }

  get labelWidth() {
    return this.FormProp.labelWidth;
  }

  get labelPosition() {
    return this.FormProp.labelPosition;
  }

  get required() {
    let res: boolean = false;

    for (const item of this.rules) {
      if (item.required) {
        res = true;
      }
    }

    return res;
  }

  get errorRule() {
    let res: any = {};

    for (const item of this.rules) {
      if (item.isError) {
        res = item;
        break;
      }
    }

    return res;
  }

  private triggerEvent() {
    if (!this.prop || !this.rules.length) {
      return;
    }

    const slots: any = this.$slots.default;

    let componentTag: any = '';

    for (const node of slots) {
      if (node.componentOptions) {
        continue;
      }

      componentTag = node.componentOptions.tag;
      break;
    }

    const inputNodes: any[] = [
      'a-input',
      'a-auto-complete',
      'a-input-number',
      'a-mentions',
    ];
    const changeNodes: any[] = [
      'a-select',
      'a-cascader',
      'a-date-picker',
      'a-month-picker',
      'a-range-picker',
      'a-week-picker',
      'a-time-picker',
    ];

    const triggerElItem: any = this.$refs.formItem;

    const triggerEl: any = triggerElItem.querySelector('input');

    if (!triggerEl) {
      return;
    }

    this.removeEvent(triggerEl);
    this.addEvent(triggerEl);
  }

  removeEvent(el: any) {
    el.removeEventListener('focus', (e) => {});
    el.removeEventListener('blur', (e) => {});
  }

  addEvent(el: any) {
    el.addEventListener('focus', (e) => {});

    el.addEventListener('blur', (e) => {
      console.log('bb');
    });
  }

  mounted() {
    this.$nextTick(() => {
      this.triggerEvent();
    });
  }
}
</script>

<style lang="less" scoped>
.custom-form-item {
  position: relative;

  margin-right: 16px;
  margin-bottom: 22px;

  &.inline {
    display: inline-block;
  }

  &:after {
    content: '';
    display: block;
    clear: both;
  }

  .custom-form-label {
    padding-right: 12px;

    line-height: 32px;

    .reqiured {
      color: #f56c6c;
      margin-right: 4px;
    }

    &.label-position-left,
    &.label-position-right {
      float: left;
    }
  }

  .custom-form-input {
    position: relative;
  }

  .label-position-top {
    display: block;
  }

  .label-position-right {
    text-align: right;
  }

  .error-message {
    position: absolute;
    top: 100%;
    left: 0;

    padding-top: 4px;
    line-height: 1;

    font-size: 12px;

    color: #f5222d;
  }

  &.is-error {
    /deep/ .ant-input,
    /deep/ .ant-input-number,
    /deep/ .ant-mentions,
    /deep/ .ant-time-picker-input,
    /deep/ .ant-select-selection {
      border-color: #f5222d;
    }

    /deep/ .ant-select-selection {
      border-top-color: #f5222d;
    }
  }
}
</style>

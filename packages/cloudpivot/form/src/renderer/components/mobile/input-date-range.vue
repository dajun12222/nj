<template>
  <div :class="{ ranges: visible }">
    <time-ranges-select
      v-if="visible"
      ref="timeRangesSelect"
      v-control-back
      :displayFormat="control.options.displayFormat"
      @onChange="change"
    />
    <!-- :value="ctrl.value" -->
    <h3-datetime
      v-control-back
      class="start-range"
      :title="beginLabel"
      :required="ctrl.required"
      :readonly="readonly"
      :locale="locale"
      :cancelText="$t('cloudpivot.form.renderer.cancel')"
      :confirmText="$t('cloudpivot.form.renderer.ok')"
      :clearText="$t('cloudpivot.form.renderer.clear')"
      currentText
      :format="format"
      :value="begin"
      :startDate="control.options.minDate"
      :endDate="control.options.maxDate"
      :show="showModals[0]"
      @on-show="show(0)"
      @on-hide="close(0)"
      @onConfirm="(value) => onConfirm(0, value)"
      @on-clear="clearVal(0)"
    />

    <h3-datetime
      v-control-back
      :title="endLabel"
      :required="ctrl.required"
      :readonly="readonly"
      :locale="locale"
      :cancelText="$t('cloudpivot.form.renderer.cancel')"
      :confirmText="$t('cloudpivot.form.renderer.ok')"
      :clearText="$t('cloudpivot.form.renderer.clear')"
      currentText
      :format="format"
      :value="end"
      :startDate="control.options.minDate"
      :endDate="control.options.maxDate"
      :show="showModals[1]"
      @on-show="show(1)"
      @on-hide="close(1)"
      @onConfirm="(value) => onConfirm(1, value)"
      @on-clear="clearVal(1)"
    />
  </div>
</template>

<script lang="ts">
import { H3Datetime, H3Input } from 'h3-mobile-vue';
import { Component, Inject } from 'vue-property-decorator';
import { DateInputControl } from '../../controls';
import ControlBack from '../../directives/control-back';
import { dateFormatter } from '../../utils';
import TimeRangesSelect from './time-ranges-select.vue';

@Component({
  name: 'input-date-range',
  components: {
    H3Input,
    H3Datetime,
    TimeRangesSelect,
  },
  directives: {
    ControlBack,
  },
})
export default class InputDateRange extends DateInputControl {
  showModals = [false, false];

  visible: boolean = false;

  show(index: number) {
    this.showModals.splice(index, 1, true);
  }

  close(index: number) {
    this.showModals.splice(index, 1, false);
  }

  onConfirm(index: number, value: string) {
    const vals = this.ctrl.value.map((x: any) => x);
    vals[index] = value;
    this.ctrl.value = vals;
    //清除快捷选择状态
    if (this.visible) {
      (this.$refs.timeRangesSelect as any).clear();
    }
  }

  @Inject({
    default: () => () => {},
  })
  showTimeRanges!: () => Function;

  mounted() {
    if (this.showTimeRanges) {
      if (this.showTimeRanges()) {
        this.visible = true;
      }
    }
  }

  change(val) {
    if (this.ctrl.value && this.ctrl.value.length > 1) {
      this.ctrl.value[0] = this.formatDate(val.start.format(this.format));
      this.ctrl.value[1] = this.formatDate(val.end.format(this.format));
      this.ctrl.value = this.ctrl.value.slice(0); //触发计算属性更新
    }
  }

  get begin() {
    if (this.ctrl.value && this.ctrl.value.length > 1) {
      return this.formatDate(this.ctrl.value[0]);
    }
    return '';
  }

  get end() {
    if (this.ctrl.value && this.ctrl.value.length === 2) {
      return this.formatDate(this.ctrl.value[1]);
      // return dateFormatter(this.ctrl.value[1],'YYYY-MM-DD');
      // return this.ctrl.value[1];
    }
    return '';
  }

  get beginLabel() {
    return this.control.options.name + '开始';
  }

  get endLabel() {
    return this.control.options.name + '结束';
  }

  formatDate(val: any) {
    if (typeof val === 'string') {
      return val;
    } else if (val instanceof Date) {
      return dateFormatter(val, this.format);
    }
  }

  clearVal(index: number) {
    // ;
    this.ctrl.value[index] = '';
    this.ctrl.value = [...this.ctrl.value];
    // this.val =  '';
    // this.ctrl.value = null;
  }
}
</script>

<style lang="less">
.ranges .start-range .h3-field-line:before {
  content: '';
  position: absolute;
  background-color: #eee;
  display: block;
  z-index: 1;
  top: 0;
  right: auto;
  bottom: auto;
  left: 106px;
  width: calc(100% - 106px);
  height: 1px;
  -webkit-transform-origin: 50% 100%;
  transform-origin: 50% 100%;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
}
.ranges .start-range .h3-field-line:after {
  left: 106px !important;
  width: calc(100% - 106px) !important;
}
</style>

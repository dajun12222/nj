<template>
  <div :style="styleObj" :title="label">
    {{ label }}
    <a-tooltip v-if="tips" placement="top" style="margin: 5px 0 0 2px">
      <template slot="title">
        <span>{{ tips }}</span>
      </template>
      <a-icon type="question-circle" />
    </a-tooltip>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { BaseControl } from '../../controls';
import { StyleControlOptions } from '../../typings';
import { Tooltip } from '@h3/antd-vue';

@Component({
  name: 'form-title',
  components: {
    ATooltip: Tooltip,
  },
})
export default class FormTitle extends BaseControl<StyleControlOptions> {
  get tips() {
    return this.controlOpts.tips;
  }
}
</script>

<style lang="less" scoped>
div {
  width: 100%;
  font-size: 28px;
  /*font-family: PingFang-SC-Regular;*/
  font-weight: 400;
  color: rgba(0, 0, 0, 0.85);
  line-height: 36px;
  padding: 20px 16px 40px 16px;
  text-align: center;
  outline: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media print {
  div {
    white-space: pre-wrap !important;
  }
}
</style>

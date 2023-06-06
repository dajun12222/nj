<!--
 * @Author: your name
 * @Date: 2020-04-22 19:05:13
 * @LastEditTime: 2020-06-24 16:19:37
 * @LastEditors: zhuqiu
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\cloudpivot\form\src\components\Logic\components\mobile-input-logic.vue
 -->

<template>
  <H3Field
    class="input-logic"
    :showIcon="false"
    :label="label"
    :required="ctrl.required"
    :labelStyle="styleObj"
    :tip="controlOpts.tips"
  >
    <h3-switch
      v-model="ctrl.value"
      :readonly="readonly || readonlyFormula"
      color="#2970ff"
      :class="{ disabled: readonly }"
    />
  </H3Field>
</template>

<script lang="ts">
import { LogicOptions } from '../../../../../form/schema';
import { BaseControl } from '../../../../../form/src/common/controls/base-control';
import { H3Field, H3Switch } from 'h3-mobile-vue';
import { Component } from 'vue-property-decorator';

@Component({
  name: 'input-logic',
  components: {
    H3Switch,
    H3Field,
  },
})
export default class InputLogic extends BaseControl<LogicOptions> {
  // onChange(evt : boolean){
  //     if(this.ctrl){
  //       this.ctrl.value = evt;
  //     }
  // }
}
</script>

<style lang="less" scoped>
.input-logic {
  /deep/.h3-field-box > .h3-FB1 {
    text-align: right;
    padding-bottom: 10px;
  }
}
.input-logic.vertical {
  /deep/.h3-field-box > .h3-FB1 {
    text-align: left;
  }
}

/deep/.h3-switch.disabled {
  opacity: 0.5;
}
</style>

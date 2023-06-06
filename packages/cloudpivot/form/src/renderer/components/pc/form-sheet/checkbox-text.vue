<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-06 16:14:10
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-14 09:37:00
 * @FilePath: \yunshu6.0\packages\cloudpivot\form\src\renderer\components\pc\form-sheet\checkbox-text.vue
 * @Description: 
-->
<template>
  <div @mouseover="onMouseover" @mouseleave="onMouseleave" @click.stop="">
    <a-radio
      v-if="radio"
      v-show="!readonly && (hover || value)"
      :checked="value"
      @change="onCheckboxChange"
    />

    <a-checkbox
      v-else
      v-show="!readonly && (hover || value)"
      :checked="value"
      @change="onCheckboxChange"
    />

    <span v-show="readonly || (!value && !hover)">
      <slot></slot>
    </span>
  </div>
</template>

<script lang="ts">
import { Checkbox, Radio } from '@h3/antd-vue';
import { Component, Model, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'checkbox-text',
  components: {
    ACheckbox: Checkbox,
    ARadio: Radio,
  },
})
export default class CheckboxText extends Vue {
  @Model('change')
  value!: boolean;

  @Prop({
    default: false,
  })
  readonly!: boolean;

  @Prop({
    default: false,
  })
  radio!: boolean;

  hover = false;

  onMouseover() {
    this.hover = true;
  }

  onMouseleave() {
    this.hover = false;
  }

  onCheckboxChange(val: boolean) {
    this.$emit('change', val);
  }
}
</script>

<style lang="less" scoped>
label {
  margin: 0;
}
</style>

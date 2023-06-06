<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-02-17 16:30:32
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-02-17 17:08:47
 * @FilePath: \yunshu6.0-3\entries\portal\src\views\applications\report-select.vue
 * @Description: 
-->

<template>
  <a-radio-group v-model="innerFormat" @change="changeStringFormat">
    <a-radio value="1">
      {{ $t('languages.common.Applications.Enter') }}
    </a-radio>
    <a-radio value="2">
      {{ $t('languages.common.Applications.Select') }}
    </a-radio>
  </a-radio-group>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Radio } from '@h3/antd-vue';
@Component({
  name: 'report-select',
  components: {
    ARadioGroup: Radio.Group,
    ARadio: Radio,
  },
})
export default class ReportSelect extends Vue {
  @Prop({
    default: () => ({}),
  })
  field!: any;

  @Prop({
    default: '',
  })
  formula!: string;

  @Prop({
    default: '',
  })
  format!: string;

  options: any = [];

  innerFormat = this.format;

  changeStringFormat(e) {
    this.innerFormat = e.target.value;
    this.$emit('change', this.innerFormat);
  }
}
</script>

<style lang="less"></style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-02-17 16:30:32
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-02-18 10:54:32
 * @FilePath: \yunshu6.0-3\entries\admin\src\components\apps\report-design\report-select.vue
 * @Description: 
-->

<template>
  <a-radio-group v-model="innerFormat" @change="changeStringFormat">
    <a-radio value="1" checked> 输入文本 </a-radio>
    <a-radio value="2"> 选择选项 </a-radio>
  </a-radio-group>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
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

  innerFormat = this.format || '1';

  @Watch('field')
  init() {
    this.innerFormat = this.format || '1';
  }

  changeStringFormat(e) {
    this.innerFormat = e.target.value;
    this.$emit('change', this.innerFormat);
  }
}
</script>

<style lang="less"></style>

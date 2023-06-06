<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <pca-selector
    v-model="innerValue"
    :inReport="true"
    :prevConfirm="true"
    @change="valueChange"
  />
</template>

<script lang="ts">
import { Vue, Component, Model } from 'vue-property-decorator';

import PcaSelector from 'cloudpivot/form/src/common/components/pca-selector/pca-selector.vue';

@Component({
  name: 'report-address',
  components: {
    PcaSelector,
  },
})
export default class ReportAddress extends Vue {
  @Model('input', {
    default: () => [],
  })
  value!: any;

  get innerValue() {
    return this.value && this.value.length > 0 ? this.value[0].label : {};
  }

  valueChange(val: any) {
    let adcode = val.provinceName || '';
    if (val.cityAdcode) {
      adcode = val.cityAdcode;
    }
    if (val.districtAdcode) {
      adcode = val.districtAdcode;
    }
    const res = { value: adcode, label: val };
    console.log(res);
    this.$emit('input', res);
  }
}
</script>

<style lang="less" scoped></style>

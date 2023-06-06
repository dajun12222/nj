<!--
 * @Descripttion: 选择处理人-移动端
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-15 17:22:57
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-10-15 15:59:49
-->
<template>
  <mobile-staff-selector
    v-model="staff"
    :options="staffSelectorOpts"
    :title="$t('cloudpivot.form.runtime.modal.pleaseChoose')"
    class="staff-box"
    :required="true"
    :class="{ error: error }"
    @change="onChange"
  />
</template>
<script lang="ts">
import MobileStaffSelector from '../../../../../form/src/common/components/form-staff-selector/mobile/mobile-staff-selector.vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'form-adjustment',
  components: {
    MobileStaffSelector,
  },
})
export default class FormAdjustment extends Vue {
  @Prop() error!: boolean;

  @Prop() staff!: any[];

  staffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '',
  };

  onChange(e) {
    this.error = false;
    this.$emit('submit', e);
  }
}
</script>
<style lang="less" scoped>
.staff-box {
  background-color: #fff;
}
</style>

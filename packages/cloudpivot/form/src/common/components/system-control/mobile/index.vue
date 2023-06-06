<!--
 * @Author: your name
 * @Date: 2020-04-22 13:53:14
 * @LastEditTime: 2020-06-10 20:15:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\cloudpivot\form\src\common\components\system-control\mobile\index.vue
 -->

<template>
  <h3-field
    :readOnly="true"
    :showIcon="false"
    :label="label"
    :labelStyle="styleObj"
    :class="{ vertical: layoutType }"
    :tip="controlOpts.tips"
  >
    <div :class="{ field__control: !readonly }">
      {{ text }}
    </div>
  </h3-field>
</template>

<script lang="ts">
import { userApi } from '../../../../../../api';
import { StaffSelectorMapping } from '../../form-staff-selector/staff-selector-mappings';
import { H3Field } from 'h3-mobile-vue';
import { Component, Inject } from 'vue-property-decorator';
import { SystemControl } from '../controls/system-control';

@Component({
  name: 'system-control',
  components: {
    H3Field,
  },
})
export default class MobileSystemControl extends SystemControl {
  @Inject()
  layoutTypeFn!: Function;

  //上下布局模式
  get layoutType() {
    if (this.layoutTypeFn) {
      return this.layoutTypeFn();
    }
  }

  created() {
    this.getUserInfo();
  }

  async getUserInfo() {
    // 修改人、创建人 支持属性映射功能-- 获取当前人的用户信息
    const mappings: string = this.control.options.mappings || '';
    const value: any = this.control.value;
    const query: any = this.$route.query;
    if (mappings && value && Array.isArray(value)) {
      // 流程表单状态不执行映射
      if ((query.isWorkFlow && query.isWorkFlow === 'true') || query.edit) {
        return;
      }
      if (this.control.writable) {
        const { data } = await userApi.getUserInfo(value[0].id);
        this.ctrl.value = [data];
        StaffSelectorMapping.mappingOperate(this.ctrl.value, mappings, this);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.field.system > .field__label {
  justify-content: flex-end;
}
</style>

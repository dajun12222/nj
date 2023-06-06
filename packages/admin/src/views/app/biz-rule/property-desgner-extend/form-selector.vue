<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: zhuqiu
 * @Date: 2020-05-07 15:43:34
 * @LastEditTime: 2020-05-27 14:14:37
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\entries\admin\src\views\app\biz-rule\property-desgner-extend\form-selector.vue
 -->
<template>
  <div class="form-selector">
    <a-select v-model="val" style="width: 100%" @change="selectChange">
      <a-select-option
        v-for="item in formList"
        :key="item.code"
        :value="item.code"
      >
        {{ `${item.name}[${item.code}]` }}
      </a-select-option>
    </a-select>
  </div>
</template>
<script lang="ts">
import * as formApi from '@/apis/form';
import { Select } from '@h3/antd-vue';
import { PropertyComponent } from 'cloudpivot-designer/designer-core/property-panel';
import * as forms from 'cloudpivot-forms';
import { Component, Inject, Mixins, Watch } from 'vue-property-decorator';

@Component({
  name: 'form-selector',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class ModelsSelector extends Mixins(PropertyComponent) {
  @Inject()
  getController!: () => forms.FormGroup;

  get controller() {
    return this.getController();
  }

  val: any = '';

  formList: Array<any> = [];

  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  created() {
    this.getFormList(this.schemaCode);
  }

  async getFormList(schemaCode: string) {
    const res = await formApi.list(schemaCode);
    if (res.errcode === 0) {
      this.formList = res.data;
      if (
        this.controller.children.sheetCode &&
        !this.controller.children.sheetCode.value
      ) {
        this.val = this.formList[0].code;
        this.emitChange(this.val);
      } else {
        this.val = this.controller.children.sheetCode.value;
      }
    } else {
      this.$message.error(res.errmsg);
    }
  }

  selectChange(val) {
    this.emitChange(val);
  }

  @Watch('value')
  onValueChange(val) {
    if (!val) {
      this.getFormList(this.schemaCode);
    } else {
      this.val = val;
      this.emitChange(val);
    }
  }
}
</script>

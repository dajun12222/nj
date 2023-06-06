<!--
 * @Date: 2022-08-19 16:26:28
 * @LastEditors: nijy
 * @LastEditTime: 2022-08-22 16:50:40
 * @FilePath: \frontend\entries\admin\src\components\apps\model\dataitem-modals\dataItemBatchModel.vue
--> 
<template>
  <div>
    <FormBatchDrawer 
      :ableIndexes="ableIndexes">
    </FormBatchDrawer>
  </div>
</template>
<style lang="less" scoped>

</style>
<script lang="ts">
import { nameValidator } from '@/common/utils';
import { Vue } from 'vue-property-decorator';
import FormBatchDrawer from './dataItemBatchDrawer.vue';

// 数据模型：关联表单
export default Vue.extend({
  components: {
    FormBatchDrawer,
  },
  props: ['ableIndexes','indexNumberLimit','indexNumberMax', 'propertyIndexNum'],
  data() {
    return {
      name: 'dataItemBatchModel',
      templates: [
        {
          order: 1,
          labelName: this.$t('languages.Apps.Code'),
          uiformId: 'code',
          uiType: 1, // 1输入框/2下拉选择器/3复选框
          required: true,
          maxLength: 28,
          minLength: 0,
          pattern: new RegExp(/^[a-zA-Z][a-zA-Z0-9_]{0,27}$/),
          ruleMsg: this.$t('languages.Apps.CodeRule'),
          tip: this.$t('languages.Apps.CodeRule'),
          placeholder: this.$t('languages.PlaceHolder.InputCode'),
          validator: new RegExp(/^[a-zA-Z][a-zA-Z0-9_]{0,27}$/)
        },
        {
          order: 2,
          labelName: this.$t('languages.Apps.Name'),
          uiformId: 'name',
          uiType: 1,
          required: true,
          maxLength: 10,
          minLength: 0,
          pattern: new RegExp(/^[^ ].{0,9}$/),
          ruleMsg: '请输入不以空格开头长度不超过10个字符',
          placeholder: this.$t('languages.PlaceHolder.InputName'),
          validator: nameValidator
        },
        {
          order: 3,
          labelName: this.$t('languages.Apps.DataType'),
          uiformId: 'propertyType',
          uiType: 2, // 下拉选择器
          required: false,
          maxLength: 50,
          minLength: 0,
          pattern: '',
          ruleMsg: '',
          placeholder: this.$t('languages.PlaceHolder.Select')
        }
      ],
      // 选择器的数值
      selectCollection: {
        // 数据项
        type: [{ label: 'rrrrr', value: 'man' }, { label: 'ggggg', value: 'woman' }],
        // 选择业务类型
        businessTypeSelect: [{ label: '业务类型222', value: 'man' }, { label: '业务类型3333', value: 'woman' }]
      }
    };
  }
});
</script>

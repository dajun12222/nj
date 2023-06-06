<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Date: 2020-03-28 10:26:28
 * @LastEditors: zhuqiu
 * @LastEditTime: 2020-06-18 10:50:40
 * @FilePath: \frontend\entries\admin\src\components\apps\model\dataitem-modals\dataItemBaseModel.vue
-->
<template>
  <div>
    <form-drawer
      :templates="templates"
      :ableIndexes="ableIndexes"
      :indexNumberLimit="indexNumberLimit"
      :indexNumberMax="indexNumberMax"
      :bizSchemaCode="$route.params.bizSchemaCode"
      :propertyIndexNum="propertyIndexNum"
    />
  </div>
</template>
<style lang="less" scoped></style>
<script lang="ts">
import { nameValidator } from '@/common/utils';
import { Vue } from 'vue-property-decorator';
import FormDrawer from './dataItemDrawer.vue';
/*
// 可以建立索引的数据项类型列表
  ableIndexes: number[] = [];

  //适合的索引数量
  indexNumberLimit: number = 0;

  //可配置索引最大数量
  indexNumberMax: number = 0;

  dataNumber: number = 0;

*/
// 数据模型：关联表单
export default Vue.extend({
  components: {
    FormDrawer,
  },
  // props: [
  //   'ableIndexes',
  //   'indexNumberLimit',
  //   'indexNumberMax',
  //   'propertyIndexNum',
  // ],
  props: {
    'ableIndexes': {
      type: Array,
      default: function () { return [] },
    },
    'indexNumberLimit': {
      type: Number,
      default: 0,
    },
    'indexNumberMax': {
      type: Number,
      default: 0,
    },
    'dataNumber': {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      name: 'dataItemBaseModel',
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
          validator: new RegExp(/^[a-zA-Z][a-zA-Z0-9_]{0,27}$/),
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
          validator: nameValidator,
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
          placeholder: this.$t('languages.PlaceHolder.Select'),
        },
      ],
      // 选择器的数值
      selectCollection: {
        // 数据项
        type: [
          { label: 'rrrrr', value: 'man' },
          { label: 'ggggg', value: 'woman' },
        ],
        // 选择业务类型
        businessTypeSelect: [
          { label: '业务类型222', value: 'man' },
          { label: '业务类型3333', value: 'woman' },
        ],
      },
    };
  },
});
</script>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="modal-wrap">
    <component
      :is="currentModal"
      :ruleList="ruleList"
      :modalData="modalMsg"
      @backData="backData"
      @closeModal="closeModal"
      @isOpenChileMoadl="isOpenChileMoadl"
    />
  </div>
</template>
<script lang="ts">
import { DataItemType } from 'cloudpivot/form/schema';
import { Component, Prop, Vue } from 'vue-property-decorator';
import DataItem from '../../../../../../../../../entries/admin/src/components/apps/model/dataitem.vue';
import AddressPopover from './address.vue';
import DatePopover from './date.vue';
import FormStatus from './form-status.vue';
import ModelsSelectorSetting from './models-selector-setting.vue';
import NumberPopover from './number.vue';
import SystemText from './system-text.vue';
import TextPopover from './text.vue';
import TimePopover from './time.vue';
import BooleanPopover from './type-boolean.vue';
import UserSelect from './user-select.vue';

import { getRulesList } from 'cloudpivot/form/src/typings/view-filter-type-map';
import rules from 'cloudpivot/form/src/typings/view-filter-type-map';

@Component({
  name: 'ListDesign',
  components: {
    TextPopover,
    NumberPopover,
    DatePopover,
    TimePopover,
    BooleanPopover,
    UserSelect,
    SystemText,
    FormStatus,
    ModelsSelectorSetting,
    AddressPopover,
  },
})
export default class ListDesign extends Vue {
  @Prop() modalData!: any;

  currentModal: string = '';

  // 主表选项
  rules: any[] = rules;

  get ruleList() {
    return getRulesList(this.modalMsg.propertyType, this.modalMsg.code);
  }

  created() {
    switch (this.modalData.type) {
      /** 文本型 */
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.LongText:
        this.currentModal = this.modalData.isSystem
          ? 'SystemText'
          : 'TextPopover';
        break;
      /** 数值型 */
      case DataItemType.Number:
        this.currentModal = 'NumberPopover';
        break;
      /** 日期型 */
      case DataItemType.Date:
        this.currentModal = 'DatePopover';
        break;
      /** 逻辑型 */
      case DataItemType.Logic:
        this.currentModal = 'BooleanPopover';
        break;
      // 关联表单弹框
      case 9:
        this.currentModal = 'ModelsSelectorSetting';
        break;
      case DataItemType.Address:
        this.currentModal = 'AddressPopover';
        break;
      // 关联表单弹框
      case DataItemType.RelevanceFormEx:
      case DataItemType.RelevanceForm:
        this.currentModal = 'ModelsSelectorSetting';
        break;
      // 时间弹框
      case 12:
        this.currentModal = 'TimePopover';
        break;
      /** 逻辑型 */
      default:
        this.currentModal = 'UserSelect';
        break;
    }
    /**
     * 特殊字段单独处理
     */
    if (this.modalData.code === 'sequenceStatus') {
      this.currentModal = 'FormStatus';
    }
  }

  isOpenChileMoadl(value) {
    this.$emit('isOpenChileMoadl', value);
  }

  backData(val: any) {
    this.$emit('confirm', val);
  }

  closeModal() {
    this.$emit('cancel');
  }

  get modalMsg() {
    if (
      this.modalData.data &&
      this.modalData.data.options &&
      typeof this.modalData.data.options === 'string'
    ) {
      let optionsList: Array<string> = this.modalData.data.options.split(';');

      try {
        optionsList = JSON.parse(this.modalData.data.options).options.split(
          ';',
        );
      } catch (error) {}

      const targetOption: any[] = [];
      let defaultList: Array<string> = [];
      // optionsList.pop();
      if (
        this.modalData.data.defaultValue &&
        this.modalData.data.defaultValue.length > 0
      ) {
        defaultList = this.modalData.data.defaultValue.split(';');
        // defaultList.pop();
      }

      const length: number = optionsList.length | 0;
      for (let i = 0; i < length; i += 1) {
        const obj = {
          default: false,
          value: optionsList[i],
        };
        if (defaultList.indexOf(optionsList[i]) > -1) {
          obj.default = true;
        }
        targetOption.push(obj);
      }
      this.modalData.data.optionList = targetOption;
    }

    const res: any = JSON.parse(JSON.stringify(this.modalData));
    if (res.data && !res.data.filterType) {
      // 操作符号
      switch (res.data.propertyType) {
        // 文本类型
        case DataItemType.ShortText:
        case DataItemType.Checkbox:
        case DataItemType.DropdownMulti:
        case DataItemType.LongText:
        case DataItemType.Address:

        case DataItemType.StaffMulti:
        case DataItemType.DeptMulti:
        case DataItemType.RelevanceForm:
        case DataItemType.RelevanceFormEx:
          res.data.filterType = 'Like'; //默认包含
          break;

        // 日期、数值
        case DataItemType.Date:
        case DataItemType.Number:
          res.data.filterType = 'Between'; // 默认介于
          break;
        case DataItemType.StaffSingle:
        case DataItemType.Logic:
        case DataItemType.DeptSingle:
        case DataItemType.Radio:
        case DataItemType.Dropdown:
          res.data.filterType = 'Eq'; // 默认等于
          break;
        // case DataItemType.DeptSingle:
        //   res.data.filterType = 'Of'; // 默认等于
        //   break;
        default: // 默认包含
          res.data.filterType = 'Like';
          break;
      }
    }

    return res;
  }
}
</script>
<style lang="less" scoped>
.modal-wrap {
  padding-top: 12px;
  padding-bottom: 4px;
}
</style>

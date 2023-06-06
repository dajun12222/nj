<!--
 * @Descripttion: 筛选模块框
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-10-22 17:36:28
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-13 17:09:47
-->

<template>
  <div class="select-motail">
    <!-- <div class="select-motail-title">
      <h2>{{ $t("cloudpivot.flowCenter.pc.selection") }}</h2>
      <i class="icon aufontAll h-icon-all-close" @click.stop="close"></i>
    </div> -->
    <a-form-model ref="ruleForm" :model="ruleForm" layout="vertical">
      <a-form-model-item hasFeedback label="单据号">
        <a-input v-model="ruleForm.sequenceNo" placeholder="单据号" />
      </a-form-model-item>
      <a-form-model-item hasFeedback label="流程名称">
        <a-input v-model="ruleForm.workflowName" placeholder="流程名称" />
      </a-form-model-item>
      <a-form-model-item hasFeedback label="流程模板">
        <WorkflowTree v-model="ruleForm.workflowCode" @select="onSelect" />
      </a-form-model-item>
      <a-form-model-item
        v-if="selectType === 1 || selectType === 8"
        hasFeedback
        label="当前处理人"
      >
        <staff-selector
          v-model="ruleForm.participant"
          :options="staffSelectorOpts"
          :params="params"
        />
      </a-form-model-item>
      <a-form-model-item v-if="selectType !== 5" hasFeedback label="发起人">
        <staff-selector
          v-model="ruleForm.originatorName"
          :options="staffSelectorOpts"
          :params="params"
        />
      </a-form-model-item>

      <a-form-model-item
        v-if="selectType !== 1 && selectType !== 2"
        hasFeedback
        :label="
          selectType === 3
            ? '处理时间'
            : selectType === 4
            ? '接收时间'
            : '发起时间'
        "
      >
        <a-range-picker
          v-model="ruleForm.time"
          class="workflow-name-input"
          format="YYYY-MM-DD"
          :placeholder="[
            $t('cloudpivot.flowCenter.pc.startTime'),
            $t('cloudpivot.flowCenter.pc.endTime'),
          ]"
        />
      </a-form-model-item>

      <a-form-model-item v-if="selectType === 3" hasFeedback label="流程状态">
        <a-select
          v-model="ruleForm.instanceState"
          :allowClear="true"
          class="workflow-name-input"
        >
          <!-- <a-select-option value="DRAFT">草稿</a-select-option> -->
          <a-select-option value="PROCESSING">
            {{ $t('cloudpivot.flowCenter.pc.processing') }}
          </a-select-option>
          <a-select-option value="COMPLETED">
            {{ $t('cloudpivot.flowCenter.pc.completed') }}
          </a-select-option>
          <a-select-option value="CANCELED">
            {{ $t('cloudpivot.flowCenter.pc.canceled') }}
          </a-select-option>
          <a-select-option value="EXCEPTION">
            {{ $t('cloudpivot.flowCenter.pc.exception') }}
          </a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item
        v-if="selectType === 1 || selectType === 3"
        hasFeedback
        label="审批节点"
      >
        <a-input v-model="ruleForm.activityName" placeholder="审批节点" />
      </a-form-model-item>
      <a-form-model-item
        v-if="selectType === 1 || selectType === 3"
        hasFeedback
        label="处理人"
      >
        <staff-selector
          v-model="ruleForm.participantName"
          :options="staffSelectorOpts"
          :params="params"
        />
      </a-form-model-item>
    </a-form-model>

    <div class="form-btn">
      <a-button @click="clearKeyword"> 重置 </a-button>
      <a-button type="primary" @click.stop="submitForm"> 查询 </a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Button, FormModel, Input, DatePicker, Select } from '@h3/antd-vue';
import * as utils from '../../../utils/pc/utils';
import WorkflowTree from './tree_new.vue';
import StaffSelector from '../../../../../form/src/common/components/form-staff-selector/pc/staff-selector.vue';

@Component({
  name: 'page-select-motail',
  components: {
    AFormModelItem: FormModel.Item,
    AFormModel: FormModel,
    AButton: Button,
    AInput: Input,
    WorkflowTree,
    StaffSelector,
    ARangePicker: DatePicker.RangePicker,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class PageSelectMotail extends Vue {
  @Prop({ default: true }) isShow!: boolean;

  @Prop({ default: 1 }) selectType!: number; // 11 应用筛选

  ruleForm: any = {
    sequenceNo: '', //单据号
    workflowName: '', //流程名称
    workflowCode: '', //流程模板
    originatorName: '', //发起人
    activityName: '', //审批节点
    participantName: '', //处理人
    time: [], //处理时间
    instanceState: '', //流程状态
    participant: '', //当前处理人
  };

  params: any = {
    sourceType: 'portal',
  };

  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  submitForm() {
    /**
     * 处理筛选条件
     */

    const obj = { ...this.ruleForm };
    if (obj.time.length > 0) {
      obj.startTime = utils.timeStampToDate(
        'YY-MM-DD',
        this.ruleForm.time[0]._d,
      );
      obj.endTime = utils.timeStampToDate('YY-MM-DD', this.ruleForm.time[1]._d);
    }
    delete obj.time;
    this.$emit('search', obj);
  }

  onSelect(nameObj: Object) {
    // @ts-ignore
    this.ruleForm.workflowCode = nameObj.name;
  }

  // resetForm(formName: string) {
  //   /**
  //    * resetFields重置无效
  //    */
  //   Object.keys(this.ruleForm).forEach((key) => (this.ruleForm[key] = ""));
  // }

  /**
   * 重置清空
   */
  clearKeyword() {
    Object.keys(this.ruleForm).forEach((key) => (this.ruleForm[key] = ''));
    this.$emit('search', this.ruleForm);
  }

  close() {
    this.$emit('close');
  }
}
</script>
<style lang="less" scoped>
.select-motail {
  width: 320px;
  background: #ffffff;
  border-radius: 4px;
  z-index: 10;
  padding-top: 16px;
  max-height: 560px;
  > .select-motail-title {
    display: flex;
    justify-content: right;
    align-items: center;
    padding: 0 24px;
    width: 100%;
    > h2 {
      font-size: 16px;
      color: #38393d;
      font-weight: 600;
    }
    > .icon {
      font-size: 22px;
      cursor: pointer;
      color: #99a1ae;
      width: auto;
      height: auto;
      vertical-align: baseline;
    }
  }

  /deep/ .ant-form {
    max-height: 448px;
    overflow-y: auto;
    width: 100%;
    padding: 0 8px;
  }

  /deep/ .ant-form-item {
    margin-bottom: 9px;
  }

  /deep/ .ant-form-item-label > label {
    color: #111218;
    font-size: 14px;
  }

  /deep/ .ant-form::-webkit-scrollbar-thumb {
    width: 6px;
    background-color: rgba(17, 18, 24, 0.25);
    border-radius: 3px;
    height: 50px;
  }

  /**
 滚动条外层轨道
*/
  /deep/ .ant-form::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .form-btn {
    margin: 7px auto 12px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 24px;
    width: 100%;
    .ant-btn {
      height: 32px;
      margin-left: 8px;
      line-height: 32px;
    }
  }
}
</style>

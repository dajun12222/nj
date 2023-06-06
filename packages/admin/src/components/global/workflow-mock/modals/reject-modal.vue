<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="showModal"
    title="驳回节点"
    :width="552"
    :maskClosable="false"
    :keyboard="false"
    @cancel="cancel"
    @ok="handleOk"
  >
    <h1>请选择需要驳回的哪一节点</h1>
    <a-row>
      <a-col :span="4"> <i class="star">*</i>驳回节点: </a-col>
      <a-col :span="20">
        <a-select
          v-model="activityCode"
          placeholder="请选择"
          class="select-wrap"
          :class="errTip ? 'error' : ''"
          @change="selectChange"
        >
          <a-select-option
            v-for="(item, index) in list"
            :key="index"
            :value="item.activityCode"
          >
            {{ item.activityName }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col>
        <a-checkbox :checked="submitToReject" @change="checkboxChange">
          提交后返回当前节点
        </a-checkbox>
      </a-col>
    </a-row>
  </a-modal>
</template>
<script lang="ts">
import { Row, Col, Checkbox, Modal, Select } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
@Component({
  name: 'reject-modal',
  components: {
    ARow: Row,
    ACol: Col,
    ACheckbox: Checkbox,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class RejectModal extends Vue {
  @Prop() value!: boolean;

  @Prop({ default: [] }) list: any[];

  @Prop() record: any;

  showModal = false;

  errTip = false;

  submitToReject: boolean = false;

  activityCode = '';

  cancel() {
    this.errTip = false;
    this.activityCode = '';
    this.submitToReject = false;
    this.$emit('input', false);
  }

  checkboxChange(event) {
    this.submitToReject = event.target.checked;
  }

  selectChange() {
    if (this.activityCode) {
      this.errTip = false;
    }
  }

  handleOk() {
    if (!this.activityCode) {
      this.errTip = true;
      return this.$message.error('驳回节点必填');
    }
    this.errTip = false;
    this.$emit('input', false);
    this.$emit('rejectAction', {
      rejectToActivityCode: this.activityCode,
      workItemId: this.record.id,
      workflowCode: this.record.workflowCode,
      submitToReject: this.submitToReject,
    });
    this.activityCode = '';
    this.submitToReject = false;
  }

  @Watch('value')
  onValueChange(val: boolean) {
    this.showModal = val;
  }
}
</script>
<style lang="less" scoped>
h1 {
  font-weight: 500;
  color: #111218;
  font-size: 16px;
  margin-bottom: 16px;
}
.select-wrap {
  width: 100%;
}
.star {
  color: #f4454e;
  &::before {
    content: '';
  }
}
.row {
  margin-top: 20px;
}
</style>

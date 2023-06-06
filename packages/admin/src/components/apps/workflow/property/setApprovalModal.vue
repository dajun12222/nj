<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="setApprovalCon">
    <div class="setApprovalConList">
      <a-row
        type="flex"
        class="RowStyle"
        style="font-weight: 600; font-size: 12px; margin-bottom: 8px"
      >
        <a-col :span="18"> 审批意见 </a-col>
        <a-col :span="4"> 可见 </a-col>
        <a-col :span="2"> 必填 </a-col>
      </a-row>
      <a-row type="flex" class="RowStyle">
        <a-col :span="18"> 文本意见 </a-col>
        <a-col :span="4">
          <a-checkbox
            v-model="approvalInfo.commentPermission.visible"
            class="RowStyleCheckBox"
            @change="show"
          />
        </a-col>
        <a-col :span="2">
          <a-checkbox
            v-model="approvalInfo.commentPermission.required"
            class="RowStyleCheckBox"
            @change="required"
          />
        </a-col>
      </a-row>
      <a-row type="flex" class="RowStyle">
        <a-col :span="18"> 附件 </a-col>
        <a-col :span="4">
          <a-checkbox
            v-model="approvalInfo.attachmentPermission.visible"
            class="RowStyleCheckBox"
            @change="show"
          />
        </a-col>
        <a-col :span="2">
          <a-checkbox
            v-model="approvalInfo.attachmentPermission.required"
            class="RowStyleCheckBox"
            @change="required"
          />
        </a-col>
      </a-row>
      <a-row type="flex" class="RowStyle">
        <a-col :span="18"> 手写签名 </a-col>
        <a-col :span="4">
          <a-checkbox
            v-model="approvalInfo.signPermission.visible"
            class="RowStyleCheckBox"
            @change="show"
          />
        </a-col>
        <a-col :span="2">
          <a-checkbox
            v-model="approvalInfo.signPermission.required"
            class="RowStyleCheckBox"
            @change="required"
          />
        </a-col>
      </a-row>
    </div>
  </div>
</template>
<script lang="ts">
import {
  Select,
  Checkbox,
  Tooltip,
  Icon,
  Modal,
  Row,
  Col,
  Input,
} from '@h3/antd-vue';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

@Component({
  name: 'SetNameModal',
  components: {
    ARow: Row,
    ACol: Col,
    AInput: Input,
    AIcon: Icon,
    ACheckbox: Checkbox,
  },
})
export default class SetNameModal extends Vue {
  @Prop({ default: [] }) approvalData: any;

  approvalInfo: any = {};

  approvalDataChange(type: number) {
    const arr: any = [
      'commentPermission',
      'attachmentPermission',
      'signPermission',
    ];
    for (const key of arr) {
      if (
        this.approvalInfo[key] &&
        typeof this.approvalInfo[key] === 'object'
      ) {
        if (type === 1) {
          if (!this.approvalInfo[key].visible) {
            this.approvalInfo[key].required = false;
          }
        } else {
          if (this.approvalInfo[key].required) {
            this.approvalInfo[key].visible = true;
          }
        }
      }
    }
  }

  show() {
    this.approvalDataChange(1);
  }

  required() {
    this.approvalDataChange(2);
  }

  created() {
    this.approvalInfo = JSON.parse(JSON.stringify(this.approvalData[0]));
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.setApprovalCon {
  width: 100%;
  color: @nav-font-color;
  padding: 0 9px;
  margin-bottom: 70px;
  .setApprovalConList {
    width: 100%;
    font-size: 14px;
    .RowStyle {
      width: 100%;
      height: 36px;
      display: flex;
      align-items: center;
      .RowStyleCheckBox {
        margin-left: 4px;
      }
    }
  }
}
</style>

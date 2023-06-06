<template>
  <div class="addGroup">
    <a-modal
      v-model="isShow"
      class="groupsIndexs"
      width="600px"
      :bodyStyle="{ padding: 0 }"
      :title="groupType === 1 ? '新增组' : '编辑组'"
      centered
      :maskClosable="false"
      :keyboard="true"
      @cancel="onClickCancle"
      @ok="ok"
    >
      <a-row>
        <a-col :span="24" class="elCol">
          <a-col :span="4"> 组名称： </a-col>
          <a-col :span="12">
            <a-input
              v-model="groupName"
              placeholder="请输入组名称"
              class="input-search"
            />
          </a-col>
        </a-col>
        <a-col :span="24" class="elCol">
          <a-col :span="4"> 是否公共组： </a-col>
          <a-col :span="20">
            <a-radio-group v-model="publicGroup" class="inputType">
              <a-radio :value="1">是</a-radio>
              <a-radio :value="0">否</a-radio>
            </a-radio-group>
          </a-col>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>
<script lang="ts">
import {
  Avatar,
  Button,
  Checkbox,
  Icon,
  Modal,
  Radio,
  Select,
  Col,
  Row,
  Input,
  Form,
} from '@h3/antd-vue';

import cloneDeep from 'lodash/cloneDeep';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
@Component({
  name: 'addGroup',
  components: {
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    AInput: Input,
    AForm: Form,
    AFormItem: Form.Item,
    ARadioGroup: Radio.Group,
    ARadio: Radio,
  },
})
export default class addGroup extends Vue {
  @Prop({ default: 1 }) groupType?: number;

  @Watch('groupType')
  onChangeGroupType(newVal: any) {
    if (newVal === 1) {
      this.clearData();
    }
  }

  @Prop({ default: false }) value?: boolean;

  @Watch('value')
  onChangeValue(newVal: any) {
    if (newVal) {
      if(this.groupType === 1){
        this.clearData();
      }
      this.isShow = newVal;
    }
  }

  isShow: boolean = false;

  @Watch('isShow')
  onChangeIsShow(newVal: any) {
    this.$emit('input', newVal);
  }

  groupName: string = '';

  publicGroup: number = 0;

  form: any = {};

  onClickCancle() {}

  clearData(){
    this.groupName = '';
    this.publicGroup = 0;
  }

  edit(data) {
    this.groupName = data.obj.groupName;
    this.publicGroup = Number(data.obj.publicGroup);
  }

  ok() {
    this.isShow = false;
    this.$emit('ok', {
      groupType: this.groupType,
      groupName: this.groupName,
      publicGroup: this.publicGroup,
    });
  }
}
</script>
<style lang="less" scoped>
.elCol {
  padding: 0 24px;
  margin-bottom: 5px;
}
</style>

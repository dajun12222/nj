<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <div v-if="inputValue === '已设置'" class="txt-delete">
        <div class="txt">{{ inputValue }}</div>
        <em
          class="icon aufontAll h-icon-all-delete-o1"
          @click.stop="deleteAll"
        ></em>
      </div>
      <!-- <a-icon type="ellipsis" /> -->
      <em class="icon aufontAll h-icon-all-setting-o"></em>
    </div>
    <a-modal
      v-model="visible"
      class="recipientSettings-modal"
      title="接收人设置"
      okText="确定"
      cancelText="取消"
      wrapClassName="recipientSettings"
      @ok="modalHide"
    >
      <a-row>
        <a-col :span="4">
          <span>接收部门</span>
        </a-col>
        <a-col :span="20">
          <staff-selector
            v-model="departments"
            :options="staffSelectorOpts"
            :showDetail="true"
          />
        </a-col>
      </a-row>
      <a-row class="mt-5">
        <a-col :span="4">
          <span>接收用户</span>
        </a-col>
        <a-col :span="20">
          <staff-selector
            v-model="users"
            :options="staffSelectorUsers"
            :showDetail="true"
          />
        </a-col>
      </a-row>
      <a-row class="mt-5">
        <a-col :span="4">
          <span>接收角色</span>
        </a-col>
        <a-col :span="20">
          <role-select
            class="roleSelect"
            :multiple="true"
            :defaultValue="role"
            @select="selectRole"
          />
        </a-col>
      </a-row>
      <a-row class="mt-5">
        <a-col :span="4">
          <span>接收数据项</span>
        </a-col>
        <a-col :span="20">
          <data-item-select
            :onlyPublished="true"
            style="margin-left: -5px"
            mode="multiple"
            :defaultValue="selections"
            :list="currentFieldList"
            :systemFilterCtl="{
              code: [
                'workflowInstanceId',
                'sequenceNo',
                'sequenceNo',
                'ownerDeptQueryCode',
                'sortKey',
              ],
            }"
            :bizFilterCtl="{ type: [10, 8, 6, 7] }"
            :disabled="false"
            @change="
              (val, vNode) => {
                dataItemChange(val, vNode);
              }
            "
          />
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script lang="ts">
import appsApi from '@/apis/apps';
import common from 'cloudpivot/common/pc';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import { PropertyComponent } from 'cloudpivot-designer/designer-core/property-panel';
import * as forms from 'cloudpivot-forms';
import { Component, Inject, Mixins, Watch } from 'vue-property-decorator';
import DataItemSelect from '../../data-rule/data-item-select.vue';
import { Icon, Modal, Row, Col } from '@h3/antd-vue';

@Component({
  name: 'recipientSettings',
  components: {
    StaffSelector,
    DataItemSelect,
    RoleSelect: common.components.RoleSelect,
    AIcon: Icon,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
  },
})
export default class RecipientSettings extends Mixins(PropertyComponent) {
  @Inject()
  getController!: () => forms.FormGroup;

  get controller() {
    return this.getController();
  }

  visible: boolean = false;

  users: Array<any> = [];

  role: Array<string> = [];

  departments: Array<any> = [];

  selections: Array<string> = [];

  currentFieldList: any = [];

  inputValue: string = '未设置';

  // 选人控件初始化参数
  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: false,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  staffSelectorUsers: any = {
    selectOrg: false,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  modalShow() {
    this.visible = true;
    this.getCurrentDataItems();

    this.initModal();
  }

  initModal() {
    // 编辑时候
    if (
      this.value &&
      ((this.value.hasOwnProperty('departments') &&
        this.value.departments.length) ||
        (this.value.hasOwnProperty('users') && this.value.users.length) ||
        (this.value.hasOwnProperty('roles') && this.value.roles.length) ||
        (this.value.hasOwnProperty('selections') &&
          this.value.selections.length))
    ) {
      this.departments = this.value.departments;
      this.role = this.value.roles;
      this.users = this.value.users;
      this.selections = this.value.selections;
      this.inputValue = '已设置';
    } else {
      //【消息通知接收人选择表单数据bug】https://www.tapd.cn/52843214/bugtrace/bugs/view/1152843214001004631
      this.departments = [];
      this.role = [];
      this.users = [];
      this.selections = [];
      this.inputValue = '未设置';
    }
  }

  dataItemChange(val, vNode) {
    this.selections = val;
  }

  modalHide() {
    let valid: boolean = false;
    const subData = {
      departments: this.departments,
      users: this.users,
      roles: this.role,
      selections: this.selections,
    };
    Object.values(subData).forEach((val: []) => {
      if (val.length !== 0) {
        valid = true;
        return;
      }
    });

    this.visible = false;
    if (valid) {
      this.inputValue = '已设置';
      this.value = subData;
      this.emitChange(this.value);
    } else {
      this.inputValue = '未设置';
      this.value = subData;
      this.emitChange(this.value);
    }
  }

  selectRole(value: any) {
    this.role = [];
    value.map((val: any) => {
      val.code && this.role.push(val.code);
    });
  }

  @Watch('value', {
    immediate: true,
  })
  valueChange(value) {
    this.emitChange(value);
    if (
      this.value &&
      ((this.value.hasOwnProperty('departments') &&
        this.value.departments.length) ||
        (this.value.hasOwnProperty('users') && this.value.users.length) ||
        (this.value.hasOwnProperty('roles') && this.value.roles.length) ||
        (this.value.hasOwnProperty('selections') &&
          this.value.selections.length))
    ) {
      this.inputValue = '已设置';
    } else {
      this.inputValue = '未设置';
    }
  }

  // 获取当前模型数据项
  async getCurrentDataItems() {
    const schemaCode = this.$route.params.bizSchemaCode;
    this.currentFieldList = [];
    // 获取数据字段
    const res = await appsApi.getDataItemList({ schemaCode: schemaCode });
    if (res && res.errcode === 0) {
      // 只保留和人员相关的数据字段
      res.data.map((d: any) => {
        if ([5, 50, 51, 60, 61].includes(d.propertyType)) {
          this.currentFieldList.push(d);
        }
      });
    } else {
      this.$message.error(res.errmsg as string);
    }
  }
}
</script>

<style lang="less">
.recipientSettings {
  .ant-select-selection {
    width: 392px;
    margin-left: 5px;
  }
  .mt-5 {
    height: 32px;
    margin-top: 16px;
  }
  .roleSelect {
    width: 392px;
  }
  .role-selector__input {
    width: 392px;
  }
}
</style>

<style lang="less" scoped></style>

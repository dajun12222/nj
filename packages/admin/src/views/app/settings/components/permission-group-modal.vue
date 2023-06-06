<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="visible"
    :title="title"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    width="520px"
    :maskClosable="false"
    :keyboard="false"
    @ok="submit"
    @cancel="close"
  >
    <div class="permission-group-modal">
      <a-row type="flex">
        <a-col :span="4">
          {{ $t('languages.appSettings.GroupName') }}
        </a-col>
        <a-col :span="20" :class="{ error: error.name }">
          <a-input v-model="name" :maxLength="50" />
          <div v-show="error.name" class="message">
            {{ $t('languages.Apps.NameRule') }}
          </div>
        </a-col>
      </a-row>

      <a-row type="flex">
        <a-col :span="4">
          {{ $t('languages.appSettings.SetType') }}
        </a-col>
        <a-col :span="20" class="checkbox">
          <a-radio-group v-model="setType" @change="onSetTypeChange">
            <a-radio :value="0">
              {{ $t('languages.appSettings.AsOrg') }}
            </a-radio>
            <a-radio :value="1">
              {{ $t('languages.appSettings.AsRole') }}
            </a-radio>
          </a-radio-group>
          <!--<div class="message" v-show="error.staffs">{{ $t('languages.appSettings.IncludeRule') }}</div>-->
        </a-col>
      </a-row>

      <a-row v-if="visibleType.isExternalUser" type="flex">
        <a-col :span="4">
          {{ $t('languages.appSettings.IncludeOrg') }}
        </a-col>
        <a-col :span="20" :class="{ error: error.staffs }">
          <staff-selector
            v-model="staffs"
            :keepDeptIds="keepDeptIds"
            :options="staffSelectorOpts"
            :params="{ filterType: 'admin' }"
            :showDetail="true"
          />
          <div v-show="error.staffs" class="message">
            {{ $t('languages.appSettings.IncludeRuleOrg') }}
          </div>
        </a-col>
      </a-row>

      <a-row v-if="visibleType.roles" type="flex">
        <a-col :span="4">
          {{ $t('languages.appSettings.IncludeRole') }}
        </a-col>
        <a-col :span="20" :class="{ error: error.roles }">
          <role-select
            class="roleSelect"
            :multiple="true"
            :appCode="appCode"
            defaultValueKey="id"
            :defaultValue="roles"
            @select="selectRole"
          />
          <div v-show="error.roles" class="message">
            {{ $t('languages.appSettings.IncludeRule') }} 
          </div>
        </a-col>
      </a-row>

      <a-row v-if="visibleType.isExternalUser" type="flex">
        <a-col :span="4">
          {{ $t('languages.appSettings.externalUser') }}
          <a-tooltip
            :title="$t('languages.appSettings.externalUserTips')"
            style="margin-left: 3px"
          >
            <a-icon type="question-circle-o" />
          </a-tooltip>
        </a-col>
        <a-col
          :span="20"
          class="checkbox"
          :class="{ error: error.isExternalUser }"
        >
          <a-radio-group v-model="isExternalUser">
            <a-radio :value="true"> 开启 </a-radio>
            <a-radio :value="false"> 关闭 </a-radio>
          </a-radio-group>
          <div v-show="error.isExternalUser" class="message">
            {{ $t('languages.appSettings.IncludeRuleOrg') }}
          </div>
        </a-col>
      </a-row>
    </div>
  </a-modal>
</template>

<script lang="ts">
import permissionApi from '@/apis/system/permission.api';
import { formApi } from 'cloudpivot/api';
import common from 'cloudpivot/common/pc';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import { Col, Row, Modal, Input, Radio, Tooltip, Icon } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'permission-group-modal',
  components: {
    ARow: Row,
    AModal: Modal,
    AInput: Input,
    ARadio: Radio,
    ATooltip: Tooltip,
    ARadioGroup: Radio.Group,
    ACol: Col,
    StaffSelector,
    RoleSelect: common.components.RoleSelect,
    AIcon: Icon,
  },
})

// 权限组弹窗
export default class PermissionGroupModal extends Vue {
  
  @AppCenterModule.State('appInfo') appInfo: any;

  @Watch('appCode',{ deep: true, immediate: true })
  onChangeAppCode(newVal:any){
    console.log('start...newVal...');
    console.log(newVal);
  }

  get appCode(){
    return this.appInfo.code || this.$route.params.appCode;
  }

  visible: boolean = false;

  name = '';

  setType = 0 as any;

  staffs = '' as any;

  roles = '' as any;

  isExternalUser: boolean = false;

  error: any = {};

  columns: any[] = [];

  keepDeptIds: string[] = [];

  modifyGroupOpen: boolean = true;

  visibleType = {
    staffs: true,
    isExternalUser: true,
    roles: false,
    rolesRange: false,
  };

  staffSelectorOpts = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择组织或用户',
  };

  orData: any = null;

  get title() {
    return this.groupId === '' ? '新增权限组' : '编辑权限组';
  }

  @Prop() value!: boolean;

  @Watch('value')
  onViewChange(view: any) {
    if (view) {
      if (this.groupId === '') {
        // 重置表单数据
        this.name = '';
        this.setType = 0;
        this.staffs = '';
        this.roles = '';
        this.isExternalUser = false;
        this.error = {};
        this.visibleType = {
          staffs: true,
          isExternalUser: true,
          roles: false,
          rolesRange: false,
        };
      }
    }
  }

  @Prop({
    default: '',
  })
  groupId!: string;

  @Watch('$i18n.locale')
  onLanguageChange(l: string) {
    this.placeHolderLang();
    this.setColumns();
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.visible = v;
  }

  @Watch('groupId', {
    immediate: true,
  })
  onGroupIdChange(groupId: string) {
    let appCode: string = '';
    if (!groupId) {
      appCode = this.$route.params.appCode || this.appInfo.code;
      return;
    }

    permissionApi.getGroup(groupId, appCode).then((res) => {
      if (res.errcode !== 0) {
        this.$message.error(res.errmsg as string);
        return;
      }
      const { data } = res;
      if (data) {
        this.name = data.name;
        this.isExternalUser = data.externalUser;
        this.setType = data.authorType;
        this.setTypeChange(this.setType);
        this.staffs = data.departments ? JSON.parse(data.departments) : '';
        this.roles = data.roles ? JSON.parse(data.roles) : '';
        this.orData = data;
        // 通过接口判断当前组织是否可编辑
        this.setKeepDeptIds();
      }
    });
  }

  @Prop({
    default: '',
  })
  propOrData!: any;

  @Watch('propOrData', {
    immediate: true,
  })
  onPropOrDataChange(value) {
    if (value) {
      this.propOrData = value;
      this.orData = { ...this.propOrData };
    }
  }

  /**
   * 判断选人控件是否可编辑
   * */
  async setKeepDeptIds() {
    let sType: string = '';
    const { staffs } = this;

    if (!staffs.length) {
      return;
    }

    const types: number[] = staffs.map((i: any) => i.unitType) as number[]; // 1 部门  3 人员
    const isAllDept: boolean = types.every((i: number) => i === 1);
    const isAllStaff: boolean = types.every((i: number) => i === 3);
    const bothDeptAndStaff: boolean = types.some(
      (i: number) => i === 3 || i === 1,
    );

    if (isAllDept) {
      // 全部部门
      sType = 'DEPT';
    } else if (isAllStaff) {
      // 全部人员
      sType = 'USER';
    } else if (bothDeptAndStaff) {
      // 二者均有
      sType = 'DEPT_USER';
    } else {
      //Else Empty block statement
    }

    const targetIds: string[] = staffs
      .map((staff: any) => {
        if (staff.unitType === 1) {
          return staff.id;
        }
      })
      .filter((i: any) => !!i);

    const userIds: string[] = staffs
      .map((staff: any) => {
        if (staff.unitType === 3) {
          return staff.id;
        }
      })
      .filter((i: any) => !!i);

    const params: any = {
      targetIds: targetIds.join(','),
      userIds: userIds.join(','),
      sourceType: sType,
    };

    const res: any = await formApi.getStaffOperateAble(params);
    const { data } = res;

    this.keepDeptIds = data
      .map((i: any) => {
        if (!i.op) {
          return i.targetId;
        }
      })
      .filter((i: any) => !!i);
  }

  onSetTypeChange(e: any) {
    const type = e.target.value;
    this.setTypeChange(type);
    // permissionApi.updateAppPackage(params);
  }

  close() {
    this.$emit('change', false);
  }

  validate() {
    let valid = true;
    if (!/^[^ ]\S{0,50}/.test(this.name)) {
      this.$set(this.error, 'name', true);
      valid = false;
    } else {
      this.$set(this.error, 'name', false);
    }
    if (this.setType === 0) {
      if ((!this.staffs || !this.staffs.length) && !this.isExternalUser) {
        console.log(this.isExternalUser);
        this.$set(this.error, 'staffs', true);
        this.$set(this.error, 'isExternalUser', true);
        this.$set(this.error, 'roles', false);
        valid = false;
      } else {
        this.$set(this.error, 'staffs', false);
        this.$set(this.error, 'isExternalUser', false);
        this.$set(this.error, 'roles', false);
      }
    } else {
      if (!this.roles || !this.roles.length) {
        this.$set(this.error, 'roles', true);
        this.$set(this.error, 'staffs', false);
        this.$set(this.error, 'isExternalUser', false);
        valid = false;
      } else {
        this.$set(this.error, 'roles', false);
        this.$set(this.error, 'staffs', false);
        this.$set(this.error, 'isExternalUser', false);
      }
    }
    return valid;
  }

  submit() {
    if (!this.validate()) {
      return;
    }

    const params: any = {
      appCode: this.$route.params.appCode || this.appInfo.code,
      name: this.name,
      externalUser: this.isExternalUser,
    };

    if (this.setType === 0) {
      if (this.staffs && this.staffs.length) {
        params.departments = JSON.stringify(
          this.staffs.map((s: any) => ({
            id: s.id,
            name: s.name,
            unitType: s.unitType,
          })),
        );
      }
    } else {
      if (this.roles && this.roles.length) {
        params.roles = JSON.stringify(
          this.roles.map((r: any) => ({
            id: r.id,
            name: r.name,
            code: r.code,
            groupId: r.groupId,
            groupName: r.groupName,
          })),
        );
      }
    }

    if (this.groupId) {
      params.id = this.groupId;
      // 编辑是合并权限组数据，否则提交会导致权限丢失
      if (this.groupId === this.orData.id) {
        params.dataPermissionGroups = this.orData.dataPermissionGroups;
      }
    } else {
      params.id = '';
    }
    if (this.modifyGroupOpen) {
      this.modifyGroupOpen = false;
      setTimeout(() => {
        this.modifyGroupOpen = true;
      }, 2000);
      this.modifyGroup(params);
    }
  }

  async modifyGroup(params: any) {
    const res: any = await permissionApi.updateGroup(params);
    if (res.errcode === 0) {
      this.$emit('modifyDone');
      setTimeout(() => {
        this.modifyGroupOpen = true;
        this.$message.success(this.title + '成功');
      }, 500);
      return res.data;
    } else {
      setTimeout(() => {
        this.modifyGroupOpen = true;
      }, 500);
      this.$message.error(res.errmsg);
      return null;
    }
  }

  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang() {
    this.staffSelectorOpts.placeholder = this.$t(
      'Languages.Apps.PlzSetOrgOrUser',
    ) as string;
  }

  /**
   * 选中角色
   */
  selectRole(role: any, evt: Event) {
    this.roles = role;
  }

  setColumns() {
    this.columns = [
      {
        title: this.$t('languages.appSettings.function') as any,
        width: 240,
        fixed: 'left',
        dataIndex: 'name',
      },
      {
        title: this.$t('languages.appSettings.visible') as any,
        width: 90,
        dataIndex: 'visible',
        scopedSlots: { customRender: 'visible' },
      },
      {
        title: this.$t('languages.appSettings.dataPermission') as any,
        width: 520,
        dataIndex: 'dataPermissionType',
        scopedSlots: { customRender: 'dataPermissionType' },
      },
      {
        width: 520,
        title: this.$t('languages.appSettings.permissionAction') as any,
        dataIndex: 'actionPermission',
        scopedSlots: { customRender: 'actionPermission' },
      },
    ];
  }

  setTypeChange(type: any) {
    if (type === 0) {
      this.$set(this.visibleType, 'staffs', true);
      this.$set(this.visibleType, 'isExternalUser', true);
      this.$set(this.visibleType, 'roles', false);
      this.$set(this.visibleType, 'rolesRange', false);
    } else {
      this.$set(this.visibleType, 'staffs', false);
      this.$set(this.visibleType, 'isExternalUser', false);
      this.$set(this.visibleType, 'roles', true);
      this.$set(this.visibleType, 'rolesRange', true);
      this.isExternalUser = false;
    }
  }
}
</script>

<style lang="less" scoped>
._item-list {
  display: flex;
  flex-direction: column;
  p {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
}
.permission-group-modal {
  /deep/.ant-table-body {
    color: #111218;
  }
  /deep/.ant-radio-group {
    span {
      color: #111218;
    }
  }

  .ant-drawer-btn {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 52px;
    line-height: 52px;
    text-align: center;
    border-top: 1px solid #e8e8e8;
    background-color: #fff;
    .cancel-btn {
      margin-right: 16px;
    }
  }
  h4 {
    font-weight: 600;
    color: #000;
    margin-bottom: 16px;
    margin-top: 24px;

    &:first-child {
      margin-top: 0;
    }
  }

  a {
    color: @primary-color;
    font-size: 14px;
  }
  /deep/.ant-row-flex {
    margin: 20px 0;
    align-items: flex-start;
  }

  .ant-col-4 {
    display: flex;
    align-items: center;
    height: 32px;
    color: rgba(17, 18, 24, 0.5);
  }
  .ant-col-20.checkbox {
    line-height: 32px;
  }
  .setting-groups {
    display: flex;
  }
  .error {
    /deep/.ant-select-selection,
    /deep/.h3-organization__label {
      border: 1px solid #f5222d;
    }

    & > .message {
      color: #f5222d;
      font-size: 12px;
    }
  }
}
.panel-content + .panel-content {
  margin-top: 16px;
}
.permission-group-panel-wrapper {
  margin: 0 14px 0 16px;
  border-top: 1px solid #e8e8e8;
  .permission-group-panel-item {
    margin: 16px 0;
    .item-title {
      font-weight: 600;
      display: flex;
      flex-direction: row;
      flex-wrap: no-wrap;
      justify-content: space-between;
      align-items: center;
    }
  }
}
.panel-content
  .permission-group-panel-wrapper:last-of-type
  .permission-group-panel-item:last-of-type {
  margin-bottom: 0;
}
.permission-group-panel-wrapper:first-of-type {
  border-top: none;
}
.item-list {
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  justify-content: flex-start;
  align-items: center;
  color: rgba(17, 18, 24, 0.5);
  span.form_data_title {
    min-width: 8em;
    align-self: flex-start;
    justify-self: flex-start;
    line-height: 44px;
  }
  ul {
    margin-left: 16px;
    display: flex;
    flex-direction: row;
    flex-wrap: no-wrap;
    justify-content: flex-start;
    align-items: center;
    font-size: 12px;
    li {
      border: 1px solid #ffffff;
      margin-right: 8px;
      padding: 1px 7px;
      cursor: pointer;
    }
    li.active {
      border: 1px solid @primary-color;
      color: @primary-color;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      -ms-border-radius: 4px;
      border-radius: 4px;
    }
  }
}
/deep/.h3-panel-header > span {
  font-weight: 600;
}
/deep/.item-title .ant-checkbox + span {
  padding-right: 0;
  color: #111218;
}
</style>

<style lang="less">
// 修改新增权限组 select 框之间的对齐问题，在scope不生效
.permission-group-modal {
  .ant-select-allow-clear
    .ant-select-selection--multiple
    .ant-select-selection__rendered {
    margin-right: 11px !important;
  }

  .ant-select-selection--multiple .ant-select-selection__rendered {
    margin-left: 11px !important;
  }
}

// 表格每个 tr 的第一个 td样式
.permission-group-modal table tr td:nth-of-type(1) {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ant-select-tree-dropdown {
  max-height: 60vh !important;
}
.ant-select-tree li span.ant-select-tree-checkbox {
  display: none;
}
.ant-select-tree
  li
  span.ant-select-tree-checkbox
  + .ant-select-tree-node-content-wrapper {
  width: calc(100% - 24px);
}
.ant-select-tree
  > .ant-select-tree-treenode-checkbox-checked
  > .ant-select-tree-node-content-wrapper,
.ant-select-tree-child-tree
  .ant-select-tree-treenode-checkbox-checked
  .ant-select-tree-node-content-wrapper {
  background-color: #fafafa !important;
  font-weight: bold;
}
.ant-select-tree
  > .ant-select-tree-treenode-checkbox-checked
  > .ant-select-tree-node-content-wrapper::after,
.ant-select-tree-child-tree
  .ant-select-tree-treenode-checkbox-checked
  .ant-select-tree-node-content-wrapper::after {
  content: '\E98F';
  color: @primary-color;
  position: absolute;
  right: 8px;
  display: inline-block;
  font-family: 'aufontAll' !important;
  font-weight: bold;
}
.ant-select-tree-node-content-wrapper {
  background-color: #ffffff !important;
}
.ant-select-tree-node-content-wrapper:after {
  content: '';
}
</style>

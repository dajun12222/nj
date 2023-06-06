<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="showModal"
    :title="modalTitle"
    :width="506"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    :keyboard="false"
    @ok="submit"
    @cancel="cancel"
  >
    <a-form
      class="add-role"
      :autoFormCreate="
        (theForm) => {
          form = theForm;
        }
      "
    >
      <a-form-item
        label="角色组"
        fieldDecoratorId="roleGroup"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.roleGroup"
      >
        <a-tree-select
          style="width: 100%"
          :treeData="sysTreeData"
          showSearch
          allowClear
          treeNodeFilterProp="title"
          :disabled="!isEdit || isCreated"
          :dropdownStyle="{'maxHeight': '350px', 'overflow': 'auto' }"
          :placeholder="$t('languages.PlaceHolder.Select')"
          @change="handleOnChange"
        />
      </a-form-item>

      <a-form-item
        label="角色编码"
        fieldDecoratorId="roleCode"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.roleCode"
      >
        <a-input
          class="role__name"
          :class="codeErr ? 'has-err' : ''"
	:disabled="!isEdit"
          maxlength="28"
          placeholder="请输入编码，未填写系统将自动生成"
          @focus="codeFocus"
        />
        <div v-show="codeErr" class="err_msg">角色编码已存在</div>
      </a-form-item>

      <a-form-item
        label="角色名称"
        fieldDecoratorId="roleName"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.roleName"
      >
        <a-input
          class="role__name"
          :class="nameErr ? 'has-err' : ''"
          maxlength="50"
          placeholder="请输入名称"
          @focus="nameFocus"
        />
        <div v-show="nameErr" class="err_msg">角色名称已存在</div>
      </a-form-item>
      <a-form-item
        :label="$t('languages.Apps.EditProcess')"
  
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
      >
        <a-radio-group v-model="isEditFlow" name="radioGroup1" :disabled="!isEdit">
          <a-radio :value="true">{{ $t('languages.Apps.Yes') }}</a-radio>
          <a-radio :value="false">{{ $t('languages.Apps.No') }}</a-radio>
        </a-radio-group>
      </a-form-item>
       <a-form-item
        :label="$t('languages.Apps.AssociatedAccountSet')"
  
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
      >
        <a-radio-group v-model="hasAccount" name="radioGroup" :disabled="isEditFlow ? isEditFlow : !isEdit">
          <a-radio :value="true">{{ $t('languages.Apps.Yes') }}</a-radio>
          <a-radio :value="false">{{ $t('languages.Apps.No') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      
    </a-form>
    <div v-if="!isEdit" class="editRole">只能编辑自己创建的角色 </div>
    <template #footer>
      <a-button type="primary" :disabled="!isEdit" @click="submit">确定</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import OrgApi from '@/apis/organization';
import { nameValidator, roleCodeValidator } from '@/common/utils';
import { Form, Input, Modal, TreeSelect,Radio,Button } from '@h3/antd-vue';
import { namespace } from 'vuex-class';
const UserModule = namespace('System/User');
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'add-role',
  components: {
    AModal: Modal,
    AForm: Form,
    AFormItem: Form.Item,
    ATreeSelect: TreeSelect,
    AInput: Input,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    AButton: Button,
  },
})
export default class AddRole extends Vue {
  @Prop() value!: boolean;

  @Prop() roleType!: number; // 0：新增，1：编辑

  @Prop() roleData!: any;

  @Prop() treeData!: any;

  @Prop() roleInfo!: any;

  @UserModule.State('loginedUserInfo') loginedUserInfo!: any;

  sysRoleList: any[] = [];

  dataRef: any = {};

  codeErr: boolean = false;

  nameErr: boolean = false;

  hasAccount:boolean = false;

  isEditFlow:boolean = false;

  @Watch('isEditFlow')
  onChangeIsEditFlow(newVal:boolean){
    if(newVal){
      this.hasAccount = true;
    }
  }

  formItemLayout: any = {
    labelCol: {
      span: 6
    },
    wrapperCol: {
      span: 18
    }
  };
 
  get sysTreeData() {
    if (!this.treeData) {
      return [];
    }
    const res = this.treeData.filter((i) => i.children);
    let data = this.dataRecursion(res);
    return this.changeData(data, {});
  }

  get isEdit(){
    // 编辑状态下 ；非本人或者非超级管理员
    // roleType === 1；超级管理员  this.loginedUserInfo.permissions.includes('SYS_MNG'))； this.loginedUserInfo.id === this.roleData.createdBy
    //是否编辑状态
   
  
    if(this.roleType !== 1 || (this.roleType === 1 && (this.loginedUserInfo.id === this.roleData.createdBy || this.isSysMng()))){
      return true;
    }
    return false;
  }

  isCreated:boolean = false;

  isSysMng(){
    let status = false;
    let att = ["SYS_MNG","APP_MNG"];
    let res = this.loginedUserInfo.permissions.filter((item) => {
      return att.indexOf(item) > -1;
    })
    if(att && att.length > 0){
      status = true;
    } 
    
    return status;
  }

  codeFocus() {
    this.codeErr = false;
  }

  nameFocus() {
    this.nameErr = false;
  }

  handleOnChange(value: any, label: any, extra: any) {
    if (extra.triggerNode) {
      this.dataRef = extra.triggerNode.dataRef;
      console.log(this.dataRef, 'dataRef======>');
    }
  }

  changeData(data: any, nodes: any) {
    // let result: any = [];
    // data.forEach((node: any) => {
    //   let obj: any = {
    //     id: node.id,
    //     value: node.id,
    //     name: node.name,
    //     title: `${node.name}`,
    //     isLeaf: node.children && node.children.length ? false : true,
    //     key: node.id,
    //     code: node.code,
    //     groupId: node.groupId,
    //     corpName: node.corpName,
    //     parentId: nodes.id,
    //     roleType: node.roleType,
    //     corpId: node.corpId,
    //     children: null,
    //   };
    //   if (node.children && node.children.length) {
    //     obj.children = this.changeData(node.children, node);
    //   }
    //   if(obj.name!=='默认'){ //隐藏默认角色组
    //     result.push(obj);
    //   }
    // });

    data.forEach((node: any) => {
      if (node.children && node.children.length) {
        node.children = this.changeData(node.children, {});
      }
    });
    return data.filter((el) => el.name !== '默认');
  }

  dataRecursion(list: any) {
    const arr: any = [];
    list.map((i: any) => {
      if (i.children && i.children.length) {
        i.selectable = i.corpId ? true : false;
        i.children = this.dataRecursion(i.children);
      } else {
        i.isLeaf = true;
        delete i.children;
      }
      if (i.name !== '默认分组') {
        arr.push(i);
      }
    });
    return arr;
  }

  showModal: boolean = false;

  modalTitle: string = '新建角色';

  params: any = {
    roleName: '',
    roleGroup: '',
  };

  form: any = {};

 

  rules: any = {};

  beforeMount() {
    this.setRules();
  }

  setRules() {
    this.rules = {
      roleName: {
        rules: [
          {
            required: true,
            message: '名称不能为空',
          },
          {
            validator: nameValidator,
            message: this.$t('languages.Apps.AppNameRule'),
            // 仅限50个字符以内，并不能以空格开头
          },
        ],
      },
      roleCode: {
        rules: [
          {
            validator: roleCodeValidator,
            message: this.$t('languages.Apps.AppCodeRule'),
          },
        ],
      },
      roleGroup: {
        rules: [
          {
            required: true,
            message: '角色组不能为空',
          },
        ],
      },
    };
  }

  isSubmiting: boolean = false;

  // 新建角色
  submit() {
    const vm = this;
    if (this.isSubmiting) {
      this.$message.warning('已提交，请等待接口返回');
      return;
    }
    this.isSubmiting = true;

    this.form.validateFields((err: any) => {
      if (!err) {
        const roleName = this.form.getFieldValue('roleName');
        const roleCode = this.form.getFieldValue('roleCode');
        const roleGroup = this.form.getFieldValue('roleGroup');
        if (this.roleType === 1) {
          console.log(this.roleData, 'this.roleData');

          // 更新角色
          const changeRoleGroupId = this.dataRef.id;
          const params = {
            roleName,
            corpId: this.dataRef.corpId,
            roleId: this.roleData ? this.roleData.id : '',
            code: this.roleData ? this.roleData.code : '',
            roleGroupId: changeRoleGroupId
              ? changeRoleGroupId
              : this.roleData
              ? this.roleData.groupId
              : '',
	    hasAccount: this.hasAccount,
            isEditFlow: this.isEditFlow,
          };

          OrgApi.updateRole(params).then((res: any) => {
            if (res.errcode) {
              this.isSubmiting = false;
              // this.$message.error(res.errmsg);
              switch (res.errcode) {
                case 202002:
                  vm.codeErr = true;
                  break;
                case 202000:
                  vm.nameErr = true;
                  break;
                default:
                  break;
              }
              return;
            }
            this.$message.success('修改成功！');
            this.$emit('reloadTree');
            this.$emit('nameChange', params);
            this.cancel();
            this.isSubmiting = false;
          });
        } else {
          if (roleName === '部门主管') {
            this.$message.warning('角色名称不能为部门主管！');
            this.isSubmiting = false;
            return;
          }
          // 新建角色
          const params = {
            roleName,
            corpId: this.dataRef.corpId,
            code: roleCode,
            roleGroupId: roleGroup,
            hasAccount: this.hasAccount,
            isEditFlow: this.isEditFlow,
          };
          OrgApi.addRole(params).then((res: any) => {
            if (res.errcode) {
              // this.$message.error(res.errmsg);
              switch (res.errcode) {
                case 202002:
                  vm.codeErr = true;
                  break;
                case 202000:
                  vm.nameErr = true;
                  break;
                default:
                  break;
              }
              this.isSubmiting = false;
              return;
            }
            this.$message.success('创建成功！');
            this.$emit('reloadTree');
            this.cancel();
            this.isSubmiting = false;
          });
        }
      } else {
        this.isSubmiting = false;
      }
    });
  }
  
  regExpString(str){
    let  p = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
    if(p.test(str)){
      return true;
    }else{
      return false;
    }
  }

  cancel() {
    this.form.resetFields();
    this.$emit('input', false);
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.showModal = v;
    this.isCreated = false;
    if (!v) {
      return;
    }
    if (this.roleType === 1) {
      this.modalTitle = '修改角色';
      this.$nextTick(() => {
       
        this.hasAccount = this.roleData.remarks === 'ACCOUNT' ? true : false;
        this.isEditFlow = this.roleData.isEditFlow ? this.roleData.isEditFlow : false;

        if (this.form.setFieldsValue) {
         
          let newName = this.roleData.name.replace(/⭐/gi,'');
          this.form.setFieldsValue({
            roleName: newName,
            roleCode: this.roleData.code,
            roleGroup: this.roleData.groupId,
          });
        }
      });
    } else {
      this.modalTitle = '新建角色';
      this.$nextTick(() => {
        if (this.roleInfo) {
          this.dataRef = this.roleInfo;
          this.isCreated = true;
          this.form.setFieldsValue({
            roleGroup: this.roleInfo.id,
          });
        }
      });
    }
  }
}
</script>

<style lang="less" scoped>
.add-role {
  padding-bottom: 22px;
  /deep/.ant-form-item-label {
    text-align: left;
    padding-left: 33px;
    width: 124px;
  }
  /deep/.ant-form-item-control-wrapper {
    width: 255px;
  }
  /deep/.ant-form-item-required::before {
    left: -10px;
    top: -3px;
  }
  /deep/.ant-form-item-label > label::after {
    content: '';
  }
  .has-err {
    border-color: #f4454e;
  }
  .err_msg {
    font-size: 12px;
    color: #f4454e;
    line-height: 1.5;
    margin-bottom: -1px;
    margin-top: 1px;
    min-height: 22px;
    clear: both;
    transition: color 0.3s cubicbezier(0.215, 0.61, 0.355, 1);
  }
}
.editRole {
  text-align: right;
  color: #f00;
  font-size: 12px;
}
</style>

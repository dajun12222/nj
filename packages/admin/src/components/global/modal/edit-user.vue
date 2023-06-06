<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="showEditUser"
    :title="$t('languages.Password.ChangePwd')"
    :width="422"
    :cancelText="$t('languages.Cancel')"
    :okText="$t('languages.Ok')"
    :maskClosable="false"
    @ok="editUser"
    @cancel="closeModel"
  >
    <a-form
      :autoFormCreate="
        (theForm) => {
          form = theForm;
        }
      "
      class="user-form"
    >
      <a-form-item
        :label="$t('languages.Password.OldPwd')"
        :class="{ 'err-form': oldPwdError }"
        fieldDecoratorId="oldPassword"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.pwd"
      >
        <a-input
          :placeholder="$t('languages.Password.PleaseInputOldPwd')"
          maxLength="50"
          :class="{ 'err-input': oldPwdError }"
          type="password"
        />
        <div v-if="oldPwdError" class="error-tip">
          {{ $t('languages.Password.OldPwdError') }}
        </div>
      </a-form-item>
      <a-form-item
        :label="$t('languages.Password.ChangePwd')"
        fieldDecoratorId="password"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.pwd"
      >
        <a-input
          :placeholder="$t('languages.Password.PleaseInputNewPwd')"
          maxLength="50"
          type="password"
        />
      </a-form-item>
      <a-form-item
        :label="$t('languages.Password.SurePwd')"
        fieldDecoratorId="surePwd"
        :class="{ 'err-form': showError }"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.pwd"
      >
        <a-input
          :placeholder="$t('languages.Password.InputNewPwdAgain')"
          maxLength="50"
          :class="{ 'err-input': showError }"
          type="password"
        />
        <div v-if="showError" class="error-tip">
          {{ $t('languages.Password.SurePwdError') }}
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as OrganizationApi from '@/apis/organization';
import { Form, Input, Modal } from '@h3/antd-vue';

@Component({
  name: 'eidt-user',
  components: {
    AModal: Modal,
    AForm: Form,
    AFormItem: Form.Item,
    AInput: Input,
  },
})
export default class EditUser extends Vue {
  @Prop() value!: boolean;

  form: any = {};

  showEditUser: boolean = false;

  oldPwdError: boolean = false;

  showError: boolean = false;

  formItemLayout: any = {
    labelCol: {
      span: 5,
    },
    wrapperCol: {
      span: 19,
    },
  };

  rules: any = {};

  beforeMount() {
    this.setRules();
  }

  setRules() {
    this.rules = {
      pwd: {
        rules: [
          {
            required: true,
            message: `${this.$t('languages.Password.PwdIsNullTip')}`,
          },
        ],
      },
    };
  }

  editUser() {
    const vm: any = this;
    vm.form.validateFields((err: any) => {
      if (!err) {
        const formData = vm.form.getFieldsValue();
        if (formData.password === formData.surePwd) {
          this.showError = false;
          const params = {
            username: 'admin',
            oldPassword: formData.oldPassword,
            newPassword: formData.password,
          };
          OrganizationApi.modifyPassword(params).then((res) => {
            if (res.errcode === 0) {
              this.oldPwdError = false;
              this.$message.success(
                `${this.$t('languages.Password.ChangePwdSuccess')}`,
              );
              this.closeModel();
            } else if (res.errcode === 201019) {
              this.oldPwdError = true;
            } else if (res.errcode === 201020) {
              this.$message.error(
                `${this.$t('languages.Password.CanNotSamePwd')}`,
              );
            } else {
              //Else Empty block statement
            }
          });
        } else {
          this.showError = true;
        }
      }
    });
  }

  closeModel() {
    this.$emit('input', false);
    this.form.resetFields();
    this.showError = false;
    this.oldPwdError = false;
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.showEditUser = v;
  }
}
</script>
<style lang="less" scoped>
.err-form {
  .error-tip {
    color: #f4454e;
    font-size: 12px;
    margin-top: 2px;
  }
  .err-input {
    border-color: #f4454e;
    &:focus {
      border-color: #ff7073;
      outline: 0;
      box-shadow: 0 0 0 2px rgba(244, 69, 78, 0.2);
      border-right-width: 1px !important;
    }
    &:hover {
      border-color: #f4454e;
    }
  }
  /deep/.ant-form-explain {
    display: none;
  }
}
</style>

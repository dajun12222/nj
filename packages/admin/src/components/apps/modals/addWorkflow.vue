<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="showModal"
    class="form-modal-customize"
    :title="title"
    :width="552"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
    @ok="formConfirm"
  >
    <a-form
      :autoFormCreate="
        (theForm) => {
          form = theForm;
        }
      "
      @submit="handleSubmit"
    >
      <a-form-item
        :label="$t('languages.Apps.WorkflowCode')"
        fieldDecoratorId="workflowCode"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.workflowCode"
      >
        <a-input
          v-model="formData.workflowCode"
          maxlength="50"
          :disabled="isEdit"
          :placeholder="$t('languages.Apps.WorkflowCodePlaceholder')"
        />
      </a-form-item>

      <a-form-item
        :label="$t('languages.Apps.WorkflowName')"
        fieldDecoratorId="workflowName"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.workflowName"
      >
        <a-input
          v-model="formData.workflowName"
          maxlength="50"
          :placeholder="$t('languages.Apps.WorkflowNamePlaceholder')"
        />
      </a-form-item>

      <a-form-item
        class="selected-icon-customize"
        :label="$t('languages.Apps.Icon')"
        fieldDecoratorId="icon"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
      >
        <selected-icon @input="changeIcon" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { nameValidator, pattern } from '@/common/utils';
import selectedIcon from '@/components/global/select-icon/index.vue';
import { Modal, Form, Input } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const AppItemModule = namespace('Apps/AppItem');

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'AddWorkflowModal',
  components: {
    selectedIcon,
    AModal: Modal,
    AInput: Input,
    AForm: Form,
    AFormItem: Form.Item,
  },
})
export default class AddWorkflowModal extends Vue {
  @AppItemModule.Action('createWorkflow') createWorkflow: any;

  @AppItemModule.Action('updateWorkflow') updateWorkflow: any;

  @WorkflowModule.State('workflowMenus') workflows: any;

  @WorkflowModule.Action('getWorkflowList') getWorkflowList: any;

  // data
  showModal: boolean = false;

  rules: any = {};

  form: any = {};

  formData: Apps.Workflow.CreateWorkflowParams = {
    schemaCode: '',
    workflowCode: '',
    workflowName: '',
    icon: '',
  };

  formItemLayout: Common.FormItemLayout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 16,
    },
  };

  isEdit: boolean = false;

  codeError: any = null;

  existCodes: Array<string> = [];

  // props
  @Prop() value!: boolean;

  @Prop() data!: any;

  @Prop() schemaCode!: any;

  beforeMount() {
    this.setRules();
  }

  get title() {
    return this.isEdit
      ? this.$t('languages.Apps.EditWorkflow')
      : this.$t('languages.Apps.AddWorkflow');
  }

  changeIcon(icon: any) {
    this.form.setFieldsValue({
      icon,
    });
  }

  // Methods
  setRules() {
    this.rules = {
      workflowName: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.RequiredWorkflowName'),
          },
          {
            validator: nameValidator,
            message: this.$t('languages.Apps.AppNameRule'),
            // 仅限50个字符以内，并不能以空格开头
          },
        ],
      },
      workflowCode: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.RequiredWorkflowCode'),
          },
          {
            pattern: pattern('code'),
            message: this.$t('languages.Apps.AppCodeRule'),
          },
          {
            validator: (rule: any, value: string, callback: Function) => {
              if (value && this.existCodes.includes(value)) {
                callback(this.codeError);
              }
              callback();
            },
          },
        ],
      },
    };
  }

  // 新建流程
  handleCreateWorkflow() {
    this.formData.schemaCode = this.schemaCode;
    this.createWorkflow(this.formData).then(async (res: Common.Data) => {
      if (res.errcode === 0) {
        // 添加完成
        this.$emit('confirm', this.formData);
        this.closeModal();
        this.resetForm();
        await this.getWorkflowList({ schemaCode: this.schemaCode });
        console.log(this.workflows, 'workflows');
      } else if (res.errcode === 999999) {
        this.$message.error('接口异常！');
      } else {
        // 创建失败
        this.codeError = res.errmsg;
        this.existCodes.push(this.formData.workflowCode);
        this.$nextTick(() => {
          this.form.setFieldsValue({
            workflowCode: this.formData.workflowCode,
          });
          this.form.validateFields();
        });
      }
    });
  }

  // 更新流程
  handleUpdateWorkflow(data: any) {
    this.formData.schemaCode = this.schemaCode;
    this.formData.id = this.data.id;
    this.formData.workflowCode = this.data.workflowCode;
    this.formData.workflowName = data.workflowName;
    this.formData.icon = data.icon;
    this.updateWorkflow(this.formData).then((res: any) => {
      if (res.errcode === 0) {
        // 更新完成
        this.$emit('confirm', this.formData);
        this.closeModal();
        this.resetForm();
      }
    });
  }

  handleSubmit() {
    this.form.validateFields((err: any, values: any) => {
      if (!err) {
        if (!this.isEdit) {
          // 默认图标无法拿到固赋值
          this.formData.icon = values.icon;
          this.handleCreateWorkflow();
        } else {
          this.handleUpdateWorkflow(values);
        }
      }
    });
  }

  resetForm() {
    this.form.resetFields();
    this.formData = {
      schemaCode: '',
      workflowName: '',
      workflowCode: '',
      icon: '',
    };
  }

  closeModal() {
    this.resetForm();
    this.codeError = null;
    this.existCodes = [];
    this.$emit('cancel');
  }

  formConfirm() {
    this.handleSubmit();
  }

  // Watch
  @Watch('value')
  onValueChange(val: boolean) {
    this.showModal = val;
    this.$nextTick(() => {
      if (val && this.form.setFieldsValue) {
        this.form.setFieldsValue({
          icon: 'h-icon-all-logic',
        });
      }
    });
  }

  @Watch('schemaCode')
  OnSchemaCodeChange(val: string) {
    this.schemaCode = val;
  }

  @Watch('data', { deep: true })
  onDataChange(val: any) {
    this.$nextTick(() => {
      if (val.id && this.form.setFieldsValue) {
        this.form.setFieldsValue({
          workflowName: val.workflowName,
          workflowCode: val.workflowCode,
          icon: val.icon,
        });
        this.formData.icon = val.icon;
        this.isEdit = true;
        // Object.keys(val).forEach((item:string) => {
        //   this.formData[item] = val[item];
        // });
      } else {
        this.isEdit = false;
      }
    });
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setRules();
  }
}
</script>

<style lang="less">
.form-modal-customize {
  .ant-row.ant-form-item {
    margin-bottom: 10px !important;
  }
  .selected-icon-customize {
    margin-top: 13px !important;
  }
}
</style>

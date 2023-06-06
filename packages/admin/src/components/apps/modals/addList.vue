<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="showModal"
    class="view-modal-customize"
    :title="$t('languages.Apps.AddList')"
    :width="446"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    :keyboard="false"
    :zIndex="1000"
    @cancel="closeModal"
  >
    <a-form
      :autoFormCreate="
        (theForm) => {
          form = theForm;
        }
      "
      @submit="handleSubmit"
    >
      <!-- 甘特图入口 -->
      <div v-if="isGanttOpen()" class="view-tips">
        列表视图默认只在PC端展示，可在“切换视图”下拉框内更改，移动端仅支持一个视图；甘特图视图只能创建1个，不支持移动端
      </div>
      <div v-else class="view-tips">
        新增的视图默认只在PC端展示，可前往“切换视图”下拉框内更改移动端仅支持一种视图
      </div>
      <a-form-item
        :label="$t('languages.Apps.ListCode')"
        fieldDecoratorId="code"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.code"
      >
        <a-input
          v-model="formData.code"
          :maxLength="maxLengthCode"
          class="input-text"
          :disabled="isEdit"
          :placeholder="$t('languages.Apps.ListCodePlaceholder')"
          @change="codeError = null"
        />
      </a-form-item>

      <a-form-item
        :label="$t('languages.Apps.ListName')"
        fieldDecoratorId="name"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.name"
      >
        <a-input
          v-model="formData.name"
          :maxLength="maxLength"
          class="input-text"
          :placeholder="$t('languages.Apps.ListNamePlaceholder')"
          @change="codeError = null"
        />
        <i18n-icon />
      </a-form-item>

      <a-form-item
        class="selected-view-type"
        :label="$t('languages.Apps.ViewType')"
        fieldDecoratorId="queryPresentationType"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
      >
        <div
          v-for="type in presentationType"
          :key="type.code"
          class="view-type"
          :class="{
            disabled: type.disabled,
            list: type.code === 'LIST',
            gantt: type.code === 'GANTT',
          }"
          @click="chooseType(type.code)"
        >
          <img :src="type.disabled ? type.disableUrl : type.url" />
          <p>{{ type.text }}</p>
        </div>
      </a-form-item>
    </a-form>

    <template slot="footer">
      <a-button @click="closeModal"> 取消 </a-button>
      <a-button type="primary" :disabled="creating" @click="formConfirm">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { Vue, Prop, Watch, Component } from 'vue-property-decorator';
import { pattern, nameValidator } from '@/common/utils';
import I18nIcon from '@/components/global/i18n-icon.vue';
import * as ListApi from '@/apis/list/list.api';
import { Checkbox, Modal, Button, Input, Form } from '@h3/antd-vue';
import { namespace } from 'vuex-class';
import { viewRegister } from 'cloudpivot/list/utils/register';

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'AddListModal',
  components: {
    I18nIcon,
    ACheckbox: Checkbox,
    AModal: Modal,
    AForm: Form,
    AFormItem: Form.Item,
    AButton: Button,
    AInput: Input,
  },
})
export default class AddListModal extends Vue {
  // data
  @Prop() schemaCode!: string;

  @ListdesignModule.Mutation('codeChange') codeChange: any;

  isEdit: boolean = false;

  showModal: boolean = false;

  maxLength: number = 50;

  maxLengthCode: number = 28;

  rules: any = {};

  form: any = {};

  presentationType: any[] = [];

  // 暂无接口 数据类型未知
  formData: any = {
    name: '',
    code: '',
    queryPresentationType: 'LIST',
  };

  formItemLayout: Common.FormItemLayout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 20,
    },
  };

  // props
  @Prop() value!: boolean;

  @Prop() data!: any;

  @Prop() hasGantt!: boolean;

  beforeMount() {
    this.setRules();
    this.initPresentationType();
  }

  // Methods
  setRules() {
    this.rules = {
      name: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.RequiredListName'),
          },
          {
            validator: nameValidator,
            message: this.$t('languages.Apps.AppNameRule'),
            // 仅限50个字符以内，并不能以空格开头
          },
          {
            validator: (rule: any, value: string, callback: Function) => {
              if (value && this.codeError) {
                callback(this.codeError);
              }
              callback();
            },
          },
        ],
      },
      code: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.RequiredListCode'),
          },
          {
            pattern: pattern('code'),
            message: this.$t('languages.Apps.AppCodeRule'),
          },
          {
            validator: (rule: any, value: string, callback: Function) => {
              if (value && this.codeError) {
                callback(this.codeError);
              }
              callback();
            },
          },
        ],
      },
    };
  }

  codeError: any = null;

  creating: boolean = false;

  handleSubmit() {
    if (this.creating) {
      return;
    }
    this.creating = true;
    this.form.validateFields((err: any) => {
      if (!err) {
        this.formData.schemaCode = this.schemaCode;
        const form = Object.assign({}, this.formData);
        form.sheetType = Number(form.sheetType);
        const hideLoader = (this.$message as any).loading();
        console.log(form, 'form');
        const promise = this.isEdit
          ? ListApi.updateHeader(form)
          : ListApi.create(form);
        promise.then((res: any) => {
          if (res.errcode > 0) {
            // 创建失败
            this.codeError = res.errmsg;
            // this.existCodes.push(this.formData.workflowCode);
            this.$nextTick(() => {
              this.form.setFieldsValue({
                code: this.formData.code,
              });
              this.form.validateFields();
            });
          } else {
            this.codeChange(this.formData.code);
            this.codeError = null;
            promise
              .then((result: any) => {
                hideLoader();
                this.$emit('confirm', this.formData);
                this.closeModal();
                this.resetForm();
                this.$message.success(
                  this.$t('languages.SaveSuccess').toString(),
                );
              })
              .finally(() => hideLoader());
          }
          this.creating = false;
        });
      } else {
        this.creating = false;
      }
    });
  }

  resetForm() {
    this.form.resetFields();
    this.formData = {
      name: '',
      code: '',
      queryPresentationType: 'LIST',
    };
    this.initPresentationType();
  }

  closeModal() {
    this.resetForm();
    this.$emit('cancel');
  }

  formConfirm() {
    this.handleSubmit();
  }

  // Watch
  @Watch('value')
  onValueChange(val: boolean) {
    this.showModal = val;
  }

  @Watch('data', { deep: true })
  onDataChange(val: any) {
    this.$nextTick(() => {
      if (val.id && this.form.setFieldsValue) {
        this.form.setFieldsValue({
          name: val.name,
          code: val.code,
          queryPresentationType: val.queryPresentationType,
        });
        Object.keys(val).forEach((item) => {
          this.formData[item] = val[item];
        });
        this.isEdit = true;
      } else {
        this.isEdit = false;
      }
    });
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setRules();
  }

  chooseType(code) {
    let temp = code;
    if (code === 'GANTT' && this.hasGantt) {
      temp = 'LIST';
      this.$message.warning('甘特图视图只能创建一个！');
    }
    this.presentationType.forEach((item) => {
      if (item.code === temp) {
        this.formData.queryPresentationType = temp;
        item.disabled = false;
      } else {
        item.disabled = true;
      }
    });
  }

  /**
   * 判断是否配置甘特图
   */
  isGanttOpen() {
    return (
      viewRegister.getEnableViews() &&
      viewRegister.getEnableViews().includes('Gantt')
    );
  }

  //初始化可选视图类型列表
  initPresentationType() {
    this.presentationType = [
      {
        code: 'LIST',
        text: '列表',
        url: require('@/assets/images/list-active.png'),
        disabled: false,
        disableUrl: require('@/assets/images/list-normal.png'),
      },
      // {
      //   code: 'BOARD',
      //   text: '看板(暂未开放)',
      //   url: require('@/assets/images/board.png')
      // },
      // {
      //   code: 'CALENDAR',
      //   text: '日历(暂未开放)',
      //   url: require('@/assets/images/calendar.png')
      // }
    ];
    //甘特图入口
    if (this.isGanttOpen()) {
      this.presentationType.push({
        code: 'GANTT',
        text: '甘特图',
        url: require('@/assets/images/gantt-active.png'),
        disabled: true,
        disableUrl: require('@/assets/images/gantt-normal.png'),
      });
    }
  }
}
</script>

<style lang="less">
@import '~@/styles/color/colors.less';
.ant-message {
  z-index: 1040;
}
.view-modal-customize {
  .list::before {
    content: unset;
  }
  .ant-row.ant-form-item {
    margin-bottom: 20px !important;
  }
  .view-tips {
    font-size: 12px;
    color: rgba(17, 18, 24, 0.5);
    width: 100%;
    padding-right: 25px;
    margin-bottom: 10px;
  }
  .input-text {
    width: 307px;
  }
  .ant-col-4 {
    width: 64px;
    margin-right: 7px;
  }
  .ant-col-20 {
    width: 332px;
  }
  .selected-view-type {
    margin-top: 13px !important;
    .view-type {
      width: 100px;
      height: 124px;
      background: @sub-bg-color;
      border-radius: 4px;
      text-align: center;
      float: left;
      color: #111218;
      border: 1px solid @primary-color;
      cursor: pointer;
      position: relative;
      &:not(:last-child) {
        margin-right: 16px;
      }
      img {
        width: 70px;
        margin: 24px 15px 21px 15px;
      }
      p {
        font-size: 10px;
        position: absolute;
        bottom: -2px;
        left: 33px;
        line-height: 40px;
      }
    }
    .disabled {
      color: rgba(17, 18, 24, 0.5);
      background: rgba(191, 191, 191, 0.15);
      border: 1px solid rgba(191, 191, 191, 0.15);
    }
    .gantt {
      border: unset;
      img {
        margin: unset !important;
        width: 100px !important;
      }
    }
  }

  .visible-in-PC {
    .ant-form-item-children {
      padding-left: 5px;
      line-height: 32px;
    }
  }
}
</style>

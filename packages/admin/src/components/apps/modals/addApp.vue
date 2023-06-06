<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="showModal"
    :title="isEdit ? $t('languages.Apps.EditApp') : $t('languages.Apps.AddApp')"
    :width="420"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :keyboard="false"
    wrapClassName="new-modal-style"
    @ok="submitAddApp"
    @cancel="closeAddModal"
  >
    <a-form class="add-app__wrap" :autoFormCreate="formCreate" hideRequiredMark>
      <!-- 应用名称 -->
      <a-form-item
        fieldDecoratorId="name"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.name"
        :colon="false"
      >
        <span slot="label">
          {{ $t('languages.Apps.AppName') }}
          <em>*</em>
          <i18n-icon />
        </span>
        <a-input
          v-model="params.name"
          class="add-app__input"
          maxlength="50"
          :disabled="builtInApp"
          :placeholder="$t('languages.PlaceHolder.InputAppName')"
        />
      </a-form-item>

      <!-- 应用编码 -->
      <a-form-item
        fieldDecoratorId="code"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.code"
        :colon="false"
      >
        <span slot="label">
          {{ $t('languages.Apps.AppCode') }}
          <em>*</em>
        </span>
        <a-input
          v-model="params.code"
          class="add-app__input"
          maxlength="28"
          :disabled="isEdit"
          :placeholder="$t('languages.PlaceHolder.InputAppCode')"
        />
      </a-form-item>

      <!-- 默认分组 -->
      <a-form-item
        fieldDecoratorId="groupId"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.groupId"
      >
        <span slot="label">
          {{ $t('languages.Apps.Catalogues') }}
        </span>
        <a-select
          v-model="params.groupId"
          showSearch
          class="add-app__input"
          :getPopupContainer="getPopupContainer"
          :filterOption="filterOption"
        >
          <template v-if="catalogues.length < 10">
            <div slot="dropdownRender" slot-scope="menu">
              <v-nodes :vnodes="menu" />
              <a-divider style="margin: 4px 0" />
              <div
                style="padding: 4px 8px; cursor: pointer"
                @mousedown="(e) => e.preventDefault()"
                @click.stop="addItem"
              >
                <a-icon type="plus" />
                {{ $t('languages.Apps.AddGroup') }}
              </div>
            </div>
          </template>
          <a-select-option
            v-for="(item, key) of catalogues"
            v-show="item.code !== 'all'"
            :key="key"
            :value="item.id"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 是否启用 -->
      <template v-if="isEdit">
        <a-form-item
          fieldDecoratorId="enabled"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
          :colon="false"
        >
          <span slot="label">
            {{ $t('languages.Apps.AppEnabled') }}
          </span>
          <a-switch v-model="params.enabled" size="small" />
        </a-form-item>
      </template>

      <a-form-item
        fieldDecoratorId="logoUrl"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :colon="false"
      >
        <span slot="label">
          {{ $t('languages.Apps.AppIcon') }}
        </span>

        <div class="upload-wrap">
          <a-upload :showUploadList="false" :beforeUpload="beforeUpload">
            <div
              :class="[
                'base-settings__icon',
                { 'base-settings__icon--loading': uploading },
              ]"
            >
              <img v-if="imgUrl" :src="imgUrl" alt="app-icon" />
              <template v-else>
                <svg class="tabs-app-li-icon icon svgIcon" aria-hidden="true">
                  <use xlink:href="#h-icon-all-application1" />
                </svg>
              </template>

              <!-- <i class="icon aufontAll h-icon-all-form-o"></i>
              <i class="icon aufontAll h-icon-all-loading-o"></i> -->
            </div>
          </a-upload>

          <span class="base-settings__text">{{
            $t('languages.appSettings.AppIconUploadTip')
          }}</span>
        </div>
      </a-form-item>
    </a-form>
    <AppGroup
      v-model="showAddModal"
      :groupItem="{}"
      @submitGroupEvent="submitEvent"
    />
  </a-modal>
</template>

<script lang="ts">
import { getRealLength, pattern } from '@/common/utils';
import AppGroup from '@/components/apps/modals/addGroup.vue';
import I18nIcon from '@/components/global/i18n-icon.vue';
import {
  Modal,
  Divider,
  Form,
  Input,
  Select,
  Icon,
  Switch,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import appBaseApi from '@/apis/app-settings/base.api';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';

const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'AddAppModal',
  components: {
    I18nIcon,
    AppGroup,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
    AModal: Modal,
    ADivider: Divider,
    AForm: Form,
    AFormItem: Form.Item,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    AIcon: Icon,
    ASwitch: Switch,
  },
})
export default class AddAppModal extends Vue {
  @Prop() value!: boolean;

  @Prop({ default: [] }) catalogues!: any[];

  @Prop() groupInfo!: any;

  @Prop({
    default: () => {
      return {};
    },
  })
  data: any;

  @AppCenterModule.Action('addAppPackage') addAppPackage: any;

  @AppCenterModule.Action('updateAppPackage') updateAppPackage: any;

  @AppCenterModule.State('appList') appList: any;

  filterOption(input: any, option: any) {
    return (
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }

  showModal: boolean = false;

  showAddModal: boolean = false;

  confirmLoading: boolean = false;

  params: any = {
    name: '',
    code: '',
    groupId: '',
  };

  form: any = {};

  formItemLayout: any = {
    labelCol: {
      span: 24,
    },
    wrapperCol: {
      span: 24,
    },
  };

  rules: any = {};

  codeError: any = null;

  existCodes: Array<string> = [];

  builtInApp: boolean = false;

  beforeMount() {
    this.setRules();
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  addItem() {
    this.showAddModal = true;
  }

  submitEvent() {
    this.$emit('updateList');
  }

  formCreate(form) {
    this.form = form;
  }

  setRules() {
    this.rules = {
      name: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.FillInAppName'),
          },
          {
            validator: (rules: any, value: string, callback: Function) => {
              const maxLen: number = 50;

              const reg = /^ /;
              const len = getRealLength(value);
              if (reg.test(value) || len > maxLen) {
                callback(this.$t('languages.Apps.AppNameRule'));
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
            message: this.$t('languages.Apps.FillInAppCode'),
          },
          {
            pattern: pattern('code'),
            message: this.$t('languages.Apps.AppCodeRule'),
            // '以字母开头不超过28个字符，仅支持字母、数字、下划线'
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

  closeAddModal() {
    this.$emit('input', false);
    this.params = {
      name: '',
      code: '',
      groupId: '',
    };
    this.form.resetFields();
    this.codeError = null;
    this.existCodes = [];
  }

  submitAddApp() {
    // console.log(this.params, 'after submit');
    /* 校验必填项和格式 */
    this.form.validateFields(async (err: any) => {
      if (!err) {
        if (this.file) {
          // 先上传图片获取图片地址
          this.uploading = true;
          const res: AppSettings.uploadResponse = await appBaseApi.uploadFile({
            file: this.file,
            rewriteFilename: true,
          });
          if (res.errcode !== 0) {
            this.$message.error(res.errmsg as string);
            return;
          }
          this.form.logoUrlId = res.data.refId;
          this.uploading = false;
          this.file = null;
          this.form.logoUrl = this.form.logoUrlId;
        }

        /* 提交新建应用表单 */

        let params: any = {};
        if (this.form.logoUrlId) {
          params = Object.assign(
            {
              logoUrlId: this.form.logoUrlId,
              logoUrl: this.form.logoUrlId,
            },
            this.params,
          );
        } else {
          params = Object.assign({}, this.params);
        }

        // 处理多语言字段保存
        const nameI18n: any =
          typeof this.data.name_i18n === 'object'
            ? this.data.name_i18n
            : (this.data.name_i18n && JSON.parse(this.data.name_i18n)) || {};
        if (this.$i18n.locale && this.$i18n.locale === 'zh') {
          nameI18n.zh = params.name;
        } else {
          nameI18n[this.$i18n.locale] = params.name;
          params.name = this.data.name || params.name;
        }
        params.name_i18n = JSON.stringify(nameI18n);
        params.groupCode = this.groupInfo.id;

        this.confirmLoading = true;

        if (!this.isEdit) {
          this.addAppPackage(params)
            .then(() => {
              this.$emit('submitEvent', this.params.code);
              this.$message.success('新建成功');
              /* 关闭弹窗 */
              this.closeAddModal();
            })
            .catch((e: any) => {
              this.confirmLoading = false;
              this.codeError = e.errmsg;
              this.existCodes.push(this.params.code);
              this.$nextTick(() => {
                this.form.setFieldsValue({ code: this.params.code });
                this.form.validateFields();
              });
            });
        } else {
          const _params = Object.assign(this.data, params);
          this.updateAppPackage(_params)
            .then(() => {
              this.$emit('updateList', this.params.code);
              this.$message.success('更新成功');
              this.data.displayName = params.name;
              /* 关闭弹窗 */
              this.closeAddModal();
            })
            .catch((e: any) => {
              this.confirmLoading = false;
              this.codeError = e.errmsg;
              this.existCodes.push(this.params.code);
              this.$nextTick(() => {
                this.form.setFieldsValue({ code: this.params.code });
                this.form.validateFields();
              });
            });
        }
      }
    });
  }

  isEdit: boolean = false;

  reset() {
    this.isEdit = false;
    this.imgUrl = '';
    this.file = null;
    this.uploading = false;
    this.confirmLoading = false;
    this.params = {
      name: '',
      code: '',
      groupId: '',
    };
    this.codeError = null;
    this.existCodes = [];
  }

  @Watch('value')
  onValueChange(v: boolean) {
    if (v) {
      this.reset();
      if (Object.keys(this.data).length) {
        this.isEdit = true;
        this.params.name = this.data.displayName;
        this.params.code = this.data.code;
        this.params.groupId = this.data.groupId;
        this.params.enabled = this.data.enabled;
        this.params = { ...this.params };
        this.imgUrl = this.data.content
          ? `data:image/png;base64,${this.data.content}`
          : this.getDownloadUrl(this.data.logoUrl);
        this.$nextTick(() => {
          this.form.setFieldsValue({ ...this.params });
        });

        if (this.appList.length > 0 && this.params.code) {
          this.appList.forEach((x) => {
            if (x.code === this.params.code) {
              this.builtInApp = x.builtInApp;
            }
          });
        }
      } else {
        this.isEdit = false;
        this.$nextTick(() => {
          const groupId = this.groupInfo.id
            ? this.groupInfo.id
            : this.catalogues[0].id;
          this.params.groupId = groupId;
          this.params = { ...this.params };
          this.form.setFieldsValue({ ...this.params });
        });
      }
    }
    this.showModal = v;
  }

  getDownloadUrl(refId: string) {
    if (!refId) {
      return '';
    } else if (refId && refId.indexOf('http') > -1) {
      return refId;
    } else {
      return getDownloadUrlNew.getImageUrl(refId, 'application');
    }
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setRules();
  }

  uploading: boolean = false;

  // 上传的图片文件
  file: File | null = null;

  // 预览图片地址
  imgUrl: string = '';

  /**
   * 获取上传的应用图标并判断是否符合限制
   */
  beforeUpload(file: File) {
    this.uploading = true;
    this.$nextTick(() => {
      this.uploading = false;
    });
    const isPic = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);

    const isLimitSize = file.size / 1024 < 100;
    if (!isPic) {
      this.$message.error(
        this.$t('languages.appSettings.PlzUploadImageFile') as string,
      );
      return;
    }
    if (!isLimitSize) {
      this.$message.error(
        this.$t('languages.appSettings.ImageSizeTip', {
          size: '100KB',
        }) as string,
      );
      return;
    }
    if (isPic && isLimitSize) {
      this.file = file;
      const URL = window.URL || (window as any).webkitURL;
      this.imgUrl = URL.createObjectURL(file);
    }
  }
}
</script>

<style lang="less">
@import '~@/styles/color/colors.less';
.upload-wrap {
  display: flex;
  align-items: center;
  .ant-upload-select {
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid #eeeeee;
    border-radius: 2px;
    margin-right: 16px;
    cursor: pointer;
    .base-settings__icon {
      height: 46px;
      width: 46px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      width: 30px;
      height: 30px;
    }
    img {
      height: 46px;
      width: 46px;
    }
  }
  .base-settings__text {
    font-size: 12px;
    line-height: 17px;
    color: @light-font-color;
  }
}
</style>

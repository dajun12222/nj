<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="showUpdateModel"
    :width="800"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    :keyboard="false"
    wrapClassName="new-modal-style"
    @ok="editModel"
    @cancel="closeModel"
  >
    <template slot="title">
      <div class="custom-title">
        {{ mode === 'edit' ? '编辑' : '新建' }}数据分析
        <small v-if="mode !== 'edit'">可基于已有的系统模型或外部数据源，做可视化数据展示与分析，支持多种图表类型</small>
      </div>
    </template>

    <a-form
      :autoFormCreate="
        (theModelForm) => {
          modelForm = theModelForm;
        }
      "
      hideRequiredMark
      class="app-form add-app__wrap"
    >
      <a-row>
        <a-col :span="12">
          <a-form-item
            fieldDecoratorId="modelName"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :fieldDecoratorOptions="rules.modelName"
            :colon="false"
          >
            <span slot="label">
              {{ $t('languages.Apps.ReportName') }}
              <em>*</em>
              <i18n-icon />
            </span>

            <a-input
              v-model="modelData.modelName"
              :placeholder="$t('languages.Apps.InputReportName')"
              :maxLength="modelNameLength"
              class="app-form__input"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            fieldDecoratorId="modelCode"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :fieldDecoratorOptions="rules.modelCode"
            :colon="false"
          >
            <span slot="label">
              {{ $t('languages.Apps.ReportCode') }}
              <em>*</em>
            </span>
            <a-input
              v-model="modelData.modelCode"
              :placeholder="$t('languages.Apps.InputReportCode')"
              :maxLength="maxLength"
              class="app-form__input"
              :disabled="mode === 'edit'"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="12">
          <a-form-item
            fieldDecoratorId="catalogues"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :colon="false"
          >
            <span slot="label">
              分组
              <em>*</em>
            </span>
            <a-tree-select
              v-model="group"
              :treeData="tree"
              placeholder="请选择上级分组"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            fieldDecoratorId="icon"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
          >
            <span slot="label">
              {{ $t('languages.Apps.Icon') }}
            </span>

            <div class="icon">
              <a-popover placement="bottom" overlayClassName="set-icon">
                <template slot="content">
                  <div class="custom-icons">
                    <template v-for="item in iconsClassName">
                      <em
                        :key="item"
                        class="icon aufontAll"
                        :class="[item, appIcon === item ? 'active' : '']"
                        @click="changeIcon(item)"
                      ></em>
                    </template>
                  </div>
                </template>
                <div class="icon-wrapper report">
                  <em class="icon aufontAll" :class="appIcon"></em>
                </div>
              </a-popover>
            </div>

            <!-- <selected-icon class="app-form__input" @input="changeIcon" /> -->
          </a-form-item>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="12">
          <a-form-item
            :label="$t('languages.Apps.VisibleRange')"
            fieldDecoratorId="visibleRange"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
          >
            <a-checkbox-group v-model="modelData.visibleRange">
              <a-row>
                <a-col :span="8">
                  <a-checkbox value="pc">
                    {{ $t('languages.Apps.PcVisible') }}
                  </a-checkbox>
                </a-col>
                <a-col :span="12">
                  <a-checkbox value="mobile">
                    {{ $t('languages.Apps.MobileVisible') }}
                  </a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { bizModelNameValidator, pattern } from '@/common/utils';
import I18nIcon from '@/components/global/i18n-icon.vue';
import selectedIcon from '@/components/global/select-icon/index.vue';
import { LanguageTransform } from '@/utils';
import {
  Modal,
  Row,
  Col,
  TreeSelect,
  Form,
  Checkbox,
  Input,
  Button,
  Popover,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const MenuModule = namespace('Apps/AppItem');
const AppCenterModule = namespace('Apps/AppCenter');
import { EventBus } from 'cloudpivot/form/src/schema/event-bus';

@Component({
  name: 'AddReport',
  components: {
    selectedIcon,
    I18nIcon,
    AModal: Modal,
    AForm: Form,
    AFormItem: Form.Item,
    AButton: Button,
    AInput: Input,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    ARow: Row,
    ACol: Col,
    ATreeSelect: TreeSelect,
    APopover: Popover,
  },
})
export default class AddReport extends Vue {
  @AppCenterModule.State('appInfo') appDetails: any;

  @MenuModule.State('appInfo') appInfo: any;

  @MenuModule.State('floders') floders: any;

  @MenuModule.State('menuId') menuId: any;

  @MenuModule.Action('getFolders') getFolders: any;

  @MenuModule.Action('addReport') addReport: any;

  @MenuModule.Action('updateReport') updateReport: any;

  @MenuModule.Action('getAppItem') getAppItem: any;

  @Prop({
    type: Boolean,
  })
  value!: boolean;

  @Prop({
    type: String,
    default: () => '',
  })
  mode?: string;

  @Prop({
    default: () => {},
  })
  model!: any;

  showUpdateModel: boolean = false;

  maxLength: number = 24;

  modelNameLength: number = 50;

  defaultFolder: string = '';

  modelForm: any = {};

  group = '';

  modelData: any = {};

  formItemLayout: Common.FormItemLayout = {
    labelCol: {
      span: 24,
    },
    wrapperCol: {
      span: 24,
    },
  };

  rules: any = {};

  errCode: string = '';

  existCodes: Array<string> = [];

  errCodeTxt: string = '';

  iconsClassName: string[] = [];

  getIconNames() {
    const svgdom: any = document.body.querySelector('svg#icons');
    const content = svgdom.innerHTML;
    const ids = content.replace(
      /<symbol.+?id="(.+?)".+?>.+?<\/symbol>/g,
      '$1 ',
    );

    const customIcons: any[] = [
      'h-icon-all-disconnect',
      'h-icon-all-Report',
      'h-icon-all-yingyong',
    ];
    this.iconsClassName = [
      ...customIcons,
      ...ids.replace(/(^\s*)|(\s*$)/g, '').split(' '),
    ];
  }

  created() {
    this.getIconNames();
  }

  beforeMount() {
    this.setRules();
    this.initModel();
  }

  setRules() {
    this.rules = {
      modelCode: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.InputReportCode'),
          },
          {
            pattern: pattern('modelcode'),
            message: this.$t('languages.Apps.ModelCodeRule'),
          },
          {
            validator: (rules: any, value: any, callback: any) => {
              if (value && this.existCodes.includes(value)) {
                callback(this.errCodeTxt);
              }
              callback();
            },
          },
        ],
      },
      modelName: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.InputReportName'),
          },
          {
            validator: bizModelNameValidator,
            message: this.$t('languages.Apps.BizModelNameRule'),
          },
        ],
      },
    };
  }

  appIcon: string = 'h-icon-all-Report';

  changeIcon(icon: any) {
    this.appIcon = icon;
    this.modelForm.setFieldsValue({
      icon,
    });
  }

  initModel() {
    let catalogues = '';

    if (this.defaultFolder) {
      catalogues = this.defaultFolder;
    } else {
      catalogues = this.appDetails.id;
    }

    this.modelData = {
      catalogues,
      modelName: '',
      icon: 'h-icon-all-Report',
      modelCode: '',
      visibleRange: ['pc', 'mobile'],
    };
  }

  closeModel() {
    this.$emit('input', false);
    this.modelForm.resetFields();
    this.existCodes = [];
    this.errCodeTxt = '';
  }

  editModel() {
    // 修改、新增业务模型
    const vm: any = this;
    this.modelForm.validateFields((err: any) => {
      if (!err) {
        const modelFormData = vm.modelForm.getFieldsValue();

        // 多语言业务字段保存
        const nameI18n: any =
          (this.modelData.name_i18n && JSON.parse(this.modelData.name_i18n)) ||
          {};

        if (this.$i18n.locale && this.$i18n.locale === 'en') {
          nameI18n.en = modelFormData.modelName;
        } else {
          nameI18n[this.$i18n.locale] = modelFormData.modelName;
        }

        const params = {
          id: this.modelData.id,
          appCode: vm.appInfo.appCode,
          name: nameI18n.zh || modelFormData.modelName,
          parentId: this.group ? this.group : modelFormData.catalogues,
          code: modelFormData.modelCode,
          icon: modelFormData.icon,
          name_i18n: JSON.stringify(nameI18n),
          mobileAble: modelFormData.visibleRange.indexOf('mobile') > -1,
          pcAble: modelFormData.visibleRange.indexOf('pc') > -1,
        };

        const req = params.id ? vm.updateReport(params) : vm.addReport(params);

        req.then((res: Common.Data) => {
          if (params.id && res.errcode === 0) {
            this.$message.success('修改成功');
            EventBus.$emit('reportChange', params);
          }
          if (res.errcode) {
            vm.existCodes.push(params.code);
            vm.$nextTick(() => {
              vm.errCodeTxt = res.errmsg;
              vm.modelForm.setFieldsValue({ modelCode: params.code });
              vm.modelForm.validateFields();
            });
          } else {
            vm.getAppItem(vm.appInfo);
            if (this.mode === 'add') {
              vm.$router.push({
                path: `/apps/${vm.appInfo.appCode}/report-design/${modelFormData.modelCode}/isNew/true`,
              });
            }
            vm.closeModel();
          }
        });
      }
    });
  }

  getLangName(item: any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }

  get tree() {
    // 不知道为啥replaceFields 无效
    return this.floders.map((item: any) => {
      if (item.children && item.children.length) {
        return this.convert(item, false);
      } else {
        return {
          value: item.id,
          key: item.id,
          title: item.name,
          children: null,
        };
      }
    });
  }

  convert(x: any, isLeaf: boolean) {
    let children = null;
    if (x.children) {
      children = x.children.map((c: any) => this.convert(c, !c.children));
    }
    return {
      value: x.id,
      key: x.id,
      title: x.name,
      children,
    };
  }

  @Watch('value')
  onValueChange(v: boolean) {
    if (v) {
      this.getFolders(this.appInfo);
      this.initModel();

      this.$nextTick(() => {
        this.modelForm.setFieldsValue(this.modelData);
      });
    }
    this.showUpdateModel = v;
  }

  @Watch('model', {
    immediate: true,
  })
  onModelChange(m: any) {
    if (m) {
      const visibleRange: string[] = [];

      if (m.mobileAble) {
        visibleRange.push('mobile');
      }

      if (m.pcAble) {
        visibleRange.push('pc');
      }
      let nameI18n: any = {};
      try {
        nameI18n = JSON.parse(m.name_i18n);
        //脏数据处理。（中文保存在en下了）
        if (nameI18n && !nameI18n.zh) {
          nameI18n.zh = m.name;
        }
      } catch (e) {
        console.log(e);
      }

      Object.assign(this.modelData, {
        id: m.id,
        appCode: m.appCode,
        catalogues: m.parentId,
        modelCode: m.code,
        modelName: this.getLangName(m),
        name_i18n: JSON.stringify(nameI18n),
        icon: m.icon,
        visibleRange,
      });

      this.appIcon = m.icon;
    }
  }

  @Watch('menuId')
  onMenuIdChange(v: string) {
    this.defaultFolder = v;
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setRules();
  }
}
</script>

<style lang="less" scoped>
.app-form {
  .app-form__input {
    width: 100%;
  }
}

/deep/.ant-checkbox-group {
  display: block;
  line-height: 32px;
}
</style>

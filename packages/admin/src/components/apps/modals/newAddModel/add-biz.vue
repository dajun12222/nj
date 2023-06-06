<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-form
    :autoFormCreate="
      (myModelForm) => {
        modelForm = myModelForm;
      }
    "
    class="add-model-wrap"
    hideRequiredMark
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
            {{ $t('languages.Apps.ModelName') }}
            <em>*</em>
            <i18n-icon />
          </span>

          <a-input
            v-model="modelData.modelName"
            :placeholder="$t('languages.Apps.InputModelName')"
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
            {{ $t('languages.Apps.ModelCode') }}
            <em>*</em>
            <small>用于模型之间的唯一性识别</small>
          </span>
          <a-input
            v-model="modelData.modelCode"
            :placeholder="$t('languages.Apps.InputModelCode')"
            :maxLength="maxLength"
            class="app-form__input"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row>
      <a-col :span="12">
        <a-form-item
          fieldDecoratorId="modelType"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
          :fieldDecoratorOptions="rules.modelType"
          :colon="false"
        >
          <span slot="label">
            类型 <em>*</em>
            <a-tooltip>
              <div slot="title">
                <span> 树形模型支持数据的树形展示，可作 </span><br />
                <span> 为树形控件，树形字典的数据源 </span>
              </div>
              <i class="icon aufontAll h-icon-all-question-circle"></i>
            </a-tooltip>
          </span>

          <a-select
            v-model="modelData.modelType"
            allowClear
            placeholder="请选择模型类型"
          >
            <a-select-option
              v-for="item in modelType"
              :key="item.key"
              :value="item.value"
            >
              {{ item.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>

      <a-col :span="12">
        <a-form-item
          fieldDecoratorId="catalogues"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
          :fieldDecoratorOptions="rules.catalogues"
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
    </a-row>

    <a-row>
      <a-col :span="12">
        <a-form-item
          fieldDecoratorId="icon"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
          :colon="false"
        >
          <span slot="label"> 图标 </span>

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
              <div class="icon-wrapper biz">
                <em class="icon aufontAll" :class="appIcon"></em>
              </div>
            </a-popover>
          </div>

          <!-- <selected-icon class="app-form__input" @input="changeIcon" /> -->
        </a-form-item>
      </a-col>

      <a-col :span="12">
        <a-form-item
          :label="$t('languages.Apps.VisibleRange')"
          fieldDecoratorId="visibleRange"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-checkbox-group v-model="modelData.visibleRange">
            <a-checkbox value="pc">
              {{ $t('languages.Apps.PcVisible') }}
            </a-checkbox>
            <a-checkbox value="mobile">
              {{ $t('languages.Apps.MobileVisible') }}
            </a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>

<script lang="ts">
import { bizModelNameValidator, pattern } from '@/common/utils';
import I18nIcon from '@/components/global/i18n-icon.vue';
import selectedIcon from '@/components/global/select-icon/index.vue';
import { LanguageTransform } from '@/utils';
import AddBiz from './add-biz.vue';
import {
  Modal,
  Row,
  Form,
  Input,
  Checkbox,
  Select,
  Tooltip,
  TreeSelect,
  Icon,
  Col,
  Popover,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const MenuModule = namespace('Apps/AppItem');
const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'AddBizModel',
  components: {
    AddBiz,
    selectedIcon,
    I18nIcon,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    AForm: Form,
    AFormItem: Form.Item,
    AInput: Input,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATooltip: Tooltip,
    ATreeSelect: TreeSelect,
    AIcon: Icon,
    APopover: Popover,
  },
})
export default class AddBizModel extends Vue {
  @AppCenterModule.State('appInfo') appDetails: any;

  @MenuModule.State('appInfo') appInfo: any;

  @MenuModule.State('floders') floders: any;

  @MenuModule.State('menuId') menuId: any;

  @MenuModule.Action('getFolders') getFolders: any;

  @MenuModule.Action('addBizModel') addBizModel: any;

  @MenuModule.Action('getAppItem') getAppItem: any;

  @Prop({
    type: Boolean,
  })
  value!: boolean;

  group: any = '';

  /* showUpdateModel: boolean = false; */

  appIcon: string = 'h-icon-all-yingyong';

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

  defaultFolder: string = '';

  modelForm: any = {};

  modelType: any[] = [
    {
      key: 'LIST',
      value: 'LIST',
      title: '标准模型',
    },
    {
      key: 'TREE',
      value: 'TREE',
      title: '树形模型',
    },
  ];

  modelData: any = {
    catalogues: '',
    modelType: '',
    modelName: '',
    icon: '',
    modelCode: '',
    visibleRange: ['pc', 'mobile'],
  };

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

  maxLength: number = 24;

  modelNameLength: number = 50;

  beforeMount() {
    this.setRules();
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

  get tree() {
    // 不知道为啥replaceFields 无效
    if (this.floders) {
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
    } else {
      return [];
    }
  }

  setRules() {
    this.rules = {
      catalogues: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.PleaseInput'),
          },
        ],
      },
      modelType: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.PleaseInput'),
          },
        ],
      },
      modelCode: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.InputModelCode'),
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
            message: this.$t('languages.Apps.InputModelName'),
          },
          {
            validator: bizModelNameValidator,
            message: this.$t('languages.Apps.BizModelNameRule'),
          },
        ],
      },
    };
  }

  changeIcon(icon: any) {
    this.appIcon = icon;
    this.modelForm.setFieldsValue({
      icon,
    });
  }

  closeModel() {
    // 关闭模态窗
    this.modelData.catalogues = '';
    this.modelData.modelType = '';
    this.modelData.modelCode = '';
    this.modelData.modelName = '';
    this.modelData.icon = '';
    this.modelData.visibleRange = ['pc', 'mobile'];
    this.$emit('input', false);
    this.modelForm.resetFields();
    this.existCodes = [];
    this.errCodeTxt = '';
  }

  async editModel() {
    // 修改、新增业务模型
    const vm: any = this;
    let isErr = false;
    await this.modelForm.validateFields(async (err: any) => {
      if (!err) {
        const modelFormData = vm.modelForm.getFieldsValue();
        // 多语言业务字段保存
        const nameI18n: any = {};
        if (!(this.$i18n.locale && this.$i18n.locale === 'en')) {
          nameI18n.en = modelFormData.modelName;
        } else {
          nameI18n[this.$i18n.locale] = modelFormData.modelName;
        }
        const modelParams: Apps.AppItem.AddBizModel = {
          appCode: vm.appInfo.appCode,
          name: modelFormData.modelName,
          parentId: modelFormData.catalogues,
          modelType: modelFormData.modelType,
          bizSchemaCode: modelFormData.modelCode,
          icon: modelFormData.icon,
          name_i18n: JSON.stringify(nameI18n),
          pcAble: modelFormData.visibleRange.includes('pc'),
          mobileAble: modelFormData.visibleRange.includes('mobile'),
        };
        const res: Common.Data = await vm.addBizModel(modelParams);
        if (!res.errcode) {
          if (res.data) {
            modelFormData.id = res.data.id;
            modelFormData.code = res.data.code;
          }
          vm.getAppItem(vm.appInfo);
          try {
            vm.$emit('getBizModel', modelFormData);
          } catch (error) {
            console.log(error);
          }
          this.$message.success('新建成功');
          setTimeout(() => {
            this.$emit('ok', this.modelData.modelCode);
            vm.closeModel();
          }, 1000);
        } else {
          vm.existCodes.push(modelParams.bizSchemaCode);
          vm.$nextTick(() => {
            vm.errCodeTxt = res.errmsg;
            vm.modelForm.setFieldsValue({
              modelCode: modelParams.bizSchemaCode,
            });
            vm.modelForm.validateFields();
          });
          isErr = true;
        }
      } else {
        isErr = true;
      }
      if (isErr) {
        throw Error;
      }
    });
  }

  getLangName(item: any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }

  @Watch('value', { immediate: true })
  onValueChange(v: boolean) {
    if (v) {
      this.getFolders(this.appInfo);
      this.$nextTick(() => {
        if (this.defaultFolder) {
          const arr: any =
            JSON.stringify(this.tree).indexOf(this.defaultFolder) > -1;
          this.modelForm.setFieldsValue({
            catalogues: arr ? this.defaultFolder : '',
            icon: 'h-icon-all-yingyong',
            visibleRange: ['pc', 'mobile'],
          });
        } else {
          const arr: any =
            JSON.stringify(this.tree).indexOf(this.appDetails.id) > -1;
          this.modelForm.setFieldsValue({
            catalogues: arr ? this.appDetails.id : '',
            icon: 'h-icon-all-yingyong',
            visibleRange: ['pc', 'mobile'],
            modelType: 'LIST',
          });
        }
      });
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
@import '~@/styles/form-item.less';
</style>

<style lang="less">
// .ant-select-dropdown.select-icon-wrap {
//   width: 145px !important;
// }

.add-model-wrap {
  .ant-row {
    .ant-col {
      padding-right: 16px;
      &:last-child {
        padding-right: 0;
      }
    }
  }
}
</style>

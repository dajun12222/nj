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
        修改业务模型
        <small v-if="false">应用下的子业务模块，创建后可根据需要搭建表单、流程、列表等，进行数据收集及流程审批</small>
      </div>
    </template>

    <a-form
      :autoFormCreate="
        (myModelForm) => {
          modelForm = myModelForm;
        }
      "
      class="app-form add-app__wrap"
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
              <!-- <small>用于模型之间的唯一性识别</small> -->
            </span>
            <a-input
              v-model="modelData.modelCode"
              :placeholder="$t('languages.Apps.InputModelCode')"
              :maxLength="maxLength"
              :disabled="true"
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
              模型类型
              <!-- <em>*</em> -->
              <!-- <a-tooltip>
                <div slot="title">
                  <span> 树形模型支持数据的树形展示，可作 </span><br />
                  <span> 为树形控件，树形字典的数据源 </span>
                </div>
                <i class="icon aufontAll h-icon-all-question-circle"></i>
              </a-tooltip> -->
            </span>

            <a-select
              v-model="modelData.modelType"
              allowClear
              placeholder="请选择模型类型"
              :disabled="true"
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
        <a-col :span="12">
          <a-form-item
            :label="$t('languages.Apps.AssociatedAccountSet')"
            fieldDecoratorId="remarks"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
          >
            <a-radio-group v-model="remarks" name="radioGroup" disabled="true">
              <a-radio :value="'true'">{{ $t('languages.Apps.Yes') }}</a-radio>
              <a-radio :value="'false'">{{ $t('languages.Apps.No') }}</a-radio>
            </a-radio-group>
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
  Form,
  TreeSelect,
  Select,
  Checkbox,
  Input,
  Row,
  Col,
  Popover,
  Radio,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const MenuModule = namespace('Apps/AppItem');

@Component({
  name: 'UpdateBizModel',
  components: {
    selectedIcon,
    I18nIcon,
    AModal: Modal,
    AInput: Input,
    AForm: Form,
    AFormItem: Form.Item,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    ARow: Row,
    ACol: Col,
    ATreeSelect: TreeSelect,
    ASelect: Select,
    ASelectOption: Select.Option,
    APopover: Popover,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
  },
})
export default class UpdateBizModel extends Vue {
  @MenuModule.State('appInfo') appInfo: any;

  @MenuModule.State('floders') floders: any;

  @MenuModule.Action('getFolders') getFolders: any;

  @MenuModule.Action('updateBizModel') updateBizModel: any;

  @MenuModule.Action('getAppItem') getAppItem: any;

  @Prop() value!: boolean;

  @Prop() updateModelData!: any;

  showUpdateModel: boolean = false;

  modelForm: any = {};

  iconsClassName: string[] = [];

  maxLength: number = 24;

  modelNameLength: number = 50;

  group = '';

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

  isEdit: boolean = false;

  created() {
    this.getIconNames();
  }

  modelType: Array<any> = [
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
    visibleRange: [],
  };

  remarks = 'false';

  formItemLayout: Common.FormItemLayout = {
    labelCol: {
      span: 24,
    },
    wrapperCol: {
      span: 24,
    },
  };

  rules: any = {};

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

  appIcon: string = 'h-icon-all-yingyong';

  changeIcon(icon: any) {
    this.appIcon = icon;
    this.modelForm.setFieldsValue({
      icon,
    });
  }

  closeModel(form: any) {
    // 关闭模态窗
    this.modelData.catalogues = '';
    this.modelData.modelType = '';
    this.modelData.modelCode = '';
    this.modelData.modelName = '';
    this.modelData.icon = '';
    this.modelData.visibleRange = [];
    this.remarks = 'false';
    this.$emit('input', false);
    this.modelForm.resetFields();
    this.$emit('resetBizModel', form);
  }

  editModel() {
    // 修改业务模型
    const vm: any = this;
    this.modelForm.validateFields((err: any) => {
      if (!err) {
        const modelFormData = vm.modelForm.getFieldsValue();
        // 处理多语言字段保存
        let nameI18n: any = {};
        let name: string = '';
        if (vm.updateModelData.name_i18n) {
          try {
            nameI18n = JSON.parse(vm.updateModelData.name_i18n);
          } catch {
            nameI18n = {};
          }
        }
        if (vm.$i18n.locale === 'zh') {
          name = modelFormData.modelName;
          if (!nameI18n.en) {
            nameI18n.en = name;
          }
        } else {
          name = vm.updateModelData.name || modelFormData.modelName;
          nameI18n[vm.$i18n.locale] = modelFormData.modelName;
        }

        const modelParams: Apps.AppItem.UpdateBizModel = {
          id: vm.updateModelData.id,
          name,
          bizSchemaCode: modelFormData.modelCode,
          icon: modelFormData.icon,
          parentId: modelFormData.catalogues,
          modelType: modelFormData.modelType,
          name_i18n: JSON.stringify(nameI18n),
          pcAble: modelFormData.visibleRange.includes('pc'),
          mobileAble: modelFormData.visibleRange.includes('mobile'),
          remarks: this.remarks === 'true' ? '1' : '0',
        };
        vm.updateBizModel(modelParams).then((res) => {
          this.$message.success('修改成功');
        });
        // 触发关闭弹窗并更新模型数据
        vm.closeModel(Object.assign({}, vm.updateModelData, modelParams));
      }
    });
  }

  getLangName(item: any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }

  @Watch('value')
  onValueChange(v: boolean) {
    if (v) {
      this.getFolders(this.appInfo);
    }
    this.showUpdateModel = v;
  }

  @Watch('updateModelData', { deep: true })
  onUpdateModelChange(v: any) {
    this.$nextTick(() => {
      if (this.modelForm.setFieldsValue) {
        const visibleRange = [];
        if (this.updateModelData.pcAble) {
          visibleRange.push('pc');
        }
        if (this.updateModelData.mobileAble) {
          visibleRange.push('mobile');
        }

        this.modelForm.setFieldsValue({
          modelName: this.getLangName(v),
          modelCode: v.code,
          modelType: v.modelType,
          catalogues: v.parentId,
          icon: v.icon,
          visibleRange,
          remarks: v.remarks === '1' ? 'true' : 'false',
        });

        this.appIcon = v.icon;

        this.modelData.visibleRange = visibleRange;
        //
        this.modelData.modelName = this.getLangName(v);
        this.modelData.modelCode = v.code;
        this.modelData.catalogues = v.parentId;
        this.modelData.icon = v.icon;
        this.remarks = v.remarks === '1' ? 'true' : 'false';
      }
    });
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
  .ant-checkbox-group {
    width: 100%;
    line-height: 32px;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="modal-wrap">
    <template v-if="currentModal === 'RoleSelector'">
      <role-selector
        ref="roleSelector"
        v-model="modalRole"
        :visible="true"
        :showForm="true"
        :multiple="true"
        @hide="closeModal"
        @input="backDataRole"
      />
    </template>
    <component
      :is="currentModal"
      v-else
      :modalData="modalMsg"
      :modalOptions="mOptions"
      :isShowRequired="isShowRequired"
      :getFormControls="getFormControls"
      :getControl="getControl"
      :dataItem="dataItem"
      @backData="backData"
      @closeModal="closeModal"
    />
  </div>
</template>
<script lang="ts">
import * as formApi from '@/apis/form';
import RoleSelector from 'cloudpivot/common/src/components/pc/role-selector/role-selector.vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ModalAttributeType } from '../form-property/typings/form-attribute';
import AddSelectOpiton from './add-checkbox-opiton.vue';
import AddRadioOption from './add-radio-option.vue';
import BizRadioOption from './biz-radio-option.vue';
import CalculateRule from './calculate-rule.vue';
import DateComponent from './date.vue';
import ExternalLink from './external-link.vue';
// 表单留痕弹窗
//import FormMarking from './form-marking-settings.vue';
import FormMarking from './form-marking-modal.vue';
import QueryCondition from './query-condition.vue';
import RegularModal from './regular-modal.vue';
import RelevanceFormDefaultValue from './relevance-form-default-value.vue';
import RequiredCondition from './required-condition.vue';
import ScriptInput from './script-input.vue';
import SelectReportData from './select-report-data.vue';
import SheetMappings from './sheet-mappings.vue';
import ShortTextStitch from './short-text-rouls.vue';
import UpdateImgNum from './update-img-num.vue'; // 上传图片数量 弹出框
import UserSelectValueSetting from './user-select-value-setting.vue';
import UserSelectionMap from './user-selection-map.vue';
import VerifyFormulaDate from './verify-formula-date.vue'; // 日期类型 提交校验
import VerifyFormulaNumber from './verify-formula-number.vue'; // 数值类型 提交校验

@Component({
  name: 'FormDesignModal',
  components: {
    AddSelectOpiton,
    AddRadioOption,
    Date: DateComponent,
    RegularModal,
    RequiredCondition,
    CalculateRule,
    UserSelectionMap,
    QueryCondition,
    ScriptInput,
    SheetMappings,
    ExternalLink,
    UserSelectValueSetting,
    VerifyFormulaDate,
    VerifyFormulaNumber,
    UpdateImgNum,
    RelevanceFormDefaultValue,
    BizRadioOption,
    ShortTextStitch,
    SelectReportData,
    TabsHeadsSetting: () => import('./tabs-heads-setting.vue'),
    RoleSelector,
    FormMarking,
  },
})
export default class FormDesignModel extends Vue {
  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop({ type: Object })
  modalOptions!: any;

  @Prop()
  dataItem!: any;

  @Prop()
  getFormControls!: Function;

  @Prop()
  getControl!: () => Function;

  @Prop()
  isShowRequired!: any;

  currentModal: string = '';

  modalMsg: any = [];

  mOptions: any = {};

  modalRole: any = [];

  async created() {
    this.modalMsg = this.modalData;
    try {
      //第一次后台返回的数据不是json数据格式，需要做判断，提交的提交了之后是json数据格式，不然portal无法显示
      this.modalData.data.value =
        typeof this.modalData.data.value === 'string'
          ? JSON.parse(this.modalData.data.value)
          : this.modalData.data.value;
      this.modalRole = this.modalData.data.value;
      if (
        Object.prototype.toString.call(this.modalRole) === '[object Object]'
      ) {
        //角色组的历史数据兼容
        this.modalRole = [this.modalRole];
      }
    } catch (e) {
      this.modalRole = [];
    }
    this.mOptions =
      this.modalOptions && this.modalOptions.modalOptions
        ? this.modalOptions.modalOptions
        : {};
    if (this.modalOptions && this.modalOptions.inputComponent) {
      if (this.$options.components) {
        this.$options.components[this.modalOptions.modalField] =
          this.modalOptions.inputComponent;
        this.currentModal = this.modalOptions.modalField;
        return;
      }
    }
    switch (this.modalData.type) {
      /* 单选选项框 */
      case 'radioOption':
        this.currentModal = 'AddRadioOption';
        break;
      case 'bizRadioOption':
        this.currentModal = 'BizRadioOption';
        break;
      /* 多选选项框 */
      case 'checkboxOption':
        this.currentModal = 'AddSelectOpiton';
        break;
      // 选择角色弹框
      case 'rolesModel':
        this.currentModal = 'RoleSelector';
        break;
      // 历史留痕弹窗
      case 'formMarking':
        this.currentModal = 'FormMarking';
        break;
      /**
       * 最小日期
       */
      case 'min-yyyy-mm-dd':
        this.currentModal = 'Date';
        break;

      /**
       * 最大日期
       */
      case 'max-yyyy-mm-dd':
        this.currentModal = 'Date';
        break;
      /**
       *正则弹框
       */
      case 'regularModal':
        this.currentModal = 'RegularModal';
        break;

      /**
       * 必填条件
       */
      case 'requiredCondition':
      case 'showRule':
        this.currentModal = 'RequiredCondition';
        break;

      /**
       * 计算规则
       */
      case 'calculateRule':
        this.currentModal = 'CalculateRule';
        break;
      /**
       * 选人控件映射关系
       */
      case 'userSelectionMap':
        this.currentModal = 'UserSelectionMap';
        break;

      case 'queryCondition':
        this.currentModal = 'QueryCondition';
        break;
      case 'ShortTextStitchRouls':
        this.currentModal = 'ShortTextStitch';
        break;
      case 'SelectReportData':
        this.currentModal = 'SelectReportData';
        break;

      case ModalAttributeType.ScriptInput:
        this.currentModal = ModalAttributeType.ScriptInput;
        break;
      case ModalAttributeType.VerifyFormulaDate:
        this.currentModal = ModalAttributeType.VerifyFormulaDate;
        break;
      case ModalAttributeType.VerifyFormulaNumber:
        this.currentModal = ModalAttributeType.VerifyFormulaNumber;
        break;
      case ModalAttributeType.UpdateImgNum:
        this.currentModal = ModalAttributeType.UpdateImgNum;
        break;
      case ModalAttributeType.SheetMappings:
        this.currentModal = ModalAttributeType.SheetMappings;
        break;
      case ModalAttributeType.ExternalLink:
        this.currentModal = ModalAttributeType.ExternalLink;
        break;

      case ModalAttributeType.UserSelectValueSetting:
      case ModalAttributeType.UserSelectOrgValueSetting:
        this.currentModal = ModalAttributeType.UserSelectValueSetting;
        break;

      case ModalAttributeType.Print:
        const printInfo = await this.judgePrintCode();
        this.$router
          .push({
            name: 'print-template',
            params: printInfo,
          } as any)
          .catch((err: any) => {
            console.log(err);
          });
        break;
      case ModalAttributeType.RelevanceFormDefaultVal:
        this.currentModal = ModalAttributeType.RelevanceFormDefaultVal;
        break;

      case ModalAttributeType.TabsHeadsSetting:
        this.currentModal = ModalAttributeType.TabsHeadsSetting;
        break;

      default:
        this.currentModal = 'AddRadioOption';
        break;
    }
  }

  async judgePrintCode() {
    const sheet = this.modalData.data.value;
    let printCode = '';
    const params: any = {
      name: '打印模板',
      code: `${sheet.code}_print`,
      icon: 'h-icon-all-operation-log-o',
      sheetType: '2',
      printIsPc: true,
      schemaCode: sheet.schemaCode,
    };
    if (sheet.printTemplateJson) {
      const createPrints = JSON.parse(sheet.printTemplateJson);
      if (Array.isArray(createPrints)) {
        printCode = createPrints[0].sheetCode;
      }
    }
    if (!printCode) {
      // 创建打印记录
      await formApi.create(params);
      // 更新与表单的关联关系
      const updatePrints = [
        {
          name: params.name,
          sheetCode: params.code,
        },
      ];
      const json = JSON.stringify(updatePrints);
      sheet.printTemplateJson = json;
      await formApi.update({
        id: sheet.id,
        code: sheet.code,
        name: sheet.name,
        sheetType: sheet.sheetType,
        schemaCode: sheet.schemaCode,
        printTemplateJson: json,
      } as any);
      printCode = sheet.code;
    }
    // 获取模板信息
    // @ts-ignore
    const bizSchemaCode: string = this.$route.params.bizSchemaCode;
    const { data, errcode, errmsg } = await formApi.get(
      bizSchemaCode,
      printCode,
    );
    if (errcode !== 0) {
      this.$message.error(errmsg);
    }
    if (!data) {
      this.$message.error('查询数据有误！');
    }
    const version = data.draftAttributesJson && !data.printJson;
    return {
      printCode,
      version: version ? '0' : '1',
    };
  }

  backData(val: any) {
    this.$emit('confirm', val);
  }

  backDataRole(val: any) {
    let value = '';
    const list = val.map((i: any) => {
      return { value: i.id, label: i.name };
    });
    try {
      value = list ? list : '';
    } catch (e) {}
    this.$emit('confirm', { value });
  }

  closeModal() {
    this.$emit('cancel');
  }
}
</script>
<style lang="less"></style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="popover-wrap">
    <a-row class="row">
      <a-col :span="leftWidth">
        <label class="title">{{ $t('languages.Apps.DisplayName') }}</label>
      </a-col>
      <a-col :span="rightWidth">
        <a-input
          v-if="isChinese"
          v-model="backData.name"
          maxlength="50"
          :class="{ 'input-error': !backData.name.trim() }"
        />
        <a-input
          v-else
          v-model="backData.name_i18n[$i18n.locale]"
          maxlength="50"
          :class="{ 'input-error': !backData.name_i18n[$i18n.locale].trim() }"
        />
        <div v-if="isChinese && !backData.name.trim()" class="empty-tip">
          {{ $t('languages.Apps.DisplayNameRequire') }}
        </div>
        <div
          v-if="!isChinese && !backData.name_i18n[$i18n.locale].trim()"
          class="empty-tip"
        >
          {{ $t('languages.Apps.DisplayNameRequire') }}
        </div>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col :span="leftWidth">
        <label class="title">{{ $t('languages.Apps.Relevance') }}</label>
        <a-tooltip>
          <span slot="title">
            <div>关联表单：新增时，新增业务数据，无流程审批；</div>
            <div>关联流程：新增时直接发起流程</div>
          </span>
          <i class="icon aufontAll h-icon-all-question-circle-o"></i>
        </a-tooltip>
      </a-col>
      <a-col :span="rightWidth">
        <a-radio-group
          v-model="backData.associationType"
          class="radio-group"
          @change="radioChange"
        >
          <a-radio class="radio" :value="0">
            {{ $t('languages.Apps.AssociatedForms') }}
          </a-radio>
          <a-radio class="radio" :value="1">
            {{ $t('languages.Apps.RelevantProcess') }}
          </a-radio>
        </a-radio-group>
      </a-col>
    </a-row>
    <!-- <a-row v-if="backData.associationType === 1" class="row">
      <a-col :span="leftWidth">
        <label class="title">{{ $t('languages.Apps.RelevantProcess') }}</label>
      </a-col>
      <a-col :span="rightWidth">
        <a-select
          v-model="backData.associationCode"
          class="select"
          :placeholder="$t('languages.PlaceHolder.Select')"
          :getPopupContainer="getPopupContainer"
          :class="{ 'input-error': !backData.associationCode }"
        >
          <a-select-option
            v-for="(option, index) in workflowList"
            :key="index"
            :value="option.workflowCode"
          >
            {{ option.workflowName }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>-->
    <a-row v-show="backData.associationType === 0" class="row">
      <a-col :span="leftWidth">
        <label class="title">{{ $t('languages.Apps.AssociatedForms') }}</label>
      </a-col>
      <a-col :span="rightWidth">
        <a-select
          v-model="backData.associationCode"
          class="select"
          :placeholder="$t('languages.PlaceHolder.Select')"
          :getPopupContainer="getPopupContainer"
          :class="{ 'input-error': !backData.associationCode }"
        >
          <a-select-option
            v-for="(option, index) in formList"
            :key="index"
            :value="option.code"
          >
            {{ option.name }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <div class="btn-group btn-group-fixed clearfix">
      <a-button class="btn" type="primary" size="small" @click="close">
        {{ $t('languages.Apps.Ok') }}
      </a-button>
      <a-button class="btn" size="small" @click="concel">
        {{ $t('languages.Apps.Cancel') }}
      </a-button>
    </div>
    <div></div>
  </div>
</template>
<script lang="ts">
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import { Row, Col, Select, Radio, Input, Button, Tooltip } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { DateType, WidthSettingType } from '../../control-modals-map';

const ListdesignModule = namespace('Apps/Listdesign');
@Component({
  name: 'AddBtn',
  components: {
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    AButton: Button,
    AInput: Input,
    ATooltip: Tooltip,
  },
})
export default class AddBtn extends Vue {
  @ListdesignModule.State('formList') formList: any;

  @ListdesignModule.State('workflowList') workflowList: any;

  @ListdesignModule.State('name') name: any;

  @ListdesignModule.State('showFieldArray') storeShowFieldArray: any;

  @ListdesignModule.Mutation('setShowFieldArray') mutationShowFieldArray: any;

  @Prop() modalData!: any;

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  leftWidth: number = 7;

  rightWidth: number = 16;

  visible: boolean = true;

  DateType = DateType;

  WidthSettingType = WidthSettingType;

  // formList:Array<any> = [];

  // workflowList:Array<any> = [];

  backData = {
    name: '',
    name_i18n: {},
    associationCode: '',
    associationType: 0,
    associationflowCode: '',
    associationflowType: 0,
    popover: false,
  };

  oldData = {
    ...this.backData,
  };

  close() {
    if (this.isChinese && !this.backData.name.trim()) {
      return;
    } else if (
      !this.isChinese &&
      !this.backData.name_i18n[this.$i18n.locale].trim()
    ) {
      return;
    } else {
      //Else Empty block statement
    }

    if (this.backData.associationCode === '') {
      this.$message.error(
        this.$t('languages.Apps.AssociatedFormTips') as string,
      );
      return;
    }
    this.oldData = JSON.parse(JSON.stringify(this.backData));
    this.$emit('backData', JSON.parse(JSON.stringify(this.backData)));
  }

  concel() {
    this.backData = JSON.parse(JSON.stringify(this.oldData));
    this.$emit('closeModal', this.backData);
  }

  created() {
    this.dataMounted();
  }

  dataMounted() {
    // this.gerFormList();
    // this.getWorkflowList();
    if (this.modalData.data) {
      this.backData = JSON.parse(JSON.stringify(this.modalData.data));
    } else if (this.modalData) {
      this.backData = JSON.parse(JSON.stringify(this.modalData));
    } else {
      this.backData.name = this.modalData.name;
    }
    this.backData.popover = false;

    if (
      this.workflowList &&
      this.workflowList.length > 0 &&
      !this.backData.associationCode
    ) {
      this.backData.associationflowCode = this.workflowList[0].workflowCode;
    }
    if (
      this.formList &&
      this.formList.length > 0 &&
      !this.backData.associationCode
    ) {
      this.backData.associationCode = this.formList[0].code;
    }
    this.oldData = JSON.parse(JSON.stringify(this.modalData.data));
    console.log(this.backData);
    (this.backData as any).name_i18n.en =
      zhToEn[(this.backData as any).name_i18n.en] ||
      (this.backData as any).name_i18n.en;
  }

  radioChange(event) {
    this.backData.associationCode = '';

    if (this.backData.associationType) {
      if (this.workflowList.length > 0) {
        this.backData.associationCode = this.workflowList[0].workflowCode;
      }
    } else if (this.formList.length > 0) {
      this.backData.associationCode = this.formList[0].code;
    } else {
      //Else Empty block statement
    }
  }

  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  // getWorkflowList() {
  //   const that = this;
  //   const params:Apps.Workflow.WorkflowSchemaCode = {
  //     schemaCode: this.schemaCode
  //   };
  //   workFlowApi.getWorkflowList(params).then((res:any) => {
  //     if (res.data) {
  //       that.workflowList = res.data.filter((res:any) => (!!res.published));

  //       if (that.workflowList && that.workflowList.length > 0 && !this.backData.associationCode) {
  //         this.backData.associationflowCode = that.workflowList[0].workflowCode;
  //       }
  //     }
  //   });
  // }

  // gerFormList() {
  //   const that = this;
  //   const str:string = this.schemaCode;
  //   formApi.list(str).then((res:any) => {
  //     that.formList = res.data.filter((res:any) => (!!res.published));

  //     if (that.formList && that.formList.length > 0 && !this.backData.associationCode) {
  //       this.backData.associationCode = that.formList[0].code;
  //     }
  //   });
  // }

  // @Watch('modalData')
  // onModalDataChange(v:any) {
  //   this.dataMounted();
  // }
}
</script>
<style lang="less" scoped>
.popover-wrap {
  width: 325px;
  .row-wrap {
    max-height: 168px;
    overflow-y: auto;
  }
  .row {
    margin-bottom: 16px;
    .icon {
      margin-left: 5px;
    }
    .ant-col-6 {
      label {
        line-height: 32px;
        color: rgba(17, 18, 24, 0.5);
      }
    }
    .ant-col-18 {
      .l-h {
        line-height: 32px;
      }
      .radio-group {
        width: 100%;
        .radio {
          line-height: 32px;
          margin-right: 0;
          &:first-child {
            float: left;
          }
          &:last-child {
            float: right;
          }
        }
      }
    }
    .select {
      width: 100%;
    }
  }
  .btn-group {
    .btn {
      &:last-child {
        margin-right: 8px;
      }
      float: right;
    }
    .left {
      margin-right: 16px;
    }
  }
  .empty-tip {
    color: #f5222d;
    font-size: 12px;
  }
  .input-error {
    border-color: #f5222d;
    /deep/.ant-select-selection {
      border-color: #f5222d;
    }
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="popover-wrap">
    <a-row class="row">
      <a-col :span="6">
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
        <a-checkbox
          v-if="backData.extend1 !== null"
          class="allow-link"
          :checked="extend1 === 'true'"
          @change="onChange"
        >
          允许导出附件文件为链接
        </a-checkbox>
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
import { Row, Col, Button, Checkbox, Input } from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DateType, WidthSettingType } from '../../control-modals-map';
interface DackData {
  name: string;
  name_i18n: any;
  extend1: null | string;
  [propName: string]: any;
}
@Component({
  name: 'AddBtn',
  components: {
    ARow: Row,
    ACol: Col,
    AButton: Button,
    ACheckbox: Checkbox,
    AInput: Input,
  },
})
export default class AddBtn extends Vue {
  @Prop() modalData!: any;

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  leftWidth: number = 6;

  rightWidth: number = 18;

  visible: boolean = true;

  DateType = DateType;

  WidthSettingType = WidthSettingType;

  backData: DackData = {
    name: '',
    name_i18n: {},
    extend1: null,
  };

  oldData = {
    ...this.backData,
  };

  // 是否允许附件链接
  extend1: string = 'false';

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

    // console.log(this.backData ,'backData+++++++++++++++++++++')
    if (this.backData.extend1 !== null) {
      this.backData.extend1 = this.extend1;
    }
    this.oldData = JSON.parse(JSON.stringify(this.backData));
    this.$emit('backData', JSON.parse(JSON.stringify(this.backData)));
  }

  concel() {
    if (this.backData.extend1 !== null) {
      this.extend1 = this.backData.extend1;
    }
    this.backData = JSON.parse(JSON.stringify(this.oldData));
    this.$emit('closeModal', this.backData);
  }

  created() {
    if (this.modalData) {
      this.backData = JSON.parse(JSON.stringify(this.modalData));
      //console.log('created' ,this.backData ,typeof this.backData.extend1)
      if (this.backData.extend1 !== null) {
        this.extend1 = this.backData.extend1;
      }
      this.oldData = JSON.parse(JSON.stringify(this.modalData));
      (this.backData as any).name_i18n.en =
        zhToEn[(this.backData as any).name_i18n.en] ||
        (this.backData as any).name_i18n.en;
    }
  }

  // 改变当前选项框的状态
  onChange(event: any) {
    this.extend1 = '' + event.target.checked;
  }
}
</script>
<style lang="less" scoped>
.popover-wrap {
  padding: 0 6px;
  width: 280px;
  .ant-col {
    align-items: unset;
    flex-direction: column;
  }
  .row {
    margin-bottom: 16px;
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
    }
    .allow-link {
      margin-top: 20px;
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
  input.input-error {
    border-color: #f5222d;
  }
}
</style>

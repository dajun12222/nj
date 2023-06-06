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
        <label class="title">{{ $t('languages.Apps.QrcodeForm') }}</label>
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
      <a-button class="btn" size="small" @click="concel">{{
        $t('languages.Apps.Cancel')
      }}</a-button>
    </div>
    <div></div>
  </div>
</template>
<script lang="ts">
import { Row, Col, Button, Select } from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { DateType, WidthSettingType } from '../../control-modals-map';

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'AddBtn',
  components: {
    ARow: Row,
    ACol: Col,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class AddBtn extends Vue {
  @ListdesignModule.State('formList') formList: any;

  @Prop() modalData!: any;

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  leftWidth: number = 7;

  rightWidth: number = 17;

  visible: boolean = true;

  DateType = DateType;

  WidthSettingType = WidthSettingType;

  backData = {
    name: '',
    name_i18n: {},
    associationCode: '',
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

    this.oldData = JSON.parse(JSON.stringify(this.backData));
    this.$emit('backData', JSON.parse(JSON.stringify(this.backData)));
  }

  concel() {
    this.backData = JSON.parse(JSON.stringify(this.oldData));
    this.$emit('closeModal', this.backData);
  }

  created() {
    if (this.modalData.data) {
      this.backData = JSON.parse(JSON.stringify(this.modalData.data));
    } else {
      this.backData = JSON.parse(JSON.stringify(this.modalData));
    }
    this.backData.popover = false;
    if (
      this.formList &&
      this.formList.length > 0 &&
      !this.backData.associationCode
    ) {
      this.backData.associationCode = this.formList[0].code;
    }
    this.oldData = JSON.parse(JSON.stringify(this.backData));
    (this.backData as any).name_i18n.en =
      zhToEn[(this.backData as any).name_i18n.en] ||
      (this.backData as any).name_i18n.en;
  }
}
</script>
<style lang="less" scoped>
.popover-wrap {
  padding: 0 6px;
  width: 280px;
  .row {
    margin-bottom: 16px;
    .ant-col-7 {
      label {
        line-height: 32px;
        color: rgba(17, 18, 24, 0.5);
      }
    }
    .ant-col-17 {
      .l-h {
        line-height: 32px;
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
  input.input-error {
    border-color: #f5222d;
  }
}
</style>

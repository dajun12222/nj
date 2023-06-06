<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="popover-wrap">
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DataItem') }}</label>
      </a-col>
      <a-col :span="19">
        <span class="l-h">{{
          `${
            (typeof modalData.name_i18n === 'string'
              ? JSON.parse(modalData.name_i18n)[$i18n.locale]
              : modalData.name_i18n[$i18n.locale]) ||
            modalData.name ||
            modalData.propertyName
          }[${modalData.code}]`
        }}</span>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayName') }}</label>
      </a-col>
      <a-col :span="19">
        <a-input
          v-if="isChinese"
          v-model="backData.name_i18n['zh']"
          maxlength="200"
          :class="{ 'input-error': !backData.name_i18n['zh'] }"
        />
        <a-input
          v-else
          v-model="backData.name_i18n[$i18n.locale]"
          maxlength="200"
          :class="{ 'input-error': !backData.name_i18n[$i18n.locale] }"
        />
        <div v-if="!backData.name && isChinese" class="empty-tip">
          {{ $t('languages.Apps.DisplayNameRequire') }}
        </div>
        <div
          v-if="!backData.name_i18n[$i18n.locale] && !isChinese"
          class="empty-tip"
        >
          {{ $t('languages.Apps.DisplayNameRequire') }}
        </div>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayFormat') }}</label>
      </a-col>
      <a-col :span="19" class="default">
        <a-select
          v-model="backData.displayFormat"
          class="select"
          :placeholder="$t('languages.Apps.PlzSelect')"
          :getPopupContainer="getPopupContainer"
        >
          <a-select-option
            v-for="(option, index) in formatOptions"
            :key="index"
            :value="option.type"
          >
            {{ $t(`languages.Apps.ListControl.${option.text}`) }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>

    <!-- 查询符号 -->
    <a-row class="row">
      <a-col :span="5">
        <label class="title">查询方式</label>
      </a-col>
      <a-col :span="19">
        <a-select
          v-model="backData.filterType"
          :placeholder="$t('languages.PlaceHolder.Select')"
          class="select"
        >
          <a-select-option
            v-for="(rule, index) in ruleList"
            :key="index"
            :value="rule.value"
          >
            {{ rule.name }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>

    <a-row
      v-if="!['IsNull', 'IsNotNull'].includes(backData.filterType)"
      class="row"
    >
      <a-col :span="5">
        <label class="title"> {{ $t('languages.Apps.DefaultValue') }} </label>
      </a-col>
      <a-col :span="19" class="default">
        <template v-if="['Like', 'NotLike'].includes(backData.filterType)">
          <a-input v-model="pcaData" type="text" />
        </template>

        <template v-else>
          <pca-selector
            v-model="pcaData"
            :format="format"
            :showEmpty="true"
            @change="valueChange"
          />
        </template>
      </a-col>
    </a-row>

    <!-- 不支持精确查找 -->
    <!-- <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.FindAccurately') }}</label>
      </a-col>
      <a-col :span="19">
        <a-switch v-model="backData.accurateSearch"/>
      </a-col>
    </a-row> -->

    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.Visible') }}</label>
      </a-col>
      <a-col :span="19">
        <a-switch v-model="backData.visible" />
      </a-col>
    </a-row>

    <div class="btn-group btn-group-fixed clearfix">
      <a-button class="btn" type="primary" @click="close">
        {{ $t('languages.Apps.Ok') }}
      </a-button>
      <a-button class="btn" @click="cancel">
        {{ $t('languages.Apps.Cancel') }}
      </a-button>
    </div>
    <div></div>
  </div>
</template>
<script lang="ts">
import pcaSelector from 'cloudpivot/form/src/common/components/pca-selector/pca-selector.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { addressType } from '../../control-modals-map';
import { DataItemType } from 'cloudpivot/form/schema';
import { Row, Col, Select, Button, Switch, Input } from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';

@Component({
  name: 'BooleanType',
  components: {
    pcaSelector,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button,
    ASwitch: Switch,
    AInput: Input,
  },
})
export default class Address extends Vue {
  @Prop() modalData!: any;

  @Prop() ruleList!: any[];

  @Watch('backData.filterType')
  onFilterTypeChange(value, oldValue) {
    if (
      ['Eq', 'NotEq'].includes(value) &&
      ['Like', 'NotLike'].includes(oldValue)
    ) {
      // 从包含、包含 => 等于、不等于
      this.pcaData = {};
    }
    if (
      ['Eq', 'NotEq'].includes(oldValue) &&
      ['Like', 'NotLike'].includes(value)
    ) {
      // 从等于、不等于 => 包含、包含
      this.pcaData = '';
    }
  }

  DataItemType: any = DataItemType;

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  visible: boolean = true;

  backData = {
    choiceType: '',
    defaultValue: '',
    displayType: 3,
    startValue: '',
    endValue: '',
    name: '',
    options: '',
    propertyCode: '',
    propertyType: '',
    userOptionType: '',
    visible: true,
    defaultState: 0,
    accurateSearch: false,
    displayFormat: '0',
    filterType: '',
  };

  oldData = {
    ...this.backData,
  };

  @Watch('modalData', {
    deep: true,
    immediate: true,
  })
  onBackDataChange() {
    this.oldData = JSON.parse(JSON.stringify(this.modalData.data));
  }

  pcaData: any = {};

  formatOptions: any[] = addressType;

  get format() {
    return ['pp-cc-aa', 'pp-cc', 'pp'][this.backData.displayFormat];
  }

  valueChange(val: any) {
    //
    // const value =  FromAddressValueService.setAddressVal(val.adcode);
    this.pcaData = val;
  }

  close() {
    if (this.backData.name === '') {
      return;
    }
    this.backData.propertyCode = this.modalData.code;
    this.backData.propertyType = this.modalData.type;
    if (Object.keys(this.pcaData).length > 0) {
      if (['Like', 'NotLike'].includes(this.backData.filterType)) {
        this.backData.defaultValue = this.pcaData;
      } else {
        this.backData.defaultValue = JSON.stringify(this.pcaData);
      }
    }
    this.$emit('backData', JSON.parse(JSON.stringify(this.backData)));
  }

  cancel() {
    this.backData = JSON.parse(JSON.stringify(this.oldData));
    (this.backData as any).name_i18n.zh =
      (this.backData as any).name_i18n.zh || this.backData.name;
    this.$emit('closeModal');
  }

  created() {
    if (this.modalData.data) {
      this.backData = this.modalData.data;
      if (this.backData.defaultValue) {
        try {
          this.pcaData = JSON.parse(this.backData.defaultValue);
        } catch (error) {
          this.pcaData = this.backData.defaultValue;
        }
      } else {
        this.pcaData = '';
      }

      if (typeof this.backData.displayFormat === 'number') {
        this.backData.displayFormat = (
          this.backData.displayFormat as any
        ).toString();
      }
    } else {
      this.backData.name = this.modalData.name;
    }
    (this.backData as any).name_i18n.en =
      zhToEn[(this.backData as any).name_i18n.en] ||
      (this.backData as any).name_i18n.en;
    (this.backData as any).name_i18n.zh =
      (this.backData as any).name_i18n.zh || this.backData.name;
  }

  closeModal() {
    this.$emit('cancel');
  }
}
</script>
<style lang="less" scoped>
.popover-wrap {
  padding: 0 6px;
  width: 328px;
  .row {
    margin-bottom: 16px;
    .ant-col-5 {
      label {
        line-height: 32px;
        color: rgba(17, 18, 24, 0.5);
      }
    }
    .ant-col-19 {
      .l-h {
        line-height: 32px;
      }
      .select {
        width: 100%;
      }
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

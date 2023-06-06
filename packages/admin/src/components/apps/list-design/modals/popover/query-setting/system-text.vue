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
          :placeholder="$t('languages.Apps.PleaseInputDisplayName')"
          maxlength="200"
          :class="{ 'input-error': !backData.name_i18n['zh'] }"
        />
        <a-input
          v-else
          v-model="backData.name_i18n[$i18n.locale]"
          :placeholder="$t('languages.Apps.PleaseInputDisplayName')"
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

    <!-- <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayType') }}</label>
      </a-col>
      <a-col :span="19">
        <span class="l-h">{{ $t('languages.Apps.TextBox') }}</span>
      </a-col>
    </a-row> -->

    <!-- 查询符号 -->
    <a-row class="row">
      <a-col :span="5">
        <label class="title">查询方式</label>
      </a-col>
      <a-col :span="19">
        <a-select
          v-model="backData.filterType"
          :getPopupContainer="getPopupContainer"
          :placeholder="$t('languages.PlaceHolder.Select')"
          class="select"
          @change="filterTypeChange"
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
      v-if="
        backData.displayType === 0 &&
        !['IsNull', 'IsNotNull'].includes(backData.filterType)
      "
      class="row"
    >
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DefaultValue') }}</label>
      </a-col>
      <a-col :span="19">
        <a-input v-model="backData.defaultValue" />
      </a-col>
    </a-row>

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
import { Row, Col, Switch, Input, Select, Button } from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'SystemText',
  components: {
    ARow: Row,
    ACol: Col,
    ASwitch: Switch,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button,
  },
})
export default class SystemText extends Vue {
  @Prop() modalData!: any;

  @Prop() ruleList!: any[];

  filterTypeChange(value) {
    if (['IsNull', 'IsNotNull'].includes(value)) {
      this.backData.defaultValue = '';
    }
  }

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  visible: boolean = true;

  // backData = {
  //   name: '',
  //   showType: 0,
  //   isShow: true,
  //   defaults: '',
  //   options: null
  // }
  backData: any = {
    choiceType: '',
    defaultValue: '',
    displayType: 0,
    startValue: '',
    endValue: '',
    name: '',
    options: '',
    propertyCode: '',
    propertyType: '',
    userOptionType: '',
    visible: true,
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

  close() {
    if (this.backData.name === '') {
      return;
    }
    this.backData.propertyCode = this.modalData.code;
    this.backData.propertyType = this.modalData.type;
    this.$emit('backData', JSON.parse(JSON.stringify(this.backData)));
  }

  cancel() {
    this.backData = JSON.parse(JSON.stringify(this.oldData));
    (this.backData as any).name_i18n.zh =
      (this.backData as any).name_i18n.zh || this.backData.name;
    this.$emit('closeModal');
  }

  closeModal() {
    this.$emit('cancel');
  }

  created() {
    if (this.modalData.data) {
      this.backData = this.modalData.data;
    } else {
      this.backData.name = this.modalData.name;
    }
    (this.backData as any).name_i18n.en =
      zhToEn[(this.backData as any).name_i18n.en] ||
      (this.backData as any).name_i18n.en;
    (this.backData as any).name_i18n.zh =
      (this.backData as any).name_i18n.zh || this.backData.name;
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
.select {
  width: 100%;
}
</style>

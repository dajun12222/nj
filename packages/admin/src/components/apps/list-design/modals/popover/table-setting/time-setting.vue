<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="popover-wrap">
    <a-row class="row">
      <a-col :span="leftWidth">
        <label class="title">{{ $t('languages.Apps.DataItem') }}</label>
      </a-col>
      <a-col :span="rightWidth">
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
      <a-col :span="6">
        <label class="title">{{ $t('languages.Apps.DisplayName') }}</label>
      </a-col>
      <a-col :span="rightWidth">
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
      <a-col :span="leftWidth">
        <label class="title">{{ $t('languages.Apps.DisplayFormat') }}</label>
      </a-col>
      <a-col :span="rightWidth">
        <a-select
          v-model="backData.displayFormat"
          class="select"
          :placeholder="$t('languages.PlaceHolder.Select')"
          :getPopupContainer="getPopupContainer"
        >
          <a-select-option
            v-for="(option, index) in TimeType"
            :key="index"
            :value="option.type"
          >
            {{ $t(`languages.Apps.ListControl.${option.text}`) }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <!-- <a-row class="row">
        <a-col :span="leftWidth">
          <label class="title">列宽设置</label>
        </a-col>
        <a-col :span="rightWidth">
          <div class="width-setting">
            <div>
              <a-input class="input" v-model="backData.width"/>
            </div>
            <div>
              <a-select
                class="select"
                :placeholder="$t('languages.PlaceHolder.Select')"
                v-model="backData.unit"
              >
                <a-select-option
                  v-for="(option, index) in WidthSettingType"
                  :key="index"
                  :value="option.type"
                >{{ $t(`languages.Apps.ListControl.${option.text}`) }}</a-select-option>
              </a-select>
            </div>
          </div>
        </a-col>
      </a-row> -->
    <div class="btn-group btn-group-fixed clearfix">
      <a-button class="btn" type="primary" size="small" @click="close">
        {{ $t('languages.Apps.Ok') }}
      </a-button>
      <a-button class="btn" size="small" @click="cancel">
        {{ $t('languages.Apps.Cancel') }}
      </a-button>
    </div>
    <div></div>
  </div>
</template>
<script lang="ts">
import { Col, Input, Row, Button, Select } from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { TimeType, WidthSettingType } from '../../control-modals-map';
@Component({
  name: 'TimeSetting',
  components: {
    ARow: Row,
    ACol: Col,
    AInput: Input,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class TimeSetting extends Vue {
  @Prop() modalData!: any;

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  leftWidth: number = 6;

  rightWidth: number = 18;

  visible: boolean = true;

  TimeType = TimeType;

  WidthSettingType = WidthSettingType;

  backData = {
    /*  显示格式 */
    displayFormat: '空',
    name: '',
    propertyCode: '',
    propertyType: 0,
    sumType: null,
    width: 176,
    unit: 0,
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
    this.$emit('closeModal');
  }

  closeModal() {
    this.$emit('cancel');
  }

  created() {
    if (this.modalData.data) {
      this.backData = JSON.parse(JSON.stringify(this.modalData.data));
    } else {
      this.backData.name = this.modalData.name;
    }
  }
}
</script>
<style lang="less" scoped>
.popover-wrap {
  padding: 0 6px;
  width: 280px;
  .row {
    margin-bottom: 16px;
    .ant-col-6 {
      label {
        line-height: 32px;
        color: rgba(17, 18, 24, 0.5);
      }
    }
    .ant-col-18 {
      word-break: break-all;
      .l-h {
        line-height: 32px;
      }
      .width-setting {
        & > div {
          float: left;
          &:last-child {
            float: right;
          }
        }
        .input {
          width: 97px;
        }
        .select {
          width: 97px;
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
  input.input-error {
    border-color: #f5222d;
  }
}
</style>

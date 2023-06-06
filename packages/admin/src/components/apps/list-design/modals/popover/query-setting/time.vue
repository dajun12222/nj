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
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayType') }}</label>
      </a-col>
      <a-col :span="19">
        <span class="l-h">{{ $t('languages.Apps.ScopeQuery') }}</span>
      </a-col>
    </a-row>
    <!-- 时间显示格式 -->
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayFormat') }}</label>
      </a-col>
      <a-col :span="19">
        <div class="select-wrap">
          <a-select
            v-model="backData.displayFormat"
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            :getPopupContainer="getPopupContainer"
            @change="handleValueChange"
          >
            <a-select-option
              v-for="(option, index) in dateTypeList"
              :key="index"
              :value="option.type"
            >
              {{ $t(`languages.Apps.ListControl.${option.text}`) }}
            </a-select-option>
          </a-select>
        </div>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DefaultValue') }}</label>
      </a-col>
      <a-col :span="19" class="default">
        <div class="select-wrap">
          <a-select
            v-model="backData.dateType"
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            :getPopupContainer="getPopupContainer"
          >
            <a-select-option
              v-for="(option, index) in dateDefaultTypeList"
              :key="index"
              :value="option.type"
            >
              {{ $t(`languages.Apps.ListControl.${option.text}`) }}
            </a-select-option>
          </a-select>
        </div>
        <div v-if="backData.dateType === 0">
          <div>
            <a-time-picker
              v-model="backData.startValue"
              :format="getFormat"
              :placeholder="$t('languages.Apps.StartTime')"
              style="width: 100%; margin-top: 15px"
              @change="handleStartOpenChange"
            />
            <a-time-picker
              v-model="backData.endValue"
              :format="getFormat"
              :placeholder="$t('languages.Apps.EndTime')"
              style="width: 100%; margin-top: 15px"
              @change="handleEndOpenChange"
            />
          </div>
        </div>
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
    <div></div>
  </div>
</template>
<script lang="ts">
import {
  Row,
  Col,
  Input,
  Switch,
  Select,
  Button,
  TimePicker,
} from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import moment from 'moment';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { DateDefaultType, TimeType } from '../../control-modals-map';
@Component({
  name: 'Time',
  components: {
    ARow: Row,
    ACol: Col,
    AInput: Input,
    ASwitch: Switch,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATimePicker: TimePicker,
    AButton: Button,
  },
})
export default class Time extends Vue {
  @Prop() modalData!: any;

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  dateFormat: string = 'HH:mm:ss';

  visible: boolean = true;

  endOpen: boolean = false;

  showTime: any = false;

  backData = {
    choiceType: '',
    defaultValue: '',
    displayFormat: 8,
    startValue: null,
    endValue: null,
    name: '',
    options: '',
    propertyCode: '',
    propertyType: '',
    userOptionType: '',
    visible: true,
    propertyName: '',
    dateType: 0,
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

  get dateTypeList() {
    return TimeType.slice(1);
  }

  get dateDefaultTypeList() {
    switch (this.backData.displayFormat) {
      default:
        return DateDefaultType.filter((d) => d.type === 0);
    }
  }

  get getFormat() {
    switch (this.backData.displayFormat) {
      case 7:
        return 'HH:mm';
      default:
        return 'HH:mm:ss';
    }
  }

  created() {
    this.backData = this.modalData.data;
    const { startValue, endValue, dateType } = this.modalData.data;
    this.backData.startValue = startValue || null;
    this.backData.endValue = endValue || null;
    this.backData.dateType = dateType || 0;
    if (this.backData.displayFormat) {
      this.backData.displayFormat = Number(this.backData.displayFormat);
    }
    this.setDefaultValue(this.backData.startValue, this.backData.endValue);
    (this.backData as any).name_i18n.en =
      zhToEn[(this.backData as any).name_i18n.en] ||
      (this.backData as any).name_i18n.en;
    (this.backData as any).name_i18n.zh =
      (this.backData as any).name_i18n.zh || this.backData.name;
  }

  /**
   * 设置默认值
   */
  setDefaultValue(start: any, end: any) {
    this.backData.startValue = start ? moment(start, this.dateFormat) : start;
    this.backData.endValue = end ? moment(end, this.dateFormat) : end;
  }

  handleValueChange() {
    this.backData.startValue = null;
    this.backData.endValue = null;
    this.backData.dateType = 0;
  }

  cancel() {
    this.backData = JSON.parse(JSON.stringify(this.oldData));
    (this.backData as any).name_i18n.zh =
      (this.backData as any).name_i18n.zh || this.backData.name;
    this.$emit('closeModal');
  }

  close() {
    if (this.backData.name === '') {
      return;
    }
    const backData = { ...this.backData };
    const { startValue, endValue, dateType }: any = this.backData;
    const formatType = this.getFormat;
    if (dateType === 0 && startValue && endValue) {
      const diff = startValue.diff(endValue, 'second');
      if (diff > 0) {
        this.$message.error('开始时间不能大于结束时间');
        return;
      }
    }
    backData.startValue = (
      startValue ? startValue.format(formatType) : ''
    ) as any;
    backData.endValue = (endValue ? endValue.format(formatType) : '') as any;
    console.log(JSON.stringify(backData));
    this.$emit('backData', JSON.parse(JSON.stringify(this.backData)));
  }

  closeModal() {
    this.$emit('cancel');
  }

  /**
   * 时间处理
   */
  disabledStartDate(startValue: any) {
    const { endValue } = this.backData;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > (endValue as any).valueOf();
  }

  disabledEndDate(endValue: any) {
    const { startValue } = this.backData;
    if (!endValue || !startValue) {
      return false;
    }
    return (startValue as any).valueOf() >= endValue.valueOf();
  }

  handleStartOpenChange(open: any) {
    if (!open) {
      this.endOpen = true;
    }
  }

  handleEndOpenChange(open: any) {
    this.endOpen = open;
  }
}
</script>
<style lang="less" scoped>
.popover-wrap {
  padding: 0 6px;
  width: 358px;
  overflow: visible;
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
      .date {
        width: 110px;
        margin-right: 8px;
      }
      .select-wrap {
        position: relative;
        width: 100%;
        .select {
          width: 100%;
        }
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
.ant-calendar-picker {
  margin: 5px 0 0;
}
</style>

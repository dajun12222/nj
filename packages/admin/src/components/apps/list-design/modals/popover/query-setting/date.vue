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
        <span class="l-h">{{ $t('languages.Apps.ScopeQuery') }}</span>
      </a-col>
    </a-row> -->

    <!-- 日期显示格式 -->
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
        <!-- <label class="title">同步默认格式</label> -->
      </a-col>
      <a-col :span="19">
        <div class="select-wrap">
          <a-checkbox :checked="syncFlag" @change="onsyncChange">
            同步默认格式
          </a-checkbox>
          <span
            style="
              display: block;
              font-size: 12px;
              color: rgba(17, 18, 24, 0.5);
              margin-top: 8px;
            "
          >
            即与数据模型日期默认格式保持一致
          </span>
        </div>
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
          :getPopupContainer="getPopupContainer"
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

    <template v-if="['Between', 'NotBetween'].includes(backData.filterType)">
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
        </a-col>
      </a-row>

      <a-row v-if="backData.dateType === 0" class="row DefaultRow">
        <a-col :span="5">
          <!-- <label class="title">{{ $t('languages.Apps.DefaultValue') }}</label> -->
        </a-col>
        <a-col :span="19" class="default">
          <div>
            <div v-if="backData.displayFormat === 4">
              <a-month-picker
                v-model="backData.startValue"
                :placeholder="$t('languages.Apps.StartTime')"
                :getCalendarContainer="getPopupContainer"
                @openChange="handleStartOpenChange"
              />
            </div>
            <div v-else-if="backData.displayFormat === 5">
              <a-date-picker
                v-model="backData.startValue"
                :mode="'year'"
                :format="getFormat"
                :open="yearStartOpen"
                :placeholder="$t('languages.Apps.StartTime')"
                :getCalendarContainer="getPopupContainer"
                @openChange="handleYearStartOpenChange"
                @panelChange="startPanelChange"
              />
            </div>
            <div v-else>
              <a-date-picker
                v-model="backData.startValue"
                :showTime="showTime"
                :format="getFormat"
                :placeholder="$t('languages.Apps.StartTime')"
                :getCalendarContainer="getPopupContainer"
                @openChange="handleStartOpenChange"
              />
            </div>
          </div>
        </a-col>
      </a-row>

      <a-row v-if="backData.dateType === 0" class="row DefaultRow">
        <a-col :span="5">
          <div class="tips">
            <span>
              <span>至</span>
            </span>
          </div>
        </a-col>
        <a-col :span="19" class="default">
          <div>
            <div v-if="backData.displayFormat === 4">
              <a-month-picker
                v-model="backData.endValue"
                :placeholder="$t('languages.Apps.EndTime')"
                :open="endOpen"
                :getCalendarContainer="getPopupContainer"
                @openChange="handleEndOpenChange"
              />
            </div>
            <div v-else-if="backData.displayFormat === 5">
              <a-date-picker
                v-model="backData.endValue"
                :placeholder="$t('languages.Apps.EndTime')"
                :mode="'year'"
                :format="getFormat"
                :open="yearEndOpen"
                :getCalendarContainer="getPopupContainer"
                @openChange="handleYearEndOpenChange"
                @panelChange="endPanelChange"
              />
            </div>
            <div v-else>
              <a-date-picker
                v-model="backData.endValue"
                :showTime="showTime"
                :format="getFormat"
                :placeholder="$t('languages.Apps.EndTime')"
                :open="endOpen"
                :getCalendarContainer="getPopupContainer"
                @openChange="handleEndOpenChange"
              />
            </div>
          </div>
        </a-col>
      </a-row>
    </template>
    <template v-else>
      <a-row class="row">
        <a-col :span="5">
          <label class="title">{{ $t('languages.Apps.DefaultValue') }}</label>
        </a-col>
        <a-col :span="19" class="default">
          <div class="picker-wrapper">
            <div v-if="backData.displayFormat === 4">
              <a-month-picker
                v-model="backData.startValue"
                :placeholder="$t('languages.Apps.PlzSelect')"
                :getCalendarContainer="getPopupContainer"
                @openChange="handleStartOpenChange"
              />
            </div>
            <div v-else-if="backData.displayFormat === 5">
              <a-date-picker
                v-model="backData.startValue"
                :mode="'year'"
                :format="getFormat"
                :open="yearStartOpen"
                :placeholder="$t('languages.Apps.PlzSelect')"
                :getCalendarContainer="getPopupContainer"
                @openChange="handleYearStartOpenChange"
                @panelChange="startPanelChange"
              />
            </div>
            <div v-else>
              <a-date-picker
                v-model="backData.startValue"
                :showTime="showTime"
                :format="getFormat"
                :placeholder="$t('languages.Apps.PlzSelect')"
                :getCalendarContainer="getPopupContainer"
                @openChange="handleStartOpenChange"
              />
            </div>
          </div>
        </a-col>
      </a-row>
    </template>

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
  DatePicker,
  Col,
  Select,
  Switch,
  Checkbox,
  Input,
  Button,
} from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import moment from 'moment';
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import { DateDefaultType, DateType } from '../../control-modals-map';
@Component({
  name: 'Date',
  components: {
    ARow: Row,
    ADatePicker: DatePicker,
    AMonthPicker: DatePicker.MonthPicker,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASwitch: Switch,
    ACheckbox: Checkbox,
    AInput: Input,
    AButton: Button,
  },
})
export default class DateComponent extends Vue {
  @Prop() modalData!: any;

  @Prop() ruleList!: any[];

  get isBetween() {
    // 查询符号是： 介于/不介于
    return ['Between', 'NotBetween'].includes(this.backData.filterType);
  }

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  dateFormat: string = 'YYYY/MM/DD';

  visible: boolean = true;

  endOpen: boolean = false;

  showTime: any = false;

  backData = {
    choiceType: '',
    defaultValue: '',
    displayFormat: 4,
    displayType: 4,
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
    filterType: '',
  };

  oldData = {
    ...this.backData,
  };

  yearStartOpen: boolean = false;

  yearEndOpen: boolean = false;

  @Watch('modalData', {
    deep: true,
    immediate: true,
  })
  onBackDataChange() {
    this.oldData = JSON.parse(JSON.stringify(this.modalData.data));
    if (this.oldData && this.oldData.displayFormat) {
      this.oldData.displayFormat = Number(this.oldData.displayFormat);
    }
  }

  get dateTypeList() {
    return DateType.slice();
  }

  get dateDefaultTypeList() {
    switch (this.backData.displayFormat) {
      case 1:
      case 2:
      case 3:
        return DateDefaultType;
      case 4:
      case 5:
        return DateDefaultType.filter((d) => d.type === 0);
      case 9:
      case 10:
      case 11:
      case 12:
        return DateDefaultType;
      default:
        break;
    }
  }

  get getFormat() {
    console.log(this.backData.displayFormat);
    switch (this.backData.displayFormat) {
      case 1:
        this.showTime = false;
        return 'YYYY-MM-DD';
      case 2:
        this.showTime = { format: 'HH:mm:ss' };
        return 'YYYY-MM-DD HH:mm:ss';
      case 5:
        return 'YYYY';
      case 3:
      case 9:
      case 10:
      case 11:
      case 12:
        this.showTime = { format: 'HH:mm' };
        return 'YYYY-MM-DD HH:mm';
      default:
        break;
    }
  }

  @Inject()
  getDraftAttributesJson!: Function;

  @Inject()
  getFormatedFieldsData!: Function;

  onsyncChange(flag: any) {
    const boo = flag.target.checked;
    if (boo) {
      this.$set(this.backData, 'displayFormat', this.format.type);
    } else {
      // 关闭开关时若不存在显示格式则取默认格式
      this.format1
        ? this.$set(this.backData, 'displayFormat', this.format1.type)
        : this.$set(this.backData, 'displayFormat', this.format.type);
    }
    this.syncFlag = boo;
  }

  syncFlag: boolean = false;

  format: any = null;

  format1: any = null;

  // 设置是否打开同步按钮
  isDefaultFormatEnabled() {
    this.syncFlag = this.format.type === this.backData.displayFormat;
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

    // 获取表单配置
    const draftAttributesJson = this.getDraftAttributesJson();
    const options =
      draftAttributesJson[this.modalData.code] &&
      draftAttributesJson[this.modalData.code].options;
    try {
      let option: any = this.getFormatedFieldsData().find(
        (el: any) => el.code === this.modalData.code,
      ).options;
      option = JSON.parse(option);
      options.format = option.format;
    } catch (error) {}

    if (options) {
      this.format = DateType.slice().find(
        (el: any) => el.format === options.format,
      );
      this.format1 = DateType.slice().find(
        (el: any) => el.format === options.format1,
      );
      this.isDefaultFormatEnabled();
    }
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
    this.isDefaultFormatEnabled();
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
    let formatType = this.getFormat;
    if (backData.displayFormat === 4) {
      formatType = 'YYYY-MM';
    }
    if (dateType === 0 && startValue && endValue) {
      if (
        moment(startValue.format(this.getFormat)).isAfter(
          endValue.format(this.getFormat),
        )
      ) {
        this.$message.error('开始时间不能大于结束时间');
        return;
      }
    }
    backData.startValue = (
      startValue ? startValue.format(formatType) : ''
    ) as any;
    backData.endValue = (endValue ? endValue.format(formatType) : '') as any;
    this.$emit('backData', JSON.parse(JSON.stringify(backData)));
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

  handleYearStartOpenChange(open: any) {
    this.yearStartOpen = open;
  }

  startPanelChange(value, mode) {
    this.backData.startValue = value;
    this.yearStartOpen = false;
    this.yearEndOpen = true;
  }

  handleYearEndOpenChange(open: any) {
    this.yearEndOpen = open;
  }

  endPanelChange(value, mode) {
    this.backData.endValue = value;
    this.yearEndOpen = false;
  }
}
</script>
<style lang="less" scoped>
.tips {
  position: relative;
  & > span {
    font-size: 12px;
    position: absolute;
    width: 21px;
    height: 21px;
    color: #111218;
    border-radius: 50%;
    line-height: 21px;
    text-align: center;
    background: #e8e8e8;
    right: -308px;
    top: -34px;
    span {
      position: relative;
      z-index: 2;
    }
    &::before {
      content: '';
      position: absolute;
      width: 26px;
      height: 56px;
      border: 1px solid #e8e8e8;
      border-left: none;
      top: 50%;
      transform: translateY(-50%);
      right: 10px;
    }
  }
}
.popover-wrap {
  padding: 0 6px;
  width: 358px;
  overflow: visible;

  /deep/.ant-calendar-picker {
    margin: 0;
  }
  .row {
    margin-bottom: 16px;
    .picker-wrapper {
      width: 100%;
      /deep/.ant-calendar-picker {
        width: 100%;
      }
    }
    &.DefaultRow /deep/input {
      width: 201px;
    }
    .select {
      width: 100%;
    }
    .ant-col-5 {
      label {
        line-height: 32px;
        color: rgba(17, 18, 24, 0.5);
      }
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

.ant-calendar-picker {
  margin: 5px 0 0;
}
</style>

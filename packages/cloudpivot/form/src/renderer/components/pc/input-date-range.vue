<template>
  <div class="date-range">
    <a-range-picker
      v-if="!readonly"
      v-model="dates"
      :placeholder="[
        $t('cloudpivot.form.renderer.startTime'),
        $t('cloudpivot.form.renderer.endTime'),
      ]"
      style="width: 100%"
      :ranges="getRanges"
      :showTime="getShowTime"
      :format="getFormat"
      :mode="getMode"
      :open="open"
      @change="onChange"
      @panelChange="onPanelChange"
      @openChange="onOpenChange"
    >
      <!-- 当日期控件为月份控件时，页脚添加确定按钮 -->
      <template v-if="getMode.length > 0" slot="renderExtraFooter">
        <a-button
          type="primary"
          size="small"
          class="footer-btn"
          :disabled="disabled"
          @click="handleFooterBtn"
        >
          确定
        </a-button>
      </template>
      <template v-else slot="renderExtraFooter"> </template>
    </a-range-picker>

    <div v-else>
      <template v-if="ctrl.value">
        <span>{{ ctrl.value[0] }}</span> ~ <span>{{ ctrl.value[1] }}</span>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { DatePicker } from '@h3/antd-vue';
import moment from 'moment';
import { Component } from 'vue-property-decorator';
import { DateInputControl } from '../../controls';
import { dateFormatter } from '../../utils/date-formatter';
import common from '../../../../../common/mobile';

const GetDateHandle = common.utils.GetDateHandle;

@Component({
  name: 'input-date-range',
  components: {
    ARangePicker: DatePicker.RangePicker,
  },
})
export default class InputDateRange extends DateInputControl {
  dates: moment.Moment[] = [];

  open: boolean = false;

  get getMode() {
    const displayFormat: string = this.control.options.displayFormat || '';
    switch (Number(displayFormat)) {
      case 4:
        return ['month', 'month'];
      case 5:
        return ['year', 'year'];
      default:
        return [];
    }
  }

  get getShowTime() {
    const displayFormat: string = this.control.options.displayFormat || '';
    switch (Number(displayFormat)) {
      case 2:
        return { format: 'HH:mm:ss' };
      case 3:
        return { format: 'HH:mm' };
      case 4:
        return false;
      case 9:
        return { format: 'HH:mm' };
      case 10:
        return { format: 'HH:mm' };
      case 11:
        return { format: 'HH:mm' };
      case 12:
        return { format: 'HH:mm' };
      default:
        return false;
    }
  }

  get getFormat() {
    const displayFormat: string = this.control.options.displayFormat || '';
    switch (Number(displayFormat)) {
      case 2:
        return 'YYYY-MM-DD HH:mm:ss';
      case 3:
        return 'YYYY-MM-DD HH:mm';
      case 4:
        return 'YYYY-MM';
      case 5:
        return 'YYYY';
      case 6:
        return 'MM-DD';
      case 7:
        return 'HH:mm';
      case 8:
        return 'HH:mm:ss';
      case 9:
        return 'YYYY-MM-DD HH:mm';
      case 10:
        return 'YYYY-MM-DD HH:mm';
      case 11:
        return 'YYYY-MM-DD HH:mm';
      case 12:
        return 'YYYY-MM-DD HH:mm';
      default:
        return 'YYYY-MM-DD';
    }
  }

  get getRanges() {
    const displayFormat = this.control.options.displayFormat || '';
    switch (Number(displayFormat)) {
      case 4:
        return {
          本月: [moment().startOf('month'), moment().endOf('month')],
          上月: [
            moment()
              .month(moment().month() - 1)
              .startOf('month'),
            moment()
              .month(moment().month() - 1)
              .endOf('month'),
          ],
          本季度: [moment().startOf('quarter'), moment().endOf('quarter')],
          本年度: [moment().startOf('year'), moment().endOf('year')],
        };
      case 5:
        return {
          本年度: [moment().startOf('year'), moment().endOf('year')],
        };
      default:
        return {
          最近一周: [
            moment(GetDateHandle.getLatelyWeek()).startOf('days'),
            moment().endOf('days'),
          ],
          最近一月: [
            moment(GetDateHandle.getLatelyMonth()).startOf('days'),
            moment().endOf('days'),
          ],
          最近一季度: [
            moment(GetDateHandle.getLatelyQuarter()).startOf('days'),
            moment().endOf('days'),
          ],
          最近一年: [
            moment(GetDateHandle.getLatelyYear()).startOf('days'),
            moment().endOf('days'),
          ],
          此刻: [moment().startOf('days'), moment().endOf('days')],
          本周: [moment().startOf('week'), moment().endOf('week')],
          本月: [moment().startOf('month'), moment().endOf('month')],
          本季度: [moment().startOf('quarter'), moment().endOf('quarter')],
          本年度: [moment().startOf('year'), moment().endOf('year')],
        };
    }
  }

  get disabled() {
    return !(this.dates[0] && this.dates[1]);
  }

  setDates() {
    if (this.ctrl && Array.isArray(this.ctrl.value)) {
      (this.dates as any) = this.ctrl.value.map((s: string) => {
        if (s) {
          return moment(s);
        }
        return s;
      });
    } else {
      this.dates = [];
    }
  }

  setControl() {
    this.setDates();
  }

  handleValueChange(value: any): void {
    this.setDates();
  }

  onChange(dates: moment.Moment[], dateStrings: string[]) {
    this.ctrl.value =
      dateStrings && dateStrings.length > 0 ? dateStrings : null;
  }

  onPanelChange(value, mode) {
    this.ctrl.value = value.map((v: any) => {
      return dateFormatter(v._d, this.getFormat);
    });
  }

  onOpenChange(status) {
    if (status) {
      this.open = true;
    } else {
      this.open = false;
    }
  }

  handleFooterBtn() {
    this.open = false;
  }
}
</script>

<style lang="less">
.footer-btn {
  position: absolute;
  right: 12px;
  bottom: 7px;
}

.value {
  .date-range {
    .ant-calendar-picker-input {
      height: 76px;
      display: flex;
      flex-direction: column;
      border: none;
      padding: 0;
      padding-right: 0 !important;
      position: relative;
      overflow: unset;
      .ant-calendar-range-picker-input {
        height: 32px;
        width: 91.66666667%;
      }

      .ant-calendar-range-picker-separator {
        // display: none;
        height: 12px;
        color: transparent;
        position: relative;
        &::after {
          content: '\81f3';
          position: absolute;
          color: rgba(0, 0, 0, 0.85);
          left: 261px;
          top: 50%;
          transform: translateY(-50%);
          width: 21px;
          height: 21px;
          text-align: center;
          line-height: 21px;
          border-radius: 50%;
          background-color: #e8e8e8;
          font-size: 12px;
        }
        &::before {
          content: '';
          position: absolute;
          width: 23px;
          height: 46px;
          border: 1px solid #e8e8e8;
          border-left: none;
          left: 249px;
          top: 50%;
          transform: translateY(-50%);
        }
      }

      input {
        border: 1px solid #d4d5d6;
        height: 32px;
        width: 260px;
        text-align: left;
        padding: 0 10px;
        border-radius: 2px;
        &::-webkit-input-placeholder {
          font-size: 12px;
        }
      }
    }
  }
}
</style>

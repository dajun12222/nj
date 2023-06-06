<template>
  <div v-if="!readonly">
    <a-time-picker
      v-model="val"
      :format="controlOpts.format1"
      :placeholder="placeholder"
      style="width: 100%"
      @change="onChange"
    />
  </div>
  <span v-else>{{ text }}</span>
</template>

<script lang="ts">
import { TimeInputControl } from '../../../../../form/src/common/controls/input-controls/time-input-control';
import { TimePicker } from '@h3/antd-vue';
import { ControlPropertyChange, TimeControl } from 'cloudpivot-forms';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { Component } from 'vue-property-decorator';

@Component({
  name: 'pc-input-time',
  components: {
    ATimePicker: TimePicker,
  },
})
export default class PcInputTime extends TimeInputControl {
  val: any = '';

  text = '';

  private _min!: any;

  private _max!: any;

  subscription?: Subscription;

  setControl() {
    this.initMinAndMax();

    const _ctrl = this.ctrl as TimeControl;

    if (!_ctrl) {
      return;
    }

    if (_ctrl.value) {
      this.val = moment(_ctrl.value, this.format);
      if (moment.isMoment(_ctrl.value)) {
        this.text = _ctrl.value.format(this.format);
      } else {
        this.text = _ctrl.value;
      }
    } else {
      this.val = this.text = '';
    }

    if (_ctrl.min) {
      this._min = moment(_ctrl.min, this.format);
    }

    if (_ctrl.max) {
      this._max = moment(_ctrl.max, this.format);
    }

    this.unsubscribe();

    this.subscription = _ctrl.propertyChange.subscribe(
      (change: ControlPropertyChange) => {
        switch (change.name) {
          case 'value':
            if (change.value) {
              this.val = moment(change.value, this.format);
              if (moment.isMoment(change.value)) {
                this.text = change.value.format(this.format);
              } else {
                this.text = change.value;
              }
            } else {
              this.val = '';
            }
            break;
          case 'min':
            if (change.value) {
              this._min = moment(change.value, this.format);
            } else {
              this._min = moment('00:00:00', this.format);
            }
            break;
          case 'max':
            if (change.value) {
              this._max = moment(change.value, this.format);
            } else {
              this._max = moment('23:59:59', this.format);
            }
            break;
          default:
            break;
        }
      },
    );
  }

  initMinAndMax() {
    const min = this.controlOpts.minDate;
    if (!min) {
      this._min = moment('00:00:00', this.format);
    } else {
      this._min = moment(min, this.format);
    }

    const max = this.controlOpts.maxDate;
    if (!max) {
      this._max = moment('23:59:59', this.format);
    } else {
      this._max = moment(max, this.format);
    }
  }

  onChange(date: moment.Moment, dateString: string) {
    // dateString 是格式化的，使用格式化后的日期字符串构建日期对象，可以过滤掉格式外多余的时分秒值
    const val = dateString ? moment(date, this.controlOpts.format1) : null;
    this.setValue(val);
  }

  disabledHours(val) {}

  disabledMinutes(val) {}

  disabledSeconds(val) {}

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  destroyed() {
    super.destroyed();

    this.unsubscribe();
  }
}
</script>

<style lang="less" scoped></style>

<template>
  <span v-if="readonly">{{ text }}</span>
  <h3-input-number
    v-else
    v-model="val"
    :ctrl="ctrl"
    :isMobile="mobile"
    :controlOpts="controlOpts"
    :class="[{ mobileShow: mobile }, control.key]"
    :placeholder="mobile && readonlyFormula ? '' : placeholder"
    :disabled="readonlyFormula"
    style="width: 100%"
    @keydown="onKeydown"
    @change="onChange"
    @blur="onBlur"
    @format="format"
    @focus="onFocus"
  />
</template>

<script lang="ts">
import { NumberFormatType } from '../../../../../form/schema';
import { NumberInputControl } from '../../../../../form/src/common/controls/input-controls/number-input-control';
import numberFilter from '../../../../../form/utils/number-filter';
import * as numberFormatter from '../../../../../form/utils/number-formatter';
import { NumberControl } from 'cloudpivot-forms';
import { Subscription } from 'rxjs';
import { Component, Prop, Inject, Watch } from 'vue-property-decorator';
import H3InputNumber from './h3-input-number.vue';
@Component({
  name: 'input-number',
  components: {
    H3InputNumber,
  },
  filters: {
    number: numberFilter,
  },
})
export default class PcInputNumber extends NumberInputControl {
  @Inject()
  layoutTypeFn!: Function;

  val: any = '';

  text: string = '';

  subscription?: Subscription;

  focused = false;

  @Prop({
    default: false,
  })
  mobile!: boolean;

  setControl() {
    const _ctrl = this.ctrl as NumberControl;
    this.val = _ctrl.hasValue ? _ctrl.value : '';
    if (this.readonly) {
      this.formatNumber();
    }
  }

  formatNumber() {
    if (!this.readonly) {
      if (!this.focused && this.$el) {
        const input = this.$el.querySelector('input');
        if (input) {
          this.format(input);
        }
      }
    } else {
      //查看模式
      if (
        typeof this.formatter() === 'string' &&
        this.formatter().includes('%')
      ) {
        this.text = this.numberToDisplay(
          this.accMul(this.val, 100),
          'format1',
          'beforeFormat1Change',
        );
      } else {
        this.text = this.formatter();
      }
    }
  }

  handleValueChange(value: any): void {
    const _ctrl = this.ctrl as NumberControl;

    this.$emit('change', _ctrl.value);
    this.val = _ctrl.hasValue ? (_ctrl.value as any) : null;
    this.formatNumber();
  }

  // @Watch("val", {
  //   immediate: true
  // })
  // onValueChange(val: any) {
  //   if (val !== "" && val !== null) {
  //     val = Number(val);
  //   }
  //   if (typeof val === "number" && !Number.isNaN(val)) {
  //     // this.ctrl.value = val;
  //     this.setValue(this.typeTrans(val));
  //     this.val = this.typeTrans(val);
  //   } else {
  //     this.ctrl.value = null;
  //     this.val = "";
  //   }
  // }

  onChange(val: any) {
    if (val !== '' && val !== null) {
      val = Number(val);
    }
    if (typeof val === 'number' && !Number.isNaN(val)) {
      this.setValue(this.typeTrans(val));
      this.val = this.typeTrans(val);
    } else {
      this.val = '';
      this.setValue(null);
    }
  }

  onKeydown(evt: KeyboardEvent) {
    const ft = this.controlOpts.format1;
    if (ft === NumberFormatType.Int || ft === NumberFormatType.Ratio) {
      if (evt.key === '.') {
        evt.preventDefault();
      }
    }
  }

  onBlur(evt: KeyboardEvent) {
    this.focused = false;
    const input = evt.target as HTMLInputElement;
    this.format(input);
    this.$emit('blur');
  }

  onFocus(evt: KeyboardEvent) {
    this.focused = true;
    //若输入框是带有%号的格式需要进行转换格式
    if (
      this.controlOpts.format1 &&
      this.controlOpts.format1.includes('ratio') &&
      typeof super.formatter() === 'string'
    ) {
      this.changeFormat1();
    }
    setTimeout(() => {
      const input = evt.target as HTMLInputElement;
      input.value = this.val;
    }, 100);
    this.$emit('focus');
  }

  format(input: HTMLInputElement) {
    const format = super.formatter();
    this.setValue(this.ctrl.value);
    if (
      this.controlOpts.format1 &&
      this.controlOpts.format1.includes('ratio') &&
      typeof format === 'string' &&
      !['', null, undefined].includes(this.val)
    ) {
      setTimeout(() => {
        let val: any;
        if (this.controlOpts.isFlag) {
          val = this.numberToDisplay(
            this.accMul(this.val, 100),
            'format1',
            'afterFormat1Change',
          );
        } else {
          val = this.numberToDisplay(
            this.accMul(this.val, 100),
            'format1',
            'beforeFormat1Change',
          );
        }
        return (input.value = val);
      }, 100);
    } else {
      // 设置500ms 兼容ie浏览器有时无法渲染格式化值问题
      setTimeout(() => {
        return (input.value = format);
      }, 100);
    }
  }

  /*
   *乘法函数，用来得到精确的乘法结果
   *说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
   *调用：accMul(arg1,arg2)
   *返回值：arg1乘以arg2的精确结果
   */
  accMul(arg1, arg2) {
    let numbers: any = arg1;
    const tmpVal: any = '' + arg1;
    const ee = tmpVal.replace(/[\d.-]/g, '');
    let rOpen: boolean = false;
    if (ee) {
      if (ee === 'E' || ee === 'e') {
        rOpen = true;
        let pos = tmpVal.indexOf('E');
        if (pos === -1) {
          pos = tmpVal.indexOf('e');
        }
        const power = tmpVal.substr(pos + 1);
        if (power === '') {
          const baseValue = tmpVal.substr(0, pos);
          numbers = baseValue;
          // 不调⽤Number函数了，防⽌转换为科学计数法了
        } else {
          const baseValue = tmpVal.substr(0, pos);
          const character = power.substr(0, 1);
          if (character === '-') {
            let times = power.substr(1);
            if (times === '' || times === '0') {
              numbers = baseValue;
              // 不调⽤Number函数了，防⽌转换为科学计数法了
            } else {
              times = Number(times);
              const baseValueLength = baseValue.length;
              const floatLength = baseValue.indexOf('.') + 1;
              const length = baseValueLength - floatLength;
              numbers = arg1.toFixed(length + times);
              if (numbers) {
                numbers = numbers.substr(
                  numbers.lastIndexOf('.') + 3,
                  numbers.length,
                );
                numbers = '0.' + numbers;
              }
              // 这⾥只能以字符串形式输出了，不能再调⽤Number函数
            }
          } else {
            const powerVal = Math.pow(10, power);
            numbers = baseValue * powerVal;
          }
        }
      }
    }
    arg1 = numbers;
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split('.')[1].length;
    } catch (e) {}
    try {
      m += s2.split('.')[1].length;
    } catch (e) {}
    return rOpen
      ? arg1
      : (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) /
          Math.pow(10, m);
  }

  /**
   * 前端处理百分数
   * 百分数输入时需要在小数点后面补两位小数
   * 例如：20.0%，输入时：1.234
   * 20.00%，输入时：1.2345
   * .....
   */
  changeFormat1() {
    if (!this.controlOpts.isFlag) {
      switch (this.controlOpts.format1) {
        case 'ratio':
          this.controlOpts.format1 = NumberFormatType.Ratio3;
          break;
        case 'ratio.tenths':
          this.controlOpts.format1 = NumberFormatType.Ratio4;
          break;
        case 'ratio.percentile':
          this.controlOpts.format1 = NumberFormatType.Ratio5;
          break;
        case 'ratio.Millimeter':
          this.controlOpts.format1 = NumberFormatType.Ratio6;
          break;
        case 'ratio.tenThousand':
          this.controlOpts.format1 = NumberFormatType.Ratio7;
          break;
        case 'ratio.hundredThousand':
          this.controlOpts.format1 = NumberFormatType.Ratio8;
          break;
        case 'ratio.millionDecimals':
          this.controlOpts.format1 = NumberFormatType.Ratio9;
          break;
        default:
          break;
      }
      this.controlOpts.isFlag = true;
    }
  }

  /**
   * 展示百分比格式化
   */
  numberToDisplay(value: any, filed, type: string) {
    let result: any = value;
    if (type === 'afterFormat1Change') {
      switch (this.controlOpts[filed]) {
        case 'ratio.percentile':
          result = numberFormatter.ratio.formatter(result, {
            precision: 0,
          });
          break;
        case 'ratio.Millimeter':
          result = numberFormatter.ratio.formatter(result, {
            precision: 1,
          });
          break;
        case 'ratio.tenThousand':
          result = numberFormatter.ratio.formatter(result, {
            precision: 2,
          });
          break;
        case 'ratio.hundredThousand':
          result = numberFormatter.ratio.formatter(result, {
            precision: 3,
          });
          break;
        case 'ratio.millionDecimals':
          result = numberFormatter.ratio.formatter(result, {
            precision: 4,
          });
          break;
        case 'ratio.tenMillionDecimals':
          result = numberFormatter.ratio.formatter(result, {
            precision: 5,
          });
          break;
        case 'ratio.billionDecimals':
          result = numberFormatter.ratio.formatter(result, {
            precision: 6,
          });
          break;
        default:
          break;
      }
    } else {
      switch (this.controlOpts[filed]) {
        case 'ratio':
        case 'ratio':
        case 'ratio':
          result = numberFormatter.ratio.formatter(result, {
            precision: 0,
          });
          break;
        case 'ratio.tenths':
          result = numberFormatter.ratio.formatter(result, {
            precision: 1,
          });
          break;
        case 'ratio.percentile':
          result = numberFormatter.ratio.formatter(result, {
            precision: 2,
          });
          break;
        case 'ratio.Millimeter':
          result = numberFormatter.ratio.formatter(result, {
            precision: 3,
          });
          break;
        case 'ratio.tenThousand':
          result = numberFormatter.ratio.formatter(result, {
            precision: 4,
          });
          break;
        case 'ratio.hundredThousand':
          result = numberFormatter.ratio.formatter(result, {
            precision: 5,
          });
          break;
        case 'ratio.millionDecimals':
          result = numberFormatter.ratio.formatter(result, {
            precision: 6,
          });
          break;
        case 'ratio.tenMillionDecimals':
          result = numberFormatter.ratio.formatter(result, {
            precision: 7,
          });
          break;
        case 'ratio.billionDecimals':
          result = numberFormatter.ratio.formatter(result, {
            precision: 8,
          });
          break;
        default:
          break;
      }
    }
    return result;
  }
  // doFormat() {
  //   if (typeof this.ctrl.value === "number") {
  //     const input = this.$el.querySelector("input");
  //     if (input) {
  //       this.format(input);
  //     }
  //   }
  // }

  // mounted() {
  //   this.$nextTick(() => {
  //     this.doFormat();
  //   })
  // }

  destroyed() {
    super.destroyed();
  }

  // @Watch("readonly")
  // onWritableChange() {
  //   if (!this.ctrl.readonly) {
  //     this.$nextTick(() => {
  //       this.doFormat();
  //     });
  //   }
  // }
}
</script>

<style lang="less">
.mobileShow {
  input {
    background: #ffffff;
  }
}
</style>

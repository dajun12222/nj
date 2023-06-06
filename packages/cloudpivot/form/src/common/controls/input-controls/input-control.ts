import { InputControlOptions } from '../.././../schema';
import { BaseControl } from '../base-control';
export abstract class InputControl<
  T extends InputControlOptions,
> extends BaseControl<T> {
  get placeholder() {
    //只读状态下不显示提示文字
    return !this.readonlyFormula
      ? (this.controlOpts as any).placeholder || '请选择'
      : '';
  }
}

import { TimeControl } from 'cloudpivot-forms';
import * as typings from '../.././../schema';
import { InputControl } from './input-control';
export abstract class TimeInputControl extends InputControl<typings.TimeOptions> {
  get format() {
    const format = this.controlOpts.format1;
    if (!format) {
      return 'HH:mm:ss';
    }
    return format;
  }

  get timeCtrl() {
    return this.ctrl as TimeControl;
  }

  // get text(){
  //   if(this.ctrl.value){
  //     return dateFormatter(this.ctrl.value, this.format);
  //   }
  // }
}

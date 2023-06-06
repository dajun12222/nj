/*
 * @Author: panwl
 * @Date: 2020-04-22 18:31:49
 * @LastEditTime: 2022-03-01 11:30:03
 * @LastEditors: Fu Zhuohang
 * @Description: In User Settings Edit
 * @FilePath: \yunshu6.0-3\modules\cloudpivot\form\src\components\DropdownMulti\control\dropdown-control.ts
 */
import * as typings from '../../../../../form/schema';

import { SelectControl } from '../../../../../form/src/common/controls/select-control';

import { Watch } from 'vue-property-decorator';

export abstract class DropdownControl extends SelectControl<typings.DropdownOptions> {
  disableds: boolean[] = [];

  hasSelectBatchImport: boolean = false;

  get multiple() {
    return this.controlOpts.multi;
  }

  get hasEmpty() {
    return this.controlOpts.displayEmpty;
  }

  get emptyValue() {
    return (
      this.controlOpts.emptyValue ||
      (!(this.$i18n.locale && this.$i18n.locale === 'en') ? '(空)' : '(null)')
    );
  }

  get mode() {
    return this.multiple ? 'multiple' : '';
  }

  get isLongText() {
    let dateItem;
    if ((this.control as any).parentKey) {
      dateItem = this.getDataItem(this.control.key, this.control.parentKey);
    } else {
      dateItem = this.getDataItem(this.control.key);
    }
    if (!dateItem) {
      return false;
    }
    return dateItem.propertyType === typings.DataItemType.LongText;
  }

  @Watch('items')
  onItemsChange() {
    const val = this.initOptions(!this.multiple);
    if (!(Array.isArray(val) && val.length === 0)) {
      this.options = val;
    }

    // @ts-ignore
    if (this.control.controller && this.control.controller.items === '') {
      const options = this.control.options.options;
      // @ts-ignore
      this.control.controller.items = options ? options.split(';') : [];
    }

    this.resetDisableds();
  }

  setControl() {
    try {
      if (Array.isArray(this.ctrl.value)) {
        // 过滤空项
        if (this.control.value.some((item) => item === '')) {
          this.ctrl.value = this.ctrl.value.filter((item: any) => item !== '');
        }
        if (this.ctrl.value.length > 0 && this.ctrl.value[0].marked === true) {
          this.hasSelectBatchImport =
            this.ctrl.value[0].marked === true ? true : false;
          this.handleValueChange(
            this.ctrl.value[0].marked === true
              ? typeof this.ctrl.value[0].value === 'string'
                ? this.ctrl.value[0].value.split(';').filter((x: any) => !!x)
                : this.ctrl.value[0].value
              : this.ctrl.value,
          );
        } else {
          this.handleValueChange(this.ctrl.value);
        }
      } else {
        const obj = JSON.parse(this.ctrl.value);
        this.hasSelectBatchImport = obj.marked === true ? true : false;
        this.handleValueChange(
          obj.marked === true ? obj.value : this.ctrl.value,
        );
      }
    } catch (e) {
      this.handleValueChange(this.ctrl.value);
    }
    this.onItemsChange();
  }

  handleValueChange(value: any[]): void {
    this.val = super.convertValue(this.multiple, value);
  }

  resetDisableds() {
    if (!this.multiple || this.isLongText) {
      return;
    }
    const values = this.ctrl.value;
    if (!Array.isArray(values)) {
      return;
    }

    const len = this.countLengthOf(values.join(';'));
    this.options.forEach((k, i) => {
      if (values.indexOf(k) > -1) {
        return;
      }
      const l = this.countLengthOf(k) + 1;
      this.disableds[i] = len + l > 200;
    });
  }

  destroyed() {
    super.destroyed();
  }
}

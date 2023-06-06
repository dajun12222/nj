import { ControlHelper } from '../../../../form/src/common/controls/control-helper';
import { FormBuilderHelper } from '../../../../form/src/renderer/controls/form-builder-helper';
import { FormControlErrorCodes, FormGroup } from 'cloudpivot-forms';
import { Prop, Vue, Watch } from 'vue-property-decorator';
import * as schema from '../../schema';
import { FormRendererLike } from '../form-renderer-like';
import { FormControlOptionsService } from '../services';
import {
  DataItemLike,
  FormControlType,
  RendererControl,
  RendererFormControl,
} from '../typings';
import { FormRendererHelper } from './form-renderer-helper';

export class FormRenderer extends Vue implements FormRendererLike {
  @Prop({ default: [] })
  controls!: RendererControl[];

  @Prop({ default: () => [] })
  dataItems!: DataItemLike[];

  @Prop()
  formPermission!: any;

  private _controller?: FormGroup;

  private _formControlMap: {
    [key: string]: RendererFormControl;
  } = {};

  get controller() {
    return this._controller;
  }

  get formControlMap() {
    return this._formControlMap;
  }

  findFormControls(keys?: string[]) {
    return Object.keys(this._formControlMap || {})
      .filter((k) => {
        if (keys) {
          return keys.indexOf(k) > -1;
        }
        return true;
      })
      .map((k) => this._formControlMap[k]);
  }

  @Watch('controls', {
    immediate: true,
  })
  setControls(controls: RendererControl[], oldControls?: RendererControl[]) {
    if (!controls || controls === oldControls || controls.length === 0) {
      return;
    }
    const formControls: RendererFormControl[] = [];
    FormRendererHelper.findFormControl(controls, formControls);
    this._controller = FormRendererHelper.buildController(controls);
    const map: any = {};
    formControls.filter((c) => c.key).forEach((c) => (map[c.key] = c));
    this._formControlMap = map;
  }

  convertOwner(owner: RendererFormControl) {
    owner.type = FormControlType.StaffSelector;
    owner.required = true;

    const options = FormControlOptionsService.buildFor(
      owner.type,
      owner.options,
    );
    if (options) {
      options.defaultValueType = schema.StaffSelectorValueType.Originator;
      owner.options = options;
    }
  }

  render(h: Function, mobile: boolean) {
    if (!this.controls || !this.controls.length) {
      return;
    }
    const children = this.controls.map((c) => {
      return FormRendererHelper.render(h, c, mobile, this);
    });
    const tabs = this.findFormControls().find(
      (c) =>
        c.type === FormControlType.ReverseRelevance &&
        c.options.listDisplayMode === 'tabs',
    );

    if (tabs) {
      return h('div', children);
    } else {
      return h('div', [h('div', this.$slots.default), ...children]);
    }
  }

  validate(excludes?: string[]) {
    if (!this.controller) {
      return true;
    }

    return this.controller.validate(excludes);
  }

  getErrors() {
    if (!this.controller) {
      return null;
    }

    return this.controller.errors;
  }

  getErrorMessage(
    controlId: string,
    errCode: FormControlErrorCodes,
    parentId?: string,
  ) {
    if (!controlId) {
      return '';
    }

    let control = this._formControlMap[parentId || controlId];

    if (
      (control.show !== false && control.controller.value === '') ||
      control.controller.value === null
    ) {
      return this.$t('cloudpivot.form.renderer.tip.requiredError').toString();
    }
    const parent = control;
    if (!control) {
      return '';
    }

    if (parentId) {
      // ;
      const col = (parent as any as schema.FormSheet).columns.find(
        (c) => c.key === controlId,
      );
      if (!col) {
        return '';
      }
      // control = (control.controller as any).children[0].children[controlId] as any
      control = col as any;
    }

    const locale = this.$i18n.locale;

    let msg =
      FormRendererHelper.getErrorMessage(control, errCode, locale) || '';

    if (parentId) {
      msg = ControlHelper.getControlLabel(parent, locale) + ' ' + msg;
    }

    return msg;
  }

  getValue() {
    if (this.controller) {
      return this.controller.value;
    }
  }

  getOpValue(reset?: boolean) {
    // 返回关联表单查询字段的操作符
    const res: any = {};
    this.controls.forEach((el: any) => {
      if (el.children && Array.isArray(el.children)) {
        el.children.forEach((item: any) => {
          if (item.children && Array.isArray(item.children)) {
            item.children.forEach((item: any) => {
              reset
                ? (res[item.key] = item.defaultOp)
                : (res[item.key] = item.op);
            });
          }
        });
      }
    });
    return res;
  }

  reset() {
    this.findFormControls().forEach((c) => {
      if (c.controller) {
        const value = FormBuilderHelper.getControlValue(c);
        FormBuilderHelper.resetOpValue(c);
        c.controller.value = value;
      }
    });
  }

  clear() {
    this.findFormControls().forEach((c) => {
      //视图设计中查询条件配置的不显示字段的值不清空
      if (c.controller && c.options && c.options.visible) {
        c.controller.value = null;
      }
    });
  }

  edit(keys?: string[]) {
    this.setWritable(true, keys);
  }

  readonly(keys?: string[]) {
    this.setWritable(false, keys);
  }

  private setWritable(edit: boolean, keys?: string[]) {
    this.findFormControls(keys)
      .filter((c) => !FormRendererHelper.isSystem(c.type))
      .forEach((control) => {
        if (control.type === FormControlType.Sheet) {
          control.edit = edit;
        } else {
          if(this._controller) {
            const ctrl = this._controller.findChild(control.key);
            if(ctrl) {
              if(control.writable === true){
                ctrl.readonly = !edit;
              }
              // @ts-ignore
              ctrl.setReadonlyOver =  true
            }
          }
        }
      });
  }
}

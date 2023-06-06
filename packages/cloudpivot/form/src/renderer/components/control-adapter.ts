import { ControlHelper } from '../../../../form/src/common/controls/control-helper';
import { FormControl, FormControlErrorCodes } from 'cloudpivot-forms';
import { Prop, Vue } from 'vue-property-decorator';
import { FormControlType, RendererFormControl } from '../typings';
import { FormRendererHelper } from './form-renderer-helper';
import rules from 'cloudpivot/form/src/typings/view-filter-type-map';
export default class ControlAdapter extends Vue {
  @Prop()
  control!: RendererFormControl;

  rules: any[] = rules;

  get id() {
    if (this.control.parentKey) {
      return `${this.control.parentKey}-${this.control.key}`;
    }
    return this.control.key;
  }

  get ctrl() {
    return this.control.controller as FormControl<any>;
  }

  get hasError() {
    if (this.ctrl) {
      return this.ctrl.hasError;
    }
    return false;
  }

  get errors() {
    if (this.ctrl) {
      return this.ctrl.errors;
    }
    return [];
  }

  get isSystem() {
    return (
      (this.control.type >= FormControlType.SequenceNo &&
        this.control.type <= FormControlType.SystemOther) ||
      this.control.type === FormControlType.OwnerParentId
    );
    // && this.control.type !== FormControlType.OwnerId;
  }

  get isTitle() {
    return this.control.type === FormControlType.Title;
  }

  get isDescription() {
    return this.control.type === FormControlType.Description;
  }

  get isStaffSelector() {
    return this.control.type === FormControlType.StaffSelector;
  }

  get isSheet() {
    return this.control.type === FormControlType.Sheet;
  }

  get isDropdown() {
    return this.control.type === FormControlType.Dropdown;
  }

  get isReverseRelevance() {
    return this.control.type === FormControlType.ReverseRelevance;
  }

  get isHtml() {
    return this.control.type === FormControlType.Html;
  }

  get show() {
    const visible = this.control.options.visible;
    if (visible === false || visible === 0) {
      return false;
    }
    if (this.ctrl && this.ctrl.display === false) {
      return false;
    }
    return true;
  }

  get required() {
    // 表单被流程引用后，如表单设计发生变更，审批中的表单会因新的约束条件（如必填项），导致审批流程无法进行
    // 当前产品设计逻辑为：表单新增字段在审批中的流程上显示规则为可见不可写
    // 期望结果：表单新增字段为必填，在运行中的流程里新增字段可不校验必填。
    if (!this.show) {
      return false;
    } //如果是可见不可写，手动改为不校验必填
    return this.ctrl && this.ctrl.required;
  }

  get isHigh() {
    const type = this.control.type;

    // 选人控件
    if (
      type === FormControlType.DepartmentMultiSelector ||
      type === FormControlType.DepartmentSelector ||
      type === FormControlType.StaffSelector ||
      type === FormControlType.StaffMultiSelector ||
      type === FormControlType.Signature ||
      type === FormControlType.Attachment ||
      type === FormControlType.Image
    ) {
      return true;
    }

    // 只读
    if (this.control.edit === false) {
      return false;
    }

    return true;
  }

  get style() {
    const opt = this.control.options;
    if (!opt || !opt.style) {
      return '';
    }
    return opt.style;
  }

  get label() {
    return ControlHelper.getControlLabel(this.control, this.$i18n.locale);
  }

  get tips() {
    const { tips } = this.control.options;
    return tips;
  }

  get isApproval() {
    return this.control.key === '$approval';
  }

  get OpTs() {
    const con: any = this.control;
    const ops: string = '等于';
    if (con && con.filterType) {
      const node = this.rules.find((item) => item.value === con.filterType);
      //创建者部门、拥有者部门特殊处理
      if (['createdDeptId', 'ownerDeptId'].includes(con.key)) {
        switch (con.filterType) {
          case 'Of':
            return '属于';
          case 'NotOf':
            return '不属于';
          default:
            return node ? node.name : ops;
        }
      } else {
        //匹配到条件符号名称用于显示
        return node ? node.name : ops;
      }
    }
    return ops;
  }

  getErrorMessage(errCode: FormControlErrorCodes) {
    return FormRendererHelper.getErrorMessage(
      this.control,
      errCode,
      this.$i18n.locale,
    );
  }
}

import Vue from 'vue';
import baseAttribute from '../../../../form/src/common/component-base-attribute';
import { StaffSelectorValueType } from '../../../../form/src/common/component-schema/complex-control-options';
import {
  ControlAttributeType,
  ControllerConduct,
} from '../../../../form/typings';
import {
  formatterRequiredFormula,
  formatterValueToSetStatus,
} from '../../../../form/utils';
export default {
  groups: {
    base: {
      label: '基础信息',
      keys: [
        'widgetType',
        'name',
        'labelVisible',
        'style',
        'tips',
        'dataItemType',
        'dataItemName',
      ],
    },
    controller: {
      label: '控制属性',
      keys: [
        'defaultValue',
        'defaultValueType',
        'orgRoot',
        'orgRootValueType',
        'recursive',
        'roles',
        'dataLinkage',
        'readonlyFormula',
        'visible',
        'requiredFormula',
        'span',
      ],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
    },
    dataItemName: {
      ...baseAttribute.dataItemName,
    },
    style: {
      ...baseAttribute.style,
    },
    widgetType: {
      ...baseAttribute.widgetType,
      value: '人员单选',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '人员单选',
    },
    displayFormula: {
      ...baseAttribute.displayFormula,
    },
    // 是否必填
    requiredFormula: {
      ...baseAttribute.requiredFormula,
    },
    // 只读条件
    readonlyCondition: {
      ...baseAttribute.readonlyCondition,
    },
    dataLinkage: {
      ...baseAttribute.dataLinkage,
    },
    //是否多选
    multi: {
      value: 'false',
      label: '单选',
    },
    //可选类型
    deptVisible: {
      value: 'user',
      label: '用户',
    },
    defaultValueType: {
      inputMethod: ControlAttributeType.Modal,
      modalType: 'UserSelectValueSetting',
      inputComponent: () =>
        import(
          '../../../../form/src/common/components/user-select-value-setting.vue'
        ),
      options: {
        hideField: ['defaultValue'],
        importModal: (attr: any, attrs: any) => {
          const opts: any = {};
          opts.multi = false;
          opts.deptVisible = 'user';
          attrs.forEach((attrItem: any) => {
            opts[attrItem.field] = attrItem.value;
          });

          return opts;
        },
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          const val =
            attr.value === StaffSelectorValueType.None
              ? attrs.find((a: any) => a.field === 'defaultValue').value
              : null;
          vm.updateAttribute(key, 'defaultValue', val);
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: Vue,
        ) => {
          const val =
            data.type === StaffSelectorValueType.None ? data.value : null;
          vm.$emit('change', 'defaultValue', val);
          return data.type;
        },
        formatter: (valueType: string, attrs: any) => {
          let text = '';

          switch (valueType) {
            case StaffSelectorValueType.None:
              let staff = attrs.find(
                (a: any) => a.field === 'defaultValue',
              ).value;
              // staff 可能是任意字符 需要容错处理
              try {
                if (staff) {
                  if (typeof staff === 'string') {
                    staff = JSON.parse(staff);
                  }
                  text = staff.map((x: any) => x.name).join(';');
                }
              } catch (e) {}
              break;
            case StaffSelectorValueType.Originator:
              text = '创建人';
              break;
            case StaffSelectorValueType.OriginatorDept:
              text = '创建人部门';
              break;
            default:
              break;
          }

          return text || '未设置';
        },
      },
    },
    orgRootValueType: {
      inputMethod: ControlAttributeType.Modal,
      modalType: 'UserSelectOrgValueSetting',
      inputComponent: () =>
        import(
          '../../../../form/src/common/components/user-select-value-setting.vue'
        ),
      options: {
        hideField: ['orgRoot'],
        importModal: (attr: any, attrs: any) => {
          const opts: any = {};

          attrs.forEach((attrItem: any) => {
            opts[attrItem.field] = attrItem.value;
          });

          return opts;
        },
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          const val = attrs.find((a: any) => a.field === 'orgRoot').value;
          vm.updateAttribute(key, 'orgRoot', val);
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: Vue,
        ) => {
          const val = data.value;
          vm.$emit('change', 'orgRoot', val);
          return data.type;
        },
        formatter: (valueType: string, attrs: any, getControls?: Function) => {
          let orgRoot = attrs.find((a: any) => a.field === 'orgRoot').value;
          const orgRootObj = attrs.find((a: any) => a.field === 'orgRoot');
          let text = '';

          switch (valueType) {
            case StaffSelectorValueType.None:
              if (orgRoot) {
                if (typeof orgRoot === 'string') {
                  orgRoot = JSON.parse(orgRoot);
                }
                text = orgRoot.map((x: any) => x.name).join(';');
              }
              break;
            case StaffSelectorValueType.OriginatorDept:
              text = '创建人部门';
              break;
            case StaffSelectorValueType.Ref:
              if (typeof orgRoot === 'string') {
                text = orgRoot;
              }
              if (getControls && typeof getControls === 'function') {
                const controls = getControls();
                const key = orgRoot.slice(1, orgRoot.length - 1);
                const control = controls[key];
                if (control) {
                  text = control.options.name;
                }
              }
              break;
            default:
              break;
          }

          return text ? '已设置' : '未设置';
        },
      },
    },
    roles: {
      inputMethod: ControlAttributeType.Modal,
      attrType: 'rolesModel',
      options: {
        callback: (key: string, attr: any, attrs: any, vm: any) => {
          const val = attrs.find((a: any) => a.field === 'roles').value;
          vm.updateAttribute(key, 'roles', val);
        },
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: Vue,
        ) => {
          const val = data.value;
          vm.$emit('change', 'roles', val);
          return data.value;
        },
        formatter: formatterValueToSetStatus,
      },
    },
    mappings: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import(
          '../../../../form/src/common/components/user-selection-map2.vue'
        ),
      options: {},
      formatter: formatterValueToSetStatus,
    },
    tips: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: '长度不能超过200字节',
          },
        },
        placeholder: '控件提示',
      },
    },
    span: {
      ...baseAttribute.span,
    },
  },
} as ControllerConduct;

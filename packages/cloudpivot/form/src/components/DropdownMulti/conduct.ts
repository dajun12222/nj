import baseAttribute from '../../../../form/src/common/component-base-attribute';
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
        'displayEmpty',
        'emptyValue',
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
      value: '下拉多选框',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '下拉多选框',
    },
    // 显示条件
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
    // 默认值
    defaultValue: {
      options: {
        transaction({ attr, attrs, displayFields }: any) {
          // const type = 0;
          if (attr.dataItem && attr.dataItem.type === 1) {
            delete attr.options.regexps;
          }
          // ;
        },
        regexps: {
          maxLength: {
            len: 200,
            message: '长度不能超过200字节',
          },
        },
      },
    },
    // 选项
    options: {
      attrType: 'dropdownMultiOption',
      inputMethod: ControlAttributeType.Modal,
      custom: true,
      inputComponent: () =>
        import(
          '../../../../form/src/common/components/biz-option-data-model2.vue'
        ),
      options: {
        formatter: formatterValueToSetStatus,
        tip: {
          content: `<div>设置选项，若选择业务模型</div>
          <div>型或数据字典，未配置选项</div>
          <div>时取自定义选项的值</div>`,
          icon: 'question-circle-o',
        },
      },
    },
    // 是否显示空选项
    displayEmpty: {
      options: {
        hideField: (value: string) => {
          if (!value) {
            return ['emptyValue'];
          } else {
            return [];
          }
        },
      },
    },
    // 空选项显示值
    emptyValue: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: '长度不能超过200字节',
          },
        },
      },
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

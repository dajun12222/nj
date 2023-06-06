import {
  ControllerConduct,
  ControlAttributeType,
} from '../../../../form/typings';
import { formatterValueToSetStatus } from '../../../../form/utils';
import baseAttribute from '../../../../form/src/common/component-base-attribute';

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
      keys: ['defaultValue', 'dataLinkage', 'visible', 'span'],
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
      value: '逻辑',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '逻辑',
    },
    displayFormula: {
      ...baseAttribute.displayFormula,
    },
    // 只读条件
    readonlyCondition: {
      ...baseAttribute.readonlyCondition,
    },
    dataLinkage: {
      ...baseAttribute.dataLinkage,
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
    defaultValue: {
      inputMethod: ControlAttributeType.RadioGroup,
      options: {
        list: [
          {
            value: true,
            label: 'true',
          },
          {
            value: false,
            label: 'false',
          },
        ],
      },
    },
    span: {
      ...baseAttribute.span,
    },
  },
} as ControllerConduct;

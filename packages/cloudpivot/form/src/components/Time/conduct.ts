/*
 * @Author: Fan
 * @Date: 2020-04-19 19:31:21
 * @description:
 * @LastEditors: Fan
 */
import {
  ControllerConduct,
  ControlAttributeType,
} from '../../../../form/typings';
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from '../../../../form/utils';
import baseAttribute from '../../../../form/src/common/component-base-attribute';
import { utils } from '../../../../common';

const DateHandle = utils.DateHandle;
export default {
  groups: {
    base: {
      label: '基础信息',
      keys: ['name', 'visible', 'style', 'tips', 'widgetType'],
    },
    controller: {
      label: '控制属性',
      keys: [
        'defaultValue',
        'displayFormula',
        'requiredFormula',
        'readonlyFormula',
        'format',
        'verifyFormula',
        'dataLinkage',
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
      value: '时间',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '时间',
    },
    defaultValue: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: 'none',
            label: '空',
          },
          {
            value: 'current',
            label: '当前时间',
          },
          // {
          //   value: "dataItemDefault",
          //   label: "数据项默认值",
          // },
        ],
      },
    },
    displayFormula: {
      ...baseAttribute.displayFormula,
    },
    requiredFormula: {
      ...baseAttribute.requiredFormula,
    },
    format: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: 'HH:mm',
            label: DateHandle.dateFormat(new Date(), 'HH:mm'),
          },
          {
            value: 'HH:mm:ss',
            label: DateHandle.dateFormat(new Date(), 'HH:mm:ss'),
          },
        ],
      },
    },
    verifyFormula: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import(
          '../../../../form/src/common/components/verify-formula-time.vue'
        ),
      options: {
        formatter: formatterValueToSetStatus,
      },
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
    span: {
      ...baseAttribute.span,
    },
  },
} as ControllerConduct;

import baseAttribute from '../../common/component-base-attribute';
import { ControllerConduct } from '../../../typings';
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
      keys: ['visible', 'span'],
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
      value: '拥有者部门',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '部门单选',
    },
    span: {
      ...baseAttribute.span,
    },
  },
} as ControllerConduct;

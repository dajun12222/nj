/*
 * @Author: zhuqiu
 * @Date: 2020-05-19 13:53:54
 * @LastEditTime: 2022-02-17 19:06:01
 * @LastEditors: Fu Zhuohang
 * @Description: In User Settings Edit
 * @FilePath: \yunshu6.0-3\modules\cloudpivot\form\src\components\Create\conduct.ts
 */
import baseAttribute from '../../common/component-base-attribute';
import { ControlAttributeType, ControllerConduct } from '../../../typings';
import { formatterValueToSetStatus } from '../../../utils';
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
      value: '创建人',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '人员单选',
    },
    mappings: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import('../../common/components/user-selection-map2.vue'),
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

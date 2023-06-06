/*
 * @Author: Fu Zhuohang
 * @Date: 2022-01-28 09:25:40
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-02-17 19:06:29
 * @FilePath: \yunshu6.0-3\modules\cloudpivot\form\src\components\Owner\conduct.ts
 * @Description:
 */
import baseAttribute from '../../../../form/src/common/component-base-attribute';
import {
  ControlAttributeType,
  ControllerConduct,
} from '../../../../form/typings';
import { formatterValueToSetStatus } from '../../../../form/utils';
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
      value: '拥有者',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '人员单选',
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

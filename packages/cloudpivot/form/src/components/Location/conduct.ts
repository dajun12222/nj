/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:29
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
  formatterLocations,
} from '../../../../form/utils';
import baseAttribute from '../../../../form/src/common/component-base-attribute';
import { FormControlType } from '../../../../form/schema';
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
      label: '控件属性',
      keys: [
        'displayMode',
        'range',
        'autoGetLocation',
        'defaultValue',
        'showSearch',
        'readonlyFormula',
        'visible',
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
      inputMethod: ControlAttributeType.Dropdown,
      value: FormControlType.Location,
      options: {
        list: [
          {
            value: FormControlType.Location,
            label: '地图定位',
          },
          {
            value: FormControlType.Address,
            label: '地址',
          },
        ],
      },
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '地址',
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
    // 默认值
    range: {
      inputMethod: ControlAttributeType.RadioGroup,
      value: '500m',
      options: {
        list: [
          {
            value: '1km',
            label: '1km',
          },
          {
            value: '500m',
            label: '500m',
          },
          {
            value: '200m',
            label: '200m',
          },
        ],
      },
    },
    // 提示文字
    displayMode: {
      inputMethod: ControlAttributeType.RadioGroup,
      options: {
        list: [
          {
            value: 'accurate',
            label: '准确定位',
          },
          {
            value: 'arbitrary',
            label: '任意位置',
          },
        ],
        hideField: (value: string) => {
          if (value !== 'accurate') {
            return ['range'];
          } else {
            return [];
          }
        },
      },
    },
    // 文本最大长度
    autoGetLocation: {
      inputMethod: ControlAttributeType.Boolean,
      options: {
        valueMap: {
          true: 'true',
          false: 'false',
        },
      },
    },
    defaultValue: {
      inputMethod: ControlAttributeType.Modal,
      modalType: 'loacationModal',
      inputComponent: () =>
        import('../../../../form/src/common/components/location-modal.vue'),
      options: {
        formatter: formatterLocations,
      },
    },
    showSearch: {
      inputMethod: ControlAttributeType.Boolean,
      value: 'true',
      options: {
        valueMap: {
          true: 'true',
          false: 'false',
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

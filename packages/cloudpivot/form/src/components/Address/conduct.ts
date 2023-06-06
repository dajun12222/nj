/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:29
 * @description:
 * @LastEditors: Fu Zhuohang
 */
import { ControllerConduct, ControlAttributeType } from '../../../typings';
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
  formatterAddress,
} from '../../../utils';
import baseAttribute from '../../../src/common/component-base-attribute';
import { FormControlType } from '../../../schema';
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
        'locationType',
        'addressDetail',
        'showEmpty',
        'emptyValue',
        'autoGetLocation',
        'requiredFormula',
        'dataLinkage',
        'defaultValue',
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
      value: FormControlType.Address,
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
    // 地址格式
    locationType: {
      inputMethod: ControlAttributeType.RadioGroup,
      options: {
        list: [
          {
            value: 'pp-cc-aa',
            label: '省/市/县区',
          },
          {
            value: 'pp-cc',
            label: '省/市',
          },
          {
            value: 'pp',
            label: '省',
          },
        ],
      },
    },
    // 显示详细地址
    addressDetail: {
      inputMethod: ControlAttributeType.Boolean,
      options: {
        valueMap: {
          true: 'true',
          false: 'false',
        },
      },
    },
    //自动获取位置
    autoGetLocation: {
      inputMethod: ControlAttributeType.Boolean,
      options: {
        valueMap: {
          true: 'true',
          false: 'false',
        },
      },
    },
    dataLinkage: {
      ...baseAttribute.dataLinkage,
    },
    // 显示空选项
    showEmpty: {
      inputMethod: ControlAttributeType.Boolean,
      options: {
        valueMap: {
          true: 'true',
          false: 'false',
        },
        hideField: (attr) => {
          return attr === 'false' ? ['emptyValue'] : [];
        },
      },
    },
    emptyValue: {
      options: {
        disabled: true,
      },
    },
    defaultValue: {
      inputMethod: ControlAttributeType.Modal,
      modalType: 'loacationModal',
      inputComponent: () =>
        import('../../common/components/location-modal.vue'),
      options: {
        formatter: formatterAddress,
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

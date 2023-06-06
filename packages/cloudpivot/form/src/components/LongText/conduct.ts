/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:29
 * @description:
 * @LastEditors: zhuqiu
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
        'defaultValue',
        'textAreaType',
        'placeholder',
        'currentMaxLength',
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
      value: '长文本',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '长文本',
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
        regexps: {
          maxLength: {
            len: 2000,
            message: '长度不能超过2000字节',
          },
        },
        placeholder: '请输入',
      },
    },
    // 提示文字
    placeholder: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: '长度不能超过200字节',
          },
        },
        placeholder: '请输入',
      },
    },
    //正则错误提示
    regexpText: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: '长度不能超过200字节',
          },
        },
      },
    },
    // 正则校验
    regexp: {
      inputMethod: ControlAttributeType.Modal,
      attrType: 'regularModal',
      inputComponent: () =>
        import('../../../../form/src/common/components/regular-modal2.vue'),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 计算规则
    shortTextStitch: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import('../../../../form/src/common/components/short-text-rouls.vue'),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    // 文本最大长度
    maxLength: {
      options: {
        regexps: {
          // required: "最大长度不能为空",
          regexps: [
            {
              regexp: /^[1-9]\d*$/,
              message: '只能输入正整数',
            },
            {
              regexp: (value: string) => parseFloat(value) <= 2000,
              message: '最大长度不能超过2000',
            },
          ],
        },
      },
    },
    // 富文本最大字数限制
    currentMaxLength: {
      options: {
        regexps: {
          required: '字数限制不能为空',
          regexps: [
            {
              regexp: /^[1-9]\d*$/,
              message: '只能输入正整数',
            },
            {
              regexp: (value: string) => parseFloat(value) <= 2e7,
              message: '最大字数不能超过' + 2e7,
            },
          ],
        },
      },
    },
    textAreaType: {
      inputMethod: ControlAttributeType.RadioGroup,
      options: {
        list: [
          {
            value: 'longText',
            label: '多行文本',
          },
          {
            value: 'current',
            label: '富文本',
          },
        ],
        hideField: (attr: any) => {
          if (!attr || attr === 'longText') {
            return ['currentMaxLength'];
          } else {
            return ['placeholder', 'maxLength'];
          }

          // (attr ? [] : ["imageQuality"])
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

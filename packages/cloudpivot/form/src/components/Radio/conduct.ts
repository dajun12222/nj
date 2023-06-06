/*
 * @Author: Fan
 * @Date: 2020-04-16 17:51:26
 * @description:
 * @LastEditors: Fan
 */
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
        'direction',
        'displaySetting',
        'dataLinkage',
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
      ...baseAttribute.widgetType,
      value: '单选框',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '单选框',
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
    defaultValue: {
      options: {
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
      inputMethod: ControlAttributeType.Modal,
      attrType: 'radioOption',
      custom: true,
      inputComponent: () =>
        import(
          '../../../../form/src/common/components/biz-option-data-model2.vue'
        ),
      options: {
        formatter: formatterValueToSetStatus,
        tip: {
          content: `<div>设置选项，若选择业务模型</div>
                    <div>或数据字典，未配置选项时,</div>
                    <div>发布后取自定义选项的值</div>`,
          icon: 'question-circle-o',
        },
      },
    },
    dataLinkage: {
      ...baseAttribute.dataLinkage,
    },
    direction: {
      inputMethod: ControlAttributeType.RadioGroup,
      options: {
        list: [
          {
            value: 'horizontal',
            label: '横向',
          },
          {
            value: 'vertical',
            label: '纵向',
          },
        ],
      },
    },
    // 显示设置
    displaySetting: {
      inputMethod: ControlAttributeType.RadioGroup,
      options: {
        list: [
          {
            value: 'showSelected',
            label: '勾选项',
          },
          {
            value: 'showAllOption',
            label: '全部项',
          },
        ],
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

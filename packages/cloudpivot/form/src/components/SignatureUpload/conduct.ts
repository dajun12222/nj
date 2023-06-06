import {
  ControllerConduct,
  ControlAttributeType,
} from '../../../../form/typings';
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
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
      label: '控制属性',
      keys: ['displayEnd', 'dataLinkage', 'visible', 'span'],
    },
    scripts: {
      label: '控件事件',
      keys: ['onUpload', 'onDelete'],
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
      value: FormControlType.Signature,
      options: {
        // Todo 将控件编码 换成 说明文字, 创建所有组件的 编码说明文件
        list: [
          {
            value: FormControlType.Attachment,
            label: '附件',
          },
          {
            value: FormControlType.Image,
            label: '图片',
          },
          {
            value: FormControlType.Signature,
            label: '手写签名',
          },
        ],
      },
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '附件',
    },
    displayFormula: {
      ...baseAttribute.displayFormula,
    },
    // 是否必填
    requiredFormula: {
      ...baseAttribute.requiredFormula,
    },
    dataLinkage: {
      ...baseAttribute.dataLinkage,
    },
    displayEnd: {
      options: {
        disabled: true,
      },
    },
    onUpload: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import('../../../../form/src/common/components/script-input.vue'),
    },
    onDelete: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import('../../../../form/src/common/components/script-input.vue'),
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

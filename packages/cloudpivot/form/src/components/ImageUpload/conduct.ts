import {
  ControllerConduct,
  ControlAttributeType,
} from '../../../../form/typings';
import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
  formatterUploadImgNumber,
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
      keys: [
        'limit',
        'batch',
        'number',
        'addWatermark',
        'watermarkFontSize',
        'compressible',
        'imageQuality',
        'onlyShoot',
        'dataLinkage',
        'visible',
        'span',
      ],
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
      value: FormControlType.Image,
      inputMethod: ControlAttributeType.Dropdown,
      options: {
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
    limit: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: '1M',
            label: '1M',
          },
          {
            value: '5M',
            label: '5M',
          },
          {
            value: '10M',
            label: '10M',
          },
          {
            value: '20M',
            label: '20M',
          },
          {
            value: '50M',
            label: '50M',
          },
          {
            value: '100M',
            label: '100M',
          },
          {
            value: '200M',
            label: '200M',
          },
          // {
          //   value: '512M',
          //   label: '512M'
          // },
          // {
          //   value: '1G',
          //   label: '1G'
          // }
        ],
      },
    },
    number: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import('../../../../form/src/common/components/update-img-num.vue'),
      options: {
        formatter: formatterUploadImgNumber,
      },
    },
    compressible: {
      options: {
        hideField: (attr: any) => (attr ? [] : ['imageQuality']),
      },
    },
    addWatermark: {
      options: {
        hideField: (attr: any) => (attr ? [] : ['watermarkFontSize']),
      },
    },
    watermarkFontSize: {
      inputMethod: ControlAttributeType.RadioGroup,
      value: 16,
      options: {
        list: [
          {
            value: 16,
            label: '小',
          },
          {
            value: 32,
            label: '中',
          },
          {
            value: 48,
            label: '大',
          },
          {
            value: 72,
            label: '特大',
          },
        ],
      },
    },

    imageQuality: {
      inputMethod: ControlAttributeType.Dropdown,
      value: 30,
      options: {
        list: [
          {
            value: 30,
            label: '30%',
          },
          {
            value: 40,
            label: '40%',
          },
          {
            value: 50,
            label: '50%',
          },
          {
            value: 60,
            label: '60%',
          },
          {
            value: 70,
            label: '70%',
          },
          {
            value: 80,
            label: '80%',
          },
          {
            value: 90,
            label: '90%',
          },
        ],
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

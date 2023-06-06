import baseAttribute from '../../../../form/src/common/component-base-attribute';
import { ControllerConduct } from '../../../../form/typings';
export default {
  groups: {
    base: {
      label: '基础信息',
      keys: ['name', 'style', 'tips'],
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
    style: {
      ...baseAttribute.style,
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

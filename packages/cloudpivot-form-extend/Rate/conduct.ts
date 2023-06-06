import baseAttribute from 'cloudpivot/form/src/common/component-base-attribute';
import {
  ControlAttributeType,
  ControllerConduct,
} from 'cloudpivot/form/typings';
export default {
  groups: {
    base: {
      label: '基础信息',
      keys: ['name', 'visible', 'style', 'tips', 'dataItemName'],
    },
    controller: {
      label: '控制属性',
      keys: ['count', 'allowHalf', 'span'],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
    },
    style: {
      ...baseAttribute.style,
    },
    dataItemName: {
      ...baseAttribute.dataItemName,
    },
    count: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: () => {
          const s: any = [];
          let i = 1;
          while (i <= 10) {
            s.push({ label: i, value: i });
            i++;
          }
          return s;
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

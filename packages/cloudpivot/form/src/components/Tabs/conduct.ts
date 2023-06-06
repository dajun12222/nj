import Vue from 'vue';
import {
  ControlAttributeType,
  ControllerConduct,
} from '../../../../form/typings';
import baseAttribute from '../../../../form/src/common/component-base-attribute';
import { formatterValueToSetStatus } from '../../../../form/utils';

export default {
  groups: {
    controller: {
      label: '控制属性',
      keys: ['heads', 'useFor', 'tabDefaultValue', 'span'],
    },
  },
  properties: {
    // 显示条件
    heads: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import('../../../../form/src/common/components/tabs-heads-setting.vue'),
      options: {
        formatter: formatterValueToSetStatus,
        exportModal: (
          data: any,
          attr: any,
          attrs: any,
          callback: Function,
          vm: Vue,
        ) => {
          const field: string = attr.attrType;
          if (!!field) {
            callback(field, data.default);
          }
          // 设置tab标签页默认选项的值
          const source: any = attrs.find((a: any) => a.field === 'heads');
          const tabs: any = attrs.find(
            (a: any) => a.field === 'tabDefaultValue',
          );
          if (source && tabs) {
            const keys: any = data.value.find((d: any) => d.key === tabs.value);
            if (!keys) {
              // tabs.value = "";
              tabs.value = data.value[0].key;
            }
          }
          // console.log("DATA: " + data.value);
          vm.$emit('change', 'tabDefaultValue', tabs.value);
          return data && data.value ? data.value : '';
        },
      },
    },

    useFor: {
      inputMethod: ControlAttributeType.Dropdown,
      value: '2', // 1:显示标签， 2：激活标签
      options: {
        allowClear: true,
        list: (attrs: any) => {
          return [
            {
              value: '1',
              label: '显示标签',
            },
            {
              value: '2',
              label: '激活标签',
            },
          ];
        },
      },
    },

    tabDefaultValue: {
      inputMethod: ControlAttributeType.Dropdown,
      value: 'tab1',
      options: {
        list: (attrs: any) => {
          return attrs.options.heads.map((p: any) => {
            return {
              value: p.key,
              label: p.title,
            };
          });
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

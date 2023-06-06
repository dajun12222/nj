/*
 * @Author: Fan
 * @Date: 2020-04-15 16:18:15
 * @description:
 * @LastEditors: zhuqiu
 */
import { ControlAttributeType } from '../../typings';

import {
  formatterValueToSetStatus,
  formatterRequiredFormula,
} from '../../utils';

export default {
  name: {
    label: '控件名称',
    type: ControlAttributeType.String,
    value: '',
    options: {
      regexps: {
        required: '控件名称不能为空',
        maxLength: {
          len: 40,
          message: '长度不能超过40个字符',
        },
        regexps: [
          {
            regexp: /^[^ ]/,
            message: '不能以空格开始',
          },
        ],
      },
    },
  },
  dataItemName: {
    label: '绑定数据项编码',
    type: ControlAttributeType.String,
    value: '',
    options: {
      regexps: {
        required: '绑定数据项编码不能为空',
        maxLength: {
          len: 28,
          message: '长度不能超过28字节',
        },
        regexps: [
          {
            regexp: /^[^ ]/,
            message: '表单数据项编码不能以空格开始，请以英文字母开始',
          },
          {
            regexp: /^[A-Za-z][A-Za-z0-9_]+$/,
            message: '请以英文字母开始，支持英文字母、数字、下划线',
          },
          {
            regexp: 'regexpSQL',
            message: '编码为SQL关键字，不可使用',
          },
        ],
      },
      transaction: ({ attr, allControls, attrs }: any) => {
        const { dataItem } = allControls;
        if (dataItem) {
          attr.dataItem = dataItem;
          attr.options.disabled = dataItem.published || dataItem.isSystem;
        }

        const options = attrs.find((res: any) => {
          return res.field === 'options';
        });
        // if (options) {
        //   try {
        //     JSON.parse(options.value);
        //     options.value = '选项1;选项2;选项3'
        //   } catch {

        //   }
        // }
      },
      // callback(controlkey, currentAttr, allAttrs, vm) {
      //   // 显示规格变化时,校验规则需要清空
      //  ;
      // }
    },
  },
  widgetType: {
    label: '控件类型',
    type: ControlAttributeType.String,
    value: '',
    options: {
      disabled: true,
      // transaction: ({ attr, allControls }: any) => {
      //   ;
      // },
      // callback: (key: string, attr: any, attrs: any, vm: any) => {
      //   ;
      // }
    },
  },
  dataItemType: {
    label: '数据项类型',
    type: ControlAttributeType.String,
    value: '',
    options: {
      disabled: true,
    },
  },
  visible: {
    label: '是否可见',
    type: ControlAttributeType.Boolean,
    value: '',
  },
  style: {
    label: '控件样式',
    type: ControlAttributeType.String,
    value: '',
    options: {
      regexps: {
        maxLength: {
          len: 200,
          message: '长度不能超过200字节',
        },
      },
      placeholder: 'css样式',
    },
  },
  tips: {
    label: '控件Tips',
    type: ControlAttributeType.String,
    value: '',
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
  width: {
    label: '列宽px',
    type: ControlAttributeType.String,
    value: '',
    options: {
      regexps: {
        required: '列宽不能为空',
        regexps: [
          {
            regexp: /^[1-9]\d*$/,
            message: '只能输入正整数',
          },
          {
            regexp: (value: string) => parseFloat(value) <= 885,
            message: '不能超过最大宽度885',
          },
        ],
      },
    },
  },
  span: {
    options: {
      style: 'button',
      list: [
        {
          label: '1/4',
          value: 6,
        },
        {
          label: '1/3',
          value: 8,
        },
        {
          label: '1/2',
          value: 12,
        },
        {
          label: '2/3',
          value: 16,
        },
        {
          label: '3/4',
          value: 18,
        },
        {
          label: '整行',
          value: 24,
        },
      ],
    },
  },
  // 显示条件
  displayFormula: {
    inputMethod: ControlAttributeType.Modal,
    modalType: 'showRule',
    inputComponent: () => import('./components/required-condition.vue'),
    options: {
      formatter: formatterValueToSetStatus,
    },
  },
  // 是否必填
  requiredFormula: {
    inputMethod: ControlAttributeType.Modal,
    modalType: 'requiredRule',
    inputComponent: () => import('./components/required-condition.vue'),
    options: {
      formatter: formatterRequiredFormula,
    },
  },
  // 只读条件
  readonlyCondition: {
    inputMethod: ControlAttributeType.Modal,
    modalType: 'readonlyCondition',
    inputComponent: () => import('./components/required-condition.vue'),
    options: {
      formatter: formatterValueToSetStatus,
    },
  },
  dataLinkage: {
    inputMethod: ControlAttributeType.Modal,
    inputComponent: () => import('./components/data-linkage.vue'),
    options: {
      formatter: formatterValueToSetStatus,
    },
  },
} as any;

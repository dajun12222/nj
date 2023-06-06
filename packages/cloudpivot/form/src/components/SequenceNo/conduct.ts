import baseAttribute from '../../../../form/src/common/component-base-attribute';
import {
  ControlAttributeType,
  ControllerConduct,
} from '../../../../form/typings';
import { formatterValueToSetStatus } from '../../../../form/utils';
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
      keys: ['visible', 'span'],
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
      value: '单据号',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '短文本',
    },
    // // 流水号编码
    // prefix: {
    //   options: {
    //     regexps: {
    //       maxLength: {
    //         len: 200,
    //         message: "长度不能超过200字节",
    //       },
    //     },
    //   },
    // },
    // // 最大长度
    // maxLength: {
    //   inputMethod: ControlAttributeType.Dropdown,
    //   options: {
    //     list: [
    //       {
    //         value: "4",
    //         label: "4",
    //       },
    //       {
    //         value: "5",
    //         label: "5",
    //       },
    //       {
    //         value: "6",
    //         label: "6",
    //       },
    //       {
    //         value: "7",
    //         label: "7",
    //       },
    //       {
    //         value: "8",
    //         label: "8",
    //       },
    //       {
    //         value: "9",
    //         label: "9",
    //       },
    //       {
    //         value: "10",
    //         label: "10",
    //       },
    //     ],
    //   },
    // },
    // // 重置策略时间
    // resetDate: {
    //   inputMethod: ControlAttributeType.Dropdown,
    //   options: {
    //     list: [
    //       {
    //         value: "none",
    //         label: "不重置",
    //       },
    //       {
    //         value: "DAY",
    //         label: "每天",
    //       },
    //       {
    //         value: "MONTH",
    //         label: "每月",
    //       },
    //       {
    //         value: "YEAR",
    //         label: "每年",
    //       },
    //     ],
    //   },
    // },
    // // 连接符
    // delimiter: {
    //   inputMethod: ControlAttributeType.Dropdown,
    //   options: {
    //     allowClear: true,
    //     list: [
    //       {
    //         value: "mark1",
    //         label: "-",
    //       },
    //       {
    //         value: "mark2",
    //         label: "#",
    //       },
    //       {
    //         value: "mark3",
    //         label: "_",
    //       },
    //     ],
    //     callback: (key: boolean, attr: any, attrs: any, vm: any) => {
    //       let val = attr.value || "";
    //       vm.updateAttribute(key, "delimiter", val);
    //     },
    //   },
    // },
    seqNoSetting: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import(
          '../../../../form/src/common/components/document-strategy-modal2.vue'
        ),
      options: {
        formatter: formatterValueToSetStatus,
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

import { ObjectPropertyInfo, DataType } from '../../../../form/typings';
import { styleControlOptions } from '../../../../form/component-schema';
export default {
  $id: 'sequenceNo',
  type: DataType.Object,
  $ref: styleControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: '控件类型',
    },
    dataItemType: {
      type: DataType.String,
      title: '数据项类型',
    },
    // prefix: {
    //   type: DataType.String,
    //   title: "流水号编码",
    // },
    // maxLength: {
    //   type: DataType.String,
    //   title: "最大长度",
    //   default: "6",
    // },
    // resetDate: {
    //   type: DataType.String,
    //   title: "重置策略时间",
    //   default: "YEAR", //'none' | 'year' | 'month' | 'week' | 'day'
    // },
    // delimiter: {
    //   type: DataType.String,
    //   title: "连接符",
    //   default: "mark1", // '-' | '#' | '、' | '_' |
    // },
    seqNoSetting: {
      type: DataType.Array,
      title: '单据号配置',
      default: [
        {
          type: 'UID', //UID
          value: 'aa860e64ff2e4f86851a661d663ae358',
        },
      ],
    },
    labelVisible: {
      type: DataType.Checkbox,
      title: '标题显示',
      default: true,
    },
    style: {
      type: DataType.String,
      title: '控件样式',
      tip: {
        content: `<div>控件标题样式，css样式</div>
                  <div>例：color: red</div>`,
        icon: 'question-circle-o',
      } as any,
    },
    span: {
      type: DataType.RadioGroup,
      title: '控件宽度',
    },
  },
} as ObjectPropertyInfo;

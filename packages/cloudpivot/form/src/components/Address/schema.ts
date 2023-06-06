/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:13
 * @description:
 * @LastEditors: Fu Zhuohang
 */
import { ObjectPropertyInfo, DataType } from '../../../typings';
import { inputControlOptions } from '../../../component-schema';
export default {
  $id: 'address',
  type: DataType.Object,
  $ref: inputControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.Number,
      title: '控件类型',
    },
    dataItemType: {
      type: DataType.String,
      title: '数据项类型',
    },
    locationType: {
      type: DataType.RadioGroup,
      title: '地址格式',
      default: 'pp-cc-aa',
    },
    addressDetail: {
      type: DataType.Boolean,
      title: '显示详细地址',
      default: 'true',
    },
    showEmpty: {
      type: DataType.Boolean,
      title: '显示空选项',
      default: 'false',
    },
    emptyValue: {
      type: DataType.String,
      title: '空值',
      default: '请选择',
    },
    autoGetLocation: {
      type: DataType.Boolean,
      title: '自动获取位置',
      default: 'false',
    },
    dataLinkage: {
      type: DataType.String,
      title: '数据联动',
    },
    defaultValue: {
      type: DataType.Object,
      title: '默认值',
    },
    labelVisible: {
      type: DataType.Checkbox,
      title: '标题显示',
      default: true,
    },
    readonlyCondition: {
      type: DataType.String,
      title: '只读条件',
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

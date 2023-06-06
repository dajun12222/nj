/*
 * @Author: Fan
 * @Date: 2020-04-16 20:44:13
 * @description:
 * @LastEditors: Fu Zhuohang
 */
import { selectControlOptions } from '../../../component-schema';
import { DataType, ObjectPropertyInfo } from '../../../typings';
export default {
  $id: 'checkbox',
  type: DataType.Object,
  $ref: selectControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.Number,
      title: '控件类型',
    },
    dataItemType: {
      type: DataType.String,
      title: '数据项类型',
    },
    direction: {
      type: DataType.RadioGroup,
      title: 'web端方向',
      default: 'horizontal',
    },
    dataLinkage: {
      type: DataType.String,
      title: '数据联动',
    },
    displaySetting: {
      type: DataType.RadioGroup,
      title: '显示设置',
      default: 'showSelected',
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
    visible: {
      type: DataType.Boolean,
      title: '是否可见',
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

/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:13
 * @description:
 * @LastEditors: Fan
 */
import { inputControlOptions } from '../../../../form/component-schema';
import { DataType, ObjectPropertyInfo } from '../../../../form/typings';
export default {
  $id: 'location',
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
    range: {
      type: DataType.RadioGroup,
      title: '精确范围',
    },
    displayMode: {
      type: DataType.RadioGroup,
      title: '显示模式',
      default: 'accurate',
    },
    autoGetLocation: {
      type: DataType.Boolean,
      title: '自动获取位置',
      default: 'false',
    },
    defaultValue: {
      type: DataType.Object,
      title: '默认值',
    },
    showSearch: {
      type: DataType.Boolean,
      title: '定位搜索',
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

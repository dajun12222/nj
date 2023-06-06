/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:13
 * @description:
 * @LastEditors: Fan
 */
import { ObjectPropertyInfo, DataType } from '../../../../form/typings';
import {
  inputControlOptions,
  TextAreaType,
} from '../../../../form/component-schema';
export default {
  $id: 'longText',
  type: DataType.Object,
  $ref: inputControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: '控件类型',
    },
    dataItemType: {
      type: DataType.String,
      title: '数据项类型',
    },
    defaultValue: {
      type: DataType.String,
      title: '默认值',
    },
    textAreaType: {
      type: DataType.RadioGroup,
      title: '输入框样式',
      default: TextAreaType.LongText,
    },
    maxLength: {
      type: DataType.Integer,
      title: '最大长度',
      default: 2e3,
    },
    currentMaxLength: {
      type: DataType.Integer,
      title: '字数限制',
      default: 2e6,
    },
    placeholder: {
      type: DataType.String,
      title: '提示文字',
      default: '请输入',
    },
    dataLinkage: {
      type: DataType.String,
      title: '数据联动',
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
    readonlyFormula: {
      type: DataType.Boolean,
      title: '是否只读',
      default: false,
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
    shortTextStitch: {
      type: DataType.String,
      title: '计算规则',
    },
    regexp: {
      type: DataType.String,
      title: '正则校验',
    },
    regexpText: {
      type: DataType.String,
      title: '正则错误提示',
    },
  },
} as ObjectPropertyInfo;

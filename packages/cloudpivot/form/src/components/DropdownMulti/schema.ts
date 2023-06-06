/*
 * @Author: your name
 * @Date: 2020-04-22 10:08:34
 * @LastEditTime: 2020-04-29 18:29:18
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\cloudpivot\form\src\components\Dropdown\schema.ts
 */
import { selectControlOptions } from '../../../../form/component-schema';
import { DataType, ObjectPropertyInfo } from '../../../../form/typings';
export default {
  $id: 'dropdown',
  type: DataType.Object,
  $ref: selectControlOptions.$id,
  properties: {
    options: {
      type: DataType.String,
      title: '选项',
      default: '',
    },
    widgetType: {
      type: DataType.Number,
      title: '控件类型',
    },
    dataItemType: {
      type: DataType.String,
      title: '数据项类型',
    },
    displayEmpty: {
      type: DataType.Boolean,
      title: '是否显示空选项',
      default: true,
    },
    emptyValue: {
      type: DataType.String,
      title: '空选项显示值',
      default: '请选择',
    },
    multi: {
      type: DataType.Boolean,
      title: '是否多选',
      default: true,
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
  },
} as ObjectPropertyInfo;

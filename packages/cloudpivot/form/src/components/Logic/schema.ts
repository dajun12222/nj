import { ObjectPropertyInfo, DataType } from '../../../../form/typings';
import { editableControlOptions } from '../../../../form/component-schema';
export default {
  $id: 'Boolean',
  type: DataType.Object,
  $ref: editableControlOptions.$id,
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
      type: DataType.RadioGroup,
      title: '默认值',
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

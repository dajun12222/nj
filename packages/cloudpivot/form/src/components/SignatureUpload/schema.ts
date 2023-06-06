import { baseUploadOptions } from '../../../../form/component-schema';
import { DataType, ObjectPropertyInfo } from '../../../../form/typings';
export default {
  $id: 'attachment',
  type: DataType.Object,
  $ref: baseUploadOptions.$id,
  properties: {
    widgetType: {
      type: DataType.Number,
      title: '控件类型',
    },
    dataItemType: {
      type: DataType.String,
      title: '数据项类型',
    },
    displayEnd: {
      type: DataType.String,
      title: '显示端',
      default: '移动端',
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

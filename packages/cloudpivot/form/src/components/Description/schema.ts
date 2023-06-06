import { DataType, ObjectPropertyInfo } from '../../../../form/typings';
export default {
  $id: 'description',
  type: DataType.Object,
  properties: {
    name: {
      type: DataType.String,
      title: '控件名称',
    },
    dataItemType: {
      type: DataType.String,
      title: '数据项类型',
    },
    displayFormula: {
      type: DataType.String,
      title: '显示条件',
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

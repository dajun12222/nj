import { ObjectPropertyInfo, DataType } from '../../../../form/typings';
import { styleControlOptions } from '../../../../form/component-schema';
export default {
  $id: 'formTitle',
  type: DataType.Object,
  $ref: styleControlOptions.$id,
  properties: {
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

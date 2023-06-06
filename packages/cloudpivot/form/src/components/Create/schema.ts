/*
 * @Author: zhuqiu
 * @Date: 2020-05-19 13:53:54
 * @LastEditTime: 2020-06-02 13:46:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\cloudpivot\form\src\components\Create\schema.ts
 */
import { ObjectPropertyInfo, DataType } from '../../../typings';
import { styleControlOptions } from '../../../component-schema';
export default {
  $id: 'create',
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
    mappings: {
      type: DataType.String,
      title: '映射关系',
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

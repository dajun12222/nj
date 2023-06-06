/*
 * @Date: 2020-05-19 13:53:54
 * @LastEditors: zhuqiu
 * @LastEditTime: 2020-06-16 16:08:38
 * @FilePath: \frontend\modules\cloudpivot\form\src\components\Tabs\schema.ts
 */
import { ObjectPropertyInfo, DataType } from '../../../../form/typings';
export default {
  $id: 'tabs',
  type: DataType.Object,
  properties: {
    heads: {
      type: DataType.Array,
      title: '标签设置',
    },
    useFor: {
      type: DataType.Array,
      title: '标签所设条件用于',
      default: '2',
    },
    tabDefaultValue: {
      type: DataType.String,
      title: '默认选项',
      default: '',
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

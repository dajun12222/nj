/*
 * @Author: your name
 * @Date: 2020-04-22 11:25:39
 * @LastEditTime: 2020-04-27 10:50:08
 * @LastEditors: Fan
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\cloudpivot\form\src\components\ImageUpload\schema.ts
 */
import { baseUploadOptions } from '../../../../form/component-schema';
import { DataType, ObjectPropertyInfo } from '../../../../form/typings';
export default {
  $id: 'picture-card',
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
    number: {
      type: DataType.String,
      title: '上传数量 ',
      default: 'batch',
    },
    addWatermark: {
      type: DataType.Boolean,
      title: '水印',
    },
    watermarkFontSize: {
      type: DataType.RadioGroup,
      title: '水印字体大小',
    },
    imageQuality: {
      type: DataType.Integer,
      title: '图片质量',
      default: 30,
    },
    compressible: {
      type: DataType.Boolean,
      title: '压缩',
    },
    onlyShoot: {
      type: DataType.Boolean,
      title: '只允许拍照',
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

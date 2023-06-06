/*
 * @Author: your name
 * @Date: 2020-04-22 10:08:34
 * @LastEditTime: 2020-05-12 16:36:07
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\cloudpivot\form\src\components\Attachment\schema.ts
 */
import { ObjectPropertyInfo, DataType } from '../../../typings';
import { baseUploadOptions } from '../../../component-schema';
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
    fileTypes: {
      type: DataType.String,
      title: '限定文件类型',
      tip: {
        content:
          '设置附件上传的文件名格式，限定类型为office、图片、压缩包等，示例:.jpg,.gif.<br>以下类型不支持:<br>.php.php5.php4.php3.php2.php1&nbsp;.html.htm.phtml.pHp.pHp5.pHp4.pHp3.pHp2.pHp1&nbsp;.Html.Htm.pHtml.jsp.jspa.jspx.jsw.jsv.jspf.jtml.jSp&nbsp;.jSpx.jSpa.jSw.jSv.jSpf.jHtml.asp.aspx.asa.asax&nbsp;.ascx.ashx.asmx.cer.aSp.aSpx.aSa.aSax.aScx.aShx.aSmx.cEr.sWf.swf',
        icon: 'question-circle-o',
      } as any,
      dom: 'a-textarea',
    },
    dataLinkage: {
      type: DataType.String,
      title: '数据联动',
    },
    displayTemplate: {
      type: DataType.Boolean,
      title: '附件模板',
      default: true,
      tip: {
        content: '附件模板上传数量不能超过十个',
        icon: 'question-circle-o',
      } as any,
    },
    templateFile: {
      type: DataType.String,
      title: '上传模板',
    },
    labelVisible: {
      type: DataType.Checkbox,
      title: '标题显示',
      default: true,
    },
    limitNumber: {
      type: DataType.RadioGroup,
      title: '附件数量',
      default: 'unlimited',
    },
    fileNumber: {
      type: DataType.Integer,
      title: '文件个数',
      default: 1,
      tip: {
        content: '附件个数支持1-1000',
        icon: 'question-circle-o',
      } as any,
    },
    batch: {
      type: DataType.Boolean,
      title: '批量下载',
      default: true,
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

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/

import { schema } from 'cloudpivot/form';
export interface Property {
  [key: string]: any;
}

export class BizRuleProperty implements Property {
  // 消息提醒节点
  'MESSAGE': {
    // 接收人
    receiver: {
      type: 'array';
      controlType: schema.FormControlType.StaffSelector;
      items: {
        type: 'user';
      };
    };
    // 数据标题
    dataTitle: {
      type: 'array';
      controlType: schema.FormControlType.Text;
      items: {
        type: 'any';
      };
    };
    // 通知内容
    notice: {
      type: 'string';
      controlType: schema.FormControlType.Text;
    };
    required: ['receiver', 'dataTitle', 'notice'];
  };
}

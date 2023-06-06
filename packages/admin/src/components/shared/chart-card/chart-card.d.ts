/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { workflow } from 'cloudpivot/api';

export interface ChartCardOptions {
  data?: workflow.WorkflowTrackLog | any; // 流程跟踪日志纪律
  rect?: DOMRect; // 需要定位元素的Rect,
  cardType?: string; // 弹框类型
  title?: string; // 弹框名称
}

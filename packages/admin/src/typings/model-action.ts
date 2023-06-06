/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/**
 * 标记定位类型
 */
export enum ModalActionTypes {
  DataModel = 1,
  Form = 2,
  Workflow = 3,
  List = 4,
}

export enum ModelType {
  // 业务模型
  BizModal = 'BizModel',
  // 自定义页面
  Page = 'Page',

  Report = 'Report',
}

export interface ModelActionItem {
  type: number;
  code: string;
  bizSchemaCode: string;
}

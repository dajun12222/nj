/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export interface ListItem {
  code: string;

  icon: string;

  id: string;

  name: string;

  schemaCode: string;

  queryPresentationType: string;
}

export interface SortParams {
  code: string;

  schemaCode: string;

  sortKey: number;
}

export interface ShowOnParams {
  code: string;

  schemaCode: string;

  showOnMobile: boolean;

  showOnPc: boolean;
}

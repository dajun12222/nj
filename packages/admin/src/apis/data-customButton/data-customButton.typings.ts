/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export interface customModel {
  actionConfig: string;
  bindAction?: string;
  code: string;
  createdBy?: string;
  createdTime?: string;
  deleted?: boolean;
  description?: string;
  hint?: string;
  id?: string;
  modifiedBy?: string;
  modifiedTime?: string;
  name: string;
  operateType: string;
  remarks?: string;
  schemaCode?: string;
  targetCode?: string;
  targetObjCode?: string;
  useLocation?: string;
}

export interface DataActionConfig {
  viewType?: string;
  callType?: string;
  schemaCode?: any;
  viewXListData?: any;
}

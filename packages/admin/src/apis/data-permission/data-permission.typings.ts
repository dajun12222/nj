/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export interface getParams {
  schemaCode: string;
}

export interface permissionProperty {
  bizPermType: number;
  groupId?: string;
  id?: string;
  modifiedTime?: string;
  name: string;
  name_i18n: string;
  propertyCode: string;
  propertyType: number;
  required: boolean;
  visible: boolean;
  writeAble: boolean;
  schemaCode?: string; // 父级数据项code
}

export interface updateParams {
  enabled: boolean;
  id?: string;
  modifiedTime?: string;
  name?: string;
  name_i18n?: string;
  permProperties: Array<permissionProperty>;
  roles: any;
  departments: any;
  schemaCode: string;
}

export interface deleteParams {
  groupId: string;
}

export interface getPropertyParams extends deleteParams {}

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export enum DatabaseType {
  Mysql = 0,
  Oracle = 1,
  SqlServer = 2,
  PostgreSQL = 3,
}

export interface createParams {
  code: string;
  databaseType: DatabaseType;
  description: string;
  datasourceType: string;
  jdbcUrl: string;
  name: string;
  password: string;
  username: string;
  externInfo: {
    sysNr: string;
    sapRouter: string;
    sapUrl: string;
    client: string;
  };
}

export interface deleteParams {
  id: string;
}

export interface getByCodeParams {
  code: string;
}

export interface getByIdParams {
  id: string;
}

export interface updateParams extends createParams {
  id: string;
}

export interface poolItem extends updateParams {
  deleted: boolean;
  modifiedTime: string;
  index?: number;
}

export interface searchParams {
  key: string;
}

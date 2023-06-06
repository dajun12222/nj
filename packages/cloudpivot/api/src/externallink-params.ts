export interface GetShortCodeParams {
  schemaCode: string; // 模型编码
  formCode: string;
  objectId: string;
}

export interface GenerateShortCodeParams {
  url: string;
  type: number;
  expireTime: number;
  uniqueCode?: string;
}

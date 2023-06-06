/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
declare namespace OAuth {
  export interface RequestParams {
    // 定义请求参数结构
    client_id: string;
    client_secret: string;
    grant_type: string;
    redirect_uri: string;
    code: string | null;
  }
  export interface Data {
    token_type: string;
    expires_in: number;
    scope: string;
    client: string;
    username: string;
    jti: string;
    T: string;
    refresh_token: string;
  }

  export interface Response {
    data: Data;
  }
}

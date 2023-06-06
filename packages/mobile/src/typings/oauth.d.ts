/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
declare namespace OAuth {
  interface RequestParams {
    // 定义请求参数结构
    client_id: string;
    code: string;
    scope?: string;
    state?: string;
  }

  interface Userinfo {
    id: string;
    name: string;
    username: string;
  }

  interface Response {
    errcode: number;
    T: string;
    refresh_token: string;
    user_id: string;
    scope: string[];
    mobile: boolean;
    expiration: number;
    token_type: string;
    expires_in: number;
    userinfo: Userinfo;
  }

  interface FormUrlParams {
    messageId: string;
  }

  interface GetFormUrlParams {
    formCode?: string;
    schemaCode: string;
    bizObjectId: string;
  }
}

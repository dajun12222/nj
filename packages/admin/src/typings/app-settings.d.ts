/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
declare module AppSettings {
  interface baseForm {
    code: string;
    name: string;
    enabled: boolean;
    logoUrlId?: string;
    logoUrl?: string;
    groupId?: string;
  }

  interface deployForm {
    appKey: string;
    appSecret: string;
    agentId: string;
  }

  interface uploadParam {
    file: File;
    rewriteFilename?: boolean;
  }

  interface uploadResponse {
    errcode?: number;
    errmsg?: string;
    data: {
      fileExtension: string;
      fileSize: number;
      id: string;
      mimeType: string;
      name: string;
      refId: string;
      schemaCode: string;
      storageMethod: string;
    };
  }
}

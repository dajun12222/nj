/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
declare namespace BPM {
  export namespace SingleApp {
    /**
     * 单应用分组
     */
    export interface AppGroup {
      title?: string;
      childrens: Array<AppGroupItem>;
    }
    /**
     * 单应用分组表单
     */
    export interface AppGroupItem {
      name: string;
      icon: string;
      code: string;
      type: string;
      openMode: string;
      pcUrl: string;
    }
  }
}

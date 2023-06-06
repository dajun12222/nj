/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
declare namespace treeSelector {
  interface treeItem {
    title: string;
    value: string;
    key: string;
    children?: Array<treeItem>;
    isLeaf: boolean;
    selectable?: boolean;
    dataRef?: {
      type?: string;
    };
    _loaded?: boolean;
    // scopedSlots?: {
    //   title: string
    // }
  }
}

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export declare namespace NodeGraphType {
  export interface Node {
    code: string;
    name?: string;
  }

  export interface Link {
    start: Node;
    end: Node;
  }

  export interface Route {
    originNode: Node;
    crossNodes: Array<Node>;
    arrowNode: Node | null;
  }
}

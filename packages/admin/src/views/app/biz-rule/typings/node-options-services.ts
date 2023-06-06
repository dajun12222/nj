/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { NodeType } from './node-type';

import * as optFactory from './node-options';

export abstract class NodeOptionsServices {
  static nodeOptFactory(nodeType: NodeType) {
    switch (nodeType) {
      case NodeType.BizAction:
        return new optFactory.NodeBizAction();
      case NodeType.Create:
        return new optFactory.NodeCreate();
      case NodeType.Delete:
        return new optFactory.NodeDelete();
      case NodeType.GetList:
        return new optFactory.NodeGetList();
      case NodeType.LogicVerify:
        return new optFactory.NodeLogicVerify();
      case NodeType.Message:
        return new optFactory.NodeMessage();
      case NodeType.Update:
        return new optFactory.NodeUpdate();
      case NodeType.DataVerify:
        return new optFactory.NodeDataVerify();
      default:
        break;
    }
  }
}

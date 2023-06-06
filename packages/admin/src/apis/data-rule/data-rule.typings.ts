/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export interface ListParams {
  schemaCode: string;
}

export interface CreateParams {
  ruleModel: RuleModel;
}

export interface RuleModel {
  conditionJoinType: number;
  enabled?: boolean;
  id?: string;
  triggerSchemaCodeIsGroup?: boolean; // 触发对象是否是 主表 + 子表
  name: string;
  ruleActionJson: string;
  ruleScopeJson: string;
  dataConditionJson: string;
  sourceSchemaCode: string; // 当前模型编码
  targetSchemaCode: string;
  triggerActionType: number;
  triggerConditionType: number;
  triggerSchemaCode: string;
  chooseAction: string;
  dataConditionJoinType: number;
  targetTableCode: string;
  ruleScopeChildJson: string;
  ruleActionMainScopeJson: string;
  insertConditionJoinType: number;
}

export interface UpdateEnableParams {
  id: string;
  enable: boolean;
}

export interface IdParams {
  id: string;
}

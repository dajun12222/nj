/**
 * 待办
 */
export interface Workitem {
  /* ID */
  id: string;

  isChecked?: boolean; // 是否选中,动态添加的
  /* 流程名称 */
  instanceName: string;

  /* 当前节点名称 */
  activityName: string;

  /* 停留时间 */
  stayTime: number;

  remainingTime: number;

  /* 流程状态 */
  workItemTimeoutStatus: string;

  /* 发起人 */
  originatorName: string;

  /* 接收时间 */
  startTime: string;

  /* 审批时间 */
  finishTime: string;

  /* 是否勾选处理为已阅 */
  checked?: boolean;

  instanceId: string;

  /** 流程状态 */
  state: string;

  name_i18n?: any;

  sourceName_i18n?: any;
}
/**
 * 待阅
 */
export interface FinishWorkitem {
  activityName: string;

  instanceName: string;

  /* 接收时间 */
  startTime: string;

  /* 流程状态 */
  workflowInstanceState: string;

  /* 发起人 */
  originatorName: string;

  /* 审批状态 */
  approval: number;

  // 自定义按钮名称
  approvalName?: string;

  instanceId: string;

  id: string;

  name_i18n?: any;
}

/**
 * 列表查询关键字
 */
export interface QueryParams {
  // 流程名称
  workflowName: string;

  // 页码
  page: number;

  // 分页大小
  size: number;

  appCode?: string;
}

export interface QueryAwaitParams {
  // 关键字
  wd: string;

  // 页码
  page: number;

  // 分页大小
  size: number;

  batchOperate?: boolean; // 批量处理

  appCode?: string;
  workItemSource?: any;
}

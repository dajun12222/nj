/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
declare namespace Index {
  /**
   * 待办
   */
  export interface Workitem {
    /* ID */
    id: string;

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

    instanceId: string;

    id: string;
  }

  /**
   * 列表查询关键字
   */
  interface QueryParams {
    // 流程名称
    workflowName: string;

    // 页码
    page: number;

    // 分页大小
    size: number;

    appCode?: string;
  }

  interface QueryAwaitParams {
    // 关键字
    wd: string;

    // 页码
    page: number;

    // 分页大小
    size: number;

    appCode?: string;

    workItemSource?: any;
  }
}

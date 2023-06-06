/*
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-17 17:24:01
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-27 12:25:48
 */
export default {
  MyUnFinishedWorkItem: () => import('./my-unfinished-workItem-new.vue'),
  MyUnReadWorkItem: () => import('./my-unread-workitem-new.vue'),
  MyFinishedWorkItem: () => import('./my-finished-workitem-new.vue'),
  MyReadWorkItem: () => import('./my-read-workitem-new.vue'),
  MyWorkflow: () => import('./my-workflow-new.vue'),
  QueryInstance: () => import('./query-instance-new.vue'),
  TaskSearch: () => import('./task-search-new.vue'),
  WorkflowCenterMenu: () => import('./menu/workflow-center-menu.vue'),
  StartWorkflow: () => import('./start-workflow-new.vue'),
  DelegationWorkflow: () => import('./delegation-workflow.vue'),
  myComments: () => import('./my-comments.vue'),
};

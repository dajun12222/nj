/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export default [
  {
    path: '/form/workflow-track/:workflowInstanceId/:workItemId/',
    name: 'flowTrack',
    meta: {
      hideFootbar: true,
      title: '流程跟踪',
    },
    component: () => import('@/views/form/workflow-track.vue'),
  },
  {
    path: '/form/approval/:workflowInstanceId',
    name: 'FormApproval',
    meta: {
      hideFootbar: true,
      title: '流程跟踪',
    },
    component: () => import('@/views/form/workflow-track.vue'),
  },
  {
    path: '/form/approval-details',
    name: 'FormApprovalDetails',
    meta: {
      hideFootbar: true,
      title: '流程跟踪',
    },
    component: () => import('@/views/form/form-approval-details.vue'),
  },
];

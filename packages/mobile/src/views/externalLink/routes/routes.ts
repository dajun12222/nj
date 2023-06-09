/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/*
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-08-18 19:20:43
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-09-15 16:04:28
 */

export default {
  home: {
    path: '/',
    // redirect: 'home'
    meta: {
      hideFootbar: true,
      title: ' ',
    },
  },
  'form-detail': {
    path: '/form/external-link',
    name: 'form-detail',
    props: true,
    meta: {
      hideFootbar: true,
      title: ' ',
    },
    component: () => import('@/views/form/form-detail.vue'),
  },
  FormApproval: {
    path: '/form/approval/:workflowInstanceId',
    name: 'FormApproval',
    meta: {
      hideFootbar: true,
      title: ' ',
      titleKey: 'workflowTrack',
    },
    component: () => import('@/views/form/workflow-track.vue'),
  },
  WorkflowUpdateTenedor: {
    path: '/form/workflowUpdateTenedor/:workflowInstanceId',
    name: 'WorkflowUpdateTenedor',
    meta: {
      hideFootbar: true,
      title: ' ',
      titleKey: 'WorkflowUpdateTenedor',
    },
    component: () => import('@/views/form/workflow-update-tenedor.vue'),
  },
  WorkflowAdjustment: {
    path: '/form/WorkflowAdjustment/:workflowInstanceId',
    name: 'WorkflowAdjustment',
    meta: {
      hideFootbar: true,
      title: ' ',
      titleKey: 'WorkflowAdjustment',
    },
    component: () => import('@/views/form/workflow-adjustment.vue'),
  },
  sharedSuccess: {
    path: '/shared/success/:shortCode',
    name: 'shared-success',
    props: true,
    meta: {
      hideFootbar: true,
      title: ' ',
    },
    component: () => import('../components/success/success.vue'),
  },
};

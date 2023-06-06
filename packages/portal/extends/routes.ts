import RouterView from '@/views/common-view/index.vue';
export default {
  applicationRole: {
    root: {
      path: '/',
      name: 'applicationCenterRoot',
      component: () => import('@/views/workflow-center/workbenchInfo/workbenchView.vue'),
      redirect: { name: 'application' },
    },

    application: {
      path: '/application-role',
      name: 'application',
      component: RouterView,
      children: [
        {
          path: 'role',
          name: 'applicationList',
          component: () => import('./views/role/application-role.vue'),
        },
      ]
    }
  },
} as any;

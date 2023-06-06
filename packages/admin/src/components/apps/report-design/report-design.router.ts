/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/

export default [
  // {
  //   path: ':appCode/report-design/:reportCode/isNew/:isNew',
  //   name: 'report-design',
  //   // meta: { title: '云枢-报表设计' },
  //   props: true,
  //   component: () => import('./report-design.vue'),
  // },
  {
    path: ':appCode/report-design/:reportCode/data-source-list',
    name: 'ReportDataSourceList',
    // meta: { title: '云枢-报表设计' },
    props: true,
    component: () => import('./data-source/list.vue'),
  },
  {
    path: ':appCode/report-design/:reportCode/data-source-designer',
    name: 'ReportDataSourceDesigner',
    // meta: { title: '云枢-报表设计' },
    props: true,
    component: () => import('./data-source/design.vue'),
  },

  {
    path: ':appCode/report-design/:reportCode/isNew',
    name: 'reportDesignRoute',
    props: true,
    component: () => import('@/views/appRouterview.vue'),
    children: [
      {
        path: '/',
        redirect: { name: 'report-design' },
      },
      {
        path: ':isNew',
        name: 'report-design',
        props: true,
        component: () => import('./report-design.vue'),
      },
    ],
  },
];

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/

export default [
  {
    path: '/form/detail',
    name: 'form-detail',
    props: true,
    meta: {
      hideFootbar: true,
    },
    component: () => import('@/views/form/form-detail.vue'),
  },
  {
    path: '/form/empty',
    name: 'form-empty',
    props: true,
    meta: {
      hideFootbar: true,
    },
    component: () => import('@/views/form/empty.vue'),
  },
];

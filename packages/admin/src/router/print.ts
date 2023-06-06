/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export default [
  {
    path: 'model/:appCode/:bizSchemaCode/print-template/:printCode/:version',
    name: 'print-template',
    meta: { title: '云枢-打印模板设计' },
    component: () => import('@/views/print-template/index.vue'),
  },
  {
    path: 'model/:appCode/:bizSchemaCode/pre-view',
    name: 'pre-view',
    meta: { title: '云枢-打印模板预览' },
    component: () => import('@/views/print-template/pre-view.vue'),
  },
];

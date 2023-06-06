/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/

export const formDesignRouter = {
  path: 'form-design/:sheetCode',
  name: 'form-design',
  meta: { title: '云枢-表单设计' },
  props: true,
  component: () => import('./form-design.vue'),
};

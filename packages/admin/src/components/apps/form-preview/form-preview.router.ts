/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/

export const formPreviewRouter = {
  path: 'form-preview/:sheetCode',
  name: 'form-preview',
  meta: { title: '云枢-表单设计-预览' },
  props: true,
  component: () => import('./form-preview.vue'),
};

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/

export const listPreviewRouter = {
  path: 'list-preview/:code',
  name: 'list-preview',
  meta: { title: '云枢-数据视图-预览' },
  props: true,
  component: () => import('./list-preview.vue'),
};

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export const listDesignRouter = {
  path: 'list-design/:code',
  name: 'list-design',
  meta: { title: '云枢-数据视图' },
  props: true,
  component: () => import('@/views/app/listDesign/listDesign-index.vue'),
};

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import Vue from 'vue';
import ChartCard from './chart-card.vue';
import { ChartCardOptions } from './chart-card';

export default (options: ChartCardOptions, fn?: any) => {
  const Instance: Vue = new Vue({
    destroyed: () => document.body.removeChild(Instance.$el),
    render: (h: any) =>
      h(ChartCard, {
        props: Object.assign({}, options, { fn }),
        on: {
          destroy: () => Instance.$destroy(),
        },
      }),
  } as any);
  const component = Instance.$mount();
  document.body.appendChild(component.$el);
};

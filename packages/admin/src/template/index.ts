/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { TemplateHandle } from './template';

const temp = new TemplateHandle((template: any) => {
  console.log(template);
  if ((window.top as any).initCustomForm) {
    (window as any)._templateSourse = template;
    (window.top as any).initCustomForm(template);
  }
});

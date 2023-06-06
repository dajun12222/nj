/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/*
 * @Author: nooldey <nooldey@gmail.com>
 * @Date: 2020-04-14 21:44:36
 * @Last Modified by: nooldey
 * @Last Modified time: 2020-04-15 16:12:23
 * 文本超出隐藏时添加title展示
 */

/**
 * 需搭配样式使用：
 * eg:
 
 <span class="ellipsis" v-ellipsis="i-am-title-to-be-ellipsis">i-am-title-to-be-ellipsis</span>
 <style>
 .ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  \/* autoprefixer: ignore next *\/
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
 }
</style>
 */
import { Vue } from 'vue-property-decorator';

const dealEllipsis = (el: any, title: string) => {
  const containerSize = el.getBoundingClientRect();

  const containerWidth = containerSize.width;
  const textWidth = el.scrollWidth;
  const containerHeight = containerSize.height;
  const textHeight = el.scrollHeight;
  const isEllipsis = textWidth > containerWidth || textHeight > containerHeight;

  if (isEllipsis) {
    el.setAttribute('title', title);
  } else {
    el.removeAttribute('title');
  }
};

Vue.directive('ellipsis', function (el: any, binding: any) {
  dealEllipsis(el, binding.value);

  const task: any = null;
  function dealResize() {
    clearTimeout(task);
    setTimeout(function () {
      dealEllipsis(el, binding.value);
    }, 200);
  }

  window.addEventListener('resize', dealResize);
});

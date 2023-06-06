/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { Vue } from 'vue-property-decorator';

const noxss = (text: string) => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

Vue.directive('hight-light', {
  bind(el: any, binding: any) {
    let targetStr = binding.value.value;
    if (binding.value.keyWords && binding.value.keyWords.length > 0) {
      const replaceReg = new RegExp(binding.value.keyWords, 'g');
      const replaceString =
        '<span class="highlight" style="color: #2970ff">' +
        noxss(binding.value.keyWords) +
        '</span>';
      targetStr = targetStr.replace(replaceReg, replaceString);
    } else {
      targetStr = noxss(targetStr);
    }
    el.innerHTML = `${targetStr}`;
  },
  update(el: any, binding: any) {
    let targetStr = binding.value.value;
    if (binding.value.keyWords && binding.value.keyWords.length > 0) {
      const replaceReg = new RegExp(binding.value.keyWords, 'g');
      const replaceString =
        '<span class="highlight" style="color: #2970ff">' +
        noxss(binding.value.keyWords) +
        '</span>';
      targetStr = targetStr.replace(replaceReg, replaceString);
    } else {
      targetStr = noxss(targetStr);
    }
    el.innerHTML = `${targetStr}`;
  },
});

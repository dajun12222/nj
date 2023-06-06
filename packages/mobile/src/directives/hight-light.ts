/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { Vue } from 'vue-property-decorator';

Vue.directive('hight-light', {
  bind(el: any, binding: any) {
    let targetStr = binding.value.value;
    if (binding.value.keyWords && binding.value.keyWords.length > 0) {
      const replaceReg = new RegExp(binding.value.keyWords, 'g');
      const replaceString =
        '<span class="highlight">' + binding.value.keyWords + '</span>';
      targetStr = targetStr.replace(replaceReg, replaceString);
    }
    el.innerHTML = `${targetStr}`;
  },
  update(el: any, binding: any) {
    let targetStr = binding.value.value;
    if (binding.value.keyWords && binding.value.keyWords.length > 0) {
      const replaceReg = new RegExp(binding.value.keyWords, 'g');
      const replaceString =
        '<span class="highlight">' + binding.value.keyWords + '</span>';
      targetStr = targetStr.replace(replaceReg, replaceString);
    }
    el.innerHTML = `${targetStr}`;
  },
});

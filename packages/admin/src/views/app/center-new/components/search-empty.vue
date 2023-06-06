<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="searc-empty">
    <img src="@/assets/images/search-empty.svg" />
    <p>搜索无结果</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'searchEmpty',
  components: {},
})
export default class searchEmpty extends Vue {}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.searc-empty {
  text-align: center;
  margin-top: 152px;

  p {
    font-size: 14px;
    color: @light-font-color;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="custom-page">
    <iframe :src="customMobileUrl" class="iframe" frameborder="0"></iframe>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: '',
})
export default class ComponentName extends Vue {
  get customMobileUrl() {
    return this.$route.query.customMobileUrl;
  }
}
</script>

<style lang="less" scoped>
.custom-page {
  width: 100%;
  height: 100%;

  .iframe {
    width: 100%;
    height: 100%;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->

<template>
  <div class="header">
    <div class="logo">
      <img src="@/assets/images/yslogo.png" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'empty-header',
})
export default class EmptyHeader extends Vue {}
</script>

<style lang="less" scoped>
@import '../../../styles/themes/default.less';

.logo img {
  max-height: 30px !important;
}
</style>

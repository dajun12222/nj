<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="custom-page">
    <img src="@/assets/images/admin-page.png" alt="暂无" />
    <span class="title">在前台可预览</span>
  </div>
</template>

<script>
export default {};
</script>

<style lang="less" scoped>
.custom-page {
  width: 100vw;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7f8fa !important;
  padding-bottom: 123px;
  img {
    width: 204px;
    height: 204px;
  }
  .title {
    position: relative;
    color: rgba(17, 18, 24, 0.5);
    font-size: 14px;
  }
}
</style>

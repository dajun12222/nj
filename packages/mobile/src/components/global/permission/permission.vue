<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="permission-box">
    <!-- <div class="permission-head">
      <img src="./yslogo.png"/>
    </div> -->
    <div class="no-permission">
      <img src="./nopermission.png" alt="" />
      <p>暂无权限查看当前页面</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'permission',
})
export default class Permission extends Vue {}
</script>

<style lang="less" scoped>
.permission-box {
  // todo: header独立
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: #f6f7f9 !important;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  & > .no-permission {
    text-align: center;
    & > img {
      width: 4.27rem;
    }
    & > p {
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 0.213rem;
    }
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-06 16:14:11
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:57:44
 * @FilePath: \yunshu6.0\packages\portal\src\views\shared\permission\permission.vue
 * @Description: 
-->
<template>
  <div class="permission-box">
    <div class="permission-head">
      <img src="./yslogo.png" />
    </div>
    <div class="no-permission">
      <img src="./nopermission.png" alt="" />
      <p>{{ $t('languages.common.noPermission') }}</p>
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
  .permission-head {
    width: 100%;
    height: 64px;
    line-height: 64px;
    padding-left: 24px;
    position: absolute;
    text-align: left;
    top: 0;
    left: 0;
    background: #fff;
    img {
      max-height: 30px !important;
    }
  }
  & > .no-permission {
    text-align: center;
    & > img {
      width: 304px;
    }
    & > p {
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 16px;
    }
  }
}
</style>

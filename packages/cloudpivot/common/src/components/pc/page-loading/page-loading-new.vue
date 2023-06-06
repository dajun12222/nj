<!--
 * @Descripttion: 页面loading滚动加载
 * @version: v6.8
 * @Author: baidongsheng
 * @Date: 2021-10-20 17:51:03
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-11-10 19:31:13
-->
<template>
  <!-- 该loading页面是加载中，加载完会继续挂在页面，定位在父元素里面,不会遮住其他元素 -->
  <div class="page-loading-new">
    <i
      :style="{ visibility: loading ? 'inherit' : 'hidden' }"
      class="icon aufontAll h-icon-all-loading-o"
    ></i>
    <span>{{
      loadingText || $t('cloudpivot.cloudpivotCommon.pc.loading')
    }}</span>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component({
  name: 'page-loading-new',
  components: {},
})
export default class PageLoadingNew extends Vue {
  @Prop({ default: String }) loadingText?: string;

  @Prop({ default: Boolean }) loading?: boolean;
}
</script>
<style lang="less">
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
@import './../../../../../common/common';
@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.page-loading-new {
  margin: 24px auto;
  text-align: center;
  font-size: 12px;
  color: @light-color-3;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 17px;
  line-height: 17px;
  .icon {
    font-size: 12px;
    width: 20px;
    height: 17px;
    line-height: 17px;
    display: inline-block;
    animation: loading linear 0.8s infinite;
    color: @highlightColor;
    margin-right: 10px;
    position: relative;
    // top: 2px;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-06 16:14:11
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:56:49
 * @FilePath: \yunshu6.0\packages\portal\src\views\single-app\index.vue
 * @Description: 
-->
<template>
  <div class="single-app">
    <app-header />
    <div class="single-app__main">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import * as FormCommentIns from 'cloudpivot/api';
import { Component, Vue } from 'vue-property-decorator';
import AppHeader from '../../components/single-app/app-header.vue';
@Component({
  name: 'single-app',
  components: {
    AppHeader,
  },
})
export default class SingleApp extends Vue {
  created() {
    FormCommentIns.FormCommentApi.getUserInfo().then((res: any) => {
      if (res.errcode === 0) {
        sessionStorage.setItem('user', JSON.stringify(res.data));
      }
    });
  }
}
</script>
<style lang="less" scoped>
@import '../../styles/themes/default.less';
.single-app {
  background: @main-background;
  &__main {
    flex: 1;
    position: relative;
    overflow: hidden;
    //   position: absolute;
    //   top: 64px;
    //   left: @base4-padding-md;
    //   right: @base4-padding-md;
    //   bottom: @base4-padding-md;
  }
}
</style>

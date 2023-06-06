<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-06 16:14:11
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:57:08
 * @FilePath: \yunshu6.0\packages\portal\src\views\single-app\home.vue
 * @Description: 
-->
<template>
  <div class="app-home">
    <app-home-content :appCode="appCode" />
  </div>
</template>

<script lang="ts">
import Application from 'cloudpivot/application/pc';
import { Component, Provide, Vue } from 'vue-property-decorator';

@Component({
  name: 'app-home',
  components: {
    AppHomeContent: Application.AppHomeContent,
  },
})
export default class AppHome extends Vue {
  // @State('appCode') appCode!: string;

  appCode: string = '';

  // get code() {
  //   if (!this.appCode) {
  //     return window.Environment.appCode || parseUrlParam(window.location.href, 'appCode') || '';
  //   }
  //   return this.appCode;
  // }

  get code() {
    return window.Environment.appCode || this.$route.query.appCode;
  }

  @Provide()
  environment() {
    return (window as any).Environment;
  }

  created() {
    if (this.code) {
      this.appCode = this.code;
      localStorage.setItem('appCode', this.code);
    } else {
      const appCode = localStorage.getItem('appCode');

      if (appCode) {
        this.appCode = appCode;
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import '../../styles/themes/default.less';
.app-home {
  position: absolute;
  left: @base4-padding-md;
  right: @base4-padding-md;
  bottom: @base4-padding-md;
  top: @base4-padding-md;
  // top: 14px;
  overflow: hidden;
}
</style>

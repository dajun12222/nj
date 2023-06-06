<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div id="app">
    <transition name="slide-fade">
      <router-view v-if="hideFootbar || isSingleApp" />
      <nav-viewer v-else />
    </transition>
  </div>
</template>
<style lang="less">
@import './styles/index.less';
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  text-align: center;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  line-height: 1.15 !important;
}
</style>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator';
import NavViewer from '@/views/nav-viewer.vue';

import OAuthApi from '@/apis/oauth';
import app from 'cloudpivot/common/src/constants/globalApplication';

@Component({
  name: 'App',
  components: {
    NavViewer,
  },
  // NOTE: 每次进入路由前判定是否展示底部导航栏，在路由加载完毕后再展示
  // beforeRouteUpdate(to, from, next) {
  //   console.log('......');
  //   const hide = to.meta && to.meta.hideFootbar === true;
  //   const vm = this as any;
  //   vm.hideFootbar = hide;
  //   // next((vm: any) => {
  //   //   vm.hideFootbar = hide;
  //   // });
  // }
})
export default class App extends Vue {
  hideFootbar: boolean = true;

  /**
   * 以下提供的所有Provide都是用于
   * 解决移动端控制台的找不到Inject
   * 报错引入的，没有实际价值
   */
  @Provide()
  getProcessNodeDialogDisable() {}

  @Provide()
  valueChange() {}

  @Provide()
  showTimeRanges() {}

  @Provide()
  formObjSource() {}

  get isSingleApp() {
    if (window.Environment.appCode) {
      return true;
    }
    return false;
  }

  beforeMount() {
    const vm = this as any;
    this.$router.afterEach((to, from) => {
      const hide = to.meta && to.meta.hideFootbar === true;
      vm.hideFootbar = hide;
    });
  }

  async mounted() {
    const config = await OAuthApi.getSystemConfig();
    if (config) {
      this.$store.commit('setConfig', config);
    }
    app.errorManager.getErrorCode();
  }
}
</script>

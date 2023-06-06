<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="app-router-view-wrap">
    <div id="app-menu" class="app-menu">
      <appMenu :appCode="appCode" />
    </div>

    <div class="router-view-wrap">
      <Header />
      <router-view class="container" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Provide } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { ConfigProvider } from '@h3/antd-vue';
import Header from './../components/global/header/index.vue';
import OAuthApi from '@/apis/oauth';
import app from 'cloudpivot/common/src/constants/globalApplication';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import 'moment/locale/zh-cn';
import { themesApi } from 'cloudpivot/api';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
const env = (window as any).config;

import appMenu from './app/center-new/components/app-menu.vue';

@Component({
  name: 'appRouterView',
  components: {
    Header,
    AConfigProvider: ConfigProvider,
    appMenu,
  },
})
export default class appRouterView extends Vue {
  appCode: string = '';

  created() {
    this.appCode = this.$route.params.appCode;

    themesApi.getThemesInfo().then((res: any) => {
      this.$store.commit('setThemsConfig', res);
      if (res.icon) {
        this.changeFavicon(this.getIcon(res.icon));
      }

      if (res.name && document.title.indexOf('云枢-') !== -1) {
        document.title = document.title.replace('云枢-', res.name + '-');
      }
    });
  }

  // 修改浏览器标签页上的小图标
  changeFavicon(link) {
    if (!link) {
      return;
    }
    let $favicon: any = document.querySelector('link[rel="icon"]');
    if ($favicon !== null) {
      $favicon.href = link;
    } else {
      $favicon = document.createElement('link');
      $favicon.rel = 'icon';
      $favicon.href = link;
      // @ts-ignore
      document.head.appendChild($favicon);
    }
  }

  //清除控制台报错
  @Provide()
  emitScrollTop(top: number) {
    this.$emit('scrollTop', top);
  }

  //清除控制台报错
  @Provide()
  showTimeRanges() {
    return true;
  }

  getIcon(refId: string) {
    return refId ? this.getDownloadUrlByRefId(refId) : '';
  }

  getDownloadUrlByRefId(refId: string): string {
    return getDownloadUrlNew.getImageUrl(refId, 'logo');
  }

  //@Getter('getAntLocale') locale!: string;
  switchHeader = false;

  get locale() {
    switch (this.$i18n.locale) {
      case 'en':
        return enUS;
      case 'zh':
      default:
        return zhCN;
    }
  }

  async mounted() {
    // 获取配置文件
    const config = await OAuthApi.getSystemConfig();
    if (config) {
      this.$store.commit('setConfig', config);
    }
    app.errorManager.getErrorCode();
  }

  @Watch('$route')
  routeChange(n: Route, o: Route) {
    this.switchHeader =
      n.fullPath.includes('print-template') || n.fullPath.includes('pre-view');
  }
}
</script>

<style lang="less" scoped>
.app-router-view-wrap {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  top: 0 !important;
  .app-menu {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 56px;
    z-index: 999;
  }
  .router-view-wrap {
    padding-left: 56px;
    .container {
      left: 0px !important;
      padding-left: 56px;
    }
  }
}
</style>

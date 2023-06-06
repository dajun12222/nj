<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-27 10:23:06
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:40:26
-->
<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <div v-show="webOrgrole">
        <div v-show="!switchHeader" class="head-wrap">
          <Header />
        </div>
        <div v-show="switchHeader">
        </div>
      </div>
      <div class="water">
        <waterMarker />
      </div>
      <router-view :class="{'container': !this.$route.fullPath.includes('pre-view'),'webOrgroleShow': !webOrgrole }" />
    </div>
  </a-config-provider>
</template>

<script lang="ts">
import { Component, Vue, Watch, Provide } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { ConfigProvider } from '@h3/antd-vue';
import Header from './components/global/header/index.vue';
import waterMarker from '../extends/view/watermark/index.vue';
import OAuthApi from '@/apis/oauth';
import app from 'cloudpivot/common/src/constants/globalApplication';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import 'moment/locale/zh-cn';
import { themesApi } from 'cloudpivot/api';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import RefreshToken from 'cloudpivot/common/src/utils/RefreshToken';

const env = (window as any).config;
@Component({
  name: 'apps',
  components: {
    Header,
    AConfigProvider: ConfigProvider,
    waterMarker
  },
})
export default class Apps extends Vue {

  showHeader: boolean = false;

  refreshTokenObj: any = null;

  created() {
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
  switchHeader:boolean = false;

  webOrgrole:boolean = true;

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
    //token刷新对象初始化操作
    this.refreshTokenObj = new RefreshToken();

    //关闭标签页或者关闭整个浏览器窗口时销毁定时器
    window.onbeforeunload = () => {
      this.refreshTokenObj.clearTimer();
    };

    // 获取配置文件
    const config = await OAuthApi.getSystemConfig();
    if (config) {
      this.$store.commit('setConfig', config);
    }
    app.errorManager.getErrorCode();
  }

  @Watch('$route', {
    immediate: true,
  })
  routeChange(n: Route, o: Route) {
    // eslint-disable-next-line
    let webOrgrole = true;
    if(n.path === '/web/organization/orgrole'){
      webOrgrole = false;
    }
    if(n.path === ('/apps/appsettings/' + n.params.appCode) && n.query && n.query.from && n.query.from === "define"){
      webOrgrole = false;
    }
    this.webOrgrole = webOrgrole;
    if(n.fullPath.includes('print-template') || n.fullPath.includes('pre-view')){
      this.switchHeader = true;
    }else{
      this.switchHeader = false;
    }
  }
}
</script>

<style>
 .ant-calendar-range-middle{
   padding: 0!important;
 }
 .water {
 	  position: fixed;
 	  left: 0;
 	  right: 0;
 	  top: 0;
 	  bottom: 0;
    z-index: 99999;
 	  pointer-events: none;
 	}
</style>

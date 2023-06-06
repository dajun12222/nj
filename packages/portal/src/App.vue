<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-17 17:24:00
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-18 17:39:10
-->
<template>
  <a-config-provider :locale="locale">
    <div id="app" :class="{'ie': isIe}">
      <div class="water">
        <waterMarker />
      </div>
      <router-view class="bpm-container" />
    </div>
  </a-config-provider>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ConfigProvider } from '@h3/antd-vue';

import OAuthApi from '@/apis/oauth';

import env from '@/config/env';

import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';

import app from 'cloudpivot/common/src/constants/globalApplication';

import 'moment/locale/zh-cn';
import { updateTheme } from './tools/settingConfig';

import { themesApi } from 'cloudpivot/api';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import RefreshToken from 'cloudpivot/common/src/utils/RefreshToken';
import waterMarker from '../extends/views/watermark/index.vue';
@Component({
  components: {
    AConfigProvider: ConfigProvider,
    waterMarker
  },
})
export default class App extends Vue {
  refreshTokenObj: any = null;

  get locale() {
    switch (this.$i18n.locale) {
      case 'zh':
      default:
        // return require('@h3/antd-vue/lib/locale-provider/zh_CN');
        return zhCN;

      case 'en':
        // return require('@h3/antd-vue/lib/locale-provider/en_US');
        return enUS;
    }
  }

  get isIe() {
    if (window.Environment && window.Environment.isIe !== undefined) {
      return window.Environment.isIe;
    }
    return false;
  }

  async mounted() {
    //token刷新对象初始化操作
    this.refreshTokenObj = new RefreshToken();

    //关闭标签页或者关闭整个浏览器窗口时销毁定时器
    window.onbeforeunload = () => {
      this.refreshTokenObj.clearTimer();
    };

    const config = await OAuthApi.getSystemConfig();
    if (config) {
      config.apiHost = env.apiHost;
      this.$store.commit('setConfig', config);
    }
    app.errorManager.getErrorCode();
  }

  async created() {
    await themesApi.getThemesInfo().then((res: any) => {
      this.$store.commit('setThemsConfig', res);
      if (res.icon) {
        this.changeFavicon(this.getIcon(res.icon));
        if (res.name && document.title.indexOf('奥哲云枢-') !== -1) {
          document.title = document.title.replace('奥哲云枢-', res.name + '-');
        } else if (res.name && document.title.indexOf('云枢-') !== -1) {
          document.title = document.title.replace('云枢-', res.name + '-');
        } else {
          //Else Empty block statement
        }
      }

      updateTheme({
        color: res.color || 'default',
        outwardType: res.outward || 'light',
        store: this.$store,
      });
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

  getIcon(refId: string) {
    return refId ? this.getDownloadUrlByRefId(refId) : '';
  }

  getDownloadUrlByRefId(refId: string): string {
    return getDownloadUrlNew.getImageUrl(refId, 'logo');
  }
}
</script>

<style lang="less">
@import url(./styles/common/global.less);
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

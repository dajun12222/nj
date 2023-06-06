<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="empty">
    <div class="empty__body">
      <img src="@/assets/images/success.png" />
      <p v-if="goBack">
        <h3-button type="primary" @click="back"> 返回 </h3-button>
      </p>
      <p v-if="openBrowser">浏览器中打开</p>
      <p v-if="isClose">
        <h3-button v-if="isClose" type="primary" @click="onClose">
          关闭
        </h3-button>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import * as platform from 'cloudpivot/platform';
import dd from 'dingtalk-jsapi';
import { H3Button } from 'h3-mobile-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'empty',
  components: {
    H3Button,
  },
})
export default class Empty extends Vue {
  @Prop() isClose: any;

  get isDingtalk() {
    return platform.IS_DINGTALK;
  }

  back() {
    const url = this.$route.query.return as string;
    if (url) {
      this.$router.replace({
        path: url,
      });
    } else {
      if (platform.IS_DINGTALK) {
        platform.service.close();
        // closeWindow();
      } else {
        this.$router.replace('/');
      }
    }
  }

  goBack = false; // 链接拥有 ?return=xxx

  openBrowser = false; // 链接拥有 ?openBrowser=true

  browserUrl = ''; // 跳转浏览器地址链接

  created() {
    const query = this.$route.query;
    for (const key of Object.keys(query)) {
      switch (key) {
        case 'return':
          if (query['return']) {
            this.goBack = true;
          }
          break;
        case 'openBrowser': // 在钉钉OA工作台 不能打开移动端页面, 需要跳转到PC端
          if (query['openBrowser'] && platform.IS_DINGTALK) {
            this.openBrowser = true;
            this.browserUrl = query['openBrowser'] as string;
          }
          break;
        default:
          break;
      }
    }
  }

  opBrowser() {
    const url = this.browserUrl;
    window.open(url as string, '_blank');
  }

  onClose() {
    // 钉钉
    if (this.isDingtalk) {
      dd.biz.navigation.close({});
      return true;
    }

    window.close();
    if (navigator.userAgent.indexOf('MSIE') > 0) {
      if (navigator.userAgent.indexOf('MSIE 6.0') > 0) {
        window.opener = null;
        window.close();
      } else {
        window.open('', '_top');
        window.top.close();
      }
    } else if (
      navigator.userAgent.indexOf('Firefox') > 0 ||
      navigator.userAgent.indexOf('Chrome') > 0
    ) {
      window.location.href = 'about:blank';
      window.close();
      //window.history.go(-2);
    } else if (navigator.userAgent.indexOf('DingTalk') > 0) {
      window.close();
    } else {
      window.opener = null;
      window.open('', '_self', '');
      window.close();
    }
  }
}
</script>

<style lang="less" scoped>
.empty {
  height: 100%;
  display: flex;

  &__body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
  }

  .h3-button {
    width: 5em;
    margin-top: 2em;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="top-header">
    <div v-if="$store.state.themesLoad" class="header-left flex-center">
      <img v-if="logoSrc" class="logo" :src="logoSrc" />
      <img v-else class="logo" src="~assets/images/logo.png" />
      <!-- <span>{{ $t('languages.ConsoleManager') }}</span> -->
    </div>
    <div class="header-content flex-center">
      <ul>
        <router-link
          v-for="(module, index) in userModules"
          :key="index"
          tag="li"
          :to="module.url"
          activeClass="active"
          class="flex-center cursor-pointer"
        >
          {{ $t('languages.' + module.code) }}
          <span
            v-if="module.code === 'SystemManager' && systemUnsetCount > 0"
            class="count-tips"
            >{{ systemUnsetCount }}</span>
        </router-link>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

import { State, namespace, Action } from 'vuex-class';

import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';

const UserModule = namespace('System/User');

const env = (window as any).config;

@Component({
  name: 'defaultheader',
})
export default class defaultheader extends Vue {
  @UserModule.State('isOnlyAppAdmin') isOnlyAppAdmin!: boolean;

  @Action('getConfigCount') getConfigCount: any;

  @State('systemUnsetCount') systemUnsetCount!: number;

  // @State('showSysSettingCount') showSysSettingCount!: boolean;

  modules: Array<Common.AppModule> = [];

  timer: any = 0;

  userModules: Array<Common.AppModule> = [];

  get logoSrc() {
    const refId: string = this.$store.state.themsConfig.backLogo;
    return refId ? this.getDownloadUrlByRefId(refId) : '';
  }

  getDownloadUrlByRefId(refId: string): string {
    return getDownloadUrlNew.getImageUrl(refId, 'logo');
  }

  // beforeMount() {
  //   this.modules =
  // }
  created() {
    this.autoGetConfigCount();
    this.modules = [
      {
        code: 'AppManager',
        url: '/apps',
      },
      {
        code: 'Organization',
        url: '/organization',
      },
      {
        code: 'BizIntegration',
        url: '/integration',
      },
      {
        code: 'SystemManager',
        url: '/system',
      },
    ];

    this.userModules = this.modules;

    // 20200605 已跟产品沟通，应用(子)管理员允许进入业务集成
    // if (this.isOnlyAppAdmin) {
    //   this.userModules = this.modules.filter((res: any) => {
    //     return res.code === 'AppManager'|| res.code === 'Organization' || res.code === 'SystemManager'
    //   });
    // } else {
    //   this.userModules = this.modules;
    // }
  }

  autoGetConfigCount() {
    // clearTimeout(this.timer);
    this.getConfigCount();
    // this.timer = setTimeout(this.autoGetConfigCount, 8000)
  }

  @Watch('isOnlyAppAdmin')
  onIsAdminChange() {
    if (this.isOnlyAppAdmin) {
      this.userModules = this.modules.filter((res: any) => {
        return (
          res.code === 'AppManager' ||
          res.code === 'Organization' ||
          res.code === 'SystemManager'
        );
      });
    } else {
      this.userModules = this.modules;
    }
  }
}
</script>

<style lang="less" scoped>
@import '~styles/themes/index.less';
.header-content {
  width: 100%;
  height: 100%;
  // background: #052535;
  @media screen and (min-width: 850px) {
    ul {
      height: 100%;
      margin: 0;
      li {
        position: relative;
        height: 100%;
        float: left;
        margin: 0 20px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 16px;
        cursor: default;
        &.active {
          cursor: default !important;
          color: #fff;
          font-weight: 600;
          // border-bottom: 2px solid @primary-color;
          &::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 0;
            width: 100%;
            height: 0;
            border-bottom: 3px solid #fff;
          }
        }
        .count-tips {
          position: absolute;
          right: -6px;
          top: 11px;
          z-index: 9;
          display: inline-block;
          width: 20px;
          height: 20px;
          line-height: 20px;
          text-align: center;
          border: 1px solid #fff;
          color: #fff;
          font-size: 12px;
          border-radius: 50%;
          background: #f5222d;
        }
      }
    }
  }
  @media screen and (max-width: 850px) {
    ul {
      display: none;
    }
  }
}
.header-left {
  position: absolute;
  top: 0;
  left: 24px;
  height: 100%;

  .logo {
    display: inline-block;
    height: 26px;
  }
  span {
    margin-left: 20px;
    font-size: 18px;
    color: #fff;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="setting">
    <div class="setting-item">
      <ul>
        <li>
          <div>
            <span class="text">{{ $t('languages.common.version') }}</span>
            <span class="text">V{{ version }}</span>
          </div>
          <div class="icon"></div>
        </li>
        <li @click="showToggleLang">
          <div>
            <span class="text">{{
              $t('languages.common.toggleLanguage')
            }}</span>
            <span class="text">{{ curLanguage }}</span>
          </div>
          <div class="icon">
            <i class="icon aufontAll h-icon-all-right-o"></i>
          </div>
        </li>
      </ul>
    </div>
    <H3Actionsheet
      v-model="showActionSheet"
      class="sheet-adjust"
      :menus="actionSheetMenus"
      showCancel
      :cancelText="cancelText"
      @on-click-menu="clickActionSheetMenu"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

import { H3Actionsheet } from 'h3-mobile-vue';

import { utils } from 'cloudpivot/common';

import * as platform from 'cloudpivot/platform';

@Component({
  name: 'Setting',
  components: {
    H3Actionsheet,
  },
})
export default class Setting extends Vue {
  showActionSheet: boolean = false;

  actionSheetMenus: Array<any> = [];

  cancelText: string = '取消';

  get curLanguage() {
    platform.service.setTitle(`${this.$t('languages.common.settings')}`);
    switch (this.$i18n.locale) {
      case 'zh':
        return '中文';
      case 'en':
        return 'English';
      default:
        return '';
    }
  }

  get version() {
    return this.$store.state.config.systemVersion;
  }

  mounted() {
    this.setSheetMenus();
  }

  /*
   * 设置语言菜单国际化
   */
  setSheetMenus() {
    if (this.$i18n.locale === 'en') {
      this.cancelText = 'Cancel';
      this.actionSheetMenus = [
        {
          label: 'Chinese',
          type: 'Default',
          value: 'zh',
        },
        {
          label: 'English',
          type: 'Default',
          value: 'en',
        },
      ];
    } else {
      this.cancelText = '取消';
      this.actionSheetMenus = [
        {
          label: '中文',
          type: 'Default',
          value: 'zh',
        },
        {
          label: '英文',
          type: 'Default',
          value: 'en',
        },
      ];
    }
  }

  /**
   * 切换语言
   */
  toggleLanguage(lang: string) {
    this.$i18n.locale = lang;
    localStorage.setItem('locale', this.$i18n.locale);
    this.setSheetMenus();
    this.$forceUpdate();
  }

  showToggleLang() {
    this.showActionSheet = true;
  }

  clickActionSheetMenu(value: any) {
    if (value === 'cancel') {
      return;
    }
    this.toggleLanguage(value);
  }

  @Watch('showActionSheet')
  onShowActionSheetChange(v: boolean) {
    if (!v) {
      setTimeout(() => {
        utils.Bus.$emit('toggleNavbar', !v);
      }, 100);
    } else {
      utils.Bus.$emit('toggleNavbar', !v);
    }
  }
}
</script>
<style lang="less">
@import '~cloudpivot/common/styles/mixins.less';
.setting {
  .setting-item {
    .px2rem(margin-top, 40px);
    ul {
      li {
        background: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .px2rem(padding, 30px);

        div {
          span {
            .px2rem(font-size, 30px);
            display: inline-block;
            line-height: 1;
            &:first-of-type {
              color: rgba(102, 102, 102, 1);
              .px2rem(width, 145px);
            }
            &:last-of-type {
              color: rgba(51, 51, 51, 1);
              .px2rem(margin-left, 85px);
            }
          }
        }
      }
    }
  }
  .sheet-adjust {
    .h3ui-actionsheet__menu,
    .h3ui-actionsheet__action {
      color: #333333;
    }
  }
}
</style>

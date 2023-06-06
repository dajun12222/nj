<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div v-if="!noHeaderRouteName.includes($route.name)" :class="currentHeader">
    <header v-if="currentHeader" class="header-top" :class="$route.name">
      <!-- 左侧动态模块 -->
      <component :is="currentHeader" :modelNameInfo="modelNameInfo" />

      <div v-if="showTips" class="header-tips">
        <div class="header-tips-content"></div>
        <i class="icon aufontAll h-icon-all-exclamation-circle"></i>
        <span>{{ tipText }}</span>
      </div>

      <!-- 右侧静态模块 -->
      <div
        v-if="!hiddenRight.includes(currentHeader)"
        class="header-right flex-justify-between"
      >
        <a-tooltip placement="bottom">
          <template slot="title">{{ $t('languages.PortalManager') }} </template>
          <div class="li">
            <a @click="toProtal">
              <i class="iconfont aufontAll h-icon-all-home1"></i>
            </a>
          </div>
        </a-tooltip>
        <a-popover
          overlayClassName="help-center"
          placement="bottom"
          trigger="hover"
        >
          <template slot="content">
            <div class="help-placeholder"></div>
            <div class="help-content">
              <a
                class="content-li"
                href="https://www.yuque.com/skwme4/hyk0u0"
                target="_blank"
                title="用户手册"
              >
                <span>用户手册</span>
              </a>
              <a
                class="content-li"
                href="https://www.yuque.com/skwme4/grmb6s"
                target="_blank"
                title="视频教程"
              >
                <span>视频教程</span>
              </a>
              <a
                class="content-li"
                href="https://www.yuque.com/skwme4/hzo079"
                target="_blank"
                title="开发者手册"
              >
                <span>开发者手册</span>
              </a>
            </div>
          </template>
          <div class="li">
            <i class="icon aufontAll h-icon-all-book1"></i>
          </div>
          <!-- <span>{{$t("languages.common.helpCenter")}}</span> -->
          <!-- <i class="icon aufontAll h-icon-all-down-o small"></i> -->
        </a-popover>
        <!-- <span class="market-entrance" @click="onRouteToMarket" v-if="marketPortalSwitch">应用市场</span> -->
        <!-- v-if="isShowToggleLanguage" -->
        <a-tooltip placement="bottom">
          <template slot="title"> {{ $t('languages.Switch') }} </template>
          <div class="li">
            <a @click="toggleLanguage">
              {{ $i18n.locale === 'zh' ? 'EN' : '中文' }}
            </a>
          </div>
        </a-tooltip>
        <div class="user-info">
          <a-dropdown :trigger="['click']" placement="bottomRight">
            <a class="ant-dropdown-link">
              <span class="login-name">{{ loginedUserInfo.name }}</span>
              <i class="icon aufontAll h-icon-all-down-o small"></i>
            </a>
            <a-menu slot="overlay" class="header-dropdown">
              <a-menu-item class="nocursor">
                <a-avatar
                  v-if="
                    loginedUserInfo.imgUrl &&
                    loginedUserInfo.imgUrl.includes('http')
                  "
                  :src="loginedUserInfo.imgUrl"
                />
                <a-avatar
                  v-else-if="loginedUserInfo.imgUrl"
                  :src="getDownloadUrlNew(loginedUserInfo.imgUrl)"
                />
                <!-- <a-avatar v-if="loginedUserInfo.imgUrl" :src="loginedUserInfo.imgUrl"></a-avatar> -->
                <i
                  v-else
                  class="icon aufontAll h-icon-all-normal_smile default-avatar"
                ></i>
                <div>
                  <h3>{{ loginedUserInfo.name }}</h3>
                  <p>
                    <i class="icon aufontAll h-icon-all-tablet"></i>
                    <span>{{
                      loginedUserInfo.mobile ? loginedUserInfo.mobile : '--'
                    }}</span>
                  </p>
                </div>
              </a-menu-item>
              <a-menu-divider />
              <!-- 修改密码 -->
              <a-menu-item v-if="loginedUserInfo.username === 'admin'">
                <a @click="changePwd">
                  <span class="header-menu-content">{{
                    $t('languages.ChangePwd')
                  }}</span>
                </a>
              </a-menu-item>
              <a-menu-item>
                <a @click="exit">
                  <span class="header-menu-content">{{
                    $t('languages.Exit')
                  }}</span>
                </a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </div>
      <!-- <div class="tips" v-if="visible">
      <a-alert
        v-if="visible"
        banner
        showIcon
        :message="tipMsg"
        type="warning"
        closable
        :afterClose="handleClose"
      />
    </div>-->
      <a-modal
        v-model="visible"
        :width="566"
        style="top: 68px"
        wrapClassName="i18n-tips"
        :title="$t('languages.Prompt')"
        :maskClosable="false"
        :closable="true"
        :footer="null"
      >
        <div class="i18n-tips_content">
          <header>
            <i class="icon aufontAll h-icon-all-exclamation-circle-o"></i>
            <span>已切换到【{{
                $i18n.locale === 'zh' ? '中文' : '英文'
              }}模式】</span>
          </header>
          <article>
            <aside>
              应用名称、应用下的分组名称、模型名称、模型设计区名称（包括表单控件名称、流程节点名称、流程名称、表单名称、列表展示字段、查询条件名称、操作按钮名称等）
            </aside>
            <p>
              以上设置在编辑后将保存为{{
                $i18n.locale === 'zh' ? '中文' : '英文'
              }}名称
            </p>
          </article>
        </div>
        <img class="i18n-tips_gif" src="@/assets/images/i18n-guide.gif" />
        <div class="i18n-tips_button">
          <a-button type="primary" @click="handleClose">
            {{ $t('languages.Apps.DeleteOk') }}
          </a-button>
        </div>
      </a-modal>

      <EditUser v-model="showEditUser" />
    </header>
  </div>
</template>

<script lang="ts">
import {
  Layout,
  Modal,
  Tooltip,
  Dropdown,
  Avatar,
  Menu,
  Button,
  Popover,
} from '@h3/antd-vue';
import OAuthApi from '@/apis/oauth';
import systemApi from '@/apis/system/system-manager.api';
import env from '@/env.ts';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import EditUser from '../modal/edit-user.vue';
import AppHeader from './appHeader.vue';
import customPageHeader from './customPageHeader.vue';
import DataModelHearder from './datamodelheader.vue';
import DefaultHeader from './defaultHeader.vue';
import FormHistory from './formHistory.vue';
import WorkflowHistoryDetail from './workflowHistory.vue';
import FormHistoryDetail from './history.vue';
import SettingsHeader from './settingsHeader.vue';
import WorkflowMockHeader from './workflowMockHeader.vue';
import WorkflowSettingHeader from './workflowSettingHeader.vue';

const UserModule = namespace('System/User');

const MenuModule = namespace('Apps/AppItem');

const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'HeaderBar',
  components: {
    DefaultHeader,
    AppHeader,
    DataModelHearder,
    WorkflowSettingHeader,
    WorkflowMockHeader,
    SettingsHeader,
    EditUser,
    FormHistory,
    WorkflowHistoryDetail,
    FormHistoryDetail,
    Aside: Layout.Sider,
    AModal: Modal,
    ATooltip: Tooltip,
    ADropdown: Dropdown,
    AAvatar: Avatar,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AMenuDivider: Menu.Divider,
    AButton: Button,
    APopover: Popover,
    customPageHeader,
  },
})
export default class HeaderBar extends Vue {
  @UserModule.State('loginedUserInfo') loginedUserInfo!: any;

  @MenuModule.State('appMenu') appMenu: Array<any>;

  @UserModule.Action('getUserInfo') getUserInfo!: any;

  @AppCenterModule.State('appInfo') appDetails: any;

  currentHeader: string = '';

  showTips: boolean = false;

  licenseDate: number = 31;

  visible: boolean = false;

  showEditUser: boolean = false;

  tipMsg: string = '';

  hiddenRight: string[] = [
    'WorkflowMockHeader',
    'FormHistoryDetail',
    'WorkflowHistoryDetail',
  ];

  marketPortalSwitch: boolean = true; //应用市场入口配置开关

  get isShowToggleLanguage() {
    return this.$store.state.config.multiLanguageSwitch;
  }

  get tipText() {
    const licenseDate = this.licenseDate;
    return licenseDate <= 0
      ? `您的License已过有效期，请联系管理员续期`
      : `您的license有效期剩余${licenseDate}天， 请联系管理员续期！`;
  }

  modelNameInfo: any = {};

  @Watch('appMenu')
  onAppmenuChange() {
    this.getModelNameInfo();
  }

  getModelNameInfo() {
    const code = this.$route.params.bizSchemaCode;
    const loop = (data, code) => {
      data.forEach((item) => {
        if (item.code === code) {
          this.modelNameInfo = item;

          setTimeout(() => {
            document.title = this.appDetails.name + '-' + item.name;
          }, 120);
        }
        if (item.children) {
          return loop(item.children, code);
        }
      });
    };
    loop(this.appMenu, code);
  }

  mounted() {
    this.getModelNameInfo();
    this.getUserInfo();
    this.getLicenseExpired();
    this.watchLocalLangChange();
    //获取应用市场入口配置开关
    const windowConfig = (window as any).config;
    /* console.log('windowConfig', windowConfig); */
    //应用市场开关默认为开启状态
    if (
      windowConfig.marketPortalSwitch === false ||
      windowConfig.marketPortalSwitch === 'false'
    ) {
      this.marketPortalSwitch = false;
    }
  }

  /**
   * 监听本地语言包变量变化
   */
  watchLocalLangChange() {
    const vm: any = this;
    window.addEventListener('storage', (e) => {
      /* console.log('local changed: ', e); */
      if (e.key === 'locale') {
        const lang: any = e.newValue;
        if (lang !== vm.$i18n.locale) {
          vm.$i18n.locale = lang;
        }
      }
    });
  }

  getLicenseExpired() {
    systemApi.getLicenseExpired().then((res: any) => {
      if (!res.errcode && res.data) {
        this.licenseDate = res.data.remainingDays;
        if (this.licenseDate <= 30) {
          this.showTips = true;
        } else {
          this.showTips = false;
        }
      }
    });
  }

  // 查看个人信息
  userDetail() {}

  // 跳转到门户
  toProtal() {
    const token = localStorage.getItem('token');
    if (token) {
      const redirectIP = env.portalHost;
      window.open(`${redirectIP}`, '_blank');
    }
  }

  // 修改密码
  changePwd() {
    this.showEditUser = true;
  }

  // 切换语言
  toggleLanguage() {
    if (!(this.$i18n.locale && this.$i18n.locale === 'en')) {
      this.$i18n.locale = 'en';
    } else {
      this.$i18n.locale = 'zh';
    }
    this.$forceUpdate();
    localStorage.setItem('locale', this.$i18n.locale);
    this.showLangTip();
    //  window.location.reload();
  }

  showLangTip() {
    // if (!(this.$i18n.locale && this.$i18n.locale === 'en')) {
    //   this.tipMsg = '已经切换到中文编辑模式，您设置的应用名称、模型分组名称、模型名称、自定义页面名称以及模型设计区（数据模型、表单设计、流程设计、列表设计）的名称将保存为中文名称！';
    // } else {
    //   this.tipMsg = 'Have changed to English Edit Mode,the names of these area will be saved to English Mode, such as Apps name, model name, model group name, customize page name, and model design area(Data Model, Form design, Workflow design, List Design).';
    // }
    this.visible = true;
  }

  handleClose() {
    this.visible = false;
  }

  // 退出登录
  exit() {
    const redirectIP = env.portalHost;
    const redirectUrl = `${redirectIP}/login`;

    OAuthApi.logout({
      redirect_uri: redirectUrl,
      T: this.token as string,
    }).then((res: any) => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expireTime');
      sessionStorage.removeItem('user');
      localStorage.removeItem('syncTaskId');
      localStorage.removeItem('orgPartSync');
      window.location.href = redirectUrl;
    });
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }

  // 不需要头部的路由名称
  noHeaderRouteName: string[] = [
    'report-design',
    'ReportDataSourceDesigner',
    'ReportDataSourceList',
  ];

  @Watch('$route', {
    immediate: true,
  })
  onRouteChange() {
    this.getModelNameInfo();
    switch (this.$route.name) {
      case 'appSettings':
      case 'baseSetting':
      case 'permissionSetting':
      case 'packageSetting':
        this.currentHeader = 'SettingsHeader';
        break;

      case 'appitem':
      case 'appsettings':
        this.currentHeader = 'AppHeader';
        break;
      case 'customPage':
        this.currentHeader = 'customPageHeader';
        break;

      case 'dataModel':
      case 'busRules':
      case 'dataPermission':
      case 'dataRuleCalculation':
      case 'list-design':
      case 'form-design':
      case 'workflowDesign':
      case 'workflowEmpty':
      case 'biz-rule':
      case 'dispatcher':
        this.currentHeader = 'DataModelHearder';
        break;

      case 'noBizModelpage':
        this.currentHeader = '';
        break;
      case 'form-preview':
      case 'list-preview':
      case 'permission':
      case 'report-design':
        break;

      case 'workflowSetting':
        this.currentHeader = 'WorkflowSettingHeader';
        break;
      case 'mockForm':
      case 'mockDetail':
      case 'mockHistory':
        this.currentHeader = 'WorkflowMockHeader';
        break;
      case 'versionList':
        this.currentHeader = 'FormHistory';
        break;
      case 'versionDetail':
        this.currentHeader = 'FormHistoryDetail';
        break;
      case 'workflowHistoryDetail':
        this.currentHeader = 'WorkflowHistoryDetail';
        break;
      default:
        this.currentHeader = 'DefaultHeader';
        break;
    }
  }

  /**
   * 跳转至应用市场首页
   */
  onRouteToMarket() {
    const windowConfig = (window as any).config;
    /* console.log('windowConfig', windowConfig); */
    if (!windowConfig.marketPortalHost) {
      return;
    }
    /* console.log(windowConfig.marketPortalHost); */
    window.open(`${windowConfig.marketPortalHost}`, '_blank');
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';

.DataModelHearder,
.customPageHeader,
.WorkflowSettingHeader,
.FormHistory,
.FormHistoryDetail,
.WorkflowHistoryDetail {
  .header-top {
    background: #fff;
    .header-right {
      & > div {
        a,
        i,
        span {
          color: @nav-font-color;
          &:hover {
            color: @primary-color;
          }
        }
      }
    }
  }
}
.noBizModelpage {
  margin-left: 56px;
}
.header-top {
  background: #2e323b;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.05),
    0px 1px 0px 0px rgba(228, 228, 228, 0.5);
  position: relative;
  z-index: 3;
  & > div {
    height: 60px;
    &.ant-alert {
      height: auto;
      position: absolute;
      width: 100%;
    }
  }
  .header-right {
    position: absolute;
    top: 0;
    right: 24px;
    .li {
      display: flex;
      align-items: center;
      height: 40px;
      justify-items: center;
    }
    .market-entrance {
      color: #fff;
      cursor: pointer;
    }
    .market-entrance:hover {
      color: @primary-color;
    }
    & > div {
      margin-left: 24px;
      img {
        width: 20px;
        height: 20px;
      }
      i {
        font-size: 18px;
        color: #fff;
      }
      span {
        margin-left: 8px;
      }
      & .default-avatar {
        display: inline-block;
        vertical-align: middle;
        font-size: 32px;
        line-height: 32px;
        color: #7165ff;
      }
      & .login-name {
        color: #fff;
        font-size: 14px;
        margin-left: -4px;
      }
      a {
        color: #fff;
        font-size: 14px;
      }
    }
    .user-info {
      .small {
        font-size: 12px;
        margin-left: 6px;
      }
    }
  }

  .header-tips {
    height: 64px;
    position: absolute;
    top: 0;
    right: 285px;
    .header-tips-content {
      width: 196px;
      height: 44px;
      margin-top: 10px;
      padding: 0 10px;
      background: @primary-color;
      border-radius: 4px;
      transform: skewX(10deg);
    }
    i {
      font-size: 14px;
      color: #fff;
      margin-right: 8px;
      position: absolute;
      top: 14px;
      left: 8px;
    }
    span {
      position: absolute;
      font-family: PingFangSC-Regular;
      top: 14px;
      color: #fff;
      font-size: 12px;
      text-align: left;
      left: 30px;
    }
  }
  .tips {
    width: 616px;
    position: fixed;
    right: 50%;
    margin-right: -313px;
    top: 68px;
    z-index: 800;
    .ant-alert {
      text-align: left;
    }
  }
}
.header-menu-content {
  margin-left: 8px;
}
.header-dropdown {
  margin-top: 24px;
  width: 240px;
  padding-bottom: 20px;
  /deep/ .ant-dropdown-menu-item-divider {
    margin-top: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid #eee;
  }
  /deep/.ant-dropdown-menu-item > a {
    color: #111218;
    line-height: 26px;
  }
  /deep/.ant-dropdown-menu-item-active > a {
    color: #2970ff;
  }
  i {
    color: #ffb131;
  }
  .nocursor {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 20px 20px 0px 20px;
    h3 {
      color: #111218;
      font-size: 14px;
    }
    .default-avatar {
      margin-right: 16px;
      width: 42px;
      height: 42px;
      line-height: 42px;
      border-radius: 50%;
      font-size: 42px;
    }
    p {
      margin-top: 4px;
      i {
        color: rgba(17, 18, 24, 0.5);
        font-size: 14px;
        margin-right: 9px;
      }
    }
  }
  /deep/ .ant-dropdown-menu-item {
    height: auto;
  }
}
.toggle-lang {
  & span.active {
    color: @primary-color;
  }
  .header-menu-content {
    margin-right: 8px;
  }
}
</style>
<style lang="less">
.help-center {
  .ant-popover-inner {
    background-color: transparent;
    box-shadow: none;
  }
  .ant-popover-inner-content {
    padding: 0;
    .help-placeholder {
      width: 100%;
      height: 4px;
    }
    .help-content {
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      background-color: #fff;
      margin-top: 0px;
      padding: 4px 0;
    }
  }

  .ant-popover-arrow {
    display: none;
  }
  .ant-popover-inner-content {
    padding: 0;
    .content-li {
      width: 120px;
      height: 36px;
      cursor: pointer;
      line-height: 36px;
      padding-left: 20px;
      box-sizing: border-box;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      > span {
        font-weight: 400;
        color: #111218;
        font-size: 14px;
      }
      &:hover {
        background-color: #f1f2f6;
        > span {
          color: #2970ff;
        }
      }
      &:active {
        background-color: #f1f2f6;
        > span {
          color: #2970ff;
        }
      }
    }
  }
}
.i18n-tips {
  &_content {
    margin-bottom: 16px;
    header {
      height: 24px;
      line-height: 24px;
      span {
        display: inline-block;
        vertical-align: top;
        font-weight: bold;
      }
    }
    i {
      display: inline-block;
      margin-right: 14px;
      width: 24px;
      height: 24px;
      font-size: 24px;
      color: @warning-color;
    }
    article {
      margin-top: 10px;
      margin-bottom: 12px;
      padding: 6px 10px 4px 12px;
      border: 1px solid #ffe58f;
      border-radius: 4px;
      background-color: #fffbe6;
      aside {
        font-size: 12px;
        line-height: 22px;
        font-weight: 400;
        color: rgba(17, 18, 24, 0.5);
      }
      p {
        font-size: 14px;
        line-height: 24px;
        color: #000;
      }
    }
  }
  &_gif {
    display: block;
    max-width: 490px;
    margin: auto;
    height: auto;
    object-fit: contain;
  }
  &_button {
    padding: 24px 0;
    text-align: right;
  }
}
</style>

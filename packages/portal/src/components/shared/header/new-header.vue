<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Descripttion: 新版portal端-顶部
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-10-20 10:12:44
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-01 10:57:58
-->

<template>
  <div class="header common-header" :class="outwardType">
    <div class="header-left" :class="isAppList ? 'header-left-width' : ''">
      <template v-if="isAppList">
        <div
          class="app-list"
          :class="showAppList ? 'app-list-open' : ''"
          @mouseover="
            () => {
              showAppList = true;
            }
          "
          @mouseout="
            () => {
              showAppList = false;
            }
          "
        >
          <i class="icon aufontAll h-icon-all-same-size"></i>
        </div>
        <div
          v-show="showAppList"
          class="app-list-menu"
          @mouseover="
            () => {
              showAppList = true;
            }
          "
          @mouseout="
            () => {
              showAppList = false;
            }
          "
        >
          <div class="app-list-menu-2">
            <div class="content-placeholder"></div>
            <div class="app-list-ul">
              <div
                v-if="!openApplicationPortal"
                class="app-list-li"
                @click="triggerClick('workbench')"
              >
                <i class="icon aufontAll h-icon-all-workbench"></i>
                <span>{{ $t('languages.common.workbench') }}</span>
              </div>

              <div
                v-if="openApplicationPortal"
                class="app-list-li"
                @click="triggerClick('applicationPortal')"
              >
                >
                <i class="icon aufontAll h-icon-all-warehouse-o"></i>
                <span>{{ $t('languages.common.applicationPortal') }}</span>
              </div>

              <div
                class="app-list-li"
                @click="triggerChangeTabs(false, 'curso')"
              >
                <i class="icon aufontAll h-icon-all-a-technologicalprocess"></i>
                <span>{{ $t('languages.common.workflowCenter') }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div
        v-if="$store.state.loaded"
        class="logo"
        @click="triggerChangeTabs(false, 'workbench')"
      >
        <img v-if="logoSrc" :src="logoSrc" alt="logo" />
        <img v-else :src="logo" alt="logo" />
        <!-- <a class="open-blank" v-if="isDingTalk" @click.prevent="openBlank">{{$t("languages.common.openInBrowser")}}</a> -->
      </div>
    </div>

    <div class="header-right">
      <div
        v-if="!isAppList"
        class="menu-left"
        :class="outwardType"
        @mouseenter="searchVisible = false"
      >
        <!-- 工作台 -->
        <div
          v-if="!openApplicationPortal"
          class="menu-li"
          :class="defaultSelectedKeys === 'workbench' ? 'active' : ''"
          @click="triggerClick('workbench')"
        >
          <i class="icon aufontAll h-icon-all-workbench"></i>
          <span>{{ $t('languages.common.workbench') }}</span>
        </div>

        <!-- 应用门户 -->
        <div
          v-if="openApplicationPortal"
          class="menu-li"
          :class="defaultSelectedKeys === 'applicationPortal' ? 'active' : ''"
          @click="triggerClick('applicationPortal')"
        >
          <i class="icon aufontAll h-icon-all-warehouse-o"></i>
          <span>{{ $t('languages.common.applicationPortal') }}</span>
        </div>

        <!-- 流程中心 -->
        <div
          class="menu-li"
          :class="defaultSelectedKeys === 'curso' ? 'active' : ''"
          @click="triggerClick('curso')"
        >
          <i class="icon aufontAll h-icon-all-a-technologicalprocess"></i>
          <span>{{ $t('languages.common.workflowCenter') }}</span>
        </div>

        <a-popover
          v-model="appVisible"
          trigger="hover"
          overlayClassName="app-list-popover2"
          @visibleChange="isChange"
        >
          <template slot="content">
            <AppList
              ref="child"
              :appGroupList="appGroupList"
              :appList="appList"
              :isMove="isMove"
              @close="appClose"
              @goToDetail="goToDetail"
              @change="onChange"
            />
          </template>
          <div class="menu-li app-list-animation">
            <i class="icon aufontAll h-icon-all-application"></i>
            <span>{{ $t('languages.common.applicationList') }}</span>
            <i
              v-if="appVisible"
              class="icon aufontAll h-icon-all-up-o small"
            ></i>
            <i v-else class="icon aufontAll h-icon-all-down-o small"></i>
          </div>
        </a-popover>
      </div>

      <div v-else class="menu-left" @mouseenter="searchVisible = false">
        <div class="menu-left-app-li" :class="outwardType">
          <a-popover
            v-model="appVisible"
            trigger="hover"
            overlayClassName="app-list-popover2"
            @visibleChange="isChange2"
          >
            <template slot="content">
              <AppList
                ref="child"
                :appGroupList="appGroupList"
                :appList="appList"
                :isMove="isMove"
                @close="appClose"
                @goToDetail="goToDetail"
                @change="onChange"
              />
            </template>
            <!-- {{ isChinese ? appName.name : appName.name_i18n}} -->
            <span v-show="isChinese">{{ appName.name }}</span>
            <span v-show="!isChinese">{{ appName.name_i18n }}</span>
            <i
              v-if="appVisible"
              class="icon aufontAll h-icon-all-up-o small"
            ></i>
            <i v-else class="icon aufontAll h-icon-all-down-o small"></i>
          </a-popover>
        </div>
      </div>

      <div class="menu-right" :class="outwardType">
        <ul>
          <li>
            <a
              v-if="isDingTalk"
              class="open-blank"
              @click.prevent="openBlank"
              >{{ $t('languages.common.openInBrowser') }}</a>
          </li>
          <!-- 搜索 -->
          <li>
            <a-popover
              v-model="searchVisible"
              trigger="click"
              overlayClassName="search-wrapper"
            >
              <template slot="content">
                <div class="search-wrapper-in" @click.stop.self="() => {}">
                  <SearchResulte
                    :moveIn="moveIn"
                    @goToDetail="goToDetail"
                    @close="closeSearchResulte"
                  />
                </div>
              </template>
              <a-tooltip placement="bottom">
                <template slot="title">
                  <span>{{ $t('languages.common.search') }}</span>
                </template>
                <!-- <a-icon @click.stop.self="toggleSearchVisible" class="a-icon" type="search" /> -->
                <span>
                  <i
                    class="icon aufontAll h-icon-all-search"
                    @click.stop.self="toggleSearchVisible"
                  ></i>
                </span>
              </a-tooltip>
            </a-popover>
          </li>

          <!-- 更换主题 -->
          <li v-if="admin" @click="toChangeTheme">
            <a-tooltip placement="bottom">
              <template slot="title">
                <span>{{ $t('languages.common.changeTheme') }}</span>
              </template>
              <i class="icon aufontAll h-icon-all-palette-o"></i>
            </a-tooltip>
          </li>

          <!-- 后台管理 -->
          <li v-if="isAdmin" @click="toAdmin">
            <a-tooltip placement="bottom">
              <template slot="title">
                <span>{{ $t('languages.common.backStageManager') }}</span>
              </template>
              <i class="icon aufontAll h-icon-all-desktop1"></i>
            </a-tooltip>
          </li>

          <!-- 消息通知 -->
          <li>
            <a-popover
              overlayClassName="help-center"
              placement="bottom"
              trigger="hover"
              @visibleChange="noticeTipsVisibleChange"
            >
              <template slot="content">
                <noticeTips ref="noticeTips" />
              </template>
              <span class="notice-icon-wrapper">
                <span v-if="noticesCount" class="font-ele"></span>
                <i class="icon aufontAll h-icon-all-bells-o"></i>
              </span>
            </a-popover>
          </li>

          <!-- 帮助中心 -->
          <li>
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
                    :title="$t('languages.common.helpList.userManual')"
                  >
                    <span>{{
                      $t('languages.common.helpList.userManual')
                    }}</span>
                  </a>
                  <a
                    class="content-li"
                    href="https://www.yuque.com/skwme4/grmb6s"
                    target="_blank"
                    :title="$t('languages.common.helpList.video')"
                  >
                    <span>{{ $t('languages.common.helpList.video') }}</span>
                  </a>
                  <a
                    class="content-li"
                    href="https://www.yuque.com/skwme4/hzo079"
                    target="_blank"
                    :title="$t('languages.common.helpList.developer')"
                  >
                    <span>{{ $t('languages.common.helpList.developer') }}</span>
                  </a>
                </div>
              </template>
              <i class="icon aufontAll h-icon-all-book1"></i>
              <!-- <span>{{$t("languages.common.helpCenter")}}</span> -->
              <!-- <i class="icon aufontAll h-icon-all-down-o small"></i> -->
            </a-popover>
          </li>

          <!-- 中英切换 -->
          <li @click="toggleLanguage">
            <a-tooltip placement="bottom">
              <template slot="title">
                <span>{{ $t('languages.common.switch') }}</span>
              </template>
              <span>{{ $i18n.locale === 'zh' ? 'EN' : '中文' }}</span>
            </a-tooltip>
          </li>

          <li>
            <a-popover
              v-model="visible"
              placement="bottomRight"
              trigger="hover"
              overlayClassName="help-center2"
            >
              <template slot="content">
                <div class="content-placeholder"></div>
                <div class="content-box">
                  <div class="content-user-top">
                    <div class="userInfo">
                      <img
                        v-if="
                          userInfo.imgUrl && userInfo.imgUrl.includes('http')
                        "
                        :src="userInfo.imgUrl"
                      />
                      <img
                        v-else-if="userInfo.imgUrl || userInfo.imgUrlId"
                        :src="
                          getDownloadUrlNew(
                            userInfo.imgUrl || userInfo.imgUrlId,
                          )
                        "
                      />
                      <i
                        v-else
                        class="icon aufontAll h-icon-all-normal_smile default-avatar"
                      ></i>
                      <div class="userInfo-right">
                        <h3>{{ userInfo.name }}</h3>
                        <div class="userInfo-right-cn">
                          <i class="icon aufontAll h-icon-all-tablet"></i>
                          <span>{{ userInfo.mobile || '--' }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="userInfo-organ">
                      <a-tooltip>
                        <div slot="title">
                          {{ userInfo.parentDepartmentName }}
                        </div>
                        <span>
                          <i
                            class="icon aufontAll h-icon-all-insert-row-left"
                          ></i>
                          {{ userInfo.departmentName }}
                        </span>
                      </a-tooltip>
                      <span v-if="isAppAdmin" class="sub-title">{{
                        $t('languages.common.ide.appAdmin')
                      }}</span>
                      <span v-else-if="isSysAdmin" class="sub-title">{{
                        $t('languages.common.ide.sysAdmin')
                      }}</span>
                    </div>
                  </div>
                  <div class="content-user-bottom">
                    <span @click="mySetting">{{
                      $t('languages.common.personalSetting')
                    }}</span>
                    <span @click="logout">{{
                      $t('languages.common.exitSys')
                    }}</span>
                  </div>
                </div>
              </template>
              <span>{{ userInfo.name }}</span><i
                v-if="visible"
                class="icon aufontAll h-icon-all-up-o small"
              ></i>
              <i v-else class="icon aufontAll h-icon-all-down-o small"></i>
            </a-popover>
          </li>
        </ul>
      </div>
    </div>

    <!-- 个人设置 -->
    <MySetting
      :userInfo="userInfo"
      :isShow="isShow"
      @closepop="isShow = false"
      @success="logout"
    />
    <!-- 简单密码强制修改 -->

    <ModifyPwd :isShow="isShow2" @closepop="closePop" @success="logout" />

    <a-drawer
      placement="right"
      :width="420"
      :closable="false"
      :visible="openSettintTheme"
      :zIndex="1032"
      wrapClassName="theme-setting-wrapper"
      @close="openSettintTheme = false"
    >
      <themeSetting
        :openSettintTheme="openSettintTheme"
        @close="openSettintTheme = false"
      />
    </a-drawer>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Provide } from 'vue-property-decorator';

import Application from 'cloudpivot/application/pc';
import themeSetting from './../../setting/theme-seting.vue';

import {
  Dropdown,
  Modal,
  Input,
  Row,
  Col,
  Menu,
  Popover,
  Icon,
  Tooltip,
  Drawer,
} from '@h3/antd-vue';

import OAuthApi from '@/apis/oauth';
import env from '@/config/env';
import site from '@/config/site';
import { listApi, workbenchApi } from 'cloudpivot/api';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import { namespace } from 'vuex-class';
import ModifyPwd from '../../setting/modify-pwd.vue';
import MySetting from '../../setting/my-setting.vue';
import noticeTips from './noticeTips.vue';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

const SystemModule = namespace('System/System');

@Component({
  name: 'common-header',
  components: {
    ADropdown: Dropdown,
    AModal: Modal,
    AIcon: Icon,
    AInput: Input,
    ARow: Row,
    ACol: Col,
    ApplicationHeader: Application.ApplicationHeader,
    AppList: Application.AppList,
    SearchResulte: Application.SearchResulte,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    APopover: Popover,
    MySetting,
    AInputSearch: Input.Search,
    noticeTips,
    ATooltip: Tooltip,
    ModifyPwd,
    ADrawer: Drawer,
    themeSetting,
  },
})
export default class CommonHeader extends Vue {
  @WorkflowCenterModule.Mutation('setAsideTitle') setAsideTitle: any;

  @WorkflowCenterModule.Mutation('setApplicationPageTitle')
  setApplicationPageTitle: any;

  @WorkflowCenterModule.Mutation('setUserId') setUserId: any;

  @SystemModule.State('isAdmin') isAdmin: any;

  @SystemModule.State('admin') admin: any;

  @SystemModule.Mutation('setIsAdmin') setIsAdmin: any;

  @SystemModule.Mutation('setAdmin') setAdmin: any;

  @SystemModule.Mutation('setIsPrivilegedPerson') setIsPrivilegedPerson: any;

  @SystemModule.Mutation('setRootAdmin') setRootAdmin: any;

  @SystemModule.Mutation('setUserInfo') setUserInfo: any;

  @WorkflowCenterModule.Mutation('setIsAppList') setIsAppList: any;

  @WorkflowCenterModule.Mutation('setAppNameList') setAppNameList: any;

  @WorkflowCenterModule.Mutation('setAppName') setAppName: any;

  @WorkflowCenterModule.Mutation('setAppCode') setAppCode: any;

  @WorkflowCenterModule.Mutation('setModalCode') setModalCode: any;

  @WorkflowCenterModule.Mutation('setAppChange') setAppChange: any;

  @WorkflowCenterModule.Mutation('setAppPath') setAppPath: any;

  @Prop({ default: 'curso' }) selectedKeys!: string;

  @Provide()
  apiHost() {
    return (window as any).config.apiHost;
  }

  @Provide()
  token() {
    return window.localStorage.getItem('token');
  }

  // @ts-ignore 是否开启了应用门户
  openApplicationPortal: boolean = window.config.openApplicationPortal || false;

  searchVisible: boolean = false;

  toggleSearchVisible() {
    this.searchVisible = !this.searchVisible;
  }

  moveIn: boolean = false;

  @Watch('searchVisible')
  onSearchVisibleChange(val) {
    this.$nextTick(() => {
      this.moveIn = val;
    });
  }

  get appName() {
    return this.$store.state.WorkflowCenter.WorkflowCenter.appName;
  }

  openSettintTheme: boolean = false;

  toChangeTheme() {
    this.openSettintTheme = true;
  }

  // 消息通知显示
  noticeTipsVisibleChange(visible) {
    if (visible) {
      // @ts-ignore
      this.$refs.noticeTips && this.$refs.noticeTips.paltformSearch();
    }
  }

  noticesCount: number = 0;

  noticesTimer: any = null;

  // 获取消息通知数量
  async paltformSearch() {
    const res: any = await workbenchApi.paltformSearch({
      searchword: '',
      size: 1,
      page: 0,
      tab: 'MESSAGE',
      readState: 'UNREADED',
    });
    if (res.errcode === 0) {
      this.noticesCount = res.data.MESSAGE.totalElements;
      this.autoGetNoticesCount();
    }
  }

  autoGetNoticesCount() {
    this.noticesTimer = setTimeout(() => {
      this.paltformSearch();
    }, 60000);
  }

  closeSearchResulte() {
    this.searchVisible = false;
  }

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  get isAppList() {
    return this.$store.state.WorkflowCenter.WorkflowCenter.isAppList;
  }

  get logo() {
    return site.logo;
  }

  get logoSrc() {
    const refId: string = this.$store.state.themsConfig.portalLogo;
    return refId ? this.getDownloadUrlByRefId(refId) : '';
  }

  getDownloadUrlByRefId(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId, 'logo');
  }

  get isShowToggle() {
    return this.$store.state.config.multiLanguageSwitch;
  }

  get isCloudPivot() {
    // 是否已打开内部维护组织开关
    return this.$store.state.config.cloudPivot;
  }

  get routeName() {
    return this.$route.name;
  }

  defaultSelectedKeys: string = 'curso';

  isShow: boolean = false; //个人设置弹窗

  isShow2: boolean = false; //密码过于简单时弹窗修改密码

  // 只有自维护的用户并且不是admin这个账户才能有修改密码入口 #39826
  isShowUpdatePwdBtn: boolean = true;

  isMove: boolean = false; //应用动画效果

  // 用户信息
  userInfo: any = {};

  showModal: boolean = false;

  showAppList: boolean = false;

  params: any = {
    oldPwd: '',
    newPwd: '',
    surePwd: '',
  };

  oldPwdErrTips: string = '';

  newPwdErrTips: string = '';

  surePwdErr: boolean = false;

  visible: boolean = false;

  appVisible: boolean = false;

  appGroupList: Array<any> = [];

  appList: any[] = [];


  isLoaded: boolean = false; //是否已加载过

  isInit: boolean = false;

  isAppAdmin: boolean = false;

  isSysAdmin: boolean = false;

  getPopupContainer(trigger) {
    return trigger.parentElement;
  }

  //应用的弹窗
  isChange2(e) {
    if (!e) {
      this.isMove = false;
      return;
    }
    // 获取当前选中的菜单名称
    if (!this.userInfo.username) {
      this.getUserInfo();
    }
    //获取应用列表
    if (this.appList.length < 1) {
      this.getList(!this.isInit);
    }
    //获取应用组列表
    if (this.appGroupList.length < 1) {
      this.getAppGroupList();
    }
    this.isMove = true;
  }

  isChange(e) {
    if (!e) {
      this.appClose();
    }
    this.isMove = e;
  }

  /**
   * 初始化应用信息
   */
  initApp() {
    let data = location.pathname.split('/');
    data = data.filter((item) => item);
    const code = data[1];
    const item = this.appList.find((item) => item.code === code);
    if (!item) {
      return;
    }
    this.setAppPath(location.href);
    this.goToDetail(item);
    this.isInit = true;
  }

  /**
   * 应用详情
   */
  goToDetail(item) {
    if (!item) {
      return;
    }
    this.appVisible = false;
    this.triggerChangeTabs(true);
    const appName = {
      name: item.appName || item.name,
      name_i18n: ((item.appName_i18n && item.appName_i18n.en) || (item.appName_i18n && JSON.parse(item.appName_i18n) && JSON.parse(item.appName_i18n).en) || item.appName) || ((JSON.parse(item.name_i18n) && JSON.parse(item.name_i18n).en) || item.name),
    }
    this.setAppName(appName);
    this.setAppCode(item.appCode || item.code);
    this.setModalCode(item.appCode ? item.code : '');
    this.setAppChange(true);
    if (
      this.$route.path.indexOf('/application-list/') === -1 &&
      item.type !== 'BizModel'
    ) {
      this.$router
        .push(`/application/${item.appCode || item.code}`)
        .catch((err) => {
          console.log(err);
        });
    } else {
      this.$router
        .push(
          `/application/${item.appCode || item.code}/application-list/${
            item.code
          }`,
        )
        .catch((err) => {
          console.log(err);
        });
    }
    this.isMove = false;
  }

  /**
   * 应用列表关闭
   */
  appClose() {
    // this.defaultSelectedKeys = "curso";
    this.appVisible = false;
    this.isMove = false;
  }

  @Watch('$route', {
    immediate: true,
  })
  onRouteNameChange(val) {
    if (
      val.fullPath &&
      val.fullPath.includes('/application') &&
      !this.isLoaded
    ) {
      //首次加载
      this.isChange2(true);
      this.isMove = false;
    }
  }

  @Watch('selectedKeys', { immediate: true })
  onSelectedKeysChange() {
    this.defaultSelectedKeys = this.selectedKeys;
  }

  created() {
  if(this.$route.name === 'messageNotification'){
      this.defaultSelectedKeys = 'messageNotification';
    }else if(this.$route.name === 'workbench'){
      this.defaultSelectedKeys = 'workbench';
    }
    this.paltformSearch();
    this.autoGetNoticesCount();

    //获取应用列表
    this.getList();
    //获取应用组列表
    this.getAppGroupList();
    //获取用户信息
    this.getUserInfo();
  }

  mounted() {
    const singlePwd = localStorage.getItem('singlePwd');
    if (singlePwd && singlePwd === 'true') {
      this.isShow2 = true;
    }
  }

  closePop() {
    this.isShow2 = false;
    localStorage.removeItem('singlePwd');
  }

  onChange() {
    //获取应用列表
    this.getList();
    //获取应用组列表
    this.getAppGroupList();
  }

  async getList(init = false) {
    const res = await listApi.list({ isMobile: false, isPortal: true });
    if (res.errcode === 0) {
      this.appList = res.data;
      if (init) {
        this.initApp();
      }
    }
  }

  async getAppGroupList() {
    const res = await listApi.listByGroup({ isMobile: false, isPortal: true });
    if (res.errcode === 0) {
      if (Array.isArray(res.data)) {
        this.appGroupList = res.data.filter((x) => {
          return x.code !== 'all';
        });
      }
    }
  }

  triggerChangeTabs(flag: boolean, type?: string) {
    this.showAppList = false;
    this.setIsAppList(flag);
    if (!flag) {
      switch (type) {
        case 'workbench':
          this.defaultSelectedKeys = 'workbench';

          if (!this.openApplicationPortal) {
            this.$router.push('/workbench-center/workbench');
          } else {
            this.$router.push('/application-portal/portal');
          }
          break;
        case 'curso':
          this.defaultSelectedKeys = 'curso';
          this.$router.push('/workflow-center/my-unfinished-workitem');
          break;
        default:
          break;
      }
      // this.$router.push("/workflow-center/my-unfinished-workitem");
    }
  }

  triggerClick(cur: string, tab?: boolean) {
    this.showAppList = false;
    if (['workbench', 'curso', 'applicationPortal'].includes(cur)) {
      (this as any).$refs.child && (this as any).$refs.child.close();
    }

    this.setIsAppList(false);
    this.defaultSelectedKeys = cur;
    if (cur === 'workbench') {
      this.$router.push({
        path: '/workbench-center',
      });
    }

    if (cur === 'applicationPortal') {
      this.$router.push({
        path: '/application-portal',
      });
    }

    if (cur === 'curso') {
      this.$router.push('/workflow-center/my-unfinished-workitem');
    }
  }

  mySetting() {
    this.visible = false;
    this.isShow = true;
  }

  // 跳转到个人中心
  toUserInfo() {
    // window.location.href = '/user/info';
    this.$router.push('/user').catch((err: any) => {
      console.log(err);
    });
  }

  // 跳转后台管理
  toAdmin() {
    const token = localStorage.getItem('token');
    if (this.isDingTalk && token) {
      window.open(`${env.portalHost}/admin/?admin_token=${token}`, '_blank');
    } else {
      window.open(`${env.portalHost}/admin/`, '_blank');
    }
  }

  // 退出登录confirm
  logoutConfirm() {
    const vm = this;
    vm.$confirm({
      title: this.$t('languages.common.tip.sureToLogOut').toString(),
      okText: this.$t('languages.common.tip.confirm').toString(),
      cancelText: this.$t('languages.common.tip.cancel').toString(),
      onOk() {
        vm.logout();
      },
    });
  }

  // 退出登录
  logout() {
    const logoutIP = env.oauthHost;
    const redirectIP = env.redirectHost;
    const token: string = localStorage.getItem('token') || '';

    this.setIsAppList(false);

    // window.location.href = `${logoutIP}/logout?redirect_uri=${redirectIP}/login&T=${token}`;

    OAuthApi.logout({
      redirect_uri: `${redirectIP}/login`,
      T: token,
    }).then((res: any) => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expireTime');
      sessionStorage.removeItem('user');
      this.$router.replace({ name: 'login' });
    });
  }

  // 跳转到首页
  goHome() {
    const appCode = window.Environment ? window.Environment.appCode : null;
    if (appCode) {
      this.$router
        .push({
          name: 'singleApp',
          params: {
            appCode,
          },
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      this.$router.push({ name: 'myUnfinishedWorkItem' }).catch((err: any) => {
        console.log(err);
      });
      // 如果回到首页, 重新调整顶部导航栏下的 slider
      (this.$refs.applications as any).initSlider();
    }
  }

  openBlank() {
    var href: any = location.href;
    var iframeAction: any = href.match(/%26iframeAction%3Ddetail/g);
    if (Array.isArray(iframeAction) && iframeAction.length > 1) {
      for (let i = 0; i < iframeAction.length - 1; i++) {
        href = href.replace('%26iframeAction%3Ddetail', '');
      }
    }

    const url = `${href}${
      href.indexOf('?') > -1 ? '&' : '?'
    }T=${localStorage.getItem('token')}`;

    window.open(url, '_blank');
  }

  // 获取当前用户信息
  async getUserInfo() {
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      this.userInfo = info;
      this.setUserId(info);
      this.isShowUpdatePwdBtn =
        (res.data.relatedSyncType === 'PUSH' ||
          this.$store.state.config.loginType === 0 ||
          this.$store.state.config.loginType === 2) &&
        res.data.username !== 'admin'; // admin这个账号 hide || 或者开启了账号密码登陆的时候
      this.userInfo.isShowUpdatePwdBtn = this.isShowUpdatePwdBtn;
      sessionStorage.setItem('user', JSON.stringify(info));
      // if(localStorage.getItem('userId') && localStorage.getItem('userId') !== JSON.parse(sessionStorage.getItem('user') || '').id) {
      //   localStorage.removeItem('daily');
      //   localStorage.removeItem('temp')
      // }
      if (localStorage.getItem('temp')) {
        const tempArr = JSON.parse(localStorage.getItem('temp') || '[]');
        if (tempArr > 2) {
          tempArr.shift();
        }
        localStorage.setItem('temp', JSON.stringify(tempArr));
      } else if (localStorage.getItem('daily')) {
        const dailyArr = JSON.parse(localStorage.getItem('daily') || '[]');
        if (dailyArr > 2) {
          dailyArr.shift();
        }
        localStorage.setItem('daily', JSON.stringify(dailyArr));
      } else {
        //Else Empty block statement
      }
      localStorage.setItem(
        'userId',
        JSON.parse(sessionStorage.getItem('user') || '').id,
      ); //用户ID
      // 判断当前用户角色
      const isAppAdmin: boolean = info.permissions.includes('APP_MNG');
      this.isAppAdmin = isAppAdmin;
      const isSysAdmin: boolean = info.permissions.includes('SYS_MNG');
      this.isSysAdmin = isSysAdmin;
      const isRootAdmin: boolean = info.permissions.includes('ADMIN');
      const isAdmin: boolean = isAppAdmin || isSysAdmin || isRootAdmin;
      this.setIsAdmin(isAdmin);
      this.setRootAdmin(isRootAdmin);
      this.setAdmin(isSysAdmin || isRootAdmin);
      this.setUserInfo(info);
      // 设置是否特权人
      const isWORKFLOW_ADMIN: boolean =
        info.permissions.includes('WORKFLOW_ADMIN');
      this.setIsPrivilegedPerson(isWORKFLOW_ADMIN);

      // 禁止无权限访问流程查询页面
      if (
        !isSysAdmin &&
        !isRootAdmin &&
        this.$route.name &&
        ['queryInstance', 'queryParticipantWorkItem'].includes(this.$route.name)
      ) {
        this.$router.replace({ name: 'myUnfinishedWorkItem' });
      }
      // 禁止超管访问流程委托页面
      if (
        isRootAdmin &&
        this.$route.name &&
        ['delegationWorkflow'].includes(this.$route.name)
      ) {
        this.$router.replace({ name: 'myUnfinishedWorkItem' });
      }
    }
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }

  /**
   * 切换多语言
   */
  toggleLanguage() {
    if (!(this.$i18n.locale && this.$i18n.locale === 'en')) {
      this.$i18n.locale = 'en';
    } else {
      this.$i18n.locale = 'zh';
    }
    this.$forceUpdate();
    localStorage.setItem('locale', this.$i18n.locale);
  }

  /*
   * 修改密码
   */
  async changePwd() {
    this.resetErrTips();
    if (!this.params.oldPwd) {
      this.oldPwdErrTips = this.$t('languages.common.oldPwdRequied').toString();
      return;
    }
    if (!this.params.newPwd) {
      this.newPwdErrTips = this.$t('languages.common.newPwdRequied').toString();
      return;
    }
    if (this.params.newPwd !== this.params.surePwd) {
      this.surePwdErr = true;
      this.newPwdErrTips = this.$t('languages.common.newPwdNotSame').toString();
      return;
    }

    const params = {
      username: this.userInfo.username,
      corpId: this.userInfo.corpId,
      oldPassword: this.params.oldPwd,
      newPassword: this.params.newPwd,
    };
    const res = await OAuthApi.changePassword(params);
    if (res.errcode) {
      this.$message.error(res.errmsg);
      return;
    }

    this.$message.success(`${this.$t('languages.common.changePwdSuccess')}`);
    setTimeout(() => {
      this.logout();
    }, 3000);
  }

  /*
   * 重置密码错误提示
   */
  resetErrTips() {
    this.oldPwdErrTips = '';
    this.newPwdErrTips = '';
    this.surePwdErr = false;
  }

  cancel() {
    this.showModal = false;
    this.params = {
      oldPwd: '',
      newPwd: '',
      surePwd: '',
    };
    this.resetErrTips();
  }

  get outwardType() {
    // 获取主题外观
    return this.$store.state.outwardType;
  }
}
</script>
<style lang="less" scoped>
@import "../../../styles/themes/default.less";
@import '~cloudpivot/application/src/components/pc/style/custom-themes';

@menu-box-shadow: 0px 4px 11px 0px rgba(35, 110, 235, 0.05);
.theme-setting-wrapper{
  /deep/.ant-drawer-body{
    padding: 0;
  }
}


.common-header {
  height: 64px;
  min-width: 1024px;
  padding: 0 @base4-padding-lg!important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @base4-padding-lg;
  // box-shadow: @menu-box-shadow;
  // box-shadow: 0px 4px 11px 0px rgba(35, 110, 235, 0.05), 0px 1px 0px 0px #eeeeee !important;
  box-shadow: 0px 1px 0px 0px #eeeeee !important;
  &.header{
    background: @headBGColor;
  }
  &.dark{
    box-shadow: unset !important;
    >.header-left{
      &-width{
        .app-list{
          >i{
            color: #fff;
          }
          &:hover{
            background: @hoverColor;
          }
        }
      }
    }
  }
  > .header-left {
    width: 176px;
    display: flex;
    align-items: center;
    height: 100%;
    &-width {
      width: 226px;
      .app-list {
        position: relative;
        margin-right: 33px;
        width: 30px;
        height: 30px;
        background: transparent;
        border-radius: 2px;
        text-align: center;
        line-height: 30px;
        cursor: pointer;
        &:hover,
        // &.app-list-open{
        //   background: #EEF4FD;
        // }
        > i {
          font-size: 20px;
          color: @highlightColor;
        }

        &::after {
          content: "";
          position: absolute;
          width: 1px;
          height: 20px;
          background: #dddddd;
          right: -16px;
          top: 5px;
        }
      }
      .app-list-menu{
        position: fixed;
        top: 45px;
        left: 0;
        padding-top: 19px;
        .app-list-menu-2{
          width: 264px;
          height: 240px;
          background: #FFFFFF;
          box-shadow: 2px 0px 11px 0px rgba(199, 205, 215, 0.5), 1px 0px 0px 0px #EEEEEE;
          padding: 4px 0;
            .app-list-ul {
              width: 264px;
              height: auto;
              min-height: 240px;
              background-color: #fff;
              .app-list-li {
                width: 100%;
                height: 46px;
                padding: 0 27px;
                color: #111218;
                line-height: 46px;
                font-weight: 400;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                i{
                  color: #111218;
                  margin-right: 12px;
                  font-size: 20px;
                }
                &:hover{
                  background-color: rgba(0, 30, 116, 0.06);
                }
              }
            }
        }
      }
    }
    .logo {
      margin-right: 10px;
      cursor: pointer;
      & > img {
        max-height: 24px !important;
        object-fit: cover;
      }
    }
  }
  > .header-right {
    display: flex;
    justify-content: space-between;
    flex: 1;
    height: 100%;
    > .menu-left {
      display: flex;
      padding-left: 16px;
      padding-right: 16px;
      > .menu-li {
        padding: 0 16px;
        height: 100%;
        display: flex;
        align-items: center;
        color: #111218;
        cursor: pointer;
        position: relative;
        font-weight: 400;
        font-size: 16px;
        vertical-align: middle;
        &.active,
        &:hover {
          color: @textColor;
          // font-weight: 600;
          i {
            font-weight: 400;
          }
        }
        &.active {
          &::after {
            content: "";
            position: absolute;
            height: 0px;
            width: 94px;
            bottom: 0;
            left: 50%;
            transform: translate(-50%);
            box-sizing: border-box;
            border-bottom: 3px solid @primaryColor;
          }
        }
        > i {
          margin-right: 10px;
          overflow: inherit;
          vertical-align: 0;
          fill: none;
          width: auto;
          height: auto;
          &.small {
            margin: 0 0 0 10px;
            font-size: 12px;
          }
        }
      }

      &.dark > .menu-li {
        color: #fff;
        opacity: 0.8;
        &:hover {
          // color: @textColor;
          opacity: 1;
        }
        &.active {
          background-color: @headMenuActiveColor;
          opacity: 1;
          &::after {
            display: none;
          }
        }
      }

      .menu-left-app-li{
        display: flex;
        align-items: center;
        color: #111218;
        font-size: 16px;
        font-weight: 400;
        cursor: pointer;
        i{
          font-size: 12px;
          color: #111218;
          margin-left: 8px;
        }
        &:hover {
          color: @highlightColor;
          // font-weight: 600;
          i{
            color: @highlightColor;
          }
        }

        &.dark{
          color: #fff;
          i{
            color: #fff
          }
        }
      }

    }
    > .menu-right {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      > ul {
        display: flex;
        align-items: center;
        margin-bottom: 0 !important;
        > li {
          margin-right: 24px;
          font-weight: 400;
          height: 20px;
          min-width: 20px;
          color: #111218;
          font-size: 14px;
          text-align: center;
          cursor: pointer;
          display: flex;
          align-items: center;
          &:hover {
            color: @highlightColor;
          }
          i {
            // margin: 0 8px 0 6px;
            font-size: 20px;
            &.small {
              margin: -3px 0 0 6px;
              font-size: 12px;
            }
          }
          &:last-child{
            margin-right: 0;
          }
        }
      }

      &.dark{
        ul li {
          color: #fff;
          opacity: 0.8;
          &:hover{
            opacity: 1;
          }
        }
      }
    }
  }
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
      background-color: @hoveBGColor;
      > span {
        color: @primaryColor;
      }
    }
    &:active {
      background-color: @activeBGColor;
      > span {
        color: @primaryColor;
      }
    }
  }
  .content-user-top {
    width: 240px;
    height: auto;
    padding: 20px 20px 0;
    > .userInfo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      > img {
        vertical-align: middle;
        width: 42px;
        height: 42px;
        overflow: hidden;
        border-radius: 50%;
        margin-right: 16px;
        object-fit: cover;
      }
      > i {
        margin-right: 16px;
        width: 42px;
        height: 42px;
        line-height: 42px;
        border-radius: 50%;
        font-size: 42px;
        text-align: center;
        color: #ffb131;
      }
      .userInfo-right {
        flex: 1;
        > h3 {
          color: #111218;
          font-weight: 400;
          font-size: 14px;
        }
        > .userInfo-right-cn {
          color: rgba(17, 18, 24, 0.5);
          font-weight: 400;
          font-size: 14px;
          display: flex;
          align-items: center;
          margin-top: 4px;
          > i {
            color: rgba(17, 18, 24, 0.5);
            margin-right: 9px;
            overflow: inherit;
            width: auto;
            height: auto;
          }
        }
      }
    }
    > .userInfo-organ {
      margin-top: 12px;
      border-bottom: 1px solid #eee;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;

      > span {
        font-size: 14px;
        color: rgba(17, 18, 24, 0.5);
        font-weight: 400;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 5px;
        > i {
          margin-right: 7px;
          position: relative;
          top: 1px;
          vertical-align: baseline;
        }
        &.sub-title {
          color: rgba(17, 18, 24, 0.25);
          text-align: right;
        }
      }
    }
  }
  .content-user-bottom {
    width: 240px;
    color: #111218;
    font-size: 14px;
    font-weight: 400;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    padding-bottom: 10px;
    padding: 12px 0 20px;
    > span {
      // margin-top: 7px;
      height: 36px;
      line-height: 36px;
      display: block;
      width: 100%;
      padding: 0 20px;
      &:hover {
        background-color: @activeBGColor;
        color: @highlightColor;
      }
      &:active {
        background-color: @hoveBGColor;
        color: @highlightColor;
      }
    }
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
}

.help-center2 {
  padding-top: 0 !important;
  .ant-popover-inner {
    background-color: transparent;
    box-shadow: none;
  }
  .content-placeholder {
    height: 4px;
    width: 100%;
    background: transparent;
  }
  .content-box {
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
    background-color: #fff;
  }
  .ant-popover-inner-content {
    padding: 15px 0 0;
  }
  .ant-popover-arrow {
    display: none;
  }
}

.app-list-popover {
  left: 8px !important;
  &-active {
    .ant-popover-inner {
      background-color: transparent;
      box-shadow: none;
      .content-placeholder {
        width: 100%;
        height: 8px;
      }
      .app-list-ul {
        padding: 4px 0;
        background-color: #fff;
        box-shadow: 2px 0px 11px 0px rgba(199, 205, 215, 0.5),
          1px 0px 0px 0px #eeeeee;
      }
    }
  }
  .ant-popover-inner-content {
    padding: 4px 0;
    .app-list-ul {
      width: 264px;
      height: auto;
      min-height: 240px;
      background-color: #fff;
      .app-list-li {
        width: 100%;
        height: 46px;
        padding: 0 27px;
        color: #111218;
        line-height: 46px;
        font-weight: 400;
        cursor: pointer;
        i {
          color: #111218;
          margin-right: 12px;
        }
        &:hover {
          background-color: rgba(0, 30, 116, 0.06);
        }
      }
    }
  }
}

.app-list-popover2 {
  top: 60px !important;
  animation: none !important;
  display: block !important;
  position: fixed !important;
  padding-top: 0 !important;
  z-index: 97 !important;
  .ant-popover-inner {
    box-shadow: 0 4px 6px #eeeff2;
  }
  .ant-popover-inner-content {
    padding: 0;
    width: 100vw;
    position: relative;
  }
  .ant-popover-content > .ant-popover-arrow {
    display: none !important;
    visibility: hidden !important;
  }
}

.search-wrapper {
  top: 60px !important;
  animation: none !important;
  position: fixed !important;
  padding-top: 0 !important;
  left: 0 !important;
  // z-index: -1!important;
  .ant-popover-inner {
    box-shadow: 0 4px 6px #eeeff2;
  }
  .ant-popover-inner-content {
    padding: 0;
    width: 100vw;
    position: relative;
  }
  .search-wrapper-in {
    height: calc(100vh - 56px);
    overflow: auto;
  }
  .ant-popover-inner {
    background: #f1f2f6;
  }
}

.notice-icon-wrapper {
  position: relative;
  .font-ele {
    position: absolute;
    right: 0px;
    top: 0;
    background-color: red;
    width: 6px;
    height: 6px;
    border-radius: 5px;
  }
}
</style>
<style lang="less" scoped>
/deep/.app-list-popover2 {
  .ant-popover-content > .ant-popover-arrow {
    display: none !important;
    visibility: hidden !important;
  }
}
</style>

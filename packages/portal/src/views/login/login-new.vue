<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="login">
    <div class="login-left">
      <div class="login-left-bg-1">
        <img src="../../assets/images/ba.png" width="540" alt="背景切图-1" />
      </div>
      <div class="login-left-bg-2">
        <div class="login-left-bg-2-placeholder"></div>
        <img
          class="login-left-bg-2-img"
          width="443"
          src="../../assets/images/bf.png"
          alt="背景切图-2"
        />
      </div>
    </div>
    <div class="login-right">
      <div class="login-content">
        <div class="logo">
          <!-- <img v-if="logoSrc" :src="logoSrc" alt="logo"/>
          <img v-else src="../../assets/images/yslogo.png" alt="云枢logo"> -->
        </div>
        <div class="login-window">
          <template v-if="selectOrganization">
            <div class="organization-choose">
              <div class="go-back" @click="goBack">
                <span class="icon aufontAll">&#xe895;</span>
                <span>{{ languages === 'zh' ? '返回' : 'Return' }}</span>
              </div>
              <div class="organization-title">
                <span>{{
                  languages === 'zh' ? '请选择组织' : 'Select an organization'
                }}</span>
                <label for="search-input">
                  <div class="search-btn" @click="showSearch">
                    <span class="icon aufontAll">&#xea3f;</span>
                  </div>
                </label>
              </div>
              <div v-show="searchShow" class="search-input-box">
                <a-input
                  id="search-input"
                  v-model="searchOrg"
                  class="search-input"
                  allowClear
                  autocomplete="off"
                  @blur="hiddenSearch"
                  @change="searchOrganization"
                />
                <span class="icon aufontAll search-icon">&#xe61c;</span>
              </div>
              <div class="organization-list">
                <template v-for="dept in depts">
                  <div
                    :key="dept.corpId"
                    class="organization-item"
                    @click="onDeptChange(dept.corpId, dept)"
                  >
                    <span v-if="dept.name">
                      {{ dept.name.substr(0, dept.name.indexOf(searchOrg))
                      }}<span class="blue">{{ searchOrg }}</span>{{
                        dept.name.substr(
                          dept.name.indexOf(searchOrg) + searchOrg.length,
                        )
                      }}
                    </span>
                    <span v-else>{{ $t('languages.common.mainOrg') }}</span>
                  </div>
                </template>
                <template v-if="depts.length === 0">
                  <div class="no-data">
                    <span>{{ $t('languages.common.noData') }}</span>
                  </div>
                </template>
              </div>
            </div>
          </template>
          <template v-else>
            <div>
              <template v-if="tabsDisplay.length === 2">
                <template v-if="curTab === 'account'">
                  <div class="turn-to" @click="changeTab(tabsDisplay[1].type)">
                    <div class="turn-to-img">
                      <a-tooltip placement="left">
                        <template slot="title">
                          <span>{{
                            languages === 'zh'
                              ? '扫码登录'
                              : 'Code scanning login'
                          }}</span>
                        </template>
                        <img
                          src="../../assets/images/qrcode-2.png"
                          :alt="
                            languages === 'zh'
                              ? '扫码登录'
                              : 'Code scanning login'
                          "
                        />
                      </a-tooltip>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="turn-to" @click="changeTab(tabsDisplay[0].type)">
                    <div class="turn-to-img">
                      <a-tooltip placement="left">
                        <template slot="title">
                          <span>{{
                            languages === 'zh' ? '账号登录' : 'Account login'
                          }}</span>
                        </template>
                        <img
                          src="../../assets/images/pc-2.png"
                          :alt="
                            languages === 'zh' ? '账号登录' : 'Account login'
                          "
                        />
                      </a-tooltip>
                    </div>
                  </div>
                </template>
              </template>
              <template v-if="curTab === 'account'">
                <div class="account-type">
                  <div class="organization-title">
                    <span class="organization-name">{{ deptName }}</span>
                    <span
                      v-if="deptName.length"
                      class="change-organization"
                      @click="changeOrganization"
                      >{{ languages === 'zh' ? '切换组织' : 'Switch' }}</span>
                  </div>
                  <div>
                    <account-login :corpId="corpId" />
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="qrcode-type">
                  <div class="organization-title">
                    <span class="organization-name">{{ deptName }}</span>
                    <span
                      v-if="deptName.length"
                      class="change-organization"
                      @click="changeOrganization"
                      >{{ languages === 'zh' ? '切换组织' : 'Switch' }}</span>
                  </div>
                  <template v-if="curTab === 'dingding'">
                    <div>
                      <qrcode-login
                        ref="qrcodeLogin"
                        :appId="appId"
                        :corpId="corpId"
                      />
                    </div>
                  </template>
                  <template v-else-if="curTab === 'wechat'">
                    <div>
                      <wechat-login :agentid="agentid" :corpId="corpId" />
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </div>
        <div class="login-content-footer">
          <div v-if="$store.state.themsConfig.info">
            {{ $store.state.themsConfig.info }}
          </div>
          <div v-else>
            版权所有 &copy;深圳奥哲网络科技有限公司 粤ICP备10083177号
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Modal, Select, Tooltip, Input } from '@h3/antd-vue';
import '@h3/antd-vue/dist/antd.css'; // 单独引入css是因为登陆页面select组件无样式 
import OAuthApi from '@/apis/oauth';
import { utils } from 'cloudpivot/common';

import QrcodeLogin from './qrcode-login.vue';

import AccountLogin from './account-login-new.vue';

import WechatLogin from './wechat-login.vue';

import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';

const env = (window as any).config;

enum LoginType {
  OnlyAccount = 0, // 只允许账户密码
  OnlyQrCode = 1, // 只允许扫码
  BothAccountAndQrCode = 2, // 二者均可
}

/**
 * 组织类型
 * */
enum OrgType {
  MAIN = 'MAIN',
  RELEVANCE = 'RELEVANCE',
}

/**
 * 维护方式
 * */
enum SyncType {
  PUSH = 'PUSH',
  PULL = 'PULL',
}

/**
 * 登录模式
 * */
enum LoginMode {
  Account = 'account',
  Dingtalk = 'dingding',
  Wechat = 'wechat',
}

/**
 * 关联方式
 * 关联钉钉 或者微信
 * */
enum RelatedType {
  Dingtalk = 'DINGTALK',
  Wechat = 'WECHAT',
  OTHER = 'OTHER',
}

@Component({
  name: 'Login',
  components: {
    QrcodeLogin,
    AccountLogin,
    WechatLogin,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATooltip: Tooltip,
    AInput: Input,
  },
})
export default class Login extends Vue {
  appId: string = '';

  agentid: string = ''; // 微信扫码登陆需要agentid

  toggleMode: boolean = false; // 是否展示切换模式

  defaultView: string = 'qrcode'; // 默认展示页面

  depts: any[] = [];

  allDepts: any[] = [];

  deptId: string = '';

  corpId = '';

  deptName: string = '';

  config: any = null;

  loginType: any = -1;

  curTab: string = '';

  languages: string = localStorage.getItem('locale') || 'zh';

  tabsAll: any[] = [
    { type: 'account', name: '账号登录' },
    { type: 'dingding', name: '钉钉登录' },
    { type: 'wechat', name: '企业微信登录' },
  ];

  tabs: any[] = [];

  selectOrganization: boolean = false;

  isAccount: boolean = true;

  searchShow: boolean = false;

  searchOrg: string = '';

  get logoSrc() {
    const refId: string = this.$store.state.themsConfig.portalLogo;
    return refId ? this.getDownloadUrlByRefId(refId) : '';
  }

  getDownloadUrlByRefId(refId: string): string {
    if (!refId) {
      return '';
    }
    const url =
      env.apiHost +
      `/api/aliyun/download?refId=${getDownloadUrlNew.getRefId(refId)}`;
    const token = localStorage.getItem('token');
    if (!token) {
      return url;
    }
    return url + `&T=${token}`;
  }

  showSearch() {
    this.searchShow = true;
  }

  hiddenSearch() {
    if (!this.searchOrg) {
      this.searchShow = false;
    }
  }

  get tabsDisplay() {
    return this.tabs.filter((item: any) => !!item);
  }

  get isCloudPivot() {
    // 是否已打开内部维护组织开关
    return this.$store.state.config.cloudPivot;
  }

  async mounted() {
    // 获取环境配置
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expireTime');
    const config = await OAuthApi.getSystemConfig();

    if (config) {
      this.config = config;
      this.loginType = config.loginType;
    }

    const res: any = await OAuthApi.getDepts();
    if (res.errcode !== 0) {
      this.$message.error(res.errmsg);
      return;
    }

    this.allDepts = res.data;
    this.depts = this.filterOrg(this.allDepts);

    // this.depts = [
    //   {"corpId":"ding2b61f798e1e0353c35c2f4657eb6378f","scanAppId":"dingoapafnay0mrrb4erhb","pcServerUrl":"http://47.112.182.161","mobileServerUrl":"http://47.112.182.161/mobile","orgType":"MAIN","name":"主组织PUll","syncType":"PULL","orgTypeStr":"主组织PUll"},
    //   {"corpId":"ding2b61f798e1e0353c35c2f4657eb637uiuo","scanAppId":"dingoapafnay0mrrb4erhb","pcServerUrl":"http://47.112.182.161","mobileServerUrl":"http://47.112.182.161/mobile","orgType":"MAIN","name":"主组织自维护PUSH","syncType":"PUSH","orgTypeStr":"主组织自维护PUSH"}
    //   ]

    // this.depts = [
    //  {
    //    agentId: "",
    //     corpId: "wwc226455248094acd",
    //     mobileServerUrl: "https://wx-dev.h3yun.com/mobile",
    //     name: "微信关联组织",
    //     orgType: "RELEVANCE",
    //     orgTypeStr: "关联组织",
    //     pcServerUrl: "https://wx-dev.h3yun.com",
    //     relatedType: "OTHER",
    //     scanAppId: "",
    //     syncType: "PUSH"
    //  }
    //   ]

    if (this.depts.length > 0) {
      let deptId = this.depts[0].corpId;
      if (this.$route.query.corpId) {
        deptId = this.$route.query.corpId;
        localStorage.setItem('corpId', deptId);
      } else {
        // localStorage.removeItem('corpId')
        // 如果query中没有corpid 则设置第一个企业的corpid
        localStorage.setItem('corpId', deptId);
      }
      this.deptId = deptId;
      this.onDeptChange(deptId, {});
    } else {
      this.$router
        .push({
          name: 'loginError',
        })
        .catch((err: any) => {
          console.log(err);
        });
      return;
    }

    const errcode = utils.parseUrlParam(window.location.href, 'errcode');
    if (errcode && errcode === '201018') {
      Modal.error({
        title: '该用户已被停用，请联系管理员！',
      });
    } else if (errcode) {
      Modal.error({
        title: '您无此访问权限，请联系管理员！',
      });
    } else {
      //Else Empty block statement
    }
  }

  searchOrganization() {
    this.depts = this.filterOrg(this.allDepts);
    const element = document.querySelector('#search-input:focus');
    if (!element) {
      this.searchShow = false;
    }
  }

  filterOrg(depts: any[]) {
    if (this.searchOrg) {
      depts = depts.filter((item: any) => {
        return new RegExp(this.searchOrg).test(item.name);
      });
    }
    return depts;
  }

  onDeptChange(deptId: string, obj: any) {
    console.log(deptId, obj);
    const dept = this.depts.find((d) => d.corpId === deptId);
    if (!dept) {
      Modal.error({
        title: '找不到组织机构记录',
      });
      return;
    }
    console.log(dept);
    // 切换登录界面的组织时，获取到组织变化，拿到选择的组织对应的pcServerUrl地址，变更浏览器地址栏地址
    let pcServerUrl: string = '';

    if (obj.corpId) {
      for (const item of this.depts) {
        if (item.corpId === deptId) {
          pcServerUrl = item.pcServerUrl;
          break;
        }
      }

      window.location.href = pcServerUrl + '/login?corpId=' + dept.corpId;
      // window.location.href = 'http://localhost:9100' + '/login?corpId=' + dept.corpId;
    }

    this.appId = dept.scanAppId;
    this.agentid = dept.agentId;
    this.corpId = dept.corpId;
    this.deptName = dept.name;

    // 展示逻辑更改 20200511  by John
    const { orgType, syncType, relatedType } = dept;

    if (orgType === OrgType.MAIN) {
      // 主组织
      if (syncType === SyncType.PUSH) {
        // 自维护
        if (
          this.loginType === LoginType.BothAccountAndQrCode ||
          this.loginType === LoginType.OnlyAccount
        ) {
          // 配置文件支持账户登陆
          this.tabs = this.tabsAll.map((item: any) => {
            if (item.type === LoginMode.Account) {
              return item;
            }
          });
        } else {
          Modal.error({
            title: '账号密码登录方式未打开，请联系系统维护人员处理！',
          });
        }
      } else {
        // 第三方维护
        this.showByConfig(this.config, relatedType);
      }
    } else {
      // 关联组织
      this.showByConfig(this.config, relatedType);
    }

    this.curTab = this.tabsDisplay[0].type;

    this.selectOrganization = false;
  }

  goBack() {
    this.selectOrganization = false;
  }

  changeOrganization() {
    this.selectOrganization = true;
  }

  showByConfig(config: any, relatedType: string) {
    if (!config) {
      return;
    }
    const { loginType } = config;

    if (loginType === LoginType.OnlyAccount) {
      this.tabs = this.tabsAll.map((item: any) => {
        if (item.type === LoginMode.Account) {
          return item;
        }
      });
    } else if (loginType === LoginType.OnlyQrCode) {
      this.tabs = this.showByRelativeType(relatedType);
    } else {
      // 二者均可
      const temTabs = this.tabsAll.map((item: any) => {
        if (item.type === LoginMode.Account) {
          return item;
        }
      });
      this.tabs = this.showByRelativeType(relatedType);
      this.tabs = temTabs.concat(this.tabs);
    }
  }

  showByRelativeType(relatedType: string) {
    let tabs: any[] = [];
    if (relatedType === RelatedType.Wechat) {
      tabs = this.tabsAll.map((item: any) => {
        if (item.type === LoginMode.Wechat) {
          return item;
        }
      });
    } else if (
      relatedType === RelatedType.Dingtalk ||
      relatedType === RelatedType.OTHER
    ) {
      tabs = this.tabsAll.map((item: any) => {
        if (item.type === LoginMode.Dingtalk) {
          return item;
        }
      });
    } else {
      //Else Empty block statement
    }
    return tabs;
  }

  changeTab(type: string) {
    if (!type) {
      return;
    }
    this.curTab = type;
  }

  filterOption(input, option) {
    console.log(option.componentOptions);
    return (
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.trim().toLowerCase()) >= 0
    );
  }
}
</script>

<style lang="less" scoped>
.login {
  display: flex !important;
  flex-flow: row !important;
  flex-direction: row !important;
  .login-left {
    width: 540px;
    min-width: 540px;
    max-width: 540px;
    height: 100vh;
    position: relative;
    background: #f2f5ff;
    .login-left-bg {
      &-1 {
        height: 100vh;
        overflow: hidden;
        > img {
          width: 540px;
        }
      }
      &-2 {
        position: absolute;
        left: 55px;
        right: 42px;
        top: 0;
        display: flex;
        flex-flow: column;
        height: 100vh;
        overflow: hidden;
        .login-left-bg-2 {
          &-placeholder {
            height: 100%;
            min-height: 138px;
          }
        }
      }
    }
  }
  .login-right {
    width: 100%;
    height: 100%;
    position: relative;
    .login-content {
      display: inline-block;
      position: absolute;
      top: 50%;
      left: 50%;
      width: 404px;
      transform: translate(-50%, -50%);
      .logo {
        text-align: center;
        margin-bottom: 37px;
        > img {
          width: 157px;
        }
      }
      .login-window {
        width: 404px;
        height: 474px;
        background: #ffffff;
        box-shadow: 0px 2px 18px 0px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        position: relative;
        overflow: hidden;
        .organization-choose {
          padding: 26px 4px;
          height: 100%;
          .go-back {
            cursor: pointer;
            height: 24px;
            font-size: 16px;
            font-weight: 400;
            color: #111218;
            line-height: 24px;
            padding: 0 36px;
            &:hover {
              color: #2970ff;
            }
            span + span {
              margin-left: 8px;
            }
          }
          .organization-title {
            margin-top: 50px;
            padding: 0 36px;
            position: relative;
            .search-btn {
              width: 32px;
              height: 32px;
              line-height: 32px;
              align-items: center;
              position: absolute;
              right: 36px;
              top: 0;
              text-align: center;
              display: flex;
              > span {
                width: 100%;
              }
              &:hover {
                background: rgba(0, 30, 116, 0.06);
                border-radius: 2px;
                cursor: pointer;
              }
            }
          }
          .search-input-box {
            padding: 0 40px;
            position: absolute;
            width: 100%;
            left: 0;
            top: 100px;
            .search-input {
              /deep/.ant-input {
                padding-left: 36px;
                border-radius: 2px;
                height: 32px;
                line-height: 32px;
                font-size: 14px;
                font-weight: 400;
                color: #111218;
                &:focus {
                  box-shadow: 0px 0px 0px 2px rgba(41, 112, 255, 0.2);
                  border: 1px solid #2970ff;
                }
              }
              &:hover /deep/.ant-input:not(.ant-input-disabled) {
                border-color: #2970ff;
              }
            }
            .search-icon {
              position: absolute;
              left: 52px;
              top: 0;
              height: 32px;
              line-height: 32px;
              color: rgba(17, 18, 24, 0.25);
              font-size: 14px;
            }
          }
          .organization-list {
            margin-top: 16px;
            padding: 0 30px 0 36px;
            height: 300px;
            overflow-y: scroll;
            overflow-x: hidden;
            .organization-item {
              cursor: pointer;
              height: 24px;
              font-size: 16px;
              font-weight: 400;
              color: rgba(0, 0, 0, 0.65);
              line-height: 24px;
              &:hover {
                color: #2970ff;
              }
              & + .organization-item {
                margin-top: 12px;
              }
              .blue {
                color: #2970ff;
              }
            }
            .no-data {
              height: 300px;
              text-align: center;
              line-height: 300px;
              > span {
                height: 17px;
                font-size: 12px;
                font-weight: 400;
                color: rgba(17, 18, 24, 0.5);
                line-height: 17px;
              }
            }
          }
        }
        .account-type {
          padding: 72px 40px;
          height: 100%;
          .organization-title {
            display: flex;
            align-items: flex-end;
            .organization-name {
              max-width: calc(100% - 56px);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .change-organization {
              height: 20px;
              font-size: 12px;
              font-weight: 400;
              color: #2970ff;
              line-height: 20px;
              cursor: pointer;
              padding-left: 8px;
              min-width: 56px;
            }
          }
        }
        .qrcode-type {
          padding: 72px 62px;
          height: 100%;
          .organization-title {
            padding: 0 35px;
            display: flex;
            align-items: flex-end;
            .organization-name {
              max-width: calc(100% - 56px);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .change-organization {
              height: 20px;
              font-size: 12px;
              font-weight: 400;
              color: #2970ff;
              line-height: 20px;
              cursor: pointer;
              padding-left: 8px;
              min-width: 56px;
            }
          }
        }

        .organization-title {
          height: 32px;
          font-size: 24px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
          line-height: 32px;
        }
        .turn-to {
          position: absolute;
          cursor: pointer;
          width: 126px;
          height: 126px;
          top: -63px;
          right: -63px;
          transform: rotate(45deg);
          overflow: hidden;
          box-shadow: 0px 2px 18px 0px rgba(0, 0, 0, 0.1) inset;
          border-color: transparent;
          .turn-to-img {
            transform: rotate(-45deg);
            position: absolute;
            bottom: -46px;
            left: 14px;
            background: #e0e1e7;
            :hover {
              background: rgba(17, 18, 24, 0.5);
            }
          }
        }
      }
      .login-content-footer {
        text-align: center;
        margin-top: 30px;
        div {
          font-size: 12px;
        }
      }
    }
  }
}
// .login {
//   .ant-select {
//     vertical-align: middle;
//     margin-left: 1em;
//   }
//   .org-list {
//     width: 200px;
//   }

//   .login-head {
//     width: 100%;
//     height: 64px;
//     line-height: 64px;
//     padding-left: 24px;

//     & > img {
//       max-height: 30px !important;
//     }
//   }
//   .login-content {
//     height: 736px;
//     min-width: 1066px;
//     background: #002638;
//     &-contain {
//       width: 1066px;
//       height: 100%;
//       overflow: hidden;
//       margin: 0 auto;
//       &__left {
//         position: relative;
//         height: 100%;
//         float: left;
//         h1 {
//           font-size: 40px;
//           margin-top: 80px;
//           margin-left: 82px;
//           font-weight: 400;
//           line-height: 48px;
//           color: #fff;
//         }
//         h2 {
//           font-size: 28px;
//           margin-top: 8px;
//           margin-left: 82px;
//           margin-bottom: 8px;
//           font-weight: 400;
//           color: #fff;
//         }
//         .bj-image {
//           margin-top: 102px;
//         }
//       }
//     }
//   }
//   .login-types {
//     float: right;
//     margin-top: 110px;
//     width: 360px;
//     height: 400px;
//     position: relative;
//     background: #fff;
//     border-radius: 6px;
//     text-align: center;
//     padding: 40px;
//     & > .tab-bar {
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//       border-bottom: 1px solid #d1f2ea;
//       padding-bottom: 16px;
//       &.only-one {
//         display: block;
//         & > .tab-bar-item.active:after {
//           display: none;
//         }
//       }

//       &.only-two {
//         justify-content: space-around;

//         .tab-bar-item {
//           width: 100%;
//         }
//       }
//       & > .tab-bar-item {
//         cursor: pointer;
//         user-select: none;
//         color: rgba(0, 0, 0, 0.65);
//         width: auto;
//         position: relative;
//         &.active {
//           font-size: 20px;
//           color: #000;
//           &:after {
//             content: "";
//             display: block;
//             position: absolute;
//             left: 0;
//             bottom: -17px;
//             width: 100%;
//             height: 2px;
//             background: #17bc94;
//           }
//         }
//       }
//     }
//     & > .tab-content {
//     }
//   }
//   .login-footer {
//     height: 79px;
//     font-size: 12px;
//     line-height: 79px;
//     background: #fff;
//     z-index: 9;
//     text-align: center;
//     .login-footer-center {
//       width: 600px;
//       overflow: hidden;
//       margin: 0 auto;
//       div {
//         float: left;
//       }
//       .login-line {
//         width: 94px;
//         height: 1px;
//         margin: 39px 16px;
//         background: #efefef;
//       }
//     }
//   }
// }

// /deep/.hide-toggle .login-account-type,
// /deep/ .hide-toggle .login-qrcode-type {
//   display: none;
// }
</style>

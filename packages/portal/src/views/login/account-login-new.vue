<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div
    class="login-account"
    :class="{ 'login-err-box': passwordErr || userTips }"
  >
    <div class="label">
      {{ languages === 'zh' ? '账号' : 'Account' }}
    </div>
    <a-input
      v-model="userName"
      :placeholder="
        languages === 'zh' ? '请输入账号' : 'Please enter the account number'
      "
      autocomplete="off"
      class="login-input"
      @change="becanLogin"
    />
    <p v-if="passwordErr" class="err-tips-2">
      {{
        languages === 'zh'
          ? '请输入正确的账号或密码'
          : 'Please enter the correct account number or password'
      }}
    </p>
    <p v-if="userTips" class="err-tips">
      {{ userTips }}
    </p>
    <div class="label">
      {{ languages === 'zh' ? '密码' : 'Password' }}
    </div>
    <a-input
      v-model="passWord"
      class="zkcustomer login-input"
      :placeholder="
        languages === 'zh' ? '请输入密码' : 'Please input a password'
      "
      style="margin-bottom: 41px"
      :type="passwordType"
      autocomplete="off"
      @change="becanLogin"
      @pressEnter="enterLogin"
    >
      <i
        slot="suffix"
        class="icon aufontAll"
        :class="{
          'h-icon-all-eye-close': !showPassword,
          'h-icon-all-eye-o': showPassword,
        }"
        @click="passwordVisible"
      ></i>
    </a-input>
    <div class="login-btn" @click="login">
      {{ languages === 'zh' ? '登 录' : 'Login' }}
    </div>
    <p class="login-account-forget" @click="tips('forgetPwd')">
      {{ languages === 'zh' ? '忘记密码？' : 'Forget the password?' }}
    </p>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, PropSync, Watch } from 'vue-property-decorator';

import OAuthApi from '@/apis/oauth';

import env from '@/config/env';

import common from 'cloudpivot/common';
import { Modal, Input, Button, Tooltip, Icon } from '@h3/antd-vue';

@Component({
  name: 'login-account',
  components: {
    AInput: Input,
    AModal: Modal,
    AButton: Button,
    ATooltip: Tooltip,
    AIcon: Icon,
  },
})
export default class LoginAccount extends Vue {
  @Prop({
    default: false,
  })
  toggleMode!: boolean;

  @PropSync('corpId') syncCorpId!: string;

  redirectUrl: string = ''; // 登陆回跳地址

  getTokenParams: any = {
    code: '',
    url: '',
    client_secret: '',
    client_id: '',
    redirect_uri: '',
  };

  languages: string = localStorage.getItem('locale') || 'zh';

  passwordErr: boolean = false; // 账户密码错误

  passwordType: string = 'password'; // 密码的展示形式

  showPassword: boolean = false;

  overflowTips: boolean = false; // 密码输入已超过3次提示

  loginDisabled: boolean = false; // 登录禁用状态

  userName: string = ''; // 登录账号

  passWord: string = ''; // 登录密码

  visible: boolean = false; // 忘记密码提示窗

  unAuthed: boolean = false; // 未授权提示窗

  userTips: string = '';

  created() {
    this.generateUrls();
  }

  // 切换组织的时候需要重新初始化
  @Watch('syncCorpId')
  onSyncCorpIdChange(syncCorpId: any) {
    if (syncCorpId) {
      this.generateUrls();
    }
  }

  /**
   * 初始化地址和固定传参
   */
  generateUrls() {
    const { oauthHost, client_id, scope, secret, redirectHost } = env;
    // 回跳地址
    this.redirectUrl = `${oauthHost}/login?redirect_uri=${encodeURIComponent(
      `${oauthHost}/oauth/authorize?client_id=${client_id}&response_type=code&scope=${scope}&redirect_uri=${redirectHost}/oauth`,
    )}`;
    // 请求token参数
    this.getTokenParams = {
      code: '',
      url: oauthHost,
      client_secret: secret,
      client_id: client_id,
      redirect_uri: `${redirectHost}/oauth`,
    };
  }

  passwordVisible() {
    if (this.showPassword) {
      this.passwordType = 'password';
    } else {
      this.passwordType = 'text';
    }
    this.showPassword = !this.showPassword;
  }

  becanLogin() {
    if (this.userName && this.passWord) {
      this.loginDisabled = true;
    } else {
      this.loginDisabled = false;
    }
  }

  /**
   * 回车登陆
   */
  enterLogin() {
    const { userName, passWord } = this;

    if (!passWord || !userName) {
      return;
    }

    this.login();
  }

  /**
   * 账户密码登录
   */
  async login() {
    if (!this.loginDisabled || !this.userName || !this.passWord) {
      return;
    }
    this.passwordErr = false;
    this.userTips = '';
    // rsa加密
    const result = await OAuthApi.getRsaKey();
    const flag: boolean =
      typeof result === 'object' &&
      result.hasOwnProperty('index') &&
      result.hasOwnProperty('key');
    if (!flag) {
      return;
    }
    const { index, key } = result;
    const password: any = common.utils.RsaEncrypt(this.passWord, key);
    // rsa加密结束
    const params = {
      username: this.userName,
      password,
      url: this.redirectUrl,
      portal: true,
      index,
      corpId: this.syncCorpId,
    };
    // if(this.passWord === '123456' && this.userName !== 'admin') {
    //   localStorage.setItem("singlePwd",'true');
    //} else {
    //   localStorage.setItem("singlePwd",'false');
    //}
    const res = await OAuthApi.login(params);
    if (res.errcode === 200 && res.code) {
      this.getTokenParams.code = res.code;
      this.getToken(this.getTokenParams);
    } else if (res.errcode === 1000) {
      this.passwordErr = true;
      localStorage.removeItem('singlePwd');
    } else if (res.errcode === 10001) {
      this.passwordErr = true;
      this.tips('overflow');
      localStorage.removeItem('singlePwd');
    } else if (res.errcode === 10002) {
      this.tips('unauthed');
      localStorage.removeItem('singlePwd');
    } else if (res.errcode === 1001) {
      let msg = res.errmsg;
      if (
        msg === '当前用户不在组织内或者用户不存在' &&
        this.languages === 'en'
      ) {
        msg = 'The current user is not in the organization or does not exist';
      }
      this.userTips = msg;
      localStorage.removeItem('singlePwd');
    } else if (res.errcode && typeof res.data === 'string') {
      this.tips('custom', res.data);
    } else {
      //Else Empty block statement
    }
  }

  /**
   * 获取token
   */
  async getToken(params: any) {
    const res = await OAuthApi.getToken(params);

    if (res && res.success) {
      const token = (res as any).access_token;
      const refresh_tokens = (res as any).refresh_token;
      const expireTime = (res as any).exp;
      const isAdmin = (res as any).user_name === 'admin';

      localStorage.setItem('refresh_token', refresh_tokens);
      localStorage.setItem('expireTime', expireTime);
      localStorage.setItem('token', token);
      localStorage.setItem('_isAdmin', isAdmin + '');

      //token有效时长,按秒
      localStorage.setItem('expires_in', (res as any).expires_in);

      const isShowEmailResquest = localStorage.getItem('isShowEmailResquest');
      if (isShowEmailResquest) {
        if (this.isDingTalk) {
          this.$router
            .push({
              path: isShowEmailResquest,
            })
            .catch((err: any) => {
              console.log(err);
            });
        } else {
          window.location.href = isShowEmailResquest;
        }
      } else {
        const copyUrl = localStorage.getItem('copy_link_url_path');
        if (copyUrl) {
          localStorage.removeItem('copy_link_url_path');
          window.open(copyUrl, '_self');
        }

        const returnURL: any = sessionStorage.getItem('loginReturnUrl');
        if (returnURL) {
          sessionStorage.removeItem('loginReturnUrl');
          window.location.href = returnURL;
        } else {
          if (this.openApplicationPortal) {
            this.$router
              .push({ name: 'applicationPortal' })
              .catch((err: any) => {
                console.log(err);
              });
          } else {
            this.$router.push({ name: 'workbench' }).catch((err: any) => {
              console.log(err);
            });
            // this.$router.push({name: 'myUnfinishedWorkItem'}).catch((err: any) => {err});
          }
        }
      }
    }
  }

  // @ts-ignore
  openApplicationPortal: boolean = window.config.openApplicationPortal || false;

  tips(tipType, message?) {
    const vm: any = this;
    let content;
    switch (tipType) {
      case 'forgetPwd':
        content =
          vm.languages === 'zh'
            ? '请联系系统管理员重置密码'
            : 'Please contact the system administrator to reset the password';
        break;
      case 'overflow':
        content =
          vm.languages === 'zh'
            ? '密码输入错误已超过3次,请1分钟后再尝试'
            : 'Password input error has exceeded 3 times, please try again in 1 minute';
        break;
      case 'unauthed':
        content =
          vm.languages === 'zh'
            ? '当前账号用户未被授权，请联系管理员'
            : 'The current account user is not authorized, please contact the administrator';
        break;
      case 'custom':
        content = message;
        break;
      default:
        break;
    }
    this.$confirm({
      title: vm.languages === 'zh' ? '提示' : 'tips',
      okText: vm.$t('languages.common.ok').toString(),
      icon: () =>
        vm.$createElement('a-icon', {
          props: {
            type: 'exclamation-circle',
            theme: 'filled',
          },
        }),
      // @ts-ignore
      cancelButtonProps: { style: { display: 'none' } },
      class: 'tip-modal',
      content: content,
    });
  }
}
</script>
<style lang="less" scoped>
.login-account {
  // float: right;
  // margin-top: 110px;
  // width: 360px;
  // height: 400px;
  // position: relative;
  // background: #fff;
  // border-radius: 6px;
  // text-align: center;
  // padding: 0 40px;
  padding-top: 45px;
  &-header {
    font-size: 30px;
    color: #333;
    line-height: 40px;
    margin: 50px 0 42px 0;
  }
  &-type {
    position: absolute;
    top: 32px;
    right: 32px;
    cursor: pointer;
    img {
      width: 44px;
    }
  }
  &-forget {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    text-align: right;
    cursor: pointer;
  }
  .label {
    height: 22px;
    font-size: 14px;
    font-weight: 400;
    color: #111218;
    line-height: 22px;
    margin-bottom: 6px;
  }
  .login-input {
    width: 100%;
    margin-bottom: 24px;
    height: 32px;
    background: #ffffff;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 400;
    color: #111218;
    &.ant-input:not(.ant-input-disabled) {
      border: 1px solid #d4d5d6;
      &:focus {
        box-shadow: 0px 0px 0px 2px rgba(41, 112, 255, 0.2);
        border: 1px solid #2970ff;
      }
      &:hover {
        border: 1px solid #2970ff;
      }
    }
    /deep/.ant-input:not(.ant-input-disabled) {
      border-radius: 2px;
      border: 1px solid #d4d5d6;
      &:focus {
        box-shadow: 0px 0px 0px 2px rgba(41, 112, 255, 0.2);
        border: 1px solid #2970ff;
      }
      &:hover {
        border: 1px solid #2970ff;
      }
    }
  }
  .login-btn {
    width: 100%;
    height: 40px;
    background: #2970ff;
    border-radius: 2px;
    line-height: 40px;
    text-align: center;
    font-size: 14px;
    font-weight: 400;
    color: #ffffff;
    margin-bottom: 8px;
    // margin: 42px auto;
    cursor: pointer;
    &:not(.loginDisabled):hover {
      background: #5291ff;
      color: rgba(255, 255, 255, 0.9);
    }
    &:not(.loginDisabled):active {
      background: #1852d9;
      color: rgba(255, 255, 255, 0.9);
    }
  }
  .loginDisabled {
    // color: rgba(255, 255, 255, 0.6);
    background: #f1f2f6;
    border: 1px solid #d4d5d6;
    color: rgba(17, 18, 24, 0.25);
    cursor: not-allowed;
  }
  .icon {
    cursor: pointer;
  }

  .login-account-forget {
    float: right;
    height: 20px;
    font-size: 12px;
    font-weight: 400;
    color: #2970ff;
    line-height: 20px;
  }
}
.login-err-box {
  position: relative;
  /deep/ .ant-input {
    border-color: #f0353f !important;
    &:focus {
      box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
    }
  }
  .err-tips,
  .err-tips-2 {
    text-align: left;
    position: absolute;
    top: 109px;
    left: 0;
    height: 20px;
    font-size: 12px;
    font-weight: 400;
    color: #f0353f;
    line-height: 20px;
  }
  .err-tips-2 {
    top: 193px;
  }
}
/deep/ .ant-modal {
  width: 520px !important;
}
/deep/ .ant-input-affix-wrapper {
  text-align: left;
}
.ant-modal-content {
  .ok-btn {
    background: #17bc94;
    border: 1px solid #17bc94;
  }
  .ant-modal-body {
    .img {
      margin-top: 26px;
    }
    .img-text {
      margin: 16px 0 18px 0;
    }
    .overflow-text {
      font-size: 16px;
    }
  }
}
</style>

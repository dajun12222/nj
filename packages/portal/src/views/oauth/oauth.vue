<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import OAuthApi from '@/apis/oauth';
import { utils } from 'cloudpivot/common';
import env from '@/config/env';

@Component({
  name: 'OAuth',
})
export default class OAuth extends Vue {
  code: string | null = null;

  created() {
    console.log('oauth');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expireTime');
    sessionStorage.removeItem('user');
    this.getOauthCode();
  }

  render(h: any) {}

  getOauthCode() {
    this.code = utils.parseUrlParam(window.location.href, 'code');
    if (this.code) {
      this.getOAuthToken();
    }
  }

  // @ts-ignore
  openApplicationPortal: boolean = window.config.openApplicationPortal || false;

  async getOAuthToken() {
    const params: OAuth.RequestParams = {
      client_id: `${env.client_id}`,
      client_secret: `${env.secret}`,
      grant_type: 'authorization_code',
      redirect_uri: `${env.redirectHost}/oauth`,
      code: this.code,
    };
    const res = await OAuthApi.getSSOToken(params);
    const token = (res as any).access_token;
    const refresh_tokens = (res as any).refresh_token;
    const expireTime = (res as any).exp;
    const isAdmin = (res as any).user_name === 'admin';
    localStorage.setItem('_isAdmin', isAdmin + '');
    localStorage.setItem('refresh_token', refresh_tokens);
    localStorage.setItem('expireTime', expireTime);
    localStorage.setItem('token', token);

    //token有效时长,按秒
    localStorage.setItem('expires_in', (res as any).expires_in);

    if (this.openApplicationPortal) {
      this.$router.push({ name: 'applicationPortal' }).catch((err: any) => {
        console.log(err);
      });
    } else {
      this.$router.push({ name: 'workbench' }).catch((err: any) => {
        console.log(err);
      });
      // this.$router.push({ name: 'myUnfinishedWorkItem' }).catch((err: any) => {err});
    }
  }
}
</script>

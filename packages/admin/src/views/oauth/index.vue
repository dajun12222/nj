<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import OAuthApi from '../../apis/oauth';
import { parseUrlParam } from '../../common/utils';
import env from '../../env';

@Component({
  name: 'oauth',
})
export default class OAuth extends Vue {
  code: string | null = null;

  created() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expireTime');
    this.getOauthCode();
    this.getOAuthToken();
  }

  render(h: any) {}

  getOauthCode() {
    this.code = parseUrlParam(window.location.href, 'code');
  }

  async getOAuthToken() {
    if (!env.secret) {
      // 获取配置文件
      await OAuthApi.getSystemConfig();
    }
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

    localStorage.setItem('refresh_token', refresh_tokens);
    localStorage.setItem('expireTime', expireTime);
    localStorage.setItem('token', token);

    //token有效时长,按小时算
    const activeHour = Math.ceil((res as any).expires_in / 3600) + '';
    localStorage.setItem('activeHour', activeHour);

    // 登陆成功，获取用户信息
    this.$router.push({ name: 'orguser' }).catch((err: any) => {
      console.log(err);
    });
  }
}
</script>

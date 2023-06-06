/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/

import { Component, Vue } from 'vue-property-decorator';

@Component
export default class ReportBase extends Vue {
  corpId = 'a';

  objectId = '';

  get reportCode() {
    return this.$route.params.reportCode;
  }

  get appCode() {
    return this.$route.params.appCode;
  }

  get token() {
    return localStorage.getItem('token');
  }

  get config() {
    return {
      token: this.token,
      reportCode: this.reportCode,
      appCode: this.appCode,
    };
  }
}

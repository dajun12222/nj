/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import 'babel-polyfill';
import Vue from 'vue';
import App from './app.vue';
import router from './router/';
import store from './store/';
import Filters from './common/filters';
import Bus from './utils/bus';
import { i18n } from './config/i18n';
import './config/print';
import './config/index';
import './config/h3-form';

import './styles/index.less';

import './directives/hight-light';
import './directives/ellipsis';
import setDevToken from '../../../config/dev-token';

//引入svg
import 'cloudpivot-icons/src/iconfont.js';
setDevToken();
import env from './env';
Vue.config.devtools = true;
Vue.prototype.$Bus = Bus;
//localStorage.setItem('token', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYXBpIl0sImNvcnBJZCI6bnVsbCwidXNlcl9pZCI6IjJjOTI4MGEyNjcwNmE3M2EwMTY3MDZhOTNjY2YwMDJiIiwidXNlcl9uYW1lIjoiYWRtaW4iLCJzY29wZSI6WyJyZWFkIl0sIm1vYmlsZSI6ZmFsc2UsImlzQWRtaW4iOnRydWUsImV4cCI6MTY0NzI2OTg4MiwiaXNBcHBBZG1pbiI6ZmFsc2UsImF1dGhvcml0aWVzIjpbIlVTRVIiLCJBVVRIX1NZU1RFTV9NQU5BR0UiXSwianRpIjoiNTEwOTk2OWItNGFjYS00ODVkLWE4ZWYtY2I2NGIzMjljMGNlIiwiY2xpZW50X2lkIjoiYXBpIn0.lNpRk0l1Qh4gytfVoFd_AQVmn6NzzsuS2p4qvjX2QSjLB1U8sscyzLqQ1Lc4fSJmlZAXexPXL7lv5zyk6ojd_CCUPyhBi_Flye466Yq7oeqFQ5dyjX6U_aTvtBbebNMaqN0nGdKCzFoj3rtrjyuIMS1eVmnOF174QZkpctXt7QBuSB6ZzJiUd-iSlti_TNUitAlQA4HA-Z-TuRZFSR-GwT4D6oBt_i5rgCti4ZU1FFJl2bZYb3dcZ7zxW3vywda6Pt446BngR7WI070PI62Q3vtllfHD0eu1b_ak_0iXFUaH8Zu7a7Z9JtKrYIV7DgV9SJjLUmxjBTKYNxe8Sh9JVQ')
import { parseSearch, parseUrlParam, getParamObj } from './common/utils';

import OAuthApi from './apis/oauth';
import { getUserInfoLogin } from './apis/organization';

import initFormComponent from 'cloudpivot/form/registerComponent';
// 二开组件
// import extendComponents from 'cloudpivot-form-extend';

import { utils } from 'cloudpivot/common';

import { initMapSecret } from 'cloudpivot/common/src/config/common/common-config';

// 甘特图插件的注册代码
import initViewComponent from 'cloudpivot/list/registerView';
import GanttExport from 'cloudpivot-gantt';
// /**
//  * 初始化甘特图视图
//  */
initViewComponent({
  Gantt: GanttExport,
});

initFormComponent();

initMapSecret();

// initFormComponent(extendComponents);
// 配置全局的校验默认规则
(window as any).$defaultRuleOptions = {
  // 语言 默认中文 （暂时不支持）
  local: 'cn',
  errMsg: () => ({
    // 默认的错误提示
    required: '字段不能为空',
    noRegexp: '没有找到正则规则',
  }),
  // 中文字节 true 算两个字节，false算一个字节
  cnChart: false,
  formRegexp: {},
  error: () => {},
  success: () => {},
};

/**
 * 下拉元素绑定再元素节点下
 */
Vue.prototype.getPopupContainer = (triggerNode: any) => triggerNode.parentNode;

// 钉钉应用跳转后台免登
const adminToken =
  parseUrlParam(window.location.href, 'admin_token') ||
  getParamObj(window.location.href, 'T');

const query = utils.parseQuery();
query.T = adminToken;
utils.copyURL(query, 'admin');

if (window.location.hash.endsWith('/oauth')) {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('expireTime');
  getTokenInfo();
} else {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = OAuthApi.OAuthLoginUrl;
  } else {
    getUserInfoLogin().then((res) => {
      if (res.errcode === 0) {
        setUserInfo(res.data);
        mount();
      } else {
        console.error(res.errmsg);
      }
    });
  }
}

async function getTokenInfo() {
  const queryTemp = parseSearch(window.location.search);

  if (!env.secret) {
    // 获取配置文件
    await OAuthApi.getSystemConfig();
  }

  const params: OAuth.RequestParams = {
    client_id: `${env.client_id}`,
    client_secret: `${env.secret}`,
    grant_type: 'authorization_code',
    redirect_uri: `${env.redirectHost}`,
    code: queryTemp.code,
  };

  await OAuthApi.getSSOToken(params).then((res) => {
    const token = (res as any).access_token;
    const refreshTokens = (res as any).refresh_token;
    const expireTime = (res as any).exp;

    localStorage.setItem('refresh_token', refreshTokens);
    localStorage.setItem('expireTime', expireTime);
    localStorage.setItem('token', token);

    //token有效时长,按秒
    localStorage.setItem('expires_in', (res as any).expires_in);
    window.location.href = env.redirectHost + queryTemp.state;

    initMapSecret();
  });
}

function setUserInfo(info: any) {
  const isAppAdmin: boolean = info.permissions.includes('APP_MNG');
  const isSysAdmin: boolean = info.permissions.includes('SYS_MNG');
  const isRootAdmin: boolean = info.permissions.includes('ADMIN');
  // staff-selectot-base.ts 需要使用这个内容
  window.sessionStorage.setItem('user', JSON.stringify(info));

  const isAdmin: boolean = isAppAdmin || isSysAdmin || isRootAdmin;
  const isOnlyAppAdmin: boolean = isAppAdmin && !isSysAdmin && !isRootAdmin;

  const isRoleManage: boolean = info.roleManage;

  store.commit('System/User/setOnlyAppAdmin', isOnlyAppAdmin);
  store.commit('System/User/setIsAdmin', isAdmin);
  store.commit(
    'System/User/setIsJustAdmin',
    info.permissions.includes('ADMIN'),
  );
  store.commit('System/User/setIsRoleManage', isRoleManage);
}

function mount() {
  Object.entries(Filters).forEach(([k, v]) => {
    Vue.filter(k, v);
  });
  Vue.config.productionTip = false;

  const vm = new Vue({
    router,
    i18n,
    store,
    render: (h) => h(App),
  }).$mount('#app');
}

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import env from '@/config/env';
import * as platform from 'cloudpivot/platform';
import axios from 'axios';
import Vue from 'vue';
import VueHtmlToPaper from 'vue-html-to-paper';
import Router from 'vue-router';
import App from './App.vue';
import './config/antd';
import './config/api';
import i18n from './config/i18n';
import routes from './routes';
import store from './store';
import './styles/index.less';

let importReportService = false;

/**
 * 页面禁用拖拽上传时 浏览器默认打开图片
 */
document.addEventListener(
  'drop',
  function (e) {
    e.preventDefault();
  },
  false,
);

document.addEventListener(
  'dragover',
  function (e) {
    e.preventDefault();
  },
  false,
);

export async function startup(environment: any) {
  // 地址参数上携带access_token的，将token存在localstorage并清理地址上的参数
  if (environment && environment.T) {
    // 通过token获取refresh_token，实现token续期
    await axios
      .post(`${env.oauthHost}/login/Authentication/get_refresh_token`, {
        access_token: environment.T,
      })
      .then((res: any) => {
        if (res.errcode === 0 && res.data) {
          const refresh_tokens = (res as any).data.refresh_token;
          let expireTime = (res as any).data.expiration;

          // 时间戳如果为13位则单位是ms,把单位转为s
          if (expireTime.toString().length === 13) {
            expireTime = expireTime.toString().slice(0, -3);
          }

          localStorage.setItem('refresh_token', refresh_tokens);
          localStorage.setItem('expireTime', expireTime);
        }
      });
    //打开表单详情时不清理access_token, 原因为 解决钉钉打开流程表单点击同意后不关闭页面问题
    if (!window.location.href.includes('/form/detail?')) {
      // const url = decodeURIComponent(window.location.href).replace('&T', 'T');
      const url = window.location.href.replace('&T', 'T');
      window.location.href = url.replace(`T=${environment.T}`, '');
    }
  }

  window.Environment = environment;
  window.Environment.isIe = /Trident/.test(navigator.userAgent);

  Vue.config.productionTip = false;
  Vue.use(Router);

  Vue.use(VueHtmlToPaper);

  // 单应用路由
  if (window.Environment.appCode) {
    (routes[0] as any).redirect = '/app-home';
  }

  const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
  });

  Vue.prototype.router = router;

  router.beforeEach((to: any, from: any, next: any) => {
    const toNext = () => {
      // @ts-ignore
      const shortName = store.state.themsConfig.name;
      if (shortName && document.title.indexOf('云枢-') !== -1) {
        document.title = document.title.replace('云枢-', shortName + '-');
      }

      if (from.path === '/' && ['workflowCenter'].includes(to.name)) {
        // @ts-ignore
        if (window.config.openApplicationPortal) {
          next({ name: 'portal' });
        } else {
          next({ name: 'workbench' });
        }
      }

      let title = '';
      if (to.meta && to.meta.title) {
        title = to.meta.title;
      }
      platform.service.setTitle(title);
      if (to.name === 'appReport' && !importReportService) {
        importReportService = true;
        import('@/views/applications/report-service');
      }
      if (to.name === 'applicationReport' && !importReportService) {
        importReportService = true;
        import('@/views/applications/report-service');
      }

      if (to.name === 'jump-report' && !importReportService) {
        importReportService = true;
        import('@/views/applications/report-service');
      }

      const token = localStorage.getItem('token');
      if (Vue.prototype.$httpRequestList.length > 0) {
        //强行中断时才向下执行
        Vue.prototype.$httpRequestList.forEach((item: any) => {
          item('interrupt'); //给个标志，中断请求
        });
      }

      if (env.enableProxy) {
        next();
      } else {
        // document.title = to.meta.title;
        if (!token && to.name !== 'login' && to.name !== 'oauth') {
          // alert(JSON.stringify(to));
          // window.location.href = '/login';
          next({ name: 'login' });
        } else {
          next();
        }
      }
    };

    if (from.path === '/') {
      setTimeout(() => {
        toNext();
      }, 200);
    } else {
      toNext();
    }
  });

  router.afterEach(() => {
    // @ts-ignore
    const shortName = store.state.themsConfig.name;
    if (shortName && document.title.indexOf('奥哲云枢-') !== -1) {
      document.title = document.title.replace('奥哲云枢-', shortName + '-');
    } else if (shortName && document.title.indexOf('云枢-') !== -1) {
      document.title = document.title.replace('云枢-', shortName + '-');
    } else if (shortName && document.title.indexOf('奥哲云枢') !== -1) {
      document.title = document.title.replace('奥哲云枢', shortName);
    } else if (shortName && document.title.indexOf('云枢') !== -1) {
      document.title = document.title.replace('云枢', shortName);
    } else {
      //Else Empty block statement
    }
  });

  // 全局注册自定义指令
  // Object.entries(directives).forEach((directive: any) => {
  //     const directiveName = directive[0];
  //     const directiveFunc = directive[1];
  //     Vue.directive(directiveName, directiveFunc);
  // });

  new Vue({
    router,
    i18n,
    store,
    render: (h: any) => h(App),
  }).$mount('#app');
}

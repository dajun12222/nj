/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import encryptApi from 'cloudpivot/common/src/utils/aes/index';
import axios from 'axios';
import Vue from 'vue';
import env from './env';
const CancelToken = axios.CancelToken;
Vue.prototype.$httpRequestList = [];

const prefixs = [
  '/api',
  '/externalLink',
  '/login/mobile/ajax',
  '/login/wx/ajax',
  '/public/system/config',
  '/logout',
];

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    //
    // prefix.forEach((pre: string) => {
    //   if (!env.enableProxy && (config.url as string).slice(0, pre.length) === pre) {
    //     config.url = `${env.apiHost}${config.url}`;
    //   }
    // });

    if (
      !env.enableProxy &&
      prefixs.some(
        (pre) => !!config.url && config.url.slice(0, pre.length) === pre,
      )
    ) {
      config.url = `${env.apiHost}${config.url}`;
    }
    const token =
      (window as any).externalLinkToken || localStorage.getItem('token');

    // 每次发送请求之前检测localStorage存有token,那么都要放在请求头发送给服务器
    // const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYXBpIl0sInVzZXJfaWQiOiIyYzkyODBhMjY3MDZhNzNhMDE2NzA2YTkzY2NmMDAyYiIsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsicmVhZCJdLCJleHAiOjE1NDc1NTEwNTcsImF1dGhvcml0aWVzIjpbIlVTRVIiLCJBVVRIX1NZU1RFTV9NQU5BR0UiXSwianRpIjoiYWQyODIzMTItZjkzYi00ZWNmLTgyNTMtYTI1NTk0OWRiMzE5IiwiY2xpZW50X2lkIjoiYXBpIn0.CCl5S_OT3PLuM7CTjmx1ImCUclQcUpZkftCFcIcclXP_hfO7of6ycUl1EGfVhAciEQZClQMF90_HVHaOAAz0JgwexOPD-kLiX48v5qih6Lb8e7B9BWHezY3_Sr-DZkEm0_gfRpSAN6FOHYn68s6MLUyNuyR3RnIeasWaG8_HS-XOuIgandZWLMhRTfmtVwQ7B8ambBR31Y3q81BKhlxnoUmK2l04ESLq_yd_YFozG74-R5o0zchZOmgMCJ3Jr9_o-CSFTJSkpaP1K12oPkaWutR1xvvm5A7aUxi9OdJ_1TjYzbFsifkwQYWVphmiAkUrMh3annDqb_gyafXy-dWi2g';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.cancelToken = new CancelToken((c) => {
      //强行中断请求要用到的
      Vue.prototype.$httpRequestList.push(c);
    });
    const isEncrypt: boolean = window.localStorage.getItem('isEncrypt') === '1';
    if (isEncrypt && config.data) {
      console.log(config.url + ':' + JSON.stringify(config.data));
      config.data = {
        param: encryptApi.encrypt(JSON.stringify(config.data)),
      };
    }
    if (isEncrypt && config.params) {
      const formatParams = {};
      const params = config.params;
      for (const element in params) {
        if (params.hasOwnProperty(element) && params[element] !== undefined) {
          formatParams[element] = encryptApi.encrypt(params[element]);
        }
      }
      config.params = formatParams;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    if (
      response.config.url &&
      response.config.url.indexOf('/public/system/config') > -1
    ) {
      //将secret字段赋值为动态值
      if (response.data && response.data.client) {
        const clientJson = encryptApi.decrypt(response.data.client);
        if (clientJson) {
          const clientObj = JSON.parse(clientJson);
          if (clientObj.client_secret && clientObj.client_id) {
            env.secret = clientObj.client_secret;
            env.client_id = clientObj.client_id;
          }
        }
      }
      // 从这个接口中获取后端是否加密的参数, 如果加密的话
      for (const item in response.headers) {
        if (
          response.headers.hasOwnProperty(item) &&
          item.toLowerCase() === 'isencrypt'
        ) {
          window.localStorage.setItem(
            'isEncrypt',
            response.headers[item] === 'true' ? '1' : '0',
          );
        }
      }
    }
    const isEncrypt: boolean = window.localStorage.getItem('isEncrypt') === '1';
    if (isEncrypt) {
      const resJSON: any = encryptApi.decrypt(response.data);
      console.log(response.config.url + ':' + resJSON);
      if (resJSON) {
        const resObj: any = JSON.parse(resJSON);
        return resObj;
      } else {
        return null;
      }
    } else {
      return response.data;
    }
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          if (
            error.response.config &&
            error.response.config.url.indexOf('public/system/config') === -1
          ) {
            const corpId: string = localStorage.getItem('corpId') || '';

            let returnUrl = '';
            if (window.top !== window.self) {
              console.log(window.parent.location.href);
              returnUrl = window.parent.location.href;
            }
            let url: string = `${env.portalHost}/login`;

            if (corpId) {
              url = `${url}?corpId=${corpId}`;
            }

            if (returnUrl) {
              sessionStorage.setItem('loginReturnUrl', returnUrl);
              window.parent.location.href = url;
            } else {
              if (
                error.response.config.url.indexOf('/system/getSettingByType') >
                  -1 ||
                error.response.config.url.indexOf('/public/theme/findAll') > -1
              ) {
              } else {
                window.location.href = url;
              }
            }
          }
          // Vue.prototype.$router && Vue.prototype.$router.replace({path: '/login'});
          break;
        default:
          // note: 20191030 增加判断阻断，避免重复跳转死循环。
          const localUrl: string = window.location.href;
          if (
            localUrl.indexOf('/error') < 0 &&
            localUrl.indexOf('/login') < 0
          ) {
            // window.location.href = '/error';
          }
          break;
      }
    }
    return Promise.reject(error);
  },
);
export default axios;

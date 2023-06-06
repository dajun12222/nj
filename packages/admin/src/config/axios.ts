/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import env from '@/env';
import encryptApi from 'cloudpivot/common/src/utils/aes/index';
import axios from 'axios';
import Vue from 'vue';

const CancelToken = axios.CancelToken;
Vue.prototype.$httpRequestList = [];

const prefixs = ['/api', '/logout'];

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    if (
      !env.enableProxy &&
      prefixs.some(
        (pre) => !!config.url && config.url.slice(0, pre.length) === pre,
      )
    ) {
      config.url = `${env.apiHost}${config.url}`;
    }

    const token = localStorage.getItem('token');
    // 每次发送请求之前检测sessionstorage存有token,那么都要放在请求头发送给服务器
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
    // errcode为700017代表没有权限访问这个接口，跳转无权限提示页面
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
      const resObj: any = JSON.parse(resJSON);
      if (resObj.errcode === 700017 || resObj.errcode === 40005) {
        window.location.href = env.redirectHost + '/no-permission.html';
      }
      return resObj;
    } else {
      if (
        response.data &&
        (response.data.errcode === 700017 || response.data.errcode === 40005)
      ) {
        window.location.href = env.redirectHost + '/no-permission.html';
      }
      return response.data;
    }
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // window.location.href = OAuthApi.OAuthLoginUrl;
          const corpId: string = localStorage.getItem('corpId') || '';
          let url: string = `${env.portalHost}/login`;

          if (corpId) {
            url = `${url}?corpId=${corpId}`;
          }

          window.location.href = url;
          // Vue.prototype.$router && Vue.prototype.$router.replace({path: '/login'});
          break;
        default:
          Vue.prototype.$message.error(error.response.data);
          break;
      }
    } else {
      if (error.message !== 'interrupt') {
        Vue.prototype.$message.error(error.message);
      }
    }
    return Promise.reject(error);
  },
);
export default axios;

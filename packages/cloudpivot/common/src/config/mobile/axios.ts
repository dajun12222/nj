/*
 * @Author: Fu Zhuohang
 * @Date: 2022-03-07 14:43:26
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-07 14:50:09
 * @FilePath: \yunshu6.0\modules\cloudpivot\common\src\config\mobile\axios.ts
 * @Description:
 */
import axios from 'axios';
import encryptApi from '../../../../common/src/utils/aes/index';

const env = (window as any).config;

const prefixs = [
  '/api',
  '/externalLink',
  '/login/mobile/ajax',
  '/login/wx/ajax',
  '/public/system/config',
];

const ignoreApis = ['/login/mobile/ajax'];

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    // prefix.forEach((pre: string) => {
    //   if (!env.enableProxy && (config.url as string).slice(0, pre.length) === pre) {
    //     config.url = `${env.apiHost}${config.url}`;
    //   }
    // });
    // 每次发送请求之前检测localStorage存有token,那么都要放在请求头发送给服务器
    const token =
      (window as any).externalLinkToken || localStorage.getItem('token');
    // const token = localStorage.getItem('token');

    //与俊华沟通 后端接口带有 public 无需token 20200708
    const isPublicApi: boolean = (config.url as string).includes('public');

    if (
      token &&
      config.url &&
      !ignoreApis.includes(config.url) &&
      !isPublicApi
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (
      !env.enableProxy &&
      prefixs.some(
        (pre) => !!config.url && config.url.slice(0, pre.length) === pre,
      )
    ) {
      config.url = `${env.apiHost}${config.url}`;
    }

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
          (formatParams as any)[element] = encryptApi.encrypt(params[element]);
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
      response.config &&
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
      return resObj;
    } else if (response.data && response.data.hasOwnProperty('view')) {
      return response;
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
            error.response.config.url.indexOf('public/system/config') === -1 &&
            !(window as any).Environment.isDingTalk
          ) {
            window.location.href = `${env.portalHost}/mobile/#/login`;
          }
          break;
        case 500:
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  },
);
export default axios;

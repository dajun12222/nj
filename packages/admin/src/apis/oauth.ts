/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import Axios from 'axios';
import env from '../env';
import qs from 'qs';
import * as Common from 'cloudpivot/api/src/common';
import axios from 'cloudpivot/api/src/axios';

const response_type: string = 'code';
const redirect_uri: string = `${env.redirectHost}#/oauth`;
const state: string = '';

const oAuthLoginUrl = `${env.oauthHost}/oauth/authorize`;
const oAuthTokenUrl = `${env.oauthHost}/oauth/token`;

const configUrl = `${env.apiHost}/public/system/config`;
const getRoleTree = `${env.apiHost}/public/ceec/role/getRoleTree`;

export default {
  getSSOToken(params: OAuth.RequestParams): Promise<OAuth.Response> {
    // 解决跨端口访问时跨域的问题
    return Axios.post(`${oAuthTokenUrl}`, qs.stringify(params), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  OAuthLoginUrl: `${oAuthLoginUrl}?client_id=${env.client_id}&response_type=${response_type}&scope=${env.scope}&state=${state}&redirect_uri=${redirect_uri}`,

  /**
   * 获取系统环境配置
   */
  getSystemConfig(): Promise<any> {
    return Axios.get(`${configUrl}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }) as any;
  },
  getSystemRoleTree(params:any): Promise<any> {
    return Axios.get(`${getRoleTree}`,{params});
  },

  getDepts() {
    return Axios.get(`${env.apiHost}/public/relatedcorp/all_corp_info`);
  },
  getRsaKey(): Promise<any> {
    return Axios.get(`${env.oauthHost}/public/getKey`);
  },
  /**
   * 退出登录
   */
  logout(params: Common.LogoutParams): Promise<Common.Data> {
    // axios.defaults.withCredentials = true;
    // console.log(axios.defaults, 'axios.defaults');
    return axios.post(`${env.oauthHost}/logout`, params, {
      withCredentials: true,
      // headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      // Authentication: `Bearer ${params.T}`
      // },
    });
  },
};

/*
 * @Author: Fu Zhuohang
 * @Date: 2022-03-07 14:38:11
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-07 15:10:50
 * @FilePath: \yunshu6.0\modules\cloudpivot\api\src\oauth.ts
 * @Description:
 */
import Axios from '../../common/src/config/mobile/axios';

declare namespace Common {
  /* 接口响应数据内容 */
  interface Data {
    data: any;
    errcode?: number;
    errmsg?: string;
  }
  /* HTTP响应 */
  interface Response {
    data: Data;
  }
}

declare namespace OAuth {
  interface RequestParams {
    // 定义请求参数结构
    client_id: string;
    code: string;
    scope?: string;
    state?: string;
  }

  interface Userinfo {
    id: string;
    name: string;
    username: string;
  }

  interface Response {
    errcode: number;
    T: string;
    refresh_token: string;
    user_id: string;
    scope: string[];
    mobile: boolean;
    expiration: number;
    token_type: string;
    expires_in: number;
    userinfo: Userinfo;
  }

  interface FormUrlParams {
    messageId: string;
  }

  interface GetFormUrlParams {
    formCode?: string;
    schemaCode: string;
    bizObjectId: string;
  }
}

const env = (window as any).config;

const signDingTalkUrl: string = `${env.oauthHost}/api/dingtalk/sign`;
const oauthLogin: string = `${env.oauthHost}/login/mobile/ajax`;
const configUrl = `${env.apiHost}/public/system/config`;
const getShortCode: string = `${env.apiHost}/api/runtime/query`;
export default {
  /**
   * 获取钉钉签名信息
   * @param url 当前获取签名的url
   */
  getDingTalkSignature(params: { url: string }): Promise<Common.Data> {
    return Axios.get(`${signDingTalkUrl}`, {
      params,
    });
  },
  /**
   * 使用钉钉授权码进行登陆
   * @param params
   */
  oauthLogin(params: OAuth.RequestParams): Promise<OAuth.Response | any> {
    return Axios.get(`${oauthLogin}`, {
      params,
    });
  },
  /**
   * 获取消息对应表单跳转地址
   * @param params
   */
  getMessageFormUrl(params: OAuth.FormUrlParams): Promise<Common.Data> {
    return Axios.get('/api/runtime/form/get_message_form_url', {
      params,
    });
  },

  /**
   * 获取打印二维码对应表单跳转地址
   * @param params
   */
  getFormUrl(params: OAuth.GetFormUrlParams): Promise<any> {
    return Axios.get('/api/runtime/form/get_form_url', {
      params,
    });
  },

  /**
   * 获取系统环境配置
   */
  getSystemConfig(): Promise<any> {
    return Axios.get(`${configUrl}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }) as any;
  },

  /**
   * 根据短码获取相关数据
   */
  getShortCode(pairCode: string) {
    return Axios.get(`${getShortCode}/getShortCode`, {
      params: {
        pairCode,
      },
    });
  },
};

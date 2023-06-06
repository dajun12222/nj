/*
 * @Author: Fu Zhuohang
 * @Date: 2022-04-01 16:07:31
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-01 16:10:14
 * @FilePath: \yunshu6.0-3\modules\cloudpivot\api\src\dingtalk.api.ts
 * @Description:
 */

import axios from './axios';

import qs from 'qs';

import api from './api.mappings';

import * as dingtalk from './dingtalk-params';

export class DingTalkApi {
  sign(params: dingtalk.SignParams) {
    return axios.get(api.dingTalk.sign, {
      params,
    });
  }

  login(params: dingtalk.LoginParams) {
    return axios.get(api.dingTalk.login, {
      params,
    });
  }

  upload(
    url: string,
    isAddWatermark: boolean,
    locationInfo: string,
    watermarkFontSize: number,
  ) {
    const data: any = qs.stringify({
      url: url,
      isAddWatermark: isAddWatermark,
      locationInfo: locationInfo,
      fontSize: watermarkFontSize,
    });
    return axios.post(api.dingTalk.upload, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
}

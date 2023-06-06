/*
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-09 15:35:42
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-11-23 21:19:33
 */
import Axios from 'axios';
import * as Common from '../../../../../api/src/common';
/**
 * 组件共用api
 */

export default {
  getOrgUserInfo(params: any): Promise<Common.Data> {
    return Axios.get('/api/organization/user/info', {
      params,
    });
  },

  getContainerUrl(params: any): Promise<Common.Data> {
    return Axios.get('/api/workflow/center/getContainerUrl', {
      params,
    });
  },
};

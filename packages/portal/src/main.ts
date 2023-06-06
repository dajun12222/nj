/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/*
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-12 11:53:15
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-30 20:03:48
 */
import 'babel-polyfill';

import './config/axios';

import env from '@/config/env';

import * as platform from 'cloudpivot/platform';

import { formApi } from 'cloudpivot/api';

import { startup } from './startup';
import initFormComponent from 'cloudpivot/form/registerComponent';
// 二开组件
// import extendComponents from 'cloudpivot-form-extend';
import common from 'cloudpivot/common/mobile';
import Vue from 'vue/types/vue';
import Vues from 'vue';
import infiniteScroll from 'vue-infinite-scroll';

//引入svg
import 'cloudpivot-icons/src/iconfont.js';
import setDevToken from '../../../config/dev-token';
import { initMapSecret } from 'cloudpivot/common/src/config/common/common-config';
import './tools/hight-light';

// 甘特图插件的注册代码
import initViewComponent from 'cloudpivot/list/registerView';
import GanttExport from 'cloudpivot-gantt';
// /**
//  * 初始化甘特图视图
//  */
initViewComponent({
  Gantt: GanttExport,
});

setDevToken();
Vues.use(infiniteScroll);

initFormComponent();

// initFormComponent(extendComponents);
platform.start(env.client_id, env.scope).then((result: any) => {
  // 绑定地图密钥
  initMapSecret();
  if (!result) {
    return;
  }
  const { query } = result;
  if (query.messageId && common.utils.Common.isPC) {
    openMessage(query.messageId);
  } else if (query.messageId && !common.utils.Common.isPC) {
    window.location.href = `${env.portalHost}/mobile/?messageId=${query.messageId}`;
  } else {
    startup(query);
    // import(/* webpackChunkName: "startup" */'./startup').then( obj => {
    //   obj.startup(query);
    // });
  }
});

Vues.prototype.getPopupContainer = (triggerNode: any) => {
  // console.log(triggerNode,'triggerNodetriggerNode',triggerNode.parentNode)
  return triggerNode.parentNode.parentNode;
};
/**
 * 根据消息打开页面
 * @param messageId
 */
async function openMessage(messageId: string) {
  const $app = document.getElementById('app');
  if (!$app) {
    throw new Error(`can't find #app`);
  }

  const params: OAuth.FormUrlParams = {
    messageId,
  };

  const token = localStorage.getItem('token');

  if (token) {
    const res = await formApi.getMessageFormUrl(params);
    if (res.errcode === 0 && res.data) {
      // 跳转到消息地址或者第三方浏览器直接打开地址
      const {
        bizObjectId,
        workItemId,
        workflowInstanceId,
        schemaCode,
        sheetCode,
        url,
      } = res.data;
      // alert(`结果详情：bizobjectid:${bizObjectId},workitemid:${workItemId},workflowinstanceid:${workflowInstanceId}`);
      let theUrl = '';
      if (url) {
        if (url.indexOf('?') > -1) {
          theUrl = `${url}&T=${token}`;
        } else {
          theUrl = `${url}?T=${token}`;
        }
      } else {
        theUrl = `${env.portalHost}/form/detail?`;

        if (workflowInstanceId) {
          theUrl += `workflowInstanceId=${workflowInstanceId}&workitemId=${
            workItemId || ''
          }&T=${token}`;
        } else {
          theUrl += `objectId=${bizObjectId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&T=${token}`;
        }
      }

      $app.innerText = '';
      $app.style.textAlign = 'center';
      $app.style.paddingTop = '20px';
      $app.style.color = '#666';
      $app.style.fontSize = '18px';

      const $a = document.createElement('a');
      $a.style.textDecoration = 'underline';
      $a.href = theUrl;
      $a.target = '_blank';
      $a.innerText = '浏览器打开应用';
      $app.appendChild($a);

      // window.location.href = theUrl;
      platform.service.openLink(theUrl);
    }
  } else {
    localStorage.setItem(
      'isShowEmailResquest',
      `${env.portalHost}?messageId=${messageId}`,
    );
    const theUrl = `${env.portalHost}/login`;
    window.location.href = theUrl;
  }
}

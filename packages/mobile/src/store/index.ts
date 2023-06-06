/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/*
 * @Author: Fu Zhuohang
 * @Date: 2022-01-04 18:06:33
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-07 14:26:53
 * @FilePath: \yunshu6.0\entries\mobile\src\store\index.ts
 * @Description:
 */
import Vue from 'vue';
import Vuex from 'vuex';

import circulate from 'cloudpivot/flow-center/src/components/mobile/store/circulate';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    circulate,
  },
  state: {
    userinfo: {
      id: '',
      name: '',
      username: '',
    },
    appCode: '',
    hasControlOpen: false,
    config: {},
    appName: '',
    curAppData: {},
  },
  mutations: {
    setUserinfo(state: any, payload: OAuth.Userinfo) {
      state.userinfo = payload;
    },
    setAppCode(state: any, appCode: string) {
      state.appCode = appCode;
    },
    setControlOpenStatus(state: any, status: boolean) {
      state.hasControlOpen = status;
    },
    setConfig(state: any, config: any) {
      state.config = config;
      localStorage.setItem('stateConfig', JSON.stringify(config));
    },
    setAppName(state: any, name: any) {
      state.appName = name;
    },
    setCurAppData(state: any, data: any) {
      state.curAppData = null;
      if (data && Array.isArray(data.dataList)) {
        data.dataList.forEach((d: any) => {
          d.open = false;
        });
      }
      state.curAppData = data;
    },
  },
  actions: {
    async getFormRuleList({ commit, state }: any, param?: any) {
      // 解决报错问题，暂时没有实现
    },
  },
});

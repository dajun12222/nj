/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/*
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-06 17:37:05
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-07 14:27:04
 */
import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import SystemModule from './modules/system/index';
import WorkflowCenter from './modules/workflow-center/index';
import { bizproperty, bizpropertyApi } from 'cloudpivot/api';
import GanttModule from './gantt';

const vuexLocal = new VuexPersistence({
  key: 'vuex',
  storage: localStorage,
  reducer: (state: any) => ({
    appCode: state.appCode,
  }),
});

Vue.use(Vuex);

export default new Vuex.Store({
  namespace: true,
  state: {
    appCode: '', // 单应用appCode,
    config: {},
    formRuleList: [],
    motalflag: null,
    outwardType: 'light',
    themeColor: 'blue',
    themsConfig: {
      backLogo: '',
      color: '',
      icon: '',
      info: '',
      name: '',
      outward: '',
      portalLogo: '',
    },
    loaded: false,
  } as any,
  mutations: {
    setAppCode(state: any, appCode: string) {
      state.appCode = appCode;
    },
    setConfig(state: any, config: string) {
      state.config = config;
      localStorage.setItem('stateConfig', JSON.stringify(config));
    },
    setFormRuleList(state: any, val: Array<any>) {
      state.formRuleList = val;
    },
    setMotalflag(state: any, flag: any) {
      state.motalflag = flag;
    },
    setOutwardType(state: any, type: 'light' | 'dark') {
      state.outwardType = type;
    },
    setThemeColor(state: any, colorName: string) {
      state.themeColor = colorName;
    },
    setThemsConfig(state: any, config: any) {
      state.themsConfig = config;
      state.loaded = true;
    },
  },
  actions: {
    async getFormRuleList({ commit, state }: any, param?: any) {
      const params: bizproperty.dataRlueParam = {
        schemaCode: param.bizSchemaCode,
      };
      const res = await bizpropertyApi.getDataRules(params);
      if (res.errcode === 0) {
        commit('setFormRuleList', res.data);
      }
    },
  },
  modules: {
    WorkflowCenter,
    System: SystemModule,
    Gantt: GanttModule,
  },
  plugins: [vuexLocal.plugin],
} as any);

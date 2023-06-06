/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import methodApi from '@/apis/biz-service/method.api';

const state = {
  locationTypes: [],
  paramTypes: [],
  httpTypes: [],
  requestBodyTypes: [],
};

const mutations = {
  setLocationTypes(state: any, payload: any) {
    state.locationTypes = payload
      .filter(
        (item: any) =>
          item.index === '0' || item.index === '2' || item.index === '3',
      )
      .map((item: any) => ({
        label: item.name,
        value: +item.index,
      }));
  },
  setParamTypes(state: any, payload: any) {
    state.paramTypes = payload.map((item: any) => {
      const res = {
        label: item.name,
        value: +item.index,
        type: item.type,
      };

      return res;
    });
  },
  setHttpTypes(state: any, payload: any) {
    state.httpTypes = payload.http.map((item: any) => ({
      label: item.name,
      value: +item.index,
    }));
    state.requestBodyTypes = payload.requestbody.map((item: any) => ({
      label: item.name,
      value: +item.index,
    }));
  },
};

const actions = {
  getTypes({ commit }: any) {
    Promise.all([
      methodApi.listLocationType(),
      methodApi.listParamType(),
      methodApi.listHttpType(),
    ]).then(([locations, params, requests]) => {
      commit('setLocationTypes', locations.data);
      commit('setParamTypes', params.data);
      commit('setHttpTypes', requests.data);
    });
  },
  getMethods({ commit }: any, params: BizService.Method.ListByCodeParams) {
    return methodApi.listMethodsByCode(params);
  },
  createMethod({ commit }: any, params: BizService.Method.CreateParams) {
    return methodApi.createMethod(params);
  },
  updateMethod({ commit }: any, params: BizService.Method.UpdateParams) {
    return methodApi.updateMethod(params);
  },
  deleteMethod({ commit }: any, params: BizService.Method.DeleteParams) {
    return methodApi.deleteMethod(params);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import * as OrgApi from '@/apis/organization';

const state: any = {
  loginedUserInfo: {},
  isAdmin: true, // 是否有登录后台权限(子管理员或系统管理员)
  isOnlyAppAdmin: true, // 是否只是子管理员，不是系统管理员
  menuShowStatus: false, // 系统设置的显示状态
  isJustAdmin: false,
  isRoleManage: false, // 是否可以管理角色
};

const mutations = {
  setLoginedUserInfo(state: any, data: any) {
    if (!data) {
      return;
    }
    state.loginedUserInfo = data;
  },
  setOnlyAppAdmin(state: any, val: boolean) {
    state.isOnlyAppAdmin = val;
  },
  setIsAdmin(state: any, val: boolean) {
    state.isAdmin = val;
  },
  setIsJustAdmin(state: any, val: boolean) {
    state.isJustAdmin = val;
  },
  // 改变状态
  setMenuStatus(state: any, payload: boolean) {
    state.menuShowStatus = payload;
  },
  setIsRoleManage(state: any, payload: boolean) {
    state.isRoleManage = payload;
  },
};

const actions = {
  // 获取当前用户信息
  async getUserInfo({ commit }: any) {
    const res = await OrgApi.getUserInfoLogin();
    if (res.errcode === 0) {
      commit('setLoginedUserInfo', res.data);
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

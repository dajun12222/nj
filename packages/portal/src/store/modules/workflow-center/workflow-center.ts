/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams,
  workflowApi,
  listApi as Application,
} from 'cloudpivot/api';

import { utils } from 'cloudpivot/common';

const state: any = {
  favoriteList: [], // 常用流程列表数据
  itemList: [], // 发起流程列表数据
  searchList: [], // 发起流程根据流程名称搜索数据
  searchTotal: 0, // 发起流程搜索总条数
  wd: '', // 发起流程搜索关键字
  asideTitleI18n: {}, // 侧边栏的国际化
  asideTitle: '', // 侧边栏的title, 只有当前应用中心的路由下才会去设置

  applicationPageTitle: '', // 应用中心页面title
  applicationPageTitleI18n: {}, // 应用中心页面title国际化
  isShowSearchNoData: false, // 暂无搜索结果（发起流程）

  isShowSearchResult: false, // 是否展示搜索结果（发起流程）
  unFinishedListCount: 0, // 待办数据条数
  unReadListCount: 0, // 待阅数据条数
  userId: '', // 用来获取当前用户的id
  userData: {}, // 当前登录用户信息
  dataItemList: [], // 数据项列表
  code: '',
  isAppList: location.href.includes('/application'), //是否为应用列表
  appNameList: [], //应用名称路径组
  appName: '', //当前应用名称
  importIcon: false, //设置导出icon
  appCode: '',
  appChange: false, //app应用初始化开关
  appPath: '', //当前页面url带参
  hideMenu: false, //是否隐藏左侧导航
  modalCode: '',
};

const mutations = {
  setCode(state: any, data: any) {
    state.code = data;
  },
  // 设置常用流程列表
  setFavoriteList(state: any, data: any) {
    state.favoriteList = data;
  },
  // 设置发起流程列表
  setItemList(state: any, data: any) {
    state.itemList = data;
    state.isShowSearchResult = false;
    if (state.itemList && state.itemList.length) {
      state.isShowSearchNoData = false;
    } else {
      state.isShowSearchNoData = true;
    }
  },
  // 设置发起流程根据流程名称搜索的流程列表
  setSearchList(state: any, data: any) {
    state.searchList = data.appList;
    state.searchTotal = data.size ? data.size : 0;
    state.isShowSearchResult = true;
    if (state.searchList && state.searchList.length) {
      state.searchList.forEach((item: any) => {
        item.appName = utils.searchHighLight(state.wd, item.appName);
        if (item.dataList && item.dataList.length) {
          item.dataList.forEach((list: any) => {
            list.name = utils.searchHighLight(state.wd, list.name);
          });
        }
      });
    }
    if (state.searchList && state.searchList.length) {
      state.isShowSearchNoData = false;
    } else {
      state.isShowSearchNoData = true;
    }
  },

  // 设置侧边栏title
  setAsideTitle(state: any, app: any) {
    if (!app || !app.name) {
      return;
    }
    console.log('titile', app);
    state.asideTitle = app.name;
    state.asideTitleI18n = app.name_i18n;
  },

  // 设置应用中心页面title
  setApplicationPageTitle(state: any, app: any) {
    if (!app) {
      return;
    }
    state.applicationPageTitle = app.name;
    state.applicationPageTitleI18n = app.name_i18n;
  },

  // 设置待办待阅消息条数
  setListCoutnt(state: any, counts: any) {
    if (!counts) {
      return;
    }
    state.unFinishedListCount = counts.workItemCount;
    state.unReadListCount = counts.circulateItemCount;
  },

  // 设置用户id & 信息
  setUserId(state: any, data: any) {
    if (data.id) {
      state.userId = data.id;
      state.userData = data;
    }
  },

  //设置portal是否为应用列表
  setIsAppList(state: any, flag: boolean) {
    state.isAppList = flag;
  },

  //设置portal应用列表的路径名称组
  setAppNameList(state: any, data: any) {
    state.appNameList = data;
  },

  //设置应用名称
  setAppName(state: any, data: any) {
    state.appName = data;
  },

  //设置应用code
  setAppCode(state: any, data: any) {
    state.appCode = data;
  },

  setModalCode(state: any, data: any) {
    state.modalCode = data;
  },

  //设置切换开关
  setAppChange(state: any, data: any) {
    state.appChange = data;
  },

  //设置当前url
  setAppPath(state: any, data: any) {
    state.appPath = data;
  },

  // 设置数据项列表
  setDataItemList(state: any, data: any) {
    if (data) {
      state.dataItemList = data.filter((d: any) => d.published);
    }
  },

  //是否展示导出icon
  setImportIcon(state: any, data: any) {
    state.importIcon = data;
  },

  //是否隐藏左侧导航
  setHideMenu(state: any, data: any) {
    state.hideMenu = data;
  },
};

const actions = {
  // 请求常用流程列表数据
  async getFavoriteWorkflowList({ commit, state }: any) {
    const res = await workflowCenterApi.getFavoriteWorkflowList();
    if (!res.errcode) {
      commit('setFavoriteList', res.data);
    }
  },
  // 请求发起流程列表数据
  async getWorkflowList({ commit, state }: any) {
    const res = await workflowCenterApi.getMyWorkflowList(false);
    if (!res.errcode) {
      commit('setItemList', res.data);
    }
    return res;
  },
  // 根据流程名称查询可发起的流程
  async searchMyWorkflowList(
    { commit, state }: any,
    params: workflowCenterParams.SearchWorkflowParams,
  ) {
    state.wd = params.workflowName;
    const res = await workflowCenterApi.searchMyWorkflowList(params);
    if (!res.errcode) {
      commit('setSearchList', res.data);
    }
  },

  // 获取待办待阅列表条数
  async getWorkCount({ commit }: any) {
    // console.log('get count now', Date.now());
    const res = await workflowCenterApi.getWorkCount();
    if (res.errcode === 0) {
      commit('setListCoutnt', res.data);
    }
  },

  // 获取数据项列表
  async getDataItemList({ commit }: any, params: any) {
    const res = await Application.getDataItemList(params);
    if (res.errcode === 0) {
      commit('setDataItemList', res.data);
    }
  },

  // 删除常用意见请求
  // async deleteComment({ commit }:any, params:workflowCenterParams.CommentParams) {
  //   const res = await workflowCenterApi.deleteComment(params);
  //   return res;
  // }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

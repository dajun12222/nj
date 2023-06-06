import Axios from './axios';

import Mappings from './api.mappings';

import { HttpResponse } from './response';

import * as WorkflowCenter from './workflow-center-params';

export class WorkbenchApi {
  /* *
   * 待办列表
   */
  searchWorkitems(
    params: WorkflowCenter.SearchParams,
  ): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.workflow.searchWorkitems, { params });
  }

  /**
   * 获取待办，待阅数量
   */
  getWorkCount(appCode: string = ''): Promise<HttpResponse<any>> {
    const params = {
      appCode,
    };
    return Axios.get('/api/runtime/workflow/get_work_count', { params });
  }

  /**
   * 获取流程统计
   */
  getWorkflowStatistics(unitType: number = 1): Promise<HttpResponse<any>> {
    const params = { unitType };
    return Axios.get('/api/runtime/workflow/get_workflow_statistics', {
      params,
    });
  }

  /**
   * 查询我的最近使用
   */
  getListFavoritesShortcut(): Promise<HttpResponse<any>> {
    const params = { isMobile: false };
    return Axios.get('/api/runtime/favorites/list_favorites_shortcut', {
      params,
    });
  }

  /**
   * 查询我的草稿
   */
  getUserdraftList(params: any): Promise<HttpResponse<any>> {
    return Axios.get('/api/runtime/userdraft/list', { params });
  }

  /**
   * 删除我的草稿
   */
  delUserdraft(params: any): Promise<HttpResponse<any>> {
    return Axios.post('/api/runtime/userdraft/delete', params);
  }

  /**
   * 获取应用门户数据列表
   */
  queryAppList(params: any): Promise<HttpResponse<any>> {
    return Axios.post('/api/runtime/query/list', params);
  }

  // 获取跳转链接
  getContainerUrl(params: any): Promise<HttpResponse<any>> {
    return Axios.get('/api/workflow/center/getContainerUrl', {
      params,
    });
  }

  // 搜索
  paltformSearch(params: any): Promise<HttpResponse<any>> {
    return Axios.post('/api/paltform/search', params);
  }

  // 修改站内信息已读状态
  updateReadState(params: any): Promise<HttpResponse<any>> {
    return Axios.post('/api/paltform/station_message/updateReadState', params);
  }

  // 修改站内信息已读状态
  updateReadStateAll(params: any): Promise<HttpResponse<any>> {
    return Axios.post(
      '/api/paltform/station_message/updateReadStateAll',
      params,
    );
  }
}

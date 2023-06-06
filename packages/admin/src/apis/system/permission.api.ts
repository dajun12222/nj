/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import axios from 'axios';
import { updateSortkey } from '../list';
import env from '../../env';

const path = '/api/system/permission';

export default {
  /**
   * 创建权限组
   * @param params
   */
  createGroup(
    params: BPM.System.PermissionGroupModel,
  ): Promise<Common.Res<void>> {
    return axios.post(`${path}/create_group`, params);
  },

  /**
   * 删除权限组
   * @param id
   */
  deleteGroup(id: string): Promise<Common.Res<void>> {
    return axios.delete(`${path}/delete_group`, {
      params: {
        id,
      },
    });
  },

  /**
   * 获取权限组
   * @param id
   */
  getGroup(
    id: string,
    appCode: string,
  ): Promise<Common.Res<BPM.System.PermissionGroupModel>> {
    return axios.get(`${path}/get_group`, {
      params: {
        id,
        appCode,
      },
    });
  },

  /**
   * 查询权限过滤条件
   * @param schemaCode
   */
  listCondition(
    schemaCode: string,
    functionId: string,
  ): Promise<Common.Res<BPM.System.AppFunctionPermissionConditionModel[]>> {
    return axios.get(`${path}/list_condition`, {
      params: {
        schemaCode,
        functionId,
      },
    });
  },

  /**
   * 修改应用权限
   */
  updateAppPackage(
    params: BPM.System.UpdateAppPackageParams,
  ): Promise<Common.Res<void>> {
    return axios.put(`${path}/update_apppackage`, params);
  },

  /**
   * 修改权限组
   */
  updateGroup(
    params: BPM.System.PermissionGroupModel,
  ): Promise<Common.Res<void>> {
    return axios.put(`${path}/update_group`, params);
  },

  /**
   * 通过应用编码查询应用权限
   * @param appCode
   */
  getAppPackage(
    appCode: string,
  ): Promise<Common.Res<BPM.System.AppPackagePermissionModel>> {
    return axios.get(`${path}/get_apppackage`, {
      params: {
        appCode,
      },
    });
  },

  /**
   * 更新权限组顺序
   */
  updateSort(params: any): Promise<Common.Res<void>> {
    return axios.put(`${env.apiHost}/app/permission/updateSort`, params);
  },
	/**
     * 批量设置权限
     * **/
    getUserRoleFunctionList(id: string,appCode:string)  {
        return axios.get(`/api/public/ceec/role/getUserRoleFunctionList`, {
            params: {
                id,
                appCode
            }
        });
    },
    /**
     * 批量保存
     * **/
     saveRoleFunctionList(groupId: string,saveFunctionBizs:any)  {
        return axios.post(`/api/public/ceec/role/saveRoleFunctionList`, {
            groupId,
            saveFunctionBizs
        });
    }
};

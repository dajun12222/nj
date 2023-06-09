import Axios from '../axios';

import Mappings from '../api.mappings';

import { HttpResponse } from '../response';

export class OrganizationApi {
  // 错误处理
  errorHandle(res: any) {
    if (res.hasOwnProperty('errcode') && res.errcode !== 0) {
      return Promise.reject(res);
    }
    return res;
  }

  // 下一级-组织树
  getOrgTree(
    deptIds: any,
    filterType?: string,
    sourceType?: string,
    corpId?: string,
    excludeCorpId?: string,
    selectUserIds?: string,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string,
    queryType?: string,
    identificationID?: string,
    queryCode?: string,
    hasAccount?: boolean,
    defineTypeFlow?: string,
    flowAccount?: string,
    roleCode?: string,
    hasLeaf?: boolean,
    schemaCode?: string,
  ): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.organization.departmentTree, {
      params: {
        deptIds,
        filterType,
        sourceType,
        corpId,
        excludeCorpId,
        selectUserIds,
        workflowInstanceId,
        activityCode,
        formRootDeptIds,
        queryType,
        identificationID,
        queryCode,
        hasAccount,
        schemaCode,
        from: defineTypeFlow,
        flowAccount,
        roleCode,
        hasLeaf,
      },
    }).then(this.errorHandle);
  }

  // 下一级-用户
  getUsersTree(
    deptId: string,
    roleId?: string,
    filterType?: string,
    sourceType?: string,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string,
    queryType?: string,
    adminUser?: string,
  ): Promise<HttpResponse<any>> {
    return Axios.get(Mappings.organization.departmentListUser, {
      params: {
        deptId,
        roleId,
        filterType,
        sourceType,
        workflowInstanceId,
        activityCode,
        formRootDeptIds,
        queryType,
        fromSource: adminUser,
      },
    }).then(this.errorHandle);
  }

  /**
   * 选人控件根据名称搜索人或部门
   * @param name
   * @param deptIds 部门编码 “,”分割
   * @param roleIds 角色编码 “,”分割
   */
  search(
    name: string,
    queryType: string,
    deptIds?: string,
    roleIds?: string,
    filterType?: string,
    sourceType?: string,
    corpId?: string,
    excludeCorpId?: string,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string,
    identificationID?: string,
    queryCode?: string,
  ) {
    return Axios.get(Mappings.organization.userTreeSearch, {
      params: {
        name,
        deptIds,
        roleIds,
        filterType,
        sourceType,
        corpId,
        excludeCorpId,
        workflowInstanceId,
        activityCode,
        formRootDeptIds,
        queryType,
        identificationID,
        queryCode,
      },
    }).then(this.errorHandle);
  }

  getRoleGroupList(expandAll?: boolean) {
    return Axios.get(Mappings.organization.roleTree, {
      params: {
        expandAll: !!expandAll,
      },
    });
  }

  getRoleGroupList2(params?: any) {
    params = params || {};
    return Axios.get(Mappings.organization.roleTree, {
      params,
    });
  }

  getRolesByGroupid(groupId: string) {
    return Axios.get(Mappings.organization.roleUsersByGroupid, {
      params: {
        groupId,
      },
    });
  }

  searchRolesByName(params: any) {
    return Axios.get(Mappings.organization.searchRoleByName, {
      params,
    });
  }

  getRoleGroupByCode(roleCode: string) {
    return Axios.get(Mappings.organization.roleGroupByCode, {
      params: {
        roleCode,
      },
    });
  }

  getRoleGroupById(roleId: string) {
    return Axios.get(Mappings.organization.roleGroupById, {
      params: {
        roleId,
      },
    });
  }

  getRolesByGroupParams(params: any) {
    return Axios.get(Mappings.organization.getRolesByGroupParams, {
      params,
    });
  }

  getRoleLeveOneInfoNew(
    expandAll?: boolean,
    reqSource?: boolean,
    appCode?: string,
  ) {
    // 组织角色
    return Axios.get('/api/organization/role/listNesting', {
      params: {
        expandAll: !!expandAll,
        reqSource: reqSource ? 'modify_user_role' : undefined,
        filterEmptyRelatedSetting: true,
        filterDefaultRoleGroup: true, // 20200324 14:30 1已和二组产品沟通，不展示默认分组数据
        appCode,
      },
    });
  }

  searchRoleListNew(searchKey: string, reqSource?: boolean) {
    // 模糊搜索角色列表
    return Axios.get('/api/organization/role/searchNesting', {
      params: {
        name: searchKey,
        reqSource: reqSource ? 'modify_user_role' : undefined,
        filterDefaultRoleGroup: true,
      },
    });
  }

  getChildrenRoleNew(params: any) {
    return Axios.get('/api/organization/role/childsNesting', { params }); // 获取子组织角色
  }

  getUserAccount(params: any) {
    return Axios.get('/api/public/ceec/role/getUserAccount', { params });
  }

  //获取用户组
  getUserGroups(params?: any) {
    // /api/ceec/group/getUserGroups
    return Axios.get('/api/ceec/group/getUserGroups', { params });
  }

  //新增组
  addNewGroup(params?: any) {
    // /api/ceec/group/getUserGroups
    return Axios.post('/api/ceec/group/addNewGroup?' + params);
  }

  //编辑组
  updateGroup(params?: any) {
    // /api/ceec/group/getUserGroups
    return Axios.post('/api/ceec/group/updateGroup?' + params);
  }

  //删除组
  deleteGroup(params?: any) {
    // /api/ceec/group/getUserGroups
    return Axios.get('/api/ceec/group/deleteGroup', { params });
  }

  //获取组用户
  getGroupUsers(params?: any) {
    ///api/ceec/group/getGroupUsers
    return Axios.get('/api/ceec/group/getGroupUsers', { params });
  }

  //更新组用户
  addGroupUser(params?: any) {
    return Axios.post('/api/ceec/group/addGroupUser', params);
  }
}

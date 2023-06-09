/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
declare namespace Organization {
  enum UnitType {
    Deaprtment = 1,
    Role = 2,
    User = 3,
  }
  // 组织树
  interface OrgNode {
    id: string;
    code: string;
    name: string;
    leaf: boolean;
    unitType: UnitType;
    parentId: string;
    sortKey: number;
    childrenUsers: number;
    managerId: string;
    employees: number;
    groupId?: string;
    roleType?: string;
    children: Array<OrgNode>;
    group: boolean;
    corpId: string;
    corpName: string;
    remarks?: string;
    createdBy?: string;
    isEditFlow?: boolean;
  }
  // 公司组织机构树
  interface OrgTree {
    rootNode: OrgNode;
  }
  // 展开组织机构树
  export interface SelectTreeNode {
    eventKey?: string;
    dataRef: any;
  }
  // 表格的头
  export interface TableHead {
    title?: string;
    dataIndex: string;
    scopedSlots?: Action;
    filteredValue?: string;
    key?: string;
    onFilter?: any;
    slots?: object;
    align?: string;
    width?: any;
    customCell?: any;
  }
  // 表格头部的插槽名称
  export interface TableTitleSlots {}
  // 表格操作
  export interface Action {
    customRender: string;
    filterDropdown?: string;
    filterIcon?: string;
    scopedSlots?: any;
  }
  namespace Users {
    export interface RequestParams {
      // 定义请求参数结构
      id: string;
      // 定义获取子管理员管理的应用模型过滤参数
      filterType?: string;
    }
    export interface ExportDeptParams {
      // 定义组织机构导出部门参数
      departmentModels: Array<ExpdeptId>;
    }
    export interface UserNumParams {
      // 定义组织树用户数量参数
      corpId: string;
      filterType: string;
    }
    export interface ExpdeptId {
      id: string;
    }

    export interface ExportUserParams {
      // 定义组织机构导出人员参数
      deptId: string;
      userIds: Array<ExpUserId>;
    }
    export interface OrgSyncParams {
      // 定义组织机构组织同步参数
      relatedId: string;
    }
    export interface OrgSyncStatusParams {
      // 定义组织机构组织同步参数
      taskId: string;
    }
    export interface DeptInfoParams {
      // 定义组织机构每个节点和部门信息参数
      deptId: string;
    }

    export interface ExpUserId {
      id: string;
    }

    export interface EduRequestParams {
      userId: string;
      deptId?: string;
    }

    export interface CropNameRequestParams {
      name: string;
    }

    export interface DeptRequestParams {
      parentId: string;
      name: string;
      managerId?: string;
      id?: string;
      hasAccount?: boolean
    }

    export interface AddUserRequestParams {
      departmentId: string;
      deptIds: Array<string>;
      roleIds: Array<string>;
      username: string;
      name: string;
      mobile: string;
      officePhone: string;
      email: string;
      employeeNo: string;
      entryDate: string;
      entryTime?: string;
      imgUrl: string;
      imgUrlId: string;
      id?: string;
    }

    export interface PasswordParams {
      username: string;
      oldPassword: string;
      newPassword: string;
    }

    export interface UpdateMainParams {
      // 更改主部门参数
      deptId: string;
      main: boolean;
      userId: string;
    }
    export interface OrgTreeParams {
      // 定义组织机构树请求参数结构
      deptId: string;
      filterType?: string;
      type?: string; // 是否模拟点击
    }

    export interface OrgTreeParamss {
      // 定义组织机构树请求参数结构
      deptIds: string;
      filterType?: string;
      type?: string; // 是否模拟点击
    }

    export interface OrgUserNumParams {
      // 定义用户数量请求参数结构
      corpId: string;
    }
    export interface OrgUserListParams {
      // 定义组织机构的用户列表请求参数
      deptId: string;
      page: number;
      size: number;
      filterType?: string;
    }
    export interface SearchUserListParams {
      // 定义根据用户名搜索组织机构的用户请求参数
      wd: string;
      page: number;
      size: number;
      filterType?: string;
    }
    // 用户信息
    interface OrgUserNode {
      id: string;
      name: string;
      status: string;
      managerId: string;
      mobile: string;
      email: string;
      password: string;
      gender: string;
      dingtalkId: string;
      imgUrl: string;
      isRemoved: string;
      privacyLevel: string;
      appellation: string;
      officePhone: string;
      employeeNo: string;
      employeeRank: string;
      secretaryId: string;
      identityNo: string;
      sourceId: string;
      sourceParentId: string;
      birthday: string;
      entryDate: string;
      departureDate: string;
      departmentId: string;
      accountId?: string;
      isAdmin: string;
      rowNum?: number;
      /* 用户信息字段 */
      accountUsername?: string;
      departmentName?: string;
      otherDepartments?: Array<string>; // 前端自定义的兼职部门字段，截取于departmentName的第二个部门及之后
      roleName?: string;
      secretaryName?: string;
      managerName?: string;
      [rest: string]: any;
    }
    // 工作交接
    export interface TaskTransfer {
      myTask: Array<TodoTask>;
      selectedRowKeys: Array<number>;
    }
    // 待办任务
    export interface TodoTask {
      id: string;
      task: string;
      workflowName: string;
      organizer: string;
      organizerUnit: string;
      receiveTime: string;
    }

    interface OrgUserListPayload {
      data: OrgUserList;
      isSearch: boolean;
      params: any;
    }

    export interface UnitTitleObj {
      name: string;
      id: string;
      corpId: any;
      relatedOrgType: string;
      relatedSyncType: string;
      deptType: number; // 1:系统部门  2:家校部门
    }

    // 公司组织机构用户列表
    interface OrgUserList {
      total: number;
      content: Array<OrgUserNode>;
      last: boolean;
      first: boolean;
      totalElements: number;
    }
    interface OrgUserExt {
      orgList: any[];
      groupList: any[];
      title: string;
    }
    // 定义vuex state 结构
    export interface State {
      orgUserList: Array<OrgUserNode> | null;
      loading: boolean;
      noUser: boolean;
      loadCompleted: boolean;
      hasCloudPivotPerm: boolean;
      searchTitle: string;
      userInfoParams: Users.RequestParams;
      eduUserInfoParams: Users.EduRequestParams;
      orgUserInfo: OrgUserNode | null;
      showIEBtn: Boolean;
      firstLoad: Boolean;
      paramsOpts: any;
      userExt: Users.OrgUserExt;
      userExtension: any[];
    }
  }
  namespace Roles {
    export interface RequestListParams {
      roleId: string;
      page: number;
      size: number;
      name?: string;
      filterType?: string;
      deptId?: string;
    }
    export interface RequestChildrenTreeParams {
      groupId: string;
    }
    interface RoleNode {
      id: string;
      name: string;
      code: string;
      sortKey: number;
    }
    // 组织角色
    export interface RoleState {
      orgTree: OrgTree | null;
      roleGroupList: OrgTree | [];
      orgTreeBySearch: OrgTree | null;
      isRoleSearchResult: boolean;
      roleList: Array<RoleInfo>;
      dataRef: any;
      loading: boolean;
      isLoadMore: boolean;
      treeParams: Roles.RequestChildrenTreeParams;
      roleTitle: RoleTitle;
      searchTips: boolean;
    }
    export interface RoleTitle {
      code: string;
      name: string;
      groupName: string;
      id?: string;
    }
    export interface RoleInfo {
      id: string;
      name: string;
      index: number;
      roleName: string;
    }
    export interface RoleListMutation {
      content: Array<RoleInfo>;
      first: boolean;
      last: boolean;
      total: number;
      page: number;
    }
    export interface RoleGroupParams {
      roleId: string;
    }
    export interface RoleGroupByCodeParams {
      roleCode: string;
    }

    export interface LiseTaskByUserParams {
      userId: string;
      workflowCode: string;
      originator: string;
      page: number;
      size: number;
    }

    export interface BusinessTaskByUserParams {
      userId: string;
      schemaCode: string;
      sequenceStatus: string;
      page: number;
      size: number;
    }

    export interface TransferParams {
      transferAll: boolean; // 是否交接全部
      transferUserId: string; //交接人id
      userId: string; // 用户id
      workItemIds: Array<string>; // 代办 id
      transferDeptId?: string; // 任务交接人部门id
      isBusiness?: boolean; // 是否是业务数据交接
      isSyncInstance?: boolean; // 是否同步更新流程实例
      originator?: string; // 发起人id
      workflowCode?: string; // 流程编码
      schemaCode?: string; // 业务模型编码
      sequenceStatus?: string; // 单据状态-可多选
    }

    export interface UpdateUserOuscope {
      ouScopeList: Array<string>;
      roleId: string;
      userId?: string;
      deptId?: string;
      unitType: number;
    }

    export interface GetUserOuscope {
      roleId: string;
      userId: string;
    }
  }

  export interface roleGroupParams {
    roleGroupName: string;
    roleGroupId?: string;
  }

  export interface roleParams {
    roleName: string;
    roleGroupId: string;
    roleId?: string;
    hasAccount?: boolean
  }

  export interface roleDeleteParams {
    ids: string;
  }

  export interface roleUserDeleteParams {
    userIds: any;
    deptIds: any;
    roleId: string;
  }

  export interface roleUserParams {
    roleId: string;
    userIds: Array<string>;
  }

  export interface roleUserParams {
    roleId: string;
    userIds: Array<string>;
  }

  export interface searchDemissionUserParams {
    page: number;
    size: number;
  }

  export interface searchResignUserParams {
    page: number;
    size: number;
    wd: string;
  }

  export interface userExtendAttrParams {
    belong?: string;
    code?: string;
    corpId?: string;
    enable?: number;
    id?: string;
    mapKey?: string;
    name?: string;
  }

  interface treeData {
    title: string;
    key: string;
    value: string;
  }
  interface dingdingDepartmentParams {
    corpId: string;
  }

  interface partSyncParams {
    corpId?: string;
    parentId: number | null;
    id: number;
  }
  interface logListParams {
    page: number;
    size: number;
    name: string;
    executeStatus: string | number | boolean;
    startTime: string;
    endTime: string;
  }
  interface logDetailParams {
    id: string;
  }

  interface repairLogParams {
    id: string;
  }
}

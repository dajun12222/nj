/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export enum typeF {
  FindDepHeadByField = 0, // 按字段查找主管
  FindDepHeadByDep = 1, // 按指定部门查找主管
  FindUserByRole = 2, // 按角色找人
  FindOrg = 3, // 按组织架构查找
  FindUsersByDirectSupervisor = 4, // 按直属主管找人
}

export enum typeFun {
  FindDepHeadByField = 'FindDepHeadByField',
  FindDepHeadByDep = 'FindDepHeadByDep',
  FindUserByRole = 'FindUserByRole',
  FindUsersByDirectSupervisor = 'FindUsersByDirectSupervisor',
}

export default [
  {
    type: typeF.FindDepHeadByField,
    value: '',
    manager: {
      value: 0,
      selectValue: '',
    },
    department: {
      value: 1,
      selectValue: '',
    },
    checkedList: [],
  },
  {
    type: typeF.FindDepHeadByDep,
    manager: '',
    checkedList: [],
  },
  {
    type: typeF.FindUserByRole,
    manage: '',
    role: '',
  },
  {
    type: typeF.FindOrg,
    org: '',
  },
  {
    type: typeF.FindUsersByDirectSupervisor,
    initiator: '',
    level: '',
    checkedList: [],
  },
];

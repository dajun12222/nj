/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import User from './user';
import Role from './role';
import taskTransfer from './taskTransfer';

export default {
  namespaced: true,
  modules: {
    User,
    Role,
    taskTransfer,
  },
};

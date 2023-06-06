/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import Axios from 'axios';

const permisson = '/api/report/permission';

export default {
  // 查询数据流节点操作权限
  queryOperatePermission(params: any) {
    return Axios.post(
      `${permisson}/queryOperatePermission?objectIdList=${params.objectIdList}`,
      { params },
    );
  },
  // 修改数据流权限
  updatePermiss(params: any) {
    return Axios.post(`${permisson}/update`, params);
  },
  // 查询数据流节点权限详情
  getPermission(params: any) {
    return Axios.post(
      `${permisson}/getPermission?objectId=${params.objectId}`,
      params,
    );
  },
};

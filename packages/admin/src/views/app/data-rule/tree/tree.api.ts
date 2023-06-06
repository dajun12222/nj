/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import Axios from 'axios';

import * as Tree from './tree.typings';

const path = '/api/runtime/app';

export const list = (params: Tree.IsMobileSchema): Promise<Common.Data> => {
  return Axios.get(`${path}/list_apps`, { params });
};

/* 获取应用目录、模型 */
export const getAppItem = (params: Tree.AppCode): Promise<Common.Data> => {
  return Axios.get('/api/app/apppackage/trees', {
    params,
  });
};

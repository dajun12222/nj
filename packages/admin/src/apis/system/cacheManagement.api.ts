/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import axios from 'axios';

export default {
  //获取所有的CacheKeys
  getAllCacheKeys(params: any): Promise<Common.Res<void>> {
    return axios.get('/api/system/cache/list', params);
  },

  deleteCacheKeys(params: any): Promise<Common.Res<void>> {
    return axios.delete('/api/system/cache/delete', { data: params });
  },
};

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import axios from 'axios';

export default {
  /**
   * 列出目录
   */
  listCategory(): Promise<Common.Res<BizService.Category.Item[]>> {
    return axios.get('/api/bizservice/category/list');
  },
  /**
   * 添加目录
   * @param params
   */
  createCategory(
    params: BizService.Category.CreateParams,
  ): Promise<Common.Response> {
    return axios.post('/api/bizservice/category/create', params);
  },
  /**
   * 更新目录
   * @param params
   */
  updateCategory(
    params: BizService.Category.UpdateParams,
  ): Promise<Common.Response> {
    return axios.put('/api/bizservice/category/update', params);
  },
  /**
   * 删除目录
   * @param params
   */
  deleteCategory(
    params: BizService.Category.DeleteParams,
  ): Promise<Common.Response> {
    return axios.delete('/api/bizservice/category/delete', {
      params,
    });
  },
};

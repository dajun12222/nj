/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/**
 * 缓存数据
 */
class DataCache {
  // 缓存
  cacheList: any = {};

  /**
   * 设置缓存数据
   * @params key: 键值  data: 缓存数据
   */
  setCacheData(key: string | number, data: any) {
    if (!key || !data) {
      return;
    }
    this.cacheList[key] = data || null;
  }

  /**
   * 获取缓存数据
   * @params key: 键值
   */
  getCacheData(key: string | number) {
    if (!key) {
      return;
    }
    return this.cacheList[key];
  }

  /**
   *  判断是否存在
   * @params key: 键值
   */
  cacheExist(key: string | number) {
    if (!key) {
      return false;
    }
    return this.cacheList[key] ? true : false;
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.cacheList = {};
  }
}

export default new DataCache();

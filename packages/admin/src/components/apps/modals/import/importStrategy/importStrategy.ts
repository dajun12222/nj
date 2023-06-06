/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export default interface Importer {
  /**
   * 编码不重复文本
   */
  noRepeatMsg: string;

  /**
   * 生成导入接口的参数信息
   */
  generateImportParam: Function;

  /**
   * 调取接口校验xml文件正确性，有效性
   */
  checkPackage: Function;

  /**
   * 校验接口
   */
  checkApi: Function;

  /**
   * 直接导入
   */
  checkAndImport: Function;

  /**
   * 修改编码后导入
   */
  modifySchemaCodesImport: Function;

  /**
   * 修改编码
   */
  resSetNewCode: Function;

  /**
   * 修改编码界面加载后调用方法
   * 初始化选中tab页以及其他一些初始化操作
   */
  afterUpdateMounted: Function;

  /**
   * 修改编码界面获取最终结果
   */
  updateCodeSubmit: Function;

  /**
   * 获取模型编码 || 报表编码
   */
  getNewCode: Function;
}

/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/

export interface SiderOptions {
  /**
   * 初始宽度
   */
  width: number;

  /**
   * 最小宽度
   */
  minWidth: number;

  /**
   * 最大宽度
   */
  maxWidth: number;

  /**
   * 可收缩的
   */
  collapsible: boolean;

  /**
   * 是否收起
   */
  collapsed: boolean;

  /**
   * 不可调整大小
   */
  slider: boolean;

  direction: 'left' | 'right';
}

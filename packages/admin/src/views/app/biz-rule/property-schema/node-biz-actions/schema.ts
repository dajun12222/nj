/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/**
 * 组件的纲要信息
 * 定义组件的属性、方法和事件
 */
export default {
  type: 'object',

  /**
   * 在属性栏是必填项
   */
  required: ['nodeCode', 'nodeName', 'methodMapping'],

  /**
   * 组件所有属性
   */
  properties: {
    nodeCode: {
      type: 'string',
      title: '节点编码',
    },
    nodeName: {
      type: 'string',
      title: '节点名称',
    },
    execCondition: {
      type: 'array',
      title: '执行条件',
    },
    methodMapping: {
      type: 'object',
      title: '绑定业务服务',
      properties: {},
    },
  },
};

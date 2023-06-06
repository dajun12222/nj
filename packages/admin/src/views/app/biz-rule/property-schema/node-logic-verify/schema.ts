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
  required: [
    'nodeCode',
    'nodeName',
    'verifySchemaCode',
    'judgeCondition',
    'verifyConditions',
    'targetSchema',
  ],

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
    verifySchemaCode: {
      type: 'string',
      title: '验证模型',
    },
    targetSchema: {
      type: 'object',
      title: '目标模型',
      properties: {},
    },
    judgeCondition: {
      type: 'object',
      title: '判断条件',
      properties: {},
    },
    verifyConditions: {
      type: 'object',
      title: '验证条件',
      properties: {},
    },
  },
};

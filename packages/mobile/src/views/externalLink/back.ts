/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/

import common from 'cloudpivot/common';

export class BackOptions {
  callback?: Function; // 回调事件
}

export let backStack: Array<BackOptions> = []; // 返回回调事件堆栈

/**
 * 返回订阅事件
 * @param options
 */
export const subscribeBack = (options: BackOptions) => {
  backStack.push(options);
};
/**
 * 返回取消订阅事件
 * @param options
 */
export const unsubscribeBack = (options: BackOptions) => {
  const tmpBackStack = new Set(backStack);
  tmpBackStack.delete(options);
  backStack = [...tmpBackStack];
};

common.directives.controlBackConfig.handler = {
  subscribe: subscribeBack,

  unsubscribe: unsubscribeBack,
};

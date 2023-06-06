import { viewRegister } from './utils/register';
/**
 * @desc 注册扩展视图类型
 * @params extendViews 扩展视图类型
 */
export default function (extendViews = {}) {
  Object.keys(extendViews).forEach((viewType) => {
    viewRegister.append(viewType, extendViews[viewType]);
  });
}

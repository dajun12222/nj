import components from './src/components'; // 云枢原生组件
import { register } from './utils/register';
/**
 * @desc 注册新组件
 * @params extendComponents 二开组件
 */
export default function (extendComponents = []) {
  // console.log(extendComponents, 'extendComponents');
  const allComponents = [...components, ...extendComponents];
  for (const cmp of allComponents) {
    register.append(cmp);
  }
}

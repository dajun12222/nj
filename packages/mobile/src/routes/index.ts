/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import defaultRoutes from './routes';
import extendRoutes from '../../extends/routes';

import { utils } from 'cloudpivot/common';

const routeMap = utils.RouteHelper.assign(defaultRoutes as any, extendRoutes);

const routes = utils.RouteHelper.toRoutes(routeMap);

// console.log(routeMap);
// console.log(routes);

export default routes;

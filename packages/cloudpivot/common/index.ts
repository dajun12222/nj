/*
 * @Author: Fu Zhuohang
 * @Date: 2022-01-04 18:06:33
 * @LastEditors: xiejunlin@authine.com xiejunlin@authine.com
 * @LastEditTime: 2022-09-28 11:52:38
 * @FilePath: \yunshu6.0\modules\cloudpivot\common\index.ts
 * @Description:
 */
/* Directives */
import resize from './src/directives/resize';
import controlBack from './src/directives/control-back';
import { config as controlBackConfig } from './src/directives/control-back';
import moveDirective from './src/directives/move-directive';
import transferDom from './src/directives/transfer-dom';

import { RouteHelper } from './src/utils/route-helper';
import Bus from './src/utils/bus';
import DateHandle from './src/utils/date';
import GetDateHandle from './src/utils/get-date';

import * as util from './src/utils/utils';

import * as pcUtil from './src/utils/pc/utils';

import { parseUrlParam, parseQuery, getUrlVar } from './src/utils/url';
import * as url from './src/utils/url';

import copyURL from './src/utils/copyURL';

import Common from './src/utils/common';

// 公共业务相关的方法
import BusinessFunctions from './src/business-functions';
import RegexpValidate from './src/utils/regexp'; //正则公式验证

import { RsaEncrypt } from './src/utils/rsa';

import hiddenStrMiddle from './src/utils/hiddenMiddleStr';

export const utils: any = {
  url,
  Bus,
  DateHandle,
  GetDateHandle,
  RegexpValidate,
  RouteHelper,
  //@ts-ignore
  parseUrlParam,
  parseQuery,
  copyURL,
  getUrlVar,
  // zeroFormat : pcUtil.zeroFormater,
  // searchHighLight : pcUtil.searchHighLight,
  // timeTranslate: util.timeTranslate,
  // compatible: pcUtil.compatible,
  ...pcUtil,
  ...util,
  Common,
  BusinessFunctions,
  RsaEncrypt,
  hiddenStrMiddle,
};

export const directives: any = {
  resize,
  controlBack,
  controlBackConfig,
  moveDirective,
  transferDom,
};

export default {
  // cssVariables,
  // components: {
  // mobile: {
  //   Checkbox: () => import('./src/components/mobile/checkbox.vue'),
  //   Empty: () => import('./src/components/mobile/empty/empty.vue'),
  //   GridList: () => import('./src/components/mobile/grid-list.vue'),
  //   LoadingFailed: () => import('./src/components/mobile/loading-failed/loading-failed.vue'),
  //   NoSearchData: () => import('./src/components/mobile/no-search-data.vue'),
  //   Searchbar: () => import('./src/components/mobile/searchbar.vue'),
  //   Sidebar: () => import('./src/components/mobile/sidebar.vue'),
  //   Tabbar: () => import('./src/components/mobile/sidebar.vue'),
  //   Toptip: () => import('./src/components/mobile/toptip.vue'),
  //   BaseItem: () => import('./src/components/mobile/base-item/base-item.vue'),
  //   BottomButton: () => import('./src/components/mobile/bottom-button.vue'),
  //   FormUnpublished: () => import('./src/components/mobile/form-unpublished/form-unpublished.vue')
  // },
  // pc: {
  //   PageLoading: () => import('./src/components/pc/page-loading/page-loading.vue'),
  //   PageNoData: () => import('./src/components/pc/page-no-data/page-no-data.vue'),
  //   LoadFail: () => import('./src/components/pc/load-fail/load-fail.vue'),
  //   UserPopover: () => import('./src/components/pc/user/user-popover.vue'),
  //   H3SizeSlider: () => import('./src/components/pc/size-slider.vue'),
  //   H3SizeRectangle: () => import('./src/components/pc/size-rectangle.vue'),
  //   EmptyHeader: () => import('./src/components/pc/empty-header/empty-header.vue'),
  //   FormUnpublished: () => import('./src/components/pc/form-unpublished/form-unpublished.vue'),
  //   Panel: () => import('./src/components/pc/panel.vue'),
  //   RoleSelect: () => import('./src/components/pc/role-selector/index.vue'),
  // }
  // },
  directives,
  utils,
};

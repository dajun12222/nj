/*
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-17 17:24:01
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-25 18:15:48
 */

import PageNoData from './page-no-data/page-no-data-new.vue';
import PageLoading from './page-loading/page-loading.vue';
import PageLoadingNew from './page-loading/page-loading-new.vue';
import PageSelectMotail from './page-select-motail/page-select-motail.vue';
import PageHeader from './page-header/page-header.vue';

import LoadFail from './load-fail/load-fail.vue';
export default {
  PageNoData,
  PageLoading,
  PageLoadingNew,
  PageSelectMotail,
  PageHeader,
  LoadFail,
  PageData: () => import('./page-data/page-data-new.vue'),
  // PageLoading: () => import('./page-loading/page-loading.vue'),
  // PageNoData: () => import('./page-no-data/page-no-data.vue'),
  // LoadFail: () => import('./load-fail/load-fail.vue'),
  UserPopover: () => import('./user/user-popover.vue'),
  UserPopoverEllipsis: () => import('./user/user-popover-ellipsis.vue'),
  UserEllipsis: () => import('./user/user-ellipsis.vue'),
  H3SizeSlider: () => import('./size-slider.vue'),
  H3SizeRectangle: () => import('./size-rectangle.vue'),
  EmptyHeader: () => import('./empty-header/empty-header.vue'),
  FormUnpublished: () => import('./form-unpublished/form-unpublished.vue'),
  Panel: () => import('./panel.vue'),
  RoleSelect: () => import('./role-selector/index.vue'),
};

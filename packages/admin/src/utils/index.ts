/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/

import StringHandle from './stringHandle'; //字符串处理
import Download from './data-download'; // 下载相关

import LanguageTransform from './language-transform'; // 语言转换

import { utils } from 'cloudpivot/common';

const URLHandle = utils.url;

export {
  URLHandle,
  // RegexpValidate,
  StringHandle,
  // DateHandle,
  Download,
  LanguageTransform,
};

export default {
  URLHandle,
  // RegexpValidate,
  StringHandle,
  // DateHandle
};

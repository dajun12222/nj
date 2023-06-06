/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import Vue from 'vue';

// Vue.use(Antd);

import { message, Modal } from '@h3/antd-vue';

Vue.prototype.$message = message;
Vue.prototype.$confirm = Modal.confirm;

/**
 * 是否是钉钉
 */
Vue.prototype.isDingTalk = /DingTalk/.test(navigator.userAgent);

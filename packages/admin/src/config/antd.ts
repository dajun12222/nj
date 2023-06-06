/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import Vue from 'vue';
import { message, Modal } from '@h3/antd-vue';
// import '@h3/antd-vue/lib/style/index';
// const Antd = require('@h3/antd-vue');
Vue.prototype.$message = message;
Vue.prototype.$confirm = Modal.confirm;
Vue.prototype.$success = Modal.success;
Vue.prototype.$error = Modal.error;
Vue.prototype.$warning = Modal.warning;
Vue.prototype.$info = Modal.info;
// Vue.use(Antd);

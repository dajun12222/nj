/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import AppCenter from './appcenter';
import AppItem from './appitem';
import DataModel from './datamodel';
import Workflow from './workflow';
import Listdesign from './listdesign';
import BizRule from './bizrule';
import FormHis from './formhis';

export default {
  namespaced: true,
  modules: {
    AppCenter,
    AppItem,
    DataModel,
    Workflow,
    Listdesign,
    BizRule,
    FormHis,
  },
};

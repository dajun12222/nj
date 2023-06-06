/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
const state: Apps.FormHis.State = {
  currentVersion: '',
  currentHistoty: {
    id: '',
    remarks: '',
    createdTime: '',
    modifiedTime: '',
    deleted: false,
    createdBy: '',
    modifiedBy: '',
    name: '',
    name_i18n: '',
    code: '',
    icon: '',
    schemaCode: '',
    published: true,
    sortKey: 0,
    pcUrl: '',
    mobileUrl: '',
    publishedViewJson: '',
    draftAttributesJson: '',
    draftHtmlJson: '',
    publishedHtmlJson: '',
    draftActionsJson: '',
    publishedActionsJson: '',
    shortCode: '',
    printTemplateJson: '',
    qrCodeAble: '',
    pdfAble: '',
    tempAuthSchemaCodes: '',
    borderMode: '',
    layoutType: '',
    formComment: false,
    subTip: '',
    publishBy: '',
    version: 0,
    tempAuthSchemaCodeSet: [],
  },
  listVisible: false,
};

const mutations = {
  setCurHistory(state: any, data: Apps.FormHis.FormHisModel) {
    state.currentHistoty = data;
  },
  setCurrentVersion(state: any, data: any) {
    state.currentVersion = data;
  },
  setListVisible(state: any, data: any) {
    state.listVisible = data;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};

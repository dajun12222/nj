/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
// 初始化表单组件配置
import env from '@/config/env';
import '@/config/h3-form';
import { DefaultFileService } from '@/config/h3-form/file-service';
import site from '@/config/site';
import OAuthApi from '@/apis/oauth';
import * as Common from '@/typings/common';
import { externalLinkApi, formApi, listApi, workflowApi } from 'cloudpivot/api';
import common from 'cloudpivot/common';
import { msesToTimeStr } from 'cloudpivot/common/src/utils/date';
import { recursionSearch } from 'cloudpivot/common/src/utils/utils';
import printSharedMethods from 'cloudpivot/list/src/components/pc/scripts/printSharedMethods';
import flow from 'cloudpivot/flow/pc';
import {
  workflowActionStatus,
  workItemStatus,
} from 'cloudpivot/flow/src/typings/workflow-enum';
import { renderer, runtime, schema } from 'cloudpivot/form';
import commentComps from 'cloudpivot/form-comment';
import * as pcForm from 'cloudpivot/form/pc';
import { ControlHelper } from 'cloudpivot/form/src/common/controls/control-helper';
import {
  DateItemOperatorType,
  logicDataItemOperators,
  numberDataItemOperators,
  sequenceStatusOperators,
  staffDataItemOperators,
  textDataItemOperators,
} from 'cloudpivot/form/src/common/data-item/data-item2';
import { format } from "cloudpivot/form/utils/number-formatter";
import FormMarking from 'cloudpivot/list/src/components/pc/components/form-marking-form.vue';
import GenerateHtml from 'cloudpivot/list/src/components/pc/GenerateHtmlForm.vue';
import TempPrintHtml from 'cloudpivot/list/src/components/pc/TempPrintHTMLForm.vue';
import * as platform from 'cloudpivot/platform';
import { Alert, Button, Checkbox, Collapse, Icon, Tabs } from '@h3/antd-vue';
import H3PrintRuntime from '@h3print/runtime';
import moment from 'moment';
import { Component, Provide, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import FormDetailFooter from './form-detail-footer.vue';
import FormDetailHeaderOpenInList from './form-detail-header-open-in-list.vue';
import FormDetailHeader from './form-detail-header.vue';
import customButtonModal from 'cloudpivot/list/src/components/pc/customButtonModal.vue';
import { utils } from "cloudpivot/common";
const { TabPane } = Tabs;

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

const { replaceValueData } = common.utils.BusinessFunctions;

@Component({
  name: 'pc-form-detail',
  components: {
    AIcon: Icon,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AAlert: Alert,
    FormDetailHeader,
    FormDetailHeaderOpenInList,
    FormDetailFooter,
    WorkflowInfo: flow.components.WorkflowInfo,
    FormActionModal: pcForm.runtime.FormActionModal,
    Approval: flow.components.Approval,
    PcFormRenderer: pcForm.renderer.FormRenderer,
    FormActions: pcForm.runtime.FormActions,
    pcComment: commentComps.pcComment,
    GenerateHtml,
    TempPrintHtml,
    H3PrintRuntime,
    FormMarking,
    ACheckbox: Checkbox,
    AButton: Button,
    Tabs,
    TabPane,
    customButtonModal,
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      (vm as PcFormDetail).clean();
      (vm as PcFormDetail).beforeLoad();
    });
  },

  beforeRouteUpdate(to, from, next) {
    const vm = this as PcFormDetail;
    vm.clean();
    next();
    vm.beforeLoad();
  },
})
export default class PcFormDetail extends pcForm.runtime.FormDetail {
  @WorkflowCenterModule.Mutation('setCode') setCode: any;

  showBacktop = false;

  draftAttributesJson: any[][] = [];

  formdata: any = null;

  isShow: boolean = false; // 是否有打印模板

  pdfAble: boolean = false; // 是否开启打印模板

  showPdf: boolean = false;

  pdfUrl: string = `/pdfjs/web/viewer.html`;

  showAlertWarn = false;

  timer: any = null;

  finishTime: string = '';

  srcdoc: string = '';

  isShowComment: boolean = true; // 是否显示评论模块

  tempPrintEleArray: any[] = []; // 不确定高度 需临时打印元素集合

  tempPrintPageSettings: any = '';

  isPrintGenerateHtml = false;

  isSaveAndCreate: boolean = false; // 是否开启提交并新建

  isSubmitAndCreate: boolean = false; // 点击的是提交并新建

  listDatemItem: any[] = [];

  queryId: any = '';

  pageSettings: any = {
    eleType: 'pageSettings',
    direction: 1,
    _papersize: {
      id: 1,
      scale: 'A4',
      widthTomm: 210,
      heightTomm: 297,
      widthTopx: '595',
      heightTopx: '842',
    },
    _pagemargin: {
      UpTomm: 20,
      DownTomm: 20,
      LeftTomm: 17,
      RightTomm: 17,
      UpTopx: 57,
      DownTopx: 57,
      LeftTopx: 48,
      RightTopx: 48,
    },
    _headerfooter: {
      header: {
        marginTopTomm: 10,
        marginTopTopx: 28,
        align: '',
        items: { key: [], value: [] },
      },
      footer: {
        marginTopTomm: 10,
        marginTopTopx: 28,
        align: '',
        items: { key: [], value: [] },
      },
    },
    bgImg: {
      uid: '',
      name: '',
      status: '',
      url: '',
    },
    isPrintBgImg: false,
  };

  activeKey: string = '1';

  @Provide()
  layoutTypeFn() {
    if (this.isShowComment) {
      this.isShowComment =
        this.formObj && this.formObj.bizObject
          ? (this.isSsubmited && this.isLoadComment) ||
            (this.workflowInstanceId && !this.isExternal) ||
            this.showTrack
            ? true
            : false
          : false;
    }

    this.activeKey =
      this.workflowInstanceId && !this.isExternal
        ? '1'
        : this.isSsubmited && this.isLoadComment
        ? '2'
        : this.showTrack
        ? '3'
        : '1';
    return (
      this.formObj &&
      this.formObj.bizSheet &&
      this.formObj.bizSheet.layoutType === 'vertical'
    );
  }

  @Provide()
  formObjSource() {
    return this.formObj;
  }

  get borderMode() {
    return (
      this.formObj &&
      this.formObj.bizSheet &&
      this.formObj.bizSheet.borderMode === 'open'
    );
  }

  get completed() {
    return (
      this.formObj &&
      this.formObj.bizObject &&
      this.formObj.bizObject.sequenceStatus === 'COMPLETED'
    );
  }

  get canceled() {
    return (
      this.formObj &&
      this.formObj.bizObject &&
      this.formObj.bizObject.sequenceStatus === 'CANCELED'
    );
  }

  /**
   * 评论模块需要判断当前表单是否提交过
   */
  get isSsubmited() {
    if (this.isWorkflowForm) {
      return !!this.formObj.workflowInstanceIsSubmit;
    }

    if (this.formObj.bizObject) {
      return this.formObj.bizObject.data.sequenceStatus === 'COMPLETED';
    }

    return false;
  }

  /**
   * 根据表单配置项是否加载评论模块
   */
  get isLoadComment() {
    if (this.formObj.bizSheet && !(window as any).isExternal) {
      return this.formObj.bizSheet.formComment;
    }

    return false;
  }

  get showTrack() {
    return (
      (this.formObj
        ? this.formObj.bizObject
          ? this.formObj.bizObject.loadedFromDb
          : true
        : true) &&
      (this.formObj
        ? this.formObj.formPermission
          ? this.formObj.formPermission.actionPermission
            ? this.formObj.formPermission.actionPermission.formTrack
            : false
          : false
        : false)
    );
  }

  // 是否为外部用户
  get isExternal() {
    if ((window as any).isExternal) {
      return true;
    }
    return false;
  }

  get actionsDeal() {
    if (
      this.actions.length > 1 &&
      this.actions[0].code !== runtime.FormAction.Print
    ) {
      [this.actions[0], this.actions[1]] = [this.actions[1], this.actions[0]];
    }
    return this.actions;
  }

  // mounted() {
  //     //
  //     // this.formObj
  //     const url: any = this.$route.query.return;
  //     const opener = window.opener;
  //     window.onbeforeunload = () => {
  //             opener.postMessage(url, opener.location.href);
  //     };
  // }

  async created(vm: any){
    
   

  
 
  }
 
  mounted() {
    localStorage.removeItem('isShowEmailResquest');
    this.$nextTick(() => {
      this.callPrintWithKeyboard();
    });
    this.$message.config({
      maxCount: 1,
      duration: 3,
    });
    // 来自待阅的页面需要发出重载信号
    const { workitemType } = this.$route.query;
    if (workitemType && workitemType === 'unreadWorkitem') {
      const url: any = this.$route.query.return;
      window.onbeforeunload = () => {
        opener.postMessage(url, opener.location.href);
      };
    }
  }

  @Provide()
  getImportFormValue() {
    const importFormValue = this.getFormValue(false, false);
    this.formatData(importFormValue);
    return importFormValue;
  }

  // 监听快捷建调起打印
  // mac metaKey + p 80
  // win ctrlKey + p 80
  callPrintWithKeyboard() {
    const isMac: boolean =
      (window as any).navigator.userAgent.indexOf('Mac') >= 0;
    document.addEventListener('keydown', (e: any) => {
      const keyCode: number = e.keyCode as number;
      if (isMac) {
        if (e.metaKey && keyCode === 80) {
          this.hideCommentBeforePrint();
        }
      } else {
        if (e.ctrlKey && keyCode === 80) {
          this.hideCommentBeforePrint();
        }
      }
    });
  }

  /**
   * 让收起按钮始终可见
   * */

  makeRetractShow() {
    // const formWrap: HTMLDivElement = document.querySelector(".form-wrap") as HTMLDivElement;
    // const retractDom: HTMLDivElement = document.querySelector(".retract") as HTMLDivElement;
    // if (!retractDom) return;
    // formWrap.addEventListener("scroll", (e: any) => {
    //   const st: number = formWrap.scrollTop as number;
    //   (retractDom.style as any).top = `${st + 3}px`;
    // });
  }

  // 页面销毁的时候
  destroyed() {
    clearInterval(this.timer);
  }

  onBodyScroll(evt: Event) {
    const formBody = evt.target as HTMLDivElement;
    this.showBacktop = formBody.scrollTop > 0;
  }

  @Provide()
  getScrollEl() {
    return this.$el.querySelector('.form-wrap') as HTMLDivElement;
  }

  backTop() {
    const formBody = this.getScrollEl();
    if (formBody) {
      formBody.scrollTop = 0;
    }
  }

  // 关闭自定义按钮查看列表弹框
  onCloseInfoModal() {
    this.visibleOpen = false;
  }

  showMessage() {
    const h3Messsag = this.$refs.h3Messsag as any;
    return h3Messsag.show();
  }

  get $message() {
    return Vue.prototype.$message;
  }

  get $confirm() {
    return Vue.prototype.$confirm;
  }

  get getFileUrlFn() {
    return renderer.UploadControl.service.getDownloadUrl;
  }

  clean(excludeNode?: boolean) {
    super.clean(excludeNode);
    this.showBacktop = false;
  }

  get dataItems() {
    if (this.formObj.bizSchema && this.formObj.bizSchema.properties) {
      return this.formObj.bizSchema.properties;
    }

    return [];
  }

  async beforeLoad() {
    if (this.isWorkFlowSheet) {
      this.nodes = await (this.getWorkFlowNodes() as any);
      const params: any = this.$route.query;
      const workitemId: any = params.workitemId;
      this.nodes.forEach((res, index) => {
        if (workitemId && res.id === workitemId) {
          res.selected = true;
        } else {
          res.selected = false;
        }
      });
      if (this.nodes.length > 0) {
        const nodeItem = this.nodes.find((item) => item.selected);
        if (nodeItem) {
          this.getNodesParams(nodeItem.activityCode);
        } else {
          this.getNodesParams(this.nodes[0].activityCode);
        }
      }
      this.load();
    } else {
      this.nodesParams = null;
      this.load();
    }
  }

  nodesSwitch(node: string) {
    this.getNodesParams(node);
    this.clean(true);
    this.load();
  }

  isEl(): boolean {
    return !!(window as any).externalLinkToken;
  }

  async load(edit?: boolean) {
    let closeLoading;
    if (!window.Environment.isIe) {
      closeLoading = this.$message.loading(null, 0);
    }
    try {
      const res = await super.load(edit);
      if(res && (res.errcode === 40002 || res.errcode === 601010)){
        this.goPermission();
        return
      }
      this.loadSheetColumnWidth();
      const isEl = this.isEl();
      !isEl &&
        this.setCode(
          `${this.formObj.bizSchema.code}-${this.formObj.bizSheet.code}`,
        );

      if (this.formObj) {
        let {
          creater: { name },
        } = this.formObj.bizObject;

        // 附件上传者因为当前表单操作者
        const operater = window.sessionStorage.getItem('user');
        name = operater ? JSON.parse(operater).name : name;
        window.sessionStorage.setItem('uploadName', name);
        const title = this.formObj.instanceName || this.formObj.bizSheet.name;
        document.title = `${site.title}-${title}`;
      }

      this.$nextTick(() => {
        this.makeRetractShow();
      });
    } catch (e) {
      if (e.errcode === 40002 || e.errcode === 601010) {
        // 跳转无权限提示页面
        this.goPermission();
        return;
      }
      if (
        e.errcode === 302034 ||
        (this.formObj &&
          this.formObj.bizSheet &&
          this.formObj.bizSheet.publishedAttributesJson === null)
      ) {
        this.goUnpublished();
        return;
      }
      const noData =
        this.formObj && this.formObj.bizObject
          ? this.formObj.bizObject.loadedFromDb
          : true;
      if (e.errcode === 402500 || !noData) {
        setTimeout(() => {
          this.$message.error(
            '页面渲染失败或数据已删除，请检查HTML设置或者数据。',
          );
        }, 50);
      }
      if (e.errcode === 40002) {
        this.goPermission();
        return;
      }

      this.goEmptyPage();
      return;
    } finally {
      if (closeLoading) {
        closeLoading();
      }
    }
  }

  // 生成一个子表的路径key
  getSheetStorageKey(sheet: schema.FormSheet) {
    return `${this.formObj.bizSchema.code}-${this.formObj.bizSheet.code}-${sheet.key}`;
  }

  // 子表列宽改变时：记录列宽到 localStorage
  onSheetColumnResize(data: {
    sheet: schema.FormSheet;
    column: schema.FormSheetColumn;
    width: number;
  }) {
    const key = this.getSheetStorageKey(data.sheet);
    let json = localStorage.getItem(key);

    let widthMap: any;
    if (json) {
      try {
        widthMap = JSON.parse(json);
      } catch (error) {}
    }

    if (!widthMap) {
      widthMap = {};
    }

    widthMap[data.column.key] = data.width;

    json = JSON.stringify(widthMap);
    localStorage.setItem(key, json);
  }

  // 加载上一次设置的子表列宽
  loadSheetColumnWidth() {
    const formControls: schema.RendererFormControl[] = [];
    renderer.components.FormRendererHelper.findFormControl(
      this.controls,
      formControls,
    );

    const sheets = formControls.filter(
      (c) =>
        c.type === schema.FormControlType.Sheet &&
        (c as any as schema.FormSheet).columns.length > 0,
    );

    for (const s of sheets) {
      const sheet = s as any as schema.FormSheet;
      const key = this.getSheetStorageKey(sheet);
      const json = localStorage.getItem(key);
      if (!json) {
        continue;
      }

      try {
        const widthMap = JSON.parse(json);

        if (!widthMap) {
          continue;
        }

        for (const col of sheet.columns) {
          const w = widthMap[col.key];
          if (w) {
            col.width = w;
          }
        }
      } catch {}
    }
  }

  initIframe(url: string) {
    const iframe = super.initIframe(url);
    const w = iframe.contentWindow as any;
    w.env = env;
    w.config = env;
    return iframe;
  }

  onOk(ac: runtime.FormActionButton, data: any) {
    // 删除保存在sessionStorage中的值，防止错误填充审批衣间
    window.sessionStorage.removeItem('$approval');
    super.doAction(ac, data);
  }

  // 提交并继续创建
  async submitAndCreate() {
    let formData = this.getFormValue(true);
    //account 专属定制  此字段为账套
    if(this.hasProperty('account',formData)){
      if(!formData['account']){
        this.$message.error('账套不能为空');
        return;
      }
    }
    const ac = {
      code: 'submit',
      disabled: false,
      loading: false,
      text: '提交',
      visible: true,
      isSubmitAndCreate: true,
    } as runtime.FormActionButton;

    await super.onAction(ac);
  }

	hasProperty(key,obj){
    return key in obj;
  }	
  
  updateLatestSignature(value: any, isNew: boolean = false) {
    super.updateLatestSignature(value, isNew);
  }

  // 点击按钮事件
  async onAction(ac: runtime.FormActionButton) {
    // if (ac.code === runtime.FormAction.Reject && !this.validateApproval()) {
    //     return; 
    // }
    let formData = this.getFormValue(true);
    //account 专属定制  此字段为账套
   
    if(this.hasProperty('account',formData)){
      if(!formData['account'] && ac['code'] === "submit"){
        this.$message.error('账套不能为空');
        return;
      }
    }
    if (ac.code === runtime.FormAction.Print) {
      this.hideCommentBeforePrint();
    }
    await super.onAction(ac);
  }

  async goto(ac: runtime.FormActionButton, res: Common.Data) {
    this.judgeIfNeedReload(ac);
    let url = this.$route.query.return as string;

    const params: any = this.$route.query;
    const reload = () => {
      const workitem = res.data.workItem;
      if (workitem) {
        this.goWfForm(workitem.id, workitem.instanceId);
      } else if (params.workitemId && params.workflowInstanceId) {
        this.goWfForm(params.workitemId, params.workflowInstanceId);
      } else if (res.data.workflowInstanceId) {
        this.goWfForm(params.workitemId, res.data.workflowInstanceId);
      } else {
        this.goBizForm();
      }
      const formMarking = this.$refs.formMarking as any;
      if (formMarking) {
        formMarking.reload();
      }
    };

    if (this.isDingTalk) {
      if (ac.code === runtime.FormAction.Save) {
        reload();
      } else {
        // 列表页面参数不能丢弃。丢弃后无法活动活跃模型
        if (!url) {
          this.$router
            .push({
              path: '/shared/success',
            })
            .catch((err: any) => {
              console.log(err);
            });
          return;
        }
        if (url.indexOf('application-list') > -1) {
          this.$router
            .push({
              path: url,
            })
            .catch((err: any) => {
              console.log(err);
            });
          return;
        }
        if (url.indexOf('agentId') === -1) {
          url = url.split('?')[0];
        }
        this.$router
          .push({
            path: url,
          })
          .catch((err: any) => {
            console.log(err);
          });
      }
      return;
    }

    // //
    // // 非流程表单
    // if (!this.isWorkflowForm) {
    //     if (ac.code === runtime.FormAction.Save) {
    //         this.goBizForm();
    //     } else if (
    //         ac.code === runtime.FormAction.Submit ||
    //         ac.code === runtime.FormAction.Delete
    //     ) {
    //         this.goSuccessPage(res);
    //     }
    //     return;
    // }

    // const gotoNext = async () => {
    //     const fromUnfinished = url && url.indexOf("my-unfinished-workitem") > -1;
    //     if (fromUnfinished) {
    //         const item = await this.getFirstUnfinish();
    //         if (item) {
    //             await this.showMessage();
    //             this.goWfForm(item.id, item.instanceId, true);
    //             return;
    //         }
    //     }

    //     this.goSuccessPage();
    // };

    switch (ac.code) {
      case runtime.FormAction.Save:
      case runtime.FormAction.Assist:
      case runtime.FormAction.Circulate:
      case runtime.FormAction.AdjustParticipant:
        reload();
        break;

      case runtime.FormAction.Retrieve:
        const workflowInstanceId = this.$route.query
          .workflowInstanceId as string;
        this.goWfForm(res.data.id as string, workflowInstanceId, true);
        break;

      default:
        this.goSuccessPage(res);
        break;
    }
  }

  // 跳转业务表单
  goBizForm() {
    const url = this.$route.query.return as string;
    const objectId = this.$route.query.objectId as string;
    this.$router.replace({
      name: 'form-detail',
      query: {
        schemaCode: this.formObj.bizSchema.code,
        sheetCode: this.formObj.bizSheet.code,
        objectId: this.formObj.bizObject.id || objectId, // 外部数据源没有对应的id
        return: url,
        t: new Date().getSeconds().toString() || '',
      },
    });
  }

  // 跳转流程表单
  goWfForm(workitemId: string, workflowInstanceId: string, reload?: boolean) {
    const url = this.$route.query.return as string;
    const params = {
      name: 'form-detail',
      query: {
        workitemId,
        workflowInstanceId,
        return: url,
        t: new Date().getSeconds().toString() || '',
      },
    };

    if (reload) {
      const { href } = this.$router.resolve(params);
      window.location.href = href;
    } else {
      this.workflowInstanceId = '';
      setTimeout(() => {
        this.$router.push(params).catch((err: any) => {
          console.log(err);
        });
      }, 0);
    }
  }

  // 跳转空页面提示
  goEmptyPage() {
    this.$router
      .push({
        name: 'shared-empty',
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  // 跳转表单未发布提示页面
  goUnpublished() {
    this.$router
      .push({
        name: 'formUnpublished',
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  // 跳转无权限提示页面
  goPermission() {
    this.$router
      .push({
        name: 'permission',
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  // 是否钉钉环境
  get isDingtalk() {
    return platform.IS_DINGTALK;
  }

  // 跳转成功提示页面
  goSuccessPage(backData?: any) {
    if ((window as any).externalLinkToken && backData) {
      const { formCode, objectId, schemaCode, workflowInstanceId } =
        backData.data;
      let param: any = {
        formCode,
        objectId,
        schemaCode,
      };
      if ((window as any).isStartWorkflow) {
        param = { objectId, workflowInstanceId };
      }
      externalLinkApi.getShortCode(param).then((res: any) => {
        if (res.errcode === 0) {
          this.$router
            .push({
              name: 'shared-success',
              params: { shortCode: res.data.pairCode },
            })
            .catch((err: any) => {
              console.log(err);
            });
        }
      });
    } else {
      if (window.opener) {
        const msg = this.$t('languages.form.operateDone').toString();
        this.$message.success(msg, 2, () => window.close());
      } else {
        const msg = this.$t("languages.form.operateDone").toString();
        this.$message.success(msg, 2);
        const url = this.$route.query.return as string;
        if (url) {
          if (this.isDingtalk) {
            this.$router
              .push({
                path: url,
              })
              .catch((err: any) => {
                console.log(err);
              });
          } else {
            if (window.top !== window.self) {
              setTimeout(() => {
                window.parent.postMessage("close", env.portalHost);
              },2500);
            }else{
              this.$router.push({
                name: 'shared-success',
              });
            }
          }
        } else {
          this.$router.push({
            name: 'shared-success',
          });
        }
      }
    }
  }

  // 跳转流程跟踪
  flowTrack() {
    if (!this.formObj || !this.formObj.workItemId) {
      return;
    }

    const { href } = this.$router.resolve({
      name: 'flowTrack',
      params: {
        workItemId: this.formObj.workItemId,
        workflowInstanceId: this.workflowInstanceId,
      },
      query: {
        return: this.$route.query.return,
        objectId: this.formObj.bizObject.id,
        schemaCode: this.formObj.bizObject.schemaCode || '',
      },
    });
    window.open(href, '_self');
  }

  // 设置完成时间
  setFinishTime(time: any) {
    if (time) {
      this.finishTime = time;
    }
  }

  // 获取下一条待办
  async getFirstUnfinish() {
    const res = await workflowApi.searchWorkitems({
      wd: '',
      page: 0,
      size: 1,
    });

    if (res.errcode === 0 && res.data.totalElements > 0) {
      return res.data.content[0];
    }

    return null;
  }

  // 下载文件
  onDownload(file: any) {
    if (!file || !file.refId) {
      return;
    }

    const url = renderer.UploadControl.service.getDownloadUrl(file);
    window.open(url);
  }

  printTemplates: any[] = [];

  // 打印按钮点击
  print(ac: runtime.FormActionButton) {
    if (!this.formObj.bizSheet.pdfAble) {
      this.pdfAble = false;
    } else {
      this.printTemplates = JSON.parse(this.formObj.bizSheet.printTemplateJson);

      this.pdfAble = this.formObj.bizSheet.pdfAble.includes('true');
    }

    // @ts-ignore
    if (!this.formObj.bizSheet.settingPrint || !this.pdfAble) {
      // 默认打印
      this.doPrint(ac);
    } else {
      // 已设置打印模板
      this.isShow = !this.isShow;
    }
  }

  // 开始打印
  doPrint(ac: runtime.FormActionButton) {
    if (platform.IS_DINGTALK) {
      this.$confirm({
        title: this.$t('languages.form.printConfirmTitle').toString(),
        content: this.$t('languages.form.printConfirmContent').toString(),
        okText: this.$t('languages.form.go').toString(),
        onOk() {
          const url = location.href + '&T=' + localStorage.getItem('token');
          platform.service.openLink(url);
        },
      });
    } else {
      super.print(ac);
    }
  }

  collectorTempPrintContainer: any = {
    _num: 0,
  };

  _findPrintEleIndex(id) {
    for (let i = 0; i < this.draftAttributesJson.length; i++) {
      const page = this.draftAttributesJson[i];
      for (let l = 0; l < page.length; l++) {
        if (page[l].id === id) {
          return [i, l];
        }
      }
    }
    return [-1, -1];
  }

  // 临时打印元素 返回的计算结果
  collectorTempPrintInfo({ id, calcDiff, ...other }) {
    if (!('_num' in this.collectorTempPrintContainer)) {
      this.collectorTempPrintContainer._num = 0;
    }
    const [pIndex, sIndex] = this._findPrintEleIndex(id);
    if (!this.collectorTempPrintContainer[pIndex]) {
      this.collectorTempPrintContainer[pIndex] = {};
    }
    this.collectorTempPrintContainer[pIndex][sIndex] = {
      id,
      calcDiff,
      ...other,
    };
    ++this.collectorTempPrintContainer._num;
    if (this.collectorTempPrintContainer._num === this.tempPrintEleNumber) {
      delete this.collectorTempPrintContainer._num;
      this.tempPrintEleArray = [];
      this.tempPrintEleNumber = 0;
      this.$nextTick(() => {
        this.printPageAlgorithm();
      });
    }
  }

  printPageAlgorithm() {
    const pageIndex = Object.keys(this.collectorTempPrintContainer);
    console.log(
      'PcFormDetail -> printPageAlgorithm -> this.collectorTempPrintContainer',
      this.collectorTempPrintContainer,
    );
    for (const page of pageIndex) {
      const eleList: any = Object.keys(this.collectorTempPrintContainer[page]);
      for (const eleIndex of eleList) {
        const eleInfo = this.collectorTempPrintContainer[page][eleIndex];
        if (!eleInfo.calcDiff) {
          // 实际高度没有超过默认高度 不用处理
          continue;
        }
        const [pIndex, sIndex] = this._findPrintEleIndex(eleInfo.id); // 根据id获取元素当前位置, 因为在for中会操作draftAttributesJson
        const ele = this.draftAttributesJson[pIndex][sIndex];
        let eleContentWidth = '';
        let eleMinWidth = '';
        let eleMaxWidth = '';
        const eleDefaultBottomHeight = ele.top + ele.heightValue;
        let newPageNum = 0; // ele 分页数量
        let eleBottomToTop = 0; // ele 不分页情况下, 最低部距离页头距离
        let lastPageHeight = 0; // ele分页,最后一页占用的高度
        if (
          ele.top + eleInfo.eleContentHeight + eleInfo.pageUpToPx >
          eleInfo.PageHeightPx
        ) {
          newPageNum = Math.ceil(
            Math.abs(
              eleInfo.eleContentHeight -
                (eleInfo.PageHeightPx - ele.top - eleInfo.pageUpToPx),
            ) / eleInfo.PageHeightPx,
          );
          lastPageHeight = Math.ceil(
            eleInfo.eleContentHeight -
              (eleInfo.PageHeightPx - ele.top - eleInfo.pageUpToPx) -
              (newPageNum - 1) * eleInfo.PageHeightPx,
          );
          // 如果支持 子表表头分页,则新的一页需要增加一行表头高度
          if (eleInfo.sheetHeaderPagingAttr) {
            lastPageHeight = lastPageHeight + newPageNum * eleInfo.headerHeight;
          }
        } else {
          eleBottomToTop = ele.top + eleInfo.eleContentHeight;
        }
        if (ele.eleType === 'column') {
          eleContentWidth = ele.leftKey.widthValue + ele.rightValue.widthValue;
          eleMinWidth = ele.left;
          eleMaxWidth = ele.left + eleContentWidth;
        } else if (ele.eleType === 'sheet') {
          eleContentWidth = ele.widthValue;
          eleMinWidth = ele.left;
          eleMaxWidth = ele.left + eleContentWidth;
        } else {
          //Else Empty block statement
        }
        const eleSibling: any = [];
        const eleSiblingIndex: number[] = [];
        const passivity_eleSibling: any = []; // 被动 分页的元素. 计算元素自己没有分页,但因为它的高度增加使用空间,导致它下面的元素出现分页情况.
        const passivity_eleSiblingIndex: any = []; // 被动 分页的元素的坐标
        let passivity_newPageNum: any = 0; // 被动 分页的元素.产生的分页数量. 理论上只会是1或0
        const _widthValueEleType = ['leftBarcodePic', 'leftQrcodePic', 'sheet'];
        // 获取那些元素在 变化高度元素下面.
        if (this.draftAttributesJson[pIndex].length > sIndex + 1) {
          const l = this.draftAttributesJson[pIndex].length;
          for (let i = sIndex + 1; i < l; i++) {
            const tItem = this.draftAttributesJson[pIndex][i];
            if (tItem.eleType === 'pageSettings') {
              continue;
            }
            let tItemContentWidth: any = '';
            if (
              tItem.eleType === 'column' ||
              (tItem.leftKey &&
                (tItem.leftKey.widthValue ||
                  tItem.leftKey.widthValue === '0') &&
                tItem.rightValue &&
                (tItem.rightValue.widthValue ||
                  tItem.rightValue.widthValue === '0'))
            ) {
              tItemContentWidth =
                tItem.leftKey.widthValue + tItem.rightValue.widthValue;
            } else if (_widthValueEleType.includes(tItem.eleType)) {
              tItemContentWidth = tItem.widthValue;
            } else {
              //Else Empty block statement
            }
            const diffTop = tItem.top - ele.top - ele.heightValue;
            if (
              !(
                tItem.left + tItemContentWidth <= eleMinWidth ||
                tItem.left >= eleMaxWidth
              ) ||
              diffTop >= 0
            ) {
              // 如果 元素和 下面的元素在 X轴有交集 或 所以在它下放的元素,即使没有X轴交集
              if (newPageNum) {
                // 如果元素会自己分页. 最后一个页的占用的高度加上两个元素 高度差
                tItem.top = lastPageHeight + diffTop;
              } else {
                // 元素自己不分页
                tItem.top = diffTop + eleBottomToTop;
                if (tItem.top > eleInfo.PageHeightPx) {
                  tItem.top = tItem.top - eleInfo.PageHeightPx;
                  passivity_eleSiblingIndex.push(i);
                  passivity_newPageNum = 1;
                }
              }
              console.log(diffTop, tItem.top);
              eleSiblingIndex.push(i);
            }
          }
          // 如果元素自己分页,则需要将当前也下面的元素移除掉
          if (eleSiblingIndex.length && newPageNum) {
            for (let i = 0; i < eleSiblingIndex.length; i++) {
              const [s] = this.draftAttributesJson[pIndex].splice(
                eleSiblingIndex[i] - i,
                1,
              );
              eleSibling.push(s);
            }
          } else if (passivity_eleSiblingIndex.length && passivity_newPageNum) {
            for (let i = 0; i < passivity_eleSiblingIndex.length; i++) {
              const [s] = this.draftAttributesJson[pIndex].splice(
                passivity_eleSiblingIndex[i] - i,
                1,
              );
              passivity_eleSibling.push(s);
            }
          } else {
            //Else Empty block statement
          }
        }
        const tempPage: any = [];
        for (let i = 0; i < newPageNum; i++) {
          tempPage.push([]);
        }
        if (newPageNum) {
          // 元素自己会分页情况
          if (eleSibling.length) {
            // 需要移动的元素
            tempPage[tempPage.length - 1] = [...eleSibling];
          }
          this.draftAttributesJson.splice(pIndex + 1, 0, ...tempPage);
        } else {
          // 元素自己不分页的情况
          if (passivity_newPageNum && passivity_eleSiblingIndex.length) {
            for (let i = 0; i < passivity_newPageNum; i++) {
              tempPage.push([]);
            }
            tempPage[tempPage.length - 1] = [...passivity_eleSibling];
            this.draftAttributesJson.splice(pIndex + 1, 0, ...tempPage);
          }
        }
      }
    }
    console.log(
      'PcFormDetail -> printPageAlgorithm -> this.draftAttributesJson',
      this.draftAttributesJson,
    );
    this._startPrintHtml();
  }

  tempPrintEleNumber = 0; // 临时打印元素数量

  printHtmlCloseLoading: any = '';

  // 打印
  async getChildPrintClick(strType: any) {
    this.isShow = false;

    const ac = this.actions.find((a) => a.code === runtime.FormAction.Print);
    if (strType === '系统默认模板') {
      if (ac) {
        this.doPrint(ac);
      }
    } else if (strType.includes("打印模板")) {
      this.printHtmlCloseLoading = (this.$message as any).loading("", 0);
      this.showPdf = false;
      this.pdfUrl = `/pdfjs/web/viewer.html`;
      this.formdata = { ...this.formObj };

      const sheetCode: string = JSON.parse(this.formObj.bizSheet.printTemplateJson)[0].sheetCode;
      const schemaCode: string = this.formObj.bizSheet.schemaCode;

      // 查询当前的数据项
      const res = await listApi.getDataItems({
        schemaCode: schemaCode,
        isPublish: true,
      });

      if (res && res.errcode === 0) {
        this.listDatemItem = res.data;
      }

      const query = utils.parseQuery();
      console.log();
      console.log(this.formdata.bizObject.id);
     console.log(query['bizObjectId']);
      const { data, errcode, errmsg } = await formApi.getPrintAttributesJson({
        sheetCode,
        schemaCode,
        isFromForm:true,
        //bizObjectId: query['bizObjectId'] || this.formdata.bizObject.id,
      });
      if (errcode !== 0) {
        this.$message.error(errmsg, 3);
        return;
      }
      if (
        !data ||
        !data.draftAttributesJson ||
        !JSON.parse(data.draftAttributesJson).length
      ) {
        this.$message.warning('打印模板内容为空！', 3);
        this.printHtmlCloseLoading();
        return;
      }
      // const formDataVal: any = { ...this.formObj.bizObject.data };
      const formDataVal: any = JSON.parse(
        JSON.stringify(this.formObj.bizObject.data),
      );
      const logInfoList = this.formObj.logInfoList || [];

      if (data.printJson) {
        // 走对接氚云的打印
        const { id, name, draftAttributesJson, printJson } = data;
        const templateData: any = {
          id,
          content: draftAttributesJson,
          settings: printJson,
          templateName: name,
          template: {
            Id: id,
            SchemaCode: schemaCode,
            TemplateName: name,
            Remark: '',
            CreatedTime: new Date().getTime(),
          },
        };
        const formData: any = {};
        const tempSheetInfo = {};
        const logInfo = {};
        const contentArr: [] = JSON.parse(draftAttributesJson);
        printSharedMethods.analizePrintTemplate(
          contentArr,
          formData,
          tempSheetInfo,
          logInfo,
        );

        console.log('formData======>', formData);

        /**
         * 过滤审批记录
         */
        delete formData.modifier;

        const controls = this.formRenderer.findFormControls(
          // Object.keys(formData),
        );
        Object.keys(formData).forEach((key: string) => {
          if (key === 'WorkFlowLog') {
            formData[key] = logInfoList
              .filter((item) => {
                return (
                  (logInfo.hasOwnProperty(item.activityCode) ||
                    logInfo.hasOwnProperty(item.logStatus)) &&
                  item.workItemStatus !== 4
                );
              })
              .map((item) => {
                return {
                  activityName: item.activityName,
                  receiveTime: item.receiveTime,
                  finishTime: item.finishTime,
                  usedTime: item.usedTime,
                  name: item.originator ? item.originator.name : '',
                  operating: workflowActionStatus[
                    item.approvalActionStatus.toString()
                  ]
                    ? this.$t(
                        `languages.common.WorkflowActionStatus.${
                          workflowActionStatus[
                            item.approvalActionStatus.toString()
                          ]
                        }`,
                      )
                    : '--',
                  content: item.comment || '', // 审批意见
                  signature:
                    [
                      renderer.UploadControl.service.getDownloadUrlByRefId(
                        item.signature,
                      ),
                    ] || [], // 手写签名
                };
              });
          } else if (key === 'QRCode') {
            const qrConfig: any = formData[key];
            formData[key] = this.formatQRCode(
              controls,
              formDataVal,
              tempSheetInfo,
              qrConfig,
            );
          } else {
            const control = controls.find((item) => item.key === key);
            const value = formDataVal[key];
            if (control) {
              formData[key] = printSharedMethods.formatChuanyunData(
                value,
                control.type,
                tempSheetInfo[key],
                control,
              );
            } else {
              formData[key] = printSharedMethods.formatSystemData(value, key);
            }
          }
        });

        // 处理流程印章
        const res = await workflowApi.getWorkflowBaseInfo({
          workflowInstanceId: this.workflowInstanceId as string,
        });
        if (res && res.data && res.data.status) {
          const status: string = res.data.status;
          switch (status) {
            case 'COMPLETED':
              formData['F0000020'] = 'finished';
              break;
            case 'DRAFT':
              formData['F0000020'] = 'draft';
              break;
            case 'PROCESSING':
              formData['F0000020'] = 'running';
              break;
            case 'CANCELED':
              formData['F0000020'] = 'canceled';
              break;
            default:
              break;
          }
        }

        const runtimePrint = new H3PrintRuntime(templateData, formData);
        setTimeout(() => {
          this.printHtmlCloseLoading();
        }, 200);
        runtimePrint.printPreview();
        return;
      } else {
        // @ts-ignore
        this.draftAttributesJson = replaceValueData(
          env,
          JSON.parse(data.draftAttributesJson) || [],
          'real',
          this,
          this.listDatemItem,
        );
        findPageSettingInfo: for (const pages of this.draftAttributesJson) {
          for (const item of pages) {
            if (item.eleType === 'pageSettings') {
              item.top = -999;
              this.tempPrintPageSettings = item;
              break findPageSettingInfo;
            }
          }
        }
        // 为了兼容老数据，pageSettings需要给默认值
        this.tempPrintPageSettings =
          this.tempPrintPageSettings === ''
            ? this.pageSettings
            : this.tempPrintPageSettings;
        for (const page of this.draftAttributesJson) {
          page.sort((a, b) => a.top - b.top);
        }
        const publishedAttributesJson =
          this.formObj.bizSheet.publishedAttributesJson;
        const logInfoList = this.formObj.logInfoList;
        // ;
        let publishObjJSON = null;
        if (publishedAttributesJson) {
          publishObjJSON = JSON.parse(publishedAttributesJson);
        }
        // const formDataVal: any = { ...this.formObj.bizObject.data };
        const formDataVal: any = JSON.parse(
          JSON.stringify(this.formObj.bizObject.data),
        );
        for (const page of this.draftAttributesJson) {
          for (let ii = page.length - 1; ii >= 0; ii--) {
            const y = page[ii];
            const isCheckVisible = true;
            if (!isCheckVisible) {
              page.splice(ii, 1);
            }

            if (
              y.eleType === 'processLog' &&
              logInfoList &&
              logInfoList.length
            ) {
              logInfoList.forEach((d: any) => {
                common.utils.compatible(d, 'activityName');
                // 发起节点接收时间优化-不展示接收时间、耗时
                if (d.tokenId === 0) {
                  d.receiveTime = '--';
                  d.usedTime = '--';
                } else if (typeof d.usedTime === 'number') {
                  d.usedTime = msesToTimeStr(d.usedTime)
                    ? msesToTimeStr(d.usedTime)
                    : '--';
                } else {
                  //Else Empty block statement
                }
                d.name = d.originator && d.originator.name;
                if (d.subInstanceActivity) {
                  if (workItemStatus[d.workItemStatus.toString()]) {
                    d.operating = this.$t(
                      `languages.common.WorkItemStatus.${
                        workItemStatus[d.workItemStatus.toString()]
                      }`,
                    );
                  } else {
                    d.operating = '';
                  }
                } else {
                  if (!d.approvalActionStatus && d.approvalActionStatus !== 0) {
                    d.approvalActionStatus = 99;
                  }
                  if (workflowActionStatus[d.approvalActionStatus.toString()]) {
                    d.operating = this.$t(
                      `languages.common.WorkflowActionStatus.${
                        workflowActionStatus[d.approvalActionStatus.toString()]
                      }`,
                    );
                  } else {
                    d.operating = '';
                  }
                }
              });
              let baseOperation = y.baseOperation.filter(
                (i: any) => i.selected,
              );
              baseOperation = baseOperation.map((i: any) => i.code);
              const logFliter = logInfoList.filter((v: any) => {
                let logStatus = v.logStatus;
                if (typeof v.logStatus === 'string') {
                  logStatus = [v.logStatus];
                }
                const a = new Set(logStatus);
                const b = new Set(baseOperation);
                const arr = Array.from(new Set([...b].filter((x) => a.has(x))));
                if (arr && arr.length > 0) {
                  return v;
                }
              });
              const logs = logFliter || [];
              if (logs && logs.length > 0) {
                y.value = logs;
              } else {
                page.splice(ii, 1);
              }
            }
            if (y.eleType !== 'sheet') {
              continue;
            }
            const value = this.formObj.bizObject.data[y.code];
            if (value && value.length > 0) {
              const valueCopy = JSON.parse(JSON.stringify(value));

              const controls = this.formRenderer.findFormControls([y.code]);
              if (controls && controls.length > 0) {
                const control = controls[0] as any as schema.FormSheet;
                if (control) {
                  const map: any = {};
                  control.columns.map((c) => (map[c.key] = c));

                  for (const row of valueCopy) {
                    for (const key of Object.keys(row)) {
                      if (map[key]) {
                        if (
                          map[key].type !== schema.FormControlType.Attachment &&
                          map[key].type !== schema.FormControlType.Image &&
                          map[key].type !==
                            schema.FormControlType.RelevanceForm &&
                          map[key].type !==
                            schema.FormControlType.RelevanceFormEx &&
                          map[key].type !== schema.FormControlType.Signature
                        ) {
                          row[key] = renderer.FormControlValueService.format(
                            map[key],
                            row[key],
                          );
                        } else {
                          if (
                            map[key].type ===
                              schema.FormControlType.RelevanceForm ||
                            map[key].type ===
                              schema.FormControlType.RelevanceFormEx
                          ) {
                            let str: any = '';

                            str =
                              row[key] && row[key][row[key]['displayCode']]
                                ? row[key][row[key]['displayCode']]
                                : str;
                            // 逻辑
                            if (row[key] && row[key].propertyType === 4) {
                              str === true ? (str = '是') : (str = '否');
                            }

                            // 地址处理
                            if (
                              row[key] &&
                              row[key].propertyType === 10 &&
                              str
                            ) {
                              const obj = JSON.parse(str);
                              if (
                                obj &&
                                (obj.hasOwnProperty('provinceName') ||
                                  obj.hasOwnProperty('cityName') ||
                                  obj.hasOwnProperty('districtName') ||
                                  obj.hasOwnProperty('address'))
                              ) {
                                // @ts-ignore
                                str = `${obj.provinceName || ''}${
                                  obj.cityName || ''
                                }${obj.districtName || ''}${obj.address || ''}`;
                              }
                            }
                            // 选人控件处理
                            if (
                              row[key] &&
                              row[key].propertyType === 5 &&
                              str
                            ) {
                              let arrStr: string = '';
                              str.map((arr: any) => {
                                arrStr === ''
                                  ? (arrStr = arr.name)
                                  : (arrStr += `、` + arr.name);
                              });
                              str = arrStr;
                            }

                            switch (str) {
                              case 'DRAFT':
                                str = '草稿';
                                break;
                              case 'PROCESSING':
                                str = '进行中';
                                break;
                              case 'COMPLETED':
                                str = '已完成';
                                break;
                              case 'CANCELED':
                                str = '已作废';
                                break;
                              default:
                                break;
                            }
                            row[key] = str.toString();
                          }
                          // 手写签名
                          else if (
                            map[key].type === schema.FormControlType.Signature
                          ) {
                            let signature: any = {};
                            Array.isArray(row[key]) && row[key].length > 0
                              ? (signature = row[key][0])
                              : (signature = []);
                            if (signature && signature.refId) {
                              const url =
                                renderer.UploadControl.service.getDownloadUrl(
                                  signature,
                                );
                              row[key][0].url = url;
                              row[key][0].type = map[key].type;
                            }
                          } else {
                            row[key].forEach((v) => (v.type = map[key].type));
                          }
                        }

                        // 修改当表为‘逻辑’时 对应的值显示
                        if (map[key].key.includes('Logic')) {
                          row[key] = row[key] === 'true' ? '是' : '否';
                        }
                      } else {
                        const val = row[key];
                        if (Array.isArray(val)) {
                          row[key] = val
                            .map((v: any) => v.name)
                            .filter((f) => !!f)
                            .join(';');
                        } else if (typeof val === 'object' && val) {
                          if (val.name) {
                            row[key] = val.name;
                          } else if (val.provinceName && val.cityName) {
                            row[
                              key
                            ] = `${val.provinceName} ${val.cityName} ${val.districtName} ${val.address}`;
                          } else if (val.address) {
                            row[key] = val.address;
                          } else {
                            row[key] = '';
                          }
                        } else {
                        }
                      }
                    }
                  }
                }
              }
              y.value = valueCopy;
            } else {
              // 如果字表无内容则不打印字表
              page.splice(ii, 1);
            }
          }
        }
        for (let i = 0; i < this.draftAttributesJson.length; i++) {
          const page = this.draftAttributesJson[i];
          for (let j = 0; j < page.length; j++) {
            const ele = page[j];
            if (
              ele.eleType === 'column' &&
              ele.rightValue &&
              ele.rightValue.code
            ) {
              const code = ele.rightValue.code.split('#_#')[0];
              const [ctrl] = this.formRenderer.findFormControls([code]);
              if (!ctrl) {
                continue;
              }
              if (!!ctrl) {
                ele.ctrlType = ctrl.type;
                ele.ctrlValue = ctrl.value;
              }
              if (ctrl.type === schema.FormControlType.Textarea) {
                ++this.tempPrintEleNumber;
                this.tempPrintEleArray.push({
                  tempPrintEle: ele,
                  isShowTempPrintHtmlEle: true,
                  key: `${code}_${i}_${j}`,
                });

                // 兼容富文本打印
                if (
                  ctrl.options &&
                  ctrl.options.textAreaType &&
                  ctrl.options.textAreaType === 'current'
                ) {
                  ele.rightValue.renderType = 'editor';
                }
              } else if (ctrl.type === schema.FormControlType.Image) {
                ++this.tempPrintEleNumber;
                this.tempPrintEleArray.push({
                  tempPrintEle: ele,
                  isShowTempPrintHtmlEle: true,
                  key: `${code}_${i}_${j}`,
                });
              } else {
                //Else Empty block statement
              }
            } else if (ele.eleType === 'sheet') {
              const code = ele.code;
              ++this.tempPrintEleNumber;
              this.tempPrintEleArray.push({
                tempPrintEle: ele,
                isShowTempPrintHtmlEle: true,
                key: `${code}_${i}_${j}`,
              });
            } else {
              //Else Empty block statement
            }
          }
        }

        if (!this.tempPrintEleArray.length) {
          this._startPrintHtml();
        }
      }
    }
  }

  // 开始 html打印部分渲染
  _startPrintHtml() {
    this.isPrintGenerateHtml = true;
    setTimeout(async () => {
      // 延迟等待数据渲染成功，拿到html文件
      await this.waitPrintRender(this.printHtmlCloseLoading);
    }, 2000);
  }

  getDownloadUrl(file: renderer.H3File) {
    return renderer.UploadControl.service.getDownloadUrl(file);
  }

  async waitPrintRender(closeLoadingFn: () => {}) {
    const printRenderer = this.$refs.printRenderer as any;
    if (printRenderer) {
      // isEdage  针对兼容Edage浏览器  Edge浏览器不识别onload 故不会执行调起
      const isEdage: boolean =
        (window as any).navigator.userAgent.indexOf('Edge') !== -1;
      if (
        isEdage ||
        !!(window as any).ActiveXObject ||
        'ActiveXObject' in window
      ) {
        // const iframe: any = document.getElementById("pdfFrame");
        // this.$nextTick(() => {
        //   this.srcdoc = printRenderer.getHtml();
        //   console.log(this.srcdoc);
        //   iframe.contentWindow.document.body.innerHTML = this.srcdoc;
        //   iframe.contentWindow.print();
        // });
        const newWindow: any = window.open();
        newWindow.document.write(printRenderer.getHtml());
        newWindow.document.close();
        newWindow.focus();
        newWindow.print();
        newWindow.close();
        closeLoadingFn();
      } else {
        const isTrident: boolean =
          (window as any).navigator.userAgent.indexOf('Trident') !== -1;
        setTimeout(async () => {
          this.$nextTick(() => {
            this.srcdoc = printRenderer.getHtml();
            console.log('print html:', this.srcdoc);
            const iframe: any = document.getElementById('pdfFrame');
            this.isPrintGenerateHtml = false;
            // let page = window.open('', '_blank');// 打开一个新窗口，用于打印
            // page.document.body.innerHTML = this.srcdoc;// 写入打印页面的内容
            iframe.onload = () => {
              closeLoadingFn();
              setTimeout(() => {
                if (!this.srcdoc) {
                  return;
                }
                if (isTrident) {
                  iframe.contentWindow.document.execCommand(
                    'print',
                    false,
                    null,
                  );
                } else {
                  iframe.contentWindow.print();
                }
                this.srcdoc = '';
              }, 300);
            };
            if (isTrident) {
              iframe.onload();
            }
          });
        }, 1800);
      }
    } else {
      setTimeout(() => {
        this.waitPrintRender(closeLoadingFn);
      }, 500);
    }
  }

  /**
   * 根据操作按钮类型，判断是否需要发出列表重载信号
   * @param ac 操作按钮对象
   */
  judgeIfNeedReload(ac: runtime.FormActionButton) {
    let ifNeedReload: boolean = false;
    switch (ac.code) {
      case runtime.FormAction.Submit:
      case runtime.FormAction.Delete:
      case runtime.FormAction.Agree:
      case runtime.FormAction.DisAgree:
      case runtime.FormAction.Cancel:
      case runtime.FormAction.Forward:
      case runtime.FormAction.FinishInstance:
      case runtime.FormAction.Reject:
      case runtime.FormAction.Retrieve:
        ifNeedReload = true;
        break;

      default:
        break;
    }

    if (!ifNeedReload || this.isDingTalk) {
      return;
    }
    // 定义页签关闭前发出重载信号
    const url: any = this.$route.query.return;
    const opener = window.opener;
    if (opener) {
      window.onbeforeunload = () => {
        opener.postMessage(url, opener.location.href);
      };
    } else {
      this.closePopDetail();
    }
  }

  /**
   * 切换是否展示评论模块
   * */

  toggleComment() {
    this.isShowComment = !this.isShowComment;
  }

  /**
   * 在点击打印前将评论收起
   */
  hideCommentBeforePrint() {
    if (this.workflowInstanceId && !this.isExternal) {
      this.isShowComment = true;
      this.activeKey = '1';
    } else {
      this.isShowComment = false;
    }
  }

  pxToMM(px: number) {
    return Math.floor((px / 72) * 2.54 * 1000000) / 100000;
  }

  mmToPx(value: number) {
    const inch = value / 25.4;
    return Math.ceil(inch * 72);
  }

  /*
   * 根据控件设置的显示条件是否满足决定是否打印该控件
   */
  checkVisible(ele, publishedJSONObj, formDataVal) {
    const isVisible = true;
    let tplEle: any = null;
    if (ele.eleType === 'column' && ele.rightValue && ele.rightValue.code) {
      const code = ele.rightValue.code.split('#_#')[0];
      tplEle = recursionSearch(publishedJSONObj, code);
    } else if (ele.eleType === 'sheet') {
      tplEle = recursionSearch(publishedJSONObj, ele.code);
    } else {
      //Else Empty block statement
    }
    if (tplEle && tplEle.options) {
      const displayFormula = tplEle.options.displayFormula;
      if (displayFormula) {
        if (displayFormula.indexOf('&&') > -1) {
          // 多个And条件解析 判断isShow
          const andArr: any[] = displayFormula.split('&&');
          return andArr.every((item) => {
            return this.checkCondition(item, publishedJSONObj, formDataVal);
          });
        } else if (displayFormula.indexOf('||') > -1) {
          // 多个Or条件解析 判断isVisible
          const orArr: any[] = displayFormula.split('||');
          return orArr.some((item) => {
            return this.checkCondition(item, publishedJSONObj, formDataVal);
          });
        } else {
          // 只有一个条件解析 判断isVisible
          return this.checkCondition(
            displayFormula,
            publishedJSONObj,
            formDataVal,
          );
        }
      } else {
        return isVisible;
      }
    }
    return isVisible;
  }

  checkCondition(tplStr: string, publishedJSONObj: any, formDataVal: any) {
    const isCheck = true;
    const factors = tplStr.split(' ');
    if (Array.isArray(factors) && factors.length > 1) {
      const propertyCode = factors[0].substring(1, factors[0].length - 1);
      const propertyVal = recursionSearch(formDataVal, propertyCode);
      const operator = factors[1];
      let val: any = null;
      if (factors.length > 2) {
        val = factors[2];
      }
      const condElement = recursionSearch(publishedJSONObj, propertyCode);
      if (condElement) {
        // 将控件类型映射到非系统数据项类型, 根据factor[1]与操作比较
        const type = ControlHelper.mapToDataItemType(condElement.type);
        let op: any = null;
        switch (type) {
          case schema.DataItemType.Number:
          case schema.DataItemType.Date:
            op = numberDataItemOperators.find((item) => {
              return item.label === operator;
            });
            if (op) {
              switch (op.value) {
                case DateItemOperatorType.IsNull:
                  return propertyVal === null;
                case DateItemOperatorType.IsNotNull:
                  return propertyVal !== null;
                case DateItemOperatorType.Equal:
                  return propertyVal === val;
                case DateItemOperatorType.NotEqual:
                  return propertyVal !== val;
                case DateItemOperatorType.GreaterThan:
                  return propertyVal > val;
                case DateItemOperatorType.GreaterThanOrEqual:
                  return propertyVal >= val;
                case DateItemOperatorType.LessThan:
                  return propertyVal < val;
                case DateItemOperatorType.LessThanOrEqual:
                  return propertyVal <= val;
                default:
                  return false;
              }
            } else {
              return false;
            }

          case schema.DataItemType.Logic:
            op = logicDataItemOperators.find((item) => {
              return item.label === operator;
            });
            if (op) {
              switch (op.value) {
                case DateItemOperatorType.Equal:
                  return propertyVal === val;
                default:
                  return false;
              }
            } else {
              return false;
            }

          case schema.DataItemType.ShortText:
          case schema.DataItemType.LongText:
            if (condElement.type === schema.FormControlType.SequenceStatus) {
              op = sequenceStatusOperators.find((item) => {
                return item.label === operator;
              });
              if (op) {
                switch (op.value) {
                  case DateItemOperatorType.IsNull:
                    return propertyVal === null;
                  case DateItemOperatorType.IsNotNull:
                    return propertyCode !== null;
                  case DateItemOperatorType.Equal:
                    return propertyVal === val;
                  case DateItemOperatorType.NotEqual:
                    return propertyVal !== val;
                  default:
                    return false;
                }
              } else {
                return false;
              }
            } else {
              op = textDataItemOperators.find((item) => {
                return item.label === operator;
              });
              if (op) {
                switch (op.value) {
                  case DateItemOperatorType.IsNull:
                    return propertyVal === null;
                  case DateItemOperatorType.IsNotNull:
                    return propertyCode !== null;
                  case DateItemOperatorType.Equal:
                    return propertyVal === val.substring(1, val.length - 1);
                  case DateItemOperatorType.NotEqual:
                    return propertyVal !== val.substring(1, val.length - 1);
                  case DateItemOperatorType.Contains:
                    return propertyVal.indexOf(val) > -1;
                  case DateItemOperatorType.NotEqual:
                    return propertyVal.indexOf(val) === -1;
                  case DateItemOperatorType.In:
                    return val.indexOf(propertyVal) > -1;
                  case DateItemOperatorType.NotIn:
                    return val.indexOf(propertyVal) === -1;
                  default:
                    return false;
                }
              } else {
                return false;
              }
            }

          case schema.DataItemType.StaffSingle:
            op = staffDataItemOperators.find((item) => {
              return item.label === operator;
            });
            const valJSONObj = val ? JSON.parse(val) : null;
            if (op) {
              switch (op.value) {
                case DateItemOperatorType.IsNull:
                  return propertyVal === null;
                case DateItemOperatorType.IsNotNull:
                  return propertyVal !== null;
                case DateItemOperatorType.Contains:
                case DateItemOperatorType.Have:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.parentId === item.id || x.id === item.id;
                      }) > -1
                    );
                  });
                case DateItemOperatorType.NotContains:
                case DateItemOperatorType.NotHave:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.parentId === item.id || x.id === item.id;
                      }) === -1
                    );
                  });

                case DateItemOperatorType.Of:
                case DateItemOperatorType.In:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.id === item.parentId || x.id === item.id;
                      }) > -1
                    );
                  });
                case DateItemOperatorType.NotOf:
                case DateItemOperatorType.NotIn:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.id === item.parentId || x.id === item.id;
                      }) === -1
                    );
                  });
                default:
                  return false;
              }
            } else {
              return false;
            }

          case schema.DataItemType.RelevanceForm:
            // todo
            return true;
        }
      }
    }
    return isCheck;
  }

  formatQRCode(
    controls: any,
    formDataVal: any,
    sheetInfo: any,
    configArr: any,
  ): Object {
    const objRet: any = {};
    if (Array.isArray(configArr)) {
      configArr.forEach((configJsonStr: any) => {
        const config: any = JSON.parse(configJsonStr);
        // {"模板生成的二维码字段名": "根据规则生成的值"}
        let qrCodeKey: string = '';
        let qrCodeValue: string = '';
        if (Array.isArray(config.children) && config.children.length > 0) {
          qrCodeKey = config.children[0].fieldCode;
        }
        if (config.data && config.data.fieldTypeContent) {
          const type: number = config.data.fieldTypeContent.key;
          const keys: any = config.data.fieldTypeContent.attrs;
          switch (type) {
            case 1: // 新增数据二维码
              qrCodeValue = this.calcQrCodeUrl(env, this, 'create');
              break;
            case 2: // 查看数据二维码
              qrCodeValue = this.calcQrCodeUrl(env, this, 'view');
              break;
            case 3: // 表单字段生成
              let val: string = '';
              keys.forEach((key) => {
                const control = controls.find((item) => item.key === key);
                const value = formDataVal[key];
                if (control) {
                  let str: any = printSharedMethods.formatChuanyunData(
                    value,
                    control.type,
                    sheetInfo[key],
                    control,
                  )
                  str = str === undefined ? '空' : str;
                  val += str + '&';
                } else {
                  let str: any = printSharedMethods.formatSystemData(value, key);
                  str = str === undefined ? '空' : str;
                  val += str + '&';
                }
              });
              qrCodeValue = val.substring(0, val.length - 1);
              break;
            case 4: // 自定义内容生成
              qrCodeValue = keys;
              break;
            default:
              break;
          }
        }
        objRet[qrCodeKey] = qrCodeValue;
      });
    }
    return objRet;
  }

  /*
   * 计算二维码的url，新增、查看
   */

  calcQrCodeUrl(env: any, _this: any, showOrCreate: string): any {
    const { workflowInstanceId, workItemId, workflowCode } = _this.formObj;
    const { id, schemaCode, sheetCode } = _this.formObj.bizObject;
    const { config } = _this.$store.state;
    // const { corpId, agentId } = config;
    let user: any = sessionStorage.getItem('user');
    try {
      user = JSON.parse(user);
      const { corpId, agentId } = user;
      let qrText = '';
      // @ts-ignore
      if (!showOrCreate.includes('create')) {
        if (workflowInstanceId && workItemId) {
          // 查看
          qrText = `${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&corpId=${corpId}&agentId=${agentId}&mode=form`;
        } else {
          qrText = `${config.mobileServerUrl}/?corpId=${corpId}&agentId=${agentId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&id=${id}&mode=form`;
        }
      } else {
        // 新增
        if (workflowCode) {
          qrText = `${config.mobileServerUrl}/?workflowCode=${workflowCode}&corpId=${corpId}&agentId=${agentId}&mode=create`;
        } else {
          qrText = `${config.mobileServerUrl}/?corpId=${corpId}&agentId=${agentId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&mode=create`;
        }
      }
      return qrText;
    } catch {
      return 'error';
    }
  }
}

import {
  form,
  formApi,
  listApi,
  workflow,
  workflowApi,
  bizpropertyApi,
  listParams,
} from '../../../../api';
import { utils } from '../../../../common';
import { CompareVersion } from '../../../../form/utils';
import * as platform from '../../../../platform';
import axios from 'axios';
import * as dd from 'dingtalk-jsapi';
import { RadioControl, RowChangeType, ValueControl } from 'cloudpivot-forms';
import cloneDeep from 'lodash/cloneDeep';
import uniqBy from 'lodash/uniqBy';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'vue-i18n';
import { Provide, Vue } from 'vue-property-decorator';
import 'vue-router';
import * as renderer from '../../renderer';
import {
  components,
  dateFormatter,
  FormControlApiHandler,
  UploadFile,
  UploadStatus,
} from '../../renderer';
import { FormControlOptionsService } from '../../renderer/services';
import * as schema from '../../schema';
import {
  DropdownOptions,
  FormControlType,
  FormSheet,
  RendererControl,
  RendererFormControl,
} from '../../schema';
import { FormAction } from '../form-action';
import {
  FormActionButton,
  FormActionModal,
  FormActionModalOptions,
} from '../form-action-modal';
import { LifecycleHookNames, LifecycleHooks, parseScript } from '../lifecycle';
import { FormDetailService } from '../services/form-detail-service';
import { formatVal } from 'cloudpivot/list/src/components/pc/components/queryForm/query-form-util';

// ie11 兼容
if ((window as any).Proxy === undefined) {
  require('../proxy.runtime');
  // (window as any).Proxy = ProxyPolyfill;
}
interface Nodes {
  activityCode: string;
  activityName: string;
  workItemsType: WorkItemsType;
  selected: boolean;
  id: string;
}
enum WorkItemsType {
  // 代办
  WorkItem = 0,
  // 已办
  WorkItemFinished = 1,
  // 待阅
  CirculateItem = 2,
  // 已阅
  CirculateItemFinished = 3,
}

export class FormDetailProxyHandler implements ProxyHandler<FormDetail> {
  private _map: any = {};

  get(target: FormDetail, p: PropertyKey, receiver: any): any {
    if (p === 'submit') {
      return () => this.doAction(target, p);
    }
    if (p === 'doAction') {
      return (code: string) => this.doAction(target, code);
    }
    switch (p) {
      case '$confirm':
      case '$router':
      case '$message':
      case '$i18n':
      case 'actions':
      case 'workflowInfo':
      case 'submited':
      case 'currentUser':
      case 'isNew':
      case 'isDraft':
      case 'inEdit':
      case 'value':
      case 'errors':
      case 'validate':
      case 'formObj':
      case 'axios':
        return (target as any)[p];
      case 'get':
        return (target as any)[p].bind(target);
      default:
        break;
    }
    if (typeof p === 'string') {
      let api = this._map[p];
      if (api) {
        return api;
      }
      const control = target.formRenderer.formControlMap[p];
      if (control) {
        if (!control.controller) {
          control['controller'] =
            target.formRenderer.controller.children[control.key];
        }
        api = new Proxy(control, new FormControlApiHandler());

        this._map[p] = api;

        return api;
      }
    }
  }

  doAction(target: FormDetail, code: string) {
    const ac = target.actions.find((a) => a.code === code);
    if (ac) {
      return target.onAction(ac);
    }
    target.$message.error(`没有${code}权限`);
  }
}

export abstract class FormDetail extends Vue {
  /**
   * 表单按钮列表
   */
  actions: FormActionButton[] = [];

  /**
   * 表单渲染器所属数据
   */
  controls: RendererControl[] = [];

  formControls: RendererFormControl[] = [];

  /**
   * 后端API返回的表单数据
   */
  formObj: form.FormObject = {} as any;

  formRuleList: any[] = [];

  /**
   * 流程表单节点
   */
  nodes: Nodes[] = [];

  /**
   * 根据节点不同相应不同的参数
   */
  nodesParams: any = null;

  /**
   * 转办说明
   */
  comment = '';

  /**
   * 流程实例ID
   */
  workflowInstanceId = '';

  workItemId: string = '';

  workflowVersion: number = 0;

  /**
   * 表单渲染器审批意见控件
   * 移动端的审批意见需要特别处理
   */
  approval: RendererFormControl = '' as any;

  /**
   * 拥有者选人控件
   */
  owner?: RendererFormControl;

  ownerDept?: RendererFormControl;

  /**
   * 事件订阅函数列表
   */
  hooks?: LifecycleHooks;

  /**
   * 自定义表单API代理
   */
  proxy?: any;

  /**
   * 加载自定义表单的iframe
   */
  iframe?: HTMLIFrameElement;

  /**
   * 表单的数据模型信息
   */
  dataModalList: any[] = [];

  formSystemVersion: any = null;

  /**
   * URL query参数
   */
  relevanceQuery?: { [key: string]: string };

  /**
   * 是否进入编辑状态
   */
  inEdit = false;

  formVersion: any = ''; // 流程表单版本号。用于锁表

  isNewSignature: any = null;

  theLatestSignature: any = null;

  customBtn: any; //自定义按钮

  custargus: any;

  visibleOpen: boolean = false;

  customButtomModalCode: string = '';

  viewCodeCustom: string = '';

  approvalOpen: boolean = true; //用于判断是否关闭审批意见弹框

  /**
   * 表单按钮操作后页面跳转处理
   * @param ac
   * @param res
   */
  abstract goto(
    ac: FormActionButton,
    res: form.HttpResponse<any>,
  ): Promise<void>;

  /**
   * 表单校验
   */
  abstract validate(onlyUpload?: boolean): boolean;

  /**
   * 消息组件对象
   */
  abstract $message: any;

  /**
   * 消息组件对象
   */
  abstract $confirm: any;

  /**
   * 定时器
   */
  abstract timer: any;

  /**
   * 是否是移动端
   */
  abstract isMobile: boolean;

  //流程自定义按钮名称
  btnConfigList: any[] = [];

  queryId: any;

  get formRenderer() {
    return this.$refs.formRenderer as any;
  }

  get isWorkflowForm() {
    return !!this.formObj.workflowCode;
  }

  get version() {
    if (this.$store && this.$store.state && this.$store.state.config) {
      return this.$store.state.config.systemVersion;
    } else {
      return '0';
    }
  }

  get workflowInfo() {
    if (!this.isWorkflowForm || !this.formObj) {
      return null;
    }
    return {
      code: this.formObj.workflowCode,
      instanceId: this.formObj.workflowInstanceId,
      instanceName: this.formObj.instanceName,
      tokenId: this.formObj.workflowTokenId,
      itemId: this.formObj.workItemId,
      version: this.formObj.workflowVersion,
      activityCode: this.formObj.activityCode,
      activityName: this.formObj.activityName,
    };
  }

  @Provide()
  getScrollEl() {
    return this.$el;
  }

  /**
   * 是否已提交过
   */
  get submited() {
    if (!this.isWorkflowForm || !this.formObj) {
      return null;
    }
    if (this.isWorkflowForm) {
      return !!this.formObj.workflowInstanceIsSubmit;
    }
    return this.formObj.bizObject.data.sequenceStatus === 'COMPLETED';
  }

  get currentUser() {
    const user = renderer.StaffSelectorControl.service.getCurrentUser() as any;
    return user;
  }

  get formPath() {
    if (this.hooks && this.hooks.controller) {
      return this.hooks.controller;
    }
    return undefined;
  }

  // 是否新建表单
  get isNew() {
    if (this.formObj && this.formObj.bizObject) {
      return (
        this.formObj.bizObject.sequenceStatus === '' &&
        !['readWorkitem', 'unfinishedWorkitem'].includes(
          this.$route.query.workitemType as string,
        )
      );
    }
    return false;
  }

  // 是否草稿
  get isDraft() {
    if (this.formObj && this.formObj.bizObject) {
      return (
        this.formObj.bizObject.sequenceStatus === 'DRAFT' &&
        !['readWorkitem', 'unfinishedWorkitem'].includes(
          this.$route.query.workitemType as string,
        )
      );
    }
    return false;
  }

  // 是否流程表单
  get isWorkFlowSheet() {
    const params: any = this.$route.query;
    return params.isWorkFlow && params.isWorkFlow === 'true';
  }

  // 表单当前值
  get value() {
    const ctrl = this.getFormCtrl();
    return ctrl.value;
  }

  // 错误列表
  get errors() {
    const ctrl = this.getFormCtrl();
    return ctrl.errors;
  }

  get isViewMode() {
    const params = this.$route.query;
    if (params.workflowInstanceId) {
      // 业务表单
      return false;
    }
    if (params.objectId) {
      return false;
    }
    return true;
  }

  get(key: string) {
    const control = this.formRenderer.formControlMap[key];
    if (control) {
      if (platform.IS_IE) {
        control.ctrl = true;
        control.items = true;
      }
      return new Proxy(control, new FormControlApiHandler());
    }
    return undefined;
  }

  /**
   * 获取表单控制器
   */
  getFormCtrl() {
    if (this.formRenderer) {
      return this.formRenderer.controller;
    }
  }

  // 是否新建表单
  isNewForm() {
    if (this.formObj && this.formObj.bizObject) {
      return this.formObj.bizObject.sequenceStatus === '';
    }
    return false;
  }

  getLocale(path: string) {
    return this.$t(`cloudpivot.form.runtime.${path}`).toString();
  }

  /**
   * 根据不同节点加载不同表单
   * @param nodes
   */
  getNodesParams(nodes: string) {
    const theNode = this.nodes.find((res) => res.activityCode === nodes);
    let str = '';
    if (theNode) {
      switch (theNode.workItemsType) {
        case WorkItemsType.WorkItem:
          str = 'unfinishedWorkitem';
          // str = '/workflow-center/my-unfinished-workitem';
          break;
        case WorkItemsType.WorkItemFinished:
          str = 'finishedWorkitem';
          // str = '/workflow-center/my-finished-workitem';
          break;
        case WorkItemsType.CirculateItem:
          str = 'unreadWorkitem';
          // str = '/workflow-center/my-unread-workitem';
          break;
        default:
          str = 'readWorkitem';
          // str = '/workflow-center/my-read-workitem';
          break;
      }
    }
    if (str && theNode) {
      this.nodesParams = {
        return: str,
        workitemId: theNode.id,
      };
    }
  }

  /**
   * 重新加载数据
   */
  reload() {
    this.clean();
    this.load();
  }

  /**
   * 清理
   */
  clean(excludeNode?: boolean) {
    this.formObj = {} as any;
    this.comment = '';
    this.controls = [];
    this.actions = [];
    this.proxy = null;
    if (excludeNode) {
      return;
    }
    this.nodesParams = null;
    this.nodes = [];
  }

  /**
   * 查找上传控件按上传状态
   */
  findUploadBy(status: UploadStatus) {
    const controls = this.formRenderer.findFormControls();

    const control = controls.find((c: any) => {
      return (
        [FormControlType.Attachment, FormControlType.Image].includes(c.type) &&
        c.controller &&
        c.controller.value &&
        c.controller.value.some((f) => f.status === status)
      );
    });
    if (control) {
      return control;
    }

    return controls.find((c: any) => {
      if (
        !this.formRenderer.controller ||
        ![FormControlType.Sheet].includes(c.type)
      ) {
        return false;
      }

      const ctrl = this.formRenderer.controller.children[c.key];
      const vals = ctrl.value;
      if (!Array.isArray(vals) || vals.length === 0) {
        return false;
      }
      const uploadKeys = (c as any).columns.map(
        (col: any) =>
          col.key &&
          [FormControlType.Attachment, FormControlType.Image].includes(
            col.type,
          ),
      ) as string[];
      if (uploadKeys.length === 0) {
        return false;
      }

      return vals.some((row) => {
        return uploadKeys.some(
          (k) => row[k] && row[k].some((f: UploadFile) => f.status === status),
        );
      });
    });
  }

  // 获取流程节点
  async getWorkFlowNodes() {
    const params: any = this.$route.query;
    const workflowInstanceId: string = params.workflowInstanceId;
    const res = await formApi.getWorkFlowNode(workflowInstanceId);
    if (res.errcode === 0 && res.data) {
      return res.data;
    }
    return [];
  }

  // 向iframe弹窗父页面传递事件
  parentWindowAction(type: string) {
    let user: any = sessionStorage.getItem('user');
    if (user) {
      user = JSON.parse(user);
    }
    localStorage.removeItem(`${user.name}_latestSign`);
    window.parent.postMessage(type, origin);
  }

  // 关闭弹窗
  closePopDetail() {
    if (window.top !== window.self) {
      // window.parent.postMessage('close', origin);
      this.parentWindowAction('close');
    } else {
      let user: any = sessionStorage.getItem('user');
      if (user) {
        user = JSON.parse(user);
      }
      localStorage.removeItem(`${user.name}_latestSign`);

      /**
       * 钉钉浏览器不支持close(),单独处理
       */
      if (dd.biz && (dd.android || dd.ios)) {
        dd.biz.navigation.goBack({
          onSuccess: () => {
            console.log('关闭成功!');
          },
          onFail: () => {
            console.error('关闭失败');
          },
        });
      } else if (dd && dd.pc && !this.isMobile) {
        // pc钉钉
        this.back();
      } else {
        //Else Empty block statement
        this.back();
      }
    }
  }

  // 返回上一级
  back() {
    const url = this.$route.query.return as string;
    if (url) {
      this.$router
        .push({
          path: url,
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      this.$router.go(-1);
    }
  }

  // 兼容性处理，存储的string需要转换为表单使用的boolean
  stringToBoolean(changePublishJson: any[]) {
    Object.values(changePublishJson).forEach((el: any) => {
      // 导入文件，下面changeArr数据里面的值会修改为字符串类型，实际需要布尔类型的值
      const changeArr = [
        'isScan',
        'readonlyFormula',
        'visible',
        'multi',
        'displayEmpty',
        'noRepeat',
      ];
      changeArr.forEach((item) => {
        if (typeof el.options[item] === 'string') {
          el.options[item] = el.options[item] === 'true';
        }
      });

      if (el.type === 201) {
        // 子表
        el.columns.forEach((column: any) => {
          changeArr.forEach((item) => {
            if (typeof column.options[item] === 'string') {
              column.options[item] = column.options[item] === 'true';
            }
          });
        });
      }
    });
  }

  /**
   * 表单加载入口
   */
  async load(edit?: boolean) {
    //表单初始化时将计算规则状态、数据联动状态设置为完成
    localStorage.setItem('isComputeFormulComplete', 'true');
    localStorage.setItem('isDataLinkageComplete', 'true');

    const params = this.getLoadParams(edit);
    const res: any = await formApi.load(params);

    // 错误处理
    if (res.errcode !== 0 || !res.data) {
      this.showErrorInfo(res);
      throw res;
    }

    // 表单数据版本，用来做表单锁
    this.formVersion = res.data.bizObject.data.version;

    // 记录流程id
    this.workItemId = res.data.workItemId;

    if (res.data && res.data.bizSheet) {
      // 表单版本
      this.formSystemVersion = res.data.bizSheet.formSystemVersion;
    }

    // 获取数据规则列表
    await this.getFormRuleList(res.data.bizObject.schemaCode);

    // 是否显示审批意见控件
    this.setShowCheck(res);

    FormDetailService.setReplayToken(this.formPath); // 设置 replayToken

    // 同步模型属性
    res.data.bizSheet.publishedAttributesJson =
      await this.handleChangePublishJson(
        res.data.bizSchema,
        JSON.parse(res.data.bizSheet.publishedAttributesJson),
      );

    this.formObj = res.data;

    /**
     * 进入草稿状态下的流程表单，inEdit的状态是编辑状态
     * 处于“填写申请单”节点的流程表单，inEdit的状态是编辑状态
     */
     const logInfoList = this.formObj.logInfoList;
     if (
       (logInfoList && (logInfoList[logInfoList.length - 1].activityCode === 'Activity2' || logInfoList[logInfoList.length - 1].activityName === '填写申请单')) ||
       (this.formObj.bizObject.sequenceStatus === 'DRAFT' && this.formObj.bizObject.workflowInstanceId)
     ) {
       this.inEdit = true;
     }

    // 表单数据项列表
    this.dataModalList = this.formObj.bizSchema.properties;

    const actionObj = this.formObj.formPermission.actionPermission;
    this.actions = this.getActions(Object.assign({}, actionObj));

    //新增状态下执行无其他数据项关联的计算规则
    await this.RuleImplement();

    // 设置自定义按钮配置
    this.setBtnConfigList(res);

    // 初始化填充系统字段
    this.initSystemFieldValue(res);

    // 第一次进入表单时：弹窗提示转办、加签、传阅、协办来源信息
    this.setCommentInfo();

    //流程按钮自定义名称匹配
    this.setCustomBtnShowName();

    //添加自定义按钮
    this.addCustomBtn();

    // 获取最后一次上传的手写签名
    this.getLatestHandSign();

    //获取常用审批状态
    this.getOpinionState(res.data);

    // 1自定义表单
    const formDefine = this.formObj.bizSheet;
    if (formDefine.sheetType === 1) {
      await this.loadCustomForm(formDefine.pcUrl);
    } else {
      await this.initSystemForm();
    }

    return res;
  }

  //新增状态下执行无其他数据项关联的计算规则
  async RuleImplement() {
    if (
      this.formRuleList &&
      this.formRuleList.length > 0 &&
      !this.formObj.bizObject.loadedFromDb
    ) {
      try {
        for (const con of this.formRuleList) {
          const opt = con.options;
          let ImplementOpen = true;
          if (con.options && opt.shortTextStitch) {
            for (const x of this.dataModalList) {
              if (opt.shortTextStitch.indexOf(x.code) > -1) {
                ImplementOpen = false;
                break;
              }
            }
            if (ImplementOpen) {
              const bizRuleCalculate = {
                dataParamsMap: {},
                expression: JSON.parse(opt.shortTextStitch).formula,
                propertyCode: con.propertyCode,
                schemaCode: con.schemaCode,
              };
              await formApi
                .getComputeFormulaVal(bizRuleCalculate)
                .then((res: any) => {
                  if ((res && res.errcode === 0) || res.errcode === 101005) {
                    const dataItemList = JSON.parse(
                      this.formObj.bizSheet.publishedAttributesJson,
                    );
                    let dataItem =
                      dataItemList[con.propertyCode] ||
                      dataItemList[con.schemaCode];
                    //tab页下特殊处理
                    if (!dataItem) {
                      for (const tabsItem in dataItemList) {
                        if (tabsItem) {
                          if (dataItemList[tabsItem].type === 500) {
                            for (const x of dataItemList[tabsItem].panels) {
                              dataItem =
                                x.controls[con.propertyCode] ||
                                x.controls[con.schemaCode];
                              if (dataItem) {
                                break;
                              }
                            }
                          }
                          if (dataItem) {
                            break;
                          }
                        }
                      }
                    }
                    if (dataItem) {
                      switch (dataItem.type) {
                        case 201:
                          const arr: any[] = [];
                          for (
                            let i = 0;
                            i < Number(dataItem.options.rows);
                            i++
                          ) {
                            const arrItem: any = {};
                            for (const y of dataItem.columns) {
                              arrItem[y.key] = null;
                              if (y.key === con.propertyCode) {
                                arrItem[y.key] = this.RuleImplementData(
                                  y.type,
                                  res,
                                );
                              }
                            }
                            arr.push(arrItem);
                          }
                          this.formObj.bizObject.data[con.schemaCode] = arr;
                          break;
                        default:
                          this.formObj.bizObject.data[con.propertyCode] =
                            this.RuleImplementData(dataItem.type, res);
                          break;
                      }
                    }
                  }
                })
                .catch((err: any) => {
                  console.log('获取计算值失败', err);
                });
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  //执行无其他数据项关联的计算规则数据类型的处理
  RuleImplementData(type: number, res: any) {
    let item: any = null;
    switch (type) {
      case 1:
      case 2:
        item = res.data || res.data === false ? String(res.data) : '';
        break;
      case 4:
        if (res.data || res.data === 0) {
          item = Number(res.data);
        } else {
          item = null;
        }
        break;
      case 3:
        item = res.data
          ? res.data.length === 10
            ? new Date(res.data + ' 0:00')
            : new Date(res.data)
          : new Date();
        break;
      default:
        item = res.data;
        break;
    }
    return item;
  }

  // 设置自定义按钮配置
  setBtnConfigList(res) {
    if (res.data && res.data.formPermission) {
      this.btnConfigList = res.data.formPermission.btnConfigList || [];
      if (this.btnConfigList.length > 0) {
        sessionStorage.setItem(
          'btnConfigList',
          JSON.stringify(this.btnConfigList),
        );
      } else {
        sessionStorage.removeItem('btnConfigList');
      }
    }
  }

  // 初始化填充系统字段
  initSystemFieldValue(res) {
    if (this.isNew || (this.inEdit && !this.workflowInfo)) {
      let user: any = sessionStorage.getItem('user');
      if (user) {
        user = JSON.parse(user);
      }
      const modifier = {
        departmentId: user.departmentId,
        departments: user.departments,
        excelType: user.excelType,
        id: user.id,
        imgUrl: user.imgUrl,
        name: user.name,
        parentId: user.parentId,
        type: user.type,
        unitType: user.unitType,
      };
      res.data.bizObject.data = Object.assign(res.data.bizObject.data, {
        modifier: [modifier],
        createdTime: res.data.bizObject.data.createdTime
          ? res.data.bizObject.data.createdTime
          : dateFormatter(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        modifiedTime: res.data.bizObject.data.modifiedTime
          ? res.data.bizObject.data.modifiedTime
          : dateFormatter(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      });
    }
  }

  // load接口加载错误弹窗
  showErrorInfo(res) {
    let msg = '';
    switch (res.errcode) {
      case 550005:
        msg =
          res.errmsg ||
          this.$t('cloudpivot.form.runtime.tip.errTips19').toString();
        break;
      case 550007:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips14').toString();
        break;
      case 550008:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips15').toString();
        break;
      case 550006:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips16').toString();
        break;
      case 550009:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips17').toString();
        break;
      case 600018:
      case 550009:
      case 302034:
      case 40002:
      case 601010:
        msg = res.errmsg as string;
        break;
      default:
        break;
    }
    if (msg) {
      this.$message.error(msg, 3);
    }
  }

  // 获取load接口所需参数
  getLoadParams(edit?: boolean) {
    let params: any = cloneDeep(this.$route.query);
    delete params.useData;
    this.workflowInstanceId = (params.workflowInstanceId as string) || '';
    const relevanceQuery: any = Object.assign({}, params);
    delete relevanceQuery.return;
    delete relevanceQuery.startWorkflowCode;
    delete relevanceQuery.workItemId;
    delete relevanceQuery.workitemId;
    delete relevanceQuery.workflowInstanceId;
    delete relevanceQuery.objectId;
    delete relevanceQuery.schemaCode;
    delete relevanceQuery.sheetCode;
    delete relevanceQuery.ssc;
    delete relevanceQuery.isWorkFlow;
    this.relevanceQuery = relevanceQuery as any;
    const keys = Object.keys(relevanceQuery);
    if (keys.length > 0) {
      params.relevanceInfo = JSON.stringify(relevanceQuery);
    }
    if (edit || this.$route.query.edit || this.isViewMode) {
      // 流程表单 非编辑 不要 params.perms
      params.perms = 'edit';
      this.inEdit = true;
    } else {
      this.inEdit = false;
    }
    if (this.nodesParams) {
      params = Object.assign({}, params, this.nodesParams);
    }
    if (params.workitemType) {
      params.return = params.workitemType;
    }
    if (params.workflowMock) {
      // 流程模拟load增加标识参数simulative
      params.simulative = true;
    }
    if (this.$route.query.isFromTips) {
      delete params.return;
    }
    return params;
  }

  // 获取最后一次上传的手写签名
  async getLatestHandSign() {
    let user: any = sessionStorage.getItem('user');
    const res3 = await formApi.getLatestHandSign();
    if (res3 && !(res3 as any).errcode && res3.data) {
      this.theLatestSignature = JSON.parse(JSON.stringify(res3.data));
      if (user) {
        user = JSON.parse(user);
        localStorage.setItem(
          `${user.name}_latestSign`,
          JSON.stringify(res3.data),
        );
      }
    }
  }

  // 第一次进入表单时：弹窗提示转办、加签、传阅、协办来源信息
  setCommentInfo() {
    if (this.formObj.commentInfo) {
      const comment = this.formObj.commentInfo;
      if (comment.originator) {
        let type: any = '';
        let names: any[] = [];
        let name: any = {};
        switch (comment.type) {
          case 1: // 转办
            names = this.btnConfigList.filter((x) => x.code === 'forward');
            name = names[0];
            type =
              name && name.displayName && name.displayName !== '转办'
                ? names[0].displayName
                : this.$t('cloudpivot.flow.pc.WorkflowActionStatus.Forward');
            break;
          case 2: // 协办
            names = this.btnConfigList.filter((x) => x.code === 'assist');
            name = names[0];
            type =
              name && name.displayName && name.displayName !== '协办'
                ? names[0].displayName
                : this.$t('cloudpivot.flow.pc.WorkflowActionStatus.Assist');
            break;
          case 3: // 加签
            names = this.btnConfigList.filter(
              (x) => x.code === 'adjustParticipant',
            );
            name = names[0];
            type =
              name && name.displayName && name.displayName !== '加签'
                ? names[0].displayName
                : this.$t(
                    'cloudpivot.flow.pc.WorkflowActionStatus.AdjustParticipant',
                  );
            break;
          case 4: // 传阅
            names = this.btnConfigList.filter((x) => x.code === 'circulate');
            name = names[0];
            type =
              name && name.displayName && name.displayName !== '传阅'
                ? names[0].displayName
                : this.$t(
                    'cloudpivot.flow.pc.WorkflowActionStatus.Circularize',
                  );
            break;

          default:
            break;
        }
        const msg = `${comment.originator.name}${type}${this.$t(
          'cloudpivot.flow.pc.giveYou',
        )}：${comment.comment || ''}`;
        this.comment = msg;
      }
    }
  }

  // 是否显示审批意见
  setShowCheck(res) {
    if (res.data.formPermission.actionPermission.showCheck) {
      res.data.showCheck = true;
    } else {
      res.data.showCheck = false;
    }

    if (this.btnConfigList.length > 2 && res.data.showCheck) {
      try {
        if (
          !this.btnConfigList[0].commentPermission.visible &&
          !this.btnConfigList[0].attachmentPermission.visible &&
          !this.btnConfigList[0].signPermission.visible &&
          !this.btnConfigList[1].commentPermission.visible &&
          !this.btnConfigList[1].attachmentPermission.visible &&
          !this.btnConfigList[1].signPermission.visible
        ) {
          res.data.showCheck = false;
        }
      } catch (err) {}
    }
  }

  // 按钮自定义名称
  setCustomBtnShowName() {
    for (const con of this.actions) {
      for (const x of this.btnConfigList) {
        if (con.code === x.code) {
          if (x.displayName) {
            con.text = x.displayName;
          }
        }
        if (
          con.code === 'showReject' &&
          x.code === 'rejects' &&
          x.displayName
        ) {
          con.text = x.displayName;
        }
      }
    }
  }

  // 添加自定义按钮
  addCustomBtn() {
    const customBtnTime = setInterval(() => {
      if ((window as any).h3form) {
        const isNews = (window as any).h3form.isNew;
        if (!isNews) {
          this.customBtn = this.formObj.formPermission.customButtons;
          if (
            this.customBtn &&
            Array.isArray(this.customBtn) &&
            this.customBtn.length > 0
          ) {
            this.customBtn.forEach((x) => {
              this.actions.push({
                code: x.code,
                disabled: false,
                visible: true,
                loading: false,
                custom: true,
                hint: x.hint,
                text: x.name,
              });
            });
          }
        }
        clearInterval(customBtnTime);
      }
    }, 150);
  }

  // 获取常用审批状态
  async getOpinionState(data: any) {
    if (!data.workItemId || !data.workflowInstanceId) {
      return;
    }
    const params: any = {
      workitemId: data.workItemId,
      workflowInstanceId: data.workflowInstanceId,
    };
    const res: any = await workflowApi.getOpinionState(params);
    if (res.errcode === 0) {
      sessionStorage.setItem(
        'commonCommentSwitch',
        res.data.commonCommentSwitch,
      );
      return;
    }
    sessionStorage.setItem('commonCommentSwitch', 'false');
  }

  /**
   * 初始化iframe
   * @param {string} url
   * @return iframe
   * @memberof FormDetail
   */
  initIframe(url: string) {
    // location.href = url;
    const iframe = document.createElement('iframe');
    iframe.width = '0';
    iframe.height = '0';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.bottom = '0';
    iframe.style.zIndex = '9999';
    iframe.style.background = '#fff';
    iframe.src =
      url + (url.indexOf('?') > -1 ? '&' : '?') + `t=${new Date().getTime()}`;
    this.iframe = iframe;
    this.$el.appendChild(iframe);
    if (iframe.contentWindow) {
      const iframeWindow = iframe.contentWindow as any;
      iframeWindow.axios = axios;
    }
    return iframe;
  }

  /**
   * 加载自定义表单
   * @param url
   */
  async loadCustomForm(url: string) {
    try {
      const res = await axios.get(url);
    } catch {
      throw new Error('无法加载自定义表，请检查url配置');
    }
    return new Promise((resolve, reject) => {
      const _this = this;
      (window as any).initCustomForm = (tpl: any) => {
        _this.initCustomForm(tpl);
        // @ts-ignore
        resolve();
      };

      this.initIframe(url);
    });
  }

  /**
   * 初始化自定义表单
   * @param tpl
   */
  async initCustomForm(tpl: any) {
    if (tpl.styles) {
      tpl.styles.forEach((s: any) => this.$el.appendChild(s));
    }

    if (tpl.scripts) {
      tpl.scripts.forEach((s: any) => this.$el.appendChild(s));
    }

    if (tpl.toolbar) {
      tpl.toolbar.forEach((x: any) => {
        x.visible = true;
        x.disabled = false;
        this.actions.push(x);
      });
    }

    this.hooks = tpl.customScript;

    const controls = components.FormRendererHelper.convertTemplate(
      tpl.template,
    );
    await this.initForm(controls);
  }

  // 获取数据规则列表
  getFormRuleList(schemaCode: string) {
    const params: any = {
      schemaCode,
    };
    return new Promise((resolve, reject) => {
      bizpropertyApi.getDataRules(params).then((res) => {
        if (res.errcode === 0) {
          this.formRuleList = res.data;
          resolve(res.data);
        }
      });
    });
  }

  /**
   * 初始化系统表单
   */
  async initSystemForm() {
    const formDefine = this.formObj.bizSheet;
    //获取数据模型中关联表单配置的字段引用信息
    const schemaCode: any = this.formObj.bizObject.schemaCode || '';
    // 获取数据模型中关联表单配置的字段引用
    const { data, errcode, errmsg } = await formApi.getRelativeQuote({
      schemaCode,
    });

    let qouteList: Array<any> = [];
    if (errcode === 0) {
      qouteList = data;
    }
    //处理日期控件默认值
    const jsonData: any = JSON.parse(formDefine.publishedAttributesJson);
    const formControls: any = components.FormRendererHelper.handleDataDefault(
      this.formObj.bizSchema.properties,
      jsonData,
      qouteList,
    );

    if (formControls['owner']) {
      formControls['owner'].options.mappings
        ? (formControls['owner'].options.mappings +=
            'departments:{ownerDeptId};')
        : (formControls['owner'].options.mappings =
            'departments:{ownerDeptId};');
    }

    if (this.$route.query.key) {
      formControls[this.$route.query.key as any].options['readonlyFormula'] =
        true;
    }
    const layout = JSON.parse(formDefine.publishedViewJson) as string[][];

    this.handleApproval(formControls, layout);

    // 添加表单设计中添加的自定义样式、脚本、钩子函数、按钮
    this.addFormDesignCustom(formDefine);

    const controls = components.FormRendererHelper.convertDesign(
      formControls,
      layout,
    );

    // 给子表添加rowStatus列
    this.addSheetRowStatusColumns(formControls);

    await this.initForm(controls);
  }

  // 给子表添加rowStatus列
  addSheetRowStatusColumns(formControls) {
    const _rowStatus: any = {
      key: 'rowStatus',
      options: {
        dataItemName: 'rowStatus',
        dataLinkage: '',
        defaultValue: 'Unchanged',
        displayFormula: '',
        isScan: false,
        maxLength: 200,
        name: 'rowStatus',
        name_i18n: '',
        noRepeat: false,
        onChange: '',
        placeholder: '',
        readonlyFormula: false,
        regexp: '',
        regexpText: '',
        requiredFormula: '',
        shortTextStitch: '',
        style: '',
        tips: '',
        visible: false,
        widgetType: '',
        width: 150,
      },
      required: false,
      type: 1,
      width: 150,
      writable: true,
    };
    for (const i in formControls) {
      if (formControls[i].type === schema.FormControlType.Sheet) {
        const rowStatus: any = {
          parentKey: formControls[i].key,
          ..._rowStatus,
        };
        formControls[i].columns.unshift(rowStatus);
      }

      if (formControls[i].type === schema.FormControlType.Tabs) {
        for (const x of formControls[i].panels) {
          for (const con in x.controls) {
            if (x.controls[con].type === schema.FormControlType.Sheet) {
              const rowStatus: any = {
                parentKey: x.controls[con].key,
                ..._rowStatus,
              };
              x.controls[con].columns.unshift(rowStatus);
            }
          }
        }
      }
    }
  }

  // 添加表单设计中添加的自定义样式、脚本、钩子函数、按钮
  addFormDesignCustom(formDefine) {
    if (formDefine.publishedActionsJson) {
      // 表单自定义按钮
      const actions = JSON.parse(formDefine.publishedActionsJson);
      if (actions && actions.length > 0) {
        this.actions = this.actions.concat(actions);
      }
    }

    if (formDefine.publishedHtmlJson) {
      const els = JSON.parse(
        formDefine.publishedHtmlJson,
      ) as schema.FormElement[];
      if (els && els.length > 0) {
        const scriptEl = els.find((e) => e.id === 'customScript');
        if (scriptEl && scriptEl.innerHTML) {
          // 钩子函数
          this.hooks = parseScript(scriptEl.innerHTML);
        }

        // 加载 表单html设计中添加的自定义样式、脚本
        const tags = ['style', 'script'];

        els.forEach((el) => {
          if (tags.includes(el.tagName) && el.id !== 'customScript') {
            const oDom = schema.createHTMLElement(el);
            if (oDom) {
              this.$el.appendChild(oDom);
            }
          }
        });
      }
    }
  }

  // 序列化 数据规则
  ruleChange(list: any) {
    const arr: any[] = [];
    list.forEach((d: any) => {
      //修改为不去重，因为主表与子表编码可能出现重复
      d.options = d.options ? JSON.parse(d.options) : {};
      arr.push(d);
    });
    return arr;
  }

  // 同步模型属性、数据规则属性
  async handleChangePublishJson(soure: any, data: any) {
    const modelData = this.modelChange(cloneDeep(soure.properties));
    const ruleData: any[] = this.ruleChange(this.formRuleList || []);

    for (const i in data) {
      if (data.hasOwnProperty(i)) {
        const modelFilter = modelData.find((o: any) => o.code === i);
        if (modelFilter && modelFilter.options) {
          //同步数据模型到大JSON中
          this.syncModelAttr(modelFilter, data[i].options);
        }

        //主表数据项匹配计算规则数据需要加上schemaCode匹配
        const ruleFilter = ruleData.filter(
          (o: any) => o.propertyCode === i && o.schemaCode === soure.code,
        );

        ruleFilter.forEach((el: any) => {
          if (el && el.options) {
            data[i].options = Object.assign(data[i].options, el.options);
          }
        });

        if (data[i].type === schema.FormControlType.Tabs) {
          this.changeTabs(data[i], modelData, ruleData);
        }
        if (data[i].type === schema.FormControlType.Sheet) {
          this.sheetChange(data[i], modelData, ruleData);
        }
      }
    }

    this.stringToBoolean(data);
    return JSON.stringify(data);
  }

  modelChange(list: any) {
    // @ts-ignore
    list.forEach((i) => {
      if (i.subSchema && i.subSchema.properties) {
        // @ts-ignore
        list = list.concat(
          i.subSchema.properties.filter((v) => !v.defaultProperty),
        );
      }
    });
    return list;
  }

  // 同步子表模型属性、数据规则属性
  sheetChange(data: any, modelData: any, ruleData: any) {
    const rule = ruleData.find((o: any) => o.propertyCode === data.key);
    if (rule && rule.options) {
      data.options = Object.assign(data.options, rule.options);
    }
    if (data.columns) {
      data.columns.forEach((v: any) => {
        const filter = modelData.find(
          (c: any) => c.code === v.key && c.schemaCode === data.key,
        );
        //子表中数据项匹配计算规则数据需要增加o.schemaCode === v.parentKey，否则可能匹配到主表的数据项导致计算混乱
        const ruleFilter = ruleData.filter(
          (o: any) => o.propertyCode === v.key && o.schemaCode === v.parentKey,
        );
        if (filter && filter.options) {
          //同步数据模型到大JSON中
          this.syncModelAttr(filter, v.options);
        }

        ruleFilter.forEach((el: any) => {
          if (el && el.options) {
            v.options = Object.assign(v.options, el.options);
          }
        });
      });
    }
  }

  // 同步tab下控件模型属性、数据规则属性
  changeTabs(tab: any, modelData: any, ruleData: any) {
    if (tab.panels && Array.isArray(tab.panels)) {
      tab.panels.forEach((i: any) => {
        if (i.controls) {
          for (const o in i.controls) {
            if (i.controls[o].type === schema.FormControlType.Tabs) {
              this.changeTabs(i.controls[o], modelData, ruleData);
            } else if (i.controls[o].type === schema.FormControlType.Sheet) {
              //子表
              this.sheetChange(i.controls[o], modelData, ruleData);
            } else {
              const filters = modelData.find(
                (c: any) => c.code === i.controls[o].key,
              );
              const ruleFilter = ruleData.filter(
                (c: any) => c.propertyCode === i.controls[o].key,
              );
              if (filters && filters.options) {
                //同步数据模型到大JSON中
                this.syncModelAttr(filters, i.controls[o].options);
              }
              ruleFilter.forEach((el: any) => {
                if (el && el.options) {
                  i.controls[o].options = Object.assign(
                    i.controls[o].options,
                    el.options,
                  );
                }
              });
            }
          }
        }
      });
    }
  }

  /**
   * 迭代20需求
   * 将表单中的审批意见控件去除，并根据操作按钮添加固定key值的审批意见
   */
  handleApproval(controls: any, layout: string[][]) {
    layout.forEach((row, ri) => {
      row
        .map((col, ci) => {
          const c = controls[col];
          if (c && c.type === FormControlType.ApprovalOpinion) {
            return ci;
          }
          return -1;
        })
        .filter((i) => i !== -1)
        .reverse()
        .forEach((i) => row.splice(i, 1));
    });

    layout
      .map((row, i) => (row.length === 0 ? i : -1))
      .filter((i) => i !== -1)
      .reverse()
      .forEach((i) => layout.splice(i, 1));

    if (this.formObj.showCheck) {
      const key = '$approval';

      if (!this.isMobile) {
        const groupControlOpts = new schema.GroupTitleOptions();
        groupControlOpts.name = this.$t(
          'cloudpivot.form.renderer.opinion',
        ).toString();
        const groupControl = {
          key: key + '_group',
          options: groupControlOpts,
          type: FormControlType.Group,
        };
        controls[groupControl.key] = groupControl;
        layout.push([groupControl.key]);
      }

      const options = new schema.ApprovalOpinionOptions();
      if (this.isMobile) {
        options.visible = false;
      }
      options.name = this.$t('cloudpivot.form.renderer.opinion').toString();
      options.limit = schema.UploadLimitType['10M'];

      // @ts-ignore
      options.commonCommentSwitch = this.formObj.commonCommentSwitch;

      const control = {
        key,
        options,
        type: FormControlType.ApprovalOpinion,
        required: false,
      };

      controls[key] = control;

      this.approval = control as any;
      layout.push([key]);
    }
  }

  /**
   * 初始化表单
   * @param controls
   */
  async initForm(controls: any) {
    // 全局添加一个axios，用于给 html模式的表单设计中二开代码使用
    (window as any).axios = axios;

    const formControls: RendererFormControl[] = [];
    components.FormRendererHelper.findFormControl(controls, formControls);
    this.formControls = formControls;

    // 设置标题
    const titleControl = formControls.find(
      (c) => c.type === FormControlType.Title,
    );
    if (titleControl && this.formObj.instanceName) {
      titleControl.options.name = this.formObj.instanceName;
    }

    // 设置拥有者部门
    if (!this.formObj.bizObject.data.owner) {
      const user =
        renderer.StaffSelectorControl.service.getCurrentUser() as any;
      this.formObj.bizObject.data.ownerDeptId = user.departments;
    }

    //自定义按钮赋值（todo:获取到得 addDataCustom 不一定是当前表单的，需要修改）
    // 示例场景：A、B两个表单都有自定义按钮，先打开A表单，再打开B表单，然后刷新A表单，A表单拿到的addDataCustom就是B表单的
    if (this.$route.query && this.$route.query.customButtonOpen) {
      let addDataCustom: any = window.sessionStorage.getItem('addDataCustom');
      if (addDataCustom) {
        addDataCustom = JSON.parse(addDataCustom);
        for (const adc of addDataCustom) {
          this.formObj.bizObject.data[adc.targetDataItemCode] =
            adc.targetDataItemValue;
        }
      }
    }

    const data = this.formObj.bizObject.data;
    data.schemaCode = this.formObj.bizObject.schemaCode;
    data.sheetCode = this.formObj.bizObject.sheetCode;

    // 调用html模式的表单设计中OnLoad()方法: 数据加载后，渲染之前: 可以对表单数据进行修改
    await this.runHtmlOnload();

    // 将API数据转换为表单控件数据
    this.toFormData(controls, this.formObj.bizObject.data);

    // 提交并继续创建 勾选了保存提交内容:使用上一次提交的数据
    this.createAddUseOldData(formControls);

    //甘特图相关
    this.ganttInfo();

    // 权限合成：生成控件的权限
    components.FormRendererHelper.synthetize(
      formControls,
      this.formObj.bizObject.data,
      this.formObj.formPermission.dataPermissions,
      this.isNew,
    );
    this.controls = controls;

    // 调用html模式的表单设计中onRendered()方法: 渲染完成后
    this.onRendered([data]);
  }

  // 对于甘特图，query.key：parentForm.key 父级表单的key
  // 自动给表单增加父级表单的关联
  ganttInfo() {
    if (this.$route.query.key) {
      this.formObj.bizObject.data[this.$route.query.key as any] = {
        id: this.$route.query.relId,
        relativePropertyCode: this.$route.query.relPropertyCode,
        schemaCode: this.$route.query.relSchemacode,
      };
      this.formObj.bizObject.data.parentId = this.$route.query.relId;
    }
  }

  // 提交并继续创建 勾选了保存提交内容:使用上一次提交的数据
  createAddUseOldData(formControls) {
    const useData: string = (this.$route.query.useData as string) || '';
    if (useData) {
      let oldData: any = localStorage.getItem(useData) as string;
      if (oldData) {
        oldData = JSON.parse(oldData);
        delete oldData.id;

        const formatData = function (
          oldData: any,
          isSub = false,
          sheetCode = '',
        ) {
          Object.keys(oldData).forEach((key) => {
            let item = formControls.find((el: any) => el.key === key);
            if (isSub) {
              const sheet: any = formControls.find(
                (el: any) => el.key === sheetCode,
              );
              item = sheet.columns.find((el: any) => el.key === key);
            }

            // 地址控件
            if (
              item &&
              [11].includes(item.type) &&
              typeof oldData[key] === 'string' &&
              oldData[key].indexOf('lat') !== -1
            ) {
              try {
                oldData[key] = JSON.parse(oldData[key]);
              } catch (error) {}
            }

            if (item && [9, 10, 15].includes(item.type)) {
              // 附件、签名、图片不使用历史数据
              delete oldData[key];
            }

            // 时间格式
            if (item && [3].includes(item.type) && oldData[key]) {
              oldData[key] = new Date(oldData[key]);
            }

            // 子表
            if (item && [201].includes(item.type)) {
              oldData[key].forEach((element: any) => {
                formatData(element, true, key);
              });
            }
          });
        };
        formatData(oldData);

        this.formObj.bizObject.data = Object.assign(
          this.formObj.bizObject.data,
          oldData,
        );
        localStorage.removeItem(useData);
        // @ts-ignore
        this.isSaveAndCreate = true;
      }
    }
  }

  // 执行html模式的表单设计中的 onLoad 方法
  async runHtmlOnload() {
    let tasks = this.callLifecycleHook(LifecycleHookNames.OnLoad, [
      this.formObj.bizObject.data,
      this.formObj.formPermission.dataPermissions,
    ]);

    if (tasks) {
      // 如果返回一个promise，将promise的返回值覆盖到表单数据
      tasks = tasks.filter((r) => r && r.then);
      if (tasks.length > 0) {
        const results = await Promise.all(tasks);
        if (results[0]) {
          this.formObj.bizObject.data = results[0];
        }
      }
    }
  }

  editing(addSave?: boolean) {
    this.$nextTick(() => {
      this.formRenderer.edit();
    });

    const btnSave = {
      code: FormAction.Save,
      disabled: false,
      visible: true,
      text: this.getLocale(`action.${FormAction.Save}`),
    };
    // 流程外链表单不追加暂存按钮
    if (this.isWorkflowForm && addSave && !(window as any).isExternal) {
      const index = this.actions.findIndex((ac) => ac.code === FormAction.Save);
      if (index === -1) {
        this.actions.splice(0, 0, btnSave);
      }
    }
  }

  // 渲染完成
  onRendered(args: any) {
    setTimeout(() => {
      if (this.formRenderer) {
        if (this.isWorkflowForm) {
          // 如果是系统管理员，所有表单控件都是可写的
          if (this.inEdit) {
            if (this.currentUser.isAdmin) {
              const formControls: RendererFormControl[] = [];
              components.FormRendererHelper.findFormControl(
                this.controls,
                formControls,
              );
              for (const control of formControls) {
                control.writable = true;
                if (control.type === schema.FormControlType.Sheet) {
                  (control as any).columns.forEach(
                    (col: any) => (col.writable = true),
                  );
                }
              }
            }
          }
          this.editing(this.inEdit);
        } else {
          const canEdit =
            this.formObj.formPermission.actionPermission[FormAction.Edit];
          if (!this.formObj.bizObject.sequenceStatus) {
            this.editing();
          } else if (this.inEdit && canEdit) {
            this.editing();
          } else {
            //Else Empty block statement
          }
        }
        const controls = this.formRenderer.findFormControls();

        setTimeout(() => {
          if (this.relevanceQuery) {
            // 关联查询
            const keys = Object.keys(this.relevanceQuery);
            const rfControls = controls.filter(
              (c: any) =>
                (c.type === schema.FormControlType.RelevanceForm ||
                  c.type === schema.FormControlType.RelevanceFormEx) &&
                keys.indexOf(c.key) > -1,
            );

            for (const c of rfControls) {
              const item = this.formObj.bizObject.data[c.key];
              if (!item) {
                continue;
              }

              const val = Object.assign({}, item);
              const ctrl = c.controller as RadioControl;
              const mappings = (ctrl.options as any).mappings;
              if (mappings) {
                for (const key in mappings) {
                  if (val[key] === undefined) {
                    continue;
                  }
                  const target = mappings[key];
                  const control = controls.find(
                    (itemObj: any) =>
                      itemObj.key ===
                      (Array.isArray(target) ? target[0] : target),
                  );
                  if (control) {
                    if (
                      control.type === schema.FormControlType.Sheet &&
                      Array.isArray(val[key])
                    ) {
                      (control as any as schema.FormSheet).columns.forEach(
                        (col) => {
                          for (const row of val[key]) {
                            delete row.id;
                            row[col.key] = this.convertFormControlValue(
                              key,
                              col,
                              row[col.key],
                            );
                          }
                        },
                      );
                    }

                    val[key] = this.convertFormControlValue(
                      key,
                      control,
                      val[key],
                    );
                  }
                }
              }
              ctrl.value = val;
            }
          }
        }, 500);

        if (this.formObj.workItemId) {
          setTimeout(() => {
            this.loadComment();
          }, 500);
        }
        // 流程表单也需要执行initRelevanceForm
        if (this.inEdit || this.isNew || this.isWorkflowForm) {
          //编辑状态也需要对关联表单控件进行初始化动作
          setTimeout(() => {
            // 子表中如果有关联表单,需要等待 row构建好
            this.initRelevanceForm(controls);
          }, 1000);
        }

        setTimeout(() => {
          this.callLifecycleHook(LifecycleHookNames.OnRendered, args);
        }, 1000);
      } else {
        this.onRendered(args);
      }
    }, 50);
  }

  initRelevanceForm(controls: any[]) {
    const _tempCol: any[] = [];
    controls
      .filter(
        (c) =>
          [
            schema.FormControlType.RelevanceForm,
            schema.FormControlType.RelevanceFormEx,
          ].includes(c.type) && c.options.defaultVal,
      )
      .forEach((c, i) => {
        const ctrl = c.controller;
        ctrl &&
          ctrl.commander.next({
            name: 'init',
            args: i,
          });
      });

    controls
      .filter((c: FormSheet) => c.type === schema.FormControlType.Sheet)
      .forEach((c) => {
        const cols = c.columns.filter(
          (col: any) =>
            [
              col.type === schema.FormControlType.RelevanceForm,
              col.type === schema.FormControlType.RelevanceFormEx,
            ].includes(col.type) && col.options.defaultVal,
        );
        if (cols.length === 0) {
          return;
        }

        const fn = (index: number) => {
          const row = c.controller.rows[index];
          for (const col of cols) {
            const child = row.findChild(col.key);
            if (child) {
              child.commander.next({
                name: 'init',
                args: index,
              });
            }
          }
        };

        if (!c.controller) {
          _tempCol.push(c);
        }
        for (let i = 0; i < c.controller.rows.length; i++) {
          fn(i);
        }

        c.controller.rowChange.subscribe((change: any) => {
          if (change.type === RowChangeType.Insert) {
            fn(change.index);
          } else if (change.type === RowChangeType.InsertMulti) {
            if (change.insertCount) {
              for (let i = 0; i < change.insertCount; i++) {
                fn(change.index + i);
              }
            }
          } else {
            //Else Empty block statement
          }
        });
      });
  }

  // 格式化控件的值
  convertFormControlValue(
    sourceKey: string,
    control: schema.FormControl,
    val: any,
  ) {
    if (sourceKey === 'sequenceStatus') {
      if (val && !(this.$i18n.locale && this.$i18n.locale === 'en')) {
        const text = form.sequenceStatusZh[val];
        if (text) {
          return text;
        }
      }
    }
    return renderer.FormControlValueService.convert(
      control.type,
      val,
      control.options.multi,
    );
  }

  /**
   * 加载暂存的审批意见
   */
  async loadComment() {
    const instanceId = this.formObj.workflowInstanceId;
    const tokenId = this.formObj.workflowTokenId;
    const itemId = this.formObj.workItemId;

    if (!itemId || !instanceId || !tokenId) {
      return;
    }

    if (this.approval) {
      const res = await workflowApi.getComment({
        workflowInstanceId: instanceId,
        tokenId,
        workItemId: itemId,
      });

      if (res.errcode === 0 && res.data) {
        this.approval.controller.value = res.data;
      }
    }
  }

  /**
   * 根据表单权限创建表单按钮列表，并排序
   * @param actionObj
   */
  getActions(actionObj: any) {
    const actions: FormActionButton[] = [];

    if (!actionObj) {
      return actions;
    }

    if (actionObj[FormAction.Edit]) {
      // 流程表单不显示编辑按钮
      if (this.workflowInstanceId) {
        delete actionObj[FormAction.Edit];
      } else {
        delete actionObj[FormAction.Save];
        delete actionObj[FormAction.Submit];
      }
    }

    Object.keys(FormAction).forEach((k) => {
      const code = (FormAction as any)[k];
      if (actionObj[code] && code !== 'showCheck') {
        actions.push({
          code,
          disabled: false,
          visible: true,
          loading: false,
          text: this.getLocale(`action.${code}`).toString(),
        });
      }
    });

    const sorts: any = {
      [FormAction.Submit]: 1,
      [FormAction.Agree]: 1,
      [FormAction.DisAgree]: 2,
      [FormAction.Save]: 2,
      [FormAction.Reject]: 2,
      [FormAction.Edit]: 2,
      [FormAction.Urge]: 3,
      [FormAction.Comment]: 4,
    };

    actions.sort(
      (a, b) =>
        (sorts[a.code] ? sorts[a.code] : 99) -
        (sorts[b.code] ? sorts[b.code] : 99),
    );

    return actions;
  }

  /**
   * 调用生命周期钩子
   * @param hook
   * @param argus
   */
  callLifecycleHook(hook: LifecycleHookNames, argus?: any[]) {
    // @ts-ignore
    this.axios = axios;
    if (!this.proxy) {
      if (platform.IS_IE) {
        this.proxy = this;
      } else {
        this.proxy = new Proxy(this, new FormDetailProxyHandler());
      }
      (window as any).h3form = this.proxy;
    }
    //运行自定义按钮编写的js脚本
    if (hook === 'onRendered') {
      this.custargus = argus;
      if (this.$route.query && this.$route.query.scriptOpen) {
        let scriptData: any = window.sessionStorage.getItem('scriptData');
        scriptData = scriptData ? scriptData : '';
        try {
          let scriptDataFucs: any = new Function(
            'vm',
            'scriptData',
            scriptData,
          );
          scriptDataFucs.call(this, this.proxy, argus);
        } catch (err) {
          console.log(err, '自定义按钮JS脚本编写有误，请检查');
        }
      }
    }

    if (!this.hooks) {
      return;
    }

    const funcs = this.hooks[hook];
    if (!funcs || funcs.length === 0) {
      return;
    }

    try {
      const results = funcs.map((f) => f.apply(this.proxy, argus));
      return results;
    } catch (e) {
      console.log(`callLifecycleHook${e}`);
    }
  }

  validateApproval() {
    if (this.approval && this.approval.required) {
      const val = this.approval.controller.value;
      if (!val || !val.content) {
        const msg = this.$t(
          'cloudpivot.form.runtime.modal.pleaseInputOpinion',
        ).toString();
        this.$message.error(msg, 3);
        return false;
      }
    }
    return true;
  }

  // 移动端复制数据创建
  createByData(vm: any) {
    vm.isSaveAndCreate = true;
    this.createEmpty(vm, true);
  }

  // 创建空白表单
  createEmpty(vm: any, isSave: boolean = false) {
    if (!isSave) {
      vm.isSaveAndCreate = false;
    }
    const ac = {
      code: 'submit',
      disabled: false,
      loading: false,
      text: '提交',
      visible: true,
      isSubmitAndCreate: true,
    };
    // @ts-ignore
    this.onAction(ac);
    vm.isAddAndCreateVisible = false;
  }

  /**
   * 获取计算规则执行状态
   */
  get isComputeFormulComplete() {
    return localStorage.getItem('isComputeFormulComplete');
  }

  /**
   * 获取数据联动执行状态
   */
  get isDataLinkageComplete() {
    return localStorage.getItem('isDataLinkageComplete');
  }

  /**
   * 表单按钮Click事件处理
   * @param ac
   */
  async onAction(ac: FormActionButton) {
    if (
      this.isComputeFormulComplete &&
      this.isComputeFormulComplete === 'false'
    ) {
      const msg = '计算规则执行未完成，请稍等！';
      if (this.$message.warn) {
        this.$message.warn(msg);
      } else {
        this.$message.error(msg);
      }
      return;
    }
    if (this.isDataLinkageComplete && this.isDataLinkageComplete === 'false') {
      const msg = '数据联动执行未完成，请稍等！';
      if (this.$message.warn) {
        this.$message.warn(msg);
      } else {
        this.$message.error(msg);
      }
      return;
    }

    // @ts-ignore
    this.isSubmitAndCreate = ac.isSubmitAndCreate;
    if (ac.code === 'addAndCreate') {
      // 提交并继续创建
      // @ts-ignore
      this.isAddAndCreateVisible = true;
    }

    const btnRequired = this.btnConfigList.filter((x) => {
      return x.code === 'agree' || x.code === 'rejects';
    });
    let btnApprovalRequired: boolean = true; //审批意见是否填写
    if (btnRequired.length >= 2) {
      if (
        !btnRequired[0].commentPermission.visible &&
        !btnRequired[1].commentPermission.visible
      ) {
        btnApprovalRequired = false;
      }
      if (
        ac.code === FormAction.Agree &&
        btnRequired[0].commentPermission.required
      ) {
        btnApprovalRequired = false;
      } else if (
        ac.code === FormAction.Reject &&
        btnRequired[1].commentPermission.required
      ) {
        btnApprovalRequired = false;
      } else {
        //Else Empty block statement
      }
    }

    const arrs = [FormAction.Agree, FormAction.DisAgree];
    if (arrs.includes(ac.code) && btnApprovalRequired) {
      this.setApproval(ac);
    }

    //校验上传文件、签名是否填写
    if (!this.isMobile) {
      const opens = this.checkApproval(ac.code);
      if (!opens) {
        return;
      }
    }

    if (
      [
        FormAction.Assist,
        FormAction.Circulate,
        FormAction.Reject,
        FormAction.Forward,
        FormAction.AdjustParticipant,
        FormAction.Urge,
        FormAction.Comment,
        FormAction.EditOwner,
      ].includes(ac.code)
    ) {
      this.showActionModal(ac);
    } else if (ac.code === FormAction.ChangeNextNodeUser) {
      this.showNextNode(ac, '');
    } else if (
      ac.code === FormAction.Agree ||
      ac.code === FormAction.Submit ||
      ac.code === FormAction.DisAgree
    ) {
      if (this.formObj.participantChoose) {
        this.formObj.nextNodeParticipant = 'PARTICIPANT'; // 参与者
        const bizObjectData = this.buildSaveParams() as workflow.RejectParams;
        this.formatData(bizObjectData.bizObject.data);

        const params = {
          workflowInstanceId: this.formObj.workflowInstanceId,
          workflowCode: this.formObj.workflowCode,
          workflowVersion: this.formObj.workflowVersion,
          activityCode: this.formObj.activityCode,
          bizObject: bizObjectData.bizObject,
        };
        const gerRes: any = await formApi.getParticipantsInfo(params);
        if (gerRes.errcode === 0) {
          this.formObj.participantInfos = gerRes.data.participantInfos;
          this.formObj.participantChoose = gerRes.data.participantChoose;
        }
      }
      // 禁用按钮，防止重复提交
      this.disableActionBtn(ac, true);

      this.$nextTick(async () => {
        const valid = await this.doValidate(ac);
        if (valid === true) {
          this.presubmit(ac);
        } else {
          this.disableActionBtn(ac, false);
        }
      });
    } else if (
      [FormAction.Cancel, FormAction.Retrieve, FormAction.Delete].includes(
        ac.code,
      )
    ) {
      if (!this.isWorkflowForm && ac.code === FormAction.Cancel) {
        const hideLoader = this.$message.loading(false);
        this.clean();
        this.load().then(() => {
          hideLoader();
        });
      } else {
        const okText =
          ac.code === FormAction.Delete
            ? this.$t('languages.common.okAndDelete')
            : this.$t('languages.common.ok');

        const self = this;

        this.$confirm({
          title: ac.text,
          content: this.getLocale(`tip.${ac.code}`),
          okText: okText.toString(),
          cancelText: this.$t('languages.common.cancel').toString(),
          icon: () =>
            this.$createElement('a-icon', {
              props: {
                type: 'question-circle',
                theme: 'filled',
              },
            }),
          onOk() {
            self.doAction(ac);
          },
        });
      }
    } else if (ac.code === FormAction.FinishInstance) {
      const okText = this.$t('languages.common.ok');
      const self = this;
      this.$confirm({
        title: `${this.getLocale(`tip.${ac.code}`)}${ac.text}?`,
        content: '',
        okText: okText.toString(),
        cancelText: this.$t('languages.common.cancel').toString(),
        icon: () =>
          this.$createElement('a-icon', {
            props: {
              type: 'question-circle',
              theme: 'filled',
            },
          }),
        onOk() {
          self.doAction(ac);
        },
      });
    } else if (ac.code === FormAction.FormTrack) {
      const markingInstance: any = this.$refs.FormMarking;
      if (!markingInstance) {
        return;
      }
      markingInstance.changeVisible(true);
    } else if (ac.custom) {
      this.customButtomFun(ac);
    } else {
      const sequenceStatus = this.formObj.bizObject.data.sequenceStatus;
      ac.code === FormAction.Save && this.disableActionBtn(ac, true);
      this.$nextTick(async () => {
        if (ac.code === FormAction.Save) {
          if (
            sequenceStatus &&
            sequenceStatus !== form.SequenceStatus.Draft &&
            sequenceStatus !== form.SequenceStatus.Processing
          ) {
            const valid = await this.doValidate(ac);
            if (valid !== true) {
              this.disableActionBtn(ac, false);
              return;
            }
          } else {
            if (this.validate(true) === false) {
              this.disableActionBtn(ac, false);
              return;
            }
          }
        }
        this.doAction(ac);
      });
    }
  }

  //校验流程审批意见中文件上传、签名是否填写
  checkApproval(code: string) {
    const btnRequired = this.btnConfigList.filter((x) => {
      return x.code === 'agree' || x.code === 'rejects';
    });
    let btnApprovalRequired: boolean = false;
    let btnFileRequired: boolean = false;
    let btnSignsRequired: boolean = false;
    if (btnRequired.length >= 2) {
      if (
        code === FormAction.Agree &&
        btnRequired[0].commentPermission.required
      ) {
        btnApprovalRequired = true;
      } else if (
        code === FormAction.Reject &&
        btnRequired[1].commentPermission.required
      ) {
        btnApprovalRequired = true;
      } else {
        //Else Empty block statement
      }
      if (
        code === FormAction.Agree &&
        btnRequired[0].attachmentPermission.required
      ) {
        btnFileRequired = true;
      } else if (
        code === FormAction.Reject &&
        btnRequired[1].attachmentPermission.required
      ) {
        btnFileRequired = true;
      } else {
        //Else Empty block statement
      }
      if (code === FormAction.Agree && btnRequired[0].signPermission.required) {
        btnSignsRequired = true;
      } else if (
        code === FormAction.Reject &&
        btnRequired[1].signPermission.required
      ) {
        btnSignsRequired = true;
      } else {
        //Else Empty block statement
      }
    }

    //文本意见是否填写
    if (btnApprovalRequired) {
      if (!this.approval.controller.value.content) {
        this.$message.error('请输入文本意见');
        return false;
      }
    }
    //校验文件是否上传
    if (btnFileRequired) {
      if (Array.isArray(this.approval.controller.value.resources)) {
        const fileListR: any = this.approval.controller.value.resources.filter(
          (x) => {
            return x.name !== 'signsture.png';
          },
        );
        if (fileListR.length === 0) {
          this.$message.error('请上传附件');
          return false;
        }
      } else {
        this.$message.error('请上传附件');
        return false;
      }
    }
    //校验签名是否填写
    if (btnSignsRequired) {
      if (Array.isArray(this.approval.controller.value.resources)) {
        const fileListR: any = this.approval.controller.value.resources.filter(
          (x) => {
            return x.name === 'signsture.png';
          },
        );
        if (fileListR.length === 0) {
          this.$message.error('请扫码签名');
          return false;
        }
      } else {
        this.$message.error('请扫码签名');
        return false;
      }
    }
    return true;
  }

  //自定义按钮执行业务规则
  customButtonRule(btn: any, id: any[]) {
    const bizObject: any = Object.assign({}, this.formObj.bizObject);
    delete bizObject['createdDeptId'];
    delete bizObject['creater'];
    delete bizObject['modifier'];
    delete bizObject['owner'];
    delete bizObject['ownerDeptId'];
    const ruleParams: any = {
      bizButtonModel: btn,
      bizObjectList: [bizObject],
    };

    listApi.executeCustomButton(ruleParams).then((res) => {
      if (res.errcode === 0) {
        this.$message.success(res.errmsg);
        setTimeout(() => {
          this.$router.go(0);
        }, 2500);
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  // 自定义按钮事件
  async customButtomFun(customButtonType: any) {
    const { schemaCode } = this.$route.params;
    const objectId = this.$route.query.objectId;
    const params: any = {
      bizObjectId: objectId,
      schemaCode,
    };
    let sheetCodes: string = '';
    //自定义按钮
    if (customButtonType) {
      const customButtonData = this.customBtn.filter((x) => {
        return x.code === customButtonType.code;
      });
      if (customButtonData[0].operateType === 'WITH_VIEW') {
        switch (customButtonData[0].bindAction) {
          case 'LIST':
            const actionConfigs = JSON.parse(customButtonData[0].actionConfig);
            this.viewCodeCustom = actionConfigs.viewXListData[0].code;
            this.customButtomModalCode = actionConfigs.schemaCodeVal.key;
            const opens = await this.customButtomCheck(
              'LIST',
              actionConfigs.schemaCodeVal.key,
            );
            if (!opens) {
              return;
            }
            this.visibleOpen = true;
            return;
          case 'FORM':
          case 'ADD_DATA':
          case 'FLOW':
            const queryCondition: any = []; //当为查看列表时存储自定义按钮配置的筛选条件
            const addData: any = []; //当为新增数据时存储自定义按钮配置数据
            const actionConfig: any = JSON.parse(
              customButtonData[0].actionConfig,
            );
            if (this.formObj.bizObject) {
              const formJsonData = this.formObj.bizObject.data;
              for (const con of actionConfig.configureList) {
                let qcCon: any;
                if (customButtonData[0].bindAction === 'FORM') {
                  qcCon = {
                    propertyCode: '',
                    propertyType: 0,
                    propertyValue: '',
                    queryFilterType: 'Eq',
                  };
                } else if (
                  customButtonData[0].bindAction === 'ADD_DATA' ||
                  customButtonData[0].bindAction === 'FLOW'
                ) {
                  qcCon = {
                    targetDataItemCode: null,
                    targetDataItemValue: null,
                  };
                } else {
                  //Else Empty block statement
                }

                if (con.currentDataItem) {
                  //配置的是变量
                  for (const valKay in formJsonData) {
                    if (valKay === con.currentDataItem[0].code) {
                      if (customButtonData[0].bindAction === 'FORM') {
                        qcCon.propertyCode = con.targetDataItem[0].code;
                        qcCon.propertyType =
                          con.currentDataItem[0].propertyType;
                        qcCon.queryFilterType = con.OptionType;
                        if (Array.isArray(formJsonData[valKay])) {
                          for (const fon of formJsonData[valKay]) {
                            fon.unitType = fon.type;
                          }
                        }
                        qcCon.propertyValue = formatVal(
                          con.currentDataItem[0].propertyType,
                          formJsonData[valKay],
                          con.targetDataItem[0].code,
                          con.OptionType,
                        );
                        queryCondition.push(qcCon);
                      } else if (
                        customButtonData[0].bindAction === 'ADD_DATA' ||
                        customButtonData[0].bindAction === 'FLOW'
                      ) {
                        qcCon.targetDataItemCode = con.targetDataItem[0].code;
                        qcCon.targetDataItemValue = formJsonData[valKay];
                        addData.push(qcCon);
                      } else {
                        //Else Empty block statement
                      }
                    } else {
                      //为子表时
                    }
                  }
                } else {
                  //配置的是常量
                  if (customButtonData[0].bindAction === 'FORM') {
                    qcCon.propertyCode = con.targetDataItem[0].code;
                    qcCon.propertyValue = con.currentDataInput;
                    const trimOpen = con.currentDataInput.trim();
                    if (trimOpen === '') {
                      qcCon.queryFilterType = 'IsNull';
                    }
                    queryCondition.push(qcCon);
                  } else if (
                    customButtonData[0].bindAction === 'ADD_DATA' ||
                    customButtonData[0].bindAction === 'FLOW'
                  ) {
                    if (con.targetDataItem) {
                      qcCon.targetDataItemCode = con.targetDataItem[0].code;
                      qcCon.targetDataItemValue = con.currentDataInput;
                    }
                    addData.push(qcCon);
                  } else {
                  }
                }
              }
            }
            if (customButtonData[0].bindAction === 'FORM') {
              const formParams: any = {
                filters: [],
                mobile: false,
                page: 0,
                queryCode: actionConfig.schemaCodeVal.key,
                // queryCode: actionConfig.formListData[0].code,
                queryVersion: 1,
                schemaCode: actionConfig.schemaCodeVal.key,
                size: 20,
                queryCondition: [],
              };
              const queryConditions: any = [];
              sheetCodes = actionConfig.formListData[0].code;
              queryConditions.push(queryCondition);
              formParams.queryCondition.push(queryConditions);
              const formRes = await listApi.getQueryList(formParams);
              if (formRes.data.content && formRes.data.content.length > 0) {
                const cusResData = formRes.data.content[0];
                params.bizObjectId = cusResData.id;
                params.schemaCode = cusResData.schemaCode;
              } else {
                this.$message.info('没有符合条件的数据', 4);
                return;
              }
            } else if (
              customButtonData[0].bindAction === 'ADD_DATA' ||
              customButtonData[0].bindAction === 'FLOW'
            ) {
              const actionConfigs = JSON.parse(
                customButtonData[0].actionConfig,
              );
              const addParams: any = {
                code: actionConfigs.schemaCodeVal.key,
                schemaCode: actionConfigs.schemaCodeVal.key,
                source: 1,
              };
              window.sessionStorage.setItem(
                'addDataCustom',
                JSON.stringify(addData),
              );
              const headerParams = {
                schemaCode: actionConfigs.schemaCodeVal.key,
                clientType: listParams.QueryClientType.PC,
              };
              const headerRes = await listApi.getQueryHeaders(headerParams);
              if (headerRes.errcode === 0 && Array.isArray(headerRes.data)) {
                addParams.code = headerRes.data[0]
                  ? headerRes.data[0].code
                  : actionConfigs.schemaCodeVal.key;
              }
              const addRes = await listApi.getListConfigData(addParams);
              if (addRes.data && addRes.data.queryActions) {
                const addQA = addRes.data.queryActions.filter((x) => {
                  return x.actionCode === 'add';
                });
                if (addQA.length > 0) {
                  customButtonData[0].bindAction === 'FLOW'
                    ? (addQA[0].associationType = 1)
                    : (addQA[0].associationType = 0);
                  customButtonData[0].bindAction === 'FLOW'
                    ? (addQA[0].associationCode =
                        actionConfigs.WorkflowListData[0].workflowCode)
                    : (addQA[0].associationCode =
                        actionConfigs.formListData[0].code);
                  if (customButtonData[0].bindAction === 'ADD_DATA') {
                    addQA[0].queryCode = actionConfigs.formListData[0].code;
                  }
                } else {
                  const addQAData: any = {};
                  if (customButtonData[0].bindAction === 'FLOW') {
                    addQAData.associationCode =
                      actionConfigs.WorkflowListData[0].workflowCode;
                    addQAData.associationType = 1;
                    addQAData.schemaCode = actionConfigs.schemaCodeVal.key;
                  } else if (customButtonData[0].bindAction === 'ADD_DATA') {
                    addQAData.associationCode =
                      actionConfigs.formListData[0].code;
                    addQAData.associationType = 0;
                    addQAData.schemaCode = actionConfigs.schemaCodeVal.key;
                    addQAData.queryCode = actionConfigs.formListData[0].code;
                  } else {
                  }
                  addQA.push(addQAData);
                }

                if (customButtonData[0].bindAction === 'FLOW') {
                  const flowParams = {
                    startWorkflowCode:
                      actionConfigs.WorkflowListData[0].workflowCode,
                  };
                  const flowRes = await formApi.load(flowParams);
                  if (flowRes.errcode !== 0) {
                    this.$message.error('执行失败，找不到模型/表单/视图');
                    return;
                  }
                } else if (customButtonData[0].bindAction === 'ADD_DATA') {
                  const opens = await this.customButtomCheck(
                    'ADD_DATA',
                    actionConfigs.schemaCodeVal.key,
                  );
                  if (!opens) {
                    return;
                  }
                } else {
                  //Else Empty block statement
                }

                this.handleAdd(addQA[0], true);
                return;
              }
            } else {
              //Else Empty block statement
            }
            break;
          case 'SCRIPT':
            const scriptData: any = JSON.parse(
              customButtonData[0].actionConfig,
            ).scriptData;
            try {
              let scriptDataFucs: any = new Function(
                'vm',
                'scriptData',
                scriptData,
              );
              scriptDataFucs.call(this, this.proxy, this.custargus);
            } catch (err) {
              console.log(err, '自定义按钮JS脚本编写有误，请检查');
            }
            return;
          default:
            break;
        }
      } else if (customButtonData[0].operateType === 'WITH_OUT_VIEW') {
        if (customButtonData[0].bindAction === 'BUSINESS_RULE') {
          this.customButtonRule(customButtonData[0], [objectId]);
        } else if (customButtonData[0].bindAction === 'SCRIPT') {
          const scriptData: any = JSON.parse(
            customButtonData[0].actionConfig,
          ).scriptData;
          try {
            let scriptDataFucs: any = new Function(
              'vm',
              'scriptData',
              scriptData,
            );
            scriptDataFucs.call(this, this.proxy, this.custargus);
          } catch (err) {
            console.log(err, '自定义按钮JS脚本编写有误，请检查');
          }
        } else {
          //Else Empty block statement
        }
        return;
      } else {
        //Else Empty block statement
      }

      const res = await listApi.getFormUrl(params);
      // 如果报错, 会返回一个对象
      if (typeof res === 'object' && res.errcode !== 0) {
        return this.$message.error(res.errmsg as string, 3);
      }
      // 否则返回一个字符串
      else if (typeof res === 'string') {
        let res1: any = res;
        if (res1.indexOf('sheetCode') !== -1 && sheetCodes) {
          const urlParts = (res as string).split('sheetCode=');
          res1 =
            urlParts[0] +
            'sheetCode=' +
            sheetCodes +
            '&' +
            urlParts[1].split('&').slice(1).join('&');
        }
        const questionPosition = location.href.indexOf('?');
        const search =
          location.href.substring(questionPosition) + '&iframeAction=detail';
        const url = this.isDingTalk
          ? `${res1}&return=${location.pathname}`
          : `${res1}&return=${location.pathname + encodeURIComponent(search)}`;
        window.open(url);
      } else {
        //Else Empty block statement
      }
    }
  }

  // 自定义按钮运行时校验模型、表单、视图是否存在
  async customButtomCheck(type: string, schemaCode: string) {
    switch (type) {
      case 'ADD_DATA':
      case 'LIST':
        const scOpen = await this.schemaCheck(schemaCode);
        if (!scOpen) {
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  }

  async schemaCheck(schemaCode: string) {
    const parmas = {
      schemaCode: schemaCode,
    };
    const flowRes = await formApi.load(parmas);
    if (flowRes.errcode !== 0) {
      this.$message.error('执行失败，找不到模型/表单/视图');
      return false;
    }
    return true;
  }

  async handleAdd(obj: any, customButton: boolean = false) {
    let url: string = '';
    const code = obj.associationCode;
    if (obj.associationType === 1) {
      // 关联流程
      url = `/form/detail?startWorkflowCode=${code}`;
    } else {
      // 关联表单
      // let { schemaCode } = vm.$route.params;
      const { schemaCode, queryCode } = obj;
      url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${code}&queryCode=${queryCode}`;
    }
    if (customButton) {
      url += `&customButtonOpen=${customButton}`;
    }
    let search = location.search;
    search = search ? `${search}&iframeAction=add` : `?iframeAction=add`;
    url += `&return=${location.pathname + encodeURIComponent(search)}`;
    window.open(url);
  }

  // 顶部操作按钮 禁用和放开
  disableActionBtn(ac: FormActionButton, status: boolean) {
    const reloadCodeType = [
      FormAction.Save,
      FormAction.Submit,
      FormAction.Agree,
    ];
    const $btn: any = '';
    if (reloadCodeType.includes(ac.code)) {
      this.actions.forEach((val) => (val.disabled = status));
    }
  }

  /**
   * @desc 用户没有输入值的时候点击确认自动赋值
   * @param ac 按钮对象
   */
  setApproval(ac: any) {
    let content = ac.text;
    if (ac.code === FormAction.Reject) {
      content = this.$t('cloudpivot.flow.pc.WorkflowActionStatus.DisAgree');
    }
    if (ac.code === FormAction.Agree) {
      content = this.$t('cloudpivot.flow.pc.WorkflowActionStatus.Agree');
    }
    if (
      'approval' in this &&
      typeof this.approval === 'object' &&
      (!this.approval.controller.value ||
        (this.approval.controller.value &&
          !this.approval.controller.value.content))
    ) {
      if (this.isMobile) {
        // 移动端先将内容存储
        window.sessionStorage.setItem('$approval', content);
      } else {
        if (typeof this.approval.controller.value === 'object') {
          this.approval.controller.value.content = content;
        } else {
          this.approval.controller.value = {
            content,
          };
        }
      }
    }
  }

  /**
   * 表单按钮Click事件处理
   * @param ac
   */
  async doAction(ac: FormActionButton, data?: any) {
    //校验上传文件、签名是否填写
    const opens = this.checkApproval(ac.code);
    if (!opens) {
      this.approvalOpen = false;
      return;
    } else {
      this.approvalOpen = true;
    }
    let res: any;
    try {
      const beforeReuslt = await this.beforeAction(ac);
      if (beforeReuslt === false) {
        return;
      }

      let err: any;
      const actionResult = this.executeAction(ac, data);
      // 处理 Firefox 兼容性
      if (actionResult) {
        try {
          res = await actionResult;
        } catch (e) {
          err = e;
        }
      }

      const afterReuslt = await this.onActionDone(ac, res, err);
      if (afterReuslt === false) {
        return;
      }
    } catch (error) {
      console.error('doAction 执行错误!', error);
      this.disableActionBtn(ac, false);
      throw error;
    } finally {
      // 暂存,提交,同意 防止重复点击;
      // this.disableActionBtn(ac, false);
    }

    if (res) {
      if (res.errcode === 0) {
        if (ac.code === FormAction.Retrieve) {
          this.retrieveCallBack(ac);
        } else if (ac.code === FormAction.EditOwner) {
          this.reload();
        } else {
          if (!window.opener) {
            this.$message.success(res.errmsg as string);
          }
          setTimeout(() => {
            this.goto(ac, res);
          }, 600);
        }

        // 关联表单需要刷新标签页
        window.localStorage.setItem('relevanceFormAddData', 'true');
      } else {
        this.handleError(res);
        setTimeout(() => {
          this.disableActionBtn(ac, false);
        }, 1000);
      }
    }
  }

  /**
   * 表单撤回后
   */
  retrieveCallBack(ac: FormActionButton) {
    const workflowInstanceId = this.$route.query.workflowInstanceId as string;
    const vm = this;
    this.timer = setInterval(() => {
      const params = {
        workflowInstanceId,
        activityCode: this.formObj.activityCode as string,
      };
      workflowApi.isRetrieve(params).then((res) => {
        if (res.errcode === 0) {
          if (!res.data) {
            // 撤回成功获得新流程实例id 刷新表单
            workflowApi
              .getWorkitemByInstanceid({ workflowInstanceId })
              .then((result) => {
                if (result.errcode === 0) {
                  vm.goto(ac, result);
                }
              });
            clearInterval(vm.timer);
          }
        } else {
          this.$message.error(res.errmsg || '', 3);
          clearInterval(vm.timer);
        }
      });
    }, 1000);
  }

  /**
   * 构建按钮事件数据
   */
  buildActionData() {
    // const data = this.getFormValue(false);
    const formRenderer = this.formRenderer;
    const data = formRenderer.getValue();
    if (data && this.formObj && this.formObj.bizObject) {
      data.id = this.formObj.bizObject.id;
      data.schemaCode = this.formObj.bizSchema.code;
      data.sheetCode = this.formObj.bizSheet.code;
      data.sequenceStatus = this.formObj.bizObject.sequenceStatus;
      data.sequenceNo = this.formObj.bizObject.sequenceNo;
    }
    return data;
  }

  /**
   * 表单按钮操作前事件
   * @param ac
   */
  async beforeAction(ac: FormActionButton) {
    const data = this.buildActionData();

    const args = [ac, data];
    if (ac.code !== FormAction.Print) {
      const results = this.callLifecycleHook(
        LifecycleHookNames.OnPreAction,
        args,
      );

      if (results) {
        if (results.some((r) => r === false)) {
          return false;
        }

        const tasks = results.filter((r) => r instanceof Promise);
        if (tasks.length > 0) {
          const taskResults = await Promise.all(tasks);
          if (taskResults.some((r) => r === false)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * 执行表单按钮逻辑
   * @param ac
   */
  executeAction(ac: FormActionButton, data?: any): Promise<any> | any {
    if (ac.code === FormAction.Submit) {
      const isEl: boolean = !!(window as any).externalLinkToken;
      const isAdmin: boolean = localStorage.getItem('_isAdmin') === 'true';
      if (!isEl && isAdmin) {
        const msg = '拥有者没有所属部门，不能提交表单';
        if (this.$message.warn) {
          this.$message.warn(msg);
        } else {
          this.$message.error(msg);
        }
        return;
      }
    }
    switch (ac.code) {
      case FormAction.ChangeNextNodeUser:
        this.showNextNode(ac, data);
        break;
      case FormAction.Save:
        return this.save();

      case FormAction.Agree:
      case FormAction.Submit:
        this.disableActionBtn(ac, true);
        return this.submit(ac.code, data.deptId, true, data.trustor, data);

      case FormAction.DisAgree:
        this.disableActionBtn(ac, true);
        return this.submit(ac.code, data.deptId, false);

      case FormAction.Print:
        this.print(ac);
        break;

      case FormAction.Edit:
        this.edit();
        break;

      case FormAction.Cancel:
        return this.cancel();

      case FormAction.Retrieve:
        return this.retrieve();

      case FormAction.FinishInstance:
        return this.finish();

      case FormAction.Delete:
        return this.delete();

      case FormAction.Assist:
      case FormAction.Circulate:
      case FormAction.Reject:
      case FormAction.Forward:
      case FormAction.AdjustParticipant:
      case FormAction.Urge:
        return this.onActionModalOk(ac, data);
      case FormAction.EditOwner:
        return this.handleEditOwner(data);
      default:
        return this.onCustomAction(ac);
    }
  }

  // 处理修改拥有者
  async handleEditOwner(data: any) {
    const res: any = await listApi.modifyOwner(data);
    return res;
  }

  /**
   * 自定义按钮事件处理
   * @param ac
   */
  onCustomAction(ac: FormActionButton) {
    const data = this.buildActionData();
    const args = [ac, data];
    const results = this.callLifecycleHook(
      LifecycleHookNames.OnCustomAction,
      args,
    );
    if (results && results.length > 0) {
      return results[0];
    }
  }

  /**
   * 表单按钮操作后事件
   * @param ac
   */
  async onActionDone(ac: FormActionButton, res: any, err: any) {
    const data = this.buildActionData();
    const args = [ac, data, res, err];
    const results = this.callLifecycleHook(
      LifecycleHookNames.OnActionDone,
      args,
    );

    if (results) {
      if (results.some((r) => r === false)) {
        return false;
      }

      const tasks = results.filter((r) => r instanceof Promise);
      if (tasks.length > 0) {
        const taskResults = await Promise.all(tasks);
        if (taskResults.some((r) => r === false)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 按钮弹窗
   * @param ac
   */
  async showActionModal(ac: FormActionButton) {
    let opts: FormActionModalOptions;

    if (ac.code === FormAction.Reject) {
      opts = {
        title: ac.text,
        code: ac.code,
        data: this.formObj,
        approval: this.approval,
        createrName:
          this.formObj.bizObject && this.formObj.bizObject.creater.name,
      };
    } else {
      opts = {
        title: ac.text,
        code: ac.code,
        data: this.formObj,
        approval: this.approval,
      };
    }

    const modal = this.$refs.actionModal as any as FormActionModal;
    modal.show(opts);
  }

  async onActionModalOk(ac: FormActionButton, data: any) {
    if (ac.code === FormAction.Urge) {
      this.urgeHandler(data);
      return;
    } else {
      const p =
        ac.code === FormAction.Reject
          ? this.reject(data)
          : this.forword(data, ac);

      const res = await p;

      if (res.errcode === 0) {
        if (window.top !== window.self) {
          // window.parent.postMessage('close', origin);
          this.parentWindowAction('close');
        }

        let user: any = sessionStorage.getItem('user');
        if (user) {
          user = JSON.parse(user);
        }
        localStorage.removeItem(`${user.name}_latestSign`);
      }

      if (res.errcode === 0) {
        const modal = this.$refs.actionModal as any as FormActionModal;
        modal.close();
      }

      return res;
    }

    // return p.then((res) => {
    //   if (res.errcode === 0) {
    //     const modal = this.$refs.actionModal as any as FormActionModal;
    //     modal.close();
    //   }
    //   return res;
    // });
  }

  async doValidate(ac: FormActionButton) {
    // 流程模拟不做表单校验
    if (this.$route.query.workflowMock) {
      return true;
    }
    const valid = this.validate();
    if (valid === false) {
      return Promise.resolve(false);
    }

    const data = this.buildActionData();

    const args = [ac, data];
    const results = this.callLifecycleHook(LifecycleHookNames.OnValidate, args);

    if (results) {
      if (results.some((r) => r === false)) {
        return Promise.resolve(false);
      }

      const tasks = results.filter((r) => r instanceof Promise);
      if (tasks.length > 0) {
        const taskResults = await Promise.all(tasks);
        if (taskResults.some((r) => r === false)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 驳回
   */
  async reject(data: any) {
    if (
      !this.approval.controller.value ||
      !(
        !!this.approval.controller.value.content ||
        !!this.approval.controller.value.resources
      )
    ) {
      this.approval.controller.value = {
        content: '不同意',
      };
    }
    const params = this.buildSaveParams() as workflow.RejectParams;
    this.formatData(params.bizObject.data);
    params.rejectToActivityCode = data.rejectToActivityCode;
    params.submitToReject = data.submitToReject;
    params.formType = '1';
    params.bizObject.data.version = this.formVersion;

    return workflowApi.rejectWorkItem(params).then((res) => {
      if (res.errcode === 302036) {
        return this.popErr(res);
      }

      const msg = this.$t(
        'cloudpivot.form.runtime.tip.rejectSuccess',
      ).toString();
      this.$message.success(msg, 3);
      return res;
    });
  }

  /**
   * 转办
   * @param data
   * @param ac
   */
  async forword(data: any, ac: FormActionButton) {
    const params: workflow.ForwardParams = {
      workItemId: this.formObj.workItemId,
      workflowInstanceId: this.formObj.workflowInstanceId,
      activityCode: this.formObj.activityCode,
      comment: data.comment,
      participantors: data.participantors.map((x: any) => x.id),
    } as any;
    if (ac.code === FormAction.Forward) {
      return workflowApi.forwardWorkItem(params);
    }
    const assistParams = params as workflow.AssistParams;
    let promise: Promise<any>;
    if (ac.code === FormAction.Assist) {
      promise = workflowApi.assistWorkItem(assistParams);
    } else if (ac.code === FormAction.Circulate) {
      promise = workflowApi.circulateWorkItem(assistParams);
    } else if (ac.code === FormAction.AdjustParticipant) {
      promise = workflowApi.adjustWorkItemParticipators(assistParams);
    } else {
      throw new Error(ac.code);
    }

    return promise.then((res) => {
      if (res.errcode === 0) {
        const lang = this.$i18n.locale || 'zh';
        let msg = '';
        if (lang === 'zh') {
          msg = `已成功${ac.text}给${data.participantors[0].name}等${data.participantors.length}人`;
        } else {
          const acStraight = ac.text.toLowerCase();
          msg = `You have ${acStraight} the task to ${data.participantors[0].name}`;
        }

        this.$message.success(msg, 3);
      }
      return res;
    });
  }

  /**
   * 打印
   * @param ac
   */
  print(ac: FormActionButton) {
    setTimeout(() => {
      window.print();
    }, 500);
  }

  /**
   * 编辑
   */
  edit() {
    if (!this.isWorkflowForm) {
      this.clean();
      this.$route.query.sheetEdit = 'true';
      this.load(true).then(() => {
        const btnSave = {
          code: FormAction.Save,
          disabled: false,
          visible: true,
          text: this.getLocale(`action.${FormAction.Save}`),
        };

        const index = this.actions.findIndex(
          (ac) => ac.code === FormAction.Edit,
        );
        if (index > -1) {
          this.actions.splice(index, 1, btnSave);
        }

        let code = FormAction.Submit;
        let text = '';

        if (
          this.formObj.bizObject.sequenceStatus ===
          form.SequenceStatus.Completed
        ) {
          code = FormAction.Cancel;
          btnSave.text = this.getLocale(`action.save2`);
          // text = this.getLocale(`action.cancel2`);
          // index++;
        } else {
          code = FormAction.Submit;
          text = this.getLocale(`action.${code}`);

          this.actions.splice(index, 0, {
            code,
            disabled: false,
            visible: true,
            text,
          });
        }
      });
    }
  }

  /**
   * 默认值的查询条件转换使用
   * @param str
   * @returns
   */
  operatorToZh(str: string) {
    // 历史数据兼容，转换历史判断条件为运算符 => 中文名称
    const Mappings = {
      '==': '等于',
      '!=': '不等于',
      '>=': '大于等于',
      '<=': '小于等于',
      '>': '大于',
      '<': '小于',
      NotContains: '不包含',
      Contains: '包含',
      IsNotEmpty: '不为空',
      IsEmpty: '为空',
    };
    // 兼容性处理，格式化默认值
    const res: any = [];
    const arr = str.split('&&');
    arr.forEach((el) => {
      let elArr: any[] = el.split(' ');
      elArr = this.removeEmpty(elArr);
      if (elArr[1] && Object.keys(Mappings).includes(elArr[1])) {
        // @ts-ignore
        elArr[1] = Mappings[elArr[1]];
        res.push(elArr.join(' '));
      }
    });
    return res.join(' && ');
  }

  /**
   * 显示条件与必填条件转换使用，
   * @param str
   * @returns
   */
  operatorFormula(str: string) {
    const Mappings = {
      '==': '等于',
      '!=': '不等于',
      '>=': '大于等于',
      '<=': '小于等于',
      '>': '大于',
      '<': '小于',
      NotContains: '不包含',
      Contains: '包含',
      IsNotEmpty: '不为空',
      IsEmpty: '为空',
    };
    // 兼容性处理，格式化默认值
    let res = str || '';
    const arr = res.split('&&');
    arr.forEach((el) => {
      const elArr: any[] = el.split(' ');
      if (elArr[1] && Object.keys(Mappings).includes(elArr[1])) {
        // @ts-ignore
        elArr[1] = Mappings[elArr[1]];
        res = elArr.join(' ');
      }
    });
    return res;
  }

  removeEmpty(arr: any[]) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === '' || typeof arr[i] === 'undefined') {
        arr.splice(i, 1);
        i = i - 1; // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位
      }
    }
    return arr;
  }

  /**
   * 将API数据转换为表单控件数据
   * @param controls
   * @param data
   */
  toFormData(controls: RendererControl[], data: { [key: string]: any }) {
    for (const key in data) {
      if (Array.isArray(data[key])) {
        for (const item of data[key]) {
          if (Array.isArray(item.departments)) {
            item.parentId = item.departments
              .filter((d: any) => d && d.id)
              .map((d: any) => d.id);
          }
        }
      }
    }

    const formControls: RendererFormControl[] = [];
    components.FormRendererHelper.findFormControl(controls, formControls);

    // 表单未提交过，修改拥有者
    this.changeOwner(formControls, data);

    // 针对不同控件属性特殊处理
    this.handleFormControls(formControls, data);
  }

  // 针对不同控件属性特殊处理
  handleFormControls(
    formControls: RendererFormControl[],
    data: { [key: string]: any },
  ) {
    formControls.forEach((c) => {
      this.setRequiredFormula(c);
      switch (c.type) {
        case FormControlType.Sheet:
          this.handleSheetControl(c, data);
          break;

        case FormControlType.Attachment:
        case FormControlType.Image:
          this.handleImageAttachment(c, data);
          break;
        case FormControlType.Checkbox:
        case FormControlType.Dropdown:
        case FormControlType.DropdownMulti:
        case FormControlType.Radio:
          this.handleCheckboxRadioDropdown(c, data);
          break;

        case FormControlType.Address:
          this.handleAddress(c, data);
          break;
        case FormControlType.Location:
          this.handleLocation(c, data);
          break;

        case FormControlType.Date:
          this.handleDate(c, data);
          break;

        case FormControlType.Time:
          this.handleTime(c, data);
          break;

        case FormControlType.RelevanceForm:
        case FormControlType.RelevanceFormEx:
          this.handleRelevanceForm(c, data);
          break;

        case FormControlType.ReverseRelevance:
          this.handleReverseRelevance(c, data);
          break;

        default:
          break;
      }

      // 刘青需求：外链时，选人控件不做必填校验
      if (
        (window as any).isExternal &&
        [
          FormControlType.StaffSelector,
          FormControlType.StaffMultiSelector,
          FormControlType.DepartmentSelector,
          FormControlType.DepartmentMultiSelector,
          FormControlType.StaffDeptMixed,
        ].includes(c.type)
      ) {
        c.options.requiredFormula = 'false';
      }
    });
  }

  //子表处理
  handleSheetControl(c: RendererFormControl, data: { [key: string]: any }) {
    const sheetParams = {
      id: this.formObj.bizObject.id,
      sheetid: this.formObj.bizSheet.id,
      formCode: this.formObj.bizSheet.code, // 表单编码
      sheetCode: this.formObj.bizSheet.code, // 表单编码
      schemaCode: this.formObj.bizSchema.code, // 模型编码
      objectId: this.formObj.bizObject.id, // 表单id
      sequenceStatus: this.formObj.bizObject.sequenceStatus, // 流程状态
      subSchemaCode: c.key,
      workitemId: this.formObj.workItemId,
    };
    const sheetValue = data[c.key];
    c.options.sheetParams = sheetParams;
    if (Array.isArray(sheetValue)) {
      sheetValue.sort((a, b) => a.sortKey - b.sortKey);
      sheetValue.forEach((v) => this.toFormData((c as any).columns, v));
    }

    if (Array.isArray(c.columns)) {
      c.columns.forEach(async (c: any) => {
        if (c.options && c.options.syncFormate) {
          c.options.format1 = c.options.format;
        }

        if (
          c.type === FormControlType.RelevanceForm ||
          c.type === FormControlType.RelevanceFormEx
        ) {
          // 默认值:兼容历史数据
          ['defaultVal'].forEach((el: string) => {
            if (c.options[el] && typeof c.options[el] === 'string') {
              c.options[el] = c.options[el].replace('不包含', 'NotContains');
              c.options[el] = c.options[el].replace('包含', 'Contains');
              c.options[el] = this.operatorToZh(c.options[el]);
            }
          });
        }

        // 转换业务数据
        if (
          [FormControlType.Checkbox, FormControlType.Radio].includes(c.type)
        ) {
          try {
            if (
              c.options &&
              c.options.options &&
              this.checkIsJSON(c.options.options)
            ) {
              const options = JSON.parse(c.options.options);
              //自定义和数据字典类型没有schemaCode，不需要去获取业务模型数据
              if (options.schemaCode) {
                c.options.options =
                  options.labels
                    .map((el: any) => el.data[options.sheetDataItem])
                    .join(';') + ';';
              }
            }
          } catch (error) {
            console.log('error===>', error);
          }
        }

        // 转换字典数据
        if (
          [
            FormControlType.Checkbox,
            FormControlType.Dropdown,
            FormControlType.DropdownMulti,
            FormControlType.Radio,
          ].includes(c.type)
        ) {
          let checkedDictionary = '';
          let dictionaryOptions = '';
          let useDictionariesData: any[] = [];
          let options: any;
          try {
            if (
              c.options &&
              c.options.options &&
              this.checkIsJSON(c.options.options)
            ) {
              options = JSON.parse(c.options.options);
            }
            if (options && options.checkedDictionary) {
              checkedDictionary = options.checkedDictionary;
            }
            if (options && options.useDictionariesData) {
              useDictionariesData = options.useDictionariesData;
            }
          } catch (error) {
            console.log('error===>', error);
          }
          if (checkedDictionary) {
            if (useDictionariesData && useDictionariesData.length) {
              useDictionariesData.forEach((element) => {
                dictionaryOptions += element.name + ';';
              });
            } else {
              const res: any = await formApi.getEnableRecordsByDictionaryId({
                dicId: checkedDictionary,
              });
              if (res.errcode === 0) {
                const data: any[] = res.data;
                data.forEach((element) => {
                  dictionaryOptions += element.name + ';';
                });
              }
            }

            dictionaryOptions = dictionaryOptions.replace(/;$/, '');
            c.options.options = dictionaryOptions;
          }
        }

        //条件必填情况下+是否只读属性设置为true的情况下，必填失效，这里置空
        if (c.options.readonlyFormula) {
          c.options.requiredFormula = false;
        }
      });
    }
  }

  // 图片、附件处理
  handleImageAttachment(c: RendererFormControl, data: { [key: string]: any }) {
    const files = data[c.key];
    if (files && Array.isArray(files)) {
      data[c.key] = files.map((f: any) => {
        if (f.refId) {
          return {
            uid: f.refId,
            name: f.name,
            status: UploadStatus.Done,
            size: f.fileSize,
            response: {
              data: f,
            },
          };
        } else if (f.uid) {
          return f;
        } else {
          //Else Empty block statement
        }
      });
    }
  }

  // 单选、多选、下拉单选、下拉多选处理
  async handleCheckboxRadioDropdown(
    c: RendererFormControl,
    data: { [key: string]: any },
  ) {
    let checkedDictionary = '';
    let dictionaryOptions = '';
    let useDictionariesData: any[] = [];
    let options: any;
    try {
      if (
        c.options &&
        c.options.options &&
        this.checkIsJSON(c.options.options)
      ) {
        options = JSON.parse(c.options.options);
        if (options.checkedDictionary) {
          checkedDictionary = options.checkedDictionary;
        }
        useDictionariesData = options.useDictionariesData;
      }
    } catch (error) {
      console.log('error===>', error);
    }
    if (checkedDictionary) {
      if (useDictionariesData && useDictionariesData.length) {
        useDictionariesData.forEach((element) => {
          dictionaryOptions += element.name + ';';
        });
      } else {
        const res: any = await formApi.searchDictionaryRecord({
          id: checkedDictionary,
          page: 1,
          size: 10,
          searchWord: '',
        });
        if (res.errcode === 0) {
          const data: any[] = res.data.content;
          const dataItemList: any[] = [];
          const getDictionaryOptins = (dataList: any[]) => {
            dataList.forEach((element: any) => {
              if (!element.deleted) {
                dataItemList.push(element.name);
                dictionaryOptions += dataItemList.join('/') + ';';
                if (element.children) {
                  getDictionaryOptins(element.children);
                }
                dataItemList.pop();
              }
            });
          };
          getDictionaryOptins(data);
        }
      }
      dictionaryOptions = dictionaryOptions.replace(/;$/, '');
      c.options.options = dictionaryOptions;
    }
    if (
      typeof options === 'object' &&
      options.labels &&
      options.labels.length > 0
    ) {
      c.options.hasLabel = true;
      c.options.options = options.labels
        .map((i: any) => i.data[options.sheetDataItem])
        .join(';');
    }

    const str = data[c.key] as string;
    if (
      c.type === FormControlType.Checkbox ||
      c.type === FormControlType.DropdownMulti ||
      (c.type === FormControlType.Dropdown &&
        (c.options as DropdownOptions).multi)
    ) {
      if (typeof str === 'string') {
        data[c.key] = str ? str.split(';') : [];
      }
    }
  }

  // 地址处理
  handleAddress(c: RendererFormControl, data: { [key: string]: any }) {
    const str = data[c.key];
    if (typeof str === 'string') {
      try {
        // iOS兼容
        data[c.key] = JSON.parse(str);
      } catch (error) {
        console.log(error);
      }
    }
  }

  handleLocation(c: RendererFormControl, data: { [key: string]: any }) {
    const str = data[c.key];
    if (str) {
      try {
        if (typeof str === 'object') {
          data[c.key] = str;
        } else {
          data[c.key] = JSON.parse(str);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  // 日期处理
  handleDate(c: RendererFormControl, data: { [key: string]: any }) {
    let str = data[c.key];
    if (typeof str === 'string') {
      try {
        // iOS兼容
        str = str.replace(/-/g, '/');
        data[c.key] = new Date(str);
      } catch (error) {
        console.log(error);
      }
    }
  }

  // 时间处理
  handleTime(c: RendererFormControl, data: { [key: string]: any }) {
    const str = data[c.key];
    if (typeof str === 'string') {
      try {
        data[c.key] = moment(str as any, c.options.format1 || 'HH:mm:ss');
      } catch (error) {
        console.log(error);
      }
    }
  }

  // 关联控件处理
  handleRelevanceForm(c: RendererFormControl, data: { [key: string]: any }) {
    // 默认值:兼容历史数据
    ['defaultVal'].forEach((el: string) => {
      if (c.options[el] && typeof c.options[el] === 'string') {
        c.options[el] = c.options[el].replace('不包含', 'NotContains');
        c.options[el] = c.options[el].replace('包含', 'Contains');
        c.options[el] = this.operatorToZh(c.options[el]);
      }
    });

    if (data[c.key] && !data[c.key].id) {
      data[c.key] = {};
    }
    const sheetParams = {
      id: this.formObj.bizObject.id,
      sheetid: this.formObj.bizSheet.id,
      sheetCode: this.formObj.bizSheet.code, // 表单编码
      schemaCode: this.formObj.bizSchema.code, // 模型编码
    };
    c.options.sheetParams = sheetParams;
  }

  // 关联查询处理
  handleReverseRelevance(c: RendererFormControl, data: { [key: string]: any }) {
    c.options.sheetParams = {
      id: this.formObj.bizObject.id,
      sheetid: this.formObj.bizSheet.id,
      formCode: this.formObj.bizSheet.code,
      sheetCode: this.formObj.bizSheet.code, // 表单编码
      schemaCode: this.formObj.bizSheet.schemaCode,
      sequenceStatus: this.formObj.bizObject.sequenceStatus,
    };
  }

  // 设置是否必填
  setRequiredFormula(control) {
    // 显示条件，必填条件，只读条件
    ['displayFormula', 'requiredFormula', 'readonlyCondition'].forEach(
      (el: string) => {
        if (
          control.options[el] &&
          typeof control.options[el] === 'string' &&
          control.options[el] !== 'true'
        ) {
          control.options[el] = this.operatorFormula(control.options[el]);
          //条件必填情况下+是否只读属性设置为true的情况下，必填失效，这里置空
          if (control.options.readonlyFormula && el === 'requiredFormula') {
            control.options.requiredFormula = false;
          }
        }
      },
    );
  }

  // 未提交过的表单修改拥有者
  changeOwner(formControls, data) {
    const user = renderer.StaffSelectorControl.service.getCurrentUser() as any;
    const owner = formControls.find((c) => c.type === FormControlType.OwnerId);
    // 如果没有提交过，则更改选人控件
    if (owner) {
      if (!(this as any).formObj) {
        return;
      }
      const formPermission = (this as any).formObj.formPermission;
      let edit = false;
      // 表单新增 或者 流程表单且表单状态为草稿，可以编辑
      if (
        this.isNew ||
        (this.isWorkflowForm &&
          this.formObj.bizObject &&
          this.formObj.bizObject.sequenceStatus === 'DRAFT')
      ) {
        edit = true;
      } else if (
        formPermission &&
        formPermission.dataPermissions &&
        formPermission.dataPermissions.owner
      ) {
        if (formPermission.dataPermissions.owner.e && user && this.inEdit) {
          if (
            user.permissions.includes('SYS_MNG') ||
            user.permissions.includes('ADMIN')
          ) {
            edit = true;
          }
        } else if (
          this.formObj.bizObject &&
          this.formObj.bizObject.sequenceStatus === 'DRAFT' &&
          formPermission.dataPermissions.owner.e
        ) {
          edit = true;
        } else {
          //Else Empty block statement
        }
      } else {
        //Else Empty block statement
      }
      if (edit) {
        owner.type = FormControlType.StaffSelector;
        owner.required = true;
        owner.value = data[owner.key];
        owner.writable = false;
        owner.edit = edit;
        const options = FormControlOptionsService.buildFor(
          owner.type,
          owner.options,
        );
        if (options) {
          options.defaultValueType = schema.StaffSelectorValueType.Originator;
          owner.options = options;
        }
        this.owner = owner;
      }
    }
  }

  /**
   * 将表单数据转换为后端API所需数据结构
   * @param data
   * @param controls
   * @param filterSystem
   * @param agree
   */
  formDataHandle(
    data: { [key: string]: any },
    controls: RendererControl[],
    filterSystem: boolean,
    agree?: boolean,
  ) {
    const formControls: RendererFormControl[] = [];
    components.FormRendererHelper.findFormControl(controls, formControls);

    formControls.forEach((c: any) => {
      if (
        filterSystem &&
        ((c.type > 99 && c.type < 200) ||
          [
            FormControlType.Title,
            FormControlType.Description,
            FormControlType.Group,
          ].includes(c.type))
      ) {
        delete data[c.key];
      }

      //暂存不对数值控件做处理
      if (c.type === FormControlType.Number && agree && data[c.key] === '') {
        data[c.key] = null;
      }

      if (this.formObj) {
        let result: number | null = null;
        if (agree !== undefined) {
          result = agree ? 1 : 2;
        }

        if (c.type === FormControlType.ApprovalOpinion) {
          const val = data[c.key];
          if (val) {
            val.workItemId = this.formObj.workItemId;
            val.workflowInstanceId = this.formObj.workflowInstanceId;
            val.workflowTokenId = this.formObj.workflowTokenId;
            val.activityCode = this.formObj.activityCode;
            val.activityName = this.formObj.activityName;
            val.result = result;
          }
          // @ts-ignore
          const isCommon: boolean = c.controller.isCommon || false;
          if (isCommon) {
            val.commonSet = isCommon;
          }
        }
      }

      const val: any = data[c.key];
      switch (c.type) {
        case FormControlType.Date:
        case FormControlType.CreatedTime:
        case FormControlType.ModifiedTime:
          if (val === '') {
            data[c.key] = null;
          } else if (val instanceof Date) {
            data[c.key] = {
              value: dateFormatter(
                val,
                c.options.format1 || 'YYYY-MM-DD HH:mm:ss',
              ),
              val: val,
              isDate: true,
            };
          } else {
            //Else Empty block statement
          }
          break;
        case FormControlType.Time:
          if (moment.isMoment(val)) {
            // 时间为moment类型
            data[c.key] = val.format(c.options.format1 || 'HH:mm:ss');
          }
          break;

        case FormControlType.Checkbox:
        case FormControlType.Dropdown:
        case FormControlType.DropdownMulti:
          if (Array.isArray(val)) {
            data[c.key] = {
              value: val.join(';'),
              isString: true,
            };
          }
          break;

        case FormControlType.StaffSelector:
        case FormControlType.StaffMultiSelector:
        case FormControlType.DepartmentSelector:
        case FormControlType.DepartmentMultiSelector:
        case FormControlType.StaffDeptMixed:
          if (Array.isArray(val)) {
            data[c.key] = val.map((x) => ({
              id: x.id,
              type: x.unitType || x.type, // x.type === 'org' ? 1 : 3
              name: x.name,
            }));
          }
          break;

        case FormControlType.Location:
          if (val && Object.keys(val).length > 0) {
            data[c.key] = JSON.stringify(val);
          }
          break;
        case FormControlType.Attachment:
        case FormControlType.Image:
          if (val && Array.isArray(val)) {
            data[c.key] = val
              .map((f: any) => {
                if (f.refId) {
                  return f;
                }
                if (
                  !f ||
                  !f.response ||
                  !f.response.data ||
                  !f.response.data.refId
                ) {
                  return null;
                }
                return f.response.data;
              })
              .filter((f) => f);
          }
          break;

        case FormControlType.Sheet:
          if (Array.isArray(val)) {
            let removeList: any =
              ((c.controller as any) && (c.controller as any).removeList) || []; // 删除列表
            let listDelete: any = []; // 过滤后台返回的删除数据
            let modifyList: any = []; // 修改的数据
            removeList = this.unRepeat(removeList, 'id');
            if (Array.isArray(removeList) && removeList.length > 0) {
              listDelete = removeList.filter((item: any) => item.id);
              //针对删除的子表项进行去重
              listDelete = uniqBy(listDelete, 'id');
              removeList.forEach((item: any) => (item.rowStatus = 'Deleted'));
            }
            modifyList = val.filter(
              (item: any) => item.rowStatus !== 'Unchanged' || !item.id,
            );
            const finalValues: any = [...listDelete, ...modifyList];
            //把最终修改过的行数据提交 未修改过的不提交
            data[c.key] = finalValues;
            if (Array.isArray(finalValues) && finalValues.length > 0) {
              finalValues.forEach((v: any) =>
                this.formDataHandle(v, (c as any).columns, filterSystem, agree),
              );
            }
          }
          break;

        case FormControlType.RelevanceForm:
          if (val) {
            data[c.key] = {
              displayCode: c.options.displayField,
              id: val.id || '',
              propertyType: 0,
              schemaCode: c.options.schemaCode,
              onlyId: true,
            };
            if (data[c.key]) {
              data[c.key][c.options.displayField] = val[c.options.displayField];
            } else {
              data[c.options.displayField] = val[c.options.displayField];
            }
          }
          break;

        case FormControlType.RelevanceFormEx:
          if (Array.isArray(val) && val.length > 0) {
            data[c.key] = val.map((item) => {
              const res: any = {
                displayCode: c.options.displayField,
                id: item.id || '',
                propertyType: 0,
                schemaCode: c.options.schemaCode,
                onlyId: true,
              };
              res[c.options.displayField] = item[c.options.displayField];
              return res;
            });
          }
          break;

        case FormControlType.ReverseRelevance:
          delete data[c.key];
          break;
        default:
          break;
      }
    });
  }

  // 获取表单全部值
  getFormValue(filterSystem: boolean, agree?: boolean) {
    const formRenderer = this.formRenderer;
    const formData = formRenderer.getValue();
    if (formData) {
      for (const i in formData) {
        if (formData[i] && Array.isArray(formData[i])) {
          formData[i].forEach((v: any) => {
            for (const e in v) {
              if (v[e] && typeof v[e] === 'string') {
                try {
                  const obj = JSON.parse(v[e]);
                  if (
                    obj &&
                    obj.marked &&
                    (obj.marked === true || obj.marked === false)
                  ) {
                    v[e] = obj.value;
                  }
                } catch {}
              } else if (v[e] && Array.isArray(v[e])) {
                v[e] = v[e].map((g: any) => {
                  if (g.marked === true || g.marked === false) {
                    g = g.value;
                  }
                  return g;
                });
              } else {
                //Else Empty block statement
              }
            }
          });
        }
      }
    }
    this.formDataHandle(formData, this.controls, filterSystem, agree);
    this.filterNullVal(formData);
    return formData;
  }

  //去重数组
  unRepeat(arry, key) {
    const newArr = arry.filter((currentValue, currentIndex, currentArr) => {
      return (
        currentArr.findIndex((cV) => cV[key] === currentValue[key]) ===
        currentIndex
      );
    });
    return newArr;
  }

  /**
   * @desc 过滤子表空数据行
   * @param data 需要处理的数据
   */
  filterNullVal(data: any) {
    const contrs = this.formControls.filter(
      (item) => item.type === schema.FormControlType.Sheet,
    );
    if (contrs.length <= 0) {
      return data;
    }
    const filterData = (key: any, columns: any) => {
      // 所有的模型类型
      const types = columns.reduce((prev: any, next: any) => {
        prev[next.key] = next.type;
        return prev;
      }, {});
      data[key] = data[key].filter((info: any) => {
        const keys = Object.keys(info);
        for (let i = 0, len = keys.length; i < len; i++) {
          const k = keys[i];
          // 如果有逻辑控件直接保存
          if (types[k] === FormControlType.Logic) {
            return true;
          }
          if (types[k] !== FormControlType.Logic && info[k]) {
            return true;
          }
        }
        return false;
      });
      return data;
    };
    contrs.forEach((item: any) => {
      const { key, columns } = item;
      filterData(key, columns);
    });
    return data;
  }

  // 更新手写签名
  updateLatestSignature(value: any, isNew: boolean = false) {
    if (this.isNewSignature && !value) {
      return;
    }
    if (!isNew) {
      this.isNewSignature = value;
    } else {
      if (
        this.formObj.bizObject &&
        this.formObj.bizObject.sequenceStatus === 'DRAFT' &&
        value.creater &&
        value.creater.id === this.theLatestSignature.createdBy &&
        value.refId !== this.theLatestSignature.refId &&
        value.createdTime &&
        this.theLatestSignature.createdTime &&
        new Date(value.createdTime) >=
          new Date(this.theLatestSignature.createdTime) &&
        (!this.isNewSignature ||
          (this.isNewSignature &&
            this.isNewSignature.createdTime &&
            new Date(this.isNewSignature.createdTime) <=
              new Date(value.createdTime)))
      ) {
        this.isNewSignature = value;
      }
    }
  }

  /**
   * 构建表单暂存参数
   */
  buildSaveParams(agree?: boolean) {
    const formData = this.getFormValue(true, agree);
    formData.id = this.formObj.bizObject.id;

    if (this.$root.$store) {
      formData.delete_attachment_2147483647 = this.$root.$store.state.delFile;
    }
    if (this.formObj.bizObject.sequenceNo) {
      formData.sequenceNo = this.formObj.bizObject.sequenceNo;
    }

    if (this.$route.query.queryId) {
      this.queryId = this.$route.query.queryId;
    }
    const data: form.SaveParams = {
      workflowCode: this.formObj.workflowCode,
      workItemId: this.formObj.workItemId,
      workflowInstanceId: this.formObj.workflowInstanceId,
      queryId: this.$route.query.queryId || this.queryId,
      bizObject: {
        id: this.formObj.bizObject.id,
        data: formData,
        schemaCode: this.formObj.bizSchema.code,
        sheetCode: this.formObj.bizSheet.code,
        workflowInstanceId: this.formObj.workflowInstanceId,
      },
    };

    if (this.approval) {
      data.approval = formData[this.approval.key];
      delete formData[this.approval.key];
    }
    return data;
  }

  /**
   * 暂存、保存
   */
  async save() {
    // const hideLoader = this.$message.loading(null, 0);
    // 如果没有拥有者，或者拥用者控件没有选中用户，都取当前用户ID
    let ownerId = '';

    if (this.owner) {
      const ownerVal = this.owner.controller.value as any[];
      if (ownerVal && ownerVal.length > 0) {
        ownerId = ownerVal[0].id;
      }
    }

    if (!ownerId) {
      const user = renderer.StaffSelectorControl.service.getCurrentUser();
      if (user) {
        ownerId = user.id;
      }
    }

    const params: any = this.$route.query;
    let data: any = this.buildSaveParams();
    this.formatData(data.bizObject.data);

    let res: form.HttpResponse<any>;

    // eslint-disable-next-line no-useless-catch
    try {
      data = FormDetailService.mergeReplayToken(data); // 合并 校验码
      data.bizObject.data.version = this.formVersion;
      data.latestSign =
        this.formObj.bizObject &&
        this.formObj.bizObject.sequenceStatus &&
        this.formObj.bizObject.sequenceStatus !== 'DRAFT'
          ? this.isNewSignature
          : null;
      res = await formApi.save(data, this.formPath);

      if (res.errcode === 302036) {
        return this.popErr(res);
      }

      if (this.$root.$store) {
        this.$root.$store.state.delFile = [];
      }
      if (res.errcode === 0) {
        if (window.top !== window.self) {
          this.parentWindowAction('reload');
        }

        let user: any = sessionStorage.getItem('user');
        if (user) {
          user = JSON.parse(user);
        }
        localStorage.removeItem(`${user.name}_latestSign`);
        const workflowInstanceId = res.data.workflowInstanceId;

        if (params.startWorkflowCode) {
          let workItemId: string;
          do {
            workItemId = await this.existWorkItem(workflowInstanceId, ownerId);
          } while (!workItemId);

          const workItem = {
            id: (workItemId as any).data,
            instanceId: workflowInstanceId,
          };

          res.data.workItem = workItem;
        }
      }
    } catch (e) {
      throw e;
    }

    return res;
  }

  existWorkItem(workflowInstanceId: string, ownerId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        formApi.workItemExist(workflowInstanceId, ownerId).then(
          (res) => {
            if (res.errcode === 0) {
              // @ts-ignore
              resolve(res.data);
            } else {
              // @ts-ignore
              resolve();
            }
          },
          (res) => reject(res),
        );
      }, 1000);
    });
  }

  // 显示下一个节点
  showNextNode(ac: any, data: any) {
    this.disableActionBtn(ac, true);
    this.$nextTick(async () => {
      const valid = await this.doValidate(ac);
      if (valid === true) {
        const modal = this.$refs.actionModal as any as FormActionModal;
        modal.show({
          title: ac.text,
          code: FormAction.ChangeNextNodeUser,
          data: this.formObj,
          deptId: data && data.deptId,
          approval: this.approval,
        });
        this.disableActionBtn(ac, false);
      } else {
        this.disableActionBtn(ac, false);
      }
    });
  }

  /*
    处理用于 复制并新建 时的数据
  */
  formatOldData(data: any) {
    for (const key in data) {
      // 提交给后台只需要id的数据项，复制新建需要给对象数据
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const item = data[key];

        // 复制新增下拉框，复选框需要数组数据
        if (typeof item === 'object' && item !== null && item.isString) {
          data[key] = item.value.split(';');
        }
        // 时间格式
        if (typeof item === 'object' && item !== null && item.isDate) {
          data[key] = item.val;
        }

        // 子表
        if (Array.isArray(item) && item.length) {
          item.forEach((el) => {
            this.formatOldData(el);
          });
        }
      }
    }
  }

  /*
    因新增 复制并新建功能 部分控件值构建时返回变更，提交数据需要做对应处理
  */
  formatData(data: any) {
    for (const key in data) {
      // 提交给后台只需要id的数据项，复制新建需要给对象数据
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const item = data[key];

        // 关联单选-提交数据处理（复制表单需要其他数据信息，构建值的时候需要返回对象数据）
        if (typeof item === 'object' && item !== null && item.onlyId) {
          data[key] = item.id;
        }
        // 关联多选-提交数据处理
        if (Array.isArray(item) && item.length && item[0].onlyId) {
          data[key] = item.map((el) => el.id).join(';');
        }

        // 提交下拉框，复选框需要字符串数据
        if (typeof item === 'object' && item !== null && item.isString) {
          data[key] = item.value;
        }

        // 时间格式
        if (typeof item === 'object' && item !== null && item.isDate) {
          data[key] = item.value;
        }

        // 子表
        if (Array.isArray(item) && item.length) {
          item.forEach((el) => {
            this.formatData(el);
          });
        }
      }
    }
  }

  /**
   * 提交前业务逻辑处理
   * @param ac
   * @param agree 是否同意
   */
  async presubmit(ac: FormActionButton) {
    if (this.submited) {
      if (this.isMobile && this.approval) {
        const modal = this.$refs.actionModal as any as FormActionModal;
        modal.show({
          title: ac.text,
          code: ac.code,
          data: this.formObj.participantChoose ? this.formObj : [],
          approval: this.approval,
          showNextNode: this.formObj.participantChoose,
        });
        this.disableActionBtn(ac, false);
      } else {
        if (this.formObj.participantChoose) {
          this.showNextNode(ac, '');
        } else {
          //如果提交过，不用再选择部门
          const deptId =
            (this.formObj.bizObject.data &&
              this.formObj.bizObject.data.ownerDeptId &&
              this.formObj.bizObject.data.ownerDeptId.id) ||
            null;
          this.doAction(ac, {
            deptId,
          });
        }
      }
    } else {
      let depts: any[] = [];
      let trustList: any = [];
      // 流程模拟,发起流程时提交处理-预设部门为发起人部门
      if (
        this.$route.query.workflowMock &&
        this.$route.query.startWorkflowCode
      ) {
        const startWorkflowCode = `${this.$route.query.startWorkflowCode}-mock`;
        const _preMockData: any =
          window.sessionStorage.getItem(startWorkflowCode);
        const mockData = JSON.parse(_preMockData);
        if (mockData && mockData.originatorDept) {
          this.doAction(ac, {
            deptId: mockData.originatorDept,
          });
          return;
        }
      }
      let ownerInfo: any = {};
      let createrInfo: any = {};
      ownerInfo =
        this.formObj && this.formObj.bizObject && this.formObj.bizObject.owner
          ? this.formObj.bizObject.owner
          : ownerInfo;
      createrInfo =
        this.formObj && this.formObj.bizObject && this.formObj.bizObject.creater
          ? this.formObj.bizObject.creater
          : createrInfo;
      let userId: string = '';
      if (
        this.formObj &&
        this.formObj.bizSheet &&
        this.formObj.bizSheet.draftAttributesJson
      ) {
        const obj = JSON.parse(this.formObj.bizSheet.draftAttributesJson);
      }
      // 使用接口的loading动画，不额外触发，一面生成两个加载动画
      // const hideLoader = (this.$message as any).loading();
      if (this.owner) {
        const val = this.owner.controller.value as any[];
        if (val && val.length > 0) {
          userId = val[0].id;
        }
      } else {
        // 如果没有拥有者控件，则取创建人的Id
        !ownerInfo.id
          ? (userId = createrInfo.id || '')
          : (userId = ownerInfo.id || '');
        // depts = this.formObj.departments;
      }
      try {
        let _depts: any;
        //流程走流程的部门获取
        if (this.isWorkflowForm) {
          _depts =
            await renderer.StaffSelectorControl.service.getUserWorkflowFormDepartments(
              userId,
              this.formObj.workflowCode || '',
              this.isMobile,
            );
        } else {
          _depts =
            await renderer.StaffSelectorControl.service.getUserDepartments(
              userId,
            );
        }

        if (_depts) {
          depts = _depts;
        }
        const params: any = {
          workflowCode: this.formObj.workflowCode || '',
        };
        if (this.formObj.workflowInstanceId) {
          params.workflowInstanceId = this.formObj.workflowInstanceId;
        }
        //如果没有流程id就不请求
        if (params.workflowInstanceId || this.$route.query.startWorkflowCode) {
          const res = await workflowApi.getTrustOriginatorList(params);
          if (!res.errcode && Array.isArray(res.data)) {
            trustList = res.data;
          }
        }
      } finally {
        // hideLoader();
      }

      if (!depts || depts.length === 0) {
        // 无拥有者 无创建人 loadedFromDb false 识别数据来自业务方法,不需要校验拥有者部门；
        if (!platform.IS_DEBUG) {
          if (userId) {
            this.$message.error(
              this.$t('cloudpivot.form.runtime.tip.noDeptJurisdiction'),
              3,
            );
            return;
          }
        }
      }

      // 如果有多个部门需要选一个
      // 移动端的审批意见需要弹页面填写
      const filterTrust = trustList.filter((tl: any) => tl.isTrustor);
      if (ac.code === 'submit' && filterTrust.length) {
        // 发起委托选择委托人弹窗，当存在委托人时出现
        const modal = this.$refs.actionModal as any as FormActionModal;
        modal.show({
          title: this.$t(
            'cloudpivot.form.runtime.modal.selectIdentity',
          ).toString(),
          code: ac.code,
          data: depts,
          approval: this.approval,
          trusts: trustList,
          workflowName: this.formObj.workflowName,
          showNextNode: this.formObj.participantChoose,
        });
        this.disableActionBtn(ac, false);
      } else if (depts.length > 1 || (this.isMobile && this.approval)) {
        const modal = this.$refs.actionModal as any as FormActionModal;
        modal.show({
          title: ac.text,
          code: ac.code,
          data: depts,
          approval: this.approval,
          showNextNode: this.formObj.participantChoose,
        });
        this.disableActionBtn(ac, false);
      } else {
        if (this.formObj.participantChoose) {
          this.showNextNode(ac, '');
        } else {
          this.doAction(ac, {
            deptId: !depts[0] ? '' : depts[0].id,
          });
        }
      }
    }
  }

  submiting: boolean = false;

  /**
   * 提交、同意、不同意
   * @param deptId
   * @param agree
   */
  async submit(
    actionCode: string,
    deptId: string,
    agree: boolean,
    trustor?: string,
    dataParams?: any,
  ) {
    if (this.submiting) {
      // 防止多次提交数据
      return;
    }

    const closeLoader = (this.$message as any).loading();
    let data = this.buildSaveParams(agree) as form.SubmitParams;
    const oldData = cloneDeep(data); // 用来做复制新建数据备份
    this.formatOldData(oldData.bizObject.data);
    this.formatData(data.bizObject.data);
    data.agree = agree;
    data.actionCode = actionCode;
    data.depatmentId = deptId;
    data.trustor = trustor;
    data.latestSign = this.isNewSignature;
    if (this.$route.query.key) {
      data.bizObject.data.parentId = this.$route.query.relId;
    }
    if (dataParams && dataParams.participantInfos) {
      data.participantInfos = dataParams.participantInfos.map((i: any) => {
        if (typeof i.participantList === 'string') {
          i.participantList = i.participantList.split();
        }
        return i;
      });
    }
    // 流程模拟，发起流程时提交处理
    if (this.$route.query.workflowMock && this.$route.query.startWorkflowCode) {
      const startWorkflowCode = `${this.$route.query.startWorkflowCode}-mock`;
      const _preMockData: any =
        window.sessionStorage.getItem(startWorkflowCode);
      const mockData = JSON.parse(_preMockData);
      data.simulative = true;
      if (mockData && mockData.originator && mockData.originator.length) {
        data.runMode = mockData.runMode;
        let isAdmin = false;
        if (window.sessionStorage.getItem('user')) {
          // 当前用户为超管的话，在流程模拟时取预设人作为拥有者
          const user: any = JSON.parse(
            window.sessionStorage.getItem('user') as string,
          );
          isAdmin = user.permissions.includes('ADMIN');
        }
        if (data.bizObject.data['owner'] && !isAdmin) {
          // 如果表单设置了拥有者，流程模拟时需将部门清空，后台默认取主部门
          data.depatmentId = '';
        } else {
          // 如果表单未设置拥有者，流程模拟时取预设发起人作为拥有者
          data.bizObject.data['owner'] = [
            { id: mockData.originator[0].id, type: 3 },
          ];
        }
      }
    }
    // 1流程表单 2非流程表单
    data.formType = this.formObj.workflowCode ? '1' : '2';
    data = FormDetailService.mergeReplayToken(data); // 合并 校验码
    const vm = this;
    try {
      data.bizObject.data.version = this.formVersion;
      this.submiting = true;
      const res: any = await formApi.submit(data, this.formPath);
      this.submiting = false;
      if (res.errcode === 0) {
        const time = +new Date() + '';
        // @ts-ignore
        if (vm.isSaveAndCreate) {
          // 开启使用历史数据
          localStorage.setItem(time, JSON.stringify(oldData.bizObject.data));
        }
        // @ts-ignore
        if (vm.isSubmitAndCreate) {
          // 提交并继续创建
          if (window.top !== window.self) {
            // window.parent.postMessage('reload', origin);
            this.parentWindowAction('reload');
          }

          let user: any = sessionStorage.getItem('user');
          if (user) {
            user = JSON.parse(user);
          }
          localStorage.removeItem(`${user.name}_latestSign`);

          let href = location.href;
          const match = href.match(/useData\=\d+/);
          if (match) {
            href = href.replace(match[0], 'useData=' + time);
            location.replace(href);
            return;
          } else {
            location.replace(location.href + '&useData=' + time);
            return;
          }
        } else {
          this.closePopDetail();
          return res;
        }
      } else if (res.errcode === 302036) {
        return this.popErr(res);
      } else {
        //Else Empty block statement
      }
      return res;
    } finally {
      closeLoader();
    }
  }

  /*
    提交、暂存、驳回、作废 数据已经修改弹窗提示
  */
  popErr(res: any) {
    const vm = this;
    this.$confirm({
      content: res.errmsg + '将重新加载数据',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        vm.reload();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
    return false;
  }

  /**
   * 处理异常信息
   * @param res
   * @param defaultMsg
   */
  handleError(res: any, defaultMsg?: string) {
    let msg: string;
    switch (res.errcode) {
      case 300004:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips4').toString();
        break;
      case 300006:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips5').toString();
        break;
      case 301005:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips6', {
          msg: res.errmsg,
        }).toString();
        break;
      case 304001:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips7').toString();
        break;
      case 402500:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips8').toString();
        break;
      case 402501:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips9').toString();
        setTimeout(() => {
          this.reload();
        }, 1000);
        break;
      case 402517:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips21').toString();
        break;
      case 402509:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips10').toString();
        break;
      case 402510:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips11').toString();
        break;
      case 402511:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips1').toString();
        break;
      case 402512:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips2').toString();
        break;
      case 402515:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips3').toString();
        break;
      case 402513:
        msg = this.$t('cloudpivot.form.runtime.tip.errTips12').toString();
        break;
      case 402514:
        msg = res.errmsg; //'参与者数量选择不能超过8个用户！';
        break;
      case 550010:
        // 直接使用接口返回数据
        msg = res.errmsg;
        // let schemaName = "";
        // !(this.$i18n.locale && this.$i18n.locale === 'en')
        //   ? (schemaName = res.data.schemaName)
        //   : (schemaName = JSON.parse(res.data.schemaName_i18n).en || "");
        // msg = this.$t("cloudpivot.form.runtime.tip.errTips18", {
        //   schemaName: schemaName,
        //   businessRuleName: res.data.businessRuleName,
        //   nodeName: res.data.nodeName,
        //   propertyCode: res.data.propertyCode,
        // }).toString();
        break;
      case 550006:
        let schemaName = '';
        let targetSchemaName = '';
        !(this.$i18n.locale && this.$i18n.locale === 'en')
          ? (targetSchemaName = res.data.targetSchemaName)
          : (schemaName = JSON.parse(res.data.targetSchemaName_i18n).en || '');
        msg = this.$t('cloudpivot.form.runtime.tip.errTips20', {
          targetSchemaName: targetSchemaName,
          nodeName: res.data.nodeName,
        }).toString();
        break;
      default: //this.$t('languages.common.tip.operationFail').toString();
        msg = defaultMsg || res.errmsg;
        break;
    }
    // 重复提交不获取 校验码,否则需要重新获取校验码
    if (res.errcode !== 100005) {
      FormDetailService.setReplayToken(this.formPath);
    }
    this.$message.error(msg, 3);
  }

  /**
   * 作废
   */
  async cancel() {
    const res = await workflowApi.abortInstance(
      this.workflowInstanceId,
      this.workItemId,
      this.formVersion,
    );
    if (res.errcode === 302036) {
      return this.popErr(res);
    }
    return res;
  }

  /**
   * 删除
   */
  delete() {
    let p;
    if (this.workflowInstanceId) {
      p = workflowApi.deleteInstance(
        this.workflowInstanceId,
        this.workItemId,
        this.formVersion,
      );
    } else {
      const params = this.$route.query as any;
      p = formApi.delete(
        {
          schemaCode: params.schemaCode,
          objectId: params.objectId,
        },
        this.formPath,
      );
    }
    return p.then((res) => {
      if (res.errcode === 302036) {
        return this.popErr(res);
      }

      const msg = this.$t(
        'cloudpivot.form.runtime.tip.deleteSuccess',
      ).toString();
      this.$message.success(msg, 3);
      this.closePopDetail();
      return res;
    });
  }

  /**
   * 结束
   */
  finish() {
    return workflowApi.finishInstance(this.workflowInstanceId);
  }

  /**
   * 撤回
   */
  retrieve() {
    const params = {
      workflowInstanceId: this.workflowInstanceId,
      activityCode: this.formObj.activityCode,
      workItemId: this.formObj.workItemId,
    } as any;
    return workflowApi.revokeWorkItem(params).then((res) => {
      if (res.errcode === 0) {
        const msg = this.$t(
          'cloudpivot.form.runtime.tip.retrieveSuccess',
        ).toString();
        this.$message.success(msg, 3);
      }
      return res;
    });
  }

  /**
   * 催办
   * 客户端调用dd接口，web端调用api接口
   * @param data { content: 催办内容, instanceId: 实例id }
   */
  urgeHandler(data: any) {
    const type: number = utils.Common.isDingtalk ? 0 : 1;
    this.urgeHandler_common(data, type);
  }

  /**
   * 催办通用
   * @params urgeType 0：客户端ding消息；1：web端钉钉通知
   */
  async urgeHandler_common(data: any, urgeType: number) {
    const { content, instanceId } = data;
    const params: form.SaveDingParams = {
      urgeType: urgeType,
      instanceId: instanceId,
      text: content,
    };
    const res = await formApi.saveDing(params);
    if (res.errcode === 0) {
      this.$message.success(
        this.$t('cloudpivot.form.runtime.urge.urgeSuccess'),
        3,
      );
      const modal = this.$refs.actionModal as any as FormActionModal;
      modal.close();
    } else if (res.errcode === 10024) {
      // 当前处理人是你自己，不能催办自己
      this.$message.error(
        this.$t('cloudpivot.form.runtime.urge.cantUrgeSelf'),
        3,
      );
    } else {
      this.$message.error(
        this.$t('cloudpivot.form.runtime.urge.urgeFailed'),
        3,
      );
    }
  }

  /**
   * 催办钉钉客户端
   * type mobile 移动端   pc 客户端
   */
  async urgeHandler_dd(data: any) {
    const { content, instanceId, type } = data;
    const { corpId } = (window as any).Environment;
    const vm: any = this;
    const res = await formApi.getTodoUsers(instanceId);
    if (res.errcode === 0) {
      const users = res.data;
      const owner: string = this.formObj.bizObject.owner.name;
      const instanceName: string = this.formObj.instanceName as string;

      const text = `内容: ${content}\n发起人: ${owner}\n流程名称: ${instanceName}`;

      // 2.0版本接口报权限错误 故使用1.0版本 20190610
      (window as any).dd.biz.ding.post({
        users, //用户列表，userid
        corpId, //加密的企业id
        type: 1, //钉类型 1：image  2：link
        alertType: 2,
        alertDate: { format: 'yyyy-MM-dd HH:mm', value: '2015-05-09 08:00' },
        attachment: {
          images: [''], //只取第一个image
        }, //附件信息
        text, //消息体
        onSuccess: function (result: any) {
          // tip: 点击取消也会执行这个回调，但是点击取消的时候，result为空
          // tip: result不为空时，此时点击了发送并成功
          // result在移动端 undefinded -> 点击取消   object -> 点击了发送
          // result在pc端相反
          if (type === 'mobile') {
            if (result && result.dingCreateResult) {
              vm.urgeHandler_common(data, 0);
            }
          }

          if (type === 'pc') {
            if (!result) {
              vm.urgeHandler_common(data, 0);
            }
          }
        },
        onFail: function () {},
      });
    } else if (res.errcode === 10024) {
      // 当前处理人是你自己，不能催办自己
      this.$message.error(
        this.$t('cloudpivot.form.runtime.urge.cantUrgeSelf'),
        3,
      );
    } else {
      this.$message.error(this.$t('cloudpivot.form.runtime.urge.netError'), 3);
    }
  }

  //  判断是否json字符串
  checkIsJSON(str: any) {
    if (typeof str === 'string') {
      try {
        const obj: any = JSON.parse(str);
        return !!(typeof obj === 'object' && obj);
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  destroyed() {
    delete (window as any).h3form;
  }

  /**
   * 同步数据模型对应控件属性到控件的option中，
   * 注意：只能同步模型属性，不能同步控件属性
   */
  syncModelAttr(modelFilter: any, controlOption: any) {
    const modelProperties = [
      'dictionaryData',
      'format',
      'options',
      'mappings',
      'schemaCode',
      'showStyle',
      'queryCode',
      'displayField',
      'mappings',
      'conditions',
      'linkMode',
      'searchFormula',
      'prefix',
      'maxLength',
      'resetDate',
      'delimiter',
      'seqNoSetting',
    ];

    let options: any = {};
    if (typeof modelFilter.options === 'string') {
      try {
        options = JSON.parse(modelFilter.options) || {};
      } catch (error) {
        options = {};
      }
    }
    if (
      options &&
      options.hasOwnProperty('format') &&
      CompareVersion(this.version, this.formSystemVersion) === 1
    ) {
      options['format1'] = options['format'];
    }
    //若表单json中format1与数据模型中format1时，取表单json中format1
    options['format1'] =
      controlOption.format1 !== options['format1']
        ? controlOption.format1
        : options['format1'];
    delete options.defaultValue;
    const keys = Object.keys(controlOption);
    modelProperties.forEach((modelProperty) => {
      if (keys.includes(modelProperty)) {
        if (modelProperty === 'options') {
          controlOption[modelProperty] =
            options['labels'] ||
            options[modelProperty] ||
            controlOption[modelProperty];
        } else {
          controlOption[modelProperty] =
            options[modelProperty] || controlOption[modelProperty];
        }
      }
    });
    // data[i].options = Object.assign(data[i].options, options);
    //若勾选了同步数据模型中的格式，则使用数据模型中的格式来显示
    if (controlOption.syncFormate) {
      controlOption.format1 = options.format;
    }
  }
}

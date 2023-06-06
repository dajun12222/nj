<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <div class="modal-body">
      <!-- <p class="import-type-exit" @click="onTypeItemReturn">
        <span class="icon aufontAll h-icon-all-arrow-left-o"></span>
        <span v-if="importType === 'LOCAL'"> 本地导入</span>
        <span v-else> 应用市场</span>
      </p> -->
      <div v-if="!isShowUpdateCode" class="steps">
        <a-steps size="small" :current="1" :status="'process'">
          <a-step :title="$t('languages.Apps.UploadFile')" />
          <a-step :title="$t('languages.Apps.VerifyFile')">
            <a-icon v-if="!isValidated" slot="icon" type="loading" />
          </a-step>
          <a-step :title="$t('languages.Apps.Import')" />
        </a-steps>
      </div>

      <div v-if="isValidated" class="file-validate">
        <!-- 文件校验通过 -->
        <template v-if="!isShowUpdateCode">
          <errorMessage
            :isFileOk="isFileOk"
            :fileInvalid="fileInvalid"
            :isCodeRepeat="isCodeRepeat"
            :isShowErrorDetail="isShowErrDetail"
            :isModelCodeList="isModelCodeList"
            :coreRepeatErrMsg="coreRepeatErrMsg"
            :codeRepeatObj="codeRepeatObj"
            :modelPos="modelPos"
            :subTableErr="subTableErr"
            :subTableErr2="subTableErr2"
            :errDetails="errDetails"
            :fileErrMsg="fileErrMsg"
            :builtInApp="builtInApp"
            :overrideForImport="overrideForImport"
            @showErrorDetail="showErrorDetail"
            @closeErrorDetail="closeErrorDetail"
          />
        </template>
        <div v-else class="update-code-box">
          <updateCode
            ref="updateCode"
            :type="codeRepeatObj"
            :list="updateCodeDataList"
          />
        </div>
      </div>
    </div>

    <div v-if="isValidated && importType" class="modal-footer">
      <template v-if="isFileOk">
        <template v-if="isCodeRepeat && !overrideForImport">
          <!-- 修改编码对应footer -->
          <template v-if="isShowUpdateCode">
            <a-button type="default" @click="closeUpdateCode">返回</a-button>
            <a-button type="primary" @click="save">保存并返回</a-button>
          </template>

          <template v-else-if="!overrideForImport || builtInApp">
            <a-button type="default" @click="showUpdateCode">修改编码</a-button>
            <a-button
              v-if="!isModelCodeList && statusCode === '' && !builtInApp"
              type="primary"
              @click="importAndCover"
              >导入并覆盖</a-button>
          </template>
        </template>

        <template v-else>
          <template v-if="overrideForImport && !isShowErrDetail">
            <a-button
              type="default"
              @click="
                () => {
                  overrideForImport = false;
                }
              "
            >
              返回
            </a-button>
            <a-button type="primary" @click="directImport">继续导入</a-button>
          </template>
          <!-- 查看错误明细的时候 -->
          <template v-else-if="isShowErrDetail">
            <a-button type="default" @click="closeErrorDetail">返回</a-button>
            <a-button type="primary" @click="directImport">继续导入</a-button>
          </template>

          <!-- 直接导入 -->
          <a-button v-else type="primary" @click="directImport">导入</a-button>
        </template>
      </template>

      <template v-else>
        <a-button type="default" @click="prevStepEmit">上一步</a-button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import AppsApi from '@/apis/apps';
import { Icon, Input, Button, Steps } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import errorMessage from './error-message.vue';
import updateCode from './update-code.vue';

@Component({
  name: 'FileValidate',
  components: {
    AIcon: Icon,
    AInput: Input,
    errorMessage,
    updateCode,
    ASteps: Steps,
    AStep: Steps.Step,
    AButton: Button,
  },
})
export default class FileValidate extends Vue {
  @Prop() importType!: string;

  @Prop() fileName!: string;

  dmCodeList: any[] = [];

  subCodeList: any[] = [];

  reportCodeList: any[] = [];

  appCode: string = '';

  override: boolean = false;

  /**
   * 修改编码点击保存
   * 获取到修改的编码列表
   * */
  orignList: any = null;

  get isCodeRepeat() {
    const { codeRepeatObj } = this;
    return (
      codeRepeatObj.appCodeRepeat ||
      codeRepeatObj.modelCodeRepeat ||
      codeRepeatObj.recycleCodeRepeat ||
      codeRepeatObj.reportCodeRepeat
    );
  }

  // 文件是否正确
  isFileOk: boolean = false;

  // 文件错误
  fileErrMsg: string = '';

  // 是否校验完成
  isValidated: boolean = false;

  // 是否显示修改编码
  isShowUpdateCode: boolean = false;

  // 编码重复错误提示
  coreRepeatErrMsg: string = '';

  //模型重复
  isModelCodeList: boolean = false;

  //报表重复
  isReportCodeList: boolean = false;

  // 文件检验是否通过
  fileInvalid: boolean = false;

  // 模型位置
  modelPos: string = '';

  // 子表错误
  subTableErr: string = '';

  subTableErr2: string = '';

  // 需要更新的编码数据
  updateCodeDataList: any = {
    appCodeList: [],
    modelCodeList: [],
    subCodeList: [],
    reportCodeList: [],
  };

  repeatCodeEnum: any = {
    appCodeRepeat: '600021',
    modelCodeRepeat: '600027',
    recycleCodeRepeat: '600030',
    reportCodeRepeat: '600037',
  };

  // 编码重复
  codeRepeatObj: any = {
    appCodeRepeat: false,
    modelCodeRepeat: false,
    recycleCodeRepeat: false,
    reportCodeRepeat: false,
    bothRepeat: false,
  };

  // 错误明细
  errDetails: any = {
    appManager: [],
    dataModel: {},
    formDesinge: [],
    workflow: [],
    report: [],
  };

  isShowErr: boolean = true;

  isShowErrDetail: boolean = false;

  statusCode: any = '';

  builtInApp: boolean = false;

  mounted() {
    this.checkApp();
  }

  /**
   * 校验文件
   * */
  async checkApp() {
    const {
      fileName,
      dmCodeList,
      appCode,
      override,
      subCodeList,
      reportCodeList,
    } = this;
    const fromAppMarket = this.importType === 'MARKET' ? true : false;
    const params: Apps.AppItem.CheckAppParams = {
      appCode,
      fileName,
      override,
      dmCodeList,
      subCodeList,
      fromAppMarket,
      reportCodeList,
    };

    this.isShowUpdateCode = false;

    this.modelPos = '';
    this.subTableErr = '';
    this.subTableErr2 = '';

    this.isValidated = false;
    const res: any = await AppsApi.checkApp(params);
    this.isValidated = true;

    const { errcode, data, errmsg } = res;

    if (errcode === 0) {
      this.isFileOk = true;
      // 先将错误分类： 编码重复错误 |  其他错误
      const {
        appMsgList,
        dmMsgList,
        formMsgModel,
        workflowMsgList,
        reportMsgList,
        workflowList,
        formModelMap,
        builtInApp,
      } = data;
      this.builtInApp = builtInApp;
      this.fileInvalid =
        (appMsgList || []).length > 0 ||
        (dmMsgList || []).length > 0 ||
        (formMsgModel || []).length > 0 ||
        (workflowMsgList || []).length > 0 ||
        reportMsgList ||
        [].length > 0;
      // 校验成功
      if (!this.fileInvalid) {
        this.codeRepeatObj.appCodeRepeat = false;
        this.codeRepeatObj.modelCodeRepeat = false;
        this.codeRepeatObj.recycleCodeRepeat = false;
        this.codeRepeatObj.reportCodeRepeat = false;
        return { validSuccess: true };
      }

      const { repeatCodeEnum } = this;

      //应用编码重复
      this.codeRepeatObj.appCodeRepeat = (appMsgList || []).some(
        (item: any) => item.statusCode === repeatCodeEnum.appCodeRepeat,
      );

      //与回收站应用，模型重复
      this.codeRepeatObj.recycleCodeRepeat = (appMsgList || []).some(
        (item: any) => item.statusCode === repeatCodeEnum.recycleCodeRepeat,
      );

      // 业务模型编码重复 1. 应用会校验  2. 数据模型会校验
      const repeatFormAppChcek: boolean = (appMsgList || []).some(
        (item: any) => item.statusCode === repeatCodeEnum.modelCodeRepeat,
      );
      const repeatFormDmChcek: boolean = (dmMsgList || []).some(
        (item: any) => item.statusCode === '601001',
      );
      this.codeRepeatObj.modelCodeRepeat =
        repeatFormAppChcek || repeatFormDmChcek;

      //报表重复
      this.codeRepeatObj.reportCodeRepeat = (appMsgList || []).some(
        (item: any) => item.statusCode === repeatCodeEnum.reportCodeRepeat,
      );

      //覆盖导入条件 -- 应用重复且模型重复
      this.codeRepeatObj.bothRepeat =
        this.codeRepeatObj.appCodeRepeat && this.codeRepeatObj.modelCodeRepeat;

      // 应用或编码重复
      const {
        appCodeRepeat,
        modelCodeRepeat,
        recycleCodeRepeat,
        reportCodeRepeat,
        bothRepeat,
      } = this.codeRepeatObj;
      if (
        appCodeRepeat ||
        modelCodeRepeat ||
        recycleCodeRepeat ||
        reportCodeRepeat
      ) {
        if (recycleCodeRepeat) {
          this.coreRepeatErrMsg = `应用编码：${appMsgList[0].appCode}已存在回收站，是否修改编码？`;
          this.statusCode = appMsgList[0].statusCode;
          this.$emit('statusCode', appMsgList[0].statusCode);
        } else if (appCodeRepeat && !modelCodeRepeat) {
          this.coreRepeatErrMsg = `应用编码：${appMsgList[0].appCode}已存在，是否覆盖已存在的应用编码？`;
        } else if (!appCodeRepeat && modelCodeRepeat) {
          // 仅仅业务模型重复, 展示模型位置
          this.coreRepeatErrMsg = `是否覆盖已存在的模型？`;
          const modelPosArr: any = appMsgList
            .map((item: any) => {
              if (item.statusCode === repeatCodeEnum.modelCodeRepeat) {
                return item.errMsg;
              }
            })
            .filter((item: any) => !!item);
          this.modelPos = modelPosArr.join(';');

          // 子表错误整理
          let subErr: any = [];
          // 找出字表错误的项
          const subErrItem: any = (dmMsgList || []).find(
            (item: any) => item.statusCode === '601001',
          );
          if (subErrItem) {
            subErr = (subErrItem.data || []).map((item: any) => {
              return item.schemaName;
            });
          }
          this.subTableErr = subErr.length
            ? `${subErr.join(
                '，',
              )}的子表编码与系统中已经存在的模型编码重复，是否要覆盖模型编码？`
            : '';
          this.subTableErr2 = subErr.length
            ? `${subErr.join(
                '，',
              )}的子表编码与系统中已经存在的模型编码重复，请修改子表编码`
            : '';
          // 仅仅业务模型重复, 展示模型位置
          this.isModelCodeList = this.getModelCodeList(appMsgList).length
            ? true
            : false;
          //仅仅报表模型重复，展示报表位置
          this.isReportCodeList = this.getReportCodeList(appMsgList).length
            ? true
            : false;
        } else {
          this.coreRepeatErrMsg = this.builtInApp
            ? '应用编码跟业务模型编码已存在，请修改应用编码'
            : '应用编码跟业务模型编码已存在，是否要覆盖应用编码？';
        }

        // 组合应用编码重复的数组
        this.updateCodeDataList.appCodeList = this.getAppCodeList(appMsgList);
        // 组合业务模型重复的编码
        this.updateCodeDataList.modelCodeList =
          this.getModelCodeList(appMsgList);
        //组合报表重复的编码
        this.updateCodeDataList.reportCodeList =
          this.getReportCodeList(appMsgList);
        // 组合子表重复的编码
        this.updateCodeDataList.subCodeList = this.getSubCodeList(dmMsgList);

        this.updateCodeDataList.workflowList = this.getWorkflowList(
          this.orignList ? this.orignList.workflowList : workflowList,
        );
        this.updateCodeDataList.formModelMap = this.getFormModelMap(
          this.orignList ? this.orignList.formModelMap : formModelMap,
        );
      }
      // 其他情况, 展示明细

      this.errDetails.appManager = this.appErrorsHandler(appMsgList);

      this.errDetails.dataModel = this.dmErrorsHandler(dmMsgList);

      this.errDetails.formDesinge = this.formErrorsHandler(formMsgModel);

      this.errDetails.workflow = this.workflowErrorsHandler(workflowMsgList);

      this.errDetails.report = this.reportErrorsHandler(reportMsgList);

      return { isCodeRepeat: this.isCodeRepeat };
    } else if (errcode === 600028) {
      return { errcode, errmsg };
    } else {
      this.isFileOk = false;
      this.fileErrMsg = errmsg || '';
    }
  }

  /***************** 错误数据处理 start*******************/

  /**
   * 应用权限错误
   * */
  appErrorsHandler(list: any) {
    if (!list) {
      list = [];
    }
    const authCodes: string[] = ['200013', '202018'];
    const data: any[] = list
      .map((item: any) => {
        if (authCodes.includes(item.statusCode)) {
          return item.errMsg;
        }
      })
      .filter((i: any) => !!i);
    return data;
  }

  /**
   * 数据模型错误
   * */
  dmErrorsHandler(list: any) {
    if (!list) {
      list = [];
    }
    let data: any = {};

    // 业务模型编码冲突
    // const conflictSCItem:any = list.find((i:any) => i.statusCode === "601001");
    // let conflictCodesErrs: any[] = [];
    // if (conflictSCItem) {
    //   conflictCodesErrs = conflictSCItem.data.map((i:any) => {
    //     const { i }
    //   })
    // }

    // 关联表单绑定的业务模型在当前系统中没有找到时 301017
    const bizModelNotExistItem: any = list.find(
      (i: any) => i.statusCode === '301017',
    );

    let bizModelNotExistErrs: any[] = [];

    if (bizModelNotExistItem) {
      bizModelNotExistErrs = bizModelNotExistItem.data.map((item: any) => {
        const { schemaName, propertyName } = item;
        return `【${schemaName}】的关联表单-【${propertyName}】绑定的业务模型不存在，应用导入后请重新配置`;
      });
    }

    //关联表单业务模型不存在 数据字典不存在300017
    const bizModelSelectDataNotExist: any = list.find(
      (i: any) => i.statusCode === '300017',
    );
    if (bizModelSelectDataNotExist) {
      bizModelNotExistErrs = bizModelNotExistErrs.concat(
        bizModelSelectDataNotExist.data.map((item: any) => {
          return item.errMsg;
        }),
      );
    }

    //选项数据项业务模型不存在

    // 业务规则错误 550014
    let bizRuleAllErrs = [];
    const bizRuleErrItem = list.find((i: any) => i.statusCode === '550014');
    if (bizRuleErrItem) {
      bizRuleErrItem.data.forEach((el) => {
        const err: any = `
          【${el.schemaName}】中的业务规则-【${el.businessRuleName}】中的节点-【${el.nodeName}】中使用的${el.errMsg}，应用导入后请重新配置
        `;
        bizRuleAllErrs = bizRuleAllErrs.concat(err);
      });
    }

    // 数据权限错误
    let dataPermissionErrs = [];
    // 部门 200010
    let deptsErr: any = [];
    const errDeptItem = list.find((i: any) => i.statusCode === '200010');
    if (errDeptItem) {
      deptsErr = errDeptItem.data.map((i: any) => {
        const { schemaName, permGroupName } = i;
        return `系统检测到【${schemaName}】的数据权限-【${permGroupName}】中使用的组织机构在当前系统的组织机构中不存在，应用导入后请重新配置数据权限中的授权组织`;
      });
    }
    dataPermissionErrs = dataPermissionErrs.concat(deptsErr);

    // 角色 202006
    const rolesErr: any = [];
    const errRoleItem = list.find((i: any) => i.statusCode === '202006');
    if (errDeptItem) {
      deptsErr = errDeptItem.data.map((i: any) => {
        const { schemaName, permGroupName } = i;
        return `系统检测到【${schemaName}】的数据权限-【${permGroupName}】中使用的角色在当前系统的角色中不存在，应用导入后请重新配置数据权限中的授权角色`;
      });
    }
    dataPermissionErrs = dataPermissionErrs.concat(deptsErr);

    // 组合数据
    data = {
      dataModelErr: bizModelNotExistErrs,
      bizRuleErr: bizRuleAllErrs,
      dataPermErr: dataPermissionErrs,
    };

    return data;
  }

  /**
   * 表单错误
   * */
  formErrorsHandler(list: any) {
    if (!list) {
      list = [];
    }
    const fromCodes: string[] = ['200010'];
    const data: any[] = [];
    list.forEach((item: any) => {
      if (fromCodes.includes(item.statusCode)) {
        item.data.forEach((entry: any) => {
          if (entry.statusCode === '200010') {
            const { schemaName, propertyName } = entry;
            data.push(
              `【${schemaName}】的数据项-【${propertyName}】配置的根节点在当前系统中不存在，应用导入后请重新配置`,
            );
          } else if (entry.statusCode === '300004') {
            data.push(entry.errMsg);
          } else if (entry.statusCode === '202006') {
            const { schemaName, propertyName } = entry;
            data.push(
              `【${schemaName}】的数据项-【${propertyName}】配置的角色范围在当前系统中不存在，应用导入后请重新配置`,
            );
          } else {
            //Else Empty block statement
          }
        });
      }
    });
    return data;
  }

  /**
   * 流程错误
   * */
  workflowErrorsHandler(list: any) {
    if (!list) {
      list = [];
    }
    const data: any[] = list.map((item: any) => item.errMsg);
    return data;
  }

  /**
   * 报表错误
   * */
  reportErrorsHandler(list: any) {
    if (!list) {
      list = [];
    }
    const data: any[] = list.map((item: any) => item.errMsg);
    return data;
  }

  /***************** 错误数据处理 end*******************/

  // 是否展示修改编码
  showUpdateCode() {
    this.resetNewCode();
    this.$emit('setModalTitle', '导入-修改编码');
    this.isShowUpdateCode = true;
  }

  // 关闭修改编码
  closeUpdateCode() {
    this.$emit('setModalTitle', '导入-应用');
    this.isShowUpdateCode = false;
  }

  resetNewCode() {
    for (const key in this.updateCodeDataList) {
      if (Object.prototype.hasOwnProperty.call(this.updateCodeDataList, key)) {
        const element = this.updateCodeDataList[key];
        if (key === 'formModelMap') {
          for (const k in element) {
            if (Object.prototype.hasOwnProperty.call(element, k)) {
              const item = element[k];
              if (Array.isArray(item)) {
                item.forEach((item) => (item.newCode = ''));
              }
            }
          }
        } else {
          if (Array.isArray(element)) {
            element.forEach((element) => (element.newCode = ''));
          }
        }
      }
    }
  }

  showErrorDetail() {
    this.$emit('setModalTitle', '导入-异常明细');
    this.isShowErrDetail = true;
  }

  closeErrorDetail() {
    this.isShowErrDetail = false;
    this.$emit('setModalTitle', '导入-应用');
  }

  /**
   * 获取修改后的编码list
   * */
  getCodeList() {
    return (this.$refs.updateCode as any).getCodeList();
  }

  /**
   * 获取应用编码列表
   * */
  getAppCodeList(list: any[]) {
    const { repeatCodeEnum } = this;
    return list
      .map((item: any) => {
        if (
          item.statusCode === repeatCodeEnum.appCodeRepeat ||
          item.statusCode === repeatCodeEnum.recycleCodeRepeat
        ) {
          if (!this.orignList) {
            const { appName, appCode } = item;
            return {
              appName,
              appCode,
              newCode: '',
            };
          } else {
            return this.orignList.appCodeList.find(
              (el) =>
                el.newCode === item.appCode || el.appCode === item.appCode,
            );
          }
        }
      })
      .filter((i: any) => !!i);
  }

  /**
   * 获取模型编码列表
   * @params list 应用校验中的数据
   * @params dmList 数据模型校验中的数据
   * */
  getModelCodeList(list: any[]) {
    const { repeatCodeEnum } = this;
    const d1 = list
      .map((item: any) => {
        if (item.statusCode === repeatCodeEnum.modelCodeRepeat) {
          const { modelName, modelCode } = item;
          return {
            modelName,
            modelCode,
            newCode: '',
          };
        }
      })
      .filter((i: any) => !!i);

    return d1;
  }

  /**
   * 获取报表编码列表
   * @params list 应用校验中的数据
   */
  getReportCodeList(list: any[]) {
    const { repeatCodeEnum } = this;
    const reportCodeList = list
      .map((item) => {
        if (item.statusCode === repeatCodeEnum.reportCodeRepeat) {
          const { modelName, modelCode } = item;
          return {
            reportName: modelName,
            reportCode: modelCode,
            newCode: '',
          };
        }
      })
      .filter((i: any) => !!i);
    return reportCodeList;
  }

  // 获取流程列表
  getWorkflowList(workflowList) {
    if (!Array.isArray(workflowList)) {
      return [];
    }
    workflowList.forEach((el: any) => {
      el.newCode = el.newCode || '';
    });
    return workflowList;
  }

  // 获取表单列表
  getFormModelMap(getFormModelMap) {
    Object.keys(getFormModelMap).forEach((el: any) => {
      const item = getFormModelMap[el];
      item.forEach((element: any) => {
        element.newCode = element.newCode || '';
      });
    });
    return getFormModelMap;
  }

  /**
   * 获取子表编码列表
   * */
  getSubCodeList(list: any[]) {
    if (!list) {
      list = [];
    }
    // 子表重复
    const item: any = list.find((i: any) => i.statusCode === '601001');
    let d2: any = [];
    if (item) {
      d2 = item.data.map((d: any) => {
        return {
          modelName: d.schemaName,
          modelCode: d.schemaCode,
          newCode: '',
          parentSchemaName: d.parentSchemaName,
          parentSchemaCode: d.parentSchemaCode,
        };
      });
    }
    return d2;
  }

  formModelMap: any = {};

  workflowList: any[] = [];

  async save() {
    this.override = true;
    this.overrideForImport = false;
    let list: any = this.getCodeList();
    if (!list) {
      return;
    }
    this.appCode = '';
    this.dmCodeList = [];
    this.subCodeList = [];
    this.formModelMap = {};
    this.workflowList = [];
    this.reportCodeList = [];

    list = this.combinedList(list);
    this.appCode =
      list.appCodeList.length <= 0 ? '' : list.appCodeList[0].newCode;
    this.formModelMap = list.formModelMap;
    this.workflowList = list.workflowList;
    // 模型编码
    const temList: any[] = [];
    list.modelCodeList.forEach((item: any) => {
      const { modelCode, newCode } = item;
      temList.push({
        oldDmCode: modelCode,
        newDmCode: newCode,
      });
    });
    this.dmCodeList = temList;

    // 子表编码
    const temSubCodeList: any = [];
    list.subCodeList.forEach((item: any) => {
      const { modelCode, newCode } = item;
      temSubCodeList.push({
        oldDmCode: modelCode,
        newDmCode: newCode,
      });
    });
    this.subCodeList = temSubCodeList;

    // 报表编码
    const temReportCodeList: any = [];
    list.reportCodeList.forEach((item: any) => {
      const { reportCode, newCode } = item;
      temReportCodeList.push({
        oldDmCode: reportCode,
        newDmCode: newCode,
      });
    });
    this.reportCodeList = temReportCodeList;

    // 校验是否输入重复的编码

    const codes: any[] = [];
    const reportCodes: any[] = [];
    let existCodes: any[] = [];
    this.dmCodeList.forEach((l: any) => {
      codes.push(`【${l.newDmCode}】`);
    });

    this.subCodeList.forEach((l: any) => {
      codes.push(`【${l.newDmCode}】`);
    });

    this.reportCodeList.forEach((l: any) => {
      reportCodes.push(`【${l.newDmCode}】`);
    });

    existCodes = this.duplicates(codes) || this.duplicates(reportCodes);

    if (existCodes.length > 0) {
      const errStr: string = `多次输入重复的编码${existCodes.join(
        '、',
      )}，请保证输入的新编码唯一！`;
      this.$message.error(errStr);
      return;
    }
    this.orignList = JSON.parse(JSON.stringify(list));

    await this.$nextTick();
    const { validSuccess, isCodeRepeat, errcode, errmsg } =
      (await this.checkApp()) as any;

    if (validSuccess) {
      // 校验全部通过，直接导入
      this.closeUpdateCode();
      return;
      // this.directImport();
    } else if (isCodeRepeat) {
      // 校验编码有重复，停留当前页面继续修改编码
      this.$message.error(
        '检测到以下新编码与系统中已存在的编码重复，请重新修改',
      );
      this.showUpdateCode();
    } else if (errcode && errcode === 600028) {
      this.$message.error(errmsg);
      this.showUpdateCode();
    } else {
      this.isShowUpdateCode = false;
    }
  }

  /*
   * 合并新修改的编码数据与所有需更改的编码数据源
   */
  combinedList(list: any) {
    if (!this.orignList) {
      return list;
    }
    const result: any = {};
    result.appCodeList = this.orignList.appCodeList
      ? this.orignList.appCodeList.map((app: any) => {
          const appResult = list.appCodeList.find(
            (a: any) => a.appCode === app.appCode,
          );
          if (appResult) {
            return appResult;
          }
          return app;
        })
      : [];
    result.modelCodeList = this.orignList.modelCodeList
      ? this.orignList.modelCodeList.map((modal: any) => {
          const modalResult = list.modelCodeList.find(
            (a: any) => a.modelCode === modal.modelCode,
          );
          if (modalResult) {
            return modalResult;
          }
          return modal;
        })
      : [];
    result.subCodeList = this.orignList.subCodeList
      ? this.orignList.subCodeList.map((sub: any) => {
          const subResult = list.subCodeList.find(
            (a: any) => a.modelCode === sub.modelCode,
          );
          if (subResult) {
            return subResult;
          }
          return sub;
        })
      : [];
    result.reportCodeList = this.orignList.reportCodeList
      ? this.orignList.reportCodeList.map((report: any) => {
          const reportResult = list.reportCodeList.find(
            (a: any) => a.reportCode === report.reportCode,
          );
          if (reportResult) {
            return reportResult;
          }
          return report;
        })
      : [];

    result.workflowList = list.workflowList;
    result.formModelMap = list.formModelMap;
    return result;
  }

  duplicates(arr: any) {
    const result: any = [];
    arr.forEach((item: string) => {
      if (
        arr.indexOf(item) !== arr.lastIndexOf(item) &&
        result.indexOf(item as any) === -1
      ) {
        result.push(item);
      }
    });
    return result;
  }

  overrideForImport: boolean = false;

  coverImport: boolean = false;

  /**
   * 直接导入
   * */
  directImport() {
    this.nextStep();
  }

  /**
   * 覆盖并导入
   * */
  importAndCover() {
    this.overrideForImport = true;
    if (this.isErrDetail) {
      this.nextStep();
    }
  }

  get isErrDetail() {
    return (
      this.errDetails.appManager.length === 0 &&
      this.errDetails.formDesinge.length === 0 &&
      this.errDetails.workflow.length === 0 &&
      this.errDetails.report.length === 0 &&
      this.errDetails.dataModel.bizRuleErr.length === 0 &&
      this.errDetails.dataModel.dataModelErr.length === 0 &&
      this.errDetails.dataModel.dataPermErr.length === 0
    );
  }

  nextStep() {
    this.$emit('nextStep', {
      dmCodeList: this.dmCodeList,
      subCodeList: this.subCodeList,
      appCode: this.appCode,
      override: this.overrideForImport,
      formModelMap: this.formModelMap,
      workflowList: this.workflowList,
      reportCodeList: this.reportCodeList,
    });
  }

  prevStepEmit() {
    this.$emit('prevStep');
  }

  onTypeItemReturn() {
    this.$emit('onTypeItemReturn');
  }
}
</script>

<style lang="less">
@import '~@/styles/import/file-validate.less';
</style>

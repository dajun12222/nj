/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import ImportStrategy from './importStrategy';
import AppsApi from '@/apis/apps';
import * as FileValidateNS from '@/typings/app-error';

class BizModelStrategy implements ImportStrategy {
  noRepeatMsg = '模型编码无重复';

  generateImportParam({
    validResult,
    schemaCode,
    fileName,
    coverAble,
    uploadResult,
    isImportDataRule,
  }) {
    const map: any = JSON.parse(JSON.stringify(validResult.subSchemaCodes));

    for (const key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        const element = map[key];
        if (element === '') {
          delete map[key];
        }
      }
    }

    const workflowCodeChangedMap = {};
    validResult.workflowsList.map((el: any) => {
      if (el.newCode && el.newCode !== el.workflowCode) {
        workflowCodeChangedMap[el.workflowCode] = el.newCode;
      }
    });
    const sheetCodeChangedMap = {};
    validResult.bizFormsList.map((el: any) => {
      if (el.newCode && el.newCode !== el.code) {
        sheetCodeChangedMap[el.code] = el.newCode;
      }
    });
    return {
      schemaCode,
      fileName,
      coverAble,
      parentId: uploadResult.folderId,
      subCodes: map,
      isImportDataRule: isImportDataRule,
      workflowCodeChangedMap,
      sheetCodeChangedMap,
    };
  }

  /**
   * 文件校验
   * @parms
   * fileName 文件名称
   * coverAble 是否覆盖
   * schemaCode 模型编码
   */
  checkPackage({ schemaCode, fileName, coverAble, vm }) {
    const params = {
      schemaCode,
      fileName,
      coverAble,
      isImportDataRule: vm.isImportDataRule,
      schemaType: 'BizModel',
    };
    this.checkApi(params).then((res: any) => {
      vm.isValidated = true;
      const data = res.data;
      if (res.errcode === 0) {
        if (data.result) {
          vm.subSchemaCodes =
            vm.subSchemaCodes === null
              ? data.subSchemaCodes
              : vm.subSchemaCodes; // 子表数据项
          vm.subSchemaNames = data.subSchemaNames; // 子表数据项名称
          vm.appFunctionModel = data.appFunctionModel; // 所在目录
          vm.appPackageModel = data.appPackageModel; // 所在应用

          vm.codeList = [
            {
              code: data.schemaCode,
              name: data.name,
              newCode: data.schemaCode,
              oldCode: data.schemaCode,
            },
          ];

          if (Array.isArray(data.bizForms)) {
            data.bizForms.forEach((el: any) => {
              el.newCode = el.newCode || '';
            });
          }

          if (Array.isArray(data.workflows)) {
            data.workflows.forEach((el: any) => {
              el.newCode = el.newCode || '';
            });
          }

          vm.bizFormsList = data.bizForms || []; // 表单
          vm.workflowsList = data.workflows || []; // 流程

          vm.repeated =
            data.repeated || data.subSchemaCodes || data.repeatWorkflowCodes; // 记录是否模型编码重复
          vm.isDelete = data.delete; //记录是否对应的是回收站模型重复
          if (vm.repeated) {
            vm.warnInfoList.repeatMsg = [];
            if (vm.isShowCodeRepeat) {
              if (vm.isPackageModel && vm.appPackageModel) {
                vm.warnInfoList.repeatMsg.push(
                  `是否覆盖已存在的业务模型编码？模型位置:${
                    vm.isDelete ? '回收站-' : ''
                  }${vm.appPackageModel.name}${
                    vm.appFunctionModel ? '-' + vm.appFunctionModel.name : ''
                  }`,
                );
              } else if (vm.appPackageModel) {
                vm.warnInfoList.repeatMsg.push(
                  `当前业务模型编码已存在，模型位置:${
                    vm.isDelete ? '回收站-' : ''
                  }${vm.appPackageModel.name}${
                    vm.appFunctionModel ? '-' + vm.appFunctionModel.name : ''
                  }`,
                );
              } else {
                //Else Empty block statement
              }
            }
            if (vm.isShowCodeRepeat && vm.subSchemaCodes) {
              vm.warnInfoList.repeatMsg.push(
                `${vm.$t(
                  'languages.Apps.DocumentValidatedAndSheetcodeExistPlzModify',
                )}`,
              );
            }
            if (vm.isPackageModel) {
              vm.warnInfoList.repeatMsg.push(
                `${vm.$t(
                  'languages.Apps.ImportWillReplaceDatamodelFormAndProcess',
                )}`,
              );
            }
            vm.warnInfoList.repeatMsg.push(
              `${vm.$t(
                'languages.Apps.ImportWithModifiedCodeWillGenerateNewBizmodel',
              )}`,
            );
          }
          if (data.warningMsgs && data.warningMsgs.length !== 0) {
            vm.warnInfoList.warnMsg = data.warningMsgs;
          }

          if (data.repeated || data.subSchemaCodes) {
            // 编码重复
            vm.validateStatus = FileValidateNS.FileValidateStatus.CodeRepeat;
            return;
          }

          if (data.warningMsgs && data.warningMsgs.length !== 0) {
            vm.warnInfoList.warnMsg = data.warningMsgs;
            vm.validateStatus =
              FileValidateNS.FileValidateStatus.referCodesError;
            return;
          }

          if (data.errorType === 0) {
            vm.validateStatus = FileValidateNS.FileValidateStatus.ValidateOk;
          }
        } else {
          // 校验失败
          vm.validateStatus = FileValidateNS.FileValidateStatus.ValidateError;
          vm.errorType = data.errorType;
          vm.errorInfo = data.resultInfo;
          vm.isShowUpdateCode = true;
        }
        // 文件校验成功
      } else {
        vm.validateStatus = FileValidateNS.FileValidateStatus.ValidateError;
        vm.errorType = res.errcode;
        vm.errorInfo = res.errmsg;
      }
    });
  }

  checkApi(params: any) {
    return new Promise((resolve, reject) => {
      AppsApi.check_package_new(params).then((res: any) => {
        resolve(res);
      });
    });
  }

  /**
   *
   * @param vm 文件校验界面Vue实例
   */
  checkAndImport({ schemaCode, fileName, coverAble, vm }) {
    vm.isShowUpdateCode = true;
    const map: any = vm.subSchemaCodes;

    const workflowCodeChangedMap = {};
    vm.workflowsList.forEach((el: any) => {
      if (el.newCode) {
        workflowCodeChangedMap[el.workflowCode] = el.newCode;
      }
    });
    const params = {
      schemaCode,
      fileName,
      coverAble,
      map,
      isImportDataRule: vm.isImportDataRule,
      workflowCodeChangedMap,
      schemaType: 'BizModel',
    };

    this.checkApi(params).then((res: any) => {
      vm.isValidated = true;
      if (res.errcode === 0) {
        const data = res.data;
        vm.subSchemaCodes =
          vm.subSchemaCodes === null ? data.subSchemaCodes : vm.subSchemaCodes; // 子表数据项
        vm.subSchemaNames = data.subSchemaNames; // 子表数据项名称
        vm.appFunctionModel = data.appFunctionModel; // 所在目录
        vm.appPackageModel = data.appPackageModel; // 所在应用
        vm.isDelete = data.delete;

        if (data.result) {
          vm.repeated =
            data.repeated || data.subSchemaCodes || data.repeatWorkflowCodes;
          if (
            data.repeated ||
            data.subSchemaCodes ||
            data.repeatWorkflowCodes
          ) {
            if (data.repeatNodeType === 'BizModel') {
              (vm.$refs.updateCode as any).tabClick('1');
            } else if (data.subSchemaCodes) {
              (vm.$refs.updateCode as any).tabClick('2');
            } else if (data.repeatWorkflowCodes) {
              (vm.$refs.updateCode as any).tabClick('4');
            } else {
              //Else Empty block statement
            }
            vm.$message.error(
              '检测到以下新编码与系统中已存在的编码重复，请重新修改',
            );
          } else {
            vm.isShowUpdateCode = false;
            if (data.warningMsgs && data.warningMsgs.length !== 0) {
              vm.warnInfoList.warnMsg = data.warningMsgs;
              vm.validateStatus =
                FileValidateNS.FileValidateStatus.referCodesError;
              vm.codeList[0].code = vm.codeList[0].newCode;
              return;
            }
          }

          if (data.errorType === 0) {
            vm.validateStatus = FileValidateNS.FileValidateStatus.ValidateOk;
            vm.codeList[0].code = vm.codeList[0].newCode;
          }
        } else {
          // 校验错误直接弹出错误
          vm.$message.error(data.errmsg);
        }
      } else {
        vm.$message.error(res.errmsg);
      }
    });
  }

  /**
   *
   * @param vm 文件校验界面Vue实例
   */
  modifySchemaCodesImport(vm) {
    vm.oldSheetList = JSON.parse(JSON.stringify(vm.sheetList));

    const backData: any = {};
    vm.sheetList.forEach((item: any) => {
      backData[item.code] = item.newCode;
    });

    vm.subSchemaCodes = Object.assign(vm.subSchemaCodes || {}, backData);

    const list: any = vm.getCodeList();
    if (!list) {
      return;
    }
    if (vm.checkDuplicate(list)) {
      vm.$message.error('检测到新输入编码与原编码相同，请修改！');
      return;
    }
    this.checkAndImport({
      schemaCode: vm.codeList[0].newCode,
      fileName: vm.fileName,
      coverAble: false,
      vm,
    });
  }

  /**
   *
   * @param vm 文件校验界面Vue实例
   */
  resSetNewCode(vm) {
    vm.bizFormsList.forEach((el) => (el.newCode = ''));
    vm.sheetList = JSON.parse(JSON.stringify(vm.oldSheetList));
    vm.codeList[0].newCode = vm.codeList[0].code;
  }

  /**
   * @Param
   * vm: 修改编码界面Vue实例
   */
  afterUpdateMounted(vm) {
    const subLen = vm.list.sheetList.length;
    const formLen = vm.list.bizFormsList.length;
    const workflowLen = vm.list.workflowsList.length;
    if (vm.repeated && !vm.isCoverable) {
      vm.tabKey = '1';
    } else if (subLen > 0) {
      vm.tabKey = '2';
    } else if (formLen > 0) {
      vm.tabKey = '3';
    } else if (workflowLen > 0) {
      vm.tabKey = '4';
    } else {
      //Else Empty block statement
    }

    vm.list.bizFormsList.forEach((el: any) => {
      el.newCode = el.code;
    });
  }

  /**
   * @Param
   * vm: 修改编码界面Vue实例
   */
  updateCodeSubmit(vm) {
    let existEmptyModelcode: boolean = false;
    let existEmptySubCode: boolean = false;
    let existValidModelcode: boolean = false;
    let existValidSubCode: boolean = false;

    if (vm.list.codeList.length > 0) {
      // 模型
      existEmptyModelcode = vm.list.codeList.some((item: any) => !item.newCode);
      existValidModelcode = vm.list.codeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,23}$/.test(item.newCode),
      );
    }

    if (vm.list.sheetList.length > 0) {
      // 子表
      existEmptySubCode = vm.list.sheetList.some((item: any) => !item.newCode);
      existValidSubCode = vm.list.sheetList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,27}$/.test(item.newCode),
      );
    }

    if (existEmptyModelcode || existEmptySubCode) {
      let type = '';
      if (existEmptyModelcode) {
        vm.tabKey = '1';
        type = '模型';
      } else {
        vm.tabKey = '2';
        type = '子表';
      }
      vm.$message.error(type + '新编码不能为空');
      return null;
    }

    if (existValidModelcode || existValidSubCode) {
      let type = '';
      if (existValidModelcode) {
        vm.tabKey = '1';
        type = '模型';
      } else {
        vm.tabKey = '2';
        type = '子表';
      }

      vm.$message.error(
        type +
          `编码格式必须以字母开头不超过${
            existValidModelcode ? 24 : 28
          }个字符，仅支持字母、数字、下划线`,
      );
      return null;
    }
    return vm.list;
  }

  getNewCode(vm) {
    return vm.codeList[0].newCode;
  }
}

const bizModelStrategy = new BizModelStrategy();

export default bizModelStrategy;

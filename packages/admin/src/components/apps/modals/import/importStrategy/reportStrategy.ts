/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import ImportStrategy from './importStrategy';
import AppsApi from '@/apis/apps';
import * as FileValidateNS from '@/typings/app-error';

class ReportStrategy implements ImportStrategy {
  noRepeatMsg = '报表编码无重复';

  generateImportParam({
    validResult,
    schemaCode,
    fileName,
    coverAble,
    uploadResult,
    isImportDataRule,
  }) {
    return {
      schemaCode,
      fileName,
      coverAble,
      parentId: uploadResult.folderId,
      isImportDataRule: isImportDataRule,
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
      schemaType: 'Report',
    };
    this.checkApi(params).then((res: any) => {
      vm.isValidated = true;
      const data = res.data;
      if (res.errcode === 0) {
        if (data.result) {
          vm.reportList = [
            {
              code: data.schemaCode,
              name: data.name,
              newCode: data.schemaCode,
              oldCode: data.schemaCode,
            },
          ];

          vm.appFunctionModel = data.appFunctionModel; // 所在目录
          vm.appPackageModel = data.appPackageModel; // 所在应用

          vm.repeated = data.repeated; // 记录是否报表编码重复
          vm.isDelete = data.delete; //记录是否对应的是回收站报表重复
          if (vm.repeated) {
            vm.warnInfoList.repeatMsg = [];
            if (vm.isShowCodeRepeat) {
              if (vm.isPackageModel && vm.appPackageModel) {
                vm.warnInfoList.repeatMsg.push(
                  `是否覆盖已存在的报表编码？报表位置:${
                    vm.isDelete ? '回收站-' : ''
                  }${vm.appPackageModel.name}${
                    vm.appFunctionModel ? '-' + vm.appFunctionModel.name : ''
                  }`,
                );
              } else if (vm.appPackageModel) {
                vm.warnInfoList.repeatMsg.push(
                  `当前报表编码已存在，报表位置:${
                    vm.isDelete ? '回收站-' : ''
                  }${vm.appPackageModel.name}${
                    vm.appFunctionModel ? '-' + vm.appFunctionModel.name : ''
                  }`,
                );
              } else {
                //Else Empty block statement
              }
            }
            if (vm.isPackageModel) {
              vm.warnInfoList.repeatMsg.push(
                `${vm.$t('languages.Apps.ImportWillReplaceReport')}`,
              );
            }
            vm.warnInfoList.repeatMsg.push(
              `${vm.$t(
                'languages.Apps.ImportWithModifiedCodeWillGenerateNewReport',
              )}`,
            );
          }
          if (data.warningMsgs && data.warningMsgs.length !== 0) {
            vm.warnInfoList.warnMsg = data.warningMsgs;
          }

          if (data.repeated) {
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
        //
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

    const params = {
      schemaCode,
      fileName,
      coverAble,
      isImportDataRule: vm.isImportDataRule,
      schemaType: 'Report',
    };

    this.checkApi(params).then((res: any) => {
      vm.isValidated = true;
      if (res.errcode === 0) {
        const data = res.data;
        vm.appFunctionModel = data.appFunctionModel; // 所在目录
        vm.appPackageModel = data.appPackageModel; // 所在应用
        vm.isDelete = data.delete;

        if (data.result) {
          vm.repeated = data.repeated;
          if (data.repeated) {
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
    const list: any = vm.getCodeList();
    if (!list) {
      return;
    }
    if (vm.checkDuplicate(list)) {
      vm.$message.error('检测到新输入编码与原编码相同，请修改！');
      return;
    }
    this.checkAndImport({
      schemaCode: vm.reportList[0].newCode,
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
    vm.reportList[0].newCode = vm.reportList[0].code;
  }

  /**
   * @Param
   * vm: 修改编码界面Vue实例
   */
  afterUpdateMounted(vm) {
    vm.tabKey = '5';
  }

  /**
   * @Param
   * vm: 修改编码界面Vue实例
   */
  updateCodeSubmit(vm) {
    let emptyError: boolean = false;
    let unValidError: boolean = false;

    if (vm.list.reportsList.length > 0) {
      // 模型
      emptyError = vm.list.codeList.some((item: any) => !item.newCode);
      unValidError = vm.list.codeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,23}$/.test(item.newCode),
      );
    }

    if (emptyError) {
      const type = '报表';
      vm.$message.error(type + '新编码不能为空');
      return null;
    }

    if (unValidError) {
      const type = '报表';

      vm.$message.error(
        type + `编码格式必须以字母开头不超过24个字符，仅支持字母、数字、下划线`,
      );
      return null;
    }
    return vm.list;
  }

  getNewCode(vm) {
    return vm.reportList[0].newCode;
  }
}

const reportStrategy = new ReportStrategy();

export default reportStrategy;

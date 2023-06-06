<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <div class="modal-body">
      <div v-if="!isShowUpdateCode" class="steps">
        <a-steps size="small" :current="1" :status="'process'">
          <a-step :title="$t('languages.Apps.UploadFile')" />
          <a-step :title="$t('languages.Apps.VerifyFile')">
            <a-icon v-if="!isValidated" slot="icon" type="loading" />
          </a-step>
          <a-step :title="$t('languages.Apps.Import')" />
        </a-steps>
      </div>

      <div class="file-validate">
        <!-- 文件校验通过 -->
        <div
          v-if="validateStatus === 'ok' && !isShowUpdateCode"
          class="validate-box"
        >
          <div class="file-status">
            <i
              class="icon aufontAll h-icon-all-check-circle file-status-icon"
            ></i>
            <span class="file-status-txt">{{
              $t('languages.Apps.DocumentChecked')
            }}</span>
          </div>
          <p style="margin-top: 8px; color: #999">{{ strategy.noRepeatMsg }}</p>
        </div>

        <update-code
          v-else-if="isShowUpdateCode"
          ref="updateCode"
          :list="list"
          :repeated="repeated"
          :isCoverable="isCoverable"
          :strategy="strategy"
          @inputChange="inputChange"
        />

        <error-message
          v-else
          :validateStatus="validateStatus"
          :isDataModelError="isDataModelError"
          :isSubTableRepeat="isSubTableRepeat"
          :errorInfo="errorInfo"
          :warnInfoList="warnInfoList"
          :repeated="repeated"
          :isCoverable="isCoverable"
        />
      </div>
    </div>

    <div class="modal-footer">
      <!-- 1. 校验成功 -->
      <template v-if="validateStatus === 'ok' && !isShowUpdateCode">
        <a-button v-if="!isShowUpdateCode" @click="updateCode">
          {{ $t('languages.Apps.EditCode') }}
        </a-button>
        <!-- 导入 -->
        <a-button type="primary" @click="doImport">
          {{ $t('languages.Apps.Import') }}
        </a-button>
      </template>

      <!-- 2. 编码重复 -->
      <template
        v-if="validateStatus === 'repeat' && !isShowUpdateCode && !isCoverable"
      >
        <!-- 修改编码 -->
        <template>
          <a-button v-if="!isShowUpdateCode" @click="updateCode">
            {{ $t('languages.Apps.EditCode') }}
          </a-button>
        </template>
        <!-- 导入并覆盖 -->
        <a-button
          v-if="showCover"
          type="primary"
          class="ant-btn-large"
          @click="importAndCover"
        >
          {{ $t('languages.Apps.ImportAndCover') }}
        </a-button>
      </template>

      <!-- 3. 对象不存在错误 -->
      <!-- 取消 -->
      <template v-if="validateStatus === 'referCode' && !isShowUpdateCode">
        <a-button @click="handleCancel">
          {{ $t('languages.Apps.Cancel') }}
        </a-button>

        <a-button v-if="!isShowUpdateCode" @click="updateCode">
          {{ $t('languages.Apps.EditCode') }}
        </a-button>

        <a-button type="primary" @click="doImport">
          {{ $t('languages.Apps.Import') }}
        </a-button>
      </template>

      <!-- 4. 文件错误 -->
      <template v-if="validateStatus === 'error' && !isShowUpdateCode">
        <a-button type="primary" @click="prevStep">
          {{ $t('languages.Apps.PreStep') }}
        </a-button>
      </template>

      <!-- 5. 修改编码界面 -->
      <template v-if="isShowUpdateCode">
        <!-- 返回 -->
        <a-button @click="returnClick">
          {{ $t('languages.Apps.return') }}
        </a-button>

        <!-- 保存并返回 -->
        <a-button
          type="primary"
          class="ant-btn-large"
          @click="returnAndSaveClick"
        >
          {{ $t('languages.Apps.SaveAndReturn') }}
        </a-button>
      </template>

      <!-- 6. 导入并覆盖界面 -->
      <template v-if="isCoverable && !isShowUpdateCode">
        <!-- 返回 -->
        <a-button
          @click="
            () => {
              isCoverable = false;
            }
          "
        >
          {{ $t('languages.Apps.return') }}
        </a-button>

        <a-button @click="updateCode">
          {{ $t('languages.Apps.EditCode') }}
        </a-button>

        <!-- 继续导入 -->
        <a-button type="primary" @click="doImport"> 继续导入 </a-button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import * as FileValidateNS from '@/typings/app-error';
import { Button, Icon, Input, Steps } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import ErrorMessage from './errorMessage.vue';
import UpdateCode from './update-code.vue';
import ImportStrategy from './importStrategy/importStrategy';

@Component({
  name: 'FileValidate',
  components: {
    AIcon: Icon,
    AInput: Input,
    UpdateCode,
    ErrorMessage,
    ASteps: Steps,
    AStep: Steps.Step,
    AButton: Button,
  },
})
export default class FileValidate extends Vue {
  @Prop() uploadResult!: any;

  //导入策略 -- 报表 or 模型
  @Prop() strategy!: ImportStrategy;

  /**
   * 控制逻辑
   */
  validateStatus: string = ''; // 校验状态

  isValidated: boolean = false; // 是否校验完成， loading图标

  isDelete: boolean = false; //是否回收站模型

  isImportDataRule: any = null; // 是否导入数据规则

  repeated: boolean = false; // 模型编码重复

  isCoverable: boolean = false; // 是否覆盖

  isShowUpdateCode: boolean = false; //是否展示修改编码按钮

  canSave: boolean = false; //修改编码界面是否展示保存并返回按钮

  /**
   * 中间数据存储
   */
  bizFormsList: any[] = []; // 表单

  workflowsList: any[] = []; // 流程

  codeList: any[] = []; //模型

  reportList: any[] = []; //报表

  sheetList: any[] = []; //子表

  warnInfoList: any = {
    repeatMsg: [],
    warnMsg: [],
  }; //错误列表

  subSchemaCodes: any = null; // 记录子表编码重复

  appFunctionModel: any = null; // 所在目录

  appPackageModel: any = null; // 所在应用

  oldSheetList: any[] = []; //修改编码界面，回退编码

  sheetItemDate: any = new Map(); //子表修改编码相关

  /**
   * 其他
   */

  fileName: string = ''; //文件名，由上传界面收集

  errorType: number = -1; // 导入错误对应的类型

  errorInfo: string = ''; // 数据项错误时的错误文案

  subSchemaNames: any = null; // 业务模型子表名称

  get list() {
    return {
      codeList: this.codeList,
      sheetList: this.sheetList,
      bizFormsList: this.bizFormsList,
      workflowsList: this.workflowsList,
      reportsList: this.reportList,
    };
  }

  get isShowCodeRepeat() {
    // 与是否显示修改编码互斥
    return !this.isShowUpdateCode;
  }

  // 是否 当前应用
  get isPackageModel() {
    console.log('I am in');
    return (
      (this.appPackageModel &&
        this.$route.params.appCode === this.appPackageModel.code) ||
      false
    );
  }

  get isDataModelError() {
    return (
      this.errorType === FileValidateNS.FileValidateTypes.DataItemTypeError
    );
  }

  get isSubTableRepeat() {
    return (
      this.errorType === FileValidateNS.FileValidateTypes.SubTableCodeRepeat
    );
  }

  get errorTxt() {
    switch (this.errorType) {
      case FileValidateNS.FileValidateTypes.FileFormateError:
        return this.$t('languages.Apps.FileFormateError');
      case FileValidateNS.FileValidateTypes.VersionError:
        return this.$t('languages.Apps.VersionError');
      case FileValidateNS.FileValidateTypes.SystemError:
        return this.$t('languages.Apps.SystemError');
      case FileValidateNS.FileValidateTypes.RepeatCode:
        return this.$t('languages.Apps.RepeatCode');
      case FileValidateNS.FileValidateTypes.SubTableCodeRepeat:
        return this.$t('languages.Apps.RepeatCode');
      case FileValidateNS.FileValidateTypes.RelativeModelNotImported:
        return this.$t('languages.Apps.RelativeModelNotImported');
      case FileValidateNS.FileValidateTypes.SubFlowNeedBeImportedFirst:
        return this.$t('languages.Apps.SubFlowNeedBeImportedFirst');
      case 10005:
        return this.errorInfo;
      case 50000:
        return '服务异常';
      default:
        return null;
    }
  }

  mounted() {
    this.fileName = this.uploadResult.fileName;

    this.strategy.checkPackage({
      schemaCode: '',
      fileName: this.fileName,
      coverAble: false,
      vm: this,
    });
  }

  /**
   * 获取修改后的编码list
   * */
  getCodeList() {
    return (this.$refs.updateCode as any).submit();
  }

  @Watch('subSchemaCodes')
  onSubSchemaCodesChange(v: any) {
    if (v && this.sheetList.length === 0) {
      for (const code in v) {
        if (v.hasOwnProperty(code)) {
          this.sheetItemDate.set(code, {
            code,
            val: v[code],
            validateErrorTxt: '',
          });
        }
      }
    }
  }

  @Watch('subSchemaNames')
  onSubSchemaNamesChange(v: any) {
    this.sheetList = [];
    for (const key in v) {
      if (v.hasOwnProperty(key)) {
        const sheetName = {
          name: v[key],
        };
        const sheetObj = Object.assign(this.sheetItemDate.get(key), sheetName);
        sheetObj.newCode = sheetObj.newCode || sheetObj.code;
        this.sheetList.push(sheetObj);
      }
    }
    this.oldSheetList = JSON.parse(JSON.stringify(this.sheetList));
  }

  /**
   * 关闭弹窗
   */
  handleCancel() {
    this.$emit('handleCancel');
  }

  /**
   * 修改编码
   */
  updateCode() {
    this.canSave = false;
    this.isShowUpdateCode = true;
  }

  /**
   * 修改编码界面如果有输入变化就显示保存并返回按钮
   */
  inputChange(list: any) {
    this.canSave = true;

    // this.codeList = list.codeList
    // this.sheetList = list.sheetList
    // this.bizFormsList = list.bizFormsList
    // this.workflowsList = list.workflowsList
  }

  /**
   * 修改编码界面返回
   */
  returnClick() {
    this.isShowUpdateCode = false;
    this.strategy.resSetNewCode(this);
  }

  returnAndSaveClick() {
    // 保存并返回
    this.$nextTick(() => {
      this.strategy.modifySchemaCodesImport(this);
    });
  }

  nextStep() {
    this.$emit('nextStep', {
      subSchemaCodes: this.subSchemaCodes,
      workflowsList: this.workflowsList,
      bizFormsList: this.bizFormsList,
      schemaCode: this.strategy.getNewCode(this),
      coverAble: this.isCoverable,
      isImportDataRule: this.isImportDataRule,
    });
  }

  prevStep() {
    this.$emit('prevStep');
  }

  importAndCover() {
    //this.checkAndImport('',this.fileName,true)
    /* 只有当点击导入并覆盖按钮且errorType为7时才弹窗 */
    this.isCoverable = true;
    if (this.warnInfoList.warnMsg && this.warnInfoList.warnMsg.length === 0) {
      this.doImport();
    }
  }

  doImport() {
    this.nextStep();
  }

  get showCover() {
    // console.log(this.appPackageModel, 'this.appPackageModel');
    if (this.appPackageModel) {
      return (
        this.$route.params.appCode === this.appPackageModel.code &&
        !this.isShowUpdateCode
      );
    }
    return false;
  }

  //修改编码保存时校验新编码是否存在有重复输入的情况
  checkDuplicate(list) {
    //子表所有重复的编码
    const existCodes = this.clearDuplicate(
      this.findDuplicate(list.sheetList).concat(
        this.findDuplicate(list.bizFormsList),
      ),
    );
    if (existCodes.length > 0) {
      const errStr: string = `多次输入重复的编码${existCodes.join(
        '、',
      )}，请保证输入的新编码唯一！`;
      this.$message.error(errStr);
      return true;
    }
    return false;
  }

  /**
   * 去除数组中的重复元素
   * 返回不含重复元素的数组
   */
  clearDuplicate(arr) {
    const codeSet = new Set();
    const notDupArr = [];
    arr.forEach((item) => {
      if (!codeSet.has(item)) {
        codeSet.add(item);
        notDupArr.push(item);
      }
    });
    return notDupArr;
  }

  /**
   * 判断数组中是否有拥有相同的newCode重复元素
   * 若有，返回重复元素的newCode数组
   */
  findDuplicate(arr) {
    const codeSet = new Set();
    const dupArr = [];
    arr.forEach((item) => {
      if (codeSet.has(item.newCode)) {
        dupArr.push(item.newCode);
      } else {
        codeSet.add(item.newCode);
      }
    });
    return dupArr;
  }
}
</script>

<style lang="less">
@import '~@/styles/import/file-validate.less';
</style>

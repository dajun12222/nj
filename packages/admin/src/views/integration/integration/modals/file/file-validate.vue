<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div v-if="isValidated" class="file-validate">
    <!-- 文件校验通过 -->
    <div v-if="!isShowUpdateCode" class="validate-box">
      <div class="file-status">
        <template v-if="isFileOk">
          <i
            class="icon aufontAll h-icon-all-check-circle file-status-icon"
          ></i>
          <span class="file-status-txt">{{
            $t('languages.Apps.DocumentChecked')
          }}</span>
        </template>

        <!-- 文件错误，如非法文件等 -->
        <template v-else>
          <i
            class="icon aufontAll h-icon-all-close-circle file-status-icon error"
          ></i>
          <span class="file-status-txt">{{ fileErrMsg }}</span>
        </template>
      </div>

      <template v-if="isFileOk && fileInvalid && isShowErr">
        <div class="file-check-status">
          <template>
            <span>{{ coreRepeatErrMsg }}</span>
          </template>
        </div>
        <div class="status-tip">
          <p>
            1. 选择导入覆盖，按照以下规则：<br />
            当前系统和导入文件中都存在的业务方法：使用导入文件中的覆盖<br />
            当前系统已存在，且导入文件中不存在的业务方法：仍然保留<br />
            当前系统中未存在的业务方法：直接导入
          </p>
          <p>2. 修改编码再导入，将会生成新的服务方法</p>
        </div>
      </template>
    </div>
    <div v-if="isShowUpdateCode" class="update-code-box">
      <updateCode ref="updateCode" :type="codeRepeatObj" :list="updateList" />
    </div>

    <div v-if="isShowErrorDetail" class="update-code-box">
      <errorDetail :errDetails="errDetails" />
    </div>
  </div>
</template>

<script lang="ts">
import serviceApi from '@/apis/biz-service/service.api';
import { Icon, Input } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import errorDetail from './error-detail.vue';
import updateCode from './update-code.vue';

@Component({
  name: 'FileValidate',
  components: {
    AIcon: Icon,
    AInput: Input,
    updateCode,
    errorDetail,
  },
})
export default class FileValidate extends Vue {
  @Prop() fileName!: string;

  @Prop() importType!: string;

  @Prop() dmCodeList!: any[];

  @Prop() subCodeList!: any[];

  @Prop() appCode!: string;

  @Prop({ default: false }) override!: boolean;

  @Prop() orignList!: any;

  @Prop() updateList!: any[];

  get isCodeRepeat() {
    const { codeRepeatObj } = this;
    return (
      codeRepeatObj.appCodeRepeat ||
      codeRepeatObj.modelCodeRepeat ||
      codeRepeatObj.recycleCodeRepeat
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

  // 是否显示错误详情
  isShowErrorDetail: boolean = false;

  // 编码重复错误提示
  coreRepeatErrMsg: string = '';

  isModelCodeList: boolean = false;

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
  };

  repeatCodeEnum: any = {
    appCodeRepeat: '600021',
    modelCodeRepeat: '600027',
    recycleCodeRepeat: '600030',
  };

  // 编码重复
  codeRepeatObj: any = {
    appCodeRepeat: false,
    modelCodeRepeat: false,
    recycleCodeRepeat: false,
    bothRepeat: false,
  };

  // 错误明细
  errDetails: any = {
    appManager: [],
    dataModel: {},
    formDesinge: [],
    workflow: [],
  };

  isShowErr: boolean = true;

  modifiedServiceCodes: any[] = []; //重复列表

  mounted() {
    this.checkApp();
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
      modifiedServiceCodes,
    } = this;

    const params: any = {
      fileName,
      overWrite: false,
      modifiedServiceCodes,
    };

    this.isShowUpdateCode = false;
    this.isShowErrorDetail = false;

    this.modelPos = '';
    this.subTableErr = '';
    this.subTableErr2 = '';

    this.isValidated = false;
    this.$emit('onChecking', true); // 校验中
    const res: any = await serviceApi.checkService(params);
    this.isValidated = true;
    this.$emit('onChecking', false); // 校验结束

    const { errcode, data, errmsg } = res;

    if (errcode === 0) {
      // 先将错误分类： 编码重复错误 |  其他错误
      const {
        appMsgList,
        dmMsgList,
        formMsgModel,
        workflowMsgList,
        workflowList,
        formModelMap,
        modifyServiceCodes,
      } = data;

      this.fileInvalid = modifyServiceCodes.some((item) => item.isRepeated);
      // 校验成功
      if (!this.fileInvalid) {
        this.isFileOk = true;
        this.$emit('checkEnd', { isCodeRepeat: false });
        this.$emit('onFileFail', this.isFileOk);
        return { validSuccess: true };
      }

      //校验未通过
      const { repeatCodeEnum } = this;
      // 通知当前是否存在编码重复
      this.$emit('checkEnd', { isCodeRepeat: true });

      // 应用或编码重复
      this.coreRepeatErrMsg = '服务方法编码在当前系统已存在，是否要覆盖？';
      this.$emit('modelCodeList', modifyServiceCodes);
      this.isFileOk = true;
      this.$emit('onFileFail', this.isFileOk);
      return { isCodeRepeat: this.isCodeRepeat };
    } else {
      this.isFileOk = false;
      this.fileErrMsg = '文件校验不通过';
      this.$emit('onFileFail', this.isFileOk);
    }
  }

  // 是否展示修改编码
  showUpdateCode() {
    this.isShowUpdateCode = true;
  }

  // 关闭修改编码
  closeUpdateCode() {
    this.resetNewCode();
    this.isShowUpdateCode = false;
  }

  // 展示错误明细
  showErrorDetail() {
    this.isShowErrorDetail = true;
    this.$emit('showError');
  }

  // 关闭错误明细
  closeErrorDetail() {
    this.isShowErrorDetail = false;
  }

  /**
   * 获取修改后的编码list
   * */
  getCodeList() {
    return (this.$refs.updateCode as any).getCodeList();
  }
}
</script>

<style lang="less">
@import '~@/styles/import/file-validate.less';
</style>

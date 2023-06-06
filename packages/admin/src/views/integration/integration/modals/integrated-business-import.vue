<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Descripttion:  导入-集成服务
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-12-02 14:46:46
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-17 21:03:58
-->
<template>
  <div>
    <a-modal
      class="import-container"
      :visible="show"
      :width="800"
      wrapClassName="refer-modal_wrap"
      title="导入-集成服务"
      :maskClosable="false"
      :destroyOnClose="true"
      :closable="true"
      @cancel="close"
    >
      <!-- 内容部分 -->
      <div v-if="importType" class="import-layout">
        <div v-if="!isShowUpdateCode" class="steps">
          <a-steps size="small" :current="curStep" :status="curStepStatus">
            <a-step :title="$t('languages.Apps.UploadFile')" />
            <a-step :title="$t('languages.Apps.VerifyFile')">
              <a-icon
                v-if="curStep === 1 && !isValidated"
                slot="icon"
                type="loading"
              />
            </a-step>
            <a-step :title="$t('languages.Apps.Import')" />
          </a-steps>
        </div>

        <div class="step-content">
          <!-- 上传文件 -->
          <fileUpload
            v-if="isUpload && !isValidate"
            accept=".zip"
            :groupItem="groupItem"
            :action="uploadUrl"
            :importType="importType"
            @setFileName="setFileName"
          />

          <!-- 文件校验 -->
          <fileValidate
            v-if="isValidate"
            ref="fileValidate"
            :fileName="fileName"
            :importType="importType"
            :dmCodeList="dmCodeList"
            :subCodeList="subCodeList"
            :appCode="appCodeForCheck"
            :override="overrideForCheck"
            :updateList="isModelCodeList"
            @onFileFail="onFileFail"
            @onChecking="onChecking"
            @checkEnd="onCheckEnd"
            @modelCodeList="onModelCodeList"
            @statusCode="onStatusCode"
          />

          <!-- 导入文件 -->
          <fileImport
            v-if="isImport"
            :fileName="fileName"
            :importType="importType"
            :dmCodeList="dmCodeList"
            :subCodeList="subCodeList"
            :appCode="appCodeForCheck"
            :override="overrideForImport"
            :groupId="groupItem.id"
            :formModelMap="formModelMap"
            :workflowList="workflowList"
            :isModelCodeList="isModelCodeList"
            @importEnd="isImportEnd = true"
            @succeed="importSucceed"
          />
        </div>
      </div>

      <!-- 底部按钮 -->
      <template slot="footer">
        <div v-if="!importType">
          <a-button type="default" @click="close"> 取消 </a-button>
        </div>
        <div v-if="isUpload && importType">
          <a-button type="primary" :disabled="nextAbled" @click="nextStep">
            {{ $t('languages.Apps.NextStep') }}
          </a-button>
        </div>
        <div v-if="isValidate && isValidated && importType">
          <template v-if="isFileOk">
            <template v-if="isCodeRepeat">
              <!-- 修改编码对应footer -->
              <template>
                <a-button
                  v-if="!isChangedCode && updateImportBtn"
                  @click="closeUpdateCode"
                >
                  返回
                </a-button>
              </template>

              <template v-if="isModelCodeList.length > 0 && !updateImportBtn">
                <a-button @click="updateCode"> 修改编码 </a-button>
                <a-button type="primary" @click="importAndCover(true)">
                  导入并覆盖
                </a-button>
              </template>

              <template v-if="isModelCodeList.length > 0 && updateImportBtn">
                <a-button type="primary" @click="importAndCover(false)">
                  保存并导入
                </a-button>
              </template>
            </template>

            <template v-else>
              <!-- 查看错误明细的时候 -->
              <template v-if="isShowError">
                <a-button type="default" @click="closeErrorDetail">
                  返回
                </a-button>
                <a-button type="primary" @click="directImport(true)">
                  继续导入
                </a-button>
              </template>

              <!-- 直接导入 -->
              <template v-else>
                <a-button @click="closeErrorDetail"> 返回 </a-button>
                <a-button type="primary" @click="directImport(false)">
                  导入
                </a-button>
              </template>
            </template>
          </template>

          <template v-else>
            <a-button @click="closeErrorDetail"> 返回 </a-button>
            <!-- 直接导入 -->
            <a-button disabled type="primary" @click="directImport(false)">
              导入
            </a-button>
          </template>
        </div>

        <div v-if="isImport && importType">
          <a-button type="primary" :disabled="!isImportEnd" @click="close">
            完成
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts">
import serviceApi from '@/apis/biz-service/service.api';
import { Button, Icon, Modal, Select, Steps } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import fileImport from './file/file-import.vue';
import fileUpload from './file/file-upload.vue';
import fileValidate from './file/file-validate.vue';

@Component({
  name: 'integrated-business-import',
  components: {
    AModal: Modal,
    ASteps: Steps,
    AStep: Steps.Step,
    AIcon: Icon,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button,
    fileUpload,
    fileValidate,
    fileImport,
  },
})
export default class IntegratedBusinessImport extends Vue {
  @Prop({ default: false })
  show?: boolean;

  @Prop({ default: () => {} })
  groupItem?: any;

  // 当前步骤
  curStep: number = 0;

  // 当前步骤状态
  curStepStatus: string = 'process';

  isChangedCode: boolean = false; // 修改过编码,不能显示返回按钮

  // 是否校验完成
  isValidated: boolean = false;

  // 当前已上传文件的名称，若删除则为空串
  fileName: string = '';

  // 文件合法性
  isFileOk: boolean = true;

  // 编码重复  应用，模型
  isCodeRepeat: boolean = true;

  // 是否修改编码
  isShowUpdateCode: boolean = false;

  dmCodeList: any = [];

  subCodeList: any = [];

  formModelMap: any = {};

  workflowList: any[] = [];

  appCodeForCheck: string = '';

  overrideForCheck: boolean = false;

  isShowError: boolean = false;

  overrideForImport: boolean = false;

  // 是否导入完成
  isImportEnd: boolean = false;

  // groupList: Array<any> = [];

  // 回收站编码重复tag
  statusCode: string = '';

  isModelCodeList: any[] = []; //重复列表

  isShowImportBtn: boolean = false;

  updateImportBtn: boolean = false;

  /**
   * 监听步进控制组件显隐
   */
  isUpload = true;

  isValidate = false;

  isImport = false;

  importType: string = 'LOCAL';

  @Watch('curStep', { immediate: true })
  onCurStepChange(v: number) {
    switch (v) {
      case 0:
        this.isUpload = true;
        this.isValidate = false;
        this.isImport = false;
        break;
      // return 'file-upload';
      case 1:
        this.isUpload = false;
        this.isValidate = true;
        this.isImport = false;
        break;
      // return 'file-validate';
      case 2:
        this.isUpload = false;
        this.isValidate = false;
        this.isImport = true;
        break;
      // return 'file-import';
      default:
        break;
    }
  }

  onStatusCode(str: string) {
    this.statusCode = str;
  }

  // 是否能点击下一步，必须成功上传文件
  get nextAbled() {
    return !this.fileName;

    // return false; //测试数据
  }

  // 上传接口
  get uploadUrl() {
    return serviceApi.fileUploadUrl;
  }

  // 关闭错误明细
  closeErrorDetail() {
    this.curStep--;
    if (this.curStep === 0) {
      this.fileName = '';
    }
  }

  /**
   * 关闭修改编码
   * */
  closeUpdateCode() {
    // this.isShowUpdateCode = false;
    this.updateImportBtn = false;
    (this.$refs.fileValidate as any).closeUpdateCode();
  }

  /**
   * 修改编码
   * */
  updateCode() {
    this.updateImportBtn = true;
    (this.$refs.fileValidate as any).showUpdateCode();
    // this.isShowUpdateCode = true;
  }

  /**
   * 监听编码重复的数量
   * */
  onModelCodeList(obj) {
    console.log(obj);

    this.isModelCodeList = obj;
  }

  /**
   * 覆盖并导入
   * */
  async importAndCover(flag) {
    if (!flag) {
      //先校验
      const isReturn = await this.checkApp();
      if (isReturn) {
        return;
      }
    }
    this.overrideForImport = flag;
    this.doImport();
  }

  /**
   * 文件校验
   */
  async checkApp() {
    const { fileName } = this;

    const DataSource: any[] = [];
    this.isModelCodeList.forEach((item) => {
      if (item.newServiceCode && item.newServiceCode.replace(/\s*/g, '')) {
        DataSource.push(item.newServiceCode);
      }
    });

    if (DataSource.length < 1) {
      this.$message.error('请输入有效的新编码!');
      return true;
    }

    if (new Set(DataSource).size !== DataSource.length) {
      this.$message.error('请勿填写重复编码!');
      return true;
    }

    const modifiedServiceCodes = this.isModelCodeList.map((item) => {
      return {
        newServiceCode: item.newServiceCode || '',
        oldServiceCode: item.oldServiceCode,
      };
    });

    const params: any = {
      fileName,
      overWrite: false,
      modifyServiceCodes: modifiedServiceCodes,
    };
    const res: any = await serviceApi.checkService(params);
    if (res.errcode === 0) {
      this.isModelCodeList = res.data.modifyServiceCodes;
      this.isModelCodeList.forEach((item) => {
        item.isShow = item.isRepeated;
      });
      return this.isModelCodeList.some((item) => item.isRepeated);
    } else {
      this.$message.error(res.errmsg);
    }
    return true;
  }

  /**
   * 直接导入
   * */
  directImport(flag: boolean) {
    this.overrideForImport = flag;
    this.doImport();
  }

  /**
   * 执行导入
   * */
  doImport() {
    this.curStep = 2;
  }

  /**
   * 成功导入
   * */
  isImportSucceed: boolean = false;

  importSucceed(item) {
    this.isImportSucceed = true;
    this.$emit('missedDataSourceCodes', item);
  }

  /**
   * 文件合法性
   * */
  onFileFail(isOk: boolean) {
    this.isFileOk = isOk;
  }

  /**
   * 校验结束
   * */
  onCheckEnd(obj: any) {
    const { isCodeRepeat } = obj;
    this.isCodeRepeat = isCodeRepeat;
  }

  /**
   * 校验是否结束
   * */
  onChecking(isEnd: boolean) {
    this.isValidated = !isEnd;
  }

  /**
   * 设置已上传文件得文件名
   * */
  setFileName(fileName: string) {
    this.fileName = fileName;
  }

  /**
   * 下一步逻辑
   * */
  nextStep() {
    this.curStep += 1;
  }

  /**
   * 关闭
   * */
  close() {
    this.$emit('input', false);
    this.fileName = '';
    this.curStep = 0;
    this.appCodeForCheck = '';
    this.statusCode = '';
    this.dmCodeList = [];
    this.subCodeList = [];
    this.overrideForCheck = false;
    this.overrideForImport = false;
    this.isShowUpdateCode = false;
    this.isShowError = false;
    this.isCodeRepeat = true;
    this.isChangedCode = false;
    this.updateImportBtn = false;
    if (this.isImportSucceed) {
      this.$emit('importSucceed');
    }
    this.$emit('close');
  }
}
</script>

<style lang="less">
@import '~@/styles/import/index.less';
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <div class="modal-body">
      <div class="steps">
        <a-steps size="small" :current="2" :status="'process'">
          <a-step :title="$t('languages.Apps.UploadFile')" />
          <a-step :title="$t('languages.Apps.VerifyFile')" />
          <a-step :title="$t('languages.Apps.Import')" />
        </a-steps>
      </div>

      <div class="file-import">
        <div class="import-progress">
          <a-progress
            type="circle"
            :percent="importPercent"
            :width="100"
            :status="progressStatus"
            :strokeColor="'#17BC94'"
          />

          <div class="note">
            {{ importStatusTxt }}
          </div>

          <div class="import-hint">
            {{ importHint }}
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <div>
        <!-- 完成 -->
        <a-button type="primary" :disabled="!isImportEnd" @click="handleCancel">
          {{ $t('languages.Apps.Finish') }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { Button, Progress, Steps } from '@h3/antd-vue';

import * as FileValidateNS from '@/typings/app-error';

import AppsApi from '@/apis/apps';

import ImportStrategy from './importStrategy/importStrategy';

@Component({
  name: 'FileImport',
  components: {
    AProgress: Progress,
    AButton: Button,
    ASteps: Steps,
    AStep: Steps.Step,
  },
})
export default class FileImport extends Vue {
  @Prop() uploadResult!: any;

  @Prop() validResult!: any;

  @Prop() strategy!: ImportStrategy;

  importPercent: number = 0; // 进度

  isImportEnd: boolean = false; // 是否导入完成

  importStatus: string = 'process'; // 导入状态

  simulateInterval: any = null;

  errmsg: string = ''; // 导入状态

  importStatusTxt: string = '导入中';

  importHint: string = '导入数据过程中请不要关闭页面，避免导入错误'; // 导入提醒

  progressStatus: string = 'active'; // 导入状态

  @Watch('importStatus')
  onImportStatusChange(v: string) {
    switch (v) {
      case FileValidateNS.ImportStatus.Importing:
        this.importStatusTxt = this.$t('languages.Apps.Importing') as string;
        this.importHint = this.$t(
          'languages.Apps.NoCloseWindowUntillImportFinished',
        ) as string;
        break;
      case FileValidateNS.ImportStatus.ImportSuccess:
        this.importStatusTxt = this.$t(
          'languages.Apps.ImportSuccess',
        ) as string;
        this.importHint = this.$t(
          'languages.Apps.PlzRepublishDataModelAndProcess',
        ) as string;
        break;
      case FileValidateNS.ImportStatus.ImportError:
        this.importStatusTxt = this.$t('languages.Apps.ImportError') as string;
        this.importHint =
          this.errmsg ||
          (this.$t('languages.Apps.PlzReimportCauseNetworkError') as string);
        this.progressStatus = 'exception';
        break;
      default:
        break;
    }
  }

  handleCancel() {
    this.$emit('handleCancel');
  }

  mounted() {
    this.doImport();
  }

  /**
   * 直接导入
   */

  doImport() {
    this.importFile(
      this.validResult.schemaCode,
      this.uploadResult.fileName,
      this.validResult.coverAble,
      this.validResult.isImportDataRule,
    );
  }

  /**
   * 文件导入
   * @parms
   * fileName 文件名称
   * coverAble 是否覆盖
   * schemaCode 模型编码
   */

  importFile(
    schemaCode: string,
    fileName: string,
    coverAble: boolean,
    isImportDataRule: any,
  ) {
    // 进度条
    this.simulateImport();

    const params = this.strategy.generateImportParam({
      validResult: this.validResult,
      schemaCode,
      fileName,
      coverAble,
      uploadResult: this.uploadResult,
      isImportDataRule,
    });

    setTimeout(() => {
      AppsApi.import_package(params).then((importRes: any) => {
        this.isImportEnd = true;
        if (importRes.errcode === 0) {
          const { data } = importRes;
          if (data.result) {
            this.importPercent = 100;
            this.importStatus = FileValidateNS.ImportStatus.ImportSuccess;
          } else {
            this.importPercent = 75;
            this.errmsg = importRes.errmsg;
            this.importStatus = FileValidateNS.ImportStatus.ImportError;
          }
        } else {
          this.importPercent = 75;
          this.errmsg = importRes.errmsg;
          this.importStatus = FileValidateNS.ImportStatus.ImportError;
        }
      });
      // this.isImportEnd = true;
    }, 5000);
  }

  /**
   * 模拟导入处理进度
   */
  simulateImport() {
    let percent = 1;
    this.simulateInterval = setInterval(() => {
      if (!this.isImportEnd) {
        if (percent <= 90) {
          percent += this.random(5);
          this.importPercent = percent;
        }
      } else {
        clearInterval(this.simulateInterval);
      }
    }, 1500);
  }

  /**
   * 产生随机整数
   */
  random(num: number) {
    return Math.ceil(Math.random() * 5);
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/import/file-import.less';
</style>

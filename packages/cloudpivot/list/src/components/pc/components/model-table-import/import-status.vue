<template>
  <div class="import-status">
    <div class="img-wrap">
      <img src="./import-status.svg" />
      <div>
        <i
          v-show="!validating && (systemError || showFailMessage)"
          class="icon-gap icon aufontAll h-icon-all-exclamation-circle"
        ></i>
        <i
          v-show="!validating && (isHalfSuccess || isSuccessData)"
          class="icon-gap icon success aufontAll h-icon-all-check-circle"
        ></i>
      </div>
    </div>

    <div v-if="validating" class="import-status-progress">
      <a-progress :percent="progress" />
      <p>{{ $t('cloudpivot.list.pc.ListImportTips9') }}...</p>
    </div>

    <div v-else class="import-status-info">
      <p class="import-status-info--title">
        <template v-if="systemError">
          {{ $t('cloudpivot.list.pc.ListImportTips10') }}
        </template>
        <template v-if="isHalfSuccess || isSuccessData">
          {{ $t('cloudpivot.list.pc.ListImportTips11') }}
        </template>
        <template v-if="showFailMessage">
          {{ $t('cloudpivot.list.pc.ListImportTips12') }}
        </template>
      </p>

      <p v-if="systemError">
        {{
          errMessage ? errMessage : $t('cloudpivot.list.pc.ListImportTips13')
        }}
      </p>

      <p v-else-if="isSuccessData">
        {{ $t('cloudpivot.list.pc.ListImportTips14')
        }}<span class="success">{{ statusParams.successNum }}</span>{{ $t('cloudpivot.list.pc.ListImportTips15') }}
      </p>

      <template v-else-if="isHalfSuccess">
        <p>
          {{ $t('cloudpivot.list.pc.ListImportTips14')
          }}<span class="success">{{ statusParams.successNum }}</span>{{ $t('cloudpivot.list.pc.ListImportTips16')
          }}<span class="fail">{{ statusParams.failNum }}</span>
          {{ $t('cloudpivot.list.pc.ListImportTips17') }}
        </p>
        <p>
          {{ $t('cloudpivot.list.pc.ListImportTips18')
          }}<span class="fail" @click="onDownloadErrorFile">{{
            $t('cloudpivot.list.pc.ListImportTips19')
          }}</span>{{ $t('cloudpivot.list.pc.ListImportTips20') }}
        </p>
      </template>
      <template v-else-if="showFailMessage">
        <p v-if="isUnspecified">
          {{ $t('cloudpivot.list.pc.ImportTips12') }}
        </p>
        <p v-else-if="isTemplateEmpty">
          {{ $t('cloudpivot.list.pc.ListImportTips21') }}
        </p>
        <p v-else-if="fileTypeError">
          {{ $t('cloudpivot.list.pc.ImportTips3') }}
        </p>
        <p v-else-if="!matchError">
          {{
            $t('cloudpivot.list.pc.ImportTips9', {
              size: statusParams.importSize,
            })
          }}
        </p>
        <div v-else>
          <p>{{ statusParams.errorMsg }}</p>
          <p>
            {{ $t('cloudpivot.list.pc.ListImportTips22')
            }}<a @click.stop="exportTemplate">{{
              $t('cloudpivot.list.pc.SampleFile')
            }}</a>{{ $t('cloudpivot.list.pc.ListImportTips23') }}
          </p>
        </div>
      </template>

      <div class="import-status-info--action">
        <a-button v-if="showFailMessage" @click="reupload">
          {{ $t('cloudpivot.list.pc.ReUpload') }}
        </a-button>
        <a-button v-if="isHalfSuccess || isSuccessData" @click="setRenderData">
          {{ $t('cloudpivot.list.pc.complete') }}
        </a-button>
        <a-button v-if="systemError" @click="reupload">
          {{ $t('cloudpivot.list.pc.ReImport') }}
        </a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Button, Progress } from '@h3/antd-vue';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { listApi, listParams } from '../../../../../../api';
import importBase from './import-base';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

export enum ImportState {
  Fail = 'fail',
  Success = 'success',
  PartialSuccess = 'partialSuccess',
}

@Component({
  components: {
    AProgress: Progress,
    AButton: Button,
  },
})
export default class ImportStatus extends Mixins(importBase) {
  @WorkflowCenterModule.State('applicationPageTitle') applicationPageTitle: any;

  @Prop({
    type: String,
  })
  queryCode!: string;

  @Prop()
  schemaCode!: string;

  @Prop()
  statusParams!: any;

  state: ImportState = ImportState.PartialSuccess;

  validating: boolean = false;

  progress: number = 30;

  timer: any = null;

  isSuccess: boolean = false;

  isDownErrorFile: boolean = false;

  successNum: number = 0;

  failNum: number = 0;

  errMessage: string = '';

  // 成功记录
  successRecords: any = [];

  // 错误文件的下载地址RefId
  errorRefId: string = '';

  setSate(
    state: string,
    successNum = 0,
    failNum = 0,
    records: any[],
    msg: any,
    refId?: string,
  ) {
    this.state = state as ImportState;
    this.successNum = successNum;
    this.failNum = failNum;
    this.successRecords = records;
    this.errMessage = msg;
    this.isSuccess = true;

    if (this.successNum > 0) {
      this.successNum -= 1;
    }

    if (refId) {
      // 错误文件下载
      this.errorRefId = refId;
    }
  }

  get isHalfSuccess() {
    return (
      this.statusParams.importStatus === listParams.ImportResult.PartialSuccess
    );
  }

  get showFailMessage() {
    return (
      this.statusParams.importStatus ===
        listParams.ImportResult.DataNumExceed ||
      this.statusParams.importStatus ===
        listParams.ImportResult.DataColumnError ||
      this.statusParams.importStatus ===
        listParams.ImportResult.FileTypeError ||
      this.isUnspecified ||
      this.isTemplateEmpty
    );
  }

  get fileTypeError() {
    return (
      this.statusParams.importStatus === listParams.ImportResult.FileTypeError
    );
  }

  get matchError() {
    return (
      this.statusParams.importStatus === listParams.ImportResult.DataColumnError
    );
  }

  get isSuccessData() {
    return this.statusParams.importStatus === listParams.ImportResult.Success;
  }

  get isTemplateEmpty() {
    return (
      this.statusParams.importStatus === listParams.ImportResult.TemplateEmpty
    );
  }

  get isUnspecified() {
    return (
      this.statusParams.importStatus === listParams.ImportResult.Unspecified
    );
  }

  created() {
    this.validating = true;
    this.startProgress();
  }

  startProgress() {
    this.timer = setInterval(() => {
      this.progress += 10;
      if (
        this.progress === 90 &&
        !this.isSuccess &&
        !(
          this.statusParams.importStatus !== listParams.ImportResult.Unspecified
        )
      ) {
        this.progress = 80;
      }
      if (
        this.progress === 100 &&
        (this.isSuccess ||
          ((this.statusParams.importStatus ||
            this.statusParams.importStatus === 0) &&
            this.statusParams.importStatus !==
              listParams.ImportResult.Unspecified))
      ) {
        clearInterval(this.timer);
        this.validating = false;
      }
    }, 100);
  }

  reupload() {
    this.$emit('reupload');
  }

  setRenderData() {
    this.$emit('setRenderData', this.successRecords);
  }

  destroyed(): void {
    clearInterval(this.timer);
  }

  /**
   * 下载示例模板
   */
  async exportTemplate() {
    const params = {
      schemaCode: this.schemaCode,
      queryCode: this.queryCode,
      languageType: (this as any).$i18n.locale,
    };
    const res = await listApi.exportTemplate(params);
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      this.$message.error(
        this.$t('cloudpivot.list.pc.DownloadFailed') as string,
      );
    } else {
      const blob = new Blob([res], { type: 'application/vnd.ms-excel' });

      const fileName = `${
        this.applicationPageTitle
      }导入示例${this.getTime()}.xlsx`;

      this.downloadFile(blob, fileName);
    }
  }

  /**
   * 下载错误信息文档
   */
  async onDownloadErrorFile() {
    const res = await listApi.downErrorResult(this.statusParams.importFileName);
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      this.$message.error(
        this.$t('cloudpivot.list.pc.DownloadFailed') as string,
      );
    } else {
      const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
      const stamp = new Date().getMilliseconds();
      const fileName = `${
        this.applicationPageTitle
      }错误信息${this.getTime()}.xlsx`;

      this.downloadFile(blob, fileName);
    }
  }

  getTime() {
    const date = new Date();
    const mounth =
      date.getMonth() > 8 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    const days = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    const hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    const minutes =
      date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
    const seconds =
      date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;

    const stamp = `${date.getFullYear()}${mounth}${days}${hours}${minutes}${seconds}`;
    return stamp;
  }
}
</script>
<style lang="less">
.import-status {
  p {
    margin-bottom: 5px;
  }

  .img-wrap {
    width: 92px;
    margin: 85px auto;
    margin-bottom: 0;
    position: relative;

    & > div {
      // background: #fff;
      width: 39px;
      position: absolute;
      bottom: -10px;
      right: -10px;

      & > .icon {
        &.success {
          color: #17bc94;
        }

        font-size: 39px;
        color: #f4454e;
      }
    }
  }

  &-progress {
    text-align: center;
    width: 400px;
    margin: 49px auto;
    margin-bottom: 151px;

    p {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
      margin-top: 23px;
    }
  }

  &-info {
    text-align: center;
    width: 90%;
    margin: 34px auto;

    &--title {
      height: 22px;
      font-size: 14px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
    }

    & > p {
      & > span {
        &.success {
          color: #17bc94;
        }

        &.fail {
          color: #f4454e;
          cursor: pointer;
        }
      }
    }
    & > div {
      > p {
        height: 22px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
        line-height: 22px;
        > a {
          height: 22px;
          font-size: 14px;
          color: #2970ff;
          line-height: 22px;
        }
      }
    }

    &--action {
      margin-top: 32px;
      margin-bottom: 79px;
      > .ant-btn {
        height: 32px;
        background: #ffffff;
        border-color: #d9d9d9;
        > span {
          height: 22px;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.65);
          line-height: 22px;
        }
        &:hover {
          border-color: #5291ff;
          > span {
            color: #5291ff;
          }
        }
        &:active {
          border-color: #2970ff;
          > span {
            color: #2970ff;
          }
        }
      }
    }
  }
}
</style>

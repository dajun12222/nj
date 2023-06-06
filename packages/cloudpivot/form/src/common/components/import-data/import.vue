<template>
  <a-modal
    v-model="visible"
    class="import-modal"
    :title="$t('cloudpivot.form.runtime.biz.importData')"
    :width="552"
    :destroyOnClose="true"
    :footer="null"
    :mask="true"
    :maskClosable="false"
    :keyboard="false"
    @cancel="reset"
  >
    <sheet-upload
      v-if="showUploadModel || isImporting"
      :sheetParams="sheetParams"
      :sheet="sheet"
      @change="changeImportBtnStatus"
      @uploadComplete="uploadComplete"
      @setFileName="setImportFileName"
    />

    <!-- 导入状态 -->
    <data-import-status
      v-if="showImportStatus"
      :successNum="successNum"
      :percent="importPercent"
      :failNum="failNum"
      :getSheetImportCount="getSheetImportCount"
      :status="importStatus"
      :importSize="importSize"
      :fileName="importFileName"
      :sheetParams="sheetParams"
      :errorFile="errorFile"
      @cancel="reset"
    />

    <div class="modal-footer">
      <!-- 取消 -->
      <a-button v-if="showCancelButton" key="back" @click="handleCancel">
        {{ $t('cloudpivot.form.runtime.biz.cancel') }}
      </a-button>

      <!-- 导入  @click="confirmImport" -->
      <a-button
        v-if="showUploadModel || isImporting"
        key="import"
        type="primary"
        :disabled="!getCanImport"
        :loading="isImporting"
        @click="confirmImport"
      >
        {{ $t('cloudpivot.form.runtime.biz.startImport') }}
      </a-button>

      <!-- @click="confirm" -->
      <a-button
        v-if="showConfirmButton"
        key="confirm"
        type="primary"
        @click="handleCancel"
      >
        {{ $t('cloudpivot.form.runtime.biz.ok') }}
      </a-button>

      <!-- @click="reImport" -->
      <a-button
        v-if="showReImportButton"
        key="reimport"
        type="primary"
        @click="reImport"
      >
        {{ $t('cloudpivot.form.runtime.biz.reImport') }}
      </a-button>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { Button, Modal } from '@h3/antd-vue';
import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
import { listParams } from '../../../../../api';
import { FormSheet } from '../../../../../form/schema';
import { UploadControl } from '../../../../src/common/controls/upload-control';
import DataImportStatus from './import/data-import-status.vue';
import DataImport from './import/data-import.vue';
import SheetUpload from './import/data-upload.vue';

@Component({
  name: 'dataimport',
  components: {
    AButton: Button,
    AModal: Modal,
    SheetUpload,
    DataImport,
    DataImportStatus,
  },
})
export default class Import extends Vue {
  @Prop() params!: any;

  @Prop() visible!: boolean;

  @Prop()
  sheet!: FormSheet;

  @Inject({
    default: () => () => {},
  })
  getImportFormValue!: () => {};

  simulateInterval: any = -1;

  /**
   * 子表导入,导出代码
   *
   */
  modalVisible = true;

  isInitView: boolean = true;

  canImport: boolean = false;

  isUploading: boolean = false;

  importFileName: string = '';

  importPercent: number = 0;

  successNum: number = 0;

  failNum: number = 0;

  isImportEnd: boolean = false;

  isImporting: boolean = false;

  errorFile: string = '';

  showModal = false;

  importSize: number = 0; //子表Excel导入超出上限，后端返回的配置值

  getSheetImportCount: object = { select: 0, radio: 0, checkbox: 0 };
  // sheetParams:any = {}

  importSheet() {
    this.showModal = true;
  }

  get sheetParams() {
    // const formStatus:any = {
    //   'DRAFT': 0,
    //   'PROCESSING': 1,
    //   'CANCELLED': 2,
    //   'COMPLETED': 3
    // }

    // const params:any = Object.assign({},this.params);
    // params.sequenceStatus = formStatus[params.sequenceStatus];
    return this.params;
  }

  importStatus: listParams.ImportResult = listParams.ImportResult.None;

  get showUploadModel() {
    return this.isInitView;
  }

  get showConfirmButton() {
    return (
      this.importStatus === listParams.ImportResult.DataNumExceed ||
      this.importStatus === listParams.ImportResult.DataColumnError ||
      this.importStatus === listParams.ImportResult.PartialSuccess
    );
    // return this.failNum > 0 || this.failMessage || this.columnMatchError;
  }

  get showImportStatus() {
    return !this.isImporting && !this.isInitView;
  }

  get showReImportButton() {
    // return this.networkError;
    return this.importStatus === listParams.ImportResult.SystemError;
  }

  // 取消按钮
  get showCancelButton() {
    return (
      this.isInitView ||
      this.importStatus === listParams.ImportResult.SystemError
    );
  }

  //  get showImportModel() {
  //   return this.isImporting;
  // }

  changeImportBtnStatus(status: boolean) {
    this.canImport = status;
  }

  setImportFileName(fileName: string) {
    this.importFileName = fileName;
  }

  uploadCompleteStatus = false; // 是否有文件

  get getCanImport() {
    return this.canImport && this.uploadCompleteStatus;
  }

  // 上传完成
  uploadComplete(val: boolean) {
    this.uploadCompleteStatus = val;
  }

  /**
   * 子表数据开始导入
   */
  confirmImport() {
    const bizObjectData = this.getImportFormValue();
    bizObjectData['id'] = this.params.id;
    this.isInitView = false;
    this.isUploading = false;
    const formStatus: any = {
      DRAFT: 0,
      PROCESSING: 1,
      CANCELLED: 2,
      COMPLETED: 3,
    };
    const params: any = Object.assign({}, this.params);
    params.fileName = this.importFileName;
    params.sequenceStatus = formStatus[params.sequenceStatus];
    params.languageType = (this as any).$i18n.locale;
    params.bizObjectData = bizObjectData;
    //导入处理进度
    this.simulateImport();

    UploadControl.service.getSheetDetail(params).then((res) => {
      if (res.errcode !== 0) {
        this.isImporting = false;
        this.importStatus = listParams.ImportResult.SystemError;
      } else {
        this.isImporting = false;
        this.errorFile = res.data.fileName;
        const data = res.data.data;
        if (res.data.secondImportData && res.data.secondImportData.length > 0) {
          this.$emit('repeatErrorHandle', res.data);
          return;
        }
        this.getSheetImportCount = {
          select: res.data.dropdownMarkedCount,
          radio: res.data.radioMarkedCount,
          checkbox: res.data.checkboxMarkedCount,
        };

        //
        // 导入数据回调
        if (data) {
          this.$emit('importFinishe', data);
        }

        this.importStatus = res.data.errorType;

        this.successNum = res.data.successCount;

        this.failNum = res.data.errorCount;

        //根据导入数据量超出上限时，获取配置的最大值
        if (this.importStatus === 3) {
          this.importSize = res.data.errorMsg;
        } else {
          this.importSize = 0;
        }
      }
    });
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
    }, 100);
  }

  /**
   * 产生随机整数
   */
  random(num: number) {
    return Math.ceil(Math.random() * 5);
  }

  /**
   * 导入结束（不管成功与失败）
   */
  importEnd(data: any) {
    // 此处需要定义数据结构
    clearInterval(this.simulateInterval);
    //
    this.isImporting = false;
    this.isImportEnd = true;
    this.importFileName = data.fileName;
    this.successNum = data.successCount;
    this.failNum = data.errorCount;
    this.importStatus = data.errorType;
  }

  reset() {
    clearInterval(this.simulateInterval);
    this.isInitView = true;
    this.isUploading = false;
    this.isImporting = false;
    this.importPercent = 0;
    this.isImportEnd = false;
    this.successNum = 0;
    this.failNum = 0;
    this.canImport = false;
    this.importStatus = listParams.ImportResult.None;
    this.$emit('cancel');
  }

  /**
   * reset
   */
  handleCancel() {
    this.showModal = false;
    // this.$emit('cancel');
    this.reset();
  }

  /**
   * 重新导入
   */
  reImport() {
    this.reset();
  }
}
</script>

<style lang="less" scoped>
.import-modal {
  /deep/.ant-modal-body {
    padding-bottom: 24px;
  }
}
</style>

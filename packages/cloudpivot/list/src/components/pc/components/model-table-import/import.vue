<template>
  <div class="model-table-import">
    <a-modal
      :maskClosable="false"
      :title="
        isWorkflowImport
          ? $t('cloudpivot.list.pc.ImportWorkflow')
          : $t('cloudpivot.list.pc.ImportData')
      "
      :visible="true"
      width="640px"
      :wrapClassName="{
        'model-table-import': true,
        'hide-footer': importStatusShow,
      }"
      @cancel="handleCancel"
    >
      <div>
        <!--导入弹窗组件-->
        <ImportInput
          v-if="importInputShow"
          ref="importInput"
          :dataItems="dataItems"
          :isFormSheet="isFormSheet"
          :modelInfo="modelInfo"
          :queryCode="queryCode"
          :isWorkflowImport="isWorkflowImport"
          @resetUpLoad="reupload"
          @setCoverCode="setCoverCode"
          @setImportAble="setImportAble"
          @uploadComplete="uploadComplete"
        />

        <!--校验状态 错误信息码-->
        <!--        <ValidateStatus-->
        <!--          :isFormSheet="isFormSheet"-->
        <!--          :modelInfo="modelInfo"-->
        <!--          @reupload="reupload"-->
        <!--          @success="dataImport"-->
        <!--          ref="validateStatus"-->
        <!--          v-if="validateStatusShow"-->
        <!--        />-->

        <!--导入状态-->
        <template>
          <img src="./import-status.svg" style="display: none" />
          <ImportStatus
            v-if="importStatusShow"
            ref="importStatus"
            :isFormSheet="isFormSheet"
            :queryCode="queryCode"
            :schemaCode="modelInfo.schemaCode"
            :showImportStatus="showImportStatus"
            :statusParams="statusParams"
            @reupload="reupload"
            @setRenderData="setRenderData"
          />
        </template>
      </div>
      <template slot="footer">
        <a-button @click="handleCancel">
          {{ $t('cloudpivot.list.pc.Cancel') }}
        </a-button>
        <a-button
          :disabled="forbiddenImport"
          type="primary"
          @click="handleImport"
        >
          {{ $t('cloudpivot.list.pc.Import') }}
        </a-button>
      </template>
    </a-modal>
    <!--    在线修复-->
    <!--    <ModelTableFix-->
    <!--      :dataItems="dataItems"-->
    <!--      :importData="importData"-->
    <!--      :dataList="dataList"-->
    <!--      :showDataFix="statusParams.showImportErrModal"-->
    <!--      @closeDataFix="closeDataFix"-->
    <!--      @handleImportFixed="handleImportFixed"-->
    <!--      @ok="closeDataFix"-->
    <!--      @resetData="resetData"-->
    <!--      v-if="statusParams.showImportErrModal"-->
    <!--    />-->
  </div>
</template>
<script lang="ts">
import { Button, Modal } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { listApi, listParams } from '../../../../../../api';
import ImportInput from './import-input.vue';
import ImportStatus from './import-status.vue';
import ValidateStatus from './import-validate-status.vue';

@Component({
  components: {
    AModal: Modal,
    AButton: Button,
    ImportStatus,
    ImportInput,
    ValidateStatus,
  },
})
export default class Import extends Vue {
  @Prop()
  isFormSheet!: any;

  @Prop({
    type: String,
    required: true,
  })
  schemaCode!: string;

  @Prop({
    type: String,
  })
  queryCode!: string;

  @Prop()
  isWorkflowImport!: boolean;

  @Prop()
  statusParams!: any;

    @Prop()
    visible!: any;

    @Prop()
    showImportStatus!: any;

  @Prop()
  importData!: any;

  showDataFix = false;

  dataItems: any[] = [];

  dataList: any[] = [];

  // 控制弹框显示内容
  importInputShow = true;

  importStatusShow = false;

  validateStatusShow = false;

  uploadCompleteStatus = false; // 是否有文件

  coverStatus = false; // 是否覆盖

  coverCode = false; // 覆盖字段

  // 模型基础信息
  appCode = this.queryCode;

  // bizGroupCode = '';

  // bizModuleCode = '';

  inputData: any = {};

  interval: any = null;

  // renderData: any = []; // 导入成功后用来渲染数据

  static typeOf(obj: any): string {
    return Object.prototype.toString
      .call(obj)
      .split(' ')[1]
      .toLocaleLowerCase()
      .slice(0, -1);
  }

  get modelInfo() {
    return {
      appCode: this.appCode,
      // bizGroupCode: this.bizGroupCode,
      // bizModuleCode: this.bizModuleCode,
      schemaCode: this.schemaCode,
    };
  }

  get forbiddenImport() {
    if (this.uploadCompleteStatus && this.coverStatus && this.coverCode) {
      return false;
    } else if (
      this.uploadCompleteStatus &&
      !this.coverStatus &&
      this.coverCode
    ) {
      return false;
    } else if (
      this.uploadCompleteStatus &&
      !this.coverStatus &&
      !this.coverCode
    ) {
      return false;
    } else {
      //Else Empty block statement
    }
    return true;
  }

  reupload() {
    this.importInputShow = true;
    this.importStatusShow = false;
    this.validateStatusShow = false;
    this.showDataFix = false;
    this.uploadCompleteStatus = false;
    this.$emit('reset');
  }

  // 判断是否有覆盖字段 禁止导入
  setImportAble(val: boolean) {
    this.coverStatus = val;
  }

  setCoverCode(code: any) {
    if (!code) {
      this.coverCode = false;
    } else {
      this.coverCode = code;
    }
  }

  // 导入成功后的渲染
  setRenderData(data: any) {
    this.$emit('setData', data);
    this.$emit('close');
  }

  // 上传完成
  uploadComplete(val: boolean) {
    this.uploadCompleteStatus = val;
  }

  // 取消修正数据重新导入
  closeDataFix() {
    this.reupload();
  }

  created() {}

  handleCancel() {
    this.uploadCompleteStatus = false;
    this.coverStatus = false;
    this.coverCode = false;
    this.$emit('close');
  }

  // 导入文件
  handleImport() {
    this.dataImport();
  }

  // 重置数据
  resetData(data: any) {
    this.dataList = data;
  }

  // 修正后导入
  handleImportFixed(data: any) {
    this.validateStatusShow = false;
    this.showDataFix = false;
    this.importStatusShow = true;
    this.$nextTick(() => {
      // this.renderData = data;
      // NOTE: 这里导入时传送的数据格式需要精简下，减少无用的数据传输
      // const params = data;
      const params = data.map((row: any[]) => {
        return row.map((item: any) => ({
          value: item.value,
          propertyCode: item.propertyCode,
          propertyName: item.propertyName,
          subModelRecords: item.subModelRecords,
        }));
      });
    });
  }

  handleProgress(taskId?: string) {
    this.interval = setInterval(() => {
      this.getImportProgress(taskId);
    }, 5000);
    //设置定时任务5分钟;
    if (this.interval) {
      setTimeout(() => {
        clearInterval(this.interval);
        this.$message.error('连接超时');
      }, 300000);
    }
  }

  async getImportProgress(taskId?: string) {
    const res = await listApi.getImportingProgress({ taskId });
    if (res.errcode === 0) {
      if (res.data.operationResult) {
        clearInterval(this.interval);
        this.$emit('importEnd', res.data);
      }
    }
  }

  // 校验成功后导入
  dataImport() {
    const importInput: any = this.$refs.importInput as ImportInput;
    if (importInput) {
      this.importInputShow = false;
      this.importStatusShow = true;
      this.validateStatusShow = false;
      this.$nextTick(() => {
        const importStatus: any = this.$refs.importStatus as ImportStatus;
        const data: any = importInput.getTheData();
        //  导入
        const params: listParams.ImportParams = {
          fileName: data.file,
          schemaCode: this.schemaCode,
          queryCode: this.queryCode,
          queryField: this.coverCode,
          languageType: (this as any).$i18n.locale,
        };
        listApi
          .importData(params)
          .then((res: any) => {
            if (res.errcode !== 0) {
              const msg: any = res.errmsg;
              importStatus.setSate('fail', 0, 0, [], msg);
            } else {
              console.log(res, 'res');
              const taskId = res.data.taskId || '';
              this.handleProgress(taskId);
            }
          })
          .catch(() => {
            importStatus.setSate('fail', 0, 0, [], '导入失败');
          });
      });
    }
  }
}
</script>
<style lang="less" scoped>
/deep/.model-table-import {
  &.hide-footer {
    .ant-modal-footer {
      display: none;
    }
  }
  .ant-modal-content {
    background: #ffffff;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
  }
  .ant-modal-header {
    border-bottom: none;
    padding: 24px;
    .ant-modal-title {
      height: 24px;
      font-size: 16px;
      font-weight: 600;
      color: #111218;
      line-height: 24px;
    }
  }
  .ant-modal-close-x {
    width: 57px;
    height: 72px;
    line-height: 72px;
  }
  .ant-modal-footer {
    border-top: none;
    padding: 24px;
    .ant-btn:not(:disabled) {
      height: 32px;
      > span {
        height: 22px;
        font-size: 14px;
        line-height: 22px;
      }
    }
  }
  .ant-modal-body {
    padding-top: 0;
    padding-bottom: 16px;
  }

  .ant-modal-footer .ant-btn-primary:disabled {
    height: 32px;
    background: #f1f2f6;
    border-color: #d4d5d6;
    > span {
      height: 22px;
      font-size: 14px;
      color: rgba(17, 18, 24, 0.25);
      line-height: 22px;
    }
  }
}
</style>

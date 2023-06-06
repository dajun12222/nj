<template>
  <div class="import-input">
    <!-- v-if="!isUploading" -->
    <div
      v-show="!isUploading"
      :class="{ hover: isHover }"
      class="import-input-upload"
      @mouseleave="isHover = false"
      @mouseover="isHover = true"
    >
      <a-upload-dragger
        ref="fileUpload"
        :accept="upLoadAccept"
        :beforeUpload="beforeUpload"
        :multiple="false"
        :action="uploadUrl"
        name="file"
        :headers="header"
        @change="handleChange"
        @remove="remove"
      >
        <div class="import-input-upload-icon">
          <span
            class="icon-gap icon aufontAll h-icon-all-cloud-upload-o"
          ></span>
          <p>{{ $t('cloudpivot.list.pc.ListImportTips1') }}</p>
        </div>

        <div v-if="isWorkflowImport" class="import-input-upload-tips">
          <p>
            1、{{
              $t('cloudpivot.list.pc.ListImportTips2', {
                size: importLimitSize,
              })
            }}
          </p>
          <p>
            2、{{ $t('cloudpivot.list.pc.ListImportTips3') }}
            <a
              style="text-decoration: underline"
              @click.stop="exportTemplate"
              >{{ $t('cloudpivot.list.pc.SampleFile') }}</a>
          </p>
          <p>3、{{ $t('cloudpivot.list.pc.ListImportTips24') }}</p>
          <p>4、{{ $t('cloudpivot.list.pc.ListImportTips25') }}</p>
          <p>5、{{ $t('cloudpivot.list.pc.ListImportTips26') }}</p>
        </div>
        <div v-else class="import-input-upload-tips">
          <p>
            1、{{
              $t('cloudpivot.list.pc.ListImportTips2', {
                size: importLimitSize,
              })
            }}
          </p>
          <p>
            2、{{ $t('cloudpivot.list.pc.ListImportTips3') }}
            <a
              style="text-decoration: underline"
              @click.stop="exportTemplate"
              >{{ $t('cloudpivot.list.pc.SampleFile') }}</a>
          </p>
          <p>3、{{ $t('cloudpivot.list.pc.ListImportTips4') }}</p>
          <p>4、{{ $t('cloudpivot.list.pc.ListImportTips5') }}</p>
        </div>
      </a-upload-dragger>
    </div>

    <div v-show="isUploading" class="import-input-progress">
      <div>
        <span class="success-import icon aufontAll h-icon-all-excel"></span>
        <p>
          <span>{{ file.name }}</span>(<span>{{ file.size | filterFileSize }}</span>)
          <a-icon class="icon" type="close" @click="deleteFile" />
        </p>
        <a-progress size="small" :percent="progress" :status="progressStatus" />
      </div>
    </div>

    <div v-if="!isWorkflowImport" class="import-input-cover">
      <a-checkbox v-model="isCover" @change="changeCheck" />
      <span
        style="
          padding: 0 5px;
          height: 22px;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.65);
          line-height: 22px;
        "
        >{{ $t('cloudpivot.list.pc.ListImportTips7') }}</span>
      <a-select
        v-model="coverCode"
        :disabled="!isCover"
        allowClear
        :placeholder="'请选择'"
        @change="changeSelect"
      >
        <a-select-option
          v-for="item in dataList"
          :key="item.code"
          :value="item.code"
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
      <span
        style="
          height: 22px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.65);
          line-height: 22px;
        "
        >{{ $t('cloudpivot.list.pc.ListImportTips8') }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { Checkbox, Icon, Progress, Select, Upload } from '@h3/antd-vue';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { listApi as Application } from '../../../../../../api';
import { renderer } from '../../../../../../form';
import { filters } from './filters';
import importBase from './import-base';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

@Component({
  filters: {
    // 根据不同大小显示 KB/MB
    filterFileSize: filters.fileSize,
  },
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    ACheckbox: Checkbox,
    AUploadDragger: Upload.Dragger,
    AProgress: Progress,
    AIcon: Icon,
  },
})
export default class ImportInput extends Mixins(importBase) {
  @WorkflowCenterModule.State('dataItemList') dataItemList: any;

  @WorkflowCenterModule.State('applicationPageTitle') applicationPageTitle: any;

  @WorkflowCenterModule.State('applicationPageTitleI18n')
  applicationPageTitleI18n: any;

  @Prop({
    default: [],
  })
  dataItems!: any[];

  @Prop()
  isFormSheet!: any;

  @Prop({
    type: String,
  })
  queryCode!: string;

  @Prop()
  isWorkflowImport!: boolean;

  isCover = false;

  isHover = false;

  isUploading = false;

  isUploadsuccess = false;

  hasError = false;

  progress = 10;

  file: any = {};

  timer: any = null;

  coverCode: any = '';

  upLoadAccept: string =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  blob = {};

  importLimitSize: number = 500; //导入最大上限

  get schemaCode() {
    const { schemaCode } = this.$route.params;
    return schemaCode;
  }

  get header() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  get uploadUrl() {
    // return `${Application.fileUploadUrl}`;
    return renderer.UploadControl.service.getListUploadUrl();
  }

  get progressStatus() {
    if (this.progress !== 100) {
      return 'active';
    }
    return 'success';
  }

  get dataList() {
    const dataList = this.dataItemList.filter((data: any) => {
      if (!data.defaultProperty && data.propertyType === 0) {
        return true;
      } else if (
        data.defaultProperty &&
        (data.code === 'name' || data.code === 'sequenceNo')
      ) {
        return true;
      } else {
        //Else Empty block statement
      }
      return false;
    });
    return dataList;
  }

  // 是否勾选覆盖
  changeCheck() {
    this.$emit('setImportAble', this.isCover);
  }

  // 是否选择覆盖字段
  changeSelect() {
    this.$emit('setCoverCode', this.coverCode);
  }

  handleChange(info: any) {
    this.file = info.file;
    this.blob = info.file;
    if (info.file.status !== 'uploading') {
      // this.fileList = info.fileList;
    }
    if (info.file.status === 'done') {
      this.$emit('change', true);
      this.blob = info.file.response;
      this.$emit('setFileName', info.file.response);
      this.$emit('uploadComplete', true);
      this.isUploadsuccess = true;
    } else if (info.file.status === 'error') {
      this.isUploading = false;
      this.hasError = true;
      this.$emit('uploadComplete', false);
    } else if (info.file.status === 'removed') {
      //清除临时文件
      Application.deleteTemporaryFile({ fileName: info.file.name });
    } else {
      //Else Empty block statement
    }
  }

  beforeUpload(file: any) {
    // console.log(file, 'file');
    // const suffixs = ['xlsx'];
    const suffix = this.getSuffix(file.name, false);
    // return false;
    // const isJpgOrPng = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const isLt2M = file.size / 1024 / 1024 < 1000;
    if (!['xlsx'].includes(suffix)) {
      this.$message.error('文件格式不对，仅支持上传.xlsx格式的文件!');
      return false;
    } else if (!isLt2M) {
      this.$message.error('最大不能超过1000M!');
      return isLt2M;
    } else {
      this.getSuffix(file.name, true);
      return true;
    }
    // return suffixs.indexOf(suffix) > -1;
  }

  remove() {
    this.$emit('change', false);
  }

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  async exportTemplate() {
    const params = {
      schemaCode: this.schemaCode,
      queryCode: this.queryCode,
      languageType: (this as any).$i18n.locale,
    };
    const res = await Application.exportTemplate(params);
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      this.$message.error(
        this.$t('cloudpivot.list.pc.DownloadFailed') as string,
      );
    } else {
      const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
      const date = new Date();
      const mounth =
        date.getMonth() > 8 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
      const days = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
      const hours =
        date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
      const minutes =
        date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
      const seconds =
        date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;

      const fileNameEng = this.applicationPageTitleI18n
        ? typeof this.applicationPageTitleI18n === 'string'
          ? JSON.parse(this.applicationPageTitleI18n).en
          : this.applicationPageTitleI18n.en
        : this.applicationPageTitle;

      const stamp = `${date.getFullYear()}${mounth}${days}${hours}${minutes}${seconds}`;
      const fileName = this.isChinese
        ? `${this.applicationPageTitle}导入示例${stamp}.xlsx`
        : `${fileNameEng} import template ${stamp}.xlsx`;

      const msSaveOrOpenBlob: any = window.navigator.msSaveOrOpenBlob;
      if (msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName);
      } else {
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.download = fileName;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  }

  deleteFile() {
    this.file = {};
    this.progress = 10;
    this.isUploading = false;
    clearInterval(this.timer);
    this.$emit('resetUpLoad');
    this.$emit('uploadComplete', false);
  }

  getSuffix(fileName: string, showLoading: boolean) {
    const index = fileName.lastIndexOf('.');
    const suffix = fileName.substring(index + 1);
    if (suffix && showLoading) {
      this.isUploading = true;
      this.imitateProgress();
    }
    return suffix;
  }

  // 静态上传动画
  imitateProgress() {
    // const timer: any = null;
    // const vm: any = this;
    this.timer = setInterval(() => {
      this.progress += 10;
      if (this.progress === 90 && !this.isUploadsuccess) {
        this.progress = 80;
      }
      if (this.progress === 100 && this.isUploadsuccess) {
        this.isUploadsuccess = false;
        clearInterval(this.timer);
      }
    }, 100);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transformFile(file: any) {
    return 'Blob';
  }

  getTheData() {
    return {
      isCover: this.isCover,
      coverCode: this.coverCode,
      file: this.blob,
    };
  }
}
</script>
<style lang="less" scoped>
@import './../../../../../../common/common';
@import '../../../../../../application/src/components/pc/style/custom-themes';
.import-input {
  .import-input-progress {
    .success-import {
      color: #52c41a;
      font-size: 48px;
    }
  }
  &-upload {
    /deep/ .ant-upload-drag {
      background: #fff;
      .ant-upload-btn {
        padding: 0 !important;
      }
    }

    /deep/ .ant-upload-list-item {
      display: none;
    }

    &.hover {
      /deep/ .ant-upload-drag {
        background: #f0f7ff;
      }

      /deep/ .import-input-upload-icon {
        color: @highlightColor !important;

        & > p {
          color: @highlightColor;
        }
        & > span {
          color: @highlightColor;
        }
      }
    }

    /deep/ .import-input-upload-tips {
      padding: 12px 0 22px 0;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      line-height: 24px;
      max-width: 350px;
      margin: 0 auto;
      text-align: left;
    }

    /deep/ .import-input-upload-icon {
      padding-top: 54px;

      & > .icon {
        font-size: 64px;
        color: #e2e2e2;
        height: 64px;
        line-height: 64px;
      }

      & > p {
        margin-top: 12px;
        height: 22px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
        line-height: 22px;
      }
    }
  }

  &-progress {
    border: 1px dashed rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    display: flex;
    align-items: center;
    text-align: center;

    & > div {
      margin: 0 auto;
      width: 400px;

      p {
        margin-top: 23px;

        .icon {
          color: rgba(0, 0, 0, 0.45);
          margin-left: 8px;
          cursor: pointer;
        }
      }
    }

    height: 282px;
  }

  &-cover {
    padding-top: 24px;

    .ant-select {
      width: 298px;
      &.ant-select-disabled /deep/.ant-select-selection {
        border: 1px solid #d9d9d9;
        background: #f5f5f5;
        .ant-select-selection__placeholder,
        .ant-select-arrow {
          height: 22px;
          font-size: 14px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.25);
          line-height: 22px;
        }
      }
    }
  }
}
</style>

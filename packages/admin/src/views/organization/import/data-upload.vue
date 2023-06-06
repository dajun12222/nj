<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-import">
    <div class="data-import__tip">
      <i class="icon aufontAll h-icon-all-exclamation-circle tip_icon"></i>
      <div class="tip_text">
        {{ $t('languages.Modal.ImportTips1') }}下载<a
          href="javascript:;"
          @click="exportTemplate"
          >{{ importTypeName }}示例文件</a>
      </div>
    </div>

    <section class="data-import__content">
      <div class="content--left">
        {{ $t('languages.Modal.ImportLocalFaile') }}:
      </div>
      <div class="content--right">
        <div class="upload-area">
          <a-upload-dragger
            ref="fileUpload"
            name="file"
            :multiple="false"
            :action="uploadUrl"
            accept=".xlsx"
            :headers="header"
            :beforeUpload="beforeUpload"
            :showUploadList="{ showRemoveIcon: true }"
            :remove="remove"
            @change="handleChange"
          >
            <div class="upload-tip">
              <div class="upload-icon">
                <i class="aufontAll h-icon-all-export_o"></i>
              </div>
              <div class="upload-text">将文件拖拽到此处</div>
              <div class="upload-text2">点击上传</div>
            </div>
          </a-upload-dragger>
          <div v-show="disabled" class="disabledBtn">
            <div class="upload-tip">
              <div class="upload-icon">
                <i class="aufontAll h-icon-all-export_o"></i>
              </div>
              <div class="upload-text">将文件拖拽到此处</div>
              <div class="upload-text2">点击上传</div>
            </div>
          </div>
        </div>
        <div class="upload-note">
          支持xlsx格式，文件大小不限，一次最多能导入10000条
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import OrgApi from '@/apis/organization';
import { Upload } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import DataInfo from './data-info.vue';
import { utils } from 'cloudpivot/common';

enum ImportType {
  department = 'department',
  person = 'person',
  role = 'role',
}

Vue.use(Upload);
@Component({
  name: 'dataimport',
  components: {
    DataInfo,
    AUploadDragger: Upload.Dragger,
  },
})
export default class DataImport extends Vue {
  /*   @Prop({
    type: String,
    required: true,
  }) schemaCode!: string; */

  @Prop({
    type: String,
  })
  importType!: string;

  percent: number = 0;

  hasError: boolean = false;

  isUploading: boolean = false;

  fileName: string = '';

  fileSize: number = 0;

  file: any = null;

  fileList = [];

  actionUrl: string = '';

  get importTypeName() {
    switch (this.importType) {
      case ImportType.department:
        return '部门';
      case ImportType.person:
        return '人员';
      case ImportType.role:
        return '角色';
      default:
        break;
    }
  }

  get uploadUrl() {
    return OrgApi.departmentUploadUrl;
  }

  get disabled() {
    return this.fileList.length > 0;
  }

  getSuffix(fileName: string) {
    const index = fileName.lastIndexOf('.');
    const suffix = fileName.substring(index + 1);
    return suffix;
  }

  get header() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async exportTemplate() {
    let res: any;
    switch (this.importType) {
      case ImportType.department:
        res = await OrgApi.exportTemplate();
        break;
      case ImportType.person:
        res = await OrgApi.exportPersonTemplate();
        break;
      case ImportType.role:
        res = await OrgApi.exportRoleTemplate();
        break;
      default:
        break;
    }
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      this.$message.error(
        this.$t('cloudpivot.list.pc.DownloadFailed') as string,
      );
    } else {
      const blob = new Blob([res], { type: 'application/vnd.ms-excel' });

      const fileName = `${
        this.importType === ImportType.department
          ? '部门导入'
          : this.importType === ImportType.person
          ? '人员导入'
          : '角色导入'
      }示例文件.xlsx`;

      if ((window as any).navigator.msSaveOrOpenBlob) {
        (navigator as any).msSaveBlob(blob, fileName);
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

  /**
   * 判断上传的文件是否excel文件
   */
  beforeUpload(file: any) {
    const suffixs = ['xlsx'];
    const suffix = this.getSuffix(file.name);
    return suffixs.indexOf(suffix) > -1;
  }

  handleChange(info: any) {
    this.file = info.file;
    this.isUploading = true;
    if (info.file.status === 'uploading') {
      Object.assign(info.fileList[0], {
        name: utils.hiddenStrMiddle(info.fileList[0].name, 26, 60),
      });
    }
    if (info.file.status !== 'uploading') {
      this.fileList = info.fileList;
      // console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      this.isUploading = false;
      this.$emit('change', true);
      this.$emit('setFileName', info.file.response);
    } else if (info.file.status === 'error') {
      this.isUploading = false;
      this.hasError = true;
      this.$emit('change', false);
    } else {
      //Else Empty block statement
    }
  }

  remove(file: any) {
    console.log(file, 'dsd');
    this.fileList = [];
    this.$emit('change', false);
    this.$emit('remove', file.response);
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.data-import {
  min-height: 247px;
  max-height: 50vh;
  overflow-y: auto;
  .data-import__tip {
    height: 39px;
    background: #fffbe6;
    border-radius: 4px;
    border: 1px solid #ffe58f;
    margin-bottom: 24px;
    padding: 8px 38px;
    position: relative;
    .tip_icon {
      position: absolute;
      font-size: 14px;
      color: #faad14;
      left: 16px;
      top: 8px;
    }
    .tip_text {
      height: 22px;
      font-size: 14px;
      font-weight: 400;
      color: #111218;
      line-height: 22px;
      a {
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: @primary-color;
        line-height: 20px;
        margin-left: 8px;
      }
    }
  }
  .data-import__content {
    display: flex;
    align-items: flex-start;
    overflow: hidden;
    margin-bottom: 10px;
    .content--left {
      /* flex: none; */
      width: 98px;
      margin-top: 5px;
      height: 22px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      line-height: 22px;
    }
    .content--right {
      flex: 1 1 410px;
      // width: 494px;
      // float:left;
      // margin-left: 100px;
      // margin-top: -26px;
      position: relative;
      min-height: 125px;
      .upload-area {
        width: 100%;
        height: 60px;
        position: relative;
        & /deep/.ant-upload.ant-upload-drag {
          background: #ffffff;
          border-radius: 4px;
          border: 1px dashed #d4d5d6;
          height: 60px;
          &:hover {
            border-color: @primary-color;
            background: @sub-bg-color;
          }
          .upload-tip {
            vertical-align: middle;
            height: 22px;
            line-height: 22px;
            .upload-icon {
              display: inline-block;
              height: 22px;
              line-height: 22px;
              margin-right: 15px;
              > i {
                font-size: 17px;
                color: rgba(17, 18, 24, 0.25);
              }
            }
            .upload-text,
            .upload-text2 {
              display: inline-block;
              vertical-align: 1px;
              height: 22px;
              font-size: 14px;
              font-weight: 400;
              color: #d8d8d8;
              line-height: 22px;
              margin-right: 14px;
            }
            .upload-text2 {
              color: @primary-color;
            }
          }
        }
        & /deep/.ant-upload-list.ant-upload-list-text {
          margin-top: 30px;
        }
        .disabledBtn {
          position: absolute;
          top: 0;
          background: #ffffff;
          border-radius: 4px;
          border: 1px dashed #d4d5d6;
          height: 60px;
          width: 100%;
          text-align: center;
          padding: 18px;
          &:hover {
            cursor: not-allowed;
          }
          .upload-tip {
            vertical-align: middle;
            height: 22px;
            line-height: 22px;
            .upload-icon {
              display: inline-block;
              height: 22px;
              line-height: 22px;
              margin-right: 15px;
              > i {
                font-size: 17px;
                color: rgba(17, 18, 24, 0.25);
              }
            }
            .upload-text,
            .upload-text2 {
              display: inline-block;
              vertical-align: 1px;
              height: 22px;
              font-size: 14px;
              font-weight: 400;
              color: #d8d8d8;
              line-height: 22px;
              margin-right: 14px;
            }
            .upload-text2 {
              color: @primary-color;
            }
          }
        }
      }
      .upload-select {
        width: 400px;
        .upload-select-area {
          width: 100%;
        }
      }
      /deep/ .ant-upload-btn {
        padding: 5px 0;
      }
      /deep/ .ant-upload-list {
        // width: 410px;
      }
      .upload-note {
        line-height: @line-height-7;
        font-size: @font-size-12;
        color: rgba(17, 18, 24, 0.5);
        position: absolute;
        top: 68px;
      }
      .upload-top {
        margin-top: 0;
        line-height: @line-height-7;
        font-size: @font-size-12;
        color: rgba(17, 18, 24, 0.5);
      }
    }
  }
  .import-warn {
    font-size: @font-size-12;
    color: @error-color;
  }
}
</style>

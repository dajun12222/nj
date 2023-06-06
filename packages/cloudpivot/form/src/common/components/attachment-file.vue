<template>
  <!-- <a-modal
    :title="title"
    cancelText="取消"
    okText="确认"
    :visible="true"
    :maskClosable="false"
    :keyboard="false"
    @cancel="onCancel"
    @ok="onOk"
  > -->
  <div>
    <!-- <div v-if="fileList.length > 10" class="upload-tip">
      <span>你已上传<span class="num">{{ fileList.length }}</span>个模板，</span>附件模版上传数量不能超过10个
    </div> -->
    <a-upload-dragger
      ref="fileUpload"
      name="file"
      :multiple="false"
      :disabled="disabled"
      :action="uploadUrl"
      :fileList="fileList"
      :defaultFileList="defaultValue"
      :headers="header"
      :beforeUpload="beforeUpload"
      :remove="remove"
      @change="handleChange"
    >
      <div class="center-wrapper">
        <em class="aufontAll h-icon-all-cloud-upload1"></em>
        上传附件模板
      </div>
    </a-upload-dragger>
  </div>

  <!-- </a-modal> -->
</template>

<script lang="ts">
import env from '../../../env';

import { Component, Vue, Prop, Watch, Model } from 'vue-property-decorator';
import * as FormCommentIns from 'cloudpivot/api';
import { Modal, Upload } from '@h3/antd-vue';
@Component({
  name: 'attachment-file',
  components: {
    AModal: Modal,
    AUploadDragger: Upload.Dragger,
  },
})
export default class AttachmentFile extends Vue {
  fileList: any = [];

  get header() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  get disabled() {
    return (
      this.fileList.length > 10 ||
      this.$route.path.includes('apps/versionDetail/')
    );
  }

  doc_types: any = [
    'docx',
    'xlsx',
    'pptx',
    'doc',
    'xls',
    'ppt',
    'wpt',
    'dot',
    'rtf',
    'txt',
    'xml',
    'pdf',
    'zip',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'svg',
    'tif',
  ];

  uploadUrl(): string {
    return `${env.apiHost}/api/aliyun/upload`;
  }

  defaultValue = [];

  @Prop({
    default: {},
  })
  modalData!: any;

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    const data = modalData.data;
    if (!data) {
      return;
    }
    this.defaultValue = data || [];
    this.fileList = data || [];
    // console.log(this.defaultValue, 'defaultValue');
  }

  beforeUpload(file: any) {
    const flag = this.modalData.attributes.find((item) => {
      return item.field === 'limit';
    });
    if (flag && file.size / 1024 / 1024 > Number(flag.value.replace('M', ''))) {
      this.$message.error(`${file.name} 文件最大可上传${flag.value}B`);
      return false;
    }

    const suffix = this.getSuffix(file.name);
    // console.log(this.fileList, 'fileList');
    const isLt10M = file.size / 1024 / 1024 < 10;
    return new Promise<void>((resolve, reject) => {
      if (!this.doc_types.includes(suffix)) {
        this.$message.error('文件格式不对，仅支持上传文档格式的文件!');
        reject(new Error());
      } else if (!isLt10M) {
        this.$message.error('最大不能超过10M!');
        reject(new Error());
      } else if (this.fileList.length > 10) {
        this.$message.error('最多允许上传10个模板文件');
        reject(new Error());
      } else if (this.defaultValue.length > 10) {
        this.$message.error('最多允许上传10个模板文件');
        reject(new Error());
      } else {
        resolve();
      }
    });
  }

  getSuffix(fileName: string) {
    const index = fileName.lastIndexOf('.');
    const suffix = fileName.substring(index + 1);
    return suffix;
  }

  handleChange(info: any) {
    let fileList = [...info.fileList];
    const file = info.fileList[info.fileList.length - 1];
    const flag = this.modalData.attributes.find((item) => {
      return item.field === 'limit';
    });
    if (
      flag &&
      file &&
      file.size / 1024 / 1024 > Number(flag.value.replace('M', ''))
    ) {
      this.$message.error(`${file.name} 文件最大可上传${flag.value}B`);
      fileList.pop();
    }
    if (fileList.length > 10) {
      fileList = fileList.slice(-10);
    }
    this.fileList = fileList;
    this.onOk();
  }

  async remove(file: any) {
    // console.log(file, 'file');
    // this.fileList = [];
    // this.defaultValue = [];
    // const p = {
    //   name: file.response.data.name,
    //   id: file.response.data.id,
    //   refId: file.response.data.refId
    // }
    // const res:any = await FormCommentIns.FormCommentApi.deleteTempFile({deleteList: [p, p]});
  }

  onOk() {
    let value: any = null;
    if (this.fileList.length > 0) {
      value = this.fileList;
    }
    this.$emit('backData', value);
  }
}
</script>

<style lang="less" scoped>
@import './../../../../common/common.less';
.upload-tip {
  font-size: 12px;
  margin-bottom: 10px;
  color: @light-color-3;
  .num {
    color: @primary-color;
  }
}
</style>

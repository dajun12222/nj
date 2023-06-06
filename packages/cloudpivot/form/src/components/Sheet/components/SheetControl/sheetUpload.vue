<template>
  <div>
    <!-- 编辑状态 -->
    <AUpload
      v-if="edit"
      :fileList="fileList"
      name="file"
      :multiple="true"
      :action="uploadUrl()"
      :headers="getHeaders()"
      @change="onChangeFile"
    >
      <AButton><a-icon type="upload" />点击上传文件</AButton>
    </AUpload>

    <!-- 查看状态 -->
    <div v-else>
      <div>
        <span
          class="all-download icon aufontAll h-icon-all-batch-download-o"
          @click="downloadAll"
        ></span>
        <a-button
          v-if="
            control.controller._value && control.controller._value.length > 0
          "
          class="download"
          icon="batch-download-o"
          @click="downloadAll"
        >
          批量下载
        </a-button>
      </div>
      <div>
        <div
          v-for="(item, index) in control.controller._value"
          :key="index"
          class="fileList"
        >
          <span class="fileName" :title="item.name">{{ item.name }}</span>
          <a-icon
            class="download-icon"
            type="download"
            @click="downFile(item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Provide } from 'vue-property-decorator';

import {
  listApi,
  listParams,
  formApi,
  externalLinkApi,
} from '../../../../../../api';

import { Upload, Button, Icon } from '@h3/antd-vue';

import { renderer } from '../../../../../../form';

import getDownloadUrlNew from '../../../../../../common/src/utils/getDownloadUrlNew';

@Component({
  name: 'SheetUpload',
  components: {
    AUpload: Upload,
    AButton: Button,
    AIcon: Icon,
  },
})
export default class SheetUpload extends Vue {
  @Prop() control: any;

  @Prop({ default: false }) edit?: boolean;

  fileList: any[] = [];

  isUpLoad: boolean = false;

  async onChangeFile({ fileList }) {
    this.fileList = fileList;
    console.log(fileList, 'fileList======>');
    this.$emit('change', this.fileList);
  }

  getHeaders() {
    const token =
      localStorage.getItem('token') || (window as any).externalLinkToken;
    const urlParams = { Authorization: `Bearer ${token}` };
    if (token) {
      return urlParams;
    }
    return {};
  }

  //上传链接
  uploadUrl(): string {
    const url = `${(window as any).config.apiHost}/api/aliyun/upload`;
    return url;
  }

  //下载所有
  downloadAll() {
    const files = this.control.controller._value;
    if (files && files.length > 0) {
      const list = files.filter((f) => f.response).map((f) => f.response.data);
      this.downloadBatch(list);
    }
  }

  //下载所有链接
  downloadBatch(files: renderer.H3File[]): void {
    if (files.length === 0) {
      return;
    }
    const refIds = files
      .map((f) => getDownloadUrlNew.getRefId(f.refId))
      .join(',');
    let url = `${
      (window as any).config.apiHost
    }/api/aliyun/download_multi?multiVO=${refIds}`;
    const token =
      (window as any).externalLinkToken || localStorage.getItem('token');
    if (token) {
      url += `&access_token=${token}`;
    }
    window.open(url);
  }

  //获取单个下载链接
  getDownloadUrl(file: renderer.H3File): string {
    const url = `${
      (window as any).config.apiHost
    }/api/aliyun/download?refId=${getDownloadUrlNew.getRefId(file.refId)}`;
    const token =
      (window as any).externalLinkToken || localStorage.getItem('token');
    if (!token) {
      return url;
    }
    return `${url}&T=${token}`;
  }

  //下载附件
  downFile(item) {
    const url = this.getDownloadUrl(item.response.data);
    try {
      window.open(url);
    } catch (error) {
      console.log(error);
    }
  }

  //图片数据预处理
  filePreHandle() {
    if (this.control.type === 9) {
      this.fileList = this.control.controller._value || [];
    }
  }

  mounted() {
    this.filePreHandle();
  }
}
</script>

<style lang="less" scoped>
.all-download {
  color: #2970ff;
  cursor: pointer;
  font-size: 14px;
}

.download {
  border: 0;
  padding: 0;
  color: #2970ff;
}

.fileList {
  color: rgba(0, 0, 0, 0.45);
  .download-icon {
    width: 40px;
    height: 20px;
    display: inline-block;
    vertical-align: middle;
    line-height: 20px;
    font-size: 15px;
  }
  .download-icon:hover {
    color: #333;
  }

  .fileName {
    width: 44px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>

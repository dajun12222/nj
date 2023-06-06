<template>
  <div>
    <div>
      <AUpload
        :action="uploadUrl()"
        :headers="getHeaders()"
        :multiple="true"
        listType="picture-card"
        :fileList="fileList"
        class="ImageUpload"
        @preview="handlePreview"
        @change="handleChange"
      >
        <div v-if="fileList && fileList.length < 10">
          <a-icon type="plus" />
          <div class="upload-text">Upload</div>
        </div>
      </AUpload>
      <img-preview
        v-if="previewVisible"
        :imgList="fileList"
        :seletedIndex="previewIndex"
        @close="previewVisible = false"
      />
    </div>
    <!-- <div v-else>

    </div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Provide } from 'vue-property-decorator';

import PCImagePreview from '../../../../../../form/src/common/components/pc-image-preview.vue';

import { Upload, Button, Icon } from '@h3/antd-vue';

import { renderer } from 'cloudpivot/form';

import getDownloadUrlNew from '../../../../../../common/src/utils/getDownloadUrlNew';

@Component({
  name: 'SheetImage',
  components: {
    AUpload: Upload,
    ImgPreview: PCImagePreview,
    AIcon: Icon,
  },
})
export default class SheetImage extends Vue {
  @Prop() control: any;

  @Prop({ default: false }) edit?: boolean;

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

  previewVisible: boolean = false;

  fileList: any[] = [];

  handleCancel() {
    this.previewVisible = false;
  }

  //预览下载链接
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

  previewIndex: number = 0;

  async handlePreview(file: any, b, c) {
    this.fileList.forEach((item, index) => {
      if (item.response.data.id === file.response.data.id) {
        this.previewIndex = index;
      }
    });
    this.previewVisible = true;
  }

  //图片数据预处理
  imagePreHandle() {
    if (this.control.type === 10) {
      this.fileList = this.control.controller._value || [];
      this.fileList.forEach((file) => {
        file.url = this.getDownloadUrl(file.response.data);
      });
    }
  }

  handleChange({ fileList }) {
    this.fileList = fileList;
    this.control.controller._value = this.fileList;
    this.$emit('change', fileList);
  }

  mounted() {
    this.imagePreHandle();
  }
}
</script>

<style lang="less" scoped>
.ImageUpload {
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

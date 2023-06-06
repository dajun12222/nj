<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="logo-info">
    <a-upload
      v-show="!logoUrl && type === 'edit'"
      :action="uploadUrl"
      :beforeUpload="beforeUpload"
      :multiple="false"
      listType="text"
      :fileList="fileList"
      :headers="header"
      class="upload"
      @preview="handlePreview"
      @change="onChange"
    >
      <div class="up-file-content">
        <i class="icon aufontAll h-icon-all-plus-o"></i>
      </div>
    </a-upload>
    <template v-if="logoUrl">
      <div
        class="img-wrapper"
        :class="options.type + (type === 'view' ? ' view' : '')"
      >
        <img :src="logoUrl" alt="" />
        <div v-if="type === 'edit' && logoUrl" class="btns">
          <span
            class="icon aufontAll h-icon-all-eye-o1"
            @click="showViewBox = true"
          ></span>
          <span
            class="icon aufontAll h-icon-all-delete-o1"
            @click="delLogo"
          ></span>
        </div>
      </div>
    </template>

    <div v-if="showViewBox" class="view-box" @click.self="showViewBox = false">
      <img :src="logoUrl" alt="" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { renderer } from 'cloudpivot/form';
import env from './../../../env';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import { Upload } from '@h3/antd-vue';

interface OPTIONS {
  width: number;
  height: number;
  size: number;
  type: string;
}

@Component({
  name: 'logoInfos',
  components: {
    AUpload: Upload,
  },
})
export default class logoInfos extends Vue {
  @Prop() options!: OPTIONS;

  @Prop() type!: 'view' | 'edit';

  @Prop() refId!: string;

  showViewBox: boolean = false;

  isDel: boolean = false;

  get uploadUrl() {
    return renderer.UploadControl.service.getUploadUrl();
  }

  get header() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  get imgStyle() {
    return {
      width: this.options.width + 'px',
      height: this.options.height + 'px',
    };
  }

  getRefId() {
    return this.resources[0] ? this.resources[0].refId : '';
  }

  reset() {
    this.fileList = [];
    if (this.refId) {
      this.resources = [
        {
          refId: this.refId,
        },
      ];
    } else {
      this.resources = [];
    }
    this.isDel = false;
  }

  fileList: any[] = [];

  resources: any[] = [];

  delLogo() {
    this.fileList = [];
    this.resources = [];
    this.isDel = true;
  }

  handlePreview() {}

  onChange(info: { file: any; fileList: any[]; event: any }): void {
    if (!this.checkFile(info.file)) {
      return;
    }
    this.fileList = info.fileList;
    this.resources = info.fileList
      .filter((f) => f.status === 'done')
      .map((f) => f.response.data);
  }

  beforeUpload(file: File) {
    return this.checkFile(file, (msg: string) => this.$message.error(msg));
  }

  checkFile(file: File, showError?: (msg: string) => void) {
    return (
      this.checkFileType(file.name, showError) &&
      this.checkFileSize(file, showError)
    );
  }

  checkFileType(name: string, showError?: (msg: string) => void) {
    if (['frontend-logo', 'backstage-logo'].includes(this.options.type)) {
      if (!/\.png|\.jpg/.test(name)) {
        showError && showError('只能上传png/jpg格式的图片');
      }
      return /\.png|\.jpg/.test(name);
    }
    if (['ico-logo'].includes(this.options.type)) {
      if (!/\.ico/.test(name)) {
        showError && showError('只能上传ico格式的图标');
      }
      return /\.ico/.test(name);
    }
  }

  checkFileSize(file: File, showError?: (msg: string) => void) {
    const limit = this.options.size;
    const size = file.size / 1024 / 1024;
    if (size > limit) {
      showError &&
        showError(
          this.$t('cloudpivot.form.renderer.tip.overSize', {
            label: limit,
          }).toString(),
        );
      return false;
    }
    return true;
  }

  get logoUrl() {
    if (this.resources.length && this.resources[0].refId) {
      this.isDel = false;
      return this.getDownloadUrlByRefId(this.resources[0].refId);
    } else if (!this.isDel) {
      if (this.options.type === 'frontend-logo') {
        return require('./images/frontend-logo.png');
      } else if (this.options.type === 'backstage-logo') {
        // return require('./images/back-logo.png');
        return require('./images/logo.png');
      } else if (this.options.type === 'ico-logo') {
        return require('./images/favicon.png');
      } else {
        //Else Empty block statement
      }
    } else {
      //Else Empty block statement
    }
    return '';
  }

  getDownloadUrlByRefId(refId: string): string {
    return getDownloadUrlNew.getImageUrl(refId, 'logo');
  }
}
</script>

<style lang="less" scoped>
.logo-info {
  height: 48px;
  overflow: hidden;
}
.up-file-content {
  width: 48px;
  height: 48px;
  background: #d8d8d8;
  opacity: 0.19;
  border: 1px solid #979797;
  display: flex;
  justify-content: center;
  align-items: center;
  i {
    font-size: 15px;
    color: rgba(17, 18, 24, 0.5);
  }
}
.img-wrapper {
  position: relative;
  background-color: #f1f1f1;
  &.view {
    border: 1px dashed #979797;
  }
  &:not(.view) {
    border: 1px solid #fff;
  }
  &.frontend-logo {
    width: 213.3333px;
    height: 48px;
  }
  &.backstage-logo,
  &.ico-logo {
    // width: 48px;
    min-width: 48px;
    height: 48px;
    display: inline-block;
  }
  img {
    // width: 100%;
    height: 100%;
  }
  &:hover {
    border: 1px dashed #979797;
    .btns {
      display: flex;
    }
  }
  .btns {
    display: none;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);
    width: 100%;
    height: 100%;
    border: 1px dashed #979797;
    span {
      font-size: 16px;
      cursor: pointer;
      color: #fff;
      &:first-child {
        margin-right: 4px;
      }
    }
  }
}

.view-box {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
  img {
    width: auto;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>

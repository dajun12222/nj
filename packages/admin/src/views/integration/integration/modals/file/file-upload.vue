<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <div class="data-upload">
      <div class="upload-left">所属分组:</div>
      <div class="upload-right">
        <a-select style="width: 100%" :value="groupItem.id" disabled>
          <a-select-option
            :key="groupItem.id"
            :value="groupItem.id"
            :disabled="true"
          >
            {{ groupItem.name }}
          </a-select-option>
        </a-select>
      </div>
      <div class="clearfix"></div>
    </div>
    <div class="data-upload">
      <div class="upload-left">{{ $t('languages.Apps.UploadLocalFile') }}:</div>
      <div class="upload-right">
        <div class="upload-dragger">
          <a-upload-dragger
            :multiple="false"
            :fileList="fileList"
            :accept="accept"
            :action="action"
            :headers="header"
            :beforeUpload="beforeUpload"
            :remove="removeFile"
            @change="handleChange"
          >
            <div class="tip">
              <i class="aufontAll h-icon-all-export_o"></i>
              {{ $t('languages.Apps.ClickOrDragFile') }}
              <span> 点击上传 </span>
              <div class="upload-tip">支持.zip格式，文件大小不限</div>
            </div>
          </a-upload-dragger>
        </div>
      </div>
      <div class="clearfix"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { LanguageTransform } from '@/utils';
import { listApi as Application } from 'cloudpivot/api';
import { Icon, Select, Upload } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { utils } from 'cloudpivot/common';

const MenuModule = namespace('Apps/AppItem');

@Component({
  name: 'DataUpload',
  components: {
    AUpload: Upload,
    AIcon: Icon,
    AUploadDragger: Upload.Dragger,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class DataUpload extends Vue {
  @MenuModule.State('floders') floders: any;

  @Prop() accept!: any;

  @Prop() action!: any;

  @Prop() clearFileList!: string;

  @Prop() defaultFolder!: string;

  @Prop() importType!: string;

  @Prop() groupItem!: any;

  fileList: Array<any> = []; // 文件列表

  folderId: string = '';

  mounted() {
    this.folderId = this.defaultFolder;
  }

  destroyed() {
    console.log('upload destoyed');
  }

  get disabled() {
    return this.fileList.length > 0;
  }

  get header() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  handleChange({ file }: any) {
    if (file.status === 'uploading') {
      this.fileList = [
        Object.assign(file, { name: utils.hiddenStrMiddle(file.name, 26, 60) }),
      ];
    }
    if (file.status === 'done') {
      const resName: string = file.response;
      this.$emit('setFileName', resName); // 返回文件名
    }

    if (file.status === 'removed') {
      Application.deleteTemporaryFile({ fileName: file.response });
      this.$emit('setFileName', '');
    }
  }

  // 删除文件
  async removeFile(file: any) {
    this.fileList = [];
  }

  /**
   * 文件上传前校验文件类型
   */
  beforeUpload(file: any) {
    /* this.fileList = [...this.fileList, file] */ this.fileList =
      this.fileList.slice(-1);
    const isZip = file.type.includes('zip');
    if (!isZip) {
      this.fileList.pop();
      this.$message.error('仅支持上传zip格式的文件');
      return false;
    }
    const types = this.accept.split(',');
    const fileType = file.name.substring(file.name.lastIndexOf('.'));
    return types.indexOf(fileType) > -1;
  }

  /**
   * 选择文件夹
   */
  handleFolderChange(folder: string) {
    this.$emit('setFolderId', folder);
  }

  /**
   * 获取当前语言对应展示名
   */
  getLangName(item: any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }

  @Watch('clearFileList')
  onClearFileListChange(v: string) {
    if (!v) {
      return;
    }
    if (v === 'clear') {
      this.$nextTick(() => {
        this.fileList.splice(0, 1);
      });
    }
  }

  @Watch('defaultFolder')
  onDefaultFolderChange(v: string) {
    this.$nextTick(() => {
      if (v) {
        this.folderId = v;
      }
    });
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/import/file-upload.less';
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <div class="modal-body">
      <div class="steps">
        <a-steps size="small" :current="0" :status="'process'">
          <a-step :title="$t('languages.Apps.UploadFile')" />
          <a-step :title="$t('languages.Apps.VerifyFile')" />
          <a-step :title="$t('languages.Apps.Import')" />
        </a-steps>
      </div>

      <div class="data-upload">
        <div class="folders">
          <div class="upload-left">{{ $t('languages.Apps.Catalogues') }}:</div>
          <div class="upload-right">
            <a-select
              v-model="folderId"
              style="width: 100%"
              @change="handleFolderChange"
            >
              <a-select-option
                v-for="(floder, index) in tree"
                :key="index"
                :value="floder.id"
              >
                {{ getLangName(floder) }}
              </a-select-option>
            </a-select>
          </div>
          <div class="clearfix"></div>
        </div>
        <div class="folders">
          <div class="upload-left">
            {{ $t('languages.Apps.UploadLocalFile') }}:
          </div>
          <div class="upload-right">
            <div class="upload-dragger">
              <a-upload-dragger
                :multiple="false"
                :accept="accept"
                :fileList="fileList"
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
                  <div class="upload-tip">
                    {{ $t('languages.Apps.SupportXMLFile') }}
                  </div>
                </div>
              </a-upload-dragger>
            </div>
          </div>
          <div class="clearfix"></div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <!-- 下一步 -->
      <a-button type="primary" :disabled="nextDisabled" @click="nextStep">
        {{ $t('languages.Apps.NextStep') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { LanguageTransform } from '@/utils';
import { listApi as Application } from 'cloudpivot/api';
import { Upload, Select, Steps, Button } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { utils } from 'cloudpivot/common';

const AppCenterModule = namespace('Apps/AppCenter');

const MenuModule = namespace('Apps/AppItem');

@Component({
  name: 'DataUpload',
  components: {
    AUpload: Upload,
    AUploadDragger: Upload.Dragger,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button,
    ASteps: Steps,
    AStep: Steps.Step,
  },
})
export default class DataUpload extends Vue {
  @MenuModule.State('floders') floders: any;

  @MenuModule.State('menuId') menuId: any;

  @AppCenterModule.State('appInfo') appDetails: any;

  @MenuModule.State('appInfo') appInfo: any;

  @MenuModule.Action('getFolders') getFolders: any;

  @Prop() accept!: any;

  @Prop() action!: any;

  defaultFolder: string = ''; // 默认目录

  fileList: Array<any> = []; // 文件列表

  folderId: string = '';

  nextDisabled: boolean = true; // 下一步按钮状态

  fileName: string = '';

  mounted() {
    const promise = new Promise((resolve: (value: any) => void, reject) => {
      resolve(this.getFolders(this.appInfo));
    });
    promise.then(() => {
      if (this.menuId) {
        const flodersList = this.allGroup(this.floders);
        const id = flodersList.filter((val) => val.id === this.menuId);
        if (id.length === 0) {
          this.defaultFolder = this.appDetails.id;
        } else {
          this.defaultFolder = this.menuId;
        }
      } else {
        this.defaultFolder = this.appDetails.id;
      }
      this.folderId = this.defaultFolder;
    });
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

  get tree(): any[] {
    return this.allGroup(this.floders);
  }

  allGroup(res: any) {
    const retData = [] as any;
    const _helper = (data: any) => {
      if (!data) {
        return;
      }
      data.forEach((item: any) => {
        retData.push(item);
        if (Array.isArray(item.children)) {
          _helper(item.children);
        }
      });
    };
    _helper(res);
    return retData;
  }

  handleChange({ file, fileList }: any) {
    if (file.status === 'uploading') {
      this.fileList = [
        Object.assign(file, { name: utils.hiddenStrMiddle(file.name, 26, 60) }),
      ];
    }
    // 上传完成逻辑
    if (file.status === 'done') {
      this.fileName = file.response;
    }

    if (file.status === 'removed') {
      Application.deleteTemporaryFile({ fileName: file.response });
      this.fileName = '';
    }
  }

  // 删除文件
  removeFile(file: any) {
    this.fileList = [];
    this.fileName = '';
  }

  @Watch('fileName')
  watchFileName(fileName) {
    if (fileName !== '') {
      this.nextDisabled = false;
    } else {
      this.nextDisabled = true;
    }
  }

  /**
   * 文件上传前校验文件类型
   */
  async beforeUpload(file: any) {
    return new Promise((resolve, reject) => {
      const types = this.accept.split(',');
      const fileType = file.name.substring(file.name.lastIndexOf('.'));
      if (!(types.indexOf(fileType) > -1)) {
        this.$message.error('仅支持上传xml格式的文件');
        reject(new Error('仅支持上传xml格式的文件'));
      } else {
        resolve(file);
      }
    });
  }

  /**
   * 选择文件夹
   */
  handleFolderChange(folder: string) {
    console.log(folder, 'folder');
    this.folderId = folder;
  }

  /**
   * 获取当前语言对应展示名
   */
  getLangName(item: any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }

  nextStep() {
    this.$emit('nextStep', {
      fileName: this.fileName,
      folderId: this.folderId,
    });
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/import/file-upload.less';
</style>

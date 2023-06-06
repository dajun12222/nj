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
        <div class="upload-left">所属分组:</div>
        <div class="upload-right">
          <a-select v-model="groupId" style="width: 100%">
            <template v-for="item in groupList">
              <a-select-option
                v-show="item.code !== 'all'"
                :key="item.id"
                :value="item.id"
              >
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </div>
        <div class="clearfix"></div>
      </div>
      <div class="data-upload">
        <div>
          <div class="upload-left">
            {{ $t('languages.Apps.UploadLocalFile') }}:
          </div>
          <div class="upload-right">
            <div class="upload-dragger">
              <a-upload-dragger
                :multiple="false"
                :accept="accept"
                :fileList="fileList"
                :action="uploadUrl"
                :headers="header"
                :beforeUpload="beforeUpload"
                :remove="removeFile"
                @change="handleChange"
              >
                <div class="tip">
                  <i class="aufontAll h-icon-all-export_o"></i>
                  {{ $t('languages.Apps.ClickOrDragFile') }}
                  <span> 点击上传 </span>
                  <div v-if="importType === 'MARKET'" class="upload-tip">
                    提示：仅支持安装云枢应用市场中心下载的应用
                  </div>
                  <div v-else class="upload-tip">
                    支持.zip格式，文件大小不限
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
      <div>
        <a-button type="primary" :disabled="!fileName" @click="nextStep">{{
          $t('languages.Apps.NextStep')
        }}</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import AppsApi from '@/apis/apps';
import { listApi as Application } from 'cloudpivot/api';
import { Icon, Upload, Button, Steps, Select } from '@h3/antd-vue';
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { utils } from 'cloudpivot/common';

const AppCenterModule = namespace('Apps/AppCenter');

const MenuModule = namespace('Apps/AppItem');

@Component({
  name: 'DataUpload',
  components: {
    AUpload: Upload,
    AUploadDragger: Upload.Dragger,
    AIcon: Icon,
    ASteps: Steps,
    AStep: Steps.Step,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class DataUpload extends Vue {
  @MenuModule.State('floders') floders: any;

  @AppCenterModule.State('appGroupList') groupList: any[];

  @Prop() importType!: string;

  @Inject()
  getgroupInfo!: Function;

  accept: any = '.zip';

  fileList: Array<any> = []; // 文件列表

  folderId: string = '';

  groupId: any = '';

  fileName: string = '';

  @Watch('groupList', { deep: true, immediate: true })
  groupListChane() {
    this.groupId = this.getgroupInfo().id;
  }

  // 上传接口
  get uploadUrl() {
    return AppsApi.fileUploadUrl;
  }

  get header() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async handleChange({ file, fileList }: any) {
    if (file.status === 'uploading') {
      this.fileList = [
        Object.assign(file, { name: utils.hiddenStrMiddle(file.name, 26, 60) }),
      ];
    }
    // 上传完成逻辑
    if (file.status === 'done') {
      this.fileName = file.response; // 返回文件名
    } else if (file.status === 'removed') {
      Application.deleteTemporaryFile({ fileName: file.response });
      this.fileName = '';
    } else {
      //Else Empty block statement
    }
  }

  // 删除文件
  async removeFile(file: any) {
    this.fileList = [];
    this.fileName = '';
  }

  /**
   * 文件上传前校验文件类型
   */
  async beforeUpload(file: any) {
    return new Promise((resolve, reject) => {
      const types = this.accept.split(',');
      const fileType = file.name.substring(file.name.lastIndexOf('.'));
      if (!(types.indexOf(fileType) > -1)) {
        this.$message.error('仅支持上传zip格式的文件');
        reject(new Error('仅支持上传zip格式的文件'));
      } else {
        resolve(file);
      }
    });
  }

  onTypeItemReturn() {
    this.$emit('onTypeItemReturn');
  }

  nextStep() {
    this.$emit('nextStep', {
      fileName: this.fileName,
      groupId: this.groupId,
    });
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/import/file-upload.less';
</style>

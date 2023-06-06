<template>
  <div>
    <div v-if="pageMode === 'wr'" class="batch-info">
      <h3-textarea
        v-model="remarks"
        :title="$t('cloudpivot.flowCenter.mobile.approveSuggestion')"
        :placeholder="$t('languages.common.input')"
      />
      <div class="seperate"></div>
      <h3-upload
        listType="file"
        :placehloder="$t('cloudpivot.form.renderer.clickUpload')"
        :title="$t('cloudpivot.flowCenter.mobile.attachment')"
        :action="uploadUrl"
        :locale="locale"
        :headers="headers"
        :onChange="onChange"
        :remove="onRemoveFile"
        :multiple="true"
      />
      <signatrue
        :readonly="false"
        :popupScale="100"
        :title="$t('cloudpivot.flowCenter.mobile.signature')"
        :required="false"
        @change="imageChange"
      />
      <div class="submit-btn" @click="batchProcess">
        {{ this.$t('languages.common.ok') }}
      </div>
    </div>
    <div v-if="pageMode === 'r'" class="faillist">
      <batch-fail-list :failResults="failResults" />
    </div>
  </div>
</template>
>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import '../../../../../common/src/config/mobile/h3-form';
import { H3Upload, H3Textarea } from 'h3-mobile-vue';
import BatchFailList from './batch-fail-list.vue';
import { homeApi } from '../../../../../api';
import { renderer } from '../../../../../form';
import Signatrue from '../../../../../form/src/renderer/components/shared/signatrue.vue';
import { UploadControl } from '../../../../../form/src/common/controls/upload-control';

@Component({
  name: 'BatchInfoAdd',
  components: {
    BatchFailList,
    H3Textarea,
    H3Upload,
    Signatrue,
  },
})
export default class BatchInfoAdd extends Vue {
  failResults: any[] = [];

  remarks = '';

  previewVisible = false;

  previewImage = '';

  fileList: any[] = [];

  imgFileList: any[] = [];

  maxSize = 5242880; //5M

  isUploaded: boolean = false;

  uploadedStatus: any = [];

  pageMode = 'wr'; // 页面模式,表明是填写页面还是错误列表页

  image_types: string[] = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.svg',
    '.tif',
  ];

  doc_types: string[] = [
    '.docx',
    '.xlsx',
    '.pptx',
    '.doc',
    '.xls',
    '.ppt',
    '.wpt',
    '.dot',
    '.rtf',
    '.txt',
    '.xml',
    '.pdf',
  ];

  get uploadUrl() {
    return renderer.UploadControl.service.getUploadUrl();
  }

  get locale() {
    return this.$i18n.locale || 'zh';
  }

  get headers() {
    return {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`,
    };
  }

  get accept() {
    const { image_types, doc_types } = this;
    return image_types.concat(doc_types).join(',');
  }

  uploadError(err: any) {
    if (err) {
      this.$h3.toast.show({
        text: this.$t('cloudpivot.form.renderer.tip.uploadError'),
        autoHide: true,
        duration: 3000,
      });
    }
  }

  upLoad(file: any) {
    if (file) {
      UploadControl.service.upFile(file).then((res: any) => {
        if (res.errcode === 0) {
          this.imgFileList = [res.data];
        }
      });
    }
  }

  beforeUploadMobile(files: any) {
    return true;
  }

  imageChange(data) {
    if (!data) {
      this.imgFileList = [];
    } else {
      this.upLoad(data);
    }
  }

  getBatchWorkItem() {
    return homeApi
      .searchWorkitems({
        wd: '',
        page: 0,
        size: 20,
        batchOperate: true,
        appCode: window.Environment.appCode,
      })
      .then((res: any) => {
        if (!res.data || res.errcode) {
          return 0;
        }
        return res.data.content;
      });
  }

  onRemoveFile(file: any) {
    const refId: string = file.refId;
    const index: number = this.fileList.findIndex(
      (item: any) => item.refId === refId,
    );
    this.fileList.splice(index, 1);
  }

  onChange(info: any) {
    const { status, response } = info.value;
    // status 1 准备上传 2 已上传 3上传失败 -1正在上传
    if (status === 2) {
      this.fileList.push(response.data);
      this.uploadedStatus.push(info.value);
      // this.isUploaded = this.alreadyFiles === this.uploadedStatus.length;
      return;
    }
    // this.$t('cloudpivot.formComment.mobile.uploadFail')
    if (status === 3) {
      return this.$h3.toast.show({
        text: this.$t('cloudpivot.formComment.mobile.uploadFail'),
        autoHide: true,
        duration: 3000,
      });
    }
  }

  showModalTip(successNum) {
    this.$h3.modal.show({
      type: 'alert',
      content: `${successNum}${this.$t(
        'cloudpivot.flowCenter.mobile.batchSuccess',
      )}`,
      actions: [
        {
          text: this.$t('languages.common.ok'),
          onPress: () => {
            this.getBatchWorkItem().then((data: any) => {
              if (data.length) {
                this.$router.replace({
                  path: '/home/workitems',
                  query: { pageMode: 'batch' },
                });
              } else {
                this.$router.replace({ path: '/home/workitems' });
              }
            });
          },
        },
      ],
    });
  }

  showConfirmModal(successNum, failNum) {
    this.$h3.modal.show({
      type: 'alert',
      content: `${successNum}${this.$t(
        'cloudpivot.flowCenter.mobile.batchSuccess',
      )}</br>${failNum}${this.$t('cloudpivot.flowCenter.mobile.batchFail')}`,
      actions: [
        {
          text: this.$t('languages.common.cancel'),
          onPress: () => {
            this.$router.replace({
              path: '/home/workitems',
              query: { pageMode: 'batch' },
            });
          },
        },
        {
          text: this.$t('languages.common.showDetail'),
          onPress: () => {
            this.pageMode = 'r';
          },
        },
      ],
    });
  }

  batchProcess() {
    this.$h3.toast.show({
      text: `${this.$t('cloudpivot.flowCenter.mobile.batchProcess')}…`,
      iconType: 'loading',
      autoHide: false,
    });

    const { ids } = this.$route.query;
    let taskIds = [];
    if (ids) {
      taskIds = (ids as any).split(',');
    }
    const approval = {
      resources: this.fileList.concat(this.imgFileList),
      content: this.remarks,
    };

    const params: any = { taskIds, approval };
    homeApi.batchUnfinishedWorkitem(params).then((res: any) => {
      this.$h3.toast.hide();
      const { successNum, failNum, failResults } = res; //|| {successNum: 13,failNum:5,failResults:[]};
      if (failNum === 0) {
        this.showModalTip(successNum);
      } else {
        this.failResults = failResults;
        this.showConfirmModal(successNum, failNum);
      }
    });
  }

  postData() {
    const { ids } = this.$route.query;
    let taskIds = [];
    if (ids) {
      taskIds = (ids as any).split(',');
    }
    const approval = {
      resources: this.fileList.concat(this.imgFileList),
      content: this.remarks,
    };
    return homeApi.batchUnfinishedWorkitem({ taskIds, approval });
  }
}
</script>
<style lang="less" scoped>
@import '../../../../../common/styles/mixins.less';
.seperate {
  .px2rem(height,16px);
  //height: 0.2rem;
  background: @white-background;
}
.batch-info {
  background-color: @white-background;
  overflow: hidden;
  height: 100%;
  //position: relative;
}
.submit-btn {
  position: absolute;
  width: 100%;
  .hairline('top', #eeeeee);
  // border-top: 1px solid #eee;
  .px2rem(height, 88px);
  .px2rem(font-size, 32px);
  .px2rem(line-height, 88px);
  bottom: 0;
  background: @white-background;
  color: @primary-color;
  z-index: 99;
}
</style>
<style>
.h3-toast-notice-content .h3-toast-text-icon {
  width: 150px;
  height: 150px;
}
</style>

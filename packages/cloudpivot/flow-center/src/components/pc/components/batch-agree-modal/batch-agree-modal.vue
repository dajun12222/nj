<!--
 * @Descripttion: 批量同意
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-12-11 14:33:29
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-07 15:21:32
-->
<template>
  <div>
    <customPop
      v-model="visible"
      :cancelText="$t('cloudpivot.flowCenter.pc.cancel')"
      :okText="$t('cloudpivot.flowCenter.pc.ok')"
      width="640px"
      height="auto"
      @OK="handleOk"
    >
      <template slot="title">
        {{ $t('cloudpivot.flowCenter.pc.batchAgree') }}
      </template>
      <template slot="content">
        <div class="list">
          <label>{{ $t('cloudpivot.flowCenter.pc.approveSuggestion') }}</label>
          <div class="content-wrapper">
            <a-textarea
              v-model="content"
              placeholder="请输入"
              :rows="5"
              :maxLength="200"
            />
            <div class="num">{{ content.length }}/200</div>
          </div>
        </div>
        <div class="list">
          <label>{{ $t('cloudpivot.flowCenter.pc.uploadFile') }}</label>
          <div>
            <a-upload-dragger
              :multiple="true"
              :action="uploadUrl"
              :beforeUpload="beforeUpload"
              listType="text"
              :fileList="fileList"
              :headers="headers"
              class="upload"
              @preview="handlePreview"
              @change="onChange"
            >
              <div class="tip">
                <a-icon type="cloud-upload" />
                <p>
                  {{ $t('cloudpivot.form.renderer.dragFiles')
                  }}<span>{{
                    $t('cloudpivot.form.renderer.clickUpload')
                  }}</span>
                </p>
              </div>
            </a-upload-dragger>
          </div>
        </div>
      </template>
    </customPop>

    <!-- <a-modal
      :visible="visible"
      :width="640"
      :maskClosable="false"
      dialogClass="batch-agree"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <template slot="title">
        <span class="modal-title">批量同意</span>
      </template>

      <div class="batch-agree-box">
        <div class="label">审批意见</div>
        <div class="input-box">
          <a-textarea
            placeholder="请输入"
            v-model="content"
            :rows="5"
            :maxLength="200"
          />
          <div class="num">{{ content.length }}/200</div>
        </div>

        <div class="label">上传文件</div>
        <a-upload-dragger
          :multiple="true"
          :action="uploadUrl"
          :beforeUpload="beforeUpload"
          listType="text"
          :fileList="fileList"
          :headers="headers"
          @preview="handlePreview"
          @change="onChange"
          class="upload">
          <div class="tip">
            <a-icon type="cloud-upload" />
           <p>将文件拖拽到此处，<span>点击上传</span></p>
          </div>
        </a-upload-dragger>
      </div> -->

    <!-- 手写签名 -->
    <!-- <batchOperationComment/>

    </a-modal> -->
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Modal, Input, Icon, Upload } from '@h3/antd-vue';
import batchOperationComment from './components/comment.vue';
import { DefaultFileService } from '../../../../../../common/src/config/portal/h3-form/file-service';
import customPop from '../../../../../../form/src/common/components/customPop.vue';

@Component({
  name: 'batch-agree-modal',
  components: {
    AModal: Modal,
    batchOperationComment,
    ATextarea: Input.TextArea,
    AIcon: Icon,
    AUpload: Upload,
    AUploadDragger: Upload.Dragger,
    customPop,
  },
})
export default class BatchAgreeModal extends Vue {
  @Prop() value!: boolean;

  visible: boolean = false;

  @Watch('value')
  onValueChange(val) {
    this.visible = val;
    this.content = '';
  }

  @Watch('visible')
  onVisibleChange(val) {
    this.$emit('input', val);
  }

  content: string = '';

  DefaultFileService: any = new DefaultFileService();

  fileList: any[] = [];

  get uploadUrl() {
    return this.DefaultFileService.getUploadUrl();
  }

  get headers() {
    return this.DefaultFileService.getHeaders();
  }

  beforeUpload(file: File) {
    return this.checkFile(file, this.showError);
  }

  showError(msg: string) {
    this.$message.error(msg);
  }

  handlePreview() {}

  checkFile(file: File, showError?: (msg: string) => void) {
    // if (!this.checkFileType(file.name, showError)) {
    //   return false;
    // }

    // if (!this.checkFileSize(file, showError)) {
    //   return false;
    // }

    return true;
  }

  onChange(info: { file: any; fileList: any[]; event: any }): void {
    if (!this.checkFile(info.file)) {
      return;
    }

    this.fileList = info.fileList;
  }

  handleOk() {
    this.fileList.forEach((item) => {
      item.refId = item.response.data.refId || '';
    });
    this.$emit('ok', { content: this.content, resources: this.fileList });
  }

  handleCancel() {
    this.$emit('cancel', false);
  }
}
</script>
<style lang="less" scoped>
.batch-agree {
  .modal-title {
    font-size: 16px;
    color: #111218;
    font-weight: 700;
  }

  &-box {
    .label {
      font-size: 14px;
      color: #111218;
      font-weight: 400;
      margin: 16px 0 6px;
    }
    .input-box {
      position: relative;
      .num {
        position: absolute;
        color: rgba(17, 18, 24, 0.25);
        font-size: 12px;
        right: 0;
        bottom: -18px;
      }
    }
  }
}

/deep/ .ant-upload-drag {
  background-color: #fff;
}
/deep/ .ant-modal-footer {
  border-top: 0;
  .ant-btn {
    height: 32px;
  }
}

.list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 10px;
  label {
    width: 114px;
    display: inline-block;
    text-align: left;
    height: 32px;
    line-height: 32px;
    color: #111218;
    .font-ele {
      color: red;
    }
  }
  & > div {
    flex: 1;
  }

  .content-wrapper {
    position: relative;
    textarea {
      height: 96px;
      border-radius: 2px;
    }
    .num {
      position: absolute;
      right: 8px;
      top: 74px;
      color: rgba(17, 18, 24, 0.25);
      font-size: 12px;
      pointer-events: none;
    }
  }
  .upload {
    /deep/.ant-upload.ant-upload-drag {
      border-radius: 2px;
    }
  }
}

.tip {
  padding: 9px 0;
  .anticon-cloud-upload {
    font-size: 35px;
    color: rgba(17, 18, 24, 0.25);
    margin-bottom: 13px;
  }
  > p {
    font-size: 14px;
    color: rgba(17, 18, 24, 0.5);
    font-weight: 400;
    > span {
      color: #2970ff;
      cursor: pointer;
    }
  }
}
</style>

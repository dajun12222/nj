<template>
  <div class="h3-approve">
    <div v-if="showApprove" class="h3-approve-title">
      <span>{{ $t('cloudpivot.form.renderer.opinion') }}</span>
      <span class="h3-approve-title-active" @click="isShow = true">
        {{ $t('cloudpivot.form.renderer.oftenOption') }}
        <i
          class="h3-field-icon-right h3-icon aufont h3-icon-right h3-icon-18 icon-base-right"
        ></i>
      </span>
    </div>
    <h3-textarea
      v-if="showApprove"
      v-model="content"
      :required="ctrl.required"
      :count="450"
      :rows="4"
      :maxLength="450"
      :autoHeight="false"
      :labelStyle="{ width: 0 }"
      :placeholder="$t('cloudpivot.form.renderer.pleaseInput')"
      @onChange="onContentChange"
    />
    <div v-if="showApprove" class="oftenOption">
      <div class="oftenOption-left">
        <h3>{{ $t('cloudpivot.form.renderer.setOften') }}</h3>
        <span>{{ $t('cloudpivot.form.renderer.opinionHint') }}</span>
      </div>
      <h3-switch
        slot="extra"
        v-model="isCommon"
        color="#2970ff"
        @onClick="setCommon"
      />
    </div>
    <h3-upload
      v-if="supprotUpload && showFile"
      listType="file"
      :title="$t('cloudpivot.form.renderer.attachment')"
      :maxSize="limitSize"
      :multiple="true"
      :data="fileList"
      :headers="headers"
      :action="uploadUrl"
      :locale="locale"
      :showErrorToast="true"
      :placehloder="$t('cloudpivot.form.renderer.clickUpload')"
      :onChange="onChange"
    />
    <signatrue
      v-if="controlOpts.showSignature && showAutograp"
      v-model="basaImg"
      :title="$t('cloudpivot.form.renderer.sign')"
      :required="controlOpts.signatureIsRequired"
      :lastAttachment="lastAttachment"
      @change="upLoad"
      @useLastAutograph="useLastAutograph"
    />

    <!-- <h3-approve
      v-model="ctrl.value.content"
      :action="uploadUrl"
      :fileList="fileList"
      :headers="headers"
      :accept="accept"
      :supprotUpload="supprotUpload"
      @input="onInput"
    ></h3-approve>-->

    <!-- 审批意见弹窗 -->
    <opinion-model
      :isCancel.sync="isShow"
      :data="opinionData"
      @addOpinion="addOrUpdateOpinion"
      @deleteOpinion="deleteOpinion"
      @select="selectItem"
    />

    <!-- 新增/修改弹窗 -->
    <opinion-add-update
      v-if="addOpinion"
      :type="type"
      :updateData="updateData"
      :max="opinionData.length ? opinionData.length : 1"
      @cancel="addOpinionCancel"
    />
  </div>
</template>

<script lang="ts">
import { workflowCenterApi } from '../../../../../api';
import {
  H3Button,
  H3PopupPicker,
  H3Switch,
  H3Textarea,
  H3Upload,
} from 'h3-mobile-vue';
import { Component, Prop } from 'vue-property-decorator';
import { ApproveOpinionControl, UploadControl } from '../../controls';
import Signatrue from '../shared/signatrue.vue';
import OpinionAddUpdate from './opinion-add-update.vue';
import OpinionModel from './opinion-model.vue';

@Component({
  name: 'approve-opinion',
  components: {
    H3Textarea,
    H3Button,
    H3Upload,
    H3Switch,
    H3PopupPicker,
    Signatrue,
    OpinionModel,
    OpinionAddUpdate,
  },
})
export default class ApproveOpinion extends ApproveOpinionControl {
  basaImg: string = '';

  handlePreview() {}

  @Prop({ default: false }) commonCommentSwitch!: boolean;

  @Prop({ default: '' }) lastAttachment?: any;

  @Prop({ default: 'submit' }) showCode?: string;

  uploading = false;

  isShow: boolean = false; //审批意见弹窗

  addOpinion: boolean = false; //新增/修改

  type: string = 'add'; //新增/修改

  opinionData: any[] = []; //用户审批意见

  updateData: any = {};

  isCommon: boolean = false; //是否常用

  CommentText: string = '';

  showApprove: boolean = true; //判断审批意见是否显示

  showFile: boolean = true; //判断上传文件是否显示

  showAutograp: boolean = true; //判断签名是否显示

  get val() {
    return this.ctrl.value || {};
  }

  // setControl() {

  //   if (this.ctrl.value && this.ctrl.value.resources) {
  //     this.fileList = this.ctrl.value.resources.map((x: any) =>
  //       this.map(x, true)
  //     );
  //   }
  // }

  setCommon(e) {
    // @ts-ignore
    this.ctrl.isCommon = !this.isCommon;
  }

  /**
   * 删除意见
   */
  async deleteOpinion(id: string) {
    const res: any = await workflowCenterApi.deleteCommonComment({ ids: id });
    if (res.errcode === 0) {
      this.getCommentList();
    } else {
      this.$h3.toast.show({
        text: res.errmsg,
        autoHide: true,
        iconType: 'close',
      });
    }
  }

  /**
   * 获取审批意见列表
   */
  async getCommentList() {
    const res: any = await workflowCenterApi.getCommonCommentList({});
    if (res.errcode === 0) {
      this.opinionData = res.data;
    } else {
      this.$h3.toast.show({
        text: res.errmsg,
        autoHide: true,
        iconType: 'close',
      });
    }
  }

  async addOpinionCancel(data: any) {
    //刷新审批意见数据
    if (data) {
      if (this.type !== 'add') {
        //修改，处理排序
        if (data.index !== data.oldIndex) {
          await this.sortEnd(
            this.opinionData[data.index - 1],
            this.opinionData[data.oldIndex - 1],
          );
        }
        this.type = 'add';
      }
      this.getCommentList();
    }
    this.addOpinion = false;
  }

  /**
   * 新增/修改审核意见
   */
  addOrUpdateOpinion(data) {
    this.addOpinion = true;
    this.type = data.id ? 'update' : 'add';
    this.updateData = data;
  }

  /**
   * 排序
   */
  async sortEnd(newItem: any, oldItem: any) {
    const resParams: any[] = [];
    const index: number = this.opinionData.findIndex(
      (item) => item.id === newItem.id,
    );
    const oldIndex: number = this.opinionData.findIndex(
      (item) => item.id === oldItem.id,
    );
    //ts报警告，使用id来替换index处理交换位置
    const temp: any = { ...this.opinionData[index] };
    this.opinionData[index] = this.opinionData[oldIndex];
    this.opinionData[oldIndex] = temp;

    this.opinionData.forEach((el, index) => {
      resParams.push({
        id: el.id,
        sortKey: index,
      });
    });
    const res: any = await workflowCenterApi.updateCommonComment({
      list: resParams,
    });
    if (res.errcode !== 0) {
      this.$h3.toast.show({
        text: res.errmsg,
        autoHide: true,
        iconType: 'close',
      });
      return;
    }
  }

  selectItem(data: any) {
    (this.ctrl as any).value = Object.assign(this.val, {
      content: data.content,
    });
  }

  setControl() {
    this.handleValueChange(this.ctrl.value);
  }

  handleValueChange(value: any) {
    // ;
    if (this.uploading) {
      this.uploading = false;
      return;
    }
    if (value && value.resources) {
      this.fileList = value.resources
        .map((x: any) => this.map(x, true))
        .filter((x) => x.name !== 'signsture.png');
    }
  }

  get $message() {
    return {
      loading: (msg?: string) => {
        this.showLoading(msg || '');
        return this.hideToast;
      },
    } as any;
  }

  showLoading(text: string) {
    this.$h3.toast.show({
      text,
      autoHide: false,
      iconType: 'loading',
    });
  }

  hideToast() {
    this.$h3.toast.hide();
  }

  upLoad(file: any) {
    let aList: any[] = [];
    if (this.ctrl.value && this.ctrl.value.resources) {
      aList = this.ctrl.value.resources.filter((res: any) => {
        return res.name !== 'signsture.png';
      });
    }
    if (!file) {
      // this.ctrl.value.resources = aList;
      (this.ctrl as any).value = Object.assign(this.val, {
        resources: aList,
      });
      return;
    }

    const closeLoading = (this.$message as any).loading();
    UploadControl.service.upFile(file).then((res: any) => {
      setTimeout(() => {
        closeLoading();
      }, 500);
      if (res.errcode === 0) {
        aList.push(res.data);
        // this.ctrl.value.resources = aList;
        (this.ctrl as any).value = Object.assign(this.val, {
          resources: aList,
        });
      }
    });
  }

  useLastAutograph(refId: string) {
    // 使用上一次签名
    var aList: any = this.val.resources || [];
    aList.push({
      ...this.lastAttachment,
    });
    (this.ctrl as any).value = Object.assign(this.val, {
      resources: aList,
    });
  }

  beforeUpload(file: File, showError: boolean = true) {
    // return super.beforeUpload(file, showError);
  }

  onContentChange(val: string) {
    (this.ctrl as any).value = Object.assign(this.val, {
      content: val,
    });
  }

  onChange(info: { value: any }, files: any[]): void {
    const signsture = this.val.resources
      ? this.val.resources.filter((el) => el.name === 'signsture.png')
      : [];
    // ;
    // 2 表示已上传
    let filesList: any[] = files
      .filter((f) => f.status === 2)
      .map((f) => f.response.data);

    const _ctrl = this.ctrl as any;

    this.uploading = true;

    filesList = [...filesList, ...signsture];
    _ctrl.value = Object.assign(this.val, {
      resources: filesList,
    });
  }

  onInput(val: string) {
    // this.ctrl.value.content = val;
    (this.ctrl as any).value = Object.assign(this.val, {
      content: val,
    });
  }

  mounted() {
    this.getCommentList();
  }

  created() {
    if (this.showCode && this.showCode === 'agree') {
      let btnConfigLists: any = sessionStorage.getItem('btnConfigList');
      if (btnConfigLists) {
        btnConfigLists = JSON.parse(btnConfigLists);
        const agreeType = btnConfigLists.filter((x) => {
          return x.code === 'agree';
        });
        if (!agreeType[0].commentPermission.visible) {
          this.showApprove = false;
        }
        if (!agreeType[0].attachmentPermission.visible) {
          this.showFile = false;
        }
        if (!agreeType[0].signPermission.visible) {
          this.showAutograp = false;
        }
      }
    } else if (this.showCode && this.showCode === 'showReject') {
      let btnConfigLists: any = sessionStorage.getItem('btnConfigList');
      if (btnConfigLists) {
        btnConfigLists = JSON.parse(btnConfigLists);
        const rejectType = btnConfigLists.filter((x) => {
          return x.code === 'rejects';
        });
        if (!rejectType[0].commentPermission.visible) {
          this.showApprove = false;
        }
        if (!rejectType[0].attachmentPermission.visible) {
          this.showFile = false;
        }
        if (!rejectType[0].signPermission.visible) {
          this.showAutograp = false;
        }
      }
    } else {
      //Else Empty block statement
    }
  }
}
</script>

<style lang="less" scoped>
@baseFontSize: 75px;
.px2rem(@name, @px) {
  @{name}: @px / @baseFontSize * 1rem;
}

.h3-approve {
  display: flex;
  flex-flow: column;
  height: 100%;
  // overflow: auto;
  .h3-upload {
    display: flex;
    flex-flow: column;
    max-height: 100%;
    overflow: auto;
  }
}

.upload {
  margin-top: 20px;
}
.h3-approve-title {
  display: flex;
  justify-content: space-between;
  .px2rem(padding-top, 25px);
  .px2rem(padding-left, 30px);
  .px2rem(padding-right, 30px);
  .px2rem(font-size, 30px);
  .h3-approve-title-active {
    color: #2970ff;
    i {
      .px2rem(font-size, 24px);
    }
  }
}
.oftenOption {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(238, 238, 238, 1);
  align-content: center;
  .px2rem(padding-top, 16px);
  .px2rem(padding-left, 30px);
  .px2rem(padding-right, 30px);
  .px2rem(padding-bottom, 16px);
  .px2rem(margin-bottom, 20px);
  .oftenOption-left {
    text-align: left;
    h3 {
      color: #333;
      .px2rem(font-size, 30px);
    }
    span {
      color: #999;
      .px2rem(font-size, 22px);
    }
  }
}
</style>

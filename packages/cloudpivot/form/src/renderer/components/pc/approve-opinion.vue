<template>
  <div>
    <SmartApprove
      v-if="showApprove"
      :value="content"
      :opinions="opinions"
      :fileList="fileList"
      :headers="headers"
      :accept="accept"
      :locale="locale"
      @input="onInput"
    />

    <!-- 常用审批意见对所有节点开放，不校验
    <div class="my-comments" v-if="commonCommentSwitch"> -->
    <div class="my-comments">
      <div v-if="showApprove" class="my-comments-wrapper">
        <a-popover
          v-model="popoverVisible"
          placement="top"
          overlayClassName="my-comments-popover"
          trigger="click"
          :getPopupContainer="
            (triggerNode) => {
              return triggerNode.parentNode;
            }
          "
        >
          <template slot="content">
            <div class="my-comments-pop">
              <div v-if="myComments.length === 0" class="noData">
                <div class="nodata-img">
                  <PageNoData
                    :isShowNoData="true"
                    :tipText="$t('cloudpivot.flowCenter.pc.noContent')"
                  />
                </div>

                <footer>
                  <div>
                    <span @click="visible = true">
                      <span class="icon aufontAll">&#xe8da;</span>{{ $t('cloudpivot.form.renderer.addDatas') }}
                    </span>
                  </div>
                </footer>
              </div>
              <div v-if="myComments.length !== 0">
                <ul>
                  <header>
                    <span class="warn-info">{{
                      $t('cloudpivot.form.renderer.tenOnly')
                    }}</span>
                    <span class="icon aufontAll close-btn" @click="closePop">&#xe996;</span>
                  </header>
                  <div class="ul-content">
                    <li
                      v-for="province in myComments"
                      :key="province.id"
                      :title="province.content"
                    >
                      <span
                        class="opinion-content"
                        @click="checkedCommentChange(province.content)"
                        >{{ province.content }}</span>
                      <span
                        class="operation-btn edit"
                        @click="editComments(province)"
                      >
                        <i class="icon aufontAll h-icon-all-edit-o edit"></i>
                      </span>
                      <span
                        class="operation-btn del"
                        @click="delComments(province)"
                      >
                        <i class="icon aufontAll h-icon-all-delete-o"></i>
                      </span>
                    </li>
                  </div>
                  <footer>
                    <div>
                      <span @click="visible = true">
                        <span class="icon aufontAll">&#xe8da;</span>{{ $t('cloudpivot.form.renderer.addDatas') }}
                      </span>
                    </div>
                  </footer>
                </ul>
              </div>
            </div>
          </template>
          <span class="font-ele">
            {{ $t('cloudpivot.form.renderer.oftenOption') }}
            <span v-if="!popoverVisible" class="icon aufontAll">&#xe88a;</span>
            <span v-if="popoverVisible" class="icon aufontAll">&#xe8ac;</span>
          </span>
        </a-popover>
      </div>

      <div class="up-file-wrapper">
        <template v-if="showFile">
          <p class="up-file-title">
            <span>{{ $t('cloudpivot.form.renderer.uploadFile') }}</span>
            <!-- <a-tooltip placement="top" overlayClassName="black-tooltip">
              <template slot="title">
                上传文件不限格式，限50个文件，每个文件在10MB之内
              </template>
              <i
                style="color: #2970ff; margin-left: 5px;"
                class="icon aufontAll h-icon-all-question-circle"
              ></i>
            </a-tooltip> -->
          </p>
          <a-upload
            v-if="supprotUpload"
            :action="uploadUrl"
            :beforeUpload="beforeUpload"
            :multiple="true"
            listType="text"
            :fileList="fileList"
            :headers="headers"
            class="upload"
            @preview="handlePreview"
            @change="onChange"
          >
            <div class="up-file-content">
              <i class="icon aufontAll h-icon-all-shared_o"></i>
              <p>
                {{ $t('cloudpivot.form.renderer.dragFiles')
                }}<span>{{ $t('cloudpivot.form.renderer.clickUpload') }} </span>
              </p>
            </div>
          </a-upload>
        </template>
      </div>

      <div v-if="showAutograp" class="left">
        <div
          class="qrcode-wrapper"
          :class="QRCodeShow || (autographUrl && !useLast) ? 'active' : ''"
        >
          <a-popover
            v-model="QRCodeShow"
            overlayClassName="qrcode-wrapper-in"
            placement="bottomLeft"
            arrowPointAtCenter
            trigger="click"
          >
            <i class="icon aufontAll h-icon-all-qrcode-o"></i>
            <span>{{ $t('cloudpivot.form.renderer.scanningSignature') }}</span>
            <template slot="content">
              <div class="qrcode">
                <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="" />
                <div v-else class="qrcode-loading">
                  <em class="icon aufontAll h-icon-all-loading-o"></em>
                </div>
                <!-- <p>{{ $t('cloudpivot.form.renderer.scanningSignature') }}</p> -->
                <span>{{ $t('cloudpivot.form.renderer.scanCodeEquip') }}</span>
              </div>
            </template>
          </a-popover>
          <a-tooltip placement="top" overlayClassName="black-tooltip">
            <template slot="title">
              {{ $t('cloudpivot.form.renderer.notCloseCode') }}
            </template>
            <i
              style="color: rgba(17, 18, 24, 0.25)"
              class="icon aufontAll h-icon-all-question-circle"
            ></i>
          </a-tooltip>
        </div>

        <div v-if="lastAutographUrl" class="multiplexing">
          <!-- <a-popover overlayClassName="qrcode-wrapper-in" placement="bottomLeft" > -->
          <!-- <i class="icon aufontAll h-icon-all-copy-o"></i> -->
          <a-checkbox v-model="useLast" @change="useLastToggle">
            {{ $t('cloudpivot.form.renderer.useLastSign') }}
          </a-checkbox>
          <!-- <template slot="content">
              <img class="lastAutograph" :src="lastAutographUrl" alt="">
            </template>
          </a-popover> -->
        </div>
      </div>
    </div>
    <!-- 审批意见上传文件 -->
    <!-- <a-upload
      v-if="supprotUpload"
      :action="uploadUrl"
      :beforeUpload="beforeUpload"
      :multiple="true"
      listType="text"
      :fileList="fileList"
      :headers="headers"
      @preview="handlePreview"
      @change="onChange"
      class="upload"
    /> -->

    <a-modal
      :visible="visible"
      :width="600"
      :title="
        currentEdit
          ? $t('cloudpivot.form.renderer.editData')
          : $t('cloudpivot.form.renderer.addDatas')
      "
      :zIndex="1040"
      centered
      @cancel="closeModal"
    >
      <div class="modal-wrapper comment-wrapper">
        <p>{{ $t('cloudpivot.form.renderer.opinion') }}</p>
        <textarea
          v-model="currentComment"
          :placeholder="$t('cloudpivot.form.renderer.pleaseInput')"
          @focus="textareaFocus = true"
          @blur="textareaFocus = false"
          @input="commentChange"
        ></textarea>
        <div v-show="textareaFocus">
          <span>{{ currentComment.length }}</span>/450
        </div>
      </div>
      <template slot="footer">
        <a-button @click="visible = false">
          {{ $t('cloudpivot.flowCenter.pc.cancel') }}
        </a-button>
        <a-button type="primary" @click="modalOK">
          {{ $t('cloudpivot.flowCenter.pc.ok') }}
        </a-button>
      </template>
    </a-modal>

    <div v-if="autographUrl" class="autograph-img">
      <div class="label">
        <!-- 签名 -->
      </div>
      <div class="autograph-img-wrapper">
        <img :src="autographUrl" alt="" />
        <span @click="removeAutograph"><i class="icon aufontAll h-icon-all-close-circle"></i></span>
      </div>
    </div>
    <!-- <div v-if="controlOpts.showSignature">
      <div class="title">
        <span>{{ $t('cloudpivot.form.renderer.sign') }} {{ $t('cloudpivot.form.renderer.tip.onlySupportMobileWrite') }}</span>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import {
  externalLinkApi,
  formApi,
  workflowCenterApi,
} from '../../../../../api';
import common from '../../../../../common/pc';
import {
  Button,
  Checkbox,
  Icon,
  Input,
  Modal,
  Popover,
  Select,
  Tooltip,
  Upload,
} from '@h3/antd-vue';
import { Component, Watch } from 'vue-property-decorator';
import myComments from '../../../../../flow-center/src/components/pc/my-comments.vue';
import { ApproveOpinionControl } from '../../controls';
import SmartApprove from '../shared/smart-approve/index.vue';

@Component({
  name: 'approve-opinion',
  components: {
    AIcon: Icon,
    AButton: Button,
    AUpload: Upload,
    AModal: Modal,
    SmartApprove,
    ASelect: Select,
    ASelectOption: Select.Option,
    ACheckbox: Checkbox,
    ATooltip: Tooltip,
    AInput: Input,
    AInputSearch: Input.Search,
    APopover: Popover,
    myComments,
    PageNoData: common.components.PageNoData,
  },
})
export default class ApproveOpinion extends ApproveOpinionControl {
  QRCodeShow: boolean = false;

  currentRefID: string = ''; // 存储已经上传了签名的refid，以防再次打开签名二维码刷新覆盖

  refId: string = '';

  useLast: boolean = false;

  showApprove: boolean = true; //控制审批意见是否显示

  showFile: boolean = true; //控制上传文件是否显示

  showAutograp: boolean = true; //控制签名是否显示

  useLastToggle() {
    if (this.useLast) {
      this.copyLastAutograph();
    } else {
      this.removeAutograph();
    }
  }

  textareaFocus: boolean = false;

  removeAutograph() {
    this.useLast = false;
    this.val.resources = this.val.resources.filter(
      (el) => el.refId !== this.currentRefID && el !== '',
    );
    (this.ctrl as any).value = Object.assign(this.val, {});
    this.fileList = this.fileList.filter(
      (el) => el.uid !== this.currentRefID && el !== '',
    );
    this.refId = '';
    this.currentRefID = '';
    this.autographUrl = '';
  }

  QRCodeShow2: boolean = false;

  @Watch('QRCodeShow')
  onQRCodeShowChange(value) {
    if (value && !this.QRCodeShow2) {
      this.QRCodeShow2 = true;
      this.setRefId();
      this.getQrCodeUrl();
    } else if (!value) {
      this.QRCodeShow2 = false;
    } else {
      //Else Empty block statement
    }
  }

  exist() {
    // 检测签名是否存在
    formApi
      .exist({
        refId: this.refId,
      })
      .then((res: any) => {
        if (res.errcode === 0 && res.data.exist) {
          this.QRCodeShow = false;
          this.currentRefID = res.data.refId;
          this.refId = res.data.refId;
          this.getAutographUrl(res.data.refId);
          this.setAutographToList(res.data.refId);
          this.useLast = false;
        } else if (this.QRCodeShow) {
          setTimeout(() => {
            this.exist();
          }, 500);
        } else {
          //Else Empty block statement
        }
      });
  }

  copyLastAutograph() {
    // 复制上一次签名
    if (!this.lastAutographRefId) {
      return;
    }
    this.currentRefID = this.lastAutographRefId;
    this.getAutographUrl(this.lastAutographRefId);
    this.setAutographToList(this.lastAutographRefId, true);
  }

  setAutographToList(rerId: string, isCopy = false) {
    // 将签名添加到列表
    if (this.val.resources) {
      // 删除已经使用的签名，使用新的签名
      this.val.resources = this.val.resources.filter(
        (el) => el.name !== 'signsture.png',
      );
      if (isCopy) {
        this.val.resources.push(this.lastAttachment);
      } else {
        this.val.resources.push({
          name: 'signsture.png',
          refId: rerId,
          mimeType: 'image/png',
        });
      }
    } else {
      if (isCopy) {
        this.val.resources = [this.lastAttachment];
      } else {
        this.val.resources = [
          {
            name: 'signsture.png',
            refId: rerId,
            mimeType: 'image/png',
          },
        ];
      }
    }
    (this.ctrl as any).value = Object.assign(this.val, {});
  }

  @Watch('fileList', {
    deep: true,
  })
  onFileListChange(list) {
    if (list.some((el) => el.uid === this.currentRefID)) {
      this.fileList = this.fileList.filter(
        (el) => el.uid !== this.currentRefID && el !== '',
      );
    }
  }

  autographUrl: string = ''; // 签名地址

  getAutographUrl(refId: string) {
    this.autographUrl = this.getDownloadUrlByRefId(refId) || '';
  }

  qrCodeUrl: string = '';

  getQrCodeUrl() {
    this.qrCodeUrl = '';
    const token: string = localStorage.getItem('token') || '';
    const origin = location.origin;
    // let origin = 'http://47.107.160.206';
    const signinUrl = `${origin}/mobile/#/signature?refId=${this.refId}&T=${token}`;
    // window.open(signinUrl)

    const params = {
      url: signinUrl,
      type: 8, //type为8表示流程审核扫描签名
      expireTime: 300000, //五分钟失效
    };
    externalLinkApi.generateShortCode(params).then((res) => {
      if (res.errcode === 0) {
        externalLinkApi
          .generateQrcode(`${origin}/api/public/short_code/to/${res.data}`)
          .then((res: any) => {
            const bytes = new Uint8Array(res);
            let data = '';
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
              data += String.fromCharCode(bytes[i]);
            }
            this.qrCodeUrl = 'data:image/png;base64,' + window.btoa(data);
            this.exist();
          });
      } else {
        this.$message.warning('获取短码失败');
      }
    });
  }

  get val() {
    return this.ctrl.value || {};
  }

  uploading = false;

  handlePreview() {}

  setControl() {
    this.handleValueChange(this.ctrl.value);
  }

  handleValueChange(value: any) {
    if (this.uploading) {
      this.uploading = false;
      return;
    }
    if (value && value.resources) {
      this.fileList = value.resources.map((x: any) => this.map(x));
      this.fileList.forEach((el) => {
        if (el.name === 'signsture.png') {
          this.getAutographUrl(el.response.data.refId);
        }
      });
    }
  }

  showError(msg: string) {
    this.$message.error(msg);
  }

  beforeUpload(file: File) {
    return this.checkFile(file, this.showError);
  }

  checkFile(file: File, showError?: (msg: string) => void) {
    if (!this.checkFileType(file.name, showError)) {
      return false;
    }

    if (!this.checkFileSize(file, showError)) {
      return false;
    }

    return true;
  }

  scrollHandle() {
    if (this.popoverVisible) {
      this.popoverVisible = false;
    }
  }

  mounted() {
    const oDiv = document.querySelector('.form-wrap');
    if (oDiv) {
      oDiv.addEventListener('scroll', this.scrollHandle);
    }
  }

  destroyed() {
    const oDiv = document.querySelector('.form-wrap');
    if (oDiv) {
      oDiv.removeEventListener('scroll', this.scrollHandle);
    }
  }

  setRefId() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.refId = user.username + new Date().getTime();
  }

  commonCommentSwitch: boolean = false;

  lastAutographUrl: string = ''; // 上一次使用的签名

  lastAutographRefId: string = '';

  lastAttachment: any = '';

  get attachmentValue() {
    return (
      (this.control.controller &&
        this.control.controller.value &&
        this.control.controller.value) ||
      ''
    );
  }

  @Watch('attachmentValue', { deep: true })
  onControlValChange(value) {
    if (value && value.lastAttachment) {
      this.lastAttachment = value.lastAttachment;
      this.lastAutographRefId = this.lastAttachment.refId;
      // 获取上一次签名
      this.lastAutographUrl = this.getDownloadUrlByRefId(
        this.lastAutographRefId,
      );
    }
  }

  created() {
    // this.setRefId();

    try {
      // @ts-ignore
      this.commonCommentSwitch = this.ctrl.options.commonCommentSwitch;
    } catch (error) {}

    this.getCommentList();

    let btnConfigLists: any = sessionStorage.getItem('btnConfigList');
    if (btnConfigLists) {
      btnConfigLists = JSON.parse(btnConfigLists);
      const agreeType = btnConfigLists.filter((x) => {
        return x.code === 'agree';
      });
      const rejectType = btnConfigLists.filter((x) => {
        return x.code === 'rejects';
      });
      if (
        !agreeType[0].commentPermission.visible &&
        !rejectType[0].commentPermission.visible
      ) {
        this.showApprove = false;
      }
      if (
        !agreeType[0].attachmentPermission.visible &&
        !rejectType[0].attachmentPermission.visible
      ) {
        this.showFile = false;
      }
      if (
        !agreeType[0].signPermission.visible &&
        !rejectType[0].signPermission.visible
      ) {
        this.showAutograp = false;
      }
    }
  }

  // 常用审批意见
  popoverVisible: boolean = false;

  searchText: string = '';

  isCommon: boolean = false;

  checkedCommentChange(CommentText) {
    (this.ctrl as any).value = Object.assign(this.val, {
      content: CommentText,
    });
    this.popoverVisible = false;
  }

  checkedComment: any = undefined;

  myComments: any[] = [];

  async getCommentList() {
    const res: any = await workflowCenterApi.getCommonCommentList({});
    if (res.errcode === 0) {
      this.myComments = res.data;
    } else {
      //Else Empty block statement
    }
  }

  setCommon() {
    if (this.isCommon && this.myComments.length >= 10) {
      this.$message.error('最多只能设置10条常用审批意见！');
      this.isCommon = false;
      return;
    }
    // @ts-ignore
    this.ctrl.isCommon = this.isCommon;
  }

  onChange(info: { file: any; fileList: any[]; event: any }): void {
    if (!this.checkFile(info.file)) {
      return;
    }

    this.fileList = info.fileList;
    this.uploading = true;
    let resources = info.fileList
      .filter((f) => f.status === 'done' || f.status === 2)
      .map((f) => f.response.data);

    let signsture: any[] = [];
    if (Array.isArray(this.val.resources) && this.val.resources.length) {
      signsture = this.val.resources.filter(
        (el) => el.name === 'signsture.png',
      );
      resources = [...resources, ...signsture];
    }
    (this.ctrl as any).value = Object.assign(this.val, {
      resources,
    });
  }

  onInput(val: string) {
    // this.ctrl.value.content = val;

    (this.ctrl as any).value = Object.assign(this.val, {
      content: val,
    });
  }

  // onCheckboxChange(checked: boolean) {
  //   this.ctrl.value.saveCommon = checked;
  // }

  onSelectFocus() {
    super.search('');
  }

  closePop() {
    this.popoverVisible = false;
  }

  visible: boolean = false;

  currentComment: string = '';

  currentEdit: any = '';

  closeModal() {
    this.visible = false;
  }

  async modalOK() {
    const testTxt = this.currentComment.trim();
    if (testTxt === '') {
      this.$message.error('审批意见不能为空！');
      return;
    }

    const params: any = {
      content: this.currentComment,
      sortKey: 0,
    };
    if (this.currentEdit) {
      params.id = this.currentEdit.id;
      params.sortKey = this.currentEdit.sortKey;
    } else {
      if (this.myComments.length === 10) {
        this.$message.error('最多设置10条常用审批意见！');
        return;
      }
    }
    const res: any = await workflowCenterApi.saveCommonComment(params);
    if (res.errcode === 0) {
      this.getList();
      this.visible = false;
      // this.popoverVisible = true;
      this.$message.success('新增成功！');
    } else {
      this.$message.error(res.errmsg);
    }
  }

  editComments(record) {
    this.currentComment = record.content;
    this.currentEdit = record;
    this.visible = true;
  }

  delVisible: boolean = false;

  delComments(record) {
    if (this.delVisible) {
      return;
    }
    const _this = this;
    this.delVisible = true;
    this.$confirm({
      title: '确定要删除？',
      okText: '确认',
      cancelText: '取消',
      zIndex: 1040,
      onOk: () => {
        this.deleteCommonComment(record.id);
        this.delVisible = false;
        // this.popoverVisible = true;
      },
      onCancel: () => {
        this.delVisible = false;
        this.popoverVisible = true;
      },
    });
  }

  async deleteCommonComment(ids) {
    const res: any = await workflowCenterApi.deleteCommonComment({
      ids: ids,
    });
    const vm: any = this;
    if (res.errcode === 0) {
      vm.$message.success('删除成功');
      this.getList();
    } else {
      this.$message.error(res.errmsg);
    }
  }

  @Watch('visible')
  onVisibleChange(val) {
    if (!val) {
      this.currentEdit = '';
      this.currentComment = '';
    }
  }

  commentChange() {
    if (this.currentComment.length > 450) {
      this.currentComment = this.currentComment.substr(0, 450);
    }
  }

  async getList() {
    const res: any = await workflowCenterApi.getCommonCommentList({});
    if (res.errcode === 0) {
      res.data.forEach((e, index) => {
        e.orderNumber = index + 1;
      });
      this.myComments = res.data;
    } else {
      this.$message.error(res.errmsg);
    }

    //判断当前常用审批意见是否超过十条（历史数据）如果超过删除多余部分
    if (res.data.length > 10) {
      for (let i = 10; i < res.data.length; i++) {
        this.deleteCommonComment(res.data[i].id);
      }
    }
  }
}
</script>

<style lang="less">
.black-tooltip .ant-tooltip-inner {
  // max-width: 200px;
}
.qrcode-wrapper-in .ant-popover-inner-content {
  padding: 0;
  margin: 0;
  .qrcode {
    padding: 6px;
    img {
      width: 200px;
      height: 200px;
    }
    span {
      padding: 0 16px;
      padding-bottom: 18px;
      display: inline-block;
    }
    // span {
    //   display: block;
    //   padding: 0 20px 15px;
    //   text-align: justify;
    // }
  }
}
</style>

<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
img.lastAutograph {
  width: 136px;
  height: 136px;
}
.autograph-img {
  position: relative;
  margin-top: 12px;
  .autograph-img-wrapper {
    width: 156px;
    height: 112px;
    background-color: #fff;
    border: 1px solid #d8d8d8;
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
    span {
      position: absolute;
      top: 5px;
      right: 5px;
      // background-color: #F4454E;
      border-radius: 7px;
      height: 14px;
      width: 14px;
      overflow: hidden;
      cursor: pointer;
      i {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #c3c4c5;
        font-size: 14px;
        background-color: transparent;
      }
    }
  }
  .label {
    position: absolute;
    right: 97%;
    text-align: left;
    width: 102px;
    margin-right: 8px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
  }
}
.qrcode {
  width: 212px;
  // max-height: 260px;
  padding: 15px 15px;
  background-color: #fff;
  // position: absolute;
  // top: 100%;
  // left: 50%;
  // margin-left: -88px;
  // z-index: 2;
  // box-shadow: 0px 4px 11px 0px rgba(0, 0, 0, 0.19);
  img {
    width: 200px;
    height: 200px;
    display: block;
  }
  span {
    font-size: 14px;
    font-weight: 400;
    color: #111218;
    line-height: 22px;
  }
  .qrcode-loading {
    width: 200px;
    height: 200px;
    background-color: rgba(0, 0, 0, 0.03);
    line-height: 200px;
    text-align: center;
    em.icon {
      font-size: 16px;
      width: 20px;
      height: 36px;
      line-height: 36px;
      display: inline-block;
      animation: loading linear 0.8s infinite;
      color: @highlightColor;
      position: relative;
    }
  }
  // span {
  //   font-size: 12px;
  //   color: rgba(0, 0, 0, 0.45);
  //   word-break: break-all;
  // }
}

/deep/ .ant-modal {
  top: 0;
}
.title {
  line-height: 32px;
  span {
    color: rgba(0, 0, 0, 0.65);
  }
}

.my-comments {
  display: flex;
  width: 100%;
  margin-top: 8px;
  justify-content: space-between;
  flex-direction: column;
  .left {
    flex: 1;
    display: flex;
    font-size: 14px;
    margin-top: 21px;
    .qrcode-wrapper {
      height: 22px;
      line-height: 22px;
      font-weight: 400;
      color: #111218;
      margin-right: 33px;
      span {
        i {
          margin-right: 10px;
        }
        span {
          margin-right: 1px;
        }
      }
      &:hover,
      &.active {
        cursor: pointer;
        color: @highlightColor;
      }
    }
    & > div {
      margin-right: 20px;
      cursor: pointer;
      &:hover {
        color: @highlightColor;
      }
    }
    i {
      font-size: 14px;
    }
    /deep/ .ant-upload-list-item {
      display: none;
    }
  }
}

.my-comments-pop {
  width: 294px;
  footer {
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-direction: column;
    color: #2970ff;
    padding-top: 10px;
    margin-top: 8px;
    border-top: 1px solid #e8e8e8;
    div {
      text-align: center;
      .icon.aufontAll {
        font-size: 10px;
        vertical-align: 2px;
        margin-right: 2px;
      }
    }
  }
  ul {
    margin: 0;
    padding: 0;
    overflow: auto;
    width: 100%;
    header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 10px;
      .warn-info {
        font-size: 12px;
        color: #ccc;
      }
      .close-btn {
        cursor: pointer;
      }
    }
    .ul-content {
      max-height: 198px;
      overflow-y: scroll;
      li {
        line-height: 1.5;
        font-size: 14px;
        padding: 6px 0;
        position: relative;
        width: 100%;
        color: rgba(0, 0, 0, 0.85);
        cursor: pointer;
        overflow: hidden;
        .opinion-content {
          width: 220px;
          margin-left: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }
        &:hover {
          background: #f9f9f9;
          color: #2970ff;
        }
        .operation-btn {
          color: rgba(0, 0, 0, 0.65);
          &.edit {
            position: absolute;
            left: 245px;
            top: 5px;
          }
          &.del {
            position: absolute;
            left: 270px;
            top: 5px;
          }
        }
      }
    }
    footer {
      cursor: pointer;
      display: flex;
      align-items: center;
      flex-direction: column;
      color: #2970ff;
      padding-top: 10px;
      margin-top: 8px;
      border-top: 1px solid #e8e8e8;
      div {
        text-align: center;
        .icon.aufontAll {
          font-size: 10px;
          vertical-align: 2px;
          margin-right: 2px;
        }
      }
    }
  }

  .noData {
    width: 284px;
    height: auto;
    text-align: center;
    color: rgba(0, 0, 0, 0.85);
    /deep/img {
      width: 100px;
      height: auto;
    }
  }
}

/deep/.h3-approve-main {
  border-radius: 2px;
}
/deep/.h3-approve-main.focused {
  box-shadow: 0px 0px 0px 2px @shadowColor !important;
  border: 1px solid @borderColor !important;
}
/deep/.h3-approve-main:hover {
  border: 1px solid @borderColor !important;
}

.my-comments-wrapper {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  .font-ele {
    color: @highlightColor;
    &:hover {
      opacity: 0.8;
    }
    line-height: 20px;
    font-size: 12px;
    cursor: pointer;
    .icon {
      font-size: 12px;
      line-height: 20px;
      margin-left: 6px;
    }
  }
}

.question-icon {
  color: rgba(0, 0, 0, 0.65);
  &:hover {
    color: #2970ff;
  }
}

.manageComment {
  margin: 0 20px;
  color: #2970ff;
  &:hover {
    color: #5291ff;
  }
}
.my-comments-popover .ant-popover-arrow {
  margin-left: 48px !important;
}

/deep/ .my-comments-popover .ant-popover-inner-content {
  padding: 12px 16px;
}

.manageComment:hover {
  cursor: pointer;
}

.inlineManage {
  color: rgb(25, 143, 255);
}

.inlineManage:hover {
  cursor: pointer;
}

.modal-wrapper {
  p {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    margin-bottom: 0;
  }
  textarea {
    width: 100%;
    border: 1px solid rgba(217, 217, 217, 1);
    border-radius: 4px;
    padding: 8px;
    line-height: 1.5;
    margin: 6px 0 0;
    &:hover {
      border: 1px solid #40a9ff;
    }
    &:focus {
      outline: 0;
      border: 1px solid #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
  div {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
  }
}

.up-file-content {
  height: 118px;
  border: 1px dashed #d4d5d6;
  border-radius: 2px;
  text-align: center;
  color: #d8d8d8;
  font-size: 14px;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  i {
    font-size: 36px;
    color: rgba(17, 18, 24, 0.25);
  }
  span {
    color: @highlightColor;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  &:hover {
    background: #eef4fd;
    border-color: @borderColor;
    cursor: pointer;
  }
}

.up-file-wrapper {
  position: relative;
  margin-top: 16px;
  .up-file-title {
    position: absolute;
    top: 0;
    left: -109px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    width: 90px;
    i {
      font-size: 14px;
    }
  }
}
.has-form-border .up-file-wrapper .up-file-title {
  left: -90px;
}

.comment-wrapper {
  position: relative;
  p {
    font-size: 14px;
    color: #111218;
    line-height: 22px;
  }
  textarea {
    height: 96px;
    background: #ffffff;
    border-radius: 2px;
    border: 1px solid #d4d5d6;
    resize: none;
  }
  & > div {
    position: absolute;
    right: 12px;
    bottom: 5px;
    line-height: 20px;
    font-size: 12px;
    color: rgba(17, 18, 24, 0.25);
    pointer-events: none;
  }
}
/deep/.h3-approve-main:hover {
  border: 1px solid @borderColor;
}
</style>
<style lang="less">
.my-comments {
  .ant-upload-list-item-info {
    // max-width: 374px;
    overflow: hidden;
  }

  .upload,
  .ant-upload {
    display: block;
  }
}
</style>

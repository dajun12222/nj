<template>
  <div class="input-signsture">
    <div v-if="!readonly" class="input-signsture__title">
      <!-- <span>{{
        $t('cloudpivot.form.renderer.tip.onlySupportMobileWrite')
      }}</span> -->
      <div class="qrcode-input">
        <div
          class="qrcode-wrapper"
          :class="QRCodeShow || (bs64Img && !useLast) ? 'active' : ''"
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
                <span>{{ $t('cloudpivot.form.renderer.scanCodeEquip') }}</span>
                <!-- <span>{{ $t('cloudpivot.form.renderer.scanCodeEquip') }}</span> -->
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
            <span>{{ $t('cloudpivot.form.renderer.useLastSign') }}</span>
          </a-checkbox>
          <!-- <template slot="content">
              <img class="lastAutograph" :src="lastAutographUrl" alt="">
            </template>
          </a-popover> -->
        </div>
      </div>

      <div v-if="bs64Img" class="autograph-img">
        <div class="label">
          <!-- 签名 -->
        </div>
        <div class="autograph-img-wrapper" @click.stop="isPreviewImage = true">
          <img :src="bs64Img" alt="" />
          <span @click.stop="removeAutograph"><i class="icon aufontAll h-icon-all-close-circle"></i></span>
        </div>
      </div>
    </div>
    <div
      v-else
      class="input-signsture__img clearfix"
      @mouseover="mouseListener(1)"
      @mouseleave="mouseListener(0)"
    >
      <div v-if="!bs64Img"></div>
      <div v-else>
        <img :src="bs64Img" @click.stop="isPreviewImage = true" />
      </div>
      <!-- <span v-show="hover" @click.stop="isPreviewImage = true" class="icon aufontAll">&#xe726;</span> -->
    </div>

    <img-preview
      v-if="isPreviewImage"
      :imgList="[{ url: bs64Img }]"
      @close="isPreviewImage = false"
    />
  </div>
</template>
<script lang="ts">
import { SignatureUploadOptions } from '../../../../../form/schema';
import PCImagePreview from '../../../../../form/src/common/components/pc-image-preview.vue';
import { BaseControl } from '../../../../../form/src/common/controls/base-control';
import { UploadControl } from '../../../../../form/src/common/controls/upload-control';
import { RadioControl } from 'cloudpivot-forms';
import { Component, Watch, Inject } from 'vue-property-decorator';
import { externalLinkApi, formApi } from '../../../../../api';
import { Popover, Tooltip, Checkbox } from '@h3/antd-vue';
import moment from 'moment';

@Component({
  name: 'input-signsture',
  components: {
    ImgPreview: PCImagePreview,
    APopover: Popover,
    ATooltip: Tooltip,
    ACheckbox: Checkbox,
  },
})
export default class InputSignsture extends UploadControl<SignatureUploadOptions> {
  bs64Img: string = '';

  QRCodeShow: boolean = false;

  isPreviewImage: boolean = false;

  hover: boolean = false;

  refId: string = '';

  currentRefID: string = ''; // 存储已经上传了签名的refid，以防再次打开签名二维码刷新覆盖

  lastAutographUrl: string = ''; // 上一次使用的签名

  lastAutographRefId: string = '';

  lastAttachment: any = '';

  useLast: boolean = false;

  fileList: any[] = [];

  fileObj: any = '';

  async created() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const theLatestSignature = localStorage.getItem(`${user.name}_latestSign`);
    if (theLatestSignature) {
      this.lastAttachment = JSON.parse(theLatestSignature);
      this.lastAutographRefId = this.lastAttachment.refId;
      this.lastAutographUrl = this.getDownloadUrlByRefId(
        this.lastAutographRefId,
      );
      console.log(this.fileObj, '-----------FILEOBJ');
      console.log(this.lastAttachment, '--------------LASTATTACHMENT');
    }
    if (this.fileObj && this.emitUpdateLatestSignature) {
      this.emitUpdateLatestSignature(this.fileObj, true);
    }
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

  @Inject({
    default: () => () => {},
  })
  emitUpdateLatestSignature!: (data: any, isNew?: boolean) => void;

  setRefId() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.refId = user.username + new Date().getTime();
  }

  useLastToggle() {
    if (this.useLast) {
      this.copyLastAutograph();
    } else {
      this.removeAutograph();
    }
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
    if ((this.ctrl as any).value) {
      // 删除已经使用的签名，使用新的签名
      (this.ctrl as any).value = (this.ctrl as any).value.filter(
        (el) => el.name !== 'signsture.png',
      );
      if (isCopy) {
        (this.ctrl as any).value.push(this.lastAttachment);
        if (this.emitUpdateLatestSignature) {
          this.emitUpdateLatestSignature(null);
        }
      } else {
        const newAttachment = {
          name: 'signsture.png',
          refId: rerId,
          mimeType: 'image/png',
          createdTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        };
        (this.ctrl as any).value.push(newAttachment);
        if (this.emitUpdateLatestSignature) {
          this.emitUpdateLatestSignature(newAttachment);
        }
      }
    } else {
      if (isCopy) {
        (this.ctrl as any).value = [this.lastAttachment];
        if (this.emitUpdateLatestSignature) {
          this.emitUpdateLatestSignature(null);
        }
      } else {
        const newAttachment = {
          name: 'signsture.png',
          refId: rerId,
          mimeType: 'image/png',
          createdTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        };
        (this.ctrl as any).value = [newAttachment];
        if (this.emitUpdateLatestSignature) {
          this.emitUpdateLatestSignature(newAttachment);
        }
      }
    }
  }

  removeAutograph() {
    this.useLast = false;
    (this.ctrl as any).value = (this.ctrl as any).value.filter(
      (el) => el.refId !== this.currentRefID && el !== '',
    );
    this.fileList = this.fileList.filter(
      (el) => el.uid !== this.currentRefID && el !== '',
    );
    this.refId = '';
    this.currentRefID = '';
    this.bs64Img = '';
  }

  mouseListener(type: number) {
    this.hover = Boolean(type);
  }

  setControl() {
    // PC端只能查看，所以不能设置必填
    // (this.ctrl as RadioControl).required = false;

    this.handleValueChange((this.ctrl as any).value);
  }

  handleValueChange(files: any[]): void {
    if (files && files.length > 0) {
      // let fileObj: any = '';
      if (files[0].url) {
        // status状态为done则说明为图片
        this.fileObj = files.find((f: any) => f.status === 'done');
        this.bs64Img = this.fileObj.url;
        return;
      }
      if (files[0].mimeType) {
        this.fileObj = files.find((f: any) => f.mimeType.indexOf('image') > -1);
        this.bs64Img = UploadControl.service.getDownloadUrl(this.fileObj);
      }
    } else {
      this.bs64Img = '';
    }
  }

  getAutographUrl(refId: string) {
    this.bs64Img = this.getDownloadUrlByRefId(refId) || '';
  }

  qrCodeUrl: string = '';

  getQrCodeUrl() {
    this.qrCodeUrl = '';
    const token: string = localStorage.getItem('token') || '';
    const origin = location.origin;
    // let origin = 'http://47.107.160.206';
    const signinUrl = `${origin}/mobile/#/signature?refId=${this.refId}&T=${token}`;
    const params = {
      url: signinUrl,
      type: 9, //type为8表示流程审核扫描签名
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
          this.useLast = false;
          this.getAutographUrl(res.data.refId);
          this.setAutographToList(res.data.refId);
        } else if (this.QRCodeShow) {
          setTimeout(() => {
            this.exist();
          }, 500);
        } else {
          //Else Empty block statement
        }
      });
  }
}
</script>
<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
.input-signsture {
  &__img {
    position: relative;
    div {
      float: left;
      img {
        width: 64px;
        height: 64px;
        border-radius: 2px;
        border: 1px solid rgba(221, 221, 221, 1);
        cursor: url('./images/enlarge-o.png'), pointer;
      }
    }
    .icon {
      position: absolute;
      left: 50px;
      top: 36px;
      cursor: pointer;
      font-size: 14px;
    }
  }

  &__title {
    padding-top: 7px;
    .qrcode-input {
      display: flex;
      .qrcode-wrapper {
        height: 22px;
        line-height: 22px;
        font-weight: 400;
        color: #111218;
        margin-right: 33px;
        span {
          i {
            vertical-align: -1px;
            margin-right: 10px;
          }
          span {
            margin-right: 1px;
          }
        }
        &:hover,
        &.active {
          cursor: pointer;
          color: #2970ff;
        }
        > i {
          vertical-align: -1px;
        }
      }
      .multiplexing .ant-checkbox-wrapper {
        height: 22px;
        line-height: 22px;
        font-weight: 400;
        color: #111218;
      }
    }
    // span {
    //   line-height: 32px;
    // }
    .autograph-img {
      position: relative;
      margin-top: 12px;
      .autograph-img-wrapper {
        width: 162px;
        height: 120px;
        background-color: #fff;
        border: 1px solid #d8d8d8;
        position: relative;
        text-align: center;
        padding: 3px 2px;
        &:hover {
          cursor: pointer;
        }
        img {
          max-width: 100%;
          max-height: 100%;
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
            color: rgba(17, 18, 24);
            opacity: 0.25;
            font-size: 14px;
            background-color: transparent;
          }
          &:hover i {
            opacity: 0.5;
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
  }
}
</style>
<style lang="less">
@import './../../../../../application/src/components/pc/style/custom-themes';
.qrcode-wrapper-in .ant-popover-inner-content {
  padding: 0;
  margin: 0;
  .qrcode {
    padding: 6px;
    display: flex;
    flex-direction: column;
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
.input-signsture .qrcode {
  width: 212px;
  padding: 15px 15px;
  background-color: #fff;
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
</style>

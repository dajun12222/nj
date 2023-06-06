<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-12-11 14:55:04
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-04 15:50:50
-->
<template>
  <div class="my-comments">
    <div class="qrcode-wrapper">
      <a-popover
        v-model="QRCodeShow"
        overlayClassName="qrcode-wrapper-in"
        placement="bottomLeft"
        trigger="click"
      >
        <i class="icon aufontAll h-icon-all-qrcode-o"></i>
        手写签名
        <template slot="content">
          <div class="qrcode">
            <img v-show="qrCodeUrl" :src="qrCodeUrl" alt="" />
            <span>支持钉钉，微信，企业微信</span>
          </div>
        </template>
      </a-popover>
    </div>
    <!-- v-if="lastAutographUrl" -->

    <div class="multiplexing" @click="copyLastAutograph">
      <a-popover overlayClassName="qrcode-wrapper-in" placement="bottomLeft">
        <a-checkbox @change="onChange"> 使用上一次签名 </a-checkbox>
        <template slot="content">
          <img class="lastAutograph" :src="lastAutographUrl" alt="" />
        </template>
      </a-popover>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Checkbox, Popover } from '@h3/antd-vue';
import { externalLinkApi, formApi } from '../../../../../../../api';
import getDownloadUrlNew from '../../../../../../../common/src/utils/getDownloadUrlNew';

@Component({
  name: 'batchOperationComment',
  components: {
    ACheckbox: Checkbox,
    APopover: Popover,
  },
})
export default class batchOperationComment extends Vue {
  QRCodeShow: boolean = false;

  qrCodeUrl: string = '';

  currentRefID: string = ''; // 存储已经上传了签名的refid，以防再次打开签名二维码刷新覆盖

  refId: string = '';

  autographUrl: string = ''; // 签名地址

  lastAutographUrl: string = ''; // 上一次使用的签名

  lastAutographRefId: string = '';

  lastAttachment: any = '';

  @Watch('QRCodeShow')
  onQRCodeShowChange(value) {
    if (value) {
      this.setRefId();
      this.getQrCodeUrl();
    }
  }

  get val() {
    return (this as any).ctrl.value || {};
  }

  getQrCodeUrl() {
    this.qrCodeUrl = '';
    const token: string = localStorage.getItem('token') || '';
    const origin = location.origin;
    const signinUrl = `${origin}/mobile/#/signature?refId=${this.refId}&T=${token}`;
    // window.open(signinUrl)

    const params = {
      url: signinUrl,
      type: 8, //type为5表示扫码登陆
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
        this.$message.warning('获取登录地址断码失败');
      }
    });
  }

  setRefId() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.refId = user.username + new Date().getTime();
  }

  onChange(e) {
    if (e.target.checked) {
      this.copyLastAutograph();
    }
  }

  exist() {
    // 检测签名是否存在
    formApi
      .exist({
        refId: this.refId,
      })
      .then((res) => {
        if (res.errcode === 0 && res.data) {
          this.QRCodeShow = false;
          this.currentRefID = this.refId;
          this.getAutographUrl(this.refId);
          this.setAutographToList(this.refId);
        } else if (this.QRCodeShow) {
          setTimeout(() => {
            this.exist();
          }, 500);
        } else {
          //Else Empty block statement
        }
      });
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
    (this as any).ctrl.value = Object.assign(this.val, {});
  }

  copyLastAutograph() {
    // 复制上一次签名
    if (!this.lastAutographRefId) {
      return;
    }
    this.getAutographUrl(this.lastAutographRefId);
    this.setAutographToList(this.lastAutographRefId, true);
  }

  getAutographUrl(refId: string) {
    this.autographUrl = this.getDownloadUrlByRefId(refId) || '';
  }

  getDownloadUrlByRefId(refId: string): string {
    if (!refId) {
      return '';
    }
    // @ts-ignore
    const url =
      location.origin +
      `/api/api/aliyun/download?refId=${getDownloadUrlNew.getRefId(refId)}`;

    const token =
      (window as any).externalLinkToken || localStorage.getItem('token');
    if (!token) {
      return url;
    }
    return url + `&T=${token}`;
  }
}
</script>
<style lang="less" scoped>
.my-comments {
  display: flex;
  align-items: center;
  margin: 21px 0 150px;
  .qrcode-wrapper {
    font-size: 14px;
    color: #111218;
    margin-right: 32px;
    i {
      font-size: 12px;
      color: #111218;
    }
  }
  .multiplexing {
    /deep/ .ant-checkbox-wrapper {
      span {
        padding-left: 0;
        font-size: 14px;
        color: #111218;
      }
    }
  }
}

.qrcode-wrapper-in {
  .qrcode {
    width: 212px;
    height: 252px;
    background: #ffffff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    > img {
      width: 168px;
      height: 168px;
    }
    > span {
      color: #111218;
      font-size: 14px;
      font-weight: 400;
      margin-top: 16px;
      padding: 0;
    }
  }
}
</style>

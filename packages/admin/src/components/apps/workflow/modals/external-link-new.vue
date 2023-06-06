<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="external-link-wrap">
    <div class="tips">
      <em class="icon aufontAll h-icon-all-question-circle"></em>
      将流程发布为公开链接，无需登录即可发起流程
    </div>

    <p>链接地址生成</p>
    <div class="item">
      <div class="item-left">
        <a ref="link" target="_blank" :href="pcUrl">
          <span class="left-span">{{ pcUrl }}</span>
          <span class="right-span">{{ pcUrl.slice(-4) }}</span>
        </a>
      </div>
      <div class="item-right">
        <em class="icon aufontAll h-icon-all-file-copy" @click="copy"></em>
      </div>
    </div>

    <!-- 二维码 -->
    <p>二维码</p>
    <div class="item">
      <a-popover placement="right" overlayClassName="large-img">
        <template slot="content">
          <div class="img-wrap__large">
            <img :src="qrCode" />
          </div>
        </template>

        <div class="img-wrap">
          <img :src="qrCode" />
        </div>
      </a-popover>
    </div>
  </div>
</template>
<script lang="ts">
import * as formApi from '@/apis/form';
import env from '@/env.ts';
import { Modal, Button, Switch, Row, Col, Popover } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'external-link',
  components: {
    AModal: Modal,
    AButton: Button,
    ASwitch: Switch,
    ARow: Row,
    ACol: Col,
    APopover: Popover,
  },
})
export default class ExternalLink extends Vue {
  @Prop({
    type: Object,
    default: () => ({}),
  })
  data!: any;

  // 显示控制
  visible: boolean = false;

  showIcon: boolean = false;

  showLargeImg: boolean = false;

  pcUrl: string = '';

  qrCode: string = '';

  mobileUrl: string = '';

  shortCode = '';

  copy() {
    const oInput: any = document.createElement('input');
    oInput.value = this.pcUrl;
    document.body.appendChild(oInput);
    oInput.select(); // 选择对象
    document.execCommand('Copy'); // 执行浏览器复制命令
    oInput.className = 'oInput';
    oInput.style.display = 'none';
    oInput.remove();
    this.$message.success('已复制至系统剪切板');
  }

  getShortCode() {
    const { schemaCode, workflowCode, shortCode } = this.data;

    if (shortCode && shortCode !== 'null') {
      this.shortCode = shortCode;
      this.createQrCode();
      return;
    }

    const vm: any = this;
    formApi.getShortCode_v2({ schemaCode, workflowCode }).then((res: any) => {
      vm.shortCode = res.data;
      this.createQrCode();
    });
  }

  createQrCode() {
    this.pcUrl = `${window.location.protocol}//${window.location.host}/el.html?f=${this.shortCode}`;

    this.mobileUrl = this.pcUrl;
    this.qrCode =
      `${env.apiHost}/api/qrcode/generate_qrcode?text=` + this.mobileUrl;
  }

  @Watch('shortCode')
  onShortCodeChange(val) {
    if (val) {
      this.backData();
    }
  }

  backData() {
    const backData = {
      externalLinkEnable: true,
      shortCode: this.shortCode,
    };
    this.$emit('backData', backData);
  }

  created() {
    this.getShortCode();
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.external-link-wrap {
  width: 100%;
  .tips {
    width: 100%;
    color: @nav-font-color;
    font-size: 12px;
    padding: 5px 0;
    line-height: 20px;
    display: flex;
    text-align: justify;
    em {
      font-size: 12px;
      color: @s-light-font-color;
      margin-right: 5px;
      line-height: 20px;
    }
  }
  p {
    margin-top: 12px;
    color: @light-font-color;
    font-size: 12px;
    line-height: 20px;
    margin-bottom: 4px;
  }

  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .item-right {
      min-width: 20px;
      text-align: right;
      em {
        font-size: 16px;
        color: @light-font-color;
        cursor: pointer;
        &:hover {
          color: @primary-color;
          opacity: 0.8;
        }
      }
    }
    .item-left {
      flex: 1;
      white-space: pre-wrap;
      line-height: 22px;
      font-size: 13px;
      color: @primary-color;
      a {
        color: @primary-color;
        &:hover {
          opacity: 0.8;
        }
      }
    }

    .img-wrap {
      width: 80px;
      height: 80px;
      border-radius: 2px;
      border: 1px solid @s-light-font-color;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
.img-wrap__large {
  img {
    width: 160px;
    height: 160px;
  }
}
.large-img {
  /deep/.ant-popover-inner-content {
    padding: 0px;
  }
}
</style>
<style lang="less">
.large-img {
  .ant-popover-inner-content {
    padding: 0px;
  }
}
</style>

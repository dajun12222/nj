<template>
  <div>
    <div v-show="modalShow" class="shadow" :style="{ 'z-index': zIndex }"></div>
    <div
      v-show="modalShow"
      :style="{ width: width, height: height, 'z-index': zIndex + 1, top: top }"
      :class="{ 'show-footer': showFooter }"
      class="pop"
    >
      <div class="title" :style="titleStyle">
        <span>
          <slot name="title"></slot>
        </span>
        <span
          class="close icon aufontAll h-icon-all-close"
          @click="modalShow = false"
        ></span>
      </div>

      <div
        class="content"
        :style="{ overflow: overHidden, height: contentHeight }"
      >
        <slot name="content"></slot>
      </div>

      <div v-show="showFooter" slot="footer" class="pop-footer">
        <slot name="footer">
          <a-button @click="modalShow = false">
            {{ cancelText ? cancelText : '取消' }}
          </a-button>
          <a-button type="primary" class="determine" @click="determine">
            {{ okText ? okText : '确定' }}
          </a-button>
        </slot>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Button } from '@h3/antd-vue';
@Component({
  name: 'customPop',
  components: {
    AButton: Button,
  },
})
export default class customPop extends Vue {
  @Prop({ default: false }) value!: boolean; // 是否显示

  @Prop() width?: string;

  @Prop() height?: string;

  @Prop() zIndex?: number;

  @Prop() overHidden?: string;

  @Prop() okText?: string;

  @Prop() cancelText?: string;

  @Prop() top?: string;

  @Prop({
    default: () => {
      return {};
    },
  })
  titleStyle: any;

  @Prop({ default: true }) showFooter!: boolean; // 是否显示

  get contentHeight() {
    if (this.height) {
      return parseInt(this.height) - 130 + 'px';
    }
    return 'auto';
  }

  modalShow: boolean = false;

  @Watch('value')
  onVisibleChange(value: boolean) {
    this.modalShow = value;
  }

  @Watch('modalShow')
  onModalShowChange(val: boolean) {
    this.$emit('input', val);
  }

  // 确定
  determine() {
    this.$emit('OK');
    // this.modalShow = false
  }

  created() {
    this.modalShow = this.value;
  }
}
</script>

<style lang="less" scoped>
@import '../../../../common/common.less';
.shadow {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 98;
}
.pop {
  position: fixed;
  z-index: 1000;
  top: 8%;
  left: 0;
  right: 0;
  margin: 0 auto;
  background-color: #fff;
  width: 528px;
  height: 496px;
  background: #ffffff;
  box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.15);
  border-radius: 4px;
  &.show-footer {
    padding-bottom: 80px;
  }
  .title {
    display: flex;
    justify-content: space-between;
    padding: 24px;
    height: 72px;
    align-items: center;
    //   padding-left: 24px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    > span:not([class]) {
      height: 24px;
      font-size: 16px;
      font-weight: 600;
      color: #111218;
      line-height: 24px;
    }
    .close {
      display: inline-block;
      text-align: center;
      cursor: pointer;
      color: rgba(0, 0, 0, 0.45);
      font-size: 18px;
      width: 60px;
      height: 72px;
      line-height: 72px;
      position: absolute;
      right: 0;
      top: 0;
    }
  }
  .pop-footer {
    display: flex;
    justify-content: flex-end;
    height: 80px;
    padding: 24px;
    align-items: center;
    // padding: 0 24px;
    .determine {
      margin-left: 8px;
    }
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    .ant-btn {
      height: 32px;
      padding: 0;
      > span {
        height: 22px;
        font-size: 14px;
        color: #111218;
        line-height: 22px;
      }
      // &:hover{
      //   border-color: #5291FF;
      //   >span{
      //     color: #5291FF
      //   }
      // }
      // &:active{
      //   border-color: #2970FF;
      //   >span{
      //     color: #2970FF
      //   }
      // }
      // &.ant-btn-primary{
      //   >span{
      //     color: rgba(255, 255, 255, 0.9);
      //   }
      //   &:hover{
      //     background: #5291FF;
      //     border-color: #5291FF;
      //     >span{
      //       color: rgba(255, 255, 255, 0.9);
      //     }
      //   }
      //   &:active{
      //     background: #1852D9;
      //     border-color: #1852D9;
      //     >span{
      //       color: rgba(255, 255, 255, 0.9);
      //     }
      //   }
      // }
    }
  }
  .content {
    padding: 0 24px;
    max-height: 500px;
    overflow: auto;
  }
  .label {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    margin-top: 24px;
    width: 100%;
    white-space: nowrap;
    span {
      display: inline-block;
      width: 3px;
      height: 12px;
      background: @primary-color;
      margin-right: 10px;
    }
    /deep/.radio-group {
      padding-bottom: 0;
      margin-left: 12px;
    }
  }
}
</style>

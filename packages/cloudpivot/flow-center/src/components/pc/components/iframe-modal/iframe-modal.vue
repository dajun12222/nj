<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-23 10:53:18
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-18 17:06:32
-->
<template>
  <div>
    <div v-if="showIframeForm" class="iframe-shadow"></div>
    <transition name="fade-down">
      <div v-if="showIframeForm" class="iframe-form-warp">
        <div class="icon-close" @click="close">
          <!-- <span><a-icon type="close" /></span> -->
          <span class="icon aufontAll">&#xe996;</span>
        </div>
        <iframe
          ref="iframe"
          class="iframe-form-warp--page"
          :src="IframeFormUrl"
        ></iframe>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component({ name: 'iframe-modal', components: {} })
export default class IframeModal extends Vue {
  @Prop({ default: '' })
  IframeFormUrl?: string;

  @Prop({ default: false })
  showIframeForm?: boolean;

  close() {
    let user: any = sessionStorage.getItem('user');
    if (user) {
      user = JSON.parse(user);
    }
    localStorage.removeItem(`${user.name}_latestSign`);
    this.$emit('close', false);
  }
}
</script>
<style lang="less" scoped>
@import './../../../../../../application/src/components/pc/style/custom-themes';
.iframe-form-warp {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  // left: 50%;
  // transform: translateX(-50%);
  margin: auto;
  min-width: 1024px;
  max-width: 1228px;
  background: #fff;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  &--page {
    width: 100%;
    height: 100%;
    overflow: auto;
    border: none;
  }
}

.iframe-shadow {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 999;
}

.fade-down-enter-active {
  transition: all 0.3s ease;
}
.fade-down-leave-active {
  transition: all 0s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-down-enter, .fade-down-leave-to
/* .slide-fade-leave-active 用于 2.1.8 以下版本 */ {
  transform: translateY(-30px);
  opacity: 0;
}

.icon-close {
  position: absolute;
  right: 24px;
  cursor: pointer;
  top: 14px;
  font-size: 20px;
  color: rgba(17, 18, 24, 0.5);
  vertical-align: baseline;
  &:hover {
    color: @highlightColor;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="custom-modal">
    <div v-show="show" class="mask"></div>
    <div class="animation" :class="show ? 'show' : 'no-show'">
      <div class="custom-modal-header">
        <span class="title">
          {{ title }}
        </span>
        <span class="close-x" @click="close"> </span>
      </div>
      <div v-if="show" class="custom-modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'BigDialog',
  components: {},
})
export default class BigDialog extends Vue {
  @Prop() show!: boolean;

  @Prop() title!: string;

  isMounted: boolean = false;

  close() {
    this.$emit('cancel');
  }
}
</script>

<style lang="less" scoped>
.custom-modal {
  position: fixed;
  height: calc(100vh - 47px);
  width: 100vw;
  left: 0px;
  z-index: 1000;
  top: 100vh;
  .mask {
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    background: rgba(17, 18, 24, 0.4);
  }
  .animation {
    height: calc(100vh - 47px);
    width: 100%;
    position: fixed;
    background: #fff;
    &.show {
      top: 47px;
      transition: 0.2s;
    }

    &.no-show {
      top: 100vh;
      transition: 0.2s;
    }
  }
  &-header {
    box-shadow: 0px 4px 11px 0px rgba(35, 110, 235, 0.05),
      0px 1px 0px 0px #eeeeee;
    height: 56px;
    padding: 16px 24px;
    position: relative;
    z-index: 2;
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #111218;
      line-height: 24px;
    }
    .close-x {
      font-family: 'aufontAll' !important;
      color: rgba(17, 18, 24, 0.5);
      position: absolute;
      right: 18px;
      top: 16px;
      font-size: 16px;
      cursor: pointer;
      &::after {
        content: '\e996';
      }
      &:hover {
        color: #2970ff;
      }
    }
  }
}
.custom-modal-body {
  height: calc(100% - 56px);
}
</style>

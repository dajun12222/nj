<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div v-if="value" class="custom-loading" :class="position">
    <span class="loading-icon"></span>
    <span class="tip"> {{ tip }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
  name: 'customLoading',
  components: {},
})
export default class customLoading extends Vue {
  @Prop({
    default: false,
  })
  value!: boolean;

  @Prop({
    default: '加载中...',
  })
  tip!: string;

  @Prop({
    default: 'top',
  })
  position?: string;
}
</script>

<style lang="less" scoped>
.custom-loading {
  position: fixed;
  z-index: 999;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  height: 40px;
  line-height: 40px;
  white-space: nowrap;
  background: #ffffff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding-right: 14px;
  font-size: 14px;
  color: #111218;
  padding-left: 36px;

  &.center {
    top: 50%;
    transform: translate(-50%, -50%);
    box-shadow: unset;
    background: transparent;
    color: rgba(17, 18, 24, 0.25);
  }

  .loading-icon {
    position: absolute;
    width: 13px;
    height: 13px;
    border-radius: 7px;
    border: 1px solid #2970ff;
    border-left: none;
    border-top: none;
    left: 14px;
    top: 50%;
    margin-top: -6.5px;
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

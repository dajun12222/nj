<template>
  <!-- 该loading页面是加载中，加载完会消失，决定定位在父元素里面,会遮住父元素中的所有元素 -->
  <div v-if="delayValue" ref="pageLoading" class="page-loading">
    <div
      v-show="shade"
      class="page-loading__shade"
      :style="`background-color: ${shadeColor};opacity: ${shadeOpacity};`"
    ></div>
    <div class="page-loading__content">
      <i class="icon aufontAll h-icon-all-loading-o"></i>
      <span>{{
        loadingText || $t('cloudpivot.cloudpivotCommon.pc.loading')
      }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'page-loading',
})
export default class PageLoading extends Vue {
  @Prop({ default: false }) value!: Boolean;

  @Prop({ default: true }) shade!: Boolean;

  @Prop({ default: '' }) loadingText?: string;

  @Prop({ default: '#FFFFFF' }) shadeColor!: String;

  @Prop({ default: 0.85 }) shadeOpacity!: Number;

  @Prop({ default: 0 }) delay?: number; //是否延迟展示

  delayValue: Boolean = false;

  mounted() {
    this.loadingToggle();
  }

  @Watch('value', { immediate: true })
  watchLoading() {
    setTimeout(() => {
      this.delayValue = this.value;
    }, this.delay);
    this.loadingToggle();
  }

  loadingToggle() {
    const pageLoading = this.$refs.pageLoading as HTMLElement;
    if (pageLoading && pageLoading.parentElement) {
      pageLoading.parentElement.classList.toggle(
        'page-loading-wrap',
        this.value as any,
      );
    }
  }
}
</script>

<style lang="less">
@import './../../../../../common/common';
@import '~cloudpivot/application/src/components/pc/style/custom-themes';

@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.page-loading {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 96;
  &-wrap {
    position: relative !important;
    overflow: hidden !important;
  }
  &__shade {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 0;
  }
  &__content {
    text-align: center;
    z-index: 1;
    //原本的动画
    /*       i{
        display: inline-block;
        width: 26px;
        height: 26px;
        background: url("./images/loading.png");
        animation: pageLoading linear 1.5s infinite;
      } */
    //统一之后的动画
    .icon {
      font-size: 12px;
      width: 20px;
      height: 17px;
      line-height: 17px;
      display: inline-block;
      animation: loading linear 0.8s infinite;
      color: @highlightColor;
      margin-right: 10px;
      position: relative;
      // top: 2px;
    }
    span {
      color: @light-color-3;
    }
  }

  @keyframes pageLoading {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>

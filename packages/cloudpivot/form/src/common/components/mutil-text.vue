<template>
  <div
    class="mutil-text"
    :style="{ 'text-align': align }"
    :class="{ collapsed: collapsed, vertical: layoutType }"
  >
    <div :style="labelStyle">
      {{ text }}
    </div>
    <span v-show="showAll" class="mutil-text-span" @click="toggle($event)">
      <template v-if="collapsed">
        <span>{{ $t('cloudpivot.form.renderer.expand') }}</span>
      </template>
      <template v-else>
        <span>{{ $t('cloudpivot.form.renderer.collapse') }}</span>
      </template>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'mutil-text',
})
export default class MutilText extends Vue {
  showAll = false;

  collapsed = true;

  @Prop({
    default: '',
  })
  text!: string;

  @Prop({
    default: 'left',
  })
  align!: string;

  @Prop({
    default: '',
  })
  labelStyle!: string;

  taskRef: any;

  @Inject({
    default: () => () => {},
  })
  layoutTypeFn?: () => void;

  get layoutType() {
    if (this.layoutTypeFn) {
      return this.layoutTypeFn();
    }
  }

  scroll() {
    const el = this.$el as HTMLDivElement;
    this.showAll = el.scrollHeight > el.offsetHeight + 3;
    // console.log('mutil-text',el.scrollHeight,el.offsetHeight);
    if (el.offsetHeight === 0) {
      clearTimeout(this.taskRef);
      this.taskRef = setTimeout(() => {
        this.scroll();
      }, 500);
    }
  }

  toggle(target: any) {
    this.collapsed = !this.collapsed;
    const elSpan: any = target.currentTarget;
    //展开时让'收起'另起一行
    if (!this.collapsed) {
      elSpan.parentNode.style.height =
        elSpan.parentNode.scrollHeight + 20 + 'px';
    }
  }

  mounted() {
    this.$nextTick(() => {
      this.scroll();
    });
  }

  destroyed() {
    clearTimeout(this.taskRef);
  }
}
</script>

<style lang="less" scoped>
@import './../../../../common/common';
.vertical:not('.collapsed') {
  padding-left: 20px !important;
}
.mutil-text {
  position: relative;
  line-height: 1.5;

  &.collapsed {
    max-height: 4.5em;
    overflow: hidden;
  }

  & > span {
    right: 0;
    bottom: 2px;
    cursor: pointer;
    position: absolute;
    background-color: #fff;

    & > span {
      color: @primary-color;
    }
  }

  & > div {
    white-space: pre-line;
    word-break: break-all;
  }
}
</style>

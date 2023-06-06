<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="divider" :style="style" :class="{ vertical: vertical }"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
  name: 'divider',
  components: {},
})
export default class Divider extends Vue {
  @Prop({
    default: 0,
  })
  x!: number;

  @Prop({
    default: 0,
  })
  y!: number;

  @Prop({
    default: 0,
  })
  size!: number;

  @Prop({
    default: false,
  })
  vertical!: boolean;

  get style() {
    const style: any = {
      left: this.x + 'px',
      top: this.y + 'px',
    };

    const size = this.size + 'px';

    if (this.vertical) {
      style.height = size;
    } else {
      style.width = size;
    }

    return style;
  }
}
</script>

<style lang="less" scoped>
.divider {
  position: absolute;
  height: 1px;
  background-color: #f5222d;

  &.vertical {
    width: 1px;
  }
}
</style>

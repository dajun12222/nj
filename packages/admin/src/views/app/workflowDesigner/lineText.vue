<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div
    class="line-text"
    :style="`left: ${line.textPosition.x}px;top: ${line.textPosition.y}px;`"
    filter="url(#solid)"
    draggable="true"
    @dragstart="onDragstart"
    @click="onTextClick"
  >
    {{ lineText }}
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Line from '@/common/workflow/Line';
import { moveText } from '@/common/workflow/controllers/line';

@Component({
  name: 'LineText',
})
export default class LineText extends Vue {
  @Prop() line!: Line;

  @Prop() dom!: any;

  get lineText() {
    if (!this.$i18n.locale) {
      return '';
    }
    return !(this.$i18n.locale && this.$i18n.locale === 'en')
      ? this.line.text
      : (this.line.name_i18n as any)[this.$i18n.locale];
  }

  onDragstart(evt: DragEvent) {
    if (!evt.dataTransfer) {
      return;
    }
    evt.dataTransfer.effectAllowed = 'none';
    const img = new Image();
    img.src =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiYAAAAAkAAxkR2eQAAAAASUVORK5CYII=';
    evt.dataTransfer.setDragImage(img, 0, 0);
    evt.preventDefault();
    /* jianting */
    this.dom.addEventListener('mousemove', this.onDragover);
    document.addEventListener('mouseup', this.onDragend);
  }

  onDragover(evt: DragEvent) {
    moveText(evt, this.line);
    evt.preventDefault();
  }

  onDragend() {
    this.dom.removeEventListener('mousemove', this.onDragover);
    document.removeEventListener('mouseup', this.onDragend);
    // console.log('move end');
  }

  // 点击连接线文字
  // 20191216 测试需求
  onTextClick() {
    this.$emit('click');
  }
}
</script>
<style lang="less" scoped>
.line-text {
  position: absolute;
  z-index: 998;
  font-size: 14px;
  line-height: 1;
  transform: translate(-50%, -50%);
  padding: 0 3px;
  background-color: #fff;
}
</style>

<template>
  <div class="text-marking-info" :class="collspaned ? 'fade' : ''">
    <span :id="elementId">{{ item }}</span>
    <span
      v-if="isShowColspan"
      class="collspan"
      :class="collspaned ? '' : 'static'"
      @click="collspaned = !collspaned"
      >{{
        collspaned
          ? $t('cloudpivot.formComment.pc.expand')
          : $t('cloudpivot.formComment.pc.collapse')
      }}</span>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'text-marking-info',
  components: {},
})
export default class TextMarkingInfo extends Vue {
  @Prop({ default: '' })
  item!: string;

  @Prop({ default: Date().toString() })
  elementId!: string;

  collspaned: boolean = true;

  isShowColspan: boolean = false;

  mounted() {
    this.getExpented();
  }

  getExpented() {
    const element = document.getElementById(this.elementId);
    const elementHeight = (element && element.offsetHeight) || 0;
    if (Math.ceil(elementHeight) > 82) {
      this.collspaned = true;
      this.isShowColspan = true;
    } else {
      this.collspaned = false;
      this.isShowColspan = false;
    }
  }
}
</script>
<style lang="less" scoped>
.text-marking-info {
  min-height: 20px;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #111218;
  line-height: 20px;
  word-wrap: break-word;
  text-align: justify;
  word-break: break-all;
  position: relative;
  &.fade {
    max-height: 82px;
    overflow: hidden;
  }
  > .collspan {
    font-size: 12px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    line-height: 17px;
    text-align: right;
    position: absolute;
    bottom: 2px;
    right: 0;
    width: 25%;
    background: linear-gradient(to right, rgba(255, 255, 255, 0), white 45%);
    user-select: none;
    cursor: pointer;
    white-space: nowrap;
    &.static {
      position: relative;
      bottom: unset;
      left: 2px;
    }
    &:hover {
      color: #2970ff;
    }
  }
}
</style>

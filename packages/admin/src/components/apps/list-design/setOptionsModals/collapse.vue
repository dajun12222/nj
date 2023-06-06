<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="collapse">
    <div class="collapse-header" @click="toggle">
      <a-icon v-if="show" type="caret-down" class="icon" />
      <a-icon v-else type="caret-right" class="icon" />
      <slot name="title">
        <span style="margin-left: 5px; font-weight: 700; flex: 1">{{
          title
        }}</span>
        <span class="undo" @click="undo">取消选择</span>
      </slot>
    </div>
    <div v-show="show" class="slot">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Icon } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'collapse',
  components: {
    AIcon: Icon,
  },
})
export default class collapse extends Vue {
  @Prop({ default: '' }) title?: string;

  show: boolean = true;

  toggle() {
    this.show = !this.show;
  }

  undo() {
    this.$emit('undo');
  }
}
</script>
<style lang="less" scoped>
.collapse-header {
  color: #262626;
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  .icon {
    color: #adadad;
  }
}
.slot {
  padding-left: 12px;
  padding-right: 24px;
}

.undo {
  color: @primary-color;
  padding-right: 24px;
}
</style>

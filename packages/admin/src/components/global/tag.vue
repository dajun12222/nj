<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="tag-wrapper">
    <span>{{ text }}</span>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'tag',
  components: {},
})
export default class Tag extends Vue {
  @Prop()
  text!: string;
}
</script>
<style lang="less" scoped>
.tag-wrapper {
  background: rgba(17, 18, 24, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(17, 18, 24, 0.1);
  font-size: 12px;
  display: inline-block;
  font-weight: 400;
  color: #111218;
  line-height: 18px;
  padding: 0 7px;
  margin-left: 8px;
  height: 20px;
  min-width: 40px;
  position: relative;
  // display: flex;
  // align-items: center;
  // justify-content: center;
  span {
    white-space: nowrap;
  }
}
</style>

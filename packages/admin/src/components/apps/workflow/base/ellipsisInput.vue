<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <p class="toggle-bar" @click="$emit('click')">
    <span :title="value">{{ value }}</span>
    <i class="icon aufontAll h-icon-all-ellipsis-o"></i>
  </p>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'EllipsisInput',
})
export default class EllipsisInput extends Vue {
  @Prop() value!: any;
}
</script>
<style lang="less" scoped>
.toggle-bar {
  display: flex;
  padding: 0 8px;
  margin: 0;
  width: 100%;
  cursor: pointer;
  span {
    flex: 1;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  i {
    flex: none;
    color: #bfbfbf;
    font-size: 14px;
  }
}
</style>

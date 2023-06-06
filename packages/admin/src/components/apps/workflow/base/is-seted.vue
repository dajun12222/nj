<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="is-seted" :class="{ 'input-style': showStyleType === 'input' }">
    <div :class="{ 'show-ellipsis': showEllipsis }" @click="$emit('click')">
      <span
        v-if="showStyleType === 'input'"
        :title="value"
        :class="{ empty: !value }"
        >{{ value || '请选择' }}</span>
      <span v-else :class="{ empty: !value && showStyleType === 'input' }">{{
        value
      }}</span>
      <em v-if="showEllipsis" class="icon aufontAll h-icon-all-ellipsis-o"></em>
    </div>
    <em
      v-if="showDel"
      class="icon aufontAll h-icon-all-delete-o1"
      @click="$emit('delete')"
    ></em>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'IsSeted',
})
export default class IsSeted extends Vue {
  @Prop() value!: any;

  @Prop({
    default: true,
  })
  showDel?: boolean;

  @Prop({
    default: false,
  })
  showEllipsis?: boolean;

  @Prop({
    default: '',
  })
  showStyleType?: string;
}
</script>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.is-seted {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 30px;
  line-height: 30px;
  div {
    padding: 0 8px;
    cursor: pointer;
    background: #f1f2f6;
    flex: 1;
    font-size: 13px;
    border-radius: 2px;
    span {
      display: inline-block;
      max-width: 100%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    &.show-ellipsis {
      display: flex;
      justify-content: space-between;
      width: 100%;
      span {
        flex: 1;
      }
    }
  }
  em {
    margin-left: 8px;
    font-size: 16px;
    color: @light-font-color;
    cursor: pointer;
    flex: 0;
  }
}
.input-style {
  border: 1px solid #d4d5d6;
  border-radius: 2px;
  div {
    background: transparent;
    .empty {
      color: @s-light-font-color;
    }
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-03-31 14:36:58
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 16:13:06
 * @FilePath: \yunshu6.0\packages\portal\src\views\workflow-center\workbenchInfo\workbenchComponents\pageHeader.vue
 * @Description:
-->
<template>
  <div class="page-header">
    <div class="name">
      <slot></slot>
    </div>

    <div class="right">
      <slot name="right">
        <div v-if="totalPage" class="btns">
          <span
            :class="{ disabled: currentPage === 0 }"
            class="icon aufontAll h-icon-all-left-o"
            @click="pageChange('prev')"
          ></span>
          <span
            :class="{ disabled: currentPage === totalPage - 1 }"
            class="icon aufontAll h-icon-all-right-o"
            @click="pageChange('next')"
          ></span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'pageHeader',
  components: {},
})
export default class pageHeader extends Vue {
  @Prop() totalPage?: number;

  @Prop() currentPage?: number;

  pageChange(type: 'prev' | 'next') {
    this.$emit('pageChange', type);
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .name {
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
  }

  .btns {
    display: flex;
    span {
      cursor: pointer;
      display: inline-block;
      width: 18px;
      height: 18px;
      line-height: 16px;
      background: #fff;
      border: 1px solid #eeeeee;
      border-radius: 2px;
      // color: rgba(17, 18, 24, 0.25);
      font-size: 6px;
      text-align: center;
      margin-left: 6px;
      color: @highlightColor;
      &.disabled {
        background-color: #f1f2f6;
        border: 1px solid #f1f2f6;
        color: rgba(17, 18, 24, 0.25);
        cursor: no-drop;
      }
    }
  }
}
</style>

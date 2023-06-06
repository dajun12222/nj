<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<script lang="ts" src="./sheet.ts"></script>

<template>
  <table border="0" cellspacing="0" cellpadding="0">
    <thead
      :style="`
      background-color:${item.backgroundColor};
      `"
    >
      <tr :style="`height:${item.headHeight}px`" @mousedown="onMousedown">
        <td
          v-for="(col, index) in item.columns"
          :key="index"
          :style="getColStyle(col)"
          @click="onSelectCol(index, false)"
        >
          <h3-size-rectangle
            :active="index === selectedCol && !selectedIsBody"
            :class="[col.horizontalAlign, col.verticalAlign]"
            :style="getRectStyle(col)"
            @resize="(e) => onColResize(col, e, index)"
          >
            {{ col.name }}
          </h3-size-rectangle>
        </td>
      </tr>
    </thead>
    <tbody :style="`background-color:${item.backgroundColor};`">
      <tr @mousedown="onMousedown">
        <td
          v-for="(col, index) in item.columns"
          :key="index"
          :style="getColStyle(col.rowSettings)"
          @click="onSelectCol(index, true)"
        >
          <h3-size-rectangle
            :active="index === selectedCol && selectedIsBody"
            :class="[
              col.rowSettings.horizontalAlign,
              col.rowSettings.verticalAlign,
            ]"
            :style="getRectStyle(col.rowSettings, item.bodyHeight)"
            @resize="(e) => onBodyResize(col, e, index)"
          >
            {{ getRowText(col) }}
          </h3-size-rectangle>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td :colspan="item.columns.length">打印所有列内容</td>
      </tr>
    </tfoot>
  </table>
</template>

<style lang="less" scoped>
table {
  // width: 100%;
  // height: 100%;
  padding: 0;
  border-collapse: collapse;
  border-spacing: 0;

  td {
    border: 1px solid @border-color;
    position: relative;

    /deep/.h3-size-rectangle {
      word-break: break-all;
      position: absolute;
      top: 0 !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 100%;
      width: 100%;

      &.active {
        border: 1px dashed #ffcb0e;
      }
    }
  }

  tfoot td {
    text-align: center;
    color: @light-color-4;
    cursor: move;
    height: 30px;
    font-size: @font-size-12;
  }
}
</style>

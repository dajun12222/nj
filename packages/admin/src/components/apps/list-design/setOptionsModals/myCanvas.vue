<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="canvas-box">
    <control-size
      :size="size"
      @reduceSize="reduceSize"
      @increaseSize="increaseSize"
    />
    <div class="my-canvas">
      <data-tree
        v-if="!loading"
        v-drag
        :dataSource="dataSource"
        :getAsycDataItems="getAsycDataItems"
        :isCur="true"
        :size="size"
        :RelevanceFormsDataItems="RelevanceFormsDataItems"
        :filterData="filterData"
        :initRelevanceNode="initRelevanceNode"
        @updateDataSource="updateDataSource"
        @popoverVisible="popoverVisible"
        @relevanceFormsChange="relevanceFormsChange"
      />
      <div v-else class="loading-area">
        <div class="loading-content">
          <span class="icon aufontAll h-icon-all-loading-o"></span>
          加载中...
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ControlSize from './controlSize.vue';
import DataTree from './dataTree.vue';
import myDrag from './drag';

@Component({
  name: 'MyCanvas',
  components: {
    ControlSize,
    DataTree,
  },
})
export default class MyCanvas extends Vue {
  @Prop() dataSource!: any;

  @Prop() getAsycDataItems!: Function;

  @Prop() filterData!: Function;

  @Prop() initRelevanceNode!: Function;

  @Prop() RelevanceFormsDataItems!: any[];

  @Prop() loading!: boolean;

  created() {
    myDrag.drag();
  }

  size: any = 100;

  reduceSize() {
    if (this.size > 50) {
      this.size -= 10;
    }
  }

  increaseSize() {
    if (this.size < 200) {
      this.size += 10;
    }
  }

  popoverVisible() {
    this.size = 100;
  }

  relevanceFormsChange(relevanceFormItem, parentSheetCode) {
    this.$emit('relevanceFormsChange', relevanceFormItem, parentSheetCode);
  }
}
</script>

<style lang="less">
.canvas-box {
  width: 100%;
  height: 100%;
  background-color: rgba(242, 242, 242, 0.8);
  .my-canvas {
    width: 100%;
    height: 100%;
    background: -webkit-linear-gradient(
        top,
        transparent 40px,
        rgb(235, 235, 235) 41px
      ),
      -webkit-linear-gradient(left, transparent 40px, rgb(235, 235, 235) 41px);
    background-size: 41px 41px;
    overflow: hidden;
    position: relative;
    .loading-area {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-around;
      .h-icon-all-loading-o {
        color: #2970ff;
        font-size: 13px;
        line-height: 13px;
        padding-right: 6px;
        &::before {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
      }
    }
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>

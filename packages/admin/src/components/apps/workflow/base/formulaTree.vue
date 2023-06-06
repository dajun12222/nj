<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-directory-tree
    v-if="list.length"
    class="formula-tree"
    :defaultExpandedKeys="expandedKeys"
    @select="selectItem"
  >
    <a-tree-node v-for="node in list" :key="node.key" :isLeaf="node.isLeaf">
      <span slot="title">{{ node.title }}</span>
      <template v-if="node.children">
        <a-tree-node
          v-for="child in node.children"
          :key="child.key"
          :isLeaf="child.isLeaf"
        >
          <a-tooltip slot="title">
            <span slot="title">{{ child.expression }}</span>
            <span>{{ child.title }}</span>
          </a-tooltip>
        </a-tree-node>
      </template>
    </a-tree-node>
  </a-directory-tree>
</template>
<script lang="ts">
import { Tooltip, Tree, Descriptions } from '@h3/antd-vue';
import { Component, PropSync, Vue } from 'vue-property-decorator';

@Component({
  name: 'formulaTree',
  components: {
    ATooltip: Tooltip,
    ATree: Tree,
    ATreeNode: Tree.TreeNode,
    ADirectoryTree: Tree.DirectoryTree,
    ADescriptions: Descriptions,
  },
})
export default class ComponentName extends Vue {
  // @WorkflowModule.State('formulaTree') list: any;
  @PropSync('syncList', { default: [] }) list!: Array<any>; // resolve child comp cannot change prop data from parent component

  //@Prop() syncList:Array<any> = [];
  selectItem(keys: string[]) {
    let item;
    this.list.some((node: any) => {
      const res =
        node.children &&
        node.children.find((child: any) => keys.includes(child.key));
      if (res) {
        item = res;
        return true;
      }
      return false;
    });
    if (item) {
      this.$emit('select', item);
    }
  }

  get expandedKeys() {
    if (this.list.length) {
      return this.list
        .map((l: Apps.Workflow.FormularTreeItem) => l.code)
        .filter((c: any) => !!c);
    }
    return [];
  }
}
</script>
<style lang="less" scoped>
.formula-tree {
  min-width: 284px;
  text-align: left;
  margin-left: 12px;
  /*padding-bottom: 10px;*/
  /deep/ li {
    padding: 7px 0;
    span,
    span:hover,
    span:before {
      color: rgba(17, 18, 24, 0.5);
      background-color: transparent !important;
      user-select: none;
    }
    span.ant-tree-switcher {
      color: rgba(17, 18, 24, 0.5) !important;
    }
    span.ant-tree-iconEle {
      display: none;
    }
    span.ant-tree-title {
      padding-right: 8px;
    }

    ul.ant-tree-child-tree {
      span:hover,
      span.ant-tree-node-content-wrapper:hover,
      span.ant-tree-node-selected .ant-tree-title {
        color: @primary-color !important;
      }
    }
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div
    :class="isCur ? 'data-tree' : 'inline-data-tree'"
    :style="{
      width: isCur ? 'max(100%, ' + maxCount * 229 + 'px)' : 'unset',
      transform: isCur ? 'scale(' + (size % 1000) / 100 + ')' : 'unset',
    }"
  >
    <model-card
      :isCur="isCur"
      :modelName="
        dataSource.parentSheetName
          ? '【' + dataSource.parentSheetName + '】' + dataSource.relativeName
          : '【' + dataSource.name + '】' + dataSource.relativeName
      "
      :expanded="dataSource.expanded"
      :dataItems="dataSource.dataItems"
      :checkedList="dataSource.checkedList"
      :disable="dataSource.disable"
      :tips="hasTips"
      :class="{
        'before-line': !isCur,
        'after-line': expanded && !dataSource.disable,
      }"
      @checkedListChange="checkedListChange"
      @popoverVisible="popoverVisible"
      @expand="expand(dataSource)"
    />
    <div
      v-show="dataSource.children && expanded && !dataSource.disable"
      class="children"
    >
      <template v-for="(child, index) in dataSource.children">
        <div
          v-if="index === 0"
          :key="index + 'div'"
          :style="{
            width: width + 1 + 'px',
            height: maxCount > 1 ? '1px' : 0,
            'margin-left': marginLeft + 'px',
          }"
          class="line"
        ></div>
        <data-tree
          :key="index + 'D' + disableKey"
          :dataSource="child"
          :isCur="false"
          :getAsycDataItems="getAsycDataItems"
          :filterData="filterData"
          :RelevanceFormsDataItems="RelevanceFormsDataItems"
          :initRelevanceNode="initRelevanceNode"
          @treeExpand="treeExpand"
          @popoverVisible="popoverVisible"
          @relevanceFormsChange="relevanceFormsChange"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ModelCard from './modelCard.vue';

@Component({
  name: 'DataTree',
  components: {
    ModelCard,
  },
})
export default class DataTree extends Vue {
  @Prop() dataSource!: any;

  @Prop() getAsycDataItems!: Function;

  @Prop() isCur!: boolean;

  @Prop({ default: 100 }) size: any;

  @Prop() filterData!: Function;

  @Prop() RelevanceFormsDataItems!: any[];

  @Prop() initRelevanceNode!: Function;

  expanded: boolean = false;

  maxCount: any = 0;

  width: any = 0;

  marginLeft: any = 0;

  mounted() {
    this.expanded = this.dataSource.expanded;
    this.maxCount = this.getMaxCount(this.dataSource);
    this.getMarginLeft();
    this.getWidth();

    //@ts-ignore
    const resizeObsever = new (ResizeObserver as any)((entries) => {
      for (const entry of entries) {
        this.getMarginLeft();
      }
    });

    if (this.isCur) {
      resizeObsever.observe(
        (window as any).document.querySelector('.my-canvas'),
      );
    }
  }

  getWidth() {
    if (this.dataSource.children && this.dataSource.children.length > 1) {
      const leftOffset =
        !this.dataSource.disable &&
        this.dataSource.children[0].children &&
        this.dataSource.children[0].children.length > 0
          ? this.getMaxCount(this.dataSource.children[0]) / 2
          : 0.5;
      const rightOffset =
        !this.dataSource.disable &&
        this.dataSource.children[this.dataSource.children.length - 1]
          .children &&
        this.dataSource.children[this.dataSource.children.length - 1].children
          .length > 1
          ? this.getMaxCount(
              this.dataSource.children[this.dataSource.children.length - 1],
            ) / 2
          : 0.5;
      this.width = (this.maxCount - leftOffset - rightOffset) * 229;
    } else {
      this.width = 0;
    }
  }

  getMarginLeft() {
    const leftOffset =
      this.dataSource.children &&
      this.dataSource.children.length > 0 &&
      this.dataSource.children[0].children &&
      this.dataSource.children[0].children.length > 0
        ? this.getMaxCount(this.dataSource.children[0]) / 2
        : 0.5;
    let originOffset = 0;
    if (
      this.isCur &&
      (window as any).document.querySelector('.my-canvas') &&
      (window as any).document.querySelector('.my-canvas').clientWidth >
        this.maxCount * 229
    ) {
      originOffset =
        ((window as any).document.querySelector('.my-canvas').clientWidth -
          this.maxCount * 229) /
        2;
    }

    this.marginLeft = originOffset + leftOffset * 229;
  }

  getMaxCount(node) {
    if (
      !(node.children && node.children.length) ||
      !node.expanded ||
      node.disable
    ) {
      return 1;
    }
    let count = 0;
    node.children.forEach((child) => {
      count = count + this.getMaxCount(child);
    });
    return count;
  }

  expand(dataSource) {
    this.expanded = !dataSource.expanded;
    dataSource.expanded = this.expanded;
    this.maxCount = this.getMaxCount(this.dataSource);
    this.getMarginLeft();
    this.getWidth();
    if (!this.isCur) {
      this.$emit('treeExpand');
    }
  }

  treeExpand() {
    if (!this.isCur) {
      this.$emit('treeExpand');
    }
    this.maxCount = this.getMaxCount(this.dataSource);
    this.getMarginLeft();
    this.getWidth();
  }

  disableKey: any = 0;

  clearCheckList(node) {
    node.checkedList.length = 0;
    for (let i = 0; i < this.RelevanceFormsDataItems.length; i++) {
      if (this.RelevanceFormsDataItems[i].id === node.id) {
        if (!node.parentSheetCode) {
          this.relevanceFormsChange(
            { ...this.RelevanceFormsDataItems[i] },
            this.dataSource.parentSheetCode,
          );
        }
        this.RelevanceFormsDataItems.splice(i, 1);
        break;
      }
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        this.clearCheckList(child);
      });
    }
  }

  setDisable() {
    const vm = this;
    if (this.dataSource.children && this.dataSource.children.length > 0) {
      this.dataSource.children.forEach((el) => {
        if (this.dataSource.checkedList.includes(el.id)) {
          if (
            el.disable &&
            !vm.RelevanceFormsDataItems.some(
              (item) => item.relativeCode === el.relativeCode,
            )
          ) {
            el.disable = false;
            this.disableKey++;
          }
        } else {
          if (!el.disable) {
            el.disable = true;
            this.clearCheckList(el);
            this.disableKey++;
          }
        }
      });
    }
  }

  findRele(id, path, parentSheetCode) {
    const target = this.RelevanceFormsDataItems.filter(
      (item) => item.id === id && item.parentSheetCode === parentSheetCode,
    );
    return target[0] || null;
  }

  checkedListChange(checkedList) {
    this.dataSource.checkedList = checkedList;
    if (!this.isCur) {
      const targetRele = this.findRele(
        this.dataSource.id,
        this.dataSource.path || [],
        this.dataSource.parentSheetCode,
      );
      if (checkedList.length > 0) {
        if (!!targetRele) {
          targetRele.checkedList = checkedList;
          this.setDisable();
          return;
        }
        this.RelevanceFormsDataItems.push({
          disable: this.dataSource.disable,
          expanded: this.dataSource.expanded,
          id: this.dataSource.id,
          checkedList: this.dataSource.checkedList,
          code: this.dataSource.code,
          dataItems: this.dataSource.dataItems,
          isMainTable: this.dataSource.isMainTable,
          name: this.dataSource.name,
          options: this.dataSource.options,
          propertyTypeName: this.dataSource.propertyTypeName,
          relativeName: this.dataSource.relativeName,
          relativeCode: this.dataSource.relativeCode,
          parentSheetCode: this.dataSource.parentSheetCode,
          parentSheetName: this.dataSource.parentSheetName,
          schemaCode: this.dataSource.schemaCode,
          path: [
            {
              parentName: this.dataSource.relativeName,
              schemaCode: this.dataSource.schemaCode,
              parentCode: this.dataSource.code,
              relativeCode: this.dataSource.relativeCode,
            },
            ...this.dataSource.path,
          ],
        });
        this.relevanceFormsChange(
          this.RelevanceFormsDataItems[this.RelevanceFormsDataItems.length - 1],
          this.dataSource.parentSheetCode,
        );
        this.setDisable();
      } else {
        if (!!targetRele) {
          const index = this.RelevanceFormsDataItems.findIndex(
            (target) => target === targetRele,
          );
          this.relevanceFormsChange(
            { ...targetRele },
            this.dataSource.parentSheetCode,
          );
          this.RelevanceFormsDataItems.splice(index, 1);
          this.setDisable();
          return;
        }
        this.setDisable();
      }
    }
  }

  popoverVisible() {
    this.$emit('popoverVisible');
  }

  relevanceFormsChange(relevanceFormItem, parentSheetCode) {
    this.$emit('relevanceFormsChange', relevanceFormItem, parentSheetCode);
  }

  get hasTips() {
    return this.RelevanceFormsDataItems.some(
      (item) =>
        item.relativeCode === this.dataSource.relativeCode &&
        this.dataSource.disable,
    );
  }
}
</script>

<style lang="less">
.data-tree {
  padding-top: 100px;
  white-space: nowrap;
  text-align: center;
  transform-origin: left top;
}

.inline-data-tree {
  display: inline-table;
}

.children {
  margin: 0 auto;
  .line {
    background-color: #898989;
  }
}

.before-line::before {
  content: '';
  height: 21px;
  width: 1px;
  background: #898989;
  position: absolute;
  left: 50%;
  top: -21px;
}

.after-line::after {
  content: '';
  height: 31px;
  width: 1px;
  background: #898989;
  position: absolute;
  left: 50%;
  bottom: -37px;
}
</style>

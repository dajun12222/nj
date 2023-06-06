<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-item-list">
    <template v-if="dataSource && dataSource.length">
      <a-spin :spinning="loading">
        <table class="table table-striped">
          <thead class="thead-dark">
            <tr>
              <th style="width: 56px"></th>
              <th
                v-for="item in columns"
                :key="item.key"
                :style="{
                  width: item.width + 'px',
                  textAlign:
                    item.key === 'action'
                      ? 'left'
                      : item.align
                      ? item.align
                      : 'center',
                  paddingLeft:
                    item.key === 'action'
                      ? '20px'
                      : item.key === 'published'
                      ? '20px'
                      : '',
                }"
                scope="col"
              >
                <slot
                  v-if="item.slots && item.slots.title"
                  :name="item.slots.title"
                ></slot>
                <template v-else>
                  {{ item.name }}
                </template>
              </th>
              <td class="right-th"></td>
            </tr>
          </thead>
          <draggable
            v-if="list.length"
            :list="list"
            :options="dragOptions"
            handle=".handles"
            tag="tbody"
            @end="onEnd"
          >
            <div v-for="(item, i) in list" :key="item.id" class="drag-title">
              <tr>
                <td
                  :class="{ handles: !noSort, handle: true }"
                  @mouseleave="itemLeave(item, i)"
                  @mouseover="itemOver(item, i)"
                >
                  <span v-if="item.hove" class="icon aufontAll">&#xe63e;</span>
                  <span v-else>{{ i + 1 }}</span>
                </td>
                <td
                  v-for="(v, n) in columns"
                  :key="n"
                  :style="{
                    textAlign: v.align ? v.align : 'left',
                    width: v.width + 'px',
                  }"
                >
                  <slot
                    v-if="v.scopedSlots && v.scopedSlots.customRender"
                    :name="v.scopedSlots.customRender"
                    :record="item"
                    :text="item[v.key]"
                  ></slot>
                  <template v-else>
                    {{ item[v.key] }}
                  </template>
                </td>
                <td class="right"></td>
              </tr>
              <template v-if="item.children && item.children.length">
                <draggable
                  v-if="item.sheetSort"
                  :list="childrenList(item.children)"
                  :options="dragOptionsChild"
                  handle=".handles"
                  tag="tbody"
                  @end="
                    (e) => {
                      onSheetSortEnd(childrenList(item.children), e, item.code);
                    }
                  "
                >
                  <div class="left-back"></div>
                  <div
                    v-for="(items, ii) in item.children"
                    :key="i + 'd' + ii"
                    class="drag-title"
                  >
                    <tr>
                      <td
                        :class="{ handles: !noSort, handle: true }"
                        @mouseleave="itemLeaveSheet(item, items, i, ii)"
                        @mouseover="itemOverSheet(item, items, i, ii)"
                      >
                        <span v-if="items.hove" class="icon aufontAll">
                          &#xe63e;
                        </span>
                        <span v-else>{{ ii + 1 }}</span>
                      </td>
                      <td
                        v-for="(v, nn) in columns"
                        :key="nn"
                        :style="{
                          textAlign: v.align ? v.align : 'center',
                          width: v.width + 'px',
                        }"
                      >
                        <slot
                          v-if="v.scopedSlots && v.scopedSlots.customRender"
                          :name="v.scopedSlots.customRender"
                          :record="items"
                          :text="items[v.key]"
                        ></slot>
                        <template v-else>
                          {{ items[v.key] }}
                        </template>
                      </td>
                      <td class="right"></td>
                    </tr>
                  </div>
                </draggable>
              </template>
              <div v-if="item.children" class="item-sheet">
                <i
                  v-if="!item.sheetSort"
                  class="icon aufontAll h-icon-all-arrows-alt-o"
                  @click="handleSheetSort(item, i)"
                ></i>
                <i
                  v-else
                  class="icon aufontAll h-icon-all-arrows-o"
                  @click="handleSheetSort(item, i)"
                ></i>
              </div>
            </div>
          </draggable>
        </table>
      </a-spin>
    </template>
    <template v-else>
      <div v-if="dataSource.length === 0" class="no-data">
        <div class="no-data-tips">
          <img src="../../../assets/images/noContent.png" />
          <p class="tips">暂无内容</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Spin } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';

@Component({
  name: 'DataItemList',
  components: {
    Draggable,
    ASpin: Spin,
  },
})
export default class DataItemList extends Vue {
  @Prop() columns: any;

  @Prop() dataSource: any;

  @Prop({
    default: false,
  })
  loading: any;

  @Prop() noSort: any;

  list: any[] = [];

  dragOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    forceFallback: true,
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 100,
  };

  dragOptionsChild: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    forceFallback: true,
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 200,
  };

  showSheet: any[] = [];

  created() {
    if (this.list.length === 0 && this.dataSource.length > 0) {
      this.list = this.dataSource;
    }
  }

  childrenList(list: any) {
    const orList = JSON.parse(JSON.stringify(list));
    console.log('orList', '----------');
    return orList;
  }

  /**
   * 结束拖拽
   */
  onEnd(evt: any) {
    const codeList = this.list.map((res: any) => {
      return res.code;
    });
    const beDraggedItem =
      evt.item && evt.item._underlying_vm_ && evt.item._underlying_vm_.code;
    if (codeList[evt.newIndex] === beDraggedItem) {
      this.$emit('sortEnd', codeList, true);
    } else {
      const item = codeList.find((i, v) => v === evt.oldIndex);
      const data = codeList.filter((res: any, i: any) => {
        return i !== evt.oldIndex;
      });
      data.splice(evt.newIndex, 0, item);
      this.$emit('sortEnd', data, true);
    }
  }

  onSheetSortEnd(list: any, evt: any, sheetCode: any) {
    const orange: any = list.map((res: any) => {
      return res.code;
    });
    const item = orange.filter((i, v) => v === evt.oldIndex - 1).join(''); // 被拖拽的项

    const filerList = orange.filter((res: any, i: any) => {
      return res !== item;
    });
    filerList.splice(evt.newIndex - 1, 0, item);
    const result = filerList.join(',');
    this.$emit('sortChildrenRankList', result, sheetCode, true);
  }

  itemOver(item: any, i: number) {
    if (!this.noSort) {
      item.hove = true;
      this.$set(this.list, i, item);
    }
  }

  itemLeave(item: any, i: number) {
    if (!this.noSort) {
      item.hove = false;
      this.$set(this.list, i, item);
    }
  }

  itemLeaveSheet(item: any, items: any, i: number, ii: number) {
    items.hove = false;
    item.children[ii] = items;
    this.$set(this.list, i, item);
  }

  itemOverSheet(item: any, items: any, i: number, ii: number) {
    items.hove = true;
    item.children[ii] = items;
    this.$set(this.list, i, item);
  }

  handleSheetSort(item: any, i: number) {
    item.sheetSort = !item.sheetSort;
    if (item.sheetSort) {
      this.showSheet.push(item.code);
    } else {
      this.showSheet = this.showSheet.filter((v) => v !== item.code);
    }
    this.$set(this.list, i, item);
  }

  @Watch('dataSource')
  changeDataSource(val: any) {
    this.list = this.handleChangeList(val, {});
  }

  handleChangeList(data: any, nodes: any) {
    const result: any = [];
    data.forEach((node: any, i) => {
      node.hove = false;
      const status = this.showSheet.includes(node.code);
      node.sheetSort = status;
      if (node.children && node.children.length) {
        node.children = this.handleChangeList(node.children, node);
      }
      result.push(node);
    });
    return result;
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.data-item-list {
  margin-top: 15px;

  .no-data-tips {
    margin: 50px auto;
    width: 204px;

    p {
      text-align: center;
    }
    img {
      width: 100%;
    }
  }

  .ghostClass {
    opacity: 1;
    background: @sub-bg-color;
    border-radius: 4px;
    border: 1px solid @sub-bg-color !important;

    * {
      opacity: 0;
    }
  }

  .drag-title {
    /*height: 43px;*/
    margin-bottom: 8px;
    border-radius: 4px;
    border: 1px solid rgb(221, 221, 221);
    position: relative;
    color: #000;
    &:hover {
      border: 1px solid #e5efff;
    }
    .left-back {
      position: absolute;
      left: 0;
      top: 39px;
      bottom: 0;
      width: 40px;
      background: #e9edf2;
      z-index: 0;
    }
    /deep/ .ant-tag-blue {
      background: #e5efff !important;
      color: @primary-color !important;
      border-color: @primary-color !important;
    }

    tbody {
      padding-top: 10px;
    }

    .item-sheet {
      width: 26px;
      height: 26px;
      background: #ffffff;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      border-radius: 50%;
      position: absolute;
      top: 3px;
      left: -13px;
    }
  }

  .dragClass {
    background-color: #fff;
    box-shadow: inset 0 0 0 1px @primary-color,
      0px 4px 12px 0px rgba(7, 98, 23, 0.15);
  }

  .table {
    width: calc(100% + 12px);
    margin-left: -12px;
    /*border-spacing: 0px 5px;*/
    /*border-collapse: separate;*/
    table-layout: fixed;

    table thead,
    tbody tr,
    tfoot tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

    tbody {
      display: block;
      max-height: calc(100vh - 280px);
      overflow-y: auto;
      width: calc(100%);
      padding-left: 15px;
      tr {
        height: 41px;
        border-radius: 4px;
        /*border: 1px solid #DDDDDD;*/

        .handle {
          width: 40px;
          height: 39px;
          background: #e9edf2;
          border-radius: 4px 0px 0px 4px;
          /*border: 1px solid #DDDDDD;*/
          line-height: 39px;
          text-align: center;

          .icon {
            &:hover {
              cursor: move;
            }
          }

          span {
            color: rgba(17, 18, 24, 0.5);
            font-size: 16px;
          }
        }

        .right {
          width: 14px;
          height: 39px;
          border-radius: 0px 4px 4px 0px;
          /*border-right: 1px solid #DDDDDD;*/
        }

        td {
          /*border-bottom: 1px solid #DDDDDD;*/
          /*border-top: 1px solid #DDDDDD;*/
          padding: 0 10px;
        }
      }
    }
  }

  .thead-dark {
    width: calc(100%);
    display: table;
    table-layout: fixed;
    margin-bottom: 8px;

    .right-th {
      width: 30px;
    }

    tr {
      th {
        /*width: 24px;*/
        height: 20px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        line-height: 20px;
        overflow-wrap: break-word;
        padding: 0 10px;
        color: rgba(17, 18, 24, 0.5);
      }
    }
  }
}
</style>

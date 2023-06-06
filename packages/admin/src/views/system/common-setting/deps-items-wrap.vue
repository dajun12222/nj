<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <div class="deps-items-wrap">
      <span
        v-for="item in showDataList"
        :key="item.id"
        @click="changeActive(item)"
      >
        {{ item.name }}
      </span>
    </div>
    <div class="pagination-wrap">
      <a-pagination
        :current="currentPage"
        :showTotal="(total) => `共${listData.length}条`"
        :pageSizeOptions="pageSizeOptions"
        size="small"
        :total="listData.length"
        showSizeChanger
        showQuickJumper
        :defaultPageSize="pageSize"
        @showSizeChange="showSizeChange"
        @change="pageChange"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Pagination } from '@h3/antd-vue';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'deps-items-wrap',
  components: {
    APagination: Pagination,
  },
})
export default class CommonSetting extends Vue {
  @Prop()
  listData!: any[];

  changeActive(item) {
    this.$emit('itemClick', item);
  }

  @Watch('listData')
  onListDataChange() {
    this.currentPage = 1;
  }

  /**
   * 分页参数
   */
  pageSizeOptions: Array<string> = ['10', '20', '50', '100'];

  get showDataList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listData.slice(start, start + this.pageSize);
  }

  currentPage: number = 1;

  pageSize: number = 20;

  showSizeChange(current: number, size: number) {
    this.currentPage = 1;
    this.pageSize = size;
  }

  // 分页 page change 回调
  pageChange(page: number, pageSize: number) {
    this.currentPage = page;
  }
}
</script>
<style lang="less" scoped>
.deps-items-wrap {
  // display: flex;
  // flex-wrap: wrap;
  background: #fafafa;
  padding: 16px 24px 0;
  height: 232px;
  overflow: auto;
  span {
    width: 16%;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    display: inline-block;
    margin-bottom: 16px;
    line-height: 14px;
    font-size: 14px;
    color: rgba(17, 18, 24, 0.5);
    cursor: pointer;
    &:hover {
      color: @primary-color;
    }
  }
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  align-items: center;
  /deep/.ant-pagination-options-quick-jumper input {
    vertical-align: top;
  }
  /deep/li {
    height: 25px !important;
  }
}
</style>

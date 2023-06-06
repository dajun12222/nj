<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="un-complete">
    <infos :infoData="infoData" />

    <pageHeader
      :currentPage="currentPage"
      :totalPage="totalPage"
      @pageChange="pageChange"
    >
      {{ $t('languages.common.workBenchInfo.ToDoTask') }}
    </pageHeader>

    <unfinishedList :list="list" @refreshData="refreshData" />
  </div>
</template>

<script lang="ts">
import { workbenchApi } from 'cloudpivot/api';
import SetTimeTypeMixin from 'cloudpivot/flow-center/src/components/pc/common/index'; //公共处理模块
import { mixins } from 'vue-class-component';
import { Component } from 'vue-property-decorator';
import infos from './infos.vue';
import pageHeader from './pageHeader.vue';
import unfinishedList from './unfinishedList.vue';

@Component({
  name: 'unComplete',
  components: {
    infos,
    unfinishedList,
    pageHeader,
  },
})
export default class unComplete extends mixins(SetTimeTypeMixin) {
  infoData: any = {
    circulateItemCount: 0,
    toAdminItemCount: 0,
    workItemCount: 0,
    workflowCount: 0,
  };

  totalPage: number = 0;

  currentPage: number = 0;

  pageSize: number = 4;

  list: any[] = [];

  pageChange(type: 'prev' | 'next') {
    if (type === 'prev' && this.currentPage !== 0) {
      this.currentPage = this.currentPage - 1;
      this.getList();
    } else if (type === 'next' && this.currentPage !== this.totalPage - 1) {
      this.currentPage = this.currentPage + 1;
      this.getList();
    }
  }

  async getWorkCount() {
    const res = await workbenchApi.getWorkCount();
    if (res.errcode === 0) {
      this.infoData = res.data;
    }
  }

  refreshData() {
    this.currentPage = 0;
    this.getList();
    this.getWorkCount();
    this.$emit('closeIframeForm', 'unfinish');
  }

  async getList() {
    const res = await workbenchApi.searchWorkitems({
      wd: '',
      page: this.currentPage,
      size: this.pageSize,
    });
    if (res.errcode === 0) {
      res.data.content.forEach((item) => {
        this.SetTimeType(item);
      });
      this.list = res.data.content;
      this.totalPage = res.data.totalPages;
    }
  }

  created() {
    this.getWorkCount();
    this.getList();
  }
}
</script>

<style lang="less" scoped>
.un-complete {
  min-width: 660px;
  flex: 2;
  height: 379px;
  overflow: hidden;
  background-color: #fff;
  .infos {
    margin-bottom: 28px;
  }
  .page-header {
    padding: 0 24px;
  }
}
</style>

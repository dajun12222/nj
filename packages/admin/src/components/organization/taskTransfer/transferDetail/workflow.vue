<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="workflow-detail-data">
    <div class="workflow-table">
      <a-table
        class="workflow-data-list"
        :columns="workflowColumns"
        :dataSource="workflowData"
        :scroll="{ y: 'calc(100vh - 376px)' }"
        :pagination="false"
        :rowKey="(record) => record.id"
      >
        <template slot="instanceName" slot-scope="text">
          <a-tooltip v-if="text" placement="top">
            <template slot="title">
              <span>{{ text }}</span>
            </template>
            <span class="text">{{ text }}</span>
          </a-tooltip>
          <span v-else>--</span>
        </template>
        <template slot="templateName" slot-scope="text">
          <a-tooltip v-if="text" placement="top">
            <template slot="title">
              <span>{{ text }}</span>
            </template>
            <span class="text">{{ text }}</span>
          </a-tooltip>
          <span v-else>--</span>
        </template>
        <template slot="startUserName" slot-scope="text">
          <a-tooltip v-if="text" placement="top">
            <template slot="title">
              <span>{{ text }}</span>
            </template>
            <span class="text">{{ text }}</span>
          </a-tooltip>
          <span v-else>--</span>
        </template>
      </a-table>
    </div>
    <div v-show="workflowTotal" class="workflow-pagination">
      <a-pagination
        :current="curPage"
        :total="workflowTotal"
        :showTotal="(workflowTotal) => `共${workflowTotal}条`"
        :pageSize="pageSize"
        :pageSizeOptions="pageSizeOptions"
        showSizeChanger
        showQuickJumper
        @change="onPaginationChange"
        @showSizeChange="onSizeChange"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Pagination, Table, Tooltip } from '@h3/antd-vue';
import axios from 'axios';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'WorkflowData',
  components: {
    ATable: Table,
    APagination: Pagination,
    ATooltip: Tooltip,
  },
})
export default class WorkflowData extends Vue {
  @Prop({ default: '' })
  recordId!: string;

  pageSizeOptions: string[] = ['10', '20', '50', '100', '200', '300', '500'];

  workflowColumns: any[] = [
    {
      width: 86,
      dataIndex: 'index',
      title: '序号',
    },
    {
      width: 199,
      dataIndex: 'instanceName',
      title: '流程名称',
      scopedSlots: { customRender: 'instanceName' },
    },
    {
      width: 107,
      dataIndex: 'workItemName',
      title: '流程节点',
      scopedSlots: { customRender: 'workItemName' },
    },
    {
      width: 107,
      dataIndex: 'templateName',
      title: '流程模板',
      scopedSlots: { customRender: 'templateName' },
    },
    {
      width: 102,
      dataIndex: 'startUserName',
      title: '发起人',
      scopedSlots: { customRender: 'startUserName' },
    },
    {
      width: 196,
      dataIndex: 'startTime',
      title: '发起时间',
      scopedSlots: { customRender: 'startTime' },
    },
  ];

  workflowData: any[] = [];

  workflowAllData: any[] = [];

  workflowTotal: number = 0;

  pageSize: number = 20;

  curPage: number = 1;

  mounted() {
    this.query();
  }

  async query() {
    const params: any = {
      recordId: this.recordId || '',
      pageNumber: this.curPage - 1 || 0,
      pageSize: this.pageSize || 20,
    };

    const res: any = await axios.get(
      '/api/organization/user/transfer/record/detail',
      { params },
    );

    if (!res.errcode && res.data) {
      console.log(res.data);
      this.initData(res.data);
    } else {
      this.$message.error(res.errmsg || res.message);
    }
  }

  initData(resData: any) {
    if (resData.workItemList) {
      this.workflowAllData = [...resData.workItemList];
      this.workflowTotal = resData.workItemTotalSize;
      for (let i = 0; i < this.workflowTotal; i++) {
        this.workflowAllData[i].index = i + 1;
      }
      console.log(this.workflowAllData);
      this.curPageData();
    } else if (resData.workItemTotalSize) {
      this.$message.error('获取数据失败');
    } else {
      //Else Empty block statement
    }
  }

  curPageData() {
    this.workflowData = this.workflowAllData.slice(
      (this.curPage - 1) * this.pageSize,
      this.curPage * this.pageSize,
    );
  }

  onSizeChange(current, size) {
    this.curPage = 1;
    this.pageSize = size;
    this.curPageData();
  }

  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.curPageData();
  }
}
</script>
<style lang="less" scoped>
.workflow-detail-data {
  height: 100%;
  display: flex;
  flex-flow: column;
  .workflow-table {
    height: calc(100% - 44px);
    .workflow-data-list {
      height: 100%;
      margin-right: -24px;
      padding-right: 18px;
      overflow-y: scroll;
      /deep/.ant-table-thead {
        tr > th {
          padding: 9px 0;
          height: 20px;
          font-size: 14px;
          font-weight: 600;
          color: #111218;
          line-height: 20px;
          &:not(:last-child)::after {
            content: '';
            border-right: 1px solid #e8e8e8;
          }
          > span {
            width: 100%;
          }
          &:first-child > span {
            padding-left: 24px;
          }
          &:last-child > span {
            padding-right: 24px;
          }
          &:not(:first-child) > span {
            padding-left: 16px;
          }
        }
      }
      /deep/.ant-table-tbody {
        tr > td {
          padding: 9px 24px;
          height: 20px;
          font-size: 14px;
          font-weight: 400;
          color: #111218;
          line-height: 20px;
          &:not(:first-child) {
            padding-left: 16px;
          }
          &:not(:last-child) {
            padding-right: 16px;
          }
          .handoverOpt {
            font-size: 14px;
            cursor: pointer;
          }
        }
        .text {
          display: block;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  .workflow-pagination {
    text-align: right;
    margin-top: 12px;
  }
}
</style>

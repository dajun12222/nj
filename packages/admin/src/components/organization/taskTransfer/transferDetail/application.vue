<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="application-detail-data">
    <template v-if="dataDisplayType === 1">
      <div class="application-table">
        <a-table
          class="application-data-list"
          :columns="applicationColumns"
          :dataSource="applicationData"
          :scroll="{ y: 'calc(100vh - 376px)' }"
          :pagination="false"
          :rowKey="(record) => record.id"
        >
          <template slot="dataName" slot-scope="text">
            <a-tooltip v-if="text" placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span class="text">{{ text }}</span>
            </a-tooltip>
            <span v-else>--</span>
          </template>
          <template slot="creatorName" slot-scope="text">
            <a-tooltip v-if="text" placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span class="text">{{ text }}</span>
            </a-tooltip>
            <span v-else>--</span>
          </template>
          <template slot="createTime" slot-scope="text">
            <a-tooltip v-if="text" placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span class="text">{{ text }}</span>
            </a-tooltip>
            <span v-else>--</span>
          </template>
          <template slot="schemaName" slot-scope="text">
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
      <div v-show="applicationTotal" class="application-pagination">
        <a-pagination
          :current="curPage"
          :total="applicationTotal"
          :showTotal="(applicationTotal) => `共${applicationTotal}条`"
          :pageSize="pageSize"
          :pageSizeOptions="pageSizeOptions"
          showSizeChanger
          showQuickJumper
          @change="onPaginationChange"
          @showSizeChange="onSizeChange"
        />
      </div>
    </template>
    <template v-else>
      <div class="application-img">
        <img
          class="data-img"
          src="../../../../assets/images/userEmpty.png"
          alt=""
          width="157"
          height="126"
        />
        <div class="data-text">交接全部数据 {{ applicationTotal }} 条数据</div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Pagination, Table, Tooltip } from '@h3/antd-vue';
import axios from 'axios';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'ApplicationData',
  components: {
    ATable: Table,
    APagination: Pagination,
    ATooltip: Tooltip,
  },
})
export default class ApplicationData extends Vue {
  @Prop({ default: '' })
  recordId!: string;

  @Prop({ default: 0 })
  totalNumber!: number;

  dataDisplayType: number = 1; // 1：表格  2：缩略图

  pageSizeOptions: string[] = ['10', '20', '50', '100', '200', '300', '500'];

  applicationColumns: any[] = [
    {
      width: 86,
      dataIndex: 'index',
      title: '序号',
    },
    {
      width: 242,
      dataIndex: 'dataName',
      title: '数据标题',
      scopedSlots: { customRender: 'dataName' },
    },
    {
      width: 129,
      dataIndex: 'creatorName',
      title: '创建人',
      scopedSlots: { customRender: 'creatorName' },
    },
    {
      width: 214,
      dataIndex: 'createTime',
      title: '创建时间',
      scopedSlots: { customRender: 'createTime' },
    },
    {
      width: 127,
      dataIndex: 'schemaName',
      title: '所属模型',
      scopedSlots: { customRender: 'schemaName' },
    },
  ];

  applicationData: any[] = [];

  applicationAllData: any[] = [];

  applicationTotal: number = 0;

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
    // const resData = JSON.parse(this.testData)
    this.applicationTotal = resData.businessDataTotalSize || this.totalNumber;
    if (!resData.businessDataList) {
      this.dataDisplayType = 2;
      return;
    } else {
      this.dataDisplayType = 1;
      this.applicationAllData = [...resData.businessDataList];
      for (let i = 0; i < this.applicationTotal; i++) {
        this.applicationAllData[i].index = i + 1;
      }
      this.$emit('getSchemaName', this.applicationAllData[0].schemaName);
      this.curPageData();
    }
  }

  curPageData() {
    this.applicationData = this.applicationAllData.slice(
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
.application-detail-data {
  height: 100%;
  display: flex;
  flex-flow: column;
  .application-table {
    height: 100%;
    .application-data-list {
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
  .application-pagination {
    text-align: right;
    margin-top: 12px;
  }
  .application-img {
    text-align: center;
    margin-top: 124px;
    .data-img {
      width: 157px;
      height: 126px;
    }
    .data-text {
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      line-height: 20px;
      margin-top: 8px;
    }
  }
}
</style>

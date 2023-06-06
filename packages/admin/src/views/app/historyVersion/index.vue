<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="historyDiv">
    <a-spin :spinning="isLoading" tip="Loading...">
      <div v-show="totalPage === 0" class="empty-box">
        <img class="user-empty" src="../../../assets/images/userEmpty.png" />
        <div>暂无数据</div>
      </div>
      <!-- 列表 -->
      <div v-show="totalPage > 0" class="historyDiv__table">
        <a-table
          class="table-user-list"
          :columns="columns"
          :dataSource="historyList"
          :pagination="false"
          :scroll="{ y: 500 }"
          :locale="{ emptyText: $t('languages.NoRelevantData') }"
          :rowKey="(record) => record.id"
        >
          <!-- 表体 -->
          <span slot="index" slot-scope="text, record" class="text-ellipsis">{{
            getIndex(record.id)
          }}</span>
          <span slot-scope="text, record" class="text-ellipsis">{{
            record.name
          }}</span>
          <span slot-scope="text, record" class="text-ellipsis">{{
            record.code
          }}</span>
          <span slot-scope="text, record" class="text-ellipsis">{{
            record.version
          }}</span>
          <span slot-scope="text, record" class="text-ellipsis">{{
            record.publishBy
          }}</span>
          <span slot-scope="text, record" class="text-ellipsis">{{
            record.modifiedTime
          }}</span>
          <span slot-scope="text, record" class="text-ellipsis">{{
            record.remarks
          }}</span>
          <span
            slot="action"
            slot-scope="text, record"
            class="historyDiv__actions operation"
          >
            <i @click="view(record)">查看</i>
          </span>
        </a-table>
      </div>
      <div class="historyDiv__footer">
        <div v-show="totalPage > 0">
          <a-pagination
            :defaultPageSize="params.size"
            :total="totalPage"
            :showTotal="(total) => `共${totalPage}条`"
            :current="params.page + 1"
            :pageSizeOptions="pageSizeOptions"
            showSizeChanger
            showQuickJumper
            @change="pageChange"
            @showSizeChange="pageSizeChange"
          />
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts">
import appsApi from '@/apis/apps';
import { Spin, Table, Pagination } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
const FormHisModule = namespace('Apps/FormHis');
@Component({
  name: 'historyVersion',
  components: {
    ASpin: Spin,
    ATable: Table,
    APagination: Pagination,
  },
})
export default class HistoryVersion extends Vue {
  // @FormHisModule.State('currentHistoty') currentHistoty: any;

  @FormHisModule.Mutation('setCurHistory') setCurHistory: any;

  //表头信息
  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      title: '序号',
      scopedSlots: { customRender: 'index' },
      width: 110,
      align: 'center',
    },
    {
      dataIndex: 'name',
      width: 150,
      title: '表单名称',
      align: 'left',
    },
    {
      dataIndex: 'code',
      width: 150,
      title: '表单编码',
      align: 'left',
    },
    {
      dataIndex: 'version',
      width: 150,
      title: '版本号',
      align: 'left',
    },
    {
      dataIndex: 'publishBy',
      width: 150,
      title: '发布人',
      align: 'left',
    },
    {
      dataIndex: 'modifiedTime',
      width: 150,
      title: '发布时间',
      align: 'center',
    },
    {
      dataIndex: 'remarks',
      title: '描述',
      align: 'left',
    },
    {
      dataIndex: 'action',
      title: '操作',
      scopedSlots: { customRender: 'action' },
      key: 'action',
      width: 160,
      align: 'center',
    },
  ];

  //是否正在加载列表
  isLoading: boolean = false;

  totalPage: number = 0;

  pageSizeOptions: Array<string> = ['10', '20', '50', '100'];

  params: any = {
    page: 0,
    size: 20,
  };

  historyList: Array<any> = [];

  getIndex(id) {
    const currentIndex = this.historyList.findIndex((item) => {
      return item.id === id;
    });
    return this.params.page * this.params.size + currentIndex + 1;
  }

  // 分页 page change 回调
  pageChange(page: number, pageSize: number) {
    this.params.page = page - 1;
    this.params.size = pageSize;
    this.getHistoryList();
  }

  /**
   * 修改分页大小
   */
  pageSizeChange(current: number, pageSize: number) {
    this.params.page = 0;
    this.params.size = pageSize;
    this.getHistoryList();
  }

  view(item) {
    // this.$message.info("功能开发中...敬请期待");
    this.setCurHistory(item);
    this.$router
      .push({
        name: 'versionDetail',
        params: {
          bizSchemaCode: this.$route.params.bizSchemaCode,
          sheetCode: this.$route.params.sheetCode,
          version: item.version,
          id: item.id,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  mounted() {
    this.getHistoryList();
  }

  getHistoryList() {
    this.isLoading = true;
    const params: Common.FormHistoryParam = {
      schemaCode: this.$route.params.bizSchemaCode,
      sheetCode: this.$route.params.sheetCode,
      page: this.params.page,
      size: this.params.size,
    };
    appsApi
      .getFormHistory(params)
      .then((res: any) => {
        if (res.errcode === 0) {
          this.totalPage = res.data.totalElements;
          this.historyList = res.data.content;
        } else {
          this.$message.error(res.errmsg);
        }
        this.isLoading = false;
      })
      .catch((err) => {
        console.log(err);
        this.isLoading = false;
      });
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/table.less';
.historyDiv {
  padding: 24px 24px 0 24px;
  & div.empty-box {
    text-align: center;
    .user-empty {
      margin: 0px auto;
      margin-top: 150px;
    }
  }
  &__table {
    &,
    /deep/.ant-table-header,
    /deep/.ant-table-body {
      &::-webkit-scrollbar {
        width: 0;
        display: none;
      }
    }
    /deep/.ant-table-body {
      max-height: calc(100vh - 180px - 44px) !important;
    }
    /deep/ .ant-switch-disabled {
      opacity: 1;
    }
    /deep/ .ant-table-small > .ant-table-content .ant-table-row:last-child td {
      border-bottom: none;
    }
  }
  &__footer {
    position: fixed;
    bottom: 5px;
    right: 20px;
    & > div {
      float: right;
      padding: 8px 0;
      margin-right: 24px;
    }
    /deep/.ant-pagination-options-quick-jumper input {
      vertical-align: top;
    }
    /deep/.ant-pagination-options {
      height: 32px;
    }
  }
  &__actions {
    i {
      cursor: pointer;
      padding: 0 9px;
    }
    i:last-child {
      padding-right: 0;
    }
  }
}
</style>

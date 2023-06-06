<template>
  <div>
    <div v-if="totalPage > 0" class="search">
      <InputSearch
        v-model="params.name"
        :placeholder="$t('cloudpivot.list.pc.placeInputModel')"
        :allowClear="true"
        @search="query"
      />
    </div>

    <div v-if="searchPage > 0" class="export__content">
      <a-table
        :columns="columns"
        :dataSource="dataSource"
        :loading="false"
        :locale="{ emptyText: $t('cloudpivot.list.pc.noData') }"
        :pagination="false"
        :scroll="{ y: 350 }"
        rowKey="id"
        size="small"
        :bordered="true"
      >
        <span slot="indexTitle">{{ $t('cloudpivot.list.pc.Number') }}</span>
        <span slot="refId" class="resize">{{
          $t('cloudpivot.list.pc.fileName')
        }}</span>
        <span slot="fileSize" class="resize">{{
          $t('cloudpivot.list.pc.fileSize')
        }}</span>
        <span slot="schemaName" class="resize">{{
          $t('cloudpivot.list.pc.modelName')
        }}</span>
        <span slot="endTime" class="resize">{{
          $t('cloudpivot.list.pc.exportTime')
        }}</span>
        <span slot="actionTitle" class="resize">{{
          $t('cloudpivot.list.pc.operation')
        }}</span>

        <span
          slot="refId"
          slot-scope="text"
          :title="text"
          class="text-ellipsis"
          >{{ text || '--' }}</span>
        <span
          slot="fileSize"
          slot-scope="text"
          :title="text"
          class="text-ellipsis"
          >{{ text || '--' }}</span>
        <span
          slot="schemaName"
          slot-scope="text"
          :title="text"
          class="text-ellipsis"
          >{{ text || '--' }}</span>
        <span
          slot="endTime"
          slot-scope="text"
          :title="text"
          class="text-ellipsis"
          >{{ text || '--' }}</span>
        <div slot="id" slot-scope="text, record" class="biz-log__link">
          <a href="javascript:void(0)" @click="handleUploadFile(record.id)">{{
            $t('cloudpivot.list.pc.download')
          }}</a>
          <span @click="deleteRecord(record.id)">{{
            $t('cloudpivot.list.pc.Delete')
          }}</span>
        </div>
      </a-table>
    </div>

    <div class="clearfix">
      <div v-show="searchPage > 0" class="export__footer">
        <a-pagination
          :current="params.page + 1"
          :defaultPageSize="params.size"
          :pageSizeOptions="pageSizeOptions"
          :showTotal="
            (total) => $t('cloudpivot.list.pc.Total', { num: totalPage })
          "
          :total="totalPage"
          showQuickJumper
          showSizeChanger
          @change="pageChange"
          @showSizeChange="pageSizeChange"
        />
      </div>
    </div>

    <PageNoData
      v-if="totalPage === 0"
      :isShowNoData="true"
      type="show"
      :tipText="$t('cloudpivot.list.pc.NoData')"
      style="margin: 130px 0 150px"
    />

    <PageNoData
      v-else-if="searchPage === 0"
      :isShowNoData="true"
      type="search"
      :tipText="$t('cloudpivot.list.pc.NoData')"
      style="margin: 130px 0 150px"
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { listApi } from '../../../../../api';
import common from '../../../../../common/pc';
import SmartSearch from './smart-search.vue';

const UserModule = namespace('System/User');

import { Table, Input, Progress, Pagination } from '@h3/antd-vue';

import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

export enum statusEnum {
  RUN = '生成中',
  END = '生成成功',
  INIT = '排队中',
  FAIL = '生成失败',
}

@Component({
  name: 'ExportTaskList',
  components: {
    SmartSearch,
    PageNoData: common.components.PageNoData,
    ATable: Table,
    InputSearch,
    AProgress: Progress,
    APagination: Pagination,
  },
})
export default class ExportTaskList extends Vue {
  @Prop() showList!: boolean;

  statusFile: any = {
    RUN: statusEnum.RUN,
    END: statusEnum.END,
    INIT: statusEnum.INIT,
    FAIL: statusEnum.FAIL,
  };

  statusFileIcon: any = {
    RUN: 'h-icon-all-loading-o',
    END: 'h-icon-all-flow-pass',
    INIT: 'h-icon-all-symbol_Timeselector',
    FAIL: 'h-icon-all-flow-cancel',
  };

  dataSource = [];

  columns: any = [
    // 序号
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      scopedSlots: { customRender: 'index' },
      width: 50,
      key: 'index',
      align: 'center',
    },
    //文件名称
    {
      dataIndex: 'refId',
      slots: { title: 'refId' },
      scopedSlots: { customRender: 'refId' },
      key: 'refId',
    },
    //文件大小
    {
      dataIndex: 'fileSize',
      slots: { title: 'fileSize' },
      scopedSlots: { customRender: 'fileSize' },
      key: 'fileSize',
      width: 88,
    },
    // 模型名称
    {
      dataIndex: 'schemaName',
      slots: { title: 'schemaName' },
      scopedSlots: { customRender: 'schemaName' },
      key: 'schemaName',
      width: 88,
    },
    //导出时间
    {
      dataIndex: 'endTime',
      slots: { title: 'endTime' },
      scopedSlots: { customRender: 'endTime' },
      key: 'endTime',
      width: 174,
    },
    // 操作
    {
      dataIndex: 'id',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'id' },
      key: 'id',
      width: 88,
      align: 'left',
    },
  ];

  statusList = [
    { id: 'END', name: '生成成功' },
    { id: 'FAIL', name: '生成失败' },
    { id: 'INIT', name: '排队中' },
    {
      id: 'RUN',
      name: '生成中',
    },
  ];

  totalPage: number = 0;

  searchPage: number = 0;

  pageSizeOptions: Array<string> = ['10', '20', '50', '100'];

  params = {
    page: 0,
    size: 20,
    name: '',
  };

  created(): void {
    this.getTaskList();
  }

  @Watch('showList')
  changeShowList(val) {
    if (val) {
      this.getTaskList();
    }
    this.resetParams();
  }

  async deleteRecord(id) {
    const res = await listApi.deleteExportTaskList({ id: id });
    if (res.errcode === 0) {
      this.$message.success('删除成功');
      this.getTaskList();
    } else {
      (this as any).$message.error(res.errmsg);
    }
  }

  resetParams() {
    this.params.name = '';
    this.getTaskList();
  }

  query() {
    this.params.page = 0;
    this.getTaskList();
  }

  async handleUploadFile(id: string) {
    this.$emit('downLoadExportFile', id);
  }

  getFileSize(fileSize) {
    let temp: number = 0;
    let unit: string = 'kb';
    if (fileSize < Math.pow(1024, 2)) {
      temp = fileSize / 1024;
      unit = 'KB';
    } else if (fileSize < Math.pow(1024, 3)) {
      temp = fileSize / Math.pow(1024, 2);
      unit = 'MB';
    } else if (fileSize < Math.pow(1024, 4)) {
      temp = fileSize / Math.pow(1024, 3);
      unit = 'GB';
    } else {
      //Else Empty block statement
    }

    if (temp) {
      return temp.toFixed(2) + unit;
    } else {
      return temp;
    }
  }

  async getTaskList() {
    const params = {
      name: this.params.name,
      page: this.params.page,
      size: this.params.size,
    };
    const res = await listApi.getExportTaskList(params);
    if (res.errcode === 0) {
      res.data.content.forEach((item: any, index: number) => {
        item.fileSize = this.getFileSize(item.fileSize);
        item.index = index + 1 + params.page * params.size;
      });
      if (this.params.name) {
        this.searchPage = res.data.totalElements;
      } else {
        this.totalPage = res.data.totalElements;
        this.searchPage = res.data.totalElements;
      }
      this.dataSource = res.data.content;
    }
  }

  // 分页 page change 回调
  pageChange(page: number, pageSize: number) {
    this.params.page = page - 1;
    this.params.size = pageSize;
    this.getTaskList();
  }

  /**
   * 修改分页大小
   */
  pageSizeChange(current: number, pageSize: number) {
    this.params.page = 0;
    this.params.size = pageSize;
    this.getTaskList();
  }
}
</script>
<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
/deep/.page-no-data {
  padding: 105px 0px 188px !important;
  margin: unset !important;
  img {
    width: 163px;
    height: 163px;
  }
}
.export__content {
  /deep/.ant-table-small {
    border-radius: 2px;
    .ant-table-header {
      border-radius: 2px 2px 0 0 !important;
    }
    .ant-table-body {
      border-radius: 0 0 2px 2px !important;
      overflow-y: overlay !important;
    }
  }
  /deep/.ant-table-thead {
    background: #f8f8fb;
  }
}
.export__footer {
  float: right;
  padding: 13px 0;
  margin-right: 24px;
  /deep/.ant-pagination > li {
    border-radius: 2px;
    a,
    div,
    input {
      border-radius: 2px;
    }
    .ant-select-arrow {
      right: 7px;
    }
  }
}

.search {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  .ant-input-affix-wrapper {
    width: 212px;
  }
}

.file-status-icon {
  span {
    font-size: 14px;
    margin-right: 5px;
  }

  .END {
    color: #00c293;
  }

  .RUN {
    color: #2970ff;
  }

  .INIT {
    color: #faad14;
  }

  .FAIL {
    color: #f4454e;
  }
}

.clearfix {
  padding-bottom: 24px;
}

.clearfix:after {
  clear: both;
}
.biz-log__link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  > span {
    margin-left: 5px;
    font-size: 13px;
    color: @highlightColor;
    cursor: pointer;
  }
}

.ant-table-header.ant-table-hide-scrollbar {
  overflow: auto !important;
}

.ant-table-row-cell-break-word {
  padding: 12px 12px;
}
</style>

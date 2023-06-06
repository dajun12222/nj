<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="transfer-history">
    <div class="history-filter">
      <smart-search @reset="resetParams" @search="query(true)">
        <div slot="search" class="filter-left">
          <div class="query-item">
            <span class="item-laber"> 处理人： </span>
            <a-input
              v-model="params.processUserName"
              class="item-body"
              placeholder="请输入"
            />
          </div>
          <div class="query-item">
            <span class="item-laber"> 处理时间： </span>
            <a-range-picker
              v-model="params.processTime"
              class="item-body date-picker"
              format="YYYY-MM-DD"
              :placeholder="['开始时间', '结束时间']"
            />
          </div>
          <div class="query-item">
            <span class="item-laber"> 交接人姓名： </span>
            <a-input
              v-model="params.sourceUserName"
              class="item-body"
              placeholder="请输入"
            />
          </div>
          <div class="query-item">
            <span class="item-laber"> 交接类型： </span>
            <a-select
              v-model="params.workTransferType"
              class="item-body"
              :style="{ '--placeholder': '\'请选择\'' }"
              :class="{ 'show-placeholder': !params.workTransferType }"
              allowClear
            >
              <a-select-option key="onTheJob" value="WORK_ITEM">
                待办任务
              </a-select-option>
              <a-select-option key="pendingHandover" value="BUSINESS_DATA">
                应用数据
              </a-select-option>
              <a-select-option key="resign" value="ROLE">
                角色
              </a-select-option>
            </a-select>
          </div>
        </div>
      </smart-search>
    </div>
    <div class="history-table">
      <div class="table" :class="!historyTotal ? 'no-data' : ''">
        <a-table
          class="table-history-list table-user-list"
          :columns="historyColumns"
          :dataSource="transferHistoryData"
          :scroll="{ x: '1085px', y: 'calc(100vh - 278px)' }"
          :pagination="false"
          :rowKey="(record) => record.id"
        >
          <template slot="processUserName" slot-scope="text">
            <a-tooltip v-if="text" placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span>{{ text }}</span>
            </a-tooltip>
            <span v-else>--</span>
          </template>
          <template slot="sourceUserName" slot-scope="text">
            <a-tooltip v-if="text" placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span>{{ text }}</span>
            </a-tooltip>
            <span v-else>--</span>
          </template>
          <template slot="sourceUserDeptName" slot-scope="text">
            <a-tooltip v-if="text" placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span>{{ text }}</span>
            </a-tooltip>
            <span v-else>--</span>
          </template>
          <template
            slot="workTransferType"
            slot-scope="text"
            @click.stop="() => {}"
          >
            <span>{{
              (dataSourceType[text] && dataSourceType[text].label) || '--'
            }}</span>
          </template>
          <template slot="receiveUserName" slot-scope="text">
            <a-tooltip v-if="text" placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span>{{ text }}</span>
            </a-tooltip>
            <span v-else>--</span>
          </template>
          <template slot="receiveUserDeptName" slot-scope="text">
            <a-tooltip v-if="text" placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span>{{ text }}</span>
            </a-tooltip>
            <span v-else>--</span>
          </template>
          <template
            slot="operation"
            slot-scope="text, record"
            @click.stop="() => {}"
          >
            <span class="operation">
              <i @click.self.stop="showModel(record)">查看</i>
            </span>
          </template>
        </a-table>
      </div>
      <div v-show="!historyTotal" class="empty-box">
        <div>
          <img class="user-empty" src="../../assets/images/userEmpty.png" />
          <div>暂无数据</div>
        </div>
      </div>
      <div v-if="historyTotal" class="footer">
        <a-pagination
          :current="curPage"
          :total="historyTotal"
          :showTotal="(historyTotal) => `共${historyTotal}条`"
          :pageSize="pageSize"
          :pageSizeOptions="pageSizeOptions"
          showSizeChanger
          showQuickJumper
          @change="onPaginationChange"
          @showSizeChange="onSizeChange"
        />
      </div>
    </div>

    <a-drawer
      title="交接详情"
      width="850"
      placement="right"
      :closable="true"
      :visible="visible"
      wrapClassName="transfer-history-drawer"
      :destroyOnClose="true"
      @close="onClose"
    >
      <TransferDetail :recordValue="recordValue" />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import SmartSearch from '@/components/global/smart-search.vue';
import common from 'cloudpivot/common/pc';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import {
  DatePicker,
  Drawer,
  Input,
  Pagination,
  Select,
  Table,
  Tooltip,
} from '@h3/antd-vue';
import axios from 'axios';
import moment from 'moment';
import { Component, Vue } from 'vue-property-decorator';
import TransferDetail from '../../components/organization/taskTransfer/transfer-detail.vue';

@Component({
  name: 'TransferHistory',
  components: {
    RoleSelect: common.components.RoleSelect,
    AInput: Input,
    ATable: Table,
    APagination: Pagination,
    SmartSearch,
    StaffSelector,
    ADrawer: Drawer,
    TransferDetail,
    ARangePicker: DatePicker.RangePicker,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATooltip: Tooltip,
  },
})
export default class TransferHistory extends Vue {
  historyTotal: number = 0;

  historyColumns: any = [
    {
      width: 70,
      dataIndex: 'index',
      title: '序号',
      align: 'center',
    },
    {
      width: '10%',
      dataIndex: 'processUserName',
      title: '处理人',
      scopedSlots: { customRender: 'processUserName' },
    },
    {
      width: '15%',
      dataIndex: 'processTime',
      title: '处理时间',
      scopedSlots: { customRender: 'processTime' },
    },
    {
      width: '10%',
      dataIndex: 'sourceUserName',
      title: '姓名',
      scopedSlots: { customRender: 'sourceUserName' },
    },
    {
      width: '10%',
      dataIndex: 'sourceUserDeptName',
      title: '部门',
      scopedSlots: { customRender: 'sourceUserDeptName' },
    },
    {
      width: '10%',
      dataIndex: 'workTransferType',
      title: '交接类型',
      scopedSlots: { customRender: 'workTransferType' },
    },
    {
      width: '10%',
      dataIndex: 'transferSize',
      title: '交接数',
      scopedSlots: { customRender: 'transferSize' },
    },
    {
      width: '10%',
      dataIndex: 'receiveUserName',
      title: '接收人',
      scopedSlots: { customRender: 'receiveUserName' },
    },
    {
      width: '10%',
      dataIndex: 'receiveUserDeptName',
      title: '接收人部门',
      scopedSlots: { customRender: 'receiveUserDeptName' },
    },
    {
      dataIndex: 'operation',
      title: '操作',
      scopedSlots: { customRender: 'operation' },
    },
  ];

  dataSourceType: any = {
    WORK_ITEM: {
      label: '待办任务',
      val: 1,
    },
    BUSINESS_DATA: {
      label: '应用数据',
      val: 2,
    },
    ROLE: {
      label: '角色',
      val: 3,
    },
  };

  transferHistoryData: any[] = [];

  staffSelectorOpts = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
  };

  keepRolesList: any = [{ code: 'SYS_2000000' }, { code: 'SYS_1000000' }];

  codeProp: string = 'code';

  params: any = {
    processUserName: '',
    processTime: [null, null],
    sourceUserName: '',
    workTransferType: '',
  };

  pageSize = 20;

  curPage: number = 1;

  pageSizeOptions: string[] = ['10', '20', '50', '100', '200', '300', '500'];

  get roleParams() {
    // if (this.userType === 1) {return {}} ;
    // // 新增人员的时候需要过滤主管角色
    return { roleType: 'SYS' };
  }

  mounted() {
    this.query();
    // this.initData();
  }

  selectRole(value: any[]) {
    if (!value || !value.length) {
      this.params.roleIds = [];
      return;
    }
    this.params.roleIds = value.map((role: any) => {
      return role.id;
    });
  }

  resetParams() {
    this.params = {
      userName: '',
      department: [],
      roleIds: [],
    };
    this.query(true);
  }

  async query(query?: boolean) {
    console.log(this.params);
    if (query) {
      this.curPage = 1;
    }
    const params = {
      processUserName: this.params.processUserName || '',
      processTimeBegin:
        (this.params.processTime[0] &&
          moment(this.params.processTime[0]).format('YYYY-MM-DD')) ||
        null,
      processTimeEnd:
        (this.params.processTime[1] &&
          moment(this.params.processTime[1]).format('YYYY-MM-DD')) ||
        (this.params.processTime[0] &&
          moment(this.params.processTime[0]).format('YYYY-MM-DD')) ||
        null,
      sourceUserName: this.params.sourceUserName || '',
      workTransferType: this.params.workTransferType || '',
      pageNumber: this.curPage - 1 || 0,
      pageSize: this.pageSize || 20,
    };
    const res: any = await axios.post(
      '/api/organization/user/transfer/record',
      params,
    );
    if (res.data && res.errcode === 0) {
      this.initData(res.data);
    } else {
      this.$message.error(res.errmsg || res.message);
    }
  }

  initData(resData: any) {
    this.transferHistoryData = [...resData.content];
    this.historyTotal = resData.totalElements;
    const itemSize =
      this.historyTotal > this.pageSize
        ? this.curPage * this.pageSize > this.historyTotal
          ? this.historyTotal - (this.curPage - 1) * this.pageSize
          : this.pageSize
        : this.historyTotal;
    console.log(itemSize);
    for (let i = 0; i < itemSize; i++) {
      this.transferHistoryData[i].index =
        i + 1 + (this.curPage - 1) * this.pageSize;
    }
  }

  reloadHandoverList() {
    this.query();
  }

  visible: boolean = false;

  recordValue: string = '';

  showModel(val: any) {
    this.visible = true;
    this.recordValue = val;
  }

  onClose() {
    this.visible = false;
  }

  onSizeChange(current, size) {
    this.curPage = 1;
    this.pageSize = size;
    this.query();
  }

  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.query();
  }
}
</script>
<style lang="less" scoped>
@import '../../styles/table.less';
.transfer-history {
  height: 100%;
  .history-filter {
    margin-left: -23px;
    /deep/.smart-search {
      > div {
        padding: 0 24px 8px;
        box-shadow: 0px 0px 0px 0px rgb(255 255 255),
          0px 4px 8px 0px rgba(0, 0, 0, 0.2);
        border-radius: 0px 0px 4px 4px;
        &.collapsed {
          padding-bottom: 0px;
          box-shadow: unset;
          border-radius: unset;
        }
      }
    }
    .filter-left {
      width: 100%;
      .query-item {
        display: flex;
        margin-right: 24px;
        margin-bottom: 16px;
        float: left;
        .item-laber {
          white-space: nowrap;
          margin-top: 5px;
          height: 22px;
          font-size: 13px;
          font-weight: 500;
          color: #111218;
          line-height: 22px;
        }
        .item-body {
          width: 216px;
          height: 32px;
          /deep/.h3-organization__label,
          /deep/.role-selector__input {
            height: 32px;
          }
        }
      }
    }
  }
  .history-table {
    padding-right: 24px;
    padding-top: 40px;
    height: calc(100% - 32px);
    display: flex;
    flex-flow: column;
    .table {
      height: calc(100% - 48px);
      &.no-data {
        height: unset;
        margin-top: unset;
      }
      .table-history-list {
        /deep/.ant-table-placeholder {
          display: none;
        }
      }
    }
    .empty-box {
      writing-mode: vertical-lr;
      height: 100%;
      > div {
        writing-mode: horizontal-tb;
        text-align: center;
        margin: auto 0px;
        width: 100%;
        .user-empty {
          margin: 0px auto;
          // margin-top: 150px;
        }
      }
    }
    .footer {
      height: 48px;
      text-align: right;
      padding: 16px 16px;
    }
  }
  .show-placeholder {
    position: relative;
    &::after {
      content: var(--placeholder);
      font-size: 14px;
      color: #bfbfbf;
      left: 11px;
      top: 5px;
      position: absolute;
    }
  }
}
</style>
<style>
.ant-table-body::-webkit-scrollbar {
  width: 0 !important;
}
</style>

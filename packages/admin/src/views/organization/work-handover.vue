<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="work-handover">
    <a-tabs
      :activeKey="activeKey"
      class="handover-tabs user-tabs"
      @onChange="changeTab"
      @tabClick="changeTab"
    >
      <a-tab-pane key="1" class="handover-tab">
        <template slot="tab">
          <div class="tab">
            <span class="handover-tab-title">{{
              $t('languages.WorkHandover')
            }}</span>
          </div>
        </template>

        <div class="handover-filter">
          <smart-search @reset="resetParams" @search="query(true)">
            <div slot="search" class="filter-left">
              <div class="query-item">
                <span class="item-laber"> 姓名： </span>
                <a-input
                  v-model="params.userName"
                  class="item-body"
                  placeholder="请输入"
                />
              </div>
              <div class="query-item">
                <span class="item-laber"> 部门： </span>
                <staff-selector
                  v-model="params.department"
                  class="item-body"
                  placeholder="请选择"
                  :options="staffSelectorOpts"
                  :onlyForm="true"
                  :visiblePart="true"
                />
              </div>
              <div class="query-item">
                <span class="item-laber"> 角色： </span>
                <role-select
                  class="item-body"
                  :defaultValue="params.roleIds"
                  :showParent="true"
                  :expandAll="true"
                  defaultValueKey="id"
                  :params="roleParams"
                  :multiple="false"
                  :showAuthority="true"
                  :filterDefaultRoleGroup="true"
                  :keepRoles="keepRolesList"
                  :filterKey="codeProp"
                  @select="selectRole"
                />
              </div>
              <div class="query-item">
                <span class="item-laber"> 人员状态： </span>
                <a-select
                  v-model="params.userWorkStatus"
                  class="item-body"
                  :style="{ '--placeholder': '\'请选择\'' }"
                  :class="{ 'show-placeholder': !params.userWorkStatus }"
                  allowClear
                >
                  <a-select-option key="onTheJob" value="NORMAL">
                    在职
                  </a-select-option>
                  <a-select-option
                    key="pendingHandover"
                    value="WAITING_TRANSFER"
                  >
                    离职待交接
                  </a-select-option>
                  <a-select-option key="resign" value="DIMISSION">
                    离职
                  </a-select-option>
                </a-select>
              </div>
            </div>
          </smart-search>
        </div>
        <div class="handover-table">
          <div
            class="table"
            :class="{ 'no-data': !handoverTotal, 'no-filter': noFilter }"
          >
            <a-table
              class="table-handover-list table-user-list"
              :columns="handoverColumns"
              :dataSource="handoverData"
              :scroll="{ x: '1087px', y: 'calc(100vh - 278px)' }"
              :pagination="false"
              :rowKey="(record) => record.id"
            >
              <template slot="userName" slot-scope="text">
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>{{ text }}</span>
                  </template>
                  <span>{{ text }}</span>
                </a-tooltip>
              </template>
              <template slot="userDeptNameList" slot-scope="text">
                <a-tooltip placement="top">
                  <template slot="title">
                    <span>{{ text.join(';') }}</span>
                  </template>
                  <span>{{ text.join(';') }}</span>
                </a-tooltip>
              </template>
              <template slot="userWorkStatus" slot-scope="text">
                {{ userStatusType[text] && userStatusType[text].label }}
              </template>
              <template
                slot="operation"
                slot-scope="text, record"
                @click.stop="() => {}"
              >
                <span class="operation">
                  <i @click.self.stop="showModel(record)">工作交接</i>
                </span>
              </template>
            </a-table>
          </div>
          <div v-show="!handoverTotal && !noFilter" class="empty-box">
            <div>
              <img class="user-empty" src="../../assets/images/userEmpty.png" />
              <div>暂无数据</div>
            </div>
          </div>
          <div v-show="noFilter" class="empty-box">
            <div>
              <img class="user-empty" src="../../assets/images/userEmpty.png" />
              <div>数据量过多，请设置查询条件进行筛选</div>
            </div>
          </div>
          <div v-if="handoverTotal && !noFilter" class="footer">
            <a-pagination
              :current="curPage"
              :total="handoverTotal"
              :showTotal="(handoverTotal) => `共${handoverTotal}条`"
              :pageSize="pageSize"
              :pageSizeOptions="pageSizeOptions"
              showSizeChanger
              showQuickJumper
              @change="onPaginationChange"
              @showSizeChange="onSizeChange"
            />
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane v-if="isOpenHistoryTab" key="2" class="history-tab">
        <template slot="tab">
          <div class="tab">
            <span class="history-tab-title">{{
              $t('languages.HistoryRec')
            }}</span>
            <span class="icon aufontAll close-tab" @click="closeHistoryTab">&#xe996;</span>
          </div>
        </template>
        <TransferHistory />
      </a-tab-pane>
    </a-tabs>
    <div
      v-show="!isOpenHistoryTab"
      class="open-history"
      @click="openHistoryTab"
    >
      {{ $t('languages.HistoryRec') }}
    </div>

    <a-drawer
      :title="$t('languages.TaskTransfer.TaskTransfer', { name: userName })"
      width="850"
      placement="right"
      :closable="true"
      :visible="visible"
      wrapClassName="task-transfer-drawer"
      :destroyOnClose="true"
      @close="onClose"
    >
      <TaskTransfer
        :curTab="curTab"
        :corpid="corpid"
        :userid="userid"
        @reloadTree="reloadHandoverList"
      />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import SmartSearch from '@/components/global/smart-search.vue';
import common from 'cloudpivot/common/pc';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import {
  Button,
  Drawer,
  Input,
  Pagination,
  Select,
  Table,
  Tabs,
  Tooltip,
} from '@h3/antd-vue';
import axios from 'axios';
import { Component, Vue, Watch } from 'vue-property-decorator';
import TaskTransfer from '../../components/organization/taskTransfer/index.vue';
import TransferHistory from './transfer-history.vue';

@Component({
  name: 'WorkHandover',
  components: {
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    RoleSelect: common.components.RoleSelect,
    AInput: Input,
    ATable: Table,
    APagination: Pagination,
    TransferHistory,
    SmartSearch,
    StaffSelector,
    ADrawer: Drawer,
    TaskTransfer,
    ATooltip: Tooltip,
  },
})
export default class WorkHandover extends Vue {
  isOpenHistoryTab: boolean = false;

  activeKey: string = '1';

  handoverTotal: number = 0;

  handoverColumns: any[] = [
    {
      width: 80,
      dataIndex: 'index',
      title: '序号',
      align: 'center',
    },
    {
      dataIndex: 'userName',
      title: '用户姓名',
      scopedSlots: { customRender: 'userName' },
    },
    {
      dataIndex: 'userDeptNameList',
      title: '部门',
      scopedSlots: { customRender: 'userDeptNameList' },
    },
    {
      dataIndex: 'userWorkStatus',
      title: '人员状态',
      scopedSlots: { customRender: 'userWorkStatus' },
    },
    {
      dataIndex: 'roleSize',
      title: '角色',
      scopedSlots: { customRender: 'roleSize' },
    },
    {
      dataIndex: 'workItemSize',
      title: '任务',
      scopedSlots: { customRender: 'workItemSize' },
    },
    {
      dataIndex: 'formDataSize',
      title: '应用数据',
      scopedSlots: { customRender: 'formDataSize' },
    },
    {
      dataIndex: 'operation',
      title: '操作',
      scopedSlots: { customRender: 'operation' },
    },
  ];

  userStatusType: any = {
    NORMAL: {
      label: '在职',
      val: 1,
    },
    WAITING_TRANSFER: {
      label: '离职待交接',
      val: 2,
    },
    DIMISSION: {
      label: '离职',
      val: 3,
    },
  };

  handoverData: any[] = [];

  staffSelectorOpts = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    appManagerFilter: true,
  };

  keepRolesList: any = [{ code: 'SYS_2000000' }, { code: 'SYS_1000000' }];

  codeProp: string = 'code';

  params: any = {
    userName: '',
    department: [],
    roleIds: [],
    userWorkStatus: '',
  };

  defaultParams: any = {
    userName: '',
    department: [],
    roleIds: [],
    userWorkStatus: '',
  };

  pageSize = 20;

  curPage: number = 1;

  pageSizeOptions: string[] = ['10', '20', '50', '100', '200', '300', '500'];

  noFilter: boolean = false;

  isStationMessageTo: boolean = false;

  get roleParams() {
    // if (this.userType === 1) {return {}} ;
    // // 新增人员的时候需要过滤主管角色
    return { roleType: 'SYS' };
  }

  mounted() {
    // this.query();
    if (!this.isStationMessageTo) {
      this.initFilterCondition();
    }
    // this.initData();
  }

  @Watch('$route', {
    deep: true,
    immediate: true,
  })
  on$routeChange() {
    console.log('this.$route.query.userName', this.$route.query.userName);
    if (this.$route.query.userName) {
      this.isStationMessageTo = true;
      this.params.userName = this.$route.query.userName;
      this.params.department = [];
      this.query();
    }
  }

  async initFilterCondition() {
    const params = {
      deptIds: '',
      filterType: 'admin',
      sourceType: '',
      corpId: '',
      excludeCorpId: '',
      selectUserIds: '',
    };

    const res: any = await axios.get('/api/organization/department/tree', {
      params,
    });
    if (!res.errcode && res.data) {
      this.defaultParams.department.push(
        res.data.departmentList && res.data.departmentList[0],
      );
      this.params.department.push(
        res.data.departmentList && res.data.departmentList[0],
      );
    }
    this.query();
    console.log(res, '--------FFF');
  }

  changeTab(key: string) {
    this.activeKey = key;
    if (!this.isOpenHistoryTab) {
      this.activeKey = '1';
    }
  }

  closeHistoryTab() {
    this.activeKey = '1';
    this.isOpenHistoryTab = false;
  }

  openHistoryTab() {
    this.isOpenHistoryTab = true;
    this.activeKey = '2';
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
      status: '',
    };
    this.params.department.push(...this.defaultParams.department);
    this.query(true);
  }

  async query(query?: boolean) {
    if (
      !this.params.userName &&
      !this.params.department.length &&
      !this.params.roleIds.length &&
      !this.params.userWorkStatus
    ) {
      this.noFilter = true;
    } else {
      this.noFilter = false;
    }

    if (query) {
      this.curPage = 1;
    }

    const params = {
      userName: this.params.userName || '',
      deptId:
        (this.params.department &&
          this.params.department[0] &&
          this.params.department[0].id) ||
        '',
      roleId: (this.params.roleIds && this.params.roleIds[0]) || '',
      userWorkStatus: this.params.userWorkStatus || '',
      pageNumber: this.curPage - 1 || 0,
      pageSize: this.pageSize || 20,
    };
    const res: any = await axios.post(
      '/api/organization/user/transfer/info',
      params,
    );
    if (res.data && res.errcode === 0) {
      this.initData(res.data);
    } else {
      this.$message.error(res.errmsg || res.message);
    }
  }

  initData(resData: any) {
    // const resData = JSON.parse(this.testData)
    this.handoverData = [...resData.content];
    this.handoverTotal = resData.totalElements;
    const itemSize =
      this.handoverTotal > this.pageSize
        ? this.curPage * this.pageSize > this.handoverTotal
          ? this.handoverTotal - (this.curPage - 1) * this.pageSize
          : this.pageSize
        : this.handoverTotal;
    console.log(itemSize);
    for (let i = 0; i < itemSize; i++) {
      this.handoverData[i].index = i + 1 + (this.curPage - 1) * this.pageSize;
    }
  }

  reloadHandoverList() {
    this.query();
  }

  visible: boolean = false;

  userid: string = '';

  corpid: string = '';

  userName: string = '';

  curTab: boolean = false;

  showModel(val: any) {
    this.visible = true;
    this.userid = val.userId;
    this.corpid = val.corpId;
    if (val.userName) {
      this.userName = val.userName;
    }
    if (val.userWorkStatus === 'NORMAL') {
      this.curTab = true;
    } else {
      this.curTab = false;
    }
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
@import '../../styles/tab.less';
.work-handover {
  position: relative;
  height: 100%;

  .handover-tabs {
    height: 100%;
    /deep/.ant-tabs-bar {
      padding-left: 24px;
      margin: 0;
    }
    .close-tab {
      position: absolute;
      top: 13px;
      right: -17px;
      font-size: 12px;
      color: rgba(17, 18, 24, 0.25);
      cursor: pointer;
    }
    /deep/.ant-tabs-content {
      height: calc(100% - 60px);
    }
    .handover-tab {
      padding-left: 24px;
      .handover-filter {
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
              border-bottom: 1px solid #eee;
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
      .handover-table {
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
          &.no-filter {
            height: unset;
            margin-top: unset;
            /deep/.ant-table-tbody {
              display: none;
            }
          }
          .table-handover-list {
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
          /deep/.ant-pagination {
            margin: -8px -40px 0 -40px;
            padding: 8px 40px 0 40px;
            position: relative;
            &::before {
              content: '';
              border-top: thin solid #eee;
              height: 0px;
              width: 100%;
              position: absolute;
              left: 0;
              top: 0;
            }
          }
        }
      }
    }
    .history-tab {
      padding-left: 24px;
    }
  }
  .open-history {
    top: 15px;
    right: 24px;
    position: absolute;
    height: 17px;
    font-size: 14px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    line-height: 20px;
    cursor: pointer;
    &:hover {
      color: #2970ff;
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

  /deep/.ant-table-body::-webkit-scrollbar {
    width: 0 !important;
  }

  /deep/.ant-table-tbody > tr:last-child > td {
    border-bottom: unset;
  }
}
</style>
<style lang="less">
.task-transfer-drawer {
  //  z-index: 1051;
  .ant-drawer-body {
    padding: 0px;
    overflow-x: hidden;
  }
}
</style>

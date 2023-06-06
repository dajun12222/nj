<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="org-synchronize-wrapper">
    <div class="org-tabs">
      <a-tabs
        class="user-tabs"
        defaultActiveKey="1"
        :animated="false"
        @change="toggleTab"
      >
        <a-tab-pane key="1" tab="组织同步">
          <div class="org-synchronize">
            <img src="../../assets/images/synchronize.png" alt />
            <div v-if="!isCloudPivot" @click="startOrgsync">
              <span>{{ $t('languages.SynchronizeNow') }}</span>
            </div>

            <orgsync-form
              ref="orgsync"
              v-model="orgsyncFormVisible"
              @handleClose="handleClose"
            />
          </div>
        </a-tab-pane>

        <a-tab-pane key="2" tab="同步日志">
          <smart-search @reset="resetParams" @search="onSearch">
            <div slot="search">
              <div class="header__item">
                <span>姓名/账号:</span>
                <a-input
                  v-model="dataRuleName"
                  class="w"
                  :placeholder="'请输入姓名/账号'"
                />
              </div>

              <div class="header__item">
                <span>执行状态:</span>
                <a-select
                  v-model="executState"
                  showSearch
                  class="w"
                  placeholder="请选择"
                >
                  <a-select-option
                    v-for="(item, index) in executStateList"
                    :key="index"
                    :value="item.code"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </div>

              <div class="header__item">
                <span>执行时间:</span>
                <a-range-picker
                  v-model="executTime"
                  class="w"
                  :placeholder="['开始时间', '结束时间']"
                />
              </div>
            </div>
          </smart-search>
          <div class="log-table">
            <a-table
              class="table-user-list"
              :columns="tableHead"
              :pagination="false"
              :loading="loading"
              :scroll="{ y: scrollY }"
              :dataSource="dataSource"
              :rowKey="(record) => record.id"
            >
              <span slot="customIndex" class="title">序列</span>
              <span slot="customName" class="title">姓名</span>
              <span slot="customAccount" class="title">用户账号</span>
              <span slot="customStatus" class="title">执行状态</span>
              <span slot="customStartTime" class="title">开始时间</span>
              <span slot="customEndTime" class="title">结束时间</span>
              <span slot="customAction" class="title">操作</span>
              <span slot="action" slot-scope="text, record" class="operation">
                <i class="detail" @click="openLogDetail(record.id)">打开详情</i>
              </span>
              <span slot="customStatusOpen" slot-scope="text, record"><i>
                  <a
                    class="open-log-detail"
                    href="javascript:;"
                    @click="openLogDetail(record.id)"
                    >{{ text }}</a>
                </i>
              </span>
            </a-table>
          </div>

          <div class="log-footer">
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

          <log-detail :id="logId" v-model="isShowLogDetailVisible" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<style lang="less">
.org-synchronize-wrapper {
  .org-tabs {
    .ant-tabs-bar {
      margin: 0;
      padding: 0 23px;
    }

    .header__item {
      height: 32px;
      margin-bottom: 16px;
      margin-right: 24px;
      float: left;
      font-size: 0;
      > span:first-child {
        display: inline-block;
        vertical-align: middle;
        min-width: 4.2em;
        font-size: 13px;
        color: #111218;
        font-weight: 500;
      }
      .w {
        width: 240px;
        margin-left: 8px;
        display: inline-block;
        vertical-align: middle;
      }
    }
  }

  .org-synchronize {
    margin: 99px auto;
    width: 315px;
    text-align: center;
    border-radius: 2px;
    color: #fff;
    & > div {
      margin-top: 22px;
      background-color: @primary-color;
      border-radius: 2px;
      cursor: pointer;
      span {
        font-size: 16px;
        line-height: 48px;
        color: #fff;
        padding-left: 4px;
      }
    }
    & > div.loading-btn {
      opacity: 0.5;
      filter: Alpha(opacity=50);
      -moz-opacity: 0.1;
      cursor: not-allowed;
    }
    img {
      width: 250px;
    }
  }

  .log-table {
    padding: 40px 24px 0px 24px;
    .open-log-detail {
      font-style: normal;
    }
  }

  .log-footer {
    border-top: 1px solid rgba(232, 232, 232, 1);
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
  &__link {
    color: @primary-color;
  }
  /deep/.ant-pagination-total-text {
    margin-right: @base4-padding-md;
  }
}
</style>
<style lang="less" scoped>
@import '../../styles/tab.less';
@import '../../styles/table.less';
</style>
<script lang="ts">
import SmartSearch from '@/components/global/smart-search.vue';
import {
  Button,
  Input,
  Pagination,
  Select,
  Table,
  Tabs,
  DatePicker,
} from '@h3/antd-vue';
import moment from 'moment';
import { Component, Vue } from 'vue-property-decorator';
import organizationApi from '../../apis/organization';
import { getNearWork } from '../system/log/data-rule-info/typings/help';
import LogDetail from './import/log-detail.vue'; // 同步组织弹窗
import OrgsyncForm from './import/orgsync-form.vue'; // 同步组织弹窗
interface IexecutState {
  code: number | string | boolean;
  name: string;
}
enum Estate {
  Success = 1,
  Fail = 2,
  All = 0,
}
interface OrgsyncParams {
  /**姓名/账号 */
  name: string;
  /**执行状态 */
  executeStatus: number | string | boolean;
  /**开始时间 */
  startTime: string;
  /**结束时间 */
  endTime: string;
  page: number;
  size: number;
}

@Component({
  name: 'Orgsync',
  components: {
    OrgsyncForm,
    SmartSearch,
    LogDetail,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARangePicker: DatePicker.RangePicker,
    ATable: Table,
    AButton: Button,
    APagination: Pagination,
  },
})
export default class Synchronize extends Vue {
  $message: any;

  orgsyncFormVisible: boolean = false;

  isShowLogDetailVisible: boolean = false;

  loading: boolean = true;

  selectOptions: any = [];

  logId: string = '';

  executStateList: Array<IexecutState> = [
    { code: Estate.All, name: '全部' },
    { code: Estate.Success, name: '成功' },
    { code: Estate.Fail, name: '失败' },
  ];

  executState: Estate = Estate.All;

  executTime: any[] = []; // 执行时间

  dataRuleName: string = ''; // 姓名/账号

  pageSizeOptions: Array<string> = ['10', '20', '50', '100'];

  params: any = {
    page: 0,
    size: 20,
  };

  nextClick = true;

  dataSource = [];

  totalPage: number = 9;

  searchKey: string = '';

  scrollY: number = 600;

  tableHead: Array<object> = [
    {
      dataIndex: 'index',
      slots: { title: 'customIndex' },
      width: '80px',
      align: 'center',
    },
    {
      dataIndex: 'createrName',
      slots: { title: 'customName' },
      scopedSlots: { customRender: 'customStatusOpen' },
      width: '14%',
    },
    {
      dataIndex: 'createrUserName',
      slots: { title: 'customAccount' },
      scopedSlots: { customRender: 'customStatusOpen' },
      width: '14%',
    },
    {
      dataIndex: 'executeStatus',
      slots: { title: 'customStatus' },
      scopedSlots: { customRender: 'customStatusOpen' },
      sorter: (a: any, b: any) =>
        a.executeStatus.length - b.executeStatus.length,
      width: '14%',
    },
    {
      dataIndex: 'startTime',
      slots: { title: 'customStartTime' },
      width: '20%',
    },
    {
      width: '20%',
      dataIndex: 'endTime',
      slots: { title: 'customEndTime' },
    },
    {
      slots: { title: 'customAction' },
      scopedSlots: { customRender: 'action' },
    },
  ];

  get isCloudPivot() {
    // 是否已打开内部维护组织开关
    return this.$store.state.config.cloudPivot;
  }

  /**
   * 打开日志详情
   */
  openLogDetail(id: string) {
    this.isShowLogDetailVisible = true;
    this.logId = id;
  }

  /**
   * 点击立即同步按钮
   */
  async startOrgsync() {
    const orgsync: any = (this as any).$refs.orgsync;
    const syncTaskId: any = (window as any).localStorage.getItem('syncTaskId');
    const orgPartSync: any = (window as any).localStorage.getItem(
      'orgPartSync',
    );
    if (syncTaskId || orgPartSync) {
      return this.$message.warn('正在同步中,请等待同步完成后再操作...');
    }
    console.log(orgsync.syncLoadingStatus, 'orgsync');
    if (this.nextClick) {
      this.orgsyncFormVisible = true;
    }
  }

  /**
   * 切换组织同步与同步日志
   */
  toggleTab(activeKey: string) {
    if (activeKey === '1') {
      return;
    }

    this.params.page = 0;
    this.getLogList();
  }

  handleClose(nextClick: boolean) {
    console.log(nextClick, 'nextClick');
    this.nextClick = nextClick;
  }

  /**
   * 获取同步日志
   */
  async getLogList() {
    this.loading = true;
    const res: any = await organizationApi.getLogList(this.getParams());
    this.loading = false;

    if (res.errcode === 0) {
      this.dataSource = res.data.content;
      this.dataSource.forEach((item: any, index: number) => {
        item.index = index + 1 + this.params.page * this.params.size;
        item.executeStatus = item.executeStatus === 1 ? '成功' : '失败 ';

        Object.entries(item).forEach((data: any) => {
          const [key, value] = data;

          if (typeof value !== 'boolean' && !value) {
            item[key] = '- -';
          }
        });
      });
      this.totalPage = res.data.totalElements;
    }
  }

  // 查询
  onSearch() {
    this.params.page = 0;
    console.log(this.getParams());
    this.getLogList();
  }

  // 重置
  resetParams() {
    const nearWeek = getNearWork();
    this.executTime = [moment(nearWeek[0]), moment(nearWeek[1])];
    this.executState = Estate.All;
    this.dataRuleName = '';
    this.onSearch();
  }

  // 组装查询参数
  getParams(): OrgsyncParams {
    let startTime: string = '';
    let endTime: string = '';
    if (this.executTime.length > 0) {
      startTime = moment(this.executTime[0]).format('YYYY-MM-DD');
      endTime = moment(this.executTime[1]).format('YYYY-MM-DD');
    }
    const param: OrgsyncParams = {
      startTime,
      endTime,
      name: this.dataRuleName,
      executeStatus: this.executState,
      page: this.params.page,
      size: this.params.size,
    };
    return param;
  }

  /**
   * 翻页
   */
  pageChange(page: number, pageSize: number) {
    this.params.page = page - 1;
    this.params.size = pageSize;
    this.getLogList();
  }

  /**
   * 修改分页大小
   */
  pageSizeChange(current: number, pageSize: number) {
    this.params.page = 0;
    this.params.size = pageSize;
    this.getLogList();
  }

  created() {
    (window as any).localStorage.removeItem('syncTaskId');
    (window as any).localStorage.removeItem('orgPartSync');
  }

  mounted() {
    this.scrollY = document.querySelector('body').scrollHeight - 282;
  }
}
</script>

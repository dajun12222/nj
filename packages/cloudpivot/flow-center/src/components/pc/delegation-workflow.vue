<template>
  <div id="DelegationWorkflow" ref="workItem" class="workitem-box">
    <div class="content-top">
      <h2>{{ $t('cloudpivot.flowCenter.pc.delegationFlow') }}</h2>
      <div class="content-top-right-box">
        <a-button :disabled="!deleteDisable" @click="deleteDelegation">
          {{ $t('cloudpivot.flowCenter.pc.delete') }}
        </a-button>
        <a-button type="primary" @click="showDelegationDrawer(0)">
          {{ $t('cloudpivot.flowCenter.pc.add') }}
        </a-button>
      </div>
    </div>

    <PageLoading v-model="isLoading" shadeColor="#F4F6FC" :shadeOpacity="1" />

    <div v-if="isShowTableBox" class="table-box">
      <div ref="table" class="table delegation-workflow">
        <common-table
          :dataSource="tableData"
          :columns="columns"
          :minTableWidth="1060"
        >
          <!-- 序号 -->
          <span
            slot="indexTitle"
            class="index"
            @mouseenter="indexMouseenter"
            @mouseleave="indexMouseleave"
          >
            <a-checkbox
              v-show="showSelectAllBox"
              v-model="isSelectAll"
              :disabled="!tableData.length"
              @change.stop="selectAll"
            />
            <label v-show="!showSelectAllBox && !isSelectAll" class="text">{{
              $t('cloudpivot.flowCenter.pc.orderNuber')
            }}</label>
          </span>
          <span
            slot="index"
            slot-scope="{ text, record }"
            class="index"
            @mouseenter="record.hover = true"
            @mouseleave="record.hover = false"
          >
            <a-checkbox
              v-show="record.hover || record.checked"
              v-model="record.checked"
              @change.stop="onItemCheckboxChange"
            />
            <span v-show="!record.hover && !record.checked" class="text">{{
              text
            }}</span>
          </span>

          <!-- 委托人 -->
          <span slot="trustorNameTitle">{{
            $t('cloudpivot.flowCenter.pc.delegation.client')
          }}</span>
          <template slot="trustorName" slot-scope="{ text, record }">
            <AuthorAvatarInfo
              :item="{
                sourceId: record.trustor,
                imgUrl: record.trustorImgUrl.replace('--', ''),
                sourceName: text,
              }"
            />
          </template>

          <!-- 被委托人 -->
          <span slot="trusteeNameTitle">{{
            $t('cloudpivot.flowCenter.pc.delegation.consignor')
          }}</span>
          <template slot="trusteeName" slot-scope="{ text, record }">
            <AuthorAvatarInfo
              :item="{
                sourceId: record.trustee,
                imgUrl: record.trusteeImgUrl.replace('--', ''),
                sourceName: text,
              }"
            />
          </template>

          <!-- 委托类型 -->
          <span slot="trustTypeTitle">{{
            $t('cloudpivot.flowCenter.pc.delegation.delegateType')
          }}</span>
          <template slot="trustType" slot-scope="{ text, record }">
            <span
              :class="record.isRead ? 'gray text-ellipsis' : 'text-ellipsis'"
              >{{ text }}</span>
          </template>

          <!-- 受托期限 -->
          <span slot="timeRangeTitle">{{
            $t('cloudpivot.flowCenter.pc.delegation.entrustedPeriod')
          }}</span>
          <template slot="timeRange" slot-scope="{ text }">
            <span class="text-ellipsis">{{ text }}</span>
          </template>

          <!-- 操作 -->
          <span slot="operationTitle">{{
            $t('cloudpivot.flowCenter.pc.delegation.operation')
          }}</span>
          <template slot="operation" slot-scope="{ text, record }">
            <!-- <i class="icon aufontAll h-icon-all-edit-o edit" @click="showDelegationDrawer(1, record.id)"></i>
            <i class="icon aufontAll h-icon-all-delete-o delete" @click="deleteDelegation(record)"></i> -->
            <span class="edit" @click="showDelegationDrawer(1, record.id)">{{
              $t('cloudpivot.flowCenter.pc.edit')
            }}</span>
            <span class="delete" @click="deleteDelegation(record)">{{
              $t('cloudpivot.flowCenter.pc.delete')
            }}</span>
          </template>
        </common-table>

        <div class="no-data">
          <PageNoData
            :isShowNoData="isShowNoData"
            :isShowSearchNoData="isShowSearchNoData"
            :tipText="$t('cloudpivot.flowCenter.pc.noContent')"
          />
        </div>
      </div>

      <div class="pagination-box">
        <a-pagination
          :current="curPage"
          :total="total"
          :showTotal="
            (total) => $t('cloudpivot.flowCenter.pc.total', { num: total })
          "
          :pageSize="pageSize"
          :pageSizeOptions="pageSizeOptions"
          showSizeChanger
          showQuickJumper
          @change="onPaginationChange"
          @showSizeChange="onSizeChange"
        />
      </div>

      <common-drawer v-model="isShowDrawer" :data="userInfo" />

      <delegation-drawer
        v-model="isShowDelegationDrawer"
        :type="drawerType"
        :drawerId="drawerId"
        @reloadList="getDelegationWorkflowList"
      />
    </div>

    <div class="load-fail-box">
      <PageLoadFail v-model="isShowLoadFailBox" @refresh="reload" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';

import {
  Button,
  Modal,
  Pagination,
  Icon,
  Tooltip,
  Checkbox,
} from '@h3/antd-vue';

import { mixins } from 'vue-class-component';

import common from '../../../../common/pc';

import { workflowCenterApi } from '../../../../api';

import WorkItemMixin from './mixins/workitem';

import CommonDrawer from './components/modals/drawer.vue';

import DelegationDrawer from './components/delegation-drawer.vue';

import CommonTable from './components/common-table/table.vue';

import AuthorAvatarInfo from '../../../../common/src/components/pc/author-avatar-info/author-avatar-info.vue';

@Component({
  name: 'DelegationWorkflow',
  components: {
    AButton: Button,
    AModal: Modal,
    APagination: Pagination,
    AIcon: Icon,
    ATooltip: Tooltip,
    ACheckbox: Checkbox,
    CommonDrawer,
    DelegationDrawer,
    PageLoading: common.components.PageLoading,
    PageNoData: common.components.PageNoData,
    PageLoadFail: common.components.LoadFail,
    CommonTable,
    AuthorAvatarInfo,
  },
})
export default class DelegationWorkflow extends mixins(WorkItemMixin) {
  /**
   * 单应用集成属性,集成时不显示title
   */
  @Prop({
    default: true,
  })
  showTitle!: boolean;

  /**
   * 单应用集成属性,集成时表格高度
   */
  @Prop() scrollHeight!: number;

  /**
   * 单应用集成属性,单应用appCode
   */
  @Prop() appCode!: string;

  /**
   * 自定义表格的列
   */
  @Prop() tableColumns!: any;

  isShowDelegationDrawer: boolean = false;

  drawerType: number = 0;

  drawerId: string = '';

  isSelectAll: boolean = false;

  showSelectAllBox: boolean = false;

  defaultTableColumns: any = [
    {
      dataIndex: 'index',
      width: 105,
      align: 'center',
      hSlot: 'indexTitle',
      bSlot: 'index',
    },
    {
      dataIndex: 'trustorName',
      width: 185,
      hSlot: 'trustorNameTitle',
      bSlot: 'trustorName',
    },
    {
      dataIndex: 'trusteeName',
      width: 188,
      hSlot: 'trusteeNameTitle',
      bSlot: 'trusteeName',
    },
    {
      dataIndex: 'trustType',
      width: 175,
      hSlot: 'trustTypeTitle',
      bSlot: 'trustType',
    },
    {
      dataIndex: 'timeRange',
      width: 411,
      hSlot: 'timeRangeTitle',
      bSlot: 'timeRange',
    },
    {
      dataIndex: 'operation',
      width: 128,
      hSlot: 'operationTitle',
      bSlot: 'operation',
    },
  ];

  get columns() {
    if (this.tableColumns) {
      return this.tableColumns;
    }
    return this.defaultTableColumns;
  }

  get deleteDisable() {
    return this.tableData.some((d: any) => d.checked);
  }

  mounted() {
    this.getDelegationWorkflowList();
    // window.addEventListener('resize', this.setTableMaxHeight);
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event: any) {
    if (event.source === window) {
      return;
    }
    if (
      event.data.indexOf('/workflow-center/my-read-workitem') !== -1 ||
      event.data.indexOf('%2Fworkflow-center%2Fmy-read-workitem') !== -1
    ) {
      this.getDelegationWorkflowList();
    }
  }

  destroyed() {
    // window.removeEventListener('resize', this.setTableMaxHeight);
    window.removeEventListener('message', this.reloadMessage, false);
  }

  /*
   * show委托抽屉-- 0：新增，1：编辑
   */
  showDelegationDrawer(type: number, id?: any) {
    this.drawerType = type;
    if (id) {
      this.drawerId = id;
    }
    this.isShowDelegationDrawer = true;
  }

  /*
   * 删除委托
   */
  deleteDelegation(record?: any) {
    const vm: any = this;
    const _ids: any = [];
    if (record.id) {
      _ids.push(record.id);
    } else {
      this.tableData.forEach((data: any) => {
        if (data.checked) {
          _ids.push(data.id);
        }
      });
    }
    this.$confirm({
      title: vm.$t('cloudpivot.flowCenter.pc.deleteTrustTips1').toString(),
      okText: vm.$t('cloudpivot.flowCenter.pc.ok').toString(),
      okType: 'danger',
      icon: () =>
        vm.$createElement('a-icon', {
          props: {
            type: 'question-circle',
            theme: 'filled',
          },
        }),
      cancelText: vm.$t('cloudpivot.flowCenter.pc.cancel').toString(),
      content: vm.$t('cloudpivot.flowCenter.pc.deleteTrustTips2').toString(),
      onOk() {
        const params = {
          workflowTrustRuleIds: _ids.join(','),
        };
        workflowCenterApi.deleteWorkflowTrust(params).then((res: any) => {
          if (res.errcode) {
            vm.$message.error(
              `${vm.$t('cloudpivot.flowCenter.pc.deleteFailed')}`,
            );
            return;
          }

          vm.$message.success(
            `${vm.$t('cloudpivot.flowCenter.pc.deleteSuccess')}`,
          );
          vm.getDelegationWorkflowList();
        });
      },
    });
  }

  /**
   * 全选
   */
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked;
    if (isChecked) {
      this.tableData.forEach((item: any) => {
        item.checked = true;
      });
    } else {
      this.tableData.forEach((item: any) => {
        item.checked = false;
      });
    }
  }

  /*
   * 当checkbox选择change时事件
   */
  onItemCheckboxChange() {
    const isCheckedItems = this.tableData.filter((d: any) => d.checked);
    if (isCheckedItems.length < this.tableData.length) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
  }

  indexMouseenter() {
    this.showSelectAllBox = true;
  }

  indexMouseleave() {
    this.showSelectAllBox = false;
  }

  // 分页改变
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.getDelegationWorkflowList('pageChange');
  }

  // 分页pageSize改变
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.getDelegationWorkflowList('pageChange');
  }

  // 加载失败重新加载
  reload() {
    this.curPage = 1;
    this.pageSize = 20;

    this.getDelegationWorkflowList();
  }

  // 获取委托列表
  async getDelegationWorkflowList(type?: string) {
    const p = {
      page: this.curPage - 1,
      size: this.pageSize,
    };
    const vm: any = this;

    // 数据处理函数
    this.dataHandler = (data: any) => {
      data.forEach((item: any, index: number) => {
        item.index = index + 1;
        item.key = index;
        item.checked = false;
        item.hover = false;
        item.trustType =
          item.trustType === 0
            ? vm.$t('cloudpivot.flowCenter.pc.delegation.workflowApproval')
            : vm.$t('cloudpivot.flowCenter.pc.delegation.startWorkflow');

        item.timeRange = `${vm.$t('cloudpivot.flowCenter.pc.timeRange', {
          start: item.startTime,
          end: item.endTime,
        })}`;
      });
      return data;
    };

    this.isLoading = true;
    const res: any = await workflowCenterApi.getWorkflowTrustList(p);
    if (res.data && res.data.totalElements === 0) {
      this.isSelectAll = false; // 删除到没有可选项时候用
    }
    this.commonHandler(res, type);
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setLoadAllTxt();
    // this.setTableMaxHeight();
  }
}
</script>
<style lang="less" scoped>
@import './../../../../application/src/components/pc/style/custom-themes';
@import './style/index.less';
/deep/ .workitem-box .table-box {
  .table {
    max-height: calc(100% - 58px);
    /deep/.author {
      font-size: 14px;
    }
    /deep/.common-table > .common-table-contain {
      width: 100% !important;
    }
  }
}

.table.delegation-workflow {
  /deep/.common-table__col {
    display: flex;
    align-items: center;
  }
}
.ant-table-tbody {
  td > i {
    cursor: pointer;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    &:hover {
      color: @primary-color;
    }
  }
}
.index {
  width: 100%;
  height: 100%;
  display: inline-block;
  .text {
    padding: 0;
  }
}
.delete {
  margin-left: 16px;
}

#DelegationWorkflow {
  .ant-btn {
    height: 32px;
  }
  .content-top {
    > h2 {
      padding: 0;
      font-size: 16px;
      font-weight: 700;
      color: #111218;
    }
    /deep/.ant-btn[disabled] {
      background: #f1f2f6;
      border: 1px solid #d4d5d6;
    }
  }

  /deep/ .common-table__thead {
    .common-table__row {
      border-bottom: 1px solid #ddd;
      height: 52px;
      min-height: 52px;
      line-height: 40px;
      .common-table__col {
        background-color: #fff;
        font-size: 14px;
        font-weight: 700;
        color: #111218;
        &:first-child {
          width: 105px !important;
          min-width: 105px !important;
          max-width: 105px !important;
          padding-left: 14px;
          padding-right: 55px;
        }
        &:nth-child(2) {
          width: 19.3% !important;
        }
        &:nth-child(3) {
          width: 19.6% !important;
        }
        &:nth-child(4) {
          width: 18.2% !important;
        }
        &:nth-child(5) {
          width: 42.9% !important;
        }
        &:last-child {
          width: 128px !important;
          min-width: 128px !important;
          max-width: 128px !important;
        }
      }
      .resize-bar {
        visibility: hidden;
      }
    }
  }

  /deep/ .common-table__tbody {
    .common-table__row {
      border: none;
      background-color: #fff;
      min-height: 52px;
      height: 52px;
      line-height: 40px;
      .text-ellipsis {
        font-size: 14px;
        color: #111218;
      }
      .common-table__col {
        &:first-child {
          width: 105px !important;
          min-width: 105px !important;
          max-width: 105px !important;
          padding-left: 24px;
          padding-right: 65px;
        }
        &:nth-child(2) {
          width: 19.3% !important;
        }
        &:nth-child(3) {
          width: 19.6% !important;
        }
        &:nth-child(4) {
          width: 18.2% !important;
        }
        &:nth-child(5) {
          width: 42.9% !important;
        }
        &:last-child {
          width: 128px !important;
          min-width: 128px !important;
          max-width: 128px !important;
        }
      }
    }
  }
  .edit,
  .delete {
    color: @highlightColor;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
  }
  .delete {
    margin-left: 24px;
  }
  .no-data {
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.workitem-box {
  .table-box {
    /deep/ .ant-checkbox-inner:after {
      margin-left: 0;
    }
  }
}
.pagination-box {
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
</style>

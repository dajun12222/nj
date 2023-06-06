<template>
  <a-table
    class="flow-track-log track-log-table"
    :columns="columns"
    :rowKey="rowKey"
    :dataSource="logs"
    :pagination="false"
    size="small"
  >
    <Participants
      slot="originator"
      slot-scope="text, record"
      :participants="text ? [text] : []"
      :trustor="record.trustor && record.trustor.id ? record.trustor : ''"
    />
    <template slot="approvalActionStatus" slot-scope="text, record">
      <a
        v-if="record.subInstanceActivity"
        @click="
          goToSubInstance(record.subWorkItemId, record.subWorkflowInstanceId)
        "
        >{{ getWorkItemStatus(record.workItemStatus) || '--' }}</a>
      <span v-else>{{
        getWorkflowActionStatus(record.approvalActionStatus) || '--'
      }}</span>
    </template>

    <!-- 序号 -->
    <span slot="codeTitle" class="resize">{{
      $t('cloudpivot.flow.pc.Number')
    }}</span>

    <!-- 节点名称 -->
    <span slot="activityNameTitle" class="text-ellipsis resize">{{
      $t('cloudpivot.flow.pc.ActivityName')
    }}</span>

    <!-- <span
      slot="activity"
      slot-scope="text,record"
      class="resize"
    >{{ isChinese ? text : record.name_i18n[$i18n.locale] }}</span> -->

    <!-- 接收时间 -->
    <span slot="receiveTimeTitle" class="resize">{{
      $t('cloudpivot.flow.pc.ReceiveTime')
    }}</span>

    <!-- 完成时间 -->
    <span slot="finishTimeTitle" class="resize">{{
      $t('cloudpivot.flow.pc.FinishTimes')
    }}</span>

    <!-- 耗时 -->
    <span slot="usedTimeTitle" class="resize">{{
      $t('cloudpivot.flow.pc.CostTime')
    }}</span>

    <!-- 被委托人 -->
    <span slot="originatorTitle" class="resize">{{
      $t('cloudpivot.flow.pc.consignor')
    }}</span>

    <!-- 操作 -->
    <span slot="approvalActionStatusTitle" class="resize">{{
      $t('cloudpivot.flow.pc.ApprovalAction')
    }}</span>

    <span
      slot="activityNameTitle"
      slot-scope="text, record"
      class="text-ellipsis"
      :title="
        isChinese
          ? record.activityName
          : record.name_i18n && record.name_i18n.en
      "
    >
      {{
        isChinese
          ? record.activityName
          : record.name_i18n && record.name_i18n.en
      }}
    </span>
  </a-table>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Table } from '@h3/antd-vue';
import Participants from './participants.vue';
import WorkflowMixin from './mixins/workflow';
import { msesToTimeStr } from '../../../../common/src/utils/date';

import { workflow } from '../../../../api';

let tmpActivityCode: string = '';

@Component({
  name: 'flow-track-log',
  components: {
    ATable: Table,
    Participants,
  },
})
export default class FormWorkflowTrackLog extends mixins(WorkflowMixin) {
  @Prop({ default: [] }) logs!: workflow.WorkflowTrackLog[];

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  // 是否为流程模拟
  get isWorlflowMock() {
    if (this.$route.query && this.$route.query.workflowMock) {
      return true;
    }
    return false;
  }

  logsCode: any = {};

  columns: any[] = [];

  mounted() {
    this.initColums();
  }

  /**
   * 获取table Index
   * @param record
   * @param index
   */
  rowKey(record: workflow.WorkflowTrackLog, index: number) {
    return index;
  }

  // 初始化表格配置
  initColums() {
    const vm: any = this;
    this.columns = [
      {
        dataIndex: 'code',
        key: 'code',
        // width: 125,
        width: 64,
        align: 'center',
        slots: { title: 'codeTitle' },
        customRender: (
          text: any,
          record: workflow.WorkflowTrackLog,
          index: number,
        ) => index + 1,
      },
      {
        dataIndex: 'activityName',
        slots: { title: 'activityNameTitle' },
        scopedSlots: { customRender: 'activityNameTitle' },
        width: 119,
      },
      {
        dataIndex: 'receiveTime',
        slots: { title: 'receiveTimeTitle' },
        width: 164,
        customRender: this.workItemLogTimeFormat,
      },
      {
        dataIndex: 'finishTime',
        slots: { title: 'finishTimeTitle' },
        width: 166,
        customRender: this.workItemLogTimeFormat,
      },
      {
        dataIndex: 'usedTime',
        slots: { title: 'usedTimeTitle' },
        width: 153,
        customRender: (
          text: any,
          record: workflow.WorkflowTrackLog,
          index: number,
        ) => {
          return msesToTimeStr(text) ? msesToTimeStr(text) : '--';
        },
      },
      {
        dataIndex: 'originator',
        slots: { title: 'originatorTitle' },
        width: 158,
        scopedSlots: { customRender: 'originator' },
      },
      {
        dataIndex: 'approvalActionStatus',
        slots: { title: 'approvalActionStatusTitle' },
        width: 76,
        scopedSlots: { customRender: 'approvalActionStatus' },
      },
    ];
  }

  /**
   * 跳转到子流程实例
   * @param subWorkItemId
   * @param subWorkflowInstanceId
   */
  goToSubInstance(subWorkItemId: string, subWorkflowInstanceId: string) {
    if (this.isWorlflowMock) {
      return;
    }
    this.$router
      .push({
        name: 'form-detail',
        query: {
          workflowInstanceId: subWorkflowInstanceId,
          workitemId: subWorkItemId,
          return: `${location.pathname + location.search}`,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  @Watch('logs')
  onSaveFlagChange() {
    tmpActivityCode = '';
  }
}
</script>
<style lang="less">
.flow-track-log {
  margin-bottom: 80px;
  &.track-log-table {
    .ant-table-small > .ant-table-content > .ant-table-body {
      margin: 0;
    }
  }
  .ant-table-small {
    border: none;
  }
  .ant-table-body {
    .img-wrapper {
      height: 20px;
      width: 20px;
      display: inline-block;
      margin-right: 8px;
      text-align: center;
      border-radius: 50%;
      overflow: hidden;
      position: relative;
      .avatar {
        max-height: 20px;
        max-width: 20px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
    // .avatar {
    //   margin-right: 8px;
    //   height: 20px;
    //   width: 20px;
    // }
  }
  .ant-table-small
    > .ant-table-content
    > .ant-table-body
    > table
    > .ant-table-thead
    > tr
    > th {
    border-bottom: 1px solid #ddd;
    padding: 15px 8px;
    color: #111218;
    font-weight: 600;
  }
  .ant-table-small
    > .ant-table-content
    > .ant-table-body
    > table
    > .ant-table-tbody
    > tr
    > td {
    border: none;
    padding: 15px 8px;
    color: #111218;
  }
  .text-ellipsis {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    /* autoprefixer: ignore next */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }

  .workflow-participants {
    white-space: nowrap;
    display: flex;
    .user-name {
      color: #111218;
    }
    a {
      display: flex;
      align-items: center;
    }
  }
}
</style>

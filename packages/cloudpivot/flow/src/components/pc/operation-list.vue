<template>
  <div class="form-operation-logs">
    <a-table
      :columns="columns"
      :rowKey="rowKey"
      :dataSource="data"
      :pagination="false"
      size="small"
    >
      <template slot="approval" slot-scope="text, record">
        <a-tooltip v-if="disabled(record)" placement="top">
          <template slot="title">
            <span>{{ $t('cloudpivot.flow.pc.NoOperationLogs') }}</span>
          </template>
          <a class="disabled" href="javascript:void(0)">{{
            $t('cloudpivot.flow.pc.View')
          }}</a>
        </a-tooltip>
        <a v-else href="javascript:void(0)" @click="showDetail(record)">{{
          $t('cloudpivot.flow.pc.View')
        }}</a>
      </template>

      <!-- 序号 -->
      <span slot="codeTitle">{{ $t('cloudpivot.flow.pc.Number') }}</span>

      <!-- 操作类型 -->
      <span slot="operationTypeNameTitle" class="resize">{{
        $t('cloudpivot.flow.pc.OperationType')
      }}</span>

      <!-- 操作时间 -->
      <span slot="timeTitle" class="resize">{{
        $t('cloudpivot.flow.pc.OperationTime')
      }}</span>

      <!-- 被委托人 -->
      <span slot="usernameTitle" class="resize">{{
        $t('cloudpivot.flowCenter.pc.delegation.consignor')
      }}</span>

      <!-- 操作节点 -->
      <span slot="operateNodeTitle" class="resize">{{
        $t('cloudpivot.flow.pc.Operations')
      }}</span>

      <!-- 平台 -->
      <span slot="clientTitle" class="text-ellipsis resize">{{
        $t('cloudpivot.flow.pc.Platform')
      }}</span>

      <!-- ip -->
      <span slot="ipTitle" class="resize">IP</span>

      <!-- 操作 -->
      <span slot="approvalTitle" class="resize">{{
        $t('cloudpivot.flow.pc.ApprovalAction')
      }}</span>

      <span
        slot="clientTitle"
        slot-scope="text, record"
        class="text-ellipsis"
        :title="record.client"
      >
        {{ record.client }}
      </span>

      <template slot="operationType" slot-scope="text">
        {{
          operationTypeList &&
          operationTypeList[`type_${text}`] &&
          operationTypeList[`type_${text}`][$i18n.locale]
        }}
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import { workflowApi } from '../../../../api';
import common from '../../../../common/pc';
import { Table, Tooltip } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'operation-list',
  components: {
    ATooltip: Tooltip,
    ATable: Table,
    PageLoading: common.components.PageLoading,
  },
})
export default class OperationList extends Vue {
  @Prop() workflowInstanceId!: string; // 流程实例id

  loading: Boolean = true;

  data: any[] = [];

  operationTypeList: any = {
    type_1: {
      zh: '同意',
      en: 'agree',
    },
    type_2: {
      zh: '驳回',
      en: 'reject',
    },
    type_3: {
      zh: '转办',
      en: 'tansfer',
    },
    type_4: {
      zh: '被取消',
      en: 'cancelled',
    },
    type_5: {
      zh: '打开表单',
      en: 'open sheet',
    },
    type_6: {
      zh: '暂存',
      en: 'save',
    },
    type_7: {
      zh: '撤回',
      en: 'withdraw',
    },
    type_8: {
      zh: '提交',
      en: 'submit',
    },
    type_9: {
      zh: '不同意',
      en: 'disagree',
    },
    type_10: {
      zh: '协办',
      en: 'assist',
    },
    type_11: {
      zh: '加签',
      en: 'Add-approver',
    },
    type_12: {
      zh: '传阅',
      en: 'Circulate',
    },
    type_13: {
      zh: '结束流程',
      en: 'End off workflow',
    },
    type_14: {
      zh: '作废',
      en: 'abandon workflow',
    },
    type_15: {
      zh: '下载附件',
      en: 'download file',
    },
    type_16: {
      zh: '打印',
      en: 'print',
    },
    type_17: {
      zh: '编辑',
      en: 'edit',
    },
    type_18: {
      zh: '管理员激活节点',
      en: 'activate other node by admin',
    },
    type_19: {
      zh: '管理员调整当前处理人',
      en: 'Adjust current handler by admin',
    },
    type_20: {
      zh: '管理员提前结束流程',
      en: 'End off workflow by admin',
    },
    type_21: {
      zh: '管理员取消当前节点所有任务',
      en: 'Cancel all task of the activity by admin',
    },
    type_22: {
      zh: '数据交接',
      en: 'Data handover',
    },
    type_23: {
      zh: '待办交接',
      en: 'task handover',
    },
    type_24: {
      zh: '删除流程实例',
      en: 'Delete workflow',
    },
    type_26: {
      zh: '更新表单',
      en: 'edit',
    },
    type_27: {
      zh: '全量同步操作',
      en: 'Synchronize all departments',
    },
    type_28: {
      zh: '部分同步操作',
      en: 'Synchronize some departments',
    },
    type_29: {
      zh: '修改拥有者',
      en: 'modify owner',
    },
    type_30: {
      zh: '流程启动事件',
      en: 'workflow_start',
    },
    type_31: {
      zh: '流程结束事件',
      en: 'workflow_end',
    },
    type_32: {
      zh: '流程作废事件',
      en: 'workflow_abandon',
    },
    type_33: {
      zh: '流程激活事件',
      en: 'workflow_activite',
    },
    type_34: {
      zh: '活动激活前事件',
      en: 'before activity_activite',
    },
    type_35: {
      zh: '活动激活后事件',
      en: 'after activity_activite',
    },
    type_36: {
      zh: '活动完成后事件',
      en: 'after activity_finished',
    },
    type_37: {
      zh: '活动取消事件',
      en: 'after activity_cancelled',
    },
    type_38: {
      zh: '任务提交后事件',
      en: 'after workitem_submit',
    },
    type_39: {
      zh: '任务驳回后事件',
      en: 'after workitem_reject',
    },
  };

  columns: any[] = [
    {
      dataIndex: 'code',
      width: 64,
      slots: { title: 'codeTitle' },
      customRender: (text: any, record: any, index: number) => index + 1,
      align: 'center',
    },
    {
      dataIndex: 'operationType',
      slots: { title: 'operationTypeNameTitle' },
      scopedSlots: { customRender: 'operationType' },
      width: 130,
    },
    {
      dataIndex: 'time',
      slots: { title: 'timeTitle' },
      width: 162,
    },
    {
      dataIndex: 'username',
      slots: { title: 'usernameTitle' },
      width: 100,
    },
    {
      dataIndex: 'operateNode',
      slots: { title: 'operateNodeTitle' },
      width: 150,
    },
    {
      dataIndex: 'client',
      slots: { title: 'clientTitle' },
      scopedSlots: { customRender: 'clientTitle' },
      width: 175,
    },
    {
      dataIndex: 'ip',
      slots: { title: 'ipTitle' },
      width: 120,
    },
    {
      dataIndex: 'approval',
      slots: { title: 'approvalTitle' },
      width: 80,
      scopedSlots: { customRender: 'approval' },
    },
  ];

  showIframeForm: boolean = false;

  IframeFormUrl: string = '';

  created() {
    const workflowInstanceId: any = {
      workflowInstanceId: this.workflowInstanceId,
    };
    workflowApi.getWorkflowOperationLog(workflowInstanceId).then((res: any) => {
      this.data = res.data || [];
      this.loading = false;
    });
  }

  /**
   * row key
   * @param record
   * @param index
   */
  rowKey(record: any, index: number) {
    return index;
  }

  /**
   * 打开详情
   * @param data
   * NOTE: 同意: 1, 驳回: 2, 转办: 3, 被取消: 4, 打开表单: 5, 暂存: 6, 撤回: 7, 提交: 8, 不同意: 9, 协办: 10, 加签: 11, 传阅: 12,结束流程: 13,作废: 14,下载附件: 15,打印: 16,编辑: 17,管理员激活节点: 18,管理员调整当前处理人: 19,管理员提前结束流程: 20,管理员取消当前节点所有任务: 21
   */
  showDetail(data: any) {
    this.$emit('showDetail', data);
  }

  disabled(record) {
    return ![6, 8, 26, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39].includes(
      record.operationType,
    );
  }
}
</script>

<style lang="less">
@import './../../../../../cloudpivot/application/src/components/pc/style/custom-themes';
.form-operation-logs {
  margin-bottom: 80px;
  .ant-table-small {
    border: none;
  }
  .ant-table-body {
    margin: 0 !important;
    .img-wrapper {
      height: 20px;
      width: 20px;
      display: inline-block;
      margin-right: 8px;
      text-align: center;
      .avatar {
        max-height: 20px;
      }
    }
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
  a {
    color: @highlightColor;
    &:hover {
      color: @highlightColor;
    }
  }
  .disabled {
    color: rgba(17, 18, 24, 0.25);
  }
  .ant-table-tbody
    > tr.ant-table-row-hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td,
  .ant-table-tbody
    > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td,
  .ant-table-thead
    > tr.ant-table-row-hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td,
  .ant-table-thead
    > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td {
    background: @hoveBGColor;
  }
}
</style>

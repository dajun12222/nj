<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="transfer-detail">
    <div class="transfer-detail-overview">
      <div class="overview-group-01">
        <div class="overview-item">
          <span class="item-laber">交接类型：</span>
          <span class="item-body">{{
            dataSourceType[recordValue.workTransferType].label || '--'
          }}</span>
        </div>
        <div class="overview-item">
          <span class="item-laber">处理人：</span>
          <span class="item-body">{{
            recordValue.processUserName || '--'
          }}</span>
        </div>
        <div class="overview-item">
          <span class="item-laber">接收人：</span>
          <span class="item-body">{{
            recordValue.receiveUserName || '--'
          }}</span>
        </div>
        <div class="overview-item">
          <span class="item-laber">交接意见：</span>
          <span class="item-body">{{ recordValue.comment || '--' }}</span>
        </div>
      </div>
      <div class="overview-group-02">
        <div
          v-if="dataSourceType[recordValue.workTransferType].val === 2"
          class="overview-item"
        >
          <span class="item-laber">业务模型：</span>
          <span class="item-body">{{ schemaName || '--' }}</span>
        </div>
        <div class="overview-item">
          <span class="item-laber">处理时间：</span>
          <span class="item-body">{{ recordValue.processTime || '--' }}</span>
        </div>
        <div class="overview-item">
          <span class="item-laber">接收人部门：</span>
          <span class="item-body">{{
            recordValue.receiveUserDeptName || '--'
          }}</span>
        </div>
      </div>
    </div>
    <div class="transfer-detail-info">
      <div
        v-if="dataSourceType[recordValue.workTransferType].val === 1"
        class="workflow-data"
      >
        <WorkflowData :recordId="recordValue.id" />
      </div>
      <div
        v-else-if="dataSourceType[recordValue.workTransferType].val === 2"
        class="application-data"
      >
        <ApplicationData
          :recordId="recordValue.id"
          :totalNumber="recordValue.transferSize"
          @getSchemaName="getSchemaName"
        />
      </div>
      <div
        v-else-if="dataSourceType[recordValue.workTransferType].val === 3"
        class="role-data"
      >
        <RoleData :recordId="recordValue.id" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Pagination, Table } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import ApplicationData from './transferDetail/application.vue';
import RoleData from './transferDetail/role.vue';
import WorkflowData from './transferDetail/workflow.vue';

@Component({
  name: 'TransferDetail',
  components: {
    ATable: Table,
    APagination: Pagination,
    WorkflowData,
    ApplicationData,
    RoleData,
  },
})
export default class TransferDetail extends Vue {
  @Prop({ default: {} })
  recordValue!: any;

  schemaName: string = '';

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

  mounted() {
    this.initData();
  }

  initData() {
    console.log(this.recordValue, '--RECORDVALUE');
  }

  getSchemaName(val) {
    this.schemaName = val;
  }
}
</script>
<style lang="less" scoped>
.transfer-detail {
  display: flex;
  flex-flow: column;
  height: 100%;
  .transfer-detail-overview {
    display: flex;
    .overview-group-01,
    .overview-group-02 {
      width: 50%;
      .overview-item {
        display: flex;
        .item-laber {
          min-width: 70px;
          height: 22px;
          font-size: 14px;
          font-weight: 400;
          color: rgba(17, 18, 24, 0.5);
          line-height: 22px;
          white-space: nowrap;
        }
        .item-body {
          width: 100%;
          height: 22px;
          font-size: 14px;
          font-weight: 400;
          color: #111218;
          line-height: 22px;
        }
        & + .overview-item {
          margin-top: 20px;
        }
      }
    }
    .overview-group-02 .overview-item .item-laber {
      min-width: 84px;
    }
  }
  .transfer-detail-info {
    height: calc(100% - 148px);
    .workflow-data,
    .application-data {
      height: 100%;
      padding-top: 32px;
    }
    .role-data {
      height: 100%;
      padding-top: 48px;
    }
  }
}
</style>

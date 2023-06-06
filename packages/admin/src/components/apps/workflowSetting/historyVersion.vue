<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="history-version">
    <a-table :dataSource="historyList" :pagination="false">
      <!-- 序列 -->
      <a-table-column key="order" :width="80" dataIndex="order">
        <span
          slot="title"
          v-resize.east="{ translateX: 16 }"
          class="resize resize-first"
          >序列</span>
      </a-table-column>

      <!-- 流程编码 -->
      <a-table-column key="workflowCode" dataIndex="workflowCode">
        <span slot="title" v-resize.east="{ translateX: 16 }" class="resize">流程编码</span>
      </a-table-column>

      <!-- 版本号 -->
      <a-table-column key="workflowVersion" dataIndex="workflowVersion">
        <span slot="title" v-resize.east="{ translateX: 16 }" class="resize">版本号
          <!-- NOTE: 增加版本号连续性说明：由于流程模拟运行会占用版本号，正式运行的版本号会出现不连续的情况 -->
          <a-tooltip
            title="由于流程模拟运行会占用版本号，正式运行的版本号会出现不连续的情况"
          >
            <i class="icon aufontAll h-icon-all-question-circle-o"></i>
          </a-tooltip>
        </span>
      </a-table-column>

      <!-- 发布人 -->
      <a-table-column
        key="creater"
        dataIndex="creater"
        :scopedSlots="{ customRender: 'creater' }"
      >
        <span slot="title" v-resize.east="{ translateX: 16 }" class="resize">发布人</span>
        <span slot-scope="creater, record">
          <a-popover overlayClassName="text-info-detail" placement="bottomLeft">
            <template slot="content">
              <div class="text-info-box">
                <div class="text-info-item">
                  <div class="item-name" :title="creater">
                    {{ creater }}
                  </div>
                  <div class="item-path" :title="record.fullName">
                    {{ record.fullName }}
                  </div>
                </div>
              </div>
            </template>
            {{ creater }}
          </a-popover>
          <!-- <a-tooltip>
            <div slot="title">
              {{ record.fullName }}
            </div>
            {{ record.creater }}
          </a-tooltip> -->
        </span>
      </a-table-column>

      <!-- 发布时间 -->
      <a-table-column key="createdTime" dataIndex="createdTime">
        <span slot="title" v-resize.east="{ translateX: 16 }" class="resize">发布时间</span>
      </a-table-column>

      <!-- 描述 -->
      <a-table-column key="remarks" dataIndex="remarks">
        <span slot="title" v-resize.east="{ translateX: 16 }" class="resize">描述</span>
      </a-table-column>

      <!-- 操作 -->
      <a-table-column key="operationIndex" dataIndex="operationIndex">
        <span slot="title" v-resize.east="{ translateX: 16 }" class="resize">操作</span>
        <a
          slot-scope="operationIndex, record"
          href="javascript:;"
          class="view"
          @click.stop="openWorkflowPage(record)"
          >查看</a>
      </a-table-column>
    </a-table>
  </div>
</template>
<script lang="ts">
import WorkflowApi from '@/apis/workflow';
import { Table, Tooltip, Popover } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'HistoryVersion',
  components: {
    ATable: Table,
    ATableColumn: Table.Column,
    ATooltip: Tooltip,
    APopover: Popover,
  },
})
export default class HistoryVersion extends Vue {
  historyList = [];
  // @WorkflowModule.State('historyList') historyList: any; // 表格数据数组

  // @WorkflowModule.Action('getHistoryList') getHistoryList: any;

  // 流程code
  workflowCode: string = '';

  // 数据模型code
  bizSchemaCode: string = '';

  // 应用code
  appCode: string = '';

  beforeMount() {
    if (
      this.$route.params &&
      this.$route.params.workflowCode &&
      this.$route.params.appCode
    ) {
      this.workflowCode = this.$route.params.workflowCode;
      this.bizSchemaCode = this.$route.params.bizSchemaCode;
      this.appCode = this.$route.params.appCode;
      this.getHistoryList({ workflowCode: this.workflowCode });
    }
  }

  getHistoryList(params) {
    WorkflowApi.getHistoryListExcludeContent(params).then((res: any) => {
      if (res.errcode === 0 && res.data) {
        this.historyList = res.data;
        this.historyList.forEach((item: any, ind: number) => {
          item['order'] = ind + 1;
          item['key'] = ind + 1;
        });
      }
    });
  }

  openWorkflowPage(item: any) {
    if (!this.workflowCode) {
      return;
    }
    this.$router
      .push({
        name: 'workflowHistoryDetail',
        params: {
          appCode: this.appCode,
          bizSchemaCode: this.bizSchemaCode,
          workflowCode: this.workflowCode,
        },
        query: {
          version: item.workflowVersion,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.history-version {
  margin-top: 24px;
  padding: 0 24px;
  /deep/.ant-table {
    color: @nav-font-color;
  }
  /deep/.ant-table-tbody > tr > td {
    padding: 8px 16px;
  }
  /deep/.ant-table-thead > tr > th {
    background: #f5f6f9;
    padding: 8px 16px;
    font-weight: bold;
    span {
      font-size: 14px;
      color: @nav-font-color;
    }
  }
  /deep/.ant-table-empty {
    .ant-table-body {
      overflow: inherit !important;
    }
    .ant-table-placeholder {
      /*display: none;*/
    }
  }
  .view {
    color: @primary-color;
  }
  .resize {
    display: inline-block;
    height: 22px;
    width: calc(100% + 32px);
    padding: 0 16px;
    -webkit-transform: translateX(-16px);
    transform: translateX(-16px);
    font-weight: 600;
    i {
      font-size: 12px;
      line-height: 22px;
      color: rgba(17, 18, 24, 0.5);
      cursor: pointer;
    }
  }
  .resize-first {
    border-left: none;
  }
}
</style>

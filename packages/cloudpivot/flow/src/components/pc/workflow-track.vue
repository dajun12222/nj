<template>
  <section class="main">
    <div class="content">
      <header>
        <span class="back" @click="back">{{
          $t('cloudpivot.flow.pc.Back')
        }}</span>
        <span class="section-title">{{
          $t('cloudpivot.flow.pc.WorkflowTrack')
        }}</span>
        <label for="" class="version">{{ $t('cloudpivot.flow.pc.Version') }}：V{{
            baseInfo.workflowVersion
          }}</label>
      </header>
      <BaseInfo ref="baseInfo" :baseInfo="baseInfo" />
      <div class="dashed-line"></div>
      <a-tabs class="dark-tabs" defaultActiveKey="chart">
        <a-tab-pane key="chart" :tab="$t('cloudpivot.flow.pc.WorkflowChart')">
          <Chart
            v-show="chart && chart.activities"
            :chart="chart"
            :workflowStatus="baseInfo.status"
            @clickActivity="clickActivity"
            @overLine="overLine"
            @leaveLine="leaveLine"
          />
        </a-tab-pane>
        <a-tab-pane
          v-if="!isExternal"
          key="logs"
          :tab="$t('cloudpivot.flow.pc.ApprovalLog')"
        >
          <Log :logs="logs" />
        </a-tab-pane>
        <a-tab-pane key="actionLogs" :tab="$t('cloudpivot.flow.pc.Logs')">
          <OperationList
            :workflowInstanceId="workflowInstanceId"
            @showDetail="showDetail"
          />
        </a-tab-pane>
      </a-tabs>
      <PageLoading v-model="loading" />
    </div>

    <div v-if="showLogIframeForm" class="iframe-shadow"></div>
    <transition name="fade-down">
      <div v-if="showLogIframeForm" class="iframe-form-warp">
        <div class="log-icon-close" @click="onLogIframeFormClose">
          <span class="icon aufontAll">&#xe996;</span>
        </div>
        <iframe
          ref="iframe"
          class="iframe-form-warp--page"
          :src="IframeFormUrl"
        ></iframe>
      </div>
    </transition>
  </section>
</template>

<script lang="ts">
import { workflow, workflowApi } from '../../../../api';
import common from '../../../../common/pc';
import { Tabs } from '@h3/antd-vue';
import { mixins } from 'vue-class-component';
import { Component, Prop, Watch } from 'vue-property-decorator';
import BaseInfo from './base-info.vue';
import ChartCard from './chart-card';
import ChartDescribe from './chart-describe';
import Chart from './chart.vue';
import Log from './logs.vue';
import WorkflowMixin from './mixins/workflow';
import OperationList from './operation-list.vue';

@Component({
  name: 'workflow-track',
  components: {
    BaseInfo,
    Chart,
    Log,
    OperationList,
    PageLoading: common.components.PageLoading,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class FormWorkflowTrack extends mixins(WorkflowMixin) {
  @Prop({
    default: {},
  })
  baseInfo!: workflow.InstanceBaseInfo; // 流程跟踪基础信息

  @Prop({
    default: {},
  })
  chart!: workflow.Chart; // 流程图

  @Prop({
    default: [],
  })
  logs!: workflow.WorkflowTrackLog[]; // 审批日志

  record: workflow.WorkflowTrackLog[] = [];

  @Prop({
    default: true,
  })
  loading!: boolean;

  @Prop({
    default: '',
  })
  workflowInstanceId!: string; // 流程实例Id

  // @Prop({
  //   default: ""
  // })
  // workItemId!: string; // 流程Id

  i18n: any = {};

  showLogIframeForm: boolean = false;

  IframeFormUrl: string = '';

  // 是否为外部用户
  get isExternal() {
    if ((window as any).isExternal) {
      return true;
    }
    return false;
  }

  param: any = null;

  currentLine: any = null;

  currentRect: any = null;

  //监听模态框状态

  @Watch('$store.state.motalflag')
  getPiedata(newVal: any, oldVal: any) {
    console.log(newVal, oldVal);
    const flag = newVal;
    if (typeof flag === 'boolean' && flag) {
      if (!this.param) {
        return;
      }
      clearTimeout(this.param); //清除定时器
      this.param = null;
      return flag;
    }
    if (flag === false && this.currentRect && this.currentLine) {
      const rect = this.currentRect;
      const line = this.currentLine;
      ChartDescribe({ rect, type: 'leave', line, estimate: true });
    }
  }

  mounted() {
    this.i18n = {
      receiverTime: `${this.$t('cloudpivot.flow.pc.ReceiveTime')}:`,
      finishTime: `${this.$t('cloudpivot.flow.pc.FinishTimes')}:`,
      predictor: `${this.$t('cloudpivot.flow.pc.Predictor')}`,
      assist: `${this.$t('cloudpivot.flow.pc.Assist')}`,
      addWorkitem: `${this.$t('cloudpivot.flow.pc.AddWorkitem')}`,
      circulate: `${this.$t('cloudpivot.flow.pc.Circulate')}`,
      forward: `${this.$t('cloudpivot.flow.pc.Forward')}`,
      nothing: `${this.$t('cloudpivot.flow.pc.Nothing')}`,
      trust: `${this.$t('cloudpivot.flow.pc.trust2')}`,
    };
  }

  /**
   * 返回点击事件
   */
  back() {
    if (this.workflowInstanceId !== '') {
      // this.$router.go(-1);
      location.href = `/form/detail?workitemId=${this.$route.params.workItemId}&workflowInstanceId=${this.$route.params.workflowInstanceId}&return=${this.$route.query.return}`;
    } else {
      this.closePage();
    }
  }

  /**
   * 关闭当前页面
   */
  closePage() {
    window.opener = null;
    window.open('', '_self');
    window.close();
  }

  /**
   * 流程点击回调
   * @params activity 流程原型数据
   * @params e        触发的Element Event
   */
  async clickActivity(activity: any, e: MouseEvent) {
    // 系统活动、开始、结束节点暂不生成chartCard
    if (
      activity.activityType === 'SYSTEM_ACTIVITY' ||
      activity.activityType === 'START' ||
      activity.activityType === 'END'
    ) {
      return;
    }
    this.record = [];
    const rect: DOMRect = (
      e.currentTarget as HTMLElement
    ).getBoundingClientRect() as DOMRect;
    this.record = this.logs.filter(
      (log: workflow.WorkflowTrackLog) =>
        log.activityCode === activity.activityCode,
    );
    if (this.record && this.record.length) {
      ChartCard({
        record: this.record.reverse(),
        rect,
        fn: this.goSubWorkflowForm,
        i18n: this.i18n,
        statusFn: this.chartCardStatus,
      });
    } else {
      const res: any = await workflowApi.getActivityPreprocessors({
        workflowInstanceId: this.workflowInstanceId,
        activityCode: activity.activityCode,
      });
      if (!res.errcode) {
        ChartCard({
          record: res.data,
          rect,
          estimate: true,
          i18n: this.i18n,
          statusFn: this.chartCardStatus,
        });
      }
    }
  }

  async overLine(line: any, e: MouseEvent) {
    const rect: DOMRect = (
      e.currentTarget as HTMLElement
    ).getBoundingClientRect() as DOMRect;
    ChartDescribe({ rect, type: 'over', line, estimate: true });
  }

  async leaveLine(line: any, e: MouseEvent) {
    const rect: DOMRect = (
      e.currentTarget as HTMLElement
    ).getBoundingClientRect() as DOMRect;
    if (!this.param) {
      this.currentLine = line;
      this.currentRect = rect;
    }
    this.param = setTimeout(() => {
      ChartDescribe({ rect, type: 'leave', line, estimate: true });
    }, 750);
  }

  /**
   * 打开子流程表单
   */
  goSubWorkflowForm(log: any) {
    this.$router
      .push({
        name: 'form-detail',
        query: {
          workflowInstanceId: log.subWorkflowInstanceId,
          workitemId: log.subWorkItemId,
          return: `${location.pathname + location.search}`,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  // ChartCard状态多语言
  chartCardStatus(value: any, type: string) {
    if (type === 'subInstance') {
      return this.getSubWorkflowActionStatus(value);
    } else {
      return this.getWorkflowActionStatus(value);
    }
  }

  showDetail(data) {
    this.showLogIframeForm = true;
    const id: string = data.id;
    this.IframeFormUrl =
      '/from/operation-log-compare/' +
      id +
      '/' +
      this.workflowInstanceId +
      '/' +
      this.$route.params.workItemId;

    const iframeFormWarpClose = window.parent.document.getElementById(
      'iframeFormWarpClose',
    );
    if (iframeFormWarpClose) {
      iframeFormWarpClose.style.display = 'none';
    }

    window.addEventListener('message', this.hideDetail, false);
  }

  hideDetail(event: any) {
    if (event.data === 'closeIfr') {
      this.showLogIframeForm = false;
      window.removeEventListener('message', this.hideDetail);
    }
  }

  onLogIframeFormClose() {
    this.showLogIframeForm = false;
    const iframeFormWarpClose = window.parent.document.getElementById(
      'iframeFormWarpClose',
    );
    if (iframeFormWarpClose) {
      iframeFormWarpClose.style.display = 'block';
    }
  }
}
</script>
<style lang="less">
.ant-popover-inner {
  box-shadow: 0 2px 8px 0 rgba(30, 85, 255, 0.15);
}

.iframe-form-warp {
  position: fixed;
  top: 0;
  bottom: 0;
  // left: 0;
  // right: 83px;
  left: 50%;
  transform: translateX(-50%);
  margin: auto;
  min-width: 1024px;
  max-width: 1228px;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
  z-index: 1020;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  &--page {
    width: 100%;
    height: 100%;
    overflow: auto;
    border: none;
  }
  .log-icon-close {
    position: absolute;
    right: 24px;
    cursor: pointer;
    top: 13px;
    font-size: 20px;
    color: #000;
    vertical-align: baseline;
  }
}
.iframe-shadow {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 1010;
}
</style>
<style lang="less">
@import '../style.less';
@import './../../../../../cloudpivot/application/src/components/pc/style/custom-themes';

.form-track {
  .main {
    flex: none !important;
    display: flex;
    flex-direction: column;
    position: relative;
    height: calc(100vh - 64px);
    background-color: #fff !important;
    > .content {
      padding: 39px 0 38px 0;
      align-self: center;
      height: auto;
      width: 1000px !important;
      header {
        margin-left: -67px;
        display: flex;
        align-items: center;
        .back {
          display: inline-block;
          margin-right: 16px;
          padding-right: 16px;
          border-right: 1px solid #ccc;
          font-size: 18px;
          color: @highlightColor;
          line-height: 18px;
          cursor: pointer;
        }
        .section-title {
          margin-right: 8px;
          color: #111218;
          font-size: 18px;
          line-height: 26px;
          font-weight: 600;
        }
        .version {
          padding: 3px 8px;
          font-size: 12px;
          color: #111218;
          background: rgba(17, 18, 24, 0.05);
          border-radius: 4px;
          border: 1px solid rgba(17, 18, 24, 0.1);
        }
      }
      .dashed-line {
        margin-top: 48px;
        margin-bottom: 48px;
        width: 100%;
        border-bottom: 1px dashed #eee;
      }
    }
  }
  &__tabs {
    margin-top: @base4-padding-sm;
  }
  .dark-tabs {
    .flow-track-chart {
      margin-top: 8px;
      .workflow-designer {
        .activity-instance {
          color: #111218;
          border: none !important;
          background: #e8e8e8;
          .activity-content i {
            vertical-align: middle;
          }
        }
        .finish {
          background: rgba(135, 232, 222, 0.4);
        }
        .processing {
          background: rgba(163, 203, 255, 0.4);
        }
        .processing:hover {
          background: #cce4ff;
        }
        .wrong {
          background: rgba(255, 182, 179, 0.4);
        }
      }
      .flow-track-chart__explain-item {
        > i {
          border: none !important;
        }
        span {
          color: #111218;
        }
        .flow-track-chart__finish {
          background: rgba(135, 232, 222, 0.4);
        }
        .flow-track-chart__processing {
          background: rgba(163, 203, 255, 0.4);
        }
        .flow-track-chart__wrong {
          background-color: rgba(255, 182, 179, 0.4);
        }
        .flow-track-chart__default {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          border: 1px solid rgba(17, 18, 24, 0.1) !important;
        }
      }
    }
  }
}
</style>

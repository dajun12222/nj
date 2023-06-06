<template>
  <div>
    <div class="base-info-box">
      <div class="base-item state margin-left0" :class="statusClass">
        <!-- <i class="icon aufontAll h-icon-all-daiban-zj" /> -->
        <i :class="'icon aufontAll ' + fontFace"></i>
        {{ workflowState }}
      </div>
      <div class="base-item">
        <i class="icon aufontAll h-icon-all-Components_form"></i>
        <div class="text-info">
          <p v-if="baseInfo.workflowName">
            {{
              isChinese
                ? baseInfo.workflowName
                : baseInfo.name_i18n[$i18n.locale]
            }}
          </p>
          <p>{{ $t('cloudpivot.flow.pc.WorkflowName') }}</p>
        </div>
      </div>
      <div class="base-item">
        <i class="icon aufontAll h-icon-all-Components_Timeselector"></i>
        <div class="text-info">
          <p v-if="baseInfo.startTime">
            {{ baseInfo.startTime }}
          </p>
          <p v-else>--</p>
          <p>{{ $t('cloudpivot.flow.pc.StartTime') }}</p>
        </div>
      </div>
      <div class="base-item margin-right0">
        <i class="icon aufontAll h-icon-all-Components_Timeselector"></i>
        <div class="text-info">
          <p v-if="baseInfo.finishTime">
            {{ baseInfo.finishTime }}
          </p>
          <p v-else>--</p>
          <p>{{ $t('cloudpivot.flow.pc.FinishedTime') }}</p>
        </div>
      </div>
    </div>

    <!-- <p class="node-title">{{ $t("cloudpivot.flow.pc.CurNode") }}</p>
    <div class="worflow-track-base-info-node">
      <div class="node-item" v-for="(info, i) in participants" :key="i">
        <p>
          {{ isChinese ? info.activityName : info.name_i18n[$i18n.locale] }}
        </p>
        <user-popover-ellipsis :participantRelations="info.participantRelations"></user-popover-ellipsis>
      </div>
    </div> -->

    <template v-if="participants && participants.length !== 0">
      <p class="node-title">
        {{ $t('cloudpivot.flow.pc.CurNode') }}
      </p>
      <div class="worflow-track-base-info-node">
        <div
          v-for="(info, i) in participants"
          :key="i"
          class="node-item"
          :class="i >= 4 ? 'marginTop16' : ''"
        >
          <p>
            {{ isChinese ? info.activityName : info.name_i18n[$i18n.locale] }}
          </p>
          <user-popover-ellipsis
            :participantRelations="info.participantRelations"
            :popoverClass="'display-popover' + i"
            :canExpand="true"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { workflow } from '../../../../api';
import common from '../../../../common/pc';
import { Col, Popover, Row } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'form-flow-track-base',
  components: {
    ARow: Row,
    ACol: Col,
    UserPopover: common.components.UserPopover,
    UserPopoverEllipsis: common.components.UserPopoverEllipsis,
    APopover: Popover,
  },
})
export default class FormflowTrackBase extends Vue {
  @Prop({
    default: {
      headerAction: {},
      participants: [],
    },
  })
  baseInfo!: workflow.InstanceBaseInfo; // 流程跟踪基础信息

  MAP: any = {
    DRAFT: {
      zh: '草稿',
      cn: 'Draft',
      fontFace: 'h-icon-all-highlight',
    },
    PROCESSING: {
      zh: '进行中',
      cn: 'Pending',
      fontFace: 'h-icon-all-reloadtime',
    },
    COMPLETED: {
      zh: '已完成',
      cn: 'Completed',
      fontFace: 'h-icon-all-check-circle1',
    },
    CANCELED: {
      zh: '已作废',
      cn: 'Canceled',
      fontFace: 'h-icon-all-file-exception',
    },
    EXCEPTION: {
      zh: '流程异常',
      cn: 'Exception',
      fontFace: 'h-icon-all-abnormal',
    },
  };

  get statusClass() {
    if (!this.baseInfo.status) {
      return;
    }
    return this.MAP[this.baseInfo.status as any]['cn'];
  }

  get fontFace() {
    if (!this.baseInfo.status) {
      return;
    }
    return this.MAP[this.baseInfo.status as any]['fontFace'];
  }

  /**
   * 获取当前活动节点明显
   */
  get participants() {
    return this.baseInfo.participants;
  }

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  /**
   * 获取流程状态
   */
  get workflowState() {
    // return this.$t(
    //   `cloudpivot.flow.pc.WorkflowState.${
    //     WorkflowState[this.baseInfo.status as any]
    //   }`
    // );
    return this.isChinese
      ? this.MAP[this.baseInfo.status as any] &&
          this.MAP[this.baseInfo.status as any]['zh']
      : this.MAP[this.baseInfo.status as any] &&
          this.MAP[this.baseInfo.status as any]['cn'];
  }

  beforeMount() {
    console.log('base', this.baseInfo);
  }
}
</script>
<style lang="less" scoped>
/deep/.ant-popover-placement-bottom {
  top: 56px !important;
}
</style>
<style lang="less">
.worflow-track-base {
  border: 0;
}

.base-info-box {
  overflow: hidden;
  margin: 39px 0 48px 0;
  .base-item {
    float: left;
    margin-left: 8px;
    margin-right: 8px;
    width: 238px;
    height: 86px;
    line-height: 86px;
    background: rgba(236, 237, 247, 0.5);
    border-radius: 2px;
    .aufontAll {
      width: 44px;
      height: 44px;
      margin-right: 14px;
      margin-left: 22px;
      display: inline-block;
      vertical-align: middle;
      text-align: center;
      line-height: 44px;
      border-radius: 50%;
      background: #fff;
      color: #777f8d;
      font-size: 16px;
    }
    .text-info {
      display: inline-block;
      vertical-align: middle;
      p:nth-child(1) {
        margin-bottom: 6px;
        color: #111218;
        height: 22px;
        line-height: 22px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
      }
      p:nth-child(2) {
        font-size: 12px;
        color: rgba(17, 18, 24, 0.5);
        line-height: 20px;
      }
    }
  }
  .margin-left0 {
    margin-left: 0;
  }
  .margin-right0 {
    margin-right: 0;
  }
  .state {
    text-align: center;
    font-size: 20px;
    color: #2970ff;
    &.Draft {
      color: #faad14;
      i {
        color: #faad14;
      }
    }
    &.Pending {
      color: #2970ff;
      i {
        color: #2970ff;
      }
    }
    &.Completed {
      color: #00c293;
      i {
        color: #00c293;
      }
    }
    &.Canceled {
      color: rgba(17, 18, 24, 0.5);
      i {
        color: rgba(17, 18, 24, 0.5);
      }
    }
    &.Exception {
      color: #f0353f;
      i {
        color: #f0353f;
      }
    }
    .aufontAll {
      font-size: 20px;
      line-height: 20px;
      width: 22px;
      height: 22px;
      margin-right: 8px;
      margin-left: 0;
      background: transparent;
      // color: #2970ff;
    }
  }
}
.node-title {
  font-size: 16px;
  font-weight: 600;
  color: #111218;
  line-height: 24px;
}
.worflow-track-base-info-node {
  position: relative;
  // overflow: hidden;
  margin-top: 16px;
  // white-space: nowrap;
  // overflow-y: hidden;
  .node-item {
    display: inline-block;
    min-width: 25%;
    // padding-left: 8px;
    margin-bottom: 8px;
    & > p {
      margin-bottom: 8px;
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
    }
  }
  // 小屏幕下第1/5/9...个左边距取消
  .node-item:nth-of-type(4n-3) {
    margin-left: 0;
  }
  // 小屏幕下第4/8/12...个右边距取消
  .node-item:nth-of-type(4n + 0) {
    margin-right: 0;
  }
}

.marginTop16 {
  margin-top: 16px;
}
</style>

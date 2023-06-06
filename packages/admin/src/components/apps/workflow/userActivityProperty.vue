<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="property-container">
    <!-- <a-collapse :bordered="false" :activeKey="['1']">
      <a-collapse-panel key="1" header="基础属性">
        <common-setting type="PARTICIPANT" />
      </a-collapse-panel>
    </a-collapse> -->

    <common-setting type="PARTICIPANT" />

    <div class="custom-tabs">
      <span :class="{ active: showType === 'base' }" @click="showType = 'base'">基础属性</span>
      <span
        :class="{ active: showType === 'senior' }"
        @click="showType = 'senior'"
        >高级属性</span>
    </div>

    <!-- 基础属性 -->
    <template v-if="showType === 'base'">
      <a-collapse :bordered="false" :activeKey="['1', '2', '3', '4']">
        <!-- 参与者 -->
        <a-collapse-panel key="1" header="参与者">
          <participant type="PARTICIPANT" />
        </a-collapse-panel>

        <!-- 数据权限 -->
        <a-collapse-panel key="2" header="数据权限">
          <data-item type="PARTICIPANT" />
        </a-collapse-panel>

        <!-- 操作权限 -->
        <a-collapse-panel key="3" header="操作权限">
          <operation type="PARTICIPANT" />
        </a-collapse-panel>

        <a-collapse-panel key="4">
          <div slot="header" class="custom-collapse-panel-header">
            <span>消息通知</span>
            <a-tooltip>
              <template slot="title">
                <div>若节点与流程配置的消息模版不一</div>
                <div>样，将按节点的消息配置发送通知。</div>
              </template>
              <span class="icon aufontAll h-icon-all-question-circle"></span>
            </a-tooltip>
            <div @click.stop="toSetNotification">消息管理</div>
          </div>
          <notification type="PARTICIPANT" />
        </a-collapse-panel>
      </a-collapse>
    </template>

    <!-- 高级属性 -->
    <template v-else>
      <a-collapse :bordered="false" :activeKey="['1', '2']">
        <!-- 高级 -->
        <a-collapse-panel key="1" header="高级">
          <activity-senior type="PARTICIPANT" />
        </a-collapse-panel>

        <!-- 事件处理 -->
        <a-collapse-panel key="2" header="事件处理">
          <activity-event type="PARTICIPANT" />
        </a-collapse-panel>
      </a-collapse>
    </template>
  </div>
</template>

<script lang="ts">
import { Collapse, Tooltip } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import ActivityEvent from './property/activityEvent.vue';
import ActivitySenior from './property/activitySenior.vue';
import CommonSetting from './property/commonSetting.vue';
import DataItem from './property/dataItem.vue';
import Notification from './property/notification.vue';
import Operation from './property/operation.vue';
import Participant from './property/participant.vue';

@Component({
  name: 'UserActivityProperty',
  components: {
    CommonSetting,
    Participant,
    Operation,
    DataItem,
    ActivitySenior,
    ActivityEvent,
    Notification,
    // MessageNotify
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ATooltip: Tooltip,
  },
})
export default class UserActivityProperty extends Vue {
  showType: string = 'base';

  toSetNotification() {
    localStorage.setItem('integrationDefaultActiveKey', '5');

    window.open('/admin/#/system/integration-setting', '_blank');
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.custom-collapse-panel-header {
  display: flex;
  justify-content: space-between;
  position: relative;
  div {
    color: @primary-color;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  .h-icon-all-question-circle {
    position: absolute;
    left: 62px;
    top: 1px;
    font-size: 13px;
    color: rgba(17, 18, 24, 0.25);
    font-weight: 400;
  }
}

.property-container {
  position: relative;
}
.property-container {
  /deep/.ant-collapse .ant-collapse-item {
    text-align: left;
    background: #fff;
  }
}
.property-container .ant-collapse > .ant-collapse-item-active {
  border-bottom: 0;
  margin-bottom: 16px;
  /deep/.ant-collapse-content {
    overflow: unset;
  }
}

.custom-tabs {
  background: #efefef;
  border-radius: 2px;
  height: 32px;
  padding: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 8px;
  span {
    height: 24px;
    line-height: 25px;
    overflow: hidden;
    text-align: center;
    flex: 1;
    font-size: 13px;
    color: @nav-font-color;
    cursor: pointer;
    border-radius: 2px;
    &.active {
      font-weight: 600;
      background-color: #fff;
    }
  }
}
</style>

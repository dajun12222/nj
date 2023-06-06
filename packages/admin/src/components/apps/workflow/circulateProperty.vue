<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="property-container">
    <common-setting type="CIRCULATE" />
    <a-collapse :bordered="false" :activeKey="['2', '3', '5']">
      <!-- 一般属性 -->
      <!-- <a-collapse-panel key="1" header="基础属性">
        <common-setting type="CIRCULATE" />
      </a-collapse-panel> -->

      <a-collapse-panel key="5">
        <template slot="header">
          消息通知
          <a-tooltip>
            <template slot="title">
              <div>若节点与流程配置的消息模版不一</div>
              <div>样，将按节点的消息配置发送通知。</div>
            </template>
            <span class="icon aufontAll h-icon-all-question-circle"></span>
          </a-tooltip>
        </template>
        <notification type="CIRCULATE" />
      </a-collapse-panel>

      <!-- 参与者设置 -->
      <a-collapse-panel key="2" header="参与者">
        <participant type="CIRCULATE" />
      </a-collapse-panel>

      <!-- 事件处理 -->
      <a-collapse-panel key="3" header="事件处理">
        <activity-event type="CIRCULATE" />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script lang="ts">
import { Collapse, Tooltip } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import ActivityEvent from './property/activityEvent.vue';
import commonSetting from './property/commonSetting.vue';
import Notification from './property/notification.vue';
import Participant from './property/participant.vue';

@Component({
  name: 'CirculateProperty',
  components: {
    commonSetting,
    Participant,
    ActivityEvent,
    Notification,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ATooltip: Tooltip,
  },
})
export default class CirculateProperty extends Vue {}
</script>
<style lang="less" scoped>
.h-icon-all-question-circle {
  font-size: 13px;
  font-weight: 400;
  color: rgba(17, 18, 24, 0.25);
  padding-left: 2px;
}
</style>

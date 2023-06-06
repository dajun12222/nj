<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="activity-event-panel">
    <!-- 活动激活前 -->
    <property-widget
      label="活动激活前"
      tip="在活动由系统创建之前，系统内部触发的事件"
    >
      <template>
        <template slot="title-right">
          <em
            class="icon aufontAll h-icon-all-setting-o"
            @click="beforeActive"
          ></em>
        </template>

        <div v-if="eventSetting.beforeActivate" slot="right" class="right-box">
          <is-seted
            value="已设置"
            :showDel="true"
            :showEllipsis="false"
            @click="beforeActive"
            @delete="onActiveDelete('beforeActivate')"
          />
        </div>
      </template>
    </property-widget>

    <!-- 活动激活后 -->
    <property-widget
      label="活动激活后"
      tip="在活动由系统创建之后，系统内部立即触发的事件"
    >
      <template slot="title-right">
        <em
          class="icon aufontAll h-icon-all-setting-o"
          @click="afterActive"
        ></em>
      </template>

      <div v-if="eventSetting.afterActivate" slot="right" class="right-box">
        <is-seted
          value="已设置"
          :showDel="true"
          :showEllipsis="false"
          @click="afterActive"
          @delete="onActiveDelete('afterActivate')"
        />
      </div>
    </property-widget>

    <!-- 活动完成后 -->
    <property-widget
      label="活动完成后"
      tip="在活动完成后，由系统内部立即触发的事件"
    >
      <template slot="title-right">
        <em
          class="icon aufontAll h-icon-all-setting-o"
          @click="afterCompleted"
        ></em>
      </template>

      <div v-if="eventSetting.endActivity" slot="right" class="right-box">
        <is-seted
          value="已设置"
          :showDel="true"
          :showEllipsis="false"
          @click="afterCompleted"
          @delete="onActiveDelete('endActivity')"
        />
      </div>
    </property-widget>

    <!-- 活动取消 -->
    <property-widget
      v-if="type === 'PARTICIPANT'"
      label="活动取消"
      tip="在活动被取消时，由系统内部立即调用的事件"
    >
      <template slot="title-right">
        <em
          class="icon aufontAll h-icon-all-setting-o"
          @click="activityCancel"
        ></em>
      </template>

      <div v-if="eventSetting.cancelActivity" slot="right" class="right-box">
        <is-seted
          value="已设置"
          :showDel="true"
          :showEllipsis="false"
          @click="activityCancel"
          @delete="onActiveDelete('cancelActivity')"
        />
      </div>
    </property-widget>

    <!-- 任务提交后 -->
    <property-widget
      v-if="type === 'PARTICIPANT'"
      label="任务提交后"
      tip="当活动中的某个任务提交后，由系统内部立即调用的事件"
    >
      <template slot="title-right">
        <em
          class="icon aufontAll h-icon-all-setting-o"
          @click="afterSubmit"
        ></em>
      </template>

      <div v-if="eventSetting.jobSubmitted" slot="right" class="right-box">
        <is-seted
          value="已设置"
          :showDel="true"
          :showEllipsis="false"
          @click="afterSubmit"
          @delete="onActiveDelete('jobSubmitted')"
        />
      </div>
    </property-widget>

    <!-- 任务驳回后 -->
    <property-widget
      v-if="type === 'PARTICIPANT'"
      label="任务驳回后"
      tip="当活动中的某个任务驳回后，由系统内部立即调用的事件"
    >
      <template slot="title-right">
        <em
          class="icon aufontAll h-icon-all-setting-o"
          @click="afterReject"
        ></em>
      </template>

      <div v-if="eventSetting.jobRejected" slot="right" class="right-box">
        <is-seted
          value="已设置"
          :showDel="true"
          :showEllipsis="false"
          @click="afterReject"
          @delete="onActiveDelete('jobRejected')"
        />
      </div>
    </property-widget>

    <!-- 事件抽屉 -->
    <event-handler
      v-model="showEventHandler"
      :eventObj="eventObj"
      :nodeType="type"
      @saveEvent="saveEvent"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ellipsisInput from '../base/ellipsisInput.vue';
import PropertyWidget from '../base/propertyWidget.vue';
import EventHandler from '../modals/eventHandler.vue';

const WorkflowModule = namespace('Apps/Workflow');
import IsSeted from '../base/is-seted.vue';

@Component({
  name: 'ActivityEvent',
  components: {
    PropertyWidget,
    ellipsisInput,
    EventHandler,
    IsSeted,
  },
})
export default class ActivityEvent extends Vue {
  @WorkflowModule.State((state) => state.selectedActivities[0] || {})
  currentActivity: any;

  @WorkflowModule.State('curActivityProps') curActivityProps: any;

  @Prop() type!: string;

  eventObj: any = {};

  showEventHandler: boolean = false;

  // 事件是否设置
  eventSetting: any = {
    beforeActivate: false,
    afterActivate: false,
    endActivity: false,
    cancelActivity: false,
    jobSubmitted: false,
    jobRejected: false,
  };

  beforeMount() {
    this.dataMounted();
  }

  // 数据渲染
  dataMounted() {
    if (!this.curActivityProps.acticityEvent) {
      return;
    }
    Object.keys(this.eventSetting).forEach((key: any) => {
      const data = this.curActivityProps.acticityEvent[key];

      if (data) {
        if (
          data.receiver ||
          (data.dataDisposals && data.dataDisposals.length) ||
          (data.bizActions && data.bizActions.length) ||
          data.cancelParllelActivity ||
          !data.rejectCancelParllelActivity ||
          data.emailReceiver ||
          (data.emailContent && data.emailContent.lenght) ||
          (data.smsDisposal &&
            data.smsDisposal.smsCode &&
            data.smsDisposal.receiver &&
            data.smsDisposal.receiver)
        ) {
          this.eventSetting[key] = true;
        } else {
          this.eventSetting[key] = false;
        }
      }
    });
  }

  // 活动激活前
  beforeActive() {
    this.eventObj = {
      eventTitle: '活动激活前',
      eventCode: 'beforeActivate',
    };
    this.showEventHandler = true;
  }

  // 活动激活后
  afterActive() {
    this.eventObj = {
      eventTitle: '活动激活后',
      eventCode: 'afterActivate',
    };
    this.showEventHandler = true;
  }

  // 活动完成后
  afterCompleted() {
    this.eventObj = {
      eventTitle: '活动完成后',
      eventCode: 'endActivity',
    };
    this.showEventHandler = true;
  }

  // 活动取消
  activityCancel() {
    this.eventObj = {
      eventTitle: '活动取消',
      eventCode: 'cancelActivity',
    };
    this.showEventHandler = true;
  }

  // 任务提交后
  afterSubmit() {
    this.eventObj = {
      eventTitle: '任务提交后',
      eventCode: 'jobSubmitted',
    };
    this.showEventHandler = true;
  }

  // 任务驳回后
  afterReject() {
    this.eventObj = {
      eventTitle: '任务驳回后',
      eventCode: 'jobRejected',
    };
    this.showEventHandler = true;
  }

  /**
   * 任务事件移除
   */
  onActiveDelete(activeType) {
    this.curActivityProps.acticityEvent[activeType] = {
      bizActions: [],
      receiver: '',
      emailReceiver: '',
      smsReceiver: '',
      title: [],
      emailTitle: [],
    };
    this.eventSetting[activeType] = false;
  }

  // 事件抽屉保存事件
  saveEvent(data: any) {
    const vm = this;
    Object.keys(this.eventSetting).forEach((s: any) => {
      if (s === data.code) {
        vm.eventSetting[s] = data.isSetting;
      }
    });
    console.log(vm.eventSetting);
  }

  @Watch('currentActivity')
  onActivityChange(v: string) {
    this.dataMounted();
  }
}
</script>

<style lang="less" scoped>
.right-box {
  width: 100%;
  display: flex;
  align-items: center;
}
</style>

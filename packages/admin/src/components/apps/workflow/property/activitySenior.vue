<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-item">
    <property-widget label="超时条件">
      <template>
        <div slot="right" class="over-time-policy">
          <a-select
            v-model="timeoutCondition"
            placeholder="请选择"
            class="input-select"
            @select="selectChangeTimeout"
          >
            <a-select-option
              v-for="(item, index) in conditionData"
              :key="index"
              :value="item.type"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
          <!-- <a-radio-group
            v-model="timeoutCondition"
            @change="(e) => selectChangeTimeout(e.target.value)"
          >
            <a-radio
              v-for="(item, index) in conditionData"
              :key="index"
              :value="item.type"
            >
              {{ item.name }}
            </a-radio>
          </a-radio-group> -->
        </div>
      </template>
    </property-widget>

    <template v-if="timeoutCondition">
      <property-widget
        label="超时时间"
        tip="设定当前任务的许可时间，超过该时间系统即认为该任务超时"
      >
        <template slot="title-right">
          <em
            class="icon aufontAll h-icon-all-setting-o"
            @click="showModal = true"
          ></em>
        </template>

        <template v-if="timeoutTime" slot="right">
          <is-seted
            :value="timeoutTime"
            :showDel="false"
            :showEllipsis="true"
            @click="showModal = true"
          />
        </template>
      </property-widget>
      <!-- 超时后策略 -->
      <property-widget label="超时后策略">
        <template>
          <div slot="right" class="over-time-policy">
            <a-radio-group
              v-model="timeoutStrategy"
              @change="(e) => selectChange(e.target.value)"
            >
              <a-radio
                v-for="(item, index) in selectData"
                :key="index"
                :value="item.type"
              >
                {{ item.name }}
              </a-radio>
            </a-radio-group>
          </div>
        </template>
      </property-widget>
    </template>

    <!-- 限时时间设置弹窗 -->
    <limited-time
      v-model="showModal"
      :timeItem="timeItems"
      :formDataItem="formDataItem"
      :timeoutCondition="timeoutCondition"
      @close="showModal = false"
      @submit="limitedTimeSubmit"
    />

    <property-widget label="表单锁策略">
      <template>
        <div slot="right" class="over-time-policy">
          <a-radio-group
            v-model="lockType"
            @change="(e) => selectTableLock(e.target.value)"
          >
            <a-radio
              v-for="(item, index) in tableLockSelectData"
              :key="index"
              :value="item.type"
            >
              {{ item.name }}
            </a-radio>
          </a-radio-group>
        </div>
      </template>
    </property-widget>
  </div>
</template>

<script lang="ts">
import { Select, Radio } from '@h3/antd-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import EllipsisInput from '../base/ellipsisInput.vue';
import PropertyWidget from '../base/propertyWidget.vue';
import LimitedTime from '../modals/limitedTime.vue';

const WorkflowModule = namespace('Apps/Workflow');
import IsSeted from '../base/is-seted.vue';

@Component({
  name: 'ActivitySenior',
  components: {
    PropertyWidget,
    EllipsisInput,
    LimitedTime,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    IsSeted,
  },
})
export default class ActivitySenior extends Vue {
  @WorkflowModule.State((state) => state.selectedActivities[0] || {})
  currentActivity: any;

  @WorkflowModule.State('curActivityProps') curActivityProps: any;

  @WorkflowModule.State('WorkflowDataItem_all') WorkflowDataItem_all: any;

  @WorkflowModule.Mutation('setPropValue') setPropValue: any;

  showModal: boolean = false;

  timeoutStrategy: string = 'NOTIFY_HANDLER';

  lockType: string = 'NONE';

  timeoutCondition: any = null;

  timeItem: any = {
    allowedTime: '',
    timeoutWarning1: '',
    timeoutWarning2: '',
  };

  timeItems: any = {
    allowedTime: '',
    enable: false,
    timeoutWarning1: '',
    timeoutWarning2: '',
  };

  timeoutTime: any = '';

  timeData: any = [
    {
      label: '限时时间',
      type: 'allowedTime',
      value: '',
      tip: '设定当前任务的许可时间，超过该时间系统即认为该任务超时',
    },
    {
      label: '超时预警1',
      type: 'timeoutWarning1',
      value: '',
      tip: '设置第一次即将超时提醒的时间，即将到达超时时间前的4小时，待办列表要显示为黄色',
    },
    {
      label: '超时预警2',
      type: 'timeoutWarning2',
      value: '',
      tip: '设置第二次提醒的时间，即将到达超时时间前的2小时，待办列表要显示为橙色',
    },
  ];

  conditionData: any[] = [
    {
      name: '请选择超时条件',
      type: '',
    },
    {
      name: '根据表单内字段触发',
      type: 'in_form',
    },
    {
      name: '流程到达该节点后',
      type: 'post_node',
    },
  ];

  selectData: any = [
    {
      name: '传阅上级主管',
      type: 'CIRCULATE_MANAGER',
    },
    {
      name: '直接进入下一节点',
      type: 'APPROVE',
    },
    {
      name: '钉钉/微信消息通知处理人',
      type: 'NOTIFY_HANDLER',
    },

    // 20191204 迭代26需求
    // {
    //   name: '转办上级主管',
    //   type: 'FORWARD_MANAGER'
    // }
  ];

  tableLockSelectData: any = [
    {
      name: '不执行锁定',
      type: 'NONE',
    },
    // {
    //   name: "打开表单时锁定",
    //   type: "1",
    // },
    {
      name: '提交表单时锁定',
      type: 'SUBMIT',
    },
  ];

  formDataItem: any = null;

  beforeMount() {
    this.dataMounted();
  }

  // 限时弹窗提交事件
  limitedTimeSubmit(time: any) {
    const objLength = Object.keys(this.curActivityProps.activitySenior).length;
    if (objLength) {
      if (
        (time.processTime && this.timeoutCondition === 'post_node') ||
        (time.formId && this.timeoutCondition === 'in_form') ||
        time.enable
      ) {
        this.timeoutTime = '已设置';
      } else {
        this.timeoutTime = '';
      }
      this.timeItems = {
        processTime: time.processTime,
        formId: time.formId,
        enable: time.enable,
        timeConfig: time.timeConfig,
        timeoutWarning1: time.timeoutWarning1,
        timeoutWarning2: time.timeoutWarning2,
      };
      this.setPropValue({
        key: 'activitySenior.allowedTime',
        value: time.processTime + '',
      });
      this.setPropValue({
        key: 'activitySenior.timeoutWarning1',
        value: time.timeoutWarning1 + '',
      });
      this.setPropValue({
        key: 'activitySenior.timeoutWarning2',
        value: time.timeoutWarning2 + '',
      });
      this.setPropValue({
        key: 'activitySenior.timeoutTime',
        value: {
          formId: time.formId,
          enable: time.enable,
          timeConfig: time.timeConfig,
        },
      });
    }
  }

  // 时间毫秒数转时间段
  msecToTimeSpan(msec: number) {
    if (msec) {
      const days = Math.floor(msec / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (msec % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((msec % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((msec % (1000 * 60)) / 1000);
      return `${days}天${hours}小时${minutes}分${seconds}秒`;
    }
    return '';
  }

  // 超时后策略改变事件
  selectChange(value: any) {
    this.timeoutStrategy = value;
    const objLength = Object.keys(this.curActivityProps.activitySenior).length;
    if (objLength) {
      this.setPropValue({ key: 'activitySenior.timeoutStrategy', value });
    }
  }

  // 超时后策略改变事件
  selectChangeTimeout(value: any) {
    this.timeoutCondition = value;
    const objLength = Object.keys(this.curActivityProps.activitySenior).length;
    if (objLength) {
      this.timeoutTime = '';
      this.timeItems = {
        processTime: 0,
        formId: '',
        enable: false,
        timeConfig: 'then',
        timeoutWarning1: 0,
        timeoutWarning2: 0,
      };
      this.setPropValue({
        key: 'activitySenior.allowedTime',
        value: 0,
      });
      this.setPropValue({
        key: 'activitySenior.timeoutWarning1',
        value: 0,
      });
      this.setPropValue({
        key: 'activitySenior.timeoutWarning2',
        value: 0,
      });
      this.setPropValue({
        key: 'activitySenior.timeoutTime',
        value: {
          formId: '',
          enable: false,
          timeConfig: 'then',
        },
      });
      this.setPropValue({ key: 'activitySenior.timeoutCondition', value });
    }
  }

  selectTableLock(value: any) {
    this.setPropValue({ key: 'activitySenior.lockType', value });
  }

  // 根据数据初始化视图
  dataMounted() {
    this.formDataItem = this.WorkflowDataItem_all.filter(
      (i: any) =>
        i.propertyType === 3 &&
        (i.code === 'modifiedTime' ||
          i.code === 'createdTime' ||
          i.format === 'YYYY-MM-DD' ||
          i.format === 'YYYY-MM-DD HH:mm' ||
          i.format === 'YYYY-MM-DD HH:mm:ss'),
    );

    if (Object.keys(this.curActivityProps.activitySenior).length) {
      const activitySeniorArray = Object.entries(
        this.curActivityProps.activitySenior,
      );
      this.lockType = this.curActivityProps.activitySenior.lockType || 'NONE';
      const activitySenior: any = this.curActivityProps.activitySenior;

      if (!activitySenior.timeoutCondition && activitySenior.allowedTime) {
        this.timeoutCondition = 'post_node';
        this.timeoutTime = '已设置';
        activitySenior.timeoutCondition = 'post_node';
      } else {
        this.timeoutTime =
          (activitySenior.timeoutCondition === 'in_form' &&
            activitySenior.timeoutTime.formId) ||
          (activitySenior.timeoutCondition === 'post_node' &&
            activitySenior.allowedTime)
            ? '已设置'
            : '';
        this.timeoutCondition = activitySenior.timeoutCondition;
      }
      this.timeItems = {
        processTime: activitySenior.allowedTime,
        formId: activitySenior.timeoutTime
          ? activitySenior.timeoutTime.formId
          : '',
        enable:
          activitySenior.timeoutWarning1 || activitySenior.timeoutWarning2
            ? true
            : false,
        timeConfig: activitySenior.timeoutTime
          ? activitySenior.timeoutTime.timeConfig
          : '',
        timeoutWarning1: activitySenior.timeoutWarning1,
        timeoutWarning2: activitySenior.timeoutWarning2,
      };
      activitySeniorArray.forEach((a: any) => {
        if (!a && !a[0] && !a[1]) {
          return;
        }
        const [key, value] = a;
        if (key === 'timeoutStrategy') {
          // 迭代26 删除转办上级主管 兼容数据
          if (value === 'FORWARD_MANAGER') {
            this.timeoutStrategy = '转办上级主管';
          } else {
            this.timeoutStrategy = value;
          }
          return;
        }
        // this.timeData.forEach((t: any, i: string) => {
        //   if (t.type === key) {
        //     const val = typeof value === "string" ? Number(value) : value;
        //     this.timeItem[key] = val;
        //     t.value = this.msecToTimeSpan(val);
        //   }
        // });
      });
    }
  }

  @Watch('currentActivity')
  onActivityChange(v: string) {
    this.dataMounted();
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.data-item {
  color: @nav-font-color;
}
.over-time-policy {
  width: 100%;
  /deep/.ant-radio-wrapper {
    padding: 8px 0;
    // width: 100%;
    color: @nav-font-color;
  }
  /deep/.ant-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
  /deep/.ant-select {
    width: 100%;
  }
}
</style>

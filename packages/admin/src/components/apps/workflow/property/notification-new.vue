<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <!-- 消息通知：与store解耦组件 -->
  <div class="commonsetting-panel">
    <div class="message-notify-box">
      <property-widget label="钉钉/微信通知">
        <template slot="title-right">
          <a-switch
            v-model="dingtalkTodoDataItem.enable"
            size="small"
            @change="backData"
          />
        </template>

        <div
          v-if="dingtalkTodoDataItem.enable"
          slot="right"
          class="select-type"
        >
          <div class="row-item">
            <a-select
              v-model="dingtalkTodoDataItem.dataItemType"
              class="input-select"
              @change="dingtalkDataItemTypeChange"
            >
              <a-select-option
                v-for="(item, index) in dingtalkOptions"
                :key="index"
                :value="item.type"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <em
              v-if="dingtalkTodoDataItem.dataItemType === 1"
              class="icon aufontAll h-icon-all-setting-o"
              @click="setDingtalkNotify = true"
            ></em>
          </div>
        </div>
      </property-widget>

      <property-widget label="邮件通知">
        <template slot="title-right">
          <a-switch
            v-model="emailTodoDataItem.enable"
            size="small"
            @change="backData"
          />
        </template>

        <div v-if="emailTodoDataItem.enable" slot="right" class="select-type">
          <div class="row-item">
            <a-select
              v-model="emailTodoDataItem.dataItemType"
              class="input-select"
              @change="emailDataItemTypeChange"
            >
              <a-select-option
                v-for="(item, index) in emailOptions"
                :key="index"
                :value="item.type"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <em
              v-if="emailTodoDataItem.dataItemType === 1"
              class="icon aufontAll h-icon-all-setting-o"
              @click="setEmailNotify = true"
            ></em>
          </div>
        </div>
      </property-widget>

      <property-widget label="短信通知">
        <template slot="title-right">
          <a-switch
            v-model="smsTodoDataItem.enable"
            size="small"
            @change="backData"
          />
        </template>

        <div v-if="smsTodoDataItem.enable" slot="right" class="select-type">
          <div class="row-item">
            <a-select
              v-model="smsTodoDataItem.dataItemType"
              class="input-select"
              @change="smsDataItemTypeChange"
            >
              <a-select-option
                v-for="(item, index) in smsOptions"
                :key="index"
                :value="item.type"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <em
              v-if="smsTodoDataItem.dataItemType !== 0"
              class="icon aufontAll h-icon-all-setting-o"
              @click="setSmsNotify = true"
            ></em>
          </div>
        </div>
      </property-widget>
    </div>
    <MessageNotifyNew
      v-model="setDingtalkNotify"
      typeStatus="dingtalk"
      :data="dingtalkTodoDataItem"
      @ok="(val) => updateNotify('dingtalk', val)"
    />

    <MessageNotifyNew
      :key="smsTodoDataItem.dataItemType"
      v-model="setEmailNotify"
      typeStatus="email"
      :data="emailTodoDataItem"
      @ok="(val) => updateNotify('email', val)"
    />

    <smsMessageNotify
      v-model="setSmsNotify"
      :data="smsTodoDataItem"
      @ok="(val) => updateNotify('sms', val)"
    />
  </div>
</template>

<script lang="ts">
import OrgApi from '@/apis/organization';
import { Modal, Select, Tooltip, Switch, Input } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import PropertyWidget from '../base/propertyWidget.vue';
/* 弹窗 */
import MessageNotifyNew from '../modals/messageNotify-new.vue';
import smsMessageNotify from '../modals/smsMessageNotify.vue';

const WorkflowModule = namespace('Apps/Workflow');

enum NotifyType {
  default = 0, // 系统默认
  customerize = 1, // 自定义
  unset = 2, // 未设置
}

interface ToDoItem {
  belong: 'dingtalk' | 'email' | 'sms';
  dataItemType: 0 | 1 | 2;
  enable: boolean;
  smsCode: string | null;
  summary: Array<any> | '';
  title: Array<any> | '';
  type: number;
  isAuto?: boolean;
  summaryType?: boolean;
}

@Component({
  name: 'NotificationNew',
  components: {
    PropertyWidget,
    MessageNotifyNew,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    ATooltip: Tooltip,
    ASwitch: Switch,
    AInputTextarea: Input.TextArea,
    smsMessageNotify,
  },
})
export default class NotificationNew extends Vue {
  @Prop({ default: () => [] }) todoItems!: Array<ToDoItem>;

  @WorkflowModule.State('WorkflowDataItem_origin') WorkflowDataItemOrigin: any;

  setDingtalkNotify: boolean = false; // 是否弹出钉钉、微信通知设置

  setEmailNotify: boolean = false; // 是否弹出邮件通知设置

  setSmsNotify: boolean = false; // 是否弹出短信通知设置

  updateNotify(type: 'dingtalk' | 'email' | 'sms', value) {
    this[type + 'TodoDataItem'] = Object.assign(
      this[type + 'TodoDataItem'],
      value,
    );
    this.backData();
  }

  // 向外抛出值
  backData() {
    const emailTodoDataItem = JSON.parse(
      JSON.stringify(this.emailTodoDataItem),
    );
    const dingtalkTodoDataItem = JSON.parse(
      JSON.stringify(this.dingtalkTodoDataItem),
    );

    if (Array.isArray(emailTodoDataItem.summary)) {
      const res: any[] = [];
      emailTodoDataItem.summary.forEach((el) => {
        res.push({
          isDataItem: this.WorkflowDataItemOrigin.some(
            (item) => item.code === el,
          )
            ? 1
            : 0,
          code: el,
        });
      });
      emailTodoDataItem.summary = res;
    }

    if (Array.isArray(emailTodoDataItem.title)) {
      const res: any[] = [];
      emailTodoDataItem.title.forEach((el) => {
        res.push({
          isDataItem: this.WorkflowDataItemOrigin.some(
            (item) => item.code === el,
          )
            ? 1
            : 0,
          code: el,
        });
      });
      emailTodoDataItem.title = res;
    }

    if (Array.isArray(dingtalkTodoDataItem.summary)) {
      const res: any[] = [];
      dingtalkTodoDataItem.summary.forEach((el) => {
        res.push({
          isDataItem: this.WorkflowDataItemOrigin.some(
            (item) => item.code === el,
          )
            ? 1
            : 0,
          code: el,
        });
      });
      dingtalkTodoDataItem.summary = res;
    }

    if (typeof dingtalkTodoDataItem.summary === 'string') {
      const res: any[] = [];
      res.push({
        isDataItem: 2,
        code: dingtalkTodoDataItem.summary,
      });
      dingtalkTodoDataItem.summary = res;
    }

    if (Array.isArray(dingtalkTodoDataItem.title)) {
      const res: any[] = [];
      dingtalkTodoDataItem.title.forEach((el) => {
        res.push({
          isDataItem: this.WorkflowDataItemOrigin.some(
            (item) => item.code === el,
          )
            ? 1
            : 0,
          code: el,
        });
      });
      dingtalkTodoDataItem.title = res;
    }

    this.$emit('change', [
      emailTodoDataItem,
      dingtalkTodoDataItem,
      this.smsTodoDataItem,
    ]);
  }

  // 初始化
  init() {
    if (this.todoItems && this.todoItems.length) {
      this.emailTodoDataItem = this.todoItems.find(
        (el) => el.belong === 'email',
      ) as ToDoItem;
      this.dingtalkTodoDataItem = this.todoItems.find(
        (el) => el.belong === 'dingtalk',
      ) as ToDoItem;
      this.smsTodoDataItem = this.todoItems.find(
        (el) => el.belong === 'sms',
      ) as ToDoItem;

      if (Array.isArray(this.emailTodoDataItem.summary)) {
        this.emailTodoDataItem.summary = this.emailTodoDataItem.summary.map(
          (el) => el.code,
        );
      }
      if (Array.isArray(this.emailTodoDataItem.title)) {
        this.emailTodoDataItem.title = this.emailTodoDataItem.title.map(
          (el) => el.code,
        );
      }

      if (
        Array.isArray(this.dingtalkTodoDataItem.summary) &&
        this.dingtalkTodoDataItem.summary.length > 0
      ) {
        this.dingtalkTodoDataItem.summaryType =
          this.dingtalkTodoDataItem.summary[0].isDataItem === 2;

        if (this.dingtalkTodoDataItem.summaryType) {
          this.dingtalkTodoDataItem.summary =
            this.dingtalkTodoDataItem.summary.map((el) => el.code)[0];
        } else {
          this.dingtalkTodoDataItem.summary =
            this.dingtalkTodoDataItem.summary.map((el) => el.code);
        }
      }
      if (Array.isArray(this.dingtalkTodoDataItem.title)) {
        this.dingtalkTodoDataItem.title = this.dingtalkTodoDataItem.title.map(
          (el) => el.code,
        );
      }
    } else {
      // 向外同步值: 初始化一个消息通知的值
      this.backData();
    }
  }

  created() {
    this.init();
  }

  // 邮件通知选项
  emailOptions: Array<any> = [
    {
      type: NotifyType.unset,
      name: '未设置',
    },
    {
      type: NotifyType.customerize,
      name: '自定义',
    },
  ];

  // 短信通知选项
  smsOptions: Array<any> = [
    {
      type: 0,
      name: '未设置',
    },
    {
      type: 1,
      name: '默认消息',
    },
    {
      type: 2,
      name: '自定义',
    },
  ];

  // 钉钉通知选项
  dingtalkOptions: Array<any> = [
    // {
    //   type: NotifyType.unset,
    //   name: '未设置',
    // },
    {
      type: NotifyType.default,
      name: '默认消息',
    },
    {
      type: NotifyType.customerize,
      name: '自定义',
    },
  ];

  emailDataItemTypeChange(type) {
    this.emailTodoDataItem.summary = [];
    this.emailTodoDataItem.title = [];
    this.emailTodoDataItem = { ...this.emailTodoDataItem };

    this.backData();
  }

  dingtalkDataItemTypeChange(type) {
    this.dingtalkTodoDataItem.summary = [];
    this.dingtalkTodoDataItem.title = [];
    this.dingtalkTodoDataItem = { ...this.dingtalkTodoDataItem };

    this.backData();
  }

  smsDataItemTypeChange(type) {
    this.smsTodoDataItem.summary = [];
    this.smsTodoDataItem.smsCode = '';
    this.smsTodoDataItem.type = type;
    this.smsTodoDataItem = { ...this.smsTodoDataItem };

    this.backData();
  }

  // 邮件通知默认值
  emailTodoDataItem: ToDoItem = {
    belong: 'email',
    dataItemType: 2,
    enable: false,
    smsCode: null,
    summary: [],
    title: [],
    type: 0,
  };

  // 钉钉/微信通知默认值
  dingtalkTodoDataItem: ToDoItem = {
    belong: 'dingtalk',
    dataItemType: 0,
    enable: true,
    smsCode: null,
    summary: [],
    title: [],
    type: 0,
    summaryType: false,
  };

  // 短信通知默认值
  smsTodoDataItem: ToDoItem = {
    belong: 'sms',
    dataItemType: 0,
    enable: false,
    isAuto: true,
    smsCode: '',
    title: [],
    summary: [],
    type: 0,
  };
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.modal-wrapper {
  max-height: 400px;
  overflow-y: auto;
  .modal-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    label {
      display: block;
      font-size: 14px;
      color: @nav-font-color;
      margin-bottom: 6px;
      margin-top: 16px;
    }
    &:first-child {
      label {
        margin-top: 0;
      }
    }
  }
}

.prames-list {
  .list-header {
    line-height: 17px;
    font-size: 12px;
    display: flex;
    color: @nav-font-color;
    font-weight: 600;
  }
  .list-body {
    .list-item {
      height: 32px;
      line-height: 32px;
      display: flex;
      margin-top: 8px;
    }
  }
  .list-name {
    width: 88px;
    text-align: left;
    margin-right: 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: @nav-font-color;
    span {
      display: inline-block;
      width: 70px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .list-info {
    flex: 1;
    display: flex;
    align-items: center;
    i {
      margin-left: 6px;
    }
  }
}
.item-title {
  height: 22px;
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(17, 18, 24, 0.5);
  line-height: 22px;
  margin: 35px 0 12px 0;
}

.row-item {
  display: flex;
  width: 100%;
  em {
    line-height: 32px;
    margin-left: 8px;
    font-size: 14px;
    color: @nav-font-color;
    cursor: pointer;
  }
}
</style>

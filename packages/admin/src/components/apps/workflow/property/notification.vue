<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="commonsetting-panel">
    <!-- 消息通知 -->
    <!-- 20200114 子流程需要设置消息通知 -->
    <template
      v-if="
        type === 'PARTICIPANT' ||
        type === 'SUB_INSTANCE' ||
        type === 'CIRCULATE'
      "
    >
      <div class="message-notify-box">
        <property-widget label="钉钉/微信通知">
          <template slot="title-right">
            <a-tooltip placement="topRight">
              <template v-if="dingtalkDisable" slot="title">
                <span class="open-tips">请先开启流程消息</span>
              </template>
              <template v-else-if="!dingtalkTodoDataItem.enable" slot="title">
                <span class="open-tips">开关关闭后，将不会收到消息通知。</span>
              </template>
              <a-switch
                v-model="dingtalkTodoDataItem.enable"
                :disabled="dingtalkDisable"
                size="small"
              />
            </a-tooltip>
          </template>
          <div
            v-if="dingtalkTodoDataItem.enable"
            slot="right"
            class="select-type"
          >
            <div class="row-item">
              <a-tooltip placement="top">
                <template v-if="dingtalkDisable" slot="title">
                  <span class="open-tips">请先开启流程消息</span>
                </template>
                <a-select
                  v-model="dingtalkTodoDataItem.dataItemType"
                  class="input-select"
                  :disabled="dingtalkDisable"
                  @change="changeNotifyType"
                >
                  <a-select-option
                    v-for="(item, index) in options"
                    :key="index"
                    :value="item.type"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-tooltip>
              <a-tooltip
                v-if="dingtalkTodoDataItem.dataItemType === 1"
                placement="topRight"
              >
                <template v-if="dingtalkDisable" slot="title">
                  <span class="open-tips">请先开启流程消息</span>
                </template>
                <em
                  class="icon aufontAll h-icon-all-setting-o"
                  :class="dingtalkDisable ? 'disable' : ''"
                  @click="showNotifyModal"
                ></em>
              </a-tooltip>
            </div>
          </div>
        </property-widget>

        <!-- <property-widget v-show="isShowDataTitle" label="自定义内容">
          <div slot="right" class="right-box">
            <ellipsis-input :value="messageTxt" @click="showNotifyModal" />
          </div>
        </property-widget> -->

        <property-widget label="邮件通知">
          <template slot="title-right">
            <a-tooltip placement="topRight">
              <template v-if="emailDisable" slot="title">
                <span class="open-tips">请先开启流程消息</span>
              </template>
              <template v-else-if="!emailTodoDataItem.enable" slot="title">
                <span class="open-tips">开关关闭后，将不会收到消息通知。</span>
              </template>
              <a-switch
                v-model="emailTodoDataItem.enable"
                :disabled="emailDisable"
                size="small"
              />
            </a-tooltip>
          </template>

          <div v-if="emailTodoDataItem.enable" slot="right" class="right-box">
            <div class="row-item">
              <a-tooltip placement="top">
                <template v-if="emailDisable" slot="title">
                  <span class="open-tips">请先开启流程消息</span>
                </template>
                <a-select
                  v-model="emailTodoDataItem.dataItemType"
                  class="input-select"
                  :disabled="emailDisable"
                  @change="typeChange(emailTodoDataItem)"
                >
                  <a-select-option
                    v-for="(item, index) in emailOptions"
                    :key="index"
                    :value="item.type"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-tooltip>
              <a-tooltip
                v-if="emailTodoDataItem.dataItemType === 1"
                placement="topRight"
              >
                <template v-if="emailDisable" slot="title">
                  <span class="open-tips">请先开启流程消息</span>
                </template>
                <em
                  class="icon aufontAll h-icon-all-setting-o"
                  :class="emailDisable ? 'disable' : ''"
                  @click="handleClickEmailNotify"
                ></em>
              </a-tooltip>
            </div>

            <!-- <ellipsis-input
              :value="messageTxts"
              @click="handleClickEmailNotify"
            /> -->
          </div>
        </property-widget>

        <property-widget label="短信通知">
          <template slot="title-right">
            <a-tooltip placement="topRight">
              <template v-if="smsDisable" slot="title">
                <span class="open-tips">请先开启流程消息</span>
              </template>
              <template v-else-if="!emailTodoDataItem.enable" slot="title">
                <span class="open-tips">开关关闭后，将不会收到消息通知。</span>
              </template>
              <a-switch
                v-model="smsTodoDataItem.enable"
                :disabled="smsDisable"
                size="small"
              />
            </a-tooltip>
          </template>
          <div v-if="smsTodoDataItem.enable" slot="right" class="right-box">
            <div class="row-item">
              <a-tooltip placement="top">
                <template v-if="smsDisable" slot="title">
                  <span class="open-tips">请先开启流程消息</span>
                </template>
                <a-select
                  v-model="curActivityProps.todoDataItem.type"
                  class="input-select"
                  :disabled="smsDisable"
                  @change="smsTypeChange"
                >
                  <a-select-option :value="0">
                    使用流程消息配置
                  </a-select-option>
                  <a-select-option :value="1"> 默认消息 </a-select-option>
                  <a-select-option :value="2"> 自定义 </a-select-option>
                </a-select>
              </a-tooltip>
              <a-tooltip
                v-if="curActivityProps.todoDataItem.type !== 0"
                placement="topRight"
              >
                <template v-if="smsDisable" slot="title">
                  <span class="open-tips">请先开启流程消息</span>
                </template>
                <em
                  class="icon aufontAll h-icon-all-setting-o"
                  :class="smsDisable ? 'disable' : ''"
                  @click="toShowSmsTemplateSetting"
                ></em>
              </a-tooltip>
            </div>
          </div>
        </property-widget>
      </div>
    </template>
    <!-- 消息通知弹窗 -->
    <MessageNotify
      v-model="isShowMessageNotify"
      typeStatus="dingtalk"
      @ok="updateNotify"
    />

    <MessageNotify
      v-model="isShowEmailNotify"
      :titleContent="titleContent"
      typeStatus="email"
      @ok="updateNotifyEmail"
    />

    <a-modal
      title="短信通知设置"
      width="420px"
      :visible="showSmsTemplateSetting"
      wrapClassName="notify-modal"
      :cancelText="$t('languages.Apps.Cancel')"
      :okText="$t('languages.Apps.Ok')"
      class="modal"
      :maskClosable="false"
      :keyboard="false"
      @cancel="showSmsTemplateSetting = false"
      @ok="handleOk"
    >
      <div class="modal-wrapper">
        <div class="modal-list">
          <label>短信模板</label>
          <div>
            <a-select
              v-model="smsCode"
              class="input-select"
              style="width: 100%"
              :disabled="curActivityProps.todoDataItem.type === 1"
              placeholder="请选择"
              @change="smsCodeChange"
            >
              <a-select-option
                v-for="(item, index) in filterSmsTemplateList"
                :key="index"
                :value="item.code"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </div>
        </div>

        <div class="modal-list">
          <label>短信内容</label>
          <div>
            <a-input-textarea
              v-model="getSmsDisposalContent"
              class="input--textarea"
              :disabled="true"
            />
          </div>
        </div>
        <div class="modal-list">
          <label>参数对应数据项设置</label>
          <div class="prames-list">
            <div class="list-header">
              <div class="list-name">参数列表</div>
              <div class="list-info">数据项设置</div>
            </div>
            <div class="list-body">
              <div
                v-for="(item, index) in paramsList"
                :key="index"
                class="list-item"
              >
                <div :title="item.key" class="list-name">
                  <span>{{ '${' + `${item.key}` + '}' }}</span>
                  <a-tooltip
                    v-if="item.value"
                    placement="top"
                    overlayClassName="black-tooltip"
                  >
                    <template slot="title">
                      {{ item.value }}
                    </template>
                    <i class="icon aufontAll h-icon-all-question-circle-o"></i>
                  </a-tooltip>
                </div>
                <div class="list-info">
                  <a-select
                    v-model="item.param"
                    class="input-select input-select-text"
                    :getPopupContainer="getPopupContainer"
                    :placeholder="$t('languages.PlaceHolder.Select')"
                    style="width: 100%"
                  >
                    <a-select-opt-group>
                      <span slot="label" class="select-title">业务数据项</span>
                      <a-select-option
                        v-for="i in bizSummaryList"
                        :key="i.code"
                      >
                        {{ i.name }}
                      </a-select-option>
                    </a-select-opt-group>
                    <a-select-opt-group>
                      <span slot="label" class="select-title">系统数据项</span>
                      <a-select-option
                        v-for="i in defaultSummaryList"
                        :key="i.code"
                      >
                        {{ i.name }}
                      </a-select-option>
                    </a-select-opt-group>
                  </a-select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import OrgApi from '@/apis/organization';
import { Modal, Select, Tooltip, Switch, Input } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import PropertyWidget from '../base/propertyWidget.vue';
/* 弹窗 */
import MessageNotify from '../modals/messageNotify.vue';

const WorkflowModule = namespace('Apps/Workflow');

const AppCenterModule = namespace('Apps/AppCenter');

enum NotifyType {
  default = 0,
  customerize = 1,
  unset = 2,
}

@Component({
  name: 'Notification',
  components: {
    PropertyWidget,
    MessageNotify,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    ATooltip: Tooltip,
    ASwitch: Switch,
    AInputTextarea: Input.TextArea,
  },
})
export default class Notification extends Vue {
  /**
   * 类型，根据不同类型展示不同的的属性
   * 流程属性：'workflow'
   * 连接线：'line'
   * 节点：对应的 activityType
   *  */
  @Prop() type!: any;

  @WorkflowModule.State('curActivityProps') curActivityProps: any;

  @WorkflowModule.Mutation('setPropValue') setPropValue: any;

  @WorkflowModule.Mutation('setSmsPropValue') setSmsPropValue: any;

  @AppCenterModule.Action('getAppList') getAppList: any;

  @WorkflowModule.State('WorkflowDataItem_origin') WorkflowDataItemOrigin: any;

  @WorkflowModule.State('workflowData') workflowData: any;

  get getSmsDisposalContent() {
    const currentTenplate = this.filterSmsTemplateList.find(
      (el: any) => el.code === this.smsCode,
    );
    return currentTenplate && currentTenplate.content;
  }

  get defaultSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => data.defaultProperty,
    );
  }

  get emailDisable() {
    const item: any = this.workflowData.todoDataItems.find(
      (el) => el.belong === 'email',
    );
    return !item.enable;
  }

  get dingtalkDisable() {
    const item: any = this.workflowData.todoDataItems.find(
      (el) => el.belong === 'dingtalk',
    );
    return !item.enable;
  }

  get smsDisable() {
    const item: any = this.workflowData.todoDataItems.find(
      (el) => el.belong === 'sms',
    );
    return !item.enable;
  }

  get bizSummaryList(): any[] {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => !data.defaultProperty,
    );
  }

  get getSmsTemplateStatus() {
    if (
      this.curActivityProps &&
      this.curActivityProps.todoDataItems &&
      Array.isArray(this.curActivityProps.todoDataItems)
    ) {
      const item: any =
        this.curActivityProps.todoDataItems.find(
          (el: any) => el.belong === 'sms',
        ) || {};
      if (
        item.smsCode &&
        (item.summary as any[]).every((el: any) => el.param) &&
        !item.isAuto
      ) {
        this.getEnableSmsTemplateList();
        return '已设置';
      }
    }
    return '未设置';
  }

  emailTodoDataItem: any = {};

  dingtalkTodoDataItem: any = {};

  smsTodoDataItem: any = {};

  @Watch('curActivityProps.todoDataItems', {
    immediate: true,
  })
  onCurActivityPropsChange(val) {
    if (
      this.curActivityProps &&
      this.curActivityProps.todoDataItems &&
      Array.isArray(this.curActivityProps.todoDataItems)
    ) {
      const item: any =
        this.curActivityProps.todoDataItems.find(
          (el: any) => el.belong === 'sms',
        ) || {};
      if (item.smsCode) {
        this.smsCode = item.smsCode || undefined;
        this.getEnableSmsTemplateList();
      } else {
        this.smsCode = undefined;
        this.paramsList = [];
      }
    } else if (this.curActivityProps && !this.curActivityProps.todoDataItems) {
      this.curActivityProps.todoDataItems = [
        {
          belong: 'email',
          dataItemType: 2,
          enable: false,
          smsCode: null,
          summary: [],
          title: [],
          type: 0,
        },
        {
          belong: 'dingtalk',
          dataItemType: 2,
          enable: true,
          smsCode: null,
          summary: [],
          title: [],
          type: 0,
        },
        {
          belong: 'sms',
          dataItemType: 2,
          enable: false,
          isAuto: true,
          smsCode: '',
          summary: [],
        },
      ];
    } else {
      //Else Empty block statement
    }

    let emailTodoDataItem = this.curActivityProps.todoDataItems.find(
      (el) => el.belong === 'email',
    );
    if (!emailTodoDataItem) {
      emailTodoDataItem = {
        belong: 'email',
        dataItemType: 2,
        enable: true,
        smsCode: null,
        summary: [],
        title: [],
        type: 0,
      };
    }
    emailTodoDataItem.dataItemType = emailTodoDataItem.dataItemType
      ? emailTodoDataItem.dataItemType
      : this.emailTodoDataItem.summary &&
        this.emailTodoDataItem.summary.lenght !== 0
      ? 1
      : 2;
    this.emailTodoDataItem = emailTodoDataItem;

    let dingtalkTodoDataItem = this.curActivityProps.todoDataItems.find(
      (el) => el.belong === 'dingtalk',
    );
    if (!dingtalkTodoDataItem) {
      dingtalkTodoDataItem = {
        belong: 'dingtalk',
        dataItemType: 0,
        enable: true,
        smsCode: null,
        summary: [],
        title: [],
        type: 0,
      };
    }
    this.dingtalkTodoDataItem = dingtalkTodoDataItem;

    let smsTodoDataItem = this.curActivityProps.todoDataItems.find(
      (el) => el.belong === 'sms',
    );
    if (!smsTodoDataItem) {
      smsTodoDataItem = {
        belong: 'sms',
        dataItemType: 2,
        enable: true,
        isAuto: true,
        smsCode: '',
        summary: [],
      };
    }
    this.smsTodoDataItem = smsTodoDataItem;
  }

  toShowSmsTemplateSetting() {
    if (this.smsDisable) {
      return;
    }
    this.onCurActivityPropsChange(this.curActivityProps.todoDataItems);
    this.showSmsTemplateSetting = true;

    if (!this.smsCode) {
      this.smsTypeChange(this.curActivityProps.todoDataItem.type);
    }
  }

  paramsList: any[] = [];

  showSmsTemplateSetting: boolean = false;

  smsCode: string = '';

  typeChange(data) {
    data.summary = [];
    data.title = [];

    this.setPropValue({
      key: 'todoDataItems',
      value: this.curActivityProps.todoDataItems,
    });
  }

  // 短信通知：类型改变
  smsTypeChange(value) {
    if (value) {
      this.getEnableSmsTemplateList();
    }

    const params: any = {
      dataItemType: this.curActivityProps.todoDataItem.type,
      belong: 'sms', //短信通知
      smsCode: '',
      summary: [],
      isAuto: true,
      enable: this.smsTodoDataItem.enable,
    };

    if (value === 1) {
      params.smsCode = 'Todo';
    }

    this.setSmsPropValue(params);

    this.onCurActivityPropsChange(this.curActivityProps.todoDataItems);
  }

  smsCodeChange(value) {
    const item: any = this.smsTemplateList.find((el: any) => el.code === value);
    if (item) {
      this.paramsList = JSON.parse(item.params);
    } else {
      this.paramsList = [];
    }
  }

  get filterSmsTemplateList() {
    if (this.curActivityProps.todoDataItem.type === 0) {
      return [];
    } else if (this.curActivityProps.todoDataItem.type === 1) {
      const res: any[] =
        this.smsTemplateList.filter((el) => el.type === '1') || [];
      this.smsCode = res[0] && res[0].code;
      const paramsList: any[] =
        (res[0] && res[0].params && JSON.parse(res[0].params)) || [];

      if (
        this.curActivityProps &&
        this.curActivityProps.todoDataItems &&
        Array.isArray(this.curActivityProps.todoDataItems)
      ) {
        const item: any =
          this.curActivityProps.todoDataItems.find(
            (el: any) => el.belong === 'sms',
          ) || {};

        console.log(this.curActivityProps.todoDataItems);
        if (item.smsCode) {
          paramsList.forEach((el: any) => {
            const it = item.summary.find((ele: any) => ele.param === el.key);
            if (it) {
              el.param = it.code;
            }
          });
        }
      }
      this.paramsList = paramsList;
      return res;
    } else {
      let item: any = {};
      if (this.smsCode) {
        item =
          this.smsTemplateList.find((el) => el.code === this.smsCode) || {};
      }
      const paramsList: any[] =
        (item && item.params && JSON.parse(item.params)) || [];

      if (
        this.curActivityProps &&
        this.curActivityProps.todoDataItems &&
        Array.isArray(this.curActivityProps.todoDataItems)
      ) {
        const item: any =
          this.curActivityProps.todoDataItems.find(
            (el: any) => el.belong === 'sms',
          ) || {};

        if (item.smsCode) {
          paramsList.forEach((el: any) => {
            const it = item.summary.find((ele: any) => ele.param === el.key);
            if (it) {
              el.param = it.code;
            }
          });
        }
      }
      this.paramsList = paramsList;

      return this.smsTemplateList;
    }
  }

  smsTemplateList: any[] = []; // 短信通知模板

  async getEnableSmsTemplateList() {
    await OrgApi.getEnableSmsTemplateList({}).then((res: any) => {
      if (res.errcode === 0) {
        this.smsTemplateList = res.data;
      }
    });
  }

  handleOk() {
    const params: any = {
      dataItemType: this.curActivityProps.todoDataItem.type,
      belong: 'sms', //短信通知
      smsCode: this.smsCode,
      summary: [],
      type: this.curActivityProps.todoDataItem.type,
      enable: this.smsTodoDataItem.enable,
    };

    const errList: any[] = [];
    this.paramsList.forEach((el: any) => {
      if (!el.param) {
        errList.push(el.key);
      }
      params.summary.push({
        isDataItem: 1,
        code: el.param,
        param: el.key,
      });
    });
    if (errList.length) {
      this.$message.warning(errList[0] + '参数未配置数据项');
      return;
    }

    this.setSmsPropValue(params);
    this.showSmsTemplateSetting = false;
  }

  get messageTxt() {
    // 迭代31
    // 反馈单 通知内容要求清空
    if (!this.curActivityProps || !this.curActivityProps.todoDataItem) {
      return '';
    }

    if (this.curActivityProps.todoDataItem.title) {
      if (this.curActivityProps.todoDataItem.title.length > 0) {
        return '已设置';
      }
    }

    if (this.curActivityProps.todoDataItem.summary) {
      if (this.curActivityProps.todoDataItem.summary.length > 0) {
        return '已设置';
      }
    }
    return '';
  }

  get messageTxts() {
    if (
      this.curActivityProps.todoDataItems &&
      this.curActivityProps.todoDataItems.length <= 0
    ) {
      return '';
    }

    let val = '';
    this.curActivityProps.todoDataItems &&
      this.curActivityProps.todoDataItems.forEach((i) => {
        if (i.belong === 'email') {
          if (i.title) {
            if (i.length > 0) {
              val = '已设置';
            }
          }

          if (i.summary) {
            if (i.summary.length > 0) {
              val = '已设置';
            }
          }
        }
      });

    return val;
  }

  emailOptions: Array<any> = [
    {
      type: NotifyType.unset,
      name: '使用流程消息配置',
    },
    {
      type: NotifyType.customerize,
      name: '自定义',
    },
  ];

  options: Array<any> = [
    {
      type: NotifyType.unset,
      name: '使用流程消息配置',
    },
    {
      type: NotifyType.default,
      name: '默认消息',
    },
    {
      type: NotifyType.customerize,
      name: '自定义',
    },
  ];

  titleContent = {
    title: '邮件通知内容设置',
    emailTitle: '邮件标题',
    emailContent: '邮件内容',
  };

  isShowMessageNotify: boolean = false; // 是否展示消息通知弹窗

  isShowEmailNotify: boolean = false;

  get isShowDataTitle() {
    if (this.curActivityProps.todoDataItem) {
      return (
        this.curActivityProps.todoDataItem.dataItemType ===
        NotifyType.customerize
      );
    }
    return false;
  }

  async mounted() {}

  /**
   * 弹出消息通知弹窗
   */
  showNotifyModal() {
    if (this.dingtalkDisable) {
      return;
    }
    this.isShowMessageNotify = true;
  }

  handleClickEmailNotify() {
    if (this.emailDisable) {
      return;
    }
    this.isShowEmailNotify = true;
  }

  /**
   * 更新消息通知数据
   */
  updateNotify(data: any) {
    const { title, summary } = data;
    this.setPropValue({
      key: 'todoDataItem.summary',
      value: summary,
    });

    this.setPropValue({
      key: 'todoDataItem.title',
      value: title,
    });

    this.handleSelectData(title, summary, 'dingtalk', 'email');
  }

  /**
   * 更新邮件消息通知数据
   */
  updateNotifyEmail(data: any) {
    const { title, summary } = data;
    this.handleSelectData(title, summary, 'email', 'dingtalk');
  }

  handleSelectData(title, summary, logo, logos) {
    const value: any = [{ dataItemType: 1, belong: logo, title, summary }];
    if (logo === 'email') {
      value[0].enable = this.emailTodoDataItem.enable;
    }
    if (logo === 'dingtalk') {
      value[0].enable = this.dingtalkTodoDataItem.enable;
    }

    if (
      this.curActivityProps.todoDataItems &&
      this.curActivityProps.todoDataItems.length > 0
    ) {
      this.curActivityProps.todoDataItems.forEach((v) => {
        if (v.belong === logos) {
          value.push(v);
        }
      });
    }

    const sms: any =
      (this.curActivityProps.todoDataItems &&
        this.curActivityProps.todoDataItems.find(
          (el: any) => el.belong === 'sms',
        )) ||
      '';
    if (sms) {
      value.push(sms);
    }
    this.setPropValue({
      key: 'todoDataItems',
      value,
    });
  }

  /**
   * 切换消息通知类型后，
   * 应该清空无效的消息内容
   */
  changeNotifyType(value: any) {
    if (value === NotifyType.customerize) {
      const { summary } = this.curActivityProps.todoDataItem;
      console.log('summary ->', summary);

      if (Array.isArray(summary) && summary.length) {
        this.setPropValue({
          key: 'todoDataItem.summary',
          value: '',
        });

        this.setPropValue({
          key: 'todoDataItem.title',
          value: [],
        });
        if (
          this.curActivityProps.todoDataItems &&
          this.curActivityProps.todoDataItems.lenght > 0
        ) {
          let val = this.curActivityProps.todoDataItems.filter(
            (v) => v.belong === 'email',
          );
          if (!val) {
            val = [
              {
                dataItemType: 1,
                belong: 'email',
                summary: [],
                title: [],
                enable: this.emailTodoDataItem.enable,
              },
            ];
          }
          this.setPropValue({
            key: 'todoDataItems',
            value: val,
          });
        }
      }
    } else {
      const val =
        this.curActivityProps.todoDataItems &&
        this.curActivityProps.todoDataItems.map((v) => {
          if (v.belong === 'dingtalk') {
            v.title = [];
            v.summary = [];
            v.enable = this.dingtalkTodoDataItem.enable;
          }
          return v;
        });
      const obj = this.curActivityProps.todoDataItem;
      obj.dataItemType = value;
      obj.title = [];
      obj.summary = '';
      this.setPropValue({
        key: 'todoDataItem',
        value: obj,
      });
      if (val) {
        this.setPropValue({
          key: 'todoDataItems',
          value: val,
        });
      }
    }
  }
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
    // & > div {

    // }
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
    &.disable {
      cursor: not-allowed;
      color: rgba(17, 18, 24, 0.5);
    }
  }
}
.open-tips {
  display: inline-block;
  white-space: nowrap;
}
</style>

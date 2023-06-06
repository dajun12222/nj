<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <!-- 流程运维弹窗页面 -->
  <div>
    <customPop
      v-model="modalShow"
      :titleStyle="{ 'font-weight': '600' }"
      :top="top"
      :height="popHeigth"
      width="708px"
      :zIndex="100"
      :okText="$t('languages.common.ok')"
      :cancelText="$t('languages.common.cancel')"
      @OK="popOK"
    >
      <template slot="title">
        {{ $t('languages.common.ProcessOperationAndMaintenance.title') }}
      </template>
      <template slot="content">
        <div id="current-node" v-if="participants.length" class="current-node">
          <div class="left">
            <div class="list">
              <label>{{ $t('languages.common.form.curActivity') }}</label>
              <div class="custom-select">
                <p v-if="participants.length">
                  {{ currentNode.activityName }}
                </p>
                <a-dropdown v-else>
                  <p>{{ currentNode.activityName }} <a-icon type="down" /></p>
                  <a-menu slot="overlay">
                    <a-menu-item
                      v-for="item in participants"
                      :key="item.activityCode"
                      @click="changeCurrentNode(item)"
                    >
                      {{ item.activityName }}
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </div>
            </div>
            <div class="list" style="flex: 1">
              <label>{{ $t('languages.common.form.resolver') }}</label>
              <div
                class="handler"
                :style="{ 'max-height': showAll ? 'auto' : undefined }"
              >
                <user-popover-ellipsis
                  :popoverClass="'display-popover-customize'"
                  :participantRelations="currentNode.participants"
                  popWidth="660px"
                  baseParent="#current-node"
                />

                <!-- {{currentNode && currentNode.participants && currentNode.participants.map(el => el.name).join('、') || ''}} -->
              </div>
              <!-- <template v-if="currentNode && currentNode.participants && currentNode.participants.map(el => el.name).join('、').length > 76">
                <span @click="showAll = false" v-if="showAll" class="icon-up icon aufontAll h-icon-all-double-up-o"></span>
                <span @click="showAll = true" v-else class="icon-up icon aufontAll h-icon-all-double-down-o"></span>
              </template> -->
            </div>
          </div>
          <div v-if="!isWORKFLOW_ADMIN" class="right">
            <a-popover placement="bottom" trigger="click">
              <a-button style="color: #111218">
                {{ $t('languages.common.form.WorkHandover') }}
              </a-button>

              <template slot="content">
                <div class="to-work-handover" @click="toWorkHandover('dep')">
                  <p>
                    {{ $t('languages.common.form.organization')
                    }}<i class="icon aufontAll h-icon-all-finder-o"></i>
                  </p>
                  <small style="margin-bottom: 20px">
                    {{ $t('languages.common.form.organizationTips1') }}
                  </small>
                </div>
                <div class="to-work-handover" @click="toWorkHandover('role')">
                  <p>
                    {{ $t('languages.common.form.organizationRole')
                    }}<i class="icon aufontAll h-icon-all-finder-o"></i>
                  </p>
                  <small>{{
                    $t('languages.common.form.organizationTips2')
                  }}</small>
                </div>
              </template>
            </a-popover>
          </div>
        </div>

        <!-- 选择流程操作 -->
        <div class="workflow-operation">
          <label>{{ $t('languages.common.form.SelectAction') }}</label>
          <div class="operations">
            <a-radio-group v-model="manage" @change="onManageChange">
              <div class="radio-wrapper">
                <a-radio
                  v-if="isShow('CANCELED_WORKFLOW')"
                  value="CANCELED_WORKFLOW"
                  :title="$t('languages.common.WorkflowActions.Nullify')"
                >
                  {{ $t('languages.common.WorkflowActions.Nullify') }}
                </a-radio>
                <a-radio
                  v-if="isShow('DELETE_WORKFLOW')"
                  value="DELETE_WORKFLOW"
                  :title="$t('languages.common.WorkflowActions.Delete')"
                >
                  {{ $t('languages.common.WorkflowActions.Delete') }}
                </a-radio>
                <a-radio
                  v-if="isShow('ACTIVATE_ACTIVITY')"
                  value="ACTIVATE_ACTIVITY"
                  :title="$t('languages.common.WorkflowActions.ActivateNode')"
                >
                  {{ $t('languages.common.WorkflowActions.ActivateNode') }}
                </a-radio>
                <a-radio
                  v-if="isShow('ADJUST_PARTICIPANT')"
                  value="ADJUST_PARTICIPANT"
                  :title="$t('languages.common.WorkflowActions.AdjustHandler')"
                >
                  {{ $t('languages.common.WorkflowActions.AdjustHandler') }}
                </a-radio>
                <a-radio
                  v-if="isShow('COMPLETED_WORKFLOW')"
                  value="COMPLETED_WORKFLOW"
                  :title="$t('languages.common.WorkflowActions.FinishInstance')"
                >
                  {{ $t('languages.common.WorkflowActions.FinishInstance') }}
                </a-radio>
                <a-radio
                  v-if="isShow('MODIFY_OWNER')"
                  value="MODIFY_OWNER"
                  :title="$t('languages.common.WorkflowActions.EditOwner')"
                >
                  {{ $t('languages.common.WorkflowActions.EditOwner') }}
                </a-radio>
                <a-radio
                  v-if="!isWORKFLOW_ADMIN"
                  value="xiugai"
                  :title="$t('languages.common.WorkflowActions.EditTemplate')"
                >
                  {{ $t('languages.common.WorkflowActions.EditTemplate') }}
                </a-radio>
                <a-radio
                  v-if="isShow('CANCELED_ACTIVITY_WORKITEM')"
                  value="CANCELED_ACTIVITY_WORKITEM"
                  :title="$t('languages.common.WorkflowActions.CancelAllTask')"
                >
                  {{ $t('languages.common.WorkflowActions.CancelAllTask') }}
                </a-radio>
              </div>
            </a-radio-group>
          </div>
        </div>

        <template v-if="manage">
          <!-- <template> -->

          <div v-if="manage === 'CANCELED_ACTIVITY_WORKITEM'" class="row-item">
            <!-- <label></label> -->
            <div>
              <p style="margin-bottom: 0" class="tips">
                <span
                  class="icon aufontAll h-icon-all-Components_Warning"
                ></span>{{ $t('languages.common.WorkflowActions.CancelTips1') }}
              </p>
            </div>
          </div>

          <div v-if="manage === 'ADJUST_PARTICIPANT'" class="row-item">
            <label>{{
              $t('languages.common.WorkflowActions.SelectHandler')
            }}</label>
            <div>
              <staff-selector
                v-model="userValue"
                :options="options"
                displayType="plus"
              />
              <!-- <Selector v-model="userValue" :options="options"></Selector> -->
            </div>
          </div>

          <!-- 激活其他节点 -->
          <div v-if="manage === 'ACTIVATE_ACTIVITY'" class="row-item">
            <label>{{
              $t('languages.common.WorkflowActions.SelectNode')
            }}</label>
            <div>
              <a-select
                v-model="activationActivityCode"
                style="width: 100%"
                :style="{
                  '--placeholder':
                    '\'' +
                    $t('languages.common.WorkflowActions.pleaseSelect') +
                    '\'',
                }"
                :class="{ 'show-placeholder': activationActivityCode === '' }"
              >
                <a-select-option
                  v-for="(opt, index) in nodes"
                  :key="index"
                  :value="opt.activityCode"
                  :title="opt.activityName"
                  :disabled="opt.status === 1"
                >
                  {{ opt.activityName }}
                </a-select-option>
              </a-select>
            </div>
          </div>

          <div v-if="manage === 'xiugai'" class="row-item">
            <label>{{
              $t('languages.common.WorkflowActions.EditTemplate')
            }}</label>
            <div class="to-template">
              <span
                class="to-modify-workflow-template"
                @click="toModifyWorkflowTemplate"
                >{{
                  isChinese
                    ? data.workflowName
                    : (data.name_i18n && data.name_i18n.en) || data.workflowName
                }}</span>
              <span
                class="icon aufontAll h-icon-all-finder-o"
                @click="toModifyWorkflowTemplate"
              ></span>
            </div>
          </div>

          <template v-if="manage === 'MODIFY_OWNER'">
            <div class="row-item">
              <label>{{
                $t('languages.common.WorkflowActions.EditOwner')
              }}</label>
              <div>
                <staff-selector
                  v-model="owner"
                  :options="taffSelectorOpts"
                  displayType="plus"
                  @change="onValueChange"
                />
              </div>
            </div>
            <div class="row-item">
              <label>{{ $t('languages.common.form.ownerDepartment') }}</label>
              <div>
                <a-select
                  v-model="departments"
                  style="width: 100%"
                  :placeholder="
                    $t('languages.common.WorkflowActions.pleaseSelect')
                  "
                  :disabled="!owner.length"
                >
                  <a-select-option
                    v-for="(opt, index) in departmentsList"
                    :key="index"
                    :value="opt.deptId"
                    :title="opt.deptName"
                  >
                    {{ opt.deptName }}
                  </a-select-option>
                </a-select>
              </div>
            </div>
          </template>

          <div
            v-if="!['xiugai', 'DELETE_WORKFLOW'].includes(manage)"
            class="row-item"
          >
            <label>{{
              $t('cloudpivot.flow.pc.approvalLog.handlingSuggestion')
            }}</label>
            <div class="comment-input">
              <a-textarea
                v-model="comment"
                :placeholder="$t('languages.common.placeholder')"
              />
              <span class="str-len">{{ comment.length }}/200</span>
              <comment ref="comment" />
            </div>
          </div>

          <template
            v-if="
              currentNode.workItemSource === 1 &&
              total &&
              ![
                'xiugai',
                'CANCELED_ACTIVITY_WORKITEM',
                'ACTIVATE_ACTIVITY',
              ].includes(manage)
            "
          >
            <div
              class="row-item"
              style="border-top: 1px solid #eee; padding-top: 21px"
            >
              <div class="multiplexing">
                <a-checkbox v-model="isMultiplexing" />
                <span>{{
                  $t(
                    'languages.common.ProcessOperationAndMaintenance.NoParticipantTips1',
                  )
                }}</span>

                <a-popover placement="top" overlayClassName="black-tooltip">
                  <template slot="content">
                    <p>
                      1.{{
                        $t(
                          'languages.common.ProcessOperationAndMaintenance.NoParticipantTips2',
                        )
                      }}
                    </p>
                    <p>
                      2.{{
                        $t(
                          'languages.common.ProcessOperationAndMaintenance.NoParticipantTips3',
                        )
                      }}
                    </p>
                  </template>
                  <i
                    style="font-size: 12px; color: #2970ff; margin-left: 5px"
                    class="icon aufontAll h-icon-all-question-circle-o"
                  ></i>
                </a-popover>
              </div>
            </div>

            <div class="row-item">
              <label></label>
              <div>
                <span class="show-other" @click="showNoParticipantsList = true">{{
                  $t(
                    'languages.common.ProcessOperationAndMaintenance.NoParticipantTips4',
                    {
                      name: isChinese
                        ? data.workflowName
                        : (data.name_i18n && data.name_i18n.en) ||
                          data.workflowName,
                      num: total,
                    },
                  )
                }}</span>
              </div>
            </div>
          </template>
        </template>
      </template>
    </customPop>

    <customPop
      v-model="tipsModalShow"
      width="432px"
      height="auto"
      :zIndex="101"
      top="20%"
      :okText="
        manage === 'DELETE_WORKFLOW'
          ? $t('languages.common.okAndDelete')
          : $t('languages.common.ok')
      "
      @OK="tipsOk"
    >
      <template slot="title">
        {{ tipsTitle }}
      </template>
      <template slot="content">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="tipsContent"></div>
      </template>
    </customPop>

    <customPop
      v-model="showNoParticipantsList"
      :titleStyle="titleStyle"
      width="1200px"
      height="auto"
      :zIndex="105"
      @OK="showNoParticipantsList = false"
    >
      <template slot="title">
        {{
          $t('languages.common.ProcessOperationAndMaintenance.NoParticipant')
        }}
      </template>
      <template slot="content">
        <a-table
          :columns="columns"
          size="small"
          :pagination="false"
          :loading="false"
          :locale="{ emptyText: '' }"
          :scroll="{ y: 585 }"
          :dataSource="noParticipantsList"
          class="no-participants-table"
        >
          <template slot="state" slot-scope="text, record">
            {{ status[record.state] }}
          </template>
        </a-table>
      </template>

      <template slot="footer">
        <div class="pagination-wrapper">
          <a-pagination
            size="small"
            :pageSizeOptions="pageSizeOptions"
            :total="total"
            :showTotal="
              (total) => $t('languages.common.form.Total', { num: total })
            "
            showSizeChanger
            showQuickJumper
            :defaultPageSize="10"
            :current="page"
            @change="pageChange"
            @showSizeChange="showSizeChange"
          />
        </div>
      </template>
    </customPop>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import customPop from 'cloudpivot/form/src/common/components/customPop.vue';
import {
  Select,
  Radio,
  Input,
  Checkbox,
  Popover,
  Button,
  Dropdown,
  Icon,
  Menu,
  Table,
  Pagination,
} from '@h3/antd-vue';
import comment from 'cloudpivot/flow-center/src/components/pc/components/comment.vue';
import formPc from 'cloudpivot/form/src/renderer/components/pc';
import { workflowApi } from 'cloudpivot/api';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import { userApi } from 'cloudpivot/api';
import common from 'cloudpivot/common/pc';

@Component({
  name: 'batchOperationAndMaintenance',
  components: {
    customPop,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ATextarea: Input.TextArea,
    comment: comment,
    Selector: formPc.StaffSelector,
    StaffSelector,
    ACheckbox: Checkbox,
    APopover: Popover,
    AButton: Button,
    ADropdown: Dropdown,
    AIcon: Icon,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    ATable: Table,
    APagination: Pagination,
    UserPopoverEllipsis: common.components.UserPopoverEllipsis,
  },
})
export default class batchOperationAndMaintenance extends Vue {
  @Prop({ default: false }) value!: boolean;

  @Prop({
    default: () => {
      return {};
    },
  })
  data!: any;

  @Prop() isWORKFLOW_ADMIN!: boolean;

  @Prop() workflowAdminManageScopes!: string[];

  @Prop() workflowState?: string;

  @Prop({ default: () => {} }) headerAction!: any; // 头部按键权限

  showAll: boolean = false;

  top: any = '8%';

  popHeigth: any = '500px';

  titleStyle: any = {
    'border-bottom': '1px solid #eee',
    'margin-bottom': '24px',
    'font-weight': '600',
  };

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  isShow(type) {
    let show = true;

    switch (type) {
      case 'COMPLETED_WORKFLOW': // 结束流程
        show =
          !['CANCELED', 'COMPLETED'].includes(this.workflowState as string) &&
          this.headerAction.showAdjust; // 只能结束未完成的流程
        break;
      case 'ADJUST_PARTICIPANT': // 调整当前处理人
      case 'CANCELED_ACTIVITY_WORKITEM': // 取消当前节点所有任务
        show =
          this.workflowState !== 'COMPLETED' &&
          this.showOperat &&
          this.headerAction.showAdjust;
        break;
      case 'CANCELED_WORKFLOW': // 作废流程
        show =
          this.headerAction.showCancel && this.workflowState !== 'CANCELED';
        break;
      case 'DELETE_WORKFLOW': // 删除流程
        show = this.headerAction.showRemove;
        break;
      case 'MODIFY_OWNER': // 修改拥有者
        show = this.headerAction.showEditOwner;
        break;

      default:
        break;
    }

    return (
      (!this.isWORKFLOW_ADMIN ||
        (this.isWORKFLOW_ADMIN &&
          this.workflowAdminManageScopes.includes(type))) &&
      show
    );
  }

  showOperat: boolean = true;

  @Watch('comment')
  onCommentChange(val: string) {
    if (val.length > 200) {
      this.comment = this.comment.slice(0, 200);
    }
  }

  activationActivityCode: string = '';

  async created() {
    console.log(this.$route.params);
    const res: any = await workflowApi.getWorkflowNodes({
      workflowInstanceId: this.$route.params.workflowInstanceId,
    });
    const status = res.data.filter((i: { status: any }) => i.status);
    if (status <= 0) {
      this.showOperat = false;
    }
    this.nodes = res.data;
  }

  tipsModalShow: boolean = false;

  tipsTitle: string = '';

  tipsContent: string = '';

  isMultiplexing: boolean = false;

  showNoParticipantsList: boolean = false; // 显示无参与者列表

  @Watch('showNoParticipantsList')
  onShowNoParticipantsList(val) {
    if (val) {
      this.getListInstances(0, 10);
    }
  }

  status: any = {
    DRAFT: '草稿',
    PROCESSING: '进行中',
    COMPLETED: '已完成',
    CANCELED: '已作废',
    EXCEPTION: '流程异常',
  };

  columns: any[] = [
    {
      title: '序列',
      key: 'index',
      dataIndex: 'index',
      width: 64,
      align: 'center',
      ellipsis: true,
    },
    {
      title: '流程名称',
      key: 'instanceName',
      dataIndex: 'instanceName',
      width: 226,
      ellipsis: true,
    },
    {
      title: '流程模板',
      key: 'workflowName',
      dataIndex: 'workflowName',
      width: 116,
      ellipsis: true,
    },
    {
      title: '流程版本号',
      key: 'workflowVersion',
      dataIndex: 'workflowVersion',
      width: 116,
      ellipsis: true,
    },
    {
      title: '当前节点',
      key: 'activityName',
      dataIndex: 'activityName',
      width: 227,
      ellipsis: true,
    },
    {
      title: '当前处理人',
      key: 'originatorName',
      dataIndex: 'originatorName',
      ellipsis: true,
    },
    {
      title: '流程状态',
      key: 'state',
      dataIndex: 'state',
      ellipsis: true,
      scopedSlots: { customRender: 'state' },
    },
  ];

  page: number = 0;

  // 分页 page change 回调
  pageChange(page: number, pageSize: number) {
    this.getListInstances(page - 1, pageSize);
  }

  pageSizeOptions: Array<string> = ['10', '20', '50', '100'];

  showSizeChange(current: number, size: number) {
    this.page = 0;
    this.getListInstances(0, size);
  }

  toWorkHandover(type) {
    if (type === 'role') {
      this.winOpen('/admin/#/organization/orgrole', '_blank');
    } else {
      this.winOpen('/admin/#/organization/orguser', '_blank');
    }
  }

  winOpen(url, type) {
    let win: any = window;
    if (window.top !== window.self) {
      win = window.parent;
    }
    win.open(url, type);
  }

  @Watch('data')
  onDataChange(value) {
    this.participants = value.participants;
    this.currentNode = value.participants[0] || {};
    this.getListInstances(0, 1);
  }

  total: any = 0; // 无参与者总数

  noParticipantsList: any[] = []; // 无参与者列表

  changeCurrentNode(item) {
    this.currentNode = item;
    this.getListInstances(0, 1);
  }

  async getListInstances(page: number, size: number) {
    if (!this.currentNode.activityCode) {
      return;
    }
    await workflowApi
      .getListInstances({
        instanceState: 'PROCESSING',
        workflowCode: this.data.workflowCode,
        workflowVersion: this.data.workflowVersion,
        activityCode: this.currentNode.activityCode,
        workItemSource: 1,
        filterWorkflowInstanceId: this.$route.params.workflowInstanceId,
        page: page,
        size: size,
      })
      .then((res: any) => {
        console.log(res);
        if (res.errcode === 0) {
          this.total = res.data.totalElements;
          res.data.content.forEach((element, index) => {
            element.index = index + 1;
          });
          this.noParticipantsList = res.data.content;
        } else {
          this.$message.error(res.errmsg);
        }
      });
  }

  currentNode: any = {};

  participants: any[] = [];

  comment: string = ''; // 审批意见

  manage: string = ''; // 选择的流程操作

  userValue: any = []; // 当前处理人

  nodeValue: any = []; // 激活的节点

  selectOptions: any[] = []; // 下拉配置项

  nodes: any[]; // 所有节点信息

  owner: Array<any> = []; // 拥有者

  departments: any = undefined; // 拥有者部门

  options: any = {
    key: 'test',
    selectOrg: false,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '点击选择',
  };

  taffSelectorOpts: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title: '选择拥有者',
  };

  departmentsList: any[] = [];

  onValueChange(value: any[]) {
    if (value.length > 0) {
      this.getUserDepartments(value[0].id);
    } else {
      this.departmentsList = [];
      this.departments = undefined;
    }
  }

  async getUserDepartments(userId: string) {
    const res: any = await userApi.getUserDepartments(userId);
    if (res && res.errcode === 0) {
      this.departmentsList = res.data;
      const resoure = res.data.find((d: any) => d.isMain);
      this.departments = resoure.deptId;
    } else {
      this.$message.error(res.errmsg);
    }
  }

  onManageChange() {
    if (this.manage === 'ACTIVATE_ACTIVITY') {
    }
  }

  toModifyWorkflowTemplate() {
    const params = this.data;
    // 去修改流程模板
    this.winOpen(
      `/admin/#/apps/model/${params.appCode}/${params.schemaCode}/workflowDesign/${params.workflowCode}`,
      '_blank',
    );
  }

  // 确定批量运维
  popOK() {
    if (this.manage === '') {
      this.modalShow = false;
      return;
    }

    if (this.manage === 'ACTIVATE_ACTIVITY') {
      if (this.activationActivityCode === '') {
        this.$message.warning(
          this.$t(
            'languages.common.ProcessOperationAndMaintenance.ActivityTips1',
          ) as string,
        );
        return;
      }

      const node = this.nodes.find(
        (el) => el.activityCode === this.activationActivityCode,
      );
      // 激活其他节点
      this.tipsTitle = this.$t(
        'languages.common.ProcessOperationAndMaintenance.ActivityTips2',
        {
          node: this.isChinese
            ? node.activityName
            : (node.name_i18n && node.name_i18n.en) || node.activityName,
        },
      ) as string;
      this.tipsContent = ``;
      this.openTipsModal();
    } else if (this.manage === 'CANCELED_WORKFLOW') {
      // 作废流程
      this.tipsTitle = this.$t('languages.common.form.NullifyTips1') as string;
      this.tipsContent = this.$t(
        'languages.common.form.NullifyTips2',
      ) as string;
      this.openTipsModal();
    } else if (this.manage === 'ADJUST_PARTICIPANT') {
      if (!this.userValue.length) {
        this.$message.error(
          this.$t(
            'languages.common.ProcessOperationAndMaintenance.AdjustTips1',
          ) as string,
        );
        return;
      }
      // 调整当前处理人
      this.tipsTitle = this.$t(
        'languages.common.ProcessOperationAndMaintenance.AdjustTips2',
      ) as string;
      this.tipsContent = '';
      this.openTipsModal();
    } else if (this.manage === 'COMPLETED_WORKFLOW') {
      // 提前结束流程
      this.tipsTitle = this.$t(
        'languages.common.ProcessOperationAndMaintenance.EndTips1',
      ) as string;
      this.tipsContent = '';
      // this.tipsModalShow = true
      this.openTipsModal();
    } else if (this.manage === 'CANCELED_ACTIVITY_WORKITEM') {
      // 取消当前节点所有任务
      this.tipsTitle = this.$t(
        'languages.common.ProcessOperationAndMaintenance.CancelAllTaskTips1',
      ) as string;
      this.tipsContent = '';
      // this.tipsModalShow = true
      this.openTipsModal();
    } else if (this.manage === 'DELETE_WORKFLOW') {
      // 删除流程
      this.tipsTitle = this.$t('languages.common.form.DeleteTips3') as string;
      this.tipsContent = ((this.$t(
        'languages.common.form.DeleteTips1',
      ) as string) + this.$t('languages.common.form.DeleteTips2')) as string;
      // this.tipsContent = '流程删除后该流程所有数据将删除，<span style="color: red;">且删除后不可恢复</span>，确定要删除？'
      // this.tipsModalShow = true
      this.openTipsModal();
    } else if (this.manage === 'MODIFY_OWNER') {
      // 修改拥有者
      if (this.owner.length === 0) {
        this.$message.warning(
          this.$t(
            'languages.common.ProcessOperationAndMaintenance.ModifyTips1',
          ) as string,
        );
        return;
      }
      if (this.departments.length === 0) {
        this.$message.warning(
          this.$t(
            'languages.common.ProcessOperationAndMaintenance.ModifyTips2',
          ) as string,
        );
        return;
      }

      this.tipsTitle = this.$t(
        'languages.common.ProcessOperationAndMaintenance.ModifyTips3',
      ) as string;
      this.tipsContent = '';
      // this.tipsModalShow = true
      this.openTipsModal();
    } else if (this.manage === 'xiugai') {
      // 修改流程模板
      this.modalShow = false;
      return;
    }
  }

  openTipsModal() {
    const that = this;
    this.$confirm({
      // title: that.tipsTitle,

      title: (h: any) => h('div', that.tipsTitle),
      class: 'cus-confirm-modal',
      content: (h: any) =>
        h('div', [
          h('i', { class: 'icon aufontAll h-icon-all-question-circle' }),
          h('p', [`${that.tipsTitle}`]),
          `${that.tipsContent}`,
        ]),
      onOk() {
        // console.log('OK');
        that.tipsOk();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  tipsOk() {
    this.tipsModalShow = false;
    const params: any = {
      activityCode: this.currentNode.activityCode,
      approval: this.getApproval(),
      batchOperation: this.isMultiplexing,
      operationType: this.manage,
      workflowInstanceId: this.$route.params.workflowInstanceId,
    };

    switch (this.manage) {
      case 'ADJUST_PARTICIPANT': // 调整当前处理人
        params.participantors = this.userValue.map((el) => el.id);
        break;
      case 'MODIFY_OWNER': // 修改拥有者
        params.ownerDeptId = this.departments;
        params.ownerId = this.owner[0].id;
        break;
      case 'ACTIVATE_ACTIVITY': // 激活其他节点
        params.activityCode = this.activationActivityCode;
        break;
      default:
        break;
    }
    this.workflowOperation(params);
  }

  async workflowOperation(params) {
    await workflowApi.workflowOperation(params).then((res: any) => {
      console.log('res===>', res);
      if (res.errcode === 0) {
        this.modalShow = false;
        this.$message.success(res.errmsg);
        this.$emit('operationOver', this.manage);
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  // 获取审批意见参数：意见、附件和签名
  getApproval() {
    const Enclosure = this.getEnclosureValue();
    return {
      activityCode: this.currentNode.activityCode,
      commonSet: false,
      deleted: false,
      resources: Enclosure,
      content: this.comment || null,
    };
  }

  // 获取附件和手写签名
  getEnclosureValue() {
    // @ts-ignore
    return (this.$refs.comment && this.$refs.comment.getValue()) || [];
  }

  // 获取批量运维的流程id[]
  getWorkflowInstanceIds() {
    return this.getWorkflowInstance().map((el) => el.id);
  }

  // 获取批量运维的流程[]
  getWorkflowInstance() {
    return this.data.filter((el) => {
      return (
        el.workflowCode === this.workflow &&
        el.activityCode === this.workflowNode
      );
    });
  }

  workflow: any = null; // 选中的流程模板

  workflowNode: any = null; // 选中的流程节点

  get checkedWorkflow() {
    if (!this.workflows || !this.workflow) {
      return {};
    }
    return this.workflows[this.workflow];
  }

  workflowChange() {
    this.workflowNode = null;
  }

  get activitys() {
    const key = this.workflow || undefined;
    if (!key) {
      return [];
    }
    return this.workflows[key].activitys;
  }

  workflows: any = {}; // 存在的流程模板

  firstData: any = {};

  init() {
    // @ts-ignore
    const bodyHeigth: number = document.querySelector('body').offsetHeight;

    if (bodyHeigth < bodyHeigth * 0.08 + 630) {
      this.top = 0;
      this.popHeigth = bodyHeigth + 'px';
    }

    this.onDataChange(this.data);
  }

  modalShow: boolean = false;

  @Watch('value', {
    immediate: true,
  })
  onVisibleChange(value: boolean) {
    this.modalShow = value;
    if (value) {
      this.init();
    }
  }

  @Watch('modalShow')
  onModalShowChange(val: boolean) {
    this.$emit('input', val);
  }

  close() {
    this.$emit('input', false);
  }
}
</script>
<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
.pagination-wrapper {
  padding-top: 10px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eee;
  margin-top: 24px;
  padding-bottom: 16px;
  width: 100%;
  & > div {
    float: right;
  }
  // 分页器高度调整
  /deep/.ant-pagination-options {
    height: 26px;
    .ant-pagination-options-size-changer {
      margin-top: 1px;
    }
  }
  /deep/.ant-pagination > li {
    border-radius: 2px;
    a,
    div,
    input {
      border-radius: 2px;
    }
    .ant-select-arrow {
      right: 7px;
    }
  }
}
.to-work-handover {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  small {
    margin-left: 0;
    color: rgba(0, 0, 0, 0.45);
    max-width: 186px;
    // text-align: justify;
    word-break: break-all;
    margin-top: 10px;
  }
  p {
    color: #2970ff;
    display: flex;
    align-items: center;
    i {
      margin-left: 5px;
      font-size: 14px;
    }
    &:hover {
      color: #5291ff;
    }
  }
}

.current-node {
  background-color: #f7f7f9;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 36px;
  height: 83px;
  .left {
    display: flex;
    flex: 1;
    .list {
      margin-bottom: 0;
      display: flex;
      flex-direction: column;
      &:first-child {
        margin-right: 48px;
      }
      label {
        width: 80px;
        color: rgba(17, 18, 24, 0.5);
        line-height: 20px;
        font-size: 12px;
        margin-bottom: 8px;
      }
      p {
        color: #111218;
      }
    }
  }
}
.show-other {
  color: @highlightColor;
  cursor: pointer;
}
small {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-left: 5px;
  .font-ele {
    color: @highlightColor;
  }
}

.list {
  display: flex;
  justify-content: space-between;
  // align-items: center;
  margin-bottom: 16px;
  label {
    width: 98px;
    margin-right: 16px;
    white-space: nowrap;
  }
  & > div {
    flex: 1;
  }
}
.tips {
  width: 100%;
  height: 32px;
  line-height: 30px;
  background: #fffbe6;
  border-radius: 4px;
  border: 1px solid #ffe58f;
  padding: 0 16px;
  color: rgba(0, 0, 0, 0.65);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 22px;
  span {
    margin-right: 10px;
    color: #faad14;
  }
}

.workflow-operation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-direction: column;
  & > label {
    margin-right: 16px;
    font-weight: 600;
    color: @primaryColor;
    line-height: 22px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    &::before {
      content: '';
      display: inline-block;
      width: 3px;
      height: 12px;
      background-color: @primaryColor;
      margin-right: 5px;
    }
  }
  .operations {
    flex: 1;
    overflow: hidden;
  }
}
.row {
  margin-bottom: 8px;
  label {
    margin-right: 20px;
    width: 120px;
  }
}
.row-item {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  margin-bottom: 16px;
  & > label {
    margin-right: 16px;
    color: #111218;
    line-height: 22px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
  }
  & > div {
    flex: 1;
  }
}
.to-template {
  display: flex;
  align-items: center;

  span {
    color: @highlightColor;
    font-size: 14px;
    cursor: pointer;
    &.icon {
      padding-top: 3px;
    }
  }
  &:hover {
    span {
      color: @highlightColor;
    }
  }

  .to-modify-workflow-template {
    height: 32px;
    line-height: 32px;
    display: inline-block;
    color: @highlightColor;
    text-decoration: underline;
    text-underline-offset: 2px;
    margin-right: 6px;
  }
}
.radio-wrapper {
  display: flex;
  flex-wrap: wrap;
  label {
    margin-bottom: 8px;
    width: 25%;
    overflow: hidden;
    margin-right: 0;
    display: flex;
    align-items: center;
    /deep/span.ant-radio {
      display: flex;
      align-items: center;
      + span {
        text-overflow: ellipsis;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }
}
.multiplexing {
  display: flex;
  align-items: center;
  line-height: 21px;
  & > span {
    margin-left: 5px;
  }
}
.comment-input {
  position: relative;
  textarea {
    height: 96px;
  }
  .str-len {
    position: absolute;
    right: 10px;
    top: 70px;
    color: rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
}

.handler {
  position: relative;
  max-height: 88px;
  text-align: justify;
  padding-right: 10px;
}
.icon-up {
  position: absolute;
  left: 58%;
  transform: translateX(-50%);
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  top: 100%;
  margin-top: -10px;
  font-size: 12px;
}
</style>

<style lang="less">
.black-tooltip {
  .ant-popover-inner {
    background-color: rgba(0, 0, 0, 0.8);
  }
  .ant-popover-arrow {
    border-right-color: rgba(0, 0, 0, 0.8) !important;
    border-bottom-color: rgba(0, 0, 0, 0.8) !important;
  }
  p {
    color: #fff;
    font-size: 14px;
  }
}

.operations .ant-radio-group {
  width: 100%;
}

// 作废与删除确认弹窗样式重写
.cus-confirm-modal {
  .anticon-question-circle {
    display: none;
  }
  .ant-modal-confirm-content {
    font-size: 14px;
    color: #111218;
    line-height: 22px;
    p {
      font-size: 16px;
      font-weight: 600;
      color: #111218;
      line-height: 24px;
      margin-bottom: 12px;
    }
    .h-icon-all-question-circle {
      font-weight: 400;
      color: #faad14;
      font-size: 24px;
      position: absolute;
      left: 31px;
      top: 42px;
    }
  }
  .ant-modal-confirm-btns {
    .ant-btn {
      height: 32px;
    }
  }
}

.no-participants-table {
  .ant-table-thead {
    background: #f8f8fb;
    th {
      border-right: 1px solid #e8eaed;
      color: #111218;
      font-size: 13px;
      font-weight: 600;
      &:last-child {
        border-right: none;
      }
    }
  }
  .ant-table-tbody {
    td {
      border-right: 1px solid #e8eaed;
      color: #111218;
      font-size: 13px;
      &:last-child {
        border-right: none;
      }
    }
  }
}

.show-placeholder {
  position: relative;
  &::after {
    content: var(--placeholder);
    font-size: 14px;
    color: #bfbfbf;
    left: 11px;
    top: 5px;
    position: absolute;
  }
}
</style>

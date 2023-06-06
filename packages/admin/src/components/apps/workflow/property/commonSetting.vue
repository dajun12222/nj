<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="commonsetting-panel">
    <!-- 流程编码 -->
    <property-widget
      v-if="type !== 'line'"
      :label="type === 'workflow' ? '流程编码' : '节点编码'"
    >
      <div slot="right" class="right-box">
        <a-input
          v-if="type === 'workflow'"
          v-model="workflowData.workflowCode"
          type="text"
          :disabled="true"
        />

        <a-tooltip
          v-else
          :visible="isShowErrAC"
          :getPopupContainer="getPopupContainer"
        >
          <template slot="title">
            <span>{{ acErrMsg }}</span>
          </template>
          <div :class="isShowErrAC ? 'input-box has-error' : 'input-box'">
            <a-input
              v-model="curActivityProps.commonSettings.activityCode"
              class="input-item"
              :disabled="
                curActivityProps.commonSettings.activityCode === 'Activity2'
                  ? true
                  : false
              "
              @change="validateAC"
            />
          </div>
        </a-tooltip>
      </div>
    </property-widget>

    <!-- 流程名称 -->
    <property-widget :label="type === 'workflow' ? '流程名称' : '节点名称'">
      <div slot="right" class="right-box">
        <a-tooltip
          v-if="type === 'workflow'"
          :visible="isShowErrName"
          :getPopupContainer="getPopupContainer"
        >
          <template slot="title">
            <span>{{ nameErrMsg }}</span>
          </template>
          <div :class="isShowErrName ? 'input-box has-error' : 'input-box'">
            <a-input
              v-if="isChinese"
              v-model="workflowData.workflowName"
              class="input-item"
              @change="validateName('workflow')"
            />
            <a-input
              v-else
              v-model="workflowData.name_i18n[$i18n.locale]"
              class="input-item"
              @change="validateName('workflow')"
            />
          </div>
        </a-tooltip>

        <a-tooltip
          v-else-if="type === 'line'"
          :visible="isShowErrName"
          :getPopupContainer="getPopupContainer"
        >
          <template slot="title">
            <span>{{ nameErrMsg }}</span>
          </template>
          <div :class="isShowErrName ? 'input-box has-error' : 'input-box'">
            <a-input
              v-if="isChinese"
              v-model="curActivityProps.commonSettings.text"
              class="input-item"
              @change="validateName('line')"
            />

            <a-input
              v-else
              v-model="curActivityProps.commonSettings.name_i18n[$i18n.locale]"
              class="input-item"
              @change="validateName('line')"
            />
          </div>
        </a-tooltip>

        <a-tooltip
          v-else
          :visible="isShowErrName"
          :getPopupContainer="getPopupContainer"
        >
          <template slot="title">
            <span>{{ nameErrMsg }}</span>
          </template>
          <div :class="isShowErrName ? 'input-box has-error' : 'input-box'">
            <a-input
              v-if="isChinese"
              v-model="curActivityProps.commonSettings.activityName"
              class="input-item"
              @change="validateName('activity')"
            />
            <a-input
              v-else
              v-model="curActivityProps.commonSettings.name_i18n[$i18n.locale]"
              class="input-item"
              @change="validateName('activity')"
            />
          </div>
        </a-tooltip>
      </div>
    </property-widget>

    <!-- 流程图标 -->
    <template v-if="type === 'workflow'">
      <property-widget label="流程图标">
        <div slot="right" class="right-box">
          <a-popover placement="bottom" overlayClassName="set-icon">
            <template slot="content">
              <div class="custom-icons">
                <template v-for="item in iconsClassName">
                  <em
                    :key="item"
                    class="icon aufontAll"
                    :class="[item, workflowData.icon === item ? 'active' : '']"
                    @click="workflowData.icon = item"
                  ></em>
                </template>
              </div>
            </template>
            <div class="icon-wrapper">
              <em class="icon aufontAll" :class="workflowData.icon"></em>
            </div>
          </a-popover>
        </div>
      </property-widget>
    </template>

    <!-- 公开外链 -->
    <template v-if="type === 'workflow'">
      <property-widget label="公开外链">
        <template slot="title-right">
          <a-switch
            v-model="workflowData.externalLinkEnable"
            size="small"
            @change="switchExternalLinkEnable"
          />
        </template>

        <template v-if="workflowData.externalLinkEnable && linkData.schemaCode">
          <div slot="right" class="right-box">
            <ExternalLink :data="linkData" @backData="setExternalLink" />
          </div>
        </template>
      </property-widget>
    </template>
    <!-- 账套or组织 -->
    <template v-if="type === 'workflow' && oauthType === '1' && IS_SYS">
      <property-widget label="账套">
        <div slot="right" class="right-box">
          <staff-selector
            v-model="workflowData.tempRemark"
            style="width: 80%"
            :schemaCode="schemaCode"
            :keepDeptIds="keepAccountIds"
            :options="staffAccountOpts"
            :defineTypeFlow="'defineTypeFlow'"
            :placeholder="'请选择账套'"
          />
        </div>
      </property-widget>
    </template>

    <template v-if="type === 'workflow' && oauthType === '2' && IS_SYS">
      <property-widget label="组织">
        <div slot="right" class="right-box">
          <staff-selector
            v-model="workflowData.tempRemark"
            style="width: 100%"
            :keepDeptIds="keepDeptIds"
            :options="staffSelectorOpts"
            :params="{ filterType: 'admin' }"
          />
        </div>
      </property-widget>
    </template>
    <!-- 任务表单 -->
    <template v-if="type === 'PARTICIPANT' || type === 'CIRCULATE'">
      <property-widget label="任务表单">
        <div slot="right" class="right-box">
          <a-select
            v-model="curActivityProps.commonSettings.sheetCode"
            showSearch
            class="task-select"
          >
            <a-select-option
              v-for="(task, index) in taskList"
              :key="index"
              :value="task.code"
            >
              {{ task.name }}
            </a-select-option>
            <div slot="notFoundContent" class="select-empty-content">
              暂无数据
            </div>
          </a-select>
        </div>
      </property-widget>
    </template>

    <!-- 前置条件 -->
    <template v-if="type === 'PARTICIPANT' || type === 'CONNECTION'">
      <property-widget
        label="前置条件"
        tip="多条分支汇合点可配置任一分支或全部分支流转到汇合节点后激活汇合节点"
      >
        <div slot="right" class="right-box">
          <a-radio-group
            v-model="curActivityProps.commonSettings.preCondition.type"
            @change="(e) => handleSelectChange(e.target.value)"
          >
            <a-radio
              v-for="(item, index) in preConditionList"
              :key="index"
              :value="item.code"
            >
              {{ item.name }}
            </a-radio>
          </a-radio-group>
        </div>
      </property-widget>
    </template>

    <!-- 后置条件 -->
    <template v-if="type === 'PARTICIPANT'">
      <property-widget
        label="后置条件"
        tip="存在并行分支的流程节点可配置当前节点审批通过后其他分支取消"
      >
        <div slot="right" class="right-box">
          <a-checkbox
            v-model="
              curActivityProps.acticityEvent.endActivity.cancelParllelActivity
            "
            class="checkbox"
          />
          <span class="left">通过时取消并行活动</span>
        </div>
      </property-widget>
    </template>
    <!-- 固定选项 -->
    <template v-if="type === 'PARTICIPANT' && isShowFixedOptions">
      <property-widget label="固定选项" tip="超级管理员固定选项">
        <div slot="right" class="right-box">
          <a-select
            v-if="curActivityProps.commonSettings.activityCode !== 'Activity2'"
            v-model="curActivityProps.commonSettings.fixedOptions"
            class="task-select"
          >
            <a-select-option :key="true" :value="true">是</a-select-option>
            <a-select-option :key="false" :value="false">否</a-select-option>
          </a-select>
          <a-select
            v-if="curActivityProps.commonSettings.activityCode === 'Activity2'"
            v-model="curActivityProps.commonSettings.fixedOptions"
            class="task-select"
            :disabled="
              curActivityProps.commonSettings.activityCode === 'Activity2'
                ? true
                : false
            "
          >
            <a-select-option :key="true" :value="true">是</a-select-option>
            <a-select-option :key="false" :value="false">否</a-select-option>
          </a-select>
        </div>
      </property-widget>
    </template>
    <!-- 绑定业务方法 -->
    <template v-if="type === 'SYSTEM_ACTIVITY'">
      <property-widget label="绑定业务规则">
        <div slot="right" class="right-box">
          <a-select
            mode="multiple"
            class="task-select"
            :labelInValue="true"
            :value="bizActions"
            @change="bizRuleChange"
          >
            <a-select-option
              v-for="business in bizRuleList"
              :key="business.code"
              :value="business.code"
            >
              {{ business.name }}
            </a-select-option>
          </a-select>
        </div>
      </property-widget>
    </template>

    <!-- 结束条件 -->
    <template v-if="type === 'SYSTEM_ACTIVITY'">
      <property-widget
        label="结束条件"
        tip="不满足条件时流程会一直停留在当前节点，满足条件后会进入下一节点"
      >
        <template slot="title-right">
          <em
            class="icon aufontAll h-icon-all-setting-o"
            @click="showFinishConditionModal"
          ></em>
        </template>
        <div
          v-if="curActivityProps.commonSettings.finishCondition"
          slot="right"
          class="right-box"
        >
          <is-seted
            value="已设置"
            :showDel="true"
            :showEllipsis="false"
            @click="showFinishConditionModal"
            @delete="onFinishConditionDelete"
          />
        </div>
      </property-widget>
    </template>

    <!-- 子流程相关 -->
    <template v-if="type === 'SUB_INSTANCE'">
      <!-- 子流程启动方式 -->
      <property-widget
        label="子流程启动方式"
        title="子流程启动方式"
        tip="同步指的是子流程结束前流程会停留在子流程节点，不会走到下个节点；异步指的是子流程被激活的同时父流程继续向下流转，子流程是否结束不影响父流程运行"
      >
        <a-radio-group
          slot="right"
          v-model="curActivityProps.commonSettings.sync"
        >
          <a-radio :value="true"> 同步 </a-radio>
          <a-radio :value="false"> 异步 </a-radio>
        </a-radio-group>
      </property-widget>

      <property-widget label="子流程模板">
        <template>
          <div slot="right" class="right-box">
            <flowTree
              v-if="isShowWorkflowList"
              v-model="curActivityProps.commonSettings.workflowCode"
              @select="setChildWorkflowSchemaNew"
            />
          </div>
        </template>
      </property-widget>

      <!-- 发起环节 -->
      <property-widget label="发起环节">
        <div slot="right" class="right-box">
          <div class="check-box">
            <!-- <a-checkbox-group v-model="curActivityProps.commonSettings.finishStartActivity"> -->
            <a-checkbox
              v-model="curActivityProps.commonSettings.finishStartActivity"
              class="checkbox"
              @change="setFinishStartActivity"
            />
            <span>自动提交</span>
            <!-- </a-checkbox-group> -->
          </div>
        </div>
      </property-widget>

      <!-- 触发对象 -->
      <property-widget label="触发对象" class="triggerMapping">
        <!-- tip="触发对象是主表时，父子流程映射只支持主表字段映射；是子表时，支持主表/子表数据映射，且只支持设置子表的选人数据项作为子流程的参与者；" -->
        <div slot="right" class="right-box">
          <a-select v-model="triggerMapping" @select="selectChange">
            <a-select-option
              v-for="sheet in childSheetList"
              :key="sheet.code"
              :value="sheet.code"
            >
              {{ sheet.name }}
            </a-select-option>
          </a-select>
        </div>
      </property-widget>

      <property-widget v-if="triggerMapping !== 'main'" label="触发条件">
        <template slot="title-right">
          <em
            class="icon aufontAll h-icon-all-setting-o"
            @click="
              $refs.filterCondition &&
                $refs.filterCondition.modalShow &&
                $refs.filterCondition.modalShow()
            "
          ></em>
        </template>

        <div slot="right" class="right-box">
          <filter-condition
            ref="filterCondition"
            :triggerMapping="triggerMapping"
            :value="curActivityProps.commonSettings.subFlowTriggerCondition"
            @change="onChange"
          />
        </div>
      </property-widget>
    </template>

    <!-- 连接线属性 -->
    <template v-if="type === 'line'">
      <property-widget label="描述">
        <div slot="right" class="right-box right-box-textarea">
          <a-textarea
            v-model="curActivityProps.commonSettings.description"
            placeholder="分支条件描述说明"
            class="line-describe"
            :maxLength="200"
            :autoSize="{ minRows: 2 }"
          />
          <div class="right-box-num">
            {{
              typeof curActivityProps.commonSettings.description === 'string'
                ? curActivityProps.commonSettings.description.length
                : 0
            }}/200
          </div>
        </div>
      </property-widget>

      <!-- 条件设置 -->
      <property-widget
        v-if="!curActivityProps.commonSettings.utilizeElse"
        label="条件设置"
        tip="当条件满足时流程会流入目标节点"
      >
        <template slot="title-right">
          <em
            class="icon aufontAll h-icon-all-setting-o"
            @click="showCondition"
          ></em>
        </template>
        <div
          v-if="curActivityProps.commonSettings.formula"
          slot="right"
          class="right-box"
        >
          <is-seted
            :value="
              curActivityProps.commonSettings.formula ? '已设置' : '未设置'
            "
            :showDel="true"
            :showEllipsis="false"
            @click="showCondition"
            @delete="onConditionDelete"
          />
        </div>
      </property-widget>

      <!-- 是否为else -->
      <property-widget label="是否使用else">
        <a-radio-group
          slot="right"
          v-model="curActivityProps.commonSettings.utilizeElse"
        >
          <a-radio :value="true"> 是 </a-radio>
          <a-radio :value="false"> 否 </a-radio>
        </a-radio-group>
      </property-widget>
    </template>

    <!-- 条件弹窗 -->
    <condition-modal
      v-model="showConditionModal"
      :data="curActivityProps.commonSettings"
      @close="showConditionModal = false"
      @submit="setCondition"
    />
    <!-- 发起流程外链弹窗 -->
    <ExternalLink
      v-model="showLink"
      :data="linkData"
      @backData="setExternalLink"
    />
    <!-- 系统节点结束条件 -->
    <condition-modal
      v-model="showFinishCondition"
      :data="{
        formula: curActivityProps.commonSettings.finishCondition,
        popupType: judgePopType(
          curActivityProps.commonSettings.finishCondition,
        ),
      }"
      @close="showFinishCondition = false"
      @submit="setFinishCondition"
    />
  </div>
</template>

<script lang="ts">
import { getRealLength } from '@/common/utils';
import {
  Checkbox,
  Input,
  Radio,
  Select,
  Tooltip,
  Popover,
  Switch,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ellipsisInput from '../base/ellipsisInput.vue';
import flowTree from '../base/flow-tree.vue';
import PropertyWidget from '../base/propertyWidget.vue';
/* 弹窗 */
import ConditionModal from '../modals/condition/index.vue';
import ExternalLink from '../modals/external-link-new.vue';
import FilterCondition from '../modals/filter-condition.vue';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import workflowApi from '@/apis/workflow';
const WorkflowModule = namespace('Apps/Workflow');

const AppItemModule = namespace('Apps/AppItem');

const AppCenterModule = namespace('Apps/AppCenter');

import IsSeted from '../base/is-seted.vue';

enum NotifyType {
  default = 0,
  customerize = 1,
}
@Component({
  name: 'CommonSetting',
  components: {
    PropertyWidget,
    ellipsisInput,
    ConditionModal,
    ExternalLink,
    flowTree,
    FilterCondition,
    ATooltip: Tooltip,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ATextarea: Input.TextArea,
    APopover: Popover,
    ASwitch: Switch,
    IsSeted,
    StaffSelector,
  },
})
export default class CommonSetting extends Vue {
  /**
   * 类型，根据不同类型展示不同的的属性
   * 流程属性：'workflow'
   * 连接线：'line'
   * 节点：对应的 activityType
   *  */
  @Prop() type!: any;

  @WorkflowModule.State('activities') activities: any;

  @WorkflowModule.State('curActivityProps') curActivityProps: any;

  @WorkflowModule.State('workflowData') workflowData: any;

  @WorkflowModule.State('WorkflowDataItem') WorkflowDataItem: any;

  @WorkflowModule.State('WorkflowDataItem_origin') WorkflowDataItemOrigin: any;

  @WorkflowModule.State('subWorkflowTplsTree') subWorkflowTplsTree: any;

  @WorkflowModule.State('taskList') taskList: any;

  @WorkflowModule.State('preConditionList') preConditionList: any;

  @WorkflowModule.State('workflow') workflow: any;

  @WorkflowModule.State('curActivityID') curActivityID: any;

  @WorkflowModule.State('bizMethodList') bizMethodList: any;

  @WorkflowModule.State('bizRuleList') bizRuleList: any;

  @WorkflowModule.Mutation('setChildWorkflow') setChildWorkflow: any;

  @WorkflowModule.Mutation('setPropValue') setPropValue: any;

  @WorkflowModule.Mutation('setIsSaveProp') setIsSaveProp: any;

  @WorkflowModule.Mutation('setSubWorkflowTplsTree')
  setSubWorkflowTplsTree: any;

  @WorkflowModule.Mutation('setWorkflowChooseAction')
  setWorkflowChooseAction: any;

  @WorkflowModule.Mutation('setWorkflowEventHandler')
  setWorkflowEventHandler: any;

  // @WorkflowModule.Action('setTreeDataAsync') setTreeDataAsync: any;

  // @WorkflowModule.Action('getAppMenu') getAppMenu: any;

  @WorkflowModule.Action('getWorkflowDetails') getWorkflowDetails: any;

  @AppItemModule.Action('getWorkflowList') getWorkflowList: any;

  @AppCenterModule.State('appList') appList: any;

  @AppCenterModule.Action('getAppList') getAppList: any;

  @Watch('curActivityProps.commonSettings.activityCode', {
    deep: true,
    immediate: true,
  })
  onChangeActivityCode(newVal: any) {
    if (newVal === 'Activity2') {
      // this.setPropValue({
      //   key: "commonSettings.fixedOptions",
      //   value: true,
      // });
    }
  }
  // 判断当前是否是中文版本

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  subInstanceWays: Array<any> = [
    { label: '同步', value: true },
    { label: '异步', value: false },
  ];

  defaultSubinstanceWay: boolean = false;

  showConditionModal: boolean = false;

  // 是否展示条件设置弹窗
  showFinishCondition: boolean = false; // 是否展示系统节点结束条件弹窗

  showLink: boolean = false; // 是否展示发起流程外链弹窗

  linkData: any = {};

  isShowWorkflowList: boolean = true;

  levelOneIndex: number = -1;

  levelTwoIndex: number = -1;

  levelThreeIndex: number = -1;

  // 父级key
  parentKey: string = '';

  isShowErrAC: boolean = false;

  acErrMsg: string = '';

  isShowErrName: boolean = false;

  nameErrMsg: string = '';

  cacheActivityCode: string = '';

  dkeys: Array<string> = [];

  tree: any = [];

  au_mark: string = '';

  bizActions: any = [];

  triggerMapping: any = 'main';

  keepDeptIds: string[] = [];

  staffSelectorOpts = {
    selectOrg: true,
    selectUser: false,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择组织或用户',
  };

  keepAccountIds: string[] = [];

  staffAccountOpts = {
    selectOrg: true,
    selectUser: false,
    mulpitle: true,
    showModel: true,
    showSelect: true,
  };

  oauthType: string = '2';

  accountList: any = [];

  get schemaCode() {
    return (
      this.$route && this.$route.params && this.$route.params.bizSchemaCode
    );
  }

  get isShowFixedOptions() {
    let status = false;
    let userStr = window.sessionStorage.getItem('user');
    let str = '';
    if (userStr && JSON.parse(userStr)) {
      let user = JSON.parse(userStr);
      if (user.permissions && user.permissions.length > 0) {
        let index = user.permissions.findIndex((item) => {
          return item === 'SYS_MNG' || item === 'ADMIN';
        });
        status = index > -1 ? true : false;
      }
    }
    return status;
  }

  get IS_SYS() {
    let status = false;
    let userStr = window.sessionStorage.getItem('user');
    let str = '';
    if (userStr && JSON.parse(userStr)) {
      let user = JSON.parse(userStr);
      if (user.permissions && user.permissions.length > 0) {
        let index = user.permissions.findIndex((item) => {
          return item === 'SYS_MNG' || item === 'ADMIN';
        });
        status = index > -1 ? false : true;
      }
    }
    return status;
  }

  iconsClassName: string[] = [];

  getIconNames() {
    const svgdom: any = document.body.querySelector('svg#icons');
    const content = svgdom.innerHTML;
    const ids = content.replace(
      /<symbol.+?id="(.+?)".+?>.+?<\/symbol>/g,
      '$1 ',
    );

    const customIcons: any[] = [
      'h-icon-all-disconnect',
      'h-icon-all-Report',
      'h-icon-all-yingyong',
    ];
    this.iconsClassName = [
      ...customIcons,
      ...ids.replace(/(^\s*)|(\s*$)/g, '').split(' '),
    ];
  }

  created() {
    this.getIconNames();
  }

  get defaultSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => data.defaultProperty,
    );
  }

  get bizSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => !data.defaultProperty,
    );
  }

  // 子流程触发对象子表列表
  get childSheetList() {
    const arr = this.WorkflowDataItem.filter((d: any) => d.propertyType === 8);
    arr.splice(0, 0, {
      code: 'main',
      name: '主表',
    });
    return arr;
  }

  //accountList
  async getAcoountList() {
    const { bizSchemaCode, workflowCode } = this.$route.params;
    //let bizSchemaCode = 'zgnjdszt';
    let res: any = await workflowApi.getFlowAccount({
      schemaCode: bizSchemaCode,
    });
    if (res.errcode === 0) {
      this.accountList = res.data;
    } else {
      this.accountList = [];
    }
  }

  handleSelectChange(val) {
    console.log('val', val);
    this.setPropValue({
      key: 'commonSettings.preCondition',
      value: { type: val, rule: {} },
    });
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  /*
   * 子流程触发对象change事件
   */
  selectChange(val: any) {
    console.log(val);

    this.triggerMapping = val;
    if (val === 'main') {
      const data = {
        mainTable: 0,
      };
      this.setPropValue({
        key: 'commonSettings.triggerMappingObj',
        value: data,
      });
    } else {
      const data = {
        mainTable: 1,
        code: val,
      };
      this.setPropValue({
        key: 'commonSettings.triggerMappingObj',
        value: data,
      });
      this.setPropValue({
        key: 'commonSettings.subFlowTriggerCondition',
        value: {},
      });
    }
    // 切换触发对象参与者值置空
    this.setPropValue({
      key: 'participant.participant',
      value: '',
    });
    // 切换触发对象为子表时，去掉数据映射里已设置其他子表映射值
    if (Array.isArray(this.curActivityProps.workflowDataMaps)) {
      const mapData = this.curActivityProps.workflowDataMaps
        .map((map: any) => {
          if (map.parentDataName.indexOf('.') === -1) {
            return map;
          }
          const cSheetCode = map.parentDataName.split('.')[0] as string;
          const subIsChildCode: boolean = map.childDataName.indexOf('.') > -1; // 子流程数据是否为子表数据项
          if (cSheetCode !== val && !subIsChildCode) {
            return;
          } else if (cSheetCode === val && subIsChildCode) {
            return;
          } else {
            //Else Empty block statement
          }
          return map;
        })
        .filter(Boolean);
      this.setPropValue({
        key: 'workflowDataMaps',
        value: mapData,
      });
      this.$emit('setMappingStr');
    }
  }

  // 业务规则change事件
  bizRuleChange(val: any) {
    const vm: any = this;
    // 改变业务方法时，出现确认弹窗
    if (
      !this.curActivityProps.commonSettings.bizActionType ||
      this.curActivityProps.commonSettings.bizActionType === 'BIZ_METHOD'
    ) {
      let label = '';
      vm.bizActions.forEach((biz: any, idx: number) => {
        label += `“${biz.label}”${
          idx === vm.bizActions.length - 1 ? '' : '、'
        }`;
      });
      this.$confirm({
        okText: '确定',
        cancelText: '取消',
        class: 'biz-rule-confirm',
        content: `由于1.7.0及以后的版本，业务方法已升级为业务规则，如需修改，历史配置的业务方法${label}将被清除`,
        onOk() {
          vm.setPropValue({
            key: 'commonSettings.bizActionType',
            value: 'BIZ_RULE',
          });
          val = val.filter((v: any) => {
            const item = vm.bizActions.find((b: any) => b.key === v.key);
            if (item) {
              return false;
            }
            return true;
          });
          vm.bizActions = val;
          const value = val.map((biz: any) => {
            return biz.key;
          });
          vm.setPropValue({
            key: 'commonSettings.bizActions',
            value,
          });
        },
      });
    } else {
      vm.setPropValue({
        key: 'commonSettings.bizActionType',
        value: 'BIZ_RULE',
      });
      vm.bizActions = val;
      const value = val.map((biz: any) => {
        return biz.key;
      });
      vm.setPropValue({
        key: 'commonSettings.bizActions',
        value,
      });
    }
  }

  // 条件设置
  showCondition() {
    this.showConditionModal = true;
  }

  /**
   * 移除条件设置值
   */
  onConditionDelete() {
    this.setPropValue({
      key: 'commonSettings.formula',
      value: '',
    });
    this.setPropValue({
      key: 'commonSettings.popupType',
      value: 'FUNCTION',
    });
  }

  switchExternalLinkEnable(value) {
    if (value) {
      // this.showLinkModal();
    }
  }

  @Watch('workflowData.externalLinkEnable')
  onExternalLinkEnableChange(value) {
    this.showLinkModal();
  }

  // 发起流程外链弹窗
  showLinkModal() {
    this.showLink = true;
    const { bizSchemaCode, workflowCode } = this.$route.params;
    this.linkData = {
      schemaCode: bizSchemaCode,
      workflowCode,
      shortCode: this.workflowData.shortCode,
      externalLinkEnable: this.workflowData.externalLinkEnable,
    };
  }

  // 设置外链数据
  setExternalLink(link: any) {
    this.setWorkflowEventHandler({ key: 'shortCode', value: link.shortCode });
    this.setWorkflowEventHandler({
      key: 'externalLinkEnable',
      value: link.externalLinkEnable,
    });
  }

  setCondition(payload: any) {
    this.setPropValue({
      key: 'commonSettings.formula',
      value: payload.formula,
    });
    this.setPropValue({
      key: 'commonSettings.popupType',
      value: payload.popupType,
    });
    // 保存条件，关闭弹窗
    this.showConditionModal = false;
  }

  // 系统节点--结束条件
  showFinishConditionModal() {
    this.showFinishCondition = true;
  }

  /**
   * 删除结束条件
   */
  onFinishConditionDelete() {
    this.setPropValue({
      key: 'commonSettings.finishCondition',
      value: '',
    });
  }

  judgePopType(express: string) {
    /* 判断系统节点结束条件弹窗类型 */
    if (/==|>|<|>=|<=|!=|isNotEmpty/.test(express) || !express) {
      return 'EXPRESSION';
    }
    return this.curActivityProps.commonSettings.popupType || 'FUNCTION';
  }

  setFinishCondition(payload: any) {
    this.setPropValue({
      key: 'commonSettings.finishCondition',
      value: payload.formula,
    });
    this.setPropValue({
      key: 'commonSettings.popupType',
      value: payload.popupType,
    });
    // 保存结束条件，关闭弹窗
    this.showFinishCondition = false;
  }

  async mounted() {
    this.cacheActivityCode = this.curActivityProps.commonSettings.activityCode;
    if (this.type === 'SYSTEM_ACTIVITY') {
      this.mountBizRule();
    }
    if (this.type !== 'line') {
      this.validateAC();
    }
    if (this.type === 'SUB_INSTANCE') {
      this.dataMounted();
      // await this.getFlowPath();
      // this.handleInitTree();
    }

    //判断是账套还是组织

    this.getOauthType();
  }
  //判断是账套还是组织

  async getOauthType() {
    //functionCode
    const { bizSchemaCode, workflowCode } = this.$route.params;
    let res: any = await workflowApi.getNodeInfo({
      functionCode: bizSchemaCode,
    });
    if (res.data && res.data.remarks && res.data.remarks === '1') {
      this.oauthType = '1';
      this.getAcoountList();
    } else {
      this.oauthType = '2';
    }
  }

  // 数据初始化
  dataMounted() {
    if (!this.curActivityProps.commonSettings.triggerMappingObj) {
      // 子流程触发对象默认为主表
      const data = {
        mainTable: 0,
      };
      this.setPropValue({
        key: 'commonSettings.triggerMappingObj',
        value: data,
      });
      return;
    }
    const data = this.curActivityProps.commonSettings.triggerMappingObj;
    this.triggerMapping = data.code ? data.code : 'main';
  }

  // 业务规则初始化
  mountBizRule() {
    this.bizActions = this.curActivityProps.commonSettings.bizActions
      ? this.curActivityProps.commonSettings.bizActions.map((b: any) => {
          let item: any = null;
          if (
            !this.curActivityProps.commonSettings.bizActionType ||
            this.curActivityProps.commonSettings.bizActionType === 'BIZ_METHOD'
          ) {
            item = this.bizMethodList.find((m: any) => m.code === b);
          } else {
            item = this.bizRuleList.find((m: any) => m.code === b);
          }
          return {
            key: b,
            label: item ? item.name : b,
          };
        })
      : [];
  }

  // 重复校验
  validateRepeatCode(ac: string) {
    if (this.curActivityID === -1) {
      return;
    }
    const acCode: any = this.activities.find(
      (activity: any) => activity.ID === this.curActivityID,
    ).activityCode;
    if (ac !== acCode) {
      if (this.workflow.activityCodeArr.includes(ac)) {
        this.isShowErrAC = true;
        this.acErrMsg = '节点编码已存在';
        this.setIsSaveProp(false);
        return true;
      }
      this.isShowErrAC = false;
      this.acErrMsg = '';
      this.setIsSaveProp(true);
      return false;
    }
  }

  // 格式校验
  validateFormat(ac: string) {
    if (typeof ac !== 'string') {
      return;
    }
    const reg = /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/;
    const len = getRealLength(ac);
    if (len <= 0) {
      this.isShowErrAC = true;
      this.acErrMsg = '编码不能为空';
      this.setIsSaveProp(false);
      return;
    }
    if (!reg.test(ac)) {
      this.isShowErrAC = true;
      this.acErrMsg = '以字母开头,包括字母或下划线或数字,不超过28个字符';
      this.setIsSaveProp(false);
    } else {
      this.isShowErrAC = false;
      this.acErrMsg = '';
      this.setIsSaveProp(true);
    }
  }

  // 校验编码
  validateAC() {
    const _ac: any = this.curActivityProps.commonSettings.activityCode;
    console.log('validate activity code');
    const isRepeat = this.validateRepeatCode(_ac);
    if (!isRepeat) {
      this.validateFormat(_ac);
    }
  }

  // 校验名称
  validateName(type: string) {
    let name: string = '';
    const { locale } = this.$i18n;
    if (type === 'workflow') {
      name =
        locale === 'zh'
          ? this.workflowData.workflowName
          : this.workflowData.name_i18n[locale];
    } else if (type === 'line') {
      name =
        locale === 'zh'
          ? this.curActivityProps.commonSettings.text
          : this.curActivityProps.commonSettings.name_i18n[locale];
    } else {
      name =
        locale === 'zh'
          ? this.curActivityProps.commonSettings.activityName
          : this.curActivityProps.commonSettings.name_i18n[locale];
    }
    const reg = /^\S(.{0,49})?$/;
    const len = getRealLength(name);
    if (len <= 0) {
      if (type === 'line') {
        this.isShowErrName = false;
        this.nameErrMsg = '';
        this.setIsSaveProp(true);
      } else {
        this.isShowErrName = true;
        this.nameErrMsg = '名称不能为空';
        this.setIsSaveProp(false);
        return;
      }
    } else if (len > 50 || !reg.test(name)) {
      this.isShowErrName = true;
      this.nameErrMsg = '请输入不以空格开头长度不超过50个字符';
      this.setIsSaveProp(false);
    } else {
      this.isShowErrName = false;
      this.nameErrMsg = '';
      this.setIsSaveProp(true);
    }
  }

  setChildWorkflowSchemaNew({ schemaCode }) {
    const _schemaCode = schemaCode;
    if (!_schemaCode) {
      return;
    }
    this.setPropValue({
      key: 'workflowDataMaps',
      value: [],
    });
    this.setChildWorkflow(_schemaCode);
  }

  setFinishStartActivity(e: any) {
    const isChecked = e.target.checked;
    this.setPropValue({
      key: 'commonSettings.finishStartActivity',
      value: isChecked,
    });
  }

  @Watch('curActivityID', { deep: true })
  async onCurActivityIDChange(v: any) {
    if (v) {
      const curActivity = this.activities.find((ac: any) => ac.ID === v);
      this.cacheActivityCode =
        this.curActivityProps.commonSettings.activityCode;
      if (this.type === 'SYSTEM_ACTIVITY') {
        this.mountBizRule();
      }
      this.isShowWorkflowList = false;
      if (this.type === 'SUB_INSTANCE') {
        this.dataMounted();
      }
      this.$nextTick(() => {
        this.isShowWorkflowList = true;
      });
      // await this.getFlowPath();
      // this.handleInitTree();
    }
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.validateName('workflow');
  }

  onChange(value: any) {
    // todo 根据元数据校验来自外部控件的数据
    this.curActivityProps.commonSettings.subFlowTriggerCondition = value;
  }
}
</script>

<style lang="less">
@import '~@/styles/color/colors.less';
.icon-wrapper {
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 39px;
  border: 1px solid #d4d5d6;
  border-radius: 2px;
  cursor: pointer;
  em {
    font-size: 21px;
    color: @nav-font-color;
  }
}

.set-icon {
  z-index: 9999;
  .ant-popover-inner-content {
    padding: 12px 0 12px 12px;
  }
}
.custom-icons {
  width: 286px;
  background-color: #fff;
  max-height: 300px;
  overflow: auto;
  em {
    float: left;
    cursor: pointer;
    width: 46px;
    height: 46px;
    font-size: 24px;
    line-height: 46px;
    text-align: center;
    border: 1px solid transparent;
    border-radius: 2px;
    &:hover,
    &.active {
      border: 1px solid @primary-color;
      color: @primary-color;
    }
  }
  &::after {
    content: '';
    clear: both;
  }
}

.right-box {
  width: 100%;
  display: flex;
  align-items: center;
  color: @nav-font-color;
  &.right-box-textarea {
    position: relative;
    padding-bottom: 20px;
    textarea:focus {
      box-shadow: none !important;
    }
    > .right-box-num {
      position: absolute;
      bottom: 0;
      right: 11px;
      color: #e2e2e2;
    }
  }

  label + span {
    margin-left: 8px;
  }

  .line-describe {
    border-radius: 2px;
  }
  .inner-padding {
    padding: 0 12px;
    margin-bottom: 0;
  }
  .ant-select {
    width: 100%;
    // .ant-select-selection {
    //   border: none !important;
    // }
  }
  .grey-box {
    width: 100%;
    height: 31px;
    line-height: 31px;
    background: #f5f5f5;
  }
  .white-box {
    padding: 0 8px;
    margin-bottom: 0;
  }
}
.property-container > .commonsetting-panel {
  padding-top: 16px;
  .triggerMapping {
    margin-bottom: 16px;
  }
}
.commonsetting-panel {
  .ant-radio-group {
    display: flex;
    width: 100%;
  }
  .ant-radio-wrapper {
    margin-right: 24px;
    color: @nav-font-color;
    &:last-child {
      margin-right: 0;
    }
  }
  .task-select {
    width: 100%;
    border: none;
    .ant-select-selection {
      // border: none;
      box-shadow: none;
    }
  }
  .input-box {
    width: 100%;
    input {
      width: 100%;
    }
  }
  .message-notify-box {
    .select-type {
      width: 100%;
      height: 32px;
      .input-select {
        width: 100%;
        height: 100%;
        border: none;
        .ant-select-selection {
          // border: none;
          box-shadow: none;
          color: #111218;
        }
      }
    }
  }
}
.has-error .ant-input,
.has-error .ant-input:hover {
  border: 1px solid #f5222d !important;
}

.sub-tpl-ts {
  max-height: 45vh !important;
  /deep/ .ant-select-tree-treenode-disabled {
    span.ant-select-tree-title .cus-title {
      color: rgba(17, 18, 24, 0.5) !important;
    }
  }
  // 多出一个小方块，去除 by John 20191015
  /deep/.ant-select-tree-iconEle.ant-select-tree-icon__customize {
    display: none !important;
  }
}
.select-empty-content {
  margin: 8px 0;
  text-align: center;
}
.biz-rule-confirm {
  /deep/.ant-modal-confirm-title {
    display: none;
  }
  /deep/.ant-modal-confirm-content {
    word-break: break-all;
  }
}
</style>

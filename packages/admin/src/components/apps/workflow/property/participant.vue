<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="participant-panel">
    <property-widget
      label="参与者"
      tip="子表时，只支持设置子表的选人数据项作为子流程的参与者"
    >
      <template slot="right">
        <is-seted
          :value="participantData"
          :showDel="false"
          :showEllipsis="true"
          showStyleType="input"
          @click="showModal = true"
        />
      </template>
    </property-widget>

    <template v-if="type === 'PARTICIPANT'">
      <div v-if="isShowNextNode" class="change-user-message">
        <property-widget
          :showTip="true"
          label="自由选择下个节点审批人"
          tip="当前节点提交流程表单时可选择下个流程节点的审批人"
        >
          <template slot="title-right">
            <a-switch
              v-model="curActivityProps.participant.participantChoose"
              size="small"
              @change="handleChangeSwitch"
            />
          </template>

          <div
            v-if="curActivityProps.participant.participantChoose"
            slot="right"
            class="change-user-tip"
          >
            <div class="participantChoose-tips">
              开启后，当前流程不支持批量审批，且不支持后审批
            </div>
          </div>
        </property-widget>
      </div>

      <property-widget label="参与者类型">
        <a-radio-group
          slot="right"
          v-model="curActivityProps.participant.participantType"
        >
          <a-radio :value="'SINGLE_PARTICIPANT'"> 单人 </a-radio>
          <a-radio :value="'MULTI_PARTICIPANT'"> 多人 </a-radio>
        </a-radio-group>
      </property-widget>

      <!-- 多人时显示以下部分 -->
      <template v-if="participantType === 'MULTI_PARTICIPANT'">
        <property-widget label="参与方式">
          <a-radio-group
            slot="right"
            v-model="curActivityProps.participant.participationModel"
          >
            <a-radio :value="'PARALLEL'"> 并行 </a-radio>
            <a-radio :value="'SERIAL'"> 串行 </a-radio>
          </a-radio-group>
        </property-widget>

        <property-widget label="同意出口">
          <template slot="right">
            <is-seted
              :value="approveExitText"
              :showDel="false"
              :showEllipsis="true"
              showStyleType="input"
              @click="openExportRuleModel('approve')"
            />
          </template>
        </property-widget>
        <property-widget label="否决出口">
          <template slot="right">
            <is-seted
              :value="disapproveExitText"
              :showDel="false"
              :showEllipsis="true"
              showStyleType="input"
              @click="openExportRuleModel('disApprove')"
            />
          </template>
        </property-widget>
      </template>
      <!-- 常显部分 -->
      <property-widget
        label="无参与者"
        tip="转交管理员指的是找不到人时找对这条数据有管理权限的数据管理员，如果没有找到数据管理员就找系统管理员"
      >
        <div slot="right" class="noParticipant-wrap">
          <a-radio-group
            v-model="curActivityProps.participant.noParticipant"
            class="noParticipant-wrapper"
            :options="noparticipants"
            :defaultValue="noparticipant"
            @change="noParticipantChange"
          />
        </div>
      </property-widget>

      <property-widget
        v-if="curActivityProps.participant.noParticipant === 'WORKFLOW_ADMIN'"
        label="特权人"
      >
        <template v-if="workflowAdminList.length === 0" slot="right">
          <!-- <div class="admin-pe">
            <div @click="toWorkflowSetting">
              <span>设置特权人范围</span>
            </div>
          </div> -->
          <is-seted
            value="未设置特权人"
            :showDel="false"
            :showEllipsis="false"
            @click="toWorkflowSetting"
          />
        </template>

        <template v-else slot="right">
          <is-seted
            :value="
              workflowAdminList[0].adminScopes.map((el) => el.name).join('、')
            "
            :showDel="false"
            :showEllipsis="false"
            @click="toWorkflowSetting"
          />
          <!-- <div
            class="admin-pe"
            :title="workflowAdminList[0].adminScopes[0].name"
          >
            <div>
              {{
                workflowAdminList[0].adminScopes.map((el) => el.name).join('、')
              }}
            </div>
            <span @click="toWorkflowSetting">更多</span>
          </div> -->
        </template>
      </property-widget>

      <property-widget
        v-if="curActivityProps.participant.noParticipant === 'CUSTOM'"
        label="自定义"
      >
        <is-seted
          slot="right"
          :value="noParticipantorPopupType || '未设置'"
          :showDel="false"
          :showEllipsis="true"
          @click="showAdminModal = true"
        />
      </property-widget>

      <property-widget label="是发起人">
        <template slot="right">
          <a-checkbox
            v-model="isCreated"
            class="checkbox"
            @change="checkboxChange('isCreated')"
          />
          <span>直接通过</span>
        </template>
      </property-widget>
      <property-widget
        label="前一活动处理"
        tip="与上一活动处理人相同，如A的下一节点是B,当B的参与者与A相同，自动通过"
      >
        <!-- <a-radio-group
          slot="right"
          :options="options"
          v-model="curActivityProps.participant.perviousParticipate"
          :defaultValue="preParticipant"
        /> -->
        <a-checkbox
          slot="right"
          v-model="preParticipant"
          class="checkbox"
          @change="checkboxChange('preParticipant')"
        />
        <span slot="right">直接通过</span>
      </property-widget>
      <property-widget
        label="处理过流程"
        tip="在之前活动参与过流程,注当某个用户驳回之后，下一次任务再到达时不算参与过流程，例如A提交给B，B提交给C，C驳回给A，当A提交，再次到C时，不会自动跳过C"
      >
        <!-- <a-radio-group
          slot="right"
          :options="options"
          v-model="curActivityProps.participant.participated"
          :defaultValue="joinedFlow"
        /> -->
        <a-checkbox
          slot="right"
          v-model="joinedFlow"
          class="checkbox"
          @change="checkboxChange('joinedFlow')"
        />
        <span slot="right">直接通过</span>
      </property-widget>
      <property-widget
        label="启用后审批"
        tip="流程后续节点审批人包含当前节点审批人时，则对应审批人待办会自动审批通过，如流程A->B->C->B->D，当第一个B配置了后审批，则第一个B自动审批通过，流程继续往下流转，A->B(自动通过)->C->B->D"
      >
        <a-radio-group
          slot="right"
          v-model="curActivityProps.participant.participateLater"
        >
          <a-radio :value="'APPROVE'"> 启用 </a-radio>
          <a-radio :value="'DEFAULT'"> 不启用 </a-radio>
        </a-radio-group>
      </property-widget>
    </template>
    <!-- 相关弹窗 -->
    <participant-modal
      v-model="showModal"
      :data="curActivityProps.participant.participant"
      :popupType="curActivityProps.participant.popupType"
      @close="showModal = false"
      @submit="setParticipant"
    />

    <!-- 特权人 -->
    <participant-modal
      v-model="showAdminModal"
      :data="curActivityProps.participant.noParticipantorExr"
      :popupType="curActivityProps.participant.noParticipantorPopupType"
      :isNoParticipantorExr="true"
      @close="showAdminModal = false"
      @submit="setCusTom"
    />

    <!-- 出口规则弹窗 -->
    <export-rule-modal
      v-model="showExportRule"
      :type="exportRuleType"
      @submit="setExportRuleText"
      @close="showExportRule = false"
    />
  </div>
</template>

<script lang="ts">
import WorkflowApi from '@/apis/workflow';
import * as WorkflowNamespace from '@/typings/workflow';
import { Switch, Alert, Radio, Checkbox } from '@h3/antd-vue';
import { workflowApi } from 'cloudpivot/api';
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import EllipsisInput from '../base/ellipsisInput.vue';
import PropertyWidget from '../base/propertyWidget.vue';
import exportRuleModal from '../modals/exportRule.vue';
import participantModal from '../modals/participant/index.vue';

import IsSeted from '../base/is-seted.vue';

const DataModelModule = namespace('Apps/DataModel');

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'participantPanel',
  components: {
    PropertyWidget,
    EllipsisInput,
    participantModal,
    exportRuleModal,
    ASwitch: Switch,
    AAlert: Alert,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    IsSeted,
  },
})
export default class ParticipantPanel extends Vue {
  @WorkflowModule.State((state) => state.selectedActivities[0] || {})
  currentActivity: any;

  @WorkflowModule.State('curActivityProps')
  curActivityProps?: WorkflowNamespace.curActivityProps;

  @WorkflowModule.State('WorkflowDataItem') WorkflowDataItem: any;

  @WorkflowModule.Mutation('updateExitRules')
  updateExitRules?: WorkflowNamespace.curActivityProps;

  @WorkflowModule.Mutation('setPropValue') setPropValue: any;

  @WorkflowModule.State('lines') lines: any;

  @DataModelModule.State('bizSchemaCode') schemaCode: any; // 当前的业务模型schemaCode

  @Prop() type!: any;

  @Inject()
  toWorkflowSetting!: () => void;

  /* 参与方式 */
  participantWays: any[] = [
    { label: '并行', value: 'PARALLEL' },
    { label: '串行', value: 'SERIAL' },
  ];

  participantWay: any = '1';

  isShowNextNode: boolean = true;

  /* 无参与者 */
  noparticipants: any[] = [
    { label: '转交管理员', value: 'TO_ADMIN' },
    { label: '直接通过', value: 'APPROVE' },
    { label: '转交特权人', value: 'WORKFLOW_ADMIN' },
    { label: '自定义处理人', value: 'CUSTOM' },
  ];

  noparticipant: any = '1';

  workflowAdminList: any[] = []; // 特权人列表

  async noParticipantChange(e) {
    if (e.target.value === 'WORKFLOW_ADMIN') {
      // 选中特权人
      await this.getListWorkflowAdmin();
    }
  }

  // 获取特权人列表
  getListWorkflowAdmin() {
    return workflowApi
      .getListWorkflowAdmin({
        workflowCode: this.$route.params.workflowCode,
      })
      .then((res: any) => {
        if (res.errcode === 0) {
          this.workflowAdminList = res.data;
        }
      });
  }

  /* 通用选项 */
  options: any[] = [
    { label: '不处理', value: 'DEFAULT' },
    { label: '自动通过', value: 'APPROVE' },
  ];

  /* 是发起人 */
  isCreated: boolean = false;

  /* 前一活动参与 */
  preParticipant: boolean = false;

  /* 参与过流程 */
  joinedFlow: boolean = false;

  /* 后续流程参与 */
  postParticipant: any = 'DEFAULT';

  /* 下一活动无参与者 */
  outNext: any = 'DEFAULT';

  /* //////// */
  showModal: boolean = false;

  showAdminModal: boolean = false;

  showExportRule: boolean = false;

  /* 出口规则类型 */
  exportRuleType: string = '';

  // 同意出口文本
  approveExitText: string = '';

  // 否决出口文本
  disapproveExitText: string = '';

  get childSheetUserList() {
    const UserData: any = [];
    const triggerMapping = (this as any).curActivityProps.commonSettings
      .triggerMappingObj;
    const childSheetCode = triggerMapping ? triggerMapping.code : '';

    const childSheet = this.WorkflowDataItem.filter(
      (item: Apps.Datamodel.ChildeDataItem) =>
        `${item.propertyType}` === '8' &&
        item.published &&
        item.code === childSheetCode,
    );
    childSheet.forEach((item: any) => {
      if (item.subSchema && item.subSchema.properties) {
        item.subSchema.properties.forEach((subItem: any) => {
          if (
            ['50', '51', '60', '61', '5'].indexOf(`${subItem.propertyType}`) >
              -1 &&
            subItem.published
          ) {
            UserData.push({
              label: `${item.name}.${subItem.name}`,
              value: `{${item.code}.${subItem.code}}`,
              code: `${item.code}.${subItem.code}`,
            });
          }
        });
      }
    });
    return UserData;
  }

  get participantType() {
    if (!this.curActivityProps) {
      return;
    }
    return this.curActivityProps.participant.participantType;
  }

  get participantChoose() {
    if (!this.curActivityProps) {
      return;
    }
    return this.curActivityProps.participant.participantChoose;
  }

  list: any = {};

  async getFormulaTree(params: Apps.Workflow.FormulaParams) {
    const res: any = await WorkflowApi.getFormulaList(params);
    if (res.errcode === 0 && Array.isArray(res.data)) {
      let Functions: any = [];
      res.data.forEach((element) => {
        element.childrenFunctions = element.childrenFunctions || [];
        Functions = [...Functions, ...element.childrenFunctions];
      });
      const resData = {};
      Functions.forEach((element) => {
        resData[element.code] = element.fullName;
      });

      this.list = resData;
    }
  }

  mounted() {
    this.getFormulaTree({
      // 用于回显参与者名称
      schemaCode: this.schemaCode,
      type: 'participant',
    });

    if (
      this.curActivityProps &&
      this.curActivityProps.participant &&
      this.curActivityProps.participant.noParticipant === 'WORKFLOW_ADMIN'
    ) {
      // 如果无参与者是 特权人 获取特权人列表
      this.getListWorkflowAdmin();
    }
  }

  created() {
    window.addEventListener('message', this.reloadMessage, false);
    // window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event: any) {
    if (event.data === 'workflowAdminChange') {
      this.getListWorkflowAdmin();
      return;
    }
  }

  // 特权人
  get noParticipantorPopupType() {
    if (!this.curActivityProps) {
      return;
    }

    if (
      this.curActivityProps.participant.noParticipantorExr &&
      /^\[\{.*?\}\]$/.test(this.curActivityProps.participant.noParticipantorExr)
    ) {
      const matchArr =
        this.curActivityProps.participant.noParticipantorExr.match(
          /\[\{.*?\}\]/g,
        );
      let strShow = '';
      if (Array.isArray(matchArr) && matchArr.length > 0) {
        matchArr.forEach((json) => {
          try {
            json = json.replace(/'/g, '"');
            const data = JSON.parse(json);
            let str = '';
            if (Array.isArray(data)) {
              data.forEach((d: any) => {
                str += `${d.name};`;
              });
            }
            strShow += str;
          } catch {}
        });
      }
      return strShow;
    }

    const triggerMapping = (this as any).curActivityProps.commonSettings
      .triggerMappingObj;
    const triggerMappingData = triggerMapping || { mainTable: 0, code: 'main' };
    const reg: RegExp = /^\{(.+?)\}$/;
    const participant: string = this.curActivityProps.participant
      .noParticipantorExr as string;
    // 子流程触发对象为子表时，参与者弹窗为子流程表达式弹窗
    if (triggerMappingData.mainTable === 1 && reg.test(participant)) {
      const item: any = this.childSheetUserList.find(
        (d: any) => d.value === participant,
      );
      if (item) {
        return `${item.label}${participant}`;
      }
    }
    const showText =
      this.curActivityProps.participant.noParticipantorExr &&
      this.curActivityProps.participant.noParticipantorExr.replace(
        /\{.+?\}/g,
        (word) => {
          try {
            const obj = JSON.parse(word);
            if (obj && obj.name) {
              return obj.name;
            }
          } catch (error) {}

          const key = word.slice(1, word.length - 1);
          return this.list[key] || '';
        },
      );

    return showText || this.curActivityProps.participant.noParticipantorExr;
  }

  get participantData() {
    // 参与人str [{"id":"afeb204e76500a6d017650de86704cd0","type":1,"name":"206钉钉集成"}]+[{"id":"afeb204e76500a6d017650e44ca05bfe","type":1,"name":"206企业微信"}]
    if (!this.curActivityProps) {
      return;
    }
    if (
      this.curActivityProps.participant.participant &&
      /^\[\{.*?\}\]$/.test(this.curActivityProps.participant.participant)
    ) {
      const matchArr =
        this.curActivityProps.participant.participant.match(/\[\{.*?\}\]/g);
      let strShow = '';
      if (Array.isArray(matchArr) && matchArr.length > 0) {
        matchArr.forEach((json) => {
          try {
            json = json.replace(/'/g, '"');
            const data = JSON.parse(json);
            let str = '';
            if (Array.isArray(data)) {
              data.forEach((d: any) => {
                str += `${d.name};`;
              });
            }
            strShow += str;
          } catch {}
        });
      }
      return strShow;
    }

    const triggerMapping = (this as any).curActivityProps.commonSettings
      .triggerMappingObj;
    const triggerMappingData = triggerMapping || { mainTable: 0, code: 'main' };
    const reg: RegExp = /^\{(.+?)\}$/;
    const participant: string = this.curActivityProps.participant
      .participant as string;
    // 子流程触发对象为子表时，参与者弹窗为子流程表达式弹窗
    if (triggerMappingData.mainTable === 1 && reg.test(participant)) {
      const item: any = this.childSheetUserList.find(
        (d: any) => d.value === participant,
      );
      if (item) {
        return `${item.label}${participant}`;
      }
    }
    const showText =
      this.curActivityProps.participant.participant &&
      this.curActivityProps.participant.participant.replace(
        /\{.+?\}/g,
        (word) => {
          try {
            const obj = JSON.parse(word);
            if (obj && obj.name) {
              return obj.name;
            }
          } catch (error) {}

          const key = word.slice(1, word.length - 1);
          return this.list[key] || '';
        },
      );

    return showText || this.curActivityProps.participant.participant;
  }

  beforeMount() {
    // this.setIsShowNextNode();
    this.setCheckboxValue();
    this.setExportRuleText();
  }

  setParticipant(payload: any) {
    // console.log('设置参与者函数：', payload);
    /* 赋值到store */
    this.setPropValue({
      key: 'participant.participant',
      value: payload.formula,
    });
    this.setPropValue({
      key: 'participant.popupType',
      value: payload.popupType,
    });
    this.showModal = false;
  }

  // 设置特权人信息
  setCusTom(payload: any) {
    // console.log('设置参与者函数：', payload);
    /* 赋值到store */
    this.setPropValue({
      key: 'participant.noParticipantorExr',
      value: payload.formula,
    });

    this.setPropValue({
      key: 'participant.noParticipantorPopupType',
      value: payload.popupType,
    });
    this.showAdminModal = false;
  }

  setCheckboxValue() {
    if (!this.curActivityProps || !this.curActivityProps.participant) {
      return;
    }
    const { originator, perviousParticipate, participated } =
      this.curActivityProps.participant;
    this.isCreated = originator === 'APPROVE' ? true : false;
    this.preParticipant = perviousParticipate === 'APPROVE' ? true : false;
    this.joinedFlow = participated === 'APPROVE' ? true : false;
  }

  // checkbox的change事件
  checkboxChange(type: string) {
    if (type === 'isCreated') {
      // 是发起人
      const value = this.isCreated ? 'APPROVE' : 'DEFAULT';
      this.setPropValue({
        key: 'participant.originator',
        value,
      });
    } else if (type === 'preParticipant') {
      // 前一活动参与
      const value = this.preParticipant ? 'APPROVE' : 'DEFAULT';
      this.setPropValue({
        key: 'participant.perviousParticipate',
        value,
      });
    } else if (type === 'joinedFlow') {
      // 参与过流程
      const value = this.joinedFlow ? 'APPROVE' : 'DEFAULT';
      this.setPropValue({
        key: 'participant.participated',
        value,
      });
    } else {
      //Else Empty block statement
    }
  }

  /* 打开出口规则弹窗 */
  openExportRuleModel(type: string) {
    this.exportRuleType = type;
    this.showExportRule = true;
  }

  setExportRuleText() {
    if (!this.curActivityProps || !this.curActivityProps.participant) {
      return;
    }
    if (this.curActivityProps.participant.approveExit) {
      if (
        `${this.curActivityProps.participant.approveExit}`.indexOf('%') !== -1
      ) {
        this.approveExitText = `${this.curActivityProps.participant.approveExit}同意到下一节点`;
      } else {
        this.approveExitText = `${this.curActivityProps.participant.approveExit}人同意到下一节点`;
      }
    }
    if (this.curActivityProps.participant.disapproveExit) {
      const exit = `${this.curActivityProps.participant.disapproveExit}`;
      const text =
        exit === '0' || exit === '0%' ? '不同意时不允许驳回' : '不同意时驳回';
      if (exit.indexOf('%') !== -1) {
        this.disapproveExitText = `${exit}${text}`;
      } else {
        this.disapproveExitText = `${exit}人${text}`;
      }
    }
  }

  showChooseTip = false;

  handleChangeSwitch(check: boolean) {
    if (check) {
      setTimeout(() => {
        this.showChooseTip = false;
      }, 4000);
    }
    this.showChooseTip = check;
  }

  setIsShowNextNode() {
    const activityCode: any = [];
    this.lines.forEach((i: any) => {
      if (
        i.endActivity &&
        i.endActivity.activityCode === 'Activity4' &&
        i.endActivity.activityType === 'END'
      ) {
        activityCode.push(i.startActivity && i.startActivity.activityCode);
      }
    });
    this.isShowNextNode = true;
    if (activityCode.find((v) => v === this.currentActivity.activityCode)) {
      this.isShowNextNode = false;
    }
  }

  @Watch('currentActivity')
  onActivityChange(v: string) {
    // this.setIsShowNextNode();
    this.setCheckboxValue();
    this.setExportRuleText();

    if (
      this.curActivityProps &&
      this.curActivityProps.participant &&
      this.curActivityProps.participant.noParticipant === 'WORKFLOW_ADMIN'
    ) {
      // 如果无参与者是 特权人 获取特权人列表
      this.getListWorkflowAdmin();
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.participant-panel {
  /deep/.ant-radio-group {
    display: flex;
    width: 100%;
  }
  /deep/.ant-radio-wrapper {
    margin-right: 18px;
  }
  .checkbox {
    margin-right: 8px;
  }
  .change-user-message {
    border: none;
    margin-bottom: 16px;
    /deep/ .property-right {
      overflow: visible;
    }
    /deep/ .property-wrap {
      border-top: none;
    }
  }
  .change-user-tip {
    display: flex;
    align-items: center;
    position: relative;
    /deep/ .ant-alert {
      position: absolute;
      left: -120px;
      top: -42px;
      width: 345px;
      height: auto;
      font-size: 12px;
      margin-left: 5px;
      white-space: normal;
    }
  }
}

.admin-pe {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
  span:hover {
    color: #14bd95;
    cursor: pointer;
  }
  div {
    max-width: 190px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.participantChoose-tips {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  font-size: 14px;
  color: @nav-font-color;
  line-height: 22px;
  padding: 9px 16px;
  text-align: justify;
}
.noParticipant-wrap {
  width: 100%;
  .noParticipant-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0;
    /deep/.ant-radio-wrapper {
      display: flex;
      margin-right: 0;
      align-items: center;
      height: 32px;
    }
  }
}
</style>

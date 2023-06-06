<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div :key="$route.path" class="workflow">
    <div class="workflow-head" @click="closeContextmenu">
      <div class="workflow-head-l">
        <span class="workflow-name" :title="workflowName">{{
          workflowName
        }}</span>
        <tag :text="tagContent" />
        <span v-if="!isWorkflowHistory" class="del-btn workflow-version"><i
            class="icon aufontAll h-icon-all-delete-o"
            @click="openDelConfirm"
          ></i></span>
        <div v-if="!isWorkflowHistory" class="to-history">
          <a-tooltip placement="top">
            <template slot="title"> 历史版本 </template>
            <span class="look-version" @click="setHistoryListVisible(true)">
              <i class="iconfont aufontAll h-icon-all-field-time"></i>
            </span>
          </a-tooltip>
        </div>
      </div>

      <div class="workflow-head-c">
        <ul>
          <li
            class="toolbar"
            :class="{ disabled: undoDisabled }"
            @click="revoke"
          >
            <i class="icon aufontAll h-icon-all-rollback-o"></i>
            <span>撤销</span>
          </li>
          <li
            class="toolbar"
            :class="{ disabled: redoDisabled }"
            @click="goBack"
          >
            <i class="icon aufontAll h-icon-all-cancell-o"></i>
            <span>返回</span>
          </li>

          <li
            class="toolbar align-type-wrapper"
            :class="{ disabled: sameStyleDisable }"
            @mouseleave="showAlignType = false"
            @mouseenter="changeShowAlignType"
          >
            <span> 对齐方式 </span>
            <span class="icon-wrap">
              <i class="icon aufontAll h-icon-all-caret-down"></i>
            </span>

            <div v-show="showAlignType" class="align-types">
              <div class="align-item" :class="{ disabled: sameStyleDisable }">
                <div class="align-type" @click="setSameStyle('left')">
                  <i class="icon aufontAll h-icon-all-align-left"></i> 左对齐
                </div>
                <div class="align-type" @click="setSameStyle('right')">
                  <i class="icon aufontAll h-icon-all-align-right"></i> 右对齐
                </div>
              </div>

              <div class="align-item" :class="{ disabled: sameStyleDisable }">
                <div class="align-type" @click="setSameStyle('top')">
                  <i class="icon aufontAll h-icon-all-align-top"></i> 顶部对齐
                </div>
                <div class="align-type" @click="setSameStyle('bottom')">
                  <i class="icon aufontAll h-icon-all-align-bottom"></i>
                  底部对齐
                </div>
              </div>

              <div class="align-item" :class="{ disabled: dicDisabled }">
                <div class="align-type" @click="vertical">
                  <i class="icon aufontAll h-icon-all-same-high"></i> 垂直等距
                </div>
                <div class="align-type" @click="horizontal">
                  <i class="icon aufontAll h-icon-all-same-width"></i> 水平等距
                </div>
              </div>
            </div>
          </li>

          <li
            class="toolbar"
            :class="{ disabled: sizeDisabled }"
            @click="sameSize"
          >
            <i class="icon aufontAll h-icon-all-same-size"></i>
            <span>等大小</span>
          </li>
          <li
            class="toolbar"
            :class="{ disabled: sizeDisabled }"
            @click="sameHeight"
          >
            <i class="icon aufontAll h-icon-all-highly-adaptive-o"></i>
            <span>等高</span>
          </li>
          <li
            class="toolbar"
            :class="{ disabled: sizeDisabled }"
            @click="sameWidth"
          >
            <i class="icon aufontAll h-icon-all-width-adaptive-o"></i>
            <span>等宽</span>
          </li>

          <li class="toolbar" @click="saveImage">
            <i class="icon aufontAll h-icon-all-picture-o"></i>
            <span>存为图片</span>
          </li>

          <!-- <li class="toolbar" @click="reset">
            <i class="icon aufontAll h-icon-all-reload-o"></i>
            <span>重置</span>
          </li>-->
        </ul>
      </div>
      <div class="workflow-head-r">
        <button v-if="isShowCopyBtn" class="workflow-btn" @click="copyProcess">
          <i class="icon aufontAll h-icon-all-save-o"></i>
          <span>复制流程</span>
        </button>
        <button
          class="workflow-btn"
          :class="{ disabled: isAsh }"
          :disabled="isAsh"
          @click="openWorkflowSetting"
        >
          <i class="icon aufontAll h-icon-all-setting-o"></i>
          <span>流程设置</span>
        </button>

        <a-popover
          v-if="simulateOpen"
          placement="bottom"
          trigger="click"
          :arrowPointAtCenter="true"
          overlayClassName="run-tips"
          :visible="showPopover"
          @visibleChange="onVisibleChange"
        >
          <template slot="content">
            <div class="popover-title">
              <i class="icon aufontAll h-icon-all-exclamation-circle"></i>
              <span>执行运行将会保存当前流程模版，是否继续执行？</span>
            </div>
            <div class="popover-footer">
              <div class="no-tips">
                <a-checkbox v-model="noMoreTips" class="check" />不再提示
              </div>
              <a-button
                @click="
                  showPopover = false;
                  noMoreTips = false;
                "
              >
                取消
              </a-button>
              <a-button type="primary" @click="run"> 继续运行 </a-button>
            </div>
          </template>

          <template v-if="workflowVersion === 0">
            <a-tooltip placement="top">
              <template slot="title"> 运行 </template>
              <span :class="{ disabled: isDisabled }">
                <i class="icon aufontAll h-icon-all-play-circle1"></i>
              </span>
            </a-tooltip>
          </template>
        </a-popover>
        <a-tooltip v-else placement="top">
          <template slot="title">
            请先在【系统管理-统一配置-流程配置】中开启流程运行开关
          </template>
          <span class="run-disabled">
            <i class="icon aufontAll h-icon-all-play-circle1"></i>
          </span>
        </a-tooltip>
        <a-tooltip placement="top">
          <template slot="title"> 检验 </template>
          <span @click="validate">
            <i class="icon aufontAll h-icon-all-filesearch"></i>
          </span>
        </a-tooltip>
        <!-- <a-tooltip placement="top">
          <template slot="title"> 保存 </template>
          <span @click="saveWorkflow">
            <i class="icon aufontAll h-icon-all-save"></i>
          </span>
        </a-tooltip> -->
        <a-button style="margin-left: 0" @click="saveWorkflow"> 保存 </a-button>
        <a-button
          type="primary"
          class="publish"
          style="margin-left: 8px"
          :class="{ disabled: isDisabled }"
          :disabled="isDisabled"
          @click="showPublishModal"
        >
          发布
        </a-button>
      </div>
    </div>
    <div class="workflow-content">
      <!-- 节点仓库 -->
      <div @click="closeContextmenu">
        <h3-sider
          :options="leftPanel"
          class="workflow-panel"
          @toggle="doAutoFit"
        >
          <model-contain />
        </h3-sider>
      </div>
      <!-- 流程绘图区 -->
      <div
        id="designer-wrap"
        class="designer-wrap"
        tabindex="0"
        @keydown="doKeyDown"
      >
        <workflow-designer
          ref="designers"
          v-h3-drop
          @buttonDisable="buttonDisable"
        />
      </div>
      <!-- 节点属性/流程属性 -->
      <div @click="closeContextmenu">
        <h3-sider :options="rightPanel" @toggle="doAutoFit">
          <div
            class="property-wrapper"
            :class="{ 'empty-node': curComponent === 'WorkflowProperty' }"
          >
            <a-tabs
              class="form-panel"
              :tabBarGutter="72"
              :activeKey="defaultActiveKey"
              @tabClick="tabClick"
            >
              <a-tab-pane
                key="1"
                :tab="
                  curComponent === 'WorkflowProperty'
                    ? '节点属性'
                    : getPropertyName(curComponent)
                "
              >
                <template v-if="curComponent !== 'WorkflowProperty'">
                  <component :is="curComponent" />
                </template>

                <template v-else>
                  <div class="place-choice-node">请选择画布中的节点</div>
                </template>
              </a-tab-pane>
              <a-tab-pane key="2" tab="流程属性">
                <WorkflowProperty />
              </a-tab-pane>
            </a-tabs>
          </div>
        </h3-sider>
      </div>
    </div>

    <tip-modal
      v-model="isShowErrorValidate"
      :warningMsg="warningMsg"
      :errorMsg="errMsg"
      :type="validateOrPublish"
      @release="stillRelease"
      @runWorkflow="runWorkflow"
    />

    <!-- 流程运行弹窗 -->
    <StartWorkflow
      v-model="isShowRunModal"
      :rules="lines"
      :activities="activities"
    />

    <a-modal
      v-model="isShowPublishModal"
      class="publish-modal"
      okText="发布"
      cancelText="取消"
      :maskClosable="false"
      :keyboard="false"
      @ok="publish"
    >
      <p slot="title">
        发布说明
        <span class="title-tip">用于历史版本介绍</span>
      </p>

      <div class="desc-box">
        <textarea
          v-model="publishDesc"
          placeholder="请输入说明（120字以内）必填"
          maxlength="120"
        ></textarea>
        <div class="desc-num">{{ publishDesc.length }}/120</div>
      </div>
    </a-modal>

    <a-modal
      v-model="isShowSaveConfirm"
      :closable="false"
      :maskClosable="false"
      :width="400"
      wrapClassName="unsave-confirm"
    >
      <div class="unsave-confirm--content">
        <i class="icon aufontAll h-icon-all-question-circle"></i>
        <strong>您刚对流程设置进行了修改，是否保存后再离开？</strong>
      </div>

      <template slot="footer">
        <a-button key="cancel" @click="handleConfirmCancel">
          {{ $t('languages.Apps.Cancel') }}
        </a-button>
        <a-button key="unsave" @click="handleConfirmUnsave">
          {{ $t('languages.Apps.Unsave') }}
        </a-button>
        <a-button
          key="save"
          class="ant-btn-large"
          type="primary"
          @click="handleConfirmOk"
        >
          {{ $t('languages.Apps.SaveAndLeave') }}
        </a-button>
      </template>
    </a-modal>

    <!-- 校验loading -->
    <div
      :class="
        isValidated ? 'validate-loading-box active' : 'validate-loading-box'
      "
    >
      <span><a-icon type="loading" /></span>
      流程检验中
    </div>
    <copyProess
      v-model="isShowCopyProess"
      @getWorkFlowMenu="getWorkFlowMenu"
    />
    <BigDialog
      title="历史版本"
      :show="historyListVisible"
      @cancel="setHistoryListVisible(false)"
    >
      <WorkflowHistory v-show="historyListVisible" />
    </BigDialog>
  </div>
</template>

<script lang="ts">
import BizMethodApi from '@/apis/biz-method/index.api';
import WorkflowApi from '@/apis/workflow';
import H3Sider from '@/common/sider/sider.vue';
import CirculateProperty from '@/components/apps/workflow/circulateProperty.vue';
import ConnectionProperty from '@/components/apps/workflow/connectionProperty.vue';
import LineProperty from '@/components/apps/workflow/lineProperty.vue';
import MultipleProperty from '@/components/apps/workflow/multiple-node/multiActivityProperty.vue';
import SubInstanceProperty from '@/components/apps/workflow/subIntanceProperty.vue';
import SystemActivityProperty from '@/components/apps/workflow/systemActivityProperty.vue';
import UserActivityProperty from '@/components/apps/workflow/userActivityProperty.vue';
import WorkflowProperty from '@/components/apps/workflow/workflowProperty.vue';
import StartWorkflow from '@/components/global/workflow-mock/modals/start-workflow.vue';
import copyProess from '@/../extends/components/copyProess.vue';
import '@/directives/drag';
import * as AppErrors from '@/typings/app-error';
import { LINE } from '@/typings/line';
import * as WorkflowNamespace from '@/typings/workflow';
import Bus from '@/utils/bus';
import { bizpropertyApi } from 'cloudpivot/api';
import canvg from 'canvg';
import html2canvas from 'html2canvas';
import { Component, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ModelContain from '../workflowDesigner/modelContain.vue';
import tipModal from '../workflowDesigner/tipModal.vue';
import WorkflowDesigner from '../workflowDesigner/workflowDesigner.vue';
import {
  Button,
  Checkbox,
  Icon,
  Modal,
  Popover,
  Tooltip,
  Tabs,
} from '@h3/antd-vue';
import Tag from '@/components/global/tag.vue';
import WorkflowHistory from '@/views/app/model/workflowSetting.vue';
import BigDialog from '@/components/apps/modals/bigDialog.vue';
import {
  SystemSettingType,
  getSettingParam,
} from '../../system/integration-setting/type/index';
import systemApi from '@/apis/system/system-manager.api';

const WorkflowModule = namespace('Apps/Workflow');
const AppItemModule = namespace('Apps/AppItem');

@Component({
  name: 'workflow',
  components: {
    H3Sider,
    ModelContain,
    WorkflowDesigner,
    tipModal,
    StartWorkflow,

    /* 引入属性组件 */
    WorkflowProperty,
    UserActivityProperty,
    SystemActivityProperty,
    SubInstanceProperty,
    ConnectionProperty,
    CirculateProperty,
    LineProperty,
    MultipleProperty,
    copyProess,
    APopover: Popover,
    ACheckbox: Checkbox,
    AButton: Button,
    AModal: Modal,
    AIcon: Icon,
    ATooltip: Tooltip,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    Tag,
    WorkflowHistory,
    BigDialog,
  },
  beforeRouteUpdate(to, from, next) {
    (this as any).validRoute().then(
      () => {
        next();
      },
      () => {
        next(false);
      },
    );
  },
  beforeRouteLeave(to, from, next) {
    const vm = this as any;
    if (vm.isWorkflowHistory) {
      this.setHistoryListVisible(true);
    }
    if (vm.notValid || vm.isWorkflowHistory) {
      // 删除流程不需校验是否修改
      vm.notValid = false;
      next();
      return;
    }
    vm.validRoute().then(
      () => {
        next();
        vm.showPropertyPanel('WorkflowProperty');
        vm.unSelect();
        vm.traceManager.Clear();
      },
      () => {
        next(false);
      },
    );
  },
})
export default class Workflow extends Vue {
  @WorkflowModule.State('traceManager') traceManager: any;

  @WorkflowModule.State('activities') activities: any;

  @WorkflowModule.State('defaultActivities') defaultActivities: any;

  @WorkflowModule.State('lines') lines: any;

  @WorkflowModule.State('workflowData') workflowData: any;

  @WorkflowModule.State('defaultWorkflowData') defaultWorkflowData: any;

  @WorkflowModule.State('workflow') workflow: any;

  @WorkflowModule.State('selectedActivities') selectedActivities: any;

  @WorkflowModule.State('beforeMovedActivities') beforeMovedActivities: any;

  @WorkflowModule.State('WorkflowDataItem_origin') WorkflowDataItemOrigin: any;

  @WorkflowModule.State('WorkflowDataItem_list') WorkflowListItem: any;

  @WorkflowModule.State('curComponent') curComponent: any;

  @WorkflowModule.State('isSaveProp') isSaveProp: any;

  @WorkflowModule.State('historyListVisible') historyListVisible: any;

  @WorkflowModule.Mutation('initTraceManager') initTraceManager: any;

  @WorkflowModule.Mutation('resetWorkflow') resetWorkflow: any;

  @WorkflowModule.Mutation('setIsShowContextmenu') setIsShowContextmenu: any;

  @WorkflowModule.Mutation('setWorkflowVersion') setWorkflowVersion: any;

  @WorkflowModule.Mutation('unSelect') unSelect: any;

  @WorkflowModule.Mutation('showPropertyPanel') showPropertyPanel: any;

  @WorkflowModule.Mutation('setBizMethodList') setBizMethodList: any;

  @WorkflowModule.Mutation('setBizRuleList') setBizRuleList: any;

  @WorkflowModule.Mutation('propsToData') propsToData: any;

  @WorkflowModule.Mutation('dataToProps') dataToProps: any;

  @WorkflowModule.Mutation('setCurActivityID') setCurActivityID: any;

  @WorkflowModule.Mutation('clearWorkflowData') clearWorkflowData: any;

  @WorkflowModule.Mutation('setHistoryListVisible') setHistoryListVisible: any;

  // @WorkflowModule.Action('updateWorkflowDraft') updateWorkflowDraft: any;

  // @WorkflowModule.Action('validateWorkflow') validateWorkflow: any;

  // @WorkflowModule.Action('transformData') transformData: any; // TODO refactor 页面已经没有地方使用

  // @WorkflowModule.Action('releaseWorkflow') releaseWorkflow: any;

  @WorkflowModule.Action('getWorkflowList') getWorkflowList: any;

  @AppItemModule.Action('deleteWorkflow') deleteWorkflow: any;

  @Prop({ type: String }) appCode: any;

  @Prop({ type: String }) workflowCode: any;

  @Prop({ type: String }) bizSchemaCode: any;

  showAlignType: boolean = false;

  isShowCopyProess: boolean = false;

  isShowCopyBtn: boolean = false;

  changeShowAlignType() {
    if (!this.sameStyleDisable) {
      this.showAlignType = true;
    }
  }

  leftPanel: any = {
    width: 160,
    minWidth: 160,
    maxWidth: 700,
    direction: 'left',
    collapsible: true,
    slider: true,
  };

  rightPanel: any = {
    width: 308,
    minWidth: 308,
    maxWidth: 800,
    direction: 'right',
    collapsible: true,
  };

  validateOrPublish: string = '';

  isShowErrorValidate: boolean = false;

  isShowPublishModal: boolean = false;

  isShowRunModal: boolean = false;

  isShow: boolean = false;

  isDisabled: boolean = false;

  dicDisabled: boolean = true; // 水平等距、垂直等距按钮是否禁用

  sizeDisabled: boolean = true; // 等大小、等高、等宽按钮是否禁用

  publishDesc: string = '';

  lastTraceIndex: number = -1; // 保存后的痕迹序号

  noMoreTips: boolean = false;

  showPopover: any = false;

  warningMsg = [];

  errMsg = [];

  workflowVersion: any = 0;

  flag: boolean = true;

  // 流程检验loading
  isValidated: boolean = false;

  // 是否展示未保存提示弹窗
  isShowSaveConfirm: boolean = false;

  saveConfirmPromiseResolve: Function | null = null;

  saveConfirmPromiseReject: Function | null = null;

  //流程模拟是否开启
  simulateOpen: boolean = false;

  get workflowName() {
    const { locale } = this.$i18n;
    if (locale === 'zh' || !this.workflowData.name_i18n) {
      return this.workflowData.workflowName;
    }
    // if (!this.workflowData.name_i18n) {
    //   return this.workflowData.workflowName;
    // }
    return this.workflowData.name_i18n[locale];
  }

  // 撤销按钮是否禁用
  get undoDisabled() {
    return this.traceManager.LastTraceIndex > -1 ? false : true;
  }

  // 返回按钮是否禁用
  get redoDisabled() {
    return this.traceManager.TraceStack &&
      this.traceManager.LastTraceIndex < this.traceManager.TraceStack.length - 1
      ? false
      : true;
  }

  // 是否置灰
  get isAsh() {
    let status = false;
    if (this.isDisabled || this.isHide) {
      status = true;
    }
    return status;
  }

  isMain: boolean = false;

  getIsMain(isMain: boolean) {
    this.isMain = isMain;
  }

  isHide: boolean = false;

  getIsHide(isHide: boolean) {
    this.isHide = isHide;
  }

  created() {
    this.initTraceManager();
    if (this.$route.query.version) {
      this.workflowVersion = this.$route.query.version;
    }
    this.getMethodList();
    if (this.isWorkflowHistory) {
      this.setHistoryListVisible(false);
    }

    this.getWorkflowConfig();
  }

  mounted() {
    // /isShowCopyBtn
    let userStr = window.sessionStorage.getItem('user');
    let str = '';
    if (userStr && JSON.parse(userStr)) {
      let user = JSON.parse(userStr);
      //permissions === ['APP_MNG']
      //findIndex
      if (user.permissions && user.permissions.length > 0) {
        let index = user.permissions.findIndex((item) => {
          return item === 'APP_MNG';
        });
        this.isShowCopyBtn = index > -1 ? true : false;
      }
    }
  }

  destroyed() {
    // 清空store缓存数据
    this.clearWorkflowData();
  }

  // 路由变化时检测做了修改的需要保存
  validRoute() {
    const vm = this as Workflow;
    const changed: boolean =
      vm.traceManager && vm.traceManager.LastTraceIndex !== vm.lastTraceIndex;
    if (!changed) {
      this.clearWorkflowData();
      return Promise.resolve();
    }
    this.isShowSaveConfirm = true;
    return new Promise((resolve, reject) => {
      this.saveConfirmPromiseResolve = resolve;
      this.saveConfirmPromiseReject = reject;
    });
  }

  onVisibleChange(visible: boolean) {
    if (visible) {
      const noMore = window.localStorage.getItem(
        `${this.workflowCode}-runTips`,
      );
      if (!noMore) {
        this.showPopover = true;
        return;
      }
      this.run();
    } else {
      this.showPopover = false;
    }
  }

  doKeyDown(e: any) {
    // 处理wrap操作键盘事件无效问题
    const designerDom = this.$refs.designers as any;
    if (designerDom) {
      designerDom.doKeyDown(e);
    }
  }

  defaultActiveKey: string = '2';

  @Watch('curComponent')
  onCurComponentChange(curComponent) {
    if (curComponent !== 'WorkflowProperty') {
      this.defaultActiveKey = '1';
    } else {
      this.defaultActiveKey = '2';
    }
  }

  tabClick(tab) {
    this.defaultActiveKey = tab;
  }

  /**
   * 获取属性面板标题名称
   */
  getPropertyName(curComponent: string) {
    let name: string = '';
    switch (curComponent) {
      case 'WorkflowProperty':
        name = '流程属性';
        break;
      case 'LineProperty':
        name = '连接线属性';
        break;
      case 'MultipleProperty':
        name = '节点属性批量设置';
        break;
      default:
        name = '节点属性';
        break;
    }
    return name;
  }

  /**
   * 点击取消按钮
   */
  handleConfirmCancel() {
    this.isShowSaveConfirm = false;
    if (this.saveConfirmPromiseReject) {
      this.saveConfirmPromiseReject();
      this.saveConfirmPromiseReject = null;
    }
  }

  /**
   * 点击不保存按钮
   */
  handleConfirmUnsave() {
    this.isShowSaveConfirm = false;
    if (this.saveConfirmPromiseResolve) {
      this.saveConfirmPromiseResolve();
      this.saveConfirmPromiseResolve = null;
    }
    this.clearWorkflowData();
  }

  /**
   * 点击保存按钮
   */
  handleConfirmOk() {
    (this as any).saveWorkflow().then(
      () => {
        this.handleConfirmUnsave();
      },
      () => {
        this.handleConfirmCancel();
      },
    );
  }

  // validRoute(fn:any) {
  //   const vm = this as Workflow;
  //   if (vm.traceManager && vm.traceManager.LastTraceIndex !== vm.lastTraceIndex) {
  //     this.$confirm({
  //       title: '您刚对流程设置进行了修改，是否保存后再离开？',
  //       okText: '保存并离开',
  //       cancelText: '不保存',
  //       async onOk() {
  //         await vm.saveWorkflow();
  //         fn();
  //       },
  //       onCancel() {
  //         fn();
  //       }
  //     });
  //   } else {
  //     fn();
  //   }
  // }

  // 关闭右键菜单
  closeContextmenu() {
    this.setIsShowContextmenu(false);
  }

  setSameStyle(type: 'top' | 'left' | 'right' | 'bottom') {
    if (this.sameStyleDisable) {
      return;
    }
    this.workflow.setSameStyle(type, this);
    Bus.$emit('autoFit');
  }

  // 水平等距
  horizontal() {
    if (this.dicDisabled) {
      return;
    }
    this.workflow.setSameStyle(
      WorkflowNamespace.SameStyle.HorizontalDistance,
      this,
    );
    Bus.$emit('autoFit');
  }

  // 垂直等距
  vertical() {
    if (this.dicDisabled) {
      return;
    }
    this.workflow.setSameStyle(
      WorkflowNamespace.SameStyle.VerticalDistance,
      this,
    );
    Bus.$emit('autoFit');
  }

  // 存为图片
  saveImage() {
    if (!this.flag) {
      return;
    }
    this.flag = false;
    const svg = document.getElementsByClassName(
      'lines-instance',
    )[0] as HTMLElement;
    if (typeof html2canvas !== 'undefined') {
      // 以下是对svg的处理
      const parentNode = document.getElementsByClassName('lines-wrap')[0];
      const svg2 = svg.outerHTML.trim();
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      canvg(canvas, svg2, { ignoreMouse: true, ignoreAnimation: true });
      svg.style.display = 'none';

      // 对图标的处理--开始
      const icon = document.getElementsByClassName('activity-icon');
      for (let i = 0; i < icon.length; i += 1) {
        const iconparentNode = icon[i].parentNode as HTMLElement;
        const icon2 = icon[i] as HTMLElement;
        const iconcanvas = document.createElement('canvas');
        iconcanvas.width = 14;
        iconcanvas.height = 14;
        iconcanvas.style.marginRight = '5px';
        iconcanvas.style.verticalAlign = 'middle';
        const content =
          document.getElementsByClassName('activity-icon')[i].textContent;

        // 获取画布
        const context: any = iconcanvas.getContext('2d');
        // 设置字体，能实现的关键点2
        context.font = '14px aufontAll';
        // 绘制内容
        context.fillText(content, 0, 12);

        iconparentNode.insertBefore(iconcanvas, icon2);
        icon2.style.display = 'none';
      }
      // 对图标的处理--完成

      // html2canvas将DOM转为canvas存为图片
      const timer = setTimeout(() => {
        const dom = document.querySelector('#workflow-drawer') as HTMLElement;
        html2canvas(dom, {
          allowTaint: true,
          height: dom.offsetHeight,
        }).then((canva: any) => {
          svg.style.display = 'block';
          parentNode.removeChild(canvas);
          for (let i = 0; i < icon.length; i += 1) {
            const iconparentNode = icon[i].parentNode as HTMLElement;
            const icon2 = icon[i] as HTMLElement;
            const iconcanvas = document.getElementsByTagName('canvas')[0];
            iconparentNode.removeChild(iconcanvas);
            icon2.style.display = 'inline-block';
          }
          const image = new Image();
          image.src = canva.toDataURL('image/png');
          const aLink = document.createElement('a');
          aLink.href = image.src;
          aLink.download = `${this.workflowData.workflowName}.png`;
          document.body.appendChild(aLink);
          aLink.click();
          document.body.removeChild(aLink);
          const canvas2 = document.createElement('canvas');
          canvas2.id = 'canvas';
          parentNode.appendChild(canvas2);
          this.flag = true;
          clearTimeout(timer);
        });
      }, 1000);
    }
  }

  // 等大小
  sameSize() {
    this.workflow.setSameStyle(WorkflowNamespace.SameStyle.Size, this);
    Bus.$emit('autoFit');
  }

  // 等高
  sameHeight() {
    this.workflow.setSameStyle(WorkflowNamespace.SameStyle.Height, this);
    Bus.$emit('autoFit');
  }

  // 等宽
  sameWidth() {
    this.workflow.setSameStyle(WorkflowNamespace.SameStyle.Width, this);
    Bus.$emit('autoFit');
  }

  // 撤销
  revoke() {
    this.traceManager.Undo();
    Bus.$emit('autoFit');
  }

  // 监听sider收起
  doAutoFit() {
    Bus.$emit('autoFit');
  }

  // 返回
  goBack() {
    this.traceManager.Redo();
    Bus.$emit('autoFit');
  }

  // 复制流程
  copyProcess() {
    this.isShowCopyProess = true;
  }
  // 重置
  // 功能已实现，后因某些原因撤销此按钮
  // 20181211
  // reset() {
  //   const vm = this;
  //   this.$warning({
  //     title: "重置会清空全部节点操作，确定重置吗？",
  //     onOk() {
  //       vm.resetWorkflow();
  //     }
  //   });
  // }

  /**
   * 格式化消息通知数据
   */
  notifyDataForamt(data: any, defaultData?: any) {
    let array: any = [];
    let defaultArray: any = [];
    if (defaultData && typeof defaultData === 'string') {
      if (/^\[.*\]$/.test(defaultData)) {
        defaultArray = JSON.parse(defaultData);
      } else {
        defaultArray = [defaultData];
      }
    } else if (defaultData) {
      defaultArray = JSON.parse(JSON.stringify(defaultData));
    } else {
      //Else Empty block statement
    }
    if (data && typeof data === 'string') {
      // array = JSON.parse(data)
      array = [data];
    } else if (data) {
      array = JSON.parse(JSON.stringify(data));
    } else {
      //Else Empty block statement
    }
    // const array:Array<any> = JSON.parse(JSON.stringify(data));
    //let obj:any = {};
    const json: Array<any> = [];
    array.forEach((item: any) => {
      if (typeof item === 'string') {
        item = item.trim();
        if (item) {
          const defaultItem = defaultArray.filter((i: any) => {
            return i.code === item;
          });
          if (defaultItem.length) {
            json.push(defaultItem[0]);
          } else {
            const flag: boolean = Array.isArray(this.WorkflowListItem)
              ? this.WorkflowListItem.findIndex(
                  (dataItem: any) => dataItem.id === item,
                ) > -1
              : false;
            const isItemData: boolean =
              this.WorkflowDataItemOrigin.findIndex(
                (dataItem: any) => dataItem.code === item,
              ) > -1;
            json.push({
              // isDataItem: isItemData ? 1 : 0,
              isDataItem: flag ? 2 : isItemData ? 1 : 0,
              code: item,
            });
            // if (isItemData) {
            //   obj = {
            //     isDataItem: 1,
            //     code: item
            //   };
            // } else {
            //   obj = {
            //     isDataItem: 0,
            //     code: item
            //   };
            // }
            //json.push(obj);
          }
        }
      }
    });
    return json;
  }

  // 消息内容
  summaryDataForamt(data: any) {
    if (!data) {
      return;
    }
    const code: string = '';
    const obj = {
      isDataItem: 2,
      code: '',
    };
    if (typeof data === 'string') {
      obj.code = data;
    } else {
      obj.code = data[0] ? data[0].code : '';
    }

    return [obj];
  }

  contentDataFormator(item: any, defaultItem?: any) {
    if (!item) {
      return;
    }
    if (Array.isArray(item)) {
      return JSON.stringify(this.notifyDataForamt(item, defaultItem));
    } else {
      return item;
    }
  }

  // 设置数据
  setWorkflowDataForAjax() {
    //
    // 先保存已修改过得数据
    // this.transformData(-1);
    this.propsToData();
    const _activities = JSON.parse(JSON.stringify(this.activities)); // todo 此处会将值为undefined的key去除（元数据化会有影响）
    const _defaultActivities = JSON.parse(
      JSON.stringify(this.defaultActivities),
    ); // todo 此处会将值为undefined的key去除（元数据化会有影响）
    const _linesConfig = JSON.parse(JSON.stringify(this.lines)); // todo
    const _lines: Array<any> = [];
    // content转json string
    const _workflowData: any = JSON.parse(JSON.stringify(this.workflowData));
    const _defaultWorkflowData: any = JSON.parse(
      JSON.stringify(this.defaultWorkflowData),
    );
    // 将流程时间转成json格式
    const workflowEventKeys: Array<string> = [
      'activateEventHandler',
      'endEventHandler',
      'cancelEventHandler',
      'startEventHandler',
    ];
    workflowEventKeys.forEach((key: string) => {
      if (_workflowData[key]) {
        const _content: any = _workflowData[key].content;
        const _defaultContent: any =
          _defaultWorkflowData[key] && _defaultWorkflowData[key].content;
        _workflowData[key].content = this.contentDataFormator(
          _content,
          _defaultContent,
        );
      }
    });

    _workflowData.name_i18n = JSON.stringify(_workflowData.name_i18n);
    _activities.forEach((item: any) => {
      const defaultItem = _defaultActivities.filter((i: any) => {
        return i.activityCode === item.activityCode;
      });
      // 因为流程编码可能与应用编码或其他编码重复，故加前缀，转成数据时去前缀
      if (item.workflowCode && item.workflowCode.indexOf('-') > -1) {
        [, item.workflowCode] = item.workflowCode.split('-');
      }

      // 当中文为空的时候，将国际化语言复制给中文
      if (!item.activityName) {
        item.activityName = item.name_i18n[this.$i18n.locale];
      }

      if (defaultItem.length) {
        const defaultActivity = defaultItem[0];
        // 用户活动节点需要的消息通知需要做格式化
        //  summary:[{"isDataItem":0:自定义数据；1:数据项,"code":数据项字段,2:视图展示格式}]
        // 20190705 title同上
        // 20200114 子流程添加消息通知
        if (
          item.activityType === 'PARTICIPANT' ||
          item.activityType === 'SUB_INSTANCE' ||
          item.activityType === 'CIRCULATE'
        ) {
          item.todoDataItem.summary =
            item &&
            item.todoDataItem &&
            item.todoDataItem.summary &&
            item.todoDataItem.summary[0] &&
            item.todoDataItem.summary[0].hasOwnProperty('isDataItem') &&
            item.todoDataItem.summary[0]['isDataItem'] === 2
              ? this.summaryDataForamt(item.todoDataItem.summary)
              : this.notifyDataForamt(
                  item.todoDataItem.summary,
                  defaultActivity &&
                    defaultActivity.todoDataItem &&
                    defaultActivity.todoDataItem.summary,
                );
          item.todoDataItem.title = this.notifyDataForamt(
            item.todoDataItem.title,
            defaultActivity &&
              defaultActivity.todoDataItem &&
              defaultActivity.todoDataItem.title,
          );
          item.todoDataItems &&
            item.todoDataItems.length &&
            item.todoDataItems.forEach((v) => {
              const defaultv =
                defaultActivity.todoDataItems &&
                defaultActivity.todoDataItems.length &&
                defaultActivity.todoDataItems.filter((i: any) => {
                  return i.belong === v.belong;
                });
              if (defaultv && defaultv.length) {
                if (v.belong === 'email') {
                  v.summary = this.notifyDataForamt(
                    v.summary,
                    defaultv[0].summary,
                  );
                } else if (v.belong === 'dingtalk') {
                  if (v.summary && Array.isArray(v.summary) && v.summary[0]) {
                    v.summary = this.notifyDataForamt(v.summary);
                  }
                  if (v.summary && typeof v.summary === 'string') {
                    v.summary = this.summaryDataForamt(v.summary);
                  }
                } else {
                  //Else Empty block statement
                }
                v.title = this.notifyDataForamt(v.title, defaultv[0].title);
              } else {
                if (v.belong === 'email') {
                  v.summary = this.notifyDataForamt(v.summary);
                } else if (v.belong === 'dingtalk') {
                  if (v.summary && Array.isArray(v.summary) && v.summary[0]) {
                    v.summary = this.notifyDataForamt(v.summary);
                  }
                  if (v.summary && typeof v.summary === 'string') {
                    v.summary = this.summaryDataForamt(v.summary);
                  }
                } else {
                  //Else Empty block statement
                }
                v.title = this.notifyDataForamt(v.title);
              }
            });
        }

        // 流程事件 content转数组
        const needTransformActivityTypes: Array<string> = [
          'PARTICIPANT',
          'SYSTEM_ACTIVITY',
          'SUB_INSTANCE',
          'CIRCULATE',
        ];
        const acticityEventTypes: Array<string> = [
          'beforeActivate',
          'afterActivate',
          'cancelActivity',
          'endActivity',
          'jobRejected',
          'jobSubmitted',
        ];
        if (needTransformActivityTypes.indexOf(item.activityType) > -1) {
          acticityEventTypes.forEach((key: string) => {
            if (item[key]) {
              const _content: any = item[key].content;
              const _defaultContent: any = defaultActivity[key].content;
              item[key].content = this.contentDataFormator(
                _content,
                _defaultContent,
              );
            }
          });
        }
      } else {
        // 用户活动节点需要的消息通知需要做格式化
        //  summary:[{"isDataItem":0:自定义数据；1:数据项,"code":数据项字段,2:视图展示格式}]
        // 20190705 title同上
        // 20200114 子流程添加消息通知

        if (
          item.activityType === 'PARTICIPANT' ||
          item.activityType === 'SUB_INSTANCE' ||
          item.activityType === 'CIRCULATE'
        ) {
          item.todoDataItem.summary =
            item &&
            item.todoDataItem &&
            item.todoDataItem.summary &&
            item.todoDataItem.summary[0] &&
            item.todoDataItem.summary[0].hasOwnProperty('isDataItem') &&
            item.todoDataItem.summary[0]['isDataItem'] === 2
              ? this.summaryDataForamt(item.todoDataItem.summary)
              : this.notifyDataForamt(item.todoDataItem.summary);
          item.todoDataItem.title = this.notifyDataForamt(
            item.todoDataItem.title,
          );
          item.todoDataItems &&
            item.todoDataItems.length &&
            item.todoDataItems.forEach((v) => {
              if (v.belong === 'email') {
                v.summary = this.notifyDataForamt(v.summary);
              } else if (v.belong === 'dingtalk') {
                v.summary = this.summaryDataForamt(v.summary);
              } else {
                //Else Empty block statement
              }
              v.title = this.notifyDataForamt(v.title);
            });
        }

        // 流程事件 content转数组
        const needTransformActivityTypes: Array<string> = [
          'PARTICIPANT',
          'SYSTEM_ACTIVITY',
          'SUB_INSTANCE',
          'CIRCULATE',
        ];
        const acticityEventTypes: Array<string> = [
          'beforeActivate',
          'afterActivate',
          'cancelActivity',
          'endActivity',
          'jobRejected',
          'jobSubmitted',
        ];
        if (needTransformActivityTypes.indexOf(item.activityType) > -1) {
          acticityEventTypes.forEach((key: string) => {
            if (item[key]) {
              const _content: any = item[key].content;
              item[key].content = this.contentDataFormator(_content);
            }
          });
        }
      }

      delete item.left;
      delete item.top;
      delete item.right;
      delete item.bottom;
      delete item.middle;
      delete item.center;
      delete item.ID;
      delete item.WorkflowElementType;
    });
    this.lines.forEach((line: any) => {
      const _points = line.points.map(
        (pointObj: LINE.point) => `${pointObj.x}, ${pointObj.y}`,
      );
      _lines.push({
        text: line.text,
        name_i18n: JSON.stringify(line.name_i18n),
        utilizeElse: line.utilizeElse || false,
        fixedPoint: true,
        formula: line.formula || '',
        popupType: line.popupType,
        preActivityCode: line.startActivity.activityCode,
        postActivityCode: line.endActivity.activityCode,
        points: _points,
        description: line.description,
      });
    });

    const params = {};
    if (!_workflowData.workflowName) {
      const workflowNameObj = JSON.parse(_workflowData.name_i18n);
      _workflowData.workflowName = workflowNameObj[this.$i18n.locale];
    }
    Object.assign(params, _workflowData, {
      activities: _activities,
      rules: _lines,
      remarks: this.publishDesc,
    });
    return params;
  }

  props2DataAndReset() {
    // 将当前节点属性转成数据
    this.dataToProps();
    // 重置当前节点
    this.setCurActivityID(-1);
  }

  // 保存 by John
  saveWorkflow() {
    if (!this.isSaveProp || this.isWorkflowHistory) {
      return;
    }
    const params = this.setWorkflowDataForAjax();
    return WorkflowApi.updateWorkflowDraft(params).then((res: any) => {
      if (res.errcode === 0) {
        this.lastTraceIndex = this.traceManager.LastTraceIndex;
        this.$message.success(res.errmsg);
        this.setWorkflowVersion('0');
        this.unSelect();
        this.props2DataAndReset();
        this.showPropertyPanel('WorkflowProperty');
        this.getWorkflowMenus();
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  // 点击运行按钮
  run() {
    this.showPopover = false;
    if (this.noMoreTips) {
      window.localStorage.setItem(`${this.workflowCode}-runTips`, 'true');
    }
    // 发布状态的直接运行；草稿状态的先校验保存后运行
    // if (this.workflowData.workflowVersion !== 0 && this.workflowVersion === 0) {
    //   this.isShowRunModal = true;
    // } else {
    if (!this.isSaveProp) {
      return;
    }
    // 先校验
    const params = this.setWorkflowDataForAjax();
    this.validateOrPublish = 'run';
    WorkflowApi.validateWorkflow(params).then((res: any) => {
      if (res.errcode === 0) {
        if (res.data && res.data.length > 0) {
          // 校验失败出现提示窗
          const filtedMsg = this.filterMsg(res.data);
          if (filtedMsg) {
            this.errMsg = filtedMsg.err;
            this.warningMsg = filtedMsg.warn;
            this.isShowErrorValidate = true;
          }
        } else {
          // 校验成功-保存流程模拟版本
          this.runWorkflow();
        }
      } else {
        this.$message.error('流程检验异常，请稍后重试!');
      }
    });
    // }
  }

  // 流程运行
  runWorkflow() {
    const params = this.setWorkflowDataForAjax();
    WorkflowApi.simulateWorkflow(params).then((res: any) => {
      if (res.errcode === 0) {
        this.isShowRunModal = true;
      } else {
        this.$message.error('运行失败，请重试！');
      }
    });
  }

  // 流程检验 by John
  validate() {
    if (!this.isSaveProp || this.isWorkflowHistory) {
      return;
    }
    const params = this.setWorkflowDataForAjax();
    this.validateOrPublish = 'validate';
    this.isValidated = true;
    this.hideLoader = (this.$message as any).loading();
    setTimeout(() => {
      WorkflowApi.validateWorkflow(params).then(this.thenHandler);
    }, 500);
  }

  // 流程发布 by john
  hideLoader: any = null;

  publish() {
    if (!this.isSaveProp) {
      return;
    }

    if (this.publishDesc === '') {
      // 发布说明为空不可发布
      this.$message.error('请填写发布说明');
      return;
    }

    this.hideLoader = (this.$message as any).loading();

    const params = this.setWorkflowDataForAjax();
    this.validateOrPublish = 'publish';
    this.isShowPublishModal = false;
    WorkflowApi.releaseWorkflow(params).then(this.thenHandler);
  }

  thenHandler(res: any) {
    this.isValidated = false;
    const successStr =
      this.validateOrPublish === 'validate' ? '流程检验通过!' : '发布成功!';
    const errorStr =
      this.validateOrPublish === 'validate'
        ? '流程检验异常，请稍后重试!'
        : '发布失败，请重试！';
    this.isShowPublishModal = false;
    this.hideLoader = null;
    this.publishDesc = '';
    if (res.errcode === 0) {
      if (res.data && res.data.length > 0) {
        const filtedMsg = this.filterMsg(res.data);
        if (filtedMsg) {
          this.errMsg = filtedMsg.err;
          this.warningMsg = filtedMsg.warn;
          this.isShowErrorValidate = true;
        }
      } else {
        this.lastTraceIndex = this.traceManager.LastTraceIndex;
        if (this.validateOrPublish === 'validate') {
          this.$message.success(successStr);
        } else {
          this.setWorkflowVersion(res.errmsg);
          this.$message.success(
            `版本（Version ${res.errmsg}）流程发布成功！`,
            1,
          );
        }
      }
      if (this.validateOrPublish === 'publish') {
        if (res.errmsg === '0') {
          this.setWorkflowVersion('1');
        }
        this.getWorkflowMenus();
      }
    } else {
      this.$message.error(errorStr);
    }
    this.unSelect();
    this.props2DataAndReset();
    this.showPropertyPanel('WorkflowProperty');
  }

  /**
   * @desc 获取流程设计菜单
   * @todo 寻找更合理的方案
   */
  getWorkflowMenus() {
    const params = {
      schemaCode: this.$route.params.bizSchemaCode,
    };
    this.getWorkflowList(params);
  }

  // 流程发布弹窗
  showPublishModal() {
    if (!this.isSaveProp) {
      return;
    }

    // 先校验
    const params = this.setWorkflowDataForAjax();
    this.validateOrPublish = 'publish';
    WorkflowApi.validateWorkflow(params).then((res: any) => {
      if (res.errcode === 0) {
        if (res.data && res.data.length > 0) {
          const filtedMsg = this.filterMsg(res.data);
          if (filtedMsg) {
            this.errMsg = filtedMsg.err;
            this.warningMsg = filtedMsg.warn;
            this.isShowErrorValidate = true;
          }
        } else {
          this.isShowPublishModal = true;
        }
      } else {
        this.$message.error('流程检验异常，请稍后重试!');
      }
    });
  }

  filterMsg(msg: any) {
    if (msg) {
      const _msg = JSON.parse(JSON.stringify(msg));
      const warnMsg = _msg.filter((item: any) => item.errorLevel === 'WARN');
      const errMsg = _msg.filter((item: any) => item.errorLevel === 'ERROR');
      return { warn: warnMsg, err: errMsg };
    }
  }

  i: string = '';

  @Provide()
  toWorkflowSetting() {
    // this.curComponent = 'WorkflowProperty'
    this.defaultActiveKey = '2';
    this.$nextTick(() => {
      const oDiv = document.querySelector('.set-privilege');
      if (oDiv) {
        oDiv.scrollIntoView();
      }
    });
  }

  openWorkflowSetting() {
    if (this.workflowCode && this.bizSchemaCode && this.appCode) {
      const { href } = this.$router.resolve({
        name: 'workflowSetting',
        params: {
          appCode: this.appCode,
          bizSchemaCode: this.bizSchemaCode,
          workflowCode: this.workflowCode,
        },
      });
      window.open(href, '_blank');
    }
  }

  // 流程设置查看历史版本时按钮置灰事件
  buttonDisable(disabled: boolean) {
    this.isDisabled = disabled;
  }

  stillRelease() {
    this.isShowPublishModal = true;
  }

  /**
   * 获取业务方法列表&业务规则列表
   */
  getMethodList() {
    const param: BizMethod.ListParam = {
      schemaCode: this.bizSchemaCode,
    };
    // 获取业务方法列表
    BizMethodApi.listBizMethods(param).then((res: any) => {
      if (Array.isArray(res.data)) {
        this.setBizMethodList(res.data);
      }
    });
    // 获取业务规则列表
    bizpropertyApi.listBySchemacode(param).then((res: any) => {
      if (Array.isArray(res.data)) {
        this.setBizRuleList(res.data);
      }
    });
  }

  // 删除流程化
  openDelConfirm() {
    // const vm = this;
    const name = this.workflowData.workflowName;
    const code = this.workflowData.workflowCode;
    this.$confirm({
      title: this.$t('languages.Apps.ConfirmDelete', {
        name,
      }), // `确定要删除“${'流程名称'}”吗？`,
      okType: 'danger',
      okText: this.$t('languages.Apps.Delete').toString(),
      cancelText: this.$t('languages.Apps.Cancel').toString(),
      onOk: () => {
        this.handleDeleteWorkflow(code);
      },
    });
  }

  // 删除流程
  notValid: boolean = false;

  handleDeleteWorkflow(code: any) {
    const params: any = { workflowCode: code };
    this.deleteWorkflow(params).then((res: any) => {
      if (res.errcode === 0) {
        if (
          this.$route.name === 'workflowDesign' &&
          code === this.$route.params.workflowCode
        ) {
          this.notValid = true;
          this.$router
            .push(
              `/apps/model/${this.appCode}/${this.bizSchemaCode}/workflowEmpty`,
            )
            .catch((err: any) => {
              console.log(err);
            });
        }
        this.$message.success(res.errmsg);
        this.getWorkflows();
      } else if (res.errcode && res.errcode > 0 && res.data.length > 0) {
        // 不可删除逻辑
        const errMsg: any = res.data[0];
        const errorCode: number = errMsg.errCode;
        const errorContent: string = errMsg.errContent ? errMsg.errContent : '';
        this.handleDisplayError(errorCode, errorContent);
      } else {
        //Else Empty block statement
      }
    });
  }

  handleDisplayError(errcode: number, errContent: string) {
    let _errString: any;
    if (errContent.indexOf(':') > -1) {
      _errString = errContent.split(':');
    } else {
      _errString = errContent;
    }
    switch (errcode) {
      // 流程删除
      case AppErrors.ErrorCodes.WorkflowBindByList:
        this.displayError(
          this.$t('languages.Apps.WorkflowBindByList', { list: _errString }),
        );
        break;
      case AppErrors.ErrorCodes.WorkflowBindAsSubWorkflowDraft:
        this.displayError(
          this.$t('languages.Apps.WorkflowBindAsSubWorkflowDraft', {
            list: _errString,
          }),
        );
        break;
      case AppErrors.ErrorCodes.WorkflowBindAsSubWorkflow:
        this.displayError(
          this.$t('languages.Apps.WorkflowBindAsSubWorkflow', {
            list: _errString,
          }),
        );
        break;
      case AppErrors.ErrorCodes.WorkflowInstanceExist:
        this.displayError(this.$t('languages.Apps.WorkflowInstanceExist'));
        break;

      default:
        break;
    }
  }

  displayError(content: any) {
    if (!content) {
      return;
    }
    this.$warning({
      title: content,
      okText: this.$t('languages.Apps.DeleteOk').toString(),
    });
  }

  // 获取流程列表
  getWorkflows() {
    // const params = {
    //   schemaCode: this.bizSchemaCode
    // };
    this.getWorkflowList({ schemaCode: this.bizSchemaCode });
  }

  sameStyleDisable: boolean = true;

  getWorkFlowMenu() {
    this.getWorkflows();
  }

  @Watch('selectedActivities')
  onSelectActivitiesChange(v: any) {
    this.dicDisabled = true;
    this.sizeDisabled = true;
    if (v && v.length >= 2) {
      this.sameStyleDisable = false;
      this.sizeDisabled = false;
    } else {
      this.sameStyleDisable = true;
    }
    if (v && v.length >= 3) {
      this.dicDisabled = false;
    }
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.propsToData();
  }

  get tagContent() {
    if (this.workflowVersion !== 0) {
      return `版本${this.workflowVersion}`;
    } else if (
      this.workflowData.workflowVersion !== 0 &&
      this.workflowVersion === 0
    ) {
      return `版本${this.workflowData.workflowVersion}`;
    } else {
      return '草稿';
    }
  }

  get isWorkflowHistory() {
    return this.$route.name === 'workflowHistoryDetail';
  }

  getWorkflowConfig() {
    const param: getSettingParam = {
      settingType: SystemSettingType[SystemSettingType.WORKFLOW_SIMULATIVE],
    };
    systemApi.getSettingByType(param).then((res: any) => {
      if (res.errcode === 0) {
        this.simulateOpen =
          res.data && res.data['workflow.simulative.switch'] === 'true';
      }
    });
  }
}
</script>

<style lang="less" scoped>
@import '~@/components/apps/form-design/style/form-design-scoped.less';
</style>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.property-wrapper {
  padding-left: 16px;
  // padding-right: 16px;
  /deep/.ant-tabs-bar {
    margin-right: 16px;
  }

  /deep/.ant-switch-small {
    width: 36px;
    height: 18px;
    &::after {
      width: 14px;
      height: 14px;
    }
  }
}
.property-wrapper {
  /deep/.ant-collapse-content-box {
    padding: 0;
  }
  /deep/.ant-input {
    height: 30px;
    color: @nav-font-color;
  }
  /deep/.ant-input[disabled] {
    color: @s-light-font-color;
  }
}

.form-panel {
  &/deep/.ant-tabs {
    display: flex;
    flex-direction: column;
  }
  /deep/.ant-tabs-bar,
  /deep/.ant-tabs-tabpane {
    background: #fff;
    // border-radius: 4px;
    margin-bottom: 0;
  }
  /deep/.ant-tabs-tab {
    font-size: 14px;
  }
  /deep/.ant-tabs-nav-wrap {
    text-align: center;
  }
  /deep/.ant-tabs-content {
    flex: 1;
    height: calc(100vh - 154px);
    .ant-tabs-tabpane {
      overflow: auto;
      padding-right: 16px;
      padding-bottom: 4px;
      height: calc(100vh - 154px);
      // &:last-child {
      //   padding-top: 4px;
      // }
    }
  }
  /deep/.h3-panel-header > span {
    font-size: 13px !important;
    color: @nav-font-color;
  }
  /deep/.ant-tabs-nav {
    color: @nav-font-color;
    .ant-tabs-tab-active {
      color: @nav-font-color;
      font-weight: 600;
    }
  }
}

.empty-node {
  /deep/.ant-tabs-tabpane {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }
}
.workflow {
  .workflow-head {
    display: flex;
    width: 100%;
    height: 50px;
    overflow: hidden;
    background: #ffffff;
    border-bottom: thin solid #e4e4e4;
    .workflow-head-l {
      flex: 1;
      padding: 0 24px;
      width: 177px;
      text-align: left;
      position: relative;
      display: flex;
      align-items: center;
      .workflow-name {
        max-width: 126px;
        white-space: nowrap;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        overflow: hidden;
        font-size: 16px;
        line-height: 48px;
        color: @nav-font-color;
        display: inline-block;
        font-weight: bold;
      }
      .workflow-version {
        display: inline-block;
        vertical-align: top;
        font-size: 14px;
        margin-left: 8px;
        line-height: 50px;
        color: @nav-font-color;
      }
      .del-btn {
        margin-right: 24px;
        .icon {
          color: #f4454e !important;
          cursor: pointer;
        }
      }
    }
    .to-history {
      height: 50px;
      line-height: 50px;
      margin-left: 21px;
      display: inline-block;
      vertical-align: top;
      position: relative;
      &::before {
        content: '';
        height: 28px;
        border-right: 1px solid #e4e4e4;
        position: absolute;
        left: -24px;
        top: 50%;
        transform: translateY(-50%);
      }
      span {
        font-size: 18px;
        color: @nav-font-color;
        opacity: 0.5;
        cursor: pointer;
        &:hover {
          color: @primary-color;
        }
      }
    }
    .workflow-head-c {
      flex-grow: 0;
      text-align: center;
      ul {
        height: 100%;
        width: 100%;
        overflow: hidden;
        &:after {
          content: '';
          display: block;
          height: 0;
          clear: both;
        }
        .toolbar {
          display: inline-block;
          line-height: 48px;
          margin-left: 16px;
          font-size: 12px;
          cursor: pointer;
          user-select: none;
          color: @nav-font-color;
          &:hover {
            color: @primary-color;
          }
          i {
            font-size: 14px;
            vertical-align: middle;
            margin-right: 5px;
            &:before {
              transform: rotate(180deg);
            }
          }
          &.align-type-wrapper {
            position: relative;
            & > span {
              margin-right: 6px;
              &.icon-wrap {
                width: 12px;
                margin-right: 8px;
                & > i {
                  font-size: 10px;
                  transform: scale(0.75);
                  position: absolute;
                  color: @s-light-font-color;
                }
              }
            }

            .align-types {
              position: fixed;
              z-index: 999;
              background-color: #ffffff;
              width: 116px;
              box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
              border-radius: 4px;
              margin-left: -21px;
              margin-top: -8px;
              .align-item {
                padding: 4px 0;
                border-bottom: 1px solid #eeeeee;
                border-top: 1px solid #eeeeee;
                &:first-child,
                &:last-child {
                  border: none;
                }
                .align-type {
                  cursor: pointer;
                  height: 32px;
                  line-height: 32px;
                  color: @nav-font-color;
                  font-size: 14px;
                  text-align: left;
                  padding: 0 12px;
                  i {
                    font-size: 16px;
                  }
                  &:hover {
                    color: #2970ff;
                  }
                }
                &.disabled {
                  .align-type {
                    opacity: 0.25;
                    cursor: not-allowed;
                    &:hover {
                      color: @nav-font-color;
                    }
                  }
                }
              }
            }
          }
        }
        .disabled {
          opacity: 0.25;
          cursor: not-allowed;
          &:hover {
            color: @nav-font-color;
          }
        }
      }
    }
    .workflow-head-r {
      flex: 1;
      margin-right: 24px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      span {
        margin-right: 20px;
        cursor: pointer;
        i {
          font-size: 18px;
          color: @nav-font-color;
          opacity: 0.5;
        }
      }
      .workflow-btn {
        background: #fff;
        margin-top: 8px;
        cursor: pointer;
        height: 32px;
        color: @nav-font-color;
        font-size: 14px;
        transition: all 0.5s ease;
        &:hover {
          border-color: @primary-color;
          color: @primary-color;
        }
        i {
          margin-right: 5px;
          font-size: 14px;
        }
      }
      .disabled {
        color: rgba(17, 18, 24, 0.25);
        background-color: #f5f5f5;
        border-color: #d9d9d9;
        cursor: not-allowed;
        &:hover {
          background: #f5f5f5;
          color: rgba(17, 18, 24, 0.25);
        }
        i:hover {
          color: rgba(17, 18, 24, 0.25) !important;
        }
      }
      .run-disabled {
        cursor: not-allowed;
        i {
          opacity: 0.15;
        }
      }
    }
  }
  .workflow-content {
    display: flex;
    height: calc(100% - 50px);
    width: 100%;
    background: #f7f8fa;
    > div {
      background: #fff;
    }

    .property-name {
      height: 46px;
      line-height: 46px;
      text-align: center;
      border-bottom: 1px solid #e4e4e4;
      font-weight: bold;
      font-size: 14px;
      margin: 0 16px;
    }
    .designer-wrap {
      padding: 10px 10px 50px 10px;
      flex-grow: 1;
      overflow: auto;
      margin: 20px 20px 0 20px;
      box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.1),
        0px 2px 4px 0px rgba(0, 0, 0, 0.1);
      border-radius: 8px 8px 0px 0px;
    }
  }

  /deep/.ant-collapse > .ant-collapse-item > .ant-collapse-header {
    line-height: 40px;
    padding: 0 0 0 20px;
    font-weight: 600;
    color: @nav-font-color;
    .ant-collapse-arrow {
      left: 0;
    }
  }
  /deep/.ant-collapse > .ant-collapse-item > .ant-collapse-header .arrow {
    left: 8px;
  }
  /deep/.ant-select-selection--single {
    height: 30px;
    /deep/.ant-select-selection__rendered {
      line-height: 30px;
    }
  }
  /deep/.ant-select-selection--multiple {
    min-height: 30px;
    padding-bottom: 0;
    /deep/.ant-select-selection__rendered {
      line-height: 30px;
    }
  }
  .validate-loading-box {
    position: fixed;
    top: 75px;
    left: 50%;
    margin-left: -100px;
    text-align: center;
    width: 197px;
    height: 42px;
    line-height: 42px;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.43);
    background: white;
    color: #4a4a4a;
    transform: scale(0);
    transition: all ease 0.3s;
    span {
      margin-right: 8px;
    }
    &.active {
      transform: scale(1);
    }
  }
}
.workflow-panel {
  position: relative;
  z-index: 10;
  height: 100%;
}

.ant-modal-body {
  padding: 16px 24px;
}

.title-tip {
  font-size: 12px;
  color: rgba(17, 18, 24, 0.5);
}

.desc-box {
  height: 223px;
  position: relative;
  .desc-num {
    font-size: 12px;
    color: rgba(17, 18, 24, 0.5);
    text-align: right;
  }
  textarea {
    width: 100%;
    height: 100%;
    font-size: 14px;
    border: none;
    resize: none;
    outline: none;
  }
}

.place-choice-node {
  color: @light-font-color;
  font-size: 14px;
}
</style>
<style lang="less">
.run-tips {
  min-width: 280px;
  .popover-title {
    position: relative;
    i {
      font-size: 14px;
      color: #faad14;
      margin-right: 8px;
      vertical-align: top;
      &:hover {
        color: #faad14;
      }
    }
  }
  .popover-footer {
    margin-bottom: 4px;
    text-align: right;
    .ant-btn {
      height: 24px;
      padding: 0 7px;
      font-size: 12px;
      border-radius: 4px;
      margin-left: 8px;
    }
    .no-tips {
      display: inline-block;
      color: rgba(17, 18, 24, 0.5);
      font-size: 12px;
      .check {
        font-size: 12px;
        &::before {
          content: ''; // 表单设计中不知谁导致样式污染
        }
        margin-right: 4px;
      }
    }
  }
}

.property-wrapper {
  .ant-collapse-borderless {
    background-color: #fff;
  }
  .ant-collapse-borderless > .ant-collapse-item {
    border-bottom: none;
  }
}

.workflow-panel {
  .ant-collapse-borderless {
    background-color: #fff;
  }
  .ant-collapse-content-box {
    padding: 0;
  }
  .ant-collapse-borderless > .ant-collapse-item {
    border-bottom: none;
  }
}
.ant-tooltip-inner {
  max-width: 300px;
}
</style>

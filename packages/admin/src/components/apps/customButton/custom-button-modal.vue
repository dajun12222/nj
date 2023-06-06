<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="cb-modal">
    <div class="cb-modal-scroll" :style="{ maxHeight: hgt + 'px' }">
      <div class="cb-modal-info">
        <p class="cb-modal-title">基本信息</p>
        <div class="cb-modal-Div">
          <div class="cb-modal-infoRows">
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">按钮名称</span>
            </p>
            <a-input
              v-model="btnName"
              :maxLength="20"
              class="cb-modal-input"
              placeholder="请输入"
            />
          </div>
          <div class="cb-modal-infoRows">
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">按钮编码</span>
            </p>
            <!-- @focus="inputblurCodes" -->
            <a-input
              v-model="CodeName"
              :maxLength="28"
              :disabled="CodeNameOpen"
              class="cb-modal-input"
              placeholder="请输入"
              @blur="inputblurCode"
            />
          </div>
          <div class="cb-modal-infoRows">
            <p class="cb-modal-label"><span>移入提示</span></p>
            <a-input
              v-model="Tips"
              :maxLength="200"
              class="cb-modal-input"
              placeholder="请输入"
            />
          </div>
          <div class="cb-modal-infoRows">
            <p class="cb-modal-label"><span>操作描述</span></p>
            <a-textarea
              v-model="describe"
              :maxLength="2000"
              class="cb-modal-textarea"
            />
          </div>
        </div>
      </div>
      <div class="cb-modal-info">
        <p class="cb-modal-title">操作设置</p>
        <div class="cb-modal-Div">
          <div v-if="addviewType === 'View'" class="cb-modal-infoRows">
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">使用位置</span>
            </p>
            <a-radio-group v-model="useLocation">
              <a-radio-button value="LIST">列表</a-radio-button>
              <!-- <a-radio-button value="FORM">表单</a-radio-button> -->
              <a-radio-button value="ROW">行按钮</a-radio-button>
            </a-radio-group>
          </div>
          <div class="cb-modal-infoRows">
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">操作类型</span>
            </p>
            <a-radio-group v-model="operationType">
              <a-radio-button value="WITH_VIEW">有操作页面</a-radio-button>
              <a-radio-button value="WITH_OUT_VIEW">无操作页面</a-radio-button>
            </a-radio-group>
          </div>
          <div v-if="operationType === 'WITH_VIEW'" class="cb-modal-infoRows">
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">选择动作</span>
            </p>
            <a-radio-group v-model="viewType" @change="viewTypeChange">
              <a-radio-button value="ADD_DATA">新增数据</a-radio-button>
              <a-radio-button value="FLOW">发起流程</a-radio-button>
              <a-radio-button value="FORM">查看表单</a-radio-button>
              <a-radio-button value="LIST">查看列表</a-radio-button>
              <a-radio-button value="SCRIPT">JS事件脚本</a-radio-button>
            </a-radio-group>
          </div>
          <div
            v-if="operationType === 'WITH_VIEW' && viewType !== 'SCRIPT'"
            class="cb-modal-infoRows"
          >
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">选择模型</span>
            </p>
            <biz-models-selector
              v-model="schemaCodeValId"
              style="width: 360px; height: 32px"
              :placeholder="'请选择模型'"
              @change="schemaCodeChange"
            />
          </div>
          <!-- 选择视图 -->
          <div
            v-if="operationType === 'WITH_VIEW' && viewType === 'LIST'"
            class="cb-modal-infoRows"
          >
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">选择视图</span>
            </p>
            <a-select
              v-model="viewXListData1"
              placeholder="请选择"
              style="width: 360px; height: 32px"
              @change="viewXListChange"
            >
              <a-select-option
                v-for="(items, ind) in viewXList"
                :key="ind"
                :value="items.code"
              >
                {{ items.name }}
              </a-select-option>
            </a-select>
          </div>
          <!-- 选择表单 -->
          <div
            v-if="
              operationType === 'WITH_VIEW' &&
              (viewType === 'FORM' || viewType === 'ADD_DATA')
            "
            class="cb-modal-infoRows"
          >
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">选择表单</span>
            </p>
            <a-select
              v-model="formListData1"
              placeholder="请选择"
              style="width: 360px; height: 32px"
              @change="formListDataChange"
            >
              <a-select-option
                v-for="(items, ind) in formList"
                :key="ind"
                :value="items.code"
              >
                {{ items.name }}
              </a-select-option>
            </a-select>
          </div>
          <!-- 发起流程 -->
          <div
            v-if="operationType === 'WITH_VIEW' && viewType === 'FLOW'"
            class="cb-modal-infoRows"
          >
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">发起流程</span>
            </p>
            <a-select
              v-model="WorkflowListDataId"
              placeholder="请选择"
              style="width: 360px; height: 32px"
              @change="workflowChange"
            >
              <a-select-option
                v-for="(items, ind) in WorkflowList"
                :key="ind"
                :value="items.workflowCode"
              >
                {{ items.workflowName }}
              </a-select-option>
            </a-select>
          </div>
          <!-- 有操作视图配置 -->
          <div
            v-if="
              operationType === 'WITH_VIEW' &&
              viewType !== 'LIST' &&
              viewType !== 'SCRIPT'
            "
            class="cb-modal-infoRows"
          >
            <p class="cb-modal-label cb-modal-labelM">
              <span
                :class="{
                  'cb-modal-labelText': viewType === 'FORM' ? true : false,
                }"
                >{{ viewType === 'FORM' ? '数据条件' : '数据赋值' }}</span>
            </p>
            <div class="cb-modal-configure">
              <a-row type="flex" class="RowStyle">
                <a-col class="" :span="11"> 目标模型数据项 </a-col>
                <a-col class="configure_mage01" :span="4"> 类型 </a-col>
                <a-col class="configure_mage02" :span="4"> 值 </a-col>
              </a-row>
              <a-row
                v-for="(con, ind) in configureList"
                :key="ind"
                type="flex"
                class="RowStyle"
                justify="space-between"
              >
                <a-col class="" :span="7">
                  <a-select
                    v-model="con.targetDataItemId"
                    placeholder="请选择数据项"
                    style="width: 100%; height: 32px"
                    @change="targetDataItemChange(ind)"
                    @dropdownVisibleChange="dropdownVisibleChange(ind, 1)"
                  >
                    <a-select-option
                      v-for="(items, index) in targetDataItemListC"
                      :key="index"
                      :class="{ colorYc: items.disabled }"
                      :disabled="items.disabled"
                      :value="items.code"
                    >
                      {{ items.name }}
                    </a-select-option>
                  </a-select>
                </a-col>
                <a-col class="" :span="4">
                  <a-select
                    v-model="con.OptionType"
                    style="width: 100%; height: 32px"
                    @change="handleChange"
                  >
                    <a-select-option value="Eq">等于</a-select-option>
                  </a-select>
                </a-col>
                <a-col class="" :span="4">
                  <a-select
                    v-model="con.isConst"
                    style="width: 100%; height: 32px"
                    @change="isConstChange(ind)"
                  >
                    <a-select-option value="true"> 常量 </a-select-option>
                    <a-select-option value="false"> 变量 </a-select-option>
                  </a-select>
                </a-col>
                <a-col class="" :span="7">
                  <a-input
                    v-if="con.isConst === 'true'"
                    v-model="con.currentDataInput"
                    placeholder="请输入"
                  />
                  <a-select
                    v-else
                    v-model="con.currentDataItemId"
                    placeholder="请选择数据项"
                    style="width: 100%; height: 32px"
                    @change="currentDataItemChange(ind)"
                    @dropdownVisibleChange="dropdownVisibleChange(ind, 2)"
                  >
                    <a-select-option
                      v-for="(items, index01) in currentDataItemListC"
                      :key="index01"
                      :value="items.code"
                    >
                      {{ items.name }}
                    </a-select-option>
                  </a-select>
                </a-col>
                <a-col class="configure_delete" :span="1" @click="deletes(ind)"><a-icon type="delete" /></a-col>
              </a-row>
              <div class="configure_add" @click="add">
                <span>
                  <i class="icon aufontAll h-icon-all-plus-o"></i>
                </span>
                <p>添加</p>
              </div>
            </div>
          </div>
          <!-- 调用类型 -->
          <div
            v-if="operationType === 'WITH_OUT_VIEW'"
            class="cb-modal-infoRows"
          >
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">选择动作</span>
            </p>
            <a-radio-group v-model="callType">
              <a-radio-button value="BUSINESS_RULE">业务规则</a-radio-button>
              <a-radio-button value="SCRIPT">JS事件脚本</a-radio-button>
              <!-- <a-radio-button value="method">业务方法</a-radio-button> -->
            </a-radio-group>
            <!-- <a-input
              :disabled="true"
              style="width: 360px; height: 32px"
              placeholder="业务规则"
            /> -->
          </div>
          <!-- 脚本 -->
          <div
            v-if="
              (operationType === 'WITH_VIEW' && viewType === 'SCRIPT') ||
              (operationType === 'WITH_OUT_VIEW' && callType === 'SCRIPT')
            "
            class="cb-modal-infoRows"
          >
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">脚本</span>
            </p>
            <a-textarea v-model="scriptData" class="cb-modal-textarea" />
          </div>
          <!-- 业务规则选择 -->
          <div
            v-if="
              operationType === 'WITH_OUT_VIEW' && callType === 'BUSINESS_RULE'
            "
            class="cb-modal-infoRows"
          >
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">业务规则</span>
            </p>
            <a-select
              v-model="businessRulesDataId"
              placeholder="请选择"
              style="width: 360px; height: 32px"
              @change="businessRulesChange"
            >
              <a-select-option
                v-for="(its, index) in businessRulesList"
                :key="index"
                :value="its.code"
              >
                {{ its.name }}
              </a-select-option>
            </a-select>
          </div>
          <!-- 选择权限 -->
          <div class="cb-modal-infoRows">
            <p class="cb-modal-label">
              <span class="cb-modal-labelText">按钮显示权限</span>
              <!-- <a-icon type="question-circle" theme="filled" class="cb-modal-Tips" /> -->
              <a-tooltip placement="top">
                <template #title>
                  <span
                    v-if="
                      operationType === 'WITH_OUT_VIEW' &&
                      callType === 'BUSINESS_RULE'
                    "
                    >按钮调用业务规则时，需在“应用权限组-按钮权限”中，选择业务规则给用户授权</span>
                  <span v-else>按钮显示权限与模型的按钮权限关联，如选择“新增”，用户有“新增”权限时就能看到当前按钮；<br />“新增”按钮可在“应用权限组-按钮权限”中给用户授权</span>
                </template>
                <a-icon
                  type="question-circle"
                  theme="filled"
                  class="cb-modal-Tips"
                />
              </a-tooltip>
            </p>
            <template
              v-if="
                !(
                  callType === 'BUSINESS_RULE' &&
                  operationType === 'WITH_OUT_VIEW'
                )
              "
            >
              <a-select
                v-model="BizpropertyListDataId"
                placeholder="请选择本模型的一个服务"
                style="width: 360px; height: 32px"
                @change="BizpropertyListChange"
              >
                <a-select-option
                  v-for="(its, index) in BizpropertyList"
                  :key="index"
                  :value="its.code"
                >
                  {{ its.name }}
                </a-select-option>
              </a-select>
            </template>
            <template v-else>
              <a-input
                :disabled="true"
                style="width: 360px; height: 32px"
                placeholder="同所选业务规则权限"
              />
            </template>
          </div>
          <!-- <template v-if="operationType === 'WITH_OUT_VIEW' && callType === 'method'">
            -- 业务服务选择 --
            <div class="cb-modal-infoRows">
              <p class="cb-modal-label"><span class="cb-modal-labelText">业务服务</span></p>
              <a-select
                v-model="value1"
                placeholder="请选择业务服务"
                style="width: 360px;height: 32px"
                @change="handleChange"
              >
                <a-select-option value="jack">Jack</a-select-option>
                <a-select-option value="lucy">Lucy</a-select-option>
                <a-select-option value="disabled" disabled>Disabled</a-select-option>
                <a-select-option value="Yiminghe">yiminghe</a-select-option>
              </a-select>
            </div>
            -- 业务方法选择 --
            <div class="cb-modal-infoRows">
              <p class="cb-modal-label"><span class="cb-modal-labelText">业务方法</span></p>
              <a-select
                v-model="value1"
                placeholder="请选择业务方法"
                style="width: 360px;height: 32px"
                @change="handleChange"
              >
                <a-select-option value="jack">Jack</a-select-option>
                <a-select-option value="lucy">Lucy</a-select-option>
                <a-select-option value="disabled" disabled>Disabled</a-select-option>
                <a-select-option value="Yiminghe">yiminghe</a-select-option>
              </a-select>
            </div>
            -- 无操作视图业务方法配置 --
            <div class="cb-modal-yew">
              <a-tabs v-model="activeKey" type="card">
                <a-tab-pane key="1" tab="传入参数">
                  <a-row type="flex" class="cb-modal-yewListHeader">
                    <a-col class="col colFirst" :span="4"> 序号 </a-col>
                    <a-col class="col" :span="4"> 参数 </a-col>
                    <a-col class="col" :span="4"> 参数类型 </a-col>
                    <a-col class="col" :span="6"> 映射方式 </a-col>
                    <a-col class="col" :span="6"> 映射对象 </a-col>
                  </a-row>
                  <a-row
                    type="flex"
                    class="cb-modal-yewList"
                  >
                    <a-col class="col colFirst" :span="4">
                      1
                    </a-col>
                    <a-col class="col" :span="4">
                      <span
                        class="long-text"
                        >参数</span>
                    </a-col>
                    <a-col class="col" :span="4">
                      类型
                    </a-col>
                    <a-col class="col" :span="6">
                      <a-select
                        v-model="value1"
                        placeholder="请选择数据项"
                        style="width: 146px;height: 32px"
                        @change="handleChange"
                      >
                        <a-select-option value="jack">Jack</a-select-option>
                        <a-select-option value="lucy">Lucy</a-select-option>
                        <a-select-option value="disabled" disabled>Disabled</a-select-option>
                        <a-select-option value="Yiminghe">yiminghe</a-select-option>
                      </a-select>
                    </a-col>
                    <a-col class="col select" :span="6">
                      <a-select
                        v-model="value1"
                        placeholder="请选择数据项"
                        style="width: 146px;height: 32px"
                        @change="handleChange"
                      >
                        <a-select-option value="jack">Jack</a-select-option>
                        <a-select-option value="lucy">Lucy</a-select-option>
                        <a-select-option value="disabled" disabled>Disabled</a-select-option>
                        <a-select-option value="Yiminghe">yiminghe</a-select-option>
                      </a-select>
                    </a-col>
                  </a-row>
                </a-tab-pane>
                <a-tab-pane key="2" tab="返回参数">
                  <a-row type="flex" class="cb-modal-yewListHeader">
                    <a-col class="col colFirst" :span="4"> 序号 </a-col>
                    <a-col class="col" :span="4"> 参数 </a-col>
                    <a-col class="col" :span="4"> 参数类型 </a-col>
                    <a-col class="col" :span="6"> 映射方式 </a-col>
                    <a-col class="col" :span="6"> 映射对象 </a-col>
                  </a-row>
                  <a-row
                    type="flex"
                    class="cb-modal-yewList"
                  >
                    <a-col class="col colFirst" :span="4">
                      1
                    </a-col>
                    <a-col class="col" :span="4">
                      <span
                        class="long-text"
                        >参数</span>
                    </a-col>
                    <a-col class="col" :span="4">
                      类型
                    </a-col>
                    <a-col class="col" :span="6">
                      <a-select
                        v-model="value1"
                        placeholder="请选择数据项"
                        style="width: 146px;height: 32px"
                        @change="handleChange"
                      >
                        <a-select-option value="jack">Jack</a-select-option>
                        <a-select-option value="lucy">Lucy</a-select-option>
                        <a-select-option value="disabled" disabled>Disabled</a-select-option>
                        <a-select-option value="Yiminghe">yiminghe</a-select-option>
                      </a-select>
                    </a-col>
                    <a-col class="col select" :span="6">
                      <a-select
                        v-model="value1"
                        placeholder="请选择数据项"
                        style="width: 146px;height: 32px"
                        @change="handleChange"
                      >
                        <a-select-option value="jack">Jack</a-select-option>
                        <a-select-option value="lucy">Lucy</a-select-option>
                        <a-select-option value="disabled" disabled>Disabled</a-select-option>
                        <a-select-option value="Yiminghe">yiminghe</a-select-option>
                      </a-select>
                    </a-col>
                  </a-row>
                </a-tab-pane>
              </a-tabs>
            </div>
          </template> -->
        </div>
      </div>
    </div>
    <div class="cb-modal-btn">
      <a-button style="width: 80px; margin-right: 8px" @click="onClosest">取消</a-button>
      <a-button
        type="primary"
        style="width: 80px"
        :disabled="$route.path.includes('apps/versionDetail/')"
        @click="Determine"
        >确定</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Input,
  Radio,
  Select,
  Button,
  Row,
  Col,
  Icon,
  Tabs,
  Tooltip,
  Form,
} from '@h3/antd-vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import * as DatacustomButtonApi from '@/apis/data-customButton';
import bizModelsSelector from '@/components/global/biz-models-selector/index.vue';
import * as listApis from '@/apis/list/list.api';
import * as formApiOld from '@/apis/form';
import { listApi, bizpropertyApi } from 'cloudpivot/api';
import workFlowApi from '@/apis/workflow';
import { pattern, nameValidator } from '@/common/utils';

@Component({
  name: 'CustomButtonModal',
  components: {
    AInput: Input,
    ATextarea: Input.TextArea,
    ARadio: Radio,
    ARadioButton: Radio.Button,
    ARadioGroup: Radio.Group,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button,
    ARow: Row,
    ACol: Col,
    AIcon: Icon,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    bizModelsSelector,
    ATooltip: Tooltip,
    AForm: Form,
    AFormItem: Form.Item,
  },
})
export default class CustomButtonModal extends Vue {
  @Prop({ default: 'Form' }) addviewType: string; //新增的类型

  @Prop() editDataValue?: any; //编辑时传入弹框的数据

  useLocation: string = 'LIST'; //使用位置

  operationType: string = 'WITH_VIEW'; //操作类型

  viewType: string = 'ADD_DATA'; //选择动作

  callType: string = 'BUSINESS_RULE'; //调用类型

  btnName: string = ''; //按钮名称

  CodeName: string = ''; //按钮编码

  CodeNameOpen: boolean = false; //按钮编码编辑状态

  Tips: string = ''; //移入提示

  describe: string = ''; //操作描述

  params: any = {}; //提交请求接口参数

  actionConfig: any = {}; //按钮配置参数

  schemaCodeVal: any = ''; //选择模型数据

  schemaCodeValId: any = ''; //选择模型数据赋值

  viewXList: any = []; //选择视图

  viewXListData: any = []; //视图数据

  viewXListData1: any = []; //视图数据编辑

  formList: any = []; //选择表单

  formListData: any = []; //表单数据

  formListData1: any = []; //表单数据编辑

  WorkflowList: any = []; //发起流程列表

  WorkflowListData: any = []; //流程数据

  WorkflowListDataId: any = []; //流程数据选中id

  targetDataItemList: any = []; //目标模型数据项列表集合

  targetDataItemListC: any = []; //目标模型数据项列表展示

  currentDataItemList: any = []; //当前模型数据项列表集合

  currentDataItemListC: any = []; //当前模型数据项列表展示

  configureList: any = [
    {
      targetDataItemId: [],
      targetDataItem: '', //目标模型数据项数据
      OptionType: 'Eq',
      isConst: 'true',
      currentDataItemId: [],
      currentDataItem: '', //当前模型数据项数据
      currentDataInput: '', //为输入框时
    },
  ]; //配置列表

  BizpropertyList: any = [
    {
      code: 'add',
      name: '新增',
      defaultRule: true,
    },
    {
      code: 'delete',
      name: '删除',
      defaultRule: true,
    },
    {
      code: 'edit',
      name: '编辑',
      defaultRule: true,
    },
    {
      code: 'import',
      name: '导入',
      defaultRule: true,
    },
    {
      code: 'export',
      name: '导出',
      defaultRule: true,
    },
    {
      code: 'editowner',
      name: '修改拥有者',
      defaultRule: true,
    },
    {
      code: 'batch_update',
      name: '批量修改',
      defaultRule: true,
    },
    {
      code: 'qr_code',
      name: '批量打印二维码',
      defaultRule: true,
    },
    {
      code: 'batch_print',
      name: '批量打印模板',
      defaultRule: true,
    },
  ]; //按钮显示权限列表

  BizpropertyListData: any = []; //按钮显示权限列表数据

  BizpropertyListDataId: any = [];

  businessRulesList: any = []; //业务规则列表

  businessRulesData: any = []; //业务规则数据

  businessRulesDataId: any = []; //业务规则id

  scriptData: string = ''; //脚本数据

  hgt: any = 700;

  // 规则
  rules: any = {
    code: [
      {
        required: true,
        message: '请填写按钮编码',
      },
      {
        pattern: pattern('code'),
        message: '以字母开头不超过28个字符，仅支持字母、数字、下划线',
      },
    ],
    name: [
      {
        required: true,
        message: '请填写方法名称',
      },
      {
        validator: nameValidator,
        message: '仅限20个字符以内，并不能以空格开头',
      },
    ],
  };

  value1: any = [];

  value2: any = [];

  value3: any = [];

  activeKey: any = 1;

  get bizSchemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  //提交
  Determine() {
    this.params = {};
    this.params.schemaCode = this.schemaCodeVal ? this.schemaCodeVal.key : '';
    this.params.name = this.btnName;
    this.params.code = this.CodeName;
    this.params.hint = this.Tips;
    this.params.description = this.describe;
    this.params.addviewType = this.addviewType;
    this.params.useLocation =
      this.addviewType === 'Form' ? 'FORM' : this.useLocation;
    this.params.operateType = this.operationType;
    this.params.bindAction =
      this.operationType === 'WITH_VIEW' ? this.viewType : this.callType;
    this.params.showPermCode = this.BizpropertyListDataId;
    this.params.showPermType =
      this.BizpropertyListData.length > 0 &&
      this.BizpropertyListData[0].defaultRule
        ? 'BIND_SYS_BUTTON'
        : 'BIND_BUSINESS_RULE';
    switch (this.params.operateType) {
      case 'WITH_VIEW':
        this.params.actionConfig = this.withView();
        break;
      case 'WITH_OUT_VIEW':
        if (this.params.bindAction === 'BUSINESS_RULE') {
          this.params.targetCode = this.businessRulesDataId;
          this.params.showPermCode = this.businessRulesDataId;
        }
        if (this.params.bindAction === 'SCRIPT') {
          this.actionConfig.scriptData = this.scriptData;
          this.params.actionConfig = this.actionConfig;
        }
        // this.params.actionConfig = this.withOutView();
        break;
      default:
        break;
    }
    if (!this.handleSubmit()) {
      return;
    }

    //this.editDataValue ? this.$message.success('编辑按钮成功') : this.$message.success('添加按钮成功')

    this.$emit('customButton', this.params);
    // DatacustomButtonApi.create(this.params).then((res: any) => {
    //     alert(res.data)
    // });
  }

  // 有视图配置参数
  withView() {
    switch (this.viewType) {
      case 'LIST':
        this.actionConfig.schemaCodeVal = this.schemaCodeVal;
        this.actionConfig.viewXListData = this.viewXListData;
        break;
      case 'FORM':
      case 'ADD_DATA':
      case 'FLOW':
        this.actionConfig.schemaCodeVal = this.schemaCodeVal;
        if (this.viewType === 'FLOW') {
          this.actionConfig.WorkflowListData = this.WorkflowListData;
        } else {
          this.actionConfig.formListData = this.formListData;
        }
        if (this.configureList) {
          this.actionConfig.configureList = this.configureList;
        }
        break;
      case 'SCRIPT':
        this.actionConfig.scriptData = this.scriptData;
        break;
      default:
        break;
    }
    return this.actionConfig;
  }

  // 无视图配置参数
  withOutView() {
    switch (this.callType) {
      case 'SCRIPT':
        break;
      case 'BUSINESS_RULE':
        this.actionConfig.businessRule = this.businessRulesDataId;
        break;
      case 'method':
        break;
      default:
        break;
    }
    return this.actionConfig;
  }

  handleSubmitList: any = [
    'name',
    'code',
    'schemaCode',
    'actionConfig',
    'showPermCode',
    'targetCode',
  ];

  //表单必填校验
  handleSubmit() {
    for (const val of this.handleSubmitList) {
      switch (val) {
        case 'name':
          if (!this.params[val]) {
            this.$message.error('按钮名称不能为空');
            return false;
          } else {
            const reg = /^ /;
            if (reg.test(this.params[val])) {
              this.$message.error('按钮名称不能为空字符且不能以空字符开头');
              return false;
            }
          }
          break;
        case 'code':
          if (!this.params[val]) {
            this.$message.error('按钮编码不能为空');
            return false;
          } else if (!pattern('code').test(this.params[val])) {
            this.$message.error(
              '按钮编码以字母开头不超过28个字符，且仅支持字母、数字、下划线',
            );
            return false;
          } else {
            //Else Empty block statement
          }
          break;
        case 'schemaCode':
          if (
            !this.params[val] &&
            this.params.bindAction !== 'SCRIPT' &&
            this.params.bindAction !== 'BUSINESS_RULE'
          ) {
            this.$message.error('模型不能为空');
            return false;
          }
          break;
        case 'actionConfig':
          if (this.params.actionConfig) {
            for (const acVal in this.params.actionConfig) {
              if (this.params.actionConfig.hasOwnProperty(acVal)) {
                switch (acVal) {
                  case 'formListData':
                  case 'WorkflowListData':
                  case 'viewXListData':
                    if (
                      !this.params.actionConfig[acVal] ||
                      (Array.isArray(this.params.actionConfig[acVal]) &&
                        this.params.actionConfig[acVal].length === 0)
                    ) {
                      if (this.params.bindAction === 'LIST') {
                        this.$message.error('视图不能为空');
                        return false;
                      } else if (
                        this.params.bindAction === 'FORM' ||
                        this.params.bindAction === 'ADD_DATA'
                      ) {
                        this.$message.error('表单不能为空');
                        return false;
                      } else if (this.params.bindAction === 'FLOW') {
                        this.$message.error('流程不能为空');
                        return false;
                      } else {
                      }
                    }
                    break;
                  case 'configureList':
                    if (this.params.bindAction === 'FORM') {
                      if (this.params.actionConfig[acVal].length === 0) {
                        this.$message.error('数据条件存在数据项为空', 4);
                        return false;
                      } else {
                        for (const clVal of this.params.actionConfig[acVal]) {
                          for (const clVals in clVal) {
                            if (!clVal[clVals]) {
                              if (
                                clVals === 'currentDataInput' ||
                                clVals === 'currentDataItem' ||
                                clVals === 'currentDataItemId'
                              ) {
                                if (
                                  !clVal.currentDataInput &&
                                  !clVal.currentDataItem
                                ) {
                                  this.$message.error(
                                    '数据条件存在数据项为空',
                                    4,
                                  );
                                  return false;
                                }
                              } else {
                                this.$message.error(
                                  '数据条件存在数据项为空',
                                  4,
                                );
                                return false;
                              }
                            }
                          }
                        }
                      }
                    }
                    break;
                  case 'scriptData':
                    if (!this.params.actionConfig[acVal]) {
                      if (this.params.bindAction === 'SCRIPT') {
                        this.$message.error('JS事件脚本不能为空');
                        return false;
                      }
                    }
                    break;
                  default:
                    break;
                }
              }
            }
          }
          break;
        case 'showPermCode':
          if (
            (!this.params[val] || this.params[val].length === 0) &&
            this.params.bindAction !== 'BUSINESS_RULE'
          ) {
            this.$message.error('按钮显示权限不能为空');
            return false;
          }
          break;
        case 'targetCode':
          if (
            (!this.params[val] || this.params[val].length === 0) &&
            this.params.bindAction === 'BUSINESS_RULE'
          ) {
            this.$message.error('业务规则不能为空');
            return false;
          }
          break;
        default:
          break;
      }
    }
    return true;
  }

  //选择动作
  viewTypeChange() {
    this.schemaCodeVal = [];
    this.schemaCodeValId = [];
    this.formListData = []; //表单数据
    this.formListData1 = []; //表单数据编辑
    this.viewXListData = []; //视图数据
    this.viewXListData1 = []; //视图数据编辑
    this.WorkflowListData = []; //流程数据
    this.WorkflowListDataId = []; //流程数据选中id
    this.configureList = [
      {
        targetDataItemId: [],
        targetDataItem: '', //目标模型数据项数据
        OptionType: 'Eq',
        isConst: 'true',
        currentDataItemId: [],
        currentDataItem: '', //当前模型数据项数据
        currentDataInput: '', //为输入框时
      },
    ]; //配置列表
  }

  //选择模型
  schemaCodeChange(value: any) {
    if (value.key && value.key.indexOf('-') !== -1) {
      value.value = value.key =
        value.key.split('-')[value.key.split('-').length - 1];
    }
    this.schemaCodeVal = value;
    this.formListData = []; //表单数据
    this.formListData1 = []; //表单数据编辑
    this.viewXListData = []; //视图数据
    this.viewXListData1 = []; //视图数据编辑
    this.WorkflowListData = []; //流程数据
    this.WorkflowListDataId = []; //流程数据选中id
    this.configureList = [
      {
        targetDataItemId: [],
        targetDataItem: '', //目标模型数据项数据
        OptionType: 'Eq',
        isConst: 'true',
        currentDataItemId: [],
        currentDataItem: '', //当前模型数据项数据
        currentDataInput: '', //为输入框时
      },
    ]; //配置列表
    this.schemaCodeInfo(this.schemaCodeVal.value);
  }

  //获取弹框中视图表单数据项数据
  schemaCodeInfo(code: any) {
    if (this.viewType === 'LIST') {
      this.viewXLists(code);
    } else if (this.viewType === 'FLOW') {
      this.getWorkflows(code);
    } else {
      this.getForms(code);
    }
    this.getDataItemList(code);
  }

  //避免重复选择某个数据项
  duplicateRemoval() {
    if (this.configureList.length > 0 && this.targetDataItemList.length > 0) {
      for (const tags of this.targetDataItemList) {
        tags.disabled = false;
      }
      for (const con of this.configureList) {
        for (const tag of this.targetDataItemList) {
          if (tag.code === con.targetDataItemId) {
            tag.disabled = true;
          }
        }
      }
      this.targetDataItemListC = this.targetDataItemList;
    } else {
      if (this.targetDataItemList.length > 0) {
        for (const tags of this.targetDataItemList) {
          tags.disabled = false;
        }
      }
    }
  }

  //选择视图
  viewXListChange(value: any) {
    this.viewXListData = this.viewXList.filter((x) => {
      return x.code === value;
    });
  }

  //选择数据项时匹配相同类型的数据项
  dropdownVisibleChange(index: number, type: number) {
    switch (type) {
      case 1:
        this.targetDataItemListC = this.targetDataItemList;
        if (this.configureList[index].isConst === 'true') {
          if (this.targetDataItemList.length > 0) {
            this.targetDataItemListC = this.targetDataItemList.filter((x) => {
              return [0, 1].indexOf(x.propertyType) !== -1;
            });
          }
        } else {
          if (
            typeof this.configureList[index].currentDataItemId === 'string' &&
            this.configureList[index].currentDataItemId
          ) {
            this.targetDataItemListC = this.targetDataItemList.filter((x) => {
              return (
                x.propertyType ===
                this.configureList[index].currentDataItem[0].propertyType
              );
            });
          }
        }
        break;
      case 2:
        this.currentDataItemListC = this.currentDataItemList;
        if (
          typeof this.configureList[index].targetDataItemId === 'string' &&
          this.configureList[index].targetDataItemId
        ) {
          this.currentDataItemListC = this.currentDataItemList.filter((x) => {
            return (
              x.propertyType ===
              this.configureList[index].targetDataItem[0].propertyType
            );
          });
        }
        break;
      default:
        break;
    }
  }

  //选择目标模型数据项
  targetDataItemChange(val: any) {
    this.configureList[val].targetDataItem = this.targetDataItemList.filter(
      (x) => {
        return x.code === this.configureList[val].targetDataItemId;
      },
    );
    this.duplicateRemoval();
  }

  //选择当前模型数据项
  currentDataItemChange(val: any) {
    this.configureList[val].currentDataItem = this.currentDataItemList.filter(
      (x) => {
        return x.code === this.configureList[val].currentDataItemId;
      },
    );
  }

  //选择表单
  formListDataChange() {
    this.configureList = [
      {
        targetDataItemId: [],
        targetDataItem: '', //目标模型数据项数据
        OptionType: 'Eq',
        isConst: 'true',
        currentDataItemId: [],
        currentDataItem: '', //当前模型数据项数据
        currentDataInput: '', //为输入框时
      },
    ]; //配置列表
    this.formListData = this.formList.filter((x) => {
      return x.code === this.formListData1;
    });
  }

  //选择流程
  workflowChange(code: string) {
    this.configureList = [
      {
        targetDataItemId: [],
        targetDataItem: '', //目标模型数据项数据
        OptionType: 'Eq',
        isConst: 'true',
        currentDataItemId: [],
        currentDataItem: '', //当前模型数据项数据
        currentDataInput: '', //为输入框时
      },
    ]; //配置列表
    if (Array.isArray(this.WorkflowListDataId)) {
      this.WorkflowListDataId = code;
    }
    this.WorkflowListData = this.WorkflowList.filter((x) => {
      return x.workflowCode === this.WorkflowListDataId;
    });
  }

  //选择业务规则
  businessRulesChange() {
    // this.businessRulesData = this.BizpropertyList.filter((x) => {
    //   return x.id === this.businessRulesDataId;
    // });
  }

  //选择权限
  BizpropertyListChange() {
    this.BizpropertyListData = this.BizpropertyList.filter((x) => {
      return x.code === this.BizpropertyListDataId;
    });
  }

  // 获取视图列表
  async viewXLists(val: string) {
    await listApis.getList(val).then((res: any) => {
      if (res.data && Array.isArray(res.data)) {
        this.viewXList = res.data.filter((x) => {
          return x.queryPresentationType === 'LIST';
        });
      }
    });
    // 编辑时校验视图列表是否存在
    if (this.editDataValue) {
      this.editDataCheck('LIST');
    }
  }

  //获取数据项列表
  async getDataItemList(val: string) {
    await listApi.getDataItemList({ schemaCode: val }).then((res: any) => {
      if (res.data && Array.isArray(res.data)) {
        if (this.viewType !== 'FORM') {
          this.targetDataItemList = res.data.filter((x) => {
            return x.propertyType !== 8 && !x.defaultProperty;
          });
        } else {
          this.targetDataItemList = res.data.filter((x) => {
            return x.propertyType !== 8;
          });
        }
        if (this.targetDataItemList.length > 0) {
          for (const con of this.targetDataItemList) {
            con.disabled = false;
          }
        }
        this.targetDataItemListC = this.targetDataItemList;
        this.duplicateRemoval();
      }
    });
    await listApi
      .getDataItemList({ schemaCode: this.bizSchemaCode })
      .then((res: any) => {
        if (res.data && Array.isArray(res.data)) {
          this.currentDataItemListC = this.currentDataItemList =
            res.data.filter((x) => {
              return x.propertyType !== 8;
            });
        }
      });
    // 编辑时校验数据项等是否存在
    if (this.editDataValue) {
      this.editDataCheck('ITEM');
    }
  }

  // 获取表单列表
  async getForms(val: string) {
    await formApiOld
      .list(val)
      .then((res: any) => {
        if (res.data && Array.isArray(res.data)) {
          this.formList = res.data;
        }
      })
      .catch((error: any) => {
        // 编辑时校验表单是否存在
        if (this.editDataValue) {
          console.log(error);
          this.editDataCheck('FORM');
        }
      });
  }

  // 获取流程列表
  async getWorkflows(val: string) {
    await workFlowApi.getWorkflowList({ schemaCode: val }).then((res: any) => {
      if (res.data && Array.isArray(res.data)) {
        this.WorkflowList = res.data;
      }
    });
    // 编辑时校验流程是否存在
    if (this.editDataValue) {
      this.editDataCheck('FLOW');
    }
  }

  itemOpen: boolean = true;

  // 编辑时校验模型、流程、表单、视图、数据项等是否存在
  editDataCheck(type: string) {
    switch (type) {
      case 'ITEM':
        if (this.configureList.length > 0) {
          for (const x of this.configureList) {
            let targetData: any = [];
            let currentData: any = [];
            if (typeof x.targetDataItemId === 'string') {
              targetData = this.targetDataItemListC.filter((y) => {
                return y.code === x.targetDataItemId;
              });
              if (targetData.length === 0) {
                if (this.itemOpen) {
                  this.$message.error('有数据项已被删除，请重新配置');
                  this.itemOpen = false;
                  setTimeout(() => {
                    this.itemOpen = true;
                  }, 300);
                }
                x.targetDataItemId = [];
              }
            }
            if (typeof x.currentDataItemId === 'string') {
              currentData = this.currentDataItemListC.filter((y) => {
                return y.code === x.currentDataItemId;
              });
              if (currentData.length === 0) {
                if (this.itemOpen) {
                  this.$message.error('有数据项已被删除，请重新配置');
                  this.itemOpen = false;
                  setTimeout(() => {
                    this.itemOpen = true;
                  }, 300);
                }
                x.currentDataItemId = [];
                x.currentDataItem = '';
              }
            }
          }
        }
        break;
      case 'FLOW':
        if (typeof this.WorkflowListDataId === 'string') {
          let WorkflowData: any = [];
          WorkflowData = this.WorkflowList.filter((x) => {
            return x.workflowCode === this.WorkflowListDataId;
          });
          if (WorkflowData.length === 0) {
            this.$message.error('选中的流程已被删除，请重新选择');
            this.WorkflowListDataId = [];
            this.WorkflowListData = '';
          }
        }
        break;
      case 'FORM':
        if (typeof this.formListData1 === 'string') {
          let formListDatas: any = [];
          formListDatas = this.formList.filter((x) => {
            return x.code === this.formListData1;
          });
          if (formListDatas.length === 0) {
            this.$message.error('选中的表单已被删除，请重新选择');
            this.formListData1 = [];
            this.formListData = '';
          }
        }
        break;
      case 'LIST':
        if (typeof this.viewXListData1 === 'string') {
          let viewXListDatas: any = [];
          viewXListDatas = this.viewXList.filter((x) => {
            return x.code === this.viewXListData1;
          });
          if (viewXListDatas.length === 0) {
            this.$message.error('选中的视图已被删除，请重新选择');
            this.viewXListData1 = [];
            this.viewXListData = '';
          }
        }
        break;
      case 'MOD':
        formApiOld.list(this.schemaCodeValId).catch((res: any) => {
          if (res.errcode !== 0 && res.errmsg === '业务模型不存在') {
            this.$message.error('选中的模型已被删除，请重新选择');
            this.schemaCodeValId = '';
            this.schemaCodeVal = '';
            this.formListData = []; //表单数据
            this.formListData1 = []; //表单数据编辑
            this.viewXListData = []; //视图数据
            this.viewXListData1 = []; //视图数据编辑
            this.WorkflowListData = []; //流程数据
            this.WorkflowListDataId = []; //流程数据选中id
            this.configureList = [
              {
                targetDataItemId: [],
                targetDataItem: '', //目标模型数据项数据
                OptionType: 'Eq',
                isConst: 'true',
                currentDataItemId: [],
                currentDataItem: '', //当前模型数据项数据
                currentDataInput: '', //为输入框时
              },
            ]; //配置列表
          }
        });
        break;
      default:
        break;
    }
  }

  // 获取按钮显示权限列表
  getBizproperty() {
    bizpropertyApi
      .listBySchemacode({ schemaCode: this.bizSchemaCode })
      .then((res) => {
        if (res.errcode === 0) {
          if (res.data) {
            this.businessRulesList = res.data.filter((x) => {
              return !x.defaultRule;
            });
            this.BizpropertyList = this.BizpropertyList.concat(
              this.businessRulesList,
            );
          }
        }
      });
  }

  //添加新配置行
  add() {
    this.configureList.push({
      targetDataItemId: [],
      targetDataItem: '', //目标模型数据项数据
      OptionType: 'Eq',
      isConst: 'true',
      currentDataItemId: [],
      currentDataItem: '', //当前模型数据项数据
      currentDataInput: '', //为输入框时
    });
  }

  //删除配置行
  deletes(index: number) {
    this.configureList.splice(index, 1);
    this.duplicateRemoval();
  }

  //常量、变量切换
  isConstChange(index: number) {
    if (this.configureList[index].isConst === 'true') {
      this.configureList[index].targetDataItemId = [];
      this.configureList[index].targetDataItem = '';
      this.configureList[index].currentDataItemId = [];
      this.configureList[index].currentDataItem = '';
    } else {
      this.configureList[index].currentDataInput = '';
    }
    this.duplicateRemoval();
  }

  created() {
    this.getBizproperty();
    this.hgt = (document as any).documentElement.clientHeight - 280;
    // 编辑状态时赋值
    if (this.editDataValue) {
      this.CodeNameOpen = true;
      if (typeof this.editDataValue.actionConfig === 'string') {
        this.editDataValue.actionConfig = JSON.parse(
          this.editDataValue.actionConfig,
        );
      }
      this.btnName = this.editDataValue.name;
      this.CodeName = this.editDataValue.code;
      this.Tips = this.editDataValue.hint;
      this.describe = this.editDataValue.description;
      this.useLocation = this.editDataValue.useLocation;
      this.operationType = this.editDataValue.operateType;
      this.editDataValue.operateType === 'WITH_VIEW'
        ? (this.viewType = this.editDataValue.bindAction)
        : (this.callType = this.editDataValue.bindAction);
      this.BizpropertyListDataId = this.editDataValue.showPermCode;
      this.businessRulesDataId = this.editDataValue.targetCode;
      if (this.editDataValue.actionConfig) {
        this.schemaCodeVal = this.editDataValue.actionConfig.schemaCodeVal;
        this.schemaCodeValId = this.editDataValue.actionConfig.schemaCodeVal
          ? this.editDataValue.actionConfig.schemaCodeVal.key
          : '';
        this.viewXListData = this.editDataValue.actionConfig.viewXListData;
        this.scriptData = this.editDataValue.actionConfig.scriptData;
        this.viewXListData1 =
          this.editDataValue.actionConfig.viewXListData &&
          this.editDataValue.actionConfig.viewXListData[0]
            ? this.editDataValue.actionConfig.viewXListData[0].code
            : [];
        this.formListData = this.editDataValue.actionConfig.formListData;
        this.formListData1 =
          this.editDataValue.actionConfig.formListData &&
          this.editDataValue.actionConfig.formListData[0]
            ? this.editDataValue.actionConfig.formListData[0].code
            : [];
        this.WorkflowListData =
          this.editDataValue.actionConfig.WorkflowListData;
        this.WorkflowListDataId = this.editDataValue.actionConfig
          .WorkflowListData
          ? this.editDataValue.actionConfig.WorkflowListData[0].workflowCode
          : [];
        if (this.editDataValue.actionConfig.configureList) {
          this.configureList = this.editDataValue.actionConfig.configureList;
        }
      }
      if (this.schemaCodeValId) {
        if (
          this.editDataValue.bindAction === 'ADD_DATA' ||
          this.editDataValue.bindAction === 'FLOW' ||
          this.editDataValue.bindAction === 'FORM' ||
          this.editDataValue.bindAction === 'LIST'
        ) {
          this.editDataCheck('MOD');
        }
        this.schemaCodeInfo(this.schemaCodeValId);
      }
    }
  }

  inputblurCode() {
    const systemCode = [
      'add',
      'delete',
      'import',
      'export',
      'qr_code',
      'editowner',
      'batch_print',
      'batch_update',
    ];
    systemCode.forEach((x) => {
      if (this.CodeName === x) {
        this.$message.error('按钮编码与系统编码重复');
        this.CodeName = '';
      }
    });
  }

  handleChange(value: string) {
    console.log(this.BizpropertyListData);
  }

  onClosest() {
    this.$emit('onClosest');
  }
}
</script>
<style lang="less" scoped>
.cb-modal {
  width: 100%;
  height: 100%;
  padding-bottom: 72px;
}
.cb-modal-title {
  font-size: 14px;
  font-weight: 600;
  color: #111218;
  margin-bottom: 20px;
}
.cb-modal-Div {
  width: 770px;
  margin: 0 auto;
  padding-left: 43px;
}
.cb-modal-infoRows {
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
  /deep/.ant-input:focus {
    border: 1px solid #2970ff;
    //box-shadow: 0 0 0 2px #d4d5d641;
  }
}
.cb-modal-label {
  min-width: 112px;
  //margin-right: 55px;
  font-size: 14px;
  color: #111218;
  line-height: 14px;
  padding-top: 9px;
  .cb-modal-labelText {
    position: relative;
  }
  .cb-modal-labelText::after {
    content: '*';
    color: #f0353f;
    position: absolute;
    top: 3px;
    left: -8px;
  }
}
.cb-modal-labelM {
  padding-top: 5px;
}
.cb-modal-input {
  width: 360px;
  height: 32px;
  border-radius: 2px;
  border: 1px solid #d4d5d6;
  font-size: 14px;
}
.cb-modal-textarea {
  width: 580px;
  height: 70px;
  background: #ffffff;
  border-radius: 2px;
  border: 1px solid #d4d5d6;
}
.cb-modal-btn {
  width: 100%;
  height: 72px;
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.cb-modal-scroll {
  width: 100%;
  height: calc(100% - 30px);
  overflow-y: auto;
}
.cb-modal-configure {
  width: 615px;
}
.RowStyle {
  width: 100%;
  font-size: 14px;
  color: #88888b;
  margin-bottom: 8px;
}
.configure_delete {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
}
.configure_delete:hover {
  color: #2970ff;
}
.configure_mage01 {
  padding-left: 14px;
}
.configure_mage02 {
  padding-left: 18px;
}
.configure_add {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #2970ff;
  cursor: pointer;
  margin-top: 5px;
  .aufontAll {
    font-size: 12px;
    margin-right: 4px;
  }
  p {
    margin-right: 48px;
  }
}
.cb-modal-yew {
  .cb-modal-yewListHeader > .col {
    font-size: 14px;
    font-weight: 600;
    background: #eeeeee;
  }
  .col {
    height: 44px;
    display: flex;
    align-items: center;
    color: #111218;
  }
  .colFirst {
    padding-left: 14px;
  }
  .cb-modal-yewList {
    border-bottom: 1px solid #d8d8d885;
  }
}
.cb-modal-Tips {
  color: #1112185b;
  margin-left: 5px;
  font-size: 13px;
}
</style>
<style lang="less">
.ant-message {
  z-index: 10100 !important;
}
.colorYc {
  color: #bfbfbf !important;
}
</style>

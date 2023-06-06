<template>
  <a-modal
    :visible="isShow"
    :title="drawerTitle"
    :keyboard="false"
    :cancelText="$t('cloudpivot.flowCenter.pc.cancel')"
    :okText="$t('cloudpivot.flowCenter.pc.ok')"
    :footer="null"
    class="delegation-workflow"
    :destroyOnClose="true"
    :width="'420px'"
    @cancel="onClose"
    @ok="submit"
  >
    <a-form-model
      ref="ruleForm"
      :model="delegationData"
      :rules="rules"
      layout="vertical"
      class="delegation-box"
    >
      <a-form-model-item
        :label="$t('cloudpivot.flowCenter.pc.delegation.client')"
        prop="client"
        :required="true"
      >
        <staff-selector
          v-model="delegationData.client"
          :options="staffSelectorOpts"
          queryDisplayType="plus"
          :params="params"
          @change="clearWorkflow"
        />
      </a-form-model-item>
      <a-form-model-item
        :label="$t('cloudpivot.flowCenter.pc.delegation.consignor')"
        prop="consignor"
        :required="true"
      >
        <staff-selector
          v-model="delegationData.consignor"
          :options="staffSelectorOpts"
          queryDisplayType="plus"
          :params="params"
          @change="clearWorkflow"
        />
      </a-form-model-item>
      <a-form-model-item
        :label="$t('cloudpivot.flowCenter.pc.delegation.delegateType')"
        prop="delegateType"
        :required="true"
      >
        <a-select
          v-model="delegationData.delegateType"
          class="select-wrap"
          @change="clearWorkflow"
        >
          <a-select-option value="0">
            {{ $t('cloudpivot.flowCenter.pc.delegation.workflowApproval') }}
          </a-select-option>
          <a-select-option value="1">
            {{ $t('cloudpivot.flowCenter.pc.delegation.startWorkflow') }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item
        :label="$t('cloudpivot.flowCenter.pc.delegation.entrustedPeriod')"
        prop="entrustedPeriod"
        :required="true"
      >
        <a-range-picker
          v-model="delegationData.entrustedPeriod"
          class="select-wrap"
          :disabledDate="disabledDate"
          :showTime="{
            hideDisabledOptions: true,
            defaultValue: [
              moment('00:00:00', 'HH:mm:ss'),
              moment('23:59:59', 'HH:mm:ss'),
            ],
          }"
          format="YYYY-MM-DD HH:mm:ss"
        />
      </a-form-model-item>
      <a-form-model-item
        :label="$t('cloudpivot.flowCenter.pc.delegation.workflowScope')"
        prop="workflowScope"
        :required="true"
      >
        <a-radio-group
          v-model="delegationData.workflowScope"
          class="radio-wrap"
        >
          <a-radio value="0">
            {{ $t('cloudpivot.flowCenter.pc.delegation.wholeProcess') }}
          </a-radio>
          <br />
          <a-radio value="1">
            {{ $t('cloudpivot.flowCenter.pc.delegation.partProcess') }}
          </a-radio>
        </a-radio-group>
        <WorkflowTree
          v-if="delegationData.workflowScope === '1'"
          v-model="delegationData.workflowTrusts"
          :multiple="true"
          :labelInValue="true"
          :userId="curUserId"
          :trustType="trustType"
          class="workflow-select"
          @input="clearWorkflow2"
          @select="dataChange"
        />
      </a-form-model-item>
      <a-form-model-item class="model-item-btn">
        <a-button style="margin-right: 8px" @click="resetForm('ruleForm')">
          {{ $t('cloudpivot.flowCenter.pc.cancel') }}
        </a-button>
        <a-button type="primary" @click="submitForm('ruleForm')">
          {{ $t('cloudpivot.flowCenter.pc.ok') }}
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {
  Drawer,
  Button,
  Row,
  Col,
  Select,
  DatePicker,
  Radio,
  Modal,
  FormModel,
} from '@h3/antd-vue';
import moment from 'moment';
import WorkflowTree from './query-condition/tree.vue';
import { workflowCenterApi } from '../../../../../api';
import StaffSelector from '../../../../../form/src/common/components/form-staff-selector/pc/staff-selector.vue';

@Component({
  name: 'DelegationDrawer',
  components: {
    ADrawer: Drawer,
    AButton: Button,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARangePicker: DatePicker.RangePicker,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    StaffSelector: StaffSelector,
    WorkflowTree,
    AModal: Modal,
    AFormModel: FormModel,
    AFormModelItem: FormModel.Item,
  },
})
export default class DelegationDrawer extends Vue {
  @Prop() value!: any;

  @Prop() type!: number; // 0：新增，1：编辑

  @Prop() drawerId!: string;

  get admin() {
    return this.$store.state.System.System.admin; // 引入系统store的字段
  }

  get userData() {
    return this.$store.state.WorkflowCenter.WorkflowCenter.userData; // 引入系统store的字段
  }

  get clientName() {
    return this.delegationData.client[0]
      ? this.delegationData.client[0].name
      : '';
  }

  get curUserId() {
    return this.delegationData.client[0]
      ? this.delegationData.client[0].id
      : ''; // 委托人ID
  }

  get trustType() {
    return this.delegationData.delegateType === '1' ? 'START' : 'APPROVAL'; // 委托人ID
  }

  // 显示控制
  isShow: boolean = false;

  drawerTitle: string = '新建委托';

  leftWidth: number = 4;

  rightWidth: number = 20;

  footer: any = [];

  delegationData: any = {
    workflowScope: '0',
    delegateType: '0',
    client: [],
    consignor: [],
    entrustedPeriod: null,
    workflowTrusts: [],
  };

  params: any = {
    corpId: '',
  };

  staffSelectorOpts: any = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  disabledDate(current) {
    return current < moment().startOf('day');
  }

  beforeMount() {
    this.setRules();
  }

  rules: any = {};

  /**
   * 自定义表单验证
   */
  setRules() {
    this.rules = {
      client: [
        {
          required: true,
          message: '请选择委托人',
        },
      ],
      consignor: [
        {
          required: true,
          message: '请选择被委托人',
        },
      ],
      entrustedPeriod: [
        {
          required: true,
          message: '请选择受托期限',
        },
      ],
    };
  }

  /**
   * 提交表单
   */

  submitForm() {
    const ruleForm: any = this.$refs['ruleForm'];
    ruleForm.validate((valid) => {
      if (valid) {
        this.submit();
      } else {
        return false;
      }
    });
  }

  resetForm() {
    // const ruleForm: any = this.$refs['ruleForm'];
    // ruleForm.resetFields();
    this.$emit('input', false);
    this.resetData();
  }

  moment() {
    moment();
  }

  mounted() {
    this.placeHolderLang();
  }

  dataChange(val) {
    this.delegationData.workflowTrusts = val;
  }

  /*
   * 提交数据
   */
  submit() {
    let flag = false;
    if (!this.delegationData.client || !this.delegationData.client[0]) {
      flag = true;
    }

    if (!this.delegationData.consignor || !this.delegationData.consignor[0]) {
      flag = true;
    }

    if (
      !this.delegationData.entrustedPeriod ||
      this.delegationData.entrustedPeriod.length < 2
    ) {
      flag = true;
    }

    if (
      this.delegationData.workflowScope === '1' &&
      (!this.delegationData.workflowTrusts ||
        !this.delegationData.workflowTrusts.length)
    ) {
      flag = true;
    }

    if (flag) {
      this.$message.warning(
        `${this.$t(
          'cloudpivot.flowCenter.pc.delegation.createDelegationTips1',
        )}`,
      );
      return;
    }
    const params: any = {
      trustor: this.delegationData.client[0].id,
      trustorName: this.delegationData.client[0].name,
      trustee: this.delegationData.consignor[0].id,
      trusteeName: this.delegationData.consignor[0].name,
      trustType: this.delegationData.delegateType,
      rangeType: this.delegationData.workflowScope,
    };
    if (
      this.delegationData.workflowScope === '1' &&
      this.delegationData.workflowTrusts
    ) {
      params.workflowTrusts = this.delegationData.workflowTrusts.map(
        (wl: any) => {
          return {
            workflowCode: wl.value.replace('workflow-', ''),
          };
        },
      );
    }
    const paramsTime = this.delegationData.entrustedPeriod;
    if (paramsTime.length) {
      params.startTime = moment(paramsTime[0]).format('YYYY-MM-DD HH:mm:ss');
      params.endTime = moment(paramsTime[1]).format('YYYY-MM-DD HH:mm:ss');
    }
    if (this.type === 1) {
      // 编辑委托
      params.id = this.delegationData.id;
      workflowCenterApi.updateWorkflowTrust(params).then((res: any) => {
        if (res.errcode) {
          this.$message.error(res.errmsg);
          return;
        }

        this.$message.success(
          `${this.$t(
            'cloudpivot.flowCenter.pc.delegation.createDelegationTips2',
          )}`,
        );
        this.$emit('reloadList');
        this.onClose();
      });
    } else {
      // 新建委托
      workflowCenterApi.createWorkflowTrust(params).then((res: any) => {
        if (res.errcode === 404001) {
          this.$message.error(
            `${this.$t(
              'cloudpivot.flowCenter.pc.delegation.createDelegationTips3',
            )}`,
          );
          return;
        }

        if (res.errcode) {
          this.$message.error(res.errmsg);
          return;
        }

        this.$message.success(
          `${this.$t(
            'cloudpivot.flowCenter.pc.delegation.createDelegationTips4',
          )}`,
        );
        this.$emit('reloadList');
        this.onClose();
      });
    }
  }

  // 抽屉关闭事件
  onClose() {
    this.resetData();
    this.$emit('input', false);
  }

  // 重置数据
  resetData() {
    this.delegationData = {
      workflowScope: '0',
      delegateType: '0',
      client: [],
      consignor: [],
      entrustedPeriod: null,
      workflowTrusts: [],
      id: '',
    };
  }

  // 清空部分流程数据
  clearWorkflow() {
    this.delegationData.workflowTrusts = [];
    this.delegationData.workflowScope = '0';
  }

  clearWorkflow2(nVal) {
    if (!nVal) {
      this.delegationData.workflowTrusts = [];
    }
  }

  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang() {
    this.staffSelectorOpts.placeholder = this.$t(
      'cloudpivot.flowCenter.pc.plzSelect',
    ) as string;
  }

  @Watch('value')
  onValueChange(v: any) {
    this.isShow = v;
    if (!v) {
      return;
    }
    this.params.corpId = this.userData.corpId;
    if (this.type === 1) {
      this.drawerTitle = this.$t(
        'cloudpivot.flowCenter.pc.delegation.editDelegation',
      ).toString();
      // 获取当前流程委托详情
      const params = { workflowTrustRuleId: this.drawerId };
      workflowCenterApi.getWorkflowTrust(params).then((res: any) => {
        if (res.errcode === 0 && res.data) {
          const workflowTrusts = res.data.workflowTrusts
            ? res.data.workflowTrusts.map((wl: any) => {
                return { value: wl.workflowCode, label: wl.workflowName };
              })
            : [];
          this.delegationData = {
            id: res.data.id,
            workflowScope: `${res.data.rangeType}`,
            delegateType: `${res.data.trustType}`,
            client: res.data.trustor
              ? [
                  {
                    name: res.data.trustorName,
                    id: res.data.trustor,
                    type: 3,
                    imgUrl: res.data.trustorImgUrl,
                  },
                ]
              : [],
            consignor: res.data.trustee
              ? [
                  {
                    name: res.data.trusteeName,
                    id: res.data.trustee,
                    type: 3,
                    imgUrl: res.data.trusteeImgUrl,
                  },
                ]
              : [],
            entrustedPeriod: [
              moment(res.data.startTime),
              moment(res.data.endTime),
            ],
            workflowTrusts,
          };
        }
      });
    } else {
      this.drawerTitle = this.$t(
        'cloudpivot.flowCenter.pc.delegation.addDelegation',
      ).toString();
      if (this.userData && this.userData.id) {
        // 默认当前用户为委托人
        this.delegationData.client = [
          {
            id: this.userData.id,
            name: this.userData.name,
            type: 3,
            imgUrl: this.userData.imgUrl,
          },
        ];
      }
    }
  }

  @Watch('$i18n.locale')
  onLanguageChange(l: string) {
    this.placeHolderLang();
  }
}
</script>

<style lang="less" scoped>
@import '../../../../../application/src/components/pc/style/custom-themes';
.delegation-box {
  .ant-form-item {
    margin-bottom: 0;
    & + .ant-form-item {
      margin-top: 16px;
    }
    &:last-child {
      margin-top: 0;
      padding: 24px 0;
    }
    /deep/.ant-form-item-required {
      &::before {
        display: none;
      }
      &::after {
        display: inline-block;
        margin-left: 2px;
        color: #f5222d;
        font-size: 14px;
        font-family: SimSun, sans-serif;
        line-height: 1;
        content: '*';
      }
    }
  }
  .ant-radio-wrapper {
    margin: 5px 0;
  }
  .ant-form-item-children {
    width: 100%;
    display: block;
    .ant-calendar-picker {
      width: 100% !important;
    }
  }
  /deep/.ant-input input {
    font-size: 14px;
  }
  /deep/ .ant-form-item {
    padding-bottom: 1px;
  }
}
.delegation-workflow {
  .ant-btn {
    height: 32px;
    line-height: 32px;
  }
  /deep/ .ant-modal-header {
    border-bottom: 0px solid transparent;
    padding: 25px 24px;
  }
  /deep/ .ant-modal-body {
    padding: 0 24px;
  }
  /deep/ .ant-modal-footer {
    padding: 0;
  }
  /deep/.ant-modal-content {
    background: #ffffff;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
  }
  /deep/.ant-modal-header {
    border-bottom: none;
    padding: 24px;
    .ant-modal-title {
      height: 24px;
      font-size: 16px;
      font-weight: 600;
      color: #111218;
      line-height: 24px;
    }
  }
  /deep/.ant-modal-close-x {
    width: 57px;
    height: 72px;
    line-height: 72px;
    svg {
      display: none;
    }
    // height: 54px;
    // width: 54px;
    line-height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      i {
        color: @highlightColor;
      }
    }
    i {
      width: 16px;
      height: 16px;
      font-family: 'aufontAll' !important;
      font-size: 16px;
      font-style: normal;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: rgba(17, 18, 24, 0.5);
      display: flex;
      align-items: center;
      &::after {
        content: '\e996';
      }
    }
  }
  /deep/.ant-modal-body {
    padding-top: 0;
    padding-bottom: 0;
  }
  /deep/ .ant-form-explain {
    font-size: 12px;
  }
  /deep/ .ant-select {
    color: #111218;
  }
}
.model-item-btn {
  display: flex;
  justify-content: flex-end;
}
</style>

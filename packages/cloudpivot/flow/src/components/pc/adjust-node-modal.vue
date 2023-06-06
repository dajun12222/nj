<template>
  <div class="adjust-node-modal">
    <div class="row">
      <label>{{ i18nData.chooseAdjustType }}</label>
      <a-radio-group v-model="value" class="ct" @change="change">
        <a-radio v-if="workflowState !== 'COMPLETED'" :value="1">
          {{ i18nData.finishWorkflow }}
        </a-radio>
        <template v-if="workflowState !== 'COMPLETED' && showOperat">
          <a-radio :value="2">
            {{ i18nData.adjustOriginator }}
          </a-radio>
          <a-radio :value="3">
            {{ i18nData.cancelAllTask }}
          </a-radio>
        </template>
        <a-radio :value="4">
          {{ i18nData.activateNodes }}
        </a-radio>
      </a-radio-group>
    </div>
    <div v-if="value === 3" class="row">
      <div class="ct">
        <span class="tip">
          <i class="icon aufontAll h-icon-all-info-circle-fill"></i>
          {{ i18nData.adjustNodeTips }}
        </span>
      </div>
    </div>
    <div v-show="selectShow" class="row">
      <label>{{ i18nData.chooseNode }}</label>
      <div class="ct">
        <a-select
          v-model="selectValue"
          :placeholder="i18nData.clickChoose"
          :notFoundContent="i18nData.null"
          style="width: 100%"
          :options="selectOptions"
          @change="handleChange"
        />
      </div>
    </div>
    <div v-if="value === 2" class="row">
      <label>{{ i18nData.chooseHandler }}</label>
      <div class="ct">
        <staff-selector
          v-model="userValue"
          :options="taffSelectorOpts"
          displayType="plus"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Radio, Select } from '@h3/antd-vue';
import { workflowApi } from '../../../../api';
import StaffSelector from '../../../../form/src/common/components/form-staff-selector/pc/staff-selector.vue';

@Component({
  name: 'adjust-node-modal',
  components: {
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ASelect: Select,
    StaffSelector,
  },
})
export default class FlowTrackAdjustNodeModal extends Vue {
  @Prop() workflowInstanceId!: string;

  @Prop() i18nData!: any;

  @Prop() workflowState?: string;

  value: number = 1;

  selectValue: any = [];

  userValue: any = [];

  selectOptions: any[] = []; // 下拉配置项

  options: any = {
    key: 'test',
    selectOrg: false,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  taffSelectorOpts: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
  };

  nodeName: string = '';

  nodes: any; // 所有节点信息

  selectShow: Boolean = false;

  showOperat: boolean = true;

  async created() {
    console.log(this.i18nData);
    const res: any = await workflowApi.getWorkflowNodes({
      workflowInstanceId: this.workflowInstanceId,
    });
    const status = res.data.filter((i: { status: any }) => i.status);
    if (status <= 0) {
      this.showOperat = false;
    }
    this.nodes = res.data;
  }

  /**
   * chang事件
   */
  change() {
    this.selectValue = [];
    this.userValue = [];
    this.selectShow = false;
    const tmpOptions: any[] = [];
    switch (this.value) {
      case 1:
        break;
      case 2:
      case 3:
        this.nodes.forEach((item: any) => {
          if (item.status) {
            tmpOptions.push({
              value: item.activityCode,
              label: item.activityName,
              name: item.participantors,
            });
          }
        });
        if (tmpOptions.length > 1) {
          this.selectShow = true;
          this.selectOptions = tmpOptions;
        } else if (tmpOptions.length > 0) {
          this.selectValue = tmpOptions[0].value;
          this.handleChange();
          this.selectShow = false;
        } else {
          //Else Empty block statement
        }
        break;
      case 4:
        this.selectShow = true;
        this.nodes.forEach((node: any) => {
          tmpOptions.push({
            value: node.activityCode,
            label: node.activityName,
            disabled: node.status !== 0,
          });
        });
        this.selectOptions = tmpOptions;
        break;
      default:
        break;
    }
  }

  /**
   * 处理下拉控件
   */
  handleChange() {
    this.userValue = [];
    this.nodes.find((node: any) => {
      if (node.activityCode === this.selectValue) {
        node.participantors &&
          node.participantors.forEach((p: any) => (p.type = 3));
        this.nodeName = node.participantors;
        this.userValue = node.participantors;
      }
      return node.activityCode === this.selectValue;
    });
    console.log(this.userValue);
  }
}
</script>
<style lang="less">
// @import "../../../../styles/themes/default.less";
@import './../../../../common/common';
.adjust-node-modal {
  height: 270px;
  .row {
    margin-bottom: @base10-padding-md;
    > label {
      display: inline-block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #111218;
      line-height: 22px;
    }
    .ct {
      width: 100%;
      .tip {
        position: relative;
        display: inline-block;
        padding: 5px 38px;
        background: #fffbe6;
        border-radius: 4px;
        border: 1px solid #ffe58f;
        color: #111218;
        line-height: 22px;
        .h-icon-all-info-circle-fill {
          color: #faad14;
          position: absolute;
          left: 16px;
        }
      }
      .h3-organization__label {
        max-height: 92px;
        overflow-y: auto;
        overflow-x: hidden;
      }
      .ant-radio-wrapper {
        width: 100%;
        color: #111218;
        line-height: 32px;
        height: 32px;
      }
      .ant-radio-wrapper:last-child {
        margin: 0;
      }
    }
  }
}
</style>

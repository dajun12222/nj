<template>
  <div class="form-reject">
    <div class="field reject-tips">
      <a-icon type="exclamation-circle" theme="filled" />
      {{ $t('cloudpivot.form.runtime.modal.canNotReject') }}
    </div>
    <div class="field">
      <a-row>
        <a-col :span="24">
          {{ $t('cloudpivot.form.runtime.modal.reject') }}
          <i style="color: #f0353f">*</i>
        </a-col>
        <a-col :span="24" class="node-content">
          <template v-for="options in optionsCheckBox">
            <a-radio
              :key="options.value"
              :checked="options.checked"
              class="reject-checkbox"
              @change="(val) => checkBoxChange(options, val)"
            >
              {{ options.label }}
            </a-radio>
          </template>
          <template v-for="(subWorkflowNode, index) in subworkflowCheckBox">
            <div :key="index" class="sub-node">
              <a-checkbox
                :checked="subWorkflowNode.checked"
                :indeterminate="subWorkflowNode.indeterminate"
                class="reject-checkbox"
                @change="(val) => checkBoxChange(subWorkflowNode, val)"
              >
                <span>驳回上一步并行节点</span>
              </a-checkbox>

              <a-popover
                placement="bottomLeft"
                trigger="click"
                :visible="subWorkflowNode.popoverVisible"
                overlayClassName="sub-node-content"
              >
                <template slot="content">
                  <div v-for="sub in subWorkflowNode.list" :key="sub.value">
                    <a-checkbox
                      :checked="sub.checked"
                      class="reject-checkbox"
                      @change="(val) => checkBoxChange(sub, val)"
                    >
                      <span>{{ sub.label }}</span>
                    </a-checkbox>
                  </div>
                </template>
                <span
                  class="toggle"
                  @click="
                    subWorkflowNode.popoverVisible =
                      !subWorkflowNode.popoverVisible
                  "
                  >{{ subWorkflowNode.popoverVisible ? '收起' : '展开' }}</span>
              </a-popover>
            </div>
          </template>
        </a-col>
      </a-row>
      <div v-if="errorVisible" class="error">请至少选择一项</div>
    </div>

    <div v-if="!isEl" class="field field__footer">
      <a-checkbox
        :disabled="chooseSubWorkflow && !chooseOtherNode"
        @change="onChange"
      >
        {{
          chooseSubWorkflow
            ? $t('cloudpivot.form.runtime.modal.reSubmitTipSub')
            : $t('cloudpivot.form.runtime.modal.reSubmitTip')
        }}
      </a-checkbox>
    </div>
  </div>
</template>

<script lang="ts">
import { workflow, workflowApi } from '../../../../../api';
import { Checkbox, Col, Icon, Popover, Radio, Row } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  FormActionComponent,
  FormActionModalOptions,
} from '../../form-action-modal';

@Component({
  name: 'form-reject',
  components: {
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    AIcon: Icon,
    ARow: Row,
    ACol: Col,
    APopover: Popover,
  },
})
export default class FormReject extends Vue implements FormActionComponent {
  code = '';

  back = false;

  activities: workflow.RejectActivity[] = [];

  optionsCheckBox: any[] = [];

  subworkflowCheckBox: any[] = [];

  checkBoxVal: string[] = [];

  errorVisible: boolean = false;

  curLevel: any = -2;

  @Prop()
  options!: FormActionModalOptions;

  get isEl(): any {
    return this.options && this.options.createrName === '外部用户';
  }

  @Watch('options', {
    immediate: true,
  })
  setOptions(opts: FormActionModalOptions) {
    console.log('options', opts);
    if (!opts) {
      return false;
    }

    const formObject = opts.data;

    if (formObject.workflowInstanceId) {
      const closeLoader = (this.$message as any).loading();

      workflowApi
        .getRejectActivities({
          workflowInstanceId: formObject.workflowInstanceId,
          activityCode: formObject.activityCode,
        })
        .then(
          (res) => {
            closeLoader();

            if (res.errcode !== 0) {
              this.$message.error(res.errmsg as string);
              return;
            }

            if (res.data && res.data.length > 0) {
              this.divideRejectNode(res.data);
            } else {
              this.$message.error(
                this.$t('cloudpivot.form.runtime.modal.noRejectNode') as string,
              );
            }
          },
          () => closeLoader(),
        );
    }
  }

  onChange(evt: any) {
    this.back = evt.target.checked;
  }

  checkBoxChange(opt: any, value: any) {
    const thecheck = value.target.checked;
    opt.checked = thecheck;
    if (opt.list && opt.list.length > 0) {
      opt.list.forEach((item) => {
        item.checked = thecheck;
      });
    }
    if (this.valid()) {
      this.optionsCheckBox.forEach((option) => {
        option.checked = false;
      });
      this.subworkflowCheckBox.forEach((sub) => {
        if (sub.list && sub.list.length) {
          sub.list.forEach((el) => {
            el.checked = false;
          });
        }
      });
    }
    opt.checked = value.target.checked;
    if (opt.list && opt.list.length > 0) {
      if (thecheck) {
        opt.popoverVisible = true;
      }
      opt.list.forEach((item) => {
        item.checked = thecheck;
      });
    }
    this.refreshIndeterminate();
    this.errorVisible = false;
  }

  valid() {
    let checkedData = this.optionsCheckBox.filter((res) => res.checked);
    this.subworkflowCheckBox.forEach((item) => {
      if (item.list && item.list.length) {
        checkedData = checkedData.concat(item.list.filter((el) => el.checked));
      }
    });
    const checkType: any[] = [];
    checkedData.forEach((res) => {
      if (checkType.indexOf(res.level) === -1) {
        checkType.push(res.level);
      }
    });
    if (checkType.length > 1) {
      return true;
    } else {
      return false;
    }
  }

  submit() {
    const code = this.optionsCheckBox
      .filter((res) => res.checked)
      .map((res) => res.value)
      .concat(
        this.subworkflowCheckBox
          .filter((item) => item.list && item.list.length > 0)
          .map((item) => item.list)
          .reduce((prev, next) => prev.concat(next), [])
          .filter((item) => item.checked)
          .map((item) => item.value),
      )
      .join(',');
    if (!code) {
      this.errorVisible = true;
      return;
    }

    // if (!this.code) {
    //   return;
    // }
    return {
      rejectToActivityCode: code,
      submitToReject: this.back,
    };
  }

  /**
   * 将获取的可以驳回的节点按照层级，是否为子流程节点分组
   * 后面改了需求，只按是否为上一步进行分组，结构保存，但只会有
   * 一个数组元素
   * 最终结果保存在optionsCheckBox与subworkflowCheckBox中
   */
  divideRejectNode(rejectNodes) {
    this.optionsCheckBox = [];
    this.subworkflowCheckBox = [];

    //上一步中存在的并行节点数
    const syncNodeNum = rejectNodes.filter((item) => item.checkbox).length;
    rejectNodes.forEach((item, index) => {
      if (syncNodeNum > 1 && item.checkbox) {
        // if (item.activityType === 'SUB_INSTANCE') {
        this.addSubNode(item);
        // } else {
        //   this.optionsCheckBox.push({
        //     label: item.activityName,
        //     value: item.activityCode,
        //     level: -1,
        //     checked: false,
        //     type: item.activityType,
        //   });
        // }
      } else {
        this.optionsCheckBox.push({
          label: item.activityName,
          value: item.activityCode,
          level: index,
          checked: false,
          type: item.activityType,
        });
      }
    });
  }

  /**
   *
   */
  addSubNode(subWorkflowNode) {
    if (this.subworkflowCheckBox && !this.subworkflowCheckBox.length) {
      this.subworkflowCheckBox.push({
        popoverVisible: false,
        checked: false,
        indeterminate: false,
        level: -1,
        list: [],
      });
    }
    this.subworkflowCheckBox[0].list.push({
      label: subWorkflowNode.activityName,
      value: subWorkflowNode.activityCode,
      level: -1,
      checked: false,
      type: subWorkflowNode.activityType,
    });
  }

  refreshIndeterminate() {
    this.subworkflowCheckBox.forEach((el) => {
      const checkedNum = el.list.filter((li) => li.checked).length;
      el.indeterminate = checkedNum > 0 && checkedNum < el.list.length;
      el.checked = checkedNum === el.list.length;
    });
  }

  /**
   * 判断是否选中子流程
   */
  get chooseSubWorkflow() {
    return (
      this.optionsCheckBox.some(
        (item) => item.checked && item.type === 'SUB_INSTANCE',
      ) ||
      this.subworkflowCheckBox.some(
        (sub) =>
          sub.list &&
          sub.list.length &&
          sub.list.some((item) => item.checked && item.type === 'SUB_INSTANCE'),
      )
    );
  }

  /**
   * 判断选中了除子流程以外的节点
   */
  get chooseOtherNode() {
    return (
      this.optionsCheckBox.some(
        (item) => item.checked && item.type !== 'SUB_INSTANCE',
      ) ||
      this.subworkflowCheckBox.some(
        (sub) =>
          sub.list &&
          sub.list.length &&
          sub.list.some((item) => item.checked && item.type !== 'SUB_INSTANCE'),
      )
    );
  }
}
</script>

<style lang="less" scoped>
/deep/.ant-radio-wrapper {
  display: block;
}

.field__control__checkbox {
  /deep/.ant-checkbox-wrapper {
    display: block;
    margin-bottom: 10px;
  }
}
.form-reject {
  min-height: 280px;
  .node-content {
    display: flex;
    flex-flow: wrap;
    align-items: center;
    margin-top: 12px;
    .ant-checkbox-wrapper,
    .ant-radio-wrapper {
      display: block;
      margin-left: 0;
      margin-bottom: 4px;
      margin-top: 4px;
      margin-right: 0;
      width: 25%;
      line-height: 32px;
      color: #111218;
      /deep/.ant-checkbox + span {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: calc(100% - 19px);
        display: inline-block;
        vertical-align: bottom;
      }
      /deep/span.ant-radio + * {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: calc(100% - 19px);
        display: inline-block;
        vertical-align: bottom;
      }
    }
    .sub-node {
      width: 25%;
      white-space: nowrap;
      .ant-checkbox-wrapper {
        width: 85%;
        display: inline-block;
        /deep/.ant-checkbox + span {
          padding-right: 0;
        }
      }
      .toggle {
        color: #2970ff;
        cursor: pointer;
      }
    }
  }
  .ant-checkbox-wrapper {
    display: block;
    margin-left: 0;
    margin-bottom: 10px;
  }
  // .field {
  //   &__label{

  //   }
  //   &__control {

  //   }
  // }
  .reject-tips {
    height: 40px;
    background: #fffbe6;
    border-radius: 4px;
    border: 1px solid #ffe58f;
    color: #111218;
    padding-left: 16px;
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    i {
      color: #faad14;
      margin-right: 8px;
    }
  }
  .error {
    color: #f5222d;
    font-size: 12px;
  }
}
.reject-checkbox {
  margin-top: 10px;
}
.field__footer {
  position: absolute;
  left: 24px;
  bottom: 10px;
}

.field {
  color: #111218;
}
.ant-checkbox-wrapper {
  color: #111218;
}
</style>

<style lang="less">
.sub-node-content {
  width: 272px;
  .ant-popover-inner-content {
    padding: 12px 24px;
  }
}
</style>

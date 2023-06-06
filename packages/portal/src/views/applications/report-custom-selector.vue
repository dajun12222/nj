<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="report-custom-selector-wrap">
    <a-radio-group
      v-model="current"
      class="custom-radio"
      @change="currentChange"
    >
      <a-radio v-if="componentType === 1 || componentType === 3" :value="1">
        {{ $t('languages.common.Applications.Oneself') }}
      </a-radio>
      <a-radio v-if="componentType === 2 || componentType === 3" :value="2">
        {{ $t('languages.common.Applications.ThisDepartment') }}
      </a-radio>
      <a-radio :value="3">
        {{ $t('languages.common.Applications.Custom') }}
      </a-radio>
    </a-radio-group>

    <template v-if="current === 3">
      <div class="customer-pannel">
        <staff-select
          :value="selectValue"
          :options="selectOpts"
          :params="{ sourceType: 'portal' }"
          @change="onChange"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { DataItemType } from 'cloudpivot/form/schema';
import rendererComponents from 'cloudpivot/form/src/renderer/components/pc';
import { Radio } from '@h3/antd-vue';
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
enum DataType {
  Staff = 1, // 人员
  Department = 2, // 部门
  Mix = 3, // 混合
}

const UserModule = namespace('System/System');

@Component({
  name: 'ReportCustomSelector',
  components: {
    // ReportStaffSelect: ReportStaffSelect,
    StaffSelect: rendererComponents.StaffSelector,
    ARadioGroup: Radio.Group,
    ARadio: Radio,
  },
})
export default class ReportCustomSelector extends Vue {
  @UserModule.State('loginedUserInfo') userInfo!: any;

  @Prop({
    default: '',
  })
  formula!: string;

  @Prop({})
  field!: any;

  @Model('input', {
    default: () => [],
  })
  value!: any;

  selectValue: any[] = [];

  selectOpts = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    recursive: true,
  };

  // 控件分类
  get componentType() {
    const dataType = this.field.dataType;
    switch (dataType) {
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
        return DataType.Staff;
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return DataType.Department;
      case DataItemType.StaffDeptMix:
        return DataType.Mix;
      default:
        break;
    }
  }

  @Watch('field', {
    immediate: true,
  })
  onFieldChange(val: any) {
    console.log(val);
    const dataType = val.dataType;
    switch (dataType) {
      case DataItemType.StaffSingle:
        this.selectOpts.selectOrg = false;
        this.selectOpts.selectUser = true;
        this.selectOpts.mulpitle = false;
        break;
      case DataItemType.StaffMulti:
        this.selectOpts.selectOrg = false;
        this.selectOpts.selectUser = true;
        this.selectOpts.mulpitle = true;
        break;
      case DataItemType.DeptMulti:
        this.selectOpts.selectOrg = true;
        this.selectOpts.selectUser = false;
        this.selectOpts.mulpitle = true;
        break;
      case DataItemType.DeptSingle:
        this.selectOpts.selectOrg = true;
        this.selectOpts.selectUser = false;
        this.selectOpts.mulpitle = false;
        break;
      case DataItemType.StaffDeptMix:
        this.selectOpts.selectOrg = true;
        this.selectOpts.selectUser = true;
        this.selectOpts.mulpitle = true;
        break;
      default:
        break;
    }
    this.initViews();
  }

  current: number = 3;

  @Watch('formula', {
    immediate: true,
  })
  onFormulaChange(formula: string) {
    this.current = 3;
  }

  @Watch('value', {
    immediate: true,
  })
  onValueChange() {
    if (Array.isArray(this.value)) {
      this.selectValue = this.value.map((x) => ({
        name: x.label,
        id: x.value,
      }));
    } else {
      this.selectValue = [];
    }
  }

  onChange(values: any[]) {
    const vals = values.map((x) => ({
      label: x.name,
      value: x.id,
    }));
    this.$emit('input', vals);
  }

  currentChange(e: any) {
    const val = e.target.value;
    let result: any = {};
    switch (val) {
      case 1:
        result = {
          label: this.userInfo.name,
          value: this.userInfo.id,
        };
        this.$emit('input', result);
        break;
      case 2:
        result = {
          label: this.userInfo.departmentName,
          value: this.userInfo.departmentId,
        };
        this.$emit('input', result);
        break;
      case 3:
        // 切换自定义清除value
        this.$emit('input', '');
        break;
      default:
        break;
    }
  }

  initViews() {
    // 回显本人本部门自定义
    let result: number = 3;
    if (this.value && this.value.length === 1) {
      this.value.forEach((item: any) => {
        if (
          item.label === this.userInfo.name &&
          item.value === this.userInfo.id
        ) {
          result = 1;
        }
        if (
          item.label === this.userInfo.departmentName &&
          item.value === this.userInfo.departmentId
        ) {
          result = 2;
        }
      });
    }
    this.current = result;
  }
}
</script>

<style lang="less" scoped>
.report-custom-selector-wrap {
  .custom-radio {
    background: #f0f8fe;
    padding: 3px 5px;
    border-radius: 3px;
    color: rgba(0, 0, 0, 0.65);
  }
  .customer-pannel {
    margin-top: 10px;
  }
}
</style>

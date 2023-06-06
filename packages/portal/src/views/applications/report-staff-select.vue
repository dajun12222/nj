<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->

<template>
  <staff-select :value="selectValue" :options="selectOpts" @change="onChange" />
</template>

<script lang="ts">
import { renderer } from 'cloudpivot/form/pc';
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'report-staff-select',
  components: {
    StaffSelect: renderer.StaffSelector,
  },
})
export default class ReportStaffSelect extends Vue {
  @Model('input', {
    default: () => [],
  })
  value!: any;

  @Prop({
    default: '',
  })
  formula!: string;

  selectValue: any[] = [];

  selectOpts = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    recursive: true,
  };

  @Watch('formula', {
    immediate: true,
  })
  onFormulaChange(formula: string) {
    let mulpitle = true;
    switch (formula) {
      case 'Equal':
      case 'NotEqual':
        mulpitle = false;
        break;
      default:
        mulpitle = true;
        break;
    }
    this.selectOpts = Object.assign({}, this.selectOpts, {
      mulpitle,
    });
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

  mounted() {
    // @ts-ignore
    // window.alert(window.config.portalHost)
  }
}
</script>

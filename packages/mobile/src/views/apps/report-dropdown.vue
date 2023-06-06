<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <!-- <div>
    <a-select
      v-model="currentValue"
      showSearch
      @change="onChange"
      style="width: 100%"
      placeholder="请选择"
      :mode="mode"
      optionFilterProp="children"
      :filter-option="filterOption"
    >
      <template v-for="opt in options">
        <a-select-option v-if="(typeof opt !== 'object')" :key="opt">
          <span :title="opt" class="select-drop-item">{{ opt }}</span>
        </a-select-option>
        <a-select-option v-else-if="(typeof opt === 'object')" :key="opt.name">
          <span :title="opt" class="select-drop-item">{{ opt.name }}</span>
        </a-select-option>
      </template>
    </a-select>
  </div> -->
  <div>
    <h3-checkbox-list
      v-if="isMultiple"
      showMode="0"
      showHeaderSearch
      :options="options"
      class="report-dropdown"
      :value="currentValue"
      :cancelText="$t('cloudpivot.form.renderer.cancel')"
      :okText="$t('cloudpivot.form.renderer.ok')"
      :clearText="$t('cloudpivot.form.renderer.clear')"
      :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
      :checkAllText="$t('cloudpivot.form.renderer.checkAll')"
      @onChange="onChange"
    />
    <h3-radio-list
      v-else
      showHeaderSearch
      showMode="0"
      :options="options"
      class="report-dropdown"
      :value="currentValue"
      :cancelText="$t('cloudpivot.form.renderer.cancel')"
      :okText="$t('cloudpivot.form.renderer.ok')"
      :clearText="$t('cloudpivot.form.renderer.clear')"
      :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
      @onChange="onChange"
    />
  </div>
</template>

<script lang="ts">
import { DataItemType } from 'cloudpivot/form/schema';
import { Select, Tooltip } from '@h3/antd-vue';
import axios from 'axios';
import { H3CheckboxList, H3RadioList } from 'h3-mobile-vue';
import { Component, Model, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'report-dropdown',
  components: {
    ATooltip: Tooltip,
    ASelect: Select,
    ASelectOption: Select.Option,
    H3CheckboxList,
    H3RadioList,
  },
})
export default class ReportDropdown extends Vue {
  @Prop({
    default() {
      return [];
    },
  })
  value!: any[];

  @Model('change')
  @Prop({
    default: () => ({}),
  })
  field!: any;

  @Prop({
    default: '',
  })
  formula!: string;

  get mode() {
    if (this.isMultiple) {
      return 'multiple';
    }
    return 'default';
  }

  get isMultiple() {
    console.log(this.field);
    return (
      ['In', 'NotIn'].includes(this.formula) ||
      this.field.dataType === DataItemType.Checkbox ||
      this.field.dataType === DataItemType.DropdownMulti
    );
  }

  get currentValue() {
    return this.isMultiple ? this.value : this.value.join(';');
  }

  set currentValue(value) {
    console.log(value);
    this.$emit('input', value);
  }

  created() {
    this.init();
  }

  async init() {
    const vm: any = this;
    const params = {
      schemaCode: this.field.parentSchemaCode || this.field.schemaCode,
    };
    axios.get('/api/app/bizproperty/list', { params }).then((res) => {
      const data = res.data;
      if (Array.isArray(data)) {
        let item = data.filter((i: any) => {
          return i.code === (vm.field.mainField || vm.field.field);
        });
        if (vm.field.mainField) {
          const subData = item[0].subSchema && item[0].subSchema.properties;
          item = subData.filter((i: any) => {
            return i.code === vm.field.field;
          });
        }
        const options = JSON.parse(item[0].options);
        if (!/^(\{).*(\})$/.test(options.options)) {
          vm.options = options.options.split(';');
        } else {
          vm.options = JSON.parse(options.options).useDictionariesData.map(
            (i: any) => {
              return i.name;
            },
          );
          console.log(vm.options);
        }
        console.log('options', vm.options);
      } else {
        return;
      }
    });
  }

  options: any[] = [];

  onChange(val: any) {
    console.log(val);
    const value = this.isMultiple ? val : val.value;
    console.log('onChange', value);
    this.$emit('input', value);
  }

  filterOption(input: any, option: any) {
    return (
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }
}
</script>

<style lang="less" scoped>
/deep/.report-dropdown {
  padding: 5px;
  .h3-field-layout-h-label {
    display: none;
  }
  .h3-field-placeholder {
    margin: 0;
  }
}
</style>

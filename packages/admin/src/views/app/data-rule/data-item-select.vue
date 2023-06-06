<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-item-selected">
    <a-select
      v-model="value"
      class="data-select"
      :mode="mode"
      :defaultValue="defaultValue"
      :disabled="disabled"
      placeholder="请选择"
      :class="!value ? 'show-placeholder' : ''"
      :showSearch="true"
      optionFilterProp="children"
      :getPopupContainer="getPopupContainer"
      @change="change"
    >
      <a-select-opt-group label="业务数据项">
        <template v-for="(item, index) in list">
          <a-select-option
            v-if="!item.defaultProperty && dataItemIsShow(item, false)"
            :key="index"
            :value="item.code"
            :propertyType="item.propertyType"
            :relativeCode="item.relativeCode"
            :index="item.code"
            modelType="target"
            data-type="filter"
            :disabled="item.disabled || (onlyPublished && !item.published)"
            :title="item.name.concat('[').concat(item.code).concat(']')"
          >
            {{ `${item.name}[${item.code}]` }}
          </a-select-option>
        </template>
      </a-select-opt-group>
      <a-select-opt-group v-if="!fliterSystem" label="系统数据项">
        <template v-for="(item, index) in list">
          <a-select-option
            v-if="item.defaultProperty && dataItemIsShow(item, true)"
            :key="index"
            :value="item.code"
            :propertyType="item.propertyType"
            :relativeCode="item.relativeCode"
            :index="item.code"
            modelType="target"
            data-type="filter"
            :disabled="item.disabled || (onlyPublished && !item.published)"
            :title="item.name.concat('[').concat(item.code).concat(']')"
          >
            {{ `${item.name}[${item.code}]` }}
          </a-select-option>
        </template>
      </a-select-opt-group>
    </a-select>
  </div>
</template>

<script lang="ts">
import { Select } from '@h3/antd-vue';
import { Component, Vue, Prop, Watch, Model } from 'vue-property-decorator';

@Component({
  name: 'data-item-selected',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
  },
})
export default class DataItemSelect extends Vue {
  @Prop({
    default: () => [],
  })
  list!: Array<any>;

  @Prop({
    default: false,
  })
  disabled!: boolean;

  @Prop({
    default: false,
  })
  onlyPublished!: boolean;

  @Prop({
    default: () => {},
  })
  systemFilterCtl!: any;

  @Prop({
    default: () => {},
  })
  bizFilterCtl!: any;

  @Prop({
    default: false,
  })
  fliterSystem!: boolean;

  @Prop({
    default: 'default',
  })
  mode!: string;

  @Prop({
    default: () => [],
  })
  defaultValue!: [];

  @Watch('defaultValue', { immediate: true })
  updateValue(val) {
    this.value = val;
  }

  @Prop()
  getPopupContainer!: Function;

  @Model('change')
  val!: string;

  sysTemCtl: any = {
    publish: true,
    type: [],
    code: [],
  };

  bizCtl: any = {
    publish: true,
    type: [],
    code: [],
  };

  value: string | Array<string> = '';

  filter = {};

  mounted() {
    this.value = this.defaultValue.length > 0 ? this.defaultValue : this.value;
  }

  change(val: any, vNode: any) {
    this.$emit('change', val, vNode);
  }

  dataItemIsShow(item: any, isSystem: boolean) {
    const filterObj = isSystem ? this.sysTemCtl : this.bizCtl;

    const filterType = filterObj.type;

    const filterCode = filterObj.code;

    return (
      !filterType.includes(item.propertyType) && !filterCode.includes(item.code)
    );
  }

  @Watch('val', {
    immediate: true,
  })
  onValChange(val: any) {
    this.value = val;
  }

  @Watch('systemFilterCtl', {
    immediate: true,
  })
  onSystemFilterCtlChange(val: any) {
    this.sysTemCtl = Object.assign(this.sysTemCtl, val);
  }

  @Watch('bizFilterCtl', {
    immediate: true,
  })
  onBizFilterCtlChange(val: any) {
    this.bizCtl = Object.assign(this.bizCtl, val);
  }
}
</script>

<style lang="less">
.data-select {
  width: 240px;
}
</style>

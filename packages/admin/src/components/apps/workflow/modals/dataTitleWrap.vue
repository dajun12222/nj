<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <data-title
    class="data-title-textarea event-handle"
    :list="list"
    :value="defaultValue"
    :label="label"
    layoutType="transverse"
    @change="change"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import dataTitle from '@/views/app/biz-rule/property-desgner-extend/data-title.vue';
import { Dropdown, Menu } from '@h3/antd-vue';

@Component({
  name: 'dataTitleWrap',
  components: {
    dataTitle,
    ADropDown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
  },
})
export default class dataTitleWrap extends Vue {
  @Prop({
    default: () => [],
  })
  list!: any[];

  @Prop({
    default: () => [],
  })
  value!: string[];

  @Prop({
    default: '',
  })
  label?: string;

  defaultValue: any[] = [];

  change(val: any[]) {
    const values: any[] = val.map((el) => el.code);
    this.$emit('change', values);
  }

  created() {
    console.log('this.value==>', this.value);
    this.value.forEach((code) => {
      const item = this.list.find((item: any) => item.code === code);
      this.defaultValue.push({
        isDataItem: item ? 1 : 0,
        code: item ? item.code : code,
        name: item ? item.name : undefined,
      });
    });
  }
}
</script>

<style lang="less" scoped></style>

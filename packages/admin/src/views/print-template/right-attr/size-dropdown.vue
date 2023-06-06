<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-dropdown :trigger="['click']">
    <a-menu
      slot="overlay"
      style="max-height: 250px; overflow: auto"
      @click="onSelect"
    >
      <a-menu-item v-for="size in sizes" :key="size">
        {{ size }}
      </a-menu-item>
    </a-menu>

    <a-button class="dropdown-botton" size="small">
      <span class="icon-left">
        {{ value }}
      </span>

      <span class="icon-right">
        <i class="anticon anticon-down"></i>
      </span>
    </a-button>
  </a-dropdown>
</template>

<script lang="ts">
import { Dropdown, Menu, Button } from '@h3/antd-vue';
import { Component, Vue, Prop, Model } from 'vue-property-decorator';

const sizes = new Array(51).fill(0).map((_, i) => 9 + i);

@Component({
  name: 'size-dropdown',
  components: {
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AButton: Button,
  },
})
export default class SizeDropdown extends Vue {
  @Model('change', {
    default: 1,
  })
  value!: number;

  @Prop({
    default: () => sizes.slice(),
  })
  sizes!: number[];

  getText(size: number) {
    if (size === 0) {
      return '无边框';
    }
    return '';
  }

  onSelect(evt: any) {
    this.$emit('change', evt.key);
  }
}
</script>

<style lang="less" scoped>
/deep/.ant-dropdown-menu {
  max-height: 250px;
  overflow: auto;
}

/deep/.ant-dropdown-menu-item {
  padding-top: 0;
  padding-bottom: 0;
}
</style>

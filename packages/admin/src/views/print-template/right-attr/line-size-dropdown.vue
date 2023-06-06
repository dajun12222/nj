<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-dropdown :trigger="['click']">
    <a-menu slot="overlay" @click="onSelect">
      <a-menu-item v-for="size in sizes" :key="size">
        <div class="line" :style="`height:${size}px`">
          {{ getText(size) }}
        </div>
      </a-menu-item>
    </a-menu>

    <a-button class="dropdown-botton" size="small">
      <span class="icon-left">
        <i class="icon aufont icon-base-onerow-twocolumn-o1"></i>
      </span>

      <span class="icon-right">
        <i class="anticon anticon-down"></i>
      </span>
    </a-button>
  </a-dropdown>
</template>

<script lang="ts">
import { Button, Dropdown, Menu } from '@h3/antd-vue';
import { Component, Vue, Prop, Model } from 'vue-property-decorator';

@Component({
  name: 'line-size-dropdown',
  components: {
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AButton: Button,
  },
})
export default class LineSizeDropdown extends Vue {
  @Model('change', {
    default: 1,
  })
  value!: number;

  @Prop({
    default: () => [0, 1, 2, 3, 4, 5],
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
/deep/.ant-dropdown-menu-item {
  padding-top: 0;
  padding-bottom: 0;
}

.line {
  width: 100%;
  height: 1px;
  background: @text-color-secondary;
  display: inline-block;
}
</style>

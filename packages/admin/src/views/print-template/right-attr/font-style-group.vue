<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-button-group size="small">
    <a-button :class="{ active: bold }" @click="onClick('bold')">
      <i class="icon aufontAll h-icon-all-thickening"></i>
    </a-button>
    <a-button :class="{ active: italic }" @click="onClick('italic')">
      <i class="icon aufontAll h-icon-all-Italic"></i>
    </a-button>
    <a-button :class="{ active: underline }" @click="onClick('underline')">
      <i class="icon aufontAll h-icon-all-underline"></i>
    </a-button>
  </a-button-group>
</template>

<script lang="ts">
import { Button } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'font-style-group',
  components: {
    AButton: Button,
    AButtonGroup: Button.Group,
  },
})
export default class FontStyleGroup extends Vue {
  @Prop({
    default: false,
  })
  bold!: boolean;

  @Prop({
    default: false,
  })
  italic!: boolean;

  @Prop({
    default: false,
  })
  underline!: boolean;

  onClick(key: string) {
    const value = !((this as any)[key] as boolean);
    this.$emit('change', {
      key,
      value,
    });
  }
}
</script>

<style lang="less" scoped>
.icon {
  font-size: @font-size-12;
}
.ant-btn:active,
.ant-btn.active {
  color: @primary-color;
  background-color: #fff;
  border-color: @primary-color;
}
</style>

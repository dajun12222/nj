<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="property-wrap">
    <div class="property-left">
      <div class="label">
        <template v-if="showTip">
          <a-tooltip v-if="label" placement="top">
            <span slot="title">{{ label }}</span>
            <span v-if="title" class="text" :title="title">{{ label }}</span>
            <span v-else class="text">{{ label }}</span>
          </a-tooltip>
        </template>
        <template v-else>
          <span v-if="title" class="text" :title="title">{{ label }}</span>
          <span v-else class="text">{{ label }}</span>
        </template>
        <!-- <slot name="tip" class="icon"></slot> -->
        <a-tooltip v-if="tip" placement="top">
          <span slot="title">{{ tip }}</span>

          <i class="icon aufontAll h-icon-all-question-circle"></i>
        </a-tooltip>
      </div>
      <div>
        <slot name="title-right"></slot>
      </div>
    </div>

    <div class="property-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Tooltip } from '@h3/antd-vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component({
  name: 'PropertyWidget',
  components: {
    ATooltip: Tooltip,
  },
})
export default class PropertyWidget extends Vue {
  @Prop() label!: any;

  @Prop() tip!: any;

  @Prop() title!: any;

  @Prop() showTip!: any;
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';

.property-wrap {
  display: flex;
  width: 100%;
  flex-direction: column;
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }
}
.property-left {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  .text {
    display: inline-block;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: @nav-font-color;
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
    margin-right: 6px;
  }
  .icon {
    display: inline-block;
    vertical-align: middle;
    flex: none;
    cursor: pointer;
    font-size: 13px;
    color: @nav-font-color;
  }
  i.icon {
    color: @s-light-font-color;
  }
  .h-icon-all-setting1.icon {
    position: relative;
    transform: rotate(19deg);
  }
}
.property-right {
  flex-shrink: 1;
  display: inline-flex;
  padding: 0;
  // min-height: 30px;
  color: @nav-font-color;
}
</style>

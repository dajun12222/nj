<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-01-04 18:06:33
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-02 15:18:45
 * @FilePath: \yunshu6.0\modules\cloudpivot\flow-center\src\components\mobile\initial-instance\instances.vue
 * @Description:
-->
<template>
  <div class="instances">
    <p v-if="title" class="instances__title" @click="collapse">
      {{ title }}
      <!-- <i
        v-if="collapsable"
        class="icon aufontAll h-icon-all-down-o"
        :class="!opened && 'closed'"
      /> -->
    </p>
    <!-- <transition name="collapse"> -->
    <!-- <grid-list
        v-show="opened"
        class="collapse-item"
        colorKey="code"
        :list="list"
        :grid="col"
        @onItem="$emit('onItem',$event)"
      /> -->
    <apps-list
      :list="list"
      :grid="col"
      :recent="true"
      colorKey="code"
      @onItem="$emit('onItem', $event)"
    />
    <!-- </transition> -->
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import common from '../../../../../common/mobile';

@Component({
  name: 'instances',
  components: {
    // GridList: common.components.GridList,
    AppsList: common.components.AppsList,
  },
})
export default class Instances extends Vue {
  @Prop() title!: string;

  @Prop() collapsable?: boolean;

  @Prop({
    default: 3,
  })
  col!: number;

  @Prop() list!: Array<any>;

  opened: boolean = true;

  collapse() {
    if (!this.collapsable) {
      return;
    }
    this.opened = !this.opened;
  }
}
</script>
<style lang="less" scoped>
@import '../../../../../common/styles/mixins.less';

.instances {
  .px2rem(margin-top, @horizontal-padding-md);
  .px2rem(margin-bottom, @horizontal-padding-md);
  .px2rem(border-radius, @border-radius-lg);
  padding-top: 0;
  text-align: left;
  background: @white-background;
  &__title {
    .px2rem(padding-top, 24px);
    .px2rem(padding-left, @horizontal-padding-lg);
    .px2rem(padding-right, @horizontal-padding-lg);
    .px2rem(line-height, 40px);
    .px2rem(font-size, 28px);
    margin-bottom: 0;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    i {
      float: right;
      transition: all 0.3s;
      &.closed {
        transform: rotate(-90deg);
      }
    }
  }
}
</style>

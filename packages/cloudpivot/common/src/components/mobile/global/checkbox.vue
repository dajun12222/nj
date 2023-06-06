<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-03-07 17:18:59
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-07 17:23:28
 * @FilePath: \yunshu6.0\modules\cloudpivot\common\src\components\mobile\global\checkbox.vue
 * @Description:
-->
<template>
  <span
    class="home-checkbox-item aufont icon-base-check"
    :class="{ checked: checked }"
    @click.stop="onItem"
  ></span>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'checkBoxItem',
})
export default class checkBoxItem extends Vue {
  @Prop({ default: false }) defaultChecked!: boolean;

  @Prop({ default: false }) radio?: boolean; // 是否单选模式，该模式下不可取消选定

  checked: boolean = !!this.defaultChecked;

  onItem() {
    if (this.radio && this.checked) {
      return;
    }
    this.checked = !this.checked;
    this.$emit('change', this.checked);
  }

  @Watch('defaultChecked')
  onCheckedChange(val: boolean) {
    this.checked = val;
  }
}
</script>
<style lang="less" scoped>
@import '../../../../styles/mobile/mixins.less';
.home-checkbox-item {
  display: inline-block;
  .px2rem(width, 40px);
  .px2rem(height, 40px);
  .px2rem(line-height, 40px);
  border: 1px solid #999;
  border-radius: 100%;
  text-align: center;
  color: #fff;
  font-size: 14px;
  &.checked {
    border-color: @primary-color;
    background-color: @primary-color;
  }
}
</style>

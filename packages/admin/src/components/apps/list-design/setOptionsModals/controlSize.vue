<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="size-row">
    <div class="reduce btn" @click="debounce(reduceSize)">
      <a-icon type="minus" />
    </div>
    <div class="size">{{ size }}%</div>
    <div class="increase btn" @click="debounce(increaseSize)">
      <a-icon type="plus" />
    </div>
  </div>
</template>

<script lang="ts">
import { Icon } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'ControlSize',
  components: {
    AIcon: Icon,
  },
})
export default class ControlSize extends Vue {
  @Prop() size!: any;

  reduceSize() {
    this.$emit('reduceSize');
  }

  increaseSize() {
    this.$emit('increaseSize');
  }

  debounce(method, context?) {
    clearTimeout(method.tId);
    method.tId = setTimeout(() => {
      method.call(context);
    }, 10);
  }
}
</script>

<style lang="less">
.size-row {
  position: absolute;
  right: 35px;
  top: 25px;
  display: flex;
  text-align: center;
  line-height: 32px;
  z-index: 2;
  .btn {
    width: 32px;
    height: 32px;
    background: #ffffff;
    box-shadow: 0px 4px 11px 0px rgba(201, 201, 201, 0.5);
    border-radius: 4px;
    &.reduce {
      margin-right: 8px;
    }
    &.increase {
      margin-left: 8px;
    }
  }
  .size {
    width: 70px;
    height: 32px;
    background: #ffffff;
    box-shadow: 0px 4px 11px 0px rgba(201, 201, 201, 0.5);
    border-radius: 4px;
  }
}
</style>

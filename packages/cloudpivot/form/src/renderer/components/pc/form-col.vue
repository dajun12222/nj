<template>
  <a-col
    v-show="!control.children[0] || !control.children[0].options.treeView"
    class="ant-col"
    :span="colSpan"
    :class="{
      spanFillUp: !control.children[0],
    }"
  >
    <!-- 是树形的查询条件不展示，但是需要运行后把数据送给树形视图组件 -->
    <slot></slot>
  </a-col>
</template>

<script lang="ts">
import { Col } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { LayoutCol } from '../../typings';

@Component({
  name: 'form-col',
  components: {
    ACol: Col,
  },
})
export default class FormCol extends Vue {
  @Prop()
  control!: LayoutCol;

  @Prop()
  span!: number;

  get colSpan() {
    if (typeof this.span === 'number') {
      return this.span;
    }
    return this.control.span;
  }
}
</script>

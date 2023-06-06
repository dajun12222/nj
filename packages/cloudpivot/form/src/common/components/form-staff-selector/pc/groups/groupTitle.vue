<template>
  <div class="title">
    {{ title }}
  </div>
</template>
<script lang="ts">
import {
  Avatar,
  Button,
  Checkbox,
  Icon,
  Modal,
  Radio,
  Select,
  Col,
  Row,
} from '@h3/antd-vue';
// @ts-ignore
import cloneDeep from 'lodash/cloneDeep';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'groupTitle',
  components: {},
})
export default class groupTitle extends Vue {
  @Prop({ default: '' }) title?: string;
}
</script>
<style lang="less" scoped>
.title {
  padding: 12px;
  background-color: #0076f6;
  color: #fff;
}
</style>

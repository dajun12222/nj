<template>
  <div class="screeTitle">{{ title }}</div>
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

import cloneDeep from 'lodash/cloneDeep';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'screeTitle',
  components: {},
})
export default class screeTitle extends Vue {
  @Prop({ default: '' }) title?: string;
}
</script>
<style lang="less" scoped>
.screeTitle {
  color: #fff;
  background-color: #beb8b8;
  padding: 3px 10px;
}
</style>

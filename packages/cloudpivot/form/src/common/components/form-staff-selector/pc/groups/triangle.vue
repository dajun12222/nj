<template>
  <div class="triangle">
    <div class="triangleContent">
      <i class="aufontAll icontriangle h-icon-all-right" @click="right"></i>
      <i class="aufontAll icontriangle h-icon-all-left" @click="left"></i>
      <i
        class="aufontAll icontriangle h-icon-all-double-left-o"
        @click="leftAll"
      ></i>
    </div>
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
  name: 'triangle',
  components: {},
})
export default class triangle extends Vue {
  right() {
    this.$emit('right');
  }

  left() {
    this.$emit('left');
  }

  leftAll() {
    this.$emit('leftAll');
  }
}
</script>
<style lang="less" scoped>
.triangle {
  display: flex;
  justify-content: center;
  align-content: center;
  .triangleContent {
    display: flex;
    flex-direction: column;
    justify-content: center;
    i {
      color: #0076f6;
      font-size: 20px;
      font-weight: 900;
      margin: 10px 0;
      cursor: pointer;
    }
  }
}
</style>

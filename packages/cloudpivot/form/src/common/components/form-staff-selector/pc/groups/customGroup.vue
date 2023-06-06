<template>
  <div class="customGroup">
    <a-row class="elRow elRowHeader">
      <a-col :span="24" class="elCol elColHeader">
        <a-col :span="16"> 组名称 </a-col>
        <a-col :span="8"> 创建人 </a-col>
      </a-col>
    </a-row>
    <a-row class="elRow elRowBody">
      <a-col
        v-for="(item, index) in userGroup"
        :key="item.id"
        :span="24"
        class="elCol elColBody"
        :class="{ active: isActive === index }"
        @click="setSelect(item, index)"
      >
        <a-col :span="16">
          {{ item.groupName }}
        </a-col>
        <a-col :span="8">
          {{ item.name }}
        </a-col>
      </a-col>
    </a-row>
    <a-row class="elRow elRowFooter">
      <a-col :span="24" class="elCol">
        <a @click="add">新增</a>
        <a @click="edit">编辑</a>
        <a @click="manage">管理组成员</a>
        <a @click="del">删除</a>
      </a-col>
    </a-row>
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

import cloneDeep from 'lodash/cloneDeep';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import screeTitle from './screeTitle.vue';
@Component({
  name: 'customGroup',
  components: {
    screeTitle,
    ARow: Row,
    ACol: Col,
  },
})
export default class customGroup extends Vue {
  isActive: number = -1;
  // list:any = [
  //     {
  //         id: 1,
  //         componeny: '中国能建',
  //         name: '晓'
  //     },

  // ];
  @Prop({ default: [] }) userGroup?: any;

  setSelect(item: any, index: number) {
    this.$emit('setSelect');
    if (this.isActive === index) {
      this.clean();
      return;
    }
    this.isActive = index;
  }

  clean() {
    this.isActive = -1;
  }

  add() {
    this.$emit('add');
  }

  edit() {
    this.$emit('edit');
  }

  del() {
    this.$emit('del');
  }

  manage() {
    this.$emit('manage');
  }

  getData() {
    let isActive = -1;
    let obj = {};
    if (this.isActive > -1) {
      isActive = this.isActive;
      obj = this.userGroup[this.isActive];
    }
    return {
      isActive: isActive,
      obj: obj,
    };
  }
}
</script>
<style lang="less" scoped>
.customGroup {
  display: flex;
  flex-direction: column;
  height: 100%;
  .elRow {
    width: 100%;
    .elCol {
      padding: 3px 10px;
      border-bottom: solid 1px #ccc;
      a {
        color: #333;
        padding: 1px 5px;
        display: inline-block;
        border-radius: 2px;
        border: solid 1px #ccc;
        margin-right: 6px;
      }
    }
    .elColBody:hover {
      background-color: #dadada;
    }
    .active {
      background-color: #dadada;
    }
  }
  .elColHeader {
  }
  .elRowBody {
    flex: 1;
    overflow-y: auto;
    .elCol {
      cursor: pointer;
    }
  }
  .elRowFooter {
    height: 32px;
    background-color: #e5e3e3;
  }
}
</style>

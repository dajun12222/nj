<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div ref="simpleSider" class="simple-sider">
    <div class="search-icon">
      <i class="icon left aufontAll h-icon-all-search-zj"></i>
    </div>

    <div
      v-for="item in siderList.slice(0, showCount)"
      :key="item.key"
      class="simple-item-icon"
      :class="{ active: selectCode === item.code }"
    >
      <svg
        v-if="item.type === 'Folder'"
        class="icon svg-icon"
        aria-hidden="true"
      >
        <use xlink:href="#h-icon-all-department1" />
      </svg>
      <i
        v-else
        class="icon left aufontAll"
        :class="item.icon"
        :style="{ color: getIconColor(item) }"
      ></i>
    </div>
    <div v-if="siderList.length > showCount" class="over-model">...</div>
    <div class="sider-add">
      <i class="icon left aufontAll h-icon-all-plus"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { Modal, Steps, Button } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'SimpleSider',
  components: {
    AButton: Button,
  },
})
export default class SimpleSider extends Vue {
  @Prop() siderList: Array<any>;

  @Prop() selectCode: string;

  getIconColor(item) {
    if (item.bindWorkflow) {
      return '#F12D98 ';
    }
    if (item.type === 'BizModel') {
      return '#2970FF';
    } else if (item.type === 'Page') {
      return '#13C2C2';
    } else if (item.type === 'Report') {
      return '#FFC53D';
    } else {
      //Else Empty block statement
    }
  }

  showCount: number = 10;

  getShowCount() {
    const simpleSider = this.$refs.simpleSider as HTMLDivElement;
    this.showCount = Math.floor((simpleSider.scrollHeight - 60) / 40) - 4;
  }

  mounted() {
    this.getShowCount();
  }
}
</script>

<style lang="less" scoped>
.search-icon {
  height: 42px;
  color: rgba(17, 18, 24, 0.25);
  text-align: center;
  line-height: 42px;
  i {
    font-size: 14px;
  }
}

.simple-sider {
  height: 100%;
  background-color: #f7f8fa;
  .over-model {
    text-align: center;
  }
  .sider-add {
    width: 44px;
    height: 54px;
    line-height: 54px;
    margin: 0px 5px;
    border-top: 1px solid #d8d8d8;
    text-align: center;
    position: absolute;
    bottom: 0px;
  }
}
.simple-item-icon {
  width: 56px;
  height: 40px;
  line-height: 40px;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  &.active {
    background-color: #e5efff;
  }
  &:hover {
    background-color: #e5efff;
  }
  i {
    font-size: 16px;
  }
  svg {
    width: 18px;
    height: 18px;
  }
}
</style>

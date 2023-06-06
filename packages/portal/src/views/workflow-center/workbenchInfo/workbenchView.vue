<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="content-box">
    <Header :selectedKeys="selectedKeys" />
    <router-view />
  </div>
</template>

<script lang="ts">
import Header from '@/components/shared/header/new-header.vue';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'WorkbenchView',
  components: {
    Header,
  },
})
export default class WorkbenchView extends Vue {
  selectedKeys: string = 'workbench';

  created() {
    if (this.$route.name === 'messageNotification') {
      this.selectedKeys = 'messageNotification';
    }
    this.setSelectedKeys();
  }

  @Watch('$route')
  on$routeChange() {
    if (this.$route.name === 'messageNotification') {
      this.selectedKeys = 'messageNotification';
    }
    this.setSelectedKeys();
  }

  setSelectedKeys() {
    if (this.$route.path === '/workbench-center/workbench') {
      this.selectedKeys = 'workbench';
    }
    if (this.$route.path === '/application-portal/portal') {
      this.selectedKeys = 'applicationPortal';
    }
  }
}
</script>

<style lang="less" scoped></style>

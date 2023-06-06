<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <apps-item :appCode="appCode" :signAppCode="signAppCode" />
</template>

<script lang="ts">
import * as apps from 'cloudpivot/application';
import * as platform from 'cloudpivot/platform';
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';

@Component({
  name: 'app-item',
  components: {
    AppsItem: apps.components.mobile.AppsItem,
  },
})
export default class AppItem extends Vue {
  @State('appName') appName!: any;

  appCode: string = '';

  signAppCode: string = '';

  created() {
    this.appCode = this.$route.params.appCode;
    platform.service.setTitle(this.appName || '');
  }
}
</script>

<style lang="less" scoped></style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <apps-index />
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator';

import * as apps from 'cloudpivot/application';

@Component({
  name: 'apps',
  components: {
    AppsIndex: apps.components.mobile.AppsIndex,
  },
})
export default class Apps extends Vue {
  @Provide()
  apiHost() {
    return (window as any).config.apiHost;
  }

  @Provide()
  token() {
    return window.localStorage.getItem('token');
  }
}
</script>

<style lang="less" scoped></style>

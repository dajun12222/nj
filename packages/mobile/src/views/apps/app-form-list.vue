<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <apps-list @setTitle="setApplicationTitle" />
</template>
<script lang="ts">
import '@/config/h3-form';
import list from 'cloudpivot/list/mobile';
import * as platform from 'cloudpivot/platform';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'FormList',
  components: {
    AppsList: list.components.ApplicationList,
  },
})
export default class FormList extends Vue {
  setApplicationTitle(title: string) {
    // setTitle(title);
    platform.service.setTitle(title);
  }
}
</script>

<style lang="less" scoped></style>

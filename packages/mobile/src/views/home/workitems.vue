<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <my-unfinished-workItem :appcode="appCode" @openForm="openForm" />
</template>
<script lang="ts">
import flowCenter from 'cloudpivot/flow-center/mobile';
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';

@Component({
  name: 'workitems',
  components: {
    MyUnfinishedWorkItem: flowCenter.components.MyUnFinishedWorkItem,
  },
})
export default class Workitems extends Vue {
  @State('appCode') appCode!: any;

  openForm(workitem: any) {
    this.$router
      .push({
        name: 'form-detail',
        query: {
          workitemId: workitem.id,
          workflowInstanceId: workitem.instanceId,
          return: this.$route.fullPath,
          workitemType: 'unfinishedWorkitem',
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
}
</script>
<style lang="less" scoped></style>

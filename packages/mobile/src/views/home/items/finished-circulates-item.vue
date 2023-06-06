<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <base-item
    class="work-item"
    :title="workitem.instanceName"
    :summary="workitem.activityName"
    :time="workitem.finishTime"
    :avatar="workitem.imgUrl"
    :username="workitem.originatorName"
    :avatarPlacehold="true"
    @click="goForm"
  >
    <span slot="time">已阅时间:&nbsp;&nbsp;</span>
  </base-item>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseItem from './base-item.vue';

@Component({
  name: 'WorkItem',
  components: {
    BaseItem,
  },
})
export default class WorkItem extends Vue {
  @Prop() workitem!: Index.Workitem;

  goForm() {
    this.$router
      .push({
        name: 'form-detail',
        query: {
          workitemId: this.workitem.id,
          workflowInstanceId: this.workitem.instanceId,
          return: this.$route.fullPath,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/mixins.less';
@timeout-width: 120px;
@timeout-height: 96px;
@warning-size: 30px;
.work-item {
  .item-status {
    .px2rem(margin-left, @horizontal-padding-sm);
    .px2rem(width, @timeout-width);
    .status {
      .px2rem(width, @timeout-width);
      .px2rem(height, @timeout-height);
    }
    .warning {
      .px2rem(height, @warning-size);
      .px2rem(width, @warning-size);
    }
  }
}
</style>

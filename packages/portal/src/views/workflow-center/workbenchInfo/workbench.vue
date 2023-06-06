<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="workbench-wrapper">
    <div class="workbench-wrapper-in">
      <!-- 消息通知 -->
      <!-- <Notice /> -->

      <div class="workbench-row">
        <div class="left">
          <!-- 我的待办 -->
          <unComplete @closeIframeForm="closeIframeForm" />
        </div>
        <div class="right">
          <!-- 流程统计 -->
          <statistics ref="statistics" />
        </div>
      </div>

      <div class="workbench-row">
        <div class="left">
          <!-- 收藏应用 -->
          <CollectionApp />

          <!-- 最近使用 -->
          <Shortcut @closeIframeForm="closeIframeForm" />
        </div>

        <div class="right">
          <!-- 我的草稿 -->
          <myDraft ref="myDraft" @closeIframeForm="closeIframeForm" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import CollectionApp from './workbenchComponents/collectionApp.vue';
import myDraft from './workbenchComponents/myDraft.vue';
import Notice from './workbenchComponents/notice.vue';
import Shortcut from './workbenchComponents/shortcut.vue';
import Statistics from './workbenchComponents/statistics.vue';
import unComplete from './workbenchComponents/unComplete.vue';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

@Component({
  name: 'Workbench',
  components: {
    Notice, // 通知
    unComplete, // 待办
    Statistics, // 统计
    CollectionApp,
    Shortcut,
    myDraft,
  },
})
export default class Workbench extends Vue {
  @WorkflowCenterModule.Mutation('setIsAppList') setIsAppList: any;

  created() {
    this.setIsAppList(false);
  }

  closeIframeForm(type) {
    if (['draft', 'shortcut', 'unfinish'].includes(type)) {
      // @ts-ignore
      this.$refs.statistics.getWorkflowStatistics();
      // @ts-ignore
      this.$refs.myDraft.getList();
    }
  }
}
</script>

<style lang="less" scoped>
@black: #111218;

.workbench-wrapper {
  height: 100%;
  overflow: auto;
  background: #f1f2f6;
  padding-bottom: 16px;
  .workbench-wrapper-in {
    min-width: 1000px;
    margin: 32px auto 0;
    width: 80%;
    max-width: 1600px;
  }

  color: @black;

  .workbench-row {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    .left {
      min-width: 660px;
      flex: 2;
      display: flex;
      justify-content: space-between;
      margin-right: 16px;
    }
    .right {
      min-width: 320px;
      flex: 1;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
<style lang="less">
.workbench-wrapper p {
  margin-bottom: 0;
}
</style>

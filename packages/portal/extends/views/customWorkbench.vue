<template>
  <div class="custom-workbench">
    <div class="row">
      <!-- 收藏应用 -->
      <CollectionApp />
      <!-- 流程统计 -->
      <statistics ref="statistics" />
    </div>
    <!-- 待办 -->
    <unComplete @closeIframeForm="closeIframeForm" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CollectionApp from '@/views/workflow-center/workbenchInfo/workbenchComponents/collectionApp.vue';
import myDraft from '@/views/workflow-center/workbenchInfo/workbenchComponents/myDraft.vue';
import Notice from '@/views/workflow-center/workbenchInfo/workbenchComponents/notice.vue';
import Shortcut from '@/views/workflow-center/workbenchInfo/workbenchComponents/shortcut.vue';
import Statistics from '@/views/workflow-center/workbenchInfo/workbenchComponents/statistics.vue';
import unComplete from '@/views/workflow-center/workbenchInfo/workbenchComponents/unComplete.vue';

@Component({
  name: 'customWorkbench',
  components: {
    Notice, // 通知
    unComplete, // 待办
    Statistics, // 统计
    CollectionApp, // 收藏应用
    Shortcut, // 最近使用
    myDraft, // 我的草稿
  },
})
export default class customWorkbench extends Vue {}
</script>

<style lang="less" scoped>
.row {
  display: flex;
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="workflow-empty">
    <div class="empty-box">
      <img src="../../../assets/images/workflow_empty.svg" />
      <p>赶紧新建属于你的流程吧</p>
      <a-button type="primary" @click="isShowAddWorkflowModal = true">新建流程</a-button>
    </div>

    <!-- 新建流程弹窗 -->
    <AddWorkflowModal
      v-model="isShowAddWorkflowModal"
      :data="curWorkflowData"
      :schemaCode="bizSchemaCode"
      @confirm="handleConfirmWorkflow"
      @cancel="handleCancelWorkflow"
    />
  </div>
</template>

<script lang="ts">
import AddWorkflowModal from '@/components/apps/modals/addWorkflow.vue';
import { Button } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'workflowEmpty',
  components: {
    AddWorkflowModal,
    AButton: Button,
  },
})
export default class WorkflowEmpty extends Vue {
  @WorkflowModule.Action('getWorkflowList') getWorkflowList: any;

  @WorkflowModule.State('workflowMenus') workflows: any;

  curWorkflowData: any = {};

  isShowAddWorkflowModal: boolean = false;

  get bizSchemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  handleConfirmWorkflow(workflowData: any) {
    this.isShowAddWorkflowModal = false;
    this.$router
      .push({
        name: 'workflowDesign',
        params: {
          workflowCode: workflowData.workflowCode,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  handleCancelWorkflow() {
    this.isShowAddWorkflowModal = false;
  }

  // 获取流程列表
  getWorkflows() {
    const params = {
      schemaCode: this.bizSchemaCode,
    };
    this.getWorkflowList(params);
  }
}
</script>

<style lang="less" scoped>
@import '~styles/themes/index.less';
.workflow-empty {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 136px;
  .empty-box {
    text-align: center;
    img {
      width: 204px;
    }
    p {
      font-size: 14px;
      color: rgba(17, 18, 24, 0.5);
      margin: 16px 0;
    }
  }
}
</style>

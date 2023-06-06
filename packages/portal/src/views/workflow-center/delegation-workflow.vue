<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-06 16:14:11
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:54:46
 * @FilePath: \yunshu6.0\packages\portal\src\views\workflow-center\delegation-workflow.vue
 * @Description: 
-->
<template>
  <delegation-workflow @openForm="openForm" />
</template>

<script lang="ts">
// 初始化表单组件配置
import '@/config/h3-form';
import flowCenter from 'cloudpivot/flow-center/pc';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'DelegationWorkflow',
  components: {
    delegationWorkflow: flowCenter.components.DelegationWorkflow,
  },
})
export default class DelegationWorkflow extends Vue {
  /**
   * 查看表单详情
   */
  openForm(obj: any) {
    const url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${
      obj.instanceId
    }&return=${
      location.pathname + location.search
    }&workitemType=delegationWorkflow`;
    if (this.isDingTalk) {
      this.$router
        .push({
          path: url,
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      const newWindow: any = window.open();
      newWindow.location.href = url;
    }
  }
}
</script>
<style lang="less" scoped></style>

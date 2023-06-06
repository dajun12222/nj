<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-06 16:14:11
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:53:00
 * @FilePath: \yunshu6.0\packages\portal\src\views\workflow-center\start-workflow.vue
 * @Description: 
-->
<template>
  <start-workflow />
</template>

<script lang="ts">
import flowCenter from 'cloudpivot/flow-center/pc';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'StartWorkflow',
  components: {
    startWorkflow: flowCenter.components.StartWorkflow,
  },
})
export default class StartWorkflow extends Vue {}
</script>

<style lang="less" scoped></style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <myComments />
</template>

<script lang="ts">
import flowCenter from 'cloudpivot/flow-center/pc';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'Comments',
  components: {
    myComments: flowCenter.components.myComments,
  },
})
export default class Comments extends Vue {}
</script>

<style lang="less" scoped></style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-06 16:14:11
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:56:43
 * @FilePath: \yunshu6.0\packages\mobile\src\views\single-app\index.vue
 * @Description: 
-->
<template>
  <single-app :environment="environment" />
</template>

<script lang="ts">
import '@/config/h3-form';
import * as application from 'cloudpivot/application';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'single-app-index',
  components: {
    SingleApp: application.components.mobile.SingleApp,
  },
})
export default class SingleAppIndex extends Vue {
  get environment() {
    return (window as any).Environment;
  }
}
</script>
<style lang="less" scoped></style>

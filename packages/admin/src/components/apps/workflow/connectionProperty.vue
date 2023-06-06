<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="property-container">
    <common-setting type="CONNECTION" />
    <!-- <a-collapse :bordered="false" :activeKey="['1']">
      <a-collapse-panel key="1" header="基础属性">
        <common-setting type="CONNECTION" />
      </a-collapse-panel>
    </a-collapse> -->
  </div>
</template>
<script lang="ts">
import { Collapse } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import commonSetting from './property/commonSetting.vue';

@Component({
  name: 'ConnectionProperty',
  components: {
    commonSetting,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
  },
})
export default class ConnectionProperty extends Vue {}
</script>
<style lang="less" scoped></style>

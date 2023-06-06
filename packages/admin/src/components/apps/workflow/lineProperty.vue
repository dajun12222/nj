<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="property-container">
    <a-collapse :bordered="false" :activeKey="['1']">
      <a-collapse-panel key="1" header="基础属性">
        <common-setting type="line" />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import { Collapse } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import commonSetting from './property/commonSetting.vue';

@Component({
  name: 'LineProperty',
  components: {
    commonSetting,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
  },
})
export default class LineProperty extends Vue {
  @Prop() data!: any;
}
</script>

<style lang="less" scoped>
.property-container {
  /deep/.ant-collapse .ant-collapse-item {
    text-align: left;
    background: #fff;
  }
  .ant-collapse > .ant-collapse-item-active {
    border-bottom: 0;
    margin-bottom: 16px;
    /deep/.ant-collapse-content {
      overflow: unset;
    }
  }
  .ant-collapse-content-box {
    padding: 0;
  }
}

.property-container input {
  border: 0 !important;
  outline: none !important;
  &:focus {
    box-shadow: unset !important;
  }
}
</style>

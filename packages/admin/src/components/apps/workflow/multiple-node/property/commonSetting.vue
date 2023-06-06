<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="commonsetting-panel">
    <!-- 编码 -->
    <property-widget label="节点编码">
      <div slot="right" class="right-box">
        <!-- <p class="inner-padding grey-box" :title="multiActivityCode">{{ multiActivityCode }}</p> -->

        <a-input v-model="multiActivityCode" type="text" :disabled="true" />
      </div>
    </property-widget>

    <!-- 名称 -->
    <property-widget label="节点名称">
      <div slot="right" class="right-box">
        <!-- <p class="inner-padding grey-box" :title="multiActivityName">{{ multiActivityName }}</p> -->
        <a-input v-model="multiActivityName" type="text" :disabled="true" />
      </div>
    </property-widget>
  </div>
</template>

<script lang="ts">
import { Input } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import PropertyWidget from '../../base/propertyWidget.vue';

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'MultiCommonSetting',
  components: {
    PropertyWidget,
    AInput: Input,
  },
})
export default class MultiCommonSetting extends Vue {
  @WorkflowModule.State('selectedActivities') selectedActivities: any;

  get multiActivityCode() {
    let str = '';
    this.selectedActivities.forEach((sel: any) => {
      str += `${sel.activityCode};`;
    });
    return str;
  }

  get multiActivityName() {
    let str = '';
    this.selectedActivities.forEach((sel: any) => {
      str += `${sel.activityName};`;
    });
    return str;
  }
}
</script>

<style lang="less">
.right-box {
  width: 100%;
  display: flex;
  align-items: center;
  .grey-box {
    width: 100%;
    height: 31px;
    line-height: 31px;
    background: #f5f5f5;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>

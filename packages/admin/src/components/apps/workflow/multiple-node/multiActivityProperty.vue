<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="property-container">
    <common-setting />
    <a-collapse :bordered="false" :activeKey="['2', '3']">
      <!-- 一般属性 -->
      <!-- <a-collapse-panel key="1" header="基础属性">
        <common-setting />
      </a-collapse-panel> -->

      <!-- 数据权限 -->
      <a-collapse-panel key="2" header="数据权限">
        <div class="head-tips">
          <p>
            <a-checkbox
              class="check-box"
              :checked="true"
              :disabled="true"
            />所有节点都选中
          </p>
          <p>
            <a-checkbox
              class="check-box"
              :indeterminate="true"
              :disabled="true"
            />节点存在不同权限
          </p>
          <p>
            <a-checkbox
              class="check-box check-empty"
              :checked="false"
              :disabled="true"
            />所有节点均为空
          </p>
        </div>

        <data-item />
      </a-collapse-panel>

      <!-- 操作权限 -->
      <a-collapse-panel key="3" header="操作权限">
        <div class="head-tips">
          <p>
            <a-checkbox
              class="check-box"
              :checked="true"
              :disabled="true"
            />所有节点都选中
          </p>
          <p>
            <a-checkbox
              class="check-box"
              :indeterminate="true"
              :disabled="true"
            />节点存在不同权限
          </p>
          <p>
            <a-checkbox
              class="check-box check-empty"
              :checked="false"
              :disabled="true"
            />所有节点均为空
          </p>
        </div>
        <operation />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DataItem from './property/dataItem.vue';
import CommonSetting from './property/commonSetting.vue';
import Operation from './property/operation.vue';
import { Checkbox, Collapse } from '@h3/antd-vue';

@Component({
  name: 'MultiActivityProperty',
  components: {
    CommonSetting,
    Operation,
    DataItem,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ACheckbox: Checkbox,
  },
})
export default class MultiActivityProperty extends Vue {}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.head-tips {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
  p {
    width: 50%;
    color: @s-light-font-color;
    font-size: 13px;
    line-height: 32px;
    label {
      margin-right: 8px;
    }
  }
}
</style>

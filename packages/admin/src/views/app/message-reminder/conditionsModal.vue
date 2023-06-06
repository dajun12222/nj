<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="visible"
    title="添加过滤条件"
    :width="700"
    :maskClosable="false"
    :keyboard="false"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @ok="ok"
    @cancel="onCancel"
  >
    <!-- 满足以下 -->
    <a-select
      v-model="theConditionType"
      placeholder="请选择类型"
      style="width: 100px"
    >
      <a-select-option v-for="item in conditionType" :key="item.key">
        {{ item.label }}
      </a-select-option>
    </a-select>
    <!-- 条件 -->
  </a-modal>
</template>

<script lang="ts">
import { Modal, Select } from '@h3/antd-vue';
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';

@Component({
  name: 'remind-conditions-modal',
  components: {
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class RemindConditionsModal extends Vue {
  @Prop() visible!: boolean;

  public theConditionType: string = '1';

  public conditionType: Array<any> = [
    { label: '全部', key: '1' },
    { label: '任一', key: '2' },
  ];

  @Emit('ok')
  public ok() {}

  @Emit('onCancel')
  public onCancel() {}
}
</script>

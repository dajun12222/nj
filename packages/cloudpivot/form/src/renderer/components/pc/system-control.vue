<template>
  <div class="field">
    <div class="field__label" :style="style">
      {{ label }}
      <a-tooltip v-if="tips" placement="top" style="margin: 5px 0 0 2px">
        <template slot="title">
          <span>{{ tips }}</span>
        </template>
        <a-icon type="question-circle" />
      </a-tooltip>
    </div>
    <div class="field__control">
      {{ text }}
    </div>
  </div>
</template>

<script lang="ts">
import { Icon, Tooltip } from '@h3/antd-vue';
import { Component } from 'vue-property-decorator';
import { SystemControl } from '../../controls';

@Component({
  name: 'system-control',
  components: {
    AIcon: Icon,
    ATooltip: Tooltip,
  },
})
export default class PcSystemControl extends SystemControl {}
</script>

<style lang="less" scoped>
.field.system > .field__label {
  // justify-content: flex-end;
  position: relative;
  flex: 0 0 104px;
}
.field__label,
.field__control {
  color: rgba(0, 0, 0, 0.45);
}

.ant-col > div.field.system.vertical .field__label {
  padding-left: 12px;
  font-size: 12px;
  font-weight: 900;
}

.ant-col > div.field.system.vertical .field__control {
  padding-left: 20px;
  padding-top: 5px;
}

.field__label::after {
  content: ':';
}
i > svg {
  margin-top: -2px;
}
</style>

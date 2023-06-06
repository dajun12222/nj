<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-18 18:07:55
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-04 15:47:05
-->

<template>
  <div v-if="lang === 'zh'" class="workflow-status" :class="statusClass">
    <i :class="'icon aufontAll ' + fontFace"></i>
    {{ statusText }}
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'workflow-status',
})
export default class WorkflowStatus extends Vue {
  @Prop()
  status!: string;

  lang: string = localStorage.getItem('locale') || 'zh';

  get statusText() {
    return this.MAP[this.status][this.lang];
  }

  get statusClass() {
    return this.MAP[this.status]['cn'];
  }

  get fontFace() {
    return this.MAP[this.status]['fontFace'];
  }

  MAP: any = {
    DRAFT: {
      zh: '草稿',
      cn: 'Draft',
      fontFace: 'h-icon-all-highlight',
    },
    PROCESSING: {
      zh: '进行中',
      cn: 'Pending',
      fontFace: 'h-icon-all-reloadtime',
    },
    COMPLETED: {
      zh: '已完成',
      cn: 'Completed',
      fontFace: 'h-icon-all-check-circle1',
    },
    CANCELED: {
      zh: '已作废',
      cn: 'Canceled',
      fontFace: 'h-icon-all-file-exception',
    },
    EXCEPTION: {
      zh: '流程异常',
      cn: 'Exception',
      fontFace: 'h-icon-all-abnormal',
    },
  };

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.lang = localStorage.getItem('locale') || 'zh';
  }
}
</script>

<style lang="less" scoped>
.workflow-status {
  font-size: 16px;
  display: flex;
  align-items: center;
  img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }
  &.Draft {
    color: #faad14;
  }
  &.Pending {
    color: #2970ff;
  }
  &.Completed {
    color: #00c293;
  }
  &.Canceled {
    color: rgba(17, 18, 24, 0.5);
  }
  &.Exception {
    color: #f0353f;
  }
  > i {
    overflow: inherit;
    vertical-align: baseline;
    width: auto;
    margin-right: 10px;
    font-size: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    padding-top: 2px;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="unfinished-list">
    <div
      v-for="(item, index) in list"
      :key="index"
      class="list-item"
      @click="openDetail(item)"
    >
      <div class="left">
        <i class="icon aufontAll h-icon-all-form"></i>
        <span :title="item.instanceName" class="name">{{
          item.instanceName
        }}</span>
        <span v-if="item.urgeCount" class="type">{{
          $t('languages.common.workBenchInfo.Urge')
        }}</span>
        <span v-if="item.workItemTimeoutStatus === 'TIMEOUT'" class="type">{{
          $t('languages.common.workBenchInfo.Timeout')
        }}</span>
      </div>
      <div class="right">
        <span>{{ $t('languages.common.workBenchInfo.Duration') }}</span>
        <span v-for="(tim, ind) in item.stayTimeStr1" :key="ind">
          <template v-if="ind === 0">
            {{ `${tim}` + (tim === 1 ? $t('cloudpivot.flowCenter.pc.day') : $t('cloudpivot.flowCenter.pc.days')) }}
          </template>
          <template v-if="ind === 1">
            {{ `${tim}` + (tim === 1 ? $t('cloudpivot.flowCenter.pc.hour') : $t('cloudpivot.flowCenter.pc.hours')) }}
          </template>
          <template v-if="ind === 2">
            {{ `${tim}` + (tim === 1 ? $t('cloudpivot.flowCenter.pc.min') : $t('cloudpivot.flowCenter.pc.mins')) }}
          </template>
        </span>
      </div>
    </div>

    <template v-if="!list.length">
      <p class="empty">
        {{ $t('languages.common.noData') }}
      </p>
    </template>

    <!-- 详情弹出层 -->
    <IframeModal
      :showIframeForm="showIframeForm"
      :IframeFormUrl="IframeFormUrl"
      @close="closeModal"
    />
  </div>
</template>

<script lang="ts">
import toolMixin from 'cloudpivot/flow-center/src/components/pc/common/toolMixin'; //公共处理模块
import IframeModal from 'cloudpivot/flow-center/src/components/pc/components/iframe-modal/iframe-modal.vue';
import { mixins } from 'vue-class-component';
import { Component, Prop } from 'vue-property-decorator';
@Component({
  name: 'unfinishedList',
  components: {
    IframeModal,
  },
})
export default class unfinishedList extends mixins(toolMixin) {
  @Prop() list!: any[];

  showIframeForm: boolean = false;

  IframeFormUrl: string = '';

  closeModal() {
    this.showIframeForm = false;
    this.IframeFormUrl = '';
    this.$emit('refreshData', true);
  }

  /**
   * 打开表单详情
   */
  openDetail(obj) {
    console.log('打开了表单');
    const url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${
      obj.instanceId
    }&return=${
      location.pathname + location.search
    }&workitemType=finishedWorkitem`;
    if (this.isDingtalk) {
      this.$router
        .push({
          path: url,
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      this.IframeFormUrl = url;
      this.showIframeForm = true;
    }
  }

  mounted() {
    window.addEventListener('message', this.reloadMessage, false);
  }

  beforeDestroy() {
    window.removeEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event: any) {
    if (event.data === 'close') {
      this.showIframeForm = false;
      this.IframeFormUrl = '';
      this.$emit('refreshData', true);
    }
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
.unfinished-list {
  margin-top: 4px;
  .empty {
    font-size: 14px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    line-height: 22px;
    text-align: center;
    margin-top: 94px;
  }
}
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 24px;
  cursor: pointer;
  &:hover {
    background-color: @activeBGColor;
    .name {
      color: @highlightColor;
    }
  }
  .left {
    display: flex;
    align-items: center;
    img {
      width: 16px;
      margin-right: 8px;
    }
    i {
      font-size: 16px;
      margin-right: 8px;
      color: @highlightColor;
    }
    span {
      display: inline-block;
      &.name {
        max-width: 377px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        line-height: 22px;
      }
      &.type {
        width: 32px;
        height: 16px;
        line-height: 16px;
        background: #fdeae9;
        border-radius: 2px;
        text-align: center;
        font-size: 10px;
        margin-left: 16px;
        color: #f0353f;
      }
    }
  }
  .right {
    font-size: 12px;
    span {
      color: rgba(17, 18, 24, 0.5);
      line-height: 22px;
    }
  }
}
</style>

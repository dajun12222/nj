<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-01-04 18:06:33
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-02 15:16:40
 * @FilePath: \yunshu6.0\modules\cloudpivot\flow-center\src\components\mobile\components\finished-circulates-item.vue
 * @Description:
-->
<template>
  <base-item
    class="work-item"
    :title="workitem.instanceName"
    :searchWord="searchWord"
    :summary="summary"
    :time="workitem.finishTime"
    :avatar="workitem.imgUrl"
    :username="workitem.originatorName"
    :avatarPlacehold="true"
    @click="goForm"
  >
    <span slot="time">{{ $t('cloudpivot.flowCenter.mobile.readTime') }}:&nbsp;&nbsp;</span>
  </base-item>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import BaseItem from './base-item.vue';

import { mobileHome } from '../../../../../api';

@Component({
  name: 'WorkItem',
  components: {
    BaseItem,
  },
})
export default class WorkItem extends Vue {
  @Prop() workitem!: mobileHome.Workitem;

  @Prop() searchWord?: string;

  get summary() {
    if (this.$i18n) {
      const locale: string = this.$i18n.locale as string;
      return !(this.$i18n.locale && this.$i18n.locale === 'en')
        ? this.workitem.activityName
        : this.workitem.sourceName_i18n[locale];
    }
    return '';
  }

  goForm() {
    this.$emit('openForm');
  }
}
</script>
<style lang="less" scoped>
@import '../../../../../common/styles/mixins.less';
@timeout-width: 120px;
@timeout-height: 96px;
@warning-size: 30px;
.work-item {
  .item-status {
    .px2rem(margin-left, @horizontal-padding-sm);
    .px2rem(width, @timeout-width);
    .status {
      .px2rem(width, @timeout-width);
      .px2rem(height, @timeout-height);
    }
    .warning {
      .px2rem(height, @warning-size);
      .px2rem(width, @warning-size);
    }
  }
}
</style>

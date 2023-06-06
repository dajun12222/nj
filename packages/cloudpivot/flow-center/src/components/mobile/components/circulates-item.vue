<template>
  <h3-swipeout>
    <h3-swipeout-item
      v-for="(workitem, index) in list"
      :key="index"
      class="circulate-box"
      :threshold="0.5"
      :disabled="showCheckbox"
    >
      <base-item
        slot="content"
        class="work-item"
        :hasleft="showCheckbox"
        :title="workitem.instanceName"
        :itemTitle="$t('cloudpivot.flowCenter.mobile.templateName')"
        :searchWord="searchWord"
        :summary="workitem.an"
        :time="workitem.startTime"
        :avatar="workitem.imgUrl"
        :username="workitem.originatorName"
        :avatarPlacehold="true"
        @click="goForm(workitem)"
      >
        <span slot="time">{{
            $t('cloudpivot.flowCenter.mobile.reciveTime')
          }}:&nbsp;&nbsp;</span>
        <span slot="template" class="template-name">
          {{ workitem.workflowName || '--' }}
        </span>
        <div
          slot="left"
          class="work-item-checkbox"
          @click="checkBoxContainerClick(workitem.id, $event)"
        >
          <checkbox-item
            :defaultChecked="checkedIds.includes(workitem.id) || !!checkAll"
            @change="checkItem(workitem.id)"
          />
        </div>
      </base-item>
      <div v-if="!showCheckbox" slot="right-menu">
        <h3-swipeout-button
          class="work-item-button"
          :backgroundColor="buttonColor"
          @click.native="onCirculate(workitem)"
        >
          {{ $t('cloudpivot.flowCenter.mobile.markMultiRead') }}
        </h3-swipeout-button>
      </div>
    </h3-swipeout-item>
  </h3-swipeout>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { H3Swipeout, H3SwipeoutItem, H3SwipeoutButton } from 'h3-mobile-vue';

import common from '../../../../../common/mobile';

import BaseItem from './base-item.vue';

import { mobileHome } from '../../../../../api';

const circulateModule = namespace('circulate');

@Component({
  name: 'WorkItem',
  components: {
    H3Swipeout,
    H3SwipeoutItem,
    H3SwipeoutButton,
    checkboxItem: common.components.Checkbox,
    BaseItem,
  },
})
export default class WorkItem extends Vue {
  @circulateModule.State('checkedIds') checkedIds!: string[];

  @circulateModule.State('checkAll') checkAll!: boolean;

  @circulateModule.State('showCheckbox') showCheckbox!: boolean;

  @circulateModule.Action('checkItem') checkItem: any;

  // @Prop() workitem!: mobileHome.Workitem;
  @Prop() circulates!: Array<mobileHome.Workitem>;

  @Prop() searchWord?: string;

  buttonColor: string = '#2970FF';

  get list() {
    this.circulates.forEach((item: any) => {
      if (this.$i18n) {
        const locale: string = this.$i18n.locale as string;
        item.an = !(this.$i18n.locale && this.$i18n.locale === 'en')
          ? item.activityName
          : item.name_i18n[locale];
      }
    });
    return this.circulates;
  }

  checkBoxContainerClick(id, event) {
    const current = event.target;
    const child = current.firstChild;
    event.stopPropagation();
    this.checkItem(id);
    return false;
  }

  goForm(workitem: mobileHome.Workitem) {
    this.$emit('openForm', workitem);
  }

  onCirculate(circulate: mobileHome.Workitem) {
    this.$emit('read', circulate);
  }
}
</script>
<style lang="less" scoped>
@import '../../../../../common/styles/mixins.less';
@timeout-width: 120px;
@timeout-height: 96px;
@warning-size: 30px;
.circulate-box {
  .px2rem(border-radius, @border-radius-lg);
  .px2rem(margin, @horizontal-padding-md);
  overflow: hidden;
  /deep/.h3-swipeout-content {
    background: none;
  }
  .work-item {
    align-items: center;
    margin: 0;
    border-radius: 0;
    height: 100%;
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
    &-button {
      .px2rem(border-radius-top-right, @border-radius-lg);
      .px2rem(border-radius-bottom-right, @border-radius-lg);
    }
    .template-name {
      .px2rem(margin-left, 4px);
    }
  }
}
/deep/.work-item-checkbox {
  .px2rem(width, 70px);
  .px2rem(padding-top,80px);
  .px2rem(padding-bottom,80px);
  height: 100%;
  text-align: left;
}
</style>

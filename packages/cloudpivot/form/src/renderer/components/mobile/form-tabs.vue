<template>
  <div>
    <!-- <div class="tab-heard">
      <div class="tab-heard-wrap clearfix" :style="{width: `${width}px`}">
        <div
          class="tab-heard-item"
          v-for="(t) in tabsTitle"
          :key="t.code"
          :ref="`heardItem${t.code}`"
          :id="`heardItem${t.code}`"
          :class="{'active': t.active}"
          @click="tabClick(t.code)"
        >{{ t.name }}</div>
      </div>
      <div class="border-bottom"></div>
    </div>-->
    <h3-tab
      v-if="tabsTitle.length > 1"
      ref="h3Tab"
      v-model="activeTab"
      style="overflow: scroll"
      :lineWidth="3"
      :customBarWidth="getBarWidth"
      :customBarWidthLeft="customBarWidthLeft"
      activeColor="#2970FF"
    >
      <h3-tab-item
        v-for="(item, index) in tabsTitle"
        :key="index"
        class="h3-center"
        :selected="activeTab === item.code"
        @click="activeTab = item.code"
      >
        {{ item.name }}
      </h3-tab-item>
    </h3-tab>
    <h3-swiper
      ref="h3swiper"
      v-model="activeTab"
      :showDots="false"
      class="form-rendere-swiper"
      :style="{ height: height + 'px', 'min-height': '180px' }"
      :itemClass="itemClass"
    >
      <slot></slot>
    </h3-swiper>
  </div>
</template>

<script lang="ts">
import * as typings from '../../../../../form/schema';
import { H3Swiper, H3Tab, H3TabItem } from 'h3-mobile-vue';
import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import { BaseControl } from '../../controls';

@Component({
  name: 'form-tabs',
  components: {
    H3Tab,
    H3TabItem,
    H3Swiper,
  },
})
export default class FormTabs extends BaseControl<typings.TabsOptions> {
  @Prop()
  itemList!: any;

  @Prop({
    default: '-1',
  })
  defaultActiveKey!: string;

  @Inject()
  formTabActiveTab!: (tab: number) => void;

  tabsTitle: any = [];

  width = 0;

  height = 0;

  customBarWidthLeft = 0;

  isReverseRelevanceTab: boolean = false;

  getBarWidth(index) {
    return `${this.width}px`;
  }

  created() {
    let code = '';
    if (this.ctrl && this.ctrl.value) {
      code = this.ctrl.value;
    } else {
      code = this.defaultActiveKey;
    }
    this.isReverseRelevanceTab = this.itemList.find(
      (i: any) => i.isReverseRelevanceTab,
    );
    const source: any = this.itemList.find((i: any) => i.code === code);
    source && (this.activeTab = source.code);
    this.tabsTitle = this.itemList.map((res) => {
      let active = false;
      if (res.code === this.activeTab) {
        active = true;
      }
      return {
        active,
        ...res,
      };
    });
  }

  get itemClass() {
    const length = 5;
    return `tabs-${Number(
      Math.random().toString().substr(3, length) + Date.now(),
    ).toString(36)}`;
  }

  mounted() {
    // @ts-ignore
    this.width = this.$el
      .querySelector('.h3-tab-selected')
      .getBoundingClientRect().width;
    setTimeout(() => {
      this.setHeight();
    }, 1000);
  }

  setHeight() {
    const h3swiper: any = this.$refs.h3swiper;
    const childrenGroup = h3swiper.$children;
    let h = 0;
    childrenGroup.forEach((res: any, index) => {
      const height = res.$el.offsetHeight;
      // if (height > h) {
      //   h = height;
      // }
      if (index === this.activeTab) {
        h = height;
      }
    });
    this.height = h;
    console.log(h);
  }

  activeTab = 0;

  @Watch('activeTab')
  onActiveTabChange(val: number) {
    this.$nextTick(() => {
      // @ts-ignore
      const rect = this.$el
        .querySelector('.h3-tab-selected')
        .getBoundingClientRect();
      if (rect) {
        this.width = rect.width;
      }
      // @ts-ignore
      this.customBarWidthLeft = this.$refs.h3Tab.$children[val].$el.offsetLeft;
      this.setHeight();
    });
  }

  handleValueChange() {
    console.log('值变化时我执行了');
    this.tabsTitle.forEach((res) => {
      res.active = false;
      if (res.code === this.ctrl.value) {
        this.setValue(res.code);
        res.active = true;
      }
    });
  }
}
</script>

<style lang="less" scoped>
@import '../../../../../common/styles/mixins.less';
@import './../../../../../common/common';
.tab-heard {
  overflow-y: hidden;
  overflow-x: auto;
  margin: 0 15px;
  .tab-heard-wrap {
    // margin: 0 15px;
    // padding-right: 0;
    min-width: 100%;

    .tab-heard-item {
      float: left;
      padding: 0.36rem 0.4rem;
      color: rgba(102, 102, 102, 1);
      font-size: 0.4rem;
    }
    .tab-heard-item.active {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      border-bottom: 0.053rem solid @primary-color;
    }
  }
  .border-bottom {
    height: 0;
    position: relative;
    .hairline('bottom', #eee);
  }
}
.form-rendere-swiper {
  /deep/.h3-swiper {
    height: 100% !important;
    min-height: 180px;

    zoom: 1;
    &:after {
      content: '';
      display: block;
      clear: both;
    }
    // height: calc(100vh - 2.47rem) !important;
    // overflow-x: hidden;
    overflow-y: auto;
    // overflow: hidden !important;
  }

  /deep/.h3-swiper-item {
    height: auto !important;
    min-height: 20px;
    // min-height: calc(100vh - 96px);
    // position: relative!important;
    float: left;
    overflow-x: hidden;
    overflow-y: hidden;

    & > div {
      // height: calc(100vh - 2.47rem) !important;
    }
  }
}
</style>
<style lang="less">
@import './../../../../../common/common';
.reverse-relevance-tabs {
  & > .form-rendere-swiper {
    // height: auto!important;
    height: calc(100vh - 2.47rem) !important;
    & > .h3-swiper {
      overflow-x: hidden;
      overflow-y: auto !important;
      & > .h3-swiper-item {
        height: calc(100vh - 2.47rem) !important;
        overflow-y: auto !important;
      }
    }
  }
  /deep/.h3-tab-bar-inner {
    border-radius: 3px;
  }
  .h3-tab::-webkit-scrollbar {
    display: none;
  }
  .h3-center {
    overflow: visible;
    padding: 0 10px;
  }
}
</style>

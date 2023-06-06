<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="sider">
    <a-layout-sider
      v-model="isShow"
      :trigger="null"
      theme="light"
      collapsible
      collapsedWidth="46"
      class="sider__menu"
      width="224"
    >
      <div v-show="!isShow">
        <div
          v-for="item in menus"
          :key="item.code"
          class="sider__items"
          :class="{ selected: item.isSelected }"
          @click="onMouseDown(item)"
        >
          <i class="icon aufontAll" :class="item.icon"></i>
          <span>{{ $t(item.name) }}</span>
        </div>
      </div>
      <div v-show="isShow">
        <a-tooltip v-for="item in menus" :key="item.code" placement="right">
          <template slot="title">
            {{ $t(item.name) }}
          </template>
          <div
            class="sider__items"
            :class="{ selected: item.isSelected }"
            @mousedown="onMouseDown(item)"
          >
            <i class="icon aufontAll" :class="item.icon"></i>
          </div>
        </a-tooltip>
      </div>
      <div id="hide-menu" @click="() => (isShow = !isShow)">
        <div v-show="!isShow" class="to-left"></div>
        <div v-show="isShow" class="to-right"></div>
      </div>
    </a-layout-sider>
    <div class="sider__view">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { Tooltip, Layout } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

interface MenuItem {
  name: string;
  icon: string;
  code: string;
  isSelected: boolean;
}

@Component({
  name: 'side-layout',
  components: {
    ATooltip: Tooltip,
    ALayoutSider: Layout.Sider,
  },
})
export default class SideLayout extends Vue {
  @Prop({ default: [] }) list!: Array<MenuItem>;

  menus: Array<MenuItem> = this.list;

  isShow: boolean = false;

  created() {
    const vm = this;
    vm.menus = vm.list;
    vm.menus.forEach((m) => {
      m.isSelected = false;
      if (vm.$route.name === m.code) {
        m.isSelected = true;
      }
    });
  }

  onMouseDown(item: MenuItem) {
    this.menus.forEach((m) => {
      m.isSelected = false;
    });
    item.isSelected = true;
    this.$emit('onRoute', item);
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.sider {
  background: #fff;
  margin-top: 0px;
  position: relative;
  &__menu {
    width: 224px;
    height: calc(100vh - 64px);
    float: left;
    box-shadow: 1px 0px 0px 0px #e8e8e8;
    position: relative;
    padding-top: 8px;
    z-index: 2;
    #hide-menu {
      position: absolute;
      top: 0px;
      right: -14px;
      width: 14px;
      height: 30px;
      z-index: 9;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      .to-left {
        width: 14px;
        height: 30px;
        background-image: url('~@/assets/images/toleft.svg');
        &:after {
          content: '';
          display: block;
          background-image: url('~@/assets/images/tolefthover.svg');
        }
        &:hover:after {
          width: 14px;
          height: 30px;
        }
      }
      .to-right {
        width: 14px;
        height: 30px;
        background-image: url('~@/assets/images/toright.svg');
        &:after {
          content: '';
          display: block;
          background-image: url('~@/assets/images/torighthover.svg');
        }
        &:hover:after {
          width: 14px;
          height: 30px;
        }
      }
      &:hover {
        border-left-color: #c6c6c6;
      }
    }
    .sider__items {
      position: relative;
      height: 40px;
      width: 224px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding-left: 16px;
      margin-bottom: 8px;
      cursor: pointer;
      &.selected {
        background: @sub-bg-color;
        color: @primary-color;
        transition: none;
        transform: none;
        &::before {
          content: '';
          position: absolute;
          height: 100%;
          width: 0;
          top: 0;
          left: 0;
          border-left: 4px solid @primary-color;
        }
      }
      i {
        margin-right: 9px;
        font-size: 14px;
        height: 14px;
        line-height: 14px;
      }
      &:hover {
        background: @sub-bg-color;
      }
    }
  }
  .ant-layout-sider-collapsed {
    .sider__items {
      width: 46px;
    }
  }
  &__view {
    overflow: hidden;
    height: calc(100vh - 64px);
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="operation-bar">
    <div class="operation-bar-li">
      <i class="icon aufontAll h-icon-all-reload-time"></i>
      <span>
        {{ $t('cloudpivot.list.pc.FormTrack') }}
      </span>
    </div>

    <div class="operation-bar-li">
      <i class="icon aufontAll h-icon-all-setting-fill"></i>
      <span>
        {{ $t('cloudpivot.list.pc.SetDisplayItems') }}
      </span>
    </div>
    <a-popover
      placement="bottom"
      :visible="isShowPop"
      overlayClassName="filter-tips"
    >
      <template slot="content">
        <p class="text">点击图标可查看刚刚添加的查询条件哦~</p>
        <p class="ok" @click="hidePopover">知道了</p>
      </template>
      <div
        :class="{ 'high-light': isShowFilterBox }"
        class="operation-bar-li"
        @click="isShowFilterBox = !isShowFilterBox"
      >
        <i class="icon aufontAll h-icon-all-screen"></i>
        <span>
          {{ $t('cloudpivot.list.pc.Screen') }}
        </span>
      </div>
    </a-popover>
    <div v-if="isShowFilterBox" class="filter-wrap">
      <div class="content-box">
        <div class="fixed-icon">
          <span class="icon aufontAll fixed">&#xe86d;</span>
        </div>
        <QueryForm :fields="queryConditions" />
      </div>
      <div class="filter-mask" @click="isShowFilterBox = false"></div>
    </div>
  </div>
</template>
<script lang="ts">
import QueryCrieria from '@/components/apps/list-design/query-criteria.vue';
import { Icon, Menu, Button, Dropdown, Popover } from '@h3/antd-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import QueryForm from '../list-preview/query-form-preview.vue';

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'OperationBar',
  components: {
    QueryCrieria,
    AIcon: Icon,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AButton: Button,
    ADropdown: Dropdown,
    APopover: Popover,
    QueryForm,
  },
})
export default class OperationBar extends Vue {
  @ListdesignModule.State('isShowPop') isShowPop: any;

  @ListdesignModule.Mutation('setShowPop') setShowPop: any;

  @ListdesignModule.State('payloadOptions') queryConditions: any;

  isShowFilterBox: boolean = false;

  zhToEn: any = zhToEn;

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  hidePopover() {
    this.setShowPop(false);
  }
}
</script>

<style lang="less" scoped>
.operation-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  // box-shadow: 0px 1px 0px 0px #eeeeee;
  height: 46px;
  border-bottom: none;
  &-li {
    margin-right: 16px;
    font-size: 12px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    cursor: pointer;
    white-space: nowrap;
    > span {
      white-space: nowrap;
      > span {
        vertical-align: 1px;
      }
    }
    i {
      font-size: 14px;
      color: rgba(17, 18, 24, 0.25);
      // margin-right: 4px;
    }
    &:hover {
      color: #2970ff;
      i {
        color: #2970ff;
      }
    }
    &.high-light {
      color: #2970ff;
      > i {
        color: #2970ff;
      }
    }
  }
  .filter-wrap {
    position: absolute;
    top: 123px;
    width: 344px;
    z-index: 666;
    margin-top: -8px;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    background: #fff;
    .content-box {
      padding-top: 24px;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      border-radius: 4px;
      background: #fff;
      z-index: 9;
      position: relative;
      .fixed-icon {
        position: absolute;
        top: 0;
        right: 0;
        width: 30px;
        height: 30px;
        background-color: #eeeeee;
        z-index: 3;
        border-bottom-left-radius: 30px;
        > span {
          position: absolute;
          top: 4px;
          right: 4px;
          color: rgba(17, 18, 24, 0.25);
          height: 16px;
          width: 16px;
          line-height: 16px;
          &.cancel-fixed {
            color: rgba(17, 18, 24, 0.5);
          }
        }
        &:hover {
          cursor: pointer;
          > span {
            color: rgba(17, 18, 24, 0.5);
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
.filter-tips {
  .ant-popover-inner {
    height: 106px;
    .text {
      color: rgba(17, 18, 24, 0.5);
      margin-top: 8px;
      margin-bottom: 18px;
    }
    .ok {
      color: @primary-color;
      cursor: pointer;
      text-align: right;
    }
  }
}
</style>

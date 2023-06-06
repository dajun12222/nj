<!--
 * @Descripttion: 搜索应用
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-20 16:37:45
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-04 15:53:09
-->

<template>
  <div class="my-search-item">
    <div
      v-for="(item, index) in searchList"
      :key="index"
      class="my-search-item-li"
      @click.stop="openDetail(item.dataList[0])"
    >
      <div class="my-search-left">
        <i class="icon aufontAll h-icon-all-form"></i>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="item.dataList[0].name"></span>
      </div>
      <div class="my-search-right">
        <!-- eslint-disable-next-line vue/no-v-html -->
        所属应用：<span v-html="item.appName"></span>
      </div>

      <div
        class="group-li-collect"
        @click.stop="favoriteWorkflow(item.dataList[0], item)"
      >
        <a-tooltip placement="bottom">
          <template slot="title">
            {{ item.dataList[0].favorites ? '取消收藏' : '加入收藏' }}
          </template>
          <i
            v-show="!item.dataList[0].favorites && !item.dataList[0].active"
            class="icon aufontAll h-icon-all-star1"
            @mouseenter="iconChange(item.dataList[0], true)"
          ></i>
          <i
            v-show="!item.dataList[0].favorites && item.dataList[0].active"
            class="icon aufontAll h-icon-all-star-fill hover"
            @mouseleave="iconChange(item.dataList[0], false)"
          ></i>
          <i
            v-show="item.dataList[0].favorites"
            class="icon aufontAll h-icon-all-star-fill"
          ></i>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Tooltip } from '@h3/antd-vue';
import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams,
} from '../../../../../../api';

@Component({
  name: 'my-search-item',
  components: {
    ATooltip: Tooltip,
  },
})
export default class MySearchItem extends Vue {
  @Prop({ default: () => [] })
  searchList: any;

  openDetail(item) {
    this.$emit('openDetail', item);
  }

  iconChange(item, flag) {
    this.$set(item, 'active', flag);
  }

  /**
   * 收藏操作
   */
  async favoriteWorkflow(item, list) {
    console.log(item);
    if (!item) {
      return;
    }

    const cancelParams: workflowCenterParams.WorkflowParams = {
      workflowCode: item.code,
    };
    const setParams: workflowCenterParams.WorkflowParams = {
      workflowCode: item.code,
      appCode: item.appCode || list.appCode,
    };

    if (item.favorites) {
      const res = await workflowCenterApi.deleteFavoriteWorkflow(cancelParams);
      if (!res.errcode) {
        item.favorites = false;
        this.$emit('favoriteChange', { data: item, favorites: false });
      }
    } else {
      const res = await workflowCenterApi.setFavoriteWorkflow(setParams);
      if (!res.errcode) {
        item.favorites = true;
        this.$emit('favoriteChange', { data: item, favorites: true });
      } else if (res.errcode === 201014) {
        this.$message.warning(
          this.$t('cloudpivot.flowCenter.pc.sevenFlowsIsMost') as string,
        );
      } else {
        this.$message.error(res.errmsg as any);
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../../application/src/components/pc/style/custom-themes';
.my-search-item-li {
  width: 100%;
  height: 64px;
  background: #ffffff;
  border-radius: 2px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  cursor: pointer;
  margin-bottom: 8px;
  &:hover {
    background-color: #fafbfc;
    box-shadow: 0px 2px 8px 0px rgb(168 175 186 / 50%);
  }
  .my-search-left {
    display: flex;
    align-items: center;
    margin-right: 20%;
    > i {
      color: #2970ff;
      font-size: 18px;
      vertical-align: baseline;
      margin-right: 10px;
      width: auto;
      height: auto;
    }
    > span {
      width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 16px;
      color: #111218;
      font-weight: 400;
    }
  }
  .my-search-right {
    flex: 1;
    font-size: 14px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
  }
  .group-li-collect {
    width: 24px;
    i {
      font-size: 18px;
      color: #faad14;
      &.hover,
      &.h-icon-all-star1 {
        color: rgba(17, 18, 24, 0.5);
      }
    }
  }
}

/deep/ .highlights {
  color: @highlightColor !important;
}
</style>

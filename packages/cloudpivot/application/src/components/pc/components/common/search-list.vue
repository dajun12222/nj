<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-29 18:55:50
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-22 16:48:48
-->
<template>
  <div class="search-containner">
    <div class="wire">
      <a-breadcrumb v-if="type === 'other'" class="bread-menu">
        <a-breadcrumb-item>
          <span class="bread-menu-back" @click="goBack">
            <i class="icon aufontAll h-icon-all-arrow-left-o"></i>
            {{ $t('languages.common.appMenu.applications') }}
          </span>
        </a-breadcrumb-item>
        <a-breadcrumb-item>{{ groupText }}</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div
      class="search-group-containner"
      :class="searchResult.length < 1 ? 'search-group-nodata' : ''"
    >
      <template v-if="type === 'all'">
        <div
          v-for="(item, index) in searchResult"
          :key="index"
          class="search-group"
        >
          <div class="search-group-title">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="item.searchName"></div>
            <span>（{{ item.children.length }}）</span>
          </div>
          <div class="search-group-box">
            <AppLists
              :appList="item.children"
              :type="type"
              @goToDetail="goToDetail"
              @favoriteOperate="favoriteOperate"
            />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="search-group-box">
          <AppLists
            :appList="searchResult"
            :type="type"
            @goToDetail="goToDetail"
            @favoriteOperate="favoriteOperate"
          />
        </div>
      </template>

      <PageNoData
        v-if="searchResult.length < 1"
        class="page-containner"
        :isShowNoData="searchResult.length < 1"
        :tipText="$t('languages.common.appMenu.noResult')"
        type="search"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop, Inject } from 'vue-property-decorator';
import common from '../../../../../../common/pc';
import { Breadcrumb } from '@h3/antd-vue';
import AppLists from './app-lists.vue';
import getDownloadUrlNew from '../../../../../../common/src/utils/getDownloadUrlNew';

@Component({
  name: 'search-list',
  components: {
    PageNoData: common.components.PageNoData,
    ABreadcrumb: Breadcrumb,
    ABreadcrumbItem: Breadcrumb.Item,
    AppLists,
  },
})
export default class SearchList extends Vue {
  @Prop({ default: 'all' })
  type?: string;

  @Prop({ default: '默认分组' })
  groupText?: string;

  @Prop({ default: () => [] })
  searchResult?: any[];

  @Prop({ default: false })
  isSearch?: boolean;

  @Inject()
  apiHost: any;

  @Inject()
  token: any;

  favoriteOperate(data) {
    this.$emit('favoriteOperate', data);
  }

  /**
   * 收藏展开
   */
  isShow(item) {
    this.$set(item, 'isShow', true);
  }

  /**
   * 收藏隐藏
   */
  hideShow(item) {
    this.$set(item, 'isShow', false);
  }

  goToDetail(el) {
    this.$emit('goToDetail', el);
  }

  goBack() {
    this.$emit('back');
  }

  /**
   * 自定义应用图片
   */
  getDownloadUrl(refId: string) {
    let url = `${
      this.apiHost
    }/api/aliyun/download?refId=${getDownloadUrlNew.getRefId(refId)}`;
    if (this.token) {
      url += '&T=' + this.token;
    }
    return url;
  }
}
</script>
<style lang="less" scoped>
@import './../../style/custom-themes';
.search-containner {
  padding-top: 55px;
  height: 100%;

  .bread-menu {
    position: absolute;
    top: -44px;
    left: 0;
    span {
      color: rgba(17, 18, 24, 0.5);
      font-size: 12px;
      font-weight: 400;
    }
    span:last-child {
      font-weight: 700;
      color: #111218;
    }
    .bread-menu-back {
      color: rgba(17, 18, 24, 0.5) !important;
      font-weight: 400 !important;
      cursor: pointer;
      &:hover {
        color: @highlightColor !important;
      }
      i {
        font-size: 12px;
      }
    }
  }

  .wire {
    width: 100%;
    height: 1px;
    background-color: #eee;
    // margin-bottom: 16px;
    position: relative;
  }

  .search-group-containner {
    height: 100%;
    overflow-y: auto;
    &.search-group-nodata {
      display: flex;
      flex-direction: column;
      justify-content: center;
      .page-containner {
        margin-top: 0;
      }
    }
  }

  .search-group {
    // margin-bottom: 56px;
    &:first-child {
      margin-top: 24px;
    }
    &-title {
      padding-left: 25px;
      color: #111218;
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      position: relative;
      margin-bottom: 24px;
      &::before {
        content: '';
        position: absolute;
        width: 3px;
        height: 12px;
        background: #2970ff;
        left: 12px;
        top: 6px;
      }

      > span {
        color: #99999c;
        font-size: 14px;
      }
    }
  }
  .search-group-box {
    display: flex;
    flex-wrap: wrap;
    padding-left: 25px;
    padding-right: 15px;
    margin-top: 24px;
  }
  .search-li {
    margin: 40px 22px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 98px;
    .li-box {
      width: 34px;
      height: 34px;
      border-radius: 2px;
      border: 1px solid #eeeeee;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      .tabs-app-li-icon {
        width: 22px;
        height: 22px;
        border-radius: 2px;
      }
      img {
        width: 100%;
        height: 100%;
      }
    }
    span {
      margin-top: 14px;
      padding-left: 12px;
      padding-right: 12px;
      text-align: center;
      color: #111218;
      font-size: 14px;
      font-weight: 400;
      display: block;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .page-containner {
    margin-top: 200px;
  }
}

/deep/ .highlights {
  color: @highlightColor !important;
}
</style>

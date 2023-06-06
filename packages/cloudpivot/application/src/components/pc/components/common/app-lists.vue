<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-12-06 18:32:13
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-01 10:35:51
-->
<template>
  <div>
    <div
      v-for="(el, index2) in appList"
      :key="index2"
      class="tabs-app-li"
      @click="goToDetail(el)"
      @mouseenter="isShow(el)"
      @mouseleave="hideShow(el)"
    >
      <div class="li-box">
        <template v-if="el.logoUrl">
          <img
            v-if="el.logoUrl.indexOf('http') > -1"
            :src="el.logoUrl"
            class="content-item-icon"
          />
          <img
            v-else
            :src="getDownloadUrlNew(el.logoUrl, 'application')"
            class="content-item-icon"
          />
          <!-- 应用和模型图片需要传参Model -->
        </template>

        <template v-else>
          <svg class="tabs-app-li-icon icon svgIcon" aria-hidden="true">
            <use xlink:href="#h-icon-all-application1" />
          </svg>
        </template>
      </div>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <span
        v-if="el.searchName"
        :title="el.searchName"
        v-html="el.searchName"
      ></span>
      <span
        v-else
        :title="
          isChinese
            ? el && el.name
            : (JSON.parse(el && el.name_i18n) &&
                JSON.parse(el && el.name_i18n).en) ||
              (el && el.name)
        "
      >
        {{
          isChinese
            ? el && el.name
            : (JSON.parse(el && el.name_i18n) &&
                JSON.parse(el && el.name_i18n).en) ||
              (el && el.name)
        }}
      </span>
      <div
        v-if="el.isShow"
        class="tabs-app-collect"
        @click.stop="favoriteOperate(el)"
      >
        <a-tooltip placement="bottom">
          <template slot="title">
            {{
              el.favorites
                ? $t('cloudpivot.application.pc.cancelCollection')
                : $t('cloudpivot.application.pc.addToCollection')
            }}
          </template>
          <i
            v-show="!el.favorites && !el.active"
            class="icon aufontAll h-icon-all-star1"
            @mouseenter="iconChange(el, true)"
          ></i>
          <i
            v-show="!el.favorites && el.active"
            class="icon aufontAll h-icon-all-star-fill hover"
            @mouseleave="iconChange(el, false)"
          ></i>
          <i
            v-show="el.favorites"
            class="icon aufontAll h-icon-all-star-fill"
          ></i>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Tooltip } from '@h3/antd-vue';
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { listApi } from '../../../../../../api';
import getDownloadUrlNew from '../../../../../../common/src/utils/getDownloadUrlNew';

@Component({
  name: 'app-lists',
  components: {
    ATooltip: Tooltip,
  },
})
export default class AppLists extends Vue {
  @Prop({ default: () => [] })
  appList?: any[];

  @Prop({ default: '0' })
  isKey?: string;

  @Prop({ default: 'normal' })
  type?: string;

  @Inject()
  apiHost: any;

  @Inject()
  token: any;

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  goToDetail(item) {
    this.$emit('goToDetail', item);
  }

  flag: boolean = false; //防止重复点击

  async favoriteOperate(el) {
    if (this.flag) {
      return;
    }
    this.flag = true;
    if (el.favorites) {
      //取消收藏
      const res = await listApi.deleteFavorite({
        isMobile: false,
        appCode: el.code,
      });
      if (res.errcode === 0) {
        // 原先有判断 isKey === '1'
        this.$emit('favoriteOperate', { flag: false, el: el });
        this.$set(el, 'favorites', false);
      }
      this.flag = false;
    } else {
      //添加收藏
      const res = await listApi.createFavorite({
        isMobile: false,
        appCode: el.code,
      });
      if (res.errcode === 0) {
        this.$set(el, 'favorites', true);
        this.$emit('favoriteOperate', { flag: true });
      } else {
        this.$message.error(res.errmsg as any);
      }
      this.flag = false;
    }
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

  iconChange(item, flag) {
    this.$set(item, 'active', flag);
  }

  /**
   * 自定义应用图片
   */
  getDownloadUrlNew(refId: string, type?: string) {
    return getDownloadUrlNew.getImageUrl(refId, type);
  }
}
</script>
<style lang="less" scoped>
.tabs-app-li {
  width: 122px;
  height: 98px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0px 24px;
  cursor: pointer;
  justify-content: center;
  border-radius: 2px;
  position: relative;
  float: left;
  &:nth-child(7n) {
    margin-right: 0;
    margin-left: 0;
  }
  &:hover {
    background-color: rgba(0, 30, 116, 0.06);
  }
  > .li-box {
    width: 34px;
    height: 34px;
    border-radius: 2px;
    border: 1px solid #eeeeee;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 2px;
      object-fit: cover;
    }
    .tabs-app-li-icon {
      width: 22px;
      height: 22px;
    }
  }
  > span {
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
  .tabs-app-collect {
    position: absolute;
    right: 7px;
    top: 3px;
    font-size: 13px;
    color: rgba(17, 18, 24, 0.5);
    i {
      color: rgba(17, 18, 24, 0.5);
      &.h-icon-all-star-fill {
        color: #faad14;
        &.hover {
          color: rgba(17, 18, 24, 0.5);
        }
      }
    }
  }
}
</style>

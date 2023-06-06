<!--
 * @Descripttion: 我的收藏/最近使用
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-20 15:20:10
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-28 16:29:06
-->

<template>
  <div class="my-common-item">
    <li
      v-for="(item, index) in isData"
      :key="index"
      class="my-common-item-li"
      @click.stop="openDetail(item)"
    >
      <div class="my-common-item-info">
        <div class="my-common-item-info-detail">
          <span class="content-icon" :class="`color-${getColor(item.code)}`">
            <i class="icon aufontAll" :class="item.icon"></i>
          </span>
          <span
            :title="item.name.length > 10 ? item.name : ''"
            class="my-common-item-li-name"
            >{{
              isChinese
                ? item.name
                : (item.name_i18n && item.name_i18n.en) || item.name
            }}</span>
        </div>
        <!-- <a-tooltip placement="bottom" v-if="type === 'collect'"> -->
        <span @click.stop="favoriteWorkflow(item)">
          <a-tooltip placement="bottom">
            <template slot="title">
              {{
                item.favorites
                  ? $t('cloudpivot.application.pc.cancelCollection')
                  : $t('cloudpivot.application.pc.addToCollection')
              }}
            </template>
            <i
              v-show="!item.favorites && !item.active"
              class="icon aufontAll h-icon-all-star1"
              @mouseenter="iconChange(item, true)"
            ></i>
            <i
              v-show="!item.favorites && item.active"
              class="icon aufontAll h-icon-all-star-fill hover"
              @mouseleave="iconChange(item, false)"
            ></i>
            <i
              v-show="item.favorites"
              class="icon aufontAll h-icon-all-star-fill"
              :class="item.favorites ? 'active' : ''"
            ></i>
          </a-tooltip>
        </span>
      </div>
      <div class="my-common-item-app" :title="item.appName">
        {{ $t('cloudpivot.application.pc.owningApplication') }}：{{
          item.appName
        }}
      </div>
    </li>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Tooltip } from '@h3/antd-vue';

@Component({
  name: 'my-common-item',
  components: {
    ATooltip: Tooltip,
  },
})
export default class MyCommonItem extends Vue {
  @Prop({ default: () => [] })
  isData: any;

  @Prop({ default: 'collect' })
  type?: string;

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  openDetail(item) {
    this.$emit('openDetail', item);
  }

  favoriteWorkflow(item) {
    this.$emit('favoriteWorkflow', item);
  }

  iconChange(item, flag) {
    this.$set(item, 'active', flag);
  }

  getColor(code: string) {
    const charCode = code.substr(-8);
    let ascii = 0;
    for (let i = 0; i < charCode.length; i++) {
      ascii += charCode.charCodeAt(i);
    }
    return ascii % 8;
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../../application/src/components/pc/style/custom-themes';
.my-common-item {
  width: 100%;
  overflow-y: scroll;
  height: calc(100% - 12px);
  padding: 4px 6px 15px 12px;
  .my-common-item-li {
    list-style: none;
    padding: 10px 8px;
    cursor: pointer;
    // margin-top: 10px;
    height: 62px;
    &:hover {
      .my-common-item-info {
        .h-icon-all-star1,
        .h-icon-all-star-fill {
          display: inline-block;
        }
      }
    }
    .my-common-item-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .my-common-item-info-detail {
        display: flex;
        max-width: 70%;
        .my-common-item-li-name {
          display: inline-block;
          height: 22px;
          line-height: 22px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      > i {
        color: @highlightColor;
        font-size: 16px;
        vertical-align: baseline;
        margin-right: 10px;
        width: auto;
        height: auto;
      }
      .h-icon-all-star1 {
        color: rgba(17, 18, 24, 0.5);
        margin-left: 6px;
        position: relative;
        top: 1px;
        height: 22px;
        display: none;
      }

      .h-icon-all-star-fill {
        color: #faad14;
        margin: 0 0 0 6px;
        position: relative;
        top: 1px;
        height: 22px;
        display: none;
        &.hover {
          color: rgba(17, 18, 24, 0.5);
        }
        &.active {
          display: inline-block;
        }
      }

      > span {
        font-weight: 400;
        color: #111218;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 75%;
      }

      .content-icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        line-height: 18px;
        border-radius: 50%;
        text-align: center;
        margin-right: 6px;
        &.color-0 {
          background: #fff1f0;
          color: #f0353f;
        }
        &.color-1 {
          background: #fff6ed;
          color: #f66320;
        }
        &.color-2 {
          background: #fffbe6;
          color: #faad14;
        }
        &.color-3 {
          background: #f6ffed;
          color: #52c41a;
        }
        &.color-4 {
          background: #e6fff4;
          color: #00c293;
        }
        &.color-5 {
          background: #f0f7ff;
          color: #2970ff;
        }
        &.color-6 {
          background: #f9f0ff;
          color: #722ed1;
        }
        &.color-7 {
          background: #fff0f6;
          color: #f12d98;
        }
        > i.icon {
          font-size: 12px;
        }
      }
    }
    .my-common-item-app {
      height: 20px;
      // margin-top: 4px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &:hover {
      background: #ffffff;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      border-radius: 4px;
      z-index: 1;
    }
  }
}

/**
    滚动条内槽  
  */

.content-data::-webkit-scrollbar-thumb {
  width: 6px;
  background-color: rgba(17, 18, 24, 0.25);
  border-radius: 3px;
}

/**
   滚动条外层轨道
  */
.content-data::-webkit-scrollbar-track {
  background-color: transparent;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 47%;
  z-index: 999;
  transform: translate(-50%, -50%);
}
</style>

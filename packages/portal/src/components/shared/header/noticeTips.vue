<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="tips">
    <div class="head">
      <div class="left">
        <span
          :class="{ active: messageType === 'STATION', en: !isChinese }"
          @click="messageTypeChange('STATION')"
          >{{ $t('languages.common.Notification.Notifications') }}</span>
        <span
          :class="{ active: messageType === 'COMMENT', en: !isChinese }"
          @click="messageTypeChange('COMMENT')"
          >{{ $t('languages.common.Notification.AltAndReply') }}</span>
      </div>
      <div class="right">
        <span :class="{ 'no-data': notices.length === 0 }" @click="readAll">{{
          $t('languages.common.Notification.ReadAll')
        }}</span>
      </div>
    </div>
    <div class="content">
      <template v-for="(item, index) in notices">
        <tips-item :key="index" :item="item" />
      </template>
      <span v-if="notices.length === 0" class="font-ele">
        {{ $t('languages.common.Notification.NoNewsYet') }}
      </span>
    </div>

    <div class="foot">
      <span
        @click="
          $router.push(
            `/workbench-center/message-notification?type=${messageType}`,
          )
        "
        >{{ $t('languages.common.LoadMore') }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { workbenchApi } from 'cloudpivot/api';
import tipsItem from 'cloudpivot/application/src/components/pc/components/tipsItem.vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'noticeTips',
  components: {
    tipsItem,
  },
})
export default class noticeTips extends Vue {
  messageType: string = 'STATION';

  notices: any[] = [];

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  async readAll() {
    const res: any = await workbenchApi.updateReadStateAll({
      messageType: this.messageType,
    });
    if (res.errcode === 0) {
      this.paltformSearch();
      // utils.Bus.$emit('NoticeListChange');
    }
  }

  messageTypeChange(type: string) {
    this.messageType = type;
    this.paltformSearch();
  }

  searchword: string = '';

  size: number = 10;

  page: number = 0;

  tab: string = 'MESSAGE'; //APP:应用，MODEL模型，FLOW：流程待办， MESSAGE：消息通知，ALL：所有

  async paltformSearch() {
    const res: any = await workbenchApi.paltformSearch({
      searchword: '',
      size: this.size,
      page: this.page,
      tab: this.tab,
      messageType: this.messageType,
      readState: 'UNREADED',
    });
    if (res.errcode === 0) {
      this.notices = res.data.MESSAGE.content;
    }
  }

  created() {
    this.paltformSearch();
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
.tips {
  width: 300px;
  height: 378px;
  background: #fff;
  box-shadow: 2px 0px 11px 0px rgba(199, 205, 215, 0.5);
  margin-top: 4px;
  .head {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #eee;
    height: 47px;
    line-height: 46px;
    padding: 0 16px;
    .left {
      span {
        margin-right: 32px;
        display: inline-block;
        height: 46px;
        cursor: pointer;
        font-size: 14px;
        color: #111218;
        &.en {
          margin-right: 16px;
        }
        &:hover {
          color: @highlightColor;
        }
      }
      .active {
        position: relative;
        font-weight: 600;
        color: #111218;
        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background-color: @primaryColor;
          left: 0;
          bottom: 0;
        }
      }
    }
    .right {
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
      &:hover {
        color: @highlightColor;
      }
      cursor: pointer;

      .no-data {
        color: rgba(17, 18, 24, 0.5);
      }
    }
  }

  .content {
    height: 280px;
    overflow: auto;
    padding: 0 16px;
    .font-ele {
      color: rgba(17, 18, 24, 0.5);
      font-size: 12px;
      text-align: center;
      margin-top: 133px;
      display: block;
    }
  }

  .foot {
    height: 48px;
    line-height: 48px;
    text-align: center;
    margin: 0 16px;
    border-top: 1px solid #eee;
    span {
      cursor: pointer;
      color: rgba(17, 18, 24, 0.5);
      font-size: 14px;
      &:hover {
        color: @highlightColor;
      }
    }
  }
}
</style>

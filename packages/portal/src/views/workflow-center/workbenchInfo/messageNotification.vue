<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="workbench-wrapper">
    <div class="workbench-wrapper-in">
      <!-- <div class="header">
          <div class="left">
            <div class="address">
              <span>{{$t('languages.common.workbench')}} / </span>
              <span>{{$t('languages.common.notification')}}</span>
            </div>
          </div>
        </div> -->

      <div class="tips-wrapper">
        <div class="left">
          <div
            :class="{ active: messageType === 'STATION' }"
            @click="messageTypeChange('STATION')"
          >
            {{ $t('languages.common.Notification.Notifications') }}
          </div>
          <div
            :class="{ active: messageType === 'COMMENT' }"
            @click="messageTypeChange('COMMENT')"
          >
            {{ $t('languages.common.Notification.AltAndReply') }}
          </div>
        </div>
        <div class="right">
          <div class="tab">
            <div :class="{ active: tabType === 1 }" @click="tabTypeChange(1)">
              {{ $t('languages.common.Notification.unread')
              }}<span>{{ totalElements }}</span>
            </div>
            <div
              :class="{ hasRead: true, active: tabType === 2 }"
              @click="tabTypeChange(2)"
            >
              {{ $t('languages.common.Notification.read') }}
            </div>
            <div class="read-all" @click="readAll">
              {{ $t('languages.common.Notification.ReadAll') }}
            </div>
          </div>

          <div
            v-if="!isShowNoData"
            class="list-wrapper"
            @scroll="handleInfiniteOnLoad"
          >
            <div
              v-for="(el, i) in groundNotices"
              :key="i"
              class="notices-ground"
            >
              <p>{{ i }}</p>
              <template v-for="(item, index) in el">
                <tips-item
                  :key="index"
                  infosWidth="95%"
                  type="notification"
                  :item="item"
                />
              </template>
            </div>
            <div
              v-if="
                !isShowNoData &&
                totalElements !== 0 &&
                totalElements === notices.length
              "
              class="loaded-all"
            >
              {{ $t('languages.common.workBenchInfo.loadedAll') }}
            </div>
          </div>

          <div v-if="isShowNoData" class="empty">
            <PageNoData
              :isShowNoData="isShowNoData"
              type="show"
              :tipText="$t('languages.common.noData')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { workbenchApi } from 'cloudpivot/api';
import tipsItem from 'cloudpivot/application/src/components/pc/components/tipsItem.vue';
import common from 'cloudpivot/common/pc';
import toolMixin from 'cloudpivot/flow-center/src/components/pc/common/toolMixin'; //公共处理模块
import { Button, Checkbox } from '@h3/antd-vue';
import { mixins } from 'vue-class-component';
import { Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

@Component({
  name: 'messageNotification',
  components: {
    AButton: Button,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    PageNoData: common.components.PageNoData,
    tipsItem,
  },
})
export default class messageNotification extends mixins(toolMixin) {
  [x: string]: any;

  @WorkflowCenterModule.Mutation('setIsAppList') setIsAppList: any;

  get isShowNoData() {
    return this.notices.length === 0;
  }

  messageType: string = 'STATION';

  messageTypeChange(type: string) {
    this.page = 0;
    this.messageType = type;
    this.tabType = 1;
    this.paltformSearch();
  }

  tabTypeChange(type) {
    this.page = 0;
    this.tabType = type;
    this.paltformSearch();
  }

  size: number = 20;

  page: number = 0;

  tab: string = 'MESSAGE'; //APP:应用，MODEL模型，FLOW：流程待办， MESSAGE：消息通知，ALL：所有

  isLoading: boolean = false;

  totalElements: number = 0; // 未读总数

  unReadTotal: number = 0; // 已读总数

  async paltformSearch() {
    this.isLoading = true;
    const res: any = await workbenchApi.paltformSearch({
      size: this.size,
      page: this.page,
      tab: this.tab,
      messageType: this.messageType,
      readState: this.tabType === 1 ? 'UNREADED' : 'READED',
    });
    if (res.errcode === 0) {
      if (this.page === 0) {
        this.notices = res.data.MESSAGE.content;
      } else {
        this.notices = [...this.notices, ...res.data.MESSAGE.content];
      }

      if (this.tabType !== 2) {
        this.totalElements = res.data.MESSAGE.totalElements;
      } else {
        this.unReadTotal = res.data.MESSAGE.totalElements;
      }
    }
    this.isLoading = false;
  }

  get groundNotices() {
    const res: any = {};
    this.notices.forEach((el: any) => {
      const time = el.createdTime.slice(0, 10);
      if (res[time]) {
        res[time].push(el);
      } else {
        res[time] = [el];
      }
    });
    return res;
  }

  @Watch('$route', { deep: true })
  on$routeChange() {
    if (this.$route.query.type) {
      this.messageTypeChange(this.$route.query.type as string);
    }
  }

  created() {
    if (this.$route.query.type) {
      this.messageTypeChange(this.$route.query.type as string);
    } else {
      this.paltformSearch();
    }

    this.setIsAppList(false);
  }

  tabType: number = 1; // 2已读消息，1未读消息

  timer: any = null;

  /**
   * 滚动加载
   */
  handleInfiniteOnLoad(e) {
    const boxHeight = e.target.getBoundingClientRect().height;
    const scrollTop = e.target.scrollTop;
    const scrollHeight = e.target.scrollHeight;

    let totalElements = this.totalElements;
    if (this.tabType === 2) {
      totalElements = this.unReadTotal;
    }
    if (
      scrollHeight - scrollTop - boxHeight <= 150 &&
      !this.isLoading &&
      this.notices.length < totalElements
    ) {
      this.banchLoadMore();
    }
  }

  banchLoadMore() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page = this.page + 1;
      this.paltformSearch();
    }, 100);
  }

  notices: any[] = [];

  async readAll() {
    const res: any = await workbenchApi.updateReadStateAll({
      messageType: this.messageType,
    });
    if (res.errcode === 0) {
      this.paltformSearch();
      // utils.Bus.$emit('NoticeListChange');
    }
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
@black: #111218;

.tips-wrapper {
  min-width: 1000px;
  width: 80%;
  max-width: 1600px;
  flex: 1;
  margin: 12px auto 16px;
  display: flex;
  overflow: hidden;

  .left {
    width: 180px;
    margin-right: 16px;
    padding-top: 16px;
    background-color: #fff;
    min-width: 180px;
    & > div {
      font-size: 14px;
      padding: 0 24px;
      height: 40px;
      line-height: 40px;
      position: relative;
      cursor: pointer;
      &.active {
        background-color: @activeBGColor;
        color: @primaryColor;
        &::before {
          content: '';
          position: absolute;
          width: 3px;
          height: 24px;
          background: @primaryColor;
          border-radius: 0px 100px 100px 0px;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
        }
      }
      &:hover {
        color: @primaryColor;
      }
    }
  }
  .right {
    flex: 1;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    .tab {
      height: 55px;
      border-bottom: 1px solid #eee;
      margin: 0 16px;
      display: flex;
      font-size: 14px;
      line-height: 54px;
      position: relative;
      & > div {
        cursor: pointer;
        border-bottom: 3px solid transparent;
        line-height: 51px;
        &.hasRead {
          margin-left: 32px;
        }
        &.active {
          font-weight: 600;
          border-bottom: 3px solid @primaryColor;
          color: @primaryColor;
          display: flex;
          align-items: center;
        }
        &.read-all {
          position: absolute;
          right: 24px;
          font-size: 12px;
          color: rgba(17, 18, 24, 0.5);
          cursor: pointer;
        }
        &:hover {
          color: @primaryColor;
        }
        span {
          min-width: 16px;
          height: 16px;
          background: #ff5219;
          color: #fff;
          border-radius: 12px;
          border: 1px solid rgba(17, 18, 24, 0.1);
          display: inline-block;
          font-weight: 400;
          line-height: 14px;
          text-align: center;
          margin-left: 8px;
          padding: 0 2px;
          font-size: 10px;
        }
      }
    }
  }
}

.workbench-wrapper {
  height: 100%;
  overflow: auto;
  background: #f1f2f6;
  color: @black;
  .workbench-wrapper-in {
    padding-top: 28px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    .header {
      display: flex;
      justify-content: space-between;
      height: 32px;
      justify-items: center;
      min-width: 1000px;
      width: 80%;
      max-width: 1600px;
      margin: 0 auto;
      margin-left: auto;
      margin-right: auto;
      .left {
        display: flex;
        align-items: center;
        font-size: 12px;

        .address {
          margin-right: 16px;
          span:first-child {
            color: rgba(17, 18, 24, 0.5);
          }
        }
        .total,
        .show {
          span {
            color: @primaryColor;
          }
        }
      }
    }

    .empty {
      margin-top: 218px;
    }

    .list-wrapper {
      height: 100%;
      overflow: overlay;
      padding-bottom: 16px;
      padding-left: 16px;
      &::-webkit-scrollbar-track {
        background: #f1f2f6;
      }

      .loaded-all {
        font-size: 12px;
        text-align: center;
        line-height: 17px;
        margin-top: 24px;
        color: rgba(17, 18, 24, 0.5);
      }

      .notices-ground {
        margin-top: 20px;
        margin-bottom: 26px;
        p {
          font-size: 12px;
          color: #111218;
          margin-bottom: 10px;
        }
      }
      .tips-item {
        margin-right: 16px;
        padding-top: 7px;
        padding-bottom: 4px;
        padding-left: 6px;
        margin-top: 0;
        &:hover {
          background-color: #f9f9f9;
          border-radius: 2px;
        }
      }
    }
  }
}
</style>

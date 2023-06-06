<template>
  <transition name="move">
    <div v-show="moveIn" class="container">
      <div class="search-bar">
        <div class="search-bar-in">
          <div class="search-box">
            <div class="left">
              <a-input
                v-model="wd"
                :placeholder="
                  $t('cloudpivot.application.pc.searchBox.inputSearch')
                "
                style="width: 904px; height: 48px"
                @keydown.enter="toSearch"
              />
              <!-- <i v-if="!wd" class="icon aufontAll h-icon-all-search"></i> -->
              <a-icon v-if="!wd" class="search" type="search" />
              <i
                v-else
                class="search-icon icon aufontAll h-icon-all-flow-cancel"
                @click="wd = ''"
              ></i>
            </div>
            <div class="right btn" @click="toSearch">
              {{ $t('cloudpivot.application.pc.searchBox.search') }}
            </div>
          </div>

          <div v-if="isSearched" class="tab">
            <span
              :class="{ active: showMoreType === 'ALL' }"
              @click="changeMoreType('ALL')"
              >{{ $t('cloudpivot.application.pc.searchBox.all') }}</span>
            <span
              :class="{ active: showMoreType === 'APP' }"
              @click="changeMoreType('APP')"
              >{{ $t('cloudpivot.application.pc.searchBox.application') }}</span>
            <span
              :class="{ active: showMoreType === 'MODEL' }"
              @click="changeMoreType('MODEL')"
              >{{ $t('cloudpivot.application.pc.searchBox.model') }}</span>
            <span
              :class="{ active: showMoreType === 'FLOW' }"
              @click="changeMoreType('FLOW')"
              >{{ $t('cloudpivot.application.pc.searchBox.workflow') }}</span>
            <span
              :class="{ active: showMoreType === 'MESSAGE' }"
              @click="changeMoreType('MESSAGE')"
              >{{
                $t('cloudpivot.application.pc.searchBox.notification')
              }}</span>
          </div>
        </div>
      </div>

      <div v-if="isSearched" class="search-resulte-box">
        <template v-if="!isShowMoreOpen">
          <!-- 应用 -->
          <div
            v-show="['APP', 'ALL'].includes(showMoreType) && appTotal !== 0"
            class="res-item"
          >
            <div class="head">
              <div class="head-in">
                <div class="left">
                  <h3 v-if="showMoreType !== 'APP'">
                    {{ $t('cloudpivot.application.pc.searchBox.application') }}
                  </h3>
                  <div>
                    {{ $t('cloudpivot.application.pc.searchBox.total')
                    }}<span> {{ appTotal }} </span>{{ $t('cloudpivot.application.pc.searchBox.results') }}
                  </div>
                </div>
                <span
                  v-show="showMoreType !== 'APP' && appTotal > 5"
                  class="more"
                  @click="toShowMore('APP')"
                >
                  {{ $t('cloudpivot.application.pc.searchBox.more') }}
                  <i class="icon aufontAll h-icon-all-right-o"></i>
                </span>
              </div>
            </div>

            <div class="content app">
              <div class="content-in">
                <template>
                  <div
                    v-for="(item, index) in showApps"
                    :key="index"
                    class="app-item"
                    :class="{ marginB8: showMoreType === 'APP' }"
                    @click.stop="goto('app', item)"
                  >
                    <div class="icon-wrapper">
                      <svg
                        class="tabs-app-li-icon icon svgIcon"
                        aria-hidden="true"
                      >
                        <use xlink:href="#h-icon-all-application1" />
                      </svg>
                    </div>

                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <div
                      class="name"
                      v-html="
                        queryTitleLight(
                          isChinese
                            ? item.name
                            : (item.name_i18n && item.name_i18n.en) ||
                                (JSON.parse(item.name_i18n) &&
                                  JSON.parse(item.name_i18n).en),
                        )
                      "
                    ></div>
                  </div>
                </template>
                <template v-if="showApps.length < 5">
                  <div
                    v-for="i in 5 - showApps.length"
                    :key="i + '_id'"
                    class="app-item app-hidden"
                  ></div>
                </template>
              </div>
            </div>
          </div>

          <!-- 模型 -->
          <div
            v-show="['MODEL', 'ALL'].includes(showMoreType) && modelTotal !== 0"
            class="res-item"
          >
            <div class="head">
              <div class="head-in">
                <div class="left">
                  <h3 v-if="showMoreType !== 'MODEL'">
                    {{ $t('cloudpivot.application.pc.searchBox.model') }}
                  </h3>
                  <div>
                    {{ $t('cloudpivot.application.pc.searchBox.total')
                    }}<span> {{ modelTotal }} </span>{{ $t('cloudpivot.application.pc.searchBox.results') }}
                  </div>
                </div>
                <span
                  v-show="showMoreType !== 'MODEL' && modelTotal > 4"
                  class="more"
                  @click="toShowMore('MODEL')"
                >
                  {{ $t('cloudpivot.application.pc.searchBox.more') }}
                  <i class="icon aufontAll h-icon-all-right-o"></i>
                </span>
              </div>
            </div>

            <div class="content model">
              <div class="content-in">
                <template>
                  <div
                    v-for="(item, index) in showModels"
                    :key="index"
                    class="model-item"
                    :class="{ marginB8: showMoreType === 'MODEL' }"
                    @click="goto('model', item)"
                  >
                    <div class="infos">
                      <div class="icon-wrapper">
                        <template v-if="item.icon">
                          <span
                            class="icon aufontAll"
                            :class="item.icon"
                          ></span>
                        </template>
                        <template v-else>
                          <span
                            class="icon aufontAll h-icon-all-catalogue-o"
                          ></span>
                        </template>
                      </div>
                      <!-- eslint-disable-next-line vue/no-v-html -->
                      <div
                        class="name"
                        v-html="queryTitleLight(item.name)"
                      ></div>
                    </div>
                    <p>
                      {{
                        $t(
                          'cloudpivot.application.pc.searchBox.owningApplication',
                        )
                      }}{{ getApplication(item.appCode) }}
                    </p>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- 流程：我的待办 -->
          <div
            v-show="['FLOW', 'ALL'].includes(showMoreType) && flowTotal !== 0"
            class="res-item"
          >
            <div class="head">
              <div class="head-in">
                <div class="left">
                  <h3 v-if="showMoreType !== 'FLOW'">
                    {{ $t('cloudpivot.application.pc.searchBox.toDoTask') }}
                  </h3>
                  <div>
                    {{ $t('cloudpivot.application.pc.searchBox.total')
                    }}<span> {{ flowTotal }} </span>{{ $t('cloudpivot.application.pc.searchBox.results') }}
                  </div>
                </div>
                <span
                  v-show="showMoreType !== 'FLOW' && flowTotal > 2"
                  class="more"
                  @click="toShowMore('FLOW')"
                >
                  {{ $t('cloudpivot.application.pc.searchBox.more') }}
                  <i class="icon aufontAll h-icon-all-right-o"></i>
                </span>
              </div>
            </div>

            <div class="content flow">
              <div class="content-in">
                <PageData :listData="showFlows" :batch="false" :wd="wd" />
              </div>
            </div>
          </div>

          <!-- 消息通知 -->
          <div
            v-show="
              ['MESSAGE', 'ALL'].includes(showMoreType) && noticeTotal !== 0
            "
            class="res-item"
          >
            <div class="head">
              <div class="head-in">
                <div class="left">
                  <h3 v-if="showMoreType !== 'MESSAGE'">
                    {{ $t('cloudpivot.application.pc.searchBox.notification') }}
                  </h3>
                  <div>
                    {{ $t('cloudpivot.application.pc.searchBox.total')
                    }}<span> {{ noticeTotal }} </span>{{ $t('cloudpivot.application.pc.searchBox.results') }}
                  </div>
                </div>
                <span
                  v-show="showMoreType !== 'MESSAGE' && noticeTotal > 2"
                  class="more"
                  @click="toShowMore('MESSAGE')"
                >
                  {{ $t('cloudpivot.application.pc.searchBox.more') }}
                  <i class="icon aufontAll h-icon-all-right-o"></i>
                </span>
              </div>
            </div>

            <div class="content notice">
              <div class="content-in">
                <template>
                  <template v-for="(item, index) in showNotices">
                    <tips-item
                      :key="index"
                      :wd="wd"
                      :isShowInfo="true"
                      infosWidth="860px"
                      :item="item"
                    />
                  </template>
                </template>
              </div>
            </div>
          </div>
        </template>

        <!-- 展示更多内容 -->
        <div v-if="isShowMoreOpen" class="show-more-box">
          <!-- 应用 -->
          <div v-show="['APP'].includes(showMoreType)" class="res-item">
            <div class="head">
              <div class="head-in">
                <div class="left">
                  <!-- <h3>应用</h3> -->
                  <div>
                    {{ $t('cloudpivot.application.pc.searchBox.total') }}
                    <span>{{ appTotal }}</span>
                    {{ $t('cloudpivot.application.pc.searchBox.results') }}
                  </div>
                </div>
              </div>
            </div>
            <div class="content app">
              <div class="content-in">
                <div class="content-inner">
                  <template>
                    <div
                      v-for="(item, index) in showApps"
                      :key="index"
                      class="app-item"
                      :class="{ marginB8: showMoreType === 'APP' }"
                      @click.stop="goto('app', item)"
                    >
                      <div class="icon-wrapper">
                        <svg
                          class="tabs-app-li-icon icon svgIcon"
                          aria-hidden="true"
                        >
                          <use xlink:href="#h-icon-all-application1" />
                        </svg>
                      </div>
                      <!-- eslint-disable-next-line vue/no-v-html -->
                      <div
                        class="name"
                        v-html="
                          queryTitleLight(
                            isChinese
                              ? item.name
                              : (item.name_i18n && item.name_i18n.en) ||
                                  (JSON.parse(item.name_i18n) &&
                                    JSON.parse(item.name_i18n).en),
                          )
                        "
                      ></div>
                    </div>

                    <div
                      v-for="i in showApps.length % 5 !== 0
                        ? 5 - (showApps.length % 5)
                        : 0"
                      :key="i"
                      class="app-item empty-app-item"
                    ></div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- 模型 -->
          <div v-show="['MODEL'].includes(showMoreType)" class="res-item">
            <div class="head">
              <div class="head-in">
                <div class="left">
                  <!-- <h3>模型</h3> -->
                  <div>
                    {{ $t('cloudpivot.application.pc.searchBox.total') }}
                    <span>{{ modelTotal }}</span>
                    {{ $t('cloudpivot.application.pc.searchBox.results') }}
                  </div>
                </div>
              </div>
            </div>

            <div class="content model" @scroll="handleInfiniteOnLoad">
              <div class="content-in">
                <div class="content-inner">
                  <template>
                    <div
                      v-for="(item, index) in showModels"
                      :key="index"
                      class="model-item"
                      :class="{ marginB8: showMoreType === 'MODEL' }"
                      @click="goto('model', item)"
                    >
                      <div class="infos">
                        <div class="icon-wrapper">
                          <template v-if="item.icon">
                            <span
                              class="icon aufontAll"
                              :class="item.icon"
                            ></span>
                          </template>
                          <template v-else>
                            <span
                              class="icon aufontAll h-icon-all-catalogue-o"
                            ></span>
                          </template>
                        </div>
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <div
                          class="name"
                          v-html="queryTitleLight(item.name)"
                        ></div>
                      </div>
                      <p>
                        {{
                          $t(
                            'cloudpivot.application.pc.searchBox.owningApplication',
                          )
                        }}{{ item.appName }}
                      </p>
                    </div>

                    <div
                      v-for="i in showModels.length % 4 !== 0
                        ? 4 - (showModels.length % 4)
                        : 0"
                      :key="i"
                      class="model-item empty-model-item"
                    ></div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- 流程：我的待办 -->
          <div v-show="['FLOW'].includes(showMoreType)" class="res-item">
            <div class="head">
              <div class="head-in">
                <div class="left">
                  <!-- <h3>【流程】我的待办</h3> -->
                  <div>
                    {{ $t('cloudpivot.application.pc.searchBox.total') }}
                    <span>{{ flowTotal }}</span>
                    {{ $t('cloudpivot.application.pc.searchBox.results') }}
                  </div>
                </div>
              </div>
            </div>

            <div class="content flow" @scroll="handleInfiniteOnLoad">
              <div class="content-in">
                <div class="content-inner">
                  <PageData :listData="showFlows" :batch="false" :wd="wd" />
                </div>
              </div>
            </div>
          </div>

          <!-- 消息通知 -->
          <div v-show="['MESSAGE'].includes(showMoreType)" class="res-item">
            <div class="head">
              <div class="head-in">
                <div class="left">
                  <div class="notice-tab">
                    <span
                      :class="{ active: messageType === 'STATION' }"
                      @click="messageTypeChange('STATION')"
                      >{{
                        $t('cloudpivot.application.pc.searchBox.Notifications')
                      }}</span>
                    <span
                      :class="{ active: messageType === 'COMMENT' }"
                      @click="messageTypeChange('COMMENT')"
                      >{{
                        $t('cloudpivot.application.pc.searchBox.AltAndReply')
                      }}</span>
                  </div>
                  <div>
                    {{ $t('cloudpivot.application.pc.searchBox.total') }}
                    <span>{{ noticeTotal }}</span>
                    {{ $t('cloudpivot.application.pc.searchBox.results') }}
                  </div>
                </div>
              </div>
            </div>

            <div class="content notice" @scroll="handleInfiniteOnLoad">
              <div class="content-in">
                <div class="content-inner">
                  <template>
                    <template v-for="(item, index) in showNotices">
                      <tips-item
                        :key="index"
                        infosWidth="860px"
                        :wd="wd"
                        :isShowInfo="true"
                        :item="item"
                      />
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template
          v-if="
            appTotal + noticeTotal + modelTotal + flowTotal === 0 && !isLoading
          "
        >
          <div :class="'empty-data ' + showMoreType">
            <img src="./../assets/empty-img.png" alt="" />
            <p>
              {{ $t('cloudpivot.application.pc.searchBox.noSearchResult') }}
            </p>
          </div>
        </template>
        <div v-if="isLoading" class="spin-wrapper">
          <span></span>
          {{ $t('cloudpivot.application.pc.searchBox.searching') }}
        </div>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Input, Spin } from '@h3/antd-vue';
import common from '../../../../../common/pc';
import AuthorAvatarInfo from './../../../../../common/src/components/pc/author-avatar-info/author-avatar-info.vue';
import moment from 'moment';
import { workbenchApi } from '../../../../../api';
import tipsItem from './tipsItem.vue';
@Component({
  name: 'SearchResulte',
  components: {
    AInput: Input,
    PageNoData: common.components.PageNoData,
    PageData: common.components.PageData,
    AuthorAvatarInfo,
    tipsItem,
    ASpin: Spin,
  },
})
export default class SearchResulte extends Vue {
  wd: string = ''; // 搜索内容

  @Prop({ default: true }) moveIn!: boolean;

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  messageType: string = 'STATION'; // STATION: 站内，COMMENT：@和回复我的

  messageTypeChange(type: string) {
    this.messageType = type;
    if (this.tab === 'MESSAGE') {
      this.reset();
      this.paltformSearch();
    }
  }

  isSearched: boolean = false; // 是否搜索过

  searchword: string = '';

  size: number = 20;

  page: number = 1;

  tab: string = 'ALL'; //APP:应用，MODEL模型，FLOW：流程待办， MESSAGE：消息通知，ALL：所有

  toSearch() {
    this.reset();
    this.paltformSearch();
    this.isSearched = true;
  }

  isShowMoreOpen: boolean = false; // 查看更多

  toShowMore(type: string) {
    this.showMoreType = type;
    this.isShowMoreOpen = true;
    this.tab = type;
    this.reset();
    this.paltformSearch();
  }

  getApplication(appCode) {
    const item = this.allApps.filter((item: any) => {
      return item.code === appCode;
    });
    return this.isChinese
      ? item[0] && item[0].name
      : item[0] &&
          ((item[0].name_i18n && item[0].name_i18n.en) ||
            (JSON.parse(item[0].name_i18n) &&
              JSON.parse(item[0].name_i18n).en));
  }

  timer: any = null;

  isLoading: boolean = false;

  /**
   * 滚动加载
   */
  handleInfiniteOnLoad(e) {
    const boxHeight = e.target.getBoundingClientRect().height;
    const scrollTop = e.target.scrollTop;
    const scrollHeight = e.target.scrollHeight;
    if (scrollHeight - scrollTop - boxHeight <= 150 && !this.isLoading) {
      if (this.tab === 'FLOW' && this.flows.length < this.flowTotal) {
        this.banchLoadMore();
      }
      if (this.tab === 'MESSAGE' && this.notices.length < this.noticeTotal) {
        this.banchLoadMore();
      }

      if (this.tab === 'MODEL' && this.models.length < this.modelTotal) {
        this.banchLoadMore();
      }
    }
  }

  banchLoadMore() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page = this.page + 1;
      this.paltformSearch();
    }, 100);
  }

  allApps: any[] = [];

  async paltformSearch() {
    this.isLoading = true;
    const res: any = await workbenchApi.paltformSearch({
      searchword: this.wd,
      size: this.size,
      page: this.page,
      tab: this.tab,
      messageType: this.tab === 'MESSAGE' ? this.messageType : '',
      // readState: 'UNREADED'
    });
    if (res.errcode === 0) {
      if (['ALL', 'APP'].includes(this.tab)) {
        this.allApps = res.data.APP;
        this.apps = res.data.APP.filter((el) => {
          if (this.isChinese) {
            return el.name.indexOf(this.wd) > -1;
          } else {
            return JSON.parse(el.name_i18n).en.indexOf(this.wd) > -1;
          }
        });
        this.appTotal = this.apps.length;
      }
      if (['ALL', 'FLOW'].includes(this.tab)) {
        if (this.page === 0) {
          this.flows = res.data.FLOW.content;
        } else {
          this.flows = [...this.flows, ...res.data.FLOW.content];
        }

        this.flowTotal = res.data.FLOW.totalElements;
      }
      if (['ALL', 'MODEL'].includes(this.tab)) {
        if (this.page === 0) {
          this.models = res.data.MODEL.content;
        } else {
          this.models = [...this.models, ...res.data.MODEL.content];
        }
        this.modelTotal = res.data.MODEL.totalElements;
      }

      if (['ALL', 'MESSAGE'].includes(this.tab)) {
        res.data.MESSAGE.content.forEach((el: any) => {
          if (!el.senderVO) {
            el.senderVO = {};
          }
        });

        if (this.page === 0) {
          this.notices = res.data.MESSAGE.content;
        } else {
          this.notices = [...this.notices, ...res.data.MESSAGE.content];
        }
        this.noticeTotal = res.data.MESSAGE.totalElements;
      }
    }
    this.isLoading = false;
  }

  goto(type, item) {
    if (type === 'app') {
      this.$emit('goToDetail', item);
    } else if (type === 'model') {
      const rel = window.location.href
        .split('?')[0]
        .indexOf('application-list');
      this.$router.push(
        `/application/${item.appCode || item.code}/application-list/${
          item.schemaCode ? item.schemaCode : item.code
        }`,
      );
      if (rel !== -1) {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } else {
      //Else Empty block statement
    }

    this.$emit('close');
  }

  /**
   * 高亮
   */
  queryTitleLight(titleInfo) {
    if (!titleInfo) {
      return;
    }
    const strReturn = titleInfo.replace(
      new RegExp(this.wd, 'g'),
      `<span class="highlights">${this.wd}</span>`,
    );
    return strReturn;
  }

  showMoreType: string = 'ALL';

  reset() {
    this.page = 0;
    if (['MODEL', 'MESSAGE'].includes(this.showMoreType)) {
      this.size = 60;
    } else {
      this.size = 10;
    }
    this.apps = [];
    this.appTotal = 0;
    this.flows = [];
    this.flowTotal = 0;
    this.notices = [];
    this.noticeTotal = 0;
    this.models = [];
    this.modelTotal = 0;
  }

  // 搜索类型改变
  changeMoreType(type) {
    this.showMoreType = type;
    this.tab = type;
    this.isShowMoreOpen = type !== 'ALL';
    this.reset();
    this.paltformSearch();
    // 去请求数据
  }

  // 应用
  apps: any[] = [];

  appTotal: number = 0;

  get showApps() {
    if (this.isShowMoreOpen) {
      return this.apps;
    } else {
      return this.apps.slice(0, 5);
    }
  }

  // 模型
  models: any[] = [];

  modelTotal: number = 0;

  get showModels() {
    if (this.isShowMoreOpen) {
      return this.models;
    } else {
      return this.models.slice(0, 4);
    }
  }

  // 流程：待办
  flows: any[] = [];

  flowTotal: number = 0;

  get showFlows() {
    if (this.isShowMoreOpen) {
      return this.flows;
    } else {
      return this.flows.slice(0, 2);
    }
  }

  // 消息通知
  notices: any[] = [];

  noticeTotal: number = 0;

  get showNotices() {
    if (this.isShowMoreOpen) {
      return this.notices;
    } else {
      return this.notices.slice(0, 2);
    }
  }

  stateMap: any = {
    PROCESSING: '进行中',
    COMPLETED: '已完成',
    CANCELED: '作废',
    EXCEPTION: '异常',
  };

  formatTime(time) {
    const now = new Date();
    const diffTime = now.getTime() - time;
    if (diffTime <= 5 * 60 * 1000) {
      return '刚刚';
    }
    if (diffTime <= 10 * 60 * 1000) {
      return '5分钟前';
    }
    if (diffTime <= 30 * 60 * 1000) {
      return '10分钟前';
    }

    return moment(time).format('YYYY-MM-DD HH:mm');
  }
}
</script>

<style lang="less" scoped>
@import './../style/custom-themes';
.spin-wrapper {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding-left: 20px;
  font-size: 14px;
  color: #111218;
  line-height: 13px;
  span {
    position: absolute;
    width: 13px;
    height: 13px;
    border-left: 1px solid @primaryColor;
    border-top: 1px solid @primaryColor;
    border-bottom: 2px solid transparent;
    border-right: 2px solid transparent;
    border-radius: 7px;
    left: 0;
    animation: rotate 400ms linear infinite;
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all ease-in 0.3s;
  min-width: 1250px;
  color: #111218;
  h3 {
    color: #111218;
  }
}
.move-enter {
  margin-top: -600px;
  opacity: 0;
}
.move-leave-active {
  margin-top: -600px;
  opacity: 0;
}

.grey {
  color: rgba(17, 18, 24, 0.5);
}
.ant-popover-inner-content .container {
  color: #111218;
}
.search-bar {
  background-color: #fff;
  padding-top: 26px;
  display: flex;
  .search-bar-in {
    min-width: 1000px;
    width: 80%;
    margin: 0 auto;
    .search-box {
      display: flex;
      justify-content: space-between;
      max-width: 1600px;
      margin: 0 auto 26px;
      .left {
        position: relative;
        flex: 1;
        margin-right: 20px;
        input {
          width: 100% !important;
        }
      }
      .right {
        width: 80px;
        height: 48px;
        background-color: @highlightColor;
        border-radius: 2px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        line-height: 48px;
        text-align: center;
        &:hover {
          background-color: @borderColor;
          color: #fff;
          cursor: pointer;
        }
      }
      input {
        height: 48px;
        padding-right: 46px;
        padding-left: 24px;
        font-size: 16px;
      }
      i {
        position: absolute;
        right: 24px;
        font-size: 14px;
        color: rgba(17, 18, 24, 0.25);
        margin: 0;
        top: 15px;
        &.search-icon:hover {
          color: rgba(17, 18, 24, 0.45);
        }
        &.search {
          font-size: 20px;
        }
      }
    }
    .tab {
      padding-top: 14px;
      margin-left: 24px;
      margin: 0 auto 15px;
      max-width: 1600px;
      span {
        display: inline-block;
        width: 80px;
        height: 32px;
        line-height: 32px;
        border-radius: 2px;
        text-align: center;
        margin-right: 16px;
        cursor: pointer;
        &:hover {
          color: @primaryColor;
          &.active {
            color: #fff;
          }
        }
        &.active {
          background-color: @primaryColor;
          color: #fff;
        }
      }
    }
  }
}

.search-resulte-box {
  flex: 1;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  &::-webkit-scrollbar-track {
    background: #f1f2f6;
  }

  .res-item {
    margin: 20px auto 28px;
    .head {
      padding: 0 10%;
      .head-in {
        display: flex;
        justify-content: space-between;
        max-width: 1600px;
        margin: 0 auto;
      }
      .left {
        display: flex;
        align-items: flex-end;
        h3 {
          font-size: 18px;
          font-weight: 600;
          line-height: 26px;
          margin: 0;
        }
        div {
          font-size: 12px;
          line-height: 20px;
          color: rgba(17, 18, 24, 0.5);
          display: inline-block;
          margin-left: 8px;
          span {
            color: @highlightColor;
          }
        }
      }
      .more {
        white-space: nowrap;
        font-size: 14px;
        color: rgba(17, 18, 24, 0.5);
        display: flex;
        align-items: center;
        line-height: 18px;
        &:hover {
          color: @highlightColor;
        }
        cursor: pointer;
        i {
          font-size: 12px;
          margin-left: 4px;
        }
      }
    }
    .content {
      margin-top: 10px;
      display: flex;
      padding: 0 10%;
      width: 100%;
      .content-in {
        display: flex;
        max-width: 1600px;
        margin: 0 auto;
        width: 100%;
        flex-wrap: wrap;
      }

      &.app {
        display: flex;
        justify-items: flex-start;
        flex-wrap: wrap;
        .app-item {
          flex: 1;
          min-width: 18%;
          height: 40px;
          background-color: #fff;
          border-radius: 2px;
          padding: 12px 16px;
          display: flex;
          margin-right: 16px;
          align-items: center;
          cursor: pointer;
          &.app-hidden {
            opacity: 0;
            pointer-events: none;
          }
          &:hover {
            box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
          }
          &:nth-child(5n + 5) {
            margin-right: 0;
          }
          &.marginB8 {
            margin-bottom: 16px;
          }
          .icon-wrapper {
            width: 16px;
            height: 16px;
            border-radius: 2px;
            border: 1px solid #eee;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;

            span {
              color: @highlightColor;
              font-size: 16px;
            }
            svg {
              width: 12px;
              height: 12px;
            }
          }
          .name {
            line-height: 20px;
            font-size: 14px;
            white-space: nowrap;
            width: 128px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .empty-app-item {
          background-color: transparent;
          pointer-events: none;
        }
      }

      &.model {
        display: flex;
        justify-items: flex-start;
        flex-wrap: wrap;
        .model-item {
          min-width: 22%;
          flex: 1;
          height: 94px;
          background-color: #fff;
          border-radius: 2px;
          padding: 24px 20px;
          margin-right: 16px;
          align-items: center;
          cursor: pointer;
          &:nth-child(4n + 4) {
            margin-right: 0;
          }
          &:hover {
            box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
          }
          &.marginB8 {
            margin-bottom: 16px;
          }
          .infos {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            .icon-wrapper {
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 10px;
              span {
                color: @highlightColor;
                font-size: 16px;
              }
              img {
                width: 16px;
              }
            }
            .name {
              line-height: 22px;
              white-space: nowrap;
              width: 172px;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
          p {
            font-size: 12px;
            color: rgba(17, 18, 24, 0.5);
            line-height: 20px;
          }
        }
        .empty-model-item {
          background-color: transparent;
          pointer-events: none;
        }
      }

      &.notice {
        display: flex;
        justify-items: flex-start;
        flex-wrap: wrap;
        .tips-item {
          flex: 1;
          width: 80%;
        }
      }
      &.flow {
        .page-data {
          max-width: 100%;
          min-width: 100%;
        }
      }
    }
  }

  .show-more-box {
    width: 100%;
    height: calc(100% - 20px);
    .res-item {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .head {
      width: 100%;
      margin: 0 auto 10px;
    }
    .content {
      margin: 0 auto;
      overflow-x: hidden;
      flex: 1;
      overflow-y: auto;
      .content-inner {
        width: 100%;
        margin: 0 auto;
        display: flex;
        justify-items: flex-start;
        flex-wrap: wrap;
        align-content: flex-start;
      }
      &.app {
        align-content: start;
      }
    }

    .notice .content-inner {
      width: 100%;
      margin: 0 auto;
      display: block;
    }
    .notice-tab {
      height: 32px;
      background: #e0e1e7;
      border-radius: 2px;
      padding: 3px;
      display: flex;
      margin-left: -4px !important;
      span {
        font-size: 12px;
        padding: 0 6px;
        color: #111218 !important;
        width: 88px;
        text-align: center;
        cursor: pointer;
        &.active {
          background-color: #fff;
          border-radius: 2px;
          font-weight: 600;
        }
        &:active {
          background-color: transparent !important;
        }
      }
    }

    .res-item .content.notice {
      padding-block: 16px;
      .tips-item {
        width: 100%;
      }
    }
  }
}
.search-resulte-box .show-more-box .res-item .head .left div span {
  display: inline-block;
  line-height: 26px;
  &:active {
    background-color: #fff;
    border-radius: 2px;
  }
}

/**
    滚动条内槽  
  */

.app-containner-right-box::-webkit-scrollbar-thumb {
  width: 6px;
  background-color: rgba(17, 18, 24, 0.25);
  border-radius: 3px;
}

.content::-webkit-scrollbar-track {
  background: #f1f2f6;
}
/**
   滚动条外层轨道
  */
.app-containner-right-box::-webkit-scrollbar-track {
  background-color: transparent;
}
/deep/ .highlights {
  color: @highlightColor !important;
}

.empty-data {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &.APP,
  &.MODEL {
    height: calc(100% - 84px - 102px);
  }
  &.FLOW {
    height: calc(100% - 105px - 102px);
  }
  &.MESSAGE {
    height: calc(100% - 122px - 102px);
  }
  img {
    width: 204px;
  }
  p {
    font-size: 14px;
    line-height: 22px;
    color: rgba(17, 18, 24, 0.5);
  }
}
</style>

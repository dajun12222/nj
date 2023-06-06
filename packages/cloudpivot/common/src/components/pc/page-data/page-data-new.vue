<!--
 * @Descripttion: 公共table页
 * @version: v6.8
 * @Author: baidongsheng
 * @Date: 2021-10-20 16:28:20
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-02-21 17:43:11
-->

<template>
  <div class="page-data">
    <div v-show="batch && listData.length > 0" class="all-close">
      <a-checkbox
        :indeterminate="indeterminate"
        :checked="checkAll"
        @change="onCheckAllChange"
      >
        {{ $t('cloudpivot.flowCenter.pc.selectAll') }}
      </a-checkbox>
    </div>

    <!-- 表单列表 -->
    <a-checkbox-group v-model="checkedList" @change="onChange">
      <ul>
        <li
          v-for="(item, index) in listData"
          :key="index"
          :class="type === 1 && !item.sequenceNo ? 'li__active' : ''"
          @click.stop="openDetail(item)"
        >
          <!-- 开启了应用门户才会显示 -->
          <div
            v-if="openApplicationPortal && item.containerName"
            class="portal-info"
            :title="item.containerName"
          >
            {{ item.containerName }}
          </div>

          <div class="li-left" @click.stop="returnClick">
            <span v-show="!batch">{{ index + 1 }}</span>
            <a-checkbox v-show="batch" :value="item" />
          </div>

          <div class="li-center-title-box">
            <div style="position: relative; display: flex; width: 100%">
              <div
                class="li-center-title"
                :class="item.isRead ? 'gray' : ''"
                :title="item.instanceName"
                v-html="queryTitleLight(item.instanceName)"
              >
                {{ item.instanceName }}
              </div>
              <div
                v-if="
                  (type === 1 ||
                    type === 3 ||
                    type === 5 ||
                    type === 7 ||
                    type === 8) &&
                  ((item.workItemTrust &&
                    item.workItemTrust.trustor &&
                    !item.workItemTrust.currentTrustor) ||
                    (item.isTrustStart && !item.isTrustor))
                "
                class="li-center-list-hint"
                :class="item.instanceName.length > 20 ? 'hint-left' : ''"
              >
                {{ $t('cloudpivot.flowCenter.pc.entrusted') }}
              </div>
              <div
                v-else-if="
                  (type === 1 ||
                    type === 3 ||
                    type === 5 ||
                    type === 7 ||
                    type === 8) &&
                  ((item.workItemTrust &&
                    item.workItemTrust.trustor &&
                    item.workItemTrust.currentTrustor) ||
                    (item.isTrustStart && item.isTrustor))
                "
                class="li-center-list-hint"
                :class="item.instanceName.length > 20 ? 'hint-left' : ''"
              >
                {{ $t('cloudpivot.flowCenter.pc.delegationProcess') }}
              </div>
            </div>
          </div>

          <!-- <a-tooltip placement="bottom" v-else>
            <template slot="title"> {{ item.instanceName }} </template>
            <div class="li-center-title" :class="item.isRead ? 'gray' : ''">
              {{ item.instanceName }}
            </div>
          </a-tooltip> -->

          <div class="li-center-list">
            <div
              class="li-center-list-li-02"
              :class="type === 5 ? 'li-center-list-li-position' : ''"
            >
              <span style="min-width: 48px">
                {{ $t('cloudpivot.flowCenter.pc.sequenceNo') }}：
              </span>
              <span class="cn" :title="item.sequenceNo || '--'">{{
                item.sequenceNo || '--'
              }}</span>
              <!-- <a-tooltip placement="bottom">
                <template slot="title">
                  {{ item.sequenceNo || "--" }}
                </template>
                <span class="cn">{{ item.sequenceNo || "--" }}</span>
              </a-tooltip> -->
            </div>

            <div v-if="type === 1" class="li-center-list-li residence">
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.stayTime') }}：
              </span>
              <span class="cn stop-time">{{ item.stayTimeStr }}</span>
              <div v-if="item.workItemTimeoutStatus === 'TIMEOUT'" class="hint">
                {{ $t('cloudpivot.flowCenter.pc.overtime') }}
              </div>

              <div
                v-if="
                  item.workItemTimeoutStatus === 'RED' ||
                  item.workItemTimeoutStatus === 'ORANGE'
                "
                class="hint staytimeHint"
                :class="item.workItemTimeoutStatus === 'RED' ? 'red' : ''"
              >
                <a-tooltip placement="bottom">
                  <template slot="title"> {{ item.stayTimeStrHint }} </template>
                  {{ $t('cloudpivot.flowCenter.pc.aboutToTimeout') }}
                </a-tooltip>
              </div>

              <div v-if="item.urgeCount > 0" class="hint">
                催+{{ item.urgeCount }}
              </div>
            </div>

            <div
              v-else-if="type === 7 && instanceState === 'COMPLETED'"
              class="li-center-list-li"
            >
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.finishedTime') }}：
              </span>
              <span class="cn">{{ item.finishTime }}</span>
            </div>

            <div
              v-else-if="
                type === 2 ||
                type === 4 ||
                (type === 8 &&
                  (instanceState === 'NOTSTARTED' ||
                    instanceState === 'INPROGRESS'))
              "
              class="li-center-list-li"
            >
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.reciveTime') }}：
              </span>
              <span class="cn">{{ item.startTime }}</span>
            </div>

            <div v-else-if="type === 3" class="li-center-list-li">
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.curActivity') }}：
              </span>
              <span class="cn">{{ item.activityName }}</span>
            </div>

            <div
              v-else-if="
                type === 5 && instanceState === 'PROCESSING,EXCEPTION,DRAFT'
              "
              class="li-center-list-li"
            >
              <span v-if="item.costTime" style="min-width: 36px">
                {{ $t('cloudpivot.flowCenter.pc.costTime') }}：
              </span>
              <span v-else style="min-width: 48px">
                {{ $t('cloudpivot.flowCenter.pc.usedTime') }}：
              </span>
              <span class="cn">{{ item.costTime || item.stayTimeStr }}</span>
            </div>

            <div
              v-else-if="
                (type === 5 &&
                  instanceState !== 'PROCESSING,EXCEPTION,DRAFT') ||
                (type === 7 &&
                  instanceState !== '' &&
                  instanceState !== 'COMPLETED') ||
                (type === 8 && instanceState === 'CANCELLED')
              "
              class="li-center-list-li"
            >
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.initiationTime') }}：
              </span>
              <span class="cn">{{ item.startTime }}</span>
            </div>

            <div
              v-else-if="type === 7 && !instanceState"
              class="li-center-list-li"
            >
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.flowStatus') }}：
              </span>
              <span class="cn">{{ item.stateTxt }}</span>
            </div>

            <div
              v-if="type === 8 && instanceState === 'FINISHED'"
              class="li-center-list-li"
            >
              <span style="min-width: 48px">
                {{ $t('cloudpivot.flowCenter.pc.resolver') }}：
              </span>
              <AuthorAvatarInfo
                :item="{
                  sourceId:
                    item.participant || item.participants.id || item.originator,
                  imgUrl: item.participantImgUrl,
                  sourceName: item.participantName || item.originatorName,
                }"
                style="overflow: hidden"
              />
            </div>

            <div v-if="type !== 5" class="li-center-list-li-02">
              <span style="min-width: 48px">
                {{ $t('cloudpivot.flowCenter.pc.originatorName') }}：
              </span>
              <AuthorAvatarInfo
                :item="{
                  sourceId: item.originator,
                  imgUrl: item.imgUrl,
                  sourceName: item.originatorName,
                }"
                style="overflow: hidden"
              />
            </div>

            <div
              v-if="
                (type === 5 &&
                  instanceState === 'PROCESSING,EXCEPTION,DRAFT') ||
                (type === 7 && instanceState === 'PROCESSING') ||
                (type === 8 &&
                  (instanceState === 'NOTSTARTED' ||
                    instanceState === 'INPROGRESS'))
              "
              class="li-center-list-li"
            >
              <span style="min-width: 72px">
                {{ $t('cloudpivot.flowCenter.pc.curResolver') }}：
              </span>

              <AuthorAvatarInfo
                :item="{
                  sourceId:
                    item.participant || item.participants.id || item.originator,
                  imgUrl: item.participantImgUrl,
                  sourceName: item.participants
                    ? item.participants.name
                    : item.participantName || item.originatorName,
                }"
                style="overflow: hidden"
              />
            </div>

            <div v-if="type === 1" class="li-center-list-li">
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.curActivity') }}：
              </span>
              <span class="cn">{{ item.activityName }}</span>
            </div>

            <div v-if="type === 2 || type === 4" class="li-center-list-li">
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.sourceName') }}：
              </span>
              <span v-if="item.sourceType === 'SYSTEM_ACTIVITY'" class="cn">
                {{ item.sourceName }}
              </span>

              <AuthorAvatarInfo
                v-else
                :item="{
                  sourceId: item.sourceId,
                  imgUrl: item.sourceImgUrl,
                  sourceName: item.sourceName,
                }"
                style="overflow: hidden"
              />
            </div>

            <div
              v-else-if="type === 5 && instanceState === 'COMPLETED'"
              class="li-center-list-li"
            >
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.finishedTime') }}：
              </span>
              <span class="cn">{{ item.finishTime }}</span>
            </div>

            <div
              v-else-if="
                (type === 5 && instanceState === 'CANCELED') ||
                (type === 7 && instanceState === 'CANCELED') ||
                (type === 8 && instanceState === 'CANCELLED')
              "
              class="li-center-list-li"
            >
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.cancelTime') }}：
              </span>
              <span class="cn">{{ item.finishTime }}</span>
            </div>

            <div
              v-else-if="
                type === 7 && (!instanceState || instanceState === 'COMPLETED')
              "
              class="li-center-list-li"
            >
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.initiationTime') }}：
              </span>
              <span class="cn">{{ item.startTime }}</span>
            </div>

            <div
              v-else-if="type === 7 && instanceState === 'EXCEPTION'"
              class="li-center-list-li"
            >
              <span style="min-width: 48px">
                {{ $t('cloudpivot.flowCenter.pc.usedTime') }}：
              </span>
              <span class="cn">{{ item.stayTimeStr }}</span>
            </div>

            <div
              v-else-if="
                type === 3 || (type === 8 && instanceState === 'FINISHED')
              "
              class="li-center-list-li"
            >
              <span style="min-width: 60px">
                {{ $t('cloudpivot.flowCenter.pc.resolveRzt') }}：
              </span>
              <span class="cn">{{ item.approvalName }}</span>
            </div>
          </div>

          <div
            v-if="
              type === 1 || type === 2 || type === 3 || type === 4 || type === 5
            "
            class="li-right"
            @click.stop="createWirkItem(item)"
          >
            <span class="icon-bg">
              <i class="icon aufontAll h-icon-all-batch-approval"></i>
            </span>
            <div class="li-right-text">
              <a-tooltip placement="bottom">
                <template slot="title"> {{ item.workflowName }} </template>
                {{ item.workflowName }}
              </a-tooltip>
            </div>
          </div>
          <div v-else class="li-right"></div>
        </li>
      </ul>
    </a-checkbox-group>

    <!-- 详情弹出层 -->
    <IframeModal
      :showIframeForm="showIframeForm"
      :IframeFormUrl="IframeFormUrl"
      @close="closeModal"
    />

    <!-- <div class="iframe-shadow" v-if="showIframeForm"></div>
    <transition name="fade-down">
      <div v-if="showIframeForm" class="iframe-form-warp">
        <div class="icon-close" id="iframeFormWarpClose"  @click="close()">
          <span class="icon aufontAll">&#xe996;</span>
        </div>
        <iframe
          ref="iframe"
          class="iframe-form-warp--page"
          :src="IframeFormUrl"
        ></iframe>
      </div>
    </transition> -->
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Checkbox, Tooltip, Popover } from '@h3/antd-vue';

import OrgApi from '../api/organization';

import AuthorAvatarInfo from '../author-avatar-info/author-avatar-info.vue';

import IframeModal from '../../../../../flow-center/src/components/pc/components/iframe-modal/iframe-modal.vue';

@Component({
  name: 'page-data',
  components: {
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    ATooltip: Tooltip,
    APopover: Popover,
    AuthorAvatarInfo,
    IframeModal,
  },
})
export default class PageData extends Vue {
  @Prop({
    default: [],
  })
  listData!: any[];

  @Prop({
    default: false,
  })
  batch!: boolean;

  @Prop({
    default: 1,
  })
  type!: number;

  @Prop({
    default: 'PROCESSING,EXCEPTION,DRAFT',
  })
  instanceState!: string;

  @Prop({ default: '' }) wd!: string;

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

  // @ts-ignore
  openApplicationPortal: boolean = window.config.openApplicationPortal || false;

  showType!: string;

  cardData: any = {}; //卡片数据

  checked: boolean = false; //测试

  checkedList: any[] = [];

  indeterminate: boolean = false; //全选

  checkAll: boolean = false;

  // plainOptions: any[] = [];
  showIframeForm: boolean = false;

  IframeFormUrl: string = '';

  visible: boolean = false;

  @Watch('listData', {
    immediate: true,
  })
  getBatchChange(val) {
    this.checkAll = false;
    this.indeterminate = false;
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  mounted() {
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event: any) {
    if (event.data === 'close') {
      this.showIframeForm = false;
      this.IframeFormUrl = '';
      this.$emit('refreshData', true);
    }
  }

  returnClick(event) {
    return;
  }

  closeModal() {
    this.showIframeForm = false;
    this.IframeFormUrl = '';
    this.$emit('closeModal');
  }

  /**
   * 发起流程
   */
  createWirkItem(obj) {
    const code = obj.workflowCode;
    let url: string = `/form/detail?startWorkflowCode=${code}`;
    url += `&return=${location.pathname + encodeURIComponent(location.search)}`;
    if (this.isDingTalk) {
      this.$router
        .push({
          path: url,
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      this.IframeFormUrl = url;
      this.showIframeForm = true;
    }
  }

  /**
   * 打开表单详情
   */
  async openDetail(obj) {
    console.log('打开了表单');
    //修改为已读状态
    obj.isRead = true;
    let url = '';
    let host: string = '';
    if (this.openApplicationPortal && obj.containerName) {
      let workflowInstanceId = obj.instanceId;
      if ([5, 7].includes(this.type)) {
        workflowInstanceId = obj.id;
      }

      const res = await OrgApi.getContainerUrl({
        workflowInstanceId: workflowInstanceId,
      });
      if (res.errcode === 0) {
        host = res.data;
      }
    }

    switch (this.type) {
      case 1:
      case 2:
      case 3:
      case 4:
        url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${
          obj.instanceId
        }&return=${
          location.pathname + location.search
        }&workitemType=finishedWorkitem`;
        break;
      case 5:
      case 7:
        url = `/form/detail?workflowInstanceId=${obj.id}&return=${
          location.pathname + location.search
        }`;
        break;
      case 8:
        url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${
          obj.instanceId
        }&return=${location.pathname + location.search}`;
        break;

      default:
        break;
    }
    url = host + url;
    if (this.openApplicationPortal) {
      url = url + '&T=' + this.token;
    }
    if (this.isDingTalk) {
      this.$router
        .push({
          path: url,
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      this.IframeFormUrl = url;
      this.showIframeForm = true;
    }
  }

  /**
   * 获取数据
   */
  async authorChange(id: string) {
    this.cardData = {};
    const res = await OrgApi.getOrgUserInfo({ id: id });
    if (res.errcode === 0) {
      this.cardData = res.data;
    }
  }

  onChange(checkedList: any[]) {
    this.indeterminate =
      !!checkedList.length && checkedList.length < this.listData.length;
    this.checkAll = checkedList.length === this.listData.length;
    this.$emit('changeChecked', checkedList);
  }

  onCheckAllChange(e) {
    Object.assign(this, {
      checkedList: e.target.checked ? this.listData : [],
      indeterminate: false,
      checkAll: e.target.checked,
    });
    this.$emit('changeChecked', {
      data: this.listData,
      isShow: e.target.checked,
    });
  }

  /* getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if (this.token) {
      url += "&T=" + this.token;
    }
    return url;
  } */
}
</script>
<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
/deep/ .highlights {
  color: @highlightColor !important;
}
.page-data {
  width: 100%;
  min-width: 1000px;
  max-width: 80%;
  margin: 0 auto;
  height: auto;
  .all-close {
    width: 100%;
    height: 32px;
    background-color: #fff;
    margin-bottom: 8px;
    padding: 6px 24px;
    box-sizing: border-box;
    position: sticky;
    top: 0;
    z-index: 9;
  }
  .ant-checkbox-group {
    width: 100%;
    min-width: 1000px;
  }
  ul {
    > li {
      width: 100%;
      height: 84px;
      // min-width: 1000px;
      background-color: #fff;
      border-radius: 2px;
      display: flex;
      align-items: center;
      cursor: pointer;
      margin-bottom: 8px;
      position: relative;
      // padding-right: 54px;
      &.li__active {
        position: relative;
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 2px;
          height: 100%;
          background: #faad14;
          border-radius: 2px 0px 0px 2px;
        }
      }
      &:hover {
        background-color: #fff;
        box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
        .li-center-list-title {
          color: #2970ff !important;
        }
      }
      > .li-left {
        font-size: 12px;
        font-weight: 400;
        color: #38393d;
        width: 88px;
        min-width: 88px;
        max-width: 88px;
        padding-left: 24px;
      }

      .li-center-title-box {
        display: flex;
        align-items: center;
        // width: 250px;
        width: calc(40% - 99px);
      }

      .li-center-title {
        max-width: 80%;
        font-size: 14px;
        font-weight: 700;
        color: #111218;
        white-space: nowrap;
        text-overflow: ellipsis;
        // margin-right: 24px;
        overflow: hidden;
        height: 50px;
        display: inline-block;
        vertical-align: middle;
        line-height: 50px;
        position: relative;
        &.gray {
          color: rgba(17, 18, 24, 0.25);
        }
      }
      .li-center-list {
        display: flex;
        flex-wrap: wrap;
        // max-width: 900px;
        width: calc(60% - 149px);
        justify-content: flex-end;
        flex: 1;
        &-li,
        &-li-02 {
          display: flex;
          align-items: center;
          width: 40%;
          margin: 4px 0;
          position: relative;
          &-position {
            position: relative;
            top: 17px;
          }
          > span {
            font-size: 12px;
            font-weight: 400;
            color: rgba(17, 18, 24, 0.5);
            &.cn {
              color: #111218;
              // width: 100px;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
              &.stop-time {
                display: inline-block;
                @media screen and (max-width: 1236px) {
                  max-width: 80px;
                }
              }
            }
          }
          /deep/.author {
            overflow: inherit;
            position: relative;
            font-size: 12px;
            > img {
              width: 20px;
              height: 20px;
              min-width: 20px;
              border-radius: 50%;
              overflow: hidden;
              margin-right: 4px;
            }
            > i {
              margin-right: 4px;
              width: 20px;
              height: 20px;
              min-width: 20px;
              line-height: 20px;
              border-radius: 50%;
              font-size: 20px;
              text-align: center;
              color: #ffb131;
              vertical-align: bottom;
            }
            .author-card {
              left: 16px;
              top: 32px;
            }
            .cn {
              color: #111218;
              width: 100%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
          &.residence {
            .hint {
              margin-left: 4px;
              color: #f0353f;
              font-size: 10px;
              padding: 1px 6px;
              background-color: #fdeae9;
              border-radius: 2px;
              transform: scale(0.8);
              &.staytimeHint {
                background-color: #e5e5e5;
                color: #111218;
                &.red {
                  background: #fcf1ce;
                  color: #faad14;
                }
                &:hover {
                  color: #faad14;
                  background-color: #fcf1ce;
                }
              }
            }
          }
        }
        &-li {
          width: 60%;
          &-02 {
            width: 40%;
            padding-right: 32px;
          }
        }
      }
      > .li-right {
        width: 160px;
        min-width: 160px;
        max-width: 160px;
        padding-right: 43px;
        overflow: hidden;
        .icon-bg {
          background-color: @highlightColor;
          display: inline-block;
          width: 17.5px;
          height: 17.5px;
          text-align: center;
          line-height: 16px;
          transform: scale(0.8);
          margin-right: 8px;
          > i {
            font-size: 12px;
            color: #fff;
            width: auto;
            height: auto;
            vertical-align: baseline;
            overflow: inherit;
          }
        }
        .li-right-text {
          position: relative;
          top: 4px;
          color: #111218;
          font-size: 12px;
          width: 72px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: inline-block;
          white-space: nowrap;
          &:hover {
            color: @highlightColor;
          }
        }
      }

      .portal-info {
        position: absolute;
        left: 0;
        top: 0;
        height: 17px;
        background: #f3f5fd;
        border-radius: 2px 0px 2px 0px;
        padding: 0 10px;
        font-size: 12px;
        color: rgba(17, 18, 24, 0.3);
        line-height: 17px;
        width: 80px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
}

.iframe-shadow {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 999;
}

.iframe-form-warp {
  position: fixed;
  top: 0;
  bottom: 0;
  // left: 83px;
  // right: 83px;
  left: 50%;
  transform: translateX(-50%);
  margin: auto;
  height: 100%;
  min-width: 1024px;
  max-width: 1228px;
  background: #fff;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 0 4px rgb(0 0 0 / 30%);
  border-radius: 2px;
  .icon-close {
    position: absolute;
    right: 24px;
    cursor: pointer;
    top: 13px;
    font-size: 20px;
    color: #000;
    vertical-align: baseline;
    &:hover {
      color: @highlightColor;
    }
  }
  .iframe-form-warp--page {
    width: 100%;
    height: 100%;
    overflow: auto;
    border: none;
  }
}
@media screen and (max-width: 1236px) {
  .page-data {
    min-width: unset;
    max-width: unset;
    .ant-checkbox-group {
      min-width: unset;
    }
  }
}

@media screen and (max-width: 1070px) {
  .page-data {
    .ant-checkbox-group {
      .residence {
        .hint {
          position: absolute;
          &:nth-child(3):last-child {
            position: unset !important;
          }
          &:nth-child(4) {
            right: 0;
          }
          &:nth-child(3) {
            right: 43px;
          }
        }
      }
    }
  }
}

@media screen and (min-width: 1900px) {
  .li-center-title {
    // margin-right: 110px !important;
  }
}
.li-center-list-hint {
  width: 54px;
  height: 25px;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAZCAYAAAB6v90+AAAAAXNSR0IArs4c6QAAAZJJREFUWEftmL9Lw0AUx++FXCxSsNRBnUJaOrp1UkoJmTplFJylOLlLEVEQ/wAXcdLRQehWHIpDJ0UdnS5xKXRTxJSQH+ZJhoodGpKlScoFbgi8u+/3+z63vANCCDEMYwURdwBgI/zP64eIIwC4rVarXxCGIoQ8u64brve8hgp9S5KkUErrAFAHxljb8zy10Wi08xxq4n0wGFxRSh9CYseWZS1pmna+CMH6/f5hsVh0eLC80OTE8kJq4pMT48Qy0gF+FTMCIrYNTix2qzJSyIllBERsG3/EFnlsiRw0Lct61XX9/n/Ler3eriRJcuw2zqlwatCMehoIgmDT931vMoSWSiXodrsnhUJBA4C7OfmNLTP1NBC1yzTNPdu2t5vN5kGn01lttVqXoiguU0p1WZY/YyumUAhRmoyxi/F4PHIcZ1Qul88Q8WY4HB6pquqn4DWR5MxgpmmuIeJbEAQfAPAtCMJ+pVJ5SnR6isUzgxmG8YiI64IgnCqKcg0APyn6TCw9MxhjbAsRX2q1mpP41Axs+AWXEDKdVmKHuQAAAABJRU5ErkJggg===)
    no-repeat center;
  background-color: transparent;
  color: #111218;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  text-align: center;
  transform: scale(0.7);
  // position: absolute;
  // right: -48px;
  // top: -2px;
  // &.hint-left{
  //   right: 0;
  //   top: -5px;
  // }
  @media screen and (max-width: 1160px) {
    position: absolute;
    right: 20%;
    top: -5px;
  }
}
</style>

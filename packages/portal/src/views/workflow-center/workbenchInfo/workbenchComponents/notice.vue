<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div v-if="noticeList.length" class="notice">
    <div class="left">
      <img src="./images/notice.png" alt="" />
      <template v-for="(item, index) in noticeList">
        <transition :key="index" name="move">
          <div v-if="index === currentKey" :key="index">
            <span v-if="item.messageType === 62">
              {{
                $t('languages.common.Notification.NoticeMsg2', {
                  org:
                    JSON.parse(item.bizParams) &&
                    JSON.parse(item.bizParams).organizationName,
                  num:
                    JSON.parse(item.bizParams) &&
                    JSON.parse(item.bizParams).userNameList &&
                    JSON.parse(item.bizParams).userNameList.length,
                  who:
                    JSON.parse(item.bizParams) &&
                    JSON.parse(item.bizParams).userNameList &&
                    JSON.parse(item.bizParams)
                      .userNameList.slice(0, 2)
                      .join('、'),
                })
              }}
            </span>
            <span v-else>
              <!-- {{item.senderVO.name}}发起的“{{bizParams(item).instanceName || ''}}”流程需要您处理 -->
              {{
                $t('languages.common.Notification.NoticeMsg', {
                  who: (item.senderVO && item.senderVO.name) || '',
                  what: bizParams(item).instanceName || '',
                })
              }}
            </span>
            <span class="font-ele" @click="openInfo(item)">
              {{ $t('languages.common.Notification.CheckTheDetail') }}
            </span>
          </div>
        </transition>
      </template>
    </div>
    <div v-if="noticeList.length > 1" class="right">
      <span
        :class="{ disabled: currentKey === 0 }"
        @click="changeCurrentKey('prev')"
        >{{ $t('languages.common.workBenchInfo.Previous') }}</span>
      <span
        :class="{ disabled: currentKey === noticeList.length - 1 }"
        @click="changeCurrentKey('next')"
        >{{ $t('languages.common.workBenchInfo.Next') }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { listApi, workbenchApi } from 'cloudpivot/api';
import { utils } from 'cloudpivot/common';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'notice',
  components: {},
})
export default class notice extends Vue {
  noticeList: any[] = [];

  currentKey: number = 0;

  timer: any = null;

  async getNoticeList() {
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
      messageType: 'STATION', // 站内消息
      readState: 'UNREADED',
    });
    if (res.errcode === 0) {
      this.noticeList = res.data.MESSAGE.content;
      this.$nextTick(() => {
        this.autoRun();
      });
    }
  }

  bizParams(item) {
    return (item.bizParams && JSON.parse(item.bizParams)) || {};
  }

  changeCurrentKey(type: 'prev' | 'next') {
    if (type === 'prev' && this.currentKey !== 0) {
      this.currentKey = this.currentKey - 1;
    } else if (
      type === 'next' &&
      this.currentKey !== this.noticeList.length - 1
    ) {
      this.currentKey = this.currentKey + 1;
    } else {
      //Else Empty block statement
    }
    this.autoRun();
  }

  autoRun() {
    // 自动切换
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.currentKey === this.noticeList.length - 1) {
        this.currentKey = 0;
      } else {
        this.changeCurrentKey('next');
      }
      this.autoRun();
    }, 5000);
  }

  created() {
    this.getNoticeList();
  }

  mounted() {
    // 收藏有变化：重新请求列表
    utils.Bus.$on('NoticeListChange', () => {
      this.getNoticeList();
    });
  }

  beforeDestroy() {
    utils.Bus.$off('NoticeListChange');
    clearTimeout(this.timer);
  }

  openInfo(item) {
    if (item.messageType === 62) {
      if (this.bizParams(item).userNameList.length > 0) {
        //跳转后台工作交接查询界面
        window.open(
          `/admin/#/organization/workHandover?userName=${
            this.bizParams(item).userNameList[0]
          }`,
        );
      }
    } else {
      if (this.bizParams(item).workflowInstanceId) {
        window.open(
          `/form/detail?workitemType=${
            this.bizParams(item).workItemType
          }&workitemId=${this.bizParams(item).WorkItemId}&workflowInstanceId=${
            this.bizParams(item).workflowInstanceId
          }`,
        );
      } else {
        this.open(
          this.bizParams(item).objectId,
          this.bizParams(item).schemaCode,
        );
      }
    }
    this.updateReadState(item.id);
  }

  async updateReadState(id: string) {
    const res: any = await workbenchApi.updateReadState({
      messageIdList: [id],
    });
  }

  isDingtalk: boolean = /DingTalk/.test(navigator.userAgent);

  open(bizObjectId: string, schemaCode: string) {
    const params = {
      bizObjectId,
      schemaCode,
    };
    listApi.getFormUrl(params).then((res: any) => {
      if (this.isDingtalk) {
        res += '&T=' + localStorage.getItem('token');
      }
      window.open(res);
    });
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
.move-enter {
  transform: translateY(22px);
  opacity: 0;
}
.move-leave-active {
  transform: translateY(-22px);
  opacity: 0;
}

.notice {
  height: 48px;
  border-radius: 2px;
  background-color: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  .right {
    display: flex;
    align-items: center;
    span {
      margin-left: 16px;
      height: 24px;
      line-height: 22px;
      font-size: 12px;
      width: 52px;
      background: #ffffff;
      border-radius: 2px;
      border: 1px solid #d4d5d6;
      text-align: center;
      display: inline-block;
      cursor: pointer;
      &:hover {
        color: @highlightColor;
        border: 1px solid @highlightColor;
      }
      &.disabled {
        border: 1px solid #d4d5d6;
        background-color: #f1f2f6;
        color: rgba(17, 18, 24, 0.25);
        cursor: no-drop;
        &:hover {
          color: rgba(17, 18, 24, 0.25);
          border: 1px solid #d4d5d6;
        }
      }
    }
  }

  .left {
    display: flex;
    align-items: center;
    position: relative;
    width: calc(100% - 137px);
    img {
      margin-right: 8px;
    }

    div {
      // max-width: 800px;
      width: calc(100% - 32px);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: inline-block;
      position: absolute;
      transition: all ease 0.3s;
      left: 32px;
      .font-ele {
        margin-left: 16px;
        color: @highlightColor;
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
      }
      span {
        max-width: calc(100% - 115px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>

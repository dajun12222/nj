<template>
  <div
    class="tips-item"
    :class="{
      'is-show-info': isShowInfo,
      notification: type === 'notification',
      'is-read': item.readState !== 102,
    }"
  >
    <template v-if="isChinese">
      <template v-if="item.senderVO">
        <AuthorAvatarInfo
          :item="{
            sourceId: item.senderVO.id,
            imgUrl: item.senderVO.imgUrl,
            sourceName: item.senderVO.name,
            onlyImg: true,
          }"
          style="overflow: hidden"
        />
      </template>

      <div class="infos" :style="{ width: infosWidth }" @click="gotoInfo">
        <template
          v-if="
            [
              101, 102, 103, 104, 105, 106, 1, 2, 3, 4, 11, 12, 13, 14, 16, 17,
              23,
            ].includes(item.messageType)
          "
        >
          <span class="senderVOname">{{
            user.id === item.senderVO && item.senderVO.id
              ? '您'
              : item.senderVO && item.senderVO.name
          }}</span>
          <span class="grey" style="margin-left: 8px">发起的流程</span>
          <!-- eslint-disable-next-line vue/no-v-html -->
          【<span v-html="queryTitleLight(bizParams.instanceName)"></span>】
          <span class="grey">{{ messageType[item.messageType] }}</span>
        </template>

        <!-- 待办101 -->
        <!-- 流程结束102 -->
        <!-- 流程异常103 -->
        <!-- 流程作废104 -->
        <!-- 流程删除105 -->
        <!-- 传阅 -->
        <!-- 催办107 -->
        <!-- 流程启动1 -->
        <!-- 流程结束2 -->
        <!-- 流程取消3 -->
        <!-- 流程激活4 -->
        <!-- 节点激活前11 -->
        <!-- 节点激活后12 -->
        <!-- 活动完成后13 -->
        <!-- 活动取消后14 -->
        <!-- 任务提交后16 -->
        <!-- 任务驳回17 -->
        <!-- 已超时23 -->
        <!-- 将超时21 -->
        <!-- 删除员工离职交接62 -->

        <template v-if="item.messageType === 107">
          <span class="grey">您有一条流程任务需要处理</span>
          【<span>{{ bizParams.instanceName }}</span>】
        </template>

        <template v-if="item.messageType === 108">
          <span class="senderVOname">您</span>
          <span class="grey">有一个新的子流程任务</span>
        </template>

        <template v-if="item.messageType === 21">
          <span class="senderVOname">{{
            user.id === item.senderVO && item.senderVO.id
              ? '您'
              : item.senderVO && item.senderVO.name
          }}</span>
          <span class="grey" style="margin-left: 8px">发起的流程</span>
          【<span>{{ bizParams.instanceName }}</span>】
          <span class="grey">{{ item.content.slice(6) }}</span>
        </template>

        <!-- 委托提交 -->
        <template v-if="item.messageType === 51">
          <template v-if="item.content.includes('修改')">
            <span class="grey">【{{ getWho(item.content) }}】修改了给您的流程委托，</span>
            <span class="grey">时间：【{{ getStartTime(item.content) }}】至【{{
                getEndTime(item.content)
              }}】，委托人：</span>
            <span class="senderVOname">{{
              user.id === item.senderVO && item.senderVO.id
                ? '您'
                : '【' + item.senderVO && item.senderVO.name + '】'
            }}</span>
          </template>
          <template v-else>
            <span class="senderVOname">{{
              user.id === item.senderVO && item.senderVO.id
                ? '您'
                : item.senderVO && item.senderVO.name
            }}</span>
            <span class="grey" style="margin-left: 8px">委托您发起流程，</span>
            <span class="grey">时间：【{{ getStartTime(item.content) }}】至【{{
                getEndTime(item.content)
              }}】</span>
          </template>
        </template>

        <!-- 委托审批 -->
        <template v-if="item.messageType === 52">
          <template v-if="item.content.includes('修改')">
            <span class="grey">【{{ getWho(item.content) }}】修改了给您的流程委托，</span>
            <span class="grey">时间：【{{ getStartTime(item.content) }}】至【{{
                getEndTime(item.content)
              }}】，委托人：</span>
            <span class="senderVOname">{{
              user.id === item.senderVO && item.senderVO.id
                ? '您'
                : '【' + item.senderVO && item.senderVO.name + '】'
            }}</span>
          </template>
          <template v-else>
            <span class="senderVOname">{{
              user.id === item.senderVO && item.senderVO.id
                ? '您'
                : item.senderVO && item.senderVO.name
            }}</span>
            <span class="grey" style="margin-left: 8px">委托你审批流程，</span>
            <span class="grey">时间：【{{ getStartTime(item.content) }}】至【{{
                getEndTime(item.content)
              }}】</span>
          </template>
        </template>

        <!-- 工作交接 -->
        <template v-if="item.messageType === 31">
          <span class="senderVOname">{{
            user.id === item.senderVO && item.senderVO.id
              ? '您'
              : item.senderVO && item.senderVO.name
          }}</span>
          <span class="grey" style="margin-left: 8px">将</span>
          <span class="senderVOname">{{ getWhoseWork(item.content) }}</span>
          <span class="grey">的{{ bizParams.success }}条{{
              bizParams.isBusiness ? '应用数据' : '待办任务'
            }}交接给了你，请尽快处理！</span>
          <br />
          <span class="grey">交接意见：{{ getComment(item.content) }}</span>
        </template>

        <template v-if="item.messageType === 61">
          <span class="senderVOname">{{
            user.id === item.senderVO && item.senderVO.id
              ? '您'
              : item.senderVO && item.senderVO.name
          }}</span>
          <span class="grey" style="margin-left: 8px">交接了{{ bizParams.roles.length }}个角色给你：</span>
          <template v-for="(role, index) in bizParams.roles.slice(0, 5)">
            <!-- eslint-disable-next-line vue/no-v-html -->
            【<span :key="index" v-html="queryTitleLight(role)"></span>】
          </template>
          <span class="grey">
            <span v-if="bizParams.roles.length > 1">等</span>
            <br />
            交接意见：{{ getComment2(item.content) }}
          </span>
        </template>

        <!-- 业务规则消息 -->
        <template v-if="[32].includes(item.messageType)">
          <div class="grey">数据修改通知</div>
          <span v-if="item.senderVO">【{{ item.senderVO.name }}】</span>
          <span class="grey">{{ item.content }}</span>
        </template>

        <template v-if="[201].includes(item.messageType)">
          <span>【{{ bizParams.objectDataName }}】</span>
          <span class="grey">发送消息：</span>
          <span>{{ item.title }}</span>
          <div class="grey">
            {{ item.content }}
          </div>
        </template>

        <!-- @和回复我的 -->
        <template v-if="[41, 42].includes(item.messageType)">
          <span class="senderVOname">{{
            item.senderVO && item.senderVO.name
          }}</span>
          <span class="grey">{{ item.content.indexOf('@') > -1 ? '@我' : '回复我' }}：</span>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="grey" v-html="getHtml(bizParams.test)">{{
            bizParams.htmlStr
          }}</span>
        </template>

        <!-- 员工离职交接消息 -->
        <template v-if="item.messageType === 62 && bizParams.userNameList">
          <!-- eslint-disable-next-line vue/no-v-html -->
          【<span v-html="queryTitleLight(bizParams.organizationName)"></span>】
          <span class="grey">的{{ bizParams.userNameList.length }}个员工为离职待交接状态：</span>
          <template
            v-for="(user, userIndex) in bizParams.userNameList.slice(0, 2)"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            【<span :key="userIndex" v-html="queryTitleLight(user)"></span>】
          </template>
          <span class="grey"><span v-if="bizParams.userNameList > 1">等</span>，{{
              messageType[item.messageType]
            }}</span>
        </template>

        <div class="time grey">
          {{ formatTime(item.createdTime) }}
        </div>
      </div>
      <div v-if="isShowInfo" class="right grey" @click="gotoInfo">
        {{ $t('cloudpivot.application.pc.notificationItem.checkDetail') }}
      </div>
    </template>
    <template v-else>
      <template v-if="item.senderVO">
        <AuthorAvatarInfo
          :item="{
            sourceId: item.senderVO.id,
            imgUrl: item.senderVO.imgUrl,
            sourceName: item.senderVO.name,
            onlyImg: true,
          }"
          style="overflow: hidden"
        />
      </template>

      <div class="infos" :style="{ width: infosWidth }" @click="gotoInfo">
        <template
          v-if="
            [
              101, 102, 103, 104, 105, 106, 1, 2, 3, 4, 11, 12, 13, 14, 16, 17,
              23,
            ].includes(item.messageType)
          "
        >
          <span class="grey">The workflow </span>
          <!-- eslint-disable-next-line vue/no-v-html -->
          "<span v-html="queryTitleLight(bizParams.instanceName)"></span>"
          <span class="grey"> initiated by </span>
          <span class="senderVOname">{{
            user.id === item.senderVO && item.senderVO.id
              ? 'yourself'
              : item.senderVO && item.senderVO.name
          }}</span>
          <span class="grey">{{ messageTypeI18n[item.messageType] }}</span>
        </template>

        <!-- 待办101 -->
        <!-- 流程结束102 -->
        <!-- 流程异常103 -->
        <!-- 流程作废104 -->
        <!-- 流程删除105 -->
        <!-- 传阅 -->
        <!-- 催办107 -->
        <!-- 流程启动1 -->
        <!-- 流程结束2 -->
        <!-- 流程取消3 -->
        <!-- 流程激活4 -->
        <!-- 节点激活前11 -->
        <!-- 节点激活后12 -->
        <!-- 活动完成后13 -->
        <!-- 活动取消后14 -->
        <!-- 任务提交后16 -->
        <!-- 任务驳回17 -->
        <!-- 已超时23 -->
        <!-- 将超时21 -->
        <!-- 删除员工离职交接62 -->

        <template v-if="item.messageType === 107">
          <span class="grey">The workflow </span>
          "<span>{{ bizParams.instanceName }}</span>"
          <span class="grey"> needs you to deal</span>
        </template>

        <template v-if="item.messageType === 108">
          <span class="senderVOname">You </span>
          <span class="grey">have received a new sub workflow tasks</span>
        </template>

        <template v-if="item.messageType === 21">
          <span class="grey">The workflow </span>
          <!-- eslint-disable-next-line vue/no-v-html -->
          "<span v-html="queryTitleLight(bizParams.instanceName)"></span>"
          <span class="grey"> initiated by </span>
          <span class="senderVOname">{{
              user.id === item.senderVO && item.senderVO.id
                ? 'yourself'
                : item.senderVO && item.senderVO.name
            }}
          </span>
          <span class="grey">
            is expected to time out after
            {{ getTimeOutTime(item.content.slice(8, -10)) }}, please handle it
            in time.</span>
        </template>

        <!-- 委托提交 -->
        <template v-if="item.messageType === 51">
          <template v-if="item.content.includes('修改')">
            <span class="grey">[{{ getWho(item.content) }}] modified the initiation process
              commission given to you, time: "{{ getStartTime(item.content) }}"
              to "{{ getEndTime(item.content) }}", client:
            </span>
            <span class="senderVOname">{{
              user.id === item.senderVO && item.senderVO.id
                ? 'you'
                : '[' + item.senderVO && item.senderVO.name + ']'
            }}</span>
          </template>
          <template v-else>
            <span class="senderVOname">{{
              user.id === item.senderVO && item.senderVO.id
                ? 'You'
                : item.senderVO && item.senderVO.name
            }}</span>
            <span class="grey">
              entrusts you to initiate the process, time: "{{
                getStartTime(item.content)
              }}" to "{{ getEndTime(item.content) }}"</span>
          </template>
        </template>

        <!-- 委托审批 -->
        <template v-if="item.messageType === 52">
          <template v-if="item.content.includes('修改')">
            <span class="grey">[{{ getWho(item.content) }}] has modified the approval process
              delegate given to you, time: "{{ getStartTime(item.content) }}" to
              "{{ getEndTime(item.content) }}", client:
            </span>
            <span class="senderVOname">{{
              user.id === item.senderVO && item.senderVO.id
                ? 'you'
                : '[' + item.senderVO && item.senderVO.name + ']'
            }}</span>
          </template>
          <template v-else>
            <span class="senderVOname">{{
              user.id === item.senderVO && item.senderVO.id
                ? 'You'
                : item.senderVO && item.senderVO.name
            }}</span>
            <span class="grey">
              entrusts you with the approval process, time: "{{
                getStartTime(item.content)
              }}" to "{{ getEndTime(item.content) }}"</span>
          </template>
        </template>

        <!-- 工作交接 -->
        <template v-if="item.messageType === 31">
          <span class="senderVOname">{{
            user.id === item.senderVO && item.senderVO.id
              ? 'You'
              : item.senderVO && item.senderVO.name
          }}</span>
          <span class="grey">
            has handed over the {{ bizParams.success
            }}{{ bizParams.isBusiness ? ' application data' : ' to-do tasks' }}
            of
          </span>
          <span class="senderVOname">{{ getWhoseWork(item.content) }}</span>
          <span class="grey">
            to you, please handle it as soon as possible!</span>
          <br />
          <span class="grey">Handover comments: {{ getComment(item.content) }}</span>
        </template>

        <template v-if="item.messageType === 61">
          <span class="senderVOname">{{
            user.id === item.senderVO && item.senderVO.id
              ? 'You'
              : item.senderVO && item.senderVO.name
          }}</span>
          <span class="grey" style="margin-left: 8px">
            handed over {{ bizParams.roles.length }} roles to you:</span>
          <template v-for="(role, index) in bizParams.roles.slice(0, 5)">
            <!-- eslint-disable-next-line vue/no-v-html -->
            【<span :key="index" v-html="queryTitleLight(role)"></span>】
          </template>
          <span class="grey">
            <span v-if="bizParams.roles.length > 1">, etc.</span>
            <br />
            Handover opinion: {{ getComment2(item.content) }}
          </span>
        </template>

        <!-- 业务规则消息 -->
        <template v-if="[32, 201].includes(item.messageType)">
          <div class="grey">Data Modification Notice</div>
          <span>【{{ item.senderVO && item.senderVO.name }}】</span>
          <span class="grey">{{ item.content }}</span>
        </template>

        <!-- @和回复我的 -->
        <template v-if="[41, 42].includes(item.messageType)">
          <span class="senderVOname">{{
            item.senderVO && item.senderVO.name
          }}</span>
          <span class="grey">{{ item.content.indexOf('@') > -1 ? '@me' : 'Reply me' }}：</span>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="grey" v-html="getHtml(bizParams.test)">{{
            bizParams.htmlStr
          }}</span>
        </template>

        <!-- 员工离职交接消息 -->
        <template v-if="item.messageType === 62 && bizParams.userNameList">
          <!-- eslint-disable-next-line vue/no-v-html -->
          【<span v-html="queryTitleLight(bizParams.organizationName)"></span>】
          <span class="grey">{{ bizParams.userNameList.length }} employee is in the state of
            leaving and waiting for handover：</span>
          <template
            v-for="(user, userIndex) in bizParams.userNameList.slice(0, 2)"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            【<span :key="userIndex" v-html="queryTitleLight(user)"></span>】
          </template>
          <span class="grey"><span v-if="bizParams.userNameList > 1">Etc. </span>{{ messageTypeI18n[item.messageType] }}</span>
        </template>

        <div class="time grey">
          {{ formatTime(item.createdTime) }}
        </div>
      </div>

      <div v-if="isShowInfo" class="right grey" @click="gotoInfo">
        {{ $t('cloudpivot.application.pc.notificationItem.checkDetail') }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AuthorAvatarInfo from '../../../../../common/src/components/pc/author-avatar-info/author-avatar-info.vue';
import moment from 'moment';
import { listApi } from '../../../../../api';
import { workbenchApi } from '../../../../../api';

@Component({
  name: 'tipsItem',
  components: {
    AuthorAvatarInfo,
  },
})
export default class tipsItem extends Vue {
  @Prop() item!: any;

  @Prop({ default: false }) isShowInfo?: boolean;

  @Prop({
    default: '250px',
  })
  infosWidth?: string;

  @Prop({
    default: '',
  })
  type?: string;

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

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  messageType: any = {
    101: '待您处理',
    102: '已完成',
    103: '出现异常',
    104: '已作废',
    105: '已删除',
    106: '抄送给您',
    // 107: '已完成',
    1: '已启动',
    2: '已结束',
    3: '被取消',
    4: '已激活',
    11: '即将被激活',
    12: '已完成',
    13: '已完成',
    14: '已取消',
    16: '已审批',
    17: '被驳回',
    23: '已超时，请及时处理',
    62: '请在“云枢后台-组织机构-工作交接”中交接他的任务',
  };

  messageTypeI18n: any = {
    101: ' needs you to deal',
    102: ' has been completed',
    103: ' has a defect',
    104: ' has been Canceled',
    105: ' has been deleted',
    106: 'sends to you',
    // 107: '已完成',
    1: ' has started',
    2: ' has ended',
    3: ' has been canceled',
    4: ' activated',
    11: ' will be activated',
    12: ' has been completed',
    13: ' has been completed',
    14: ' has been canceled',
    16: ' has been aproved',
    17: ' has been rejected',
    23: ' has timed out, please deal with it in time',
    62: ' please hand over his duties in "Yunshu Manage-Organization-WorkTransfer"',
  };

  stateMap: any = {
    PROCESSING: '进行中',
    COMPLETED: '已完成',
    CANCELED: '作废',
    EXCEPTION: '异常',
  };

  stateMapI18n: any = {
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
    EXCEPTION: 'exception',
  };

  get bizParams() {
    const bizparam =
      (this.item.bizParams && JSON.parse(this.item.bizParams)) || {};
    if (bizparam.originatorName) {
    }
    return bizparam;
  }

  get user() {
    const str = sessionStorage.getItem('user') || '';
    return (str && JSON.parse(str)) || {};
  }

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

  getTimeOutTime(time: string) {
    console.log(time);
    if (time.includes('天')) {
      const num = parseInt(time.slice(0, -1));
      return num + (num > 1 ? ' days' : ' day');
    } else if (time.includes('时')) {
      let num = 0;
      if (time.includes('小')) {
        num = parseInt(time.slice(0, -2));
      } else {
        num = parseInt(time.slice(0, -1));
      }
      return num + (num > 1 ? ' hours' : ' hour');
    } else if (time.includes('分')) {
      let num = 0;
      if (time.includes('钟')) {
        num = parseInt(time.slice(0, -2));
      } else {
        num = parseInt(time.slice(0, -1));
      }
      return num + (num > 1 ? ' minutes' : ' minute');
    } else if (time.includes('秒')) {
      const num = parseInt(time.slice(0, -1));
      return num + (num > 1 ? ' secss' : ' second');
    } else {
      //Else Empty block statement
    }
  }

  getWhoseWork(content: string) {
    const index = content.indexOf(this.bizParams.success);
    return content.slice(13, index - 1);
  }

  getComment(content: string) {
    const index = content.indexOf('交接意见');
    return content.slice(index + 5);
  }

  getComment2(content: any) {
    if (!(typeof content === 'object')) {
      content = JSON.parse(content);
    }
    const dataItem = content.dataItems;
    return dataItem.filter((i: any) => {
      return i.key === '交接意见';
    })[0].value;
  }

  getWho(content: string) {
    const startIndex1 = content.indexOf('【');
    const endIndex1 = content.indexOf('】');
    return content.slice(startIndex1 + 1, endIndex1);
  }

  getStartTime(content: string) {
    const startIndex1 = content.indexOf('【');
    const startIndex2 = content.indexOf('【', startIndex1 + 1);
    const endIndex1 = content.indexOf('】');
    const endIndex2 = content.indexOf('】', endIndex1 + 1);
    return content.slice(startIndex2 + 1, endIndex2);
  }

  getEndTime(content: string) {
    const startIndex1 = content.indexOf('【');
    const startIndex2 = content.indexOf('【', startIndex1 + 1);
    const startIndex3 = content.indexOf('【', startIndex2 + 1);
    const endIndex1 = content.indexOf('】');
    const endIndex2 = content.indexOf('】', endIndex1 + 1);
    const endIndex3 = content.indexOf('】', endIndex2 + 1);
    return content.slice(startIndex3 + 1, endIndex3);
  }

  gotoInfo() {
    if (this.item.messageType === 62) {
      if (this.bizParams.userNameList.length > 0) {
        //跳转后台工作交接查询界面
        window.open(
          `/admin/#/organization/workHandover?userName=${this.bizParams.userNameList[0]}`,
        );
      }
    } else {
      if (this.bizParams.workflowInstanceId) {
        window.open(
          `/form/detail?isFromTips=true&workitemType=${this.bizParams.workItemType}&workitemId=${this.bizParams.WorkItemId}&workflowInstanceId=${this.bizParams.workflowInstanceId}`,
        );
      } else {
        this.open(this.bizParams.objectId, this.bizParams.schemaCode);
      }
    }
    this.updateReadState(this.item.id);
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

  async updateReadState(id: string) {
    const res: any = await workbenchApi.updateReadState({
      messageIdList: [id],
    });
  }

  getHtml(text) {
    if (!text) {
      return;
    }
    return text.replace(/<span.+<\/span>/g, '');
  }
}
</script>

<style lang="less" scoped>
@import './../style/custom-themes';
/deep/ .highlights {
  color: @highlightColor !important;
}
.tips-item {
  margin-top: 20px;
  display: flex;
  color: #111218;
  position: relative;
  .infos {
    width: 250px;
    cursor: pointer;
    margin-left: 8px;
  }
  .grey {
    color: rgba(17, 18, 24, 0.5);
  }
  .time {
    font-size: 12px;
  }

  :hover {
    color: @highlightColor;
    .grey {
      color: rgba(17, 18, 24, 0.5);
    }
  }
}

// 已读消息置灰
// .is-read{
//   color: rgba(17, 18, 24, 0.5);
// }
.is-show-info {
  background-color: #fff;
  margin-bottom: 8px;
  margin-top: 0;
  padding: 16px;
  cursor: pointer;
  .right {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.notification {
  padding: 8px 0px 8px 6px !important;
}
</style>

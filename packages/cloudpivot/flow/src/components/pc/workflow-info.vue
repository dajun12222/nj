<template>
  <div v-if="isLoaded" class="workflow-info" :class="{ collapsed: collapsed }">
    <div class="workflow-info-wrapper">
      <div class="left">
        <workflow-status class="workflow-info__status" :status="status" />

        <div class="left-content">
          <div v-if="canceled" class="item1">
            <div class="label">
              {{ $t('cloudpivot.flowCenter.pc.originatorName') }}
            </div>
            <div class="wrapper">
              <AuthorAvatarInfo
                :item="{
                  sourceId: info.originator,
                  imgUrl: info.imgUrl,
                  sourceName: info.originatorName,
                }"
              />
            </div>
          </div>

          <div v-else-if="completed" class="item1">
            <div class="label">
              {{ $t('cloudpivot.flowCenter.pc.initiationTime') }}
            </div>
            <div class="wrapper">
              {{ info.startTime }}
            </div>
          </div>

          <div v-else class="item1">
            <div class="label">
              {{ $t('cloudpivot.flowCenter.pc.curActivity') }}
            </div>
            <div class="wrapper">
              <span class="node-name">{{ getCurrentNodeName || '--' }}</span>
              <i
                v-show="info.participants.length > 1"
                class="icon aufontAll h-icon-all-ellipsis-o"
                @click="changeNodeViewVisiable"
              ></i>
            </div>
          </div>

          <div v-if="canceled" class="item1">
            <div class="label">
              {{ $t('cloudpivot.flowCenter.pc.initiationTime') }}
            </div>
            <div class="wrapper">
              {{ info.startTime }}
            </div>
          </div>

          <div v-if="canceled" class="item2">
            <div class="label">
              {{ $t('cloudpivot.flowCenter.pc.cancelTime') }}
            </div>
            <div class="wrapper">
              {{ info.cancelTime }}
            </div>
          </div>

          <div v-else-if="completed" class="item1">
            <div class="label">
              {{ $t('cloudpivot.flowCenter.pc.finishedTime') }}
            </div>
            <div class="wrapper">
              {{ info.finishTime }}
            </div>
          </div>

          <div v-else class="item1 participants">
            <div class="label">
              {{ $t('cloudpivot.flowCenter.pc.curResolver') }}
            </div>
            <div class="wrapper2">
              <div class="worflow-track-base-info-node">
                <div class="node-item">
                  <user-popover-ellipsis
                    :popoverClass="'display-popover-customize'"
                    :participantRelations="
                      (info.participants[0] &&
                        info.participants[0].participants) ||
                      []
                    "
                    @showUsers="showUsers"
                  />
                </div>
                <!-- <div
                  class="node-item"
                  v-for="(node, i) in info.participants"
                  :key="i"
                >
                  <user-popover-ellipsis
                    :popoverClass="'display-popover-customize'"
                    :participantRelations="node.participants"
                  ></user-popover-ellipsis>
                </div> -->
              </div>
            </div>
          </div>

          <div v-if="!canceled" class="item2">
            <div class="label">
              {{ $t('cloudpivot.flowCenter.pc.usedTime') }}
            </div>
            <div class="wrapper">
              {{ usedTime }}
            </div>
          </div>
        </div>
      </div>
      <div class="linkTrack">
        <a v-if="!mockMode" style="position: relative" @click="linkTrack">
          {{ $t('cloudpivot.flow.pc.WorkflowTrack') }}
          <i class="icon aufontAll h-icon-all-right-o"></i>
        </a>
      </div>
    </div>

    <!-- <div v-if="completed" class="workflow-info__col1">{{ $t('cloudpivot.flow.pc.FinishTime', { time: info.finishTime }) }}</div>

    <div v-else-if="canceled" class="workflow-info__col1">{{ $t('cloudpivot.flow.pc.CancelTime', { time: info.cancelTime }) }}</div>

    <div
      v-else
      class="workflow-info__col1"
      :class="{ hidden : collapsed }"
    >
      <table ref="workflow">
        <thead>
          <tr>
            <td style="width:144px">{{ $t('cloudpivot.flow.pc.CurNode') }}</td>
            <td>{{ $t('cloudpivot.flow.pc.CurHandler') }}</td>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(node,index) in info.participants"
            :key="index"
            :class="{'cur-node': node.activityCode === curNode && info.participants.length > 1}"
          >
            <td style="vertical-align:top" :class="{'cur-node-name': node.activityCode === curNode && info.participants.length > 1}">{{ isChinese ? node.activityName : node.name_i18n[$i18n.locale] }}</td>

            <td>
              <user-popover
                v-for="(participant,index) in node.participantRelations"
                :key="index"
                :user="participant.participantVO"
                :isTrust="participant.isTrust"
                :trustorVO="participant.trustorVO"
                :trustorId="participant.workitemId"
                :workItemId="itemId"
              ></user-popover>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="workflow-info__col2">
      <div v-if="!completed && !canceled">{{ $t('cloudpivot.flow.pc.UsedTime', { time: usedTime }) }}</div>
      <a v-if="!mockMode" @click="linkTrack">{{ $t('cloudpivot.flow.pc.WorkflowTrack') }}</a>
    </div>

    <div>
      <workflow-status class="workflow-info__status" :status="status"></workflow-status>
    </div>

    <a-icon
      v-if="collapsible"
      type="double-right"
      :class="{ collapsed : collapsed }"
      @click="toggle"
    ></a-icon> -->
    <ActivityListPopover
      v-show="nodeViewVisiable"
      :list="info.participants"
      @changeVisiable="changeNodeViewVisiable"
    />
    <div v-show="usersVisiable" class="users-box activity-list-box">
      <div class="width-box">
        <div class="display-content">
          <div class="calcHeight">
            <user-popover
              v-for="(user, index) in participantRelationsEllipsisList"
              :key="index"
              :user="user"
              :isHiddenImg="true"
              :isTrust="user.isTrust"
              :trustorVO="user.trustorProcessor"
              :trustorId="user.trustorId"
              :workItemId="user.workitemId"
            />
          </div>
        </div>
        <i class="icon aufontAll h-icon-all-close" @click="hide"></i>
        <button
          v-if="usersHeight > 83"
          size="small"
          class="showAllButton"
          @click="changeMaxHeight"
        >
          {{
            curHeight > 83
              ? $t('cloudpivot.form.renderer.collapse')
              : $t('cloudpivot.form.renderer.expand')
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Button, Icon, Popover } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { workflow, workflowApi } from '../../../../api';
import common from '../../../../common/pc';
import AuthorAvatarInfo from '../../../../common/src/components/pc/author-avatar-info/author-avatar-info.vue';
import { timeTranslate } from '../../../../common/src/utils/date';
import ActivityListPopover from '../../components/pc/activity-list-popover/activity-list-popover.vue';
import WorkflowStatus from '../shared/workflow-status/workflow-status-ui-change.vue';

@Component({
  name: 'workflow-info',
  components: {
    AIcon: Icon,
    UserPopover: common.components.UserPopover,
    WorkflowStatus,
    UserPopoverEllipsis: common.components.UserEllipsis,
    APopover: Popover,
    AuthorAvatarInfo,
    ActivityListPopover,
    AButton: Button,
  },
})
export default class WorkflowInfo extends Vue {
  @Prop()
  id!: string;

  @Prop()
  itemId!: string;

  @Prop()
  curNode!: string;

  @Prop({ default: false }) mockMode?: any;

  participantRelationsEllipsisList: any = null;

  info: workflow.InstanceBaseInfo = {} as any;

  collapsed = true;

  collapsible = false;

  isLoaded = false;

  isShow: boolean = false;

  nodeViewVisiable: boolean = false;

  usersVisiable: boolean = false;

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  get getCurrentNodeName() {
    let item =
      this.info &&
      this.info.participants &&
      this.info.participants.find(
        (el: any) => el.activityCode === this.curNode,
      );

    if (!item && this.info && this.info.participants) {
      item = this.info.participants[0];
    }
    return item ? item.activityName : '';
  }

  curHeight: number = 0;

  changeMaxHeight() {
    const node: any = document.querySelector('.users-box .display-content');
    if (this.curHeight > 83) {
      node.style['maxHeight'] = '83px';
      this.curHeight = 83;
    } else {
      node.style['maxHeight'] = 'none';
      this.curHeight = this.usersHeight;
    }
  }

  // get collapsible() {
  //   // const x = this.info;
  //   // console.log('participants', x.participants);
  //   // return x && x.participants && x.participants.length > 3;
  // }

  get status() {
    return this.info ? this.info.status : '';
  }

  get completed() {
    return this.status === 'COMPLETED';
  }

  get canceled() {
    return this.status === 'CANCELED';
  }

  get usedTime() {
    if (!this.info || !this.info.usedTime) {
      return '';
    }
    return timeTranslate(this.info.usedTime);
  }

  returnClick(event) {
    return;
  }

  cardData: any = {}; //卡片数据

  usersHeight: number = 0;

  changeNodeViewVisiable() {
    this.nodeViewVisiable = !this.nodeViewVisiable;
    if (this.usersVisiable && this.nodeViewVisiable) {
      this.usersVisiable = false;
    }
  }

  getCollapsible() {
    if (!this.info.participants) {
      return;
    }
    // 超过三个节点直接展示下拉按钮
    if (this.info.participants.length > 3) {
      this.collapsible = true;
      return;
    }
    const count: number = this.info.participants.reduce(
      (p: any, n: any) =>
        n.participants.length > p ? n.participants.length : p,
      0,
    );
    setTimeout(
      () => {
        const dom = this.$refs.workflow as HTMLElement;
        if (dom) {
          this.collapsible = dom.clientHeight > 116;
        }
      },
      100 * count > 2000 ? 2000 : 100 * count,
    );
  }

  linkTrack() {
    if (!this.itemId) {
      this.$message.warn('workItemId为空。或者页面未加载完成，请稍后');
      return;
    }
    this.$emit('flowTrack');
  }

  @Watch('id', {
    immediate: true,
  })
  setId() {
    if (this.id) {
      workflowApi
        .getWorkflowBaseInfo({
          workflowInstanceId: this.id,
        })
        .then((res) => {
          if (res.errcode === 0) {
            common.utils.compatible(res.data || {}, 'workflowName');
            if (res.data && Array.isArray(res.data.participants)) {
              res.data.participants.forEach((d: any) => {
                common.utils.compatible(d, 'activityName');
              });
            }
            this.info = res.data || {};
            if (res.data && res.data.status === 'CANCELED') {
              this.$emit('setFinishTime', res.data.cancelTime);
            } else if (res.data && res.data.status === 'COMPLETED') {
              this.$emit('setFinishTime', res.data.finishTime);
            } else {
              //Else Empty block statement
            }
            this.$nextTick(() => {
              this.getCollapsible();
            });
          } else if (res.errcode === 402500) {
            this.$message.error('数据已被删除！');
          } else {
            this.$message.error(res.errmsg as string);
          }
          this.isLoaded = true;
        });
    }
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  updated() {
    // @ts-ignore
    this.usersHeight = document.querySelector(
      '.users-box .calcHeight',
    ).clientHeight;
  }

  showUsers(participantRelationsEllipsisList) {
    this.participantRelationsEllipsisList = participantRelationsEllipsisList;
    this.usersVisiable = !this.usersVisiable;
    if (this.nodeViewVisiable) {
      this.nodeViewVisiable = false;
    }
  }

  hide() {
    this.usersVisiable = false;
    this.participantRelationsEllipsisList = null;
  }
}
</script>
<style lang="less" scoped>
// @import "~@/styles/themes/default.less";
@import './../../../../../cloudpivot/common/common';
@import '~cloudpivot/application/src/components/pc/style/custom-themes';

.activity-list-box {
  // width: 100%;
  height: auto;
  background: #fafafa;
  border: 1px solid #eaeaea;
  padding: 16px 36px 16px 20px;
  position: relative;
  margin-top: 2px;
  .width-box {
    width: 100%;
  }
  .h-icon-all-close {
    font-size: 12px;
    width: 12px;
    height: 12px;
    color: rgba(17, 18, 24, 0.5);
    position: absolute;
    top: 12px;
    right: 16px;
    cursor: pointer;
  }
  .display-content {
    font-size: 12px;
    max-height: 83px;
    line-height: 20px;
    overflow: hidden;
    padding: 0;
    /deep/ .user-name {
      margin-right: 12px;
      &:hover {
        color: @highlightColor;
      }
    }
  }
  .showAllButton {
    // width: 40px;
    padding: 0 5px;
    height: 20px;
    color: rgba(17, 18, 24, 0.5);
    line-height: 18px;
    font-size: 12px;
    position: absolute;
    bottom: 16px;
    right: 28px;
    background: #e3e3e3;
    border-radius: 2px;
    &:hover {
      cursor: pointer;
      color: #5291ff;
      background-color: #fff;
      border: 1px solid #5291ff;
    }
  }
}

.workflow-info {
  background: #f1f2f6;
  position: relative;
  margin-bottom: 32px;
  // padding-left: 32px;
  // padding-right: 32px;

  &.collapsed > &__col1 {
    flex-grow: 1;
  }

  &__col1 {
    margin: @base10-padding-md @base10-padding-lg;
    overflow: hidden;

    a {
      color: @light-color-1;
    }

    table {
      width: 100%;
      table-layout: fixed;
    }

    table td {
      padding: 4px;
    }

    tbody td {
      color: @light-color-1;

      & > a:not(:last-child)::after {
        content: '、';
      }
    }

    .cur-node {
      background: linear-gradient(
        90deg,
        rgba(41, 112, 255, 0.1) 0%,
        rgba(255, 255, 255, 0) 100%
      );
      &-name {
        font-weight: bold;
      }
    }
  }

  &__col2 {
    padding: @base10-padding-md @base4-padding-md;
    flex-grow: 1;
    flex-shrink: 0;
    text-align: right;

    div {
      margin-bottom: @base4-padding-xs;
    }

    a {
      color: @primary-color;
    }
  }

  .workflow-info__status {
    height: 72px;
    padding: 0 32px;
  }
  .left {
    display: flex;
    align-items: center;
    .item1 {
      width: 30%;
    }
    .item2 {
      width: 40%;
    }
    .item1,
    .item2 {
      padding: 0 24px;
      .label {
        margin-bottom: 8px;
        height: 20px;
        font-size: 12px;
        font-weight: 400;
        color: rgba(17, 18, 24, 0.5);
        line-height: 20px;
      }
    }
    .left-content {
      display: flex;
      flex: 1;
    }
  }
  .linkTrack {
    padding: 0 32px;
    i {
      vertical-align: baseline;
      margin-left: 4px;
    }

    a {
      white-space: nowrap;
      display: flex;
      align-items: center;
      color: @highlightColor;
      &:hover {
        opacity: 0.8;
      }
      i {
        font-size: 12px;
      }
    }
  }
  .wrapper2 {
    position: relative;
    bottom: 2px;
  }

  & > i {
    cursor: pointer;
    position: absolute;
    transform: rotate(270deg);
    color: @light-color-3;
    bottom: 6px;
    left: 50%;

    &.collapsed {
      transform: rotate(90deg);
    }
  }

  .hidden {
    max-height: 116px !important;
  }

  .user-name {
    color: rgba(0, 0, 0, 0.85);
    &:hover {
      color: @primary-color;
    }
  }
}

.display-popover-customize {
  background-color: #f00;
}
.wrapper {
  display: flex;
  align-items: center;
  > span {
    margin-right: 5px;
    &.node-name {
      display: inline-block;
      max-width: 114px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.h-icon-all-ellipsis-o {
  // margin-bottom: 2px;
  &::before {
    width: 12px;
    height: 12px;
    background: rgba(17, 18, 24, 0.25);
    font-size: 12px;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
  }
}
</style>

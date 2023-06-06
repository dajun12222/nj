<template>
  <div class="form-approvals">
    <div class="form-approvals__header">
      <div class="form-approvals__info">
        <h3-avatar :src="getImageUrl(creater)" icon="user" />
      </div>
      <div class="form-approvals__content">
        <label>{{ creater.name }}</label>
        <span v-if="participants && participants.length">
          {{ $t('cloudpivot.flow.mobile.Participants') }}
          <template v-for="(item, i) in participants">
            <span
              v-for="(participant, index) in item.participants"
              :key="i + '_' + index"
              class="participant"
              >{{ participant.name }}</span>
          </template>
        </span>
      </div>
      <workflow-status
        class="form-approvals__status"
        :status="workflowInfo.status"
      />
    </div>
    <approval :approvals="approvals" @goSubInstance="goSubInstance" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Provide } from 'vue-property-decorator';

import { H3Avatar } from 'h3-mobile-vue';

import Approval from './approval.vue';

import WorkflowStatus from '../shared/workflow-status/workflow-status.vue';

import { workflow } from '../../../../api';

import getDownloadUrlNew from '../../../../common/src/utils/getDownloadUrlNew';

@Component({
  name: 'form-approvals',
  components: {
    H3Avatar,
    WorkflowStatus,
    Approval,
  },
})
export default class FormApprovals extends Vue {
  @Prop({ default: () => [] }) approvals!: workflow.ApprovalInstance[];

  @Prop({
    default: {},
  })
  creater!: any;

  @Prop({
    default: {},
  })
  workflowInfo!: any;

  @Prop({
    default: {},
  })
  participants!: any;

  @Provide()
  emitPreview(file: any) {
    this.$emit('preview', file);
  }

  @Provide()
  emitDetail(params: any) {
    this.$emit('detail', params);
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrl(refId: string) {
    let url = `${
      this.apiHost
    }/api/aliyun/download?refId=${getDownloadUrlNew.getRefId(refId)}`;
    if (this.token) {
      url += '&T=' + this.token;
    }
    return url;
  }

  getImageUrl(user: any) {
    if (user.imgUrl && user.imgUrl.includes('http')) {
      return user.imgUrl;
    } else if (user.imgUrl) {
      return this.getDownloadUrl(user.imgUrl);
    } else {
      //Else Empty block statement
    }
    return '';
  }

  goSubInstance(log: any) {
    this.$emit('goSubInstance', log);
  }
}
</script>

<style lang="less" scoped>
@import '../../../../common/styles/mixins.less';

.form-approvals {
  &__header {
    display: flex;
    position: relative;
    .px2rem(padding, @horizontal-padding-lg);
    background-color: #fff;
    box-sizing: border-box;
  }
  &__info {
    display: flex;
    align-items: center;

    & > img {
      flex: 0 0 40px;
      .px2rem(margin-right, @horizontal-padding-lg);
      .px2rem(margin-bottom, 10px);
    }
  }
  &__content {
    display: flex;
    flex-basis: 100%;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    text-align: left;
    padding-left: 0.4rem;
    label {
      color: @text-color-main;
      font-weight: 600;
      .px2rem(font-size, @font-size-md);
    }
    & > span {
      color: @text-color-describe;
      .px2rem(margin-top, @vertical-padding-md);
      .px2rem(font-size, @font-size-xs);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &__status {
    // position: absolute;
    .px2rem(top, 23px);
    .px2rem(right, 25px);
    .px2rem(width, 125px);
    .px2rem(height, 104px);
  }

  .participant:not(:last-child) {
    &::after {
      content: ', ';
    }
  }
}
</style>

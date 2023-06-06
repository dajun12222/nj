<template>
  <div class="user-popover-ellipsis">
    <template v-if="participantRelationsShowList.length > 0">
      <user-popover
        v-for="(participant, index) in participantRelationsShowList"
        :key="index"
        :user="participant"
        :isTrust="participant.isTrust"
        :trustorVO="participant.trustorProcessor"
        :trustorId="participant.trustorId"
        :workItemId="participant.workitemId"
      />
    </template>
    <template v-if="participantRelations.length > 1">
      <div class="display-ellipsis" @click="showUsers">
        <!-- <img :src="getImageUrl(participantRelations[2])" alt=""/> -->
        <span class="count">{{
          participantRelations.length - 1 > 99
            ? '99+'
            : '+' + (participantRelations.length - 1)
        }}</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Popover } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserPopover from './user-popover.vue';
import getDownloadUrlNew from '../../../utils/getDownloadUrlNew';
@Component({
  name: 'user-popover-ellipsis',
  components: {
    UserPopover,
    APopover: Popover,
  },
})
export default class UserPopoverEllipsis extends Vue {
  @Prop() participantRelations?: any; //人员信息列表

  @Prop({ default: 'display-popover' }) popoverClass?: string; //自定义class

  popoverVisible: boolean = false; //气泡框是否显示

  created() {}

  getImageUrl(userInfo) {
    if (userInfo.imgUrl && userInfo.imgUrl.includes('http')) {
      return userInfo.imgUrl;
    } else if (userInfo.imgUrl) {
      return this.getDownloadUrlNew(userInfo.imgUrl);
    } else {
      //Else Empty block statement
    }
    const userImg = require('./../../../../../flow/src/components/pc/image/user.png');
    return userImg || '';
  }

  get participantRelationsShowList() {
    return this.participantRelations.filter((res, index) => index < 1);
  }

  get participantRelationsEllipsisList() {
    return this.participantRelations.filter((res, index) => index >= 1);
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }

  hide() {
    this.popoverVisible = false;
  }

  showUsers() {
    this.$emit('showUsers', this.participantRelationsEllipsisList);
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
.user-popover-ellipsis {
  display: flex;
  /deep/ .user-name {
    margin-right: 16px;
    margin-bottom: 0;
    color: #111218;
    display: flex;
    align-items: center;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover {
      color: @highlightColor !important;
    }
    img {
      object-fit: cover;
    }
  }
  /deep/ .avatar {
    width: 22px;
    height: 22px;
    border: 1px solid #eaedf3;
    margin-right: 8px;
  }
  .display-ellipsis {
    display: inline-block;
    position: relative;
    cursor: pointer;
    img {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      filter: blur(2px);
      object-fit: cover;
    }
    .count {
      display: inline-block;
      top: 1px;
      left: 0;
      padding: 0 4px;
      min-width: 22px;
      border-radius: 11px;
      text-align: center;
      line-height: 22px;
      background: rgba(17, 18, 24, 0.25);
      font-size: 10px;
      color: #fff;
    }
  }
}
</style>
<style lang="less">
.display-popover,
.display-popover-customize {
  .h-icon-all-close {
    position: absolute;
    top: 18px;
    right: 15px;
    cursor: pointer;
  }
  .user-name {
    color: #111218;
    margin-right: 10px;
    line-height: 20px;
    font-size: 12px;
  }
  .ant-popover-inner-content {
    padding: 16px 36px 16px 20px;
    background: #fafafa;
    border: 1px solid #eaeaea;
    width: 1000px;
    border-radius: 4px;
  }
  .ant-popover-inner {
    box-shadow: none;
  }
}
/**
  自定义样式
*/
.display-popover-customize {
  .ant-popover-inner-content {
    width: 654px;
    padding: 0 !important;
  }
}
.ant-popover-content > .ant-popover-arrow {
  border-top-color: #fafafa;
  border-left-color: #fafafa;
}

.display-popover {
  left: 0px !important;
}
</style>

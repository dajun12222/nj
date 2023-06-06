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
      <a-popover
        v-model="popoverVisible"
        arrowPointAtCenter
        :overlayClassName="popoverClass + ' display-popover'"
        placement="bottom"
        trigger="click"
        :getPopupContainer="getPopupContainer"
      >
        <div slot="content" class="display-content">
          <div :class="canExpand ? 'expand-box' : ''">
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
            v-if="Math.floor(usersHeight) > 87 && canExpand"
            size="small"
            class="showAllButton"
            @click="changeMaxHeight"
          >
            {{
              Math.floor(curHeight) > 87
                ? $t('cloudpivot.form.renderer.collapse')
                : $t('cloudpivot.form.renderer.expand')
            }}
          </button>
        </div>
        <div class="display-ellipsis">
          <span class="count">{{
            participantRelations.length - 1 > 99
              ? '99+'
              : '+' + (participantRelations.length - 1)
          }}</span>
        </div>
      </a-popover>
    </template>
  </div>
</template>

<script lang="ts">
import { Popover } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserPopover from './user-popover.vue';

import customPopover from '../../../../../form/src/common/components/customPopover.vue';
import getDownloadUrlNew from '../../../utils/getDownloadUrlNew';
@Component({
  name: 'user-popover-ellipsis',
  components: {
    UserPopover,
    APopover: Popover,
    customPopover,
  },
})
export default class UserPopoverEllipsis extends Vue {
  @Prop() participantRelations?: any; //人员信息列表

  @Prop({ default: 'display-popover' }) popoverClass?: string; //自定义class

  @Prop({ default: '1000px' }) popWidth?: string;

  @Prop({ default: '.worflow-track-base-info-node' }) baseParent?: string;

  @Prop({ default: false }) canExpand?: boolean;

  popoverVisible: boolean = false; //气泡框是否显示

  customPopoverVisible: boolean = false; //气泡框是否显示

  id: number = +new Date();

  created() {
    this.id = +new Date();
  }

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

  curHeight: number = 0;

  changeMaxHeight() {
    const node: any = document.querySelector(
      '.' + this.popoverClass + ' .expand-box',
    );
    if (Math.floor(this.curHeight) > 87) {
      node.style['maxHeight'] = '87.6px';
      this.curHeight = 87.6;
    } else {
      node.style['maxHeight'] = 'none';
      this.curHeight = this.usersHeight;
    }
  }

  usersHeight: number = 0;

  updated() {
    if (this.canExpand) {
      // @ts-ignore
      this.usersHeight = document.querySelector(
        '.' + this.popoverClass + ' .calcHeight',
      ).clientHeight;
    }
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
    margin-right: 5px;
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
    top: 14px;
    right: 16px;
    cursor: pointer;
    font-size: 12px;
  }
  .user-name {
    color: #111218;
    margin-right: 10px;
    line-height: 20px;
    font-size: 12px;
  }
  .ant-popover-inner-content {
    padding: 22px 36px 16px 20px;
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
body .display-popover-customize {
  left: -160px !important;
  .ant-popover-inner-content {
    width: 660px;
    padding: 0 !important;
  }
  .ant-popover-arrow {
    visibility: hidden;
  }
}
.current-node {
  .ant-popover-placement-bottom,
  .ant-popover-placement-bottomLeft,
  .ant-popover-placement-bottomRight {
    padding-top: 6px;
  }
  .display-content {
    max-height: 240px;
    overflow: auto;
  }
}

.ant-popover-content > .ant-popover-arrow {
  border-top-color: #fafafa;
  border-left-color: #fafafa;
}

.display-popover {
  left: 0px !important;
  .ant-popover-arrow {
    visibility: hidden;
  }
  .ant-popover-inner-content {
    padding: 0 !important;
  }
}
.expand-box {
  max-height: 87.6px;
  overflow: hidden;
}
.display-content {
  padding: 16px 36px 16px 24px;
  position: relative;
  text-align: justify;
  .user-name {
    line-height: 21px;
    margin-right: 8px !important;
  }
  i.close {
    position: absolute;
    right: 18px;
    top: 8px;
    cursor: pointer;
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
}
</style>

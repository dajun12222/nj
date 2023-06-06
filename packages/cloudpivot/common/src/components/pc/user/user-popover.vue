<template>
  <a-popover
    trigger="click"
    :visible="isShowPop && !isExternal && !isWorlflowMock"
    @visibleChange="onVisibleChange($event)"
  >
    <user-card slot="content" :userId="user.id || user.participantVO.id" />
    <a class="user-name" @click.stop="() => {}">
      <div v-if="showCur" class="cur-trust"></div>
      <div v-if="!isHiddenImg" class="img-wrapper">
        <img v-if="imgUrl" class="avatar" :src="imgUrl" alt="" />
        <i v-else class="icon aufontAll h-icon-all-head-portrait"></i>
      </div>
      <span>
        {{
          (isTrust && trustorVO && trustorVO.id
            ? `${user.name}${$t('cloudpivot.cloudpivotCommon.pc.trust', {
                name: trustorVO.name,
              })}`
            : user.name) || userInfo.name
        }}
      </span>
    </a>
  </a-popover>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import getDownloadUrlNew from '../../../utils/getDownloadUrlNew';

import { Popover } from '@h3/antd-vue';
import UserCard from './user-card.vue';
import { userApi } from '../../../../../api';

@Component({
  name: 'user-popover',
  components: {
    APopover: Popover,
    UserCard,
  },
})
export default class UserPopover extends Vue {
  @Prop({
    default: {},
  })
  user!: any;

  @Prop({ default: false }) isTrust?: boolean; // 是否被委托

  @Prop() trustorVO?: any; // 委托人

  @Prop() trustorId?: any;

  @Prop() workItemId?: any;

  @Prop() isHiddenImg?: boolean; //是否隐藏头像

  @Prop() isShow?: boolean; //是否显示

  // 是否为流程模拟
  get isWorlflowMock() {
    if (this.$route.query && this.$route.query.workflowMock) {
      return true;
    }
    return false;
  }

  get showCur() {
    if (this.trustorVO && this.trustorVO.id) {
      return this.isTrust && this.workItemId === this.trustorId;
    }
    return false;
  }

  // 是否为外部用户
  get isExternal() {
    if ((window as any).isExternal) {
      return true;
    }
    return false;
  }

  isShowPop: boolean = false;

  onVisibleChange(visible: boolean) {
    this.isShowPop = visible;
  }

  userInfo: any = {};

  async setUserId() {
    if ((this.user && this.user.id) || this.user.participantVO.id) {
      const id = this.user.id || this.user.participantVO.id;
      if (id && id !== '---') {
        await userApi.getUserInfo(id).then((res) => {
          if (res.errcode !== 0) {
            (this as any).$message.error(res.errmsg);
            return;
          }
          this.userInfo = res.data;
          this.imgUrl = this.getImageUrl();

          //  this.$set(this.userInfo,'name',res.data.name);
        });
      }
    } else {
      this.imgUrl = this.getImageUrl();
    }
  }

  created() {
    this.setUserId();
  }

  mounted() {}

  @Watch('user')
  onUserChange() {
    this.setUserId();
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

  imgUrl: string = '';

  getImageUrl() {
    const user = this.userInfo;
    if (user.imgUrl && user.imgUrl.includes('http')) {
      return user.imgUrl;
    } else if (user.imgUrl) {
      return this.getDownloadUrlNew(user.imgUrl);
    } else if (user.imgUrlId) {
      return this.getDownloadUrlNew(user.imgUrlId);
    } else {
      //Else Empty block statement
    }
    const userImg = require('./../../../../../flow/src/components/pc/image/user.png');
    return userImg || '';
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
.cur-trust {
  width: 0;
  height: 0;
  display: inline-block;
  vertical-align: middle;
  border-top: 5px solid transparent;
  border-left: 10px solid #32b683;
  border-bottom: 5px solid transparent;
}
.img-wrapper {
  display: inline-block;
  line-height: 1;
  i {
    font-size: 22px;
    color: #ffb131;
    margin-right: 8px;
    background: #fff;
    border-radius: 50%;
  }
  & + span {
    height: 22px;
    line-height: 22px;
  }
}
.user-name {
  &:hover {
    color: @highlightColor;
  }
  span {
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

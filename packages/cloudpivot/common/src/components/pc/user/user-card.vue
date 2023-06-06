<template>
  <div class="author-card">
    <div class="author-card-top">
      <div class="img-wrapper">
        <img
          v-if="user.imgUrl && user.imgUrl.includes('http')"
          :src="user.imgUrl"
        />
        <img v-else-if="user.imgUrl" :src="getDownloadUrlNew(user.imgUrl)" />
        <img
          v-else-if="user.imgUrlId"
          :src="getDownloadUrlNew(user.imgUrlId)"
        />
        <i v-else class="icon aufontAll h-icon-all-head-portrait"></i>
      </div>
      <div class="author-card-right">
        <h2>{{ user.name || '--' }}</h2>
        <div class="userInfo-right-cn">
          <i class="icon aufontAll h-icon-all-tablet"></i>
          <span>{{ user.mobile || '--' }}</span>
        </div>
        <div class="userInfo-right-cn">
          <i class="icon aufontAll h-icon-all-mail"></i>
          <span>{{ user.email || '--' }}</span>
        </div>
      </div>
    </div>

    <div class="author-card-bottom">
      <div class="author-card-bottom-li">
        <span>{{ $t('cloudpivot.flowCenter.pc.userCard.organization') }}:</span>
        <span class="cn">
          <span v-if="user.mainDepartmentName">
            <a-tooltip>
              <div slot="title">
                <span>{{ user.mainDepartmentName.mainDeptPath }}</span>
              </div>
              {{ user.mainDepartmentName.name }},
            </a-tooltip>
          </span>
          <template v-if="user.departmentNames">
            <span v-for="(item, index) in user.departmentNames" :key="index">
              <a-tooltip>
                <div slot="title">
                  <span>{{ item.mainDeptPath }}</span>
                </div>
                {{ item.name }},
              </a-tooltip>
            </span>
            <!-- {{ user.departmentName || '--' }} -->
          </template>
        </span>
      </div>
      <div class="author-card-bottom-li">
        <span>{{ $t('cloudpivot.flowCenter.pc.userCard.jobNumber') }}:</span>
        <span class="cn">{{ user.employeeNo || '--' }}</span>
      </div>
      <div class="author-card-bottom-li">
        <span>{{ $t('cloudpivot.flowCenter.pc.userCard.position') }}:</span>
        <span class="cn">{{ user.position || '--' }}</span>
      </div>
      <div class="author-card-bottom-li" style="margin-bottom: 0">
        <span>{{ $t('cloudpivot.flowCenter.pc.userCard.role') }}:</span>
        <span class="cn">{{ user.roleName || '--' }}</span>
      </div>
    </div>

    <div v-if="user.relatedType === 'DINGTALK'" class="dingtalk-btn">
      <i class="icon aufontAll h-icon-all-dingding-circle"></i>
      <a
        :href="
          'dingtalk://dingtalkclient/action/sendmsg?dingtalk_id=' + user.mobile
        "
      >
        {{ $t('cloudpivot.flowCenter.pc.userCard.dingTalkCall') }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { Avatar, Button, Tooltip } from '@h3/antd-vue';

import { userApi } from '../../../../../api';

import getDownloadUrlNew from '../../../utils/getDownloadUrlNew';
@Component({
  name: 'user-card',
  components: {
    AAvatar: Avatar,
    AButton: Button,
    ATooltip: Tooltip,
  },
})
export default class UserCard extends Vue {
  @Prop({
    default: '',
  })
  userId!: string;

  get locale() {
    return localStorage.getItem('locale') || 'zh';
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

  user = '' as any;

  @Watch('userId', {
    immediate: true,
  })
  setUserId() {
    if (this.userId) {
      userApi.getUserInfo(this.userId).then((res) => {
        if (res.errcode === 0) {
          this.user = res.data;
        }
      });
    }
  }

  openDingTalk() {
    window.location.href = `dingtalk://dingtalkclient/action/sendmsg?dingtalk_id=${this.user.mobile}`;
  }
}
</script>

<style lang="less" scoped>
// @import "../../../styles/themes/default.less";

/deep/.ant-popover-inner-content {
  padding: 0;
  box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.15);
}

.author-card {
  width: 298px;
  // box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
  height: auto;
  background-color: #fff;
  padding: 12px 8px;
  box-sizing: border-box;
  cursor: initial;
  .author-card-top {
    width: 100%;
    border-bottom: 1px solid #eee;
    display: flex;
    padding-bottom: 20px;
    .img-wrapper {
      width: 70px;
      height: 70px;
      border-radius: 35px;
      margin-right: 16px;
      overflow: hidden;
      position: relative;
      text-align: center;
      border: 1px solid #dddddd;
      img {
        max-width: 100%;
        min-width: 100%;
        height: 100%;
        object-fit: cover;
      }
      i {
        margin-right: 18px;
        width: 70px;
        height: 70px;
        line-height: 70px;
        border-radius: 50%;
        font-size: 70px;
        text-align: center;
        color: #ffb131;
        vertical-align: bottom;
      }
    }
    > .author-card-right {
      flex: 1;
      > h2 {
        color: #111218;
        font-weight: 700;
        font-size: 18px;
        line-height: 18px;
      }
      > .userInfo-right-cn {
        font-size: 14px;
        color: #111218;
        font-weight: 400;
        margin-top: 8px;
        display: flex;
        align-items: center;
        > i {
          color: rgba(17, 18, 24, 0.5);
          margin-right: 8px;
          vertical-align: baseline;
          width: auto;
          height: auto;
          position: relative;
          top: 1px;
        }
        > span {
          display: inline-block;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          width: 170px;
        }
      }
    }
  }
  .author-card-bottom {
    width: 100%;
    padding-top: 20px;
    &-li {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: rgba(17, 18, 24, 0.5);
      font-size: 14px;
      font-weight: 400;
      > .cn {
        width: 242px;
        color: #111218;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }
}
.dingtalk-btn {
  width: 232px;
  height: 32px;
  background: #2970ff;
  border-radius: 2px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  line-height: 32px;
  margin: 24px auto 6px;
  cursor: pointer;
  i {
    vertical-align: bottom;
    color: #fff;
    margin-right: 14px;
  }
  a {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 400;
  }
}
</style>

<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-12-11 23:36:58
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-04 09:57:52
-->
<template>
  <div class="activity-popover">
    <div class="activity-list-box">
      <div class="width-box">
        <div v-for="(item, index) in list" :key="index" class="box-list">
          <div v-if="index !== 0" class="box-left" style="width: 162px">
            <div class="box-left-li">
              <div class="box-title">
                {{ $t('cloudpivot.flowCenter.pc.curActivity') }}
              </div>
              <div class="box-cn">
                {{ item.activityName }}
              </div>
            </div>
          </div>
          <div v-if="index !== 0" class="box-right">
            <div class="box-right-li">
              <div class="box-title">
                {{ $t('cloudpivot.flowCenter.pc.curResolver') }}
              </div>
              <user-popover-ellipsis
                :participantRelations="item.participantRelations"
              />
            </div>
          </div>
        </div>
        <i class="icon aufontAll h-icon-all-close" @click="close"></i>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import UserPopoverEllipsis from '../../../../../common/src/components/pc/user/user-popover-ellipsis.vue';

import { Popover } from '@h3/antd-vue';
@Component({
  name: 'activity-list-popover',
  components: {
    APopover: Popover,
    UserPopoverEllipsis,
  },
})
export default class ActivityListPopover extends Vue {
  @Prop() list?: any[];

  isShow: boolean = false;

  close() {
    this.$emit('changeVisiable');
  }
}
</script>
<style lang="less" scoped>
.activity-popover {
  .activity-list-box {
    width: 100%;
    height: auto;
    background: #fafafa;
    border: 1px solid #eaeaea;
    padding: 22px 0;
    position: relative;
    margin-top: 2px;
    .width-box {
      width: calc(100% - 70px);
    }
    .box-list {
      margin: 0 20% 0 121px;
      width: 100%;
      display: flex;
    }
    .box-left {
      width: 162px;
      &-li {
        margin-bottom: 13px;
      }
    }
    .box-right {
      width: 35%;
      flex: 1;
      &-li {
        margin-bottom: 13px;
      }
    }
    .box-title {
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
      font-weight: 400;
      margin-bottom: 8px;
    }
    .box-cn {
      color: #111218;
      font-size: 400;
      font-size: 14px;
    }
    .h-icon-all-close {
      font-size: 12px;
      width: 12px;
      height: 12px;
      color: rgba(17, 18, 24, 0.5);
      position: absolute;
      top: 14px;
      right: 16px;
      cursor: pointer;
    }
  }
  /deep/ .display-popover {
    width: 100%;
  }
  /deep/.display-popover .ant-popover-inner-content {
    width: 100%;
  }
}
.h-icon-all-ellipsis-o {
  width: 12px;
  height: 12px;
  background: rgba(17, 18, 24, 0.5);
  font-size: 12px;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
}
</style>
<style>
.activity-popover {
  left: 30px !important;
}
</style>

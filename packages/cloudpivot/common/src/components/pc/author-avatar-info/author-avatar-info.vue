<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-12-11 20:51:43
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-25 16:31:10
-->
<template>
  <div>
    <a-popover
      trigger="click"
      placement="topLeft"
      @visibleChange="authorChange(item.sourceId)"
    >
      <template slot="content">
        <AuthorCard
          class="author-card"
          :authorId="item.sourceId"
          :cardData="cardData"
        />
      </template>
      <div class="author" @click.stop="returnClick">
        <img
          v-if="item.imgUrl && item.imgUrl.includes('http')"
          :src="item.imgUrl"
        />
        <img v-else-if="item.imgUrl" :src="getDownloadUrlNew(item.imgUrl)" />
        <i v-else class="icon aufontAll h-icon-all-head-portrait"></i>

        <!-- <template v-else>
          <span class="icon-wrapper">
            <i v-if="item.type === 1" class="icon aufontAll h-icon-all-process-o default-avatar"></i>
            <i v-else class="icon aufontAll h-icon-all-user-o default-avatar"></i>
          </span>
        </template> -->
        <span v-if="!item.onlyImg" class="cn">{{ item.sourceName }}</span>
      </div>
    </a-popover>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import OrgApi from '../api/organization';
import AuthorCard from '../author-card/author-card.vue';
import { Popover } from '@h3/antd-vue';
import getDownloadUrlNew from '../../../utils/getDownloadUrlNew';
@Component({
  name: 'author-avatar-info',
  components: {
    AuthorCard,
    APopover: Popover,
  },
})
export default class AuthorAvatarInfo extends Vue {
  @Prop({
    default: {
      sourceId: '',
      imgUrl: '',
      sourceName: '',
      onlyImg: false,
    },
  })
  item?: any;

  //   @Prop()sourceId?:string;
  //   @Prop()imgUrl!:any;
  //   @Prop()sourceName!:string;

  cardData: any = {}; //卡片数据

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  returnClick(event) {
    return;
  }

  /**
   * 获取数据
   */
  async authorChange(id: string) {
    console.log(id);

    this.cardData = {};
    const res = await OrgApi.getOrgUserInfo({ id: id });
    if (res.errcode === 0) {
      this.cardData = res.data;
    }
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }
}
</script>
<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
.author {
  overflow: inherit;
  position: relative;
  font-size: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 24px;
  line-height: 24px;
  > img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 4px;
    object-fit: cover;
    background-color: #fff;
    border: 1px solid #dddddd;
  }
  > i {
    margin-right: 4px;
    width: 24px;
    height: 24px;
    line-height: 24px;
    border-radius: 50%;
    font-size: 24px;
    text-align: center;
    color: #ffb131;
    vertical-align: bottom;
    background: #fff;
  }
  .author-card {
    left: 16px;
    top: 32px;
  }
  .cn {
    color: #111218;
    &:hover {
      color: @highlightColor !important;
    }
  }
}
.icon-wrapper {
  display: inline-block;
  width: 24px;
  height: 24px;
  min-width: 24px;
  line-height: 24px;
  border-radius: 50%;
  background-color: rgba(17, 18, 24, 0.25);
  text-align: center;
  margin-right: 6px;
  i {
    line-height: 24px !important;
    color: #fff !important;
    font-size: 14px !important;
  }
}
</style>

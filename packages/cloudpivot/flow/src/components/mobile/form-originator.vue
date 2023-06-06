<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-01-04 18:06:34
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-04 09:56:58
 * @FilePath: \yunshu6.0\modules\cloudpivot\flow\src\components\mobile\form-originator.vue
 * @Description:
-->

<template>
  <div class="form-originator">
    <div>
      <h3-avatar icon="user" :src="getImageUrl(user)" />
    </div>

    <div>
      <div class="form-originator__title">
        {{ user.name }}
      </div>
      <div class="form-originator__desc">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { H3Avatar } from 'h3-mobile-vue';

import getDownloadUrlNew from '../../../../common/src/utils/getDownloadUrlNew';

@Component({
  name: 'form-originator',
  components: {
    H3Avatar,
  },
})
export default class FormOriginator extends Vue {
  @Prop({
    default: {},
  })
  user!: any;

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
}
</script>

<style lang="less" scoped>
@import '../../../../common/styles/mixins.less';

.form-originator {
  display: flex;
  background-color: #fff;

  & > div:first-child {
    .px2rem(margin-right, @font-size-base);
  }

  &__title {
    color: @text-color-main;
    font-weight: 500;
    .px2rem(font-size, @font-size-md);
    .px2rem(margin-bottom, @vertical-padding-xs);
  }

  &__desc {
    color: @text-color-describe;
    .px2rem(font-size, @font-size-xs);
  }
}
</style>

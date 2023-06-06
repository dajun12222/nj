<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <li class="content-item" @click="onClickApp(item.code)">
    <a-popover
      placement="rightTop"
      trigger="click"
      overlayClassName="popover"
      :getPopupContainer="getPopupContainer"
      @visibleChange="onVisibleChange($event, item.code)"
    >
      <template slot="content">
        <p @click.stop="editItem(item)">
          {{ $t('languages.Apps.Setting') }}
        </p>
        <p @click.stop="popItem(item)">
          {{ $t('languages.Apps.Delete') }}
        </p>
        <p @click.stop="exportApp(item)">导出</p>
      </template>
      <i
        class="icon aufontAll h-icon-all-setting-o setting"
        :class="{ isshow: showIcon && iconCode === item.code }"
        @click.stop="() => {}"
      ></i>
    </a-popover>
    <div
      v-if="!item.enabled"
      :style="{
        'background-image': `url(~@/assets/images/icon_Not_enabled.svg)`,
      }"
      class="content-item-enabled"
    ></div>
    <template v-if="item.content">
      <div
        :style="{
          'background-image': `data:image/png;base64,(${item.content})`,
        }"
        class="content-item-icon"
      ></div>
    </template>
    <template v-else-if="item.logoUrl">
      <div
        v-if="item.logoUrl.indexOf('http') > -1"
        :style="{ 'background-image': `url(${item.logoUrl})` }"
        class="content-item-icon"
      ></div>
      <div
        v-else
        :style="{ 'background-image': `url(${getDownloadUrl(item.logoUrl)})` }"
        class="content-item-icon"
      ></div>
    </template>
    <div
      v-else
      :style="{
        'background-image': `url(${defaultAppIcon})`,
      }"
      class="content-item-icon"
    ></div>
    <!-- <template v-if="item.content">
            <img :src="'data:image/png;base64,'+item.content" class="content-item-icon"/>
          </template>
          <template v-else>
            <img :src="item.logoUrl || defaultAppIcon" class="content-item-icon"/>
          </template>-->

    <a-tooltip v-if="showTootip(item.displayName)" placement="top">
      <span slot="title">{{ item.displayName }}</span>
      <p class="content-item-name">
        {{ item.displayName }}
      </p>
    </a-tooltip>
    <p v-else class="content-item-name">
      {{ item.displayName }}
    </p>
  </li>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { H3Draggable } from '@/directives/drag';
import { getRealLength } from '@/common/utils';
import { Popover, Tooltip } from '@h3/antd-vue';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';

const icon = require('@/assets/images/appicon.png');

@Component({
  name: 'ModelItems',
  components: {
    APopover: Popover,
    ATooltip: Tooltip,
  },
})
export default class ModelItems extends Vue implements H3Draggable {
  @Prop() item!: any;

  defaultAppIcon: any = icon;

  @Prop() computedAppList!: any;

  @Prop() getPopupContainer!: any;

  @Prop() showIcon!: any;

  @Prop() iconCode!: any;

  onVisibleChange(visible: boolean, code: string) {
    this.$emit('onVisibleChange', visible, code);
  }

  editItem(item: any) {
    this.$emit('editItem', item);
  }

  popItem(item: any) {
    this.$emit('editItem', item);
  }

  exportApp(item: any) {
    this.$emit('editItem', item);
  }

  onClickApp(code: string) {
    this.$router
      .push({
        name: 'appitem',
        params: {
          appCode: code,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  onDragstart(evt: DragEvent) {
    if (evt.dataTransfer) {
      evt.dataTransfer.setData('item-data', JSON.stringify(this.item));
      evt.dataTransfer.setData(
        'origin-offsets',
        JSON.stringify({
          x: evt.offsetX,
          y: evt.offsetY,
        }),
      );
    }
    console.log('开始拖拽', evt);
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  get apiHost() {
    return (window as any).config.apiHost;
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

  /**
   * 应用名称超过20个字节时显示tooltip
   */
  showTootip(name: string) {
    return getRealLength(name) > 20;
  }
}
</script>

<style lang="less" scoped>
.content-item-icon {
  background-size: 100% 100%;
}
.content-item-enabled {
  position: absolute;
  top: 0;
  left: 0;
  width: auto;
  height: auto;
}
</style>

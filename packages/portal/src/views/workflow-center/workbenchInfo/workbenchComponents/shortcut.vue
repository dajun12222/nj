<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="shortcut">
    <pageHeader
      :currentPage="currentPage"
      :totalPage="totalPage"
      @pageChange="pageChange"
    >
      {{ $t('languages.common.workBenchInfo.Shortcut') }}
    </pageHeader>

    <div class="shortcut-wrapper">
      <div
        v-for="(item, index) in showAppList"
        :key="index"
        class="shortcut-item"
        @click="openDetail(item)"
      >
        <div class="name">
          <i
            class="icon aufontAll"
            :class="item.icon || 'h-icon-all-catalogue-o'"
          ></i>
          <span>{{ item.name }}</span>
        </div>
        <p>
          {{ $t('languages.common.workBenchInfo.Belong')
          }}{{
            isChinese
              ? item.appName
              : (item.appName_i18n && item.appName_i18n.en) ||
                (JSON.parse(item.appName_i18n) &&
                  JSON.parse(item.appName_i18n).en)
          }}
        </p>
      </div>

      <template v-if="!showAppList.length">
        <div class="img-wrapper">
          <img src="./images/emptycontent.png" alt="" />
          <p>{{ $t('languages.common.noData') }}</p>
        </div>
      </template>
    </div>

    <!-- 详情弹出层 -->
    <IframeModal
      :showIframeForm="showIframeForm"
      :IframeFormUrl="IframeFormUrl"
      @close="closeModal"
    />
  </div>
</template>

<script lang="ts">
import { workbenchApi } from 'cloudpivot/api';
import toolMixin from 'cloudpivot/flow-center/src/components/pc/common/toolMixin'; //公共处理模块
import IframeModal from 'cloudpivot/flow-center/src/components/pc/components/iframe-modal/iframe-modal.vue';
import { mixins } from 'vue-class-component';
import { Component } from 'vue-property-decorator';
import pageHeader from './pageHeader.vue';

interface SHORTCUT {
  appCode: string;
  appName: string;
  appName_i18n: string;
  code: string;
  icon: string;
  id: string;
  name: string;
  name_i18n: string;
  type: string;
}

@Component({
  name: 'Shortcut',
  components: {
    pageHeader,
    IframeModal,
  },
})
export default class Shortcut extends mixins(toolMixin) {
  [x: string]: any;

  showIframeForm: boolean = false;

  IframeFormUrl: string = '';

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  closeModal() {
    this.showIframeForm = false;
    this.IframeFormUrl = '';
    this.$emit('closeIframeForm', 'shortcut');
  }

  /**
   * 发起流程
   */
  openDetail(obj) {
    let url: string = '';
    if (obj.type === 5) {
      const code = obj.code;
      url = `/form/detail?startWorkflowCode=${code}`;
      url += `&return=${
        location.pathname + encodeURIComponent(location.search)
      }`;
    } else {
      url = `/form/detail?schemaCode=${obj.code}&sheetCode=&queryCode=`;
      url += `&return=${
        location.pathname + encodeURIComponent(location.search)
      }`;
    }

    if (this.isDingTalk) {
      this.$router
        .push({
          path: url,
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      this.IframeFormUrl = url;
      this.showIframeForm = true;
    }
  }

  totalPage: number = 10;

  currentPage: number = 0;

  pageSize: number = 5;

  list: SHORTCUT[] = [];

  pageChange(type: 'prev' | 'next') {
    if (type === 'prev' && this.currentPage !== 0) {
      this.currentPage = this.currentPage - 1;
      this.getList();
    } else if (type === 'next' && this.currentPage !== this.totalPage - 1) {
      this.currentPage = this.currentPage + 1;
      this.getList();
    } else {
      //Else Empty block statement
    }
  }

  get showAppList() {
    const start: number = this.currentPage * this.pageSize;
    return this.list.slice(start, start + this.pageSize);
  }

  async getList() {
    const res = await workbenchApi.getListFavoritesShortcut();
    if (res.errcode === 0) {
      this.list = res.data as SHORTCUT[];
      this.totalPage = Math.ceil(res.data.length / this.pageSize);
    }
  }

  created() {
    this.getList();
  }

  mounted() {
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event) {
    if (event.data === 'close') {
      this.showIframeForm = false;
      this.IframeFormUrl = '';
      this.$emit('refreshData', true);
    }
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
.img-wrapper {
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  color: rgba(17, 18, 24, 0.5);
  line-height: 22px;
  img {
    width: 160px;
    height: 160px;
    margin-top: 36px;
  }
}

.shortcut {
  background-color: #fff;
  height: 362px;
  min-width: 320px;
  flex: 1;
  .page-header {
    padding: 24px 24px 0 24px;
  }

  .shortcut-wrapper {
    padding-top: 12px;
    .shortcut-item {
      // margin-top: 16px;
      padding-left: 24px;
      padding-right: 24px;
      padding-top: 8px;
      padding-bottom: 8px;
      .name {
        display: flex;
        align-items: center;
        font-size: 14px;
        line-height: 22px;
        margin-bottom: 2px;
        i {
          font-size: 16px;
          margin-right: 9px;
          color: @highlightColor;
        }
        span {
          display: inline-block;
          max-width: 261px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      &:hover {
        cursor: pointer;
        background: @activeBGColor;
        .name {
          color: @highlightColor;
        }
      }
      p {
        color: rgba(17, 18, 24, 0.5);
        font-size: 12px;
        line-height: 20px;
        max-width: 286px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>

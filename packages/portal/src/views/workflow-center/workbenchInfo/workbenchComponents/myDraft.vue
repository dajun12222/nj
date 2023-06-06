<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="my-draft">
    <pageHeader>
      {{ $t('languages.common.workBenchInfo.MyDraft')
      }}<span class="num">（{{ totalCount }}）</span>

      <template v-if="totalCount !== 0" slot="right">
        <span class="to-more" @click="showMore">
          {{ $t('languages.common.LoadMore') }}
        </span>
      </template>
    </pageHeader>

    <div class="my-draft-wrapper">
      <div
        v-for="(item, index) in list"
        :key="index"
        :title="item.name"
        class="draft-item"
        @click="openDetail(item)"
      >
        <div class="name">
          {{ item.name }}
        </div>
        <div class="time">
          {{
            moment(item.startTime || item.createdTime).format(
              'YYYY-MM-DD HH:mm',
            )
          }}
        </div>
      </div>

      <template v-if="!list.length">
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
import moment from 'moment';
import { mixins } from 'vue-class-component';
import { Component } from 'vue-property-decorator';
import pageHeader from './pageHeader.vue';

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

  closeModal() {
    this.showIframeForm = false;
    this.IframeFormUrl = '';
    this.$emit('closeIframeForm', 'draft');
  }

  /**
   * 打开表单详情
   */
  openDetail(obj) {
    let url = '';
    if (obj.formType === 3) {
      url = `/form/detail?workitemId=${obj.bizObjectKey}&workflowInstanceId=${obj.workflowInstanceId}`;
    } else if (obj.formType === 2) {
      url = `/form/detail?workflowInstanceId=${obj.workflowInstanceId}`;
    } else {
      url = `/form/detail?sheetCode=${obj.sheetCode}&objectId=${obj.bizObjectKey}&schemaCode=${obj.schemaCode}&isWorkFlow=false`;
    }

    url += '&return=/workbench-center/workbench';

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

  showMore() {
    this.$router.push('draft-list');
  }

  totalCount: number = 0;

  currentPage: number = 0;

  pageSize: number = 6;

  list: any[] = [];

  async getList() {
    const res = await workbenchApi.getUserdraftList({
      page: 0,
      size: this.pageSize,
    });
    if (res.errcode === 0) {
      this.list = res.data.content;
      this.totalCount = res.data.totalElements;
    }
  }

  created() {
    this.getList();
    this.moment = moment;
  }

  mounted() {
    window.addEventListener('message', this.reloadMessage, false);
  }

  reloadMessage(event) {
    if (event.data === 'close') {
      this.showIframeForm = false;
      this.IframeFormUrl = '';
    }
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
span.num {
  font-weight: 400;
  color: @highlightColor;
}

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
.my-draft {
  background-color: #fff;
  height: 362px;
  min-width: 320px;
  flex: 1;
  .page-header {
    padding: 24px 24px 0 24px;
  }
  .to-more {
    font-size: 12px;
    color: #484848;
    line-height: 20px;
    cursor: pointer;
    &:hover {
      color: @highlightColor;
    }
  }

  .my-draft-wrapper {
    margin-top: 16px;
    .draft-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 22px;
      padding: 10px 24px;
      margin-bottom: 8px;
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        margin-right: 16px;
      }
      &:hover {
        cursor: pointer;
        background: @activeBGColor;
        .name {
          color: @highlightColor;
        }
      }
      .time {
        color: rgba(17, 18, 24, 0.5);
        font-size: 12px;
      }
    }
  }
}
</style>

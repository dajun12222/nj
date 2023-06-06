<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="application-portal">
    <div class="application-portal-wrapper">
      <div class="head">
        <div class="left">
          {{ $t('languages.common.ApplicationPortal.ApplicationPortal') }}
        </div>
        <div class="right">
          <a-search
            v-model="wd"
            :placeholder="$t('languages.common.ApplicationPortal.EnterAppName')"
          />
          <a-button type="primary" @click="addPortal">
            {{ $t('languages.common.ApplicationPortal.AddPortal') }}
          </a-button>
        </div>
      </div>

      <div class="content">
        <template v-for="(item, index) in ShowList">
          <apps-item :key="index" :wd="wd" :item="item" @delOver="reloadList" />
        </template>

        <template v-if="ShowList.length === 0">
          <div class="empty">
            <img
              src="../workflow-center/workbenchInfo/workbenchComponents/images/emptycontent.png"
              alt=""
            />
            <p>
              {{ $t('languages.common.ApplicationPortal.NullTips1')
              }}<span>{{
                $t('languages.common.ApplicationPortal.NullTips2')
              }}</span>{{ $t('languages.common.ApplicationPortal.NullTips3') }}
            </p>
          </div>
        </template>
      </div>
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
import IframeModal from 'cloudpivot/flow-center/src/components/pc/components/iframe-modal/iframe-modal.vue';
import { Button, Input } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import appsItem from './appsItem.vue';
const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');
@Component({
  name: 'applicationPortal',
  components: {
    AButton: Button,
    AInput: Input,
    ASearch: Input.Search,
    appsItem,
    IframeModal,
  },
})
export default class applicationPortal extends Vue {
  @WorkflowCenterModule.Mutation('setIsAppList') setIsAppList: any;

  created() {
    this.setIsAppList(false);
    this.queryAppList();
  }

  wd: string = '';

  page: number = 0;

  size: number = 9999;

  list: any[] = [];

  get ShowList() {
    return this.list.filter((el) => {
      return el.data.AppPackageList
        ? el.data.AppPackageList.some(
            (item) => item.AppName.indexOf(this.wd) > -1,
          )
        : [];
    });
  }

  async queryAppList() {
    const res = await workbenchApi.queryAppList({
      filters: [],
      mobile: false,
      page: this.page,
      queryCode: 'AppsUnderContainer',
      schemaCode: 'AppsUnderContainer',
      size: this.size,
    });

    if (res.errcode === 0) {
      this.list = res.data.content;
    } else {
      this.$message.error(res.errmsg as string);
    }
  }

  reloadList() {
    this.queryAppList();
  }

  showIframeForm: boolean = false;

  IframeFormUrl: string = '';

  closeModal() {
    this.showIframeForm = false;
    this.IframeFormUrl = '';
  }

  addPortal() {
    this.IframeFormUrl = `/form/detail?schemaCode=BusinessAppContainer&sheetCode=BusinessAppContainer&queryCode=BusinessAppContainer&return=/application-portal/portal`;
    this.showIframeForm = true;
  }
}
</script>

<style lang="less" scoped>
@black: #111218;
.application-portal {
  height: 100%;
  overflow: auto;
  background: #f1f2f6;
  color: @black;
  .application-portal-wrapper {
    width: 1065px;
    margin: 0 auto;

    .head {
      display: flex;
      justify-content: space-between;
      padding-top: 21px;
      background-color: #f1f2f6;
      position: sticky;
      top: 0;
      z-index: 2;
      .left {
        font-size: 18px;
        font-weight: 600;
        line-height: 32px;
      }
      .right {
        display: flex;
        .ant-input-search {
          width: 252px;
          margin-right: 8px;
        }
      }
    }
    .content {
      margin-top: 24px;
    }
  }
}

.empty {
  text-align: center;
  margin-top: 180px;
  p {
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    line-height: 22px;
    span {
      margin: 0 8px;
      color: #2970ff;
    }
  }
}
</style>

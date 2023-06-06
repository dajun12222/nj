<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="workbench-wrapper">
    <div class="workbench-wrapper-in">
      <div class="header">
        <div class="left">
          <div class="address">
            <span @click="gotoWorkbench">
              <i class="icon aufontAll h-icon-all-arrow-left-o"></i>
              {{ $t('languages.common.workbench') }} /
            </span>
            <span>{{ $t('languages.common.workBenchInfo.MyDraft') }}</span>
          </div>
          <template v-if="!isShowNoData">
            <div class="total">
              {{ $t('languages.common.workBenchInfo.total')
              }}<span>{{ totalCount }}</span>{{ $t('languages.common.workBenchInfo.item1') }}
            </div>
            <div class="show">
              {{ $t('languages.common.workBenchInfo.currentlyShow')
              }}<span>{{ list.length }}</span>{{ $t('languages.common.workBenchInfo.item2') }}
            </div>
          </template>
        </div>
        <div v-show="!isShowNoData" class="right">
          <a-button
            type="primary"
            :disabled="!checkedList.length"
            @click="batchDel"
          >
            {{ $t('languages.common.delete') }}
          </a-button>
        </div>
      </div>

      <div v-show="!isShowNoData" class="tool-bar">
        <a-checkbox
          :indeterminate="indeterminate"
          :checked="checkAll"
          @change="onCheckAllChange"
        />
        <span @click="checkedAll(!checkAll)">{{
          $t('languages.common.selectAll')
        }}</span>
      </div>

      <a-checkbox-group v-show="!isShowNoData" v-model="checkedList">
        <div
          v-infinite-scroll="handleInfiniteOnLoad"
          class="list-wrapper"
          :infinite-scroll-disabled="false"
          :infinite-scroll-distance="10"
        >
          <div v-for="(item, index) in list" :key="item.id" class="list-item">
            <div
              class="check-box"
              @mouseenter="mouseType('in', item)"
              @mouseleave="mouseType('out', item)"
            >
              <a-checkbox
                v-show="item.checked || item.enter"
                :key="item.id"
                :value="item"
                @change="(e) => itemChange(e, item)"
              />
              <span v-show="!item.checked && !item.enter">{{ index + 1 }}</span>
            </div>
            <div class="info" :title="item.name" @click="openDetail(item)">
              <div class="name">
                {{ item.name }}
              </div>
              <div class="time">
                <span>{{
                  $t('languages.common.workBenchInfo.createTime')
                }}</span>
                {{ item.startTime || item.createdTime }}
              </div>
            </div>
            <div class="btns">
              <a-button type="primary" @click.stop.self="delDraftItem(item.id)">
                {{ $t('languages.common.delete') }}
              </a-button>
            </div>
          </div>

          <div
            v-if="
              !isShowNoData && totalCount !== 0 && totalCount === list.length
            "
            class="loaded-all"
          >
            {{ $t('languages.common.workBenchInfo.loadedAll') }}
          </div>
        </div>
      </a-checkbox-group>

      <div v-if="isShowNoData" class="empty">
        <PageNoData
          :isShowNoData="isShowNoData"
          type="show"
          :tipText="$t('languages.common.noData')"
        />
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
import common from 'cloudpivot/common/pc';
import toolMixin from 'cloudpivot/flow-center/src/components/pc/common/toolMixin'; //公共处理模块
import IframeModal from 'cloudpivot/flow-center/src/components/pc/components/iframe-modal/iframe-modal.vue';
import { Button, Checkbox } from '@h3/antd-vue';
import { mixins } from 'vue-class-component';
import { Component, Watch } from 'vue-property-decorator';

@Component({
  name: 'draftList',
  components: {
    AButton: Button,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    PageNoData: common.components.PageNoData,
    IframeModal,
  },
})
export default class draftList extends mixins(toolMixin) {
  [x: string]: any;

  indeterminate: boolean = false;

  checkAll: boolean = false;

  get isShowNoData() {
    return this.list.length === 0;
  }

  showIframeForm: boolean = false;

  IframeFormUrl: string = '';

  closeModal() {
    this.showIframeForm = false;
    this.IframeFormUrl = '';

    this.currentPage = 0;
    this.getList();
  }

  gotoWorkbench() {
    this.$router.go(-1);
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
    url += '&return=/workbench-center/draft-list';

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

  checkedList: any[] = [];

  onCheckAllChange(e) {
    this.checkedAll(e.target.checked);
  }

  checkedAll(type: boolean) {
    this.indeterminate = false;
    this.checkAll = type;
    this.list.forEach((el) => {
      el.checked = type;
    });
    if (type) {
      this.checkedList = this.list;
    } else {
      this.checkedList = [];
    }
  }

  @Watch('list', {
    deep: true,
  })
  onListChange() {
    if (
      this.list.length === this.checkedList.length &&
      this.checkedList.length !== 0
    ) {
      this.indeterminate = false;
      this.checkAll = true;
    } else if (
      this.checkedList.length !== 0 &&
      this.list.length !== this.checkedList.length
    ) {
      this.indeterminate = true;
      this.checkAll = false;
    } else {
      this.indeterminate = false;
      this.checkAll = false;
    }
  }

  itemChange(e, item) {
    this.$set(item, 'checked', e.target.checked);
  }

  mouseType(type, item) {
    this.$set(item, 'enter', type === 'in');
  }

  totalCount: number = 0;

  currentPage: number = 0;

  pageSize: number = 20;

  list: any[] = [];

  isLoading: boolean = false;

  /**
   * 滚动加载
   */
  handleInfiniteOnLoad() {
    if (
      this.isLoading ||
      (this.totalCount === this.list.length && this.totalCount !== 0)
    ) {
      return;
    }
    if (this.totalCount !== this.list.length && this.totalCount !== 0) {
      this.currentPage = this.currentPage + 1;
    }

    this.getList();
  }

  async getList(type?: any) {
    this.isLoading = true;
    let res: any = {};

    if (type === 'del') {
      const size = this.list.length - this.ids.length;
      res = await workbenchApi.getUserdraftList({
        page: 0,
        size: size > this.pageSize ? size : this.pageSize,
      });
    } else {
      res = await workbenchApi.getUserdraftList({
        page: this.currentPage,
        size: this.pageSize,
      });
    }

    if (res.errcode === 0) {
      if (this.currentPage === 0) {
        this.list = res.data.content;
      } else {
        this.list = [...this.list, ...res.data.content];
      }

      this.totalCount = res.data.totalElements;
    }
    this.isLoading = false;
  }

  delDraftItem(id) {
    // this.tipsTitle = '确定删除此草稿？'
    this.tipsTitle = this.$t(
      'languages.common.workBenchInfo.deleteTips1',
    ) as string;
    this.ids = [id];
    this.openTipsModal();
  }

  batchDel() {
    this.ids = this.checkedList.map((el) => el.id);
    // this.tipsTitle = `确定删除所选${this.ids.length}条草稿？`
    this.tipsTitle = this.$t('languages.common.workBenchInfo.deleteTips2', {
      num: this.ids.length,
    }) as string;
    this.openTipsModal();
  }

  tipsTitle: string = '';

  ids: any[] = [];

  openTipsModal() {
    const that = this;
    this.$confirm({
      title: (h: any) => h('div', that.tipsTitle),
      class: 'cus-confirm-modal-draft',
      content: (h: any) =>
        h('div', [
          h('i', { class: 'icon aufontAll h-icon-all-question-circle' }),
          h('p', [`${that.tipsTitle}`]),
        ]),
      onOk() {
        that.delUserdraft();
      },
      okText: this.$t('languages.common.ApplicationPortal.Delete') as string,
      cancelText: this.$t(
        'languages.common.ApplicationPortal.Cancel',
      ) as string,
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  async delUserdraft() {
    const res = await workbenchApi.delUserdraft({
      ids: this.ids,
    });

    if (res.errcode === 0) {
      this.$message.success(res.errmsg as string);
      this.getList('del');
      this.ids = [];
    } else {
      this.$message.error(res.errmsg as string);
    }
  }

  created() {
    // this.getList()
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
@black: #111218;
.workbench-wrapper {
  height: 100%;
  overflow: auto;
  background: #f1f2f6;
  color: @black;
  .workbench-wrapper-in {
    padding-top: 28px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    .header {
      display: flex;
      justify-content: space-between;
      height: 32px;
      justify-items: center;
      width: 80%;
      max-width: 1600px;
      margin: 0 auto;
      // overflow-y: scroll;
      &::-webkit-scrollbar-track {
        background: #f1f2f6;
      }
      min-width: 1000px;
      margin-left: auto;
      margin-right: auto;
      .left {
        display: flex;
        align-items: center;
        font-size: 12px;

        .address {
          margin-right: 16px;
          font-weight: 600;
          span:first-child {
            color: rgba(17, 18, 24, 0.5);
            font-weight: 400;
            &:hover {
              color: @highlightColor;
              cursor: pointer;
            }
            i {
              font-size: 12px;
            }
          }
        }
        .total,
        .show {
          span {
            color: @highlightColor;
            margin: 0 4px;
          }
        }
      }
    }

    .tool-bar {
      background-color: #fff;
      width: 80%;
      min-width: 1000px;
      // overflow-y: scroll;
      max-width: 1600px;
      margin: 0 auto;
      &::-webkit-scrollbar-track {
        background: #f1f2f6;
      }
      margin-left: auto;
      margin-right: auto;
      margin-top: 12px;
      padding: 0 24px;
      height: 34px;
      line-height: 34px;
      border-radius: 2px;
      & > span {
        margin-left: 8px;
        cursor: pointer;
      }
    }
    .empty {
      margin-top: 218px;
    }

    .ant-checkbox-group {
      display: block;
      flex: 1;
      color: @black;
      overflow: hidden;
    }
    .list-wrapper {
      height: 100%;
      overflow: overlay;
      padding-bottom: 16px;
      &::-webkit-scrollbar-track {
        background: #f1f2f6;
      }

      .list-item {
        width: 80%;
        max-width: 1600px;
        margin: 0 auto;
        min-width: 1000px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 8px;
        background-color: #fff;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 84px;
        border-radius: 2px;
        position: relative;

        .check-box {
          width: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 84px;
        }

        .info {
          flex: 1;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 808px;
          cursor: pointer;
          .name {
            font-weight: 600;
            font-size: 14px;
            line-height: 22px;
            margin-bottom: 10px;
          }
          .time {
            line-height: 20px;
            font-size: 12px;
            span {
              color: rgba(17, 18, 24, 0.5);
            }
          }
        }
        .btns {
          position: absolute;
          right: 32px;
          top: 50%;
          transform: translateY(-50%);
          button {
            display: none;
          }
        }
        &:hover {
          box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
          .btns button {
            display: block;
          }
        }
      }

      .loaded-all {
        font-size: 12px;
        text-align: center;
        line-height: 17px;
        margin-top: 24px;
        color: rgba(17, 18, 24, 0.5);
      }
    }
  }
}
</style>
<style lang="less">
.cus-confirm-modal-draft {
  .anticon-question-circle {
    display: none;
  }
  .ant-modal-confirm-content {
    font-size: 14px;
    color: #111218;
    line-height: 22px;
    p {
      font-size: 16px;
      font-weight: 600;
      color: #111218;
      line-height: 24px;
      margin-bottom: 12px;
    }
    .h-icon-all-question-circle {
      font-weight: 400;
      color: #faad14;
      font-size: 24px;
      position: absolute;
      left: 31px;
      top: 42px;
    }
  }
  .ant-modal-confirm-btns {
    .ant-btn {
      height: 32px;
    }
  }
  .ant-btn-primary {
    background-color: #f0353f !important;
    border-color: #f0353f !important;
  }
}
</style>

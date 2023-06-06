<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div v-if="item.data" class="appsItem">
    <div class="portal-name">
      <div class="left">
        <div class="name" @click="openPortal">
          {{ BusinessAppContainer.ContainerName }} ({{ AppPackageList.length }})
        </div>

        <div class="setting">
          <i class="icon aufontAll h-icon-all-setting-fill"></i>
          <div class="popover">
            <span @click="toChange">{{
              $t('languages.common.ApplicationPortal.Modify')
            }}</span>
            <span @click="toDel">{{
              $t('languages.common.ApplicationPortal.Delete')
            }}</span>
            <span @click="toView">{{
              $t('languages.common.ApplicationPortal.Check')
            }}</span>
          </div>
        </div>
      </div>
      <div
        v-if="
          showAppList.length > 10 || (wd === '' && AppPackageList.length > 10)
        "
        class="right"
        @click="isShowMore = !isShowMore"
      >
        {{ isShowMore ? '收起' : '展开更多' }}
      </div>
    </div>

    <div class="apps">
      <template v-for="(item, index) in showAppList">
        <div :key="index" class="app-item" @click="gotoApp(item)">
          <div class="app-icon">
            <template v-if="item.AppLogoUrl">
              <img
                v-if="item.AppLogoUrl.indexOf('http') > -1"
                :src="item.AppLogoUrl"
                class="content-item-icon"
              />
              <img
                v-else
                :src="
                  getDownloadUrl(
                    item.AppLogoUrl,
                    item.AppUrl.match(/.+(?=\/application)/)[0],
                  )
                "
                class="content-item-icon"
              />
            </template>

            <template v-else>
              <svg class="tabs-app-li-icon icon svgIcon" aria-hidden="true">
                <use xlink:href="#h-icon-all-application1" />
              </svg>
            </template>
          </div>

          <!-- eslint-disable-next-line vue/no-v-html -->
          <p v-html="queryTitleLight(item.AppName)">
            {{ item.AppName }}
          </p>
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
import { listApi } from 'cloudpivot/api';
import IframeModal from 'cloudpivot/flow-center/src/components/pc/components/iframe-modal/iframe-modal.vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';

@Component({
  name: 'appsItem',
  components: {
    IframeModal,
  },
})
export default class appsItem extends Vue {
  @Prop() item!: any;

  @Prop() wd!: string;

  isShowMore: boolean = false;

  /**
   * 高亮
   */
  queryTitleLight(titleInfo) {
    if (!titleInfo) {
      return;
    }
    const strReturn = titleInfo.replace(
      new RegExp(this.wd, 'g'),
      `<span class="highlights">${this.wd}</span>`,
    );
    return strReturn;
  }

  get BusinessAppContainer() {
    if (this.item.data && this.item.data.BusinessAppContainer) {
      return this.item.data.BusinessAppContainer;
    }

    return {
      ContainerName: '',
      displayCode: '',
      id: '',
      propertyType: 0,
      schemaCode: '',
    };
  }

  get AppPackageList() {
    if (this.item.data && this.item.data.AppPackageList) {
      return this.item.data.AppPackageList;
    }

    return [];
  }

  get showAppList() {
    const filterList = this.AppPackageList.filter(
      (el) => el.AppName.indexOf(this.wd) > -1,
    );
    return this.isShowMore ? filterList : filterList.slice(0, 10);
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrl(refId: string, ip: string) {
    let url = `${ip}/api/aliyun/download?refId=${getDownloadUrlNew.getRefId(
      refId,
    )}`;
    if (this.token) {
      url += '&T=' + this.token;
    }
    return url;
  }

  gotoApp(item) {
    window.open(item.AppUrl + '?T=' + this.token);
  }

  // 跳转环境
  openPortal() {
    window.open(this.item.data.ContainerFrontendUrl + '?T=' + this.token);
  }

  showIframeForm: boolean = false;

  IframeFormUrl: string = '';

  closeModal() {
    this.showIframeForm = false;
    this.IframeFormUrl = '';
  }

  toChange() {
    this.IframeFormUrl = `/form/detail?sheetCode=BusinessAppContainer&objectId=${this.BusinessAppContainer.id}&edit=true&schemaCode=BusinessAppContainer&isWorkFlow=false&return=/application-portal/portal`;
    this.showIframeForm = true;
  }

  toView() {
    this.IframeFormUrl = `/form/detail?sheetCode=BusinessAppContainer&objectId=${this.BusinessAppContainer.id}&schemaCode=BusinessAppContainer&isWorkFlow=false&return=/application-portal/portal`;
    this.showIframeForm = true;
  }

  tipsTitle: string = '';

  toDel() {
    this.tipsTitle = this.$t(
      'languages.common.ApplicationPortal.DeleteTips1',
    ) as string;
    this.openTipsModal();
  }

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
        that.deleteListData();
      },
      okText: that.$t('languages.common.ApplicationPortal.Delete') as string,
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  async deleteListData() {
    const res = await listApi.deleteListData({
      ids: [this.BusinessAppContainer.id],
      schemaCode: 'BusinessAppContainer',
    });
    if (res.errcode === 0) {
      this.$emit('delOver');
    } else {
      this.$message.error(res.errmsg as string);
    }
  }
}
</script>

<style lang="less" scoped>
@black: #111218;
.portal-name {
  display: flex;
  justify-content: space-between;
  .left {
    display: flex;
    .name {
      font-size: 14px;
      font-weight: 600;
      line-height: 22px;
      cursor: pointer;
      &:hover {
        color: #2970ff;
      }
    }
    .setting {
      position: relative;
      margin-left: 8px;
      cursor: pointer;
      i {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.45);
      }

      .popover {
        position: absolute;
        left: 0;
        top: 100%;
        background-color: #fff;
        z-index: 3;
        width: 72px;
        height: 104px;
        padding-top: 4px;
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
        border-radius: 2px;
        display: none;
        span {
          display: block;
          height: 32px;
          line-height: 32px;
          cursor: pointer;
          text-align: center;
          &:hover {
            background: #eef4fd;
            color: #2970ff;
          }
        }
      }

      &:hover {
        i {
          color: #2970ff;
        }
        .popover {
          display: block;
        }
      }
    }
  }
  .right {
    color: rgba(17, 18, 24, 0.6);
    font-size: 12px;
    cursor: pointer;
    line-height: 22px;
    &:hover {
      color: #2970ff;
    }
  }
}

.apps {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-bottom: 22px;
}
.app-item {
  width: 205px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  background-color: #fff;
  margin-bottom: 10px;
  margin-right: 10px;
  border-radius: 2px;
  align-items: center;
  &:nth-child(5n + 5) {
    margin-right: 0;
  }

  .app-icon {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: 1px solid #eeeeee;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    img {
      width: 16px;
      height: 16px;
    }
    svg {
      width: 10px;
      height: 10px;
    }
  }
  p {
    font-size: 14px;
    line-height: 22px;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0;
  }
  &:hover {
    color: #1852d9;
  }
}

/deep/.highlights {
  color: #2970ff !important;
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
  // .ant-btn-primary{
  //   background-color: #f0353f !important;
  //   border-color: #f0353f !important;
  // }
}
</style>

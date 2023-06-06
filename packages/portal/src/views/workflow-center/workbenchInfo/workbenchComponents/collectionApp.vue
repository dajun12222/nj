<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div ref="collectionAppWrapper" class="collection-app">
    <pageHeader
      :currentPage="currentPage"
      :totalPage="totalPage"
      @pageChange="pageChange"
    >
      {{ $t('languages.common.workBenchInfo.FavoriteApps') }}
    </pageHeader>

    <div ref="appWrapper" class="app-wrapper">
      <div
        v-for="(item, index) in showAppList"
        :key="index + item.id"
        class="app-item"
        @click="goToDetail(item)"
      >
        <div class="app-icon">
          <template v-if="item.logoUrl">
            <img
              v-if="item.logoUrl.indexOf('http') > -1"
              :src="item.logoUrl"
              class="content-item-icon"
            />
            <img
              v-else
              :src="getDownloadUrlNew(item.logoUrl, 'application')"
              class="content-item-icon"
            />
          </template>

          <template v-else>
            <svg class="tabs-app-li-icon icon svgIcon" aria-hidden="true">
              <use xlink:href="#h-icon-all-application1" />
            </svg>
          </template>
        </div>
        <p>
          {{
            isChinese
              ? item.name
              : (item.name_i18n && item.name_i18n.en) ||
                (JSON.parse(item.name_i18n) && JSON.parse(item.name_i18n).en)
          }}
        </p>
      </div>
      <div v-for="item in neetAddCount" :key="item" class="app-item"></div>

      <template v-if="!showAppList.length">
        <div class="img-wrapper">
          <img src="./images/emptyapp.png" alt="" />
          <p>{{ $t('languages.common.noData') }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { listApi } from 'cloudpivot/api';
import { utils } from 'cloudpivot/common';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import { Component, Vue } from 'vue-property-decorator';
import pageHeader from './pageHeader.vue';
import { namespace } from "vuex-class";

const WorkflowCenterModule = namespace("WorkflowCenter/WorkflowCenter");

@Component({
  name: 'collectionApp',
  components: {
    pageHeader,
  },
})
export default class collectionApp extends Vue {
  @WorkflowCenterModule.Mutation("setAppName") setAppName: any;
  
  @WorkflowCenterModule.Mutation("setAppCode") setAppCode: any;
  
  @WorkflowCenterModule.Mutation("setIsAppList") setIsAppList: any;

  @WorkflowCenterModule.Mutation("setAppChange") setAppChange: any;
  
  totalPage: number = 0;

  currentPage: number = 0;

  pageSize: number = 9;

  list: any[] = [];

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

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  get showAppList() {
    const start: number = this.currentPage * this.pageSize;
    return this.list ? this.list.slice(start, start + this.pageSize) : [];
  }

  async getList() {
    const res = await listApi.listFavorite({ isMobile: false });
    if (res.errcode === 0) {
      this.list = res.data || [];
      this.totalPage = Math.ceil(this.list.length / this.pageSize);
    }
  }

  // created(){
  //   this.getList()
  // }

  timer: any = null;

  mounted() {
    // 收藏有变化：重新请求列表
    utils.Bus.$on('favoriteOperateOver', () => {
      this.getList();
    });

    this.toComputeSize();
    window.addEventListener('resize', this.toComputeSize);
  }

  colCount: number = 3; // 默认一行显示三个

  toComputeSize() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      // @ts-ignore
      const width: number = this.$refs.appWrapper.offsetWidth as number;
      this.colCount = Math.floor(width / 106);

      this.pageSize = this.colCount * 3 < 9 ? 9 : this.colCount * 3;
      this.getList();
    }, 100);
  }

  get neetAddCount() {
    // 需要补充空应用数量
    return this.showAppList.length % this.colCount
      ? this.colCount - (this.showAppList.length % this.colCount)
      : 0;
  }

  beforeDestroy() {
    utils.Bus.$off('favoriteOperateOver');
    window.removeEventListener('resize', this.toComputeSize);
  }

  getDownloadUrlNew(refId: string, type?: string) {
    return getDownloadUrlNew.getImageUrl(refId, type);
  }

  goToDetail(item){
    const appName = {
      name: item.appName || item.name,
      name_i18n: ((item.appName_i18n && item.appName_i18n.en) || (item.appName_i18n && JSON.parse(item.appName_i18n) && JSON.parse(item.appName_i18n).en) || item.appName) || ((JSON.parse(item.name_i18n) && JSON.parse(item.name_i18n).en) || item.name),
    }
    this.setIsAppList(true);
    this.setAppName(appName);
    this.setAppCode(item.appCode || item.code);
    this.setAppChange(true);
    this.getAppGroups(item)
  }

  /**
   * 获取应用下模型
   */
  async getAppGroups(item) {
    const params: any = {
      appCode: item.appCode || item.code,
      isMobile: false, // 需要处理
    };
    const res = await listApi.getFolder(params);
    if (res.errcode === 0) {
      this.openModel(res.data, item);
    } else {
      this.$router.push(`/application/${item.appCode || item.code}`);
    }
  }

  openModel(data, item) {
    if (Array.isArray(data) && data[0]) {
      const obj = data[0];
      if (obj.type === 'BizModel') {
        this.$router.push(
          `/application/${obj.appCode}/application-list/${obj.code}?parentId=${
            obj.parentId
          }&code=${obj.code}&openMode=${obj.openMode || ''}&pcUrl=${
            obj.pcUrl || ''
          }&queryCode=${obj.queryCode || ''}`,
        );
      } else if (obj.type === 'Folder' && obj.children) {
        this.openModel(obj.children, item);
      } else if (obj.type === 'Report') {
        this.$router.push({
          name: 'applicationReport',
          params: {
            appCode: obj.appCode,
            reportCode: obj.code,
          },
          query: {
            parentId: obj.parentId,
            code: obj.code,
            openMode: obj.openMode,
            pcUrl: obj.pcUrl,
            queryCode: obj.queryCode,
          },
        });
      } else {
        //Else Empty block statement
      }
    } else {
      this.$router.push(`/application/${item.appCode || item.code}`);
    }
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
.img-wrapper {
  width: 322px;
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
.collection-app {
  background-color: #fff;
  height: 362px;
  min-width: 320px;
  margin-right: 16px;
  overflow: hidden;
  flex: 1;
  .page-header {
    padding: 24px 24px 0 24px;
  }

  .app-wrapper {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  .app-item {
    width: 106px;
    padding-top: 16px;
    text-align: center;
    cursor: pointer;
    &:hover {
      background-color: @activeBGColor;
    }
    .app-icon {
      width: 34px;
      height: 34px;
      border-radius: 2px;
      border: 1px solid #eeeeee;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
      img {
        width: 34px;
        height: 34px;
      }
      svg {
        width: 22px;
        height: 22px;
      }
    }
    p {
      font-size: 14px;
      line-height: 22px;
      margin-bottom: 12px;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 10px;
    }
    &:hover {
      color: @highlightColor;
    }
  }
}
</style>

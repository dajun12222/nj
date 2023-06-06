<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div id="report" class="report-design">
    <div class="report-design__header">
      <!-- <router-link
        tag="i"
        :to="{ name: 'appitem', params: { appCode: appCode } }"
        class="icon aufontAll h-icon-all-arrow-left-o"
      /> -->
      <!-- <em class="icon aufontAll h-icon-all-arrow-left-o" @click="$router.go(-1)"></em> -->

      <span>{{ title }}</span>
      <div class="report-design__header-right">
        <!-- 报表3.1.x版本以后已经不需要这个了 -->
        <!-- <span @click="syncDataSource">
          <i class="icon aufontAll h-icon-all-sync-o" :class="syncing ? 'syncing' : ''"></i>
          同步数据源
        </span>
        <a-divider type="vertical" /> -->
        <router-link
          tag="a"
          :to="{
            name: 'ReportDataSourceList',
            params: { appCode: appCode, reportCode: reportCode },
          }"
        >
          <i class="icon aufontAll h-icon-all-logout-o"></i> 高级数据源
        </router-link>
      </div>
    </div>

    <div class="report-design__body">
      <h3-report-design-pro
        v-if="loaded"
        v-model="title"
        :class="['report-design__designer']"
        :reportId="objectId"
        :corpId="corpId"
        :config="config"
        :showAdvancedDataSource="true"
        :isAdmin="true"
        :isAddNew="isAddNew"
        :limit="{ list: { dimension: 50 } }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import appsApi from '@/apis/apps';
import { LanguageTransform } from '@/utils';
import { DashboardPro } from '@h3/report';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ReportOptions from '@h3/report/dist/options';
import appApi from '@/apis/apps';

const AppCenterModule = namespace('Apps/AppCenter');

import { EventBus } from 'cloudpivot/form/src/schema/event-bus';

@Component({
  name: 'report-design',
  components: {
    H3ReportDesignPro: DashboardPro,
  },
})
export default class ReportDesign extends Vue {
  /* State */
  @AppCenterModule.State('appInfo') appInfo: any;

  /* Action */
  @AppCenterModule.Action('getAppDetail') getAppDetail: any;

  title = '';

  corpId = 'a';

  objectId = '';

  loaded = false;

  syncing: boolean = false;

  isAddNew: boolean = false;

  get reportCode() {
    return this.$route.params.reportCode;
  }

  get appCode() {
    return this.$route.params.appCode;
  }

  get token() {
    return localStorage.getItem('token');
  }

  get config() {
    return {
      token: this.token,
      reportCode: this.reportCode,
      appCode: this.appCode,
    };
  }

  // reportLoaded() {

  // }

  load() {
    this.loaded = false;
    const closeLoad = (this.$message as any).loading();

    return appsApi
      .getAppReport({
        code: this.reportCode,
      })
      .then(
        (res: any) => {
          closeLoad();
          if (res.errcode === 0) {
            this.title = res.data.name;
            //  this.objectId = res.data.reportObjectId || '';
            this.objectId = res.data.reportObjectId || res.data.id || '';
          } else {
            this.$message.error(res.errmsg);
          }
        },
        () => closeLoad(),
      )
      .finally(() => (this.loaded = true));
  }

  getAppInfo() {
    if (this.appCode) {
      this.getAppDetail({
        appCode: this.appCode,
      }).then(() => {
        const appName = LanguageTransform.getLang(
          this.appInfo.name,
          this.appInfo.name_i18n,
        );
        document.title = appName + '-' + this.title;
      });
    }
  }

  /**
   * 同步数据源 全量
   * */
  async syncDataSource() {
    if (this.syncing) {
      return;
    }

    this.syncing = true;
    const res: any = await appsApi.syncDataSource();
    this.syncing = false;
    if (res.errcode === 0) {
      this.$message.success('同步成功');
    } else {
      this.$message.error('同步失败');
    }
  }

  mounted() {
    this.getBizModels(this.$route.params.appCode);

    EventBus.$on('reportChange', (param: any) => {
      this.title = param.name;
    });
  }

  beforeDestroy() {
    EventBus.$off('reportChange');
  }

  @Watch('$route')
  routeChange() {
    this.getBizModels(this.$route.params.appCode);
  }

  /**
   * 获取应用下的目录和业务模型
   */
  getBizModels(appCode: string) {
    return appApi
      .getAppItem({ appCode, isPortal: true })
      .then((res: Common.Data) => {
        //筛选出应用下所有报表类型的模型
        const allDashboardList = [];
        this.refactoringTreeData(res.data, allDashboardList);
        console.log('allDashboardList', allDashboardList);
        //传递参数至报表组件
        ReportOptions.jumpDashboard.allDashboardList = allDashboardList;
        console.log(ReportOptions, 'ReportOptions');

        this.isAddNew = this.$route.params.isNew === 'true';

        this.load().then(() => {
          this.getAppInfo();
          const newPath = this.$route.path.replace(
            '/isNew/true',
            '/isNew/false',
          );
          this.$router.replace({ path: newPath });
        });
      });
  }

  /**
   * @param list
   * @returns
   */
  refactoringTreeData(list, allDashboardList) {
    list.forEach((owner) => {
      if (
        owner.type === 'Folder' &&
        owner.children &&
        owner.children.length > 0
      ) {
        owner.children = this.refactoringTreeData(
          owner.children,
          allDashboardList,
        );
      } else {
        if (owner.type === 'Report') {
          allDashboardList.push({
            label: owner.name,
            value: owner.code,
            options: {
              type: owner.type,
              appCode: owner.appCode,
              code: owner.code,
              id: owner.id,
            },
          });
        }
      }
    });
  }
}
</script>
💈
<style lang="less">
#report {
  .ant-btn {
    width: 106px;
  }
}

.h3-dashboard-design {
  .ant-btn {
    line-height: 1.499;
    position: relative;
    display: inline-block !important;
    font-weight: 400;
    white-space: nowrap;
    text-align: center;
    background-image: none;
    border: 1px solid transparent;
    box-shadow: unset;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    touch-action: manipulation;
    height: 32px;
    padding: 0 15px;
    font-size: 14px;
    border-radius: 2px;
    color: rgba(0, 0, 0, 0.65);
    background-color: #fff;
    border-color: #d9d9d9;
  }
  .ant-btn-primary {
    color: #fff;
    background-color: #2970ff;
    border-color: #2970ff;
    box-shadow: unset;
    &:hover {
      color: #fff;
      background-color: #5291ff;
      border-color: #5291ff;
    }
  }
  .h3-dashboard-data-field__icon {
    margin-top: -8px;
  }
}

.h3-modal {
  .ant-modal-footer {
    .h3-button {
      display: inline;
      padding: 0 15px;
      height: 32px;
      line-height: 32px;
      color: rgba(0, 0, 0, 0.65);
      background-color: #fff;
      border: 1px solid #d9d9d9;
      border-radius: 3px;
    }
    .ant-btn-primary {
      color: #fff;
      background-color: #2970ff;
      border-color: #2970ff;
      text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
    }
  }
}
</style>
<style lang="less" scoped>
@import './report.less';

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.syncing {
  display: inline-block;
  animation: loading 1s infinite linear;
}
</style>

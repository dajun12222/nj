<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="form-track">
    <div class="header form-header">
      <h4>
        <!-- <label>{{ $t('languages.common.form.workflowApproval') }}</label> -->
        <label v-if="baseInfo.status === 'DRAFT'">{{ $t('languages.common.formTitle.editWorkflow')
          }}{{
            baseInfo.workflowName ? '-' + baseInfo.workflowName : ''
          }}</label>
        <label v-else>{{ $t('languages.common.formTitle.viewWorkflow')
          }}{{
            baseInfo.workflowName ? '-' + baseInfo.workflowName : ''
          }}</label>
      </h4>
      <div class="header-right">
        <div
          v-if="!isEl && ['DINGTALK', 'WECHAT'].includes(relatedType)"
          class="qrcode"
          @mouseover="showBigQrcode = true"
          @mouseout="showBigQrcode = false"
          @click.stop="showBigQrcode = true"
        >
          <span>
            <a-icon type="qrcode" />{{ $t('languages.common.form.qrcode') }}
          </span>
          <div v-show="showBigQrcode" class="qrcode-enlarge">
            <img :src="url" />
            <p>
              <!-- {{ relatedType === "WECHAT" ? "企业微信" : "钉钉" }}扫码查看数据 -->
              {{
                $t('languages.common.form.scanCodeView', {
                  equip:
                    relatedType === 'WECHAT'
                      ? $t('languages.common.form.enterpriseWechet')
                      : $t('languages.common.form.dingtalk'),
                })
              }}
            </p>
          </div>
        </div>
        <div @click="copyURL">
          <span><a-icon type="copy" />{{
              $t('languages.common.form.CopyLink')
            }}</span>
        </div>

        <div v-if="isInIframe" @click.prevent="openBlank">
          <span>
            <a-icon type="select" />
            {{ $t('languages.common.form.OpenInNewPage') }}
          </span>
        </div>
      </div>
    </div>
    <workflow-track-main
      :workflowInstanceId="workflowInstanceId"
      :loading="loading"
      :baseInfo="baseInfo"
      :chart="chart"
      :logs="logs"
    />
    <div class="header form-header form-footer">
      <workflow-track-actions
        :headerAction="headerAction"
        :workflowInstanceId="workflowInstanceId"
        :workItemId="workItemId"
        :currentActivityCode="currentActivityCode"
        :workflowVersion="baseInfo.workflowVersion"
        :formVersion="baseInfo.version"
        :workflowState="workflowState"
        :isWORKFLOW_ADMIN="isWORKFLOW_ADMIN"
        :workflowAdminManageScopes="workflowAdminManageScopes"
        @edit="onEdit"
        @logs="onLogs"
        @loadData="loadData"
        @processOperationAndMaintenanceHandle="
          processOperationAndMaintenanceHandle
        "
      />
    </div>

    <template v-if="processOperationAndMaintenanceVisible">
      <operationAndMaintenance
        v-model="processOperationAndMaintenanceVisible"
        :data="baseInfo"
        :isWORKFLOW_ADMIN="isWORKFLOW_ADMIN"
        :workflowAdminManageScopes="workflowAdminManageScopes"
        :workflowState="workflowState"
        :headerAction="headerAction"
        @operationOver="loadData"
      />
    </template>
  </div>
</template>

<script lang="ts">
// 初始化表单组件配置
import '@/config/h3-form';
import { Component, Vue } from 'vue-property-decorator';
import flow from 'cloudpivot/flow/pc';
import common from 'cloudpivot/common';
import { workflowApi, workflow } from 'cloudpivot/api';
import { Icon } from '@h3/antd-vue';
import { externalLinkApi } from 'cloudpivot/api';

import operationAndMaintenance from './operationAndMaintenance.vue';
import OAuthApi from '@/apis/oauth';
import * as dd from 'dingtalk-jsapi';

@Component({
  name: 'workflow-track',
  components: {
    AIcon: Icon,
    WorkflowTrackMain: flow.components.WorkflowTrack,
    WorkflowTrackActions: flow.components.WorkflowTrackActionsNew,
    operationAndMaintenance,
  },
})
export default class WorkflowTrack extends Vue {
  workflowInstanceId: string = ''; // 流程实例Id

  workItemId: string = ''; // 流程Id

  baseInfo: workflow.InstanceBaseInfo = {}; // 流程跟踪基础信息

  chart: workflow.Chart = {}; // 流程图

  logs: workflow.WorkflowTrackLog[] = []; // 审批日志

  loading = true;

  isInIframe: boolean = false;

  url = '';

  showBigQrcode = false;

  relatedType: string = '';

  /**
   * 是否是外链
   */
  get isEl(): boolean {
    return !!(window as any).externalLinkToken;
  }

  processOperationAndMaintenanceVisible: boolean = false;

  processOperationAndMaintenanceHandle() {
    this.processOperationAndMaintenanceVisible = true;
  }

  /**
   * 获取头部控制
   */
  get headerAction() {
    return this.baseInfo.headerAction ? this.baseInfo.headerAction : [];
  }

  /**
   * 获取异常流程的异常节点，其下一个节点作为当前节点
   */
  get currentActivityCode() {
    const flowStatus: any = this.baseInfo.status;
    if (flowStatus !== 'EXCEPTION') {
      return '';
    }
    if (this.chart && Array.isArray(this.chart.activityStatus)) {
      let targetActivityIdx;
      this.chart.activityStatus.some((act: any, idx: number) => {
        if (act.status === 2) {
          targetActivityIdx = idx + 1;
          return true;
        }
        return false;
      });
      if (targetActivityIdx) {
        const targetActivity = this.chart.activityStatus[targetActivityIdx];
        return targetActivity ? targetActivity.activityCode : '';
      }
    }
    return '';
  }

  /**
   * 流程装填
   */
  get workflowState() {
    if (this.baseInfo) {
      return this.baseInfo.status;
    }
  }

  /**
   * 返回点击事件
   */
  back() {
    if (this.workItemId !== '') {
      // this.$router.push({
      //   name: 'form-detail',
      //   query: {
      //     workflowInstanceId: this.workflowInstanceId,
      //     workitemId: this.workItemId,
      //     return: this.$route.query.return
      //   }
      // });
      this.$router.go(-1);
    } else {
      this.closePage();
    }
  }

  IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array(
      'Android',
      'iPhone',
      'SymbianOS',
      'Windows Phone',
      'iPad',
      'iPod',
    );
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  /**
   * 关闭当前页面
   */
  closePage() {
    window.opener = null;
    window.open('', '_self');
    window.close();
  }

  /**
   * 复制链接
   */
  copyURL() {
    // 复制链接
    try {
      var href: any = location.href;
      var iframeAction: any = href.match(/%26iframeAction%3Ddetail/g);
      if (Array.isArray(iframeAction) && iframeAction.length > 1) {
        for (let i = 0; i < iframeAction.length - 1; i++) {
          href = href.replace('%26iframeAction%3Ddetail', '');
        }
      }
      const oInput = document.createElement('input');
      oInput.value = href;
      document.body.appendChild(oInput);
      oInput.select();
      document.execCommand('Copy');
      oInput.style.display = 'none';
      this.$message.success('复制成功');
    } catch (error) {
      this.$message.error('复制失败');
    }
  }

  /**
   * 打开新页面
   */
  openBlank() {
    var href: any = location.href;
    var iframeAction: any = href.match(/%26iframeAction%3Ddetail/g);
    if (Array.isArray(iframeAction) && iframeAction.length > 1) {
      for (let i = 0; i < iframeAction.length - 1; i++) {
        href = href.replace('%26iframeAction%3Ddetail', '');
      }
    }

    const url = `${href}${
      href.indexOf('?') > -1 ? '&' : '?'
    }T=${localStorage.getItem('token')}`;

    window.open(url, '_blank');
  }

  /**
   * 跳转日志
   */
  onLogs() {
    this.$router
      .push({
        name: 'flowTrackOperationLogs',
        params: { workflowInstanceId: this.workflowInstanceId },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  /**
   * 编辑事件
   */
  onEdit() {
    this.$router
      .push({
        name: 'form-detail',
        query: {
          workflowInstanceId: this.workflowInstanceId,
          workitemId: this.workItemId,
          edit: 'true',
          return: this.$route.query.return,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  closePopDetail() {
    if (window.top !== window.self) {
      window.parent.postMessage('close', origin);
    } else {
      /**
       * 钉钉浏览器不支持close(),单独处理
       */
      if (dd.biz && (dd.android || dd.ios)) {
        dd.biz.navigation.goBack({
          onSuccess: () => {
            console.log('关闭成功!');
          },
          onFail: () => {
            console.error('关闭失败');
          },
        });
      } else if (dd && dd.pc && this.IsPC()) {
        // pc钉钉
        this.back();
      } else {
        window.opener = null;
        window.open('', '_self', '');
        window.close();
      }
    }
  }

  /**
   * 加载数据
   */
  loadData(type?: string) {
    if (type === 'DELETE_WORKFLOW') {
      this.closePopDetail();
      return;
    }

    this.loading = true;
    const params: workflow.GetWorkflowTrackParams = {
      workflowInstanceId: this.workflowInstanceId,
    };

    let user: any = sessionStorage.getItem('user');
    if (user) {
      user = JSON.parse(user);
      const config = {
        corpId: user.corpId,
        agentId: user.agentId,
        mobileServerUrl: user.mobileServerUrl,
        relatedType: user.relatedType,
      };
      const { relatedType } = config;
      const { corpId } = config;
      this.relatedType = relatedType;
      //.replaceAll('localhost:9100', 'mecury-test.cloudpivot.cn') 本地调试用

      //移动端流程跟踪与pc短流程跟踪地址不一致，需要转换为移动端地址格式
      let signinUrl = location.href.replace(
        '/from/workflow-track/',
        '/mobile/#/form/approval/',
      );
      const temp: any = signinUrl.split('?')[0].split('/').pop();
      signinUrl = signinUrl.replace('/' + temp, '');

      if (relatedType === 'WECHAT') {
        this.relatedType = 'WECHAT';
        // 企业微信端
        signinUrl = encodeURIComponent(signinUrl);
        signinUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${signinUrl}&state=STATE&scope=snsapi_base#wechat_redirect`;
      }

      const params: OAuth.ShortCodeParams = {
        url: signinUrl,
        type: 5, //type为5表示扫码登陆
        expireTime: -1, //五分钟失效
      };
      OAuthApi.getShortCode(params).then((result) => {
        if (result.errcode === 0) {
          externalLinkApi
            .generateQrcode(
              `${location.origin}/api/public/short_code/to/${result.data}`,
            )
            .then((res: any) => {
              const bytes = new Uint8Array(res);
              let data = '';
              const len = bytes.byteLength;
              for (let i = 0; i < len; i++) {
                data += String.fromCharCode(bytes[i]);
              }
              this.url = 'data:image/png;base64,' + window.btoa(data);
            });
        } else {
          this.$message.warning('获取短码失败');
        }
      });
    }

    this.loadBaseInfo(params).then(() => (this.loading = false));

    this.loadChart(params);

    this.loadLogs(params);

    // let res: any = {};
    // res = await workflowApi.getWorkflowBaseInfo(workflowInstanceId);
    // common.utils.compatible(res.data || {}, 'workflowName');
    // if (res.data && Array.isArray(res.data.participants)) {
    //   res.data.participants.forEach((d:any) => {
    //     common.utils.compatible(d, 'activityName');
    //   });
    // }
    // this.baseInfo = res.data;
    // console.log('-----------', this.baseInfo);
    // res = await workflowApi.getWorkflowChart(workflowInstanceId);
    // if (res.data && Array.isArray(res.data.activities)) {
    //   res.data.activities.forEach((d:any) => {
    //     d = common.utils.compatible(d, 'activityName');
    //   });
    // }
    // this.chart = res.data;
    // res = await workflowApi.getWorkflowLogs(workflowInstanceId);
    // if (res.data && Array.isArray(res.data)) {
    //   res.data.forEach((d:any) => {
    //     common.utils.compatible(d, 'activityName');
    //     // 发起节点接收时间优化-不展示接收时间、耗时
    //     if (d.tokenId === 0) {
    //       d.receiveTime = '--';
    //       d.usedTime = 0;
    //     }
    //   });
    // }
    // this.logs = res.data;
  }

  async loadBaseInfo(params: workflow.GetWorkflowTrackParams) {
    const res = await workflowApi.getWorkflowBaseInfo(params);
    if (res.errcode === 0 && res.data) {
      common.utils.compatible(res.data || {}, 'workflowName');
      if (Array.isArray(res.data.participants)) {
        res.data.participants.forEach((d: any) => {
          common.utils.compatible(d, 'activityName');
          // 委托数据格式化
          if (Array.isArray(d.participantRelations)) {
            d.participantRelations = d.participantRelations.map((tru: any) => {
              const user = {
                ...tru.participantVO,
                workitemId: tru.workitemId,
                isTrust: tru.isTrust,
                trustorProcessor: tru.trustorVO,
              };
              return user;
            });
          }
        });
      }
      this.baseInfo = res.data || {};
      this.getUserInfo();
    }
  }

  async loadChart(params: workflow.GetWorkflowTrackParams) {
    const res = await workflowApi.getWorkflowChart(params);
    if (res.errcode === 0 && res.data) {
      if (Array.isArray(res.data.activities)) {
        res.data.activities.forEach((d: any) => {
          d = common.utils.compatible(d, 'activityName');
        });
      }
      this.chart = res.data || {};
    }
  }

  async loadLogs(params: workflow.GetWorkflowTrackParams) {
    const res = await workflowApi.getWorkflowLogs(params);
    if (res.errcode === 0 && res.data) {
      if (Array.isArray(res.data)) {
        res.data.forEach((d: any) => {
          common.utils.compatible(d, 'activityName');
          // 发起节点接收时间优化-不展示接收时间、耗时
          if (d.tokenId === 0) {
            d.receiveTime = '--';
            d.usedTime = 0;
          }
        });
      }
      this.logs = res.data || [];
    }
  }

  /**
   * 初始化
   */
  created() {
    this.isInIframe = window.top !== window.self;

    this.workflowInstanceId = (this.$route.params as any).workflowInstanceId;
    this.workItemId = (this.$route.params as any).workItemId;
    if (this.workItemId) {
      this.loadData();
    }
  }

  isWORKFLOW_ADMIN: boolean = false;

  async getUserInfo() {
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      // 判断当前用户角色
      const isAppAdmin: boolean = info.permissions.includes('APP_MNG'); // 子管理员
      const isSysAdmin: boolean = info.permissions.includes('SYS_MNG'); // 系统管理员
      const isRootAdmin: boolean = info.permissions.includes('ADMIN'); // 超级管理员
      const isAdmin: boolean = isAppAdmin || isSysAdmin || isRootAdmin;

      const isWORKFLOW_ADMIN: boolean =
        info.permissions.includes('WORKFLOW_ADMIN'); // 特权人
      if (!isRootAdmin && !isSysAdmin) {
        // 是特权人
        this.isWORKFLOW_ADMIN = true;
        this.getWorkflowAdminManageScopes();
      }
    }
  }

  workflowAdminManageScopes: any[] = [];

  async getWorkflowAdminManageScopes() {
    await workflowApi
      .getWorkflowAdminManageScopesByWorkflowInstanceId({
        workflowInstanceId: this.workflowInstanceId || '',
      })
      .then((res: any) => {
        if (res.errcode === 0) {
          this.workflowAdminManageScopes = res.data || [];
        }
      });
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/common/common.less';
.form-header {
  display: flex;
  justify-content: space-between;
  padding: 0 24px !important;
  h4 {
    margin-bottom: 0;
    font-size: 20px;
    font-weight: 600;
    color: #111218;
  }
  .header-right {
    display: flex;
    padding-right: 40px;
    align-items: center;
    & > div {
      margin-left: 25px;
      color: rgba(0, 0, 0, 0.65);
      i {
        margin-right: 8px;
      }
      &:hover {
        span {
          color: #2970ff;
        }
        cursor: pointer;
      }
      &.icon-close {
        margin-right: -16px;
        font-size: 16px;
        top: 11px;
        color: #d8d8d8;
      }
    }
  }
}
.back-icon {
  cursor: pointer;
  color: rgba(0, 0, 0, 0.65);
  margin-right: 8px;
  &:hover {
    color: #2970ff;
  }
}
.form-track {
  .main {
    display: flex;
    flex-direction: column;
    background-color: #fff !important;
    > .content {
      padding: 60px 0 100px;
      align-self: center;
      height: 2000px;
      width: @layout-min-width !important;
    }
  }
  &__tabs {
    margin-top: @base4-padding-sm;
  }
  .back {
    flex: 0 0 250px !important;
    &::before {
      display: none;
    }
  }
}
.form-footer {
  position: fixed;
  left: 0;
  bottom: 0;
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  height: 52px;
  padding: 0 24px !important;
}
.qrcode {
  // margin-left: 33px;
  // margin-right: 16px;
  position: relative;
  & > img {
    width: 26px;
    cursor: url('~@/assets/images/enlarge-o.png'), pointer;
    margin: 2px;
  }
  .qrcode-enlarge {
    position: absolute;
    top: 28px;
    border: 1px solid rgba(221, 221, 221, 1);
    background: #fff;
    img {
      width: 250px;
      height: 250px;
      // max-height: 250px !important;
    }
    p {
      text-align: center;
      padding-bottom: 16px;
    }
    // left: 0;
    right: -1px;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="license">
    <a-tabs
      :class="['user-tabs', activeKey === '1' ? 'five' : '']"
      :defaultActiveKey="defaultActiveKey"
      @change="tabChange"
    >
      <a-tab-pane key="1" tab="版本与授权">
        <!-- <div class="license-header">
          <span>系统信息</span>
        </div> -->
        <div class="tabs__wrap">
          <div class="license-content">
            <div class="license-form">
              <div class="info-title">系统版本信息</div>
              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>当前版本号:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseInfo.systemVersion }}</span>
                </a-col>
              </a-row>

              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>固定机器码:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseInfo.fixedMachineCodeList }}</span>
                </a-col>
              </a-row>

              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>动态机器码:</span>
                  <a-tooltip>
                    <div slot="title">
                      <span>适用于k8s部署</span>
                    </div>
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseInfo.dynamicMachineCodeList }}</span>
                </a-col>
              </a-row>

              <div class="info-title">系统授权/许可证</div>
              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>授权类型:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseTypeName(licenseInfo.licenseType) }}</span>
                </a-col>
              </a-row>

              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>授权用户数:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseInfo.uesrNumber }}</span>
                  <!--  -->
                  <a-button
                    v-if="isShowAuBtn && !licenseInfo.controlPattern"
                    type="primary"
                    class="au-btn ant-btn-large"
                    @click="showAuthDrawer"
                  >
                    授权用户管理
                  </a-button>
                </a-col>
              </a-row>

              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>授权引擎数:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseInfo.engineNumber }}</span>
                </a-col>
              </a-row>

              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>授权应用数:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseInfo.appNumber }}</span>
                </a-col>
              </a-row>

              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>授权模型数:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseInfo.schemaNumber }}</span>
                </a-col>
              </a-row>

              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>有效期:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseInfo.expiration }}</span>
                </a-col>
              </a-row>

              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>授权时间戳:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseInfo.certificate }}</span>
                </a-col>
              </a-row>

              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>授权机器码:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <span>{{ licenseInfo.machineCodeList }}</span>
                </a-col>
              </a-row>

              <div class="info-title">云枢平台更新日志</div>
              <a-row class="license-item">
                <a-col :span="layout.left" class="license-left">
                  <span>更新日志:</span>
                </a-col>
                <a-col :span="layout.right" class="license-right">
                  <a :href="licenseInfo.updateLogUrl" target="_blank">{{
                    licenseInfo.updateLogUrl
                  }}</a>
                  <!-- <span>{{ licenseInfo.certificate }}</span> -->
                </a-col>
              </a-row>
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="常规设置">
        <div class="tabs__wrap">
          <GeneralSettings />
        </div>
      </a-tab-pane>
    </a-tabs>

    <a-drawer
      title="用户授权管理"
      width="850px"
      :visible="isShowAuthorization"
      wrapClassName="au-wrapper"
      :destroyOnClose="true"
      @close="onCancel"
    >
      <div class="au-box">
        <p v-if="isOver" class="over">
          检测到您当前授权用户数超过限制（最大限制{{
            permObj.maxAuthorizedUserNum
          }}人，当前{{ permObj.authorizedUserNum }}人，超出{{
            permObj.authorizedUserNum - permObj.maxAuthorizedUserNum
          }}人），系统已经停止服务，减少授权用户数后才能恢复服务
        </p>
        <p v-else>
          当前允许登录用户数为{{
            permObj.authorizedUserNum
          }}人，没有超过最大授权用户数，使用正常
        </p>

        <div class="au-type">
          <div class="au-type-label gray">授权模式</div>
          <div class="au-type-item">
            <a-radio-group v-model="permObj.permMode" @change="onTypeChange">
              <a-radio value="ALL"> 允许全部用户登录 </a-radio>
              <a-radio value="PART"> 允许部分用户登录 </a-radio>
            </a-radio-group>
          </div>
        </div>

        <div v-show="!isAllowAll" class="choose-part">
          <div class="choose-item">
            <div class="choose-label gray">选择角色</div>
            <div class="choose-con">
              <role-select
                :defaultValue="roleDisplay"
                :multiple="true"
                filterKey="code"
                @select="selectRole"
              />
            </div>
          </div>
          <!-- 拆成2个  部门  人员 -->
          <div class="choose-item">
            <div class="choose-label gray">选择部门</div>
            <div class="choose-con">
              <staff-selector v-model="dept" :options="taffSelectorOptsDept" />
            </div>
          </div>

          <div class="choose-item">
            <div class="choose-label gray">选择人员</div>
            <div class="choose-con">
              <staff-selector
                v-model="member"
                :options="taffSelectorOptsMb"
                @change="test"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <a-button @click="onCancel"> 取消 </a-button>
        <a-button type="primary" @click="onOk">
          {{ isAllowAll ? '保存' : '更新授权' }}
        </a-button>
      </div>
    </a-drawer>

    <a-modal
      v-model="importVisible"
      width="550px"
      height="378px"
      :title="`${permObj.permMode === 'ALL' ? '全部' : '部分'}授权执行`"
      :footer="null"
      :maskClosable="false"
      :closable="isShowCloseIcon"
      @cancel="closeAuModal"
    >
      <div class="import-progress">
        <div>
          <a-progress
            type="circle"
            :percent="importPercent"
            :width="100"
            :status="progressStatus"
          />

          <div class="note">
            {{ auStatus }}
          </div>

          <div class="import-hint">
            {{ auHint }}
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import systemApi from '@/apis/system/system-manager.api';

import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import common from 'cloudpivot/common/pc';

import GeneralSettings from './general-settings.vue';
import {
  Tabs,
  Row,
  Col,
  Button,
  Drawer,
  Radio,
  Modal,
  Progress,
  Tooltip,
  Icon,
} from '@h3/antd-vue';

@Component({
  name: 'license',
  components: {
    StaffSelector,
    RoleSelect: common.components.RoleSelect,
    GeneralSettings,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ARow: Row,
    ACol: Col,
    AButton: Button,
    ADrawer: Drawer,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    AModal: Modal,
    AProgress: Progress,
    ATooltip: Tooltip,
    AIcon: Icon,
  },
})
export default class License extends Vue {
  tabChange() {}

  defaultActiveKey: string = '1';

  activeKey: string = '1';

  layout = {
    left: 4,
    right: 15,
  };

  licenseTypeName(value) {
    switch (value) {
      case 0:
        return '开发';
      case 1:
        return '演示';
      case 2:
        return '生产';
      default:
        return '未知';
    }
  }

  licenseInfo: any = {};

  isShowAuthorization: boolean = false;

  auType: any = 'all';

  role: any = '';

  roleDisplay: any = '';

  dept: any = '';

  member: any = '';

  importPercent: number = 0;

  progressStatus: string = 'active';

  importVisible: boolean = false;

  timer: any = '';

  isShowCloseIcon: boolean = false; // 授权过程是否可以关闭

  isShowAuBtn: boolean = false;

  // 选人控件配置项
  taffSelectorOptsDept = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择部门',
  };

  taffSelectorOptsMb = {
    selectOrg: false,
    selectUser: true,
    showModel: false,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择人员',
  };

  permObj: any = {};

  auHint: string = '当前正在执行批量授权，不可中断关闭页面后仍然会在后台执行';

  auStatus: string = '授权中';

  simulateInterval: any = '';

  isImportEnd: boolean = false;

  // 是否全部允许
  get isAllowAll() {
    return this.permObj.permMode === 'ALL';
  }

  get isOver() {
    const { authorizedUserNum, maxAuthorizedUserNum } = this.permObj;
    return authorizedUserNum > maxAuthorizedUserNum;
  }

  created() {
    if (this.$route.query.tabKey === '2') {
      this.defaultActiveKey = '2';
    }
    this.getLicenseInfo();
    this.getAuGateway();
  }

  getLicenseInfo() {
    systemApi.getLicenseInfo().then((res: any) => {
      if (!res.errcode && res.data) {
        if (Array.isArray(res.data.machineCodeList)) {
          res.data.machineCodeList = res.data.machineCodeList.join(',');
          res.data.dynamicMachineCodeList =
            res.data.dynamicMachineCodeList.join(',');
          res.data.fixedMachineCodeList =
            res.data.fixedMachineCodeList.join(',');
        }
        this.licenseInfo = res.data;
      }
    });
  }

  // 获取用户权限
  async getAuGateway() {
    const res: any = await systemApi.getAuGateway();
    if (res.errcode === 0) {
      this.isShowAuBtn = res.data.enabled;
    }
  }

  closeAuModal() {
    this.importVisible = false;
    this.isImportEnd = false;

    clearTimeout(this.timer);
    clearInterval(this.simulateInterval);
  }

  // 授权模式变化
  onTypeChange() {}

  // 选择角色
  selectRole(roles: any) {
    if (roles) {
      this.role = roles.map((role: any) => role.code);
    }
  }

  test(e) {
    console.log(e);
  }

  // 展示抽屉
  showAuthDrawer() {
    this.isShowAuthorization = true;
  }

  onCancel() {
    this.isShowAuthorization = false;

    this.roleDisplay = [];
    this.dept = '';
    this.role = '';
    this.member = '';
  }

  paramsFormator() {
    const { role, dept, member } = this;
    const { permMode } = this.permObj;
    const authDeparts = dept ? dept.map((item: any) => item.id) : [];
    const authRoles = role ? role : [];
    const authUsers = member ? member.map((item: any) => item.id) : [];
    const params: BPM.System.PermParams = {
      authDeparts,
      authRoles,
      authUsers,
      permMode: permMode,
    };

    return params;
  }

  async submit() {
    const params: BPM.System.PermParams =
      this.paramsFormator() as BPM.System.PermParams;
    const res = await systemApi.setPermInfo(params);
    if (res.errcode === 0) {
      this.isImportEnd = true;
      this.progressStatus = 'success';
      this.auHint = '';
      this.auStatus = '授权完成';
      this.importPercent = 100;

      clearTimeout(this.timer);
      this.isShowCloseIcon = true;

      this.getPermInfo();
    } else {
      this.isImportEnd = true;
      this.progressStatus = 'exception';
      this.auHint =
        res.errcode === 601009
          ? '当前选择人数是超出最大限制，请重新选择！'
          : '网络异常授权失败，请重新执行授权';
      this.auStatus = '';
      this.importPercent = 75;

      clearTimeout(this.timer);
      this.isShowCloseIcon = true;
    }
  }

  /**
   * 产生随机整数
   */
  random(num: number) {
    return Math.ceil(Math.random() * 5);
  }

  /**
   * 模拟导入处理进度
   */
  simulateImport() {
    let percent = 1;
    this.simulateInterval = setInterval(() => {
      if (!this.isImportEnd) {
        if (percent <= 90) {
          percent += this.random(10);
          this.importPercent = percent;
        }
      } else {
        clearInterval(this.simulateInterval);
      }
    }, 500);
  }

  async onOk() {
    const _this = this;
    const hint: string = this.permObj.permMode === 'ALL' ? '全部' : '部分';
    this.$confirm({
      title: `确定执行${hint}授权吗？执行后，只允许授权人员登录`,
      content: '当前组织人员较多时，授权需持续一段时间，请耐心等待',
      okText: this.$t('languages.Apps.Ok').toString(),
      cancelText: this.$t('languages.Apps.Cancel').toString(),
      onOk() {
        _this.importVisible = true;
        _this.progressStatus = 'active';
        _this.auHint =
          '当前正在执行批量授权，不可中断关闭页面后仍然会在后台执行';
        _this.auStatus = '授权中';
        _this.importPercent = 0;
        _this.simulateImport();
        _this.timer = setTimeout(() => {
          _this.submit();
        }, 3000);
      },
    });
  }

  // 获取授权信息
  async getPermInfo() {
    const res: any = await systemApi.getPermInfo();
    if (res.errcode === 0) {
      this.permObj = res.data;

      // 数据回写
      const { authDeparts, authRoles, authUsers } = this.permObj;
      if (authDeparts && authDeparts.length > 0) {
        this.dept = authDeparts.map((item: any) => {
          return {
            type: 1,
            name: item.bizName,
            id: item.bizId,
          };
        });
      }

      if (authUsers && authUsers.length > 0) {
        this.member = authUsers.map((item: any) => {
          return {
            type: 3,
            name: item.bizName,
            id: item.bizId,
          };
        });
      }

      if (authRoles && authRoles.length > 0) {
        this.role = this.roleDisplay = authRoles.map((item: any) => item.bizId);
      }
    } else {
      console.error(res);
    }
  }

  @Watch('isShowAuthorization')
  onIsShowAuthorizationChange(v) {
    if (v) {
      this.getPermInfo();
    }
  }
}
</script>
<style lang="less" scoped>
@import '../../../styles/table.less';
@import '../../../styles/tab.less';
.license {
  // margin: 0 24px;
  /deep/.tabs__wrap {
    margin: 0 24px;
  }
  /deep/.ant-tabs-nav-scroll {
    margin-left: 24px;
  }
  height: 100%;
  &-header {
    padding: 13px 0;
    text-align: left;
    border-bottom: 1px solid #e8e8e8;
    span {
      font-weight: 500;
      font-size: 18px;
      line-height: 22px;
      color: #111218;
    }
  }
  &-content {
    height: calc(100vh - 130px);
    overflow: auto;
    .license-form {
      max-width: 700px;
      .license-item {
        line-height: 32px;
        margin-bottom: 20px;
        color: rgba(17, 18, 24, 0.5);
        text-align: left;
        .license-right {
          color: #111218;
          a {
            color: @primary-color;
          }
          .au-btn {
            margin-left: 16px;
          }
        }
      }
    }
  }
}

.au-wrapper {
  .au-box {
    overflow: auto;
    max-height: calc(100% - 30px);
    & > p {
      color: black;
      opacity: 0.45;
      margin-top: 12px;
      &.over {
        padding: 12px;
        background-color: rgba(255, 251, 230, 1);
        border-radius: 4px;
        border: 1px solid rgba(255, 229, 143, 1);
        opacity: 0.85;
      }
    }
    .au-type {
      display: flex;
      margin-top: 40px;
      div.au-type-label {
        width: 88px;
      }
      div.au-type-item {
        margin-left: 20px;
      }
      /deep/.ant-radio-wrapper {
        margin-right: 65px;
      }
    }
    .choose-part {
      margin-top: 26px;
      .choose-item {
        display: flex;
        margin-bottom: 20px;
        align-items: center;
        .choose-label {
          width: 98px;
        }
        .choose-con {
          flex: 1;
          margin-left: 10px;
          /deep/.role-selector__wrap {
            width: 100%;
          }
          /deep/.role-selector__input {
            width: 100%;
            vertical-align: middle;
          }
          /deep/.h3-organization__label {
            max-height: 180px;
            overflow: auto;
          }
          /deep/.ant-drawer-wrapper-body {
            overflow: unset !important;
          }
        }
      }
    }
  }
  .footer {
    padding: 10px;
    text-align: center;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9;
    box-shadow: 0px -1px 0px 0px rgba(232, 232, 232, 1);
    & > button {
      margin: 0 8px;
    }
  }
  .gray {
    color: rgba(17, 18, 24, 0.5);
  }
}

.import-progress {
  margin: 44px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  & .note {
    font-size: 16px;
    color: #111218;
    margin-top: 10px;
  }
  & .import-hint {
    margin-top: 10px;
    font-size: 14px;
    color: rgba(17, 18, 24, 0.5);
  }
}
.info-title {
  font-size: 16px;
  margin: 16px 0;
  line-height: 24px;
  color: #111218;
  font-weight: bold;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: -10px;
    bottom: 0;
    top: 3px;
    height: 16px;
    width: 4px;
    background: @primary-color;
  }
}
</style>

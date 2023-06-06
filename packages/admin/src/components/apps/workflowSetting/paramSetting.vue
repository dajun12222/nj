<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="param-setting">
    <div v-if="workflowData.workflowCode" class="start-status">
      <div class="switch">
        <span>PC端发起</span>
        <a-switch
          v-model="workflowData.pcOriginate"
          :checked="workflowData.pcOriginate"
          class="pc"
          @change="originateChange"
        />
      </div>
      <div class="switch">
        <span>移动端发起</span>
        <a-switch
          v-model="workflowData.mobileOriginate"
          :checked="workflowData.mobileOriginate"
          class="mobile"
          @change="originateChange"
        />
      </div>
    </div>
    <div class="set-permissions">
      <div class="setting-title">
        <div class="setting-title__left">
          <span>发起权限设置</span>
          <a-tooltip placement="top">
            <span slot="title">应用被停用后，发起权限设置失效，所有人都无法发起流程</span>
            <i class="icon aufontAll h-icon-all-question-circle-o"></i>
          </a-tooltip>
        </div>
        <div class="setting-title__right">
          <a-switch v-model="enableAll" @change="toggleEnableAll" />
          <span>所有人可发起</span>
          <a-button
            type="primary"
            class="add-item"
            :disabled="enableAll"
            @click="addItem"
          >
            新增
          </a-button>
        </div>
      </div>
      <a-table
        v-show="!enableAll"
        :columns="tableColums"
        :dataSource="scopeList"
        :pagination="false"
        class="scope-list"
      >
        <span slot="nameTitle" class="head full-name">用户范围</span>
        <span slot="operationTitle" class="head operation">操作</span>

        <span slot="name" slot-scope="text, record">
          <template>
            <a-popover
              overlayClassName="text-info-detail"
              placement="bottomLeft"
            >
              <template slot="content">
                <div class="text-info-box">
                  <div class="text-info-item">
                    <div class="item-name" :title="record.name">
                      {{ record.name }}
                    </div>
                    <div class="item-path" :title="record.fullName">
                      {{ record.fullName }}
                    </div>
                  </div>
                </div>
              </template>
              {{ text }}
            </a-popover>
          </template>
          <!-- <a-tooltip>
            <div slot="title">
              {{ record.fullName }}
            </div>
            {{ text }}
          </a-tooltip> -->
        </span>
        <span slot="operation" slot-scope="text, record">
          <i
            class="icon aufontAll h-icon-all-delete-o delete"
            @click.stop="deleteRow(record)"
          ></i>
        </span>
      </a-table>
      <!-- 弹窗 -->
      <a-modal
        title="新增权限"
        :visible="showAddPermit"
        :closable="true"
        :maskClosable="false"
        :width="552"
        wrapClassName="add-permit-wrap"
        @cancel="hideAddPermit"
        @ok="submitAdd"
      >
        <originator-modal
          :visible="showAddPermit"
          :workflowCode="workflowCode"
          @select="setParams"
        />
      </a-modal>
    </div>
  </div>
</template>
<script lang="ts">
import WorkflowApi from '@/apis/workflow';
import { Modal, Tooltip, Table, Switch, Button, Popover } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import OriginatorModal from './originatorModal.vue';

const MenuModule = namespace('Apps/AppItem');

@Component({
  name: 'ParamSetting',
  components: {
    OriginatorModal,
    AModal: Modal,
    ATooltip: Tooltip,
    ATable: Table,
    ASwitch: Switch,
    AButton: Button,
    APopover: Popover,
  },
})
export default class ParamSetting extends Vue {
  @MenuModule.Action('getWorkflowDetail') getWorkflowDetail: any;

  @MenuModule.Action('updateWorkflow') updateWorkflow: any;

  scopeList: any = []; // 表格数据数组

  // 流程code
  workflowCode: string = '';

  // 流程模板数据
  workflowData: any = {};

  isClose: boolean = false;

  // 表格列的配置
  tableColums: any = [
    {
      dataIndex: 'name',
      align: 'left',
      slots: { title: 'nameTitle' },
      scopedSlots: { customRender: 'name' },
    },
    {
      width: 60,
      dataIndex: 'operation',
      slots: { title: 'operationTitle' },
      scopedSlots: { customRender: 'operation' },
    },
  ];

  selectors: any = [];

  showAddPermit: boolean = false;

  // 所有人可发起开关
  enableAll: boolean = false;

  beforeMount() {
    if (this.$route.params && this.$route.params.workflowCode) {
      this.workflowCode = this.$route.params.workflowCode;
      this.getPermissionList({ workflowCode: this.workflowCode });
      this.getWorkflowDetail({ workflowCode: this.workflowCode }).then(
        (res: any) => {
          if (!res.errcode) {
            this.workflowData = res.data;
            if (res.data.visibleType && res.data.visibleType === 1) {
              this.enableAll = true;
            } else {
              this.enableAll = false;
            }
          }
        },
      );
    }
  }

  /**
   * 获取发起流程权限列表
   */
  getPermissionList(params) {
    WorkflowApi.getPermissionList(params).then((res) => {
      this.scopeList = res.data; //流程设置-参数设置-设置用户范围数组
    });
  }

  /**
   * pc发起或移动发起权限改变
   */
  originateChange() {
    this.updateWorkflow(this.workflowData).then((res: any) => {
      if (res.errcode === 0) {
        this.$message.success('更新成功');
      }
    });
  }

  /**
   * 新增发起权限设置项
   */
  addItem() {
    if (this.enableAll) {
      // NOTE: 如果开启了所有人可发起，则禁止新增发起权限条目
      return;
    }
    this.selectors = [];
    this.showAddPermit = true;
  }

  /**
   * 隐藏新增弹窗
   */
  hideAddPermit() {
    this.showAddPermit = false;
    this.selectors = [];
  }

  /**
   * 删除表格行权限条目数据
   */
  deleteRow(list: any) {
    if (this.isClose) {
      return; // 避免重复点击删除弹窗
    }
    this.isClose = true;
    this.$confirm({
      title: '确定要删除用户权限？',
      okType: 'danger',
      okText: this.$t('languages.Apps.Delete').toString(),
      cancelText: this.$t('languages.Apps.Cancel').toString(),
      onOk: () => {
        this.isClose = false;
        const permissionId: string = list.id;
        WorkflowApi.deletePermission({ permissionId }).then((res: any) => {
          if (res.errcode === 0) {
            this.$message.success('删除流程权限成功');
            this.getPermissionList({ workflowCode: this.workflowCode });
          } else {
            let errmsg: string = res.errmsg;
            if (res.errcode === 700020) {
              errmsg = '您无此部门/人员的管理范围，无法删除';
            }
            if (res.errcode === 402002) {
              errmsg = '删除失败，权限已被删除';
            }
            this.$message.error(errmsg);
          }
        });
      },
      onCancel: () => {
        this.isClose = false;
      },
    });
  }

  // 设置发起权限的角色/部门/人员
  setParams(params: any) {
    this.selectors = params;
  }

  /**
   * 点击提交按钮
   */
  submitAdd() {
    if (!this.selectors.length) {
      this.$message.warning('请设置发起权限内容');
      return;
    }

    console.log(this.selectors);

    this.submit().then(() => {
      this.getPermissionList({ workflowCode: this.workflowCode });
      this.hideAddPermit();
    });
  }

  /**
   * 提交到接口，创建发起流程权限
   */
  submit() {
    const promiseArray: any = [];

    this.selectors.forEach((selector: any) => {
      promiseArray.push(WorkflowApi.createPermission(selector));
    });

    const vm: any = this;

    return Promise.all(promiseArray).then((res: any) => {
      if (Array.isArray(res)) {
        const resData = res.filter((r: Common.Data) => r.errcode !== 0);
        if (!resData.length) {
          vm.$message.success('创建流程权限成功');
        } else {
          vm.$message.error(`${resData.length}条流程权限创建失败`);
        }
        vm.selectors = [];
      }
    });
  }

  toggleEnableAll(val: boolean) {
    console.log(val);
    if (val) {
      this.workflowData.visibleType = 1;
    } else {
      this.workflowData.visibleType = 2;
    }
    this.originateChange();
  }
}
</script>
<style lang="less" scoped>
.param-setting {
  padding: 0 24px;
  .start-status {
    height: 116px;
    line-height: 58px;
    text-align: left;
    color: rgba(17, 18, 24, 0.5);
    border-bottom: 1px solid #e8e8e8;
    .switch {
      padding-left: 24px;
      position: relative;
      .pc,
      .mobile {
        position: absolute;
        left: 122px;
        top: 24px;
      }
    }
  }
  .set-permissions {
    margin-top: 8px;
    .setting-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
      color: #000;
      text-align: left;
      line-height: 64px;
      font-weight: 500;
      font-size: 14px;
      span {
        margin-right: 8px;
      }
      &__right {
        span {
          margin: 0 25px 0 8px;
        }
      }
    }
    .scope-list {
      /deep/.ant-table-thead {
        th {
          padding: 8px 16px;
        }
      }
      .head {
        font-weight: 500;
        white-space: nowrap;
      }
      /deep/.ant-table-row {
        td {
          padding: 8px 16px;
        }
        .delete {
          margin-left: 7px;
          font-size: 14px;
          cursor: pointer;
          &:hover {
            color: #ff4d4e;
          }
        }
      }
    }
    /deep/.ant-table-placeholder {
      display: none;
    }
  }
}
</style>

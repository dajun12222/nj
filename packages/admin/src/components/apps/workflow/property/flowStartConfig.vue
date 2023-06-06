<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="flow-start-config">
    <template>
      <property-widget label="所有人可发起">
        <template slot="title-right">
          <a-switch
            v-model="enableAll"
            size="small"
            @change="toggleEnableAll"
          />
        </template>
      </property-widget>
    </template>

    <template v-if="!enableAll">
      <property-widget label="发起权限设置">
        <template slot="title-right">
          <em
            class="icon aufontAll h-icon-all-plus-o"
            @click="showAddPermit = true"
          ></em>
        </template>

        <template>
          <div slot="right" class="right-box">
            <div class="scope-list">
              <p>用户范围</p>
              <div
                v-for="(item, index) in scopeList"
                :key="index"
                class="scope-item"
              >
                <div :title="item.fullName">
                  {{ item.name }}
                </div>
                <em
                  class="icon aufontAll h-icon-all-delete1"
                  @click="deleteRow(item)"
                ></em>
              </div>
            </div>
          </div>
        </template>
      </property-widget>
    </template>

    <template v-if="workflowData.workflowCode">
      <property-widget label="发起配置">
        <div slot="right" class="right-box switch-wrapper">
          <div class="switch">
            <a-checkbox
              v-model="workflowData.pcOriginate"
              @change="originateChange"
            >
              PC端发起
            </a-checkbox>
          </div>

          <div class="switch">
            <a-checkbox
              v-model="workflowData.mobileOriginate"
              @change="originateChange"
            >
              移动端发起
            </a-checkbox>
          </div>
        </div>
      </property-widget>
    </template>

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
</template>

<script lang="ts">
import { Switch, Checkbox, Modal } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
const MenuModule = namespace('Apps/AppItem');
import WorkflowApi from '@/apis/workflow';
import PropertyWidget from '../base/propertyWidget.vue';
import OriginatorModal from '../../workflowSetting/originatorModal.vue';
import setPrivilege from '@/components/apps/workflowSetting/set-privilege.vue';

@Component({
  name: 'flowStartConfig',
  components: {
    ASwitch: Switch,
    PropertyWidget,
    OriginatorModal,
    ACheckbox: Checkbox,
    AModal: Modal,
  },
})
export default class flowStartConfig extends Vue {
  @MenuModule.Action('getWorkflowDetail') getWorkflowDetail: any;

  @MenuModule.Action('updateWorkflow') updateWorkflow: any;

  enableAll: boolean = false; // 所有人可发起开关

  workflowData: any = {}; // 流程模板数据

  workflowCode: string = ''; // 流程code

  scopeList: any = []; // 表格数据数组

  showAddPermit: boolean = false;

  selectors: any = [];

  isClose: boolean = false;

  /**
   * 隐藏新增弹窗
   */
  hideAddPermit() {
    this.showAddPermit = false;
    this.selectors = [];
  }

  /**
   * 点击提交按钮
   */
  submitAdd() {
    if (!this.selectors.length) {
      this.$message.warning('请设置发起权限内容');
      return;
    }
    this.submit().then(() => {
      this.getPermissionList({ workflowCode: this.workflowCode });
      this.hideAddPermit();
    });
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
          const repeatError =
            '【流程发起权限部门' +
            resData.reduce((prev, cur, index) => {
              const deptInfo = this.filterKeyValue(cur, 402003);
              if (deptInfo) {
                let result = prev + (deptInfo + '”');
                if (index !== resData.length - 1) {
                  result += '“';
                }
                return result;
              } else {
                return prev;
              }
            }, '“') +
            '已存在】';
          vm.$message.error(
            `${resData.length}条流程权限创建失败: ${repeatError}`,
          );
        }
        vm.selectors = [];
      }
    });
  }

  //获取错误信息中的关键信息
  filterKeyValue(cur, code) {
    if (cur.errcode !== code) {
      return '';
    }
    const startIndex = cur.errmsg.indexOf('【') + 1;
    const endIndex = cur.errmsg.indexOf('】');
    return cur.errmsg.substring(startIndex, endIndex);
  }

  // 设置发起权限的角色/部门/人员
  setParams(params: any) {
    this.selectors = params;
  }

  /**
   * 获取发起流程权限列表
   */
  getPermissionList(params) {
    WorkflowApi.getPermissionList(params).then((res) => {
      this.scopeList = res.data; //流程设置-参数设置-设置用户范围数组
    });
  }

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

  toggleEnableAll(val: boolean) {
    if (val) {
      this.workflowData.visibleType = 1;
    } else {
      this.workflowData.visibleType = 2;
    }
    this.originateChange();
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
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.scope-list {
  background: #f1f2f6;
  border-radius: 2px;
  padding: 8px;
  width: 100%;
  p {
    font-weight: 600;
    color: @s-light-font-color;
    font-size: 12px;
    line-height: 20px;
  }
  .scope-item {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    align-items: center;
    div {
      font-size: 13px;
      color: @nav-font-color;
      width: calc(100% - 32px);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    em {
      font-size: 16px;
      color: @light-font-color;
      cursor: pointer;
      &:hover {
        color: @primary-color;
        opacity: 0.8;
      }
    }
  }
}

.switch-wrapper {
  display: flex;
  align-content: center;
  .switch {
    display: flex;
    align-content: center;
    margin-right: 32px;
  }
}
</style>

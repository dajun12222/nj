<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="workflow-config">
    <div class="guide">
      <div class="workflow-config__header">
        <span>流程运行</span>
        <span class="header__tips">开启后可模拟流程的执行情况，校验流程是否可以跑通</span>
      </div>
      <div class="field">
        <span class="field_title">是否开启</span>
        <a-switch
          v-model="simulateOpen"
          class="middle-size"
          @change="onSimulateOpenChange"
        />
      </div>
      <div v-if="simulateOpen" class="table-box-tip">
        <span class="icon aufontAll warning">&#xe99a;</span>
        <span class="file-status-txt">开启后对所有流程生效，流程运行环境的模拟数据将在流程中心展示，为保障业务信息不被干扰，请勿在生产环境使用此功能！</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Switch } from '@h3/antd-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import {
  SystemSettingType,
  getSettingParam,
  editSettingParam,
} from './type/index';
import systemApi from '@/apis/system/system-manager.api';

@Component({
  name: 'workflow-config',
  components: {
    ASwitch: Switch,
  },
})
export default class WorkflowConfig extends Vue {
  simulateOpen: any = false;

  created() {
    this.getWorkflowConfig();
  }

  onSimulateOpenChange() {
    this.submit();
  }

  submit() {
    const param: editSettingParam = {
      settingType: SystemSettingType[SystemSettingType.WORKFLOW_SIMULATIVE],
      bodyParams: {
        'workflow.simulative.switch': this.simulateOpen + '',
      },
    };

    systemApi.editSettingByType(param).then((res: any) => {
      if (res.errcode === 0) {
        this.$message.success('保存成功');
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  getWorkflowConfig() {
    const param: getSettingParam = {
      settingType: SystemSettingType[SystemSettingType.WORKFLOW_SIMULATIVE],
    };
    systemApi.getSettingByType(param).then((res: any) => {
      if (res.errcode === 0) {
        this.simulateOpen =
          res.data && res.data['workflow.simulative.switch'] === 'true';
      }
    });
  }
}
</script>

<style lang="less" scoped>
.workflow-config {
  &__header {
    padding-bottom: 20px;
    position: relative;
    // font-size:18px;
    color: #111218;
    font-weight: 600;
    span {
      line-height: 26px;
      height: 26px;
    }

    .header__tips {
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
      padding-left: 8px;
    }
  }
  .field {
    line-height: 22px;
    display: flex;
    align-items: center;
    padding-bottom: 24px;
    .field_title {
      font-size: 14px;
      line-height: 22px;
      padding-right: 8px;
      color: rgba(17, 18, 24, 0.5);
    }
  }

  .table-box-tip {
    max-width: 656px;
    background: #fffbe6;
    border-radius: 4px;
    border: 1px solid #ffe58f;
    padding-left: 16px;
    padding-top: 8px;
    padding-bottom: 8px;
    display: flex;
    & > .icon {
      color: #faad14;
      font-size: 16px;
    }
    & > .file-status-txt {
      padding-left: 12px;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: rgba(17, 18, 24, 0.5);
    }
  }
}
</style>

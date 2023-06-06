<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="sms-config">
    <a-tabs :defaultActiveKey="integrationDefaultActiveKey" @change="change">
      <!-- 短信配置 -->
      <a-tab-pane key="1" tab="短信配置" class="xxxxx">
        <div class="tabs__wrap">
          <div class="row">
            <div class="wrapper">
              <div class="label" :class="{ isEditConfig: isEditConfig }">
                <a-checkbox v-if="isEditConfig" v-model="params.sms" />
                短信消息通知
              </div>
              <div v-if="!isEditConfig" class="status">
                {{ params.sms ? '已开启' : '未开启' }}
              </div>
            </div>
            <p v-if="isEditConfig">
              开启后，所有流程中均可调用<span><span class="font-ele">短信模板</span></span>里的模板发起短信通知
            </p>
          </div>

          <div class="row">
            <div class="wrapper">
              <div class="label" :class="{ isEditConfig: isEditConfig }">
                <a-checkbox v-if="isEditConfig" v-model="params.urge" />
                催办使用短信消息通知
              </div>
              <div v-if="!isEditConfig" class="status">
                {{ params.urge ? '已开启' : '未开启' }}
              </div>
            </div>
            <p v-if="isEditConfig">
              流程运行时，催办信息可使用短信发送
              <span class="font-ele">ps:催办是全局操作，不建议开启</span>
            </p>
          </div>

          <div class="btns">
            <a-button
              v-if="!isEditConfig"
              type="primary"
              @click="isEditConfig = true"
            >
              编辑
            </a-button>
            <a-button v-else type="primary" @click="save"> 保存 </a-button>
          </div>
        </div>
      </a-tab-pane>

      <!-- 短信模板 -->
      <a-tab-pane key="2" tab="短信模板">
        <div class="tabs__wrap2">
          <p class="tips">
            <span class="icon aufontAll h-icon-all-Components_Warning"></span>短信模板主要用于与第三方短信服务商对接使用，使用时在服务商和产品上创建相同模板，并将服务商的模板编码写入产品模板中
          </p>
          <smsTemplateSetting />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import OrgApi from '@/apis/organization';
import smsTemplateSetting from './sms-template-setting.vue';
import { Tabs, Checkbox, Button } from '@h3/antd-vue';

@Component({
  name: 'sms-config',
  components: {
    smsTemplateSetting,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ACheckbox: Checkbox,
    AButton: Button,
  },
})
export default class smsConfig extends Vue {
  integrationDefaultActiveKey: string = '1';

  isEditConfig: boolean = false;

  @Prop() parentKey!: string;

  @Watch('parentKey')
  onParentKeyChange() {
    this.isEditConfig = false;
  }

  change(tabKey) {
    this.isEditConfig = false;
    if (tabKey === '1') {
      this.params = { ...this.cacheSmsSetting };
    }
  }

  save() {
    this.updateSmsSetting();
  }

  // 更新短信通知开关状态
  async updateSmsSetting() {
    await OrgApi.updateSmsSetting({
      todoSwitch: this.params.sms ? 'true' : 'false',
      urgeSwitch: this.params.urge ? 'true' : 'false',
    }).then((res: any) => {
      if (res.errcode === 0) {
        this.isEditConfig = false;
        this.getSmsSetting();
        this.$message.success(res.errmsg as string);
      } else {
        this.$message.error(res.errmsg as string);
      }
    });
  }

  cacheSmsSetting: any = {};

  // 获取短信通知开关状态
  async getSmsSetting() {
    await OrgApi.getSmsSetting({}).then((res: any) => {
      if (res.errcode === 0) {
        (res.data as any[]).forEach((element) => {
          if (element.settingCode === 'sms.todo.switch') {
            this.$set(this.params, 'sms', element.settingValue === 'true');
          } else if (element.settingCode === 'sms.urge.switch') {
            this.$set(this.params, 'urge', element.settingValue === 'true');
          } else {
            //Else Empty block statement
          }
          this.cacheSmsSetting = { ...this.params };
        });
      }
    });
  }

  params: any = {
    sms: false,
    urge: false,
  };

  created() {
    this.getSmsSetting();
  }
}
</script>
<style lang="less"></style>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.row {
  display: flex;
  flex-direction: column;
  line-height: 22px;
  font-size: 14px;
  color: #000;
  margin-bottom: 20px;
  .wrapper {
    display: flex;
    .label {
      width: 204px;
      text-align: left;
      display: flex;
      align-items: center;
      color: rgba(17, 18, 24, 0.5);
      label {
        margin-right: 8px;
      }
    }
    .status {
      color: rgba(17, 18, 24);
    }
    .isEditConfig {
      color: rgba(0, 0, 0, 0.65);
    }
  }
  p {
    font-size: 12px;
    color: rgba(17, 18, 24, 0.5);
    margin-top: 10px;
    span {
      display: inline-block;
      position: relative;
      margin: 0 3px;
      line-height: 1;
      .font-ele {
        display: inline-block;
        position: relative;
        background-color: #fff;
        z-index: 2;
        padding: 0 3px;
        color: @primary-color;
      }
      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 8px;
        background-color: @sub-bg-color;
        margin-left: -1px;
        margin-top: -1px;
        z-index: 1;
      }
      &::before {
        content: '';
        position: absolute;
        right: 0;
        bottom: 0;
        width: 4px;
        height: 8px;
        background-color: @sub-bg-color;
        margin-right: -1px;
        margin-bottom: -1px;
        z-index: 1;
      }
    }
  }
}

.btns {
  padding-top: 4px;
}
// .tabs__wrap{
//   margin-top: 8px;
//   // padding-left: 26px;
// }
.tips {
  height: 40px;
  line-height: 38px;
  background: #fffbe6;
  border-radius: 4px;
  border: 1px solid #ffe58f;
  padding: 0 16px;
  color: #111218;
  white-space: nowrap;
  span {
    margin-right: 10px;
    color: #faad14;
  }
}
</style>

<style lang="less">
@import '~@/styles/color/colors.less';
.sms-config {
  .ant-tabs-nav-container {
    overflow: unset;
  }
  .ant-tabs-bar {
    border-bottom: none;
  }
  .ant-tabs-nav {
    height: 32px;
    margin: 0 !important;
    overflow: visible;
    .ant-tabs-tab {
      width: 90px;
      height: 32px;
      background: #ffffff;
      color: @nav-font-color;
      line-height: 32px;
      padding: 0;
      margin: 0;
      text-align: center;
      margin-right: 0px !important;
      border: 1px solid rgba(17, 18, 24, 0.25);
      &::before {
        display: none;
      }

      &:first-child {
        border-radius: 2px;
        border-right: 0;
      }
      &:nth-child(2) {
        border-radius: 2px;
        border-left: 0;
      }
    }
    .ant-tabs-tab-active {
      border: 1px solid !important;
      color: @primary-color !important;
      border-color: @primary-color !important;
    }

    .ant-tabs-ink-bar {
      display: none !important;
    }
  }
  .ant-table-body {
    max-height: calc(
      100vh - 60px - 72px - 72px - 40px - 68px - 58px
    ) !important;
  }
}
</style>

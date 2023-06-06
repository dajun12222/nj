<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div :key="$route.path">
    <!-- <a-alert
      v-if="!!errorMsg"
      id="errorMsgAlert"
      type="warning"
      :message="errorMsg"
      onClose="onErrorMsgChange('')"
      banner
      closable
    /> -->
    <section class="design-wrapper">
      <div class="design-header">
        <ListDesignHeader
          :designType="designType"
          :showPreview="showPreview"
          :listConfig.sync="listConfigData"
          @handleSave="handleSave"
          @viewChange="viewChange"
          @togglePreview="togglePreview"
        />
      </div>
      <div v-show="designType === 'page'" class="design-content">
        <ListDesignContent
          class="design-wrapper__left"
          :listConfig="listConfigData"
          :showPreview="showPreview"
        />
        <h3-sider :options="rightSider">
          <ListDesignSide
            ref="aside"
            :designType="designType"
            @saveFlagInHtmlDesignType="saveFlagInHtmlDesignType"
            @onConfigDataReady="onConfigDataReady"
            @onErrorMsgChange="onErrorMsgChange"
            @onListConfigDataChange="onListConfigDataChange"
          />
        </h3-sider>
      </div>
      <div v-if="designType === 'html'" class="design-content page">
        <!-- design设计区内容 -->
        <ListEditor
          ref="editor"
          :options="designOptions"
          :monacoModule="monacoModule"
        />
      </div>
      <!-- 切换 页面/html 设计视图 -->
      <div class="design-toggle">
        <span v-if="designType === 'page'" @click="toggleToHTML">切换至html</span>
        <span v-else @click="toggleToPage">切换至页面设计</span>
      </div>
    </section>

    <a-modal
      :visible="showUnsaveConfirm"
      :closable="false"
      :maskClosable="false"
      :width="400"
      wrapClassName="unsave-confirm"
    >
      <div class="unsave-confirm--content">
        <i class="icon aufontAll h-icon-all-question-circle"></i>
        <strong>{{ $t('languages.Apps.ListLeaveTips') }}</strong>
      </div>

      <template slot="footer">
        <a-button key="cancel" @click="handleConfirmCancel">
          {{ $t('languages.Apps.Cancel') }}
        </a-button>
        <a-button key="unsave" @click="handleConfirmUnsave">
          {{ $t('languages.Apps.Unpublish') }}
        </a-button>
        <a-button
          key="save"
          class="ant-btn-large"
          type="primary"
          @click="handleConfirmOk"
        >
          {{ $t('languages.Apps.PublishAndLeave') }}
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
import H3Sider from '@/common/sider/sider.vue';
import ListDesignSide from '@/components/apps/list-design/aside.vue';
import Bus from '@/utils/bus';
import { Button, Modal } from '@h3/antd-vue';
import * as H3List from 'cloudpivot/h3-list';
import { Component, Provide, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ListDesignContent from './listDesign-content.vue';
import ListDesignHeader from './listDesign-header.vue';

const ListdesignModule = namespace('Apps/Listdesign');

const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'ListDesign',
  components: {
    ListDesignHeader,
    ListDesignContent,
    ListDesignSide,
    H3Sider,
    ListEditor: H3List.components.Editor,
    AModal: Modal,
    AButton: Button,
  },
  beforeRouteUpdate(to, from, next) {
    const vm: any = this;
    if (vm.edit) {
      vm.confirmSave().then(
        () => {
          vm.onEdit(false);
          next();
        },
        () => {
          next(false);
        },
      );
    } else {
      next();
    }
  },
  beforeRouteLeave(to, from, next) {
    const vm: any = this;
    if (vm.edit) {
      // vm.$confirm({
      //   title: `${this.$t('languages.Apps.ListLeaveTips')}`,
      //   okText: `${this.$t('languages.Apps.SaveAndLeave')}`,
      //   cancelText: `${this.$t('languages.Apps.Unsave')}`,
      //   onOk() {
      //     Bus.$emit('saveListDesign', (flag: boolean) => {
      //       if (flag) {
      //         next();
      //       } else {
      //         next(false);
      //       }
      //     });
      //   },
      //   onCancel() {
      //     next();
      //   }
      // });
      vm.confirmSave().then(
        () => {
          vm.onEdit(false);
          next();
        },
        () => {
          next(false);
        },
      );
    } else {
      vm.clearListDesignData();
      next();
    }
  },
})
export default class ListDesign extends Vue {
  @ListdesignModule.State('edit') edit: any;

  @ListdesignModule.State('workflowList') workflowList: any;

  @ListdesignModule.Mutation('setSaveFlage') mutationSaveFlage: any;

  @ListdesignModule.Mutation('onEdit') onEdit: any;

  @ListdesignModule.Mutation('clearListDesignData') clearListDesignData: any;

  @DataModelModule.Mutation('setDatacustomButton') setDatacustomButton: any;

  @DataModelModule.Mutation('setCustomButtonEdit') setCustomButtonEdit: any;

  // --variables
  rightSider: object = {
    width: 304,
    minWidth: 304,
    maxWidth: 700,
    direction: 'right',
  };

  monacoModule: any = null; // 编辑器模块

  designType: string = 'page';

  designOptions: H3List.schema.ListOptions | null = null;

  showUnsaveConfirm = false;

  // --methods
  saveConfirmPromiseResolve: Function | null = null;

  saveConfirmPromiseReject: Function | null = null;

  listConfigData: any = null;

  onListConfigDataChange(data) {
    this.listConfigData = data;
  }

  handleSave() {
    const buttonAdd = this.listConfigData.queryActions
      ? this.listConfigData.queryActions.filter(
          (a) => a.actionCode === 'add',
        )[0]
      : null;
    const workflowList = this.workflowList || [];

    // console.log( '________ ')
    // console.log( buttonAdd, buttonAdd.associationCode )
    // console.log( workflowList );

    // 检测流程关联
    if (
      buttonAdd &&
      buttonAdd.associationType === 1 &&
      buttonAdd.associationCode &&
      workflowList.length &&
      !workflowList.some((f) => f.workflowCode === buttonAdd.associationCode)
    ) {
      return this.$message.warning(
        '新增按钮绑定的流程编码不存在，请重新设置！',
      );
    }

    // return;

    this.mutationSaveFlage(true);
  }

  errorMsg: string = '';

  onErrorMsgChange(msg) {
    this.errorMsg = msg;
  }

  @Provide()
  emitScrollLock(lock: boolean) {
    this.$emit('scrollLock', lock);
  }

  viewChange() {
    this.designType = 'page';
  }

  showPreview: boolean = false;

  async togglePreview(val: boolean) {
    if (this.designType === 'html') {
      await this.saveFlagInHtmlDesignType({ shouldSaveData: false });
    }
    this.showPreview = val;
  }

  async toggleToHTML() {
    this.designOptions = null;
    const options: any = await this.setDesignOptions();
    if (options) {
      options.queryColumns.forEach((act: any, index: number) => {
        act.sortKey = index + 1;
      });
      this.designOptions = options;
      this.switchDesignTypeToHTML();
    }
  }

  async parseEditorData() {
    return this.renewDesignStore().then((options) => {
      if (options) {
        const aside: any = this.$refs.aside;
        if (aside) {
          return aside.getListInfo(aside.formatedFieldsData, options); // 处理器数据
        }
      }
    });
  }

  async toggleToPage() {
    // 只在解析成功以后才切换视图, 失败的话保持在html编辑状态
    this.parseEditorData()
      .then((resp) => {
        this.designType = 'page';
      })
      .catch((err) => {
        this.$message.error(err.toString());
      });
  }

  async saveFlagInHtmlDesignType(data: any) {
    const { shouldSaveData, callback } = data;
    const aside: any = this.$refs.aside;

    this.parseEditorData()
      .then((resp) => {
        // 在html模式下预览, 也需要先解析最新数据, 但不必保存
        if (shouldSaveData) {
          aside.toSaveListDesign().then(() => {
            // 切换路由时，有更改的需要先保存再执行回调函数callback
            if (callback && typeof callback === 'function') {
              // eslint-disable-next-line standard/no-callback-literal
              callback(true);
            }
          });
        }
      })
      .catch((err) => {
        this.mutationSaveFlage(false);
        this.$message.error(err.toString());
      });
  }

  /**
   * 将设计数据整理后传入编辑器
   */
  setDesignOptions() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const aside: any = this.$refs.aside;
      if (aside) {
        const res = await aside.generateDesignData();
        //甘特图类型无法渲染HTML，暂时这样改
        console.log('generateDesignData', res);
        resolve(res);
      }
    });
  }

  /**
   * 将编辑内容整理后更新到store
   */
  renewDesignStore() {
    return new Promise((resolve, reject) => {
      const editor: any = this.$refs.editor;
      if (editor) {
        setTimeout(async () => {
          // const options: any = await
          editor
            .parseToOptions()
            .then((options) => {
              resolve(options);
            })
            .catch((err) => {
              reject(err);
            });
          // resolve(options);
        }, 0);
      }
    });
  }

  // 数据已准备好
  isConfigDataReady: boolean | string = 'list data loading...';

  onConfigDataReady(val) {
    this.isConfigDataReady = val;
  }

  /**
   * 异步获取编辑器模块
   */
  async loadMonacoMuduleAsync() {
    const win = window as any;
    const instanceNameInMemory = '__module__monaco__in__page__listDesigner';
    // 首先取内存中的实例(避免切换页面重复加载)
    this.monacoModule =
      win[instanceNameInMemory] ||
      (win[instanceNameInMemory] = await import('monaco-editor'));
    return this.monacoModule;
  }

  // 切换到html设计模式
  async switchDesignTypeToHTML() {
    if (!this.monacoModule) {
      await this.loadMonacoMuduleAsync();
    }
    if (this.isConfigDataReady !== true) {
      return this.$message.error(this.isConfigDataReady as string);
    }

    this.designType = 'html';
  }

  // 延迟但提前加载编辑器模块
  mounted() {
    this.loadMonacoMuduleAsync();
  }

  /**
   * 询问是否保存
   */
  confirmSave() {
    const _this = this;
    this.showUnsaveConfirm = true;

    return new Promise((resolve, reject) => {
      this.saveConfirmPromiseResolve = resolve;
      this.saveConfirmPromiseReject = reject;
    });
  }

  /*
   * 保存提示窗--取消
   */
  handleConfirmCancel() {
    this.showUnsaveConfirm = false;
    if (this.saveConfirmPromiseReject) {
      this.saveConfirmPromiseReject();
      this.saveConfirmPromiseReject = null;
    }
  }

  destroy() {
    this.clearListDesignData();
  }

  /*
   * 保存提示窗--不保存
   */
  handleConfirmUnsave() {
    this.showUnsaveConfirm = false;
    if (this.saveConfirmPromiseResolve) {
      this.saveConfirmPromiseResolve();
      this.saveConfirmPromiseResolve = null;
    }
    this.clearListDesignData();
    this.setCustomButtonEdit(false);
    this.setDatacustomButton([]);
  }

  /*
   * 保存提示窗--保存并离开
   */
  handleConfirmOk() {
    Bus.$emit('saveListDesign', (flag: boolean) => {
      this.handleConfirmUnsave();
    });
  }
}
</script>

<style lang="less" scoped>
@import '~@/components/apps/form-design/style/form-design-scoped.less';
</style>
<style lang="less">
@bar-height: 48px;
#errorMsgAlert + .design-wrapper {
  height: calc(100% - 37px);
}

.float-left {
  float: left;
}
.float-right {
  float: right;
}
.bar-title {
  font-size: 14px;
  font-family: PingFangSC-Medium;
  font-weight: 400;
  color: rgba(17, 18, 24, 0.5);
  flex: 1;
  display: flex;
  align-items: center;
  .bar-name {
    font-size: 16px;
    color: #111218;
    font-weight: 600;
    max-width: 126px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    float: left;
    cursor: pointer;
  }
  i {
    margin-left: 8px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    cursor: pointer;
  }
  &.title-2 {
    // background:#696262; // 临时
    font-size: 14px;
    font-weight: 600;
    color: #111218;
  }
  &.title-3 {
    font-size: 13px;
    font-weight: 700;
    margin-left: 0;
    color: rgba(0, 0, 0, 1);
  }
}
.bar-right {
  button {
    margin-left: 24px;
  }
}
.bar-title-c {
  margin-left: 12px;
}
.bar-c {
  color: rgba(17, 18, 24, 0.5);
}
.icons {
  display: inline-block;
  cursor: pointer;
}
.design-wrapper {
  height: 100%;
  background: #f7f8fa;
  .design-header {
    width: 100%;
    padding: 12px 24px;
    height: 50px;
    background: #ffffff;
    box-shadow: 0px 1px 0px 0px #e4e4e4;
    display: flex;
    align-items: center;
  }
  .design-content {
    display: flex;
    height: calc(100% - 50px);
    &.page {
      background: #fff;
    }
  }
  .content {
    flex: 1;
    background: #f7f8fa;
    height: calc(100vh - 110px);
    overflow: hidden;
    &-box {
      min-height: 80px;
      flex: none;
    }
  }
  // .aside{
  //     width: 304px;
  // }
  .h3-size-slider {
    border-top: thin solid #e8e8e8;
    .ant-tabs-tab {
      margin-left: 34px !important;
      margin-right: 34px !important;
    }
  }
  .h3-sider-toggle {
    display: none;
  }
  .design-toggle {
    position: absolute;
    bottom: 24px;
    padding: 5px 16px;
    border-radius: 0 25px 25px 0;
    background: @primary-color;
    cursor: pointer;
    span {
      font-size: 14px;
      color: #fff;
    }
  }
}
</style>
<style lang="less" scoped>
/deep/ .ant-radio-button-wrapper {
  border: none;
  background: #fff;
  font-size: 12px;
  color: #111218;
  height: 26px;
  line-height: 26px;
}
/deep/ .ant-radio-button-wrapper:hover {
  color: #111218;
  box-shadow: unset;
  border: none;
  border-radius: none;
}
/deep/.ant-radio-button-wrapper-checked {
  font-weight: 600;
  outline: none;
  background-color: #e2e2e2;
  border-radius: 2px;
  box-shadow: unset;
}
/deep/ .ant-radio-button-wrapper:not(:first-child)::before {
  color: #fff;
  background-color: #fff !important;
  opacity: 1;
}
/deep/
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within {
  outline: unset;
}
/deep/
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):first-child {
  border: none;
}
/deep/ .ant-radio-button-wrapper:last-child {
  border: none;
}
</style>

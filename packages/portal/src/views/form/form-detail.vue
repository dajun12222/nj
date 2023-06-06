<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="form-detail">
    <form-detail-header-open-in-list
      :formObj="formObj"
      :nodes="nodes"
      :workflowInstanceId="workflowInstanceId" 
    :itemId="formObj.workItemId"
    @flowTrack="flowTrack"
      @action="onAction"
      @nodesSwitch="nodesSwitch"
    >
      <template slot="h4">
        <template v-if="isWorkflowForm">
          <h4 v-if="isNew">
	  {{ $t('languages.common.formTitle.createWorkflow')
	  }}{{ formObj.bizSchema.name ? '-' + formObj.bizSchema.name : '' }}
	  </h4>
          <h4 v-else-if="isDraft">
	  {{ $t('languages.common.formTitle.editWorkflow')
	  }}{{ formObj.bizSchema.name ? '-' + formObj.bizSchema.name : '' }}
	  </h4>
          <h4 v-else>
	  {{ $t('languages.common.formTitle.viewWorkflow')
	  }}{{ formObj.bizSchema.name ? '-' + formObj.bizSchema.name : '' }}
	  </h4>
        </template>
        <template v-else>
          <h4 v-if="isNew">
            {{ $t('languages.common.formTitle.createForm')
            }}{{
              formObj.bizSheet &&
              formObj.bizSheet.name_i18n &&
              JSON.parse(formObj.bizSheet.name_i18n)[$i18n.locale]
                ? '-' + JSON.parse(formObj.bizSheet.name_i18n)[$i18n.locale]
                : formObj.bizSheet && formObj.bizSheet.name
                ? '-' + formObj.bizSheet.name
                : ''
            }}
          </h4>
          <h4 v-else-if="isDraft">
            {{ $t('languages.common.formTitle.editForm')
            }}{{
              formObj.bizSheet &&
              formObj.bizSheet.name_i18n &&
              JSON.parse(formObj.bizSheet.name_i18n)[$i18n.locale]
                ? '-' + JSON.parse(formObj.bizSheet.name_i18n)[$i18n.locale]
                : formObj.bizSheet && formObj.bizSheet.name
                ? '-' + formObj.bizSheet.name
                : ''
            }}
          </h4>
          <h4 v-else>
            {{ $t('languages.common.formTitle.viewForm')
            }}{{
              formObj.bizSheet &&
              formObj.bizSheet.name_i18n &&
              JSON.parse(formObj.bizSheet.name_i18n)[$i18n.locale]
                ? '-' + JSON.parse(formObj.bizSheet.name_i18n)[$i18n.locale]
                : formObj.bizSheet && formObj.bizSheet.name
                ? '-' + formObj.bizSheet.name
                : ''
            }}
          </h4>
        </template>
      </template>
      <!-- <form-actions
        :actions="actions"
        @action="onAction"
        :toShowPrints="isShow"
        :setPdfConf="pdfAble"
        @propPrintClick="getChildPrintClick"
      ></form-actions> -->
    </form-detail-header-open-in-list>

    <div class="form-body" @scroll="onBodyScroll" @click="isShow = false">
      <div class="form-wrap">
        <div class="form-d-box">
          <!-- <workflow-info
            :id="workflowInstanceId"
            v-if="workflowInstanceId"
            :itemId="formObj.workItemId"
            :curNode="formObj.activityCode"
            @setFinishTime="setFinishTime"
            @flowTrack="flowTrack"
          /> -->
          <!--渲染控件-->
          <pc-form-renderer
            ref="formRenderer"
            :class="{ 'has-form-border': borderMode }"
            :controls="controls"
            :relevanceDataList="dataModalList"
            :formPermission="formObj.formPermission"
            :formControls="formControls"
            :dataItems="dataItems"
            sourceType="portal"
            @sheetColumnResize="onSheetColumnResize"
            @updateLatestSignature="updateLatestSignature"
          />
          

          <form-action-modal ref="actionModal" @ok="onOk" />

          <!-- 历史留痕弹窗 -->
          <!-- <form-marking ref="FormMarking" :isDetail="true"></form-marking> -->
        </div>
      </div>
      <div v-show="showBacktop" class="back-top" @click="backTop">
        <a-icon type="up" />
      </div>

      <template
        v-if="
          (isSsubmited && isLoadComment) ||
          (workflowInstanceId && !isExternal) ||
          showTrack
        "
      >
        <div class="sidebar" style="position: relative">
          <div class="retract" @click="toggleComment">
            <span v-if="isShowComment" class="icon aufontAll open-close">&#xe88f;</span>
            <span v-else class="icon aufontAll open-close">&#xe889;</span>
          </div>
          <div v-show="isShowComment" class="comment-box">
            <Tabs v-model="activeKey" class="tabs">
              <TabPane
                v-if="workflowInstanceId && !isExternal"
                key="1"
                :tab="$t('languages.common.approval')"
                class="tabpane"
              >
                <Approval
                  :workflowInstanceId="workflowInstanceId"
                  :completed="completed"
                  :canceled="canceled"
                  :finishTime="finishTime"
                  :getFileUrlFn="getFileUrlFn"
                  @download="onDownload"
                />
              </TabPane>
              <TabPane
                v-if="isSsubmited && isLoadComment"
                key="2"
                :tab="$t('languages.common.form.Comment')"
                class="tabpane"
              >
                <pc-comment :collspanForPc="isShowComment" :formObj="formObj" />
              </TabPane>
              <TabPane
                v-if="showTrack"
                key="3"
                :tab="$t('languages.common.form.FormTrack')"
                class="tabpane"
              >
                <form-marking
                  v-if="activeKey === '3'"
                  ref="formMarking"
                  :collspanForPc="isShowComment"
                  :isDetail="true"
                />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </template>
    </div>

    <a-alert
      v-if="comment"
      :message="comment"
      type="info"
      banner
      closable
      class="alert-info"
      :style="{ left: isShowComment ? '35%' : '50%' }"
    />

    <a-alert
      v-if="showAlertWarn"
      class="alert-warning"
      :message="$t('languages.common.form.invalidForm')"
      type="warning"
      showIcon
      closable
    />

    <iframe id="pdfFrame" class="pdf-frame" :srcdoc="srcdoc"></iframe>
    <template v-if="isPrintGenerateHtml">
      <GenerateHtml
        ref="printRenderer"
        :pages="[draftAttributesJson]"
        :formdata="formdata"
      />
    </template>

    <template v-for="tempPrintEle of tempPrintEleArray">
      <TempPrintHtml
        :key="tempPrintEle.key"
        :printEle="tempPrintEle.tempPrintEle"
        :pageSettings="tempPrintPageSettings"
        @calcResult="collectorTempPrintInfo"
      />
    </template>

    <form-detail-footer
      :style="{ width: isShowComment ? 'calc(100% - 401px)' : '100%' }"
      :formObj="formObj"
      :nodes="nodes"
      @nodesSwitch="nodesSwitch"
    >
      <template v-if="isNew && !isDraft" slot="isSaveData">
        <a-checkbox
          :checked="isSaveAndCreate"
          @change="(e) => (isSaveAndCreate = e.target.checked)"
        >
          {{ $t('languages.common.form.cacheFormData') }}
        </a-checkbox>
      </template>
      <form-actions
        :actions="actionsDeal"
        :toShowPrints="isShow"
        :setPdfConf="pdfAble"
        :isShowSubmitAndCreateBtn="isNew && !isDraft"
        :printTemplates="printTemplates"
        @action="onAction"
        @propPrintClick="getChildPrintClick"
        @submitAndCreate="submitAndCreate"
      />
    </form-detail-footer>

    <!-- 自定义按钮查看列表弹框 -->
    <a-modal
      :visible="visibleOpen"
      width="1200px"
      title="查看列表"
      :footer="null"
      :centered="true"
      :destroyOnClose="true"
      @cancel="onCloseInfoModal"
    >
      <custom-button-modal
        :schemaCode="customButtomModalCode"
        :viewCode="viewCodeCustom"
      />
    </a-modal>
  </div>
</template>

<script src="./form-detail.ts"></script>

<!--自定义弹出框背景样式-->
<style lang="less">
@import '~styles/themes/pub_ui_change.less';

.ant-modal-mask {
  background: rgba(0, 0, 0, 0.3968);
}
.pdf-frame-div {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 233;
  background-color: #000;
  opacity: 0.6;
}
// .pdf-frame {
//   position: absolute;
//   left: 25%;
//   top: 0;
//   z-index: 2333;
//   width: 50%;
//   height: 100%;
//}
.pdf-frame {
  position: fixed;
  left: 250%;
  top: 0;
  z-index: 2333;
  width: 50%;
  height: 100%;
}
.close-previewPdf {
  width: 32px;
  position: relative;
  z-index: 2333;
  left: 75.5%;
  bottom: 96%;
  color: #606165;
  font-size: 32px;
  background: #ccc;
  border-radius: 50%;
  &:hover {
    color: #000;
    cursor: pointer;
    transition: all 0.3s;
  }
}
</style>
<style lang="less" scoped>
@import '../../styles/themes/default.less';
// @import "../../components/apps/form/style";
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
/deep/.ant-tabs {
  padding-left: 0.5em;
}
/deep/.ant-tabs-nav .ant-tabs-tab {
  margin: 0px 30px 0px 16px;
  padding: 12px 0px;
}
.form-detail {
  min-width: 1100px;
}
.textarea {
  display: flex;
  align-items: center;
}

.form-box {
  display: flex;
}

.comment-box {
  width: 401px;
  min-width: 401px;
  height: 100%;
  background: #f1f2f6;
  padding: 2px 0 16px 12px;
  box-sizing: border-box;
  position: relative;
  border-left: 1px solid #dddddd;
  & > .tabs {
    height: 100%;
    padding-left: 4px;
    & /deep/.ant-tabs-bar {
      margin-right: 17px;
    }
    & /deep/.ant-tabs-tab {
      font-size: 14px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #111218;
      line-height: 20px;
      margin-left: 0;
      &:hover {
        color: @highlightColor;
      }
    }
    &/deep/.ant-tabs-tab-active {
      &:hover {
        color: #111218;
      }
    }
    & /deep/.ant-tabs-top-content.ant-tabs-content-animated {
      height: calc(100% - 63px);
    }
  }
}

.form-body {
  display: flex;
  flex-grow: 1;
  height: calc(100% - 64px);
  position: relative;
  min-width: 924px;
  transition: all ease 0.5s;
  background-color: #fff;
}

.retract {
  position: absolute;
  left: -17px;
  top: calc(50% - 29px);
  transition: all ease 0.1s;
  cursor: pointer;
  width: 18px;
  height: 58px;
  background: #f1f2f6;
  border: 1px solid #dddddd;
  border-right: 0px solid;
  font-size: 12px;
  color: #b6bcc6;
  padding: 19px 2px;
  z-index: 999;
  border-radius: 2px;
  & .open-close {
    font-size: 12px;
  }
}

@media print {
  .form-body {
    display: block;
    overflow: unset !important;
  }
  .footer {
    display: none;
  }
  .sidebar {
    .comment-box {
      width: 100%;
    }
  }
}
.report .vue-grid-layout {
  height: auto !important;
}
// /deep/.ant-tabs-content{
//   min-height: 500px;
//}
.form-wrap {
  position: relative;
  overflow: scroll;
  flex-grow: 1;
  padding: 20px 0 100px 0;
  & > div.form-d-box {
    min-width: 800px;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 23px 0 25px;
    /deep/.ant-row-flex {
      margin: 0 -16px;
      &.system-info-box {
        margin-bottom: 14px;
      }
      .ant-col-6,
      .ant-col-8,
      .ant-col-12,
      .ant-col-16,
      .ant-col-18,
      .ant-col-24 {
        padding: 0 16px;
      }
    }
    /deep/.has-form-border {
      & > .ant-row-flex {
        .spanFillUp {
          &::before {
            position: absolute;
            left: 0;
            bottom: 0;
            content: '';
            width: 100%;
            border-top: 1px solid #d9d9d9;
            z-index: 1;
          }
        }
      }
      .ant-row-flex {
        margin: unset;
        &.system-info-box {
          margin-bottom: 0;
        }
        .ant-tabs-tabpane {
          .spanFillUp {
            &::before {
              position: absolute;
              left: 0;
              bottom: 0;
              content: '';
              width: 100%;
              border-top: 1px solid #d9d9d9;
              z-index: 1;
            }
          }
        }
        .ant-col-6,
        .ant-col-8,
        .ant-col-12,
        .ant-col-16,
        .ant-col-18,
        .ant-col-24 {
          padding: unset;
        }
      }
    }
    /deep/.form-title {
      padding-right: 0;
      padding-left: 0;
    }
  }
  .approval-record {
    background: #fff;
  }
  .approval-record-header {
    /deep/.ant-collapse-header {
      width: 100%;
      padding: 10px !important;
      color: rgba(0, 0, 0, 0.65);
      &:hover {
        background: #eef3ff;
      }
      .ant-collapse-arrow {
        left: 88px !important;
        color: rgba(0, 0, 0, 0.45);
        font-weight: normal;
      }
    }
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.back-top {
  cursor: pointer;
  position: fixed;
  display: inline-flex;
  right: 40px;
  bottom: 40px;
  width: 40px;
  height: 40px;
  background: @light-color-3;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  font-size: @font-size-18;
  justify-content: center;
  align-items: center;
}

/deep/.ant-alert.alert-info {
  position: absolute;
  top: 74px;
  left: 50%;
  width: 616px;
  min-height: 40px;
  background-color: #f0f7ff;
  color: rgba(0, 0, 0, 0.65);
  border-radius: 4px;
  border: 1px solid rgba(41, 112, 255, 0.5);
  transform: translateX(-50%);

  & > i {
    top: 12px;
  }
}

/deep/.ant-alert-message {
  // overflow: hidden;
  // white-space: nowrap;
  // text-overflow: ellipsis;
  word-break: break-all;
  display: block;
  margin-right: 1em;
}

/deep/.ant-alert.alert-warning {
  position: absolute;
  top: 74px;
  left: calc(50% - 308px);
  width: 616px;
  height: 40px;
  border-radius: 4px;
}

/deep/.field__label {
  min-width: 102px;
  max-width: 102px;
  width: 102px;
  display: flex;
  // align-items: center;
}

/deep/.ant-row-flex {
  .field.system .field__control {
    padding-left: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  .field.system {
    padding-left: 0;
    padding-right: 0;
    align-items: center;
    .field__label {
      flex-grow: 1;
      // max-width: none;
      margin-right: 0;
      // margin-left: 8px;
      margin-left: 0;
    }
  }

  & > .ant-col:first-child > .field.system {
    .field__label {
      min-width: 1em;
      width: auto;
      margin-right: 0;
      justify-content: flex-start;
      flex-grow: 0 !important;
    }
  }

  // & > .ant-col:last-child > .field.system {
  //   .field__label {
  //     flex-grow: 1;
  //     margin-right: 0;
  //     max-width: none;
  //  }

  //   .field__control {
  //     flex-grow: 0;
  //     flex-shrink: 0;
  //     justify-content: flex-end;
  //  }
  //}
}
</style>

<style lang="less">
.form-forward {
  .field__label {
    min-width: 126px;
    max-width: 126px;
    width: 126px;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="operation">
    <!-- 基本操作 -->
    <property-widget label="基本操作">
      <template>
        <div slot="right" class="check-wrap">
          <div
            v-for="(i, index) in baseOperation"
            :key="index"
            :class="{
              'check-item': true,
              mages: !(
                (i.code !== 'agree' && i.code !== 'rejects') ||
                ((i.code === 'agree' || i.code === 'rejects') && isRejectNode)
              ),
              'full-width': i.code === 'batchOperate',
            }"
          >
            <template
              v-if="
                (i.code !== 'agree' && i.code !== 'rejects') ||
                ((i.code === 'agree' || i.code === 'rejects') && isRejectNode)
              "
            >
              <div class="check-item-div">
                <div>
                  <a-checkbox
                    v-model="i.selected"
                    class="checkbox"
                    :disabled="i.disabled"
                    @change="onSelectChange"
                  />
                  <span> {{ i.displayName ? i.displayName : i.text }}</span>
                  <span v-if="i.displayName" class="checkboxDisplayName">原名: {{ i.text }}</span>
                  <a-tooltip v-if="i.code === 'batchOperate'" placement="top">
                    <template slot="title">批量处理不进行表单校验，请谨慎勾选；批量处理不包含参与者自由选择审批人活动节点</template>
                    <em
                      class="icon aufontAll h-icon-all-question-circle batch-operate-tooltip"
                    ></em>
                  </a-tooltip>
                </div>
                <a-tooltip
                  v-if="i.code === 'agree' || i.code === 'rejects'"
                  placement="bottomRight"
                >
                  <template #title>
                    <span>审批意见配置</span>
                  </template>
                  <a-icon
                    type="setting"
                    class="check-item-icon"
                    @click="approvalOpen(i.code)"
                  />
                </a-tooltip>
              </div>
              <div
                v-if="i.code === 'agree' || i.code === 'rejects'"
                class="check-item-divInfo"
              >
                <div class="divInfoList">
                  <p class="divInfoListL">文本意见</p>
                  <p class="divInfoListR">
                    <span
                      v-if="i.commentPermission && i.commentPermission.visible"
                      >可见</span>
                    <span v-else>不可见</span>
                    <span
                      v-if="i.commentPermission && i.commentPermission.required"
                      class="divInfoListRb"
                      >必填</span>
                  </p>
                </div>
                <div class="divInfoList">
                  <p class="divInfoListL">附件</p>
                  <p class="divInfoListR">
                    <span
                      v-if="
                        i.attachmentPermission && i.attachmentPermission.visible
                      "
                      >可见</span>
                    <span v-else>不可见</span>
                    <span
                      v-if="
                        i.attachmentPermission &&
                        i.attachmentPermission.required
                      "
                      class="divInfoListRb"
                      >必填</span>
                  </p>
                </div>
                <div class="divInfoList">
                  <p class="divInfoListL">手写签名</p>
                  <p class="divInfoListR">
                    <span v-if="i.signPermission && i.signPermission.visible">可见</span>
                    <span v-else>不可见</span>
                    <span
                      v-if="i.signPermission && i.signPermission.required"
                      class="divInfoListRb"
                      >必填</span>
                  </p>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div slot="title-right">
          <p class="check-wrap-name" @click="openName">自定义按钮名称</p>
        </div>
      </template>
    </property-widget>
    <!-- 驳回操作 -->
    <property-widget v-if="isRejectNode" label="驳回操作">
      <template>
        <div slot="right" class="check-wrap">
          <div
            v-for="(item, index) in permittedOperation"
            :key="index"
            class="check-item"
            style="width: 50%"
          >
            <a-checkbox
              v-model="item.selected"
              class="checkbox"
              @change="onSelectChange"
            />
            <span
              :class="item.code !== 'rejectToFixded' ? 'text' : ''"
              :title="item.text"
              >{{ item.text }}</span>
          </div>
        </div>
      </template>
    </property-widget>
    <!-- 选择指定活动 -->
    <property-widget v-show="isReject" label="选择指定活动">
      <template>
        <div slot="right" class="check-wrap">
          <a-select
            v-model="rejectToActivityCode"
            placeholder="请选择"
            mode="multiple"
            class="input-select"
            @change="rejectToActivityChange"
          >
            <a-select-option
              v-for="(select, index) in rejectList"
              :key="index"
              :value="select.activityCode"
            >
              {{ select.activityName }}
            </a-select-option>
            <div slot="notFoundContent" class="select-empty-content">
              暂无数据
            </div>
          </a-select>
        </div>
      </template>
    </property-widget>
    <!-- 协办操作 -->
    <!--<property-widget-->
    <!--label="协办操作"-->
    <!--:tip="assistTip"-->
    <!--&gt;-->
    <!--<template>-->
    <!--<div slot="right" class="check-wrap">-->
    <!--<div-->
    <!--v-for="(a,index) in assistOperation"-->
    <!--:key="index"-->
    <!--class="check-item"-->
    <!--&gt;-->
    <!--<a-checkbox-->
    <!--v-model="a.selected"-->
    <!--class="checkbox"-->
    <!--@change="onSelectChange"-->
    <!--&gt;</a-checkbox>-->
    <!--<span>{{ a.text }}</span>-->
    <!--</div>-->
    <!--</div>-->
    <!--</template>-->
    <!--</property-widget>-->
    <a-modal
      :visible="visibleOpenName"
      width="639px"
      title="自定义按钮名称"
      :centered="true"
      dialogClass="setNameModal"
      :destroyOnClose="true"
      okText="保存"
      @cancel="onCloseInfoModal"
      @ok="setNameOk"
    >
      <set-name-modal
        ref="setNameModals"
        :showBtn="isRejectNode"
        :btnConfigList="btnConfigList"
      />
    </a-modal>
    <a-modal
      :visible="visibleOpenApproval"
      width="473px"
      :title="approvalName"
      :centered="true"
      :destroyOnClose="true"
      okText="保存"
      @cancel="onCloseInfoModal"
      @ok="setApprovalOk"
    >
      <set-approval-modal
        ref="setApprovalModals"
        :approvalData="approvalData"
      />
    </a-modal>
  </div>
</template>

<script lang="ts">
import AF from '@/utils/rejectActivity/af';
import Graph from '@/utils/rejectActivity/graph';
import { Select, Checkbox, Tooltip, Icon, Modal } from '@h3/antd-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import PropertyWidget from '../base/propertyWidget.vue';
import SetNameModal from './setNameModal.vue';
import SetApprovalModal from './setApprovalModal.vue';

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'Operation',
  components: {
    PropertyWidget,
    SetNameModal,
    SetApprovalModal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    ACheckbox: Checkbox,
    ATooltip: Tooltip,
    AIcon: Icon,
    AModal: Modal,
  },
})
export default class Operation extends Vue {
  @WorkflowModule.State('activities') activities: any;

  @WorkflowModule.State('lines') lines: any;

  @WorkflowModule.State((state) => state.selectedActivities[0] || {})
  currentActivity: any;

  @WorkflowModule.State('curActivityProps') curActivityProps: any;

  @WorkflowModule.Mutation('setPropValue') setPropValue: any;

  isReject: boolean = false;

  // 基本操作默认数据
  baseOperation: any[] = [
    {
      text: '同意',
      displayName: '',
      code: 'agree',
      selected: true,
      disabled: true,
    },
    {
      text: '驳回',
      displayName: '',
      code: 'rejects',
      selected: false,
      disabled: true,
    },
    {
      text: '转办',
      displayName: '',
      code: 'forward',
      selected: false,
    },
    {
      text: '撤回',
      displayName: '',
      code: 'retrieve',
      selected: false,
    },
    {
      text: '协办',
      displayName: '',
      code: 'assist',
      selected: false,
    },
    {
      text: '传阅',
      displayName: '',
      code: 'circulate',
      selected: false,
    },
    {
      text: '加签',
      displayName: '',
      code: 'adjustParticipant',
      selected: false,
    },
    {
      text: '结束流程',
      displayName: '',
      code: 'finishInstance',
      selected: false,
    },
    {
      text: '批量处理',
      displayName: '',
      code: 'batchOperate',
      selected: false,
    },
  ];

  // 驳回操作默认数据
  permittedOperation: any = [
    {
      text: '驳回到开始',
      code: 'rejectToStart',
      selected: false,
    },
    {
      text: '驳回到上一步',
      code: 'reject',
      selected: false,
    },
    {
      text: '驳回到指定活动',
      code: 'rejectToFixded',
      selected: false,
    },
  ];

  // 协办操作默认数据
  // assistTip:string = `1.协办：允许用户在处理待办时请求他人协办，被协办的人会收到待办，拥有与处理人同样的编辑表单的权限
  // 2.传阅：允许用户收到待办后将表单信息传阅给其他人`;
  // assistOperation:any = [{
  //   text: '协办',
  //   code: 'assist',
  //   selected: false
  // }, {
  //   text: '传阅',
  //   code: 'circulate',
  //   selected: false
  // }];

  // assistTip:string = ``;
  // assistOperation:any = [];
  // 驳回到指定活动数据
  rejectList: any = [];

  // 驳回至指定活动code
  rejectToActivityCode: any = [];

  isRejectNode: boolean = true;

  visibleOpenName: boolean = false;

  visibleOpenApproval: boolean = false;

  //自定义按钮名称弹框数据
  btnConfigList: any[] = [];

  //审批意见配置弹框数据
  approvalData: any = [];

  approvalName: string = '';

  beforeMount() {
    this.dataMounted();
  }

  @Watch('permittedOperation', { deep: true })
  permittedOperationChange() {
    let selected: boolean = false;
    for (const con of this.permittedOperation) {
      if (con.selected) {
        selected = true;
      }
    }
    for (const cons of this.baseOperation) {
      if (cons.code === 'rejects') {
        cons.selected = selected;
      }
    }
  }

  // 操作权限select改变
  onSelectChange() {
    const allArray = [...this.baseOperation, ...this.permittedOperation];
    if (Object.keys(this.curActivityProps.operation).length) {
      allArray.forEach((item: any) => {
        Object.keys(this.curActivityProps.operation).forEach((op: any) => {
          if (op === item.code) {
            this.curActivityProps.operation[op] = item.selected;
            if (op === 'rejectToFixded' && item.selected) {
              this.isReject = true;
              const start: number = 0; // 开始节点序号
              let end = -1;
              for (let i = 0, len = this.activities.length; i < len; i += 1) {
                if (this.activities[i].ID === this.currentActivity.ID) {
                  end = i;
                  break;
                }
              }
              // const end: number = this.activities.findIndex((activity:any) => {
              //   return activity.ID === this.currentActivity.ID;
              // }); // 当前节点序号
              if (end !== -1) {
                const graph: Graph = new Graph(this.activities, this.lines);
                const af = new AF(graph, start, end);
                const res = af.getResult();
                const rejectArr = res.filter(
                  (activityCode: string) =>
                    activityCode !== this.currentActivity.activityCode,
                );
                this.rejectList = this.activities.filter(
                  (a: any) =>
                    rejectArr.includes(a.activityCode) &&
                    a.ID !== this.currentActivity.ID &&
                    ((a.activityType === 'SUB_INSTANCE' && a.sync) ||
                      a.activityType === 'PARTICIPANT'),
                );
              }
              if (
                !this.curActivityProps.operation.rejectToActivityCode &&
                this.rejectList.length
              ) {
                this.setPropValue({
                  key: 'operation.rejectToActivityCode',
                  value: this.rejectList[0].activityCode,
                });
              }
              if (this.curActivityProps.operation.rejectToActivityCode) {
                const rejectCodeArr: string[] =
                  this.curActivityProps.operation.rejectToActivityCode.split(
                    ',',
                  );
                // 先判断rejectCode是否在rejectList中， 如不存在删除
                this.rejectToActivityCode = rejectCodeArr.filter(
                  (code: string) => {
                    const index: number = this.rejectList.findIndex(
                      (item: any) => item.activityCode === code,
                    );
                    return index > -1;
                  },
                );
              }
            } else if (op === 'rejectToFixded' && !item.selected) {
              this.isReject = false;
            } else {
              //Else Empty block statement
            }
          }
        });
      });
    }
  }

  // 驳回至指定节点change
  rejectToActivityChange(v: any) {
    const str = v.join(',');
    this.setPropValue({ key: 'operation.rejectToActivityCode', value: str });
  }

  // 根据数据初始化视图
  dataMounted() {
    let activityCode = '';
    this.lines.forEach((i: any) => {
      if (i.startActivity && i.startActivity.activityCode === 'Activity1') {
        activityCode = i.endActivity && i.endActivity.activityCode;
      }
    });
    this.isRejectNode = true;
    if (this.currentActivity.activityCode === activityCode) {
      this.isRejectNode = false;
    }
    if (Object.keys(this.curActivityProps.operation).length) {
      const operationArray = Object.entries(this.curActivityProps.operation);
      operationArray.forEach((a: any) => {
        if (!a && !a[0] && !a[1]) {
          return;
        }
        const [key, value] = a;
        this.baseOperation.forEach((base: any) => {
          if (base.code === key) {
            base.selected = value;
          }
        });
        this.permittedOperation.forEach((base: any) => {
          if (base.code === key) {
            base.selected = value;
          }
        });
        // this.assistOperation.forEach((base: any) => {
        //   if (base.code === key) {
        //     base.selected = value;
        //   }
        // });
      });
      this.rejectToActivityCode = [];
      this.onSelectChange();
    }

    if (this.curActivityProps.btnConfigList) {
      this.btnConfigList = this.curActivityProps.btnConfigList;
      this.updateBtn();
      this.updateBaseOperation();
    }
  }

  //更新按钮名称
  updateBtn() {
    for (const con of this.baseOperation) {
      for (const x of this.btnConfigList) {
        if (con.code === x.code) {
          con.displayName = x.displayName;
        }
      }
    }
  }

  //更新审批意见等可见、必填状态
  updateBaseOperation() {
    for (const con of this.baseOperation) {
      if (con.code === 'agree' || con.code === 'rejects') {
        for (const x of this.btnConfigList) {
          if (con.code === x.code) {
            con.commentPermission = x.commentPermission;
            con.attachmentPermission = x.attachmentPermission;
            con.signPermission = x.signPermission;
          }
        }
      }
    }
  }

  //自定义按钮名称弹框点击确定按钮
  setNameOk() {
    try {
      this.btnConfigList = (this.$refs.setNameModals as any).btnConfigList;
      this.setPropValue({
        key: 'btnConfigList',
        value: this.btnConfigList,
      });
      this.visibleOpenName = false;
      this.updateBtn();
      this.$message.success('保存成功');
    } catch (err) {
      this.$message.error('保存失败');
    }
  }

  //审批意见配置弹框点击确认触发
  setApprovalOk() {
    try {
      this.approvalData[0] = (this.$refs.setApprovalModals as any).approvalInfo;
      for (const con of this.btnConfigList) {
        if (con.code === this.approvalData[0].code) {
          con.commentPermission = this.approvalData[0].commentPermission;
          con.attachmentPermission = this.approvalData[0].attachmentPermission;
          con.signPermission = this.approvalData[0].signPermission;
        }
      }
      this.setPropValue({
        key: 'btnConfigList',
        value: this.btnConfigList,
      });
      this.visibleOpenApproval = false;
      this.updateBaseOperation();
      this.$message.success('保存成功');
    } catch (err) {
      this.$message.error('保存失败');
    }
  }

  //打开自定义按钮名称弹框
  openName() {
    this.visibleOpenName = true;
  }

  approvalOpen(code: string) {
    if (Array.isArray(this.btnConfigList)) {
      this.approvalData = this.btnConfigList.filter((x) => {
        return x.code === code;
      });
    }
    if (code === 'agree') {
      this.approvalName = '审批意见配置-同意';
    } else if (code === 'rejects') {
      this.approvalName = '审批意见配置-驳回';
    } else {
      //Else Empty block statement
    }
    this.visibleOpenApproval = true;
  }

  onCloseInfoModal() {
    this.visibleOpenName = false;
    this.visibleOpenApproval = false;
  }

  @Watch('currentActivity')
  onActivityChange(v: string) {
    this.dataMounted();
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.batch-operate-tooltip {
  font-size: 13px;
  margin-left: 5px;
  color: @s-light-font-color;
}
.operation {
  .check-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 100%;
    .check-item {
      width: 100%;
      font-size: 13px;
      margin: 5px 0px;
      line-height: 22px;
      .checkbox {
        font-size: 14px;
        margin-right: 6px;
      }
      .checkboxDisplayName {
        color: #88888b;
        font-size: 12px;
        margin-left: 13px;
      }
      .text {
        display: inline-block;
        vertical-align: middle;
        min-width: 42px;
        // width: calc(100% - 16px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .check-tips {
        color: rgba(17, 18, 24, 0.5);
        font-size: 12px;
        margin-left: 23px;
        min-width: 155px;
        width: calc(100% - 36px);
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .check-item-div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .check-item-icon {
          font-size: 15px;
          color: @nav-font-color;
        }
      }
      .check-item-divInfo {
        width: 100%;
        height: 96px;
        background: #f5f6f9;
        color: @nav-font-color;
        margin: 5px 0 12px 0;
        border-radius: 2px;
        .divInfoList {
          width: 100%;
          height: 32px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px 0 22px;
          .divInfoListR {
            color: #88888b;
            .divInfoListRb {
              margin-left: 11px;
            }
          }
        }
      }
    }
    .mages {
      margin: 0;
    }
    .full-width {
      width: 100%;
    }
    /deep/.input-select {
      width: 100%;
      border: none;
      /deep/.ant-select-selection {
        border: none;
        box-shadow: none;
      }
    }
    /deep/.ant-checkbox-disabled.ant-checkbox-checked
      .ant-checkbox-inner::after {
      border-color: #f5f5f5;
    }
    /deep/.ant-checkbox-disabled .ant-checkbox-inner {
      background-color: rgba(41, 112, 255, 0.3);
      border: none;
    }
  }
  .check-wrap-name {
    color: #2970ff;
    font-size: 12px;
    line-height: 22px;
    cursor: pointer;
  }
}
.select-empty-content {
  margin: 8px 0;
  text-align: center;
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    title="短信通知设置"
    width="420px"
    :visible="value"
    wrapClassName="notify-modal"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
    @ok="handleOk"
  >
    <div class="modal-wrapper">
      <div class="modal-list">
        <label>短信模板</label>
        <div>
          <a-select
            v-model="smsCode"
            class="input-select"
            style="width: 100%"
            :disabled="data.dataItemType === 1"
            placeholder="请选择"
            @change="smsCodeChange"
          >
            <a-select-option
              v-for="(item, index) in filterSmsTemplateList"
              :key="index"
              :value="item.code"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </div>
      </div>

      <div class="modal-list">
        <label>短信内容</label>
        <div>
          <a-input-textarea
            v-model="getSmsDisposalContent"
            class="input--textarea"
            :disabled="true"
          />
        </div>
      </div>
      <div class="modal-list">
        <label>参数对应数据项设置</label>
        <div class="prames-list">
          <div class="list-header">
            <div class="list-name">参数列表</div>
            <div class="list-info">数据项设置</div>
          </div>
          <div class="list-body">
            <div
              v-for="(item, index) in paramsList"
              :key="index"
              class="list-item"
            >
              <div :title="item.key" class="list-name">
                <span>{{ '${' + `${item.key}` + '}' }}</span>
                <a-tooltip
                  v-if="item.value"
                  placement="top"
                  overlayClassName="black-tooltip"
                >
                  <template slot="title">
                    {{ item.value }}
                  </template>
                  <i class="icon aufontAll h-icon-all-question-circle-o"></i>
                </a-tooltip>
              </div>
              <div class="list-info">
                <a-select
                  v-model="item.param"
                  class="input-select input-select-text"
                  :getPopupContainer="getPopupContainer"
                  :placeholder="$t('languages.PlaceHolder.Select')"
                  style="width: 100%"
                >
                  <a-select-opt-group>
                    <span slot="label" class="select-title">业务数据项</span>
                    <a-select-option v-for="i in bizSummaryList" :key="i.code">
                      {{ i.name }}
                    </a-select-option>
                  </a-select-opt-group>
                  <a-select-opt-group>
                    <span slot="label" class="select-title">系统数据项</span>
                    <a-select-option
                      v-for="i in defaultSummaryList"
                      :key="i.code"
                    >
                      {{ i.name }}
                    </a-select-option>
                  </a-select-opt-group>
                </a-select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import * as listApi from '@/apis/list/list.api';
import { Select, Modal, Input, Tooltip } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import OrgApi from '@/apis/organization';

const WorkflowModule = namespace('Apps/Workflow');

interface ToDoItem {
  belong: 'dingtalk' | 'email' | 'sms';
  dataItemType: 0 | 1 | 2;
  enable: boolean;
  smsCode: string | null;
  summary: Array<any> | '';
  title: Array<any> | '';
  type: number;
  isAuto?: boolean;
}

@Component({
  name: 'MessageNotify',
  components: {
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    AInputTextarea: Input.TextArea,
    ATooltip: Tooltip,
  },
})
export default class MessageNotify extends Vue {
  @WorkflowModule.State('WorkflowDataItem_origin') WorkflowDataItemOrigin: any;

  @Prop() value!: boolean;

  @Prop() data!: ToDoItem;

  get defaultSummaryList(): any[] {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => data.defaultProperty,
    );
  }

  get bizSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => !data.defaultProperty,
    );
  }

  get getSmsDisposalContent() {
    const currentTenplate = this.filterSmsTemplateList.find(
      (el: any) => el.code === this.smsCode,
    );
    return currentTenplate && currentTenplate.content;
  }

  smsCodeChange(value) {
    const item: any = this.smsTemplateList.find((el: any) => el.code === value);
    if (item) {
      this.paramsList = JSON.parse(item.params);
    } else {
      this.paramsList = [];
    }
  }

  filterSmsTemplateList: any[] = [];

  getFilterSmsTemplateList() {
    const res = this.smsTemplateList;
    let paramsList: any[];
    if (this.data.dataItemType === 1) {
      // 系统默认模板
      const res: any[] =
        this.smsTemplateList.filter((el) => el.type === '1') || [];
      this.smsCode = res[0] && res[0].code;
      paramsList = (res[0] && res[0].params && JSON.parse(res[0].params)) || [];
    } else {
      // 自定义
      let item: any = {};
      if (this.smsCode) {
        item =
          this.smsTemplateList.find((el) => el.code === this.smsCode) || {};
      }
      paramsList = (item && item.params && JSON.parse(item.params)) || [];
    }
    if (this.smsCode) {
      paramsList.forEach((el: any) => {
        const it = (this.data.summary as any[]).find(
          (ele: any) => ele.param === el.key,
        );
        if (it) {
          el.param = it.code;
        }
      });
    }

    this.paramsList = paramsList;
    this.filterSmsTemplateList = res;
  }

  smsTemplateList: any[] = []; // 短信通知模板

  paramsList: any[] = [];

  smsCode: string = '';

  // 获取短信模板
  async getEnableSmsTemplateList() {
    await OrgApi.getEnableSmsTemplateList({}).then((res: any) => {
      if (res.errcode === 0) {
        this.smsTemplateList = res.data;
      }
    });
    this.getFilterSmsTemplateList();
  }

  title: any = [];

  summary: any = '';

  isDataItem: boolean = false;

  lists: any = [];

  closeModal() {
    this.$emit('input', false);
  }

  handleOk() {
    const params: any = {
      smsCode: this.smsCode,
      summary: [],
    };

    const errList: any[] = [];
    this.paramsList.forEach((el: any) => {
      if (!el.param) {
        errList.push(el.key);
      }
      params.summary.push({
        isDataItem: 1,
        code: el.param,
        param: el.key,
      });
    });
    if (errList.length) {
      this.$message.warning(errList[0] + '参数未配置数据项');
      return;
    }
    this.$emit('ok', params);
    this.$emit('input', false);
  }

  /*
   * 获取查询列表的列表
   */
  getLists() {
    const { bizSchemaCode } = this.$route.params;
    listApi.getList(bizSchemaCode).then((res: any) => {
      if (res.data && Array.isArray(res.data)) {
        this.lists = res.data.filter((l: any) => l.publish);
      }
    });
  }

  mounted() {
    this.getLists();
  }

  @Watch('value')
  onValueChange(v: any) {
    this.summary = this.data.summary;
    this.smsCode = this.data.smsCode || undefined;
    if (v && this.smsTemplateList.length === 0) {
      this.getEnableSmsTemplateList();
    } else if (v) {
      this.getFilterSmsTemplateList();
    } else {
      //Else Empty block statement
    }
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.modal-wrapper {
  max-height: 400px;
  overflow-y: auto;
  .modal-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    label {
      display: block;
      font-size: 14px;
      color: @nav-font-color;
      margin-bottom: 6px;
      margin-top: 16px;
    }
    &:first-child {
      label {
        margin-top: 0;
      }
    }
  }
}

.prames-list {
  .list-header {
    line-height: 17px;
    font-size: 12px;
    display: flex;
    color: @nav-font-color;
    font-weight: 600;
  }
  .list-body {
    .list-item {
      height: 32px;
      line-height: 32px;
      display: flex;
      margin-top: 8px;
    }
  }
  .list-name {
    width: 88px;
    text-align: left;
    margin-right: 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: @nav-font-color;
    span {
      display: inline-block;
      width: 70px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .list-info {
    flex: 1;
    display: flex;
    align-items: center;
    i {
      margin-left: 6px;
    }
  }
}
.item-title {
  height: 22px;
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(17, 18, 24, 0.5);
  line-height: 22px;
  margin: 35px 0 12px 0;
}

.row-item {
  display: flex;
  width: 100%;
  em {
    line-height: 32px;
    margin-left: 8px;
    font-size: 14px;
    color: @nav-font-color;
    cursor: pointer;
  }
}
</style>

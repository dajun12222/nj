<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    title="自定义通知"
    width="420px"
    :visible="value"
    cancelText="取消"
    okText="确定"
    :maskClosable="false"
    wrapClassName="notify-modal"
    @cancel="closeModal"
    @ok="handleOk"
  >
    <div class="message-notify">
      <div class="message-notify__item">
        <dataTitleWrap
          :key="key + '1'"
          :list="WorkflowDataItemOrigin"
          :value="title"
          label="标题"
          @change="(val) => (title = val)"
        />
      </div>

      <div class="message-notify__item">
        <div v-if="typeStatus !== 'email'" class="label">
          {{ titleContent ? titleContent.emailContent : '消息内容' }}
        </div>

        <div class="select-type">
          <template v-if="typeStatus === 'email'">
            <dataTitleWrap
              :key="key + '2'"
              :list="WorkflowDataItemOrigin"
              :value="summary"
              label="邮件内容"
              @change="(val) => (summary = val)"
            />
          </template>

          <template v-else>
            <a-radio-group
              v-model="isDataItem"
              class="radio-group"
              @change="summary = isDataItem ? undefined : []"
            >
              <a-radio :value="true"> 视图展示格式 </a-radio>
              <a-radio :value="false"> 自定义 </a-radio>
            </a-radio-group>
          </template>
        </div>
      </div>

      <div v-if="typeStatus !== 'email'" class="message-notify__item">
        <template v-if="isDataItem">
          <div class="label">内容</div>
          <a-select
            v-model="summary"
            class="input-select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            allowClear
          >
            <!-- 20191217 新需求 选择查询列表 -->
            <a-select-option v-for="i in lists" :key="i.id">
              {{ i.name }}
            </a-select-option>
          </a-select>
          <p>取对应列表移动端的展示字段作为消息内容</p>
        </template>

        <template v-else>
          <dataTitleWrap
            :key="key + '3'"
            :list="WorkflowDataItemOrigin"
            :value="summary"
            label="内容"
            @change="(val) => (summary = val)"
          />
        </template>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import * as listApi from '@/apis/list/list.api';
import { Select, Modal, Radio } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import dataTitleWrap from './dataTitleWrap.vue';

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
  summaryType?: boolean;
}

@Component({
  name: 'MessageNotify',
  components: {
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    dataTitleWrap,
  },
})
export default class MessageNotify extends Vue {
  @WorkflowModule.State('WorkflowDataItem_origin') WorkflowDataItemOrigin: any;

  @Prop() value!: boolean;

  @Prop() titleContent!: string;

  @Prop() typeStatus!: string;

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

  title: any = [];

  summary: any = '';

  isDataItem: boolean = false;

  lists: any = [];

  closeModal() {
    this.$emit('input', false);
  }

  handleOk() {
    setTimeout(() => {
      const { title, summary } = this;
      if (
        (title && title.length > 0 && (!summary || !summary.length)) ||
        (summary && summary.length > 0 && (!title || !title.length))
      ) {
        this.$message.warning('标题或内容不能为空');
        return;
      }
      this.$emit('ok', {
        title,
        summary,
      });
      this.$emit('input', false);
    }, 300);
  }

  /*
   * 获取查询列表的列表
   */
  getLists() {
    const { bizSchemaCode } = this.$route.params;
    listApi.getList(bizSchemaCode).then((res: any) => {
      if (res.data && Array.isArray(res.data)) {
        this.lists = res.data.filter((l: any) => l.publish);
        // this.setWorkflowListItem(this.lists);
      }
    });
  }

  mounted() {
    this.getLists();
  }

  key: number = +new Date();

  @Watch('value')
  onValueChange(v: any) {
    this.summary = this.data.summary;
    this.title = this.data.title;
    if (v) {
      this.key = +new Date();
      if (this.typeStatus === 'dingtalk') {
        this.isDataItem = this.data.summaryType;
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.message-notify {
  &__item {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
    p {
      font-size: 12px;
      margin-top: 4px;
      line-height: 22px;
      color: @light-font-color;
    }
    & .label {
      font-size: 14px;
      line-height: 22px;
      color: @nav-font-color;
      margin-bottom: 6px;
    }
    & .select-type {
      position: relative;
      .radio-group {
        margin-bottom: 8px;
      }
      .input-select {
        width: 100%;
        &.has-error {
          border-color: #f4454e !important;
          /deep/.ant-select-selection {
            border-color: #f4454e !important;
          }
        }
      }
    }
    .required {
      position: relative;
      &:before {
        content: '*';
        color: @error-color;
        position: absolute;
        left: -0.5em;
      }
    }
  }
  /deep/.ant-select-selection--multiple
    .ant-select-selection__rendered
    > ul
    > li {
    margin-bottom: 3px;
  }
}
</style>

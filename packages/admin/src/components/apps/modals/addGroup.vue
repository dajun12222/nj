<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="showModal"
    :title="tiltes"
    :width="420"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :keyboard="false"
    wrapClassName="new-modal-style"
    @ok="submitAddApp"
    @cancel="closeAddModal"
  >
    <a-form class="add-app__wrap" :autoFormCreate="FormCreate" hideRequiredMark>
      <a-form-item
        fieldDecoratorId="name"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.name"
        :colon="false"
      >
        <span slot="label">
          {{ $t('languages.Apps.GroupName') }}
          <em>*</em>
        </span>

        <a-input
          v-model.trim="params.name"
          class="add-app__input"
          maxlength="28"
          style="width: 100%"
          :placeholder="$t('languages.Apps.groupNamePlaceholder')"
        />
      </a-form-item>

      <a-form-item
        fieldDecoratorId="code"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.code"
        :colon="false"
      >
        <span slot="label">
          {{ $t('languages.Apps.groupCode') }}
          <em>*</em>
        </span>
        <a-input
          v-model="params.code"
          :disabled="isEdit"
          class="add-app__input"
          maxlength="28"
          style="width: 100%"
          :placeholder="$t('languages.Apps.groupCodePlaceholder')"
        />
      </a-form-item>

      <!-- 新版ui删除了选择初始应用 -->
      <!-- <a-form-item
        v-if="!isEdit"
        fieldDecoratorId="children"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :colon="false"
      >
        <span slot="label">
          {{ $t('languages.Apps.selectApp') }}
        </span>
        <a-tree-select
          v-model="params.children"
          :treeData="treeData"
          :maxTagCount="2"
          style="width: 100%;"
          dropdownClassName="orgsync-form-tree-select"
          class="orgsync-form-item"
          :getPopupContainer="getPopupContainer"
          :replaceFields="replaceFields"
          :placeholder="$t('languages.Apps.selectAppPlaceholder')"
          :treeCheckable="true"
          
          treeNodeFilterProp="title"
          @treeExpand="onTreeExpand"
        />
      </a-form-item> -->
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import AppsApi from '@/apis/apps';
import { pattern } from '@/common/utils';
import { Modal, Form, TreeSelect, Input } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
const AppCenterModule = namespace('Apps/AppCenter');
@Component({
  name: 'AddGroup',
  components: {
    AModal: Modal,
    AForm: Form,
    AFormItem: Form.Item,
    ATreeSelect: TreeSelect,
    AInput: Input,
  },
})
export default class AddGroup extends Vue {
  @Prop() value!: boolean;

  @Prop() groupItem!: object;

  @AppCenterModule.State('appGroupList') catalogues: any;

  showModal: boolean = false;

  confirmLoading: boolean = false;

  treeData: Array<any> = [];

  treeExpandedKeys: string[] = [];

  params: any = {
    name: '',
    code: '',
    children: [],
  };

  replaceFields: any = {
    children: 'children',
    title: 'name',
    key: 'key',
    value: 'id',
  };

  form: any = this.$form.createForm(this);

  formItemLayout: any = {
    labelCol: {
      span: 24,
    },
    wrapperCol: {
      span: 24,
    },
  };

  rules: any = {};

  get tiltes() {
    return this.groupItem.hasOwnProperty('name') &&
      this.groupItem['name'].length > 0
      ? this.$t('languages.Apps.EditAppGroup')
      : this.$t('languages.Apps.AddAppGroup');
  }

  get isEdit() {
    return this.groupItem.hasOwnProperty('name') &&
      this.groupItem['name'].length > 0
      ? true
      : false;
  }

  beforeMount() {
    this.setRules();
  }

  destroyed() {
    this.$emit('input', false);
    this.params = {
      name: '',
      code: '',
      children: [],
    };
    this.treeData = [];
    this.treeExpandedKeys = [];
    this.form.resetFields();
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  /**
   * 单击三角符展开树
   */
  onTreeExpand(expandedKeys: any) {
    this.treeExpandedKeys = expandedKeys;
  }

  setRules() {
    this.rules = {
      name: {
        rules: [
          {
            required: true,
            message: (this as any)
              .$t('languages.Apps.groupNamePlaceholder')
              .toString(),
          },
        ],
      },
      code: {
        rules: [
          {
            required: true,
            message: (this as any)
              .$t('languages.Apps.groupCodePlaceholder')
              .toString(),
          },
          {
            pattern: pattern('code'),
            message: (this as any).$t('languages.Apps.AppCodeRule').toString(),
            // '以字母开头不超过28个字符，仅支持字母、数字、下划线'
          },
        ],
      },
    };
  }

  FormCreate(form: any) {
    this.form = form;
  }

  closeAddModal() {
    this.$emit('input', false);
    this.params = {
      name: '',
      code: '',
      children: [],
    };
    this.treeData = [];
    this.treeExpandedKeys = [];
    this.form.resetFields();
  }

  submitAddApp() {
    // console.log(this.params, "after submit");
    /* 校验必填项和格式 */
    this.form.validateFields((err: any) => {
      if (!err) {
        this.confirmLoading = true;
        if (!this.isEdit) {
          // 新增
          if (this.params.children && this.params.children.length) {
            this.params.children = this.params.children.map((d: any) => {
              return {
                id: d,
              };
            });
          }

          AppsApi.AppgroupCreate(this.params)
            .then((res: any) => {
              this.confirmLoading = false;
              if (res.errcode !== 0) {
                return this.$message.error(res.errmsg);
              }
              this.$message.success('新建成功');
              this.$emit('submitGroupEvent');
              /* 关闭弹窗 */
              this.closeAddModal();
            })
            .catch((e: any) => {
              this.confirmLoading = false;
              console.log(e);
            });
        } else {
          // 重命名
          const params: any = {
            id: this.groupItem['id'],
            code: this.groupItem['code'],
            name: this.params.name,
          };
          AppsApi.AppgroupUpdate(params)
            .then((res: any) => {
              this.confirmLoading = false;
              if (res.errcode !== 0) {
                return this.$message.error(res.errmsg);
              }
              this.$message.success('修改成功');
              this.$emit('submitGroupEvent');
              /* 关闭弹窗 */
              this.closeAddModal();
            })
            .catch((e: any) => {
              this.confirmLoading = false;
              console.log(e);
            });
        }
      }
    });
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.showModal = v;
    this.$nextTick(() => {
      this.form.setFieldsValue({
        code: this.groupItem['code'],
        name: this.groupItem['name'],
      });
      this.params.name = this.groupItem['name'];
      if (!this.isEdit) {
        this.getTreeData();
      }
    });
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setRules();
  }

  // 获取应用数据
  getTreeData() {
    this.treeData = [];
    const params: any = {
      groupCode: this.$route.params.appCode,
      fromRecycle: false,
    };
    AppsApi.getAppgroupList(params)
      .then((res: any) => {
        if (res.errcode !== 0) {
          return this.$message.error(res.errmsg);
        }
        this.treeData = res.data.filter((d: any, index) => {
          if (d.children && d.children.length && d.code !== 'all') {
            d.children.forEach((v) => {
              v.key = v.id + '_' + index;
            });
            return d;
          }
        });
        // console.log(this.treeData,"this.treeData----------");
      })
      .catch((e: any) => {
        console.log(e);
      });
  }
}
</script>

<style lang="less">
@import '~@/styles/color/colors.less';

.orgsync-form-tree-select {
  max-width: 292px;

  &.ant-select-tree-dropdown {
    max-height: 35vh !important;
  }
  .ant-select-tree li span.ant-select-tree-checkbox {
    display: inline-block;
  }
  .ant-select-tree
    li
    span.ant-select-tree-checkbox
    + .ant-select-tree-node-content-wrapper {
    width: calc(100% - 46px);
  }
  .ant-select-tree
    > .ant-select-tree-treenode-checkbox-checked
    > .ant-select-tree-node-content-wrapper,
  .ant-select-tree-child-tree
    .ant-select-tree-treenode-checkbox-checked
    .ant-select-tree-node-content-wrapper {
    background: none !important;
    font-weight: normal;
  }

  .ant-select-tree-title {
    max-width: 90%;
    overflow: hidden;
    display: inline-block;
    vertical-align: middle;
    text-overflow: ellipsis;
  }

  .ant-select-tree-node-content-wrapper {
    background-color: #ffffff !important;
  }
  .ant-select-tree-node-content-wrapper:after {
    content: '';
    display: none !important;
  }
}
.orgsync-form-item {
  .ant-select-selection {
    max-height: 150px;
    overflow: hidden;
    overflow-y: auto;

    box-sizing: inherit;
    background-color: #fff;
    transition: none;
  }
}
</style>

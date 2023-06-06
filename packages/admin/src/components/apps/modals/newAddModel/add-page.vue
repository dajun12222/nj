<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="a-from">
    <a-row>
      <a-col :span="12">
        <div class="label-name">
          {{ $t('languages.Apps.ReportName') }}
          <em>*</em>
          <i18n-icon />
        </div>
        <div class="form-wrap">
          <form-input
            ref="form-input-name"
            :value="getItem('name').value"
            :rules="rules['name']"
            type="text"
            tipPosition="bottom"
            placeholder="请输入"
            class="define-page__input"
            @change="(val) => inputCHange('name', val)"
          />
        </div>
      </a-col>

      <a-col :span="12">
        <div class="label-name">
          {{ $t('languages.Apps.FormCode') }}
          <em>*</em>
        </div>
        <div class="form-wrap">
          <form-input
            ref="form-input-code"
            :value="getItem('code').value"
            :rules="rules['code']"
            type="text"
            tipPosition="bottom"
            placeholder="请输入"
            class="define-page__input"
            :disabled="isEdit"
            @change="(val) => inputCHange('code', val)"
          />
        </div>
      </a-col>
    </a-row>

    <a-row>
      <a-col :span="12">
        <div class="label-name">
          分组
          <em>*</em>
        </div>
        <div class="form-wrap" :class="{ 'has-error': groupEmpty }">
          <a-tree-select
            v-model="getItem('parentId').value"
            :treeData="tree"
            style="width: 100%"
            placeholder="请选择上级分组"
            @change="groupChange"
          />

          <p>请选择分组</p>
        </div>
      </a-col>

      <a-col :span="12">
        <div class="label-name">
          {{ $t('languages.Apps.OpenModel') }}
          <em>*</em>
        </div>
        <div class="form-wrap">
          <a-radio-group v-model="getItem('openMode').value" name="radioGroup">
            <a-radio
              v-for="(option, index) in getItem('openMode').options"
              :key="index"
              class="radio-row"
              :value="option.value"
            >
              {{ option.title }}
            </a-radio>
          </a-radio-group>
        </div>
      </a-col>
    </a-row>

    <a-row>
      <a-col :span="24">
        <div class="label-name">
          {{ $t('languages.Apps.PcAccessUrl') }}
        </div>

        <div class="form-wrap">
          <a-input
            v-model="getItem('pcUrl').value"
            :placeholder="'请输入'"
            class="define-page__input"
          />
        </div>
      </a-col>
    </a-row>

    <a-row>
      <a-col :span="24">
        <div class="label-name">
          {{ $t('languages.Apps.MobileAccessUrl') }}
        </div>

        <div class="form-wrap">
          <a-input
            v-model="getItem('mobileUrl').value"
            :placeholder="'请输入'"
            class="define-page__input"
          />
        </div>
      </a-col>
    </a-row>

    <a-row>
      <a-col :span="12">
        <div class="label-name">
          {{ $t('languages.Apps.Icon') }}
        </div>

        <div class="form-wrap">
          <div class="icon">
            <a-popover placement="bottom" overlayClassName="set-icon">
              <template slot="content">
                <div class="custom-icons">
                  <template v-for="item in iconsClassName">
                    <em
                      :key="item"
                      class="icon aufontAll"
                      :class="[
                        item,
                        getItem('icon').value === item ? 'active' : '',
                      ]"
                      @click="getItem('icon').value = item"
                    ></em>
                  </template>
                </div>
              </template>
              <div class="icon-wrapper page">
                <em class="icon aufontAll" :class="getItem('icon').value"></em>
              </div>
            </a-popover>
          </div>
        </div>
      </a-col>

      <a-col :span="12">
        <div class="label-name">
          {{ $t('languages.Apps.VisibleRange') }}
        </div>
        <div class="form-wrap">
          <a-checkbox-group
            v-model="getItem('visibleRange').value"
            class="checkbox-row"
          >
            <a-checkbox value="pc">
              {{ $t('languages.Apps.PcVisible') }}
            </a-checkbox>
            <a-checkbox value="mobile">
              {{ $t('languages.Apps.MobileVisible') }}
            </a-checkbox>
          </a-checkbox-group>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import appsApi from '@/apis/apps';
import { nameValidator } from '@/common/utils';
import FormInput from '@/components/global/form-input/index.vue';
import I18nIcon from '@/components/global/i18n-icon.vue';
import selectedIcon from '@/components/global/select-icon/index.vue';
import { LanguageTransform } from '@/utils';
import {
  Row,
  Col,
  Modal,
  Checkbox,
  Input,
  Radio,
  TreeSelect,
  Popover,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const MenuModule = namespace('Apps/AppItem');
@Component({
  name: 'add-define-page',
  components: {
    selectedIcon,
    FormInput,
    I18nIcon,
    ARow: Row,
    ACol: Col,
    AModal: Modal,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    AInput: Input,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ATreeSelect: TreeSelect,
    APopover: Popover,
  },
})
export default class AddDefinePage extends Vue {
  @MenuModule.Action('getAppItem') getAppItem: any;

  @MenuModule.State('floders') floders: any;

  @Prop() appCode!: string;

  @Prop() parentId?: string;

  @Prop({ default: '' }) code!: string;

  showModal: boolean = false;

  title: string = '';

  id: string = '';

  pageData: any = null;

  isEdit: boolean = false;

  layout: any = {
    left: 6,
    right: 22,
  };

  rules: any = {};

  setData: any[] = [];

  operationDate: any[] = [];

  getItem(code) {
    return this.operationDate.find((el) => el.code === code);
  }

  group = '';

  groupEmpty: boolean = false;

  groupChange(value) {
    this.groupEmpty = !value;
  }

  get tree() {
    // 不知道为啥replaceFields 无效
    return this.floders.map((item: any) => {
      if (item.children && item.children.length) {
        return this.convert(item, false);
      } else {
        return {
          value: item.id,
          key: item.id,
          title: item.name,
          children: null,
        };
      }
    });
  }

  convert(x: any, isLeaf: boolean) {
    let children = null;
    if (x.children) {
      children = x.children.map((c: any) => this.convert(c, !c.children));
    }
    return {
      value: x.id,
      key: x.id,
      title: x.name,
      children,
    };
  }

  iconsClassName: string[] = [];

  getIconNames() {
    const svgdom: any = document.body.querySelector('svg#icons');
    const content = svgdom.innerHTML;
    const ids = content.replace(
      /<symbol.+?id="(.+?)".+?>.+?<\/symbol>/g,
      '$1 ',
    );

    const customIcons: any[] = [
      'h-icon-all-disconnect',
      'h-icon-all-Report',
      'h-icon-all-yingyong',
    ];
    this.iconsClassName = [
      ...customIcons,
      ...ids.replace(/(^\s*)|(\s*$)/g, '').split(' '),
    ];
  }

  /**
   * 关闭弹窗
   */
  closeModal() {
    this.$emit('cancel', false);
    this.cleardata();
  }

  /**
   * 点击表单确定按钮
   */
  async formConfirm() {
    const params: any = {};
    this.operationDate.forEach((res: any) => {
      params[res.code] = res.value;
    });
    params.appCode = this.appCode;
    // params.parentId = this.parentId;
    params.id = this.id;
    params.pcAble = params.visibleRange.includes('pc');
    params.mobileAble = params.visibleRange.includes('mobile');
    delete params.visibleRange;

    // 处理多语言字段保存
    let name: string = '';
    let nameI18n: any = {};
    if (this.pageData && this.pageData.name_i18n) {
      try {
        nameI18n = JSON.parse(this.pageData.name_i18n);
      } catch {
        nameI18n = {};
      }
    }
    if (!(this.$i18n.locale && this.$i18n.locale === 'en')) {
      /* eslint-disable-next-line */
      name = params.name;
      if (!nameI18n.en) {
        nameI18n.en = name;
      }
    } else {
      name = (this.pageData && this.pageData.name) || params.name;
      nameI18n[this.$i18n.locale] = params.name;
    }

    params.name = name;
    params.name_i18n = JSON.stringify(nameI18n);

    if (!this.isEdit) {
      const res = await this.createPage(params);
      if (res === 'err') {
        throw Error;
      }
      this.$message.success('新建成功');
      setTimeout(() => {
        this.$emit('ok', params.code);
      }, 1000);
    } else {
      this.updatePage(params);
    }
  }

  /**
   * 提交新增自定义页面
   */
  async createPage(params: Apps.AppCenter.DefinePageParams) {
    if (this.validateForm()) {
      return 'err';
    }

    const res = await appsApi.createDefinePage(params);
    if (res.errcode === 0) {
      // this.$message.success('创建成功!');
      this.$emit('ok', this.operationDate[0].value);
      this.$emit('cancel', true);
      this.cleardata();
      // this.getAppItem({ appCode: this.appCode });
    } else {
      this.$message.error(res.errmsg);
      return 'err';
    }
  }

  /**
   * 提交更新自定义页面
   */
  updatePage(params: Apps.AppCenter.DefinePageParams) {
    if (this.validateForm()) {
      return;
    }
    const vm: any = this;
    appsApi.updateDefinePage(params).then((res: any) => {
      if (res.errcode === 0) {
        this.$message.success('更新成功!');
        vm.$emit('cancel', params);
        this.cleardata();
        this.getAppItem({ appCode: this.appCode });
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  /**
   * 重置数据
   */
  cleardata() {
    this.operationDate.forEach((res: any) => {
      res.value = '';
      if (res.code === 'openMode') {
        res.value = 'RECENT_PAGE_MODE';
      }
      if (res.code === 'icon') {
        res.value = 'h-icon-all-disconnect';
      }
      if (res.code === 'visibleRange') {
        res.value = ['pc', 'mobile'];
      }
    });
  }

  /**
   * 输入框变化时赋值
   */
  inputCHange(code: string, e: any) {
    const val = e.target.value as string;
    this.operationDate.find((res: any) => res.code === code).value = val;
  }

  /**
   * 获取后台数据
   */
  getDefinePage(code: string) {
    const vm: any = this;
    // const { code } = vm;
    const params = {
      code,
    };
    appsApi.getDefinePage(params).then((res: any) => {
      if (res.errcode === 0) {
        vm.pageData = res.data;
        vm.operationDate = JSON.parse(JSON.stringify(vm.setData));
        vm.operationDate.forEach((item: any, index: number) => {
          if (item.code === 'name') {
            item.value = this.getLangName(res.data);
          } else if (item.code === 'visibleRange') {
            let visibleRange = [''];
            if (res.data.pcAble === undefined || res.data.pcAble === null) {
              visibleRange = ['pc', 'mobile'];
            } else {
              visibleRange = [];
              if (res.data.pcAble) {
                visibleRange.push('pc');
              }
              if (res.data.mobileAble) {
                visibleRange.push('mobile');
              }
            }
            item.value = visibleRange;
          } else {
            item.value = res.data[item.code];
          }

          if (item.code === 'parentId') {
            item.value = this.parentId;
          }

          item.key = +new Date() + index;
        });
        vm.id = res.data.id;
        vm.isEdit = true;
      }
    });
  }

  /**
   * 获取当前语言对应的展示名
   */
  getLangName(item: any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }

  /**
   * 表单校验
   */
  validateForm() {
    let hasError: boolean = false;
    const list: any[] = [];
    Object.entries(this.$refs).forEach(([key, value]) => {
      if (value && /^form-input/.test(key)) {
        list.push(this.$refs[key]);
      }
    });

    list.forEach((node: any) => {
      if (Array.isArray(node)) {
        node.forEach((res: any) => {
          const unValidated: boolean = res.validateValue({
            target: { value: res.content },
          });
          if (unValidated) {
            hasError = true;
          }
        });
      } else {
        const unValidated: boolean = node.validateValue({
          target: { value: node.content },
        });
        if (unValidated) {
          hasError = true;
        }
      }
    });

    if (!this.getItem('parentId').value) {
      this.groupEmpty = true;
      hasError = true;
    }

    return hasError;
  }

  setRulesAndForm() {
    // 标题
    this.title = (
      this.code
        ? this.$t('languages.Apps.UpdateCustomPage')
        : this.$t('languages.Apps.CreateCustomPage')
    ) as string;
    // 表单规则
    this.rules = {
      name: [
        {
          required: true,
          message: this.$t('languages.Apps.FillInPageName'),
        },
        {
          validator: nameValidator,
          message: this.$t('languages.Apps.NameRule'),
        },
      ],
      code: [
        {
          required: true,
          message: this.$t('languages.Apps.FillInPageCode'),
        },
        {
          pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/,
          message: this.$t('languages.Apps.CodeRule'),
        },
      ],
    };
    // 表单项
    this.setData = [
      {
        required: true,
        value: '',
        title: this.$t('languages.Apps.FormCode'),
        code: 'code',
        type: 'input',
      },
      {
        required: true,
        value: (this.tree[0] && this.tree[0].key) || '',
        title: '分组',
        code: 'parentId',
        type: 'input',
      },
      {
        required: true,
        value: '',
        title: this.$t('languages.Apps.ShowName'),
        code: 'name',
        type: 'input',
      },
      {
        required: false,
        value: 'h-icon-all-disconnect',
        title: this.$t('languages.Apps.Icon'),
        code: 'icon',
        type: 'icon-select',
      },
      {
        required: false,
        value: 'RECENT_PAGE_MODE',
        title: this.$t('languages.Apps.OpenModel'),
        code: 'openMode',
        type: 'radio',
        options: [
          {
            value: 'RECENT_PAGE_MODE',
            title: this.$t('languages.Apps.IframeInsert'),
          },
          {
            value: 'VUE_MODE',
            title: this.$t('languages.Apps.VueRouteModel'),
          },
          {
            value: 'NEW_PAGE_MODE',
            title: this.$t('languages.Apps.NewPageModel'),
          },
        ],
      },
      {
        required: false,
        value: '',
        title: this.$t('languages.Apps.PcAccessUrl'),
        code: 'pcUrl',
        type: 'input',
      },
      {
        required: false,
        value: '',
        title: this.$t('languages.Apps.MobileAccessUrl'),
        code: 'mobileUrl',
        type: 'input',
      },
      {
        required: false,
        value: ['pc', 'mobile'],
        title: this.$t('languages.Apps.VisibleRange'),
        code: 'visibleRange',
        type: 'checkbox',
      },
    ];
  }

  @Watch('code')
  codeChange(code) {
    this.getDefinePage(code);
  }

  created() {
    this.getIconNames();
    if (this.code) {
      this.getDefinePage(this.code);
    }
    this.setRulesAndForm();
    this.operationDate = JSON.parse(JSON.stringify(this.setData));
    this.operationDate.forEach((res: any, index: number) => {
      res.key = +new Date() + index;
    });
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setRulesAndForm();
  }
}
</script>
<style lang="less">
@import '~@/styles/color/colors.less';
.ant-menu-item-selected {
  color: #111218 !important;
}
.a-from {
  .ant-row {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
    .ant-col-12 {
      padding-right: 16px;
      &:last-child {
        padding-right: 0;
      }
      .ant-radio-group {
        display: flex;
        flex-direction: column;
        & > label {
          height: 30px;
          line-height: 30px;
        }
      }
      .ant-checkbox-group {
        & > label {
          height: 30px;
          line-height: 30px;
        }
      }
      .ant-checkbox-wrapper + .ant-checkbox-wrapper {
        margin-left: 32px;
      }
    }
  }
  .ant-select {
    width: 100%;
  }

  .label-name {
    font-size: 14px;
    color: @nav-font-color;
    position: relative;
    margin-bottom: 6px;
    em {
      color: red;
      font-style: normal;
      margin-left: 2px;
      position: absolute;
      top: 50%;
      line-height: 4px;
    }
    i {
      margin-left: 16px;
      color: @s-light-font-color;
      font-size: 12px;
    }
    small {
      font-size: 12px;
      color: @light-font-color;
      margin-left: 16px;
    }
  }
  .form-wrap {
    position: relative;
    & > p {
      position: absolute;
      left: 0;
      right: 0;
      padding-top: 2px;
      font-size: 12px;
      font-family: PingFang-SC-Regular;
      font-weight: 400;
      color: #f5222d;
      display: none;
    }
    &.has-error {
      & > p {
        display: block;
      }
    }
  }
}

.ant-select-tree-switcher {
  display: none;
}
</style>

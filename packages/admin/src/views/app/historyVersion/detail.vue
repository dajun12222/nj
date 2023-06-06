<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="form-design">
    <a-spin :spinning="isLoading" tip="Loading...">
      <div class="action">
        <div class="form-info">
          <div class="form-name">
            {{
              isChinese && formData
                ? formData.name
                  ? formData.name
                  : formData.name_i18n
                  ? formData.name_i18n.en || JSON.parse(formData.name_i18n).en
                  : ''
                : ''
            }}
          </div>

          <div class="form-version draft">
            {{
              isChinese
                ? '版本' + ((formData && formData.version) || '')
                : 'Version ' + ((formData && formData.version) || '')
            }}
          </div>
        </div>
        <a-radio-group
          buttonStyle="solid"
          class="design-box"
          :value="viewType"
          @change="setView"
        >
          <a-radio-button
            v-for="(item, index) in views"
            :key="index"
            :value="item.value"
          >
            {{ item.text }}
          </a-radio-button>
        </a-radio-group>

        <span class="options-box">
          <!-- <a-button @click="historyView">
            <i class="icon aufontAll h-icon-all-leave-application-o"></i>历史版本
          </a-button> -->
          <!-- <a-button @click="restore" icon="reload">还原</a-button> -->

          <a-tooltip placement="top">
            <template slot="title"> 导出 </template>
            <span>
              <i class="iconfont aufontAll h-icon-all-cloud-download1"></i>
            </span>
          </a-tooltip>
          <a-tooltip placement="top">
            <template slot="title"> 预览 </template>
            <span>
              <i class="icon aufontAll h-icon-all-eye1"></i>
            </span>
          </a-tooltip>
          <a-tooltip placement="top">
            <template slot="title"> 保存 </template>
            <span>
              <i class="iconfont aufontAll h-icon-all-save"></i>
            </span>
          </a-tooltip>

          <!-- <a-button @click="exportForm" icon="reload">还原</a-button> -->

          <a-button style="margin-left: 0" disabled> 发布 </a-button>
        </span>
      </div>
      <div></div>
      <div class="form-design-content">
        <h3-sider :options="leftSider" @resize="onSiderToggle">
          <form-design-panel />
        </h3-sider>
        <editor
          v-if="viewType === 'editor'"
          ref="editor"
          :options="editorOptions"
        />
        <designer
          v-show="viewType !== 'editor'"
          ref="designer"
          :class="[viewType, 'bgf', 'bdr']"
          :warpCls="`${viewType}-view`"
          :controls="controls"
          :initLayout="layout"
          :formData="formData"
          :device="viewType"
          :showDragTips="showDragTips"
          :autoSpanValues="autoSpanValues"
          @control-select="onControlSelect"
        />
        <h3-sider :options="rightSider" @resize="onSiderToggle">
          <FormProperty
            ref="formAttributeLayout"
            :formData="formData"
            :allControls="selectedControl"
            @edit-formdata-attribute="editFormDataAttribute"
          />
        </h3-sider>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts">
import appsApi from '@/apis/apps';
import H3Sider from '@/common/sider/sider.vue';
import Designer from '@/components/apps/form-design/designer/designer.vue';
import Editor from '@/components/apps/form-design/editor/editor.vue';
import FormDesignPanel from '@/components/apps/form-design/panels/form-design-panel.vue';
import { DataItemType, mapToControlType } from 'cloudpivot/form/schema';
import {
  DataItem,
  FormControl,
  FormControlType,
} from '@/components/apps/form-design/typings';
import * as ControlFactory from '@/components/apps/form-design/typings/control-factory';
import * as dataitemStore from '@/components/apps/form-design/stores/data-items.store-helper';
import { LanguageTransform } from '@/utils';
import { Spin, Radio, Button, Tooltip } from '@h3/antd-vue';
import { schema } from 'cloudpivot/form';
import { Component, Provide, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import FormProperty from './form-attr.vue';
import cloneDeep from 'lodash/cloneDeep';
const FormHisModule = namespace('Apps/FormHis');

@Component({
  name: 'form-his-design',
  components: {
    FormDesignPanel,
    H3Sider,
    Designer,
    FormProperty,
    Editor: Editor,
    ASpin: Spin,
    ARadioGroup: Radio.Group,
    ARadioButton: Radio.Button,
    AButton: Button,
    ATooltip: Tooltip,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      (vm as any).load();
    });
  },

  beforeRouteUpdate(to, from, next) {
    const vm = this as any;
    const func = () => {
      vm.clean();
      next();
      (this as any).viewType = 'web';
      vm.load();
    };

    if (vm.isEdit()) {
      vm.confirmSave().then(
        () => {
          func();
        },
        () => {
          next(false);
        },
      );
    } else {
      func();
    }
  },
})
export default class FormHisDesign extends Vue {
  @FormHisModule.Mutation('setCurHistory') setCurHistory: any;

  @FormHisModule.State('currentHistoty') currentHistoty: any;

  // 表单预览数据
  viewData: any;

  views: Array<any> = [
    {
      value: 'web',
      text: 'web端设计',
    },
    {
      value: 'mobile',
      text: '移动端设计',
    },
    {
      value: 'editor',
      text: 'HTML',
    },
  ];

  showDragTips: boolean = false;

  isShowTips: boolean = false;

  isLoading: boolean = false;

  isSubTips: boolean = false;

  isShowPublicTips: boolean = false;

  publicDescription: Array<string> = [];

  controls: { [key: string]: FormControl } = {};

  layout: string[][] = [];

  actions: Array<schema.FormAction> = [];

  elements: Array<schema.FormElement> = [];

  dataItemAdds: {
    [code: string]: DataItem;
  } = {} as any;

  dataItemDeletes: string[] = [];

  // 判断是否组件是否需要设置margin
  clacMargin: string[] = ['left', 'right'];

  formData: any = {};

  selectedControl: any = {};

  viewType = 'web';

  leftSider = {
    width: 256,
    minWidth: 256,
    maxWidth: 700,
    direction: 'left',
    collapsible: true,
  };

  rightSider = {
    width: 309,
    minWidth: 309,
    maxWidth: 700,
    direction: 'right',
    collapsible: true,
  };

  tpl = '';

  editorOptions = {};

  showUnsaveConfirm = false;

  saveConfirmPromiseResolve: Function | null = null;

  saveConfirmPromiseReject: Function | null = null;

  isPublishClick: boolean = false; // 是否点击发布按钮

  autoSpanValues: any = {};

  get designer() {
    return this.$refs.designer as Designer;
  }

  get isEditorView() {
    return this.viewType === 'editor';
  }

  @Provide()
  removeControlFromParent(key: string, path?: string[]) {
    return null;
  }

  @Provide()
  getFormControls() {
    return this.controls;
  }

  @Provide()
  getControl() {
    return this.selectedControl.control;
  }

  setClacMagin(str: string) {
    let arr = this.clacMargin;
    if (arr.includes(str)) {
      arr = arr.filter((item) => item !== str);
    } else {
      arr.push(str);
    }
    this.clacMargin = arr;
  }

  @Watch('formData.formFramework')
  onFormFrameworkChange(newVal, oldVal) {
    Object.keys(this.controls).forEach((item) => {
      if (
        this.controls[item].type === 500 &&
        this.controls[item].panels.length > 0
      ) {
        this.controls[item].panels.forEach((panel) => {
          panel.formFramework = newVal;
          panel.prevFramework = oldVal;
        });
        this.controls[item].panels = cloneDeep(this.controls[item].panels);
      }
    });
  }

  /**
   * @desc 表单设计器控件和控制器显示隐藏回调
   */
  onSiderToggle(str) {
    if (this.isEditorView) {
      const editor = this.$refs.editor as Editor;
      if (editor) {
        editor.resize();
      }
    }
    // 动态设置margin
    this.setClacMagin(str);
  }

  async setView(evt: any) {
    const type = evt.target.value;
    // 从编辑器界面切回设计界面时
    if (this.isEditorView && this.viewType !== type) {
      try {
        await this.parseHTML();
      } catch {
        // 如果有错误停留在编辑器界面
        return;
      }
    }
    this.viewType = type;

    // 从设计界面切到编辑器界面
    if (this.isEditorView) {
      this.initEditorOptions();
    }
  }

  initEditorOptions() {
    const layout = this.designer.getLayout();
    this.editorOptions = {
      layout,
      controls: this.controls,
      actions: this.actions,
      elements: this.elements,
    };
  }

  async parseHTML() {
    if (!this.isEditorView) {
      return;
    }

    const editor = this.$refs.editor as Editor;
    if (!editor) {
      return;
    }

    const result = await editor.parse();
    this.controls = result.controls;
    this.layout = result.layout;
    this.actions = result.actions;
    this.elements = result.elements;
  }

  mounted() {
    this.loadForm();
  }

  /**
   * 加载表单
   */
  loadForm() {
    console.log(this.formData);
    if (
      !this.currentHistoty.draftAttributesJson &&
      !this.currentHistoty.publishedAttributesJson
    ) {
      //重新根据参数请求
      this.isLoading = true;
      this.formData = null;
      const id = this.$route.params.id;
      appsApi
        .getFormHistoryById(id)
        .then((res) => {
          if (res.errcode === 0) {
            try {
              //由于表单属性越来越多，从表单布局开始的表单属性以JSON形式存在options中
              this.parseJsonFormAttr(res.data);
              this.formData = res.data;
              this.setCurHistory(res.data);
              this.initLayout();
              this.isLoading = false;
            } catch (err) {
              this.isLoading = false;
            }
          }
        })
        .catch(() => {
          this.isLoading = false;
        });
    } else {
      this.isLoading = true;
      try {
        this.parseJsonFormAttr(this.currentHistoty);
        this.formData = this.currentHistoty;
        this.initLayout();
      } catch (err) {
        this.isLoading = false;
      }
      this.isLoading = false;
    }

    // const sheetCode = this.$route.params.sheetCode;
    // const schemaCode = this.$route.params.bizSchemaCode;

    // if (!sheetCode || !schemaCode) {
    //   this.$message.error("缺少参数");
    // }
    // const _this = this;
    // formApi.get(schemaCode, sheetCode).then((res: any) => {
    //   _this.formData = res.data;
    //   if (_this.formData.subTip) {
    //     this.isSubTips = true;
    //   }
    //   if (_this.formData.sheetType) {
    //     _this.$message.error('无法打开自定义表单');
    //     return;
    //   }
    //   if (!res.data.draftAttributesJson && !res.data.publishedAttributesJson) {
    //     // todo
    //   } else {
    //     this.initLayout();
    //   }
    // }, (err: any) => {
    //   console.log("error happend", err);
    // });
  }

  //将历史数据映射到对应的control中
  moveHistoryOpts(controls) {
    //历史表单中的规则信息记录在historyOpt中
    Object.keys(controls).forEach((item) => {
      if (controls[item].historyOpt && controls[item].options) {
        Object.keys(controls[item].historyOpt).forEach((el) => {
          controls[item].options[el] = controls[item].historyOpt[el];
        });
      }
      if (
        controls[item].type === mapToControlType(DataItemType.Sheet) &&
        controls[item].columns &&
        controls[item].columns.length > 0
      ) {
        controls[item].columns.forEach((child) => {
          if (child.historyOpt && child.options) {
            Object.keys(child.historyOpt).forEach((el) => {
              child.options[el] = child.historyOpt[el];
            });
          }
        });
      }
      if (controls[item].type === FormControlType.Tabs) {
        const panels = controls[item].panels;
        panels.forEach((panel: any) => {
          panel.controls = this.moveHistoryOpts(panel.controls);
        });
        controls[item].panels = panels;
      }
    });
    return controls;
  }

  /**
   * 初始化布局
   */
  initLayout() {
    this.showDragTips = false;
    const controls = JSON.parse(
      this.formData.draftAttributesJson ||
        this.formData.publishedAttributesJson,
    );

    this.moveHistoryOpts(controls);

    const layout: Array<any[]> = JSON.parse(
      this.formData.draftViewJson || this.formData.publishedViewJson,
    );
    const actionsJson =
      this.formData.draftActionsJson || this.formData.publishedActionsJson;
    if (actionsJson) {
      this.actions = JSON.parse(actionsJson);
    }

    const elementsJson =
      this.formData.draftHtmlJson || this.formData.publishedHtmlJson;
    if (elementsJson) {
      this.elements = JSON.parse(elementsJson);
    }

    this.controls = ControlFactory.restoreOptions(controls);

    //初始化时，旧数据兼容到最新版本
    this.formData.draftAttributesJson = JSON.stringify(this.controls);

    //历史数据中无span值
    this.filledSpanHasNoValue(layout);

    this.layout = layout;
  }

  filledSpanHasNoValue(layout) {
    this.autoSpanValues = {};
    layout.forEach((row) => {
      row.forEach((col) => {
        if (!this.controls[col].options.span) {
          this.autoSpanValues[col] = 24 / row.length;
        }
      });
    });
  }

  editFormDataAttribute(field: string, value: any) {
    let tmp: any = {};

    tmp[field] = value;

    if (field === 'name') {
      const obj: any = LanguageTransform.setLang(
        value,
        this.formData.name_i18n,
      );

      tmp = obj;
    }

    this.formData = Object.assign({}, this.formData, tmp);
  }

  onControlSelect(control?: FormControl, isSeletedControl: Boolean = true) {
    if (control && control.type !== FormControlType.Html) {
      this.selectedControl = { control, isSeletedControl };
      if (!this.selectedControl.control.options.span) {
        this.selectedControl.initSpanValue = this.autoSpanValues[control.key];
      }
    } else {
      this.selectedControl = {};
    }
  }

  load(value?: boolean, value2?: boolean) {
    const hideLoader = (this.$message as any).loading();
    dataitemStore.init(this).then(
      () => {
        hideLoader();
      },
      (res) => {
        hideLoader();
        if (res) {
          this.$message.error(res.errmsg);
        }
      },
    );
  }

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  /**
   * 解析options中存储的JSON格式的表单属性
   */
  parseJsonFormAttr(data) {
    //历史数据无options
    if (!data.options) {
      data.formFramework = 5;
      return;
    }
    const jsonObj = JSON.parse(data.options);
    Object.keys(jsonObj).forEach((attr) => {
      data[attr] = jsonObj[attr];
    });
    delete data.options;
  }
}
</script>

<style lang="less">
@import '~@/components/apps/form-design/style/form-design.less';
</style>
<style lang="less" scoped>
@import '~@/components/apps/form-design/style/form-design-scoped.less';
.action .form-info .draft::after {
  display: none;
}
</style>

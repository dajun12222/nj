<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div :key="$route.path" class="form-design container use-tabs">
    <div class="action">
      <div class="form-info">
        <div class="form-name">
          {{
            isChinese
              ? formData.name
              : formData.name_i18n
              ? formData.name_i18n.en || JSON.parse(formData.name_i18n).en
              : formData.name
          }}
        </div>

        <tag :text="tagContent" class="draft" />

        <a-tooltip placement="top">
          <template slot="title"> 历史版本 </template>
          <span class="look-version" @click="setListVisible(true)">
            <i class="iconfont aufontAll h-icon-all-field-time"></i>
          </span>
        </a-tooltip>
      </div>
      <div class="tips">
        <a-alert
          v-show="isShowTips"
          type="warning"
          message="保存成功，发布后方可在门户使用！"
          showIcon
          closable
          @close="isShowTips = false"
        />
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
      <div class="tips publicTips">
        <a-alert
          v-for="(msg, idx) in publicDescription"
          :key="idx"
          type="warning"
          :message="msg"
          showIcon
          closable
          @close="onClosePublicTips"
        />
      </div>

      <span class="options-box">
        <a-tooltip placement="top">
          <template slot="title"> 导出 </template>
          <span @click="exportForm">
            <i class="iconfont aufontAll h-icon-all-cloud-download1"></i>
          </span>
        </a-tooltip>
        <a-tooltip placement="top">
          <template slot="title"> 预览 </template>
          <span @click="preview">
            <i class="iconfont aufontAll h-icon-all-eye1"></i>
          </span>
        </a-tooltip>
        <!-- <a-tooltip placement="top">
          <template slot="title"> 保存 </template>
          <span @click="onSave">
            <i class="iconfont aufontAll h-icon-all-save"></i>
          </span>
        </a-tooltip> -->
        <a-button style="margin-left: 0" @click="onSave"> 保存 </a-button>

        <!-- <a-button @click="exportForm" icon="reload">还原</a-button> -->

        <a-button type="primary" @click="publish"> 发布 </a-button>
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
        @dataitem-add="onDataitemAdd"
        @dataitem-delete="onDataitemDelete"
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
        @control-add="onControlAdd"
        @control-update="onControlUpdate"
        @control-delete="onControlDelete"
        @control-select="onControlSelect"
        @dataitem-add="onDataitemAdd"
        @dataitem-delete="onDataitemDelete"
      />
      <h3-sider :options="rightSider" @resize="onSiderToggle">
        <FormProperty
          ref="formAttributeLayout"
          :formData="formData"
          :allControls="selectedControl"
          @control-update="onControlUpdate"
          @modelAttrRule-update="onModelAttrRuleUpdate"
          @edit-formdata-attribute="editFormDataAttribute"
          @control-update-blur="onControlUpdateBlur"
          @optionTypeChange="optionTypeChange"
        />
      </h3-sider>
    </div>
    <a-modal
      :visible="showUnsaveConfirm"
      :closable="false"
      :maskClosable="false"
      width="420px"
      wrapClassName="unsave-confirm"
    >
      <div class="unsave-confirm--content">
        <i class="icon aufontAll h-icon-all-question-circle"></i>
        <strong>{{ $t('languages.Apps.FormDesignPage.UnsaveContent') }}</strong>
      </div>

      <template slot="footer">
        <a-button key="cancel" @click="handleConfirmCancel">
          {{ $t('languages.Apps.Cancel') }}
        </a-button>
        <a-button key="unsave" @click="handleConfirmUnsave">
          {{ $t('languages.Apps.Unsave') }}
        </a-button>
        <a-button key="save" type="primary" @click="handleConfirmOk">
          {{ $t('languages.Apps.SaveAndLeave') }}
        </a-button>
      </template>
    </a-modal>

    <a-modal
      v-model="isShowPublishModal"
      class="publish-modal"
      okText="发布"
      cancelText="取消"
      :maskClosable="false"
      :keyboard="false"
      @ok="postPublish"
    >
      <p slot="title">
        发布说明
        <span class="title-tip">用于历史版本介绍</span>
      </p>

      <div class="desc-box">
        <textarea
          v-model="publishDesc"
          placeholder="请输入说明（120字以内）必填"
          maxlength="120"
        ></textarea>
        <div class="desc-num">{{ publishDesc.length }}/120</div>
      </div>
    </a-modal>

    <!-- 示例应用新手引导弹框 -->
    <div v-if="isShowGuide" class="slAppIcons_modal">
      <div class="slAppIcons_modalImg">
        <img :src="slAppIcons" />
        <a-icon
          type="close"
          class="slAppIcons_modalImgClose"
          @click="closeChange"
        />
      </div>
    </div>

    <BigDialog title="表单预览" :show="showPreview" @cancel="hidePreview">
      <FormPreview :curview="viewData" @hidePreview="hidePreview" />
    </BigDialog>

    <BigDialog
      title="历史版本"
      :show="listVisible"
      @cancel="setListVisible(false)"
    >
      <HistoryVersion v-show="listVisible" />
    </BigDialog>
  </div>
</template>

<script lang="ts">
import appsApi from '@/apis/apps';
import * as formApi from '@/apis/form';
import UserGuideApi from '@/apis/system/system-manager.api';
import H3Sider from '@/common/sider/sider.vue';
import FormPreview from '@/components/apps/form-preview/form-preview.vue';
import '@/directives/drag';
import { TemplateExport } from '@/template/templateExport';
import { LanguageTransform } from '@/utils';
import { recursionSearch } from 'cloudpivot/common/src/utils/utils';
import { schema } from 'cloudpivot/form';
import { NumberFormatType } from 'cloudpivot/form/component-schema';
import { DataItemType, mapToControlType } from 'cloudpivot/form/schema';
import { ControlHelper } from 'cloudpivot/form/src/common/controls/control-helper';
import { controlAttributeListMap } from 'cloudpivot/form/src/schema/control-attribute-transfer';
import { CompareVersion } from 'cloudpivot/form/utils';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import { Component, Provide, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import Designer from './designer/designer.vue';
import Editor from './editor/editor.vue';
import {
  SynRelevanceFormDisplayField,
  SynSheetRelevanceFormDisplayField,
  SynTabRelevanceFormDisplayField,
} from './form-detail-service';
import FormProperty from './form-property/form-attribute-layout.vue';
import FormDesignPanel from './panels/form-design-panel.vue';
import { DataItemState } from './stores/data-items.store';
import * as dataitemStore from './stores/data-items.store-helper';

import { EventBus } from 'cloudpivot/form/src/schema/event-bus';
import {
  DataItem,
  DispalyMode,
  FormControl,
  FormControlType,
  FormSheet,
  FormSheetColumn,
  FormSheetStatistic,
  FormTabs,
  ReverseRelevanceOptions,
} from './typings';
import * as ControlFactory from './typings/control-factory';

import { Modal, Button, Radio, Alert, Tooltip, Icon } from '@h3/antd-vue';

import Tag from '@/components/global/tag.vue';

import BigDialog from '@/components/apps/modals/bigDialog.vue';

import HistoryVersion from '@/views/app/historyVersion/index.vue';

const slAppIcon = require('../../../assets/images/slApp.svg');

const DataModelModule = namespace('Apps/DataModel');
const FormHisModule = namespace('Apps/FormHis');
const UserModule = namespace('System/User');
const AppCenterModule = namespace('Apps/AppCenter');
@Component({
  name: 'form-design',
  components: {
    FormDesignPanel,
    Designer,
    FormProperty,
    H3Sider,
    FormPreview,
    Editor: () => import('./editor/editor.vue'),
    AModal: Modal,
    AButton: Button,
    ARadio: Radio,
    ARadioButton: Radio.Button,
    ARadioGroup: Radio.Group,
    AAlert: Alert,
    ATooltip: Tooltip,
    AIcon: Icon,
    Tag,
    BigDialog,
    HistoryVersion,
  },
  beforeRouteEnter(to, from, next) {
    localStorage.removeItem('layoutType');
    next((vm) => {
      (vm as FormDesign).load();
    });
  },

  beforeRouteUpdate(to, from, next) {
    localStorage.removeItem('layoutType');
    const vm = this as FormDesign;
    const func = () => {
      vm.clean();
      next();
      (this as any).viewType = 'web';
      vm.load();
    };

    const isDelModel: boolean = sessionStorage.getItem('isDelModel') === 'true';
    sessionStorage.removeItem('isDelModel');
    if (vm.isEdit() && !isDelModel) {
      //当页面有改动时通知自定义按钮避免跳转提交将自定义按钮清空
      this.setCustomButtonEdit(true);
      vm.confirmSave().then(
        () => {
          func();
          this.setCustomButtonEdit(false);
          this.setDatacustomButton([]);
        },
        () => {
          next(false);
        },
      );
    } else {
      func();
    }
  },

  beforeRouteLeave(to, from, next) {
    localStorage.removeItem('layoutType');
    const currFormDeleted =
      to.params.bizSchemaCode === from.params.bizSchemaCode &&
      to.query.del_form_code === from.params.sheetCode;

    const vm = this as FormDesign;
    vm.showDragTips = false;

    const isDelModel: boolean = sessionStorage.getItem('isDelModel') === 'true';
    sessionStorage.removeItem('isDelModel');
    if (!currFormDeleted && vm.isEdit() && !isDelModel) {
      //当页面有改动时通知自定义按钮避免跳转提交将自定义按钮清空
      this.setCustomButtonEdit(true);
      vm.confirmSave().then(
        () => {
          vm.clean();
          next();
          this.setCustomButtonEdit(false);
          this.setDatacustomButton([]);
        },
        () => {
          next(false);
        },
      );
    } else {
      vm.clean();
      next();
    }
  },
})
export default class FormDesign extends Vue {
  // 表单名称修改后需要同步更新子组件
  @DataModelModule.Action('updateFormData') updateFormData: any;

  @DataModelModule.Action('getFormRuleList') getFormRuleList: any;

  @DataModelModule.Action('getDataItemList') getDataItemList: any;

  @FormHisModule.Mutation('setCurrentVersion') setCurrentVersion: any;

  @DataModelModule.Mutation('setFormSystemVersion') setFormSystemVersion: any;

  @FormHisModule.State('currentVersion') getCurrentVersion: any;

  @FormHisModule.State('listVisible') listVisible: any;

  @FormHisModule.Mutation('setListVisible') setListVisible: any;

  @DataModelModule.State('formRuleList') formRuleList: any;

  @DataModelModule.State('dataItemList') dataItemList: any;

  @DataModelModule.State('formSystemVersion') formSystemVersion: any;

  @DataModelModule.State('DatacustomButton') DatacustomButton: any;

  @DataModelModule.Mutation('setDatacustomButton') setDatacustomButton: any;

  @DataModelModule.State('customButtonEdit') customButtonEdit: boolean;

  @DataModelModule.Mutation('setCustomButtonEdit') setCustomButtonEdit: any;

  @DataModelModule.Mutation('setControlsMarking') setControlsMarking: any;

  @UserModule.State('loginedUserInfo') loginedUserInfo!: any;

  @AppCenterModule.State('appList') appList: any;

  showPreview: boolean = false;

  @Provide()
  isPreview() {
    return this.showPreview;
  }

  @Provide()
  getControls() {
    return this.controls;
  }

  // 表单预览数据
  viewData: any = {};

  views: any = [
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

  isSubTips: boolean = false;

  isShowPublicTips: boolean = false;

  isShowPublishModal: boolean = false;

  publishDesc: string = '';

  publicDescription: Array<string> = [];

  controls: { [key: string]: FormControl } = {};

  layout: string[][] = [];

  actions: Array<schema.FormAction> = [];

  elements: Array<schema.FormElement> = [];

  dataItemAdds: {
    [code: string]: DataItem;
  } = {} as any;

  dataItemDeletes: string[] = [];

  bizDataRuleAdds: any[] = [];

  editProperties: any[] = [];

  deleteBizDataRuleIds: any[] = [];

  draftSchemaOptions: any[] = [];

  // 判断是否组件是否需要设置margin
  clacMargin: string[] = ['left', 'right'];

  formData: any = {};

  formDataBeta: any = {};

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

  isDraft: boolean = false; // 当前表单设计是否发布

  isPublished: boolean = false;

  isShowGuide: boolean = false; //示例应用新手引导

  slAppIcons: any = slAppIcon;

  autoSpanValues: any = {};

  hideLoader: any = null;

  get version() {
    return this.$store.state.config.systemVersion;
  }

  get isEditorView() {
    return this.viewType === 'editor';
  }

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  get bizSchemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  @Watch('$route.params')
  on$routeChange() {
    this.editProperties = [];

    this.dataItemDeletes = [];

    this.bizDataRuleAdds = [];

    this.deleteBizDataRuleIds = [];

    this.draftSchemaOptions = [];
  }

  @Watch('layout')
  onLayoutChange(newVal) {
    if (
      this.movingControl &&
      this.movingControl.key &&
      this.controls[this.movingControl.key]
    ) {
      this.autoSpanValues['.'] =
        this.controls[this.movingControl.key].options.span;
    } else {
      if (this.formData.formFramework === 5) {
        this.autoSpanValues['.'] = 24;
      } else {
        this.autoSpanValues['.'] = 24 / this.formData.formFramework;
      }
    }
    if (this.formData.formFramework === 5) {
      this.autoLayoutRow(newVal);
    }
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

    if (newVal === 5 || !oldVal) {
      return;
    }

    //表单布局改变触发所有控件重新排列
    this.autoSpanValues = {};

    //每一列初始宽度
    const initSpan = 24 / newVal;
    const layout = this.layout;
    const newLayout: string[][] = [[]];
    let counter = 0;
    layout.forEach((row) => {
      row.forEach((col) => {
        if (counter === newVal) {
          newLayout.push([]);
          counter = 0;
        }
        if (ControlFactory.isFullRow(this.controls[col].type)) {
          if (newLayout[newLayout.length - 1].length > 0) {
            newLayout.push([col]);
          } else {
            newLayout[newLayout.length - 1].push(col);
          }
          this.controls[col].options.span = 24;
          counter = newVal;
        } else {
          newLayout[newLayout.length - 1].push(col);
          this.controls[col].options.span = initSpan;
          counter++;
        }
      });
    });
    this.layout = newLayout;
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
    const layout = (this.$refs.designer as any).getLayout();
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

    const callOnDataItemAdd = (control: FormControl) => {
      let item = this.findDataItem(control.key, control.parentKey, control);

      if (item) {
        return;
      }

      item = ControlFactory.buildDataItemOf(
        {
          code: control.key,
          type: control.type,
          name: control.options.name,
        },
        control.parentKey,
      );
      this.onDataitemAdd(item);
    };

    const checkDataitem = (result: any) => {
      for (const key in result.controls) {
        if (result.controls.hasOwnProperty(key)) {
          const control = result.controls[key];
          //处理tabs控件heads 为字符串的情况
          if (control.type === FormControlType.Tabs) {
            if (typeof control.options.heads === 'string') {
              control.options.heads = JSON.parse(control.options.heads);
            }
          }
          if (ControlFactory.notDataItemOf(control.type)) {
            continue;
          }

          const isSheet = control.type === FormControlType.Sheet;

          if (!this.controls[key]) {
            callOnDataItemAdd(control);

            if (isSheet) {
              for (const newCol of (control as FormSheet).columns) {
                callOnDataItemAdd(newCol);
              }
            }
          } else if (isSheet) {
            const newSheet = control as FormSheet;
            const oldSheet = this.controls[key] as FormSheet;
            const oldColumnKeys = oldSheet.columns.map((c) => c.key);

            for (const newCol of newSheet.columns) {
              if (oldColumnKeys.indexOf(newCol.key) === -1) {
                callOnDataItemAdd(newCol);
              }
            }
          } else {
            //Else Empty block statement
          }
        }
      }

      for (const key in this.controls) {
        if (this.controls.hasOwnProperty(key)) {
          const control = this.controls[key];
          if (!result.controls[key]) {
            this.onDataitemDelete(control.key, control.parentKey);
          } else if (control.type === FormControlType.Sheet) {
            const newSheet = result.controls[key] as FormSheet;
            const oldSheet = control as FormSheet;
            const newColumnKeys = newSheet.columns.map((c) => c.key);

            for (const oldCol of oldSheet.columns) {
              if (newColumnKeys.indexOf(oldCol.key) === -1) {
                this.onDataitemDelete(oldCol.key, oldCol.parentKey);
              }
            }
          } else {
            //Else Empty block statement
          }
        }
      }
    };

    const result = await editor.parse();
    checkDataitem(result);
    this.controls = result.controls;
    this.layout = result.layout;
    this.actions = result.actions;
    this.elements = result.elements;
  }

  // 判断obj1、obj2是否相同属性
  isDeepObjectEqual(obj1, obj2) {
    //1.如果是比较对象===，返回true
    if (obj1 === obj2) {
      return true;
    }

    //2.如果比较的是两个方法，转成字符串比较
    if (typeof obj1 === 'function' && typeof obj2 === 'function') {
      return obj1.toString() === obj2.toString();
    }

    //3如果obj1和obj2都是Date实例，获取毫秒值比较
    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.getTime() === obj2.getTime();
    }

    //4如果比较是两个类型不一致,无须比较直接返回false
    if (
      Object.prototype.toString.call(obj1) !==
        Object.prototype.toString.call(obj2) ||
      typeof obj1 !== 'object'
    ) {
      if (!obj1 && !obj2) {
        // ''和undefined 可以认为是一致的
        return true;
      }
      return false;
    }

    // options===""和options不存在当成他们是一直的
    if (
      obj1.hasOwnProperty('options') &&
      obj1.options === '' &&
      !obj2.hasOwnProperty('options')
    ) {
      obj2.options = '';
    }

    //5.获取对象所有自身属性的属性名（包括不可枚举属性但不包括Symbol值作为名称的属性
    const obj1Props = Object.getOwnPropertyNames(obj1).filter(
      (el) => !['__ob__'].includes(el) && obj1[el] && obj2[el],
    );
    const obj2Props = Object.getOwnPropertyNames(obj2).filter(
      (el) => !['__ob__'].includes(el) && obj2[el] && obj1[el],
    );

    //自身属性长度相等,
    if (obj1Props.length !== obj2Props.length) {
      return false;
    }

    //递归调用判断每一个属性值是否相等
    return obj1Props.every((prop) =>
      this.isDeepObjectEqual(obj1[prop], obj2[prop]),
    );
  }

  isEdit() {
    //如果表单没有加载完成，直接返回false
    if (this.hideLoader) {
      return false;
    }

    if (
      !this.formData.draftAttributesJson &&
      Object.keys(this.controls).length
    ) {
      return true;
    }

    const layout = (this.$refs.designer as any).getLayout();
    if (!this.formData.draftViewJson && layout.length) {
      return true;
    }

    const controls = cloneDeep(this.controls);
    this.addSpanValues(controls);

    const orDraft =
      this.formatDictionariesOption() || this.formData.draftAttributesJson;

    if (
      !this.isDeepObjectEqual(
        JSON.parse(JSON.stringify(controls)),
        JSON.parse(orDraft),
      )
    ) {
      return true;
    }
    if (
      !this.isDeepObjectEqual(
        JSON.parse(JSON.stringify(layout)),
        JSON.parse(this.formData.draftViewJson),
      )
    ) {
      return true;
    }

    if (this.isFormColumnsModifid(this.formDataBeta, this.formData)) {
      return true;
    }

    //校验自定义按钮
    if (this.customButtonEdit) {
      return true;
    }

    return false;
  }

  isFormColumnsModifid(oldFormColumns: any, newFormColumns: any) {
    const formColumns = [
      'code',
      'name',
      'name_i18n',
      'formTrack',
      'trackDataCodes',
      'externalLinkAble',
      'qrCodeAble',
      'shortCode',
      'print',
      'pdfAble',
      'layoutType',
      'borderMode',
      'formComment',
      'formFramework',
      'sheetData',
    ];
    for (const formColumn of formColumns) {
      if (oldFormColumns[formColumn] !== newFormColumns[formColumn]) {
        return true;
      }
    }
    return false;
  }

  onDataitemAdd(item: DataItem) {
    if (item.parentCode) {
      let parent = this.dataItemAdds[item.parentCode];
      if (!parent) {
        const temp = this.findDataItem(item.parentCode);
        if (temp) {
          parent = Object.assign({}, temp) as any;
          this.dataItemAdds[item.parentCode] = parent;
        }
      }
      if (parent.properties) {
        if (item.id) {
          const idx = parent.properties.findIndex((x) => x.id === item.id);
          parent.properties.splice(idx, 1, item);
        } else {
          const idx = parent.properties.findIndex((x) => x.code === item.code);
          if (idx === -1) {
            parent.properties.push(item);
          } else {
            item.id = parent.properties[idx].id;
            parent.properties.splice(idx, 1, item);
          }
        }
      } else {
        parent.properties = [];
        parent.properties.push(item);
      }
    } else {
      this.dataItemAdds[item.code] = item;

      // 将拖拽的表单项添加到内存中
      const newItem: DataItemState = Object.assign(item, {
        used: true,
      });
      dataitemStore.addItem(this, newItem);
    }
  }

  // 删除控件
  onDataitemDelete(code: string, parentCode?: string) {
    if (parentCode) {
      let parent = this.dataItemAdds[parentCode];
      if (parent) {
        if (parent.properties) {
          const idx = parent.properties.findIndex((p) => p.code === code);
          parent.properties.splice(idx, 1);
        }
      }
      parent = this.items.find((x) => x.code === parentCode) as any;
      if (parent && parent.properties) {
        // const item:any = parent.properties.find((x) => x.code === code);
        // 如果删除子表的【关联控件】 则子表的属性-关联属性要为空
        if (
          code === this.controls[parentCode].options.importFormRelevanceForm
        ) {
          this.controls[parentCode].options.importFormRelevanceForm = '';
        }
      }
    } else {
      delete this.dataItemAdds[code];
      const delIndex = this.items.findIndex((m) => m.code === code);
      const item = this.items[delIndex];
      if (item && !item.published && !item.isSystem) {
        // this.dataItemDeletes.push(code);
        // 删除内存中的表单项
        this.items.splice(delIndex, 1);
      }
    }
    this.setShowDragTips('delete');
  }

  // 选中控件
  onControlSelect(control?: FormControl, isSeletedControl: Boolean = true) {
    if (control && control.type !== FormControlType.Html) {
      // const globalName:string =  LanguageTransform.getLang(control.options.name, control.options.name_i18n);
      // control.options.name = globalName;

      let dataItem = this.findUnSaveDataItem(control.key, control.parentKey);

      if (!dataItem) {
        const key =
          control.type === FormControlType.SheetStatistic
            ? (control as FormSheetStatistic).columnKey
            : control.key;
        dataItem = this.findDataItem(key, control.parentKey, control);
      }
      this.selectedControl = { control, dataItem, isSeletedControl };
      if (control.options && !control.options.span && !control.path) {
        this.selectedControl.initSpanValue =
          this.autoSpanValues[control.key] || this.autoSpanValues['.'];
      } else if (control.path) {
        this.selectedControl.initSpanValue = control.initSpanValue;
      } else {
        //Else Empty block statement
      }
    } else {
      this.selectedControl = {};
    }
    if (control && control.key && control.key === 'parentId') {
      control.options.showStyle = 'tree';
    }
  }

  // 添加控件
  onControlAdd(control: FormControl, copyKey?: string) {
    this.controls[control.key] = control;

    this.setShowDragTips('add');
    if (control.key === '.') {
      return;
    }
    if (control.type === 500) {
      control.panels.forEach((panel) => {
        panel.formFramework = this.formData.formFramework;
      });
    }
    // 如果有数据项，则设置为不可用
    const item = this.findDataItem(control.key);
    if (item) {
      this.synchronizationRules(control, null, true);
      this.switchDataitemUsed(control.key);
      if (control.type === FormControlType.Sheet && item.properties) {
        item.properties.forEach((p) => {
          this.switchDataitemUsed(control.key, p.code);
        });
      }
    } else {
      // 只有基础控件和子表需要选择数据项
      if (copyKey) {
        this.copyDataItemFrom(control, copyKey);
      }
    }
    // @ts-ignore
    if (copyKey && control.type === FormControlType.Sheet && control.columns) {
      // @ts-ignore
      control.columns.forEach((element) => {
        element.key = element.copyKey;
      });
    }
    if (this.formData.formFramework && this.formData.formFramework !== 5) {
      if (!ControlFactory.isFullRow(control.type) && control.options) {
        control.options.span = 24 / this.formData.formFramework;
      } else if (!control.options.span) {
        control.options.span = 24;
      } else {
        //Else Empty block statement
      }
    } else {
      this.autoSpanValues[control.key] = 24;
    }
    this.onControlSelect(control);
  }

  // 控件更新
  onControlUpdate(
    key: string,
    properties: { [key: string]: any },
    parentKey?: string,
    path?: string[],
  ) {
    if (properties && properties.columns) {
      for (let i = 0; i < properties.columns.length; i++) {
        // 子表数据项是否新添加的需要同步控件属性
        if (properties.columns[i]) {
          delete properties.columns[i].isNewAdd;
          this.synchronizationRules(properties.columns[i], key);
          break;
        }
      }
    }

    const selectControlInSheet =
      this.selectedControl &&
      this.selectedControl.control &&
      this.selectedControl.control.parentKey;

    let control: any;

    const parents: FormControl[] = [];
    if (path) {
      control = this.findControlByPath(path, parents);
    } else if (parentKey) {
      path = [parentKey, key];
      control = this.findControlByPath(path, parents);
    } else {
      control = this.controls[key];
    }
    if (!control) {
      return;
    }

    if (
      properties.options &&
      properties.options.heads &&
      properties.options.heads.length > 0
    ) {
      control.panels.forEach((panel) => {
        panel.formFramework = this.formData.formFramework;
      });
    }

    if (this.selectedControl && this.selectedControl.control) {
      const currentMaxlengthRule: any = this.formRuleList.find(
        (x) =>
          x.propertyCode === this.selectedControl.control.key &&
          x.dataRuleType === 1 &&
          x.checkType === 4,
      );
      if (currentMaxlengthRule) {
        try {
          const optionObj = JSON.parse(currentMaxlengthRule.options);
          if (optionObj) {
            const { maxLength } = optionObj;
            const { defaultValue } = properties.options;
            if (defaultValue && defaultValue.length > maxLength) {
              properties.options.defaultValue =
                properties.options.defaultValue.slice(0, maxLength);
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
    }

    // 子表子控件处理
    if (parents.length === 1 && parents[0].type === FormControlType.Sheet) {
      const sheet = parents[0] as FormSheet;
      if (control.type === FormControlType.Number) {
        if (properties.options) {
          const propertys = Object.keys(properties.options);
          if (propertys.includes('format') && sheet.statistics) {
            this.syncSheetNumberAndStatistic(
              key,
              sheet,
              properties.options.format,
            );
          }
        }
      }
    }

    const name = control.options.name;
    if (!control) {
      return;
    }

    Object.keys(properties).forEach((k) => {
      const c = control as any;
      if (c[k] === undefined) {
        return;
      }
      const prop = properties[k];
      let obj: any;
      if (Array.isArray(prop)) {
        obj = prop.slice();
      } else if (prop && typeof prop === 'object') {
        obj = Object.assign((control as any)[k], properties[k]);
      } else {
        obj = prop;
      }
      // this.$set(control, k, obj);
      c[k] = obj;
    });

    if (properties.hasOwnProperty('type')) {
      control.options = ControlFactory.buildControlOptions(
        properties.type,
        control.options,
      );

      // 子表列宽处理
      if (parents.length === 1 && parents[0].type === FormControlType.Sheet) {
        (control as FormSheetColumn).width = ControlFactory.getSheetColumnWidth(
          control.type,
        );
      }
    }

    if (properties.options) {
      if (properties.options.name) {
        const locale = this.$i18n.locale;
        if (locale === 'zh') {
          this.updateDataItem(control, 'name');
        } else {
          if (name) {
            control.options.name = name;
          }
          if (!control.options.name_i18n) {
            control.options.name_i18n = {};
          }
          control.options.name_i18n[locale] = properties.options.name;
          this.updateDataItem(control, 'name_i18n');
        }
      } else if (properties.options.schemaCode) {
        this.updateDataItem(control, 'schemaCode', 'relativeCode');
      }
      // 当修改显示字段时
      else if (properties.options.displayField) {
        this.updateDataItem(control, 'displayField', 'relativePropertyCode');
      } else if (properties.options.dataItemName) {
        return;
        // this.updateDataItemCode(control, properties.options.dataItemName, path);
      } else if (properties.options.span && !control.path) {
        if (this.formData.formFramework === 5 || !this.formData.formFramework) {
          this.layout.forEach((row) => {
            if (row.includes(key)) {
              row.forEach((col) => {
                if (col !== key && this.controls[col].options.span) {
                  this.autoSpanValues[col] = this.controls[col].options.span;
                  this.controls[col].options.span = undefined;
                } else {
                  delete this.autoSpanValues[key];
                }
              });
            }
          });
          this.autoLayoutRow(this.layout);
        }
        //修改控件宽度时，交给designer处理换行问题
        ((this.$refs.designer as any).$refs.grid as any).spanChange(
          key,
          properties.options.span,
        );
      } else {
        //Else Empty block statement
      }
    }

    if (parents && parents.length > 0) {
      const parent = parents[parents.length - 1];
      if (
        parents[0].type === FormControlType.Tabs &&
        (parent as any).controls
      ) {
        (parent as any).controls[control.key] = Object.assign({}, control);
        const tabs = parents[0] as FormTabs;
        const layout = (parent as any).layout;
        const [rowIdx, colIdx] = ControlFactory.findIndexFromGrid(
          layout,
          control.key,
        );
        if (rowIdx > -1 && colIdx > -1) {
          const row = layout[rowIdx];
          row.splice(colIdx, 1, control.key);
        }
      }
    }
    this.onControlSelect(control, false);
    //如果是子表内数据项删除触发的更新，默认选中子表，子表的高亮效果需要到designer中添加
    if (selectControlInSheet && control.type === 201) {
      (this.$refs.designer as any).selected = control;
    }
  }

  onControlUpdateBlur(
    key: string,
    properties: { [key: string]: any },
    parentKey?: string,
    path?: string[],
  ) {
    let control: any;

    const parents: FormControl[] = [];

    if (path) {
      control = this.findControlByPath(path, parents);
    } else if (parentKey) {
      path = [parentKey, key];
      control = this.findControlByPath(path, parents);
    } else {
      control = this.controls[key];
    }
    if (!control) {
      return;
    }

    if (properties.options.dataItemName) {
      this.updateDataItemCode(control, properties.options.dataItemName, path);
      this.updateBizDataRuleAddsCode(key, properties.options.dataItemName);
    }
    if (parents && parents.length > 0) {
      const parent = parents[parents.length - 1];
      if (
        parents[0].type === FormControlType.Tabs &&
        (parent as any).controls
      ) {
        (parent as any).controls[control.key] = Object.assign({}, control);
        const tabs = parents[0] as FormTabs;
        const layout = (parent as any).layout;
        const [rowIdx, colIdx] = ControlFactory.findIndexFromGrid(
          layout,
          control.key,
        );
        if (rowIdx > -1 && colIdx > -1) {
          const row = layout[rowIdx];
          row.splice(colIdx, 1, control.key);
        }
      }
    }

    this.onControlSelect(control, false);
  }

  /**
   * 修改bizDataRuleAdds中对应的编码值
   */
  updateBizDataRuleAddsCode(key, propertyCode) {
    if (this.bizDataRuleAdds.length > 0) {
      this.bizDataRuleAdds.forEach((item) => {
        if (key === item.propertyCode) {
          item.propertyCode = propertyCode;
        }
      });
    }
  }

  // 同步子表中 数值框格式和统计的格式
  syncSheetNumberAndStatistic(
    numberCode: string,
    sheet: FormSheet,
    newFormat: string,
  ) {
    const item = sheet.statistics.find((val) => val.columnKey === numberCode);
    if (item) {
      item.options.format = newFormat;
    }
  }

  // 查找控件
  findDataItem(code: string, parentCode?: string, control?: any) {
    if (parentCode) {
      const parent = this.items.find((x) => x.code === parentCode);
      if (!parent || !parent.properties) {
        return null;
      }
      return parent.properties.find((x) => x.code === code);
    } else {
      const item: any = this.items.find((x) => x.code === code);
      if (item) {
        return item;
      } else {
        // 描述说明添加属性
        if (control && control.type === 202) {
          const name: string = control.options.name;
          return Object.assign(control.options, {
            name,
            code: control.key,
            id: control.key,
          });
        }
        return undefined;
      }
    }
  }

  // 查找未保存的控件
  findUnSaveDataItem(code: string, parentCode?: string) {
    if (parentCode) {
      const parent = this.dataItemAdds[parentCode];
      if (!parent || !parent.properties) {
        return null;
      }
      const item = parent.properties.find(
        (p) => p.code === code || p.code === code + '_1',
      );
      return item;
    }
    return this.dataItemAdds[code];
  }

  // 更新控件
  updateDataItem(control: FormControl, key: string, alias?: string) {
    let add: any;

    if (control.parentKey) {
      let item = this.findUnSaveDataItem(control.key, control.parentKey);

      if (item) {
        add = item;
      } else {
        item = this.findDataItem(control.key, control.parentKey, control);

        if (item && !item.published && !item.isSystem) {
          add = Object.assign({}, item);
          this.onDataitemAdd(add);
        }
      }
    } else {
      add = this.dataItemAdds[control.key];

      if (!add) {
        const item = this.items.find((x) => x.code === control.key);
        if (item && !item.published && !item.isSystem) {
          add = Object.assign({}, item);
          this.onDataitemAdd(add);
        }
      }
    }

    if (add) {
      alias = alias || key;
      add[alias] = control.options[key];
    }
  }

  updateDataItemCode(control: FormControl, code: string, path?: string[]) {
    if (control.key === code) {
      return false;
    }

    const item = this.findDataItem(control.key, control.parentKey, control);

    if (item && (item.published || item.isSystem || item.code === code)) {
      return false;
    }

    let item2 = control.parentKey
      ? this.findDataItem(code, control.parentKey, control)
      : this.findDataItem(code);
    if (!item2) {
      item2 = control.parentKey
        ? this.findUnSaveDataItem(code, control.parentKey)
        : this.findUnSaveDataItem(code);
    }

    //在表单设计时删除组件后若使用被删除组件的编码，则会提示以下错误信息
    if (item2) {
      this.$message.error(
        `数据项编码重复，系统已重置为上一次编码，请根据需要修改`,
      );
      return false;
    }

    let updateItem: any = this.findUnSaveDataItem(
      control.key,
      control.parentKey,
    );

    if (updateItem) {
      if (updateItem.code === code) {
        return false;
      }

      if (!updateItem.parentCode) {
        delete this.dataItemAdds[updateItem.code];
        this.dataItemAdds[code] = updateItem;
      }

      updateItem.code = code;
    } else {
      updateItem = Object.assign({}, item);
      updateItem.code = code;
      this.onDataitemAdd(updateItem);
    }

    if (updateItem.properties) {
      updateItem.properties.forEach((x) => (x.parentCode = code));
    }

    if (control.type === FormControlType.Sheet) {
      const sheet = control as FormSheet;
      sheet.columns.forEach((c) => (c.parentKey = code));
      if (sheet.statistics) {
        sheet.statistics.forEach((c) => (c.parentKey = code));
      }
    } else if (control.parentKey) {
      const sheet = this.controls[control.parentKey] as FormSheet;
      if (sheet && sheet.statistics) {
        sheet.statistics
          .filter((c) => c.columnKey === control.key)
          .forEach((c) => (c.columnKey = code));
      }
    } else {
      //Else Empty block statement
    }

    // 原控件
    let oldPath = '';
    if (path && control.path && control.path.length) {
      oldPath = path[path.length - 1];
      // 修改dataItem后，同步最新path
      path[path.length - 1] = code;
    }

    if (control.parentKey) {
      control.key = code;
    } else {
      //标签页控件中基础组件属性设置
      if (path && control.path && control.path.length) {
        // 当前组件的父组件为tab时，需更新tab内维护的组件code
        if (
          path.length > 2 &&
          path[path.length - 2].includes('tab') &&
          path[path.length - 3].includes('tabs')
        ) {
          // 找父级tab
          const findParentTab = (target, tabsKey, tabKey) =>
            target[tabsKey].panels.find((panel) => panel.key === tabKey)
              .controls;
          let index = 0;
          let tabs: any = this.controls;
          while (index < path.length - 3) {
            tabs = findParentTab(tabs, path[index], path[index + 1]);
            index += 2;
          }
          // 被修改组件的直接父panel
          const panel = tabs[path[path.length - 3]].panels.find(
            (panel) => panel.key === path[path.length - 2],
          );
          // 更新layout
          const [rowIndex, colIndex] = ControlFactory.findIndexFromGrid(
            panel.layout,
            oldPath,
          );
          const row = panel.layout[rowIndex];
          row.splice(colIndex, 1, code);
          panel.layout.splice(rowIndex, 1, row);
          // 更新controls
          const controls = panel.controls;
          const oldControl = Object.assign({}, controls[oldPath], {
            key: code,
          });
          this.$delete(controls, oldPath);
          controls[code] = oldControl;
        }
      } else {
        const [rowIndex, colIndex] = this.findIndex(control.key);
        if (rowIndex !== -1 && colIndex !== -1) {
          this.$delete(this.controls, control.key);
          control.key = code;
          this.$set(this.controls, code, control);
          // this.designer.replace(row, col, code);
          const row = this.layout[rowIndex];
          row.splice(colIndex, 1, code);
          this.layout.splice(rowIndex, 1, row);
        }
      }
    }

    return true;
  }

  findIndex(controlKey: string): [number, number] {
    return ControlFactory.findIndexFromGrid(this.layout, controlKey);
  }

  onControlDelete(controlKey: string) {
    const control = this.controls[controlKey];
    if (!control) {
      return;
    }

    delete this.controls[controlKey];
    if (control.key === '.') {
      return;
    }

    this.onControlSelect();

    this.cleanControlFormulaBy(this.controls, control);

    if (!ControlFactory.notDataItemOf(control.type)) {
      this.switchDataitemUsed(controlKey);

      if (control.type === FormControlType.Sheet) {
        const item = this.findDataItem(controlKey);
        if (item && item.properties) {
          item.properties.forEach((p) => {
            this.switchDataitemUsed(controlKey, p.code);
          });
        }
      }

      this.onDataitemDelete(control.key, control.parentKey);
    }
    this.setShowDragTips('delete');
  }

  cleanControlFormulaBy(controls: any, control: FormControl) {
    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
        const c = controls[key];
        const opts = c.options;
        if (!opts) {
          continue;
        }

        const text = control.parentKey
          ? `{${control.parentKey}.${control.key}}`
          : `{${control.key}}`;

        if (opts.displayFormula && opts.displayFormula.indexOf(text) > -1) {
          opts.displayFormula = '';
        }
        // 兼容 必填条件变成布尔值处理
        if (opts.requiredFormula && typeof opts.requiredFormula === 'boolean') {
          opts.requiredFormula = `${opts.requiredFormula}`;
        }

        if (opts.requiredFormula && opts.requiredFormula.indexOf(text) > -1) {
          opts.requiredFormula = '';
        }

        if (opts.computeFormula && opts.computeFormula.indexOf(text) > -1) {
          opts.computeFormula = '';
        }
        if (opts.verifyFormula && ~opts.verifyFormula.indexOf(control.key)) {
          opts.verifyFormula = '';
        }
      }
    }
  }

  // 设置控件是否已经使用过
  setDataitemUsed(used: boolean, code: string, subCode?: string) {
    dataitemStore.setUsed(this, used, code, subCode);
  }

  // 修改控件的使用状态
  switchDataitemUsed(code: string, subCode?: string) {
    dataitemStore.switchUsed(this, code, subCode);
  }

  get items() {
    return dataitemStore.getDataItems(this);
  }

  reload(value?: boolean, value2?: boolean) {
    this.clean();
    this.load(value, value2);
  }

  clean() {
    // this.viewType = "web";
    this.clearTempDataItem();
    this.formData = {};
    this.controls = {};
    this.layout = [];
    this.actions = [];
    this.elements = [];
    this.publishDesc = '';
    this.selectedControl = {};
    dataitemStore.unregister(this);
  }

  clearTempDataItem() {
    this.dataItemAdds = {};
    this.dataItemDeletes = [];
  }

  load(value?: boolean, value2?: boolean) {
    if (!this.listVisible) {
      this.hideLoader = (this.$message as any).loading();
    } else {
      this.hideLoader = true;
    }
    dataitemStore
      .init(this)
      .then(() => this.getFormRuleList())
      .then(() => this.loadForm(value, value2))
      .then(
        () => {
          this.runHideLoader();
        },
        (res) => {
          this.runHideLoader();
          if (res) {
            this.$message.error(res.errmsg);
          }
        },
      );
  }

  /**
   * 加载表单
   */
  loadForm(value?: boolean, value2?: boolean) {
    const sheetCode = this.$route.params.sheetCode;
    const schemaCode = this.bizSchemaCode;

    if (!sheetCode || !schemaCode) {
      return Promise.reject(new Error('缺少参数'));
    }

    const _this = this;
    return formApi.get(schemaCode, sheetCode).then((res: any) => {
      // 过滤留痕已被删除数据源
      this.filterDelTrackData(res);

      if (res.data && res.data.options) {
        const DatacustomButtons = JSON.parse(res.data.options);
        if (DatacustomButtons.customButtonJson) {
          this.setDatacustomButton(DatacustomButtons.customButtonJson);
        }
      }

      //由于表单属性越来越多，从表单布局开始的表单属性以JSON形式存在options中
      this.parseJsonFormAttr(res.data);

      _this.formData = res.data;
      _this.formDataBeta = JSON.parse(JSON.stringify(res.data));
      _this.isDraft = !!res.data.existDraft;
      _this.isPublished = !!res.data.published;
      _this.setFormSystemVersion(res.data.formSystemVersion);

      // store存储当前表单的版本
      if (res.data) {
        this.setCurrentVersion(res.data.version);
        if (res.data.draftSchemaOptionsJson) {
          this.draftSchemaOptions = JSON.parse(res.data.draftSchemaOptionsJson);
        }
      }

      if (_this.formData.sheetType) {
        _this.$message.error('无法打开自定义表单');
        return Promise.reject(new Error('无法打开自定义表单'));
      }

      if (
        (!res.data.draftAttributesJson ||
          res.data.draftAttributesJson === '{}') &&
        !res.data.publishedAttributesJson
      ) {
        this.autoLayout();
      } else {
        this.initLayout();
      }
      this.setDataitemUesdFor(this.controls, true);
      return res;
    });
  }

  // 过滤留痕已被删除数据源
  filterDelTrackData(res: any) {
    const track: any = res.data.trackDataCodes
      ? res.data.trackDataCodes.split(';')
      : [];
    const result: Array<any> = [];
    this.items.forEach((element: any, idx: any) => {
      const code = element.code;
      track.forEach((track: any) => {
        if (track.indexOf('.') < 0) {
          if (code === track) {
            result.push(track);
          }
        } else {
          if (element.type === 8) {
            const codes = track.split('.')[1];
            for (const y of element.properties) {
              if (codes === y.code) {
                result.push(track);
              }
            }
          }
        }
      });
    });
    res.data.trackDataCodes = result ? result.join(';') : '';
  }

  // 处理关联表单历史数据显示字段问题
  syncRelevanceDisplayField(ctrl: any) {
    if (
      ctrl &&
      (ctrl.type === FormControlType.RelevanceForm ||
        ctrl.type === FormControlType.RelevanceFormEx)
    ) {
      ctrl = SynRelevanceFormDisplayField(ctrl, this.items);
    } else if (ctrl && ctrl.type === FormControlType.Sheet) {
      ctrl = SynSheetRelevanceFormDisplayField(ctrl, this.items);
    } else if (ctrl && ctrl.type === FormControlType.Tabs) {
      SynTabRelevanceFormDisplayField(ctrl, this.items);
    } else {
      //Else Empty block statement
    }
  }

  // 同步模型属性和规则
  synzModelRules(item, itemType) {
    if (itemType === FormControlType.Sheet) {
      this.synchronizationRules(item);
      for (const cl of item.columns) {
        this.synchronizationRules(cl, item.key);
      }
    } else if (itemType === FormControlType.Tabs) {
      const loop = [item];
      while (loop.length) {
        const loopItem = loop.shift();
        for (const lt of loopItem.panels) {
          const pnCtrlKeys = Object.keys(lt.controls);
          for (const pnCtrlKey of pnCtrlKeys) {
            const pnCtrl = lt.controls[pnCtrlKey];
            if (pnCtrl.type === FormControlType.Sheet) {
              this.synchronizationRules(pnCtrl);
              for (const cl of pnCtrl.columns) {
                this.synchronizationRules(cl, pnCtrl.key);
              }
            } else if (pnCtrl.type === FormControlType.Tabs) {
              loop.push(pnCtrl);
            } else {
              this.synchronizationRules(pnCtrl);
            }
          }
        }
      }
    } else {
      this.synchronizationRules(item);
    }
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

    localStorage.setItem('layoutType', this.formData.layoutType);

    const itemCodes = this.items.map((x) => x.code);

    const keys = Object.keys(controls);
    const deleteKeys: any = [];
    let tabDeleteKeys: any = [];

    for (const k of keys) {
      const item: any = controls[k];
      const itemType = item.type;

      // 处理关联表单历史数据显示字段问题；
      this.syncRelevanceDisplayField(item);

      // 描述说明去掉Tips属性,兼容历史已保存的数据
      if (item && itemType === FormControlType.Description) {
        delete item.options.tips;
      }

      // 从表单中移除审批意见控件
      if (itemType === FormControlType.ApprovalOpinion) {
        deleteKeys.push(k);
      } else if (itemType === FormControlType.Tabs) {
        const delKey = this.lostTabDataItem(controls[k]);
        tabDeleteKeys = [...tabDeleteKeys, ...delKey];
      } else if (
        !ControlFactory.notDataItemOf(itemType) &&
        !~itemCodes.indexOf(k)
      ) {
        deleteKeys.push(k);
      } else {
        //Else Empty block statement
      }

      // 同步模型属性和规则
      this.synzModelRules(item, itemType);
    }

    for (const row of layout) {
      for (const key of row) {
        if (keys.indexOf(key) === -1) {
          deleteKeys.push(key);
        }
      }
    }

    for (const key of deleteKeys) {
      if (controls[key]) {
        this.cleanControlFormulaBy(controls, controls[key]);
      }
    }

    this.removeControlOf(deleteKeys, controls, layout);
    this.removeTabControlOf(tabDeleteKeys, controls);

    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
        const control = controls[key];
        // 保存，再发布的表单，需要转换
        if (
          [5, 6].includes(control.type) &&
          typeof control.options.options === 'object' &&
          control.options.options.checkedDictionary
        ) {
          control.options.options = control.options.options.useDictionariesData
            .map((el) => el.name)
            .join(';');
        }

        if (control.type === FormControlType.Sheet) {
          const item = this.items.find((x) => x.code === control.key);
          control.columns = control.columns.filter(
            (val) => val.code !== FormControlType.SystemOther,
          ); // 子表过滤 子表排序号
          if (item && item.properties) {
            const _deleteKeys = (control as FormSheet).columns
              .filter(
                (c) =>
                  !(item.properties as any).some((p: any) => p.code === c.key),
              )
              .map((c) => c.key);
            this.removeSheetControlOf(control, _deleteKeys);
          }
        }
      }
    }

    this.compatibleDateControls(controls); // 旧的最大最小值,兼容新的校验规则

    this.controls = ControlFactory.restoreOptions(controls);

    this.setControlsMarking(this.controls);

    //初始化时，旧数据兼容到最新版本
    this.formData.draftAttributesJson = JSON.stringify(this.controls);

    this.layout = layout;
    this.onControlSelect(this.selectedControl.control);
  }

  synchronismData() {
    this.reload(true);
  }

  // 用数据模型同步更新表单控件
  synchronizationRules(item: any, parentKey = null, isAdd = false) {
    const type = ControlHelper.mapToDataItemType(item.type);
    const controls: any = this.getControlsByDataItemType(type);
    const source: any = controls.find((x) => x.code === item.key);

    // 短文本去重
    if (type === DataItemType.ShortText) {
      if (source && source.noRepeat) {
        item.options.noRepeat = source.noRepeat;
      }
    }
    // 关联控件
    if (
      [DataItemType.RelevanceForm, DataItemType.RelevanceFormEx].includes(type)
    ) {
      if (source && source.relativeCode) {
        // 关联模型
        item.options.schemaCode = source.relativeCode;
      }
      if (source && source.relativePropertyCode) {
        // 显示字段
        item.options.displayField = source.relativePropertyCode;
      }
    }

    const attrList = this.getModelAttrsList(item);
    const ruleList = this.getModelRulesList(item);
    const rules: any[] = this.formRuleList.filter(
      (x) =>
        x.propertyCode === item.key &&
        (!item.parentKey || item.parentKey === x.schemaCode),
    );
    if (source) {
      const dataItem = this.findItemRecurse(this.items, item.key, parentKey);
      if (dataItem) {
        let draftSchemaOptions: any[] = [];
        let diff = -1;
        try {
          draftSchemaOptions = JSON.parse(this.formData.draftSchemaOptionsJson);
          if (Array.isArray(draftSchemaOptions)) {
            const findSchemaOptions = draftSchemaOptions.find(
              (x) => x.code === item.key,
            );
            if (findSchemaOptions) {
              diff = moment(dataItem.modifiedTime).diff(
                moment(findSchemaOptions.lastModifyTime),
                'seconds',
              );
            } else {
              diff = 0;
            }
          }
        } catch (err) {
          console.log(err);
        }

        if (diff > 0) {
          setTimeout(
            () => this.setEditProperties([Object.assign({}, dataItem, item)]),
            15,
          );
        }

        // 同步数据项数据 覆盖表单数据
        if (dataItem.options) {
          try {
            const optionsObj: any = JSON.parse(dataItem.options);
            if (optionsObj) {
              if ([5, 6, 7, 19].includes(item.type)) {
                if (!this.isDraft && !isAdd) {
                  item.options['dictionariesData'] =
                    /^(\{).*(\})$/.test(optionsObj['options']) &&
                    optionsObj['options'].indexOf('useDictionariesData') > -1
                      ? optionsObj['options']
                      : '';

                  item.options['labels'] =
                    /^(\{).*(\})$/.test(optionsObj['options']) &&
                    optionsObj['options'].indexOf('schemaCode') > -1
                      ? optionsObj['options']
                      : '';

                  item.options['options'] =
                    optionsObj['options'] || optionsObj['labels'];
                }
              } else if (item.key === 'sequenceNo') {
                item.options['seqNoSetting'] =
                  this.isDraft && dataItem.published && !isAdd
                    ? item.options['seqNoSetting'] ||
                      this.getSeqNoSettingConfig(item.options)
                    : optionsObj['seqNoSetting'] ||
                      this.getSeqNoSettingConfig(optionsObj);
                delete item.options['resetDate'];
                delete item.options['prefix'];
                delete item.options['maxLength'];
                delete item.options['delimiter'];
              } else {
                attrList.forEach((x) => {
                  if (x.key === 'format') {
                    if (
                      CompareVersion(this.version, this.formSystemVersion) === 1
                    ) {
                      item.options['format1'] =
                        this.isDraft && dataItem.published && !isAdd
                          ? item.options['format1']
                          : optionsObj[x.key];
                    }
                  }

                  if (x.key === 'queryCode') {
                    item.options[x.key] =
                      this.isDraft && dataItem.published && !isAdd
                        ? item.options[x.key] || item.options['schemaCode']
                        : optionsObj[x.key] ||
                          optionsObj['schemaCode'] ||
                          dataItem['relativeCode'] ||
                          item.options[x.key];
                  } else if (x.key === 'linkMode') {
                    item.options[x.key] =
                      this.isDraft && dataItem.published && !isAdd
                        ? item.options[x.key]
                        : optionsObj[x.key] + '' === 'true'
                        ? true
                        : false;
                  } else {
                    item.options[x.key] =
                      this.isDraft && dataItem.published && !isAdd
                        ? item.options[x.key]
                        : optionsObj[x.key] || item.options[x.key];
                  }
                });
              }
            } else {
              attrList.forEach((x) => {
                item.options[x.key] = '';
              });
            }
          } catch (err) {
            attrList.forEach((x) => {
              item.options[x.key] = '';
            });
          }
        } else {
          // 历史数据兼容
          attrList.forEach((x) => {
            if (x === 'format' && item.options[x.key]) {
              item.options['format1'] = item.options[x.key];
              if (item.type === FormControlType.Number) {
                item.options[x.key] = NumberFormatType.Int;
              } else if (item.type === FormControlType.Date) {
                item.options[x.key] = 'YYYY-MM-DD';
              } else {
                //Else Empty block statement
              }
            }
          });
        }
        if (!this.isDraft) {
          // 同步数据模型配置的规则
          ruleList.forEach((x) => {
            // 先清除原有规则（存在大json中的规则）, 再同步数据模型配置的规则
            if (item.options) {
              item.options[x.key] = x.value;
            }
            const findItem: any = rules.find(
              (rule) => rule.options && rule.options.indexOf(x.key) > -1,
            );
            if (findItem && findItem.options) {
              try {
                const ruleOption: any = JSON.parse(findItem.options);
                if (ruleOption) {
                  item.options[x.key] =
                    this.isDraft && dataItem.published && !isAdd
                      ? item.options[x.key]
                      : ruleOption[x.key];
                } else {
                  item.options[x.key] = '';
                }
              } catch (err) {
                item.options[x.key] = '';
              }
            } else {
              if (
                (diff === -1 && x.key === 'noRepeat') ||
                x.key === 'isEmptyRow'
              ) {
                item.options[x.key] = false;
              } else {
                item.options[x.key] = item.options[x.key]
                  ? item.options[x.key]
                  : '';
              }
            }
          });
        } else {
          if (diff === 0) {
            this.synchronizationRulesDataOthers(source, item);
          }
        }
      }
    }
  }

  // 新增时从控件中获取值同步更新到数据模型
  synchronizationRulesDataAdd(item: any, control: any) {
    const obj = Object.create(null);
    if (control) {
      const optionObj = control.options;
      if (optionObj) {
        const attrList = this.getModelAttrsList(item);
        const ruleList = this.getModelRulesList(item);
        attrList.forEach((x) => {
          if (optionObj[x.key]) {
            obj[x.key] = optionObj[x.key];
          }
        });
        if (Object.keys(obj).length > 0) {
          item.options = JSON.stringify(obj);
        }

        if (
          control &&
          [5, 6, 7, 19].includes(control.type) &&
          control.options
        ) {
          if (
            (control.options.labels &&
              control.options.labels.indexOf('schemaCode') > -1) ||
            (control.options.options &&
              control.options.options.indexOf('schemaCode') > -1)
          ) {
            const option: any = {
              defaultValue: '',
              options: control.options.labels || control.options.options,
            };
            item.options = JSON.stringify(option);
          }

          if (
            control.options.dictionariesData &&
            control.options.dictionariesData.indexOf('checkedDictionary') > -1
          ) {
            const option: any = {
              defaultValue: '',
              options: control.options.dictionariesData,
            };
            item.options = JSON.stringify(option);
          }
        }
        ruleList.forEach((x) => {
          if (optionObj[x.key]) {
            this.onModelAttrRuleUpdate({
              type: 'modelRuleColumns',
              key: item.code,
              field: x.key,
              parentKey: item.parentCode,
              value: optionObj[x.key],
            });
          }
        });
      }
    }
  }

  // 编辑时从控件从控件中获取值同步更新到数据模型 主要是构造bizDataRuleAdds、editProperties、deleteBizDataRuleIds参数
  synchronizationRulesDataOthers(item: any, control: any) {
    const attrList = this.getModelAttrsList(item);
    const ruleList = this.getModelRulesList(item);
    const controlOptions = control.options;

    attrList.forEach((x) => {
      this.onModelAttrRuleUpdate({
        type: 'modelAttributeColumns',
        key: item.code,
        field: x.key,
        parentKey: item.parentCode ? item.parentCode : '',
        value: controlOptions[x.key],
      });
    });

    ruleList.forEach((x) => {
      this.onModelAttrRuleUpdate({
        type: 'modelRuleColumns',
        key: item.code,
        field: x.key,
        parentKey: item.parentCode ? item.parentCode : '',
        value: controlOptions[x.key],
      });
    });
  }

  // 根据数据类型获取控件
  getControlsByDataItemType(type: DataItemType) {
    const typeControls: Array<any> = [];
    this.items.forEach((item: any) => {
      if (item.type === type) {
        typeControls.push(item);
      } else if (item.type === DataItemType.Sheet) {
        if (Array.isArray(item.properties)) {
          const list: Array<any> = item.properties.filter(
            (i: any) => i.type === type,
          );
          typeControls.push(...list);
        }
      } else {
        //Else Empty block statement
      }
    });
    return typeControls;
  }

  // 收集tab中已经删除的数据项
  lostTabDataItem(tabItem: any) {
    const pannels = tabItem.panels;
    let delItem: any = [];
    const itemCodes = this.items.map((x) => x.code);
    for (const pannel of pannels) {
      const ctrls = pannel.controls;
      const layout = pannel.layout;
      for (const ctrlKey of Object.keys(ctrls)) {
        const ctrl = ctrls[ctrlKey];
        switch (ctrl.type) {
          case FormControlType.ApprovalOpinion:
            delItem.push({ ctrl: ctrls, key: ctrlKey });
            break;
          case FormControlType.Tabs:
            const dItem = this.lostTabDataItem(ctrl);
            delItem = [...delItem, ...dItem];
            break;
          case FormControlType.Sheet:
            const theSheet: any = this.items.find((it) => it.code === ctrl.key);
            if (theSheet) {
              const sheetItems = theSheet.properties.map((x) => x.code);
              ctrl.columns.forEach((res) => {
                if (!sheetItems.includes(res.key)) {
                  delItem.push({ ctrl: ctrls, key: `${ctrl.key}.${res.key}` });
                }
              });
              break;
            }
            break;
          default:
            if (
              !ControlFactory.notDataItemOf(ctrl.type) &&
              !~itemCodes.indexOf(ctrl.key)
            ) {
              delItem.push({ ctrl: ctrls, key: ctrlKey });
              let p = -1;
              let c = -1;
              for (let i1 = 0, l1 = layout.length; i1 < l1; i1++) {
                let isBreak = false;
                for (let i2 = 0, l2 = layout[i1].length; i2 < l2; i2++) {
                  const k = layout[i1][i2];
                  if (k === ctrlKey) {
                    p = i1;
                    c = i2;
                    isBreak = true;
                    break;
                  }
                }
                if (isBreak) {
                  break;
                }
              }
              // 删除 layout中的 控制key
              if (~p && ~c) {
                if (pannel.layout[p].length === 1) {
                  pannel.layout.splice(p, 1);
                } else {
                  pannel.layout[p].splice(c, 1);
                }
              }
            }
        }
      }
    }
    return delItem;
  }

  // 删除tab中的控制器
  removeTabControlOf(tabDeleteKeys, controls) {
    for (const keys of tabDeleteKeys) {
      const { ctrl, key } = keys;
      if (key.indexOf('.') > -1) {
        const keyArr = key.split('.');
        ctrl[keyArr[0]].columns = ctrl[keyArr[0]].columns.filter((res) => {
          return res.key !== keyArr[1];
        });
      } else {
        delete ctrl[key];
      }
    }
  }

  // 兼容 日期控件 旧的 大小值 和 新的校验规则
  // 如果 旧数据 maxDate 和 minDate数据类型不同(一个是固定值,一个是数据项)则在新的校验规则弹框不做处理
  compatibleDateControls(ctr) {
    if (!ctr) {
      return;
    }
    for (const key of Object.keys(ctr)) {
      const val = ctr[key];
      if (val.type === DataItemType.Date) {
        const opt = val.options;
        if (opt.maxDate || opt.minDate) {
          let arr: string[] = [];
          if (opt.maxDate && opt.minDate) {
            if (~opt.maxDate.indexOf('{') && ~opt.minDate.indexOf('{')) {
              // max min 都是数据项
              const maxDateKey = opt.maxDate.replace(/^({|})$/g, '');
              const minDateKey = opt.minDate.replace(/^({|})$/g, '');
              if (ctr[maxDateKey] && ctr[minDateKey]) {
                arr = [
                  `type:2`,
                  `rule:~`,
                  `lSelect:${minDateKey}`,
                  `rSelect:${maxDateKey}`,
                  `day:0`,
                  `defaultPrompt:${opt.name}必须介于${ctr[minDateKey].options.name}~${ctr[maxDateKey].options.name}`,
                ];
              }
            } else if (
              !~opt.maxDate.indexOf('{') &&
              !~opt.minDate.indexOf('{')
            ) {
              // max min 都是字符串
              arr = [
                `type:1`,
                `rule:~`,
                `lDate:${opt.minDate}`,
                `rDate:${opt.maxDate}`,
                `defaultPrompt:${opt.name}必须介于${opt.minDate}~${opt.maxDate}`,
              ];
            } else {
              //Else Empty block statement
            }
          } else if (opt.maxDate && !opt.minDate) {
            if (~opt.maxDate.indexOf('{')) {
              // max 是数据项
              const maxDateKey = opt.maxDate.replace(/^({|})$/g, '');
              if (ctr[maxDateKey]) {
                arr = [
                  `type:2`,
                  `rule:<=`,
                  `select:${opt.maxDate.replace(/^({|})$/g, '')}`,
                  `day:0`,
                  `defaultPrompt:${opt.name}必须小于等于${ctr[maxDateKey].options.name}`,
                ];
              }
            } else {
              // max 是字符串
              arr = [
                `type:1`,
                `rule:<=`,
                `date:${opt.maxDate}`,
                `defaultPrompt:${opt.name}必须小于等于${opt.maxDate}`,
              ];
            }
          } else if (!opt.maxDate && opt.minDate) {
            if (~opt.minDate.indexOf('{')) {
              // min 是数据项
              const minDateKey = opt.minDate.replace(/^({|})$/g, '');
              if (minDateKey) {
                arr = [
                  `type:2`,
                  `rule:>=`,
                  `select:${opt.minDate.replace(/^({|})$/g, '')}`,
                  `day:0`,
                  `defaultPrompt:${opt.name}必须大于等于${ctr[minDateKey].options.name}`,
                ];
              }
            } else {
              // min 是字符串
              arr = [
                `type:1`,
                `rule:>=`,
                `date:${opt.minDate}`,
                `defaultPrompt:${opt.name}必须大于等于${opt.minDate}`,
              ];
            }
          } else {
            //Else Empty block statement
          }
          const obj = {};
          for (const item of arr) {
            const [k, v] = item.split(':');
            obj[k] = v;
          }
          opt.verifyFormula = JSON.stringify(obj);
          opt.maxDate = '';
          opt.minDate = '';
        }
      }
    }
  }

  /**
   * 移除
   */
  removeSheetControlOf(control: FormSheet, deleteKeys: string[]) {
    const idxs = control.columns
      .map((c, i) => (deleteKeys.indexOf(c.key) > -1 ? i : -1))
      .filter((i) => i > -1)
      .reverse();

    idxs.forEach((i) => {
      const c = control.columns.splice(i, 1)[0];
      if (c.type === FormControlType.Number && control.statistics) {
        const idx = control.statistics.findIndex((s) => s.columnKey === c.key);
        control.statistics.splice(idx, 1);
      }
    });
  }

  /**
   * 移除表单控件
   */
  removeControlOf(
    deleteKeys: string[],
    controls: any,
    layout: Array<string[]>,
  ) {
    deleteKeys.forEach((k) => {
      delete controls[k];
    });

    for (const row of layout) {
      if (typeof row[0] === 'string') {
        const idxs = row
          .map((x, i) => (deleteKeys.indexOf(x) > -1 ? i : -1))
          .filter((i) => i > -1)
          .reverse();
        if (idxs.length > 0) {
          idxs.forEach((i) => row.splice(i, 1));
        }
      }
    }

    const idxs = layout
      .map((x, i) => (x.length === 0 ? i : -1))
      .filter((i) => i > -1)
      .reverse();

    if (idxs.length > 0) {
      idxs.forEach((i) => layout.splice(i, 1));
    }
  }

  /**
   * 自动布局
   */
  autoLayout() {
    const items = this.items.filter(
      (x) => x.published || x.isSystem || x.code === 'parentId',
    );
    const bizItems = this.items.filter((x) => !x.isSystem);
    if (bizItems.length === 0) {
      this.showDragTips = true;
    }
    if (items.length === 0) {
      return;
    }

    const [controls, layout] = ControlFactory.autoLayout(this.formData, items);

    this.controls = controls;
    this.layout = layout;
    Object.keys(this.controls).forEach((key) => {
      this.controls[key].options.span = undefined;
    });
    this.autoLayoutRow(layout);

    const itemCodes = this.items.map((x) => x.code);

    const keys = Object.keys(controls);
    const deleteKeys: any = [];
    let tabDeleteKeys: any = [];
    for (const k of keys) {
      const ct = controls[k].type;
      // 从表单中移除审批意见控件
      if (ct === FormControlType.ApprovalOpinion) {
        deleteKeys.push(k);
      } else if (ct === FormControlType.Tabs) {
        const delKey = this.lostTabDataItem(controls[k]);
        tabDeleteKeys = [...tabDeleteKeys, ...delKey];
      } else if (!ControlFactory.notDataItemOf(ct) && !~itemCodes.indexOf(k)) {
        deleteKeys.push(k);
      } else {
        //Else Empty block statement
      }

      // 数据模型中部分属性与规则兼容
      const item = controls[k] as any;
      if (item.type === FormControlType.Sheet) {
        this.synchronizationRules(item);
        for (const cl of item.columns) {
          this.synchronizationRules(cl, item.key);
        }
      } else if (item.type === FormControlType.Tabs) {
        const loop = [item];
        while (loop.length) {
          const loopItem = loop.shift();
          for (const lt of loopItem.panels) {
            const pnCtrlKeys = Object.keys(lt.controls);
            for (const pnCtrlKey of pnCtrlKeys) {
              const pnCtrl = lt.controls[pnCtrlKey];
              if (pnCtrl.type === FormControlType.Sheet) {
                this.synchronizationRules(pnCtrl);
                for (const cl of pnCtrl.columns) {
                  this.synchronizationRules(cl, pnCtrl.key);
                }
              } else if (pnCtrl.type === FormControlType.Tabs) {
                loop.push(pnCtrl);
              } else {
                this.synchronizationRules(pnCtrl);
              }
            }
          }
        }
      } else {
        this.synchronizationRules(item);
      }
    }
  }

  /**
   * 设置提示控件显示
   */
  setShowDragTips(type: string) {
    if (type === 'add') {
      this.showDragTips = false;
    } else {
      if (Object.keys(this.controls).length === 1) {
        this.showDragTips = true;
      }
    }
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

  /**
   * 预览
   */
  preview() {
    const controls = JSON.parse(JSON.stringify(this.controls));
    const layout = JSON.parse(
      JSON.stringify((this.$refs.designer as Designer).getLayout()),
    );

    this.viewData = {
      controls,
      layout,
      layoutType: this.formData.layoutType
        ? this.formData.layoutType
        : 'horizontal',
      borderMode: this.formData.borderMode ? this.formData.borderMode : 'close',
    };
    this.showPreview = true;
  }

  hidePreview() {
    this.showPreview = false;
  }

  newTemplateExport() {
    return new TemplateExport({
      configure: JSON.parse(JSON.stringify(this.controls)),
      layout: JSON.parse(JSON.stringify(this.layout)),
    });
  }

  /**
   * 导出
   */
  exportForm() {
    this.newTemplateExport().getHTMLFile();
  }

  RelevanceFormsError: any[] = []; // 未选择业务模型

  DispalyModeListError: any[] = []; // 未选择查询列表

  FieldCodeError: any[] = []; //未选择关联字段

  MaxLengthError: any[] = []; //未设置最大长度

  /**
   * 发布
   */
  async publish() {
    try {
      await this.parseHTML();
    } catch {
      // 如果有错误停留在编辑器界面
      return;
    }

    this.RelevanceFormsError = []; // 未选择业务模型
    this.DispalyModeListError = []; // 未选择查询列表
    this.FieldCodeError = []; //未选择关联字段

    this.MaxLengthError = []; //未设置最大长度

    this.publicCheck(this.controls);

    let res = '';
    if (this.RelevanceFormsError.length) {
      res +=
        this.RelevanceFormsError.map((el) => `【${el}】`).join('') +
        '未选择业务模型';
    }
    if (this.DispalyModeListError.length) {
      res +=
        this.DispalyModeListError.map((el) => `【${el}】`).join('') +
        '未选择查询列表';
    }
    if (this.FieldCodeError.length) {
      res +=
        this.FieldCodeError.map((el) => `【${el}】`).join('') +
        '未选择关联字段';
    }
    if (this.MaxLengthError.length) {
      res +=
        this.MaxLengthError.map((el) => `【${el}】`).join('') +
        '未设置最大长度';
    }

    if (res) {
      this.$message.error(res);
      return;
    }
    const controls = this.controls;
    Object.values(controls).forEach((item) => {
      const options = item.options;
      const dataItem = this.dataItemList.find((ele) => {
        return ele.code === item.key;
      });
      if (dataItem && dataItem.propertyEmpty && !options.requiredFormula) {
        options.requiredFormula = String(dataItem.propertyEmpty);
      }

      // 处理字典数据
      if (
        options &&
        options.dictionariesData &&
        ![FormControlType.Dropdown, FormControlType.DropdownMulti].includes(
          item.type,
        )
      ) {
        const dictionariesData =
          typeof options.dictionariesData === 'string'
            ? JSON.parse(options.dictionariesData).useDictionariesData
            : options.dictionariesData.useDictionariesData;
        const useOptions =
          typeof options.options === 'string'
            ? options.options.split(';')
            : options.options.useDictionariesData;
        if (
          dictionariesData.length !== useOptions.length ||
          !dictionariesData.every((el) => useOptions.includes(el.name))
        ) {
          item.options.dictionariesData = '';
        }
      }
      // 数值和时间、创建时间、修改时间控件显示格式开启了同步默认值
      if ([3, 4, 104, 105].includes(item.type) && options.syncFormate) {
        options.format1 = options.format;
      }
    });

    if (controls.parentId && controls.parentId.key === 'parentId') {
      controls.parentId.options.showStyle = 'tree';
    }
    this.formData.publishedAttributesJson = JSON.stringify(controls);

    const layout = (this.$refs.designer as Designer).getLayout();
    this.formData.publishedViewJson = JSON.stringify(layout);

    this.formData.draftAttributesJson = this.formData.publishedAttributesJson;
    this.formData.draftViewJson = this.formData.publishedViewJson;
    this.formData.tempAuthSchemaCodes = this.setTempAuthSchemaCodes();

    if (this.actions) {
      this.formData.draftActionsJson = this.formData.publishedActionsJson =
        JSON.stringify(this.actions);
    }

    if (this.elements) {
      this.formData.draftHtmlJson = this.formData.publishedHtmlJson =
        JSON.stringify(this.elements);
    }

    const versionChangedMsg = this.$t('languages.versionChanged').toString();

    // 在发布之前调用checkVersion接口
    appsApi
      .checkVersion({
        schemaCode: this.bizSchemaCode,
        sheetCode: this.$route.params.sheetCode,
        version: this.getCurrentVersion,
      })
      .then((res: any) => {
        if (res.errcode === 0) {
          let v: any = parseInt(res.data, 10);
          if (isNaN(v)) {
            v = 0;
          }
          let cv: any = parseInt(this.getCurrentVersion, 10);
          if (isNaN(cv)) {
            cv = 0;
          }
          if (v > cv) {
            this.$message.info(versionChangedMsg.replace('$', v));
          }
        } else {
          // checkVersion接口 失败不做任何操作
          console.log(res.errmsg);
        }
      })
      .catch((err: any) => {
        console.log(err);
      });

    this.updateFormData(this.formData);

    this.isShowPublishModal = true;
  }

  // 发布前检测是否存在错误
  publicCheck(controls) {
    const keys = Object.keys(controls);
    for (const key of keys) {
      const control = controls[key];
      switch (control.type) {
        case FormControlType.Text:
        case FormControlType.Textarea:
          // 最大长度错误
          if (!control.options.maxLength) {
            this.MaxLengthError.push(
              (control && control.options && control.options.name) || '',
            );
          }
          break;
        case FormControlType.RelevanceForm:
        case FormControlType.RelevanceFormEx:
          // 关联模型未选
          if (!control.options.schemaCode) {
            this.RelevanceFormsError.push(
              (control && control.options && control.options.name) || '',
            );
          }
          break;
        case FormControlType.ReverseRelevance:
          const opts = control.options as ReverseRelevanceOptions;
          // 关联模型未选
          if (!opts.schemaCode) {
            this.RelevanceFormsError.push(
              (control && control.options && control.options.name) || '',
            );
          }

          // 关联字段未选
          if (!opts.fieldCode) {
            this.FieldCodeError.push(
              (control && control.options && control.options.name) || '',
            );
          }

          // 渲染类型未选
          if (opts.displayMode === DispalyMode.List && !opts.listCode) {
            this.DispalyModeListError.push(
              (control && control.options && control.options.name) || '',
            );
          }
          break;
        case FormControlType.Sheet:
          const sheet = control as FormSheet;
          for (const col of sheet.columns) {
            if (
              col.type === FormControlType.RelevanceForm ||
              col.type === FormControlType.RelevanceFormEx
            ) {
              if (!col.options.schemaCode) {
                this.RelevanceFormsError.push(
                  control &&
                    control.options &&
                    control.options.name &&
                    col.options &&
                    col.options.name
                    ? `${control.options.name}-${col.options.name}`
                    : '',
                );
              }
            } else if (
              col.type === FormControlType.Text ||
              col.type === FormControlType.Textarea
            ) {
              if (!col.options.maxLength) {
                this.MaxLengthError.push(
                  control &&
                    control.options &&
                    control.options.name &&
                    col.options &&
                    col.options.name
                    ? `${control.options.name}-${col.options.name}`
                    : '',
                );
              }
            } else {
              //Else Empty block statement
            }
          }
          break;
        case FormControlType.Tabs:
          const tabs = control as FormTabs;
          tabs.panels.forEach((panel: any) => {
            this.publicCheck(panel.controls);
          });
          break;

        default:
          break;
      }
    }
  }

  // 调用发布接口
  postPublish() {
    if (this.isPublishClick) {
      return;
    }
    this.isPublishClick = true;
    if (this.publishDesc.trim() === '') {
      this.$message.error('请填写发布说明');
      this.isPublishClick = false;
      return;
    }
    const msg = this.$t('languages.PublishSuccess').toString();
    this.updateForm(true, msg)
      .then(() => {
        this.getFormRuleList();
        this.bizDataRuleAdds = [];
        this.deleteBizDataRuleIds = [];
        this.editProperties = [];
        this.clearLocalHistory();
        this.isShowPublishModal = false;
        /* 1.模拟鼠标点击选中控件 2.给选中控件的状态设置为已发布 */
        if (this.selectedControl['dataItem']) {
          this.onControlSelect((this.selectedControl as any).control);
          this.selectedControl['dataItem'].published = true;
        }
        /* 刷新右侧表单属性 */
        (this.$refs.formAttributeLayout as any).initData();
        this.isPublishClick = false;

        EventBus.$emit('published', {
          bizSchemaCode: this.bizSchemaCode,
        });
      })
      .catch((err) => {
        this.isShowPublishModal = false;
        this.isPublishClick = false;
        console.log(err);
      });
  }

  /**
   * 清理本地缓存的tip信息
   */
  clearLocalHistory() {
    const transferOpRecord: any =
      window.localStorage.getItem('transferOpRecord');
    if (transferOpRecord) {
      const userStr = window.sessionStorage.getItem('user');
      if (userStr) {
        const user: any = JSON.parse(userStr);
        const transferOpObj: any = JSON.parse(transferOpRecord);
        if (transferOpObj && transferOpObj[user.id]) {
          const keyStr = `${this.bizSchemaCode}|${this.$route.params.sheetCode}`;
          if (transferOpObj[user.id].hasOwnProperty(keyStr)) {
            delete transferOpObj[user.id][keyStr];
          }
        }
        window.localStorage.setItem(
          'transferOpRecord',
          JSON.stringify(transferOpObj),
        );
      }
    }
  }

  /**
   * 还原
   */
  restore() {
    const _this = this;
    this.$confirm({
      title: this.$t('languages.Apps.FormDesignPage.RestoreTitle').toString(),
      content: this.$t(
        'languages.Apps.FormDesignPage.RestoreContent',
      ).toString(),
      okText: this.$t('languages.Apps.Ok').toString(),
      cancelText: this.$t('languages.Apps.Cancel').toString(),
      onOk() {
        _this.autoLayout();
        // _this.publish();
      },
    });
  }

  isSaveIng: boolean = false;

  async onSave(throwError = false) {
    if (this.isSaveIng) {
      return;
    }
    try {
      await this.parseHTML();
    } catch {
      if (throwError) {
        throw new Error();
      } else {
        // 如果有错误停留在编辑器界面
        return;
      }
    }
    this.isSaveIng = true;
    return this.save().then(() => {
      this.load(false, true);
      this.getDataItemList();
      this.isShowTips = true;

      setTimeout(() => {
        this.isSaveIng = false;
      }, 800);

      return;
    });
  }

  /**
   * 保存
   */
  save() {
    // const controls = ControlFactory.trimOptions(this.controls);
    const controls = this.controls;

    this.formData.tempAuthSchemaCodes = this.setTempAuthSchemaCodes();
    this.formData.draftAttributesJson = JSON.stringify(controls);
    this.formData.draftViewJson = JSON.stringify(
      (this.$refs.designer as Designer).getLayout(),
    );

    if (this.actions) {
      this.formData.draftActionsJson = JSON.stringify(this.actions);
    }

    if (this.elements) {
      this.formData.draftHtmlJson = JSON.stringify(this.elements);
    }

    const msg = this.$t('languages.SaveSuccess').toString();

    this.isPublishClick = false;

    this.updateFormData(this.formData);

    return this.updateForm(false, msg);
  }

  /**
   * 设置临时授权code
   */
  setTempAuthSchemaCodes(): string {
    const controls = this.controls;
    const relevanceForms: FormControl[] = [];
    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
        const ctrl = controls[key];
        if (
          (ctrl.type === FormControlType.RelevanceForm ||
            ctrl.type === FormControlType.RelevanceFormEx) &&
          ctrl.options.isAuthorize
        ) {
          relevanceForms.push(controls[key]);
        }

        if (ctrl.type === FormControlType.Sheet) {
          const columns = (ctrl as any).columns;
          columns.forEach((item) => {
            if (
              (item.type === FormControlType.RelevanceForm ||
                item.type === FormControlType.RelevanceFormEx) &&
              item.options.isAuthorize
            ) {
              relevanceForms.push(item);
            }
          });
        }
      }
    }
    return relevanceForms
      .map((res) => {
        return `${res.options.schemaCode}_${res.options.queryCode}`;
      })
      .join(',');
  }

  optionTypeChange(params) {
    let item: any = '';
    if (params.parentKey) {
      // @ts-ignore
      item = this.controls[params.parentKey].columns.find(
        (item: any) => item.key === params.key,
      );
    } else {
      item = this.controls[params.key];
    }
    item.optionsType = params.optionsType;
  }

  // 设置编辑属性
  setEditProperties(dataList) {
    for (const item of dataList) {
      const code = item.code;
      let controls: any = null;
      if (item.parentKey) {
        controls = this.controls[item.parentKey].columns.find(
          (el) => el.key === code,
        );
      } else {
        controls = this.controls[code];
      }
      if (!controls) {
        continue;
      }
      const _options = {};
      [
        'label',
        'defaultValue',
        'dictionaryData',
        'format',
        'options',
        'mappings',
        'schemaCode',
        'showStyle',
        'queryCode',
        'displayField',
        'mappings',
        'conditions',
        'linkMode',
        'searchFormula',
        'prefix',
        'maxLength',
        'resetDate',
        'delimiter',
        'seqNoSetting',
      ].forEach((attr) => {
        _options[attr] = controls.options[attr];
      });

      const theItem = {
        childProperty: item.childProperty,
        code: item.code,
        key: item.code,
        createdBy: item.createdBy,
        createdTime: item.createdTime,
        defaultProperty: item.defaultProperty,
        defaultValue: item.defaultValue,
        deleted: item.deleted,
        encryptOption: item.encryptOption,
        id: item.id,
        modifiedBy: item.modifiedBy,
        modifiedTime: item.modifiedTime,
        name: item.name,
        name_i18n: item.name_i18n,
        options: JSON.stringify(_options) || item.options,
        propertyEmpty: item.propertyEmpty,
        propertyIndex: item.propertyIndex,
        propertyLength: item.propertyLength,
        propertyType: item.propertyType,
        propertyTypeName: item.propertyTypeName,
        published: item.published,
        quoteCodes: item.quoteCodes,
        relativeCode: item.relativeCode,
        relativePropertyCode: item.relativePropertyCode,
        relativeQuoteCode: item.relativeQuoteCode,
        remarks: item.remarks,
        repeated: item.repeated,
        schemaCode: item.schemaCode,
        selectionJson: item.selectionJson,
        sortKey: item.sortKey,
        subSchema: item.subSchema,
      };

      if (item.parentKey) {
        for (const key in controls) {
          if (Object.prototype.hasOwnProperty.call(controls, key)) {
            controls[key] = item[key];
          }
        }
      } else {
        const item = this.editProperties.find((el) => el.id === theItem.id);
        if (item) {
          const index = this.editProperties.findIndex(
            (el) => el.id === theItem.id,
          );
          this.editProperties.splice(index, 1, theItem);
        } else {
          this.editProperties.unshift(theItem);
        }
      }
    }
  }

  /**
   * 发布或保存表单
   */
  updateForm(isPublish: boolean, msg: string) {
    const _this = this;
    const hideLoader = (this.$message as any).loading();
    const data = this.formData as any;
    if (data.editProperties && Array.isArray(data.editProperties)) {
      data.editProperties.length = 0;
    } else {
      data.editProperties = [];
    }
    const unPublishList = this.dataItemList.filter((item) => !item.published);

    if (isPublish) {
      this.dataItemList.forEach((el) => {
        if (el.propertyType === 8 && el.children) {
          el.children.forEach((item) => {
            if (!item.published) {
              const control = recursionSearch(this.controls, item.code);
              this.synchronizationRulesDataAdd(item, control);
            }
          });
        }
      });
    }

    // 保存时存在未发布数据项
    if (!isPublish && unPublishList.length) {
      this.setEditProperties(unPublishList);
    }
    if (!isPublish && this.editProperties.length) {
      this.editProperties.forEach((i: any) => {
        if (!i.published) {
          data.editProperties.push(i);
        }
      });
    }

    // 发布时存在未发布数据项
    if (isPublish && !this.isPublished) {
      this.setEditProperties(this.dataItemList);
    }

    if (this.publishDesc) {
      data.remarks = this.publishDesc;
    }

    if (this.dataItemDeletes.length) {
      data.deleteProperties = this.dataItemDeletes;
    }

    // 新增加的控件
    const addCodes = Object.keys(this.dataItemAdds);
    if (addCodes.length) {
      const schemaCode = this.bizSchemaCode;
      data.properties = addCodes.map((code) => {
        const item: any = this.dataItemAdds[code];
        const control = recursionSearch(this.controls, item.code);
        this.synchronizationRulesDataAdd(item, control);
        // @ts-ignore
        let option =
          typeof item.options === 'string'
            ? item.options
            : item.options
            ? JSON.stringify(item.options)
            : null;
        if (
          !option &&
          (item.formPropertyType === 5 || item.formPropertyType === 6) &&
          control.options &&
          control.options.options
        ) {
          option = { defaultValue: '', options: control.options.options };
          option = JSON.stringify(option);
        }
        if (!option && item.formPropertyType === 4 && control.options) {
          const opt = {
            dictionaryData: '',
            format: control.options.format,
          };
          option = JSON.stringify(opt);
        }
        const obj: any = {
          schemaCode,
          id: item.id,
          code: item.code,
          name: item.name,
          name_i18n: null,
          propertyType: item.type,
          propertyIndex: item.propertyIndex || false,
          propertyEmpty: item.propertyEmpty || false,
          relativeCode: item.relativeCode,
          relativePropertyCode: item.relativePropertyCode || '',
          options: option,
          subSchema: {
            properties: new Array<any>(),
          },
        };

        if (item.name_i18n) {
          if (typeof item.name_i18n === 'string') {
            obj.name_i18n = item.name_i18n;
          } else {
            obj.name_i18n = JSON.stringify(item.name_i18n);
          }
        }

        if (!item.properties) {
          return obj;
        }

        if (Array.isArray(item.properties)) {
          // 下拉多选新增赋值失败问题
          obj.subSchema.properties = item.properties
            .map((p: any) => {
              if (Array.isArray(control.columns) && !p.isSystem) {
                const subControl: any = control.columns.find((x) => {
                  return x.key === p.code;
                });
                this.synchronizationRulesDataAdd(p, subControl);

                const ob: any = {
                  schemaCode: p.parentCode,
                  id: p.id,
                  code: p.code,
                  name: p.name,
                  relativeCode: p.relativeCode,
                  propertyType: p.type,
                  propertyIndex: p.propertyIndex || false,
                  propertyEmpty: p.propertyEmpty || false,
                  relativePropertyCode: p.relativePropertyCode || '',
                  // @ts-ignore
                  options:
                    p.options ||
                    (subControl &&
                      subControl.options &&
                      JSON.stringify({
                        defaultValue: subControl.options.defaultValue,
                        options: subControl.options.options,
                      })) ||
                    '',
                };

                if (p.name_i18n) {
                  if (typeof p.name_i18n === 'string') {
                    ob.name_i18n = p.name_i18n;
                  } else {
                    ob.name_i18n = JSON.stringify(p.name_i18n);
                  }
                }
                return ob;
              }
            })
            .filter(Boolean) as any;
        }
        return obj;
      });
    } else {
      data.properties = [];
      // 将表单控件中的项同步更新到规则和属性中
    }

    if (isPublish && this.bizDataRuleAdds.length) {
      data.bizDataRuleModels = this.bizDataRuleAdds;
    }

    if (isPublish && this.deleteBizDataRuleIds.length) {
      data.deleteBizDataRuleIds = this.deleteBizDataRuleIds;
    }

    if (isPublish && this.editProperties.length) {
      data.editProperties = this.editProperties;
    }

    if (data.editProperties.length) {
      data.editProperties.forEach((el: any) => {
        if ([12, 13, 14, 15].includes(el.propertyType)) {
          let item: any = '';
          if (
            el.key.indexOf('-') &&
            el.key.split('-')[0] === el.schemaCode &&
            this.controls[el.schemaCode]
          ) {
            // @ts-ignore
            item = this.controls[el.schemaCode].columns.find(
              (item: any) => item.key === el.code,
            );
          } else {
            item = this.controls[el.key];
          }

          if (item && item.optionsType === 'model') {
            el.options = item.options.labels
              ? JSON.stringify({
                  defaultValue: '',
                  labels: item.options.labels,
                })
              : el.options;
          } else if (item && item.optionsType === 'dictionary') {
            el.options = item.options.dictionariesData
              ? JSON.stringify({
                  defaultValue: '',
                  options: item.options.dictionariesData,
                })
              : el.options;
          } else if (
            item &&
            [item.optionType, item.optionsType].includes('custom')
          ) {
            el.options = JSON.stringify({
              defaultValue: item.options.defaultValue,
              options: item.options.options,
            });
          } else {
            //Else Empty block statement
          }
        }
      });
    }
    if (this.draftSchemaOptions.length) {
      data.draftSchemaOptionsJson = JSON.stringify(this.draftSchemaOptions);
    }

    let draftAttributesJson = JSON.parse(data.draftAttributesJson);
    this.addSpanValues(draftAttributesJson);
    if (isPublish) {
      draftAttributesJson = this.clearItemRule(draftAttributesJson);
      data.publishedAttributesJson = data.draftAttributesJson;
    }

    data.draftAttributesJson = JSON.stringify(draftAttributesJson);

    data.isPublish = isPublish;

    data.existDraft = !!!isPublish;

    if (this.formData.modelType !== 'TREE') {
      data.customButtonJson =
        this.DatacustomButton.length === 0
          ? '[]'
          : this.DatacustomButton.FormData;
    }

    //迭代40新增一个表单属性，formFramework，为了防止后面表单属性过多难以存储，后端
    //新增了个字段options用于使用JSON格式存储后续添加的表单属性
    if (this.formData.modelType !== 'TREE') {
      this.addFormJSONAttr(data, ['formFramework', 'customButtonJson']);
    } else {
      this.addFormJSONAttr(data, ['formFramework']);
    }

    const p = isPublish ? formApi.publish(data) : formApi.update(data);

    return p.then(
      (res) => {
        // hideLoader();
        if (!this.showUnsaveConfirm) {
          this.clearTempDataItem();
          setTimeout(() => {
            this.reload(false, true); // 刷新数据项--防止后台数据同步到数据模型前加载旧数据，覆盖当前数据
          }, 300);
        }
        if (isPublish && res.data) {
          _this.$message.success(
            `版本（Version ${res.data}）表单发布成功！`,
            0.5,
          );
        } else {
          _this.$message.success(msg);
        }
        // _this.$message.success(msg);
        if (data.properties.length !== 0 && this.isPublishClick) {
          this.isPublishClick = false;
          _this.showPublichTips();
        }
        if (res.errcode === 0) {
          // 清空自定义按钮
          this.setDatacustomButton([]);
          this.setCustomButtonEdit(false);
        }
        return res;
      },
      (res) => {
        hideLoader();
        if (
          res.errcode === 301005 &&
          Array.isArray(res.data) &&
          res.data.length > 0
        ) {
          _this.clearAndPublish(res.data, isPublish, msg);
        } else if (res.errmsg) {
          _this.$message.error(res.errmsg);
        } else {
          //Else Empty block statement
        }
        return Promise.reject(new Error());
      },
    );
  }

  // 清空控件规则
  clearItemRule(controls: any) {
    const controlKeys = Object.keys(controls);
    controlKeys.forEach((key: string) => {
      const transferAttributesArr: any[] =
        controlAttributeListMap[controls[key].type];
      const ruleList: any[] = Array.isArray(transferAttributesArr)
        ? transferAttributesArr.filter((x) => x.isRuleAttribute === 1)
        : [];
      ruleList.forEach((x: any) => {
        if (!controls[key].historyOpt) {
          controls[key].historyOpt = {};
        }
        controls[key].historyOpt[x.key] = controls[key].options[x.key];
        controls[key].options[x.key] = '';
      });
      if (controls[key].type === FormControlType.Sheet) {
        const columns = controls[key].columns;
        columns.forEach((column: any) => {
          const subTransferAttributesArr: any[] =
            controlAttributeListMap[column.type];
          const subRuleList: any[] = Array.isArray(subTransferAttributesArr)
            ? subTransferAttributesArr.filter((x) => x.isRuleAttribute === 1)
            : [];
          subRuleList.forEach((x: any) => {
            if (!column.historyOpt) {
              column.historyOpt = {};
            }
            column.historyOpt[x.key] = column.options[x.key];
            column.options[x.key] = '';
          });
        });
        controls[key].columns = columns;
      }
      if (controls[key].type === FormControlType.Tabs) {
        const panels = controls[key].panels;
        panels.forEach((panel: any) => {
          panel.controls = this.clearItemRule(panel.controls);
        });
        controls[key].panels = panels;
      }
    });
    return controls;
  }

  addSpanValues(controls: any) {
    const controlKeys = Object.keys(controls);
    if (this.formData.formFramework && this.formData.formFramework !== 5) {
      controlKeys.forEach((key: string) => {
        if (controls[key].type === 500) {
          controls[key].panels.forEach((panel) => {
            delete panel.formFramework;
            delete panel.prevFramework;
            if (panel.controls && Object.keys(panel.controls).length > 0) {
              Object.keys(panel.controls).forEach((item) => {
                if (panel.controls[item].initSpanValue) {
                  delete panel.controls[item].initSpanValue;
                }
              });
            }
          });
        }
      });
      return;
    }

    controlKeys.forEach((key: string) => {
      if (
        controls[key] &&
        controls[key].options &&
        !controls[key].options.span &&
        this.autoSpanValues[key]
      ) {
        controls[key].options.span = this.autoSpanValues[key];
      }
      if (controls[key].type === 500) {
        controls[key].panels.forEach((panel) => {
          delete panel.formFramework;
          if (panel.controls && Object.keys(panel.controls).length > 0) {
            Object.keys(panel.controls).forEach((item) => {
              if (
                panel.controls[item].initSpanValue &&
                !panel.controls[item].options.span
              ) {
                panel.controls[item].options.span =
                  panel.controls[item].initSpanValue;
                delete panel.controls[item].initSpanValue;
              }
            });
          }
        });
      }
    });
  }

  showPublichTips() {
    this.publicDescription = [
      '您新增加了数据项，如果在流程中使用请重新发布流程',
    ];
  }

  onClosePublicTips() {
    this.publicDescription = [];
  }

  /**
   * 清理已被删除的数据项并发布
   */
  clearAndPublish(
    deletedDataItemCodes: string[],
    isPublish: boolean,
    msg: string,
  ) {
    const dataItems = this.items;

    const names = deletedDataItemCodes
      .map((code) => {
        const idx = code.indexOf('.');
        if (idx === -1) {
          const item = dataItems.find((x) => x.code === code);
          return item ? item.name : null;
        }
        const parentCode = code.substring(0, idx);
        const childCode = code.substring(idx + 1);
        const item = dataItems.find((x) => x.code === parentCode);
        if (!item || !item.properties) {
          return null;
        }
        const childItem = item.properties.find((p) => p.code === childCode);
        if (!childItem) {
          return null;
        }
        return `${item.name}.${childItem.name}`;
      })
      .filter((n) => !!n)
      .join('、');

    if (!names) {
      return;
    }

    const _this = this;

    const clear = () => {
      deletedDataItemCodes.forEach((code) => {
        if (code.indexOf('.') < 0) {
          _this.removeControlOf(
            deletedDataItemCodes,
            _this.controls,
            _this.layout,
          );
        } else {
          const idx = code.indexOf('.');
          const parentCode = code.substring(0, idx);
          const childCode = code.substring(idx + 1);
          const sheet = _this.controls[parentCode] as FormSheet;
          if (!sheet) {
            return;
          }
          _this.removeSheetControlOf(sheet, [childCode]);
        }
      });
    };

    this.$confirm({
      content: this.$t('languages.Apps.FormDesignPage.PublishError', {
        name: names,
      }).toString(),
      okText: this.$t('languages.Apps.Ok').toString(),
      cancelText: this.$t('languages.Apps.Cancel').toString(),
      onOk() {
        clear();
        _this.publish();
      },
    });
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

  handleConfirmCancel() {
    this.showUnsaveConfirm = false;
    if (this.saveConfirmPromiseReject) {
      this.saveConfirmPromiseReject();
      this.saveConfirmPromiseReject = null;
    }
  }

  handleConfirmUnsave() {
    this.showUnsaveConfirm = false;
    if (this.saveConfirmPromiseResolve) {
      this.saveConfirmPromiseResolve();
      this.saveConfirmPromiseResolve = null;
    }
  }

  handleConfirmOk() {
    this.save().then(
      () => {
        this.handleConfirmUnsave();
      },
      () => {
        this.handleConfirmCancel();
      },
    );
  }

  // 控件属性更新
  onModelAttrRuleUpdate(params: any) {
    if (
      params.parentKey &&
      this.controls[params.parentKey] &&
      params.field === 'maxLength'
    ) {
      // @ts-ignore
      const item: any =
        (this.controls[params.parentKey] as any).columns &&
        (this.controls[params.parentKey] as any).columns.find(
          (el) => el.key === params.key,
        );
      if (item && Number(params.value) < item.options.defaultValue.length) {
        this.$message.error('默认值超出最大限制,设置不生效');
        return;
      }
    } else if (params.field === 'maxLength' && this.controls[params.key]) {
      if (
        Number(params.value) <
        this.controls[params.key].options.defaultValue.length
      ) {
        this.$message.error('默认值超出最大限制,设置不生效');
        return;
      }
    } else {
      //Else Empty block statement
    }
    if (params) {
      let obj = {};
      obj[params.field] = params.value;
      const controlKey = params.key;
      let schemaCode = this.bizSchemaCode;
      let findControlItem: any = null;

      if (params.parentKey) {
        findControlItem = this.findItemRecurse(
          this.dataItemList,
          controlKey,
          params.parentKey,
        );
      } else {
        findControlItem = this.findItemRecurse(this.dataItemList, controlKey);
      }
      if (
        ['sequenceNo'].includes(params.key) &&
        Array.isArray(params.modelAttributeColumns)
      ) {
        const res = {};
        params.modelAttributeColumns.forEach((el: any) => {
          res[el.field] = el.value || el.default;
        });
        findControlItem.options = JSON.stringify(res);
      }
      if (findControlItem) {
        // 修改操作
        if (findControlItem.parentCode) {
          schemaCode = findControlItem.parentCode;
        } else if (params.parentKey) {
          schemaCode = params.parentKey;
        } else {
          //Else Empty block statement
        }
        // 记录当前数据项的修改时间
        const cachedIndex: any = this.draftSchemaOptions.findIndex(
          (x) => x.code === controlKey,
        );
        if (cachedIndex !== -1) {
          this.draftSchemaOptions.splice(cachedIndex, 1, {
            code: controlKey,
            lastModifyTime: findControlItem.modifiedTime,
          });
        } else {
          this.draftSchemaOptions.push({
            code: controlKey,
            lastModifyTime: findControlItem.modifiedTime,
          });
        }
      } else {
        if (params.parentKey) {
          schemaCode = params.parentKey;
        }
      }

      if (['modelAttributeColumns'].includes(params.type)) {
        let iIndex: number = -1;
        const findItem: any = this.editProperties.find((item, index) => {
          if (params.parentKey) {
            if (
              item.code === controlKey &&
              item.schemaCode === params.parentKey
            ) {
              iIndex = index;
              return true;
            } else {
              return false;
            }
          } else {
            if (item.code === controlKey) {
              iIndex = index;
              return true;
            } else {
              return false;
            }
          }
        });
        if (findItem) {
          if (findItem.options) {
            try {
              let optionObj: any = JSON.parse(findItem.options);
              optionObj = Object.assign(optionObj, obj);
              findItem.options = JSON.stringify(optionObj);
            } catch (err) {
              findItem.options = null;
            }
          } else {
            findItem.options = JSON.stringify(obj);
          }
          this.editProperties.splice(iIndex, 1, findItem);
        } else {
          if (findControlItem) {
            const cloneItem = cloneDeep(findControlItem);
            if (cloneItem) {
              if (cloneItem.options) {
                try {
                  let optionObj: any = JSON.parse(cloneItem.options);
                  optionObj = Object.assign(optionObj, obj);
                  cloneItem.options = JSON.stringify(optionObj);
                } catch (err) {
                  cloneItem.options = null;
                }
              } else {
                cloneItem.options = JSON.stringify(obj);
              }
            }
            this.editProperties.push(cloneItem);
          } else {
            const currentItemAdd: any = this.dataItemAdds[controlKey];
            if (currentItemAdd) {
              if (currentItemAdd.options) {
                try {
                  let optionObj: any = JSON.parse(currentItemAdd.options);
                  optionObj = Object.assign(optionObj, obj);
                  currentItemAdd.options = JSON.stringify(optionObj);
                } catch (err) {
                  currentItemAdd.options = null;
                }
              } else {
                currentItemAdd.options = JSON.stringify(obj);
              }
            }
          }
        }
      } else {
        let checkType: any = 0;
        let dataRuleType: number = 0;
        switch (params.field) {
          case 'regexp':
          case 'regexpText':
            checkType = 1;
            dataRuleType = 1;
            break;
          case 'verifyFormula':
            checkType = 2;
            dataRuleType = 1;
            break;
          case 'isEmptyRow':
            checkType = 3;
            dataRuleType = 1;
            break;
          case 'maxLength':
            checkType = 4;
            dataRuleType = 1;
            break;
          case 'noRepeat':
            checkType = 5;
            dataRuleType = 1;
            break;
          case 'displayFormula':
            checkType = null;
            dataRuleType = 3;
            break;
          case 'requiredFormula':
            checkType = null;
            dataRuleType = 4;
            break;
          case 'shortTextStitch':
            checkType = null;
            dataRuleType = 2;
            break;
          case 'readonlyCondition':
            checkType = null;
            dataRuleType = 5;
            break;
          default:
            break;
        }
        const ruleItem: any = {
          propertyCode: controlKey,
          name: '',
          checkType,
          schemaCode,
          dataRuleType,
          options: JSON.stringify(obj),
        };
        // 校验数据项是新增还是编辑
        const existItem: any = this.formRuleList.find(
          (x) =>
            x.propertyCode === controlKey &&
            x.dataRuleType === dataRuleType &&
            x.checkType === checkType &&
            (!params.parentKey || x.schemaCode === params.parentKey),
        );
        if (existItem && !params.value) {
          console.log('清空规则----', params.field, params.value);
          // 存在且当前值为清空时， 这里暂时以传入的params.value为空作为表单清空规则的依据， 后续又发现继续补充完善 需要删除对应的规则
          const isDeleteIndex = this.deleteBizDataRuleIds.findIndex(
            (x) => x === existItem.id,
          );
          if (isDeleteIndex === -1) {
            this.deleteBizDataRuleIds.push(existItem.id);
          }
          // 同时还要判断是否在bizDataRuleAdds中存在这样的记录 如果有， 一并删掉
          const iIndex = this.bizDataRuleAdds.findIndex((item, index) => {
            if (
              item.propertyCode === controlKey &&
              item.dataRuleType === dataRuleType &&
              item.checkType === checkType &&
              (!params.parentKey || item.schemaCode === params.parentKey)
            ) {
              return true;
            } else {
              return false;
            }
          });
          if (iIndex > -1) {
            this.bizDataRuleAdds.splice(iIndex, 1);
          }
        } else {
          if (existItem) {
            if (existItem.options === ruleItem.options) {
              return;
            }
            ruleItem.id = existItem.id;
          } else {
            if (!params.value && this.bizDataRuleAdds.length === 0) {
              return;
            }
          }

          let iIndex: number = -1;
          const findItem: any = this.bizDataRuleAdds.find((item, index) => {
            if (
              item.propertyCode === controlKey &&
              item.dataRuleType === dataRuleType &&
              item.checkType === checkType &&
              (!params.parentKey || item.schemaCode === params.parentKey)
            ) {
              iIndex = index;
              return true;
            } else {
              return false;
            }
          });
          if (findItem) {
            if (findItem.options) {
              try {
                const objOption: any = JSON.parse(findItem.options);
                obj = Object.assign(objOption, obj);
                ruleItem.options = JSON.stringify(obj);
              } catch (err) {}
            }
            if (params.value) {
              this.bizDataRuleAdds.splice(iIndex, 1, ruleItem);
            } else {
              this.bizDataRuleAdds.splice(iIndex, 1);
            }
          } else {
            if (params.value) {
              this.bizDataRuleAdds.push(ruleItem);
            }
          }
        }
      }
    }
  }

  findItemRecurse(arr: any, code: string, parentCode = null) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (!parentCode) {
          if (item.code === code) {
            return item;
          }
        } else {
          if (item.code === code && item.schemaCode === parentCode) {
            return item;
          }
        }
        if (item.children && item.children.length) {
          const _item = this.findItemRecurse(item.children, code, parentCode);
          if (_item) {
            return _item;
          }
        }
        if (item.properties && item.properties.length) {
          const _item = this.findItemRecurse(item.properties, code, parentCode);
          if (_item) {
            return _item;
          }
        }
      }
    }
  }

  // 对数据字典设置的options进行处理，处理为默认格式
  formatDictionariesOption() {
    try {
      let draft = JSON.parse(this.formData.draftAttributesJson);
      draft = this.formatDataOption(draft);
      return JSON.stringify(draft);
    } catch (error) {
      console.log(error);
      return '';
    }
  }

  // 格式化数据的options
  formatDataOption(controls) {
    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
        const value: any = controls[key];
        if (value.type === FormControlType.Tabs) {
          value.panels.forEach((panel: any) => {
            panel.controls = this.formatDataOption(panel.controls);
          });
        }
        if (value.type === FormControlType.Sheet) {
          const columns: any[] = value.columns;
          columns.forEach((colunmsItem: any) => {
            // 处理单选 多选 下拉多选 单行文本
            this.formatRadioCheckboxDropdownOptions(colunmsItem);
          });
          value.columns = columns;
        }
        // 处理单选 多选 下拉多选 单行文本
        this.formatRadioCheckboxDropdownOptions(value);
      }
    }
    return controls;
  }

  // 处理单选 多选 下拉多选 单行文本
  formatRadioCheckboxDropdownOptions(value) {
    if (
      [
        FormControlType.Radio,
        FormControlType.Checkbox,
        FormControlType.Dropdown,
        FormControlType.DropdownMulti,
      ].includes(value.type) &&
      value.options &&
      value.options.options
    ) {
      if (value.options.options.indexOf('useDictionariesDat') > 0) {
        const options = JSON.parse(value.options.options);
        const result = options.useDictionariesData
          .reduce((stat: any, item: any) => {
            stat.push(item.name);
            return stat;
          }, [])
          .join(';');
        value.options.options = result;
        value.options.dictionariesData =
          typeof options === 'object' ? JSON.stringify(options) : options;
      }
      if (value.options.options.indexOf('labels') > 0) {
        const options = JSON.parse(value.options.options);
        const result = options.labels
          .reduce((stat: any, item: any) => {
            stat.push(item.data[options.sheetDataItem]);
            return stat;
          }, [])
          .join(';');
        value.options.options = result || JSON.stringify(options);
        value.options.labels =
          typeof options === 'object' ? JSON.stringify(options) : options;
      }
    }
  }

  // 获取单据号配置
  getSeqNoSettingConfig(options: any) {
    const seqNoSetting: any[] = [];
    if (options.prefix) {
      seqNoSetting.push({
        type: 'CONSTANT',
        value: options.prefix,
      });
      seqNoSetting.push({
        type: 'DELIMITER',
        value:
          options.delimiter === 'mark1'
            ? '-'
            : options.delimiter === 'mark2'
            ? '#'
            : '_',
      });
    }
    switch (options.resetDate) {
      case 'none':
        seqNoSetting.push({
          type: 'DATE',
          value: 'none',
        });
        break;
      case 'DAY':
        seqNoSetting.push({
          type: 'DATE',
          value: 'yyyyMMdd',
        });
        seqNoSetting.push({
          type: 'DELIMITER',
          value:
            options.delimiter === 'mark1'
              ? '-'
              : options.delimiter === 'mark2'
              ? '#'
              : '_',
        });
        break;
      case 'MONTH':
        seqNoSetting.push({
          type: 'DATE',
          value: 'yyyyMM',
        });
        seqNoSetting.push({
          type: 'DELIMITER',
          value:
            options.delimiter === 'mark1'
              ? '-'
              : options.delimiter === 'mark2'
              ? '#'
              : '_',
        });
        break;
      case 'YEAR':
        seqNoSetting.push({
          type: 'DATE',
          value: 'yyyy',
        });
        seqNoSetting.push({
          type: 'DELIMITER',
          value:
            options.delimiter === 'mark1'
              ? '-'
              : options.delimiter === 'mark2'
              ? '#'
              : '_',
        });
        break;
      default:
        break;
    }
    seqNoSetting.push({
      type: 'SEQNO',
      value: {
        maxLength: options.maxLength,
        leftPad: true,
        resetDate: options.resetDate,
      },
    });

    return seqNoSetting;
  }

  closeChange() {
    this.isShowGuide = false;
  }

  //新手引导是否展示
  noviceGuide() {
    const userId: string = this.loginedUserInfo.id;
    const params: BPM.System.UserGuide = {
      userId,
      pageType: 8,
    };
    UserGuideApi.getUserGuide(params).then((res) => {
      if (res.errcode === 0) {
        this.isShowGuide = res.data.display;
        if (this.isShowGuide) {
          this.updateUserGuide();
        }
      }
    });
  }

  /**
   * 更新新用户状态
   */
  updateUserGuide() {
    const userId: string = this.loginedUserInfo.id;
    const params: BPM.System.UserGuide = {
      userId,
      pageType: 8,
    };
    UserGuideApi.updateUserGuide(params);
  }

  created() {
    this.$message.config({
      maxCount: 1,
      duration: 3,
    });
    //用于判断示例应用新手引导是否显示
    const appCode: string = this.$route.params.appCode;
    const builtAppList: any = this.appList;
    if (builtAppList) {
      let noviceGuideOpen: boolean = false;
      for (const ap of builtAppList) {
        if (ap.code === appCode) {
          if (ap.builtInApp) {
            noviceGuideOpen = true;
          }
          break;
        }
      }
      if (noviceGuideOpen) {
        this.noviceGuide();
      }
    }
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    if ((this.selectedControl as any).control) {
      this.onControlSelect((this.selectedControl as any).control);
    }
  }

  @Provide()
  getFormControls() {
    return this.controls;
  }

  @Provide()
  getControl() {
    return this.selectedControl.control;
  }

  @Provide()
  setDataitemUesdFor(
    controls: { [key: string]: schema.FormControl },
    used: boolean,
    key?: string,
  ) {
    const fn = (k: string) => {
      this.setDataitemUsed(used, k);
      const c = controls[k] as FormSheet;

      if (c.type === FormControlType.Sheet && c.columns) {
        c.columns.forEach((col) => this.setDataitemUsed(used, c.key, col.key));
      } else if (c.type === FormControlType.Tabs) {
        const tabs = controls[k] as schema.FormTabs;
        tabs.panels.forEach((panel) =>
          this.setDataitemUesdFor(panel.controls, used),
        );
      } else {
        //Else Empty block statement
      }
    };

    if (key) {
      fn(key);
    } else {
      Object.keys(controls).forEach((k) => fn(k));
    }
  }

  @Provide()
  findControlByPath(path: string[], parents?: FormControl[]) {
    let control: FormControl | null = null;

    if (!path || path.length === 0) {
      return control;
    }

    let parent = this.controls[path[0]];

    const findChild = (c: FormControl, childKey: string) => {
      if (c.type === FormControlType.Sheet) {
        const sheet = c as FormSheet;
        let col;
        if (childKey.indexOf('stat-') > -1) {
          col = sheet.statistics.find((x) => x.key === childKey);
        } else {
          col = sheet.columns.find((x) => x.key === childKey);
        }
        return col;
      } else if (c.type === FormControlType.Tabs) {
        const tabs = c as FormTabs;
        const panel = tabs.panels.find((p) => p.key === childKey);
        return panel;
      } else if (c.type === FormControlType.TabsPanel) {
        const tabsPanel = c as schema.FormTabsPanel;
        const child = tabsPanel.controls[childKey];
        return child;
      } else {
        //Else Empty block statement
      }
    };

    if (parent) {
      let index = 1;
      while (index < path.length && parent) {
        if (parents) {
          parents.push(parent);
        }
        parent = findChild(parent, path[index++]);
      }

      control = parent;
    }

    return control;
  }

  @Provide()
  removeControlFromParent(key: string, path?: string[]) {
    if (path) {
      const parents: FormControl[] = [];
      const control = this.findControlByPath(path, parents);
      const parent = parents.pop();
      if (!control || !parent || parent.type !== FormControlType.TabsPanel) {
        return null;
      }

      const tabsPanel = parent as schema.FormTabsPanel;
      if (ControlFactory.removeItemromGrid(tabsPanel.layout, key)) {
        delete tabsPanel.controls[key];
        return control;
      }
    } else {
      if (ControlFactory.removeItemromGrid(this.layout, key)) {
        const control = this.controls[key];
        delete this.controls[key];
        return control;
      }
    }

    return null;
  }

  @Provide()
  copyDataItemFrom(control: any, copyKey: string) {
    // 只有基础控件和子表需要选择数据项
    if (control.type >= 90 && control.type !== FormControlType.Sheet) {
      return;
    }

    let item =
      this.findDataItem(copyKey, control.parentKey, control) ||
      this.findUnSaveDataItem(copyKey, control.parentKey);
    item = cloneDeep(item);

    if (item) {
      item.code = control.key;
      item.published = false;
      const newName: any = (item.name += '1');
      if (control.type === 202) {
        // 描述说明最大2000
        item.name = newName.substring(0, 2000);
      } else {
        // 其他最大长度10
        item.name = newName.substring(0, 10);
      }
      delete item.id;
      if (control.type === FormControlType.Sheet && item.properties) {
        const sheetColumnsKeyCode = {};
        // @ts-ignore
        Array.isArray(control.columns) &&
          control.columns.forEach((element) => {
            sheetColumnsKeyCode[element.key] = element.copyKey;
          });

        item.properties.forEach((p) => {
          p.published = false;
          p.parentCode = control.key;
          p.schemaCode = control.key;
          p.code = sheetColumnsKeyCode[p.code] || p.code;
          delete p.id;
        });
      }
      this.onDataitemAdd(item);
    }
    // @ts-ignore
    if (copyKey && control.type === FormControlType.Sheet && control.columns) {
      // @ts-ignore
      control.columns.forEach((element) => {
        element.key = element.copyKey;
        if (Array.isArray(element.path))
          element.path[element.path.length - 1] = element.key;
      });
    }
  }

  /**
   * 从transfer文件中获取模型属性和模型规则
   * 在迭代39中，模型属性和模型规则移动至控
   * 件属性中的模型属性中，相应的改变了transfer
   * 文件中的数据，原来的模型属性有些移动到了控件
   * 属性tab页下的控件属性，对于同步来说需要单独
   * 处理，（主要是关联单选和关联多选）
   *
   * 返回需要同步的模型属性
   *
   * @param item
   * 控件相关星系
   */
  getModelAttrsList(item) {
    const type = item.formPropertyType || item.type;
    const transferAttributesArr: any[] = controlAttributeListMap[type];

    let attrList: any[] = Array.isArray(transferAttributesArr)
      ? transferAttributesArr.filter((x) => x.isRuleAttribute === 2)
      : [];
    if (
      type === FormControlType.RelevanceForm ||
      type === FormControlType.RelevanceFormEx
    ) {
      attrList = attrList.concat(
        [
          'schemaCode',
          'showStyle',
          'queryCode',
          'displayField',
          'mappings',
          'searchFormula',
          'conditions',
          'linkMode',
        ].map((el) => {
          return { key: el };
        }),
      );
    }
    return attrList;
  }

  getModelRulesList(item) {
    const transferAttributesArr: any[] =
      controlAttributeListMap[item.formPropertyType || item.type];
    return Array.isArray(transferAttributesArr)
      ? transferAttributesArr.filter((x) => x.isRuleAttribute === 1)
      : [];
  }

  /**
   * 发布时的参数处理，将一些表单属性移动到options字段中存储JSON字符串
   */
  addFormJSONAttr(data, formAttrArr) {
    const jsonObj = {};
    formAttrArr.forEach((attr) => {
      if (data[attr]) {
        jsonObj[attr] = data[attr];
        delete data[attr];
      }
    });
    data.options = JSON.stringify(jsonObj);
  }

  /**
   * 解析options中存储的JSON格式的表单属性
   */
  parseJsonFormAttr(data) {
    //历史数据无options
    if (data.options) {
      const jsonObj = JSON.parse(data.options);
      Object.keys(jsonObj).forEach((attr) => {
        data[attr] = jsonObj[attr];
      });
      delete data.options;
      if (!jsonObj || !jsonObj.formFramework) {
        data.formFramework = 5;
      }
    } else {
      data.formFramework = 5;
    }
  }

  @Provide()
  formFramework() {
    return this.formData.formFramework || 5;
  }

  movingControl: any = null;

  @Provide()
  getMovingControl() {
    return this.movingControl;
  }

  @Provide()
  setMovingControl(control) {
    this.movingControl = control;
  }

  //历史数据初始化span
  initSpanValues(layout) {}

  //自动为需要自适应布局的行布局
  autoLayoutRow(layout) {
    layout.forEach((row) => {
      //一行中没有值在initSpans中时需要自动布局
      if (
        row.every((key) => !this.autoSpanValues[key]) &&
        !row.every(
          (key) =>
            !(
              this.controls[key] &&
              this.controls[key].options &&
              this.controls[key].options.span
            ),
        )
      ) {
        return;
      }
      const autoColLen = row.reduce((sum, col) => {
        return (
          sum +
          (this.controls[col].options && this.controls[col].options.span
            ? 0
            : 1)
        );
      }, 0);
      const autoWidth =
        24 -
        row.reduce((sum, col) => {
          return (
            sum +
            (this.controls[col].options && this.controls[col].options.span
              ? this.controls[col].options.span
              : 0)
          );
        }, 0);

      let autoWidthEach = autoWidth / autoColLen;
      row.forEach((col) => {
        if (!this.controls[col].options || !this.controls[col].options.span) {
          this.autoSpanValues[col] = autoWidthEach;
          if (autoWidthEach === 9) {
            this.autoSpanValues[col] = 6;
            autoWidthEach = 12;
          }
          if (
            this.selectedControl &&
            this.selectedControl.control &&
            this.selectedControl.control.key === col
          ) {
            this.selectedControl.initSpanValue = autoWidthEach;
          }
        }
      });
    });
  }

  get tagContent() {
    if (this.isDraft || !this.formData.version) {
      return this.isChinese ? '草稿' : 'Draft';
    } else {
      return this.isChinese
        ? '版本' + this.formData.version
        : 'Version ' + this.formData.version;
    }
  }

  //获取已选中的控件对象类型
  @Provide()
  getSelectedControl() {
    return this.selectedControl && this.selectedControl.control;
  }

  //获取当前试图类型，web，html
  @Provide()
  getViewType() {
    return this.viewType;
  }

  runHideLoader() {
    if (this.hideLoader && typeof this.hideLoader !== 'boolean') {
      this.hideLoader();
    }
    this.hideLoader = null;
  }
}
</script>

<style lang="less">
@import './style/form-design.less';
</style>
<style lang="less" scoped>
@import './style/form-design-scoped.less';
</style>
<style lang="less">
@import '~@/styles/tab.less';
</style>

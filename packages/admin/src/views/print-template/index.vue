<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="print-warpper">
    <div class="printHeaderWrap">
      <div class="print-header flex-justify-between">
        <div class="header-left">
          <div class="flex-center">
            <div
              v-show="$route.fullPath.includes('print-template')"
              @click="goToBack"
            >
              <i
                class="icon aufontAll h-icon-all-arrow-left-o router-link-active"
              ></i>
            </div>
            <div v-if="$route.fullPath.includes('print-template')">
              打印模板设计
            </div>
            <div v-if="$route.fullPath.includes('pre-view')">打印模板预览</div>
          </div>
        </div>
        <div class="header-right">
          <span v-if="isOldPrintTemplate" class="switchNew" @click="switchNew">
            切换到新版
          </span>
          <a-tooltip placement="top">
            <template slot="title"> 预览 </template>
            <span @click="preView">
              <i class="iconfont aufontAll h-icon-all-eye1"></i>
            </span>
          </a-tooltip>
          <a-button type="primary" @click="saveDrawerJson"> 保存</a-button>
        </div>
        <div v-if="$route.fullPath.includes('pre-view')" class="header-right">
          <a-button type="default" icon="close" @click="closePreView">
            关闭
          </a-button>
        </div>
      </div>
    </div>
    <h3-print-designer
      v-if="!isOldPrintTemplate"
      ref="printDesigner"
      :templateData="templateData"
      :metaData="formMetaData"
      :loading="loadingMetaData && loadingTemplate"
      :fileUploader="fileUploader"
    />
    <div v-else class="print-container">
      <h3-side :options="leftOps" @resize="resizeWidth">
        <LeftComponent :formData="formData" @itemStartDrag="doDragStart" />
      </h3-side>
      <CenterPanel
        ref="cneterPanel"
        :providerId="addNamelyClickId"
        @dropEdItem="doDropItem"
        @clickedId="filterDataById"
        @itemStartDrag="doDragStart"
        @rectSelect="onRectSelect"
      />

      <a-modal
        :visible="showUnsaveConfirm"
        :closable="false"
        :maskClosable="false"
        :width="400"
        wrapClassName="unsave-confirm"
      >
        <div class="unsave-confirm--content">
          <i class="icon aufontAll h-icon-all-question-circle"></i>
          <strong>{{
            $t('languages.Apps.FormDesignPage.UnsaveContent')
          }}</strong>
        </div>

        <template slot="footer">
          <a-button key="cancel" @click="handleConfirmCancel">
            {{ $t('languages.Apps.Cancel') }}
          </a-button>
          <a-button key="unsave" @click="handleConfirmUnsave">
            {{ $t('languages.Apps.Unsave') }}
          </a-button>
          <a-button
            key="save"
            class="ant-btn-large"
            type="primary"
            @click="handleConfirmOk"
          >
            {{ $t('languages.Apps.SaveAndLeave') }}
          </a-button>
        </template>
      </a-modal>

      <h3-side :options="rightOps" @resize="resizeWidth">
        <RightAttr :selecteds="selecteds" />
      </h3-side>
    </div>
  </div>
</template>

<script lang="ts">
import appsApi from '@/apis/apps';
import { get, update, printCreate } from '@/apis/form';
import H3Side from '@/common/sider/sider.vue';
import {
  CreateOneItem,
  CreatPic,
  iconTypes,
  leftSide,
  RectLine,
  rightSide,
  systemColumns,
} from '@/config/print/dataStructure';
import env from '@/env';
import { forRightPosition, getOffsetLeft, guid } from '@/utils/print-util';
import common from 'cloudpivot/common';
import H3PrintDesigner from '@h3print/designer';
import '@h3print/designer/lib/h3print-designer.css';
import H3PrintRuntime from '@h3print/runtime';
import axios from 'axios';
import { Component, Provide, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import CenterPanel from './center-panel/index.vue';
import LeftComponent from './left-component/index.vue';
import RightAttr from './right-attr/index.vue';
import { Button, Modal, Tooltip } from '@h3/antd-vue';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import WorkflowApi from '@/apis/workflow';

const { replaceValueData } = common.utils.BusinessFunctions;

const PrintVuex = namespace('Print/Print');

@Component({
  name: 'print-template',
  components: {
    LeftComponent,
    CenterPanel,
    RightAttr,
    H3Side,
    H3PrintDesigner,
    H3PrintRuntime,
    AButton: Button,
    AModal: Modal,
    ATooltip: Tooltip,
  },
  beforeRouteEnter(to, from, next) {
    // @ts-ignore
    next();
  },
  beforeRouteLeave(to, from, next) {
    // @ts-ignore
    this.validateRoute().then(
      () => {
        // vm.clean();
        next();
      },
      () => {
        next(false);
      },
    );
  },
})
export default class PrintTemplate extends Vue {
  leftOps: any = leftSide;

  rightOps: any = rightSide;

  dragItem: any = {};

  addNamelyClickId: string = '';

  @PrintVuex.State('toLeft') toLeft!: number;

  @PrintVuex.State('toTop') toTop!: number;

  @PrintVuex.Action('changeOver') changeOver!: any;

  @PrintVuex.Mutation('addOneEle') addOneEle!: any;

  @PrintVuex.Mutation('changeLeft') changeLeft!: any;

  @PrintVuex.Mutation('setAttrs') setAttrs!: any;

  @PrintVuex.Getter('getItemAttrsById') getItemAttrsById!: any;

  @PrintVuex.Mutation('changeKey') changeKey!: any;

  @PrintVuex.State('pages') pages!: object[];

  @PrintVuex.State('pageSettings') pageSettings!: any;

  selecteds: any[] = [];

  templateData: any = {
    content: '',
    settings: '',
    templateName: '',
    id: '',
  };

  formMetaData: any = {
    fields: {},
    workflowField: [],
  };

  isOldPrintTemplate: boolean = true;

  loadingMetaData = true;

  loadingTemplate = true;

  showUnsaveConfirm = false;

  saveConfirmPromiseResolve: Function | null = null;

  saveConfirmPromiseReject: Function | null = null;

  formData: any = {};

  doDragStart(dragItemObj: any) {
    this.dragItem = dragItemObj;
  }

  onRectSelect(selecteds: any) {
    this.selecteds = selecteds || [];
  }

  @Provide()
  getDragItem() {
    return this.dragItem;
  }

  getLeftAndTop() {
    const Odrawer: any = document.querySelector('.main-body');
    if (!Odrawer) {
      return;
    }
    this.changeLeft(getOffsetLeft(Odrawer));
  }

  fileUploader(formData: any) {
    const file = formData && formData.get('partFile');
    if (file) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        const fileName = 'printBg.png';
        formData.append('file', file);
        formData.append('isAddWatermark', 'false');
        formData.append('locationInfo', '');
        formData.append('fileName', fileName);
        axios.post(env.apiHost + '/api/aliyun/upload', formData).then((res) => {
          const fileURL = this.getDownloadUrlByRefId(res.data.refId);
          resolve({
            data: fileURL,
          });
        });
      });
    } else {
      return Promise.reject(new Error('PartFile 不存在'));
    }
  }

  async created() {
    await this.getPrintTemplateData();
    // this.formMetaData = mockData.ReturnData.MetaData;
  }

  async judgeDataIsSame() {
let isNew:any = this.$route.query.isNew ? true : '';
    const { data, errcode, errmsg } = this.formData;
    if (errcode !== 0 && errcode !== 302024) {
      this.$message.error(errmsg);
      return true;
    }
    const set = new Set();
    if (data && data.draftAttributesJson) {
      set.add(data.draftAttributesJson);
    }

    let json = JSON.stringify(this.$store.state.Print.Print.pages);
    const pages = JSON.parse(json);

    for (const page of pages) {
      for (const item of page) {
        if (item.leftKey && item.leftKey.active) {
          item.leftKey.active = true;
        }
        if (item.rightValue && item.rightValue.active) {
          item.rightValue.active = true;
        }
        // @ts-ignore
        if (item.active) {
          // @ts-ignore
          item.active = false;
        }
      }
    }

    json = JSON.stringify(pages);

    if (!set.has(json)) {
      return true;
    }

    return false;
  }

  async updateFlagInJson(res: any) {
    if (res) {
      const draftAttributesJsonObj: any = JSON.parse(res);
      if (
        Array.isArray(draftAttributesJsonObj) &&
        draftAttributesJsonObj.length > 0
      ) {
        if (
          Array.isArray(draftAttributesJsonObj[0]) &&
          draftAttributesJsonObj[0].length
        ) {
          const pageSettings: any = draftAttributesJsonObj[0].find(
            (item) => item.eleType === 'pageSettings',
          );
          if (pageSettings) {
            pageSettings.isChoosed = true;
          }
        }
      }
      const params: any = {
        // @ts-ignore
        code: this.$route.params.printCode,
        // @ts-ignore
        schemaCode: this.$route.params.bizSchemaCode,
        id: localStorage.getItem(
          `upPrintTempJsonId${this.$route.params.printCode}`,
        ),
        name: '打印模板',
        sheetType: '2',
        draftAttributesJson: JSON.stringify(draftAttributesJsonObj),
      };
      const { errcode, errmsg } = await update(params);
      if (errcode !== 0) {
        this.$message.error(errmsg);
      }
    }
  }

  async saveDrawerJson() {
    if (this.isOldPrintTemplate) { 
      // @ts-ignore
      const res: object[] = replaceValueData(
        env,
        this.$store.state.Print.Print.pages,
        'fake',
      );
      const params: any = {
        // @ts-ignore
        code: this.$route.params.printCode,
        // @ts-ignore
        schemaCode: this.$route.params.bizSchemaCode,
        id: localStorage.getItem(
          `upPrintTempJsonId${this.$route.params.printCode}`,
        ),
        name: '打印模板',
        sheetType: '2',
        draftAttributesJson: JSON.stringify(res),
        formCode: this.$route.params.bizSchemaCode || this.$route.query.bizSchemaCode,
      };
      const { errcode, errmsg } = await update(params);
      if (errcode !== 0) {
        this.$message.error(errmsg);
      }
      if (errcode === 0) {
        this.$message.success(errmsg);
      }
    } else {
      // @ts-ignore
      const printData = this.$refs.printDesigner.getTemplateData();
      const params: any = {
        // @ts-ignore
        code: this.$route.params.printCode,
        // @ts-ignore
        schemaCode: this.$route.params.bizSchemaCode,
        id: localStorage.getItem(
          `upPrintTempJsonId${this.$route.params.printCode}`,
        ),
        name: this.$route.params.name || '打印模板',
        sheetType: '2',
        draftAttributesJson: printData.content,
        printJson: printData.settings,
        formCode: this.$route.params.bizSchemaCode || this.$route.query.bizSchemaCode,
      };

      if (params.id) {
        const { errcode, errmsg } = await update(params);
        if (errcode !== 0) {
          this.$message.error(errmsg);
        }
        if (errcode === 0) {
          this.$message.success(errmsg);
        }
      } else {
        const { errcode, errmsg } = await printCreate(params);
        if (errcode !== 0) {
          this.$message.error(errmsg);
        }
        if (errcode === 0) {
          this.$message.success(errmsg);
        }
      }
    }
  }

  async validateRoute(func: any) {
    const _this = this;

    const edited = await this.judgeDataIsSame();

    if (!edited) {
      return Promise.resolve();
    }
  }

  getSystemFields() {
    const systemColumnsCy = systemColumns.map((item: any) => {
      const { name, code } = item;
      const xitem: Common.ChuanyunPrintModel = {
        children: null,
        fieldCode: code,
        fieldName: name,
        fieldType: 'Text',
      };
      return xitem;
    });
    return systemColumnsCy;
  }

  async getFormFields() {
    const schemaCode = this.$route.params.bizSchemaCode;
    const formCode = this.$route.params.printCode.substring(
      0,
      this.$route.params.printCode.lastIndexOf('_print'),
    );
    let bizColumns: any[] = [];
    const { data, errcode, errmsg } = await appsApi.getDataItemList({
      schemaCode: schemaCode,
      formCode: formCode,
    });
    if (errcode !== 0) {
      bizColumns = [];
    }
    if (!data || !data.length) {
      bizColumns = [];
    }
    if (Array.isArray(data)) {
      data.forEach((item: any, index: number) => {
        if (
          item.propertyType === 8 &&
          item.subSchema.properties.filter((x: any) => !x.defaultProperty)
            .length === 0
        ) {
          return;
        }
        if (!item.defaultProperty) {
          bizColumns.push(item);
        }
      });
    } else {
      console.log(data);
      this.$message.error('获取数据项列表时出错，请联系技术人员处理');
      return;
    }

    const bizColumnsCy = bizColumns.map((item: any) => {
      const { propertyType, formPropertyType, name, code } = item;
      let retItem: Common.ChuanyunPrintModel;
      if (propertyType === 8) {
        // 子表
        const children: any[] = item.subSchema.properties
          .filter((x: any) => !x.defaultProperty)
          .map((xitem: any) => {
            const {
              propertyType: xpropertyType,
              formPropertyType: xformPropertyType,
              name: xname,
              code: xcode,
            } = xitem;
            const mapItem: Common.ChuanyunPrintModel = {
              children: null,
              fieldCode: xcode,
              fieldName: xname,
              fieldType: this.adapterType(xpropertyType, xformPropertyType),
            };
            return mapItem;
          });
        retItem = {
          children: children,
          fieldCode: code,
          fieldName: name,
          fieldType: this.adapterType(propertyType, formPropertyType),
        };
        return retItem;
      }
      retItem = {
        children: null,
        fieldCode: code,
        fieldName: name,
        fieldType: this.adapterType(propertyType, formPropertyType),
      };
      return retItem;
    });
    return bizColumnsCy;
  }

  async getWorkflowFields() {
    const { data, errcode, errmsg } = await WorkflowApi.getWorkflowItem({
      schemaCode: this.$route.params.bizSchemaCode,
    });
    if (errcode !== 0) {
      this.$message.error(errmsg as string);
      return false;
    }
    let list: Array<Common.ChuanyunPrintModel> = [];
    const children: Array<Common.ChuanyunPrintModel> = [];
    if (data && Array.isArray(data.activities)) {
      const dataList = data.activities.filter((x) => {
        return (
          x.activityType !== 'START' &&
          x.activityType !== 'END' &&
          x.activityType !== 'CONNECTION' &&
          x.activityType !== 'SYSTEM_ACTIVITY' &&
          x.activityType !== 'SUB_INSTANCE'
        );
      });
      for (const con of dataList) {
        const item: Common.ChuanyunPrintModel = {
          fieldCode: '',
          fieldName: '',
          fieldType: '',
          children: null,
        };
        item.fieldCode = con.activityCode;
        item.fieldName = con.activityName;
        item.fieldType = 'Text';
        item.children = null;
        children.push(item);
      }
    }
    if (data && Array.isArray(data.activities) && data.activities.length > 0) {
      list = [
        {
          fieldCode: 'WorkFlowLog',
          fieldName: '流程日志',
          fieldType: 'WorkflowLog',
          children: children,
        },
        {
          children: null,
          fieldCode: 'F0000020',
          fieldName: '流程印章',
          fieldType: 'Stamp',
        },
      ];
    }
    return list;
  }

  getOtherFields() {
    const list: Array<Common.ChuanyunPrintModel> = [
      {
        fieldCode: 'QRCode',
        fieldName: '二维码',
        fieldType: 'QrCode',
        children: null,
      },
      {
        fieldCode: 'BarCode',
        fieldName: '条形码',
        fieldType: 'BarCode',
        children: null,
      },
    ];
    return list;
  }

  getWorkflowFieldOutter() {
    const list: Array<Common.ChuanyunPrintModel> = [
      {
        fieldCode: 'activityName',
        fieldName: '节点名称',
        fieldType: 'Text',
        children: null,
      },
      {
        fieldCode: 'receiveTime',
        fieldName: '接收时间',
        fieldType: 'Text',
        children: null,
      },
      {
        fieldCode: 'finishTime',
        fieldName: '完成时间',
        fieldType: 'Text',
        children: null,
      },
      {
        fieldCode: 'usedTime',
        fieldName: '耗时',
        fieldType: 'Text',
        children: null,
      },
      {
        fieldCode: 'name',
        fieldName: '参与者',
        fieldType: 'Text',
        children: null,
      },
      {
        fieldCode: 'content',
        fieldName: '处理意见',
        fieldType: 'Text',
        children: null,
      },
      {
        fieldCode: 'signature',
        fieldName: '手写签名',
        fieldType: 'Image',
        children: null,
      },
      {
        fieldCode: 'operating',
        fieldName: '操作',
        fieldType: 'Text',
        children: null,
      },
    ];
    return list;
  }

  adapterType(propertyType: number, formPropertyType: number | any) {
    if (propertyType === 6) {
      // 附件类型的返回Image, 其他的返回Text
      return 'Image';
    } else if (propertyType === 8) {
      return 'SubTable';
    } else {
      return 'Text';
    }
  }

  async getPrintTemplateData() {
    let printCode: string = this.$route.params.printCode;
    const version: string = this.$route.params.version;
    let isNew:any = this.$route.query.isNew ? true : '';
    this.isOldPrintTemplate = version === '0' || false;
    this.formData = await get(
      this.$route.params.bizSchemaCode,
      this.$route.params.printCode,
      this.$route.params.copyCode,
      isNew
    );
    if (!printCode.includes('_print')) {
      printCode += '_print';
    }
    if (this.isOldPrintTemplate) {
      const isNewPrintTemplateTips = localStorage.getItem(
        'isNewPrintTemplateTips',
      );
      if (!isNewPrintTemplateTips) {
        const self = this;
        this.$confirm({
          title: '打印模板提示信息',
          content: (h) =>
            h('div', {}, [
              h(
                'p',
                { style: 'text-align:justify;' },
                '打印模板现已全面升级为EXCEL画布，如切换新版，旧版所有设置项将被清空且不可恢复。是否升级？',
              ),
              h(
                'p',
                { style: 'text-align:justify; color:red;' },
                '说明：升级新版打印模版后，旧版模版数据不可恢复，请谨慎升级！！',
              ),
            ]),
          okText: '确认升级',
          cancelText: '不升级',
          onOk() {
            self.isOldPrintTemplate = false;
            self.getFormMetaData();
          },
          onCancel() {
            self.isOldPrintTemplate = true;
            localStorage.setItem('isNewPrintTemplateTips', '1');
            self.getLeftAndTop();
            window.onresize = () => {
              self.getLeftAndTop();
            };
          },
        });
      } else {
        this.getLeftAndTop();
        window.onresize = () => {
          this.getLeftAndTop();
        };
      }
    } else {
      let { data, errcode, errmsg } = this.formData;
      if (errcode !== 0 && errcode !== 302024) {
        this.$message.error(errmsg);
      }
      if (!data) {
        // this.$message.error('查询数据有误！');
        data = {};
      } else {
        // 对打印模板中的数据进行历史数据兼容处理
        // 迭代39 所有人改为拥有者，所有人部门改为拥有者部门
        data.draftAttributesJson =
          typeof data.draftAttributesJson === 'string'
            ? data.draftAttributesJson
                .replaceAll('{所有人}', '{拥有者}')
                .replaceAll('"所有人"', '"拥有者"')
                .replaceAll('{所有人部门}', '{拥有者部门}')
                .replaceAll('"所有人部门"', '"拥有者部门"')
            : data.printJson;
      }
      localStorage.setItem(`upPrintTempJsonId${printCode}`, data.id || '');
      this.templateData = {
        content: data.printJson ? data.draftAttributesJson : '',
        settings: data.printJson,
        templateName: data.name,
        id: data.id,
      };
      this.getFormMetaData();
      this.loadingMetaData = false;
      this.loadingTemplate = false;
    }
  }

  async getFormMetaData() {
    this.formMetaData = {
      fields: {
        flowFields: await this.getWorkflowFields(),
        formFields: (await this.getFormFields()) || [],
        otherFields: this.getOtherFields(),
        sysFields: this.getSystemFields() || [],
      },
      workflowField: this.getWorkflowFieldOutter(),
    };
  }

  goToBack() {
    // 销毁打印模板：打印模板中添加了全局的keydown事件，不销毁会导致表单数据标题的配置控件不能删除
    // @ts-ignore
    window.shortcuts.destroy();

    // @ts-ignore
    if (history.length > 1) {
      history.go(-1);
    } else {
      this.$router.push({ path: '/' }).catch((err: any) => {
        console.log(err);
      });
    }
  }

  preView() {
    if (this.isOldPrintTemplate) {
      // @ts-ignore
      const res: object[] = replaceValueData(
        env,
        this.pages,
        'fake',
        iconTypes,
      );
      localStorage.setItem('print_pages', JSON.stringify(res));
      // @ts-ignore
      const href = `/admin#/apps/model/${this.$route.params.appCode}/${this.$route.params.bizSchemaCode}/pre-view`;
      window.open(href, '_blank');
    } else {
      // @ts-ignore
      this.$refs.printDesigner.printPreview(false);
      // let formData: any = {};
      // // @ts-ignore
      // let printData = this.$refs.printDesigner.getTemplateData();
      // let contentArr: [] = JSON.parse(printData.content);
      // contentArr.forEach((item: any) => {
      //   if (item.cells) {
      //     Object.keys(item.cells).forEach((row: any) => {
      //       let rowContent = item.cells[row];
      //       Object.keys(rowContent).forEach((col:any) => {
      //         let colContent = rowContent[col];
      //         if (colContent && colContent.content && colContent.content.hasOwnProperty("fieldCode")) {
      //           if (colContent.content.hasOwnProperty("parentFieldCode")) {
      //             let parentFieldCode = colContent.content["parentFieldCode"];
      //             if (!formData.hasOwnProperty(parentFieldCode)) {
      //               formData[parentFieldCode] = [{
      //                 activityName: '--',
      //                 receiveTime: '--',
      //                 finishTime: '--',
      //                 usedTime: '--',
      //                 name: '--',
      //                 operating: '--'
      //               }];
      //             }
      //           } else if (colContent.content['fieldCode'] === 'QRCode') {
      //             // 二维码
      //             let qrContent: any = colContent.content;
      //             let retObj: Object = {};
      //             if(Array.isArray(qrContent.children) && qrContent.children.length > 0) {
      //               retObj[qrContent.children[0].fieldCode] = '--';
      //             }
      //             formData[colContent.content["fieldCode"]] = retObj;
      //           } else if (colContent.content['fieldCode'] === 'BarCode') {
      //             // 条形码
      //           } else {
      //             formData[colContent.content["fieldCode"]] =`--`;
      //           }
      //         }
      //       })
      //     })
      //   }
      // })
      // let templateData: any = {
      //   id: printData.id,
      //   content: printData.content,
      //   settings: printData.settings,
      //   templateName: '预览测试',
      //   template: {
      //     Id: printData.id,
      //     SchemaCode: this.$route.params.bizSchemaCode,
      //     TemplateName: '预览测试',
      //     Remark: '',
      //     CreatedTime: new Date().getTime()
      //   }
      // }
      // const runtimePrint = new H3PrintRuntime(templateData, formData);
      // runtimePrint.printPreview();
    }
  }

  closePreView() {}

  mockData(templateData: any) {}

  resizeWidth() {
    this.getLeftAndTop();
    (this.$refs.cneterPanel as any).getPagesWidth();
  }

  doDropItem(e: any) {
    e.preventDefault();
    this.changeOver(false);
    this.resizeWidth();
    // @ts-ignore
    const { left, top } = forRightPosition(
      // @ts-ignore
      e.clientX - this.toLeft - this.dragItem.offsetX,
      // @ts-ignore
      e.clientY - this.toTop - this.dragItem.offsetY,
      this.dragItem,
    ) as object;
    let tempObj: object = {};
    // @ts-ignore
    if (this.dragItem.owner.includes('left')) {
      // @ts-ignore
      if (this.dragItem.kind.includes('leftColumn')) {
        // @ts-ignore
        tempObj = {
          id: guid(),
          eleType: 'column',
          left,
          top,
          widthValue: 85,
          heightValue: 30,
          // @ts-ignore
          leftKey: new CreateOneItem(
            guid(),
            '',
            'column',
            this.dragItem.str.trim(),
            left,
            top,
            85,
            30,
          ),
          // @ts-ignore
          rightValue: new CreateOneItem(
            guid(),
            `${this.dragItem.code}#_#${
              this.dragItem.propertyType
            }#_#${this.dragItem.str.trim()}`,
            'column',
            `\${ ${this.dragItem.str.trim()} }`,
            left,
            top,
            85,
            30,
          ),
        };
      }
      // @ts-ignore
      if (this.dragItem.kind.includes('leftQrcodePic')) {
        tempObj = new CreatPic(
          guid(),
          'leftQrcodePic',
          '二维码',
          left,
          top,
          84,
          84,
        );
      }

      // @ts-ignore
      if (this.dragItem.kind.includes('leftBarcodePic')) {
        tempObj = new CreatPic(
          guid(),
          'leftBarcodePic',
          '条形码',
          left,
          top,
          98,
          74,
        );
      }

      // @ts-ignore
      if (this.dragItem.kind.includes('flowLog')) {
        this.$message.warning('todo');
        return false;
      }
    }
    // @ts-ignore
    if (this.dragItem.owner.includes('top')) {
      // @ts-ignore
      if (this.dragItem.kind.includes('topText')) {
        tempObj = new CreateOneItem(
          guid(),
          '',
          'text',
          this.dragItem.str.trim(),
          left,
          top,
          85,
          30,
        );
      }

      // @ts-ignore
      if (this.dragItem.kind.includes('topDrawerRect')) {
        tempObj = new RectLine(
          guid(),
          'topDrawerRect',
          '矩形',
          left,
          top,
          85,
          30,
        );
      }

      // @ts-ignore
      if (this.dragItem.kind.includes('topDrawerLine')) {
        tempObj = new RectLine(
          guid(),
          'topDrawerLine',
          '直线',
          left,
          top,
          85,
          1,
        );
      }

      // @ts-ignore
      if (this.dragItem.kind.includes('topPic')) {
        tempObj = new CreatPic(guid(), 'topPic', '图片', left, top, 134, 74);
      }
    }
    // @ts-ignore
    this.addOneEle(tempObj);
    this.setAttrs(tempObj);
    // @ts-ignore
    this.addNamelyClickId = tempObj.id;
    this.changeKey('1');
  }

  filterDataById(id: string) {
    this.setAttrs(this.getItemAttrsById(id));
    this.changeKey('1');
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
    this.saveDrawerJson().then(
      () => {
        this.handleConfirmUnsave();
      },
      () => {
        this.handleConfirmCancel();
      },
    );
  }

  switchNew() {
    const self = this;
    this.$confirm({
      title: '打印模板提示信息',
      content: (h) =>
        h('div', {}, [
          h(
            'p',
            { style: 'text-align:justify;' },
            '打印模板现已全面升级为EXCEL画布，如切换新版，旧版所有设置项将被清空且不可恢复。是否升级？',
          ),
          h(
            'p',
            { style: 'text-align:justify; color:red;' },
            '【说明：升级新版打印模版后，旧版模版数据不可恢复，请谨慎升级！】',
          ),
        ]),
      okText: '确认升级',
      cancelText: '不升级',
      onOk() {
        self.isOldPrintTemplate = false;
        self.getFormMetaData();
      },
      onCancel() {
        // nothing to do
      },
    });
  }

  getDownloadUrlByRefId(refId: string): string {
    return getDownloadUrlNew.getImageUrl(refId, 'logo');
  }
}
</script>

<style lang="less" scoped>
.print-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
  position: absolute;
  overflow-x: auto;
}
.printHeaderWrap {
  position: absolute;
  width: unset;
  height: 64px;
  top: -64px;
  left: 0;
  right: 0;
}
.print-header {
  height: 64px;
  width: 100%;
  background: #fff;
  color: #111218;
  padding: 0 25px;
  position: relative;
  z-index: 3;
  box-shadow: 0 1px 0 0 #e4e4e4;
  .header-left {
    i {
      margin-right: 25px;
      &:hover {
        cursor: pointer;
      }
    }
    div:nth-child(2) {
      font-size: 18px;
      font-weight: 400;
    }
  }
  .header-right {
    .ant-btn-default {
      margin-right: @base4-padding-xs;
      background: rgba(5, 37, 53, 1);
      color: #fff;
      &:hover {
        border: 1px solid @primary-color;
        color: @primary-color;
        transition: all 0.2s;
      }
    }
    .h-icon-all-eye1 {
      padding-right: 22px;
    }
    .switchNew {
      background: #f8faff;
      padding: 0 12px;
      display: inline-block;
      margin-right: 14px;
      line-height: 22px;
      color: #2970ff;
      border-radius: 10px;
    }
  }
}
</style>

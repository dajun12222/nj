<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <aside
    v-if="isShow"
    class="aside designer-aside-wrap use-tabs"
    :class="isGantt ? 'gantt' : ''"
  >
    <a-tabs defaultActiveKey="1" size="small">
      <a-tab-pane key="1" :tab="$t('languages.Apps.ListConfiguration')">
        <div class="aside-box-wrap">
          <template v-if="presentationType === 'GANTT'">
            <gantt-design
              ref="gantt"
              :schemaCode="schemaCode"
              @changeGanttAttr="changeGanttAttr"
            />
          </template>
          <a-collapse activeKey="dataSetting">
            <a-collapse-panel key="dataSetting">
              <template slot="header">
                <div class="show-content">
                  <span>列表数据设置</span>
                </div>
              </template>

              <SideBox
                :title="$t('languages.Apps.QueryCriteria')"
                :fieldBlock="0"
                :propDataList="queryList"
              />
              <!-- 展示字段 -->
              <SideBox
                ref="showField"
                :title="$t('languages.Apps.DisplayFields')"
                :fieldBlock="1"
                :propDataList="showfieldList"
                @setTargetSortList="filterTitle"
              />
              <!-- 排序 -->
              <SideBox
                :title="$t('languages.Apps.SortField')"
                :fieldBlock="2"
                :propDataList="sortsList"
                @setTargetSortList="setTargetSortList"
              />
            </a-collapse-panel>
          </a-collapse>
          <!-- 列表操作 -->
          <SideBox
            v-show="clientType === 'PC'"
            :title="$t('languages.Apps.ListOperation')"
            :fieldBlock="3"
            :customButton="true"
            :propDataList="operationList"
            @setTargetSortList="setOperationList"
            @setWorkflowForm="setWorkflowForm"
            @setNormalForm="setNormalForm"
          />
          <a-collapse activeKey="pagingSetting">
            <a-collapse-panel key="pagingSetting">
              <template slot="header">
                <div class="show-content">
                  <span>分页设置</span>
                </div>
              </template>

              <div class="paging-setting">
                <div class="paging-setting-item">
                  <label>每页默认显示数据</label>
                </div>

                <div class="paging-setting-item">
                  <a-select
                    v-model="vm_pagingSetting.pageSize"
                    placeholder="请选择"
                    @change="pagingSettingChange"
                  >
                    <a-select-option :value="10">10条</a-select-option>
                    <a-select-option :value="20">20条</a-select-option>
                    <a-select-option :value="50">50条</a-select-option>
                    <a-select-option :value="100">100条</a-select-option>
                    <a-select-option :value="200">200条</a-select-option>
                    <a-select-option :value="300">300条</a-select-option>
                    <a-select-option :value="500">500条</a-select-option>
                  </a-select>
                </div>

                <div class="paging-setting-item">
                  <label>显示数据总条数</label>
                  <a-switch
                    v-model="vm_pagingSetting.showTotal"
                    size="small"
                    @change="pagingSettingChange"
                  />
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" :tab="$t('languages.Apps.ListAttributes')">
        <list-design :schemaCode="schemaCode" />
      </a-tab-pane>
    </a-tabs>
  </aside>
</template>
<script lang="ts">
import * as formApi from '@/apis/form/form.api';
import { getDataItems, updateListData } from '@/apis/list';
import * as listApi from '@/apis/list/list.api';
import Bus from '@/utils/bus';
import { Collapse, Tabs, Select, Switch } from '@h3/antd-vue';
import { DataItemType } from 'cloudpivot/form/schema';
import { Component, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import SideBox from './aside-box.vue';
import ListDesign from './list-attribute.vue';
import { DateType, numberList, numberType } from './modals/control-modals-map';
import {
  btnPropertyName,
  listDesignCommonData,
  oprationCheckedMap,
  queryPresentationPlaceholder,
} from './typings';

import { viewRegister } from 'cloudpivot/list/utils/register';

const ListdesignModule = namespace('Apps/Listdesign');

const DataModelModule = namespace('Apps/DataModel');

const GanttDesign = (viewRegister.getAssets() as any).GanttDesign;

@Component({
  name: 'Aside',
  components: {
    SideBox,
    ListDesign,
    GanttDesign,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASwitch: Switch,
  },
})
export default class Aside extends Vue {
  // --store
  @ListdesignModule.State('queryViewDataSource') queryViewDataSource: any;

  @ListdesignModule.State('saveFlag') saveFlag: any;

  @ListdesignModule.State('name') name: any;

  @ListdesignModule.State('code') code: any;

  @ListdesignModule.State('name_i18n') name_i18n: any;

  @ListdesignModule.State('showFieldArray') storeShowFieldArray: any;

  @ListdesignModule.State('sortArray') storeShowSortArray: any;

  @ListdesignModule.State('edit') edit: any;

  @ListdesignModule.State('isPublish') isPublish: any;

  @ListdesignModule.State('payloadOptions') payloadOptions: any;

  @ListdesignModule.State('clientType') clientType: any;

  @ListdesignModule.State('presentationType') presentationType: any;

  @ListdesignModule.State('ganttModel') ganttModel: any;

  @ListdesignModule.State('customModelType') customModelType: any;

  @ListdesignModule.State('pagingSetting') pagingSetting: any;

  @ListdesignModule.State('dataitemList') dataitemList: any;

  @ListdesignModule.Mutation('setQueryViewDataSource')
  setQueryViewDataSource: any;

  @ListdesignModule.Mutation('setSaveFlage') mutationSaveFlage: any;

  @ListdesignModule.Mutation('setQueryAction') setQueryAction: any;

  @ListdesignModule.Mutation('setSortArray') setSortArray: any;

  @ListdesignModule.Mutation('onEdit') onEdit: any;

  @ListdesignModule.Mutation('nameChange') nameChange: any;

  @ListdesignModule.Mutation('setFilterTipsFlag') setFilterTipsFlag: any;

  @ListdesignModule.Mutation('setShowFieldArray') mutationShowFieldArray: any;

  @ListdesignModule.Mutation('setDataItemList') setDataItemList: any;

  @ListdesignModule.Mutation('setPresentationType') setPresentationType: any;

  @ListdesignModule.Mutation('setGanttModel') setGanttModel: any;

  @ListdesignModule.Mutation('setClientType') setClientType: any;

  @ListdesignModule.Mutation('setSaveCompleted') setSaveCompleted: any;

  @ListdesignModule.Mutation('setCustomModelType') setCustomModelType: any;

  @ListdesignModule.Mutation('setPagingSetting') setPagingSetting: any;

  @ListdesignModule.Action('getWorkflowList') getWorkflowList: any;

  @ListdesignModule.Action('gerFormList') gerFormList: any;

  @ListdesignModule.Action('getListTitle') getListTitle: any;

  @DataModelModule.State('DatacustomButton') DatacustomButton: any;

  @DataModelModule.Mutation('setDatacustomButton') setDatacustomButton: any;

  @DataModelModule.Mutation('setCustomButtonEdit') setCustomButtonEdit: any;

  // --props
  @Prop() designType!: any;

  // --variables
  hasEdited: boolean = false; // 是否已编辑, 已编辑会在关闭时弹出保存信息; 未编辑直接关闭

  isShow: boolean = true; // 侧栏是否显示

  originalFieldsData: any[] = []; // 真-原始数据

  formatedFieldsData: any[] = []; // 服务器获取的原始数据(经过格式化的原始数据)

  // resoprationCheckedList: any[] = [];
  data: any[] = []; // ?

  showfieldList: any[] = []; // 列表头 thead

  queryList: any[] = []; // 查询条件

  sortsList: any[] = []; // 排序条件

  operationList: any[] = []; // 操作列表

  queryPresentation: any = queryPresentationPlaceholder; // 占位符

  draftAttributesJson: any = {};

  isShowOnPc: boolean = false;

  isShowOnMobile: boolean = false;

  isGantt: boolean = true;

  ganttTitleProperty: string = '';

  @Provide()
  getDraftAttributesJson() {
    return this.draftAttributesJson;
  }

  @Provide()
  getFormatedFieldsData() {
    return this.formatedFieldsData;
  }

  // --methods
  /**
   * 加载已发布的数据项列表
   */
  async getAsycDataItems() {
    // TODO: 这个接口似乎有请求两次的情况, 待优化
    return getDataItems(this.schemaCode, true).then((resp) => {
      return resp;
    });
  }

  /* 设置查询字段 */
  setQueryList(val: any) {
    const queryList = val
      .map((x: any, i: any) => x)
      .filter((x: any, i: any) => {
        const ignoreType = [
          DataItemType.LongText,
          DataItemType.Attachment,
          DataItemType.ApprovalOpinion,
          DataItemType.Sheet,
        ]; // type代表控件类型: 屏蔽长文本、附件、审批意见、子表
        return !ignoreType.includes(x.type);
      });
    queryList.forEach((el: any) => {
      if (
        this.draftAttributesJson[el.code] &&
        this.draftAttributesJson[el.code].options.dictionariesData
      ) {
        el.options = this.draftAttributesJson[el.code].options.dictionariesData;
        el.data.options =
          this.draftAttributesJson[el.code].options.dictionariesData;
      }
    });
    this.queryList = queryList;
  }

  /* 设置展示字段 */
  setShowfieldList(val: any, modelType: string) {
    // if(this.queryViewDataSource.currentDataItems){
    //   val = this.setDefaultValue(this.queryViewDataSource.currentDataItems)
    // }
    if (modelType === 'LIST') {
      this.showfieldList = val
        .map((x: any, i: any) => x)
        .filter((x: any, i: any) => {
          if (
            x.data &&
            x.data.name_i18n &&
            typeof x.data.name_i18n === 'object' &&
            x.data.name_i18n.zh !== x.data.name
          ) {
            x.data.name = x.data.name_i18n.zh;
          }

          const ignoreType =
            this.presentationType === 'GANTT'
              ? [
                  // DataItemType.Attachment,
                  DataItemType.ApprovalOpinion,
                  DataItemType.Sheet,
                ]
              : this.clientType === 'APP'
              ? [
                  DataItemType.Attachment,
                  DataItemType.ApprovalOpinion,
                  DataItemType.Sheet,
                ]
              : [DataItemType.ApprovalOpinion]; // type代表控件类型(暂时放开附件-- 6，pc端放开子表--8)
          return !ignoreType.includes(x.type);
        });
    } else if (modelType === 'TREE') {
      this.showfieldList = val
        .map((x: any, i: any) => x)
        .filter((x: any, i: any) => {
          const ignoreType = [
            // DataItemType.Attachment, // 树形模型视图设计展示字段暂时过滤附件
            DataItemType.ApprovalOpinion,
            DataItemType.Sheet,
          ]; // type代表控件类型(暂时放开附件-- 6，pc端关闭子表--8)
          return !ignoreType.includes(x.type);
        });
    } else {
      //Else Empty block statement
    }
    // .filter((x:any, i:any) => {
    //   const ignoreCode = ['name']; // 过滤掉摘要
    //   return !ignoreCode.includes(x.code);
    // });

    //若presentation中包含当前处理人信息
    if (
      this.queryPresentation.options &&
      JSON.parse(this.queryPresentation.options).queryColumns.some(
        (item) => item.code === 'participants_',
      )
    ) {
      const presentOption = JSON.parse(this.queryPresentation.options);
      const participant = presentOption.queryColumns.find(
        (item) => item.code === 'participants_',
      );
      if (!participant.checked) {
        this.setWorkflowForm(undefined, false);
      } else if (participant.sortKey === 0) {
        this.setWorkflowForm(-1, presentOption.showParticipant);
      } else {
        const target = val.find(
          (item) => item.sortKey === participant.sortKey && item.checked,
        );
        const itemIndexBefore = this.showfieldList.findIndex((item) => {
          return target && item.code === target.code;
        });
        this.setWorkflowForm(itemIndexBefore, presentOption.showParticipant);
      }
    }
  }

  /* 设置操作列表 */
  setOperationList(val: any, modelType: string) {
    const batchs = [];
    const batchsIndexs = [];
    if (modelType === 'LIST' && this.presentationType !== 'GANTT') {
    } else if (modelType === 'TREE' || this.presentationType === 'GANTT') {
      val = val
        .map((x: any, i: any) => x)
        .filter((x: any, i: any) => {
          const onlyType = [2, 4, 5, 6]; // 树形模型只有新增、删除、导入、导出四种操作
          return onlyType.includes(x.queryActionType);
        });
    } else {
      //Else Empty block statement
    }
    val.forEach((a: any, i: number) => {
      a.sortKey = i + 1;

      // 批量操作合在一个按钮，以下拉展示形式展示， 暂时不能合并批量打印，功能暂时注释保留，后续如果需要合并其他批量操作，可以放开
      // 记录所有批量操作
      // if(a.actionCode.includes('batch_')){
      //   // @ts-ignore
      //   batchs.push(a)
      //   // @ts-ignore
      //   batchsIndexs.unshift(i)
      // }
    });
    // 批量操作合在一个按钮，以下拉展示形式展示， 暂时不能合并批量打印，功能暂时注释保留，后续如果需要合并其他批量操作，可以放开
    // batchsIndexs.forEach((el,index) => {
    //   val.splice(el, 1)
    //   if(index === batchsIndexs.length - 1){
    //     val.splice(el, 0, Object.assign({}, batchs[0],
    //         {
    //           name: "批量操作",
    //           actionCode: "batchs",
    //           name_i18n: {en: "批量操作"},
    //           data: {},
    //           children: [...batchs]
    //         }
    //       )
    //     )
    //   }
    // })

    this.operationList = val;
  }

  setTargetSortList(data: any) {
    if (data) {
      this.targetSortList = data;
      this.sortListChange(this.storeShowFieldArray);
    }
  }

  filterTitle(data: any) {
    if (
      this.ganttTitleProperty &&
      data.some((item) => item.code === this.ganttTitleProperty) &&
      data[0].code !== this.ganttTitleProperty
    ) {
      this.$message.warning('甘特图标题字段只能首列展示');
      const temp = data[0];
      const position = data.findIndex(
        (item) => item.code === this.ganttTitleProperty,
      );
      data.splice(0, 1, data[position]);
      data.splice(position, 1, temp);
      this.mutationShowFieldArray(data);
    }
  }

  targetSortList: Array<any> = [];

  // 后台存储 排序字段信息
  /**
   * 根据展示字段设置可选的排序字段 并处理选择状态
   */
  @Watch('storeShowFieldArray', { deep: true })
  linsenShowfieldList(v: any) {
    this.sortListChange(v);
  }

  /*
   * 更改排序字段的数组
   */
  sortListChange(v: any) {
    if (v.length === 0) {
      return;
    }

    // 过滤出显示字中被选中的
    const data = JSON.parse(JSON.stringify(v)).filter(
      (x: any, i: any) => x.checked,
    );
    for (let i = this.targetSortList.length - 1; i >= 0; i--) {
      const index = data.findIndex(
        (d: any) => d.propertyCode === this.targetSortList[i].propertyCode,
      );
      if (index !== -1) {
        const item = data[index];
        data.splice(index, 1);
        data.unshift(item);
      }
    }
    data.forEach((res: any) => {
      res.checked = false;
      res.id = '';
      this.targetSortList.forEach((r: any) => {
        if (r.propertyCode === res.propertyCode) {
          res.direction = r.direction;
          res.checked = true;
          res.id = r.id ? r.id : '';
        }
      });
    });
    this.sortsList = data.filter(
      (item: any) =>
        item.propertyType !== DataItemType.LongText &&
        item.propertyType !== DataItemType.Radio &&
        item.propertyType !== DataItemType.Checkbox &&
        // item.propertyType !== DataItemType.Dropdown &&
        item.propertyType !== DataItemType.DropdownMulti &&
        item.propertyType !== DataItemType.Logic &&
        item.propertyType !== DataItemType.Sheet &&
        item.propertyType !== DataItemType.Attachment &&
        item.propertyType !== DataItemType.RelevanceForm &&
        item.propertyType !== DataItemType.RelevanceFormEx &&
        item.propertyType !== DataItemType.Address &&
        item.propertyType !== DataItemType.StaffSingle &&
        item.propertyType !== DataItemType.StaffMulti &&
        item.propertyType !== DataItemType.DeptSingle &&
        item.propertyType !== DataItemType.DeptMulti &&
        item.propertyType !== DataItemType.StaffDeptMix &&
        item.code.indexOf('_$$_') === -1 &&
        item.schemaCode === this.schemaCode,
    );
    /*  console.log('展示字段数组：', this.sortsList); */
  }

  SortList: Array<any> = [];

  @Watch('storeShowSortArray', { deep: true })
  linsenSortList(v: any) {
    for (let i = 0; i < v.length; i++) {
      const isExist = this.targetSortList.find(
        (t: any) => t.propertyCode === v[i].propertyCode,
      );
      if (v[i].checked && !isExist) {
        this.targetSortList.push(v[i]);
      } else if (!v[i].checked) {
        const index = JSON.parse(JSON.stringify(this.targetSortList)).findIndex(
          (res: any) => res.propertyCode === v[i].propertyCode,
        );
        this.targetSortList.splice(index, 1);
      } else {
        //Else Empty block statement
      }
    }
    // console.log('store--sort:', this.targetSortList);
  }

  generateDesignData() {
    return new Promise<void>((resolve, reject) => {
      // 查询条件
      const queryList: any = this.payloadOptions.filter(
        (el: any) => el.checked === true,
      );

      // 显示字段
      const showfieldList: any = this.storeShowFieldArray.filter(
        (el: any) => el.checked === true,
      );

      // 排序字段
      const sortsList: any = this.storeShowSortArray.filter(
        (el: any) => el.checked === true,
      );

      // 操作按钮
      const operationList: any = JSON.parse(JSON.stringify(this.operationList));

      let batchs: any[] = [];
      let batchsIndex: number = 0;

      if (Array.isArray(operationList)) {
        operationList.forEach((el, index) => {
          if (el.actionCode === 'batchs' && el.children) {
            batchs = [...el.children];
            batchsIndex = index;
          }
        });
        if (batchs.length) {
          operationList.splice(batchsIndex, 1);
        }
        batchs.forEach((el, index) => {
          operationList.splice(batchsIndex + index, 0, el);
        });
      }

      operationList.forEach((res: any) => {
        // 去掉格式化时注入的 data 字段
        res.data = undefined;
        // 如果name字段为空，取当前语言版本多语言
        if (!res.name) {
          res.name = res.name_i18n ? res.name_i18n[this.$i18n.locale] : '';
        }
        if (res.name_i18n && typeof res.name_i18n === 'object') {
          res.name_i18n = JSON.stringify(res.name_i18n);
        }
      });

      /*  查询条件 */
      queryList.forEach((res: any) => {
        // 去掉格式化时注入的 data 字段
        res.data = undefined;

        res.scopedSlots =
          typeof res.scopedSlots === 'object'
            ? JSON.stringify(res.scopedSlots)
            : res.scopedSlots;
        if (!res.name) {
          res.name = res.name_i18n ? res.name_i18n[this.$i18n.locale] : '';
        }
        if (res.name_i18n && typeof res.name_i18n === 'object') {
          res.name_i18n = JSON.stringify(res.name_i18n);
        }

        // 单据状态的默认值，中文转英文 20190722 by John
        if (res.code === 'sequenceStatus') {
          if (!res.defaultValue) {
            return;
          }
          const vals_zh: Array<string> = res.defaultValue.split(';');
          const vals_en: Array<string> = [];
          vals_zh.forEach((val: string) => {
            switch (val) {
              case '草稿':
                vals_en.push('DRAFT');
                break;
              case '进行中':
                vals_en.push('PROCESSING');
                break;
              case '已完成':
                vals_en.push('COMPLETED');
                break;
              case '已作废':
                vals_en.push('CANCELED');
                break;
              default:
                break;
            }
          });
          res.defaultValue = vals_en.join(';');
        }

        // 日期数据项设置了dataType的，需清空默认值
        if (res.propertyType === DataItemType.Date && res.dateType) {
          res.startValue = '';
          res.endValue = '';
        }
      });

      // 显示字段
      showfieldList.forEach((res: any) => {
        // 去掉格式化时注入的 data 字段
        res.data = undefined;
        // FIXME: 多次来回切换html/设计模式后, scopedSlots会膨胀成好几M大小的字符串
        // res.scopedSlots = JSON.stringify(res.scopedSlots);
        res.scopedSlots =
          typeof res.scopedSlots === 'object'
            ? JSON.stringify(res.scopedSlots)
            : res.scopedSlots;
        if (!res.name) {
          res.name = res.name_i18n ? res.name_i18n[this.$i18n.locale] : '';
        }
        if (res.name_i18n && typeof res.name_i18n === 'object') {
          res.name_i18n = JSON.stringify(res.name_i18n);
        }
      });

      // 排序字段
      sortsList.forEach((res: any) => {
        // 去掉格式化时注入的 data 字段
        res.data = undefined;
        res.scopedSlots =
          typeof res.scopedSlots === 'object'
            ? JSON.stringify(res.scopedSlots)
            : res.scopedSlots;
        if (!res.name) {
          res.name = res.name_i18n ? res.name_i18n[this.$i18n.locale] : '';
        }
        if (res.name_i18n && typeof res.name_i18n === 'object') {
          res.name_i18n = JSON.stringify(res.name_i18n);
        }
      });
      let names: any = this.name;
      if (!this.name) {
        names = this.name_i18n ? this.name_i18n[this.$i18n.locale] : '';
      }

      if (!names) {
        this.$message.error('视图名称不能为空！');
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
        return false;
      }

      const reg = /^\S(.{0,49})?$/;
      if (!reg.test(this.name) || this.name.length > 50) {
        this.$message.error(this.$t('languages.Apps.NameRule') as string);
        this.mutationSaveFlage(false);
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
        return false;
      }

      const name_i18n =
        this.name_i18n && typeof this.name_i18n === 'object'
          ? JSON.stringify(this.name_i18n)
          : '';

      // WARN: 因为存的是JSON, 数据中包含大量的\n\t, 要小心转换过程中可能存在的坑
      // 过滤展示字段子表数据项不显示字段并删除isQueryColumn字段；
      let queryColumns: Array<any> = JSON.parse(JSON.stringify(showfieldList));
      queryColumns.forEach((s: any, index: number) => {
        s.sortKey = index + 1;
        if (s.childColumns) {
          s.childColumns.forEach((c) => {
            c.visible = c.isQueryColumn;
            c.isQueryColumn = undefined;
          });
        }
      });
      //7777777777 用于模拟数据，联调删除
      // localStorage.setItem('queryViewDataSource',JSON.stringify(this.queryViewDataSource))

      const queryPresentation: any = { ...this.queryPresentation };

      queryPresentation.queryViewDataSource = JSON.stringify(
        this.queryViewDataSource,
      );

      const re = queryColumns.filter((el) => el.parentCode); // 筛选出关联表单字段
      queryColumns = queryColumns.filter((el) => !el.parentCode);
      const obj: any = {};
      queryColumns = queryColumns.filter((item) => {
        if (item.propertyType === 9) {
          item.displayFields = item.displayFields || [];
          obj[item.code] = item;
        }
        return item.propertyType !== 9;
      });
      if (re.length) {
        re.forEach((el) => {
          const codes: any[] = el.code.split('_$$_');
          el.schemaCode = codes[0];
          //el.name = el.name.split('.')[1] || el.name
          el.propertyCode = el.propertyCode.replace(codes[0] + '_$$_', '');
          el.code = el.code.replace(codes[0] + '_$$_', '');
          el.propertyName = el.propertyName.split('.')[1];

          if (el.isMainTable) {
            // 主表的关联表单
            const inQueryColumns = queryColumns.find(
              (item) => item.propertyCode === el.parentCode,
            );
            if (inQueryColumns) {
              // 如果关联表单也选中了，直接添加到关联表单下面
              if (inQueryColumns.displayFields) {
                inQueryColumns.displayFields.push({
                  ...el,
                });
              } else {
                inQueryColumns.displayFields = [
                  {
                    ...el,
                  },
                ];
              }
            } else {
              // 关联表单未被选中， 生成关联表单，并设deleted： TRUE

              const path =
                this.queryViewDataSource.relevanceFormsDataItems.find(
                  (item) => {
                    return el.parentCode === item.code;
                  },
                ).path;
              if (!path) {
                if (obj[el.parentCode]) {
                  obj[el.parentCode].displayFields.push({
                    ...el,
                  });
                } else {
                  obj[el.parentCode] = {
                    name: el.parentName,
                    schemaCode: this.schemaCode,
                    propertyCode: el.parentCode,
                    propertyType: 9,
                    deleted: false,
                    displayFields: [
                      {
                        ...el,
                      },
                    ],
                  };
                }
              } else {
                let curDisplayFields: any[] = [];
                let count = 0;
                while (count !== 5 && count !== path.length) {
                  const node = path[path.length - 1 - count];
                  if (count === 0) {
                    if (!obj[node.parentCode]) {
                      obj[node.parentCode] = {
                        name: node.parentName,
                        schemaCode: node.schemaCode,
                        propertyCode: node.parentCode,
                        propertyType: 9,
                        deleted: true,
                        relativeSchemaCode: node.relativeCode,
                        displayFields: [],
                      };
                    } else if (
                      obj[node.parentCode].deleted &&
                      obj[node.parentCode].relativeSchemaCode ===
                        el.relativeSchemaCode
                    ) {
                      el.displayFields = obj[node.parentCode].displayFields;
                      obj[node.parentCode] = Object.assign(
                        obj[node.parentCode],
                        el,
                      );
                      obj[node.parentCode].deleted = false;
                    } else {
                      //Else Empty block statement
                    }
                    curDisplayFields = obj[node.parentCode].displayFields;
                  } else {
                    const findex = curDisplayFields.findIndex(
                      (field: any) =>
                        field.relativeSchemaCode === node.relativeCode,
                    );
                    if (findex === -1) {
                      curDisplayFields.push({
                        name: node.parentName,
                        schemaCode: node.schemaCode,
                        propertyCode: node.parentCode,
                        propertyType: 9,
                        deleted: true,
                        relativeSchemaCode: node.relativeCode,
                        displayFields: [],
                      });
                    } else if (
                      curDisplayFields[findex].deleted &&
                      curDisplayFields[findex].relativeSchemaCode ===
                        el.relativeSchemaCode
                    ) {
                      el.displayFields = curDisplayFields[findex].displayFields;
                      curDisplayFields[findex] = Object.assign(
                        curDisplayFields[findex],
                        el,
                      );
                      curDisplayFields[findex].deleted = false;
                    } else {
                      //Else Empty block statement
                    }
                    curDisplayFields =
                      curDisplayFields[
                        findex !== -1 ? findex : curDisplayFields.length - 1
                      ].displayFields;
                  }
                  count++;
                }
                if (el.type === 9) {
                  el.displayFields = [];
                }
                curDisplayFields.push({ ...el });
              }
            }
          } else {
            // 子表中的关联表单
            const inQueryColumns = queryColumns.find((item) =>
              [el.parentCode, el.parentSheetCode].includes(item.propertyCode),
            );
            if (inQueryColumns) {
              // 子表选中了
              const item = inQueryColumns.childColumns.find(
                (ele) => ele.propertyCode === el.parentCode,
              );
              if (item) {
                if (item.displayFields) {
                  item.displayFields.push({ ...el });
                } else {
                  item.displayFields = [{ ...el }];
                }
              } else {
                inQueryColumns.childColumns.push({
                  propertyCode: el.parentCode,
                  name: el.parentName,
                  propertyType: 9,
                  deleted: true,
                  displayFields: [
                    {
                      ...el,
                    },
                  ],
                });
              }
            } else {
              if (obj[el.parentCode]) {
                const ele = obj[el.parentCode].childColumns.find(
                  (ele) => ele.propertyCode === el.parentCode,
                );
                if (ele) {
                  ele.displayFields.push({ ...el });
                }
              } else {
                obj[el.parentCode] = {
                  name: el.parentSheetName,
                  schemaCode: this.schemaCode,
                  propertyCode: el.parentSheetCode,
                  propertyType: 8,
                  deleted: true,
                  childColumns: [
                    {
                      propertyCode: el.parentCode,
                      name: el.parentName,
                      propertyType: 9,
                      deleted: true,
                      displayFields: [
                        {
                          ...el,
                        },
                      ],
                    },
                  ],
                };
              }
            }
          }
        });
      }

      const sheets = queryColumns.filter((el) => el.propertyType === 8);

      sheets.forEach((sheet) => {
        const childColumns = sheet.childColumns;
        const childs = childColumns.filter((el) => el.isMainTable === false);
        sheet.childColumns = childColumns.filter(
          (el) => el.isMainTable !== false,
        );
        if (childs && childs.length) {
          childs.forEach((child) => {
            child.propertyCode = child.propertyCode || child.code;
            const children = sheet.childColumns.find(
              (el) => el.propertyCode === child.parentCode,
            );
            if (children) {
              child.propertyCode = child.code;
              if (children.displayFields) {
                children.displayFields.push(child);
              } else {
                children.displayFields = [child];
              }
            } else {
              /* console.log('child===>', child); */
              sheet.childColumns.push({
                name: child.parentName,
                schemaCode: child.parentSheetCode,
                propertyCode: child.parentCode,
                propertyType: 9,
                deleted: true,
                displayFields: [
                  {
                    ...child,
                  },
                ],
              });
            }
          });
        }
      });

      queryColumns = [...queryColumns, ...Object.values(obj)];

      //当前处理人的假数据开始存在于queryColumn中
      //最终应该在queryPresentation中传递
      const participant = this.showfieldList.find(
        (el) => el.code === 'participants_',
      );
      if (participant) {
        //展示字段排序
        queryColumns.forEach((el, index) => {
          el.sortKey = index;
        });
        if (participant.checked) {
          participant.sortKey =
            queryColumns.find((item) => item.code === 'participants_').sortKey -
            1;
          const operatePersonIndex = queryColumns.findIndex(
            (el) => el.code === 'participants_',
          );
          queryColumns.splice(operatePersonIndex, 1);
        }
        const options = {
          showParticipant: participant.checked,
          queryColumns: [participant],
        };
        queryPresentation.options = JSON.stringify(options);
      } else {
        const options = {
          showParticipant: false,
          queryColumns: [],
        };
        queryPresentation.options = JSON.stringify(options);
      }

      //如果是甘特图视图且展示字段中没有包含甘特图标题字段，默认添加该字段到展示字段中
      if (
        this.ganttTitleProperty &&
        !queryColumns.some((item) => item.code === this.ganttTitleProperty)
      ) {
        const target = this.showfieldList.find(
          (item) => item.code === this.ganttTitleProperty,
        );
        // 去掉格式化时注入的 data 字段
        target.data = undefined;
        // FIXME: 多次来回切换html/设计模式后, scopedSlots会膨胀成好几M大小的字符串
        // res.scopedSlots = JSON.stringify(res.scopedSlots);
        target.scopedSlots =
          typeof target.scopedSlots === 'object'
            ? JSON.stringify(target.scopedSlots)
            : target.scopedSlots;
        if (!target.name) {
          target.name = target.name_i18n
            ? target.name_i18n[this.$i18n.locale]
            : '';
        }
        if (target.name_i18n && typeof target.name_i18n === 'object') {
          target.name_i18n = JSON.stringify(target.name_i18n);
        }
        queryColumns.unshift(target);

        //展示字段排序
        queryColumns.forEach((item, index) => {
          item.sortKey = index;
        });
      }

      const postData: any = {
        name: names,
        name_i18n,
        code: this.listCode,
        schemaCode: this.schemaCode,
        queryConditions: queryList,
        queryColumns: queryColumns,
        querySorts: sortsList,
        queryActions: operationList,
        clientType: this.clientType,
        queryPresentationType: this.presentationType,
        queryPresentation: queryPresentation,
        modelType: this.customModelType,
        options: JSON.stringify({
          pagingSetting: this.pagingSetting,
        }),
        queryGanttModel:
          this.presentationType === 'GANTT'
            ? (this.$refs.gantt as any).generateGanttData()
            : null,
        customButtonJson:
          this.DatacustomButton.length === 0
            ? '[]'
            : JSON.stringify(this.DatacustomButton.ViewData),
        // queryViewDataSource: this.queryViewDataSource,
      };
      if (!this.isPublish) {
        // 非发布状态修改 要标记新code
        postData.newCode = this.code;
        this.$route.params.code = this.code;
      }
      resolve(postData);
    });
  }

  // 这里有两个地方调用, 一个是当前组件, 一个是listDesign-index.vue通过aside的ref, 具体逻辑看 onSaveFlagChange 方式的注释
  toSaveListDesign() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
      if (
        this.clientType === 'PC' &&
        this.isShowOnPc &&
        !this.storeShowFieldArray.filter((el: any) => el.checked === true)
          .length
      ) {
        this.$message.error('当前视图展示字段不能为空');
        this.mutationSaveFlage(false);
        return;
      }

      if (
        this.clientType === 'APP' &&
        this.isShowOnMobile &&
        !this.storeShowFieldArray.filter((el: any) => el.checked === true)
          .length
      ) {
        this.$message.error('当前视图展示字段不能为空');
        this.mutationSaveFlage(false);
        return;
      }
      if (this.presentationType === 'GANTT') {
        const ganttData = (this.$refs.gantt as any).generateGanttData();
        if (
          !(
            ganttData.startTimePropertyCode &&
            ganttData.endTimePropertyCode &&
            ganttData.titlePropertyCode
          )
        ) {
          this.$message.error('当前视图甘特图设置中必填配置项不能为空');
          this.mutationSaveFlage(false);
          return;
        }
      }
      this.setSaveCompleted(false);
      const postData = await this.generateDesignData();
      const vm: any = this;
      const loading = this.$message.loading('发布中');
      updateListData(postData).then((res: any) => {
        loading();
        if (res.errcode === 0) {
          if (!this.isPublish) {
            // 发布状态修改
            //如果没有修改编码仅仅刷新页面
            if (!(postData as any).newCode) {
              this.$router.go(0);
            } else {
              //如果修改了编码需要更新路由中的code
              const path = this.$route.path;
              const ss = path.split('/');
              ss[ss.length - 1] = (postData as any).newCode;
              const result = ss.join('/');
              vm.onEdit(false);
              vm.setCustomButtonEdit(false); //改变自定义按钮修改状态
              this.$router.push({ path: result });
              setTimeout(() => {
                this.$router.go(0);
              }, 2000);
            }
          } else {
            vm.getListInfo(vm.formatedFieldsData);
            vm.getListTitle({
              schemaCode: this.schemaCode,
              listCode: this.listCode,
            });
            vm.setSaveCompleted(true);
            vm.onEdit(false);
            vm.setCustomButtonEdit(false); //改变自定义按钮修改状态
          }
          resolve();
          setTimeout(() => {
            vm.$message.success(this.$t('languages.PublishSuccess'));
          }, 300);
          // 清空自定义按钮
          this.setDatacustomButton([]);
        } else {
          vm.$message.error(res.errmsg);
          // eslint-disable-next-line prefer-promise-reject-errors
          reject();
        }
        this.mutationSaveFlage(false);
      });
    });
  }

  // 保存到服务器: 分两种情况, designType === 'page'|'html'
  // 前者可以直接使用 listInfo 去生成接口可用的参数, 然后上传
  // 后者需要用先经过 listDesign-index 页面的 parseToOptions 方法进行解析, 才能获取最新的 listInfo; 所以 designType==='html'时, 这里不直接调用 toSaveListDesign(), 而是 $emit 到上层 listDesign-index, 等 index 页面解析完毕再通过 ref.aside 来调用这里的 toSaveListDesign
  // TODO: 需要设一个变量 hasEdited, 记录是否已做出更改. 如果未更改, 仍走直接方式; 已更改才走先解析后保存的方式
  // TODO: 在切换到表单设计或者其他地方的时候, 会有提示"是否保存"的弹窗, 这种情况也需要考虑 designType==='html' 的情况
  @Watch('saveFlag')
  onSaveFlagChange(flage: any) {
    if (!flage) {
      return;
    }
    if (this.designType === 'html') {
      this.$emit('saveFlagInHtmlDesignType', { shouldSaveData: true });
    } else {
      this.toSaveListDesign();
    }
  }

  // PC端、移动端切换
  @Watch('clientType')
  onViewTypeChange(v: any) {
    this.reload();
    this.queryPresentation = queryPresentationPlaceholder;
  }

  async created() {
    // console.log(this.$route.params.code, 'this.$route.params.code');
    const formList: any = await formApi.list(this.schemaCode); // 先获取视图编码
    if (formList.errcode === 0) {
      const res = await formApi.get(this.schemaCode, formList.data[0].code);
      // let res = await formApi.get(this.schemaCode, this.$route.params.code);
      if (res.errcode === 0) {
        this.draftAttributesJson =
          JSON.parse(res.data.draftAttributesJson) || {};

        Object.values(this.draftAttributesJson).forEach((d: any) => {
          if (d.options.dictionariesData) {
            d.options.options = d.options.dictionariesData;
          }
          if (d.type === 500) {
            // tab标签页
            if (Array.isArray(d.panels)) {
              d.panels.forEach((s: any) => {
                const len: number = Object.keys(s.controls).length;
                if (len) {
                  const keys = Object.keys(s.controls);
                  keys.forEach((k: any, i: number) => {
                    this.draftAttributesJson[k] = s.controls[k];
                  });
                }
              });
            }
          }
        });
      }
      this.init(false);
    }
  }

  mounted() {
    // 注册全局事件
    Bus.$on('saveListDesign', (callback: Function) => {
      if (this.designType === 'html') {
        this.$emit('saveFlagInHtmlDesignType', {
          shouldSaveData: true,
          callback,
        });
      } else {
        this.toSaveListDesign().then(() => {
          // eslint-disable-next-line standard/no-callback-literal
          callback(true);
        });
      }
    });
  }

  destroyed() {
    Bus.$off('saveListDesign');
  }

  /*
   * 列表老版本兼容多语言版本
   * 老版本只有英文?
   */
  compatibleOldData(data: any) {
    const localeList: Array<string> = ['en']; // 语言列表
    localeList.forEach((local: string) => {
      if (!data.name_i18n) {
        data.name_i18n = {};
        data.name_i18n[local] = data.name || '';
      } else if (data.name_i18n[local] === '') {
        data.name_i18n[local] = data.name || '';
      } else {
        //Else Empty block statement
      }
    });
    return data;
  }

  // 格式化字段基本属性和设置
  setDefaultValue(dataItems: any) {
    if (dataItems.length < 1) {
      return [];
    }
    const sysUserArr = ['creater', 'owner', 'modifier'];
    const sysDeptArr = ['createdDeptId', 'ownerDeptId'];

    const targetDataItems = dataItems.map((res: any, index: number) => {
      // if (res.code === 'owner') {
      //   res.name = '拥有者';
      // } else if (res.code === 'ownerDeptId') {
      //   res.name = '拥有者部门';
      // }
      this.compatibleOldData(res); // 对老版本做兼容处理

      let childColumns = null;
      if (
        res.propertyType === DataItemType.Sheet &&
        res.subSchema &&
        Array.isArray(res.subSchema.properties)
      ) {
        res.subSchema.properties.forEach((child: any) => {
          delete child.id;
          child.propertyCode = child.code;
          this.typeFormat(child.propertyType, child, res.code);
        });
        childColumns = res.subSchema.properties.filter(
          (sub: any) => !sub.defaultProperty,
        );
        if (childColumns) {
          (childColumns as any).forEach((prop) => {
            prop.isQueryColumn = true;
          });
        }
      }
      // 字段基本属性
      let obj: any = {
        // id:res.id,
        name: res.name, // 显示名称
        name_i18n: res.name_i18n, // 国际化名称
        propertyCode: res.code, // 数据项编码
        code: res.code,
        propertyType: res.propertyType, // 数据项类型
        propertyName: res.name, // 数据项名称
        dataIndex: res.code, // 表格 标识编码
        isSystem: res.defaultProperty, // 是否是系统字段
        type: res.propertyType, // 数据项类型
        scopedSlots: { customRender: res.code }, // 显示字段设计需要
        relativeSchemaCode: res.relativeCode,
        childColumns,
        data: {},

        parentCode: res.parentCode,
        parentName: res.parentName,
        isMainTable: res.isMainTable,
        parentSheetCode: res.parentSheetCode,
        parentSheetName: res.parentSheetName,
        schemaCode: res.schemaCode,
      };
      // 合并字段基本属性和列表基本数据
      /* console.log(listDesignCommonData); */
      obj = { ...obj, ...listDesignCommonData };
      if (typeof res.options === 'string') {
        try {
          const option = JSON.parse(res.options);
          // console.log(option, 'option');
          if (option) {
            obj.options = JSON.stringify(option);
          }
        } catch (e) {}
      }
      this.typeFormat(res.propertyType, obj);

      // 状态
      if (res.code === 'sequenceStatus') {
        obj.displayType = 3; // 下拉
        obj.options = '草稿;进行中;已完成;已作废';
        obj.defaultValue = '';
      }

      // 系统选人控件字段固定可选类型
      if (sysUserArr.includes(res.code)) {
        obj.userOptionType = 1; // 选人控件类型:人员
      } else if (sysDeptArr.includes(res.code)) {
        obj.userOptionType = 2; // 部门
      } else {
        //Else Empty block statement
      }

      // 在data里做备份
      obj.data = { ...obj, data: undefined };

      return obj;
    });
    /* console.log('targetDataItems', targetDataItems); */
    return targetDataItems;
  }

  typeFormat(propertyType: any, obj: any, sheetCode?: any) {
    obj.isQueryColumn = true;
    // 再根据字段类型做区别配置
    switch (propertyType) {
      case DataItemType.ShortText: // 短文本
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.Logic: // 逻辑
      case DataItemType.StaffSingle: // 选人控件
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        obj.width = 162;
        if (obj.propertyCode === 'name') {
          // 摘要 宽度特殊处理
          obj.width = 296;
        }
        break;
      case DataItemType.LongText: // 长文本
      case DataItemType.DropdownMulti:
      case DataItemType.RelevanceForm: // 关联表单
      case DataItemType.RelevanceFormEx: // 关联表单
        obj.width = 296;
        break;
      case DataItemType.Number: // 数值
        obj.width = 162;
        obj.displayType = 4; // 范围
        console.log(obj.options, 'Number');
        if (obj.options) {
          obj.displayFormat = this.setModelOptionNumber(
            JSON.parse(obj.options),
          );
        } else {
          obj.displayFormat = 1; // 数值默认展示格式
        }
        break;
      case DataItemType.Date: // 日期
        obj.width = 162;
        obj.displayType = 4; // 范围
        /* console.log(obj.options, 'Date'); */
        if (obj.options) {
          obj.displayFormat = this.setModelOptionDate(JSON.parse(obj.options));
        } else {
          obj.displayFormat = this.getFormat(obj.code, sheetCode); // 日期默认展示时分秒
        }
        break;
      case 12: // 时间
        obj.width = 162;
        obj.displayType = 4; // 范围
        if (obj.options) {
          obj.displayFormat = this.setModelOptionDate(JSON.parse(obj.options));
        } else {
          obj.displayFormat = 8; // 时间默认HH:mm:ss
        }
        break;
      default:
        break;
    }
  }

  // 日期格式
  setModelOptionDate(options: any) {
    const dataFormat: any = DateType.find(
      (s: any) => s.format === options.format,
    );
    /* console.log(dataFormat, 'dataFormat'); */
    return dataFormat ? dataFormat.type : 1;
  }

  // 数值格式
  setModelOptionNumber(options: any) {
    // console.log(options, 'options')
    const numberFormat: any = numberList.find(
      (s: any) => s.value === options.format,
    );
    /* console.log(numberFormat, 'numberFormat'); */
    if (numberFormat) {
      const data = numberType.find((s: any) => s.val === numberFormat.label);
      if (data) {
        return data.type;
      }
    }
    return 1;
  }

  // 获取日期格式
  getFormat(code: string, sheetCode?: any): number {
    if (!Object.keys(this.draftAttributesJson).length) {
      return 2;
    }
    //
    if (sheetCode) {
      // 子表
      let data: any = [];
      Object.values(this.draftAttributesJson).forEach((s: any) => {
        if (s.key === sheetCode) {
          data = s.columns;
        }
      });
      if (data.length) {
        const arr: any = data.find((s: any) => s.key === code);
        const sheetFormat =
          arr && arr.options.hasOwnProperty('format')
            ? arr.options.format
            : 'YYYY-MM-DD HH:mm';
        const sheetTypeData: any = DateType.find(
          (s: any) => s.format === sheetFormat,
        );
        return sheetTypeData ? sheetTypeData.type : 2;
      } else {
        return 2;
      }
    } else {
      // 主表
      let format: string = 'YYYY-MM-DD HH:mm';
      Object.values(this.draftAttributesJson).forEach((s: any) => {
        if (s.key === code && s.options.hasOwnProperty('format')) {
          format = s.options.format;
        }
      });
      const typeData: any = DateType.find((s: any) => s.format === format);
      return typeData ? typeData.type : 2;
    }
  }

  init(callByReload?: any) {
    const vm = this;
    // 隐藏过滤条件更改提醒
    vm.setFilterTipsFlag(false);
    // 获取字段数据 fields
    this.getAsycDataItems()
      .then((res) => {
        let resData = res.data;
        if (res.errcode) {
          return this.$message.error(res.errmsg); // 报错
        }
        /* console.log(resData, '模型源数据'); */
        // 需要过滤掉的字段
        const filtersCode = [
          'workflowInstanceId',
          'runnigInstanceId',
          'ID',
          'ownerDeptQueryCode',
        ];
        // 需要过滤掉的数据项类型: 附件(暂时放开-- 6)、审批意见、子表(放开 -- 8)
        const filterPropertyType = [7];
        // 去掉包含上面两个属性的字段

        // 设置数据项列表
        vm.setDataItemList([...resData]);

        resData = resData.filter(
          (item: any) =>
            !filtersCode.includes(item.code) &&
            !filterPropertyType.includes(item.propertyType),
        );
        // 记录原始数据
        vm.originalFieldsData = [...resData];
        // 初始化字段基本(默认)数据和设置, 初建的表是空白的, 这部分由前端填充?
        vm.formatedFieldsData = [...this.setDefaultValue(resData)];
        return vm.formatedFieldsData;
      })
      .then((formatedFieldsData: any) => {
        // 格式化数据视图信息
        vm.getListInfo(formatedFieldsData);
        // 获取关联表单列表
        vm.gerFormList(this.schemaCode);
        // 获取关联流程列表
        vm.getWorkflowList(this.schemaCode);
      });
  }

  vm_pagingSetting: any = {
    pageSize: 20,
    showTotal: true,
  };

  pagingSettingChange() {
    this.setPagingSetting(this.vm_pagingSetting);
  }

  /**
   * 获取列表字段信息
   * 格式化视图信息, 国际化:查询/按钮/排序/显示字段; 注入额外配置:按钮/显示字段;
   */
  async getListInfo(formatedFieldsData: any, editorData?: any) {
    const fromEditor: boolean = !!editorData;

    const vm = this;
    // 查询字段拷贝
    let queryCopy = formatedFieldsData
      ? JSON.parse(JSON.stringify(formatedFieldsData))
      : [];
    // 显示字段拷贝
    let showFieldCopy = formatedFieldsData
      ? JSON.parse(JSON.stringify(formatedFieldsData))
      : [];
    // 按钮(无须拷贝)
    let operationsData = oprationCheckedMap;

    // 处理字段信息, 如果没有从编辑器返回来的数据, 则取接口数据
    let resData: any = editorData;
    // 数据来源, 是否从 api 过来; 如果是, 在 combine 的时候以 api 数据为准, 否则, 以编辑器数据为准
    const dataComesFromApi = !editorData;

    // TODO:是否已经过编辑, 避免无意义的提示
    // 已修改的情况下不重复检测
    if (!this.hasEdited && !!editorData) {
      this.hasEdited = Object.entries(this.queryPresentation).some(([k, v]) => {
        return editorData.queryPresentation[k] !== v;
      });
    }

    // 如果没有编辑器数据, 则读取接口, 获取列表配置;
    // ! 如果读取接口出错, 则抛出提示;
    // false 参数为获取子表元素的数据项带是否显示标志的数据
    if (!resData) {
      const res = await listApi.getListInfo(
        this.schemaCode,
        this.listCode,
        this.clientType,
        false,
      );
      if (res.errcode !== 0) {
        this.$emit('onConfigDataReady', res.errmsg);
        return this.$message.error(res.errmsg);
      }
      // console.log( '_______ listInfo' );
      // console.log( res.data );
      // 针对老数据做提示
      else if (!res.data) {
        this.$emit('onConfigDataReady', res.errmsg);
        return this.$message.error('无展示字段');
      } else {
        //Else Empty block statement
      }
      this.isShowOnPc = res.data.showOnPc;
      this.isShowOnMobile = res.data.showOnMobile;

      if (
        res.data.queryPresentation &&
        res.data.queryPresentation.queryViewDataSource
      ) {
        res.data.queryViewDataSource = JSON.parse(
          res.data.queryPresentation.queryViewDataSource,
        );
        if (
          !this.queryViewDataSource.currentDataItems.length &&
          !this.isReload
        ) {
          // 初次加载
          this.setQueryViewDataSource(res.data.queryViewDataSource);
        }
      } else if (
        this.queryViewDataSource &&
        this.queryViewDataSource.currentDataItems &&
        this.queryViewDataSource.currentDataItems.length > 0
      ) {
        this.setQueryViewDataSource({
          currentDataItems: [],
          relevanceFormsDataItems: [],
        });
      } else {
        //Else Empty block statement
      }

      if (res.data && res.data.customButtons) {
        this.setDatacustomButton(res.data.customButtons);
      }

      resData = res.data;
    }

    if (resData.options) {
      const options: any = JSON.parse(resData.options);
      // 分页设置
      this.vm_pagingSetting.pageSize = options.pagingSetting.pageSize;
      this.vm_pagingSetting.showTotal = options.pagingSetting.showTotal;
    }

    this.setPagingSetting(this.vm_pagingSetting);
    resData.pagingSetting = this.vm_pagingSetting;

    // 在 listDesigner-index.vue 中也需要针对列表配置做些判断, 这里用 emit 打通数据
    this.$emit('onListConfigDataChange', resData);

    // 国际化:查询/按钮/排序/显示字段; 注入额外配置:按钮/显示字段;
    if (resData.name_i18n) {
      // 接口返回的是json字符串, 直接从editor转过来是json字符串, 但从经过发布的editor转过来(会调用这里的getListInfo)时成了对象; 所以需要进行判断
      resData.name_i18n =
        typeof resData.name_i18n === 'string'
          ? JSON.parse(resData.name_i18n)
          : resData.name_i18n;
    }

    // 将列表名字国际化(显示和当前语言选择相匹配的列表名字)
    vm.nameChange({
      name: resData.name,
      isupdate: true,
      name_i18n: resData.name_i18n,
    });

    /* 查询条件: (单据状态名)国际化 */
    if (resData.queryConditions) {
      if (Array.isArray(resData.queryConditions)) {
        resData.queryConditions.forEach((d: any) => {
          // 单据状态的默认值，转回来 20190729 by John
          // WONDER: 单据状态的默认值只有英文(老版本), 所以要转成中文?
          if (d.propertyCode === 'sequenceStatus' && d.defaultValue) {
            const vals_zh: Array<string> = d.defaultValue.split(';');
            const vals_en: Array<string> = [];
            vals_zh.forEach((val: string) => {
              switch (val) {
                case 'DRAFT':
                  vals_en.push('草稿');
                  break;
                case 'PROCESSING':
                  vals_en.push('进行中');
                  break;
                case 'COMPLETED':
                  vals_en.push('已完成');
                  break;
                case 'CANCELED':
                  vals_en.push('已作废');
                  break;
                default:
                  break;
              }
            });
            d.defaultValue = vals_en.join(';');
          }

          if (!d.name_i18n) {
            d = vm.compatibleOldData(d);
          } else {
            d.name_i18n =
              typeof d.name_i18n === 'string'
                ? JSON.parse(d.name_i18n)
                : d.name_i18n;
          }
        });
      }
      const queryArray = resData.queryConditions;
      // queryCopy = dataComesFromApi?
      //   vm.initData(queryCopy, queryArray):
      //   vm.initData(queryArray, queryCopy);

      queryCopy = vm.initData(queryArray, queryCopy);
    }

    /* 操作按钮: 国际化 & 注入基本/默认配置 */
    if (resData.queryActions) {
      if (Array.isArray(resData.queryActions)) {
        resData.queryActions.forEach((d: any) => {
          // FIXME: 目前老列表会出现 name_i18n: ""\"{\\\"en\\\":\\\"新增\\\"}\""" 的情况, 隐患应该在上传时的转换上
          if (!d.name_i18n) {
            d = vm.compatibleOldData(d);
          } else {
            d.name_i18n =
              typeof d.name_i18n === 'string'
                ? JSON.parse(d.name_i18n)
                : d.name_i18n;
          }

          // 正常的 json 数据应该是 "name_i18n":"{\"en\":\"创建时间\"}",
          // 但某些数据(目前只在老视图的 actions 上发现)因为处理不当, 会多一层, 变成  "name_i18n":"\"{\\\"en\\\":\\\"新增\\\"}\""
          // 于是 JSON.parse 出来的还是字符串;
          // 所以这里要多做一次转换
          // 如果还是出错, 就使用 name
          while (typeof d.name_i18n === 'string') {
            try {
              d.name_i18n = JSON.parse(d.name_i18n);
            } catch (err) {
              d.name_i18n = d.name;
              // return this.$message.error('按钮文字解析错误, 请联系工作人员解决')
            }
          }
        });
      }
      const queryBtn = resData.queryActions;
      // 添加是否允许附件已链接的方式访问
      queryBtn.forEach((item) => {
        if (item.queryActionType === 6) {
          if (item.extend1 === null) {
            vm.$set(item, 'extend1', 'false');
          }
        }
      });
      operationsData = vm.setQueryActions(queryBtn) || [];
    }
    /* 排序字段: 国际化 */
    if (resData.querySorts) {
      if (Array.isArray(resData.querySorts)) {
        resData.querySorts.forEach((d: any) => {
          if (!d.name_i18n) {
            d = vm.compatibleOldData(d);
          } else {
            d.name_i18n =
              typeof d.name_i18n === 'string'
                ? JSON.parse(d.name_i18n)
                : d.name_i18n;
          }
        });
      }
      this.targetSortList = resData.querySorts;
    }

    /* 显示字段: 国际化 & 注入基本/默认配置 */
    if (resData.queryColumns) {
      if (Array.isArray(resData.queryColumns)) {
        resData.queryColumns.forEach((d: any) => {
          if (!d.name_i18n) {
            d = vm.compatibleOldData(d);
          } else {
            d.name_i18n =
              typeof d.name_i18n === 'string'
                ? JSON.parse(d.name_i18n)
                : d.name_i18n;
          }
        });
      }
      const { queryColumns } = resData;
      // showFieldCopy = dataComesFromApi?
      //   vm.initData( showFieldCopy, queryColumns ):
      //   vm.initData( queryColumns, showFieldCopy );

      showFieldCopy = this.useDataSourceField(showFieldCopy);

      //数据源中某些字段可能已经在原始模型中删除了，需要调取数据项接口获取数据项数据对比去掉
      showFieldCopy = await vm.compareOriginDataitems(
        vm.initData(queryColumns, showFieldCopy),
      );
    }

    // 设置视图信息
    this.setPresentation(resData.queryPresentation);

    // 记录视图类型
    if (resData.queryPresentationType) {
      this.setPresentationType(resData.queryPresentationType);
    }

    this.setGanttModel(resData.queryGanttModel || {});

    //甘特图标题字段，对于展示字段，标题必须显示
    this.ganttTitleProperty = resData.queryGanttModel
      ? resData.queryGanttModel.titlePropertyCode
        ? resData.queryGanttModel.titlePropertyCode
        : 'name'
      : '';

    // 屏蔽某些查询列表,
    this.setQueryList(queryCopy);
    // 操作列表直接赋值
    this.setOperationList(operationsData, resData.modelType);
    /* console.log(showFieldCopy, 'showFieldCopy'); */
    // 屏蔽某些展示字段
    this.setShowfieldList(showFieldCopy, resData.modelType);

    this.setCustomModelType(resData.modelType);

    // 最终必然是可以编辑的, 放在 if 里会阻断html编辑功能
    this.$emit('onConfigDataReady', true);
  }

  /**
   * 设置按钮参数
   */
  setQueryActions(btnArray: Array<any>) {
    btnArray.forEach((res: any) => {
      res.data = { ...res, data: undefined };
      res.type = res.propertyType;
      res.code = res.propertyCode;
      res.popover = false;
      res.hoverClass = true;
      res.checked = true;
      const CopyBtnPropertyName = btnPropertyName as any;
      res.propertyName = CopyBtnPropertyName[res.actionCode];
    });
    return btnArray;
  }

  setPresentation(data: object) {
    if (!data) {
      return;
    }
    // 做个合并, 编辑器只返回 htmlJson 等3个字段, 接口还包含 id 等字段, 第二次更新时需要id
    this.queryPresentation = { ...this.queryPresentation, ...data };
  }

  /**
   * 初始化后台存储数据
   */
  initData(backData: Array<any>, targetData: Array<any>) {
    const sortBefore: Array<any> = [];
    let sortAfter: Array<any> = [];
    const errorMsg: string[] = [];

    // console.log( backData );
    // console.log( targetData );

    // 合并以 backData 为主
    backData.forEach((res: any) => {
      let target: any = targetData.find((r: any) => {
        // return res.propertyCode === r.propertyCode
        if (r.schemaCode !== res.schemaCode) {
          return false;
        }
        const R_propertyCode = r.propertyCode.split('_$$_');
        if (R_propertyCode.length > 1) {
          return res.propertyCode === R_propertyCode[R_propertyCode.length - 1];
        } else {
          return res.propertyCode === r.propertyCode;
        }
      });

      if (!target) {
        return;
      }

      target = JSON.parse(JSON.stringify(target));

      if (target.propertyType !== res.propertyType) {
        errorMsg.push(`${target.name}`);
      }

      // target = Object.assign(target, res);
      // target.data = Object.assign(target.data, res);
      // 上面的写法会引起res.data的不断嵌套复制
      // 子表的子数据项处理
      if (
        res.propertyType === 8 &&
        Array.isArray(res.childColumns) &&
        Array.isArray(target.childColumns)
      ) {
        res.childColumns.forEach((el) =>
          target.childColumns.forEach((item) => {
            // 将接口获取的子表数据项数据同步到数据源中，最后使用的还是数据源中的数据
            if (el.propertyCode === item.code) {
              item.isQueryColumn = el.visible;
              item.displayFormat = el.displayFormat;
              item.name = el.name;
            }
          }),
        );

        //顺序使用res.childColumns中的
        let targetColsInSort: any[] = [];
        res.childColumns.forEach((item) => {
          targetColsInSort.push(
            target.childColumns.find((el) => el.code === item.propertyCode),
          );
        });

        //子表中的原有字段需要排序，数据源中的字段不需要排序，原封不动加载后端
        targetColsInSort = targetColsInSort.concat(
          target.childColumns.filter(
            (item) =>
              item.parentCode !== item.parentSheetCode &&
              !res.childColumns.some(
                (child) => child.propertyCode === item.code,
              ),
          ),
        );

        // res.childColumns = res.childColumns.concat(target.childColumns.filter(el => res.childColumns.every(item => item.propertyCode !== el.propertyCode && item.code !== el.code)))
        res.childColumns = targetColsInSort.filter((item) => !!item);
        res.childColumns = JSON.parse(JSON.stringify(res.childColumns));

        res.childColumns.forEach((child: any, i: number) => {
          child.id = null;
          const childTarget: any = target.childColumns.find(
            (s: any) => s.code === child.propertyCode,
          );
          if (childTarget) {
            res.childColumns[i] = { ...childTarget, ...child };
          }
        });
      }
      res.data = undefined;
      target = { ...target, ...res, data: { ...target.data, ...res } };
      target.checked = true;
      sortBefore.push(target);
    });

    if (errorMsg.length) {
      this.$emit(
        'onErrorMsgChange',
        `展示字段与数据项类型不一致: [ ${errorMsg.join(', ')} ]`,
      );
    }

    // 连接以 targetData 为主
    sortAfter = targetData.filter((res: any) => {
      const R_propertyCode = res.propertyCode.split('_$$_');
      if (R_propertyCode.length > 1) {
        return !backData.some(
          (item) =>
            item.propertyCode === R_propertyCode[R_propertyCode.length - 1] &&
            item.schemaCode === res.schemaCode,
        );
      } else {
        return !backData.some((item) => item.propertyCode === res.propertyCode);
      }
    });
    return sortBefore.concat(sortAfter);
  }

  /**
   * 业务模型编码
   */
  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  /**
   * 列表编码
   */
  get listCode() {
    return this.$route.params.code;
  }

  /*
   * aside侧边栏重载
   */
  reload() {
    this.isShow = false;
    this.queryPresentation = queryPresentationPlaceholder;
    setTimeout(() => {
      this.isShow = true;
    }, 10);
    this.init(true);
  }

  /**
   * 路由切换 重新请求数据
   */
  @Watch('$route')
  onRouteChange() {
    this.reload();
  }

  isReload: boolean = false;

  @Watch('queryViewDataSource')
  onQueryViewDataSourceChange(value, oldValue) {
    if (this.isReload) {
      let showFieldCopy = [...this.setDefaultValue(this.originalFieldsData)];
      showFieldCopy = this.useDataSourceField(showFieldCopy);
      this.reloadInitShowField(showFieldCopy);
      this.compareOriginDataitems(showFieldCopy).then((res) => {
        this.setShowfieldList(res, this.customModelType);
      });
    } else {
      this.isReload = true;
    }
  }

  changeGanttAttr(code) {
    if (this.ganttModel.titlePropertyCode !== this.ganttTitleProperty) {
      this.ganttTitleProperty = this.ganttModel.titlePropertyCode;
      (this.$refs['showField'] as any).moveTitleToFirst(
        this.storeShowFieldArray,
        true,
      );
    } else {
      (this.$refs['showField'] as any).addShowfield(
        this.storeShowFieldArray,
        code,
      );
    }
  }

  /**
   * 对新增按钮绑定流程表单时，展示字段增加当前处理人字段
   * index: 插入位置
   */
  setWorkflowForm(index?: number, showParticipant?: boolean) {
    if (this.showfieldList.some((item) => item.code === 'participants_')) {
      return;
    }
    if (!index && index !== 0) {
      index = this.showfieldList.length;
    }
    this.showfieldList.splice(index + 1, 0, {
      name: '当前处理人',
      name_i18n: { en: 'Current Approver', zh: '当前处理人' },
      propertyCode: 'participants_',
      code: 'participants_',
      propertyType: 50,
      propertyName: '当前处理人',
      dataIndex: 'participants_',
      isSystem: true,
      type: 50,
      scopedSlots: { customRender: 'participants_' },
      relativeSchemaCode: null,
      childColumns: null,
      data: {
        name: '当前处理人',
        name_i18n: { en: '当前处理人', zh: '当前处理人' },
        propertyCode: 'participants_',
        code: 'participants_',
        propertyType: 50,
        propertyName: '当前处理人',
        dataIndex: 'participants_',
        isSystem: true,
        type: 50,
        scopedSlots: { customRender: 'participants_' },
        relativeSchemaCode: null,
        childColumns: null,
        schemaCode: 'xjl_DonePerson',
        choiceType: 1,
        defaultValue: '',
        displayType: 0,
        endValue: '',
        startValue: '',
        options: null,
        visible: true,
        relativeQueryCode: '',
        defaultState: 1,
        accurateSearch: false,
        dateType: 0,
        sortKey: 2,
        userOptionType: 1,
        checked: false,
        hoverClass: false,
        direction: 1,
        width: '162',
        unit: null,
        sumType: null,
        displayFormat: 2,
        popover: false,
        isQueryColumn: true,
        id: 'afeb204e800883b701800cd836d50233',
        remarks: null,
        createdTime: '2022-04-09 13:42:18',
        modifiedTime: '2022-04-10 17:58:20',
        deleted: false,
        createdBy: null,
        modifiedBy: 'afeb204e7fb075c7017fb102fb0005f3',
        isDefaultProperty: true,
        queryId: 'afeb204e800883b701800cd836a4022f',
        clientType: 'PC',
        schemaAlias: 'a_1',
        propertyAlias: 'participants_',
        syncDefaultFormat: false,
        displayFields: null,
        queryLevel: 1,
        data: '__vue_devtool_undefined__',
      },
      schemaCode: 'xjl_DonePerson',
      choiceType: 1,
      defaultValue: '',
      displayType: 0,
      endValue: '',
      startValue: '',
      options: null,
      visible: true,
      relativeQueryCode: '',
      defaultState: 1,
      accurateSearch: false,
      dateType: 0,
      sortKey: 2,
      userOptionType: 1,
      checked: showParticipant === undefined ? true : showParticipant,
      hoverClass: false,
      direction: 1,
      width: '162',
      unit: null,
      sumType: null,
      displayFormat: 2,
      popover: false,
      isQueryColumn: true,
      id: 'afeb204e800883b701800cd836d50233',
      remarks: null,
      createdTime: '2022-04-09 13:42:18',
      modifiedTime: '2022-04-10 17:58:20',
      deleted: false,
      createdBy: null,
      modifiedBy: 'afeb204e7fb075c7017fb102fb0005f3',
      isDefaultProperty: true,
      queryId: 'afeb204e800883b701800cd836a4022f',
      clientType: 'PC',
      schemaAlias: 'a_1',
      propertyAlias: 'participants_',
      syncDefaultFormat: false,
      displayFields: null,
      queryLevel: 1,
    });
  }

  setNormalForm() {
    this.showfieldList = this.showfieldList.filter(
      (item) => item.code !== 'participants_',
    );
  }

  async compareOriginDataitems(showfieldCopy) {
    const itemMap = new Map();
    showfieldCopy.forEach((item) => {
      if (itemMap.has(item.schemaCode)) {
        const currValue = itemMap.get(item.schemaCode);
        currValue.push(this.divideDataSourceCode(item.code));
        itemMap.set(item.schemaCode, currValue);
      } else {
        itemMap.set(item.schemaCode, [this.divideDataSourceCode(item.code)]);
      }
    });

    for (const schemaCode of itemMap.keys()) {
      await getDataItems(schemaCode, true).then((resp) => {
        if (resp.errcode === 0) {
          const prevCodes = itemMap.get(schemaCode);
          itemMap.set(
            schemaCode,
            prevCodes.filter((code) =>
              resp.data.some((dataitem) => dataitem.code === code),
            ),
          );
        }
      });
    }

    let allCodes = [];
    let resultCodes = [];

    for (const schemaCode of itemMap.keys()) {
      allCodes = allCodes.concat(itemMap.get(schemaCode));
    }

    for (const schemaCode of itemMap.keys()) {
      //本模型的字段不需要额外逻辑，直接添加
      if (schemaCode === this.schemaCode) {
        resultCodes = resultCodes.concat(itemMap.get(schemaCode));
      } else {
        //数据源中字段数据的schemaCode对应的是另一个模型中的关联单选字段的业务模型
        //想要正常显示数据源字段，必须在连接该字段所在模型的关联单选没有被删除的情况下
        // ==> 关联单选链上任意一个被删除，都不会正常显示，所以要检测整条链
        let curSchemaCode = schemaCode;
        let relevanceItem = null;
        let breakFlag = false;
        do {
          relevanceItem = showfieldCopy.find(
            (item) => item.relativeSchemaCode === curSchemaCode,
          );
          if (
            (relevanceItem &&
              !allCodes.includes(
                this.divideDataSourceCode(relevanceItem.code),
              )) ||
            !relevanceItem
          ) {
            breakFlag = true;
          } else {
            curSchemaCode = relevanceItem.schemaCode;
          }
        } while (curSchemaCode !== this.schemaCode && !breakFlag);

        if (!breakFlag) {
          resultCodes = resultCodes.concat(itemMap.get(schemaCode));
        }
      }
    }

    return showfieldCopy.filter((item) =>
      resultCodes.some((code) => this.divideDataSourceCode(item.code) === code),
    );
  }

  /**
   * 分离数据源展示字段编码，获取数据项编码
   * 如model_$$_code分离后得到code
   */
  divideDataSourceCode(str) {
    if (str.includes('_$$_')) {
      return str.split('_$$_')[1];
    } else {
      return str;
    }
  }

  useDataSourceField(showFieldCopy) {
    // 如果存在显示字段数据源，使用显示字段数据源
    if (this.queryViewDataSource.currentDataItems.length) {
      const filterCurrentDataItems =
        this.queryViewDataSource.currentDataItems.filter(
          (el) => !el.parentSheetId,
        );

      showFieldCopy = this.setDefaultValue(filterCurrentDataItems);
    }

    if (this.queryViewDataSource.relevanceFormsDataItems.length) {
      let res: any[] = [];
      this.queryViewDataSource.relevanceFormsDataItems.forEach((item) => {
        if (item.isMainTable) {
          // 主表关联表单字段
          const temp = JSON.parse(JSON.stringify(item));
          res = [
            ...res,
            ...temp.dataItems.filter((el) => {
              if (el.code.indexOf('_$$_') === -1) {
                el.name = temp.relativeName + '.' + el.name;
                el.code = temp.relativeCode + '_$$_' + el.code;
                el.parentCode = temp.code; // 数据项编码
                el.parentName = temp.relativeName;
                el.isMainTable = temp.isMainTable;
                el.parentSheetCode = temp.parentSheetCode;
                el.parentSheetName = temp.parentSheetName;
                el.schemaCode = temp.relativeCode;
                el.path = temp.path;
              }
              return temp.checkedList.includes(el.id);
            }),
          ];
        } else {
          const sheet = showFieldCopy.find(
            (el) => el.propertyCode === item.parentSheetCode,
          );
          // 子表中关联表单 选中的可显示字段
          const checkedDataItems: any[] =
            item.dataItems.filter((el) => {
              // el.name =  item.relativeName + '.' + el.name
              // el.code =  item.options.schemaCode + '_$$_' + el.code
              el.parentCode = item.code; // 数据项编码
              el.parentName = item.propertyTypeName;
              el.isMainTable = item.isMainTable;
              el.parentSheetCode = item.parentSheetCode;
              el.parentSheetName = item.parentSheetName;
              el.isQueryColumn = true;
              // el.schemaCode = item.schemaCode

              return item.checkedList.includes(el.id);
            }) || [];
          if (sheet.data) {
            sheet.data.childColumns =
              sheet.data.childColumns.concat(checkedDataItems);
          }

          sheet.childColumns = sheet.childColumns.concat(checkedDataItems);
        }
      });
      showFieldCopy = [...showFieldCopy, ...this.setDefaultValue(res)];
    }
    return showFieldCopy;
  }

  /**
   * 更新完数据源后合并选中的展示字段和所有字段
   */
  reloadInitShowField(showFieldCopy) {
    showFieldCopy.forEach((field) => {
      const curField = this.showfieldList.find(
        (item) => item.code === field.code,
      );
      if (curField) {
        field.checked = this.storeShowFieldArray.some(
          (item) => item.code === field.code,
        );

        // 子表的子数据项处理
        if (
          field.propertyType === 8 &&
          Array.isArray(field.childColumns) &&
          Array.isArray(curField.childColumns)
        ) {
          //第一步：去除当前展示字段子表内所有已经被数据源删除的数据项
          curField.childColumns = curField.childColumns.filter((item) => {
            return (
              item.schemaCode === this.schemaCode ||
              field.childColumns.some((el) => el.code === item.code)
            );
          });
          //第二步：向当前展示字段中子表内添加数据源新增的数据项
          curField.childColumns = curField.childColumns.concat(
            field.childColumns.filter((item) => {
              return !curField.childColumns.some((el) => el.code === item.code);
            }),
          );
          //第三步：最终使用当前展示字段中的子表数据
          field.childColumns = curField.childColumns;
          field.name = curField.name;
          if (field.data) {
            field.data.childColumns = curField.childColumns;
            field.data.name = curField.data.name;
          }
        }
      } else {
        field.checked = false;
      }
    });
  }
}
</script>

<style lang="less">
@import '~@/styles/color/colors.less';
@bar-height: 48px;
.design-wrapper {
  overflow: hidden;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  .aside {
    height: 100%;
    & > .ant-tabs {
      height: 100%;
      background: #fff;
    }
    .ant-tabs-content {
      height: calc(100vh - 60px - 50px - 56px);
      margin-top: 8px;
      .aside-box-wrap {
        overflow: auto;
        height: 100%;
        padding-bottom: 15px;
      }
    }
  }
  .aside-box {
    &:first-child {
      margin-top: 0;
    }
    border: 1px solid #fff;
    margin-top: 8px;
    background: #fff;
    border-radius: 4px;
    &-title {
      height: 14px;
      margin-top: 8px;
      margin-bottom: 8px;
    }
  }
  .list-box {
    text-align: left;
    li {
      padding: 0 4px;
      padding-right: 0;
      min-height: 30px;
      line-height: 30px;
      cursor: default;
      .list-icon {
        visibility: hidden;
        .icons {
          margin-left: 9px;
        }
      }
      &.hoverClass {
        background: @sub-bg-color;
        .list-icon {
          visibility: visible;
        }
      }
      &:hover {
        background: @sub-bg-color;
        .list-icon {
          visibility: visible;
        }
      }
    }
  }
  .ant-collapse {
    border: 0;
    background-color: #e9edf2;

    .ant-collapse-item {
      border-bottom: 0;
      background: #ffffff;
      border-radius: 4px;
      .ant-collapse-header {
        text-align: left;
        font-size: 13px;
        line-height: 20px;
        font-weight: bold;
        color: #111218;
        padding: 10px 0 10px 36px;
        position: relative;
        .ant-collapse-arrow {
          left: 17px;
        }
        .aufontAll {
          font-weight: normal;
        }
        .arrow {
          left: 8px;
          color: rgba(17, 18, 24, 0.5) !important;
          font-weight: 400 !important;
        }
        .h-icon-all-plus-o {
          font-size: 12px;
          font-weight: bold;
          position: absolute;
          right: 20px;
          height: 16px;
          width: 16px;
        }
      }
      &.color-panel {
        .ant-collapse-content {
          border-top: unset;
        }
      }
    }
    .ant-collapse-content {
      border-color: #e9e9e9;
      border-top: unset;
      overflow: inherit;
      .attr-rows {
        padding-left: 16px;
      }
    }
    .ant-collapse-content > .ant-collapse-content-box {
      padding: 0;
      .style-block {
        padding-left: 16px;
        .style-title {
          font-size: 12px;
          font-weight: bold;
          padding: 7px 0;
          color: #111218;
          line-height: 18px;
          position: relative;
          i {
            cursor: pointer;
          }
          .h-icon-all-plus-o {
            position: absolute;
            right: 21px;
            font-size: 12px;
            &:hover {
              color: #2970ff;
            }
          }
        }
        .ant-radio-group {
          white-space: nowrap;
          padding-bottom: 19px;
          .ant-radio-wrapper {
            margin-right: 6px;
          }
          span.ant-radio + * {
            padding-left: 6px;
          }
        }
      }
    }
  }
}

.paging-setting {
  margin: 0 11px 0 35px;
  .paging-setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 22px;
    label {
      font-size: 12px;
      color: #111218;
      font-weight: 600;
    }
    .ant-select {
      width: 100%;
      margin: 6px 0;
    }
  }
}
</style>

<style lang="less">
@import '~@/styles/tab.less';
</style>

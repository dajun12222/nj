<template>
  <h3-panel
    v-if="control.columns.length > 0"
    v-show="display"
    :title="!canFull ? label : ''"
    :collapsible="true"
    :labelStyle="style"
    :iconRight="true"
    :tips="tips"
    :class="{ required: control.required, titleHidden: titleVisible === false }"
  >
    <a-divider v-if="(!readonly || canExport) && !canFull" />

    <slot name="settingTips"></slot>

    <template v-if="!canFull" slot="fullIcon">
      <a-tooltip placement="top">
        <template slot="title">
          <span>{{ $t('cloudpivot.form.runtime.biz.fullScreen') }}</span>
        </template>
        <span class="fullscreen icon aufontAll" @click="$emit('fullScreen')">&#xe8e5;</span>
      </a-tooltip>
    </template>

    <div v-if="(!readonly || canExport) && !canFull" class="actions">
      <template>
        <a-button
          v-if="!readonly && canEdit"
          icon="plus"
          type="primary"
          @click="add"
        >
          {{ $t('cloudpivot.form.runtime.biz.add') }}
        </a-button>

        <a-button
          v-if="!readonly && importFormRelevanceForm && canEdit"
          icon="download"
          @click="importRelevance"
        >
          {{ $t('cloudpivot.form.runtime.biz.importFormRelevanceForm') }}
        </a-button>

        <a-button
          v-if="!readonly && importAble && canEdit"
          icon="download"
          @click="importSheet"
        >
          {{ $t('cloudpivot.form.runtime.biz.import') }}
        </a-button>

        <a-button
          v-if="canExport"
          icon="upload"
          :disabled="canEdit"
          @click="exportSheet"
        >
          {{ $t('cloudpivot.form.runtime.biz.export') }}
        </a-button>

        <a-button
          v-if="!readonly && canEdit && getshowAllEdit"
          icon="edit"
          :disabled="!canEdits"
          @click="allEdit"
        >
          {{ $t('cloudpivot.form.runtime.biz.edit') }}
        </a-button>

        <a-button
          v-if="!readonly && canEdit"
          icon="delete"
          :disabled="!canDelete"
          @click="removeChecked"
        >
          {{ $t('cloudpivot.form.runtime.biz.delete') }}
        </a-button>

        <!-- 筛选 S -->
        <!-- <filterCard
          @clear="onReset"
          v-if="queryConditionSource.length === 1"
          :source="queryConditionSource"
        />
        <filterCard
          class="mr"
          @item-click="toggleQuery"
          @clear="onReset"
          v-else-if="queryConditionSource.length > 1"
          :source="queryConditionSource"
        />
        <a-tooltip v-if="queryConditionSource.length <= 1&&sheetFiters.length>0">
          <template slot="title">{{ $t("cloudpivot.list.pc.Screen") }}</template>
          <i
            class="icon aufontAll h-icon-all-filter-o"
            :style="`color:${isShowQueryItem ? '#2970ff':''};float: right;`"
            @click="toggleQuery"
          ></i>
        </a-tooltip> -->

        <!-- 筛选 E -->

        <template v-for="act in sheetCustomActions">
          <a-button
            v-show="act.visible"
            :key="act.code"
            :disabled="act.disabled"
            @click="customBtnclick(act.code)"
          >
            {{ act.text }}
          </a-button>
        </template>
      </template>
      <div
        v-if="sheetFiters.length > 0"
        class="table-toolbar-box-li"
        :class="{ 'high-light': isShowQueryItem || queryActive }"
        @click="toggleQuery"
      >
        <i class="icon aufontAll h-icon-all-screen"></i>
        {{ $t('cloudpivot.list.pc.Screen') }}
      </div>
    </div>

    <div v-if="canFull" class="actions heard">
      <h3>{{ label }}</h3>
      <a-tooltip placement="top">
        <template slot="title">
          <span>{{ $t('cloudpivot.form.runtime.biz.smallScreen') }}</span>
        </template>
        <span
          class="fullscreen icon aufontAll"
          :class="inLog ? 'inLog' : ''"
          @click="$emit('fullScreen')"
          >&#xe8e7;</span>
      </a-tooltip>
    </div>
    <div v-if="canFull">
      <template v-if="!readonly || canExport">
        <div
          v-if="sheetFiters.length > 0"
          class="table-toolbar-box-li"
          :class="{ 'high-light': isShowQueryItem || queryActive }"
          @click="toggleQuery"
        >
          <i class="icon aufontAll h-icon-all-screen"></i>
          {{ $t('cloudpivot.list.pc.Screen') }}
        </div>
        <!-- 筛选 E -->

        <a-button
          v-if="!readonly && canEdit"
          icon="plus"
          type="primary"
          @click="add"
        >
          {{ $t('cloudpivot.form.runtime.biz.add') }}
        </a-button>

        <a-button
          v-if="!readonly && importFormRelevanceForm && canEdit"
          icon="download"
          @click="importRelevance"
        >
          {{ $t('cloudpivot.form.runtime.biz.importFormRelevanceForm') }}
        </a-button>
        <a-button
          v-if="!readonly && importAble && canEdit"
          icon="download"
          @click="importSheet"
        >
          {{ $t('cloudpivot.form.runtime.biz.import') }}
        </a-button>

        <a-button
          v-if="canExport"
          icon="upload"
          :disabled="isEdit"
          @click="exportSheet"
        >
          {{ $t('cloudpivot.form.runtime.biz.export') }}
        </a-button>

        <a-button
          v-if="!readonly && canEdit && getshowAllEdit"
          icon="edit"
          :disabled="!canEdits"
          @click="allEdit"
        >
          {{ $t('cloudpivot.form.runtime.biz.edit') }}
        </a-button>
        <a-button
          v-if="!readonly && canEdit"
          icon="delete"
          :disabled="!canDelete"
          @click="removeChecked"
        >
          {{ $t('cloudpivot.form.runtime.biz.delete') }}
        </a-button>

        <!-- 筛选 S -->
        <!-- <filterCard
          @clear="onReset"
          v-if="queryConditionSource.length === 1"
          :source="queryConditionSource"
        />
        <filterCard
          class="mr"
          @item-click="toggleQuery"
          @clear="onReset"
          v-else-if="queryConditionSource.length > 1"
          :source="queryConditionSource"
        />
        <a-tooltip v-if="queryConditionSource.length <= 1&&sheetFiters.length>0">
          <template slot="title">{{ $t("cloudpivot.list.pc.Screen") }}</template>
          <i
            class="icon aufontAll h-icon-all-filter-o"
            :style="`color:${isShowQueryItem ? '#2970ff':''};margin-left: 10px;`"
            @click="toggleQuery"
          ></i>
        </a-tooltip> -->

        <template v-for="act in sheetCustomActions">
          <a-button
            v-show="act.visible"
            :key="act.code"
            :disabled="act.disabled"
            @click="customBtnclick(act.code)"
          >
            {{ act.text }}
          </a-button>
        </template>
      </template>
    </div>

    <import-modals
      v-if="showModal"
      ref="importModals"
      :visible="showModal"
      :params="sheetParams"
      :sheet="control"
      @cancel="handleCancel"
      @importFinishe="importFinishe"
      @repeatErrorHandle="repeatErrorHandle"
    />
    <use-repeat-modals
      v-model="showRepeatModal"
      :importData="importData"
      :status="importStatu.status"
      :successNum="importStatu.successNum"
      :failNum="importStatu.failNum"
      :fileName="importStatu.fileName"
      @cancel="closeRepeatModal"
      @editFinishe="editFinishe"
    />
    <a-spin :spinning="importDataNum && !(importDataNum === total)">
      <div
        v-show="isShowQueryItem"
        class="filters-box"
        :style="canFull ? 'right: 185px;' : ''"
      >
        <sheet-filter
          ref="sheetFilter"
          :data="sheetFiters"
          :searchs="queryData"
          :datatype="datatype"
          @reset="onReset"
          @search="onSearch"
          @hide="hideQueryItem"
        />
      </div>

      <sheet
        ref="sheet"
        :key="pageStart"
        :rowNumber="pageStart"
        :checkbox="(canEdit && !readonly) || canExport"
        :showAction="!readonly && canEdit"
        :showTotal="controlOpts.showTotal"
        :columns="control.columns"
        :columnOptions="columnOptions"
        :rows="pagingRows"
        :originalRows="rows"
        :stats="statisticsMap"
        :checkeds="pagingCheckeds"
        :class="{ fullsheet: canFull }"
        :frozenKeys="frozenKeys"
        @check="onCheck"
        @checkAll="onCheckAll"
        @columnResize="onColumnResize"
        @freezeColumn="onFreezeColumn"
      >
        <template slot="action" slot-scope="{ row, index }">
          <a-popover
            v-if="canEdit"
            overlayClassName="sheet-menus"
            trigger="click"
            :getPopupContainer="getNewPopupContainer"
          >
            <template v-if="canEdit" slot="content">
              <ul class="row-menus _form-sheet">
                <li
                  v-if="canEdit"
                  :title="$t('cloudpivot.form.renderer.copy')"
                  @click="copy(index, row)"
                >
                  {{ $t('cloudpivot.form.renderer.copy') }}
                </li>
                <li
                  v-if="canEdit"
                  :title="$t('cloudpivot.form.renderer.sheet.clearRow')"
                  @click="clear(index)"
                >
                  {{ $t('cloudpivot.form.renderer.sheet.clearRow') }}
                </li>
                <li
                  v-if="canEdit"
                  :title="$t('cloudpivot.form.renderer.sheet.addBefore')"
                  @click="add(index)"
                >
                  {{ $t('cloudpivot.form.renderer.sheet.addBefore') }}
                </li>
                <li
                  v-if="canEdit"
                  :title="$t('cloudpivot.form.renderer.sheet.addAfter')"
                  @click="add(index + 1)"
                >
                  {{ $t('cloudpivot.form.renderer.sheet.addAfter') }}
                </li>
              </ul>
            </template>
            <a-icon class="ellipsis" type="ellipsis" />
          </a-popover>
        </template>
      </sheet>
    </a-spin>

    <div v-show="total > 10" class="pagination">
      <a-pagination
        :current="pageIndex"
        :total="total"
        :showTotal="(total) => $t('cloudpivot.list.pc.Total', { num: total })"
        :pageSize="pageSize"
        :pageSizeOptions="pageSizeOptions"
        showSizeChanger
        showQuickJumper
        @change="onPageIndexChange"
        @showSizeChange="onPageSizeChange"
      />
    </div>

    <a-modal
      :title="formTitle"
      :visible="isShowRelevance"
      :width="'850px'"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      :class="{ 'relevance-form': true }"
      @ok="onModalOk"
      @cancel="onModalCancel"
    >
      <list-selector
        v-model="selected"
        :newCol="newCol"
        :listCode="queryCode"
        :schemaCode="schemaCode"
        :cols="2"
        :columns="columns"
        :showActions="false"
        :query="query"
        :defuaultShowSearch="false"
        :multiple="true"
        :control="relavanceControl"
        :relevanceFormCode="relavanceControl"
      />
      <!-- @change="onListChange" -->
    </a-modal>

    <!-- 批量编辑 -->
    <a-modal
      :visible="showModal2"
      :width="'600px'"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      :class="{ 'relevance-form': true }"
      @ok="onshowModal2"
      @cancel="(showModal2 = false), (showModalLength = 0)"
    >
      <template slot="title">
        {{ $t('cloudpivot.form.runtime.biz.edit') }}
        <span
          style="
            font-size: 12px;
            color: rgba(0, 0, 0, 0.45);
            line-height: 22px;
            margin-left: 16px;
          "
          >本次操作将修改{{ showModalLength }}条数据</span>
      </template>
      <all-edit ref="allEdit" :data="sheet.columns" @change="alledits" />
    </a-modal>
  </h3-panel>
</template>

<script lang="ts">
import { listApi, formApi } from '../../../../../api';
import common from '../../../../../common/pc';
import * as schema from '../../../../../form/schema';
import * as typings from '../../../../../form/schema';
import { RendererFormControl } from '../../../../../form/schema';
import ImportModals from '../../../../../form/src/common/components/import-data/import.vue';
import sheetFilter from '../../../../../form/src/common/components/import-data/sheet-filter/index.vue';
import UseRepeatModals from '../../../../../form/src/common/components/import-data/usename-repeat/index.vue';
import { FormSheetControl } from '../../../../../form/src/common/controls/form-sheet-control';
import { RelevanceFormControl } from '../../../../../form/src/common/controls/relevance-form-control';
import { UploadControl } from '../../../../../form/src/common/controls/upload-control';
import {
  FormControlValueService,
  ReverseQueryService,
} from '../../../../../form/src/common/services';
import BaseControlAdapter from '../../../../../form/src/renderer/components/pc/base-control-adapter.vue';
import { FormBuilderHelper } from '../../../../../form/src/renderer/controls/form-builder-helper';
import numberFilter from '../../../../../form/utils/number-filter';
import filterCard from '../../../../../list/src/components/pc/components/filter-card/filter-card.vue';
import {
  Button,
  Checkbox,
  Divider,
  Icon,
  Modal,
  Pagination,
  Popover,
  Spin,
  Tooltip,
} from '@h3/antd-vue';
import moment from 'moment';
import {
  Component,
  Inject,
  Prop,
  Provide,
  Watch,
} from 'vue-property-decorator';
import alledit from './alledit.vue';
import Sheet, { ColumnResize } from './pc-sheet';
import SheetComp from './sheet.vue';

export interface SheetColumnResize extends ColumnResize {
  sheet: schema.FormSheet;
}

@Component({
  name: 'form-sheet',
  components: {
    AllEdit: alledit,
    sheetFilter: sheetFilter,
    filterCard: filterCard,
    AModal: Modal,
    AIcon: Icon,
    APopover: Popover,
    ADivider: Divider,
    AButton: Button,
    ACheckbox: Checkbox,
    ATooltip: Tooltip,
    APagination: Pagination,
    ASpin: Spin,
    BaseControlAdapter,
    ImportModals,
    UseRepeatModals,
    H3Panel: common.components.Panel,
    H3SizeSlider: common.components.H3SizeSlider,
    Sheet: SheetComp,
  },
  filters: {
    number: numberFilter,
  },
})
export default class FormSheet extends FormSheetControl {
  @Prop({
    default: false,
  })
  canFull!: boolean;

  @Prop()
  formPermission!: any;

  @Inject()
  emitSheetColumnResize!: (data: SheetColumnResize) => void;

  @Provide()
  getControl() {
    return this.control;
  }

  isFullScreen = false;

  // 分页配置项
  pageSizeOptions = ['10', '20', '50', '100'];

  pageSize = 10;

  pageIndex = 1;

  importDataNum = null;

  queryActive: boolean = false;

  newCol: any = [];

  get canDelete() {
    return this.checkeds.some((c) => c);
  }

  get canEdits() {
    return this.checkeds.some((c) => c);
  }

  get total() {
    return this.rows.length;
  }

  get pageStart() {
    const start = (this.pageIndex - 1) * this.pageSize;
    return start;
  }

  get pageEnd() {
    let end = this.pageIndex * this.pageSize;
    if (end > this.total) {
      end = this.total;
    }
    return end;
  }

  get pagingRows() {
    return this.rows.slice(this.pageStart, this.pageEnd);
  }

  get relavanceControl() {
    const controlList = this.control.columns;
    const theControl =
      controlList &&
      controlList.find((i: any) => {
        return i.key === this.control.options.importFormRelevanceForm;
      });
    return theControl;
  }

  get pagingCheckeds() {
    return this.checkeds.slice(this.pageStart, this.pageEnd);
  }

  get titleVisible() {
    return this.control.options.labelVisible;
  }

  @Prop({
    default: () => [],
  })
  frozenKeys!: string[];

  getNewPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  @Watch('isEdit')
  onIsEditChange() {
    super.edit();
  }

  setControl() {
    const ctrl = this.getCtrl();
    if (!ctrl) {
      return;
    }

    sessionStorage.removeItem('sheet-' + this.id);

    this.reset();

    super.listenPropertyChange();

    this.initRows(this.canFull, 'pc');

    super.initStat();

    this.checkeds = this.rows.map(() => false);

    super.listenRowChange();

    if (this.canFull && this.control.edit) {
      super.edit();
    }
  }

  onCheck(checkeds: boolean[]) {
    this.checkeds.splice(
      this.pageStart,
      this.pageEnd - this.pageStart,
      ...checkeds,
    );
  }

  onCheckAll(check: boolean) {
    this.checkeds = this.checkeds.map(() => check);
  }

  onColumnResize(data: SheetColumnResize) {
    if (this.emitSheetColumnResize) {
      data.sheet = this.sheet;
      this.emitSheetColumnResize(data);
    }
  }

  onFreezeColumn(columnKey: string, freeze: boolean) {
    this.$emit('freezeColumn', columnKey, freeze);
  }

  onPageIndexChange(page: number, size: number) {
    this.pageIndex = page;

    this.unsubscribeValueChange();
  }

  onPageSizeChange(page: number, size: number) {
    this.pageIndex = 1;
    this.pageSize = size;

    this.unsubscribeValueChange();
  }

  /**
   * 销毁控件监听
   */
  unsubscribeValueChange() {
    if (
      (window as any).valueChangeSubscriptionList &&
      (window as any).valueChangeSubscriptionList.length > 0
    ) {
      (window as any).valueChangeSubscriptionList.forEach((sub: any) =>
        sub.unsubscribe(),
      );
      (window as any).valueChangeSubscriptionList.length = 0;
    }
  }

  showModal2: boolean = false;

  showModalLength: number = 0;

  // 批量编辑
  allEdit() {
    console.log(this.sheet, 'sheet');
    const indexs: number[] = [];
    for (let i = 0; i < this.checkeds.length; i++) {
      const s = this.checkeds[i];
      if (s) {
        indexs.push(i);
      }
    }
    this.showModalLength = indexs.length;
    this.showModal2 = true;
  }

  // 批量编辑确认
  onshowModal2() {
    (this.$refs['allEdit'] as any).emits();
  }

  // 批量编辑
  alledits(value: any) {
    console.log(value);
    this.showModal2 = false;
    this.showModalLength = 0;
    if (Object.values(value).length) {
      const indexs: number[] = [];
      for (let i = 0; i < this.checkeds.length; i++) {
        const s = this.checkeds[i];
        if (s) {
          indexs.push(i);
        }
      }
      try {
        this.rows.forEach((d: any, i: number) => {
          if (indexs.indexOf(i) > -1) {
            Object.keys(value).forEach((k) => {
              d.forEach((s) => {
                if (value[k].key === s.key) {
                  // 禁用不可批量修改
                  if (s.options.readonlyFormula || s.controller.disabled) {
                    return;
                  }
                  if ([1, 2, 4, 5, 6, 7, 19].indexOf(s.type) > -1) {
                    // 短文本,长文本,数值,单选,复选,下拉
                    if (s.type === 4) {
                      // 数值
                      console.log('value[k].value===>', value[k].value);
                      s.controller.value = value[k].value * 1;
                    } else {
                      s.controller.value = value[k].value;
                    }
                  } else if (s.type === 3) {
                    // 日期
                    s.controller.value = new Date(value[k].value);
                  }
                }
              });
            });
          }
        });
        this.$message.success(
          `${
            (this as any).$i18n.locale === 'zh'
              ? '操作成功'
              : 'Successful operation'
          }`,
        );
      } catch (error) {
        this.$message.error(
          `${
            (this as any).$i18n.locale === 'zh'
              ? '操作失败'
              : 'operation failed'
          }`,
        );
      }
    }
  }

  removeChecked() {
    this.importDataNum = null;
    const indexs: number[] = [];
    const indexCopy: number[] = [];
    for (let i = 0; i < this.checkeds.length; i++) {
      const s = this.checkeds[i];
      const row: any = this.rows[i];
      if (s && i < this.rows.length) {
        indexs.push(row[0].controller.options.rowIndex);
        indexCopy.push(i);
      }
    }
    this.removeRows(indexs);

    // 子表筛选过后处理逻辑
    if (indexs.join() !== indexCopy.join()) {
      indexCopy
        .sort((a, b) => a - b)
        .reverse()
        .forEach((d: number) => {
          this.rows.splice(d, 1);
        });
      this.onCheckAll(false);
    }
    //选中数据等于子表全量数据时，表示全部删除，当前页码回到第一页
    if (this.rows.length === this.checkeds.length) {
      this.pageIndex = 1;
      this.unsubscribeValueChange();
    }
  }

  copy(idx: number, row: any) {
    this.importDataNum = null;
    super.copy(idx, row);
  }

  add(idx?: number, vals?: any) {
    this.importDataNum = null;
    const row =
      typeof idx === 'number' ? this.addRow(vals, idx) : this.addRow(vals);
  }

  splice(idx: number) {
    this.removeRow(idx);
  }

  rowInserted(index: number, row: RendererFormControl[]): void {
    this.importDataNum = null;
    this.checkeds.splice(index, 0, false);
    if (this.control.edit) {
      super.edit();
    }
    this.syncScroll();
  }

  rowRemoved(index: number, row: RendererFormControl[]) {
    this.importDataNum = null;
    this.checkeds.splice(index, 1);
  }

  rowsInserted(index: number, rows: RendererFormControl[][]): void {
    this.importDataNum = null;
    const news = rows.map(() => false);
    this.checkeds.splice(index, 0, ...news);
    if (this.control.edit) {
      super.edit();
    }
    this.syncScroll();
  }

  rowsRemoved(indexs: number[]) {
    this.importDataNum = null;
    for (const index of indexs) {
      this.checkeds.splice(index, 1);
    }
  }

  syncScroll() {
    this.$nextTick(() => {
      const $sheet = this.$refs.sheet as Sheet;
      if ($sheet) {
        $sheet.syncScrollLeft();
        $sheet.handleRootScroll();
      }
    });
  }

  /**
   * 子表导入,导出代码
   */
  showModal = false;

  // 是否显示人员重复的弹框
  showRepeatModal = false;

  importSheet() {
    this.importDataNum = null;
    this.showModal = true;
  }

  /**
   * reset
   */
  handleCancel() {
    this.importDataNum = null;
    const fileName =
      (this.$refs.importModals as any).errorFile ||
      (this.$refs.importModals as any).importFileName;
    if (fileName) {
      //清除临时文件
      listApi.deleteTemporaryFile({ fileName });
    }
    this.showModal = false;
  }

  exporting: boolean = false;

  /**
   * 导出
   */

  exportSheet() {
    if (this.exporting) {
      return;
    }
    this.exporting = true;
    setTimeout(() => {
      this.exporting = false;
    }, 3000);

    this.importDataNum = null;
    const exportRows: string[] = [];

    // const ctrl:any = JSON.parse(JSON.stringify(this.ctrl));

    this.checkeds.forEach((r, index) => {
      //
      const row: any = this.rows[index];
      if (r && index < this.rows.length) {
        const i: number = row[0].controller.options.rowIndex;
        const value: any = (this.ctrl as any).rows[i].value;
        if (value.id) {
          exportRows.push(value.id as string);
        }
      }
    });

    const params = Object.assign({}, this.sheetParams);

    // 获取导出权限数据
    const schemaCode: string = this.sheetParams.subSchemaCode;
    const permissData = this.formPermission.dataPermissions[schemaCode];

    params.permiss = permissData;
    params.name =
      this.control.options.name +
      this.$t('cloudpivot.form.renderer.exportFile').toString();

    if (exportRows.length > 0) {
      params.objectIds = exportRows;
    }

    params.languageType = (this as any).$i18n.locale || 'zh';

    console.log(UploadControl.service.exportSheet);

    // return
    UploadControl.service.exportSheet(params, this);
  }

  isShowRelevance = false;

  selected = []; //从关联表单导入时选择的数据

  beforeCreate() {
    const comp = RelevanceFormControl.loadListSelector();

    (this.$options as any).components.ListSelector = comp;
  }

  /**
   * 从关联表单导入确定
   */
  async onModalOk() {
    const formControls = this.getFormControls();
    const dataitems = await RelevanceFormControl.service.dataitemsOf(
      this.schemaCode,
    );
    this.selected.forEach((res) => {
      const obj: any = {};
      (this.control as any).columns.forEach((c) => {
        if (c.key === this.controlOpts.importFormRelevanceForm) {
          let formData: any = res;
          if (this.mappings) {
            formData = ReverseQueryService.convertForMappings(
              res,
              dataitems,
              this.mappings,
              formControls,
            );
          }
          obj[c.key] = formData;
        } else {
          // obj[c.key] = null;
        }
      });
      const backRow: any = this.addRow();

      backRow.value = obj;
    });
    this.selected = [];
    this.onModalCancel();

    setTimeout(() => {
      this.setRelevanceLinkageValue();
    }, 500);
  }

  /**
   * 将所有的关联单选执行映射逻辑，触发load接口调用
   */
  async setRelevanceLinkageValue() {
    const ctrl: any = this.control.controller;
    ctrl._cells.forEach((cell: any, rowIdx: number) => {
      cell.forEach((item: any) => {
        const control = item.control;
        if (
          control.value &&
          control.value.id &&
          control.value.schemaCode &&
          control.options &&
          control.options.mappings &&
          Object.keys(control.options.mappings).some(
            (key) => control.value[key] === undefined,
          )
        ) {
          formApi
            .load({
              schemaCode: control.value.schemaCode,
              objectId: control.value.id,
            })
            .then(({ data, errcode, errmsg }) => {
              if (
                data &&
                data.bizObject &&
                data.bizObject.data &&
                data.bizObject.data.id === control.value.id
              ) {
                control.value = data.bizObject.data;
              }
            });
        }
      });
    });
  }

  customBtnclick(code: string) {
    super.customBtnclick(code);
  }

  onModalCancel() {
    this.isShowRelevance = false;
  }

  async importRelevance() {
    this.isShowRelevance = true;
    this.query = this.getParams(false);
    this.columns = this.relavanceColumns();
    this.formTitleObj = await RelevanceFormControl.service.getBizmodelTitle(
      this.schemaCode || '',
    );
  }

  importFinishe(val: any) {
    this.importDataNum = val.length + this.rows.length;
    if (!val) {
      return;
    }
    for (const col of (this.control as any).columns) {
      val.forEach((row: any) => {
        if (row[col.key] !== undefined && row[col.key] !== null) {
          if (col.options.computeFormula) {
            delete row[col.key];
          }
          row[col.key] = FormControlValueService.convert(
            col.type,
            row[col.key],
            col.options && col.options.multi,
          );
        } else {
          row[col.key] = FormBuilderHelper.getControlValue(col as any);
        }
      });
    }
    const ctrlValue = this.getCtrl().value;
    this.getCtrl().value = ctrlValue.concat(val);
    //导入数据后需要将导入部分的数据设置一个导入的标志
    this.getCtrl().setExcelImportDataFlag(ctrlValue);
  }

  importData = {
    headColumns: this.dataItem,
    queryField: '',
    secondImportData: [],
  };

  importStatu = {
    status: 0,
    successNum: 0,
    failNum: 0,
    fileName: '',
  };

  closeRepeatModal() {
    this.showRepeatModal = false;
  }

  editFinishe(val: any) {
    this.closeRepeatModal();
    this.importFinishe(val);
  }

  /**
   * @description: 列表导入时候，人员名称重复，弹出修复数据弹框
   * @param data.errorType 错误类型 data.successCount 成功数量  data.errorCount失败数量  data.fileName 错误模板名称
   * @return:
   */
  repeatErrorHandle(data: any) {
    this.importStatu.status = data.errorType;
    this.importStatu.successNum = data.successCount;
    this.importStatu.failNum = data.errorCount;
    this.importStatu.fileName = data.fileName;
    this.importData.secondImportData = data.secondImportData || [];
    if (data.data) {
      this.importFinishe(data.data);
    }
    this.showModal = false;
    this.showRepeatModal = true;
  }

  get sheetParams() {
    const formStatus: any = {
      DRAFT: 0,
      PROCESSING: 1,
      CANCELLED: 2,
      COMPLETED: 3,
    };
    const params: any = Object.assign(
      {
        startWorkflowCode: this.$route.query.startWorkflowCode,
        workitemId: this.$route.query.workitemId,
      },
      this.control.options.sheetParams,
    );
    params.sequenceStatus = formStatus[params.sequenceStatus];
    return params;
  }

  isShowQueryItem: boolean = false; // 是否显示查询条件

  queryConditionSource: any = [];

  queryData: any = {};

  toggleQuery() {
    this.isShowQueryItem = !this.isShowQueryItem;
  }

  // 点击搜索
  onSearch(params: any, nameObj: any, queryData: any) {
    console.log(params, nameObj, queryData);
    this.isShowQueryItem = false;
    const Ctrl = this.getCtrl();
    const sheet: any = Ctrl;

    const formControls = this.getFormControls();
    const sheets = formControls.find(
      (c) => c.key === this.id,
    ) as any as typings.FormSheet;

    if (sheet && sheet.rows.length > 0) {
      // 清空子表数据在获取
      this.rows = [];
      // 标记筛选子表
      sessionStorage.setItem('sheet-' + this.id, '1');

      if (Object.keys(params).length) {
        this.queryActive = true;
        const vals: any = this.dataTranslateToFilterCard(params, nameObj);
        this.queryConditionSource = vals;

        // 获取过滤的数据
        sheet.rows.forEach((g, i) => {
          if (!this.hasRows(g, params)) {
            this.buildRow(i, g);
          }
        });
        // this.initFilterStat(sheets);
      } else {
        this.queryActive = false;
        this.queryConditionSource = [];
        sheet.rows.forEach((g, i) => {
          this.buildRow(i, g);
        });
        // this.initStat();
      }
    }
    this.onCheckAll(false);
  }

  // 筛选过滤条件
  hasRows(objs: any, params: any): number {
    let status = 0;
    const obj: any = {};

    for (const key in objs.value) {
      if (objs.value.hasOwnProperty(key)) {
        obj[key] = objs.value[key];
      }
    }
    for (const i in params) {
      if (params.hasOwnProperty(i)) {
        const arr = Array.isArray(obj[i]) ? obj[i].map((d: any) => d.id) : [];
        // 支持类型：短文本、日期、数值、选人控件、逻辑、关联表单
        // const type = [1, 3, 4, 50, 51, 8, 80, 81];
        switch (params[i].type) {
          case 0:
          case 1:
          case 2:
            status =
              (obj[i] + '')
                .toLowerCase()
                .indexOf((params[i].value + '').toLowerCase()) > -1
                ? 0
                : 1;
            break;
          case 3:
            // 日期
            let rowDate: string = moment(obj[i]).format('YYYY-MM-DD HH:mm:ss');
            rowDate = rowDate.slice(0, params[i].value.length);
            // new Date(params[i].value).getTime() === new Date(obj[i]).getTime()
            status = rowDate === params[i].value ? 0 : 1;
            break;
          case 4:
            if (params[i].value === 'true' || params[i].value === 'false') {
              // 逻辑
              status = JSON.parse(params[i].value) === obj[i] ? 0 : 1;
            } else {
              //表单设计数值
              status =
                (obj[i] + '')
                  .toLowerCase()
                  .indexOf((params[i].value + '').toLowerCase()) > -1
                  ? 0
                  : 1;
            }
            break;
          case 8:
            // 逻辑
            status = JSON.parse(params[i].value) === obj[i] ? 0 : 1;
            break;
          case 5:
          case 50:
          case 51:
          case 60:
          case 61:
          case 62:
          case 81:
            //选人：单选、多选
            //部门选择：单选、多选
            //混合选人
            //关联多选
            const arr1 = params[i].value.map((d) => d.id);
            status = arr.some((r) => arr1.indexOf(r) >= 0) ? 0 : 1;
            break;
          case 80:
            // 关联单选
            status =
              params[i].value.hasOwnProperty('id') &&
              params[i].value.id === obj[i].id
                ? 0
                : 1;
            break;
          default:
            break;
        }
      }
    }
    return status;
  }

  /**
   * 将查询条件转成组件需要的格式
   * @params data 需要转的数据
   */
  dataTranslateToFilterCard(data: any, nameObj: any) {
    const deepData: any = JSON.parse(JSON.stringify(data));
    const vals: any = [];
    const type = [50, 51, 81];
    Object.keys(deepData).forEach((key: string) => {
      //
      const content =
        deepData[key].type === 80
          ? deepData[key].value.name
          : type.indexOf(deepData[key].type) > -1
          ? deepData[key].value.map((res) => res.name).join(',')
          : deepData[key].value;
      vals.push({
        name: nameObj[key].name,
        name_i18n: nameObj[key].name_i18n,
        content: content,
        type: -1,
      });
    });
    return vals;
  }

  // 重置
  onReset() {
    this.queryConditionSource = [];
    this.queryData = {};
    this.importDataNum = null;
    this.onSearch({}, {}, {});
  }

  // 点击过滤弹出层外隐藏
  hideQueryItem() {
    if (!this.isShowQueryItem) {
      return;
    }
    this.isShowQueryItem = false;
  }

  //在审批日志界面中
  get inLog() {
    return self.location !== top.location && parent.location !== top.location;
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes.less';
h3 {
  color: #111218;
}
.filters-box {
  position: absolute;
  top: -20px;
  width: 100%;
  // height: 45px;
  z-index: 1000;
  background: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px 0px;
  border-radius: 4px;
  padding: 0px 1px;
  input,
  select {
    width: 100% !important;
  }
}
.h3-panel {
  width: 100%;
  text-align: left;
}

.ant-divider-horizontal {
  margin: 1px 0;
}

.actions {
  margin: 16px 0;
  margin-bottom: 8px;
  text-align: left;
  position: relative;
  .ant-btn {
    margin-bottom: 8px;
  }

  .fullscreen {
    float: right;
    margin-top: 4.5px;
    color: #111218;
    cursor: pointer;
    &.inLog {
      padding-right: 35px;
      margin-top: 1.5px;
    }
  }
  /*ie11 css hack*/
  @media all and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    .fullsheet {
      margin-right: 8px;
    }
  }

  & > button {
    margin-left: 8px;
  }
  .table-toolbar-box-li {
    font-size: 12px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    cursor: pointer;
    height: 32px;
    line-height: 32px;
    margin-left: 8px;
    i {
      font-size: 14px;
      color: rgba(17, 18, 24, 0.25);
      // margin-right: 4px;
    }
    &:hover {
      color: @highlightColor;
      i {
        color: @highlightColor;
      }
    }
    &.high-light {
      color: @highlightColor;
      > i {
        color: @highlightColor;
      }
    }
  }
}

.actions:not(.heard) {
  display: flex;
  flex-direction: row-reverse;
}

.actions.heard {
  box-shadow: 0px -1px 0px 0px rgba(232, 232, 232, 1);
  margin: 0;
  padding: 16px 24px 0;
  display: flex;
  justify-content: space-between;

  & > h3 {
    line-height: 32px;
    font-weight: 600;
  }

  & + div {
    text-align: right;
    direction: rtl;
    margin-bottom: 16px;
    margin-right: 24px;
    & > button {
      margin-left: 8px;
      direction: ltr;
    }
    .fullscreen {
      margin-left: 17px;
      // margin-right: 25px;
    }
    .table-toolbar-box-li {
      // top: 21px;
      // right: 169px;
      position: unset;
      display: inline-block;
      margin-left: 8px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      cursor: pointer;
      i {
        font-size: 14px;
        color: rgba(17, 18, 24, 0.25);
        // margin-right: 4px;
      }
      &:hover {
        color: #2970ff;
        i {
          color: #2970ff;
        }
      }
      &.high-light {
        color: #2970ff;
        > i {
          color: #2970ff;
        }
      }
    }
  }
}

/deep/.fullsheet {
  padding: 0 24px;
}

/deep/.fullsheet > .sheet {
  margin: 0 10px;
  .sheet__body {
    max-height: calc(100vh - 115px);
    overflow-y: scroll;
    margin-right: -6px;
  }

  /*ie11 css hack*/
  @media all and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    .sheet__body {
      margin-right: -17px;
    }
  }

  .sheet__body.show-total {
    max-height: calc(100vh - 160px);
  }

  & + .sheet__row.scrollbar {
    margin: 0 10px;
  }
}

.pagination {
  text-align: right;
  /deep/.ant-pagination > li {
    border-radius: 2px;
    a,
    div,
    input {
      border-radius: 2px;
    }
    .ant-select-arrow {
      right: 7px;
    }
  }
}

.ellipsis {
  cursor: pointer;
}
</style>

<style lang="less">
.h3-panel-body {
  overflow: unset !important;
}
.modal-footer {
  text-align: right;
  button {
    margin-left: 8px;
  }
}

._form-sheet {
  li {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
  }
}
/deep/.ant-popover-inner-content {
  min-width: 160px !important;
}
.titleHidden {
  .span-title {
    display: none !important;
  }
}
</style>

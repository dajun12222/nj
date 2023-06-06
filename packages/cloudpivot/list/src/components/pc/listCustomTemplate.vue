<template>
  <div
    id="custom-template-containerX"
    ref="xTreeTable"
    class="custom-template-container"
    :class="{
      'scrollbar-auto-hidding': tableConfig.scrollbarAutoHidding,
      'custom-template-container-gantt': queryPresentationType === 'GANTT',
    }"
  >
    <!-- 列表容器 -->
    <div
      :class="[
        { 'self-adaption': tableScrollWidth === '100%' },
        ...tableData.additionalClasses,
      ]"
      :style="{ width: tableScrollWidth }"
      data-v-pos="v-top"
      data-h-pos="h-left"
    >
      <!-- 列表头 -->
      <div
        :class="tableData.thead.additionalClasses"
        :style="tableData.thead.style"
      >
        <div style="display: flex; flex-direction: row">
          <div
            v-for="(row, rowIdx) in tableData.thead.rows"
            :key="rowIdx"
            :class="row.additionalClasses"
            :style="row.style"
          >
            <div
              v-for="(col, colIdx) in row.cols"
              :key="colIdx"
              :class="col.additionalClasses"
              :style="{
                width: col.properties.width + 'px',
                ...col.style,
                'flex-direction': 'row',
              }"
            >
              <!-- 首列为 序号&选择 -->
              <template
                v-if="
                  tableConfig.rowOrdinal &&
                  tableConfig.rowSelectable &&
                  col.properties.id === '__ordinalNo'
                "
              >
                <a-checkbox
                  v-if="!tableData.tbody.rows.length"
                  :checked="false"
                />
                <a-checkbox
                  v-else-if="tableData.tbody.rows.every((r) => r.checked)"
                  checked
                  @change="rowSelection('cancelAll')"
                />
                <a-checkbox
                  v-else
                  :indeterminate="tableData.tbody.rows.some((r) => r.checked)"
                  @change="rowSelection('checkAll')"
                />
              </template>
              <!-- 子表列 -->
              <div
                v-else-if="col.properties.propertyType === DataItemType.Sheet"
                class="child-sheet-wrapper"
              >
                <div class="child-sheet-title">
                  {{
                    col.properties.name_i18n
                      ? col.properties.name_i18n[$i18n.locale]
                        ? col.properties.name_i18n[$i18n.locale]
                        : col.value
                      : col.value
                  }}
                </div>
                <!-- <div style="display: flex"> -->
                <template v-for="(child, index) in col.properties.childColumns">
                  <div
                    :key="index"
                    class="child-row-item"
                    :style="{ width: child.width + 'px' }"
                  >
                    <label>{{ getHeaderKey(child) }}</label>
                  </div>
                </template>
                <!-- </div> -->
              </div>
              <!-- 其他列输出 标题 -->
              <div
                v-else-if="sortKey(col.properties.id)"
                class="table-head-value"
              >
                <label>{{
                  col.properties.name_i18n
                    ? col.properties.name_i18n[$i18n.locale]
                      ? zhToen[col.properties.name_i18n[$i18n.locale]]
                        ? getHeaderShow(
                            col.properties.name_i18n[$i18n.locale],
                            $i18n.locale,
                          )
                        : col.properties.name_i18n[$i18n.locale]
                      : col.value
                    : col.value
                }}</label>
                <div class="head-value-up_down">
                  <a-icon
                    type="caret-up"
                    class="icon-up_down"
                    :class="
                      col.properties.isEdit &&
                      (col.properties.sub === 1 ||
                      col.properties.direction === 1
                        ? 'icon-up-down-light'
                        : '')
                    "
                    @click="changeSort(row.cols, col.properties, 1)"
                  />
                  <a-icon
                    type="caret-down"
                    class="icon-up_down"
                    :class="
                      col.properties.isEdit &&
                      (col.properties.sub === 2 ||
                      col.properties.direction === 2
                        ? 'icon-up-down-light'
                        : '')
                    "
                    @click="changeSort(row.cols, col.properties, 2)"
                  />
                </div>
              </div>
              <label v-else>
                {{
                  col.properties.name_i18n
                    ? col.properties.name_i18n[$i18n.locale]
                      ? zhToen[col.properties.name_i18n[$i18n.locale]]
                        ? getHeaderShow(
                            col.properties.name_i18n[$i18n.locale],
                            $i18n.locale,
                          )
                        : col.properties.name_i18n[$i18n.locale]
                      : col.value
                    : col.value
                }}</label>
            </div>
          </div>
          <!-- 自定义按钮 -->
          <div
            v-if="customButtonsRow.length > 0"
            :class="{
              'custom-buttonX': true,
              positionStatic: !customSuspensionVal,
            }"
            :style="{
              left: `${customWidth - 142}px`,
              borderBottom: '1px solid #e8eaed',
              minHeight: '36px',
            }"
            style="background: #f8f8fb"
          >
            <p class="custom-buttonXTitle">操作</p>
          </div>
        </div>
      </div>
      <!-- 加载状态 -->
      <!-- <PageLoading v-model="isLoading" shadeColor="#F4F6FC" :shadeOpacity="0.5" /> -->
      <!-- 列表体 -->
      <div
        :class="tableData.tbody.additionalClasses"
        :style="{
          marginBottom: isScroll ? '36px' : '0',
        }"
      >
        <draggable
          :list="tableData.tbody.rows"
          :options="dragOptions"
          handle=".handles"
          tag="div"
          :move="onMove"
        >
          <div
            v-for="(row, rowIdx) in tableData.tbody.rows"
            :key="rowIdx"
            :class="row.additionalClasses"
            :style="row.style"
            :rowIndex="rowIdx"
            style="position: relative"
            @mouseenter="rowMouseenter(rowIdx)"
            @mouseleave="rowMouseleave(rowIdx)"
          >
            <template v-for="(col, colIdx) in row.cols">
              <div
                v-if="
                  tableConfig.rowOrdinal && col.properties.id === '__ordinalNo'
                "
                :key="colIdx"
                :class="col.additionalClasses"
                :style="{
                  width:
                    (col.colspan
                      ? combineColsWidth(row, col)
                      : col.properties.width) + 'px',
                  'flex-direction': colIdx === 1 ? 'row' : 'column',
                  ...col.style,
                }"
              >
                <div class="row-selection-box">
                  <a-checkbox
                    :class="{ checked: row.checked }"
                    :checked="row.checked"
                    @change="rowSelection('check', row)"
                  />
                  <span class="row-serial-no">{{ row.__ordinalNo }}</span>
                </div>
              </div>
            </template>
            <template v-if="!row.html">
              <template v-for="(col, colIdx) in row.cols">
                <template v-if="!col.html">
                  <div
                    v-if="
                      !(
                        tableConfig.rowOrdinal &&
                        col.properties.id === '__ordinalNo'
                      )
                    "
                    :key="colIdx"
                    :class="col.additionalClasses"
                    :style="{
                      width:
                        (col.colspan
                          ? combineColsWidth(row, col)
                          : col.properties.width) + 'px',
                      'flex-direction': colIdx === 1 ? 'row' : 'column',
                      padding:
                        col.ganttProperty &&
                        col.properties.key ===
                          ganttProperties.progressPropertyCode
                          ? '0'
                          : '',
                      position:
                        ganttProperties &&
                        col.properties.key === ganttProperties.titlePropertyCode
                          ? 'relative'
                          : '',
                      ...col.style,
                    }"
                    style="cursor: pointer"
                    @click="
                      !col.ganttProperty
                        ? modelType === 'TREE'
                          ? pageVM.goTreeForm({}, row.id)
                          : pageVM.goForm({}, rowIdx)
                        : () => {}
                    "
                  >
                    <!-- 树形前面根据深度预留的宽度 -->
                    <div
                      v-if="colIdx === 1"
                      :style="{
                        width: (row.depth - 1) * 20 + 'px',
                        'min-width': (row.depth - 1) * 20 + 'px',
                      }"
                    ></div>
                    <!-- 树形的icon图标 -->
                    <div
                      v-if="
                        col.additionalClasses.includes('expand') ||
                        col.additionalClasses.includes('collapse')
                      "
                      :class="
                        col.additionalClasses.includes('expand')
                          ? 'expand-icon'
                          : 'collapse-icon'
                      "
                      @click.stop="expandRow(row)"
                    ></div>
                    <!-- 没有树形icon图标时候的占位符 -->
                    <div
                      v-if="
                        !col.additionalClasses.includes('expand') &&
                        !col.additionalClasses.includes('collapse') &&
                        colIdx === 1 &&
                        modelType === 'TREE'
                      "
                      class="seat"
                    ></div>
                    <!-- 首列为 序号/选择 -->
                    <!-- <div class="row-selection-box" v-if="tableConfig.rowOrdinal && col.properties.id==='__ordinalNo'">
                    <a-checkbox :class="{checked:row.checked}" :checked="row.checked" @change="rowSelection('check',row)"></a-checkbox>
                    <span class="row-serial-no">{{ row.__ordinalNo }}</span>
                  </div> -->
                    <!-- 如果是子表, 需要展示多行 -->
                    <div
                      v-if="col.properties.propertyType === DataItemType.Sheet"
                      class="child-sheet-wrapper"
                    >
                      <template v-for="(rowItem, cIdx) in col.value">
                        <div
                          v-show="
                            (!col.collapsible || cIdx === 0 || cIdx === 1) &&
                            cIdx < 7
                          "
                          :key="cIdx"
                          class="child-items-row"
                        >
                          <div
                            v-for="(item, idx) in col.properties.childColumns"
                            :key="idx"
                            class="child-items"
                            :class="{
                              padding:
                                idx === 0 && cIdx !== 0 && col.value.length > 1,
                            }"
                            :style="{ width: item.width + 'px' }"
                          >
                            <listCustomTemplateHandle
                              :dataValue="rowItem[item.dataIndex]"
                              :dataValueAlias="rowItem[item.propertyAlias]"
                              :dataColumns="item"
                              :row="row"
                              :col="col"
                              :rowIdx="rowIdx"
                              dataType="SHEET"
                              :pageVM="pageVM"
                              :modelType="modelType"
                              @previewImg="previewImg"
                              @mouseEnter="mouseEnterX"
                            />
                          </div>
                        </div>
                      </template>

                      <div
                        v-if="col.value && col.value.length > 2"
                        class="child-item-row-foot"
                        :class="[col.collapsible ? '' : 'relative']"
                      >
                        <i
                          class="row-collaps icon aufontAll"
                          :class="[
                            col.collapsible
                              ? 'h-icon-all-double-down-o'
                              : 'h-icon-all-double-up-o',
                          ]"
                          @click.stop="col.collapsible = !col.collapsible"
                        ></i>

                        <!-- 更多弹窗按钮 -->
                        <div
                          v-if="
                            col.value &&
                            col.value.length > 7 &&
                            !col.collapsible
                          "
                          class="row-collaps-more"
                          @click.stop="goSheetDetail(col)"
                        >
                          更多
                        </div>
                      </div>
                    </div>

                    <template v-else-if="ganttPropertyCanEdit(col)">
                      <gantt-template
                        :col="col"
                        :row="row"
                        :rowId="row.id"
                        :rowIdx="rowIdx"
                        :modelType="modelType"
                        :vm="_self"
                        :ganttProperties="ganttProperties"
                      />
                    </template>

                    <template v-else>
                      <listCustomTemplateHandle
                        :dataValue="col.value"
                        :dataColumns="col.properties"
                        :row="row"
                        :col="col"
                        :rowIdx="rowIdx"
                        dataType="FORM"
                        :pageVM="pageVM"
                        :modelType="modelType"
                        @previewImg="previewImg"
                        @mouseEnter="mouseEnterX"
                      />
                    </template>
                  </div>
                </template>
                <template v-else>
                  <div
                    :key="colIdx"
                    :class="col.additionalClasses"
                    :style="{
                      width:
                        (col.colspan
                          ? combineColsWidth(row, col)
                          : col.properties.width) + 'px',
                      'flex-direction': colIdx === 1 ? 'row' : 'column',
                      padding:
                        col.ganttProperty &&
                        col.properties.key ===
                          ganttProperties.progressPropertyCode
                          ? '0'
                          : '',
                      position:
                        ganttProperties &&
                        col.properties.key === ganttProperties.titlePropertyCode
                          ? 'relative'
                          : '',
                      ...col.style,
                    }"
                    style="cursor: pointer"
                    v-html="col.html"
                  ></div>
                </template>
              </template>
            </template>
            <template v-else>
              <div :key="rowIdx" v-html="row.html"></div>
            </template>
            <div
              v-if="customButtonsRow.length > 0 && customSuspensionVal"
              class="custom-buttonXZw"
            ></div>
            <!-- 自定义按钮 -->
            <template v-if="customButtonsRow.length > 0">
              <div
                :class="{
                  'custom-buttonX': true,
                  'custom-buttonXBottom': customSuspensionVal,
                  positionStatic: !customSuspensionVal,
                }"
                :style="{ left: `${customWidth - 142}px` }"
              >
                <template v-if="customButtonsRow[0].hint">
                  <a-tooltip placement="top">
                    <template #title>
                      <span>{{ customButtonsRow[0].hint }}</span>
                    </template>
                    <p
                      class="custom-buttonXTitle custom-buttonXTitle1"
                      @click="
                        moreClick({
                          code: customButtonsRow[0].code,
                          rowIndex: rowIdx,
                        })
                      "
                    >
                      {{ customButtonsRow[0].name }}
                    </p>
                  </a-tooltip>
                </template>
                <template v-else>
                  <p
                    class="custom-buttonXTitle custom-buttonXTitle1"
                    @click="
                      moreClick({
                        code: customButtonsRow[0].code,
                        rowIndex: rowIdx,
                      })
                    "
                  >
                    {{ customButtonsRow[0].name }}
                  </p>
                </template>
                <template v-if="customButtonsRow.length > 1">
                  <a-dropdown overlayClassName="custom-buttonXMoreM">
                    <p class="custom-buttonXMore" @click.prevent>更多</p>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item
                          v-for="(item, index) in customButtonsRow"
                          :key="item.code"
                          :style="index === 0 ? 'display: none' : ''"
                          @click="
                            moreClick({ code: item.code, rowIndex: rowIdx })
                          "
                        >
                          <template v-if="item.hint">
                            <a-tooltip placement="top">
                              <template #title>
                                <span>{{ item.hint }}</span>
                              </template>
                              <span>{{ item.name }}</span>
                            </a-tooltip>
                          </template>
                          <template v-else>
                            <span>{{ item.name }}</span>
                          </template>
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </template>
              </div>
            </template>
          </div>
        </draggable>
      </div>

      <!-- 数值汇总功能展示 -->
      <div
        v-if="!isScroll"
        ref="tableNumberItem"
        class="table-number-item-wrap"
        :style="{
          position: 'initial',
        }"
      >
        <div
          v-if="tableData.tbody.rows.length > 0 && originalNumberData"
          :style="{ width: tableScrollWidth, bottom: `${bottom}px` }"
          class="table-number-item"
        >
          <div
            v-for="(col, index) in tableData.tbody.rows[0].cols"
            :key="index"
            :style="{ width: col.properties.width + 'px', ...col.style }"
            class="table-number-item-row"
          >
            <span
              v-if="
                col.properties.propertyType === DataItemType.Number &&
                col.properties.sumType > 0
              "
              >{{
                getsumTypeName(col.properties.sumType) +
                '=' +
                getNumberValue(originalNumberData, col.properties)
              }}</span>
            <span v-else></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数值汇总功能展示 -->
    <div v-if="isScroll" ref="tableNumberItem" class="table-number-item-wrap">
      <div
        v-if="tableData.tbody.rows.length > 0 && originalNumberData"
        :style="{ width: tableScrollWidth, bottom: `${bottom}px` }"
        class="table-number-item"
      >
        <div
          v-for="(col, index) in tableData.tbody.rows[0].cols"
          :key="index"
          :style="{ width: col.properties.width + 'px', ...col.style }"
          class="table-number-item-row"
        >
          <span
            v-if="
              col.properties.propertyType === DataItemType.Number &&
              col.properties.sumType > 0
            "
            >{{
              getsumTypeName(col.properties.sumType) +
              '=' +
              getNumberValue(originalNumberData, col.properties)
            }}</span>
          <span v-else></span>
        </div>
      </div>
    </div>

    <!-- 子表弹窗 -->
    <FormSheetModal
      ref="sheetList"
      :visible="visible"
      :sheetData="sheetList"
      :subQueryCondition="sheetQueryCondeiton"
      @close="visible = false"
      @pageChange="pageChange"
    />

    <!-- 预览并下载图片 -->
    <img-preview
      v-if="isPreviewImage"
      :imgList="[{ url: bs64Img }]"
      @close="isPreviewImage = false"
    />

    <div
      v-if="showViewBox"
      class="show-view-box"
      :style="popStyle"
      @mouseleave="ViewBoxMouseLeave"
    >
      <!-- 人员多选|混合选人 -->
      <div
        v-if="hoverValueType === 'users' || hoverValueType === 'StaffDeptMix'"
        class="show-view-box-in"
      >
        <template v-for="userInfo in hoverValue.slice(0, 20)">
          <div :key="userInfo.id" :title="userInfo.name">
            <template v-if="userInfo.type === 1">
              <div class="deptMulti">
                <span v-if="!userInfo.name.includes('--')"><i class="icon aufontAll h-icon-all-process-o"></i>
                  {{ userInfo.name }}</span>
                <div v-else>
                  {{ userInfo.name }}
                </div>
              </div>
            </template>
            <template v-else-if="userInfo.type === 3 && userInfo.name">
              <AuthorAvatarInfo
                class="userInfo-li"
                :item="{
                  sourceId: userInfo.id,
                  imgUrl: userInfo.imgUrl,
                  sourceName: userInfo.name,
                  type: userInfo.type,
                }"
              />
            </template>
          </div>
        </template>

        <template v-if="hoverValue.length > 20">
          <div class="show-icon-all-more">
            <i class="icon aufontAll h-icon-all-ellipsis-o"></i>
          </div>
        </template>
      </div>

      <!-- 部门 -->
      <div
        v-if="hoverValueType === 'deps'"
        class="show-view-box-in dep-view-box"
      >
        <template v-if="Array.isArray(hoverValue)">
          <template v-for="(deptName, deptIdx) in hoverValue">
            <span :key="deptIdx">
              <span :title="deptName.name || deptName"><i class="icon aufontAll h-icon-all-process-o"></i>{{ deptName.name || deptName }}</span>
            </span>
          </template>
        </template>

        <template v-if="hoverValue.length > 20">
          <div class="show-icon-all-more">
            <i class="icon aufontAll h-icon-all-ellipsis-o"></i>
          </div>
        </template>
      </div>

      <template>
        <div
          class="see-more"
          @click="
            modelType === 'TREE'
              ? pageVM.goTreeForm({}, hoverRowId)
              : pageVM.goForm({}, hoverRowIdx)
          "
        >
          查看更多
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import { namespace } from 'vuex-class';
import common from '../../../../common/pc';
import AuthorAvatarInfo from '../../../../common/src/components/pc/author-avatar-info/author-avatar-info.vue';
// 工具函数
import { renderer } from '../../../../form';
import { DataItemType } from '../../../../form/schema';
import PCImagePreview from '../../../../form/src/common/components/pc-image-preview.vue';
// 默认模板 & 模板编译器
import listCustomTemplateConverter from '../../../../list/src/components/listCustom/template/pc/handler';
import FormSheetModal from './components/form-sheet-modal/form-sheet-modal.vue';
import * as Helper from './helper/helper';
import zhToen from './locales/zhToEn';
import ganttTemplate from './components/table-gantt/ganttTemplate.vue';
import Bus from '../../../../form/utils/bus';
import debounce from 'lodash/debounce';
import { Popover, Icon, Checkbox, Dropdown, Menu } from '@h3/antd-vue';
import listCustomTemplateHandle from './listCustomTemplateHandle.vue';
import { viewRegister } from '../../../utils/register';
const vueCompiler = require('../../../../list/src/components/mobile/application-list/vueCompiler.build');
const Antd = require('@h3/antd-vue');
// 函数
const { getRealValue } = common.utils.BusinessFunctions;
const GanttModule = namespace('Gantt/');
const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');
// ant-design
Vue.use(Antd);

const GanttTemplate = (viewRegister.getAssets() as any).GanttTemplate;

// 类型
interface TableData {
  thead: TableDataRowCategory;
  tbody: TableDataRowCategory;
  additionalClasses: string[];
  style?: object;
}
interface TableDataRowCategory {
  rows: TableDataRow[];
  additionalClasses: string[];
  style?: object;
}
interface TableDataRow {
  id: string;
  expanded: boolean;
  __ordinalNo?: number;
  checked?: boolean;
  cols: TableDataColItem[];
  additionalClasses: string[];
  style?: object;
  html?: string;
}
interface TableDataColItem {
  value: any;
  properties: any;
  additionalClasses: string[];
  style?: object;
  colspan?: number;
  html?: string;
}

// @@ 组件定义
@Component({
  name: 'custom-template',
  components: {
    sheet: () =>
      import(
        /* webpackChunkName: "sheet" */ '../../../../form/src/renderer/components/pc/form-sheet/sheet.vue'
      ),
    PageLoading: common.components.PageLoading,
    FormSheetModal,
    AuthorAvatarInfo,
    ImgPreview: PCImagePreview,
    Draggable,
    GanttTemplate,
    listCustomTemplateHandle,
    APopover: Popover,
    AIcon: Icon,
    ACheckbox: Checkbox,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
  },
})
export default class listCustomTemplate extends Vue {
  @WorkflowCenterModule.State('hideMenu') hideMenu: any; //是否隐藏左侧导航

  isPreviewImage: boolean = false; //预览图片弹框是否显示

  bs64Img: string = ''; //预览图片的连接

  // @@ 参数
  @Prop() pageVM: any; //父级组件的vue对象

  // @Prop() columns:any;
  @Prop() originalTableColumns: any; //表格表头数据

  @Prop() originalTableData: any; //表格表体数据

  @Prop() templateString: any; //列表模板自定义脚本

  @Prop() modelType?: string; //模型类型

  @Prop() isOpen?: boolean;

  @Prop({ default: () => {} }) subQueryformConditions!: any; //子表查询条件列表

  @Prop({
    default() {
      return {
        presentationType: 'table',
        fixedHeader: true,
        fixedLeftColumns: ['__ordinalNo'],
        fixedRightColumns: [],
        rowOrdinal: true,
        rowSelectable: true,
        columnResizable: true,
        scrollbarAutoHidding: true,
      };
    },
  })
  tableConfig: any; //表格配置

  @Prop() originalNumberData: any; //数值数据项数据

  @Prop() queryPresentationType!: string; //视图类型

  @Prop() ganttProperties?: any; //甘特图字段配置

  @Prop({ default: () => [] }) customButtonsRow?: any; //行按钮

  @Prop({ default: false }) isCustomScriptOpen?: boolean; //用于判断自定义单元格、列函数是否执行

  //监听甘特图数据判断是否初始化甘特图
  @Watch('ganttProperties')
  onGanttPropertiesChange() {
    if (!this.tableData.tbody.rows) {
      return;
    }
    this.initGanttProperties(this.tableData.tbody.rows);
  }

  customSuspensionVal: boolean = false; //行按钮是否悬浮

  // @@ 变量
  columns: any[] = [];

  tableData: TableData = {
    additionalClasses: [],
    thead: { rows: [], additionalClasses: [] },
    tbody: { rows: [], additionalClasses: [] },
  }; //列表数据

  sheetList: any[] = []; //子表数据列表

  sheetQueryCondeiton: any[] = []; //子表查询条件列表

  dragOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    forceFallback: true,
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 100,
  }; //拖住组件配置

  //项目名称是否编辑状态
  isEditTitle: boolean = false;

  /**
   * 拖拽时判断是否允许拖拽
   */
  onMove(evt: any) {
    let newIndex = evt.relatedContext.index;
    let oldIndex = evt.draggedContext.index;
    let canDrag = true;

    if (this.ganttProperties && this.ganttProperties.levelPropertyCode) {
      newIndex = this.tableData.tbody.rows[newIndex].id;
      oldIndex = this.tableData.tbody.rows[oldIndex].id;
      const newLevelId = this.pageVM.treeDataFindId(
        this.pageVM.dataSource,
        newIndex,
      )[this.ganttProperties.levelPropertyCode];
      const oldLevelId = this.pageVM.treeDataFindId(
        this.pageVM.dataSource,
        oldIndex,
      )[this.ganttProperties.levelPropertyCode];
      if (newLevelId !== oldLevelId) {
        this.$message.error('只允许同级拖拽');
        canDrag = false;
      }
    }

    this.$emit('dragTable', newIndex, oldIndex, canDrag);
    return canDrag;
  }

  // 需要排序的表头
  @Prop() sortConfig!: any[];

  visible: boolean = false; //子表弹框是否显示

  ViewBoxWidth: string = '';

  popStyle: any = {}; //人员多选、部门多选悬浮框样式

  hoverValue: any = ''; //人员多选、部门多选悬浮框数据

  hoverValueType: 'users' | 'deps' | 'StaffDeptMix' = 'users'; //人员多选、部门多选悬浮框类型

  showViewBox: boolean = false; //是否显示人员多选、部门多选悬浮框

  hoverRowId: string = ''; //鼠标移动到的行id

  hoverRowIdx: string = ''; //鼠标移动到的行索引

  customWidth: any = ''; //自定义按钮悬浮框距离左侧的距离

  customWidthY: any = ''; //包裹列表体的盒子宽度

  //鼠标移动到列表行时触发
  mouseEnter(
    e: any,
    value: any,
    type: 'users' | 'deps' | 'StaffDeptMix' = 'users',
    rowId,
    rowIdx,
  ) {
    this.hoverValueType = type;
    this.hoverRowId = rowId;
    this.hoverRowIdx = rowIdx;
    if (typeof value === 'string' && value !== '--') {
      try {
        value = JSON.parse(value);
      } catch (error) {
        value = value.split(',');
      }
    }

    if (value !== '--' && Array.isArray(value) && value.length > 2) {
      this.showViewBox = true;
      this.setPopStyle(e);
      this.hoverValue = value;
    }
  }

  //鼠标移动到列表行时触发
  mouseEnterX(res: any) {
    this.mouseEnter(res.e, res.value, res.type, res.rowId, res.rowIdx);
  }

  //点击关闭弹框
  ViewBoxMouseLeave() {
    this.showViewBox = false;
  }

  // 设置浮窗样式
  setPopStyle(e) {
    let tableRow = e.target;
    while (
      (tableRow.parentNode.classList.contains('table-row-item') ||
        tableRow.parentNode.classList.contains('child-items')) &&
      tableRow.parentNode.tagName !== 'BODY'
    ) {
      tableRow = tableRow.parentNode;
    }
    const ClientRect: any = tableRow.getBoundingClientRect();
    // @ts-ignore
    const noBox: any = document
      .querySelector('.table-row-item-__ordinalNo')
      .getBoundingClientRect();
    // @ts-ignore
    const container: any = document
      .querySelector('.table-box')
      .getBoundingClientRect();
    let left: number = ClientRect.x;
    let top: any = ClientRect.y;
    const width = ClientRect.width;
    let right: number = ClientRect.right;
    let bottom: any = 'auto';
    if (left < noBox.x + noBox.width) {
      left = noBox.x + noBox.width;
    }
    if (left + width > ClientRect.right) {
      // 如果超出当前单元格，right设置为单元格最右
      right = ClientRect.right;
    }
    if (right > container.right - 17) {
      // 如果right超出表格，right设置为表格最右
      right = container.right - 17;
    }

    if (top + 224 > container.bottom + 16) {
      top = 'auto';
      bottom = container.bottom + 16 - ClientRect.bottom;
    }
    this.popStyle = {
      left: left + 'px',
      top: top === 'auto' ? undefined : top + 'px',
      width: (right - left < 174 ? 174 : right - left) + 'px',
      right: right + 'px',
      bottom: bottom === 'auto' ? undefined : bottom + 'px',
      // display: right - left < 130 ? 'none' : undefined
    };
  }

  @Watch('sortConfig', {
    immediate: true,
  })
  getSortConfig(val: any) {
    if (val.length) {
      const data: any[] = this.sortConfigMap;
      if (!data.length) {
        this.sortConfigMap = val.map((item: any) => {
          item.direction = 0;
          return item;
        });
      }
    }
  }

  //监听左侧导航栏关闭打开
  @Watch('hideMenu', {
    immediate: true,
  })
  getWidth(val) {
    this.tableClientWidth =
      ((document.querySelector('#ApplicationList') as any) &&
        (document.querySelector('#ApplicationList') as any).clientWidth - 34) ||
      this.$el.clientWidth;
    this.computeWidth();
  }

  zhToen: any = {}; //系统字段以及按钮的中英文对象

  scrollwht: any = ''; //表格横向滑动时滚动条的位置

  created() {
    this.zhToen = zhToen;
    this.getWindowInfo();
    this.customBindingEvent();
  }

  //自定义按钮悬浮框位置绑定事件初始化
  customBindingEvent() {
    window.addEventListener('resize', this.getWindowInfo);
    setTimeout(() => {
      if ((document as any).getElementById('custom-template-containerX')) {
        (document as any)
          .getElementById('custom-template-containerX')
          .addEventListener('scroll', (e) => {
            this.scrollwht = e.target.scrollLeft;
            this.customWidth = this.customWidthY + this.scrollwht;
          });
        document.querySelectorAll('.custom-buttonX').forEach((x) => {
          const a = this.getElementPosition(x);
        });
      }
    }, 300);
  }

  //获取元素距离顶部的距离
  getElementPosition(element) {
    let top = element.offsetTop; //这是获取元素距父元素顶部的距离
    let left = element.offsetLeft;
    var current = element.offsetParent; //这是获取父元素
    while (current !== null) {
      //当它上面有元素时就继续执行
      top += current.offsetTop; //这是获取父元素距它的父元素顶部的距离累加起来
      left += current.offsetLeft;
      current = current.offsetParent; //继续找父元素
    }
    return {
      top,
      left,
    };
  }

  //动态调整自定义按钮悬浮框的位置与显示
  getWindowInfo() {
    const customObj = document.getElementById('list-table-body');
    if (customObj) {
      this.customWidthY = customObj.offsetWidth;
      this.customWidth = this.customWidthY + this.scrollwht;
      if (
        this.tableContainerElement &&
        this.tableContainerElement.scrollWidth > this.customWidthY
      ) {
        this.customSuspensionVal = true;
      }
    }
  }

  //自定义按钮下拉框中点击触发
  moreClick(obj: object) {
    this.$emit('moreClick', obj);
  }

  /**
   * 查询子表详情
   */
  goSheetDetail(list) {
    this.sheetList = list;
    this.sheetQueryCondeiton =
      this.subQueryformConditions &&
      this.subQueryformConditions[
        list && list.properties && list.properties.id
      ];
    this.visible = true;
  }

  //根据中英文状态显示中英文
  getHeaderShow(text, type) {
    if (type === 'zh') {
      return text;
    } else {
      return this.zhToen[text];
    }
  }

  pageSize: number = 20; // 子表一页展示数据条数，默认为20

  DataItemType: any = DataItemType; //组件类型集合

  // 默认排序方式
  sortConfigMap: any[] = [];

  // 是否为加载状态
  isLoading: boolean = false;

  // 当前是否进行过排序状态
  isSort: boolean = false;

  // 排序的code
  sortCode: string = '';

  // 排序升序倒叙
  sortAscDesc: number = 0;

  // previewVisible: boolean = false;

  // @@ watching
  @Watch('originalTableColumns', { immediate: true })
  onOriginalTableColumnsChange(columns, oldColumns) {
    if (!columns || !columns.length) {
      return;
    }
    this.columns = this.serializeColumns();
  }

  @Watch('columns', { immediate: true })
  onColumnsChange(columns, oldColumns) {
    if (!columns || !columns.length) {
      return;
    }
    // console.log( '___________', columns?columns.length:'000', oldColumns?oldColumns.length:'111' );
    this.tableData = this.serializeTableData();

    this.$nextTick(this.initDomEvents);
  }

  @Watch('tableConfig', { immediate: true })
  onTableConfigChange(newVal: any, oldVal: any) {
    if (!oldVal) {
      return;
    }
    this.tableData = this.serializeTableData();
  }

  @Watch('originalTableData', { immediate: true, deep: true })
  onOriginalTableDataChange(newVal: any, oldVal: any) {
    if (!oldVal) {
      return;
    }

    if (this.isOpen && this.modelType === 'TREE') {
      this.expendToTrue(this.originalTableData);
    }
    this.tableData = this.serializeTableData();
    this.$nextTick(() => {
      const node = document.querySelector('.custom-template-container') as any;
      this.isScroll = !!(node.scrollHeight - node.clientHeight);
      this.handleSerializeNumberScroll();
    });
  }

  //初始化树形筛选条件展开状态
  expendToTrue(tableData) {
    tableData.map((item) => {
      item.expanded = true;
      if (item.t__children_ && item.t__children_.length !== 0) {
        this.expendToTrue(item.t__children_);
      }
    });
  }

  /**
   * 预览图片
   */
  previewImg(url) {
    if (!url) {
      return;
    }
    this.bs64Img = url;
    this.isPreviewImage = true;
  }

  /**
   * 子表分页
   */
  pageChange(obj) {}

  // 获取非系统数据key
  getHeaderKey(cur: any) {
    let name: any = cur.vcTitle;
    if (cur.name_i18n) {
      let name_i18n: any;
      if (typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n);
      } else {
        name_i18n = cur.name_i18n;
      }
      if (name_i18n[this.$i18n.locale]) {
        name = name_i18n[this.$i18n.locale];
      }
    }
    return name;
  }

  // 过滤当前的表单需要排序的表头字段
  sortKey(id: string): any {
    if (Array.isArray(this.sortConfig)) {
      if (
        this.sortConfig.findIndex((item: any) => {
          return item.propertyCode === id;
        }) > -1
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // 改变排列方式，发送请求
  changeSort(cols: any[], currentThead: any, type: number) {
    let orderByFields: string[] = [];
    let orderType: number = 0;
    // 将当前状态变为排序状态
    this.isSort = true;
    // 更新映射数组，---》改变表头字段排序状态
    this.sortConfigMap.forEach((item: any) => {
      if (currentThead.key === item.propertyCode) {
        // 将当前字段变为排序模式
        item.isEdit = true;
        if (item.direction === type && this.sortCode === item.propertyCode) {
          item.direction = 0;
          this.sortAscDesc = 0;
          currentThead.direction = item.direction;
          this.sortCode = '';
        } else if (
          type === 1 &&
          !(item.direction === type && this.sortCode === item.propertyCode)
        ) {
          item.direction = 1;
          orderType = item.direction;
          orderByFields = [item.propertyCode];
          this.sortAscDesc = item.direction;
          currentThead.direction = item.direction;
          this.sortCode = item.propertyCode;
        } else if (
          type === 2 &&
          !(item.direction === type && this.sortCode === item.propertyCode)
        ) {
          item.direction = 2;
          orderType = item.direction;
          orderByFields = [item.propertyCode];
          this.sortAscDesc = item.direction;
          currentThead.direction = item.direction;
          this.sortCode = item.propertyCode;
        } else {
          //Else Empty block statement
        }
      }
    });
    if (orderType === 0) {
      this.$emit('bySortGetQueryList');
    } else {
      this.$emit('bySortGetQueryList', {
        orderByFields: orderByFields,
        orderType: orderType,
      });
    }
  }

  isScroll: boolean = false; //数据汇总是否展示

  //表格滚动与甘特图垂直滚动同步
  scrollLeft = 0;

  // timeid_scroll;

  @GanttModule.Mutation('setClientIndexRange') setClientIndexRange;

  $refs: any = {
    xTreeTable: null,
  };

  mounted() {
    //左侧导航栏收缩时触发resize事件
    common.utils.Bus.$on('resize', (e) => {
      this.tableClientWidth = this.$el.clientWidth;
      this.computeWidth();
      this.getWindowInfo();
    });
    //左侧导航栏收缩展开时触发customButton事件
    common.utils.Bus.$on('customButton', (e) => {
      setTimeout(() => {
        this.getWindowInfo();
      });
    });

    const selector = '.gantt-table .table-body-wrapper .table-body-row';
    Bus.$off('syncGanttRowHover');
    Bus.$on('syncGanttRowHover', ({ status, rowIndex }) => {
      if (status === 'enter') {
        document.querySelectorAll(selector).forEach((dom) => {
          if (dom.getAttribute('rowIndex') === String(rowIndex)) {
            dom.classList.add('row--hover');
          } else {
            dom.classList.remove('row--hover');
          }
        });
      } else {
        document.querySelectorAll(selector).forEach((dom) => {
          dom.classList.remove('row--hover');
        });
      }
    });

    //监听甘特图垂直滚动，同步到表格也垂直滚动
    Bus.$off('GanttYScroll');
    Bus.$on('GanttYScroll', ({ scrollTop }) => {
      if (this.$refs.xTreeTable) {
        this.$refs.xTreeTable.scrollTop = scrollTop;
        // this.unbindEvent();
        // await this.$refs.xTreeTable.scrollTo(this.scrollLeft, scrollTop);
        // clearTimeout(this.timeid_scroll);
        // this.timeid_scroll = setTimeout(() => {
        //   this.bindEvent();
        // }, 150);
      }
    });
    this.onTableScroll = debounce(this.onTableScroll, 150);
    this.bindEvent();
  }

  /**
   * 绑定表格滚动事件
   */
  bindEvent() {
    this.unbindEvent();
    this.$refs.xTreeTable.addEventListener('scroll', (event) => {
      const scrollTop = this.$refs.xTreeTable.scrollTop;
      Bus.$emit('TableYScroll', {
        scrollTop,
      });
    });
  }

  /**
   * 移除表格滚动事件
   */
  unbindEvent() {
    this.$refs.xTreeTable.removeEventListener('scroll', () => {});
  }

  updated() {
    this.$nextTick().then(() => {
      // 延时是为了拿到更新后最新的滚动值
      setTimeout(() => {
        const scrollTop =
          this.$refs.xTreeTable && this.$refs.xTreeTable.scrollTop;
        Bus.$emit('TableYScroll', {
          scrollTop,
        });
      }, 100);
    });
  }

  /**
   * 表格滚动事件
   */
  onTableScroll() {
    const scrollTop = this.$refs.xTreeTable.scrollTop;
    Bus.$emit('TableYScroll', {
      scrollTop,
    });
  }

  // @@ 数据序列化
  serializeColumns() {
    const originalTableColumns = this.originalTableColumns;

    const sle = { id: '__ordinalNo', width: 48, vcTitle: '序号', type: 1000 };
    const cls = this.tableConfig.rowOrdinal
      ? [sle, ...originalTableColumns]
      : [...originalTableColumns];
    return JSON.parse(JSON.stringify(cls));
  }

  //初始化视图列表表格数据
  serializeTableData() {
    // let tableData: TableData;
    const tableConfig = this.tableConfig;
    const columns = this.columns;

    // 表属性
    const tableClasses: string[] = ['table-container'];
    if (tableConfig.rowSelectable) {
      tableClasses.push('row-selectable');
    }
    if (!tableConfig.columnResizable) {
      tableClasses.push('no-column-resizing');
    }

    // 表头
    const thead: TableDataRowCategory = {
      additionalClasses: ['table-head-wrapper'],
      rows: [
        {
          id: '',
          checked: false,
          additionalClasses: ['table-row', 'table-head-row'],
          expanded: false,
          cols: columns.map((col) => ({
            value: col.vcTitle,
            // NOTE: thead-col 的属性会复制到 tbody-col 上
            properties: this.setOnlyFlag(col),
            additionalClasses: [
              'table-row-item',
              `table-row-item-${col.id}`,
              `table-row-item-type-${col.propertyType}`,
              col.propertyType === DataItemType.Sheet
                ? 'child-sheet-row-item'
                : '',
            ],
            style: {},
          })),
        },
      ],
    };

    // 加 fixed-top 标识, 并带上 sticky 位置信息;
    if (tableConfig.fixedHeader) {
      thead.additionalClasses.push('fixed-top-header');
      thead.style = { top: 0 };
    }
    // 加 fixed-left
    const positiveCols: TableDataColItem[] = thead.rows[0].cols.concat();
    const fixedLeftColumns = tableConfig.fixedLeftColumns || [];
    let fixedLeftPosition = 0;
    // 计算 fixed-left 位置
    positiveCols.some((col: TableDataColItem, colIdx: number) => {
      if (fixedLeftColumns.indexOf(col.properties.id) < 0) {
        if (colIdx > 0) {
          // 给最后一个添加标识
          positiveCols[colIdx - 1].additionalClasses =
            positiveCols[colIdx - 1].additionalClasses || [];
          positiveCols[colIdx - 1].additionalClasses.push(
            'fixed-left-column-last',
          );
        }
        return true;
      }
      // 加上固定左边的标识
      col.additionalClasses.push('fixed-left-column');
      // console.log('__________', col);
      col.style = { ...col.style, left: fixedLeftPosition + 'px' };
      fixedLeftPosition += col.properties.width;
      return false;
    });

    // 加 fixed-right 标识
    const invertedCols: TableDataColItem[] = thead.rows[0].cols
      .concat()
      .reverse();
    const fixedRightColumns = tableConfig.fixedRightColumns || [];
    let fixedRightPosition = 0;
    // 倒序循环, 计算 fixed-right 的位置
    invertedCols.some((col: TableDataColItem, colIdx) => {
      // 如果碰到 fixed-left, 也结束循环
      // col.additionalClasses = col.additionalClasses || [];
      if (
        col.additionalClasses.indexOf('fixed-left-column-last') > -1 ||
        fixedRightColumns.indexOf(col.properties.id) < 0
      ) {
        if (colIdx > 0) {
          invertedCols[colIdx - 1].additionalClasses.push(
            'fixed-right-column-last',
          );
        }
        return true;
      }
      // 加上固定左边的标识
      col.additionalClasses.push('fixed-right-column');
      col.style = { ...col.style, right: fixedRightPosition + 'px' };
      fixedRightPosition += col.properties.width;
      return false;
    });

    // 表体, 表头标题字段一致; 所以某些属性直接复制, 不做计算
    //当有数字汇总项时添加额外的class

    let additionalClasses: any = [];
    if (this.originalNumberData) {
      additionalClasses = ['table-body-wrapper has-number-item'];
    } else {
      additionalClasses = ['table-body-wrapper'];
    }
    const tbody: TableDataRowCategory = {
      additionalClasses,
      rows:
        this.modelType === 'LIST'
          ? this.originalTableData.map((row, rowIdx) => {
              // 'table-row-item',`table-row-item-${col.properties.id}`, ...
              const additionalClasses: string[] = [
                'table-row',
                'table-body-row',
              ];
              if (
                ['草稿', '进行中', 'Draft', 'Processing'].includes(
                  row.sequenceStatus,
                )
              ) {
                additionalClasses.push('unfinished');
              }
              return {
                id: row.id,
                index: rowIdx,
                __ordinalNo:
                  this.pageVM.curPage > 1
                    ? rowIdx +
                      1 +
                      (this.pageVM.curPage - 1) * this.pageVM.pageSize
                    : rowIdx + 1,
                checked: false,
                additionalClasses,
                cols: this.handleColumns('LIST', row, positiveCols),
              };
            })
          : this.getTreeData(this.originalTableData, positiveCols, 0, 1),
    };
    this.initGanttProperties(tbody.rows);
    if (this.isCustomScriptOpen) {
      this.initcustomScript(tbody.rows);
    }
    const tableData: TableData = {
      thead,
      tbody,
      additionalClasses: tableClasses,
    };

    return tableData;
  }

  //获取用于树形视图展示的列表数据
  getTreeData(children, positiveCols, curIdx, depths) {
    let result: any = [];
    let temp = curIdx;
    children.forEach((row, rowIdx) => {
      const additionalClasses: string[] = ['table-row', 'table-body-row'];
      if (
        ['草稿', '进行中', 'Draft', 'Processing'].includes(row.sequenceStatus)
      ) {
        additionalClasses.push('unfinished');
      }
      result.push({
        depth: depths,
        expanded: row.expanded,
        id: row.id,
        index: temp,
        __ordinalNo:
          this.pageVM.curPage > 1
            ? temp + 1 + (this.pageVM.curPage - 1) * this.pageVM.pageSize
            : temp + 1,
        checked: false,
        additionalClasses,
        cols: this.handleColumns('TREE', row, positiveCols),
      });

      if (row.t__children_ && row.expanded) {
        result = [
          ...result,
          ...this.getTreeData(
            row.t__children_,
            positiveCols,
            temp + 1,
            depths + 1,
          ),
        ];
      }
      if (row.t__children_ && row.expanded) {
        temp = temp + this.getChildren_length(row.t__children_);
      }
      temp = temp + 1;
    });

    return result;
  }

  //对表格列数据的格式化
  handleColumns(type: string, row: any, positiveCols: any) {
    const arr = this.columns.map((col, colIdx) => {
      let value = row[col.propertyAlias] || row[col.id];
      const page: number = 1;
      let last: boolean = true;
      let sourceValue: any = null;
      const collapsible: boolean = true;
      // NOTE:  table-body-col 会使用 table-head-col 所定义的类名
      let { properties, additionalClasses, style, html } = positiveCols[colIdx];
      if (col.propertyType === DataItemType.Number) {
        Object.assign(style, { 'flex-direction': 'row-reverse' });
      }
      if (type === 'TREE') {
        additionalClasses = [...positiveCols[colIdx].additionalClasses];
        if (
          row.t__children_ &&
          row.t__children_[0] &&
          colIdx === 1 &&
          !row.expanded
        ) {
          const lastClass = additionalClasses.pop();
          if (lastClass !== 'collapse') {
            additionalClasses.push(lastClass);
          }
          additionalClasses.push('expand');
        } else if (row.t__children_ && row.t__children_[0] && colIdx === 1) {
          const lastClass = additionalClasses.pop();
          if (lastClass !== 'expand') {
            additionalClasses.push(lastClass);
          }
          additionalClasses.push('collapse');
        } else {
          //Else Empty block statement
        }
      }
      // 对附件
      if (
        col.propertyType === DataItemType.Attachment &&
        !!value &&
        Array.isArray(value)
      ) {
        value.forEach((v) => {
          // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
          v.isImage = /^image\//.test(v.mimeType);
          v.url = renderer.UploadControl.service.getDownloadUrl(v);
        });
      }
      // 关联单选
      if (col.propertyType === DataItemType.RelevanceForm && !!value) {
        //关联多选中关联的是地址类型控件的话value为字符串JSON，这里目前先使用是否json来判断
        const isJson = this.isJSON(value);
        if (isJson) {
          value = getRealValue(col, value);
        } else if (Array.isArray(value)) {
          value = value.map((el) => el.name).join(',');
        } else {
          //Else Empty block statement
        }
      }
      // 关联多选
      if (col.propertyType === DataItemType.RelevanceFormEx && !!value) {
        // 关联多选中关联的是地址类型控件的话value为字符串JSON，这里目前先使用是否json来判断

        let isJson = false;
        let valueList = [];
        valueList = value.split(';');
        //@ts-ignore
        isJson = this.isJSON(valueList[0]);
        if (isJson) {
          value = '';
          valueList.forEach((ele) => {
            value += `${getRealValue(col, ele)};`;
          });
        }
      }
      // 对富文本
      else if (
        col.propertyType === DataItemType.LongText &&
        /<\/?[a-zA-Z]+("[^"]*"|'[^']*'|[^'">])*>/.test(value)
      ) {
        value = '该内容不支持展示';
        additionalClasses = [...additionalClasses];
        additionalClasses.push('text-disabled');
      } else if (
        col.propertyType === DataItemType.Date ||
        col.propertyType === DataItemType.Time
      ) {
        value = getRealValue(col, value);
      }
      // 对子表
      else if (
        col.propertyType === DataItemType.Sheet &&
        Array.isArray(value) &&
        Array.isArray(col.childColumns)
      ) {
        // 子表数据项做本地分页，sourceValue为原数据
        value.forEach((val) => {
          col.childColumns.forEach((childCol: any) => {
            let cValue = val[childCol.id];
            // 对附件(子表)
            if (
              childCol.propertyType === DataItemType.Attachment &&
              !!cValue &&
              Array.isArray(cValue)
            ) {
              cValue.forEach((v) => {
                // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
                v.isImage = /^image\//.test(v.mimeType);
                v.url = renderer.UploadControl.service.getDownloadUrl(v);
              });
            } else if (
              childCol.propertyType === DataItemType.Date ||
              childCol.propertyType === DataItemType.Time
            ) {
              cValue = getRealValue(childCol, cValue);
            }
            // 对富文本（子表）
            else if (
              childCol.propertyType === DataItemType.LongText &&
              /<\/?[a-zA-Z]+("[^"]*"|'[^']*'|[^'">])*>/.test(cValue)
            ) {
              val[childCol.id] = {
                text: '该内容不支持展示',
                class: 'text-disabled',
              };
            } else {
              //Else Empty block statement
            }
            // 关联单选
            if (
              childCol.propertyType === DataItemType.RelevanceForm &&
              Array.isArray(cValue)
            ) {
              val[childCol.id] = cValue[0].name;
            }
          });
        });
        sourceValue = value;
        value = value.slice(0, this.pageSize);
        last = sourceValue.length === value.length;
      } else {
        //Else Empty block statement
      }

      return {
        properties,
        additionalClasses,
        style,
        value,
        sourceValue,
        page,
        last,
        collapsible,
        html,
      };
    });

    return arr;
  }

  //获取传入参数的长度
  getChildren_length(arr) {
    if (!arr || arr.length === 0) {
      return 0;
    }
    let count = 0;
    count = arr.length;
    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].t__children_ &&
        arr[i].t__children_.length !== 0 &&
        arr[i].expanded
      ) {
        count = count + this.getChildren_length(arr[i].t__children_);
      }
    }
    return count;
  }

  //点击展开图标时使用，expand=!expand
  expandRow(row: any) {
    this.changeStatus(this.originalTableData, row.id);
    this.tableData = this.serializeTableData();

    const expandedType = row.expanded ? 'collapse' : 'expanded';
    const bizObjectId = row.id;
    this.$emit('onExpandRow', { expandedType, bizObjectId });
  }

  //递归搜索需要修改expand的行
  changeStatus(children, rowId) {
    try {
      children.forEach((row) => {
        if (row.id === rowId) {
          if (
            !row.expanded &&
            (!row.t__children_[0].t__children_ ||
              row.t__children_[0].t__children_.length === 0)
          ) {
            this.$emit('getAsyncTreeData', rowId); //获取异步树形的数据，每次获取两层数据
          }
          row.expanded = !row.expanded;
          throw Error('error-----');
        }
        if (row.t__children_ && row.expanded) {
          this.changeStatus(row.t__children_, rowId);
        }
      });
    } catch (error) {}
  }

  //判断是否为json对象
  isJSON(str) {
    if (typeof str === 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj === 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  }

  // 给具有排序字段添加状态
  setOnlyFlag(col: any): any {
    // 判断是否为序号，是，则直接返回
    if (col.type === 1000) {
      return col;
    }
    // {...col ,isEdit: false,sub: null }
    this.sortConfigMap.forEach((item: any) => {
      if (col.key === item.propertyCode) {
        this.$set(col, 'isEdit', false);
        if (this.isSort) {
          if (item.propertyCode === this.sortCode) {
            this.$set(col, 'isEdit', true);
          }
        }
        const subValue = item.direction === null ? 2 : item.direction;
        this.$set(col, 'sub', subValue);
        // col.isEdit = false
        // col.sub = item.direction || 2
      }
    });
    return col;
  }

  // 子表数据项加载更多
  loadMore(col: any) {
    col.page += 1;
    col.value = col.sourceValue.slice(0, col.page * this.pageSize);
    col.last = col.value.length >= col.sourceValue.length;
  }

  // @@ 函数
  // 合并列宽度(colspan)
  combineColsWidth(row, col) {
    // return col.properties.width;
    const span = +col.colspan;
    if (isNaN(span) || span <= 1) {
      return col.properties.width;
    }

    // 计算对应的 columns idx
    let colIdx = 0;
    row.cols.some((c, i) => {
      if (c === col) {
        return true;
      }
      colIdx += isNaN(c.colspan) ? 1 : parseInt(c.colspan, 10);
    });

    // 通过下标和span的长度, 获取合并长度
    const columns = this.columns;
    let colWidth = 0;
    let loopIdx = colIdx;
    const loopLen =
      colIdx + span > columns.length ? columns.length : colIdx + span;
    for (; loopIdx < loopLen; loopIdx++) {
      colWidth += +columns[loopIdx].width;
    }
    return colWidth;
  }

  // @@ dom 事件
  // * 列宽自定义
  resizeStart: number = 0;

  resizeMove: number = 0;

  resizeBar: any = null;

  resizeBars: any[] = [];

  resizeBarName: string = 'resize-bar';

  resizeMinWidth = 70;

  //拖动调整列宽度开始时触发，设置各个列的宽度
  resizeStartHandler(e) {
    const target = e.target;
    if (target.className !== this.resizeBarName) {
      return;
    }

    // console.log( target, this.resizeBars.length );

    e.preventDefault();
    const isChildSheet = target.getAttribute('data-sheet');
    let resizeBar: any = {};
    if (isChildSheet) {
      const parentIndex = +target.getAttribute('parent-index');
      const parentBar = this.resizeBars[parentIndex];
      if (!parentBar || !parentBar.childColumns) {
        return;
      }
      resizeBar = parentBar.childColumns[+target.getAttribute('data-index')];
      resizeBar.parentIndex = parentIndex;
    } else {
      resizeBar = this.resizeBars[+target.getAttribute('data-index')];
    }

    resizeBar.width = resizeBar.parent.clientWidth;
    // resizeBar.minWidth = (resizeBar.parent.children[0] as any).clientWidth || this.resizeMinWidth;
    resizeBar.parent.classList.add('resizing');

    // console.log( (resizeBar.parent.children[0]).clientWidth, resizeBar.minWidth );

    // 记录
    this.resizeBar = resizeBar;
    this.resizeStart = e.pageX;
  }

  //用于动态调整列表单元格的宽度
  resizeMoveHandler(e) {
    if (!this.resizeBar) {
      return;
    }
    const {
      index,
      column,
      width,
      parent,
      minWidth,
      isLastColumn,
      isChildSheet,
      parentIndex,
      childColumns,
    } = this.resizeBar;

    const computedWidth = width - (this.resizeStart - e.pageX);

    // 如果小于最小宽度, 直接滚粗
    if (computedWidth <= minWidth) {
      return;
    }

    // 重置 backupWidth, 否则最后一列的宽度无法设置
    if (isLastColumn) {
      this.resizeBar.backupWidth = 0;
    }

    column.width = computedWidth;

    // 子表子数据项处理
    if (isChildSheet) {
      const parentBar = this.resizeBars[parentIndex];
      if (parentBar && parentBar.childColumns) {
        // 拖拽子表子数据项且父级子表为最后一列时重置backupWidth和backupMinWidth
        parentBar.backupWidth = parentBar.isLastColumn
          ? 0
          : parentBar.backupWidth;
        parentBar.backupMinWidth = parentBar.isLastColumn
          ? 0
          : parentBar.backupMinWidth;
        this.computeChildSheetWidth(
          parentIndex,
          parentBar,
          parentBar.childColumns,
        );
      }
    }
    this.computeWidth({ isChildSheet, curColumn: column, isLastColumn });
    // this.columns.splice( index, column );
  }

  //拖动调整列宽度结束时触发，设置各个列的宽度
  resizeEndHandler(e) {
    if (!this.resizeBar) {
      return;
    }
    const { index, width, parent, column, isChildSheet, parentIndex } =
      this.resizeBar;
    const finalWidth = parseInt(parent.style.width);

    parent.classList.remove('resizing');

    this.resizeBar.width = column.width;
    this.resizeStart = 0;
    this.resizeBar = null;

    let cIndex = index;
    let parentColumn: any = null;
    if (isChildSheet) {
      parentColumn = this.originalTableColumns[parentIndex];
      if (parentColumn && parentColumn.childColumns) {
        parentColumn.childColumns[cIndex].width = column.width;
      }
    } else {
      // 修改源数据, 否则在不刷新的情况下调整宽度+设置列展示项, 会取之前的宽度
      cIndex = this.tableConfig.rowOrdinal ? index - 1 : index;
      this.originalTableColumns[cIndex].width = column.width;
    }

    // 驱动 vm 做记录
    this.$emit('onResizeEnd', {
      index,
      column,
      width: column.width,
      parentColumn,
    });
  }

  // * 初始化列调整尺寸功能
  initColumnsResizing() {
    const theadWrapper: any = this.$el.querySelector('.table-head-wrapper');
    if (!theadWrapper) {
      return console.error('table-head not found!');
    }

    const ths = theadWrapper.querySelectorAll('.table-row-item');

    this.resizeBars = [];
    this.columnsResizing(ths, this.columns, this.resizeBars);
  }

  //初始化表格列的宽度
  columnsResizing(
    ths: any,
    or_columns: any,
    resizeBars: any,
    isChildSheet?: boolean,
    parentIndex?: number,
  ) {
    const thLen = ths.length;
    [].forEach.call(ths, (th: any, i) => {
      // 最后一个不开发"手动"宽度调整, 仅程序自动
      // if ( i===thLen-1 ) { return ; }

      // 序号不开放宽度调整
      const column = or_columns[i];
      const isLastColumn = i === thLen - 1;
      const offsetWidth = th.children[0].offsetWidth;
      if (column.id === '__ordinalNo') {
        return;
      }

      let bar = th.querySelector(`.${this.resizeBarName}`);
      if (!bar && (!isChildSheet || !isLastColumn)) {
        bar = document.createElement('b');
        bar.className = this.resizeBarName;
        bar.setAttribute('data-index', String(resizeBars.length));
        // 给子表数据项增加标记及其所属子表index
        if (isChildSheet) {
          bar.setAttribute('data-sheet', isChildSheet);
          bar.setAttribute('parent-index', parentIndex);
        }
        th.appendChild(bar);
      }

      // 最后一行样式有些许不同, 因此这里做个偏移
      const minWidthOffset = isLastColumn ? 5 : 0;
      let minWidth = offsetWidth
        ? offsetWidth + 15 + minWidthOffset
        : this.resizeMinWidth + minWidthOffset;

      // 子表里的数据项作为子表项childColumns
      let childColumns: any = null;

      // 子表处理-重复调用columnsResizing方法。
      if (column.propertyType === DataItemType.Sheet && column.childColumns) {
        childColumns = [];
        column.width = isLastColumn ? column.width + 13 : column.width;
        const cths = th.querySelectorAll('.child-row-item');
        this.columnsResizing(
          cths,
          column.childColumns,
          childColumns,
          true,
          resizeBars.length,
        );
        // 子表最小宽由子数据项的宽之和
        const lastChildColumn =
          column.childColumns[column.childColumns.length - 1];
        const lastChildResizebar = childColumns[childColumns.length - 1];
        const exsertedWidth = column.childColumns.reduce(
          (s, c, i) =>
            (s +=
              c === lastChildColumn ? lastChildResizebar.minWidth : +c.width),
          0,
        );
        minWidth = isLastColumn ? exsertedWidth + 13 : exsertedWidth;
        const sumWidth = column.childColumns.reduce(
          (s, c, i) => (s += c === lastChildColumn ? 0 : +c.width),
          0,
        );
        lastChildColumn.width = isLastColumn
          ? column.width - sumWidth - 13 - 15
          : column.width - sumWidth;
        // console.log('child-sheet-minWidth', minWidth);
      }

      if (minWidth > column.width) {
        column.width = minWidth;
      }

      resizeBars.push({
        index: i,
        element: bar,
        parent: th,
        column,
        // 最后一个需要做特别处理, 所以加个标识
        isLastColumn,
        minWidth,
        // : offsetWidth? offsetWidth+15+minWidthOffset: this.resizeMinWidth+minWidthOffset
        // 子表表头参数标识
        isChildSheet,
        childColumns,
      });
    });
  }

  //当表格滚动条滚动时触发
  tableScrollHandler(e) {
    // console.log('_)____')
    const el = this.$el;
    const container = this.tableContainerElement;
    let v, h;

    if (!container) {
      return;
    }
    // 纵向
    if (el.scrollTop === 0) {
      v = 'v-top';
    } else if (el.scrollTop === el.scrollHeight - el.clientHeight) {
      v = 'v-bottom';
    } else {
      v = 'v-middle';
    }
    // 横向
    if (el.scrollLeft === 0) {
      h = 'h-left';
    } else if (el.scrollLeft === el.scrollWidth - el.clientWidth) {
      this.customSuspensionVal = false;
      h = 'h-right';
    } else {
      this.customSuspensionVal = true;
      h = 'h-middle';
    }

    //设置数值汇总项在table底部
    if (this.originalNumberData) {
      const numberEl: any = this.$refs.tableNumberItem;
      const rowEl: any = document.querySelectorAll('.table-number-item-row');
      if (el.scrollLeft > 0) {
        //@ts-ignore
        if (
          Number(el.scrollLeft.toFixed()) ===
          el.scrollWidth - el.clientWidth
        ) {
          rowEl.forEach((r) => {
            r.style.paddingLeft = '5px';
          });
        } else {
          rowEl.forEach((r) => {
            r.style.paddingLeft = '8px';
          });
        }
        numberEl.scrollLeft = el.scrollLeft;
      }
    }
    container.setAttribute('data-v-pos', v);
    container.setAttribute('data-h-pos', h);
  }

  bottom = 0;

  //初始化底部汇总功能位置
  handleSerializeNumberScroll() {
    if (this.originalNumberData) {
      const numberEl: any = this.$refs.tableNumberItem;
      numberEl.scrollLeft = this.$el.scrollLeft;
    }
  }

  // 根据用户自定义子表数据项列宽, 动态调整子表表格的尺寸
  computeChildSheetWidth(
    parentIndex: number,
    childSheet: any,
    childResizeBar: any,
  ) {
    if (!childResizeBar.length) {
      return;
    }

    const pIndex = this.tableConfig.rowOrdinal ? parentIndex + 1 : parentIndex;
    const columns = this.columns[pIndex].childColumns;
    const lastColumn = columns[columns.length - 1];
    const lastChildResizebar = childResizeBar[childResizeBar.length - 1];
    const tableClientWidth = childSheet.backupWidth || 0;
    let tableScrollWidth = columns.reduce(
      (s, c, i) => (s += isNaN(c.width) ? this.resizeMinWidth : +c.width),
      0,
    );
    const exsertedWidth = tableScrollWidth - tableClientWidth;

    tableScrollWidth = childSheet.isLastColumn
      ? tableScrollWidth + 13 + 5
      : tableScrollWidth;

    // 做拉伸
    if (exsertedWidth === 0) {
      return;
    } else {
      const childSheetMinWidth =
        tableScrollWidth - lastColumn.width + lastChildResizebar.minWidth;
      childSheet.minWidth = childSheetMinWidth;
      // console.log('childSheetMinWidth', childSheetMinWidth);
      this.columns[pIndex].width = tableScrollWidth;
    }
  }

  // 根据用户自定义列宽, 动态调整表格/最后一列的尺寸
  tableClientWidth: number = 0;

  tableScrollWidth: string = '100%';

  // shouldComputeWidth:boolean = true;
  //设置表格列的宽度
  computeWidth(obj?: any) {
    if (!this.resizeBars.length) {
      return;
    } // 跟着 columns 变, 但仍然需要等待渲染完毕才能用
    const columns = this.columns;
    const lastColumn = columns[columns.length - 1];
    const lastResizebar = this.resizeBars[this.resizeBars.length - 1];
    const tableClientWidth =
      this.tableClientWidth ||
      (this.tableClientWidth =
        ((document.querySelector('#ApplicationList') as any) &&
          (document.querySelector('#ApplicationList') as any).clientWidth -
            16) ||
        0);
    const tableScrollWidth = columns.reduce(
      (s, c, i) =>
        (s += isNaN(c.width)
          ? this.resizeMinWidth
          : +((c === lastColumn && lastResizebar.backupWidth) || c.width)), // 如果是最后一个, 取备份值来计算
      0,
    );
    let exsertedWidth;
    if (this.customButtonsRow.length > 0) {
      exsertedWidth = tableScrollWidth - tableClientWidth + 140;
      this.customSuspensionVal = false;
    } else {
      exsertedWidth = tableScrollWidth - tableClientWidth;
    }

    // 记录尾列的原始数据
    if (!lastResizebar.backupWidth) {
      lastResizebar.backupWidth = +lastColumn.width;
    }
    if (!lastResizebar.backupMinWidth) {
      lastResizebar.backupMinWidth = lastResizebar.minWidth;
    }

    // 做拉伸

    if (exsertedWidth === 0) {
      return;
    } else if (exsertedWidth > -5) {
      // console.log( 'Width---',lastResizebar.backupWidth,lastResizebar.minWidth, exsertedWidth, lastResizebar.backupMinWidth );
      // this.shouldComputeWidth = false;
      lastColumn.width = lastResizebar.backupWidth;
      // 动态记录最后一列的最小宽度
      lastResizebar.minWidth =
        lastResizebar.minWidth - exsertedWidth > lastResizebar.backupMinWidth
          ? lastResizebar - exsertedWidth
          : lastResizebar.backupMinWidth;
      this.tableScrollWidth = tableScrollWidth + 'px';
    } else {
      // this.shouldComputeWidth = false;
      lastColumn.width = lastResizebar.backupWidth - exsertedWidth;
      // 动态记录最后一列的最小宽度
      lastResizebar.minWidth =
        lastColumn.width > lastResizebar.backupMinWidth
          ? lastColumn.width
          : lastResizebar.backupMinWidth;
      this.tableScrollWidth = '100%';
    }

    // 最后一列为子表时动态处理子表的最后一列子数据项列宽(主表数据项才需要调整)
    if (
      obj &&
      !obj.isChildSheet &&
      lastColumn.propertyType === DataItemType.Sheet &&
      lastColumn.childColumns
    ) {
      const lastChildColumn =
        lastColumn.childColumns[lastColumn.childColumns.length - 1];
      const extraWidth = lastColumn.childColumns.reduce(
        (s, c, i) => (s += c === lastChildColumn ? 0 : +c.width),
        0,
      );
      // 去除最后一列的padding-right:13px(滚动条预留15px兼容IE)
      lastChildColumn.width = lastColumn.width - extraWidth - 13 - 15;
    }

    // 拖拽非最后一列且为子表时，调整该子表的子数据项最后一列的列宽
    if (
      obj &&
      obj.curColumn &&
      !obj.isLastColumn &&
      obj.curColumn.propertyType === DataItemType.Sheet &&
      obj.curColumn.childColumns
    ) {
      const lastChildColumn =
        obj.curColumn.childColumns[obj.curColumn.childColumns.length - 1];
      const extraWidth = obj.curColumn.childColumns.reduce(
        (s, c, i) => (s += c === lastChildColumn ? 0 : +c.width),
        0,
      );
      lastChildColumn.width = obj.curColumn.width - extraWidth;
      // console.log('lastChildColumn-width', lastChildColumn.width);
    }
  }

  tableContainerElement: any; // 记录为 vm 变量

  //表格Dom初始化时初始化绑定事件
  initDomEvents() {
    const tableConfig = this.tableConfig;
    const tableSelector = tableConfig.tableSelector || '.table-container';
    const tableContainer = this.$el.querySelector(tableSelector) as any;
    if (!tableContainer && this.modelType === 'LIST') {
      return this.$message.error(`找不到表单元素: ${tableSelector}`);
    }

    // 记录为 vm 变量
    this.tableContainerElement = tableContainer;

    // 如果可调节尺寸
    if (tableConfig.columnResizable) {
      const theadSelector = tableConfig.theadSelector || '.table-head-wrapper';
      const theadWrapper = tableContainer.querySelector(theadSelector);
      if (theadWrapper) {
        theadWrapper.removeEventListener('mousedown', this.resizeStartHandler);
        theadWrapper.addEventListener('mousedown', this.resizeStartHandler);
        document.removeEventListener('mousemove', this.resizeMoveHandler);
        document.addEventListener('mousemove', this.resizeMoveHandler);
        document.removeEventListener('mouseup', this.resizeEndHandler);
        document.addEventListener('mouseup', this.resizeEndHandler);
      } else {
        this.$message.error(`找不到表头元素: ${theadSelector}`);
      }
    }

    // 如果有固定的元素, 要监听滚动操作
    if (
      tableConfig.fixedHeader ||
      (Array.isArray(tableConfig.fixedLeftColumns) &&
        tableConfig.fixedLeftColumns.length) ||
      (Array.isArray(tableConfig.fixedRightColumns) &&
        tableConfig.fixedRightColumns.length)
    ) {
      this.$el.removeEventListener('scroll', this.tableScrollHandler);
      this.$el.addEventListener('scroll', this.tableScrollHandler);
    }

    window.onresize = function () {};
    window.addEventListener('resize', (e) => {
      this.tableClientWidth = this.$el.clientWidth;
      this.computeWidth();
      this.getWindowInfo();
    });

    this.initColumnsResizing();
    this.computeWidth();
    this.tableScrollHandler(null);
    this.getWindowInfo();
  }

  // @@ 用户事件
  rowSelection(action: string, row) {
    const rows = this.tableData.tbody.rows;

    if (action === 'checkAll') {
      rows.forEach((r) => (r.checked = true));
    } else if (action === 'cancelAll') {
      rows.forEach((r) => (r.checked = false));
    } else if (action === 'check') {
      row.checked = !row.checked;
    } else {
      //Else Empty block statement
    }
    if (this.modelType === 'TREE') {
      const selectKeys: any = [];
      rows.forEach((item) => {
        if (item.checked) {
          selectKeys.push(item.id); //树形的把选中的id传过去
        }
      });
      this.pageVM.onTreeCheck(selectKeys);
    } else {
      this.$emit(
        'onCheck',
        rows.map((r) => r.checked),
      );
    }
  }

  // @@ render
  // 如果模板字符串改变, compiled 相关也重置
  templateRender: Function | null = null;

  templateStaticRenderFns: Function | null = null;

  @Watch('templateString', { immediate: true })
  onTemplateStringChange() {
    this.templateRender = null;
    this.templateStaticRenderFns = null;
  }

  // 正常渲染流程
  render(h) {
    const that = this;
    const templateString = that.templateString
      ? that.templateString.trim()
      : listCustomTemplateConverter.template;

    // 优先使用缓存模板
    if (!that.templateRender) {
      const compiled = vueCompiler.compile(templateString);
      if (compiled.errors.length) {
        that.templateParsingError = `Error compiling template:\n\n${templateString}'\n\n${compiled.errors.join(
          '\n',
        )}`;
        return that.errorRender(h);
      }
      that.templateRender = new Function(compiled.render);
      that.templateStaticRenderFns = new Function(compiled.staticRenderFns);
    }

    return that.templateRender(h);
  }

  // 错误渲染流程 (输出错误信息)
  templateParsingError: string = '';

  templateParsingErrorHtml: any;

  //渲染异常提示框
  errorRender(h) {
    return h(
      'div',
      {
        attrs: { id: 'custom-list-container' },
      },
      [
        h(
          'pre',
          { attrs: { id: 'custom-list-parsing-error' } },
          this.templateParsingError,
        ),
      ],
    );
  }

  //获取数值数据项汇总名称
  getsumTypeName(type) {
    let name: string = '';
    switch (type) {
      case 1:
        name = '求和';
        break;
      case 2:
        name = '平均值';
        break;
      case 3:
        name = '最小值';
        break;
      case 4:
        name = '最大值';
        break;
      case 5:
        name = '计数';
        break;
      default:
        break;
    }
    return name;
  }

  // 格式化数值数据项汇总的值
  getNumberValue(control: any, column: any) {
    const value = control[column.key] || control[column.propertyAlias];
    let val: any = '--';
    if (value && value.num) {
      if (typeof value.num === 'number') {
        if (value.sumType !== 5) {
          val = Helper.numberToDisplay(value.num, column);
        } else {
          //计数不需要做格式化
          val = value.num;
        }
      }
    }
    return val;
  }

  //甘特图数据初始化
  initGanttProperties(rows) {
    if (!this.ganttProperties) {
      return;
    }
    const ganttPropertiesVlaue = Object.values(this.ganttProperties);
    rows.forEach((row) => {
      row.cols.forEach((col) => {
        if (ganttPropertiesVlaue.includes(col.properties.key)) {
          col.ganttProperty = true;
          if (
            col.properties.propertyType === 3 ||
            col.properties.propertyType === 2
          ) {
            if (col.properties.propertyType === 2) {
              const numberTypeNameList = Helper.numberTypeName;
              col.format = numberTypeNameList.find(
                (i) => i.type === col.properties.displayFormat,
              ).text;
            }
            this.pageVM.dataItemList.forEach((item) => {
              if (item.code === col.properties.key) {
                col.relativeCode = item.relativeCode;
                col.reletivePropertyCode = item.relativePropertyCode;
                col.schemaCode = item.schemaCode;
                col.defaultProperty = item.defaultProperty;
              }
            });
          }
          if (col.properties.key === this.ganttProperties.titlePropertyCode) {
            const levelProperty =
              this.pageVM.dataItemList.find(
                (el) => el.code === this.ganttProperties.levelPropertyCode,
              ) || {};
            col.relativeCode = levelProperty.relativeCode;
            col.reletivePropertyCode = levelProperty.relativePropertyCode;
            col.schemaCode = levelProperty.schemaCode;
            this.pageVM.dataItemList.forEach((item) => {
              if (item.code === col.properties.key) {
                col.defaultProperty = item.defaultProperty;
              }
            });
          }
        }
      });
    });
  }

  /**
   * 表格行移入事件
   */
  rowMouseenter(rowIndex) {
    Bus.$emit('TableRowHover', {
      status: 'enter',
      index: rowIndex,
    });
  }

  /**
   * 表格行移出事件
   */
  rowMouseleave(rowIndex) {
    Bus.$emit('TableRowHover', {
      status: 'leave',
      index: rowIndex,
    });
  }

  //判断甘特图是否显示
  ganttPropertyCanEdit(col) {
    return (
      col.ganttProperty &&
      (col.properties.key === this.ganttProperties.titlePropertyCode ||
        col.properties.key === this.ganttProperties.startTimePropertyCode ||
        col.properties.key === this.ganttProperties.endTimePropertyCode ||
        col.properties.key === this.ganttProperties.progressPropertyCode)
    );
  }

  //初始化列表行列的自定义渲染
  initcustomScript(rows) {
    rows.forEach((row, rowIdx) => {
      this.customScript(rows, row.__ordinalNo);
      row.cols.forEach((col, colIdx) => {
        this.customScript(rows, row.__ordinalNo, colIdx);
      });
    });
  }

  // 自定义视图列表的单元格、列渲染
  customScript(con: any, rowIdx: number, colIdx?: number) {
    const item = {
      data: con,
      rowIdx,
      colIdx,
    };
    let returnItem = '';
    this.$emit('customScripts', item, (val) => {
      returnItem = val;
      if (returnItem) {
        const conItem = con.find((x) => {
          return x.__ordinalNo === rowIdx;
        });
        if (colIdx) {
          conItem.cols[colIdx].html = returnItem;
        } else {
          const arrItem = conItem;
          arrItem.html = returnItem;
          this.$set(con, conItem.index, arrItem);
        }
      }
    });
    return returnItem;
  }
}
</script>

<style lang="less">
@import './../../../../common/common';
@import './../../../../application/src/components/pc/style/custom-themes';
@import './style/listCustomTemplate.less';
</style>

<style lang="less" scoped>
@import './../../../../common/common';
/deep/.attachment-wrapper {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  height: 36px;
  > a {
    width: 22px;
    height: 22px;
    margin-right: 8px;
    min-width: 22px;
    > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
/deep/.icon.iconsvg {
  width: 22px;
  height: 22px;
}
.dept {
  > span {
    margin-right: 8px;
  }
}
.deptMulti {
  > span {
    height: 24px;
    background: #efefef;
    border-radius: 12px;
    display: flex;
    align-items: center;
    padding-right: 8px;
    > i {
      margin-right: 4px;
      width: 24px;
      height: 24px;
      background-color: rgba(17, 18, 24, 0.25);
      border-radius: 50%;
      color: #fff;
      font-size: 16px;
      line-height: 24px;
      display: inline-block;
      text-align: center;
    }
  }
}
.h-icon-all-get-address-o {
  font-size: 12px;
  color: rgba(17, 18, 24, 0.5);
  margin-right: 4px;
}
.custom-buttonX {
  width: 140px;
  min-width: 140px;
  height: 100%;
  min-height: 37px;
  position: absolute;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-direction: row;
  padding: 0 0 0 12px;
  border-bottom: 1px solid #e8e8e8;
  // box-shadow: -2px 2px 5px 0px rgba(0, 0, 0, 0.25), 0px -1px 0px 0px #e8eaed,
  //   1px 0px 0px 0px #e8eaed, -1px 0px 0px 0px #e8eaed;
  font-size: 13px;
  background-color: #ffffff;
  p {
    margin-bottom: 0;
  }
  .custom-buttonXTitle {
    font-weight: 600;
    line-height: 32px;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .custom-buttonXTitle1 {
    max-width: 75px;
    font-size: 13px;
    font-weight: 400;
    margin-right: 12px;
    color: @primary-color;
  }
  .custom-buttonXTitle1:hover {
    color: #1852d9;
  }
  .custom-buttonXModal {
    width: 120px;
    height: auto;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
    position: fixed;
    right: 50px;
    top: 100px;
    z-index: 25;
    background: #ffffff;
    border-radius: 4px;
    padding: 5px 5px 5px 12px;
    .custom-buttonXTitle {
      font-size: 14px;
      font-weight: 400;
      color: #111218;
    }
  }
  .custom-buttonXMore {
    line-height: 28px;
    cursor: pointer;
    color: @primary-color;
    padding-right: 15px;
  }
}

.custom-buttonX::after {
  content: '\200B';
  height: 102%;
  width: 8px;
  position: absolute;
  top: 0;
  left: -8px;
  z-index: 1;
  transition: box-shadow 0.3s ease;
  pointer-events: none;
  box-shadow: inset -12px 0px 6px -10px rgba(0, 0, 0, 0.25);
}

.custom-buttonXZw {
  width: 140px;
}
.positionStatic {
  position: static;
  height: auto;
}
</style>

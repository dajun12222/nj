<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-row type="flex" align="middle">
    <template v-for="(key, index) in controlKeys">
      <control-item
        v-if="isTitle(key)"
        :key="key"
        :control="controls[key]"
        :span="span[index]"
        :autoSpanValues="autoSpanValues"
        :class="{ selected: isSelected(controls[key]) }"
        @movingControl="movingControl"
      />

      <control-item
        v-else
        :key="key"
        v-h3-drag
        :control="controls[key]"
        :span="span[index]"
        :class="{ selected: isSelected(controls[key]) }"
        :autoSpanValues="autoSpanValues"
        @delete="emitControlDelete(key)"
        @copy="onCopy"
        @movingControl="movingControl"
      />
    </template>
  </a-row>
</template>

<script lang="ts">
import '@/directives/drag';
import { H3Draggable, H3Droppable } from '@/directives/drag';
import * as ControlFactory from 'cloudpivot/form/src/typings/control-factory';
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import * as dataitemStore from '../stores/data-items.store-helper';
import { DataItem, FormControl, FormControlType } from '../typings';
import ControlItem from './control-item.vue';
import { Layouter } from './layouter';
import { Row } from '@h3/antd-vue';
import { EventBus } from 'cloudpivot/form/src/schema/event-bus';

const css = ['ant-col', 'ant-row', 'ant-row-flex'];

@Component({
  name: 'control-container',
  components: {
    ControlItem,
    ARow: Row,
  },
})
export default class ControlContainer extends Vue implements H3Droppable {
  @Prop()
  controlKeys!: string[];

  @Prop()
  readonly controls!: { [key: string]: FormControl };

  @Prop()
  autoSpanValues!: any;

  @Prop()
  index!: number;

  @Prop()
  readonly ignoreTypes?: FormControlType[];

  @Prop()
  formFramework!: number;

  @Inject()
  emitDataItemAdd!: (item: DataItem) => void;

  @Inject()
  emitControlSelect!: (control?: FormControl) => void;

  @Inject()
  tabsControlSelected?: (control?: FormControl) => void;

  @Inject()
  isMobile!: Function;

  @Inject()
  getMovingControl!: Function;

  @Inject()
  setMovingControl!: Function;

  @Inject()
  getViewType!: Function;

  get mobile() {
    return this.isMobile();
  }

  /**
   * 拖动从主表移入子表时，需要清除显示空的定时器
   */
  @Prop()
  clearParentShowEmptyTask?: () => void;

  private _coordinate: [number, number] | null = null;

  get span() {
    const defaultSpan = 24;
    return this.controlKeys.map((key) => {
      if (this.mobile) {
        return defaultSpan;
      }
      let options: any = {};
      try {
        options = this.controls[key].options || {};
      } catch (e) {}

      if (options.span) {
        return options.span;
      }
      return this.autoSpanValues[key];
    });
  }

  @Inject()
  isSelected!: (control: FormControl) => boolean;

  @Inject()
  getSelectedControl!: () => any;

  isSheet(key: string) {
    const control = this.controls[key];
    return control.type === FormControlType.Sheet;
  }

  isTitle(key: string) {
    const control = this.controls[key];
    return control.type === FormControlType.Title;
  }

  get layouter() {
    return this.$parent as any as Layouter;
  }

  computeCoordinate(
    evt: DragEvent,
    controlKey?: string,
  ): [number, number, boolean] {
    if (
      !this.controlKeys ||
      !this.controlKeys.length ||
      !evt.srcElement ||
      !evt.dataTransfer ||
      (this.controlKeys.length === 1 && this.controlKeys[0] === '.')
    ) {
      return [this.index, 0, true];
    }

    const [offsetLeft, offsetTop] = this.computeOffset(evt);

    const el = this.$el as HTMLElement;

    const newlineThreshold = el.offsetHeight / 3;

    if (offsetTop <= newlineThreshold) {
      return [this.index, 0, true];
    }

    if (el.offsetHeight - offsetTop <= newlineThreshold) {
      return [this.index + 1, 0, true];
    }

    let type = evt.dataTransfer.types.find(
      (x) => x.indexOf('control-type-') > -1,
    );

    if (
      type &&
      ControlFactory.isFullRow(Number(type.substr(type.lastIndexOf('-') + 1)))
    ) {
      return [this.index + 1, 0, true];
    }

    type = evt.dataTransfer.types.find((x) => x.indexOf('dataitem-type-') > -1);
    if (type) {
      const ct = ControlFactory.mapToControlType(
        Number(type.substr(type.lastIndexOf('-') + 1)),
      );
      if (ControlFactory.isFullRow(ct)) {
        return [this.index + 1, 0, true];
      }
    }

    const target = evt.dataTransfer.types.find(
      (x) => x.indexOf('control-key-') > -1,
    );
    let targetKey = '';
    if (target) {
      targetKey = target.split('-').pop();
    }
    let targetWidth = undefined;
    Object.keys(this.controls).some((item) => {
      if (item.toLowerCase() === targetKey) {
        targetWidth = this.controls[item].options.span;
      }
    });
    const sameRow = this.controlKeys.some(
      (key) => key.toLowerCase() === targetKey,
    );
    if (
      !sameRow &&
      this.calcRowWidth(this.controlKeys) + (targetWidth || 6) > 24
    ) {
      return [this.index + 1, 0, true];
    }

    const col = this.computeCol(controlKey, el.offsetWidth, offsetLeft);
    return [this.index, col, false];
  }

  computeOffset(evt: DragEvent): [number, number] {
    let offsetLeft = evt.offsetX;
    let offsetTop = evt.offsetY;
    let ele = evt.srcElement as HTMLElement;

    if (ele) {
      // 当ant-row是flex布局时，偏移父节点是最外层的div.layout
      while (true) {
        if (
          Array(ele.classList.length)
            .fill(0)
            .some((x, i) => css.indexOf(ele.classList[i]) > -1)
        ) {
          break;
        }

        offsetLeft += ele.offsetLeft;
        offsetTop += ele.offsetTop;
        ele = ele.offsetParent as HTMLElement;
      }

      const el = this.$el as HTMLElement;
      offsetLeft += ele.offsetLeft - el.offsetLeft;
      offsetTop += ele.offsetTop - el.offsetTop;
    }

    return [offsetLeft, offsetTop];
  }

  onDragover(evt: DragEvent) {
    evt.stopPropagation();
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    if (this.clearParentShowEmptyTask) {
      this.clearParentShowEmptyTask();
    }
    const transfer = evt.dataTransfer;

    if (
      !transfer ||
      !transfer.types.some((t) => t === 'block' || t === 'control')
    ) {
      return;
    }

    const hasKey = this.controlKeys && this.controlKeys.length;
    const onlyOne = hasKey && this.controlKeys.length === 1;

    if (
      onlyOne &&
      this.controls[this.controlKeys[0]].type === FormControlType.Title
    ) {
      return;
    }

    if (transfer.types.some((t) => t.indexOf('dataitem-parent-') > -1)) {
      return;
    }

    const isControl = transfer.types.indexOf('control') > -1;

    const controlTypeStr = transfer.types.find(
      (x) => x.indexOf('control-type-') > -1,
    );
    let type: FormControlType | null = null;
    if (controlTypeStr) {
      type = Number(controlTypeStr.substr(controlTypeStr.lastIndexOf('-') + 1));

      if (this.isIgnoreTypes(type)) {
        return;
      }
    }

    if (isControl) {
      if (onlyOne) {
        // dataTransfer会自动转为小写
        const temp = 'control-key-' + this.controlKeys[0].toLowerCase();
        if (transfer.types.indexOf(temp) > -1) {
          return;
        }
      }
    } else {
      if (type !== null && type >= 100 && type < 200) {
        const code = ControlFactory.mapToSystemDataItemCode(type);

        const has = dataitemStore
          .getDataItems(this)
          .some((x: any) => x.isSystem && x.used === false && x.code === code);

        if (has === false) {
          return;
        }
      }
    }

    this.layouter.setHideEmptyTask();

    // 如果在空行之上
    if (onlyOne && this.controlKeys[0] === '.') {
      evt.preventDefault();
      return;
    }

    const [row, col, full] = this.computeCoordinate(evt, '.');

    // 如果在空列之上
    if (row === this.index && hasKey && this.controlKeys[col] === '.') {
      evt.preventDefault();
      return;
    }

    if (
      !this._coordinate ||
      row !== this._coordinate[0] ||
      col !== this._coordinate[1]
    ) {
      this._coordinate = [row, col];
      this.layouter.setShowEmptyTask(row, col, full);
    }

    evt.preventDefault();
  }

  onDragleave() {
    this._coordinate = null;
  }

  created() {
    if (this.index === -2) {
      EventBus.$on('addController', this.addControlByClick);
    }
  }

  /**
   * bus事件，点击新增控件时触发
   */
  addControlByClick(param) {
    const path = (this.$parent as any).path;
    const selectedControl = this.getSelectedControl();
    const type = param && param.json && param.json.type;
    if (this.getViewType() === 'web') {
      //若选中了子表或子表下的数据项，直接返回，交由子表处理
      if (
        selectedControl &&
        (selectedControl.type === 201 || selectedControl.parentKey) &&
        !this.canNotAddToSheet(type)
      ) {
        return;
      }
      //选中了tab页, 点击添加控件 ==> 向tab页中添加控件
      else if (
        selectedControl &&
        selectedControl.type === 500 &&
        !this.canNotAddToTabs(type)
      ) {
        if (this.canAddControlSelectTabs(selectedControl, path)) {
          this.addController(param);
        }
      }
      //选中了tab页中的组件（非子表，非子表中的数据项）
      else if (
        selectedControl &&
        selectedControl.path &&
        selectedControl.path.length > 0 &&
        !this.canNotAddToTabs(type)
      ) {
        if (this.canAddControlSelectControlInTabs(selectedControl, path)) {
          this.addController(param);
        }
      } else if (!path || path.length === 0) {
        this.addController(param);
      } else {
        //Else Empty block statement
      }
    }
  }

  destroyed() {
    if (this.index === -2) {
      EventBus.$off('addController', this.addControlByClick);
    }
  }

  addController(options: any) {
    this.layouter.setHideEmptyTask();

    const [row, col, full] = this.computeCoordinate(null, '.');
    if (
      !this._coordinate ||
      row !== this._coordinate[0] ||
      col !== this._coordinate[1]
    ) {
      this._coordinate = [row, col];
      this.layouter.setShowEmptyTask(row, col, full, true);
    }

    const block = options.json;
    const blockType = options.blockType;
    this.buildControlOf(blockType, block);
    this._coordinate = null;
  }

  onDrop(evt: DragEvent) {
    evt.stopPropagation();
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    if (this.index === -2) {
      this._coordinate = null;
    }

    const transfer = evt.dataTransfer;
    if (!transfer) {
      return;
    }

    const isControl = transfer.types.indexOf('control') > -1;

    if (isControl) {
      this.layouter.hideEmptyCol();
      const key = transfer.getData('control');
      if (!key) {
        return;
      }

      const [row, col, newline] = this.computeCoordinate(evt, key);

      const pathJson = transfer.getData('control-path');
      const path = pathJson ? JSON.parse(pathJson) : null;

      this.emitControlMove({
        row,
        col,
        newline,
        controlKey: key,
        controlPath: path,
      });
    } else {
      const json = transfer.getData('block');
      if (!json) {
        return;
      }

      this.layouter.clearHideEmptyTask();

      const block = JSON.parse(json);
      const blockType = transfer.getData('block-type');
      this.buildControlOf(blockType, block);
    }
    this.setMovingControl(null);
  }

  buildControlOf(blockType: string, block: any) {
    let control: FormControl;
    let dataItem: DataItem | undefined;
    if (blockType === 'control') {
      const controlType = block.type;

      // 只有基础控件和子表需要选择数据项
      if (controlType >= 90 && controlType !== FormControlType.Sheet) {
        control = ControlFactory.buildControl(block);
      } else {
        dataItem = ControlFactory.buildDataItemOf(block);
        control = ControlFactory.buildControlOf(dataItem, controlType);
      }
    } else {
      control = ControlFactory.buildControlOf(block);
    }

    if (
      control.type === FormControlType.RelevanceForm ||
      control.type === FormControlType.RelevanceFormEx
    ) {
      control.options.schemaCode = block.relativeCode || '';
    }
    if (this.layouter.replaceEmpty(control)) {
      //拖拽生成控件后，会有个空块问题解决
      this.layouter.hideEmptyCol();
      if (dataItem !== undefined) {
        this.emitDataItemAdd(dataItem);
      }
      this.controlSelect(control);
    }
  }

  onCopy(key: string) {
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    const control = this.controls[key];

    const copy = ControlFactory.copyControlFrom(control);

    // let dataItem: DataItem | undefined;
    // // 只有基础控件和子表需要选择数据项
    // if (!(control.type >= 90 && control.type !== FormControlType.Sheet)) {
    //   dataItem = ControlFactory.buildDataItemOf({
    //     type: copy.type,
    //     code: copy.key,
    //     name: copy.options.name
    //   });

    //   if(copy.type === FormControlType.RelevanceForm){
    //     dataItem.relativeCode = copy.options.schemaCode;
    //   }
    // }

    this.calcRowWidth(this.controlKeys);

    let rowIndex = this.index + 1;
    let colIndex = 0;
    let isNewLine = true;
    if (
      this.formFramework &&
      this.formFramework !== 5 &&
      this.calcRowWidth(this.controlKeys) <= 24 - 24 / this.formFramework
    ) {
      rowIndex = this.index;
      colIndex = this.controlKeys.length;
      isNewLine = false;
    }

    this.emitControlAdd(rowIndex, colIndex, isNewLine, copy, key);
    this.controlSelect(copy);
    // if (dataItem !== undefined) {
    //   this.emitDataItemAdd(dataItem);
    //   this.emitControlSelect(copy);
    // }
  }

  emitControlAdd(
    row: number,
    col: number,
    newline: boolean,
    control: FormControl,
    copyKey?: string,
  ) {
    this.$emit('control-add', {
      row: row,
      col: col,
      newline: newline,
      control,
      copyKey,
    });
  }

  emitControlMove(data: {
    row: number;
    col: number;
    newline: boolean;
    controlKey: string;
    controlPath: string[] | null;
  }) {
    this.$emit('control-move', data);
  }

  emitControlDelete(controlKey: string) {
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    this.$emit('control-delete', controlKey);
  }

  calcRowWidth(row) {
    return row.reduce((key1, key2) => {
      return this.findColumnWidth(key1) + this.findColumnWidth(key2);
    }, 0);
  }

  findColumnWidth(key) {
    if (typeof key === 'number') {
      return key;
    }
    if (key === '.') {
      return 0;
    }
    const firstChoice =
      this.controls[key] &&
      this.controls[key].options &&
      this.controls[key].options.span;
    const secondChoice = 6;
    if (this.formFramework === 5) {
      return 6;
    }
    return firstChoice || secondChoice;
  }

  controlSelect(control?: any) {
    if (control.path) {
      this.tabsControlSelected(control);
    } else {
      this.emitControlSelect(control);
    }
  }

  movingControl(key) {
    this.$emit('movingControl', key);
  }

  /**
   * 计算拖拽时空块应放置的列位置
   * 原先的逻辑由于只有自适应，每列宽度一致
   * 算法需要优化
   */
  computeCol(key, offsetWidth, offsetLeft) {
    const perWidth = offsetWidth / 24;
    let curWidth = 0;
    let count = 0;
    while (curWidth < offsetLeft || count === this.controlKeys.length) {
      curWidth += perWidth * this.span[count];
      count++;
    }
    return count - 1;
  }

  /**
   * 判断当前空块需要执行点击新增组件bus时间
   * 针对Tabs
   */
  canAddControlSelectTabs(control, path) {
    if (
      path &&
      path.includes(control.key) &&
      control.options &&
      control.options.heads
    ) {
      const activeTab = control.options.heads.find((item) => item.active);
      if (activeTab && path.includes(activeTab.key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 选中tabs控件内的控件时，点击新增控件
   */
  canAddControlSelectControlInTabs(control, path) {
    if (path && control.path[0] === path[0] && control.path[1] === path[1]) {
      return true;
    }
    return false;
  }

  /**
   * 根据控件类型判断是否应该组织新增
   */
  isIgnoreTypes(type) {
    return this.ignoreTypes && this.ignoreTypes.indexOf(type) > -1;
  }

  /**
   * 根据类型判断能否不能在tabs中加入
   */
  canNotAddToTabs(type) {
    return type === 500;
  }

  /**
   * 根据类型判断能否不能在子表中加入
   */
  canNotAddToSheet(type) {
    return type >= 90 || type === FormControlType.ApprovalOpinion;
  }
}
</script>

<style lang="less" scoped>
.ant-row,
.ant-row-flex {
  min-height: 52px;
  flex-shrink: 0;

  &:not(.group) {
    border-bottom: 1px dashed rgba(232, 232, 232, 1);
  }
}

.ant-row-flex:last-child {
  flex-grow: 1;
  flex-shrink: 1;
  border-bottom: none;
  // min-height: 156px;
}
.mobile {
  .ant-row-flex {
    min-height: 45px;
    &:not(.group) {
      border-bottom: none;
    }
  }
}

.mobile > .ant-row-flex,
.mobile .ant-col {
  min-height: 45px;
  border: none;
}
</style>

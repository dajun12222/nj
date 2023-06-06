<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <td v-if="isEntry" class="entry"></td>

  <td
    v-else-if="control"
    class="col"
    :tabindex="10"
    @click="onClick"
    @keyup.46.stop="deleteCtrl"
    @keydown.ctrl.67.stop.prevent="onCtrlC"
    @keydown.ctrl.86.stop.prevent="onCtrlV"
  >
    <div class="title">{{ label }}</div>
    <div class="control" style="position: relative">
      <base-control :control="control" />
      <div v-show="control.options.visible === false" class="cover"></div>
    </div>

    <div class="icon-copy sheet-control" @click.stop="onCopy($event)">
      <i class="icon aufontAll h-icon-all-paste"></i>
    </div>

    <a-popover
      :visible="deleteVisible"
      trigger="click"
      @visibleChange="visibleChange"
    >
      <template #content>
        <div class="delete-popover">
          <div class="deleteTipDeep">
            <i class="icon aufontAll h-icon-all-Components_Warning"></i>
            <div class="delete-tip-text">
              <span>确定要删除"{{ getControlName().slice(0, 7) }}
                <br v-if="getControlName().length > 7" />
                {{
                  getControlName().slice(7, 8) +
                  (getControlName().length > 8 ? '...' : '')
                }}"吗？</span>
            </div>
          </div>
          <!-- <div class="deleteTip">(免费版删除后无法恢复)</div> -->
          <div class="deleteButton">
            <span class="cancel">
              <a-button
                @click="
                  () => {
                    deleteVisible = false;
                  }
                "
                >取消</a-button>
            </span>
            <span class="delete">
              <a-button type="primary" @click="deleteCtrl">确定</a-button>
            </span>
          </div>
        </div>
      </template>
      <div
        class="icon-delete sheet-control"
        type="primary"
        @click="onDelete($event)"
      >
        <i class="icon aufontAll h-icon-all-delete-o"></i>
      </div>
    </a-popover>
  </td>

  <td v-else>
    <div class="empty-item">
      <template v-if="index === -2">从左侧拖拽来添加字段</template>
    </div>
  </td>
</template>

<script lang="ts">
import '@/directives/drag';
import { H3Draggable, H3Droppable } from '@/directives/drag';
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import {
  DataItem,
  FormControl,
  FormControlType,
  FormSheet,
  FormSheetColumn,
} from '../typings';
import * as ControlFactory from '../typings/control-factory';
import BaseControl from './base-control.vue';
import { Popover, Button } from '@h3/antd-vue';
import { EventBus } from 'cloudpivot/form/src/schema/event-bus';
const prefix = 'dataitem-parent-';

const empty_key = '.';

@Component({
  name: 'sheet-column',
  components: {
    BaseControl,
    APopover: Popover,
    AButton: Button,
  },
})
export default class SheetColumn
  extends Vue
  implements H3Draggable, H3Droppable
{
  @Prop()
  readonly index!: number;

  @Prop()
  readonly control!: FormControl;

  @Prop()
  readonly parentControl!: FormSheet;

  private _moveIndex?: number;

  get id() {
    return `${this.parentControl.key}_${this.control.key}`;
  }

  @Inject()
  emitControlSelect!: Function;

  @Inject()
  emitDataItemAdd!: (item: DataItem) => void;

  @Inject()
  getSelectedControl!: () => any;

  /**
   * 拖动从主表移入子表时，需要清除显示空的定时器
   */
  @Inject()
  clearParentShowEmptyTask!: () => void;

  @Inject()
  getViewType!: Function;

  get isEntry() {
    return this.control && this.control.key === empty_key;
  }

  get label() {
    if (!this.control || !this.control.options) {
      return '';
    }

    let name = this.control.options.name;
    const name_i18n = this.control.options.name_i18n;
    if (name_i18n) {
      // const map = JSON.parse(name_i18n);
      const map = name_i18n;
      const locale = this.$i18n.locale;
      if (map[locale]) {
        name = map[locale];
      }
    }

    return name;
  }

  onDragstart(evt: DragEvent) {
    evt.stopPropagation();
    const transfer = evt.dataTransfer;
    if (!transfer) {
      return;
    }
    transfer.setData('control', this.control.key);
    transfer.setData('control-key-' + this.control.key, '');
    transfer.setData(prefix + this.parentControl.key, '');
  }

  onDragover(evt: DragEvent) {
    evt.stopPropagation();

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

    let checkParent = true;

    if (transfer.types.indexOf('block') > -1) {
      const temp = transfer.types.find((t) => t.indexOf('control-type-') > -1);
      if (temp) {
        checkParent = false;
        const type = Number(temp.substr(temp.lastIndexOf('-') + 1));
        if (this.canNotAddToSheet(type)) {
          return;
        }
      }
    } else {
      if (this.control) {
        const temp = 'control-key-' + this.control.key.toLowerCase();
        if (transfer.types.indexOf(temp) > -1) {
          return;
        }
      }
    }

    if (checkParent) {
      const temp = transfer.types.find((t) => t.indexOf(prefix) > -1);
      if (!temp) {
        return;
      }

      const code = temp.substr(temp.lastIndexOf('-') + 1);
      const parentKey = this.parentControl.key.toLowerCase();
      if (code !== parentKey) {
        return;
      }
    }

    this.$el.classList.add('entry');

    let idx = this.computeIndex(evt);

    if (idx > -1) {
      (this.$parent as any).setHideEmptyTask();

      if (this.control.key !== empty_key) {
        const emptyIndex = (this.$parent as any).findColumnIndex(empty_key);
        if (emptyIndex > -1 && emptyIndex < idx) {
          idx--;
        }
        if (this._moveIndex !== idx) {
          this._moveIndex = idx;
          (this.$parent as any).setShowEmptyTask(idx);
        }
      }
    }

    evt.preventDefault();
  }

  onDragleave() {
    this._moveIndex = undefined;
    this.$el.classList.remove('entry');
  }

  onDrop(evt: DragEvent) {
    evt.stopPropagation();

    this.$el.classList.remove('entry');

    const transfer = evt.dataTransfer;
    if (!transfer) {
      return;
    }

    const isControl = transfer.types.indexOf('control') > -1;

    if (isControl) {
      (this.$parent as any).setHideEmptyTask(true);
      const key = transfer.getData('control');
      if (!key) {
        return;
      }

      const idx = this.computeIndex(evt);
      this.emitColumnMove(idx, key);
    } else {
      const json = transfer.getData('block');
      if (!json) {
        return;
      }

      (this.$parent as any).clearHideEmptyTask();

      const block = JSON.parse(json);
      const blockType = transfer.getData('block-type');

      this.addControl(blockType, block);
    }
  }

  computeIndex(evt: DragEvent): number {
    if (this.index < 0 || this.isEntry) {
      return this.index;
    }

    const offsetLeft = evt.offsetX;
    let ele = evt.srcElement as HTMLElement;

    if (ele) {
      while (ele.tagName !== 'TD') {
        if (!ele.parentElement) {
          break;
        }
        ele = ele.parentElement;
      }
    }

    const newlineThreshold = ele.offsetHeight / 2;

    if (offsetLeft < newlineThreshold) {
      return this.index;
    }

    return this.index + 1;
  }

  addControl(blockType: string, block: any) {
    let control: FormControl;
    if (blockType === 'control') {
      const dataItem = ControlFactory.buildDataItemOf(
        block,
        this.parentControl.key,
      );
      this.emitDataItemAdd(dataItem);

      control = ControlFactory.buildControlOf(dataItem, block.type);
    } else {
      control = ControlFactory.buildControlOf(block);
    }

    (control as FormSheetColumn).width = ControlFactory.getSheetColumnWidth(
      control.type,
    );

    if (
      control.type === FormControlType.RelevanceForm ||
      control.type === FormControlType.RelevanceFormEx
    ) {
      control.options.schemaCode = block.relativeCode || '';
    }

    // if ((this.$parent as any).replaceEmpty(control)) {
    //   this.emitControlSelect(control);
    // }else{
    //   this.emitColumnAdd(this.index, control);
    // }
    (this.$parent as any).hideEmptyCol();
    this.emitColumnAdd(this.index, control);
    this.emitControlSelect(control);
  }

  getControlName() {
    if (this.control.type === FormControlType.Description) {
      return '描述说明';
    }
    if (this.control.type === FormControlType.Tabs) {
      return '标签页';
    }
    return this.control.options.name;
  }

  // onControlDrop(index: number, controlType: FormControlType) {
  //   const _this = this;
  //   const _parent = this.$parent as any;

  //   if (this.openDataItemSelectModal) {
  //     this.openDataItemSelectModal(controlType, this.parentControl.key).then(
  //       (item: DataItem) => {
  //         _parent.setHideEmptyTask(true);
  //         const control = {
  //           type: controlType,
  //           key: item.code,
  //           options: ControlFactory.buildControlOptions(controlType)
  //         };
  //         control.options.name = item.name;
  //         _this.emitColumnAdd(index, control);
  //       },
  //       () => {
  //         _parent.setHideEmptyTask(true);
  //       }
  //     );
  //   }
  // }

  deleteVisible: boolean = false;

  onDelete(evt: KeyboardEvent | MouseEvent) {
    evt.stopPropagation();
    this.deleteVisible = true;
    /*     const _this = this;
    if ((evt as KeyboardEvent).key) {
      _this.emitColumnDelete(_this.control.key);
    } else {
      this.$confirm({
        title: this.$t('languages.Apps.FormDesignPage.DeleteControlTitle', {
          name: this.control.options.name,
        }).toString(),
        okText: this.$t('languages.Apps.Ok').toString(),
        cancelText: this.$t('languages.Apps.Cancel').toString(),
        onOk() {
          _this.emitColumnDelete(_this.control.key);
        },
      });
    } */
  }

  deleteCtrl() {
    this.emitColumnDelete(this.control.key);
    console.log(this.control.key, 'this.control.key=====');

    /* this.$emit('delete', this.control.key); */
    this.deleteVisible = false;
  }

  visibleChange(deleteVisible) {
    this.deleteVisible = deleteVisible;
  }

  onCopy(env) {
    this.coping(this.control);
  }

  coping(control: FormControl) {
    const copy = ControlFactory.copyControlFrom(control);

    const dataItem = ControlFactory.buildDataItemOf(
      {
        type: copy.type,
        code: copy.key,
        name: copy.options.name,
      },
      this.parentControl.key,
    );
    this.emitDataItemAdd(dataItem);
    this.emitColumnAdd(this.index + 1, copy);
    this.emitControlSelect(copy);
  }

  onCtrlC() {
    (this.$parent as any).ctrlCKey = this.control.key;
  }

  onCtrlV() {
    const copyKey = (this.$parent as any).ctrlCKey;
    if (!copyKey) {
      return;
    }

    (this.$parent as any).ctrlCKey = '';

    const col = this.parentControl.columns.find((c) => c.key === copyKey);

    if (!col) {
      return;
    }

    this.coping(col);
  }

  onClick(evt: Event) {
    evt.stopPropagation();
    this.emitControlSelect(this.control);
  }

  emitColumnAdd(index: number, control: FormControl) {
    this.$emit('column-add', {
      index,
      control,
    });
  }

  emitColumnMove(index: number, controlKey: string) {
    this.$emit('column-move', {
      index,
      controlKey,
    });
  }

  emitColumnDelete(controlKey: string) {
    this.$emit('column-delete', controlKey);
  }

  // @Watch('$i18n.locale')
  // onLanguageChange() {

  //   this.globalName = this.fieldName();
  // }

  created() {
    if (this.index === -2) {
      EventBus.$on('addController', this.addControlByClick);
    }
  }

  destroyed() {
    if (this.index === -2) {
      EventBus.$off('addController', this.addControlByClick);
    }
  }

  /**
   * bus事件，点击新增控件时触发
   */
  addControlByClick(param) {
    const selectedControl = this.getSelectedControl();
    if (this.getViewType() === 'web') {
      if (
        this.isSelectCurSheet(selectedControl) ||
        this.isSelectCurSheetColumn(selectedControl)
      ) {
        this.addController(param);
      }
    }
  }

  //判断选中的子表是否为本列位于的子表
  isSelectCurSheet(selectedControl) {
    return (
      selectedControl.type === 201 &&
      selectedControl.key === this.parentControl.key
    );
  }

  //判断选中的控件是同一子表下的某一列
  isSelectCurSheetColumn(selectedControl) {
    return (
      selectedControl.parentKey &&
      selectedControl.parentKey === this.parentControl.key
    );
  }

  addController(options) {
    const block = options.json;
    const blockType = options.blockType;
    if (this.canNotAddToSheet(block.type)) {
      this.$message.error(`子表中禁止添加${block.name}`);
      return;
    }
    this.addControl(blockType, block);
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
div.title {
  background-color: #fafafa;
  height: 38px;
  padding: 8px;
  font-weight: 500;
  color: #111218;
  border-bottom: 1px solid #d9d9d9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

div.control {
  padding: 4px 8px;
  & > .cover {
    position: absolute;
    z-index: 1;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    background: url('../../../../assets/images/cover.png');
  }
  & > textarea,
  & > .address textarea {
    height: 30px;
  }

  & > .ant-btn {
    font-size: 12px;
  }
}
div.empty-item {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 78px;
}

td.col {
  cursor: move;
}

.delete-popover {
  width: 220px;
  padding-top: 10px;
}

.deleteTipDeep {
  /* margin-left: 10px; */
  margin-bottom: 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.8);
  i {
    position: absolute;
    left: 14px;
    color: #faad14;
    font-size: 14px;
  }
  .delete-tip-text {
    margin-left: 22px;
    // margin-left: 25px;
    /* overflow: hidden; //超出隐藏
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical; */
    span {
      white-space: nowrap;
    }
  }
}

.deleteTip {
  margin: 0px 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.deleteButton {
  text-align: right;
  button {
    margin: 3px 8px;
    width: 44px !important;
    min-width: 44px !important;
    height: 24px;
    font-size: 12px;
  }
  /deep/ .ant-btn {
    padding: 0px 0px;
  }
  .delete {
    button {
      margin-left: 0;
    }
  }
}
</style>

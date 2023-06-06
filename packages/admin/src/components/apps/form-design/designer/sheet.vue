<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="sheet">
    <div style="border-left: 1px solid #d9d9d9">
      <table class="sheet-tab">
        <tr>
          <sheet-column
            v-for="(item, index) in columns"
            :key="item.code"
            v-h3-drag
            v-h3-drop
            :index="index"
            :control="item"
            :parentControl="control"
            :class="{ selected: isSelected(item) }"
            @column-add="onColumnAdd"
            @column-move="onColumnMove"
            @column-delete="onColumnDelete"
          />

          <sheet-column
            v-show="columns.length === 0"
            v-h3-drop
            class="empty"
            :index="-2"
            :parentControl="control"
            @column-add="onColumnAdd"
          />

          <sheet-column
            v-show="columns.length > 0"
            v-h3-drop
            class="empty-last top"
            :index="-1"
            :parentControl="control"
            @column-add="onColumnAdd"
          />
        </tr>

        <tr v-show="columns.length > 0" class="foot">
          <template v-for="item in columns">
            <sheet-statistic
              v-if="showStatistic && isNumber(item)"
              :key="item.code + getStatistic(item).options.name"
              :control="getStatistic(item)"
              :class="{ selected: isSelected(getStatistic(item)) }"
            />

            <td v-else :key="item.code"></td>
          </template>
          <td class="empty-last bottom"></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import '@/directives/drag';
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import * as dataitemStore from '../stores/data-items.store-helper';
import {
  FormControl,
  FormControlType,
  FormSheet,
  FormSheetStatistic,
} from '../typings';
import * as ControlFactory from '../typings/control-factory';
import SheetColumn from './sheet-column.vue';
import SheetStatistic from './sheet-statistic.vue';

const empty_key = '.';

@Component({
  name: 'sheet',
  components: {
    SheetColumn,
    SheetStatistic,
  },
})
export default class Sheet extends Vue {
  @Prop()
  readonly control!: FormSheet;

  columns: any[] = [];

  private _showTimeoutRef: any;

  private _hideTimeoutRef: any;

  ctrlCKey = '';

  @Inject()
  emitControlUpdate!: Function;

  @Inject()
  emitDataItemDelete!: (code: string, parentCode?: string) => void;

  @Inject()
  isSelected?: (control: FormControl) => boolean;

  @Watch('control', {
    immediate: true,
  })
  setControl(val: FormSheet) {
    if (val.columns) {
      this.columns = val.columns.filter(
        (v) => v.type !== FormControlType.SystemOther,
      );
    }
  }

  get showStatistic() {
    return this.control && this.control.options.showTotal;
  }

  isNumber(col: FormControl) {
    return col.type === FormControlType.Number;
  }

  getStatistic(col: FormControl) {
    if (!this.isNumber(col)) {
      return;
    }
    if (!this.control.statistics) {
      this.control.statistics = [];
    }
    let stat = this.control.statistics.find((s) => s.columnKey === col.key);
    if (!stat) {
      stat = ControlFactory.buildControl({
        type: FormControlType.SheetStatistic,
        name: '统计',
      }) as FormSheetStatistic;
      if (stat) {
        stat.key = 'stat-' + col.key;
        stat.parentKey = col.parentKey;
        stat.columnKey = col.key;
        stat.options.format = col.options.format; // 统计的格式 需要和它上面数值数据格式一致 迭代25
        this.control.statistics.push(stat);
      }
    }

    if (stat && !stat.path) {
      let path: string[] = [];
      if (this.control.path) {
        path = this.control.path.slice();
        path.push(stat.key);
      } else {
        path = [stat.parentKey, stat.key];
      }
      stat.path = path;
    }

    return stat;
  }

  scrollToSelected() {
    // setTimeout(() => {
    this.$nextTick(() => {
      const div = this.$el.querySelector(':first-child');
      if (div) {
        const selected = div.querySelector('td.selected') as HTMLDivElement;
        if (selected) {
          div.scrollLeft = selected.offsetLeft - selected.offsetWidth;
          selected.focus();
        }
      }
    });
    // }, 300);
  }

  onColumnAdd(add: { index: number; control: FormControl }) {
    add.control.isNewAdd = true;
    if (add.index < 0) {
      this.columns.push(add.control);
    } else {
      this.columns.splice(add.index, 0, add.control);
    }

    this.scrollToSelected();

    if (add.control.key !== empty_key) {
      add.control.parentKey = this.control.key;

      if (this.control.path) {
        const path = this.control.path.slice();
        path.push(add.control.key);
        add.control.path = path;
      }

      dataitemStore.switchUsed(this, this.control.key, add.control.key);
      this.emitUpdate();
    }

    this.syncHeight();
  }

  onColumnMove(move: { index: number; controlKey: string }) {
    let index = this.columns.findIndex((c) => c.key === move.controlKey);
    if (index === move.index) {
      return;
    }
    const control = this.columns[index];
    this.columns.splice(move.index, 0, control);
    if (move.index <= index) {
      index++;
    }
    this.columns.splice(index, 1);
    this.emitUpdate();
  }

  onColumnDelete(controlKey: string) {
    const index = this.columns.findIndex((c) => c.key === controlKey);
    if (index === -1) {
      return;
    }
    this.columns.splice(index, 1);
    if (controlKey !== empty_key) {
      dataitemStore.switchUsed(this, this.control.key, controlKey);
      this.emitDataItemDelete(controlKey, this.control.key);
      this.emitUpdate();
    }

    this.syncHeight();
  }

  syncHeight() {
    const $tab = this.$el.querySelector('.sheet-tab') as HTMLDivElement;
    if ($tab && $tab.parentNode) {
      const $empty = this.$el.querySelector('.sheet-empty') as HTMLDivElement;
      if ($empty) {
        const h =
          ($tab.parentNode as HTMLDivElement).offsetHeight - $tab.offsetHeight;
        $empty.style.height = h === 0 ? '100%' : `calc(100% - ${h}px)`;
      }
    }
  }

  emitUpdate() {
    if (this.emitControlUpdate) {
      if (!this.control.path) {
        this.emitControlUpdate(this.control.key, {
          columns: this.columns,
        });
      } else {
        this.emitControlUpdate(
          this.control.key,
          {
            columns: this.columns,
          },
          '',
          this.control.path,
        );
      }
    }
  }

  findColumnIndex(key: string) {
    return this.columns.findIndex((c) => c.key === key);
  }

  hideEmptyCol() {
    this.columns
      .map((x, i) => (x.key === empty_key ? i : -1))
      .filter((i) => i !== -1)
      .reverse()
      .forEach((i) => this.columns.splice(i, 1));
  }

  showEmptyCol(index: number) {
    const empty = {
      key: empty_key,
    };
    const idx = this.columns.findIndex((c) => c.key === empty_key);
    if (idx < 0) {
      this.columns.splice(index, 0, empty);
    } else {
      this.hideEmptyCol();
      this.columns.splice(index, 0, empty);
    }
  }

  setHideEmptyTask(now = false) {
    clearTimeout(this._hideTimeoutRef);
    if (now) {
      this.hideEmptyCol();
    } else {
      this._hideTimeoutRef = setTimeout(() => this.hideEmptyCol(), 300);
    }
  }

  clearHideEmptyTask() {
    clearTimeout(this._hideTimeoutRef);
  }

  setShowEmptyTask(index: number) {
    clearTimeout(this._showTimeoutRef);
    this._showTimeoutRef = setTimeout(() => {
      this.showEmptyCol(index);
      this.setHideEmptyTask();
    }, 300);
  }

  replaceEmpty(control: FormControl) {
    const index = this.findColumnIndex(empty_key);

    if (index === -1) {
      return false;
    }

    this.columns.splice(index, 1, control);

    return true;
  }

  mounted() {
    this.syncHeight();
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
div.sheet {
  display: flex;
  cursor: default;
  height: 100%;
  overflow: auto;
  margin-right: 1px;
  & > div {
    overflow: auto;
  }
}

.sheet-tab {
  border-collapse: unset;
  border-spacing: 0;
  height: 100%;

  td {
    border-right-width: 0;
    border-bottom-width: 0;
    &.empty-last {
      border-right: thin solid #d9d9d9;
      border-right-width: unset;
      position: sticky !important;
      z-index: 2;
      right: 0;
      min-width: 98px;
      width: 98px;
      &.top {
        border-top-right-radius: 4px;
      }
      &.bottom {
        border-bottom-right-radius: 4px;
      }
    }

    &.empty {
      border-width: 1px;
      border-radius: 4px;
    }
  }

  tr {
    &:first-child td:first-child {
      border-top-left-radius: 4px;
    }

    &:last-child td {
      border-bottom-width: 1px;
      &:first-child {
        border-bottom-left-radius: 4px;
      }
    }
  }
}

.sheet-empty {
  // width: 178px;
  border-collapse: unset;
  border-spacing: 0;
  height: 100%;

  & td {
    width: 100px;
    min-width: 100px;
    max-width: 100px;
    border-right-width: 1;
  }

  tr {
    &:first-child td {
      border-top-right-radius: 4px;
      border-bottom: none;
      // height: 79px;
    }

    &:last-child td {
      border-bottom-right-radius: 4px;
      height: 38px;
    }
  }
}

td {
  position: relative;
  // min-height: 78px;
  // max-height: 78px;
  vertical-align: top;
  width: 175px;
  max-width: 175px;
  min-width: 175px;
  padding: 0;
  border: 1px solid #d9d9d9;
  background-color: #fff;

  &.empty {
    vertical-align: middle;
    text-align: center;
    color: rgba(17, 18, 24, 0.25);
  }
  // &.empty div {
  //   min-height: 78px;
  // }

  &.entry {
    border: 1px dashed @primary-color !important;
  }

  &.dragging {
    opacity: 0;
  }

  // &:focus,
  &.selected {
    // outline: 1px dashed @primary-color;
    background-color: @sub-bg-color;
  }
}

.foot td {
  height: 38px;
  text-align: center;
  vertical-align: middle;
  color: rgba(17, 18, 24, 0.5);
}
</style>

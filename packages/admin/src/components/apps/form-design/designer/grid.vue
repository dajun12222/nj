<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <template v-for="(keys, index) in layout">
      <control-container
        :key="index"
        v-h3-drop
        :index="index"
        :controlKeys="keys"
        :controls="controls"
        :clearParentShowEmptyTask="clearParentShowEmptyTask"
        :ignoreTypes="ignoreTypes"
        :autoSpanValues="autoSpanValues"
        :formFramework="formFramework"
        @control-add="onControlAdd"
        @control-move="onControlMove"
        @control-delete="onControlDelete"
        @movingControl="movingControl"
      />
    </template>
    <control-container
      v-h3-drop
      :index="-2"
      :clearParentShowEmptyTask="clearParentShowEmptyTask"
      :ignoreTypes="ignoreTypes"
      :autoSpanValues="autoSpanValues"
      :formFramework="formFramework"
      @control-add="onControlAdd"
    />
  </div>
</template>

<script lang="ts">
import {
  Component,
  Inject,
  Prop,
  Provide,
  Vue,
  Watch,
} from 'vue-property-decorator';
import { FormControl, FormControlType } from '../typings';
import * as ControlFactory from '../typings/control-factory';
import ControlContainer from './control-container.vue';
import { Layouter } from './layouter';
import { Col } from '@h3/antd-vue';
const empty_Key = '.';

@Component({
  name: 'grid',
  components: {
    ControlContainer,
    ACol: Col,
  },
})
export default class Grid extends Vue implements Layouter {
  @Prop()
  readonly controls!: { [key: string]: FormControl };

  @Prop()
  readonly layout!: string[][];

  @Prop()
  autoSpanValues!: any;

  @Prop()
  clearParentShowEmptyTask?: () => void;

  @Prop()
  readonly path?: string[];

  @Prop()
  readonly ignoreTypes?: FormControlType[];

  @Prop()
  formFramework!: number;

  selected: any = '';

  ctrlCKey = '';

  @Provide()
  setCtrlCKey(key: string) {
    this.ctrlCKey = key;
  }

  @Provide()
  getCtrlCKey() {
    return this.ctrlCKey;
  }

  @Inject()
  removeControlFromParent!: (
    key: string,
    path?: string[],
  ) => FormControl | null;

  @Inject()
  getMovingControl!: Function;

  colsLimit = 4;

  private _showTimeoutRef: any;

  private _hideTimeoutRef: any;

  private layoutSnapshot: any[] | null = null;

  getLayout() {
    return this.layout;
  }

  onControlAdd(add: {
    row: number;
    col: number;
    newline: boolean;
    control: FormControl;
    copyKey?: string;
  }) {
    //console.log('onControlAdd ' + JSON.stringify(add));
    //必须在rearrange之前
    this.emitControlAdd(add.control, add.copyKey);
    this.rearrange(add.row, add.col, add.newline, add.control.key);

    this.emitChange(this.layout);
  }

  onControlMove(move: {
    row: number;
    col: number;
    newline: boolean;
    controlKey: string;
    controlPath?: string[];
  }) {
    if (
      this.getMovingControl() &&
      this.path &&
      this.path.includes(this.getMovingControl().key)
    ) {
      return;
    }

    const path = move.controlPath;

    let inLevel = !this.path && !path;

    if (!inLevel && path && this.path) {
      if (path.length - this.path.length === 1) {
        let samo = true;
        for (let i = 0; i < this.path.length; i++) {
          if (path[i] !== this.path[i]) {
            samo = false;
            break;
          }
        }
        inLevel = samo;
      }
    }

    if (inLevel) {
      const [row, col] = this.findIndex(move.controlKey);
      if (
        (row === -1 && col === -1) ||
        (row === move.row && col === move.col)
      ) {
        return;
      }

      const cols = this.layout[row] as string[];
      cols.splice(col, 1);
      if (
        this.controls[move.controlKey] &&
        this.controls[move.controlKey].options &&
        (this.formFramework === 5 || !this.formFramework)
      ) {
        this.controls[move.controlKey].options.span = undefined;
      }
      this.rearrange(move.row, move.col, move.newline, move.controlKey);

      this.emitChange(this.layout);
    } else {
      const control = this.removeControlFromParent(move.controlKey, path);
      if (!control) {
        return;
      }
      const addData = move as any;
      addData.control = control;
      this.onControlAdd(addData);
    }
  }

  rearrange(row: number, col: number, newline: boolean, controlKey: string) {
    // console.log(`rearrange ${row},${col},${newline}`);
    const layout = this.layout;
    if (row === -2 && layout) {
      if (layout.length > 0 && layout[layout.length - 1].length === 0) {
        layout.splice(layout.length - 1, 1, [controlKey]);
      } else {
        if (
          [
            layout.length > 0,
            this.formFramework && this.formFramework !== 5,
          ].every((el) => el === true) &&
          this.calcRowWidth(layout[layout.length - 1], {}) <=
            24 - 24 / this.formFramework &&
          !this.getMovingControl()
        ) {
          layout[layout.length - 1].push(controlKey);
        } else {
          layout.push([controlKey]);
        }
      }
      return;
    }

    if (row === -1) {
      layout.splice(0, 0, [controlKey]);
    } else {
      if (newline) {
        layout.splice(row, 0, [controlKey]);
      } else {
        const cols = layout[row] as string[];
        if (
          !cols ||
          (cols.length === 1 &&
            ControlFactory.isFullRow(this.controls[cols[0]].type))
        ) {
          layout.splice(row, 0, [controlKey]);
        } else {
          if (cols.length < this.colsLimit) {
            cols.splice(col, 0, controlKey);
          } else {
            const limit = this.colsLimit - 1;
            const nextline = cols.splice(limit, 1);
            cols.splice(col, 0, controlKey);
            layout.splice(row + 1, 0, nextline);
          }
        }
      }
    }

    layout
      .map((x, i) => (x.length === 0 ? i : -1))
      .filter((i) => i !== -1)
      .reverse()
      .forEach((i) => layout.splice(i, 1));
  }

  onControlDelete(controlKey: string) {
    const [row, col] = this.findIndex(controlKey);
    //console.log('onControlDelete ' + row + ',' + col);
    if (row === -1 && col === -1) {
      return;
    }

    const cols = this.layout[row] as string[];
    cols.splice(col, 1);

    if (cols.length === 0) {
      this.layout.splice(row, 1);
    }

    this.emitControlDelete(controlKey);

    this.emitChange(this.layout);
  }

  /**
   * 快照
   */
  snapshot() {
    this.layoutSnapshot = JSON.parse(JSON.stringify(this.layout));
  }

  showEmptyCol(rowIndex: number, colIndex: number, newline: boolean) {
    const key = empty_Key;
    if (!this.controls[key]) {
      this.snapshot();
      this.onControlAdd({
        row: rowIndex,
        col: colIndex,
        newline: newline,
        control: {
          key: key,
        } as any,
      });
    } else {
      this.onControlMove({
        row: rowIndex,
        col: colIndex,
        newline: newline,
        controlKey: key,
        controlPath: this.controls[key].path,
      });
    }
  }

  hideEmptyCol() {
    clearTimeout(this._showTimeoutRef);
    if (this.layoutSnapshot) {
      // this.layout = this.layoutSnapshot;
      //delete this.controls[empty_Key];
      //this.emitLayoutChange(this.layoutSnapshot);
      this.emitControlDelete(empty_Key);
      this.layout.splice(0, this.layout.length, ...this.layoutSnapshot);
      this.layoutSnapshot = null;
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

  clearShowEmptyTask() {
    // console.log('clearShowEmptyTask');
    clearTimeout(this._showTimeoutRef);
  }

  setShowEmptyTask(
    rowIndex: number,
    colIndex: number,
    full = false,
    isClickAdd = false,
  ) {
    if (isClickAdd) {
      this.showEmptyCol(rowIndex, colIndex, full);
      this.setHideEmptyTask();
      return;
    }
    if (
      this.getMovingControl() &&
      this.path &&
      this.path.includes(this.getMovingControl().key)
    ) {
      return;
    }
    clearTimeout(this._showTimeoutRef);
    this._showTimeoutRef = setTimeout(
      // () => this.showEmptyCol(rowIndex, colIndex, full),
      () => {
        if (this.formFramework === 5 || !this.formFramework) {
          this.clearSpans(this.layout[rowIndex]);
        }
        this.showEmptyCol(rowIndex, colIndex, full);
        this.setHideEmptyTask();
      },
      300,
    );
  }

  replaceEmpty(control: FormControl) {
    const key = empty_Key;
    const [rowIndex, colIndex] = this.findIndex(key);

    if (rowIndex === -1 && colIndex === -1) {
      return false;
    }

    const row = this.layout[rowIndex];
    this.emitControlAdd(control);
    this.emitControlDelete(key);

    row.splice(colIndex, 1, control.key);

    this.emitChange(this.layout);

    this.layoutSnapshot = null;

    // this.layout.splice(rowIndex, 1, row);
    // this.snapshot();

    return true;
  }

  findIndex(controlKey: string): [number, number] {
    return ControlFactory.findIndexFromGrid(this.layout, controlKey);
  }

  replace(rowIndex: number, colIndex: number, key: string) {
    const row = this.layout[rowIndex];
    row.splice(colIndex, 1, key);
    this.layout.splice(rowIndex, 1, row);

    this.emitChange(this.layout);
  }

  emitControlAdd(control: FormControl, copyKey?: string) {
    if (
      control.options &&
      control.options.span &&
      (this.formFramework === 5 || !this.formFramework)
    ) {
      control.options.span = undefined;
    }
    this.$emit('control-add', control, copyKey);
  }

  emitControlDelete(controlKey: string) {
    this.$emit('control-delete', controlKey);
  }

  emitChange(layout: string[][]) {
    this.$emit('change', layout);
  }

  beforeDestroy() {
    this.setHideEmptyTask(true);
  }

  spanChange(key, span) {
    const target = {};
    target[key] = span;
    this.layout.some((row, rowIndex) => {
      if (row.includes(key) && this.calcRowWidth(row, target) > 24) {
        this.spanTooLarge(rowIndex, target);
      }
      return row.includes(key);
    });
  }

  calcRowWidth(row, target) {
    return row.reduce((key1, key2) => {
      return (
        this.findColumnWidth(key1, target) + this.findColumnWidth(key2, target)
      );
    }, 0);
  }

  findColumnWidth(key, target) {
    if (typeof key === 'number') {
      return key;
    }
    if (key === '.') {
      return 0;
    }
    const firstChoice = target[key];
    const secondChoice =
      this.controls[key] &&
      this.controls[key].options &&
      this.controls[key].options.span;
    const thirdChoice = 6;

    return firstChoice || secondChoice || thirdChoice;
  }

  spanTooLarge(rowIndex, target) {
    const layout = this.layout;
    const splitInex = this.findSplitIndex(layout[rowIndex], target);
    const tail = layout[rowIndex].splice(splitInex);
    layout.splice(rowIndex + 1, 0, tail);
    this.emitChange(layout);
  }

  findSplitIndex(row, target) {
    let sum = 0;
    let result = -1;

    row.some((key, index) => {
      sum += this.findColumnWidth(key, target);
      if (sum > 24) {
        result = index;
      }
      return sum > 24;
    });
    return result;
  }

  clearSpans(row) {
    if (!row || row.length === 0) {
      return;
    }
    row.forEach((key) => {
      if (
        this.controls[key].options &&
        this.controls[key].options.span &&
        !ControlFactory.isFullRow(this.controls[key].type)
      ) {
        this.autoSpanValues[key] = this.controls[key].options.span;
        this.controls[key].options.span = undefined;
      }
    });
  }

  movingControl(key) {
    this.layout.forEach((row) => {
      if (row.includes(key)) {
        row.forEach((col) => {
          if (this.controls[col].options.span && this.formFramework === 5) {
            this.autoSpanValues[col] = this.controls[col].options.span;
            this.controls[col].options.span = undefined;
          }
        });
      }
    });
  }
}
</script>

<style lang="less" scoped>
/deep/.ant-radio-wrapper {
  white-space: pre-wrap;
}
</style>

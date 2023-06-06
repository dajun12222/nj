import { Component, Vue, Prop, Watch, Inject } from 'vue-property-decorator';

import { BaseGrid } from '../../../../common/controls/base-grid-sheet';

import cloneDeep from 'lodash/cloneDeep';

export default class DataMonitor extends BaseGrid {
  @Prop() gridColumns!: any[];

  @Prop() gridRows!: any[];

  @Prop() check!: any;

  @Prop() checkAll!: any;

  @Prop() edit!: boolean;

  get handleGridRows() {
    let arr: any = [];
    const gridRows = cloneDeep(this.gridRows);
    arr = gridRows.map((item) => {
      for (const key in item) {
        //下拉多选没有选项时候特殊处理
        if (item[key].type === 19 && item[key].controller._value === null) {
          item[key].controller._value = undefined;
        }
      }
      return item;
    });
    return gridRows;
  }

  get handleGridColumns() {
    let arr: any[] = [];
    const gridColumns = cloneDeep(this.gridColumns);

    arr = gridColumns.filter((item) => {
      return item.id !== 'rowStatus';
    });
    arr = arr.map((item: any) => {
      if (
        [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 19, 50, 51, 60, 61, 62, 80, 81,
        ].indexOf(item.type) > -1
      ) {
        item.formatter = 'baseComponent';
      }
      return item;
    });
    return arr;
  }
}

import common from '../../../../../../common/pc';
import zhToEn from '../../../../../../list/src/components/pc/locales/zhToEn';
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Icon,
  Menu,
  Popover,
  Tooltip,
} from '@h3/antd-vue';
import { FormControlErrorCodes } from 'cloudpivot-forms';
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import AuthorAvatarInfo from '../../../../../../common/src/components/pc/author-avatar-info/author-avatar-info.vue';
import FormSheetModal from '../../../../../../list/src/components/pc/components/form-sheet-modal/form-sheet-modal.vue';
import PCImagePreview from '../../../../common/components/pc-image-preview.vue';
import {
  AggregateType,
  DataItemType,
  FormControlType,
  FormSheetColumn,
  FormSheetStatistic,
  SheetStatisticOptions,
} from '../../../../schema';
import { FormRendererHelper } from '../../form-renderer-helper';
import numberFilter from '../../number-filter';
import BaseControlAdapter from '../base-control-adapter.vue';
import CheckboxText from './checkbox-text.vue';

export interface ColumnResize {
  index: number;

  column: FormSheetColumn;

  width: number;
}

@Component({
  name: 'sheet',
  components: {
    AIcon: Icon,
    APopover: Popover,
    ADivider: Divider,
    AButton: Button,
    ACheckbox: Checkbox,
    ADropdown: Dropdown,
    ATooltip: Tooltip,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    BaseControlAdapter,
    H3SizeSlider: common.components.H3SizeSlider,
    CheckboxText,
    ImgPreview: PCImagePreview,
    AuthorAvatarInfo,
    FormSheetModal,
  },
  filters: {
    number: numberFilter,
  },
})
export default class Sheet extends Vue {
  @Prop({
    default: 0,
  })
  rowNumber!: number;

  @Prop({
    default: false,
  })
  checkbox!: boolean;

  @Prop({
    default: false,
  })
  radio!: boolean;

  @Prop({
    default: false,
  })
  showAction!: boolean;

  @Prop({
    default: false,
  })
  showTotal!: boolean;

  @Prop({
    default: () => [],
  })
  columns!: FormSheetColumn[];

  @Prop({
    default: () => [],
  })
  columnOptions!: any[];

  @Prop({
    default: () => [],
  })
  frozenKeys!: string[];

  @Prop({
    default: () => ({}),
  })
  columnSlots!: { [key: string]: string };

  @Prop({
    default: () => [],
  })
  rows!: any[];

  @Prop({
    default: () => ({}),
  })
  rowSlots!: { [key: string]: string };

  @Prop({
    default: () => [],
  })
  checkeds!: boolean[];

  @Prop({
    default: -1,
  })
  checked!: number;

  @Prop({
    default: () => ({}),
  })
  stats!: { [key: string]: FormSheetStatistic };

  @Prop({
    default: {},
  })
  subQueryformConditions!: any;

  @Inject()
  getScrollEl!: () => HTMLDivElement;

  @Inject({
    default: () => () => {},
  })
  isMultiStatus!: () => boolean;

  onScrollFn?: () => void;

  shadowLeft = false;

  shadowRight = false;

  scrollbar: HTMLDivElement | null = null;

  colStyles: any[] = [];

  sheetIsScroll = false; // 表格是否滚动

  pageSize: number = 20; // 子表一页展示数据条数，默认为20

  DataItemType: any = DataItemType;

  isPreviewImage: boolean = false;

  bs64Img: string = '';

  get canFrozen() {
    return this.unFreezeColumns.length > 1;
  }

  get canUnFrozen() {
    return this.frozenKeys.length > 0;
  }

  get checkedAll() {
    return this.checkeds.length > 0 && this.checkeds.every((c) => c);
  }

  get indeterminate() {
    const checkeds = this.checkeds.filter((c) => c);
    return checkeds.length > 0 && checkeds.length < this.checkeds.length;
  }

  get hasStat() {
    return Object.keys(this.stats).length > 0;
  }

  get freezeColumns() {
    return this.frozenKeys.map((k) =>
      this.columns.find((col) => col.key === k),
    );
  }

  getRelevanceFormShowValue(col: any) {
    if (col.controller && col.controller.value) {
      if (col.controller.value.items) {
        const displayCode = col.controller.value.displayCode;
        if (Array.isArray(col.controller.value.items)) {
          return col.controller.value.items
            .map((el) => {
              return el[displayCode];
            })
            .join(';');
        }
      } else if (col.controller.value[col.controller.value.displayCode]) {
        const displayValue =
          col.controller.value[col.controller.value.displayCode];
        if (Array.isArray(displayValue)) {
          return displayValue.map((el) => el.name).join(';');
        } else {
          return displayValue;
        }
      } else {
        return '--';
      }
    } else {
      return '--';
    }
  }

  get unFreezeColumns() {
    return this.columns.filter(
      (col) => this.frozenKeys.indexOf(col.key) === -1,
    );
  }

  freezeColumn(key: string, freeze: boolean) {
    if (freeze) {
      if (this.frozenKeys.length >= 3) {
        this.$message.error(
          this.$t('cloudpivot.form.renderer.tip.frozenColumnMax') as string,
        );
        return;
      }

      let width = 0;
      this.columns
        .map((col, i) =>
          this.frozenKeys.indexOf(col.key) > -1 || col.key === key
            ? this.colStyles[i].width
            : 0,
        )
        .forEach((w) => (width += parseInt(w)));

      if (width > 854) {
        this.$message.error(
          this.$t(
            'cloudpivot.form.renderer.tip.frozenColumnWidthMax',
          ) as string,
        );
        return;
      }
    }

    this.$emit('freezeColumn', key, freeze);

    if (!freeze) {
      setTimeout(() => {
        this.syncScrollLeft();
      }, 100);
    }
  }

  judegFileType(item: any) {
    if (!item.mimeType) {
      return false;
    }
    // if(item.mimeType.includes('WAVE')||)
    // let type = item.
    if (
      item.mimeType.includes('WAVE') ||
      item.mimeType.includes('WMA') ||
      item.mimeType.includes('cda') ||
      item.mimeType.includes('AIFF') ||
      item.mimeType.includes('MIDI') ||
      item.mimeType.includes('VQF') ||
      item.mimeType.includes('MP3')
    ) {
      return 'audio';
    } else if (
      item.mimeType.includes('MPEG') ||
      item.mimeType.includes('AVI') ||
      item.mimeType.includes('ASF') ||
      item.mimeType.includes('MOV') ||
      item.mimeType.includes('WMV') ||
      item.mimeType.includes('3GP') ||
      item.mimeType.includes('RM') ||
      item.mimeType.includes('RMVB') ||
      item.mimeType.includes('FLV/F4V') ||
      item.mimeType.includes('mp4')
    ) {
      return 'video';
    } else if (
      item.mimeType.includes('xls') ||
      item.mimeType.includes('xlsx')
    ) {
      return 'excel';
    } else if (item.mimeType.includes('doc')) {
      return 'word';
    } else if (item.mimeType.includes('ppt')) {
      return 'ppt';
    } else if (item.mimeType.includes('pdf')) {
      return 'pdf';
    } else if (item.mimeType.includes('zip') || item.mimeType.includes('rar')) {
      return 'zip';
    } else if (item.mimeType.includes('xml')) {
      return 'xml';
    } else if (item.mimeType.includes('rp')) {
      return 'rp';
    } else if (
      item.mimeType.includes('xmind') ||
      item.mimeType.includes('xmt')
    ) {
      return 'xmind';
    } else {
      return false;
    }
  }

  sheetList: any = null;

  sheetQueryCondeiton: any[] = [];

  visible: boolean = false;

  goSheetDetail(list: any) {
    this.sheetList = {
      additionalClasses: [
        'table-row-item',
        'table-row-item-Sheet1642487382879',
        'table-row-item-type-8',
        'child-sheet-row-item',
      ],
      collapsible: list.collapsible,
      last: true,
      page: 1,
      properties: list.options,
      sourceValue: list.controller && list.controller._value,
      style: {},
      value:
        list.controller &&
        list.controller._value &&
        list.controller._value.length < 20
          ? list.controller._value
          : list.controller._value.slice(0, 20),
    };
    this.sheetList.properties.id = list.key;
    this.sheetList.properties.dataIndex = list.key;
    this.sheetList.properties.key = list.key;
    this.sheetQueryCondeiton =
      this.subQueryformConditions &&
      this.subQueryformConditions[list && list.key];
    this.visible = true;
  }

  previewImg(url: string) {
    if (!url) {
      return;
    }
    this.bs64Img = url;
    this.isPreviewImage = true;
  }

  getFreezeCells(row: any[]) {
    return this.frozenKeys.map((k) => row.find((cell) => cell.key === k));
  }

  isLastFreeze(key: string) {
    return this.frozenKeys[this.frozenKeys.length - 1] === key;
  }

  isLastUnFreeze(key: string) {
    return true;
    // const cols = this.unFreezeColumns;
    // let visibles = cols.filter((el) => el.options.visible);
    // return (
    //   cols[cols.length - 1].key === key ||
    //   visibles[visibles.length - 1].key === key
    // );
  }

  showColumn(key: string) {
    const index = this.columns.findIndex((c) => c.key === key);

    if (index < 0) {
      return false;
    }

    const col = this.columns[index];
    if (!col || !col.options || !col.options.visible) {
      return false;
    }

    if (this.rows.length === 0) {
      return true;
    }

    const allHide = this.rows.every(
      (row) => row[index].controller && !row[index].controller.display,
    );
    return !allHide;
  }

  pageChange(obj: any) {}

  @Watch('columns', {
    immediate: true,
  })
  onColumnsChange() {
    this.initColStyleMap();
    this.$nextTick(() => {
      setTimeout(() => {
        const el = this.$el.querySelector(
          '.sheet__row:last-child > .sheet__cols',
        ) as HTMLDivElement;
        if (el) {
          this.sheetIsScroll = el.offsetWidth < el.scrollWidth;
        }
      }, 1000);
    });
  }

  newDateTemp: Date = new Date();

  @Watch('rows', {
    immediate: true,
  })
  onRowsChange() {
    this.newDateTemp = new Date();
    this.$nextTick(() => {
      this.syncScrollLeft();
    });
  }

  checkAll(evt: any) {
    const checked = evt.target.checked;
    const checkeds = this.checkeds.map((c) => checked);
    this.$emit('check', checkeds);
    this.$emit('checkAll', checked);
  }

  check(idx: number) {
    const checked = this.checkeds[idx];
    let checkeds = this.checkeds.slice();
    if (this.radio) {
      checkeds = checkeds.map(() => false);
    }
    checkeds[idx] = !checked;
    if (this.isMultiStatus && this.isMultiStatus()) {
      const arr: any = this.rows[idx];
      arr.forEach((a: any) => {
        if (
          a.options.propertyType === DataItemType.Sheet &&
          Array.isArray(a.controller._value)
        ) {
          a.controller._value = a.controller._value.map((i: any) => {
            i.checked = checkeds[idx];
            return i;
          });
        }
      });
    }
    this.$emit('check', checkeds, idx);
  }

  handleOnClickRows(rowIdx: any) {
    if (this.isMultiStatus && this.isMultiStatus()) {
      this.check(rowIdx);
    } else {
      this.$emit('rowClick', rowIdx);
    }
  }

  async childCheckAll(val: any, colIdx: number) {
    const checkeds = this.checkeds;
    this.rows.forEach((o, e) => {
      o.forEach((i: any, v: number) => {
        if (
          v === colIdx &&
          i.options.propertyType === DataItemType.Sheet &&
          Array.isArray(i.controller._value) &&
          i.controller._value.length
        ) {
          i.controller._value = i.controller._value.map((i: any) => {
            i.checked = val.target.checked;
            return i;
          });
          checkeds[e] = val.target.checked;
        }
      });
    });

    this.$set(this.columns[colIdx], 'checked', val.target.checked);
    this.$emit('checkAll', checkeds);
  }

  getAllChildChecked(code: string) {
    //改变全选的状态
    let checkArr: Array<any> = [];
    this.rows.forEach((t: any) => {
      t.forEach((a: any) => {
        if (
          a.key === code &&
          Array.isArray(a.controller._value) &&
          a.controller._value.length
        ) {
          checkArr = checkArr.concat(a.controller._value);
        }
      });
    });
    return checkArr.length ? checkArr.every((c: any) => c.checked) : false;
  }

  checkboxChange(val: any, index: number, colIdx: number, idx: number) {
    this.$set(
      this.rows[index][colIdx].controller._value[idx],
      'checked',
      val.target.checked,
    );
    if (this.rows[index][colIdx].controller._value.length > 0) {
      const arr: any = this.rows[index][colIdx].controller._value.filter(
        (o: any) => o.checked,
      );
      if (arr.length > 0 && !this.checkeds[index]) {
        const checked = this.checkeds[index];
        let checkeds = this.checkeds.slice();
        if (this.radio) {
          checkeds = checkeds.map(() => false);
        }
        checkeds[index] = !checked;
        this.$emit('check', checkeds, index);
      } else {
        this.$emit('check', this.checkeds, index);
      }
    }
  }

  onScroll(evt: UIEvent) {
    this.syncScroll(evt.target as any);
  }

  syncScrollLeft() {
    if (!this.scrollbar) {
      this.scrollbar = this.$el.querySelector('.scrollbar');
      if (!this.scrollbar) {
        return;
      }
    }

    const el = this.scrollbar.querySelector('.sheet__cols') as HTMLDivElement;
    if (!el) {
      return;
    }
    this.syncScroll(el);
  }

  syncScroll(el: HTMLDivElement) {
    this.shadowLeft = el.scrollLeft > 0;
    this.shadowRight = el.scrollLeft + el.offsetWidth < el.scrollWidth;
    if (NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (let i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
    }

    const $sheetBody = this.$el.querySelector('.sheet__body');

    if (!$sheetBody) {
      return;
    }
    const _el = this.$el.querySelectorAll(
      '.sheet__cols',
    ) as NodeListOf<HTMLDivElement>;
    for (const dv of _el) {
      if (dv !== el) {
        // dv.scrollLeft = el.scrollLeft - (el.scrollWidth - dv.scrollWidth);
        dv.scrollLeft = el.scrollLeft;
      }
    }
  }

  getErrorMessage(col: any, errCode: FormControlErrorCodes) {
    return FormRendererHelper.getErrorMessage(col, errCode, this.$i18n.locale);
  }

  getControlClass(type: number) {
    return (FormControlType as any)[type].toLowerCase();
  }

  getColSheetStyle(index: any, child: any) {
    return {
      minWidth: child.width + 'px',
      // this.isMultiStatus && this.isMultiStatus() && index === 0
      //   ? Number(child.width) - 20 + "px"
      //   : child.width + "px",
    };
  }

  initColStyleMap() {
    this.colStyles = this.columns.map((col, colIdx) => {
      // const last = colIdx === this.columns.length - 1;

      // if (last && this.columns.length > 0) {
      //   const widths = this.columns.map(x => x.width || 0);

      //   if (widths.length > 0) {
      //     const totalWidth = widths.reduce((x, y) => x + y);
      //     if (totalWidth < 885) {
      //       return {};
      //     }
      //   }
      // }
      let width = '';
      if (
        col &&
        col.options &&
        col.options.propertyType === DataItemType.Sheet
      ) {
        let subWidth = 0;
        const subStyles =
          col.options.childColumns &&
          col.options.childColumns.map((child: any, childIdx: number) => {
            subWidth += Number(child.width);
            width = child.width + 'px';
            return { width };
          });
        return {
          style: { width: subWidth + 'px' },
          subStyles,
        };
      } else {
        width = col.width + 'px';
      }

      return {
        width,
      };
    });
  }

  // 子表数据项加载更多
  loadMore(col: any) {
    col.page += 1;
    col.value = col.sourceValue.slice(0, col.page * this.pageSize);
    col.last = col.value.length >= col.sourceValue.length;
  }

  onColResize(
    evt: { width: number },
    colIdx: number,
    col: FormSheetColumn,
    subKey?: string,
  ) {
    const width = evt.width + 'px';
    if (col && col.options && col.options.propertyType !== DataItemType.Sheet) {
      colIdx = this.columns.findIndex((c) => c.key === col.key);

      this.colStyles.splice(colIdx, 1, {
        width,
      });
    } else if (
      col &&
      col.options &&
      col.options.propertyType === DataItemType.Sheet &&
      subKey
    ) {
      colIdx = this.columns.findIndex((c) => c.key === col.key);
      const column = this.columns[colIdx];
      const subIndex =
        column.options.childColumns &&
        column.options.childColumns.findIndex(
          (c: any) => c.propertyCode === subKey,
        );
      const colStyle = this.colStyles[colIdx];
      colStyle.subStyles &&
        colStyle.subStyles.splice(subIndex, 1, {
          width,
        });
      let subWidth = 0;
      colStyle.subStyles &&
        colStyle.subStyles.forEach((item: any) => {
          const w = Number(item.width.slice(0, -2));
          subWidth += w;
        });
      colStyle.style.width = subWidth + 'px';
      this.colStyles.splice(colIdx, 1, colStyle);
    } else {
      //Else Empty block statement
    }

    this.$emit('columnResize', {
      index: colIdx,
      column: col,
      width: evt.width,
    });

    // this.$forceUpdate();
  }

  updated() {
    const scroll = this.$el.querySelector('#sheet-scroll') as HTMLDivElement;
    this.syncScroll(scroll);
  }

  getColStyle(key: string, subKey?: string) {
    const index = this.columns.findIndex((c) => c.key === key);

    if (index < 0) {
      return {};
    }

    const column = this.columns[index];
    if (
      column &&
      column.options &&
      column.options.propertyType !== DataItemType.Sheet
    ) {
      return this.colStyles[index];
    } else if (
      column &&
      column.options &&
      column.options.propertyType === DataItemType.Sheet
    ) {
      if (!subKey) {
        return this.colStyles[index].style;
      } else {
        const subIndex =
          column.options.childColumns &&
          column.options.childColumns.findIndex(
            (c: any) => c.propertyCode === subKey,
          );
        if (subIndex < 0) {
          return {};
        } else {
          return (
            this.colStyles[index].subStyles &&
            this.colStyles[index].subStyles[subIndex]
          );
        }
      }
    } else {
      //Else Empty block statement
    }
  }

  getColumnStyle(col: FormSheetColumn) {
    return col.options && col.options.style;
  }

  showStat(columnKey: string) {
    const s = this.stats[columnKey];
    if (!s) {
      return false;
    }
    const val = (s as any).value;
    if (!val && typeof val !== 'number') {
      return false;
    }
    return true;
  }

  getStatText(columnKey: string) {
    const s = this.stats[columnKey];
    if (!s) {
      return;
    }
    const opts = s.options as SheetStatisticOptions;
    switch (opts.statisticMode) {
      case AggregateType.Sum:
        return this.$t('cloudpivot.form.renderer.label.sum');
      case AggregateType.Avg:
        return this.$t('cloudpivot.form.renderer.label.avg');
      case AggregateType.Min:
        return this.$t('cloudpivot.form.renderer.label.min');
      case AggregateType.Max:
        return this.$t('cloudpivot.form.renderer.label.max');
      default:
        break;
    }
  }

  getColumnLabel(col: FormSheetColumn) {
    const label = col.options ? col.options.name : col.name;
    const locale = this.$i18n.locale;
    const name_i18n = col.options ? col.options.name_i18n : col.name_i18n;

    if (locale && name_i18n) {
      const locales =
        typeof name_i18n === 'string' ? JSON.parse(name_i18n) : name_i18n;
      if (locales[locale]) {
        return locales[locale];
      }
    }

    return label;
  }

  getColumnRequired(col: FormSheetColumn) {
    const item = this.columnOptions.find((val) => val.key === col.key);
    if (item) {
      return !!item.options.required;
    } else {
      return false;
    }
  }

  getTips(col: FormSheetColumn) {
    if (col && col.options && col.options.tips) {
      return col.options.tips;
    }
    return '';
  }

  handleRootScroll() {
    if (!this.scrollbar) {
      this.scrollbar = this.$el.querySelector('.scrollbar');
      if (!this.scrollbar) {
        return;
      }
    }

    const $sheet = this.$el.querySelector('.sheet') as HTMLDivElement;

    if (!$sheet) {
      return;
    }

    const $sheetBody = $sheet.querySelector('.sheet__body');

    if (!$sheetBody) {
      return;
    }

    const sheetRect = $sheet.getBoundingClientRect() as DOMRect;
    const bodyRect = $sheetBody.getBoundingClientRect() as DOMRect;

    const clientHeight = (document as any).documentElement.clientHeight;

    const over =
      sheetRect.top + sheetRect.height + this.scrollbar.offsetHeight >
      clientHeight;

    if (bodyRect.top < clientHeight && over) {
      this.scrollbar.style.width = $sheet.offsetWidth + 'px';
      this.scrollbar.classList.add('stick');
    } else {
      this.scrollbar.classList.remove('stick');
    }
  }

  mounted() {
    this.$nextTick(() => {
      const el = this.$el.querySelector(
        '.sheet__row:last-child > .sheet__cols',
      ) as HTMLDivElement;

      if (el) {
        this.shadowRight = el.offsetWidth < el.scrollWidth;
        // this.sheetIsScroll = this.shadowRight;
      }

      this.handleRootScroll();

      this.onScrollFn = () => {
        this.handleRootScroll();
      };

      if (this.getScrollEl) {
        const scrollEl = this.getScrollEl();
        if (scrollEl) {
          scrollEl.addEventListener('scroll', this.onScrollFn);
        }
      }
    });
  }

  language: string = localStorage.getItem('locale') || 'zh';

  zhToEn: any = '';

  created() {
    this.zhToEn = zhToEn;
  }

  destroyed() {
    if (this.getScrollEl && this.onScrollFn) {
      const scrollEl = this.getScrollEl();
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', this.onScrollFn);
      }
    }
  }
}

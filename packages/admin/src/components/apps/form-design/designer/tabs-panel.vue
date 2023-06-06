<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="tabs-panel">
    <grid
      ref="grid"
      :controls="controls"
      :layout="layout"
      :clearParentShowEmptyTask="clearParentShowEmptyTask"
      :path="path"
      :autoSpanValues="autoSpanValues"
      :formFramework="panel.formFramework"
      :ignoreTypes="[500]"
      @change="onGridChange"
      @control-add="onControlAdd"
      @control-delete="onControlDelete"
    />
  </div>
</template>

<script lang="ts">
import { schema } from 'cloudpivot/form';
import {
  Component,
  Inject,
  Prop,
  Vue,
  Watch,
  Provide,
} from 'vue-property-decorator';
import { FormControl, FormTabsPanel } from '../typings';
import * as ControlFactory from '../typings/control-factory';

@Component({
  name: 'tabs-panel',
  components: {
    Grid: () => import('./grid.vue'),
  },
})
export default class TabsPanel extends Vue {
  @Prop()
  readonly panel!: FormTabsPanel;

  @Inject()
  clearParentShowEmptyTask!: () => void;

  @Inject()
  setDataitemUesdFor!: (
    controls: { [key: string]: schema.FormControl },
    used: boolean,
    key: string,
  ) => void;

  controls = {} as any;

  layout: string[][] = [];

  autoSpanValues: any = {};

  selectedControl: any = {};

  curSpan: any = 0;

  @Inject()
  getMovingControl!: Function;

  @Provide()
  tabsControlSelected(control) {
    this.selectedControl = control;
    this.emitControlSelect(control);
    this.$emit('selectControl', control);
  }

  @Inject()
  emitControlSelect!: Function;

  @Inject()
  copyDataItemFrom!: (control: FormControl, copyKey: string) => void;

  @Inject()
  emitDataItemDelete!: (code: string) => void;

  get path() {
    const tabs = (this.$parent as any).control as schema.FormTabs;
    if (tabs.path) {
      return tabs.path.concat([this.panel.key]);
    } else {
      return [tabs.key, this.panel.key];
    }
  }

  // get ignoreTypes(){
  //   return [schema.FormControlType.ReverseRelevance];
  // }

  @Watch('panel', {
    immediate: true,
    deep: true,
  })
  setControl(val: any, oldVal) {
    if (val.controls) {
      this.controls = val.controls;
    }

    if (val.layout) {
      this.layout = val.layout;
    }

    const selectedControlKey = this.selectedControl.key;
    let span: any = '';
    try {
      span = this.controls[selectedControlKey].options.span;
    } catch (error) {}

    if (selectedControlKey && span !== this.curSpan) {
      this.curSpan = this.controls[selectedControlKey].options.span;
      if (val.formFramework === 5 || !val.formFramework) {
        this.layout.forEach((row) => {
          if (row.includes(selectedControlKey)) {
            row.forEach((col) => {
              if (
                col !== selectedControlKey &&
                this.controls[col].options.span
              ) {
                this.autoSpanValues[col] = this.controls[col].options.span;
                this.controls[col].options.span = undefined;
              } else {
                delete this.autoSpanValues[selectedControlKey];
              }
            });
          }
        });
      }
      this.autoLayoutRow(this.layout);
      (this.$refs.grid as any).spanChange(selectedControlKey, this.curSpan);
    } else if (
      !selectedControlKey ||
      !this.controls[selectedControlKey] ||
      !this.controls[selectedControlKey].options ||
      !this.controls[selectedControlKey].options.span
    ) {
      this.curSpan = 0;
    } else {
      //Else Empty block statement
    }

    if (val.formFramework && val.formFramework !== val.prevFramework) {
      this.onFormFrameworkChange(val);
      val.prevFramework = val.formFramework;
    }
  }

  onGridChange(layout: string[][]) {
    this.layout = layout;
    if (this.getMovingControl() && this.controls[this.getMovingControl().key]) {
      this.autoSpanValues['.'] =
        this.controls[this.getMovingControl().key].options.span;
    } else {
      if (this.panel.formFramework === 5) {
        this.autoSpanValues['.'] = 24;
      } else if (this.panel.formFramework) {
        this.autoSpanValues['.'] = 24 / this.panel.formFramework;
      } else {
        //Else Empty block statement
      }
    }
    if (this.panel.formFramework === 5) {
      this.autoLayoutRow(layout);
    }
  }

  onControlAdd(control: FormControl, copyKey?: string) {
    console.log('onControlAdd =>', control, copyKey, this.controls);
    if (control.type === 500) {
      control.panels.forEach((panel) => {
        panel.formFramework = this.panel.formFramework;
      });
    }
    if (control.options && control.options.span === '') {
      control.options.span = undefined;
    }
    ControlFactory.setControlPath(control, this.path);

    this.controls[control.key] = control;

    if (control.key !== '.') {
      this.setDataitemUesdFor(this.controls, true, control.key);
    }

    if (copyKey) {
      this.copyDataItemFrom(control, copyKey);
    }

    if (this.panel.formFramework && this.panel.formFramework !== 5) {
      if (
        !ControlFactory.isFullRow(control.type) &&
        control.options &&
        !control.options.span
      ) {
        control.options.span = 24 / this.panel.formFramework;
      } else if (control.options && !control.options.span) {
        control.options.span = 24;
      } else {
        //Else Empty block statement
      }
    } else {
      this.autoSpanValues[control.key] = 24;
    }
  }

  onControlDelete(controlKey: string) {
    if (controlKey !== '.') {
      this.setDataitemUesdFor(this.controls, false, controlKey);
    }
    delete this.controls[controlKey];
    this.emitDataItemDelete(controlKey);
    this.emitControlSelect();
  }

  autoLayoutRow(layout) {
    layout.forEach((row) => {
      //只有有被选中列或者存在空快的行才会被自动布局
      if (
        row.every((key) => !this.autoSpanValues[key]) &&
        !row.every(
          (key) =>
            !this.autoSpanValues[key] &&
            !(
              this.controls[key] &&
              this.controls[key].options &&
              this.controls[key].options.span
            ),
        )
      ) {
        return;
      }
      const autoColLen = row.reduce((sum, col) => {
        return (
          sum +
          (this.controls[col].options && this.controls[col].options.span
            ? 0
            : 1)
        );
      }, 0);
      const autoWidth =
        24 -
        row.reduce((sum, col) => {
          return (
            sum +
            (this.controls[col].options && this.controls[col].options.span
              ? this.controls[col].options.span
              : 0)
          );
        }, 0);

      let autoWidthEach = autoWidth / autoColLen;
      row.forEach((col) => {
        if (!this.controls[col].options || !this.controls[col].options.span) {
          this.autoSpanValues[col] = autoWidthEach;
          if (col !== '.') {
            this.controls[col].initSpanValue = autoWidthEach;
          }
          if (autoWidthEach === 9) {
            this.autoSpanValues[col] = 6;
            if (col !== '.') {
              this.controls[col].initSpanValue = 6;
            }
            autoWidthEach = 12;
          }
        }
      });
    });
  }

  onFormFrameworkChange(val) {
    if (val.formFramework === 5 || !this.panel.prevFramework) {
      if (!this.panel.prevFramework) {
        this.autoLayoutRow(this.layout);
      }
      return;
    }
    const initSpan = 24 / val.formFramework;
    const layout = this.layout;
    const newLayout: string[][] = [];
    let counter = val.formFramework;
    layout.forEach((row) => {
      row.forEach((col) => {
        if (counter === val.formFramework) {
          newLayout.push([]);
          counter = 0;
        }
        if (ControlFactory.isFullRow(this.controls[col].type)) {
          if (newLayout[newLayout.length - 1].length > 0) {
            newLayout.push([col]);
          } else {
            newLayout[newLayout.length - 1].push(col);
          }
          this.controls[col].options.span = 24;
          counter = val.formFramework;
        } else {
          newLayout[newLayout.length - 1].push(col);
          this.controls[col].options.span = initSpan;
          counter++;
        }
      });
    });
    val.layout = newLayout;
  }

  // mounted() {
  //   if (this.layout && this.panel.formFramework === 5) {
  //     this.autoLayoutRow(this.layout);
  //   }
  // }

  destroyed() {
    Object.keys(this.controls).forEach((key) => {
      delete this.controls[key].initSpanValue;
      this.controls[key].options.span = this.autoSpanValues[key]
        ? this.autoSpanValues[key]
        : this.controls[key].options.span;
    });
  }
}
</script>

<style lang="less" scoped>
.tabs-panel {
  background: #fff;
  // border: 1px solid black;
  width: 100%;
}
</style>

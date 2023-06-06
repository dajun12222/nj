<template>
  <div>
    <div class="container test" :class="id"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from 'vue-property-decorator';

import bridgeControl from './bridgeControl.vue';

import DataMonitor from './DataMonitor';

@Component({
  name: 'SheetGrid',
  components: {
    BridgeControl: bridgeControl,
  },
})
export default class SheetGrid extends DataMonitor {
  id: string = '';

  created() {
    this.id = 'id' + new Date().getTime();
  }

  @Inject()
  getControl!: () => any;

  @Watch('gridRows', {})
  changeGridRows() {
    this.gridSetData({
      rows: this.handleGridRows,
      columns: this.handleGridColumns,
    });
    this.gridRender();
  }

  setFormatter() {
    this.gridSetFormatter({
      header: function (
        value,
        rowData,
        columnData,
        rowIndex,
        columnIndex,
        cellNode,
      ) {
        return value;
      },
      baseComponent: (value, rowData, columnData) => {
        const that = this;
        const id = `${value.key}-key-${value.type}-type-`;
        if (that.gridRows[rowData.tg_index][columnData.id].type === 9) {
          that.gridSetRowHeight(
            rowData.tg_index,
            value.controller._value.length * 30 + 50,
          );
        }
        Vue.nextTick(function () {
          const vm = new Vue({
            el: `.${id}`,
            data: {
              name: value,
            },
            render: (createElement) => {
              const VNode = createElement(bridgeControl, {
                props: {
                  control: value,
                  edit: that.edit,
                },
                on: {
                  change: (val) => {
                    console.log('change==>', rowData.tg_index, val);
                    if (
                      that.gridRows[rowData.tg_index][columnData.id].type === 9
                    ) {
                      that.gridSetRowHeight(
                        rowData.tg_index,
                        val.length * 30 + 50,
                      );
                    }
                    const ctrl = that.getControl();
                    if (ctrl) {
                      ctrl.value[rowData.tg_index][value.key] = val;
                      //@ts-ignore
                      h3form[ctrl.key].value = ctrl.value;
                    }
                  },
                },
              });
              return VNode;
            },
          });
        });
        return `<div><span class="${id}"></span></div>`;
      },
    });
  }

  mounted() {
    //配置grid
    const container = document.querySelector(`.${this.id}`) as any;
    this.createGrid(container);
    this.gridSetOption({
      className: 'my-grid-class-name',
      sortField: 'name',
      showCheckbox: true,
      showCheckboxAll: true,
      autoHeight: true,
      columnDefaults: {
        width: 230,
        minWidth: 80,
        maxWidth: 600,
      },
      rowHeight: 50,
    });
    this.setFormatter();

    this.gridBind('onCheckboxClick', (e, d) => {
      this.check(d.row);
    });

    this.gridBind('onCheckboxAllClick', (e, d) => {
      const evt: any = { target: { checked: false } };
      evt.target.checked = !d.selected;
      this.checkAll(evt);
    });
  }
}
</script>

<style lang="less" scoped>
.container {
  max-height: 500px;
  width: 100%;
}
/deep/ .tg-row {
  line-height: 30px !important;
  .tg-cell {
    display: flex;
    align-items: center;
  }
}
</style>

import { Vue, Watch, Prop, Inject } from 'vue-property-decorator';

// @ts-ignore
import { Grid, EditorBase } from 'h3-grid';

const youEditor = EditorBase.extend({
  type: 'yourEditorType',
  // ... override functions
});

const editor = {
  yourEditorType: youEditor,
};
export abstract class BaseGrid extends Vue {
  /* constructor(container:any){
    super();
    console.log("constructor---------");

    this.grid = new Grid(container);
  } */

  grid: any;

  //得到行的数据
  gridGetRowItem(index: number) {
    const row = this.grid.getRowItem(index);
    return row;
  }

  //创建一个grid对象赋值给this.grid
  createGrid(container: any) {
    this.grid = new Grid(container);
  }

  //grid设置列行等数据
  gridSetData(dataSource: any) {
    //深度拷贝一份数组
    const data = JSON.parse(JSON.stringify(dataSource));
    this.grid.setData(data);
  }

  //grid获取列行等数据
  gridGetData() {
    return this.grid.getData();
  }

  //grid配置对象
  gridSetOption(obj: any) {
    //配置默认过滤条件
    this.gridSetFilter();
    this.grid.setOption(obj);
  }

  //获取grid配置对象
  gridGetoption() {
    return this.grid.getOption();
  }

  //设置grid过滤条件
  gridSetFilter(filters?: any) {
    //默认的过滤条件
    const newFilters = {
      null: function (value: any) {
        return '--';
      },
      string: function (
        value: any,
        rowData: any,
        columnData: any,
        rowIndex: any,
        columnIndex: any,
        cellNode: any,
      ) {
        return value;
      },
      ...filters,
    };
    this.grid.setFilter(newFilters, true);
  }

  //获取grid过滤条件
  gridGetFilter() {
    return this.grid.getFilter();
  }

  //设置grid渲染格式
  gridSetFormatter(formatters: any) {
    this.grid.setFormatter(formatters);
  }

  //获取grid渲染格式
  gridGetFormatter(str?: string) {
    if (str) {
      this.grid.getFormatter(str);
    } else {
      this.grid.getFormatter();
    }
  }

  //设置行的高度
  gridSetRowHeight(rowIndex: any, height: any) {
    this.grid.setRowHeight(rowIndex, height);
  }

  //绑定事件
  gridBind(e: string, Callback: any) {
    this.grid.bind(e, Callback);
  }

  //grid渲染
  gridRender() {
    this.grid.render();
  }
}

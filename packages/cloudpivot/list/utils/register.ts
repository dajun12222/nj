import Vue from 'vue';

class RegisterView {
  assets: {} = {};

  openViews: string[] = [];

  //视图（插件）源数据，包含所有的可扩展插件
  viewTypeList: ViewImporter[] = [
    {
      type: 'Gantt',
      components: ['GanttList', 'GanttDesign', 'GanttView', 'GanttTemplate'],
    },
  ];

  /**
   * 根据源数据viewTypeList获取视图类型数组
   * 只有视图类型字符串
   */
  getViewTypes() {
    return this.viewTypeList.map((viewType) => {
      return viewType.type;
    });
  }

  /**
   * 构造器，当类实例化时为所有类型的视图，默认填充空组件
   */
  constructor() {
    this.viewTypeList.forEach((view) => {
      view.components.forEach((key) => {
        this.assets[key] = this.createEmptyComponent();
      });
    });
  }

  /**
   * 视图类型注册
   * @param viewType 需要添加的视图类型
   * @returns
   */
  append(viewType, components) {
    const targetView = this.viewTypeList.find((view) => view.type === viewType);
    if (!targetView) {
      console.log(
        viewType + '视图类型不存在，当前拥有的视图类型有',
        this.getViewTypes().join(','),
      );
      return;
    }
    //如果传进来的组件与对应视图的组件配置数量以及每一项能对上才进行下一步
    if (
      Object.keys(components).length === targetView.components.length &&
      Object.keys(components).every((key) =>
        targetView.components.includes(key),
      )
    ) {
      Object.assign(this.assets, components);
      this.openViews.push(viewType);
    } else {
      console.log(
        viewType +
          '视图组件初始化异常，请检查依赖包是否按需导出所有使用到的组件！目标组件包括',
        targetView.components.join(','),
      );
    }
  }

  getAssets() {
    return this.assets;
  }

  getEnableViews() {
    return this.openViews;
  }

  /**
   *
   * @returns 创建一个空组件，保证在依赖包未安装条件下，相关组件内引用甘特图组件时不报错
   */
  createEmptyComponent() {
    return Vue.extend({
      render: (h) => {
        return h('div', {});
      },
    });
  }
}

//插件数据类型
interface ViewImporter {
  //插件类型，如甘特图插件 ==> Gantt
  type: string;
  //插件所包含的所有组件信息
  components: string[];
}

export var viewRegister = new RegisterView();

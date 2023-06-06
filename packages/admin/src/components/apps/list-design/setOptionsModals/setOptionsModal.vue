<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="modal-attr">
    <label for="" @click="openPage">{{ queryViewDataSource.currentDataItems.length ? '已设置' : '未设置' }}
      <span class="icon aufontAll h-icon-all-ellipsis-o"></span></label>
    <a-modal
      :visible="setOptionsVisible"
      :cancelText="$t('languages.Apps.Cancel')"
      :okText="$t('languages.Apps.Ok')"
      width="100%"
      @cancel="onCancelClick"
      @ok="handleOk"
    >
      <div class="set-options-modal">
        <div class="left-item">
          <!--画布区域-->
          <my-canvas
            v-if="setOptionsVisible"
            :loading="loading"
            :dataSource="dataItemsTree"
            :getAsycDataItems="getAsycDataItems"
            :filterData="filterData"
            :initRelevanceNode="initRelevanceNode"
            :RelevanceFormsDataItems="RelevanceFormsDataItems"
            @updateDataSource="updateDataSource"
            @relevanceFormsChange="relevanceFormsChange"
          />
        </div>
        <div class="right-item">
          <h3-sider :options="rightSider">
            <div class="header-step">已选择字段</div>

            <div class="right-scroll-wrapper">
              <collapse
                v-if="
                  checkedBizDataItems.length || checkedSystemsDataItems.length
                "
                title="当前模型字段"
                @undo="undo('current')"
              >
                <template v-if="checkedBizDataItems.length">
                  <h4>业务数据项</h4>
                  <div
                    v-for="(item, index) in checkedBizDataItems"
                    :key="item.id + index"
                    class="data-item"
                  >
                    <div :title="item.name + '[' + item.code + ']'">
                      {{ item.name }}<span>[{{ item.code }}]</span>
                    </div>
                    <span
                      class="icon aufontAll h-icon-all-delete-o del"
                      @click="delCheckedDataItem(item.id)"
                    ></span>
                  </div>
                </template>

                <template v-if="checkedSystemsDataItems.length">
                  <h4>系统数据项</h4>
                  <div
                    v-for="(item, index) in checkedSystemsDataItems"
                    :key="item.id + index"
                    class="data-item"
                  >
                    <div :title="item.name + '[' + item.code + ']'">
                      {{ item.name }}<span>[{{ item.code }}]</span>
                    </div>
                    <span
                      class="icon aufontAll h-icon-all-delete-o del"
                      @click="delCheckedDataItem(item.id)"
                    ></span>
                  </div>
                </template>
              </collapse>
              <template v-if="isUserelevanceForms">
                <collapse
                  v-for="el in RelevanceFormsDataItems"
                  v-show="
                    getCheckedDataItems(el, 'biz').length +
                    getCheckedDataItems(el, 'system').length
                  "
                  :key="el.code"
                  style="margin-top: 24px"
                  :title="`[模型]${el.relativeName}`"
                  @undo="undo(el)"
                >
                  <template v-if="getCheckedDataItems(el, 'biz').length">
                    <h4>业务数据项</h4>
                    <div
                      v-for="(item, index) in getCheckedDataItems(el, 'biz')"
                      :key="item.id + index"
                      class="data-item"
                    >
                      <div :title="item.name + '[' + item.code + ']'">
                        {{ item.name }}<span>[{{ item.code }}]</span>
                      </div>
                      <span
                        class="icon aufontAll h-icon-all-delete-o del"
                        @click.stop="
                          delRelevanceFormsCheckedDataItem(el, item.id)
                        "
                      ></span>
                    </div>
                  </template>

                  <template v-if="getCheckedDataItems(el, 'system').length">
                    <h4>系统数据项</h4>
                    <div
                      v-for="(item, index) in getCheckedDataItems(el, 'system')"
                      :key="item.id + index"
                      class="data-item"
                    >
                      <div :title="item.name + '[' + item.code + ']'">
                        {{ item.name }}<span>[{{ item.code }}]</span>
                      </div>
                      <span
                        class="icon aufontAll h-icon-all-delete-o del"
                        @click="delRelevanceFormsCheckedDataItem(el, item.id)"
                      ></span>
                    </div>
                  </template>
                </collapse>
              </template>

              <div
                v-if="
                  checkedBizDataItems.length === 0 &&
                  checkedSystemsDataItems.length === 0 &&
                  !isUserelevanceForms
                "
                class="empty-tips"
              >
                <img src="./empty.png" />
                <p>请选择模型字段</p>
              </div>
            </div>
          </h3-sider>
        </div>
      </div>
      <template slot="title">
        设置数据源字段
        <a-tooltip placement="bottomLeft">
          <template slot="title">
            <span>1、当前所选字段可在视图的展示字段中显示，支持多层嵌套，最多5层<br /></span>
            <span>2、支持关联单选的模型，且需先选择关联单选控件，才可选择相关模型的字段<br /></span>
            <span>3、同一模型的字段在同一主表或同一子表下只能被选择一次<br /></span>
            <span>4、为避免影响数据查询效率，请不要选择过多模型的字段<br /></span>
          </template>
          <a-icon type="question-circle-o" />
        </a-tooltip>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { getDataItems } from '@/apis/list';
import H3Sider from '@/common/sider/sider.vue';
import { Modal, Tooltip, Icon } from '@h3/antd-vue';
import { DataItemType } from 'cloudpivot/form/schema';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import collapse from './collapse.vue';
import MyCanvas from './myCanvas.vue';
import setCurrentDataItem from './setCurrentDataItem.vue';
import setRelevanceFormsDataItems from './setRelevanceFormsDataItems.vue';

const ListdesignModule = namespace('Apps/Listdesign');

enum StepStatus {
  wait = 'wait',
  finish = 'finish',
}
enum setDataItemType {
  current = 'current', // 当前模型
  relevanceForms = 'relevanceForms', // 关联模型
}

@Component({
  name: 'set-options-modal',
  components: {
    setCurrentDataItem,
    collapse,
    setRelevanceFormsDataItems,
    H3Sider,
    MyCanvas,
    AModal: Modal,
    ATooltip: Tooltip,
    AIcon: Icon,
  },
})
export default class setOptionsModal extends Vue {
  // 当前模型编码
  @Prop() schemaCode!: string;

  //数据通过sotre进行存储，方便aside组件同步更新数据
  @ListdesignModule.State('queryViewDataSource') queryViewDataSource: any;

  @ListdesignModule.Mutation('setQueryViewDataSource')
  setQueryViewDataSource: any;

  @ListdesignModule.Mutation('setQueryViewDataSourceAttr')
  setQueryViewDataSourceAttr: any;

  //控制配置界面显隐
  setOptionsVisible: boolean = false;

  /**在打开页面时录入已保存的关联单选信息
   * 在编辑页面是缓存对关联单选信息的修改
   * 在取消时清空，并在第二次进入配置界面时重新设置为已保存的关连单选信息
   * 在保存时将所有数据汇总到store中
   */
  RelevanceFormsDataItems: any[] = [];

  /**
   * 在根节点上记录根节点的信息，并在子节点上记录各层级
   * 的关联单选信息，数据满足树形结构，方便后续渲染
   */
  dataItemsTree: any = {
    checkedList: [],
    dataItems: [],
  };

  // 选中的业务数据项
  checkedBizDataItems: any[] = [];

  //选中的系统数据项
  checkedSystemsDataItems: any[] = [];

  // h3-sider的参数，用于右侧栏展开收起以及拖拽
  rightSider = {
    width: 312,
    minWidth: 256,
    maxWidth: 700,
    direction: 'right',
    collapsible: true,
  };

  //记录初始化状态
  loading: boolean = true;

  // 创建本组件时调用，主要用于判断store记录的数据是否为第一版的数据，如果是就给出提示信息
  created() {
    if (
      this.queryViewDataSource.relevanceFormsDataItems.some(
        (item) => !item.path,
      )
    ) {
      this.$warning({
        title: '视图数据源数据异常',
        content:
          '检测到数据源的配置数据与当前版本的数据源数据格式不一致，请切换到视图数据源下重新配置',
      });
    }
  }

  /**
   * 打开界面时初始化数据，由于初始化数据时，会
   * 获取各个关联单选关联的模型的数据项，调用很多
   * list接口，此处可能延时比较大，需要在所有节点
   * 的数据初始化完成后刷新画布，渲染最新数据，对于
   * 如何判断初始化完成，此处待优化
   */
  openPage() {
    this.setOptionsVisible = true;
    //将store中保存的关联单选放入组件中，此处用JSON的转化解析是为了确保指向不同的指针
    if (this.queryViewDataSource.relevanceFormsDataItems) {
      this.RelevanceFormsDataItems = JSON.parse(
        JSON.stringify(this.queryViewDataSource.relevanceFormsDataItems),
      );
    }

    //树的初始化由当前模型开始，并由当前模型的字段数据延申(子表关联单选，主表关联单选)
    this.getAsycDataItems(this.schemaCode).then((res) => {
      //获取所有子表关联单选
      const sheets = res.data.filter(
        (el) => el.propertyType === DataItemType.Sheet,
      );
      let sheets_RelevanceForms: any[] = [];
      sheets.forEach((sheet) => {
        //将子表标识信息存入到对应的子表关联单选下
        sheets_RelevanceForms = [
          ...sheets_RelevanceForms,
          ...sheet.subSchema.properties.filter((item) => {
            item.parentCode = item.schemaCode;
            item.parentSheetName = sheet.name;
            item.parentSheetCode = item.schemaCode;
            item.schemaCode = sheet.schemaCode;
            item.parentSheetId = sheet.id;
            //过滤出子表关联单选
            return item.propertyType === DataItemType.RelevanceForm;
          }),
        ];
      });
      //将子表关联单选数据添加到主表字段中，与其他关联单选不同的地方是有父级子表标识
      res.data = (res.data as any[]).concat(sheets_RelevanceForms);

      this.dataItemsTree.dataItems = this.filterData(res.data);

      this.refreshDeleteRelevance(this.schemaCode, res.data);

      //开始构造树节点
      if (this.initRelevanceNode(res.data).length > 0) {
        this.dataItemsTree.children = this.initRelevanceNode(res.data);
        if (!this.dataItemsTree.children.length) {
          this.loading = false;
        }
      }

      //第一层存取当前模型的已选字段信息，如果store中有就取store中的，如果没有就默认全选所有字段
      if (this.queryViewDataSource.currentDataItems.length === 0) {
        this.dataItemsTree.checkedList =
          this.dataItemsTree.dataItems.map((el) => el.id) || [];
      } else {
        this.dataItemsTree.checkedList =
          this.queryViewDataSource.currentDataItems.map((el) => el.id) || [];
      }

      //构造并初始化树节点，第二层节点已经存在但没有初始化数据
      this.initDataItemTree(this.dataItemsTree, 5, [this.schemaCode]).then(
        () => {
          this.loading = false;
        },
      );
    });
  }

  //点击取消按钮，清除缓存数据
  onCancelClick() {
    this.RelevanceFormsDataItems = [];
    this.dataItemsTree = {
      checkedList: [],
      dataItems: [],
      children: [],
      expanded: false,
    };
    this.setOptionsVisible = false;
  }

  //点击确定按钮，保存所有数据到store中
  handleOk() {
    this.updateFinalRelevanceForms(this.dataItemsTree);
    this.saveFinalData();

    this.RelevanceFormsDataItems = [];
    this.dataItemsTree = {
      checkedList: [],
      dataItems: [],
      children: [],
      expanded: false,
    };
    this.setOptionsVisible = false;
  }

  //向缓存的关联单选数据中加入最新的置灰状态和展开状态信息
  //在配置过程中，置灰状态和展开状态信息的更改不会映射到缓存
  //关联单选的信息中，只会在树节点数据中存在
  updateFinalRelevanceForms(node) {
    if (node.checkedList.length !== 0) {
      const targetRele = this.RelevanceFormsDataItems.filter(
        (item) =>
          item.relativeCode === node.relativeCode &&
          node.parentSheetCode === item.parentSheetCode,
      );
      if (targetRele.length === 1) {
        targetRele[0].disable = node.disable;
        targetRele[0].expanded = node.expanded;
      }
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        this.updateFinalRelevanceForms(child);
      });
    }
  }

  //将当前模型的勾选信息保存到store中
  saveFinalData() {
    this.setQueryViewDataSource({
      currentDataItems: this.dataItemsTree.dataItems.filter((el) => {
        return this.dataItemsTree.checkedList.includes(el.id);
      }),
      relevanceFormsDataItems: this.RelevanceFormsDataItems,
    });
  }

  /**初始化方法。在一个节点上调用此方法，首先会为该节点的所有子节点
   * 加上初始化信息，初始化的过程中会用到缓存的关联单选信息，然后会
   * 为所有的子节点寻找下一级的子节点并绑定在当前子节点下。
   * @param step
   *    为剩余层级标识，当step等于5时表示处理的是当前模型，当step
   * 等于1时表示处理的是第五层的节点，此时不会再继续再向第五层再构造
   * 子节点，会直接返回，确保只渲染五层。
   * @param schemaCode
   *    为模型编码数组，最多有两个数据。第一个数据记录当前节点的父节点所代表
   * 的关联单选关联的模型的模型编码，第二个数据表示的是当前节点所代表的关联单
   * 选关联的模型的模型编码。再构造节点path时会用到，而path会在展示字段发布时
   * 构造树形数据会用到
   */
  async initDataItemTree(node: any, step: any, schemaCode: any) {
    if (node.children && node.children.length > 0) {
      if (node.expanded === undefined) {
        node.expanded = false;
      }
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        //切断循环链  -- 自关联/存在循环的链
        if (
          node.relativeCode === child.relativeCode ||
          (node.path &&
            node.path.length &&
            (node.path.some((item) => item.schemaCode === child.relativeCode) ||
              node.schemaCode === child.relativeCode))
        ) {
          this.$set(child, 'disable', true);
          continue;
        }
        let temp: any[] = [];
        const resOrigin: any = await this.getAsycDataItems(child.relativeCode);
        const res = JSON.parse(JSON.stringify(resOrigin));

        // 为保存的关联数据设置dataItems
        this.bindDataItems(child.relativeCode, res && res.data);
        this.refreshDeleteRelevance(child.relativeCode, res && res.data);

        //子表关联单选不继续往下延展
        if (
          !child.parentSheetCode &&
          this.initRelevanceNode(res.data).length > 0
        ) {
          //从子节点中的数据项中筛选出关联单选，并初始化，构造成子节点的子节点
          child.children = this.initRelevanceNode(res.data);
        }
        //若关联单选缓存信息中包含当前子节点代表的关联单选
        //一些关键信息可以直接使用缓存中的数据
        const targetRele = this.findRele(child.id, child.parentSheetCode);
        if (targetRele) {
          child.expanded = targetRele.expanded;
          child.disable = targetRele.disable;
          child.checkedList = targetRele.checkedList;
          //缓存的路径会多一个，必须裁剪
          child.path = targetRele.path.slice(1, targetRele.path.length);
          child.schemaCode = targetRele.schemaCode;
        }
        //关联单选缓存信息中不包含当前子节点代表的关联单选
        //一些关键信息必须自己初始化
        else {
          //往scemaCode数组中加入当前子节点的关联模型的模型编码
          if (schemaCode.length === 1) {
            temp = [...schemaCode, child.relativeCode];
          } else {
            temp = [schemaCode[1], child.relativeCode];
          }

          //当前子节点置灰逻辑
          //1. 缓存信息中不包含当前子节点代表的关联单选（若有，那一个节点不会走这个分支）
          //2. 父节点checkedList包含子节点的id或者parentSheetId(子表中的关联单选)
          if (
            this.RelevanceFormsDataItems.some((rele) => {
              return (
                rele.relativeCode === child.relativeCode &&
                rele.parentSheetCode === child.parentSheetCode
              );
            })
          ) {
            child.disable = true;
          } else {
            child.disable = !(
              node.checkedList.includes(child.id) ||
              node.checkedList.includes(child.parentSheetId)
            );
          }

          //父节点代表的关联单选所在模型的模型编码
          child.schemaCode = temp[0];
          if (step !== 5) {
            child.path = [
              {
                parentName: node.relativeName,
                schemaCode: node.schemaCode,
                parentCode: node.code,
                relativeCode: node.relativeCode,
              },
              ...node.path,
            ];
          }
        }

        //对于子表中的关联单选，去除res.data中的子表数据项，子表中不能再选子表
        if (child.parentSheetName || child.parentSheetCode) {
          res.data = res.data.filter((item) => {
            item.parentSheetName = child.parentSheetName;
            item.parentSheetCode = child.parentSheetCode;
            return item.propertyType !== DataItemType.Sheet;
          });
        }
        child.dataItems = res.data;
        //暂时只渲染五层
        if (step > 2) {
          this.initDataItemTree(child, step - 1, temp);
        }
      }
    }
  }

  //找出数据项列表中的关联单选并使用数据项的数据初始化节点
  //@param list  包含模型下所有数据项数据的数组
  initRelevanceNode(list: any[]) {
    return list
      .filter((el) => {
        return el.propertyType === DataItemType.RelevanceForm;
      })
      .map((item) => {
        return {
          disable: true,
          expanded: undefined,
          id: item.id,
          relativeCode: item.relativeCode,
          relativeName: item.relativeName,
          children: [],
          checkedList: [],
          isMainTable: !item.parentCode,
          code: item.code,
          name: item.name,
          options: item.options,
          propertyTypeName: item.propertyTypeName,
          parentSheetCode: item.parentSheetCode,
          parentSheetName: item.parentSheetName,
          parentSheetId: item.parentSheetId,
          path: [],
          schemaCode: '',
        };
      });
  }

  //模型数据项数据缓存
  dataitemsMap: any = new Map();

  //获取模型编码下所有的数据项信息
  async getAsycDataItems(schemaCode) {
    if (this.dataitemsMap.has(schemaCode)) {
      return this.dataitemsMap.get(schemaCode);
    } else {
      const resp = await getDataItems(schemaCode, true);
      this.dataitemsMap.set(schemaCode, resp);
      return resp;
    }
  }

  //从缓存中找到对应的关联单选信息
  findRele(id, parentSheetCode) {
    const target = this.RelevanceFormsDataItems.filter(
      (item) => item.id === id && item.parentSheetCode === parentSheetCode,
    );
    return target[0] || null;
  }

  // 删除选中的模型字段
  // 后续还有监听函数的逻辑会处理
  delCheckedDataItem(id) {
    this.dataItemsTree.checkedList = [
      ...this.dataItemsTree.checkedList.filter((el) => el !== id),
    ];
  }

  //取消关联单选下的字段
  delRelevanceFormsCheckedDataItem(item, id) {
    item.checkedList = item.checkedList.filter((el) => el !== id);
    const directNode = this.findNodeById(this.dataItemsTree, item.id);
    directNode.checkedList = item.checkedList;
    if (item.checkedList.length === 0) {
      const index = this.RelevanceFormsDataItems.indexOf(item);
      this.clearCheckList(directNode);
      this.RelevanceFormsDataItems.splice(index, 1);
    }
    this.updateDataSource();
  }

  //点击右侧栏的取消选择，会清空对应模型下所有字段
  undo(el) {
    if (el === 'current') {
      this.clearCheckList(this.dataItemsTree);
    } else {
      const directNode = this.findNodeById(this.dataItemsTree, el.id);
      this.clearCheckList(directNode);
    }
    this.updateDataSource();
  }

  //通过id找到树节点中的对应节点
  findNodeById(node, id) {
    if (node.id === id) {
      return node;
    } else if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        if (this.findNodeById(node.children[i], id) !== null) {
          return this.findNodeById(node.children[i], id);
        }
      }
    } else {
      //Else Empty block statement
    }
    return null;
  }

  //在主表的checkedList发生改变时执行的逻辑
  @Watch('dataItemsTree.checkedList')
  onCurrentCheckedListChange(checkedList) {
    this.checkedBizDataItems = this.dataItemsTree.dataItems.filter(
      (el) => checkedList.includes(el.id) && !el.defaultProperty,
    );
    this.checkedSystemsDataItems = this.dataItemsTree.dataItems.filter(
      (el) => checkedList.includes(el.id) && el.defaultProperty,
    );
    if (!this.dataItemsTree.children) {
      return;
    }
    this.dataItemsTree.children.forEach((el) => {
      if (
        checkedList.includes(el.id) ||
        checkedList.includes(el.parentSheetId)
      ) {
        if (
          el.disable &&
          !this.RelevanceFormsDataItems.some(
            (rele) =>
              rele.relativeCode === el.relativeCode &&
              rele.parentSheetCode === el.parentSheetCode,
          )
        ) {
          el.disable = false;
        }
      } else {
        if (!el.disable) {
          this.clearCheckList(el);
          el.disable = true;
        }
      }
    });
  }

  // 模型数据
  getCheckedDataItems(item, type): any[] {
    if (type === 'biz') {
      return item.dataItems.filter(
        (el) => item.checkedList.includes(el.id) && !el.defaultProperty,
      );
    } else {
      return item.dataItems.filter(
        (el) => item.checkedList.includes(el.id) && el.defaultProperty,
      );
    }
  }

  get isUserelevanceForms() {
    return this.RelevanceFormsDataItems.some((el) => el.checkedList.length > 0);
  }

  filterData(data) {
    // 需要过滤掉的字段
    const filtersCode = [
      'workflowInstanceId',
      'runnigInstanceId',
      'ownerDeptQueryCode',
    ];
    // 需要过滤掉的数据项类型: 附件(暂时放开-- 6)、审批意见、子表(放开 -- 8)
    const filterPropertyType = [7];
    return data.filter(
      (item: any) =>
        !filtersCode.includes(item.code) &&
        !filterPropertyType.includes(item.propertyType),
    );
  }

  updateDataSource() {
    this.$set(this.dataItemsTree, 'children', this.dataItemsTree.children);
  }

  relevanceFormsChange(relevanceFormItem, parentSheetCode) {
    if (this.RelevanceFormsDataItems.includes(relevanceFormItem)) {
      this.setAbleAlone(
        this.dataItemsTree,
        relevanceFormItem.path,
        parentSheetCode,
      );
    } else {
      this.setAbleAll(
        this.dataItemsTree,
        relevanceFormItem.path,
        parentSheetCode,
      );
    }
  }

  clearCheckList(node) {
    node.checkedList = [];
    for (let i = 0; i < this.RelevanceFormsDataItems.length; i++) {
      if (
        this.RelevanceFormsDataItems[i].id === node.id &&
        node.path.length === this.RelevanceFormsDataItems[i].path.length &&
        node.path.every(
          (item, index) =>
            item.schemaCode ===
            this.RelevanceFormsDataItems[i].path[index].schemaCode,
        )
      ) {
        this.relevanceFormsChange(
          { ...this.RelevanceFormsDataItems[i] },
          node.parentSheetCode,
        );
        this.RelevanceFormsDataItems.splice(i, 1);
        break;
      }
    }
    if (node.children && node.children.length > 0) {
      node.expanded = false;
      node.children.forEach((child) => {
        child.disable = true;
        this.clearCheckList(child);
      });
    }
  }

  //同一个关联模型都没选中时都可以选
  setAbleAll(node, path, parentSheetCode) {
    if (
      path &&
      path[0] &&
      path[0].relativeCode === node.relativeCode &&
      node.parentSheetCode === parentSheetCode
    ) {
      node.disable = false;
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        if (
          node.checkedList.includes(child.id) ||
          node.checkedList.includes(child.parentSheetId)
        ) {
          this.setAbleAll(child, path, parentSheetCode);
        }
      });
    }
  }

  //同一个关联模型只会有一个可以被选到
  setAbleAlone(node, path, parentSheetCode) {
    if (
      path &&
      path[0] &&
      path[0].relativeCode === node.relativeCode &&
      node.parentSheetCode === parentSheetCode
    ) {
      if (path[0].parentCode !== node.code) {
        node.disable = true;
        this.clearCheckList(node);
      }
    }
    if (node.children && node.children.length > 0 && node.expanded) {
      node.children.forEach((child) => {
        if (
          node.checkedList.includes(child.id) ||
          node.checkedList.includes(child.parentSheetId)
        ) {
          this.setAbleAlone(child, path, parentSheetCode);
        }
      });
    }
  }

  //为存储到后台的数据源数据更新dataItems
  bindDataItems(schemaCode, dataItems) {
    //关联的表单为schemaCode编码的关联单选
    const releOfSchemaCode = this.RelevanceFormsDataItems.find(
      (item) => item.relativeCode === schemaCode,
    );

    if (releOfSchemaCode && dataItems) {
      releOfSchemaCode.dataItems = dataItems;
    }
  }

  //表单内关联单选被删除后，数据一并删除
  refreshDeleteRelevance(schemaCode, dataItems) {
    //所在表单为schemaCode编码的关联单选
    const releInSchemaCodeArr = this.RelevanceFormsDataItems.filter(
      (item) => item.schemaCode === schemaCode,
    ).map((item) => item.id);
    releInSchemaCodeArr.forEach((releInSchemaCode) => {
      if (
        dataItems &&
        dataItems.every((item) => !(item.id === releInSchemaCode))
      ) {
        this.RelevanceFormsDataItems = this.RelevanceFormsDataItems.filter(
          (el) => el.id !== releInSchemaCode,
        );
      }
    });
  }
}
</script>
<style lang="less" scoped>
@green: @primary-color;

@media (max-width: 767px) {
  /deep/.ant-modal {
    max-width: unset;
    margin: unset;
  }
}

/deep/.ant-modal-wrap {
  overflow: hidden;
}

/deep/.ant-modal {
  height: 100%;
  top: unset;
  padding-bottom: unset;
  .ant-modal-content {
    height: 100%;
    .ant-modal-header {
      border-bottom: unset;
      border-radius: unset;
    }
    .ant-modal-body {
      height: calc(100% - 155px);
      padding: unset;
      .set-options-modal {
        height: 100%;
        .left-item {
          flex: 1;
          padding-left: 20px;
          position: relative;
        }
        .right-item {
          margin-left: unset;
          padding-top: 20px;
          .h3-sider {
            height: 100%;
            .h3-sider-body {
              margin-left: 24px;
              overflow: hidden;
            }
            .h3-sider-toggle {
              top: 5px;
            }
          }
          width: unset;
          overflow: unset;
          .right-scroll-wrapper {
            max-height: calc(100% - 32px);
          }
        }
      }
    }
  }
}
.empty-tips {
  text-align: center;
  color: #c1c1c1;
  font-size: 12px;
  margin-top: 90px;
  img {
    margin-bottom: 16px;
    font-weight: 400;
  }
}
.right-scroll-wrapper {
  max-height: 540px;
  overflow: auto;
  margin-top: 16px;
  h4 {
    margin-left: 5px;
  }
  .data-item {
    height: 32px;
    line-height: 32px;
    margin-bottom: 8px;
    overflow: hidden;
    padding-left: 5px;
    padding-right: 5px;
    color: #282828;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    border-radius: 4px;
    & > div {
      flex-basis: 190px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      span {
        margin-left: 4px;
      }
    }
    &:hover {
      color: @green;
      background-color: rgba(216, 216, 216, 0.31);
      span.icon {
        display: block;
      }
    }
    span {
      color: #999;
    }
    .del {
      cursor: pointer;
    }
    span.icon {
      display: none;
    }
  }
}
.colorGreen {
  color: @green;
}
.set-relevance {
  color: @green;
  cursor: pointer;
  i {
    font-size: 14px;
    cursor: pointer;
  }
}
.disable-set-relevance {
  color: #999;
  cursor: not-allowed;
}

.set-options-modal {
  display: flex;
}
.right-item {
  width: 256px;
  overflow: hidden;
  margin-left: 40px;
  .header-step {
    border-bottom: none;
    margin-left: 17px;
    font-weight: 700;
  }
}
.left-item {
  width: 660px;
}
.header-step {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  font-size: 14px;
  line-height: 32px;
  padding-right: 4px;
  color: #111218;
  .left {
    padding-left: 10px;
  }
  span {
    display: inline-block;
    padding: 0 5px;
    margin-right: 20px;
    &:last-child {
      margin-right: 0;
    }
    &.active {
      position: relative;
      color: @green;
      font-weight: 700;
      i {
        font-weight: 400;
        font-size: 14px;
        cursor: pointer;
      }
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: @green;
      }
    }
  }
}
h4 {
  font-weight: 400;
  color: #bfbfbf;
  margin: 10px 0;
  font-size: 12px;
}

.modal-attr {
  label {
    display: block;
    height: 33px;
    line-height: 33px;
    position: relative;
    padding: 0 21px;
    margin: 0;
    cursor: pointer;
    span {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
    }
  }
}
</style>

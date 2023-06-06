<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <!-- li列表 -->
  <section class="list-box">
    <!-- fieldBlock: 0 查询条件; 1 展示字段; 2 排序字段; 3 列表操作(按钮)  -->
    <ul>
      <draggable
        v-model="draggerlistData"
        :options="dragItemOptions"
        @end="onEnd"
      >
        <transition-group>
          <li
            v-for="(el, index) in draggerlistData"
            :key="`${index}-a-${el.type}`"
            class="section-bar"
            :class="{ hoverClass: el.popover, nobackground: fieldBlock === 3 }"
            @mouseenter="mouseEnter(index)"
          >
            <a-icon
              v-if="el.children && el.children.length && !el.showChild"
              class="caret-r"
              type="caret-right"
              @click="showChild(el)"
            />
            <a-icon
              v-if="el.children && el.children.length && el.showChild"
              class="caret-r"
              type="caret-down"
              @click="showChild(el)"
            />
            <!-- <span :title="el.propertyName" class="bar-title each-title text-ellipsis">{{ el.propertyName || el.name }}</span> -->
            <span
              v-if="fieldBlock === 2"
              :title="el.propertyName"
              class="bar-title each-title text-ellipsis"
              >{{ getFieldKey(el) }}</span>
            <!-- ($i18n.locale === 'zh' || !$i18n.locale ? el.name : el.name_i18n[$i18n.locale]) -->
            <span
              v-else
              :title="el.propertyName"
              class="bar-title each-title text-ellipsis"
              >{{ getFieldKey(el) }}</span>
            <span class="bar-right list-icon">
              <span v-if="fieldBlock !== 3" class="icons">
                <a-popconfirm
                  v-if="fieldBlock !== 2"
                  :title="$t('languages.Apps.DeleteItemTips')"
                  :cancelText="$t('languages.Apps.Cancel')"
                  :okText="$t('languages.Apps.Ok')"
                  @confirm="() => handleDelete(index)"
                >
                  <i title="删除" class="aufontAll h-icon-all-delete-o1"></i>
                </a-popconfirm>
                <i
                  v-else
                  title="删除"
                  class="aufontAll h-icon-all-delete-o1"
                  @click="handleDelete(index)"
                ></i>
              </span>
              <!-- 排序按钮 -->
              <span v-if="fieldBlock === 2" class="icons">
                <i
                  class="aufontAll"
                  :class="{
                    'h-icon-all-ascending-o': el.direction === 1,
                    'h-icon-all-descending-o': el.direction !== 1,
                  }"
                  title="排序"
                  @click="handleAscending(el.direction, index)"
                >
                </i>
              </span>
              <!-- setting按钮 -->
              <!-- 当前处理人没有设置按钮 迭代37 -->
              <a-popover
                v-if="
                  el.type !== 8 &&
                  isShowPopover.includes(fieldBlock) &&
                  el.code !== 'participants_'
                "
                v-model="el.popover"
                :destroyTooltipOnHide="destroyTooltipOnHide"
                trigger="click"
                placement="bottomRight"
              >
                <a slot="content" class="queryPopover-modal">
                  <div v-if="fieldBlock === 0">
                    <QueryPopover
                      :modalData="el"
                      :index="index"
                      @confirm="comfirmDialog(index, $event)"
                      @cancel="hideLeve2Popoer(index, $event)"
                      @isOpenChileMoadl="(value) => isOpenChileMoadl(value, el)"
                    />
                  </div>
                  <div v-else-if="fieldBlock === 1">
                    <TableSetting
                      :modalData="el"
                      :index="index"
                      @confirm="comfirmDialog(index, $event)"
                      @cancel="hideLeve2Popoer(index, $event)"
                    />
                  </div>
                  <div v-else-if="fieldBlock === 3 && !el.children">
                    <BtnSetting
                      ref="btn"
                      :modalData="el"
                      :index="index"
                      @confirm="comfirmDialog(index, $event)"
                      @cancel="hideLeve2Popoer(index, $event)"
                    />
                  </div>
                </a>

                <span
                  v-if="fieldBlock !== 2 && !el.children"
                  class="icons settings"
                  title="设置"
                  @click="settingPopoverShow(index)"
                >
                  <i class="aufontAll h-icon-all-setting-o"></i>
                </span>
              </a-popover>
              <!-- 子表设置弹窗 -->
              <span
                v-if="el.type === 8 && fieldBlock === 1"
                class="icons"
                title="设置"
                @click="tablePopoverShow(index, el)"
              >
                <i class="aufontAll h-icon-all-setting-o"></i>
              </span>
            </span>

            <!-- 批量操作合在一个按钮，以下拉展示形式展示， 暂时不能合并批量打印，功能暂时注释保留，后续如果需要合并其他批量操作，可以放开 -->
            <!-- <ul v-if="el.children" v-show="el.showChild" class="child-ul">
              <li
                v-for="(elc, key) in el.children"
                class="section-bar"
                :class="{hoverClass: elc.popover, nobackground: fieldBlock === 3}"
                :key="`${key}-a`"
                @mouseenter="mouseEnter(key)"
              >
                <span
                  :title="elc.propertyName"
                    class="bar-title each-title text-ellipsis"
                  >{{ getFieldKey(elc)}}
                </span>
                <span class="bar-right list-icon">
                  <a-popover
                    trigger="click"
                    v-model="elc.popover"
                    placement="bottomRight"
                    v-if="elc.type !== 8 && isShowPopover.includes(fieldBlock)"
                  >
                    <a slot="content" class = "queryPopover-modal">
                        <BtnSetting
                          :modalData="elc"
                          :index="key"
                          v-if="elc.hide"
                          ref="btn"
                          @confirm="comfirmDialog(key, $event, 'batchs')"
                          @cancel="hideLeve2Popoer(key, $event, false, 'batchs')"
                        ></BtnSetting>
                    </a>
                    <span
                      class="icons"
                      @click="settingPopoverShow(key, 'batchs')"
                    >
                      <i class="aufontAll h-icon-all-setting-o"></i>
                    </span>
                  </a-popover>
                </span>
              </li>
            </ul> -->
          </li>
        </transition-group>
      </draggable>
    </ul>
    <childTableSetting
      v-model="showModal"
      :modalData="tableData"
      @close="showModal = false"
      @confirm="comfirmDialog(tableIndex, $event)"
    />
    <template v-if="customButton">
      <custom-button-list
        v-if="presentationType !== 'GANTT' && customModelType !== 'TREE'"
        :typeOpen="false"
        :addviewType="'View'"
      />
    </template>
  </section>
</template>
<script lang="ts">
import BtnSetting from '@/components/apps/list-design/modals/popover/list-btn-setting/btn-index.vue';
import QueryPopover from '@/components/apps/list-design/modals/popover/query-setting/query-index.vue';
import TableSetting from '@/components/apps/list-design/modals/popover/table-setting/table-index.vue';
import childTableSetting from '@/components/apps/list-design/modals/popover/table-setting/table-setting.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import { namespace } from 'vuex-class';
import Dialog from './aside-addDialog.vue';
import { renderer } from 'cloudpivot/form';
import { Popconfirm, Popover, Icon } from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import CustomButtonList from '@/components/apps/customButton/custom-button-list.vue';

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'SideBoxDraggerList',
  components: {
    Draggable,
    QueryPopover,
    TableSetting,
    childTableSetting,
    Dialog,
    BtnSetting,
    APopconfirm: Popconfirm,
    APopover: Popover,
    AIcon: Icon,
    CustomButtonList,
  },
})
export default class SideBoxDraggerList extends Vue {
  @Prop() modalData!: any;

  @ListdesignModule.State('payloadOptions') payloadOptions: any;

  @ListdesignModule.State('thefieldBlock') thefieldBlock: any;

  @ListdesignModule.State('clientType') clientType: any;

  @ListdesignModule.State('ganttModel') ganttModel: any;

  @ListdesignModule.State('presentationType') presentationType: any;

  @ListdesignModule.State('customModelType') customModelType: any;

  @ListdesignModule.Mutation('setPayloadOptions') mutationPayloadOptions: any;

  @ListdesignModule.Mutation('setFieldBlock') mutationFieldBlock: any;

  @ListdesignModule.Mutation('queryChange') mutationQueryChange: any;

  @ListdesignModule.Mutation('setOperationArray') mutationOperationArray: any;

  @ListdesignModule.Mutation('setShowFieldArray') mutationShowFieldArray: any;

  @ListdesignModule.Mutation('setSortArray') mutationSortArray: any;

  @ListdesignModule.Mutation('onEdit') onEdit: any;

  @ListdesignModule.Mutation('setFilterTipsFlag') setFilterTipsFlag: any;

  @Prop() fieldBlock!: number;

  @Prop() propDataList!: Array<any[]>;

  @Prop() canShowDatas!: any;

  @Prop({ default: false }) customButton!: boolean;

  // allraggerlist:any[] = [];
  draggerlistData: any[] = [];

  wrapStyle = { left: '624px' };

  poperList: any[] = [];

  fblock: number = -1;

  index: any = 0;

  showModal: boolean = false;

  tableData: any = {};

  tableIndex: number = 0;

  isShowPopover = [0, 1, 3];

  zhToEn: any = zhToEn;

  destroyTooltipOnHide: boolean = false; //关闭弹窗时是否销毁实例

  showChild(el) {
    this.$set(el, 'showChild', !el.showChild);
  }

  dragItemOptions: any = {
    ghostClass: 'ghostClass',
    fallbackClass: 'dragClass',
  };

  $isOpenChileMoadl: boolean = false;

  isOpenChileMoadl(value, el) {
    this.$isOpenChileMoadl = value;
    el.popover = true;
  }

  // 中英文字段过滤
  getFieldKey(cur: any) {
    let name: any =
      this.$i18n.locale === 'zh' ? cur.name : zhToEn[cur.name] || cur.name;
    if (cur.name_i18n) {
      let name_i18n: any;
      if (typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n);
      } else {
        name_i18n = cur.name_i18n;
      }
      if (this.$i18n.locale === 'en') {
        name = zhToEn[name_i18n['en']] || name_i18n['en'];
      }
      if (this.$i18n.locale === 'zh') {
        name = name_i18n['zh'] || cur.name;
      }
    }
    return name;
  }

  /* 排序字段 */
  handleAscending(v: any, i: number) {
    let cur: number;
    if (v === 1) {
      cur = 2;
    } else {
      cur = 1;
    }
    this.draggerlistData[i].direction = cur;
    this.onEdit(true);
  }

  /* 列表操作 */
  checkIcon(v: boolean, index: number) {
    this.draggerlistData[index].checked = !v;
    this.mutationOperationArray(this.draggerlistData);
  }

  settingPopoverShow(index: number, type?: string) {
    if (this.fieldBlock === 2) {
      return;
    }
    this.draggerlistData.forEach((el: any, num: number) => {
      this.draggerlistData[num].popover = false;
      this.draggerlistData[num].hide = false;
      if (el.children) {
        el.children.forEach((element) => {
          element.popover = false;
          element.hide = false;
        });
      }
    });

    let draggerlistData = this.draggerlistData;
    if (type && type === 'batchs') {
      draggerlistData = this.draggerlistData.find(
        (el) => el.actionCode === type,
      ).children;
    }
    draggerlistData[index].hide = true;
    draggerlistData[index].popover = true;
    this.$forceUpdate();
  }

  tablePopoverShow(index: number, data: any) {
    //
    this.draggerlistData.forEach((el: any, num: number) => {
      this.draggerlistData[num].popover = false;
      this.draggerlistData[num].hide = false;
    });
    this.tableIndex = index;
    this.tableData = data;
    this.showModal = true;
  }

  /**
   * 字段拖拽排序结束
   */
  onEnd() {
    this.onEdit(true);
    this.$emit('setTargetSortList', this.draggerlistData);
  }

  /* li弹窗-确定 */
  // 操作按钮修改名字, 在打开修改弹窗之前对名字做个备份, 不管是提交出错还是返回, 都恢复备份数据
  comfirmDialog(i: number, val: any, type?) {
    console.log(val, 'val-------------++++++++++++++++++++++=');
    if (this.destroyTooltipOnHide) {
      //点击确定关闭弹框时不销毁实例
      this.destroyTooltipOnHide = false;
    }
    this.onEdit(true);
    new Promise((resolve, reject) => {
      if (this.draggerlistData.length > 0) {
        if (this.fieldBlock === 3) {
          const {
            popover,
            name,
            queryActionType,
            associationType,
            associationCode,
            systemAction,
            icon,
            name_i18n,
          } = val;
          // 判断是否存在导入勾选
          if (val.extend1 !== null) {
            const { extend1 } = val;
            this.draggerlistData[i].extend1 = extend1;
          }

          let draggerlistData = this.draggerlistData;
          if (type && type === 'batchs') {
            draggerlistData = this.draggerlistData.find(
              (el) => el.actionCode === type,
            ).children;
          }
          draggerlistData[i].name = val.name;
          draggerlistData[i].name_i18n = { ...val.name_i18n };
          draggerlistData[i].popover = popover;
          draggerlistData[i].queryActionType = queryActionType;
          draggerlistData[i].associationType = associationType;
          draggerlistData[i].associationCode = associationCode;
          draggerlistData[i].systemAction = systemAction;
          draggerlistData[i].icon = icon;
          if (associationType === 1) {
            this.$emit('setWorkflowForm');
          } else if (associationType === 0) {
            this.$emit('setNormalForm');
          } else {
            //Else Empty block statement
          }
        } else {
          this.draggerlistData[i] = Object.assign(this.draggerlistData[i], val);
          this.draggerlistData[i].checked = true;
          this.draggerlistData[i].data = val;
        }
        this.mutationQueryChange();
      }
      resolve(i);
    })
      .then((params: any) => {
        this.hideLeve2Popoer(params, val, true, type, true);
        this.$forceUpdate();
      })
      .catch((error) => {
        this.$message.error(error.toString());
      });
  }

  /* li弹窗-取消 */
  hideLeve2Popoer(
    i: number,
    backData,
    justClose = false,
    type?,
    Hide?: boolean,
  ) {
    if (
      this.draggerlistData.length < 1 ||
      typeof this.draggerlistData[i].popover === 'undefined'
    ) {
      return;
    }
    if (this.fieldBlock === 0 && !Hide) {
      //点击取消时关闭弹框销毁实例
      this.destroyTooltipOnHide = true;
    }
    let draggerlistData = this.draggerlistData;
    if (type && type === 'batchs') {
      draggerlistData = this.draggerlistData.find(
        (el) => el.actionCode === type,
      ).children;
    }
    draggerlistData[i].popover = false;
    setTimeout(() => {
      draggerlistData[i].hide = false;
      this.$forceUpdate();
    }, 300);
  }

  /* 删除-字段 */
  handleDelete(i: any) {
    if (
      this.fieldBlock === 1 &&
      this.ganttModel &&
      this.ganttModel.titlePropertyCode === this.draggerlistData[0].code &&
      i === 0
    ) {
      this.$message.error('甘特图标题字段默认设置为展示字段，不可删除');
      return;
    }
    const newData = [...this.draggerlistData];
    this.index = i;
    this.sethoverClass(i, true);
    // draggerlistData引用propDataList：改变propDataList的checked值
    this.draggerlistData = newData.map((el: any, index: number) => {
      if (index === i) {
        el.checked = false;
        return el;
      }
    });

    this.draggerlistData = newData.filter(
      (el: any, index: number) => index !== i,
    );
    this.onEdit(true);
  }

  /* 设置显隐class */
  sethoverClass(i: any, bol: boolean) {
    if (
      this.draggerlistData.length < 1 ||
      typeof this.draggerlistData[i].hoverClass === 'undefined'
    ) {
      return;
    }
    this.draggerlistData[i].hoverClass = bol;
  }

  mouseEnter(index: any) {
    if (this.fieldBlock !== 3) {
      this.sethoverClass(index, false);
    }
  }

  changeDraggerlistData(v: any) {
    // 查询字段
    if (this.fieldBlock === 0 && v.length > 0) {
      this.draggerlistData = v.filter((el: any) => el.checked === true);
      // 展示字段
    } else if (this.fieldBlock === 1) {
      this.draggerlistData = v.filter((el: any) => el.checked === true);
      this.mutationShowFieldArray(this.draggerlistData);
      // 排序字段
    } else if (this.fieldBlock === 2) {
      this.draggerlistData.forEach((item) => {
        // item.checked = false;
      });
      this.draggerlistData = v.filter((el: any) => el.checked === true);
      this.mutationSortArray(this.draggerlistData);
      // 列表操作
    } else if (this.fieldBlock === 3) {
      this.draggerlistData = v;
      this.mutationOperationArray(this.draggerlistData);
    } else {
      //Else Empty block statement
    }
  }

  @Watch('propDataList')
  linstenPropDataListt(v: any, oldVal) {
    this.draggerlistData = v;
    this.changeDraggerlistData(this.draggerlistData);
  }

  /* 监听li的数据变化 */
  @Watch('draggerlistData')
  linsteningdraggerlistData(v: any, oldVal) {
    // 查询条件-发生改变时更新store
    if (this.fieldBlock === 0) {
      this.mutationPayloadOptions(v);
      if (this.clientType === 'PC') {
        // 只有PC端新增查询条件才出现提示
        const showPop = v.length === 0;
        this.setFilterTipsFlag(showPop);
      }
      // 展示字段-发生改变时更新store
    } else if (this.fieldBlock === 1) {
      this.mutationShowFieldArray(v);
      // 列表操作-发生改变时更新store
    } else if (this.fieldBlock === 3) {
      this.mutationOperationArray(v);
    } else {
      this.mutationSortArray(v);
    }
  }

  @Watch('canShowDatas')
  linstenCanShowDatas(v: any, oldVal: any[]) {
    v.forEach((el) => {
      if (oldVal.every((item) => item.code !== el.code)) {
        this.defaultValue(el);
      }
    });
    this.draggerlistData = v;
  }

  defaultValue(el) {
    if (
      [
        renderer.FormControlType.StaffSelector,
        renderer.FormControlType.StaffMultiSelector,
        renderer.FormControlType.DepartmentSelector,
        renderer.FormControlType.DepartmentMultiSelector,
        renderer.FormControlType.StaffDeptMixed,
      ].includes(el.propertyType)
    ) {
      el.data.defaultValue = 0;
      el.defaultValue = 0;
    } else if ([10].includes(el.propertyType)) {
      el.data.defaultValue = '';
      el.defaultValue = '';
      el.filterType = 'Like';
    } else {
      //Else Empty block statement
    }
  }

  created() {
    // this.draggerlistData;
    this.fblock = this.fieldBlock;
    // this.showFieldsList = this.propDataList;
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.ant-popover-inner-content {
  .bottom-bolck {
    .btn {
      float: right;
      margin-right: 12px;
    }
  }
  min-width: 360px;
  a {
    color: #111218;
  }
  a:hover {
    color: #111218;
  }
}
.design-wrapper {
  .each-title {
    font-size: 13px;
    color: #111218;
    line-height: 18px;
    margin-left: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
  }
}
//气泡title
.ant-popover-title,
.ant-popover-arrow {
  display: none;
}
.design-wrapper .list-box li.section-bar {
  flex-wrap: wrap;
  padding: 0 12px 0 20px;
  &.hoverClass {
    background: @sub-bg-color !important;
  }

  &.nobackground {
    background: #fff !important;
    &:hover {
      background: @sub-bg-color !important;
      cursor: move;
    }
  }
  &:hover {
    background: @sub-bg-color !important;
    cursor: move;
  }

  .icons {
    color: rgba(17, 18, 24, 0.5);
    &:hover {
      color: @primary-color;
    }

    &.settings {
      transform: rotate(30deg);
    }

    i {
      font-size: 14px;
    }
  }
}
.queryPopover-modal {
  display: block;
  .popover-wrap {
    max-height: 392px;
    .row-wrap {
      max-height: 168px;
      overflow-y: auto;
    }
  }
}
.btn-group-fixed {
  position: absolute;
  left: 0;
  bottom: 10px;
  width: 100%;
  height: 54px;
  padding-top: 11px;
  padding-right: 20px;
  background-color: #fff;
}

.list-box {
  overflow: hidden;
  /deep/.ghostClass {
    opacity: 1;
    background-color: #fff;
    // border: 1px dashed red;
    &.section-bar {
      border: 1px dashed @primary-color;
      background: #fff !important;
    }

    * {
      opacity: 0;
    }
  }
  /deep/.dragClass {
    opacity: 1 !important;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.1);
  }
  .bar-title {
    font-family: unset;
  }
}
.list-fade-enter-active,
.list-fade-leave-active {
  max-height: 100rem;
  // transition: all 3s ease;
  transition: all 0.15s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
}

.list-fade-enter,
.list-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.design-wrapper .list-box li {
  position: relative;
  ul li {
    padding-left: 0;
  }
}
.caret-r {
  color: rgba(17, 18, 24, 0.5);
  font-size: 10px;
  cursor: pointer;
  position: absolute;
  left: 5px;
  top: 10px;
}

.child-ul {
  display: block;
  width: calc(100% + 10px);
  margin-left: -10px;
  text-indent: 1.5em;
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="cbl_list">
    <template v-if="typeOpen">
      <div class="cbl_listHeader">
        <p class="cbl_listHeaderL">自定义按钮</p>
        <p
          class="cbl_listHeaderR"
          :class="[isHistory ? 'disabled' : '']"
          @click="add"
        >
          添加自定义按钮
        </p>
      </div>

      <draggable
        :options="dragOptions"
        :disabled="$route.path.includes('apps/versionDetail/')"
        handle=".handles"
        @update="datadragEnd"
      >
        <div
          v-for="(item, index) in customButtonList"
          :key="index"
          class="cbl_listCon"
        >
          <div class="cbl_listConL">
            <div class="handles">
              <span class="icon aufontAll">&#xe63e;</span>
            </div>
            <p>{{ item.name }}</p>
          </div>
          <div class="cbl_listConR">
            <a-icon
              type="edit"
              class="cbl_listConREdit"
              @click="editData(index)"
            />
            <a-popconfirm
              v-if="!isHistory"
              title="确定要删除按钮吗？"
              :okText="popconfirmBtn.yes"
              :cancelText="popconfirmBtn.no"
              overlayClassName="customPop"
              @confirm="deleteData(index)"
            >
              <a-icon type="delete" class="cbl_listConRDelete" />
            </a-popconfirm>
            <a-icon
              v-else
              type="delete"
              class="cbl_listConRDelete disabled-icon"
            />
          </div>
        </div>
      </draggable>
    </template>
    <template v-else>
      <a-collapse v-model="activeCollapse">
        <!-- 控件事件 -->
        <a-collapse-panel key="1" header="自定义按钮">
          <draggable
            :options="dragOptions"
            handle=".handles"
            @update="datadragEnd"
          >
            <div
              v-for="(item, index) in customButtonList"
              :key="index"
              class="cbl_listCon"
            >
              <div class="cbl_listConL">
                <div class="handles">
                  <span class="icon aufontAll">&#xe63e;</span>
                </div>
                <p>{{ item.name }}</p>
                <span
                  v-if="item.addviewType !== 'FORM'"
                  class="cbl_listConLTY"
                  >{{
                    item.useLocation === 'LIST' ? '列表按钮' : '行按钮'
                  }}</span>
              </div>
              <div class="cbl_listConR">
                <a-icon
                  type="edit"
                  class="cbl_listConREdit"
                  @click="editData(index)"
                />
                <a-popconfirm
                  title="确定要删除按钮吗？"
                  :okText="popconfirmBtn.yes"
                  :cancelText="popconfirmBtn.no"
                  overlayClassName="customPop"
                  @confirm="deleteData(index)"
                >
                  <a-icon type="delete" class="cbl_listConRDelete" />
                </a-popconfirm>
              </div>
            </div>
          </draggable>
        </a-collapse-panel>
      </a-collapse>
      <span class="collapseBtn" @click="add">添加自定义按钮</span>
    </template>

    <a-modal
      :visible="visibleOpen"
      width="850px"
      :title="editDataValue ? btnName.edit : btnName.add"
      :footer="null"
      :centered="true"
      dialogClass="customModal"
      :destroyOnClose="true"
      @cancel="onCloseInfoModal"
    >
      <custom-button-modal
        :addviewType="addviewType"
        :editDataValue="editDataValue"
        @onClosest="onCloseInfoModal"
        @customButton="customButtonFun"
      />
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  Table,
  Pagination,
  Drawer,
  Icon,
  Collapse,
  Modal,
  Popconfirm,
} from '@h3/antd-vue';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import CustomButtonModal from './custom-button-modal.vue';
import Draggable from 'vuedraggable';
import { namespace } from 'vuex-class';

const DataModelModule = namespace('Apps/DataModel');

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'CustomButtonList',
  components: {
    ATable: Table,
    APagination: Pagination,
    ADrawer: Drawer,
    CustomButtonModal: CustomButtonModal,
    Draggable,
    AIcon: Icon,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AModal: Modal,
    APopconfirm: Popconfirm,
  },
})
export default class CustomButtonList extends Vue {
  @DataModelModule.State('DatacustomButton') DatacustomButton: any;

  @DataModelModule.Mutation('setDatacustomButton') setDatacustomButton: any;

  @DataModelModule.Mutation('setCustomButtonEdit') setCustomButtonEdit: any;

  @ListdesignModule.Mutation('onEdit') onEdit: any;

  @Prop({ default: true }) typeOpen!: boolean;

  @Prop({ default: 'Form' }) addviewType: string; //新增的类型

  customButtonList: any = []; //自定义按钮列表

  customButtonListPX: any = []; //用于排序

  editDataValue: any = {}; //修改时传入弹窗的数据

  activeCollapse: any = 1;

  dragOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    forceFallback: true,
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 100,
  };

  visibleOpen: boolean = false;

  watchOpen: boolean = true;

  popconfirmBtn: any = {
    no: '取消',
    yes: '确定',
  };

  btnName: any = {
    add: '新建按钮',
    edit: '编辑按钮',
  };

  @Watch('DatacustomButton', { deep: true })
  customChange(v: any, ov: any) {
    if (this.watchOpen) {
      this.customButtonList =
        this.addviewType === 'Form'
          ? this.DatacustomButton.FormData
            ? this.DatacustomButton.FormData
            : []
          : this.DatacustomButton.ViewData
          ? this.DatacustomButton.ViewData
          : [];
      this.customButtonListPX = JSON.parse(
        JSON.stringify(this.customButtonList),
      );
      // if (this.addviewType === 'Form' && this.DatacustomButton.FormData) {
      //   this.watchOpen = false;
      // } else if (
      //   this.addviewType === 'View' &&
      //   this.DatacustomButton.ViewData
      // ) {
      // this.watchOpen = false;
      // }
    }
  }

  onChange(pageNumber: number) {
    console.log('Page: ', pageNumber);
  }

  //点击确定按钮
  customButtonFun(val: any) {
    if (val) {
      if (this.editDataValue) {
        for (let i = 0; i < this.customButtonList.length; i++) {
          if (this.customButtonList[i].code === this.editDataValue.code) {
            if (val.useLocation === 'ROW') {
              let count = 0;
              for (let y = 0; y < this.customButtonList.length; y++) {
                if (this.customButtonList[y].code === this.editDataValue.code) {
                  continue;
                }
                if (this.customButtonList[y].useLocation === 'ROW') {
                  count++;
                }
              }
              if (count >= 5) {
                this.$message.error('行按钮不能超过5个');
                break;
              }
            }
            this.customButtonList[i] = val;
            for (let s = 0; s < this.customButtonListPX.length; s++) {
              if (this.customButtonListPX[s].code === this.editDataValue.code) {
                this.customButtonListPX[s] = Object.assign({}, val);
              }
            }
            break;
          }
        }
      } else {
        let counts = 0;
        for (let y = 0; y < this.customButtonList.length; y++) {
          if (this.customButtonList[y].code === val.code) {
            this.$message.error('按钮编码不能重复');
            return;
          }
          if (this.customButtonList[y].useLocation === 'ROW') {
            counts++;
          }
        }
        if (counts >= 5 && val.useLocation === 'ROW') {
          this.$message.error('行按钮不能超过5个');
          return;
        }
        this.customButtonList.push(val);
        this.customButtonListPX.push(val);
      }
    }
    this.setDatacustomButton(this.customButtonListPX);
    this.watchOpen = false;
    if (this.addviewType !== 'Form') {
      this.onEdit(true);
    }
    this.setCustomButtonEdit(true);
    setTimeout(() => {
      this.watchOpen = true;
    }, 500);
    this.visibleOpen = false;
  }

  // 关闭弹框
  onCloseInfoModal() {
    this.visibleOpen = false;
  }

  add() {
    this.editDataValue = null;
    this.visibleOpen = true;
  }

  datadragEnd(evt: any) {
    console.log(evt.oldIndex, '前');
    console.log(evt.newIndex, '后');
    const consX: any = this.customButtonListPX[evt.oldIndex];
    this.customButtonListPX.splice(evt.oldIndex, 1);
    this.customButtonListPX.splice(evt.newIndex, 0, consX);
    this.setDatacustomButton(this.customButtonListPX);
    this.watchOpen = false;
    setTimeout(() => {
      this.watchOpen = true;
    }, 500);
  }

  //删除
  deleteData(index: number) {
    const cons: any = this.customButtonList[index];
    let ind: number;
    for (let i = 0; i < this.customButtonListPX.length; i++) {
      if (cons.code === this.customButtonListPX[i].code) {
        ind = i;
      }
    }
    this.customButtonListPX.splice(ind, 1);
    this.customButtonList.splice(index, 1);
    this.setDatacustomButton(this.customButtonListPX);
    this.watchOpen = false;
    if (this.addviewType !== 'Form') {
      this.onEdit(true);
    }
    this.setCustomButtonEdit(true);
    setTimeout(() => {
      this.watchOpen = true;
    }, 500);
    // this.$message.success('删除按钮成功');
  }

  editData(index: number) {
    this.editDataValue = this.customButtonList[index];
    this.visibleOpen = true;
  }

  get isHistory() {
    return this.$route.path.includes('/apps/versionDetail/');
  }

  mounted() {
    if (this.isHistory) {
      this.add = () => {};
    }
  }
}
</script>
<style lang="less" scoped>
.cbl_list {
  position: relative;
  width: 100%;
  font-size: 13px;
  color: #111218;
  .cbl_listHeader {
    padding: 0 16px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    .cbl_listHeaderL {
      font-weight: bold;
    }
    .cbl_listHeaderR {
      font-size: 14px;
      color: #2970ff;
      cursor: pointer;
      &.disabled {
        cursor: not-allowed;
      }
    }
  }
  .cbl_listCon {
    width: 100%;
    height: 31px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 18px 0 11px;
    cursor: pointer;
    &:hover {
      background-color: #d8d8d84d;
    }
    .cbl_listConL {
      width: 82%;
      display: flex;
      flex-direction: row;
      align-items: center;
      .handles {
        margin-right: 6px;
        font-size: 13px !important;
        color: #8893a7;
        opacity: 0;
        cursor: move;
      }
      .cbl_listConLTY {
        color: #bfbfc1;
        margin-left: 8px;
      }
      p {
        max-width: 55%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .disabled-icon:hover {
      cursor: not-allowed;
    }
    &:hover .handles {
      opacity: 1;
    }
    .cbl_listConR {
      color: #8893a7;
      .cbl_listConREdit {
        margin-right: 11px;
      }
      .cbl_listConREdit:hover,
      .cbl_listConRDelete:hover {
        color: #2970ff;
      }
    }
  }
  /deep/.ant-collapse-header {
    font-size: 13px !important;
  }
  .collapseBtn {
    position: absolute;
    right: 16px;
    top: 9px;
    color: #2970ff;
    font-size: 14px;
    cursor: pointer;
  }
}
</style>
<style lang="less">
.customPop {
  .ant-popover-inner-content {
    padding: 12px 16px !important;
  }
}
</style>

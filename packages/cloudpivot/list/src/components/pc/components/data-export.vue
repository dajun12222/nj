<template>
  <div>
    <a-modal
      v-model="showModal"
      :cancelText="$t('cloudpivot.list.pc.Cancel')"
      :maskClosable="false"
      :okText="$t('cloudpivot.list.pc.startExport')"
      :width="866"
      centered
      wrapClassName="data-export"
      @cancel="closeModel"
    >
      <template slot="title">
        <h3 class="modal-title">
          {{ $t('cloudpivot.list.pc.exportData') }}
        </h3>
      </template>
      <div class="data-box">
        <div class="data-left">
          <div class="data-left-top">
            <!-- <div class="check-all">
              <a-checkbox
                :checked="isCheckedAll"
                class="checkbox"
                @click="selectAll"
              />
              <span class="left">{{ $t('cloudpivot.list.pc.checkAll1') }}</span>
            </div> -->
            <div class="choose-wrap">
              <a-dropdown
                v-model="menuVisible"
                :overlayClassName="'a-dropdown'"
                placement="bottomLeft"
              >
                <span class="choose-type">
                  {{ chooseTypeString }}
                  <a-icon type="down" />
                </span>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a href="javascript:;" @click.stop="chooseCurType(0)">
                        {{ $t('cloudpivot.list.pc.selectAllItem') }}
                      </a>
                    </a-menu-item>
                    <a-menu-item>
                      <a href="javascript:;" @click.stop="chooseCurType(1)">
                        {{ $t('cloudpivot.list.pc.listItems') }}
                      </a>
                    </a-menu-item>
                    <a-menu-item>
                      <a href="javascript:;" @click.stop="chooseCurType(2)">
                        {{ $t('cloudpivot.list.pc.lastItems') }}
                      </a>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
            <div class="data-left-search">
              <InputSearch
                v-model="field"
                :placeholder="$t('cloudpivot.list.pc.placeInputSearch')"
                :allowClear="true"
                :isAsync="true"
              />
            </div>
          </div>
          <div class="data-left-list">
            <div class="data-list">
              <div class="data-list-sub-title">
                {{ $t('cloudpivot.list.pc.mainTableField') }}
              </div>
              <div class="sub-check-all">
                <a-checkbox
                  class="checkbox"
                  :checked="mainDataSelected"
                  @click="onSelectChange(mainDataItemList, 'main')"
                />
                <span class="left">{{
                  $t('cloudpivot.list.pc.checkAll')
                }}</span>
              </div>
              <div
                v-for="(i, index) in filterMainData"
                :key="index"
                class="check-item"
              >
                <a-checkbox
                  :checked="i.selected"
                  class="checkbox"
                  @click="onSelectChange(i)"
                />
                <span class="left">{{
                  isChinese
                    ? i.name_i18n
                      ? (typeof i.name_i18n === 'string'
                          ? JSON.parse(i.name_i18n).zh
                          : i.name_i18n.zh) || i.name
                      : i.name
                    : i.name_i18n
                    ? (typeof i.name_i18n === 'string'
                        ? JSON.parse(i.name_i18n).en
                        : i.name_i18n.en) || i.name
                    : i.name
                }}</span>
              </div>

              <!-- 子表数据项 -->
              <div
                v-for="data in filterChildDataItemList"
                :key="data.code"
                class="sub-item"
              >
                <div class="data-list-sub-title">
                  {{
                    isChinese
                      ? data.name_i18n
                        ? (typeof data.name_i18n === 'string'
                            ? JSON.parse(data.name_i18n).zh
                            : data.name_i18n.zh) || data.name
                        : data.name
                      : data.name_i18n
                      ? (typeof data.name_i18n === 'string'
                          ? JSON.parse(data.name_i18n).en
                          : data.name_i18n.en) || data.name
                      : data.name
                  }}
                </div>
                <div class="sub-check-all">
                  <a-checkbox
                    :checked="data.selected"
                    class="checkbox"
                    @click="onSubSelectChange(data)"
                  />
                  <span class="left">{{
                    $t('cloudpivot.list.pc.checkAll')
                  }}</span>
                </div>
                <div class="sub-item-content">
                  <template v-for="sub in data.subSchema.properties">
                    <div
                      v-if="
                        !sub.defaultProperty &&
                        !dataItemTypeArr.includes(sub.propertyType) &&
                        sub.published &&
                        !field
                      "
                      :key="sub.code"
                      class="sub-item-child"
                    >
                      <a-checkbox
                        :checked="sub.selected"
                        class="checkbox"
                        @click="onSubItemSelectChange(data, sub)"
                      />
                      <span class="left">{{
                        isChinese
                          ? sub.name_i18n
                            ? (typeof sub.name_i18n === 'string'
                                ? JSON.parse(sub.name_i18n).zh
                                : sub.name_i18n.zh) || sub.name
                            : sub.name
                          : sub.name_i18n
                          ? (typeof sub.name_i18n === 'string'
                              ? JSON.parse(sub.name_i18n).en
                              : sub.name_i18n.en) || sub.name
                          : sub.name
                      }}</span>
                    </div>
                  </template>
                  <template v-for="sub in data.subSchema.tempList">
                    <div
                      v-if="
                        !sub.defaultProperty &&
                        !dataItemTypeArr.includes(sub.propertyType) &&
                        sub.published &&
                        field
                      "
                      :key="sub.code"
                      class="sub-item-child"
                    >
                      <a-checkbox
                        :checked="sub.selected"
                        class="checkbox"
                        @click="onSubItemSelectChange(data, sub)"
                      />
                      <span class="left">{{
                        isChinese
                          ? sub.name_i18n
                            ? (typeof sub.name_i18n === 'string'
                                ? JSON.parse(sub.name_i18n).zh
                                : sub.name_i18n.zh) || sub.name
                            : sub.name
                          : sub.name_i18n
                          ? (typeof sub.name_i18n === 'string'
                              ? JSON.parse(sub.name_i18n).en
                              : sub.name_i18n.en) || sub.name
                          : sub.name
                      }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="data-right">
          <div class="data-right-title">
            {{ $t('cloudpivot.list.pc.selectedField') }}：
            <span>
              {{
                $t('cloudpivot.list.pc.numbers', {
                  num: mainSelecteLength + childSelecteLength,
                })
              }}
            </span>
          </div>
          <div class="checked-item-search">
            <InputSearch
              v-model="choose"
              :placeholder="$t('cloudpivot.list.pc.placeInputSearch')"
              :allowClear="true"
              :isAsync="true"
            />
          </div>

          <div class="data-right-items">
            <draggable
              :list="itemSelected"
              :options="dragOptions"
              handle=".handles"
              tag="div"
              chosenClass="chosen"
              ghostClass="ghost"
              @end="onMainEnd"
            >
              <div
                v-for="(item, index) in filterData"
                :key="index"
                class="data-right-list"
                :class="{ sub: item.subSchema && item.selected }"
              >
                <template v-if="!item.subSchema">
                  <div v-if="item.selected" class="data-right-li">
                    <span v-if="!choose" class="icon aufontAll handles">
                      &#xe63e;
                    </span>
                    <span
                      :title="
                        isChinese
                          ? item.name_i18n
                            ? (typeof item.name_i18n === 'string'
                                ? JSON.parse(item.name_i18n).zh
                                : item.name_i18n.zh) || item.name
                            : item.name
                          : item.name_i18n
                          ? (typeof item.name_i18n === 'string'
                              ? JSON.parse(item.name_i18n).en
                              : item.name_i18n.en) || item.name
                          : item.name
                      "
                      >{{
                        isChinese
                          ? item.name_i18n
                            ? (typeof item.name_i18n === 'string'
                                ? JSON.parse(item.name_i18n).zh
                                : item.name_i18n.zh) || item.name
                            : item.name
                          : item.name_i18n
                          ? (typeof item.name_i18n === 'string'
                              ? JSON.parse(item.name_i18n).en
                              : item.name_i18n.en) || item.name
                          : item.name
                      }}</span>
                    <i
                      class="icon aufontAll h-icon-all-close"
                      @click="deleteList(item)"
                    ></i>
                  </div>
                </template>
                <template v-else-if="item.selected">
                  <div class="data-right-li">
                    <span
                      :title="
                        isChinese
                          ? item.name_i18n
                            ? (typeof item.name_i18n === 'string'
                                ? JSON.parse(item.name_i18n).zh
                                : item.name_i18n.zh) || item.name
                            : item.name
                          : item.name_i18n
                          ? (typeof item.name_i18n === 'string'
                              ? JSON.parse(item.name_i18n).en
                              : item.name_i18n.en) || item.name
                          : item.name
                      "
                      :class="{ handles: !choose, title: true }"
                      >{{
                        isChinese
                          ? item.name_i18n
                            ? (typeof item.name_i18n === 'string'
                                ? JSON.parse(item.name_i18n).zh
                                : item.name_i18n.zh) || item.name
                            : item.name
                          : item.name_i18n
                          ? (typeof item.name_i18n === 'string'
                              ? JSON.parse(item.name_i18n).en
                              : item.name_i18n.en) || item.name
                          : item.name
                      }}</span>
                  </div>
                  <draggable
                    :list="item.subSchema.properties"
                    :options="dragOptions"
                    handle=".handlesSub"
                    class="subDraggable"
                    chosenClass="chosen"
                    ghostClass="ghost"
                    tag="div"
                    @end="onSubEnd($event, item)"
                  >
                    <template v-for="sub in item.subSchema.properties">
                      <div
                        v-if="
                          !sub.defaultProperty &&
                          !dataItemTypeArr.includes(sub.propertyType) &&
                          sub.published &&
                          !choose &&
                          sub.selected
                        "
                        :key="sub.code"
                        :class="
                          !sub.defaultProperty &&
                          !dataItemTypeArr.includes(sub.propertyType) &&
                          sub.published &&
                          sub.selected
                            ? 'data-right-li title'
                            : ''
                        "
                      >
                        <span class="icon aufontAll handles handlesSub">
                          &#xe63e;
                        </span>
                        <span>{{
                          isChinese
                            ? sub.name_i18n
                              ? (typeof sub.name_i18n === 'string'
                                  ? JSON.parse(sub.name_i18n).zh
                                  : sub.name_i18n.zh) || sub.name
                              : sub.name
                            : sub.name_i18n
                            ? (typeof sub.name_i18n === 'string'
                                ? JSON.parse(sub.name_i18n).en
                                : sub.name_i18n.en) || sub.name
                            : sub.name
                        }}</span>
                        <i
                          class="icon aufontAll h-icon-all-close"
                          @click="deleteList(sub, item)"
                        ></i>
                      </div>
                    </template>
                  </draggable>
                  <!--搜索出来的结果不用排序-->
                  <template v-for="sub in item.subSchema.tempList">
                    <div
                      v-if="
                        !sub.defaultProperty &&
                        !dataItemTypeArr.includes(sub.propertyType) &&
                        sub.published &&
                        choose &&
                        sub.selected
                      "
                      :key="sub.code"
                      :class="
                        !sub.defaultProperty &&
                        !dataItemTypeArr.includes(sub.propertyType) &&
                        sub.published &&
                        sub.selected
                          ? 'data-right-li'
                          : ''
                      "
                    >
                      <span>{{
                        isChinese
                          ? sub.name_i18n
                            ? (typeof sub.name_i18n === 'string'
                                ? JSON.parse(sub.name_i18n).zh
                                : sub.name_i18n.zh) || sub.name
                            : sub.name
                          : sub.name_i18n
                          ? (typeof sub.name_i18n === 'string'
                              ? JSON.parse(sub.name_i18n).en
                              : sub.name_i18n.en) || sub.name
                          : sub.name
                      }}</span>
                      <i
                        class="icon aufontAll h-icon-all-close"
                        @click="deleteList(sub, item)"
                      ></i>
                    </div>
                  </template>
                </template>
              </div>
            </draggable>
          </div>
        </div>
      </div>
      <div slot="footer" class="h3-organization-footer">
        <div>
          <a-button type="default" @click="closeModel">
            {{ $t('cloudpivot.list.pc.Cancel') }}
          </a-button>
          <a-button type="primary" @click="submit">
            {{ $t('cloudpivot.list.pc.export') }}
          </a-button>
        </div>
        <div class="import-text" @click="handleShowList">
          {{ $t('cloudpivot.list.pc.exportRecord') }}
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model="showUpload"
      :maskClosable="false"
      :width="777"
      :title="$t('cloudpivot.list.pc.exporting')"
      centered
      wrapClassName="data-export-ing"
      @cancel="handleCloseUpload"
    >
      <div class="data-export-box">
        <div v-if="currentTaskData.name" class="data-export-undone">
          <h2>{{ $t('cloudpivot.list.pc.unfinished') }}</h2>
          <div class="data-export-li">
            <div class="left">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#h-icon-all-excel1" />
              </svg>
              <div class="data-export-tex">
                <h4>{{ currentTaskData.name }}</h4>
                <span class="size">{{ currentTaskData.size || '--' }}</span>
              </div>
            </div>
            <div class="right">
              <a-progress
                v-if="currentTaskData.status !== 'fail'"
                strokeColor="#2970FF"
                type="circle"
                :percent="percent"
                :width="48"
              />
              <template v-else>
                <i
                  class="icon aufontAll h-icon-all-reload-o"
                  :title="$t('cloudpivot.list.pc.reExport')"
                  @click="submit"
                ></i>
              </template>
            </div>
          </div>
        </div>

        <div class="data-export-complete">
          <h2>{{ $t('cloudpivot.list.pc.finished') }}</h2>
          <div
            v-for="(item, index) in exportTaskLists"
            :key="index"
            class="data-export-li"
          >
            <div class="left">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#h-icon-all-excel1" />
              </svg>
              <div class="data-export-tex">
                <h4>{{ item.refId || '--' }}</h4>
                <span class="size">{{ item.fileSize || '--' }}</span>
              </div>
            </div>
            <div class="right">
              <i
                class="icon aufontAll h-icon-all-delete-o1"
                :title="$t('cloudpivot.list.pc.Delete')"
                @click="deleteRecord(item.id)"
              ></i>
              <i
                class="icon aufontAll h-icon-all-download"
                :title="$t('cloudpivot.list.pc.download')"
                @click="downLoadExportFile(item.id)"
              ></i>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer" class="h3-organization-footer">
        <div>
          <a-button
            v-if="!currentTaskData.name"
            type="primary"
            @click="showUpload = false"
          >
            {{ $t('cloudpivot.list.pc.complete') }}
          </a-button>
        </div>
        <div class="import-text" @click="handleShowList">
          {{ $t('cloudpivot.list.pc.exportRecord') }}
        </div>
      </div>

      <!-- <div class="uploading-content">
        <img src="./model-table-import/import-status.svg" />
        <div>文件正在生成中，请稍候...</div>
        <div>
          关闭弹窗后不会自动下载，需前往<a
            @click="handleShowList"
            style="text-decoration: underline"
            >导出任务列表</a
          >手动下载文件
        </div>
      </div> -->
    </a-modal>
    <a-modal
      v-model="showList"
      :cancelText="$t('cloudpivot.list.pc.Cancel')"
      :maskClosable="false"
      :okText="$t('cloudpivot.list.pc.OK')"
      :width="850"
      :title="$t('cloudpivot.list.pc.exportRecord')"
      :zIndex="2000"
      centered
      :footer="null"
      :bodyStyle="{
        height: '576px',
      }"
      @cancel="closeModelList"
      @ok="closeModelList"
    >
      <export-task-list
        :showList="showList"
        @downLoadExportFile="downLoadExportFile"
      />
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  Checkbox,
  Icon,
  Modal,
  notification,
  Dropdown,
  Button,
  Menu,
  Input,
  Progress,
} from '@h3/antd-vue';
import { ConfigType } from '@h3/antd-vue/types/message';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { listApi } from '../../../../../api';
import ExportTaskList from './exportTaskList.vue';
import MessageExport from './messageExport.vue';
import cloneDeep from 'lodash/cloneDeep';
import Draggable from 'vuedraggable';
import zhToEn from '../locales/zhToEn';
import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');
@Component({
  name: 'data-export',
  components: {
    AModal: Modal,
    ACheckbox: Checkbox,
    AIcon: Icon,
    ADropdown: Dropdown,
    AButton: Button,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AProgress: Progress,
    AInput: Input,
    InputSearch,
    ExportTaskList,
    Draggable,
  },
})
export default class DataExport extends Vue {
  @WorkflowCenterModule.State('applicationPageTitle') applicationPageTitle: any;

  @WorkflowCenterModule.State('applicationPageTitleI18n')
  applicationPageTitleI18n: any;

  @WorkflowCenterModule.State('dataItemList') dataItemList: any;

  @WorkflowCenterModule.Mutation('setImportIcon') setImportIcon: any;

  @Prop() value!: boolean;

  @Prop() queryColumns!: any;

  @Prop() exportFileId!: string;

  @Prop() extend1!: string;

  @Prop({ default: 'import' }) type!: string;

  @Prop() code!: string;

  chooseType: number = 0; //选择字段类型

  showModal: boolean = false; // 弹窗显隐

  checkAll: boolean = false; // 全选按钮

  dataItemTypeArr: any = [6, 7];

  mainDataItemList: any = []; // 主表数据项列表（除子表外）

  childDataItemList: any = []; // 子表数据项列表

  interval: any = null;

  showUpload: boolean = false;

  showList: boolean = false;

  isComplete: boolean = false;

  chooseList: any[] = []; //已选择数据

  field: string = ''; //左侧数据筛选文本

  choose: string = ''; //右侧数据筛选文本

  mainList: any[] = []; //右侧总列表数据

  percent: number = 30;

  subData: any[] = [];

  exportTaskLists: any[] = []; //导出列表

  currentTaskData: any = {
    name: '',
    size: '',
    status: '',
  }; //开始导出数据

  //经过排序了的字段数组，是初始数据的深度拷贝，互不影响
  itemSelected: any[] = [];

  dragOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    forceFallback: true,
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 100,
  };

  get mainDataSelected() {
    return this.mainDataItemList.every((item) => item.selected);
  }

  get mainSelecteLength() {
    return this.mainDataItemList.filter((item) => item.selected).length;
  }

  get childSelecteLength() {
    return this.subData.length;
  }

  get filterMainData() {
    return this.mainDataItemList.filter((item) =>
      item.name.includes(this.field),
    );
  }

  get filterData() {
    if (!this.choose) {
      return this.itemSelected;
    } else {
      return this.itemSelected.filter((item) => {
        if (!item.subSchema) {
          return item.name.includes(this.choose);
        } else {
          if (item.subSchema.properties) {
            item.subSchema.tempList = item.subSchema.properties.filter((el) =>
              el.name.includes(this.choose),
            );
          }
          return (
            item.subSchema.tempList &&
            item.subSchema.tempList.length > 0 &&
            item.subSchema.tempList.some((sub) => sub.selected)
          );
        }
      });
    }
  }

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  get filterChildDataItemList() {
    if (!this.field) {
      return this.childDataItemList;
    }
    return this.childDataItemList.map((item) => {
      if (item.subSchema && item.subSchema.properties) {
        item.subSchema.tempList = item.subSchema.properties.filter((el) =>
          el.name.includes(this.field),
        );
        return item;
      }
    });
  }

  get filterChildDataItemList2() {
    if (!this.choose) {
      return this.childDataItemList;
    }
    return this.childDataItemList.map((item) => {
      if (item.subSchema && item.subSchema.properties) {
        item.subSchema.tempList = item.subSchema.properties.filter((el) =>
          el.name.includes(this.choose),
        );
        return item;
      }
    });
  }

  mounted() {}

  historyInfo: any = {};

  /**
   * 获取上次导出字段
   */
  getHistoryList() {
    const params = {
      type: 'VIEW_EXPORT_QUERY',
      schemaCode: this.$route.query.code,
      queryCode: this.code,
    } as any;
    listApi.getExportHistoryList(params).then((res) => {
      if (res.errcode === 0) {
        console.log(res);
        if (res.data && res.data.length > 0) {
          this.historyInfo = res.data[0];
          this.chooseType = 2;
        } else {
          this.chooseType = 1;
        }
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  /**
   * 删除
   */
  async deleteRecord(id) {
    const res = await listApi.deleteExportTaskList({ id: id });
    const vm = this;
    if (res.errcode === 0) {
      this.$message.success(
        vm.$t('cloudpivot.list.pc.DeleteSuccess') as ConfigType,
      );
      this.getTaskList();
    } else {
      (this as any).$message.error(res.errmsg);
    }
  }

  /**
   * 模拟下载进度
   */
  timer: any = null;

  simulation() {
    this.timer = setInterval(() => {
      this.percent += 5;
      if (this.percent >= 100) {
        clearInterval(this.timer);
      }
    }, 500);
  }

  /**
   * 删除
   */
  deleteList(item, data?) {
    if (data) {
      this.subData = this.subData.filter((el) => el.id !== item.id);
      const sub1 = this.itemSelected.find((el) => el.code === data.code);
      const sub2 = this.childDataItemList.find((el) => el.code === data.code);
      const subItem1 = this.itemSelected
        .find((el) => el.code === data.code)
        .subSchema.properties.find((child) => child.code === item.code);
      const subItem2 = this.childDataItemList
        .find((el) => el.code === data.code)
        .subSchema.properties.find((child) => child.code === item.code);
      this.$set(subItem1, 'selected', false);
      this.$set(subItem2, 'selected', false);
      this.$set(sub2, 'selected', false);
      if (
        !sub1.subSchema.properties.some(
          (el) => el.selected && !el.defaultProperty,
        )
      ) {
        this.$set(sub1, 'selected', false);
      }
    } else {
      const mainItem1 = this.mainDataItemList.find(
        (el) => el.code === item.code,
      );
      const mainItem2 = this.itemSelected.find((el) => el.code === item.code);
      this.$set(mainItem1, 'selected', false);
      this.$set(mainItem2, 'selected', false);
    }
  }

  /**
   * 搜索功能
   */
  rightData: any = {
    mainData: [],
    subData: [],
  };

  handleCloseUpload() {
    this.setImportIcon(true);
    if (!this.isComplete) {
      // notification.destroy();
      // this.$emit("change", false);
      // const config: any = {
      //   message: "文件生成中，请稍候...",
      //   description: "",
      //   duration: 0,
      //   closeIcon: (h) => {
      //     return h("span");
      //   },
      //   icon: (h) => {
      //     return h("a-icon", {
      //       props: {
      //         type: "loading",
      //       },
      //     });
      //   },
      //   class: "export-notification-loading",
      //   placement: "bottomLeft",
      // };
      // notification.open(config);
    }
  }

  getTimer: any = null;

  async getExportProgress() {
    this.simulation();
    const vm = this;
    const res = await listApi.getExportingProgress({ id: this.exportFileId });
    if (res.errcode === 0) {
      this.currentTaskData = {
        name: res.data.refId,
        size: res.data.fileSize,
        status: res.data.taskStatus,
      };

      if (res.data.exportResultStatus) {
        this.isComplete = true;
        if (!this.showUpload) {
          notification.destroy();
          const h: any = this.$createElement;
          const content = h(MessageExport, {
            props: {},
            on: {
              handleUpload: () => {
                this.showList = true;
              },
            },
          });
          notification['success']({
            message: content,
            description: '',
            duration: 5,
            class: 'export-notification',
            placement: 'bottomLeft',
            onClose: () => {
              notification.destroy();
            },
          });
        }
        clearInterval(this.interval);
        this.downLoadExportFile();
        if (this.timer) {
          this.percent = 100;
          clearInterval(this.timer);
        }

        setTimeout(() => {
          clearInterval(this.getTimer);
          this.currentTaskData = {
            name: '',
            size: '',
            status: '',
          };
          this.percent = 0;
          this.getTaskList();
        }, 1500);
      } else {
        //还未下载完毕，继续轮训请求
        if (this.getTimer) {
          this.getTimer = null;
          return;
        }
        this.getTimer = setTimeout(() => {
          this.getExportProgress();
        }, 2500);
      }
    } else {
      this.isComplete = true;
      if (!this.showUpload) {
        notification.destroy();
        notification['error']({
          message: vm.$t('cloudpivot.list.pc.GenerationFailed') as string,
          description: '',
          duration: 3,
          class: 'export-notification',
          placement: 'bottomLeft',
          onClose: () => {
            notification.destroy();
          },
        });
      } else {
        // this.showUpload = false;
      }
      clearInterval(this.interval);
      if (this.timer) {
        clearInterval(this.timer);
        this.currentTaskData = {
          name: '400fc67d-5103-405a-9969-89d760dae9a4.xlsx',
          size: '--',
          status: 'fail',
        };
      }
      // this.$message.error(res.errmsg as string);
    }
  }

  destroyed() {
    clearInterval(this.interval);
  }

  async downLoadExportFile(id?: string) {
    const res: any = await listApi.getExportFile({
      id: id ? id : this.exportFileId,
    });
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel;charset=UTF-8',
    });
    const date = new Date();
    const mounth =
      date.getMonth() > 8 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    const days = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    const hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    const minutes =
      date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
    const seconds =
      date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;

    const fileNameEng = this.applicationPageTitleI18n
      ? typeof this.applicationPageTitleI18n === 'string'
        ? JSON.parse(this.applicationPageTitleI18n).en
        : this.applicationPageTitleI18n.en
      : this.applicationPageTitle;

    const stamp = `${date.getFullYear()}${mounth}${days}${hours}${minutes}${seconds}`;
    const fileName = this.isChinese
      ? `${this.applicationPageTitle}导出${stamp}.xlsx`
      : `${fileNameEng} export ${stamp}.xlsx`;

    const msSaveOrOpenBlob: any = (window.navigator as any).msSaveOrOpenBlob;
    if (msSaveOrOpenBlob) {
      (navigator as any).msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
    this.$message.destroy();
  }

  // 初始化数据列表
  dataMounted(queryColumns: any) {
    console.log(this.dataItemList, '-----------------DATAITEMLIST');
    if (this.dataItemList) {
      const copyList = JSON.parse(JSON.stringify(this.dataItemList));
      this.mainDataItemList = copyList.filter(
        (data: any) =>
          data.code !== 'ownerDeptQueryCode' &&
          data.propertyType !== 8 &&
          !this.dataItemTypeArr.includes(data.propertyType),
      );
      if (
        this.queryColumns.some((item) => item.propertyCode === 'participants_')
      ) {
        this.mainDataItemList = this.mainDataItemList.concat({
          name: '当前处理人',
          code: 'participants_',
          subScheme: null,
          propertyType: 51,
          selected: false,
          name_i18n: {
            en: 'Current Approver',
            zh: '当前处理人',
          },
        });
      }
      this.mainDataItemList.forEach((item) => {
        item.name_i18n = zhToEn[item.name]
          ? { en: zhToEn[item.name] }
          : item.name_i18n
          ? typeof item.name_i18n === 'string'
            ? JSON.parse(item.name_i18n)
            : item.name_i18n
          : null;
      });
      this.childDataItemList = copyList.filter(
        (data: any) => data.propertyType === 8,
      );
    }
    if (Array.isArray(queryColumns)) {
      this.subData = [];
      queryColumns.forEach((c: any) => {
        this.mainDataItemList.forEach((l: any) => {
          //当前处理人默认不勾选
          if (
            c.propertyCode === l.code &&
            !(this.chooseType === 1 && l.code === 'participants_')
          ) {
            this.$set(l, 'selected', true);
            this.$set(l, 'name', c.name);
          }
        });
        this.childDataItemList.forEach((d: any) => {
          if (c.propertyCode === d.code) {
            this.$set(d, 'name', c.name);
            d.subSchema.properties.forEach((s) => {
              if (
                c.childColumns.some((el) => el.propertyCode === s.code) ||
                s.defaultProperty
              ) {
                this.$set(s, 'selected', true);
                if (!s.defaultProperty) {
                  this.$set(
                    s,
                    'name',
                    c.childColumns.find(
                      (child) => child.propertyCode === s.code,
                    ).name,
                  );
                }
              }
              if (
                s.selected &&
                !s.defaultProperty &&
                !this.dataItemTypeArr.includes(s.propertyType) &&
                s.published
              ) {
                this.subData.push(s);
              }
            });

            if (d.subSchema.properties.every((s) => s.selected)) {
              this.$set(d, 'selected', true);
            }
          }
        });
      });
    }
    const dataTemp = cloneDeep(this.mainDataItemList).concat(
      cloneDeep(this.childDataItemList),
    );

    //按上次导出字段排序
    if (this.chooseType === 2) {
      dataTemp
        .filter((data: any) => data.propertyType === 8)
        .forEach((child) => {
          const target = queryColumns.find(
            (item) => item.propertyCode === child.code,
          );
          if (!target) {
            return;
          }
          const childProp = child.subSchema.properties;
          child.subSchema.properties = target.childColumns.map((item) => {
            return child.subSchema.properties.find(
              (el) => el.code === item.propertyCode,
            );
          });
          childProp.forEach((item) => {
            if (
              !child.subSchema.properties.some((el) => el.code === item.code)
            ) {
              child.subSchema.properties.push(item);
            }
          });
        });

      this.itemSelected = this.initSeq(
        cloneDeep(queryColumns)
          .filter((item) =>
            dataTemp.some((el) => item.propertyCode === el.code),
          )
          .map((item) => {
            return dataTemp.find((el) => {
              return item.propertyCode === el.code;
            });
          }),
      );
      this.itemSelected.forEach((item) => {
        if (item.subSchema) {
          item.selected = true;
        }
      });
      dataTemp.forEach((item) => {
        if (!this.itemSelected.some((el) => el.code === item.code)) {
          this.itemSelected.push(item);
        }
      });
    } else {
      this.itemSelected = this.initSeq(dataTemp);
    }
  }

  /**
   * 将拖拽列表中没有选中的数据项全部移动到最后
   */
  initSeq(target) {
    const selected: any[] = [];
    const unSelected: any[] = [];
    target.forEach((item) => {
      if (item.selected) {
        selected.push(item);
      } else {
        unSelected.push(item);
      }
    });
    return selected.concat(unSelected);
  }

  // 主表数据项change
  // onSelectChange(data?: any) {
  //   const dataItemArray = this.mainDataItemList.concat(this.childDataItemList);
  //   dataItemArray.some((d: any, l: number) => {
  //     if (!d.selected) {
  //       this.checkAll = false;
  //       return true;
  //     } else if (d.selected && l === dataItemArray.length - 1) {
  //       this.checkAll = true;
  //       return true;
  //     }
  //     return false;
  //   });
  // }

  onSelectChange(item: any, type?: string) {
    if (type === 'main') {
      const flag = this.mainDataSelected;
      this.mainDataItemList.forEach((el) => {
        this.$set(el, 'selected', !flag);
        this.changeAndMoveToEnd(this.itemSelected, el.code, !flag);
      });
      return;
    }
    this.$set(item, 'selected', !item.selected);
    this.changeAndMoveToEnd(this.itemSelected, item.code, item.selected);
  }

  // 子表数据项change
  onSubItemSelectChange(subTable: any, subTableItem: any) {
    const flag = !subTableItem.selected;
    this.$set(subTableItem, 'selected', flag);

    const subItemList = (
      Array.isArray(subTable.subSchema.properties)
        ? subTable.subSchema.properties
        : []
    ).filter(
      (sub: any) =>
        !sub.defaultProperty &&
        !this.dataItemTypeArr.includes(sub.propertyType),
    );

    const subTableInSelected = this.itemSelected.find(
      (item) => item.code === subTable.code,
    );
    if (
      !subTableInSelected.selected &&
      subItemList.some((sitem: any) => sitem.selected)
    ) {
      this.moveSubTableToEnd(subTable.code);
    }
    this.$set(
      subTableInSelected,
      'selected',
      subItemList.some((sitem: any) => sitem.selected),
    );

    this.$set(
      subTable,
      'selected',
      subItemList.every((sitem: any) => sitem.selected),
    );

    if (flag) {
      this.subData.push(subTableItem);
    } else {
      this.subData = this.subData.filter((el) => el.id !== subTableItem.id);
    }

    this.changeDragSubItem(
      subTable,
      cloneDeep(this.itemSelected.find((item) => item.code === subTable.code)),
    );
  }

  // 子表change
  onSubSelectChange(data: any) {
    const flag = !data.selected;
    this.$set(data, 'selected', flag);
    this.$set(
      this.itemSelected.find((item) => item.code === data.code),
      'selected',
      flag,
    );

    if (Array.isArray(data.subSchema.properties)) {
      data.subSchema.properties.forEach((d: any) => {
        this.$set(d, 'selected', flag);
        if (
          !d.defaultProperty &&
          !this.dataItemTypeArr.includes(d.propertyType) &&
          d.published
        ) {
          if (flag) {
            this.subData.push(d);
          } else {
            this.subData = this.subData.filter((el) => el.id !== d.id);
          }
        }
      });
    }
    this.changeDragSubItem(
      data,
      cloneDeep(this.itemSelected.find((item) => item.code === data.code)),
    );
  }

  /**
   * 在子表选择的数据项发生改变时，对
   * 拖拽数组进行多退少补，在不影响已
   * 有数据的顺序情况下改变数据项的selected
   *
   */
  changeDragSubItem(origin, target) {
    const subData = this.itemSelected.find((item) => item.code === origin.code);
    if (
      origin.subSchema.properties &&
      subData.selected !==
        origin.subSchema.properties.some((item) => item.selected)
    ) {
      this.changeAndMoveToEnd(this.itemSelected, subData.code, origin.selected);
    }
    if (
      Array.isArray(origin.subSchema.properties) &&
      Array.isArray(target.subSchema.properties)
    ) {
      origin.subSchema.properties.forEach((item) => {
        target.subSchema.properties.forEach((el) => {
          if (el.code === item.code && el.selected !== item.selected) {
            this.changeAndMoveToEnd(
              subData.subSchema.properties,
              item.code,
              item.selected,
            );
          }
        });
      });
    }
    this.$forceUpdate();
  }

  get isCheckedAll() {
    return (
      this.mainDataItemList.every((item: any) => item.selected) &&
      this.childDataItemList.every((item: any) => item.selected)
    );
    //
    // item.selected && item.subSchema.properties.every((prop:any)=>prop.selected)
    // ));
  }

  /**
   * 拖拽数据selected
   * 改变时顺带将数据移动到末尾
   */
  changeAndMoveToEnd(target, code, selected) {
    const dragDataIndex = target.findIndex((i) => i.code === code);
    if (selected) {
      const dragData = target.splice(dragDataIndex, 1);
      dragData[0].selected = selected;
      target.push(dragData[0]);
    } else {
      this.$set(target[dragDataIndex], 'selected', selected);
    }
  }

  // 全选
  selectAll() {
    const flag = true;
    this.mainDataItemList.forEach((item: any) => {
      this.$set(item, 'selected', flag);
    });
    this.childDataItemList.forEach((item: any) => {
      this.$set(item, 'selected', flag);
      if (Array.isArray(item.subSchema.properties)) {
        item.subSchema.properties.forEach((d: any) => {
          this.$set(d, 'selected', flag);
          if (flag) {
            //添加
            this.subData.push(d);
          } else {
            //删除
            this.subData = this.subData.filter((el) => el.id !== d.id);
          }
        });
      }
    });
    this.itemSelected = cloneDeep(this.mainDataItemList).concat(
      cloneDeep(this.childDataItemList),
    );
  }

  // 展开收缩子表数据项
  toggle(data: any) {
    const collapsed = !data.collapsed;
    this.$set(data, 'collapsed', collapsed);
  }

  /**
   * 根据展示字段顺序，对导出字段排序
   */
  sortProperty(targetList: Array<any>) {
    // console.log('targetList', targetList);
    // 获取本地缓存的列表列
    const { schemaCode } = this.$route.params;
    const columnsOptsKey: string = `${schemaCode}_columns_options`;
    const columnOpts: any = window.localStorage.getItem(columnsOptsKey);
    let sortedCodes: Array<string> = [];

    if (columnOpts) {
      const _column: any = JSON.parse(columnOpts);
      sortedCodes = _column
        .filter((col: any) => col.isShow)
        .map((col: any) => col.key);
    } else if (Array.isArray(this.queryColumns)) {
      // 无本地缓存时根据展示字段排序
      sortedCodes = this.queryColumns.map((c: any) => c.propertyCode);
    } else {
      //Else Empty block statement
    }

    if (sortedCodes.length) {
      const resultList: Array<any> = [];
      sortedCodes.forEach((code: string) => {
        const item: any = targetList.find(
          (li: any) => li.propertyCode === code,
        );
        if (item) {
          resultList.push(item);
        }
      });
      const tailList: any = targetList.filter(
        (item: any) => !sortedCodes.includes(item.propertyCode),
      );
      resultList.push(...tailList);
      return resultList;
    }

    return targetList;
  }

  // 获取导出字段displayFormat
  getDataDisplayFormat(data: any) {
    if (Array.isArray(this.queryColumns)) {
      data = data.map((d: any) => {
        const item = this.queryColumns.find(
          (c: any) => c.propertyCode === d.propertyCode,
        );
        if (item) {
          d.displayFormat = item.displayFormat;
        } else {
          d.displayFormat = null;
        }
        return d;
      });
    }
    return data;
  }

  //获取已完成列表
  async getTaskList() {
    const params = {
      page: 0,
      size: 10,
    };
    const res = await listApi.getExportTaskList(params);
    if (res.errcode === 0) {
      this.exportTaskLists = res.data.content;

      this.exportTaskLists.forEach((item) => {
        item.fileSize = this.getFileSize(item.fileSize);
      });
    }
  }

  getFileSize(fileSize) {
    let temp: number = 0;
    let unit: string = 'kb';
    if (fileSize < Math.pow(1024, 2)) {
      temp = fileSize / 1024;
      unit = 'KB';
    } else if (fileSize < Math.pow(1024, 3)) {
      temp = fileSize / Math.pow(1024, 2);
      unit = 'MB';
    } else if (fileSize < Math.pow(1024, 4)) {
      temp = fileSize / Math.pow(1024, 3);
      unit = 'GB';
    } else {
      //Else Empty block statement
    }

    if (temp) {
      return temp.toFixed(2) + unit;
    } else {
      return temp;
    }
  }

  // 导出数据
  submit() {
    this.getTaskList();
    const vm = this;
    const finalData = cloneDeep(this.itemSelected);
    finalData
      .filter((item) => item.subSchema)
      .forEach((child: any) => {
        if (Array.isArray(child.subSchema.properties)) {
          const subItemList = child.subSchema.properties.filter(
            (sub: any) =>
              !sub.defaultProperty &&
              !this.dataItemTypeArr.includes(sub.propertyType) &&
              sub.selected,
          );
          if (subItemList.length) {
            child.selected = true;
          }
          child.subSchema.properties = subItemList.map((sub: any) => {
            const back = {
              propertyCode: sub.code,
              name: sub.name,
              name_i18n: sub.name_i18n,
              propertyType: sub.propertyType,
            };
            return back;
          });
        }
      });

    const dataArray = finalData.filter((d: any) => d.selected);

    //将视图设计配置的名称替换原有的名称
    if (this.queryColumns.length > 0 && dataArray.length > 0) {
      for (const con of dataArray) {
        for (const x of this.queryColumns) {
          if (con.code === x.propertyCode) {
            con.name = x.name;
          }
        }
      }
    }

    let returnData = dataArray.map((data: any) => {
      const back = {
        propertyCode: data.code,
        name: data.name,
        propertyType: data.propertyType,
        name_i18n:
          data.name_i18n &&
          (typeof data.name_i18n === 'string'
            ? data.name_i18n
            : JSON.stringify(data.name_i18n)),
        childColumns: data.subSchema
          ? data.subSchema.properties
          : data.subSchema,
      };
      return back;
    });
    returnData = this.getDataDisplayFormat(returnData);
    // returnData = this.sortProperty(returnData);
    console.log('exportdata', returnData);
    //导出未完成初始状态
    this.percent = 30;
    this.currentTaskData = {
      name: vm.$t('cloudpivot.list.pc.FileIsBeingExported') + '...',
      size: '--',
      status: 'progress',
    };
    this.showUpload = true;
    const appendParam = {
      isUpdateExportFields: true,
      userCommonQueryId: this.historyInfo.id || '',
      showParticipant: returnData.some(
        (item) => item.propertyCode === 'participants_',
      ),
    };
    this.$emit('exportEnd', returnData, appendParam);
    this.interval = setInterval(() => {
      this.getExportProgress();
    }, 2000);
    //设置定时任务5分钟;
    // if (this.interval) {
    //   setTimeout(() => {
    //     clearInterval(this.interval);
    //     this.$message.error("连接超时");
    //   }, 300000);
    // }

    // this.closeModel();
  }

  handleShowList() {
    // this.showUpload = false;
    this.showList = true;
  }

  closeModelList() {
    this.showList = false;
    if (!this.showModal) {
      this.$emit('hideShowList');
    }
  }

  closeModel() {
    this.$emit('input', false);
  }

  @Watch('value')
  async onValueChange(v: boolean) {
    this.chooseType = 1;
    this.showModal = v;
    if (v) {
      await this.getHistoryList();
    }
    if (this.type === 'showList') {
      this.showModal = false;
      this.showList = true;
    }
  }

  @Watch('queryColumns', { deep: true, immediate: true })
  onColumnChange(v: any) {
    if (this.chooseType === 1) {
      this.dataMounted(v);
    }
  }

  @Watch('extend1')
  ext(val: any) {
    console.log('extend1', val);
    if (val === 'true' && this.chooseType === 1) {
      this.dataItemTypeArr = [7];
      this.dataMounted(this.queryColumns);
    }
  }

  @Watch('chooseType')
  onChooseTypeChange(newVal) {
    switch (newVal) {
      case 0:
        this.selectAll();
        break;
      case 1:
        this.dataMounted(this.queryColumns);
        break;
      case 2:
        this.dataMounted(JSON.parse(this.historyInfo.queryCondition).columns);
        break;
      default:
        break;
    }
  }

  onMainEnd(event) {
    console.log(event);
  }

  onSubEnd(event, subData) {
    console.log(event);
  }

  menuVisible: boolean = false;

  chooseCurType(value) {
    this.chooseType = value;
    this.menuVisible = false;
  }

  get chooseTypeString() {
    let result = '';
    switch (this.chooseType) {
      case 0:
        result = (this as any)
          .$t('cloudpivot.list.pc.selectAllItem')
          .toString();
        break;
      case 1:
        result = (this as any).$t('cloudpivot.list.pc.listItems').toString();
        break;
      case 2:
        result = (this as any).$t('cloudpivot.list.pc.lastItems').toString();
        break;
      default:
        break;
    }
    return result;
  }

  moveSubTableToEnd(code) {
    const subTableIndex = this.itemSelected.findIndex(
      (item) => item.code === code,
    );
    const target = this.itemSelected.splice(subTableIndex, 1);
    this.itemSelected.push(target[0]);
  }
}
</script>
<style lang="less">
@import './../../../../../application/src/components/pc/style/custom-themes';
.export-notification,
.export-notification-loading {
  padding: 8px 10px;
  /*width: 250px;*/
  max-width: 400px;
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;

  .ant-notification-notice-description {
    display: none;
  }

  .ant-notification-notice-icon {
    font-size: 14px;
    line-height: 28px;
  }

  .ant-notification-close-icon {
    font-size: 12px;
    color: #ffffff;
  }

  .ant-notification-notice-close {
    line-height: 12px;
    top: 13px;
    right: 12px;
  }

  .ant-notification-notice-message {
    font-size: 14px;
    word-break: break-all;
    color: #ffffff;
    margin-bottom: 0;
    margin-left: 24px;
  }
}

.export-notification-loading {
  /*width: 140px;*/
  max-width: 300px;

  .anticon-loading {
    color: #2970ff;
  }

  .ant-notification-notice-message {
    line-height: 28px;
  }

  .ant-notification-notice-close {
    display: none;
  }

  .ant-notification-close-x {
    display: none;
  }
}

.ant-modal-close-x {
  svg {
    display: none;
  }
  height: 54px;
  width: 54px;
  line-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    i {
      color: @highlightColor;
    }
  }
  i {
    width: 16px;
    height: 16px;
    font-family: 'aufontAll' !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: rgba(17, 18, 24, 0.5);
    display: flex;
    align-items: center;
    &::after {
      content: '\e996';
    }
  }
}
.ant-modal-header {
  border-bottom: none;
  .ant-modal-title {
    font-weight: 700;
    color: #111218;
    font-size: 16px;
  }
}
.ant-modal-footer {
  border-top: none;
  padding: 0 24px 24px;
}
.ant-modal-body {
  padding-top: 8px;
}

.ant-table-header-column {
  font-size: 13px;
  font-weight: 600;
  color: #111218;
  line-height: 22px;
}

.text-ellipsis,
.ant-table-row-cell-break-word {
  font-size: 13px;
  font-weight: 400;
  color: #111218;
  line-height: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ant-table-header.ant-table-hide-scrollbar {
  overflow: hidden !important;
}

.ant-table-row-cell-break-word {
  padding: 7px 12px !important;
}
.ant-table-body {
  overflow-y: auto !important;
}

.ant-table-header.ant-table-hide-scrollbar {
  margin-bottom: unset !important;
  height: 36px !important;
  min-height: 36px !important;
}

.data-export {
  .ant-modal-body {
    // max-height: 378px;
    // overflow-y: auto;
    padding: 24px 20px;
    margin: 0 4px;
  }

  .uploading-content {
    text-align: center;
    margin-bottom: 80px;

    img {
      padding: 30px;
    }

    div {
      margin-bottom: 10px;
    }
  }

  .modal-title {
    display: inline-block;
    font-size: 16px;
    font-weight: 700;
    color: #111218;
    margin-bottom: 0;
  }

  .gray {
    font-size: 12px;
    margin-left: 8px;
    color: rgba(0, 0, 0, 0.45);
  }

  .left {
    color: #111218;
    font-size: 14px;
    margin-left: 8px;
    line-height: 22px;
  }

  .data-list {
    overflow: hidden;

    .span {
      color: rgba(0, 0, 0, 0.85);
    }

    .check-item {
      float: left;
      width: calc(25% - 4px);
      min-width: 127px;
      margin-right: 4px;
      margin-top: 14px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .sub-item {
      width: 100%;
      margin-top: 16px;
      float: left;

      .sub-title {
        font-size: 14px;
        font-weight: 400;
        color: #111218;
        margin-left: 5px;
      }

      .line {
        background: #e8e8e8;
        width: 100%;
        height: 1px;
        margin-top: 8px;
      }

      .toggle {
        float: right;
        margin-right: 14px;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.45);

        & > i {
          transform: rotate(180deg);
        }

        & > i.collapsed {
          transform: rotate(0);
        }
      }

      .sub-item-child {
        float: left;
        width: 33%;
        margin-top: 14px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }

  .ant-modal-footer {
    border-top: none;
    padding-top: 0;
  }
  .ant-btn {
    height: 32px;
  }
  .import-text {
    font-size: 14px;
    font-weight: 400;
    color: @highlightColor;
    cursor: pointer;
  }

  .data-right {
    width: 244px;
    height: 100%;
  }

  /**
    新版导出样式
  */
  .data-box {
    width: 100%;
    border-radius: 2px;
    border: 1px solid #dddddd;
    display: flex;
    max-height: 548px;
    height: calc(100vh - 248px);
    overflow-x: auto;
    > .data-left {
      flex: 1;
      height: 100%;
      // min-height: 378px;
      // max-height: calc(100vh - 300px);
      min-width: 400px;
      // overflow-y: scroll;
      padding: 16px 0px 32px;
      .data-left-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px dashed #eeeeee;
        margin: 0 16px;
        padding-bottom: 16px;
        .choose-wrap {
          font-size: 14px;
          font-weight: 600;
          line-height: 22px;
          color: #111218;
          &:hover {
            color: #2970ff;
          }
          .choose-type {
            padding-right: 4px;
          }
          i {
            padding-top: 5px;
            font-weight: normal;
          }
        }
        .check-all {
          .left {
            margin-left: 8px;
            font-size: 14px;
            font-weight: 700;
            color: #111218;
          }
        }
        .data-left-search {
          width: 240px;
          height: 32px;
        }
      }

      .data-left-list {
        padding: 0 10px 0 16px;
        overflow-y: scroll;
        height: calc(100% - 49px);
      }

      .data-list {
        padding-left: 13px;
        .data-list-sub-title {
          font-size: 14px;
          font-weight: 700;
          color: #111218;
          position: relative;
          margin-top: 23px;
          &::before {
            content: '';
            left: -13px;
            top: 6px;
            width: 3px;
            height: 10px;
            background-color: @highlightColor;
            position: absolute;
          }
        }
        .sub-check-all {
          margin-top: 13px;
          .left {
            margin-left: 8px;
            font-size: 14px;
            color: #111218;
            font-weight: 400;
          }
        }
      }
    }
    > .data-right {
      width: 244px;
      height: 100%;
      // min-height: 378px;
      // max-height: calc(100vh - 300px);
      // overflow-y: scroll;
      min-width: 140px;
      padding: 21px 0px 16px 0px;
      border-left: 1px solid #dddddd;
      .data-right-title {
        color: #111218;
        font-size: 14px;
        font-weight: 700;
        padding: 0 16px;
        padding-bottom: 8px;
        margin-bottom: 21px;
        > span {
          font-weight: 400;
        }
      }
      .checked-item-search {
        padding: 0 16px;
        .ant-input-affix-wrapper {
          margin-bottom: 8px;
        }
      }
      // .ant-input-search {
      //   margin-top: 20px;
      // }
      .data-right-items {
        height: calc(100% - 82px);
        padding: 0 0 0 6px;
        overflow-y: scroll;
        .data-right-list {
          &.chosen {
            background: #ffffff;
            box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
            border-radius: 4px;
          }
          &.ghost {
            &::before {
              content: ' ';
              display: block;
              width: 100%;
              height: 1px;
              background: #2970ff;
              position: absolute;
              top: -7px;
              left: 0px;
            }
            position: relative;
            margin-top: 7px;
            background: #ffffff;
            box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
            border-radius: 4px;
          }
          &.sub {
            border-bottom: 1px solid #eeeeee;
            margin-bottom: 8px;
            .data-right-li:hover {
              + div.subDraggable {
                background: #eef4fd;
              }
            }
          }
        }
      }
      .data-right-li {
        font-size: 14px;
        color: #111218;
        display: flex;
        justify-content: space-between;
        height: 36px;
        align-items: center;
        padding: 0 10px;
        &:hover {
          background: #eef4fd;
          i {
            color: @highlightColor;
          }
        }
        &.chosen {
          background: #ffffff;
          box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
          border-radius: 4px;
        }
        &.ghost {
          &::before {
            content: ' ';
            display: block;
            width: 100%;
            height: 1px;
            background: #2970ff;
            position: absolute;
            top: -7px;
            left: 0px;
          }
          position: relative;
          margin-top: 7px;
          background: #ffffff;
          box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
          border-radius: 4px;
        }
        .title {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #111218 !important;
          width: 100% !important;
          padding-top: unset !important;
          &.handles {
            padding-left: 21px;
            &::after {
              content: '\ff08\70b9\51fb\6807\9898\53ef\62d6\62fd\ff09';
              font-size: 12px;
              font-weight: 400;
              color: rgba(17, 18, 24, 0.5);
            }
          }
        }
        .handles {
          color: rgba(17, 18, 24, 0.25);
          padding-top: 1px;
          width: 26px;
          cursor: move;
        }
        span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }
        i {
          color: rgba(17, 18, 24, 0.5);
          font-size: 16px;
          cursor: pointer;
        }
      }
    }
  }
  @media screen and (max-width: 866px) {
    .ant-modal {
      max-width: calc(100vw - 8px) !important;
      margin: unset;
    }
  }
}

/**
  导出中样式
*/
.data-export-ing {
  .ant-modal-body {
    padding: 24px 0;
  }
  .data-export-box {
    max-height: 449px;
    overflow-y: auto;
    padding: 0 24px 0 26px;
  }
  .data-export-complete,
  .data-export-undone {
    margin-bottom: 36px;
    margin-top: 4px;
    > h2 {
      font-size: 14px;
      font-weight: 700;
      color: rgba(17, 18, 24, 0.5);
    }
    .data-export-li {
      height: 76px;
      box-shadow: 0px 1px 0px 0px #eeeeee;
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 15px 0 4px;
      align-items: center;
      .left {
        display: flex;
        flex: 1;
        .icon {
          width: 31px;
          height: 40px;
          margin-right: 16px;
        }
        .data-export-tex {
          > h4 {
            color: #111218;
            font-size: 14px;
            font-weight: 700;
            margin: 0;
          }
          .size {
            font-size: 12px;
            color: rgba(17, 18, 24, 0.5);
            margin-top: 4px;
          }
        }
      }
      .right {
        display: flex;
        align-items: center;
        .icon {
          color: #111218;
          font-size: 20px;
          margin-left: 16px;
          cursor: pointer;
          &.h-icon-all-reload-o {
            font-size: 16px;
          }
        }
      }
    }
  }
  .anticon svg {
    color: #2970ff;
  }

  .import-text {
    font-size: 14px;
    color: @highlightColor;
    line-height: 22px;
  }
}
</style>
<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
/deep/.h3-organization-footer {
  padding: unset !important;
}

/deep/.ant-modal {
  padding: unset;
  min-width: 300px;
  //transform: translate(-50%, -50%);
}
/deep/.ant-modal-content {
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}
/deep/.ant-modal-header {
  border-bottom: none;
  padding: 24px;
  .ant-modal-title {
    height: 24px;
    font-size: 16px;
    font-weight: 600;
    color: #111218;
    line-height: 24px;
  }
}
/deep/.ant-modal-close-x {
  width: 57px;
  height: 72px;
  line-height: 72px;
  svg {
    display: none;
  }
  // height: 54px;
  // width: 54px;
  line-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    i {
      color: @highlightColor;
    }
  }
  i {
    width: 16px;
    height: 16px;
    font-family: 'aufontAll' !important;
    font-size: 17px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: rgba(17, 18, 24, 0.5);
    display: flex;
    align-items: center;
    &::after {
      content: '\e996';
    }
  }
}
/deep/.ant-modal-footer {
  border-top: none;
  padding: 24px;
  .ant-btn {
    height: 32px;
    border-radius: 2px;
    > span {
      height: 22px;
      font-size: 14px;
      color: #111218;
      line-height: 22px;
    }
    &:hover {
      border-color: #5291ff;
      > span {
        color: #5291ff;
      }
    }
    &:active {
      border-color: #2970ff;
      > span {
        color: #2970ff;
      }
    }
    &.ant-btn-primary {
      > span {
        color: rgba(255, 255, 255, 0.9);
      }
      &:hover {
        background: #5291ff;
        border-color: #5291ff;
        > span {
          color: rgba(255, 255, 255, 0.9);
        }
      }
      &:active {
        background: #1852d9;
        border-color: #1852d9;
        > span {
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }
}
/deep/.ant-modal-body {
  padding-top: 0;
  padding-bottom: 0;
}
</style>

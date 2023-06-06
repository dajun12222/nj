<template>
  <div class="sheetMarkings">
    <a-modal
      :visible="visible"
      width="1200px"
      :footer="null"
      :centered="true"
      :destroyOnClose="true"
      dialogClass="sheetMarkingModal"
      :title="sheetTitle"
      @ok="handleOk"
      @cancel="cancel"
    >
      <div class="tableCon tableCon1" :style="{ height: hgt + 'px' }">
        <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
          :scroll="{ x: tableX, y: hgt - 103 }"
          bordered
          @change="tableChange"
        >
          <div
            slot="RelevanceForms"
            slot-scope="record"
            :class="{
              tableItemCon: true,
              rowDeleteBgc: record && record.operationType === 'Deleted',
              rowAddBgc: record && record.operationType === 'Added',
            }"
          >
            <template v-if="record && record !== 'null'">
              <div
                class="gldxText"
                :class="{
                  textAddBgc:
                    record &&
                    (record.edit === 1 || record.operationType === 'Added'),
                  textDeleteBgc:
                    record &&
                    (record.edit === 2 ||
                      record.edit === 3 ||
                      record.operationType === 'Deleted'),
                }"
                @click="
                  RelevanceFormChange(
                    jsonParses(record.edit === 3 ? record.dataX : record.data),
                  )
                "
              >
                <a-tooltip>
                  <template #title>点击查看</template>
                  <span
                    class="textSpan"
                    :title="
                      jsonParses(
                        record.edit === 3 ? record.dataX : record.data,
                      ) &&
                      jsonParses(record.edit === 3 ? record.dataX : record.data)
                        .names
                    "
                  >
                    {{
                      jsonParses(record.edit === 3 ? record.dataX : record.data)
                        ? jsonParses(
                            record.edit === 3 ? record.dataX : record.data,
                          ).names
                        : ''
                    }}</span>
                </a-tooltip>
              </div>
              <template v-if="record && record.edit === 3">
                <div
                  class="gldxText textAddBgc textMT"
                  @click="RelevanceFormChange(jsonParses(record.data))"
                >
                  <a-tooltip>
                    <template #title>点击查看</template>
                    <span
                      class="textSpan"
                      :title="
                        jsonParses(record.data) && jsonParses(record.data).names
                      "
                    >
                      {{
                        jsonParses(record.data)
                          ? jsonParses(record.data).names
                          : ''
                      }}</span>
                  </a-tooltip>
                </div>
              </template>
            </template>
          </div>
          <div
            slot="RelevanceFormExs"
            slot-scope="record"
            :class="{
              tableItemCon: true,
              padding2X: true,
              rowDeleteBgc: record && record.operationType === 'Deleted',
              rowAddBgc: record && record.operationType === 'Added',
            }"
          >
            <template v-if="record && record !== 'null'">
              <div class="gldxTextCon">
                <template
                  v-if="
                    jsonParses(record.edit === 3 ? record.dataX : record.data)
                      .length > 1
                  "
                >
                  <div
                    v-for="(con, indexs) in jsonParses(
                      record.edit === 3 ? record.dataX : record.data,
                    )"
                    :key="indexs"
                    class="gldxText textSpan"
                    style="padding: 4px 0"
                    @click="RelevanceFormChange(con)"
                  >
                    <a-tooltip>
                      <template #title>点击查看</template>
                      <span
                        class="textSpan"
                        :class="{
                          textAddBgc:
                            record &&
                            (record.edit === 1 ||
                              record.operationType === 'Added'),
                          textDeleteBgc:
                            record &&
                            (record.edit === 2 ||
                              record.edit === 3 ||
                              record.operationType === 'Deleted'),
                        }"
                        :title="con.names"
                        >{{
                          indexs + 1 ===
                          jsonParses(
                            record.edit === 3 ? record.dataX : record.data,
                          ).length
                            ? con.names
                            : `${con.names};`
                        }}</span>
                    </a-tooltip>
                  </div>
                </template>
                <template v-else>
                  <div
                    v-for="(con, indexs) in jsonParses(
                      record.edit === 3 ? record.dataX : record.data,
                    )"
                    :key="indexs"
                    class="gldxText textSpan"
                    style="padding: 4px 0"
                    @click="RelevanceFormChange(con)"
                  >
                    <a-tooltip>
                      <template #title>点击查看</template>
                      <span
                        class="textSpan"
                        :class="{
                          textAddBgc:
                            record &&
                            (record.edit === 1 ||
                              record.operationType === 'Added'),
                          textDeleteBgc:
                            record &&
                            (record.edit === 2 ||
                              record.edit === 3 ||
                              record.operationType === 'Deleted'),
                        }"
                        :title="con.names"
                        >{{ con.names }}</span>
                    </a-tooltip>
                  </div>
                </template>
              </div>
              <template v-if="record && record.edit === 3">
                <div class="gldxTextCon">
                  <template v-if="jsonParses(record.data).length > 1">
                    <div
                      v-for="(con, indexs) in jsonParses(record.data)"
                      :key="indexs"
                      class="gldxText textSpan textMTX"
                      @click="RelevanceFormChange(con)"
                    >
                      <a-tooltip>
                        <template #title>点击查看</template>
                        <span class="textSpan textAddBgc" :title="con.names">{{
                          indexs + 1 === jsonParses(record.data).length
                            ? con.names
                            : `${con.names};`
                        }}</span>
                      </a-tooltip>
                    </div>
                  </template>
                  <template v-else>
                    <div
                      v-for="(con, indexs) in jsonParses(record.data)"
                      :key="indexs"
                      class="gldxText textSpan textMTX"
                      @click="RelevanceFormChange(con)"
                    >
                      <a-tooltip>
                        <template #title>点击查看</template>
                        <span class="textSpan textAddBgc" :title="con.names">{{
                          con.names
                        }}</span>
                      </a-tooltip>
                    </div>
                  </template>
                </div>
              </template>
            </template>
          </div>
          <div
            slot="arrData"
            slot-scope="record"
            :class="{
              tableItemCon: true,
              padding2X: true,
              rowDeleteBgc: record && record.operationType === 'Deleted',
              rowAddBgc: record && record.operationType === 'Added',
            }"
          >
            <template v-if="record && record !== 'null'">
              <div class="gldxTextCon">
                <template
                  v-if="
                    (record.edit === 3 ? record.dataX : record.data).length > 1
                  "
                >
                  <div
                    v-for="(con, indexs) in record.edit === 3
                      ? record.dataX
                      : record.data"
                    :key="indexs"
                    class="gldxText textSpan"
                    style="padding: 4px 0"
                  >
                    <span
                      class="textSpan"
                      :class="{
                        textAddBgc:
                          record &&
                          (record.edit === 1 ||
                            record.operationType === 'Added'),
                        textDeleteBgc:
                          record &&
                          (record.edit === 2 ||
                            record.edit === 3 ||
                            record.operationType === 'Deleted'),
                      }"
                      :title="con"
                      >{{
                        indexs + 1 ===
                        (record.edit === 3 ? record.dataX : record.data).length
                          ? con
                          : `${con};`
                      }}</span>
                  </div>
                </template>
                <template v-else>
                  <div
                    v-for="(con, indexs) in record.edit === 3
                      ? record.dataX
                      : record.data"
                    :key="indexs"
                    class="gldxText textSpan"
                    style="padding: 4px 0"
                  >
                    <span
                      class="textSpan"
                      :class="{
                        textAddBgc:
                          record &&
                          (record.edit === 1 ||
                            record.operationType === 'Added'),
                        textDeleteBgc:
                          record &&
                          (record.edit === 2 ||
                            record.edit === 3 ||
                            record.operationType === 'Deleted'),
                      }"
                      :title="con"
                      >{{ con }}</span>
                  </div>
                </template>
              </div>
              <template v-if="record && record.edit === 3">
                <div class="gldxTextCon">
                  <template v-if="record.data.length > 1">
                    <div
                      v-for="(con, indexs) in record.data"
                      :key="indexs"
                      class="gldxText textSpan textMTX"
                    >
                      <span class="textSpan textAddBgc" :title="con">{{
                        indexs + 1 === record.data.length ? con : `${con};`
                      }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div
                      v-for="(con, indexs) in record.data"
                      :key="indexs"
                      class="gldxText textSpan textMTX"
                    >
                      <span class="textSpan textAddBgc" :title="con">{{
                        con
                      }}</span>
                    </div>
                  </template>
                </div>
              </template>
            </template>
          </div>
          <div
            slot="enclosure"
            slot-scope="record"
            :class="{
              tableItemCon: true,
              padding2X: true,
              rowDeleteBgc: record && record.operationType === 'Deleted',
              rowAddBgc: record && record.operationType === 'Added',
            }"
          >
            <template v-if="record && record !== 'null'">
              <div class="attachment-wrapper">
                <template
                  v-for="(atta, attaIdx) in jsonParses(
                    record.edit === 3 ? record.dataX : record.data,
                  )"
                >
                  <div
                    :key="attaIdx"
                    class="textSpan"
                    style="display: inline-block"
                    @mousemove="mousemoveIsImage(atta.isImage)"
                  >
                    <span
                      :key="attaIdx"
                      class="textSpan"
                      style="margin: 4px 0"
                      :class="{
                        textAddBgc:
                          record &&
                          (record.edit === 1 ||
                            record.operationType === 'Added'),
                        textDeleteBgc:
                          record &&
                          (record.edit === 2 ||
                            record.edit === 3 ||
                            record.operationType === 'Deleted'),
                      }"
                      @mouseover="mouseoverFile"
                      @mousemove="mousemoveFile"
                      @mouseleave="mouseleaveFile(atta.url)"
                      >{{ atta.name }}</span>
                  </div>

                  <!-- <a
                  :key="attaIdx"
                  :href="atta.isImage ? 'javascript:void(0)' : atta.url"
                  rel="noopener noreferrer"
                  :title="atta.name"
                >

                </a> -->
                </template>
              </div>
              <template v-if="record && record.edit === 3">
                <div class="attachment-wrapper">
                  <template v-for="(atta, attaIdx) in jsonParses(record.data)">
                    <div
                      :key="attaIdx"
                      class="textSpan"
                      style="display: inline-block"
                      @mousemove="mousemoveIsImage(atta.isImage)"
                    >
                      <span
                        :key="attaIdx"
                        class="textSpan textAddBgc textMTX"
                        @mouseover="mouseoverFile"
                        @mousemove="mousemoveFile"
                        @mouseleave="mouseleaveFile(atta.url)"
                        >{{ atta.name }}</span>
                    </div>
                  </template>
                </div>
              </template>
            </template>
          </div>
          <div
            slot="numData"
            slot-scope="record"
            :class="{
              tableItemCon: true,
              rowDeleteBgc: record && record.operationType === 'Deleted',
              rowAddBgc: record && record.operationType === 'Added',
            }"
          >
            <template v-if="record && record !== 'null'">
              <div class="numDataCon">
                <span
                  class="textSpan"
                  :class="{
                    textAddBgc:
                      record &&
                      (record.edit === 1 || record.operationType === 'Added'),
                    textDeleteBgc:
                      record &&
                      (record.edit === 2 ||
                        record.edit === 3 ||
                        record.operationType === 'Deleted'),
                  }"
                  :title="
                    record.edit === 3
                      ? record.dataX && record.dataX.name
                      : record.data && record.data.name
                  "
                  >{{
                    record.edit === 3
                      ? record.dataX
                        ? record.dataX.name
                        : ''
                      : record.data
                      ? record.data.name
                      : ''
                  }}</span>
              </div>
              <template v-if="record && record.edit === 3">
                <div class="numDataCon textMT">
                  <span
                    class="textSpan textAddBgc"
                    :title="record.data && record.data.name"
                    >{{ record.data ? record.data.name : '' }}</span>
                  <a-icon
                    v-if="record.data && record.data.sizes === 2"
                    type="arrow-up"
                    class="arrow-up"
                  />
                  <a-icon
                    v-if="record.data && record.data.sizes === 1"
                    type="arrow-down"
                    class="arrow-down"
                  />
                </div>
              </template>
            </template>
          </div>
          <div
            slot="addressData"
            slot-scope="record"
            :class="{
              tableItemCon: true,
              rowDeleteBgc: record && record.operationType === 'Deleted',
              rowAddBgc: record && record.operationType === 'Added',
            }"
          >
            <template v-if="record && record !== 'null'">
              <div class="numDataCon">
                <i class="icon aufontAll h-icon-all-get-address-o"></i>
                <span
                  class="textSpan"
                  :class="{
                    textAddBgc:
                      record &&
                      (record.edit === 1 || record.operationType === 'Added'),
                    textDeleteBgc:
                      record &&
                      (record.edit === 2 ||
                        record.edit === 3 ||
                        record.operationType === 'Deleted'),
                  }"
                  :title="
                    jsonParses(
                      record.edit === 3 ? record.dataX : record.data,
                    ) &&
                    jsonParses(record.edit === 3 ? record.dataX : record.data)
                      .name
                  "
                  >{{
                    jsonParses(record.edit === 3 ? record.dataX : record.data)
                      ? jsonParses(
                          record.edit === 3 ? record.dataX : record.data,
                        ).name
                      : ''
                  }}</span>
              </div>
              <template v-if="record && record.edit === 3">
                <div class="numDataCon textMT">
                  <i class="icon aufontAll h-icon-all-get-address-o"></i>
                  <span
                    class="textSpan textAddBgc"
                    :title="
                      jsonParses(record.data) && jsonParses(record.data).name
                    "
                    >{{
                      jsonParses(record.data)
                        ? jsonParses(record.data).name
                        : ''
                    }}</span>
                </div>
              </template>
            </template>
          </div>
          <div
            slot="logicData"
            slot-scope="record"
            :class="{
              tableItemCon: true,
              rowDeleteBgc: record && record.operationType === 'Deleted',
              rowAddBgc: record && record.operationType === 'Added',
            }"
          >
            <template v-if="record && record !== 'null'">
              <span
                class="textSpan"
                :class="{
                  textAddBgc:
                    record &&
                    (record.edit === 1 || record.operationType === 'Added'),
                  textDeleteBgc:
                    record &&
                    (record.edit === 2 ||
                      record.edit === 3 ||
                      record.operationType === 'Deleted'),
                }"
                :style="{ width: '14px' }"
              >
                {{
                  record.edit === 3
                    ? record.dataX === 'true'
                      ? '是'
                      : '否'
                    : record.data === 'true'
                    ? '是'
                    : '否'
                }}
              </span>
              <template v-if="record && record.edit === 3">
                <span
                  class="textSpan textAddBgc textMT"
                  :style="{ width: '14px' }"
                >
                  {{ record.data === 'true' ? '是' : '否' }}
                </span>
              </template>
            </template>
          </div>
          <div
            slot="PTData"
            slot-scope="record"
            :class="{
              tableItemCon: true,
              rowDeleteBgc: record && record.operationType === 'Deleted',
              rowAddBgc: record && record.operationType === 'Added',
            }"
          >
            <template v-if="record && record !== 'null'">
              <div class="numDataCon">
                <span
                  class="textSpan margin2X"
                  :class="{
                    textAddBgc:
                      record &&
                      (record.edit === 1 || record.operationType === 'Added'),
                    textDeleteBgc:
                      record &&
                      (record.edit === 2 ||
                        record.edit === 3 ||
                        record.operationType === 'Deleted'),
                  }"
                  :title="record.edit === 3 ? record.dataX : record.data"
                  >{{ record.edit === 3 ? record.dataX : record.data }}</span>
              </div>
              <template v-if="record && record.edit === 3">
                <div class="numDataCon textMT">
                  <span class="textSpan textAddBgc" :title="record.data">{{
                    record.data
                  }}</span>
                </div>
              </template>
            </template>
          </div>
        </a-table>
        <div v-if="dataList.length === 0" class="pageNoDataS">
          <PageNoData :isShowNoData="dataList.length === 0" />
        </div>
        <div
          v-if="FileOpen"
          class="attachment-wrapperX"
          :style="{ left: FileX + 'px', top: FileY + 'px' }"
          @mouseover="mouseoverX"
          @mouseleave="mouseleaveX"
        >
          <p v-if="isImage" @click="previewImg">
            <a href="javascript:void(0)">预览</a>
          </p>
          <p><a :href="fileUrl">下载</a></p>
        </div>
      </div>
      <div class="tipsBgc">
        <div class="tipsBgcD"></div>
        <span>删除项</span>
        <div class="tipsBgcA"></div>
        <span>新增项</span>
      </div>
    </a-modal>
    <!-- 预览并下载图片 -->
    <img-preview
      v-if="isPreviewImage"
      :imgList="[{ url: bs64Img }]"
      @close="isPreviewImage = false"
    />
  </div>
</template>
<script lang="ts">
import {
  Icon,
  Popover,
  Checkbox,
  Button,
  Modal,
  Input,
  Tabs,
  Pagination,
  Radio,
  Switch,
  Tooltip,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { listApi } from 'cloudpivot/api';
import PCImagePreview from 'cloudpivot/form/src/common/components/pc-image-preview.vue';
import { renderer } from 'cloudpivot/form';
import PageNoData from 'cloudpivot/common/src/components/pc/page-no-data/page-no-data-new.vue';
import dateFormat from 'cloudpivot/common/src/utils/date';

@Component({
  name: 'sheetMarkingModal',
  components: {
    AIcon: Icon,
    APopover: Popover,
    ACheckbox: Checkbox,
    AButton: Button,
    AModal: Modal,
    AInputSearch: Input.Search,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    APagination: Pagination,
    ARadio: Radio,
    ARadioButton: Radio.Button,
    ImgPreview: PCImagePreview,
    PageNoData: PageNoData,
    ASwitch: Switch,
    ATooltip: Tooltip,
  },
})
export default class sheetMarkingModal extends Vue {
  @Prop() detailId: string;

  @Prop({ default: false }) visible!: boolean;

  @Prop() columnsName: any;

  @Prop() sheetTitle: string;

  @Prop({ default: [] }) childPropertyCodes: any;

  @Prop() tempAuthSheetId: string;

  @Prop() tempAuthObjectId: string;

  @Prop({ default: '' }) sheetModalSchemaCode?: string; //视图列表传入的模型code

  columns: any[] = [];

  dataList: any[] = [];

  content: any[] = [];

  current: number = 1;

  pageSizes: number = 10;

  pagination: any = {};

  operationType: string = 'Modified'; //子表操作类型

  ModifiedTabType: number = 1;

  isPreviewImage: boolean = false;

  bs64Img: string = '';

  tableX: number = 0;

  hgt: number = 607;

  sheetCode: string = '';

  FileX: number = 0;

  FileY: number = 0;

  FileOpen: boolean = false;

  FileOpenF: boolean = true;

  mouseleaveTime: any;

  fileUrl: string = '';

  isImage: boolean = false;

  handleOk() {
    this.visible = false;
  }

  tableChange(pagination: any) {
    this.pageSizes = pagination.pageSize;
    this.current = pagination.current;
    this.getSheetMarking();
  }

  tabChange(num: string) {
    if (this.operationType !== num) {
      this.current = 1;
      this.operationType = num;
      this.getSheetMarking();
    }
  }

  //获取留痕列表
  async getSheetMarking() {
    const params = {
      size: this.pageSizes,
      page: this.current,
      detailId: this.detailId,
      schemaCode: this.$route.query.schemaCode
        ? this.$route.query.schemaCode
        : this.sheetModalSchemaCode,
    };
    const res = await listApi.getFormMarkingSheet(params);
    if (res.errcode === 0) {
      const content = res.data.content;
      this.content = content;
      if (content.length > 0) {
        this.sheetCode = content[0].schemaCode || '';
        const arr = [];
        for (const con of content) {
          if (
            con.operationType === 'Modified' ||
            con.operationType === 'Added'
          ) {
            arr.push(con.afterRowData);
            for (const x in con.afterRowData) {
              if (con.afterRowData.hasOwnProperty(x)) {
                const type = this.getDataType(x);
                this.dataFormat(type, con, 'afterRowData', x);
                const dataItem: any = {
                  operationType: con.operationType,
                  edit: 0, //0无修改、1新增、2删除、3修改
                  data: con.afterRowData[x],
                  dataX: '',
                };
                let dataItemX: any = {};
                if (con.operationType === 'Modified') {
                  if (con.modifiedProperties) {
                    const mod = JSON.parse(con.modifiedProperties);
                    for (const mods of mod) {
                      if (mods === x) {
                        if (!con.beforeRowData[x] && con.afterRowData[x]) {
                          dataItem.edit = 1;
                        } else if (
                          con.beforeRowData[x] &&
                          !con.afterRowData[x]
                        ) {
                          dataItem.edit = 2;
                        } else if (
                          con.beforeRowData[x] &&
                          con.afterRowData[x]
                        ) {
                          dataItem.edit = 3;
                          this.dataFormat(type, con, 'beforeRowData', x);
                          dataItem.dataX = con.beforeRowData[x];
                        } else {
                        }
                      }
                    }
                  }
                }
                dataItemX = JSON.parse(JSON.stringify(dataItem));
                con.afterRowData[x] = JSON.parse(JSON.stringify(dataItemX));
              }
            }
          } else {
            arr.push(con.beforeRowData);
            for (const x in con.beforeRowData) {
              if (con.beforeRowData.hasOwnProperty(x)) {
                const type = this.getDataType(x);
                this.dataFormat(type, con, 'beforeRowData', x);
                const dataItem: any = {
                  operationType: con.operationType,
                  edit: 0,
                  data: con.beforeRowData[x],
                  dataX: '',
                };
                let dataItemX: any = {};
                dataItemX = JSON.parse(JSON.stringify(dataItem));
                con.beforeRowData[x] = JSON.parse(JSON.stringify(dataItemX));
              }
            }
          }
        }
        this.dataList = arr;
      } else {
        this.dataList = [];
      }
      this.pagination = {
        total: res.data.totalElements > 0 ? res.data.totalElements : 1,
        pageSize: this.pageSizes,
        showQuickJumper: true,
        showSizeChanger: true,
      };
    } else {
      this.$message.error(res.errmsg);
    }
  }

  //子表数据格式显示处理
  dataFormat(type: number, con: any, name: string, x: string) {
    if (type === 2) {
      const datas: any = {};
      let datasX: any = {};
      datas.name = con[name][x];
      if (name === 'afterRowData') {
        if (!con.beforeRowData || con.beforeRowData[x] > con[name][x]) {
          datas.sizes = 1;
        } else if (con.beforeRowData && con.beforeRowData[x] === con[name][x]) {
          datas.sizes = 0;
        } else {
          datas.sizes = 2;
        }
      } else {
        datas.sizes = 0;
      }
      datasX = JSON.parse(JSON.stringify(datas));
      con[name][x] = JSON.parse(JSON.stringify(datasX));
    }
    if (type === 6 && con[name][x]) {
      const obj = JSON.parse(con[name][x]);
      obj.forEach((v) => {
        // 图片要使用<img>标签, 其他使用<a>标签, 因此做个标识;
        v.isImage = /^image\//.test(v.mimeType);
        v.url = renderer.UploadControl.service.getDownloadUrl(v);
      });
      con[name][x] = JSON.stringify(obj);
    }
    if (type === 9 && con[name][x]) {
      const obj = JSON.parse(con[name][x]);
      obj.code = x;
      this.RelevanceFormName(obj, obj.displayCode, obj.propertyType);
      con[name][x] = JSON.stringify(obj);
    }
    if (type === 11 && con[name][x]) {
      const obj = JSON.parse(con[name][x]);
      if (Array.isArray(obj) && obj.length > 0) {
        for (const y of obj) {
          y.code = x;
          this.RelevanceFormName(y, y.displayCode, y.propertyType);
        }
      }
      con[name][x] = JSON.stringify(obj);
    }
    if ([5, 13, 15, 51, 61].includes(type) && con[name][x]) {
      const arr = con[name][x].split(';');
      con[name][x] = arr;
    }
  }

  //关联单选显示处理
  RelevanceFormName(obj: any, code: string, type: number) {
    if (code) {
      const con = obj[code];
      if (con) {
        switch (type) {
          case 3:
            obj.names = dateFormat.formatter(con, 'YYYY-MM-DD HH:mm:ss');
            break;
          case 50:
            if (Array.isArray(con)) {
              for (const x of con) {
                obj.names = x.name;
              }
            }
            break;
          default:
            obj.names = con;
            break;
        }
      }
    } else {
      obj.names = '--';
    }
  }

  @Watch('visible')
  visibleChange() {
    if (this.visible) {
      this.hgt = (document as any).documentElement.clientHeight - 210;
      this.getSheetMarking();
      this.pagination = {
        total: this.dataList.length,
        pageSize: this.pageSizes,
        showQuickJumper: true,
        showSizeChanger: true,
      };
      let arr = [];
      this.tableX = 0;
      for (const con in this.columnsName) {
        if (this.columnsName.hasOwnProperty(con)) {
          this.tableX += 168;
          const cons: any = {
            resizable: true,
            slots: { title: 'numDataT' },
            width: 168,
          };
          if (this.columnsName[con].propertyType === 9) {
            cons.slots = { title: 'RelevanceForms' };
            cons.scopedSlots = { customRender: 'RelevanceForms' };
          } else if (this.columnsName[con].propertyType === 11) {
            cons.slots = { title: 'RelevanceFormExs' };
            cons.scopedSlots = { customRender: 'RelevanceFormExs' };
          } else if (this.columnsName[con].propertyType === 6) {
            cons.slots = { title: 'enclosure' };
            cons.scopedSlots = { customRender: 'enclosure' };
          } else if (this.columnsName[con].propertyType === 2) {
            cons.slots = { title: 'numData' };
            cons.scopedSlots = { customRender: 'numData' };
          } else if (this.columnsName[con].propertyType === 10) {
            cons.slots = { title: 'addressData' };
            cons.scopedSlots = { customRender: 'addressData' };
          } else if (this.columnsName[con].propertyType === 4) {
            cons.slots = { title: 'logicData' };
            cons.scopedSlots = { customRender: 'logicData' };
          } else if (
            [5, 13, 15, 51, 61].includes(this.columnsName[con].propertyType)
          ) {
            cons.slots = { title: 'arrData' };
            cons.scopedSlots = { customRender: 'arrData' };
          } else {
            cons.slots = { title: 'PTData' };
            cons.scopedSlots = { customRender: 'PTData' };
          }
          cons.title = this.columnsName[con].name;
          cons.dataIndex = con;
          arr.push(cons);
        }
      }
      //delete arr[arr.length-1]['width']
      if (this.childPropertyCodes.length > 0) {
        const con = [];
        for (const y of this.childPropertyCodes) {
          for (const x of arr) {
            if (y === x.dataIndex) {
              con.push(Object.assign({}, x));
            }
          }
        }
        arr = con;
      }
      this.columns = arr;
    }
  }

  //获取数据项类型
  getDataType(dataName: string) {
    let type: number = 0;
    for (const con in this.columnsName) {
      if (this.columnsName[con].code === dataName) {
        type = this.columnsName[con].propertyType;
      }
    }
    return type;
  }

  //关联单选跳转
  async RelevanceFormChange(obj: any) {
    const params = {
      bizObjectId: obj.id,
      schemaCode: obj.schemaCode,
      formCode: obj.schemaCode,
    };
    let res: any = await listApi.getFormUrl(params);
    // 如果报错, 会返回一个对象
    if (typeof res === 'object' && res.errcode !== 0) {
      return this.$message.error(res.errmsg as string, 3);
    }
    // 否则返回一个字符串
    else if (typeof res === 'string') {
      res +=
        '&tempAuthSheetId=' +
        this.tempAuthSheetId +
        '&tempAuthObjectId=' +
        this.tempAuthObjectId +
        '&tempAuthPropertyCode=' +
        (this.sheetCode + '-' + obj.code);
      window.open(res);
    } else {
      //Else Empty block statement
    }
  }

  ModifiedTabConChange(num: number) {
    if (this.ModifiedTabType !== num) {
      this.current = 1;
      this.ModifiedTabType = num;
      this.getSheetMarking();
    }
  }

  jsonParses(str: string) {
    let obj: any;
    try {
      obj = JSON.parse(str);
    } catch (err) {
      obj = str;
    }
    return obj;
  }

  /**
   * 预览图片
   */
  previewImg() {
    if (!this.fileUrl) {
      return;
    }
    this.bs64Img = this.fileUrl;
    this.isPreviewImage = true;
  }

  judegFileType(item) {
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

  mousemoveIsImage(isImage: any) {
    this.isImage = isImage ? true : false;
  }

  mouseleaveFile(url: string) {
    this.fileUrl = url;
    this.mouseleaveTime = setTimeout(() => {
      this.FileOpen = false;
    }, 500);
  }

  mousemoveFile(ev) {
    if (this.FileOpenF && !this.FileOpen) {
      this.FileOpenF = false;
      setTimeout(() => {
        this.FileOpenF = true;
      }, 200);
      this.FileOpen = true;
      this.FileX = ev.clientX + 10;
      this.FileY = ev.clientY - 25;
      clearTimeout(this.mouseleaveTime);
    }
  }

  mouseoverFile(ev) {
    if (this.FileOpenF) {
      this.FileOpenF = false;
      setTimeout(() => {
        this.FileOpenF = true;
      }, 200);
      this.FileOpen = true;
      this.FileX = ev.clientX + 10;
      this.FileY = ev.clientY - 25;
      clearTimeout(this.mouseleaveTime);
      console.log(this.FileX);
      console.log(this.FileY);
    }
  }

  mouseoverX() {
    clearTimeout(this.mouseleaveTime);
  }

  mouseleaveX() {
    this.mouseleaveTime = setTimeout(() => {
      this.FileOpen = false;
    }, 500);
  }

  cancel() {
    this.$emit('cancel');
  }
}
</script>

<style lang="less" scoped>
.tableCon {
  max-height: 661px;
  overflow-y: auto;
  position: relative;
  .tableItemCon {
    width: 100%;
    height: 100%;
    padding: 6px 12px;
  }
  .padding2X {
    padding: 3px 12px;
  }
  .margin2X {
    margin-top: 1px;
  }
  .gldxTextCon {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .gldxText {
    // color: #2970ff;
    cursor: pointer;
  }
  .ModifiedTab {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 3px;
    margin: 0 auto 20px auto;
    border-radius: 2px;
    cursor: pointer;
    .ModifiedTabCon {
      width: 166px;
      height: 32px;
      background: #ffffff;
      border-radius: 2px;
      padding: 2px;
      border: 1px solid #f2f2f2;
      display: flex;
      flex-direction: row;
      > div {
        width: 80px;
        height: 26px;
        border-radius: 2px;
        line-height: 26px;
        text-align: center;
      }
      .active {
        font-weight: 600;
        background: #e2e2e2;
      }
    }
  }
  .attachment-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    > a {
      height: 100%;
      margin-right: 3px;
    }
    img,
    svg {
      height: 100%;
    }
    svg {
      max-width: 36px;
    }
  }
  .numDataCon {
    display: flex;
    align-items: center;
    flex-direction: row;
    .arrow-up {
      color: #f0353f;
      font-size: 15px;
      margin-left: 6px;
    }
    .arrow-down {
      color: #00c283;
      font-size: 15px;
      margin-left: 6px;
    }
  }
  .pageNoDataS {
    width: 100%;
    display: flex;
    justify-content: center;
    position: absolute;
    top: 150px;
  }
  .textSpan {
    color: #111218;
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: all 0.1s;
    margin-right: 2px;
  }
  .textDeleteBgc {
    color: #707481;
    background: #fff1f0;
    text-decoration: line-through;
  }
  .textDeleteBgc:hover {
    background: #ffdedb;
  }
  .textAddBgc {
    background: #e6fff4;
  }
  .textAddBgc:hover {
    background: #9df5d3;
  }
  .textMT {
    margin-top: 8px;
  }
  .textMTX {
    margin: 4px 0;
  }
  .rowDeleteBgc {
    background: #fff1f0;
    text-decoration: line-through;
  }
  .rowAddBgc {
    background: #e6fff4;
  }
  .attachment-wrapperX {
    position: fixed;
    width: 48px;
    height: auto;
    background: #ffffff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 4px 0;
    color: #2970ff;
    z-index: 10000;
    > p {
      line-height: 24px;
      text-align: center;
      margin-bottom: 0;
      cursor: pointer;
    }
  }
}
.tipsBgc {
  position: absolute;
  left: 24px;
  bottom: 17px;
  display: flex;
  align-items: center;
  flex-direction: row;
  font-size: 12px;
  .tipsBgcD {
    width: 16px;
    height: 16px;
    background: #fff1f0;
    margin-right: 6px;
  }
  .tipsBgcA {
    width: 16px;
    height: 16px;
    background: #e6fff4;
    margin: 0 4px 0 16px;
  }
}
</style>

<style lang="less">
.sheetMarkingModal {
  .ant-modal-header {
    box-shadow: 0px 4px 11px 0px rgba(35, 110, 235, 0.05),
      0px 1px 0px 0px #eeeeee;
  }
  .ant-modal-body {
    padding-bottom: 0px;
    padding-top: 26px;
  }
  .ant-table-body {
    height: 558px;
    border-bottom: 1px solid #eeeeee;
  }
  .ant-table-header {
    margin-bottom: 0px !important;
    // padding-bottom: 38px !important;
  }
  .ant-table-thead > tr:only-child > th:last-child {
    border-right-color: #e8e8e8 !important;
  }
  .ant-tabs-nav .ant-tabs-tab-active {
    color: #111218;
    font-weight: bold;
  }
  .ant-table-placeholder {
    display: none;
  }
  .ant-table-column-title {
    font-weight: 600;
  }
  .ant-table-thead > tr > th {
    padding: 7px 12px;
  }
  .ant-table-tbody > tr {
    height: 1px;
  }
  .ant-table-tbody > tr > td {
    height: inherit;
    padding: 0 !important;
  }
  .ant-table-header {
    min-height: 36px;
  }
  .ant-table-header.ant-table-hide-scrollbar {
    height: 38px !important;
  }
  .text-ellipsis,
  .ant-table-row-cell-break-word {
    white-space: normal;
  }
  .ant-table-column-title {
    display: block;
    white-space: nowrap;
    overflow: hidden;
  }
  tr:hover > td {
    background: #ffffff !important;
  }
}
</style>

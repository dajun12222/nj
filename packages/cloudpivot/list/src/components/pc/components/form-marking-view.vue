<template>
  <a-modal
    v-model="visible"
    :title="$t('cloudpivot.list.pc.FormTrack')"
    :maskClosable="false"
    :keyboard="false"
    :width="isDetail ? 640 : 800"
    class="form-marking-modal-wrap"
    :footer="null"
    :destroyOnClose="true"
    @ok="changeVisible(false)"
  >
    <div
      ref="scrollWindow"
      v-infinite-scroll="handleInfiniteOnLoad"
      class="form-marking-modal-content"
      :infinite-scroll-disabled="busy"
      :infinite-scroll-distance="10"
      @scroll="onScroll"
    >
      <template v-for="(table, index) in content">
        <div
          :key="table.id"
          class="form-marking-item"
          :class="index === content.length - 1 ? 'form-marking-item-last' : ''"
        >
          <div class="form-marking-item-head">
            <div class="form-marking-item-img">
              <img
                v-if="table.imgUrl && table.imgUrl.includes('http')"
                :src="table.imgUrl"
              />
              <img
                v-else-if="table.imgUrl"
                :src="getDownloadUrlNew(table.imgUrl)"
              />
              <i
                v-else
                class="icon aufontAll h-icon-all-head-portrait default-avatar"
              ></i>
            </div>
            <div class="form-marking-item-line"></div>
          </div>
          <div class="form-marking-item-body">
            <div class="form-marking-infos">
              <div class="form-marking-infos-name">
                {{ table.creatorName }}
              </div>
              <div class="form-marking-infos-time">
                {{ table.createdTime }}
              </div>
            </div>
            <div class="form-wrap">
              <a-table
                :pagination="false"
                :rowKey="(record, index) => index"
                :columns="activeColumns"
                :dataSource="table.list"
                :bordered="true"
                class="form-marking-table"
              >
                <span slot="Title">{{
                  $t('cloudpivot.list.pc.FormTrackTable.DataTitle')
                }}</span>
                <span slot="Content">{{
                  $t('cloudpivot.list.pc.FormTrackTable.DataItem')
                }}</span>
                <span slot="Before">{{
                  $t('cloudpivot.list.pc.FormTrackTable.Before')
                }}</span>
                <span slot="After">{{
                  $t('cloudpivot.list.pc.FormTrackTable.After')
                }}</span>

                <template v-slot:titles="titles">
                  <a @click="goForm(titles.bizObjectId)">
                    {{ titles.title }}
                  </a>
                </template>

                <template v-slot:before="before">
                  <div>
                    <div
                      v-if="before.type === 2 && before.beforeValue"
                      class="numberValue"
                    >
                      <span
                        class="otherValue"
                        style="
                          display: inline-block;
                          width: 87px;
                          line-height: 1;
                        "
                      >
                        {{ before.beforeValue }}
                      </span>
                      <span class="value-change">
                        <span
                          v-if="before.afterValue - before.beforeValue < 0"
                          class="icon aufontAll value-up"
                          >&#xe875;</span>
                        <span
                          v-else-if="before.afterValue - before.beforeValue > 0"
                          class="icon aufontAll value-down"
                          >&#xe880;</span>
                      </span>
                    </div>
                    <div v-else-if="before.type === 6" class="fileValue">
                      <template
                        v-if="
                          before.beforeValue && before.beforeValue !== 'null'
                        "
                      >
                        <template
                          v-if="
                            attachmentFormate(before.beforeValue).length <= 4
                          "
                        >
                          <div
                            v-for="(item, key) in attachmentFormate(
                              before.beforeValue,
                            )"
                            :key="key"
                            class="attachment-wrap"
                          >
                            <template v-if="showImgThumb(item)">
                              <!-- <img v-if="item.valid" @click="filePreview(item.refId, item)" :title="item.name" :src="getDownloadUrl(item.refId)" /> -->
                              <img
                                :title="item.name"
                                :src="getDownloadUrl(item.refId)"
                                @click="filePreview(item.refId, item)"
                              />
                              <!-- <div v-else>{{item.name}}</div> -->
                            </template>
                            <template v-else>
                              <div :title="item.name" class="at-type">
                                <svg
                                  class="icon at-type"
                                  :title="item.name"
                                  aria-hidden="true"
                                >
                                  <use :xlink:href="getIconType(item)" />
                                </svg>
                              </div>
                            </template>
                          </div>
                        </template>
                        <template v-else>
                          <div
                            v-for="(item, key) in attachmentFormate(
                              before.beforeValue,
                            ).splice(0, 3)"
                            :key="key"
                            class="attachment-wrap"
                          >
                            <template v-if="key < 3">
                              <template v-if="showImgThumb(item)">
                                <!-- <img v-if="item.valid" @click="filePreview(item.refId, item)" :title="item.name" :src="getDownloadUrl(item.refId)" /> -->
                                <img
                                  :title="item.name"
                                  :src="getDownloadUrl(item.refId)"
                                  @click="filePreview(item.refId, item)"
                                />
                                <!-- <div v-else>{{item.name}}</div> -->
                              </template>
                              <template v-else>
                                <div :title="item.name" class="at-type">
                                  <svg
                                    class="icon at-type"
                                    :title="item.name"
                                    aria-hidden="true"
                                  >
                                    <use :xlink:href="getIconType(item)" />
                                  </svg>
                                </div>
                              </template>
                            </template>
                          </div>
                          <a-popover overlayClassName="file-popover">
                            <template slot="content">
                              <div style="display: flex">
                                <div
                                  v-for="(item, key) in attachmentFormate(
                                    before.beforeValue,
                                  )"
                                  :key="key"
                                  class="attachment-wrap"
                                >
                                  <template v-if="showImgThumb(item)">
                                    <!-- <img v-if="item.valid" @click="filePreview(item.refId, item)" :title="item.name" :src="getDownloadUrl(item.refId)" /> -->
                                    <img
                                      :title="item.name"
                                      :src="getDownloadUrl(item.refId)"
                                      @click="filePreview(item.refId, item)"
                                    />
                                    <!-- <div v-else>{{item.name}}</div> -->
                                  </template>
                                  <template v-else>
                                    <div :title="item.name" class="at-type">
                                      <svg
                                        class="icon at-type"
                                        :title="item.name"
                                        aria-hidden="true"
                                      >
                                        <use :xlink:href="getIconType(item)" />
                                      </svg>
                                    </div>
                                  </template>
                                </div>
                              </div>
                            </template>
                            <i class="icon aufontAll h-icon-all-ellipsis-o"></i>
                          </a-popover>
                        </template>
                      </template>
                    </div>
                    <div v-else-if="before.type === 8 && before.afterValue">
                      <div class="zbText">
                        新增
                        <span class="zbTextA">{{
                          before.afterValue.Added
                        }}</span>
                        条 修改
                        <span class="zbTextM">{{
                          before.afterValue.Modified
                        }}</span>
                        条 删除
                        <span class="zbTextD">{{
                          before.afterValue.Deleted
                        }}</span>
                        条<span
                          class="gldxText"
                          @click="
                            showSheetModal(
                              before.afterValue.trackChildDetailId,
                              before.afterValue.properties,
                              before.name,
                              before.afterValue.childPropertyCodes,
                              before.bizObjectId,
                              table.sheetId,
                              table.schemaCode,
                            )
                          "
                          >查看</span>
                      </div>
                    </div>
                    <div v-else-if="before.type === 9 && before.beforeValue">
                      <div
                        class="gldxText otherValue"
                        :title="before.beforeValue.names"
                        @click="
                          RelevanceFormChange(
                            before.beforeValue,
                            before.code,
                            before.bizObjectId,
                            table.sheetId,
                          )
                        "
                      >
                        {{ before.beforeValue.names }}
                      </div>
                    </div>
                    <div v-else-if="before.type === 11 && before.beforeValue">
                      <div class="gldxTextCon">
                        <template v-if="before.beforeValue.length > 1">
                          <div
                            v-for="(con, indexs) in before.beforeValue"
                            :key="indexs"
                            class="gldxText otherValue"
                            :title="con.names"
                            @click="
                              RelevanceFormChange(
                                con,
                                before.code,
                                before.bizObjectId,
                                table.sheetId,
                              )
                            "
                          >
                            {{
                              indexs + 1 === before.beforeValue.length
                                ? con.names
                                : `${con.names};`
                            }}
                          </div>
                        </template>
                        <template v-else>
                          <div
                            v-for="(con, indexs) in before.beforeValue"
                            :key="indexs"
                            class="gldxText otherValue"
                            :title="con.names"
                            @click="
                              RelevanceFormChange(
                                con,
                                before.code,
                                before.bizObjectId,
                                table.sheetId,
                              )
                            "
                          >
                            {{ con.names }}
                          </div>
                        </template>
                      </div>
                    </div>
                    <div
                      v-else-if="before.type === 10"
                      class="otherValue"
                      :title="locationFormat(before.beforeValue)"
                    >
                      {{ locationFormat(before.beforeValue) }}
                    </div>
                    <!-- 其他 -->
                    <div v-else class="otherValue" :title="before.beforeValue">
                      {{ before.beforeValue }}
                    </div>
                  </div>
                </template>

                <template v-slot:after="after">
                  <!-- 数值 -->
                  <div
                    v-if="after.type === 2 && after.afterValue"
                    class="numberValue"
                    :title="after.afterValue"
                  >
                    <span
                      class="otherValue"
                      style="display: inline-block; width: 87px; line-height: 1"
                    >
                      {{ after.afterValue }}
                    </span>
                    <span class="value-change">
                      <span
                        v-if="after.afterValue - after.beforeValue > 0"
                        class="icon aufontAll value-up"
                        >&#xe875;</span>
                      <span
                        v-else-if="after.afterValue - after.beforeValue < 0"
                        class="icon aufontAll value-down"
                        >&#xe880;</span>
                    </span>
                  </div>
                  <div v-else-if="after.type === 8 && after.afterValue">
                    <!-- <div class="zbText">
                      新增 <span class="zbTextA">{{ jsonParses(after.afterValue).Added }}</span> 条 修改 <span class="zbTextM">{{ jsonParses(after.afterValue).Modified }}</span> 条 删除 <span class="zbTextD">{{ jsonParses(after.afterValue).Modified }}</span> 条<span class="gldxText" @click="showSheetModal(jsonParses(after.afterValue).trackChildDetailId, jsonParses(after.afterValue).properties)">查看</span>
                    </div> -->
                  </div>
                  <div v-else-if="after.type === 9 && after.afterValue">
                    <div
                      class="gldxText otherValue"
                      :title="after.afterValue.names"
                      @click="
                        RelevanceFormChange(
                          after.afterValue,
                          after.code,
                          after.bizObjectId,
                          table.sheetId,
                        )
                      "
                    >
                      {{ after.afterValue.names }}
                    </div>
                  </div>
                  <div v-else-if="after.type === 11 && after.afterValue">
                    <div class="gldxTextCon">
                      <template v-if="after.afterValue.length > 1">
                        <div
                          v-for="(con, indexs) in after.afterValue"
                          :key="indexs"
                          class="gldxText otherValue"
                          :title="con.names"
                          @click="
                            RelevanceFormChange(
                              con,
                              after.code,
                              after.bizObjectId,
                              table.sheetId,
                            )
                          "
                        >
                          {{
                            indexs + 1 === after.afterValue.length
                              ? con.names
                              : `${con.names};`
                          }}
                        </div>
                      </template>
                      <template v-else>
                        <div
                          v-for="(con, indexs) in after.afterValue"
                          :key="indexs"
                          class="gldxText otherValue"
                          :title="con.name"
                          @click="
                            RelevanceFormChange(
                              con,
                              after.code,
                              after.bizObjectId,
                              table.sheetId,
                            )
                          "
                        >
                          {{ con.name }}
                        </div>
                      </template>
                    </div>
                  </div>
                  <div
                    v-else-if="after.type === 10"
                    class="otherValue"
                    :title="locationFormat(after.afterValue)"
                  >
                    {{ locationFormat(after.afterValue) }}
                  </div>
                  <!-- 附件类型 -->
                  <div v-else-if="after.type === 6" class="fileValue">
                    <template
                      v-if="after.afterValue && after.afterValue !== 'null'"
                    >
                      <template
                        v-if="attachmentFormate(after.afterValue).length <= 4"
                      >
                        <div
                          v-for="(item, key) in attachmentFormate(
                            after.afterValue,
                          )"
                          :key="key"
                          class="attachment-wrap"
                        >
                          <template v-if="showImgThumb(item)">
                            <!-- <img v-if="item.valid" @click="filePreview(item.refId, item)" :title="item.name" :src="getDownloadUrl(item.refId)" /> -->
                            <img
                              :title="item.name"
                              :src="getDownloadUrl(item.refId)"
                              @click="filePreview(item.refId, item)"
                            />
                            <!-- <div v-else>{{item.name}}</div> -->
                          </template>
                          <template v-else>
                            <div :title="item.name" class="at-type">
                              <svg
                                class="icon at-type"
                                aria-hidden="true"
                                @click="onDownload(item.refId)"
                              >
                                <use :xlink:href="getIconType(item)" />
                              </svg>
                            </div>
                          </template>
                        </div>
                      </template>
                      <template v-else>
                        <div
                          v-for="(item, key) in attachmentFormate(
                            after.afterValue,
                          ).splice(0, 3)"
                          :key="key"
                          class="attachment-wrap"
                        >
                          <template v-if="key < 3">
                            <template v-if="showImgThumb(item)">
                              <!-- <img v-if="item.valid" @click="filePreview(item.refId, item)" :title="item.name" :src="getDownloadUrl(item.refId)" /> -->
                              <img
                                :title="item.name"
                                :src="getDownloadUrl(item.refId)"
                                @click="filePreview(item.refId, item)"
                              />
                              <!-- <div v-else>{{item.name}}</div> -->
                            </template>
                            <template v-else>
                              <div :title="item.name" class="at-type">
                                <svg
                                  class="icon at-type"
                                  aria-hidden="true"
                                  @click="onDownload(item.refId)"
                                >
                                  <use :xlink:href="getIconType(item)" />
                                </svg>
                              </div>
                            </template>
                          </template>
                        </div>
                        <a-popover overlayClassName="file-popover">
                          <template slot="content">
                            <div style="display: flex">
                              <div
                                v-for="(item, key) in attachmentFormate(
                                  after.afterValue,
                                )"
                                :key="key"
                                class="attachment-wrap"
                              >
                                <template v-if="showImgThumb(item)">
                                  <!-- <img v-if="item.valid" @click="filePreview(item.refId, item)" :title="item.name" :src="getDownloadUrl(item.refId)" /> -->
                                  <img
                                    :title="item.name"
                                    :src="getDownloadUrl(item.refId)"
                                    @click="filePreview(item.refId, item)"
                                  />
                                  <!-- <div v-else>{{item.name}}</div> -->
                                </template>
                                <template v-else>
                                  <div :title="item.name" class="at-type">
                                    <svg
                                      class="icon at-type"
                                      aria-hidden="true"
                                      @click="onDownload(item.refId)"
                                    >
                                      <use :xlink:href="getIconType(item)" />
                                    </svg>
                                  </div>
                                </template>
                              </div>
                            </div>
                          </template>
                          <i class="icon aufontAll h-icon-all-ellipsis-o"></i>
                        </a-popover>
                      </template>
                    </template>
                  </div>
                  <!-- 其他 -->
                  <div v-else class="otherValue" :title="after.afterValue">
                    {{ after.afterValue }}
                  </div>
                </template>
              </a-table>
            </div>
          </div>
        </div>
      </template>
      <PageLoadingNew
        :loading="loadingType === 'loading'"
        :loadingText="
          loadingType === 'done'
            ? $t('cloudpivot.list.pc.FormTrackTable.LoadedAll')
            : ''
        "
      />
      <!-- <div class="pagin-wrap">
        <a-pagination  
          :showTotal="(total) => '共' + total + '条'"
          :current="page"
          :total="totalElements"
          @change="onPageChange"
          size="small"  />
      </div> -->
    </div>

    <!-- <div class="form-marking-loading">
      
    </div> -->

    <!-- 预览并下载图片 -->
    <img-preview
      v-if="previewVisible"
      :imgList="[{ url: viewPicList }]"
      @close="previewVisible = false"
    />

    <!-- 详情弹出层 -->
    <IframeModal
      :showIframeForm="showIframeForm"
      :IframeFormUrl="IframeFormUrl"
      @close="closeModal"
    />

    <!-- 子表留痕弹框 -->
    <sheetMarkingModal
      :detailId="sheetDetailId"
      :visible="showSheetModals"
      :sheetTitle="sheetTitle"
      :columnsName="sheetColumnsName"
      :childPropertyCodes="childPropertyCodes"
      :tempAuthSheetId="tempAuthSheetId"
      :tempAuthObjectId="tempAuthObjectId"
      :sheetModalSchemaCode="sheetModalSchemaCode"
      @cancel="sheetCancel"
    />
  </a-modal>
</template>

<script lang="ts">
import {
  Button,
  Divider,
  Icon,
  Modal,
  Pagination,
  Popover,
  Table,
  Timeline,
} from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { listApi, listParams } from '../../../../../api';
import common from '../../../../../common/pc';
import getDownloadUrlNew from '../../../../../common/src/utils/getDownloadUrlNew';
import IframeModal from '../../../../../flow-center/src/components/pc/components/iframe-modal/iframe-modal.vue';
import { renderer } from '../../../../../form';
import PCImagePreview from '../../../../../form/src/common/components/pc-image-preview.vue';
import sheetMarkingModal from './sheetMarkingModal.vue';
import dateFormat from 'cloudpivot/common/src/utils/date';

@Component({
  name: 'form-marking-modal',
  components: {
    AModal: Modal,
    ATimeline: Timeline,
    ATimelineItem: Timeline.Item,
    ATable: Table,
    ADivider: Divider,
    AIcon: Icon,
    APagination: Pagination,
    AButton: Button,
    PageLoadingNew: common.components.PageLoadingNew,
    IframeModal,
    ImgPreview: PCImagePreview,
    APopover: Popover,
    sheetMarkingModal,
  },
})
export default class FormMarkingModal extends Vue {
  visible: boolean = false;

  dataSource: Array<any> = [];

  page: number = 1;

  size: number = 10;

  totalElements: number = 0;

  previewVisible: boolean = false;

  viewPicList: string = '';

  loadingType: string = 'init'; //init 初始化 // loading 加载中, done加载完毕,

  busy: boolean = false;

  showSheetModals: boolean = false;

  sheetTitle: string = '';

  sheetDetailId: string = '';

  sheetColumnsName: any = {};

  childPropertyCodes: any = [];

  image_types: string[] = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.svg',
    '.tif',
  ];

  IframeFormUrl: string = '';

  showIframeForm: boolean = false;

  tempAuthSheetId: string = '';

  tempAuthObjectId: string = '';

  // 列表内容
  content: Array<any> = [];

  @Prop({ default: false }) isDetail?: boolean; // 详情页标识，详情页不展示title列

  @Prop({ default: () => [] }) dataItemList!: any[];

  columns: Array<any> = [
    {
      // dataIndex: "title",
      slots: { title: 'Title' },
      key: 'Title',
      align: 'left',
      // customRender: (value, row, index) => {
      //   return {
      //     children: value,
      //     attrs: { rowSpan: row.rowSpan },
      //   }
      // },
      width: 281,
      scopedSlots: { customRender: 'titles' },
      customCell: (record, index) => {
        /* console.log("recode","index",record,index) */
        const obj = {
          attrs: {
            rowSpan: record.rowSpan,
          },
        };
        return record.rowSpan ? obj : null;
      },
    },
    {
      dataIndex: 'name',
      slots: { title: 'Content' },
      scopedSlots: { customRender: 'currentDataItem' },
      align: 'left',
      width: 126,
    },
    {
      // dataIndex: "beforeValue",
      slots: { title: 'Before' },
      scopedSlots: { customRender: 'before' },
      align: 'left',
      width: 126,
      customCell: (record, index) => {
        if (record && record.type === 8) {
          return { attrs: { colSpan: 2 } };
        }
      },
    },
    {
      // dataIndex: "afterValue",
      slots: { title: 'After' },
      scopedSlots: { customRender: 'after' },
      align: 'left',
      width: 126,
      customCell: (record, index) => {
        if (record && record.type === 8) {
          return null;
        }
      },
    },
  ];

  sheetModalSchemaCode: string = '';

  get getBizObjectIds() {
    return this.dataItemList.reduce((stat: any, item: any) => {
      stat.push(item.id);
      return stat;
    }, []);
  }

  get activeColumns() {
    if (this.isDetail) {
      return this.columns.filter((item) => item.key !== 'Title');
    }
    return this.columns;
  }

  // // isImage
  // isImage(fileName: string) {
  //   return [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".tif"].includes(fileName) :
  // }

  // 解析附件内容
  attachmentFormate(str: string) {
    const dataArray = JSON.parse(str);
    if (!Array.isArray(dataArray)) {
      return str;
    }

    /* console.log(dataArray) */

    return dataArray;
    // return dataArray.map(item => {
    //   const perArr = item.split('|')
    //   return {
    //     value: perArr[0],
    //     name: perArr[1]
    //   }
    // })
  }

  // 跳转到对应表单
  async goForm(objId: string) {
    if (!objId) {
      return;
    }
    const { schemaCode } = this.$route.params;
    const params: listParams.FormUrlParams = {
      bizObjectId: objId,
      schemaCode,
    };
    const res = await listApi.getFormUrl(params);
    // 如果报错, 会返回一个对象
    if (typeof res === 'object' && res.errcode !== 0) {
      return this.$message.error(res.errmsg as string, 3);
    }
    // 否则返回一个字符串
    else if (typeof res === 'string') {
      const urlObj = new URL(location.href);
      urlObj.searchParams.set('iframeAction', 'detail');
      const search = urlObj.search;
      const url = `${res}&return=${
        location.pathname + encodeURIComponent(search)
      }`;
      // 非钉钉
      // window.open(url);
      this.showIframeForm = true;
      this.IframeFormUrl = url;
    } else {
      //Else Empty block statement
    }
  }

  getExt(name: string): string {
    if (!name) {
      return '';
    }

    return name.substr(name.lastIndexOf('.'));
  }

  sheetCancel() {
    this.showSheetModals = false;
  }

  showSheetModal(
    id: string,
    ColumnsName: any,
    name: string,
    itemCodes: any,
    ObjectId: string,
    sheetId: string,
    schemaCode: string,
  ) {
    this.showSheetModals = true;
    this.sheetDetailId = id;
    this.sheetColumnsName = ColumnsName;
    this.childPropertyCodes = itemCodes;
    this.sheetTitle = name + '-变更详情';
    this.tempAuthSheetId = sheetId;
    this.sheetModalSchemaCode = schemaCode;
    this.tempAuthObjectId = ObjectId;
  }

  showImgThumb(item: any) {
    const { name } = item as any;

    const ext: string = this.getExt(name);

    return this.image_types.indexOf(ext) > -1;
  }

  getIconType(item: any) {
    if (!item.refId) {
      return '';
    }
    const name: string = item.name as string;
    const ext: string = name.substr(name.lastIndexOf('.'));
    const prefix: string = '#h-icon-all-';
    switch (ext) {
      case '.docx':
        return `${prefix}word1`;
      case '.doc':
        return `${prefix}word1`;
      case '.xlsx':
        return `${prefix}excel1`;
      case '.xls':
        return `${prefix}excel1`;
      case '.pptx':
        return `${prefix}ppt1`;
      case '.ppt':
        return `${prefix}ppt1`;
      case '.wpt':
        return `${prefix}ppt1`;
      case '.dot':
        return `${prefix}word1`;
      case '.rtf':
        return `${prefix}t`;
      case '.txt':
        return `${prefix}t`;
      case '.pdf':
        return `${prefix}pdf1`;
      default:
        return `${prefix}form`;
    }
  }

  locationFormat(str) {
    if (!str) {
      return '';
    }
    try {
      const locationObj = JSON.parse(str);
      // 图片类型显示图片
      if (locationObj.pic && locationObj.refId) {
        return '';
      }
      // 地址类型显示地址
      if (locationObj.name) {
        return locationObj.name;
      }
    } catch (error) {
      return '';
    }
  }

  // 比较数值大小
  isBigger(before, after) {
    const beforeValue = before ? parseFloat(before) : 0;
    const afterValue = after ? parseFloat(after) : 0;
    if (beforeValue - afterValue > 0) {
      return 'smaller';
    } else if (beforeValue - afterValue < 0) {
      return 'bigger';
    } else {
      return 'normal';
    }
  }

  //下载文件
  onDownload(file: any) {
    // if (!file || !file.refId) {
    //   return;
    // }
    // console.log(file)
    const fileObj: any = {
      refId: file,
    };
    const url = renderer.UploadControl.service.getDownloadUrl(fileObj);
    /* console.log(url) */
    window.open(url);
  }

  // isImage(name) {
  //     const idx:number = name.indexOf('.');
  //     if (idx === -1) {
  //       return
  //     }
  //     const type = name.substr(idx + 1);
  //     const imgArr = [
  //       'png','jpg','gif','jpeg'
  //     ];
  //     return imgArr.indexOf(type) !== -1 ? true : false;
  // }

  mounted() {}

  filePreview(file: any) {
    const url = this.getDownloadUrl(file);
    this.previewVisible = true;
    this.viewPicList = url;
  }

  imgDownload() {
    const url = this.viewPicList;
    window.open(url);
  }

  async changeVisible(view: boolean) {
    this.page = 1;
    if (view) {
      // await this.loadData()
      await this.getFormTrackItems();
      if (this.content.length === 0) {
        this.$message.info('没有表单操作记录，无法查看', 2);
        return;
      }
    }
    // this.page = 1
    this.visible = view;
  }

  async loadData() {
    const params: listParams.FormMarkingListParam = {
      page: this.page,
      size: this.size,
    };
    if (this.isDetail) {
      params.bizObjectId =
        (this.$route.query.objectId && this.$route.query.objectId.toString()) ||
        (this.$route.query.bizObjectId &&
          this.$route.query.bizObjectId.toString()) ||
        '';
      const res = await listApi.getFormMarkingDetail(params);
      if (res.errcode === 0) {
        /* console.log('details', res.data) */
        const { totalElements, content } = res.data;
        this.content = content;
        this.totalElements = totalElements;
      }
    } else {
      params.schemaCode = this.$route.query.code.toString();
      params.bizObjectIds = this.getBizObjectIds;
      const res = await listApi.getFormMarkingList(params);
      if (res.errcode === 0) {
        /* console.log(res.data) */
        const { totalElements, content } = res.data;
        this.content = content.map((item) => {
          this.getRowSpan(item.list);
          this.formatName(item.list);
          /* item.list.map((subItem, index) => {
            // 合并标题项目
            index === 0 ? subItem.rowSpan = item.list.length : subItem.rowSpan = 0
            subItem.title = item.title
            return subItem
          }) */
          return item;
        });
        /* console.log(this.content) */
        this.totalElements = totalElements;
      }
    }
    // console.log(this.content);
    // this.content.forEach((table: any) => {
    //   console.log(table.list);
    //   table.list.forEach((item: any) => {
    //     if(item.type === 6){
    //       const beforeValue = JSON.parse(item.beforeValue);
    //       if(beforeValue){
    //         beforeValue.forEach(async (i:any) => {
    //           let fileObj: any = {
    //             refId: i.refId,
    //           }
    //           const fileName = i.name.split(".");
    //           if(['bmp','jpg','jpeg','png','gif','svg','tif'].includes(fileName[fileName.length-1].toLowerCase())) {
    //             // 预览图片
    //             const url = renderer.UploadControl.service.getDownloadUrl(fileObj)
    //             await this.checkImgUrl(url).then(() =>{
    //               i.valid = true
    //             }).catch(()=>{
    //               i.valid = false
    //             })
    //           } else {
    //             i.valid = true
    //           }
    //         })
    //         item.beforeValue = [...beforeValue];
    //       }

    //       const afterValue = JSON.parse(item.afterValue);
    //       if(afterValue){
    //         afterValue.forEach(async (i:any) => {
    //           let fileObj: any = {
    //             refId: i.refId,
    //           }
    //           const fileName = i.name.split(".");
    //           if(['bmp','jpg','jpeg','png','gif','svg','tif'].includes(fileName[fileName.length-1].toLowerCase())) {
    //             // 预览图片
    //             const url = renderer.UploadControl.service.getDownloadUrl(fileObj)
    //             await this.checkImgUrl(url).then(() =>{
    //               i.valid = true
    //             }).catch(()=>{
    //               i.valid = false
    //             })
    //           } else {
    //             i.valid = true
    //           }
    //         })
    //         item.afterValue = [...afterValue];
    //       }
    //     }
    //   })
    // })
    // this.content = [...this.content];
    // console.log(this.content)
  }

  //得到每条数据的RowSpan数据，相同数据标题表格的合并成一个数据标题
  getRowSpan(list) {
    if (!list) {
      return;
    }
    let newList: any = [];
    const temObj: any = {};
    list.map((item) => {
      if (temObj[item.bizObjectId] === undefined) {
        temObj[item.bizObjectId] = [];
      }
      temObj[item.bizObjectId].push(item);
    });
    for (const key in temObj) {
      temObj[key] = temObj[key].map((item, index) => {
        index === 0 ? (item.rowSpan = temObj[key].length) : (item.rowSpan = 0);
        return item;
      });
      newList = [...newList, ...temObj[key]];
    }
  }

  checkImgUrl(imgurl) {
    return new Promise((resolve, reject) => {
      const ImgObj = new Image();
      ImgObj.src = imgurl;
      ImgObj.onload = (res) => {
        resolve(res);
      };
      ImgObj.onerror = (err) => {
        reject(err);
      };
    });
  }

  onPageChange(e: number) {
    this.page = e;
    this.loadData();
  }

  /**
   * 滚动加载
   */
  handleInfiniteOnLoad() {
    if (this.loadingType !== 'init' || this.page === 1) {
      return;
    }
    this.getFormTrackItems('pageChange');
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrl(refId: string) {
    let url = `${
      this.apiHost
    }/api/aliyun/download?refId=${getDownloadUrlNew.getRefId(refId)}`;
    if (this.token) {
      url += '&access_token=' + this.token;
      // url += '&T=' + this.token;
    }
    return url;
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }

  async getFormTrackItems(type?: string) {
    this.loadingType = 'loading';
    const params: listParams.FormMarkingListParam = {
      page: this.page,
      size: this.size,
    };
    params.schemaCode = this.$route.query.code.toString();
    params.bizObjectIds = this.getBizObjectIds;
    const res = await listApi.getFormMarkingList(params);
    this.processResult(res, type);
    // this.content.forEach((table: any) => {
    //   console.log(table.list);
    //   table.list.forEach((item: any) => {
    //     if(item.type === 6){
    //       const beforeValue = JSON.parse(item.beforeValue);
    //       if(beforeValue){
    //         beforeValue.forEach(async (i:any) => {
    //           let fileObj: any = {
    //             refId: i.refId,
    //           }
    //           const fileName = i.name.split(".");
    //           if(['bmp','jpg','jpeg','png','gif','svg','tif'].includes(fileName[fileName.length-1].toLowerCase())) {
    //             // 预览图片
    //             const url = renderer.UploadControl.service.getDownloadUrl(fileObj)
    //             await this.checkImgUrl(url).then(() =>{
    //               i.valid = true
    //             }).catch(()=>{
    //               i.valid = false
    //             })
    //           } else {
    //             i.valid = true
    //           }
    //         })
    //         item.beforeValue = beforeValue
    //       }

    //       const afterValue = JSON.parse(item.afterValue);
    //       if(afterValue){
    //         afterValue.forEach(async (i:any) => {
    //           let fileObj: any = {
    //             refId: i.refId,
    //           }
    //           const fileName = i.name.split(".");
    //           if(['bmp','jpg','jpeg','png','gif','svg','tif'].includes(fileName[fileName.length-1].toLowerCase())) {
    //             // 预览图片
    //             const url = renderer.UploadControl.service.getDownloadUrl(fileObj)
    //             await this.checkImgUrl(url).then(() =>{
    //               i.valid = true
    //             }).catch(()=>{
    //               i.valid = false
    //             })
    //           } else {
    //             i.valid = true
    //           }
    //         })
    //         item.afterValue = afterValue
    //       }
    //     }
    //   })
    // })
    // this.content = [...this.content];
    // console.log(this.content)
  }

  processResult(res: any, type?: string) {
    this.loadingType = 'init';
    if (res.errcode === 0) {
      const data = res.data;
      if (type === 'pageChange') {
        if (this.page >= data.totalPages) {
          this.loadingType = 'done';
        }
        let { totalElements, content } = data;
        content = content.filter((x) => {
          return x.list;
        });
        this.content = this.content.concat(content).map((item) => {
          this.getRowSpan(item.list);
          this.formatName(item.list);
          /* item.list.map((subItem, index) => {
            // 合并标题项目
            index === 0 ? subItem.rowSpan = item.list.length : subItem.rowSpan = 0
            subItem.title = item.title
            return subItem
          }) */
          return item;
        });
        this.totalElements = totalElements;
      } else {
        let { totalElements, content } = data;
        content = content.filter((x) => {
          return x.list;
        });
        this.content = content.map((item) => {
          this.getRowSpan(item.list);
          this.formatName(item.list);
          /* item.list.map((subItem, index) => {
            // 合并标题项目
            index === 0 ? subItem.rowSpan = item.list.length : subItem.rowSpan = 0
            subItem.title = item.title
            return subItem
          }) */
          return item;
        });
        this.totalElements = totalElements;
        /**
         * 加载完毕
         */
        if (res.data.content.length < this.size) {
          this.loadingType = 'done';
          return;
        }
      }
      this.page++;
    }
  }

  //格式化显示名称
  formatName(list: any) {
    if (Array.isArray(list) && list.length > 0) {
      for (const con of list) {
        if ([8].includes(con.type) && con.afterValue) {
          if (typeof con.afterValue === 'string') {
            con.afterValue = JSON.parse(con.afterValue);
          }
        }
        if ([8].includes(con.type) && con.beforeValue) {
          if (typeof con.beforeValue === 'string') {
            con.beforeValue = JSON.parse(con.beforeValue);
          }
        }
        if ([9].includes(con.type) && con.afterValue) {
          if (typeof con.afterValue === 'string') {
            con.afterValue = JSON.parse(con.afterValue);
          }
          this.RelevanceFormName(
            con.afterValue,
            con.afterValue.displayCode,
            con.afterValue.propertyType,
          );
        }
        if ([9].includes(con.type) && con.beforeValue) {
          if (typeof con.beforeValue === 'string') {
            con.beforeValue = JSON.parse(con.beforeValue);
          }
          this.RelevanceFormName(
            con.beforeValue,
            con.beforeValue.displayCode,
            con.beforeValue.propertyType,
          );
        }
        if ([11].includes(con.type) && con.afterValue) {
          if (typeof con.afterValue === 'string') {
            con.afterValue = JSON.parse(con.afterValue);
          }
          if (Array.isArray(con.afterValue)) {
            for (const x of con.afterValue) {
              this.RelevanceFormName(x, x.displayCode, x.propertyType);
            }
          }
        }
        if ([11].includes(con.type) && con.beforeValue) {
          if (typeof con.beforeValue === 'string') {
            con.beforeValue = JSON.parse(con.beforeValue);
          }
          if (Array.isArray(con.beforeValue)) {
            for (const x of con.beforeValue) {
              this.RelevanceFormName(x, x.displayCode, x.propertyType);
            }
          }
        }
      }
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

  async onScroll(e: any) {
    const target = e.target;
    const scrollHeight = target.scrollHeight;
    const scrollTop = target.scrollTop;
    const clientHeight = target.clientHeight;
    const D_value = scrollHeight - (scrollTop + clientHeight);
    if (D_value > 10 || this.loadingType !== 'init' || this.page === 1) {
      return;
    }
    await this.getFormTrackItems('pageChange');
  }

  jsonParses(str: string) {
    const obj = JSON.parse(str);
    return obj;
  }

  //关联单选跳转
  async RelevanceFormChange(
    obj: any,
    code: string,
    ObjectId: string,
    sheetId: string,
  ) {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj);
    }
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
        sheetId +
        '&tempAuthObjectId=' +
        ObjectId +
        '&tempAuthPropertyCode=' +
        code;
      window.open(res);
    } else {
      //Else Empty block statement
    }
  }

  closeModal() {
    this.showIframeForm = false;
    this.IframeFormUrl = '';
  }
}
</script>

<style lang="less" scoped>
/deep/.form-marking-table {
  td {
    background-color: #fff !important;
  }
}
.form-marking-modal-wrap {
  // .form-marking-line {
  // }
  // .form-marking-modal-content {
  //   // padding: 10px 0 0 10px;
  //   // min-height: 480px;
  //   max-height: 50vh;
  //   box-sizing: border-box;
  //   min-height: 466px;
  //   overflow-y: auto;
  //   // display: flex;
  //   // flex-direction: column;

  // }

  .pagin-wrap {
    min-height: 50px;
    text-align: right;
    padding-right: 6px;
    flex: 1;
    display: flex;
    // flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }

  .arrow-up {
    color: #db6d6d;
  }

  .arrow-down {
    color: #83b350;
  }
  .attachment-wrap {
    display: flex;
    align-items: center;
    // border-bottom: 1px solid #eee;
    margin-right: 8px;
    &:last-child {
      border-bottom: none;
    }
    .at-type {
      font-size: 22px;
      width: 22px;
      height: 22px;
      cursor: pointer;
    }
    img {
      width: 22px;
      height: 22px;
      cursor: pointer;
      object-fit: cover;
    }
    .name {
      display: inline-block;
      line-height: 38px;
      width: 90px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    span {
      margin-right: 10px;
    }
    .no-wrap {
      white-space: nowrap;
    }
    .overflow {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .ant-modal-body {
    padding: 16px 42px 0 0;
    height: 482px;
  }

  .ant-modal-footer {
    display: none;
  }

  .gldxTextCon {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .gldxText {
    color: #2970ff;
    cursor: pointer;
  }

  .zbText {
    font-size: 12px;
    color: #88888b;
    .zbTextA {
      color: #00c283;
    }
    .zbTextM {
      color: #2970ff;
    }
    .zbTextD {
      color: #f0353f;
    }
    .gldxText {
      margin-left: 39px;
    }
  }
}
</style>

<style lang="less" scoped>
.file-preview {
  /deep/.ant-modal-content {
    height: 600px;
    & .ant-modal-body {
      display: flex;
      flex-flow: column;
      height: unset;
      padding: 0 48px 24px 48px;
      & .download-btn {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      & .preview-img {
        height: 462px;
        overflow: auto;
        & .img-preview {
          width: 100%;
          border-radius: 2px;
        }
      }
    }
  }
}
/deep/.ant-modal-content {
  width: 800px;
  height: 554px;
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  .ant-modal-close {
    &-x {
      font-size: 20px;
      width: 64px;
      height: 72px;
      line-height: 72px;
    }
  }
  .ant-modal-header {
    width: 800px;
    height: 72px;
    background: #ffffff;
    border: 0px solid #ffffff;
    padding: 24px;
    /deep/.ant-modal-title {
      height: 24px;
      font-size: 16px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #111218;
      line-height: 24px;
    }
  }
  .ant-modal-body {
    padding: 16px 0 0 0;
    height: 482px;
  }
}
</style>

<style lang="less">
@import './../../../../../application/src/components/pc/style/custom-themes.less';
@import '../../../../../common/common.less';
.form-marking-modal-wrap {
  .form-marking-modal-content {
    height: calc(100%);
    padding-bottom: 20px;
    overflow-y: scroll;
    padding-right: 42px;
    .form-marking-item {
      display: flex;
      padding-left: 48px;
      .form-marking-item-head {
        display: flex;
        flex-flow: column;
        margin-right: 12px;
        .form-marking-item-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-bottom: 8px;
          > img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
          }
          & > i.default-avatar {
            font-size: 32px;
            line-height: 32px;
            color: #ffb131;
          }
        }
        .form-marking-item-line {
          border-left: 1px dashed rgba(17, 18, 24, 0.25);
          margin-left: 15px;
          height: 100%;
          width: 1px;
        }
      }
      .form-marking-item-body {
        padding-bottom: 25px;
        .form-marking-infos {
          display: flex;
          align-items: center;
          margin-top: 5px;
          margin-bottom: 11px;
          &-name {
            height: 22px;
            font-size: 14px;
            margin-right: 16px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #111218;
            line-height: 22px;
          }
          &-time {
            height: 20px;
            font-size: 12px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: rgba(17, 18, 24, 0.5);
            line-height: 20px;
          }
        }
        /deep/.ant-table-body > table {
          border-radius: 0;
          width: 659px;
          border-top: 1px solid #e8eaed;
          border-left: 1px solid #e8eaed;
        }
        /deep/.ant-timeline-item-content {
          top: 0;
          margin-left: 44px;
          padding-top: 5px;
        }
        /deep/.ant-timeline-item-last > .ant-timeline-item-tail {
          display: none;
        }
        /deep/.ant-table-thead > tr > th {
          font-weight: 600;
          & .ant-table-column-title {
            height: 22px;
            font-size: 13px;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 600;
            color: #111218;
            line-height: 22px;
          }
        }
        /deep/.ant-table-thead > tr > th,
        /deep/.ant-table-tbody > tr > td {
          padding: 7px 12px;
          border-right: 1px solid #e8eaed;
          border-bottom: 1px solid #e8eaed;
        }
        /deep/.ant-table-thead > tr > th {
          background: #f8f8fb;
        }
        .ant-table-row-cell-break-word {
          height: 22px;
          font-size: 13px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #111218;
          // white-space: normal;
          line-height: 22px;
          &:not(:first-child) {
            max-width: 126px;
          }
          & a {
            height: 22px;
            font-size: 13px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: @highlightColor;
            line-height: 22px;
            &:hover {
              opacity: 0.8;
            }
          }
          & .fileValue {
            display: flex;
            & .h-icon-all-word {
              color: #2565f1 !important;
            }

            & .h-icon-all-excel {
              color: #52c41a !important;
            }

            & .h-icon-all-ppt {
              color: #ff4d4f !important;
            }

            & .h-icon-all-t {
              color: #23b7ff !important;
            }

            & .h-icon-all-unknow-file-o {
              color: #777f8d !important;
            }

            & .h-icon-all-pdf {
              color: #ff4d4f !important;
            }
          }
          & .numberValue {
            position: relative;
            display: flex;
            align-items: center;
            & .value-change {
              position: absolute;
              right: 0;
              & .value-up {
                font-size: 12px;
                color: @primary-color;
              }
              & .value-down {
                font-size: 12px;
                color: rgba(17, 18, 24, 0.5);
              }
            }
          }
          & .otherValue {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        /deep/.ant-timeline-item {
          padding-bottom: 33px;
          &-last {
            padding-bottom: 0;
          }
          &-tail {
            left: 15px;
            border-left: 1px dashed rgba(17, 18, 24, 0.25);
          }
          &-head-custom {
            top: 16px;
            left: 16px;
          }
        }

        /deep/.form-marking-line-img {
          min-width: 32px;
          height: 32px;
          border-radius: 50%;
          & > img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }
          & > i.default-avatar {
            font-size: 32px;
            line-height: 32px;
            color: #ffb131;
          }
        }
      }
      &.form-marking-item-last {
        .form-marking-item-head .form-marking-item-line {
          display: none;
        }
        .form-marking-item-body {
          padding-bottom: 18px;
        }
      }
      & + .form-marking-item {
        margin-top: 8px;
      }
    }
    .page-loading-new {
      margin: 0;
    }
  }
  /deep/.form-marking-loading {
    height: 50px;
  }
}
</style>
<style lang="less" scoped>
.file-popover {
  .ant-popover-inner-content {
    display: flex !important;
    .attachment-wrap {
      height: 22px;
      width: 22px;
      line-height: 22px;
      display: flex;
      align-items: center;
      & + .attachment-wrap {
        margin-left: 8px;
      }
      > img {
        width: 22px;
        height: 22px;
      }
      .at-type {
        font-size: 22px;
        width: 22px;
        height: 22px;
        cursor: pointer;
      }
    }
  }
  // .attachment-wrap{
  //   height: 22px;
  //   width: 22px;
  //   >img{
  //     width: 22px;
  //     height: 22px;
  //   }
  //   .at-type{
  //     font-size: 22px;
  //     width: 22px;
  //     height: 22px;
  //     cursor: pointer;
  //   }
  // }
}
</style>

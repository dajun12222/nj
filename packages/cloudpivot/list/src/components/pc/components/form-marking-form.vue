<template>
  <div class="form-marking-modal-wrap">
    <div class="form-marking-modal-content">
      <div
        v-infinite-scroll="handleInfiniteOnLoad"
        class="form-marking-modal-body"
        :infinite-scroll-disabled="busy"
        :infinite-scroll-distance="10"
      >
        <div v-for="table in content" :key="table.id" class="form-marking-card">
          <div class="form-marking-card-title">
            <div class="form-marking-card-title-img">
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
            <div class="form-marking-card-title-name">
              {{ table.creatorName }}
            </div>
            <div class="form-marking-card-title-time">
              {{ table.createdTime }}
            </div>
          </div>
          <div class="form-marking-card-detail">
            <div
              v-for="(items, index) in table.list"
              :key="index"
              class="form-marking-card-detail-item"
            >
              <div class="form-marking-card-detail-item-title">
                {{ items.name }}
              </div>
              <div
                v-if="items.type !== 8"
                class="form-marking-card-detail-item-change"
              >
                <div class="form-marking-card-detail-item-change-title">
                  {{ $t('cloudpivot.list.pc.changeBefore') }}
                </div>
                <div
                  v-if="items.type === 6"
                  class="form-marking-card-detail-item-change-value"
                >
                  <template
                    v-if="items.beforeValue && items.beforeValue !== 'null'"
                  >
                    <div
                      v-for="(item, i) in attachmentFormate(items.beforeValue)"
                      :key="i"
                      class="attachment-wrap"
                    >
                      <div class="file-icon">
                        <span class="icon aufontAll fileIcon">&#xe91a;</span>
                      </div>
                      <!-- 名称 -->
                      <div class="name">
                        {{ item.name }}
                      </div>
                      <!-- 预览 -->
                      <!-- <div class="no-wrap" v-show="item.valid === true"><a @click="filePreview(item.refId, item)">预览</a></div> -->
                      <div class="no-wrap">
                        <a @click="filePreview(item.refId, item)">{{
                          $t('cloudpivot.list.pc.preview')
                        }}</a>
                      </div>
                      <!-- 下载 -->
                      <!-- <div class="no-wrap" v-show="item.valid === true"><a @click="onDownload(item.refId)">下载</a></div> -->
                      <div class="no-wrap">
                        <a @click="onDownload(item.refId)">{{
                          $t('cloudpivot.list.pc.download')
                        }}</a>
                      </div>
                    </div>
                  </template>
                </div>
                <div
                  v-else-if="items.type === 9"
                  class="form-marking-card-detail-item-change-value"
                >
                  <template
                    v-if="items.beforeValue && items.beforeValue !== 'null'"
                  >
                    <div
                      class="gldxText"
                      @click="
                        RelevanceFormChange(items.beforeValue, items.code)
                      "
                    >
                      {{ items.beforeValue.names }}
                    </div>
                  </template>
                </div>
                <div
                  v-else-if="items.type === 10"
                  class="form-marking-card-detail-item-change-value"
                >
                  {{ locationFormat(items.beforeValue) }}
                </div>
                <div
                  v-else-if="items.type === 11"
                  class="form-marking-card-detail-item-change-value"
                >
                  <template
                    v-if="items.beforeValue && items.beforeValue !== 'null'"
                  >
                    <div class="gldxTextCon">
                      <template v-if="items.beforeValue.length > 1">
                        <div
                          v-for="(con, indexs) in items.beforeValue"
                          :key="indexs"
                          class="gldxText"
                          @click="RelevanceFormChange(con, items.code)"
                        >
                          {{
                            indexs + 1 === items.beforeValue.length
                              ? con.names
                              : `${con.names};`
                          }}
                        </div>
                      </template>
                      <template v-else>
                        <div
                          v-for="(con, indexs) in items.beforeValue"
                          :key="indexs"
                          class="gldxText"
                          @click="RelevanceFormChange(con, items.code)"
                        >
                          {{ con.names }}
                        </div>
                      </template>
                    </div>
                  </template>
                </div>
                <div v-else class="form-marking-card-detail-item-change-value">
                  <!-- {{ items.beforeValue }} -->
                  <TextMarkingInfo
                    :item="items.beforeValue"
                    :elementId="'before_' + items.id"
                  />
                </div>
              </div>
              <div class="form-marking-card-detail-item-change">
                <div class="form-marking-card-detail-item-change-title">
                  {{
                    items.type === 8
                      ? '变更'
                      : $t('cloudpivot.list.pc.changeAfter')
                  }}
                </div>
                <div v-if="items.type === 2">
                  <span>
                    {{ items.afterValue }}
                    <a-icon
                      v-if="
                        isBigger(items.beforeValue, items.afterValue) ===
                        'bigger'
                      "
                      type="arrow-up"
                      class="arrow-up"
                    />
                    <a-icon
                      v-if="
                        isBigger(items.beforeValue, items.afterValue) ===
                        'smaller'
                      "
                      type="arrow-down"
                      class="arrow-down"
                    />
                  </span>
                </div>
                <div
                  v-else-if="items.type === 6"
                  class="form-marking-card-detail-item-change-value"
                >
                  <template
                    v-if="items.afterValue && items.afterValue !== 'null'"
                  >
                    <div
                      v-for="(item, key) in attachmentFormate(items.afterValue)"
                      :key="key"
                      class="attachment-wrap"
                    >
                      <div class="file-icon">
                        <span class="icon aufontAll fileIcon">&#xe91a;</span>
                      </div>
                      <!-- 名称 -->
                      <div class="name">
                        {{ item.name }}
                      </div>
                      <!-- 预览 -->
                      <!-- <div class="no-wrap" v-show="item.valid === true"><a @click="filePreview(item.refId, item)">预览</a></div> -->
                      <div class="no-wrap">
                        <a @click="filePreview(item.refId, item)">{{
                          $t('cloudpivot.list.pc.preview')
                        }}</a>
                      </div>
                      <!-- 下载 -->
                      <!-- <div class="no-wrap" v-show="item.valid === true"><a @click="onDownload(item.refId)">下载</a></div> -->
                      <div class="no-wrap">
                        <a @click="onDownload(item.refId)">{{
                          $t('cloudpivot.list.pc.download')
                        }}</a>
                      </div>
                    </div>
                  </template>
                </div>
                <div
                  v-else-if="items.type === 8"
                  class="form-marking-card-detail-item-change-value"
                >
                  <template
                    v-if="items.afterValue && items.afterValue !== 'null'"
                  >
                    <div class="zbText">
                      新增
                      <span class="zbTextA">{{ items.afterValue.Added }}</span>
                      条 修改
                      <span class="zbTextM">{{
                        items.afterValue.Modified
                      }}</span>
                      条 删除
                      <span class="zbTextD">{{
                        items.afterValue.Deleted
                      }}</span>
                      条<span
                        class="gldxText"
                        @click="
                          showSheetModal(
                            items.afterValue.trackChildDetailId,
                            items.afterValue.properties,
                            items.name,
                            items.afterValue.childPropertyCodes,
                          )
                        "
                        >查看</span>
                    </div>
                  </template>
                </div>
                <div
                  v-else-if="items.type === 9"
                  class="form-marking-card-detail-item-change-value"
                >
                  <template
                    v-if="items.afterValue && items.afterValue !== 'null'"
                  >
                    <div
                      class="gldxText"
                      @click="RelevanceFormChange(items.afterValue, items.code)"
                    >
                      {{ items.afterValue.names }}
                    </div>
                  </template>
                </div>
                <div
                  v-else-if="items.type === 10"
                  class="form-marking-card-detail-item-change-value"
                >
                  {{ locationFormat(items.afterValue) }}
                </div>
                <div
                  v-else-if="items.type === 11"
                  class="form-marking-card-detail-item-change-value"
                >
                  <template
                    v-if="items.afterValue && items.afterValue !== 'null'"
                  >
                    <div class="gldxTextCon">
                      <template v-if="items.afterValue.length > 1">
                        <div
                          v-for="(con, indexs) in items.afterValue"
                          :key="indexs"
                          class="gldxText"
                          @click="RelevanceFormChange(con, items.code)"
                        >
                          {{
                            indexs + 1 === items.afterValue.length
                              ? con.names
                              : `${con.names};`
                          }}
                        </div>
                      </template>
                      <template v-else>
                        <div
                          v-for="(con, indexs) in items.afterValue"
                          :key="indexs"
                          class="gldxText"
                          @click="RelevanceFormChange(con, items.code)"
                        >
                          {{ con.names }}
                        </div>
                      </template>
                    </div>
                  </template>
                </div>
                <!-- 其他 -->
                <div v-else class="form-marking-card-detail-item-change-value">
                  <!-- {{ items.afterValue }} -->
                  <TextMarkingInfo
                    :item="items.afterValue"
                    :elementId="'after_' + items.id"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <PageLoadingNew
          v-if="content.length !== 0"
          :loading="loadingType === 'loading'"
          :loadingText="loadingType === 'done' ? '已加载完全部留痕记录' : ''"
        />
        <div v-else class="no-marking">暂无数据</div>
      </div>
    </div>

    <img-preview
      v-if="previewVisible"
      :imgList="[{ url: viewPicList }]"
      @close="previewVisible = false"
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
      @cancel="sheetCancel"
    />
  </div>
</template>

<script lang="ts">
import {
  Divider,
  Icon,
  Modal,
  Pagination,
  Table,
  Timeline,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch, Inject } from 'vue-property-decorator';
import { listApi, listParams } from '../../../../../api';
import common from '../../../../../common/pc';
import getDownloadUrlNew from '../../../../../common/src/utils/getDownloadUrlNew';
import { renderer } from '../../../../../form';
import PCImagePreview from '../../../../../form/src/common/components/pc-image-preview.vue';
import TextMarkingInfo from './text-marking-info.vue';
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
    PageLoadingNew: common.components.PageLoadingNew,
    ImgPreview: PCImagePreview,
    TextMarkingInfo,
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

  viewPicList: String = '';

  loadingType: string = 'init'; //init 初始化 // loading 加载中, done加载完毕,

  busy: boolean = false;

  showSheetModals: boolean = false;

  sheetTitle: string = '';

  sheetDetailId: string = '';

  sheetColumnsName: any = {};

  childPropertyCodes: any = [];

  tempAuthSheetId: string = '';

  tempAuthObjectId: string = '';

  // 列表内容
  content: Array<any> = [];

  @Prop({ default: false }) isDetail?: boolean; // 详情页标识，详情页不展示title列

  @Prop({ default: () => [] }) dataItemList!: any[];

  @Inject({
    default: () => () => {},
  })
  formObjSource!: Function;

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
      width: 'auto',
      scopedSlots: { customRender: 'titles' },
    },
    {
      dataIndex: 'name',
      slots: { title: 'Content' },
      scopedSlots: { customRender: 'currentDataItem' },
      align: 'left',
      width: 100,
    },
    {
      // dataIndex: "beforeValue",
      slots: { title: 'Before' },
      scopedSlots: { customRender: 'before' },
      align: 'left',
      width: 190,
    },
    {
      // dataIndex: "afterValue",
      slots: { title: 'After' },
      scopedSlots: { customRender: 'after' },
      align: 'left',
      width: 190,
    },
  ];

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

    console.log(dataArray);

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
      window.open(url);
    } else {
      //Else Empty block statement
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
    console.log(url);
    window.open(url);
  }

  showSheetModal(id: string, ColumnsName: any, name: string, itemCodes: any) {
    const formObj: any = this.formObjSource();
    this.showSheetModals = true;
    this.sheetDetailId = id;
    this.sheetColumnsName = ColumnsName;
    this.childPropertyCodes = itemCodes;
    this.sheetTitle = name + '-变更详情';
    this.tempAuthSheetId = formObj.bizSheet.id;
    this.tempAuthObjectId = formObj.bizObject.id;
  }

  sheetCancel() {
    this.showSheetModals = false;
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

  filePreview(file: any, item: any) {
    const fileObj: any = {
      refId: file,
    };
    const fileName = item.name.split('.');
    if (
      ['bmp', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'tif'].includes(
        fileName[fileName.length - 1].toLowerCase(),
      )
    ) {
      // 预览图片
      const url = renderer.UploadControl.service.getDownloadUrl(fileObj);
      this.previewVisible = true;
      this.viewPicList = url;
      // console.log(this.checkImgExists(url),"---------------------------------URL")
    } else {
      // 预览附件
      fileObj.name = item.name; // 不传name无法预览
      const url = renderer.UploadControl.service.getPreviewUrl(fileObj);
      window.open(url);
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

  @Watch('collspanForPc', { immediate: true })
  collspanChange(val: any) {
    this.page = 1;
    // 计算是否需要
    if (true) {
      this.$nextTick(async () => {
        // await this.loadData()
        await this.getFormTrackItems();
        if (this.content.length === 0) {
          // this.$message.info("没有表单操作记录，无法查看", 2);
          return;
        }
      });
    }
  }

  async reload() {
    await this.getFormTrackItems();
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
      url += '&T=' + this.token;
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
    params.bizObjectId =
      (this.$route.query.objectId && this.$route.query.objectId.toString()) ||
      (this.$route.query.bizObjectId &&
        this.$route.query.bizObjectId.toString()) ||
      '';
    const res = await listApi.getFormMarkingDetail(params);
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
      if (type === 'pageChange') {
        if (this.page >= res.data.totalPages) {
          this.loadingType = 'done';
        }
        console.log('details', res.data);
        const { totalElements, content } = res.data;
        this.content = this.content.concat(content);
        this.content.forEach((table: any) => {
          if (table.list) {
            table.list.forEach((item: any) => {
              if (
                ![2, 6, 9, 10, 11, 8].includes(item.type) &&
                item.beforeValue.includes(';')
              ) {
                item.beforeValue = item.beforeValue.split(';').join('；');
              }
              if (
                ![2, 6, 9, 10, 11, 8].includes(item.type) &&
                item.afterValue.includes(';')
              ) {
                item.afterValue = item.afterValue.split(';').join('；');
              }
              if ([8].includes(item.type) && item.afterValue) {
                item.afterValue = JSON.parse(item.afterValue);
              }
              if ([8].includes(item.type) && item.beforeValue) {
                item.beforeValue = JSON.parse(item.beforeValue);
              }
              if ([9].includes(item.type) && item.afterValue) {
                item.afterValue = JSON.parse(item.afterValue);
                this.RelevanceFormName(
                  item.afterValue,
                  item.afterValue.displayCode,
                  item.afterValue.propertyType,
                );
              }
              if ([9].includes(item.type) && item.beforeValue) {
                item.beforeValue = JSON.parse(item.beforeValue);
                this.RelevanceFormName(
                  item.beforeValue,
                  item.beforeValue.displayCode,
                  item.beforeValue.propertyType,
                );
              }
              if ([11].includes(item.type) && item.afterValue) {
                item.afterValue = JSON.parse(item.afterValue);
                if (Array.isArray(item.afterValue)) {
                  for (const con of item.afterValue) {
                    this.RelevanceFormName(
                      con,
                      con.displayCode,
                      con.propertyType,
                    );
                  }
                }
              }
              if ([11].includes(item.type) && item.beforeValue) {
                item.beforeValue = JSON.parse(item.beforeValue);
                if (Array.isArray(item.beforeValue)) {
                  for (const con of item.beforeValue) {
                    this.RelevanceFormName(
                      con,
                      con.displayCode,
                      con.propertyType,
                    );
                  }
                }
              }
            });
          }
        });
        this.totalElements = totalElements;
      } else {
        console.log('details', res.data);
        const { totalElements, content } = res.data;
        this.content = content;
        this.content.forEach((table: any) => {
          if (table.list) {
            table.list.forEach((item: any) => {
              if (
                ![2, 6, 9, 10, 11, 8].includes(item.type) &&
                item.beforeValue.includes(';')
              ) {
                item.beforeValue = item.beforeValue.split(';').join('；');
              }
              if (
                ![2, 6, 9, 10, 11, 8].includes(item.type) &&
                item.afterValue.includes(';')
              ) {
                item.afterValue = item.afterValue.split(';').join('；');
              }
              if ([8].includes(item.type) && item.afterValue) {
                item.afterValue = JSON.parse(item.afterValue);
              }
              if ([8].includes(item.type) && item.beforeValue) {
                item.beforeValue = JSON.parse(item.beforeValue);
              }
              if ([9].includes(item.type) && item.afterValue) {
                item.afterValue = JSON.parse(item.afterValue);
                this.RelevanceFormName(
                  item.afterValue,
                  item.afterValue.displayCode,
                  item.afterValue.propertyType,
                );
              }
              if ([9].includes(item.type) && item.beforeValue) {
                item.beforeValue = JSON.parse(item.beforeValue);
                this.RelevanceFormName(
                  item.beforeValue,
                  item.beforeValue.displayCode,
                  item.beforeValue.propertyType,
                );
              }
              if ([11].includes(item.type) && item.afterValue) {
                item.afterValue = JSON.parse(item.afterValue);
                if (Array.isArray(item.afterValue)) {
                  for (const con of item.afterValue) {
                    this.RelevanceFormName(
                      con,
                      con.displayCode,
                      con.propertyType,
                    );
                  }
                }
              }
              if ([11].includes(item.type) && item.beforeValue) {
                item.beforeValue = JSON.parse(item.beforeValue);
                if (Array.isArray(item.beforeValue)) {
                  for (const con of item.beforeValue) {
                    this.RelevanceFormName(
                      con,
                      con.displayCode,
                      con.propertyType,
                    );
                  }
                }
              }
            });
          }
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

  //关联单选跳转
  async RelevanceFormChange(obj: any, code: string) {
    const params = {
      bizObjectId: obj.id,
      schemaCode: obj.schemaCode,
      formCode: obj.schemaCode,
    };
    const formObj: any = this.formObjSource();
    let res: any = await listApi.getFormUrl(params);
    // 如果报错, 会返回一个对象
    if (typeof res === 'object' && res.errcode !== 0) {
      return this.$message.error(res.errmsg as string, 3);
    }
    // 否则返回一个字符串
    else if (typeof res === 'string') {
      res +=
        '&tempAuthSheetId=' +
        formObj.bizSheet.id +
        '&tempAuthObjectId=' +
        formObj.bizObject.id +
        '&tempAuthPropertyCode=' +
        code;
      window.open(res);
    } else {
      //Else Empty block statement
    }
  }

  // async loadData() {
  //   const params: listParams.FormMarkingListParam = {
  //     page: this.page,
  //     size: this.size
  //   }
  //   params.bizObjectId =
  //   (this.$route.query.objectId && this.$route.query.objectId.toString())||
  //   (this.$route.query.bizObjectId && this.$route.query.bizObjectId.toString()) ||
  //   ''
  //   const res = await listApi.getFormMarkingDetail(params)
  //   if(res.errcode === 0) {
  //     console.log('details', res.data)
  //     const { totalElements, content } = res.data
  //     this.content = content
  //     this.totalElements = totalElements
  //   }
  // }

  // onPageChange(e: number) {
  //   this.page = e
  //   this.loadData()
  // }
}
</script>

<style lang="less" scoped>
.form-marking-modal-wrap {
  height: 100%;
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
  .form-marking-modal-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    & .form-marking-modal-body {
      height: 100%;
      overflow-y: scroll;
      padding-right: 11px;
      margin-bottom: 12px;
      .no-marking {
        text-align: center;
        position: relative;
        top: 20vh;
        font-size: 14px;
        color: rgba(1, 1, 1, 0.45);
      }
    }
  }

  .pagin-wrap {
    text-align: right;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .form-marking-infos {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 16px;
    .ant-divider {
      background: rgba(0, 0, 0, 0.85);
    }
  }

  .arrow-up {
    color: #db6d6d;
  }

  .arrow-down {
    color: #83b350;
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
      margin-left: 15px;
    }
  }
}
.form-marking-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  padding: 12px 16px 16px 16px;
  & + .form-marking-card {
    margin-top: 16px;
  }
  &-title {
    display: flex;
    align-items: center;
    padding-bottom: 12px;
    box-shadow: 0px 1px 0px 0px #eeeeee;
    &-img {
      min-width: 32px;
      max-width: 32px;
      height: 32px;
      border-radius: 50%;
      & > img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid #ddd;
      }
      & > i.default-avatar {
        font-size: 32px;
        line-height: 32px;
        color: #ffb131;
      }
    }
    &-name {
      margin-left: 12px;
      width: 100%;
      height: 22px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #111218;
      line-height: 22px;
    }
    &-time {
      min-width: 130px;
      text-align: right;
      height: 20px;
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      line-height: 20px;
    }
  }
  &-detail {
    padding-top: 12px;
    &-item {
      & + .form-marking-card-detail-item {
        margin-top: 16px;
      }
      &-title {
        height: 20px;
        font-size: 12px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #111218;
        line-height: 20px;
        margin-bottom: 6px;
      }
      &-change {
        display: flex;
        width: 100%;
        & + .form-marking-card-detail-item-change {
          margin-top: 4px;
        }
        &-title {
          min-width: 48px;
          height: 20px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(17, 18, 24, 0.5);
          line-height: 20px;
        }
        &-value {
          width: calc(100% - 48px);
          min-height: 20px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #111218;
          line-height: 20px;
          word-wrap: break-word;
          text-align: justify;
          word-break: break-all;
        }
        & .attachment-wrap {
          width: 100%;
          display: flex;
          & .file-icon {
            margin-right: 4px;
            font-size: 12px;
            color: #111218;
            & .fileIcon {
              font-size: 12px;
              color: #111218;
            }
          }
          & .name {
            width: 200px;
            margin-right: 6px;
            height: 20px;
            font-size: 12px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #111218;
            line-height: 20px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          & .no-wrap {
            min-width: 24px;
            height: 20px;
            font-size: 12px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #2970ff;
            line-height: 20px;
            & + .no-wrap {
              margin-left: 12px;
            }
          }
        }
      }
    }
  }
}
.file-preview {
  /deep/.ant-modal-content {
    height: 600px;
    & .ant-modal-body {
      display: flex;
      flex-flow: column;
      height: unset;
      padding: 24px 0px 24px 48px;
      & .preview-img {
        height: 476px;
        padding-right: 48px;
        overflow: auto;
        & .img-preview {
          width: 100%;
          border-radius: 2px;
        }
      }
    }
  }
}
</style>

<style lang="less">
.form-marking-line {
  .ant-timeline-item-last > .ant-timeline-item-tail {
    display: block;
  }
  .ant-table-thead > tr > th {
    font-weight: 600;
  }
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 8px;
  }
}
</style>

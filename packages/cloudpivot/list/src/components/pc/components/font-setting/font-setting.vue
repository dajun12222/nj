<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-12-07 18:49:39
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:24:32
-->

<template>
  <div class="font-setting">
    <div class="font-setting-search">
      <InputSearch
        v-model="searchKey"
        :placeholder="$t('cloudpivot.list.pc.placeInputSearch')"
        :allowClear="true"
        :isAsync="true"
        @search="onSearch"
      />
    </div>
    <div
      v-if="queryPresentationType === 'GANTT' && columnsQueryShowLength !== 0"
      class="drag-header"
    >
      <div>甘特图</div>
      <div class="list">列表</div>
    </div>
    <div v-if="!chooseSheet" class="drag-box">
      <Draggable :list="columns" :options="dragOptions" @update="listChange">
        <template v-for="(item, index) in columns">
          <div
            v-if="item.queryShow"
            :key="index"
            :class="{
              'drag-box-li': true,
              sheet: item.initChildColumns && item.isShow,
            }"
          >
            <div class="drag-box-left">
              <i class="icon aufontAll h-icon-all-drag"></i>
              <span
                v-hight-light="{
                  keyWords: searchKey,
                  value: getNameCnOrEng(item),
                }"
                :title="getNameCnOrEng(item)"
              ></span>
            </div>
            <div
              class="drag-box-right"
              :class="{ notgantt: queryPresentationType !== 'GANTT' }"
            >
              <!-- 视图列表 -->
              <a-switch
                v-model="item.isShow"
                class="list-switch"
                size="small"
                @change="onChange($event, item)"
              />
              <!-- 甘特图 -->
              <a-switch
                v-show="ganttViewSettingList.includes(item.key)"
                v-model="item.display"
                class="gantt-switch"
                size="small"
                @change="onGanttChange($event, item)"
              />
            </div>
            <div
              v-if="item.initChildColumns && item.isShow"
              class="sheet-setting"
            >
              <span class="text" @click="openSheetColumnsSetting(item)">
                子表字段设置
              </span>
              <span
                class="icon aufontAll h-icon-all-right"
                @click="openSheetColumnsSetting(item)"
              ></span>
            </div>
          </div>
        </template>
      </Draggable>
      <div v-if="columnsQueryShowLength === 0" class="setting_empty">
        <div class="setting_empty_wrapper">
          <img src="./../no-data/images/no-data.png" alt="" />
          <p>暂无内容</p>
        </div>
      </div>
    </div>

    <div v-if="chooseSheet" class="drag-box sheet-columns">
      <div class="title-top">
        <span class="back" @click="closeSheetColumnsSetting">返回</span>
        <span class="name">{{ selectedSheetData.vcTitle }}</span>
      </div>
      <Draggable
        :list="selectedSheetData.initChildColumns"
        :options="dragOptions"
        :disabled="searchKey"
        class="sheet-content-wrapper"
        @update="listChange"
      >
        <template v-for="(item, index) in selectedSheetData.initChildColumns">
          <div
            v-if="item.queryShow"
            :key="index"
            :class="{
              'drag-box-li': true,
            }"
          >
            <div class="drag-box-left">
              <i v-if="!searchKey" class="icon aufontAll h-icon-all-drag"></i>
              <span
                v-hight-light="{
                  keyWords: searchKey,
                  value: getNameCnOrEng(item),
                }"
                :title="getNameCnOrEng(item)"
              ></span>
            </div>
            <div class="drag-box-right notgantt">
              <!-- 视图列表 -->
              <a-switch
                v-model="item.isShow"
                class="list-switch"
                size="small"
                @change="onChange($event, item)"
              />
            </div>
          </div>
        </template>
      </Draggable>
    </div>
  </div>
</template>
<script lang="ts">
import { Input, Switch } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import zhToen from '../../locales/zhToEn';
import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

@Component({
  name: 'font-setting',
  components: {
    AInput: Input,
    InputSearch,
    ASwitch: Switch,
    Draggable,
  },
})
export default class FontSetting extends Vue {
  @Prop() columns!: Array<any>; //视图列表显示字段设置

  @Prop() queryPresentationType!: string; //视图类型

  @Prop() listConfig!: any; //甘特图

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  searchKey: string = '';

  // 拖拽排序配置
  dragOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 50,
  };

  ganttViewSettingList: any[] = [];

  //是否展开子表
  chooseSheet: boolean = false;

  //选中子表的可展示列
  selectedSheetData: any = null;

  mounted() {
    //默认筛选都显示
    this.columns = this.columns.map((owner) => {
      owner.queryShow = true;
      return owner;
    });

    this.searchKey = '';
    if (this.listConfig && this.listConfig.queryGanttModel) {
      this.ganttViewSettingList = [];
      const ganttTaskLabelList = [
        'titlePropertyCode',
        'startTimePropertyCode',
        'endTimePropertyCode',
        'progressPropertyCode',
        'liableManCode',
        'statusCode',
      ];
      ganttTaskLabelList.forEach((item) => {
        this.ganttViewSettingList.push(this.listConfig.queryGanttModel[item]);
      });
    }
  }

  get columnsQueryShowLength() {
    const columnsQueryShowList = this.columns.filter((owner) => {
      return owner.queryShow;
    });
    return columnsQueryShowList.length;
  }

  listChange(e) {
    this.$emit('confirm', this.columns);
  }

  onChange(checked, item) {
    if (
      this.chooseSheet &&
      this.selectedSheetData &&
      this.selectedSheetData.initChildColumns
    ) {
      if (
        this.selectedSheetData.initChildColumns.every((item) => !item.isShow)
      ) {
        this.selectedSheetData.isShow = false;
      } else if (
        this.selectedSheetData.initChildColumns.filter((item) => item.isShow)
          .length === 1
      ) {
        this.selectedSheetData.isShow = true;
      } else {
        //Else Empty block statement
      }
    }
    if (
      item.propertyType === 8 &&
      item.isShow &&
      item.initChildColumns.every((el) => !el.isShow)
    ) {
      item.initChildColumns.forEach((child) => {
        child.isShow = true;
      });
    }
    this.$emit('confirm', this.columns);
  }

  /**
   * 甘特图选择任务条上显示字段
   */
  onGanttChange(checked, item) {
    const displayNodes = this.columns.filter((node) => {
      return node.display && this.ganttViewSettingList.includes(node.key);
    });
    if (displayNodes.length > 5) {
      item.display = false;
      this.$message.error('甘特图显示字段最多展示5个');
    } else {
      this.$emit('confirm', this.columns);
    }
  }

  zhToen: any = {};

  created() {
    this.zhToen = zhToen;
  }

  isSystemFont(font: string) {
    const keys = Object.keys(zhToen);
    return keys.includes(font);
  }

  onSearch() {
    this.$emit('search', this.searchKey, this.chooseSheet);
  }

  /**
   * 点击子表字段设置图标
   */
  openSheetColumnsSetting(sheet) {
    this.chooseSheet = true;
    this.selectedSheetData = sheet;
    this.searchKey = '';
    this.$emit('search', '', this.chooseSheet);
  }

  /**
   * 关闭子表列设置界面
   */
  closeSheetColumnsSetting() {
    this.chooseSheet = false;
    this.selectedSheetData = null;
    this.searchKey = '';
  }

  /**
   * 中英文名称
   */
  getNameCnOrEng(item) {
    return this.isChinese || !item.name_i18n
      ? item.vcTitle
      : zhToen[item.name_i18n[this.$i18n.locale]] ||
          item.name_i18n[this.$i18n.locale] ||
          zhToen[JSON.parse(item.name_i18n)[this.$i18n.locale]] ||
          JSON.parse(item.name_i18n)[this.$i18n.locale];
  }
}
</script>
<style lang="less" scoped>
.font-setting {
  width: 312px;
  height: 384px;
  padding-top: 16px;
  &-search {
    padding: 0 16px;
    /deep/.ant-input-suffix {
      color: rgba(17, 18, 24, 0.25);
    }
  }
  .drag-header {
    overflow: hidden;
    padding-right: 16px;
    margin-top: 8px;
    color: rgba(17, 18, 24, 0.5);
    > div {
      float: right;
    }
    .list {
      margin-right: 33px;
    }
  }
  .drag-box {
    height: 310px;
    max-height: 310px;
    overflow: auto;
    padding: 0 2px 0 8px;
    position: relative;
    &.sheet-columns {
      height: 330px;
      max-height: 330px;
      overflow: hidden;
      .title-top {
        font-size: 12px;
        height: 50px;
        display: flex;
        align-items: center;
        padding-left: 10px;
        .back {
          color: #2970ff;
          padding-right: 13px;
          cursor: pointer;
        }
        .name {
          color: #88888b;
        }
      }
      .sheet-content-wrapper {
        max-height: 280px;
        overflow: auto;
      }
    }
    &-li {
      display: flex;
      justify-content: space-between;
      height: 36px;
      padding: 0 8px;
      align-items: center;
      cursor: grab;
      border-radius: 4px;
      &:hover {
        background-color: rgba(0, 30, 116, 0.06);
      }
      &:active {
        box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
        background-color: #fff;
      }
      &:first-child {
        margin-top: 8px;
      }
      &.sheet {
        flex-flow: wrap;
        height: 72px;
        .sheet-setting {
          top: 36px;
          display: flex;
          align-items: center;
          padding-left: 30px;
          height: 36px;
          width: 100%;
          padding-right: 6px;
          justify-content: space-between;
          font-size: 12px;
          margin-left: -8px;
          .text {
            color: #2970ff;
            cursor: pointer;
          }
          .icon {
            font-size: 14px;
            cursor: pointer;
          }
        }
      }
      .drag-box-left {
        width: 175px;
        max-width: 175px;
        line-height: 36px;
        display: inline-block;
        vertical-align: middle;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        i {
          font-size: 12px;
          color: rgba(17, 18, 24, 0.25);
          margin-right: 8px;
          cursor: pointer;
        }
        > span {
          width: 150px;
          font-size: 14px;
          font-weight: 400;
          color: #111218;
        }
      }
      .drag-box-right {
        flex: 1;
        margin-right: 5px;
        text-align: right;
        .list-switch {
          float: left;
        }
        .gantt-switch {
          float: right;
          margin-right: 5px;
        }
      }
      .notgantt {
        .list-switch {
          float: right;
        }
      }
    }
    .setting_empty {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10;
      background: #ffffff;
      .setting_empty_wrapper {
        position: relative;
        top: 12%;
        text-align: center;
        img {
          width: 204px;
          height: 204px;
        }
        p {
          font-size: 14px;
          color: rgba(17, 18, 24, 0.5);
        }
      }
    }
    &::-webkit-scrollbar {
      width: 6px;
      height: 50px;
      background: rgba(17, 18, 24, 0.25);
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(17, 18, 24, 0.25);
      border-radius: 3px;
    }
  }
}
</style>

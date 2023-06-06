<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <template v-if="fromForm">
      <div class="input-modal" @click.stop="modalVisible = true">
        <span class="txt">{{
          value && value.length > 0 ? '已设置' : '未设置'
        }}</span>
        <i class="aufontAll h-icon-all-ellipsis-o"></i>
      </div>
    </template>
    <span
      v-else
      class="icons"
      title="添加字段"
      @click.stop="modalVisible = true"
    >
      <i class="aufontAll h-icon-all-plus-o"></i>
    </span>
    <a-modal
      v-model="modalVisible"
      :cancelText="$t('cloudpivot.list.pc.Cancel')"
      :maskClosable="false"
      :okText="$t('cloudpivot.list.pc.startExport')"
      :width="866"
      centered
      wrapClassName="aside-dialog"
      @cancel="closeLevel1Popover"
    >
      <template slot="title">
        <span>{{ title }}</span>
      </template>
      <div class="data-box">
        <div class="data-left">
          <div class="data-left-top">
            <div class="check-all">
              <a-checkbox
                :checked="isAllChecked"
                class="checkbox"
                @click="handleAllCheck"
              />
              <span class="left">{{ $t('cloudpivot.list.pc.checkAll1') }}</span>
            </div>
            <div class="data-left-search">
              <InputSearch
                v-model="field"
                :placeholder="$t('cloudpivot.list.pc.placeInputSearch')"
                :isAsync="true"
                :allowClear="true"
              />
            </div>
          </div>

          <div class="data-left-list">
            <div class="data-list">
              <div class="data-list-sub-title">
                {{ $t('cloudpivot.list.pc.bizDataItem') }}
              </div>
              <div
                v-for="(i, index) in filterBusinessData"
                :key="index"
                class="check-item"
              >
                <a-checkbox
                  v-model="i.checked"
                  class="checkbox"
                  @change="changeItem"
                />
                <span class="left" :title="titleStr(i)">
                  {{ nameStr(i) }}
                </span>
              </div>
            </div>
            <div class="data-list">
              <div class="data-list-sub-title">
                {{ $t('cloudpivot.list.pc.sysDataItem') }}
              </div>
              <div
                v-for="(i, index) in filterSystemData"
                :key="index"
                class="check-item"
              >
                <a-checkbox
                  v-model="i.checked"
                  class="checkbox"
                  @change="changeItem"
                />
                <span class="left" :title="titleStr(i)">
                  {{ nameStr(i) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="data-right">
          <div class="data-right-title">
            {{ $t('cloudpivot.list.pc.selectedField') }}：
            <span>{{ totleSelected + '个' }}</span>
            <span class="clear-all" @click="clearAll">清空</span>
          </div>

          <div class="data-right-items">
            <template v-if="filterCheckedBusinessData.length">
              <h4>{{ $t('cloudpivot.list.pc.bizDataItem') }}</h4>
              <div
                v-for="(item, index) in filterCheckedBusinessData"
                :key="item.code + index"
                class="data-right-li"
              >
                <div class="name-wrap" :title="titleStr(item)">
                  <span>{{ titleStr(item) }}</span>
                </div>
                <span
                  class="icon aufontAll h-icon-all-close del"
                  @click="unChecked(item)"
                ></span>
              </div>
            </template>
            <template v-if="filterCheckedSystemData.length">
              <h4 class="system">{{ $t('cloudpivot.list.pc.sysDataItem') }}</h4>
              <div
                v-for="(item, index) in filterCheckedSystemData"
                :key="item.code + index"
                class="data-right-li"
              >
                <div class="name-wrap" :title="titleStr(item)">
                  <span>{{ titleStr(item) }}</span>
                </div>
                <span
                  class="icon aufontAll h-icon-all-close del"
                  @click="unChecked(item)"
                ></span>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div slot="footer" class="h3-organization-footer">
        <div>
          <a-button type="default" @click="closeLevel1Popover">
            {{ $t('cloudpivot.list.pc.Cancel') }}
          </a-button>
          <a-button
            type="primary"
            :disabled="$route.path.includes('apps/versionDetail/')"
            @click="comfirmLevel1Popover"
          >
            {{ $t('cloudpivot.list.pc.OK') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Icon, Popover, Checkbox, Button, Modal, Input } from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'Dialog',
  components: {
    AIcon: Icon,
    APopover: Popover,
    ACheckbox: Checkbox,
    AButton: Button,
    AModal: Modal,
    AInputSearch: Input.Search,
    InputSearch,
  },
})
export default class Dialog extends Vue {
  @ListdesignModule.State('showFieldArray') showFieldArray: any;

  @ListdesignModule.Mutation('onEdit') onEdit: any;

  @Prop() propDataList!: Array<any>;

  @Prop() fieldBlock!: number;

  @Prop({ default: false }) fromForm!: boolean;

  @Prop() value!: any;

  field: string = ''; //左侧搜索框内容

  wrapStyle = { left: '624px' };

  // /* 服务器获取的原始数据 */
  // originDatas:any[] = [];

  dialogList: any[] = [];

  fblock: number = -1;

  modalVisible: boolean = false;

  dialogListDefault: any[] = [];

  isAllChecked: boolean = false;

  zhToEn: any = zhToEn;

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  // 获取非系统数据key
  getKey(cur: any) {
    let name: any = cur.name;
    if (cur.name_i18n) {
      let name_i18n: any;
      if (typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n);
      } else {
        name_i18n = cur.name_i18n;
      }
      if (name_i18n[this.$i18n.locale]) {
        name = name_i18n[this.$i18n.locale];
      }
    }
    return name;
  }

  created() {
    // this.dialogList;
  }

  toggleChecked(item) {
    item.checked = !item.checked;
    if (!item.isSystem) {
      //非系统数据项添加时默认为同步默认格式，且直接发布时保存默认同步格式
      item.data.syncDefaultFormat = item.checked;
      item.syncDefaultFormat = item.checked;
    }
    /* console.log('===============>asideDialog'); */
    if (
      item.propertyType === 9 &&
      item.data &&
      JSON.parse(item.data.options).showStyle === 'tree'
    ) {
      item.choiceType = 2;
      item.data.choiceType = 2;
    }
    this.isAllChecked = this.dialogList.every((res: any) => res.checked);
  }

  toggleCheckedSheet(e, v, o) {
    const item = this.dialogList[v];
    item.subSchema.properties[o].checked = !e.checked;

    this.$set(this.dialogList, v, item);
  }

  /* icon点击 */
  handleIcon(e, i: number) {
    const item = this.dialogList[i];
    item.checked = e.target.checked;
    this.$set(this.dialogList, i, item);
    this.isAllChecked = this.dialogList.every((res: any) => res.checked);
  }

  changeDialogListChecked(ck: boolean, i: number) {
    // this.dialogList[i].checked = !ck;
    const item = this.dialogList[i];
    item.checked = !ck;
    // 手动触发刷新
    // this.$set(this.dialogList, i, item);
    // this.dialogList.splice(i,1,item);
  }

  handleAllCheck() {
    this.isAllChecked = !this.isAllChecked;
    this.dialogList.forEach((item) => {
      item.checked = this.isAllChecked;
    });
    this.dialogList = JSON.parse(JSON.stringify(this.dialogList));
  }

  clearAll() {
    this.isAllChecked = false;
    this.dialogList.forEach((item) => {
      item.checked = this.isAllChecked;
    });
    this.changeItem();
  }

  /* add弹窗-确定 */
  comfirmLevel1Popover() {
    this.$emit('addcomfirm', this.fieldBlock, this.dialogList);
    // 更新弹出框的数据
    this.updateDialogListDefault();
    this.onEdit(true);
    this.modalVisible = false;
    this.field = '';
  }

  // /* add弹窗-取消 */`
  closeLevel1Popover() {
    const arr = JSON.parse(JSON.stringify(this.dialogListDefault));
    this.dialogList = arr;
    this.modalVisible = false;
    this.field = '';
  }

  // 更新默认数据
  updateDialogListDefault() {
    this.dialogListDefault = this.dialogList;
  }

  /**
   * 下拉选择值赋值
   */
  @Watch('propDataList', {
    immediate: true,
  })
  linsteningdialogData(v: any) {
    if (this.fromForm) {
      v.forEach((item) => {
        if (this.value.includes(item.code)) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });
    }
    this.dialogList = v;
    this.dialogListDefault = JSON.parse(JSON.stringify(v));
    if (v) {
      const arr = v.filter((res: any) => !res.checked);

      if (arr.length === 0) {
        this.isAllChecked = true;
      } else {
        this.isAllChecked = false;
      }
    }
  }

  beforeDestroy() {
    this.$off('addcomfirm');
  }

  get filterSystemData() {
    return this.dialogList.filter((item) => {
      return (
        (item.isSystem || item.defaultProperty) &&
        item.name.includes(this.field)
      );
    });
  }

  get filterCheckedSystemData() {
    return this.dialogList.filter((item) => {
      return (item.isSystem || item.defaultProperty) && item.checked;
    });
  }

  get filterBusinessData() {
    return this.dialogList.filter((item) => {
      return (
        !(item.isSystem || item.defaultProperty) &&
        item.name.includes(this.field)
      );
    });
  }

  get filterCheckedBusinessData() {
    return this.dialogList.filter((item) => {
      return !(item.isSystem || item.defaultProperty) && item.checked;
    });
  }

  get totleSelected() {
    return this.dialogList.filter((item) => item.checked).length;
  }

  get title() {
    if (this.fromForm) {
      return '设置弹出框字段';
    }
    switch (this.fieldBlock) {
      case 0:
        return '设置查询条件';
      case 1:
        return '设置展示字段';
      case 2:
        return '设置排序字段';
      default:
        break;
    }
  }

  changeItem() {
    this.dialogList = JSON.parse(JSON.stringify(this.dialogList));
  }

  unChecked(item) {
    item.checked = false;
    this.changeItem();
  }

  titleStr(item) {
    //数据源的字段由于有拼接逻辑，不考虑中英文
    if (this.schemaCode !== item.schemaCode) {
      return item.name + '[' + item.code + ']';
    }
    return this.isChinese
      ? (typeof item.name_i18n === 'string' && item.name_i18n
          ? JSON.parse(item.name_i18n).zh || item.name
          : (item.name_i18n && item.name_i18n.zh) || item.name) +
          '[' +
          item.code +
          ']'
      : (typeof item.name_i18n === 'string' && item.name_i18n
          ? JSON.parse(item.name_i18n).en || item.name
          : (item.name_i18n && item.name_i18n.en) || item.name) +
          '[' +
          item.code +
          ']';
  }

  nameStr(item) {
    //数据源的字段由于有拼接逻辑，不考虑中英文
    if (this.schemaCode !== item.schemaCode) {
      return item.name;
    }
    return this.isChinese
      ? typeof item.name_i18n === 'string' && item.name_i18n
        ? JSON.parse(item.name_i18n).zh || item.name
        : (item.name_i18n && item.name_i18n.zh) || item.name
      : typeof item.name_i18n === 'string' && item.name_i18n
      ? zhToEn[JSON.parse(item.name_i18n).en] ||
        JSON.parse(item.name_i18n).en ||
        item.name
      : (item.name_i18n && (zhToEn[item.name_i18n.en] || item.name_i18n.en)) ||
        item.name;
  }

  /**
   * 业务模型编码
   */
  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }
}
</script>

<style lang="less">
.aside-dialog {
  .h-icon-all-plus-o {
    &:hover {
      color: #2970ff;
    }
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
      color: #111218;
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
  }

  .data-right {
    width: 244px;
    height: 100%;
  }
  .data-box {
    width: 100%;
    border-radius: 2px;
    border: 1px solid #dddddd;
    display: flex;
    max-height: 548px;
    height: calc(100vh - 248px);
    overflow: hidden;
    > .data-left {
      flex: 1;
      height: 100%;
      min-width: 400px;
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
            background-color: #2970ff;
            position: absolute;
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
        padding: 0 16px 8px 16px;
        margin-bottom: 21px;
        position: relative;
        > span {
          font-weight: 400;
        }
        .clear-all {
          color: #2970ff;
          position: absolute;
          right: 16px;
          cursor: pointer;
        }
      }
      .data-right-items {
        height: calc(100% - 26px);
        padding: 0 0 0 6px;
        overflow-y: scroll;
        h4 {
          font-size: 14px;
          line-height: 20px;
          color: rgba(17, 18, 24, 0.5);
          margin-bottom: 8px;
          margin-left: 10px;
          &.system {
            margin-top: 15px;
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
        padding: 0 35px 0 10px;
        position: relative;
        .name-wrap {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        &:hover {
          background: #eef4fd;
          i {
            color: #2970ff;
          }
        }
        .del {
          position: absolute;
          right: 18px;
          top: 5px;
          cursor: pointer;
        }
        &.chosen {
          background: #ffffff;
          box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
          border-radius: 4px;
        }
        i {
          color: rgba(17, 18, 24, 0.5);
          font-size: 16px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>

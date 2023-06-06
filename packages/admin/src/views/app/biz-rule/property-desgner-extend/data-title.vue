<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div
    class="data-title"
    :class="{
      transverse: layoutType === 'transverse' && !label,
      'label-wrap': label,
    }"
  >
    <div v-if="label" class="head">
      <div class="label" :class="{ labelTips: labelTips }">{{ label }}</div>
      <div
        class="data-title-select"
        :class="{ dataTitleToTop: dataTitleToTop }"
        @click="selectdataItem"
      >
        <a-dropdown overlayClassName="data-title-dropdown">
          <a class="ant-dropdown-link" href="javascript:void(0)">
            {{ layoutType === 'transverse' ? '插入数据项' : '选择表单字段' }}
          </a>
          <a-menu slot="overlay">
            <a-menu-item-group key="g1">
              <template slot="title">
                <span>业务数据项</span>
              </template>

              <a-menu-item
                v-for="item in bizSummaryList"
                :key="item.code"
                @click="pushDataItem(item)"
              >
                <a href="javascript:;">{{ item.name }}</a>
              </a-menu-item>
            </a-menu-item-group>

            <a-menu-item-group key="g2">
              <template slot="title">
                <span>系统数据项</span>
              </template>

              <a-menu-item
                v-for="item in defaultSummaryList"
                :key="item.code"
                @click="pushDataItem(item)"
              >
                <a href="javascript:;">{{ item.name }}</a>
              </a-menu-item>
            </a-menu-item-group>
          </a-menu>
        </a-dropdown>
      </div>
    </div>

    <div class="text-area">
      <div
        :id="contentId"
        ref="ruleHTMLRef"
        class="ant-input rule-html-ref"
        contenteditable="true"
        @blur="textblur"
      ></div>
    </div>
    <div v-if="!label" class="data-title-select" @click="selectdataItem">
      <a-dropdown overlayClassName="data-title-dropdown">
        <a class="ant-dropdown-link" href="javascript:void(0)">
          {{ layoutType === 'transverse' ? '插入数据项' : '选择表单字段' }}
        </a>
        <a-menu slot="overlay">
          <a-menu-item-group key="g1">
            <template slot="title">
              <span>业务数据项</span>
            </template>

            <a-menu-item
              v-for="item in bizSummaryList"
              :key="item.code"
              @click="pushDataItem(item)"
            >
              <a href="javascript:;">{{ item.name }}</a>
            </a-menu-item>
          </a-menu-item-group>

          <a-menu-item-group key="g2">
            <template slot="title">
              <span>系统数据项</span>
            </template>

            <a-menu-item
              v-for="item in defaultSummaryList"
              :key="item.code"
              @click="pushDataItem(item)"
            >
              <a href="javascript:;">{{ item.name }}</a>
            </a-menu-item>
          </a-menu-item-group>
        </a-menu>
      </a-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import AppsApi from '@/apis/apps';
import { Dropdown, Menu } from '@h3/antd-vue';
import { PropertyComponent } from 'cloudpivot-designer/designer-core/property-panel';
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
function textBeComeImg(
  text: string,
  fontColor: string = '#1890ff',
  fontSize: number = 14,
) {
  const canvas = document.createElement('canvas');
  //小于32字加1  小于60字加2  小于80字加4    小于100字加6
  let $buHeight = 0;
  if (fontSize <= 32) {
    $buHeight = 1.2;
  } else if (fontSize > 32 && fontSize <= 60) {
    $buHeight = 2;
  } else if (fontSize > 60 && fontSize <= 80) {
    $buHeight = 4;
  } else if (fontSize > 80 && fontSize <= 100) {
    $buHeight = 6;
  } else if (fontSize > 100) {
    $buHeight = 10;
  } else {
    //Else Empty block statement
  }
  //对于g j 等有时会有遮挡，这里增加一些高度
  canvas.height = fontSize + $buHeight;
  const context: any = canvas.getContext('2d');
  // 擦除(0,0)位置大小为200x200的矩形，擦除的意思是把该区域变为透明
  context.fillStyle = fontColor;
  context.font = fontSize + 'px PingFangSC-RegularPingFangSC-Regular';
  context.textBaseline = 'middle';
  context.fillText(text, 0, fontSize / 2);

  canvas.width = context.measureText(text).width;
  context.fillStyle = fontColor;
  context.font = fontSize + 'px PingFangSC-Regular';
  context.textBaseline = 'middle';
  context.fillText(text, 0, fontSize / 2);
  // context.clearRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/png'); //注意这里背景透明的话，需要使用png
}
const ruleHTMLNode: any = '';

@Component({
  name: 'data-title',
  components: {
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AMenuItemGroup: Menu.ItemGroup,
    ASubMenu: Menu.SubMenu,
  },
})
export default class DataTitle extends Mixins(PropertyComponent) {
  @Prop() targetSchemaCode!: string;

  @Prop({
    default: false,
  })
  labelTips?: boolean;

  @Prop({
    default: false,
  })
  dataTitleToTop?: boolean;

  @Prop({
    default: 'in',
  })
  layoutType?: 'transverse' | 'in'; // 选择表单字段： transverse: 左右布局， in: 在输入框中

  @Prop({
    default: '',
  })
  label?: string;

  @Prop() list?: any[];

  get defaultSummaryList(): any[] {
    return this.dataItem.filter((data: any) => data.defaultProperty);
  }

  get bizSummaryList() {
    return this.dataItem.filter((data: any) => !data.defaultProperty);
  }

  contentId = `content${this.getGuid()}`;

  ruleHTMLNode: any = '';
  // getFocus() {
  //     this.$refs.select.focus()
  // }

  getGuid() {
    // 生成随机ID
    return `r${new Date().getTime()}d${Math.ceil(Math.random() * 1000)}`;
  }

  mounted() {
    this.$nextTick(() => {
      document.addEventListener('click', this.outFocus);
      document.addEventListener('selectionchange', this.selectHandler);
    });

    // const data = this.modalData.data;
  }

  destoryed() {
    document.removeEventListener('click', this.outFocus);
  }

  outFocus() {
    this.inputting = false;
  }

  reset() {
    this.contentId = `content${this.getGuid()}`;

    this.$nextTick(() => {
      this.ruleHTMLNode = document.getElementById(this.contentId);
      this.clean();
      this.loadData();
    });
  }

  inputting = false;

  selectdataItem() {
    this.inputting = true;
  }

  parseStringToNode(val) {
    const tempStr = '';
    val.forEach((res) => {
      if (res.isDataItem === 1) {
        const d = this.dataItem.find((item) => item.code === res.code);
        if (d) {
          const dataItem = d;
          const imgID = Math.ceil(Math.random() * 1000) + dataItem.code;
          const imgSrc = textBeComeImg(dataItem.name);
          const imgNode = `<img src="${imgSrc}" id="${imgID}" data-val='${dataItem.code}'>`;
          this.ruleHTMLNode.insertAdjacentHTML('beforeend', imgNode);
        }
      } else {
        this.ruleHTMLNode.insertAdjacentText('beforeend', res.code);
      }
    });
  }

  textblur() {
    setTimeout(() => {
      if (this.inputting) {
        return;
      }
      const backData = this.formatterRuleHTML();
      this.emitChange(backData);
    }, 200);
  }

  formatterRuleHTML() {
    const backData: any = [];
    for (const n of this.ruleHTMLNode.childNodes) {
      const item = {
        isDataItem: 1,
        code: '',
      };
      if (n.nodeName === 'IMG') {
        item.code = n.dataset.val;
        backData.push(item);
      } else if (n.nodeName === '#text' && !!n.textContent) {
        item.isDataItem = 0;
        item.code = n.textContent;
        backData.push(item);
      } else {
        //Else Empty block statement
      }
    }
    return backData;
  }

  dataItem: Array<any> = [];

  loadData() {
    const params = {
      schemaCode: this.schemaCode,
    };
    AppsApi.getDataItemList(params).then((res) => {
      if (res.errcode === 0) {
        const filterType = [10, 6, 8, 9];
        const showSystemCode = [
          'creater',
          'createdDeptId',
          'createdTime',
          'owner',
          'ownerDeptId',
          'modifier',
          'modifiedTime',
          'sequenceNo',
          'sequenceStatus',
        ];

        if (!this.list) {
          this.dataItem = res.data.filter((item: any) => {
            return item.published && !filterType.includes(item.propertyType);
          });
          this.dataItem = this.dataItem.filter((item) => {
            return !item.defaultProperty || showSystemCode.includes(item.code);
          });
        } else {
          this.dataItem = this.list;
        }

        if (this.value && this.value.length > 0) {
          this.parseStringToNode(this.value);
        }
      }
    });
  }

  savedRange: any = {};

  selectHandler() {
    // 监听选定文本的变动
    const sel: any = window.getSelection();

    const range: any = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    if (
      !!range &&
      range.commonAncestorContainer &&
      range.commonAncestorContainer.ownerDocument.activeElement.id ===
        this.contentId
    ) {
      this.savedRange = range;
      !this.ruleHTMLNode && (this.ruleHTMLNode = range.commonAncestorContainer);
    }
  }

  pushDataItem(selectDataItem) {
    this.inputting = true;
    if (selectDataItem) {
      const imgID = Math.ceil(Math.random() * 1000) + selectDataItem.code;
      const imgSrc = textBeComeImg(selectDataItem.name);
      if (!!this.savedRange.commonAncestorContainer) {
        // let start = this.savedRange.startOffset
        // let end = this.savedRange.endOffset
        const imgNode = document.createElement('img');
        imgNode.src = imgSrc;
        imgNode.id = imgID;
        imgNode.dataset.val = `${selectDataItem.code}`;
        this.savedRange.insertNode(imgNode);
        const endOffset = this.savedRange.endOffset;
        this.savedRange.setStart(this.ruleHTMLNode, endOffset);
        this.ruleHTMLNode.focus();
      } else {
        this.ruleHTMLNode.focus();
        setTimeout(() => {
          const imgNode = `<img src="${imgSrc}" id="${imgID}" data-val='${selectDataItem.code}'>`;
          this.ruleHTMLNode.insertAdjacentHTML('beforeend', imgNode);
          this.savedRange.setStart(
            this.ruleHTMLNode,
            this.savedRange.endOffset + 1,
          );
          this.ruleHTMLNode.focus();
        });
      }
    }
  }

  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  clean() {
    while (this.ruleHTMLNode.hasChildNodes()) {
      this.ruleHTMLNode.removeChild(this.ruleHTMLNode.firstChild);
    }
  }

  @Watch('value', {
    immediate: true,
  })
  onValueChange(v) {
    this.reset();
    // this.loadData();

    // if (v) {

    // }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.data-title {
  position: relative;
  .text-area {
    .ant-input {
      height: 100px;
      overflow-y: scroll;
    }
  }
  .data-title-select {
    position: absolute;
    left: 8px;
    bottom: 6px;
    z-index: 10;
  }
}
.transverse {
  display: flex;
  width: 100%;
  justify-content: space-between;
  .text-area {
    flex: 1;
    .ant-input {
      height: 72px;
      overflow-y: scroll;
      border-radius: 2px;
    }
  }
  .data-title-select {
    position: relative;
    margin-left: 16px;
    white-space: nowrap;
    left: unset;
    bottom: unset;
    a {
      font-size: 14px;
      color: @primary-color;
      line-height: 22px;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.label-wrap {
  display: flex;
  width: 100%;
  flex-direction: column;
  .head {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: @nav-font-color;
    align-items: center;
    .labelTips {
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
    }
  }

  .dataTitleToTop {
    bottom: 27px !important;
  }

  .data-title-select {
    position: relative;
    bottom: 0;
    left: 0;
    a {
      font-size: 13px;
      color: @primary-color;
      line-height: 22px;
      &:hover {
        opacity: 0.8;
      }
    }
  }

  .text-area {
    width: 100%;
    .ant-input {
      height: 96px;
      overflow-y: scroll;
      border-radius: 2px;
    }
  }
}

.ant-dropdown-menu {
  max-height: 300px;
  overflow: scroll;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
</style>

<style lang="less">
@import '~@/styles/color/colors.less';

.rule-html-ref:empty {
  position: relative;
  &::after {
    content: '\8bf7\8f93\5165';
    position: absolute;
    left: 11px;
    top: 4px;
    color: @s-light-font-color;
    font-size: 14px;
  }
}
.data-title-dropdown {
  .ant-dropdown-menu {
    padding-top: 4px;
    width: 160px;
  }
  .ant-dropdown-menu-item-group-title {
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    span {
      color: @light-font-color;
    }
  }
  .ant-dropdown-menu-item-group-list {
    padding: 0;
    margin: 0;
  }
  .ant-dropdown-menu-item {
    padding: 0 24px;
    line-height: 32px;
    font-size: 14px;
    a {
      color: @nav-font-color;
    }
  }
  .ant-dropdown-menu-item {
    a {
      margin: 0;
      padding: 0;
    }
  }
}
</style>

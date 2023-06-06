<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div ref="mainContainer" class="center-panel">
    <div class="top-func">
      <div class="left-adeq">
        <!--<a-tooltip placement="top">
          <template slot="title">
            <span>撤销</span>
          </template>
          <i class="icon aufont icon-base-back-o"></i>
        </a-tooltip>
        <a-tooltip placement="top">
          <template slot="title">
            <span>返回</span>
          </template>
          <i class="icon aufont icon-base-back-cancel-o"></i>
        </a-tooltip>-->
        <a-tooltip placement="top">
          <template slot="title">
            <span>删除</span>
          </template>
          <i
            :style="`${checkId ? 'color: red;' : ''}`"
            class="aufont icon-base-delete"
            @click="deleteTheCheck(checkId)"
          ></i>
        </a-tooltip>

        <a-button
          type="link"
          :class="{ active: showGrid }"
          @click="showGrid = !showGrid"
        >
          网格线
        </a-button>
      </div>
      <div class="center-tools">
        <div
          class="item-tool"
          :draggable="true"
          @dragstart="startDrag($event, 'top', 'topText')"
        >
          <i class="aufont icon-base-text-t-o"></i> 文本
        </div>
        <div
          class="item-tool"
          :draggable="true"
          @dragstart="startDrag($event, 'top', 'topDrawerRect')"
        >
          <i class="aufont icon-base-rectangle-o"></i> 矩形
        </div>
        <div
          class="item-tool"
          :draggable="true"
          @dragstart="startDrag($event, 'top', 'topDrawerLine')"
        >
          <i class="aufont icon-base-straightline-o"></i> 直线
        </div>
        <div
          class="item-tool"
          :draggable="true"
          @dragstart="startDrag($event, 'top', 'topPic')"
        >
          <i class="aufont icon-base-picture"></i> 图片
        </div>
      </div>
      <div class="rigth-tools">
        <div class="item-tool" @click="pageSettingsEvent">
          <i class="aufont icon-base-setting"></i>页面设置
        </div>
      </div>
    </div>

    <div
      class="pages"
      :style="` max-width: ${maxWidth} `"
      @click="selectedPage = -1"
    >
      <print-page
        v-for="(page, index) in pages"
        ref="pages"
        :key="index"
        :index="index"
        :pageTotal="pages.length"
        :drawerElements="page"
        :selected="index === selectedPage"
        :showGrid="showGrid"
        :pageSettingData="pageSettingData"
        @select="onPageSelect"
        @rectSelect="onRectSelect"
        @nodeSelect="onNodeSelect"
      />

      <div class="text-center">
        <a-button icon="plus" @click="addPage"> 增加新页面 </a-button>
      </div>
    </div>

    <setting-modal
      ref="settings"
      :pageSettingData="pageSettingData"
      :paperSpecItem="paperSpecItem"
      :printMargin="printMargin"
      @setPrintSettingData="setPrintSettingData"
    />
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line
import { Button, Tooltip } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
// eslint-disable-next-line
import { namespace } from 'vuex-class';
import Divider from './divider.vue';
import mainDrawer from './main-drawer.vue';
import PrintPage from './page.vue';
import * as settingHelper from './settings-helper';
import SettingModal from './settings.vue';

interface DividerLike {
  x: number;
  y: number;
  size: number;
  vertical: boolean;
}

interface RectLike {
  left: number;

  top: number;

  right: number;

  bottom: number;
}

interface Point {
  x: number;

  y: number;
}

const PrintVuex = namespace('Print/Print');
@Component({
  name: 'center-panel',
  components: {
    mainDrawer,
    Divider,
    PrintPage,
    SettingModal,
    ATooltip: Tooltip,
    AButton: Button,
  },
})
export default class CenterPanel extends Vue {
  @Prop({ type: String }) providerId!: string;

  @PrintVuex.State('isOver') isOver!: Boolean;

  @PrintVuex.State('leftOrRight') leftOrRight!: string;

  @PrintVuex.Action('changeOver') changeOver!: any;

  @PrintVuex.State('itemAttrs') itemAttrs!: any;

  @PrintVuex.Mutation('changeTop') changeTop!: any;

  @PrintVuex.Mutation('delOneEle') delOneEle!: any;

  @PrintVuex.Mutation('setAttrs') setAttrs!: any;

  @PrintVuex.Mutation('addPage') addPage!: () => void;

  @PrintVuex.Mutation('removePage') removePage!: (page: number) => void;

  @PrintVuex.State('pages') pages!: any[][];

  @PrintVuex.State('pageSettings') pageSettings!: any;

  paperSpecItem: settingHelper.PaperSpecSize[] = settingHelper.PaperSpecItem;

  printMargin: settingHelper.PageMargin = settingHelper.DefaultMargin;

  headerFooter: settingHelper.HeaderFooter = {
    header: Object.assign({}, settingHelper.getDefaultHeaderFooter()),
    footer: Object.assign({}, settingHelper.getDefaultHeaderFooter()),
  };

  // 提交到后台的设置数据集合
  pageSettingData: settingHelper.SettingData =
    settingHelper.getDefaultSettings();

  get drawerElements() {
    return this.pages[0];
  }

  checkId: string = '';

  drawerTop: number = 0;

  dividers: DividerLike[] = [];

  rectPoint: Point | null = null;

  selecteds: any[] | null = null;

  rect: RectLike | null = null;

  selectedPage = -1;

  maxWidth: string = '0';

  showGrid = false;

  onPageSelect(index: number) {
    this.selectedPage = this.selectedPage === index ? -1 : index;
  }

  onRectSelect(selecteds: any) {
    this.selecteds = selecteds;
    this.$emit('rectSelect', selecteds);
  }

  onNodeSelect(data: { id: string; page: number }) {
    (this.$refs.pages as any[]).forEach((page, index) => {
      if (data.page === index) {
        return;
      }
      page.clearSelecteds();
    });
  }

  startDrag(e: any, owner: string, kind: string) {
    this.$emit('itemStartDrag', {
      owner,
      kind,
      str: e.currentTarget.innerText,
      offsetX: e.offsetX,
      offsetY: e.offsetY,
    });
  }

  deleteTheCheck(id: string) {
    if (this.selectedPage > -1) {
      this.removePage(this.selectedPage);
      this.selectedPage = -1;
    } else {
      // @ts-ignore
      if (this.selecteds) {
        for (const item of this.selecteds) {
          this.delOneEle({
            id: item.id,
            page: this.selectedPage,
          });
        }
        this.onRectSelect(null);
      } else {
        if (!id) {
          id = this.itemAttrs.id;
        }
        if (id) {
          this.delOneEle({
            id,
            page: this.selectedPage,
          });
          this.checkId = '';
          this.setAttrs({});
        }
      }
    }
  }

  @Watch('providerId')
  idChange(n: string, o: string) {
    this.checkId = n;
  }

  @Watch('drawerTop')
  drawerTopChange(n: number, o: number) {
    // 画布距离top的值
    this.changeTop(0 - (n - o));
  }

  // @Watch("pages",{deep: true})
  // pagesChange(v) {
  //   // 画布距离top的值
  //  ;
  // }

  @Watch('pages')
  setPageData() {
    const pageData: object[] = this.pages[0] as [];
    pageData.forEach((item: any, index) => {
      if (
        item.eleType === 'pageSettings' &&
        this.pageSettings._papersize === undefined
      ) {
        this.pageSettingData = Object.assign({}, item);
      }
    });
  }

  mounted() {
    if (this.pages.length === 0) {
      this.addPage();
    }

    // 获取缓存数据
    const settingCacheData: string | null = window.sessionStorage.getItem(
      `printSettings${this.$route.params.printCode}`,
    );
    if (this.pageSettings._papersize !== undefined) {
      this.pageSettingData = Object.assign(this.pageSettings);
    } else if (settingCacheData !== null) {
      this.pageSettingData = Object.assign(JSON.parse(settingCacheData));
    } else {
      //Else Empty block statement
    }

    //初始化頁面寬度
    this.$nextTick(() => {
      // @ts-ignore
      this.maxWidth = document.querySelector('body').offsetWidth - 560 + 'px';
    });

    // @ts-ignore
    document.querySelector('body').onresize = () => {
      this.getPagesWidth();
    };
  }

  //設置pages區域最大寬度值
  getPagesWidth() {
    // @ts-ignore
    const body_width = document.querySelector('body').offsetWidth;
    // @ts-ignore
    const left_width = (
      document.querySelector('.left-component').parentNode as HTMLDivElement
    ).offsetWidth;
    // @ts-ignore
    const right_width = (
      document.querySelector('.right-attr').parentNode as HTMLDivElement
    ).offsetWidth;

    //  6 指左右兩側邊框綫
    this.maxWidth = body_width - (left_width + right_width + 6) + 'px';
  }

  // 页面设置
  pageSettingsEvent() {
    (this.$refs.settings as any).showModal();
  }

  setPrintSettingData(data: settingHelper.SettingData) {
    this.pageSettingData = Object.assign({}, data);
  }
}
</script>

<style lang="less">
.center-panel {
  background: rgba(250, 250, 250, 1);
  width: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .top-func {
    height: 46px;
    line-height: 46px;
    background: #fff;
    display: flex;
    top: 0;
    z-index: 33;
    border-bottom: 1px solid #e8e8e8;

    .left-adeq {
      margin-left: 32px;
      font-size: 18px;
      i {
        margin-right: @base4-padding-md;
      }
      i:hover {
        cursor: pointer;
      }
    }
    .center-tools {
      display: flex;
      margin: 0 auto;
      .item-tool {
        margin: 0 10px;
        cursor: move;
        i {
          font-size: 12px;
        }
        &:hover {
          color: @primary-color;
        }
      }
    }
  }

  & > .pages {
    flex-grow: 1;
    overflow: auto;
    padding-top: 32px;
    // @media screen and (min-width: 1200px) and (max-width: 1399px) {
    //   max-width: 800px;
    // }
    // @media screen and (min-width: 1400px) and (max-width: 1599px) {
    //   max-width: 800px;
    // }
    // @media screen and (min-width: 1600px) and (max-width: 1890px){
    //   max-width: 1000px;
    // }
    // @media screen and (min-width: 1900px){
    //   max-width: 1300px;
    // }

    & > .ant-btn {
      margin-top: @base4-padding-sm;
      margin-bottom: @base4-padding-md;
    }
  }
}

.rect {
  border: 1px solid @text-color-describe;
  position: absolute;
  z-index: 10;
  cursor: move;
  display: none;
}
.rigth-tools {
  border-left: #e8e8e8 solid 1px;
  margin-right: 25px;
  margin-top: 15px;
  margin-bottom: 15px;
  & .item-tool {
    margin: 0 10px;
    margin-top: -15px;
    cursor: pointer;
    i {
      font-size: 14px;
      padding-right: 5px;
    }
    &:hover {
      color: @primary-color;
    }
  }
}
.text-center {
  text-align: center;
  padding-bottom: 50px;
}
</style>

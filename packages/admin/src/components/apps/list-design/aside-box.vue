<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <section class="aside-box" :class="{ action: fieldBlock === 3 }">
    <section
      class="aside-box-title section-bar"
      @click="collapsible = !collapsible"
    >
      <span class="bar-title title-3">{{ title }}</span>
      <Dialog
        v-if="fieldBlock !== 3"
        :propDataList="propDataList"
        :fieldBlock="fieldBlock"
        @addcomfirm="addcomfirm"
      />
      <i
        v-if="propDataList.some((item) => item.checked)"
        class="collaps icon aufontAll h-icon-all-right-o"
        :class="{ expanded: collapsible }"
      ></i>
    </section>
    <!-- li列表 -->
    <transition name="list-fade">
      <SideBoxDraggerList
        v-show="collapsible"
        :propDataList="propDataList"
        :fieldBlock="fieldBlock"
        :canShowDatas="canShowDatas"
        :customButton="customButton"
        @setTargetSortList="setTargetSortList"
        @setWorkflowForm="
          () => {
            _self.$emit('setWorkflowForm');
          }
        "
        @setNormalForm="
          () => {
            _self.$emit('setNormalForm');
          }
        "
      />
    </transition>
  </section>
</template>
<script lang="ts">
import TableSetting from '@/components/apps/list-design/modals/popover/table-setting/table-index.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import { namespace } from 'vuex-class';
import Dialog from './aside-addDialog-modal.vue';
import SideBoxDraggerList from './aside-draggerList.vue';

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'SideBox',
  components: {
    Draggable,
    TableSetting,
    Dialog,
    SideBoxDraggerList,
  },
})
export default class SideBox extends Vue {
  @ListdesignModule.State('payloadOptions') payloadOptions: any;

  @ListdesignModule.State('thefieldBlock') thefieldBlock: any;

  @ListdesignModule.Mutation('setPayloadOptions') mutationPayloadOptions: any;

  @ListdesignModule.Mutation('setFieldBlock') mutationFieldBlock: any;

  @ListdesignModule.State('ganttModel') ganttModel: any;

  /* 展示字段 */
  @ListdesignModule.Mutation('setShowFieldArray') mutationShowFieldArray: any;

  @Prop() title!: string;

  @Prop() fieldBlock!: number;

  // @Prop() dialogData !: Array<any[]>
  @Prop() propDataList!: any[];

  @Prop({ default: false }) customButton!: boolean;

  wrapStyle = { left: '624px' };

  index: number = 0;
  // /* 服务器获取的原始数据 */
  // originDatas:any[] = [];

  poperList: any[] = [];
  /* 查询条件list */
  // queryCriteriaList:any[] = [];

  canShowDatas: any[] = [];

  popoverVisible: boolean = false;

  visible = false;

  fblock: number = -1;

  collapsible: boolean = true;

  /*
   * 新增选项兼容多语言版本
   */
  compatibleOldData(data: any) {
    const localeList: Array<string> = ['en']; // 语言列表
    localeList.forEach((local: string) => {
      if (!data.name_i18n) {
        data.name_i18n = {};
        data.name_i18n[local] = data.name || '';
      } else if (data.name_i18n[local] === '') {
        data.name_i18n[local] = data.name || '';
      } else {
        //Else Empty block statement
      }
    });
    return data;
  }

  setTargetSortList(data: any) {
    this.$emit('setTargetSortList', data);
  }

  // /* add弹窗-确定-改变canShowDatas数据 */
  addcomfirm(felBlock: any, data: any) {
    this.collapsible = true;
    data.forEach((d: any) => {
      if (d.data && d.data.name_i18n && typeof d.data.name_i18n === 'string') {
        d.data.name_i18n = JSON.parse(d.data.name_i18n);
      } else if (!d.data.name_i18n) {
        d.data = this.compatibleOldData(d.data);
      } else {
        //Else Empty block statement
      }
    });
    this.canShowDatas = [...data].filter((el: any) => el.checked === true);
    if (felBlock === 1) {
      this.moveTitleToFirst(this.canShowDatas, false);
    }
  }

  mounted() {
    document.body.ondrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    this.canShowDatas = this.propDataList.filter((item) => item.checked);
  }

  /**
   * 当前checked 为true 的数据
   * 查询条件-发生改变时更新store
   */
  @Watch('canShowDatas')
  linsteningCanShowDatas(v: any) {
    if (this.fieldBlock === 0) {
      // ;
      this.mutationPayloadOptions(v);
    } else if (this.fieldBlock === 1) {
      //甘特图视图下，添加甘特图标题需要将标题字段设为首列字段
      this.mutationShowFieldArray(v);
    } else if (this.fieldBlock === 2) {
      // this.mutationShowFieldArray(v);
    } else if (this.fieldBlock === 3) {
      // this.mutationShowFieldArray(v);
    } else {
      //Else Empty block statement
    }
  }

  //甘特图对于标题字段的特殊处理
  /**
   * isInit: 是否是切换tab页的初始化操作
   */
  moveTitleToFirst(v, isInit) {
    const result = v;
    if (this.ganttModel && this.ganttModel.titlePropertyCode) {
      const titleIdx = v.findIndex(
        (item) => item.code === this.ganttModel.titlePropertyCode,
      );
      if (titleIdx !== -1 && titleIdx !== 0) {
        const temp = result.splice(titleIdx, 1);
        result.unshift(temp[0]);
      } else if (titleIdx === -1) {
        if (!isInit) {
          this.$message.error('甘特图标题字段默认设置为展示字段，不可删除');
        }

        result.unshift(
          Object.assign(
            this.propDataList.find(
              (item) => item.code === this.ganttModel.titlePropertyCode,
            ),
            { checked: true },
          ),
        );
        result[0].checked = true;
      } else {
        //Else Empty block statement
      }
    }
    if (isInit) {
      this.canShowDatas = result;
    }
    return result;
  }

  // 甘特图设置除标题以外的字段时
  // ，默认向展示字段中添加该字段
  addShowfield(v, code) {
    const result = v;
    if (code) {
      const itemIndex = v.findIndex((item) => item.code === code);
      if (itemIndex === -1) {
        result.push(
          Object.assign(
            this.propDataList.find((item) => item.code === code),
            { checked: true },
          ),
        );
      }
    }
    this.canShowDatas = result;
  }

  created() {
    this.fblock = this.fieldBlock;
  }
}
</script>

<style lang="less" scoped>
.aside-box {
  padding-left: 36px;
  padding-right: 8px;
  &.action {
    padding-left: 16px;
    .bar-title.title-3 {
      font-size: 13px;
      font-weight: 600;
    }
    /deep/.list-box li.section-bar:hover {
      background: rgba(41, 112, 255, 0.1) !important;
    }
  }
  .aside-box-title {
    cursor: pointer;
    position: relative;
    padding-left: 20px;
    padding-right: 12px;
  }
  .collaps {
    margin-left: 10px;
    margin-right: 4px;
    color: #111218;
    font-size: 12px;
    transition: transform 0.24s;
    position: absolute;
    left: -10px;
    font-weight: bold;
    &.expanded {
      transform: rotate(90deg);
    }
  }
}
.icon-checked {
  color: @primary-color;
}
.ant-popover-inner-content {
  .bottom-bolck {
    .btn {
      float: right;
      margin-right: 12px;
    }
  }
  min-width: 360px;
  position: relative;
  a {
    color: #111218;
  }
  a:hover {
    color: #111218;
  }
}
.design-wrapper {
  .each-title {
    font-size: 14px;
  }
  .smart-form {
    width: auto;
  }
}
</style>
<style lang="less" scoped>
.ant-popover-inner-content {
  padding-bottom: 50px;
  max-height: 392px;
  overflow-y: auto;
}
/deep/ .h-icon-all-plus-o {
  font-size: 12px;
  font-weight: bold;
  color: rgb(17, 18, 24);
}
</style>

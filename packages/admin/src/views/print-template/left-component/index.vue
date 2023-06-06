<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="left-component">
    <div class="sys-columns">
      <div class="left-title">
        <span @click="upDownToggle($event, 'sysBool')">
          <i v-show="sysBool" class="anticon anticon-down"></i>
          <i v-show="!sysBool" class="anticon anticon-right"></i> </span>系统字段
      </div>
      <div v-show="sysBool" class="item-wrapper">
        <div
          v-for="item in sysColumns"
          :key="item.id"
          class="one-item"
          draggable="true"
          @dragstart="
            startDrag(
              $event,
              'left',
              'leftColumn',
              item.code,
              item.propertyType,
            )
          "
        >
          <i :class="item.icon"></i>
          {{ item.name }}
        </div>
      </div>
    </div>
    <div class="biz-columns">
      <div class="left-title">
        <span @click="upDownToggle($event, 'bizBool')">
          <i v-show="bizBool" class="anticon anticon-down"></i>
          <i v-show="!bizBool" class="anticon anticon-right"></i> </span>业务字段
      </div>
      <div v-show="bizBool" class="item-wrapper">
        <div
          v-for="item in bizColumns"
          :key="item.id"
          :title="item.name"
          class="one-item"
          draggable="true"
          @dragstart="
            startDrag(
              $event,
              'left',
              'leftColumn',
              item.code,
              item.propertyType,
            )
          "
        >
          <i :class="item.icon"></i>
          {{ item.name }}
        </div>

        <a-spin v-show="loading" style="margin: 0 auto" />
        <div v-show="bizColumns.length === 0" style="margin: 5px auto">
          暂无业务字段
        </div>
      </div>
    </div>
    <div class="qr-bar-code">
      <div class="left-title">
        <span @click="upDownToggle($event, 'codeBool')">
          <i v-show="codeBool" class="anticon anticon-down"></i>
          <i v-show="!codeBool" class="anticon anticon-right"></i> </span>二维码及条形码
      </div>
      <div v-show="codeBool" class="item-wrapper">
        <div
          class="one-item"
          draggable="true"
          @dragstart="startDrag($event, 'left', 'leftQrcodePic')"
        >
          <i class="icon aufont icon-base-qrcode"></i> 二维码
        </div>
        <div
          class="one-item"
          draggable="true"
          @dragstart="startDrag($event, 'left', 'leftBarcodePic')"
        >
          <i class="icon aufont icon-base-barcode"></i> 条形码
        </div>
      </div>
    </div>
    <div v-if="processShow" class="flow-log">
      <div class="left-title">
        <span @click="upDownToggle($event, 'flowBool')">
          <i v-show="flowBool" class="anticon anticon-down"></i>
          <i v-show="!flowBool" class="anticon anticon-right"></i>
        </span>
        流程字段
      </div>
      <div v-show="flowBool" class="item-wrapper">
        <div
          class="one-item"
          draggable="true"
          @dragstart="startDrag($event, 'left', 'flowLog')"
        >
          <i class="icon aufont icon-base-book"></i> 流程日志
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line
// eslint-disable-next-line
import appsApi from '@/apis/apps';
// eslint-disable-next-line
import { get } from '@/apis/form';
// eslint-disable-next-line
import { iconTypes, systemColumns } from '@/config/print/dataStructure';
import { Spin } from '@h3/antd-vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
// eslint-disable-next-line
import { namespace } from 'vuex-class';

const PrintVuex = namespace('Print/Print');
@Component({
  name: 'left-component',
  components: {
    ASpin: Spin,
  },
})
export default class LeftComponent extends Vue {
  @PrintVuex.Mutation('setBizSysData') setBizSysData!: any;

  @PrintVuex.Mutation('assignAllData') assignAllData!: any;

  @PrintVuex.Action('updatePageSettingData') updatePageSettingData!: any;

  @Prop() formData!: any;

  sysColumns: Array<any> = systemColumns;

  bizColumns: Array<any> = [];

  sysBool: boolean = true;

  bizBool: boolean = true;

  codeBool: boolean = true;

  flowBool: boolean = true;

  loading: boolean = true;

  processShow: boolean = false;

  created() {
    this.getBizColumns();
    this.getIsWorkflow();
  }

  beforeMounted() {
    this.getPrintTemplateJson();
  }

  async getIsWorkflow() {
    const { data, errcode, errmsg } = await appsApi.getIsWorkflow({
      schemaCode: this.$route.params.bizSchemaCode,
    });
    if (errcode !== 0) {
      this.$message.error(errmsg as string);
      return false;
    }
    this.processShow = data;
  }

  async getBizColumns() {
    this.loading = true;
    // @ts-ignore
    const { data, errcode, errmsg } = await appsApi.getDataItemList({
      schemaCode: this.$route.params.bizSchemaCode,
      isPublish: true,
    });
    if (errcode !== 0) {
      this.$message.error(errmsg as string);
      this.bizColumns = [];
    }
    if (!data || !data.length) {
      this.bizColumns = [];
    }
    data.forEach((item: any, index: number) => {
      iconTypes.forEach((icon: object, i: number) => {
        // @ts-ignore
        if (item.propertyType === icon.propertyType && !item.defaultProperty) {
          // @ts-ignore
          item.icon = icon.icon;
          // @ts-ignore
          item.owner = '业务';
          if (
            item.propertyType === 8 &&
            item.subSchema.properties.filter((x: any) => !x.defaultProperty)
              .length === 0
          ) {
            return;
          }
          this.bizColumns.push(item);
        }
      });
    });
    this.setBizSysData([...systemColumns, ...this.bizColumns]);
    this.loading = false;
  }

  async getPrintTemplateJson() {
    // @ts-ignore
    const bizSchemaCode: string = this.$route.params.bizSchemaCode;
    // @ts-ignore
    let printCode: string = this.$route.params.printCode;
    if (!printCode.includes('_print')) {
      printCode += '_print';
    }
    let { data, errcode, errmsg } = this.formData;
    if (errcode !== 0 && errcode !== 302024) {
      this.$message.error(errmsg);
    }
    if (!data) {
      // this.$message.error('查询数据有误！');
      data = {};
    }
    if (data.id) {
      localStorage.setItem(`upPrintTempJsonId${printCode}`, data.id || '');
      this.assignAllData(JSON.parse(data.draftAttributesJson));
    }
  }

  startDrag(
    e: any,
    owner: string,
    kind: string,
    code?: string,
    propertyType?: number,
  ) {
    this.$emit('itemStartDrag', {
      owner,
      kind,
      str: e.currentTarget.innerText,
      code,
      propertyType,
      offsetX: e.offsetX,
      offsetY: e.offsetY,
    });
  }

  upDownToggle(event: any, column: string) {
    // @ts-ignore
    // eslint-disable-next-line
    if (event.target) {
      event.target.className.includes('right')
        ? (this[column] = true)
        : (this[column] = false);
    }
  }
}
</script>

<style lang="less" scoped>
.left-component {
  .sys-columns,
  .biz-columns,
  .qr-bar-code,
  .flow-log {
    text-align: left;
    margin: @base4-padding-md 0 0 @base10-padding-sm;

    &:not(:first-child) {
      margin-top: @base4-padding-xs;
    }

    .left-title {
      font-size: 14px;
      font-weight: bold;
      color: #111218;
    }
    i {
      padding-right: 8px;
      font-weight: 400;
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
      &:hover {
        cursor: pointer;
      }
    }
  }
  .item-wrapper {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    .one-item {
      width: 98px;
      height: 30px;
      background: rgba(0, 0, 0, 0.02);
      border: 1px dashed rgba(209, 209, 209, 1);
      margin: 0 8px 8px 0;
      font-size: 12px;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      line-height: 30px;
      text-align: left;
      padding: 0 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:hover {
        color: @primary-color;
        cursor: move;
        transition: all 0.3s;
        border-color: @primary-color;

        & > i {
          color: @primary-color;
        }
      }
      i {
        font-size: 12px;
        text-align: left;
      }
    }
  }
}
</style>

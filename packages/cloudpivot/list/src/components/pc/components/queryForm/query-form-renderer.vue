<template>
  <div class="query-renderer">
    <div id="scroll-box-mix" class="scroll-box">
      <template v-for="(item, index) in queryGroup">
        <queryFieldGroup
          :ref="'group_' + index"
          :key="time + '-' + index"
          :controls="item"
          :index="index"
          :isReset="isReset"
          :isRelevance="isRelevance"
          @valueChange="valueChange"
          @resetOver="resetOver"
          @delGroup="delGroup"
        />
      </template>
    </div>

    <div :class="{ disabled: queryGroup.length >= 10 }" class="btn">
      <span @click="addGroup">
        <em class="icon aufontAll h-icon-all-plus-o"></em>
        添加条件组
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Button, Icon } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch, Provide } from 'vue-property-decorator';
import { listApi } from '../../../../../../api';
import { renderer } from '../../../../../../form';
import formPc from '../../../../../../form/src/renderer/components/pc';
import zhToEn from '../../locales/zhToEn';
import * as ControlFactory from '../../helper/control-factory';
import { DataItemType } from 'cloudpivot/form/schema';

import { toFormControl, toFormControlType } from './query-form-util';

import queryFieldGroup from './query-field-group.vue';

@Component({
  name: 'QueryFormRenderer',
  components: {
    PcFormRenderer: formPc.FormRenderer,
    AButton: Button,
    AIcon: Icon,
    queryFieldGroup,
  },
})
export default class QueryFormRenderer extends Vue {
  @Provide()
  getController() {
    return this.controls[0];
  }

  @Provide()
  getFormControls(keys?: string[]) {
    return this.controls;
  }

  @Provide()
  valChange(keys: string, fun: Function) {}

  @Provide()
  getDataItem(keys: string, parentKey?: string) {
    return this.controls.find((el) => el.key === keys);
  }

  @Provide()
  async getRelativeDataList(isList?: boolean) {
    if (!this.relevanceDataList || !this.relevanceDataList.length) {
      let { schemaCode } = this.$route.params;
      if (!schemaCode) {
        schemaCode = this.$route.params.bizSchemaCode;
      }
      if (!schemaCode) {
        schemaCode = this.$route.query.schemaCode as string;
      }
      if (!schemaCode) {
        return;
      }
      const res = await listApi.getDataItemList({
        schemaCode,
      });
      const { errcode, errmsg, data } = res;
      if (errcode === 0) {
        return data;
      } else {
        this.$message.error(errmsg as string);
      }
    }
    return this.relevanceDataList;
  }

  @Provide()
  getSourceType() {
    return;
  }

  @Provide()
  layoutTypeFn() {
    return localStorage.getItem('layoutType') === 'vertical'; //使用本地缓存 防止上下布局发布时渲染数据先左右布局
  }

  @Prop()
  fields!: any[];

  @Prop()
  dataItemList!: any[];

  @Prop({
    default: 3,
  })
  cols!: number;

  @Prop()
  relevanceDataList!: [];

  @Prop()
  GroupControlers?: any[];

  @Prop() vm!: any;

  @Prop() isRelevance!: boolean;

  time: any = new Date().getTime();

  isReset: boolean = false;

  @Watch('GroupControlers')
  onGroupControlersChange(val) {
    this.isReset = true;
    this.time = new Date().getTime();

    const group = [];
    val.forEach((el) => {
      const controls: any[] = JSON.parse(JSON.stringify(this.controls));
      const res: any[] = [];
      controls.forEach((item) => {
        const ctrl = el.find((x) => x.key === item.key);
        if (ctrl) {
          ctrl.isUsed = true;
          res.push(ctrl);
        } else {
          item.isUsed = false;
          res.push(item);
        }
      });
      group.push(res);
    });
    this.queryGroup = group;
  }

  resetOver(index: number) {
    if (index === this.GroupLen - 1) {
      this.isReset = false;
    }
  }

  @Watch('fields', {
    immediate: true,
  })
  async setFields(fields: any[]) {
    // this.init();
  }

  queryGroup: any[] = [];

  get GroupLen() {
    return this.queryGroup.length;
  }

  delGroup(index) {
    if (this.queryGroup.length > 1) {
      const queryGroup = this.getGroupControler();
      queryGroup.splice(index, 1);
      this.onGroupControlersChange(queryGroup);
    }
  }

  addGroup(type?: any) {
    if (this.GroupLen >= 10) {
      return;
    }
    const controls: any[] = JSON.parse(JSON.stringify(this.controls));
    controls.forEach((el, index) => {
      if (type === 'init') {
        el.isUsed = true;
      } else {
        if (index === 0) {
          el.isUsed = true;
        } else {
          el.isUsed = false;
        }
      }
    });
    this.queryGroup.push(controls);
    this.$nextTick(() => {
      const scrollBox = document.querySelector('#scroll-box-mix');
      scrollBox.scrollTop = scrollBox.scrollHeight;
    });
  }

  valueChange() {
    this.getGroupValue();
  }

  getGroupValue() {
    const res: any[] = [];
    this.queryGroup.forEach((el, index) => {
      const ref: any =
        this.$refs['group_' + index] && this.$refs['group_' + index][0];
      if (ref && ref.getValue) {
        const ResVal = ref.getValue();
        res.push(ResVal);
      }
    });

    this.$emit('query', res);
  }

  // 获取所有分组Controler
  getGroupControler() {
    const res: any[] = [];
    this.queryGroup.forEach((el, index) => {
      const ref: any =
        this.$refs['group_' + index] && this.$refs['group_' + index][0];
      if (ref && ref.getControler) {
        const ResVal = ref.getControler();
        res.push(ResVal);
      }
    });
    return res;
  }

  // 获取并生成所有可使用的控件
  async getControllers() {
    if (!this.fields || !this.fields.length) {
      return;
    }

    let { schemaCode } = this.$route.params;
    if (!schemaCode) {
      schemaCode = this.$route.params.bizSchemaCode;
    }
    if (!schemaCode) {
      schemaCode = this.$route.query.schemaCode as string;
    }
    let res: any = {};
    if (schemaCode) {
      res = await listApi.getDataItemList({
        schemaCode,
      });
    }

    const controls: any = {};
    this.fields.forEach((field: any) => {
      if (
        this.$route.name === 'form-detail' &&
        [
          renderer.DataItemType.Radio,
          renderer.DataItemType.Checkbox,
          renderer.DataItemType.Dropdown,
          renderer.DataItemType.DropdownMulti,
        ].includes(field.propertyType)
      ) {
        // 关联表单的查询条件中涉及到下拉框单选多选、单选、复选时，无论设置的常量还是变量，在组合查询运行时都展示为输入框
        field.displayType = 0;
      }

      const control = toFormControl(field);

      const source = this.dataItemList.find(
        (d) => d.code === field.propertyCode,
      );
      if (source) {
        control.options.displayField = source.relativePropertyCode;
      }

      // 关联表单设置可见字段
      if (control.type === 80) {
        try {
          control.options.relativePropertyCode = res.data.filter(
            (el: any) => control.key === el.code,
          )[0]['relativePropertyCode'];
        } catch (error) {}
      }
      // @ts-ignore
      control.edit = true;
      controls[field.propertyCode] = control;
      if (this.isRelevance) {
        if (
          [
            DataItemType.Checkbox,
            DataItemType.Radio,
            DataItemType.Dropdown,
            DataItemType.DropdownMulti,
          ].includes(control.propertyType)
        ) {
          const controler: any = control;
          controler.type = renderer.FormControlType.Text;
          if (Array.isArray(controler.options.defaultValue)) {
            controler.options.defaultValue =
              controler.options.defaultValue.join(';');
          }
          controler.value = controler.options.defaultValue;
        }
      }
    });

    renderer.components.FormRendererHelper.mergeValue(
      Object.values(controls),
      {},
      true,
    );
    this.controls = Object.values(controls);
  }

  async init() {
    this.queryGroup = [];
    this.time = new Date().getTime();
    // this.$emit("getRelevanceDataList");
    await this.getControllers();
    this.addGroup('init');
    this.query();
  }

  controls = [] as any;

  collapsed = true;

  daily = false;

  // 查询
  query() {
    this.$emit('setFilterData', {});
  }

  findControl(key: string) {
    const formRenderer = this.$refs.formRenderer as any;
    if (formRenderer) {
      const ctrl = formRenderer.controller.findChild(key);
      return ctrl;
    }
  }

  backWriteData(value: any) {
    const formRenderer = this.$refs.formRenderer as any;
    if (formRenderer) {
      formRenderer.controller.value = value;
    }
  }

  closeQueryItem() {
    this.$emit('hide');
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../../application/src/components/pc/style/custom-themes';

.query-renderer {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 202px);
}
.btn {
  border-top: 1px solid #eee;
  height: 48px;
  min-height: 48px;
  line-height: 48px;
  text-align: center;
  font-size: 14px;
  color: @primaryColor;
  margin: 0 25px;
  span {
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  &.disabled {
    color: rgba(17, 18, 24, 0.5);
    span {
      &:hover {
        opacity: 1;
      }
    }
  }
}
.scroll-box {
  flex: 1;
  overflow: auto;
}
</style>

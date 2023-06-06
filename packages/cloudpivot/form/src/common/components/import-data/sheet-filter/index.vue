<template>
  <div>
    <div class="query-form">
      <div
        ref="queryFormLeft"
        :class="
          $i18n.locale === 'zh' ? 'query-form-left' : 'query-form-left en'
        "
      >
        <a-form layout="inline">
          <template v-for="item of filterList">
            <a-form-item
              ref="queryForm1"
              :key="item.code"
              :label="getKey(item)"
              :colon="false"
            >
              <template v-if="item.formPropertyType === 1 || item.type === 1">
                <!-- 短文本 -->
                <a-input
                  v-model="queryData[item.code]"
                  placeholder="请输入"
                  class="workflow-name-input"
                  maxlength="100"
                />
              </template>
              <template
                v-else-if="item.formPropertyType === 4 || item.type === 2"
              >
                <!-- 数值 -->
                <a-input
                  v-model="queryData[item.code]"
                  placeholder="请输入"
                  class="workflow-name-input"
                  type="number"
                  min="0"
                />
              </template>
              <template
                v-else-if="item.formPropertyType === 3 || item.type === 3"
              >
                <!-- 日期 -->
                <a-date-picker
                  v-model="queryData[item.code]"
                  style="min-width: 0px"
                  :showTime="true"
                  :format="setFormat(item.code)"
                  :valueFormat="setFormat(item.code)"
                  placeholder="请选择"
                />
              </template>
              <template
                v-else-if="item.formPropertyType === 8 || item.type === 4"
              >
                <!-- 逻辑 -->
                <a-select
                  v-model="queryData[item.code]"
                  class="select"
                  :getPopupContainer="getPopupContainer"
                  placeholder="请选择"
                >
                  <a-select-option value="true"> true </a-select-option>
                  <a-select-option value="false"> false </a-select-option>
                </a-select>
              </template>
              <template
                v-else-if="
                  item.formPropertyType === 50 ||
                  item.formPropertyType === 51 ||
                  item.type === 50 ||
                  item.type === 51
                "
              >
                <!-- 选人控件 -->
                <StaffSelector
                  v-model="queryData[item.code]"
                  class="workflow-name-input"
                  :options="setMulti(item.code)"
                  :onlyForm="true"
                  :visiblePart="true"
                />
              </template>
              <template
                v-else-if="item.formPropertyType === 60 || item.type === 60"
              >
                <!-- 部门单选控件 -->
                <StaffSelector
                  v-model="queryData[item.code]"
                  class="workflow-name-input"
                  :options="setMulti2(item.code)"
                  :onlyForm="true"
                  :visiblePart="true"
                />
              </template>
              <template
                v-else-if="item.formPropertyType === 61 || item.type === 61"
              >
                <!-- 部门多选控件 -->
                <StaffSelector
                  v-model="queryData[item.code]"
                  class="workflow-name-input"
                  :options="setMulti3(item.code)"
                  :onlyForm="true"
                  :visiblePart="true"
                />
              </template>
              <template
                v-else-if="
                  item.formPropertyType === 62 ||
                  item.type === 62 ||
                  item.type === 5
                "
              >
                <!-- 混合选人控件 -->
                <StaffSelector
                  v-model="queryData[item.code]"
                  class="workflow-name-input"
                  :options="setMulti4(item.code)"
                  :onlyForm="true"
                  :visiblePart="true"
                />
              </template>
              <template
                v-else-if="item.formPropertyType === 80 || item.type === 80"
              >
                <!-- 关联表单单选 -->
                <a-select
                  v-model="queryData[item.code]"
                  :getPopupContainer="getPopupContainer"
                  showSearch
                  :allowClear="true"
                  placeholder="请选择"
                >
                  <a-select-option
                    v-for="s in RelevanceFormData[item.code]"
                    :key="s.id"
                  >
                    {{ s.name }}
                  </a-select-option>
                </a-select>
              </template>
              <template
                v-else-if="item.formPropertyType === 81 || item.type === 81"
              >
                <!-- 关联表单多选选 -->
                <a-select
                  v-model="queryData[item.code]"
                  :getPopupContainer="getPopupContainer"
                  mode="multiple"
                  :maxTagCount="2"
                  showSearch
                  placeholder="请选择"
                >
                  <a-select-option
                    v-for="s in RelevanceFormData[item.code]"
                    :key="s.id"
                  >
                    {{ s.name }}
                  </a-select-option>
                </a-select>
              </template>
              <template v-else>
                <!-- 其他 -->
                <a-input
                  v-model="queryData[item.code]"
                  :placeholder="getKey(item)"
                  class="workflow-name-input"
                  maxlength="100"
                />
              </template>
            </a-form-item>
          </template>
        </a-form>
      </div>
      <div class="query-form-right">
        <a-button @click="reset">
          {{ $t('cloudpivot.flowCenter.pc.reset') }}
        </a-button>
        <a-button type="primary" @click="search">
          {{ $t('cloudpivot.flowCenter.pc.search') }}
        </a-button>
      </div>
    </div>
    <div class="filter-mask" @click="closeQueryItem"></div>
  </div>
</template>

<script lang="ts">
import { listApi } from '../../../../../../api';
import formPc from '../../../../renderer/components/pc';
import {
  Button,
  DatePicker,
  Form,
  Icon,
  Input,
  Select,
  TreeSelect,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'query-workitem',
  components: {
    AButton: Button,
    AIcon: Icon,
    AInput: Input,
    AForm: Form,
    AFormItem: Form.Item,
    ATreeSelect: TreeSelect,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARangePicker: DatePicker.RangePicker,
    StaffSelector: formPc.StaffSelector,
  },
})
export default class QueryWorkitem extends Vue {
  @Prop() data!: Array<any>;

  @Prop() searchs!: object;

  @Prop() datatype!: Array<any>;

  filterList: any[] = [];

  // 选人控件已选人员、部门集合
  selectedValue: any[] = [];

  // 展示选人控件弹窗
  showSelector: boolean = false;

  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  // 支持类型：短文本、日期、数值、选人控件、逻辑、关联表单
  queryData: any = {};

  queryType: any = {};

  queryDataCopy: any = {};

  RelevanceFormData: any = {};

  nameObj: any = {};

  async mounted() {
    let _data = this.data;
    try {
      if (typeof this.data === 'string') {
        _data = JSON.parse(this.data);
      }
    } catch (error) {}
    this.filterList = _data.filter((d: any) => d.checked);
    this.filterList.forEach(async (d: any) => {
      this.$set(
        this.queryData,
        d.code,
        d.formPropertyType === 81 ||
          d.formPropertyType === 8 ||
          d.type === 81 ||
          d.type === 4
          ? undefined
          : '',
      );
      if (d.formPropertyType) {
        this.$set(this.queryType, d.code, d.formPropertyType);
      } else {
        this.$set(this.queryType, d.code, d.type);
      }
      this.$set(this.nameObj, d.code, { name: d.name, name_i18n: d.name_i18n });
      if (d.formPropertyType === 80 || d.formPropertyType === 81) {
        await this.getQueryList(d.relativeCode, d.code);
      }
    });
    this.queryDataCopy = JSON.parse(JSON.stringify(this.queryData));
  }

  @Watch('searchs')
  onsearchs(v) {
    this.queryData = v;
  }

  resetFields() {
    this.queryData = this.queryDataCopy;
  }

  // 重置
  reset() {
    this.resetFields();
    this.$emit('reset', this.queryDataCopy);
  }

  search() {
    const list = {};
    console.log(this.queryData);

    for (const key in this.queryData) {
      if ([50, 51].includes(this.queryType[key])) {
        if (
          this.queryData[key] &&
          Array.isArray(this.queryData[key]) &&
          this.queryData[key].length
        ) {
          list[key] = {
            type: this.queryType[key],
            value: this.queryData[key],
          };
        }
      } else if ([80].includes(this.queryType[key])) {
        if (this.queryData[key] && Object.keys(this.queryData[key]).length) {
          list[key] = {
            type: this.queryType[key],
            value: this.RelevanceFormData[key].find(
              (item) => item.id === this.queryData[key],
            ),
          };
        }
      } else if ([81].includes(this.queryType[key])) {
        if (
          this.queryData[key] &&
          Array.isArray(this.queryData[key]) &&
          this.queryData[key].length
        ) {
          list[key] = {
            type: this.queryType[key],
            value: this.queryData[key].map((id) => {
              return this.RelevanceFormData[key].find((item) => item.id === id);
            }),
          };
        }
      } else {
        if (this.queryData[key] && (this.queryData[key] + '').trim()) {
          list[key] = {
            type: this.queryType[key],
            value: this.queryData[key],
          };
        }
      }
    }
    this.$emit('search', list, this.nameObj, this.queryData);
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  // 获取关联表单数据
  getQueryList(schemaCode, code) {
    const obj: any = {
      schemaCode,
      mobile: false,
      page: 0,
      size: 1000,
      filters: [],
    };
    listApi.getQueryList(obj).then((res) => {
      if (res.errcode === 0) {
        const data = res.data.content.map((x: any) => x.data);
        this.$set(this.RelevanceFormData, code, data);
      } else {
        this.$set(this.RelevanceFormData, code, []);
      }
    });
  }

  // 国际化
  getKey(cur: any) {
    let name: any = cur.name;
    if (cur.name_i18n) {
      let name_i18n: any;
      if (typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n);
      } else {
        name_i18n = cur.name_i18n;
      }
      if (name_i18n[(this as any).$i18n.locale]) {
        name = name_i18n[(this as any).$i18n.locale];
      }
    }
    return name;
  }

  // 获取日期控件的Format
  setFormat(code): string {
    const find = this.datatype.find((d: any) => d.key === code);
    if (find) {
      return find.options.format;
    }
    return 'YYYY-MM-DD';
  }

  // 获取选人控件的multi
  setMulti(code): object {
    const find = this.datatype.find((d: any) => d.key === code);
    if (find) {
      return {
        selectOrg: false,
        selectUser: true,
        mulpitle: find.options.multi ? JSON.parse(find.options.multi) : false,
        showModel: true,
        showSelect: true,
        placeholder: '请选择',
        // maxTagCount: find.options.multi ? 0 : 1,
      };
    }
    return {
      selectOrg: false,
      selectUser: true,
      mulpitle: false,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
      // maxTagCount: 0,
    };
  }

  setMulti2(code): object {
    // const find = this.datatype.find((d: any) => d.key === code);
    // if (find) {
    //   return {
    //     selectOrg: true,
    //     selectUser: false,
    //     mulpitle: find.options.multi ? JSON.parse(find.options.multi) : false,
    //     showModel: true,
    //     showSelect: true,
    //     placeholder: '请选择',
    //   };
    // }
    return {
      selectOrg: true,
      selectUser: false,
      mulpitle: false,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
      // maxTagCount: 1,
    };
  }

  setMulti3(code): object {
    // const find = this.datatype.find((d: any) => d.key === code);
    // if (find) {
    //   return {
    //     selectOrg: true,
    //     selectUser: false,
    //     mulpitle: find.options.multi ? JSON.parse(find.options.multi) : false,
    //     showModel: true,
    //     showSelect: true,
    //     placeholder: '请选择',
    //   };
    // }
    return {
      selectOrg: true,
      selectUser: false,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
      // maxTagCount: 0,
    };
  }

  setMulti4(code): object {
    return {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
      // maxTagCount: 0,
    };
  }

  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang() {
    this.staffSelectorOpts.placeholder = this.$t(
      'cloudpivot.flowCenter.pc.plzSelect',
    ) as string;
  }

  closeQueryItem() {
    this.$emit('hide');
  }

  @Watch('$i18n.locale')
  onLanguageChange(l: string) {
    this.placeHolderLang();
  }
}
</script>

<style lang="less" scoped>
.filter-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0);
  z-index: 1;
}
.query-form {
  // display: flex;
  // padding: 10px;
  position: absolute;
  width: 320px;
  right: 0;
  // margin-top: -8px;
  padding: 10px 0 0;
  box-shadow: 0px 4px 8px 0px rgba(30, 85, 255, 0.1);
  border-radius: 4px;
  background: #fff;
  z-index: 9;
  &.en {
    /deep/.ant-form-item-label label {
      width: 120px;
      text-align: left;
    }
  }
  &-left {
    flex-grow: 2;
    max-height: 448px;
    overflow-y: auto;
    padding: 16px 24px 0;
    .ant-form {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
    .ant-input,
    /deep/.ant-form-inline .ant-form-item > .ant-form-item-control-wrapper {
      // width: calc(100% - 90px);
      height: 32px;
      flex-shrink: 0;
      & > .ant-form-item-control {
        line-height: 0 !important;
        width: 100%;
      }
    }
    // /deep/.ant-form-inline .ant-form-item.range-picker > .ant-form-item-control-wrapper {
    //   width: 350px;
    // }
    /deep/.ant-form-item-label label {
      // width: 80px;
      // margin-right: 10px;
      // display: inline-block;
      // text-align: right;
      // line-height: 32px;
      // height: 32px;
      // overflow: hidden;
      // text-overflow: ellipsis;
      // white-space: nowrap;
    }
    &.en {
      /deep/.ant-form-item-label label {
        width: 120px;
        text-align: left;
        line-height: 32px;
      }
    }
    .ai-form /deep/.ant-form-item-label label {
      width: auto;
    }
    /deep/.ant-form-inline .ant-form-item {
      // margin-bottom: 10px;
      // margin-right: 1.5%;
      // width: 32.33%;
      width: 100%;
      margin-right: 0;
      padding: 8px 0;
      &:nth-child(3n) {
        margin-right: 0;
      }
      .ant-form-item-label {
        width: 100%;
        max-width: none;
        min-width: 0;
        flex: 0;
        color: #111218;
        font-weight: 400;
        font-size: 14px;
        margin-bottom: 6px;
        margin-right: 0;
        text-align: left;
        height: 22px;
        line-height: 22px;
      }
      .ant-form-item-control-wrapper {
        width: 100%;
        display: flex;
        flex-grow: 1;
        align-items: center;
        color: rgba(0, 0, 0, 0.65);
        min-height: 1em;
        text-align: left;
        .ant-input {
          border-radius: 2px;
        }
      }
    }
    /deep/.ant-calendar-picker-input {
      line-height: normal !important;
      & > input {
        font-size: 14px;
      }
    }
    .workflow-name-input {
      width: 100% !important;
      /deep/.h3-organization__label {
        > div {
          .h3-organization-selected {
            max-width: 119px;
            .h3-organization-selected-name {
              width: 100%;
            }
          }
          .h3-organization-selected:last-child {
            padding: 0 5px;
          }
          .h3-organization-selected:first-child {
            padding: 0 24px 0 26px;
          }
        }
      }
    }
  }

  &-right {
    width: 100%;
    // height: 45px;
    padding: 24px;
    text-align: right;
    & > button {
      margin-left: 8px;
    }

    & > span {
      width: 50px;
      color: rgba(0, 0, 0, 0.45);
      cursor: pointer;
      user-select: none;
      margin-right: 16px;

      & > i {
        transform: rotate(180deg);
        &.collapsed {
          transform: rotate(0);
        }
      }
    }
  }

  &.collapsed {
    overflow: hidden;
    // height: 45px;
    box-shadow: none;
  }
}
</style>
<style lang="less">
.query-form {
  .ant-calendar-picker {
    width: 100% !important;
  }
}
.actions .filter-card {
  margin: 0;
  margin-left: 16px;
  .item-title-all {
    max-width: 300px;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="recursive-list" :class="{ 'is-child-list': !showHead }">
    <div v-if="showHead" class="row head">
      <span class="action"> </span>
      <template v-for="(item, index) in columns">
        <div :key="index" class="item head-item" :style="getStyle(item)">
          <template v-if="item.slots">
            <slot :name="item.slots.title">
              {{ item.title }}
            </slot>
          </template>
          <span v-else :key="index">{{ item.title }}</span>
        </div>
      </template>
    </div>

    <div class="container">
      <template v-for="(row, rowIndex) in dataSource">
        <div :key="rowIndex" class="row">
          <span
            class="action"
            :style="{ 'margin-left': (currentLevel - 1) * 16 + 'px' }"
            @click="toggleShowChild(row)"
          >
            <template v-if="row.subParameters">
              <em
                v-if="!row.showChild"
                class="icon aufontAll h-icon-all-caret-right"
              ></em>
              <em v-else class="icon aufontAll h-icon-all-caret-down"></em>
            </template>
          </span>
          <template v-for="(item, conIndex) in columns">
            <div
              :key="rowIndex + '-' + conIndex"
              class="item"
              :style="getStyle(item)"
            >
              <!-- 参数名称 -->
              <template v-if="item.key === 'serviceMethodParameterCode'">
                <span>{{ row[item.key] }}</span>
              </template>

              <!-- 参数类型 -->
              <template v-if="item.key === 'bizPropertyType'">
                <span>{{ getItemName(row) }}</span>
              </template>

              <!-- 映射方式 -->
              <template
                v-if="
                  item.key === 'codeType' && row.externParameterType !== 1002
                "
              >
                <template v-if="isBizMethod">
                  <a-select
                    v-model="row.codeType"
                    :disabled="row.externParameterType === 1001"
                    @change="codeTypeChange(row)"
                  >
                    <a-select-option
                      v-for="(itemType, i) in getCodeTypes(row)"
                      :key="i"
                      :value="itemType.value"
                      :title="itemType.label"
                    >
                      {{ itemType.label }}
                    </a-select-option>
                  </a-select>
                </template>
                <template v-else>
                  {{ getCodeType(item.codeType) }}
                </template>
              </template>

              <!-- 映射对象 -->
              <template
                v-if="
                  item.key === 'bizCode' && row.externParameterType !== 1002
                "
              >
                <a-select
                  v-if="[1, 2].includes(row.codeType)"
                  v-model="row.bizCode"
                >
                  <template>
                    <a-select-opt-group>
                      <span slot="label" class="select-title">业务数据项</span>
                      <a-select-option
                        v-for="(data, i) in getDataItems(dataSource, row)"
                        :key="i"
                        :value="data.code"
                        :title="data.name + '[' + data.code + ']'"
                      >
                        {{ data.name }}[{{ data.code }}]
                      </a-select-option>
                    </a-select-opt-group>
                    <a-select-opt-group>
                      <span slot="label" class="select-title">系统数据项</span>
                      <a-select-option
                        v-for="(data, i) in getDataItems(dataSource, row, true)"
                        :key="i"
                        :value="data.code"
                      >
                        {{ data.name }}[{{ data.code }}]
                      </a-select-option>
                    </a-select-opt-group>
                  </template>
                </a-select>
                <template v-else>
                  <a-select
                    v-if="isGetList"
                    v-model="row.bizCode"
                    mode="combobox"
                  >
                    <a-select-option
                      v-for="(itemConst, i) in getInputConstList(item)"
                      :key="i"
                      :value="itemConst.value"
                      :title="itemConst.title"
                    >
                      {{ itemConst.label }}
                    </a-select-option>
                  </a-select>
                  <a-input v-else v-model="row.bizCode" />
                </template>
              </template>
            </div>
          </template>
        </div>

        <mappingsList
          v-if="row.subParameters && row.showChild"
          :key="'child-' + rowIndex"
          :level="currentLevel"
          :showHead="false"
          :columns="columns"
          :dataItems="dataItems"
          :isGetList="isGetList"
          :dataSource="row.subParameters"
          :isBizMethod="isBizMethod"
          :listParamType="listParamType"
          :getInputConstList="getInputConstList"
          @dataSourceChange="dataSourceChange"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import FormInput from '@/components/global/form-input/index.vue';
import { DatePicker, Input, Select, Popover, Tooltip } from '@h3/antd-vue';
import { namespace } from 'vuex-class';
const MethodsModule = namespace('Integration/Methods');

@Component({
  name: 'mappingsList',
  components: {
    FormInput,
    AInput: Input,
    ADatePicker: DatePicker,
    ATextarea: Input.TextArea,
    APopover: Popover,
    ATooltip: Tooltip,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
  },
})
export default class mappingsList extends Vue {
  @MethodsModule.State('paramTypes') paramTypes: any;

  @Prop() columns!: any[];

  @Prop() dataSource!: any[];

  @Prop() isBizMethod!: boolean;

  @Prop() listParamType!: any[];

  // 当前模型 数据项
  @Prop() dataItems!: any;

  @Prop({
    default: () => {},
  })
  getInputConstList!: Function;

  @Prop() bizPropertyTypes!: any[];

  @Prop() isGetList!: boolean;

  @Prop({
    default: true,
  })
  showHead: boolean;

  @Prop({
    default: 0,
  })
  level?: number;

  validateForm() {
    let list: any[] = [];
    Object.entries(this.$refs).forEach(([key, value]) => {
      if (value && /^form-input-arg/.test(key)) {
        list.push(this.$refs[key]);
      }
      if (
        value &&
        /^inputparems-/.test(key) &&
        (this.$refs[key] as any).length
      ) {
        list = [...list, ...(this.$refs[key] as any)[0].validateForm()];
      }
    });

    return list.flat(Infinity);
  }

  get currentLevel(): number {
    return this.level + 1;
  }

  toggleShowChild(row) {
    row.showChild = !row.showChild;
    this.$emit('dataSourceChange', this.dataSource);
  }

  dataSourceChange() {
    this.$emit('dataSourceChange', this.dataSource);
  }

  // 映射方式改变
  codeTypeChange(row) {
    row.bizCode = '';
    this.$emit('dataSourceChange', this.dataSource);
  }

  getStyle(item) {
    if (item.width) {
      return {
        width: typeof item.width === 'string' ? item.width : item.width + 'px',
      };
    }
    return {
      flex: 1,
    };
  }

  getItemName(item) {
    let dataItem: any = {};
    if (!item.externParameterType) {
      dataItem =
        this.paramTypes.find((el) => +el.value === item.bizPropertyType) || {};
    } else {
      dataItem =
        this.paramTypes.find((el) => +el.value === item.externParameterType) ||
        {};
    }
    return (dataItem && dataItem.label) || item.propertyName;
  }

  getCodeTypes(row: any) {
    if (row.externParameterType === 1001) {
      return this.codeTypes;
    } else {
      return this.codeTypes.filter((item: any) => item.value !== 2);
    }
  }

  codeTypes: any[] = [
    {
      label: '固定值',
      value: 0,
    },
    {
      label: '动态值',
      value: 1,
    },
    {
      label: '子表',
      value: 2,
    },
  ];

  //转换映射方式
  getCodeType(val) {
    let value: string = '';
    this.codeTypes.forEach((c) => {
      if (c.value === val) {
        value = c.label;
      }
    });
    return value;
  }

  /**
   * 过滤得出可选列表
   * @param filterDefault 是否仅筛选出系统数据项，否则筛选出表单数据项
   */
  getDataItems(list, record: any, filterDefault: boolean = false) {
    const selected: string[] = [];
    const bizCodeCount = {};
    list.forEach((item: any) => {
      if (item.codeType === 1 && item.index !== record.index) {
        selected.push(item.bizCode);
      }
      if (bizCodeCount[item.bizCode]) {
        bizCodeCount[item.bizCode] = bizCodeCount[item.bizCode] + 1;
      } else {
        bizCodeCount[item.bizCode] = 1;
      }
    });
    //数据项过滤 系统数据项部门查询编码、附件6、审批意见7
    let currentDataItems: any = this.dataItems.filter(
      (item: any) =>
        ![6, 7].includes(item.propertyType) &&
        item.code !== 'ownerDeptQueryCode',
    );

    if (record.parentBizPropertyType === 1001) {
      if (record.parent && record.parent.bizCode && !filterDefault) {
        let result: any[] = [];
        const sheet = currentDataItems.find(
          (item: any) => item.code === record.parent.bizCode,
        );
        if (sheet) {
          result = sheet.subSchema.properties.filter(
            (el) =>
              ![6, 7].includes(el.propertyType) &&
              ![
                'id',
                'modifiedTime',
                'parentId',
                'sortKey',
                'modifier',
                'modifiedTime',
              ].includes(el.code),
          );
        }

        currentDataItems = result;
      } else {
        return [];
      }
    }
    if (filterDefault) {
      return currentDataItems.filter(
        (item: any) =>
          !selected.includes(item.code) &&
          item.defaultProperty &&
          item.propertyType === record.bizPropertyType,
      );
    }

    // 如果是日期或时间控件，允许重复选中，只能重复两次
    if (record.bizPropertyType === 2 || record.bizPropertyType === 3) {
      return currentDataItems.filter((item: any) => {
        return (
          item.propertyType === record.bizPropertyType &&
          !item.defaultProperty &&
          (bizCodeCount[item.code] < 2 || bizCodeCount[item.code] === undefined)
        );
      });
    }
    let res = currentDataItems.filter(
      (item: any) =>
        record.bizCode === item.code ||
        (!selected.includes(item.code) &&
          !item.defaultProperty &&
          ([0, 12, 13, 14, 15].includes(item.propertyType)
            ? [0, 12, 14].includes(item.propertyType)
              ? [0, 12, 14, 20].includes(record.bizPropertyType)
              : [13, 15].includes(record.bizPropertyType)
            : item.propertyType === record.bizPropertyType)),
    );

    if (record.externParameterType === 1001) {
      res = currentDataItems.filter((item: any) => item.propertyType === 8);
    }
    return res;
  }
}
</script>

<style lang="less" scoped>
.recursive-list {
  margin-top: 20px;
  border: 1px solid #e9e9e9;
  border-bottom: none;
  border-radius: 4px;
}
.is-child-list {
  // margin-left: 16px;
  margin-top: 0;
  border: none;
}
.row {
  border-bottom: 1px solid #e9e9e9;
  // border-radius: 4px;
  display: flex;
  min-height: 38px;
  .action {
    width: 42px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    em {
      font-size: 9px;
      color: rgba(17, 18, 24, 0.5);
      cursor: pointer;
      &:hover {
        color: #2970ff;
      }
    }
  }
  .item {
    margin-left: 16px;
    .ant-select {
      width: 240px;
    }
    &:last-child {
      margin-right: 16px;
    }
    &:first-of-type {
      margin-left: 0;
    }
    display: flex;
    align-items: center;
    & > * {
      flex: 1;
    }

    .btns {
      font-size: 14px;
      color: #111218;
      span {
        margin-right: 18px;
        cursor: pointer;
        &:last-child {
          margin-right: 0;
        }
      }
      em {
        &:hover {
          color: #2970ff;
        }
      }
    }
  }
}
.head {
  border-bottom: 1px solid #e9e9e9;
  .item {
    line-height: 38px;
    font-size: 14px;
    color: #111218;
    font-weight: 600;
  }
}
</style>
<style lang="less">
.add-types-popover {
  .ant-popover-arrow {
    display: none;
  }
  .ant-popover-inner-content {
    padding: 4px 12px;
    margin-top: -8px;
    width: 108px;
    height: 72px;
    p {
      line-height: 32px;
      cursor: pointer;
      font-size: 14px;
      color: #111218;
      &:hover {
        color: #2970ff;
      }
    }
  }
}
</style>

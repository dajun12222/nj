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
              <!-- 数据名称 -->
              <template v-if="item.key === 'name'">
                <span>{{ row[item.key] }}</span>
              </template>

              <!-- 参数类型 -->
              <template v-if="item.key === 'type'">
                <span>{{ getName(row) }}</span>
              </template>

              <!-- 值 -->
              <template
                v-if="
                  item.key === 'value' &&
                  ![1001, 1002].includes(row.externParameterType)
                "
              >
                <template v-if="row.bizPropertyType === 2">
                  <form-input
                    :ref="`form-input-res-code-${row.code}`"
                    v-model="row.value"
                    :rules="rules.code"
                    :tipPosition="'top'"
                    :type="'number'"
                    placeholder="请输入"
                  />
                </template>
                <template v-else-if="row.bizPropertyType === 3">
                  <form-input
                    :ref="`form-input-res-date-${row.code}`"
                    v-model="row.value"
                    :rules="rules.date"
                    :tipPosition="'top'"
                    placeholder="请选择日期"
                  />
                </template>
                <template v-else-if="row.bizPropertyType === 4">
                  <form-input
                    :ref="`form-input-res-logic-${row.code}`"
                    v-model="row.value"
                    :rules="rules.logic"
                    :tipPosition="'top'"
                    placeholder="请选择"
                  />
                </template>
                <a-textarea
                  v-else-if="row.bizPropertyType === 0"
                  v-model="row.value"
                  class="add-method__textarea"
                  :autoSize="{ minRows: 1, maxRows: 5 }"
                  placeholder="请输入"
                />
                <form-input
                  v-else
                  :ref="`form-input-res-code-${row.code}`"
                  v-model="row.value"
                  :rules="rules.code"
                  :tipPosition="'top'"
                  placeholder="请输入"
                />
              </template>
            </div>
          </template>
        </div>

        <runMethodList
          v-if="row.subParameters && row.showChild"
          :key="'child-' + rowIndex"
          :ref="'inputparems-' + rowIndex"
          :dataSource="row.subParameters"
          :level="currentLevel"
          :rules="rules"
          :showHead="false"
          :bizPropertyTypes="bizPropertyTypes"
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

@Component({
  name: 'runMethodList',
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
export default class runMethodList extends Vue {
  @Prop() dataSource!: any[];

  @Prop() isBizMethod!: boolean;

  @Prop() listParamType!: any[];

  @Prop() rules!: any[];

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

  columns: any[] = [
    {
      dataIndex: 'name',
      key: 'name',
      title: '数据名称',
    },
    {
      dataIndex: 'type',
      key: 'type',
      width: 134,
      title: '参数类型',
    },
    {
      dataIndex: 'value',
      key: 'value',
      width: 240,
      title: '值',
    },
  ];

  getName(row) {
    let name = row.type;
    if (row.externParameterType === 1001) {
      name = '数组';
    }
    if (row.externParameterType === 1002) {
      name = '对象';
    }
    return name;
  }

  // 校验
  validateForm() {
    let list: any[] = [];
    Object.entries(this.$refs).forEach(([key, value]) => {
      if (value && /^form-input-res/.test(key)) {
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

  // 当前层级
  get currentLevel(): number {
    return this.level + 1;
  }

  // 切换显示/隐藏子级
  toggleShowChild(row) {
    row.showChild = !row.showChild;
    this.$emit('dataSourceChange', this.dataSource);
  }

  // 数据改变
  dataSourceChange() {
    this.$emit('dataSourceChange', this.dataSource);
  }

  // 使用传入的style
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

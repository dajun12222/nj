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
          <span class="action" @click="toggleShowChild(row)">
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
              <template v-if="item.dataIndex === 'code'">
                <form-input
                  :ref="`form-input-arg-code-${row[item.dataIndex].sortKey}`"
                  v-model="row[item.dataIndex]"
                  :disabled="isOperation(service)"
                  :rules="rules.value"
                  tipPosition="top"
                  placeholder="请输入"
                />
              </template>

              <!-- 显示名称 -->
              <template v-if="item.dataIndex === 'name'">
                <form-input
                  :ref="`form-input-arg-code-${row[item.dataIndex].sortKey}`"
                  v-model="row[item.dataIndex]"
                  :disabled="isOperation(service)"
                  :rules="rules.value"
                  tipPosition="top"
                  placeholder="请输入"
                />
              </template>

              <!-- 应用位置 -->
              <template v-if="item.dataIndex === 'configJson.position'">
                <a-select
                  slot="position"
                  v-model="row['configJson']['position']"
                  :options="locationTypes"
                  :disabled="!showHead"
                  @change="positionChange(row)"
                />
              </template>

              <!-- 参数类型 -->
              <template v-if="item.dataIndex === 'bizPropertyType'">
                <a-select
                  v-model="row[item.dataIndex]"
                  :options="filterBizPropertyTypes(row)"
                  :disabled="row.subParameters && row.subParameters.length > 0"
                  @change="bizPropertyTypeChange(row)"
                />
              </template>

              <!-- 描述 -->
              <template v-if="item.dataIndex === 'description'">
                <template v-if="row[item.dataIndex].bizPropertyType === 2">
                  <a-input
                    v-model="row[item.dataIndex]"
                    :disabled="isOperation(service)"
                    type="text"
                    style="width: 100%"
                    :maxLength="15"
                    placeholder="请输入"
                    @change="
                      () => {
                        row[item.dataIndex].description = row[
                          item.dataIndex
                        ].description.replace(/[^\d]/g, '');
                      }
                    "
                  />
                </template>
                <template v-else-if="row[item.dataIndex].bizPropertyType === 3">
                  <a-date-picker
                    v-model="row[item.dataIndex]"
                    style="width: 100%"
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择时间"
                  />
                </template>
                <template v-else-if="row[item.dataIndex].bizPropertyType === 4">
                  <a-select
                    v-model="row[item.dataIndex]"
                    placeholder="请选择"
                    :disabled="isOperation(service)"
                    allowClear
                    style="width: 100%"
                  >
                    <a-select-option key="1" value="true">
                      true
                    </a-select-option>
                    <a-select-option key="2" value="false">
                      false
                    </a-select-option>
                  </a-select>
                </template>
                <a-textarea
                  v-else
                  v-model="row[item.dataIndex]"
                  class="add-method__textarea"
                  :maxLength="200"
                  :autosize="{ minRows: 1, maxRows: 5 }"
                  placeholder="请输入"
                />
              </template>

              <template v-if="item.dataIndex === 'action'">
                <div class="btns">
                  <!-- 删除按钮 -->
                  <a-tooltip placement="top">
                    <span slot="title">删除数据</span>
                    <span>
                      <em
                        class="icon aufontAll h-icon-all-delete-o"
                        @click="popItem(row, rowIndex)"
                      ></em>
                    </span>
                  </a-tooltip>

                  <!-- 参数类型：对象/数组才能添加子级 -->
                  <template
                    v-if="[1001, 1002].includes(row['bizPropertyType'])"
                  >
                    <a-popover
                      placement="bottomRight"
                      overlayClassName="add-types-popover"
                    >
                      <template slot="content">
                        <p @click="add(row, 'peer')">新增同级数据</p>
                        <p @click="add(row, 'subLevel')">新增子级数据</p>
                      </template>
                      <span>
                        <em class="icon aufontAll h-icon-all-plus"></em>
                      </span>
                    </a-popover>
                  </template>
                  <template v-else>
                    <a-tooltip placement="topRight">
                      <span slot="title">新增同级数据</span>
                      <span>
                        <em
                          class="icon aufontAll h-icon-all-plus"
                          @click="add(row, 'peer')"
                        ></em>
                      </span>
                    </a-tooltip>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </div>

        <recursiveList
          v-if="row.subParameters && row.showChild"
          :ref="'inputparems-' + row.sortKey"
          :key="'child-' + rowIndex"
          :level="currentLevel"
          :showHead="false"
          :service="service"
          :columns="columns"
          :locationTypes="locationTypes"
          :dataSource="row.subParameters"
          :rules="rules"
          :isOperation="isOperation"
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
  name: 'recursiveList',
  components: {
    FormInput,
    ASelect: Select,
    ASelectOption: Select.Option,
    AInput: Input,
    ADatePicker: DatePicker,
    ATextarea: Input.TextArea,
    APopover: Popover,
    ATooltip: Tooltip,
  },
})
export default class recursiveList extends Vue {
  @Prop() columns!: any[];

  @Prop() dataSource!: any[];

  @Prop() rules!: any[];

  @Prop() locationTypes?: any;

  @Prop({
    default: () => {},
  })
  isOperation!: Function;

  @Prop() bizPropertyTypes!: any[];

  @Prop() service!: any;

  @Prop({
    default: true,
  })
  showHead: boolean;

  @Prop({
    default: 0,
  })
  level?: number;

  // 最大自己嵌套
  maxSub: number = 6;

  bizPropertyTypeChange(row) {
    row.description = '';
    this.dataSourceChange();
  }

  filterBizPropertyTypes(row) {
    // 当上级参数类型是数组时：子级参数类型不能时 数组、对象； 第六层不能再添加子级，所以也不能有数组、对象
    if (
      row.parentBizPropertyType === 1001 ||
      this.currentLevel === this.maxSub
    ) {
      return this.bizPropertyTypes.filter((biz) => {
        return !['Object', 'List'].includes(biz.type);
      });
    }
    return this.bizPropertyTypes;
  }

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

  changeSubPosition(arr, position) {
    arr.forEach((el: any) => {
      el.configJson.position = position;
      if (el.subParameters) {
        this.changeSubPosition(el.subParameters, position);
      }
    });
  }

  positionChange(row) {
    if (row.subParameters) {
      this.changeSubPosition(row.subParameters, row.configJson.position);
    }
  }

  /**
   * 添加条目
   */
  add(row, type: 'peer' | 'subLevel') {
    const item: BizService.Method.InputParam = {
      code: '',
      name: '',
      bizPropertyType: 0,
      description: '',
      index: -1,
      sortKey: Date.now().toString(),
    };

    if (this.columns.find((el) => el.key === 'position')) {
      // 添加子级时：子级的应用位置跟父级的保持一致
      item.configJson = { position: row.configJson.position };
    }

    if (type === 'subLevel') {
      row.showChild = true;
      item.parentBizPropertyType = row.bizPropertyType;
      // 仅限五层数据结构
      if (this.currentLevel >= this.maxSub) {
        return;
      }
      if (row.subParameters) {
        item.index = row.subParameters.length;
        row.subParameters.push(item);
      } else {
        item.index = 1;
        row.subParameters = [item];
      }
    } else {
      if (row.parentBizPropertyType) {
        item.parentBizPropertyType = row.parentBizPropertyType;
      }
      item.index = this.dataSource.length;
      this.dataSource.push(item);
    }
    this.dataSourceChange();
  }

  popItem(item, index) {
    this.dataSource.splice(index, 1);
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
}
</script>

<style lang="less" scoped>
.recursive-list {
  margin-top: 20px;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
}
.is-child-list {
  margin-left: 16px;
  margin-top: 0;
  border: none;
}
.row {
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

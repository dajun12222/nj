<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="permission-data-item">
    <div class="data-item">
      <div class="data-item-wrapper">
        <div class="item head-item">
          <div></div>
          <div>可见</div>
          <div v-if="bizPermType !== '2'">可写</div>
          <div v-if="bizPermType !== '2'">必填</div>
        </div>

        <div>
          <div class="item">
            <div>全选</div>
            <div>
              <a-checkbox
                v-model="dataHead.visible"
                class="checkbox"
                @change="checkAll('visible')"
              />
            </div>
            <div v-if="bizPermType !== '2'">
              <a-checkbox
                v-model="dataHead.writeAble"
                class="checkbox"
                @change="checkAll('writeAble')"
              />
            </div>

            <div v-if="bizPermType !== '2'">
              <a-checkbox
                v-model="dataHead.required"
                class="checkbox"
                @change="checkAll('required')"
              />
            </div>
          </div>

          <!-- 主表数据项 -->
          <template v-for="(item, key) in list">
            <div :key="key" class="item">
              <div>
                <span>
                  <!-- {{ item.name }} -->
                  <template v-if="lang === 'zh'">
                    {{
                      item.parentCode
                        ? item.parentName + '.' + item.name
                        : item.name
                    }}
                  </template>
                  <template v-else>
                    {{
                      item.parentCode
                        ? (item.parentNameI18n[lang] || item.parentName) +
                          '.' +
                          (item.name_i18n[lang] || item.name)
                        : item.name_i18n[lang] || item.name
                    }}
                  </template>
                </span>
              </div>

              <div>
                <a-checkbox
                  v-model="item.visible"
                  class="checkbox"
                  :disabled="item.propertyEmpty"
                  @change="onSelectChange('visible', item)"
                />
              </div>

              <div v-if="bizPermType !== '2'">
                <a-checkbox
                  v-model="item.writeAble"
                  class="checkbox"
                  :disabled="item.propertyEmpty"
                  @change="onSelectChange('writeAble', item)"
                />
              </div>

              <div v-if="bizPermType !== '2'">
                <a-checkbox
                  v-model="item.required"
                  class="checkbox"
                  :disabled="item.propertyEmpty"
                  @change="onSelectChange('required', item)"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Checkbox, Table } from '@h3/antd-vue';

@Component({
  name: 'permission-data-item',
  components: {
    ACheckbox: Checkbox,
    ATable: Table,
  },
})
export default class PermissionDataItem extends Vue {
  @Prop() dataItems!: any;

  @Prop() bizPermType!: string;

  @Prop() tableHeight!: number;

  get lang() {
    return this.$i18n.locale;
  }

  @Watch('bizPermType')
  onType(val: string) {
    this.initTable(val);
  }

  // 全选可见、可写、必填
  dataHead: any = {
    visible: false,
    writeAble: false,
    required: false,
  };

  // 数据项
  list: any[] = [];

  // 实际展示表头
  realColumns: Array<Common.TableHead> = [];

  // 表头
  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'name',
      slots: {
        title: 'nameTitle',
      },
      scopedSlots: {
        customRender: 'name',
      },
      key: 'name',
      width: 160,
    },
    {
      dataIndex: 'visible',
      slots: {
        title: 'visibleTitle',
      },
      scopedSlots: {
        customRender: 'visible',
      },
      key: 'visible',
      width: 160,
    },
    {
      dataIndex: 'writeAble',
      slots: {
        title: 'writeAbleTitle',
      },
      scopedSlots: {
        customRender: 'writeAble',
      },
      key: 'writeAble',
      width: 160,
    },
    {
      dataIndex: 'required',
      slots: {
        title: 'requiredTitle',
      },
      scopedSlots: {
        customRender: 'required',
      },
      key: 'required',
    },
  ];

  /**
   * 单个勾选框变化
   */
  onSelectChange(type: string, record: any) {
    if (type === 'visible' && !record.visible) {
      // 取消可见同时取消可写和必填
      record.writeAble = false;
      record.required = false;
    }
    if (type === 'writeAble') {
      if (!record.writeAble) {
        record.required = false;
      } else {
        record.visible = true;
        if (record.propertyEmpty) {
          record.required = true;
        }
      }
    }
    if (type === 'required') {
      if (record.required) {
        record.writeAble = true;
        record.visible = true;
      } else {
        if (record.propertyEmpty) {
          record.writeAble = false;
        }
      }
    }
    if (record.hasSubSchema) {
      const childs: any[] = this.dataItems.filter(
        (sub: any) => sub.parentCode === record.propertyCode,
      );
      childs.forEach((chd: any) => {
        if (chd.propertyEmpty && this.bizPermType === '1') {
          return;
        }
        chd[type] = record[type];
      });
    }
    if (record && record.parentCode) {
      this.onSubSelectChange(type, record);
    }
    this.$emit('propertityPermissionGroupsChange', this.list);
    this.checkStatus();
  }

  /**
   * 子数据项勾选框变化，连带父级变化
   */
  onSubSelectChange(type: string, record: any) {
    if (record.parentCode) {
      const parent: any = this.dataItems.find(
        (par: any) => par.propertyCode === record.parentCode,
      );
      const sibs: any[] = this.dataItems.filter(
        (sib: any) => sib.parentCode === record.parentCode,
      );
      parent[type] = sibs.some((item: any) => item[type]);
    }
  }

  /**
   * 全选
   */
  checkAll(type: string) {
    if (!type) {
      return;
    }
    const checked: boolean = this.dataHead[type];
    this.list.forEach((item: any) => {
      item[type] = item.propertyEmpty || checked;
    });
    if (type === 'required' && checked) {
      this.dataHead.writeAble = true;
      this.checkAll('writeAble');
    }
    if (type === 'writeAble') {
      if (checked) {
        this.dataHead.visible = true;
        this.checkAll('visible');
      } else {
        this.dataHead.required = false;
        this.checkAll('required');
      }
    }
    if (type === 'visible' && !checked) {
      this.dataHead.writeAble = false;
      this.checkAll('writeAble');
    }
    this.$emit('propertityPermissionGroupsChange', this.list);
  }

  /**
   * 判断全选是否勾选
   */
  checkStatus() {
    Object.keys(this.dataHead).forEach((type: string) => {
      this.dataHead[type] = !this.list.some((item: any) => !item[type]);
    });
  }

  initTable(bizPermType: string) {
    //
    this.list = [];
    if (+bizPermType === 2) {
      this.realColumns = this.columns.filter(
        (col: Common.TableHead) =>
          !['writeAble', 'required'].includes(col.key as string),
      );
      this.realColumns.some((col: Common.TableHead) => {
        if (col.key === 'visible') {
          col.width = 600;
          return true;
        }
        return false;
      });
    } else {
      this.realColumns = this.columns;
      this.realColumns.some((col: Common.TableHead) => {
        if (col.key === 'visible') {
          col.width = 160;
          return true;
        }
        return false;
      });
    }
    this.$nextTick(() => {
      setTimeout(() => {
        this.list = this.dataItems;
        this.list.forEach((item, index) => {
          item.key = index;
        });
        this.checkStatus();
      }, 100);
    });
  }

  mounted() {
    this.initTable(this.bizPermType);
  }
}
</script>
<style lang="less" scoped>
.permission-data-item {
  width: 468px;
  .checkbox {
    margin-right: 10px;
  }
  // /deep/.ant-table-thead span {
  //   font-weight: 600;
  //   color: rgba(0,0,0,0.65);
  // }
  /deep/.ant-table-body {
    // max-height: calc(100vh - 325px)!important;
    color: #111218;
  }
}
</style>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.data-item {
  width: 100%;
  .check-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 8px;
    .check-item {
      flex: 1;
      min-width: 66px;
      font-size: 14px;
      .checkbox {
        font-size: 14px;
        margin-right: 6px;
        /deep/.ant-checkbox-indeterminate {
          .ant-checkbox-inner {
            background-color: #75c9b5;
            border-color: #75c9b5;
            &:after {
              width: 10px;
              height: 3px;
              background-color: #fff;
            }
          }
        }
      }
    }
  }
  .dataitem-wrap {
    &.page-loading-wrap {
      min-height: 104px;
    }
  }
}

.data-item-wrapper {
  .item {
    display: flex;
    // box-shadow: 0px 1px 0px 0px #EEEEEE;
    border-bottom: 1px solid #eeeeee;
    color: @nav-font-color;
    font-size: 13px;
    height: 32px;
    align-items: center;
    div:first-child {
      width: 120px;
      text-align: left;
      margin-left: 0;
      justify-content: flex-start;
      span {
        display: inline-block;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    div {
      min-width: 106px;
      padding: 0 8px;
      text-align: center;
      margin-left: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      .checkbox {
        margin-right: 0;
      }
    }
    &.head-item {
      background: #f5f6f9;
    }
  }
}
</style>

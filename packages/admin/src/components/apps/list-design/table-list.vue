<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="content-box">
    <a-table
      :columns="columns"
      :pagination="pagingSetting.showTotal === false ? false : {}"
      :locale="{ emptyText: $t('languages.Apps.NoData') }"
      :dataSource="dataSource"
      :scroll="{ x: totalWidth }"
      size="small"
      class="content-box__table"
      @change="onChange"
    >
      <span
        v-for="(dataitem, index) in columns"
        :key="index"
        :slot="dataitem.slots.title"
        :title="dataitem.name"
        :class="{ resize: index > 0 }"
        class="in-th-span"
        >{{ getTableKey(dataitem) }}</span>
    </a-table>

    <template v-if="pagingSetting.showTotal === false">
      <div class="no-show-total-pagination">
        <span class="prev-btn">
          <em class="icon aufontAll h-icon-all-left"></em>
        </span>
        <span class="current-page">1</span>
        <span class="next-btn">
          <em class="icon aufontAll h-icon-all-right"></em>
        </span>

        <a-select
          v-model="pageSize"
          placeholder="请选择"
          style="width: 98px; height: 32px;margin-left: 8px;"
        >
          <a-select-option
            v-for="(items, ind) in pageSizeOptions"
            :key="ind"
            :value="+items"
          >
            {{ items }} 条/页
          </a-select-option>
        </a-select>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Table, Select } from '@h3/antd-vue';
import { utils } from 'cloudpivot/common';
import moment from 'moment';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { DateType } from './modals/control-modals-map';
import {
  showFieldDefaultValByCode,
  showFieldDefaultValByType,
} from './typings';

const DateHandle = utils.DateHandle;

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'TableList',
  components: {
    // GanttView
    ATable: Table,
    ASelect:Select,
    ASelectOption: Select.Option
  },
})
export default class TableList extends Vue {
  @ListdesignModule.State('showFieldArray') showFieldArray: any;

  @ListdesignModule.Mutation('setShowFieldArray') setShowFieldArrayStore: any;

  dataSourceEach: any = {};

  dataSource: any[] = [];

  columns: any[] = [];

  @Prop() listConfig: any; //视图配置信息

  queryPresentationType: string = 'LIST'; //视图类型：列表LIST、甘特图GANTT

  // 搜索范围可选项
  dataScopeType = 4;

  // 列表视图排序所需的字段
  sortByDirect: string = 'asc';

  childSchemas: any = {};

  queryDefaultValues: any = {};

  filterObjectId = '';

  schemaCode: string = 'test';

  pageSize:number = 20;

  // 分页配置项
  pageSizeOptions: string[] = ['10', '20', '50', '100', '200', '300', '500'];

  mounted() {
    this.setShowFieldArray(this.showFieldArray);
  }

  @Watch('listConfig', { deep: true })
  listConfigChange(data: any) {
    /* this.listConfig = data; */
    this.queryPresentationType = this.listConfig.queryPresentationType;
    this.$forceUpdate();
  }

  get pagingSetting(){
    return this.listConfig && this.listConfig.pagingSetting || {}
  }

  @Watch('pagingSetting.pageSize')
  onPageSizeChange(){
    this.pageSize = this.pagingSetting.pageSize || 20;
  }

  // 中英文字段过滤
  getTableKey(cur: any) {
    let name: any =
      this.$i18n.locale === 'zh' ? cur.name : zhToEn[cur.name] || cur.name;
    if (cur.name_i18n) {
      let name_i18n: any;
      if (typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n);
      } else {
        name_i18n = cur.name_i18n;
      }
      if (name_i18n[this.$i18n.locale]) {
        name =
          this.$i18n.locale === 'zh'
            ? name_i18n[this.$i18n.locale]
            : zhToEn[name_i18n[this.$i18n.locale]] ||
              name_i18n[this.$i18n.locale];
      }
    }
    return name;
  }

  onChange(v: any) {
    console.info(v);
  }

  totalWidth: number = 300;

  // 暂改，解决发布闪烁问题，如有问题，可撤回代码，旧代码在下面
  // @Watch('showFieldArray' ,{ deep: true })
  @Watch('showFieldArray')
  setShowFieldArray(v: any) {
    const showFieldLength: number = v.length;
    /* 重置表格 */
    if (showFieldLength < 1) {
      this.columns = [];
      this.dataSource = [];
      return;
    }

    // 组装表头配置
    this.columns = v.map((pl: any, index: number) => {
      const obj: any = {
        code: pl.code,
        name: pl.name,
        name_i18n: pl.name_i18n,
        dataIndex: pl.code,
        slots: { title: `${pl.code}_${index}Title` },
        width: parseInt(pl.width),
      };

      // if (showFieldLength !== index + 1) {
      //   obj.width = parseInt(pl.width);
      // }
      return obj;
    });

    this.columns.unshift(
      ...[
        {
          code: 'order',
          name: this.$t('languages.Apps.SeqNumber'),
          dataIndex: 'order',
          slots: { title: 'orderTitle' },
          width: 79,
        },
        // {
        //   code: 'abstract',
        //   name: '数据标题',
        //   dataIndex: 'abstract',
        //   slots: { title: 'abstractTitle' },
        //   width: 296
        // }
      ],
    );

    v.forEach((el: any) => {
      if (el.isSystem) {
        this.setSystemDataItem(el);
        return;
      }
      const showFieldDefaultVal = showFieldDefaultValByType as any;
      if (el.type !== 3) {
        this.dataSourceEach[el.code] = showFieldDefaultVal[el.type]
          ? showFieldDefaultVal[el.type]
          : '- -';
      } else {
        const format = DateType.find((s: any) => s.type === el.displayFormat);
        this.dataSourceEach[el.code] =
          showFieldDefaultVal[el.type] && format
            ? format.format.includes('APM')
              ? DateHandle.dateFormatApm(
                  new Date(showFieldDefaultVal[el.type]),
                  format.format,
                )
              : moment(showFieldDefaultVal[el.type]).format(
                  format.format || 'YYYY-MM-DD HH:mm',
                )
            : '- -';
      }
    });

    [
      '张三的事假申请',
      '张三的事假申请',
      '张三的事假申请',
      '张三的事假申请',
      '张三的事假申请',
      '张三的事假申请',
      '张三的事假申请',
      '张三的事假申请',
    ].forEach((x: any, i: number) => {
      this.dataSourceEach.order = i + 1;
      this.dataSourceEach.abstract = x;
      this.dataSourceEach.key = i;
      this.dataSource[i] = JSON.parse(JSON.stringify(this.dataSourceEach));
    });
    let tableWidth: number = 0;
    this.columns.forEach((res: any) => {
      tableWidth += res.width;
    });
    this.totalWidth = tableWidth;
    this.computeWidth();
  }

  computeWidth() {
    //当前的totalWidth小于table的宽度时，重新给出序号以外的每一列的宽度赋值
    const el = document.querySelector('.content-box__table') as HTMLDivElement;
    /* console.log(el.clientWidth); */
    if (el.clientWidth - 2 > this.totalWidth) {
      const width: number = el.clientWidth - 2 - this.totalWidth;
      const length: number = this.columns.length;
      this.columns.forEach((c) => {
        if (c.code !== 'order') {
          c.width += width / (length - 1);
        }
      });
    }
  }

  /**
   * 表格宽度重置回调
   */
  tableResize(key: string, event: any) {
    this.showFieldArray.forEach((res: any) => {
      if (res.code === key) {
        res.width = +event.target.offsetWidth;
      }
    });
    // this.columns
    // ;
  }

  /**
   * 设置显示默认值
   */
  setSystemDataItem(el: any) {
    const showField = showFieldDefaultValByCode as any;
    this.dataSourceEach[el.code] = showField[el.code];
  }
}
</script>
<style lang="less" scoped>
.no-show-total-pagination{
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 12px;
  margin-top: 16px;
  margin-right: 24px;
  span{
    cursor: pointer;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    display: inline-block;
    min-width: 32px;
    height: 32px;
    line-height: 30px;
    text-align: center;
    padding: 0 5px;
    em{
      font-size: 12px;
    }
  }
  span:not(.disable):hover{
    color: #2970ff;
    border: 1px solid #2970ff;
  }
  .disable{
    color: rgba(0,0,0,0.45);
    cursor: not-allowed
  }
  .current-page{
    color: #2970ff;
    border: 1px solid #2970ff;
    border-radius: 2px;
    margin: 0 8px;
  }
}

.content-box {
  // display: flex;
  overflow: hidden;
  width: 100%;
  /deep/.ant-table-thead tr th:first-of-type {
    width: 80px !important;
    display: inline-block !important;
  }
  /deep/.ant-table-thead span.resize {
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    white-space: nowrap;
    overflow: hidden;
  }
  /deep/.ant-table-body {
    color: #111218;
  }
  /deep/.ant-table-thead th > span {
    color: #111218;
  }
}

.in-th-span {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/deep/ .ant-table-small {
  border-radius: 0;
  border-left: 0;
  border-right: 0;
}
</style>

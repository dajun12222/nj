<template>
  <div class="common-search">
    <template v-show="theQueryConditions.length">
      <div class="common-search-group">
        <div class="condition-type">
          <div
            class="and"
            :class="{ active: conditionType === 'AND' }"
            @click="onConditionTypeChange('AND')"
          >
            且
          </div>
          <div
            class="or"
            :class="{ active: conditionType === 'OR' }"
            @click="onConditionTypeChange('OR')"
          >
            或
          </div>
        </div>
        <div class="search-wrap">
          <query-form
            ref="list"
            :schemaCode="schemaCode"
            :fields="queryConditionsList"
            :relevanceDataList="relevanceDataList"
            :isRelevanceEntrance="isRelevanceEntrance"
            @ready="filterReady"
            @queryControlRemove="onQueryControlRemove"
            @changeEnforceQuery="onChangeEnforceQuery"
          />
          <div
            class="condition-add"
            :class="{ disabled: defaultQueryConditions.length === 0 }"
            @click="onConditionAdd"
          >
            添加筛选条件
          </div>
        </div>
      </div>
      <div class="common-search_buttom">
        <bottom-button @reset="resetFilters" @submit="query" />
      </div>
    </template>
    <query-condition-add
      :defaultQueryConditions="defaultQueryConditions"
      :isDisplay="isDisplay"
      :isRelevanceEntrance="isRelevanceEntrance"
      @cancel="onCancelAdd"
      @save="onSaveAdd"
    />
  </div>
</template>
<script lang="ts">
import { datetime, H3Button, H3Input } from 'h3-mobile-vue';
import { Component, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import common from '../../../../common/mobile';
import { renderer } from '../../../../form';
import QueryForm from './query-form/query-form.vue';
import QueryConditionAdd from './query-form/query-condition-add.vue';
import { formatVal } from '../../../../list/src/components/pc/components/queryForm/query-form-util';
import { DataItemType } from 'cloudpivot/form/schema';

Vue.use(datetime);

Vue.prototype.$datetime = datetime;

@Component({
  name: 'ListDesignSearch',
  components: {
    H3Input,
    H3Button,
    QueryForm,
    QueryConditionAdd,
    BottomButton: common.components.BottomButton,
    Empty: common.components.Empty,
  },
  directives: {
    TransferDom: common.directives.transferDom,
  },
})
export default class ListDesignSearch extends Vue {
  @Prop() schemaCode!: any;

  @Prop() queryConditions!: Array<any>;

  @Prop() relevanceDataList!: [];

  @Prop() isRelevanceEntrance!: boolean;

  conditionType: string = 'AND'; //查询条件模式

  queryConditionsList: Array<any> = [];

  theQueryConditions: Array<any> = [];

  defaultQueryConditions: Array<any> = []; //添加时可供选择的数据项

  isDisplay: boolean = false; //添加浮窗显示控制

  isEnforceQuery: boolean = true; //是否强制刷新

  @Watch('queryConditions', {
    immediate: true,
  })
  onQueryConditionsChange(fields: any[]) {
    if (Array.isArray(this.queryConditions)) {
      this.queryConditions.forEach((field: any) => {
        field.op = field.filterType;
      });

      this.queryConditionsList = this.queryConditions.slice(0);
      this.theQueryConditions = this.queryConditions.slice(0);
    } else {
      this.queryConditionsList = (this.queryConditions as any).queryList.slice(
        0,
      );
      this.conditionType = (this.queryConditions as any).queryType;
      this.theQueryConditions = (
        this.queryConditions as any
      ).queryConditions.slice(0);

      this.defaultQueryConditions = [];
      this.theQueryConditions.forEach((item) => {
        const node = this.queryConditionsList.find((ele) => {
          return ele.propertyCode === item.propertyCode;
        });
        if (!node) {
          this.defaultQueryConditions.push(item);
        }
      });
      if (!this.queryConditionsList.length) {
        this.query();
      }
    }
  }

  /**
   * 设置筛选条件某个条件赋值
   */
  setFilterValue(key: string, value: any) {
    (this.$refs.list as any).findControl(key).value = value;
  }

  /**
   * 筛选条件渲染完毕
   */
  filterReady() {
    if (this.isEnforceQuery) {
      this.query();
    }
  }

  // 重置查询条件
  resetFilters() {
    this.isEnforceQuery = true;
    const list = this.$refs.list as any;
    const data = list.resetFilters();
  }

  onChangeEnforceQuery(value) {
    this.isEnforceQuery = value;
  }

  // 查询
  query() {
    this.isEnforceQuery = true;
    const list = this.$refs.list as any;
    if (list) {
      setTimeout(() => {
        const data = list.query() || {};
        const opValue = list.getOpValue();
        const backData = this.setFilterData(data, opValue);
        this.saveQueryList(this.queryConditionsList, data);
        this.$emit('commit', backData);
      }, 300);
    }
  }

  saveQueryList(queryConditionsList: any[], data: any) {
    const queryList = queryConditionsList.map((item: any) => {
      if (
        Array.isArray(data[item.propertyCode]) &&
        [DataItemType.Number, DataItemType.Date].includes(item.propertyType)
      ) {
        item.startValue = data[item.propertyCode][0];
        item.endValue = data[item.propertyCode][1];
      } else {
        item.defaultValue = data[item.propertyCode];
      }
      return item;
    });

    const theQueryList = {
      schemaCode: this.schemaCode,
      queryList: queryList,
      queryType: this.conditionType,
      queryConditions: this.theQueryConditions,
    };

    sessionStorage.setItem('theQueryList', JSON.stringify(theQueryList));
  }

  getFormat(str: string) {
    switch (Number(str)) {
      case 2:
        return 'YYYY-MM-DD HH:mm:ss';
      case 3:
        return 'YYYY-MM-DD HH:mm';
      case 4:
        return 'YYYY-MM';
      case 5:
        return 'YYYY';
      case 6:
        return 'MM-DD';
      case 7:
        return 'HH:mm';
      case 8:
        return 'HH:mm:ss';
      default:
        return 'YYYY-MM-DD';
    }
  }

  /**
   * 格式化筛选查询参数
   */
  setFilterData(data: any, opValue: any = {}) {
    const filterArray: any = [];
    const dataArray = Object.entries(data);
    dataArray.forEach((a: any) => {
      if (!a && !a[0]) {
        return;
      }
      const [key, value] = a;
      this.queryConditionsList.forEach((query: any) => {
        const displayFormat: string = query.displayFormat || '';
        if (key === query.propertyCode) {
          let propertyValue = value;
          switch (query.filterType) {
            case 'IsNull':
              propertyValue = '';
              break;
            case 'IsNotNull':
              propertyValue = null;
              break;
            default:
              break;
          }
          if (Array.isArray(propertyValue)) {
            if (query.propertyType === renderer.DataItemType.Date) {
              propertyValue = propertyValue
                .map((x) => {
                  if (typeof x === 'string' && x) {
                    //年份格式
                    if (this.getFormat(displayFormat) === 'YYYY') {
                      return x;
                    }
                    // ios日期格式兼容
                    if (
                      common.utils.Common.isiOS &&
                      this.getFormat(displayFormat) === 'YYYY-MM'
                    ) {
                      return x;
                    }
                    x = common.utils.Common.isiOS ? x.replace(/-/g, '/') : x;
                    const date = new Date(x);
                    return common.utils.DateHandle.dateFormat(
                      date,
                      this.getFormat(displayFormat),
                    );
                  } else if (x instanceof Date) {
                    return common.utils.DateHandle.dateFormat(
                      x,
                      this.getFormat(displayFormat),
                    );
                  } else {
                  }
                  return '';
                })
                .join(';');

              propertyValue = propertyValue === ';' ? '' : propertyValue;
            } else {
              propertyValue = formatVal(
                query.propertyType,
                value,
                query.propertyCode,
                query.filterType,
                '',
              );
            }
          } else {
            if (query.propertyType === renderer.DataItemType.Date) {
              propertyValue =
                value instanceof Date
                  ? common.utils.DateHandle.dateFormat(
                      value,
                      this.getFormat(displayFormat),
                    )
                  : value;
              propertyValue = propertyValue === ';' ? '' : propertyValue;
            } else {
              propertyValue = formatVal(
                query.propertyType,
                value,
                query.propertyCode,
                query.filterType,
                '',
              );
            }
          }

          filterArray.push({
            propertyCode: query.propertyCode,
            propertyType: query.propertyType,
            propertyValue: propertyValue,
            queryFilterType: query.filterType,
          });
        }
      });
    });

    console.log('filterArray', filterArray);
    console.log('this.theQueryConditions', this.theQueryConditions);
    let queryCondition: any = [];
    if (this.conditionType === 'AND') {
      if (filterArray.length > 0) {
        queryCondition = [[filterArray]];
      }
    } else {
      if (filterArray.length > 0) {
        queryCondition = [[]];
        filterArray.forEach((ele) => {
          queryCondition[0].push([ele]);
        });
      }
    }
    return queryCondition;
  }

  /**
   * 条件表格式类型切换
   */
  onConditionTypeChange(type) {
    this.conditionType = type;
  }

  /**
   * 移除筛选条件
   */
  onQueryControlRemove(id) {
    this.isEnforceQuery = false;
    this.queryConditionsList = this.queryConditionsList.filter((item) => {
      if (item.propertyCode === id) {
        item.defaultValue = '';
      }
      return item.propertyCode !== id;
    });
    console.log('this.queryConditionsList', this.queryConditionsList);

    this.defaultQueryConditions = [];
    this.theQueryConditions.forEach((item) => {
      const node = this.queryConditionsList.find((ele) => {
        return ele.propertyCode === item.propertyCode;
      });
      if (!node) {
        this.defaultQueryConditions.push(item);
      }
    });
  }

  /**
   * 显示添加筛选条件浮窗
   */
  onConditionAdd() {
    if (this.defaultQueryConditions.length > 0) {
      this.isDisplay = true;
    }
  }

  /**
   * 隐藏添加筛选条件浮窗
   */
  onCancelAdd() {
    this.isDisplay = false;
  }

  /**
   * 添加筛选条件
   */
  onSaveAdd(data) {
    this.isDisplay = false;
    this.isEnforceQuery = false;
    this.queryConditionsList = this.queryConditionsList.concat(data);
    console.log('添加后:queryConditionsList', this.queryConditionsList);
    this.defaultQueryConditions = [];
    this.theQueryConditions.forEach((item) => {
      const node = this.queryConditionsList.find((ele) => {
        return ele.propertyCode === item.propertyCode;
      });
      if (!node) {
        this.defaultQueryConditions.push(item);
      }
    });
  }
}
</script>
<style lang="less" scoped>
@import '../../../../common/styles/mixins.less';
.common-search {
  background: #f7f8fc;
  position: fixed;
  top: 1.16rem;
  bottom: 1.5rem;
  width: 100%;
  .condition-type {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    .px2rem(padding-top, 32px);
    .px2rem(padding-bottom, 44px);
    background: #f7f8fc;
    text-align: center;
    > div {
      display: inline-block;
      .px2rem(width, 112px);
      .px2rem(height, 60px);
      .px2rem(line-height, 60px);
      .px2rem(font-size, 26px);
      text-align: center;
      color: #999999;
      border: 1px solid #d9d9d9;
    }
    .and {
      border-radius: 4px 0 0 4px;
    }
    .or {
      border-radius: 0px 4px 4px 0;
    }
    .active {
      color: #fff;
      background: #2970ff;
      border: 1px solid #2970ff;
    }
  }
  .condition-add {
    text-align: center;
    height: 44px;
    line-height: 44px;
    .px2rem(font-size, 30px);
    color: #2970ff;
    background: #fff;
    position: absolute;
    left: 0;
    width: 100%;
    margin-top: -15px;
  }
  .condition-add.disabled {
    color: #ccc;
  }
  .common-search_buttom {
    position: fixed;
    z-index: 999;
    width: 100%;
    bottom: 0;
    padding-top: 8px;
    background: #fff;
  }
  .common-search-group {
    height: 100%;
    .search-wrap {
      max-height: calc(100vh - 45px - 40px - 10px);
      height: 100%;
      overflow-y: auto;
      padding-bottom: 190px;
      position: relative;
      background: #f7f8fc;
      margin-top: 70px;
    }
  }
}
</style>

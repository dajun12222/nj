<template>
  <!-- <a-modal
    :title="$t('languages.Apps.FormDesignPage.UserSelectionMap')"
    :visible="true"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Save')"
    @cancel="closeModal"
    @ok="backData"
    width="618px"
    :maskClosable="false"
    :keyboard="false"
  > -->
  <div>
    <div class="user-selection-warp">
      <a-table
        v-if="dataSource.length"
        :columns="columns"
        :pagination="false"
        :loading="false"
        :locale="{ emptyText: '' }"
        :scroll="{ y: 585 }"
        :dataSource="dataSource"
        tableLayout="fixed"
      >
        <span slot="attributesTitle" class="fieldlab">人员属性</span>
        <span slot="dataItemTitle" class="fieldlab">当前表单数据项</span>
        <!-- <span slot="actionTitle" class="delete">{{ $t('languages.Operation') }}</span> -->
        <!-- :dataSource="filterDataItemList" -->
        <div
          slot="attributes"
          slot-scope="text, record"
          class="select-wrap attr"
        >
          <a-select
            v-model="record.attributes"
            :getPopupContainer="getPopupContainer"
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            :defaultValue="record.attributes"
            @change="attributesChange(record, arguments)"
          >
            <a-select-option
              v-for="(attributes, index) in record.userAttributes"
              :key="index"
              :value="attributes.mark"
              :title="attributes.name"
            >
              {{ attributes.name }}
            </a-select-option>
          </a-select>
          <!-- <a-select
            :getPopupContainer="getPopupContainer"
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            @change="attributesChange(record, arguments)"
            v-else
          >
            <a-select-option
              v-for="(attributes, index) in record.userAttributes"
              :key="index"
              :value="attributes.mark"
              :title="attributes.name"
            >{{ attributes.name }}</a-select-option>
          </a-select> -->
        </div>
        <div
          slot="dataItem"
          slot-scope="text, record"
          class="select-wrap dataitem"
        >
          <config-provider :locale="locale">
            <a-select
              v-model="record.dataItem"
              :getPopupContainer="getPopupContainer"
              class="select"
              :placeholder="$t('languages.PlaceHolder.Select')"
              @change="dataItemChange(record, arguments)"
            >
              <a-select-option
                v-for="(dataItem, index) in record.dataItemList"
                :key="index"
                :value="dataItem.code"
                :title="`${dataItem.name}[${dataItem.code}]`"
              >
                {{ `${dataItem.name}[${dataItem.code}]` }}
              </a-select-option>
            </a-select>
          </config-provider>
        </div>

        <div
          slot="action"
          slot-scope="text, record"
          class="delete"
          @click="deleteRow(record)"
        >
          <span>
            <a-icon type="delete" />
          </span>
        </div>
      </a-table>
      <div class="add">
        <span>
          <i class="icon aufontAll h-icon-all-plus-o"></i>
        </span>
        <span @click="addRow">{{
          $t('languages.Apps.FormDesignPage.AddDataItem')
        }}</span>
      </div>
    </div>
  </div>
  <!-- </a-modal> -->
</template>
<script lang="ts">
import { formApi } from '../../../../api';
import * as dataitemStore from '../../stores/data-items.store-helper';
import OptionsMap from '../../typings/form-modals-map';
import userSelectionOptionsMap from '../../typings/user-selection-map';
import { ConfigProvider, Table, Icon, Select } from '@h3/antd-vue';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserModule = namespace('Organization/User');

declare namespace Common {
  export interface App {
    name: string;
    code: string;
    icon: string;
  }

  export interface AppModule {
    name?: string | any;
    code: string;
    active?: boolean;
    url: string;
    count?: number;
  }

  export interface Data {
    errcode?: number;
    errmsg?: string;
    data: any;
  }
  export interface Response {
    data: Data;
  }

  export interface Res<T> {
    errcode?: number;

    errmsg?: string;

    data?: T;
  }

  // 分页数据返回
  export interface PageResponse {
    data: {
      content: any;
    };
  }

  // 数据项model
  export interface DataItems {
    data: {
      order: number;
      labelName: string;
      uiformId: any;
      uiType: number;
      required: boolean;
      maxLength: number;
      minLength: number;
      pattern: string;
      ruleMsg: string;
      placeholder: string;
      selectCollection?: any;
    };
  }
  // 表格的头
  export interface TableHead {
    title?: string;
    dataIndex: string;
    scopedSlots?: Action;
    filteredValue?: string;
    key?: string;
    onFilter?: any;
    slots?: object;
    align?: string;
    width?: any;
    fixed?: string;
    ellipsis?: boolean;
  }
  // 表格操作
  export interface Action {
    customRender: string;
    filterDropdown?: string;
    filterIcon?: string;
    scopedSlots?: any;
  }
  /* 表单配置 */
  interface FormItemLayout {
    labelCol: {
      span: number;
    };
    wrapperCol: {
      span: number;
    };
  }
}

@Component({
  name: 'UserSelectionMap',
  components: {
    ConfigProvider,
    ATable: Table,
    ASelect: Select,
    ASelectOption: Select.Option,
    AIcon: Icon,
  },
})
export default class UserSelectionMap extends Vue {
  @UserModule.Mutation('setUserExtension') setUserExtension: any;

  @UserModule.State('userExtension') userExtList;

  @Prop({
    type: String,
  })
  maping: any;

  @Prop()
  control!: any;

  @Prop()
  dataItem!: any;

  // dataSource: Array<any> = [
  //   {
  //     attributes: "",
  //     dataItem: "",
  //     key: Math.random(),
  //     userAttributes: [],
  //     dataItemList: [],
  //   },
  // ];
  dataSource: Array<any> = [];

  items: any[] = [];

  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'attributes',
      slots: { title: 'attributesTitle' },
      scopedSlots: { customRender: 'attributes' },
      key: 'attributes',
      align: 'left',
      width: 240,
    },
    {
      dataIndex: 'dataItem',
      slots: { title: 'dataItemTitle' },
      scopedSlots: { customRender: 'dataItem' },
      key: 'dataItem',
      align: 'left',
      width: 240,
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      key: 'action',
      width: 60,
      align: 'center',
    },
  ];

  userAttributes: Array<any> = [];

  orgLength: number = 0;

  dataItemListFilter: any = '';

  @Watch('maping')
  onMappingChange(v: any) {
    this.initData();
  }

  created() {
    this.getOrgMaxNum();

    const initiallyArr = dataitemStore
      .getDataItems(this)
      .filter((res: any) => res.used);
    if (Array.isArray(initiallyArr) && initiallyArr.length > 0) {
      const dataArr = JSON.parse(JSON.stringify(initiallyArr));
      const targetArr: any[] = [];
      const length: number = dataArr.length | 0;
      for (let i = 0; i < length; i += 1) {
        targetArr.push(dataArr[i]);
        if (dataArr[i].type === 8 && dataArr[i].properties) {
          const parentCode: string = dataArr[i].code;
          const subDataItem = dataArr[i].properties as any;
          const subLength: number = subDataItem.length | 0;
          for (let j = 0; j < subLength; j += 1) {
            subDataItem[j].code = `${parentCode}.${subDataItem[j].code}`;
            targetArr.push(subDataItem[j]);
          }
        }
      }
      this.items = targetArr.filter(
        (res: any) =>
          res.type !== 2 &&
          res.type !== 4 &&
          res.type !== 6 &&
          res.type !== 7 &&
          res.type !== 8 &&
          res.type !== 9 &&
          !res.isSystem,
      );
    } else {
      this.items = this.dataItem.filter(
        (res: any) =>
          res.type !== 2 &&
          res.type !== 4 &&
          res.type !== 6 &&
          res.type !== 7 &&
          res.type !== 8 &&
          res.type !== 9 &&
          !res.isSystem,
      );
    }

    this.items = this.items.map((res) => {
      //若数据项编码中含有.说明数据来源处已经做了拼接
      if (res.code.indexOf('.') === -1) {
        res.code = res.parentCode ? `${res.parentCode}.${res.code}` : res.code;
      }
      return res;
    });
  }

  get locale() {
    switch (this.$i18n.locale) {
      case 'zh':
      default:
        return zhCN;
      case 'en':
        return enUS;
    }
  }

  initData() {
    const userSelectionlist: Array<any> =
      userSelectionOptionsMap.zh_CN.orgAttributes;
    const list = OptionsMap.userAttributes.find((item) => {
      return item.mark === 'ONE_LEVEL,1'; //判断是否有组织
    });

    if (!list) {
      //根节点属于第0级，不算在组织内
      if (this.orgLength > 1) {
        OptionsMap.userAttributes = userSelectionlist
          .slice(0, this.orgLength - 1)
          .concat(OptionsMap.userAttributes);
        OptionsMap.attributesUserSelection = userSelectionlist
          .slice(0, this.orgLength - 1)
          .concat(OptionsMap.attributesUserSelection);
      }
    }

    this.userAttributes = OptionsMap.userAttributes.concat(this.userExtList);

    const exp = this.maping;
    if (exp) {
      const arr = exp.split(';');
      arr.pop();
      this.dataSource = [];
      const length: number = arr.length | 0;

      const allDataItemList = dataitemStore.getDataItems(this);
      const nullItem: string[] = [];

      for (let i = 0; i < length; i += 1) {
        const chars = arr[i].split(':');
        const code = chars[1].substr(1, chars[1].length - 2);
        let usedItem: any;
        if (code.indexOf('.') === -1) {
          usedItem = allDataItemList.filter((i) => i.code === code);
        } else {
          const [parentCode, itemCode] = code.split('.');
          const parentItem = allDataItemList.filter(
            (i) => i.code === parentCode,
          );
          if (parentItem.length && parentItem[0].properties) {
            usedItem = parentItem[0].properties.filter(
              (i) => i.code === itemCode,
            );
          } else {
            usedItem = [];
          }
        }
        if (!usedItem.length) {
          nullItem.push(code as string);
        } else if (!usedItem[0].used) {
          nullItem.push(`${usedItem[0].name}[${usedItem[0].code}]`);
        } else {
          //Else Empty block statement
        }

        const dataItemList = [...this.items];
        console.log(dataItemList, '----------------------');
        const selectDateItem = this.control.code;
        // const isSheet: any = this.control.code.indexOf(this.control.parentCode) > -1 ? this.control.parentCode : '';

        const isSheet: any = this.control.parentCode;
        OptionsMap.attributesUserSelection.forEach((x: any) => {
          if (chars[0] === x.mark) {
            if (x.mark === 'manager' || x.mark === 'secretary') {
              this.dataItemListFilter = dataItemList.filter((res: any) => {
                if (isSheet) {
                  return (
                    [5, 50].indexOf(res.type) > -1 &&
                    res.code !== isSheet + '.' + selectDateItem &&
                    res.parentCode
                  );
                } else {
                  return (
                    [5, 50].indexOf(res.type) > -1 &&
                    res.code !== selectDateItem &&
                    !res.parentCode
                  );
                }
              });
            } else {
              if (x.mark === 'partTimerDepartment') {
                this.dataItemListFilter = dataItemList.filter((res: any) => {
                  if (isSheet) {
                    return (
                      [5, 61].indexOf(res.type) > -1 &&
                      res.code !== isSheet + '.' + selectDateItem &&
                      res.parentCode
                    );
                  } else {
                    return (
                      [5, 61].indexOf(res.type) > -1 &&
                      res.code !== selectDateItem &&
                      !res.parentCode
                    );
                  }
                });
              } else {
                this.dataItemListFilter = dataItemList.filter((res: any) => {
                  if (isSheet) {
                    return (
                      [5, 60].indexOf(res.type) > -1 &&
                      res.code !== isSheet + '.' + selectDateItem &&
                      res.parentCode
                    );
                  } else {
                    return (
                      [5, 60].indexOf(res.type) > -1 &&
                      res.code !== selectDateItem &&
                      !res.parentCode
                    );
                  }
                });
              }
            }
          }
        });

        OptionsMap.attributesText.forEach((x: any) => {
          if (chars[0] === x.mark) {
            this.dataItemListFilter = dataItemList.filter((res: any) => {
              if (isSheet) {
                return (
                  (res.type === 0 || res.type === 1) &&
                  res.parentCode === isSheet
                );
              } else {
                return (res.type === 0 || res.type === 1) && !res.parentCode;
              }
            });
          }
        });

        OptionsMap.attributesDate.forEach((x: any) => {
          if (chars[0] === x.mark) {
            this.dataItemListFilter = dataItemList.filter((res: any) => {
              if (isSheet) {
                return res.type === 3 && res.parentCode === isSheet;
              } else {
                return res.type === 3 && !res.parentCode;
              }
            });
          }
        });
        this.userExtList.forEach((x: any) => {
          if (chars[0] === x.mark) {
            this.dataItemListFilter = dataItemList.filter((res: any) => {
              if (isSheet) {
                return (
                  (res.type === 0 || res.type === 1) &&
                  res.parentCode === isSheet
                );
              } else {
                return (res.type === 0 || res.type === 1) && !res.parentCode;
              }
            });
          }
        });
        const obj = {
          attributes: chars[0],
          dataItem: code,
          key: Math.random(),
          userAttributes: OptionsMap.userAttributes.concat(this.userExtList),
          //dataItemList: this.items
          dataItemList: this.dataItemListFilter,
        };
        this.dataSource.push(obj);
      }
      // 表单设计中才有sheetCode，数据模型中不存在校验
      // 历史表单中不提示
      if (
        nullItem.length &&
        this.$route.params.sheetCode &&
        !this.$route.path.includes('apps/versionDetail/')
      ) {
        this.$message.warning(
          `数据项 ${nullItem.join(
            '、',
          )} 在当前表单中不存在，请将其拖入表单或更换其他数据项`,
        );
      }
    } else {
      this.dataSource = [];
    }
  }

  async getOrgMaxNum() {
    const res = await formApi.getOrgMaxNum();
    if (res.errcode === 0) {
      this.orgLength = res.data;
    } else {
      this.$message.error(res.errmsg);
    }
    const res1 = await formApi.getUserExtForDingTalk();
    if (res1.errcode === 0) {
      const userExtList = res1.data.content.map((item) => {
        return {
          name: item.name,
          mark: item.code,
          type: 1,
        };
      });
      this.setUserExtension(userExtList);
    } else {
      this.$message.error(res1.errmsg);
    }
    this.initData();
    console.log('this.dataSource', this.dataSource);
  }

  attributesChange(item: any, arg: any) {
    const selectOption: string = arg[0];
    const itemIndex: number = this.dataSource.indexOf(item);
    this.dataSource[itemIndex].attributes = selectOption;
    const selectAttri: any = OptionsMap.userAttributes
      .concat(this.userExtList)
      .filter((res: any) => res.mark === selectOption);

    /* 获取当前选中控件的数据项名称编码 */
    const selectDateItem: string = this.control.code;

    // 当前选中控件是主表还是子表
    // const isSheet: any = this.control.code.indexOf(this.control.parentCode) > -1 ? this.control.parentCode : '';
    const isSheet: any = this.control.parentCode;

    const dataItemList = [...this.items];
    if (selectAttri[0].type === 0) {
      if (
        selectAttri[0].mark === 'manager' ||
        selectAttri[0].mark === 'secretary'
      ) {
        this.dataSource[itemIndex].dataItemList = dataItemList.filter(
          (res: any) => {
            if (isSheet) {
              return (
                [5, 50].indexOf(res.type) > -1 &&
                res.code !== isSheet + '.' + selectDateItem &&
                res.parentCode === isSheet
              ); // 过滤不是自己的数据项
            } else {
              return (
                [5, 50].indexOf(res.type) > -1 &&
                res.code !== selectDateItem &&
                !res.parentCode
              ); // 过滤不是自己的数据项
            }
          },
        );
      } else {
        if (selectAttri[0].mark === 'partTimerDepartment') {
          this.dataSource[itemIndex].dataItemList = dataItemList.filter(
            (res: any) => {
              if (isSheet) {
                return (
                  [5, 61].indexOf(res.type) > -1 &&
                  res.code !== isSheet + '.' + selectDateItem &&
                  res.parentCode === isSheet
                ); // 过滤不是自己的数据项
              } else {
                return (
                  [5, 61].indexOf(res.type) > -1 &&
                  res.code !== selectDateItem &&
                  !res.parentCode
                );
              }
            },
          );
        } else {
          this.dataSource[itemIndex].dataItemList = dataItemList.filter(
            (res: any) => {
              if (isSheet) {
                return (
                  [5, 60].indexOf(res.type) > -1 &&
                  res.code !== isSheet + '.' + selectDateItem &&
                  res.parentCode === isSheet
                ); // 过滤不是自己的数据项
              } else {
                return (
                  [5, 60].indexOf(res.type) > -1 &&
                  res.code !== selectDateItem &&
                  !res.parentCode
                );
              }
            },
          );
        }
      }
    } else if (selectAttri[0].type === 1) {
      this.dataSource[itemIndex].dataItemList = dataItemList.filter(
        (res: any) => {
          if (isSheet) {
            return (
              (res.type === 0 || res.type === 1) && res.parentCode === isSheet
            );
          } else {
            return (res.type === 0 || res.type === 1) && !res.parentCode;
          }
        },
      );
    } else if (selectAttri[0].type === 2) {
      this.dataSource[itemIndex].dataItemList = dataItemList.filter(
        (res: any) => {
          if (isSheet) {
            return res.type === 3 && res.parentCode === isSheet;
          } else {
            return res.type === 3 && !res.parentCode;
          }
        },
      );
    } else {
      //Else Empty block statement
    }
    this.dataSource[itemIndex].dataItem = ''; //清空已选的数据项
  }

  dataItemChange(item: any, arg: any) {
    const selectOption: string = arg[0];
    const itemIndex: number = this.dataSource.indexOf(item);
    this.dataSource[itemIndex].dataItem = selectOption;
    // 数据项控制属性
    /* console.log(this.dataSource[itemIndex], arg);
    const selectDataItem: any[] = this.items.filter(
      (res: any) => res.code === item.dataItem
    );
     const type = selectDataItem[0].type;
    if (type === 5) {
      this.dataSource[itemIndex].userAttributes =
        OptionsMap.attributesUserSelection;
    } else if (type === 0 || type === 1) {
      this.dataSource[itemIndex].userAttributes = OptionsMap.attributesText;
    } else if (type === 3) {
      this.dataSource[itemIndex].userAttributes = OptionsMap.attributesDate;
    } */
  }

  addRow() {
    const item = {
      attributes: undefined,
      dataItem: undefined,
      key: Math.random(),
      userAttributes: OptionsMap.userAttributes.concat(this.userExtList),
      dataItemList: this.items,
    };
    this.dataSource.push(item);
  }

  deleteRow(item: any) {
    const itemIndex: number = this.dataSource.indexOf(item);
    const newData = [...this.dataSource];
    console.log(newData.filter((el: any) => el !== item));
    this.dataSource = newData.filter((el: any) => el !== item);
  }

  getMaping() {
    let propertyBarText = '';
    const length = this.dataSource.length | 0;
    for (let i = 0; i < length; i += 1) {
      propertyBarText = `${propertyBarText}${this.dataSource[i].attributes}:{${this.dataSource[i].dataItem}};`;
    }
    return propertyBarText;
  }

  closeModal() {
    this.$emit('closeModal');
  }

  clearMapping() {
    this.dataSource.length = 0;
  }

  getPopupContainer(triggerNode: any) {
    return document.getElementsByClassName('user-selection-warp')[0];
  }
}
</script>
<style lang="less" scoped>
@background: #f4f5f8;
.user-selection-warp {
  background: @background;
  padding: 16px;
  /deep/ .ant-table-thead > tr > th {
    padding: 0;
    color: #88888b;
    line-height: 22px;
    font-size: 14px;
    &:nth-last-child(2) {
      padding-left: 53px;
    }
  }
  /deep/ tr {
    border: none !important;
    &:hover {
      td {
        background: #f4f5f8 !important;
      }
    }
  }
  /deep/ .ant-select-selection {
    width: 240px;
  }
  /deep/ .ant-table-header {
    th {
      background: @background;
    }

    &::-webkit-scrollbar {
      width: 0;
    }
    .delete {
      cursor: pointer;
      padding-left: 8px;
    }
    th {
      border: none;
    }
  }
  /deep/ .ant-table-body {
    max-height: 299px !important;
    overflow-y: auto !important;
    // &::-webkit-scrollbar{
    //   width: 0;
    // }
    td {
      padding: 0;
      padding-top: 10px;
      &:nth-last-child(2) {
        padding-left: 53px;
      }
      .delete {
        cursor: pointer;
        padding-left: 21px;
        span {
          color: rgba(0, 0, 0, 0.65);
        }
      }
      border: none;
      background: @background;
    }
    th {
      border: none;
    }
    .select-wrap {
      &.attr:after {
        content: '\8d4b\503c\7ed9';
        position: absolute;
        left: 265px;
        margin-top: 6px;
        color: #111218;
      }
      .select {
        width: 100%;
      }
    }
    .ant-table-tbody {
      .ant-table-row:last-child {
        td {
          border-bottom: 0 !important;
        }
      }
    }
  }
  .add {
    color: #2970ff;
    font-weight: 400;
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    line-height: 48px;
    span {
      margin-top: 16px;
      margin-right: 8px;
    }
  }
  .fieldlab {
    color: #88888b;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
  }
}
</style>

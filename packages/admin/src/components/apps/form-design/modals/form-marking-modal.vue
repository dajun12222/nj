<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <a-modal
      :visible="true"
      :cancelText="$t('cloudpivot.list.pc.Cancel')"
      :maskClosable="false"
      :keyboard="false"
      :okText="$t('cloudpivot.list.pc.startExport')"
      :width="866"
      centered
      wrapClassName="aside-dialog"
      @cancel="closeLevel1Popover"
    >
      <template slot="title">
        <span>{{ title }}</span>
      </template>
      <div class="data-box">
        <div class="data-left">
          <div class="data-left-top">
            <div class="check-all">
              <a-checkbox
                :checked="isAllChecked"
                class="checkbox"
                @click="handleAllCheck"
              />
              <span class="left">选择全部数据项</span>
            </div>
            <div class="data-left-search" style="">
              <InputSearch
                v-model="field"
                :placeholder="$t('cloudpivot.list.pc.placeInputSearch')"
                :isAsync="true"
                :allowClear="true"
              />
            </div>
          </div>

          <div class="data-left-list">
            <div class="data-list">
              <div class="data-list-sub-title">
                {{ $t('cloudpivot.list.pc.sysDataItem') }}
              </div>
              <div class="check-item" style="float: none">
                <a-checkbox
                  :checked="systemAll"
                  :indeterminate="indeterminateSystem"
                  class="checkbox"
                  @click="systemAllCheck"
                />
                <span class="left" title="全选"> 全选 </span>
              </div>
              <div
                v-for="(i, index) in filterSystemData"
                :key="index"
                class="check-item"
                :class="{ displayRow: i.disabled }"
              >
                <template v-if="!i.disabled">
                  <a-checkbox
                    v-model="i.checked"
                    class="checkbox"
                    @change="changeItem"
                  />
                  <span class="left" :title="titleStr(i)">
                    {{ nameStr(i) }}
                  </span>
                </template>
              </div>
            </div>
            <div class="data-list">
              <div class="data-list-sub-title">
                {{ $t('cloudpivot.list.pc.bizDataItem') }}
              </div>
              <div class="check-item" style="float: none">
                <a-checkbox
                  :checked="businessAll"
                  :indeterminate="indeterminateBusiness"
                  class="checkbox"
                  @click="businessAllCheck"
                />
                <span class="left" title="全选"> 全选 </span>
              </div>
              <div
                v-for="(i, index) in filterBusinessData"
                :key="index"
                class="check-item"
              >
                <a-checkbox
                  v-model="i.checked"
                  class="checkbox"
                  @change="changeItem"
                />
                <span class="left" :title="titleStr(i)">
                  {{ nameStr(i) }}
                </span>
              </div>
            </div>
            <!-- 子表 -->
            <div v-for="(con, ind) in sheetList" :key="ind" class="data-list">
              <div class="data-list-sub-title">
                {{ con.name }}
              </div>
              <div class="check-item" style="float: none">
                <a-checkbox
                  :checked="con.sheetAllChecks"
                  :indeterminate="con.indeterminate"
                  class="checkbox"
                  @click="sheetAllCheck(ind)"
                />
                <span class="left" title="全选"> 全选 </span>
              </div>
              <div
                v-for="(i, index) in con.subSchema.properties"
                :key="index"
                class="check-item"
                :class="{ displayRow: !i.filterShow }"
              >
                <a-checkbox
                  v-model="i.checked"
                  class="checkbox"
                  @change="sheetChangeItem(ind)"
                />
                <span class="left" :title="titleStr(i)">
                  {{ nameStr(i) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="data-right">
          <div class="data-right-title">
            已选数据项：
            <span style="color: #2970ff">{{ totleSelected }}</span>
            <span>个</span>
            <span class="clear-all" @click="clearAll">清空</span>
          </div>

          <div class="data-left-search" style="width: 212px; margin: 0 auto">
            <InputSearch
              v-model="fieldR"
              :placeholder="$t('cloudpivot.list.pc.placeInputSearch')"
              :isAsync="true"
              :allowClear="true"
            />
          </div>

          <div class="data-right-items" style="height: calc(100% - 58px)">
            <template v-if="filterCheckedSystemData.length">
              <h4 class="system">{{ $t('cloudpivot.list.pc.sysDataItem') }}</h4>
              <div
                v-for="(item, index) in filterCheckedSystemData"
                :key="item.code + index"
                class="data-right-li"
              >
                <div class="name-wrap" :title="titleStr(item)">
                  <span>{{ titleStr(item) }}</span>
                </div>
                <span
                  class="icon aufontAll h-icon-all-close del"
                  @click="unChecked(item)"
                ></span>
              </div>
            </template>
            <template v-if="filterCheckedBusinessData.length">
              <h4 class="system">{{ $t('cloudpivot.list.pc.bizDataItem') }}</h4>
              <div
                v-for="(item, index) in filterCheckedBusinessData"
                :key="item.code + index"
                class="data-right-li"
              >
                <div class="name-wrap" :title="titleStr(item)">
                  <span>{{ titleStr(item) }}</span>
                </div>
                <span
                  class="icon aufontAll h-icon-all-close del"
                  @click="unChecked(item)"
                ></span>
              </div>
            </template>
            <div v-for="(con, ind) in filterCheckedSheetData" :key="ind">
              <template v-if="con.properties.length > 0">
                <h4 class="system">{{ con.name }}</h4>
                <div
                  v-for="(item, index) in con.properties"
                  :key="item.code + index"
                  class="data-right-li"
                >
                  <div class="name-wrap" :title="titleStr(item)">
                    <span>{{ titleStr(item) }}</span>
                  </div>
                  <span
                    class="icon aufontAll h-icon-all-close del"
                    @click="unChecked(item)"
                  ></span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="h3-organization-footer">
        <div>
          <a-button type="default" @click="closeLevel1Popover">
            {{ $t('cloudpivot.list.pc.Cancel') }}
          </a-button>
          <a-button
            type="primary"
            :disabled="$route.path.includes('apps/versionDetail/')"
            @click="comfirmLevel1Popover"
          >
            {{ $t('cloudpivot.list.pc.OK') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Icon, Popover, Checkbox, Button, Modal, Input } from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import { Component, Prop, Vue, Watch, Inject } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { listApi } from 'cloudpivot/api';
import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

const ListdesignModule = namespace('Apps/Listdesign');
const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'FormMarkingModals',
  components: {
    AIcon: Icon,
    APopover: Popover,
    ACheckbox: Checkbox,
    AButton: Button,
    AModal: Modal,
    InputSearch,
  },
})
export default class FormMarkingModals extends Vue {
  @DataModelModule.State('controlsMarking') controlsMarking: any;

  @ListdesignModule.State('showFieldArray') showFieldArray: any;

  @ListdesignModule.Mutation('onEdit') onEdit: any;

  @Prop() modalData!: any;

  @Prop({ default: 0 }) fieldBlock!: number;

  field: string = ''; //左侧搜索框内容

  fieldR: string = ''; //右侧搜索框内容

  wrapStyle = { left: '624px' };

  // /* 服务器获取的原始数据 */
  // originDatas:any[] = [];

  dialogList: any[] = [];

  fblock: number = -1;

  modalVisible: boolean = false;

  dialogListDefault: any[] = [];

  isAllChecked: boolean = false;

  zhToEn: any = zhToEn;

  treeData: Array<any> = [];

  businessAll: boolean = false; //业务数据项全选状态

  indeterminateBusiness: boolean = false;

  systemAll: boolean = false; //系统数据项全选状态

  indeterminateSystem: boolean = false;

  sheetList: any[] = []; //子表列表

  get formCode() {
    return this.modalData.data.value.code;
  }

  get schemaCode() {
    return this.modalData.data.value.schemaCode;
  }

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  @Inject({
    default: () => () => {},
  })
  getControls!: Function;

  // 获取非系统数据key
  getKey(cur: any) {
    let name: any = cur.name;
    if (cur.name_i18n) {
      let name_i18n: any;
      if (typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n);
      } else {
        name_i18n = cur.name_i18n;
      }
      if (name_i18n[this.$i18n.locale]) {
        name = name_i18n[this.$i18n.locale];
      }
    }
    return name;
  }

  created() {
    this.loadAllDataItem();
    // this.dialogList;
  }

  toggleChecked(item) {
    item.checked = !item.checked;
    if (!item.isSystem) {
      //非系统数据项添加时默认为同步默认格式，且直接发布时保存默认同步格式
      item.data.syncDefaultFormat = item.checked;
      item.syncDefaultFormat = item.checked;
    }
    /* console.log('===============>asideDialog'); */
    if (
      item.propertyType === 9 &&
      item.data &&
      JSON.parse(item.data.options).showStyle === 'tree'
    ) {
      item.choiceType = 2;
      item.data.choiceType = 2;
    }
    this.isAllChecked = this.dialogList.every((res: any) => res.checked);
  }

  toggleCheckedSheet(e, v, o) {
    const item = this.dialogList[v];
    item.subSchema.properties[o].checked = !e.checked;

    this.$set(this.dialogList, v, item);
  }

  /* icon点击 */
  handleIcon(e, i: number) {
    const item = this.dialogList[i];
    item.checked = e.target.checked;
    this.$set(this.dialogList, i, item);
    this.isAllChecked = this.dialogList.every((res: any) => res.checked);
  }

  changeDialogListChecked(ck: boolean, i: number) {
    // this.dialogList[i].checked = !ck;
    const item = this.dialogList[i];
    item.checked = !ck;
    // 手动触发刷新
    // this.$set(this.dialogList, i, item);
    // this.dialogList.splice(i,1,item);
  }

  handleAllCheck() {
    this.isAllChecked = !this.isAllChecked;
    this.dialogList.forEach((item) => {
      if (item.isSystem || item.defaultProperty) {
        if (['owner', 'ownerDeptId'].includes(`${item.code}`)) {
          item.checked = this.isAllChecked;
        }
      } else {
        if (item.propertyType !== 8) {
          item.checked = this.isAllChecked;
        }
      }
    });
    for (const con of this.sheetList) {
      con.subSchema.properties.forEach((item) => {
        item.checked = this.isAllChecked;
        con.sheetAllChecks = this.isAllChecked;
      });
    }
    this.sheetList = JSON.parse(JSON.stringify(this.sheetList));
    this.dialogList = JSON.parse(JSON.stringify(this.dialogList));
  }

  // 业务数据项全选
  businessAllCheck() {
    this.businessAll = !this.businessAll;
    this.filterBusinessData.forEach((item) => {
      item.checked = this.businessAll;
    });
    this.dialogList = JSON.parse(JSON.stringify(this.dialogList));
  }

  //系统数据项全选
  systemAllCheck() {
    this.systemAll = !this.systemAll;
    this.filterSystemData.forEach((item) => {
      if (['owner', 'ownerDeptId'].includes(`${item.code}`)) {
        item.checked = this.systemAll;
      }
    });
    this.dialogList = JSON.parse(JSON.stringify(this.dialogList));
  }

  //子表数据项全选
  sheetAllCheck(index: number) {
    const con = this.sheetList[index];
    con.sheetAllChecks = !con.sheetAllChecks;
    con.indeterminate = false;
    con.subSchema.properties.forEach((item) => {
      if (item.filterShow) {
        item.checked = con.sheetAllChecks;
      }
    });
    this.sheetList = JSON.parse(JSON.stringify(this.sheetList));
  }

  clearAll() {
    this.isAllChecked = false;
    this.dialogList.forEach((item) => {
      item.checked = this.isAllChecked;
    });

    if (this.sheetList.length > 0) {
      for (const con of this.sheetList) {
        con.sheetAllChecks = false;
        con.subSchema.properties.forEach((item) => {
          item.checked = false;
        });
      }
      this.sheetList = JSON.parse(JSON.stringify(this.sheetList));
    }

    this.changeItem();
  }

  /* add弹窗-确定 */
  comfirmLevel1Popover() {
    const filterArry = this.dialogList.filter((x) => {
      return x.checked;
    });
    let sheetArr = [];
    for (const con of this.sheetList) {
      const sheetArrData = con.subSchema.properties.filter((item) => {
        return item.checked;
      });
      sheetArr = [...sheetArr, ...sheetArrData];
    }
    const codeList: string[] = [];
    for (const con of filterArry) {
      codeList.push(con.code);
    }
    for (const s of sheetArr) {
      codeList.push(`${s.schemaCode}.${s.code}`);
    }
    const result = {
      trackDataCodes: codeList.join(';'),
    };
    // 更新弹出框的数据
    this.updateDialogListDefault();
    this.onEdit(true);
    this.$emit('backData', result.trackDataCodes);
    this.field = '';
    this.fieldR = '';
  }

  // /* add弹窗-取消 */`
  closeLevel1Popover() {
    const arr = JSON.parse(JSON.stringify(this.dialogListDefault));
    this.dialogList = arr;
    this.field = '';
    this.fieldR = '';
    this.$emit('closeModal');
  }

  // 更新默认数据
  updateDialogListDefault() {
    this.dialogListDefault = this.dialogList;
  }

  /**
   * 下拉选择值赋值
   */

  loadAllDataItem() {
    const params = {
      schemaCode: this.schemaCode,
      formCode: this.formCode,
    };
    listApi.getDataItemList(params).then((res: any) => {
      let data: any[] = [];
      if (res.status || res.data.errcode === 0) {
        data = res.data.data;
      }
      if (res.errcode === 0) {
        data = res.data;
      }

      this.dialogList = data;

      if (data) {
        //获取回显的数据
        const values = this.modalData.data.value.trackDataCodes;
        let codeList: string[] = [];
        if (values) {
          codeList = values.split(';');
        }
        if (codeList.length > 0) {
          for (const x of data) {
            for (const con of codeList) {
              if (con.indexOf('.') < 0) {
                if (con === x.code) {
                  x.checked = true;
                }
              } else {
                if (x.propertyType === 8) {
                  const codes = con.split('.')[1];
                  for (const y of x.subSchema.properties) {
                    if (codes === y.code) {
                      y.checked = true;
                    }
                  }
                }
              }
            }
          }
        }

        const arr = data.filter(
          (res: any) =>
            !res.checked &&
            res.propertyType !== 8 &&
            ['owner', 'ownerDeptId'].includes(`${res.code}`),
        );
        if (arr.length === 0) {
          this.isAllChecked = true;
        } else {
          this.isAllChecked = false;
        }
      }

      // 不显示除拥有者 拥有者部门的系统数据项
      // const filter = data.filter(
      //   (item: any) =>
      //     (item.defaultProperty &&
      //       (item.code === 'owner' || item.code === 'ownerDeptId')) ||
      //     !item.defaultProperty,
      // );

      const classifyed = data.reduce(
        (stat, item) => {
          item.value = item.code;
          item.key = item.code;
          item.title = item.name;
          item.children = null;

          // 处理系统数据项
          if (item.defaultProperty) {
            // 系统数据项只允许拥有者及拥有者部门设置
            item.disabled = ['owner', 'ownerDeptId'].includes(`${item.code}`)
              ? false
              : true;
          } else {
            // 单行文本0 长文本1 数值2 日期3 单选12 复选13 附件6 逻辑4 下拉多选15 下拉单选14 地址10 手写签名6 图片6 部门多选61 部门大选60 人员多选51 人员单选50
            item.disabled = [
              '0',
              '1',
              '2',
              '3',
              '4',
              '6',
              '8',
              '9',
              '10',
              '11',
              '12',
              '13',
              '14',
              '15',
              '50',
              '51',
              '60',
              '61',
            ].includes(`${item.propertyType}`)
              ? false
              : true;
          }

          item.defaultProperty
            ? stat.system.push(item)
            : stat.custom.push(item);
          return stat;
        },
        {
          system: [],
          custom: [],
        },
      );

      this.sheetList = data.filter((x) => {
        return x.propertyType === 8;
      });

      //子表留痕初始化
      if (this.sheetList.length > 0) {
        for (const con of this.sheetList) {
          con.indeterminate = false;
          con.sheetAllChecks = false;

          con.subSchema.properties = this.analysisJsonOrder(
            con.code,
            con.subSchema.properties,
          );

          const arr = con.subSchema.properties.filter((y) => {
            return !y.defaultProperty;
          });
          con.subSchema.properties = arr;
          if (con.subSchema.properties.length > 0) {
            for (const s of con.subSchema.properties) {
              s.filterShow = true;
            }
            const arrs = con.subSchema.properties.filter((x) => {
              return !x.checked;
            });
            if (arrs.length === 0) {
              con.indeterminate = false;
              con.sheetAllChecks = true;
            } else if (
              arrs.length > 0 &&
              arrs.length < con.subSchema.properties.length
            ) {
              con.indeterminate = true;
              con.sheetAllChecks = false;
            } else {
              con.indeterminate = false;
              con.sheetAllChecks = false;
            }
          }
        }
        const filterCon = this.sheetList.filter((x) => {
          return !x.sheetAllChecks;
        });
        if (filterCon.length !== 0) {
          this.isAllChecked = false;
        }
      }

      this.treeData = [
        {
          title: '系统数据项',
          value: 'system',
          key: 'system',
          children: classifyed.system,
        },
        {
          title: '业务数据项',
          value: 'custom',
          key: 'custom',
          children: classifyed.custom,
        },
      ];

      // this.targetDataItems = data.filter((item) => {
      //   return !this.filtersType.includes(item.propertyType)
      // });
      // this.conditionList = []
      //   resolve()
      this.dialogListDefault = JSON.parse(JSON.stringify(data));
    });
  }

  analysisJsonOrder(code: string, ColumnsNames: any) {
    const josnObj = this.controlsMarking;
    const arr = [];
    if (josnObj) {
      for (const con in josnObj) {
        if (josnObj[con].key === code) {
          for (const x of josnObj[con].columns) {
            for (const y of ColumnsNames) {
              if (x.key === y.code) {
                arr.push(Object.assign({}, y));
              }
            }
          }
        }
        //tab页下的子表单独处理
        if (josnObj[con].type === 500) {
          for (const x of josnObj[con].panels) {
            if (x.controls[code]) {
              for (const y of x.controls[code].columns) {
                const con = ColumnsNames.filter((c) => {
                  return y.key === c.code;
                });
                if (con.length > 0) {
                  arr.push(Object.assign({}, con[0]));
                }
              }
            }
          }
        }
      }
    }
    return arr;
  }

  beforeDestroy() {
    this.$off('addcomfirm');
  }

  get filterSystemData() {
    const filterSystemDatas = this.dialogList.filter((item) => {
      return (
        (item.isSystem || item.defaultProperty) &&
        item.name.includes(this.field)
      );
    });

    const num: any[] = filterSystemDatas.filter((x) => {
      return x.checked;
    });

    if (num.length > 0 && num.length >= 2) {
      this.systemAll = true;
      this.indeterminateSystem = false;
    } else if (num.length > 0 && num.length < 2) {
      this.systemAll = false;
      this.indeterminateSystem = true;
    } else {
      this.systemAll = false;
      this.indeterminateSystem = false;
    }

    return filterSystemDatas;
  }

  get filterCheckedSystemData() {
    return this.dialogList.filter((item) => {
      return (
        (item.isSystem || item.defaultProperty) &&
        item.checked &&
        item.name.includes(this.fieldR)
      );
    });
  }

  get filterBusinessData() {
    const filterBusinessDatas = this.dialogList.filter((item) => {
      return (
        !(item.isSystem || item.defaultProperty) &&
        item.name.includes(this.field) &&
        !['8'].includes(`${item.propertyType}`)
      );
    });

    const num: any[] = filterBusinessDatas.filter((x) => {
      return x.checked;
    });

    if (num.length > 0 && num.length === filterBusinessDatas.length) {
      this.businessAll = true;
      this.indeterminateBusiness = false;
    } else if (num.length > 0 && num.length < filterBusinessDatas.length) {
      this.businessAll = false;
      this.indeterminateBusiness = true;
    } else {
      this.businessAll = false;
      this.indeterminateBusiness = false;
    }

    return filterBusinessDatas;
  }

  get filterCheckedBusinessData() {
    return this.dialogList.filter((item) => {
      return (
        !(item.isSystem || item.defaultProperty) &&
        item.checked &&
        item.name.includes(this.fieldR) &&
        item.propertyType !== 8
      );
    });
  }

  get totleSelected() {
    let sheetNum: number = 0;
    if (this.filterCheckedSheetData.length > 0) {
      for (const con of this.filterCheckedSheetData) {
        sheetNum += con.properties.length;
      }
    }
    return this.dialogList.filter((item) => item.checked).length + sheetNum;
  }

  get title() {
    switch (this.fieldBlock) {
      case 0:
        return '留痕数据项';
      case 1:
        return '设置展示字段';
      case 2:
        return '设置排序字段';
      default:
        break;
    }
  }

  get filterCheckedSheetData() {
    const arr: any[] = [];
    for (const con of this.sheetList) {
      const arrData: any = {};
      arrData.name = con.name;
      arrData.properties = con.subSchema.properties.filter((x) => {
        return x.checked && x.name.includes(this.fieldR);
      });
      arr.push(arrData);
    }
    return arr;
  }

  changeItem() {
    this.dialogList = JSON.parse(JSON.stringify(this.dialogList));
  }

  //更新子表全选状态
  sheetQX() {
    for (const con of this.sheetList) {
      const num: any[] = con.subSchema.properties.filter((x) => {
        return x.checked && x.filterShow;
      });
      const numx: any[] = con.subSchema.properties.filter((x) => {
        return x.filterShow;
      });
      if (num.length > 0 && num.length === numx.length) {
        con.sheetAllChecks = true;
        con.indeterminate = false;
      } else if (num.length > 0 && num.length < numx.length) {
        con.sheetAllChecks = false;
        con.indeterminate = true;
      } else {
        con.sheetAllChecks = false;
        con.indeterminate = false;
      }
    }
    this.sheetList = JSON.parse(JSON.stringify(this.sheetList));
  }

  // 子表数据项选择
  sheetChangeItem(index: number) {
    const con = this.sheetList[index];
    const num: any[] = con.subSchema.properties.filter((x) => {
      return x.checked;
    });
    if (num.length > 0 && num.length === con.subSchema.properties.length) {
      con.sheetAllChecks = true;
      con.indeterminate = false;
    } else if (num.length > 0 && num.length < con.subSchema.properties.length) {
      con.sheetAllChecks = false;
      con.indeterminate = true;
    } else {
      con.sheetAllChecks = false;
      con.indeterminate = false;
    }
    this.sheetList = JSON.parse(JSON.stringify(this.sheetList));
  }

  unChecked(item) {
    item.checked = false;
    this.sheetQX();
    this.changeItem();
  }

  titleStr(item) {
    return this.isChinese
      ? (typeof item.name_i18n === 'string' && item.name_i18n
          ? JSON.parse(item.name_i18n).zh || item.name
          : (item.name_i18n && item.name_i18n.zh) || item.name) +
          '[' +
          item.code +
          ']'
      : (typeof item.name_i18n === 'string' && item.name_i18n
          ? JSON.parse(item.name_i18n).en || item.name
          : (item.name_i18n && item.name_i18n.en) || item.name) +
          '[' +
          item.code +
          ']';
  }

  @Watch('field')
  fieldChange() {
    if (this.sheetList.length > 0) {
      for (const con of this.sheetList) {
        con.subSchema.properties.forEach((item) => {
          if (this.field) {
            if (!item.name.includes(this.field)) {
              item.filterShow = false;
            } else {
              item.filterShow = true;
            }
          } else {
            item.filterShow = true;
          }
        });
      }
      this.sheetQX();
    }
  }

  nameStr(item) {
    return this.isChinese
      ? typeof item.name_i18n === 'string' && item.name_i18n
        ? JSON.parse(item.name_i18n).zh || item.name
        : (item.name_i18n && item.name_i18n.zh) || item.name
      : typeof item.name_i18n === 'string' && item.name_i18n
      ? zhToEn[JSON.parse(item.name_i18n).en] ||
        JSON.parse(item.name_i18n).en ||
        item.name
      : (item.name_i18n && (zhToEn[item.name_i18n.en] || item.name_i18n.en)) ||
        item.name;
  }
}
</script>

<style lang="less">
.aside-dialog {
  .h-icon-all-plus-o {
    &:hover {
      color: #2970ff;
    }
  }

  .left {
    color: #111218;
    font-size: 14px;
    margin-left: 8px;
    line-height: 22px;
  }

  .data-list {
    overflow: hidden;

    .span {
      color: #111218;
    }

    .check-item {
      float: left;
      width: calc(25% - 4px);
      min-width: 127px;
      margin-right: 4px;
      margin-top: 14px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .displayRow {
      display: none;
    }
  }

  .data-right {
    width: 244px;
    height: 100%;
  }
  .data-box {
    width: 100%;
    border-radius: 2px;
    border: 1px solid #dddddd;
    display: flex;
    max-height: 548px;
    height: calc(100vh - 248px);
    overflow-x: auto;
    > .data-left {
      flex: 1;
      height: 100%;
      min-width: 400px;
      padding: 16px 0px 32px;
      .data-left-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px dashed #eeeeee;
        margin: 0 16px;
        padding-bottom: 16px;
        .choose-wrap {
          font-size: 14px;
          font-weight: 600;
          line-height: 22px;
          color: #111218;
          &:hover {
            color: #2970ff;
          }
          .choose-type {
            padding-right: 4px;
          }
          i {
            padding-top: 5px;
            font-weight: normal;
          }
        }
        .check-all {
          .left {
            margin-left: 8px;
            font-size: 14px;
            font-weight: 700;
            color: #111218;
          }
        }
        .data-left-search {
          width: 240px;
          height: 32px;
        }
      }

      .data-left-list {
        padding: 0 10px 0 16px;
        overflow-y: scroll;
        height: calc(100% - 49px);
      }

      .data-list {
        padding-left: 13px;
        .data-list-sub-title {
          font-size: 14px;
          font-weight: 700;
          color: #111218;
          position: relative;
          margin-top: 23px;
          &::before {
            content: '';
            left: -13px;
            top: 6px;
            width: 3px;
            height: 10px;
            background-color: #2970ff;
            position: absolute;
          }
        }
      }
    }
    > .data-right {
      width: 244px;
      height: 100%;
      // min-height: 378px;
      // max-height: calc(100vh - 300px);
      // overflow-y: scroll;
      min-width: 140px;
      padding: 21px 0px 16px 0px;
      border-left: 1px solid #dddddd;
      .data-right-title {
        color: #111218;
        font-size: 14px;
        font-weight: 700;
        padding-bottom: 8px;
        padding: 0 16px;
        margin-bottom: 21px;
        position: relative;
        > span {
          font-weight: 400;
        }
        .clear-all {
          color: #2970ff;
          position: absolute;
          right: 16px;
          cursor: pointer;
        }
      }
      .data-right-items {
        height: calc(100% - 26px);
        padding: 0 0 0 6px;
        overflow-y: scroll;
        h4 {
          font-size: 14px;
          line-height: 20px;
          color: rgba(17, 18, 24, 0.5);
          margin-bottom: 8px;
          margin-left: 10px;
          &.system {
            margin-top: 15px;
          }
        }
      }
      .data-right-li {
        font-size: 14px;
        color: #111218;
        display: flex;
        justify-content: space-between;
        height: 36px;
        align-items: center;
        padding: 0 35px 0 10px;
        position: relative;
        .name-wrap {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        &:hover {
          background: #eef4fd;
          i {
            color: #2970ff;
          }
        }
        .del {
          position: absolute;
          right: 18px;
          top: 5px;
          cursor: pointer;
        }
        &.chosen {
          background: #ffffff;
          box-shadow: 0px 2px 8px 0px rgba(168, 175, 186, 0.5);
          border-radius: 4px;
        }
        i {
          color: rgba(17, 18, 24, 0.5);
          font-size: 16px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>

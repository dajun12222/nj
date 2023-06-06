<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="app-package">
    <a-table
      class="app-table"
      :columns="dataColumns"
      :pagination="false"
      :dataSource="frontPerMapList"
      :locale="{ emptyText: ' ' }"
    >
      <span slot="dataItemTitle" class="td-title label-required">应用管辖范围</span>
      <span slot="dataManageTitle" class="td-title">组织管辖范围</span>
      <span slot="outDataTitle" class="td-title">外链数据</span>
      <span slot="actionTitle" class="td-title">操作</span>

      <span slot="dataItem" slot-scope="text, record">
        <a-input
          v-if="!record.operatable"
          v-model="record.name"
          :disabled="!record.operatable"
          placeholder="请选择"
        >
          <a-icon slot="suffix" class="disabled-down-icon" type="down" />
        </a-input>
        <a-select
          v-else
          v-model="record.appPackages"
          :showSearch="true"
          class="app-select"
          optionFilterProp="children"
          :filterOption="filterOption"
          @change="onChangeApp"
          @focus="selectItem(record.index, record.appPackages)"
        >
          <span slot="placeholder">请选择</span>
          <a-select-option
            v-for="option in record.appList"
            :key="option.code + record.index"
            :value="option.code"
          >
            <a-tooltip>
              <div slot="title">
                {{ option.name }}
              </div>
              {{ option.name }}
            </a-tooltip>
          </a-select-option>
        </a-select>
      </span>

      <span slot="dataManage" slot-scope="text, record">
        <!-- 数据管理员限定范围 -->
        <div style="padding-left: 8px">
          <staff-selector
            v-if="isOnlyAppAdmin"
            v-model="record.departments"
            :options="stuffOrOrgSelectorOpts"
            :params="handleParams(record.departments)"
          />
          <staff-selector
            v-else
            v-model="record.departments"
            :options="stuffOrOrgSelectorOpts"
          />
        </div>
      </span>

      <span slot="outData" slot-scope="text, record" class="Outer-chain">
        <a-switch v-model="record.externalLinkVisible" @change="onChange" />
      </span>

      <span slot="operatable" slot-scope="text, record">
        <i
          v-if="record.operatable"
          class="icon aufontAll h-icon-all-delete-o delete-btn"
          @click="deleteApp(record)"
        ></i>
        <a-popover v-else placement="topLeft">
          <template slot="content">
            <span class="top-left-tip">您不是该应用的管理员，<br />无法进行操作</span>
          </template>
          <i class="icon aufontAll h-icon-all-delete-o delete-btn disabled"></i>
        </a-popover>
      </span>
    </a-table>

    <a-button class="add-appBtn" type="link" @click="addApp">
      + 添加应用
    </a-button>
  </div>
</template>

<script lang="ts">
import appsApi from '@/apis/apps';
import {
  Table,
  Icon,
  Input,
  Select,
  Tooltip,
  Popover,
  Button,
  Checkbox,
  Switch,
} from '@h3/antd-vue';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserModule = namespace('System/User');

@Component({
  name: 'app-range',
  components: {
    StaffSelector,
    ATable: Table,
    AIcon: Icon,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATooltip: Tooltip,
    APopover: Popover,
    AButton: Button,
    ACheckbox: Checkbox,
    ASwitch: Switch,
  },
})
export default class AppPackage extends Vue {
  @Prop() id!: string;

  @Prop() operateType!: string;

  @Model('change') frontPerMap!: any;

  @UserModule.State('isOnlyAppAdmin') isOnlyAppAdmin!: boolean;

  dataColumns: any = [
    {
      dataIndex: 'code',
      width: 170,
      key: 'code',
      slots: { title: 'dataItemTitle' },
      scopedSlots: { customRender: 'dataItem' },
    },
    {
      dataIndex: 'dataManage',
      width: 250,
      key: 'dataManage',
      slots: { title: 'dataManageTitle' },
      scopedSlots: { customRender: 'dataManage' },
    },
    {
      dataIndex: 'outData',
      width: 50,
      key: 'outData',
      slots: { title: 'outDataTitle' },
      scopedSlots: { customRender: 'outData' },
    },

    {
      key: 'action',
      width: 50,
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'operatable' },
    },
  ];

  stuffOrOrgSelectorOpts = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
    showPart: true,
    maxTagCount: 2,
  };

  appList: any = [];

  itemIndex: number = 0;

  selectDdataIndex: number = 0;

  get frontPerMapList() {
    return this.frontPerMap.filter((op) => !op.deleted);
  }

  @Watch('operateType', { immediate: true })
  async onOperateTypeChange(operateType) {
    if (!operateType) {
      return;
    }

    await this.getAppList();
    // 添加生成一个空数据项
    if (operateType === 'add') {
      // if (!this.frontPerMap.length) {
      //   this.generateSelectData();
      // }

      return;
    }

    if (operateType === 'edit') {
      // this.setAppPackageDataManage()
      this.addAppListToSelectData();
    }
  }

  // 获取所有选择好的code
  // get selected () {
  //   return this.frontPerMap.reduce((stat: any, item:any) => {
  //     stat = Array.from(new Set([...item.appPackages, ...stat]))
  //     return stat
  //   }, [])
  // }

  /**
   * 获取表格行
   */
  selectItem(index: number, appPackages: string) {
    this.itemIndex = index;
    const idx: number = this.frontPerMap.findIndex(
      (item) => item.appPackages === appPackages,
    );
    this.frontPerMap[idx].appList = this.getOwnerAppList(appPackages);
  }

  filterOption(input: any, option: any) {
    return (
      option.componentOptions.children[0].componentOptions.children[0].children[0].text
        .trim()
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }

  /*
  获取外链数据的状态
   */
  onChange() {}

  /**
   * 添加已过滤的应用到下拉列表
   */
  addAppListToSelectData() {
    for (const item of this.frontPerMap) {
      this.$set(item, 'appList', this.getOwnerAppList(item.appPackages));
    }
  }

  /**
   * 生成空应用项配置
   */
  generateSelectData() {
    let index = this.frontPerMap.length;

    this.frontPerMap.push({
      index: index++,
      departments: [],
      appPackages: undefined, //用空字符串会使得placeholder属性不生效
      // dataManage: false,
      // name: null,
      operatable: true,
      // isDataManage: false,
      externalLinkVisible: false,
      deleted: false,
      appList: this.getOwnerAppList(),
    });
  }

  handleParams(depIds) {
    /* const resultArry = depIds.reduce((stat: any,item: any) => {
      stat.push(item.id)
      return stat
    }, []) */
    return {
      /* deptIds: resultArry.join(",") */
      filterType: 'admin',
      selectUserIds: '',
    };
  }

  /**
   * 过滤已选的应用
   */
  getOwnerAppList(appPackages?: any) {
    const cloneAppList: any =
      Array.isArray(this.appList) && JSON.parse(JSON.stringify(this.appList));
    for (let i = 0, len = this.frontPerMap.length; i < len; i++) {
      const item = this.frontPerMap[i];

      // 如果是自己，则跳出
      if (appPackages && item.appPackages === appPackages) {
        continue;
      }

      const index = cloneAppList.findIndex(
        (AppItem) => AppItem.code === item.appPackages,
      );

      if (index < 0) {
        continue;
      }

      // 把除了已选择的应用删除
      cloneAppList.splice(index, 1);
    }
    return cloneAppList;
  }

  /**
   * 选中应用
   */
  async onChangeApp(code: any) {
    const appPackegeItem: any = this.getAppPackage(code);
    const appPackege: any = appPackegeItem.appPackege;
    this.setAppPackage(appPackege);
  }

  // /**
  //  * 设置所有回选的数据的数据管理权限
  //  */
  // async setAppPackageDataManage() {
  //   const params: any = [];
  //   for (const item of this.frontPerMap) {
  //     params.push({
  //         name: item.name,
  //         code: item.code,
  //         adminId: this.id,
  //         id: ''
  //     });
  //   }
  //   const isDataManage: any = await this.getDataManage(params);
  //   for (const item of this.frontPerMap) {
  //     item.isDataManage = isDataManage[item.code];
  //   }

  // }

  /**
   * 设置应用数据
   */
  setAppPackage(appPackege: any) {
    for (const item of this.frontPerMap) {
      if (item.index === this.itemIndex) {
        item.appPackages = appPackege.code;
      }
    }
  }

  /**
   * 获取选中的应用和参数
   */
  getAppPackage(code: string) {
    const result = this.appList.reduce((stat: any, item: any) => {
      if (item.code === code) {
        stat = {
          appPackege: item,
        };
      }

      return stat;
    }, {});
    return result;
  }

  /**
   * 添加应用
   */
  addApp() {
    this.generateSelectData();
  }

  /**
   * 删除应用
   */
  deleteApp(data) {
    const index = this.frontPerMap.findIndex(
      (item) => item.index === data.index,
    );
    this.frontPerMap[index]['deleted'] = true;
  }

  /**
   * 获取应用列表
   */
  async getAppList() {
    const res: any = await appsApi.getAppList();

    if (res.errcode !== 0) {
      return;
    }

    if (res.data && res.data.length > 0) {
      // 获取接口列表并去重
      const temp = new Map();
      res.data.forEach((r: any) => {
        temp.set(r.code, {
          code: r.code,
          name: r.name,
        });
      });

      this.appList = [];

      // 把新的值给重新赋值给list
      for (const value of temp.values()) {
        this.appList.push(value);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.app-package {
  width: 100%;
  .app-table {
    /deep/.ant-table-thead > tr > th {
      padding: 8px 0 8px 8px;
    }

    /deep/.ant-table-tbody > tr > td {
      padding: 4px 2px;
    }
    .Outer-chain {
      display: block;
      text-align: center;
    }
    /deep/.ant-table-thead > tr > th {
      .td-title {
        white-space: nowrap;
        &:before {
          content: '|';
          display: inline-block;
          margin-right: 17px;
          color: rgba(0, 0, 0, 0.15);
        }
      }

      &:first-child {
        .td-title {
          &::before {
            display: none;
          }
        }
      }
    }

    .ant-select {
      width: 100%;
      height: 32px;
    }

    .checkbox,
    .delete-btn {
      display: block;
      margin: 0 auto;
      text-align: center;
    }

    .delete-btn {
      width: 45px;
    }

    .disabled {
      color: rgba(17, 18, 24, 0.25);
      cursor: not-allowed;
    }

    .disabled-down-icon {
      color: rgba(17, 18, 24, 0.25);
      font-size: 12px;
      cursor: not-allowed;
    }

    .top-left-tip {
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 1);
      line-height: 22px;
    }

    .app-select {
      /deep/ div.ant-select-selection-selected-value {
        max-width: 208px;
      }
    }
  }

  /deep/ .add-appBtn {
    display: block;
    margin: 10px auto 0 auto;
  }

  .add-appBtn {
    display: block;
    margin: 10px auto 0 auto;
  }
}
</style>
<style lang="less" scoped>
.app-package {
  .ant-table-placeholder {
    display: none;
  }
}
</style>

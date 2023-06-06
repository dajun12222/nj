<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="update-code">
    <div class="table-box">
      <div class="table-box-tip">
        <i class="icon aufontAll h-icon-all-Components_Warning"></i>
        <span class="file-status-txt">检测到服务方法重名,修改后导入将生成新的编码</span>
      </div>

      <a-table
        :pagination="false"
        :columns="appCodeColumns"
        :data-source="list"
        rowKey="id"
      >
        <template slot="newServiceCode" slot-scope="text, record">
          <div class="model-item">
            <a-input
              v-model="record.newServiceCode"
              :class="record.isShow ? 'input-error' : ''"
              :placeholder="$t('languages.Apps.PlzFillInNewCode')"
              :maxLength="27"
              @change="valueChange(record)"
            >
              <a-tooltip
                v-if="record.isShow"
                slot="suffix"
                overlayClassName="import-server-hint"
                placement="bottom"
                title="该编码已存在"
              >
                <i class="icon aufontAll h-icon-all-close-circle"></i>
              </a-tooltip>
            </a-input>
          </div>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script lang="ts">
import { Input, Table, Tooltip } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'update-code',
  components: {
    AInput: Input,
    ATable: Table,
    ATooltip: Tooltip,
  },
})
export default class UpdateCode extends Vue {
  @Prop() type!: any;

  @Prop() list!: any;

  toogleShow(item) {
    this.$set(item[0], 'show', !item[0].show);
    this.$nextTick(() => {
      console.log(item);
      this.$forceUpdate();
    });
  }

  get subClassificationList() {
    const res: any = {};
    this.list.subCodeList.forEach((el: any) => {
      if (res[el.parentSchemaCode]) {
        res[el.parentSchemaCode].push(el);
      } else {
        res[el.parentSchemaCode] = [el];
      }
    });
    return res;
  }

  searchFormModelText: string = '';

  getFormModelItem(item) {
    return item.filter(
      (el) => el.sheetName.indexOf(this.searchFormModelText) > -1,
    );
  }

  searchSubCodeText: string = '';

  getSubCodeItem(item) {
    return item.filter(
      (el) => el.modelName.indexOf(this.searchSubCodeText) > -1,
    );
  }

  valueChange(item) {
    item.isShow = false;
  }

  // 切换tab
  tabClick(val) {
    this.tabKey = val;
  }

  tabKey: string = '1';

  appCodeColumns: any[] = [
    {
      title: '目录',
      key: 'groupName',
      dataIndex: 'groupName',
    },
    {
      title: '服务方法',
      key: 'serviceName',
      dataIndex: 'serviceName',
    },
    {
      title: '原编码',
      key: 'oldServiceCode',
      dataIndex: 'oldServiceCode',
    },
    {
      title: '新编码',
      key: 'newServiceCode',
      dataIndex: 'newServiceCode',
      scopedSlots: { customRender: 'newServiceCode' },
    },
  ];

  getCodeList() {
    let existEmptyAppcode: boolean = false;
    let existEmptyModelcode: boolean = false;
    let existEmptySubCode: boolean = false;
    let existValidAppcode: boolean = false;
    let existValidModelcode: boolean = false;
    let existValidSubCode: boolean = false;
    if (this.list.appCodeList.length > 0) {
      // 应用
      existEmptyAppcode = this.list.appCodeList.some(
        (item: any) => !item.newCode,
      );
      existValidAppcode = this.list.appCodeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,25}$/.test(item.newCode),
      );
    }

    if (this.list.modelCodeList.length > 0) {
      // 模型
      existEmptyModelcode = this.list.modelCodeList.some(
        (item: any) => !item.newCode,
      );
      existValidModelcode = this.list.modelCodeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,25}$/.test(item.newCode),
      );
    }

    if (this.list.subCodeList.length > 0) {
      // 子表
      existEmptySubCode = this.list.subCodeList.some(
        (item: any) => !item.newCode,
      );
      existValidSubCode = this.list.subCodeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,25}$/.test(item.newCode),
      );
    }

    if (existEmptyModelcode || existEmptyAppcode || existEmptySubCode) {
      let type = '应用';
      if (existEmptyAppcode) {
        this.tabKey = '1';
        type = '应用';
      } else if (existEmptyModelcode) {
        this.tabKey = '2';
        type = '模型';
      } else {
        this.tabKey = '3';
        type = '子表';
      }
      this.$message.error(type + '新编码不能为空');
      return null;
    }

    if (existValidAppcode || existValidModelcode || existValidSubCode) {
      let type = '应用';
      if (existValidAppcode) {
        this.tabKey = '1';
        type = '应用';
      } else if (existValidModelcode) {
        this.tabKey = '2';
        type = '模型';
      } else {
        this.tabKey = '3';
        type = '子表';
      }

      this.$message.error(
        type + '编码格式必须以字母开头不超过26个字符，仅支持字母、数字、下划线',
      );
      return null;
    }
    return this.list;
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/import/update-code.less';

.table-box-tip {
  padding-left: 40px;
  margin-bottom: 13px;
  margin-top: 24px;
}

.input-error {
  border-color: #f4454e;

  /deep/ .ant-input:focus {
    border-color: #f4454e;
    box-shadow: none;
  }
}

.h-icon-all-close-circle {
  color: #f4454e;
  font-size: 20px;
  &:hover {
    color: #f4454e;
  }
}
</style>
<style lang="less">
.import-server-hint {
  .ant-tooltip-inner {
    background-color: #f4454e;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <a-table
      class="child-table"
      size="small"
      :columns="innerColumns"
      :loading="innerLoading"
      :dataSource="innerData"
      :pagination="false"
      rowKey="code"
    >
      <!-- 表头 -->
      <span slot="indexTitle" class="text-ellipsis">{{
        $t('languages.NO')
      }}</span>
      <span slot="codeTitle" class="text-ellipsis resize">方法编码</span>
      <span slot="nameTitle" class="text-ellipsis resize">方法名称</span>
      <template v-if="service.isRestful">
        <span slot="requestTitle" class="text-ellipsis resize">HTTP连接方法</span>
        <span slot="urlTitle" class="text-ellipsis resize">URL</span>
      </template>
      <span slot="actionTitle" class="text-ellipsis">{{
        $t('languages.integration.Action')
      }}</span>
      <!-- 表体 -->

      <span v-if="service.isRestful" slot="request" slot-scope="text, record">{{
        getHttpType(record.configs.httpType)
      }}</span>
      <span
        v-if="service.isRestful"
        slot="url"
        slot-scope="text, record"
        class="text-ellipsis"
        :title="record.configs.url"
        >{{ record.configs.url ? record.configs.url : '- -' }}</span>

      <span
        slot="action"
        slot-scope="text, record"
        class="child-table__actions"
      >
        <template v-if="isOperation(record)">
          <i @click="editItem(record)">查看</i>
        </template>
        <template v-else>
          <template
            v-if="service.isRestful || service.isDatabase || service.isSap"
          >
            <i @click="editItem(record)">编辑</i>
            <i @click="runItem(record)">运行</i>
            <a-dropdown :trigger="['hover']">
              <i class="table-operation">更多</i>
              <a-menu slot="overlay">
                <a-menu-item key="0" @click="referenceItem(record)">查看引用</a-menu-item>
                <a-menu-item key="1" @click="popItem(record)">删除</a-menu-item>
              </a-menu>
            </a-dropdown>
            <!-- <i class="icon aufontAll h-icon-all-delete-o" @click="popItem(record)"/> -->
          </template>
          <template v-if="service.isSoap">
            <i @click="runItem(record)">运行</i>
          </template>
        </template>
      </span>
    </a-table>
  </div>
</template>
<script lang="ts">
import serviceApi from '@/apis/biz-service/service.api';
import Bus from '@/utils/bus';
import { Table, Dropdown, Menu } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
const UserModule = namespace('System/User');
const MethodsModule = namespace('Integration/Methods');

@Component({
  name: 'child-table',
  components: {
    ATable: Table,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
  },
})
export default class ChildTable extends Vue {
  @Prop() service!: BizService.Service.Item;

  @MethodsModule.State('httpTypes') httpTypes: any;

  @MethodsModule.Action('getMethods') getMethods: any;

  @MethodsModule.Action('deleteMethod') deleteMethod: any;

  @UserModule.State('isJustAdmin') isJustAdmin!: boolean;

  @UserModule.State('loginedUserInfo') loginedUserInfo!: any;

  // 是否正在加载子表数据
  innerLoading: boolean = true;

  // 子表数据
  innerData: BizService.Method.Item[] = [];

  innerColumns: Array<Common.TableHead> = [];

  // 子表格表头信息
  restInnerColumns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      width: 60,
      key: 'index',
      align: 'center',
    },
    {
      dataIndex: 'code',
      slots: { title: 'codeTitle' },
      key: 'code',
      align: 'left',
      width: 100,
    },
    {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      width: 100,
      key: 'name',
      align: 'left',
    },
    {
      dataIndex: 'request',
      slots: { title: 'requestTitle' },
      scopedSlots: { customRender: 'request' },

      // key: 'request',
      align: 'left',
    },
    {
      dataIndex: 'url',
      slots: { title: 'urlTitle' },
      scopedSlots: { customRender: 'url' },

      // key: 'url',
      align: 'left',
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      width: 200,
      key: 'action',
    },
  ];

  // soap子表格表头信息
  soapInnerColumns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      width: 60,
      key: 'index',
      align: 'center',
    },
    {
      dataIndex: 'code',
      slots: { title: 'codeTitle' },
      // width: 208,
      key: 'code',
      align: 'left',
    },
    {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      // width: 200,
      key: 'name',
      align: 'left',
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      width: 200,
      key: 'action',
    },
  ];

  /**
   * 删除集成方法
   * @param record 业务方法
   */
  async popItem(record: any) {
    const bindInfo: any = await serviceApi.getServiceBizBindInfo({
      serviceCode: record.serviceCode,
      serviceMethodCode: record.code,
    });
    if (bindInfo.data && bindInfo.errcode === 0) {
      this.$emit('warn', record);
      // this.$warning({
      //   title: this.$t('languages.Apps.DeletePrompt'),
      //   content: '该集成方法已关联业务方法，不能删除',
      //   okText: this.$t('languages.Apps.Ok').toString(),
      // });
      return;
    }
    const vm: any = this;
    this.$confirm({
      title: this.$t('languages.integration.ConfirmDeleteMethod'),
      okText: this.$t('languages.Apps.Ok').toString(),
      cancelText: this.$t('languages.Apps.Cancel').toString(),
      onOk() {
        vm.deleteMethod({ id: record.id }).then((res: any) => {
          if (!res.errcode) {
            vm.$message.success('删除成功');
            vm.getMethodList();
          } else {
            const msg: string = res.errmsg || '请求接口出错！';
            vm.$message.error(msg);
          }
        });
      },
    });
  }

  /**
   * 按钮操作权限
   */
  isOperation(e: any): boolean {
    if (!e || !Object.keys(e).length) {
      return false;
    }
    if (
      this.isJustAdmin ||
      e.createdBy === this.loginedUserInfo.id ||
      this.loginedUserInfo.permissions.includes('SYS_MNG')
    ) {
      // 历史数据不做处理 admin账号、方法创建人不做处理
      return false;
    } else {
      return true;
    }
  }

  /**
   * 编辑服务
   */
  editItem(record: any) {
    this.$emit('edit', record);
  }

  /**
   * 运行服务方法
   */
  runItem(record: any) {
    this.$emit('run', record);
  }

  /**
   * 获取请求类型标签
   */
  getHttpType(value: any) {
    const httpType: any = this.httpTypes.find(
      (type: any) => type.value === value,
    );
    return httpType ? httpType.label : value;
  }

  /**
   * 获取服务下的方法列表
   */
  getMethodList() {
    this.innerLoading = true;
    this.getMethods({ serviceCode: this.service.code }).then((res: any) => {
      if (Array.isArray(res.data)) {
        res.data.forEach((item: any, index: number) => {
          item.index = index + 1;
          item.configs = JSON.parse(item.configJson);
        });
        this.innerData = res.data;
        this.$emit('load', res.data);
      }
      if (res.errcode) {
        this.$message.error(res.errmsg);
      }
      this.innerLoading = false;
    });
  }

  /**
   * 初始化表格
   */
  initTable() {
    if (this.service.isSoap || this.service.isDatabase) {
      this.innerColumns = this.soapInnerColumns;
    } else {
      this.innerColumns = this.restInnerColumns;
    }
    if (Array.isArray(this.innerColumns)) {
      for (const con of this.innerColumns) {
        con.ellipsis = true;
      }
    }
  }

  /**
   * 查看业务方法相关应用引用信息
   */
  referenceItem(record: any) {
    this.$emit('reference', record);
  }

  mounted() {
    this.initTable();
    if (this.service.methods) {
      this.innerData = this.service.methods;
      this.innerLoading = false;
    } else {
      this.getMethodList();
    }
    Bus.$on(
      'renewMethodList',
      (
        service: BizService.Service.Item,
        methods?: BizService.Method.Item[],
      ) => {
        if (service.code === this.service.code) {
          if (this.service.isSoap && methods) {
            this.innerData = methods;
          } else {
            this.getMethodList();
          }
        }
      },
    );
  }

  beforeDestroy() {
    Bus.$off('renewMethodList');
  }
}
</script>
<style lang="less" scoped>
.child-table {
  &,
  /deep/.ant-table-header,
  /deep/.ant-table-body {
    &::-webkit-scrollbar {
      width: 0;
      display: none;
    }
    .resize {
      vertical-align: middle;
    }
  }
  /deep/.ant-table-small {
    border: none;
  }
  // /deep/.ant-table-thead {
  //   span {
  //     display: inline-block;
  //     vertical-align: middle;
  //   }
  //   th > span {
  //     display: block;
  //   }
  // }
  &__actions {
    i {
      cursor: pointer;
      margin-right: 14px;
      font-style: normal;
      color: @primary-color;
    }
    i:last-child {
      padding-right: 0;
    }
  }
}
</style>

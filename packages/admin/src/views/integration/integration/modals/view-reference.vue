<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="reference">
    <p v-if="showTitle" class="reference__title">
      以下{{ list.length }}个业务模型引用了当前业务集成方法
    </p>
    <div class="reference__table">
      <a-table
        :columns="columns"
        :dataSource="list"
        :pagination="false"
        size="small"
        rowKey="index"
      >
        <!-- 表头 -->
        <span slot="indexTitle">序号</span>
        <span slot="schemaNameTitle" class="text-ellipsis resize">业务模型</span>
        <span slot="appNameTitle" class="text-ellipsis resize">所属应用</span>
        <span v-if="showRoute" slot="actionTitle" class="text-ellipsis resize">操作</span>
        <!-- 表体 -->
        <span
          slot="schemaName"
          slot-scope="text"
          class="text-ellipsis"
          :title="text"
          >{{ text }}</span>
        <span
          slot="appName"
          slot-scope="text"
          class="text-ellipsis"
          :title="text"
          >{{ text }}</span>
        <template
          v-if="showRoute"
          slot="action"
          slot-scope="text, record"
          class="text-ellipsis"
        >
          <a @click="goToChange(record)">前往修改</a>

          <!-- <router-link 
            tag="a"
            target="_blank"
            :to="{
              name: 'bizmodel',
              params: {
                appCode: record.appCode,
                bizSchemaCode: record.schemaCode
              },
              query: {
                // tab: '2'
                tabsIndex: 6
              }
            }">前往修改</router-link> -->
        </template>
      </a-table>
    </div>
  </div>
</template>
<script lang="ts">
import serviceApi from '@/apis/biz-service/service.api';
import { Table } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'reference',
  components: {
    ATable: Table,
  },
})
export default class Reference extends Vue {
  @Prop() serviceMethod!: any;

  @Prop({ default: true }) showTitle?: boolean;

  @Prop() showRoute?: boolean;

  // 表格列信息
  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      key: 'index',
      width: 146,
    },
    {
      dataIndex: 'schemaName',
      slots: { title: 'schemaNameTitle' },
      scopedSlots: { customRender: 'schemaName' },
      key: 'schemaName',
      width: 190,
    },
    {
      dataIndex: 'appName',
      slots: { title: 'appNameTitle' },
      scopedSlots: { customRender: 'appName' },
      key: 'appName',
    },
  ];

  // 引用列表
  list: any[] = [];

  goToChange(record: any) {
    window.open(
      `/admin/#/apps/model/${record.appCode}/${record.schemaCode}/data/busRules`,
    );
  }

  /**
   * 获取引用信息列表
   */
  getList() {
    const params: BizService.Service.GetReferenceParams = {
      serviceCode: this.serviceMethod.serviceCode,
      serviceMethodCode: this.serviceMethod.code,
    };
    serviceApi.getReference(params).then((res: any) => {
      if (res.errcode === 0 && Array.isArray(res.data)) {
        this.list = res.data.map((item: any, index: number) => {
          item.index = index + 1;
          return item;
        });
      }
    });
  }

  mounted() {
    if (this.showRoute) {
      this.columns.push({
        dataIndex: 'action',
        slots: { title: 'actionTitle' },
        scopedSlots: { customRender: 'action' },
        key: 'action',
        width: 104,
        align: 'right',
      });
    }
    this.getList();
  }
}
</script>
<style lang="less" scoped>
.reference {
  &__title {
    margin-bottom: 16px;
    color: rgba(17, 18, 24, 0.5);
  }
  &__table {
    /deep/.ant-table-body {
      table {
        padding: 0 !important;
      }
      th {
        font-weight: 600;
      }
    }
    a {
      color: @primary-color;
    }
  }
}
</style>

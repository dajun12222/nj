<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="system-operation">
    <a-tabs class="user-tabs" defaultActiveKey="1">
      <a-tab-pane key="1" tab="缓存管理">
        <div class="cache">
          <div class="cache-header">
            <span class="title">缓存管理</span>
            <span class="delete"><a-button
                class="btn-group__btn ant-btn ant-btn-primary"
                :disabled="selectedRowKeys.length === 0"
                @click="deleteKeys"
                >清除</a-button></span>
          </div>
          <a-table
            :key="key"
            class="table-user-list"
            :pagination="false"
            :columns="columns"
            :scroll="{ y: 'calc(100vh - 210px)' }"
            :dataSource="dataSource"
            :rowSelection="{ onChange: onSelectChange }"
          />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Button, Table, Tabs } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import cacheApi from './../../../apis/system/cacheManagement.api';
@Component({
  name: 'cacheMagent',
  components: {
    ATable: Table,
    AButton: Button,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class cacheMagent extends Vue {
  caches: any = [];

  key: number = 1;

  selectedRowKeys: any[] = [];

  columns = [
    {
      title: 'keys',
      dataIndex: 'keys',
      key: 'keys',
      width: '15%',
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      width: '15%',
    },
    {
      title: '扩展缓存信息',
      dataIndex: 'extendedCacheInfo',
      key: 'extendedCacheInfo',
      /* width: '15%', */ //最后一列不要宽度
    },
  ];

  get dataSource() {
    let arr = [];
    if (this.caches) {
      arr = this.caches.map((item, index) => {
        return {
          key: item.key,
          keys: item.key,
          desc: item.desc || '--',
          extendedCacheInfo: JSON.stringify(item.extendedCacheInfo) || '--',
        };
      });
    }
    return arr;
  }

  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys;
  }

  //删除字段的缓存
  deleteKeys() {
    const deleteRowKeys: any = [...this.selectedRowKeys];
    const params: any = {
      delKeys: deleteRowKeys,
    };
    cacheApi.deleteCacheKeys(params).then((res) => {
      if (res.errcode === 0) {
        this.$success({
          title: '清除成功！',
          content: `${res.errmsg}`,
          okText: '确认',
        });
        /* this.selectedRowKeys = []; */
      } else {
        this.$error({
          title: '清除失败！',
          content: `${res.errmsg}`,
          okText: '返回',
        });
      }
    });
  }

  //得到所有缓存字段
  getCacheKeys() {
    cacheApi.getAllCacheKeys({ view: 222222 }).then((res: any) => {
      if (res.errcode === 0) {
        this.caches = res.data.caches;
      } else {
        this.$message.error(`${res.errmsg}`);
      }
    });
  }

  mounted() {
    this.getCacheKeys();
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/tab.less';
@import '../../../styles/table.less';
.system-operation {
  margin: 0 24px;
}

.cache-header {
  padding: 16px 0;
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  position: relative;
  height: 50px;
  .title {
    font-weight: 500;
    font-size: 18px;
    line-height: 22px;
    color: #111218;
    position: absolute;
    left: 0;
  }
  .delete {
    position: absolute;
    right: 20px;
    bottom: 8px;
  }
}
.cache {
  /deep/.ant-table-selection-column {
    width: 5%;
  }
}
</style>

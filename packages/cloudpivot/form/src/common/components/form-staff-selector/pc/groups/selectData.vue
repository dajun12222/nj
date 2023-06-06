<template>
  <div class="selectData">
    <ul>
      <li>
        <a>姓名（或部门名称）</a>
        <i></i>
        <span>单位</span>
      </li>
      <a-checkbox-group v-model="selectData">
        <li v-for="item in list" :key="item.id">
          <a-checkbox :value="item.id">
            <!-- <img :src="defaultAvatar" />  -->
            {{ item.name }}
          </a-checkbox>
          <i></i>
          <span>{{ item.parentDepartmentName }}</span>
        </li>
      </a-checkbox-group>
    </ul>
  </div>
</template>
<script lang="ts">
import {
  Avatar,
  Button,
  Checkbox,
  Icon,
  Modal,
  Radio,
  Select,
  Col,
  Row,
} from '@h3/antd-vue';
// @ts-ignore
import cloneDeep from 'lodash/cloneDeep';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'selectData',
  components: {
    ACheckboxGroup: Checkbox.Group,
    ACheckbox: Checkbox,
  },
})
export default class selectData extends Vue {
  selectData: any = [];

  list: any = [];

  //defaultAvatar: any = require('@/assets/images/avatar.png');
  @Watch('selectData', { deep: true, immediate: true })
  onChangeSelectData(newVal: any) {}

  operation(type: string, data: any) {
    switch (type) {
      case 'get':
        return this.getData();
        break;
      case 'add':
        this.addData(data);
        break;
      case 'clean':
        this.clean();
        break;
      case 'del':
        this.delData();
        break;
    }
  }

  getData() {
    return this.list;
  }
  portAddData(data:any){
    this.list = [];
    this.$nextTick(() => {
      this.addData(data);
    })
  }
  addData(data:any){
    let list:any = [];
    if(this.list && this.list.length > 0){
      list = JSON.parse(JSON.stringify(this.list));
    }

    data.map((item: any) => {
      item.source = JSON.parse(JSON.stringify(item));
    });
    let option: any = list.concat(data);
    this.list = this.duplicate(option);
  }

  duplicate(data: any) {
    let obj: any = {};
    let result: any = [];
    result = data.reduce(function (item: any, next: any) {
      obj[next.id] ? '' : (obj[next.id] = true && item.push(next));
      return item;
    }, []);
    return result;
  }

  clean() {
    this.$confirm({
      title: `确定要全部删除吗？`,
      okType: 'danger',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.list = [];
        this.selectData = [];
      },
      onCancel: () => {},
    });
  }

  delData() {
    if (!this.selectData || (this.selectData && this.selectData.length < 1)) {
      this.$message.error('请先选择数据');
      return;
    }
    this.$confirm({
      title: `确定要删除吗？`,
      okType: 'danger',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.selectData.map((item) => {
          let index = this.list.findIndex((c) => {
            return item === c['id'];
          });

          if (index > -1) {
            this.list.splice(index, 1);
          }
        });
        this.selectData = [];
      },
      onCancel: () => {},
    });
  }
}
</script>
<style lang="less" scoped>
.selectData {
  height: calc(100% - 45px);
  overflow: auto;
  padding: 3px;

  ul {
    /deep/ .ant-checkbox-group {
      display: block;
    }
    li {
      display: grid;
      grid-template-columns: 1fr 1px 1fr;
      border-bottom: solid 1px #ccc;
      padding: 3px 0;
      img {
        width: 20px;
        height: 20px;
      }
      i {
        width: 1px;
        height: 100%;
        background-color: #ccc;
      }
      a {
        padding: 0 3px;
        color: rgba(0, 0, 0, 0.65);
      }
      label {
        padding: 0 3px;
      }
      span {
        padding: 0 3px;
      }
    }
  }
}
</style>

<!--
 * @Author: your name
 * @Date: 2020-03-28 10:26:28
 * @LastEditTime: 2021-09-03 18:37:44
 * @LastEditors: baidongsheng
 * @Description: In User Settings Edit
 * @FilePath: \frontend\entries\admin\src\components\apps\model\dataitem-modals\dataItemDrawer.vue
-->
<template>
  <div class="form-wrap">
    <a-form style="margin-left: 15px;">
      <div style="text-align: right;">
        <a-button class="editable-add-btn" @click="handleAdd" style="background-color:seashell">
          添加
        </a-button>
      </div>
      <a-table bordered :data-source="dataSource" :columns="columns" :rowKey="(record) => record.id"
        :pagination="false">
        <template slot="id" slot-scope="text, record,index">
          {{ index }}
        </template>

        <template slot="code" slot-scope="text, record,index">
          <a-form-model :rules="rules" :model="record">
            <a-form-model-item prop="code">
              <a-input v-model="record.code" />
            </a-form-model-item>
          </a-form-model>
        </template>

        <template slot="name" slot-scope="text, record,index">
          <a-form-model :rules="rules" :model="record">
            <a-form-model-item prop="name">
              <a-input v-model="record.name" />
            </a-form-model-item>
          </a-form-model>
        </template>

        <template slot="type" slot-scope="text, record">
          <a-select placeholder="请选择" v-model="record.type" style="">
            <a-select-option v-for="(item,index) in options" :value="item.value" :key="index">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </template>
        <template slot="operation" slot-scope="text, record,index">
          <a-popconfirm v-if="dataSource.length" title="确定删除吗?" @confirm="() => onDelete(index)">
            <a href="javascript:;">删除</a>
          </a-popconfirm>
        </template>
      </a-table>
    </a-form>
    <!-- 提交保存 -->
    <div class="draw-body-bottom" style="text-align:center; margin-top: 2vh;">
      <a-button style="background-color: #17bc94;" @click="handleSave()">保存</a-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.form-wrap {
  padding-bottom: 30px;
}

.editable-cell {
  position: relative;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding-right: 24px;
}

.editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
}

.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.editable-cell-icon {
  line-height: 18px;
  display: none;
}

.editable-cell-icon-check {
  line-height: 28px;
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-cell-icon:hover,
.editable-cell-icon-check:hover {
  color: #108ee9;
}

.editable-add-btn {
  margin-bottom: 8px;
}
</style>

<script lang="ts">
import { DataItemType } from "cloudpivot/form/schema";
import { Vue, Component } from 'vue-property-decorator';
import Bus from "@/utils/bus";
import UUID from 'uuidjs';
import axios from 'axios';
import { namespace } from "vuex-class";
import {
  Form,
  FormModel,
  Button,
  Table,
  Input,
  Select,
  Popconfirm,
} from '@h3/antd-vue';
const DataModelModule = namespace("Apps/DataModel");

 const validateCode = (rule, value, callback) => {
    console.log(value);
      let reg = /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/
      if (!reg.test(value)) {
        callback(new Error('以字母开头,包括字母或下划线或数字,不超过24个字符'))
      } else {
        callback()
      }
    }
 const validateName = (rule, value, callback) => {
      console.log(value);
      let reg = /^[^ ].{0,9}$/
      if (!reg.test(value)) {
        callback(new Error('请输入不以空格开头长度不超过10个字符'))
      } else {
        callback()
      }
    }

@Component({
  name: "BatchDataItem",
  components: { 
    AForm: Form,
    AFormItem: Form.Item,
    AFormModel: FormModel,
    AFormModelItem: FormModel.Item,
    AButton: Button,
    ATable: Table,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    APopconfirm: Popconfirm,
  },
})

export default class BatchDataItem extends Vue {

  @DataModelModule.State("bizSchemaCode") schemaCode: any;
  DataItemTypes: any = DataItemType;
  rules: any = {
    code: [{ validator: validateCode, trigger: 'change' }],
    name: [{ validator: validateName, trigger: 'change' }],
  };
  dataSource: any = [{
    id: UUID.generate(),
    code: '',
    name: '',
    type: 0,
  }];
  columns: any = [
    {
      title: '序号',
      dataIndex: 'id',
      width: '10%',
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '编码',
      dataIndex: 'code',
      width: '25%',
      scopedSlots: { customRender: 'code' },
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: '30%',
      scopedSlots: { customRender: 'name' },
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      width: '25%',
      scopedSlots: { customRender: 'type' },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: { customRender: 'operation' },
    },
  ];
  options: any = [
    {
      name: '单行文本',
      value: this.DataItemTypes.ShortText,
    },
    {
      name: '长文本',
      value: this.DataItemTypes.LongText,
    },
    {
      name: '数值',
      value: this.DataItemTypes.Number,
    },
    {
      name: '日期',
      value: this.DataItemTypes.Date,
    },
    {
      name: '逻辑',
      value: this.DataItemTypes.Logic,
    },
    {
      name: '附件',
      value: this.DataItemTypes.Attachment,
    },
    {
      name: '单选框',
      value: this.DataItemTypes.Radio,
    },
    {
      name: '复选框',
      value: this.DataItemTypes.Checkbox,
    },
    {
      name: '下拉单选框',
      value: this.DataItemTypes.Dropdown,
    },
    {
      name: '下拉多选框',
      value: this.DataItemTypes.DropdownMulti,
    },
    {
      name: '人员单选',
      value: this.DataItemTypes.StaffSingle,
    },
    {
      name: '人员多选',
      value: this.DataItemTypes.StaffMulti,
    },
    {
      name: '部门单选',
      value: this.DataItemTypes.DeptSingle,
    },
    {
      name: '部门多选',
      value: this.DataItemTypes.DeptMulti,
    },
    {
      name: '混合选人',
      value: this.DataItemTypes.StaffDeptMix,
    },
    {
      name: '地址',
      value: this.DataItemTypes.Address,
    },
    {
      name:'子表',
      value:this.DataItemTypes.Sheet,
    }
  ];

  onDelete(index) {
    //  debugger;
    //  const dataSource = [...this.dataSource];
    //this.dataSource = dataSource.filter(item => item.key !== key);
    this.dataSource.splice(index, 1);
    // // this.dataSource.forEach(element => {
    // //   if(element.key > key){
    // //     --element.key; //删除数据之后要刷新序号
    // //   }
    // // });
  }
  handleAdd() {
    let count = this.dataSource.length;
    const newData = {
      id: UUID.generate(),
      code: ``,
      name: ``,
      type: 0,
    };
    this.dataSource.push(newData);
  }
  async handleSave() {
    debugger;
    let flag: any = true;
    const dataSource = [...this.dataSource];
    let list: any = [];
    let properties: any = [];
    for (let i = 0; i < dataSource.length; i++) {
      if (!(dataSource[i].code && dataSource[i].name && dataSource[i].type !== ''))//判断是否有空值
      {
        this.$message.error("数据不能为空，请补充后再保存！");
        flag = false;
        return;
      }
      if (list.indexOf(dataSource[i].code) > -1) //判断数据项编码是否有重复
      {
        this.$message.error("编码【" + dataSource[i].code + "】重复！");
        flag = false;
        return;
      }
      else {
        list.push(dataSource[i].code);
        properties.push({ propertyName: dataSource[i].name, propertyCode: dataSource[i].code, propertyType: dataSource[i].type });
      }
    }
    //调用批量添加数据项接口
    flag = await this.batchAddData(properties);
    if (flag) {
      Bus.$emit("batchSaveDataItem", 0);//关闭页面
    }
  }

  // 批量添加数据项
  batchAddData(properties) {
    const params = {
      schemaCode: this.schemaCode,
      properties: properties
    };
    return axios.post("/api/ceec/property/addProperties", params).then((res: any) => {
      if (res.errcode === 0) {
        return true;
      } else {
        this.$message.warning(res.errmsg);
        return false;
      }
    });
  }
} 
</script>

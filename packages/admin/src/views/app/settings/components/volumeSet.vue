<template>
  <div>
    <div class="model-bar">
      <div class="header-bar">
        <h4 class="model-title" @click="cancel">{{ $t('languages.appSettings.permissionSetting') }}</h4>
        <div v-if="groupName" class="model-name-wrap">
          <span class="model-name">{{ $t('languages.appSettings.VolumeSet') }} - {{ groupName }}</span>
          <i class="icon aufontAll h-icon-all-close close" @click="close"></i>
        </div>
      </div>
    </div>

    <div class="group-settings-wrap">
        
    <!-- 权限设置 -->
    <div class="model-settings">
      
      <template>
        <a-tree
        v-if="treeData.length"
        :defaultExpandAll="defaultExpandAll"
        :treeData="treeData"
        :maxTagCount="5"
        style="top:5px"
        dropdownClassName="orgsync-form-tree-select"
        :getPopupContainer="getPopupContainer"
        placeholder="请选择"
        :treeCheckable="true"
        treeNodeFilterProp="title"
        class="orgsync-form-item"
        @change="onChange($event)"
      >
        <template slot="custom" slot-scope="item" class="role-title">
            
          <a-row>
            <a-col :span="24" class="customName">{{ item.name }}</a-col>
            <a-col v-if="item.nodeType === '1'" :span="24" class="customNameCode">
              <!-- <a-col :span="24">
                模型权限
              </a-col> -->
              <a-col :span="6">
                {{ $t('languages.appSettings.visible') }}
              </a-col>
              <a-col :span="18">
                <a-switch 
                    :checked="item.hasSee"
                    @change="e => setField(item)"
                  />
              </a-col>
              <a-col :span="6">
                {{ $t('languages.appSettings.dataPermission') }}
              </a-col>
              <a-col :span="18">
                <a-radio-group v-model="item.selectPerm" :name="item.id" @change="(e) => radioChange(item, e)">
                    <a-radio v-for="(t) in item.DataAccess" :key="t.value" :value="t.value">{{ t.label }}</a-radio>
                </a-radio-group>
              </a-col>
            </a-col>
           
          </a-row>
        </template>
      </a-tree>
        
      </template>
      <div class="option-bar">
          <a-button style="margin-right: 10px;" @click="cancel">取消</a-button>
          <a-button type="primary" @click="submit">保存</a-button>
      </div>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
// 权限组配置页面
import * as dataPermissionApi from '@/apis/data-permission';
import permissionApi from '@/apis/system/permission.api';

import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import { 
  Form, 
  Input,
  Modal, 
  TreeSelect,
  Radio,
  Button,
  Select,
  Tree,
  Row,
  Col,
  Switch 
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';



const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'volume-set',
  components: {
    AForm: Form,
    AFormItem: Form.Item,
    ATreeSelect: TreeSelect,
    ATree: Tree,
    AInput: Input,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARow: Row,
    ACol: Col,
    ASwitch: Switch,
  }
})

export default class VolumeSet extends Vue {

  list: any = []
  
  record: BPM.System.AppFunctionPermissionModel = {} as any;

  groupDataInfo: any = {}

  @AppCenterModule.State('appInfo') appInfo: any;

  modelKey: string = '';

  treeData: any[] = [];
 
  @Prop({
    default: ''
  })
  groupId!: string;

  @Prop({
    default: ''
  })

  groupName!:string

  selectPerm:any = [];

  defaultExpandAll:boolean = false;

  visibleType = {
    staffs: true,
    isExternalUser: true,
    roles: false,
    rolesRange: false,
  };

  DataAccess:any = [];

  created(){
    this.getVolumeSet();
  }

  async getVolumeSet(){
    this.DataAccess = [
    {
      label: this.$t('languages.appSettings.AllVisible'),
      value: 1
    }, 
    {
      label: this.$t('languages.appSettings.MyDepartment'),
      value: 2
    },
    {
      label: this.$t('languages.appSettings.OnlySelf'),
      value: 3
    },
    {
      label: this.$t('languages.appSettings.Customize'),
      value: 4
    },
    {
      label: this.$t('languages.appSettings.RoleManagerRange'),
      value: 5
    },
    {
      label: this.$t('languages.appSettings.AccounManagerRange'),
      value: 6
    }
  ]
 
    const appCode = this.$route.params.appCode || this.appInfo.code;
    const { data } = await permissionApi.getUserRoleFunctionList(this.groupId,appCode);
    data.map((item) => {
      if(item && item['modelDataPerms']){
        let result:any = [];
        item.modelDataPerms.map((ele) => {
          this.DataAccess.map((item) => {
            if(ele === item['value']){
              result.push(item);
            }
          })
          
        })
  
        if(item.nodeType === '1'){
          item.isLeaf = true;
        }else{
          item.isLeaf = false;
        }
        item['disabled'] = true;
        item['DataAccess'] = result;
        item['scopedSlots'] = { title: 'custom' };
        // item['scopedSlots'] = {
        //   title: 'custom'
        // }
      }
    })
   
    
    this.treeData = this.oneToMore(data,'parentId','id');
    console.log(data);
    console.log(this.treeData);
    this.defaultExpandAll = true;
  }
  /*
  一维数组转多维数组
  */

 oneToMore(treeData, pId,id){

    // // 把跟节点首先放进数组
    const tmpTree = treeData.filter(node => node[pId] === null || node[pId] === '')
    // 递归生成节点及子节点数据
    const findChildren = (tree) => {
      tree.forEach(node => {
        node.children = treeData.filter(cNode => cNode[pId] === node[id])
        if (node.children.length) {
          findChildren(node.children)
        }
      })
    }

    findChildren(tmpTree)

    return tmpTree;
 }
 
  onContextMenuClick(){

  }

  cancel() {
    const histroyData:any = {
      name: this.groupDataInfo.name,
      id: this.groupId
    }
    this.$emit('viewModelVolumeSet', false, "", histroyData)
  }

  close() {
    const histroyData:any = {
      name: "",
      id: ""
    }
    this.$emit('viewModelVolumeSet', false, "", histroyData)
  }

  timer:any;

   submit() {
    if(this.timer){
      this.$message.warning('正在保存中,请稍后...')
      clearTimeout(this.timer);
    } else {
      this.$message.warning('正在保存中,请稍后...')
    }
    this.timer = setTimeout(async() => {
        //
        let option:any = this.flatten(this.treeData,[]);
        let params:any = [];
        option.map((item) => {
          let obj = {
            id: item['id'],
            hasSee: item['hasSee'],
            selectPerm: item['selectPerm'],
            functionCode: item['functionCode'],
          }
          params.push(obj);
        })
        const res:any = await permissionApi.saveRoleFunctionList(this.groupId,params);
        if(res.errcode === 0){
          this.$message.destroy();
          this.$message.success(res.errmsg);
        }
    }, 500);
  
  }

  flatten(arr,result:any = []){
    let data = JSON.parse(JSON.stringify(arr));
     data.map((item) => {
      if(item['children'] && item['children'].length > 0){
        this.flatten(item['children'],result);
      }
      delete item['children'];
      result.push(item);
     })
     return result;
  }

  setField(item:any) {
    //hasSee
    //eventKey
    let option = this.getTreeDataByKey(this.treeData,item['id']) || { hasSee: false };
  
    if(item['hasSee']){
      option['hasSee'] = false;
    }else{
      option['hasSee'] = true;
    }
    
    this.treeData = [...this.treeData];
  
  } 

  getTreeDataByKey(childs:any = [], findKey:string) {
    let finditem = null;
    for (let i = 0, len = childs.length; i < len; i++) {
      let item = childs[i]
      if (item.id !== findKey && item.children && item.children.length > 0) {
      finditem = this.getTreeDataByKey(item.children, findKey)
      }
      if (item.id === findKey) {
      finditem = item
      }
      if (finditem != null) {
      break
      }
    }
    return finditem
  }

  radioChange(item:any,e:any) {

    
    let option = this.getTreeDataByKey(this.treeData,item['id']) || { hasSee: false };
  
    option['selectPerm'] = e.target.value;
    
    this.treeData = [...this.treeData];
 
  }
 
  onChange(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }
  

}
</script>


<style lang="less" scoped>
.customName {
  font-weight: 700;
}
.customNameCode {
  border-bottom: solid 1px #d3d3d3;
}
/deep/ li.ant-tree-treenode-disabled > .ant-tree-node-content-wrapper span {
  cursor: pointer;
  color: rgba(0,0,0,0.65);
}
/deep/ .ant-tree li .ant-tree-node-content-wrapper {
  height: auto;
}
.apps-select {
  &__item {
    width: 100%;
  }
}
   .header-bar {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e8e8e8;
      .model-title {
        font-size: 18px;
        font-weight: bolder;
        padding: 15px 24px;
        color:rgba(0, 0, 0, 0.65);
        cursor: pointer;
        &:hover {
          color: #17BC94;
        }
      }
    }

    .model-name-wrap {
      height: 58px;
      line-height: 58px;
      border-bottom: 2px solid #17BC94;
      .model-name {
        font-size: 18px;
        color: #17BC94;
        font-weight: bolder;
        margin-left: 20px;
        margin-right: 8px;
        cursor: pointer;
      }
      .close {
        cursor: pointer;
        font-size: 18px;
        color: #AAA;
      }
    }


.group-settings-wrap{
  text-align: left;
  color: rgba(0, 0, 0, 0.65);
  // height: 100%;
  height: calc(100vh - 64px);
  display: flex;
  .model-menu{
    width: 224px;
    padding-right: 1px;
    float: left;
    box-shadow: 1px 0px 0px 0px #e8e8e8;
    position: relative;
    z-index: 2;
    height: calc(100vh - 64px);
    .menu-tree {
      height: calc(100vh - 64px);
      position: relative;
      .menu-title {
        height: 40px;
        line-height: 40px;
        padding: 0 16px;
        margin-top: 10px;
        font-weight: 600;
      }
      .menu-content {
        overflow: auto;
        height: calc(100vh - 184px);
      }

      .menu-item {
        height: 40px;
        line-height: 40px;
        padding: 0px 16px !important;
        margin-top: 10px;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        &.active {
          background: #f4f5f8;
          border-left: 1px solid #e8e8e8;
        }
      }
    }
  }
  .model-settings {
    padding-bottom: 122px;
    position: relative;
    overflow-y: auto;
    flex: 1;
    .option-bar {
      position: fixed;
      // left: 0;
      bottom: 0;
      width: calc(100vw - 448px);
      height: 52px;
      line-height: 52px;
      text-align: center;
      border-top: 1px solid #e8e8e8;
      background-color: #fff;
    }
  }
}

._item-list{
  display: flex;
  flex-direction: column;
  p{
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }
}
.permission-group-form {
  // position: relative;
  // min-height: 100%;
  margin-bottom: 70px;
  // /deep/.ant-table-thead span {
  //   font-weight: 600;
  //   color: rgba(0,0,0,0.65);
  // }
  /deep/.ant-table-body {
    color: rgba(0,0,0,0.85);
  }
  .ant-drawer-btn {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 52px;
    line-height: 52px;
    text-align: center;
    border-top: 1px solid #e8e8e8;
    background-color: #fff;
    .cancel-btn{
      margin-right: 16px;
    }
  }
  h4 {
    font-weight: 600;
    color: #000;
    margin-bottom: 16px;
    margin-top: 24px;

    &:first-child {
      margin-top: 0;
    }
  }

  a {
    color: @primary-color;
    font-size: 14px;
  }
  /deep/.ant-row-flex {
    margin: 20px 0;
    align-items: flex-start;
  }

  .ant-col-4 {
    display: flex;
    align-items: center;
    height: 32px;
    color: rgba(0,0,0,0.65);
  }
  .ant-col-20.checkbox {
    line-height: 32px;
  }
  .setting-groups {
    display: flex;
  }
  .error {
    /deep/.ant-select-selection,
    /deep/.h3-organization__label {
      border: 1px solid #f5222d;
    }

    & > .message {
      color: #f5222d;
      font-size: 12px;
    }
  }
}
// .panel-content+.panel-content{
//   margin-top: 16px;
// }
.permission-group-panel-wrapper{
  margin: 0 14px 0 16px;
  border-top: 1px solid #E8E8E8;
  .permission-group-panel-item{
    padding: 12px 0;
    .item-title{
      font-weight:600;
      display: flex;
      flex-direction: row;
      flex-wrap: no-wrap;
      justify-content: space-between;
      align-items: center;
      .sub-title {
        margin-right: 20px;
      }
    }
    .ant-checkbox-wrapper {
      margin-bottom: 8px;
    }
  }
}
.panel-content .permission-group-panel-wrapper:last-of-type .permission-group-panel-item:last-of-type{
  margin-bottom: 0;
}
.permission-group-panel-wrapper:first-of-type{
  border-top: none;
}
.item-list{
  // display: flex;
  // flex-direction: row;
  flex-wrap: no-wrap;
  justify-content: flex-start;
  align-items: center;
  color:rgba(0,0,0,0.65);
  span.form_data_title{
    min-width: 8em;
    align-self: flex-start;
    justify-self: flex-start;
    line-height: 44px;
  }
  h4 {
    margin-bottom: 16px;
    font-weight: bolder;
    color: rgba(0, 0, 0, 0.65);
  }
}
/deep/.h3-panel-header>span{
  font-weight: 600;
}
/deep/.item-title .ant-checkbox + span{
  padding-right: 0;
  color:rgba(0,0,0,0.65);
}

.menu-item {
  position: relative;
  .change-info {
    display: block;
    height: 10px;
    width: 10px;
    border: 1px solid orange;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translate(0, -50%);
  }
}
</style>

<style lang="less">
// 修改新增权限组 select 框之间的对齐问题，在scope不生效
.permission-group-form {
  .ant-select-allow-clear .ant-select-selection--multiple .ant-select-selection__rendered {
    margin-right: 11px !important;
  }

  .ant-select-selection--multiple .ant-select-selection__rendered {
    margin-left: 11px !important;
  }
}

// 表格每个 tr 的第一个 td样式
.permission-group-form table tr td:nth-of-type(1) {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ant-select-tree-dropdown {
  max-height: 60vh !important;
}
.ant-select-tree li span.ant-select-tree-checkbox{
  display: none;
}
.ant-select-tree li span.ant-select-tree-checkbox + .ant-select-tree-node-content-wrapper{
  width: calc(100% - 24px);
}
.ant-select-tree>.ant-select-tree-treenode-checkbox-checked>.ant-select-tree-node-content-wrapper,
.ant-select-tree-child-tree .ant-select-tree-treenode-checkbox-checked .ant-select-tree-node-content-wrapper{
  background-color:#FAFAFA !important;
  font-weight: bold;
}
.ant-select-tree>.ant-select-tree-treenode-checkbox-checked>.ant-select-tree-node-content-wrapper::after,
.ant-select-tree-child-tree .ant-select-tree-treenode-checkbox-checked .ant-select-tree-node-content-wrapper::after{
  content: "\E98F";
  color: #17BC94;
  position: absolute;
  right: 8px;
  display: inline-block;
  font-family: "aufontAll" !important;
  font-weight: bold;
}
.ant-select-tree-node-content-wrapper{
  background-color: #ffffff !important;
}
.ant-select-tree-node-content-wrapper:after{
  content:'';
}

</style>
<style lang="less">
.data-permission-handler__tabs {
  .ant-tabs-bar {
    margin-bottom: 0;
    border-bottom: none;
  }
  .ant-table-thead {
    background:#FAFAFA;;

  }
}
  
</style>
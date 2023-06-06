<template>
  <div class="apps-select">
    <a-tree-select
    v-model="selectedCode"
      :treeDefaultExpandAll="true"
      :treeData="treeData"
      :maxTagCount="5"
      :style="`width:${ customWidth }`"
      style="top:5px"
      dropdownClassName="orgsync-form-tree-select"
      :getPopupContainer="getPopupContainer"
      :replaceFields="replaceFields"
      placeholder="请选择"
      :treeCheckable="true"
      treeNodeFilterProp="title"
      class="orgsync-form-item"
      @change="onChange"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Model, Watch } from "vue-property-decorator";
import {
  Row,
  Col,
  Modal,
  Checkbox,
  Input,
  Radio,
  TreeSelect,
  Popover,
} from '@h3/antd-vue';
import appsApi from "@/apis/apps";

@Component({
  name: "apps-select-role-jurisdiction",
  components: {
    ATreeSelect: TreeSelect,
  },
})
export default class AppsSelectRoleJurisdiction extends Vue { 

  @Prop({ default: '292px'}) customWidth: any;

  @Prop() roleIdsDefault?: any;

  @Prop({ default: () => [] }) selectData?: any;
  //roleIdsDefault

  list: any[] = [];

  value: Array<string> = [];

  treeData: any[] = [];

  selectedCode: any = [];

  @Watch('roleIdsDefault', { deep: true, immediate: true })
  onChangeRoleIdsDefault(newVal){
    this.selectedCode = newVal;
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  getTreeData(appCodes?:any) {
    this.treeData = [];
    if(!appCodes) return;
    const params: any = {
      id: '',
      appCodes
    };
    appsApi
      .getAdminRoleRangByid(params)
      .then((res: any) => {
        let data = res.data;
        data.map((item) => {
          
          if(item.nodeType === 1){
           item.isLeaf = true;
           item.checkable = true;

          }else{
           item.isLeaf = false;
           item.checkable = false;
          }
        })
        this.treeData = this.oneToMore(data,'parentId','roleId');
   
      })
      .catch((e: any) => {
        
      });
  }
  
  created() {
    this.getTreeData();
  }

  replaceFields: any = {
    children: "children",
    title: "roleName",
    key: "roleId",
    value: "roleId",
  };

  filterOption(inputVal: string, option: any) {
    return option.componentOptions.children[0].text.indexOf(inputVal) >= 0;
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
  /**
   * 选择后处理数据，返回后台
   */
  
  onChange(val: any) {
    this.$emit("change", val);
  }

  @Watch('selectData',{ deep: true, immediate: true })
  onChangeselectData(newVal:any){
    let result:any = [];
    if(newVal && newVal.length > 0){
      newVal.map((item:any) => {
        result.push(item['code']);
      });
     // this.selectedCode = [];
      this.getTreeData(result.join(','));
    }
    
  }

}

</script>
<style lang="less" scoped>
.apps-select {
  &__item {
    width: 100%;
  }
}
</style>

<style lang="less"></style>

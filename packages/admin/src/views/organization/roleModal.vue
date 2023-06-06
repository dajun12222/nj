<template>
  <div>
    <a-modal v-model="roleModalVisible" 
      :title="`角色：${nodeModal.name}`" 
      :maskClosable="false"
      :footer="null" 
      @cancel="handleOk"
      >
      <div class="flex">
        <div>
          <!-- <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-iconfonttubiao_kuaipintu"></use>
          </svg> -->
          <img src="../../assets/images/bgl.png" alt="" />
          <span>表示业务不关联帐套</span>
        </div>
        <div>
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-lianjie" />
          </svg>
          <span>表示业务关联帐套</span>
        </div>
      </div>
      <a-tree v-if="treeData.length > 0" 
        showIcon 
        defaultExpandAll 
        :treeData="treeData"
      >
        <span slot="title" slot-scope="node" class="role-title">
          <svg v-if="node.nodeType === '0'" class="icon" aria-hidden="true">
            <use xlink:href="#icon-wenjianjia" />
          </svg>
          <svg v-else-if="node.isRelated === 'true'" class="icon" aria-hidden="true">
            <use xlink:href="#icon-lianjie" />
          </svg>
          <img v-else-if="node.isRelated === 'false'" src="../../assets/images/bgl.png" alt="" />
          <!-- <svg class="icon" aria-hidden="true" v-else-if="node.isRelated === 'false'">
            <use xlink:href="#icon-iconfonttubiao_kuaipintu" />
          </svg> -->
          <span class="title" :title="node.title">{{ node.title }}</span>
        </span>
      </a-tree>
      <a-empty v-else />
    </a-modal>
  </div>
</template>
<script lang="ts">
// import OAuthApi from "@/apis/organization";
import OAuthApi from '@/apis/oauth';
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Modal, Tree, Icon,Empty } from '@h3/antd-vue';
@Component({
  name: 'RoleModal',
  components: {
    AModal:Modal,
    ATree:Tree,
    AEmpty:Empty,
    AIcon:Icon
  },
})
export default class RoleModal extends Vue {
  @Prop()
  roleModalVisible!: boolean;

  @Prop()
  nodeModal!: any;

  treeData:any = []


  @Watch('nodeModal')
  nodeModalChild() {
    OAuthApi.getSystemRoleTree({roleId:this.nodeModal.id}).then((res:any)=>{
      if(res.data && res.data.length){
        let list = this.initTree(res.data)
        this.treeData = this.changeData(list,null)
      }else{
        this.treeData = []
      }
    })
    
  }

  changeData(data: any, parents: any) {
    const result: any = [];
    data&&data.forEach((node: any) => {
      let obj: any = {
        id: node.id,
        value: node.id,
        name: node.name,
        title: `${node.name}`,
        nodeType: node.nodeType,              //节点类型  0目录 1节点
        isRelated: node.isRelated,            //是否关联业务
        key: node.id,
        // parentId:parents.parentId,
        children: null,
        scopedSlots: { title: "title" },
      };
      if (node.children && node.children.length) {
        obj.children = this.changeData(node.children, node);
      }
      result.push(obj);
    });
    return result;
  }

  initTree (treeNodes:any) {
    let cloneData = JSON.parse(JSON.stringify(treeNodes))  // 对源数据深度克隆
    return cloneData.filter(father=>{        
      let branchArr = cloneData.filter(child=>father.id === child.parentId)  //返回每一项的子级数组
      branchArr.length>0 ? father.children = branchArr : ''  //如果存在子级，则给父级添加一个children属性，并赋值
      return father.parentId === null;   //返回第一层
    });
  }
  
  handleOk(){
    this.treeData = []
    this.$emit('close')
  }
}
</script>
<style lang="less" scoped>
.icon {
  margin-right: 8px;
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
@import '../../assets/fonts/iconfont.css';
.flex{
  display: flex;
  >div{
    margin-right: 30px;
  }
}
img{
  width: 16px;
  margin: -5px 6px 0 0;
}
// @import "~styles/index.less";
</style>
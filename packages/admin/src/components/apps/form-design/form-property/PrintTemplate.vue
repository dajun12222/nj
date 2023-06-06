<template>
  <div>
      <a-modal
          v-model="isPublicPrintTemplate"
          class="modal"
          title="打印模板"
          okText="确定"
          cancelText="取消"
          @ok="sure"
          width="800px"
          :maskClosable="false"
          :keyboard="false"
      >
          <div class="attr-val  attr-print">
              <!-- <i titl="新增" @click="add" class="icon aufontAll h-icon-all-plus-o"></i> -->
              <a-button size="small" type="primary"  class="showAllButton" @click="add">新增</a-button>
          </div>
          <a-row class="elRowPrint">
              <a-col :span="24" class="elColPrint" v-for="(item,index) in printTemplateJson" :key="index">
                  <a-col :span="9">
                  
          
                    
                    <template  v-if="index !== 0">
                      <staff-selector style="width:80%;" :schemaCode="schemaCode" :keepDeptIds="keepDeptIds" v-model="item.unitId" :options="staffSelectorOpts" :params="{filterType : 'admin'}" :defineTypeFlow="oauthType === '1' ? 'defineTypeFlow' : ''"
                      :placeholder="oauthType === '1' ? '请选择账套' : '请选择组织或用户'"></staff-selector>
                    </template>
                  </a-col>
                  <a-col :span="9">
                      <a-input
                          class="input"
                          v-model="item.name"
                          maxlength="200"
                          :disabled="!IS_APP_MNG(index)"
                      />
                  </a-col>
                  <a-col :span="6" class="attr-print-action">
                      <i v-if="IS_APP_MNG(index)" titl="编辑" @click="goTemplate(item)" class="icon aufontAll h-icon-all-edit-square"></i>
                      <i titl="复制" @click="copy(item)" class="icon aufontAll h-icon-all-file-copy"></i>
                      <i v-if="IS_APP_MNG(index) && index !== 0" titl="删除" @click="del(item,index)" class="icon aufontAll h-icon-all-delete"></i>
                  </a-col>
              </a-col>
          </a-row>
      </a-modal>
  </div>
  </template>
  <script lang="ts">
  
  import Dialog from "@/components/apps/list-design/aside-addDialog.vue";
  import sheetFiters from "@/components/apps/list-design/display-filters.vue";
  import DataItemInput from "@/components/apps/model/data-title-input.vue";
  import BizModelsSelector from "@/components/global/biz-models-selector/index.vue";
  import DataModelSummary from "@/components/shared/data-item/summary.vue";
  import { formItemDirective } from "@/directives/form-validate";
  import router from "@/router/";
  import store from "@/store/";
  import { schema } from "cloudpivot/form";
  import { DataItemType } from "cloudpivot/form/schema";
  import rendererComponents from "cloudpivot/form/src/renderer/components/pc";
  import moment from "moment";
  import { Component, Inject, Prop, Vue, Watch } from "vue-property-decorator";
  import { i18n } from "../../../../config/i18n";
  import workflowApi from "@/apis/workflow";
  import StaffSelector from "cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
  import {
    ControlAttributeType,
    DropdownAttributeType,
    ModalAttributeType
  } from "./typings/form-attribute";
  import Bus from '@/utils/bus';
  import { namespace } from "vuex-class";
  import appsApi from "@/apis/apps";

  import {
  Modal,
  Row,
  Col,
  Select,
  Input,
  Button
} from '@h3/antd-vue';
  const UserModule = namespace("System/User");
  
  
  const Selector = rendererComponents.StaffSelector;
  
  let inputNum: number = 0;
  
  @Component({
    name: "PrintTemplate",
    components: {
      BizModelsSelector,
      DataModelSummary,
      DataItemInput,
      StaffSelector,
      AModal: Modal,
      ARow: Row,
      ACol: Col,
      ASelect: Select,
      ASelectOption: Select.Option,
      AInput: Input,
      AButton: Button
    },
    directives: {
      "form-item-validate": formItemDirective,
    },
  })
  export default class PrintTemplate extends Vue {
    @UserModule.State("loginedUserInfo") loginedUserInfo!: any;
    @Prop() dataItem!: any;
    @Prop() label!: string;
    @Prop() dom!: string;
    @Prop() field!: string;
    @Prop() type!: ControlAttributeType;
    @Prop() attrType!: ModalAttributeType;
    @Prop() value!: string;
    @Prop({ default: () => ({}) }) options!: any;
    @Prop() attributes!: any;
    @Prop() assistAttribute!: any;
    @Prop() formData!: any;
    @Prop() attributeItem!: any;
    @Prop() control?: any;
    @Prop() isShowPrintTemplate?: boolean;
    @Prop() oauthType?: string;
  
    valueText = this.value;
    isPublicPrintTemplate: boolean  = false;
    refControlKey = "";
    printTemplateJson:any = [
      {
        name: '',
        unitId: '',
        sheetCode: ''
      }
    ];
  
    keepDeptIds:string[] = [];
    staffSelectorOpts = {
      selectOrg: true,
      selectUser: false,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: '请选择组织或用户'
    };
    
    sheetDataItem:any = {};

    accountList: any = [];
    @Inject()
    getFormControls!: () => { [key: string]: schema.FormControl };
  
    @Inject()
    getControls!: Function;
  
  
    @Inject()
    getControl!: () => schema.FormTabs;
  
    
      @Watch('isShowPrintTemplate')
      onChangeIsShowPrintTemplate(newVal:boolean){
        this.attributes.map((item) => {
  
          if(item.field === 'sheetData'){
            this.sheetDataItem = item;
           // let printTemplateJson = JSON.parse(item.value.printTemplateJson);
            //this.printTemplateJson = printTemplateJson;
          }
        })
       
        
          this.isPublicPrintTemplate = newVal;
      }
      @Watch('isPublicPrintTemplate')
      onChangeIsPublicPrintTemplate(newVal:boolean){
          if(newVal){
            this.getList();
          }
          if(!newVal){
              this.$emit('changeShowPrintTemplate',false);
          }
      }
    async getList(){
      let { bizSchemaCode, sheetCode } = this.$route.params;
      let res:any = await appsApi.printGet({
        'schemaCode': bizSchemaCode,
        'sheetCode': sheetCode,
      });
      if(res.errcode === 0 && res.data && res.data.length > 0){
   
        this.printTemplateJson = JSON.parse(res.data);
      }else{
        this.printTemplateJson = [];
      }
    }
    async saveList(){
      let { bizSchemaCode, sheetCode } = this.$route.params;
      let res:any = await appsApi.printSave({
        'schemaCode': bizSchemaCode,
        'sheetCode': sheetCode,
        'printJson': JSON.stringify(this.printTemplateJson)
      });
      if(res.errcode === 0){
        this.$message.success('保存成功')
      }else{
        this.$message.error('保存失败')
      }
    }
    async mounted() {
      
      
    }
    @Watch("oauthType", {
      immediate: true,
    })
    watchOauthType(newVal:any) {
      if(this.field === 'print' && newVal === '1'){
        this.getAcoountList();
      }
    }
    get schemaCode(){
      return this.$route && this.$route.params && this.$route.params.bizSchemaCode;
    }

    async getAcoountList(){
      const { bizSchemaCode, workflowCode } = this.$route.params;
      //let bizSchemaCode = 'zgnjdszt';
      let res:any = await workflowApi.getFlowAccount({ schemaCode: bizSchemaCode });
      if(res.errcode === 0){
        this.accountList = res.data;
      }else{
        this.accountList = [];
      }
    }
    add(){
      if(this.printTemplateJson.length >= 10){
        this.$message.error('最多创建10个模板')
        return;
      }
      this.printTemplateJson.push({
        name: '',
        unitId: '',
        sheetCode: 'cs_print' + '_' + this.randomNum() + '_' + this.randomNum(),
      })
    }
    copy(item){
      if(this.printTemplateJson.length >= 10){
        this.$message.error('最多创建10个模板')
        return;
      }
      this.printTemplateJson.push({
        name: item['name'],
        unitId: item['unitId'],
        sheetCode: 'cs_print' + '_' + this.randomNum() + '_' + this.randomNum(),
      })
    }
    goTemplate(item){
     let status =  this.save();
     if(!status) return;
      this.$router.push({
          name: "print-template",
          params: {
              printCode: item['sheetCode'],
              version: 1,
          },
          query: {
            isNew: 1
          }
      } as any).catch((err: any) => {err});
      
    }
    del(item,index){
      if(this.printTemplateJson.length < 2){
        this.$message.error('最少保留一个模板')
        return;
      }
      this.printTemplateJson.splice(index,1);
    }
    sure(){
      this.save();
      
    }
    save(){
      const self = this;
      for (let i = 0; i < this.printTemplateJson.length; i++) {
        
        if(this.isAppMin){
          if(this.isEmpty(this.printTemplateJson[i].unitId) && i > 0){
            this.$message.error('第'+ (i+1) + '行组织或账套必填');
            return false;
          }
        }else{
          if(this.printTemplateJson[i].name.indexOf('_print') > -1 && this.isEmpty(this.printTemplateJson[i].unitId) && i > 0){
            this.$message.error('第'+ (i+1) + '行组织或账套必填');
            return false;
          }
        }
        if(!this.printTemplateJson[i].name){
          this.$message.error('第'+ (i+1) + '名称必填');
          return false;
        }
        
        
      }
      this.saveList();
      this.$emit('changeShowPrintTemplate',false);
      //self.$emit("change", 'printTemplateJson', JSON.stringify(this.printTemplateJson));
      // setTimeout(() => {
      //   Bus.$emit('save');
      // },100)
      return true;
    }
    isEmpty(obj:any){
      if(!obj){
        return true;
      }
      if(obj && obj.length < 1){
        return true;
      }
      return false;
    }
    randomNum () {
      let arr = [1, 2, 3] // 保证六位随机码包含数字+大写字母+小写字母
      let code = ''
      function getRandom (min, max) {
        return Math.round(Math.random() * (max - min) + min)
      }
      function randomsort (a, b) {
        return Math.random() > 0.5 ? -1 : 1
        // 用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
      }
      for (let i = 0; i < 3; i++) {
        arr.push(getRandom(1, 3)) // 补成六位
      }
      arr.sort(randomsort) // 打乱数组
      for (let i = 0; i < 6; i++) {
        let type = arr[i]
        switch (type) {
          case 1:
            code += String.fromCharCode(getRandom(48, 57)) // 数字
            break
          case 2:
            code += String.fromCharCode(getRandom(65, 90)) // 大写字母
            break
          case 3:
            code += String.fromCharCode(getRandom(97, 122)) // 小写字母
            break
        }
      }
      return code;
    }
        
    IS_APP_MNG(index:number){
      let status = true;
      if(index === 0 && this.loginedUserInfo.permissions.includes('APP_MNG')){
        status = false;
      }
      return status;
    }
    //判断是否为子管理员
    get isAppMin(){
      let status = false;
      let userStr = window.sessionStorage.getItem("user");
      let str = '';
      if(userStr && JSON.parse(userStr)){
          let user = JSON.parse(userStr)
          //permissions === ['APP_MNG']
          //findIndex
          
          if(user.permissions && user.permissions.length > 0){
            let index = user.permissions.findIndex((item) => {
              return item === 'APP_MNG';
            });
            status = index > -1 ? true : false;
          }
      }
      return status;
    }
    created() {
      
    }
  }
  </script>
  <style lang='less' scoped>
  .templateFile {
    color: #17BC94;
  }
  
  .templateFileUpkoad {
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px 0;
    box-sizing: border-box;
    height: 30px;
    width: 100px;
  }
  
  
  .attr-print {
  display: flex;
  //justify-content: flex-end;
  border-left: 0;
  padding-right: 10px;
  padding-top: 2px;
  margin-bottom: 10px;
  .attr-print-switch {
      width: auto;
      border-radius: 100px;
      margin-top: 2px;
      margin-left: 16px;
  }
  i {
      width: auto;
      cursor: pointer;
  }
  }
     
    
    .elRowPrint {
      width: 100%;
      max-height: 360px;
      overflow-y: auto;
      .elColPrint {
        padding: 2px 8px;
        margin-bottom: 4px;
      }
      .attr-print-action {
          display: flex;
          justify-content: center;
          align-items: center;
        i {
          display: block;
          margin-left: 3px;
          margin-right: 3px;
          cursor: pointer;
        }
      }
    }
    /deep/ .task-select {
      width: 80%;
    }
  </style>
  
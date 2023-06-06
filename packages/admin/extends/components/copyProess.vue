<template>
<a-modal
    v-model="isPublishModal"
    class="publish-modal"
    title="复制流程"
    okText="确定"
    cancelText="取消"
    :maskClosable="false"
    :keyboard="false"
    width="1000px"
    @ok="sure"
>
    <a-row>
        <a-col v-for="(item,index) in modulem" :key="index" :span="24">
            <a-col :span="10" class="elCol">
                <label>选择流程:</label>
                <a-select v-model="item.oriWorkflowCode" style="width:100%;">
                    <a-select-option
                        v-for="(t) in workflowList"
                        :key="t.workflowCode"
                        :value="t.workflowCode"
                    >{{ t.workflowName }}</a-select-option>
                </a-select>
            </a-col>
            <a-col :span="7" class="elCol">
                <label>模板编码:</label>
                <a-input
                v-model="item.destWorkflowCode"
                :placeholder="$t('languages.Apps.FormDesignPage.Placeholder.InputOptionName')"
                class="input"
                maxlength="200"
                @change="inputChange(index)"
              />
            </a-col>
            <a-col :span="7" class="elCol">
                <label>模板名称:</label>
                <a-input
                v-model="item.destWorkflowName"
                :placeholder="$t('languages.Apps.FormDesignPage.Placeholder.InputOptionName')"
                class="input"
                maxlength="200"
                @change="inputChange(index)"
              />
            </a-col>
        </a-col>
    </a-row>
</a-modal>
</template>
<script lang="ts">

import { Component, Vue, Watch,Prop } from 'vue-property-decorator';
import api from '../api';
import { utils } from 'cloudpivot/common'; 
import {
  Modal,
  Row,
  Col,
  Select,
  Input,
} from '@h3/antd-vue';
interface modulemArr {
    destWorkflowCode: string;
    destWorkflowName: string;
    oriWorkflowCode: string;
}
@Component({
  name: 'copyProess',
  components: {
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    AInput: Input,
  }
})

export default class CopyProess extends Vue {
    workflowList: any = [];

    modulem: modulemArr[] = [
        {
            destWorkflowCode: '',
            destWorkflowName: '',
            oriWorkflowCode: '',

        }
    ];

    @Prop({ default: false }) value?:boolean;

    @Watch('value')
    onChangeValue(newVal:any){
        if(newVal){
            this.isPublishModal = newVal;
            let obj = {
                destWorkflowCode: '',
                destWorkflowName: '',
                oriWorkflowCode: '',
            }
            this.modulem.splice(0,1,obj);
            this.getCopyProessFn();
        }
    }

    isPublishModal:boolean = false;

    @Watch('isPublishModal')
    onChangeIsPublishModal(newVal:any){
        if(!newVal){
            this.$emit('input',false);
        }
    }

    created(){
        //getCopyProess
        
    }

    mounted(){
        
    }

    async getCopyProessFn(){
       // console.log(this.$route.params.bizSchemaCode);
        let res:any = await api.getCopyProess({ 'schemaCode': this.$route.params.bizSchemaCode });
        if(res.errcode === 0){
            this.workflowList = res.data;
        }
    }

    inputChange(){}

    async sure(){
        
        let params = {
            schemaCode: this.$route.params.bizSchemaCode,
            oriWorkflowCode: this.modulem[0]['oriWorkflowCode'],
            destWorkflowCode: this.modulem[0]['destWorkflowCode'],
            destWorkflowName: this.modulem[0]['destWorkflowName'],
        }
        if(!params.oriWorkflowCode){
            this.$message.error('请选择需要复制的流程');
            return;
        }
        if(!params.destWorkflowCode){
            this.$message.error('请填写流程编码');
            return;
        }
        if(!params.destWorkflowName){
            this.$message.error('请填写流程名称');
            return;
        }
        let res:any = await api.saveCopyProess(params);
        if(res.errcode === 0){
            this.$message.success('复制成功');        
            this.isPublishModal = false;
            setTimeout(() => {
                this.$router.push({
                    name: "workflowDesign",
                    params: {
                        workflowCode: params.destWorkflowCode
                    }
                }).catch((err: any) => {err});
                //window.location.reload();
            },2000)
            
        }else{
            this.$message.error(res.errmsg);
        }
        this.$emit('getWorkFlowMenu')
    }

    add(){
        this.modulem.push({
            destWorkflowCode: '',
            destWorkflowName: '',
            oriWorkflowCode: '',
        });
    }
    
    del(index:number){
        if(this.modulem.length < 2){
            this.$message.destroy();
            this.$message.error('最少需要保留一个流程');
            
            return;
        }
        this.modulem.splice(index,1);
    }
    
}
</script>


<style lang="less" scoped>
.elCol {
    padding: 12px;
}
.operation {
    
    i {
        margin-left: 10px;
        cursor: point;
    }
}
/deep/ .ant-modal-body {
    max-height: 400px;
    overflow-y: scroll;
}
</style>

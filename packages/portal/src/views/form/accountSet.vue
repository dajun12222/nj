<template>
  <div class="accountSet">
    <a-modal
    v-model="visible"
    title="提示"
    :maskClosable="false"
    :keyboard="false"
    :closable="false"
    :destroyOnClose="true"
    wrapClassName="form-btn-modal"
  
  
  >
    <template #footer>
        <a-button key="submit" type="primary"  @click="ok">确定</a-button>
      </template>
    <div class="dept__label">{{ $t('cloudpivot.form.runtime.modal.selectOrg') }}</div>
      <div class="field__control" style="max-height:194px;overflow:auto">

        <a-radio-group v-model="id">
          <a-radio
            v-for="dept in options"
            :key="dept.id"
            :value="dept.id"
          >{{ dept.name }}</a-radio>
        </a-radio-group>

      </div>
  </a-modal>

    
    
  </div>
</template>


<script lang="ts">

import { externalLinkApi } from 'cloudpivot/api';
import { Button, Checkbox, Dropdown, Icon, Menu,Modal,Radio } from '@h3/antd-vue';

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';





@Component({
  name: 'AccountSet',
  components: {
    AModal: Modal,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    AButton: Button
  },
})
export default class AccountSet extends Vue {
  @Prop({
    default : ''
  })
  UserAccountData ?: string
  id:string = '';
  
  options:any = [];
    visible:boolean = true;
   @Watch('UserAccountData')
   onChangeUserAccountData(newVal){
    let option  = JSON.parse(newVal);
    if(option && option.length > 0){
      this.id = option[0]['id'];
    }
    this.options = option;
    
   } 
   ok(){
    this.$emit('sure',this.id);
    this.visible = false;
   }
}
</script>



<style lang="less" scoped>
/deep/.ant-radio-wrapper{
  display: block;
  margin-bottom:8px;
}

.radio-wrap{
  /deep/.ant-radio-wrapper{
    display: inline-block;
    margin-right: 8px;
  }
}

.select-wrap{
  width: 100% !important;
}

.row {
  margin-bottom: 20px;
  &>div {
    line-height: 32px;
  }
}

.trust-tips{
  width: 100%;
  background: #FFFBE6;
  border: 1px solid #FFE58F;
  border-radius: 4px;
  padding: 8px 16px;
  color: rgba(0,0,0,0.85);
  i{
    font-size: 14px;
    color: #FAAD14;
    margin-right: 8px;
  }
}
.dept__label{
  font-size: 16px;
  font-weight: 500;
  line-height: 40px;
}
</style>

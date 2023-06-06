<template>
  <div class="cBMoadalList">
    <!-- <a-table 
      :columns="cusColumns" 
      :data-source="dataSource"
      :pagination="false"
    /> -->
    <list-selector-custom
      :columns="cusColumns"
      :listCode="viewCode"
      :schemaCode="schemaCode"
    />
  </div>
</template>

<script lang="ts">
import {
  Input,
  Radio,
  Select,
  Button,
  Row,
  Col,
  Icon,
  Tabs,
  Tooltip,
  Form,
} from '@h3/antd-vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import listCustomTemplate from './listCustomTemplate.vue';
import listSelectorCustom from './list-selector-custom.vue';
import { listApi, formApi, listParams } from '../../../../api';

@Component({
  name: 'CustomButtonModal',
  components: {
    AInput: Input,
    ATextarea: Input.TextArea,
    ARadio: Radio,
    ARadioButton: Radio.Button,
    ARadioGroup: Radio.Group,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button,
    ARow: Row,
    ACol: Col,
    AIcon: Icon,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ATooltip: Tooltip,
    AForm: Form,
    AFormItem: Form.Item,
    listCustomTemplate,
    listSelectorCustom,
  },
})
export default class CustomButtonModal extends Vue {
  @Prop() schemaCode: string;

  @Prop() viewCode: string;

  cusColumns: any = [];

  dataSource: any = [];

  async moreClick(val: any) {
    this.$emit('moreClick', val);
  }

  async created() {
    const addParams: any = {
      code: this.schemaCode,
      schemaCode: this.schemaCode,
      source: 1,
    };
    const addRes = await listApi.getListConfigData(addParams);
    if (addRes.data && addRes.data.queryColumns) {
      this.cusColumns = addRes.data.queryColumns;
      for (const cus of this.cusColumns) {
        cus.key = cus.propertyCode;
        cus.dataIndex = cus.propertyCode;
        cus.title = cus.name;
      }
    }

    // let formParams: any = {
    //   filters: [],
    //   mobile: false,
    //   page: 0,
    //   queryCode: this.schemaCode,
    //   queryVersion: 1,
    //   schemaCode: this.schemaCode,
    //   size: 20,
    //   queryCondition: [],
    // };
    // const formRes = await listApi.getQueryList(formParams);
    // if (formRes.data && formRes.data.content.length > 0) {
    //   for (let datas of formRes.data.content) {
    //     this.dataSource.push(datas.data)
    //   }
    //   for (let i of this.dataSource) {
    //     for (let y in i) {
    //       if (Array.isArray(i[y])) {
    //        i[y] = i[y][0].name
    //       }
    //     }
    //   }
    // }
  }
}
</script>
<style lang="less" scoped>
.cBMoadalList .list-selector {
  height: 66vh;
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="setNameCon">
    <div class="setNameConTip">
      <a-icon type="info-circle" theme="filled" class="check-item-icon" />
      <span>
        注：自定义后，操作按钮文案将按照设置的显示，功能效果不会改变
      </span>
    </div>
    <div class="setNameConList">
      <a-row type="flex" class="RowStyle" style="margin-bottom: 7px">
        <a-col :span="8"> 默认名称 </a-col>
        <a-col :span="16"> 自定义名称 </a-col>
      </a-row>
      <a-row
        v-for="item in btnConfigList"
        :key="item.code"
        type="flex"
        class="RowStyle"
      >
        <template
          v-if="
            (item.code !== 'agree' && item.code !== 'rejects') ||
            (!(item.code !== 'agree' && item.code !== 'rejects') && showBtn)
          "
        >
          <a-col :span="8"> {{ item.name }} </a-col>
          <a-col :span="16">
            <a-input
              v-model="item.displayName"
              :maxLength="item.maxLength"
              class="cb-modal-input"
              :placeholder="`默认为：${item.name}`"
              @change="inputFocus(item.code, item.displayName)"
            />
          </a-col>
        </template>
      </a-row>
    </div>
  </div>
</template>
<script lang="ts">
import {
  Select,
  Checkbox,
  Tooltip,
  Icon,
  Modal,
  Row,
  Col,
  Input,
} from '@h3/antd-vue';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

@Component({
  name: 'SetNameModal',
  components: {
    ARow: Row,
    ACol: Col,
    AInput: Input,
    AIcon: Icon,
  },
})
export default class SetNameModal extends Vue {
  @Prop({ default: [] }) btnConfigList: any[];

  @Prop({ default: true }) showBtn!: boolean;

  inputFocus(code: string, name: string) {
    const num: number = this.isChinese(name);
    for (const con of this.btnConfigList) {
      if (con.code === code) {
        con.maxLength = num;
        break;
      }
    }
  }

  //判断是否有中文
  isChinese(str: string) {
    var filter = /[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/;
    if (filter.test(str)) {
      return 10;
    } else {
      return 20;
    }
  }

  created() {
    if (this.btnConfigList.length > 0) {
      for (const con of this.btnConfigList) {
        con.maxLength = 10;
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.setNameCon {
  width: 100%;
  color: @nav-font-color;
  .setNameConTip {
    width: 100%;
    height: 40px;
    background: #f0f7ff;
    border: 1px solid #a3cbff;
    padding-left: 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    .check-item-icon {
      color: #2970ff;
      margin-right: 8px;
      margin-top: 2px;
    }
  }
  .setNameConList {
    width: 100%;
    padding: 17px 0 0 17px;
    .RowStyle {
      width: 100%;
      display: flex;
      align-items: center;
      margin: 4px 4px 0 0;
    }
  }
}
</style>

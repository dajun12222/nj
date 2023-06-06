<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div v-if="!disable" class="model-card">
    <div class="model-name">
      {{ isCur ? '当前模型' : modelName }}
    </div>
    <div class="operate">
      <a-popover
        trigger="click"
        :getPopupContainer="
          (triggerNode) => {
            return triggerNode.parentNode;
          }
        "
        @visibleChange="visibleChange"
      >
        <template slot="content">
          <setCurrentDataItem
            maxHeight="300px"
            wrapperWidth="580px"
            :data="dataItems"
            :checkedDataItemList="checkedList"
            @checkedListChange="checkedListChange"
          />
        </template>
        <a-icon type="setting" style="cursor: pointer" />
        <span style="cursor: pointer">{{
          checkedList.length > 0 ? '查看字段' : '选择字段'
        }}</span>
      </a-popover>
    </div>
    <a-icon
      v-if="expanded !== undefined"
      :type="expanded ? 'minus' : 'plus'"
      class="expanded"
      @click="expand"
    />
  </div>
  <div v-else-if="!tips" class="model-card disable">
    <div class="model-name" :title="modelName">
      {{ isCur ? '当前模型' : modelName }}
    </div>
    <div class="operate">
      123
      <div class="grey-block"></div>
    </div>
  </div>
  <div v-else class="model-card tips">
    <div class="model-name" :title="modelName">
      {{ isCur ? '当前模型' : modelName }}
    </div>
    <div class="operate">模型重复</div>
  </div>
</template>

<script lang="ts">
import { Icon, Popover } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import setCurrentDataItem from './setCurrentDataItem.vue';

@Component({
  name: 'ModelCard',
  components: {
    APopover: Popover,
    setCurrentDataItem,
    AIcon: Icon,
  },
})
export default class ModelCard extends Vue {
  @Prop() modelName!: any;

  @Prop() isCur!: boolean;

  @Prop() expanded!: any;

  @Prop() dataItems!: any[];

  @Prop() checkedList!: any[];

  @Prop({ default: false }) disable: any;

  @Prop() tips!: any;

  expand() {
    this.$emit('expand');
  }

  checkedListChange(checkedList) {
    this.$emit('checkedListChange', checkedList);
  }

  visibleChange(visible) {
    if (visible) {
      this.$emit('popoverVisible');
    } else {
      this.$emit('updateDataSource');
    }
  }
}
</script>

<style lang="less">
.model-card {
  width: 197px;
  height: 104px;
  background: #ffffff;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.14);
  border-radius: 4px;
  position: relative;
  display: inline-block;
  margin: 21px 16px 36px 16px;
  text-align: left;
  &.disable {
    .model-name {
      background: #d8d8d8;
    }
    .operate {
      border-radius: 1px;
      opacity: 0.31;
      width: 157px;
      height: 18px;
      padding-left: 20px;
      position: relative;
      .grey-block {
        background: #d8d8d8;
        height: 18px;
        width: 157px;
        margin: 17px 20px 19px 20px;
        position: absolute;
        top: 0;
        left: 0;
      }
    }
  }
  &.tips {
    .model-name {
      background: #faae15;
    }
    .operate {
      text-align: center;
      color: #d8d8d8;
      padding-left: unset;
    }
  }
  .model-name {
    width: 197px;
    height: 50px;
    background: @primary-color;
    border-radius: 4px 4px 0px 0px;
    line-height: 50px;
    font-size: 14px;
    font-weight: 400;
    color: #ffffff;
    padding-left: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .operate {
    font-weight: 400;
    color: @primary-color;
    line-height: 50px;
    padding-left: 13px;
    i {
      margin-right: 5px;
    }
  }
  .expanded {
    position: absolute;
    display: flex;
    align-items: center;
    text-align: center;
    padding-left: 4px;
    color: @primary-color;
    top: 92px;
    font-size: 12px;
    line-height: 14px;
    border-radius: 50%;
    left: 90px;
    width: 20px;
    height: 20px;
    background: #f0fffb;
    box-shadow: 0px 4px 11px 0px rgb(187 187 187 / 50%);
  }
}
</style>

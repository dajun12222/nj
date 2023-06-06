<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="mock-header">
    <div>
      <div class="header-left">
        <a v-if="showBack" class="aback" @click="back">返回</a>

        <div v-if="nodes.length > 0" class="header-dropdown">
          <a-dropdown :trigger="['click']">
            <div>
              <span>{{ activeNodes }}</span> <a-icon type="down" />
            </div>
            <a-menu slot="overlay">
              <a-menu-item
                v-for="(node, index) in nodes"
                :key="node.activityCode"
                :class="{ 'a-menu-item-active': node.selected }"
                class="node-switch-menu-item"
              >
                <a href="javascript:;" @click="nodesSwitch(index)">{{
                  node.activityName
                }}</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import * as OrgApi from '@/apis/organization';
import { Dropdown, Icon, Menu } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'form-detail-header',
  components: {
    ADropdown: Dropdown,
    AIcon: Icon,
    AMenu: Menu,
    AMenuItem: Menu.Item,
  },
})
export default class FormDetailHeader extends Vue {
  @Prop() nodes!: Array<any>;

  async getUserInfo() {
    const res = await OrgApi.getUserInfoLogin();
    if (res.errcode === 0) {
      const info: any = res.data;
      sessionStorage.setItem('user', JSON.stringify(info));
    }
  }

  back() {
    const url = this.$route.query.return as string;
    if (url) {
      this.$router
        .push({
          path: url,
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      this.$router.go(-1);
    }
  }

  get showBack() {
    return (
      !(this.$route.query as any).firstPage &&
      !(this.$route.query as any).hideBtn
    );
  }

  get activeNodes() {
    const theNode = this.nodes.find((res) => res.selected);
    if (theNode) {
      return theNode.activityName;
    }
    return '';
  }

  nodesSwitch(index: number) {
    if (this.nodes[index].selected) {
      return;
    }
    let theNode = '';
    this.nodes.forEach((res, idx) => {
      if (idx === index) {
        res.selected = true;
        theNode = res.activityCode;
      } else {
        res.selected = false;
      }
    });
    this.nodes = this.nodes.slice();

    this.$emit('nodesSwitch', theNode);
  }

  created() {
    const user = sessionStorage.getItem('user');
    if (!user) {
      this.getUserInfo();
    }
  }
}
</script>

<style lang="less" scoped>
.mock-header {
  padding: 0 @base4-padding-lg!important;
  display: flex;
  height: 64px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(30, 85, 255, 0.1);
  z-index: 99;
  .header-left {
    display: flex;
    align-items: center;
  }
  .header-dropdown {
    display: flex;
    align-items: center;
    margin-left: 16px;
    padding-left: 16px;
    height: 32px;
    border-left: 1px solid rgba(217, 217, 217, 1);
    .ant-dropdown-trigger {
      & > span {
        display: inline-block;
        max-width: 140px;
      }
    }
  }

  & > div:first-child {
    flex-grow: 1;
    display: flex;
    justify-content: space-between;

    a.aback {
      font-size: 18px;
      margin-right: 8px;
      color: @primary-color;
      cursor: pointer;
    }
  }
}
</style>

<style lang="less">
.node-switch-menu-item {
  width: 180px;
  &.a-menu-item-active {
    background: rgba(240, 247, 255, 1);
    font-weight: 600;
  }
}
</style>

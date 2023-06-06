<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="app-item">
    <div v-resize.east class="app-menu">
      <div class="menu-tree">
        <ul class="menu ant-menu ant-menu-inline ant-menu-root ant-menu-light">
          <li
            class="sub-menu ant-menu-submenu ant-menu-submenu-inline"
            :class="{
              'ant-menu-submenu-selected': $route.name === 'appcenter',
            }"
            @click="onClickFolder('appcenter')"
          >
            <div class="ant-menu-submenu-title all">
              <div class="menu-title">
                <i class="icon aufontAll h-icon-all-same-size"></i>
                <span>应用</span>
              </div>
            </div>
          </li>
          <li
            class="sub-menu ant-menu-submenu ant-menu-submenu-inline"
            :class="{ 'ant-menu-submenu-selected': $route.name === 'recycle' }"
            @click="onClickFolder('recycle')"
          >
            <div class="ant-menu-submenu-title all">
              <div class="menu-title">
                <i class="icon aufontAll h-icon-all-same-size"></i>
                <span>回收站</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="app-router-wrap">
      <router-view />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({
  name: 'AppTree',
})
export default class AppTree extends Vue {
  onClickFolder(item: string) {
    this.$router.push({ path: item });
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.app-menu {
  width: 200px;
  padding-right: 1px;
  height: calc(100vh - 64px);
  float: left;
  box-shadow: 1px 0px 0px 0px #e8e8e8;
  position: relative;
  z-index: 2;
  .new-menu {
    height: 40px;
    background: #f2f2f2;
    font-size: 14px;
    line-height: 40px;
    width: calc(100% + 1px);
    cursor: pointer;
    & > span {
      color: @nav-font-color;
    }
    & > i {
      font-size: 12px;
      margin-right: 7px;
    }
  }
  .menu-tree {
    overflow: auto;
    height: calc(100vh - 64px - 24px);
    .menu {
      border: none;
      i.setting {
        position: absolute;
        z-index: 9;
        top: 0px;
        right: 29px;
        width: 14px;
        height: 14px;
        margin: 0;
        font-size: 14px !important;
        visibility: hidden;
        &:hover {
          color: @primary-color;
        }
      }
      .sub-menu.ant-menu-submenu-selected {
        .ant-menu-submenu-title {
          background: @sub-bg-color;
          color: @primary-color;
          .menu-title {
            padding-right: 38px !important;
          }
          .setting {
            visibility: visible;
            color: @nav-font-color;
            &:hover {
              color: @primary-color;
            }
          }
          &:hover {
            color: @primary-color !important;
          }
          &:after {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            border-left: 4px solid @primary-color;
          }
        }
      }
      .sub-menu {
        cursor: pointer;
        position: relative;
        .ant-menu-submenu-title {
          padding: 0px !important;
          width: 100%;
          margin-top: 8px;
          .menu-title {
            padding: 0px 16px !important;
            margin-right: 25px;
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            i {
              font-size: 14px;
              margin-right: 8px;
            }
          }
          &:hover {
            color: @nav-font-color;
            background: @sub-bg-color;
            .menu-title {
              padding-right: 38px !important;
            }
            .setting {
              visibility: visible;
            }
          }
          & > .ant-menu-submenu-arrow {
            margin-top: 2px;
            &:before {
              background: linear-gradient(to right, #000, #000);
            }
            &:after {
              background: linear-gradient(to right, #000, #000);
            }
          }
        }
        .ant-menu-submenu-title.all {
          margin-bottom: 0;
        }
      }
      li.ant-menu-item-selected {
        background: @sub-bg-color;
        color: @primary-color;
        padding-right: 46px;
        &:hover {
          color: @primary-color;
        }
        &:after {
          border-left: 4px solid @primary-color;
        }
        .setting {
          visibility: visible;
          color: @nav-font-color;
          &:hover {
            color: @primary-color;
          }
        }
      }
      .ant-menu-item {
        width: 100%;
        padding-left: 38px !important;
        text-align: left;
        overflow: hidden;
        margin-top: 8px;
        text-overflow: ellipsis;
        padding-right: 16px;
        .setting {
          right: 6px;
        }
        i {
          font-size: 14px;
          margin-right: 10px;
        }
        &:hover {
          color: @nav-font-color;
          background: @sub-bg-color;
          padding-right: 46px;
          .setting {
            visibility: visible;
          }
        }
        &:after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          border-right: none;
        }
      }
      .show.ant-menu-item {
        padding-right: 46px;
      }
      li.root-item {
        padding-left: 16px !important;
      }
    }
  }
}
.app-router-wrap {
  height: calc(100vh - 64px);
  overflow: hidden;
}
</style>

<!--
 * @Descripttion: 流程列表
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-02 10:59:02
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-01 14:29:52
-->
<template>
  <div class="workflow-item-wrap">
    <a-collapse v-model="activeKey" @change="change">
      <a-collapse-panel
        v-for="el in isData"
        :key="el.id"
        :header="el[0].appGroupName"
      >
        <div
          v-for="(item, index2) in el"
          :key="index2"
          class="workflow-item-apps"
        >
          <div class="workflow-item-app-new">
            <div class="workflow-item-app-title">
              <div class="app-name">
                {{ item.appName }} ({{ item.size || 0 }})
              </div>
              <div class="more" @click="showMoreData(item)">
                {{ $t('cloudpivot.application.pc.moreData') }}
              </div>
            </div>
            <div class="workflow-item-app-content">
              <template v-for="(itemList, index1) in item.displayItem">
                <div :key="index1" class="workflow-item-app-content-item">
                  <template v-for="(model, key) in itemList">
                    <div
                      :key="key"
                      class="content-item"
                      @click.stop="openDetail(model)"
                    >
                      <div
                        class="content-icon"
                        :class="`color-${getColor(model.code)}`"
                      >
                        <i class="icon aufontAll" :class="model.icon"></i>
                      </div>
                      <div
                        class="content-name"
                        :title="
                          isChinese
                            ? model.name
                            : (model.name_i18n && model.name_i18n.en) ||
                              model.name
                        "
                      >
                        {{
                          isChinese
                            ? model.name
                            : (model.name_i18n && model.name_i18n.en) ||
                              model.name
                        }}
                      </div>
                      <div
                        class="group-li-collect"
                        @click.stop="favoriteWorkflow(model)"
                      >
                        <a-tooltip
                          placement="bottom"
                          :destroyTooltipOnHide="true"
                          :arrowPointAtCenter="true"
                          :getPopupContainer="getPopupContainer"
                          @visibleChange="isChange"
                        >
                          <template slot="title">
                            {{
                              model.favorites
                                ? $t(
                                    'cloudpivot.application.pc.cancelCollection',
                                  )
                                : $t(
                                    'cloudpivot.application.pc.addToCollection',
                                  )
                            }}
                          </template>
                          <i
                            v-show="!model.favorites && !model.active"
                            class="icon aufontAll h-icon-all-star1"
                            @mouseenter="iconChange(model, true)"
                          ></i>
                          <i
                            v-show="!model.favorites && model.active"
                            class="icon aufontAll h-icon-all-star-fill hover"
                            @mouseleave="iconChange(model, false)"
                          ></i>
                          <i
                            v-show="model.favorites"
                            class="icon aufontAll h-icon-all-star-fill"
                            :class="model.favorites ? 'active' : ''"
                          ></i>
                        </a-tooltip>
                      </div>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>

    <a-drawer
      :title="theApp"
      placement="right"
      :closeable="false"
      :visible="showMore"
      destroyOnClose
      wrapClassName="more-data-drawer"
      width="420"
      @close="closeDrawer"
    >
      <div class="data-box">
        <template v-for="(group, index) in moreDataList">
          <div :key="index" class="group-data">
            <div v-if="group.route" class="group-route" :title="group.route">
              {{ group.route }}
            </div>
            <div class="workflow-item-app-content">
              <template v-for="(itemList, index1) in group.dataList">
                <div :key="index1" class="workflow-item-app-content-item">
                  <template v-for="(model, index2) in itemList">
                    <div
                      :key="index2"
                      class="content-item"
                      @click.stop="openDetail(model)"
                    >
                      <div
                        class="content-icon"
                        :class="`color-${getColor(model.code)}`"
                      >
                        <i class="icon aufontAll" :class="model.icon"></i>
                      </div>
                      <div
                        class="content-name"
                        :title="
                          isChinese
                            ? model.name
                            : (model.name_i18n && model.name_i18n.en) ||
                              model.name
                        "
                      >
                        {{
                          isChinese
                            ? model.name
                            : (model.name_i18n && model.name_i18n.en) ||
                              model.name
                        }}
                      </div>
                      <div
                        class="group-li-collect"
                        @click.stop="favoriteWorkflow(model)"
                      >
                        <a-tooltip
                          placement="bottom"
                          :destroyTooltipOnHide="true"
                          :arrowPointAtCenter="true"
                          :getPopupContainer="getPopupContainer"
                          @visibleChange="isChange"
                        >
                          <template slot="title">
                            {{
                              model.favorites
                                ? $t(
                                    'cloudpivot.application.pc.cancelCollection',
                                  )
                                : $t(
                                    'cloudpivot.application.pc.addToCollection',
                                  )
                            }}
                          </template>
                          <i
                            v-show="!model.favorites && !model.active"
                            class="icon aufontAll h-icon-all-star1"
                            @mouseenter="iconChange(model, true)"
                          ></i>
                          <i
                            v-show="!model.favorites && model.active"
                            class="icon aufontAll h-icon-all-star-fill hover"
                            @mouseleave="iconChange(model, false)"
                          ></i>
                          <i
                            v-show="model.favorites"
                            class="icon aufontAll h-icon-all-star-fill"
                            :class="model.favorites ? 'active' : ''"
                          ></i>
                        </a-tooltip>
                      </div>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Collapse, Tooltip, Drawer } from '@h3/antd-vue';
import { initialInstanceApi } from '../../../../../../api';
import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams,
} from '../../../../../../api';

@Component({
  name: 'workflow-item',
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ATooltip: Tooltip,
    ADrawer: Drawer,
  },
})
export default class WorkflowItem extends Vue {
  @Prop({
    default: [],
  })
  isData?: any[];

  activeKey: string = '0';

  isShow: boolean = false;

  showMore: boolean = false;

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  iconChange(item, flag) {
    this.$set(item, 'active', flag);
  }

  change(key) {
    this.activeKey = key;
  }

  isChange(e) {
    this.isShow = e;
  }

  @Watch('isData')
  initData() {
    console.log(this.isData);
    this.isData &&
      this.isData.forEach((itemList: any) => {
        itemList.forEach((item: any) => {
          let index = 0;
          const displayItem: any[] = [[], [], [], []];
          item.dataList.forEach((i: any) => {
            if (i.type === 'BizModel') {
              if (index < 8) {
                displayItem[index % 4].push(i);
              }
              index++;
            }
            if (i.type === 'Folder') {
              i.dataList.forEach((j: any) => {
                if (index < 8) {
                  displayItem[index % 4].push(j);
                }
                index++;
              });
            }
          });
          item.displayItem = displayItem;
        });
      });
  }

  theApp: string = '';

  moreDataList: any[] = [];

  showMoreData(app) {
    console.log(app);
    this.moreDataList = [];
    this.theApp = `${app.appName} (${app.size || 0})`;
    const noGroupObj: any = {
      route: '',
    };
    const noGroupObjList: any[] = [[], [], []];
    let noGroupSize = 0;
    app.dataList.forEach((item: any) => {
      if (item.type === 'BizModel') {
        noGroupObjList[noGroupSize % 3].push(item);
        noGroupSize++;
      } else if (item.type === 'Folder') {
        if (
          item.fullPath_i18n &&
          typeof item.fullPath_i18n === 'string' &&
          /^(\{).*(\})$/.test(item.fullPath_i18n)
        ) {
          item.fullPath_i18n = JSON.parse(item.fullPath_i18n);
        }
        const groupObj: any = {
          route: this.isChinese
            ? item.fullPath
            : (item.fullPath_i18n && item.fullPath_i18n.en) || item.fullPath,
        };
        const groupObjList: any[] = [[], [], []];
        let index = 0;
        item.dataList.forEach((i: any) => {
          groupObjList[index % 3].push(i);
          index++;
        });
        groupObj.dataList = groupObjList;
        this.moreDataList.push(groupObj);
      } else {
        //Else Empty block statement
      }
    });
    noGroupObj.dataList = noGroupObjList;
    if (noGroupSize) {
      this.moreDataList.unshift(noGroupObj);
    }
    console.log(this.moreDataList);
    this.showMore = true;
  }

  getColor(code: string) {
    const charCode = code.substr(-8);
    let ascii = 0;
    for (let i = 0; i < charCode.length; i++) {
      ascii += charCode.charCodeAt(i);
    }
    return ascii % 8;
  }

  closeDrawer() {
    this.showMore = false;
  }

  getPopupContainer(trigger) {
    return trigger.parentElement;
  }

  /**
   * 发起流程
   */
  openDetail(obj) {
    this.$emit('openDetail', obj);
  }

  /**
   * 收藏操作
   */
  async favoriteWorkflow(item) {
    const cancelParams: workflowCenterParams.WorkflowParams = {
      workflowCode: item.code,
    };
    const setParams: workflowCenterParams.WorkflowParams = {
      workflowCode: item.code,
      appCode: item.appCode,
    };

    if (item.favorites) {
      const res = await workflowCenterApi.deleteFavoriteWorkflow(cancelParams);
      if (!res.errcode) {
        item.favorites = false;
        this.$emit('favoriteChange', { data: item, favorites: false });
      } else {
        this.$message.error(res.errmsg as any);
      }
    } else {
      const res = await workflowCenterApi.setFavoriteWorkflow(setParams);
      if (!res.errcode) {
        item.favorites = true;
        this.$emit('favoriteChange', { data: item, favorites: true });
      } else if (res.errcode === 201014) {
        this.$message.warning(
          this.$t('cloudpivot.flowCenter.pc.sevenFlowsIsMost') as string,
        );
      } else {
        this.$message.error(res.errmsg as any);
      }
    }
  }

  showGroup(el) {
    if (el.type !== 'Folder') {
      return;
    }
    initialInstanceApi.listMyWorkflowByFolderId(el.id, false).then((res) => {
      if (Array.isArray(res.data)) {
        this.$set(el, 'isShow', true);
        this.$set(el, 'children', res.data);
      }
    });
  }

  hideGroup(el) {
    // if(this.isShow)return;
    this.$set(el, 'isShow', false);
    this.$set(el, 'children', []);
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../../application/src/components/pc/style/custom-themes';
.workflow-item-wrap {
  .ant-collapse {
    // background-color: #fff;
    border: none;
    padding: 0 8px 32px 0;
    background: unset;
    .ant-collapse-item {
      margin-bottom: 24px;
      // padding-bottom: 32px;
      // border-bottom: 1px dashed #eee;
      border-bottom: unset;
      /deep/ .ant-collapse-header {
        font-size: 18px;
        font-weight: 700;
        color: #111218;
        padding: 0;
        padding-left: 22px;
        > .ant-collapse-arrow {
          left: 2px;
        }
      }
      /deep/ .ant-collapse-content {
        border-top: none;
        overflow: initial;
        background: unset;
      }
    }
  }

  .workflow-item-apps {
    width: 50%;
    min-width: 456px;
    &:nth-child(2n-1) {
      padding-right: 8px;
    }
    &:nth-child(2n) {
      padding-left: 8px;
    }
    .workflow-item-app-new {
      padding: 16px 9px 14px;
      min-height: 262px;
      min-width: 450px;
      background: #ffffff;
      border-radius: 2px;
      margin-top: 16px;
      .workflow-item-app-title {
        display: flex;
        justify-content: space-between;
        padding: 0 7px;
        .app-name {
          height: 24px;
          font-size: 16px;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 600;
          color: #111218;
          line-height: 24px;
        }
        .more {
          height: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(17, 18, 24, 0.5);
          line-height: 20px;
          cursor: pointer;
          &:hover {
            color: @highlightColor;
          }
        }
      }
      .workflow-item-app-content {
        margin-top: 12px;
        display: flex;
        justify-content: space-between;
        .workflow-item-app-content-item {
          display: flex;
          flex-flow: column;
          width: 108px;
          &:not(:first-child) {
            margin-left: 2px;
          }
          .content-item {
            width: 108px;
            height: 98px;
            background: #ffffff;
            position: relative;
            text-align: center;
            padding: 12px 8px;
            display: inline-block;
            &:hover {
              box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
              border-radius: 2px;
              cursor: pointer;
              > .group-li-collect > span {
                > i.icon.h-icon-all-star1,
                > i.icon.h-icon-all-star-fill {
                  display: inline-block;
                }
              }
              // .content-name{
              //   color: @highlightColor;
              // }
            }
            &:not(:first-child) {
              margin-top: 2px;
            }
            .content-icon {
              display: inline-block;
              width: 42px;
              height: 42px;
              line-height: 42px;
              border-radius: 50%;
              &.color-0 {
                background: #fff1f0;
                color: #f0353f;
              }
              &.color-1 {
                background: #fff6ed;
                color: #f66320;
              }
              &.color-2 {
                background: #fffbe6;
                color: #faad14;
              }
              &.color-3 {
                background: #f6ffed;
                color: #52c41a;
              }
              &.color-4 {
                background: #e6fff4;
                color: #00c293;
              }
              &.color-5 {
                background: #f0f7ff;
                color: #2970ff;
              }
              &.color-6 {
                background: #f9f0ff;
                color: #722ed1;
              }
              &.color-7 {
                background: #fff0f6;
                color: #f12d98;
              }
              > i.icon {
                font-size: 24px;
              }
            }
            .content-name {
              height: 22px;
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #111218;
              line-height: 22px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              margin-top: 10px;
            }
            .group-li-collect {
              position: absolute;
              width: 16px;
              height: 16px;
              top: 6px;
              right: 6px;
              line-height: 16px;
              > span {
                display: inline-block;
                width: 16px;
                height: 16px;
                line-height: 16px;
                text-align: center;
                i.icon {
                  font-size: 14px;
                  &.h-icon-all-star1 {
                    color: rgba(17, 18, 24, 0.5);
                    position: relative;
                    top: 1px;
                    display: none;
                    &:hover {
                      + .hover {
                        display: inline-block;
                      }
                    }
                  }
                  &.h-icon-all-star-fill {
                    color: rgba(17, 18, 24, 0.5);
                    display: none;
                    &.active {
                      color: #faad14;
                      display: inline-block;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  @media screen and (max-width: 1450px) {
    .workflow-item-apps {
      width: 100%;
      padding: 0 !important;
    }
  }
}

/deep/ .ant-collapse-content-box {
  padding: 0 0 0 0;
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}
/deep/ .ant-tooltip-inner {
  white-space: nowrap;
}
.group-list-placeholder {
  width: 100%;
  height: 4px;
  background-color: transparent;
}

.gruop-file {
  box-shadow: none;
  border: 1px solid transparent;
  &:hover {
    box-shadow: none !important;
    border-radius: 2px !important;
    border: 1px solid #d4d5d6;
  }
}
</style>
<style lang="less">
@import './../../../../../../application/src/components/pc/style/custom-themes';
.more-data-drawer {
  &.ant-drawer {
    z-index: 990;
  }
  .ant-drawer-title {
    height: 24px;
    font-size: 16px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #111218;
    line-height: 24px;
  }
  .ant-drawer-close {
    width: 56px;
    height: 56px;
    line-height: 56px;
    svg {
      display: none;
    }
    // height: 54px;
    // width: 54px;
    line-height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    i {
      // display: inline-block;
      width: 16px;
      height: 16px;
      font-family: 'aufontAll' !important;
      font-size: 16px;
      font-style: normal;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: rgba(17, 18, 24, 0.5);
      display: flex;
      align-items: center;
      &::after {
        content: '\e996';
      }
    }
  }
  .ant-drawer-body {
    height: calc(100% - 57px);
    overflow: hidden;
    padding: 24px 2px;
  }
  .data-box {
    height: 100%;
    overflow-y: scroll;
    padding-right: 16px;
    padding-left: 22px;
    .group-data {
      &:not(:first-child) {
        margin-top: 24px;
      }
      .group-route {
        margin-bottom: 8px;
        height: 20px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(17, 18, 24, 0.5);
        line-height: 20px;
      }
      .workflow-item-app-content {
        display: flex;
        justify-content: space-between;
        .workflow-item-app-content-item {
          display: flex;
          flex-flow: column;
          width: 108px;
          &:not(:first-child) {
            margin-left: 2px;
          }
          .content-item {
            width: 108px;
            height: 98px;
            background: #ffffff;
            position: relative;
            text-align: center;
            padding: 12px 8px;
            display: inline-block;
            &:hover {
              box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
              border-radius: 2px;
              cursor: pointer;
              > .group-li-collect > span {
                > i.icon.h-icon-all-star1,
                > i.icon.h-icon-all-star-fill {
                  display: inline-block;
                }
              }
              // .content-name{
              //   color: @highlightColor;
              // }
            }
            &:not(:first-child) {
              margin-top: 2px;
            }
            .content-icon {
              display: inline-block;
              width: 42px;
              height: 42px;
              line-height: 42px;
              border-radius: 50%;
              &.color-0 {
                background: #fff1f0;
                color: #f0353f;
              }
              &.color-1 {
                background: #fff6ed;
                color: #f66320;
              }
              &.color-2 {
                background: #fffbe6;
                color: #faad14;
              }
              &.color-3 {
                background: #f6ffed;
                color: #52c41a;
              }
              &.color-4 {
                background: #e6fff4;
                color: #00c293;
              }
              &.color-5 {
                background: #f0f7ff;
                color: #2970ff;
              }
              &.color-6 {
                background: #f9f0ff;
                color: #722ed1;
              }
              &.color-7 {
                background: #fff0f6;
                color: #f12d98;
              }
              > i.icon {
                font-size: 24px;
              }
            }
            .content-name {
              height: 22px;
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #111218;
              line-height: 22px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              margin-top: 10px;
            }
            .group-li-collect {
              position: absolute;
              width: 16px;
              height: 16px;
              top: 6px;
              right: 6px;
              line-height: 16px;
              > span {
                display: inline-block;
                width: 16px;
                height: 16px;
                line-height: 16px;
                text-align: center;
                i.icon {
                  font-size: 14px;
                  &.h-icon-all-star1 {
                    color: rgba(17, 18, 24, 0.5);
                    position: relative;
                    top: 1px;
                    display: none;
                    &:hover {
                      + .hover {
                        display: inline-block;
                      }
                    }
                  }
                  &.h-icon-all-star-fill {
                    color: rgba(17, 18, 24, 0.5);
                    display: none;
                    &.active {
                      color: #faad14;
                      display: inline-block;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

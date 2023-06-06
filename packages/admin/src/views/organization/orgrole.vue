<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="role clearfix">
    <div v-resize.east class="role-tree">
      <div v-if="isRoleManage && iseEditRole" class="role-operation">
        <div v-if="is_show_group" class="role-btn add-role-group" @click="showRoleGroup(0)">
          <i class="icon aufontAll h-icon-all-plus-o"></i>
          <span>新建角色组</span>
        </div>
        <div v-if="is_show_group" class="role-line"></div>
        <div class="role-btn add-role" @click="showRole(0)">
          <i class="icon aufontAll h-icon-all-plus-o"></i>
          <span>新建角色</span>
        </div>
      </div>
      <div class="search-wrap">
        <a-input
          v-model="searchRoleKeys"
          :placeholder="$t('languages.PlaceHolder.InputRole')"
          class="input-search"
          @pressEnter="onSearchRole"
        >
          <i
            v-show="searchRoleKeys.length > 0"
            slot="suffix"
            class="suffix-icon icon aufontAll h-icon-all-flow-cancel"
            @click="clearRoleKey"
          ></i>

          <!-- <a-icon
            v-if="searchRoleKeys.length > 0"
            slot="suffix"
            class="suffix-icon close-icon"
            type="close-circle"
            @click="clearRoleKey"
          /> -->

          <em
            slot="suffix"
            class="suffix-icon icon aufontAll h-icon-all-search-zj"
            @click="onSearchRole"
          ></em>
        </a-input>
        <div v-show="searchTips" class="search-tips">
          <span>{{ `"${searchRoleKeys}"` }}</span>
          <div class="search-result">相关的搜索结果：共0个</div>
        </div>
      </div>
      <p v-if="!treeData || !treeData.length" class="no-role">暂无角色</p>
      <div class="tree-wrapper">
        <a-tree
          v-if="showOrgTree"
          style="display: inline-block"
          class="tree"
          showIcon
          :expandedKeys="expandedKeys"
          :defaultSelectedKeys="defaultSelectedKeys"
          :loadedKeys="loadedKeys"
          :treeData="treeData"
          :loadData="loadChildrenNodes"
          @expand="getExpandedNodes"
          @select="getUserList"
        >
          <span slot="title" slot-scope="node" class="role-title">
            <span class="title" :title="node.title">{{ node.title }}</span>
            <svg v-if="!node.group" class="icon new_icon" aria-hidden="true" @click.stop="getModal(node)">
              <use xlink:href="#icon-details" />
            </svg>
            <!-- <span v-if="!node.group" @click.stop="getModal(node)">不是分组</span> -->
            <template v-if="!node.isLeaf && !node.corpId">
              <span
                v-if="node.roleType === 'DINGTALK'"
                class="title-tip dingding"
                >钉钉</span>
              <span v-else-if="node.roleType === 'WECHAT'" class="title-tip wx">企微</span>
              <span v-else-if="node.roleType === 'SYS'" class="title-tip system">自维护</span>
            </template>
            <a-popover
              placement="rightTop"
              trigger="click"
              :visible="isShowPop && iconCode === node.id"
              overlayClassName="role-popover"
              @visibleChange="onVisibleChange($event, node.id)"
            >
              <template v-if="isShowPop" slot="content">
                <p
                  @click="
                    node.isLeaf ? showRole(1, node) : showRoleGroup(1, node)
                  "
                >
                  编辑
                </p>
                <p
                  @click="
                    node.isLeaf ? deleteRole(node) : deleteRoleGroup(node)
                  "
                >
                  删除
                </p>
              </template>
              <i
                v-if="
                  isRoleManage &&
                  node.roleType === 'SYS' &&
                  node.corpId &&
                  node.name !== '默认' &&
                  node.groupName !== '默认'
                "
                class="icon aufontAll h-icon-all-setting-o edit"
                :class="{ isshow: isShowPop && iconCode === node.id }"
                @click.stop="() => {}"
              ></i>
            </a-popover>
          </span>
        </a-tree>
      </div>
      <div v-if="isRoleManage" class="role-operation">
        <!-- <div class="role-btn">
          <a-popover placement="bottom" overlayClassName="new-btn-group">
            <template slot="content">
              <div class="role-btn" @click="showRoleGroup(0)">
                <span>新建角色组</span>
              </div>
              <div class="role-btn" @click="showRole(0)">
                <span>新建角色</span>
              </div>
            </template>
            <template>
              <div class="add-group">
                <span>新建</span>
              </div>
            </template>
          </a-popover>
        </div> -->

        <!-- <div class="role-btn">
          <a-popover placement="bottom" overlayClassName="new-btn-group">
            <template slot="content">
              <div class="role-btn" @click="importRole">
                <span>导入</span>
              </div>
              <div class="role-btn" @click="exportRole">
                <span>导出</span>
              </div>
            </template>
            <template>
              <div class="add-group">
                <span>导入导出</span>
              </div>
            </template>
          </a-popover>
        </div> -->
        <export-role
          v-if="isShowExportRole"
          :isShowExportRole="isShowExportRole"
          :treeData="JSON.parse(JSON.stringify(sysRoleGroup))"
          @cancel="cancel"
        />
      </div>
    </div>
    <div class="role-content">
      <div v-if="isManage">
        <div style="width: 600px; margin: auto; padding-bottom: 15px">
          <a-alert
            message="“主管”为默认角色，请到部门设置中设置主管，设置完成后自动同步"
            type="warning"
            showIcon
          >
            <span slot="closeText">
              <router-link
                :to="{ name: 'orguser', params: { userLink: true } }"
              >
                <span style="color: #4aa2fb">前往设置</span></router-link>
            </span>
          </a-alert>
        </div>
      </div>
      <div class="role-content__search">
        <div class="search__role">
          <template v-if="userInfo.code">
            <span class="search__role_txt" :title="userInfo.name">{{
              `${userInfo.name}`
            }}</span>
            &nbsp;&nbsp;&nbsp;<span>{{ `ID：${userInfo.code}` }}</span>
          </template>
        </div>
        <div class="search__input">
          <a-input
            ref="searchInput"
            v-model="searchVal"
            class="seach-input"
            :placeholder="$t('languages.PlaceHolder.SearchByName')"
            @pressEnter="filterTable"
          >
            <i
              v-show="searchVal.length > 0"
              slot="suffix"
              class="suffix-icon icon aufontAll h-icon-all-flow-cancel"
              @click="clearUserKey"
            ></i>

            <!-- <a-icon
              v-if="searchVal.length > 0"
              slot="suffix"
              class="suffix-icon close-icon"
              type="close-circle"
              @click="clearUserKey"
            /> -->

            <em
              slot="suffix"
              class="suffix-icon icon aufontAll h-icon-all-search-zj"
              @click="filterTable"
            ></em>
          </a-input>

          <staff-selector
            v-model="selectOrg"
            :options="taffSelectorOpts"
            class="user org-user"
            placeholder="请选择部门"
            :visiblePart="true"
            @change="filterTable"
          />
          <a-button
            v-if="isRoleManage && !isManage"
            :disabled="isBatchOperate"
            class="batch-edit-btn"
            @click="showUser(2)"
          >
            批量编辑
          </a-button>
          <template v-if="roleManageFlag">
            <a-button
              class="user-btn"
              :disabled="isBatchOperate"
              @click="deleteUser"
            >
              批量删除
            </a-button>
            <a-button class="user-btn" type="primary" @click="showUser(0)">
              新建用户
            </a-button>
          </template>
        </div>
      </div>
      <div class="table-wrap">
        <a-table
          class="table-user-list"
          :columns="tableHead"
          :dataSource="roleList"
          :pagination="false"
          :loading="loading"
          :locale="{ emptyText: '' }"
          :scroll="{ y: 'calc(100vh - 220px)' }"
          :customRow="onRowClick"
          :customHeaderRow="onHeaderRow"
          @onBodyScroll="onTableBodyScroll"
        >
          <span
            slot="indexTitle"
            class="index"
            style="font-weight: 500; white-space: nowrap"
          >
            <a-checkbox
              v-show="showSelectAllBox || !isBatchOperate"
              v-model="isSelectAll"
              :indeterminate="!indeterminate"
              @change.stop="selectAll"
            />
            <span v-show="!showSelectAllBox && isBatchOperate" class="text">{{
              $t('languages.NO')
            }}</span>
          </span>
          <span slot="nameTitle" class="resize">用户</span>
          <span slot="userIdTitle" class="resize">{{
            $t('languages.User.UserAccount')
          }}</span>
          <span slot="departmentTitle" class="resize">所属部门</span>
          <span slot="ouScopeTitle" class="resize">{{
            $t('languages.ManagementScope')
          }}</span>
          <span slot="actionTitle" class="resize">操作</span>
          <span
            slot="index"
            slot-scope="text, record"
            class="index operation"
            @click.stop="() => {}"
          >
            <a-checkbox
              v-show="record.hover || record.checked"
              v-model="record.checked"
              @change.stop="onItemCheckboxChange"
            />
            <span v-show="!record.hover && !record.checked" class="text">{{
              text
            }}</span>
          </span>
          <p slot="name" slot-scope="text" class="text-ellipsis">
            <a-tooltip placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span
                v-if="userListType === 'search' && searchVal"
                class="cursor"
              >
                <template
                  v-for="(fragment, i) in text.split(
                    new RegExp(`(?<=${searchVal})|(?=${searchVal})`, 'i'),
                  )"
                >
                  <span
                    v-if="fragment.toLowerCase() === searchVal.toLowerCase()"
                    :key="i"
                    class="highlight"
                    >{{ fragment }}</span>
                  <template v-else>{{ fragment }}</template>
                </template>
              </span>
              <span v-else class="cursor">{{ text }}</span>
            </a-tooltip>
            <!-- <span class="aufontAll h-icon-all-star" style="color: #FADB14;margin-left: 8px;font-size: 14px"></span> -->
          </p>
          <p slot="userId" slot-scope="text" class="text-ellipsis">
            <a-tooltip placement="top">
              <template slot="title">
                <span>{{ text }}</span>
              </template>
              <span
                v-if="userListType === 'search' && searchVal"
                class="cursor"
              >
                <template
                  v-for="(fragment, i) in text.split(
                    new RegExp(`(?<=${searchVal})|(?=${searchVal})`, 'i'),
                  )"
                >
                  <span
                    v-if="fragment.toLowerCase() === searchVal.toLowerCase()"
                    :key="i"
                    class="highlight"
                    >{{ fragment }}</span>
                  <template v-else>{{ fragment }}</template>
                </template>
              </span>
              <span v-else class="cursor">{{ text }}</span>
            </a-tooltip>
          </p>
          <span slot="departmentName" slot-scope="text" class="text-ellipsis">
            <a-popover
              overlayClassName="text-info-detail"
              placement="bottomLeft"
              :align="{
                offset: [offsetX2, 0],
              }"
            >
              <template slot="content">
                <div class="text-info-box">
                  <template v-for="(item, index) in text">
                    <div :key="index" class="text-info-item">
                      <div class="item-name" :title="item.name">
                        {{ item.deptName }}
                      </div>
                      <div class="item-path" :title="item.deptPath">
                        {{ item.deptPath }}
                      </div>
                    </div>
                  </template>
                </div>
              </template>
              <span
                class="icon aufontAll see-all-icon"
                @mouseenter="mouseEnter1"
                >&#xe61c;</span>
            </a-popover>
            <span>{{ getText2(text) }}</span>
          </span>
          <span slot="ouScope" slot-scope="text" class="text-ellipsis">
            <a-popover
              v-if="text.length"
              overlayClassName="text-info-detail"
              placement="bottomLeft"
              :align="{
                offset: [offsetX1, 0],
              }"
            >
              <template slot="content">
                <div class="text-info-box">
                  <template v-for="(item, index) in text">
                    <div :key="index" class="text-info-item">
                      <div class="item-name" :title="item.name">
                        {{ item.name }}
                      </div>
                      <div class="item-path" :title="item.deptPath">
                        {{ item.deptPath }}
                      </div>
                    </div>
                  </template>
                </div>
              </template>
              <span
                class="icon aufontAll see-all-icon"
                @mouseenter="mouseEnter1"
                >&#xe61c;</span>
            </a-popover>
            <span>{{ getText(text) }}</span>
          </span>
          <span
            v-if="!isManage"
            slot="action"
            slot-scope="text, record"
            class="text-ellipsis operation"
          >
            <i
              style="margin-right: 16px"
              class="cursor"
              @click.stop="taskTransfer(record)"
              >工作交接</i>
            <a href="javascript:void(0)" @click.stop="showUser(1, record)">
              <i>编辑</i>
            </a>
          </span>
        </a-table>
      </div>
      <div class="load-more">
        <template v-if="isDataEmpty">
          <!-- <span class="text" v-if="userListType === 'search' && searchVal">{{
            $t("languages.NoSearchData")
          }}</span>
          <span class="text" v-else>{{ $t("languages.NoRelevantData") }}</span> -->
        </template>
        <template v-if="!isDataEmpty">
          <span v-if="!loading && !isLoadMore" @click="loadMore">{{
            $t('languages.ClickToLoadMore')
          }}</span>
          <span v-if="loading && !isLoadMore">{{
            $t('languages.LoadMore')
          }}</span>
          <span v-if="isLoadMore && roleList.length > 0" class="text">{{
            $t('languages.HasLoadedAllData')
          }}</span>
        </template>
      </div>
    </div>
    <!--用户信息弹框-->
    <a-drawer
      :title="$t('languages.User.UserInformation')"
      width="850"
      placement="right"
      :closable="true"
      :visible="infoVisible"
      wrapClassName="user-info-drawer"
      @close="onCloseInfoModal"
    >
      <UserInfo />
    </a-drawer>

    <!-- 导入弹窗-->
    <a-modal
      v-model="isShowImportModal"
      class="import-modal"
      :class="showImportModel ? 'importing' : ''"
      :title="importTitle"
      :width="800"
      :destroyOnClose="true"
      :mask="true"
      :maskClosable="false"
      :keyboard="false"
      @cancel="handleCancel"
    >
      <data-upload
        v-if="showUploadModel"
        :importType="importType"
        @change="changeImportBtnStatus"
        @setFileName="setImportFileName"
        @remove="removeFile"
      />

      <data-import
        v-if="showImportModel"
        :percent="importPercent"
        :status="importStatus"
        :text="importStatusText"
        :taskId="taskId"
        @importEnd="importEndFn"
      />

      <data-info v-if="isShowDataInfo" :info="importErrInfo" />

      <!-- 模态框页脚按钮 -->
      <div slot="footer" class="modal-footer">
        <!-- <a-button v-if="showCancelButton" key="back" @click="handleCancel">{{
          $t('languages.Cancel')
        }}</a-button> -->
        <a-button
          v-if="showUploadModel"
          key="import"
          type="primary"
          :disabled="!canImport"
          @click="confirmImport"
        >
          {{ $t('languages.Modal.StartImport') }}
        </a-button>
        <a-button
          v-if="showReImport"
          key="import"
          type="primary"
          @click="reImport"
        >
          重新导入
        </a-button>
        <a-button
          v-if="showConfirmButton"
          key="confirm"
          type="primary"
          @click="handleCancel"
        >
          {{ $t('cloudpivot.list.pc.OK') }}
        </a-button>
      </div>
    </a-modal>
    <!-- 导入弹窗-->

    <!-- 工作交接弹框 -->
    <a-drawer
      :title="$t('languages.TaskTransfer.TaskTransfer', { name: userName })"
      width="850"
      placement="right"
      :closable="true"
      :visible="TaskTransferVisible"
      wrapClassName="task-transfer-drawer"
      :destroyOnClose="true"
      @close="TaskTransferVisible = false"
    >
      <TaskTransfer
        :curTab="'1'"
        :corpid="corpid"
        :userid="userid"
        @reloadTree="clearUserKey"
      />
    </a-drawer>

    <!-- 新增/编辑角色组弹窗 -->
    <AddRoleGroup
      v-model="roleGroupVisible"
      :roleGroupType="roleGroupType"
      :roleInfo="roleGroupInfo"
      :sysRoleGroup="sysRoleGroup"
      :roleGroupData="roleGroupData"
      @reloadTree="reloadTree"
    />

    <!-- 新增/编辑角色弹窗 -->
    <AddRole
      v-model="roleVisible"
      :roleType="roleType"
      :roleData="roleData"
      :roleInfo="roleInfo"
      :treeData="JSON.parse(JSON.stringify(sysRoleGroup))"
      @reloadTree="reloadTree"
      @nameChange="nameChange"
    />

    <!-- 新增/编辑用户弹窗 -->
    <AddUser
      v-model="userVisible"
      :userType="userType"
      :userData="userData"
      :roleData="userInfo"
      @reloadUser="clearUserKey"
    />
    <!-- 查看角色关联数 -->
    <RoleModal :roleModalVisible="roleModalVisible" :nodeModal="nodeModal" @close="closeModal" />
  </div>
</template>
<style lang="less" scoped>
@import '../../styles/table.less';
</style>
<style lang="less">
@import '~@/styles/color/colors.less';
.role {
  height: 100%;
  overflow: hidden;
  p {
    margin-bottom: 0;
  }
  .role-content__search {
    margin-bottom: 16px;
  }
  .role-tree {
    width: 228px;
    height: 100%;
    float: left;
    box-shadow: 1px 0px 0px 0px #eee;
    position: relative;
    text-align: left;
    overflow: hidden;
    .sub-name {
      display: flex;
      align-items: center;
      padding-left: 25px;
      padding-bottom: 12px;
      padding-top: 16px;
      padding-right: 48px;
      color: #111218;
      font-size: 18px;
      font-weight: 500;
    }
    &::-webkit-scrollbar {
      width: 0;
      height: 5px;
      background: #fff;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(17, 18, 24, 0.5);
      border-radius: 4px;
    }

    .tree-wrapper {
      overflow-x: scroll;
      white-space: nowrap;
      overflow-y: auto;
      padding-left: 8px;
      &::-webkit-scrollbar {
        width: 0;
        height: 5px;
        background: #fff;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(17, 18, 24, 0.5);
        border-radius: 4px;
      }
      .tree {
        width: 100%;
        text-align: left;
        padding-bottom: 10px;
        max-height: calc(100vh - 208px);
        overflow: auto;
      }
    }
    .search-wrap {
      width: 100%;
      margin-bottom: 9px;
      padding-left: 16px;
      padding-right: 16px;
      position: relative;
      .input-search {
        width: 100%;
        .h-icon-all-flow-cancel {
          color: rgba(17, 18, 24, 0.25);
          margin-right: 7px;
          font-size: 13px;
          &:hover {
            color: rgba(17, 18, 24, 0.5) !important;
          }
        }
        .h-icon-all-search-zj {
          color: rgba(17, 18, 24, 0.25);
          font-size: 14px;
          &:hover {
            color: rgba(17, 18, 24, 0.5) !important;
          }
        }
        & .ant-input {
          padding-right: 56px !important;
        }
      }
      .search-tips {
        position: absolute;
        left: 0;
        top: 38px;
        padding: 10px 12px;
        background: #fff;
        z-index: 9;
        width: 100%;
        color: rgba(17, 18, 24, 0.5);
        font-size: 14px;
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        & > span {
          word-break: break-all;
        }
      }
    }
    ul {
      li {
        padding: 0px;
        span.ant-tree-switcher {
          float: left;
          color: rgba(17, 18, 24, 0.5) !important;
          height: 36px;
          line-height: 36px;
        }
        span.ant-tree-node-content-wrapper {
          display: block;
          margin-left: 24px;
          line-height: 36px;
          color: #111218;
          height: 36px;
          &:hover {
            background-color: #eef4fd !important;
            line-height: 36px;
            .role-title {
              .edit {
                display: block;
              }
            }
          }
          &:before {
            background: transparent !important;
          }
        }
        span.ant-tree-node-selected {
          background-color: #eef4fd !important;
          font-weight: 600;
          color: #2970ff;
          height: 36px;
          line-height: 36px;
          &:hover {
            background-color: #eef4fd !important;
          }
        }
        span.ant-tree-iconEle {
          display: none;
        }
      }
    }

    .role-operation {
      width: 100%;
      height: 32px;
      padding: 0 8px;
      margin-bottom: 8px;
      line-height: 32px;
      display: flex;
      justify-content: space-between;
      .role-line {
        // width: 1px;
        height: 24px;
        float: left;
        // background: #d8d8d8;
        margin: 4px 8px;
        line-height: 32px;
        border-left: 1px solid #d8d8d8;
      }
      .role-btn {
        font-size: 12px;
        color: @primary-color;
        float: left;
        text-align: center;
        width: 95px;
        cursor: pointer;
        i {
          margin-right: 5px;
          font-size: 10px;
        }
      }
      .add-group {
        font-size: 14px;
        color: #111218;
        float: left;
        cursor: pointer;
        text-align: center;
        border-radius: 2px;
        border: 1px solid #d4d5d6;
        width: 92px;
        height: 32px;
        i {
          margin-right: 4px;
          font-size: 10px;
        }
      }
    }

    .role-title {
      position: relative;
      display: block;
      padding-right: 10px;
      overflow: hidden;
      .title {
        max-width: calc(100% - 32px);
        // min-width: 100px;
        text-overflow: ellipsis;
        overflow: hidden;
        display: block;
        float: left;
        margin-right: 3px;
      }
      .title-new {
        max-width: calc(100% - 55px);
      }

      .edit {
        position: absolute;
        top: 0;
        right: 8px;
        display: none;
      }
      .title-tip {
        &::before {
          content: '';
        }
        display: inline-block;
        font-size: 10px;
        height: 18px;
        padding: 0 6px;
        border-radius: 10px;
        text-align: center;
        line-height: 16px;
        background: #ffffff;
        font-weight: 600;
        position: absolute;
        bottom: 8px;
      }
      .dingding {
        color: #3296fa;
        border: 1px solid #3296fa;
      }
      .wx {
        color: #4a74c1;
        border: 1px solid #4a74c1;
      }
      .system {
        width: 45px;
        color: @primary-color;
        border: 1px solid @primary-color;
      }
    }
  }
  .role-content {
    margin-left: 224px;
    padding: 16px 24px 0;
    text-align: left;
    overflow: hidden;
    &__search {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .search__input {
        display: flex;
        .user {
          &::before {
            content: ''; // 解决未知样式污染
          }
        }
        .org-user {
          opacity: 1;
          width: 192px;
          margin: 0 16px 0 10px;

          // .has-val > div{
          //   max-height: 28px;
          //   overflow: auto;
          // }
        }
        .batch-edit-btn {
          vertical-align: middle;
          // margin-right: 8px;

          .list-work-icon {
            margin-right: 10px;
            vertical-align: middle;
          }
        }

        .ant-input-affix-wrapper {
          .seach-input.ant-input {
            padding-right: 52px;
          }
        }
        .user-btn {
          margin-left: 8px;
          vertical-align: middle;
          i {
            font-size: 14px;
            margin-right: 8px;
          }
        }
      }
      .search__role {
        font-weight: 500;
        color: #111218;
        font-size: 16px;
        max-width: 500px;
        height: 24px;
        word-break: break-all;
        &_txt {
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500 !important;
          color: #111218 !important;
          font-size: 16px !important;
          display: inline-block;
          vertical-align: bottom;
        }
        & > span {
          font-size: 12px;
          color: rgba(17, 18, 24, 0.5);
        }
      }
    }

    .seach-input {
      width: 192px;
      .h-icon-all-flow-cancel {
        color: rgba(17, 18, 24, 0.25);
        margin-right: 7px;
        font-size: 13px;
        &:hover {
          color: rgba(17, 18, 24, 0.5) !important;
        }
      }
      .h-icon-all-search-zj {
        color: rgba(17, 18, 24, 0.25);
        font-size: 14px;
        &:hover {
          color: rgba(17, 18, 24, 0.5) !important;
        }
      }
      .close-icon {
        color: rgba(17, 18, 24, 0.25);
        margin-right: 12px;
      }
    }
  }
  .load-more {
    text-align: center;
    padding: 11px 0;
    span {
      padding: 11px 0;
      color: rgba(17, 18, 24, 0.5);
      font-weight: 400;
      font-size: 12px;
      cursor: pointer;
    }
    .text {
      cursor: default;
    }
  }
  .no-role {
    margin-top: 32px;
    text-align: center;
    font-size: 12px;
    color: rgba(17, 18, 24, 0.5);
  }

  .h3-organization {
    opacity: 0;
  }

  .text-ellipsis {
    .see-all-icon {
      font-size: 12px;
      display: inline-block;
      width: 14px;
      height: 14px;
      line-height: 14px;
      text-align: center;
      margin-right: 12px;
      &:hover {
        cursor: pointer;
      }
    }
  }
}
.ant-table-body::-webkit-scrollbar,
.ant-table-header::-webkit-scrollbar {
  width: 0;
}
.user-info-drawer {
  .ant-drawer-body {
    &::-webkit-scrollbar {
      width: 0;
    }
  }
}
.import-modal {
  .ant-modal-body {
    padding: 20px 24px;
    min-height: 294px;
  }
  .modal-footer {
    text-align: right;
    & button + button {
      margin-left: 8px;
      margin-bottom: 0;
    }
  }
}
.role-popover {
  cursor: pointer;
}
.role-popover p:first-child {
  border-top: none;
  border-radius: 4px 4px 0 0;
  &:hover {
    &:before {
      content: '';
      display: block;
      width: 8.5px;
      height: 8.5px;
      transform: rotate(45deg);
      background-color: @sub-bg-color;
      position: absolute;
      left: 6px;
      top: 12px;
    }
  }
}
.role-popover .ant-popover-inner-content {
  padding: 0px;
}
.role-popover p {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  padding: 5px 16px;
}
.role-popover p:hover {
  background-color: @sub-bg-color;
}
.isshow {
  display: block !important;
  color: @primary-color;
}

.text-info-detail {
  &.ant-popover {
    padding-top: 5px;
  }
  .ant-popover-arrow {
    display: none;
  }
  .ant-popover-inner-content {
    padding: 6px;
  }
  .text-info-box {
    max-height: 177px;
    overflow-y: scroll;
    .text-info-item {
      width: 341px;
      height: 57px;
      padding: 7px 6px 7px 12px;
      .item-name {
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #111218;
        line-height: 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-bottom: 6px;
      }
      .item-path {
        height: 17px;
        font-size: 12px;
        font-weight: 400;
        color: rgba(31, 31, 31, 0.45);
        line-height: 17px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
.new-btn-group {
  .ant-popover-inner-content {
    padding: 10px 0;
  }
  .role-btn {
    width: 106px;
    height: 32px;
    padding: 6px 15px;
    > span {
      display: inline-block;
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #111218;
      line-height: 20px;
    }
    + .role-btn {
      margin-top: 2px;
    }
    &:hover {
      background: #eef4fd !important;
      cursor: pointer;
    }
  }
}
</style>

<script lang="ts">
import OrgApi from '@/apis/organization';
import * as orgApi from '@/apis/organization';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import { Component, Vue, Watch,Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import AddRoleGroup from '../../components/organization/roleModals/role-group.vue';
import AddRole from '../../components/organization/roleModals/role.vue';
import AddUser from '../../components/organization/roleModals/user.vue';
import TaskTransfer from '../../components/organization/taskTransfer/index.vue';
import UserInfo from '../../components/organization/userInfo.vue';
import DataImport from './import/data-import.vue';
import DataInfo from './import/data-info.vue';
import DataUpload from './import/data-upload.vue';
import ExportRole from './import/export-role.vue';
import { ImportType, ImportModalCons } from './orgTree/orgTree.typings';
import RoleModal from "./roleModal.vue"
import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  Icon,
  Input,
  Modal,
  Popover,
  Table,
  Tooltip,
  Tree,
} from '@h3/antd-vue';

const UserModule = namespace('Organization/User');
const RoleModule = namespace('Organization/Role');
const SystemUserModule = namespace('System/User');

@Component({
  name: 'Orgrole',
  components: {
    UserInfo,
    AddRoleGroup,
    AddRole,
    AddUser,
    RoleModal,
    DataUpload,
    DataImport,
    DataInfo,
    StaffSelector,
    TaskTransfer,
    ExportRole,
    APopover: Popover,
    AInput: Input,
    AIcon: Icon,
    ATree: Tree,
    AAlert: Alert,
    AButton: Button,
    ATable: Table,
    ACheckbox: Checkbox,
    ATooltip: Tooltip,
    ADrawer: Drawer,
    AModal: Modal,
  },
})
export default class orgrole extends Vue {
  @RoleModule.State('orgTree') orgTree: any;

  @RoleModule.State('roleGroupList') roleGroupList: any;

  @RoleModule.State('loading') loading: any;

  @RoleModule.State('isLoadMore') isLoadMore: any;

  @RoleModule.State('roleList') roleList: any;

  @RoleModule.State('roleTitle') roleTitle: any;

  @RoleModule.State('orgTreeBySearch') orgTreeBySearch: any;

  @RoleModule.State('isRoleSearchResult') isRoleSearchResult: any;

  @RoleModule.State('searchTips') searchTips: any; // 展示搜索角色结果为空时提示

  // 修改

  @RoleModule.Mutation('assignTreeParams') assignTreeParams: any;

  @RoleModule.Mutation('setEventKey') setEventKey: any;

  @RoleModule.Mutation('clearRoleList') clearRoleList: any;

  @RoleModule.Mutation('clearOrgTreeBySearch') clearOrgTreeBySearch: any;

  @UserModule.Mutation('assignUserInfoParams') assignUserInfoParams: any;

  @UserModule.Mutation('clearUserInfo') clearUserInfo: any;

  // 异步
  @RoleModule.Action('getOrgRoleNode') getOrgRoleNode: any;

  @RoleModule.Action('getOrgRoleList') getOrgRoleList: any;

  @RoleModule.Action('getChildrenRole') getChildrenRole: any;

  @RoleModule.Action('searchOrgRoleNode') searchOrgRoleNode: any;

  @UserModule.Action('getOrgUserInfo') getOrgUserInfo: any;

  @SystemUserModule.State('isOnlyAppAdmin') isOnlyAppAdmin!: any;

  @SystemUserModule.State('isRoleManage') isRoleManage!: any;

  @SystemUserModule.State("loginedUserInfo") loginedUserInfo!: any;

  @Prop({}) appRoute?:string;

  searchVal: string = '';

  infoVisible: boolean = false;

  isDataEmpty: boolean = false;

  slideToBottom: boolean = false;

  searchRoleKeys: string = ''; // 搜索角色关键字

  roleInfo: any = '';

  roleGroupInfo: any = '';

  isManage: boolean = false;

  selectOrg: any[] = [];

  iseEditRole: boolean = true;

  taffSelectorOpts = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择部门',
    appManagerFilter: true,
  };

  corpid: string = '';

  userid: string = '';

  TaskTransferVisible: boolean = false;

  userName: string = '';

  taskTransfer(recope) {
    this.corpid = recope.corpId;
    this.userid = recope.id;
    this.TaskTransferVisible = true;
    this.userName = recope.name;
  }

  roleModalVisible:boolean = false

  nodeModal:any = {}

  // 已加载的节点key值
  get loadedKeys(): string[] {
    return this.expandedKeys;
  }

  tableHead: Array<Organization.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      scopedSlots: { customRender: 'index' },
      width: 80,
      align: 'center',
    },
    {
      dataIndex: 'name',
      // key: 'name',
      slots: { title: 'nameTitle' },
      scopedSlots: {
        // filterDropdown: 'filterDropdown',
        // filterIcon: 'filterIcon',
        customRender: 'name',
      },
      // onFilter: (value:string, record:any) =>
      //   record.name.toLowerCase().includes(value.toLowerCase()),
      width: 160,
      customCell: (record, rowIndex) => {
        return { style: { 'white-space': 'pre' } };
      },
    },
    {
      dataIndex: 'userId',
      slots: { title: 'userIdTitle' },
      scopedSlots: { customRender: 'userId' },
      width: 160,
    },
    {
      dataIndex: 'departmentName',
      slots: { title: 'departmentTitle' },
      scopedSlots: { customRender: 'departmentName' },
    },
    {
      dataIndex: 'ouScope',
      slots: { title: 'ouScopeTitle' },
      scopedSlots: { customRender: 'ouScope' },
      // width: 200,
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      width: 140,
    },
  ];

  userInfo = {
    roleType: '',
    code: '',
    name: '',
    groupName: '',
    id: '',
    remarks: ""
  };

  userListType: string = 'page'; // 用户列表数据展示的类型： page，默认数据  search，搜索结果

  page: number = 0;

  showOrgTree: boolean = false;

  isShowPop: boolean = false;

  iconCode: string = '';

  roleGroupVisible: boolean = false;

  roleGroupType: number = 0;

  roleGroupData: any = {};

  roleVisible: boolean = false;

  roleType: number = 0;

  roleData: any = {};

  userVisible: boolean = false;

  userType: number = 0;

  userData: any = [];

  isSelectAll: boolean = false;

  showSelectAllBox: boolean = false;

  sysRoleGroup: any[] = [];

permissions:any = ["ADMIN","SYS_MNG"];

is_show_group: boolean = false;

  importTitle: string = '';

  isShowImportModal: boolean = false;

  canImport: boolean = false; // 控制导入按钮置灰

  importFileName: string = '';

  /**** 导入数据 start *****/
  // 导入-进度条
  showImportModel: boolean = false;

  // 导入-选择文件
  showUploadModel: boolean = true;

  // 导入-错误信息
  isShowDataInfo: boolean = false;

  // 导入进度
  importPercent: number = 0;

  simulateInterval: any = -1;

  // 是否导入完成
  isImportEnd: boolean = false;

  // 导入进度条状态
  importStatus: string = 'active';

  // 导入状态文本
  importStatusText: string = '导入中';

  // 导入的错误信息
  importErrInfo: any = {};

  importType: string = '';

  showCancelButton: boolean = true;

  showConfirmButton: boolean = false;

  showReImport: boolean = false;
  /**** 导入数据 end *****/

  taskId: string = '';

  //确认导入
  importConfirm: boolean = true;

  isShowExportRole: boolean = false;

  get showBtn() {
    // 部门主管角色列表，隐藏新增和删除入口
    const { name, roleType } = this.userInfo;

    if (!name || !roleType) {
      return false;
    }

    return roleType === 'SYS';
  }

  get indeterminate() {
    const length: number = this.roleList.length;
    const checkedLength: number = this.roleList.filter(
      (list: any) => list.checked,
    ).length;
    return !checkedLength || checkedLength === length;
  }

  get roleManageFlag() {
    if (this.isRoleManage && this.userInfo) {
      return (
        this.userInfo.roleType === 'SYS' && this.userInfo.name && !this.isManage
      );
    } else {
      return false;
    }
  }

  closeModal(){
    this.roleModalVisible = false
  }

  /**
   * 全选
   */
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked;

    if (isChecked) {
      this.roleList.forEach((item: any) => {
        item.checked = true;
      });
    } else {
      this.roleList.forEach((item: any) => {
        item.checked = false;
      });
    }
  }

  /*
   * 当checkbox选择change时事件 
   */

  onItemCheckboxChange() {
    const isCheckedItems = this.roleList.filter((d: any) => d.checked);
    if (isCheckedItems.length < this.roleList.length) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
  }

  // 生命周期
  created() {
    if(this.appRoute || this.$route.params.appCode){
      this.getRoleGroup(this.appRoute || this.$route.params.appCode);
      this.defaultGetData(this.appRoute || this.$route.params.appCode);
      this.is_show_group = false;
    }else{
      this.getRoleGroup();
      this.defaultGetData();
      this.is_show_group = true;
    }
    
    //是否具有编辑角色权限
    this.getEditRole();
  }

  async getEditRole(){
    const res = await OrgApi.getUserEditRoleOauth();
    this.iseEditRole = res.data;
    
  }

  defaultGetData(appCode?:string) {
    //
    this.getOrgRoleNode(appCode).then(() => {
      this.showOrgTree = true;
      this.expandedKeys = this.expandedKeysData();
      const listParams: Organization.Roles.RequestListParams = {
        roleId: this.roleTitle.id,
        page: 0,
        size: 100,
        filterType: 'admin',
      };
      this.getOrgRoleList({ params: listParams }).then(() => {
        this.userInfo = JSON.parse(JSON.stringify(this.roleTitle));
        this.isManage =
          this.userInfo.name === '主管' && this.userInfo.groupName === '默认'
            ? true
            : false;
      });
    });
  }

  destroyed() {
    this.clearRoleList();
    this.clearOrgTreeBySearch();
    const treeParams: Organization.Roles.RequestChildrenTreeParams = {
      groupId: '',
    };
    this.assignTreeParams(treeParams);
  }

  onTableBodyScroll(e: any) {
    const tableBody = e.target;
    const bodyClientHeight = tableBody.clientHeight;
    const bodyScrollHeight = tableBody.scrollHeight;
    const bodyScrollTop = tableBody.scrollTop;
    this.slideToBottom = bodyClientHeight + bodyScrollTop === bodyScrollHeight;
  }

  // 获取角色组下的角色
  getExpandedNodes(expandedKeys: any, e: any) {
    this.expandedKeys = expandedKeys;
    // if (e.expanded && !this.isRoleSearchResult) {
    //   const treeParams = {
    //     groupId: e.node.$attrs.nodeData.id,
    //   };
    //   this.setEventKey({ dataRef: e.node.$attrs.nodeData });
    //   this.assignTreeParams(treeParams); // 设置参数
    //   this.getChildrenRole();
    // }
  }

  // 获取角色下的用户
  getUserList(selectedKeys: any, e: any) {
    this.roleInfo =
      e.node.dataRef.roleType === 'SYS' &&
      !e.node.isLeaf &&
      e.node.dataRef.name !== '默认' &&
      e.node.dataRef.corpId
        ? e.node.dataRef
        : '';

    this.roleGroupInfo =
      (e.node.dataRef.roleType === 'SYS' || e.node.dataRef.id === 'other') &&
      e.node.dataRef.name !== '默认' &&
      (!e.node.isLeaf ? e.node.dataRef : '');

    // 子节点才展示数据，父节点只做展开操作
    if (!e.node.isLeaf) {
      return;
    }
    const userInfo = {
      code: e.node.dataRef.code,
      name: e.node.dataRef.name,
      groupName: e.node.dataRef.groupName,
      id: e.node.dataRef.id,
      roleType: e.node.dataRef.roleType,
      remarks: e.node.dataRef.remarks,
      isEditFlow: e.node.dataRef.isEditFlow,
    };
    this.userInfo = userInfo;

    //是否为云枢自维护下默认角色组下的主管角色
    this.isManage =
      e.node.dataRef.roleType === 'SYS' &&
      e.node.dataRef.name === '主管' &&
      e.node.dataRef.groupName === '默认'
        ? true
        : false;
    this.clearUserKey(); // 刷新table数据
  }

  // 加载更多-角色下的用户
  loadMore() {
    this.page += 1;
    const params: Organization.Roles.RequestListParams = {
      roleId: this.userInfo.id,
      page: this.page,
      size: 100,
      filterType: 'admin',
    };
    if (this.userListType === 'search') {
      params.name = this.searchVal;
    }
    this.isSelectAll = false;
    this.getOrgRoleList({ type: this.userListType, params }); // 刷新table数据
  }

  // 搜索高亮
  filterTable() {
    this.searchVal = this.searchVal.trim();
    // searchVal为空或数据未加载完成时，清空上次搜索结果并加载全部数据
    if ((!this.searchVal && !this.selectOrg.length) || this.loading) {
      this.clearUserKey();
      return;
    }
    this.userListType = 'search';
    this.page = 0;
    this.clearRoleList();
    const params: Organization.Roles.RequestListParams = {
      roleId: this.userInfo.id,
      page: 0,
      size: 100,
      name: this.searchVal,
      filterType: 'admin',
      deptId: this.selectOrg.map((el) => el.id).join(','),
    };
    this.slideToBottom = false;
    this.isSelectAll = false;
    this.getOrgRoleList({ type: 'search', params });
  }

  // 清空搜索用户关键字
  clearUserKey(type?: string) {
    if (type === 'save') {
      // 根据之前的分页及搜索结果刷新用户列表
      const listParams: Organization.Roles.RequestListParams = {
        roleId: this.userInfo.id,
        page: 0,
        size: (this.page + 1) * 100,
        filterType: 'admin',
      };
      if (this.userListType === 'search') {
        listParams.name = this.searchVal;
      }
      this.isSelectAll = false;
      this.getOrgRoleList({ type: this.userListType, params: listParams });
      return;
    }
    this.searchVal = '';
    this.userListType = 'page';
    this.page = 0;
    this.clearRoleList();
    const params: Organization.Roles.RequestListParams = {
      roleId: this.userInfo.id,
      page: 0,
      size: 100,
      filterType: 'admin',
    };
    this.slideToBottom = false;
    this.isSelectAll = false;
    this.getOrgRoleList({ params });
  }

  /* 用户信息相关 */
  showInfoModal(val: string) {
    if (val) {
      this.assignUserInfoParams({
        id: val,
      });
      this.getOrgUserInfo().then(() => {
        this.infoVisible = true;
      });
    }
  }

  // 用户信息抽屉关闭事件
  onCloseInfoModal() {
    this.infoVisible = false;
    this.clearUserInfo();
  }

  // table行点击事件
  onRowClick(record: any, index: number) {
    return {
      on: {
        click: () => {
          if (record.unitType !== 1) {
            this.showInfoModal(record.id);
          }
        },
        mouseenter: () => {
          record.hover = true;
        },
        mouseleave: () => {
          record.hover = false;
        },
      },
    };
  }

  // table行点击事件
  onHeaderRow(column: any, index: number) {
    return {
      on: {
        mouseenter: () => {
          this.showSelectAllBox = true;
        },
        mouseleave: () => {
          this.showSelectAllBox = false;
        },
      },
    };
  }

  /*
   * 搜索角色
   */
  onSearchRole() {
    this.searchRoleKeys = this.searchRoleKeys.trim();
    // searchRoleKeys为空时，不做搜索并清空上次搜索结果
    if (!this.searchRoleKeys) {
      this.clearRoleKey();
      return;
    }
    this.showOrgTree = false;
    const treeParams = {
      groupId: '',
    };
    this.clearOrgTreeBySearch();
    this.assignTreeParams(treeParams);
    this.searchOrgRoleNode(this.searchRoleKeys).then(() => {
      this.expandedKeys = this.expandedKeysData();
      this.showOrgTree = true;
    });
  }

  /*
   * 清空搜索角色关键字、结果
   */
  clearRoleKey() {
    this.showOrgTree = false;
    this.searchRoleKeys = '';
    this.clearOrgTreeBySearch();
    // 清空关键字，默认展示默认分组下的第一个角色下的用户
    this.defaultGetData();
    setTimeout(() => {
      // 重新渲染tree, 默认展开搜索的角色组
      this.showOrgTree = true;
      this.expandedKeys = this.expandedKeysData();
    }, 1);
  }

  /*
   * popover显示控制
   */
  onVisibleChange(visible: boolean, code: string) {
    this.isShowPop = visible;
    this.iconCode = code;
  }

  changeData(data: any, nodes: any) {
    const result: any = [];
    data.forEach((node: any) => {
      const obj: any = {
        id: node.id,
        value: node.id,
        name: node.name,
        title: `${node.name}`,
        isLeaf: node.children && node.children.length ? false : true,
        key: node.id,
        code: node.code,
        groupId: node.groupId,
        corpName: node.corpName,
        parentId: nodes.id,
        roleType: node.roleType,
        corpId: node.corpId,
        children: null,
      };
      if (node.children && node.children.length) {
        obj.children = this.changeData(node.children, node);
      }
      result.push(obj);
    });
    return result;
  }

  async getRoleGroup(appCode?:string) {
    const res: any = await OrgApi.getRoleGroupNew({
      expandAll: true,
      filterDefaultRoleGroup: true,
      onlyGroup: true,
      onlySYS: true,
      appCode
    });
    if (res.errcode === 0 && Array.isArray(res.data)) {
      this.sysRoleGroup = this.changeData(res.data, {});
    }
  }

  /*
   * show角色组弹窗-- 0：新增，1：编辑
   */
  showRoleGroup(type: number, node?: any) {
    this.isShowPop = false;
    this.roleGroupType = type;
    if (node) {
      if(!node.createdBy){
        this.$message.error('系统字段，无法删除');
        return;
      }
      if(node.createdBy){
        if(this.getDiff(this.loginedUserInfo.permissions ,this.permissions).length < 1 && node['createdBy'] !== this.loginedUserInfo['id']){
          this.$message.error('没有权限或者非创建人');
          return;//1、是否为自己创建的 2、是否是管理员
        }
      }
      this.roleGroupData = node;
    }
    this.roleGroupVisible = true;
  }

  /*
   * 删除角色组
   */
  deleteRoleGroup(node: any) {
    if(!node.createdBy){
      this.$message.error('系统字段，无法删除');
      return;
    }
    if(node.createdBy){
      if(this.getDiff(this.loginedUserInfo.permissions ,this.permissions).length < 1 && node['createdBy'] !== this.loginedUserInfo['id']){
        this.$message.error('没有权限或者非创建人');
        return;
      }
    }
    this.isShowPop = false;
    const vm: any = this;
    this.$confirm({
      title: '确定删除当前角色组吗？',
      okText: vm.$t('languages.Apps.Ok').toString(),
      cancelText: vm.$t('languages.Apps.Cancel').toString(),
      onOk() {
        const params = {
          ids: node.id,
        };
        OrgApi.deleteRoleGroup(params).then((res: any) => {
          if (res.errcode) {
            vm.$message.error(res.errmsg);
            return;
          }

          vm.$message.success('删除成功！');
          vm.reloadTree();
        });
      },
    });
  }

  // 角色名称变化
  nameChange(data?: any) {
    if (!data) {
      this.reloadTree();
      return;
    }
    this.userInfo.name = data.roleName;
  }

  /*
   * show角色弹窗-- 0：新增，1：编辑
   */
  showRole(type: number, node?: any) {
    this.isShowPop = false;
    this.roleType = type;
    if (node) {
      if(!node.createdBy){
        this.$message.error('系统字段，无法删除');
        return;
      }
      if(node.createdBy){
        if(this.getDiff(this.loginedUserInfo.permissions ,this.permissions).length < 1 && node['createdBy'] !== this.loginedUserInfo['id']){
          this.$message.error('没有权限或者非创建人');
          return;
        }
      }
      this.roleData = node;
    }
    this.roleVisible = true;
  }

  /*
   * 删除角色
   */
  deleteRole(node: any) {
    if(!node.createdBy){
      this.$message.error('系统字段，无法删除');
      return;
    }
    if(node.createdBy){
      if(this.getDiff(this.loginedUserInfo.permissions ,this.permissions).length < 1 && node['createdBy'] !== this.loginedUserInfo['id']){
        this.$message.error('没有权限或者非创建人');
        return;
      }
    }
 

    this.isShowPop = false;

    const vm: any = this;

    this.$confirm({
      title: '确定删除当前角色吗？',
      okText: vm.$t('languages.Apps.Ok').toString(),
      cancelText: vm.$t('languages.Apps.Cancel').toString(),
      onOk() {
        const params = {
          ids: node.id,
        };
        OrgApi.deleteRole(params).then((res: any) => {
          if (res.errcode) {
            vm.$message.error(res.errmsg);
            return;
          }

          vm.$message.success('删除角色成功！');
          vm.nameChange();
        });
      },
    })
  } 

  getDiff(arr1:any,arr2:any){
    return [...new Set(arr1)].filter(item => 
      arr2.includes(item)
    )
  }
  /*
   * show用户弹窗-- 0：新增，1：编辑, 2: 批量修改
   */
  
  showUser(type: number, node?: any) {
    this.userType = type;
    if (node) {
      this.userData = [node];
    } else {
      this.userData = this.roleList.filter((item) => item.checked);
    }

    this.userVisible = true;
  }

  /*
   * 批量删除用户
   */
  deleteUser() {
    const vm = this;
    this.$confirm({
      title: '确定要批量删除吗？',
      okText: this.$t('languages.Apps.Ok').toString(),
      cancelText: this.$t('languages.Apps.Cancel').toString(),
      onOk() {
        vm.confirmDelUser();
      },
      onCancel() {},
    });
  }

  confirmDelUser() {
    const userIds: any = [];
    const deptIds: any = [];
    this.roleList.forEach((role: any) => {
      if (role.checked) {
        if (role.unitType === 1) {
          deptIds.push(role.deptId);
        } else {
          userIds.push(role.id);
        }
      }
    });

    const params = {
      roleId: this.userInfo.id,
      userIds,
      deptIds,
    };
    OrgApi.deleteRoleUser(params).then((res) => {
      if (!res.errcode) {
        this.$message.success('删除用户成功！');
        this.clearUserKey();
      } else {
        this.$message.error(res.errmsg as string);
      }
    });
  }

  /*
   * 重载树
   */
  reloadTree() {
    const treeParams: Organization.Roles.RequestChildrenTreeParams = {
      groupId: '',
    };
    this.searchRoleKeys = '';
    this.showOrgTree = false;
    this.expandedKeys = this.expandedKeysData();
    this.assignTreeParams(treeParams);
    if(this.appRoute || this.$route.params.appCode){
      this.getOrgRoleNode(this.appRoute || this.$route.params.appCode);
    }else{
      this.getOrgRoleNode();
    }
    setTimeout(() => {
      // 重新渲染tree, 默认展开搜索的角色组
      this.showOrgTree = true;
    }, 1);
    if(this.appRoute || this.$route.params.appCode){
      this.getRoleGroup(this.appRoute || this.$route.params.appCode);
    }
    this.reloadUser();
  }

  /**
   * 加载子节点
   */
  async loadChildrenNodes(e) {
    // 已展开的节点不再请求
    const { expanded, dataRef, pos } = e;

    if (expanded) {
      return;
    }

    if (dataRef.children && dataRef.children.length) {
      return;
    }
    if (!this.isRoleSearchResult) {
      const treeParams = {
        groupId: dataRef.id,
      };
      this.setEventKey({ dataRef });
      this.assignTreeParams(treeParams); // 设置参数
      this.getChildrenRole();
    }
  }

  /*
   * 重载用户列表
   */
  reloadUser() {
    this.clearRoleList();
    const listParams: Organization.Roles.RequestListParams = {
      roleId: this.roleTitle.id,
      page: 0,
      size: 100,
      filterType: 'admin',
    };
    this.getOrgRoleList({ params: listParams }).then(() => {
      this.userInfo = JSON.parse(JSON.stringify(this.roleTitle));
    });
  }

  get isBatchOperate() {
    return !this.roleList.filter((list: any) => list.checked).length;
  }

  get treeData() {
    if (this.isRoleSearchResult) {
      return this.orgTreeBySearch && this.dataRecursion(this.orgTreeBySearch);
    } else {
      return this.orgTree && this.dataRecursion(this.orgTree);
    }
  }

  dataRecursion(list: []) {
    const arr: any = [];
    list.map((i: any) => {
      i.scopedSlots = { title: 'title' };
      if (i.children && i.children.length) {
        i.children = this.dataRecursion(i.children);
      }
      arr.push(i);
    });
    return arr;
  }

  // 展开的节点key值
  expandedKeys: string[] = [];

  expandedKeysData() {
    let res: any[] = [];
    if (this.isRoleSearchResult) {
      if (this.orgTreeBySearch.length) {
        res = this.dataChangeAll(this.orgTreeBySearch, []);
      }
      return res;
    } else {
      if (this.orgTree && this.orgTree.length) {
        res = this.dataChange(this.orgTree, [], false);
      }
      return res;
    }
  }

  dataChangeAll(list: any, arr: any) {
    list.forEach((list: any) => {
      if (list.children && list.children.length) {
        arr.push(list.key);
        this.dataChangeAll(list.children, arr);
      }
    });
    return arr;
  }

  dataChange(list: any[], arr: any, status: boolean) {
    if (!list[0].isLeaf && list[0].children) {
      !status && arr.push(list[0].key);
      this.dataChange(list[0].children, arr, status);
    } else if (list[0].isLeaf && status) {
      arr.push(list[0].key);
    } else {
      //Else Empty block statement
    }
    return arr;
  }

  get defaultSelectedKeys() {
    let res: any[] = [];
    if (this.isRoleSearchResult) {
      return res;
    }
    if (
      this.orgTree &&
      this.orgTree.length &&
      this.orgTree[0].children &&
      this.orgTree[0].children.length
    ) {
      res = this.dataChange(this.orgTree, [], true);
      // res.push(this.orgTree[0].children[0].key);
    }
    return res;
  }

  getText(text: any) {
    return (
      text
        .map((item: any) => {
          return item.name;
        })
        .join(';') || '--'
    );
  }

  getText2(text: any) {
    return (
      text
        .map((item: any) => {
          return item.deptName;
        })
        .join(';') || '--'
    );
  }

  @Watch('roleList')
  computerRolistLength() {
    this.isDataEmpty = !this.roleList.length;
  }

  importRole() {
    this.importTitle = '导入-角色';
    this.importType = ImportType.role;
    this.isShowImportModal = true;
  }

  exportRole() {
    this.isShowExportRole = true;
  }

  // 改变导入按钮状态
  changeImportBtnStatus(status: boolean) {
    this.canImport = status;
  }

  //设置导入名称
  setImportFileName(fileName: string) {
    this.importFileName = fileName;
    this.errorFileName = fileName;
  }

  // 删除文件时
  removeFile(fileName: string) {
    this.errorFileName = fileName;

    this.delTemFile();
  }

  // 导入结束 无论成功失败
  errorFileName: any = '';

  importEndFn(data) {
    clearInterval(this.simulateInterval);
    if (!data) {
      return;
    }
    const { errorType } = data;
    if (errorType === 0) {
      this.importPercent = 100;
      this.importStatus = 'success';
      this.importStatusText = '导入成功';
    } else {
      this.showImportModalContent(ImportModalCons.info);
      this.importErrInfo = data;
      this.showConfirmButton = true;

      this.errorFileName = data.fileName as any;
    }

    this.reloadTree();
  }

  resetImportData() {
    this.showImportModel = false;

    this.showUploadModel = true;

    this.isShowDataInfo = false;

    this.importPercent = 0;

    this.simulateInterval = -1;

    this.isImportEnd = false;

    this.importStatus = 'active';

    this.importStatusText = '导入中';

    this.importErrInfo = {};

    this.importType = '';

    this.showCancelButton = true;

    this.showConfirmButton = false;

    this.showReImport = false;

    this.canImport = false;
  }

  reImport() {
    this.resetImportData();
    this.showImportModalContent(ImportModalCons.upload);
  }

  async confirmImport() {
    if (!this.importConfirm) {
      (window as any).setTimeout(() => {
        this.importConfirm = true;
      }, 1000);
      return false;
    }
    this.importConfirm = false;
    // this.showImportModalContent(ImportModalCons.import)
    const { importFileName } = this;

    const importRes: any = await orgApi.importRole(importFileName);

    this.importConfirm = true;
    if (importRes.errcode !== 0) {
      // 有错误
      const { data } = importRes;
      if (data.errorType === 999999) {
        // 网络错误
        this.importPercent = 75;
        this.importStatus = 'exception';
        this.importStatusText = '网络出现异常，导入失败！请重新导入';
        this.showReImport = true;
        this.showImportModalContent(ImportModalCons.import);
        return;
      }
      this.showImportModalContent(ImportModalCons.info);
      this.importErrInfo = importRes.data;
    } else {
      this.taskId = importRes.data.taskId;
      this.showImportModalContent(ImportModalCons.import);
      this.showCancelButton = false;
      this.simulateImport();
    }
  }

  //取消
  async handleCancel() {
    this.isShowImportModal = false;
    setTimeout(() => {
      clearInterval(this.simulateInterval);
      this.resetImportData();
    }, 100);

    this.delTemFile();
  }

  /**
   * 删除临时文件文件
   * */
  async delTemFile() {
    const { errorFileName } = this;
    if (!errorFileName) {
      return;
    }
    await orgApi.delTemFile({ fileName: errorFileName });

    this.errorFileName = '';
  }

  /**
   * @desc 展示导入框的内容
   * @model string 需要展示的模块 upload import info
   * */
  showImportModalContent(model: string = 'upload') {
    if (model === 'upload') {
      this.showUploadModel = true;
      this.showImportModel = false;
      this.isShowDataInfo = false;
    } else if (model === 'import') {
      this.showUploadModel = false;
      this.showImportModel = true;
      this.isShowDataInfo = false;
    } else if (model === 'info') {
      this.showUploadModel = false;
      this.showImportModel = false;
      this.isShowDataInfo = true;
    } else {
      //Else Empty block statement
    }
  }

  simulateImport() {
    let percent = 1;
    this.simulateInterval = setInterval(() => {
      if (!this.isImportEnd) {
        if (percent <= 90) {
          percent += this.random(5);
          this.importPercent = percent;
        }
      } else {
        clearInterval(this.simulateInterval);
      }
    }, 1500);
  }

  /**
   * 产生随机整数
   */
  random(num: number) {
    return Math.ceil(Math.random() * 5);
  }

  cancel() {
    this.isShowExportRole = !this.isShowExportRole;
  }

  offsetX1: number = 0;

  mouseEnter1(e) {
    const clientX = e.clientX - (e.offsetX > 0 ? e.offsetX : 0);
    const innerWidth = (window as any).innerWidth;
    const offsetX = innerWidth - clientX - 10 - 360;
    this.offsetX1 = offsetX < 0 ? offsetX : 0;
  }

  offsetX2: number = 0;

  mouseEnter2(e) {
    const clientX = e.clientX - (e.offsetX > 0 ? e.offsetX : 0);
    const innerWidth = (window as any).innerWidth;
    const offsetX = innerWidth - clientX - 10 - 360;
    this.offsetX1 = offsetX < 0 ? offsetX : 0;
  }
}
</script>

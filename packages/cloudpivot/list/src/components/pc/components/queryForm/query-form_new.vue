<template>
  <div class="query-form-wrapper">
    <div class="query-inner">
      <div class="left" :style="leftStyle">
        <div class="left-header">
          <span>
            我的查询
            <small>(最多6组)</small>
          </span>
        </div>

        <div class="menu-wrapper">
          <div
            v-for="(item, index) in CommonQueryList"
            :key="index"
            :class="{ active: currentQuery.id === item.id }"
            class="menu-item"
            @click="useCommonQuery(item)"
          >
            <span class="name" :title="item.name">
              {{ item.name }}
            </span>
            <div class="btns">
              <em
                v-if="index > 0"
                class="icon aufontAll h-icon-all-arrow-up-o"
                @click.stop="moveSortCommonQuery(item, 'up')"
              ></em>
              <em
                v-if="index < CommonQueryList.length - 1"
                class="icon aufontAll h-icon-all-arrow-down-o"
                @click.stop="moveSortCommonQuery(item, 'down')"
              ></em>
              <a-popconfirm
                :title="'确定删除查询条件？'"
                overlayClassName="sure-delete"
                :okText="$t('cloudpivot.formComment.pc.sure')"
                :cancelText="$t('cloudpivot.formComment.pc.cancel')"
                arrowPointAtCenter
                placement="topLeft"
                :align="{
                  offset: [-10, 0],
                }"
                @confirm="confirmDel(item)"
              >
                <!-- <a-icon
                  slot="icon"
                  type="question-circle-o"
                  class="delete-icon"
                /> -->
                <em
                  v-if="!item.patientia"
                  class="icon aufontAll h-icon-all-delete-o1"
                ></em>
              </a-popconfirm>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="right-header">
          <div class="toggle-show" @click="menuShow = !menuShow">
            <em v-if="menuShow" class="icon aufontAll h-icon-all-outdent"></em>
            <em v-else class="icon aufontAll h-icon-all-indent"></em>
          </div>
          <div class="name">
            <span v-if="!isEdit" @click="toEdit">
              {{ commonQueryParams.name }}
            </span>
            <a-input
              v-else
              ref="nameRef"
              v-model="commonQueryParams.name"
              @blur="blur"
            />
          </div>
          <div class="btns">
            <span
              :class="{ 'btn-disabled': CommonQueryList.length >= 6 }"
              @click="addCommonQuery('add')"
              >设为常用查询</span>
            <a-button v-if="currentQuery.id" @click="saveCommenQuery">
              保存
            </a-button>
          </div>
        </div>

        <QueryFormRenderer
          ref="QueryFormRenderer"
          :fields="fields"
          :dataItemList="dataItemList"
          :relevanceDataList="relevanceDataList"
          :GroupControlers="GroupControlers"
          :vm="this"
          @getRelevanceDataList="getRelevanceDataList"
          @query="query"
        />
      </div>
    </div>
    <!-- <div class="filter-mask" @click="closeQueryItem"></div> -->
  </div>
</template>

<script lang="ts">
import { Button, Icon, Popconfirm } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch, Provide } from 'vue-property-decorator';

import { listApi } from '../../../../../../api';

import QueryFormRenderer from './query-form-renderer.vue';

@Component({
  name: 'query-form',
  components: {
    AButton: Button,
    AIcon: Icon,
    QueryFormRenderer,
    APopconfirm: Popconfirm,
  },
})
export default class QueryForm extends Vue {
  @Prop()
  fields!: any[];

  @Prop()
  dataItemList!: any[];

  @Prop({
    default: 3,
  })
  cols!: number;

  @Prop()
  relevanceDataList!: [];

  controls = '' as any;

  menuShow: boolean = true;

  isFromAdmin: false;

  getRelevanceDataList() {
    this.$emit('getRelevanceDataList');
  }

  timer: any = null;

  // 查询
  query(data) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.$emit('setFilterData', data || {});
    }, 300);
  }

  backWriteData(value: any) {
    const formRenderer = this.$refs.formRenderer as any;
    if (formRenderer) {
      formRenderer.controller.value = value;
    }
  }

  // 隐藏搜索框
  closeQueryItem() {
    this.$emit('hide');
  }

  // 以下是常用查询组代码
  commonQueryParams: any = {
    name: '默认查询',
  };

  isEdit: boolean = false;

  toEdit() {
    if (this.currentQuery.id && !this.currentQuery.patientia) {
      this.isEdit = true;

      this.$nextTick(() => {
        (this.$refs.nameRef as HTMLElement).focus();
      });
    }
  }

  blur() {
    this.isEdit = false;

    this.addCommonQuery('save');
  }

  GroupControlers: any[] = [];

  // 添加/修改常用查询
  async addCommonQuery(type = 'add') {
    const name: any =
      this.commonQueryParams.name !== '默认查询'
        ? this.commonQueryParams.name
        : null;
    if (type === 'add' && this.CommonQueryList.length >= 6) {
      const names: string[] = this.CommonQueryList.map((el) => el.name);

      function testName(name: string) {
        if (names.includes(name)) {
        }
      }
      if (name) {
        testName(name);
      }
      return;
    }
    const ref: any = this.$refs.QueryFormRenderer;
    if (ref) {
      this.GroupControlers = ref.getGroupControler();
      const params = {
        queryCode: this.$route.query.queryCode || this.$route.query.code,
        schemaCode: this.$route.query.code,
        queryCondition: JSON.stringify(this.GroupControlers),
        type: 'VIEW_QUERY',
        name: name,
        id: type === 'save' ? this.currentQuery.id : undefined,
        sort: type === 'save' ? this.currentQuery.sort : undefined,
      };

      const res: any = await listApi.addCommonQuery(params);
      if (res.errcode === 0) {
        this.$message.success(res.errmsg as string);
        this.getCommonQueryList();
      } else {
        this.$message.error(res.errmsg as string);
      }
    }
  }

  created() {
    this.getCommonQueryList();
  }

  get leftStyle() {
    return {
      'min-width': this.menuShow ? '220px' : 0,
      'max-width': this.menuShow ? '220px' : 0,
      padding: this.menuShow ? '12px 6px 12px 12px' : 0,
    };
  }

  CommonQueryList: any[] = [];

  // 获取常用组列表
  async getCommonQueryList() {
    const params = {
      queryCode: this.$route.query.queryCode || this.$route.query.code,
      schemaCode: this.$route.query.code,
      type: 'VIEW_QUERY',
    };
    const res: any = await listApi.getCommonQueryList(params);
    if (res.errcode === 0) {
      this.CommonQueryList = res.data;

      if (res.data.length === 0) {
        this.CommonQueryList.push({
          name: '默认查询',
          patientia: true,
        });
        this.useDefaultCommonQuery(this.CommonQueryList[0]);
      } else {
        const ref: any = this.$refs.QueryFormRenderer;
        await ref.getControllers();
        this.useCommonQuery(this.CommonQueryList[0]);
      }
    }
  }

  // 删除常用组
  async deleteCommonQuery(item) {
    const self = this;
    this.$confirm({
      class: 'cus-confirm-modal',
      content: (h: any) =>
        h('div', [
          h('i', { class: 'icon aufontAll h-icon-all-question-circle' }),
          h('p', [`确定要删除？`]),
        ]),
      onOk() {
        self.confirmDel(item);
      },
      okText: this.$t('languages.common.ApplicationPortal.Delete') as string,
      cancelText: this.$t(
        'languages.common.ApplicationPortal.Cancel',
      ) as string,
      onCancel() {},
    });
  }

  async confirmDel(item) {
    const params = {
      ids: item.id,
    };
    const res: any = await listApi.deleteCommonQuery(params);
    if (res.errcode === 0) {
      this.$message.success(res.errmsg as string);
      this.getCommonQueryList();
    } else {
      this.$message.error(res.errmsg as string);
    }
  }

  currentQuery: any = {};

  // 使用保存的常用查询
  useCommonQuery(item) {
    if (item.patientia) {
      this.useDefaultCommonQuery(item);
    } else {
      this.currentQuery = item;
      this.GroupControlers = JSON.parse(item.queryCondition);
      this.commonQueryParams.name = item.name;
    }
  }

  // 使用默认查询
  useDefaultCommonQuery(item) {
    this.commonQueryParams.name = item.name;
    this.currentQuery = {};
    const ref: any = this.$refs.QueryFormRenderer;
    ref && ref.init();
  }

  // 常用组排序
  async moveSortCommonQuery(item, type: string) {
    const params = {
      id: item.id,
      moveDirection: type,
    };
    const res: any = await listApi.moveSortCommonQuery(params);
    if (res.errcode === 0) {
      this.getCommonQueryList();
    } else {
      this.$message.error(res.errmsg as string);
    }
  }

  // 修改常用组
  saveCommenQuery() {
    this.addCommonQuery('save');
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../../application/src/components/pc/style/custom-themes';
.query-form-wrapper {
  height: 100%;
  overflow: hidden;
}
.query-inner {
  background-color: #fff;
  border: 1px solid #eee;
  border-top: none;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row;
  max-height: 443px;
  overflow: hidden;
  height: 100%;
  .left {
    min-width: 220px;
    max-width: 220px;
    position: relative;
    background-color: #fff;
    border-right: 1px solid #eee;
    overflow: hidden;
    display: flex;
    flex-flow: column;
    padding: 12px;
    .left-header {
      border-bottom: 1px solid #eeeeee;
      padding-bottom: 12px;
      margin-right: 6px;
      position: relative;
      span {
        font-size: 14px;
        font-weight: 600;
        color: #111218;
        line-height: 22px;
      }
      small {
        font-size: 12px;
        font-weight: 400;
        color: rgba(17, 18, 24, 0.5);
      }
    }

    .menu-wrapper {
      overflow-y: scroll;
      .menu-item {
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: space-between;
        height: 36px;
        line-height: 36px;
        padding: 0 16px;
        cursor: pointer;
        &:hover {
          .btns {
            display: inline-block;
          }
          background: #eef4fd;
          .name {
            color: @primaryColor;
          }
        }
        .btns {
          min-width: 60px;
          display: none;
          text-align: right;
          em {
            font-size: 12px;
            margin-left: 8px;
            cursor: pointer;
            &:hover {
              color: @primaryColor;
              cursor: pointer;
            }
          }
        }
        .name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        &.active {
          background: #eef4fd;
          .name {
            color: @primaryColor;
          }
        }
      }
    }
  }
  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    .right-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      background-color: #f8f8fb;
      height: 42px;
      padding-right: 16px;
      padding-left: 24px;

      position: relative;
      .toggle-show {
        position: absolute;
        left: 0;
        border: 1px solid #eeeeee;
        border-left: none;
        border-radius: 0 2px 2px 0;
        background-color: #fff;
        top: 50%;
        transform: translate(-1px, -50%);
        width: 16px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        cursor: pointer;
        em {
          font-size: 12px;
          color: rgba(17, 18, 24, 0.5);
        }
        &:hover {
          em {
            color: @primaryColor;
          }
        }
      }

      .name {
        font-size: 14px;
        display: flex;
        align-items: center;
        span {
          display: inline-block;
          color: #111218;
          // border-bottom: 1px dashed #979797;
          line-height: 31px;
          white-space: nowrap;
          font-weight: 600;
        }
      }
      .btns {
        display: flex;
        align-items: center;
        span {
          margin-right: 16px;
          color: @primaryColor;
          font-size: 12px;
          cursor: pointer;
          &:hover {
            opacity: 0.8;
          }
          &.btn-disabled {
            color: rgba(17, 18, 24, 0.5);
            cursor: not-allowed;
            &:hover {
              opacity: 1;
            }
          }
        }
      }
    }
  }
}
.filter-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0);
  z-index: 1;
}
</style>
<style lang="less">
.cus-confirm-modal {
  .anticon-question-circle {
    display: none;
  }
  .ant-modal-confirm-content {
    font-size: 14px;
    color: #111218;
    line-height: 22px;
    p {
      font-size: 16px;
      font-weight: 600;
      color: #111218;
      line-height: 26px;
      margin-bottom: 0px;
      margin-left: 33px;
    }
    .h-icon-all-question-circle {
      font-weight: 400;
      color: #faad14;
      font-size: 24px;
      position: absolute;
      left: 31px;
      top: 42px;
    }
  }
  .ant-modal-confirm-btns {
    .ant-btn {
      height: 32px;
    }
  }
  .ant-btn-primary {
    background-color: #f0353f !important;
    border-color: #f0353f !important;
  }
}

.sure-delete {
  .ant-popover-content .ant-popover-arrow {
    display: inline-block;
  }
  .delete-icon {
    font-weight: 400;
    color: #faad14;
  }
  .ant-popover-message-title {
    width: 188px;
    height: 22px;
    font-size: 14px;
    font-weight: 400;
    color: #111218;
    line-height: 22px;
  }
  .ant-popover-buttons {
    .ant-btn {
      min-width: 44px;
    }
  }
}
</style>

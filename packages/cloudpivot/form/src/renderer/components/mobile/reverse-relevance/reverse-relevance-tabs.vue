<template>
  <div>
    <search-panel
      ref="searchPanel"
      class="reverse-relevance-tabs"
      :enableFilter="queryConditions && queryConditions.length > 0"
      :fetch="superFetch"
      :fitlerWrapClass="'reverse-relevance-conditions'"
      :class="{ 'reverse-relevance-search': !showPanel }"
      @filter="showFilterPanel"
    >
      <template slot-scope="{ data }">
        <!-- @click="openItem(item.data)" -->
        <!-- :isOpenForm="false" -->
        <div
          v-for="(item, index) in data"
          :key="index"
          class="item"
          @click="openItem(item.data)"
        >
          <form-item
            :formData="item"
            :queryColumns="queryColumns"
            class="reverse-relevance-item"
            :isOpenForm="false"
          />

          <!-- <div class="item__left">
          <h3-checkbox-item
            :value="item.id"
            :returnValue="[value.id]"
            @onClick="change(item)"
          ></h3-checkbox-item>
        </div>

        <div class="item__center">
          <form-item
            :formData="item"
            :isOpenForm="false"
            :queryColumns="queryColumns"
          />
        </div> -->
        </div>

        <!-- <div
          v-for="item in data"
          :key="item.id"
          @click="openItem(item)"
          class="item"
        >
          <div class="item__center">
            <div class="item__title">{{ item.name }}</div>

            <div class="item__desc">{{ $t('cloudpivot.form.renderer.label.createTime') }}{{ item.createdTime }}</div>

            <div class="item__desc">
              <h3-avatar
                icon="user"
                :src="getCreater(item).imgUrl"
                :size="28"
              ></h3-avatar>
              <span>&nbsp;{{ getCreater(item).name }}</span>
            </div>
            
            <div class="item__status">
              <form-status :status="item.sequenceStatus"></form-status>
            </div>

          </div>

        </div> -->
      </template>

      <template slot="fitler">
        <query-form
          :schemaCode="controlOpts.schemaCode"
          :queryConditions="queryConditions"
          class="reverse-relevance-search-panel"
          @commit="onFilter"
        />
      </template>
    </search-panel>
    <div
      v-show="isTabs && showPanel && hasAdd"
      class="reverse-relevance-add"
      @click="openForm"
    >
      <img src="./add.png" />
    </div>
  </div>
</template>

<script lang="ts">
import { H3Avatar, H3Checkbox } from 'h3-mobile-vue';
import { Component, Inject, Model, Prop } from 'vue-property-decorator';
import {
  RelevanceFormControl,
  ReverseRelevanceControl,
} from '../../../controls';
import { ReverseQueryService } from '../../../services';
import SearchPanel from '../relevance-form/search-panel.vue';

@Component({
  name: 'relevance-form-tabs',
  components: {
    SearchPanel,
    H3CheckboxItem: H3Checkbox.Item,
    H3Avatar,
  },
  directives: {
    // TransferDom
  },
})
export default class ReverseRelevanceTabs extends ReverseRelevanceControl {
  @Prop({
    default: false,
  })
  visible!: boolean;

  @Model('change')
  value!: any;

  @Inject({
    default: () => () => {},
  })
  emitScrollLock!: (lock: boolean) => void;

  queryConditions: any[] = [];

  queryFormData?: any[];

  queryActions: any[] = [];

  param: any = [];

  showPanel: boolean = true;

  get hasAdd() {
    return this.queryActions.find((x) => x.actionCode === 'add');
  }

  queryColumns: any[] = [];

  // relevanceForm:any = new RelevanceForm();

  // @Watch("visible")
  created() {
    const schemaCode = this.controlOpts.schemaCode || '';
    const listCode = this.controlOpts.listCode || '';
    const conditions = this.controlOpts.mobileConditions;
    const formControls = this.getFormControls();
    const c = this.control;

    const param = ReverseQueryService.getParams(
      conditions,
      formControls,
      c,
      this.findController,
    );
    this.param = param;
    ReverseQueryService.getListQueryConditions(
      schemaCode,
      listCode,
      param,
    ).then((res) => {
      this.queryConditions = res.conditions || [];
      this.queryActions = res.queryActions || [];
      this.queryColumns = res.queryColumns || [];
    });
  }

  mounted() {
    this.emitScrollLock(true);
    window.sessionStorage.removeItem('fullPath');
  }

  isSelected(item: any) {
    if (!this.value || !item) {
      return false;
    }
    return this.value.id === item.id;
  }

  back() {
    this.$emit('back');
  }

  getCreater(item: any) {
    if (Array.isArray(item.creater)) {
      if (item.creater.length > 0) {
        return item.creater[0];
      }
    }

    return {};
  }

  superFetch(page: number, pageSize: number, value: string, formStatus: any) {
    const schemaCode = this.controlOpts.schemaCode || '';
    const listCode = this.controlOpts.listCode || '';
    let params = this.queryFormData ? this.queryFormData : this.param;

    params = params.map((res: any) => {
      const code = res.propertyCode !== undefined ? res.propertyCode : res.code;
      const type = res.propertyType !== undefined ? res.propertyType : res.type;
      const val =
        res.propertyValue !== undefined ? res.propertyValue : res.value;
      return {
        code,
        type,
        value: val,
      };
    });

    if (formStatus) {
      const status = {
        code: formStatus.propertyCode,
        type: formStatus.propertyType,
        value: formStatus.propertyValue,
      };
      params.push(status);
    }

    return this.fetch(page, pageSize, value, params);
  }

  getStatus(status: string) {
    const txt = this.$t(
      `cloudpivot.form.renderer.formStatus.${status.toLowerCase()}`,
    );
    return txt;
    // switch (status) {
    //   case "DRAFT":
    //     return "草稿";
    //   case "PROCESSING":
    //     return "进行中";
    //   case "COMPLETED":
    //     return "已完成";
    //   case "CANCELED":
    //     return "已作废";
    //   default:
    //     return "";
    // }
  }

  showFilterPanel(show: boolean) {
    this.showPanel = !show;
  }

  onFilter(query: any[]) {
    this.showPanel = true;
    // this.queryFormData = query.map(x => ({
    //   code : x.propertyCode,
    //   type : x.propertyType,
    //   value : x.propertyValue
    // }));
    this.queryFormData = query;
    const searchPanel = this.$refs.searchPanel as any;
    if (searchPanel) {
      searchPanel.reFetch();
    }
  }

  beforeCreate() {
    (this.$options as any).components.FormStatus =
      RelevanceFormControl.loadFormStatus();

    (this.$options as any).components.QueryForm =
      RelevanceFormControl.loadQueryForm();

    (this.$options as any).components.FormItem =
      RelevanceFormControl.loadFormItem();
  }

  openForm() {
    const ac = this.queryActions.find((x) => x.actionCode === 'add');
    if (!ac) {
      return;
    }
    const fieldCode: string = this.controlOpts.fieldCode;
    const sheetParams: any = (this.controlOpts as any).sheetParams;
    const sequenceStatus: any = {};

    if (this.sequenceStatus && this.sequenceStatus !== 'DRAFT') {
      sequenceStatus[fieldCode] = sheetParams.id;
    }
    this.emitScrollLock(false);

    // 保存地址,等到提交表单之后返回当前页面
    window.sessionStorage.setItem('fullPath', this.$route.fullPath);
    if (ac.associationType === 1) {
      // 流程表单

      this.$router
        .push({
          name: 'form-detail',
          query: {
            startWorkflowCode: ac.associationCode,
            ...sequenceStatus,
          },
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      this.$router
        .push({
          // 业务表单
          name: 'form-detail',
          query: {
            schemaCode: ac.schemaCode,
            sheetCode: ac.associationCode,
            ...sequenceStatus,
          },
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
    //防止页面跳转后ui未更新
    window.location.reload();
  }

  openItem(item: any) {
    super.open(item);
  }
}
</script>

<style lang="less" scoped>
@import '../../../../../../common/styles/mixins.less';
.reverse-relevance-add {
  position: fixed;
  z-index: 99;
  right: 0.53rem;
  bottom: 1.15rem;
  img {
    height: 1.33rem;
    width: 1.33rem;
  }
}
.reverse-relevance-search {
  /deep/ .search-panel__content {
    overflow: hidden;
    .common-search {
      height: 100%;
      .common-search-group {
        height: 100%;
        .search-wrap {
          height: 100%;
          .query-form-left {
            & > div {
              padding-bottom: 2.4rem;
            }
          }
        }
      }
    }
  }
}
.item {
  background-color: #fff;
  position: relative;
  font-size: 15px;
  display: flex;
  .px2rem(margin, @horizontal-padding-md);
  .px2rem(border-radius, @border-radius-lg);
  .reverse-relevance-item {
    width: 100%;
  }

  &__title {
    color: #333333;
  }

  &__desc {
    color: #999999;
    .px2rem(margin-top, @horizontal-padding-sm);
  }

  &__left {
    display: inline-flex;
    align-items: center;
  }

  &__center {
    flex-grow: 1;
    position: relative;
    .px2rem(margin, @horizontal-padding-lg);
    // margin-left:0;
    // /deep/.work-item{
    //   width: 100%;
    // }
  }

  &__status {
    display: inline-block;
    position: absolute;
    right: 0;
    top: 0;

    /deep/img {
      width: 1.6rem !important;
      height: 1.28rem !important;
    }
  }

  & > i.icon {
    color: @primary-color;
    position: absolute;
    right: 1.5em;
    top: 40%;
  }
}

/deep/.common-search {
  &_buttom {
    background: #fff;
    .px2rem(padding-top, 16px);
  }

  & > .empty {
    text-align: center;
  }
}

.status {
  font-size: 10px;
  border-radius: 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 18px;
  padding: 0 0.5em;

  &.DRAFT {
    color: rgba(250, 173, 20, 1);
    border: 1px solid rgba(250, 173, 20, 1);
    background-color: rgba(250, 173, 20, 0.1);
  }

  &.PROCESSING {
    color: rgba(24, 144, 255, 1);
    border: 1px solid rgba(24, 144, 255, 1);
    background-color: rgba(24, 144, 255, 0.1);
  }

  &.COMPLETED {
    color: rgba(82, 196, 26, 1);
    border: 1px solid rgba(82, 196, 26, 1);
    background-color: rgba(82, 196, 26, 0.1);
  }

  &.CANCELED {
    color: rgba(190, 190, 190, 1);
    border: 1px solid rgba(190, 190, 190, 1);
    background-color: rgba(244, 244, 244, 1);
  }
}
</style>
<style lang="less">
.reverse-relevance-search-panel {
  top: 2.5rem !important;
}
.reverse-relevance-conditions {
  top: 2.5rem !important;
}
</style>

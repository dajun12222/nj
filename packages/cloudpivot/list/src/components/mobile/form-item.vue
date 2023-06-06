<template>
  <div @click="goForm">
    <base-item
      class="work-item"
      :title="formData.name"
      :avatar="formData.data.imgUrl"
      :username="formData.data.originator"
      :avatarPlacehold="true"
      :showCreater="showCreater"
    >
      <div
        slot="activitie"
        class="item-main"
        :class="{ 'has-status': showStatus }"
      >
        <p
          v-for="(col, idx) in columns"
          :key="idx"
          :class="`field-item-${idx}`"
        >
          <label>{{ col.name }}：</label>
          <span>{{ col.value }}</span>
        </p>
      </div>
      <div slot="right" class="item-status">
        <img v-if="showStatus" :class="classname" :src="imgUrl" />
        <!-- <span v-show="showTime">{{ formData.data.createdTime }}</span> -->
      </div>
    </base-item>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { listApi, listParams } from '../../../../api';
import common from '../../../../common/mobile';

const { getRealValue } = common.utils.BusinessFunctions;

@Component({
  name: 'formItem',
  components: {
    BaseItem: common.components.BaseItem,
  },
})
export default class formItem extends Vue {
  @Prop() formData!: any;

  @Prop() queryColumns!: any;

  @Prop({
    default: true,
  })
  isOpenForm!: Boolean;

  status: string = '';

  classname: string = '';

  stayTime: string = '';

  // 展示字段集合，包括其对应的值
  columns: Array<any> = [];

  get lang() {
    return localStorage.getItem('locale') || 'zh';
  }

  get showStatus() {
    return this.queryColumns.some(
      (col: listParams.QueryColumns) => col.propertyCode === 'sequenceStatus',
    );
  }

  get showTime() {
    return this.queryColumns.some(
      (col: listParams.QueryColumns) => col.propertyCode === 'createdTime',
    );
  }

  get showCreater() {
    return this.queryColumns.some(
      (col: listParams.QueryColumns) => col.propertyCode === 'creater',
    );
  }

  get imgUrl() {
    return this.status
      ? require(`../../../../common/assets/mobile/images/${this.status}${
          this.lang === 'zh' ? '' : '-en'
        }.png`)
      : '';
  }

  /**
   * 跳转到表单
   */
  goForm() {
    if (!this.isOpenForm) {
      return;
    }
    const params = {
      bizObjectId: this.formData.id,
      schemaCode: this.formData.schemaCode,
    };
    listApi.getFormUrl(params).then((res: any) => {
      if (res) {
        res += `&return=${this.$route.fullPath}`;
        this.$router
          .push({
            path: res,
          })
          .catch((err: any) => {
            console.log(err);
          });
      }
    });
  }

  /**
   * 设置卡片展示字段内容
   */
  generateColumns() {
    this.columns = this.queryColumns
      .map((col: listParams.QueryColumns) => {
        if (
          [
            'name',
            'createdTime',
            'creater',
            'originator',
            'sequenceStatus',
          ].indexOf(col.propertyCode) > -1
        ) {
          return null;
        }
        const {
          displayFormat,
          name,
          name_i18n,
          propertyCode,
          propertyType,
          sortKey,
        } = col;
        return {
          displayFormat,
          name,
          name_i18n,
          propertyCode,
          propertyType,
          sortKey,
          value: getRealValue(col, this.formData.data[propertyCode]),
        };
      })
      .filter(Boolean)
      .filter((item: any) => item.value || item.value === 0);
  }

  /**
   * 设置单据状态对应的图标
   */
  generateStatusIcon() {
    let randomIdx: number = 3;
    const sequenceStatus: any = this.formData
      ? this.formData.sequenceStatus
      : '';
    switch (sequenceStatus) {
      // 本地缓存
      case 'CACHE':
        randomIdx = 4;
        break;
      // 草稿
      case 'DRAFT':
        randomIdx = 0;
        break;
      // 进行中
      case 'PROCESSING':
      case 'null':
      case '':
        // TODO 进行中状态需要调整
        randomIdx = 1;
        break;
      // 完成
      case 'COMPLETED':
        randomIdx = 2;
        break;
      // 作废
      default:
        randomIdx = 3;
        break;
    }
    this.status = ['draft', 'pending', 'complete', 'closure', 'cache'][
      randomIdx
    ];
    this.classname = 'status';
  }

  beforeMount() {
    this.generateStatusIcon();
    this.generateColumns();
  }
}
</script>
<style lang="less" scoped>
@import '../../../../common/styles/mixins.less';
@timeout-width: 120px;
@timeout-height: 96px;
@warning-size: 30px;
.work-item {
  .item-main {
    &.has-status {
      .px2rem(min-height, 20px);
    }
  }
  .item-status {
    position: relative;
    span {
      position: absolute;
      width: 200%;
      .px2rem(bottom, 14px);
      right: 0;
      text-align: right;
      color: #999999;
    }
    .px2rem(margin-left, @horizontal-padding-sm);
    .px2rem(width, @timeout-width);
    .status {
      .px2rem(width, @timeout-width);
      .px2rem(height, @timeout-height);
    }
    .warning {
      .px2rem(height, @warning-size);
      .px2rem(width, @warning-size);
    }
  }
}
</style>

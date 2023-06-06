<template>
  <div class="query-field-group">
    <div
      v-if="useFields.length >= cur_controls.length"
      class="btn btn-disabled"
    >
      <span>
        <em class="icon aufontAll h-icon-all-plus-o"></em>
        {{ $t('cloudpivot.list.pc.filterBox.add') }}
      </span>
    </div>
    <div v-else class="btn">
      <a-popover
        trigger="click"
        placement="bottomLeft"
        overlayClassName="query-form-add-item"
      >
        <template slot="content">
          <div class="search">
            <span class="icon aufontAll">&#xea3f;</span>
            <a-input
              v-model="itemField"
              allowClear
              :placeholder="$t('cloudpivot.list.pc.filterBox.search')"
              @change="searchField"
            />
          </div>
          <div class="search-result">
            <template v-for="(control, index) in search_controls">
              <template
                v-if="
                  control.options.visible ||
                  control.options.visible === undefined
                "
              >
                <div
                  v-if="control.isUsed"
                  :key="control.key + index"
                  class="result-item item-disabled"
                >
                  <span>
                    {{
                      (isChinese
                        ? control.options.name
                        : control.options.name_i18n
                        ? JSON.parse(control.options.name_i18n).en ||
                          control.options.name
                        : control.options.name
                      ).substr(
                        0,
                        (isChinese
                          ? control.options.name
                          : control.options.name_i18n
                          ? JSON.parse(control.options.name_i18n).en ||
                            control.options.name
                          : control.options.name
                        ).indexOf(itemField),
                      )
                    }}<span class="blue">{{ itemField }}</span>{{
                      (isChinese
                        ? control.options.name
                        : control.options.name_i18n
                        ? JSON.parse(control.options.name_i18n).en ||
                          control.options.name
                        : control.options.name
                      ).substr(
                        (isChinese
                          ? control.options.name
                          : control.options.name_i18n
                          ? JSON.parse(control.options.name_i18n).en ||
                            control.options.name
                          : control.options.name
                        ).indexOf(itemField) + itemField.length,
                      )
                    }}
                  </span>
                </div>
                <div
                  v-else
                  :key="control.key + index"
                  class="result-item"
                  @click="
                    () => {
                      control.isUsed = true;
                      addFieldItem(control);
                    }
                  "
                >
                  <span>
                    {{
                      (isChinese
                        ? control.options.name
                        : control.options.name_i18n
                        ? JSON.parse(control.options.name_i18n).en ||
                          control.options.name
                        : control.options.name
                      ).substr(
                        0,
                        (isChinese
                          ? control.options.name
                          : control.options.name_i18n
                          ? JSON.parse(control.options.name_i18n).en ||
                            control.options.name
                          : control.options.name
                        ).indexOf(itemField),
                      )
                    }}<span class="blue">{{ itemField }}</span>{{
                      (isChinese
                        ? control.options.name
                        : control.options.name_i18n
                        ? JSON.parse(control.options.name_i18n).en ||
                          control.options.name
                        : control.options.name
                      ).substr(
                        (isChinese
                          ? control.options.name
                          : control.options.name_i18n
                          ? JSON.parse(control.options.name_i18n).en ||
                            control.options.name
                          : control.options.name
                        ).indexOf(itemField) + itemField.length,
                      )
                    }}
                  </span>
                </div>
              </template>
            </template>
            <div v-if="!search_controls.length" class="no-result">
              <span>暂无搜索结果</span>
            </div>
          </div>
        </template>
        <!-- <span @click="addFieldItem(false)"> -->
        <span>
          <em class="icon aufontAll h-icon-all-plus-o"></em>
          {{ $t('cloudpivot.list.pc.filterBox.add') }}
        </span>
      </a-popover>
    </div>
    <div class="query-form-items">
      <template v-for="(control, index) in useFields">
        <queryFieldItem
          :key="control.key + index"
          :ref="'item_' + index"
          :control="control"
          :controls="cur_controls"
          :index="index"
          :isRelevance="isRelevance"
          @delFieldItem="delFieldItem"
          @valueChange="valueChange"
          @fieldChange="fieldChange"
          @filterChange="filterChange"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import queryFieldItem from './query-field-item2.vue';
import { Popover, Input } from '@h3/antd-vue';

@Component({
  name: 'queryFieldGroup',
  components: {
    queryFieldItem,
    APopover: Popover,
    AInput: Input,
  },
})
export default class queryFieldGroup extends Vue {
  @Prop() controls!: any[];

  @Prop() index!: number;

  @Prop() isRelevance!: boolean;

  @Prop({
    default: false,
  })
  isReset?: boolean;

  cur_controls: any[] = [];

  itemField: string = '';

  search_controls: any[] = [];

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  valueChange() {
    // this.$emit('valueChange');
    this.getData();
  }

  filterChange(obj: any) {
    let ind: number = -1;
    for (let i = 0; i < this.useFields.length; i++) {
      if (this.useFields[i].key === obj.key1) {
        ind = i;
        break;
      }
    }
    if (this.$refs[`item_${ind}`] && this.$refs[`item_${ind}`][0]) {
      (this.$refs[`item_${obj.index}`][0] as any).filterCtrt = [
        (this.$refs[`item_${ind}`][0] as any).ctrl,
      ];
    }
  }

  // 获取值
  getData() {
    const res: any[] = [];
    this.resetIsUsed();
    this.useFields.forEach((el, index) => {
      const ref: any =
        this.$refs['item_' + index] && this.$refs['item_' + index][0];
      if (ref && ref.getValue) {
        const ResVal = ref.getValue();
        this.setIsUsed(ResVal.propertyCode, true);
        res.push(ResVal);
      }
    });
    return res;
  }

  getValue() {
    return this.getData();
  }

  clearValue() {
    this.useFields.forEach((el, index) => {
      const ref: any =
        this.$refs['item_' + index] && this.$refs['item_' + index][0];
      if (ref && ref.clearValue) {
        const ResVal = ref.clearValue();
      }
    });
  }

  getControler() {
    const res: any[] = [];
    this.useFields.forEach((el, index) => {
      const ref: any =
        this.$refs['item_' + index] && this.$refs['item_' + index][0];
      if (ref && ref.getControler) {
        const ResVal = ref.getControler();
        res.push(ResVal);
      }
    });
    return res;
  }

  useFields: any[] = [];

  fieldChange(data) {
    this.useFields[data.index] = this.controls.find(
      (el) => el.key === data.key,
    );
  }

  delFieldItem(propertyCode) {
    this.useFields = this.useFields.filter((el) => {
      if (el.key === propertyCode) {
        this.setIsUsed(propertyCode, false);
        return false;
      } else {
        return true;
      }
    });

    // if (this.useFields.length === 0) {
    //   // 没有字段之后删除组
    //   this.$emit('delGroup', this.index);
    // }

    // this.$emit('valueChange');
  }

  resetIsUsed() {
    this.cur_controls.forEach((el) => {
      el.isUsed = false;
    });
  }

  setIsUsed(propertyCode, type: boolean) {
    this.cur_controls.forEach((el) => {
      if (el.key === propertyCode) {
        this.$set(el, 'isUsed', type);
      }
    });
    this.cur_controls = [...this.cur_controls];
  }

  addFieldItem(el?: any) {
    if (el) {
      this.useFields.push(el);
    } else {
      const item = this.getNextItem();
      if (item) {
        item.isUsed = true;
        this.useFields.push(item);
      }
    }
  }

  // 获取下一个未用过的字段
  getNextItem() {
    return this.controls.find((el) => !el.isUsed);
  }

  created() {
    this.cur_controls = [...this.controls];

    this.cur_controls.forEach((el) => {
      if (el.isUsed) {
        this.addFieldItem(el);
      }
    });
    //保持用户设置的排序而不是取默认排序
    if (this.useFields.length > 1 && this.useFields[0].sorts !== undefined) {
      this.useFields.sort((a, b) => {
        return a.sorts > b.sorts ? 1 : -1;
      });
    }

    this.search_controls = this.cur_controls.filter((el: any) => {
      const name: string = this.isChinese
        ? el.options.name
        : el.options.name_i18n
        ? JSON.parse(el.options.name_i18n).en || el.options.name
        : el.options.name;
      return this.itemField ? name.includes(this.itemField) : true;
    });

    if (this.isReset) {
      // this.useFields = [...this.controls]
      this.$emit('resetOver', this.index);
    }
  }

  searchField() {
    this.search_controls = this.cur_controls.filter((el: any) => {
      const name: string = this.isChinese
        ? el.options.name
        : el.options.name_i18n
        ? JSON.parse(el.options.name_i18n).en || el.options.name
        : el.options.name;
      return this.itemField ? name.includes(this.itemField) : true;
    });
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../../application/src/components/pc/style/custom-themes';
.query-field-group {
  padding: 16px 0 0;
  height: 100%;
  .query-form-items {
    height: calc(100% - 32px);
    overflow-y: scroll;
    padding-bottom: 12px;
  }
}
.line {
  height: 20px;
  margin-bottom: 4px;
  position: relative;
  text-align: center;
  span {
    position: relative;
    z-index: 2;
    font-size: 12px;
    line-height: 20px;
    color: rgba(17, 18, 24, 0.5);
    background-color: #fff;
    padding: 0 16px;
  }
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 0px;
    background-color: #eee;
    border-top: 1px solid #eee;
    top: 50%;
    margin-top: -0.5px;
  }
}
.btn {
  font-size: 14px;
  color: @primaryColor;
  display: inline-block;
  height: 22px;
  font-weight: 400;
  line-height: 22px;
  margin-bottom: 10px;
  padding: 0 24px;
  span {
    display: flex;
    align-items: center;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  em {
    font-size: 16px;
    margin-right: 8px;
    line-height: 20px;
    height: 19px;
  }

  &.btn-disabled {
    color: rgba(17, 18, 24, 0.25);
    span {
      &:hover {
        opacity: 1;
        cursor: not-allowed;
      }
    }
  }
}
</style>
<style lang="less">
@import './../../../../../../application/src/components/pc/style/custom-themes';
.query-form-add-item {
  padding: unset;
  .ant-popover-inner {
    width: 189px;
    background: #ffffff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    .ant-popover-inner-content {
      padding: unset;
      .search {
        height: 33px;
        line-height: 32px;
        display: flex;
        padding: 0 12px;
        align-items: center;
        border-bottom: 1px solid #d7d7d7;
        .icon {
          font-size: 18px;
          color: #111218;
        }
        .ant-input {
          border: unset;
          padding: 4px 9px;
          &:focus {
            box-shadow: unset;
          }
        }
      }
      .search-result {
        max-height: 192px;
        overflow-y: auto;
        .result-item {
          height: 32px;
          padding: 5px 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          &:hover {
            cursor: pointer;
            background-color: #eef4fd;
          }
          > span {
            height: 22px;
            font-size: 14px;
            font-weight: 400;
            color: #111218;
            line-height: 22px;
          }
          &.item-disabled {
            > span {
              color: rgba(17, 18, 24, 0.25);
            }
            &:hover {
              cursor: not-allowed;
              background-color: #ffffff;
            }
          }
          .blue {
            color: @primaryColor;
          }
        }
        .no-result {
          text-align: center;
          padding: 74px 0;
          span {
            height: 17px;
            font-size: 12px;
            font-weight: 400;
            color: rgba(17, 18, 24, 0.5);
            line-height: 17px;
          }
        }
      }
    }
  }
}
</style>

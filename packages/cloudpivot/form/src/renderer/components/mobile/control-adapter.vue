<template>
  <div v-if="isTitle" v-show="show"></div>
  <description v-else-if="isDescription" v-show="show" :control="control" />

  <form-sheet :id="id" v-else-if="isSheet" :control="control" />
  <!-- <system-control
    :control="control"
    v-else-if="isSystem"
    v-show="show"
  ></system-control> -->

  <!-- <a-col class="ant-col" :span="span" v-else v-show="show"> -->

  <div
    :id="id"
    v-else
    v-show="show"
    class="form-col-child"
    :class="{
      labelShow:
        control.options.labelVisible !== false &&
        !(control.isRelevanceQuery && ![12, 13].includes(control.type)),
    }"
  >
    <span
      v-if="
        control.options.labelVisible === false &&
        control.options.requiredFormula
      "
      class="requiredIcon"
    ></span>
    <div v-if="control.isRelevanceQuery" class="isRelevanceQuery">
      <div class="control-remove" @click="onControlRemove(id)">
        <span class="icon aufontAll h-icon-all-close"></span>
      </div>
      <span class="control-label">{{ label }}</span>
      <div class="right" @click="showActionSheetChange">
        <span>
          {{ OpTs }}
          <template v-if="showActionSheet">
            <i class="icon aufontAll h-icon-all-down-o"></i>
          </template>
          <template v-else>
            <i class="icon aufontAll h-icon-all-right-o"></i>
          </template>
        </span>
      </div>
      <H3Actionsheet
        v-model="showActionSheet"
        class="sheet-adjust"
        :menus="actionSheetMenusValues"
        showCancel
        cancelText="取消"
        @on-click-menu="clickActionSheetMenu"
      />
    </div>
    <template
      v-if="
        !IsEmpty ||
        (control.filterType !== 'IS_NULL' &&
          control.filterType !== 'IsNull' &&
          control.filterType !== 'IS_NOT_NULL' &&
          control.filterType !== 'IsNotNull')
      "
    >
      <base-control-adapter
        :control="control"
        :class="{ error: hasError, vertical: layoutType }"
      />
    </template>
  </div>

  <!-- </a-col> -->
</template>
<script lang="ts">
import { DataItemType } from 'cloudpivot/form/schema';
import { H3Actionsheet } from 'h3-mobile-vue';
import { Component, Inject, Watch } from 'vue-property-decorator';
import { getMobileComponentByControlType } from '../../../../../form/utils';
import { FormControlType } from '../../typings';
import ControlAdapter from '../control-adapter';
import Description from '../layout/description.vue';
import FormTitle from '../layout/form-title.vue';
import BaseControlAdapter from './base-control-adapter.vue';
import SystemControl from './system-control.vue';
import { renderer } from '../../../../../form';
import {
  toFormControl,
  toFormControlType,
} from '../../../../../list/src/components/pc/components/queryForm/query-form-util';
import {
  getRulesList,
  getRulesLisForRelevance,
} from 'cloudpivot/form/src/typings/view-filter-type-map';

@Component({
  name: 'control-adapter',
  components: {
    BaseControlAdapter,
    FormTitle,
    Description,
    SystemControl,
    H3Actionsheet,
    // FormSheet
  },
})
export default class MobileControlAdapter extends ControlAdapter {
  @Inject({
    default: () => () => {},
  })
  layoutTypeFn!: Function;

  //切换比较符号
  @Inject({
    default: () => () => {},
  })
  controllerChange!: Function;

  @Inject()
  controlRemove!: (id: string) => void;

  IsEmpty: boolean = true;

  //上下布局模式
  get layoutType() {
    if (this.layoutTypeFn) {
      return this.layoutTypeFn();
    }
  }

  beforeCreate() {
    const comp: any = getMobileComponentByControlType(FormControlType.Sheet);
    if (comp && comp.mobile) {
      (this.$options as any).components.FormSheet = comp.mobile;
    }
  }

  mounted() {}

  actionSheetMenusValues: any[] = [];

  showActionSheet: boolean = false;

  currentItem: any = ''; // 当前选中的ctrl

  /**
   * 切换比较符号
   */
  clickActionSheetMenu(value: any) {
    this.showActionSheet = false;
    if (value === 'cancel') {
      return;
    }
    this.IsEmpty = ['IsNotNull', 'IsNull'].includes(value);
    const changeParam = {
      key: this.control.key,
      filterType: value,
    };

    this.controllerChange && this.controllerChange(changeParam);
  }

  /**
   * 过滤出对应数据项的比较符号有哪些
   */
  showActionSheetChange() {
    this.showActionSheet = true;
    this.actionSheetMenusValues = [];
    const rulesList = (
      this.isFormDetail ? getRulesLisForRelevance : getRulesList
    )(this.control.propertyType, this.control.key);
    this.actionSheetMenusValues = rulesList.map((item) => {
      return {
        label: item.name,
        type: 'Default',
        value: item.value,
      };
    });
    console.log('this.actionSheetMenusValues', this.actionSheetMenusValues);
  }

  /**
   * 移除数据项查询条件
   */
  onControlRemove(id) {
    this.controlRemove(id);
  }

  get isFormDetail() {
    return this.$route.path === '/form/detail';
  }
}
</script>

<style lang="less">
@import '../../../../../common/styles/mixins.less';
.isRelevanceQuery {
  font-size: 15px;
  color: #666666;
  display: flex;
  justify-content: space-between;
  line-height: 25px;
  background: #fff;
  position: relative;
  .control-label {
    .px2rem(width, 234px);
    padding-left: 15px;
    padding-top: 10px;
    text-align: left;
  }
  .right {
    padding: 10px 0;
    padding-right: 15px;
    width: 100%;
    text-align: left;
    font-size: 15px;
    color: #333333;
    border-bottom: 1px solid #eeeeee;
    i {
      float: right;
      font-size: 12px;
      color: #999999;
    }
  }
  .control-remove {
    position: absolute;
    top: -22px;
    right: 12px;
    width: 30px;
    text-align: center;
    height: 18px;
    line-height: 18px;
    background: #cccccc;
    .px2rem(border-radius, 18px);
    .aufontAll {
      color: #fff;
      font-size: 12px;
    }
  }
}
.vertical .h3-FBH,
.field.vertical {
  display: block;
}

.vertical .h3-FBH > .h3-FB1,
.vertical .h3-FBH > .h3-FB2,
.vertical .h3-FBH > .h3-FB3 {
  width: 100%;
  position: relative;
  padding-top: 0;
}

.h3-org.vertical .h3-FBH .h3-field-layout-h-label,
.vertical.form-sheet .h3-org-field .h3-field-layout-h-label {
  padding-bottom: 0;
}

.h3-org .h3-org-field .h3-field-box {
  min-height: auto;
}

.h3-org .h3-org-field .h3-field-box .h3-PR {
  padding-bottom: 0;
}

/* 处理子表基础控件上下布局样式 */
.h3-form-sheet.vertical .field {
  display: block;
}

.h3-form-sheet.vertical .field__label {
  width: 100%;
  position: relative;
  padding: 10px 0;
}

.h3-form-sheet.vertical .field__control {
  padding-top: 0;
  padding-bottom: 10px;
}

/* 处理子表中的关联表单控件上下布局样式 */
.h3-form-sheet.vertical .relevance-form .field__control {
  padding-bottom: 10px;
}

.h3-form-sheet.vertical .relevance-form .clear {
  position: absolute;
  bottom: 11px;
  right: 32px;
}

.h3-form-sheet.vertical .relevance-form .h-icon-all-right-o {
  position: absolute;
  right: 20px;
  bottom: 14px;
}
/* 处理子表中的逻辑控件上下布局样式 */
.vertical .input-logic .h3-field-box > .h3-FB1 {
  text-align: left;
}

/* 处理子表中的手写签名控件上下布局样式 */
.vertical .input-signsture .row__file {
  display: block;
}

/* 处理子表数值控件上线布局 */
.h3-form-sheet.vertical .ant-input-number-input-wrap {
  height: 30px;
}
.h3-form-sheet.vertical .icon-base-close-circle {
  position: absolute;
  right: 20px;
  bottom: 10px;
}
.form-col-child {
  position: relative;
  .requiredIcon:before {
    content: '*';
    color: #f4454e;
    position: absolute;
    left: 0.5em;
    top: 1.8em;
  }
}

.labelShow {
  .h3-field-layout-h-label {
    display: block !important;
    text-align: left;
  }
}

.sheet-adjust {
  .h3ui-actionsheet__menu,
  .h3ui-actionsheet__action {
    .h3ui-actionsheet__cell {
      color: #333333;
      .px2rem(border-radius, 30px);
    }
  }
}
</style>

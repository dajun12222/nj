<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    title="子表编辑"
    width="800px"
    :visible="value"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    wrapClassName="child-table-modal"
    :keyboard="false"
    @cancel="cancel"
    @ok="handleOk"
  >
    <div class="popover-wrap">
      <a-row class="row">
        <a-col :span="leftWidth">
          <label class="title">{{ $t('languages.Apps.SheetTitle') }}</label>
        </a-col>
        <a-col :span="centerWidth">
          <label class="title">{{ $t('languages.Apps.DisplayName') }}</label>
        </a-col>
      </a-row>
      <a-row class="row" :gutter="[8, 8]">
        <a-col :span="leftWidth">
          <a-input
            :value="`${modalData.propertyName || modalData.name}[${
              modalData.code
            }]`"
            class="dataitem-title"
            disabled
          />
        </a-col>
        <a-col :span="centerWidth" class="width_180">
          <a-input
            v-model="backData.name"
            maxlength="200"
            :class="{ 'input-error': !backData.name }"
          />
          <div v-if="!backData.name" class="empty-tip">
            {{ $t('languages.Apps.DisplayNameRequire') }}
          </div>
        </a-col>
        <a-col :span="rightWidth" />
        <a-col :span="displayWidth" />
      </a-row>
      <a-row class="row content-title" :gutter="[8, 8]">
        <a-col :span="leftWidth">
          <label class="title">{{ $t('languages.Apps.SheetDataItem') }}</label>
        </a-col>
        <a-col :span="centerWidth">
          <label class="title">{{ $t('languages.Apps.DisplayName') }}</label>
        </a-col>
        <a-col :span="rightWidth">
          <label class="title">{{ $t('languages.Apps.DisplayFormat') }}</label>
        </a-col>
        <a-col :span="displayWidth">
          <label class="title">{{
            $t('languages.Apps.DisplayCondition')
          }}</label>
        </a-col>
      </a-row>
      <draggable
        :list="backData.childColumns"
        :options="dragOptions"
        class="row-content"
        handle=".handles"
      >
        <template v-for="(item, index) in backData.childColumns">
          <a-row
            v-if="
              item.parentCode === sheetCode || item.schemaCode === sheetCode
            "
            :key="index"
            class="row"
            :gutter="[8, 8]"
          >
            <span class="icon aufontAll handles handlesSub"> &#xe63e; </span>
            <a-col :span="leftWidth">
              <a-input
                :value="`${item.tempName}[${item.propertyCode || item.code}]`"
                class="dataitem-title"
                disabled
              />
            </a-col>
            <a-col :span="centerWidth" class="width_180">
              <a-input
                v-model="item.name"
                maxlength="200"
                :class="{ 'input-error': !item.name }"
              />
              <div v-if="!item.name" class="empty-tip">
                {{ $t('languages.Apps.DisplayNameRequire') }}
              </div>
            </a-col>
            <a-col :span="rightWidth">
              <a-select
                v-if="item.propertyType === 3"
                v-model="item.displayFormat"
                class="select"
                :placeholder="$t('languages.PlaceHolder.Select')"
              >
                <a-select-option
                  v-for="(option, ids) in DateType"
                  :key="ids"
                  :value="option.type"
                >
                  {{ $t(`languages.Apps.ListControl.${option.text}`) }}
                </a-select-option>
              </a-select>
              <a-select
                v-else-if="item.propertyType === 2"
                v-model="item.displayFormat"
                class="select"
                :placeholder="$t('languages.PlaceHolder.Select')"
              >
                <a-select-option
                  v-for="(option, ids) in numberType"
                  :key="ids"
                  :value="option.type"
                >
                  {{ $t(`languages.Apps.ListControl.${option.text}`) }}
                </a-select-option>
              </a-select>
              <a-input v-else value="--" disabled />
            </a-col>
            <a-col :span="displayWidth">
              <a-switch v-model="item.isQueryColumn" class="middle-size" />
            </a-col>
          </a-row>
        </template>
      </draggable>
      <template v-if="hasDatasouceItem">
        <a-row class="row content-title" :gutter="[8, 8]">
          <a-col :span="leftWidth">
            <label class="title">数据源数据项</label>
          </a-col>
          <a-col :span="centerWidth">
            <label class="title">{{ $t('languages.Apps.DisplayName') }}</label>
          </a-col>
          <a-col :span="rightWidth">
            <label class="title">{{
              $t('languages.Apps.DisplayFormat')
            }}</label>
          </a-col>
          <a-col :span="displayWidth">
            <label class="title">{{
              $t('languages.Apps.DisplayCondition')
            }}</label>
          </a-col>
        </a-row>
        <draggable
          :list="backData.childColumns"
          :options="dragOptions"
          class="row-content"
          handle=".handles"
        >
          <template v-for="(item, index) in backData.childColumns">
            <a-row
              v-if="
                item.parentCode !== sheetCode && item.schemaCode !== sheetCode
              "
              :key="index"
              class="row"
              :gutter="[8, 8]"
            >
              <a-col :span="leftWidth">
                <a-input
                  :value="`${item.tempName}[${item.propertyCode || item.code}]`"
                  class="dataitem-title"
                  disabled
                />
              </a-col>
              <a-col :span="centerWidth" class="width_180">
                <a-input
                  v-model="item.name"
                  maxlength="200"
                  :class="{ 'input-error': !item.name }"
                />
                <div v-if="!item.name" class="empty-tip">
                  {{ $t('languages.Apps.DisplayNameRequire') }}
                </div>
              </a-col>
              <a-col :span="rightWidth">
                <a-select
                  v-if="item.propertyType === 3"
                  v-model="item.displayFormat"
                  class="select"
                  :placeholder="$t('languages.PlaceHolder.Select')"
                >
                  <a-select-option
                    v-for="(option, ids) in DateType"
                    :key="ids"
                    :value="option.type"
                  >
                    {{ $t(`languages.Apps.ListControl.${option.text}`) }}
                  </a-select-option>
                </a-select>
                <a-select
                  v-else-if="item.propertyType === 2"
                  v-model="item.displayFormat"
                  class="select"
                  :placeholder="$t('languages.PlaceHolder.Select')"
                >
                  <a-select-option
                    v-for="(option, ids) in numberType"
                    :key="ids"
                    :value="option.type"
                  >
                    {{ $t(`languages.Apps.ListControl.${option.text}`) }}
                  </a-select-option>
                </a-select>
                <a-input v-else value="--" disabled />
              </a-col>
              <a-col :span="displayWidth">
                <a-switch v-model="item.isQueryColumn" class="middle-size" />
              </a-col>
            </a-row>
          </template>
        </draggable>
      </template>
    </div>
  </a-modal>
</template>
<script lang="ts">
import {
  Button,
  Checkbox,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Switch,
  Table,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { DateType, numberType } from '../../control-modals-map';
import Draggable from 'vuedraggable';

@Component({
  name: 'TableSetting',
  components: {
    ARow: Row,
    ACol: Col,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button,
    ACheckbox: Checkbox,
    ATable: Table,
    ASwitch: Switch,
    AModal: Modal,
    Draggable,
  },
})
export default class TableSetting extends Vue {
  @Prop() value!: boolean;

  @Prop() modalData!: any;

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  iconWidth: number = 2;

  leftWidth: number = 7;

  centerWidth: number = 7;

  rightWidth: number = 7;

  displayWidth: number = 3;

  DateType = DateType;

  numberType = numberType;

  visible: boolean = true;

  backData = {
    /*  显示格式 */
    name: '',
    propertyCode: '',
    propertyType: 0,
    sumType: null,
    width: 176,
    unit: 0,
    childColumns: [],
  };

  dragOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    forceFallback: true,
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 100,
  };

  handleOk() {
    if (this.backData.name === '') {
      return;
    }
    // 判断子表子数据项name非空
    const isNotEmpty = this.backData.childColumns.every(
      (item: any) => item.name,
    );
    if (!isNotEmpty) {
      return;
    }
    this.backData.childColumns.forEach((item) => {
      delete item.tempName;
    });
    this.backData.propertyCode = this.modalData.code;
    this.backData.propertyType = this.modalData.type;
    let confirmData = null;
    if (this.modalData.data) {
      const data = JSON.parse(JSON.stringify(this.modalData.data));
      confirmData = { ...data, ...this.backData };
    } else {
      const data = JSON.parse(JSON.stringify(this.modalData));
      confirmData = { ...data, ...this.backData };
    }
    this.$emit('confirm', confirmData);
    this.cancel();
  }

  cancel() {
    this.$emit('close');
  }

  @Watch('value')
  onModalShow(v: any) {
    if (v) {
      if (this.modalData.data) {
        this.backData.childColumns = JSON.parse(
          JSON.stringify(this.modalData.data.childColumns),
        );
        this.backData.name = this.modalData.name;
      } else {
        this.backData.childColumns = JSON.parse(
          JSON.stringify(this.modalData.childColumns),
        );
        this.backData.name = this.modalData.name;
      }
      this.backData.childColumns.forEach((item) => {
        item.tempName = item.name;
      });
    }
  }

  get hasDatasouceItem() {
    return this.backData.childColumns.some(
      (item) =>
        item.parentCode !== this.sheetCode &&
        item.schemaCode !== this.sheetCode,
    );
  }

  get sheetCode() {
    return this.modalData.code;
  }
}
</script>
<style lang="less">
@import '~@/styles/color/colors.less';

.child-table-modal {
  .ant-modal-body {
    padding: 0 24px;
  }
  .popover-wrap {
    .row {
      padding: 0 30px;
      font-size: 13px;
      &.content-title {
        padding-top: 20px;
        .ant-col-3 {
          height: unset;
        }
      }
      .title {
        font-size: 12px;
        color: @nav-font-color;
        font-weight: bold;
        line-height: 22px;
      }
      .dataitem-title {
        background: #fff;
        color: @nav-font-color;
        border: 0;
        text-overflow: ellipsis;
        padding-left: 0;
        overflow: hidden;
      }
      .handles {
        position: absolute;
        font-size: 13px;
        color: @light-font-color;
        padding-top: 1px;
        width: 26px;
        top: 13px;
        left: 10px;
        cursor: move;
      }
      .ant-col-6 {
        box-sizing: border-box;
        line-height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ant-col-3 {
        line-height: 32px;
        box-sizing: border-box;
        height: 38px;
      }
      .l-h {
        line-height: 32px;
        font-size: 14px;
        display: block;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .select {
        width: 100%;
      }
      .ant-input {
        height: 30px;
      }
      .ant-select-selection {
        height: 30px;
      }
    }
    .row-content {
      max-height: 320px;
      overflow-y: auto;
      overflow-x: hidden;
      width: 100%;
      .row:first-child {
        padding-top: 4px;
      }
    }
    .empty-tip {
      color: @red-6;
      font-size: 12px;
      position: absolute;
      padding-left: 12px;
    }
    input.input-error {
      border-color: @red-6;
    }
  }
}
</style>

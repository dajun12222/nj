<template>
  <div class="relevance-form-modal">
    <a-input
      :value="text"
      :readonly="true"
      :placeholder="placeholder"
      :disabled="readonlyFormula"
      @click="onClick"
      @mouseover="onMouseenter"
      @mouseout="onMouseleave"
    >
      <a-icon
        v-show="hover"
        slot="suffix"
        type="close-circle"
        @click="clear"
        @mouseenter="onMouseenter"
      />
      <a-icon v-show="!hover" slot="suffix" type="file" />
    </a-input>

    <a-modal
      :title="formTitle"
      :visible="visible"
      :width="full ? '100%' : '1200px'"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      :dialogClass="dialogClass"
      @ok="onModalOk"
      @cancel="onModalCancel"
    >
      <a-tooltip v-show="!full" placement="top">
        <template slot="title">
          <span>{{ $t('cloudpivot.form.runtime.biz.fullScreen') }}</span>
        </template>
        <span class="fullscreen icon aufontAll" @click="fullScreen(true)">&#xe8e5;</span>
      </a-tooltip>

      <a-tooltip v-show="full" placement="top">
        <template slot="title">
          <span>{{ $t('cloudpivot.form.runtime.biz.smallScreen') }}</span>
        </template>
        <span class="fullscreen icon aufontAll" @click="fullScreen(false)">&#xe8e7;</span>
      </a-tooltip>
      <list-selector
        v-model="selected"
        :newCol="newCol"
        multiple="true"
        :listCode="controlOpts.queryCode"
        :schemaCode="controlOpts.schemaCode"
        :cols="2"
        :columns="columns"
        :relevanceFormCode="control"
        :showActions="false"
        :query="query"
        :reverseViewFlag="!!control.options.showField"
        :defuaultShowSearch="false"
        :isAuthorize="isAuthorize"
        :control="control"
        @change="onListChange"
      />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { listApi } from '../../../../../../api';
import { DataItemType } from '../../../../../../form/schema';
import { RelevanceFormControl } from '../../../../../../form/src/common/controls/relevance-form-control';
import {
  Icon,
  Input,
  // TreeSelect,
  Modal,
  Spin,
  Tooltip,
} from '@h3/antd-vue';
import cloneDeep from 'lodash/cloneDeep';
import { Component, Prop, Provide } from 'vue-property-decorator';

@Component({
  name: 'relevance-form-modal',
  components: {
    ATooltip: Tooltip,
    AModal: Modal,
    AInput: Input,
    AIcon: Icon,
    ASpin: Spin,
  },
})
export default class RelevanceFormModal extends RelevanceFormControl {
  @Prop({
    default: {},
  })
  control!: any;

  visible = false;

  selected = new Array();

  selectedNew = new Array();

  allSelect = new Array();

  query = {};

  hover = false;

  full = false;

  newCol: any = [];

  @Provide()
  isMultiStatus() {
    return true;
  }

  mounted() {
    if (this.ctrl.value && this.ctrl.value.id) {
      if (typeof this.ctrl.value.id === 'string') {
        const strArr = this.ctrl.value.id.split(';');
        this.selected = strArr.map((el: string, index: number) => {
          const res: any = {
            id: el,
          };

          let showName: any = '';
          if (this.ctrl.value.hasOwnProperty('showName')) {
            showName = 'showName';
          } else if (this.ctrl.value.hasOwnProperty(this.getDisplayField)) {
            showName = this.getDisplayField;
          } else if (this.ctrl.value.hasOwnProperty('name')) {
            showName = 'name';
          } else {
            //Else Empty block statement
          }

          if (showName) {
            res[showName + '_base'] =
              this.ctrl.value[showName].split(';')[index];
          }

          return res;
        });
      }
    }
  }

  get text() {
    const itemKey = this.getDisplayField;

    const value = this.ctrl.value;
    if (value && value.items && Array.isArray(value.items)) {
      const res = value.items
        .map((item: any) => {
          if (item.hasOwnProperty(itemKey)) {
            return typeof item[itemKey] === 'boolean'
              ? item[itemKey]
              : item[itemKey] || '空';
          }
        })
        .filter((el) => el !== undefined)
        .join(';');
      return res;
    }

    if (Array.isArray(this.ctrl.value) && this.ctrl.value.length > 0) {
      let s = '';
      this.ctrl.value.forEach((item) => {
        let val: any = item[itemKey];
        if (val === undefined) {
          val = item[itemKey + '_base'];
        }
        if (val === undefined) {
          val = item['name'];
        }
        const currentTitle = this.parseDisplayFieldValue(val, itemKey);
        s += currentTitle + ';';
      });
      s = s.substring(0, s.length - 1);
      return s;
    } else if (this.ctrl.value) {
      // 考虑到关联多选导入时没有传itemKey, 服务给出showName, 这种情况直接取showName
      let showName: any = '';
      if (this.ctrl.value.hasOwnProperty('showName')) {
        showName = this.ctrl.value['showName'];
      } else if (this.ctrl.value.hasOwnProperty(itemKey)) {
        showName = this.ctrl.value[itemKey];
      } else if (this.ctrl.value.hasOwnProperty('name')) {
        showName = this.ctrl.value['name'];
      } else {
        //Else Empty block statement
      }
      if (showName) {
        if (showName[showName.length - 1] === ';') {
          showName = showName.substr(0, showName.length - 1);
        }
        const nameArr = showName.split(';');
        showName = nameArr.map((item) => (item ? item : '空')).join(';');
      }
      return showName;
    } else {
      return '';
    }
  }

  get dialogClass() {
    // { 'full-modal': full, 'relevance-form': true }
    if (this.full) {
      return 'full-modal relevance-form';
    } else {
      return 'relevance-form';
    }
  }

  async onClick() {
    this.query = this.getParams();
    let relevanceFormCode = this.control.parentKey
      ? `${this.control.parentKey}.${this.control.key}`
      : this.control.key;
    if (this.control.path) {
      relevanceFormCode = this.control.path.join('.');
    }
    if (
      this.control.options.showField &&
      Array.isArray(this.control.options.showField) &&
      this.control.options.showField.length > 0
    ) {
      const param = {
        sheetCode: this.control.options.sheetParams.sheetCode,
        schemaCode: this.control.options.sheetParams.schemaCode,
        relevanceFormCode: relevanceFormCode,
      };
      const res: any = await listApi.selectFormTitle(param);
      if (res.errcode === 0) {
        res.data.configBizPropertyList.map((options) => {
          options.code = options.code === 'id' ? 'ids' : options.code;
          options.propertyCode = options.code;
          options.width = '120';
          options.childColumns =
            options.subSchema && options.subSchema.properties;
          if (
            options.propertyType === DataItemType.Sheet &&
            options.childColumns
          ) {
            options.childColumns = options.childColumns.map((v) => {
              v.propertyCode = v.code;
              v.vcTitle = v.name;
              v.width = '150';
              return v;
            });
          }
          return options;
        });

        this.newCol = res.data.configBizPropertyList;
        this.visible = true;
        this.formTitleObj = await RelevanceFormControl.service.getBizmodelTitle(
          this.controlOpts.schemaCode || '',
        );
      }
    } else {
      this.visible = true;
    }
  }

  onMouseenter() {
    this.hover = true;
  }

  onMouseleave() {
    this.hover = false;
  }

  clear() {
    this.ctrl.value = null;
    this.selected = [];
    this.selectedNew = [];
  }

  onListChange(rows: any) {
    this.selected = rows;
    const data = cloneDeep(rows);
    data.forEach((o) => {
      for (const key in o) {
        if (Array.isArray(o[key])) {
          var i = o[key].length;
          while (i--) {
            if (o[key][i].checked === false) {
              o[key].splice(i, 1);
            }
          }
        }
      }
    });
    this.selectedNew = data;
  }

  fullScreen(full: boolean) {
    this.full = full;

    try {
      if (full) {
        (
          window.parent.window.document.querySelector(
            '.icon-close',
          ) as HTMLElement
        ).style.display = 'none';
      } else {
        (
          window.parent.window.document.querySelector(
            '.icon-close',
          ) as HTMLElement
        ).style.display = 'block';
      }
    } catch (error) {}
  }

  async onModalOk() {
    this.allSelect = cloneDeep(this.selected);
    //关联多选 人员回显不了 待查
    const item = await this.convertForMappings(this.allSelect);
    this.visible = false;
    const value = this.ctrl.value;
    //解决编辑状态下新增数据时原有的数据显示会有问题的bug
    if (value && value.items && Array.isArray(value.items)) {
      for (let con of item) {
        let arrItem = value.items.filter((x) => {
          return con.id === x.id;
        });
        if (arrItem.length > 0) {
          con.SystemName = arrItem[0].SystemName;
        }
      }
    } else if (Array.isArray(value) && value.length > 0) {
      for (let con of item) {
        let arrItem = value.filter((x) => {
          return con.id === x.id;
        });
        if (arrItem.length > 0) {
          con.SystemName = arrItem[0].SystemName;
        }
      }
    }
    if (item) {
      this.interceptorValue(item);
      setTimeout(() => {
        this.setValue(cloneDeep(item));
      }, 300);
    }
    // this.interceptorValue(item);
    // this.setValue(item);
    // setTimeout(() => {
    //   this.setValue(deepCopy(item));
    // }, 500);
  }

  onModalCancel() {
    this.visible = false;
    this.full = false;
    this.fullScreen(false);
    if (this.allSelect) {
      this.selected = this.allSelect;
    } else {
      this.selected = [];
    }
    if (this.ctrl.value) {
      // this.selected = this.ctrl.value;
    }
  }

  get isAuthorize() {
    return this.control.options.isAuthorize;
  }

  beforeCreate() {
    const comp = RelevanceFormControl.loadListSelector();

    (this.$options as any).components.ListSelector = comp;
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-modal-wrap {
  display: flex;
  align-items: center;
  .ant-modal.relevance-form {
    top: unset;
    padding-bottom: unset;
  }
}
.ant-input-suffix > i {
  color: #ccc;
}

.relevance-form-modal .anticon-close-circle {
  cursor: pointer;
  transition: color 0.3s;
  font-size: 12px;

  &:hover {
    color: #999;
  }

  &:active {
    color: #666;
  }
}

.fullscreen {
  position: absolute;
  top: 16px;
  right: 58px;
  cursor: pointer;
}

.full-modal .fullscreen {
  right: 58px;
}

.full-modal .list-selector {
  height: 100%;
}
</style>

<style lang="less">
.relevance-form:not(.full-modal) .ant-modal-body .list-selector {
  height: 66vh;
  // overflow: auto;
}
</style>

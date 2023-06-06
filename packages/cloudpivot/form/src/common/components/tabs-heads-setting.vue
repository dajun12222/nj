<template>
  <div class="tabs-heads-setting">
    <draggable
      v-model="heads"
      element="div"
      :options="dragOptions"
      class="draggable"
      :disabled="$route.path.includes('apps/versionDetail/')"
      @end="onSortEnd"
    >
      <div v-for="(item, index) in heads" :key="item.key + index" class="row">
        <div class="move">
          <span class="icons">
            <i class="aufontAll h-icon-all-drag"></i>
          </span>
        </div>

        <div class="input-wrapper" @pointerdown.stop>
          <a-input
            v-model="item.title"
            :disabled="$route.path.includes('apps/versionDetail/')"
            @change="onOk"
            @pointerdown.stop
          />
        </div>

        <div class="operation" @pointerdown.stop>
          <span class="icons" @pointerdown.stop>
            <i
              class="aufontAll h-icon-all-setting-o"
              @click="setting(index)"
            ></i>
          </span>

          <span class="icons" @pointerdown.stop>
            <a-icon
              v-show="heads.length > 1"
              type="delete"
              @click="remove(index)"
            />
          </span>
        </div>
      </div>
    </draggable>

    <div class="actions">
      <em class="icon aufontAll h-icon-all-plus-o" @click="add"></em>
    </div>

    <a-modal
      class="condition-rules-modal"
      title="Tab条件设置"
      :visible="conditionVisible"
      :maskClosable="false"
      :keyboard="false"
      width="640px"
      @cancel="onConditionCancel"
    >
      <dataitem-condition v-model="model" :items="dataItems" />
      <template slot="footer">
        <a-button key="cancel" @click="onConditionCancel"> 取消 </a-button>
        <a-button
          key="ok"
          :disabled="$route.path.includes('apps/versionDetail/')"
          type="primary"
          @click="onConditionOk"
        >
          确定
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { schema } from '../../../../form';
import DataitemCondition from '../data-item/dataitem-condition2.vue';
import { DataItemState } from '../../stores/data-items.store';
import * as dataitemStore from '../../stores/data-items.store-helper';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import { Modal, Col, Row, Button, Icon, Input } from '@h3/antd-vue';

@Component({
  name: 'TabsHeadsSetting',
  components: {
    Draggable,
    DataitemCondition,
    AModal: Modal,
    AButton: Button,
    AIcon: Icon,
    ARow: Row,
    ACol: Col,
    AInput: Input,
  },
})
export default class TabsHeadsSetting extends Vue {
  @Prop({
    default: () => {},
  })
  modalData!: any;

  @Prop()
  getControl!: () => schema.FormTabs;

  heads: any[] = [];

  addKeys: string[] = [];

  number = 0;

  model: any = {
    type: 1,
    conditions: '',
  };

  dataItems: DataItemState[] = [];

  conditionVisible: Boolean = false;

  //点击设置给定当前选中的行的下标
  currentIndex: number = 0;

  dragOptions = {
    animation: 150,
    ghostClass: 'ghostClass',
  };

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange() {
    this.addKeys = [];
    if (this.modalData.data.value) {
      this.heads = this.modalData.data.value.map((x) => Object.assign({}, x));

      const reg = /\d+/;
      this.number = this.modalData.data.value
        .map((h) => {
          const result = reg.exec(h.key);
          if (!result) {
            return 0;
          }
          return Number(result[0]);
        })
        .sort((a, b) => a - b)
        .pop();
    } else {
      this.heads = [];
    }
  }

  remove(index: number) {
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    const key = this.heads[index].key;
    this.heads.splice(index, 1);
    const i = this.addKeys.findIndex((k) => k === key);
    if (i > -1) {
      this.addKeys.splice(i, 1);
    }
    this.onOk();
  }

  setting(index: number) {
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    this.conditionVisible = true;
    this.currentIndex = index;
    const currentSource: any = this.heads[index];
    this.buildDataItems();
    if (currentSource.changeFormula) {
      this.handleExpToData(currentSource.changeFormula);
    }
    //currentSource.changeFormula &&

    this.onOk();
  }

  buildDataItems() {
    this.dataItems = dataitemStore.getDataItems(this).filter((x) => x.used);
  }

  add() {
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    const key = 'tab' + (++this.number).toString();

    this.heads.push({
      key,
      title: key,
    });
    this.addKeys.push(key);

    this.onOk();
  }

  onSortEnd() {
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    this.onOk();
  }

  onCancel() {
    this.$emit('closeModal');
  }

  onOk() {
    const data: any = {
      value: this.heads,
    };
    for (const h of this.heads) {
      const { title } = h;
      if (/\"|\'|\‘|\“'/.test(title)) {
        console.error(title);
        this.$message.error('Tab名称不能包含:双引号和单引号');
        return;
      }
    }

    const tabs = this.getControl();
    tabs.panels
      .map((panel, index) => {
        if (this.heads.some((h) => h.key === panel.key)) {
          return -1;
        }
        return index;
      })
      .filter((index) => index !== -1)
      .reverse()
      .forEach((index) => tabs.panels.splice(index, 1));

    this.addKeys.forEach((key) => {
      tabs.panels.push({
        key,
        type: schema.FormControlType.TabsPanel,
        options: {},
        controls: {} as any,
        layout: [],
      });
    });

    this.$emit('backData', data);
  }

  onConditionOk() {
    this.conditionVisible = false;
    const currentSource: any = this.heads[this.currentIndex];
    currentSource['changeFormula'] = this.model.conditions;
    this.resetModel();
  }

  onConditionCancel() {
    this.conditionVisible = false;
    this.resetModel();
  }

  resetModel() {
    this.model = {
      type: 1,
      conditions: '',
    };
    this.onOk();
  }

  //把表达式转化为数据
  handleExpToData(exp: string) {
    let type: number = 1;
    if (exp.indexOf('||') > -1) {
      type = 2;
    }
    this.model = {
      type,
      conditions: exp,
    };
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../cloudpivot/common/common';
.row {
  display: flex;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
  .move {
    margin-right: 10px;
    .icons {
      cursor: move;
      i {
        color: rgba(17, 18, 24, 0.5);
        font-size: 14px;
        &:hover {
          color: #2970ff;
        }
      }
    }
  }
  .input-wrapper {
    width: 203px;
  }
  .operation {
    white-space: nowrap;
    .icons {
      cursor: pointer;
      margin-left: 10px;
      i {
        color: rgba(17, 18, 24, 0.5);
        font-size: 14px;
        &:hover {
          color: #2970ff;
        }
      }
    }
  }
}

.col {
  display: flex;
  align-items: center;

  &.operation {
    & > .icons {
      margin-left: @base10-padding-sm;
    }

    & i {
      cursor: pointer;

      &.h-icon-all-drag {
        cursor: move;
      }
    }
  }
}

.actions {
  text-align: center;
  & > button {
    border: 0;
    box-shadow: none;
  }
}

.tabs-heads-setting {
  height: unset !important;
  position: relative;
  .actions {
    position: absolute;
    top: -29px;
    right: 1px;
    em {
      &:hover {
        cursor: pointer;
        color: #2970ff !important;
      }
    }
  }
}
</style>

<style lang="less">
.condition-rules-modal {
  .ant-modal-body {
    max-height: calc(100vh - 308px);
    overflow: auto;
  }
}
</style>

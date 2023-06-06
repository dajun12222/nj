<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-02 09:23:29
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 09:57:05
 * @FilePath: \yunshu6.0\packages\cloudpivot\form\src\common\components\document-strategy-modal.vue
 * @Description:
-->
<template>
  <div class="sequenceNo-setting">
    <a-form-item
      :labelCol="{ span: isModal ? 3 : 4 }"
      :wrapperCol="{ span: isModal ? 21 : 20 }"
      labelAlign="left"
    >
      <template slot="label">
        <span class="item-label">单据号</span>
        <a-tooltip overlayClassName="seqNo-tool-tips1">
          <template slot="title">
            <span class="tips-text">单据号最大长度不能超过200字符，设置时请注意</span>
          </template>
          <span class="icon aufontAll tips-icon">&#xe9ab;</span>
        </a-tooltip>
      </template>
      <Draggable
        :list="seqNoSetting"
        :options="dragOptions"
        handle=".drag-icon"
        @update="listChange"
      >
        <template v-for="(settingItem, index) in seqNoSetting">
          <div
            :key="index"
            class="setting-item-box"
            :class="settingItem.focus ? 'focus' : ''"
            @click="focusItem(index)"
            @mouseover="mouseOver"
          >
            <span class="icon aufontAll drag-icon">&#xe63e;</span>
            <span>{{ seqNoSettingNodeConfig[settingItem.type].name }}</span>
            <span
              v-if="seqNoSettingNodeConfig[settingItem.type].deletable"
              class="icon aufontAll delete-icon"
              @click.stop="deleteItem(index)"
              >&#xe8c5;</span>
          </div>
        </template>
        <a-popover
          v-if="seqNoSetting.length < 10"
          v-model="addMenuVisible"
          overlayClassName="seqNoAddMenu"
          trigger="click"
          placement="bottomLeft"
          @visibleChange="seqNoAddMenuChange"
        >
          <template slot="content">
            <template v-for="(item, index) in seqNoAddMenu">
              <div
                v-if="item.deletable"
                :key="index"
                class="add-menu-item"
                @click="addItem(item.code)"
              >
                {{ item.name }}
              </div>
              <!-- <div class="add-menu-item" @click="addItem('SEQNO')">流水号</div>
              <div class="add-menu-item" @click="addItem('CONSTANT')">固定值</div>
              <div class="add-menu-item" @click="addItem('PROPERTY')">数据项</div>
              <div class="add-menu-item" @click="addItem('DELIMITER')">
                连接符
              </div>
              <div class="add-menu-item" @click="addItem('UID')">
                UID
              </div> -->
            </template>
          </template>
          <div class="setting-item-add">
            <span class="icon aufontAll add-icon">&#xe8da;</span>
          </div>
        </a-popover>
      </Draggable>
      <div v-if="itemFocus >= 0" class="item-setting">
        <template v-if="theItem.type === 'DATE'">
          <a-row>
            <a-col :span="isModal ? 5 : 4">
              <span class="property-label">日期格式</span>
            </a-col>
            <a-col span="12">
              <a-select
                v-model="theItem.value"
                :options="dateFormatList"
                class="property-setting"
                @change="valChange('')"
              />
            </a-col>
          </a-row>
        </template>
        <template v-else-if="theItem.type === 'SEQNO'">
          <a-row>
            <a-col :span="isModal ? 7 : 8">
              <span class="preperty-other1">自动补0</span>
              <a-tooltip overlayClassName="seqNo-tool-tips2">
                <template slot="title">
                  <span class="tips-text">以长度6为例，默认勾选“自动补0”；勾选后，流水号是000001-999999，不勾选，是1-999999</span>
                </template>
                <span class="icon aufontAll tips-icon">&#xe9ab;</span>
              </a-tooltip>
              <a-switch
                v-model="theItem.value.leftPad"
                size="small"
                @change="valChange('leftPad')"
              />
            </a-col>
            <a-col v-if="theItem.value.leftPad" :span="2">
              <span class="property-label">长度</span>
            </a-col>
            <a-col v-if="theItem.value.leftPad" span="12">
              <a-select
                v-model="theItem.value.maxLength"
                :options="maxLengthList"
                class="property-setting"
                style="width: 58px"
                @change="valChange('maxLength')"
              />
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="isModal ? 5 : 4">
              <span class="property-label">重置策略</span>
            </a-col>
            <a-col span="12">
              <a-radio-group
                v-model="theItem.value.resetDate"
                class="property-setting"
                name="radioGroup"
                @change="valChange('resetDate')"
              >
                <a-radio
                  v-for="i in resetDateList"
                  :key="i.value"
                  :value="i.value"
                >
                  {{ i.label }}
                </a-radio>
              </a-radio-group>
            </a-col>
          </a-row>
        </template>
        <template v-else-if="theItem.type === 'DELIMITER'">
          <a-row>
            <a-col :span="isModal ? 5 : 4">
              <span class="property-label">连接符</span>
            </a-col>
            <a-col span="12">
              <a-radio-group
                v-model="theItem.value"
                class="property-setting"
                name="radioGroup"
                @change="valChange('')"
              >
                <a-radio
                  v-for="i in delimiterList"
                  :key="i.value"
                  :value="i.value"
                >
                  {{ i.label }}
                </a-radio>
              </a-radio-group>
            </a-col>
          </a-row>
        </template>
        <template v-else-if="theItem.type === 'PROPERTY'">
          <a-row>
            <a-col :span="isModal ? 5 : 4">
              <span class="property-label data-item" @canplay="valChange('')">数据项字段</span>
              <a-tooltip overlayClassName="seqNo-tool-tips3">
                <template slot="title">
                  <span class="tips-text">数据提交时，取数据项的值生成单据号；数据项值修改不影响已生成的单据号</span>
                </template>
                <span class="icon aufontAll tips-icon">&#xe9ab;</span>
              </a-tooltip>
            </a-col>
            <a-col span="12">
              <config-provider :locale="locale">
                <a-select
                  v-model="theItem.value"
                  class="property-setting"
                  allowClear
                  placeholder="请选择"
                  @change="valChange('')"
                >
                  <a-select-opt-group label="业务数据项">
                    <template v-for="(item, index) in getField(theItem)">
                      <a-select-option :key="index" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </template>
                  </a-select-opt-group>
                </a-select>
              </config-provider>
            </a-col>
          </a-row>
        </template>
        <template v-else-if="theItem.type === 'CONSTANT'">
          <a-row>
            <a-col :span="isModal ? 5 : 4">
              <span class="property-label data-item">固定值</span>
              <a-tooltip overlayClassName="seqNo-tool-tips3">
                <template slot="title">
                  <span class="tips-text">固定值不能以空格开头，且长度最大不超过60个字符</span>
                </template>
                <span class="icon aufontAll tips-icon">&#xe9ab;</span>
              </a-tooltip>
            </a-col>
            <a-col span="12">
              <a-input
                v-model="theItem.value"
                class="property-setting"
                :class="{ 'has-error': hasError }"
                :maxLength="60"
                @change="valChange('')"
              />

              <div v-if="hasError" class="error-content">
                {{ errorContent }}
              </div>
            </a-col>
          </a-row>
        </template>
        <template v-else-if="theItem.type === 'UID'">
          <a-row>
            <a-col :span="10">
              <span class="property-label">此内容不支持自定义配置</span>
            </a-col>
          </a-row>
        </template>
      </div>
      <!-- <a-input v-model="options.prefix"/> -->
    </a-form-item>
    <a-row class="sequenceNo-example">
      <a-col class="the-label" :span="isModal ? 3 : 4">
        <span class="example-label">预览</span>
      </a-col>
      <a-col class="the-body" :span="isModal ? 21 : 20">
        <div class="example-text">
          {{ theExample }}
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import { DataItemType } from '../../../../form/schema';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import {
  ConfigProvider,
  Row,
  Col,
  Form,
  Tooltip,
  Popover,
  Select,
  Checkbox,
  Radio,
  Input,
  Switch,
} from '@h3/antd-vue';

export enum DataEnum {
  none = 1,
  DAY = 10,
  MONTH = 8,
  YEAR = 6,
}

export enum SeqNoSettingType {
  CONSTANT = 'CONSTANT',
  DELIMITER = 'DELIMITER',
  DATE = 'DATE',
  PROPERTY = 'PROPERTY',
  SEQNO = 'SEQNO',
  UID = 'UID',
}

@Component({
  name: 'DataItemDocStrategy',
  components: {
    Draggable,
    ConfigProvider,
    ARow: Row,
    ACol: Col,
    AForm: Form,
    AFormItem: Form.Item,
    ATooltip: Tooltip,
    APopover: Popover,
    ASelect: Select,
    ACheckbox: Checkbox,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ASelectOptGroup: Select.OptGroup,
    ASelectOption: Select.Option,
    AInput: Input,
    ASwitch: Switch,
  },
})
export default class DataItemDocStrategy extends Vue {
  @Prop() dataType: any;

  @Prop() options: any;

  @Prop() dataItems: any;

  @Prop({ default: false }) isModal: any;

  seqNoSetting: any[] = [];

  addMenuVisible: boolean = false;

  itemFocus: number = -1;

  theItem: any = {};

  hasError: boolean = false;

  errorContent: string = '';

  DataItemTypes = DataItemType;

  dragOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    forceFallback: true,
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 50,
  };

  seqNoSettingNodeConfig: any = {
    CONSTANT: {
      name: '固定值',
      deletable: true,
    },
    DELIMITER: {
      name: '连接符',
      deletable: true,
    },
    DATE: {
      name: '日期',
      deletable: true,
    },
    PROPERTY: {
      name: '数据项',
      deletable: true,
    },
    SEQNO: {
      name: '流水号',
      deletable: true,
    },
    UID: {
      name: 'UID',
      deletable: true,
    },
  };

  dateFormatList = [
    {
      value: 'yyyy',
      label: '年',
      labelX: new Date().getUTCFullYear(),
    },
    {
      value: 'yyyyMM',
      label: '年月',
      labelX:
        new Date().getUTCFullYear() +
        (new Date().getUTCMonth() + 1 < 10 ? '0' : '') +
        (new Date().getUTCMonth() + 1),
    },
    {
      value: 'yyyyMMdd',
      label: '年月日',
      labelX:
        new Date().getUTCFullYear() +
        (new Date().getUTCMonth() + 1 < 10 ? '0' : '') +
        (new Date().getUTCMonth() + 1) +
        (new Date().getUTCDate() + 1 < 10 ? '0' : '') +
        (new Date().getUTCDate() + 1),
    },
    {
      value: 'yyyy-MM',
      label: '年-月',
      labelX:
        new Date().getUTCFullYear() +
        (new Date().getUTCMonth() + 1 < 10 ? '-0' : '-') +
        (new Date().getUTCMonth() + 1),
    },
    {
      value: 'yyyy-MM-dd',
      label: '年-月-日',
      labelX:
        new Date().getUTCFullYear() +
        (new Date().getUTCMonth() + 1 < 10 ? '-0' : '-') +
        (new Date().getUTCMonth() + 1) +
        (new Date().getUTCDate() + 1 < 10 ? '-0' : '-') +
        (new Date().getUTCDate() + 1),
    },
    {
      value: 'yyyy/MM',
      label: '年/月',
      labelX:
        new Date().getUTCFullYear() +
        (new Date().getUTCMonth() + 1 < 10 ? '/0' : '/') +
        (new Date().getUTCMonth() + 1),
    },
    {
      value: 'yyyy/MM/dd',
      label: '年/月/日',
      labelX:
        new Date().getUTCFullYear() +
        (new Date().getUTCMonth() + 1 < 10 ? '/0' : '/') +
        (new Date().getUTCMonth() + 1) +
        (new Date().getUTCDate() + 1 < 10 ? '/0' : '/') +
        (new Date().getUTCDate() + 1),
    },
    // {
    //   value: 'none',
    //   label: '空',
    // },
  ];

  resetDateList = [
    {
      value: 'DAY',
      label: '天',
    },
    {
      value: 'MONTH',
      label: '月',
    },
    {
      value: 'YEAR',
      label: '年',
    },
    {
      value: 'none',
      label: '不重置',
    },
  ];

  maxLengthList = [
    {
      value: '4',
      label: '4',
    },
    {
      value: '5',
      label: '5',
    },
    {
      value: '6',
      label: '6',
    },
    {
      value: '7',
      label: '7',
    },
    {
      value: '8',
      label: '8',
    },
    {
      value: '9',
      label: '9',
    },
    {
      value: '10',
      label: '10',
    },
  ];

  delimiterList = [
    {
      value: '_',
      label: '下划线（_）',
    },
    {
      value: '-',
      label: '中划线（-）',
    },
    {
      value: '#',
      label: '井号（#）',
    },
  ];

  seqNoAddMenu = [
    {
      name: '日期',
      code: 'DATE',
      deletable: true,
    },
    {
      name: '流水号',
      code: 'SEQNO',
      deletable: true,
    },
    {
      name: '固定值',
      code: 'CONSTANT',
      deletable: true,
    },
    {
      name: '数据项',
      code: 'PROPERTY',
      deletable: true,
    },
    {
      name: '连接符',
      code: 'DELIMITER',
      deletable: true,
    },
    {
      name: 'UID',
      code: 'UID',
      deletable: true,
    },
  ];

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  get locale() {
    switch (this.$i18n.locale) {
      case 'zh':
      default:
        return zhCN;

      case 'en':
        return enUS;
    }
  }

  currentModelDataItems: any[] = [];

  get theExample() {
    let example = '';
    if (!this.seqNoSetting.length) {
      return '';
    } else {
      this.seqNoSetting.forEach((item) => {
        switch (item.type) {
          case SeqNoSettingType.CONSTANT:
            example += item.value ? item.value : '';
            break;
          case SeqNoSettingType.DELIMITER:
            if (item.value) {
              example += item.value;
            } else {
              example += '';
            }
            break;
          case SeqNoSettingType.DATE:
            if (item.value !== 'none') {
              example += (this as any).dateFormatList.find((i) => {
                return i.value === item.value;
              }).labelX;
            } else {
              example += '';
            }
            break;
          case SeqNoSettingType.UID:
            example += item.value;
            break;
          case SeqNoSettingType.PROPERTY:
            const propertyItemIndex = this.currentModelDataItems.findIndex(
              (i) => {
                return i.code === item.value;
              },
            );
            if (propertyItemIndex >= 0) {
              example += this.isChinese
                ? this.currentModelDataItems[propertyItemIndex].name
                : /^(\{).*(\})$/.test(
                    this.currentModelDataItems[propertyItemIndex].name_i18n,
                  )
                ? JSON.parse(
                    this.currentModelDataItems[propertyItemIndex].name_i18n,
                  ).en
                : this.currentModelDataItems[propertyItemIndex].name_i18n;
              this.currentModelDataItems[propertyItemIndex].used = true;
            } else {
              item.value = '';
            }
            break;
          case SeqNoSettingType.SEQNO:
            if (item.value.leftPad) {
              example += '0'.repeat(item.value.maxLength - 1);
            }
            example += '1';
            break;
          default:
            break;
        }
      });
    }
    return example;
  }

  getField(item) {
    const field = this.currentModelDataItems
      .filter((i) => {
        return !i.defaultProperty && (!i.used || i.code === item.value);
      })
      .map((i) => {
        return {
          value: i.code,
          label:
            (this.isChinese
              ? i.name
              : /^(\{).*(\})$/.test(i.name_i18n)
              ? JSON.parse(i.name_i18n).en
              : i.name_i18n) + `[${i.code}]`,
        };
      });
    return field;
  }

  created(): void {}

  mounted() {
    if (typeof this.options !== 'object') {
      this.options = JSON.parse(this.options);
    }
    if (
      !this.options.seqNoSetting &&
      (this.options.resetDate ||
        this.options.prefix ||
        this.options.maxLength ||
        this.options.delimiter)
    ) {
      if (this.options.prefix) {
        this.seqNoSetting.push({
          type: SeqNoSettingType.CONSTANT,
          value: this.options.prefix,
          focus: false,
        });
        this.seqNoSetting.push({
          type: SeqNoSettingType.DELIMITER,
          value:
            this.options.delimiter === 'mark1'
              ? '-'
              : this.options.delimiter === 'mark2'
              ? '#'
              : '_',
          focus: false,
        });
      }
      switch (this.options.resetDate) {
        case 'none':
          this.seqNoSetting.push({
            type: SeqNoSettingType.DATE,
            value: 'none',
            focus: false,
          });
          break;
        case 'DAY':
          this.seqNoSetting.push({
            type: SeqNoSettingType.DATE,
            value: 'yyyyMMdd',
            focus: false,
          });
          this.seqNoSetting.push({
            type: SeqNoSettingType.DELIMITER,
            value:
              this.options.delimiter === 'mark1'
                ? '-'
                : this.options.delimiter === 'mark2'
                ? '#'
                : '_',
            focus: false,
          });
          break;
        case 'MONTH':
          this.seqNoSetting.push({
            type: SeqNoSettingType.DATE,
            value: 'yyyyMM',
            focus: false,
          });
          this.seqNoSetting.push({
            type: SeqNoSettingType.DELIMITER,
            value:
              this.options.delimiter === 'mark1'
                ? '-'
                : this.options.delimiter === 'mark2'
                ? '#'
                : '_',
            focus: false,
          });
          break;
        case 'YEAR':
          this.seqNoSetting.push({
            type: SeqNoSettingType.DATE,
            value: 'yyyy',
            focus: false,
          });
          this.seqNoSetting.push({
            type: SeqNoSettingType.DELIMITER,
            value:
              this.options.delimiter === 'mark1'
                ? '-'
                : this.options.delimiter === 'mark2'
                ? '#'
                : '_',
            focus: false,
          });
          break;
        default:
          break;
      }
      this.seqNoSetting.push({
        type: SeqNoSettingType.SEQNO,
        value: {
          maxLength: this.options.maxLength,
          leftPad: true,
          resetDate: this.options.resetDate,
        },
        focus: false,
      });
      this.options.seqNoSetting = this.seqNoSetting.map((item: any) => {
        return {
          type: item.type,
          value: item.value,
        };
      });
      delete this.options.resetDate;
      delete this.options.prefix;
      delete this.options.maxLength;
      delete this.options.delimiter;
    } else {
      this.seqNoSetting = this.options.seqNoSetting.map((item: any) => {
        return {
          type: item.type,
          value: item.value,
          focus: false,
        };
      });
    }
    if (!this.seqNoSetting.length) {
      this.seqNoSetting = [
        {
          type: 'UID', //UID
          value: 'aa860e64ff2e4f86851a661d663ae358',
        },
      ];
    }
    this.currentModelDataItems = this.dataItems
      .filter((res: any) => {
        return (
          [0, 2, 3, 12, 13, 14, 15].includes(res.type) &&
          !res.isSystem &&
          res.published
        );
      })
      .map((item) => {
        return {
          code: item.code,
          name: item.name,
          name_i18n: item.name_i18n || item.name,
          defaultProperty: item.isSystem,
          used: false,
        };
      });
    console.log(
      this.options,
      this.currentModelDataItems,
      this.dataItems,
      '---------->optionsNew',
    );
  }

  focusItem(index: number) {
    console.log(index);
    for (let i = 0; i < this.seqNoSetting.length; i++) {
      if (i === index) {
        this.seqNoSetting[i].focus = true;
        this.itemFocus = index;
        this.theItem = this.seqNoSetting[index];
        this.hasError = false;
        this.errorContent = '';
      } else {
        this.seqNoSetting[i].focus = false;
      }
    }
  }

  deleteItem(index: number) {
    console.log(index);
    if (index === this.itemFocus) {
      this.itemFocus = -1;
      this.theItem = {};
      this.hasError = false;
      this.errorContent = '';
    }
    this.seqNoSetting.splice(index, 1);
    this.currentModelDataItems.forEach((i) => {
      i.used = false;
    });
    this.options.seqNoSetting = this.seqNoSetting.map((item: any) => {
      return {
        type: item.type,
        value: item.value,
      };
    });
    this.mouseOver();
  }

  addItem(type: string) {
    switch (type) {
      case SeqNoSettingType.CONSTANT:
        this.seqNoSetting.push({
          type: SeqNoSettingType.CONSTANT,
          value: '',
          focus: false,
        });
        break;
      case SeqNoSettingType.PROPERTY:
        this.seqNoSetting.push({
          type: SeqNoSettingType.PROPERTY,
          value: '',
          focus: false,
        });
        break;
      case SeqNoSettingType.DELIMITER:
        this.seqNoSetting.push({
          type: SeqNoSettingType.DELIMITER,
          value: '#',
          focus: false,
        });
        break;
      case SeqNoSettingType.UID:
        this.seqNoSetting.push({
          type: SeqNoSettingType.UID,
          value: 'aa860e64ff2e4f86851a661d663ae358',
          focus: false,
        });
        break;
      case SeqNoSettingType.DATE:
        this.seqNoSetting.push({
          type: SeqNoSettingType.DATE,
          value: 'yyyy',
          focus: false,
        });
        break;
      case SeqNoSettingType.SEQNO:
        this.seqNoSetting.push({
          type: SeqNoSettingType.SEQNO,
          value: {
            maxLength: 6, //长度
            leftPad: false, //自动补0
            resetDate: 'MONTH', //重置策略
          },
          focus: false,
        });
        break;
      default:
        break;
    }
    this.options.seqNoSetting = this.seqNoSetting.map((item: any) => {
      return {
        type: item.type,
        value: item.value,
      };
    });
    this.focusItem(this.seqNoSetting.length - 1);
    this.addMenuVisible = false;
  }

  seqNoAddMenuChange() {
    for (const con of this.seqNoAddMenu) {
      if (con.code === 'DATE' || con.code === 'SEQNO' || con.code === 'UID') {
        for (const x of this.seqNoSetting) {
          if (con.code === x.type) {
            con.deletable = false;
            break;
          } else {
            con.deletable = true;
          }
        }
      }
    }
  }

  mouseOver() {
    const arr = this.seqNoSetting.filter((x) => {
      return x.type !== 'DELIMITER';
    });
    if (arr.length === 1) {
      for (const con in this.seqNoSettingNodeConfig) {
        if (con) {
          this.seqNoSettingNodeConfig[arr[0].type].deletable = false;
        }
      }
    } else {
      for (const con in this.seqNoSettingNodeConfig) {
        if (con) {
          this.seqNoSettingNodeConfig[con].deletable = true;
        }
      }
    }
  }

  listChange() {
    if (this.itemFocus >= 0) {
      this.itemFocus = this.seqNoSetting.findIndex((item: any) => {
        return item === this.theItem;
      });
    }
    this.options.seqNoSetting = this.seqNoSetting.map((item: any) => {
      return {
        type: item.type,
        value: item.value,
      };
    });
  }

  valChange(type?: any) {
    console.log(type, this.theItem.value);
    if (type) {
      this.seqNoSetting[this.itemFocus].value[type] = this.theItem.value[type];
    } else {
      if (this.theItem.type === SeqNoSettingType.PROPERTY) {
        this.currentModelDataItems.forEach((i) => {
          i.used = false;
        });
      } else if (this.theItem.type === SeqNoSettingType.CONSTANT) {
        if (this.theItem.value.length > 60) {
          if (!this.hasError) {
            this.errorContent += '固定值长度不能超过60个字符';
          } else if (this.errorContent.length < 14) {
            this.errorContent += '，且长度不能超过60个字符';
          } else {
            //Else Empty block statement
          }
          this.hasError = true;
        } else if (/^(\s)/.test(this.theItem.value)) {
          this.hasError = true;
          this.errorContent = '固定值不能以空格开头';
        } else {
          this.hasError = false;
          this.errorContent = '';
        }
      } else {
        //Else Empty block statement
      }
      this.seqNoSetting[this.itemFocus].value = this.theItem.value;
    }
    this.listChange();
  }
}
</script>
<style lang="less" scoped>
@import '../../../../common/common.less';
.sequenceNo-setting {
  .sequenceNo-example {
    min-height: 32px;
    margin-bottom: 16px;
    padding: 5px 0;
    .example-label {
      height: 22px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      line-height: 22px;
    }
    .example-text {
      min-height: 22px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
      word-break: break-all;
    }
  }
  .setting-item-box {
    display: inline-block;
    width: 112px;
    height: 32px;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    margin-right: 12px;
    margin-bottom: 16px;
    padding: 5px 24px 5px 20px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    line-height: 20px;
    position: relative;
    &:hover,
    &.focus:hover {
      cursor: pointer;
      border-color: #e8fcf4;
      background-color: #e8fcf4;
      color: rgba(0, 0, 0, 0.65);
      .drag-icon,
      .delete-icon {
        display: inline-block;
      }
    }
    &.focus {
      border-color: @primary-color;
      color: @primary-color;
    }
    .drag-icon {
      display: none;
      position: absolute;
      font-size: 12px;
      // margin-right: 4px;
      color: rgba(0, 0, 0, 0.45);
      top: 0px;
      left: 0px;
      padding: 6px 4px;
      border-radius: 4px 0 0 4px;
      &:hover {
        color: rgba(0, 0, 0, 0.45);
        cursor: move;
        & + span + .delete-icon {
          display: none;
        }
      }
    }
    .delete-icon {
      display: none;
      position: absolute;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.65);
      top: 6px;
      right: 8px;
      &:hover {
        color: rgba(0, 0, 0, 0.65);
      }
    }
  }
  .ghostClass,
  .dragClass,
  .ghostClass:hover,
  .dragClass:hover {
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid @primary-color;
    > span {
      color: transparent;
    }
  }
  .setting-item-add {
    display: inline-block;
    width: 32px;
    height: 32px;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    text-align: center;
    line-height: 30px;
    margin-right: 12px;
    margin-bottom: 16px;
    &:hover {
      border-color: @primary-color;
      color: @primary-color;
      cursor: pointer;
    }
    .add-icon {
      font-size: 12px;
      height: 24px;
      line-height: 24px;
    }
  }
  .item-setting {
    background: #f5f5f5;
    padding: 16px;
    margin-top: -4px;
    /deep/.ant-row:not(:last-child) {
      margin-bottom: 16px;
    }
    /deep/.ant-row {
      height: 32px;
      line-height: 32px;
    }
    .property-label {
      height: 32px;
      padding: 5px 0;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      line-height: 22px;
      &.data-item {
        margin-right: 8px;
      }
    }
    .property-setting {
      width: 85%;
      height: 32px;
      &.ant-radio-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      &.has-error {
        box-shadow: 0px 0px 0px 2px rgba(240, 53, 63, 0.2);
        border: 1px solid #f0353f;
      }
      & + .error-content {
        font-size: 12px;
        font-weight: 400;
        color: #f0353f;
        line-height: 20px;
        margin-top: 4px;
      }
      /deep/.ant-select-selection--single {
        border-radius: 4px;
      }
      /deep/label.ant-radio-wrapper:last-child {
        margin-right: 0;
      }
    }
    .property-other1 {
      height: 22px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
    }
  }
  .item-label {
    height: 22px;
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    line-height: 22px;
    margin-right: 8px !important;
  }
  .tips-icon {
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    &:hover {
      cursor: pointer;
    }
  }
  .the-label {
    margin-left: -7px;
    padding-left: 7px;
    box-sizing: content-box;
  }
  .preperty-other1 {
    margin-right: 8px;
  }
}
</style>
<style lang="less">
.sequenceNo-setting .ant-form-item-label {
  box-sizing: content-box;
  > label::after {
    content: '';
  }
}
.sequenceNo-setting .ant-switch {
  margin-left: 36px;
  font-size: 18px;
}
.ant-popover.seqNoAddMenu {
  padding: 0px;
  .ant-popover-arrow {
    display: none;
  }
  .ant-popover-inner-content {
    padding: 0;
    .add-menu-item {
      width: 112px;
      height: 32px;
      padding: 5px 12px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
      &:hover {
        background: #e8fcf4;
        cursor: pointer;
      }
      &:first-child {
        border-radius: 4px 4px 0 0;
      }
      &:last-child {
        border-radius: 0 0 4px 4px;
      }
    }
  }
}
.seqNo-tool-tips1 {
  width: 222px;
  .tips-text {
    width: 222px;
  }
}
.seqNo-tool-tips2 {
  width: 302px;
  .tips-text {
    width: 302px;
  }
}
.seqNo-tool-tips3 {
  width: 270px;
  .tips-text {
    width: 270px;
  }
}
</style>

<template>
  <a-modal
    v-model="visible"
    :width="showChangLog ? '810px' : '480px'"
    :footer="null"
    @ok="handleOk"
  >
    <template slot="title">
      <p class="title">
        <span>{{ $t('cloudpivot.list.pc.batchUpdata') }}</span>
      </p>
    </template>
    <template>
      <div v-show="!showChangLog" class="content">
        <div class="tips">
          <i class="icon aufontAll h-icon-all-info-circle-fill"></i>
          <ul>
            <!-- <li>根据修改字段的属性限制内进行修改；</li>
            <li>图片、附件、地图、地址、手写签名、关联表单、关联查询字段不支持批量修改。</li> -->
            <li>1.{{ $t('cloudpivot.list.pc.batchUpdataTips1') }}</li>
            <li>2.{{ $t('cloudpivot.list.pc.batchUpdataTips2') }}</li>
            <li>3.{{ $t('cloudpivot.list.pc.batchUpdataTips3') }}</li>
          </ul>
        </div>

        <p>{{ $t('cloudpivot.list.pc.modifyField') }}</p>
        <a-select
          v-model="params.propertyCode"
          defaultValue="lucy"
          style="width: 100%"
          @change="changeItemChange"
        >
          <a-select-option
            v-for="(item, index) in filterList"
            :key="item.code + index"
            :title="item.name"
            :value="item.code"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>

        <p v-if="params.propertyCode">
          {{ $t('cloudpivot.list.pc.modifyValue') }}
        </p>
        <template v-if="params.propertyCode">
          <div class="change-data-wrapper">
            <!-- 短文本 -->
            <a-input
              v-if="currentType === 'SORTTEXT'"
              v-model="params.modifiedValue"
              :placeholder="$t('cloudpivot.list.pc.placeholder')"
              @change="textChange('sortText')"
            />
            <!-- 长文本 -->
            <a-textarea
              v-if="currentType === 'LONGTEXT'"
              v-model="params.modifiedValue"
              :placeholder="$t('cloudpivot.list.pc.placeholder')"
              :rows="4"
              @change="textChange('longText')"
            />

            <!-- 日期 -->
            <a-date-picker
              v-else-if="currentType === 'DATE'"
              v-model="params.modifiedValue"
              :showTime="itemOptions.length > 10"
              class="time-select"
              :format="itemOptions"
            />

            <!-- 数值 -->
            <template v-else-if="currentType === 'NUMBER'">
              <!-- <a-input-number width="100%" ref="NumInput"  @change="numberChange" @blur="numberBlur"  v-model="params.modifiedValue"></a-input-number> -->
              <input
                v-show="!showNumText"
                ref="NumInput"
                v-model="params.modifiedValue"
                class="cus-input"
                width="100%"
                :placeholder="$t('cloudpivot.list.pc.placeholder')"
                type="number"
                @input="numberChange"
                @blur="numberBlur"
              />
              <a-input
                v-show="showNumText"
                v-model="numberShowText"
                width="100%"
                :placeholder="$t('cloudpivot.list.pc.placeholder')"
                @focus="showNumTextFocus"
              />
            </template>

            <!-- 逻辑 -->
            <a-select
              v-else-if="currentType === 'LOGIC'"
              v-model="params.modifiedValue"
              showSearch
              :placeholder="$t('cloudpivot.list.pc.pleaseSelect')"
            >
              <a-select-option value="1"> true </a-select-option>
              <a-select-option value="0"> false </a-select-option>
            </a-select>

            <!-- 选人/部门/混合选人控件 -->
            <!-- :keepDeptIds="cond.keepDeptIds ? cond.keepDeptIds : []" -->
            <staff-selector
              v-else-if="currentType === 'STAFFSELECTOR'"
              v-model="params.modifiedValue"
              :options="getStaffSelectorOpts()"
              :params="{ filterType: 'admin' }"
              :keepDeptIds="[]"
              displayType="plus"
            />

            <!-- 下拉 -->
            <a-select
              v-else-if="currentType === 'SELECT'"
              v-model="params.modifiedValue"
              :mode="changeItem.propertyType === 14 ? 'default' : 'multiple'"
              style="width: 100%"
              :placeholder="$t('cloudpivot.list.pc.pleaseSelect')"
            >
              <a-select-option
                v-for="item in itemOptions"
                :key="item"
                :value="item"
              >
                {{ item }}
              </a-select-option>
            </a-select>

            <!-- 单选 -->
            <a-radio-group
              v-else-if="currentType === 'RADIO'"
              v-model="params.modifiedValue"
              :options="itemOptions"
            />
            <!-- 复选 -->
            <a-checkbox-group
              v-else-if="currentType === 'CHECKBOX'"
              v-model="params.modifiedValue"
              :options="itemOptions"
            />
          </div>
        </template>
      </div>

      <div v-show="showChangLog" class="content">
        <div class="log-title">
          <span @click="gotoChange">
            <i class="icon aufontAll h-icon-all-arrow-left-o"></i>
          </span>
        </div>

        <div class="items">
          <template v-if="logList.length !== 0">
            <div
              v-for="(item, index) in logList"
              :key="index"
              class="items-li"
              :class="index + 1 === logList.length ? 'items-li-last' : ''"
            >
              <div class="author-img">
                <img
                  v-if="item.imgUrl && item.imgUrl.includes('http')"
                  :src="item.imgUrl"
                />
                <img
                  v-else-if="item.imgUrl"
                  :src="getDownloadUrlNew(item.imgUrl)"
                />
                <i
                  v-else
                  class="icon aufontAll h-icon-all-head-portrait default-avatar"
                ></i>
              </div>
              <div class="items-title">
                {{ item.userName }}
                <span>{{ item.createdTime }}</span>
              </div>
              <div class="items-li-box">
                <div class="items-li-box-top">
                  <div class="items-li-list">
                    <div class="items-li-lable">
                      {{ $t('cloudpivot.list.pc.modifyField') }}：
                    </div>
                    <div class="items-li-lable-content">
                      {{ item.propertyName }}
                    </div>
                  </div>
                  <div class="items-li-list">
                    <div class="items-li-lable">
                      {{ $t('cloudpivot.list.pc.replaceWith') }}：
                    </div>
                    <div class="items-li-lable-content">
                      {{ item.modifiedValue }}
                    </div>
                  </div>
                </div>
                <div class="items-li-bootom">
                  <div class="items-li-bootom-list">
                    <span class="items-li-bootom-lable">{{
                      $t('cloudpivot.list.pc.modifyData')
                    }}</span>
                    <span class="items-li-bootom-content">
                      <span class="num">{{ item.total }}</span>{{ $t('cloudpivot.list.pc.Items') }}</span>
                  </div>
                  <div class="items-li-bootom-list">
                    <span class="items-li-bootom-lable">{{
                      $t('cloudpivot.list.pc.modifySuccess')
                    }}</span>
                    <span class="items-li-bootom-content">
                      <span class="num">{{ item.successCount }}</span>{{ $t('cloudpivot.list.pc.Items') }}</span>
                  </div>
                  <div class="items-li-bootom-list">
                    <span class="items-li-bootom-lable">{{
                      $t('cloudpivot.list.pc.modifyFailed')
                    }}</span>
                    <span class="items-li-bootom-content">
                      <span class="num">{{ item.failCount }}</span>{{ $t('cloudpivot.list.pc.Items') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="noData">
            <img src="../image/noRecord.png" alt="empty" />
            <div>{{ $t('cloudpivot.list.pc.NoData') }}</div>
          </div>
        </div>
      </div>

      <div v-show="!showChangLog" class="footer">
        <span @click="goToChangeLog">{{
          $t('cloudpivot.list.pc.batchUpdataRecord')
        }}</span>
        <div class="btns">
          <a-button @click="visible = false">
            {{ $t('cloudpivot.list.pc.Cancel') }}
          </a-button>
          <a-button :disabled="spinning" type="primary" @click="handleOk">
            {{ $t('cloudpivot.list.pc.OK') }}
            <a-spin v-if="spinning" size="small" class="spin" />
          </a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { listApi } from '../../../../../api';
import { DataItemType } from '../../../../../form/src/schema/data-item-type';
import StaffSelector from '../../../../../form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import moment from 'moment';
import NumberComponent from '../../../../../form/src/components/Number/components/pc-input-number.vue';
import NumberFilter from '../../../../../form/utils/number-filter';
import { bizpropertyApi } from '../../../../../api';
import { Steps } from '@h3/antd-vue';
import getDownloadUrlNew from '../../../../../common/src/utils/getDownloadUrlNew';
interface Options {
  visible: boolean;
  checkeds: any[];
  queryCode: string;
  schemaCode: string;
  checkedWorkflows: string[];
  sheetCode: string;
}

@Component({
  name: 'batchUpdate',
  components: {
    StaffSelector,
    Number: NumberComponent,
    ASteps: Steps,
  },
})
export default class batchUpdate extends Vue {
  @Prop({
    default: {
      visible: false,
      checkeds: [],
      queryCode: '',
      schemaCode: '',
      checkedWorkflows: [],
      sheetCode: '',
    },
  })
  updateOptions!: Options;

  // @Prop({default: []}) checkedRows:any[];
  @Prop({ default: {} }) oldParams: any;

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }

  // 修改记录
  showChangLog: boolean = false;

  logList: any[] = [];

  async goToChangeLog() {
    const res = await listApi.getBatchUpdateLog({
      page: 0,
      size: 99999,
      schemaCode: this.updateOptions.schemaCode,
    });
    if (res.errcode === 0) {
      this.logList = res.data.content;
    } else {
      this.$message.error(res.errmsg || '');
    }

    this.showChangLog = true;
  }

  gotoChange() {
    this.showChangLog = false;
  }

  isDateModifiedValue: any = '';

  // 格式化传参
  formatData() {
    this.isDateModifiedValue = '';
    switch (this.changeItem.propertyType) {
      case DataItemType.Date:
        if (
          this.itemOptions.indexOf('EN-APM') +
            this.itemOptions.indexOf('CN-APM') >
          -1
        ) {
          this.isDateModifiedValue = moment(this.params.modifiedValue)
            .format(
              this.itemOptions.replace('EN-APM', '').replace('CN-APM', ''),
            )
            .trim();
        } else {
          this.params.modifiedValue = moment(this.params.modifiedValue).format(
            this.itemOptions,
          );
        }
        break;
      default:
        break;
    }
    return true;
  }

  verifyFormula(rule, modifiedValue, valueObj, prompt) {
    const inputValue = valueObj.inputValue;
    const lInput = valueObj.lInput;
    const rInput = valueObj.rInput;
    const res = {
      result: true,
      message: '校验通过',
    };
    if (rule === '=') {
      if (typeof inputValue === 'number') {
        if (modifiedValue * 1 !== inputValue) {
          res.result = false;
          res.message = prompt;
          return res;
        }
      } else if (modifiedValue !== inputValue) {
        res.result = false;
        res.message = prompt;
        return res;
      } else {
        //Else Empty block statement
      }
    }
    if (rule === '>') {
      if (modifiedValue <= inputValue) {
        res.result = false;
        res.message = prompt;
        return res;
      }
    }
    if (rule === '<') {
      if (modifiedValue >= inputValue) {
        res.result = false;
        res.message = prompt;
        return res;
      }
    }
    if (rule === '>=') {
      if (modifiedValue < inputValue) {
        res.result = false;
        res.message = prompt;
        return res;
      }
    }
    if (rule === '<=') {
      if (modifiedValue > inputValue) {
        res.result = false;
        res.message = prompt;
        return res;
      }
    }
    if (rule === '~') {
      if (modifiedValue <= lInput || modifiedValue >= rInput) {
        res.result = false;
        res.message = prompt;
        return res;
      }
    }
    return res;
  }

  // 数据校验
  async validate() {
    console.log(this.params);
    const res = {
      result: true,
      message: '校验通过',
    };
    if (
      this.params.modifiedValue === '' ||
      this.params.modifiedValue === undefined ||
      this.params.modifiedValue === null ||
      (typeof this.params.modifiedValue === 'string' &&
        this.params.modifiedValue.trim() === '')
    ) {
      res.result = false;
      res.message = '批量修改不能为空值';
      return res;
    }

    const rules = this.dataRulesList.filter((el) =>
      [el.propertyCode, el.schemaCode + '.' + el.propertyCode].includes(
        this.params.propertyCode,
      ),
    );
    if (rules.length) {
      for (let i = 0; i < rules.length; i++) {
        const rule: any = rules[i];
        const checkType = rule.checkType;
        const options = JSON.parse(rule.options);
        switch (checkType) {
          case 1: // 正则校验
            let regexp: string = options.regexp;
            regexp = regexp.slice(1, regexp.length - 1);
            const errText = JSON.parse(options.regexpText);
            const reg = new RegExp(regexp);
            if (!reg.test(this.params.modifiedValue)) {
              res.result = false;
              res.message = errText['zh'];
              return res;
            }
            break;

          case 2: // 提交校验
            const verifyFormula = JSON.parse(options.verifyFormula);
            const type = verifyFormula.type; // 1固定值
            const rule = verifyFormula.rule;
            const prompt = verifyFormula.prompt;

            if (type === 1) {
              // 固定值
              // return this.verifyFormula(rule, this.params.modifiedValue, {
              //   inputValue: verifyFormula.input,
              // }, prompt)

              if (rule === '~') {
                // 介于两数之间
                const verify = this.verifyFormula(
                  rule,
                  this.params.modifiedValue,
                  {
                    lInput: verifyFormula.lInput || verifyFormula.lDate,
                    rInput: verifyFormula.rInput || verifyFormula.rDate,
                  },
                  prompt,
                );

                if (!verify.result) {
                  return verify;
                }
              } else {
                const verify = this.verifyFormula(
                  rule,
                  this.params.modifiedValue,
                  {
                    inputValue: verifyFormula.input || verifyFormula.date,
                  },
                  prompt,
                );

                if (!verify.result) {
                  return verify;
                }
              }
            } else {
              //动态值
              const select = verifyFormula.select || ''; // 对比值
              const lInput = verifyFormula.lSelect || '';
              const rInput = verifyFormula.rSelect || '';

              this.oldParams.size = 99999;
              // delete this.oldParams.filters
              this.oldParams.objectIds = this.params.objectIds;
              if (rule === '~') {
                // 介于两数之间
                this.oldParams['options'] = {
                  queryDisplayType: 1,
                  customDisplayColumns: [lInput, rInput],
                };
              } else {
                this.oldParams['options'] = {
                  queryDisplayType: 1,
                  customDisplayColumns: [select],
                };
              }

              const list: any = await listApi.getQueryList(this.oldParams);

              if (list.errcode === 0) {
                const selectDatas = list.data.content.map(
                  (el) => el.data[select],
                );
                const lInputDatas = list.data.content.map(
                  (el) => el.data[lInput],
                );
                const rInputDatas = list.data.content.map(
                  (el) => el.data[rInput],
                );

                if (rule !== '~') {
                  for (let i = 0; i < selectDatas.length; i++) {
                    const verify = this.verifyFormula(
                      rule,
                      this.params.modifiedValue,
                      {
                        inputValue: selectDatas[i],
                      },
                      prompt,
                    );

                    if (!verify.result) {
                      return verify;
                    }
                  }
                } else {
                  // 介于两值之间
                  for (let i = 0; i < lInputDatas.length; i++) {
                    const verify = this.verifyFormula(
                      rule,
                      this.params.modifiedValue,
                      {
                        lInput: lInputDatas[i],
                        rInput: rInputDatas[i],
                      },
                      prompt,
                    );

                    if (!verify.result) {
                      return verify;
                    }
                  }
                }
              } else {
                // 接口报错
                res.result = false;
                res.message = list.errmsg;
              }
            }
            break;
          case 4: // 文本最大长度校验
            const maxLen = options.maxLength;
            if (this.params.modifiedValue.length > maxLen) {
              res.result = false;
              res.message = this.changeItem.name + '最大长度不能超过' + maxLen;
              return res;
            }
            break;
          default:
            break;
        }
      }
    }

    return res;
  }

  textChange(type) {
    let maxLen = 200;
    if (type === 'longText') {
      maxLen = 2000;
    }
    if (this.params.modifiedValue.length > maxLen) {
      this.$set(
        this.params,
        'modifiedValue',
        this.params.modifiedValue.substring(0, maxLen),
      );
    }
  }

  showNumText: boolean = false;

  numberShowText: string = '';

  numberChange(evt: Event) {
    const txt = this.params.modifiedValue + '';
    const inter = txt.split('.');
    if (inter[0].length > 16) {
      inter[0] = inter[0].slice(0, 16);
      // @ts-ignore
      this.$set(this.params, 'modifiedValue', +inter.join('.'));
    }
    if (inter[1] && inter[1].length > 8) {
      inter[1] = inter[1].slice(0, 8);
      // @ts-ignore
      this.$set(this.params, 'modifiedValue', +inter.join('.'));
    }
  }

  // 数值类型值改变
  numberBlur() {
    this.numberShowText = NumberFilter({
      // @ts-ignore
      controller: {
        value: this.params.modifiedValue,
      },
      options: {
        format1: this.itemOptions,
      },
    });
    this.showNumText = true;
  }

  showNumTextFocus() {
    this.showNumText = false;
    this.$nextTick(() => {
      // @ts-ignore
      this.$refs.NumInput.focus();
    });
  }

  getParmas(params) {
    if (
      this.itemOptions.indexOf('EN-APM') + this.itemOptions.indexOf('CN-APM') >
      -1
    ) {
      params.modifiedValue = this.isDateModifiedValue;
    }
    switch (this.changeItem.propertyType) {
      case DataItemType.Checkbox:
      case DataItemType.DropdownMulti:
        if (Array.isArray(params.modifiedValue)) {
          params.modifiedValue = params.modifiedValue.join(';');
        }
        break;
      default:
        break;
    }
  }

  spinning: boolean = false;

  async handleOk() {
    this.params.schemaCode = this.updateOptions.schemaCode;
    this.params.queryCode =
      this.updateOptions.queryCode || this.updateOptions.schemaCode;
    this.params.sheetCode = this.updateOptions.sheetCode;
    this.formatData();

    const validated = await this.validate();
    if (!validated.result) {
      this.$message.error(decodeURIComponent(validated.message));
      return;
    }
    const params = {
      ...this.params,
    };

    if (this.updateOptions.checkedWorkflows.length) {
      this.$message.warning('流程表单不支持批量修改！', 2);
    }
    params.objectIds = params.objectIds.filter((el) => {
      return !this.updateOptions.checkedWorkflows.includes(el);
    });
    this.getParmas(params); // 获取后台需要的格式
    this.spinning = true;
    const res = await listApi.batchUpdate(params);
    if (res.errcode === 0) {
      this.$emit('updateOver');
      this.visible = false;

      this.params.modifiedValue = undefined;
      const resetParams = {
        ...this.params,
      };
      resetParams.modifiedValue = undefined;
      resetParams.propertyCode = '';
      this.params = resetParams;
    } else {
      this.$message.error(res.errmsg || '');
    }
    this.spinning = false;
  }

  visible: boolean = false;

  list: any[] = [];

  async getDataItems() {
    const params = {
      schemaCode: this.updateOptions.schemaCode,
      formCode: this.updateOptions.queryCode,
      sheetCode: this.updateOptions.sheetCode,
    };
    const res = await listApi.getDataItems(params);

    if (res.errcode === 0) {
      let children: any[] = [];
      res.data.forEach((element) => {
        if (element.propertyType === DataItemType.Sheet) {
          const fater = {
            name: element.name,
            code: element.code,
          };
          const chlids = element.subSchema.properties;
          chlids.forEach((chlid) => {
            chlid.name = fater.name + '.' + chlid.name;
            chlid.code = fater.code + '.' + chlid.code;
          });

          children = [...children, ...chlids];
        }
      });
      res.data = [...res.data, ...children];
      this.list = res.data
        .filter((el) =>
          [
            DataItemType.ShortText,
            DataItemType.LongText,
            DataItemType.Number,
            DataItemType.Date,
            DataItemType.Logic,
            DataItemType.Radio,
            DataItemType.Checkbox,
            DataItemType.Dropdown,
            DataItemType.DropdownMulti,
            DataItemType.StaffSingle,
            DataItemType.StaffMulti,
            DataItemType.DeptSingle,
            DataItemType.DeptMulti,
            DataItemType.StaffDeptMix,
          ].includes(el.propertyType),
        )
        .filter((el) => !el.defaultProperty);
      // 拥有者不支持批量修改
      // ].includes(el.propertyType)).filter(el => !el.defaultProperty || el.code === 'owner')
    }
  }

  get filterList() {
    return this.list.filter((el) => {
      let code = el.code;
      const codeArr = code.split('.');
      if (codeArr.length === 2) {
        code = codeArr[1];
      }
      const noRepeatItem = this.noRepeatItems.filter(
        (item) => item.propertyCode === code,
      );

      if (noRepeatItem.length) {
        return false;
      }
      return true;
    });
  }

  changeItem: any = {};

  changeItemChange() {
    this.params.modifiedValue = undefined;
    this.numberShowText = '';
    this.changeItem = this.list.find(
      (el) => el.code === this.params.propertyCode,
    );
    this.changeItemType();
  }

  // 返回选人控件类型需要的参数
  getStaffSelectorOpts() {
    const cond = this.changeItem.propertyType;
    const obj = {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: this.$t('cloudpivot.list.pc.pleaseSelect'),
    };
    switch (cond) {
      case DataItemType.StaffSingle:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = false;
        break;
      case DataItemType.StaffMulti:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = true;
        break;
      case DataItemType.DeptSingle:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = false;
        break;
      case DataItemType.DeptMulti:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = true;
        break;
      case DataItemType.StaffDeptMix:
        obj.selectOrg = true;
        obj.selectUser = true;
        obj.mulpitle = true;
        break;
      default:
        break;
    }
    return obj;
  }

  async getData(options) {
    // 转换业务数据
    function getOptions(
      schemaCode: string,
      queryCode: string,
      sheetDataItem: string,
      orderByFields: string[],
      orderType: number,
      condition: any,
    ) {
      const options = {
        customDisplayColumns: [sheetDataItem],
      };
      const obj: any = {
        queryCode,
        schemaCode,
        options,
        orderByFields,
        orderType,
        page: 0,
        size: 1000,
        filters: [],
        condition,
      };
      return listApi.listSkipQueryList(obj).then((res) => {
        if (res.errcode === 0) {
          const data: string[] = [];
          res.data.content.forEach((x: any) => {
            const s = x.data[sheetDataItem];
            let t = '';
            if (s && data.indexOf(s) === -1) {
              if (sheetDataItem === 'sequenceStatus') {
                switch (s) {
                  case 'DRAFT':
                    t = '草稿';
                    break;
                  case 'PROCESSING':
                    t = '进行中';
                    break;
                  case 'COMPLETED':
                    t = '已完成';
                    break;
                  case 'CANCELED':
                    t = '已作废';
                    break;
                  default:
                    break;
                }
                data.push(t);
              } else {
                data.push(s);
              }
            }
          });
          return data;
        }
        return [];
      });
    }
    const res = await getOptions(
      options.schemaCode,
      '',
      options.sheetDataItem,
      [options.orderByFields],
      options.orderType,
      '',
    );
    if (res) {
      return res;
    }
  }

  // 处理单选、多选、下拉单选、下拉多选，使用数据字典、自定义、业务数据时渲染数据
  async formatOptions(options) {
    if (~options.indexOf('checkedDictionary')) {
      // 使用了字典数据
      const useDictionariesData = JSON.parse(options).useDictionariesData;
      return useDictionariesData.map((el) => el.name);
    } else if (~options.indexOf('schemaCode')) {
      // 使用业务模型
      return await this.getData(JSON.parse(options));
    } else {
      return options.split(';');
    }
  }

  itemOptions: any = '';

  currentType = 'SORTTEXT';

  async changeItemType() {
    let type = 'SORTTEXT';
    switch (this.changeItem.propertyType) {
      case DataItemType.ShortText:
        type = 'SORTTEXT';
        break;
      case DataItemType.LongText:
        type = 'LONGTEXT';
        break;
      case DataItemType.Date:
        try {
          this.itemOptions = JSON.parse(this.changeItem.options).format;
        } catch (error) {}
        type = 'DATE';
        break;
      case DataItemType.Number:
        type = 'NUMBER';
        this.itemOptions = JSON.parse(this.changeItem.options).format;
        break;
      case DataItemType.Logic:
        type = 'LOGIC';
        break;
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.DeptSingle:
      case DataItemType.DeptMulti:
      case DataItemType.StaffDeptMix:
        type = 'STAFFSELECTOR';
        break;
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        try {
          this.itemOptions = await this.formatOptions(
            JSON.parse(this.changeItem.options).options,
          );
        } catch (error) {}
        type = 'SELECT';
        if (DataItemType.DropdownMulti === this.changeItem.propertyType) {
          // @ts-ignore
          this.params.modifiedValue = [];
        }
        break;
      case DataItemType.Radio:
        try {
          this.itemOptions = await this.formatOptions(
            JSON.parse(this.changeItem.options).options,
          );
        } catch (error) {}
        type = 'RADIO';
        break;
      case DataItemType.Checkbox:
        try {
          this.itemOptions = await this.formatOptions(
            JSON.parse(this.changeItem.options).options,
          );
        } catch (error) {}
        type = 'CHECKBOX';
        break;
      default:
        break;
    }

    this.currentType = type;
    return type;
  }

  @Watch('updateOptions')
  updateOptionsChange() {
    if (this.updateOptions.visible) {
      this.getDataItems();
      this.visible = true;
      // @ts-ignore
      this.params.objectIds = [...this.updateOptions.checkeds];
      this.params.modifiedValue = undefined;
      this.params.propertyCode = '';
      this.changeItem = {};
      this.showChangLog = false;
    }
  }

  @Watch('visible')
  onVisibleChange(val) {
    if (!val) {
      this.$emit('visibleChange', val);
    }
  }

  params: any = {
    modifiedValue: undefined,
    objectIds: [],
    propertyCode: '',
    queryCode: '',
    schemaCode: '',
    sheetCode: '',
  };

  dataRulesList: any[] = []; // 数据规则列表

  async getDataRules() {
    // 获取数据规则
    const params = {
      schemaCode: this.updateOptions.schemaCode,
    };
    const res: any = await bizpropertyApi.getDataRules(params);
    if (res.errcode === 0) {
      this.dataRulesList = res.data;
    }
  }

  get noRepeatItems() {
    // 校验规则中去重数据项
    return this.dataRulesList.filter((el) => el.checkType === 5);
  }

  created() {
    this.getDataRules();
  }
}
</script>
<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
/deep/ .ant-modal {
  max-height: 80%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}

/deep/ .ant-modal-body {
  height: calc(100% - 70px);
  .content {
    height: 100%;
    min-height: 339px;
  }
}

/deep/ .ant-modal-content {
  flex-grow: 1;
}
.footer {
  // border-top: 1px solid #e8e8e8;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  span {
    font-size: 14px;
    color: @highlightColor;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  .btns {
    button {
      margin-left: 8px;
      min-width: 80px;
      height: 32px;
      padding: 0 16px;
    }
  }
}
.change-data-wrapper {
  max-height: 400px;
  overflow: auto;
  & > * {
    width: 100%;
  }
}
.title {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  margin: 0;
  small {
    opacity: 0.85;
    color: #888888;
    margin-left: 15px;
    .font-ele {
      color: #2970ff;
    }
  }
}

.content {
  padding-bottom: 55px;
  p {
    height: 22px;
    font-size: 14px;
    font-weight: 400;
    color: #111218;
    line-height: 22px;
    margin-top: 17px;
    margin-bottom: 6px;
  }
  /deep/.ant-select-selection {
    border-radius: 2px;
    border: 1px solid #d4d5d6;
  }
  .tips {
    position: relative;
    > i {
      color: #faad14;
      font-size: 14px;
      position: absolute;
      left: 16px;
      top: 13px;
    }
    p {
      margin-top: 0;
      margin-bottom: 0;
    }
    ul {
      background: #fffbe6;
      border-radius: 4px;
      border: 1px solid #ffe58f;
      padding: 9px 38px;
      li {
        list-style: none;
        color: #111218;
        line-height: 22px;
        font-size: 14px;
        font-weight: 400;
      }
    }
  }

  .log-title {
    position: relative;
    text-align: center;
    height: 24px;
    line-height: 24px;
    margin-bottom: 20px;
    span:first-child {
      position: absolute;
      left: 0;
      width: 24px;
      height: 24px;
      color: @highlightColor;
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
      i {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
  .item {
    background-color: #f9f9f9;
    padding: 8px 16px;
    margin-top: 10px;
    .about {
      position: relative;
      font-size: 14px;
      padding-bottom: 8px;
      line-height: 2;
      p {
        margin: 0;
        padding: 0;
      }
      div:nth-child(1) {
        color: rgba(0, 0, 0, 0.85);
      }
      div:nth-child(2),
      div:nth-child(3),
      div:nth-child(4) {
        font-size: 12px;
        display: flex;
        label {
          width: 5em;
          color: rgba(0, 0, 0, 0.65);
        }
        p {
          flex: 1;
          font-size: 12px;
        }
      }

      &::after {
        content: '';
        width: 100%;
        height: 1px;
        background-image: linear-gradient(
          to right,
          #ccc 0%,
          #ccc 50%,
          transparent 50%
        );
        background-size: 10px 1px;
        background-repeat: repeat-x;
        bottom: 0;
        left: 0;
        position: absolute;
      }
    }
    .info {
      padding-top: 8px;
      span {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.65);
        margin-right: 40px;
        &:nth-child(1) {
          .font-ele {
            color: #2970ff;
          }
        }
        &:nth-child(2) {
          .font-ele {
            color: #52c41a;
          }
        }
        &:nth-child(3) {
          .font-ele {
            color: #ff4d4f;
          }
        }
      }
    }
  }
}
.items {
  overflow: hidden;
  overflow-y: auto;
  height: calc(100% - 44px);
  .items-li {
    margin-bottom: 39px;
    width: 660px;
    position: relative;
    margin-left: 72px;
    margin-top: 6px;
    &::before {
      content: '';
      position: absolute;
      border-left: 1px dashed rgba(17, 18, 24, 0.25);
      height: 142px;
      width: 5px;
      left: -28px;
      top: 36px;
    }
    .author-img {
      position: absolute;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      left: -44px;
      top: -5px;
      > img {
        width: 100%;
        height: 100%;
        border: 1px solid #ddd;
      }
      & > i.default-avatar {
        font-size: 32px;
        line-height: 32px;
        color: #ffb131;
      }
      > i.default-avatar {
        font-size: 32px;
        line-height: 32px;
        color: #ffb131;
      }
    }
    .items-title {
      font-size: 14px;
      color: #111218;
      font-weight: 400;
      margin-bottom: 11px;
      > span {
        margin-left: 16px;
        font-size: 12px;
        color: rgba(17, 18, 24, 0.5);
      }
    }
    .items-li-box {
      width: 100%;
      height: 120px;
      background-color: #fff;
      border-radius: 2px;
      border: 1px solid #e8eaed;
      display: flex;
      flex-direction: column;
      .items-li-box-top {
        flex: 1;
        .items-li-list {
          display: flex;
          margin-top: 12px;
          &:last-child {
            margin-bottom: 12px;
          }
          .items-li-lable {
            text-align: right;
            font-weight: 400;
            color: rgba(17, 18, 24, 0.5);
            font-size: 12px;
            width: 80px;
            min-width: 80px;
          }
          .items-li-lable-content {
            font-weight: 400;
            color: #111218;
            font-size: 12px;
            padding-right: 6px;
          }
        }
      }
      .items-li-bootom {
        width: 100%;
        height: 42px;
        background: #f8f8fb;
        display: flex;
        align-items: center;
        .items-li-bootom-list {
          flex: 1;
          margin-left: 12px;
          .items-li-bootom-lable {
            font-size: 12px;
            font-weight: 400;
            color: rgba(17, 18, 24, 0.5);
          }
          .items-li-bootom-content {
            margin-left: 12px;
            color: #111218;
            font-weight: 400;
            .num {
              margin: 0 4px;
              color: @highlightColor;
            }
          }
        }
      }
    }
  }
  .items-li-last::before {
    border-left: none;
  }
}

.cus-input {
  box-sizing: border-box;
  margin: 0;
  font-variant: tabular-nums;
  list-style: none;
  -webkit-font-feature-settings: 'tnum';
  font-feature-settings: 'tnum';
  position: relative;
  display: inline-block;
  width: 100%;
  height: 32px;
  padding: 4px 11px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  line-height: 1.5;
  background-color: #fff;
  background-image: none;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
}

.spin {
  margin-left: 5px;
}

.noData {
  text-align: center;
  height: 346px;
  font-weight: 400;
  color: rgba(17, 18, 24, 0.5);
  line-height: 22px;
  img {
    width: 163px;
    padding-top: 58px;
  }
}

/**
  新版样式
*/
/deep/ .ant-modal-header {
  border-bottom: none;
  padding: 24px;
}
/deep/ .ant-modal-title {
  font-weight: 700;
  font-size: 16px;
  color: #111218;
}
/deep/ .ant-modal-body {
  padding-top: 0;
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<script lang="ts">
import Modal from '@/components/apps/form-design/modals/index.vue';
import Dialog from '@/components/apps/list-design/aside-addDialog-modal.vue';
import sheetFiters from '@/components/apps/list-design/display-filters.vue';
import DataItemInput from '@/components/apps/model/data-title-input.vue';
import BizModelsSelector from '@/components/global/biz-models-selector/index.vue';
import DataModelSummary from '@/components/shared/data-item/summary.vue';
import { formItemDirective } from '@/directives/form-validate';
import router from '@/router/';
import store from '@/store/';
import { schema } from 'cloudpivot/form';
import { DataItemType } from 'cloudpivot/form/schema';
import rendererComponents from 'cloudpivot/form/src/renderer/components/pc';
import moment from 'moment';
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import { i18n } from '../../../../config/i18n';
import Print from './../template/print.vue';
import TemplateFile from 'cloudpivot/form/src/common/components/attachment-file.vue';
import ImageNum from 'cloudpivot/form/src/common/components/update-img-num.vue';
import Location from 'cloudpivot/form/src/common/components/location-modal.vue';
import * as ControlFactory from '../typings/control-factory';

import {
  ControlAttributeType,
  DropdownAttributeType,
  ModalAttributeType,
} from './typings/form-attribute';

import {
  Input,
  Select,
  InputNumber,
  Switch,
  Checkbox,
  Radio,
  Upload,
  Icon,
  Button,
  Row,
  Col,
} from '@h3/antd-vue';

import * as formApi from '@/apis/form';

import env from '@/env.ts';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';

const Selector = rendererComponents.StaffSelector;

let inputNum: number = 0;

@Component({
  name: 'form-attribute-value',
  components: {
    ARow: Row,
    ACol: Col,
    Modal,
    BizModelsSelector,
    DataModelSummary,
    DataItemInput,
    AInput: Input,
    ASelect: Select,
    AInputNumber: InputNumber,
    ASwitch: Switch,
    ACheckbox: Checkbox,
    Print,
    TemplateFile,
    ARadioGroup: Radio.Group,
    ATextarea: Input.TextArea,
    AUpload: Upload,
    AIcon: Icon,
    AButton: Button,
    ImageNum,
    Location,
    ARadioButton: Radio.Button,
  },
  directives: {
    'form-item-validate': formItemDirective,
  },
})
export default class FormControlAttribute extends Vue {
  @Prop() dataItem!: any;

  @Prop() label!: string;

  @Prop() dom!: string;

  @Prop() field!: string;

  @Prop() type!: ControlAttributeType;

  @Prop() attrType!: ModalAttributeType;

  @Prop() value!: string;

  @Prop({ default: () => ({}) }) options!: any;

  @Prop() attributes!: any;

  @Prop() assistAttribute!: any;

  @Prop() formData!: any;

  @Prop() attributeItem!: any;

  @Prop() control?: any;

  @Prop({ default: false }) readonly!: any;

  modal: any;

  valueText = this.value;

  refControlKey = '';

  pcUrl: string = ''; // 公开链接地址

  imgUrl: string = ''; // 图片链接

  showBigQrcode: boolean = false; //是否显示大号公开链接二维码

  shortCode: string = '';

  @Inject()
  getFormControls!: () => { [key: string]: schema.FormControl };

  @Inject()
  getControls!: Function;

  @Inject()
  getControl!: () => schema.FormTabs;

  @Watch('attributes', {
    immediate: true,
  })
  watchOptions() {
    this.valueText = this.value;
    if (this.options && this.options.dataList && !!this.value) {
      if (this.options.dataList instanceof Function) {
        this.options
          .dataList(
            this.attributes.find((a: any) => a.field === this.field),
            this.attributes,
            this,
          )
          .then((data: any) => {
            this.$emit('callback', this.field, (key: string, attr: any) => {
              attr.options = Object.assign({}, attr.options, { list: data });
            });
          });
      }
    }
  }

  /**
   * 文本类型的render
   * @param h
   */
  stringRender(h: any): any {
    const self = this;
    const inputGuid = `ozInput-${(inputNum += 1)}`;
    let valueText = this.valueText;

    if (localStorage.getItem('locale') === 'en') {
      valueText = zhToEn[this.valueText] || this.valueText;
    }

    if (self.field === 'regexpText') {
      try {
        const regexpText = JSON.parse(valueText);
        valueText = regexpText[localStorage.getItem('locale') || 'zh'];
      } catch (error) {}
    }

    const inputOptions: any = {
      directives: [],
      class: {
        'input-box': this.dom !== 'a-textarea',
        'textarea-box': this.dom === 'a-textarea',
      },
      props: {
        value: valueText,
        autosize: this.dom === 'a-textarea' ? { minRows: 2, maxRows: 12 } : '',
        placeholder:
          self.options && self.options.placeholder
            ? self.options.placeholder
            : '请输入',
        disabled: self.options.disabled || self.readonly,
      },
      ref: inputGuid,
      on: {
        input: async (e: any) => {
          let textValue: any = e.target.value;
          if (this.options.regexps && this.options.regexps.maxLength) {
            const maxChars: any = this.options.regexps.maxLength.len;
            if (textValue.length > maxChars) {
              textValue = e.target.value.substring(0, maxChars);
            }
          }

          if (self.field === 'regexpText') {
            try {
              const Text = this.valueText;
              const regexpText = JSON.parse(Text);
              regexpText[localStorage.getItem('locale') || 'zh'] = textValue;
              textValue = JSON.stringify(regexpText);
            } catch (error) {}
          }

          this.valueText = textValue;
          const formItemValidate = e.target._formItemValidate;
          const submit: Function = () => {
            self.$emit('change', self.field, textValue);
            if (self.options.callback instanceof Function) {
              self.$emit('callback', self.field, self.options.callback);
            }
          };
          if (formItemValidate) {
            this.$nextTick(() => {
              formItemValidate
                .validatedStatus()
                .then((validatedStatus: boolean) => {
                  if (validatedStatus) {
                    submit();
                  }
                });
            });
          } else {
            submit();
          }
        },
        blur: async (e: any) => {
          this.valueText = e.target.value.replace(/(^\s*)/g, ''); // 去除开头空格

          if (self.field === 'defaultValue') {
            // 默认值
            // this.valueText = this.valueText.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5\{\}\[\]\【\】]/g, '') // 限定可输入范围
            this.valueText = unescape(
              escape(this.valueText).replace(/\%uD.{3}/g, ''),
            ); //只过滤表情，对其他符号不做处理
            self.$emit('change', self.field, this.valueText);
          }

          if (self.field === 'maxLength' && this.valueText === '0') {
            // 文本最大长度
            this.valueText = '1';
            self.$emit('change', self.field, this.valueText);
          }

          if (self.field === 'fileNumber') {
            // 文件最大上传数量
            if (
              Number.isNaN(Number(this.valueText)) ||
              Number(this.valueText) < 1
            ) {
              this.valueText = '1';
            } else if (Number(this.valueText) > 1000) {
              this.valueText = '1000';
            } else {
              this.valueText = this.valueText.split('.')[0];
            }
            self.$emit('change', self.field, this.valueText);
          }

          const formItemValidate = e.target._formItemValidate;
          const submit: Function = () => {
            self.$emit('blur', self.field, e.target.value);
            // if (self.options.callback instanceof Function) {
            //   self.$emit("callback", self.field, self.options.callback);
            // }
          };
          if (formItemValidate) {
            this.$nextTick(() => {
              formItemValidate
                .validatedStatus()
                .then((validatedStatus: boolean) => {
                  if (validatedStatus) {
                    submit();
                  }
                });
            });
          } else {
            submit();
          }
        },
      },
    };
    if (this.options.regexps) {
      inputOptions.directives.push({
        name: 'form-item-validate',
        value: Object.assign(
          {
            key: inputGuid,
            value: this.valueText,
          },
          this.options.regexps,
        ),
      });
    }

    if (this.dom === 'a-textarea') {
      return h('a-textarea', inputOptions);
    }
    return h('a-input', inputOptions);
  }

  get getDropdownData() {
    if (this.options.formatter) {
      return this.options.formatter(this.attributes);
    }
    if (this.options.getValue) {
      return this.options.getValue(
        this.value,
        this.attributes,
        this.assistAttribute,
      );
    }
    if (
      (this.field === 'showField' || this.field === 'sheetFiters') &&
      ((this.value && this.value.length <= 0) || !this.value)
    ) {
      return [];
    }

    // return this.value ? this.value.toString().split(",") : "";
    return this.value;
  }

  /**
   * 下拉框类型render
   * @param h
   */
  dropdownRender(h: any): any {
    const self = this;

    if ((this.attrType as any) === DropdownAttributeType.Summary) {
      return h('data-item-input');
    }
    const props: any = {
      options: self.options.list,
      disabled: self.options.selectorDisabled || self.readonly,
      value: self.getDropdownData,
      allowClear: self.options.allowClear,
      // notFoundContent: "加载中...",

      getPopupContainer: (triggerNode: HTMLElement) => triggerNode.parentNode,
    };
    if (self.options && self.options.mode) {
      props.mode = self.options.mode as any;
    }

    // 显示格式 在同步默认格式时 disable
    if (
      self.field === 'format1' &&
      this.attributes.find((item) => item.field === 'syncFormate').value
    ) {
      props.disabled = true;
    }

    // 控件布局方式 在边框模式开启时 disable
    if (
      self.field === 'layoutType' &&
      this.attributes.find((item) => item.field === 'borderMode').value ===
        'open'
    ) {
      props.disabled = true;
    }
    return self.buildDropdown(h, { props });
  }

  /**
   * 单选组类型render
   */
  radioGroupRender(h: any): any {
    const self = this;

    if ((this.attrType as any) === DropdownAttributeType.Summary) {
      return h('data-item-input');
    }
    const props: any = {
      options: self.options.list,
      disabled:
        self.options.selectorDisabled ||
        self.readonly ||
        (self.field === 'span' && ControlFactory.isFullRow(self.control.type)),
      value: self.getDropdownData,
      allowClear: self.options.allowClear,
      // notFoundContent: "加载中...",

      getPopupContainer: (triggerNode: HTMLElement) => triggerNode.parentNode,
    };
    if (self.options && self.options.mode) {
      props.mode = self.options.mode as any;
    }
    if (self.options.style === 'button') {
      props.buttonStyle = 'solid';
    }
    return self.buildRadio(h, { props });
  }

  /**
   * Boolean类型render
   * @param h
   */
  booleanRender(h: any): any {
    const self = this;
    let hasOption = false;
    let curValue: any = '';
    if (self.options && self.options.valueMap) {
      hasOption = true;
      curValue = self.options.valueMap['true'] === self.value;
    } else {
      curValue = !!self.value;
    }

    const baseDom = h('a-switch', {
      class: {
        'logic-attr': true,
      },
      props: {
        defaultChecked: curValue,
        disabled: self.options.disabled || self.readonly,
      },
      key: new Date().getTime(),
      on: {
        change: (checked) => {
          self.$emit(
            'change',
            self.field,
            hasOption ? self.options.valueMap[checked] : checked,
          );
          if (self.field === 'externalLinkAble') {
            if (checked) {
              const sheetData: any = this.attributes.find((res: any) => {
                return res.field === 'sheetData';
              });
              this.getShortCode(
                sheetData.value.schemaCode,
                sheetData.value.code,
                sheetData.value.shortCode,
                checked,
                sheetData.value.id,
              ).then((res) => {
                self.$emit('change', 'sheetData', {
                  ...sheetData.value,
                  shortCode: self.shortCode,
                });
                self.$emit('change', 'shortCode', self.shortCode);
              });
            } else {
              this.pcUrl = '';
              this.imgUrl = '';
            }
          }
        },
      },
    });
    if (this.field === 'externalLinkAble') {
      return h(
        'div',
        {
          class: {
            externalLink: true,
          },
        },
        [
          baseDom,
          h(
            'div',
            {
              class: {
                externalLinkAble: self.value,
                externalLinkUnable: !self.value,
              },
            },
            [
              h(
                'div',
                {
                  class: {
                    tips: true,
                  },
                },
                [
                  '链接生成地址',
                  h(
                    'div',
                    {
                      class: {
                        link: true,
                      },
                    },
                    [
                      h('span', null, [this.pcUrl]),
                      h('span', {
                        class: {
                          aufontAll: true,
                          'h-icon-all-file-copy': true,
                        },
                        attrs: {
                          title: '复制',
                        },
                        on: {
                          click: () => {
                            const oInput: any = document.createElement('input');
                            oInput.value = this.pcUrl;
                            document.body.appendChild(oInput);
                            oInput.select(); // 选择对象
                            document.execCommand('Copy'); // 执行浏览器复制命令
                            oInput.className = 'oInput';
                            oInput.style.display = 'none';
                            oInput.remove();
                            this.$message.success('已复制至系统剪切板');
                          },
                        },
                      }),
                    ],
                  ),
                ],
              ),
              h(
                'div',
                {
                  class: {
                    Qrcode: true,
                  },
                },
                [
                  h('span', {}, ['二维码']),
                  h('img', {
                    attrs: {
                      src: this.imgUrl,
                    },
                    class: {
                      'small-qrcode': true,
                    },
                    on: {
                      click: () => {
                        this.showBigQrcode = !this.showBigQrcode;
                      },
                    },
                  }),
                  h('img', {
                    attrs: {
                      src: this.imgUrl,
                    },
                    class: {
                      'big-qrcode': true,
                      'not-show': !this.showBigQrcode,
                    },
                    on: {
                      click: () => {
                        this.showBigQrcode = false;
                      },
                    },
                  }),
                ],
              ),
            ],
          ),
        ],
      );
    }
    return baseDom;
  }

  /**
   * 构建下拉类型
   * @param h
   * @param options
   */
  buildDropdown(h: any, options: any) {
    const self = this;
    const dropdownGuid = `ozDropdown-${(inputNum += 1)}`;
    options = Object.assign(
      {
        class: {
          'input-select': true,
        },
        ref: dropdownGuid,
        on: {
          // blur: () => {
          //   if (self.options.dataList instanceof Function) {
          //     self.$emit("callback", self.field, (key: string, attr: any) => {
          //       attr.options = Object.assign({}, attr.options, { list: [] });
          //     });
          //   }
          // },
          focus: () => {
            if (self.options && self.options.dataList) {
              if (self.options.dataList instanceof Function) {
                self.options
                  .dataList(
                    self.attributes.find((a: any) => a.field === self.field),
                    self.attributes,
                    self,
                  )
                  .then((data: any) => {
                    self.$emit(
                      'callback',
                      self.field,
                      (key: string, attr: any) => {
                        attr.options = Object.assign({}, attr.options, {
                          list: data,
                        });
                      },
                    );
                  });
              }
            }
          },
          change: (values: any) => {
            // 关联查询区分关联单选和关联多选
            let currentItem: any = null;
            let reverseRelevantType: string = '9';
            if (Array.isArray(self.options.list)) {
              currentItem = self.options.list.find((x) => x.value === values);
            }
            if (currentItem) {
              reverseRelevantType = String(currentItem.type);
            }
            if (self.options.dataList instanceof Function) {
              self.$emit(
                'callback',
                self.field,
                (key: string, attr: any) => {
                  attr.options = Object.assign({}, attr.options, { list: [] });
                },
                reverseRelevantType,
              );
            }

            (self.$refs[dropdownGuid] as HTMLElement).blur();
            self.$emit(
              'change',
              self.field,
              values instanceof Array ? values.join(',') : values,
              reverseRelevantType,
            );
            if (self.options.callback instanceof Function) {
              self.$emit(
                'callback',
                self.field,
                self.options.callback,
                reverseRelevantType,
              );
            }
          },
        },
      },
      options,
    );
    options.props.placeholder = '请选择';
    if (options.props.value === '') {
      options.props.value = undefined;
    }
    return h('a-select', options);
  }

  /**
   * 构建单选类型
   * @param h
   * @param options
   */
  buildRadio(h: any, options: any) {
    const self = this;
    const radioGuid = `ozRadio-${(inputNum += 1)}`;
    options = Object.assign(
      {
        class: {
          'input-radio': true,
        },
        ref: radioGuid,
        on: {
          change: (event: any) => {
            self.$emit(
              'change',
              self.field,
              event && event.target && event.target.value !== undefined
                ? event.target.value
                : '',
            );
          },
        },
      },
      options,
    );
    if (options.props.value === '') {
      options.props.value = undefined;
    }
    const subDom = [];
    if (self.options.style === 'button') {
      options.props.options.forEach((item) => {
        subDom.push(
          h(
            'a-radio-button',
            {
              props: {
                value: item.value,
              },
            },
            item.label,
          ),
        );
      });
      delete options.props.options;
    }
    return h('a-radio-group', options, subDom.length > 0 ? subDom : null);
  }

  /**
   * checkbox类型render
   * 主要用在标题右侧充当辅助项
   */
  CheckboxRender(h: any): any {
    const self = this;
    let hasOption = false;
    let curValue: any = '';
    if (self.options && self.options.valueMap) {
      hasOption = true;
      curValue = self.options.valueMap['true'] === self.value;
    } else {
      curValue = !!self.value;
    }
    const baseDom = h('a-checkbox', {
      class: {
        'checkbox-attr': true,
      },
      props: {
        checked: curValue,
        disabled:
          (self.field === 'borderMode' &&
            this.attributes.find((item) => item.field === 'layoutType')
              .value === 'vertical') ||
          self.readonly,
      },
      on: {
        change: (event) => {
          const checked = event.target.checked;
          self.$emit(
            'change',
            self.field,
            hasOption ? self.options.valueMap[checked] : checked,
          );
        },
      },
    });
    return baseDom;
  }

  /**
   * 整数类型的render
   * @param h
   */
  integerRender(h: any): any {
    const self = this;
    const inputGuid = `ozInput-${(inputNum += 1)}`;
    const valueText = this.valueText;

    const inputOptions: any = {
      directives: [],
      class: {
        'input-box': this.dom !== 'a-textarea',
        'textarea-box': this.dom === 'a-textarea',
      },
      props: {
        disabled: self.readonly,
        value: valueText,
        placeholder:
          self.options && self.options.placeholder
            ? self.options.placeholder
            : '',
      },
      ref: inputGuid,
      on: {
        input: async (e: any) => {
          let textValue: any = e.target.value;
          if (this.options.regexps && this.options.regexps.maxLength) {
            const maxChars: any = this.options.regexps.maxLength.len;
            if (textValue.length > maxChars) {
              textValue = e.target.value.substring(0, maxChars);
            }
          }

          if (self.field === 'regexpText') {
            try {
              const Text = this.valueText;
              const regexpText = JSON.parse(Text);
              regexpText[localStorage.getItem('locale') || 'zh'] = textValue;
              textValue = JSON.stringify(regexpText);
            } catch (error) {}
          }

          this.valueText = textValue;
          const formItemValidate = e.target._formItemValidate;
          const submit: Function = () => {
            self.$emit('change', self.field, textValue);
            if (self.options.callback instanceof Function) {
              self.$emit('callback', self.field, self.options.callback);
            }
          };
          if (formItemValidate) {
            this.$nextTick(() => {
              formItemValidate
                .validatedStatus()
                .then((validatedStatus: boolean) => {
                  if (validatedStatus) {
                    submit();
                  }
                });
            });
          } else {
            submit();
          }
        },
        blur: async (e: any) => {
          const valueText = e.target.value.replace(/(^\s*)/g, ''); // 去除开头空格

          this.valueText = self.specialIntegerFieldValid(self.field, valueText);

          const formItemValidate = e.target._formItemValidate;
          const submit: Function = () => {
            self.$emit('blur', self.field, e.target.value);
            // if (self.options.callback instanceof Function) {
            //   self.$emit("callback", self.field, self.options.callback);
            // }
          };
          if (formItemValidate) {
            this.$nextTick(() => {
              formItemValidate
                .validatedStatus()
                .then((validatedStatus: boolean) => {
                  if (validatedStatus) {
                    submit();
                  }
                });
            });
          } else {
            submit();
          }
        },
      },
    };
    if (this.options.regexps) {
      inputOptions.directives.push({
        name: 'form-item-validate',
        value: Object.assign(
          {
            key: inputGuid,
            value: this.valueText,
          },
          this.options.regexps,
        ),
      });
    }

    const integerSteps = [
      h(
        'div',
        {
          class: {
            up: true,
          },
        },
        [
          h('i', {
            class: {
              aufontAll: true,
              'h-icon-all-caret-up': true,
            },
            on: {
              click: () => {
                if (!isNaN(Number(this.valueText)) && !self.readonly) {
                  if (
                    self.field === 'fileNumber' &&
                    Number(this.valueText) + 1 > 1000
                  ) {
                    return;
                  }
                  self.$emit('change', self.field, Number(this.valueText) + 1);
                }
              },
            },
          }),
        ],
      ),
      h(
        'div',
        {
          class: {
            down: true,
          },
        },
        [
          h('i', {
            class: {
              aufontAll: true,
              'h-icon-all-caret-down': true,
            },
            on: {
              click: () => {
                if (!isNaN(Number(this.valueText)) && !self.readonly) {
                  self.$emit('change', self.field, Number(this.valueText) - 1);
                }
              },
            },
          }),
        ],
      ),
    ];

    return h(
      'div',
      {
        class: {
          'integer-block': true,
        },
      },
      [h('a-input', inputOptions), ...integerSteps],
    );
  }

  /**
   * 日期类型render
   * @param h
   */
  dateRender(h: any): any {
    const self = this;
    const timer = Date.parse(self.value);
    const date: any = !isNaN(timer)
      ? moment(new Date(timer), self.options.dateFormat)
      : null;
    return h('a-date-picker', {
      class: {
        date: true,
      },
      props: {
        value: date,
        defaultValue: date,
        format: self.options.dateFormat,
        showTime: self.options.showTime,
        disabled: self.readonly,
      },
      on: {
        change: (dateArg: any, dateString: string) => {
          self.$emit('change', self.field, dateString);
          if (self.options.callback instanceof Function) {
            self.$emit('callback', self.field, self.options.callback);
          }
        },
      },
    });
  }

  /**
   * 弹窗render
   * @param h
   */
  customRender(h: any): any {
    const self: any = this;
    // self.control = self.getControl();
    const attrType = self.options.attrType || self.attrType || '';
    return h(self.options.inputComponent, {
      key: self.control.parentKey + self.control.key,
      props: {
        getFormControls: self.getFormControls,
        getControl: self.getControl,
        dataItem: self.dataItem,
        modalOptions: self.options,
        modalData: {
          type: attrType,
          attributes: self.attributes,
          items: self.formData
            ? typeof self.formData.publishedAttributesJson === 'string'
              ? JSON.parse(self.formData.publishedAttributesJson)
              : self.formData.publishedAttributesJson
            : [],
          data: self.options.importModal(
            {
              attrType: attrType,
              value:
                (self.control &&
                  self.control.options &&
                  self.control.options.dictionariesData) ||
                (self.control &&
                  self.control.options &&
                  self.control.options.labels) ||
                self.value,
              options: self.options,
            },
            self.attributes,
            self.assistAttribute,
          ),
        },
      },
      on: {
        backData: (value: any) => {
          if (self.field === 'options' && self.label === '选项') {
            if (value.value.indexOf('schemaCode') > -1) {
              self.control.optionType = 'model';
              self.control.options.dictionariesData = '';
              self.control.options.labels = '';
            } else if (value.value.indexOf('checkedDictionary') > -1) {
              self.control.optionType = 'dictionary';
              self.control.options.labels = '';
            } else {
              self.control.optionType = 'custom';
              self.control.options.dictionariesData = '';
              self.control.options.labels = '';
            }
            self.$emit('optionTypeChange', {
              optionsType: self.control.optionType,
              key: self.control.key,
              parentKey: self.control.parentKey,
            });
          }

          self.$emit(
            'change',
            self.field,
            self.options.exportModal(
              value,
              { attrType: attrType, value: self.value },
              self.attributes,
              (field: string, val: any) => {
                self.$emit('change', field, val);
              },
              self,
            ),
          );

          // 修改同步开关状态
          if (self.field === 'format1') {
            self.$emit('change', 'syncFormate', value.syncFlag);
          }

          if (self.options.callback instanceof Function) {
            self.$emit('callback', self.field, self.options.callback);
          }
        },
      },
    });
  }

  /**
   * 弹窗render
   * @param h
   */
  modalRender(h: any): any {
    const self: any = this;

    if (self.options.custom) {
      // 原来使用的modal弹窗，需要平铺展开的属性
      return this.customRender(h);
    }
    let flag: boolean = true;
    if (self.field === 'format1') {
      flag = this.handleHistoryFormate();
    }

    let klass: boolean = false;
    if (self.field === 'format1') {
      const control = self.getControl();
      const syncFlag = control.options.syncFormate;
      if (syncFlag && flag) {
        klass = true;
      }
    }
    const subDom = [
      h('span', {
        class: {
          txt: true,
          klass: klass,
          textNew: true,
        },
        domProps: {
          innerText: self.options.formatter
            ? self.options.formatter(
                self.value,
                self.attributes,
                self.assistAttribute,
                self.getControl(),
                flag,
                self.getControls(),
              )
            : self.value,
          title: self.options.formatter
            ? self.options.formatter(
                self.value,
                self.attributes,
                self.assistAttribute,
                self.getControl(),
                flag,
                self.getControls(),
              )
            : self.value,
        },
      }),
      h('i', {
        class: {
          'aufontAll h-icon-all-delete1': true,
        },
        on: {
          click: (event) => {
            event.stopPropagation();
            if (!self.readonly) {
              self.$emit('change', self.field, '');
            }
          },
        },
      }),
      // h('i', {
      //   class: {
      //     'aufontAll h-icon-all-ellipsis-o': true,
      //   },
      // }),
    ];
    /* console.log('this.field==>', this.field, self.options); */
    const attrType = self.options.attrType || self.attrType || '';
    let readonlyFormula: any = null;
    if (Array.isArray(self.assistAttribute)) {
      readonlyFormula = self.assistAttribute.find(
        (a: any) => a.field === 'readonlyFormula',
      );
    }
    if (this.field === 'heads') {
      return h(self.options.inputComponent, {
        key: self.control.key,
        props: {
          getFormControls: self.getFormControls,
          getControl: self.getControl,
          dataItem: self.dataItem,
          modalOptions: self.options,
          modalData: {
            type: attrType,
            attributes: self.attributes,
            items: self.formData
              ? JSON.parse(self.formData.publishedAttributesJson)
              : [],
            data: self.options.importModal(
              {
                attrType: attrType,
                value:
                  (self.control &&
                    self.control.options &&
                    self.control.options.dictionariesData) ||
                  (self.control &&
                    self.control.options &&
                    self.control.options.labels) ||
                  self.value,
                options: self.options,
              },
              self.attributes,
              self.assistAttribute,
            ),
          },
        },
        on: {
          backData: (value: any[]) => {
            self.$emit(
              'change',
              self.field,
              self.options.exportModal(
                value,
                { attrType: attrType, value: self.value },
                self.attributes,
                (field: string, val: any) => {
                  self.$emit('change', field, val);
                },
                self,
              ),
            );
          },
        },
      });
    } else if (this.field === 'print') {
      const attrType = self.options.attrType || self.attrType || '';
      let readonlyFormula: any = null;
      if (Array.isArray(self.assistAttribute)) {
        readonlyFormula = self.assistAttribute.find(
          (a: any) => a.field === 'readonlyFormula',
        );
      }
      const data = self.options.importModal(
        {
          attrType: attrType,
          value: self.value,
          options: self.options,
        },
        self.attributes,
        self.assistAttribute,
      );
      return h('Print', {
        key: self.$route.params.sheetCode + data.value.printTemplateJson,
        props: {
          modalData: {
            type: attrType,
            attributes: self.attributes,
            items: self.formData
              ? JSON.parse(self.formData.publishedAttributesJson)
              : [],
            data: data,
          },
        },
        on: {
          change: (value: any[]) => {
            const printTemplateJson = value.filter((el) => !el.delete);
            const delPrintTemplate = value
              .filter((el) => el.delete)
              .map((el) => el.sheetCode);
            self.$emit(
              'change',
              'printTemplateJson',
              JSON.stringify(printTemplateJson),
            );

            if (delPrintTemplate.length) {
              self.$emit('change', 'deletePrintTemp', delPrintTemplate);
            }
          },
        },
      });
    } else if (this.field === 'templateFile') {
      const attrType = self.options.attrType || self.attrType || '';

      return h('TemplateFile', {
        props: {
          modalData: {
            type: attrType,
            attributes: self.attributes,
            data: self.value && self.value.length > 0 ? self.value : [],
          },
        },
        on: {
          backData: (fileList: any[]) => {
            self.$emit('change', 'templateFile', fileList);
          },
        },
      });
    } else if (this.field === 'number') {
      const attrType = self.options.attrType || self.attrType || '';

      return h('ImageNum', {
        key: self.control.key,
        props: {
          modalData: {
            type: attrType,
            attributes: self.attributes,
            data:
              self.value && self.value.length > 0 ? { value: self.value } : {},
          },
        },
        on: {
          backData: (value: any[]) => {
            self.$emit('change', 'number', value);
          },
        },
      });
    } else if (this.field === 'defaultValue') {
      const attrType = self.options.attrType || self.attrType || '';

      return h('Location', {
        key: self.control.key,
        props: {
          modalData: {
            type: attrType,
            attributes: self.attributes,
            data: self.value ? { value: self.value } : {},
          },
          getControl: self.getControl,
        },
        on: {
          backData: (location: any[]) => {
            self.$emit('change', 'defaultValue', location);
          },
        },
      });
    } else {
      return h(
        'div',
        {
          class: {
            'input-modal': true,
          },
          on: {
            click: () => {
              self.createModal();
            },
          },
        },
        [
          h('i', {
            class: {
              'aufontAll h-icon-all-setting-o': true,
            },
            attrs: {
              title: '设置',
            },
            on: {
              click: (event) => {
                if (self.readonly) {
                  event.stopPropagation();
                }
              },
            },
          }),
          ...subDom,
        ],
      );
    }
  }

  // 历史显示格式默认格式兼容处理
  handleHistoryFormate() {
    const self = this;
    console.log(self);
    console.log('con', this.getFormControls());
    // 读大JSON处理历史数据
    console.log('大json', this.formData);
    const selfCode: any = self.dataItem.code;
    const draft: any = this.formData.draftAttributesJson;
    const push: any = this.formData.publishedAttributesJson;
    if (push) {
      try {
        const pushJSON: any = JSON.parse(push);
        const target = pushJSON[selfCode];
        if (
          target.options.format1 &&
          target.options.format !== target.options.format1 &&
          !('syncFormate' in target.options)
        ) {
          // self.$emit("change", 'syncFormate', false);
          return false;
        }
      } catch (error) {}
    } else if (draft) {
      try {
        const draftJSON: any = JSON.parse(draft);
        const target = draftJSON[selfCode];
        if (
          target.options.format1 &&
          target.options.format !== target.options.format1 &&
          !('syncFormate' in target.options)
        ) {
          // self.$emit("change", 'syncFormate', false);
          return false;
        }
      } catch (error) {}
    } else {
      //Else Empty block statement
    }
    return true;
  }

  selectAllRender(h) {
    const self = this;
    return h(Dialog, {
      class: {},
      props: {
        propDataList: self.options.list ? self.options.list : [],
        fieldBlock: 100,
        fromForm: true,
        value: self.getDropdownData,
      },
      on: {
        addcomfirm: (icon, value: any) => {
          const val: any = [];
          value.forEach((i) => {
            if (i.checked) {
              val.push(i.code);
            }
            if (
              i.propertyType === DataItemType.Sheet &&
              i.subSchema &&
              i.subSchema.properties
            ) {
              i.subSchema.properties.forEach((v) => {
                if (v.checked) {
                  val.push(`${i.code}.${v.code}`);
                }
              });
            }
          });
          self.$emit('change', self.field, val);
        },
      },
    });
  }

  sheetFiters(h) {
    const self = this;
    return h(sheetFiters, {
      class: {},
      props: {
        propDataList: self.options.list ? self.options.list : [],
        fieldBlock: 100,
        status: true,
        value: self.getDropdownData,
      },
      on: {
        addcomfirm: (icon, value: any) => {
          self.$emit('change', self.field, value);
        },
      },
    });
  }

  createModal() {
    const self = this;
    const attrType = self.options.attrType || self.attrType || '';
    let readonlyFormula: any = null;
    if (Array.isArray(self.assistAttribute)) {
      readonlyFormula = self.assistAttribute.find(
        (a: any) => a.field === 'readonlyFormula',
      );
    }
    console.log(self, 'self');
    const Instance = new Vue({
      store,
      router,
      i18n,
      render(create: any) {
        return create(Modal, {
          props: {
            getFormControls: self.getFormControls,
            getControl: self.getControl,
            dataItem: self.dataItem,
            modalOptions: self.options,
            isShowRequired:
              (readonlyFormula &&
                readonlyFormula.value &&
                self.attributeItem.field === 'requiredFormula') ||
              (self.dataItem &&
                self.dataItem.propertyEmpty &&
                self.attributeItem.field === 'requiredFormula'),
            modalData: {
              label: self.label,
              type: attrType,
              attributes: self.attributes,
              items: self.formData
                ? JSON.parse(self.formData.publishedAttributesJson)
                : [],
              data: self.options.importModal(
                {
                  attrType: attrType,
                  value:
                    (self.attributeItem.field === 'options' &&
                      self.control &&
                      self.control.options &&
                      self.control.options.dictionariesData) ||
                    (self.attributeItem.field === 'options' &&
                      self.control &&
                      self.control.options &&
                      self.control.options.labels) ||
                    self.value,
                  options: self.options,
                },
                self.attributes,
                self.assistAttribute,
                self,
              ),
            },
          },
          on: {
            confirm: (value: any) => {
              if (self.field === 'options' && self.label === '选项') {
                if (value.value.indexOf('schemaCode') > -1) {
                  self.control.optionType = 'model';
                  self.control.options.dictionariesData = '';
                  self.control.options.labels = '';
                } else if (value.value.indexOf('checkedDictionary') > -1) {
                  self.control.optionType = 'dictionary';
                  self.control.options.labels = '';
                } else {
                  self.control.optionType = 'custom';
                  self.control.options.dictionariesData = '';
                  self.control.options.labels = '';
                }
                self.$emit('optionTypeChange', {
                  optionsType: self.control.optionType,
                  key: self.control.key,
                  parentKey: self.control.parentKey,
                });
              }

              self.$emit(
                'change',
                self.field,
                self.options.exportModal(
                  value,
                  { attrType: attrType, value: self.value },
                  self.attributes,
                  (field: string, val: any) => {
                    self.$emit('change', field, val);
                  },
                  self,
                ),
              );

              // 修改同步开关状态
              if (self.field === 'format1') {
                self.$emit('change', 'syncFormate', value.syncFlag);
              }

              if (self.options.callback instanceof Function) {
                self.$emit('callback', self.field, self.options.callback);
              }
              Instance.$destroy();
              document.body.removeChild(component.$el);
            },
            cancel: () => {
              Instance.$destroy();
              document.body.removeChild(component.$el);
            },
          },
        });
      },
    });
    const component: any = Instance.$mount();
    document.body.appendChild(component.$el);
    self.modal = Instance.$children[0] as any;
  }

  selectTreeRender(h: any): any {
    const self = this;

    return h('a-tree-select', {
      class: {
        date: true,
      },
      props: {
        treeData: self.options.tree(),
        value: self.value && self.value !== '' ? JSON.parse(self.value) : null,
        allowClear: true,
        labelInValue: true,
        disabled: self.readonly,
      },
      on: {
        treeExpand: self.options.onExpand,
        change: (value: any) => {
          self.$emit('change', self.field, JSON.stringify(value) || '');
          if (self.options.callback instanceof Function) {
            self.$emit('callback', self.field, self.options.callback);
          }
        },
      },
    });
  }

  treeRender(h: any): any {
    const self = this;
    if (self.field === 'schemaCode') {
      let appPackageCode = '';
      let appFunctionCode = '';
      let appCodeAttr: any;
      let funCodeAttr: any;
      const currentCode = this.$route.params.appCode;

      if (self.dataItem) {
        appPackageCode = self.dataItem.appPackageCode;
        appFunctionCode = self.dataItem.appFunctionCode;
      } else {
        appCodeAttr = self.attributes.find(
          (a: any) => a.field === 'appPackageCode',
        );
        if (appCodeAttr) {
          appPackageCode = appCodeAttr.value;
        }

        funCodeAttr = self.attributes.find(
          (a: any) => a.field === 'appFunctionCode',
        );
        if (funCodeAttr) {
          appFunctionCode = funCodeAttr.value;
        }
      }

      const setAppCode = (val: string) => {
        if (self.dataItem) {
          self.dataItem.appPackageCode = val;
        }
        // else {
        //   appCodeAttr.value = val;
        // }
      };

      const setFunCode = (val: string) => {
        if (self.dataItem) {
          self.dataItem.appFunctionCode = val;
        }
        // else {
        //   funCodeAttr.value = val;
        // }
      };
      //未获取到关联表单的编码则获取option中的schemaCode
      if (!self.value && self.dataItem) {
        const optionsJson = self.dataItem.options
          ? JSON.parse(self.dataItem.options)
          : '';
        self.value = optionsJson ? optionsJson.schemaCode : '';
      }

      return h('biz-models-selector', {
        props: {
          value: self.value || (self.dataItem && self.dataItem.relativeCode),
          appCode: appPackageCode,
          folderId: appFunctionCode,
          disabled: self.options.disabled || self.readonly,
          currentCode: currentCode,
          appManagerFilter: true,
          organization: true,
        },
        on: {
          // change: (value: any) => {
          //   self.$emit('change', self.field, value || '');
          //   if (self.options.callback instanceof Function) {
          //     self.$emit('callback', self.field, self.options.callback);
          //   }
          // },
          select: (value: string[]) => {
            let schemaCode = '';
            if (value.length > 0) {
              schemaCode = value[value.length - 1];
              if (value.length > 1) {
                setAppCode(value[0]);
              }
              if (value.length > 2) {
                setFunCode(value[1]);
              } else {
                setFunCode('');
              }
            } else {
              setAppCode('');
              setFunCode('');
            }

            if (self.dataItem || self.field === 'schemaCode') {
              self.$emit('change', self.field, schemaCode);
            } else {
              self.$emit('change', self.field, value);
            }
            if (self.options.callback instanceof Function) {
              self.$emit('callback', self.field, self.options.callback);
            }
          },
        },
      });
    }
  }

  UserpickerRender(h: any): any {
    const self = this;
    return h(Selector, {
      props: {
        value: this.value !== '' ? JSON.parse(this.value) : [],
        options: this.options.pickerOptions,
      },
      on: {
        change(list: any) {
          const pickerList = list.map((item: any) => ({
            id: item.id,
            unitType: item.unitType,
            name: item.name,
          }));
          self.$emit(
            'change',
            self.field,
            pickerList.length ? JSON.stringify(pickerList) : '',
          );
          if (self.options.callback instanceof Function) {
            self.$emit('callback', self.field, self.options.callback);
          }
        },
      },
    });
  }

  render(h: any) {
    let render: any = null;
    // if (this.options && this.options.disabled && this.field !== 'schemaCode') {
    //   render = h('span', {
    //     class: {
    //       'attr-val-disabled': true,
    //     },
    //     domProps: {
    //       title: this.value,
    //       innerText: this.value,
    //     },
    //   });
    // } else {
    // console.log(this.label,this.options, this.type)
    const _type = this.options.inputMethod || this.type;
    switch (_type as any) {
      case ControlAttributeType.String:
      case 'string':
      case 'number':
        render = this.stringRender(h);
        break;
      case ControlAttributeType.Dropdown:
        render = this.dropdownRender(h);
        break;
      case ControlAttributeType.Boolean:
      case 'boolean':
        render = this.booleanRender(h);
        break;
      case ControlAttributeType.Date:
        render = this.dateRender(h);
        break;
      case ControlAttributeType.Modal:
        render = this.modalRender(h);
        break;
      case ControlAttributeType.SelectTree:
        render = this.selectTreeRender(h);
        break;
      case ControlAttributeType.Userpicker:
        render = this.UserpickerRender(h);
        break;
      case ControlAttributeType.Tree:
        render = this.treeRender(h);
        break;
      case ControlAttributeType.Checkbox:
      case 'checkbox':
        render = this.CheckboxRender(h);
        break;
      case 'integer':
        render = this.integerRender(h);
        break;
      case ControlAttributeType.RadioGroup:
      case 'radioGroup':
        render = this.radioGroupRender(h);
        break;
      case 'array':
        if (this.field === 'sheetFiters') {
          // 子表筛选条件
          render = this.sheetFiters(h);
        } else {
          // 弹出框字段
          render = this.selectAllRender(h);
        }

        break;
      default:
        render = h('span', {
          class: {
            'attr-val-text': true,
          },
          domProps: {
            title: this.value,
            innerText: this.value,
          },
        });
        break;
    }

    return render;
  }

  created() {
    // console.log('this.options =>', this.options)
    // console.log('this.dataItem =>', this.dataItem)
    // console.log('this.attributeItem =>', this.attributeItem)
    if (this.field === 'externalLinkAble' && this.value) {
      const sheetData: any = this.attributes.find((res: any) => {
        return res.field === 'sheetData';
      });
      if (sheetData.value.shortCode) {
        this.shortCode = sheetData.shortCode;
      }
      this.getShortCode(
        sheetData.value.schemaCode,
        sheetData.value.code,
        this.shortCode,
        true,
        sheetData.value.id,
      );
    }
  }

  async getShortCode(schemaCode, sheetCode, shortCode, value, formId) {
    // 兼容老数据根据id生成链接
    if (shortCode) {
      return this.createQrCode(shortCode);
    }

    const vm: any = this;
    await formApi.getShortCode(schemaCode, sheetCode).then((res: any) => {
      vm.shortCode = res.data;
      this.createQrCode(vm.shortCode);
    });
  }

  createQrCode(shortCode, formId?) {
    if (shortCode) {
      this.pcUrl = `${window.location.protocol}//${window.location.host}/el.html?c=${shortCode}`;
    } else {
      this.pcUrl = `${window.location.protocol}//${window.location.host}/externalLink.html?formId=${formId}`;
    }

    this.imgUrl =
      `${env.apiHost}/api/qrcode/generate_qrcode?text=` + this.pcUrl;
  }

  specialIntegerFieldValid(field, valueText) {
    if (field === 'maxLength' && valueText === '0') {
      // 文本最大长度
      return '1';
    }

    if (field === 'fileNumber') {
      // 文件最大上传数量
      if (Number.isNaN(Number(valueText)) || Number(valueText) < 1) {
        return '1';
      } else if (Number(valueText) > 1000) {
        return '1000';
      } else {
        return valueText.split('.')[0];
      }
    }
    return valueText;
  }
}
</script>
<style lang="less" scoped>
.templateFile {
  color: @primary-color;
}
.templateFileUpkoad {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px 0;
  box-sizing: border-box;
  height: 30px;
  width: 100px;
}
</style>

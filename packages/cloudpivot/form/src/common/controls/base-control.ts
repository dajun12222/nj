import {
  Control,
  ControlPropertyChange,
  ControlValueChange,
  FormControl,
  FormGroup,
  FormSheet,
  PropertyNames,
} from 'cloudpivot-forms';
// @ts-ignore
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import { formApi, listApi, listParams } from '../../../../api';
import dateFormat from '../../../../common/src/utils/date';
import {
  DataItemLike,
  DataItemType,
  FormControlType,
  OperatorService,
  RendererFormControl,
} from '../.././../schema';
import * as typings from '../.././schema';
import { ControlHelper } from './control-helper';
export abstract class BaseControl<
  T extends typings.FormControlOptions,
> extends Vue {
  @Prop()
  readonly control!: RendererFormControl;

  styleObj: any = {};

  get id() {
    if (this.control.parentKey) {
      return `${this.control.parentKey}-${this.control.key}`;
    }
    return this.control.key;
  }

  get ctrl() {
    if (!this.control.controller) {
      if (!this.control.parentKey) {
        const _ctrl = this.findController(this.control.key);
        this.$set(this.control, 'controller', _ctrl);
      }
    }
    if (this.control.parentKey) {
      // @ts-ignore
      this.control.controller.parentKey = this.control.parentKey;
    }

    return this.control.controller as Control;
  }

  get readonly() {
    // return this.control.edit === false;
    if (this.ctrl) {
      return !!this.ctrl.readonly;
    }
    return false;
  }

  @Watch('ctrl.items')
  onCtrlItemsChange(value: any) {
    if (value) {
      (this.controlOpts as any).options = Array.isArray(value)
        ? value.join(';')
        : value;
    }
  }

  get controlOpts(): T {
    return this.control.options as T;
  }

  get style(): any {
    return this.controlOpts.style || null;
  }

  get label() {
    return ControlHelper.getControlLabel(this.control, this.$i18n.locale);
  }

  get locale() {
    return this.$i18n.locale || 'zh';
  }

  get placeholder() {
    if (
      !(
        [
          FormControlType.Text,
          FormControlType.Textarea,
          FormControlType.Number,
          FormControlType.NumberRange,
        ].includes(this.control.type) &&
        this.controlOpts.placeholder === '请输入'
      )
    ) {
      if (this.controlOpts.placeholder) {
        return this.controlOpts.placeholder;
      }
    }

    switch (this.control.type) {
      case FormControlType.Text:
      case FormControlType.Textarea:
      case FormControlType.Number:
      case FormControlType.NumberRange:
        return this.$t('cloudpivot.form.renderer.pleaseInput');

      case FormControlType.Date:
      case FormControlType.StaffSelector:
      case FormControlType.StaffMultiSelector:
      case FormControlType.DepartmentSelector:
      case FormControlType.DepartmentMultiSelector:
      case FormControlType.StaffDeptMixed:
      case FormControlType.Dropdown:
      case FormControlType.DropdownMulti:
      case FormControlType.Checkbox:
      case FormControlType.Radio:
      case FormControlType.Address:
      case FormControlType.Location:
      case FormControlType.RelevanceForm:
      case FormControlType.RelevanceFormEx:
        return this.$t('cloudpivot.form.renderer.pleaseSelect');
      default:
        break;
    }

    return '';
  }

  get readonlyFormula() {
    //获取是否只读布尔类型
    if (this.controlOpts.readonlyFormula) {
      return this.controlOpts.readonlyFormula;
    } else {
      //获取只读规则校验的结果
      if (this.ctrl) {
        return !!this.ctrl.disabled;
      }
    }
  }

  // 是否为外部用户
  get isExternal() {
    return !!(window as any).isExternal;
  }

  @Inject()
  findController!: (key: string, obj?: any) => Control;

  @Inject()
  getController!: () => FormGroup;

  @Inject()
  getFormControls!: (keys?: string[]) => RendererFormControl[];

  @Inject()
  getScrollEl!: () => HTMLDivElement;

  @Inject()
  valChange!: (key: string, fun: Function) => void;

  @Inject()
  getDataItem!: (key: string, parentKey?: string) => DataItemLike;

  @Inject()
  getRelativeDataList!: (isList?: boolean) => [];

  @Inject()
  getSourceType!: () => string;

  setControl?(): void;

  getIsNew(): boolean {
    const isNew = (window as any).h3form
      ? !!(window as any).h3form.isNew
      : true;
    return isNew;
  }

  propChangeSubscription?: Subscription;

  valueChangeSubscription: Subscription | null = null;

  onChangeFn: Function | null = null;

  handleValueChange?(value: any, changeInfo: any): void;

  getPopupContainer() {
    return (triggerNode: any) => {
      if (this.getScrollEl) {
        const scrollEl = this.getScrollEl();
        if (scrollEl) {
          return scrollEl;
        }
      }
      return document.body;
    };
  }

  getThisProxy() {
    return this.getController().children;
  }

  getControllerGroup() {
    return this.getController();
  }

  recordDelFile(delFile: any) {
    if (this.$root.$store.state.delFile) {
      // @ts-ignore
      this.$root.$store.state.delFile.push({
        name: delFile.response ? delFile.response.data.name : delFile.name,
        refId: delFile.response ? delFile.response.data.refId : delFile.refId,
      });
    } else {
      // @ts-ignore
      this.$root.$store.state.delFile = [
        {
          name: delFile.response ? delFile.response.data.name : delFile.name,
          refId: delFile.response ? delFile.response.data.refId : delFile.refId,
        },
      ];
    }
  }

  setValue(value: any) {
    if (this.ctrl) {
      this.ctrl.value = value;
    }

    // 视图列表搜索，时间控件需要重新渲染
    this.setControl && this.setControl();
  }

  @Watch('control', {
    immediate: true,
  })
  onControlChange(c: RendererFormControl, oldControl: RendererFormControl) {
    // 防止 this.$set(this.control, 'controller', _ctrl) 时再次触发change
    if (c === oldControl) {
      return;
    }
    if (
      this.ctrl &&
      [FormControlType.Dropdown, FormControlType.DropdownMulti].includes(c.type)
    ) {
      this.$set(this.ctrl, 'items', '');
    }
    if (this.setControl) {
      this.setControl();
    }
    if (this.style) {
      this.style
        .trim()
        .split(';')
        .forEach((s) => {
          const [key, value] = s.trim().split(':');
          this.styleObj[key] = value;
        });
    } else {
      this.styleObj = {};
    }
    const that = this;
    function timeOutSubscribe() {
      // @ts-ignore
      if (that.ctrl.setReadonlyOver) {
        that.subscribeValueChange();
        that.unRefSubscription(oldControl);
        that.unRefSubscriptionTimer(oldControl);
      } else {
        setTimeout(() => {
          timeOutSubscribe();
        }, 100);
      }
    }
    if (that.ctrl.inSheet) {
      this.subscribeValueChange();
      this.unRefSubscription(oldControl);
      this.unRefSubscriptionTimer(oldControl);
    } else {
      timeOutSubscribe();
    }
  }

  get InEdit(): boolean {
    return (window as any).h3form ? !!(window as any).h3form.inEdit : false;
  }

  subscribeValueChange() {
    const ctrl = this.ctrl as FormControl<any>;
    if (!ctrl || !ctrl.valueChange) {
      return;
    }

    const dataLinkage: any = ctrl.options.dataLinkage;
    if (dataLinkage) {
      // 设置数据联动
      this.setDataLinkage(dataLinkage);
    }

    const computeFormulaNew = ctrl.options.computeFormulaNew;
    if (computeFormulaNew) {
      // 设置计算规则
      this.setComputeFormulaHandle(computeFormulaNew);
    }

    this.unsubscribeValueChange();

    this.valueChangeSubscription = ctrl.propertyChange.subscribe((change) => {
      switch (change.name) {
        case PropertyNames.Value:
          this.emitControlOnChange(change);

          if (this.handleValueChange) {
            if (
              (!ctrl.readonly || this.InEdit) &&
              !isEqual(change.value, change.oldValue)
            ) {
              this.handleValueChange(change.value, change);
            }
          }
          break;
        default:
          break;
      }
    });
    // if (
    //   valueChangeSubscription &&
    //   (window as any).valueChangeSubscriptionList &&
    //   (window as any).valueChangeSubscriptionList.length > 0
    // ) {
    //   (window as any).valueChangeSubscriptionList.push(valueChangeSubscription);
    // } else {
    //   (window as any).valueChangeSubscriptionList = [];
    //   (window as any).valueChangeSubscriptionList.push(valueChangeSubscription);
    // }
  }

  // 设置计算规则
  setComputeFormulaHandle(computeFormulaNew: string) {
    if (!computeFormulaNew) {
      return;
    }
    const ctrl = this.ctrl as FormControl<any>;
    let formulaStr: string = '';
    try {
      const computeObj: any = JSON.parse(computeFormulaNew);
      if (computeObj) {
        formulaStr = computeObj.formula;
      }
    } catch (err) {
      console.log(err);
    }
    // 解析计算规则表达式，订阅发送
    const relevantDataItems: string[] | null = formulaStr.match(/\{.*?\}/g);

    if (Array.isArray(relevantDataItems)) {
      relevantDataItems.forEach((formulaItemKey: string) => {
        const dataItemKey: string = formulaItemKey.substring(
          1,
          formulaItemKey.length - 1,
        );
        let controller: any = null;
        const idx = dataItemKey.indexOf('.');
        if (idx > -1) {
          // 子表条件
          const sheetKey = dataItemKey.substring(0, idx);
          const controlKey = dataItemKey.substr(idx + 1);
          controller = this.findController(sheetKey) as any;

          if (
            formulaStr.indexOf('COUNT') > -1 &&
            formulaStr.indexOf('COUNTIF') === -1
          ) {
            const sheetColumnSubject: any = controller.getColumnValueChange(
              controlKey,
              this.ctrl.rowIndex,
            );
            if (sheetColumnSubject) {
              sheetColumnSubject.subscribe((change: any) => {
                if (this.ctrl.isImportControl) {
                  setTimeout(() => {
                    this.ctrl.isImportControl = false;
                  }, 80);
                  return;
                }
                if (!ctrl.readonly || this.InEdit) {
                  if (Array.isArray(relevantDataItems)) {
                    localStorage.setItem('isComputeFormulComplete', 'false');
                  }
                  setTimeout(() => {
                    const bizRuleCalculate: any = {};
                    bizRuleCalculate.expression = formulaStr;
                    const dataParamsMap: any = {};
                    if (Array.isArray(relevantDataItems)) {
                      relevantDataItems.forEach((formulaInnerKey: string) => {
                        const innerCode: string = formulaInnerKey.substring(
                          1,
                          formulaInnerKey.length - 1,
                        );
                        let relevantCtrl: any = null;
                        const idx = innerCode.indexOf('.');
                        if (idx > -1) {
                          // 子表条件
                          const sheetKey = innerCode.substring(0, idx);
                          const controlKey = innerCode.substr(idx + 1);
                          relevantCtrl = this.findController(sheetKey) as any;
                          if (relevantCtrl) {
                            const data: any[] =
                              relevantCtrl.value.map(
                                (item: any) => item[controlKey],
                              ) || [];
                            // data = data.filter((el) => el !== null);
                            dataParamsMap[innerCode] = data.length ? data : [];
                          }
                        } else {
                          relevantCtrl = this.findController(innerCode) as any;
                          const dataItem = this.getDataItem(innerCode);
                          if (relevantCtrl && dataItem) {
                            const val: any = relevantCtrl.value;
                            dataParamsMap[innerCode] = this.formatVal(
                              val,
                              dataItem.propertyType,
                            );
                          }
                        }
                      });
                      bizRuleCalculate.dataParamsMap = dataParamsMap;
                      const id = ctrl.id as string;
                      // @ts-ignore
                      const parentKey = ctrl.parentKey ? ctrl.parentKey : '';
                      const dataItem = this.getDataItem(id, parentKey);
                      if (dataItem) {
                        bizRuleCalculate.schemaCode = dataItem.schemaCode;
                        bizRuleCalculate.propertyCode = ctrl.id;
                      }
                      this.getComputeFormulaVal(bizRuleCalculate, dataItem);
                    }
                  }, 500);
                }
              });
            }
          } else {
            const sheetColumnSubject: any = controller.getColumnValueChange(
              controlKey,
              this.ctrl.rowIndex,
            );
            if (sheetColumnSubject) {
              sheetColumnSubject.subscribe((change: any) => {
                if (this.ctrl.isImportControl) {
                  setTimeout(() => {
                    this.ctrl.isImportControl = false;
                  }, 80);
                  return;
                }
                if (!ctrl.readonly || this.InEdit) {
                  if (!ctrl.inSheet) {
                    if (Array.isArray(relevantDataItems)) {
                      localStorage.setItem('isComputeFormulComplete', 'false');
                    }
                    //主表字段
                    setTimeout(() => {
                      const bizRuleCalculate: any = {};
                      bizRuleCalculate.expression = formulaStr;
                      const dataParamsMap: any = {};
                      if (Array.isArray(relevantDataItems)) {
                        relevantDataItems.forEach((formulaInnerKey: string) => {
                          const innerCode: string = formulaInnerKey.substring(
                            1,
                            formulaInnerKey.length - 1,
                          );
                          let relevantCtrl: any = null;
                          const idx = innerCode.indexOf('.');
                          if (idx > -1) {
                            // 子表条件
                            const sheetKey = innerCode.substring(0, idx);
                            const innerControlKey = innerCode.substr(idx + 1);
                            const dataItem = this.getDataItem(
                              innerControlKey,
                              sheetKey,
                            );
                            const formulaStrList = [
                              'sum',
                              'avg',
                              'max',
                              'min',
                              'countif',
                            ];
                            formulaStrList.forEach((formulaItem) => {
                              if (formulaStr.indexOf(formulaItem) > -1) {
                                const UpperCaseStr = formulaItem.toUpperCase();
                                formulaStr = formulaStr.replace(
                                  formulaItem,
                                  UpperCaseStr,
                                );
                              }
                            });
                            let isAggregateFunc =
                              formulaStr.indexOf('SUM') > -1 ||
                              formulaStr.indexOf('AVG') > -1 ||
                              formulaStr.indexOf('MAX') > -1 ||
                              formulaStr.indexOf('MIN') > -1 ||
                              formulaStr.indexOf('COUNTIF') > -1;
                            let tmpVal: any = null;
                            if (controlKey === innerControlKey) {
                              tmpVal = isAggregateFunc
                                ? change.value
                                : change.value[change.rowIndex];
                            } else {
                              relevantCtrl = this.findController(
                                sheetKey,
                              ) as any;
                              if (relevantCtrl) {
                                tmpVal = isAggregateFunc
                                  ? relevantCtrl.value.map(
                                      (item: any) => item[innerControlKey],
                                    )
                                  : relevantCtrl.value.map(
                                      (item: any) => item[innerControlKey],
                                    )[change.rowIndex];
                              }
                            }
                            tmpVal =
                              tmpVal && tmpVal.filter((el: any) => el !== null);
                            dataParamsMap[innerCode] = isAggregateFunc
                              ? tmpVal
                              : this.formatVal(tmpVal, dataItem.propertyType);
                          } else {
                            relevantCtrl = this.findController(
                              innerCode,
                            ) as any;
                            const dataItem = this.getDataItem(innerCode);
                            if (relevantCtrl && dataItem) {
                              const val: any = relevantCtrl.value;
                              dataParamsMap[innerCode] = this.formatVal(
                                val,
                                dataItem.propertyType,
                              );
                            }
                          }
                        });
                        bizRuleCalculate.dataParamsMap = dataParamsMap;
                        const id = ctrl.id as string;
                        // @ts-ignore
                        const parentKey = ctrl.parentKey ? ctrl.parentKey : '';
                        const dataItem = this.getDataItem(id, parentKey);
                        if (dataItem) {
                          bizRuleCalculate.schemaCode = dataItem.schemaCode;
                          bizRuleCalculate.propertyCode = ctrl.id;
                        }

                        this.getComputeFormulaVal(bizRuleCalculate, dataItem);
                      }
                    }, 500);
                  } else {
                    const rowIndex = ctrl.options.rowIndex || 0;
                    if (rowIndex === change.rowIndex) {
                      if (Array.isArray(relevantDataItems)) {
                        localStorage.setItem(
                          'isComputeFormulComplete',
                          'false',
                        );
                      }
                      setTimeout(() => {
                        const bizRuleCalculate: any = {};
                        bizRuleCalculate.expression = formulaStr;
                        const dataParamsMap: any = {};
                        if (Array.isArray(relevantDataItems)) {
                          relevantDataItems.forEach(
                            (formulaInnerKey: string) => {
                              const innerCode: string =
                                formulaInnerKey.substring(
                                  1,
                                  formulaInnerKey.length - 1,
                                );
                              let relevantCtrl: any = null;
                              const idx = innerCode.indexOf('.');
                              if (idx > -1) {
                                // 子表条件
                                const sheetKey = innerCode.substring(0, idx);
                                const innerControlKey = innerCode.substr(
                                  idx + 1,
                                );
                                const dataItem = this.getDataItem(
                                  innerControlKey,
                                  sheetKey,
                                );
                                let tmpVal = null;
                                if (controlKey === innerControlKey) {
                                  tmpVal = change.value[change.rowIndex];
                                } else {
                                  relevantCtrl = this.findController(
                                    sheetKey,
                                  ) as any;
                                  if (relevantCtrl) {
                                    tmpVal = relevantCtrl.value.map(
                                      (item: any) => item[innerControlKey],
                                    )[change.rowIndex];
                                  }
                                }
                                dataParamsMap[innerCode] = this.formatVal(
                                  tmpVal,
                                  dataItem.propertyType,
                                );
                              } else {
                                relevantCtrl = this.findController(
                                  innerCode,
                                ) as any;
                                const dataItem = this.getDataItem(innerCode);
                                if (relevantCtrl && dataItem) {
                                  const val: any = relevantCtrl.value;
                                  dataParamsMap[innerCode] = this.formatVal(
                                    val,
                                    dataItem.propertyType,
                                  );
                                }
                              }
                            },
                          );
                          bizRuleCalculate.dataParamsMap = dataParamsMap;
                          const id = ctrl.id as string;
                          let parentKey = '';
                          // @ts-ignore
                          if (ctrl.parentKey) {
                            // @ts-ignore
                            parentKey = ctrl.parentKey;
                          }
                          const dataItem = this.getDataItem(id, parentKey);
                          if (dataItem) {
                            bizRuleCalculate.schemaCode = dataItem.schemaCode;
                            bizRuleCalculate.propertyCode = ctrl.id;
                          }

                          this.getComputeFormulaVal(bizRuleCalculate, dataItem);
                        }
                      }, 500);
                    }
                  }
                }
              });
            }
          }
        } else {
          controller = this.findController(dataItemKey) as any;
          if (controller && controller.valueChange) {
            if (!ctrl.readonly || this.InEdit) {
              if (
                controller.value === controller.options.value &&
                controller.value
              ) {
                this.ctrlComputeFormula(ctrl, relevantDataItems, formulaStr);
              }
            }
            const optimizationValChange = controller.valueChange.pipe(
              debounceTime(500),
            );
            optimizationValChange.subscribe((change: any) => {
              if (!ctrl.readonly || this.InEdit) {
                this.ctrlComputeFormula(ctrl, relevantDataItems, formulaStr);
              }
            });
          }
        }
      });
    } else {
      if (!ctrl.readonly || this.InEdit) {
        // TODAY 函数
        if (formulaStr === 'TODAY()') {
          const bizRuleCalculate: any = {};
          bizRuleCalculate.expression = formulaStr;
          bizRuleCalculate.dataParamsMap = null;
          const id = ctrl.id as string;
          // @ts-ignore
          const parentKey = ctrl.parentKey ? ctrl.parentKey : '';
          const dataItem = this.getDataItem(id, parentKey);
          if (dataItem) {
            bizRuleCalculate.schemaCode = dataItem.schemaCode;
            bizRuleCalculate.propertyCode = ctrl.id;
          }
          this.getComputeFormulaVal(bizRuleCalculate, dataItem);
        }
      }
    }
  }

  /**
   *请求接口获取计算结果
   * @param {*} bizRuleCalculate 计算参数
   * @param {*} dataItem
   * @memberof BaseControl
   */
  getComputeFormulaVal(bizRuleCalculate, dataItem) {
    const ctrl = this.ctrl as FormControl<any>;
    localStorage.setItem('isComputeFormulComplete', 'false');
    formApi
      .getComputeFormulaVal(bizRuleCalculate)
      .then((res: any) => {
        if ((res && res.errcode === 0) || res.errcode === 101005) {
          if (dataItem) {
            switch (dataItem.propertyType) {
              case DataItemType.ShortText:
              case DataItemType.LongText:
                ctrl.value =
                  res.data || res.data === false ? String(res.data) : '';
                break;
              case DataItemType.Number:
                if (res.data || res.data === 0) {
                  ctrl.value = Number(res.data);
                } else {
                  ctrl.value = null;
                }
                break;
              case DataItemType.Date:
                ctrl.value = res.data
                  ? res.data.length === 10
                    ? new Date(res.data + ' 0:00')
                    : new Date(res.data)
                  : new Date(); //默认为8点，改成0点
                break;
              default:
                ctrl.value = res.data;
                break;
            }
          }
        }
        this.setControl && this.setControl();
        this.setComputeFormulComplete();
      })
      .catch((err: any) => {
        console.log('获取计算值失败', err);
        this.setComputeFormulComplete();
      });
  }

  /**
   *数据联动
   *
   * @param {*} dataLinkage 数据联动配置
   * @return {*}
   * @memberof BaseControl
   */
  setDataLinkage(dataLinkage: any) {
    let dataLinkageOption: any = null;
    const ctrl = this.ctrl as FormControl<any>;

    if (dataLinkage.isDataLinkOpen) {
      dataLinkageOption = JSON.parse(dataLinkage.options.value);
    } else {
      // 兼容老数据
      if (dataLinkage.isDataLinkOpen === false) {
        dataLinkageOption = JSON.parse(dataLinkage.options.value);
      } else {
        dataLinkageOption = JSON.parse(dataLinkage);
      }
    }
    // 解析dataLinkage, 获取condition、fillProperty、targetModel
    const { condition, fillProperty, targetModel } = dataLinkageOption;

    const fillPropertyArr: string[] = fillProperty
      ? fillProperty.split('=')
      : [];
    if (fillPropertyArr.length !== 2) return;
    let fillSrc = fillPropertyArr[0].substring(
      1,
      fillPropertyArr[0].length - 2,
    );
    if (this.control.parentKey) {
      //若联动填充的key值不等于当前数据项的key值，说明数据有误，使用当前替换掉
      fillSrc =
        fillSrc.split('.')[1] !== this.control.key
          ? this.control.key
          : fillSrc.split('.')[1];
      fillSrc = `${this.control.parentKey}.${fillSrc}`;
    } else {
      //若联动填充的key值不等于当前数据项的key值，说明数据有误，使用当前替换掉
      fillSrc = fillSrc !== this.control.key ? this.control.key : fillSrc;
    }
    const fillTar = fillPropertyArr[1].substring(
      2,
      fillPropertyArr[1].length - 1,
    );
    const condArr: string[] = condition ? condition.split('&&') : [];
    condArr.forEach((x) => {
      const arr = x.split('=');
      const { key: currentKey } = this.formatKey(
        arr[0].substring(1, arr[0].length - 2),
      );
      const idx = currentKey.indexOf('.');
      const controller = this.findCtrl(ctrl, currentKey, idx);
      if (controller && controller.valueChange) {
        // 有默认值且默认值不为空时触发默认值
        if (
          this.getIsNew() &&
          controller.value === controller.options.value &&
          (controller.value || controller.value !== 0)
        ) {
          //判断是否导入初始化的，导入初始化的控件不执行数据联动，子表中通过行-组件来进行传递
          if (!this.ctrl.isImportControl) {
            this.ctrlDataLinkageHandle(
              condArr,
              controller,
              fillSrc,
              targetModel,
              fillTar,
            );
          }
          this.ctrl.isImportControl = false;
        }
        const optimizationValChange = controller.valueChange.pipe(
          debounceTime(500),
        );
        optimizationValChange.subscribe((change: any) => {
          if (!ctrl.readonly || this.InEdit) {
            this.ctrlDataLinkageHandle(
              condArr,
              controller,
              fillSrc,
              targetModel,
              fillTar,
            );
          }
        });
      }
    });
  }

  /**
   * 联动触发
   * @param {any[]} condArr 联动触发条件组
   * @param {*} controller 触发联动的控件
   * @param {*} fillSrc 填充字段
   * @param {*} targetModel  联动目标模型
   * @param {*} fillTar 填充来源
   * @memberof BaseControl
   */
  ctrlDataLinkageHandle(
    condArr: any[],
    controller,
    fillSrc,
    targetModel,
    fillTar,
  ) {
    setTimeout(() => {
      const filterArr: any[] = [];
      const extraArr: any[] = [];
      condArr.forEach((item) => {
        localStorage.setItem('isDataLinkageComplete', 'false');
        const innerArr = item.split('=');
        const innerCurrentKey = innerArr[0].substring(
          1,
          innerArr[0].length - 2,
        );
        const innerTargetKey = innerArr[1].substring(2, innerArr[1].length - 1);
        const { key: innerCode } = this.formatKey(innerCurrentKey);
        const idx = innerCode.indexOf('.');
        const ctrl = this.findCtrl(controller, innerCode, idx);
        if (ctrl) {
          filterArr.push({
            key: innerTargetKey,
            val: ctrl.value,
          });
          extraArr.push(innerCurrentKey);
        }
      });
      this.emitOnDataLinkage({
        filter: filterArr,
        fillProperty: {
          src: fillSrc,
          target: fillTar,
        },
        extraCond: extraArr,
        targetModel,
      });
    }, 500);
  }

  /**
   *查找控件
   * @param {*} controller 当前控件
   * @param {string} code 控件编码（子表：Sheet7872456.code）
   * @param {number} idx 子表
   * @return {*}
   * @memberof BaseControl
   */
  findCtrl(controller: any, code: string, idx: number) {
    if (idx > -1) {
      // 子表
      const rowIndex = controller.options.rowIndex || 0;
      const sheetKey = this.control.parentKey || code.substring(0, idx);
      const controlKey = code.substr(idx + 1);
      const sheetCtrl = this.findController(sheetKey) as any;
      if (sheetCtrl) {
        const row = sheetCtrl.rows[rowIndex];
        return row.findChild(controlKey);
      }
    } else {
      return this.findController(code) as any;
    }
  }

  /**
   * 主表计算规则逻辑请求接口
   * @param ctrl
   * @param relevantDataItems
   * @param formulaStr
   */
  ctrlComputeFormula(ctrl: any, relevantDataItems: any, formulaStr: string) {
    if (Array.isArray(relevantDataItems)) {
      localStorage.setItem('isComputeFormulComplete', 'false');
    }
    setTimeout(() => {
      // 组装参数去调用后台接口获取计算值
      const bizRuleCalculate: any = {};
      bizRuleCalculate.expression = formulaStr;
      const dataParamsMap: any = {};
      if (Array.isArray(relevantDataItems)) {
        relevantDataItems.forEach((formulaInnerKey: string) => {
          const innerCode: string = formulaInnerKey.substring(
            1,
            formulaInnerKey.length - 1,
          );
          let relevantCtrl: any = null;
          const idx = innerCode.indexOf('.');
          if (idx > -1) {
            // 子表条件
            const sheetKey = innerCode.substring(0, idx);
            const controlKey = innerCode.substr(idx + 1);
            relevantCtrl = this.findController(sheetKey) as any;
            if (relevantCtrl) {
              let data: any[] =
                relevantCtrl.value.map((item: any) => item[controlKey]) || [];
              data = data.filter((el) => !!el);

              if (
                ctrl.parentKey &&
                ctrl.parentKey !== this.$route.query.schemaCode
              ) {
                dataParamsMap[innerCode] = data.length
                  ? data[ctrl.rowIndex]
                  : [];
              } else {
                dataParamsMap[innerCode] = data.length ? data : [];
              }
            }
          } else {
            relevantCtrl = this.findController(innerCode) as any;
            const dataItem = this.getDataItem(innerCode);
            if (relevantCtrl && dataItem) {
              // 根据控件类型传入值
              const val: any = relevantCtrl.value;
              dataParamsMap[innerCode] = this.formatVal(
                val,
                dataItem.propertyType,
              );
            }
          }
        });
        bizRuleCalculate.dataParamsMap = dataParamsMap;
        const id = ctrl.id as string;
        // @ts-ignore
        const parentKey = ctrl.parentKey ? ctrl.parentKey : '';
        const dataItem = this.getDataItem(id, parentKey);
        if (dataItem) {
          bizRuleCalculate.schemaCode = dataItem.schemaCode;
          bizRuleCalculate.propertyCode = ctrl.id;
        }

        this.getComputeFormulaVal(bizRuleCalculate, dataItem);
      }
    }, 500);
  }

  /**
   * 设置缓存：计算规则状态完成
   */
  setComputeFormulComplete() {
    setTimeout(() => {
      localStorage.setItem('isComputeFormulComplete', 'true');
    }, 1100);
  }

  emitControlOnChange(change: ControlValueChange) {
    const opts = this.controlOpts as any;
    if (this.ctrl.inSheet) {
      // 如果在子表内触发了事件 则要标记当前行状态
      const parentKey: any = this.control.parentKey;
      const key: any = this.control.key;
      const options: any = this.ctrl.options;
      if (parentKey) {
        this.changeFormSheetRowStatus(parentKey, key, options);
      }
    }
    if (!opts.onChange) {
      return;
    }

    if (!this.onChangeFn) {
      this.onChangeFn = new Function(
        'value',
        'oldValue',
        'form',
        opts.onChange,
      );
    }
    const proxy = this.getThisProxy();

    this.onChangeFn.call(proxy, change.value, change.oldValue, proxy);
  }

  /**
   * 设置缓存：数据联动状态完成
   */
  setDataLinkageComplete() {
    setTimeout(() => {
      localStorage.setItem('isDataLinkageComplete', 'true');
    }, 3000); //很多个数据联动，并且存在子表数据联动时响应会很慢，导致计算结果还未渲染状态值已经完成，所以延迟调整为3000ms
  }

  emitOnDataLinkage(params: any) {
    // 传入的参数格式key_dataItemType_fromControlType
    const isOnlyMainCondition: boolean =
      params.extraCond.join('&&').indexOf('.') === -1;
    const isSheetItem: boolean = params.fillProperty.src.indexOf('.') > -1;
    const { key: srcKey } = this.formatKey(params.fillProperty.src);
    const ctrl = this.ctrl as FormControl<any>;
    let controller: any = null;
    let rowIndex: number = 0;
    const filterArr: listParams.Filters[] = [];
    const mulRelevantKeyArr: string[] = [];
    params.filter.forEach((x: any) => {
      const targetKeyArr: any = x.key.split('|');
      if (Array.isArray(targetKeyArr) && targetKeyArr.length === 2) {
        if (Number(targetKeyArr[1]) === DataItemType.RelevanceFormEx) {
          mulRelevantKeyArr.push(x.key);
        }
        const filterVal = this.formatVal(x.val, Number(targetKeyArr[1]), true);
        let filterField:any = {
          propertyCode: targetKeyArr[0],
          propertyType: Number(targetKeyArr[1]),
          propertyValue: filterVal,
          //@ts-ignore
          op: this.formatOpByDataItemType(Number(targetKeyArr[1]), filterVal),
        }

        if(filterField.op === 'Eq' && filterVal === ''){
          filterField.op = 'IsNull'
          filterField.operatorType = 9;
        }
        filterArr.push(filterField);
      } else {
        const {
          key: xKey,
          dataItemType: xDataItemType,
          formControlType: xFormControlType,
        } = this.formatKey(x.key);
        if (Number(xFormControlType) === 81) {
          mulRelevantKeyArr.push(xKey);
        }
        const filterVal = this.formatVal(x.val, Number(xFormControlType), true);
        let filterField:any = {
          propertyCode: xKey,
          propertyType: Number(xDataItemType),
          propertyValue: filterVal,
          //@ts-ignore
          op: this.formatOpByFormControlType(
            Number(xFormControlType),
            filterVal,
          )
        }

        if(filterField.op === 'Eq' && filterVal === ''){
          filterField.op = 'IsNull'
          filterField.operatorType = 9;
        }

        filterArr.push(filterField);
      }
    });

    // 关联查询，如果清空值的情况下，所有的过滤条件都不存在的情况下，增加要给不可能查出值的条件，用来清空历史联动出来的数据
    if (
      filterArr &&
      Array.isArray(filterArr) &&
      filterArr.every((item) => item.propertyValue === '')
    ) {
      filterArr.push({
        propertyCode: 'id',
        propertyType: 0,
        propertyValue: 'IsNull',
        //@ts-ignore
        op: 'Eq',
      });
    }

    const targetKey: string = params.fillProperty['target'];
    let xKey: any = null;
    const targetKeyArr: any = targetKey.split('|');
    let targetType: number = 0;
    let targetControlType: number = -1;
    if (Array.isArray(targetKeyArr) && targetKeyArr.length === 2) {
      xKey = targetKeyArr[0];
      targetType = targetKeyArr[1];
    } else {
      const { key, dataItemType, formControlType } = this.formatKey(targetKey);
      xKey = key;
      targetType = Number(dataItemType);
      targetControlType = Number(formControlType);
    }
    const mixParams: listParams.QueryListParams = {
      filters: filterArr,
      mobile: false,
      page: 0,
      size: 20,
      queryCode: params.targetModel,
      schemaCode: params.targetModel,
      // @ts-ignore
      options: {
        // @ts-ignore
        customDisplayColumns: [xKey].concat(mulRelevantKeyArr),
        // @ts-ignore
        queryDisplayType: 1,
      },
      // @ts-ignore
      customizedQuery: true,
    };
    if (ctrl.options.inSheet) {
      if (isOnlyMainCondition && isSheetItem) {
        // 只有主表条件并且联动项是子表项, 需求要求将满足条件的数据项加到子表中
        if (rowIndex === 0) {
          listApi.getQueryList(mixParams).then((res) => {
            const sheetKey = srcKey.substring(0, srcKey.indexOf('.'));
            const itemKey = srcKey.substring(srcKey.indexOf('.') + 1);
            const sheet = this.findController(sheetKey);
            const sheetControl = this.getFormControls([sheetKey])[0] as any;
            if (
              res.errcode === 0 &&
              res.data &&
              Array.isArray(res.data.content) &&
              res.data.content.length > 0
            ) {
              const rows: any[] = [];
              res.data.content.forEach((item: any) => {
                const vals: any = Object.create(null);
                vals[itemKey] = '';
                rows.push(vals);
              });
              sheet.value = rows;
              setTimeout(() => {
                const rows: any[] = [];
                res.data.content.forEach((item: any, index: number) => {
                  const rowData: any = Object.create(null);
                  const val: any = item.data[xKey];
                  rowData[itemKey] = this.formatValByType(
                    val,
                    targetType,
                    targetControlType,
                  );
                  rows.push(rowData);
                });
                sheet.value = rows;
              }, 10);
            } else {
              sheet.value = [];
            }
            this.setDataLinkageComplete();
          });
        }
      } else {
        const idx = srcKey.indexOf('.');
        rowIndex = ctrl.options.rowIndex || 0;
        const sheetKey = srcKey.substring(0, idx);
        const controlKey = srcKey.substr(idx + 1);
        const sheetCtrl = this.findController(sheetKey) as any;
        if (sheetCtrl) {
          const row = sheetCtrl.rows[rowIndex];
          controller = row.findChild(controlKey);
        }
        listApi.getQueryList(mixParams).then((res) => {
          if (
            res.errcode === 0 &&
            res.data &&
            Array.isArray(res.data.content) &&
            res.data.content.length > 0
          ) {
            const val = res.data.content[0]['data'][xKey];
            //根据目标控件类型格式化值
            controller.value = this.formatValByType(
              val,
              targetType,
              targetControlType,
            );
          } else {
            switch (Number(targetType)) {
              case DataItemType.Date:
              case DataItemType.Attachment:
              case DataItemType.StaffSingle:
              case DataItemType.StaffMulti:
              case DataItemType.DeptSingle:
              case DataItemType.DeptMulti:
              case DataItemType.StaffDeptMix:
              case DataItemType.Sheet:
              case DataItemType.RelevanceForm:
              case DataItemType.RelevanceFormEx:
              case DataItemType.Sheet:
              case DataItemType.Address:
              case DataItemType.Number:
              case DataItemType.Checkbox:
              // case DataItemType.Logic:
              case DataItemType.Time:
                controller.value = null;
                break;
              case DataItemType.DropdownMulti: // 下拉多选数据格式是数组，清空操作
                controller.value = [];
                break;
              default:
                controller.value = '';
                break;
            }
          }
          this.setDataLinkageComplete();
        });
      }
    } else {
      controller = this.findController(srcKey);
      listApi.getQueryList(mixParams).then((res) => {
        if (
          res.errcode === 0 &&
          res.data &&
          Array.isArray(res.data.content) &&
          res.data.content.length > 0
        ) {
          const val = res.data.content[0]['data'][xKey];
          //根据目标控件类型格式化值
          controller.value = this.formatValByType(
            val,
            targetType,
            targetControlType,
          );
        } else {
          switch (Number(targetType)) {
            case DataItemType.Date:
            case DataItemType.Attachment:
            case DataItemType.StaffSingle:
            case DataItemType.StaffMulti:
            case DataItemType.DeptSingle:
            case DataItemType.DeptMulti:
            case DataItemType.StaffDeptMix:
            case DataItemType.Sheet:
            case DataItemType.RelevanceForm:
            case DataItemType.RelevanceFormEx:
            case DataItemType.Sheet:
            case DataItemType.Address:
            case DataItemType.Number:
            case DataItemType.Checkbox:
            // case DataItemType.Logic:
            case DataItemType.Time:
              controller.value = null;
              break;
            case DataItemType.DropdownMulti: // 下拉多选数据格式是数组，清空操作
              controller.value = [];
              break;
            default:
              controller.value = '';
              break;
          }
        }
        this.setDataLinkageComplete();
      });
    }
  }

  // 更新子表某一行的状态
  /**
   * 初始状态，未做任何改变
   * Unchanged
   */
  /**
   * 已新增，保存所有离线的新增
   * Added
   */
  /**
   * 已删除，对应数据库中的需要删除的记录
   * Deleted
   */
  /**
   * 已修改，对应数据库中需要修改的记录
   * Modified
   */
  changeFormSheetRowStatus(parentKey: any, key: any, options: any) {
    // 通过当前控件「parentKey」找到子表
    const sheetCtrl = this.findController(parentKey) as FormSheet;
    const value: any = sheetCtrl.value;
    value.forEach((item: any, index: number) => {
      if (index === options.rowIndex) {
        if (!item.id) {
          item.rowStatus = 'Added';
        } else if (item.rowStatus === 'Unchanged') {
          item.rowStatus = 'Unchanged';
        } else {
          item.rowStatus = 'Modified';
        }
      }
    });
    sheetCtrl.value = value;
  }

  // 传入的参数格式key_dataItemType_fromControlType
  formatKey(keyStr: string) {
    const isOldStyle: boolean = /\w+\_(\d+|null)\_(\d+|null)/.test(keyStr);
    if (isOldStyle) {
      const _lastIndex = keyStr.lastIndexOf('_');
      const _last2rdIndex = keyStr.lastIndexOf('_', _lastIndex - 1);
      const key = keyStr.substring(0, _last2rdIndex);
      const dataItemType = keyStr.substring(_last2rdIndex + 1, _lastIndex);
      const formControlType = keyStr.substr(_lastIndex + 1);
      return {
        key,
        dataItemType,
        formControlType,
      };
    } else {
      return {
        key: keyStr,
        dataItemType: -1,
        formControlType: -1,
      };
    }
  }

  formatValByType(val: any, targetType: number, targetControlType: number) {
    let retVal: any = val;
    if (Number(targetControlType) === -1) {
      switch (Number(targetType)) {
        case DataItemType.ShortText:
        case DataItemType.Radio:
        case DataItemType.Dropdown:
          if (typeof val === 'string' && val.length <= 200) {
            retVal = val;
          } else if (typeof val !== 'object') {
            retVal = val.toString();
          } else if (typeof val === 'object') {
            retVal = JSON.stringify(val) !== 'null' ? JSON.stringify(val) : '';
          } else {
            //Else Empty block statement
          }
          break;

        case DataItemType.LongText:
          if (typeof val === 'string') {
            retVal = val;
          }
          break;

        case DataItemType.Number:
          if (val === '') {
            retVal = null;
          }
          retVal = Number(val);
          break;

        case DataItemType.Logic:
          retVal = Boolean(val);
          break;

        case DataItemType.Date:
          if (val instanceof Date) {
            retVal = val;
          } else if (typeof val === 'string' && val) {
            try {
              const str = val
                .replace(/-/g, '/') // iOS兼容
                .replace(/T/g, ' '); //修复2019-09-17T06:21:07.000字符不能new Date的问题

              const date = new Date(str);
              if (date.getFullYear() > 0) {
                retVal = date;
              }
            } catch {}
          } else {
            //Else Empty block statement
          }
          break;
        case DataItemType.Time:
          if (typeof val === 'string' && val) {
            retVal = moment(val, 'HH:mm:ss');
          }
          break;
        case DataItemType.Checkbox:
        case DataItemType.DropdownMulti:
          if (typeof val === 'string') {
            retVal = val.split(';').filter((x) => !!x);
          } else if (typeof val === 'object' && val !== null) {
            retVal = [val];
          } else if (
            Array.isArray(val) &&
            val.some((x) => typeof x === 'string')
          ) {
            retVal = val;
          } else {
            //Else Empty block statement
          }
          break;

        case DataItemType.Address:
          if (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {}
          }
          if (typeof val === 'object') {
            retVal = val;
          }
          break;

        case DataItemType.Attachment:
        case DataItemType.StaffSingle:
        case DataItemType.StaffMulti:
        case DataItemType.DeptSingle:
        case DataItemType.DeptMulti:
        case DataItemType.StaffDeptMix:
        case DataItemType.Sheet:
          if (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {}
          }
          if (Array.isArray(val) && val.some((x) => typeof x === 'object')) {
            retVal = val;
          }
          break;

        case DataItemType.ApprovalOpinion:
          if (typeof val === 'string') {
            retVal = {
              content: val,
            };
          } else if (
            typeof val === 'object' &&
            typeof val.content === 'string'
          ) {
            retVal = val;
          } else {
            //Else Empty block statement
          }
          break;
        case DataItemType.RelevanceForm:
        case DataItemType.RelevanceFormEx:
        case DataItemType.Address:
          if (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {}
          }
          if (typeof val === 'object') {
            retVal = val;
          }
          break;
        default:
          break;
      }
    } else {
      switch (Number(targetControlType)) {
        case FormControlType.Text:
        case FormControlType.Radio:
        case FormControlType.Dropdown:
          if (typeof val === 'string' && val.length <= 200) {
            retVal = val;
          } else if (typeof val !== 'object') {
            retVal = val.toString();
          } else if (typeof val === 'object' && val !== null) {
            retVal = JSON.stringify(val);
          } else {
            //Else Empty block statement
          }
          break;

        case FormControlType.SequenceNo:
        case FormControlType.Textarea:
        case FormControlType.Description:
        case FormControlType.Title:
          if (typeof val === 'string') {
            retVal = val;
          }
          break;

        case FormControlType.Number:
          if (val === '') {
            retVal = null;
          }
          retVal = Number(val);
          break;
        case FormControlType.Logic:
          retVal = Boolean(val);
          break;
        case FormControlType.Date:
        case FormControlType.CreatedTime:
        case FormControlType.ModifiedTime:
          if (val instanceof Date) {
            retVal = val;
          } else if (typeof val === 'string' && val) {
            try {
              const str = val
                .replace(/-/g, '/') // iOS兼容
                .replace(/T/g, ' '); //修复2019-09-17T06:21:07.000字符不能new Date的问题

              const date = new Date(str);
              if (date.getFullYear() > 0) {
                retVal = date;
              }
            } catch {}
          } else {
            //Else Empty block statement
          }
          break;
        case FormControlType.Time:
          if (typeof val === 'string' && val) {
            retVal = moment(val, 'HH:mm:ss');
          }
          break;

        case FormControlType.Checkbox:
          if (typeof val === 'string') {
            retVal = val.split(';').filter((x) => !!x);
          } else if (typeof val === 'object') {
            retVal = [val];
          } else if (
            Array.isArray(val) &&
            val.some((x) => typeof x === 'string')
          ) {
            retVal = val;
          } else {
            //Else Empty block statement
          }
          break;

        case FormControlType.Location:
          if (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {}
          }
          if (typeof val === 'object') {
            retVal = val;
          }
          break;

        case FormControlType.Image:
        case FormControlType.Attachment:
        case FormControlType.Signature:
        case FormControlType.StaffSelector:
        case FormControlType.StaffMultiSelector:
        case FormControlType.DepartmentSelector:
        case FormControlType.DepartmentMultiSelector:
        case FormControlType.CreateBy:
        case FormControlType.ModifyBy:
        case FormControlType.OwnerId:
        case FormControlType.OwnerParentId:
        case FormControlType.CreateByParentId:
        case FormControlType.Sheet:
          if (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {}
          }
          if (Array.isArray(val) && val.some((x) => typeof x === 'object')) {
            retVal = val;
          }
          break;

        case FormControlType.ApprovalOpinion:
          if (typeof val === 'string') {
            retVal = {
              content: val,
            };
          } else if (
            typeof val === 'object' &&
            typeof val.content === 'string'
          ) {
            retVal = val;
          } else {
            //Else Empty block statement
          }
          break;

        case FormControlType.DateRange:
        case FormControlType.NumberRange:
        case FormControlType.TimeRange:
          if (Array.isArray(val)) {
            retVal = val;
          }
          break;

        case FormControlType.ReverseRelevance:
        case FormControlType.RelevanceForm:
        case FormControlType.RelevanceFormEx:
        case FormControlType.Address:
          if (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {}
          }
          if (typeof val === 'object') {
            retVal = val;
          }
          break;
        default:
          break;
      }
    }
    return retVal;
  }

  // 根据表单控件类型去格式化值
  formatVal(val: any, type: number, isDataLink: boolean = false) {
    let propertyValue: any = null;
    if (val) {
      switch (type) {
        case DataItemType.Number:
          propertyValue = Number(val);
          break;
        case DataItemType.ShortText:
        case DataItemType.LongText:
        case DataItemType.Radio:
        case DataItemType.Dropdown:
          propertyValue = String(val);
          break;
        case DataItemType.Logic:
          propertyValue = Boolean(val);
          break;
        case DataItemType.Date: // 日期
          propertyValue =
            val instanceof Date
              ? dateFormat.formatter(val, 'YYYY-MM-DD HH:mm:ss')
              : val;
          break;
        case DataItemType.Checkbox: // 复选框
        case DataItemType.DropdownMulti: // 下拉多选框
          propertyValue = val.join(';');
          break;
        case DataItemType.Address: // 地址
          if (val && Object.keys(val).length > 0) {
            propertyValue = JSON.stringify(val);
          } else {
            propertyValue = null;
          }
          break;
        case DataItemType.StaffSingle: // 人员单复选
        case DataItemType.StaffMulti:
        case DataItemType.DeptSingle:
        case DataItemType.DeptMulti:
        case DataItemType.StaffDeptMix:
          if (isDataLink) {
            const tmpVal = val.map((m: any) => {
              return {
                id: m.id,
                unitType: m.unitType,
                name: m.name,
              };
            });
            propertyValue = JSON.stringify(tmpVal);
          } else {
            propertyValue = val.map((x: any) => x.name).join(';');
          }
          break;
        case DataItemType.RelevanceForm:
          propertyValue = val.id;
          break;
        case DataItemType.RelevanceFormEx:
          propertyValue = val.map((x: any) => x.id).join(';');
          break;
        default:
          propertyValue = String(val);
          break;
      }
    } else {
      switch (type) {
        case DataItemType.Logic:
          return Boolean(val);
        case DataItemType.Number:
          //参数为空字符串时转换为0传递到后端计算
          if (val === 0) {
            return Number(val);
          } else {
            return '';
          }
        default:
          return '';
      }
    }
    return propertyValue;
  }

  formatOpByDataItemType(type: number, val: any) {
    switch (type) {
      // case DataItemType.Checkbox:
      case DataItemType.Address:
      case DataItemType.RelevanceForm:
      case DataItemType.RelevanceFormEx:
        return 'Like';
      // case DataItemType.StaffSingle:
      // case DataItemType.StaffMulti:
      // case DataItemType.DeptSingle:
      // case DataItemType.DeptMulti:
      // case DataItemType.StaffDeptMix:
      //   // 选人选组织控件 当没有值时 需要传Eq,有值需要传Like
      //   if (!val) {
      //     return 'Eq';
      //   } else {
      //     return 'Like';
      //   }
      default:
        return 'Eq';
    }
  }

  formatOpByFormControlType(type: number, val: any) {
    switch (type) {
      case 6:
      case 14:
      case 80:
      case 81:
        return 'Like';
      case 50:
      case 51:
      case 60:
      case 61:
        // 选人选组织控件 当没有值时 需要传Eq,有值需要传Like
        if (!val) {
          return 'Eq';
        } else {
          return 'Like';
        }
      default:
        return 'Eq';
    }
  }

  validate() {
    (this.ctrl as FormControl<any>).validate &&
      (this.ctrl as FormControl<any>).validate(false);
  }

  /**
   *
   * @param formControls 所有的control
   * @param exp
   */
  parseConditions(formControls: typings.RendererFormControl[], exp: string) {
    let segs: string[] = [];
    const results: any[] = [];

    if (exp.indexOf('||') > -1) {
      segs = exp.split(' || ');
    } else {
      if (exp.indexOf('&&') > -1) {
        segs = exp.split(' && ');
      } else {
        segs = [exp];
      }
    }

    for (const seg of segs) {
      const fields = seg.split(' ');
      const code = fields[2].substring(1, fields[2].length - 1);

      let ctrl: any;
      let control: typings.RendererFormControl | undefined;

      const idx = code.indexOf('.');
      if (idx > -1) {
        const parentCode = code.substring(0, idx);
        const childCode = code.substring(idx + 1);
        const sheet = formControls.find(
          (c) => c.key === parentCode,
        ) as any as typings.FormSheet;
        if (sheet) {
          control = sheet.columns.find((c) => c.key === childCode) as any;
        }

        const sheetCtrl = this.findController(parentCode) as FormSheet;

        if (
          sheetCtrl &&
          this.ctrl.options &&
          typeof this.ctrl.options.rowIndex === 'number'
        ) {
          const row = sheetCtrl.rows[this.ctrl.options.rowIndex];
          ctrl = row.findChild(childCode);
        }
      } else {
        ctrl = this.findController(code);
        control = formControls.find((c) => c.key === code);
      }

      if (!ctrl || !control) {
        continue;
      }

      const type = ControlHelper.mapToDataItemType(control.type);

      const operator = OperatorService.findByLabel(type, fields[1]);

      if (!operator) {
        continue;
      }

      results.push({
        code: fields[0],
        control,
        controller: ctrl,
        propertyType: type,
        operatorType: operator.value,
        // value: val
      });
    }

    return results;
  }

  countLengthOf(s: string) {
    if (!s) {
      return 0;
    }
    return s.length;
  }

  subscribePropertyChange(fn: (change: ControlPropertyChange) => void) {
    const ctrl = this.findController(this.id);
    if (!ctrl) {
      return;
    }

    if (this.propChangeSubscription) {
      //通过subscription.add()增加子subscription
      this.propChangeSubscription.add(ctrl.propertyChange.subscribe(fn));
    } else {
      this.propChangeSubscription = ctrl.propertyChange.subscribe(fn);
    }
  }

  unsubscribeValueChange() {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
  }

  unsubscribe() {
    if (this.propChangeSubscription) {
      this.propChangeSubscription.unsubscribe();
    }
  }

  /**
   * 取消control中注册的订阅事件
   * @param control
   */
  unRefSubscription(control: RendererFormControl) {
    if (control && control.refSubscription && control.refSubscription.length) {
      control.refSubscription.forEach((subscription) => {
        subscription.unsubscribe();
      });
    }
  }

  /**
   * 清理control中订阅事件延时器
   * @param control
   */
  unRefSubscriptionTimer(control: RendererFormControl) {
    if (
      control &&
      control.refSubscriptionTimer &&
      control.refSubscriptionTimer.length
    ) {
      control.refSubscriptionTimer.forEach((timer) => {
        clearTimeout(timer);
      });
    }
  }

  destroyed() {
    this.unsubscribe();
    this.unsubscribeValueChange();
    this.unRefSubscription(this.control);
    this.unRefSubscriptionTimer(this.control);
  }
}

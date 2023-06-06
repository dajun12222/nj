/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { ControlAttributeType } from '@/components/apps/form-design/form-property/typings/form-attribute';
// 属性显隐联动的映射
// x => y
// x: 源数据属性
// y： 当源数据属性为true或'true'时显示
const noShowMap: any = {
  formTrack: 'trackDataCodes',
  pdfAble: 'print',
};

//判断是否有属性显隐联动生效
const hasNoShow = (attr, self) => {
  return Object.entries(noShowMap).some((item) => {
    if (typeof item[1] === 'string') {
      const logicItem = self.controlAttribute.find(
        (el) => el.field === item[0],
      );
      if (!logicItem) {
        return false;
      }
      const isTrueValue =
        logicItem && logicItem.options && logicItem.options.valueMap
          ? logicItem.value === logicItem.options.valueMap['true']
          : logicItem.value;
      return attr.field === item[1] && !isTrueValue;
    }
  });
};

/**
 * 选人控件 根节点属性由于选择组织架构类型和不选择时值一样
 * 需要特殊处理
 * @param attr
 * @param self
 * @returns 判断orgRootValueType为空时，是否选择组织架构
 */
const selectUserOrDept = (attr, self) => {
  return attr.field === 'orgRootValueType' && !self.orgRootNoLength;
};

export const getAttrValClass = (attr: any, self: any) => {
  let resultCls = '';
  if (attr.type === ControlAttributeType.Boolean || attr.type === 'boolean') {
    resultCls += 'logic-row ';
  }
  if (attr.field === 'templateFile') {
    resultCls += 'upload-row ';
  }
  if (attr.type === ControlAttributeType.Checkbox || attr.type === 'checkbox') {
    resultCls += 'checkbox-row ';
    if (attr.field === 'syncFormate') {
      resultCls += 'sync ';
    }
  }
  if (
    (attr.options && attr.options.inputMethod === ControlAttributeType.Modal) ||
    attr.type === 3
  ) {
    resultCls += 'modal-row ';
    if (
      (attr.value === '' || attr.value === undefined) &&
      !selectUserOrDept(attr, self) &&
      ![
        'trackDataCodes',
        'templateFile',
        'defaultValue',
        'defaultValueType',
        'dictionaryData',
      ].includes(attr.field)
    ) {
      resultCls += 'no-body ';
    }
    if (
      [
        'trackDataCodes',
        'templateFile',
        'number',
        'defaultValue',
        'defaultValueType',
        'print',
        'dictionaryData',
        'heads',
      ].includes(attr.field)
    ) {
      resultCls += 'special-modal ';
    }
  }
  if (
    [
      'trackDataCodes',
      'print',
      'dataItemName',
      'displayField',
      'templateFile',
    ].includes(attr.field)
  ) {
    resultCls += 'no-title ';
  }

  if (
    hasNoShow(attr, self) ||
    (attr.field === 'span' && self.control.parentKey)
  ) {
    resultCls += 'no-show ';
  }

  if (
    attr.field === 'requiredFormula' &&
    self.attrKey === 'controlAttributeColumns'
  ) {
    resultCls += 'air ';
  }

  if (attr.field === 'mobileDisplayMode') {
    resultCls += 'small-radio-group';
  }

  // 不需要限制高度的row
  if (
    ['print', 'heads', 'fileTypes', 'templateFile', 'number'].includes(
      attr.field,
    ) ||
    (attr.field === 'defaultValue' &&
      attr.options &&
      attr.options.inputMethod === 3)
  ) {
    resultCls += 'no-height-limit';
  }

  // 该行属性为上一行属性的附带属性，标题置灰
  if (
    ['watermarkFontSize', 'imageQuality', 'range', 'emptyValue'].includes(
      attr.field,
    )
  ) {
    resultCls += 'second-title';
  }

  if (attr.options && attr.options.custom) {
    resultCls = resultCls.replace('no-height-limit', '');
    resultCls = resultCls.replace('special-modal', '');
    resultCls = resultCls.replace('no-body', '');
    resultCls += 'no-height-limit special-modal';
  }

  if (attr.options && attr.options.disabled) {
    resultCls += 'disabled';
  }

  return resultCls;
};

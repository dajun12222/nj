/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/*
 * @Author: Fan name
 * @Date: 2020-03-23 20:19:14
 * @LastEditTime: 2020-03-23 20:33:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /frontend/entries/admin/src/components/apps/form-design/form-detail-service.ts
 */
import { FormControlType, DataItem } from './typings';
interface DataItemState extends DataItem {
  used: boolean;
  relativePropertyCode?: string | null | undefined;
}
/**
 * @Author: Fan
 * @Description: 同步表单设计关联表单数据和数据模型的 显示字段
 * @URL:
 * @param {type}
 * @return:
 * @Date: 2020-03-23 20:29:24
 */
export function SynRelevanceFormDisplayField(
  control: any,
  dataItem: DataItemState[],
) {
  const ctrlData = dataItem.find((d: any) => d.code === control.key);
  if (ctrlData) {
    control.options.relativePropertyCode = control.options.displayField =
      ctrlData.relativePropertyCode || control.options.displayField || 'name';
    if (ctrlData.relativeCode !== control.options.schemaCode) {
      control.options.schemaCode = ctrlData.relativeCode;
      control.options.queryCode = '';
    }
  }
}

/**
 * @Author: Fan
 * @Description: 同步子表中 关联表单的显示字段
 * @URL:
 * @param {type}
 * @return:
 * @Date: 2020-03-23 20:33:00
 */
export function SynSheetRelevanceFormDisplayField(
  control: any,
  dataItem: DataItemState[],
) {
  const ctrlData = dataItem.find((d: any) => d.code === control.key);
  if (ctrlData) {
    const cols = control.columns;
    const pros = ctrlData.properties || [];
    for (const col of cols) {
      if (
        col.type === FormControlType.RelevanceForm ||
        col.type === FormControlType.RelevanceFormEx
      ) {
        const pro = pros.find((d: any) => d.code === col.key);
        if (pro) {
          col.options.relativePropertyCode = col.options.displayField =
            pro.relativePropertyCode || col.options.displayField || 'name';
          if (pro.relativeCode !== col.options.schemaCode) {
            col.options.schemaCode = pro.relativeCode;
            col.options.queryCode = '';
          }
        }
      }
    }
  }
}

/**
 * @Author: Fan
 * @Description: 同步tabs中 关联表单的显示字段
 * @URL:
 * @param {control, dataItem}
 * @return:
 * @Date: 2020-03-23 20:33:00
 */
export function SynTabRelevanceFormDisplayField(
  control: any,
  dataItem: DataItemState[],
) {
  const loopArray = [control];
  while (loopArray.length) {
    const _tempTabsCtrl = loopArray.shift();
    for (const val of _tempTabsCtrl.panels) {
      for (const _pcKey of Object.keys(val.controls)) {
        const _ctrl = val.controls[_pcKey];
        if (
          _ctrl.type === FormControlType.RelevanceForm ||
          _ctrl.type === FormControlType.RelevanceFormEx
        ) {
          SynRelevanceFormDisplayField(_ctrl, dataItem);
        } else if (_ctrl.type === FormControlType.Sheet) {
          // 兼容性代码start：导入修改过编码的tab页子表：如果新名称和就名称不统一，使用sheet 里面的key
          const oldKey = _ctrl.path[_ctrl.path.length - 1];
          if (oldKey !== _ctrl.key) {
            val.layout.forEach((row) => {
              const index = row.indexOf(oldKey);
              console.log(index);
              if (index !== -1) {
                row[index] = _ctrl.key;
              }
            });

            if (val.controls[oldKey]) {
              val.controls[_ctrl.key] = JSON.parse(
                JSON.stringify(val.controls[oldKey]),
              );
            }
            delete val.controls[oldKey];
          }
          // 兼容性代码end

          SynSheetRelevanceFormDisplayField(_ctrl, dataItem);
        } else if (_ctrl.type === FormControlType.Tabs) {
          loopArray.push(_ctrl);
        } else {
          //Else Empty block statement
        }
      }
    }
  }
}

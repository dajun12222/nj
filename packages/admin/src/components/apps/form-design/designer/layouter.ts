/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { FormControl } from '../typings';

export interface Layouter {
  /**
   * 显示空列
   * @param rowIndex 行索引
   * @param colIndex 列索引
   * @param newline 是否换行
   */
  showEmptyCol(rowIndex: number, colIndex: number, newline: boolean): void;

  /**
   * 隐藏空列
   */
  hideEmptyCol(): void;

  /**
   * 延时隐藏空列
   */
  setHideEmptyTask(): void;

  /**
   * 清除延时隐藏空列
   */
  clearHideEmptyTask(): void;

  /**
   * 延时显示空列
   * @param rowIndex 行索引
   * @param colIndex 列索引
   * @param newline 是否换行
   */
  setShowEmptyTask(
    rowIndex: number,
    colIndex: number,
    newline: boolean,
    isClickAdd?: boolean,
  ): void;

  /**
   * 替换空列
   * @param control 新的控件
   */
  replaceEmpty(control: FormControl): boolean;
}

export enum FormFrameworkType {
  OneRowOneColumn = 1,
  OneRowTwoColumn,
  OneRowThreeColumn,
  OneRowFourColumn,
  Unstable,
}

import { FormAction } from './form-action';

import { RendererFormControl } from '../schema';

export interface FormActionModalOptions {
  title: string;

  code: FormAction;

  data?: any;

  approval?: RendererFormControl;

  trusts?: any;

  workflowName?: string;

  createrName?: string;

  showNextNode?: boolean;

  deptId?: string;
}

export interface FormActionData {
  [key: string]: any;
}

export interface FormActionModal {
  show(options: FormActionModalOptions): void;

  close(): void;
}

export interface FormActionComponent {
  submit(): FormActionData | undefined;
}

/**
 * 表单操作按钮
 */
export interface FormActionButton {
  code: FormAction;

  text: string;

  /**
   * 禁用的
   */
  disabled: boolean;

  /**
   * 可见的
   */
  visible: boolean;

  loading?: boolean;

  /**
   * 是否为自定义按钮
   */
  custom?: boolean;

  /**
   * 自定义按钮提示
   */
  hint?: any;

  /**
   * 是否提交并新增
   */
  isSubmitAndCreate?: boolean;
}

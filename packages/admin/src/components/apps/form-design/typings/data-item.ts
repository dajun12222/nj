/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { schema } from 'cloudpivot/form';

type DataItemType = schema.DataItemType;

export interface DataItem {
  id?: string;

  code: string;

  name: string;

  name_i18n?: string;

  type: DataItemType;

  isSystem: boolean;

  published: boolean;

  properties?: DataItem[];

  parentCode?: string;

  defaultValue?: any;

  formPropertyType?: any;

  propertyIndex?: boolean;

  propertyEmpty?: boolean;

  schemaCode?: string;

  relativeCode?: string;

  relativeName?: string;

  appFunctionCode?: string;

  appPackageCode?: string;

  displayField?: string;

  relativePropertyCode?: string | null | undefined;

  noRepeat?: boolean;
}

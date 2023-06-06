/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { renderer } from 'cloudpivot/form';

import * as flow from 'cloudpivot/flow';

import list from 'cloudpivot/list/mobile';

import { DefaultRelevanceFormService } from './relevance-form-service';
import { DefaultReverseRelevanceService } from './reverse-relevance-service';
import { DefaultFileService } from './file-service';
import { DingTalkLocationService } from './dingtalk-location-service';
import { DefaultUserService } from './user-service';

import { FormLocationControl } from 'cloudpivot/form/src/common/controls/form-location-control';

renderer.RelevanceFormControl.service = new DefaultRelevanceFormService();

renderer.ReverseRelevanceControl.service = new DefaultReverseRelevanceService();

renderer.UploadControl.service = new DefaultFileService();

renderer.FormLocationControl.service = new DingTalkLocationService();
FormLocationControl.service = new DingTalkLocationService();

renderer.StaffSelectorControl.service = new DefaultUserService();

renderer.RelevanceFormControl.loadFormStatus = () => {
  return flow.components.shared.WorkflowStatus;
};

renderer.RelevanceFormControl.loadQueryForm = () => {
  return list.components.SearchContent;
};

renderer.RelevanceFormControl.loadFormItem = () => {
  return list.components.newFormItem;
};

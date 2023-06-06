/*
 * @Author: Fu Zhuohang
 * @Date: 2022-03-07 14:03:48
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-07 14:29:20
 * @FilePath: \yunshu6.0\modules\cloudpivot\common\src\config\mobile\h3-form\index.ts
 * @Description:
 */
import { renderer } from '../../../../../form';

import * as flow from '../../../../../flow';

import list from '../../../../../list/mobile';

import { DefaultRelevanceFormService } from './relevance-form-service';
import { DefaultReverseRelevanceService } from './reverse-relevance-service';
import { DefaultFileService } from './file-service';
import { DingTalkLocationService } from './dingtalk-location-service';
import { DefaultUserService } from './user-service';

import { FormLocationControl } from '../../../../../form/src/common/controls/form-location-control';

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

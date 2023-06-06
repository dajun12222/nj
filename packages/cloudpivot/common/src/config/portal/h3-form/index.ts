/*
 * @Author: your name
 * @Date: 2020-03-28 10:26:28
 * @LastEditTime: 2022-03-07 15:15:59
 * @LastEditors: Fu Zhuohang
 * @Description: In User Settings Edit
 * @FilePath: \yunshu6.0\modules\cloudpivot\common\src\config\portal\h3-form\index.ts
 */

import { renderer } from '../../../../../form';

import list from '../../../../../list/pc';

import { DefaultRelevanceFormService } from './relevance-form-service';
import { DefaultReverseRelevanceService } from './reverse-relevance-service';
import { DefaultFileService } from './file-service';
import { DefaultUserService } from './user-service';
import { DefaultLocationService } from './location-service';

let inited = false;

if (!inited === true) {
  inited = true;

  renderer.RelevanceFormControl.loadListSelector = () => {
    return list.components.ListSelector;
  };

  renderer.RelevanceFormControl.service = new DefaultRelevanceFormService();

  renderer.ReverseRelevanceControl.service =
    new DefaultReverseRelevanceService();

  renderer.UploadControl.service = new DefaultFileService();

  renderer.StaffSelectorControl.service = new DefaultUserService();

  renderer.FormLocationControl.service = new DefaultLocationService();
}

/*
 * @Author: Fan
 * @Date: 2020-04-13 15:11:57
 * @LastEditTime: 2020-04-22 18:27:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /frontend/modules/cloudpivot/form/src/components/Checkbox/index.ts
 */
import { DataItemType, FormControlType } from '../../../schema';
import { ComponentAsset, ComponentInfo } from '../../../typings';
import design from './components/design.vue';
import mobile from './components/mobile-checkbox-group.vue';
import pc from './components/pc-checkbox-group.vue';
import conduct from './conduct';
import schema from './schema';
export const info: ComponentInfo = {
  title: '复选框',
  type: 'check-square',
  icon: 'h-icon-all-check-square-o',
  dataItemType: DataItemType.Checkbox,
  formControllerType: FormControlType.Checkbox,
  group: '基础控件',
};
export default {
  info,
  schema,
  conduct,
  components: {
    design,
    pc,
    mobile,
  },
} as ComponentAsset;

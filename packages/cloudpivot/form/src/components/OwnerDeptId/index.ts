/*
 * @Author: your name
 * @Date: 2020-04-22 11:08:54
 * @LastEditTime: 2020-04-22 17:04:45
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\cloudpivot\form\src\components\CreatedDeptId\index.ts
 */
import { ComponentInfo, ComponentAsset } from '../../../typings';
import { DataItemType, FormControlType } from '../../../schema';
import schema from './schema';
import conduct from './conduct';
import design from './components/design.vue';
import pc from '../../common/components/system-control/pc/index.vue';
import mobile from '../../common/components/system-control/mobile/index.vue';
const info: ComponentInfo = {
  title: '拥有者部门',
  type: 'ownerDeptId',
  icon: 'h-icon-all-owner-department',
  dataItemType: DataItemType.DeptSingle,
  formControllerType: FormControlType.OwnerParentId,
  group: '系统控件',
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

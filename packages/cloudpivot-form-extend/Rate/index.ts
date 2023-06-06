import { ComponentInfo, ComponentAsset } from 'cloudpivot/form/typings';
import { DataItemType, FormControlType } from 'cloudpivot/form/schema';
import schema from './schema';
import conduct from './conduct';
import design from './components/design.vue';
import pc from './components/pc.vue';
const info: ComponentInfo = {
  title: '评分',
  type: 'rate',
  icon: '',
  dataItemType: DataItemType.Number,
  formControllerType: 20,
  group: '基础控件',
};

export default {
  info,
  schema,
  conduct,
  components: {
    design,
    pc,
    // mobile,
  },
} as ComponentAsset;

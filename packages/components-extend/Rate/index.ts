/*
 * @Author: Fan
 * @Date: 2020-04-26 12:12:21
 * @description:
 * @LastEditors: Fan
 */
/*
 * @Author: your name
 * @Date: 2020-04-13 15:10:17
 * @LastEditTime: 2020-04-26 19:36:13
 * @LastEditors: Fan
 * @Description: In User Settings Edit
 * @FilePath: /frontend/modules/cloudpivot/form/src/components/Date/index.ts
 */
import { ComponentInfo, ComponentAsset } from "../../typings";
import { DataItemType, FormControlType } from "../../schema";
import schema from "./schema";
import conduct from "./conduct";
import design from "./components/design.vue";
import pc from "./components/pc.vue";
const info: ComponentInfo = {
  title: "评分",
  type: "rate",
  icon: "",
  dataItemType: DataItemType.Number,
  formControllerType: 20,
  group: "基础控件",
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

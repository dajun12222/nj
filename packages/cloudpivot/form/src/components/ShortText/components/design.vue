<!--
 * @Author: Fan
 * @Date: 2020-04-14 12:06:28
 * @LastEditTime: 2020-04-26 14:06:44
 * @LastEditors: Fan
 * @Description: In User Settings Edit
 * @FilePath: /frontend/modules/cloudpivot/form/src/components/ShortText/components/design.vue
 -->
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Input } from '@h3/antd-vue';
@Component({
  name: 'ShortTextDesign',
  components: {
    AInput: Input,
  },
})
export default class ShortTextDesign extends Vue {
  @Prop({ default: () => {} })
  control!: any;

  render(h: Function) {
    return h('a-input', {
      props: {
        disabled: true,
        placeholder:
          this.control.options && this.control.options.placeholder
            ? this.control.options.placeholder
            : '请输入',
        value:
          this.control.options && this.control.options.defaultValue
            ? this.control.options.defaultValue
            : '',
      },
    });
  }
}
</script>

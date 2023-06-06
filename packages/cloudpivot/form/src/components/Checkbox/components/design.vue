<!--
 * @Author: Fan
 * @Date: 2020-04-16 20:44:23
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Checkbox as _Checkbox } from '@h3/antd-vue';
@Component({
  name: 'Checkbox',
  components: {
    ACheckbox: _Checkbox,
    ACheckboxGroup: _Checkbox.Group,
  },
})
export default class Checkbox extends Vue {
  @Prop()
  control!: any; // 当前控件的控制器

  render(h: Function) {
    return h('a-checkbox-group', {
      props: {
        disabled: true,
        options: this.control.options.options
          ? this.control.options.options.split(';')
          : [],
      },
    });
  }
}
</script>

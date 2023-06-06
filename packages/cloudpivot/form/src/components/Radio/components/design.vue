<!--
 * @Author: Fan
 * @Date: 2020-04-16 17:53:56
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Radio as _Radio } from '@h3/antd-vue';
@Component({
  name: 'Radio',
  components: {
    ARadioGroup: _Radio.Group,
  },
})
export default class Radio extends Vue {
  @Prop()
  control!: any; // 当前控件的控制器

  render(h: Function) {
    return h('a-radio-group', {
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

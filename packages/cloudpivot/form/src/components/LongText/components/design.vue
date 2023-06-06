<!--
 * @Author: Fan
 * @Date: 2020-04-18 21:56:55
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Input } from '@h3/antd-vue';
@Component({
  name: 'LongTextDesign',
  components: {
    ATextarea: Input.TextArea,
  },
})
export default class LongTextDesign extends Vue {
  @Prop({ default: () => {} })
  control!: any;

  render(h: Function) {
    return h('a-textarea', {
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

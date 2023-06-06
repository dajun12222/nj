<!--
 * @Author: Fan
 * @Date: 2020-04-19 19:33:49
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { DatePicker } from '@h3/antd-vue';
import { utils } from '../../../../../common';
const DateHandle = utils.DateHandle;
@Component({
  name: 'Calendar',
  components: {
    ADatePicker: DatePicker,
  },
})
export default class Calendar extends Vue {
  @Prop({ default: () => {} })
  control!: any;

  render(h: Function) {
    return h('a-date-picker', {
      props: {
        disabled: true,
        placeholder:
          this.control.options &&
          this.control.options.defaultValue &&
          this.control.options.defaultValue === 'current'
            ? this.formatCurDate(
                this.control.options.syncFormate
                  ? this.control.options.format
                  : this.control.options.format1,
              )
            : this.control.options.placeholder
            ? this.control.options.placeholder
            : '请输入',
      },
      class: {
        isDefaultValue:
          this.control.options.defaultValue &&
          this.control.options.defaultValue === 'current',
      },
    });
  }

  formatCurDate(format) {
    switch (format) {
      case 'YYYY':
      case 'YYYY-MM':
      case 'YYYY-MM-DD':
      case 'YYYY-MM-DD HH:mm':
      case 'YYYY-MM-DD HH:mm:ss':
        return DateHandle.dateFormat(new Date(), format);
      case 'YYYY-MM-DD CN-APM':
      case 'YYYY-MM-DD CN-APM HH:mm':
      case 'YYYY-MM-DD EN-APM':
      case 'YYYY-MM-DD EN-APM HH:mm':
        return DateHandle.dateFormatApm(new Date(), format);
      default:
        break;
    }
  }
}
</script>

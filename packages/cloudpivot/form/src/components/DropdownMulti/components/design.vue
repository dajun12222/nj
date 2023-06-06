<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Input } from '@h3/antd-vue';
@Component({
  name: 'Dropdown',
  components: {
    AInput: Input,
  },
})
export default class Dropdown extends Vue {
  @Prop()
  control!: any; // 当前控件的控制器

  render(h: Function) {
    return h(
      'a-input',
      {
        props: {
          disabled: true,
          placeholder:
            this.control.options && this.control.options.emptyValue
              ? this.control.options.emptyValue
              : '请选择',
        },
      },
      [
        h('i', {
          props: {
            type: 'user',
          },
          slot: 'suffix',
          class: ['aufontAll', 'h-icon-all-down-o'],
        }),
      ],
    );
  }
}
</script>

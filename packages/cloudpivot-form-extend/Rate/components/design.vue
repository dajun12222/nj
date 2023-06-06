<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator';
import { Rate } from '@h3/antd-vue';

@Component({
  name: 'CTitle',
  components: {
    ARate: Rate,
  },
})
export default class CTitle extends Vue {
  @Prop({ default: {} })
  control!: any;

  render(h: Function) {
    return h('a-rate', {
      props: {
        disabled: true,
        count: this.control.options.count,
      },
    });
  }
}
</script>

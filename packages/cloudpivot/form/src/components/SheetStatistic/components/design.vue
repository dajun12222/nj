<script lang="ts">
import HLabel from '../../../../../form/src/common/components/label.vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'SheetStatistic',
  components: {
    HLabel: HLabel,
  },
})
export default class SheetStatistic extends Vue {
  @Prop()
  control!: any; // 当前控件的控制器

  render(h: Function) {
    return h('h-label', {
      props: { control: this.control },
      style: { justifyContent: 'center' },
    });
  }
}
</script>

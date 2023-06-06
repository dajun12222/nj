<script lang="ts">
import HLabel from '../../../../../form/src/common/components/label.vue';
import { labelText } from '../../../../../form/src/schema/system-data-item-codes';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'Modifier',
  components: {
    HLabel: HLabel,
  },
})
export default class Modifier extends Vue {
  @Prop()
  control!: any; // 当前控件的控制器

  render(h: Function) {
    return h('h-label', { props: { text: labelText } });
  }
}
</script>

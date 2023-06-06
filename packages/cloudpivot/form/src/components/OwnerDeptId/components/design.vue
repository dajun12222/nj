<script lang="ts">
import HLabel from '../../../common/components/label.vue';
import { labelText } from '../../../schema/system-data-item-codes';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'OwnerDeptId',
  components: {
    HLabel: HLabel,
  },
})
export default class OwnerDeptId extends Vue {
  @Prop()
  control!: any; // 当前控件的控制器

  render(h: Function) {
    return h('h-label', { props: { text: labelText } });
  }
}
</script>

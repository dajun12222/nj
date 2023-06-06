<script lang="ts">
import CreateStaffSelector from '../../../../../form/src/common/components/createStaffSelector.vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'OwnerId',
  components: {
    CreateStaffSelector,
  },
})
export default class OwnerId extends Vue {
  @Prop()
  control!: any; // 当前控件的控制器

  render(h: Function) {
    return h('create-staff-selector', { props: { opts: { disabled: true } } });
  }
}
</script>

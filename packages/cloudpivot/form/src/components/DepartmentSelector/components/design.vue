<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CreateStaffSelector from '../../../../../form/src/common/components/createStaffSelector.vue';

@Component({
  name: 'DepartmentSelectorDesign',
  components: {
    CreateStaffSelector,
  },
})
export default class DepartmentSelectorDesign extends Vue {
  @Prop()
  control!: any; // 当前控件的控制器

  render(h: Function) {
    return h('create-staff-selector', { props: { opts: { disabled: true } } });
  }
}
</script>

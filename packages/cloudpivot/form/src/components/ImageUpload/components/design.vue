<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import HImage from '../../../../../form/src/common/components/image.vue';
@Component({ name: 'ImageDesign', components: { HImage } })
export default class ImageDesign extends Vue {
  @Prop()
  control!: any; // 当前控件的控制器

  render(h: Function) {
    return h('h-image', {
      props: {
        disabled: true,
        text: '点击或拖拽上传',
      },
    });
  }
}
</script>

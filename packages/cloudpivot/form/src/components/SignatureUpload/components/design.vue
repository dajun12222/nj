<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Input } from '@h3/antd-vue';
@Component({
  name: 'SignatureDesign',
  components: {
    ATextarea: Input.TextArea,
  },
})
export default class SignatureDesign extends Vue {
  // @Prop({default:{}})
  // opts!:any
  render(h: Function) {
    return h('a-textarea', {
      props: {
        disabled: true,
        placeholder: '请输入',
      },
    });
  }
}
</script>

<!--
 * @Author: Fan
 * @Date: 2020-04-19 19:33:49
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Switch } from '@h3/antd-vue';
@Component({
  name: 'Logic',
  components: {
    ASwitch: Switch,
  },
})
export default class Logic extends Vue {
  // @Prop({default:{}})
  // opts!:any
  render(h: Function) {
    return h('a-switch', {
      props: {
        disabled: true,
      },
    });
  }
}
</script>

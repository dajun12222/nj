<template>
  <div class="form-comment-box">
    <mb-comment ref="mbComment" :formObj="formObj" />
  </div>
</template>

<script lang="ts">
import common from '../../../../../../common';
import commentComps from '../../../../../../form-comment';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'form-comment',
  components: {
    mbComment: commentComps.mbComment,
  },
  directives: {
    ControlBack: common.directives.controlBack,
  },
})
export default class FormActions extends Vue {
  @Prop() formObj!: any;
}

// reload(){
//   this.isShow = false;
//   setTimeout(() => {
//     this.isShow = true;
//   }, 300);
// }
</script>

<style lang="less" scoped>
@import '../../../../../../common/styles/mixins.less';

.form-actions {
  display: flex;
  justify-content: space-around;
  color: @primary-color;
  background-color: #fff;
  .px2rem(font-size, @font-size-base);
  height: 44px;
  // .px2rem(padding-top, @font-size-xxs);
  // .px2rem(padding-bottom, @font-size-xxs);
}
.form-comment-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  background: white;
}
</style>

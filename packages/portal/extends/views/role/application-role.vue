<template>
 <div class="role">
  <iframe id="roleFrame" class="role-frame" :src="pdfSrc"></iframe>
 </div>
</template>
<script lang="ts">

import {
  Component, Vue
} from 'vue-property-decorator';


@Component({
  name: 'application-role',
  components: {
   
  }
})
export default class ApplicationDefine extends Vue {
  get pdfSrc(){

    return '/admin/#/web/organization/orgrole'
  }
 

}
</script>
<style lang="less" scoped>
.role {
  width: 100%;
  height: 100%;
  .role-frame {
    width: 100%;
    height: 100%;
    border: 0;
  }
}

</style>

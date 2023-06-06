<template>
<div id="waterMarker" class="waterMarker"></div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import moment from "moment";
@Component({
  name: 'waterMarker',
  components: {
    
  }
})

export default class WaterMarker extends Vue {
    //:class="$style.waterMarker"
    addWaterMarker(str) {
      let can = (document.createElement('canvas')) as any;
      let body = (document.getElementById('waterMarker')) as any;
      body.appendChild(can);
      can.width=300;
      can.height=300;
      can.style.display='none';
      let cans = can.getContext('2d');
      cans.rotate(-45*Math.PI/180);
      cans.font = "26px Microsoft JhengHei";
      cans.fillStyle = "rgba(111, 111, 111, 0.18)";
      cans.textAlign = 'right';
      cans.textBaseline = 'Middle';
      cans.fillText(str,can.width/2,can.height/1.3);
      body.style.backgroundImage="url("+can.toDataURL("image/png")+")";
    }
    
    mounted(){
        let userStr = window.sessionStorage.getItem("user");
        let str = '';
        if(userStr && JSON.parse(userStr)){
            let user = JSON.parse(userStr)
            str = user['name'] + '-' + user['username'] + '-' + moment(new Date()).add('year',0).format("YYYY/MM/DD");
        }
        
       this.addWaterMarker(str);
    }
}
</script>


<style lang="less" scoped>
.waterMarker {
    width: 100%;
    height: 100%;   
}

</style>

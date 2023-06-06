<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="infos">
    <div class="info-item" @click="goto('my-unfinished-workitem')">
      <div class="right">
        <img :src="getImg(1)" alt="" />
        <!-- <span class="icon aufontAll h-icon-all-arrow-right-o"></span> -->
      </div>
      <div class="left">
        <p>
          {{ $t('languages.common.workBenchInfo.ToDoTask') }}
          <span class="icon aufontAll h-icon-all-arrow-right-o"></span>
        </p>
        <h3>{{ infoData.workItemCount }}</h3>
      </div>
    </div>

    <div class="info-item" @click="goto('my-unread-workitem')">
      <div class="right">
        <img :src="getImg(2)" alt="" />
        <!-- <span class="icon aufontAll h-icon-all-arrow-right-o"></span> -->
      </div>
      <div class="left">
        <p>
          {{ $t('languages.common.workBenchInfo.ToReadTask') }}
          <span class="icon aufontAll h-icon-all-arrow-right-o"></span>
        </p>
        <h3>{{ infoData.circulateItemCount }}</h3>
      </div>
    </div>

    <div class="info-item" @click="goto('my-workflow')">
      <div class="right">
        <img :src="getImg(3)" alt="" />
        <!-- <span class="icon aufontAll h-icon-all-arrow-right-o"></span> -->
      </div>
      <div class="left">
        <p>
          {{ $t('languages.common.workBenchInfo.MyInitiated') }}
          <span class="icon aufontAll h-icon-all-arrow-right-o"></span>
        </p>
        <h3>{{ infoData.workflowCount }}</h3>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'infos',
  components: {},
})
export default class infos extends Vue {
  @Prop({
    default: () => {
      return {};
    },
  })
  infoData!: any;

  goto(type: string) {
    this.$router.push('/workflow-center/' + type);
  }

  get themeColor() {
    return this.$store.state.themeColor || 'blue';
  }

  getImg(number) {
    const themeColor = this.themeColor;
    return require(`./images/${themeColor}${number}.svg`) || '';
  }
}
</script>

<style lang="less" scoped>
.infos {
  display: flex;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  .info-item {
    min-width: 198px;
    flex: 1;
    height: 92px;
    border-radius: 4px;
    border: 1px solid #eeeeee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    &:nth-child(2) {
      margin: 0 16px;
    }
    .left {
      margin-right: 20px;
    }
    p {
      // margin: 18px 0 0 20px;
      font-size: 12px;
      line-height: 20px;
      padding-top: 4px;
      display: flex;
      align-items: center;
      margin-bottom: 0;
      span {
        font-size: 14px;
        display: inline-block;
        width: 0;
        overflow: hidden;
        margin-left: 2px;
      }
    }
    h3 {
      font-size: 28px;
      line-height: 36px;
      color: #111218;
      margin-bottom: 0;
    }

    &:hover {
      .left {
        p {
          span {
            width: 14px;
            transition: all ease 0.5s;
          }
        }
      }
    }

    .right {
      height: 42px;
      width: 42px;
      // overflow: hidden;
      transition: all ease 0.3s;
      margin-left: 30px;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: #f9f9f9;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      img {
        position: relative;
        z-index: 2;
        width: 42px;
        height: 42px;
      }
      margin-right: 20px;
      span {
        margin-left: 20px;
        display: inline-block;
      }
    }
    // &:hover{
    //   .right{
    //     width: 74px;
    //     display: flex;
    //   }
    // }
  }
}
</style>

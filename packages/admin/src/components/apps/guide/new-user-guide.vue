<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div v-if="value" class="new-user-guide-box">
    <div class="new-user-guide">
      <a-carousel
        arrows
        dotsClass="slick-dots slick-thumb"
        :speed="300"
        :infinite="false"
        :afterChange="change"
      >
        <div
          slot="prevArrow"
          class="custom-slick-arrow"
          :style="isPrevDisabled ? 'pointer-events: none' : ''"
        >
          <img
            v-if="isPrevDisabled"
            class="disabled"
            src="@/assets/images/arrow-disabled.png"
          />
          <img v-else src="@/assets/images/arrow.png" alt="" />
        </div>

        <div class="guide-img">
          <img src="@/assets/images/guide1.png" alt="" />
        </div>
        <div class="guide-img">
          <img src="@/assets/images/guide2.png" alt="" />
        </div>
        <div class="guide-img">
          <img src="@/assets/images/guide3.png" alt="" />
        </div>
        <div class="guide-img">
          <img src="@/assets/images/guide4.png" alt="" />
        </div>
        <div class="guide-img">
          <img src="@/assets/images/guide5.png" alt="" />
        </div>

        <!-- <div
          class="guide-img"
          v-for="(img, index) in imgList"
          :key="index"
        >
          <img :src="img" alt="">
        </div> -->

        <div
          slot="nextArrow"
          class="custom-slick-arrow"
          :style="isNextDisabled ? 'pointer-events: none' : ''"
        >
          <img
            v-if="isNextDisabled"
            class="disabled"
            src="@/assets/images/arrow-disabled.png"
          />
          <img v-else src="@/assets/images/arrow.png" alt="" />
        </div>
      </a-carousel>
      <div class="guide-close" @click="close">
        <i class="icon aufontAll h-icon-all-close"></i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Carousel } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'new-user-guide',
  components: {
    ACarousel: Carousel,
  },
})
export default class NewUserGuide extends Vue {
  @Prop() value!: boolean;

  curIndex: number = 0;

  get isNextDisabled() {
    return this.curIndex === 4;
  }

  get isPrevDisabled() {
    return this.curIndex === 0;
  }

  change(current: any) {
    this.curIndex = current;
  }

  close() {
    this.$emit('close', false);
  }
}
</script>

<style lang="less" scoped>
.new-user-guide-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  .new-user-guide {
    width: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    & .ant-carousel {
      width: 100%;
      /deep/.slick-slide {
        height: 50%;
      }
      /deep/.slick-arrow {
        & > img {
          width: 40px;
          height: 40px;
        }
        &.slick-prev {
          left: 10px;
          z-index: 1;
          & > img.disabled {
            transform: rotate(180deg);
          }
        }
        &.slick-next {
          right: 30px;
          & > img {
            transform: rotate(180deg);
            &.disabled {
              transform: rotate(360deg);
            }
          }
        }
      }
      & .guide-img {
        border-radius: 20px;
        & > img {
          width: 50vw;
        }
      }
    }
    /deep/.ant-carousel .slick-dots {
      margin-bottom: 24px;
    }
    /deep/.ant-carousel .slick-dots li button {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(17, 18, 24, 0.25);
      transition: unset;
    }
    /deep/.ant-carousel .slick-dots li.slick-active {
      margin-top: -2px;
      button {
        width: 12px;
        height: 12px;
        background: @primary-color;
      }
    }
    .guide-close {
      position: absolute;
      top: 20px;
      right: 20px;
      cursor: pointer;
      & > i.icon {
        color: rgba(17, 18, 24, 0.5);
      }
    }
  }
}
</style>

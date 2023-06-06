<template>
  <div :id="'wrapper' + id" class="custom-popover">
    <div class="title">
      <slot name="title"></slot>
    </div>
    <div :id="id" class="content" @click="showPop">
      <slot></slot>
      <div v-show="visible">
        <div class="popover-arrow" :style="popStyle"></div>
        <div
          :id="'inner' + id"
          class="inner-content"
          :style="innerContentStyle"
        >
          <slot name="content"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
@Component({
  name: 'customPopover',
  components: {},
})
export default class customPopover extends Vue {
  @Prop({
    default: '',
  })
  baseParent?: string;

  @Prop({
    default: 'body',
  })
  scrollDom?: string;

  visible: boolean = false;

  showPop() {
    this.visible = true;
  }

  closePop() {
    this.visible = false;
  }

  @Watch('visible')
  onValueChange(val) {
    if (val) {
      this.$nextTick(() => {
        this.init();
      });
    }
  }

  id: string = 'popover';

  popStyle: any = {};

  innerContentStyle: any = {};

  getAbsPosition(element) {
    var abs = {
      x: 0,
      y: 0,
    };
    while (element !== document.body) {
      abs.x += element.offsetLeft;
      abs.y += element.offsetTop;
      element = element.offsetParent;
    }
    abs.x +=
      window.screenLeft +
      (document as any).body.clientLeft -
      (document as any).querySelector(this.scrollDom as any).scrollLeft;
    abs.y +=
      window.screenTop +
      (document as any).body.clientTop -
      (document as any).querySelector(this.scrollDom as any).scrollTop;
    return abs;
  }

  init() {
    const dom: Element = document.querySelector('#' + this.id) as Element;
    this.popStyle = {
      // @ts-ignore
      left: this.getAbsPosition(dom).x + dom.offsetWidth / 2 - 6 + 'px',
      // @ts-ignore
      top: this.getAbsPosition(dom).y + dom.offsetHeight + 4 + 'px',
    };

    const innerDom: Element = document.querySelector(
      '#inner' + this.id,
    ) as Element;

    let baseLeft: number = 0;
    let baseRihgt: number = 0;
    if (this.baseParent) {
      const baseParentDom: Element = document.querySelector(
        this.baseParent,
      ) as Element;
      // @ts-ignore
      baseLeft = this.getAbsPosition(baseParentDom).x;
      baseRihgt = baseLeft + baseParentDom.scrollWidth;
    }
    // @ts-ignore
    let left: any =
      this.getAbsPosition(dom).x +
      (dom as any).offsetWidth / 2 -
      (innerDom as any).offsetWidth / 2;
    let right: any = 'auto';
    left = left < baseLeft ? baseLeft : left;

    // @ts-ignore
    if (left + innerDom.offsetWidth > baseRihgt) {
      left = baseLeft;
      right = window.innerWidth - baseRihgt;
    }

    this.innerContentStyle = {
      left: left + 'px',
      // @ts-ignore
      top: this.getAbsPosition(dom).y + dom.offsetHeight + 10 + 'px',
      right: right === 'auto' ? 'auto' : right + 'px',
    };
  }

  mounted() {
    document.addEventListener('click', (e) => {
      if (
        !this.domInDom(document.querySelector('#wrapper' + this.id), e.target)
      ) {
        this.visible = false;
      }
    });

    (document as any).querySelector(this.scrollDom as any) &&
      (document as any)
        .querySelector(this.scrollDom as any)
        .addEventListener('scroll', (e) => {
          this.visible = false;
        });
  }

  domInDom(parent, node) {
    while (node && (node = node.parentNode)) {
      if (node === parent) {
        return true;
      }
    }
    return false;
  }

  created() {
    this.id = 'popover' + +new Date();
  }
}
</script>

<style lang="less" scoped>
.custom-popover {
  display: inline-block;
  .content {
    display: inline-block;
    position: relative;
  }
  .popover-arrow {
    width: 11.4px;
    height: 11.4px;
    border-left: 1px solid #eaeaea;
    border-top: 1px solid #eaeaea;
    transform: rotate(45deg);
    position: fixed;
    background-color: #fafafa;
    z-index: 2;
  }
  .inner-content {
    background-color: #fafafa;
    border: 1px solid #eaeaea;
    position: fixed;
    z-index: 1;
  }
}
</style>

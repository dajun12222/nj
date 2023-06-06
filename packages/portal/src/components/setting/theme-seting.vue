<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--主题设置-->
<template>
  <div class="theme-seting">
    <div class="title">
      <h3>主题</h3>
      <span class="icon aufontAll h-icon-all-close" @click="close"></span>
    </div>

    <div class="content">
      <div class="tips">
        <div class="left">
          <i class="icon aufontAll h-icon-all-info-cirlce"></i>
          <span>前台和后台logo、版权信息修改</span>
        </div>
        <span class="font-ele" @click="goToset"> 点击跳转 </span>
      </div>

      <div class="group-title">颜色</div>
      <div class="colors">
        <span
          v-for="(item, index) in colors"
          :key="index"
          :style="{ 'background-color': item.primaryColor }"
          :class="{ active: currentColorName === item.name }"
          @click="changeColor(item)"
        >
          <i class="icon aufontAll h-icon-all-check"></i>
        </span>
      </div>

      <div class="group-title">外观</div>
      <div class="outward">
        <div
          class="item light"
          :class="{ active: outwardType === 'light' }"
          @click="outwardType = 'light'"
        >
          <div class="header">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="outward-content">
            <div class="left"></div>
            <div class="right"></div>
          </div>

          <span class="tag">
            <i
              v-if="currentColorName !== 'default'"
              class="icon aufontAll h-icon-all-check"
            ></i>
            <em v-else>默认</em>
          </span>
        </div>
        <div
          v-if="currentColorName !== 'default'"
          class="item dark"
          :class="{ active: outwardType === 'dark' }"
          @click="outwardType = 'dark'"
        >
          <div class="header">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="outward-content">
            <div class="left"></div>
            <div class="right"></div>
          </div>

          <span class="tag"><i class="icon aufontAll h-icon-all-check"></i></span>
        </div>
      </div>
    </div>
    <transition name="fade-down">
      <div v-if="showViewBox" class="view" :class="outwardType">
        <div class="header" :style="headerStyle">
          <div class="left">
            <div class="logo"></div>
            <div class="items">
              <div><span v-for="i in 13" :key="i"></span></div>
              <div :style="activeStyle">
                <span v-for="i in 13" :key="i" :style="itemStyle"></span>
              </div>
              <div><span v-for="i in 13" :key="i"></span></div>
              <div><span v-for="i in 13" :key="i"></span></div>
            </div>
          </div>
          <div class="user"></div>
        </div>

        <div class="view-content">
          <div class="left" :style="leftStyle">
            <div v-for="i in 4" :key="i">
              <span
                v-for="k in 13"
                :key="i + '_' + k"
                :style="i === 2 ? itemStyle : {}"
              ></span>
            </div>
          </div>
          <div class="right"></div>
        </div>
      </div>
    </transition>

    <div class="btns">
      <a-button class="reset" @click="reset"> 恢复默认 </a-button>
      <a-button type="primary" @click="updataThemes"> 确 定 </a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Button } from '@h3/antd-vue';
import { updateTheme, colorsMap, COLORS } from '../../tools/settingConfig';
import { themesApi } from 'cloudpivot/api';

@Component({
  name: 'themeSetting',
  components: {
    AButton: Button,
  },
})
export default class themeSetting extends Vue {
  @Prop({ default: false }) openSettintTheme!: boolean;

  // 延迟触发预览窗口显示。用于添加动画
  @Watch('openSettintTheme', { immediate: true })
  onOpenSettintThemeChange(val) {
    if (val) {
      setTimeout(() => (this.showViewBox = true), 600);
    } else {
      this.showViewBox = false;
    }
  }

  outwardType: 'light' | 'dark' = 'light'; // 默认外观

  showViewBox: boolean = false;

  currentColorName: string = 'default';

  get currentColor() {
    // 当前设置的主题色
    return this.currentItem.primaryColor;
  }

  get currentItem() {
    // 当前设置的主题色对象
    return this.colors.find(
      (el) => el.name === this.currentColorName,
    ) as COLORS;
  }

  close() {
    // 关闭
    this.$emit('close');
  }

  changeColor(item) {
    // 颜色改变
    if (item.name === 'default') {
      this.outwardType = 'light';
    }
    this.currentColorName = item.name;
  }

  // 去后台设置
  goToset() {
    window.open('/admin/#/system/license?tabKey=2');
  }

  // 修改主题
  editTheme(): any {
    const params = {
      color: this.currentColorName,
      outward: this.outwardType,
    };
    return themesApi.editTheme(params);
  }

  // 还原主题
  async reset() {
    this.currentColorName = 'default';
    this.outwardType = 'light';
    const res = await this.editTheme();
    if (res.errcode === 0) {
      this.$message.success(res.errmsg as string);
      updateTheme({
        color: this.currentColorName,
        outwardType: 'light',
        store: this.$store,
      });
      this.close();
    } else {
      this.$message.error(res.errmsg as string);
    }
  }

  // 更新主题
  async updataThemes() {
    const res = await this.editTheme();
    if (res.errcode === 0) {
      this.$message.success(res.errmsg as string);
      updateTheme({
        color: this.currentColorName,
        outwardType: this.outwardType,
        store: this.$store,
      });
      this.close();
    } else {
      this.$message.error(res.errmsg as string);
    }
  }

  // 回显主题配置
  mounted() {
    const item = colorsMap.find(
      (el) => el.name === this.$store.state.themeColor,
    ) as COLORS;
    this.currentColorName = (
      this.colors.find((el) => el.primaryColor === item.primaryColor) as COLORS
    ).name;
    this.outwardType = this.$store.state.outwardType;
  }

  get colors() {
    return colorsMap;
  }

  get itemStyle() {
    return {
      'background-color':
        this.outwardType === 'light' ? this.currentColor : '#fff',
    };
  }

  get activeStyle() {
    return {
      'border-bottom':
        this.outwardType === 'light'
          ? `2px solid ${this.currentColor}`
          : 'none',
    };
  }

  get headerStyle() {
    return {
      'background-color':
        this.outwardType === 'dark' ? this.currentColor : '#ffffff',
    };
  }

  get leftStyle() {
    return {
      'background-color':
        this.outwardType === 'dark'
          ? (
              colorsMap.find(
                (el) => this.currentColor === el.primaryColor,
              ) as COLORS
            ).dark_subColor
          : '#ffffff',
    };
  }
}
</script>
<style lang="less">
.ant-message {
  z-index: 2000 !important;
}
@import '~@h3/antd-vue/lib/style/themes/default.less';
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
@black: #111218;
.theme-seting {
  .title {
    display: flex;
    justify-content: space-between;
    height: 56px;
    line-height: 56px;
    box-shadow: 0px 1px 0px 0px #dddddd;
    padding-left: 24px;
    padding-right: 24px;
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: @black;
    }
    span {
      color: rgba(17, 18, 24, 0.5);
      cursor: pointer;
      &:hover {
        color: @highlightColor;
      }
    }
  }

  .content {
    padding: 24px;
    .tips {
      width: 372px;
      height: 40px;
      background: #f0f7ff;
      border: 1px solid #a3cbff;
      display: flex;
      align-items: center;
      border-radius: 4px;
      padding: 0 16px;
      font-size: 14px;
      color: @black;
      justify-content: space-between;
      i {
        color: #2970ff;
        margin-right: 8px;
      }
      .font-ele {
        color: #2970ff;
        margin-left: 18px;
        cursor: pointer;
        float: right;
      }
    }

    .group-title {
      font-size: 14px;
      color: @black;
      font-weight: 600;
      height: 22px;
      line-height: 22px;
      margin-top: 24px;
      padding-left: 13px;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 12px;
        background: #2970ff;
      }
    }

    .colors {
      padding-left: 9px;
      padding-bottom: 8px;
      span {
        display: inline-block;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        margin-right: 24px;
        text-align: center;
        cursor: pointer;
        margin-top: 16px;
        &:last-child,
        &:nth-child(n + 8) {
          margin-right: 0;
        }
        i {
          color: #fff;
          font-size: 12px;
          opacity: 0;
        }
        &.active {
          i {
            opacity: 1;
          }
        }
      }
    }

    .outward {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      .item {
        width: 172px;
        height: 104px;
        background: #eaeaea;
        border-radius: 2px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        cursor: pointer;
        border: 1px solid #eaeaea;
        .header {
          height: 14px;
          padding: 0 6px;
          display: flex;
          align-items: center;
          span {
            width: 17px;
            height: 6px;
            margin-left: 6px;
            display: inline-block;
          }
        }
        .outward-content {
          display: flex;
          margin-top: 5px;
          flex: 1;
          flex-direction: row;
          .left {
            width: 24px;
            margin-right: 5px;
            height: 100%;
          }
          .right {
            background-color: #fff;
            flex: 1;
            height: 100%;
          }
        }

        &.dark {
          .header {
            background-color: #484848;
            span {
              background-color: #fff;
            }
          }
          .left {
            background-color: #484848;
          }
        }
        &.light {
          .header {
            background-color: #fff;
            span {
              background-color: #484848;
            }
          }
          .left {
            background-color: #fff;
          }
        }

        .tag {
          display: none;
        }

        &.active {
          border: 1px solid #2970ff;
          position: relative;
          .tag {
            position: absolute;
            right: 0;
            top: 0;
            display: block;
            width: 0;
            height: 0;
            border-top: 16px solid #2970ff;
            border-right: 16px solid #2970ff;
            border-bottom: 16px solid transparent;
            border-left: 16px solid transparent;
            i {
              position: absolute;
              right: -15px;
              top: -18px;
              color: #fff;
            }
            em {
              font-size: 12px;
              color: #fff;
              position: absolute;
              white-space: nowrap;
              transform: rotate(45deg) scale(0.8);
              left: -4px;
              top: -14px;
            }
          }
        }
      }
    }
  }
  .view {
    position: fixed;
    top: 50%;
    left: 50%;
    margin-left: -210px;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 480px;
    background-color: #f1f2f6;
    display: flex;
    flex-direction: column;
    &.dark {
      .header {
        .logo {
          background-color: #fff;
        }
        .items > div span {
          background-color: #fff;
        }
        .user {
          background-color: #fff;
        }
      }

      .view-content {
        .left {
          & > div {
            span {
              background: #fff;
            }
          }
        }
      }
    }
    .header {
      height: 46px;
      display: flex;
      align-items: center;
      background-color: #fff;
      border-bottom: 1px solid rgba(224, 224, 224, 0.5);
      flex-direction: row;
      justify-content: space-between;
      .left {
        display: flex;
        align-items: center;
      }
      .logo {
        width: 104px;
        height: 20px;
        background: #d8d8d8;
        margin-left: 20px;
      }

      .items {
        flex-wrap: nowrap;
        display: flex;
        & > div {
          width: 73px;
          height: 44px;
          display: flex;
          justify-content: space-between;
          overflow: hidden;
          margin-left: 28px;
          align-items: center;
          border-bottom: 2px solid transparent;
          span {
            display: inline-block;
            width: 3px;
            max-width: 3px;
            height: 18px;
            background-color: #d8d8d8;
          }
        }
      }
      .user {
        width: 30px;
        height: 30px;
        background: #d8d8d8;
        border-radius: 15px;
        margin-right: 20px;
      }
    }
    .view-content {
      display: flex;
      flex: 1;
      .left {
        width: 132px;
        height: 100%;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 18px;
        & > div {
          width: 87px;
          height: 18px;
          display: flex;
          justify-content: space-between;
          margin-bottom: 26px;
          span {
            width: 3px;
            height: 18px;
            display: inline-block;
            background: #d8d8d8;
          }
        }
      }
      .right {
        flex: 1;
        margin: 20px;
        background-color: #fff;
      }
    }
  }

  .btns {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 56px;
    border-top: 1px solid #ddd;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .reset {
      margin-right: 8px;
    }
  }
}

.fade-down-enter-active {
  transition: all 0.3s ease;
}
.fade-down-leave-active {
  transition: all 0s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-down-enter, .fade-down-leave-to
  /* .slide-fade-leave-active 用于 2.1.8 以下版本 */ {
  margin-top: -30px;
  opacity: 0;
}

@media screen and (max-width: 1300px) {
  .view {
    transform: translate(-50%, -50%) scale(0.8) !important;
  }
}
@media screen and (max-width: 1100px) {
  .view {
    transform: translate(-50%, -50%) scale(0.6) !important;
  }
}
</style>

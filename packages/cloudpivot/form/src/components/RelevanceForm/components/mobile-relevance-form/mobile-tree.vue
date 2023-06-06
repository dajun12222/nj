<template>
  <div class="mobile-tree">
    <div v-if="sourceData.length !== 0" class="has-data">
      <div v-show="routers.length > 1" class="check-levals">
        <div class="leval-box">
          <span
            v-for="(item, index) in routers"
            :key="index"
            class="check-leval"
          >
            <span v-if="index === 0" class="icon aufontAll">&#xe89a;</span>
            <span @click.stop="routerChange(item, index)">{{
              item.breadcrumbName
            }}</span>
            <span v-show="index !== routers.length - 1" class="icon aufontAll">&#xe89b;</span>
          </span>
        </div>
      </div>
      <div class="tree-body">
        <a-radio-group
          v-model="selectIdObj.key"
          class="tree-group"
          name="mobile-tree"
        >
          <div v-for="(item, index) in nowData" :key="index" class="tree-item">
            <a-radio
              :ref="item.key"
              :value="item.key"
              :checked="false"
              @click="selectId(item.key)"
            >
              <span class="row-title">{{ item.title }}</span>
            </a-radio>
            <div
              v-if="item.children.length !== 0"
              class="row-mark"
              @click.stop="changeClickId(item)"
            >
              <span class="icon aufontAll">&#xe7eb;</span>
            </div>
          </div>
        </a-radio-group>
      </div>
    </div>
    <div v-else class="has-no-data">
      <div class="has-no-data2">
        <img src="./no-data.png" alt="暂无数据" />
        <div class="has-no-data-text">暂无数据</div>
      </div>
    </div>
    <div v-if="sourceData.length !== 0" class="confirm-btn">
      <span class="confirm" @click="confirm">确认</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Breadcrumb, Radio, Tree } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'mobile-tree',
  components: {
    ATree: Tree,
    ABreadcrumb: Breadcrumb,
    ABreadcrumbItem: Breadcrumb.Item,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
  },
})
export default class MobileTree extends Vue {
  @Prop() sourceData: any;

  @Prop() treeData: any;

  @Prop() vm: any;

  //最新一层的父id，如果再最上层，则id为#
  nowId: string = '#';

  routers: any = [
    {
      path: '#',
      breadcrumbName: '根目录',
    },
  ];

  selectIdObj: any = {
    key: '',
  };

  nowData: any = [];

  //最新一层的数据
  @Watch('treeData')
  getNowData() {
    // if(this.treeData.length > 0){
    this.nowData = this.listData(this.nowId, this.treeData);
    // }
  }
  /* //最新一层的数据
get nowData(){
  return this.listData(this.nowId, this.treeData);
} */

  //进入子结点
  changeClickId(item) {
    console.log(item, 'key--------------------------------');
    this.nowId = item.key;
    this.nowData = this.listData(this.nowId, this.treeData);
    const route = {
      path: item.key,
      breadcrumbName: item.title,
    };
    this.routers.push(route);
  }

  routerChange(item: any, index: number) {
    if (item.path !== this.nowId) {
      this.nowId = item.path;
      this.nowData = this.listData(this.nowId, this.treeData);
      this.routers.length = index + 1;
    }
    this.selectIdObj = {
      key: '',
    };
  }

  //根据选中的id变成原始的数据对象
  keyToSourceData(key, sourceData: any) {
    if (!sourceData) {
      return {};
    }
    let obj: any = {};
    for (let i = 0; i < sourceData.length; i++) {
      if (key === sourceData[i].id) {
        obj = sourceData[i];
        break;
      } else {
        obj = this.keyToSourceData(key, sourceData[i].data.t__children_);
        if (JSON.stringify(obj) !== '{}') {
          break;
        }
      }
    }
    return obj;
  }

  selectId(key: string) {
    const obj = this.keyToSourceData(key, this.sourceData);
    this.selectIdObj = obj;
  }

  //确认
  confirm() {
    this.vm.change(this.selectIdObj);
  }

  //清除
  clear() {
    this.nowId = '#';
    this.nowData = this.listData(this.nowId, this.treeData);
  }

  //取消
  cancel() {
    if (this.vm.value.id) {
      this.selectId(this.vm.value.id);
      this.vm.change(this.selectIdObj);
    } else {
      this.vm.change({ data: {} });
    }
  }

  //根据选择点击的id找到该子数据返回
  listData(Dataid: string, treeData: any) {
    if (treeData.length === 0) {
      return [];
    }
    let arr: any = [];
    if (Dataid === '#') {
      arr = treeData.map((item) => {
        return item;
      });
    } else {
      for (let i = 0; i < treeData.length; i++) {
        if (treeData[i].key === Dataid) {
          arr = treeData[i].children;
          break;
        } else {
          arr = this.listData(Dataid, treeData[i].children);
          if (arr.length !== 0) {
            break;
          }
        }
      }
    }
    arr.forEach((item: any) => {
      item.checked = false;
    });
    console.log(arr, '------------------ARR');
    return arr;
  }
}
</script>
>

<style lang="less" scoped>
.mobile-tree {
  height: 100%;
  background: #f7f8fc;
  font-size: 16px;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding-bottom: 45px;
  .has-data {
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    &::-webkit-scrollbar {
      width: 0px !important;
      height: 0px !important;
    }
    /deep/.check-levals {
      height: 1.15rem;
      min-height: 1.15rem;
      line-height: 1.15rem;
      margin: 0.2rem 0 0.3rem 0;
      padding: 0 16px;
      background: #ffffff;
      display: flex;
      align-items: center;
      .leval-box {
        width: 100%;
        overflow: auto;
        white-space: nowrap;
        &::-webkit-scrollbar {
          width: 0px !important;
          height: 0px !important;
        }
        .check-leval {
          font-size: 0.4rem;
          color: #2a70ff;
          white-space: nowrap;
          &:last-child {
            color: #a6a6a6;
          }
          > span {
            margin-right: 0.3em;
          }
        }
      }
    }
    .tree-body {
      height: 100%;
      .tree-group {
        width: 100%;
        .tree-item {
          display: flex;
          height: 1.15rem;
          line-height: 1.15rem;
          align-items: center;
          width: 100%;
          background: #ffffff;
          padding: 0 16px;
          border-bottom: 1px solid #eeeeee;
          /deep/.ant-radio-wrapper {
            height: 100%;
            width: 100%;
            line-height: 100%;
            display: flex;
            align-items: center;
            > span {
              display: inherit;
              width: 100%;
              &.ant-radio {
                // display: inline-block;
                width: 16px;
                min-width: 16px;
                margin-right: 8px;
              }
              .row-title {
                font-size: 0.4rem;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
          .row-mark {
            width: 48px;
            text-align: center;
            padding: 0 16px;
            margin-right: -16px;
          }
        }
      }
    }
  }
  .has-no-data {
    height: 100%;
    text-align: center;
    display: flex;
    padding-top: 60%;
    .has-no-data2 {
      width: 100%;
      > img {
        width: 42.66666667%;
      }
      .has-no-data-text {
        font-size: 0.35rem;
        color: #a6a6a6;
        margin-top: 0.35rem;
      }
    }
  }
  .confirm-btn {
    width: 100%;
    height: 1.15rem;
    min-height: 1.15rem;
    background: #ffffff;
    text-align: center;
    color: #2970ff;
    line-height: 1.15rem;
    .confirm {
      font-size: 0.4rem;
    }
  }

  // .header{
  //   position: relative;
  //   height: 40px;
  //   padding-top: 15px;
  //   border-bottom: solid 1px rgb(240, 240, 240);
  //   /* justify-content: center; */
  //   .cancel{

  //   }
  //   .clear{

  //   }
  //   .confirm{
  //     position: absolute;
  //     right: 5px;
  //   }
  //   span{
  //     margin-left: 20px;
  //     margin-right: 20px;
  //     color: #338fe5
  //   }
  // }

  // .content {
  //   flex-grow: 1;
  //   overflow: auto;
  // }
}

// /deep/.row{
//   /* height: 40px; */
//   position: relative;
//   border-bottom: solid 1px rgb(240, 240, 240);
//   line-height: 30px;
//   padding: 5px 24px 5px 29px;
//   .fontcolor{
//     color: rgb(240, 240, 240);
//   }
//   .row-checked{
//     height: 100%;
//     line-height: 40px;
//     position: absolute;
//     top: 0;
//     left: 8px;
//     color: #4da9ff;
//     font-weight: bolder;
//   }
//   .row-title{
//     overflow: hidden;
//     text-overflow: ellipsis;
//     display: block;
//     margin-right: 25px;
//   }
//   .row-mark{
//     height: 40px;
//     line-height: 40px;
//     position: absolute;
//     top: 0;
//     right: 5px;
//     padding-left: 25px;
//     padding-right: 15px;
//   }
// }

// /deep/.checked{
//   background-color: skyblue;
// }
</style>

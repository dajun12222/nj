<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="apps-select">
    <a-tree-select
      v-model="selectedCode"
      :treeData="treeData"
      :maxTagCount="5"
      :style="`width:${customWidth}`"
      style="top: 5px"
      dropdownClassName="orgsync-form-tree-select"
      :getPopupContainer="getPopupContainer"
      :replaceFields="replaceFields"
      placeholder="请选择"
      :treeCheckable="true"
      treeNodeFilterProp="title"
      class="orgsync-form-item"
      @change="onChange"
      @focus="dropdownVisibleChange"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Model, Watch } from 'vue-property-decorator';

import appsApi from '@/apis/apps';
import { TreeSelect } from '@h3/antd-vue';

@Component({
  name: 'apps-select',
  components: {
    ATreeSelect: TreeSelect,
  },
})
export default class AppsSelect extends Vue {
  @Model('change') selectData!: Array<string>;

  @Prop({ default: '292px' }) customWidth: any;

  list: any[] = [];

  value: Array<string> = [];

  treeData: any[] = [];

  selectedCode: any = [];

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  getTreeData() {
    this.treeData = [];
    const params: any = {
      fromRecycle: false,
    };
    appsApi
      .getAppgroupList(params)
      .then((res: any) => {
        if (res.errcode !== 0) {
          return this.$message.error(res.errmsg);
        }
        this.treeData = res.data.filter((d: any) => {
          if (d.children && d.children.length && d.code !== 'all') {
            return d;
          }
        });
        //过滤掉已经被删除的应用
        if (this.treeData.length > 0 && this.selectedCode.length > 0) {
          for (let se = 0; se < this.selectedCode.length; se++) {
            let seOpen: boolean = true;
            for (const con of this.treeData) {
              if (Array.isArray(con.children) && con.children.length > 0) {
                for (const chd of con.children) {
                  if (chd.code === this.selectedCode[se]) {
                    seOpen = false;
                    break;
                  }
                }
              }
            }
            if (seOpen) {
              this.selectedCode.splice(se, 1);
              se--;
            }
          }
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  created() {
    this.getTreeData();
  }

  replaceFields: any = {
    children: 'children',
    title: 'name',
    key: 'id',
    value: 'code',
  };

  filterOption(inputVal: string, option: any) {
    return option.componentOptions.children[0].text.indexOf(inputVal) >= 0;
  }

  /**
   * 选择后处理数据，返回后台
   */
  onChange(val: any) {
    const toEmit: any = [];
    this.treeData.forEach((v) => {
      if (v.children) {
        val.forEach((vv) => {
          v.children.forEach((child) => {
            if (child.code === vv) {
              toEmit.push({
                code: vv,
                name: child.name,
              });
            }
          });
        });
      }
    });

    this.$emit('change', toEmit);
  }

  dropdownVisibleChange() {
    setTimeout(() => {
      const modalBody = document.querySelector(
        '.ant-modal-body',
      ) as HTMLDivElement;

      const seTree: any = document.getElementsByClassName('ant-select-tree')[0];
      console.log(seTree);
      seTree.style.height = modalBody.offsetHeight - 55 + 'px';
    }, 300);
  }

  @Watch('selectData', {
    immediate: true,
  })
  onSelectDataChange() {
    // this.value = this.selectData.map((res: any) => res.code);
    this.selectedCode = this.selectData.map((res: any) => res.code);
  }
}
</script>
<style lang="less" scoped>
.apps-select {
  &__item {
    width: 100%;
  }
}
</style>

<style lang="less"></style>

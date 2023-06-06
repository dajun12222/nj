<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    title="留痕数据项"
    :visible="true"
    width="566px"
    :maskClosable="false"
    :keyboard="false"
    class="modal"
    @cancel="closeModal"
  >
    <div>
      <a-checkbox
        :indeterminate="indeterminate"
        :checked="checkAll"
        @change="handleSelectAll"
      >
        全选
      </a-checkbox>
    </div>

    <a-tree
      v-model="checkedNodes"
      checkable
      :treeData="treeData"
      @select="onSelect"
      @check="onCheck"
    >
      <span slot="title0010" style="color: #1890ff">sss</span>
    </a-tree>

    <template slot="footer">
      <a-button key="cancel" @click="closeModal">
        {{ $t('languages.Apps.Cancel') }}
      </a-button>
      <a-button
        key="ok"
        :disabled="$route.path.includes('apps/versionDetail/')"
        type="primary"
        @click="backData"
      >
        {{ $t('languages.Apps.Ok') }}
      </a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { Modal, Tree, Checkbox, Button } from '@h3/antd-vue';
import { listApi } from 'cloudpivot/api';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

// getDataItemList
@Component({
  name: 'external-link',
  components: {
    AModal: Modal,
    ATree: Tree,
    ACheckbox: Checkbox,
    AButton: Button,
  },
})
export default class ExternalLink extends Vue {
  @Prop({
    type: Object,
    default: () => ({}),
  })
  modalData!: any;

  checkedNodes: Array<string> = [];

  treeData: Array<any> = [];

  dataItemMap: Array<any> = [];

  checkAll: boolean = false;

  get schemaCode() {
    return this.modalData.data.value.code;
  }

  // 样式控制
  get indeterminate(): boolean {
    return (
      this.checkedNodes.length > 0 &&
      this.checkedNodes.length < this.ableSelectCount
    );
  }

  get ableSelectCount(): number {
    const result: any = [];
    for (let i = 0; i < this.treeData.length; i++) {
      if (this.treeData[i].children) {
        this.treeData[i].children.forEach((element: any) => {
          if (!element.disabled) {
            result.push(element.code);
          }
        });
      }
    }
    return result.length;
  }

  mounted() {
    //
    const values = this.modalData.data.value.trackDataCodes;
    values ? (this.checkedNodes = values.split(';')) : (this.checkedNodes = []);
    // 给选项赋默认值
    // console.log(this.ableSelectCount)
    // console.log(this.checkedNodes.length)
    // this.ableSelectCount === this.checkedNodes.length ? this.checkAll = true : false

    this.loadAllDataItem();
  }

  loadAllDataItem() {
    const params = {
      schemaCode: this.schemaCode,
    };
    listApi.getDataItemList(params).then((res: any) => {
      let data: any[] = [];
      if (res.status || res.data.errcode === 0) {
        data = res.data.data;
      }
      if (res.errcode === 0) {
        data = res.data;
      }

      this.dataItemMap = data;

      // 不显示除拥有者 拥有者部门的系统数据项
      const filter = data.filter(
        (item: any) =>
          (item.defaultProperty &&
            (item.code === 'owner' || item.code === 'ownerDeptId')) ||
          !item.defaultProperty,
      );

      const classifyed = filter.reduce(
        (stat, item) => {
          item.value = item.code;
          item.key = item.code;
          item.title = item.name;
          item.children = null;

          // 处理系统数据项
          if (item.defaultProperty) {
            // 系统数据项只允许拥有者及拥有者部门设置
            item.disabled = ['owner', 'ownerDeptId'].includes(`${item.code}`)
              ? false
              : true;
          } else {
            // 单行文本0 长文本1 数值2 日期3 单选12 复选13 附件6 逻辑4 下拉多选15 下拉单选14 地址10 手写签名6 图片6 部门多选61 部门大选60 人员多选51 人员单选50
            item.disabled = [
              '0',
              '1',
              '2',
              '3',
              '4',
              '6',
              '10',
              '12',
              '13',
              '14',
              '15',
              '50',
              '51',
              '60',
              '61',
            ].includes(`${item.propertyType}`)
              ? false
              : true;
          }

          item.defaultProperty
            ? stat.system.push(item)
            : stat.custom.push(item);
          return stat;
        },
        {
          system: [],
          custom: [],
        },
      );

      this.treeData = [
        {
          title: '系统数据项',
          value: 'system',
          key: 'system',
          children: classifyed.system,
        },
        {
          title: '业务数据项',
          value: 'custom',
          key: 'custom',
          children: classifyed.custom,
        },
      ];

      // this.targetDataItems = data.filter((item) => {
      //   return !this.filtersType.includes(item.propertyType)
      // });
      // this.conditionList = []
      //   resolve()
    });
  }

  handleSelectAll(e) {
    this.checkAll = e.target.checked;
    if (this.checkAll) {
      const result: any = [];
      for (let i = 0; i < this.treeData.length; i++) {
        // console.log(this.treeData[i])
        if (this.treeData[i].children) {
          this.treeData[i].children.forEach((element: any) => {
            if (!element.disabled) {
              result.push(element.code);
            }
          });
        }
      }
      this.checkedNodes = result;
    } else {
      this.checkedNodes = [];
    }
  }

  onSelect() {
    // console.log('select')
  }

  onCheck(val) {
    if (val.length - 2 === this.ableSelectCount) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }

  getShortCode() {}

  createQrCode() {}

  outFocus() {}

  @Watch('ableSelectCount')
  changeCheckAll(val) {
    this.checkAll = val === this.checkedNodes.length ? true : false;
  }

  backData() {
    const filterArry = this.checkedNodes.filter(
      (item) => item !== 'system' && item !== 'custom',
    );
    const result = {
      trackDataCodes: filterArry.join(';'),
    };
    // if(filterArry.length === 1) {
    //   const target = this.dataItemMap.find(item => item.id === filterArry[0])
    //   result.showText = target.name
    // } else if (result.trackDataCodes.length > 1) {
    //   result.showText = `已选${filterArry.length}项`
    // }
    console.log(result);
    this.$emit('backData', result.trackDataCodes);
  }

  closeModal() {
    this.$emit('closeModal');
  }
}
</script>

<style lang="less" scoped></style>
<style lang="less">
.modal {
  .ant-modal-body {
    max-height: 492px;
    overflow: auto;
  }
}
</style>

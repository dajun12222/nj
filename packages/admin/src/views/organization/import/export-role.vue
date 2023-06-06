<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-12 09:32:19
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 11:21:18
 * @FilePath: \yunshu6.0\packages\admin\src\views\organization\import\export-role.vue
 * @Description: 
-->
<template>
  <a-modal
    :title="'导出角色'"
    class="export-role-modal"
    :visible="isShowExportRole"
    :width="446"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    @ok="exportRole"
    @cancel="closeModel"
  >
    <div class="add-data-manager">
      <a-row class="add-data-manager__item">
        <a-col :span="layout.left" class="add-data-manager__left">
          <span class="label-required">选择角色组:</span>
        </a-col>
        <a-col :span="layout.right" class="add-data-manager__right">
          <a-tree-select
            style="width: 100%"
            :treeData="sysTreeData"
            showSearch
            allowClear
            treeNodeFilterProp="title"
            :dropdownStyle="{ maxHeight: '350px', overflow: 'auto' }"
            :placeholder="$t('languages.PlaceHolder.Select')"
            @change="handleOnChange"
          />
        </a-col>
      </a-row>
    </div>
  </a-modal>
</template>

<script lang="ts">
import OrgApi from '@/apis/organization';
import { Col, Modal, Row, TreeSelect } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'export-role',
  components: {
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    ATreeSelect: TreeSelect,
  },
})
export default class ExportRole extends Vue {
  @Prop() isShowExportRole!: boolean;

  @Prop() treeData!: any;

  dataRef: any = {};

  layout = {
    left: 6,
    right: 18,
  };

  get sysTreeData() {
    if (!this.treeData) {
      return [];
    }
    const res = this.treeData.filter((i) => i.children);
    const data = this.dataRecursion(res);
    return this.changeData(data, {});
  }

  dataRecursion(list: any) {
    const arr: any = [];
    list.map((i: any) => {
      if (i.children && i.children.length) {
        // i.selectable = i.corpId ? true : false;
        i.children = this.dataRecursion(i.children);
      } else {
        i.isLeaf = true;
        delete i.children;
      }
      if (i.name !== '默认分组') {
        arr.push(i);
      }
    });
    return arr;
  }

  changeData(data: any, nodes: any) {
    data.forEach((node: any) => {
      if (node.children && node.children.length) {
        node.children = this.changeData(node.children, {});
      }
    });
    return data.filter((el) => el.name !== '默认');
  }

  handleOnChange(value: any, label: any, extra: any) {
    console.log(value, extra);
    if (extra.triggerNode) {
      this.dataRef = extra.triggerNode.dataRef;
      console.log(this.dataRef, 'dataRef======>');
    } else {
      this.dataRef = {};
    }
  }

  /**
   * 导出操作
   */
  async exportRole() {
    console.log(this.dataRef);
    if (Object.keys(this.dataRef).length === 0) {
      this.$message.info('请选择角色组');
      return;
    }
    console.log('开始导出');
    // @ts-ignore
    const corpId: any = this.dataRef.corpId || '';
    const groupId: any = this.dataRef.id || '';
    console.log(groupId);
    const res: any = await OrgApi.exportRole({ corpId, groupId });
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      this.$message.error(this.$t('languages.Modal.DownloadFailed') as string);
    } else {
      const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
      const timer = this.dateFtt(new Date());
      const fileName = `角色导出${timer}.xlsx`;
      this.downloadFile(blob, fileName);
    }
    this.$emit('cancel');
  }

  /**
   * 文件下载方法
   */
  downloadFile(blob: any, fileName: string) {
    if ((window as any).navigator.msSaveOrOpenBlob) {
      (navigator as any).msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * 时间标准化
   */
  dateFtt(date, fmt = 'YYYYMMDDHHmmss') {
    const o = {
      'M+': date.getMonth() + 1, //月份
      'DD+': date.getDate(), //日
      'HH+': date.getHours(), //小时
      'm+': date.getMinutes(), //分
      's+': date.getSeconds(), //秒
      'q+': Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds(), //毫秒
    };
    if (/(Y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + '').substr(4 - RegExp.$1.length),
      );
    }

    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length),
        );
      }
    }

    return fmt;
  }

  closeModel() {
    this.$emit('cancel');
  }

  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang() {}

  // 日期控件国际化
  @Watch('$i18n.locale')
  onLanguageChange(val: any) {
    this.placeHolderLang();
  }
}
</script>
<style lang="less" scoped>
.export-role-modal {
  .add-data-manager {
    &__item {
      margin-bottom: 20px;
      .add-data-manager__left {
        height: 32px;
        line-height: 32px;
        > span {
          height: 20px;
          font-size: 14px;
          font-weight: 400;
          color: #111218;
          line-height: 20px;
        }
      }
      .add-data-manager__right {
        .add-data-manager__select {
          width: 100%;
        }
        & > span {
          height: 32px;
          line-height: 32px;
        }
      }
    }
  }
}
</style>

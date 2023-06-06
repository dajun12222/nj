<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="print">
    <div class="plus">
      <em
        class="icon aufontAll h-icon-all-plus-o"
        :class="{ disabled: printTemplatesFilter.length >= 10 }"
        @click="add('add')"
      ></em>
    </div>

    <div
      v-for="(item, index) in printTemplatesFilter"
      :key="index"
      class="item"
    >
      <input
        v-model="item.name"
        maxlength="20"
        class="ant-input input-box"
        type="text"
        :disabled="$route.path.includes('apps/versionDetail/')"
        @blur="onPrintTemplatesChange"
      />

      <div class="btns">
        <em
          class="icon aufontAll h-icon-all-edit"
          title="编辑"
          @click="edit(item)"
        ></em>
        <em
          class="icon aufontAll h-icon-all-file-copy"
          title="复制"
          @click="add('copy', item)"
        ></em>
        <em
          class="icon aufontAll h-icon-all-delete1"
          title="删除"
          @click="del(item)"
        ></em>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Input } from '@h3/antd-vue';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as formApi from '@/apis/form';

@Component({
  name: 'print',
  components: {
    AInput: Input,
  },
})
export default class print extends Vue {
  @Prop()
  modalData!: any;

  printTemplates: any[] = [];

  // @Watch('printTemplates', {
  //   deep: true,
  // })
  onPrintTemplatesChange() {
    this.modalData.data.value.printTemplateJson = JSON.stringify(
      this.printTemplates,
    );
    this.$emit('change', this.printTemplates);
  }

  printTemplatesFilter: any[] = [];

  time: number = 0;

  getPrintTemplatesFilter() {
    this.printTemplatesFilter = this.printTemplates.filter((el) => !el.delete);
  }

  // 添加
  add(type: 'add' | 'copy', item?: any) {
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    if (this.printTemplatesFilter.length >= 10) {
      this.$message.warning('打印模板最多10个');
      return;
    }
    const name = this.getPrintTemplateName(type, item && item.name);
    this.printTemplates.push({
      sheetCode: this.getPrintSheetCode(),
      name_i18n: `{"en":"${name}"}`,
      name: name,
      copyCode: item && (item.copyCode || item.sheetCode),
    });
    this.getPrintTemplatesFilter();
    this.onPrintTemplatesChange();
  }

  created() {
    console.log(this.modalData);
    this.printTemplates = JSON.parse(
      this.modalData.data.value.printTemplateJson as string,
    );
    this.getPrintTemplatesFilter();
  }

  // 编辑
  async edit(item) {
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    const printInfo = await this.judgePrintCode(item);
    this.$router
      .push({
        name: 'print-template',
        params: printInfo,
        query: {
          formCode: this.$route.params.sheetCode,
        },
      } as any)
      .catch((err: any) => {
        console.log(err);
      });
  }

  // 删除
  del(item) {
    if (this.$route.path.includes('/apps/versionDetail/')) {
      return;
    }
    if (this.printTemplatesFilter.length > 1) {
      this.$set(item, 'delete', true);
      this.onPrintTemplatesChange();
    } else {
      this.$message.warning('打印模板至少存在1个！');
    }
  }

  // 生成一个名称
  getPrintTemplateName(type: 'add' | 'copy', name?: string) {
    const names = this.printTemplates.map((el) => el.name);
    if (type === 'add') {
      const numbers = names
        .map(
          (name) =>
            name.match(/(?<=打印模板（)\d+/) &&
            name.match(/(?<=打印模板（)\d+/)[0] * 1,
        )
        .filter((el) => el);
      if (numbers.length) {
        const maxNum = Math.max(...numbers);
        return `打印模板（${maxNum + 1}）`;
      } else {
        if (names.includes('打印模板')) {
          return '打印模板（1）';
        }
        return '打印模板';
      }
    } else if (type === 'copy') {
      const reg = new RegExp(`(?<=${name}（)\\d+`);
      const numbers = names
        .map((name) => name.match(reg) && name.match(reg)[0] * 1)
        .filter((el) => el);
      if (numbers.length) {
        const maxNum = Math.max(...numbers);
        return `${name}（${maxNum + 1}）`;
      } else {
        return `${name}（1）`;
      }
    } else {
      //Else Empty block statement
    }
  }

  // 返回一个唯一编码
  getPrintSheetCode() {
    return `${this.modalData.data.value.schemaCode}_print_${new Date()
      .getTime()
      .toString(36)}`;
  }

  async judgePrintCode(item) {
    const sheet = this.modalData.data.value;
    let printCode = item.sheetCode;
    const params: any = {
      name: item.name,
      code: item.sheetCode,
      icon: 'h-icon-all-operation-log-o',
      sheetType: '2',
      printIsPc: true,
      schemaCode: sheet.schemaCode,
    };
    if (!printCode) {
      // 创建打印记录
      await formApi.create(params);
      // 更新与表单的关联关系
      const updatePrints = [
        {
          name: params.name,
          sheetCode: params.code,
        },
      ];
      const json = JSON.stringify(updatePrints);
      sheet.printTemplateJson = json;
      await formApi.update({
        id: sheet.id,
        code: sheet.code,
        name: sheet.name,
        sheetType: sheet.sheetType,
        schemaCode: sheet.schemaCode,
        printTemplateJson: json,
      } as any);
      printCode = item.sheetCode;
    }
    // 获取模板信息
    // @ts-ignore
    const bizSchemaCode: string = this.$route.params.bizSchemaCode;
    let { data, errcode, errmsg } = await formApi.get(
      bizSchemaCode,
      printCode,
      item.copyCode,
    );
    if (errcode !== 0 && errcode !== 302024) {
      this.$message.error(errmsg);
    }
    if (!data) {
      data = {};
    }
    const version = data.draftAttributesJson && !data.printJson;
    return {
      printCode,
      version: version ? '0' : '1',
      copyCode: item.copyCode,
      formCode: sheet.code || this.$route.params.sheetCode,
      name: item.name,
    };
  }
}
</script>

<style lang="less" scoped>
.print {
  height: unset !important;
  position: relative;
  .plus {
    position: absolute;
    right: 42px;
    top: -33px;
    em {
      font-size: 11px !important;
      color: #111218 !important;
      cursor: pointer;
      &:hover {
        color: #2970ff !important;
      }
      &.disabled {
        color: #bebec0 !important;
        &:hover {
          color: #bebec0 !important;
          cursor: no-drop;
        }
      }
    }
  }
}
.item {
  display: flex !important;
  justify-content: space-between;
  height: 30px;
  line-height: 30px;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
  .ant-input {
    height: 30px;
    flex: 1;
  }
  .btns {
    margin-left: 10px;
    display: flex;
    justify-content: space-between;
    min-width: 56px;
    flex: 0;
    em {
      font-size: 13px;
      color: #9b9c9e !important;
      cursor: pointer;
      display: inline-block !important;
      &:hover {
        color: #2970ff !important;
      }
    }
  }
}
</style>

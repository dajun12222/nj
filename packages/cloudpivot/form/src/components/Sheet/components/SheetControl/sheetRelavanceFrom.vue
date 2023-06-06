<template>
  <div @click.stop="() => {}">
    <ASelect
      v-if="edit"
      v-model="selectedId"
      :style="{ width: '100%' }"
      allowClear
      :notFoundContent="fetching ? undefined : '无匹配结果'"
      placeholder="请选择"
      :mode="multiple ? 'multiple' : 'default'"
      @focus="onFocus"
      @blur="onBlur"
      @change="onChange"
    >
      <a-select-option v-for="item in drowdownList" :key="item.id">
        {{ item.title }}
      </a-select-option>
    </ASelect>
    <div v-else>
      <span
        v-for="item in showValue"
        :key="item.id"
        class="RelavanceCell"
        @click="openRelavanceURL(item.id)"
      >
        {{ item.title + ' ;' }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Select } from '@h3/antd-vue';

import { Component, Vue, Prop, Watch, Provide } from 'vue-property-decorator';

import { listApi, listParams, formApi, externalLinkApi } from 'cloudpivot/api';

import cloneDeep from 'lodash/cloneDeep';
@Component({
  name: 'SheetRelavanceFrom',
  components: {
    ASelect: Select,
  },
})
export default class SheetRelavanceFrom extends Vue {
  @Prop() control: any;

  @Prop({ default: false }) edit?: boolean;

  //单选还是多选
  @Prop({ default: false }) multiple?: boolean;

  list: any[] = []; //接口返回后的数据

  total: number = 0; //总数

  selectedId: any = undefined;

  isOpen: boolean = false;

  get getDisplayField() {
    return this.control.options.displayField || 'name';
  }

  get showValue() {
    const arr: any = [];
    const title =
      this.control.controller._value &&
      this.control.controller._value[this.getDisplayField].split(';');
    const id =
      (this.control.controller._value &&
        this.control.controller._value.id.split(';')) ||
      [];
    for (let j = 0; j < id.length; j++) {
      arr.push({
        title: title[j],
        id: id[j],
      });
    }
    return arr;
  }

  get drowdownList() {
    if (this.list.length) {
      const arr: any[] = [];
      for (const val of this.list) {
        if (
          val[this.getDisplayField] &&
          val[this.getDisplayField] !== null &&
          val[this.getDisplayField] !== ''
        ) {
          arr.push({
            id: val.id,
            title: val[this.getDisplayField],
          });
        }
      }
      return arr;
    } else {
      return [];
    }
  }

  openRelavanceURL(id) {
    const params = {
      bizObjectId: id,
      schemaCode: this.control.controller._value.schemaCode,
    };
    listApi.getFormUrl(params).then((res: any) => {
      window.open(res);
    });
  }

  onFocus() {
    this.search('');
  }

  onBlur() {
    /* this.isOpen = false; */
  }

  fetching: boolean = false;

  //搜索功能
  async search(value: string, page?: number) {
    if (!page) {
      page = 0;
    }
    if (this.fetching) {
      return;
    }
    this.fetching = true;
    await this.listSearch(
      this.control.options.schemaCode,
      this.control.options.queryCode,
    ).then(
      (seg) => {
        console.log(seg, 'seg-----------------------');
        this.list = seg.data || [];
        this.total = seg.total;
        this.fetching = false;
      },
      () => {
        this.fetching = false;
      },
    );
  }

  //请求接口数据并清洗过滤;
  async listSearch(schemaCode: string, queryCode: string, view?, page?) {
    const defaultView = {
      type: 'LIST',
    };
    const options = {
      customDisplayColumns: [this.getDisplayField],
      queryDisplayType: listParams.QueryDisplayType.Append,
    };
    const obj: any = {
      queryCode,
      schemaCode,
      mobile: false,
      page: page || 0,
      pageSize: 1000, //关联单选调用最多获取1000条数据
      display: false,
      filters: [],
      view: view || defaultView,
      options: options,
    };
    return listApi.getQueryList(obj).then((res) => {
      if (res.errcode === 0) {
        const data = res.data.content.map((x: any) => x.data);
        return {
          total: res.data.totalElements,
          data,
        };
      }
      return {
        total: 0,
        data: [],
      };
    });
  }

  getControlValue(id: any) {
    //单选id为字符串，多选为字符串数组
    if (!id || id.length === 0) {
      return null;
    }
    const list = cloneDeep(this.list);
    let obj: any = list[0] || {};
    if (this.multiple) {
      const idArr: any[] = [];
      const displayArr: any[] = [];
      list.map((item: any) => {
        if (id.indexOf(item.id) > -1) {
          idArr.push(item.id);
          displayArr.push((item as any)[this.getDisplayField]);
        }
      });
      obj.id = idArr.join(';');
      obj[this.getDisplayField] = displayArr.join(';');
      obj.displayCode = this.getDisplayField;
      obj.propertyType = 0;
      obj.schemaCode = this.control.options.schemaCode;
    } else {
      list.map((item: any) => {
        if (item.id === id) {
          obj = item;
        }
      });
      obj.displayCode = this.getDisplayField;
      obj.propertyType = 0;
      obj.schemaCode = this.control.options.schemaCode;
    }
    return obj;
  }

  onChange(e) {
    this.selectedId = e;
    this.control.controller._value = this.getControlValue(e);
    this.$emit('change', this.getControlValue(e));
  }

  getMultipleId() {
    if (this.control.controller._value.id) {
      //id如果为字符转拼接用这种
      return this.control.controller._value.id.split(';');
    } else if (Array.isArray(this.control.controller._value)) {
      //如果是数组形式
      return this.control.controller._value.map((item) => {
        return item.id;
      });
    } else {
      //Else Empty block statement
    }
  }

  mounted() {
    this.onFocus();
    if (this.control.controller._value) {
      this.selectedId = this.multiple
        ? this.getMultipleId()
        : this.control.controller._value.id;
    } else {
      this.selectedId = this.multiple ? [] : '';
    }
  }
}
</script>

<style lang="less" scoped>
.RelavanceCell {
  color: #107fff;
  &:hover {
    cursor: pointer;
  }
}
</style>

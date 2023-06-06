<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <div v-if="inputValue === '已设置'" class="txt-delete">
        <div class="txt">{{ inputValue }}</div>
        <em
          class="icon aufontAll h-icon-all-delete-o1"
          @click.stop="deleteAll"
        ></em>
      </div>
      <!-- <a-icon type="ellipsis" /> -->
      <em class="icon aufontAll h-icon-all-setting-o"></em>
    </div>
    <a-modal
      wrapClassName="property-bind-biz-method"
      width="850px"
      :visible="visible"
      okText="保存"
      cancelText="取消"
      @ok="handleOk"
      @cancel="modalHide"
    >
      <template slot="title">
        <div>绑定业务方法</div>
      </template>
      <div class="content">
        <div>
          <div class="server-methods">
            <a-row>
              <a-col :span="24" class="label-title"> 基础属性 </a-col>
            </a-row>
            <a-row class="base-type">
              <a-col :span="12">
                <span class="label-span">业务服务：</span>
                <a-select
                  v-model="serviceCode"
                  showSearch
                  optionFilterProp="label"
                  @change="selectService"
                >
                  <a-select-option
                    v-for="(item, i) in servicesList"
                    :key="i"
                    :value="item.code"
                    :disabled="item.disabled"
                    :label="item.name"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="12">
                <span class="label-span">业务方法：</span>
                <a-select
                  v-model="serviceMethodCode"
                  :disabled="disabledMethod"
                  @change="selectMethod"
                >
                  <a-select-option
                    v-for="(item, i) in methodList"
                    :key="i"
                    :value="item.code"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24" class="label-title"> 传入参数 </a-col>
            </a-row>

            <a-row>
              <mappingsList
                ref="inputparems"
                :columns="columns"
                :dataSource="inputMappings"
                :isBizMethod="isBizMethod"
                :isGetList="isGetList"
                :dataItems="dataItems"
                :listParamType="listParamType"
                :getInputConstList="getInputConstList"
                @dataSourceChange="
                  (val) => (inputMappings = JSON.parse(JSON.stringify(val)))
                "
              />
            </a-row>

            <a-row style="margin-top: 20px">
              <a-col :span="24" class="label-title"> 返回参数 </a-col>
            </a-row>

            <a-row>
              <mappingsList
                ref="inputparems"
                :columns="columns"
                :dataSource="outputMappings"
                :isBizMethod="isBizMethod"
                :isGetList="isGetList"
                :dataItems="dataItems"
                :listParamType="listParamType"
                :getInputConstList="getInputConstList"
                @dataSourceChange="
                  (val) => (outputMappings = JSON.parse(JSON.stringify(val)))
                "
              />
            </a-row>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import appsApi from '@/apis/apps'; // getDataItemList
import methodApi from '@/apis/biz-service/method.api'; // listMethodsByCode
import serviceApi from '@/apis/biz-service/service.api'; // listServices
import { dataItemTypeList } from '@/components/apps/model/dataitem-modals/dataitem-map';
import common from 'cloudpivot/common';
import { Col, DatePicker, Icon, Input, Modal, Row, Select } from '@h3/antd-vue';
import { PropertyComponent } from 'cloudpivot-designer/designer-core/property-panel';
import * as forms from 'cloudpivot-forms';
import { Component, Inject, Mixins, Prop, Watch } from 'vue-property-decorator';

const { getDataItemText } = common.utils.BusinessFunctions;

import mappingsList from './mappings-list.vue';

import { namespace } from 'vuex-class';
const MethodsModule = namespace('Integration/Methods');

@Component({
  name: 'propertyTimingTask',
  components: {
    ARangePicker: DatePicker.RangePicker,
    AIcon: Icon,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    AInput: Input,
    mappingsList,
  },
})
export default class propertyTimingTask extends Mixins(PropertyComponent) {
  @MethodsModule.Action('getTypes') getTypes: any;

  @Prop() actionType!: any;

  // 当前模型 数据项
  @Prop() dataItems!: any;

  @Inject()
  getController!: () => forms.FormGroup;

  columns: any[] = [
    {
      key: 'serviceMethodParameterCode',
      title: '参数',
    },
    {
      key: 'bizPropertyType',
      title: '参数类型',
      width: 120,
    },
    {
      key: 'codeType',
      title: '映射方式',
      width: 120,
    },
    {
      key: 'bizCode',
      title: '映射对象',
      width: 240,
    },
  ];

  get controller() {
    return this.getController();
  }

  @Prop() targetOjectCode!: string;

  @Prop() value!: any;

  visible: boolean = false;

  servicesList: BizService.Service.OptionItem[] = [];

  methodList: BizService.Method.Item[] = [];

  // 传入参数数据项列表（包含系统数据项）
  inputDataItemList: any[] = [];

  serviceCode: string = '';

  // 是否禁止操作业务方法
  disabledMethod: boolean = false;

  serviceMethodCode: string = '';

  inputMappings: BizMethod.CreateInputMapping[] = [];

  outputMappings: BizMethod.CreateOutputMapping[] = [];

  inputConstList: any[] = [
    {
      label: 'offset',
      value: 'offset',
      title: '查询起始位置（从0开始）',
    },
    {
      label: 'offset0',
      value: 'offset0',
      title: '查询起始位置（从0开始）',
    },
    {
      label: 'offset1',
      value: 'offset1',
      title: '查询起始位置（从1开始）',
    },
    {
      label: 'limit',
      value: 'limit',
      title: '查询数量（分页大小）',
    },
    {
      label: 'page',
      value: 'page',
      title: '查询页号（从0开始）',
    },
    {
      label: 'page0',
      value: 'page0',
      title: '查询页号（从0开始）',
    },
    {
      label: 'page1',
      value: 'page1',
      title: ' 查询页号（从1开始）',
    },
  ];

  outputConstList: any[] = [
    {
      label: 'total',
      value: 'total',
      title: '记录总数',
    },
    {
      label: 'list',
      value: 'list',
      title: '当前页记录列表',
    },
  ];

  codeTypes: any[] = [
    {
      label: '固定值',
      value: 0,
    },
    {
      label: '动态值',
      value: 1,
    },
  ];

  isBizMethod: boolean = false;

  isGetList: boolean = false;

  inputValue: string = '未设置';

  created() {
    if (this.value && this.value.serviceCode) {
      this.inputValue = '已设置';
    } else {
      this.inputValue = '未设置';
    }

    this.getParamTypeList();

    this.getTypes();
  }

  @Watch('value')
  onValueChange(val) {
    if (this.value && this.value.serviceCode) {
      this.inputValue = '已设置';
    } else {
      this.inputValue = '未设置';
    }
  }

  getItemName(item) {
    let dataItem = dataItemTypeList.find(
      (el) => el.index === item.bizPropertyType,
    );
    if (item.bizPropertyType === 20) {
      dataItem = {
        name: '对象id',
        disable: false,
        index: 20,
      };
    }
    return (dataItem && dataItem.name) || item.propertyName;
  }

  async initData() {
    if (this.actionType !== 'TimingTask') {
      this.isBizMethod = true;
      this.actionType === 'GetList' && (this.isGetList = true);
    }
    let value: any = this.value;

    //数据回写
    if (value && value.serviceCode) {
      value = JSON.parse(JSON.stringify(value));
      this.inputValue = '已设置';
      this.serviceCode = value.serviceCode;
      this.serviceMethodCode = value.serviceMethodCode;

      const res: any = await this.isHasAuthority();

      if (res.data) {
        this.isSelectableService(value.serviceName);
        this.isServiceMethodDisabled();
      } else {
        this.inputValue = '未设置';
        this.serviceCode = '';
        this.serviceMethodCode = '';
        return;
      }

      this.getMethodList(this.serviceCode, value, this.serviceMethodCode);
    }
  }

  /**
   * 判断已选业务服务是否存在
   */
  async isHasAuthority() {
    const res: any = await appsApi.getCode({ serviceCode: this.serviceCode });

    if (res.errcode !== 0) {
      return this.$message.error(res.errmsg);
    }

    return res;
  }

  /**
   * 判断是否要添加没有权限的业务服务到列表
   */
  isSelectableService(name: string) {
    const isPermission: boolean = this.servicesList.some(
      (item) => item.code === this.serviceCode,
    );

    if (!isPermission) {
      this.servicesList.unshift({
        code: this.serviceCode,
        id: this.serviceCode,
        modifiedTime: '',
        name: name,
        disabled: true,
      });
    }
  }

  /**
   * 是否允许操作业务方法
   */
  isServiceMethodDisabled() {
    const curService: any = this.servicesList.filter(
      (item) => item.code === this.serviceCode,
    );

    if (curService && curService[0] && curService[0].disabled) {
      this.disabledMethod = true;
    } else {
      this.disabledMethod = false;
    }
  }

  // 确定
  handleOk(): void {
    if (!this.serviceCode) {
      this.modalHide();
      this.inputValue = '未设置';
      return;
    }
    if (this.serviceCode && !this.serviceMethodCode) {
      this.$message.error('业务方法未选择');
      return;
    }
    const inputDataSourse: any = this.inputMappings.find((i) => {
      return i.bizCode === '' && i.externParameterType !== 1002;
    });
    if (inputDataSourse) {
      this.$message.error('映射对象未选择');
      return;
    }
    const outputDataSourse: any = this.outputMappings.find((i) => {
      return i.bizCode === '' && i.externParameterType !== 1002;
    });
    if (outputDataSourse) {
      this.$message.error('映射对象未选择');
      return;
    }
    this.emitChange(this.buildData());
    this.inputValue = '已设置';
    this.modalHide();
  }

  modalShow(): void {
    this.initData();
    this.visible = true;
  }

  modalHide(): void {
    // 清空数据
    this.serviceCode = '';
    this.serviceMethodCode = '';
    this.inputMappings = [];
    this.outputMappings = [];
    this.visible = false;
  }

  // 添加行
  addRows(): void {}

  //构建数据
  buildData() {
    const data: any = {};
    data.schemaCode = this.$route.params.bizSchemaCode;
    data.serviceCode = this.serviceCode;
    const serviceData: any = this.servicesList.find((s) => {
      return s.code === this.serviceCode;
    });
    data.serviceName = serviceData.name;
    data.serviceMethodCode = this.serviceMethodCode;
    const serviceMethodData: any = this.methodList.find((s) => {
      return s.code === this.serviceMethodCode;
    });
    data.serviceMethodName = serviceMethodData.name;
    data.methodCode = this.$route.params.appCode;
    data.inputMappings = this.inputMappings;
    data.outputMappings = this.outputMappings;

    data.outputMappings.forEach((item: any) => {
      if (item.bizCode) {
        const currentItem: any = this.dataItems.find(
          (el) => el.code === item.bizCode,
        );
        if (currentItem) {
          item.bizCodeName = currentItem.name;
        }
      }
    });

    data.inputMappings.forEach((item: any) => {
      if (item.bizCode && item.codeType === 1) {
        const currentItem: any = this.dataItems.find(
          (el) => el.code === item.bizCode,
        );
        if (currentItem) {
          item.bizCodeName = currentItem.name;
        }
      }
    });

    this.delParent(data.inputMappings);
    this.delParent(data.outputMappings);
    return data;
  }

  delParent(data) {
    data.forEach((item: any) => {
      delete item.parent;
      if (item.subParameters) {
        this.delParent(item.subParameters);
      }
    });
  }

  getOptions() {
    const schemaCode = this.$route.params.bizSchemaCode;
    Promise.all([
      serviceApi.listServices(),
      appsApi.getDataItemList({
        schemaCode: schemaCode,
      }),
    ]).then(([services, dataItems]) => {
      if (Array.isArray(services.data)) {
        this.servicesList = services.data;
      }
      // if (Array.isArray(dataItems.data)) {
      //   // 数据项过滤 系统数据项 部门查询编码、附件6、审批意见7
      //   // this.dataItemList = dataItems.data.filter((item: any) => ![6, 7].includes(item.propertyType) && item.code !== SystemDataItemCode.OwnerDeptQueryCode );
      //   // this.inputDataItemList = dataItems.data.filter((item: any) => ![6, 7].includes(item.propertyType));
      // }
    });
  }

  /**
   * 获取服务下的业务方法列表
   */
  getMethodList(serviceCode: string, data?: any, code?: string) {
    return methodApi.listMethodsByCode({ serviceCode }).then((res: any) => {
      if (Array.isArray(res.data)) {
        this.methodList = res.data;
        if (data) {
          this.selectMethod(code, data);
        }
      }
    });
  }

  /**
   * 选中业务方法
   */
  selectMethod(value: any, data?: any) {
    this.serviceMethodCode = value;
    const method: any = this.methodList.find(
      (item: any) => item.code === value,
    );
    if (method) {
      let inputSource: any[] = [];
      let outputSource: any[] = [];
      if (data) {
        inputSource = this.flatDataMappings(data.inputMappings);
        outputSource = this.flatDataMappings(data.outputMappings);
      }
      this.inputMappings = this.initialMappins(
        method.inputParametersJson,
        0,
        inputSource,
      );
      this.outputMappings = this.initialMappins(
        method.outputParametersJson,
        1,
        outputSource,
      );
    }
  }

  transforType(type: any) {
    if (typeof type !== 'number') {
      switch (type) {
        case 'CONST':
          return 0;
        case 'PROPERTY':
          return 1;
        default:
          break;
      }
    } else {
      return type;
    }
  }

  getBizValue(params: any) {
    //当为Property时
    if (
      params.source.codeType === 1 &&
      ![1001, 1002].includes(params.data.parentBizPropertyType)
    ) {
      const source: any = this.dataItems.find(
        (d: any) => d.code === params.source.bizCode,
      );
      if (!source) {
        params.data.bizCode = '';
        return;
      }
    }
    params.data.bizCode = params.source.bizCode;
  }

  /**
   * 过滤得出可选列表
   * @param filterDefault 是否仅筛选出系统数据项，否则筛选出表单数据项
   */
  getDataItems(list, record: any, filterDefault: boolean = false) {
    const selected: string[] = [];
    const bizCodeCount = {};
    list.forEach((item: any) => {
      if (item.codeType === 1 && item.index !== record.index) {
        selected.push(item.bizCode);
      }
      if (bizCodeCount[item.bizCode]) {
        bizCodeCount[item.bizCode] = bizCodeCount[item.bizCode] + 1;
      } else {
        bizCodeCount[item.bizCode] = 1;
      }
    });
    //数据项过滤 系统数据项部门查询编码、附件6、审批意见7
    const currentDataItems: any = this.dataItems.filter(
      (item: any) =>
        ![6, 7].includes(item.propertyType) &&
        item.code !== 'ownerDeptQueryCode',
    );
    if (filterDefault) {
      return currentDataItems.filter(
        (item: any) =>
          !selected.includes(item.code) &&
          item.defaultProperty &&
          item.propertyType === record.bizPropertyType,
      );
    }

    // 如果是日期或时间控件，允许重复选中，只能重复两次
    if (record.bizPropertyType === 2 || record.bizPropertyType === 3) {
      return currentDataItems.filter((item: any) => {
        return (
          item.propertyType === record.bizPropertyType &&
          !item.defaultProperty &&
          (bizCodeCount[item.code] < 2 || bizCodeCount[item.code] === undefined)
        );
      });
    }
    const res = currentDataItems.filter(
      (item: any) =>
        record.bizCode === item.code ||
        (!selected.includes(item.code) &&
          !item.defaultProperty &&
          ([0, 12, 13, 14, 15].includes(item.propertyType)
            ? [0, 12, 14].includes(item.propertyType)
              ? [0, 12, 14, 20].includes(record.bizPropertyType)
              : [13, 15].includes(record.bizPropertyType)
            : item.propertyType === record.bizPropertyType)),
    );
    return res;
  }

  flatDataMappings(data = []) {
    const res: any[] = [];
    const loop = function (data) {
      data.forEach((el) => {
        res.push(el);
        if (el.subParameters && el.subParameters.length) {
          loop(el.subParameters);
        }
      });
    };
    loop(data);
    return res;
  }

  /**
   * 初始化传入参数列表
   */
  initialMappins(
    mappingString: string,
    type: number,
    dataMappings: any,
    parentBizPropertyType?: number,
    parent?: any,
  ) {
    const mappings: any = JSON.parse(mappingString);
    if (mappings && mappings.length) {
      const mappingList: Array<any> = mappings.map(
        (item: BizService.Method.InputParam, index: number) => {
          const res = {
            index: index + 1,
            bizCode: '',
            codeType: type,
            serviceMethodParameterCode: item.code,
            propertyName: getDataItemText(item.bizPropertyType),
            bizPropertyType: item.bizPropertyType,
            externParameterType: item.externParameterType,
            subParameters: undefined,
            showChild: undefined,
            parentBizPropertyType,
            parent,
          };

          const source: any = dataMappings.find(
            (d: any) =>
              d.serviceMethodParameterCode === res.serviceMethodParameterCode,
          );

          if (source) {
            // 历史数据兼容
            const dataItem: any = this.dataItems.find(
              (x) => x.code === source.bizCode,
            );
            if (dataItem && ![1001, 1002].includes(item.externParameterType)) {
              res.propertyName = dataItem.name;
              res.bizPropertyType = dataItem.propertyType;
            }
            res.codeType = this.transforType(source.codeType);
            this.getBizValue({
              source: source,
              data: res,
            });
          }
          let parentType = parentBizPropertyType || item.bizPropertyType;
          if ([1001, 1002].includes(item.externParameterType)) {
            // 数组、对象
            parentType = item.externParameterType;
            if (item.externParameterType === 1001) {
              // 数组的映射方式只能是2
              res.codeType = 2;
            } else {
              // 对象的映射方式是3
              res.codeType = 3;
            }
            item.bizPropertyType = item.externParameterType;
          } else {
            if ([2, 3].includes(res.codeType)) {
              res.codeType = 1;
              res.bizCode = '';
            }
          }
          if (item.subParameters && item.subParameters.length) {
            res.subParameters = this.initialMappins(
              JSON.stringify(item.subParameters),
              type,
              dataMappings,
              parentType,
              res,
            );
            res.showChild = true;
          }
          return res;
        },
      );
      return mappingList;
    }
    return [];
  }

  getDataItemTextEx(code) {}

  //转换映射方式
  getCodeType(val) {
    let value: string = '';
    this.codeTypes.forEach((c) => {
      if (c.value === val) {
        value = c.label;
      }
    });
    return value;
  }

  codeTypeChange(val: any, item: any) {
    item.bizCode = '';
  }

  getInputConstList(item: any) {
    if (item.codeType === 0) {
      const arr: Array<any> = [];
      this.inputMappings.forEach((i: any) => {
        arr.push(i.bizCode);
      });
      return this.inputConstList.filter((c: any) => !arr.includes(c.value));
    }
  }

  // 改变业务服务
  selectService(value: any) {
    const curService: any = this.servicesList.filter(
      (item) => item.code === value,
    );

    if (curService && curService[0] && curService[0].disabled) {
      this.disabledMethod = true;
      return;
    } else {
      this.disabledMethod = false;
    }

    this.getMethodList(value);
    this.serviceCode = value;
    this.serviceMethodCode = '';
    this.inputMappings = [];
    this.outputMappings = [];
  }

  mounted() {
    this.getOptions();
  }

  listParamType: any[] = [];

  async getParamTypeList() {
    const res: any = await methodApi.listParamType();
    if (res.errcode === 0) {
      this.listParamType = res.data as any[];
    }
  }
}
</script>

<style lang="less">
.property-bind-biz-method {
  .content > .ant-row {
    margin-bottom: 25px;
  }
  .ant-modal-body {
    max-height: 500px;
    overflow-y: auto;
  }
  .flex_col {
    display: flex;
    align-items: center;
  }

  .filters {
    margin-top: 12px;
    /deep/.ant-row {
      padding: 3px 8px;
    }
    /deep/.ant-row > div {
      font-size: 12px;
      color: #111218;
      line-height: 20px;
    }
    .condition-row:hover {
      background: #eef4fd;
    }
  }
  .server-methods {
    /deep/.ant-row > div {
      font-size: 12px;
      color: #111218;
      line-height: 20px;
    }
    .label-title {
      color: #111218;
      font-size: 14px;
      font-weight: 600;
    }
  }
  .filters-title {
    margin-top: 16px;
    margin-bottom: 12px;
    font-weight: 500;
    color: rgba(0, 0, 0, 1);
  }
  .base-type {
    padding: 16px 0 20px 0;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 24px;
    .ant-col-12:last-of-type {
      position: relative;
      left: 10px;
    }
    .label-span {
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
    }
    .ant-select {
      margin-left: 16px;
      width: 305px;
    }
  }
  .biz-tips {
    display: block;
    font-size: 12px;
    color: rgba(17, 18, 24, 0.5);
  }
  .ant-row-flex {
    border-bottom: 1px solid #e9e9e9;
    .col {
      height: 38px;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
    }
  }

  .header > .col {
    font-weight: 500;
    background: #fafafa;
    color: #111218;
    margin-top: 16px;
  }

  .col {
    padding: 3px 16px;
    display: flex;
    align-items: center;
    .ant-select {
      width: 100%;
    }
  }
  .center {
    justify-content: center;
  }
  .select {
    padding: 3px 4px;
  }
}
.long-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<style lang="less" scoped></style>

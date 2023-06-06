<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="add-method">
    <section class="add-method__block">
      <div class="add-method__form">
        <h3 class="add-method__title">基本信息</h3>
        <div class="add-method__item">
          <span class="label-required">方法编码：</span>
          <p v-show="method">
            <!-- <template v-if="id">
              {{ form.code }}
            </template> -->
            <form-input
              v-model="form.code"
              :disabled="!!id || isOperation(service)"
              placeholder="请填写编码，例：bpmH3_01"
              :rules="rules.code"
            />
          </p>
        </div>
        <div class="add-method__item">
          <span class="label-required">方法名称：</span>
          <p>
            <form-input
              v-model="form.name"
              :disabled="isOperation(service)"
              placeholder="请填写"
              :rules="rules.name"
            />
          </p>
        </div>
      </div>

      <div class="add-method__form">
        <div class="add-method__title">属性名称</div>
        <div class="add-method__item">
          <span class="label-required">返回值类型</span>
          <p>
            <!--
              TODO: 添加返回值类型字段
            -->
            <a-select
              v-model="configs.returnType"
              :disabled="isOperation(service)"
              allowClear
            >
              <a-select-option
                v-for="key in Object.keys(returnTypes)"
                :key="key"
                :value="returnTypes[key]"
              >
                {{ key }}
              </a-select-option>
            </a-select>
          </p>
        </div>

        <div v-if="isSap(service)">
          <div
            class="add-method__item add-method__item--full add-method__item--top"
          >
            <span class="label-required">函数名：</span>
            <p>
              <form-input
                v-model="configs.functionName"
                :disabled="isOperation(service)"
                :maxLength="200"
                :rules="rules.functionName"
              />
            </p>
          </div>
          <div
            v-show="configs.returnType === returnTypes.SingleObject"
            class="add-method__item add-method__item--full add-method__item--top"
          >
            <span class="label-required">结构体：</span>
            <p>
              <form-input
                v-if="configs.returnType === returnTypes.SingleObject"
                v-model="configs.structName"
                :disabled="isOperation(service)"
                :maxLength="200"
                :rules="rules.structName"
              />
            </p>
          </div>
          <div
            v-show="configs.returnType === returnTypes.List"
            class="add-method__item add-method__item--full add-method__item--top"
          >
            <span class="label-required">表名：</span>
            <p>
              <form-input
                v-if="configs.returnType === returnTypes.List"
                v-model="configs.tableName"
                :disabled="isOperation(service)"
                :maxLength="200"
                :rules="rules.tableName"
              />
            </p>
          </div>
        </div>
        <div v-else>
          <div
            v-if="countSqlVisible"
            class="add-method__item add-method__item--full add-method__item--top"
          >
            <span class="label-required">Sql总记录数语句：</span>
            <p>
              <form-input
                v-model="configs.countSql"
                :disabled="isOperation(service)"
                :textarea="true"
                placeholder="eg: select count(1) as count from tablename where 1=1"
                :maxLength="2000"
                :autosize="{ minRows: 3, maxRows: 3 }"
                :rules="rules.countSql"
              />
            </p>
          </div>
          <div
            class="add-method__item add-method__item--full add-method__item--top"
          >
            <span class="label-required">Sql语句：</span>
            <p>
              <form-input
                v-model="configs.sql"
                :disabled="isOperation(service)"
                :textarea="true"
                :autosize="{ minRows: 3, maxRows: 3 }"
                :rules="rules.sql"
                @change="onSqlContentChange"
              />
            </p>
          </div>
        </div>
      </div>

      <!-- tab -->
      <a-tabs v-model="currentTab" class="user-tabs" @change="resetFormInput">
        <a-tab-pane key="input" tab="传入参数">
          <!-- 传入参数 -->
          <recursiveList
            ref="inputparems"
            :service="service"
            :columns="columns"
            :dataSource="inputParameters"
            :rules="rules"
            :isOperation="isOperation"
            :bizPropertyTypes="bizPropertyTypes"
            @dataSourceChange="
              (val) => (inputParameters = JSON.parse(JSON.stringify(val)))
            "
          />
        </a-tab-pane>
        <a-tab-pane key="output" tab="返回值">
          <!-- 返回值 -->
          <recursiveList
            ref="outputparems"
            :service="service"
            :columns="columns"
            :dataSource="outputParameters"
            :rules="rules"
            :isOperation="isOperation"
            :bizPropertyTypes="bizPropertyTypes"
            @dataSourceChange="
              (val) => (outputParameters = JSON.parse(JSON.stringify(val)))
            "
          />
        </a-tab-pane>
      </a-tabs>
    </section>
    <p
      v-if="
        (currentTab === 'input' && inputParameters.length === 0) ||
        (currentTab === 'output' && outputParameters.length === 0)
      "
      class="add-method__btn"
    >
      <span @click="addItem">
        <i class="icon aufontAll h-icon-all-plus-o"></i>
        <span>新增数据</span>
      </span>
    </p>
    <div class="add-method__footer">
      <template v-if="isOperation(service)">
        <a-button type="default" @click="$emit('close')"> 关闭 </a-button>
      </template>
      <template v-else>
        <a-button class="ant-btn-large" :loading="loading" @click="saveAndTest">
          保存并连接测试
        </a-button>
        <a-button type="primary" @click="() => save()"> 保存 </a-button>
      </template>
    </div>
    <!-- 底线 -->
    <div ref="footLine" class="add-method__blank"></div>
  </div>
</template>
<script lang="ts">
import serviceApi from '@/apis/biz-service/service.api';
import { nameValidator, pattern } from '@/common/utils';
import FormInput from '@/components/global/form-input/index.vue';
import sqlParser from '@/utils/sql-parser';
import { Button, DatePicker, Input, Select, Table, Tabs } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import recursiveList from './../recursive-list.vue';

const MethodsModule = namespace('Integration/Methods');
const UserModule = namespace('System/User');
@Component({
  name: 'add-method',
  components: {
    recursiveList,
    FormInput,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ATable: Table,
    AInput: Input,
    ADatePicker: DatePicker,
    ATextarea: Input.TextArea,
    AButton: Button,
  },
})
export default class AddMethod extends Vue {
  @MethodsModule.State('paramTypes') paramTypes: any;

  @MethodsModule.Action('createMethod') createMethod: any;

  @MethodsModule.Action('updateMethod') updateMethod: any;

  @Prop() method!: any;

  @Prop() service!: any;

  @Prop() currentAdapterType!: number;

  @UserModule.State('isJustAdmin') isJustAdmin!: boolean;

  @UserModule.State('loginedUserInfo') loginedUserInfo!: any;

  /**
   * 按钮操作权限
   */
  isOperation(e: any): boolean {
    if (!e || !Object.keys(e).length) {
      return false;
    }
    if (
      this.isJustAdmin ||
      e.createdBy === this.loginedUserInfo.id ||
      this.loginedUserInfo.permissions.includes('SYS_MNG')
    ) {
      // 历史数据不做处理 admin账号、方法创建人不做处理
      return false;
    } else {
      return true;
    }
  }

  // 当前切换到的tab面板，input：传入参数 output：返回值
  currentTab: string = 'input';

  id: string = '';

  loading: boolean = false;

  adapterType: number | undefined = undefined;

  form: BizService.Method.CreateParams = {
    code: '',
    adapterType: undefined,
    configJson: '',
    description: '',
    inputParametersJson: '',
    name: '',
    outputParametersJson: '',
    serviceCode: '',
  };

  // 返回值类型
  returnTypes: any = {
    Void: 'Void',
    SingleObject: 'SingleObject',
    List: 'List',
  };

  configs: BizService.Method.SqlMethodConfig = {
    sql: '',
    countSql: '',
    returnType: this.returnTypes.Void,
    functionName: '',
    structName: '',
    tableName: '',
  };

  inputParameters: BizService.Method.InputParam[] = [];

  outputParameters: BizService.Method.OutputParam[] = [];

  columns: Array<Common.TableHead> = [
    // {
    //   dataIndex: 'index',
    //   slots: { title: 'indexTitle' },
    //   key: 'index',
    //   width: 78,
    //   align: 'center',
    // },
    {
      dataIndex: 'code',
      slots: { title: 'codeTitle' },
      scopedSlots: { customRender: 'code' },
      key: 'code',
      // width: 150,
      title: '参数名称',
    },
    {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      scopedSlots: { customRender: 'name' },
      key: 'name',
      width: 134,
      title: '显示名称',
    },
    {
      dataIndex: 'bizPropertyType',
      slots: { title: 'bizPropertyTypeTitle' },
      scopedSlots: { customRender: 'bizPropertyType' },
      key: 'bizPropertyType',
      width: 120,
      title: '参数类型',
    },
    {
      dataIndex: 'description',
      slots: { title: 'descriptionTitle' },
      scopedSlots: { customRender: 'description' },
      key: 'description',
      width: 120,
      title: '描述',
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      key: 'action',
      width: 64,
      align: 'right',
      title: '操作',
    },
  ];

  outputColumns: Array<Common.TableHead> = this.columns.filter(
    (item: Common.TableHead) => item.key !== 'position',
  );

  // 规则
  rules: any = {
    code: [
      {
        required: true,
        message: '请填写方法编码',
      },
      {
        pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,60}$/,
        message: '以字母开头,包括字母或下划线或数字,不超过60个字符',
      },
    ],
    name: [
      {
        required: true,
        message: '请填写方法名称',
      },
      {
        validator: nameValidator,
        message: '不能以空格开头,50字以内',
      },
    ],
    value: [
      {
        required: true,
        message: '请填写内容',
      },
      {
        validator: nameValidator,
        message: '不能以空格开头,50字以内',
      },
    ],
    description: [
      {
        validator: nameValidator,
        message: '不能以空格开头,50字以内',
      },
    ],
    sql: [
      {
        required: true,
        message: '请填写Sql语句',
      },
    ],
    functionName: [
      {
        required: true,
        message: '请填写函数名称',
      },
    ],
    structName: [
      {
        required: true,
        message: '请填写结构体',
      },
    ],
    tableName: [
      {
        required: true,
        message: '请填写数据库表名',
      },
    ],
    returnType: [
      {
        required: true,
        message: '请选择返回值类型',
      },
    ],
    countSql: [
      {
        required: true,
        message: '请填写Sql总记录数语句',
      },
    ],
  };

  // 枚举信息： 选人控件5、附件6、子表8
  enums: any = {
    longText: 1,
    xuanrenkongjian: 5,
    attachment: 6,
    zibiao: 8,
    StaffMulti: 51, // 人员多选
    DeptSingle: 60, // 部门单选
    DeptMulti: 61, // 部门单选
    StaffSingle: 50, // 人员单选
    StaffDeptMix: 5, // 混合选人
  };

  get countSqlVisible() {
    return (
      this.configs.returnType !== this.returnTypes.Void &&
      this.configs.returnType !== this.returnTypes.SingleObject
    );
  }

  get bizPropertyTypes() {
    const {
      xuanrenkongjian,
      zibiao,
      attachment,
      StaffMulti,
      DeptSingle,
      DeptMulti,
      StaffSingle,
      StaffDeptMix,
      longText,
    } = this.enums;
    /* 参数类型不可选：附件 */
    return this.paramTypes.filter(
      (item: any) =>
        ![attachment].includes(item.value) &&
        ![1001, 1002].includes(item.value),
    );
  }

  isSap(record: BizService.Service.Item) {
    return record ? /^sap/i.test(record.adapterCode) : false;
  }

  /**
   * 删除条目
   */
  popItem(record: any) {
    if (this.currentTab === 'input') {
      const inputParameters: BizService.Method.InputParam[] =
        this.inputParameters
          .filter((item: any) => item.sortKey !== record.sortKey)
          .map((item: any, index: number) => {
            item.index = index + 1;
            return item;
          });
      this.inputParameters = inputParameters;
    } else {
      const outputParameters: BizService.Method.OutputParam[] =
        this.outputParameters
          .filter((item: any) => item.sortKey !== record.sortKey)
          .map((item: any, index: number) => {
            item.index = index + 1;
            return item;
          });
      this.outputParameters = outputParameters;
    }
  }

  /**
   * 添加条目
   */
  addItem() {
    const item: BizService.Method.InputParam = {
      code: '',
      name: '',
      bizPropertyType: 0,
      description: '',
      index: -1,
      sortKey: Date.now().toString(),
    };
    if (this.currentTab === 'input') {
      item.index = this.inputParameters.length + 1;
      this.inputParameters.push(item);
    } else {
      item.index = this.outputParameters.length + 1;
      this.outputParameters.push(item);
    }
    this.$nextTick(() => {
      // 新建按钮滚动至可视区域
      const dom: any = this.$refs.footLine;
      dom.scrollIntoView();
      // 表格内部滚动至底部
      try {
        const aTable: any =
          this.currentTab === 'input'
            ? this.$refs.argTable
            : this.$refs.resultTable;
        const table: any =
          aTable.$el.getElementsByClassName('ant-table-body')[0];
        table.scrollTop = table.scrollHeight;
      } catch (error) {
        console.log(error);
      }
    });
  }

  /**
   * 校验表单填写内容
   */
  validateForm() {
    return new Promise<void>((resolve, reject) => {
      let hasError: boolean = false;
      let list: any[] = [];
      if (this.currentTab === 'input') {
        Object.entries(this.$refs).forEach(([key, value]) => {
          if (value && /^form-input-arg/.test(key)) {
            list.push(this.$refs[key]);
          }
        });
        // 校验传入参数
        list = [...list, ...(this.$refs.inputparems as any).validateForm()];
      } else {
        Object.entries(this.$refs).forEach(([key, value]) => {
          if (value && /^form-input-res/.test(key)) {
            list.push(this.$refs[key]);
          }
        });
        // 校验传入参数
        list = [...list, ...(this.$refs.outputparems as any).validateForm()];
      }
      const inputs: any[] = this.$vnode.componentInstance
        ? this.$vnode.componentInstance.$children.filter((el: any) =>
            el.$el.className.includes('form-input'),
          )
        : [];
      list.push(...inputs);
      list.forEach((node: any) => {
        const unValidated: boolean = node.validateValue({
          target: { value: node.content },
        });
        if (unValidated) {
          hasError = true;
        }
      });

      if (hasError) {
        reject(new Error('validate failed'));
      } else {
        resolve();
      }
    });
  }

  resetFormInput() {
    const list: any[] = [];
    if (this.currentTab !== 'input') {
      Object.entries(this.$refs).forEach(([key, value]) => {
        if (value && /^form-input-arg/.test(key)) {
          list.push(this.$refs[key]);
        }
      });
    } else {
      Object.entries(this.$refs).forEach(([key, value]) => {
        if (value && /^form-input-res/.test(key)) {
          list.push(this.$refs[key]);
        }
      });
    }
    list.forEach((node: any) => {
      node.reset();
    });
  }

  formatParams(params: any[]) {
    return params.map((param: any) => {
      const {
        code,
        name,
        configJson,
        bizPropertyType,
        description,
        subParameters,
      } = param;
      const res = {
        code,
        name,
        configJson,
        bizPropertyType,
        description,
        subParameters,
        externParameterType: 0,
      };

      // 数组和对象不需要 bizPropertyType
      if (bizPropertyType > 1000) {
        res.externParameterType = res.bizPropertyType;
        delete res.bizPropertyType;
      }

      if (subParameters) {
        res.subParameters = this.formatParams(subParameters);
      }

      return res;
    });
  }

  /**
   * 保存方法
   * @param callback 保存后回调
   */
  save(callback?: Function) {
    // 校验
    if (!this.configs.returnType) {
      this.configs.returnType = this.returnTypes.Void;
    }
    // 校验表单
    this.validateForm()
      .then(async () => {
        if (/sap/i.test(this.service.adapterCode)) {
          delete this.configs.sql;
          delete this.configs.countSql;
        } else {
          delete this.configs.functionName;
          delete this.configs.structName;
          delete this.configs.tableName;
        }
        this.form.configJson = JSON.stringify(this.configs);

        this.form.inputParametersJson = JSON.stringify(
          this.formatParams(this.inputParameters),
        );
        this.form.outputParametersJson = JSON.stringify(
          this.formatParams(this.outputParameters),
        );
        let res: any = null;
        if (this.id) {
          res = await this.updateMethod({
            ...this.form,
            id: this.id,
          });
        } else {
          res = await this.createMethod(this.form);
        }
        if (res && res.errcode === 0) {
          /**
           * 如果为更新，则检查是否有关联业务方法并提示手动更新 2019-06-20
           */
          this.$message.success('保存成功');
          let bindCount: number = 0;
          if (this.id) {
            bindCount = await this.checkBindStatusAndAlert();
          }
          /**
           * 新建后返回的数据重新初始化到界面，以便再次编辑
           */
          if (res.data) {
            this.initialData(res.data);
          }
          console.log(bindCount, 'bindCount');
          if (callback) {
            callback();
          } else {
            this.$emit('submit', bindCount);
          }
        } else {
          const errmsg = res.errcode === 500105 ? '方法编码重复' : res.errmsg;
          this.$message.error(errmsg);
          this.loading = false;
        }
      })
      .catch((err) => {
        console.log(err);
        this.loading = false;
      });
  }

  checkBindStatusAndAlert() {
    console.log('check bind status');
    return serviceApi
      .getServiceBizBindInfo({
        serviceCode: this.service.code,
        serviceMethodCode: this.method.code,
      })
      .then((res: any) => {
        console.log('check result:', res);
        if (res.errcode === 0 && res.data) {
          return res.data;
        }
      });
  }

  /**
   * 保存并测试连接
   */
  saveAndTest() {
    this.loading = true;
    this.save(() => {
      const value: any = {
        ...this.form,
        adapterType: this.adapterType || this.currentAdapterType,
      };
      this.$emit('test', value);
      this.loading = false;
    });
  }

  /**
   * 解析编辑时带入的方法数据
   */
  parseJson(jsonString: string, argName: string) {
    try {
      this.$set(this, argName, JSON.parse(jsonString));
    } catch (error) {
      console.log(error);
    }
  }

  parserSqlTask: any = null;

  onSqlContentChange() {
    clearTimeout(this.parserSqlTask);
    this.parserSqlTask = setTimeout(() => {
      this.parserSqlContent();
    }, 500);
  }

  /**
   * 解析sql语句，提取入参
   */
  parserSqlContent() {
    const res = sqlParser(this.configs.sql);
    const { inputParams } = res;
    // 将入参自动更新到当前入参列表
    if (Array.isArray(inputParams) && inputParams.length) {
      this.updateParamListByCodes(inputParams, 'inputParameters');
    }
  }

  /**
   * 通过解析到的code列表重置 传入/返回 参数列表
   */
  updateParamListByCodes(codes: Array<string>, dataKey: string) {
    const targetList = this[dataKey];
    const paramsList = codes.map((code: string, idx: number) => {
      const existItem = targetList.find(
        (param: BizService.Method.InputParam) => param.code === code,
      );
      const index = idx + 1;
      if (existItem) {
        return {
          ...existItem,
          index,
        };
      } else {
        return {
          code,
          name: code,
          bizPropertyType: 0,
          description: '',
          index,
          sortKey: Date.now().toString() + idx,
        };
      }
    });
    this.$set(this, dataKey, paramsList);
  }

  /**
   * 初始化数据
   */
  initialData(data: BizService.Method.Item) {
    Object.keys(this.form).forEach((key: string) => {
      this.$set(this.form, key, (data as any)[key] || '');
    });
    this.parseJson(data.configJson, 'configs');
    this.parseJson(data.inputParametersJson, 'inputParameters');
    this.parseJson(data.outputParametersJson, 'outputParameters');
    if (this.inputParameters.length) {
      this.initParameters(this.inputParameters);
    }
    if (this.outputParameters.length) {
      this.initParameters(this.outputParameters);
    }
    this.id = data.id;
    this.adapterType = data.adapterType || this.currentAdapterType;
  }

  initParameters(parameters, parentBizPropertyType?: number) {
    parameters.forEach((item: any, index: number) => {
      item.index = index + 1;
      item.sortKey = Date.now().toString() + index;

      // 数据回显如果时数组/对象type需要1000：因为为了避免类型选择中的值重复，在store中加了1000
      if ([1001, 1002].includes(item.externParameterType)) {
        item.bizPropertyType = item.externParameterType;
      }

      // 父级参数类型，用于限制 参数类型是数组时子级不能是数组、对象
      if (parentBizPropertyType !== undefined) {
        item.parentBizPropertyType = parentBizPropertyType;
      }

      if (item.subParameters) {
        this.initParameters(item.subParameters, item.bizPropertyType);
      }
    });
  }

  mounted() {
    if (this.method && this.method.id) {
      this.initialData(this.method);
      if (!this.configs.returnType) {
        this.configs.returnType = this.returnTypes.Void;
      }
    }
    this.form.serviceCode = this.service.code;
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/tab.less';
.sql_param_not_data /deep/ .ant-table-tbody .ant-table-row {
  height: 70px;
}

.add-method {
  padding-bottom: 32px;
  &__title {
    font-weight: 600;
  }
  &__form {
    padding-bottom: 24px;
    &:not(:only-child) {
      &:not(:first-child) {
        padding-top: 24px;
        border-top: 1px solid #e8e8e8;
      }
    }
  }
  &__item {
    display: flex;
    align-items: center;
    margin-top: 20px;
    color: rgba(17, 18, 24, 0.5);
    &--full {
      > p {
        flex: 1;
      }
    }
    &--top {
      align-items: flex-start;
    }
    > span {
      display: inline-block;
      width: 130px;
      margin-right: 5px;
    }
    > p {
      flex: 1;
      width: 306px;
    }
    /deep/.ant-select {
      width: 100%;
    }
  }
  &__footer {
    position: absolute;
    z-index: 9;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 16px;
    border-top: 1px solid #e8e8e8;
    text-align: center;
    background: #fff;
    button:not(:last-child) {
      margin-right: 8px;
      color: rgba(17, 18, 24, 0.5);
    }
  }
  &__btn {
    padding: 14px 0;
    background-color: #fff;
    text-align: center;
    user-select: none;
    span {
      display: inline-block;
      cursor: pointer;
    }
    i {
      margin-right: 9px;
      font-size: 12px;
    }
    color: @primary-color;
  }
  &__table {
    // /deep/.ant-table-thead span {
    //   display: block;
    //   height: 22px;
    //   line-height: 22px;
    //   font-weight: 600;
    //   color: rgba(0,0,0,0.65);
    // }
    /deep/.ant-select {
      width: 100%;
    }
    /deep/.ant-table-body {
      color: #111218;
      max-height: inherit !important;
    }
    /deep/.ant-table-footer {
      padding: 0;
      background: none;
    }
    /deep/.ant-table-placeholder {
      display: none;
    }
  }
  /deep/.ant-tabs {
    color: rgba(17, 18, 24, 0.5);
  }
}
</style>

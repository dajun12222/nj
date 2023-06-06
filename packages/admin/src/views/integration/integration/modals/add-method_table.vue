<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="add-method">
    <h3 class="add-method__title">基本信息</h3>
    <section class="add-method__block">
      <div class="add-method__form">
        <div class="add-method__item">
          <span class="label-required">实体表：</span>
          <p>
            <a-select
              v-model="currentDataTable"
              showSearch
              allowClear
              :options="datatables"
              @focus="onFocus"
              @select="onSelectTable"
              @search="onSearch"
              @change="onSearch"
              @popupScroll="popupScroll"
            />
          </p>
        </div>
      </div>
      <!-- 切换页签 -->
      <a-tabs v-model="currentMethodTab">
        <a-tab-pane
          v-for="(item, index) in methodForms"
          :key="item.methodCode"
          :tab="item.methodCode"
        >
          <div class="add-method__form">
            <div class="add-method__item">
              <span class="label-required">方法编码：</span>
              <p v-show="method">
                <form-input
                  v-model="item.form.code"
                  placeholder="请填写编码，例：bpmH3_01"
                  :rules="rules.code"
                />
              </p>
            </div>
            <div class="add-method__item">
              <span class="label-required">方法名称：</span>
              <p>
                <form-input
                  v-model="item.form.name"
                  placeholder="请填写"
                  :rules="rules.name"
                />
              </p>
            </div>
            <div
              class="add-method__item add-method__item--full add-method__item--top"
            >
              <span class="label-required">SelectSql：</span>
              <p>
                <form-input
                  v-model="item.configs.sql"
                  :textarea="true"
                  :maxLength="20000"
                  :autosize="{ minRows: 3, maxRows: 3 }"
                  :rules="rules.sql"
                  @change="onSqlContentChange(item)"
                />
              </p>
            </div>
            <div class="add-method__item">
              <span class="label-required">返回值类型</span>
              <p>
                <!-- 
              TODO: 添加返回值类型字段
                -->
                <a-select
                  v-model="item.configs.returnType"
                  showSearch
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
          </div>
          <!-- 入参出参 -->
          <a-tabs v-model="item.currentParamTab" @change="resetFormInput(item)">
            <a-tab-pane key="input" tab="传入参数">
              <!-- 传入参数 -->
              <recursiveList
                :ref="'inputparems_' + index"
                :service="service"
                :columns="columns"
                :dataSource="item.inputParameters"
                :rules="rules"
                :isOperation="isOperation"
                :bizPropertyTypes="bizPropertyTypes"
                @dataSourceChange="
                  (val) =>
                    (item.inputParameters = JSON.parse(JSON.stringify(val)))
                "
              />
            </a-tab-pane>
            <a-tab-pane key="output" tab="返回值">
              <!-- 返回值 -->
              <recursiveList
                :ref="'outputparems_' + index"
                :service="service"
                :columns="columns"
                :dataSource="item.outputParameters"
                :rules="rules"
                :isOperation="isOperation"
                :bizPropertyTypes="bizPropertyTypes"
                @dataSourceChange="
                  (val) =>
                    (item.outputParameters = JSON.parse(JSON.stringify(val)))
                "
              />
            </a-tab-pane>
          </a-tabs>
          <!-- 新增一行 -->
          <!-- <p v-show="currentMethodTab" class="add-method__btn">
            <span @click="addItem(item)">
              <i class="icon aufontAll h-icon-all-plus-o"></i>
              <span>新增数据</span>
            </span>
          </p> -->

          <template
            v-if="
              (item.currentParamTab === 'input' &&
                item.inputParameters.length === 0) ||
              (item.currentParamTab === 'output' &&
                item.outputParameters.length === 0)
            "
          >
            <p v-show="currentMethodTab" class="add-method__btn">
              <span @click="addItem(item)">
                <i class="icon aufontAll h-icon-all-plus-o"></i>
                <span>新增数据</span>
              </span>
            </p>
          </template>
        </a-tab-pane>
      </a-tabs>
    </section>

    <div class="add-method__footer">
      <template v-if="isOperation(service)">
        <a-button type="default" @click="$emit('close')"> 关闭 </a-button>
      </template>
      <template v-else>
        <a-button
          type="primary"
          :disabled="!currentDataTable || !methodForms.length"
          @click="save"
        >
          保存
        </a-button>
      </template>
    </div>
    <!-- 底线 -->
    <div ref="footLine" class="add-method__blank"></div>
  </div>
</template>
<script lang="ts">
import methodApi from '@/apis/biz-service/method.api';
import { nameValidator, pattern } from '@/common/utils';
import FormInput from '@/components/global/form-input/index.vue';
import sqlParser from '@/utils/sql-parser';
import { Button, DatePicker, Input, Select, Table, Tabs } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

import recursiveList from './../recursive-list.vue';

const MethodsModule = namespace('Integration/Methods');
const UserModule = namespace('System/User');
interface createMethodItem {
  methodCode: string;
  form: BizService.Method.CreateParams;
  configs: BizService.Method.SqlMethodConfig;
  inputParameters: BizService.Method.InputParam[];
  outputParameters: BizService.Method.OutputParam[];
  // 当前切换到的tab面板，input：传入参数 output：返回值
  currentParamTab: string;
}

@Component({
  name: 'add-method',
  components: {
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
    recursiveList,
  },
})
export default class AddMethod extends Vue {
  @MethodsModule.State('paramTypes') paramTypes: any;

  @Prop() method!: any;

  @Prop() service!: any;

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

  // 规则
  rules: any = {
    code: [
      {
        required: true,
        message: '请填写方法编码',
      },
      {
        pattern: pattern('tablecode'),
        message:
          '以字母开头,包括字母或下划线或数字，不超过40个字符，不包含空格',
      },
    ],
    name: [
      {
        required: true,
        message: '请填写方法名称',
      },
      {
        validator: nameValidator,
        message: '仅限50个字符以内，并不能以空格开头',
      },
    ],
    value: [
      {
        required: true,
        message: '请填写内容',
      },
      {
        validator: nameValidator,
        message: '仅限50个字符以内，并不能以空格开头',
      },
    ],
    description: [
      {
        validator: nameValidator,
        message: '仅限50个字符以内，并不能以空格开头',
      },
    ],
    sql: [
      {
        required: true,
        message: '请填写Sql语句',
      },
    ],
    returnType: [
      {
        required: true,
        message: '请选择返回值类型',
      },
    ],
  };

  // 返回值类型
  returnTypes: any = {
    Void: 'Void',
    SingleObject: 'SingleObject',
    List: 'List',
  };

  // 服务下绑定的数据库的所有数据表
  datatables: Array<any> = [];

  // 当前选中的实体表
  currentDataTable: string = '';

  // 当前数据表下选中的方法
  currentMethodTab: string = '';

  alldatatables: Array<any> = [];

  list: Array<any> = [];

  searchTimeoutRef: any = null;

  page = 1;

  loadedAll = false; // 全部数据加载完成

  fetching = false;

  currentSeachValue: string = '';

  // 当前实体表下的所有集成方法信息
  methodForms: Array<createMethodItem> = [];

  // 枚举信息： 选人控件5、附件6、子表8
  disabledDataTypes: any = {
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

  /* 参数类型不可选：附件 */
  get bizPropertyTypes() {
    const { attachment, zibiao, longText } = this.disabledDataTypes;
    return this.paramTypes.filter(
      (item: any) =>
        ![attachment, zibiao, longText].includes(item.value) &&
        !['List', 'Object'].includes(item.type),
    );
  }

  mounted() {
    // this.getAllDataTables();
  }

  /**
   * 获取实体表列表
   */
  async getAllDataTables() {
    const params: BizService.Method.ListDatatableParams = {
      serviceCode: this.service.code,
    };
    await methodApi.listDataTable(params).then((res: Common.Data) => {
      if (res.errcode === 0) {
        if (!Array.isArray(res.data)) {
          return this.$message.error('接口返回数据类型错误：不是数组！');
        }
        this.alldatatables = res.data;
        console.log(this.alldatatables);
      } else {
        const msg: string = res.errmsg || '请求接口出错！';
        this.$message.error(msg);
      }
    });
  }

  getDataTables() {
    if (this.list.length) {
      this.datatables = this.list.map((item: any) => ({
        label: item,
        value: item,
        payload: null, // 携带的默认信息
      }));
    } else {
      this.datatables = [];
    }
  }

  onFocus() {
    this.search('');
  }

  popupScroll($ev) {
    if (
      $ev.target.scrollHeight <
      $ev.target.offsetHeight + $ev.target.scrollTop + 64
    ) {
      // 滚动到底||加载全部数据
      if (this.fetching || this.loadedAll) {
        return;
      }
      this.page++;
      this.search(this.currentSeachValue, this.page);
    }
  }

  async search(value: string, page?: number) {
    console.log(value, '-------------value');
    console.log(page, '-----------------page');
    if (!page || page <= 1) {
      this.page = 1;
    }
    this.currentSeachValue = value;
    if (this.fetching) {
      return;
    }
    this.fetching = true;
    // this.list = [];
    const seg = await this.fetch(page === undefined ? 1 : page, 100, value);
    this.fetching = false;
    if (page && page > 1) {
      this.list = [...this.list, ...seg.data];
    } else {
      this.list = seg.data;
    }
    this.loadedAll = seg.total;
    this.fetching = false;

    this.getDataTables();
  }

  onSearch(value: string) {
    console.log(value);
    if (!value) {
      this.methodForms = [];
      this.currentMethodTab = '';
    } else {
      this.list = [];
      this.search(value);
    }
  }

  async fetch(page: number, pageSize: number, value: string) {
    let load = false;
    // const fetchList: any = this.alldatatables.filter( item => new RegExp(value).test(item))
    // const resList:any = fetchList.slice(page*pageSize,(page+1)*pageSize);
    let resList: Array<any> = [];

    const params: any = {
      serviceCode: this.service.code,
      page: page,
      size: pageSize,
      keyword: value,
    };
    await methodApi.listDataTable(params).then((res: Common.Data) => {
      if (res.errcode === 0) {
        if (!Array.isArray(res.data)) {
          return this.$message.error('接口返回数据类型错误：不是数组！');
        }
        resList = res.data;
        if (resList.length < pageSize) {
          load = true;
        }
        console.log(resList);
      } else {
        const msg: string = res.errmsg || '请求接口出错！';
        this.$message.error(msg);
      }
    });

    // if((page+1)*pageSize >= fetchList.length){
    //   load = true;
    // }

    return {
      data: resList,
      total: load,
    };
  }

  /**
   * 选中实体表，选中后需要请求实体表的字段，进行默认方法复制
   *
   */
  onSelectTable(tableCode: string) {
    this.methodForms = [];
    this.currentMethodTab = '';

    const tableItem = this.datatables.find(
      (item: any) => item.value === tableCode,
    );

    if (tableItem.payload) {
      this.storeTableColumns(tableItem.payload);
    } else {
      this.getTableColumns(tableCode);
    }
  }

  /**
   * 监听值的变化，如果为空就清除方法默认值
   */
  onSearchTable(value: string) {
    console.log(value);
    if (!value) {
      this.methodForms = [];
      this.currentMethodTab = '';
    }
  }

  /**
   * 获取实体表的字段，并存入表单信息
   */
  getTableColumns(tableCode: string) {
    // 获取实体表的方法
    const params: BizService.Method.ListDatatableColumnParams = {
      serviceCode: this.service.code,
      tableName: tableCode,
    };
    methodApi.listDataTableColumns(params).then((res: Common.Data) => {
      if (res.errcode === 0) {
        if (!Array.isArray(res.data)) {
          return this.$message.error('接口返回数据类型错误：不是数组！');
        }
        // 处理拿到的返回信息
        // 存储到实体表列表中的对应项，避免频繁请求，请求一次即存储复用
        this.datatables.some((table: any, idx: number) => {
          if (table.value === this.currentDataTable) {
            this.$set(this.datatables, idx, {
              ...table,
              payload: res.data,
            });
            return true;
          }
          return false;
        });
        this.storeTableColumns(res.data);
      } else {
        const msg: string = res.errmsg || '请求接口出错！';
        this.$message.error(msg);
      }
    });
  }

  /**
   * 存储当前选中实体表的列信息，并传入到绑定信息中
   */
  storeTableColumns(payload: Array<BizService.Method.DatatableColumn>) {
    this.methodForms = [];
    this.currentMethodTab = '';
    if (!Array.isArray(payload) || !payload.length) {
      return;
    }
    // 罗列其中的方法列表，取出
    payload.forEach((item: BizService.Method.DatatableColumn, idx: number) => {
      const isSelect: boolean = /select/i.test(item.sqlType);
      // 新的实体表方法设置信息
      const key: string = `${this.currentDataTable}_${item.sqlType}_${idx + 1}`;
      const configs: BizService.Method.SqlMethodConfig = {
        sql: item.sql,
        countSql: '',
        sqlType: item.sqlType,
        dataTable: this.currentDataTable,
        returnType: isSelect ? this.returnTypes.List : this.returnTypes.Void,
      };
      const form: BizService.Method.CreateParams = {
        code: key,
        name: key,
        configJson: JSON.stringify(configs),
        description: '',
        inputParametersJson: '',
        outputParametersJson: '',
        serviceCode: this.service.code,
      };
      // 主动解析一次sql语句，提取传入参数
      const sqlCodes = sqlParser(item.sql);
      const { inputParams } = sqlCodes;
      const inputParameters: any[] = inputParams.map(
        (code: string, cidx: number) => {
          return {
            index: cidx + 1,
            code,
            name: code,
            bizPropertyType: 0,
            description: '',
            sortKey: Date.now().toString() + cidx,
          };
        },
      );
      // 存入新的实体表方法
      this.methodForms.push({
        methodCode: item.sqlType,
        form,
        configs,
        inputParameters: inputParameters,
        outputParameters: [],
        currentParamTab: 'input',
      });
      // 默认选中第一个方法
      if (idx === 0) {
        this.currentMethodTab = item.sqlType;
      }
    });
  }

  /**
   * 切换出入参时重置另一个的错误信息
   */
  resetFormInput(item: createMethodItem) {
    const list: any[] = [];
    if (item.currentParamTab !== 'input') {
      Object.entries(this.$refs).forEach(([key, value]) => {
        if (value && /^form-input-arg/.test(key)) {
          const inputs: any = this.$refs[key];
          if (Array.isArray(inputs)) {
            list.push(...inputs);
          } else {
            list.push(inputs);
          }
        }
      });
    } else {
      Object.entries(this.$refs).forEach(([key, value]) => {
        if (value && /^form-input-res/.test(key)) {
          const outputs: any = this.$refs[key];
          if (Array.isArray(outputs)) {
            list.push(...outputs);
          } else {
            list.push(outputs);
          }
        }
      });
    }
    list.forEach((node: any) => {
      node.reset();
    });
  }

  /**
   * 删除出入参条目
   */
  popItem(record: any, item: createMethodItem) {
    if (item.currentParamTab === 'input') {
      const inputParameters: BizService.Method.InputParam[] =
        item.inputParameters
          .filter((param: any) => param.sortKey !== record.sortKey)
          .map((param: any, index: number) => {
            param.index = index + 1;
            return param;
          });
      this.$set(item, 'inputParameters', inputParameters);
    } else {
      const outputParameters: BizService.Method.OutputParam[] =
        item.outputParameters
          .filter((param: any) => param.sortKey !== record.sortKey)
          .map((param: any, index: number) => {
            param.index = index + 1;
            return param;
          });
      this.$set(item, 'outputParameters', outputParameters);
    }
  }

  /**
   * 添加出入参空条目
   */
  addItem(item: createMethodItem) {
    const param: BizService.Method.InputParam = {
      code: '',
      name: '',
      bizPropertyType: 0,
      description: '',
      index: -1,
      sortKey: Date.now().toString(),
    };
    if (item.currentParamTab === 'input') {
      param.index = item.inputParameters.length + 1;
      item.inputParameters.push(param);
    } else {
      param.index = item.outputParameters.length + 1;
      item.outputParameters.push(param);
    }
    this.$nextTick(() => {
      // 新建按钮滚动至可视区域
      const dom: any = this.$refs.footLine;
      dom.scrollIntoView();
      // 表格内部滚动至底部
      try {
        let aTable: any =
          item.currentParamTab === 'input'
            ? this.$refs[`argTable${item.methodCode}`]
            : this.$refs[`resultTable${item.methodCode}`];
        if (Array.isArray(aTable)) {
          aTable = aTable[0];
        }
        if (aTable) {
          const table: any =
            aTable.$el.getElementsByClassName('ant-table-body')[0];
          table.scrollTop = table.scrollHeight;
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  /**
   * 创建提交： 校验 + 格式化 + 提交到接口
   */
  save() {
    this.validateForms()
      .then(() => {
        this.formatForms();
      })
      .then(() => {
        this.submit();
      })
      .catch(() => {
        this.$message.warning('参数校验失败，请检查您的输入');
      });
  }

  /**
   * 校验填写的信息
   */
  validateForms() {
    return new Promise<void>((resolve, reject) => {
      let hasError: boolean = false;
      let list: any[] = [];
      Object.entries(this.$refs).forEach(([key, value]) => {
        if (value && /^form-input-arg/.test(key)) {
          const inputs: any = this.$refs[key];
          if (Array.isArray(inputs)) {
            list.push(...inputs);
          } else {
            list.push(inputs);
          }
        }
      });

      Object.entries(this.$refs).forEach(([key, value]) => {
        if (value && /^form-input-res/.test(key)) {
          const outputs: any = this.$refs[key];
          if (Array.isArray(outputs)) {
            list.push(...outputs);
          } else {
            list.push(outputs);
          }
        }
      });
      const inputs: any[] = this.$vnode.componentInstance
        ? this.$vnode.componentInstance.$children.filter((el: any) =>
            el.$el.className.includes('form-input'),
          )
        : [];
      list.push(...inputs);
      this.methodForms.forEach((el, index) => {
        if (this.$refs['inputparems_' + index]) {
          // 校验传入参数
          list = [
            ...list,
            ...(this.$refs['inputparems_' + index] as any)[0].validateForm(),
          ];
        }
        if (this.$refs['outputparems_' + index]) {
          list = [
            ...list,
            ...(this.$refs['outputparems_' + index] as any)[0].validateForm(),
          ];
        }
      });

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

  /**
   * 格式化填写的表单
   */
  formatForms() {
    return new Promise<void>(() => {
      this.methodForms.forEach((item: createMethodItem) => {
        // 格式化form
        item.form.configJson = JSON.stringify(item.configs);
        item.form.inputParametersJson = JSON.stringify(
          item.inputParameters.map((param: any) => {
            const { code, name, configJson, bizPropertyType, description } =
              param;
            return { code, name, configJson, bizPropertyType, description };
          }),
        );
        item.form.outputParametersJson = JSON.stringify(
          item.outputParameters.map((param: any) => {
            const { code, name, configJson, bizPropertyType, description } =
              param;
            return { code, name, configJson, bizPropertyType, description };
          }),
        );
      });
    });
  }

  parserSqlTask: any = null;

  /**
   * 单个方法下的sql语句修改时，自动生成入参出参
   */
  onSqlContentChange(item: createMethodItem) {
    clearTimeout(this.parserSqlTask);
    this.parserSqlTask = setTimeout(() => {
      this.parserSqlContent(item);
    }, 500);
  }

  /**
   * 解析sql语句，提取入参
   */
  parserSqlContent(item: createMethodItem) {
    const res = sqlParser(item.configs.sql);
    const { inputParams } = res;
    // 将入参自动更新到当前入参列表
    if (Array.isArray(inputParams)) {
      this.updateParamListByCodes(inputParams, 'inputParameters', item);
    }
  }

  /**
   * 通过解析到的code列表重置 传入/返回 参数列表
   */
  updateParamListByCodes(
    codes: Array<string>,
    dataKey: string,
    item: createMethodItem,
  ) {
    const targetList = item[dataKey];
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
    this.$set(item, dataKey, paramsList);
  }

  /**
   * 提交到接口
   */
  submit() {
    const params: Array<BizService.Method.CreateParams> = this.methodForms.map(
      (item: createMethodItem) => item.form,
    );
    methodApi.createDatatableMethods(params).then((res: Common.Data) => {
      if (res.errcode === 0) {
        this.$emit('submit', 0);
      } else {
        const errmsg = res.errcode === 500105 ? '方法编码重复' : res.errmsg;
        this.$message.error(errmsg as string);
      }
    });
  }
}
</script>
<style lang="less" scoped>
.add-method {
  &__title {
    font-weight: 600;
  }
  &__form {
    margin-bottom: 24px;
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

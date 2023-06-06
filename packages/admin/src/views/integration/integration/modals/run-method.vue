<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="run-server">
    <section class="run-server__block">
      <h3 class="run-server__title">基本信息</h3>
      <div class="run-server__form">
        <div class="run-server__item">
          <span>集成方法：</span>
          <p>{{ target.name }}</p>
        </div>
      </div>
    </section>

    <section v-if="inputMappings.length" class="run-server__block">
      <h3 class="run-server__title">传入参数</h3>
      <a-tabs v-if="adapterCode === 'SAP'" v-model="activeKey">
        <a-tab-pane key="1" tab="Params">
          <!-- 传入参数 -->
          <runMethodList
            ref="inputparems"
            :dataSource="inputMappings"
            :rules="rules"
            :bizPropertyTypes="bizPropertyTypes"
            @dataSourceChange="
              (val) => (inputMappings = JSON.parse(JSON.stringify(val)))
            "
          />
        </a-tab-pane>
        <a-tab-pane key="2" tab="RowJson" forceRender>
          <a-textarea
            v-model="longTextParams"
            placeholder="请输入"
            :autoSize="{ minRows: 4 }"
          />
        </a-tab-pane>
      </a-tabs>

      <div v-else class="run-server__table">
        <!-- 传入参数 -->
        <runMethodList
          ref="inputparems"
          :dataSource="inputMappings"
          :rules="rules"
          :bizPropertyTypes="bizPropertyTypes"
          @dataSourceChange="
            (val) => (inputMappings = JSON.parse(JSON.stringify(val)))
          "
        />
      </div>
    </section>

    <section v-if="isJsonRequest" class="run-server__block">
      <h3 class="run-server__title">请求体</h3>
      <div class="run-server__textarea">
        <a-input
          v-model="jsonContent"
          type="textarea"
          :placeholder="jsonContentPlaceholder"
        />
      </div>
    </section>

    <section v-else-if="bodyMappings.length" class="run-server__block">
      <h3 class="run-server__title">请求体</h3>
      <div class="run-server__table">
        <!-- 传入参数 -->
        <runMethodList
          ref="bodyInputparems"
          :dataSource="bodyMappings"
          :rules="rules"
          :bizPropertyTypes="bizPropertyTypes"
          @dataSourceChange="
            (val) => (bodyMappings = JSON.parse(JSON.stringify(val)))
          "
        />
      </div>
    </section>

    <section class="run-server__block">
      <h3 class="run-server__title">返回值</h3>
      <div class="run-server__code">
        <pre>{{ outputJson }}</pre>
      </div>
    </section>
    <div class="run-server__footer">
      <a-button type="primary" @click="run"> 运行 </a-button>
    </div>
  </div>
</template>
<script lang="ts">
import methodApi from '@/apis/biz-service/method.api';
import FormInput from '@/components/global/form-input/index.vue';
import { Button, Input, Table, Tabs } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import Filters from '@/common/filters';

import runMethodList from './run-method-list.vue';

const MethodsModule = namespace('Integration/Methods');

const ServiceModule = namespace('Integration/Service');
//这里是自定义的规则
const newpwdmin = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入'));
  } else if (
    isNaN(value) &&
    isNaN(Date.parse(value)) &&
    isNaN(value._d) &&
    isNaN(Date.parse(value._d))
  ) {
    return callback(new Error('请输入正确的时间格式！'));
  } else {
    callback();
  }
};
const logic = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入'));
  } else if (['true', 'false'].indexOf(value.toLowerCase()) === -1) {
    return callback(new Error('请输入true或者flase'));
  } else {
    callback();
  }
};
// NOTE: 适配器类型枚举
enum ProtocolAdapterType {
  RESTFUL = 0,
  SOAP = 1,
  SAP = 2,
  DATA_TABLE = 3,
  DATA_SQL = 4,
}

@Component({
  name: 'run-webserver',
  components: {
    FormInput,
    ATable: Table,
    AInput: Input,
    ATextarea: Input.TextArea,
    AButton: Button,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    runMethodList,
  },
})
export default class RunWebserver extends Vue {
  @MethodsModule.State('paramTypes') bizPropertyTypes: any;

  @ServiceModule.State('list') list: any;

  // 运行对象
  @Prop() target!: any;

  // 是否为Json请求格式
  isJsonRequest: boolean = false;

  // json请求体内容
  jsonContent: string = '';

  jsonContentPlaceholder: string = '';

  // 查询参数
  inputMappings: any[] = [];

  // 请求体
  bodyMappings: any[] = [];

  // 请求响应返回值
  outputJson: any = null;

  // 传入参数tab选择
  activeKey: any = '1';

  longTextParams: any = null;

  rules: any = {
    code: [
      {
        type: 'number',
        required: true,
        message: '请填写值',
      },
    ],
    date: [
      {
        type: 'date',
        required: true,
        validator: newpwdmin,
        message: '请填写值',
      },
    ],
    logic: [
      { type: 'logic', required: true, validator: logic, message: '请填写值' },
    ],
  };

  // 表头
  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      key: 'index',
      width: 142,
      align: 'left',
    },
    {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      key: 'name',
      width: 180,
      align: 'left',
    },
    {
      dataIndex: 'type',
      slots: { title: 'typeTitle' },
      key: 'type',
      width: 154,
      align: 'left',
    },
    {
      dataIndex: 'value',
      slots: { title: 'valueTitle' },
      scopedSlots: { customRender: 'value' },
      key: 'value',
      width: 300,
      align: 'left',
    },
  ];

  // 是否是webserver，
  // isWebserver: boolean = false;
  // webserver的方法列表
  // methodList: any[] = [];
  dataItemList: any[] = [];

  getArrMapVal(arr: any[]) {
    const resObj: any = {};
    arr.forEach((el) => {
      resObj[el.code] = el.value;
    });
    return [resObj];
  }

  getObjVal(arr: any[]) {
    const res = {};
    arr.forEach((el: any) => {
      if (el.subParameters) {
        if (el.externParameterType === 1001) {
          res[el.code] = this.getArrMapVal(el.subParameters);
        } else {
          res[el.code] = this.getObjVal(el.subParameters);
        }
      } else {
        res[el.code] = el.value;
      }
    });
    return res;
  }

  setTestInputParametersMap(testInputParametersMap, item) {
    let value = item.value;
    if (item.subParameters) {
      if (item.externParameterType === 1001) {
        // 数组
        value = this.getArrMapVal(item.subParameters);
      } else {
        // 对象
        value = this.getObjVal(item.subParameters);
      }
    }
    this.$set(testInputParametersMap, item.code, value);
  }

  /**
   * 运行
   */
  run() {
    // 校验表单
    this.validateForm()
      .then(async () => {
        this.outputJson = null;
        const testInputParametersMap: object = {};
        if (this.adapterCode === 'SAP' && this.longTextParams) {
          try {
            const json = JSON.parse(this.longTextParams);
            if (json instanceof Object) {
              Object.entries(json).forEach(([key, value]) => {
                this.$set(testInputParametersMap, key, value);
              });
            }
          } catch (error) {
            this.$message.warning('请求体格式错误，请检查');
            return;
          }
        } else {
          if (this.inputMappings.length) {
            this.inputMappings.forEach((item: any) => {
              this.setTestInputParametersMap(testInputParametersMap, item);
            });
          }

          if (this.bodyMappings.length) {
            this.bodyMappings.forEach((item: any) => {
              // this.$set(testInputParametersMap, item.code, item.value);
              this.setTestInputParametersMap(testInputParametersMap, item);
            });
          }
          if (this.isJsonRequest && this.jsonContent) {
            try {
              const json: any = JSON.parse(this.jsonContent);
              if (json instanceof Object) {
                Object.entries(json).forEach(([key, value]) => {
                  this.$set(testInputParametersMap, key, value);
                });
              }
            } catch (error) {
              this.$message.warning('请求体格式错误，请检查');
              return;
            }
          }
        }

        if (testInputParametersMap) {
          for (const con in testInputParametersMap) {
            if (
              testInputParametersMap[con]['_d'] &&
              testInputParametersMap[con]['_d'].constructor === Date &&
              !isNaN(Date.parse(testInputParametersMap[con]))
            ) {
              testInputParametersMap[con] = Filters.formatDate(
                testInputParametersMap[con],
                'y-M-d h:m:s',
              );
            }
          }
        }

        const params: BizService.Method.TestParams = {
          code: this.target.code,
          serviceCode: this.target.serviceCode,
          testInputParametersMap,
        };
        methodApi.testMethod(params).then((res: any) => {
          if (!res.errcode) {
            if (res.data.success) {
              this.$message.success('运行成功');
            } else if (res.data.msg) {
              this.$message.error(res.data.msg);
            } else {
              this.$message.error('运行报错');
            }
            this.outputJson = res.data.data;
          } else {
            this.$message.error(res.errmsg);
          }
        });
      })
      .catch(() => {});
  }

  /**
   * 匹配类型展示名
   */
  getTypeName(type: any) {
    const item: any = this.bizPropertyTypes.find((t: any) => t.value === type);
    return item ? item.label : type;
  }

  /**
   * 初始化SOAP服务运行参数等
   */
  initSoap() {
    const { inputParametersJson, configJson } = this.target;
    const inputMappings: any = JSON.parse(inputParametersJson);
    // console.log(inputMappings);
    if (Array.isArray(inputMappings)) {
      const jsonContent: object = inputMappings.reduce(
        (obj: any, item: any) => {
          const configJsonOther: any = JSON.parse(item.configJson);
          // console.log(configJson);
          // if (configJson.position === 3) {
          if (configJsonOther && Array.isArray(configJsonOther.paramType)) {
            obj[item.code] = configJsonOther.paramType;
          } else {
            obj[item.code] = configJsonOther
              ? `${configJsonOther.paramType}`
              : '';
          }
          // }
          return obj;
        },
        {},
      );
      this.jsonContentPlaceholder = JSON.stringify(jsonContent);
      this.jsonContent = JSON.stringify(jsonContent);
    } else {
      this.jsonContentPlaceholder = inputParametersJson;
      this.jsonContent = inputParametersJson;
    }
    this.isJsonRequest = true;
  }

  /**
   * 初始化RESTFUL服务运行参数等
   */
  initRestful() {
    const { inputParametersJson, configJson } = this.target;
    const inputMappings: any = JSON.parse(inputParametersJson);
    if (Array.isArray(inputMappings)) {
      const initedMappings: any[] = this.initParameters(inputMappings);
      this.inputMappings = initedMappings.filter(
        (item: any) => +item.location !== 3,
      );
      this.bodyMappings = initedMappings.filter(
        (item: any) => +item.location === 3,
      );
    }
    const methodConfig: any = JSON.parse(configJson);
    if (methodConfig && methodConfig instanceof Object) {
      this.isJsonRequest = methodConfig.requestBodyType === 1;
      if (this.isJsonRequest) {
        const placeholder: object = this.bodyMappings.reduce(
          (obj: any, item: any) => {
            obj[item.code] = item.value;
            return obj;
          },
          {},
        );
        this.jsonContentPlaceholder = JSON.stringify(placeholder);
      }
    }
  }

  /**
   * 初始化运行Database服务的参数
   */
  initDatabase() {
    const { inputParametersJson } = this.target;
    const inputMappings: any = JSON.parse(inputParametersJson);
    if (Array.isArray(inputMappings)) {
      this.inputMappings = this.initParameters(inputMappings);
    }
  }

  // 格式化传入值
  initParameters(parameters) {
    return parameters.map((item: any, index: number) => {
      const res: any = {
        index: index + 1,
        code: item.code,
        name: item.name,
        bizPropertyType: item.bizPropertyType,
        type: this.getTypeName(item.bizPropertyType),
        value: '',
        subParameters: undefined,
        showChild: true,
        externParameterType: item.externParameterType,
      };

      if (item.configJson) {
        res.location = item.configJson.position;
      }

      if (item.subParameters) {
        res.subParameters = this.initParameters(item.subParameters);
      }
      return res;
    });
  }

  /**
   * 初始化运行数据
   */
  init() {
    // this.isWebserver = /webserver/i.test(this.target.adapterCode);
    // if (this.isWebserver) {
    //   /* 获取webserver下的运行参数 */
    //   return;
    // }
    console.log(this.target, 'this.target');
    const { adapterType } = this.target;
    switch (adapterType) {
      case ProtocolAdapterType.SOAP:
        this.initSoap();
        break;
      case ProtocolAdapterType.RESTFUL:
        this.initRestful();
        break;
      case ProtocolAdapterType.DATA_TABLE:
      case ProtocolAdapterType.DATA_SQL:
        this.initDatabase();
        break;
      default:
        break;
    }
  }

  /**
   * 校验表单填写内容
   */
  validateForm() {
    return new Promise((resolve, reject) => {
      let hasError: boolean = false;
      let list: any[] = [];

      Object.entries(this.$refs).forEach(([key, value]) => {
        if (value && /^form-input-res/.test(key)) {
          list.push(this.$refs[key]);
        }
      });
      const inputs: any[] = this.$vnode.componentInstance
        ? this.$vnode.componentInstance.$children.filter((el: any) =>
            el.$el.className.includes('form-input'),
          )
        : [];
      list.push(...inputs);
      if (this.$refs.inputparems) {
        // 校验传入参数
        list = [...list, ...(this.$refs.inputparems as any).validateForm()];
      }
      if (this.$refs.bodyInputparems) {
        // 校验传入参数
        list = [...list, ...(this.$refs.bodyInputparems as any).validateForm()];
      }
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
        resolve(false);
      }
    });
  }

  mounted() {
    this.init();
  }

  get adapterCode() {
    return this.list.find((item) => item.code === this.target.serviceCode)
      .adapterCode;
  }
}
</script>
<style lang="less" scoped>
.run-server {
  padding-bottom: 50px;
  &__block {
    &:nth-child(n + 2) {
      &:before {
        content: '';
        display: block;
        margin-top: 24px;
        height: 1px;
        width: 100%;
      }
    }
    &:nth-child(2) {
      &:before {
        margin: 29px 0 24px 0;
        background-color: #e8e8e8;
      }
    }
  }
  &__title {
    color: #111218;
    font-weight: 600;
  }
  &__item {
    display: flex;
    align-items: center;
    margin-top: 20px;
    color: rgba(17, 18, 24, 0.5);
    > span {
      display: inline-block;
      width: 5em;
      margin-right: 5px;
    }
    > p {
      width: 306px;
    }
    /deep/.ant-select {
      width: 100%;
    }
  }
  &__textarea {
    margin: 16px 0;
    textarea {
      display: block;
      // width: 100%;
      min-height: 116px;
      padding: 6px 12px;
      // font-size:14px;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      line-height: 22px;
    }
  }
  &__code {
    padding: 15px;
    margin: 16px 0;
    min-height: 300px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }
  &__footer {
    position: absolute;
    z-index: 9;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    line-height: 50px;
    border-top: 1px solid #e8e8e8;
    text-align: center;
    background: #fff;
  }
  &__table {
    margin-top: 16px;
    // /deep/.ant-table-thead span {
    //   font-weight: 600;
    //   color: rgba(0,0,0,0.65);
    // }
    /deep/.ant-table-body {
      color: #111218;
    }
  }
}
</style>
<style>
.ant-message-notice-content {
  word-break: break-all;
}
</style>

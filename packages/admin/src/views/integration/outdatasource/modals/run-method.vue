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

    <section class="run-server__block">
      <h3 class="run-server__title">Sql语句</h3>
      <div class="run-server__sql">
        <pre>{{ target.sqlConfig }}</pre>
      </div>
    </section>

    <section v-if="inputMappings.length" class="run-server__block">
      <h3 class="run-server__title">传入参数</h3>
      <div class="run-server__table">
        <a-table
          :columns="columns"
          :dataSource="inputMappings"
          :pagination="false"
          :scroll="{ y: 500 }"
          :locale="{ emptyText: $t('languages.NoRelevantData') }"
          size="small"
          rowKey="index"
        >
          <!-- 表头 -->
          <span slot="indexTitle" class="text-ellipsis">序号</span>
          <span slot="nameTitle" class="text-ellipsis resize">参数名称</span>
          <span slot="operatorTitle" class="text-ellipsis resize">逻辑关系</span>
          <span slot="typeTitle" class="text-ellipsis resize">参数类型</span>
          <span slot="valueTitle" class="text-ellipsis resize">参数值</span>
          <!-- 表体 -->
          <div slot="operator" slot-scope="text, record">
            {{ getOperatorName(record.operator) }}
          </div>
          <div slot="type" slot-scope="text, record">
            {{ getTypeName(record.type) }}
          </div>

          <template slot="value" slot-scope="text, record">
            <template v-if="record.type === 'NUMBER'">
              <div class="form-input" :class="{ 'has-error': !record.value }">
                <a-input
                  v-model="record.value"
                  type="text"
                  :maxLength="50"
                  placeholder="请输入"
                  @change="
                    () => {
                      record.value = record.value.replace(/[^\d]/g, '');
                    }
                  "
                />
                <p v-if="!record.value" class="form-input__message">
                  请填写内容
                </p>
              </div>
            </template>
            <template v-else-if="record.type === 'STRING'">
              <div class="form-input" :class="{ 'has-error': !record.value }">
                <a-input
                  v-model="record.value"
                  type="text"
                  :maxLength="50"
                  placeholder="请输入"
                  @change="
                    () => {
                      record.value = record.value.trim();
                    }
                  "
                />
                <p v-if="!record.value" class="form-input__message">
                  请填写内容
                </p>
              </div>
            </template>
            <template v-else>
              <a-date-picker
                v-model="record.value"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                showTime
                placeholder="请选择日期"
              />
            </template>
          </template>
        </a-table>
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
import { Button, DatePicker, Input, Table } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { operator } from './operator';
import { type } from './type';

@Component({
  name: 'run-webserver',
  components: {
    ATable: Table,
    AButton: Button,
    ADatePicker: DatePicker,
    AInput: Input,
  },
})
export default class RunWebserver extends Vue {
  // 运行对象
  @Prop() target!: any;

  // 查询参数
  inputMappings: any[] = [];

  // 请求响应返回值
  outputJson: any = null;

  // 表头
  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      key: 'index',
      width: 78,
      align: 'center',
    },
    {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      key: 'name',
      width: 150,
    },
    {
      dataIndex: 'operator',
      slots: { title: 'operatorTitle' },
      scopedSlots: { customRender: 'operator' },
      key: 'operator',
      width: 120,
    },
    {
      dataIndex: 'type',
      slots: { title: 'typeTitle' },
      scopedSlots: { customRender: 'type' },
      key: 'type',
      width: 110,
    },
    {
      dataIndex: 'value',
      slots: { title: 'valueTitle' },
      scopedSlots: { customRender: 'value' },
      key: 'value',
      width: 190,
    },
  ];

  /**
   * 获取逻辑关系名称
   */
  getOperatorName(value) {
    const item: any = operator.find((t: any) => t.value === value);
    return item ? item.label : value;
  }

  /**
   * 获取类型名称
   */
  getTypeName(value) {
    const item: any = type.find((t: any) => t.value === value);
    return item ? item.label : value;
  }

  /**
   * 运行
   */
  run() {
    this.outputJson = null;
    const testInputParametersMap: object = {};
    if (this.inputMappings.length) {
      const recordNull = this.inputMappings.some(
        (record: any) =>
          (record.type === 'STRING' || record.type === 'NUMBER') &&
          !record.value,
      );
      if (recordNull) {
        // this.$message.error('请填写内容！');
        return;
      }

      const dateNull = this.inputMappings.some(
        (record: any) => record.type === 'DATE' && !record.value,
      );
      if (dateNull) {
        this.$message.error('请选择日期！');
        return;
      }

      this.inputMappings.forEach((item: any) => {
        this.$set(testInputParametersMap, item.code, item.value);
      });
    }
    const params = {
      bizDatasourceMethodModel: this.target,
      inputParamsMap: testInputParametersMap,
    };

    methodApi.serviceTestDatasourceMethods(params).then((res: any) => {
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
  }

  /**
   * 初始化运行数据
   */
  init() {
    const { inputParamConfig } = this.target;
    if (!inputParamConfig) {
      return;
    }
    const inputParamConfigList = JSON.parse(inputParamConfig);
    if (Array.isArray(inputParamConfigList)) {
      const mappings: any[] = inputParamConfigList.map(
        (item: any, index: number) => {
          let value: any;
          if (item.value.length > 0) {
            value = item.value[0];
          }
          if (item.value.length > 1) {
            value = item.value.join(',');
          }
          return {
            index: index + 1,
            code: item.code,
            name: item.name,
            type: item.type,
            operator: item.operator,
            value: value,
          };
        },
      );
      this.inputMappings = mappings;
    }
  }

  mounted() {
    this.init();
  }
}
</script>
<style lang="less" scoped>
.run-server /deep/ .ant-table-tbody .ant-table-row {
  height: 70px;
}
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
  &__sql {
    padding: 15px;
    margin: 16px 0;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
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
  .form-input {
    position: relative;
    .form-input__message {
      position: absolute;
      left: 0;
      right: 0;
      padding-top: 2px;
      font-size: 12px;
      font-family: PingFang-SC-Regular;
      font-weight: 400;
      color: #f5222d;
    }
  }
}
</style>

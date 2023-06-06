<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="add-server">
    <section class="add-server__block">
      <h3 class="add-server__title">基本信息</h3>
      <div class="add-server__form">
        <div class="add-server__item">
          <span class="label-required">服务编码：</span>
          <p>
            <!-- <template v-if="isEdit">
              {{ form.code }}
            </template> -->
            <form-input
              v-model="form.code"
              :disabled="isEdit"
              placeholder="请输入服务编码，例：bpmH3_01"
              :rules="rules.code"
            />
          </p>
        </div>
        <div class="add-server__item">
          <span class="label-required">服务名称：</span>
          <p>
            <form-input
              v-model="form.name"
              placeholder="请输入服务名称"
              :rules="rules.name"
            />
          </p>
        </div>
        <div class="add-server__item">
          <span class="label-required">适配器：</span>
          <p>
            <template v-if="isEdit">
              {{ form.adapterCode }}
            </template>
            <a-select
              v-else
              showSearch
              allowClear
              placeholder="请选择"
              @change="selectAdapter"
            >
              <a-select-option
                v-for="d in adapters"
                :key="d.code"
                :title="d.name"
              >
                <div class="select-option">
                  {{ d.name }}
                  <p v-if="d.code === 'RESTFUL'" class="p-tips">
                    <small>基于rest规范的提供的http接口，json格式</small>
                  </p>
                  <p v-if="d.code === 'SOAP'" class="p-tips">
                    <small>rpc的一种通讯协议，xml格式，直接把接入的服务提供的方法同步过来</small>
                  </p>
                  <p v-if="d.code === 'DATA_TABLE'" class="p-tips">
                    <small>通过对实体表的增删改查操作实现业务集成</small>
                  </p>
                  <p v-if="d.code === 'DATA_SQL'" class="p-tips">
                    <small>直接操作目标数据库，自己编写sql，通过sql查询实现业务集成，不固定任何表</small>
                  </p>
                  <p v-if="d.code === 'SAP'" class="p-tips">
                    <small>也是一种协议，通过函数实现业务集成</small>
                  </p>
                </div>
              </a-select-option>
            </a-select>
          </p>
        </div>
        <div v-show="authlist.length" class="add-server__item">
          <span>授权方式：</span>
          <p>
            <!-- <template v-if="isEdit">{{ configs.auth.name }}</template> -->
            <a-select
              v-model="configs.auth.code"
              showSearch
              allowClear
              @change="selectAuth"
            >
              <a-select-option v-for="a in authlist" :key="a.code">
                <div class="select-option">
                  {{ a.name }}
                  <p v-if="a.code === 'basic'" class="p-tips">
                    <small>根据username、password来进行鉴权</small>
                  </p>
                  <p v-if="a.code === 'oauth_password'" class="p-tips">
                    <small>根据客户端凭证，以及username、password来进行鉴权</small>
                  </p>
                  <p v-if="a.code === 'oauth_client'" class="p-tips">
                    <small>根据客户端凭证进行鉴权</small>
                  </p>
                  <p v-if="a.code === 'customer'" class="p-tips">
                    <small>自定义鉴权，提供url即可</small>
                  </p>
                </div>
              </a-select-option>
            </a-select>
          </p>
        </div>

        <div class="add-server__item shared">
          <span>服务类型：</span>
          <p>
            <a-radio-group v-model="form.shared" name="radioGroup">
              <p class="p-tips"><a-radio :value="false"> 私有 </a-radio></p>
              <p class="p-tips"><a-radio :value="true"> 共享 </a-radio></p>
            </a-radio-group>
          </p>
        </div>

        <div v-if="form.shared" class="add-server__item">
          <span>共享人员：</span>
          <p>
            <a-select
              v-model="form.userIdList"
              showSearch
              allowClear
              mode="multiple"
              optionFilterProp="title"
            >
              <a-select-option
                v-for="(user, index) in appManagers"
                :key="index"
                :value="user.id"
                :title="user.name"
                :disabled="user.disabled"
              >
                {{ user.name }}
              </a-select-option>
            </a-select>
          </p>
        </div>
      </div>
    </section>
    <section class="add-server__block">
      <h3 class="add-server__title">属性名称</h3>
      <!-- 普通适配器授权信息 -->
      <div v-if="configs.auth.code" class="add-server__form">
        <!-- 公共参数配置 -->
        <div
          v-for="(item, i) in configs.commonlist"
          :key="i"
          class="add-server__item add-server__item--full"
        >
          <span :class="item.required && 'label-required'">{{ item.name }}：</span>
          <p>
            <form-input
              v-model="item.value"
              :rules="[{ required: item.required, message: '请填写内容' }]"
            />
          </p>
        </div>
        <!-- 授权方式独有的参数 -->
        <div
          v-for="(param, j) in configs.auth.parameterlist"
          :key="param.code + j"
          class="add-server__item"
        >
          <span :class="param.required && 'label-required'">{{ param.name }}：</span>
          <p>
            <form-input
              v-model="param.value"
              :rules="[{ required: param.required, message: '请填写内容' }]"
            />
          </p>
        </div>
      </div>
      <!-- 数据库适配器授权信息 -->
      <div
        v-else-if="form.adapterCode && IsDatabaseAdapter"
        class="add-server__form"
      >
        <div class="add-server__item">
          <span>数据源：</span>
          <p>
            <a-select
              v-model="form.sqlConnectCode"
              showSearch
              allowClear
              @change="selectSql"
            >
              <a-select-option
                v-for="sql in formatOption()"
                :key="sql.code"
                :value="sql.code"
                :title="sql.name"
              >
                {{ sql.name }}
              </a-select-option>
            </a-select>
            <span v-if="databaseError" class="database-error">* 此数据源在系统中不存在，请在数据源页面添加</span>
          </p>
        </div>
      </div>
    </section>
    <div class="add-server__footer">
      <template v-if="isEdit && isOperation(server)">
        <a-button type="default" @click="$emit('close')"> 关闭 </a-button>
      </template>
      <template v-else>
        <a-button type="primary" @click="save"> 保存 </a-button>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
interface ServerWithSqlParams extends BizService.Service.CreateParams {
  sqlConnectCode: string;
}

import * as BizSql from '@/apis/biz-sql/index';
import { nameValidator, pattern } from '@/common/utils';
import FormInput from '@/components/global/form-input/index.vue';
import {
  Button,
  DatePicker,
  Input,
  Radio,
  Select,
  Table,
  Tabs,
} from '@h3/antd-vue';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ServiceModule = namespace('Integration/Service');
const UserModule = namespace('System/User');

@Component({
  name: 'add-server',
  components: {
    FormInput,
    StaffSelector,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ATable: Table,
    AInput: Input,
    ADatePicker: DatePicker,
    ATextarea: Input.TextArea,
    AButton: Button,
    ARadioGroup: Radio.Group,
    ARadio: Radio,
  },
})
export default class AddServer extends Vue {
  @ServiceModule.State('adapters') adapters!: BizService.AdapterConfig[];

  @ServiceModule.State('categoryId') categoryId!: string;

  @ServiceModule.Action('createService') createService!: any;

  @ServiceModule.Action('updateService') updateService!: any;

  @Prop() server!: any;

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

  // 是否为编辑，false则为新建
  isEdit: boolean = false;

  // 编辑信息
  form: ServerWithSqlParams = {
    code: '',
    configJson: '',
    description: '',
    name: '',
    adapterCode: '',
    sqlConnectCode: '',
    serviceCategoryId: '',
    shared: false,
    userIdList: [],
  };

  // 授权配置信息
  configs: {
    auth: { code: string; name: string; parameterlist: Array<any> };
    commonlist: Array<any>;
  } = {
    auth: {
      code: '',
      name: '',
      parameterlist: [],
    },
    commonlist: [],
  };

  // 授权方式选项
  authlist: BizService.AuthItem[] = [];

  // 规则
  rules: any = {
    code: [
      {
        required: true,
        message: '请填写服务编码',
      },
      {
        pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,60}$/,
        message: '以字母开头不超过60个字符，仅支持字母、数字、下划线',
      },
    ],
    name: [
      {
        required: true,
        message: '请填写服务名称',
      },
      {
        validator: nameValidator,
        message: '仅限50个字符以内，并不能以空格开头',
      },
    ],
  };

  // 数据库适配器编码正则
  databaseReg: RegExp = new RegExp(/^DATA_/);

  // 数据库连接列表
  databaseOptions: Array<BizSql.poolItem> = [];

  databaseError: boolean = false;

  // 共享人员选人控件配置参数

  userOpts: any = {
    selectOrg: false,
    selectUser: true,
    showModel: false,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择人员',
    appManagerFilter: true,
    isInit: false,
    rootNode: [],
    selected: [],
  };

  userIdList: any[] | null = [];

  appManagers: any[] = [];

  // 是否是数据库类型适配器，如果是，不展示授权方式
  get IsDatabaseAdapter() {
    if (
      this.form.adapterCode &&
      (this.databaseReg.test(this.form.adapterCode) ||
        this.form.adapterCode.startsWith('SAP'))
    ) {
      return true;
    }
    return false;
  }

  /**
   * 获取应用管理原
   * */
  async getAPPManagers() {
    const selectUserIds: string = this.server.userIdList
      ? this.server.userIdList.join(',')
      : '';
    const res: any = await BizSql.getAppManagers(selectUserIds);
    const { errcode, data, errmsg } = res;
    data.forEach((item: any) => {
      item.disabled = !item.select;
    });
    if (errcode === 0) {
      this.appManagers = data || [];
    } else {
      this.$message.error(errmsg);
    }
  }

  /**
   * 获取数据库连接列表
   */
  async getSqlConnections() {
    // 获取数据库连接列表
    await BizSql.getBizSqlList().then((res: Common.Data) => {
      if (res.errcode === 0) {
        if (Array.isArray(res.data)) {
          this.databaseOptions = res.data;
        } else {
          this.$message.warning('获取到的数据库连接列表错误：不是数组！');
        }
      } else {
        const msg: string = res.errmsg || '请求接口出错！';
        this.$message.error(msg);
      }
    });
  }

  formatOption() {
    if (this.form.adapterCode.startsWith('SAP')) {
      return this.databaseOptions.filter((item) => {
        return item.datasourceType === 'SAP';
      });
    } else {
      return this.databaseOptions.filter((item) => {
        return item.datasourceType === 'DATABASE';
      });
    }
  }

  /**
   * 选定适配器
   */
  selectAdapter(value: any) {
    console.log('set adapter', value);
    this.form.adapterCode = value || ''; //解决a-select组件默认值为空不显示placeholder值
    this.form.sqlConnectCode = '';
    const configItem: BizService.AdapterConfig | undefined = this.adapters.find(
      (item: BizService.AdapterConfig) => item.code === value,
    );
    if (configItem) {
      this.authlist = configItem.config.authList;
      this.configs.commonlist = configItem.config.commonList.map(
        (param: any) => {
          param.value = '';
          return param;
        },
      );
      if (!this.IsDatabaseAdapter) {
        // 非数据库适配器，默认选中自定义授权方式
        this.selectAuth('customer');
      } else {
        // 数据库适配器无授权字段，只有公共字段
        this.configs.auth = {
          code: '',
          name: '',
          parameterlist: [],
        };
        if (
          !Array.isArray(this.databaseOptions) ||
          !this.databaseOptions.length
        ) {
          this.getSqlConnections();
        }
      }
    }
  }

  /**
   * 选定授权方式
   */
  selectAuth(value: any) {
    // console.log('set auth', value);
    const authItem: BizService.AuthItem | undefined = this.authlist.find(
      (item: BizService.AuthItem) => item.code === value,
    );
    if (authItem) {
      this.configs.auth = Object.assign(
        {},
        {
          ...authItem,
          parameterlist: authItem.parameterlist
            ? authItem.parameterlist.map((param: any) => {
                param.value = '';
                return param;
              })
            : [],
        },
      );
    }
  }

  /**
   * 选定数据库连接
   * @param sqlCode
   */
  selectSql(sqlCode: string) {
    this.configs.commonlist.forEach((param: any) => (param.value = sqlCode));
    this.databaseError = false;
  }

  /**
   * 校验表单填写内容
   */
  validateForm() {
    return new Promise<void>((resolve, reject) => {
      let hasError: boolean = false;
      const inputs: any[] = this.$vnode.componentInstance
        ? this.$vnode.componentInstance.$children.filter((el: any) =>
            el.$el.className.includes('form-input'),
          )
        : [];
      inputs.forEach((node: any) => {
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
   * 保存
   */
  save() {
    const vm = this;
    this.validateForm()
      .then(() => {
        if (!vm.form.adapterCode) {
          return vm.$message.error('请选择适配器');
        }
        if (vm.IsDatabaseAdapter && !vm.form.sqlConnectCode) {
          return vm.$message.error('请选择数据库连接');
        }
        if (!vm.IsDatabaseAdapter && !vm.configs.auth.code) {
          return vm.$message.error('请选择授权方式');
        }
        const sqlOption = [];
        vm.formatOption().forEach((item) => {
          sqlOption.push(item.code as never);
        });
        if (
          vm.form.adapterCode &&
          vm.IsDatabaseAdapter &&
          !sqlOption.includes(vm.form.sqlConnectCode as never)
        ) {
          return vm.$message.error(
            '此数据源在系统中不存在，请在数据源页面添加',
          );
        }

        vm.form.serviceCategoryId = vm.categoryId;
        vm.form.configJson = JSON.stringify(vm.configs);

        // 如果是私享，则清空用户列表
        if (!vm.form.shared) {
          vm.form.userIdList = [];
        }

        if (vm.server.id) {
          const args: BizService.Service.UpdateParams = {
            id: vm.server.id,
            ...vm.form,
          };
          vm.updateService(args).then((res: any) => {
            if (!res.errcode) {
              vm.$message.success('更新服务成功');
              vm.$emit('close', true);
            } else {
              vm.$message.error(res.errmsg);
            }
          });
        } else {
          vm.createService(vm.form).then((res: any) => {
            if (!res.errcode) {
              vm.$message.success('添加服务成功');
              vm.$emit('close');
            } else if (res.errcode === 500007) {
              vm.$message.error('服务编码已存在');
            } else {
              vm.$message.error(res.errmsg);
            }
          });
        }
      })
      .catch(() => {});
  }

  async mounted() {
    this.getAPPManagers();
    console.log(this.server, '-------------------SERVER');
    if (this.server.code) {
      Object.keys(this.form).forEach((key: string) => {
        this.$set(this.form, key, this.server[key]);
      });

      if (!this.form.userIdList) {
        this.form.userIdList = [];
      }

      if (this.server.configJson) {
        try {
          this.configs = JSON.parse(this.server.configJson);
          const configItem: BizService.AdapterConfig | undefined =
            this.adapters.find(
              (item: any) => item.code === this.form.adapterCode,
            );
          if (configItem) {
            console.log('匹配到具体的适配器，设置可选信息');
            if (
              this.IsDatabaseAdapter &&
              Array.isArray(this.configs.commonlist) &&
              this.configs.commonlist.length
            ) {
              this.form.sqlConnectCode = this.configs.commonlist[0].value;
              await this.getSqlConnections();
              const sqlOption = [];
              this.formatOption().forEach((item) => {
                sqlOption.push(item.code as never);
              });
              if (!sqlOption.includes(this.form.sqlConnectCode as never)) {
                this.databaseError = true;
              }
            } else {
              this.authlist = configItem.config.authList;
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
    this.isEdit = !!this.server.id;
  }
}
</script>
<style lang="less" scoped>
.add-server {
  padding-bottom: 30px;
  min-height: 800px;
  &__block {
    &:nth-child(n + 2) {
      &:before {
        content: '';
        display: block;
        margin: 24px 0;
        height: 1px;
        width: 100%;
        background-color: #e8e8e8;
      }
    }
  }
  &__title {
    font-weight: 600;
    color: #111218;
  }
  &__item {
    display: flex;
    align-items: center;
    margin-top: 20px;
    color: rgba(17, 18, 24, 0.5);

    &.shared {
      align-items: flex-start;
    }
    &--full {
      > p {
        flex: 1;
        width: auto;
      }
    }
    > span {
      display: inline-block;
      width: 7em;
      margin-right: 5px;
    }
    > p {
      width: 306px;
      line-height: 1;
      position: relative;
      flex: 1;
      .database-error {
        position: absolute;
        width: 100%;
        height: 20px;
        left: 0;
        bottom: -25px;
        font-size: 12px;
        font-weight: 400;
        color: #f0353f;
        line-height: 20px;
      }
    }
    /deep/.ant-select,
    /deep/.ant-input {
      width: 100%;
      color: #111218;
    }
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
}
</style>

<style lang="less">
.select-option {
  padding: 1px 0;
}
.p-tips {
  font-size: 12px;
  font-weight: 400;
  color: rgba(17, 18, 24, 0.5);
  line-height: 20px;
  small {
    line-height: 22px;
  }
}
.ant-radio-group {
  .p-tips {
    margin-bottom: 16px;
    line-height: 22px;
    label {
      color: #111218;
    }
  }
}
</style>

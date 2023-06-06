<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <!-- 甘特图入口   -->
    <div v-if="isGanttOpen()" class="view-type">
      <div
        v-for="type in presentationTypes"
        :key="type.code"
        class="type-item"
        :class="{
          disabled: !(type.code === presentationType),
          listClass: type.code === 'LIST',
          ganttClass: type.code === 'GANTT',
        }"
      >
        <img
          :src="type.code === presentationType ? type.url : type.disableUrl"
        />
      </div>
    </div>
    <div class="attr-rows">
      <div
        v-for="(item, index) in attrData"
        :key="index"
        class="attr-row clearfix"
      >
        <label class="attr-lab">
          <span>
            {{ item.name }}
          </span>
          <a-tooltip v-if="item.tooltip" :title="item.tooltip">
            <a-icon type="question-circle-o" />
          </a-tooltip>
        </label>
        <div class="attr-val" :class="{ disabled: item.disabled }">
          <template v-if="['label', 'input'].includes(item.type)">
            <a-input v-if="item.disabled" v-model="item.value" disabled />
            <form-input
              v-else-if="!item.disabled && isChinese"
              ref="formInput"
              v-model="item.value"
              class="input"
              :value="item.value"
              :rules="rule"
              :type="'text'"
              :maxLength="maxLengthCode"
              :tipPosition="'top'"
              @change="(e) => inputChange(e.target.value, item)"
            />

            <a-input
              v-else-if="!item.disabled && !isChinese"
              v-model="name_i18n[$i18n.locale]"
              class="input"
              :value="name_i18n[$i18n.locale]"
              :type="'text'"
              :maxLength="maxLengthCode"
              @change="(e) => inputChange(e.target.value, item)"
            />
          </template>

          <template
            v-else-if="item.type === 'modal' && item.code === 'setDataSource'"
          >
            <setOptionsModal :schemaCode="schemaCode" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { nameValidator } from '@/common/utils';
import FormInput from '@/components/global/form-input/index.vue';
import { Icon, Input, Tooltip } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import setOptionsModal from './setOptionsModals/setOptionsModal.vue';
import { viewRegister } from 'cloudpivot/list/utils/register';

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'list-attribute',
  components: {
    FormInput,
    setOptionsModal,
    AInput: Input,
    AIcon: Icon,
    ATooltip: Tooltip,
  },
})
export default class AttrRows extends Vue {
  @ListdesignModule.State('queryViewDataSource') queryViewDataSource: any;

  @ListdesignModule.State('name') name: any;

  @ListdesignModule.State('setDataSource') setDataSource: any;

  @ListdesignModule.State('name_i18n') name_i18n: any;

  @ListdesignModule.Mutation('onEdit') onEdit: any;

  @ListdesignModule.Mutation('nameChange') nameChange: any;

  @ListdesignModule.Mutation('codeChange') codeChange: any;

  @ListdesignModule.State('isPublish') isPublish: any;

  @ListdesignModule.State('presentationType') presentationType: any;

  @Prop() schemaCode!: string;

  souceData: any[] = [];

  get listCode() {
    return this.$route.params.code;
  }

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  setOptionsVisible: boolean = false;

  handleOk() {
    this.setOptionsVisible = false;
  }

  attrData: any[] = [];

  rule: any[] = [];

  maxLengthCode: number = 50;

  presentationTypes: any[] = [
    {
      code: 'LIST',
      text: '列表',
      url: require('@/assets/images/type-list-active.png'),
      disableUrl: require('@/assets/images/type-list.png'),
    },
    {
      code: 'GANTT',
      text: '甘特图',
      url: require('@/assets/images/type-gantt-active.png'),
      disableUrl: require('@/assets/images/type-gantt.png'),
    },
  ];

  created() {
    // console.log('name', this.name_i18n);
    this.setRules();
    this.attrData.find((res: any) => res.code === 'code').value = this.listCode;
    this.codeChange(this.listCode);
    this.attrData.find((res: any) => res.code === 'name').value = this.name;

    if (this.presentationType === 'GANTT') {
      this.attrData = this.attrData.filter(
        (item) => item.code !== 'setDataSource',
      );
    }
  }

  setRules() {
    this.attrData = [
      {
        name: this.$t('languages.Apps.ListCode'),
        code: 'code',
        disabled: !!this.isPublish,
        value: this.listCode,
        type: 'label',
      },
      {
        name: this.$t('languages.Apps.ListName'),
        code: 'name',
        disabled: false,
        value: this.name,
        type: 'input',
      },
      {
        name: this.$t('languages.Apps.setDataSource'),
        code: 'setDataSource',
        disabled: false,
        value: this.setDataSource,
        tooltip: '设置展示字段的数据源，可选择关联单选的模型的字段',
        type: 'modal',
      },
    ];
    this.rule = [
      {
        required: true,
        message: this.$t('languages.Apps.ListNamePlaceholder'),
      },
      {
        validator: nameValidator,
        message: this.$t('languages.Apps.NameRule'),
      },
    ];
  }

  inputChange(val: string, inner: any) {
    this.onEdit(true);
    const nameInput: any = this.attrData.find(
      (item: any) => item.code === inner.code,
    );
    if (nameInput.code === 'name') {
      this.nameChange({
        name: val,
        isupdate: true,
        name_i18n: this.name_i18n,
      });
    } else {
      this.codeChange(val);
    }
  }

  @Watch('name')
  onNameChange(val: string) {
    this.attrData.find((res: any) => res.code === 'name').value = val.substring(
      0,
      50,
    );
  }

  @Watch('isPublish')
  isPublishChange(val: string) {
    if (val) {
      this.attrData.forEach((item: any) => {
        if (item.code === 'code') {
          item.disabled = val;
        }
      });
    }
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setRules();
  }

  /**
   * 判断是否配置甘特图
   */
  isGanttOpen() {
    return (
      viewRegister.getEnableViews() &&
      viewRegister.getEnableViews().includes('Gantt')
    );
  }
}
</script>
<style lang="less" scoped>
.attr-rows {
  background: #fff;
  margin-left: 16px;
  .attr-row {
    text-align: left;
    position: relative;
    padding-bottom: 16px;
    .attr-lab {
      font-weight: bold;
      color: #111218;
      line-height: 20px;
      font-size: 12px;
      display: inline-block;
      position: relative;
      margin-bottom: 4px;
    }
    .attr-val {
      line-height: 30px;
      height: 30px;
      color: #111218 !important;
      padding-right: 16px;
      border-radius: 2px;
      /deep/ input {
        height: 30px;
        border-radius: 2px;
        font-size: 13px;
        line-height: 20px;
      }
      /deep/.modal-attr {
        label {
          position: relative;
          padding: 0 11px;
          margin: 0;
          border: thin solid #d4d5d6;
          border-radius: 2px;
          cursor: pointer;
          height: 30px;
          font-size: 13px;
          line-height: 30px;
          span {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
          }
        }
      }
      & > div.input {
        :before {
          content: '' !important;
        }
        /deep/ input {
          padding: 4px 11px;
        }
      }
      label {
        margin: 0 21px;
        display: block;
        height: 33px;
        line-height: 33px;
      }
    }
  }
  & .input:before {
    content: '';
  }
}

.view-type {
  display: flex;
  margin: 8px 22px 16px 22px;
  .type-item {
    img {
      width: 120px;
      height: 114px;
    }
    //border: thin dashed #111218;
  }
  .disabled {
    cursor: not-allowed;
  }
  .listClass {
    margin-right: 16px;
  }
}
</style>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="base-settings">
    <div v-if="!isTabPane" class="base-settings__header">
      <h3>{{ $t('languages.appSettings.baseSetting') }}</h3>
      <a-button type="primary" @click="save">
        {{ $t('languages.appSettings.save') }}
      </a-button>
    </div>
    <div class="base-settings__form">
      <div class="base-settings__form-item">
        <span>{{ $t('languages.Apps.AppCode') }}：</span>
        <p>{{ form.code }}</p>
      </div>
      <div class="base-settings__form-item">
        <span>{{ $t('languages.Apps.AppName') }}：</span>
        <div>
          <a-input
            v-model="form.name"
            :disabled="form.builtInApp"
            :placeholder="$t('languages.Apps.FillInAppName')"
          />
          <i18n-icon />
        </div>
      </div>
      <div class="base-settings__form-item">
        <span>{{ $t('languages.Apps.Catalogues') }}：</span>
        <div>
          <a-select
            v-model="form.groupId"
            :filterOption="filterOption"
            showSearch
            style="width: 268px"
          >
            <a-select-option
              v-for="(item, key) of catalogues"
              v-show="item.code !== 'all'"
              :key="key"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </div>
      </div>
      <div class="base-settings__form-item base-settings__enable">
        <span>{{ $t('languages.appSettings.IfEnable') }}：</span>
        <p>
          <a-switch :checked="form.enabled" @change="toggleEnable" />
          <span class="base-settings__text">{{
            $t('languages.appSettings.AppDisabledTip')
          }}</span>
        </p>
      </div>
      <div class="base-settings__form-item base-settings__upload">
        <span>{{ $t('languages.appSettings.AppIcon') }}：</span>
        <div>
          <a-upload :showUploadList="false" :beforeUpload="beforeUpload">
            <div
              :class="[
                'base-settings__icon',
                { 'base-settings__icon--loading': uploading },
              ]"
            >
              <img :src="imgUrl || defaultIcon" alt="app-icon" />
              <i class="icon aufontAll h-icon-all-form-o"></i>
              <i class="icon aufontAll h-icon-all-loading-o"></i>
            </div>
          </a-upload>
          <span class="base-settings__text">{{
            $t('languages.appSettings.AppIconUploadTip')
          }}</span>
        </div>
      </div>
    </div>
    <div v-if="isTabPane" class="base-settings__footer">
      <a-button type="primary" @click="save">
        {{ $t('languages.appSettings.save') }}
      </a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Upload, Input, Select, Button, Switch } from '@h3/antd-vue';
import appBaseApi from '@/apis/app-settings/base.api';
import I18nIcon from '@/components/global/i18n-icon.vue';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const icon = require('@/assets/images/appicon.png');

const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'base-setting',
  components: {
    I18nIcon,
    AInput: Input,
    ASelect: Select,
    AButton: Button,
    ASwitch: Switch,
    AUpload: Upload,
    ASelectOption: Select.Option,
  },
})
export default class BaseSetting extends Vue {
  @AppCenterModule.State('appInfo') appInfo: any;

  @AppCenterModule.State('appGroupList') catalogues: Array<any>;

  @AppCenterModule.State('appList') appList: any;

  @AppCenterModule.Action('getAppList') getAppList: any;

  @AppCenterModule.Action('updateAppPackage') updateAppPackage: any;

  @Prop() isTabPane?: boolean;

  // 上传的图片文件
  file: File | null = null;

  // 预览图片地址
  imgUrl: string = '';

  // 默认图标
  defaultIcon: any = icon;

  // 是否上传中
  uploading: boolean = false;

  created() {
    if (this.catalogues.length === 0) {
      this.getAppList({
        fromRecycle: false,
        groupCode: 'all',
        isLoad: true,
      });
    }
  }

  // 应用设置信息
  form: any = {
    code: '',
    name: '',
    groupId: '',
    enabled: true,
    logoUrlId: '',
    logoUrl: '',
    builtInApp: false,
  };

  /**
   * 保存应用基础设置
   */
  async save() {
    if (this.form.code && this.form.name) {
      if (this.file) {
        this.uploading = true;
        const res: AppSettings.uploadResponse = await appBaseApi.uploadFile({
          file: this.file,
          rewriteFilename: true,
        });
        if (res.errcode !== 0) {
          this.$message.error(res.errmsg as string);
          return;
        }
        this.form.logoUrlId = res.data.refId;
        this.uploading = false;
        this.file = null;
        // this.form.logoUrl = `${res.data.refId}` as any;
        this.form.logoUrl = this.form.logoUrlId;
        this.doSave();
      } else {
        this.doSave();
      }
    }
  }

  filterOption(input, option) {
    return (
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }

  /**
   * 提交保存数据到接口
   */
  doSave() {
    const params: any = Object.assign({}, this.form);
    // 多语言业务字段保存
    let nameI18n: any = {};
    let name: string = '';
    if (this.appInfo.name_i18n) {
      try {
        nameI18n = JSON.parse(this.appInfo.name_i18n);
      } catch (error) {
        nameI18n = {};
      }
    }
    if (!(this.$i18n.locale && this.$i18n.locale === 'en')) {
      /* eslint-disable-next-line */
      name = this.form.name;
      if (!nameI18n.en) {
        nameI18n.en = name;
      }
    } else {
      name = this.appInfo.name || this.form.name;
      nameI18n[this.$i18n.locale] = this.form.name;
    }

    params.name = name;
    params.displayName = name;
    params.name_i18n = JSON.stringify(nameI18n);

    this.updateAppPackage(params).then((res: Common.Data) => {
      if (res.errcode) {
        this.$message.error(res.errmsg as string);
      } else {
        this.$emit('refresh');
        this.$message.success(
          this.$t('languages.appSettings.saveSuccessfully') as string,
        );
      }
    });
  }

  /**
   * 切换应用是否启用
   */
  toggleEnable(checked: boolean) {
    this.form.enabled = checked;
  }

  /**
   * 获取上传的应用图标并判断是否符合限制
   */
  beforeUpload(file: File) {
    this.uploading = true;
    this.$nextTick(() => {
      this.uploading = false;
    });
    const isPic = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);

    const isLimitSize = file.size / 1024 < 100;
    if (!isPic) {
      this.$message.error(
        this.$t('languages.appSettings.PlzUploadImageFile') as string,
      );
      return;
    }
    if (!isLimitSize) {
      this.$message.error(
        this.$t('languages.appSettings.ImageSizeTip', {
          size: '100KB',
        }) as string,
      );
      return;
    }
    if (isPic && isLimitSize) {
      this.file = file;
      const URL = window.URL || (window as any).webkitURL;
      this.imgUrl = URL.createObjectURL(file);
    }
  }

  /**
   * 多语言名称赋值
   */
  setLangName() {
    this.form.name = this.appInfo.name;
    try {
      const names: any = JSON.parse(this.appInfo.name_i18n);
      if (typeof names === 'object' && names[this.$i18n.locale]) {
        this.form.name = names[this.$i18n.locale];
      }
    } catch (e) {
      console.log(e);
    }
  }

  init() {
    const {
      code,
      name,
      enabled,
      logoUrlId,
      logoUrl,
      content,
      name_i18n,
      groupId,
    } = this.appInfo;

    this.form = {
      code,
      name,
      enabled,
      logoUrlId,
      groupId,
    };

    if (this.appList.length > 0) {
      this.appList.forEach((x) => {
        if (x.code === code) {
          this.form.builtInApp = x.builtInApp;
        }
      });
    }

    this.imgUrl = content
      ? `data:image/png;base64,${content}`
      : this.getDownloadUrl(logoUrl);
    this.setLangName();
  }

  // mounted() {
  //   this.init()
  // }

  @Watch('appInfo', { deep: true, immediate: true })
  onAppInfoChange() {
    this.init();
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrl(refId: string) {
    if (!refId) {
      return '';
    } else if (refId && refId.indexOf('http') > -1) {
      return refId;
    } else {
      return getDownloadUrlNew.getImageUrl(refId, 'application');
    }
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setLangName();
  }
}
</script>
<style lang="less" scoped>
.base-settings {
  padding: 0 24px;
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 24px;
    h3 {
      font-size: 18px;
      font-weight: 500;
      color: #000;
    }
  }
  &__form {
    text-align: left;
  }
  &__form-item {
    line-height: 32px;
    display: flex;
    // align-items: center;
    justify-content: flex-start;
    margin-bottom: 25px;
    > span {
      // align-items:
      line-height: 32px;
      display: inline-block;
      margin-right: 8px;
      color: rgba(17, 18, 24, 0.5);
    }
    > p {
      color: #111218;
    }

    input {
      width: 268px;
    }
  }
  &__upload,
  &__enable {
    align-items: flex-start;
  }
  // &__upload {
  //   >span {
  //     display: inline-block;
  //     height: 48px;
  //     line-height: 48px;
  //   }
  // }
  &__icon {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    i {
      visibility: hidden;
    }
    &:hover,
    &--loading {
      i {
        position: absolute;
        z-index: 9;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        color: #fff;
        text-align: center;
        line-height: 48px;
      }
      &:after {
        content: '';
        display: block;
        position: absolute;
        z-index: 5;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(17, 18, 24, 0.5);
      }
    }
    &:hover:not(&--loading) {
      /deep/i.h-icon-all-form-o {
        visibility: visible;
      }
    }
    &--loading {
      /deep/i.h-icon-all-loading-o {
        visibility: visible;
        animation: rotating 1s linear infinite;
      }
    }
  }
  &__text {
    display: block;
    margin-top: 4px;
    // margin-left: 15px;
    font-size: 12px;
    font-weight: 400;
    line-height: 22px;
    color: rgba(17, 18, 24, 0.5);
  }
  &__footer {
    position: absolute;
    z-index: 9;
    bottom: 52px;
    left: 0;
    right: 0;
    height: 52px;
    line-height: 52px;
    border-top: 1px solid #e8e8e8;
    text-align: center;
    background-color: #fff;
    align-items: center;
  }
}
</style>
<style>
@keyframes rotating {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes rotating {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

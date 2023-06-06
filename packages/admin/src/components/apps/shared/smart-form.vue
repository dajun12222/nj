<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <iphone-x v-if="mobile && isPreview">
    <mobile-form-renderer :controls="controls" />
  </iphone-x>

  <mobile-form-renderer v-else-if="mobile" :controls="controls" />

  <div v-else class="smart-form">
    <div>
      <pc-form-renderer
        ref="formRenderer"
        :class="{ 'has-form-border': preview.borderMode === 'open' }"
        :controls="controls"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { TemplateOptions } from '@/template/template';
import { FormControl, RendererControl } from 'cloudpivot/form/schema';
import { FormRendererHelper } from 'cloudpivot/form/src/renderer/components/form-renderer-helper';
import MobileFormRenderer from 'cloudpivot/form/src/renderer/components/mobile-form-renderer.vue';
import PcFormRenderer from 'cloudpivot/form/src/renderer/components/pc-form-renderer.vue';
import { FormGroup } from 'cloudpivot-forms';
import { Component, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import IphoneX from './iphone-x.vue';

export interface PreviewOptions {
  controls: { [key: string]: FormControl };

  layout: string[][];

  borderMode: string;

  layoutType: string;
}

@Component({
  name: 'smart-form',
  components: {
    MobileFormRenderer,
    PcFormRenderer,
    IphoneX,
  },
})
export default class SmartForm extends Vue {
  @Prop()
  template!: TemplateOptions;

  @Prop()
  preview!: PreviewOptions;

  @Prop()
  mobile!: boolean;

  controls: RendererControl[] = [];

  formControls: any[] = [];

  private _controller?: FormGroup;

  private _proxy?: any;

  private isPreview = true;

  private _formObject?: any;

  @Provide()
  layoutTypeFn() {
    return this.preview && this.preview.layoutType === 'vertical';
  }

  /**
   * 表单预览
   */
  @Watch('preview', {
    immediate: true,
  })
  setPreview(opts: PreviewOptions) {
    if (!opts || !opts.controls) {
      return;
    }
    const controls = FormRendererHelper.convertDesign(
      JSON.parse(JSON.stringify(opts.controls)),
      opts.layout,
    );

    const formControls: any[] = [];
    FormRendererHelper.findFormControl(controls, formControls);
    FormRendererHelper.mergeValue(formControls, {}, true);

    this.controls = controls;
    this.formControls = formControls;
    // const reverseRelevances = formControls.filter(c => c.type === schema.FormControlType.ReverseRelevance && c.options.listDisplayMode === schema.ListDispalyMode.Tabs);
    this.edit();
  }

  @Watch('template', {
    immediate: true,
  })
  run(tpl: TemplateOptions) {
    if (!tpl || !tpl.template) {
      return;
    }

    this.isPreview = false;
    const controls = FormRendererHelper.convertTemplate(tpl.template);

    FormRendererHelper.mergeValue(controls as any[], {}, true);

    this.controls = controls;
  }

  edit() {
    setTimeout(() => {
      const renderer = this.$refs.formRenderer as any;
      if (renderer) {
        renderer.edit();
      }
    }, 1000);
  }

  destroyed() {}
}
</script>

<style lang="less">
@import './mobile.less';
</style>

<style lang="less" scoped>
.smart-form {
  text-align: left;
}
/deep/.field__label {
  min-width: 102px !important;
  max-width: 102px !important;
  .field__label-div {
    width: 102px;
  }

  &.top {
    padding-top: 0.4em;
    align-items: flex-start !important;
  }
}

/deep/.vertical {
  .field__label {
    width: 100%;
    max-width: 100% !important;
    .field__label-div {
      width: unset;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

/deep/.field__control {
  color: #111218;
}

/deep/.ant-row-flex {
  .field.system .field__control {
    padding-left: 5px;
  }

  .field.system {
    padding-left: 0;
    padding-right: 0;
    .field__label {
      flex-grow: 0;
      max-width: none;
      margin-right: 0;
      // margin-left: 8px;
    }
  }

  & > .ant-col:first-child > .field.system {
    .field__label {
      min-width: 1em;
      width: auto;
      margin-right: 0;
      justify-content: flex-start;
      flex-grow: 0 !important;
    }
  }

  & > .ant-col:last-child > .field.system {
    .field__label {
      flex-grow: 0;
      margin-right: 0;
      max-width: none;
    }

    .field__control {
      flex-grow: 0;
      flex-shrink: 0;
      // justify-content: flex-end;
    }
  }
}
.smart-form {
  /deep/.ant-tabs-nav-scroll {
    text-align: left;
  }
  /deep/.ant-tabs-content {
    .ant-row-flex {
      padding: 0 16px;
    }
  }
  /deep/.ant-row-flex {
    margin: 0 -16px;
    &.system-info-box {
      margin-bottom: 14px;
    }
    .ant-col-6,
    .ant-col-8,
    .ant-col-12,
    .ant-col-16,
    .ant-col-18,
    .ant-col-24 {
      padding: 0 16px;
    }
  }
  .has-form-border {
    /deep/& > .ant-row-flex {
      .spanFillUp {
        &::before {
          position: absolute;
          left: 0;
          bottom: 0;
          content: '';
          width: 100%;
          border-top: 1px solid #d9d9d9;
          z-index: 1;
        }
      }
    }
    /deep/.ant-row-flex {
      margin: unset;
      &.system-info-box {
        margin-bottom: 14px;
      }
      .ant-tabs-tabpane {
        .spanFillUp {
          &::before {
            position: absolute;
            left: 0;
            bottom: 0;
            content: '';
            width: 100%;
            border-top: 1px solid #d9d9d9;
            z-index: 1;
          }
        }
      }
      .ant-col-6,
      .ant-col-8,
      .ant-col-12,
      .ant-col-16,
      .ant-col-18,
      .ant-col-24 {
        padding: unset;
      }
    }
  }
}
</style>

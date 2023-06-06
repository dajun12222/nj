<template>
  <div class="form-forward">
    <div
      class="field"
      :class="{
        error: form.participantors.hasError,
        required: form.participantors.required,
      }"
    >
      <div class="field__label field__label-title">
        {{ $t('cloudpivot.form.runtime.modal.selectUser', { text: text }) }}
        <span v-show="form.participantors.required" style="color: #f0353f">*</span>
      </div>
      <div class="field__control">
        <a-tooltip>
          <template v-if="form.participantors.hasError" slot="title">
            <p>
              {{
                $t('cloudpivot.form.runtime.modal.pleaseSelectUser', {
                  text: text,
                })
              }}
            </p>
          </template>
          <div>
            <staff-selector
              v-model="form.participantors.value"
              displayType="plus"
              :options="staffSelectorOpts"
              :params="{
                workflowInstanceId: !['转办', '传阅'].includes(text)
                  ? workflowInstanceId
                  : undefined,
                activityCode: !['转办', '传阅'].includes(text)
                  ? activityCode
                  : undefined,
                sourceType: 'portal',
              }"
            />
          </div>
        </a-tooltip>
      </div>
    </div>

    <div
      class="field"
      :class="{
        error: form.comment.hasError,
        required: form.comment.required,
      }"
    >
      <div class="field__label top field__label-title">
        {{ $t('cloudpivot.form.runtime.modal.explain', { text: text }) }}
        <span v-show="form.comment.required" style="color: #f0353f">*</span>
      </div>
      <div class="field__control">
        <a-tooltip>
          <template v-if="form.comment.hasError" slot="title">
            <p>
              {{
                $t('cloudpivot.form.runtime.modal.pleaseInputExplain', {
                  text: text,
                })
              }}
            </p>
          </template>

          <div class="h3-textarea-box">
            <h3-textarea
              v-model="form.comment.value"
              :placeholder="$t('cloudpivot.form.runtime.modal.pleaseInput')"
              :maxLength="500"
            />
          </div>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { workflow, workflowApi } from '../../../../../api';
import { Input, Tooltip } from '@h3/antd-vue';
import { FormBuilder, FormControlType } from 'cloudpivot-forms';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import pc from '../../../renderer/components/pc';
import { FormAction } from '../../form-action';
import {
  FormActionComponent,
  FormActionModalOptions,
} from '../../form-action-modal';

@Component({
  name: 'form-forward',
  components: {
    ATextarea: Input.TextArea,
    ATooltip: Tooltip,
    StaffSelector: pc.StaffSelector,
    H3Textarea: pc.H3Textarea,
  },
})
export default class FormForward extends Vue implements FormActionComponent {
  @Prop()
  options!: FormActionModalOptions;

  comment = '';

  staff = '' as any;

  staffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '',
    filterUser: [],
  };

  formGroup = this.createFormGroup();

  get text() {
    return this.options ? this.options.title : '';
  }

  get isCirculate() {
    return this.options && this.options.code === FormAction.Circulate;
  }

  get form() {
    return this.formGroup ? this.formGroup.children : null;
  }

  get workflowInstanceId() {
    return this.options.data.workflowInstanceId
      ? this.options.data.workflowInstanceId
      : '';
  }

  get activityCode() {
    return this.options.data.activityCode ? this.options.data.activityCode : '';
  }

  createFormGroup() {
    const group = FormBuilder.build({
      participantors: {
        type: FormControlType.Radio,
        options: {
          required: true,
        },
      },
      comment: {
        type: FormControlType.Radio,
        options: {
          required: true,
        },
      },
    });

    return group;
  }

  // /**
  //  * 选人控件placeholder多语言
  //  */
  // placeHolderLang(){
  //   this.staffSelectorOpts.placeholder = this.$t('cloudpivot.flowCenter.pc.plzSelect') as string;
  // }

  // @Watch('$i18n.locale')
  // onLanguageChange(l:string) {
  //   this.placeHolderLang();
  // }

  @Watch('options', {
    immediate: true,
  })
  setOptions(opts: FormActionModalOptions) {
    if (!opts) {
      return;
    }

    if (this.form) {
      (this.form.comment as any).required = !this.isCirculate;
    }
    this.$set(
      this.staffSelectorOpts,
      'mulpitle',
      opts.code !== FormAction.Forward,
    );
    this.$set(
      this.staffSelectorOpts,
      'placeholder',
      this.$t('cloudpivot.form.runtime.modal.pleaseChoose'),
    );
    if (opts.code === FormAction.AdjustParticipant) {
      this.loadBaseInfo(opts);
    }
  }

  async loadBaseInfo(opts: FormActionModalOptions) {
    //加签状态选择加签人员过滤当前处理人
    const params: workflow.GetWorkflowTrackParams = {
      workflowInstanceId: opts.data.workflowInstanceId,
    };
    const res = await workflowApi.getWorkflowBaseInfo(params);
    if (res.errcode === 0 && res.data) {
      //@ts-ignore
      this.staffSelectorOpts.filterUser = res.data.participants[0].participants;
    }
  }

  submit() {
    // ;
    //
    // const data = this.formGroup.value;
    if (this.formGroup && this.formGroup.validate() === false) {
      // if (data.participantors)
      if (this.form && (this.form.participantors as any).hasError) {
        this.$message.error(
          this.$t('cloudpivot.form.runtime.modal.pleaseSelectUser', {
            text: this.text,
          }) as string,
        );
        return;
      }
      if (this.form && (this.form.comment as any).hasError) {
        this.$message.error(
          this.$t('cloudpivot.form.runtime.modal.pleaseInputExplain', {
            text: this.text,
          }) as string,
        );
        return;
      }
      return;
    }

    const data = this.formGroup.value;

    return data;
  }

  // mounted(){
  //   this.placeHolderLang();
  // }
}
</script>

<style lang="less">
.field__label.field__label-title {
  margin-bottom: 6px;
  color: #111218;
  font-size: 14px;
  font-weight: 400;
}
.field__label.top {
  padding-top: 7px;
}

.form-forward {
  min-height: 268px;
  .field {
    padding-top: 0;
    .h3-textarea-box .h3-textarea {
      border-radius: 2px;
    }
  }

  .field__label:before {
    display: none;
  }

  textarea {
    resize: none;
    min-height: 75px;
    max-height: 75px;
  }
}
</style>

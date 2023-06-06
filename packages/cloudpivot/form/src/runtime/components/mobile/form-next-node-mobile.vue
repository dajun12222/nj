<template>
  <div class="form-submit">
    <span v-for="(i, v) in list" :key="v">
      <h3-panel
        :align="'left'"
        :collapsed="false"
        :collapsible="false"
        :iconRight="false"
        :labelStyle="style"
        :title="$t('cloudpivot.form.runtime.modal.nextNode') + `${v + 1}`"
      >
        <slot>
          <template>
            <h3-field
              :label="$t('cloudpivot.form.runtime.modal.nextNodeName')"
              :readOnly="true"
              :showIcon="false"
            >
              <div :class="{ field__control: true }">
                {{ i.activityName }}
              </div>
            </h3-field>
            <template v-if="nextNodeParticipant === 'PARTICIPANT'">
              <h3-radio-list
                v-if="i.participantType === 'SINGLE_PARTICIPANT'"
                v-control-back
                :cancelText="$t('cloudpivot.form.renderer.cancel')"
                :checkAllText="$t('cloudpivot.form.renderer.checkAll')"
                :clearText="$t('cloudpivot.form.renderer.clear')"
                :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
                :okText="$t('cloudpivot.form.renderer.ok')"
                :options="i.participants"
                :placeHolder="$t('cloudpivot.form.runtime.modal.pleaseInput')"
                :required="true"
                :title="$t('cloudpivot.form.runtime.modal.participantChoose')"
                :value="i.participantList"
                :wrapClassName="'form-reject-checkbox'"
                class="form-reject-checkbox-list"
                showMode="0"
                @onChange="(e) => radioChange(e, i)"
                @onClear="(e) => radioChange(e, i)"
              />
              <h3-checkbox-list
                v-else
                :cancelText="$t('cloudpivot.form.renderer.cancel')"
                :checkAllText="$t('cloudpivot.form.renderer.checkAll')"
                :clearText="$t('cloudpivot.form.renderer.clear')"
                :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
                :okText="$t('cloudpivot.form.renderer.ok')"
                :options="i.participants"
                :placeHolder="$t('cloudpivot.form.runtime.modal.pleaseInput')"
                :required="true"
                :title="$t('cloudpivot.form.runtime.modal.participantChoose')"
                :value="val[v]"
                :wrapClassName="'form-reject-checkbox'"
                class="form-reject-checkbox-list"
                showMode="0"
                @input="(e) => checkboxChange(e, i)"
                @onChange="(e) => checkboxChange(e, i)"
                @onClear="(e) => checkboxChange(e, i)"
              />
            </template>
            <template v-else-if="nextNodeParticipant === 'ORGANIZATION'">
              <mobile-staff-selector
                v-model="i.participantList"
                :class="{ error: staffError }"
                :options="
                  staffSelectorOpts(i.participantType === 'SINGLE_PARTICIPANT')
                "
                :params="{ sourceType: 'portal' }"
                :required="true"
                :title="$t('cloudpivot.form.runtime.modal.participantChoose')"
              />
            </template>
          </template>
        </slot>
      </h3-panel>
    </span>
  </div>
</template>

<script lang="ts">
import common from '../../../../../common/pc';
import MobileStaffSelector from '../../../../../form/src/common/components/form-staff-selector/mobile/mobile-staff-selector.vue';
import StaffSelector from '../../../../../form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import { H3CheckboxList, H3Field, H3RadioList } from 'h3-mobile-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  FormActionComponent,
  FormActionModalOptions,
} from '../../form-action-modal';

@Component({
  name: 'FormNextNodeMobile',
  components: {
    StaffSelector,
    H3CheckboxList,
    H3RadioList,
    H3Field,
    MobileStaffSelector: MobileStaffSelector,
    H3Panel: common.components.Panel,
  },
})
export default class FormNextNodeMobile
  extends Vue
  implements FormActionComponent
{
  list: any = [];

  style = {
    paddingLeft: '15px',
  };

  staffError = false;

  // ORGANIZATION，PARTICIPANT
  nextNodeParticipant = 'PARTICIPANT';

  val: any[] = [];

  deptId: any = '';

  staffSelectorOpts(mulpitle: any) {
    return {
      selectOrg: false,
      selectUser: true,
      showModel: true,
      mulpitle: !mulpitle,
      showSelect: true,
      placeholder: '',
    };
  }

  @Prop()
  options!: FormActionModalOptions;

  @Watch('options', {
    immediate: true,
  })
  setOptions(opts: FormActionModalOptions) {
    if (!opts) {
      return false;
    }
    const formObject = opts.data;
    this.nextNodeParticipant = formObject.nextNodeParticipant;
    this.deptId = opts.deptId;
    this.list = formObject.participantInfos.map((i) => {
      i.participants = i.participants.map((v, c) => {
        return {
          label: v.name,
          value: v.id,
          level: c,
          checked: false,
        };
      });
      if (i.participantType === 'MULTI_PARTICIPANT') {
        this.val.push([]);
      }
      return i;
    });
  }

  radioChange(value: any, e: any) {
    this.list = this.list.map((i) => {
      if (i.activityCode === e.activityCode) {
        i.participantList = value.value;
      }
      return i;
    });
  }

  checkboxChange(value: any, e: any) {
    this.list = this.list.map((i) => {
      if (i.activityCode === e.activityCode) {
        i.participantList = value;
      }
      return i;
    });
  }

  submit() {
    const status: any = [];
    this.list.forEach((i) => {
      if (
        !i.participantList ||
        (Array.isArray(i.participantList) && i.participantList.length <= 0)
      ) {
        status.push(i);
      }
    });
    if (status.length > 0) {
      this.$h3.modal.show({
        type: 'alert',
        title: this.$t('cloudpivot.form.runtime.modal.nextNodeTips', {
          nodeName: status[0].activityName,
        }),
        actions: [
          {
            text: this.$t(
              'cloudpivot.form.runtime.modal.selectParticipant',
            ).toString(),
            onPress: () => undefined,
          },
          {
            text: this.$t('cloudpivot.form.runtime.modal.yes').toString(),
            onPress: () => {
              const arr = this.changeData();
              this.$emit('nodeOk', {
                participantInfos: arr,
                deptId: this.deptId,
              });
            },
          },
        ],
      });
    } else {
      const arr = this.changeData();
      return { participantInfos: arr, deptId: this.deptId };
    }
  }

  changeData() {
    let arr = JSON.parse(JSON.stringify(this.list));
    if (this.nextNodeParticipant === 'ORGANIZATION') {
      arr = arr.map((i) => {
        i.participantList = i.participantList.map((v) => v.id);
        return i;
      });
    }
    return arr;
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-radio-wrapper {
  display: block;
}

.field__control__checkbox {
  /deep/ .ant-checkbox-wrapper {
    display: block;
    margin-bottom: 10px;
  }
}

.form-submit {
  position: relative;

  .ant-checkbox-wrapper {
    display: block;
    margin-left: 0;
    margin-bottom: 10px;
  }

  .error {
    color: #f5222d;
    font-size: 12px;
    position: absolute;
    bottom: -22px;
    left: 0;
  }
}
</style>

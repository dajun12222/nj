<script lang="ts">
import {
  formatterComponentType,
  getMobileComponentByControlType,
} from '../../../../../form/utils';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  FormControlType,
  FormHtmlControl,
  RendererFormControl,
} from '../../typings';
import InputDateRange from './input-date-range.vue';
import InputNumberRange from './input-number-range.vue';
import InputTimeRange from './input-time-range.vue';

@Component({
  name: 'base-control-adapter',
  components: {
    // Upload,
    // CheckboxGroup,
    // Dropdown,
    // InputText,
    // InputNumber,
    // InputDate,
    // InputLogic,
    // InputLocation,
    // ApproveOpinion,
    InputDateRange,
    InputNumberRange,
    InputTimeRange,
    // RelevanceForm,
    // ReverseRelevance,
    // InputAddress,
    // InputSignsture
  },
})
export default class BaseControlAdapter extends Vue {
  @Prop()
  control!: RendererFormControl;

  render(h: Function) {
    const control = this.control;

    const type = control.type;

    if (this.control.type === FormControlType.Label) {
      return h('label', [control.controller.value]);
    }
    const opts = {
      props: Object.assign(
        {
          control: control,
        },
        this.$attrs,
      ),
    };
    const mobileComponent = getMobileComponentByControlType(control.type);

    if (mobileComponent && mobileComponent.mobile) {
      const components = this.$options.components;
      if (components) {
        return h(formatterComponentType(mobileComponent.key), {
          props: {
            control,
          },
        });
      }
    }
    switch (control.type) {
      // case FormControlType.Text:
      // case FormControlType.Textarea:
      //   return h("input-text", opts);

      // case FormControlType.Date:
      //   return h("input-date", opts);
      case FormControlType.DateRange:
        return h('input-date-range', opts);
      case FormControlType.TimeRange:
        return h('input-time-range', opts);

      // case FormControlType.Number:
      //   return h("input-number", opts);
      case FormControlType.NumberRange:
        return h('input-number-range', opts);

      // case FormControlType.Location:
      //   return h("input-location", opts);

      // case FormControlType.Logic:
      //   return h("input-logic", opts);

      // case FormControlType.Radio:
      // case FormControlType.Checkbox:
      //   return h("checkbox-group", opts);

      // case FormControlType.Dropdown:
      //   return h("dropdown", opts);

      // case FormControlType.Attachment:
      // case FormControlType.Image:
      //   return h("upload", opts);
      // case FormControlType.Signature:
      //   return h("input-signsture", opts)

      // case FormControlType.Address:
      //   return h("input-address", opts);

      // case FormControlType.StaffSelector:
      // case FormControlType.StaffMultiSelector:
      // case FormControlType.DepartmentSelector:
      // case FormControlType.DepartmentMultiSelector:
      //   return h("form-staff-selector", opts);

      // case FormControlType.Address:
      //   return h("address", opts);

      // case FormControlType.RelevanceForm:
      //   return h("relevance-form", opts);

      // case FormControlType.ReverseRelevance:
      //   return h("reverse-relevance", opts);

      case FormControlType.Html:
        return this.createHtml(h, control as any);
      default:
        break;
    }
  }

  createHtml(h: Function, hc: FormHtmlControl) {
    const attrs: any = {};
    hc.attrs.forEach((a) => (attrs[a.name] = a.value));
    const domProps = {
      innerHTML: hc.innerHTML,
    };
    return h(hc.tagName, {
      attrs,
      domProps,
    });
  }

  @Watch('control')
  onControlChange() {
    const mobileInfo = getMobileComponentByControlType(this.control.type);
    if (mobileInfo && mobileInfo.mobile) {
      const components = this.$options.components;
      if (components) {
        components[formatterComponentType(mobileInfo.key)] = mobileInfo.mobile;
      }
    }
  }

  created() {
    const mobileInfo = getMobileComponentByControlType(this.control.type);
    if (mobileInfo && mobileInfo.mobile) {
      const components = this.$options.components;
      if (components) {
        components[formatterComponentType(mobileInfo.key)] = mobileInfo.mobile;
      }
    }
  }
}
</script>

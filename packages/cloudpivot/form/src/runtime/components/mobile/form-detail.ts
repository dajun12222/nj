import { FormDetail } from '../form-detail';

export abstract class MobileFormDetail extends FormDetail {
  error = '';

  get isMobile() {
    return true;
  }

  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        const formRenderer = this.$refs.formRenderer as any;
        if (!formRenderer) {
          return;
        }
        this.$watch(
          () => formRenderer.getErrors(),
          (errors: any) => {
            if (errors) {
              console.log(errors);
              const keys = Object.keys(errors);
              if (keys.length > 0) {
                const key = keys[0];
                this.error = formRenderer.getErrorMessage(key, errors[key][0]);
                return;
              }
            }
            this.error = '';
          },
          {
            immediate: true,
          },
        );
      }, 200);
    });
  }
}

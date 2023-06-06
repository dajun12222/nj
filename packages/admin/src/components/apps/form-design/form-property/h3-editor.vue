<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <textarea
    ref="kindeditor"
    name="content"
    style="width: 100%; height: 200px; border: none"
  ></textarea>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import kindEditor from 'cloudpivot-kindeditor/src/kindeditor-all.js';

@Component({
  name: 'h3-editor',
  components: {},
})
export default class H3Editor extends Vue {
  @Prop({
    default: 'zh',
  })
  locale!: string;

  @Prop({
    default: false,
  })
  disabled!: boolean;

  @Prop()
  field!: string;

  @Prop()
  value!: string;

  beforeCreate() {
    const vm: any = this;

    if (!(window as any).KindEditor) {
      if (kindEditor.addEventListener) {
        kindEditor.addEventListener(
          'load',
          function () {
            vm.loadComplete();
          },
          false,
        );
      } else if (kindEditor.attachEvent) {
        kindEditor.attachEvent('onreadystatechange', function () {
          const target: any = (window as any).event.srcElement;
          if (target.readyState === 'loaded') {
            vm.loadComplete();
          }
        });
      } else {
        //Else Empty block statement
      }
      document.body.appendChild(kindEditor);
    }
  }

  editor: any = null;

  loadComplete() {
    this.loadKindEditor();
  }

  loadKindEditor() {
    const vm = this;
    const options: any = {
      readonlyMode: this.disabled,
      afterChange() {
        vm.change();
      },
      afterFocus() {
        vm.onFocus();
      },
      afterBlur() {
        vm.onBlur();
      },
      allowFileManager: true,
      themeType: 'customize',
      resizeType: 1,
      uploadJson: '/api/aliyun/upload',
      items: [
        'justifyleft',
        'justifycenter',
        'justifyright',
        'formatblock',
        'forecolor',
        'hilitecolor',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'link',
        'unlink',
        'image',
      ],
    };
    if (!(window as any).KindEditor) {
      return;
    }
    if (!this.editor) {
      this.editor = (window as any).KindEditor.create(
        this.$refs.kindeditor,
        options,
      );
    }
    if (this.value) {
      this.editor.html(this.value);
    }
  }

  mounted() {
    this.loadKindEditor();
  }

  inputting = false;

  onFocus() {
    this.inputting = true;
  }

  onBlur() {
    this.inputting = false;
  }

  beforeDestroy() {
    (window as any).KindEditor.remove(this.$refs.kindeditor);
  }

  change() {
    if (this.editor) {
      const val = this.editor.html();
      this.$emit('change', this.field, val);
    }
  }

  @Watch('value', {
    immediate: true,
  })
  valOnchange(val, oval = '') {
    if (val === oval) {
      return;
    }
    if (this.editor) {
      if (this.inputting) {
        return;
      }
      this.editor.html(val);
    }
  }
}
</script>

<style lang="less">
//@import '/kindeditor/themes/customize.css';
@import '~cloudpivot-kindeditor/src/themes/default/default.css';
@import '~cloudpivot-kindeditor/src/plugins/code/prettify.css';
.textarea .tox .tox-menubar {
  background-color: #f5f5f5;
}
.textarea .tox .tox-toolbar__primary {
  background-color: #f5f5f5;
}
</style>

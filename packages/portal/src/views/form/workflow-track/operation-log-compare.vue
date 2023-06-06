<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="operation-log-compare">
    <div class="header form-header">
      <h4>
        <label>{{ $t('languages.common.formTitle.viewWorkflow') }}-{{ formName }}-{{
            $t('languages.common.form.Logs')
          }}</label>
      </h4>
      <div class="header-right">
        <div
          v-if="!isEl && ['DINGTALK', 'WECHAT'].includes(relatedType)"
          class="qrcode"
          @mouseover="showBigQrcode = true"
          @mouseout="showBigQrcode = false"
          @click.stop="showBigQrcode = true"
        >
          <span>
            <a-icon type="qrcode" />{{ $t('languages.common.form.qrcode') }}
          </span>
          <div v-show="showBigQrcode" class="qrcode-enlarge">
            <img :src="url" />
            <p>
              <!-- {{relatedType === "WECHAT" ? "企业微信" : "钉钉"}}扫码查看数据 -->
              {{
                $t('languages.common.form.scanCodeView', {
                  equip:
                    relatedType === 'WECHAT'
                      ? $t('languages.common.form.enterpriseWechet')
                      : $t('languages.common.form.dingtalk'),
                })
              }}
            </p>
          </div>
        </div>
        <div @click="copyURL">
          <span><a-icon type="copy" />{{
              $t('languages.common.form.CopyLink')
            }}</span>
        </div>

        <div v-if="isInIframe && isParentInIfram" @click.prevent="openBlank">
          <span>
            <a-icon type="select" />
            {{ $t('languages.common.form.OpenInNewPage') }}
          </span>
        </div>
      </div>
    </div>

    <div class="c-box">
      <a-tabs class="operation-log__tabs dark-tabs">
        <a-tab-pane
          key="1"
          :tab="$t('languages.common.postEdit')"
          :style="{
            padding: isInIframe && isParentInIfram ? '0 70px' : 'unset',
          }"
        >
          <pc-form-renderer
            ref="formRenderer"
            :class="{ 'has-form-border': borderMode }"
            :controls="currControls"
          />
        </a-tab-pane>
        <a-tab-pane
          key="2"
          :tab="$t('languages.common.preEdit')"
          :style="{
            padding: isInIframe && isParentInIfram ? '0 70px' : 'unset',
          }"
        >
          <pc-form-renderer
            v-if="preControls"
            ref="formRenderer"
            :class="{ 'has-form-border': borderMode }"
            :controls="preControls"
          />
          <div v-else>
            {{ $t('languages.common.noHistoryRec') }}
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script lang="ts">
import { workflowApi } from 'cloudpivot/api';
import * as pcForm from 'cloudpivot/form/pc';
import { FormRendererHelper } from 'cloudpivot/form/src/renderer/components/form-renderer-helper';
import {
  DropdownOptions,
  FormControlType,
  RendererControl,
  RendererFormControl,
} from 'cloudpivot/form/src/schema';
import { Button, Icon, Tabs } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { externalLinkApi } from 'cloudpivot/api';
import OAuthApi from '@/apis/oauth';
import 'cloudpivot/common/src/config/portal/h3-form';

@Component({
  name: 'operation-log-compare',
  components: {
    AIcon: Icon,
    AButton: Button,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    PcFormRenderer: pcForm.renderer.FormRenderer,
  },
})
export default class OperationLogCompare extends Vue {
  currControls: any = '';

  preControls: any = '';

  formControls: any = '';

  borderMode = false;

  isInIframe: boolean = false;

  isParentInIfram: boolean = false;

  url = '';

  showBigQrcode = false;

  relatedType: string = '';

  formName: string = '';

  /**
   * 是否是外链
   */
  get isEl(): boolean {
    return !!(window as any).externalLinkToken;
  }

  mounted() {
    this.isInIframe = window.top !== window.self;
    this.isParentInIfram = window.top !== window.parent;
    this.getLogs();

    if (this.isInIframe && this.isParentInIfram) {
      const node: any = document.querySelector('.ant-tabs-nav-wrap');
      const child: any = document.querySelector('.ant-tabs-nav-wrap div');
      const spanEle: any = document.createElement('span');
      spanEle.innerText = this.$t('languages.common.form.Back');
      spanEle.className = 'back';
      spanEle.onclick = () => {
        window.parent.postMessage('closeIfr', origin);
      };
      node.insertBefore(spanEle, child);
    }
  }

  get isEng() {
    const isEng = localStorage.getItem('locale');
    if (isEng === 'zh') {
      return false;
    } else if (isEng === 'en') {
      return true;
    } else {
      //Else Empty block statement
    }
  }

  async getLogs() {
    const { logid } = this.$route.params;
    const res: any = await workflowApi.compareOperationLog(logid);
    console.log(res);
    this.initFrom(res.data);
  }

  async initFrom(data: any) {
    const { workflowInstanceId, workItemId } = this.$route.params;

    let user: any = sessionStorage.getItem('user');
    if (user) {
      user = JSON.parse(user);
      const config = {
        corpId: user.corpId,
        agentId: user.agentId,
        mobileServerUrl: user.mobileServerUrl,
        relatedType: user.relatedType,
      };
      const { relatedType } = config;
      const { corpId, agentId } = config;

      this.relatedType = relatedType;

      let signinUrl = `${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&corpId=${corpId}&agentId=${agentId}&mode=form`;
      if (relatedType === 'WECHAT') {
        this.relatedType = 'WECHAT';
        // 企业微信端
        signinUrl = encodeURIComponent(signinUrl);
        signinUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${signinUrl}&state=STATE&scope=snsapi_base#wechat_redirect`;
      }

      const params: OAuth.ShortCodeParams = {
        url: signinUrl,
        type: 7, //type为5表示扫码登陆
        expireTime: -1, //五分钟失效
      };
      OAuthApi.getShortCode(params).then((result) => {
        if (result.errcode === 0) {
          externalLinkApi
            .generateQrcode(
              `${location.origin}/api/public/short_code/to/${result.data}`,
            )
            .then((res: any) => {
              const bytes = new Uint8Array(res);
              let data = '';
              const len = bytes.byteLength;
              for (let i = 0; i < len; i++) {
                data += String.fromCharCode(bytes[i]);
              }
              this.url = 'data:image/png;base64,' + window.btoa(data);
            });
        } else {
          this.$message.warning('获取短码失败');
        }
      });
    }

    const currDataDetail = data.postBizObjectLog ? data.postBizObjectLog : '';
    const preDataDetail = data.prevBizObjectLog ? data.prevBizObjectLog : '';
    const bizSheet = data.bizSheet;
    const formControls = JSON.parse(bizSheet.publishedAttributesJson);
    const layout = JSON.parse(bizSheet.publishedViewJson) as string[][];
    this.formName =
      data && data.bizSheet && this.isEng
        ? data.bizSheet.name_i18n && JSON.parse(data.bizSheet.name_i18n).en
        : data.bizSheet.name;

    this.borderMode = !!bizSheet.borderMode;
    this.handleApproval(formControls, layout);

    this.currControls = this.buildControl(
      formControls,
      layout,
      currDataDetail,
      bizSheet,
    );
    if (preDataDetail) {
      this.preControls = this.buildControl(
        formControls,
        layout,
        preDataDetail,
        bizSheet,
      );
      const [curr, pre] = this.diffControls(
        this.currControls,
        this.preControls,
      ); // 对比两个表单
    }
  }

  // 构建 渲染表单的 controls
  buildControl(formControls, layout, dataDetail, bizSheet) {
    const _formControls = JSON.parse(JSON.stringify(formControls));
    const _layout = JSON.parse(JSON.stringify(layout));
    const _dataDetail = JSON.parse(JSON.stringify(dataDetail));
    const currData =
      (_dataDetail.bizObjectData && _dataDetail.bizObjectData.data) || {};
    const controls = FormRendererHelper.convertDesign(_formControls, _layout);
    const new_formControls: RendererFormControl[] = [];
    FormRendererHelper.findFormControl(controls, new_formControls);

    const titleControl = new_formControls.find(
      (c) => c.type === FormControlType.Title,
    );
    if (titleControl && currData.name) {
      titleControl.options.name = currData.name;
    }
    if (dataDetail.bizObjectData) {
      this.toFormData(
        controls,
        currData,
        bizSheet,
        dataDetail.bizObjectData,
        dataDetail.workItemId,
      );
    }

    FormRendererHelper.mergeValue(new_formControls, currData, true);
    return controls;
  }

  // 对比当前controls 和 preControls数据变化
  diffControls(currControls, preControls) {
    if (currControls.length === 0 && preControls.length === 0) {
      return [[], []];
    }
    const l = Math.max(currControls.length, preControls.length);
    for (let i = 0; i < l; i++) {
      const curr = currControls[i];
      const pre = preControls[i];
      if (curr.type && curr.type === pre.type && curr.key === pre.key) {
        if (curr.value && pre.value) {
          if (
            typeof curr.value === 'string' ||
            typeof curr.value === 'number' ||
            typeof curr.value === 'boolean'
          ) {
            if (curr.value !== pre.value) {
              curr.diff = true;
              pre.diff = true;
            }
          } else {
            const cType = curr.type;
            switch (cType) {
              case FormControlType.CreateBy:
                if (
                  curr.value.length !== pre.value.length ||
                  (curr.value.length &&
                    curr.value[0].name !== pre.value[0].name)
                ) {
                  curr.diff = true;
                  pre.diff = true;
                }
                break;
              case FormControlType.Checkbox:
              case FormControlType.Dropdown:
              case FormControlType.DropdownMulti:
                if (
                  curr.value.length !== pre.value.length ||
                  (curr.value.length &&
                    curr.value.join(',') !== pre.value.join(','))
                ) {
                  curr.diff = true;
                  pre.diff = true;
                }
                break;
              case FormControlType.Attachment:
              case FormControlType.Image:
                if (
                  curr.value.length === pre.value.length &&
                  curr.value.length
                ) {
                  const cUid = curr.value.reduce((c, v) => {
                    return `${c}${v.uid}`;
                  }, '');
                  const rUid = pre.value.reduce((c, v) => {
                    return `${c}${v.uid}`;
                  }, '');
                  if (cUid !== rUid) {
                    curr.diff = true;
                    pre.diff = true;
                  }
                } else if (curr.value.length !== pre.value.length) {
                  curr.diff = true;
                  pre.diff = true;
                } else {
                  //Else Empty block statement
                }
                break;
              case FormControlType.Location:
                if (curr.value.address !== pre.value.address) {
                  curr.diff = true;
                  pre.diff = true;
                }
                break;
              case FormControlType.Signature:
              case FormControlType.StaffSelector:
              case FormControlType.StaffMultiSelector:
              case FormControlType.DepartmentSelector:
              case FormControlType.DepartmentMultiSelector:
                if (
                  curr.value.length === pre.value.length &&
                  curr.value.length
                ) {
                  const cid = curr.value.reduce((c, v) => {
                    return `${c}${v.id}`;
                  }, '');
                  const rid = pre.value.reduce((c, v) => {
                    return `${c}${v.id}`;
                  }, '');
                  if (cid !== rid) {
                    curr.diff = true;
                    pre.diff = true;
                  }
                } else if (curr.value.length !== pre.value.length) {
                  curr.diff = true;
                  pre.diff = true;
                } else {
                  //Else Empty block statement
                }
                break;
              case FormControlType.Sheet:
                console.info('子表对比开始 =>');
                if (
                  curr.value.length === pre.value.length &&
                  curr.value.length
                ) {
                  const sheet_diff = this._diffSheet(
                    curr,
                    pre,
                    curr.value.length,
                  );
                  curr.diff = sheet_diff;
                  pre.diff = sheet_diff;
                } else if (curr.value.length !== pre.value.length) {
                  if (curr.value.length && !pre.value.length) {
                    const sheet_diff: any[] = [];
                    for (let a = 0; a < curr.value.length; a++) {
                      sheet_diff.push({
                        _rowDiff: true,
                      });
                    }
                    curr.diff = sheet_diff;
                  } else if (!curr.value.length && pre.value.length) {
                    const sheet_diff: any[] = [];
                    for (let a = 0; a < pre.value.length; a++) {
                      sheet_diff.push({
                        _rowDiff: true,
                      });
                    }
                    pre.diff = sheet_diff;
                  } else {
                    const currL = curr.value.length;
                    const preL = pre.vaule.length;
                    const arrL = Math.min(currL, preL);
                    const sheet_diff = this._diffSheet(curr, pre, arrL);
                    curr.diff = sheet_diff;
                    pre.diff = sheet_diff;
                    const lenDiff = currL > preL ? curr.diff : pre.diff;
                    const len = Math.abs(currL - preL);
                    for (let a = 0; a < len; a++) {
                      lenDiff.push({ _rowDiff: true });
                    }
                  }
                } else {
                  //Else Empty block statement
                }
                break;
              case FormControlType.RelevanceForm:
              case FormControlType.RelevanceFormEx:
                const cValue = curr.value[curr.options.displayField || 'name'];
                const pValue = pre.value[curr.options.displayField || 'name'];
                if (JSON.stringify(cValue) !== JSON.stringify(pValue)) {
                  curr.diff = true;
                  pre.diff = true;
                }
                break;
              default:
                break;
            }
          }
        } else if ((curr.value && !pre.value) || (!curr.value && pre.value)) {
          curr.diff = true;
          pre.diff = true;
        } else {
          //Else Empty block statement
        }
      }
      if (curr.children || pre.children) {
        const [cr, pr] = this.diffControls(
          curr.children || [],
          pre.children || [],
        );
        curr.children = cr;
        pre.children = pr;
      }
    }
    return [currControls, preControls];
  }

  // 子表中 行数据 diff
  _diffSheet(curr, pre, l) {
    const _keys1 = Object.keys(curr.value[0]);
    const _keys2 = Object.keys(pre.value[0]);
    const keys = new Set(_keys1.concat(_keys2)); // 两个子表 列可能会有差异, 需要去重合并
    const sheet_diff: any[] = [];
    for (let a = 0; a < l; a++) {
      const curr_col = curr.value[a];
      const pre_col = pre.value[a];
      const sheet_diff_key = {};
      if (curr_col.id !== pre_col.id) {
        sheet_diff_key['_rowDiff'] = true;
      } else {
        for (const k of keys) {
          sheet_diff_key[k] = false;

          if ((curr_col[k] && !pre_col[k]) || (!curr_col[k] && pre_col[k])) {
            // 两个子表, 列不对称
            sheet_diff_key[k] = true;
          } else if (
            typeof curr_col[k] === 'string' ||
            typeof curr_col[k] === 'number' ||
            typeof curr_col[k] === 'boolean'
          ) {
            if (curr_col[k] !== pre_col[k]) {
              sheet_diff_key[k] = true;
            }
          } else {
            if (Array.isArray(curr_col[k])) {
              if (curr_col[k].length !== pre_col[k].length) {
                sheet_diff_key[k] = true;
                continue;
              }
              if (!curr_col[k].length && !pre_col[k].length) {
                continue;
              }
              if (typeof curr_col[k][0] === 'string') {
                if (curr_col[k].join('') !== pre_col[k].join('')) {
                  sheet_diff_key[k] = true;
                }
              } else if (curr_col[k][0].id) {
                const cid = curr_col[k].reduce((c, v) => {
                  return `${c}${v.id}`;
                }, '');
                const rid = pre_col[k].reduce((c, v) => {
                  return `${c}${v.id}`;
                }, '');
                if (cid !== rid) {
                  sheet_diff_key[k] = true;
                }
              } else if (curr_col[k][0].uid) {
                const cUid = curr_col[k].reduce((c, v) => {
                  return `${c}${v.uid}`;
                }, '');
                const rUid = pre_col[k].reduce((c, v) => {
                  return `${c}${v.uid}`;
                }, '');
                if (cUid !== rUid) {
                  sheet_diff_key[k] = true;
                }
              } else if (curr_col[k][0].name) {
                if (curr_col[k][0].name !== pre_col[k][0].name) {
                  sheet_diff_key[k] = true;
                }
              } else {
                //Else Empty block statement
              }
            } else {
              // 说明 curr_col[k] 是object,而object 类型目前只有 地址和关联表单
              const curr_item = curr.columns.filter((val) => val.key === k)[0];
              const pre_item = pre.columns.filter((val) => val.key === k)[0];
              switch (curr_item.type) {
                case FormControlType.Location:
                  if (curr_col[k].address !== pre_col[k].address) {
                    sheet_diff_key[k] = true;
                  }
                  break;
                case FormControlType.RelevanceForm:
                case FormControlType.RelevanceFormEx:
                  const dfield = curr_item.options.displayField || 'name';
                  if (
                    JSON.stringify(curr_col[k][dfield]) !==
                    JSON.stringify(pre_col[k][dfield])
                  ) {
                    sheet_diff_key[k] = true;
                  }
                  break;
                default:
                  break;
              }
            }
          }
        }
      }
      sheet_diff.push(sheet_diff_key);
    }
    return sheet_diff;
  }

  /**
   * 将API数据转换为表单控件数据
   * @param controls
   * @param data
   */
  toFormData(
    controls: RendererControl[],
    data: { [key: string]: any },
    bizSheet: any,
    biz: any,
    workItemId,
  ) {
    for (const key in data) {
      if (Array.isArray(data[key])) {
        for (const item of data[key]) {
          if (Array.isArray(item.departments)) {
            item.parentId = item.departments
              .filter((d: any) => d && d.id)
              .map((d: any) => d.id);
          }
        }
      }
    }

    const formControls: RendererFormControl[] = [];

    FormRendererHelper.findFormControl(controls, formControls);

    // const user = renderer.StaffSelectorControl.service.getCurrentUser() as any;

    formControls
      .filter((c) => c.type === FormControlType.Sheet)
      .forEach((c) => {
        const sheetParams = {
          id: biz.id,
          sheetid: bizSheet.id,
          formCode: bizSheet.code, // 表单编码
          schemaCode: bizSheet.schemaCode, // 模型编码
          objectId: biz.id, // 表单id
          sequenceStatus: biz.sequenceStatus, // 流程状态
          subSchemaCode: c.key,
          workitemId: workItemId,
        };
        const sheetValue = data[c.key];
        c.options.sheetParams = sheetParams;
        c.options.editable = false;
        c.options.exportable = false;
        if (Array.isArray(sheetValue)) {
          sheetValue.forEach((v) =>
            this.toFormData((c as any).columns, v, bizSheet, biz, workItemId),
          );
        }
      });

    formControls
      .filter(
        (c) =>
          c.type === FormControlType.Attachment ||
          c.type === FormControlType.Image,
      )
      .forEach((c) => {
        const files = data[c.key];
        if (files && Array.isArray(files)) {
          data[c.key] = files.map((f: any) => ({
            uid: f.refId,
            name: f.name,
            status: 2, //UploadStatus.Done
            size: f.fileSize,
            response: {
              data: f,
            },
          }));
        }
      });

    formControls
      .filter(
        (c) =>
          c.type === FormControlType.Checkbox ||
          c.type === FormControlType.Dropdown ||
          c.type === FormControlType.DropdownMulti,
      )
      .forEach((c) => {
        const str = data[c.key] as string;
        if (
          c.type === FormControlType.Checkbox ||
          c.type === FormControlType.DropdownMulti ||
          (c.type === FormControlType.Dropdown &&
            (c.options as DropdownOptions).multi)
        ) {
          if (typeof str === 'string') {
            data[c.key] = str ? str.split(';') : [];
          }
        }
      });

    formControls
      .filter((c) => c.type === FormControlType.Location)
      .forEach((c) => {
        const str = data[c.key];
        if (str) {
          try {
            data[c.key] = JSON.parse(str);
          } catch (error) {
            console.log(error);
          }
        }
      });

    formControls
      .filter((c) => c.type === FormControlType.Date)
      .forEach((c) => {
        let str = data[c.key];
        if (typeof str === 'string') {
          try {
            // iOS兼容
            str = str.replace(/-/g, '/');
            data[c.key] = new Date(str);
          } catch (error) {
            console.log(error);
          }
        } else if (typeof str === 'number') {
          data[c.key] = new Date(str);
        } else {
          //Else Empty block statement
        }
      });

    formControls
      .filter((c) => c.type === FormControlType.Address)
      .forEach((c) => {
        const str = data[c.key];
        if (typeof str === 'string') {
          try {
            // iOS兼容
            data[c.key] = JSON.parse(str);
          } catch (error) {
            console.log(error);
          }
        }
      });

    formControls
      .filter(
        (c) =>
          c.type === FormControlType.RelevanceForm ||
          c.type === FormControlType.RelevanceFormEx,
      )
      .forEach((c) => {
        if (data[c.key] && !data[c.key].id) {
          data[c.key] = {};
        }
        const sheetParams = {
          id: biz.id,
          sheetid: bizSheet.id,
        };
        c.options.sheetParams = sheetParams;
      });

    formControls
      .filter((c) => c.type === FormControlType.ReverseRelevance)
      .forEach((c) => {
        const sheetParams = {
          id: biz.id,
          sheetid: bizSheet.id,
          formCode: bizSheet.code,
          schemaCode: bizSheet.schemaCode,
          sequenceStatus: biz.sequenceStatus,
        };
        c.options.sheetParams = sheetParams;
      });
  }

  handleApproval(controls: any, layout: string[][]) {
    layout.forEach((row, ri) => {
      row
        .map((col, ci) => {
          const c = controls[col];
          if (c && c.type === FormControlType.ApprovalOpinion) {
            return ci;
          }
          return -1;
        })
        .filter((i) => i !== -1)
        .reverse()
        .forEach((i) => row.splice(i, 1));
    });

    layout
      .map((row, i) => (row.length === 0 ? i : -1))
      .filter((i) => i !== -1)
      .reverse()
      .forEach((i) => layout.splice(i, 1));
  }

  /**
   * 复制链接
   */
  copyURL() {
    // 复制链接
    try {
      var href: any = location.href;
      var iframeAction: any = href.match(/%26iframeAction%3Ddetail/g);
      if (Array.isArray(iframeAction) && iframeAction.length > 1) {
        for (let i = 0; i < iframeAction.length - 1; i++) {
          href = href.replace('%26iframeAction%3Ddetail', '');
        }
      }
      const oInput = document.createElement('input');
      oInput.value = href;
      document.body.appendChild(oInput);
      oInput.select();
      document.execCommand('Copy');
      oInput.style.display = 'none';
      this.$message.success('复制成功');
    } catch (error) {
      this.$message.error('复制失败');
    }
  }

  /**
   * 打开新页面
   */
  openBlank() {
    var href: any = location.href;
    var iframeAction: any = href.match(/%26iframeAction%3Ddetail/g);
    if (Array.isArray(iframeAction) && iframeAction.length > 1) {
      for (let i = 0; i < iframeAction.length - 1; i++) {
        href = href.replace('%26iframeAction%3Ddetail', '');
      }
    }

    const url = `${href}${
      href.indexOf('?') > -1 ? '&' : '?'
    }T=${localStorage.getItem('token')}`;

    window.open(url, '_blank');
  }
}
</script>
<style lang="less" scoped>
.operation-log-compare {
  .form-header {
    display: flex;
    justify-content: space-between;
    padding: 0 24px !important;
    h4 {
      margin-bottom: 0;
      font-size: 20px;
      font-weight: 600;
      color: #111218;
    }
    .header-right {
      display: flex;
      padding-right: 40px;
      align-items: center;
      & > div {
        margin-left: 25px;
        color: rgba(0, 0, 0, 0.65);
        i {
          margin-right: 8px;
        }
        &:hover {
          span {
            color: #2970ff;
          }
          cursor: pointer;
        }
        &.icon-close {
          margin-right: -16px;
          font-size: 16px;
          top: 11px;
          color: #d8d8d8;
        }
      }
    }
  }
  .c-box {
    width: 1024px;
    margin: 0 auto;
    margin-top: 48px;
  }

  /deep/.diffControls {
    background-color: rgba(244, 69, 78, 0.1);
  }
}
/deep/.operation-log__tabs {
  .flow-track-chart {
    margin-top: 8px;
    .workflow-designer .finish {
      background: rgba(135, 232, 222, 0.4);
    }
    .workflow-designer .processing {
      background: rgba(163, 203, 255, 0.4);
    }
    .activity-instance {
      color: #111218;
      .activity-content i {
        vertical-align: middle;
      }
    }
    .flow-track-chart__explain-item {
      span {
        color: #111218;
      }
    }
  }
  .back {
    display: inline-block;
    margin-right: 16px;
    padding-right: 16px;
    border-right: 1px solid #ccc;
    font-size: 18px;
    color: #2970ff;
    line-height: 18px;
    cursor: pointer;
  }
  .ant-tabs-nav-scroll {
    display: inline;
  }
  .field__label {
    min-width: 102px;
    max-width: 102px;
    width: 102px;
  }
}
.qrcode {
  // margin-left: 33px;
  // margin-right: 16px;
  position: relative;
  & > img {
    width: 26px;
    cursor: url('~@/assets/images/enlarge-o.png'), pointer;
    margin: 2px;
  }
  .qrcode-enlarge {
    position: absolute;
    top: 28px;
    border: 1px solid rgba(221, 221, 221, 1);
    background: #fff;
    img {
      width: 250px;
      height: 250px;
      // max-height: 250px !important;
    }
    p {
      text-align: center;
      padding-bottom: 16px;
    }
    // left: 0;
    right: -1px;
  }
}
</style>

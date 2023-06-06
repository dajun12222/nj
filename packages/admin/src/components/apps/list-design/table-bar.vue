<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="section-bar">
    <span class="bar-title title-2">{{
      $t('languages.Apps.ListDisplay')
    }}</span>
    <span class="bar-right">
      <template v-for="(el, index) in list">
        <span
          v-if="index < 3 || (list.length === 4 && index === 3)"
          :key="index"
        >
          <a-button
            v-if="!el.children"
            :type="el.actionCode === 'add' ? 'primary' : 'default'"
            :class="el.name.length > 4 ? 'ant-btn-large' : ''"
          >
            {{
              isChinese
                ? el.name
                : zhToEn[el.name_i18n[$i18n.locale]] ||
                  el.name_i18n[$i18n.locale]
            }}</a-button>
          <a-dropdown v-else>
            <a-menu slot="overlay">
              <a-menu-item v-for="(its, ids) in el.children" :key="ids">
                {{
                  isChinese
                    ? its.name
                    : zhToEn[its.name_i18n[$i18n.locale]] ||
                      its.name_i18n[$i18n.locale]
                }}
              </a-menu-item>
            </a-menu>
            <a-button :class="el.name.length > 4 ? 'ant-btn-large' : ''">
              {{
                isChinese
                  ? el.name
                  : zhToEn[el.name_i18n[$i18n.locale]] ||
                    el.name_i18n[$i18n.locale]
              }}
              <a-icon type="down" />
            </a-button>
          </a-dropdown>
        </span>
      </template>
      <a-dropdown
        v-if="list.length > 4"
        :overlayClassName="'more-a-dropdown'"
        placement="bottomCenter"
        :destroyPopupOnHide="true"
      >
        <div class="trigger">
          <i class="icon aufontAll h-icon-all-ellipsis-o"></i>
        </div>
        <template #overlay>
          <a-menu>
            <template v-for="(el, index) in list">
              <a-menu-item v-if="index >= 3" :key="index">
                {{
                  isChinese
                    ? el.name
                    : zhToEn[el.name_i18n[$i18n.locale]] ||
                      el.name_i18n[$i18n.locale]
                }}
              </a-menu-item>
            </template>
          </a-menu>
        </template>
      </a-dropdown>
    </span>
  </div>
</template>
<script lang="ts">
import QueryCrieria from '@/components/apps/list-design/query-criteria.vue';
import { Icon, Menu, Button, Dropdown, Popover } from '@h3/antd-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'TableBar',
  components: {
    AIcon: Icon,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AButton: Button,
    ADropdown: Dropdown,
    APopover: Popover,
  },
})
export default class TableBar extends Vue {
  @ListdesignModule.State('operationAarry') operationAarry: any;

  @ListdesignModule.State('isShowPop') isShowPop: any;

  @ListdesignModule.Mutation('setShowPop') setShowPop: any;

  list: any[] = [];

  zhToEn: any = zhToEn;

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  hidePopover() {
    this.setShowPop(false);
  }

  @Watch('operationAarry')
  setOperationAarry(v: any) {
    //
    this.list = JSON.parse(JSON.stringify(v))
      .map(
        (pl: any) =>
          // if (pl.data && typeof pl.data.name !== 'undefined') {
          //   pl.name = pl.data.name;
          // }
          pl,
      )
      .filter((el: any) => el.checked === true);
    const seqArr = [
      '新增',
      '导入',
      '导出',
      '批量修改',
      '删除',
      '打印二维码',
      '修改拥有者',
      '批量打印',
    ];
    this.list = seqArr
      .map((name) => {
        return this.list.find((el) => el.name === name);
      })
      .filter((el) => !!el);
  }

  mounted() {
    this.setOperationAarry(this.operationAarry);
  }
}
</script>

<style lang="less" scoped>
.section-bar {
  min-width: 650px;
  overflow: hidden;
  .title-2 {
    font-weight: 400;
    color: rgba(27, 27, 27, 0.85);
  }
  button {
    margin-left: 10px;
  }
  .bar-right {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    flex-direction: row-reverse;
    .bar-filter {
      vertical-align: middle;
      line-height: 32px;
      margin-right: 8px;
      cursor: pointer;
      .icon:hover {
        color: @primary-color;
      }
      .high-light {
        color: @primary-color;
      }
    }
    .trigger {
      width: 32px;
      height: 32px;
      border-radius: 2px;
      line-height: 32px;
      text-align: center;
      cursor: pointer;
      .icon {
        color: rgba(17, 18, 24, 0.5);
        font-size: 22px;
        position: relative;
        top: 2px;
      }
      &:hover {
        background: rgba(0, 30, 116, 0.06);
        .icon {
          color: #2970ff;
        }
      }
    }
  }
  .filter-box {
    position: absolute;
    top: 56px;
    width: calc(100% + 32px);
    margin-left: -16px;
    z-index: 666;
    margin-top: -8px;
    .content-box {
      padding: 10px 16px;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      border-radius: 4px;
      background: #fff;
      max-height: 510px;
      overflow-y: auto;
      z-index: 9;
    }
  }
}
.filter-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0);
  z-index: 1;
}
.section-bar {
  padding: 0 24px;
  background: #fff;
  line-height: 55px;
  border-top: thin solid #e4e4e4;
}
</style>

<style lang="less">
.more-a-dropdown {
  padding-top: 10px;
}
</style>

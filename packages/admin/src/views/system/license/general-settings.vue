<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="general-settings">
    <div class="item">
      <div class="label">
        <span>前台LOGO</span>
        <a-popover
          overlayClassName="blackBG-frontend"
          placement="rightTop"
          trigger="hover"
          color="black"
        >
          <template slot="content">
            <div class="custom-inner">
              <p>
                作用于浏览器顶部ICO图标，以Googl为例。（蓝色区域代表ICO图标位置）
              </p>
              <div class="wrapper">
                <div class="item">
                  <p>流程中心</p>
                  <img src="./images/flow.png" alt="" />
                </div>
                <div class="item">
                  <p>应用列表</p>
                  <img src="./images/app.png" alt="" />
                </div>
              </div>
            </div>
          </template>
          <i class="icon aufontAll h-icon-all-question-circle-o"></i>
        </a-popover>
      </div>
      <div class="_info">
        <logoInfos
          ref="portalLogo"
          :type="type"
          :refId="portalLogo"
          :options="{ width: 120, height: 27, size: 2, type: 'frontend-logo' }"
        />
        <p v-show="type === 'edit'">
          仅支持jpg、png图片，图片尺寸比例为40 ：9 ，推荐使用120 x 27
          像素、2M以内
        </p>
      </div>
    </div>

    <div class="item">
      <div class="label">
        <span>后台LOGO</span>
        <a-popover
          overlayClassName="blackBG"
          placement="rightTop"
          trigger="hover"
          color="black"
        >
          <template slot="content">
            <div class="custom-inner">
              <p>作用于后端管理顶部左上角（蓝色区域代表LOGO位置）</p>
              <div class="wrapper">
                <div class="item">
                  <img src="./images/back.png" alt="" />
                </div>
              </div>
            </div>
          </template>
          <i class="icon aufontAll h-icon-all-question-circle-o"></i>
        </a-popover>
      </div>
      <div class="_info">
        <logoInfos
          ref="backLogo"
          :type="type"
          :refId="backLogo"
          :options="{ width: 60, height: 60, size: 2, type: 'backstage-logo' }"
        />
        <p v-show="type === 'edit'">
          仅支持jpg、png图片，图片尺寸比例为8 ：3 ，推荐使用160x60 像素、2M以内
        </p>
      </div>
    </div>

    <div class="item">
      <div class="label">
        <span>ICO图标</span>
        <a-popover
          overlayClassName="blackBG"
          placement="rightTop"
          trigger="hover"
          color="black"
        >
          <template slot="content">
            <div class="custom-inner">
              <p>
                作用于浏览器顶部ICO图标，以Google为例。（蓝色区域代表ICO图标位置）
              </p>
              <div class="wrapper">
                <div class="item">
                  <img src="./images/ico.png" alt="" />
                </div>
              </div>
            </div>
          </template>
          <i class="icon aufontAll h-icon-all-question-circle-o"></i>
        </a-popover>
      </div>
      <div class="_info">
        <logoInfos
          ref="icon"
          :type="type"
          :refId="icon"
          :options="{ width: 48, height: 48, size: 2, type: 'ico-logo' }"
        />
        <p v-show="type === 'edit'">
          仅支持ICO图片，图片尺寸比例为1 : 1，推荐48 x 48像素
        </p>
      </div>
    </div>

    <div class="item height32">
      <div class="label">
        <span>公司简称</span>
        <a-popover
          overlayClassName="blackBG"
          placement="rightTop"
          trigger="hover"
          color="black"
        >
          <template slot="content">
            <div class="custom-inner">
              <p>
                作用于浏览器顶部Title，以Google
                Chrome为例（蓝色区域代表Title位置）
              </p>
              <div class="wrapper">
                <div class="item">
                  <img src="./images/name.png" alt="" />
                </div>
              </div>
            </div>
          </template>
          <i class="icon aufontAll h-icon-all-question-circle-o"></i>
        </a-popover>
      </div>
      <div class="_info">
        <a-input v-show="type === 'edit'" v-model="name" type="text" />
        <div v-show="type === 'view'" class="read-info">
          {{ name }}
        </div>
      </div>
    </div>

    <div class="item height32">
      <div class="label">
        <span>版权信息</span>
        <a-popover
          overlayClassName="blackBG"
          placement="rightTop"
          trigger="hover"
          color="black"
        >
          <template slot="content">
            <div class="custom-inner">
              <p>作用于登录页面版权信息（蓝色区域代表版权信息所在位置）</p>
              <div class="wrapper">
                <div class="item">
                  <img src="./images/banquan.png" alt="" />
                </div>
              </div>
            </div>
          </template>
          <i class="icon aufontAll h-icon-all-question-circle-o"></i>
        </a-popover>
      </div>
      <div class="_info">
        <a-input v-show="type === 'edit'" v-model="info" type="text" />
        <div v-show="type === 'view'" class="read-info">
          {{ info }}
        </div>
      </div>
    </div>
    <div class="item height32">
      <div class="label"></div>
      <div class="_info">
        <div class="btns">
          <a-button
            v-if="type === 'view' && isAdmin"
            type="primary"
            @click="type = 'edit'"
          >
            编辑
          </a-button>
          <a-button v-if="type === 'edit'" type="primary" @click="save">
            保存
          </a-button>
          <a-button v-if="type === 'edit'" @click="cancel"> 取消 </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import logoInfos from './logoInfos.vue';
import { themesApi } from 'cloudpivot/api';
import { Popover, Input, Button } from '@h3/antd-vue';

@Component({
  name: 'GeneralSettings',
  components: {
    logoInfos,
    APopover: Popover,
    AInput: Input,
    AButton: Button,
  },
})
export default class GeneralSettings extends Vue {
  type: 'edit' | 'view' = 'view';

  portalLogo: string = '';

  backLogo: string = '';

  name: string = '奥哲云枢';

  info: string = '版权所有 ©深圳奥哲网络科技有限公司 粤ICP备10083177号';

  icon: string = '';

  get isAdmin() {
    let user: any = sessionStorage.getItem('user');
    if (user) {
      user = JSON.parse(user);
      if (
        (user.permissions as any[]).includes('SYS_MNG') ||
        (user.permissions as any[]).includes('ADMIN')
      ) {
        return true;
      }
    }
    return false;
  }

  // 获取logo的refId
  getData() {
    const portalLogo: any = this.$refs.portalLogo;
    const backLogo: any = this.$refs.backLogo;
    const icon: any = this.$refs.icon;

    this.portalLogo = portalLogo.getRefId();
    this.backLogo = backLogo.getRefId();
    this.icon = icon.getRefId();
  }

  resetLogo() {
    const portalLogo: any = this.$refs.portalLogo;
    const backLogo: any = this.$refs.backLogo;
    const icon: any = this.$refs.icon;
    portalLogo.reset();
    backLogo.reset();
    icon.reset();
  }

  // 保存
  save() {
    if (this.name.length > 12) {
      this.$message.warning('公司简称长度不能超过12');
      return;
    }
    if (this.info.length > 50) {
      this.$message.warning('版权信息长度不能超过50！');
      return;
    }

    this.getData();
    this.editTheme();
  }

  // 取消
  cancel() {
    this.type = 'view';
    this.resetLogo();
  }

  // 更新配置信息
  async editTheme() {
    const params = {
      portalLogo: this.portalLogo,
      backLogo: this.backLogo,
      icon: this.icon,
      name: this.name,
      info: this.info,
    };
    const res: any = await themesApi.editTheme(params);
    if (res.errcode === 0) {
      this.$message.success(res.errmsg as string);
      this.type = 'view';

      await themesApi.getThemesInfo().then((res) => {
        this.$store.commit('setThemsConfig', res);
      });
    }
  }

  @Watch('$store.state.themsConfig')
  onThemsConfigChange(res) {
    const { portalLogo, backLogo, name, info, icon } = res;
    this.portalLogo = portalLogo;
    this.backLogo = backLogo;
    this.name = name || this.name;
    this.info = info || this.info;
    this.icon = icon;
    this.$nextTick(() => {
      this.resetLogo();
    });
  }

  created() {
    this.onThemsConfigChange(this.$store.state.themsConfig);
  }
}
</script>

<style lang="less" scoped>
.general-settings {
  padding-top: 13px;
  padding-left: 16px;
}
.item {
  display: flex;
  flex-direction: row;
  &.height32 {
    .label {
      height: 32px;
    }
    ._info {
      max-width: 418px;
    }
  }
  .label {
    width: 120px;
    display: flex;
    align-items: center;
    height: 48px;
    color: #000;
    i {
      margin-left: 8px;
    }
  }
  ._info {
    flex: 1;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    p {
      font-size: 12px;
      margin-top: 19px;
      font-weight: 400;
      color: #888888;
      line-height: 17px;
    }
    .read-info {
      line-height: 32px;
    }
  }
}
.btns {
  padding-top: 8px;
  button {
    margin-right: 12px;
  }
}
</style>

<style lang="less">
.blackBG,
.blackBG-frontend {
  .ant-popover-inner {
    background-color: rgba(17, 18, 24, 0.9);
  }
  .ant-popover-arrow {
    border-left-color: #000 !important;
    border-bottom-color: #000 !important;
  }
  .custom-inner {
    color: #fff;
    padding: 12px 18px 18px 18px;
    p {
      font-size: 14px;
      line-height: 22px;
      max-width: 265px;
      text-align: justify;
    }
    .wrapper {
      margin-top: 16px;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
    }
    .item {
      display: flex;
      flex-direction: column;
      p {
        font-size: 12px;
        margin-bottom: 8px;
      }
      img {
        width: 265px;
        height: 182px;
      }
    }
  }
}
.blackBG-frontend {
  .custom-inner {
    p {
      max-width: unset !important;
    }
    .wrapper {
      margin-top: 32px;
    }
    .item {
      margin-right: 16px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>

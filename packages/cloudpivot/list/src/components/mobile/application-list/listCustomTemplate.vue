<style lang="less">
@import '../../../../../common/styles/mixins.less';
#custom-list-container {
  .px2rem(font-size, 28px);
  text-align: left;
}
// 错误信息
#custom-list-parsing-error {
  color: red;
  .px2rem(font-size, 22px);
}
.custom-list-wrapper {
  overflow-x: hidden;
}
.fields-list-wrapper {
  .px2rem(margin-top, @horizontal-padding-md / 2);
  .px2rem(margin-bottom, @horizontal-padding-md / 2);
}
.custom-list-item-container {
  display: flex;
  width: calc(100% + 1.546666666666667rem);
  transition: 0.3s;
}
.custom-list-item {
  flex: 1;
  display: flex;
  align-items: center;
  .px2rem(margin, @horizontal-padding-md);
  .px2rem(padding, @horizontal-padding-lg);
  .px2rem(border-radius, @border-radius-lg);
  background: @white-background;
  word-break: break-all;

  &-warp {
    flex: 1;
    .px2rem(margin-left, 30px);
  }
  // layout  -- start
  &-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .px2rem(min-height, 96px);
    // min-height:1.6rem;
  }
  &-status {
    position: relative;
    margin-left: 0.2rem;
    width: 1.6rem;
  }
  &-info {
    flex: 1;
  }
  &-creater {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #999;
    .px2rem(font-size, 24px);
    &-info-avatar {
      @user-img: 56px;
      .px2rem(width, @user-img);
      .px2rem(height, @user-img);
      border-radius: 50%;
      object-fit: cover;
    }
  }
  // layout -- end

  // 图片
  img {
    max-width: 100%;
  }
  // 标题
  &-title {
    .px2rem(font-size, 32px);
    color: rgba(0, 0, 0, 0.85);
  }
}
.custom-list-item-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.546666666666667rem;
  .px2rem(margin-top, @horizontal-padding-md);
  .px2rem(margin-bottom, @horizontal-padding-md);
  .px2rem(border-radius, @border-radius-lg);
  .px2rem(font-size, 28px);
  font-family: PingFangSC-Regular, PingFang SC;
  background: #f4454e;
  color: #ffffff;
}
</style>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { listApi } from '../../../../../api';
// 函数
import common from '../../../../../common';
import comm from '../../../../../common/mobile';
import getDownloadUrlNew from '../../../../../common/src/utils/getDownloadUrlNew';
import { renderer } from '../../../../../form';
import { DataItemType } from '../../../../../form/schema';
// 默认模板
import listCustomTemplateConverter from '../../../../../list/src/components/listCustom/template/mobile/handler';

// 引入vue编译器
const vueCompiler = require('../../../../../list/src/components/mobile/application-list/vueCompiler.build');

const { getRealValue } = common.utils.BusinessFunctions;
// 默认头像
const defaultAvatar = require('./avatar.png');

@Component
export default class listCustomTemplate extends Vue {
  @Prop() vm: any;

  @Prop() columns: any;

  @Prop() originalListData: any;

  @Prop() templateString: any;

  @Prop() batchFlag?: boolean;

  @Prop() selectAll?: boolean;

  @Prop() canDelete?: boolean;

  DataItemType: any = DataItemType;

  // 如果模板字符串改变, compiled 相关也重置
  templateRender: Function | null = null;

  templateStaticRenderFns: Function | null = null;

  @Watch('templateString')
  onTemplateStringChange() {
    this.templateRender = null;
    this.templateStaticRenderFns = null;
  }

  // 渲染
  render(h) {
    const that = this;
    const { vm, columns, originalListData, batchFlag, selectAll, canDelete } =
      that;
    const templateString =
      that.templateString.trim() || listCustomTemplateConverter.template;

    // 优先使用缓存模板
    if (!that.templateRender) {
      const compiled = vueCompiler.compile(templateString);
      if (compiled.errors.length) {
        that.templateParsingError = `Error compiling template:\n\n${templateString}'\n\n${compiled.errors.join(
          '\n',
        )}`;
        return that.errorRender(h);
      }
      that.templateRender = new Function(compiled.render);
      that.templateStaticRenderFns = new Function(compiled.staticRenderFns);
    }

    return h({
      // compiled
      render: that.templateRender,
      staticRenderFns: that.templateStaticRenderFns,
      // 基本属性
      components: {
        checkboxItem: comm.components.Checkbox,
      },
      data() {
        return {
          vm,
          columns,
          originalListData,
          batchFlag,
          selectAll,
          canDelete,
        };
      },
      // 生命周期
      beforeCreate() {
        that.$emit('beforeCreate');
      },
      created() {
        that.$emit('created', this);
      },
      beforeMount() {
        that.$emit('beforeMount', this);
      },
      mounted() {
        this.$nextTick(() => {
          that.$emit('mounted', this);
        });
      },
      // 计算属性
      computed: {
        // 列表
        listData() {
          // @ts-ignore 忽略ts的检测, 这块东西是运行时
          const z = this.originalListData.map((t) => {
            const item = { ...t };
            const fields: any = [];
            Object.entries(t.data).forEach(([k, v]) => {
              // @ts-ignore 忽略ts的检测, 这块东西是运行时
              const c = this.columns.find((col: any) => col.propertyCode === k);
              if (c) {
                const {
                  displayFormat,
                  name,
                  name_i18n,
                  propertyCode,
                  propertyType,
                  sortKey,
                } = c;

                // 关联表单处理
                if (
                  c.propertyType === DataItemType.RelevanceForm ||
                  c.propertyType === DataItemType.RelevanceFormEx
                ) {
                  if (!t.data[k]) {
                    return;
                  }
                  const key = t.data[k].displayCode;
                  const value = t.data[k][key];
                  let filedValue: string = '';
                  if (Array.isArray(value)) {
                    filedValue = value[0].name;
                  } else {
                    filedValue = value;
                    if (t.data[k].displayCode === 'sequenceStatus') {
                      switch (value) {
                        case 'DRAFT':
                          filedValue = '草稿';
                          break;
                        case 'PROCESSING':
                          filedValue = '进行中';
                          break;
                        case 'COMPLETED':
                          filedValue = '已完成';
                          break;
                        case 'CANCELED':
                          filedValue = '已作废';
                          break;
                        default:
                          filedValue = '';
                          break;
                      }
                    }
                    // 处理地址
                    if (
                      t.data[k].propertyType === DataItemType.Address &&
                      value
                    ) {
                      const address = JSON.parse(value);
                      address.provinceName
                        ? (filedValue = address.provinceName)
                        : (filedValue = '');
                      address.cityName
                        ? (filedValue += address.cityName)
                        : (filedValue += '');
                      address.districtName
                        ? (filedValue += address.districtName)
                        : (filedValue += '');
                      address.address
                        ? (filedValue += address.address)
                        : (filedValue += '');
                    }
                  }
                  fields.push({
                    displayFormat,
                    name,
                    name_i18n,
                    propertyCode,
                    propertyType,
                    sortKey,
                    // @ts-ignore
                    value: getRealValue(c, filedValue),
                  });
                } else {
                  fields.push({
                    displayFormat,
                    name,
                    name_i18n,
                    propertyCode,
                    propertyType,
                    sortKey,
                    // @ts-ignore
                    value: getRealValue(c, t.data[k]),
                  });
                }
              }
            });
            // @ts-ignore
            item.fields = fields.sort((c, n) => c.sortKey - n.sortKey);
            if (t.data.creater) {
              item.creater = t.data.creater[0];
              if (item.creater.imgUrl) {
                if (
                  !item.creater.imgUrl.includes('http') &&
                  !item.creater.imgUrl.includes('data:image/png;')
                ) {
                  item.creater.imgUrl = that.getDownloadUrlNew(
                    item.creater.imgUrl,
                  );
                }
              } else {
                item.creater.imgUrl = defaultAvatar;
              }
              // item.creater.imgUrl = item.creater.imgUrl || defaultAvatar;
            }
            item.status = that.__parseStatus(t);
            if (that.selectAll) {
              item.select = true;
            }
            return item;
          });

          // 批量删除时过滤进行中的
          // if(batchFlag) {
          //   z = z.filter((item: any) => item.sequenceStatus !== 'PROCESSING')
          // }
          console.log(z, 'zzzzzzzzzzzzzzzzzz');

          return z;
        },
        // 扩展
        extensions() {
          try {
            // @ts-ignore 忽略ts的检测, 这块东西是运行时
            return this.vm.eventHooksHandler.scription.extensions;
          } catch (err) {
            return {};
          }
        },
      },
      // 方法
      methods: {
        // 列表详情
        showListItemDetail(ev, item) {
          // 兼容处理，老版本的模板中无ev参数，升级后会导致异常。
          item = item || ev;
          if (that.batchFlag) {
            return;
          }
          if (item.isOpenForm === false) {
            return;
          }
          listApi
            .getFormUrl({
              bizObjectId: item.id,
              schemaCode: item.schemaCode,
            })
            .then((res) => {
              if (!res || typeof res !== 'string') {
                throw new Error('跳转失败!');
              }
              (this as any).$router
                .push({
                  path: res + `&return=${(this as any).$route.fullPath}`,
                })
                .catch((err: any) => {
                  console.log(err);
                });
            })
            .catch((err) => {
              that.$h3.toast.show({
                text: err.toString(),
              });
            });
        },
        deleteItem(item) {
          const { schemaCode, id } = item;
          that.$h3.modal.show({
            content: '删除后数据不可恢复，是否删除？',
            actions: [
              {
                //@ts-ignore
                text: this.$t('cloudpivot.form.renderer.cancel').toString(),
                onPress() {},
              },
              {
                //@ts-ignore
                text: this.$t('cloudpivot.form.renderer.ok').toString(),
                onPress: () => {
                  this.deleteListData({ schemaCode, ids: [id] });
                },
              },
            ],
          });
        },
        deleteListData(param) {
          listApi.deleteListData(param).then((res) => {
            if (res.errcode === 0) {
              that.$h3.toast.show({
                text: '删除成功',
                iconType: 'check',
              });
              that.$emit('reloadList');
            } else {
              that.$h3.toast.show({
                text: '删除失败，请重新尝试',
                iconType: 'close',
              });
            }
          });
        },
        selectItem(b, index) {
          //@ts-ignore
          this.listData[index].select = b;
          //@ts-ignore
          that.$emit('selectedsome', b, index, this.listData);
        },
        getAttachmentUrl(file) {
          if (!file || !file.refId) {
            return '';
          }
          return renderer.UploadControl.service.getDownloadUrl(file);
        },
      },
    });
  }

  // 模板有错误时, 输出错误信息
  templateParsingError: string = '';

  templateParsingErrorHtml: any;

  errorRender(h) {
    return h(
      'div',
      {
        attrs: { id: 'custom-list-container' },
      },
      [
        h(
          'pre',
          { attrs: { id: 'custom-list-parsing-error' } },
          this.templateParsingError,
        ),
      ],
    );
  }

  // 其他函数
  get __lang() {
    return localStorage.getItem('locale') || 'zh';
  }

  __parseStatus(listItem) {
    let randomIdx: number = 3;
    const sequenceStatus: any = listItem.sequenceStatus || '';
    switch (sequenceStatus) {
      // 本地缓存
      case 'CACHE':
        randomIdx = 4;
        break;
      // 草稿
      case 'DRAFT':
        randomIdx = 0;
        break;
      // 进行中
      case 'PROCESSING':
      case 'null':
        // TODO 进行中状态需要调整
        randomIdx = 1;
        break;
      case '':
        // 当状态为空时不显示状态
        randomIdx = 5;
        break;
      // 完成
      case 'COMPLETED':
        randomIdx = 2;
        break;
      // 作废
      default:
        randomIdx = 3;
        break;
    }

    const value = ['draft', 'pending', 'complete', 'closure', 'cache', ''][
      randomIdx
    ];
    const text =
      {
        draft: '草稿',
        pending: '进行中',
        complete: '已完成',
        closure: '已作废',
        cache: '本地草稿',
      }[value] || '';
    let img = '';
    try {
      value &&
        (img = require(`../../../../../common/assets/mobile/images/${value}${
          this.__lang === 'zh' ? '' : '-en'
        }.png`));
    } catch (err) {
      console.warn('img loading failed!');
    }
    return { value, text, img };
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrl(refId: string) {
    let url = `${
      this.apiHost
    }/api/aliyun/download?refId=${getDownloadUrlNew.getRefId(refId)}`;
    if (this.token) {
      url += '&T=' + this.token;
    }
    return url;
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }
}
</script>

<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-item">
    <template v-if="isLoading">
      <div class="loading-icon">
        <a-spin :tip="$t('languages.Apps.Loading')" size="large" />
      </div>
    </template>
    <template v-else>
      <div v-if="dataItemList.length === 0" class="no-data">
        <div class="no-data-tips">
          <img src="../../../assets/images/userEmpty.png" />
          <!--          <p class="tips">{{ $t('languages.Apps.AddTips') }}</p>-->
          <p class="btn">
            <a-button type="primary" @click="addDataItem">
              新建数据项
            </a-button>
          </p>
        </div>
      </div>
      <div v-else class="data-item-content">
        <div class="form clearfix">
          <div class="input-group">
            <div>
              <a-input
                v-model="keyWords"
                :placeholder="$t('languages.PlaceHolder.SearchByCodeOrName')"
                class="w240"
                @change="filterList"
              >
                <a-icon slot="prefix" class="del-icon" type="search" />
                <a-icon
                  v-if="keyWords"
                  slot="suffix"
                  class="del-icon"
                  type="close-circle"
                  @click="clearKeyWords"
                />
              </a-input>
            </div>
          </div>
          <div class="btn-group">
            <span class="data-item-tips">
              <span>模型下的数据项会在数据库中生成字段，创建后可以在表单、流程、列表中使用。</span>
            </span>
            <a-button type="primary" @click="publishDataItem">
              {{ $t('languages.Apps.Publish') }}
            </a-button>
          </div>
        </div>
        <div class="data-title">
          <div class="title">
            <span>
              {{ $t('languages.Apps.Summary') }}
              <a-tooltip :title="$t('languages.Apps.SummaryTips')">
                <a-icon type="question-circle-o" /> </a-tooltip>:
            </span>
          </div>
          <div style="line-height: 0.9">
            <data-item-input v-if="isUpdate" class="w320" />
          </div>
        </div>
        <div class="model-add-data">
          <a-button block style="width: 100px" type="link" @click="addDataItem">
            <span class="icon aufontAll h-icon-all-plus"></span>
            新建数据项
          </a-button>
	  <div style="text-align: left;width: -webkit-fill-available;">
            <a-button @click="batchAddDataItems" block style="padding-left: 1vw;width:120px" type="link">+ 批量新建数据项</a-button>
          </div>
          <a-dropdown placement="bottomRight">
            <a class="ant-dropdown-link" @click.prevent>
              切换展示
              <i
                class="icon aufontAll h-icon-all-down-o"
                style="font-size: 12px"
              ></i>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item>
                  <a href="javascript:;" @click.self="changeView('asc')">按最早创建</a>
                </a-menu-item>
                <a-menu-item>
                  <a href="javascript:;" @click.self="changeView('desc')">按最新创建</a>
                </a-menu-item>
                <a-menu-item>
                  <a href="javascript:;" @click.self="doRank">自定义顺序</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div class="table">
          <data-item-list
            :columns="columns"
            :dataSource="filterDataItemList"
            :loading="loading"
            @sortChildrenRankList="sortChildrenRankList"
            @sortEnd="sortEnd"
          >
            <span slot="indexTitle">{{ $t('languages.NO') }}</span>
            <span slot="codeTitle" class="resize">{{
              $t('languages.Apps.Code')
            }}</span>
            <span slot="nameTitle" class="resize">{{
              $t('languages.Apps.Name')
            }}</span>
            <span slot="propertyNameTitle" class="resize">{{
              $t('languages.Apps.DataType')
            }}</span>
            <span slot="attributesTitle" class="resize">属性
              <a-tooltip>
                <template slot="title">
                  <div class="tool-tip">
                    <div>
                      <span
                        class="icon aufontAll h-icon-all-flow-pass"
                        style="margin-right: 10px; color: #2970ff"
                      ></span>已设置
                    </div>
                    <div>
                      <span
                        class="icon aufontAll h-icon-all-flow-pass"
                        style="margin-right: 10px; color: #dddddd"
                      ></span>未设置
                    </div>
                  </div>
                </template>
                <span
                  class="icon aufontAll h-icon-all-question-circle-o"
                  style="font-size: 12px"
                ></span>
              </a-tooltip>
            </span>
            <span slot="propertyIndexTitle" class="resize">{{
              $t('languages.Apps.StorageOption')
            }}</span>
            <span slot="publishedTitle" class="resize">{{
              $t('languages.Apps.Publish')
            }}</span>
            <span slot="actionTitle" class="resize">{{
              $t('languages.Apps.Action')
            }}</span>
            <!-- 数据插槽 -->
            <p slot="index" slot-scope="{ record }">
              {{ record.text }}
            </p>
            <p slot="code" slot-scope="{ text }" class="text-ellipsis">
              <a-tooltip placement="top">
                <template #title>
                  <span>{{ text }}</span>
                </template>
                <span
                  v-hight-light="{ keyWords: keyWords, value: text }"
                ></span>
              </a-tooltip>
            </p>
            <p
              slot="name"
              slot-scope="{ text }"
              :title="text"
              class="text-ellipsis"
            >
              <a-tooltip placement="top">
                <template #title>
                  <span>{{ text }}</span>
                </template>
                <span
                  v-hight-light="{ keyWords: keyWords, value: text }"
                ></span>
              </a-tooltip>
            </p>
            <span slot="attributes" slot-scope="{ record }">
              <span v-for="item in getAttributes(record)" :key="item.code">
                <template v-if="item.hasAttribute">
                  <span v-for="(x, index) in item.attributes" :key="index">
                    <span
                      class="icon aufontAll h-icon-all-flow-pass"
                      style="margin-right: 5px; font-size: 14px"
                      :class="x.checked ? 'setDone' : 'unSet'"
                    ></span>
                    {{ x.display }}
                  </span>
                </template>
                <template v-else>--</template>
              </span>
            </span>
            <span slot="propertyTypeName" slot-scope="{ text }">{{
              text
            }}</span>
            <span slot="propertyIndex" slot-scope="{ record, text }">
              <template v-if="text">{{ $t('languages.Apps.Index') }}</template>
              <template v-if="text && record.propertyEmpty">、</template>
              <template v-if="record.propertyEmpty">{{
                $t('languages.Apps.IsEmpty')
              }}</template>
              <template v-if="!text && !record.propertyEmpty">- -</template>
            </span>
            <span slot="published" slot-scope="{ text }">
              <a-tag v-if="text" color="blue">已发布</a-tag>
              <a-tag v-else style="color: rgba(17, 18, 24, 0.25)">未发布</a-tag>
            </span>
            <span
              v-if="record.isSchema"
              slot="action"
              slot-scope="{ record }"
              class="action right"
            >
              <i @click="editDataItem(record)">编辑</i>
		<i
		v-if="record.propertyType === 8"
                @click="addBatchDataItem(record)"
                
              >批量新建</i>
              <i v-if="record.propertyType === 8" @click="addDataItem(record)">新建</i>
              <i v-if="record.defaultProperty" @click="viewQuote(record)">查看引用</i>
              <i v-if="record.propertyType === 8" @click="deleDataItem(record)">删除</i>
              <a-dropdown v-else-if="!record.defaultProperty">
                <i>更多</i>
                <a-menu slot="overlay">
                  <a-menu-item @click="viewQuote(record)">
                    查看引用
                  </a-menu-item>
                  <a-menu-item
                    v-if="record.code !== 'parentId'"
                    @click="deleDataItem(record)"
                  >
                    删除
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </span>
          </data-item-list>
        </div>
      </div>
    </template>
    <!-- 增加数据项 -->
    <a-drawer
      v-if="infoVisible"
      :closable="true"
      :title="modeTitle"
      :visible="infoVisible"
      placement="right"
      width="850"
      wrapClassName="user-info-drawer"
      @close="onCloseInfoModal"
    >
      <DataItemBaseModel
        :ableIndexes="ableIndexes"
        :indexNumberLimit="indexNumberLimit"
        :indexNumberMax="indexNumberMax"
        :propertyIndexNum="propertyIndexNum()"
      />
    </a-drawer>
    <!-- 批量增加数据项 -->
    <a-drawer
      :closable="true"
      title="批量添加数据项"
      :visible="batchVisible"
      placement="right"
      v-if="batchVisible"
      width="850"
      wrapClassName="user-info-drawer"
      @close="onCloseBatchModal"
    >
      <DataItemBatchModel
        :ableIndexes="ableIndexes"
      ></DataItemBatchModel>
    </a-drawer>

    <!-- 查看引用 -->
    <a-drawer
      v-if="quoteVisible"
      :closable="true"
      :visible="quoteVisible"
      title="查看引用"
      width="850"
      wrapClassName="quote-drawer"
      @close="onCloseQuote"
    >
      <p class="summary">
        以下{{
          quoteTableData ? quoteTableData.length : 0
        }}个业务模型引用了当前数据项
      </p>
      <a-table
        :columns="quoteTableColumns"
        :dataSource="quoteTableData"
        :pagination="false"
        class="quoteTable"
        size="middle"
      >
        <template slot="index" slot-scope="text, record, index">
          {{ index + 1 }}
        </template>
      </a-table>
    </a-drawer>
    <div class="data-item__tips">
      <a-alert
        v-show="isShowTips"
        closable
        message="删除数据项成功，请重新发布表单！"
        showIcon
        type="warning"
        @close="isShowTips = true"
      />
    </div>

    <a-modal
      :keyboard="false"
      :maskClosable="false"
      :visible="visible"
      cancelText="暂不配置"
      class="config-tips"
      okText="前往配置"
      title="提示"
      width="422px"
      @cancel="visible = !visible"
      @ok="handleOk"
    >
      <p>钉钉信息未配置，无法发布</p>
      <p>
        请前往
        <span class="heighlight">系统管理-常规设置</span> 配置钉钉信息
      </p>
    </a-modal>

    <a-modal
      :keyboard="false"
      :maskClosable="false"
      :visible="rankShow"
      cancelText="取消"
      class="rank-modal"
      okText="确定"
      title="字段排序"
      width="552px"
      @cancel="close"
      @ok="rank"
    >
      <!-- <div v-for="(item,index) in filterDataItemList"
      :key="index"
      class="rank-modal-item"
     >
      {{ item.name }}
      </div>-->
      <dataitem-rank
        v-if="rankShow"
        :dataItemList="filterDataItemList"
        @sortChildrenRankList="sortChildrenRankList"
        @sortEnd="sortEnd"
      />
    </a-modal>

    <a-modal
      :keyboard="false"
      :maskClosable="false"
      :visible="deleteTipsVisible"
      class="delete-tips-modal"
      width="540px"
      @cancel="deleteTipsClose"
    >
      <div class="delete-tips-content">
        <p class="title">删除前需要处理的内容</p>
        <div v-if="deleteTipsObject.BUSINESS_RULE" class="tips-item">
          <p>
            <span class="tips-title">业务规则</span>
            <span class="tips">业务规则中使用此数据项，处理后才能删除</span>
          </p>
          <div class="tips-content">
            <label>{{ deleteTipsObject.BUSINESS_RULE }}</label>
          </div>
        </div>
        <div v-if="deleteTipsObject.DATA_RULE_SHOW_CONDITION" class="tips-item">
          <p>
            <span class="tips-title">显示条件</span>
            <span class="tips">条件中使用此数据项，处理后才能删除</span>
          </p>
          <div class="tips-content">
            <label>{{ deleteTipsObject.DATA_RULE_SHOW_CONDITION }}</label>
          </div>
        </div>
        <div
          v-if="deleteTipsObject.DATA_RULE_REQUIRED_CONDITION"
          class="tips-item"
        >
          <p>
            <span class="tips-title">必填条件</span>
            <span class="tips">条件中使用此数据项，处理后才能删除</span>
          </p>
          <div class="tips-content">
            <label>{{ deleteTipsObject.DATA_RULE_REQUIRED_CONDITION }}</label>
          </div>
        </div>
        <div v-if="deleteTipsObject.DATA_RULE_CAL_CONDITION" class="tips-item">
          <p>
            <span class="tips-title">计算规则</span>
            <span class="tips">计算规则中使用此数据项，处理后才能删除</span>
          </p>
          <div class="tips-content">
            <label>{{ deleteTipsObject.DATA_RULE_CAL_CONDITION }}</label>
          </div>
        </div>
      </div>
    </a-modal>

    <a-modal
      :keyboard="false"
      :maskClosable="false"
      :visible="deleteDetailVisible"
      cancelText="取消"
      class="delete-modal"
      :class="{ 'large-modal': deleteDetailCollapseVisible }"
      okText="确定"
      title="删除影响详情"
      width="433px"
      @cancel="deleteClose"
      @ok="deleteSave"
    >
      <a-icon type="question-circle" class="question-circle" />
      <p class="delete-title">确定要删除数据项"{{ deleteItem.name }}"吗？</p>
      <p class="delete-content">
        删除数据项，数据库中对应数据项的数据也会被删除
      </p>
      <label class="detail-visible" for="" @click="getDetail">{{
        deleteDetailCollapseVisible ? '关闭详情' : '查看详情'
      }}</label>
      <div v-if="deleteDetailCollapseVisible" class="detail-collapse">
        <p>会影响的模块</p>
        <div class="collapse-box au-collapse">
          <div v-if="dataNumber > 0" class="collapse-item">
            <div class="collapse-header">
              <b>历史数据</b>
              <span>删除数据项会影响数据库中的 {{ dataNumber }} 条数据</span>
            </div>
          </div>
          <div
            v-if="deleteTipsObject.FLOW_RUTE || deleteTipsObject.FLOW_NODE"
            class="collapse-item"
          >
            <div class="collapse-header">
              <b>流程设计</b><span>节点和路由使用的此数据项会被删除，流程可能出现异常</span>
              <i
                class="icon aufontAll"
                :class="[
                  workFlowDesignVisible
                    ? 'h-icon-all-down'
                    : 'h-icon-all-right',
                ]"
                @click="workFlowDesignVisible = !workFlowDesignVisible"
              ></i>
            </div>
            <div v-show="workFlowDesignVisible" class="collapse-content">
              <div v-if="deleteTipsObject.FLOW_RUTE" class="content-item">
                <p>条件路由名称</p>
                <div>{{ deleteTipsObject.FLOW_RUTE }}</div>
              </div>
              <div v-if="deleteTipsObject.FLOW_NODE" class="content-item">
                <p>节点名称</p>
                <div>{{ deleteTipsObject.FLOW_NODE }}</div>
              </div>
            </div>
          </div>
          <div v-if="deleteTipsObject.FORM.length > 0" class="collapse-item">
            <div class="collapse-header">
              <b>表单设计</b><span>表单中此数据项对应的控件会被删除</span>
              <i
                class="icon aufontAll"
                :class="[
                  formDesignVisible ? 'h-icon-all-down' : 'h-icon-all-right',
                ]"
                @click="formDesignVisible = !formDesignVisible"
              ></i>
            </div>
            <div
              v-show="formDesignVisible"
              class="collapse-content"
              style="padding-top: 13px"
            >
              <ul class="form-list">
                <li v-for="(item, index) in deleteTipsObject.FORM" :key="index">
                  <i class="icon aufontAll h-icon-all-operation-log-o"></i>{{ item.name }}
                </li>
              </ul>
            </div>
          </div>
          <div class="collapse-item">
            <div class="collapse-header">
              <b>视图设计</b><span>查询条件，展示控件自动去除此数据项</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import DataItemBaseModel from './dataitem-modals/dataItemBaseModel.vue';
  import DataItemBatchModel from './dataitem-modals/dataItemBatchModel.vue';
import Bus from '../../../utils/bus';
import { DataItemType } from 'cloudpivot/form/schema';

import DataitemRank from './dataitem-modals/dataitem-rank.vue';

import { bizpropertyApi } from 'cloudpivot/api';
import AppsApi from '@/apis/apps';

import DataModelSummary from '@/components/shared/data-item/summary.vue';

import DataItemInput from './data-title-input.vue';
import DataItemList from '@/components/apps/model/data-item-list.vue';
import {
  Spin,
  Modal,
  Input,
  Button,
  Icon,
  Dropdown,
  Tooltip,
  Drawer,
  Tag,
  Menu,
  Alert,
  Table,
} from '@h3/antd-vue';

const DataModelModule = namespace('Apps/DataModel');
@Component({
  name: 'dataItem',
  components: {
    DataItemBaseModel,
      DataItemBatchModel,
    DataitemRank,
    DataModelSummary,
    DataItemInput,
    DataItemList,
    ASpin: Spin,
    AModal: Modal,
    AInput: Input,
    AButton: Button,
    AIcon: Icon,
    ADropdown: Dropdown,
    ATooltip: Tooltip,
    ADrawer: Drawer,
    ATag: Tag,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AAlert: Alert,
    ATable: Table,
  },
})
export default class DataItem extends Vue {
  @DataModelModule.State('loading') loading: any;

  @DataModelModule.State('dataItemList') dataItemList: any;

  @DataModelModule.State('filterDataItemList') filterDataItemList: any;

  @DataModelModule.State('dataItemTypeList') dataItemTypeList: any;

  // 数据项类型
  @DataModelModule.State('bizPropertyModel') bizPropertyModel: any;

  // 新增数据项
  @DataModelModule.State('bizSchemaModelList') bizSchemaModelList: any;

  @DataModelModule.State('summaryList') summaryList: any;

  @DataModelModule.State('targetSummary') targetSummary: any;

  @DataModelModule.State('defaultSummary') defaultSummary: any;

  @DataModelModule.Mutation('setFilterDataItemList') setFilterDataItemList: any;

  @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;

  @DataModelModule.Mutation('setBizPropertyCode') setBizPropertyCodeX: any;

  @DataModelModule.Mutation('setCurrenEdittMode') setEditMode: any;

  // 编辑或新增模式
  @DataModelModule.Mutation('setDrawerVisible') setDrawerVisible: any;

  @DataModelModule.Mutation('setLang') setLang: any;

  // drawer显示隐藏
  @DataModelModule.Mutation('setSummary') setSummaryX: any;

  @DataModelModule.Mutation('setKeyWords') setKeyWords: any;

  @DataModelModule.Mutation('setLoading') setLoading: any;

  @DataModelModule.Action('deleteDataItem') deleteDataItemX: any;

  @DataModelModule.Action('forceDeleteDataItem') forceDeleteDataItemX: any;

  @DataModelModule.Action('getDataItemList') getDataItemListX: any;

  @DataModelModule.Action('publishDataItem') publishDataItemX: any;

  @DataModelModule.Action('getDataItemType') getDataItemType: any;

  @DataModelModule.Action('getBussinessType') getBussinessType: any;

  @DataModelModule.Action('getSummary') getSummaryX: any;

  @DataModelModule.Action('submitSummary') submitSummaryX: any;

  get bizSchemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  get defaultSummaryList() {
    return this.summaryList.filter((data: any) => data.defaultProperty);
  }

  get bizSummaryList() {
    return this.summaryList.filter(
      (data: any) =>
        !data.defaultProperty && data.propertyType !== 10 && data.published,
    );
  }

  radioStyle: any = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  // 可以建立索引的数据项类型列表
  ableIndexes: number[] = [];

  //适合的索引数量
  indexNumberLimit: number = 0;

  //可配置索引最大数量
  indexNumberMax: number = 0;

  dataNumber: number = 0;

  async getIndexableProperty() {
    await AppsApi.getIndexableProperties({}).then((res: any) => {
      if (!res.errcode) {
        this.ableIndexes = res.data.ableIndexes;
        this.indexNumberLimit = res.data.indexNumberLimit;
        this.indexNumberMax = res.data.indexNumberMax;
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  getAttributes(record: any): any[] {
    const tip: any = [];
    const type: number = record.propertyType;
    const isChecked: boolean = false;
    if (record.code === 'sequenceNo') {
      const attributes: any[] = [];
      if (record.options) {
        attributes.push({
          display: '单据号设置',
          checked: true,
        });
      } else {
        attributes.push({
          display: '单据号设置',
          checked: false,
        });
      }
      tip.push({
        code: 'sequenceNo',
        hasAttribute: true,
        attributes: attributes,
      });
      return tip;
    } else if (record.code === 'createdDeptId' || type === DataItemType.Sheet) {
      tip.push({
        code: record.code,
        hasAttribute: false,
      });
    } else if (
      record.code === 'createdTime' ||
      record.code === 'modifiedTime'
    ) {
      const attributes: any[] = [];
      // attributes.push({
      //   display: '默认格式',
      //   checked: true,
      // })
      if (record.options) {
        try {
          const tmpJsonObj = JSON.parse(record.options);
          if (tmpJsonObj) {
            for (const key in tmpJsonObj) {
              if (key === 'format') {
                if (tmpJsonObj[key]) {
                  attributes.push({
                    display: '默认格式',
                    checked: true,
                  });
                } else {
                  attributes.push({
                    display: '默认格式',
                    checked: false,
                  });
                }
              }
            }
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        attributes.push({
          display: '默认格式',
          checked: false,
        });
      }
      tip.push({
        code: record.code,
        hasAttribute: true,
        attributes: attributes,
      });
    } else {
      const attributes: any[] = [];
      switch (type) {
        case DataItemType.Number:
        case DataItemType.Date:
          if (record.options) {
            try {
              const tmpJsonObj = JSON.parse(record.options);
              if (tmpJsonObj) {
                for (const key in tmpJsonObj) {
                  if (key === 'format') {
                    if (tmpJsonObj[key]) {
                      attributes.push({
                        display: '默认格式',
                        checked: true,
                      });
                    } else {
                      attributes.push({
                        display: '默认格式',
                        checked: false,
                      });
                    }
                  }
                }
              }
            } catch (err) {
              console.log(err);
            }
          } else {
            attributes.push({
              display: '默认格式',
              checked: false,
            });
          }
          break;
        case DataItemType.Radio:
        case DataItemType.Checkbox:
        case DataItemType.Dropdown:
        case DataItemType.DropdownMulti:
          if (record.options) {
            try {
              const tmpJsonObj = JSON.parse(record.options);
              if (tmpJsonObj) {
                const keys = Object.keys(tmpJsonObj);
                for (const key in tmpJsonObj) {
                  if (
                    key === 'options' ||
                    (key === 'labels' && !keys.includes('options'))
                  ) {
                    if (tmpJsonObj[key]) {
                      attributes.push({
                        display: '选项设置',
                        checked: true,
                      });
                    } else {
                      attributes.push({
                        display: '选项设置',
                        checked: false,
                      });
                    }
                  }
                }
              }
            } catch (err) {
              console.log(err);
            }
          } else {
            attributes.push({
              display: '选项设置',
              checked: false,
            });
          }
          break;
        case DataItemType.StaffSingle:
        case DataItemType.StaffDeptMix:
          if (record.options) {
            try {
              const tmpJsonObj = JSON.parse(record.options);
              if (tmpJsonObj) {
                //表单设计数据中没有mappings Key值
                if (tmpJsonObj.hasOwnProperty('mappings')) {
                  for (const key in tmpJsonObj) {
                    if (key === 'mappings') {
                      if (tmpJsonObj[key]) {
                        attributes.push({
                          display: '映射',
                          checked: true,
                        });
                      } else {
                        attributes.push({
                          display: '映射',
                          checked: false,
                        });
                      }
                    }
                  }
                } else {
                  attributes.push({
                    display: '映射',
                    checked: false,
                  });
                }
              }
            } catch (err) {
              console.log(err);
            }
          } else {
            attributes.push({
              display: '映射',
              checked: false,
            });
          }
          break;
        case DataItemType.RelevanceFormEx:
        case DataItemType.RelevanceForm:
          if (record.options) {
            try {
              const tmpJsonObj = JSON.parse(record.options);
              if (tmpJsonObj) {
                //表单设计数据中没有mappings Key值
                if (tmpJsonObj.hasOwnProperty('mappings')) {
                  for (const key in tmpJsonObj) {
                    if (key === 'mappings') {
                      if (tmpJsonObj[key]) {
                        attributes.push({
                          display: '映射',
                          checked: true,
                        });
                      } else {
                        attributes.push({
                          display: '映射',
                          checked: false,
                        });
                      }
                    }
                  }
                } else {
                  attributes.push({
                    display: '映射',
                    checked: false,
                  });
                }
              }
            } catch (err) {
              console.log(err);
            }
          } else {
            attributes.push({
              display: '映射',
              checked: false,
            });
          }
          break;
        case DataItemType.ShortText:
          if (record.options) {
            try {
              const tmpJsonObj = JSON.parse(record.options);
              if (tmpJsonObj) {
                for (const key in tmpJsonObj) {
                  if (key === 'dictionaryData') {
                    if (tmpJsonObj[key]) {
                      attributes.push({
                        display: '数据字典',
                        checked: true,
                      });
                    } else {
                      attributes.push({
                        display: '数据字典',
                        checked: false,
                      });
                    }
                  }
                }
              }
            } catch (err) {
              console.log(err);
            }
          } else {
            attributes.push({
              display: '数据字典',
              checked: false,
            });
          }
          break;
        default:
          break;
      }
      if (Array.isArray(attributes) && attributes.length > 0) {
        tip.push({
          code: record.code,
          hasAttribute: true,
          attributes: attributes,
        });
      } else {
        tip.push({
          code: record.code,
          hasAttribute: false,
        });
      }
    }
    return tip;
  }

  @Watch('infoVisible', { deep: true })
  setInfoVisible(v: boolean) {
    // console.info('000___', v);
    this.setDrawerVisible(v);
  }

  keyWords: string = '';

  infoVisible: boolean = false;
    batchVisible: boolean = false;

  quoteVisible: boolean = false;

  isLoading: boolean = true;

  modeTitle: string = '';

  defaultVal: Array<string> = [];

  isShowTips: boolean = false;

  visible: boolean = false;

  rankShow = false;

  isUpdate: boolean = true; // 是否更新组件

  tableLoading = false; // 表格loading状态

  expandedRowKeys: any = ''; //设置展开的子表行

  // 表格配置
  columns: Array<Common.TableHead> = [
    // {
    //   dataIndex: 'index',
    //   slots: { title: 'indexTitle' },
    //   scopedSlots: { customRender: 'index' },
    //   width: 100,
    //   key: 'index',
    //   align: 'center',
    // },
    {
      dataIndex: 'code',
      key: 'code',
      slots: { title: 'codeTitle' },
      scopedSlots: {
        customRender: 'code',
      },
      align: 'left',
    },
    {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      scopedSlots: {
        customRender: 'name',
      },
      key: 'name',
      align: 'left',
    },
    {
      dataIndex: 'propertyTypeName',
      slots: { title: 'propertyNameTitle' },
      scopedSlots: { customRender: 'propertyTypeName' },
      key: 'propertyTypeName',
      align: 'left',
    },
    {
      dataIndex: 'attributes',
      slots: { title: 'attributesTitle' },
      scopedSlots: {
        customRender: 'attributes',
      },
      key: 'attributes',
      align: 'left',
    },
    {
      dataIndex: 'propertyIndex',
      slots: { title: 'propertyIndexTitle' },
      scopedSlots: { customRender: 'propertyIndex' },
      width: 150,
      key: 'propertyIndex',
      align: 'left',
    },
    {
      dataIndex: 'published',
      slots: { title: 'publishedTitle' },
      scopedSlots: { customRender: 'published' },
      width: 100,
      key: 'published',
      align: 'left',
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      key: 'action',
      width: 200,
    },
  ];

  // 查看引用表格配置
  quoteTableColumns = [
    {
      title: '序号',
      with: '158',
      scopedSlots: { customRender: 'index' },
    },
    {
      title: '业务模型',
      dataIndex: 'schemaName',
      with: 208,
    },
    {
      title: '引用位置',
      dataIndex: 'quotePath',
    },
  ];

  // 查看引用表格配置
  quoteTableData = [];

  deleteTipsVisible: boolean = false; //删除前拦截弹窗控制

  deleteDetailVisible: boolean = false; //删除影响详情

  deleteDetailCollapseVisible: boolean = false; //删除影响详情面板

  workFlowDesignVisible: boolean = true; //流程设计面板控制

  formDesignVisible: boolean = true; //表单设计面板控制

  //删除前拦截需要处理的内容
  deleteTipsObject: any = {
    BUSINESS_RULE: '', //业务规则
    DATA_RULE_SHOW_CONDITION: '', //显示条件
    DATA_RULE_REQUIRED_CONDITION: '', //必填条件
    DATA_RULE_CAL_CONDITION: '', //计算规则
    FLOW_RUTE: '', //流程路由
    FLOW_NODE: '', //流程节点
    FORM: [], //表单
  };

  deleteItem: any = {};

  doRank() {
    this.rankShow = true;
    this.rankList = this.filterDataItemList.map((res: any) => res.code);
  }

  sortType: string = ''; //空值表示自定义排序

  changeView(sortType: string) {
    this.sortType = sortType;
    this.getDataItemListX({ sortType }).then(() => {
      this.filterList(); // 对请求到数据过滤
      this.isLoading = false;
    });
  }

  rank() {
    const vm: any = this;
    const params = {
      schemaCode: this.bizSchemaCode,
      codes: this.rankList.join(',') as string,
      child: this.childrenRankList,
    };
    bizpropertyApi.sortkeys(params).then((res) => {
      if (res.errcode === 0) {
        vm.rankShow = false;
        vm.getDataItemListX().then(() => {
          // 删除数据后刷新例表
          vm.filterList();
          vm.isLoading = false;
        });
      } else {
        vm.$message.error(res.errmsg);
      }
    });
  }

  rankList: string[] = [];

  sortEnd(list: string[], status: boolean) {
    this.setLoading(true);
    if (list.length > 0) {
      this.rankList = list;
    }
    if (status) {
      this.rank();
    }
  }

  childrenRankList: any = {};

  sortChildrenRankList(list: string, sheetCode: string, status: boolean) {
    this.childrenRankList[sheetCode] = list;
    if (status) {
      if (this.rankList.length === 0) {
        this.rankList = this.filterDataItemList.map((res: any) => res.code);
      }
      this.rank();
    }
  }

  close() {
    this.rankShow = false;
    this.setLoading(false);
    this.rankList = [];
  }

  // 生命周期
  created() {
    this.setBizSchemaCodeX(this.bizSchemaCode);
    this.getDataItemListX({ sortType: '' }).then(() => {
      this.filterList(); // 对请求到数据过滤
      this.isLoading = false;
    });
    this.getDataItemType();
    // this.getBussinessType(); // 业务类型
    this.getSummaryX(); // 获取摘要
  }

  async mounted() {
    await this.getIndexableProperty();
    Bus.$on('isAddContinue', (v: any) => {
      this.infoVisible = !!v; // 数据项是按下【保存】false 还是【保存继续】true
    });
      Bus.$on('batchSaveDataItem', (v: any) => {
        this.batchVisible = !!v; // 批量添加数据项是按下【保存】后关闭抽屉
        //刷新例表
        this.setBizSchemaCodeX(this.bizSchemaCode);
        this.getDataItemListX().then(() => {
          console.log('this.bizSchemaCodethis.bizSchemaCodethis.bizSchemaCode',this.bizSchemaCode)
            this.setBizPropertyCodeX('');
            this.filterList();
            this.isLoading = false;
          });
      });
    }

  beforeDestroy() {
    Bus.$off('isAddContinue');
      Bus.$off('batchSaveDataItem');
  }

  // 方法
  clearKeyWords() {
    this.keyWords = '';
    this.filterList();
    this.setKeyWords('');
  }

  // 删除数据项
  deleDataItem(e: any) {
    this.deleteItem = e;
    this.setBizSchemaCodeX(e.schemaCode); //设置当前schemaCode；
    const vm: any = this;
    const { published } = e;
    //已发布的数据项展示删除后影响的数据
    if (published) {
      vm.deleteDataItemX(e.code).then((res: any) => {
        console.log(res);
        const propertyUsedInfo = res.data.propertyUsedInfo;
        if (res.errcode === 0) {
          if (res.data.needNotice) {
            //拦截删除，显示需要处理的关联数据信息
            this.deleteTipsVisible = true;
            this.deleteTipsObject.BUSINESS_RULE =
              propertyUsedInfo.BUSINESS_RULE.map((item) => item.name).join(
                '、',
              );
            this.deleteTipsObject.DATA_RULE_SHOW_CONDITION =
              propertyUsedInfo.DATA_RULE_SHOW_CONDITION
                ? propertyUsedInfo.DATA_RULE_SHOW_CONDITION.map(
                    (item) => item.name,
                  ).join('、')
                : '';
            this.deleteTipsObject.DATA_RULE_REQUIRED_CONDITION =
              propertyUsedInfo.DATA_RULE_REQUIRED_CONDITION
                ? propertyUsedInfo.DATA_RULE_REQUIRED_CONDITION.map(
                    (item) => item.name,
                  ).join('、')
                : '';
            this.deleteTipsObject.DATA_RULE_CAL_CONDITION =
              propertyUsedInfo.DATA_RULE_CAL_CONDITION
                ? propertyUsedInfo.DATA_RULE_CAL_CONDITION.map(
                    (item) => item.name,
                  ).join('、')
                : '';
          } else {
            //可以删除，显示会影响的数据信息
            this.deleteDetailVisible = true;
            this.deleteDetailCollapseVisible = true;
            //默认将表单设计和流程设计显示打开
            this.workFlowDesignVisible = true;
            this.formDesignVisible = true;

            this.dataNumber = res.data.dataNumber;
            this.deleteTipsObject.FLOW_RUTE = propertyUsedInfo.FLOW_RUTE
              ? propertyUsedInfo.FLOW_RUTE.map((item) => item.name).join('、')
              : '';
            this.deleteTipsObject.FLOW_NODE = propertyUsedInfo.FLOW_NODE
              ? propertyUsedInfo.FLOW_NODE.map((item) => item.name).join('、')
              : '';
            this.deleteTipsObject.FORM = propertyUsedInfo.FORM
              ? propertyUsedInfo.FORM
              : [];
          }
        } else {
          this.deleteDetailVisible = false;
          this.deleteTipsObject.BUSINESS_RULE = '';
          this.deleteTipsObject.DATA_RULE_SHOW_CONDITION = '';
          this.deleteTipsObject.DATA_RULE_REQUIRED_CONDITION = '';
          this.deleteTipsObject.DATA_RULE_CAL_CONDITION = '';
          this.deleteTipsObject.FLOW_RUTE = '';
          this.deleteTipsObject.FLOW_NODE = '';
          this.deleteTipsObject.FORM = [];
        }
      });
    } else {
      const content = published
        ? this.$t('languages.Apps.DeleteTipsContent')
        : '';
      vm.$confirm({
        title: this.$t('languages.Apps.DeleteTips', { name: e.name }),
        content,
        okText: this.$t('languages.Ok').toString(),
        cancelText: this.$t('languages.Cancel').toString(),
        onOk() {
          vm.doForceDelete(e);
        },
      });
    }
  }

  //取消删除弹窗事件
  deleteClose() {
    this.deleteDetailVisible = false;
  }

  //保存删除弹窗事件
  deleteSave() {
    this.isLoading = true;
    this.doForceDelete(this.deleteItem);
  }

  getDetail() {
    this.deleteDetailCollapseVisible = !this.deleteDetailCollapseVisible;
    this.workFlowDesignVisible = false;
    this.formDesignVisible = false;
  }

  deleteTipsClose() {
    this.deleteTipsVisible = false;
  }

  /**
   * 删除已发布数据项-废弃
   */
  deletePublish(e: any) {
    const vm: any = this;
    const { published } = e;
    vm.tableLoading = true;
    vm.deleteDataItemX(e.code).then((res: any) => {
      if (res.errcode === 0) {
        // 数据项没有关联后台数据
        vm.doDeleteTips(published);
        vm.getSummaryX(); // 跟新摘要
        vm.setBizSchemaCodeX(vm.bizSchemaCode);
        vm.getDataItemListX({ sortType: this.sortType }).then(() => {
          // 删除数据后刷新例表
          vm.filterList();
          vm.isLoading = false;
          vm.tableLoading = false;
        });
      } else if (res.errcode === 10022) {
        // 已近关联相关数据
        vm.forceDeleteDataItem(e, res.data);
      } else {
        // 数据项关联后台数据
        vm.tableLoading = false;
        vm.$message.error(res.errmsg, 2);
      }
    });
  }

  /**
   *  强制删除api
   */
  doForceDelete(e: any) {
    const { published } = e;
    const vm: any = this;
    vm.deleteDetailVisible = false;
    vm.deleteItem = {};
    vm.tableLoading = true;
    vm.forceDeleteDataItemX(e.code).then((res: any) => {
      if (!res.errcode) {
        vm.doDeleteTips(published);
        vm.setBizSchemaCodeX(vm.bizSchemaCode);
        vm.getDataItemListX({ sortType: this.sortType }).then(() => {
          // 删除数据后刷新例表
          vm.filterList();
          vm.isLoading = false;
        });
      } else {
        vm.$message.error(res.errmsg, 2);
      }
      vm.tableLoading = false;
    });
  }

  // 强制删除数据项
  forceDeleteDataItem(e: any, count: number) {
    const vm: any = this;
    vm.$confirm({
      title: this.$t('languages.Apps.DeleteTips', { name: e.name }),
      content: this.$t('languages.Apps.DeleteDataTips', { count }),
      okText: this.$t('languages.Ok').toString(),
      cancelText: this.$t('languages.Cancel').toString(),
      onOk() {
        vm.doForceDelete(e);
      },
      onCancel() {
        vm.tableLoading = false;
      },
    });
  }

  /**
   * 删除数据项提示
   */
  doDeleteTips(published: boolean) {
    if (published) {
      this.isShowTips = true;
    } else {
      this.$message.success(this.$t('languages.DeleteSuccess') as string, 2);
    }
  }

  // 发布数据项
  publishDataItem() {
    const that: any = this;
    if (!this.targetSummary.length) {
      that.$message.info(this.$t('languages.Apps.SummaryEmptyTips'), 2);
      return;
    }
    this.publishDataItemX().then((res: any) => {
      if (!res.errcode) {
        that.$message.success(this.$t('languages.PublishSuccess'), 2);
        that.getDataItemListX().then(() => {
          // 发布完数据项刷新列表
          that.filterList();
          /* 刷新组件 */
          that.isUpdate = false; // 移除组件
          // 在组件移除后，重新渲染组件
          that.$nextTick(() => {
            that.isUpdate = true;
          });
          that.isLoading = false;
        });
      } else if (+res.errcode === 10013) {
        that.visible = true;
      } else {
        that.$message.error(res.errmsg, 2);
      }
    });
  }

  /**
   *  未配置钉钉信息
   */
  handleOk() {
    this.$router
      .push({
        name: 'commonSetting',
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  // 编辑数据项
  editDataItem(e: any) {
    const str: any = this.$t('languages.Apps.EditDataItem');
    this.setBizSchemaCodeX(e.schemaCode); //设置当前schemaCode；
    this.setBizPropertyCodeX(e.code);
    this.infoVisible = true;
    this.setEditMode('edit'); // edit or add
    this.modeTitle = str;
  }

  // drawer关闭
  onCloseInfoModal() {
    console.log('drawer关闭');
    this.infoVisible = false;
    this.setEditMode('unknow');
    this.setBizPropertyCodeX('');
    this.setBizSchemaCodeX(this.bizSchemaCode);
  }

    //批量添加数据项drawer关闭
    onCloseBatchModal(){
      console.log('drawer关闭');
      this.batchVisible = false;
    }
  viewQuote(item) {
    const { schemaCode, code } = item;
    AppsApi.bizpropertyRefer({ schemaCode, bizPropertyCode: code }).then(
      (res) => {
        if (res.errcode !== 0) {
          return this.$message.error((res as any).errmsg);
        }
        if (Array.isArray(res.data)) {
          res.data.forEach((el) => {
            if (el.schemaCode === schemaCode) {
              el.schemaName = '本模型';
            }
          });
        }
        this.quoteTableData = res.data;
        this.quoteVisible = true;
      },
    );
  }

  onCloseQuote(item) {
    this.quoteTableData = [];
    this.quoteVisible = false;
  }

  addDataItem(record?: any) {
    //子表新增传子表的code 主表新增传当前模型的schemaCode
    const schemaCode = record.code || this.bizSchemaCode;
    this.expandedRowKeys = [schemaCode];
    this.setBizSchemaCodeX(schemaCode); //设置当前schemaCode；
    const str: any = this.$t('languages.Apps.AddDataItem');
    this.infoVisible = true;
    console.info('0000', this.infoVisible);
    this.setEditMode('add'); // edit or add
    this.setBizPropertyCodeX('');
    this.modeTitle = str;
  }
  // 子表批量添加
    addBatchDataItem(record?: any) {
      //子表新增传子表的code 主表新增传当前模型的schemaCode
      let schemaCode = record.code || this.bizSchemaCode;
      this.expandedRowKeys = [schemaCode];
      this.setBizSchemaCodeX(schemaCode); //设置当前schemaCode；
      const str: any = this.$t('languages.Apps.AddDataItem');
      this.batchVisible = true;
      console.info('0000', this.batchVisible);
      // this.setEditMode('add'); // edit or add
      // this.setBizPropertyCodeX('');
      // this.modeTitle = str;
    }

    batchAddDataItems()
    {
      let schemaCode = this.bizSchemaCode;
      this.expandedRowKeys = [schemaCode];
      this.batchVisible = true;
    }
  handleExpand(expanded, record) {
    console.log(expanded, 'expanded');
    console.log(record, 'record');
  }

  // 过滤
  filterList() {
    const that = this;
    setTimeout(() => {
      this.setFilterDataItemList(that.keyWords);
      this.setKeyWords(that.keyWords);
      this.setLang();
    }, 200);
  }

  // 摘要选择
  summaryChange(val: Array<string>) {
    this.setSummaryX(val);
    this.submitSummaryX();
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setFilterDataItemList(this.keyWords);
    this.setKeyWords(this.keyWords);
    this.setLang();
    // this.lang = localStorage.getItem('locale') || 'zh';
  }

  propertyIndexNum() {
    const result = {};
    const schemaCode = this.bizSchemaCode;
    result[schemaCode] = 0;
    for (let i = 0; i < this.filterDataItemList.length; i++) {
      if (
        this.filterDataItemList[i].propertyType !== 8 &&
        this.filterDataItemList[i].propertyIndex
      ) {
        result[schemaCode]++;
      } else if (this.filterDataItemList[i].propertyType === 8) {
        for (let j = 0; j < this.filterDataItemList[i].children.length; j++) {
          if (this.filterDataItemList[i].children[j].propertyIndex) {
            if (!result.hasOwnProperty(this.filterDataItemList[i].code)) {
              result[this.filterDataItemList[i].code] = 1;
            } else {
              result[this.filterDataItemList[i].code]++;
            }
          }
        }
      } else {
        //Else Empty block statement
      }
    }
    return result;
  }
}
</script>

<style lang="less">
.config-tips {
  p {
    margin-bottom: 8px;

    .heighlight {
      color: @primary-color;
    }
  }
}

.rank-modal {
  .ant-modal-body {
    max-height: 430px;
    overflow: auto;
  }
  .rank-modal-item {
    float: left;
  }
}

.delete-tips-modal {
  .ant-modal-body {
    padding-top: 32px;
  }
  .ant-modal-close-x {
    margin-top: 7px;
    color: #99a1ae;
  }
  .ant-modal-footer {
    display: none;
  }
  .delete-tips-content {
    min-height: 394px;
    .title {
      font-size: 16px;
      font-weight: 600;
      color: #000000;
      line-height: 22px;
    }
    .tips-item {
      margin-top: 24px;
    }
    .tips-title {
      display: inline-block;
      font-size: 14px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.84);
      line-height: 22px;
      margin-right: 17px;
    }
    .tips {
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
      line-height: 22px;
    }
    .tips::before {
      display: inline-block;
      margin-right: 4px;
      color: #f5222d;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: '*';
    }
    .tips-content {
      margin-top: 23px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.84);
      line-height: 22px;
    }
  }
}

.delete-modal {
  .ant-modal-header,
  .ant-modal-title,
  .ant-modal-close {
    display: none;
  }
  .ant-modal-body {
    padding-top: 32px;
    padding-left: 73px;
    padding-bottom: 0;
  }
  .ant-modal-footer {
    padding: 24px;
    border: none;
  }
  .delete-title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #000000;
    line-height: 24px;
  }
  .question-circle {
    position: absolute;
    left: 33px;
    top: 33px;
    font-size: 22px;
    color: #faad14;
  }
  .delete-content {
    margin-bottom: 6px;
    font-size: 14px;
    color: rgba(17, 18, 24, 0.5);
    line-height: 22px;
  }
  .detail-visible {
    font-size: 14px;
    color: #38c89f;
    line-height: 22px;
    margin-bottom: 13px;
    display: inline-block;
    cursor: pointer;
  }
  .detail-collapse {
    width: 650px;
    > p {
      margin-bottom: 18px;
      font-size: 14px;
      font-weight: 600;
      color: #111218;
      line-height: 22px;
    }
    .collapse-box {
      padding-right: 7px;
      height: 290px;
      overflow: hidden;
      overflow-y: scroll;
      .collapse-header {
        padding: 5px 16px 5px 0;
        border-bottom: 1px solid #ededed;
        position: relative;
        .icon {
          position: absolute;
          top: 5px;
          right: 0px;
          color: #111218;
          cursor: pointer;
        }
        b {
          font-size: 14px;
          color: rgba(17, 18, 24, 0.5);
          line-height: 22px;
          margin-right: 28px;
        }
        span {
          font-size: 12px;
          color: rgba(17, 18, 24, 0.5);
          line-height: 22px;
        }
      }
      .collapse-content {
        padding: 24px 14px;
        padding-bottom: 0;
        .content-item p {
          padding-left: 9px;
          font-size: 12px;
          color: #262626;
          line-height: 15px;
          border-left: 2px solid #38c89f;
        }
        .content-item div {
          margin-top: 12px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #111218;
          line-height: 20px;
        }
        .form-list {
          overflow: hidden;
          li {
            float: left;
            margin-right: 20px;
            margin-bottom: 10px;
            font-size: 14px;
            color: #000000;
            line-height: 22px;
            i {
              margin-right: 12px;
              font-size: 18px;
              color: #faad14;
            }
          }
        }
      }
    }
  }
}
.large-modal {
  .ant-modal {
    width: 741px !important;
  }
}
</style>

<style lang="less" scoped>
.setDone {
  color: @primary-color;
}
.unSet {
  color: #dddddd;
}
.action {
  i {
    cursor: pointer;
    padding: 0 8px;
    color: @primary-color;
    font-style: normal;
  }
}

.data-item {
  text-align: center;
  margin: 12px 0;

  .data-item-tips {
    text-align: left;
    font-size: 12px;
    color: rgba(17, 18, 24, 0.5);
    margin-bottom: 2px;
    line-height: 20px;
  }

  &__tips {
    top: 65px;
    right: 50%;
    margin-right: -151.5px;
    width: 303px;
    position: fixed;
    z-index: 800;
  }

  margin-top: 0;
  // height: calc(100vh - 64px);
  position: relative;

  .loading-icon {
    // position: absolute;
    // top: 50%;
    margin-top: 100px;
    // left: 50%;
  }

  .no-data {
    // display: none;
    & > div.no-data-tips {
      margin-top: 143px;
    }

    .tips {
      font-weight: 400;
      margin: 24px 0;
    }

    .btn {
      i {
        padding-right: 3px;
      }
    }
  }

  .data-item-content {
    position: relative;

    .form {
      margin-top: 16px;
      margin-bottom: 16px;

      .input-group {
        /deep/ .del-icon {
          color: rgba(17, 18, 24, 0.25);
        }

        & > div {
          float: left;
        }

        /deep/ .w240 {
          width: 240px;
          margin-right: 24px;
        }
      }

      .btn-group {
        float: right;

        .btn {
          margin-right: 8px;
        }

        i {
          font-size: 14px;
          margin-right: 8px;
        }
      }
    }

    .data-title {
      width: 100%;
      height: 32px;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 4px;
      padding: 0 8px;
      display: flex;
      margin-bottom: 12px;

      & > div.title {
        margin-right: 8px;
        line-height: 32px;

        i {
          font-size: 14px;
          // margin-right: 6px;
          color: rgba(17, 18, 24, 0.5);
        }
      }

      /deep/ .w320 {
        min-width: 320px;
        max-width: 500px;
        margin-right: 24px;

        .ant-select-selection {
          max-height: 60px;
          overflow-x: auto;
        }
      }
    }

    .model-add-data {
      display: flex;
      justify-content: space-between;
    }

    .table {
      // /deep/.ant-table-thead span {
      //   font-weight: 600;
      //   color: rgba(0,0,0,0.65);
      // }
      /deep/ .ant-table-body {
        color: #111218;
        max-height: calc(100vh - 250px) !important;
        // &::-webkit-scrollbar{
        //   width: 0;
        // }
        table {
          padding: 0;

          tr[data-row-key='id'],
          tr[data-row-key='name'],
          tr[data-row-key='createBy'],
          tr[data-row-key='createByParentId'],
          tr[data-row-key='ownerId'],
          tr[data-row-key='ownerIdParentId'],
          tr[data-row-key='createdTime'],
          tr[data-row-key='modifiedBy'],
          tr[data-row-key='modifiedTime'],
          tr[data-row-key='runnigInstanceId'],
          tr[data-row-key*='-id'],
          tr[data-row-key*='-parentId'] {
            display: none;
          }

          th,
          td {
            color: #111218;

            .disableColor {
              color: rgba(17, 18, 24, 0.25);
            }

            .checkbox {
              cursor: default;
            }

            .ant-checkbox-wrapper:hover .ant-checkbox-inner,
            .ant-checkbox-wrapper .ant-checkbox-inner {
              border-color: #d9d9d9;
            }

            .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
              // border: 0;
              border-color: @primary-color;
            }

            // text-align: center !important;
            .noborder {
              border-left: 0;
            }

            .theme,
            .highlight {
              color: @primary-color;
            }

            .action {
              i {
                cursor: pointer;
                padding-left: 17px;
              }
            }
          }

          .ant-table-row-level-1 td:first-child {
            // transform: translateX(calc(100% - 16px));
            text-align: right !important;
            padding-right: 0;

            span {
              display: none;
            }
          }

          .ant-table-row-level-1 {
            .second-td {
              position: relative;
              z-index: 1;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }

          .ant-table-row-level-0 td:first-child {
            position: relative;

            .ant-table-row-expand-icon {
              position: absolute;
              top: calc(50% - 8px);
              left: calc(100% - 16px);
            }
          }
        }
      }
    }
  }
}

.select-title {
  font-weight: 400;
  color: rgba(17, 18, 24, 0.5);
  font-size: 14px !important;
}

.second-td {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.quote-drawer {
  p.summary {
    font-size: 16px;
    margin: 3px 0 20px;
  }
}
.tool-tip {
  padding: 0px 10px;
  font-family: PingFangSC-Regular;
  color: #ffffff 100%;
  div {
    margin: 5px 0;
  }
}
</style>

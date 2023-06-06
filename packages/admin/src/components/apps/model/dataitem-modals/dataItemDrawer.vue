<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: your name
 * @Date: 2020-03-28 10:26:28
 * @LastEditTime: 2022-04-12 12:00:23
 * @LastEditors: Fu Zhuohang
 * @Description: In User Settings Edit
 * @FilePath: \yunshu6.0\packages\admin\src\components\apps\model\dataitem-modals\dataItemDrawer.vue
-->
<template>
  <div class="form-wrap">
    <!--************* 基础字段（编码/名称/数据项） *************-->
    <a-form
      :autoFormCreate="
        (theForm) => {
          form = theForm;
        }
      "
      style="margin-left: 15px"
      @submit="handleSubmit"
    >
      <div class="split-title">基本信息</div>
      <!-- <div v-for="item in templates" :key="item.uiformId"> -->
      <a-form-item
        :label="codeOptions.labelName"
        :labelCol="{ span: 4 }"
        labelAlign="left"
        :wrapperCol="{ span: 12 }"
        :titleTip="codeOptions.tip"
        :fieldDecoratorId="codeOptions.uiformId"
        :fieldDecoratorOptions="{
          rules: [
            {
              required: codeOptions.required,
              message: codeOptions.placeholder,
            },
            {
              pattern: codeOptions.pattern,
              validator: codeOptions.validator,
              message: codeOptions.ruleMsg,
            },
          ],
        }"
      >
        <!-- 输入框 -->
        <a-input
          :maxLength="codeOptions.maxLength"
          :placeholder="codeOptions.placeholder"
          :disabled="
            (editMode === 'edit' && inputPublished === true) ||
            isInputedCodeAndName === 'parentId'
          "
          @change="codeChange"
        />

        <!-- </div> -->
      </a-form-item>
      <a-form-item
        :label="nameOptions.labelName"
        :labelCol="{ span: 4 }"
        labelAlign="left"
        :wrapperCol="{ span: 12 }"
        :titleTip="nameOptions.tip"
        :fieldDecoratorId="nameOptions.uiformId"
        :fieldDecoratorOptions="{
          rules: [
            {
              required: nameOptions.required,
              message: nameOptions.placeholder,
            },
            {
              pattern: nameOptions.pattern,
              validator: nameOptions.validator,
              message: nameOptions.ruleMsg,
            },
          ],
        }"
      >
        <!-- 输入框 -->
        <a-input
          :disabled="postInfo.defaultProperty"
          :maxLength="nameOptions.maxLength"
          :placeholder="nameOptions.placeholder"
          @change="nameChange"
        />

        <!-- </div> -->
      </a-form-item>
      <a-form-item
        :label="propertyTypeOptions.labelName"
        :labelCol="{ span: 4 }"
        labelAlign="left"
        :wrapperCol="{ span: 12 }"
        :titleTip="propertyTypeOptions.tip"
        :fieldDecoratorId="propertyTypeOptions.uiformId"
        :fieldDecoratorOptions="{
          rules: [
            {
              required: propertyTypeOptions.required,
              message: propertyTypeOptions.placeholder,
            },
          ],
        }"
      >
        <a-select
          :placeholder="propertyTypeOptions.placeholder"
          class="input-color"
          :disabled="
            (editMode === 'edit' && inputPublished === true) ||
            isInputedCodeAndName === 'parentId'
          "
          @change="handleSelectChange"
        >
          <a-select-option
            v-for="opt in dataItemTypeList"
            :key="opt.index"
            :disabled="opt.disabled"
          >
            {{ opt.name }}
          </a-select-option>
        </a-select>

        <!-- </div> -->
      </a-form-item>
      <!-- </div> -->
      <!-- ************* 数据项切换对应块 ********** -->

      <!-- 关联表单9 -->
      <template
        v-if="
          Number(dataType) === DataItemTypes.RelevanceForm ||
          Number(dataType) === DataItemTypes.RelevanceFormEx
        "
      >
        <a-form-item
          class="form-required"
          label="选择业务模型"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 12 }"
        >
          <div>
            <biz-models-selector
              v-model="postInfo.relativeCode"
              :disabled="
                (editMode === 'edit' && inputPublished === true) ||
                isInputedCodeAndName === 'parentId'
              "
              :appCode="postInfo.appPackageCode"
              :currentCode="currentCode"
              :folderId="postInfo.appFunctionCode"
              :expandCode="expandCode"
              :placeholder="$t('languages.PlaceHolder.Select')"
              @change="onTreeChange"
            />
          </div>
        </a-form-item>

        <a-form-item
          v-if="
            postInfo.relativeCode &&
            isInputedCodeAndName !== 'parentId' &&
            showStyle !== 'tree'
          "
          class="form-required"
          label="查询列表"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 12 }"
        >
          <a-select
            v-model="queryCode"
            :class="displayData"
            :placeholder="$t('languages.PlaceHolder.Select')"
          >
            <template v-for="item in queryCodeList">
              <a-select-option :key="item.value" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="Number(dataType) === DataItemTypes.RelevanceForm"
          class="form-required"
          label="显示样式"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 12 }"
        >
          <a-select
            v-model="showStyle"
            :class="displayData"
            :placeholder="$t('languages.PlaceHolder.Select')"
            :disabled="
              (editMode === 'edit' && inputPublished === true) ||
              isInputedCodeAndName === 'parentId'
            "
          >
            <template v-for="item in showStyleOptions">
              <a-select-option :key="item.value" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item
          class="form-required"
          label="显示字段"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 12 }"
        >
          <a-select
            v-model="displayCode"
            :class="displayData"
            :placeholder="$t('languages.PlaceHolder.Select')"
            @change="displayChange"
          >
            <!-- :disabled="(editMode === 'edit' && inputPublished === true) && isInputedCodeAndName !== 'parentId'" -->
            <!-- 是否能更改问题， -->
            <template v-for="item in displayItems">
              <a-select-option :key="item.code" :value="item.code">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="isInputedCodeAndName !== 'parentId' && showStyle !== 'tree'"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 12 }"
        >
          <span
            slot="label"
            style="position: relative"
            class="span-text"
            @click="toggleUpDown(4)"
          >
            <span style="margin-left: 5px">数据限定范围</span>
            <i
              class="icon aufontAll"
              :class="[
                isRangeUpDown ? 'h-icon-all-down-o' : 'h-icon-all-right-o',
              ]"
              style="position: absolute; left: -8px; font-size: 12px; top: -2px"
            ></i>
          </span>
        </a-form-item>
        <div v-show="isRangeUpDown" class="upDownCls">
          <a-row>
            <a-col :span="4" style="padding-left: 12px; margin-left: -12px">
              条件设置
            </a-col>
            <a-col :span="20">
              <!-- <data-range-mapping v-model="rangeModel" :items="rangeDataItemList" :customStyle="rangeStyle"></data-range-mapping> -->
              <template v-for="(AModel, index) in rangeModelAll">
                <div :key="index">
                  <data-range-mapping
                    :value="AModel"
                    :items="rangeDataItemList"
                    :customStyle="rangeStyle"
                    @deleteOr="deleteOrConditions(index)"
                  />

                  <div v-show="index !== rangeModelAll.length - 1" class="or">
                    或
                  </div>
                </div>
              </template>
              <div
                v-if="rangeModelAll.length < 10"
                class="addConditions"
                @click="addOrConditions"
              >
                <span>
                  <i class="icon aufontAll h-icon-all-plus-o"></i>
                </span>
                <span>添加或条件</span>
              </div>
            </a-col>
          </a-row>
        </div>
        <a-form-item
          v-if="isInputedCodeAndName !== 'parentId' && showStyle !== 'tree'"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 12 }"
        >
          <span
            slot="label"
            style="position: relative"
            class="span-text"
            @click="toggleUpDown(5)"
          >
            <span style="margin-left: 5px">查询条件</span>
            <i
              class="icon aufontAll"
              :class="[
                isConditionUpDown ? 'h-icon-all-down-o' : 'h-icon-all-right-o',
              ]"
              style="position: absolute; left: -8px; font-size: 12px; top: -2px"
            ></i>
          </span>
        </a-form-item>
        <div v-show="isConditionUpDown" class="upDownCls">
          <a-row>
            <a-col :span="4" style="padding-left: 12px; margin-left: -12px">
              条件设置
            </a-col>
            <a-col :span="20">
              <query-condition2
                v-model="queryDatas"
                :source="querySource"
                :target="target"
              />
            </a-col>
          </a-row>
        </div>

        <a-form-item
          v-if="isInputedCodeAndName !== 'parentId'"
          label="显示链接模式"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 12 }"
        >
          <a-select v-model="linkMode" :class="displayData">
            <template v-for="item in linkModeOptions">
              <a-select-option :key="item" :value="item">
                {{ item }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="plainOptions.length !== 0"
          :label="$t('languages.Apps.StorageOption')"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 12 }"
        >
          <a-checkbox-group
            v-model="storageItems"
            class="checkbox-form-align"
            :options="plainOptions"
            @change="getStorageTypes"
          />
        </a-form-item>
      </template>
      <!-- 短文本0/长文本1/数值型2/选人控件5  -->
      <template v-else-if="getTypeShow">
        <div>
          <a-form-item
            :label="$t('languages.Apps.StorageOption')"
            :labelCol="{ span: 4 }"
            labelAlign="left"
            :wrapperCol="{ span: 12 }"
          >
            <a-checkbox-group
              v-model="storageItems"
              class="checkbox-form-align"
              :options="plainOptions"
              @change="getStorageTypes"
            />
          </a-form-item>
        </div>
      </template>
      <div
        v-if="isShowBasicAttrDiv && isInputedCodeAndName !== 'parentId'"
        class="split-title"
      >
        数据项属性
      </div>

      <data-item-date-number
        v-if="
          dataType === DataItemTypes.Date || dataType === DataItemTypes.Number
        "
        :options="options"
        :dataType="dataType"
        @handChangeFormat="handChangeFormat"
      />
      <div v-if="showChangeSetting" class="change-content">
        <div class="change-title">
          选项设置
          <i
            class="icon aufontAll bizOptionIcon"
            :class="[
              isBizOptionDataDown ? 'h-icon-all-down-o' : 'h-icon-all-right-o',
            ]"
            @click="toggleUpDown(6)"
          ></i>
        </div>
        <div v-show="isBizOptionDataDown" style="margin-top: 15px">
          <biz-option-data-model
            :key="dataType + 'optionBiz'"
            ref="bizOptionDataModelRef"
            :showOptionBiz="showOptionBiz"
            :showModel="true"
            :modalData="modalDataOptions"
            :dataType="dataType"
            :dataItems="dataItems"
          />
        </div>
      </div>
      <div v-if="postInfo.code === 'sequenceNo'">
        <data-item-doc-strategy :options="options" :dataItems="dataItems" />
      </div>
      <!-- 人员映射关系  -->
      <template v-if="isStaff">
        <a-form-item
          label="映射关系"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 20 }"
          class="subTitle"
        >
          <a-switch
            v-model="isUserMappingOpen"
            @click.native="changeUserMapping"
          />
          <i
            v-show="isUserMappingOpen"
            class="icon aufontAll"
            :class="[
              isUserMapUpDown ? 'h-icon-all-down-o' : 'h-icon-all-right-o',
            ]"
            style="float: right"
            @click="toggleUpDown(1)"
          ></i>
        </a-form-item>
        <div v-show="isUserMapUpDown" class="upDownCls">
          <a-row>
            <a-col :span="4" style="padding-left: 12px; margin-left: -12px">
              数据项设置
            </a-col>
            <a-col :span="20">
              <user-selection-map
                ref="userSelectMapRef"
                :dataItem="dataItems"
                :maping="selectMappingData"
                :control="dataItem"
              />
            </a-col>
          </a-row>
        </div>
      </template>
      <!-- 关联表单映射关系  -->
      <template v-if="isRelevant">
        <a-form-item
          v-if="isInputedCodeAndName !== 'parentId'"
          label="映射字段"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 20 }"
          class="subTitle"
        >
          <a-switch
            v-model="isRelevantMappingOpen"
            @change="onRelevantOpenChange"
          />
          <i
            v-show="isRelevantMappingOpen"
            class="icon aufontAll"
            :class="[
              isRelevantMapUpDown ? 'h-icon-all-down-o' : 'h-icon-all-right-o',
            ]"
            style="float: right"
            @click="toggleUpDown(2)"
          ></i>
        </a-form-item>
        <div v-show="isRelevantMapUpDown" class="upDownCls">
          <a-row>
            <a-col :span="4" style="padding-left: 12px; margin-left: -12px">
              条件设置
            </a-col>
            <a-col :span="20">
              <relevant-selection-map
                ref="relevantSelectMapRef"
                :relativeDataItem="relativeModelDataItems"
                :dataItems="dataItems"
                :maping="selectMappingData"
                :control="dataItem"
              />
            </a-col>
          </a-row>
        </div>
      </template>

      <!-- 数据字典 -->
      <template v-if="showDictionaries">
        <a-form-item
          label="数据字典"
          :labelCol="{ span: 4 }"
          labelAlign="left"
          :wrapperCol="{ span: 20 }"
        >
          <a-switch v-model="isUseDataDictionary" />
          <i
            v-show="isUseDataDictionary"
            class="icon aufontAll"
            :class="[
              isUseDataDictionaryDown
                ? 'h-icon-all-down-o'
                : 'h-icon-all-right-o',
            ]"
            style="float: right"
            @click="toggleUpDown(7)"
          ></i>
        </a-form-item>
        <div v-if="isUseDataDictionaryDown">
          <data-dictionaries
            ref="DataDictionariesRef"
            :modalData="dictionaryData"
            :control="control"
          />
        </div>
      </template>

      <!-- 子表[表格]8
          迭代38关联表单支持引用数据
          子表中的数据项不在当前子表中展示
          在table列表中可直接操作子表数据项
      -->
      <template v-if="false">
        <div class="subtable table-wrap">
          <a-table
            id="schema"
            :pagination="false"
            :dataSource="schemaSource"
            :columns="columns"
            size="middle"
            :scroll="{ y: 200 }"
            :locale="{ emptyText: $t('languages.NoRelevantData') }"
          >
            <!-- 表头 -->
            <span slot="idTitle" class="text-ellipsis">{{
              $t('languages.NO')
            }}</span>
            <span slot="codeTitle" class="text-ellipsis resize">编码</span>
            <span slot="nameTitle" class="text-ellipsis resize">名称</span>
            <span slot="typeTitle" class="text-ellipsis resize">数据类型</span>
            <span slot="defaultValueTitle" class="text-ellipsis resize">
              默认值
            </span>
            <span slot="displayFiledTitle" class="text-ellipsis resize">
              显示字段
            </span>
            <span slot="propertyIndexTitle" class="text-ellipsis resize">
              索引
            </span>
            <span slot="propertyEmptyTitle" class="text-ellipsis resize">
              不允许空
            </span>
            <span slot="operationTitle" class="text-ellipsis resize">操作</span>

            <!-- 子表[输入框]:编码/名称/默认值 -->
            <template
              v-for="col in ['code', 'name']"
              :slot="col"
              slot-scope="text, record"
            >
              <div :key="col" :class="col">
                <form-input
                  :ref="`form-input-${col}-${record.id}`"
                  v-model="record[col]"
                  :value="text"
                  :rules="rules[`${col}`]"
                  :type="'text'"
                  :disabled="col === 'code' && record.published"
                  :tipPosition="'top'"
                  @change="
                    (e) => handleRowChange(e.target.value, record.id, col)
                  "
                />
              </div>
            </template>
            <!-- ///////////////// 默认值输入控件区域 ///////////////// -->
            <template slot="defaultValue" slot-scope="text, record">
              <div class="defaultvalue">
                <a-date-picker
                  v-if="Number(record.propertyType) === DataItemTypes.Date"
                  v-model="record.defaultValue"
                  class="date default"
                  :placeholder="$t('languages.PlaceHolder.Select')"
                />
                <!-- @change="(e, str) => record.defaultValue = str" -->
                <a-input
                  v-else-if="Number(record.propertyType) < 3"
                  v-model="record.defaultValue"
                  class="default"
                  placeholder="请输入默认值"
                />
                <!-- [子表] 关联表单 -->
                <biz-models-selector
                  v-else-if="
                    Number(record.propertyType) ===
                      DataItemTypes.RelevanceForm ||
                    Number(record.propertyType) ===
                      DataItemTypes.RelevanceFormEx
                  "
                  v-model="record.relativeCode"
                  class="default"
                  :disabled="record.published"
                  :appCode="record.appPackageCode"
                  :folderId="record.appFunctionCode"
                  :expandCode="expandCode"
                  :placeholder="$t('languages.PlaceHolder.Select')"
                  @change="(v) => onSchemaTreeChange(v, record)"
                />
              </div>
            </template>

            <template slot="displayFiled" slot-scope="text, record">
              <!-- <div>{{record.displayFiledList}}</div> -->
              <div
                v-if="
                  Number(record.propertyType) !== DataItemTypes.RelevanceForm
                "
              >
                --
              </div>
              <div
                v-if="
                  Number(record.propertyType) === DataItemTypes.RelevanceForm ||
                  Number(record.propertyType) === DataItemTypes.RelevanceFormEx
                "
                class="displayfiled"
              >
                <a-select
                  v-model="record.relativePropertyCode"
                  :placeholder="$t('languages.PlaceHolder.Select')"
                  @change="handleDisplayChange"
                  @select="changeSelect(record)"
                >
                  <a-select-option
                    v-for="item in record.displayFiledList"
                    :key="item.code"
                    :value="item.code"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </div>
            </template>

            <!-- 子表[下拉选择框]: 数据类型 -->
            <template slot="type" slot-scope="text, record">
              <div class="tbtype">
                <a-select
                  v-model="record.propertyType"
                  placeholder="业务类型"
                  defaultValue="0"
                  :disabled="record.published"
                  class="datatype"
                  @change="handleSubtableSelect"
                  @select="changeSelect(record)"
                >
                  <!-- :disabled="published === true && !!record.schemaCode" -->
                  <a-select-option
                    v-for="opt in schemaCodeTypeList"
                    :key="opt.index"
                  >
                    {{ opt.name }}
                  </a-select-option>
                </a-select>
              </div>
            </template>
            <!-- 子表[复选框]：索引，不为空 -->
            <template
              v-for="p in ['propertyIndex', 'propertyEmpty']"
              :slot="p"
              slot-scope="text, record, index"
            >
              <div :key="p" :class="p">
                <a-checkbox
                  v-if="propertyArray.includes(record.propertyType)"
                  :checked="text"
                  :disabled="
                    p === 'propertyIndex' &&
                    (+record.propertyType === DataItemTypes.RelevanceForm ||
                      +record.propertyType === DataItemTypes.RelevanceFormEx)
                  "
                  @change="(e) => onCheckboxChange(e.target, index, p)"
                />
              </div>
            </template>
            <template slot="operation" slot-scope="text, record">
              <span @click="onRowDelete(record.key)">
                <i>删除</i>
              </span>
            </template>
          </a-table>
        </div>
      </template>
      <!-- 提交保存 -->
      <div
        v-if="!['createdDeptId', 'ownerDeptId'].includes(bizPropertyCode)"
        class="draw-body-bottom"
      >
        <a-form-item>
          <a-button
            :type="editMode === 'add' ? 'default' : 'primary'"
            htmlType="submit"
            @click="handleSave($event)"
          >
            保存
          </a-button>
          <a-button
            v-if="editMode === 'add'"
            type="primary"
            htmlType="submit"
            @click="handleSaveContinue($event)"
          >
            保存并新增
          </a-button>
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>
<style lang="less" scoped>
.form-wrap {
  padding-bottom: 30px;
  .change-content {
    margin-bottom: 10px;
    .change-title {
      color: #111218;
      font-weight: 600;
      .bizOptionIcon {
        float: right;
        font-weight: 400;
        color: rgba(17, 18, 24, 0.5);
        margin-right: 8px;
      }
    }
  }
  .ant-table-thead {
    th {
      padding: 12px 0;
    }
  }
  .wid_300 {
    width: 200px;
  }
  .resize {
    height: 22px;
    // width: calc(100% + 42px);
    padding: 0 8px;
    // transform: translateX(-16px);
    border-left: 1px solid #e8e8e8;
    font-weight: 600;
  }
  /deep/.ant-form {
    color: rgba(17, 18, 24, 0.5);
  }
  /deep/.ant-form-item-control {
    line-height: 32px;
  }
  /deep/.ant-checkbox-group-item {
    margin-right: 16px;
  }
  // padding-top: 20px;
  /deep/.ant-form-item-label {
    // padding-left:12px;
    // margin-left: -12px;
    line-height: 32px;
    box-sizing: content-box;
    label {
      height: 22px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      line-height: 22px;
      &::before {
        margin-right: 0 !important;
      }
      span {
        margin-left: 0;
        margin-right: 3px;
      }
      &::after {
        display: none;
      }
    }
  }
  .input-color {
    div,
    li {
      color: #111218;
    }
  }
  .ant-select-disabled {
    color: rgba(17, 18, 24, 0.25);
  }
  .ant-select-disabled {
    .ant-select-selection-selected-value {
      color: rgba(17, 18, 24, 0.25);
    }
  }
  font-family: PingFangSC-Regular;
  .ant-row {
    margin-bottom: 16px;
  }
  .ant-col-5 {
    // padding-left: 17px;
    width: 133px;
    text-align: left;
  }
  .ant-col-12 {
    width: 292px;
    height: 32px;
    .date {
      width: 100%;
    }
  }
  .ant-btn-primary {
    margin-left: 8px;
    //  background-color: @primary-color;
    //  border-color: @primary-color;
  }
  .draw-body-bottom {
    padding: 6px 0;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    background: #fff;
    border-radius: 0 0 4px 4px;
    text-align: center;
    color: rgba(17, 18, 24, 0.5);
    .ant-row {
      margin: 0;
    }
    .ant-col-12 {
      height: auto;
    }
  }
  .table-head {
    background: #e9e9e9;
  }
  .input-box {
    padding: 8px;
    width: 94px;
    height: 32px;
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    border: 1px solid #d9d9d9;
  }
  .subtable {
    .ant-table-placeholder {
      display: none;
    }
    .handle-box {
      text-align: center;
      padding: 10px 0;
      /*margin-bottom: 8px;*/
      line-height: 14px;
      /*text-align: right;*/
      font-size: 14px;
      color: @primary-color;
      span {
        cursor: pointer;
      }
    }
    .ant-table-header {
      &::-webkit-scrollbar {
        width: 0;
      }
    }
    .ant-table-body {
      td {
        padding-top: 3px !important;
        color: #111218;
        padding-bottom: 3px !important;
        // .default {
        //   width: 144px;
        // }
        // .datatype {
        //   width: 122px;
        // }
      }
      // max-height: calc(100vh - 350px) !important;
      &::-webkit-scrollbar {
        width: 0;
      }
    }
  }
  .ant-table-thead > tr > th {
    padding: 8px 14px;
    font-weight: 600;
    color: rgba(17, 18, 24, 0.5);
  }
  .ant-table-bordered .ant-table-tbody > tr > td {
    text-align: center;
    .icon {
      cursor: pointer;
    }
  }
  .ant-drawer-title {
    font-size: 16px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: rgba(0, 0, 0, 1);
    line-height: 24px;
  }
  .ant-form-item-label label {
    line-height: 22px;
    color: @light-color-2;
  }
  .ant-form-item-children .checkbox-form-align {
    line-height: 32px;
  }
  .ant-checkbox-wrapper,
  .ant-form-item,
  .ant-select {
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
  }
  .ant-select.ant-select-disabled {
    color: rgba(17, 18, 24, 0.25);
  }

  .ant-select-arrow {
    font-size: 14px;
  }

  .table-wrap {
    max-height: calc(100vh - 413px) !important;
    overflow-y: scroll;
  }
}
.ant-drawer-body {
  overflow: auto;
  height: calc(100% - 115px);
}
.green {
  background: @primary-color;
  border: 1px solid @primary-color;
  color: #fff;
}
.green:hover {
  background: rgba(81, 188, 1, 0.8);
  border: 1px solid rgba(81, 188, 1, 0.8) !important;
  color: #fff;
}
.ant-table-middle
  > .ant-table-content
  > .ant-table-scroll
  > .ant-table-header
  > table
  > .ant-table-thead
  > tr
  > th {
  text-align: center;
}
.split-title {
  font-size: 14px;
  font-weight: bold;
  // padding-left: 10px;
  // border-left: 4px solid @primary-color;
  position: relative;
  color: #111218;
  margin-bottom: 20px;
  // &::after {
  //   content: ' ';
  //   position: absolute;
  //   bottom: -10px;
  //   height: 1px;
  //   background: #e8e8e8;
  //   left: 0;
  //   right: 0;
  // }
  &:not(:first-child) {
    padding-top: 24px;
    margin-bottom: 25px;
    border-top: 1px solid #e8e8e8;
    margin-top: 24px;
  }
}
.subTitle {
  /deep/ label {
    font-size: 14px;
    font-weight: bold;
    color: #111218;
  }
}
.upDownCls {
  position: relative;
  transition: height 0.25s;
  margin-bottom: 16px;
}
.addConditions {
  color: @primary-color;
  font-weight: 400;
  font-size: 14px;
  /* text-align: center; */
  cursor: pointer;
  line-height: 48px;
  span {
    margin-top: 16px;
    margin-right: 8px;
  }
}
</style>

<script lang="ts">
import AppsApi from '@/apis/apps';
import { nameValidator } from '@/common/utils';
import { sliceString } from 'cloudpivot/form/utils/utils';
import DataItemDateNumber from '@/components/apps/model/dataitem-modals/dataItemDateNumber.vue';
// import DataItemDocStrategy from '@/components/apps/model/dataitem-modals/dataItemDocStrategy-new.vue';
import DataItemDocStrategy from 'cloudpivot/form/src/common/components/document-strategy-modal.vue';
import FormInput from '@/components/global/form-input/index.vue';
import { LanguageTransform } from '@/utils';
import Bus from '@/utils/bus';
import DataItemSelect from '@/views/app/data-rule/data-item-select.vue';
import { bizproperty, bizpropertyApi, listApi } from 'cloudpivot/api';
import { NumberFormatType } from 'cloudpivot/form/component-schema';
import { DataItemType } from 'cloudpivot/form/schema';
import bizModelsSelector from 'cloudpivot/form/src/common/components/biz-models-selector/index.vue';
import BizOptionDataModel from 'cloudpivot/form/src/common/components/biz-option-data-model.vue';
import DataDictionaries from 'cloudpivot/form/src/common/components/data-dictionaries.vue';
import { DataItem } from 'cloudpivot/form/src/common/components/data-item';
import DataRangeMapping from 'cloudpivot/form/src/common/components/data-range-mapping.vue';
import { DataitemMappingValueItem } from 'cloudpivot/form/src/common/components/dataitem-mapping.vue';
import QueryCondition2 from 'cloudpivot/form/src/common/components/query-condition2.vue';
import RelevantSelectionMap from 'cloudpivot/form/src/common/components/relevance-selection-map.vue';
import UserSelectionMap from 'cloudpivot/form/src/common/components/user-selection-map.vue';
import moment from 'moment';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import {
  dataItemColumns,
  dataItemTypeList,
  dataItemTypeSchema,
  rules,
  storageOptions,
} from './dataitem-map';
import {
  Form,
  Input,
  Select,
  Checkbox,
  Switch,
  Button,
  DatePicker,
  Row,
  Col,
} from '@h3/antd-vue';

const DataModelModule = namespace('Apps/DataModel');
export enum DataEnum {
  none = 1,
  DAY = 10,
  MONTH = 8,
  YEAR = 6,
}
export interface DataitemSource {
  title: string;
  items: DataItem[];
}
@Component({
  name: 'FormItem',
  components: {
    bizModelsSelector,
    FormInput,
    DataItemSelect,
    UserSelectionMap,
    RelevantSelectionMap,
    DataItemDateNumber,
    DataItemDocStrategy,
    BizOptionDataModel,
    DataDictionaries,
    DataRangeMapping,
    QueryCondition2,

    AForm: Form,
    AFormItem: Form.Item,
    ASelect: Select,
    ASelectOption: Select.Option,
    AInput: Input,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    ASwitch: Switch,
    AButton: Button,
    ARow: Row,
    ACol: Col,
    ADatePicker: DatePicker,
  },
})
export default class formItem extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;

  @DataModelModule.State('editMode') editMode: any;
  // 编辑模式（新增or编辑）

  @DataModelModule.State('bizPropertyCode') bizPropertyCode: any;
  // 编辑code

  @DataModelModule.State('bizSchemaCode') schemaCode: any;
  // 新增的schemaCode

  @DataModelModule.State('drawerVisible') drawerVisible: any;
  // drawer显示隐藏

  @DataModelModule.State('bussinessType') bussinessType: any;
  // // 业务类型

  @DataModelModule.State('keyWords') keyWords: any;
  // 过滤关键字

  @DataModelModule.State('bizPropertyModel') bizPropertyModel: any;

  @DataModelModule.Mutation('setCurrenEdittMode') setEditMode: any;
  // 编辑或新增模式

  @DataModelModule.Mutation('setFilterDataItemList') setFilterDataItemList: any;
  // 过滤关键字高亮

  @DataModelModule.Mutation('setKeyWords') setKeyWords: any;

  @DataModelModule.Mutation('setBizPropertyCode') setBizPropertyCode: any;

  @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;

  @DataModelModule.Action('postDataItem') postDataItem: any;
  // 保存数据项

  @DataModelModule.Action('updateDataItems') updateDataItems: any;

  @DataModelModule.Action('getDataItemDetails') getDataItemDetails: any;
  // 查询数据项详情

  @DataModelModule.Action('getDataItemList') getDataItemListX: any; // 刷新数据项例表方法

  // 校验规则
  rules = rules;

  DataItemTypes = DataItemType;

  // 存储选项
  plainOptions: Array<any> = storageOptions;

  //是否打开人员映射 或打开关联表单映射
  isUserMappingOpen: boolean = false;

  isRelevantMappingOpen: boolean = false;

  //是否打开数据联动
  isDataLinkOpen: boolean = false;

  isBizOptionDataDown: boolean = true;

  isUseDataDictionaryDown: boolean = false;

  isDataLinkUpDown: boolean = true;

  isUserMapUpDown: boolean = true;

  isRelevantMapUpDown: boolean = true;

  isRangeUpDown: boolean = false;

  isConditionUpDown: boolean = false;

  selectMappingData: any = ''; //"sdfsdf:{ShortText1616566204268};打发大水:{ShortText1616566204268};";

  linkAgeData: any = {};

  control: any = {};

  code: string = '';

  name: string = '';

  form: any = '';

  // 数据字典数据
  dictionaryData: any = {};

  // 是否使用数据字典
  isUseDataDictionary: boolean = false;

  // 可以建立索引的数据项类型列表
  @Prop() ableIndexes!: number[];

  @Prop() indexNumberLimit!: number;

  @Prop() indexNumberMax!: number;

  @Prop() propertyIndexNum!: any;

  get isHasDada() {
    return (
      this.dataType === this.DataItemTypes.Date ||
      this.dataType === this.DataItemTypes.Number ||
      this.showChangeSetting ||
      this.postInfo.code === 'sequenceNo' ||
      this.isStaff ||
      this.isRelevant ||
      this.showDictionaries
    );
  }

  checkedList: any[] = [];

  formCollection: any = {}; // ant 表单收集器收到的数据(编码/名称/数据项)

  displayItems: any[] = []; // 显示字段数据源

  displayCode: any = undefined;

  linkMode: string = 'true'; // 显示链接模式

  linkModeOptions: any[] = ['true', 'false'];

  showStyle: string = 'list';

  showStyleOptions: any[] = [
    {
      value: 'list',
      name: '平铺',
    },
    {
      value: 'tree',
      name: '树形',
    },
  ];

  /*   rangeModel: any = {
    type: 1,
    conditions: [],
  }; */
  rangeModelAll: any[] = [];

  rangeStyle: any = {
    bgStyle: {
      background: '#F4F5F8',
      padding: '10px',
      borderRadius: '4px',
    },
  };

  target: DataitemSource = {
    title: '当前表单字段',
    items: [],
  };

  querySource: DataitemSource = {
    title: '查询条件',
    items: [],
  };

  queryDatas: any[] = [];

  query: DataitemMappingValueItem[] = [];

  optionConditions: string = '';

  ops: any = []; // 操作符

  codeOptions: any = {};

  nameOptions: any = {};

  propertyTypeOptions: any = {};

  postInfo: any = {
    // 即将发送给服务器
    defaultValue: '', // 默认值
    propertyIndex: false, // 是否索引
    propertyEmpty: false, // 是否为空
    relativeCode: '',
    schemaCode: '', // 业务模型
  };

  options: any = {};

  modalDataOptions: any = {
    data: {
      default: '',
      type: null,
      value: '',
    },
    type: 'checkboxOption',
  };

  storageItems: any[] = [];

  repeated: boolean = false; //短文本去重属性

  dataType: any = null;

  // -1 根据数据项类型切换不同的视图
  saveFlag: number = 0;

  // 判断保存or保存并新增
  defaultDate: any = '';

  defaultTime: any = moment(moment().format('HH:mm:ss'), 'HH:mm:ss');

  propertyArray: Array<number> = [
    DataItemType.ShortText,
    DataItemType.LongText,
    DataItemType.Number,
    DataItemType.Date,
    DataItemType.RelevanceForm,
    DataItemType.Address,
    DataItemType.RelevanceFormEx,
  ];

  inputPublished: boolean = false; // 未发布

  selectPublished: boolean = false; // 未发布或子表未发布并且不存在数据项

  //当前模型数据项
  currentModelDataItems: Array<any> = [];

  //当前关联表单模型数据项
  relativeModelDataItems: Array<any> = [];

  // 字段引用列表
  quoteSource: Array<any> = [];

  quoteColumns: Array<any> = [
    {
      dataIndex: 'propertyType',
      slots: { title: 'propertyTypeTitle' },
      scopedSlots: { customRender: 'propertyType' },
      width: 300,
      key: 'propertyType',
      align: 'left',
    },
    {
      dataIndex: 'relativePropertyType',
      slots: { title: 'relativePropertyTypeTitle' },
      scopedSlots: { customRender: 'relativePropertyType' },
      width: 300,
      key: 'relativePropertyType',
      align: 'left',
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      width: 68,
      key: 'action',
      align: 'center',
    },
  ];

  @Prop({
    type: Array,
  })
  'templates': Array<Common.DataItems>;

  @Prop({
    type: Array,
  })
  'selectCollection': any;

  // 当前模型code
  @Prop({
    default: '',
  })
  bizSchemaCode!: string;

  copySchemaCode: string = ''; //保存当前弹框中的code

  queryCode: string = ''; // 选中的关联表单查询列表

  queryCodeList: any[] = []; // 关联表单查询列表

  get isInputedCodeAndName() {
    return (this.code && this.name) || this.bizPropertyCode;
  }

  // 是否显示数据字典
  get showDictionaries() {
    let status = false;
    switch (this.dataType) {
      case DataItemType.ShortText:
        // case DataItemType.Radio:
        // case DataItemType.Checkbox:
        // case DataItemType.Dropdown:
        // case DataItemType.DropdownMulti:
        status = true;
        break;
      default:
        break;
    }
    if (this.dataItem && this.dataItem.isSystem) {
      status = false;
    }
    return status;
  }

  get showChangeSetting() {
    let status = false;
    switch (this.dataType) {
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.Radio:
        status = true;
        break;
      default:
        break;
    }
    return status;
  }

  get showOptionBiz() {
    let status = false;
    switch (this.dataType) {
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.Checkbox:
      case DataItemType.Radio:
        status = true;
        break;
      default:
        break;
    }
    return status;
  }

  get defaultValueRule() {
    if (+this.dataType === 2) {
      return {
        rules: [
          {
            pattern: /^\d{1,13}(\.\d{1,2})?$/,
            message: '数值整数最大13位，小数最大2位',
          },
        ],
      };
    }
    return {};
  }

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  get expandCode() {
    return this.$route.params.appCode;
  }

  get displayData() {
    return this.getDisplayData();
  }

  get currentCode() {
    return this.$route.params.appCode;
  }

  //是否是选人控件
  get isStaff() {
    return (
      this.dataType === DataItemType.StaffSingle ||
      this.dataType === DataItemType.StaffDeptMix
    );
  }

  get isShowBasicAttrDiv() {
    return !(
      this.dataType === this.DataItemTypes.Sheet ||
      this.dataType === this.DataItemTypes.Logic ||
      this.dataType === this.DataItemTypes.Attachment ||
      this.dataType === this.DataItemTypes.Address ||
      this.dataType === this.DataItemTypes.Address ||
      this.postInfo.code === 'createdDeptId' ||
      this.dataType === this.DataItemTypes.StaffMulti ||
      this.dataType === this.DataItemTypes.DeptSingle ||
      this.dataType === this.DataItemTypes.DeptMulti ||
      this.dataType === this.DataItemTypes.LongText
    );
  }

  get isRelevant() {
    return (
      this.dataType === DataItemType.RelevanceForm ||
      this.dataType === DataItemType.RelevanceFormEx
    );
  }

  get rangeDataItemList() {
    const data = this.relativeModelDataItems.filter(
      (item) =>
        item.propertyType === DataItemType.ShortText ||
        item.propertyType === DataItemType.Radio ||
        item.propertyType === DataItemType.Checkbox ||
        item.propertyType === DataItemType.Dropdown ||
        item.propertyType === DataItemType.DropdownMulti ||
        item.propertyType === DataItemType.Number ||
        item.propertyType === DataItemType.Date ||
        item.propertyType === DataItemType.Logic ||
        item.propertyType === DataItemType.RelevanceForm ||
        item.propertyType === DataItemType.RelevanceFormEx ||
        item.propertyType === DataItemType.StaffSingle ||
        item.propertyType === DataItemType.StaffMulti ||
        item.propertyType === DataItemType.DeptSingle ||
        item.propertyType === DataItemType.DeptMulti ||
        item.propertyType === DataItemType.StaffDeptMix ||
        item.propertyType === DataItemType.Sheet,
    );

    const map = (x: any) => ({
      code: x.propertyCode || x.code,
      type: x.propertyType,
      name: x.name,
      relativeCode: x.relativeCode || x.relativeSchemaCode,
      isSystem: x.defaultProperty,
    });
    return data.map(map);
  }

  nameChange(e: any, name: any) {
    this.name = e.target.value;
  }

  codeChange(e: any, code: any) {
    this.code = e.target.value;
  }

  initTargetItemList() {
    const items = this.dataItems;
    this.target = {
      title: this.target.title,
      items: items,
    };
    if (!this.dataItem.parentCode) {
      this.target = {
        title: this.target.title,
        items: this.target.items.filter((x) => !x.parentCode),
      };
    }
  }

  mounted() {
    console.log(this.dataItem.type);
    console.log(this.propertyIndexNum);
    if (this.dataItem.type === 9 || this.dataItem.type === 11) {
      this.plainOptions = [storageOptions[0]];
    }

    if (
      this.editMode === 'edit' &&
      [...this.ableIndexes].length !== 0 &&
      !this.ableIndexes.includes(this.dataItem.type)
    ) {
      this.plainOptions = [storageOptions[1]];
      if (this.dataItem.type === 9 || this.dataItem.type === 11) {
        this.plainOptions = [];
      }
    }
  }

  get getTypeShow() {
    let status = false;
    if (this.postInfo.defaultProperty) {
      return status;
    }
    switch (+this.dataType) {
      case DataItemType.Number:
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.LongText:
      case DataItemType.StaffMulti:
      case DataItemType.Date:
      case DataItemType.StaffDeptMix:
      case DataItemType.StaffSingle:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
      case DataItemType.RelevanceForm:
      case DataItemType.RelevanceFormEx:
        status = true;
        break;
      default:
        break;
    }
    return status;
  }

  get dataItem() {
    let dataItemTemp: any = {};
    let parentCode = '';
    if (this.bizSchemaCode !== this.schemaCode) {
      parentCode = this.schemaCode;
    }

    if (this.bizPropertyCode) {
      dataItemTemp = this.dataItems.find(
        (item) =>
          item.code === this.bizPropertyCode ||
          item.code.includes('.' + this.bizPropertyCode),
      );
    } else {
      dataItemTemp = {
        type: this.dataType,
        propertyType: this.dataType, // to do mock
        code: this.code,
        name: this.name,
      };
    }
    console.log('dataItemTemp------------------', dataItemTemp);
    dataItemTemp.parentCode = parentCode;
    return dataItemTemp;
  }

  // 选人控件映射，数据联动,选项属性 等
  getOptions() {
    const options: any = {};
    if (this.isStaff) {
      options.mappings = this.getUserSelectionMaping();
    } else if (this.isRelevant) {
      if (this.isRelevantMappingOpen) {
        options.mappings = this.getRelevantSelectionMaping();
      } else {
        options.mappings = '';
      }
    } else {
      //Else Empty block statement
    }

    // 保存数据字典数据
    if (this.isUseDataDictionary) {
      options.dictionaryData = {};
      options.dictionaryData.options = this.getDataDictionariesOptions();
      options.dictionaryData.isUseDataDictionary = this.isUseDataDictionary;

      if (options.dictionaryData.options === false) {
        return 'verificaError';
      }
    } else {
      options.dictionaryData = {};
      options.dictionaryData.options = '';
      options.dictionaryData.isUseDataDictionary = false;
      options.dictionaryData = '';
    }
    return options;
  }

  // 获取数据字典配置
  getDataDictionariesOptions() {
    const dictionariesRef = this.$refs.DataDictionariesRef;
    if (dictionariesRef) {
      return (dictionariesRef as any).bizmodeBack();
    }
  }

  getUserSelectionMaping() {
    const userSelectMapRef = this.$refs.userSelectMapRef;
    if (userSelectMapRef) {
      return (userSelectMapRef as any).getMaping();
    }
  }

  getRelevantSelectionMaping() {
    const relevantSelectMapRef = this.$refs.relevantSelectMapRef;
    if (relevantSelectMapRef) {
      return (relevantSelectMapRef as any).getMaping();
    }
  }

  getBizOptionDataModelRef() {
    const bizOptionDataModelRef = this.$refs.bizOptionDataModelRef;
    if (bizOptionDataModelRef) {
      return (bizOptionDataModelRef as any).getData();
    }
  }

  // 获取关联表单显示字段
  async getDisplayData(schemaCode?: string, code?: string) {
    this.displayItems = [];
    this.displayCode = '数据标题';

    const that = this;
    const params = {
      schemaCode: this.postInfo.relativeCode,
    };
    if (schemaCode === undefined) {
      // schemaCode为空时必须传入""，传入null会报错
      params.schemaCode =
        this.postInfo.relativeCode === null ? '' : params.schemaCode;
    } else {
      params.schemaCode = schemaCode;
    }
    const { data } = await AppsApi.getDataItemList(params);
    if (data && Array.isArray(data)) {
      // 过滤附件、图片、手写签名、子表
      data.forEach((item: any, index: number) => {
        if (item.published) {
          if (
            that.displayCode &&
            that.displayCode === '' &&
            item.name === '数据标题'
          ) {
            that.displayCode = item.code;
          }

          // 当设置的显示字段被删除后，应该显示数据标题
          const isDel = data.find(
            (d: any) => d.code === that.postInfo.relativePropertyCode,
          );
          // 默认显示数据标题
          if (
            that.postInfo.relativePropertyCode === null ||
            isDel === undefined
          ) {
            that.postInfo.relativePropertyCode = 'name';
          }
          if (item.code === that.postInfo.relativePropertyCode) {
            that.displayCode = item.code;
          }
        }
        if (
          item.published &&
          !(item.propertyType === DataItemType.Attachment) &&
          !(item.propertyType === DataItemType.Sheet) &&
          !(item.propertyType === DataItemType.RelevanceForm) &&
          !(item.propertyType === DataItemType.RelevanceFormEx) &&
          !(item.propertyType === DataItemType.Address) &&
          !(item.propertyType === DataItemType.DeptSingle) &&
          !(item.propertyType === DataItemType.StaffMulti) &&
          !(item.propertyType === DataItemType.DeptMulti) &&
          !(item.propertyType === DataItemType.Logic) &&
          !(item.propertyType === DataItemType.LongText) &&
          !(item.propertyType === DataItemType.StaffDeptMix) &&
          !(item.code === 'ownerDeptQueryCode')
        ) {
          that.displayItems.push(item);
        }
      });
    }
  }

  // 获取关联表单查询列表
  async getListConfigList(schemaCode: string, appCode: string) {
    listApi
      .getListConfigList(schemaCode, undefined, appCode)
      .then((res) => {
        if (res.errcode === 0) {
          this.queryCodeList = res.data
            .filter((l: any) => l.publish)
            .map((x: any) => ({
              value: x.code,
              name: x.name,
            }));
          if (this.queryCodeList.length > 0) {
            this.queryCode = this.queryCode || this.queryCodeList[0].value;
          }
        } else {
          this.queryCodeList = [];
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  @Watch('dataType', { deep: true })
  handleDataType(v: any) {
    if (Number(v) === DataItemType.Date) {
      // 自动填充日期
      if (this.editMode === 'edit' && this.postInfo.defaultValue !== '') {
        // 编辑
        this.defaultDate = moment(this.postInfo.defaultValue, 'YYYY-MM-DD');
      }
    } else if (Number(v) === DataItemType.Sheet) {
    } else {
      //Else Empty block statement
    }

    // 当为关联表单时 获取当前模型的全部数据项
    this.currentModelDataItems = [];
    if (
      Number(this.dataType) === DataItemType.RelevanceForm ||
      Number(this.dataType) === DataItemType.RelevanceFormEx
    ) {
      this.getCurrentDataItem(this.copySchemaCode);
      this.initTargetItemList();
    }
  }

  @Watch('schemaSource')
  setDataItemTypeDisable(v: any) {
    // 子表类型不能切换类型，切换类型时
    if (v.length > 0 && Number(this.dataType) === DataItemType.Sheet) {
      this.dataItemTypeList.forEach((el) => {
        el.disabled = true;
      });
    } else if (v.length <= 0) {
      this.dataItemTypeList.forEach((el) => {
        el.disabled = false;
      });
    } else {
      //Else Empty block statement
    }
  }

  // mounted() {
  //   this.setTypeProperty();
  // }

  /**
   * 编辑时 获取数据详情
   */
  // @Watch('bizPropertyCode')
  setTypeProperty(v: any) {
    // const v = this.bizPropertyCode;
    const that = this;
    if (v !== '') {
      // 获取数据项详情
      // this.getDataItemDetails({ bizPropertyCode: this.bizPropertyCode, bizSchemaCode: this.schemaCode });
      this.getDataItemDetails({
        propertyCode: this.bizPropertyCode,
        schemaCode: this.copySchemaCode,
      })
        .then((result: any) => {
          if (!result) {
            return false;
          }
          const { code, name, propertyType, subSchema, published, name_i18n } =
            result;
          this.dataType = propertyType;
          result.options = result.options ? result.options : '{}';
          result.options = JSON.parse(result.options);
          if (
            propertyType === DataItemType.Number ||
            propertyType === DataItemType.Date
          ) {
            if (!result.options || (result.options && !result.options.format)) {
              if (code === 'createdTime' || code === 'modifiedTime') {
                result.options.format = 'YYYY-MM-DD HH:mm:ss';
              } else {
                result.options.format =
                  propertyType === DataItemType.Number
                    ? NumberFormatType.Int
                    : propertyType === DataItemType.Date
                    ? 'YYYY-MM-DD'
                    : undefined;
              }
            }
          } else if (
            propertyType === DataItemType.Radio ||
            propertyType === DataItemType.Checkbox
          ) {
            this.modalDataOptions.data.value = result.options.options
              ? /^(\{).*(\})$/.test(result.options.options)
                ? result.options.options
                : result.options.labels
                ? result.options.labels
                : result.options.options
              : result.options.labels
              ? result.options.labels
              : '选项1;选项2;选项3';

            this.modalDataOptions.data.default = result.options.defaultValue
              ? result.options.defaultValue
              : '';

            this.modalDataOptions.type =
              propertyType === DataItemType.Radio
                ? 'bizRadioOption'
                : 'checkboxOption';
            //lin
            //   // 单选类型改变type
            // if(propertyType === DataItemType.Radio) {
            //   this.modalDataOptions.type = 'bizRadioOption'
            //   this.modalDataOptions.data.default = result.options.defaultValue
            // }

            // if(propertyType === DataItemType.Checkbox) {
            //   this.modalDataOptions.type = 'bizRadioOption'
            //   this.modalDataOptions.data.default = result.options.defaultValue
            // }
          } else if (
            propertyType === DataItemType.Dropdown ||
            propertyType === DataItemType.DropdownMulti
          ) {
            this.modalDataOptions.data.value = result.options.options
              ? /^(\{).*(\})$/.test(result.options.options)
                ? result.options.options
                : result.options.labels
                ? result.options.labels
                : result.options.options
              : result.options.labels
              ? result.options.labels
              : '';

            this.modalDataOptions.data.default = result.options.defaultValue
              ? result.options.defaultValue
              : '';
            this.modalDataOptions.type =
              propertyType === DataItemType.Dropdown
                ? 'dropdownOption'
                : 'dropdownMutiOption';
          } else {
            //Else Empty block statement
          }
          if (code === 'sequenceNo') {
            result.options.seqNoSetting =
              result.options.seqNoSetting && result.options.seqNoSetting.length
                ? result.options.seqNoSetting
                : [
                    {
                      type: 'UID', //UID
                      value: 'aa860e64ff2e4f86851a661d663ae358',
                    },
                  ];
          }
          this.options = result.options;
          if (result.options.mappings) {
            this.selectMappingData = result.options.mappings;
            if (this.isStaff) {
              this.isUserMappingOpen = result.options.mappings;
            } else if (this.isRelevant) {
              this.isRelevantMappingOpen = result.options.mappings;
            } else {
              //Else Empty block statement
            }
          } else {
            this.selectMappingData = null;
            if (this.isStaff) {
              this.isUserMappingOpen = false;
            } else if (this.isRelevant) {
              this.isRelevantMappingOpen = false;
            } else {
              //Else Empty block statement
            }
          }

          // 初始化 数据字典 数据
          if (result.options.dictionaryData) {
            this.dictionaryData = result.options.dictionaryData.options;
            this.isUseDataDictionary =
              result.options.dictionaryData.isUseDataDictionary;
          }

          if (
            propertyType === DataItemType.RelevanceForm ||
            propertyType === DataItemType.RelevanceFormEx
          ) {
            if ('linkMode' in result.options) {
              this.linkMode = String(result.options.linkMode);
            } else {
              this.linkMode = 'true';
            }
            if (result.options.showStyle) {
              this.showStyle = result.options.showStyle;
            } else {
              this.showStyle = 'list';
            }
            if (result.options.searchFormula) {
              const parseResult = JSON.parse(result.options.searchFormula);
              if (!Array.isArray(parseResult)) {
                this.rangeModelAll.push(parseResult); //历史数据兼容处理
              } else {
                this.rangeModelAll = parseResult;
              }
            }
            if (result.options.conditions) {
              try {
                const tmpObj: any = JSON.parse(result.options.conditions);
                if (tmpObj) {
                  this.optionConditions = tmpObj.queryText;
                  this.ops = tmpObj.$queryData;
                }
              } catch (err) {
                console.log(err);
              }
            }
          }

          console.log('result.options===>', result.options);

          if (
            subSchema &&
            subSchema.properties &&
            subSchema.properties.length > 0
          ) {
            this.selectPublished = true;
          } else {
            this.selectPublished = published;
          }
          this.inputPublished = published;
          const globalName = LanguageTransform.getLang(name, name_i18n);

          const initNameI18n = LanguageTransform.initNameI18n(name, name_i18n);

          this.$nextTick(() => {
            // 设置表单数据
            if (this.form.setFieldsValue) {
              this.form.setFieldsValue({
                code,
                name: globalName,
                propertyType: propertyType,
              });
            }

            // 存在 子表时候
            if (subSchema && Array.isArray(subSchema.properties)) {
              this.schemaSource = subSchema.properties
                .filter(
                  (item: any) =>
                    !['id', 'parentId', 'sortKey'].includes(item.code),
                )
                .map((item: any, idx: number) => {
                  const obj = {
                    ...item,
                    propertyType: item.propertyType,
                    dataId: item.id,
                    id: idx + 1,
                    key: (new Date().getTime() + idx).toString(),
                    name: LanguageTransform.getLang(item.name, item.name_i18n),
                    name_i18n: LanguageTransform.initNameI18n(
                      name,
                      item.name_i18n,
                    ),
                  };
                  if (+obj.propertyType === DataItemType.Date) {
                    obj.defaultValue = obj.defaultValue
                      ? moment(obj.defaultValue, 'YYYY-MM-DD')
                      : null;
                  }
                  // if (obj.propertyType === "9") {
                  //   this.fillDisplayData(obj.relativeCode, idx);
                  // }

                  return obj;
                });

              this.schemaSource.forEach((schema: any, index: number) => {
                this.fillDisplayData(schema.relativeCode, index);
              });
            } else {
              this.schemaSource = [];
            }
            this.dataType = propertyType; // 触发select
          });

          if (result.relativeQuoteCode) {
            this.quoteSource = JSON.parse(result.relativeQuoteCode);
          }
          //若后端返回的relativeCode为空则获取options中的schemaCode
          let relativeCode = result.relativeCode;
          if (!relativeCode) {
            relativeCode = result.options ? result.options.schemaCode : null;
          }
          //若后端返回的relativePropertyCode为空则获取options中的displayField
          let relativePropertyCode = result.relativePropertyCode;
          if (!relativePropertyCode) {
            relativePropertyCode = result.options
              ? result.options.displayField
              : null;
          }
          this.queryCode = result.options ? result.options.queryCode : '';
          this.postInfo = {
            defaultValue: result.defaultValue ? result.defaultValue : '',
            defaultProperty: result.defaultProperty,
            propertyIndex: result.propertyIndex,
            propertyEmpty: result.propertyEmpty,
            relativeCode: relativeCode,
            appPackageCode: result.appPackageCode,
            appFunctionCode: result.appFunctionCode,
            name_i18n: initNameI18n,
            code: result.code,
            copyName: result.name,
            relativePropertyCode: relativePropertyCode,
            options: result.options,
          };

          // setTimeout(() => {
          //   this.postInfo.defaultValue = '3333333333333';
          // },500)

          if (result.propertyEmpty) {
            this.storageItems.push('propertyEmpty');
          }
          if (result.propertyIndex) {
            this.storageItems.push('propertyIndex');
          }

          //获取短文本去重属性
          if (result.repeated) {
            this.repeated = result.repeated;
          }

          this.$set(this.postInfo, 'id', result.id);
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else if (this.editMode === 'add') {
      // 新增数据项下拉框默认数据类型为短文本
      this.$nextTick(() => {
        if (this.form.setFieldsValue) {
          this.form.setFieldsValue({
            propertyType: 0,
          });
          this.dataType = 0;
        }
      });
    } else {
      //Else Empty block statement
    }
  }

  @Watch('postInfo.relativeCode')
  onRelativeCodeChange(v: any) {
    if (v) {
      this.getListConfigList(v, this.postInfo.appPackageCode);
    }
  }

  // 监听drawer
  @Watch('drawerVisible')
  setDrawerVisible(v: any) {
    if (v) {
      // 打开drawer
      console.info('打开drawer::', v);
      // this.setTypeProperty(this.bizPropertyCode);

      // this.getBussinessType({ bizSchemaCode: this.schemaCode }); // 获取业务类型
      if (this.editMode === 'add') {
        // 新增数据项下拉框默认数据类型为短文本
        this.$nextTick(() => {
          if (this.form.setFieldsValue) {
            this.form.setFieldsValue({
              propertyType: '0',
            });
            this.dataType = '0';
          }
        });
      }
    } else if (!v) {
      // 关闭drawer
      this.resetForm();
    } else {
      //Else Empty block statement
    }
  }

  async fillDisplayData(schemaCode: string, index, type?: number) {
    const tempData = Object.assign(this.schemaSource[index]);
    if (schemaCode) {
      const list = [];
      const { data } = await AppsApi.getDataItemList({
        schemaCode: schemaCode,
      });
      // 过滤附件、图片、手写签名、子表
      data.map((item: any, index: number) => {
        if (
          item.published &&
          !(item.propertyType === DataItemType.Attachment) &&
          !(item.propertyType === DataItemType.Sheet) &&
          !(item.propertyType === DataItemType.RelevanceForm) &&
          !(item.propertyType === DataItemType.RelevanceFormEx) &&
          !(item.code === 'ownerDeptQueryCode')
        ) {
          // @ts-ignore
          list.push(item);
        }
      });
      // 当设置的显示字段被删除后，应该显示数据标题
      const isDel = data.find(
        (d: any) => d.code === tempData.relativePropertyCode,
      );
      // 默认显示数据标题
      if (!tempData.relativePropertyCode || isDel === undefined) {
        tempData.relativePropertyCode = 'name';
      }
      tempData.displayFiledList = list;
    } else {
      tempData.relativePropertyCode = null;
      tempData.displayFiledList = [];
    }
    this.$set(this.schemaSource, index, tempData);
  }

  // async initDataItems() {
  //   await dataitemStore.init(this);
  //   let items = dataitemStore.getDataItems(this);
  //   items.forEach((item) => (item.used = true));
  // }
  async created() {
    this.setValidateOPtions();
    console.log(this.form, 'templates.........');
    // await this.initDataItems();
    this.copySchemaCode = this.schemaCode;
    console.log(this.bizSchemaCode, this.schemaCode, '编码-----------');
    this.setTypeProperty(this.bizPropertyCode);
    this.dataItemTypeList = [...dataItemTypeList, ...dataItemTypeSchema];
    // 当为子表新增数据项时，过滤数据类型为子表的选项
    if (this.$route.params.bizSchemaCode !== this.copySchemaCode) {
      this.dataItemTypeList = this.dataItemTypeList.filter(
        (res: any) => res.index !== 8,
      );
    }
    this.schemaCodeTypeList = [...dataItemTypeList];

    this.dataItemTypeList.forEach((el) => (el.disabled = false));

    this.columns = dataItemColumns;

    this.linkAgeData = {
      data: {
        value: '',
        type: '',
      },
    };
  }

  setValidateOPtions() {
    this.codeOptions = {
      order: 1,
      labelName: this.$t('languages.Apps.Code'),
      uiformId: 'code',
      uiType: 1, // 1输入框/2下拉选择器/3复选框
      required: true,
      maxLength: 28,
      minLength: 0,
      pattern: new RegExp(/^[a-zA-Z][a-zA-Z0-9_]{0,27}$/),
      ruleMsg: this.$t('languages.Apps.CodeRule'),
      tip: this.$t('languages.Apps.CodeRule'),
      placeholder: this.$t('languages.PlaceHolder.InputCode'),
      validator: new RegExp(/^[a-zA-Z][a-zA-Z0-9_]{0,27}$/),
    };
    this.nameOptions = {
      order: 2,
      labelName: this.$t('languages.Apps.Name'),
      uiformId: 'name',
      uiType: 1,
      required: true,
      maxLength: 40,
      minLength: 0,
      pattern: new RegExp(/^[^ ].{0,10}$/),
      ruleMsg: '请输入不以空格开头长度不超过40个字符',
      placeholder: this.$t('languages.PlaceHolder.InputName'),
      validator: nameValidator,
    };
    this.propertyTypeOptions = {
      order: 3,
      labelName: this.$t('languages.Apps.DataType'),
      uiformId: 'propertyType',
      uiType: 2, // 下拉选择器
      required: false,
      maxLength: 50,
      minLength: 0,
      pattern: '',
      ruleMsg: '',
      placeholder: this.$t('languages.PlaceHolder.Select'),
    };
  }

  beforeDestroy() {
    // Bus.$off();
  }

  resetForm() {
    /* 重置所有数据 */
    // 重置字段（编码/名称/数据类型） this.formCollection
    this.form.resetFields();
    // 重置字段 postInfo
    this.postInfo = {
      defaultValue: '',
      propertyIndex: false,
      propertyEmpty: false,
      relativeCode: '', // 关联表单：数据模型
    };
    this.storageItems = []; // 重置 索引/不为空
    this.schemaSource = []; // 重置 字表数据
    this.dataType = ''; // 重置数据项select
    // this.count = this.schemaSource.length + 1; // 序号重置
  }

  /**
   * 日期转换
   */
  getMoment() {
    // return moment(this.postInfo.defaultValue).format('YYYY-MM-DD');
    return moment(this.postInfo.defaultValue).format('YYYY-MM-DD');
  }

  // 关联表单
  onTreeChange(v: string) {
    this.postInfo.relativeCode = v;
    if (v) {
      this.getRelativeDataItem(v);
    }
  }

  // 关联表单- 子表选择
  onSchemaTreeChange(v: any, recode: any) {
    recode.relativeCode = v;
    // this.schemaSource[this.selectIndex - 1].relativeCode = v;
    this.fillDisplayData(v, recode.id - 1);
  }

  // 删除一行（子表）
  onRowDelete(key: any) {
    const vm: any = this;
    const row: any = this.schemaSource.find((res: any) => res.key === key);

    const index: number = this.schemaSource.indexOf(row);
    const { published, name } = row;
    const content = published
      ? this.$t('languages.Apps.DeleteTipsContent')
      : '';
    vm.$confirm({
      title: this.$t('languages.Apps.DeleteTips', { name }),
      content,
      okText: this.$t('languages.Ok').toString(),
      cancelText: this.$t('languages.Cancel').toString(),
      onOk() {
        if (published) {
          vm.deleteTips(index);
        } else {
          vm.deleteAction(index);
        }
      },
    });
  }

  /**
   * 删除Action
   */
  deleteAction(key: number) {
    const schemaSource = [...this.schemaSource];
    schemaSource.splice(key, 1);
    schemaSource.forEach((res: any, index: number) => {
      res.id = index + 1;
    });
    this.schemaSource = schemaSource;
  }

  // relativeDataCount: number = 0;
  /**
   * 删除已发布子表tips
   */
  deleteTips(key: number) {
    const vm: any = this;
    const { name } = vm.schemaSource[key];
    const params = {
      schemaCode: this.copySchemaCode,
    };
    AppsApi.deleteSchemaDataItem(params).then((res: any) => {
      if (res.errcode === 0) {
        if (+res.data !== 0) {
          vm.$confirm({
            title: this.$t('languages.Apps.DeleteTips', { name }),
            content: this.$t('languages.Apps.DeleteDataTips', {
              count: res.data,
            }),
            okText: this.$t('languages.Ok').toString(),
            cancelText: this.$t('languages.Cancel').toString(),
            onOk() {
              vm.deleteAction(key);
            },
          });
        } else {
          vm.deleteAction(key);
        }
      }
    });
  }

  // 添加一行（子表）
  onRowAdd() {
    const { schemaSource } = this;
    const newData = {
      name: '',
      code: '',
      propertyType: 0,
      defaultValue: '',
      propertyIndex: false,
      propertyEmpty: false,
      relativeCode: '',
      relativePropertyCode: '',
      id: '',
      key: new Date().getTime().toString(),
    };

    this.schemaSource = [...schemaSource, newData];

    this.schemaSource.forEach((res: any, index: number) => {
      res.id = index + 1;
    });

    // this.count = count + 1;
    this.$nextTick(() => {
      const schemaEl: any = document.getElementById('schema');
      const aTable: any = schemaEl.getElementsByClassName('ant-table-body')[0];
      aTable.scrollTop = aTable.scrollHeight;
    });
  }

  // 编辑行（子表）
  handleRowChange(value: any, id: any, column: any) {
    const newData = [...this.schemaSource];
    const target = newData.filter((item) => id === item.id)[0];
    if (target) {
      if (column === 'name') {
        target[column] = sliceString(value, 50);
      } else {
        target[column] = value;
      }
      this.schemaSource = newData;
    }
  }

  // 下拉选择（子表）
  selectIndex: number = 1;

  changeSelect(v: any) {
    this.selectIndex = v.id;
    v.defaultValue = '';
  }

  /**
   * 子表数据项类型切换
   */
  handleSubtableSelect(v: any, index: any) {
    // 关联表单 索引默认勾选
    // if (
    //   +v === DataItemType.RelevanceForm ||
    //   +v === DataItemType.RelevanceFormEx
    // ) {
    //   this.schemaSource[this.selectIndex - 1].propertyIndex = true;
    // }
    this.schemaSource[this.selectIndex - 1].propertyType = v;
  }

  handleDisplayChange(v: any, index: any) {
    this.schemaSource[this.selectIndex - 1].relativePropertyCode = '';
    this.$set(
      this.schemaSource[this.selectIndex - 1],
      'relativePropertyCode',
      v,
    );
  }

  // 索引/为空 change（子表）
  onCheckboxChange(v: any, index: any, column: any) {
    const newData = [...this.schemaSource];

    newData[index][column] = !newData[index][column];
    this.schemaSource = newData;
  }

  getStorageTypes(valueArr: any) {
    this.storageItems = [...valueArr];
    // console.info(this.storageItems);
  }

  /**
   * 数据类型选择器改变---非子表
   */
  handleSelectChange(value: string) {
    if (
      [...this.ableIndexes].length !== 0 &&
      !this.ableIndexes.includes(Number(value))
    ) {
      this.plainOptions = [storageOptions[1]];
      if (Number(value) === 9 || Number(value) === 11) {
        this.plainOptions = [];
      }
    } else {
      if (Number(value) === 9 || Number(value) === 11) {
        this.plainOptions = [storageOptions[0]];
      } else {
        this.plainOptions = storageOptions;
      }
    }
    // 设置select(表单收集器使用)
    this.dataType = value;
    this.form.setFieldsValue({
      propertyType: this.dataType, // fieldDecoratorId必须为字符串
    });

    // 类型切换初始数据
    this.postInfo.defaultValue = '';
    this.postInfo.relativeCode = '';
    this.postInfo.appPackageCode = '';
    this.postInfo.appFunctionCode = '';
    this.selectMappingData = null;
    this.storageItems = [];
    // this.count = this.schemaSource.length + 1;

    switch (Number(value)) {
      case DataItemType.Radio:
      case DataItemType.Checkbox:
        this.modalDataOptions.data.value = '选项1;选项2;选项3';
        break;
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        this.modalDataOptions.data.value = '';
        break;
      case DataItemType.Number:
        this.options.format = NumberFormatType.Int;
        break;
      case DataItemType.Date:
        this.$set(this.options, 'format', 'YYYY-MM-DD');
        break;
      default:
        break;
    }

    // 类型为关联表单时，默认索引
    // if (
    //   (+value === DataItemType.RelevanceForm ||
    //     +value === DataItemType.RelevanceFormEx) &&
    //   this.storageItems.indexOf("propertyIndex") === -1
    // ) {
    //   this.storageItems.push("propertyIndex");
    // }
    this.relativeModelDataItems = [];

    if (Number(value) !== DataItemType.Sheet) {
      this.schemaSource = [];
    } else if (Number(value) === DataItemType.Date) {
      this.postInfo.defaultValue = this.defaultDate;
    } else {
      //Else Empty block statement
    }
  }

  handChangeFormat(val: any) {
    this.options.format = val;
  }

  // 日期改变（对应默认值）
  dateChange(date: any, dateString: string) {
    console.log(date, dateString);
    this.postInfo.defaultValue = dateString;
  }

  //时间改变
  timeChange(date: any, dateString: string) {
    this.postInfo.defaultValue = dateString;
  }

  handleSave(event) {
    const isConstEmpty = this.queryDatas.some((x) => {
      return x.isConst && !x.target && x.target !== 0;
    });

    if (isConstEmpty) {
      this.$message.error('条件常量不能为空');
      event.preventDefault();
      return;
    }
    if (!this.checkIndexNum()) {
      event.preventDefault();
    } else {
      this.saveFlag = 0;
    }
  }

  handleSaveContinue(event) {
    if (!this.checkIndexNum()) {
      event.preventDefault();
    } else {
      this.saveFlag = 1;
    }
  }

  checkIndexNum() {
    if (
      [...this.ableIndexes].length !== 0 &&
      this.ableIndexes.includes(this.dataItem.type)
    ) {
      if (!this.storageItems.includes('propertyIndex')) {
        return true;
      } else if (
        this.propertyIndexNum[this.copySchemaCode] >= this.indexNumberMax
      ) {
        this.$message.error('已创建64个索引，达到上限，不能再新增索引');
        return false;
      } else if (
        this.propertyIndexNum[this.copySchemaCode] >= this.indexNumberLimit
      ) {
        this.$message.warning(`索引个数建议不超过${this.indexNumberLimit}个`);
      } else {
        //Else Empty block statement
      }
    }
    return true;
  }

  /**
   * 表单校验
   */
  validateForm() {
    let hasError: boolean = false;
    const list: any[] = [];
    Object.entries(this.$refs).forEach(([key, value]) => {
      if (value && /^form-input/.test(key)) {
        list.push(this.$refs[key]);
      }
    });

    list.forEach((node: any) => {
      node.forEach((res: any) => {
        const unValidated: boolean = res.validateValue({
          target: { value: res.content },
        });
        if (unValidated) {
          hasError = true;
        }
      });
    });
    return hasError;
  }

  // 【Submit】提交
  tesTips: Array<string> = [];

  handleSubmit(e: any) {
    const that: any = this;

    e.preventDefault();
    const numberTest = /^\d{1,13}(\.\d{1,2})?$/;
    // // 子表存在的校验
    if (this.schemaSource) {
      if (this.validateForm()) {
        return;
      }
      this.tesTips = [];
      this.schemaSource.forEach((res: any) => {
        // 关联表单不允许为空
        if (res.propertyType === '9' && !res.relativeCode) {
          this.$message.info('关联表单不能为空！', 2);
          // 截断函数执行
          throw new Error('表单验证不通过！');
        }
        if (res.propertyType === '3' && res.defaultValue) {
          res.defaultValue = moment(res.defaultValue).format('YYYY-MM-DD');
        }

        if (
          res.propertyType === '2' &&
          res.defaultValue &&
          !numberTest.test(res.defaultValue)
        ) {
          this.$message.info('数值整数最大13位，小数最大2位', 2);
          throw new Error('表单验证不通过！');
        }
      });
    }
    this.form.validateFields((err: any, collection: any) => {
      if (err) {
        return false;
      }
      // 预处理即将发送的数据
      // this.formCollection = this.form.getFieldsValue();
      this.formCollection = collection; // 获取基础字段（编码/名称/数据项）
      this.formCollection.propertyType = Number(
        this.formCollection.propertyType,
      ); // 转化回Nmuber类型
      // 获取存储选项
      if (this.storageItems.indexOf('propertyEmpty') > -1) {
        this.postInfo.propertyEmpty = true;
      } else {
        this.postInfo.propertyEmpty = false;
      }
      if (this.storageItems.indexOf('propertyIndex') > -1) {
        this.postInfo.propertyIndex = true;
      } else {
        this.postInfo.propertyIndex = false;
      }
      this.postInfo.schemaCode = this.copySchemaCode; // 获取并设置schemacode
      if (this.postInfo.code === 'sequenceNo') {
        let sequenceNoLength = 0;
        for (let i = 0; i < that.options.seqNoSetting.length; i++) {
          if (that.options.seqNoSetting[i].type === 'CONSTANT') {
            if (/^(\s)/.test(that.options.seqNoSetting[i].value)) {
              that.$message.error('单据号固定值类型不能以空格开头');
              return;
            }
            if (that.options.seqNoSetting[i].value.length > 60) {
              that.$message.error('单据号固定值长度不能超过60个字符');
              return;
            }
            sequenceNoLength += that.options.seqNoSetting[i].value.length;
          } else if (
            that.options.seqNoSetting[i].type === 'DELIMITER' ||
            that.options.seqNoSetting[i].type === 'DATE'
          ) {
            sequenceNoLength += that.options.seqNoSetting[i].value.length;
          } else if (that.options.seqNoSetting[i].type === 'SEQNO') {
            sequenceNoLength += Number(
              that.options.seqNoSetting[i].value.maxLength,
            );
          } else {
            //Else Empty block statement
          }
        }
        if (sequenceNoLength > 200) {
          that.$message.error(
            '当前单据号设置可能超出最大长度限制（200字符），请修改',
          );
          return;
        }
        delete this.options.resetDate;
        delete this.options.prefix;
        delete this.options.maxLength;
        delete this.options.delimiter;
      }

      // 子表
      // this.postInfo.subSchema.properties = this.schemaSource;
      // 关联表单
      // 组装即将发送的数据

      const info = Object.assign(this.postInfo, this.formCollection);
      // 获取额外options 选人控件映射，数据联动等
      info.options = this.getOptions();
      if (info.options === 'verificaError') {
        // 数据校验不通过：数据字典不能为空
        return;
      }
      if (info.options && info.options.mappings) {
        // 检验设置是否合法 后续再优化
        const mapArr: any = info.options.mappings.split(';');
        mapArr.pop();
        if (Array.isArray(mapArr)) {
          const isMatch = mapArr.every((val) => {
            //修改为可以携带.的字符，匹配子表编码拼接子表数据项编码
            if (val.indexOf('.') > -1) {
              return /\w+:\{\w+\.\w+\}/.test(val);
            } else {
              return /\w+:{\w+}/.test(val);
            }
          });
          if (!isMatch) {
            this.$message.error('映射不合法');
            return;
          }
        }
      }
      if (info.options && info.options.dataLinkage) {
        const dataLinkCheck: string = info.options.dataLinkage;
        try {
          const dataLink: any = JSON.parse(dataLinkCheck);
          if (dataLink && dataLink.isValid === false) {
            if (this.isDataLinkOpen) {
              this.$message.error(dataLink.msg);
              return;
            } else {
              info.options.dataLinkage = null;
              info.options.isDataLinkOpen = false;
            }
          }
        } catch (err) {
          this.$message.error('数据联动配置有误');
          return;
        }
      }

      if (
        this.dataType === this.DataItemTypes.Date ||
        this.dataType === this.DataItemTypes.Number ||
        this.postInfo.code === 'sequenceNo'
      ) {
        info.options = Object.assign(info.options, this.options);
      } else {
        info.options = Object.assign(this.options, info.options);
      }
      if (this.showChangeSetting) {
        const options = this.getBizOptionDataModelRef();
        if (!options) {
          return false;
        }
        // 7777
        info.defaultValue = options.default;
        info.options.defaultValue = options.default;
        info.options = Object.assign(info.options, { options: options.value });

        //lin
        //
        // info.options = Object.assign(info.options, { options: options.value, defaultValue: options.default });
      }
      const mappingArr: any[] = [];
      if (
        info.propertyType === DataItemType.RelevanceForm ||
        info.propertyType === DataItemType.RelevanceFormEx
      ) {
        console.log(
          'hahha----------------',
          this.rangeModelAll,
          this.queryDatas,
        );
        const reg =
          /^((([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29))$/;
        const join = (items: DataitemMappingValueItem[], parentCode?: string) =>
          items
            .map((q: any) => {
              if (Array.isArray(q.target)) {
                return `${q.source.code}:${JSON.stringify(q.target)}`;
              } else if (
                typeof q.target === 'string' ||
                typeof q.target === 'number'
              ) {
                if (q.target || q.target === 0) {
                  return `${q.source.code}:${q.target}`;
                }
              } else if (q.target.code) {
                if (!parentCode && q.target.code.indexOf('.') === -1) {
                  parentCode = q.target.parentCode;
                }
                if (parentCode) {
                  return `${q.source.code}:{${parentCode}.${q.target.code}}`;
                }
                return `${q.source.code}:{${q.target.code}}`;
              } else if (q.source.type === 5) {
                //为常量的时候，需要处理选人的情况，转换成json字符
                if (q.target) {
                  return `${q.source.code}:${JSON.stringify(q.target)}`;
                }
              } else if (q.source && q.source.type === DataItemType.Address) {
                return `${q.source.code}:${JSON.stringify(q.target)}`;
              } else {
                //Else Empty block statement
              }
              return null;
            })
            .filter((s) => s)
            .join(';');
        const getQueryData = (queryDatas) => {
          const arr: any[] = [];
          if (Array.isArray(queryDatas)) {
            queryDatas.forEach((el) => {
              arr.push({
                propertyCode: el.source.code,
                propertyType: el.source.type,
                name: el.source.name,
                isSystem: el.source.isSystem,
                op: el.op,
              });
            });
          }
          return arr;
        };
        this.rangeModelAll = this.modelAllClearEmpty(this.rangeModelAll);
        info.options = Object.assign(info.options, {
          schemaCode: info.relativeCode,
          displayField: info.relativePropertyCode,
          queryCode: this.queryCode,
          linkMode: this.linkMode,
          showStyle: this.showStyle,
          searchFormula:
            this.rangeModelAll.length === 0
              ? ''
              : JSON.stringify(this.rangeModelAll),
          conditions:
            Array.isArray(this.queryDatas) && this.queryDatas.length === 0
              ? ''
              : JSON.stringify({
                  queryText: join(this.queryDatas),
                  $queryData: getQueryData(this.queryDatas),
                }),
        });

        // 关联多选需要检子表映射的合法性
        if (info.propertyType === DataItemType.RelevanceFormEx) {
          if (
            info.options.hasOwnProperty('mappings') &&
            info.options['mappings']
          ) {
            const mapArr: any = info.options['mappings'].split(';');
            mapArr.pop();
            mapArr.forEach((item) => {
              const keyvaluePair = item.split(':');
              if (Array.isArray(keyvaluePair)) {
                const mappingItem = Object.create(null);
                mappingItem[keyvaluePair[0]] = keyvaluePair[1].substring(
                  1,
                  keyvaluePair[1].length - 1,
                );
                mappingArr.push(mappingItem);
              }
            });
          }
        }
      }

      info.options = JSON.stringify(info.options);

      if (
        this.formCollection.propertyType === 2 &&
        this.postInfo.defaultValue
      ) {
        if (!numberTest.test(this.postInfo.defaultValue)) {
          that.$message.info('数值整数最大13位，小数最大2位', 2);
          return;
        }
      }

      if (
        (info.propertyType === DataItemType.RelevanceForm ||
          info.propertyType === DataItemType.RelevanceFormEx) &&
        !info.relativeCode
      ) {
        that.$message.info('关联业务模型不允许为空', 2);
        return;
      }

      if (
        (info.propertyType === DataItemType.RelevanceForm ||
          info.propertyType === DataItemType.RelevanceFormEx) &&
        !info.relativePropertyCode
      ) {
        that.$message.info('显示字段不允许为空', 2);
        return;
      }

      if (
        info.propertyType === DataItemType.ShortText &&
        info.defaultValue.length > 200
      ) {
        that.$message.info('默认值的最大长度超过[200]了', 2);
        return;
      }

      if (info.propertyType === 1 && info.defaultValue.length > 1300) {
        that.$message.info('默认值的最大长度超过[1300]了', 2);
        return;
      }

      if (info.propertyType === DataItemType.Sheet && info.name.length > 50) {
        that.$message.info('子表名称的最大长度超过[50]了', 2);
        return;
      }

      if (
        (info.propertyType === DataItemType.RelevanceForm ||
          info.propertyType === DataItemType.RelevanceFormEx) &&
        this.quoteSource.length > 0
      ) {
        let switchBtn: Boolean = false;
        this.quoteSource.forEach((res: any) => {
          if (!res.code || !res.relativeCode) {
            switchBtn = true;
            return;
          }
        });
        if (switchBtn) {
          that.$message.info('字段引用信息需填写完整', 2);
          return;
        }
      }

      //关联表单字段引用信息
      if (
        (info.propertyType === DataItemType.RelevanceForm ||
          info.propertyType === DataItemType.RelevanceFormEx) &&
        this.quoteSource.length > 0
      ) {
        this.quoteSource.forEach((res: any) => {
          const source: any = this.currentModelDataItems.find(
            (c: any) => c.code === res.code,
          );
          if (source) {
            res.schemaCode = source.schemaCode;
            res.propertyType = source.propertyType;
          }
          const relativeSource: any = this.relativeModelDataItems.find(
            (c: any) => c.code === res.relativeCode,
          );
          if (relativeSource) {
            res.relativeSchemaCode = relativeSource.schemaCode;
            res.relativePropertyType = relativeSource.propertyType;
          }
        });
        info.relativeQuoteCode = JSON.stringify(this.quoteSource);
      }

      //把bizSchemaCode重置为当前模型的SchemaCode
      this.setBizSchemaCodeX(this.bizSchemaCode);

      // 是否关闭drawer

      if (this.editMode === 'edit') {
        // 业务字段多语言处理
        const obj: any = LanguageTransform.setLang(info.name, info.name_i18n);
        const saveData: any = Object.assign({}, info, obj);

        this.schemaSource.forEach((res: any, index: number) => {
          const schemaObj: any = LanguageTransform.setLang(
            res.name,
            res.name_i18n,
          );
          this.schemaSource[index] = Object.assign({}, res, schemaObj);
        });
        if (mappingArr.length > 0) {
          const params: bizproperty.CheckSheetMappingParam = {
            schemaCode: saveData.schemaCode,
            relativeCode: saveData.relativeCode,
            mappings: mappingArr,
          };
          bizpropertyApi.checkSheetMapping(params).then((res: any) => {
            if (res.errcode === 0) {
              this.updateDataItems({
                ...saveData,
                subSchema: {
                  properties: this.schemaSource,
                },
              }).then((res: any) => {
                if (res.errcode !== 0) {
                  this.$message.warning(res.errmsg);
                  return;
                } else {
                  this.$message.success('保存成功');
                }
                Bus.$emit('isAddContinue', this.saveFlag);
                this.getDataItemListX().then(() => {
                  // 新增数据项成功后，将列表刷新
                  this.setFilterDataItemList(this.keyWords);
                  /* 保存并新增后，重置表单，保留数据型的数据 */
                  if (this.saveFlag) {
                    this.form.resetFields();
                    this.postInfo.relativeCode = '';
                    const type = this.dataType;
                    this.dataType = '';
                    this.repeated = false;
                    this.$nextTick(() => {
                      this.handleSelectChange(type);
                    });
                  }
                });
              });
            } else {
              this.$message.error(res.errmsg as string);
            }
          });
        } else {
          this.updateDataItems({
            ...saveData,
            subSchema: {
              properties: this.schemaSource,
            },
          }).then((res: any) => {
            if (res.errcode !== 0) {
              this.$message.warning(res.errmsg);
              return;
            } else {
              this.$message.success('保存成功');
            }
            Bus.$emit('isAddContinue', this.saveFlag);
            this.getDataItemListX().then(() => {
              // 新增数据项成功后，将列表刷新
              this.setFilterDataItemList(this.keyWords);
              /* 保存并新增后，重置表单，保留数据型的数据 */
              if (this.saveFlag) {
                this.form.resetFields();
                this.postInfo.relativeCode = '';
                const type = this.dataType;
                this.dataType = '';
                this.repeated = false;
                this.$nextTick(() => {
                  this.handleSelectChange(type);
                });
              }
            });
          });
        }
      } else {
        // 业务字段多语言处理
        const obj: any = LanguageTransform.setLang(info.name, info.name_i18n);
        const saveData: any = Object.assign({}, info, obj);

        this.schemaSource.forEach((res: any, index: number) => {
          const schemaObj: any = LanguageTransform.setLang(
            res.name,
            res.name_i18n,
          );
          this.schemaSource[index] = Object.assign({}, res, schemaObj);
        });

        if (mappingArr.length > 0) {
          const params: bizproperty.CheckSheetMappingParam = {
            schemaCode: saveData.schemaCode,
            relativeCode: saveData.relativeCode,
            mappings: mappingArr,
          };
          bizpropertyApi.checkSheetMapping(params).then((res: any) => {
            if (res.errcode === 0) {
              this.postDataItem({
                ...saveData,
                subSchema: {
                  properties: this.schemaSource,
                },
              }).then((res: any) => {
                if (res.errcode !== 0) {
                  this.$message.warning(res.errmsg);
                  return;
                }
                this.$message.success(res.errmsg);
                Bus.$emit('isAddContinue', this.saveFlag);
                this.getDataItemListX().then(() => {
                  // 新增数据项成功后，将列表刷新
                  this.setFilterDataItemList(this.keyWords);

                  /* 保存并新增后，重置表单，保留数据型的数据 */
                  if (this.saveFlag) {
                    this.form.resetFields();
                    this.postInfo.relativeCode = '';
                    const type = this.dataType;
                    this.dataType = '';
                    this.repeated = false;
                    this.schemaSource = [];
                    this.$nextTick(() => {
                      this.handleSelectChange(type);
                    });
                  }
                  // 等待表格渲染完成 滚动到页面底部
                  this.$nextTick(() => {
                    const schemaEl: any = document.getElementById('dataitem');
                    const aTable: any =
                      schemaEl.getElementsByClassName('ant-table-body')[0];
                    aTable.scrollTop = aTable.scrollHeight;
                  });
                });
              });
            } else {
              this.$message.error(res.errmsg as string);
            }
          });
        } else {
          this.postDataItem({
            ...saveData,
            subSchema: {
              properties: this.schemaSource,
            },
          }).then((res: any) => {
            if (res.errcode !== 0) {
              this.$message.warning(res.errmsg);
              return;
            }
            this.$message.success(res.errmsg);
            Bus.$emit('isAddContinue', this.saveFlag);
            this.getDataItemListX().then(() => {
              // 新增数据项成功后，将列表刷新
              this.setFilterDataItemList(this.keyWords);

              /* 保存并新增后，重置表单，保留数据型的数据 */
              if (this.saveFlag) {
                this.form.resetFields();
                this.postInfo.relativeCode = '';
                const type = this.dataType;
                this.dataType = '';
                this.repeated = false;
                this.schemaSource = [];
                this.$nextTick(() => {
                  this.handleSelectChange(type);
                });
              }
              // 等待表格渲染完成 滚动到页面底部
              this.$nextTick(() => {
                const schemaEl: any = document.getElementById('dataitem');
                const aTable: any =
                  schemaEl.getElementsByClassName('ant-table-body')[0];
                aTable.scrollTop = aTable.scrollHeight;
              });
            });
          });
        }
      }
    });
  }

  // 显示字段改变事件
  displayChange(val) {
    this.$set(this.postInfo, 'relativePropertyCode', val);
    this.$forceUpdate();
  }

  //清除数据限定范围的空值
  modelAllClearEmpty(model) {
    let modelArr: any[] = model.map((item) => {
      if (
        item &&
        Array.isArray(item.conditions) &&
        item.conditions.length === 0
      ) {
        return null;
      } else {
        return item;
      }
    });
    modelArr = modelArr.filter((item) => {
      return item !== null;
    });
    return modelArr;
  }

  addOrConditions() {
    if (
      this.rangeModelAll.length === 0 ||
      this.rangeModelAll[this.rangeModelAll.length - 1].conditions.length > 0
    ) {
      this.rangeModelAll.push({
        conditions: [],
        type: 1,
      });
    } else {
      this.$message.error('请将空的条件组填写完整再进行添加');
    }
  }

  deleteOrConditions(index) {
    console.log(index);
    this.rangeModelAll.splice(index, 1);
  }

  //获取当前模型全部数据项
  async getCurrentDataItem(code: string) {
    const { errcode, data, errmsg } = await AppsApi.getQuoteDataItemList({
      schemaCode: code,
    });
    if (errcode === 0) {
      this.currentModelDataItems = data.bizProperties
        .filter(
          (res: any) =>
            res.code !== this.bizPropertyCode && !res.defaultProperty,
        )
        .concat(data.quotes[this.bizPropertyCode] || []);
      //当为编辑状态时获取关联表单的全部数据项
      if (this.editMode === 'edit' && this.postInfo.relativeCode) {
        this.getRelativeDataItem(this.postInfo.relativeCode);
      }
    } else {
      this.$message.error(errmsg as string);
    }
  }

  //获取关联表单模型数据项
  async getRelativeDataItem(code: string) {
    const { errcode, data, errmsg } = await AppsApi.getDataItemList({
      schemaCode: code,
      isPublish: true,
    });
    if (errcode === 0) {
      this.relativeModelDataItems = data;
      const map = (x: any) => ({
        code: x.propertyCode || x.code,
        type: x.propertyType,
        name: x.name,
        relativeCode: x.relativeCode || x.relativeSchemaCode,
        isSystem: x.defaultProperty,
        published: x.published,
      });
      const formatItems: any = this.relativeModelDataItems.map(map);
      this.querySource.items = formatItems;
      if (this.editMode === 'edit') {
        // 过滤数据
        this.quoteSource.forEach((res: any) => {
          const source: any = this.currentModelDataItems.find(
            (c: any) => c.code === res.code,
          );
          if (!source) {
            res = undefined;
          }
          const relativeSource: any = this.relativeModelDataItems.find(
            (c: any) => c.code === res.relativeCode,
          );
          if (!relativeSource) {
            res.relativeCode = '';
          }
        });
        this.quoteSource = this.quoteSource.filter((res) => res);
      }
    } else {
      this.$message.error(errmsg as string);
    }
  }

  get getCurrentModelDataItems() {
    const arr: any = [];
    this.quoteSource.forEach((q: any) => {
      arr.push(q.code);
    });
    return this.currentModelDataItems.filter((c: any) => {
      if (arr.includes(c.code)) {
        c.disabled = true;
      } else {
        c.disabled = false;
      }
      return c;
    });
  }

  handleCurrentModalChange(val: string, row: any) {
    row.relativeCode = '';
  }

  //获取筛选的关联表单的数据项
  getRelativeDataItemList(code: string) {
    if (!code) {
      return;
    }
    const source: any = this.currentModelDataItems.find(
      (res: any) => res.code === code,
    );
    if (!source) {
      return [];
    }
    switch (source.propertyType) {
      case DataItemType.RelevanceForm:
        return this.relativeModelDataItems.filter(
          (res: any) =>
            res.propertyType === source.propertyType &&
            source.relativeCode === res.relativeCode,
        );
      default:
        return this.relativeModelDataItems.filter(
          (res: any) => res.propertyType === source.propertyType,
        );
    }
  }

  //新增引用
  onQuoteRowAdd() {
    const newRow: any = {
      code: '', //当前模型数据项
      propertyType: '', //当前数据项类型
      schemaCode: '',
      relativeCode: '', //关联表单模型数据项
      relativePropertyType: '', //关联表单数据项类型
      relativeSchemaCode: '',
      relativePropertyCode: this.bizPropertyCode,
    };
    this.quoteSource.push(newRow);
  }

  //删除引用数据项
  deleDataItem(index: number) {
    this.quoteSource.splice(index, 1);
  }

  toggleUpDown(type: number) {
    if (type === 1) {
      this.isUserMapUpDown = !this.isUserMapUpDown;
    } else if (type === 2) {
      this.isRelevantMapUpDown = !this.isRelevantMapUpDown;
    } else if (type === 3) {
      this.isDataLinkUpDown = !this.isDataLinkUpDown;
    } else if (type === 4) {
      this.isRangeUpDown = !this.isRangeUpDown;
    } else if (type === 5) {
      this.isConditionUpDown = !this.isConditionUpDown;
    } else if (type === 6) {
      this.isBizOptionDataDown = !this.isBizOptionDataDown;
    } else if (type === 7) {
      this.isUseDataDictionaryDown = !this.isUseDataDictionaryDown;
    } else {
      //Else Empty block statement
    }
  }

  handleQueryValue(value: string) {
    value.split(';').forEach((s: string) => {
      const idx = s.indexOf(':');
      const sourceCode = s.substring(0, idx);
      let targetCode = s.substr(idx + 1);
      const sourceItem = this.query.find((q) => q.source.code === sourceCode);
      if (!sourceItem) {
        return;
      }

      if (targetCode[0] === '{' && !targetCode.includes(':')) {
        targetCode = targetCode.substring(1, targetCode.length - 1);
        const targetItem = this.target.items.find((i) => {
          if (targetCode.indexOf('.') > -1) {
            return `${i.parentCode}.${i.code}` === targetCode;
          } else {
            return i.code === targetCode;
          }
        });
        if (!targetItem) {
          return;
        }
        const newtargetItem = JSON.parse(JSON.stringify(targetItem));
        if (newtargetItem.parentCode) {
          newtargetItem.code = `${newtargetItem.parentCode}.${newtargetItem.code}`;
        }
        sourceItem.target = JSON.parse(JSON.stringify(newtargetItem));
      } else {
        sourceItem.isConst = true;
        try {
          targetCode = JSON.parse(targetCode); //该值可能是一个选人控件对应的json字符，尝试解析；
        } catch (e) {}
        (sourceItem as any).target = targetCode;
        if (
          sourceItem.source.type === DataItemType.Date &&
          !Array.isArray(sourceItem.target) &&
          typeof sourceItem.target === 'number'
        ) {
          sourceItem.isConst = false;
        }
      }

      const options = this.ops;
      // 增加查询条件操作符回显
      const opOption =
        options &&
        options.find((el) => el.propertyCode === sourceItem.source.code);
      if (opOption) {
        sourceItem.op = opOption.op || 'eq';
        sourceItem.num = opOption.num;
      } else {
        sourceItem.op = 'eq';
      }
      this.queryDatas.push(JSON.parse(JSON.stringify(sourceItem)));
    });
  }

  onRelevantOpenChange(checked: boolean, event: any) {
    const self = this;
    if (!this.postInfo.relativeCode) {
      this.$message.error('请先选择业务模型');
      this.isRelevantMappingOpen = false;
    }
  }

  @Watch('isUseDataDictionary', {
    immediate: true,
  })
  onIsUseDataDictionaryChange(val) {
    if (val) {
      this.isUseDataDictionaryDown = true;
    } else {
      this.isUseDataDictionaryDown = false;
    }
  }

  changeUserMapping(checked: boolean, event: any) {
    const self = this;
    if (!this.isUserMappingOpen) {
      this.$confirm({
        title: '人员映射',
        content: '关闭映射会清空当前的映射数据, 是否继续?',
        okText: '确认关闭',
        cancelText: '取消',
        onOk() {
          const userSelectMapRef = self.$refs.userSelectMapRef;
          if (userSelectMapRef) {
            (userSelectMapRef as any).clearMapping();
          }
          self.isUserMappingOpen = false;
          self.selectMappingData = '';
        },
        onCancel() {
          self.isUserMappingOpen = true;
        },
      });
      this.isUserMappingOpen = true;
    }
  }

  @Watch('isUserMappingOpen', {
    immediate: true,
  })
  onIsUserMappingOpenChange(val) {
    if (val) {
      this.isUserMapUpDown = true;
    } else {
      this.isUserMapUpDown = false;
    }
  }

  @Watch('isRelevantMappingOpen', {
    immediate: true,
  })
  onIsRelevantMappingChange(val) {
    if (val) {
      this.isRelevantMapUpDown = true;
    } else {
      this.isRelevantMapUpDown = false;
    }
  }

  @Watch('querySource', {
    deep: true,
  })
  onQuerySourceChange(v: any) {
    this.query = this.querySource.items.map(
      (x) =>
        ({
          source: x,
          isConst: false,
          target: {},
          op: 'eq',
        } as any),
    );

    const options: any = '';
    this.handleQueryValue(this.optionConditions);
  }

  schemaSource: any[] = [];

  count: number = 1;

  columns: any[] = []; // 表格头渲染数据

  dataItemTypeList: any[] = []; // 数据项类型列表

  schemaCodeTypeList: any[] = []; // 子表数据项类型列表
}
</script>

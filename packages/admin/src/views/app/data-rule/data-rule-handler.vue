<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-rule-handler">
    <div class="step-wrap">
      <div ref="scrollArea" class="step">
        <a-steps :current="curStep">
          <a-step>
            <span slot="title" class="step-title">设置触发动作</span>
          </a-step>
          <a-step>
            <span slot="title" class="step-title">设置执行动作</span>
          </a-step>
        </a-steps>
      </div>
      <!-- 步骤1 -->
      <div v-show="curStep === 0" class="handler-box">
        <div class="handler-item">
          <div class="pull-left"><span class="required">*</span>规则名称</div>
          <div class="pull-right">
            <a-tooltip :visible="isShowErrRuleName">
              <template slot="title">
                {{ validateStr }}
              </template>
              <div
                :class="isShowErrRuleName ? 'input-box has-error' : 'input-box'"
              >
                <a-input
                  v-model="ruleName"
                  placeholder="请输入"
                  class="w_310"
                  maxlength="50"
                  @change="onRuleNameChange"
                  @blur="isShowErrRuleName = false"
                />
              </div>
            </a-tooltip>
          </div>
        </div>

        <div class="handler-item">
          <div class="pull-left"><span class="required">*</span>触发对象</div>
          <div class="pull-right">
            <a-select
              v-model="triggerObj"
              style="width: 310px"
              placeholder="请选择"
              :class="!triggerObj ? 'show-placeholder' : ''"
              :getPopupContainer="getPopupContainer"
              :disabled="mode === 'edit'"
              @change="selectTriggerObj"
            >
              <!-- :disabled="mode === 'edit'" -->
              <a-select-option
                v-for="(item, index) in triggerObjLists"
                :key="index"
                :value="item.code"
                :propertyType="item.propertyType"
              >
                {{ setTriggerObjOptionVal(item) }}
                <!-- {{ `${item.propertyType === 8 ? '子表' : '模型'}-${item.name}[${item.code}]` }} -->
              </a-select-option>
            </a-select>
          </div>
        </div>

        <div class="handler-item">
          <div class="pull-left v-top">触发条件</div>
          <div class="pull-right">
            <div class="trigger-box">
              <div
                v-for="(item, index) in triggerConditionList"
                :key="index"
                class="trigger-block"
                :class="item.isSelected ? 'selected' : ''"
                @click="selectTriggerCondition(index)"
              >
                <h3>{{ item.name }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="filter-conditions">
          <div class="filter-conditions-top">
            <div class="filter-conditions-top-left">
              <template>
                <span>数据条件</span>
                <span>满足条件的数据触发执行动作</span>
              </template>
            </div>
            <div class="filter-conditions-top-right">
              <a-select
                v-model="dataConditionJoinType"
                style="width: 310px"
                :getPopupContainer="getPopupContainer"
              >
                <a-select-option
                  v-for="(item, index) in dataConditionList"
                  :key="index"
                  :value="item.index"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div v-if="dataConditionJoinType !== 1" class="table-box">
            <template>
              <a-table
                :columns="dataConditionColumns"
                :dataSource="dataConditionData"
                :pagination="false"
                size="small"
              >
                <!-- 数据字段 -->
                <template slot="dataItem" slot-scope="text, record">
                  <div class="item-box">
                    <data-item-select
                      v-model="record.dataItem.val"
                      :list="record.dataItem.list"
                      :systemFilterCtl="{
                        code: [
                          'id',
                          'sortKey',
                          'modifier',
                          'workflowInstanceId',
                          'ownerDeptQueryCode',
                          `${triggerVal}.id`,
                          `${triggerVal}.sortKey`,
                          'parentId',
                          `${triggerVal}.parentId`,
                        ],
                      }"
                      :bizFilterCtl="{
                        type: [6, 7, 8, 9, 10],
                      }"
                      :getPopupContainer="getPopupContainer"
                      @change="onDataItemChange(record)"
                    />
                  </div>
                </template>

                <!-- 过滤条件 -->
                <template slot="filterCondition" slot-scope="text, record">
                  <div class="item-box">
                    <a-select
                      v-model="record.filterCondition.val"
                      style="width: 100px"
                      placeholder="请选择"
                      :class="
                        !record.filterCondition.val ? 'show-placeholder' : ''
                      "
                      :getPopupContainer="getPopupContainer"
                      @change="onFilterConditionChange"
                    >
                      <a-select-option
                        v-for="(item, index) in record.filterCondition.list"
                        :key="index"
                        :value="item.index"
                        :index="record.filterCondition.index"
                      >
                        {{ item.name }}
                      </a-select-option>
                    </a-select>
                  </div>
                </template>

                <!-- 值 -->
                <template slot="value" slot-scope="text, record">
                  <div class="item-box">
                    <div v-if="record.value.display === 1">
                      <a-input
                        v-model="record.value.val"
                        style="width: 180px"
                        placeholder="请输入"
                      />
                    </div>
                    <!-- 日期 需要校验 -->
                    <div v-if="record.value.display === 2">
                      <a-tooltip :visible="!!record.value.errMsg">
                        <template slot="title">
                          <span v-html="record.value.errMsg"></span>
                        </template>
                        <div
                          :class="
                            record.value.errMsg
                              ? 'input-box has-error'
                              : 'input-box'
                          "
                        >
                          <a-input
                            v-model="record.value.val"
                            style="width: 180px"
                            placeholder="支持日期格式: 2019-05-10 08:00"
                            @blur="checkDate(record.value)"
                          />
                        </div>
                      </a-tooltip>
                    </div>

                    <div v-if="record.value.display === 3">
                      <a-input
                        v-model="record.value.val"
                        type="number"
                        style="width: 180px"
                        placeholder="请输入"
                      />
                    </div>

                    <div v-if="record.value.display === 4">
                      <div style="width: 180px"></div>
                    </div>

                    <div v-if="record.value.display === 4">
                      <div style="width: 180px"></div>
                    </div>

                    <div v-if="record.value.display === 5" style="width: 180px">
                      <a-select
                        v-model="record.value.val"
                        style="width: 180px"
                        :getPopupContainer="getPopupContainer"
                      >
                        <a-select-option value="true"> true </a-select-option>
                        <a-select-option value="false"> false </a-select-option>
                      </a-select>
                    </div>

                    <div
                      v-if="record.value.display === 6"
                      style="width: 180px; background: white !important"
                    >
                      <StaffSelector
                        v-model="record.value.val"
                        class="workflow-name-input"
                        :options="staffSelectorOpts"
                      />
                    </div>

                    <div v-if="record.value.display === 7" style="width: 180px">
                      <a-select
                        v-model="record.value.val"
                        style="width: 180px"
                        :getPopupContainer="getPopupContainer"
                      >
                        <a-select-option value="PROCESSING">
                          进行中
                        </a-select-option>
                        <a-select-option value="COMPLETED">
                          已完成
                        </a-select-option>
                        <!-- <a-select-option value="CANCELLED">已作废</a-select-option> -->
                      </a-select>
                    </div>
                  </div>
                </template>

                <!-- 操作 -->
                <template slot="operation" slot-scope="operation">
                  <span class="delete-btn">
                    <i
                      class="icon aufontAll h-icon-all-delete-o"
                      @click="deleteDataConditionItem(operation)"
                    ></i>
                  </span>
                </template>
              </a-table>
            </template>
            <div
              ref="addDataConditionBtn"
              class="add-row"
              @click="addDataCondition"
            >
              <i class="icon aufontAll h-icon-all-plus-o"></i> 新增查询条件
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤2 -->
      <div v-show="curStep === 1" class="handler-box">
        <div class="handler-item">
          <div class="pull-left"><span class="required">*</span>目标模型</div>
          <div class="pull-right">
            <div v-if="isShowModelTree" class="model-tree">
              <!--  -->
              <BizModelsSelect
                :style="`width:310px`"
                :value="targetModel"
                :appCode="appCode"
                :getPopupContainer="getPopupContainer"
                @select="
                  (data, theModel) => {
                    selectModel(data, theModel);
                    clearTargetTableCode();
                  }
                "
              />
              <!-- <ModelTree
                @select="(data) => { selectModel(data); clearTargetTableCode()}"
                :width="310"
                :treeValue="targetModel"
                :appCode="appCode"
                :isWriteBack="isWriteBack"
                :getPopupContainer="getPopupContainer"
              /> -->
            </div>
          </div>
        </div>
        <div v-if="isMain" class="handler-item">
          <div class="pull-left"><span class="required">*</span>更新对象</div>
          <div class="pull-right">
            <a-select
              v-model="targetTableCode"
              style="width: 310px"
              placeholder="请选择"
              :disabled="targetModel === ''"
              :class="!triggerObj ? 'show-placeholder' : ''"
              :getPopupContainer="getPopupContainer"
              @change="targetTableChange"
            >
              <a-select-option
                v-for="(item, index) in upDateObjLists"
                :key="index"
                :value="item.code"
                :propertyType="item.propertyType"
              >
                {{
                  `${item.propertyType === 8 ? '子表' : '模型'}-${item.name}[${
                    item.code
                  }]`
                }}
              </a-select-option>
            </a-select>
          </div>
        </div>

        <div class="handler-item"></div>

        <div class="handler-item mb-0">
          <div class="pull-left v-top">
            触发动作
            <a-tooltip placement="right">
              <template slot="title">
                <span>达到触发条件后，将做数据操作的动作，在设定具体操作规则前需要选择触发动作类型</span>
              </template>
              <i class="icon aufontAll h-icon-all-question-circle-o"></i>
            </a-tooltip>
          </div>
          <div class="pull-right">
            <div class="trigger-box">
              <div
                v-for="(item, index) in triggerActionList"
                :key="index"
                class="trigger-block"
                :class="item.isSelected ? 'selected' : ''"
                @click="selectTriggerAction(index)"
              >
                <h3>{{ item.name }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 新增过滤条件 -->
        <div class="filter-conditions">
          <div class="filter-conditions-top">
            <div class="filter-conditions-top-left">
              <template>
                <span>{{ filterConditionText }}</span>
                <span>{{ filterConditionTooltip }}</span>
              </template>
            </div>
            <div class="filter-conditions-top-right">
              <a-select
                v-model="searchCondition"
                :getPopupContainer="getPopupContainer"
                style="width: 310px"
              >
                <a-select-option
                  v-for="(item, index) in conditionJoinTypes"
                  :key="index"
                  :value="item.index"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="table-box tabel-color">
            <h3-panel
              :title="'主表条件'"
              :tips="'查找符合条件的主表数据'"
              :collapsible="true"
            >
              <template>
                <a-table
                  :columns="filterColumns"
                  :dataSource="filterData"
                  :pagination="false"
                  size="small"
                >
                  <!-- 目标数据字段 -->
                  <template slot="targetField" slot-scope="text, record">
                    <div class="item-box">
                      <data-item-select
                        v-model="record.targetField.val"
                        :list="record.targetField.list"
                        :systemFilterCtl="{
                          code: [
                            'workflowInstanceId',
                            'sequenceNo',
                            'sequenceNo',
                            'modifier',
                            'ownerDeptQueryCode',
                            'sortKey',
                            `${triggerVal}.sortKey`,
                          ],
                        }"
                        :bizFilterCtl="{
                          type: [10, 8, 6, 7],
                        }"
                        :disabled="!targetModel"
                        :getPopupContainer="getPopupContainer"
                        @change="
                          (val) => {
                            dataItemChange(val, record, 1);
                          }
                        "
                      />
                    </div>
                  </template>

                  <!-- 操作符 -->
                  <!-- @change="onOperatorChange" -->
                  <span slot="operatorTitle" class="hide-thead">操作符</span>
                  <template slot="operator" slot-scope="text, record">
                    <div class="item-box">
                      <a-select
                        v-model="record.operator.val"
                        style="width: 100px"
                        placeholder="请选择"
                        :class="!record.operator.val ? 'show-placeholder' : ''"
                        :getPopupContainer="getPopupContainer"
                        @change="operatorChange(record)"
                      >
                        <a-select-option
                          v-for="(item, index) in record.operator.list"
                          :key="index"
                          :value="item.index"
                          :disabled="item.disabled"
                          :index="record.operator.index"
                          data-type="filter"
                        >
                          {{ item.name }}
                        </a-select-option>
                      </a-select>
                    </div>
                  </template>

                  <!-- 值 -->
                  <template slot="value" slot-scope="text, record">
                    <div class="item-box">
                      <a-select
                        v-model="record.value.val"
                        style="width: 100px"
                        placeholder="请选择"
                        :class="!record.value.val ? 'show-placeholder' : ''"
                        :getPopupContainer="getPopupContainer"
                        @change="valueSelectChange(record)"
                      >
                        <a-select-option
                          v-for="(item, index) in record.value.list"
                          :key="index"
                          :value="item.index"
                          :index="record.value.index"
                          :disabled="item.disabled"
                          data-type="filter"
                        >
                          {{ item.name }}
                        </a-select-option>
                      </a-select>
                    </div>
                  </template>

                  <!-- 当前模型字段 -->
                  <template slot="currentField" slot-scope="text, record">
                    <!-- 动态值 -->
                    <div class="item-box">
                      <data-item-select
                        v-show="record.value.val === 1"
                        v-model="record.currentField.val"
                        :list="record.currentField.list"
                        :systemFilterCtl="{
                          code: [
                            'workflowInstanceId',
                            'sequenceNo',
                            'sequenceNo',
                            'name',
                            'ownerDeptQueryCode',
                            'sortKey',
                            `${triggerVal}.sortKey`,
                          ],
                        }"
                        :bizFilterCtl="{
                          type: [10, 8, 6, 7],
                        }"
                        :disabled="record.targetField.val === ''"
                        :getPopupContainer="getPopupContainer"
                      />

                      <!-- 固定值 -->
                      <a-input
                        v-show="
                          record.value.val === 2 &&
                          !getLogicType(record.targetField)
                        "
                        v-model="record.currentField.val"
                        style="width: 240px"
                        :placeholder="
                          getDateType(record.targetField)
                            ? '日期格式2019-05-10 12:00:00'
                            : '请输入'
                        "
                        :disabled="record.targetField.val === ''"
                      />
                      <!-- 为空 -->
                      <div
                        v-show="
                          record.value.val === 3 || record.value.val === ''
                        "
                        style="width: 240px"
                      ></div>

                      <!-- 逻辑时下拉 -->
                      <div
                        v-show="
                          record.value.val === 2 &&
                          getLogicType(record.targetField)
                        "
                        style="width: 240px"
                      >
                        <a-select
                          v-model="record.currentField.val"
                          :disabled="record.targetField.val === ''"
                          style="width: 240px"
                          :getPopupContainer="getPopupContainer"
                        >
                          <a-select-option value="true"> true </a-select-option>
                          <a-select-option value="false">
                            false
                          </a-select-option>
                        </a-select>
                      </div>
                    </div>
                  </template>

                  <!-- 操作 -->
                  <template slot="operation" slot-scope="operation">
                    <span class="delete-btn">
                      <i
                        class="icon aufontAll h-icon-all-delete-o"
                        @click="deleteFilterItem(operation)"
                      ></i>
                    </span>
                  </template>
                </a-table>
              </template>
              <div
                ref="addFilterConditionBtn"
                class="add-row"
                @click="addFilterCondition(false)"
              >
                <i class="icon aufontAll h-icon-all-plus-o"></i> 新增查询条件
              </div>
            </h3-panel>

            <h3-panel
              v-if="UpDateObjIsSheet && isMain"
              :title="'子表条件'"
              :tips="'查找符合条件的子表数据'"
              :collapsible="true"
            >
              <template>
                <a-table
                  :columns="filterColumns"
                  :dataSource="ruleScopeChild"
                  :pagination="false"
                  size="small"
                >
                  <!-- 目标数据字段 -->
                  <template slot="targetField" slot-scope="text, record">
                    <div class="item-box">
                      <data-item-select
                        v-model="record.targetField.val"
                        :list="record.targetField.list"
                        :systemFilterCtl="{
                          code: [
                            'workflowInstanceId',
                            'sequenceNo',
                            'sequenceNo',
                            'name',
                            'ownerDeptQueryCode',
                            'sortKey',
                            `${triggerVal}.sortKey`,
                          ],
                        }"
                        :bizFilterCtl="{
                          type: [10, 8, 6, 7],
                        }"
                        :disabled="!targetModel"
                        :getPopupContainer="getPopupContainer"
                        @change="
                          (val) => {
                            dataItemChange(val, record, 2);
                          }
                        "
                      />
                    </div>
                  </template>

                  <!-- 操作符 -->
                  <span slot="operatorTitle" class="hide-thead">操作符</span>
                  <template slot="operator" slot-scope="text, record">
                    <div class="item-box">
                      <a-select
                        v-model="record.operator.val"
                        style="width: 100px"
                        placeholder="请选择"
                        :class="!record.operator.val ? 'show-placeholder' : ''"
                        :getPopupContainer="getPopupContainer"
                        @change="operatorChange(record)"
                      >
                        <a-select-option
                          v-for="(item, index) in record.operator.list"
                          :key="index"
                          :value="item.index"
                          :disabled="item.disabled"
                          :index="record.operator.index"
                          data-type="filter"
                        >
                          {{ item.name }}
                        </a-select-option>
                      </a-select>
                    </div>
                  </template>

                  <!-- 值 -->
                  <template slot="value" slot-scope="text, record">
                    <div class="item-box">
                      <a-select
                        v-model="record.value.val"
                        style="width: 100px"
                        placeholder="请选择"
                        :class="!record.value.val ? 'show-placeholder' : ''"
                        :getPopupContainer="getPopupContainer"
                        @change="valueSelectChange(record)"
                      >
                        <a-select-option
                          v-for="(item, index) in record.value.list"
                          :key="index"
                          :value="item.index"
                          :index="record.value.index"
                          :disabled="item.disabled"
                          data-type="filter"
                        >
                          {{ item.name }}
                        </a-select-option>
                      </a-select>
                    </div>
                  </template>

                  <!-- 当前模型字段 -->
                  <template slot="currentField" slot-scope="text, record">
                    <!-- 动态值 -->
                    <div class="item-box">
                      <data-item-select
                        v-show="record.value.val === 1"
                        v-model="record.currentField.val"
                        :list="record.currentField.list"
                        :systemFilterCtl="{
                          code: [
                            'workflowInstanceId',
                            'sequenceNo',
                            'sequenceNo',
                            'name',
                            'ownerDeptQueryCode',
                            'sortKey',
                            `${triggerVal}.sortKey`,
                          ],
                        }"
                        :bizFilterCtl="{
                          type: [10, 8, 6, 7],
                        }"
                        :disabled="record.targetField.val === ''"
                        :getPopupContainer="getPopupContainer"
                      />
                      <!-- 固定值 -->
                      <a-input
                        v-show="
                          record.value.val === 2 &&
                          !getLogicType(record.targetField)
                        "
                        v-model="record.currentField.val"
                        style="width: 240px"
                        :disabled="record.targetField.val === ''"
                        :placeholder="
                          getDateType(record.targetField)
                            ? '日期格式2019-05-10 12:00:00'
                            : '请输入'
                        "
                      />
                      <!-- 为空 -->
                      <div
                        v-show="
                          record.value.val === 3 || record.value.val === ''
                        "
                        style="width: 240px"
                      ></div>

                      <!-- 逻辑时下拉 -->
                      <div
                        v-show="
                          record.value.val === 2 &&
                          getLogicType(record.targetField)
                        "
                        style="width: 240px"
                      >
                        <a-select
                          v-model="record.currentField.val"
                          :disabled="record.targetField.val === ''"
                          style="width: 240px"
                          :getPopupContainer="getPopupContainer"
                        >
                          <a-select-option value="true"> true </a-select-option>
                          <a-select-option value="false">
                            false
                          </a-select-option>
                        </a-select>
                      </div>
                    </div>
                  </template>

                  <!-- 操作 -->
                  <template slot="operation" slot-scope="operation">
                    <span class="delete-btn">
                      <i
                        class="icon aufontAll h-icon-all-delete-o"
                        @click="deleteRuleScopeChild(operation)"
                      ></i>
                    </span>
                  </template>
                </a-table>
              </template>
              <div
                ref="addFilterConditionBtn"
                class="add-row"
                @click="addSheetCondition"
              >
                <i class="icon aufontAll h-icon-all-plus-o"></i> 新增查询条件
              </div>
            </h3-panel>
          </div>
        </div>

        <!-- 新增数据动作 -->
        <div v-show="triggerAction !== 3" class="filter-conditions">
          <div class="filter-conditions-top">
            <div class="filter-conditions-top-left">
              <span>{{ dataActionText }}</span>
              <span></span>
            </div>
            <div class="filter-conditions-top-right"></div>
          </div>
          <div class="table-box tabel-color">
            <h3-panel
              v-if="UpDateObjIsSheet && isShowActionSysDataItems && isMain"
              :title="'查找主表'"
              :tips="'新增子表数据需关联主表数据，请设置条件查询需关联在主表数据；若查出多条，每条数据下都新增子表数据'"
              :collapsible="true"
            >
              <div class="filter-select-wrap">
                <a-select
                  v-model="insertConditionJoinType"
                  class="filter-select"
                  style="width: 310px"
                  :getPopupContainer="getPopupContainer"
                >
                  <a-select-option
                    v-for="(item, index) in conditionJoinTypes"
                    :key="index"
                    :value="item.index"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </div>
              <!-- :columns="dataActionColumns"
                  :dataSource="ruleActionMainScope"
                  :pagination="false"
              size="small"-->
              <template>
                <a-table
                  :columns="dataActionColumns"
                  :dataSource="ruleActionMainScope"
                  :pagination="false"
                  size="small"
                >
                  <!-- 目标数据字段 -->
                  <template slot="targetField" slot-scope="text, record">
                    <div class="item-box">
                      <data-item-select
                        v-model="record.targetField.val"
                        :list="record.targetField.list"
                        :systemFilterCtl="{
                          code: [
                            'workflowInstanceId',
                            'sequenceNo',
                            'sequenceNo',
                            'name',
                            'ownerDeptQueryCode',
                            'sortKey',
                            `${triggerVal}.sortKey`,
                          ],
                        }"
                        :bizFilterCtl="{
                          type: [10, 8, 6, 7],
                        }"
                        :disabled="!targetModel"
                        :getPopupContainer="getPopupContainer"
                        @change="
                          (val) => {
                            dataItemChange(val, record, 3);
                          }
                        "
                      />
                    </div>
                  </template>

                  <!-- 操作符 -->
                  <span slot="operatorTitle" class="hide-thead">操作符</span>
                  <template slot="operator" slot-scope="text, record">
                    <div class="item-box">
                      <a-select
                        v-model="record.operator.val"
                        style="width: 100px"
                        placeholder="请选择"
                        :class="!record.operator.val ? 'show-placeholder' : ''"
                        :getPopupContainer="getPopupContainer"
                        @change="operatorChange(record)"
                      >
                        <a-select-option
                          v-for="(item, index) in record.operator.list"
                          :key="index"
                          :value="item.index"
                          :disabled="item.disabled"
                          :index="record.operator.index"
                          data-type="filter"
                        >
                          {{ item.name }}
                        </a-select-option>
                      </a-select>
                    </div>
                  </template>

                  <!-- 值 -->
                  <template slot="value" slot-scope="text, record">
                    <div class="item-box">
                      <a-select
                        v-model="record.value.val"
                        style="width: 100px"
                        placeholder="请选择"
                        :class="!record.value.val ? 'show-placeholder' : ''"
                        :getPopupContainer="getPopupContainer"
                        @change="valueSelectChange(record)"
                      >
                        <a-select-option
                          v-for="(item, index) in record.value.list"
                          :key="index"
                          :value="item.index"
                          :index="record.value.index"
                          :disabled="item.disabled"
                          data-type="filter"
                        >
                          {{ item.name }}
                        </a-select-option>
                      </a-select>
                    </div>
                  </template>

                  <!-- 当前模型字段 -->
                  <template slot="currentField" slot-scope="text, record">
                    <!-- 动态值 -->
                    <div class="item-box">
                      <data-item-select
                        v-show="record.value.val === 1"
                        v-model="record.currentField.val"
                        :list="record.currentField.list"
                        :systemFilterCtl="{
                          code: [
                            'workflowInstanceId',
                            'sequenceNo',
                            'sequenceNo',
                            'name',
                            'ownerDeptQueryCode',
                            'sortKey',
                            `${triggerVal}.sortKey`,
                          ],
                        }"
                        :bizFilterCtl="{
                          type: [10, 8, 6, 7],
                        }"
                        :disabled="record.targetField.val === ''"
                        :getPopupContainer="getPopupContainer"
                      />

                      <!-- 固定值 -->
                      <a-input
                        v-show="
                          record.value.val === 2 &&
                          !getLogicType(record.targetField)
                        "
                        v-model="record.currentField.val"
                        style="width: 240px"
                        :placeholder="
                          getDateType(record.targetField)
                            ? '日期格式2019-05-10 12:00:00'
                            : '请输入'
                        "
                        :disabled="record.targetField.val === ''"
                      />
                      <!-- 为空 -->
                      <div
                        v-show="
                          record.value.val === 3 || record.value.val === ''
                        "
                        style="width: 240px"
                      ></div>

                      <!-- 逻辑时下拉 -->
                      <div
                        v-show="
                          record.value.val === 2 &&
                          getLogicType(record.targetField)
                        "
                        style="width: 240px"
                      >
                        <a-select
                          v-model="record.currentField.val"
                          :disabled="record.targetField.val === ''"
                          style="width: 240px"
                          :getPopupContainer="getPopupContainer"
                        >
                          <a-select-option value="true"> true </a-select-option>
                          <a-select-option value="false">
                            false
                          </a-select-option>
                        </a-select>
                      </div>
                    </div>
                  </template>

                  <!-- 操作 -->
                  <template slot="operation" slot-scope="operation">
                    <span class="delete-btn">
                      <i
                        class="icon aufontAll h-icon-all-delete-o"
                        @click="deleteRuleActionMainScope(operation)"
                      ></i>
                    </span>
                  </template>
                </a-table>
              </template>

              <div
                ref="addDataActionBtn"
                class="add-row"
                @click="addSheetDataAction"
              >
                <i class="icon aufontAll h-icon-all-plus-o"></i> 新增字段
              </div>
            </h3-panel>

            <h3-panel
              :title="UpDateObjIsSheet ? '子表动作' : '主表动作'"
              :collapsible="true"
            >
              <template>
                <a-table
                  :columns="dataActionColumns"
                  :dataSource="dataActionData"
                  :pagination="false"
                  size="small"
                >
                  <!-- 目标数据字段 -->
                  <template slot="targetField" slot-scope="text, record">
                    <div class="item-box">
                      <data-item-select
                        v-model="record.targetField.val"
                        :list="record.targetField.list"
                        :fliterSystem="triggerAction === 2"
                        :systemFilterCtl="{
                          code: [
                            'modifier',
                            'sortKey',
                            `${triggerVal}.sortKey`,
                          ],
                        }"
                        :bizFilterCtl="{
                          type: [8, 6, 7],
                        }"
                        :getPopupContainer="getPopupContainer"
                        @change="
                          (val) => {
                            dataItemChange(val, record, 4);
                          }
                        "
                      />
                    </div>
                  </template>

                  <!-- 操作符 -->
                  <span slot="operatorTitle" class="hide-thead">操作符</span>
                  <template slot="operator" slot-scope="text, record">
                    <div class="item-box">
                      <a-select
                        v-show="triggerAction !== 1"
                        v-model="record.operator.val"
                        style="width: 100px"
                        placeholder="请选择"
                        :class="!record.operator.val ? 'show-placeholder' : ''"
                        :getPopupContainer="getPopupContainer"
                        @change="onOperatorChange"
                      >
                        <a-select-option
                          v-for="(item, index) in record.operator.list"
                          :key="index"
                          :value="item.index"
                          :index="record.operator.index"
                          :disabled="item.disabled"
                          data-type="action"
                        >
                          {{ item.name }}
                        </a-select-option>
                      </a-select>
                      <div
                        v-show="triggerAction === 1"
                        style="
                          width: 100px;
                          text-align: center;
                          line-height: 32px;
                        "
                      >
                        设置为
                      </div>
                    </div>
                  </template>

                  <!-- 值 -->
                  <template slot="value" slot-scope="text, record">
                    <div class="item-box">
                      <a-select
                        v-model="record.value.val"
                        style="width: 100px"
                        placeholder="请选择"
                        :class="!record.value.val ? 'show-placeholder' : ''"
                        :getPopupContainer="getPopupContainer"
                        @change="valueSelectChange(record)"
                      >
                        <a-select-option
                          v-for="(item, index) in record.value.list"
                          :key="index"
                          :value="item.index"
                          :index="record.value.index"
                          :disabled="item.disabled"
                          data-type="action"
                        >
                          {{ item.name }}
                        </a-select-option>
                      </a-select>
                    </div>
                  </template>

                  <!-- 当前模型字段 -->
                  <template slot="currentField" slot-scope="text, record">
                    <!-- 动态值 -->
                    <div class="item-box">
                      <data-item-select
                        v-show="record.value.val === 1"
                        v-model="record.currentField.val"
                        :list="record.currentField.list"
                        :systemFilterCtl="{
                          code: [
                            'ownerDeptQueryCode',
                            'workflowInstanceId',
                            'modifier',
                            'sortKey',
                            `${triggerVal}.sortKey`,
                          ],
                        }"
                        :bizFilterCtl="{
                          type: [8, 6, 7],
                        }"
                        :disabled="record.targetField.val === ''"
                        :getPopupContainer="getPopupContainer"
                      />

                      <!-- 固定值 -->
                      <a-input
                        v-show="
                          record.value.val === 2 &&
                          !getLogicType(record.targetField)
                        "
                        v-model="record.currentField.val"
                        style="width: 240px"
                        :placeholder="
                          getDateType(record.targetField)
                            ? '日期格式2019-05-10 12:00:00'
                            : '请输入'
                        "
                        :disabled="record.targetField.val === ''"
                      />
                      <!-- 为空 -->
                      <div
                        v-show="
                          record.value.val === 3 || record.value.val === ''
                        "
                        style="width: 240px"
                      ></div>

                      <!-- 逻辑时下拉 -->
                      <div
                        v-show="
                          record.value.val === 2 &&
                          getLogicType(record.targetField)
                        "
                        style="width: 240px"
                      >
                        <a-select
                          v-model="record.currentField.val"
                          :disabled="record.targetField.val === ''"
                          style="width: 240px"
                          :getPopupContainer="getPopupContainer"
                        >
                          <a-select-option value="true"> true </a-select-option>
                          <a-select-option value="false">
                            false
                          </a-select-option>
                        </a-select>
                      </div>
                    </div>
                  </template>

                  <!-- 操作 -->
                  <template slot="operation" slot-scope="operation">
                    <span class="delete-btn">
                      <i
                        class="icon aufontAll h-icon-all-delete-o"
                        @click="deleteActionItem(operation)"
                      ></i>
                    </span>
                  </template>
                </a-table>
              </template>
              <div
                ref="addDataActionBtn"
                class="add-row"
                @click="addDataAction(false)"
              >
                <i class="icon aufontAll h-icon-all-plus-o"></i> 新增字段
              </div>
            </h3-panel>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <a-button
        v-if="curStep === 0"
        type="primary"
        :disabled="isNextAble"
        @click="goNextStep"
      >
        下一步：设置执行动作
      </a-button>

      <div v-else>
        <a-button type="default" @click="goPrevStep">
          上一步：设置触发动作
        </a-button>
        <a-button type="primary" @click="submit"> 完成 </a-button>
      </div>
    </div>

    <a-alert
      v-if="isShowAlert"
      class="warn-alert"
      message="请先完善当前数据条件"
      banner
      closable
      @close="onClose"
    />
  </div>
</template>
<script lang="ts" src="./data-rule.ts"></script>
<style lang="less">
@import './style/index.less';
</style>

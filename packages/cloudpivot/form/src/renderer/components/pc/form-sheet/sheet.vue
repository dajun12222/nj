<template>
  <div class="warp">
    <div class="sheet">
      <div class="sheet__row sheet__head">
        <div
          class="center middle sheet__col"
          :class="{
            'shadow-left':
              shadowLeft && freezeColumns && freezeColumns.length === 0,
          }"
        >
          <a-checkbox
            v-if="checkbox"
            :indeterminate="indeterminate"
            :checked="checkedAll"
            @change="checkAll"
          />

          <template v-else>
            {{ $t('cloudpivot.form.renderer.number') }}
          </template>
        </div>
        <template v-for="(col, colIdx) in freezeColumns">
          <h3-size-slider
            v-if="columnSlots[col.key]"
            :key="col.key"
            class="middle sheet__col"
            :class="[shadowLeft && isLastFreeze(col.key) ? 'shadow-left' : '']"
            :style="getColStyle(col.key)"
            :right="true"
            :maxWidth="855"
            @resize="(e) => onColResize(e, colIdx, col)"
          >
            <slot
              :name="columnSlots[col.key]"
              :column="col"
              :index="colIdx"
            ></slot>
          </h3-size-slider>

          <h3-size-slider
            v-else
            v-show="showColumn(col.key)"
            :key="col.key"
            class="middle sheet__col"
            :class="[
              getControlClass(col.type),
              shadowLeft && isLastFreeze(col.key) ? 'shadow-left' : '',
            ]"
            :style="getColStyle(col.key)"
            :right="true"
            :maxWidth="855"
            @resize="(e) => onColResize(e, colIdx, col)"
          >
            <div :style="getColumnStyle(col)" class="ctrl">
              <template> </template>
              <!-- <span style="color:#F4454E" v-if="getColumnRequired(col)">*</span> -->
              {{ getColumnLabel(col) }}
              <a-tooltip v-if="getTips(col)" placement="top">
                <template slot="title">
                  <span>{{ getTips(col) }}</span>
                </template>
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </div>

            <a-dropdown v-show="canUnFrozen" :trigger="['click']">
              <a class="ant-dropdown-link">
                <a-icon type="down" />
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a
                    href="javascript:;"
                    @click="freezeColumn(col.key, false)"
                    >{{ $t('cloudpivot.form.renderer.unFrozenColumn') }}</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </h3-size-slider>
        </template>

        <div
          id="sheet-title"
          class="sheet__cols"
          :class="{ noAction: !showAction }"
        >
          <div class="sheet__row">
            <template v-for="(col, colIdx) in unFreezeColumns">
              <h3-size-slider
                v-if="columnSlots[col.key]"
                :key="col.key"
                class="middle sheet__col"
                :class="[isLastUnFreeze(col.key) ? 'last' : '']"
                :style="getColStyle(col.key)"
                :right="true"
                :maxWidth="855"
                @resize="(e) => onColResize(e, colIdx, col)"
              >
                <slot
                  :name="columnSlots[col.key]"
                  :column="col"
                  :index="colIdx"
                ></slot>
              </h3-size-slider>

              <!-- <div
                v-if="col.options && col.options.propertyType === 8"
                class="middle sheet__col"
                style="padding: 0"
                :key="col.key"
                v-show="showColumn(col.key)"
                :class="[
                  getControlClass(col.type),
                  isLastUnFreeze(col.key) ? 'last' : '',
                ]"
                :style="getColStyle(col.key)"
                :right="true"
              >

              </div> -->

              <div
                v-if="col.options && col.options.propertyType === 8"
                v-show="showColumn(col.key)"
                :key="col.key"
                class="middle sheet__col"
                style="padding: 0"
                :class="[
                  getControlClass(col.type),
                  isLastUnFreeze(col.key) ? 'last' : '',
                ]"
                :style="getColStyle(col.key)"
              >
                <div class="child-sheet-wrapper">
                  <div class="child-sheet-title">
                    {{
                      language === 'en' && zhToEn[getColumnLabel(col)]
                        ? zhToEn[getColumnLabel(col)]
                        : getColumnLabel(col)
                    }}
                    <a-tooltip v-if="getTips(col)" placement="top">
                      <template slot="title">
                        <span>{{ getTips(col) }}</span>
                      </template>
                      <a-icon type="question-circle-o" />
                    </a-tooltip>
                  </div>
                  <div class="child-row" style="padding: 8px">
                    <!-- <a-checkbox
                      v-if="isMultiStatus && isMultiStatus()"
                      @change="
                        (val) => {
                          return childCheckAll(val, colIdx);
                        }
                      "
                      :checked="getAllChildChecked(col.key)"
                      @click.stop.native="() => {}"
                    ></a-checkbox> -->
                    <template
                      v-for="(child, index) in col.options.childColumns"
                    >
                      <!-- :style="{
                          width: child.width + 'px',
                        }" -->
                      <!-- <div>{{child}}</div> -->
                      <!-- <div
                        v-if="child.isShow"
                        :class="{
                          'h3-size-slider__sider_line': index !== 0,
                        }"
                        class="child-row-item"
                        :style="[getColStyle(col.key, child.propertyCode),getColSheetStyle(index,child)]"
                        :key="index"
                        :title="child.vcTitle"
                      >
                        <label>{{ child.vcTitle }}</label>
                      </div> -->
                      <h3-size-slider
                        v-if="child.isShow"
                        :key="index"
                        :class="{
                          'h3-size-slider__sider_line': index !== 0,
                        }"
                        class="child-row-item"
                        :style="[
                          getColStyle(col.key, child.propertyCode),
                          getColSheetStyle(index, child),
                        ]"
                        :title="child.vcTitle"
                        :right="true"
                        @resize="
                          (e) => onColResize(e, colIdx, col, child.propertyCode)
                        "
                      >
                        <label>{{ child.vcTitle }}</label>
                      </h3-size-slider>
                    </template>
                  </div>
                </div>
              </div>

              <h3-size-slider
                v-else
                v-show="showColumn(col.key)"
                :key="col.key"
                class="middle sheet__col"
                :class="[
                  getControlClass(col.type),
                  isLastUnFreeze(col.key) ? 'last' : '',
                ]"
                :style="getColStyle(col.key)"
                :right="true"
                :maxWidth="855"
                @resize="(e) => onColResize(e, colIdx, col)"
              >
                <div :style="getColumnStyle(col)" class="ctrl">
                  <!-- <span style="color:#F4454E"  v-if="getColumnRequired(col)">*</span> -->
                  {{
                    language === 'en' && zhToEn[getColumnLabel(col)]
                      ? zhToEn[getColumnLabel(col)]
                      : getColumnLabel(col)
                  }}
                  <a-tooltip v-if="getTips(col)" placement="top">
                    <template slot="title">
                      <span>{{ getTips(col) }}</span>
                    </template>
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </div>

                <a-dropdown
                  v-show="canFrozen && sheetIsScroll"
                  :trigger="['click']"
                >
                  <a class="ant-dropdown-link">
                    <a-icon type="down" />
                  </a>
                  <a-menu slot="overlay">
                    <a-menu-item>
                      <a
                        href="javascript:;"
                        @click="freezeColumn(col.key, true)"
                        >{{ $t('cloudpivot.form.renderer.frozenColumn') }}</a>
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </h3-size-slider>
            </template>
          </div>
        </div>

        <div
          v-if="showAction"
          class="center middle sheet__col"
          :class="{ 'shadow-right': shadowRight }"
        >
          {{ $t('cloudpivot.form.renderer.action') }}
        </div>
      </div>

      <div class="sheet__body" :class="{ 'show-total': showTotal }">
        <div
          v-for="(row, rowIdx) in rows"
          :key="rowIdx + newDateTemp"
          class="sheet__row"
          :class="{ diffControls: !!row.diff }"
          @click="handleOnClickRows(rowIdx)"
        >
          <checkbox-text
            :readonly="!checkbox && !radio"
            :radio="radio"
            :value="checkeds[rowIdx]"
            class="center middle sheet__col"
            :class="{ 'shadow-left': shadowLeft && freezeColumns.length === 0 }"
            @change="check(rowIdx)"
          >
            {{ rowIdx + rowNumber + 1 }}
          </checkbox-text>

          <template v-for="(col, colIdx) in getFreezeCells(row)">
            <div
              v-if="rowSlots[col.key]"
              :key="col.key"
              class="center middle sheet__col"
              :style="getColStyle(col.key)"
              :class="{ 'shadow-left': shadowLeft && isLastFreeze(col.key) }"
            >
              <slot
                :name="rowSlots[col.key]"
                :row="row"
                :column="columns[colIdx]"
                :cell="col"
                :rowIndex="rowIdx + rowNumber"
              ></slot>
            </div>

            <div
              v-else
              v-show="showColumn(col.key)"
              :key="col.key"
              class="center middle sheet__col"
              :style="getColStyle(col.key)"
              :class="[
                getControlClass(col.type),
                shadowLeft && isLastFreeze(col.key) ? 'shadow-left' : '',
              ]"
            >
              <a-tooltip
                v-show="col.controller && col.controller.display"
                placement="topLeft"
              >
                <template
                  v-if="col.controller && col.controller.hasError"
                  slot="title"
                >
                  <ul>
                    <li
                      v-for="err in col.controller && col.controller.errors"
                      :key="err"
                    >
                      {{ getErrorMessage(col, err) }}
                    </li>
                  </ul>
                </template>

                <div
                  :class="{
                    error: col.controller && col.controller.hasError,
                    required: col.controller && col.controller.required,
                  }"
                >
                  <base-control-adapter class="cell" :control="col" />
                </div>
              </a-tooltip>
            </div>
          </template>

          <div class="sheet__cols" :class="{ noAction: !showAction }">
            <div class="sheet__row">
              <template v-for="(col, colIdx) in row">
                <template v-if="frozenKeys.indexOf(col.key) === -1">
                  <div
                    v-if="col.options && col.options.propertyType === 6"
                    :key="`${col.key + colIdx}`"
                    :style="getColStyle(col.key)"
                    :class="[isLastUnFreeze(col.key) ? 'sheet-body-row' : '']"
                  >
                    <div :style="getColStyle(col.key)">
                      <a
                        v-for="(atta, attaIdx) in col.controller._value"
                        :key="attaIdx"
                        :href="atta.isImage ? 'javascript:void(0)' : atta.url"
                        rel="noopener noreferrer"
                        :title="atta.name"
                      >
                        <template v-if="atta.isImage">
                          <img
                            :src="atta.url"
                            :alt="atta.name"
                            @click.stop="previewImg(atta.url)"
                          />
                        </template>
                        <template v-else-if="judegFileType(atta) === 'excel'">
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use use xlink:href="#h-icon-all-excel1" />
                          </svg>
                        </template>
                        <template v-else-if="judegFileType(atta) === 'word'">
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use xlink:href="#h-icon-all-word1" />
                          </svg>
                        </template>
                        <template v-else-if="judegFileType(atta) === 'ppt'">
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use xlink:href="#h-icon-all-ppt1" />
                          </svg>
                        </template>
                        <template v-else-if="judegFileType(atta) === 'pdf'">
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use xlink:href="#h-icon-all-pdf1" />
                          </svg>
                        </template>
                        <template v-else-if="judegFileType(atta) === 'zip'">
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use xlink:href="#h-icon-all-compressed-package" />
                          </svg>
                        </template>
                        <template v-else-if="judegFileType(atta) === 'audio'">
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use xlink:href="#h-icon-all-audio-frequency" />
                          </svg>
                        </template>
                        <template v-else-if="judegFileType(atta) === 'video'">
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use xlink:href="#h-icon-all-video1" />
                          </svg>
                        </template>
                        <template v-else-if="judegFileType(atta) === 'xml'">
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use xlink:href="#h-icon-all-xml" />
                          </svg>
                        </template>
                        <template v-else-if="judegFileType(atta) === 'rp'">
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use xlink:href="#h-icon-all-rp" />
                          </svg>
                        </template>
                        <template v-else-if="judegFileType(atta) === 'xmind'">
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use xlink:href="#h-icon-all-xmind" />
                          </svg>
                        </template>
                        <template v-else>
                          <svg class="icon iconsvg" aria-hidden="true">
                            <use xlink:href="#h-icon-all-form" />
                          </svg>
                        </template>
                      </a>
                    </div>
                  </div>
                  <div
                    v-else-if="rowSlots[col.key]"
                    :key="`${col.key + colIdx}`"
                    class="middle sheet__col diffControls"
                    :class="[isLastUnFreeze(col.key) ? 'last' : '']"
                    :style="getColStyle(col.key)"
                  >
                    <slot
                      :name="rowSlots[col.key]"
                      :row="row"
                      :column="columns[colIdx]"
                      :cell="col"
                      :rowIndex="rowIdx + rowNumber"
                    ></slot>
                  </div>
                  <div
                    v-else-if="col.options && col.options.propertyType === 8"
                    :key="`${col.key + colIdx}`"
                    :style="getColStyle(col.key)"
                    :class="[
                      isLastUnFreeze(col.key)
                        ? 'sheet-body-row sheet-row-style-flex'
                        : '',
                    ]"
                  >
                    <div
                      v-if="!col.controller._value"
                      :style="getColStyle(col.key)"
                    ></div>
                    <div v-else class="flex-div" :style="getColStyle(col.key)">
                      <template
                        v-for="(rowItem, cIdx) in col.controller &&
                        col.controller._value"
                      >
                        <div
                          v-show="
                            (!col.collapsible || cIdx === 0 || cIdx === 1) &&
                            cIdx < 7
                          "
                          :key="cIdx"
                          class="child-items-row"
                        >
                          <template
                            v-for="(item, idx) in col.options.childColumns"
                          >
                            <div
                              v-if="item.isShow"
                              :key="idx"
                              class="child-items"
                              :style="[
                                getColStyle(col.key, item.propertyCode),
                                {
                                  minWidth: item.width + 'px',
                                  display: 'flex',
                                },
                              ]"
                            >
                              <!-- <div
                                class="checkbox-style"
                                v-if="
                                  idx === 0 && isMultiStatus && isMultiStatus()
                                "
                              >
                                <a-checkbox
                                  :checked="rowItem.checked"
                                  @click.stop.native="() => {}"
                                  @change="
                                    (val) => {
                                      return checkboxChange(
                                        val,
                                        rowIdx,
                                        colIdx,
                                        cIdx
                                      );
                                    }
                                  "
                                ></a-checkbox>
                              </div> -->
                              <div>
                                <div
                                  v-if="
                                    item.propertyType ===
                                    DataItemType.Attachment
                                  "
                                  class="attachment-wrapper"
                                >
                                  <div>
                                    <div v-if="!rowItem[item.propertyCode]">
                                      --
                                    </div>
                                    <a
                                      v-for="(atta, attaIdx) in rowItem[
                                        item.propertyCode
                                      ]"
                                      :key="attaIdx"
                                      :href="
                                        atta.isImage
                                          ? 'javascript:void(0)'
                                          : atta.url
                                      "
                                      rel="noopener noreferrer"
                                      :title="atta.name"
                                    >
                                      <template v-if="atta.isImage">
                                        <img
                                          :src="atta.url"
                                          :alt="atta.name"
                                          @click.stop="previewImg(atta.url)"
                                        />
                                      </template>
                                      <template
                                        v-else-if="
                                          judegFileType(atta) === 'excel'
                                        "
                                      >
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use
                                            use
                                            xlink:href="#h-icon-all-excel1"
                                          />
                                        </svg>
                                      </template>
                                      <template
                                        v-else-if="
                                          judegFileType(atta) === 'word'
                                        "
                                      >
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use xlink:href="#h-icon-all-word1" />
                                        </svg>
                                      </template>
                                      <template
                                        v-else-if="
                                          judegFileType(atta) === 'ppt'
                                        "
                                      >
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use xlink:href="#h-icon-all-ppt1" />
                                        </svg>
                                      </template>
                                      <template
                                        v-else-if="
                                          judegFileType(atta) === 'pdf'
                                        "
                                      >
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use xlink:href="#h-icon-all-pdf1" />
                                        </svg>
                                      </template>
                                      <template
                                        v-else-if="
                                          judegFileType(atta) === 'zip'
                                        "
                                      >
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use
                                            xlink:href="#h-icon-all-compressed-package"
                                          />
                                        </svg>
                                      </template>
                                      <template
                                        v-else-if="
                                          judegFileType(atta) === 'audio'
                                        "
                                      >
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use
                                            xlink:href="#h-icon-all-audio-frequency"
                                          />
                                        </svg>
                                      </template>
                                      <template
                                        v-else-if="
                                          judegFileType(atta) === 'video'
                                        "
                                      >
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use
                                            xlink:href="#h-icon-all-video1"
                                          />
                                        </svg>
                                      </template>
                                      <template
                                        v-else-if="
                                          judegFileType(atta) === 'xml'
                                        "
                                      >
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use xlink:href="#h-icon-all-xml" />
                                        </svg>
                                      </template>
                                      <template
                                        v-else-if="judegFileType(atta) === 'rp'"
                                      >
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use xlink:href="#h-icon-all-rp" />
                                        </svg>
                                      </template>
                                      <template
                                        v-else-if="
                                          judegFileType(atta) === 'xmind'
                                        "
                                      >
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use xlink:href="#h-icon-all-xmind" />
                                        </svg>
                                      </template>
                                      <template v-else>
                                        <svg
                                          class="icon iconsvg"
                                          aria-hidden="true"
                                        >
                                          <use xlink:href="#h-icon-all-form" />
                                        </svg>
                                      </template>
                                    </a>
                                  </div>
                                </div>
                                <div
                                  v-else-if="
                                    item.propertyType ===
                                      DataItemType.LongText &&
                                    typeof rowItem[item.propertyCode] ===
                                      'object'
                                  "
                                  class="child-row-item"
                                  :title="
                                    rowItem[item.propertyCode]
                                      ? rowItem[item.propertyCode].text
                                      : ''
                                  "
                                  :class="
                                    rowItem[item.propertyCode]
                                      ? rowItem[item.propertyCode].class
                                      : ''
                                  "
                                >
                                  {{
                                    rowItem[item.propertyCode]
                                      ? rowItem[item.propertyCode].text
                                      : '--'
                                  }}
                                </div>
                                <div
                                  v-else-if="
                                    typeof rowItem[item.propertyCode] ===
                                    'object'
                                  "
                                  class="child-row-item"
                                  :title="
                                    rowItem[item.propertyCode.trim()] &&
                                    rowItem[item.propertyCode.trim()]
                                      .displayCode &&
                                    rowItem[item.propertyCode.trim()][
                                      rowItem[item.propertyCode.trim()]
                                        .displayCode
                                    ]
                                      ? rowItem[item.propertyCode.trim()][
                                          rowItem[item.propertyCode.trim()]
                                            .displayCode
                                        ]
                                      : Array.isArray(
                                          rowItem[item.propertyCode],
                                        )
                                      ? rowItem[item.propertyCode]
                                          .map((el) => el.name)
                                          .join()
                                      : ''
                                  "
                                >
                                  <div
                                    v-if="!rowItem[item.propertyCode.trim()]"
                                  >
                                    --
                                  </div>
                                  <template v-else>
                                    <template
                                      v-for="(subitem, index) in rowItem[
                                        item.propertyCode.trim()
                                      ]"
                                    >
                                      <div :key="index + subitem.id">
                                        <template
                                          v-if="
                                            subitem.type === 1 && subitem.name
                                          "
                                        >
                                          <div>
                                            <div class="deptInfo-li">
                                              <span class="dept-icon">
                                                <i
                                                  class="icon aufontAll h-icon-all-process-o"
                                                ></i>
                                              </span>
                                              <span class="dept-name">{{
                                                subitem.name
                                              }}</span>
                                            </div>
                                          </div>
                                        </template>
                                        <template
                                          v-else-if="
                                            subitem.type === 3 && subitem.name
                                          "
                                        >
                                          <AuthorAvatarInfo
                                            class="userInfo-li"
                                            :item="{
                                              sourceId: subitem.id,
                                              imgUrl: subitem.imgUrl,
                                              sourceName: subitem.name,
                                              type: subitem.type,
                                            }"
                                          />
                                        </template>
                                      </div>
                                    </template>
                                  </template>
                                </div>
                                <div v-else class="child-row-item">
                                  {{
                                    rowItem[item.propertyCode] ||
                                    rowItem[item.propertyCode] === 0
                                      ? rowItem[item.propertyCode]
                                      : '--'
                                  }}
                                </div>
                              </div>
                            </div>
                          </template>
                        </div>
                      </template>
                      <div
                        :class="
                          col.collapsible ? 'sheet-collapse' : 'sheet-expand'
                        "
                      >
                        <span
                          v-if="col.collapsible"
                          class="icon aufontAll exp-coll"
                          @click.prevent.stop="
                            col.collapsible = !col.collapsible
                          "
                        >
                          &#xecff;
                        </span>
                        <span
                          v-else
                          class="icon aufontAll exp-coll"
                          @click.prevent.stop="
                            col.collapsible = !col.collapsible
                          "
                        >
                          &#xecfe;
                        </span>
                        <!-- 更多弹窗按钮 -->
                        <div
                          v-if="
                            col.controller &&
                            col.controller._value &&
                            col.controller._value.length > 7 &&
                            !col.collapsible
                          "
                          class="row-collaps-more"
                          @click.stop="goSheetDetail(col)"
                        >
                          更多
                        </div>
                      </div>
                    </div>
                    <!-- <div class="child-items-row">
                      <div
                        class="load-more"
                        @click="loadMore(col)"
                        v-if="!col.last"
                      >
                        {{ $t("cloudpivot.list.pc.loadMore") }}
                      </div>
                      <div
                        class="load-complete"
                        v-if="col.last && col.page !== 1"
                      >
                        {{ $t("cloudpivot.list.pc.loadCompleted") }}
                      </div>
                    </div> -->
                  </div>
                  <div
                    v-else
                    v-show="showColumn(col.key)"
                    :key="`${col.key + colIdx}`"
                    class="middle sheet__col"
                    :class="[
                      getControlClass(col.type),
                      isLastUnFreeze(col.key) ? 'last' : '',
                      col.diff ? 'diffControls' : '',
                    ]"
                    :style="getColStyle(col.key)"
                  >
                    <a-tooltip
                      v-show="col.controller && col.controller.display"
                      placement="topLeft"
                    >
                      <template
                        v-if="col.controller && col.controller.hasError"
                        slot="title"
                      >
                        <ul>
                          <li
                            v-for="err in col.controller &&
                            col.controller.errors"
                            :key="err"
                          >
                            {{ getErrorMessage(col, err) }}
                          </li>
                        </ul>
                      </template>

                      <div
                        :class="{
                          error: col.controller && col.controller.hasError,
                          required: col.controller && col.controller.required,
                        }"
                      >
                        <template
                          v-if="
                            col &&
                            col.controller &&
                            !col.controller.value &&
                            col.controller.value !== 0 &&
                            col.options.propertyType !== DataItemType.Logic
                          "
                        >
                          <div>--</div>
                        </template>
                        <template
                          v-else-if="
                            col.options &&
                            (col.options.propertyType ===
                              DataItemType.ShortText ||
                              col.options.propertyType ===
                                DataItemType.LongText ||
                              col.options.propertyType ===
                                DataItemType.Number ||
                              col.options.propertyType === DataItemType.Radio ||
                              col.options.propertyType ===
                                DataItemType.Checkbox ||
                              col.options.propertyType ===
                                DataItemType.Dropdown ||
                              col.options.propertyType ===
                                DataItemType.DropdownMulti)
                          "
                        >
                          <div class="cell">
                            {{
                              col.controller &&
                              (col.controller.value ||
                                col.controller.value === 0)
                                ? Array.isArray(col.controller.value)
                                  ? col.controller.value.join(';')
                                  : col.controller.value
                                : '--'
                            }}
                          </div>
                        </template>

                        <template
                          v-if="
                            col.options &&
                            (col.options.propertyType ===
                              DataItemType.RelevanceForm ||
                              col.options.propertyType ===
                                DataItemType.RelevanceFormEx)
                          "
                        >
                          <div class="cell">
                            {{ getRelevanceFormShowValue(col) }}
                          </div>
                        </template>
                        <template
                          v-else-if="
                            col.options &&
                            (col.options.propertyType === DataItemType.Date ||
                              col.options.propertyType === DataItemType.Logic ||
                              col.options.propertyType === DataItemType.Address)
                          "
                        >
                          <base-control-adapter class="cell" :control="col" />
                        </template>
                        <template
                          v-else-if="
                            col.options &&
                            (col.options.propertyType ===
                              DataItemType.StaffSingle ||
                              col.options.propertyType ===
                                DataItemType.StaffMulti ||
                              col.options.propertyType ===
                                DataItemType.DeptSingle ||
                              col.options.propertyType ===
                                DataItemType.DeptMulti ||
                              col.options.propertyType ===
                                DataItemType.StaffDeptMix)
                          "
                        >
                          <template
                            v-for="(item, index) in col &&
                            col.controller &&
                            col.controller.value"
                          >
                            <div :key="index + item.id">
                              <template v-if="item.type === 1 && item.name">
                                <div>
                                  <div class="deptInfo-li">
                                    <span class="dept-icon">
                                      <i
                                        class="icon aufontAll h-icon-all-process-o"
                                      ></i>
                                    </span>
                                    <span class="dept-name">{{
                                      item.name
                                    }}</span>
                                  </div>
                                </div>
                              </template>
                              <template
                                v-else-if="item.type === 3 && item.name"
                              >
                                <AuthorAvatarInfo
                                  class="userInfo-li"
                                  :item="{
                                    sourceId: item.id,
                                    imgUrl: item.imgUrl,
                                    sourceName: item.name,
                                    type: item.type,
                                  }"
                                />
                              </template>
                            </div>
                          </template>
                        </template>
                      </div>
                    </a-tooltip>
                  </div>
                </template>
              </template>
            </div>
          </div>

          <div
            v-if="showAction"
            class="center middle sheet__col"
            :class="{ 'shadow-right': shadowRight }"
          >
            <slot name="action" :row="row" :index="rowIdx + rowNumber"></slot>
          </div>
        </div>

        <template v-if="rows.length === 0">
          <div class="emtpy__body">
            <img src="../../../../../../common/assets/images/no-data-wt.png" />
            <p>{{ $t('languages.common.noData') }}</p>
          </div>
        </template>
      </div>

      <div v-if="showTotal && hasStat" class="sheet__row total">
        <div
          class="center middle sheet__col"
          :class="{ 'shadow-left': shadowLeft && freezeColumns.length === 0 }"
        >
          {{ $t('cloudpivot.form.renderer.total') }}
        </div>

        <div
          v-for="col in freezeColumns"
          v-show="showColumn(col.key)"
          :key="col.key"
          class="center middle sheet__col"
          :class="[
            getControlClass(col.type),
            shadowLeft && isLastFreeze(col.key) ? 'shadow-left' : '',
          ]"
          :style="getColStyle(col.key)"
        >
          <template v-if="showStat(col.key)">
            {{ getStatText(col.key) }}{{ stats[col.key] | number }}
          </template>
        </div>

        <div class="sheet__cols" :class="{ noAction: !showAction }">
          <div class="sheet__row">
            <div
              v-for="col in unFreezeColumns"
              v-show="showColumn(col.key)"
              :key="col.key"
              class="center middle sheet__col"
              :class="[
                getControlClass(col.type),
                isLastUnFreeze(col.key) ? 'last' : '',
              ]"
              :style="getColStyle(col.key)"
            >
              <template v-if="showStat(col.key)">
                {{ getStatText(col.key) }}{{ stats[col.key] | number }}
              </template>
            </div>
          </div>
        </div>

        <div
          v-if="showAction"
          class="center middle sheet__col"
          :class="{ 'shadow-right': shadowRight }"
        ></div>
      </div>
    </div>

    <div class="sheet__row scrollbar">
      <div class="center middle sheet__col"></div>

      <div
        v-for="col in freezeColumns"
        v-show="showColumn(col.key)"
        :key="col.key"
        class="center middle sheet__col"
        :style="getColStyle(col.key)"
        :class="[getControlClass(col.type)]"
      ></div>

      <div id="sheet-scroll" class="sheet__cols" @scroll="onScroll">
        <div class="sheet__row">
          <template v-for="col in unFreezeColumns">
            <div
              v-if="columnSlots[col.key]"
              :key="col.key"
              class="center middle sheet__col"
              :class="[isLastUnFreeze(col.key) ? 'last' : '']"
              :style="getColStyle(col.key)"
            ></div>

            <div
              v-else
              v-show="showColumn(col.key)"
              :key="col.key"
              class="center middle sheet__col"
              :class="[
                getControlClass(col.type),
                isLastUnFreeze(col.key) ? 'last' : '',
              ]"
              :style="getColStyle(col.key)"
            ></div>
          </template>
        </div>
      </div>

      <div v-if="showAction" class="center middle sheet__col"></div>
    </div>

    <FormSheetModal
      ref="sheetList"
      :visible="visible"
      :sheetData="sheetList"
      :subQueryCondition="sheetQueryCondeiton"
      @close="visible = false"
      @pageChange="pageChange"
    />

    <img-preview
      v-if="isPreviewImage"
      :imgList="[{ url: bs64Img }]"
      @close="isPreviewImage = false"
    />
  </div>
</template>

<script lang="ts" src="./sheet.ts"></script>

<style lang="less" scoped>
@import './../../../../../../common/common';
@import './../../../../../../application/src/components/pc/style/custom-themes';
.warp {
  position: relative;

  &:hover {
    & > .sheet__row.scrollbar.stick {
      opacity: 0.8;
    }
  }
}

/*ie11 css hack*/
@media all and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  .warp.fullsheet {
    margin-right: 8px;
  }
}

.h3-size-slider__sider_line {
  border-left: 1px #e8e8e8 solid;
  padding-left: 8px;
}

.shadow-left {
  position: relative;

  &::after {
    content: '';
    box-shadow: inset 8px 0px 6px -6px rgba(0, 0, 0, 0.15);
    height: 100%;
    width: 8px;
    display: block;
    right: -8px;
    top: 0; // 解决ie11 往下偏移的问题
    position: absolute;
    z-index: 1;
  }
}

.shadow-right {
  position: relative;

  &::before {
    content: '';
    box-shadow: inset -9px 0 6px -6px rgba(0, 0, 0, 0.15);
    height: 100%;
    width: 8px;
    display: block;
    left: -8px;
    top: 0; // 解决ie11 往下偏移的问题
    position: absolute;
    z-index: 1;
  }
}

.sheet {
  border: 1px solid #e8e8e8;
  border-bottom: 0;
  border-radius: 4px;

  &__row {
    display: flex;
  }

  &__col {
    width: 46px;
    padding: 8px;
    flex-shrink: 0;
    border-right: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
    transition: width 1ms linear;
    &:last-child {
      border-right-color: transparent;
    }

    &.attachment {
      justify-content: left;
    }
    & > div {
      /** 防止必填项伪元素“*”无法显示；panwl */
      // overflow: hidden;
    }

    &.two {
      width: 92px;
    }
    &.attachment {
    }
  }

  &__head {
    font-weight: 500;
    background: #f8f8fb;
  }
}

.sheet__cols {
  flex-grow: 1;
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;

  & > .sheet__row {
    height: 100%;

    & > .sheet__col {
      min-width: 60px;
      height: 100% !important;
      // overflow: auto;

      // & > div.required:before {
      //   content: '*';
      //   color: #F4454E;
      //   position: absolute;
      //   left: -0.5em;
      // }

      &.dropdown {
        line-height: 0.99;
        & > div {
          width: 100%;
        }
      }
      &.number,
      &.logic {
        &:before {
          content: '';
        }
      }

      // &.logic,
      // &.text,
      // &.number,
      // &.dropdown {
      //   min-width: 60px;
      // }

      // &.textarea {
      //   min-width: 300px;
      // }

      &.last {
        flex-grow: 1;
        &.number > div {
          flex-flow: row-reverse;
        }
      }
    }
  }
}
.sheet-row-style-flex {
  display: flex;
  .flex-div {
    -webkit-box-flex: 1;
    flex-grow: 1;
    padding: 0 !important;
    position: relative;
    .sheet-collapse,
    .sheet-expand {
      text-align: center;
      position: relative;
      width: 100%;
      > span {
        font-size: 12px;
        color: #000;
        cursor: pointer;
      }
      .row-collaps-more {
        position: absolute;
        right: 12px;
        top: 0;
        width: 40px;
        height: 20px;
        background: #e3e3e3;
        border-radius: 2px;
        color: rgba(17, 18, 24, 0.5);
        font-size: 12px;
        line-height: 20px;
        text-align: center;
        cursor: pointer;
      }
    }
    .sheet-collapse {
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.62) 0%,
        rgba(255, 255, 255, 0.92) 47%,
        #ffffff 100%
      );
      position: absolute;
      left: 0;
      bottom: 0;
      height: 26px;
      line-height: 26px;
    }
    .sheet-expand {
      border-top: 1px solid #e8eaed;
      background: #fff;
      height: 20px;
      line-height: 20px;
    }
  }
}
.attachment-wrapper,
.sheet-body-row {
  // align-items:center;
  display: flex;
  border-right: 1px solid #e8eaed;
  > div {
    overflow: hidden;
    padding: 0 12px;
    min-height: 36px;
    > a {
      display: inline-block;
      min-width: 22px;
      width: 22px;
      max-width: 22px;
      height: 22px;
      margin-right: 8px;
      > img,
      svg {
        width: 22px;
        height: 22px;
      }
    }
  }
}
.sheet__head .sheet__col {
  border-right-width: 0;

  &.center {
    border-right-width: 1px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.65);
    // border-right: 1px solid #E8EAED;
    padding: 0 8px;
  }

  /deep/.h3-size-slider__sider-right {
    right: 0;
    background: #e8e8e8;
    width: 1px;
  }

  // &:last-child{
  //   /deep/.h3-size-slider__sider-right{
  //     right:-1px;
  //   }
  // }

  & > div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-grow: 1;
    font-size: 14px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.65);
  }
}

.sheet__body .sheet__cols .sheet__col {
  overflow: hidden;
  padding: 0 12px;
  min-height: 36px;
}

.sheet__body .sheet__col > div {
  flex-grow: 1;
}

.sheet__cols + .sheet__col,
.noAction .last {
  // border-right: none;
}

.sheet__row.scrollbar {
  min-height: 7px;
  margin-bottom: 7px;

  &.stick {
    position: fixed;
    bottom: 2px;
    z-index: 100;
    opacity: 0.4;
    transition: opacity 0.3s ease-out;
  }

  & > .sheet__cols {
    overflow-x: auto;

    & > .sheet__row {
      height: 0;
    }
  }

  .sheet__col {
    min-height: 1px;
    // height: auto;
    // height:1px;
    border: 0;
    margin-right: 1px;
    padding-top: 0;
    padding-bottom: 0;
  }
}

.center {
  display: inline-flex;
  justify-content: center;
}

.middle {
  display: inline-flex;
  align-items: center;
}

.list {
  .sheet {
    border: none;
    border-top: 1px solid #e8eaed;
    border-left: 1px solid #e8eaed;
    border-right: 1px solid #e8eaed;
    border-radius: unset;
  }

  .sheet > .sheet__head,
  .sheet__body > .sheet__row {
    border-bottom: 1px solid #e8e8e8;
  }
  .sheet__body > .sheet__row {
    &:hover {
      background: @hoveBGColor;
    }
  }

  .sheet__col {
    border: none;
    border-right: 1px solid #e8eaed;
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.85);
    padding: 0 12px;
    min-height: 36px;
  }

  .sheet__head /deep/.h3-size-slider__sider {
    background: transparent;
    width: 1px;
    top: 8px;
    height: 80%;
  }

  .sheet__body .sheet__col > div {
    max-width: 100%;
    display: flex;
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.85);
    > div {
      display: inline-block;
      margin-right: 8px;
    }

    /deep/.cell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      p {
        white-space: pre-wrap;
      }
      .text {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: unset;
      }
    }
    .userInfo-li,
    .deptInfo-li {
      height: 24px;
      background-color: #eee;
      border-radius: 12px;
      padding-right: 8px;
      display: flex;
    }
    .deptInfo-li {
      .dept-icon {
        width: 24px;
        min-width: 24px;
        max-width: 24px;
        height: 24px;
        border-radius: 50%;
        text-align: center;
        color: #fff;
        margin-right: 4px;
        background-color: rgba(17, 18, 24, 0.25);
        font-size: 16px;
        line-height: 24px;
        display: inline-block;
      }
      .dept-name {
        white-space: nowrap;
        height: 24px;
        font-size: 12px;
        font-weight: 400;
        color: #121933;
        line-height: 24px;
      }
    }
    /deep/.form-staff-warp {
      overflow: auto;
      white-space: inherit;
    }
    /deep/.form-staff {
      max-height: initial;
      display: flex;
      .form-staff-item {
        min-width: unset;
        .ant-avatar {
          min-width: 24px;
        }
      }
    }
  }
}

/deep/a.ant-dropdown-link {
  color: @light-color-2;

  &:active {
    color: @light-color-2;
  }
}
.child-sheet-wrapper {
  overflow: hidden;
  width: 100%;
  .child-sheet-title {
    text-align: center;
    padding: 0 12px;
    height: 36px;
    line-height: 36px;
    border-bottom: 1px solid #e8e8e8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .child-row {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    padding: unset !important;
    .one-col-style {
      padding-left: 34px !important;
    }
    .child-row-item {
      // position: relative;
      // float: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 12px;
      height: 36px;
      line-height: 36px;
      &:last-child {
        border-right: none;
      }
    }
  }
}
.sheet-body-row {
  -webkit-box-flex: 1;
  flex-grow: 1;
}
/deep/ .file-list .file-item-name {
  max-width: 100% !important;
}
.child-items-row {
  display: flex;
  border-top: 1px solid #e8e8e8;
  flex-wrap: nowrap;
  -webkit-box-pack: justify;
  justify-content: space-between;
  &:first-child {
    border-top: none;
  }
  .child-items {
    padding: 0 12px;
    overflow: hidden;
    // text-overflow: ellipsis;
    white-space: nowrap;
    align-items: center;
    border-right: 1px solid #e8eaed;
    &.padding {
      padding-left: 28px;
    }
    > div {
      display: flex;
      align-items: center;
      width: 100%;
    }
    .checkbox-style {
      width: 30px;
      // float: left;
    }
    .child-row-item {
      position: relative;
      // white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-content: center;
      &.text-disabled {
        color: #ccc;
      }
      > div {
        display: inline-block;
        margin-right: 8px;
      }
      // &:hover {
      //   cursor: pointer;
      //   color: #2970ff;
      // }
    }
    .attachment-wrapper {
      padding: 0;
      width: 100%;
      border-right-color: transparent;
      > div {
        padding: 0;
        display: flex;
        align-items: center;
      }
    }
    .row-collaps {
      height: 20px;
      margin-right: 8px;
      color: rgba(0, 0, 0, 0.65);
      font-size: 10px;
      float: left;
      transition: transform 0.24s;
      cursor: pointer;
      &.expanded {
        transform: rotate(180deg);
      }
    }
    .userInfo-li,
    .deptInfo-li {
      height: 24px;
      background-color: #eee;
      border-radius: 12px;
      padding-right: 8px;
      display: flex;
    }
    .deptInfo-li {
      .dept-icon {
        width: 24px;
        min-width: 24px;
        max-width: 24px;
        height: 24px;
        border-radius: 50%;
        text-align: center;
        color: #fff;
        margin-right: 4px;
        background-color: rgba(17, 18, 24, 0.25);
        font-size: 16px;
        line-height: 24px;
        display: inline-block;
      }
      .dept-name {
        white-space: nowrap;
        height: 24px;
        font-size: 12px;
        font-weight: 400;
        color: #121933;
        line-height: 24px;
      }
    }
  }
  .load-more {
    color: @primary-color;
    font-size: 12px;
    width: 100%;
    padding: 8px;
    padding-left: 28px;
    cursor: pointer;
  }
  .load-complete {
    color: rgba(0, 0, 0, 0.65);
    font-size: 12px;
    width: 100%;
    padding: 8px;
    padding-left: 28px;
  }
}
.reverse-relevance-list {
  .sheet__row {
    //overflow-y: hidden;
  }
}

.emtpy__body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  color: @light-color-2;

  & > p {
    margin-top: 1em;
  }
}
</style>

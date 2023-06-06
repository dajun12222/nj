<template>
  <div
    v-if="dataColumns.propertyType === DataItemType.Attachment"
    class="attachment-wrapper"
  >
    <a
      v-for="(atta, attaIdx) in dataValue"
      :key="attaIdx"
      :href="atta.isImage ? 'javascript:void(0)' : atta.url"
      rel="noopener noreferrer"
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
          <use xlink:href="#h-icon-all-excel1" />
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

  <div
    v-else-if="
      dataColumns.propertyType === DataItemType.LongText &&
      typeof dataValue === 'object' &&
      dataType === 'SHEET'
    "
    class="child-row-item"
    :class="dataType === 'SHEET' ? dataValue.class : ''"
  >
    {{ dataValue.text }}
  </div>

  <!-- 处理人员头像 -->
  <div
    v-else-if="dataColumns.propertyType === DataItemType.StaffSingle"
    class="col-inner-wrapper2"
    :class="
      dataType === 'SHEET'
        ? { 'child-row-item': true }
        : { 'col-inner-wrapper': true }
    "
  >
    <div
      v-for="userInfo in dataValue || dataValueAlias"
      :key="userInfo.id"
      class="col-inner-wrapper-li"
    >
      <template v-if="userInfo.name">
        <AuthorAvatarInfo
          class="userInfo-li"
          :item="{
            sourceId: userInfo.id,
            imgUrl: userInfo.imgUrl,
            sourceName: userInfo.name,
            type: userInfo.type,
          }"
        />
      </template>
    </div>
  </div>

  <div
    v-else-if="dataColumns.propertyType === DataItemType.StaffMulti"
    class="col-inner-wrapper2"
    :class="
      dataType === 'SHEET'
        ? { 'child-row-item': true }
        : { 'col-inner-wrapper': true }
    "
    @mouseenter="
      (e) => mouseEnter(e, dataValue || dataValueAlias, 'users', row.id, rowIdx)
    "
  >
    <div
      v-for="userInfo in dataValue || dataValueAlias"
      :key="userInfo.id"
      class="col-inner-wrapper-li"
    >
      <template v-if="userInfo.name">
        <AuthorAvatarInfo
          class="userInfo-li"
          :item="{
            sourceId: userInfo.id,
            imgUrl: userInfo.imgUrl,
            sourceName: userInfo.name,
            type: userInfo.type,
          }"
        />
      </template>
    </div>
  </div>

  <!-- 混合选人单独处理 -->
  <div
    v-else-if="dataColumns.propertyType === DataItemType.StaffDeptMix"
    class="col-inner-wrapper"
    :class="{ 'col-inner-wrapper2': dataType === 'SHEET' ? false : true }"
    @mouseenter="
      (e) =>
        mouseEnter(
          e,
          dataValue || dataValueAlias,
          'StaffDeptMix',
          row.id,
          rowIdx,
        )
    "
  >
    <div
      v-for="userInfo in dataValue || dataValueAlias"
      :key="userInfo.id"
      class="col-inner-wrapper-li deptMulti"
    >
      <template v-if="userInfo.type === 1">
        <span v-if="!userInfo.name.includes('--')"><i class="icon aufontAll h-icon-all-process-o"></i>
          {{ userInfo.name }}</span>
        <div v-else>
          {{ userInfo.name }}
        </div>
      </template>
      <template v-else-if="userInfo.type === 3 && userInfo.name">
        <AuthorAvatarInfo
          class="userInfo-li"
          :item="{
            sourceId: userInfo.id,
            imgUrl: userInfo.imgUrl,
            sourceName: userInfo.name,
            type: userInfo.type,
          }"
        />
      </template>
    </div>
  </div>

  <!-- 处理数字靠右展示 -->
  <div
    v-else-if="dataColumns.propertyType === DataItemType.Number"
    style="text-align: right; display: block"
    class="col-inner-wrapper child-row-item"
  >
    {{ dataValue || dataValueAlias }}
  </div>

  <!-- 处理部门展示 -->
  <div
    v-else-if="dataColumns.propertyType === DataItemType.DeptSingle"
    class="col-inner-wrapper dept deptMulti"
    :title="dataValue || dataValueAlias"
  >
    <template
      v-if="
        (dataValue || dataValueAlias) &&
        Array.isArray(dataValue || dataValueAlias)
      "
    >
      <template v-for="(deptName, deptIdx) in dataValue || dataValueAlias">
        <span :key="deptIdx"><i class="icon aufontAll h-icon-all-process-o"></i>
          {{ deptName.name }}</span>
      </template>
    </template>
    <template
      v-else-if="
        (dataValue || dataValueAlias) &&
        !(dataValue || dataValueAlias).includes('--')
      "
    >
      <template
        v-for="(deptNameS, deptIdxS) in (dataValue || dataValueAlias).split(
          ',',
        )"
      >
        <span :key="deptIdxS"><i class="icon aufontAll h-icon-all-process-o"></i>
          {{ deptNameS }}</span>
      </template>
    </template>
    <div v-else>
      {{ dataValue || dataValueAlias }}
    </div>
  </div>

  <div
    v-else-if="dataColumns.propertyType === DataItemType.DeptMulti"
    class="col-inner-wrapper dept deptMulti"
    :title="dataValue || dataValueAlias"
    @mouseenter="
      (e) => mouseEnter(e, dataValue || dataValueAlias, 'deps', row.id, rowIdx)
    "
  >
    <template
      v-if="
        (dataValue || dataValueAlias) &&
        Array.isArray(dataValue || dataValueAlias)
      "
    >
      <template v-for="(deptName, deptIdx) in dataValue || dataValueAlias">
        <span :key="deptIdx"><i class="icon aufontAll h-icon-all-process-o"></i>
          {{ deptName.name }}</span>
      </template>
    </template>
    <template
      v-else-if="
        (dataValue || dataValueAlias) &&
        !(dataValue || dataValueAlias).includes('--')
      "
    >
      <template
        v-for="(deptNameS, deptIdxS) in (dataValue || dataValueAlias).split(
          ',',
        )"
      >
        <span :key="deptIdxS"><i class="icon aufontAll h-icon-all-process-o"></i>
          {{ deptNameS }}</span>
      </template>
    </template>
    <div v-else>
      {{ dataValue || dataValueAlias }}
    </div>
  </div>

  <!-- 处理地址 -->
  <div
    v-else-if="dataColumns.propertyType === DataItemType.Address"
    class="col-inner-wrapper"
    :title="dataValue || dataValueAlias"
  >
    <i
      v-if="
        (dataValue || dataValueAlias) &&
        !(dataValue || dataValueAlias).includes('--')
      "
      class="icon aufontAll h-icon-all-get-address-o"
    ></i>
    {{ dataValue || dataValueAlias }}
  </div>

  <!-- 处理字符串过长展示 -->
  <div
    v-else-if="(dataValue || dataValueAlias) > 35 && dataType === 'SHEET'"
    class="col-inner-wrapper"
  >
    <a-popover
      placement="bottomLeft"
      trigger="hover"
      overlayClassName="col-inner-popover"
      :overlayStyle="{
        maxWidth: '260px',
        maxHeight: '340px',
        overflowY: 'auto',
      }"
    >
      <template slot="content">
        {{ dataValue || dataValueAlias }}
      </template>
      {{ dataValue || dataValueAlias }}
    </a-popover>
  </div>

  <div v-else class="child-row-item">
    <span class="text">{{ dataValue || dataValueAlias }}</span>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Popover, Icon, Checkbox, Dropdown, Menu } from '@h3/antd-vue';
import { DataItemType } from '../../../../form/schema';
import AuthorAvatarInfo from '../../../../common/src/components/pc/author-avatar-info/author-avatar-info.vue';
// @@ 组件定义
@Component({
  name: 'listCustomTemplateHandle',
  components: {
    AuthorAvatarInfo,
    APopover: Popover,
    AIcon: Icon,
    ACheckbox: Checkbox,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
  },
})
export default class listCustomTemplateHandle extends Vue {
  DataItemType: any = DataItemType; //组件类型集合

  @Prop() dataValue: any; //单元格值

  @Prop() dataValueAlias?: any; //单元格值备用值

  @Prop() dataColumns: any; //列表头数据

  @Prop() dataType: string; //数据类型主表或子表

  @Prop() pageVM: any; //父级组件的vue对象

  @Prop() row: any; //行数据

  @Prop() col: any; //列数据

  @Prop() rowIdx: any; //当前行索引

  @Prop() modelType?: string; //模型类型

  //识别附件该用什么视图展示
  judegFileType(item) {
    if (!item.mimeType) {
      return false;
    }
    // if(item.mimeType.includes('WAVE')||)
    // let type = item.
    if (
      item.mimeType.includes('WAVE') ||
      item.mimeType.includes('WMA') ||
      item.mimeType.includes('cda') ||
      item.mimeType.includes('AIFF') ||
      item.mimeType.includes('MIDI') ||
      item.mimeType.includes('VQF') ||
      item.mimeType.includes('MP3')
    ) {
      return 'audio';
    } else if (
      item.mimeType.includes('MPEG') ||
      item.mimeType.includes('AVI') ||
      item.mimeType.includes('ASF') ||
      item.mimeType.includes('MOV') ||
      item.mimeType.includes('WMV') ||
      item.mimeType.includes('3GP') ||
      item.mimeType.includes('RM') ||
      item.mimeType.includes('RMVB') ||
      item.mimeType.includes('FLV/F4V') ||
      item.mimeType.includes('mp4')
    ) {
      return 'video';
    } else if (
      item.mimeType.includes('xls') ||
      item.mimeType.includes('xlsx')
    ) {
      return 'excel';
    } else if (item.mimeType.includes('doc')) {
      return 'word';
    } else if (item.mimeType.includes('ppt')) {
      return 'ppt';
    } else if (item.mimeType.includes('pdf')) {
      return 'pdf';
    } else if (item.mimeType.includes('zip') || item.mimeType.includes('rar')) {
      return 'zip';
    } else if (item.mimeType.includes('xml')) {
      return 'xml';
    } else if (item.mimeType.includes('rp')) {
      return 'rp';
    } else if (
      item.mimeType.includes('xmind') ||
      item.mimeType.includes('xmt')
    ) {
      return 'xmind';
    } else {
      return false;
    }
  }

  //鼠标移动到列表行时触发
  mouseEnter(
    e: any,
    value: any,
    type: 'users' | 'deps' | 'StaffDeptMix' = 'users',
    rowId,
    rowIdx,
  ) {
    const parame = {
      e: e,
      value: value,
      type: type,
      rowId: rowId,
      rowIdx: rowIdx,
    };
    this.$emit('mouseEnter', parame);
  }

  /**
   * 预览图片
   */
  previewImg(url) {
    this.$emit('previewImg', url);
  }
}
</script>

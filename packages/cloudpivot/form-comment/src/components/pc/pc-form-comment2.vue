<template>
  <div class="pc-form-comment">
    <div class="comment-panel">
      <div ref="commentWrap" class="comment">
        <template v-if="commentList.length <= 0">
          <p class="no-comment">
            {{ $t('cloudpivot.formComment.pc.noComment') }}
          </p>
        </template>
        <template v-if="commentList.length > 0">
          <div ref="commentListWrap" class="comment-list-wrap">
            <div
              v-for="(item, index) in commentList"
              :key="index"
              class="comment-item"
            >
              <div class="comment-item-left">
                <div class="avatar">
                  <img
                    v-if="item.imgUrl && item.imgUrl.includes('http')"
                    :src="item.imgUrl"
                  />
                  <img
                    v-else-if="item.imgUrl"
                    :src="getDownloadUrlNew(item.imgUrl)"
                  />
                  <i
                    v-else
                    class="icon aufontAll h-icon-all-normal_smile default-avatar"
                  ></i>
                </div>
              </div>
              <div class="comment-item-right">
                <div class="username">
                  {{ item.commentatorName }}
                  <!-- <i v-if="item.isShowDelBtn" class="fr icon aufontAll h-icon-all-delete-o" @click="deleteComm(item.id)"></i> -->
                </div>
                <div class="rich-text" :class="item.collspaned ? 'fade' : ''">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span
                    :id="`cc-${item.id}`"
                    class="text-box"
                    v-html="item.text"
                  ></span>
                  <span
                    v-if="item.isShowColspan"
                    class="collspan"
                    :class="item.collspaned ? '' : 'static'"
                    @click="item.collspaned = !item.collspaned"
                    >{{
                      item.collspaned
                        ? $t('cloudpivot.formComment.pc.expand')
                        : $t('cloudpivot.formComment.pc.collapse')
                    }}</span>
                </div>
                <div
                  v-if="item.attachmentModelList"
                  class="attachment-box preview"
                >
                  <ul>
                    <li
                      v-for="(aitem, aindex) in item.attachmentModelList"
                      :key="aindex"
                      class="file-preview"
                      :class="!showImgThumb(item) ? 'file-preview-icon' : ''"
                    >
                      <template v-if="showImgThumb(aitem)">
                        <img :src="getDownloadUrl(aitem.refId)" />
                      </template>
                      <template v-else>
                        <!-- <i
                                            class="icon aufontAll at-type"
                                            :class="getIconType(aitem)"
                                            ></i> -->
                        <svg class="icon at-type" aria-hidden="true">
                          <use :xlink:href="getIconType(aitem)" />
                        </svg>
                      </template>
                      <a-tooltip :title="aitem.name" arrowPointAtCenter>
                        <div class="op-mask">
                          <span class="op-actions">
                            <template v-if="showImgThumb(aitem)">
                              <i
                                class="icon aufontAll h-icon-all-eye-o preview-icon"
                                @click="preview(aitem)"
                              ></i>
                            </template>
                            <i
                              class="icon aufontAll h-icon-all-download-o"
                              @click="downloadFile(aitem)"
                            ></i>
                          </span>
                        </div>
                      </a-tooltip>
                    </li>
                  </ul>
                </div>
                <div class="date-box has-replay">
                  <span class="date">{{ item.createdTime }}</span>
                  <span class="replay-btn" @click="onClickReply(item)">
                    <a-tooltip :title="$t('cloudpivot.formComment.pc.reply')">
                      <span class="icon aufontAll">&#xe84a;</span>
                    </a-tooltip>
                  </span>
                  <span
                    v-if="item.commentator === userInfo.id"
                    class="del-comment-btn"
                  >
                    <a-popconfirm
                      :title="$t('cloudpivot.formComment.pc.sureDeleteComment')"
                      :okText="$t('cloudpivot.formComment.pc.sure')"
                      :cancelText="$t('cloudpivot.formComment.pc.cancel')"
                      arrowPointAtCenter
                      :placement="'topRight'"
                      :getPopupContainer="
                        (triggerNode) => {
                          return triggerNode.parentNode;
                        }
                      "
                      @confirm="handleDeleteComm(item.id)"
                    >
                      <span
                        class="icon aufontAll"
                        :title="$t('cloudpivot.formComment.pc.delete')"
                        >&#xecf5;</span>
                    </a-popconfirm>
                  </span>
                </div>
                <div
                  v-show="item.isShowReplay"
                  class="replay-box"
                  :class="{ 'replay-box-focus': isFocusReplyArea }"
                >
                  <div
                    class="replay-textarea"
                    :class="{ 'replay-textarea-focus': isFocusReplyArea }"
                  >
                    <!-- <fakeTextarea v-model="item.reComment" :max="2000" /> -->
                    <at
                      :ref="`atPane${index}`"
                      v-model="item.reComment"
                      :members="members"
                      :maxlength="maxlength"
                      :showPanel="false"
                      nameKey="name"
                      @touchBottom="onTouchBottom(index)"
                      @selectUser="onSelectUser"
                    >
                      <div
                        slot="embeddedItem"
                        :ref="`atwhoEditWrap${index}`"
                        tabindex="0"
                        :placeholder="`${$t(
                          'cloudpivot.formComment.pc.reply',
                        )}：${replayPlaceholder}`"
                        class="atwho-edit-wrap atwho-edit-wrap-focus dp-font34"
                        contenteditable="true"
                        @blur="onAtwhoViewBlur(index)"
                        @click="focusReplyTextarea"
                      ></div>
                    </at>
                    <!-- <textarea
                                        class="re-textarea"
                                        v-model="item.reComment"
                                        :placeholder="`回复：${replayPlaceholder}`"
                                    ></textarea> -->
                    <p class="len-limit">
                      {{ caculateLen(item) }}/{{ maxlength }}
                    </p>
                  </div>
                  <div class="buttons">
                    <a-button
                      class="cancel"
                      type="default"
                      size="small"
                      @click="closeRelay(item)"
                    >
                      {{ $t('cloudpivot.formComment.pc.cancel') }}
                    </a-button>
                    <a-button
                      :disabled="!filterHtml(item.reComment).trim()"
                      type="primary"
                      size="small"
                      @click="replay(item)"
                    >
                      {{ $t('cloudpivot.formComment.pc.send') }}
                    </a-button>
                  </div>
                </div>
                <div v-if="item.replys && item.replys.length" class="replay">
                  <div
                    v-for="(replayItem, replayIndex) in item.replys"
                    :key="replayIndex"
                    class="comment-item comment-item-replay"
                  >
                    <div class="comment-item-left">
                      <div class="avatar">
                        <img
                          v-if="
                            replayItem.imgUrl &&
                            replayItem.imgUrl.includes('http')
                          "
                          :src="replayItem.imgUrl"
                        />
                        <img
                          v-else-if="replayItem.imgUrl"
                          :src="getDownloadUrlNew(replayItem.imgUrl)"
                        />
                        <i
                          v-else
                          class="icon aufontAll h-icon-all-normal_smile default-avatar"
                        ></i>
                      </div>
                    </div>
                    <div class="comment-item-right">
                      <div class="username">
                        {{ replayItem.commentatorName }}
                        <span class="replay-txt">{{
                          $t('cloudpivot.formComment.pc.reply')
                        }}</span>
                        {{ replayItem.replyUserName }}:
                      </div>
                      <div
                        class="rich-text"
                        :class="replayItem.collspaned ? 'fade' : ''"
                      >
                        <span
                          :id="`cc-${replayItem.id}`"
                          class="text-box"
                          v-html="replayItem.text"
                        ></span>
                        <span
                          v-if="replayItem.isShowColspan"
                          class="collspan"
                          :class="replayItem.collspaned ? '' : 'static'"
                          @click="
                            replayItem.collspaned = !replayItem.collspaned
                          "
                          >{{
                            replayItem.collspaned
                              ? $t('cloudpivot.formComment.pc.expand')
                              : $t('cloudpivot.formComment.pc.collapse')
                          }}</span>
                      </div>
                      <!-- <div class="attechment">附件</div> -->
                      <div class="date-box">
                        <span class="date">{{ replayItem.createdTime }}</span>
                        <span
                          v-if="replayItem.commentator === userInfo.id"
                          class="del-comment-btn"
                        >
                          <a-popconfirm
                            :title="
                              $t('cloudpivot.formComment.pc.sureDeleteComment')
                            "
                            :okText="$t('cloudpivot.formComment.pc.sure')"
                            :cancelText="$t('cloudpivot.formComment.pc.cancel')"
                            arrowPointAtCenter
                            :placement="'topRight'"
                            :getPopupContainer="
                              (triggerNode) => {
                                return triggerNode.parentNode;
                              }
                            "
                            @confirm="handleDeleteComm(replayItem.id)"
                          >
                            <span
                              class="icon aufontAll"
                              :title="$t('cloudpivot.formComment.pc.delete')"
                              >&#xecf5;</span>
                          </a-popconfirm>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="item.replys.length < item.replyCount"
                    class="more-reply"
                    @click="moreReply(item)"
                  >
                    {{
                      $t('cloudpivot.formComment.pc.moreReplys', {
                        size: item.replyCount,
                      })
                    }}
                    <div class="reply-icon">
                      <span class="icon aufontAll open">&#xe7ee;</span>
                    </div>
                  </div>
                  <div
                    v-else-if="item.replys.length > 2"
                    class="reply-loaded"
                    @click="packUpReply(item)"
                  >
                    {{ $t('cloudpivot.formComment.pc.replyLoaded') }}
                    <div class="reply-icon">
                      <span class="icon aufontAll close">&#xe7ed;</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-show="isShowLoading" class="loading-icon-wrap">
              <a-icon class="loading-icon" type="loading" />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="input-main-area">
      <div
        :class="{
          'text-box': true,
          'text-box-focus': isAtwhoViewFocus,
        }"
      >
        <div class="textarea-box">
          <!-- <fakeTextarea v-model="comment" :max="2000" :isShowLimit="false" /> -->

          <at
            ref="atPane"
            v-model="comment"
            :members="members"
            :maxlength="450"
            nameKey="name"
            class="comment-atwho"
            @touchBottom="onTouchBottom"
            @selectUser="onSelectUser"
          >
            <div
              slot="embeddedItem"
              ref="atwhoEditWrap"
              tabindex="0"
              :placeholder="$t('cloudpivot.formComment.pc.member')"
              class="atwho-edit-wrap dp-font34 editWrap"
              :class="
                fileLists.length || isAtwhoViewFocus || len || isChoosingFiles
                  ? 'atwho-edit-wrap-focus'
                  : ''
              "
              contenteditable="true"
              @blur="onAtwhoViewBlur"
              @input="handleInput"
              @mousedown="setDurationStart"
              @mouseup="setDurationEnd"
              @click="focustextarea"
            ></div>
          </at>
          <div
            v-show="
              fileLists.length || isAtwhoViewFocus || len || isChoosingFiles
            "
            class="textarea-box-bottom"
          >
            <span>{{ len > 450 ? 450 : len }}/450</span>
          </div>
        </div>
        <div v-show="fileLists.length" class="attachment-box">
          <ul>
            <li
              v-for="(item, index) in fileLists"
              :key="index"
              class="file-preview"
              :class="!showImgThumb(item) ? 'file-preview-icon' : ''"
            >
              <div class="file-preview-body">
                <template v-if="showImgThumb(item)" style="text-align: center">
                  <img :src="getDownloadUrlPc(item)" />
                </template>
                <template v-else>
                  <img v-if="!getIconType(item)" :src="loadingGif" />
                  <!-- <i
                                        v-else
                                        class="icon aufontAll at-type"
                                        :class="getIconType(item)"
                                        ></i> -->
                  <svg v-else class="icon at-type" aria-hidden="true">
                    <use :xlink:href="getIconType(item)" />
                  </svg>
                </template>
                <i
                  class="icon aufontAll h-icon-all-close-circle close"
                  @click="deleteFile(index)"
                ></i>
              </div>
              <div class="file-preview-name" :title="item.name">
                {{ item.name }}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div
        v-show="fileLists.length || isAtwhoViewFocus || len || isChoosingFiles"
        class="input-area-bottom"
      >
        <div style="width: 100%"></div>
        <a-tooltip
          :title="$t('cloudpivot.formComment.pc.uploadButtonTips')"
          arrowPointAtCenter
          placement="topRight"
        >
          <div class="upload-area" @click="choosingFile">
            <a-upload
              :id="'file-upload'"
              name="file"
              :multiple="true"
              :fileList="fileList"
              :action="uploadUrl"
              :accept="accept"
              :headers="headers"
              :beforeUpload="beforeUpload"
              :showUploadList="false"
              @change="handleChange"
            >
              <i class="icon aufontAll h-icon-all-paperclip-o"></i>
            </a-upload>
          </div>
        </a-tooltip>
        <!-- <span>{{ $t('cloudpivot.formComment.pc.uploadButtonTips') }}</span> -->
        <a-button
          :type="'primary'"
          :disabled="
            (!filterHtml(comment).trim() && fileLists.length <= 0) ||
            fileNotAllUploaded
          "
          size="small"
          class="main-send"
          @click="send('', 'comment')"
        >
          {{ $t('cloudpivot.formComment.pc.send') }}
        </a-button>
      </div>
    </div>
    <img-preview
      v-if="isShowPreview"
      :imgList="[{ url: presrc }]"
      @close="isShowPreview = false"
    />
  </div>
</template>

<script lang="ts" src="./pc-comment.ts"></script>
<style lang="less" scoped>
/deep/ .ant-popover-message > .anticon {
  top: 20px;
  left: 16px;
}

/deep/.ant-popover-message {
  padding: 16px 35px 13px 16px;
}

/deep/.ant-popover-buttons {
  padding-bottom: 20px;
  padding-right: 16px;
  margin-bottom: 0px;
}
</style>

<style lang="less">
@import '../icon-color.less';

@import './../../../../common/common';
@import './../../../../application/src/components/pc/style/custom-themes';
.pc-form-comment {
  height: 100%;
  overflow: visible;
  display: flex;
  flex-flow: column;
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
  & > .comment-panel {
    height: 100%;
    overflow-y: scroll;
    padding-right: 11px;
    margin-bottom: 5px;
    & > .comment {
      // height: calc( 100% - 205px);
      // overflow: auto;
      .no-comment {
        text-align: center;
        position: relative;
        top: 20vh;
        font-size: 14px;
        color: rgba(1, 1, 1, 0.45);
      }
      .comment-item {
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        padding: 12px;
        & + .comment-item {
          margin-top: 16px;
        }
        &-replay {
          padding-left: 0;
          padding-top: 0;
          padding-bottom: 0px;
          padding-right: 0;
          margin-top: 24px !important;
        }
        &-left {
          margin-right: 12px;
          .avatar {
            width: 32px;
            height: 32px;
            & > img {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              object-fit: cover;
            }
            & > i.default-avatar {
              font-size: 32px;
              line-height: 32px;
              color: #36cfc9;
            }
          }
        }
        &-right {
          flex-grow: 1;
          width: calc(100% - 44px);
          // padding-right: 8px;
          .username {
            margin-top: 5px;
            font-size: 14px;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 600;
            color: #111218;
            line-height: 22px;
            .fr {
              float: right;
              color: rgba(0, 0, 0, 0.65);
              font-size: 14px;
              font-weight: 400;
              cursor: pointer;
              &:hover {
                color: @primary-color;
              }
            }
            & > .replay-txt {
              color: rgba(17, 18, 24, 0.25);
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              margin: 0 8px;
              font-weight: normal;
              line-height: 22px;
              height: 22px;
              width: 28px;
            }
          }
          .rich-text {
            position: relative;
            word-break: break-all;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #111218;
            line-height: 22px;
            margin-top: 8px;
            .text-box {
              & > span[data-at-embedded] {
                color: #107fff;
              }
            }
            .collspan {
              font-size: 12px;
              font-weight: 400;
              color: rgba(17, 18, 24, 0.5);
              line-height: 17px;
              text-align: right;
              position: absolute;
              bottom: 2px;
              right: 0;
              width: 25%;
              background: linear-gradient(
                to right,
                rgba(255, 255, 255, 0),
                white 45%
              );
              user-select: none;
              cursor: pointer;
              white-space: nowrap;
              &.static {
                position: relative;
                bottom: unset;
                left: 2px;
              }
              &:hover {
                color: #2970ff;
              }
            }
          }
          .date-box {
            display: flex;
            align-items: center;
            margin-top: 4px;
            .date {
              font-size: 12px;
              color: rgba(17, 18, 24, 0.5);
              margin-right: 16px;
              height: 20px;
              line-height: 20px;
            }
            .replay-btn,
            .del-comment-btn {
              cursor: pointer;
              user-select: none;
              font-size: 12px;
              width: 14px;
              height: 14px;
              line-height: 14px;
              color: rgba(17, 18, 24, 0.25);
              margin-right: 5px;
              &:hover {
                color: @highlightColor;
              }
              .ant-popover-arrow {
                visibility: unset;
              }
            }
          }
        }
      }
    }
  }
  & > .input-main-area {
    box-shadow: 0px -1px 0px 0px #dddddd;
    padding: 24px 0 8px 0;
    margin-right: 17px;
    & > .text-box {
      width: 100%;
      background: #ffffff;
      border-radius: 4px;
      &-focus {
        box-shadow: 0px 0px 0px 2px rgba(41, 112, 255, 0.2);
        border: 1px solid #2970ff;
      }
      // height: 40px;
      // &:focus{
      //     height: unset;
      // }
      & > .textarea-box {
        padding: 5px 12px;
        & > .textarea-box-bottom {
          text-align: right;
          height: 20px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(17, 18, 24, 0.25);
          line-height: 20px;
        }
        /deep/.atwho-wrap .atwho-view {
          max-height: 110px !important;
        }
      }
      .attachment-box {
        box-shadow: 0px -1px 0px 0px #dddddd;
      }
    }
    & > .input-area-bottom {
      display: flex;
      padding-top: 8px;
      align-items: center;
      & > .upload-area {
        margin-right: 8px;
        padding: 0 4px;
        width: 24px;
        height: 24px;
        border-radius: 2px;
        cursor: pointer;
        text-align: center;
        &:hover {
          background: rgba(0, 30, 116, 0.06);
        }
        .icon:hover {
          color: @primary-color;
        }
      }
      .main-send {
        min-width: unset;
      }
    }
  }
  .replay {
    margin-top: 16px;
    .comment-item {
      margin-bottom: 12px !important;
      margin-right: 0 !important;
    }
    .more-reply {
      display: flex;
      align-items: center;
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #2970ff;
      line-height: 20px;
      cursor: pointer;
      padding-left: 44px;
    }
    .reply-loaded {
      display: flex;
      align-items: center;
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #2970ff;
      line-height: 20px;
      cursor: pointer;
      padding-left: 44px;
    }
    .reply-icon {
      margin-left: 3px;
      .open,
      .close {
        font-size: 12px;
      }
    }
  }
  .fade {
    max-height: 44px;
    overflow: hidden;
  }
  .replay-box {
    margin-top: 8px;
    border-radius: 4px;
    .replay-textarea {
      height: 100px;
      border-radius: 4px;
      border: 1px solid #d4d5d6;
      padding: 6px;
      .len-limit {
        text-align: right;
        height: 20px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(17, 18, 24, 0.25);
        line-height: 20px;
      }
      &-focus {
        box-shadow: 0px 0px 0px 2px rgba(41, 112, 255, 0.2);
        border: 1px solid #2970ff;
      }
    }
    .buttons {
      margin-top: 6px;
      text-align: right;
      & > .cancel {
        margin-right: 8px;
      }
      & > .ant-btn {
        min-width: unset;
      }
    }
    & > .len-limit {
      text-align: right;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.25);
    }
  }
  .attachment-box {
    padding: 20px 12px;
    width: 100%;
    overflow-x: auto;
    ul {
      margin: 0;
      display: flex;
      li + li {
        margin-left: 13px;
      }
    }
    li.file-preview {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 3px;
      display: inline-block;
      vertical-align: top;
      text-align: center;
      img {
        width: 48px;
        height: 48px;
        border: 1px solid rgba(217, 217, 217, 1);
      }
      .close {
        font-size: 16px;
        height: unset;
        position: absolute;
        top: -11px;
        right: -11px;
        color: @highlightColor;
        cursor: pointer;
        line-height: 22px;
        width: 22px;
      }
      & > i.at-type {
        display: block;
        width: 100%;
        text-align: center;
        line-height: 48px;
        font-size: 32px;
      }
      & .at-type {
        width: 48px;
        height: 48px;
      }
      &.file-preview-icon {
        border: none;
        & i.at-type {
          font-size: 48px !important;
        }
      }
      & > .file-preview-body {
        display: inline-block;
        position: relative;
        width: 48px;
        height: 48px;
        line-height: 48px;
        padding: 0;
        margin-bottom: 4px;
      }
      & > .file-preview-name {
        max-width: 82px;
        height: 20px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(17, 18, 24, 0.5);
        line-height: 20px;
        overflow: hidden;
        cursor: pointer;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      & > .op-mask {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.45);
        width: 100%;
        height: 100%;
        border-radius: 3px;
        & > .op-actions {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          & > i {
            font-size: 12px;
            color: white;
            cursor: pointer;
            user-select: none;
            &.preview-icon {
              margin-right: 8px;
            }
          }
        }
      }

      &:hover {
        & > .op-mask {
          display: block;
        }
      }
    }
    &.preview {
      margin-top: 8px;
      margin-bottom: 0;
      padding: 0;
      overflow: hidden;
      ul {
        margin: 0;
        display: inline-block;
        li {
          margin-right: 12px;
          margin-left: revert;
          margin-bottom: 12px;
        }
      }
      & + .date-box.has-replay {
        margin-top: 0;
      }
    }
  }
  .atwho-edit-wrap {
    height: 22px;
    overflow-y: auto;
    overflow-x: hidden;
    outline: none;
    color: rgba(0, 0, 0, 0.85);
    -webkit-user-modify: read-write-plaintext-only;
    word-break: break-all;
    span {
      color: #107fff;
    }
    &:empty:before {
      content: attr(placeholder);
      color: rgba(0, 0, 0, 0.25);
    }
    &:focus {
      content: none;
    }
    &-focus {
      height: 66px;
    }
  }
}

.pre-img {
  width: 100%;
  margin-top: 24px;
}

.re-textarea {
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
  font-size: 14px;
}

.loading-icon-wrap {
  text-align: center;
  .loading-icon {
    font-size: 22px;
  }
}
</style>
<style lang="less" scoped>
.input-main-area {
  .comment-atwho.atwho-wrap /deep/.atwho-view {
    max-height: 110px !important;
  }
}
.del-comment-btn {
  /deep/.ant-popover-arrow {
    visibility: hidden !important;
  }
  /deep/.ant-btn {
    min-width: unset;
  }
}
</style>

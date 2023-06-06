<template>
  <div class="mb-form-comment">
    <template>
      <div v-if="isShowCommentPanel" class="form-comment-panel">
        <div class="text-box">
          <at
            ref="comment"
            v-model="comment"
            class="comment-wrap"
            :members="members"
            :maxlength="maxlength"
            :embeddedItemTemplate="embeddedItemTemplate"
            nameKey="name"
            @inputAt="inputAt"
          >
            <div
              ref="atwhoEditWrap"
              :placeholder="$t('cloudpivot.formComment.mobile.pleaseInput')"
              class="needsclick atwho-edit-wrap dp-font34"
              contenteditable
              @click="doFocus"
            ></div>
          </at>

          <!-- <at
            ref="atPane"
            v-model="comment"
            :members="members"
            :maxlength="maxlength"
            nameKey="name"
            @touchBottom="onTouchBottom"
            @selectUser="onSelectUser"
            :isShowMax="true"
          >
            <div
              slot="embeddedItem"
              ref="atwhoEditWrap"
              tabindex="0"
              placeholder="请输入"
              class="atwho-edit-wrap dp-font34"
              contenteditable="true"
              @blur="onAtwhoViewBlur"
              @input="handleInput"
            ></div>
          </at> -->
          <p class="word-len">
            <span>{{ atWordsCount > 2000 ? 2000 : atWordsCount }}</span>/2000
          </p>
        </div>

        <h3-upload
          listType="file"
          :autoPreview="true"
          :continuity="false"
          :action="uploadUrl"
          :placehloder="$t('cloudpivot.form.renderer.clickUpload')"
          :title="$t('cloudpivot.formComment.mobile.file')"
          :multiple="true"
          :beforeUpload="beforeUploadMobile"
          :compress="false"
          :compressionRatio="1"
          :remove="onRemovedImg"
          :maxSize="singleFileSize"
          :headers="headers"
          :onChange="onChange"
          :showErrorToast="false"
          :locale="locale"
          class="upload-ss"
          @uploadError="uploadError"
          @preview="handlePreview"
        />

        <div class="submit-btn" @click="send('', 'comment')">
          {{ $t('cloudpivot.formComment.mobile.send') }}
        </div>
      </div>

      <div class="comment">
        <h3-scroll
          ref="scroll"
          :loadMore="loadMoreS"
          :pageSize="15"
          wrapId="comment-list"
          :noMoreMessage="$t('cloudpivot.formComment.mobile.loadAll')"
        >
          <div class="comment-list">
            <div
              v-for="(item, index) in commentList"
              :key="index"
              class="comment-item"
            >
              <div class="comment-item-left">
                <div class="avatar">
                  <img
                    v-if="item.imgUrl && item.imgUrl.indexOf('http') > -1"
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
                  <!-- <img :src="item.imgUrl"> -->
                </div>
              </div>
              <div class="comment-item-right">
                <div class="username">
                  {{ item.commentatorName }}
                  <i
                    v-if="item.isShowDelBtn"
                    class="fr icon aufontAll h-icon-all-delete-o"
                    @click="deleteComm(item.id)"
                  ></i>
                </div>
                <div class="rich-text" :class="item.collspaned ? 'fade' : ''">
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
                        ? $t('cloudpivot.formComment.mobile.expand')
                        : $t('cloudpivot.formComment.mobile.collapse')
                    }}</span>
                </div>
                <div class="attachment-box preview">
                  <ul>
                    <li
                      v-for="(aitem, aindex) in item.attachmentModelList"
                      :key="aindex"
                      class="file-preview"
                      :class="!showImgThumb(item) ? 'file-preview-icon' : ''"
                      @click="preview(aitem)"
                    >
                      <template v-if="showImgThumb(aitem)">
                        <img :src="getDownloadUrl(aitem)" />
                      </template>
                      <template v-else>
                        <i
                          class="icon aufontAll at-type"
                          :class="getIconType(aitem)"
                        ></i>
                      </template>
                      <div class="attachment-info">
                        <span>{{ initFieName(aitem.name) }}</span>
                        <span>{{ conver(aitem.fileSize) }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="date-box has-replay">
                  <span class="date">{{ item.createdTime }}</span>
                  <span class="replay-btn" @click="onClickReply(item)">{{
                    $t('cloudpivot.formComment.mobile.reply')
                  }}</span>
                </div>
                <div v-if="item.replys && item.replys.length" class="replay">
                  <div
                    v-for="(replayItem, replayIndex) in item.replys"
                    :key="replayIndex"
                    class="comment-item"
                  >
                    <div class="comment-item-left">
                      <div class="avatar">
                        <img
                          v-if="
                            replayItem.imgUrl &&
                            replayItem.imgUrl.indexOf('http') > -1
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
                        <!-- <img :src="replayItem.imgUrl" /> -->
                      </div>
                    </div>
                    <div class="comment-item-right">
                      <div class="username">
                        {{ replayItem.commentatorName }}
                        <span class="replay-txt">{{
                          $t('cloudpivot.formComment.mobile.reply')
                        }}</span>
                        <i
                          v-if="replayItem.isShowDelBtn"
                          class="fr icon aufontAll h-icon-all-delete-o"
                          @click="deleteComm(replayItem.id)"
                        ></i>
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
                              ? $t('cloudpivot.formComment.mobile.expand')
                              : $t('cloudpivot.formComment.mobile.collapse')
                          }}</span>
                      </div>
                      <!-- <div class="attechment">附件</div> -->
                      <div class="date-box">
                        <span class="date">{{ replayItem.createdTime }}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="item.replys.length < item.replyCount"
                    class="more-reply"
                    @click="moreReply(item)"
                  >
                    {{
                      $t('cloudpivot.formComment.mobile.moreReplys', {
                        size: item.replySize,
                      })
                    }}
                  </div>
                  <div v-else class="reply-loaded">
                    {{ $t('cloudpivot.formComment.mobile.replyLoaded') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </h3-scroll>

        <div id="submitBtn" class="submit-btn" @click="showCommentPanel">
          {{ $t('cloudpivot.formComment.mobile.comment') }}
        </div>
      </div>
    </template>

    <div v-if="isShowReplayBox" class="replay-box" @click="closeRelay">
      <footer @click.stop>
        <!-- <at
          :ref="`atPane0`"
          v-model="replayComment"
          :members="members"
          :maxlength="maxlength"
          nameKey="name"
          @touchBottom="onTouchBottom(0)"
          @selectUser="onSelectUser"
        >
          <div
            slot="embeddedItem"
            :ref="`atwhoEditWrap0`"
            tabindex="0"
            :placeholder="`回复：${replayPlaceholder}`"
            class="atwho-edit-wrap dp-font34"
            contenteditable="true"
            @blur="onAtwhoViewBlur(0)"
            @input="handleInput(0)"
          ></div>
        </at> -->

        <at
          ref="replayComment"
          v-model="replayComment"
          class="comment-wrap"
          :members="members"
          :embeddedItemTemplate="embeddedItemTemplate"
          nameKey="name"
        >
          <div
            ref="replayAtwhoEditWrap"
            :placeholder="`回复：${replayPlaceholder}`"
            class="needsclick atwho-edit-wrap dp-font34"
            contenteditable
          ></div>
        </at>

        <p class="word-len">
          <span>{{
            atWordsCountReplay > 2000 ? 2000 : atWordsCountReplay
          }}</span>/2000
        </p>

        <div class="replay-submit" @click="replay">
          {{ $t('cloudpivot.formComment.mobile.send') }}
        </div>
      </footer>
    </div>

    <!-- 输入@选人 -->
    <user-picker
      class="at-modal"
      :visible="isShowUserPicker"
      :bizObjectId="bizObjectId"
      :schemaCode="schemaCode"
      :workflowInstanceId="workflowInstanceId"
      @ok="ok"
      @close="closeUP"
    />
  </div>
</template>

<script lang="ts" src="./mb-comment.ts"></script>

<style lang="less" scoped>
@import '../../../../common/styles/mixins.less';
@import '../icon-color.less';
@import './../../../../common/common';
.mb-form-comment {
  position: relative;
  height: 100%;
  width: 100%;
  background: #f7f8fc;
  .form-comment-panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;
    background: white;
    .text-box {
      .px2rem(padding-top, 20px);
      .px2rem(padding-bottom, 20px);
      .px2rem(padding-left, 30px);
      .px2rem(padding-right, 30px);
      background: white;
      span[data-at-embedded] {
        color: #107fff;
      }
    }
    .upload-ss {
      background: white;
      .px2rem(margin-top, 20px);
      /deep/.h3-upload-list-file-item-progress {
        background: rgba(41, 112, 255, 0.4) !important;
      }
      /deep/.h3-upload-title-uploader {
        left: 0;
      }
    }
  }

  /deep/.atwho-edit-wrap {
    text-align: left;
    .px2rem(height, 236px);
    overflow-y: auto;
    overflow-x: hidden;
    color: #333333;
    -webkit-user-modify: read-write-plaintext-only;
    background: white;
    word-break: keep-all;
    outline: none;
    & > span[data-at-embedded] {
      color: #2970ff;
    }
    &:empty:before {
      content: attr(placeholder);
      color: rgba(0, 0, 0, 0.25);
    }
    &:focus {
      content: none;
    }
  }

  /deep/.ant-upload-list {
    display: none;
  }

  .loading-mask {
    position: fixed;
    background: white;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 10000;
  }

  .comment {
    display: flex;
    flex-direction: column;
    &-item {
      display: flex;
      .px2rem(padding, 30px);
      background: white;
      .px2rem(margin-bottom, 20px);
      overflow: hidden;
      &-left {
        div.avatar {
          .px2rem(width, 80px);
          .px2rem(height, 80px);
          & > img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
          }
          & > i.default-avatar {
            .px2rem(width, 80px);
            .px2rem(height, 80px);
            .px2rem(line-height, 80px);
            .px2rem(font-size, 80px);
            color: #36cfc9;
          }
        }
      }
      &-right {
        text-align: left;
        flex-grow: 1;
        width: calc(100% - 80px);
        .px2rem(margin-left, 30px);
        & > .username {
          color: #333333;
          .px2rem(font-size, 32px);
          font-weight: bold;
          .px2rem(margin-bottom, 20px);
          & > .replay-txt {
            color: #999999;
            .px2rem(font-size, 26px);
            .px2rem(margin-left, 8px);
            font-weight: normal;
          }
        }
        .fr {
          float: right;
          color: #999999;
          font-weight: normal;
        }
        & > .date-box {
          .px2rem(margin-top, 20px);
        }
        .replay {
          .px2rem(margin-top, 20px);
          .comment-item {
            padding-bottom: 0;
            padding-right: 0;
            border-top: 1px solid #eeeeee;
          }
          .more-reply {
            .px2rem(height, 72px);
            .px2rem(line-height, 72px);
            background: #eceff2;
            .px2rem(padding-left, 24px);
            .px2rem(font-size, 28px);
            color: @primary-color;
          }
          .reply-loaded {
            .px2rem(height, 72px);
            .px2rem(line-height, 72px);
            background: #eceff2;
            .px2rem(padding-left, 24px);
            .px2rem(font-size, 28px);
            color: #999999;
          }
        }
        /deep/.rich-text {
          color: #333333;
          .px2rem(font-size, 30px);
          position: relative;
          word-break: break-all;
          .text-box {
            & > span[data-at-embedded] {
              color: #107fff;
            }
          }
          .collspan {
            text-align: right;
            position: absolute;
            bottom: -1px;
            right: 0;
            width: 25%;
            background: linear-gradient(
              to right,
              rgba(255, 255, 255, 0),
              #fff 45%
            );
            color: #2970ff;
            user-select: none;
            cursor: pointer;
            &.static {
              position: relative;
              bottom: unset;
              left: 2px;
            }
          }
        }
      }
    }
  }

  .attachment-box.preview {
    .px2rem(margin-top, 20px);
    .file-preview {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .px2rem(margin-bottom, 20px);
      & > img {
        .px2rem(width, 80px);
        .px2rem(height, 80px);
        .px2rem(border-radius, 6px);
        .px2rem(margin-right, 16px);
      }
      & > i.at-type {
        display: block;
        .px2rem(width, 80px);
        .px2rem(height, 80px);
        .px2rem(line-height, 80px);
        .px2rem(font-size, 32px);
        text-align: center;
      }
      &.file-preview-icon > i.at-type {
        .px2rem(font-size, 80px);
      }
      .attachment-info {
        flex-grow: 1;
        max-width: calc(100% - 1.28rem);
        & > span {
          display: block;
          .px2rem(line-height, 36px);
          .px2rem(font-size, 28px);
          width: 100%;
          max-width: 100%;
          &:first-of-type {
            color: #333333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          &:last-of-type {
            color: #999999;
          }
        }
      }
    }
  }

  .date-box {
    .date {
      .px2rem(font-size, 26px);
      color: #999999;
    }
  }

  .date-box.has-replay {
    .replay-btn {
      .px2rem(font-size, 26px);
      .px2rem(margin-left, 30px);
      color: #2970ff;
    }
  }

  // .comment-list {
  //   max-height: calc( 100vh - 44px );
  //   overflow-y: auto;
  // }

  .submit-btn {
    position: fixed;
    width: 100%;
    border-top: 1px solid #eee;
    .px2rem(height, 88px);
    .px2rem(font-size, 30px);
    .px2rem(line-height, 88px);
    bottom: 0;
    background: white;
    color: #2970ff;
    z-index: 99;
  }
}

.comment-wrap {
  white-space: pre-wrap;
}

.fade {
  max-height: 1.3rem;
  overflow: hidden;
}

.replay-box {
  position: fixed;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  top: 0;
  left: 0;
  z-index: 9999;
  footer {
    background: white;
    position: absolute;
    bottom: 0;
    width: 100%;
    .px2rem(padding-top, 50px);
    .px2rem(padding-right, 30px);
    .px2rem(padding-bottom, 50px);
    .px2rem(padding-left, 30px);
    .px2rem(border-top-left-radius, 24px);
    .px2rem(border-top-right-radius, 24px);

    .replay-submit {
      float: right;
      .px2rem(width, 112px);
      .px2rem(height, 60px);
      .px2rem(line-height, 60px);
      .px2rem(border-radius, 30px);
      background: rgba(41, 112, 255, 1);
      color: white;
    }
  }
  /deep/.atwho-view {
    max-height: 150px;
  }
}

.word-len {
  display: block;
  text-align: right;
  color: #999999;
  .px2rem(font-size, 24px);
  span {
    color: #666666;
  }
}

.at-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  z-index: 1000;
}

/deep/.mescroll {
  .px2rem(top, 0);
  .px2rem(bottom, 110px);
  height: auto;
}
</style>

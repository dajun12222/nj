<template>
  <div class="form-approval__instance">
    <template v-if="isCirculate">
      <div class="form-approval__progress">
        <div class="row" style="padding-bottom: 24px">
          <div class="form-approval__org" style="color: rgba(0, 0, 0, 0.45)">
            【{{
              $t('cloudpivot.flow.pc.approvalLog.circulateNum', {
                num: node.circulations.length,
              })
            }}】
          </div>
          <div class="form-approval__date">
            <a-popover
              v-model="visible"
              trigger="click"
              placement="right"
              overlayClassName="circulations"
            >
              <template slot="content">
                <div class="panel">
                  <div class="listItem">
                    <header>
                      {{
                        $t('cloudpivot.flow.pc.approvalLog.uncirculateNum', {
                          num: getCirculations(node.circulations, 10).length,
                        })
                      }}
                    </header>
                    <ul>
                      <li
                        v-for="(circulation, idx) in getCirculations(
                          node.circulations,
                          10,
                        )"
                        :key="idx"
                      >
                        <a-avatar
                          v-if="getImageUrl(circulation.approvaler)"
                          class="form-approval__avatar"
                          :size="38"
                          icon="user"
                          :src="getImageUrl(circulation.approvaler)"
                        />
                        <i
                          v-else
                          class="user_icon icon aufontAll h-icon-all-head-portrait"
                        ></i>
                        <div>
                          <div>{{ circulation.approvaler.name }}</div>
                          <div class="dept">
                            {{ circulation.dept }}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div class="listItem">
                    <header>
                      {{
                        $t('cloudpivot.flow.pc.approvalLog.circulatedNum', {
                          num: getCirculations(node.circulations, 11).length,
                        })
                      }}
                    </header>
                    <ul>
                      <li
                        v-for="(circulation, idx) in getCirculations(
                          node.circulations,
                          11,
                        )"
                        :key="idx"
                      >
                        <a-avatar
                          v-if="getImageUrl(circulation.approvaler)"
                          class="form-approval__avatar"
                          :size="38"
                          icon="user"
                          :src="getImageUrl(circulation.approvaler)"
                        />
                        <i
                          v-else
                          class="user_icon icon aufontAll h-icon-all-head-portrait"
                        ></i>
                        <div>
                          <div>{{ circulation.approvaler.name }}</div>
                          <div class="dept">
                            {{ circulation.dept }}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>
              <a>{{
                  $t('cloudpivot.flow.pc.approvalLog.circulatedNum', {
                    num: getCirculations(node.circulations, 11).length,
                  })
                }}、{{
                  $t('cloudpivot.flow.pc.approvalLog.uncirculateNum', {
                    num: getCirculations(node.circulations, 10).length,
                  })
                }}</a>
            </a-popover>
          </div>
        </div>
      </div>
    </template>
    <template
      v-else-if="
        subInstanceActivity ||
        (node.workItemStatus !== 1 && node.workItemStatus !== 2)
      "
    >
      <a-avatar
        v-if="getImageUrl(node.approvaler)"
        class="form-approval__avatar"
        :size="38"
        icon="user"
        :src="getImageUrl(node.approvaler)"
      />
      <i v-else class="user_icon icon aufontAll h-icon-all-head-portrait"></i>
      <div class="form-approval__content">
        <div class="row form-approval__info">
          <label class="form-approval__username">
            {{
              node.trustor && node.trustor.id
                ? `${node.approvaler.name}${$t('cloudpivot.flow.pc.trust', {
                    name: node.trustor.name,
                  })}`
                : node.approvaler.name
            }}
            <a-tooltip placement="top" overlayClassName="black-tooltip">
              <template slot="title">
                {{ node.fullDepartment || node.dept }}
              </template>
              <i class="icon aufontAll h-icon-all-Components_Warning"></i>
            </a-tooltip>
          </label>
          <span v-if="subInstanceActivity">{{
            getSubWorkflowActionStatus(node.subInstanceStatus)
          }}</span>
          <template v-else>
            <label
              v-if="![9, 17, 18, 19, 20].includes(node.workActionType)"
              :class="`workflow-action ${getWorkflowActionStatusColorClass(
                node.workActionType,
              )}`"
            >
              <span>{{ getWorkflowActionStatus(node.workActionType) }}</span>
            </label>
            <label
              v-if="node.from"
              class="workflow-action form-approval__coming"
            >
              <span>{{
                node.from.userInfo.name +
                $t('cloudpivot.flow.pc.Of') +
                getWorkflowActionStatus(node.from.fromType)
              }}</span>
            </label>
          </template>
        </div>
        <div class="row">
          <!-- <div class="form-approval__org">
            {{ node.dept }}
          </div> -->
          <!-- <div class="form-approval__date">{{ node.approvalTime||node.circulateTime }}</div> -->
        </div>
        <div
          v-if="node.circulations && node.circulations.length > 0"
          class="row"
        >
          <div class="form-approval__org" style="color: rgba(0, 0, 0, 0.45)">
            {{
              getWorkflowActionStatus(node.workActionType) === '传阅'
                ? $t('cloudpivot.flow.pc.approvalLog.circulateNum', {
                    num: node.circulations.length,
                  })
                : `${getWorkflowActionStatus(node.workActionType)}${
                    node.circulations.length
                  }人`
            }}
          </div>
          <div class="form-approval__date">
            <a-popover
              v-model="visible"
              trigger="click"
              placement="right"
              overlayClassName="circulations"
            >
              <template slot="content">
                <div class="panel">
                  <div class="listItem">
                    <header>
                      {{
                        $t('cloudpivot.flow.pc.approvalLog.uncirculateNum', {
                          num: getCirculations(node.circulations, 10).length,
                        })
                      }}
                    </header>
                    <ul>
                      <li
                        v-for="(circulation, idx) in getCirculations(
                          node.circulations,
                          10,
                        )"
                        :key="idx"
                      >
                        <a-avatar
                          v-if="getImageUrl(circulation.approvaler)"
                          class="form-approval__avatar"
                          :size="38"
                          icon="user"
                          :src="getImageUrl(circulation.approvaler)"
                        />
                        <i
                          v-else
                          class="user_icon icon aufontAll h-icon-all-head-portrait"
                        ></i>
                        <div>
                          <div>{{ circulation.approvaler.name }}</div>
                          <div class="dept">
                            {{ circulation.dept }}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div class="listItem">
                    <header>
                      {{
                        $t('cloudpivot.flow.pc.approvalLog.circulatedNum', {
                          num: getCirculations(node.circulations, 11).length,
                        })
                      }}
                    </header>
                    <ul>
                      <li
                        v-for="(circulation, idx) in getCirculations(
                          node.circulations,
                          11,
                        )"
                        :key="idx"
                      >
                        <a-avatar
                          v-if="getImageUrl(circulation.approvaler)"
                          class="form-approval__avatar"
                          :size="38"
                          icon="user"
                          :src="getImageUrl(circulation.approvaler)"
                        />
                        <i
                          v-else
                          class="user_icon icon aufontAll h-icon-all-head-portrait"
                        ></i>
                        <div>
                          <div>{{ circulation.approvaler.name }}</div>
                          <div class="dept">
                            {{ circulation.dept }}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>
              <a>{{
                  $t('cloudpivot.flow.pc.approvalLog.circulatedNum', {
                    num: getCirculations(node.circulations, 11).length,
                  })
                }}、{{
                  $t('cloudpivot.flow.pc.approvalLog.uncirculateNum', {
                    num: getCirculations(node.circulations, 10).length,
                  })
                }}</a>
            </a-popover>
          </div>
        </div>

        <template v-if="!subInstanceActivity">
          <div
            v-if="
              (node.bizComment && node.workItemId === 'ADMIN') ||
              (node.bizComment &&
                node.bizComment.type !== 0 &&
                node.bizComment.type !== 9)
            "
            class="row"
          >
            <div
              v-if="
                node.bizComment.type === 5 ||
                node.bizComment.type === 6 ||
                node.bizComment.type === 7
              "
              class="form-approval__text"
            >
              <span class="form-approval__participant">
                {{
                  getWorkflowActionStatus(node.bizComment.type) +
                  ' ' +
                  $t('cloudpivot.flow.pc.Give')
                }}
                <template v-if="node.bizComment.type === 7">{{
                  node.forwardReceiver
                }}</template>
                <template v-for="(user, userIdx) in node.bizComment.userInfos">
                  {{ user.name }}
                  <template
                    v-if="userIdx < node.bizComment.userInfos.length - 1"
                    >、</template>
                </template>
              </span>
              {{
                node.bizComment.content === '同意' ||
                node.bizComment.content === 'Agree'
                  ? $t('cloudpivot.flow.pc.WorkflowActionStatus.Agree')
                  : node.bizComment.content
              }}
            </div>

            <div
              v-else-if="node.bizComment.content"
              class="form-approval__text opinion"
            >
              <span class="form-approval__opinion">{{
                node.bizComment.title
              }}</span>
              {{
                node.bizComment.content === '同意' ||
                node.bizComment.content === 'Agree'
                  ? $t('cloudpivot.flow.pc.WorkflowActionStatus.Agree')
                  : node.bizComment.content
              }}
            </div>

            <div v-if="node.bizComment.resources" class="resources">
              <template v-for="resource in node.bizComment.resources">
                <div
                  v-if="resource.name !== 'signsture.png'"
                  :key="resource.id"
                  class="resources__item"
                >
                  <span
                    class="file_hover"
                    :title="resource.name"
                    @click="filePreview(resource)"
                    >{{ getReduceName(resource.name) }}</span>
                  <a-icon
                    type="cloud-download"
                    @click="download(resource.refId)"
                  />
                </div>
              </template>
            </div>

            <div
              v-if="node.resources && node.resources.length"
              class="form-approval__signsture clearfix"
            >
              <template v-for="(source, index) in node.resources">
                <div
                  v-if="source.img"
                  :key="index"
                  @mouseover="mouseListener(1, source)"
                  @mouseleave="mouseListener(0, source)"
                >
                  <img :src="source.img" @click.stop="previewImage(source)" />
                  <!-- <span
                          v-if="source.hover"
                          @click.stop="previewImage(source)"
                          class="icon aufontAll"
                  >&#xe726;</span>-->
                </div>
              </template>
            </div>
          </div>
        </template>

        <template v-else>
          <a
            v-if="!mockMode"
            class="form-approval__link"
            @click="goToFrom(node.workflowInstanceId, node.workItemId)"
            >{{ $t('cloudpivot.flow.pc.ViewDetails') }} >></a>
        </template>

        <!-- 修改拥有者 -->
        <template
          v-if="
            [17].includes(node.workActionType) && node.workItemId === 'ADMIN'
          "
        >
          <a-popover placement="top" overlayClassName="popover">
            <span class="node-type">
              <i class="icon aufontAll h-icon-all-wrench"></i>
              {{ $t('cloudpivot.flow.pc.approvalLog.turnover') }}
            </span>

            <template slot="title">
              <span>{{ getTitle(node.workActionType) }}</span>
            </template>
            <template slot="content">
              <div class="popover-list">
                <label>{{ $t('cloudpivot.flow.pc.approvalLog.newOwner') }}：</label>
                <div>
                  {{
                    node.bizComment &&
                    node.bizComment.userInfos &&
                    node.bizComment.userInfos.map((el) => el.name).join('、')
                  }}
                </div>
              </div>
              <div class="popover-list">
                <label>{{ $t('cloudpivot.list.pc.ownerDepartment') }}：</label>
                <div>
                  {{
                    node.bizComment &&
                    node.bizComment.userInfos &&
                    node.bizComment.userInfos
                      .map((el) => el.departmentName)
                      .join('、')
                  }}
                </div>
              </div>
              <div class="popover-list">
                <label>{{
                    $t('cloudpivot.flow.pc.approvalLog.handlingSuggestion')
                  }}：</label>
                <div
                  style="
                    max-height: 160px;
                    overflow: auto;
                    word-break: break-all;
                  "
                >
                  {{ node.bizComment && node.bizComment.content }}
                </div>
              </div>
              <div class="popover-list">
                <label>{{ $t('cloudpivot.flow.pc.approvalLog.operator') }}：</label>
                <div>{{ node.approvaler && node.approvaler.name }}</div>
              </div>
              <div class="popover-list">
                <label>{{ $t('cloudpivot.flow.pc.OperationTime') }}：</label>
                <div>{{ node.approvalTime }}</div>
              </div>
            </template>
          </a-popover>
        </template>

        <!-- 调整当前处理人 -->
        <template
          v-if="
            [19].includes(node.workActionType) && node.workItemId === 'ADMIN'
          "
        >
          <a-popover placement="top" overlayClassName="popover">
            <span class="node-type">
              <i class="icon aufontAll h-icon-all-wrench"></i>
              {{ $t('cloudpivot.flow.pc.approvalLog.turnover') }}
            </span>

            <template slot="title">
              <span>{{ getTitle(node.workActionType) }}</span>
            </template>
            <template slot="content">
              <div class="popover-list">
                <label>{{
                    $t('cloudpivot.flow.pc.approvalLog.newHandler')
                  }}：</label>
                <div>
                  {{
                    node.bizComment &&
                    node.bizComment.userInfos &&
                    node.bizComment.userInfos.map((el) => el.name).join('、')
                  }}
                </div>
              </div>
              <div class="popover-list">
                <label>{{
                    $t('cloudpivot.flow.pc.approvalLog.handlingSuggestion')
                  }}：</label>
                <div
                  style="
                    max-height: 160px;
                    overflow: auto;
                    word-break: break-all;
                  "
                >
                  {{ node.bizComment && node.bizComment.content }}
                </div>
              </div>
              <div class="popover-list">
                <label>{{ $t('cloudpivot.flow.pc.approvalLog.operator') }}：</label>
                <div>{{ node.approvaler && node.approvaler.name }}</div>
              </div>
              <div class="popover-list">
                <label>{{ $t('cloudpivot.flow.pc.OperationTime') }}：</label>
                <div>{{ node.approvalTime }}</div>
              </div>
            </template>
          </a-popover>
        </template>

        <!-- 结束/作废流程 -->
        <template
          v-if="
            [9, 2].includes(node.workActionType) && node.workItemId === 'ADMIN'
          "
        >
          <a-popover placement="top" overlayClassName="popover">
            <span class="node-type"><i class="icon aufontAll h-icon-all-wrench"></i>{{ $t('cloudpivot.flow.pc.approvalLog.workflowAdjust') }}</span>
            <template slot="title">
              <span>{{ getTitle(node.workActionType) }}</span>
            </template>
            <template slot="content">
              <div class="popover-list">
                <label>{{
                    $t('cloudpivot.flow.pc.approvalLog.handlingSuggestion')
                  }}：</label>
                <div
                  style="
                    max-height: 160px;
                    overflow: auto;
                    word-break: break-all;
                  "
                >
                  {{ node.bizComment && node.bizComment.content }}
                </div>
              </div>
              <div class="popover-list">
                <label>{{ $t('cloudpivot.flow.pc.approvalLog.operator') }}：</label>
                <div>{{ node.approvaler && node.approvaler.name }}</div>
              </div>
              <div class="popover-list">
                <label>{{ $t('cloudpivot.flow.pc.OperationTime') }}：</label>
                <div>{{ node.approvalTime }}</div>
              </div>
            </template>
          </a-popover>
        </template>

        <!-- 激活其他节点 -->
        <template
          v-if="
            [18].includes(node.workActionType) && node.workItemId === 'ADMIN'
          "
        >
          <a-popover placement="top" overlayClassName="popover">
            <span class="node-type"><i class="icon aufontAll h-icon-all-wrench"></i>{{ $t('cloudpivot.flow.pc.approvalLog.nodeAdjust') }}</span>
            <template slot="title">
              <span>{{ getTitle(node.workActionType) }}</span>
            </template>
            <template slot="content">
              <div v-if="node.workActionType === 18" class="popover-list">
                <label>{{ $t('cloudpivot.flow.pc.ChooseNode') }}：</label>
                <div>{{ node.bizComment && node.bizComment.activityName }}</div>
              </div>
              <div class="popover-list">
                <label>{{
                    $t('cloudpivot.flow.pc.approvalLog.handlingSuggestion')
                  }}：</label>
                <div
                  style="
                    max-height: 160px;
                    overflow: auto;
                    word-break: break-all;
                  "
                >
                  {{ node.bizComment && node.bizComment.content }}
                </div>
              </div>
              <div class="popover-list">
                <label>{{ $t('cloudpivot.flow.pc.approvalLog.operator') }}：</label>
                <div>{{ node.approvaler && node.approvaler.name }}</div>
              </div>
              <div class="popover-list">
                <label>{{ $t('cloudpivot.flow.pc.OperationTime') }}：</label>
                <div>{{ node.approvalTime }}</div>
              </div>
            </template>
          </a-popover>
        </template>

        <div class="form-approval__date">
          {{ node.approvalTime || node.circulateTime }}
        </div>
      </div>
    </template>

    <template v-else>
      <div
        v-if="node.approvaler && node.approvaler.length"
        class="form-approval__progress"
      >
        <label>{{ getWorkItemStatus(node.workItemStatus) }}</label>
        <div class="form-approval__progress-users aaa">
          <template v-for="(user, i) in node.approvaler">
            <span :key="i">{{
                user.trustor && user.trustor.id
                  ? `${user.name}${$t('cloudpivot.flow.pc.trust', {
                      name: user.trustor.name,
                    })}`
                  : user.name
              }}
              <span v-if="user.from && user.from.fromType === 5">[
                {{
                  getWorkflowActionStatus(5) === '加签'
                    ? $t(
                        'cloudpivot.flow.pc.approvalLog.whoseAdjustParticipant',
                        { who: user.from.userInfo.name },
                      )
                    : `${user.from.userInfo.name}的${getWorkflowActionStatus(
                        5,
                      )}`
                }}
                ]</span>
              <span v-if="user.from && user.from.fromType === 7">[
                {{
                  getWorkflowActionStatus(7) === '转办'
                    ? $t('cloudpivot.flow.pc.approvalLog.whoseTransfer', {
                        who: user.from.userInfo.name,
                      })
                    : `${user.from.userInfo.name}的${getWorkflowActionStatus(
                        7,
                      )}`
                }}
                ]</span>
            </span>
            <div
              v-if="user.circulations && user.circulations.length > 0"
              :key="'row' + i"
              class="row"
              style="margin-top: 8px"
            >
              <div
                class="form-approval__org"
                style="color: rgba(0, 0, 0, 0.45)"
              >
                {{
                  getWorkflowActionStatus(16) === '传阅'
                    ? $t('cloudpivot.flow.pc.approvalLog.circulateNum', {
                        num: user.circulations.length,
                      })
                    : `${getWorkflowActionStatus(node.workActionType)}${
                        user.circulations.length
                      }人`
                }}
              </div>
              <div class="form-approval__date">
                <a-popover
                  v-model="visible"
                  trigger="click"
                  placement="right"
                  overlayClassName="circulations"
                >
                  <template slot="content">
                    <div class="panel">
                      <div class="listItem">
                        <header>
                          {{
                            $t(
                              'cloudpivot.flow.pc.approvalLog.uncirculateNum',
                              {
                                num: getCirculations(user.circulations, 10)
                                  .length,
                              },
                            )
                          }}
                        </header>
                        <ul>
                          <li
                            v-for="(circulation, idx) in getCirculations(
                              user.circulations,
                              10,
                            )"
                            :key="idx"
                          >
                            <a-avatar
                              v-if="getImageUrl(circulation.approvaler)"
                              class="form-approval__avatar"
                              :size="38"
                              icon="user"
                              :src="getImageUrl(circulation.approvaler)"
                            />
                            <i
                              v-else
                              class="user_icon icon aufontAll h-icon-all-head-portrait"
                            ></i>
                            <div>
                              <div>{{ circulation.approvaler.name }}</div>
                              <div class="dept">
                                {{ circulation.dept }}
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div class="listItem">
                        <header>
                          {{
                            $t('cloudpivot.flow.pc.approvalLog.circulatedNum', {
                              num: getCirculations(user.circulations, 11)
                                .length,
                            })
                          }}
                        </header>
                        <ul>
                          <li
                            v-for="(circulation, idx) in getCirculations(
                              user.circulations,
                              11,
                            )"
                            :key="idx"
                          >
                            <a-avatar
                              v-if="getImageUrl(circulation.approvaler)"
                              class="form-approval__avatar"
                              :size="38"
                              icon="user"
                              :src="getImageUrl(circulation.approvaler)"
                            />
                            <i
                              v-else
                              class="user_icon icon aufontAll h-icon-all-head-portrait"
                            ></i>

                            <div>
                              <div>{{ circulation.approvaler.name }}</div>
                              <div class="dept">
                                {{ circulation.dept }}
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </template>
                  <a>{{
                      $t('cloudpivot.flow.pc.approvalLog.circulatedNum', {
                        num: getCirculations(user.circulations, 11).length,
                      })
                    }}、{{
                      $t('cloudpivot.flow.pc.approvalLog.uncirculateNum', {
                        num: getCirculations(user.circulations, 10).length,
                      })
                    }}</a>
                </a-popover>
              </div>
            </div>
            <template v-if="user.bizComment">
              <div
                :key="i"
                class="form-approval__text"
                style="margin-top: 14px"
              >
                <span class="form-approval__participant">{{ getWorkflowActionStatus(user.workActionType) }}给{{
                    user.bizComment.userInfos.map((el) => el.name).join(';')
                  }}</span>
                {{ user.bizComment && user.bizComment.content }}
              </div>
            </template>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { Avatar, Icon, Popover, Tooltip } from '@h3/antd-vue';

import { mixins } from 'vue-class-component';

import WorkflowMixin from '../mixins/workflow';
import { renderer } from '../../../../../form';
import getDownloadUrlNew from '../../../../../common/src/utils/getDownloadUrlNew';
import { utils } from '../../../../../common';

@Component({
  name: 'approval-item',
  components: {
    AAvatar: Avatar,
    AIcon: Icon,
    APopover: Popover,
    ATooltip: Tooltip,
  },
})
export default class ApprovalItem extends mixins(WorkflowMixin) {
  @Prop() node!: any;

  @Prop() isCirculate!: any; //是否是传阅节点

  @Prop() subInstanceActivity!: boolean;

  @Prop({ default: false }) mockMode?: any;

  visible = false;

  getCirculations(circulations, type) {
    return circulations.filter((item) => item.workActionType === type);
  }

  getTitle(workActionType) {
    const Obj = {
      2: '作废流程',
      9: '结束流程',
      18: '激活其他节点',
      20: '取消当前节点所有任务',
      17: '修改拥有者',
      19: '调整当前处理人',
    };
    return Obj[workActionType];
  }

  /**
   * 跳转到表单
   */
  goToFrom(workflowInstanceId: string, workItemId: string) {
    this.$router
      .push({
        name: 'form-detail',
        query: {
          workflowInstanceId,
          workitemId: workItemId,
          isWorkFlow: 'true',
          return: `${location.pathname + location.search}`,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }

  getImageUrl(user: any) {
    if (user.imgUrl && user.imgUrl.includes('http')) {
      return user.imgUrl;
    } else if (user.imgUrl) {
      return this.getDownloadUrlNew(user.imgUrl);
    } else {
      //Else Empty block statement
    }
    const userImg = require('./../image/user.png');
    return userImg || '';
  }

  /**
   * 下载附件
   */
  download(refId: string) {
    this.$emit('download', refId);
  }

  /**
   * 预览附件
   */
  previewImage(file: any) {
    this.$emit('previewImage', file);
  }

  /**
   * 附件的鼠标事件
   */
  mouseListener(type: number, file: any) {
    file.hover = Boolean(type);
  }

  /**
   * 附件预览
   */
  filePreview(file: any) {
    const url = renderer.UploadControl.service.getPreviewUrl(file);
    url && window.open(url);
  }

  /**
   * 获取截取后的名称
   */
  getReduceName(name) {
    return utils.hiddenStrMiddle(name, 12, 30);
  }
}
</script>
<style>
.circulations .ant-popover-inner-content {
  padding: 0px;
}
</style>
<style lang="less" scoped>
.user_icon {
  font-size: 38px;
  margin-right: 16px;
  color: #ffb131;
}

.file_hover {
  cursor: pointer;
}
.circulations {
  .panel {
    display: flex;
    .listItem {
      width: 200px;
      header {
        height: 50px;
        padding: 16px 16px 12px;
      }
      ul {
        height: 410px;
        overflow: auto;
        li {
          display: flex;
          padding: 0px 16px 14px;
          .dept {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.45);
          }
        }
      }
    }
    .listItem:first-child {
      border-right: 1px solid #e8e8e8;
    }
  }
}

/**
  新版样式
*/

.form-approval__info {
  display: flex;
  justify-content: space-between;
  .workflow-action {
    background-color: transparent;
    border-radius: 20px;
    color: rgba(17, 18, 24, 0.5);
    border: 1px solid rgba(17, 18, 24, 0.5);
  }
  .workflow-action span {
    color: rgba(17, 18, 24, 0.5);
    transform: none;
    font-size: 12px;
  }
  .workflow-action.gray {
    border: 1px solid rgba(17, 18, 24, 0.5);
    span {
      color: rgba(17, 18, 24, 0.5);
    }
  }

  .workflow-action.green {
    border: 1px solid #0dd1a2;
    span {
      color: #0dd1a2;
    }
  }

  .workflow-action.red {
    border: 1px solid #ff3640;
    span {
      color: #ff3640;
    }
  }
}

.form-approval__text.opinion {
  border-radius: 2px;
  border: 1px solid #eaeaea;
  padding: 8px 12px;
  width: 100%;
  margin-top: 14px;
  margin-bottom: 4px;
  background-color: #fff;
}

.form-approval__date.opinion {
  margin-left: 0;
}

.ant-collapse-header {
  border-bottom: none;
}

.popover-list {
  display: flex;
  padding: 6px 16px;
  // margin-bottom: 12px;
  label {
    text-align: left;
    display: inline-block;
    color: rgba(17, 18, 24, 0.5);
  }
  & > div {
    color: #111218;
    margin-left: 6px;
  }
}

.node-type {
  display: block;
  border-radius: 2px;
  border: 1px solid #eaeaea;
  background-color: #fff;
  line-height: 36px;
  padding: 0 14px;
  cursor: pointer;
}

.form-approval__username {
  display: flex;
  align-items: center;
  i {
    font-size: 14px;
    margin-left: 4px;
    color: rgba(17, 18, 24, 0.25);
  }
}
.form-approval__date {
  color: rgba(17, 18, 24, 0.5);
  font-size: 12px;
}
</style>

import common from '../../../../../../common/pc';
import { ReverseRelevanceControl } from '../../../../../../form/src/common/controls/reverse-relevance-control';
import { Component } from 'vue-property-decorator';
import ReverseRelevanceLink from './reverse-relevance-link.vue';
import ReverseRelevanceList from './reverse-relevance-list.vue';

@Component({
  name: 'reverse-relevance',
  components: {
    ReverseRelevanceList,
    ReverseRelevanceLink,
    H3Panel: common.components.Panel,
  },
})
export default class ReverseRelevance extends ReverseRelevanceControl {
  get tips() {
    return this.control.options.tips;
  }
}


import { ComponentAsset, ComponentInfo } from './../../../../designer-core'

import schema from './schema'

const component = () => import('./container.vue')

const info: ComponentInfo = {
    title: '容器',
    type: 'container',
    icon: 'file-text',
    group: 'basic',
    container: true
}

export default {
    info,
    schema,
    // settings,
    component

} as ComponentAsset
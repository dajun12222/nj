

import { ComponentSettings, PropertiesSettings } from './../../../../designer-core'

import { ComponentType } from './../../../property-panel'

const properties = {

    display: {
        backgroundSetter:{
            component:{
                type: ComponentType.BackgroundSetter
            }
        },
        borderSetter:{
            component:{
                type: ComponentType.BorderSetter
            }
        },
        fontStyle:{
            component:{
                type: ComponentType.FontStyle
            }
        }
    }

}

export default {

    /**
     * 属性设置
     */
    properties

} as ComponentSettings


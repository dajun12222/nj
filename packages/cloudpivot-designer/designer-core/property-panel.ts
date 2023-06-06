export * from './src/typings';

export * from './src/property-panel/register';

import * as factory from './src/property-panel/factory';
import * as factoryLast from './src/property-panel/factory-last';

import PropertyPanel from './src/property-panel/index.vue';

import PropertyComponent from './src/property-panel/property-component';

import ComponentItem from './src/component-panel/component-item';

import ComponentPanel from './src/component-panel/index.vue';

export {
  factory,
  factoryLast,
  PropertyPanel,
  PropertyComponent,
  ComponentItem,
  ComponentPanel,
};

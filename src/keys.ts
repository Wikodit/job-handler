import {BindingKey, CoreBindings} from '@loopback/core';
import {JobHandler} from './component';

/**
 * Binding keys used by this component.
 */
export namespace JobHandlerBindings {
  export const COMPONENT = BindingKey.create<JobHandler<string>>(
    `${CoreBindings.COMPONENTS}.JobHandler`,
  );
}

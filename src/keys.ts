import { BindingKey, CoreBindings } from '@loopback/core';
import type { JobHandler } from './component';

/**
 * Binding keys used by this component.
 */
export namespace JobHandlerBindings {
  export const COMPONENT = BindingKey.create<JobHandler<string>>(
    `${CoreBindings.COMPONENTS}.JobHandler`,
  );

  export const JOB_HANDLER_OBSERVER_GROUP = 'jobHandler'

  export const JOB_HANDLER_CONSUMER_BASE_PATH = 'jobHandler.consumers'

  export const generateConsumerPathFromName =
    (name: string, suffix?: string) => `${JOB_HANDLER_CONSUMER_BASE_PATH}.${name}${suffix ?? ''}`
}

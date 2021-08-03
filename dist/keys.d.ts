import { BindingKey } from '@loopback/core';
import type { JobHandler } from './component';
/**
 * Binding keys used by this component.
 */
export declare namespace JobHandlerBindings {
    const COMPONENT: BindingKey<JobHandler<string, string>>;
    const JOB_HANDLER_OBSERVER_GROUP = "jobHandler";
    const JOB_HANDLER_CONSUMER_BASE_PATH = "jobHandler.consumers";
    const generateConsumerPathFromName: (name: string, suffix?: string | undefined) => string;
}

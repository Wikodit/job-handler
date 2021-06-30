import { Application, Component } from '@loopback/core';
import { JobHandlerObserver } from './observers';
import { EnabledQueue, JobHandlerOptions } from './types';
export declare class JobHandler<QueueName extends string, EnabledQueueName extends QueueName = QueueName> implements Component {
    application: Application;
    private options;
    lifeCycleObservers: (typeof JobHandlerObserver)[];
    enabledQueues: Record<EnabledQueueName, EnabledQueue> | null;
    constructor(application: Application, options: JobHandlerOptions<QueueName>);
    get config(): JobHandlerOptions<QueueName>;
    getQueue(name: EnabledQueueName): EnabledQueue | null;
}

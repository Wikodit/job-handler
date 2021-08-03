import { Application, Component, LifeCycleObserver } from '@loopback/core';
import { EnabledQueue, JobHandlerOptions } from './types';
export declare class JobHandler<QueueName extends string, EnabledQueueName extends QueueName = QueueName> implements Component, LifeCycleObserver {
    application: Application;
    private options;
    enabledQueues: Record<EnabledQueueName, EnabledQueue> | null;
    constructor(application: Application, options: JobHandlerOptions<QueueName>);
    getQueue(name: EnabledQueueName): EnabledQueue | null;
    start(): Promise<void>;
    stop(): Promise<void>;
    initQueueSchedulers(): Promise<void>;
    initQueueWorkers(): Promise<void>;
    private getEnabledWorkerQueues;
    private instanciateWorker;
}

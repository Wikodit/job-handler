import { LifeCycleObserver } from '@loopback/core';
import { JobHandler } from '../component';
export declare class JobHandlerObserver<QueueName extends string, EnabledQueueName extends QueueName = QueueName> implements LifeCycleObserver {
    component: JobHandler<QueueName, EnabledQueueName>;
    constructor(component: JobHandler<QueueName, EnabledQueueName>);
    start(): Promise<void>;
    stop(): Promise<void>;
    initQueueSchedulers(): Promise<void>;
    initQueueWorkers(): Promise<void>;
    private getEnabledWorkerQueues;
    private instanciateWorker;
}
export default JobHandlerObserver;

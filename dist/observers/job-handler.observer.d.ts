import { LifeCycleObserver } from '@loopback/core';
import { JobHandler } from '../component';
export declare class JobHandlerObserver<QueueNames extends string> implements LifeCycleObserver {
    component: JobHandler<QueueNames>;
    constructor(component: JobHandler<QueueNames>);
    start(): Promise<void>;
    stop(): Promise<void>;
    initQueueSchedulers(): Promise<void>;
    initQueueWorkers(): Promise<void>;
    private getEnabledWorkerQueues;
    private instanciateWorker;
}
export default JobHandlerObserver;

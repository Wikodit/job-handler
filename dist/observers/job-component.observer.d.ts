import { LifeCycleObserver } from '@loopback/core';
import { JobComponent } from '../component';
export declare class JobComponentObserver<QueueNames extends string> implements LifeCycleObserver {
    component: JobComponent<QueueNames>;
    constructor(component: JobComponent<QueueNames>);
    start(): Promise<void>;
    stop(): Promise<void>;
    initQueueSchedulers(): Promise<void>;
    initQueueWorkers(): Promise<void>;
    private getEnabledWorkerQueue;
    private instanciateWorker;
}
export default JobComponentObserver;

import { Application, Component } from '@loopback/core';
import { Queue, QueueScheduler, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { JobHandlerObserver } from './observers';
import { JobHandlerOptions } from './types';
export declare class JobHandler<QueueName extends string> implements Component {
    application: Application;
    private options;
    lifeCycleObservers: (typeof JobHandlerObserver)[];
    queueSchedulers: QueueScheduler[];
    queues: Record<string, Queue>;
    workers: Worker[];
    sharedConnection: IORedis.Redis | null;
    constructor(application: Application, options: JobHandlerOptions<QueueName>);
    get config(): JobHandlerOptions<QueueName>;
    initSharedConnection(): Promise<void>;
    getQueue(name: QueueName): Queue;
}

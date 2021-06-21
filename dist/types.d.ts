import { Job, QueueOptions, QueueSchedulerOptions, WorkerOptions } from 'bullmq';
import { RedisOptions } from "ioredis";
/**
* Interface defining the Job handler's options object
*/
export interface JobHandlerOptions<QueueNames extends string> {
    redisConfig: RedisOptions;
    canConsume: boolean;
    canSchedule: boolean;
    enabledQueueNames: QueueNames[];
    queues: QueueConfig<QueueNames>[];
}
/**
* Default options for the Job handler
*/
export declare const SAMPLE_JOB_HANDLER_OPTIONS: JobHandlerOptions<'example'>;
export interface RepeatableJob {
    key: string;
    name: string;
    id: string;
    endDate: number;
    tz: string;
    cron: string;
    next: number;
}
export interface QueueConfig<QueueNames extends string> {
    name: QueueNames;
    schedulerOptions?: QueueSchedulerOptions;
    workerOptions?: WorkerOptions;
    queueOptions?: QueueOptions;
}
export interface Consumer {
    process(job: Job): Promise<any>;
}

import {Job, QueueOptions, QueueSchedulerOptions, WorkerOptions} from 'bullmq';
import {RedisOptions} from "ioredis";

/**
* Interface defining the Job handler's options object
*/
export interface JobHandlerOptions<QueueNames extends string> {
  redisConfig: RedisOptions,
  canConsume: boolean,
  canSchedule: boolean,
  enabledQueueNames: QueueNames[],
  queues: QueueConfig<QueueNames>[],
}

/**
* Default options for the Job handler
*/
export const SAMPLE_JOB_HANDLER_OPTIONS: JobHandlerOptions<'example'> = {
  redisConfig: {
    host: '127.0.0.1',
    port: 6379,
    password: '',
    db: 0,
  },
  canConsume: false,
  canSchedule: false,
  enabledQueueNames: ['example'],
  queues: [{name: 'example'}],
};

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process(job: Job): Promise<any>;
}

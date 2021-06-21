import {
  Job,
  Queue,
  QueueEvents,
  QueueEventsOptions,
  QueueOptions,
  QueueScheduler,
  QueueSchedulerOptions,
  Worker,
  WorkerOptions,
} from 'bullmq';
import {RedisOptions} from 'ioredis';

/**
 * Interface defining the Job handler's options object
 */
export interface JobHandlerOptions<
  QueueName extends string,
  EnabledQueueName extends QueueName = QueueName,
> {
  redisConfig: RedisOptions;
  canConsume: boolean;
  canSchedule: boolean;
  enabledQueueNames: EnabledQueueName[];
  queues: QueueConfig<QueueName>[];
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

export interface QueueConfig<QueueName extends string> {
  name: QueueName;
  schedulerOptions?: QueueSchedulerOptions;
  workerOptions?: WorkerOptions;
  queueOptions?: QueueOptions;
  eventsOptions?: QueueEventsOptions;
}

export interface Consumer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process(job: Job): Promise<any>;
}

export interface EnabledQueue {
  queue: Queue;
  events: QueueEvents;
  workers: Worker[];
  schedulers: QueueScheduler[];
}

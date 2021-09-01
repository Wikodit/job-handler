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
  /**
   * Configure Redis connection
   */
  redisConfig: RedisOptions;
  /**
   * Defines if this application can consume the jobs
   */
  canConsume: boolean;
  /**
   * Defines if this application can schedule the jobs
   */
  canSchedule: boolean;
  /**
   * Defines the enabled queues for this application
   * This list can be different from "queues" in order
   * to enable specifically some queues for an instance
   * ie: get "enabledQueueNames" from process.env
   */
  enabledQueueNames: EnabledQueueName[];
  /**
   * Defines the configuration for all queues
   */
  queues: QueueConfig<QueueName>[];
  /**
   * Defines a suffix for consumer to get them from the app
   * No default
   */
  suffixForConsumers?: string;
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
  suffixForConsumers: 'Consumer',
};

export interface QueueConfig<QueueName extends string> {
  /**
   * Name of the queue
   */
  name: QueueName;
  /**
   * Options for the scheduler of this queue
   * Read bullmq documentation for more information
   * Ignored when "canSchedule" is false
   */
  schedulerOptions?: QueueSchedulerOptions;
  /**
   * Options for the worker of this queue
   * Read bullmq documentation for more information
   * Ignored when "canConsume" is false
   */
  workerOptions?: WorkerOptions;
  /**
   * Options for this queue
   * Read bullmq documentation for more information
   */
  queueOptions?: QueueOptions;
  /**
   * Options for the queueEvent of this queue
   * Read bullmq documentation for more information
   */
  eventsOptions?: QueueEventsOptions;
}

/**
 * Basic interface for consumer
 * All consumers must extend it
 */
export interface Consumer {
  /**
   * This method handles your job
   * It must return what your job must return
   * If this method throws, your job is marked as failed
   * with the failedreason being your error message
   * @param job any job
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process(job: Job): Promise<any>;
}

/**
 * Enabled queue instance
 */
export interface EnabledQueue {
  queue: Queue;
  events: QueueEvents;
  workers: Worker[];
  schedulers: QueueScheduler[];
}

/**
 * Interface needed to enforce typing
 */
export interface EnabledQueueConfig<
  QueueName extends string,
  EnabledQueueName extends QueueName,
> extends QueueConfig<QueueName> {
  name: EnabledQueueName;
}

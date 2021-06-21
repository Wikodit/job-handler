import {
  Application, Component,
  config,
  ContextTags,
  CoreBindings,
  inject, injectable
} from '@loopback/core';
import {Queue, QueueScheduler, Worker} from 'bullmq';
import IORedis from 'ioredis';
import {JobHandlerBindings} from './keys';
import {JobHandlerObserver} from './observers';
import {JobHandlerOptions} from './types';

// Configure the binding for JobHandler
@injectable({tags: {[ContextTags.KEY]: JobHandlerBindings.COMPONENT}})
export class JobHandler<QueueName extends string> implements Component {
  lifeCycleObservers = [JobHandlerObserver];

  public queueSchedulers: QueueScheduler[] = [];
  public queues: Record<string, Queue> = {};
  public workers: Worker[] = [];
  public sharedConnection: IORedis.Redis | null = null;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public application: Application,
    @config()
    private options: JobHandlerOptions<QueueName>,
  ) { }

  get config(): JobHandlerOptions<QueueName> {
    return JSON.parse(JSON.stringify(this.options))
  }

  async initSharedConnection() {
    this.sharedConnection = new IORedis(this.options.redisConfig);
  }

  getQueue(name: QueueName): Queue {
    return this.queues[name];
  }
}

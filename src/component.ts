import {
  Application,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
  injectable,
} from '@loopback/core';
import IORedis from 'ioredis';
import {JobHandlerBindings} from './keys';
import {JobHandlerObserver} from './observers';
import {EnabledQueue, JobHandlerOptions} from './types';

// Configure the binding for JobHandler
@injectable({tags: {[ContextTags.KEY]: JobHandlerBindings.COMPONENT}})
export class JobHandler<
  QueueName extends string,
  EnabledQueueName extends QueueName = QueueName,
> implements Component
{
  lifeCycleObservers = [JobHandlerObserver];

  public enabledQueues: Record<EnabledQueueName, EnabledQueue> | null = null;
  public sharedConnection: IORedis.Redis | null = null;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public application: Application,
    @config()
    private options: JobHandlerOptions<QueueName>,
  ) {}

  get config(): JobHandlerOptions<QueueName> {
    return JSON.parse(JSON.stringify(this.options));
  }

  async initSharedConnection() {
    this.sharedConnection = new IORedis(this.options.redisConfig);
  }

  getQueue(name: EnabledQueueName): EnabledQueue | null {
    if (!this.enabledQueues) return null;
    return this.enabledQueues[name];
  }
}

import {
  Application,
  BindingScope,
  Component,
  config,
  ContextTags,
  CoreBindings,
  CoreTags,
  inject,
  injectable,
  LifeCycleObserver,
} from '@loopback/core';
import { JobHandlerBindings } from './keys';
import { Consumer, EnabledQueue, EnabledQueueConfig, JobHandlerOptions } from './types';
import {
  Queue,
  QueueEvents,
  QueueScheduler,
  Worker,
  WorkerOptions,
} from 'bullmq';

// Configure the binding for JobHandler
@injectable({
  tags: {
    [ContextTags.KEY]: JobHandlerBindings.COMPONENT,
    [CoreTags.LIFE_CYCLE_OBSERVER_GROUP]: JobHandlerBindings.JOB_HANDLER_OBSERVER_GROUP,
  },
  scope: BindingScope.SINGLETON,
})
export class JobHandler<
  QueueName extends string,
  EnabledQueueName extends QueueName = QueueName,
> implements Component, LifeCycleObserver
{
  public enabledQueues: Record<EnabledQueueName, EnabledQueue> | null = null;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public application: Application,
    @config()
    private options: JobHandlerOptions<QueueName>,
  ) {}

  getQueue(name: EnabledQueueName): EnabledQueue | null {
    if (!this.enabledQueues) return null;
    return this.enabledQueues[name];
  }

  async start() {
    this.enabledQueues = Object.fromEntries(
      this.getEnabledWorkerQueues().map(q => [
        q.name,
        {
          queue: new Queue(q.name, {
            connection: this.options.redisConfig,
            ...q.queueOptions,
          }),
          events: new QueueEvents(q.name, {
            connection: this.options.redisConfig,
            ...q.eventsOptions,
          }),
          workers: [],
          schedulers: [],
        },
      ]),
    ) as unknown as Record<EnabledQueueName, EnabledQueue>;

    if (this.options.canSchedule) {
      await this.initQueueSchedulers();
    }

    if (this.options.canConsume) {
      await this.initQueueWorkers();
    }
  }

  async stop() {
    if (!this.enabledQueues) return;
    if (this.options.canConsume) {
      const promises = [];
      for (const enabledQueueName in this.enabledQueues) {
        promises.push(
          ...this.enabledQueues[
            enabledQueueName as EnabledQueueName
          ].workers.map(w => w.close()),
        );
      }
      if (promises.length > 0) {
        await Promise.all(promises);
      }
    }
  }

  async initQueueSchedulers() {
    if (!this.enabledQueues) return;

    for (const enabledQueueName of Object.keys(this.enabledQueues)) {
      this.enabledQueues[
        enabledQueueName as EnabledQueueName
      ].schedulers.push(
        new QueueScheduler(enabledQueueName, {
          connection: this.options.redisConfig,
          ...(this.options.queues.find(
            q => q.name === enabledQueueName,
          )?.schedulerOptions ?? {}),
        }),
      );
    }
  }

  async initQueueWorkers() {
    if (!this.enabledQueues) return;

    for (const enabledQueueName of Object.keys(this.enabledQueues)) {
      this.enabledQueues[
        enabledQueueName as EnabledQueueName
      ].workers.push(
        await this.instanciateWorker(
          enabledQueueName as EnabledQueueName,
          this.options.queues.find(q => q.name === enabledQueueName)
            ?.workerOptions ?? {},
        ),
      );
    }
  }

  private getEnabledWorkerQueues(): EnabledQueueConfig<
    QueueName,
    EnabledQueueName
  >[] {
    const allQueues = this.options.queues;

    const workerNames = this.options.enabledQueueNames;
    return allQueues.filter(
      (queue): queue is EnabledQueueConfig<QueueName, EnabledQueueName> =>
        workerNames.includes(queue.name),
    );
  }

  private async instanciateWorker(
    name: EnabledQueueName,
    options: WorkerOptions,
  ) {
    const consumer: Consumer = await this.application.get(
      JobHandlerBindings.generateConsumerPathFromName(name, this.options.suffixForConsumers)
    );
    return new Worker(name, job => consumer.process(job), {
      connection: this.options.redisConfig,
      ...(options ?? {}),
    });
  }
}

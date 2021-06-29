import {inject, LifeCycleObserver, lifeCycleObserver} from '@loopback/core';
import {
  Queue,
  QueueEvents,
  QueueScheduler,
  Worker,
  WorkerOptions
} from 'bullmq';
import IORedis from 'ioredis';
import {JobHandler} from '../component';
import {JobHandlerBindings} from '../keys';
import {Consumer, EnabledQueue, QueueConfig} from '../types';

interface EnabledQueueConfig<
  QueueName extends string,
  EnabledQueueName extends QueueName,
  > extends QueueConfig<QueueName> {
  name: EnabledQueueName;
}

@lifeCycleObserver()
export class JobHandlerObserver<
  QueueName extends string,
  EnabledQueueName extends QueueName = QueueName,
  > implements LifeCycleObserver {
  constructor(
    @inject(JobHandlerBindings.COMPONENT)
    public component: JobHandler<QueueName, EnabledQueueName>,
  ) { }

  async start() {
    await this.component.initSharedConnection();
    if (!this.component.sharedConnection) return

    this.component.enabledQueues = Object.fromEntries(
      this.getEnabledWorkerQueues().map(q => [
        q.name,
        {
          queue: new Queue(q.name, {
            connection: this.component.sharedConnection!,
            ...q.queueOptions
          }),
          events: new QueueEvents(q.name, {
            connection: this.component.sharedConnection!,
            ...q.eventsOptions
          }),
          workers: [],
          schedulers: [],
        },
      ]),
    ) as unknown as Record<EnabledQueueName, EnabledQueue>;

    if (this.component.config.canSchedule) {
      await this.initQueueSchedulers();
    }

    if (this.component.config.canConsume) {
      await this.initQueueWorkers();
    }
  }

  async stop() {
    if (!this.component.enabledQueues) return;
    if (this.component.config.canConsume) {
      const promises = [];
      for (const enabledQueueName in this.component.enabledQueues) {
        promises.push(
          ...this.component.enabledQueues[
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
    if (!this.component.enabledQueues || !this.component.sharedConnection)
      return;

    for (const enabledQueueName of Object.keys(this.component.enabledQueues)) {
      this.component.enabledQueues[
        enabledQueueName as EnabledQueueName
      ].schedulers.push(
        new QueueScheduler(enabledQueueName, {
          connection: this.component.sharedConnection,
          ...(this.component.config.queues.find(
            q => q.name === enabledQueueName,
          )?.schedulerOptions ?? {}),
        }),
      );
    }
  }

  async initQueueWorkers() {
    if (!this.component.sharedConnection || !this.component.enabledQueues)
      return;

    for (const enabledQueueName of Object.keys(this.component.enabledQueues)) {
      this.component.enabledQueues[
        enabledQueueName as EnabledQueueName
      ].workers.push(
        await this.instanciateWorker(
          enabledQueueName as EnabledQueueName,
          this.component.config.queues.find(q => q.name === enabledQueueName)
            ?.workerOptions ?? {},
          this.component.sharedConnection,
        ),
      );
    }
  }

  private getEnabledWorkerQueues(): EnabledQueueConfig<
    QueueName,
    EnabledQueueName
  >[] {
    const allQueues = this.component.config.queues;

    const workerNames = this.component.config.enabledQueueNames;
    return allQueues.filter(
      (queue): queue is EnabledQueueConfig<QueueName, EnabledQueueName> =>
        workerNames.includes(queue.name),
    );
  }

  private async instanciateWorker(
    name: EnabledQueueName,
    options: WorkerOptions,
    sharedConnection: IORedis.Redis,
  ) {
    const consumer: Consumer = await this.component.application.get(
      `services.${name}Consumer`,
    );
    return new Worker(name, job => consumer.process(job), {
      connection: sharedConnection,
      ...(options ?? {}),
    });
  }
}

export default JobHandlerObserver;

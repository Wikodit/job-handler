import {inject, LifeCycleObserver, lifeCycleObserver} from '@loopback/core';
import {Queue, QueueScheduler, Worker} from 'bullmq';
import IORedis from 'ioredis';
import {JobHandler} from '../component';
import {JobHandlerBindings} from '../keys';
import {Consumer, QueueConfig} from '../types';


@lifeCycleObserver()
export class JobHandlerObserver<QueueNames extends string> implements LifeCycleObserver {
  constructor(
    @inject(JobHandlerBindings.COMPONENT)
    public component: JobHandler<QueueNames>,
  ) { }

  async start() {
    this.component.queues = Object.fromEntries(this.getEnabledWorkerQueues().map((q) => [q.name, new Queue(q.name)]))
    await this.component.initSharedConnection()
    if (this.component.config.canSchedule) {
      await this.initQueueSchedulers();
    }

    if (this.component.config.canConsume) {
      await this.initQueueWorkers();
    }
  }

  async stop() {
    if (this.component.config.canConsume) {
      await Promise.all(this.component.workers.map((worker) => worker.close()));
    }
  }

  async initQueueSchedulers() {
    const allQueues = this.component.config.queues;
    this.component.queueSchedulers.push(...allQueues.map((q) =>
      new QueueScheduler(
        q.name, {
        connection: this.component.config.redisConfig,
        ...(q.queueOptions ?? {}),
      }),
    ))
  }

  async initQueueWorkers() {
    if (!this.component.sharedConnection) return
    const enabledWorkerQueueNames = this.getEnabledWorkerQueues();

    const promises = this.component.config.queues
      .filter((queue) => !!enabledWorkerQueueNames
        .find(enabledQueue => enabledQueue.name === queue.name))
      .map((queue) =>
        this.instanciateWorker(queue, this.component.sharedConnection!),
      );

    this.component.workers.push(...(await Promise.all(promises)));
  }

  private getEnabledWorkerQueues() {
    const allQueues = this.component.config.queues;
    if (!this.component.config.enabledQueueNames.length) return allQueues;

    const workerNames = this.component.config.enabledQueueNames;

    return allQueues.filter((queue) =>
      workerNames.includes(queue.name),
    );
  }

  private async instanciateWorker(
    queue: QueueConfig<QueueNames>,
    sharedConnection: IORedis.Redis,
  ) {
    const consumer: Consumer = await this.component.application
      .get(`services.${queue.name}Consumer`);
    return new Worker(queue.name, (job) => consumer.process(job), {
      ...(queue.workerOptions ?? {}),
      connection: sharedConnection,
    });
  }
}

export default JobHandlerObserver;

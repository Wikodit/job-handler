# job-handler

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

This module is created to handle jobs in **Loopback 4** based on **[bullmq](https://github.com/taskforcesh/bullmq)**.

[![Redis](https://redis.io/images/redis-white.png)](https://redis.io/)
This component is designed to work with **Redis**. You MUST have a running Redis database in order for the application to start.

## Installation

Install JobHandler using `npm` or `yarn`

```sh
$ [npm install | yarn add] github:Wikodit/job-handler#main
```

## Basic Use

Configure and load JobHandler in the application constructor
as shown below.

```ts
import {JobHandler, JobHandlerOptions} from 'job-handler';
// ...
export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    const opts: JobHandlerOptions = {
      // your configuration
    };
    this.configure(JobHandlerBindings.COMPONENT).to(opts);
    this.component(JobHandler);
    // ...
  }
  // ...
}
```

For each of your queues, if your application can consume, you must define a consumer service (you can put the file anywhere, but we recommend `src/consumers` ; you can configure your application Service Booter to read this directory too). You have to bind your consumer with a specific name, like shown below:

```ts
import {ContextTags, injectable} from '@loopback/core';
import {Consumer, Job} from 'job-handler';
import {QueueName} from '../config/job-handler.config.ts';

/**
 * type your job as you want
 * be careful, this type cannot be verified and is serialized
 * by bullmq, you can refer to their documentation
 */
type GenerateReportJob = Job<{ids: string[]}, {link: string}>;

@injectable({
  tags: {
    [ContextTags.KEY]: JobHandlerBindings.generateConsumerPathFromName(
      QueueName.GenerateReport,
      'Consumer',
    ),
  },
})
export class GenerateReportConsumer implements Consumer {
  // you can inject anything as for any service in Loopback4
  constructor() {}

  async process(job: GenerateReportJob): Promise<{link: string}> {
    // handle your job
  }
}
```

Here is how to add a job in a queue:

```ts
import {inject} from '@loopback/context';
import {Job, JobHandler, JobHandlerBindings} from 'job-handler';

import {JobName, QueueName} from '../config/job-handler.config';

export enum JobErrorCode {
  UNKNOWN = 'UNKNOWN',
  CANNOT_GET_QUEUE = 'CANNOT_GET_QUEUE',
  CANNOT_GET_JOB = 'CANNOT_GET_JOB',
  CANNOT_GET_FINISHED_JOB = 'CANNOT_GET_FINISHED_JOB',
  ERROR_ON_JOB = 'ERROR_ON_JOB',
}

export class JobHandlerService {
  constructor(
    @inject(JobHandlerBindings.COMPONENT)
    private readonly jobHandler: JobHandler<QueueName>,
  ) {}

  public async createJobAndWaitUntilFinished<
    R,
    Params extends Record<string, unknown>,
  >(
    queueName: QueueName,
    jobName: JobName,
    params: Params,
    ttl = 10000,
  ): Promise<R> {
    const queue = this.jobHandler.getQueue(queueName);
    if (!queue) {
      throw new Error(JobErrorCode.CANNOT_GET_QUEUE);
    }
    const job = await queue.queue.add(jobName, params);
    if (!job.id) {
      throw new Error(JobErrorCode.CANNOT_GET_JOB);
    }

    /** throws when job fails */
    try {
      // wait TTL sec maximum
      await job.waitUntilFinished(queue.events, ttl);
      const finishedJob = (await Job.fromId(queue.queue, job.id)) as Job<
        Params,
        R
      >;
      if (!finishedJob) {
        throw new Error(JobErrorCode.CANNOT_GET_FINISHED_JOB);
      }
      return finishedJob.returnvalue;
    } catch (error) {
      throw new Error(JobErrorCode.ERROR_ON_JOB);
    }
  }
}

export default JobHandlerService;
```

_NB: note there is a JobName enum. This enum contains your job names. Multiple jobs with different names can be in the same queue if you need to queue these tasks. The name allows you to differentiate your jobs._

For more informations on jobs, you can read the bullmq documentation.

## Configuration

You can configure JobHandler by editing the options. First, you need to define an enum containing all of your queues name. You can then define your configuration options:

```ts
import {JobHandlerOptions} from 'job-handler';

export enum QueueName {
  GenerateReports = 'GenerateReports',
  SendReports = 'SendReports',
}

export const JOB_HANDLER_CONFIG: JobHandlerOptions<QueueName> = {
  redisConfig: {
    host: process.env.JOB_HANDLER_REDIS_HOST ?? '127.0.0.1',
    port: +(process.env.JOB_HANDLER_REDIS_PORT ?? 6379),
    password: process.env.JOB_HANDLER_REDIS_PASSWORD ?? '',
  },
  // be careful, this assumes that "JOB_HANDLER_CAN_CONSUME=false" is true
  canConsume: !!(process.env.canConsume ?? false),
  canSchedule: !!(process.env.canSchedule ?? false),
  queues: [
    {
      name: QueueName.GenerateReports,
      workerOptions: {
        concurrency: 1,
      },
    },
    {
      name: QueueName.SendReports,
      workerOptions: {
        concurrency: 2,
      },
    },
  ],
  enabledQueueNames: (process.env.JOB_HANDLER_ENABLED_QUEUE_NAMES ?? '').split(
    ';',
  ),
  suffixForConsumers: 'Consumer',
};
```
